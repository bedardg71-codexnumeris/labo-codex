/**
 * Couche d'abstraction unifiée pour le stockage de données
 * Architecture de cache hybride localStorage + IndexedDB
 *
 * FONCTIONNEMENT:
 * - localStorage = Store primaire de facto (synchrone, survit aux crashes)
 * - IndexedDB = Backup async (grandes capacités, fire-and-forget)
 * - Au démarrage : syncToLocalStorageCache() recopie IDB → localStorage
 *
 * DÉCISIONS ARCHITECTURALES (audit 26 mars 2026):
 * - setSync() écrit localStorage sync + IDB async sans await. Si crash
 *   avant completion IDB, localStorage a la valeur récente, IDB non.
 *   Au prochain démarrage, IDB peut écraser localStorage avec une valeur
 *   plus ancienne. Risque accepté : la fenêtre de vulnérabilité est courte.
 * - memoryCache (RAM) est utilisé quand localStorage atteint son quota.
 *   Si crash dans cet état, données perdues. Risque accepté : rare.
 * - Pas de flush beforeunload pour les écritures IDB pendantes.
 *   Risque accepté : localStorage est la source de vérité en pratique.
 *
 * MÉTHODES SYNCHRONES (getSync/setSync/removeSync):
 * - Lecture: depuis localStorage (cache chaud)
 * - Écriture: dans localStorage (synchrone) + IndexedDB (async en arrière-plan)
 * - Suppression: de localStorage (synchrone) + IndexedDB (async en arrière-plan)
 *
 * MÉTHODES ASYNCHRONES (get/set/remove):
 * - Accès direct à IndexedDB ou localStorage selon disponibilité
 * - Utilisées pour migration et synchronisation
 *
 * AVANTAGES:
 * - Accès synchrone rapide (pas de changement dans le code applicatif)
 * - Capacité de stockage étendue (IndexedDB > localStorage)
 * - Résilience (localStorage fonctionne toujours si IndexedDB échoue)
 * - Support multi-groupes futur (bases IndexedDB séparées)
 *
 * @author Grégoire Bédard avec assistance Claude Code
 * @version Beta 91.6 (Cache hybride IndexedDB)
 * @date 26 novembre 2025
 */

(function() {
    'use strict';

    /**
     * Classe Database - API unifiée pour stockage
     */
    class Database {
        constructor() {
            this.useIndexedDB = false;
            this.db = null;
            this.ready = false;
            this.initPromise = null;
            // Cache mémoire pour les clés trop grandes pour localStorage
            // Permet un accès synchrone même si la donnée n'est pas dans localStorage
            this.memoryCache = new Map();
            // Écritures IDB en cours (pour flush dans beforeunload)
            this._pendingWrites = new Set();
            // Notification quota affichée une seule fois par session
            this._quotaAlertShown = false;
        }

        /**
         * Initialisation de la base de données
         * Détecte IndexedDB et initialise si disponible
         */
        async init() {
            if (this.initPromise) {
                return this.initPromise;
            }

            this.initPromise = this._init();
            return this.initPromise;
        }

        async _init() {
            // Détecter si IndexedDB est disponible
            this.useIndexedDB = this._detectIndexedDB();

            if (this.useIndexedDB) {
                try {
                    await this._initIndexedDB();
                } catch (error) {
                    console.error('❌ [DB] Erreur initialisation IndexedDB, fallback localStorage:', error);
                    this.useIndexedDB = false;
                }
            } else {
            }

            this.ready = true;
            return this;
        }

        /**
         * Détecte si IndexedDB est disponible
         */
        _detectIndexedDB() {
            try {
                return !!(window.indexedDB && window.IDBTransaction && window.IDBKeyRange);
            } catch (e) {
                return false;
            }
        }

        /**
         * Initialise IndexedDB avec le schéma de données
         */
        async _initIndexedDB() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open('MonitoragePedagogique', 2);

                request.onerror = () => {
                    reject(new Error('Erreur ouverture IndexedDB'));
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    resolve();
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;

                    // Store principal pour compatibilité localStorage (clé-valeur)
                    if (!db.objectStoreNames.contains('keyvalue')) {
                        const kvStore = db.createObjectStore('keyvalue', { keyPath: 'key' });
                        kvStore.createIndex('key', 'key', { unique: true });
                    }

                    // Store fichiers blob (consolidé depuis MonitorageFichiers)
                    if (!db.objectStoreNames.contains('fichiers')) {
                        const fichiersStore = db.createObjectStore('fichiers', { keyPath: 'id' });
                        fichiersStore.createIndex('etudiantDA', 'etudiantDA', { unique: false });
                        fichiersStore.createIndex('productionId', 'productionId', { unique: false });
                    }
                };
            });
        }

        /**
         * Lecture d'une valeur (API unifiée)
         * @param {string} key - Clé de la donnée
         * @param {*} defaultValue - Valeur par défaut si clé inexistante
         * @returns {Promise<*>} Valeur stockée ou valeur par défaut
         */
        async get(key, defaultValue = null) {
            if (!this.ready) {
                await this.init();
            }

            if (this.useIndexedDB) {
                return await this._getIndexedDB(key, defaultValue);
            } else {
                return this._getLocalStorage(key, defaultValue);
            }
        }

        /**
         * Lecture depuis IndexedDB avec fallback localStorage
         * 🆕 Beta 96.2 : Ajout fallback localStorage si clé absente d'IndexedDB
         */
        async _getIndexedDB(key, defaultValue) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['keyvalue'], 'readonly');
                const store = transaction.objectStore('keyvalue');
                const request = store.get(key);

                request.onsuccess = () => {
                    if (request.result) {
                        resolve(request.result.value);
                    } else {
                        // 🆕 Fallback vers localStorage si absent d'IndexedDB
                        const localValue = this._getLocalStorage(key, null);
                        if (localValue !== null) {
                            // Synchroniser vers IndexedDB pour la prochaine fois
                            this._setIndexedDB(key, localValue).catch(() => {});
                        }
                        resolve(localValue !== null ? localValue : defaultValue);
                    }
                };

                request.onerror = () => {
                    console.error(`[DB] Erreur lecture IndexedDB clé "${key}":`, request.error);
                    // Fallback localStorage en cas d'erreur aussi
                    const localValue = this._getLocalStorage(key, defaultValue);
                    resolve(localValue);
                };
            });
        }

        /**
         * Lecture depuis localStorage
         */
        _getLocalStorage(key, defaultValue) {
            try {
                const value = localStorage.getItem(key);
                if (value === null) {
                    return defaultValue;
                }

                // Essayer de parser en JSON
                try {
                    const parsed = JSON.parse(value);

                    // CORRECTIF CRITIQUE : Détection double stringify
                    // Si on obtient une string après parsing, c'est probablement du double stringify
                    // Exemple: "\"[{...}]\"" → parse → "[{...}]" (string) → reparse → [{...}] (array)
                    if (typeof parsed === 'string') {
                        try {
                            const reparsed = JSON.parse(parsed);
                            console.warn(`[DB] Double stringify détecté pour clé "${key}", correction automatique appliquée`);
                            // Corriger immédiatement dans localStorage pour éviter le problème futur
                            this._setLocalStorage(key, reparsed);
                            return reparsed;
                        } catch (reparseError) {
                            // Si le re-parsing échoue, la string est légitime
                            return parsed;
                        }
                    }

                    return parsed;
                } catch (parseError) {
                    // Si le parsing échoue, c'est probablement une ancienne valeur non-JSON (ex: "normal" au lieu de '"normal"')
                    // Retourner la valeur brute pour compatibilité avec données migrées
                    console.warn(`[DB] Valeur non-JSON détectée pour clé "${key}", retour valeur brute. Réécriture recommandée.`);
                    return value;
                }
            } catch (e) {
                console.error(`[DB] Erreur lecture localStorage clé "${key}":`, e);
                return defaultValue;
            }
        }

        /**
         * Écriture d'une valeur (API unifiée)
         * @param {string} key - Clé de la donnée
         * @param {*} value - Valeur à stocker
         * @returns {Promise<void>}
         */
        async set(key, value) {
            if (!this.ready) {
                await this.init();
            }

            if (this.useIndexedDB) {
                // Écrire dans IndexedDB (stockage persistant)
                await this._setIndexedDB(key, value);

                // AUSSI écrire dans localStorage (cache synchrone) si la donnée n'est pas trop grande
                // Pour que les lectures getSync() voient immédiatement les nouvelles données
                try {
                    this._setLocalStorage(key, value);
                } catch (e) {
                    // Si QuotaExceededError (données trop grandes pour localStorage),
                    // utiliser memoryCache pour que getSync() puisse y accéder
                    if (e.name === 'QuotaExceededError' || e.code === 22) {
                        console.warn(`[DB] ⚠️ Clé "${key}" trop grande pour localStorage, utilisation memoryCache`);
                        // 🆕 Beta 95.5 : Stocker dans memoryCache pour accès synchrone
                        this.memoryCache.set(key, value);
                        // Supprimer du cache localStorage si elle y était
                        try { localStorage.removeItem(key); } catch (ex) { console.warn('[DB] localStorage.removeItem skipped:', key, ex.message || ex); }
                    } else {
                        // Autre erreur, la remonter
                        throw e;
                    }
                }
            } else {
                this._setLocalStorage(key, value);
            }
        }

        /**
         * Écriture vers IndexedDB
         */
        async _setIndexedDB(key, value) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['keyvalue'], 'readwrite');
                const store = transaction.objectStore('keyvalue');
                const request = store.put({ key: key, value: value });

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    console.error(`[DB] Erreur écriture IndexedDB clé "${key}":`, request.error);
                    reject(request.error);
                };
            });
        }

        /**
         * Écriture vers localStorage
         */
        _setLocalStorage(key, value) {
            const jsonString = JSON.stringify(value);
            localStorage.setItem(key, jsonString);
        }

        /**
         * Estime la taille d'une valeur en bytes
         */
        _estimateSize(value) {
            try {
                return new Blob([JSON.stringify(value)]).size;
            } catch (e) {
                return -1;
            }
        }

        /**
         * Suppression d'une valeur (API unifiée)
         * @param {string} key - Clé à supprimer
         * @returns {Promise<void>}
         */
        async remove(key) {
            if (!this.ready) {
                await this.init();
            }

            if (this.useIndexedDB) {
                // Supprimer d'IndexedDB (stockage persistant)
                await this._removeIndexedDB(key);

                // AUSSI supprimer de localStorage (cache synchrone) si elle y est
                try {
                    this._removeLocalStorage(key);
                } catch (e) {
                    // Si erreur (clé inexistante dans localStorage), ignorer
                    console.warn(`[DB] Note: clé "${key}" n'était pas dans localStorage (normal pour grandes données)`);
                }
            } else {
                this._removeLocalStorage(key);
            }
        }

        /**
         * Suppression depuis IndexedDB
         */
        async _removeIndexedDB(key) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['keyvalue'], 'readwrite');
                const store = transaction.objectStore('keyvalue');
                const request = store.delete(key);

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    console.error(`[DB] Erreur suppression IndexedDB clé "${key}":`, request.error);
                    reject(request.error);
                };
            });
        }

        /**
         * Suppression depuis localStorage
         */
        _removeLocalStorage(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error(`[DB] Erreur suppression localStorage clé "${key}":`, e);
            }
        }

        /**
         * Migration localStorage → IndexedDB (manuelle)
         * Copie toutes les données de localStorage vers IndexedDB
         * Utile pour migration initiale ou récupération de données
         *
         * @param {boolean} force - Si true, écrase les données existantes dans IndexedDB
         * @returns {Promise<Object>} Statistiques de migration
         */
        async migrateFromLocalStorage(force = false) {
            if (!this.useIndexedDB) {
                console.warn('[DB] IndexedDB non disponible, migration impossible');
                return { success: false, error: 'IndexedDB non disponible' };
            }


            let migrated = 0;
            let skipped = 0;
            let errors = 0;
            const keys = Object.keys(localStorage);

            for (const key of keys) {
                try {
                    // Vérifier si la clé existe déjà dans IndexedDB
                    if (!force) {
                        const existing = await this.get(key);
                        if (existing !== null) {
                            skipped++;
                            continue;
                        }
                    }

                    // Migrer la clé
                    const value = JSON.parse(localStorage.getItem(key));
                    await this.set(key, value);
                    migrated++;
                } catch (e) {
                    console.error(`[DB] Erreur migration clé "${key}":`, e);
                    errors++;
                }
            }

            const result = {
                success: true,
                total: keys.length,
                migrated,
                skipped,
                errors
            };

            return result;
        }

        /**
         * Obtenir toutes les clés
         * @returns {Promise<string[]>} Liste des clés
         */
        async keys() {
            if (!this.ready) {
                await this.init();
            }

            if (this.useIndexedDB) {
                return await this._keysIndexedDB();
            } else {
                return Object.keys(localStorage);
            }
        }

        /**
         * Obtenir toutes les clés depuis IndexedDB
         */
        async _keysIndexedDB() {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['keyvalue'], 'readonly');
                const store = transaction.objectStore('keyvalue');
                const request = store.getAllKeys();

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    console.error('[DB] Erreur lecture clés IndexedDB:', request.error);
                    resolve([]);
                };
            });
        }

        /**
         * Vider toute la base de données
         * ⚠️ ATTENTION: Supprime toutes les données!
         */
        async clear() {
            if (!this.ready) {
                await this.init();
            }

            if (this.useIndexedDB) {
                await this._clearIndexedDB();
                await this.clearBlobs();
            } else {
                localStorage.clear();
            }
        }

        /**
         * Vider IndexedDB (store keyvalue)
         */
        async _clearIndexedDB() {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['keyvalue'], 'readwrite');
                const store = transaction.objectStore('keyvalue');
                const request = store.clear();

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    console.error('[DB] Erreur vidage IndexedDB:', request.error);
                    reject(request.error);
                };
            });
        }

        /**
         * Informations sur le stockage utilisé
         */
        async info() {
            if (!this.ready) {
                await this.init();
            }

            const keys = await this.keys();
            const type = this.useIndexedDB ? 'IndexedDB' : 'localStorage';

            let nbBlobs = 0;
            if (this.useIndexedDB && this.db) {
                try {
                    nbBlobs = await new Promise((resolve) => {
                        const tx = this.db.transaction(['fichiers'], 'readonly');
                        const store = tx.objectStore('fichiers');
                        const req = store.count();
                        req.onsuccess = () => resolve(req.result);
                        req.onerror = () => resolve(0);
                    });
                } catch (e) { console.warn('[DB] blob count query skipped:', e.message || e); }
            }

            return {
                type: type,
                nbCles: keys.length,
                nbBlobs: nbBlobs,
                ready: this.ready
            };
        }

        /**
         * Libère de l'espace dans le cache localStorage
         * Supprime les grosses clés du cache (elles restent dans IndexedDB)
         * @param {number} seuilOctets - Taille minimale pour supprimer (défaut: 100KB)
         * @returns {Object} Résultat avec clés supprimées et espace libéré
         */
        async libereCacheLocalStorage(seuilOctets = 100000) {
            if (!this.useIndexedDB) {
                console.warn('[DB] Impossible de libérer le cache sans IndexedDB');
                return { success: false, message: 'IndexedDB non disponible' };
            }


            const clesSupprimes = [];
            let espaceLibere = 0;

            // Parcourir toutes les clés localStorage
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                const value = localStorage.getItem(key);
                if (value && value.length > seuilOctets) {
                    // Vérifier que la clé existe dans IndexedDB avant de supprimer
                    const existsInIndexedDB = await this.get(key) !== null;
                    if (existsInIndexedDB) {
                        espaceLibere += value.length;
                        localStorage.removeItem(key);
                        clesSupprimes.push({ key, size: value.length });
                    }
                }
            }

            const result = {
                success: true,
                clesSupprimes: clesSupprimes.length,
                espaceLibere: espaceLibere,
                espaceLibereKB: (espaceLibere / 1024).toFixed(1),
                details: clesSupprimes
            };

            return result;
        }

        /**
         * Synchronisation IndexedDB → localStorage au démarrage
         * Charge toutes les données d'IndexedDB dans le cache localStorage
         * pour permettre un accès synchrone rapide
         */
        async syncToLocalStorageCache() {
            if (!this.useIndexedDB) {
                return;
            }


            try {
                const indexedDBKeys = await this.keys();
                let synced = 0;
                let inMemory = 0;

                var SEUIL_IDB_FIRST = 200 * 1024; // 200 Ko

                for (const key of indexedDBKeys) {
                    // Skip : FileSystemDirectoryHandle non sérialisable en JSON
                    if (key === 'travaux_fsapi_handle') continue;

                    // Lire depuis IndexedDB
                    const value = await this.get(key);

                    // Seuil IDB-first : les grosses valeurs restent dans memoryCache
                    // (pas de tentative localStorage, cohérent avec setSync)
                    var taille = this._estimateSize(value);
                    if (taille > SEUIL_IDB_FIRST) {
                        try { localStorage.removeItem(key); } catch (ex) {}
                        this.memoryCache.set(key, value);
                        inMemory++;
                        continue;
                    }

                    // Valeur raisonnable → synchroniser dans localStorage
                    try {
                        this._setLocalStorage(key, value);
                        this.memoryCache.delete(key);
                        synced++;
                    } catch (e) {
                        // Quota dépassé malgré le seuil → cache mémoire
                        if (e.name === 'QuotaExceededError' || e.code === 22 ||
                            (e.message && e.message.toLowerCase().includes('quota'))) {
                            console.warn('[DB] Quota localStorage dépassé pour "' + key + '" (' + taille + ' bytes), utilisation cache mémoire');
                            try { localStorage.removeItem(key); } catch (ex) {}
                            this.memoryCache.set(key, value);
                            inMemory++;
                        } else {
                            throw e;
                        }
                    }
                }


                // ✅ Définir flag global pour indiquer que la DB est prête
                window.dbReady = true;

                // Émettre événement pour notifier que les données sont prêtes
                window.dispatchEvent(new CustomEvent('db-ready', {
                    detail: { synced, inMemory, total: indexedDBKeys.length }
                }));
            } catch (error) {
                console.error('❌ [DB] Erreur synchronisation cache:', error);

                // ✅ Définir flag même en cas d'erreur (fallback localStorage)
                window.dbReady = true;

                // Émettre événement même en cas d'erreur
                window.dispatchEvent(new CustomEvent('db-ready', {
                    detail: { error: error.message }
                }));
            }
        }

        // ============================================
        // MÉTHODES BLOB (Store fichiers)
        // ============================================

        /**
         * Stocke un enregistrement blob dans le store fichiers
         * @param {Object} record - {id, etudiantDA, productionId, blob, dateStored}
         * @returns {Promise<void>}
         */
        async storeBlob(record) {
            if (!this.ready) await this.init();
            if (!this.useIndexedDB || !this.db) {
                throw new Error('[DB] IndexedDB requis pour storeBlob');
            }
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction(['fichiers'], 'readwrite');
                const store = tx.objectStore('fichiers');
                const request = store.put(record);
                request.onsuccess = () => resolve();
                request.onerror = () => {
                    console.error(`[DB] Erreur storeBlob "${record.id}":`, request.error);
                    reject(request.error);
                };
            });
        }

        /**
         * Récupère un enregistrement blob par son id
         * @param {string} id
         * @returns {Promise<Object|null>}
         */
        async getBlob(id) {
            if (!this.ready) await this.init();
            if (!this.useIndexedDB || !this.db) return null;
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction(['fichiers'], 'readonly');
                const store = tx.objectStore('fichiers');
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => {
                    console.error(`[DB] Erreur getBlob "${id}":`, request.error);
                    reject(request.error);
                };
            });
        }

        /**
         * Supprime un blob par son id
         * @param {string} id
         * @returns {Promise<void>}
         */
        async deleteBlob(id) {
            if (!this.ready) await this.init();
            if (!this.useIndexedDB || !this.db) return;
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction(['fichiers'], 'readwrite');
                const store = tx.objectStore('fichiers');
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => {
                    console.error(`[DB] Erreur deleteBlob "${id}":`, request.error);
                    reject(request.error);
                };
            });
        }

        /**
         * Liste les blobs d'un étudiant via l'index etudiantDA
         * @param {string} etudiantDA
         * @returns {Promise<Array>}
         */
        async listBlobsByStudent(etudiantDA) {
            if (!this.ready) await this.init();
            if (!this.useIndexedDB || !this.db) return [];
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction(['fichiers'], 'readonly');
                const store = tx.objectStore('fichiers');
                const index = store.index('etudiantDA');
                const request = index.getAll(etudiantDA);
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => {
                    console.error(`[DB] Erreur listBlobsByStudent "${etudiantDA}":`, request.error);
                    reject(request.error);
                };
            });
        }

        /**
         * Persiste un FileSystemDirectoryHandle dans keyvalue
         * @param {FileSystemDirectoryHandle} handle
         * @returns {Promise<void>}
         */
        async storeFSAPIHandle(handle) {
            if (!this.ready) await this.init();
            if (!this.useIndexedDB || !this.db) return;
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction(['keyvalue'], 'readwrite');
                const store = tx.objectStore('keyvalue');
                const request = store.put({
                    key: 'travaux_fsapi_handle',
                    value: handle
                });
                request.onsuccess = () => resolve();
                request.onerror = () => {
                    console.error('[DB] Erreur storeFSAPIHandle:', request.error);
                    reject(request.error);
                };
            });
        }

        /**
         * Récupère le FileSystemDirectoryHandle
         * @returns {Promise<FileSystemDirectoryHandle|null>}
         */
        async getFSAPIHandle() {
            if (!this.ready) await this.init();
            if (!this.useIndexedDB || !this.db) return null;
            return new Promise((resolve) => {
                const tx = this.db.transaction(['keyvalue'], 'readonly');
                const store = tx.objectStore('keyvalue');
                const request = store.get('travaux_fsapi_handle');
                request.onsuccess = () => {
                    resolve(request.result ? request.result.value : null);
                };
                request.onerror = () => resolve(null);
            });
        }

        /**
         * Vide le store fichiers
         * @returns {Promise<void>}
         */
        async clearBlobs() {
            if (!this.ready) await this.init();
            if (!this.useIndexedDB || !this.db) return;
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction(['fichiers'], 'readwrite');
                const store = tx.objectStore('fichiers');
                const request = store.clear();
                request.onsuccess = () => {
                    resolve();
                };
                request.onerror = () => {
                    console.error('[DB] Erreur clearBlobs:', request.error);
                    reject(request.error);
                };
            });
        }

        // ============================================
        // MÉTHODES SYNCHRONES (Migration progressive)
        // ============================================
        // Ces méthodes utilisent localStorage de manière synchrone
        // pour permettre une migration progressive sans tout casser

        /**
         * Lecture synchrone (cache hybride)
         * Cherche d'abord dans localStorage, puis dans le cache mémoire
         * @param {string} key - Clé de la donnée
         * @param {*} defaultValue - Valeur par défaut
         * @returns {*} Valeur stockée ou valeur par défaut
         */
        getSync(key, defaultValue = null) {
            // 1. Chercher dans le cache mémoire EN PREMIER
            // memoryCache contient la version fraîche quand les données sont trop
            // volumineuses pour localStorage (QuotaExceeded). setSync() supprime
            // memoryCache quand localStorage réussit, donc si memoryCache a la
            // valeur, c'est la source de vérité.
            if (this.memoryCache.has(key)) {
                return this.memoryCache.get(key);
            }

            // 2. Chercher dans localStorage (cache persistant)
            const localValue = this._getLocalStorage(key, null);
            if (localValue !== null) {
                return localValue;
            }

            // 3. Non trouvé, retourner la valeur par défaut
            return defaultValue;
        }

        /**
         * Écriture synchrone (cache hybride)
         * Écrit immédiatement dans localStorage (synchrone, cache rapide)
         * et déclenche écriture asynchrone dans IndexedDB si disponible
         * @param {string} key - Clé de la donnée
         * @param {*} value - Valeur à stocker
         * @throws {Error} Si IndexedDB non disponible ET localStorage plein
         */
        setSync(key, value) {
            // Seuil IDB-first : les grosses valeurs vont directement dans
            // memoryCache + IDB, sans tenter localStorage (évite QuotaExceeded)
            var SEUIL_IDB_FIRST = 200 * 1024; // 200 Ko

            var taille = this._estimateSize(value);
            var idbDispo = this.ready && this.useIndexedDB;

            if (idbDispo && taille > SEUIL_IDB_FIRST) {
                // Grosse valeur → IDB-first, pas de localStorage
                this.memoryCache.set(key, value);
                // Supprimer l'éventuelle ancienne version de localStorage
                try { localStorage.removeItem(key); } catch (ex) {}
                // Écriture IDB en arrière-plan (trackée pour flush)
                this._trackWrite(key, value);
                return;
            }

            // 1. Essayer d'écrire dans localStorage (cache rapide)
            try {
                this._setLocalStorage(key, value);
                // Supprimer du cache mémoire si la donnée est maintenant dans localStorage
                this.memoryCache.delete(key);
            } catch (e) {
                // Quota localStorage dépassé
                if (e.name === 'QuotaExceededError' || e.code === 22 ||
                    (e.message && e.message.toLowerCase().includes('quota'))) {

                    // Si IndexedDB est disponible, on peut continuer sans cache localStorage
                    if (idbDispo) {
                        console.warn('[DB] Quota localStorage dépassé pour "' + key + '" (' + taille + ' bytes), utilisation cache mémoire + IndexedDB');
                        // Supprimer du localStorage pour libérer de l'espace
                        try { localStorage.removeItem(key); } catch (ex) {}
                        // Stocker dans le cache mémoire pour accès synchrone
                        this.memoryCache.set(key, value);
                        // Notification utilisateur (une seule fois par session)
                        if (!this._quotaAlertShown && typeof afficherNotificationErreur === 'function') {
                            this._quotaAlertShown = true;
                            afficherNotificationErreur(
                                'Stockage local saturé',
                                'Certaines données sont stockées en mémoire temporaire. Tes données sont préservées mais un rechargement rapide (Cmd+Q) pourrait en perdre.'
                            );
                        }
                    } else {
                        // Pas d'IndexedDB disponible, on ne peut pas sauvegarder
                        console.error('[DB] Quota localStorage dépassé et IndexedDB non disponible pour "' + key + '"');
                        throw e;
                    }
                } else {
                    // Autre erreur, la remonter
                    throw e;
                }
            }

            // 2. Écriture asynchrone dans IndexedDB si disponible (trackée pour flush)
            if (idbDispo) {
                this._trackWrite(key, value);
            }
        }

        /**
         * Lance une écriture IDB et la tracke dans _pendingWrites
         * pour permettre le flush dans beforeunload
         */
        _trackWrite(key, value) {
            var self = this;
            var promise = this._setIndexedDB(key, value).catch(function(error) {
                console.warn('[DB] Erreur écriture async IDB clé "' + key + '":', error);
            }).finally(function() {
                self._pendingWrites.delete(promise);
            });
            this._pendingWrites.add(promise);
        }

        /**
         * Attend que toutes les écritures IDB pendantes soient terminées.
         * Utile avant un rechargement volontaire de page.
         * @returns {Promise<void>}
         */
        async flush() {
            if (this._pendingWrites.size === 0) return;
            await Promise.all(Array.from(this._pendingWrites));
        }

        /**
         * Suppression synchrone (cache hybride)
         * Supprime de localStorage, du cache mémoire, et d'IndexedDB
         * @param {string} key - Clé à supprimer
         */
        removeSync(key) {
            // 1. Suppression synchrone de localStorage (cache rapide)
            this._removeLocalStorage(key);

            // 2. Suppression du cache mémoire
            this.memoryCache.delete(key);

            // 3. Suppression asynchrone d'IndexedDB si disponible (en arrière-plan)
            if (this.ready && this.useIndexedDB) {
                this._removeIndexedDB(key).catch(error => {
                    console.warn(`[DB] Erreur suppression async IndexedDB clé "${key}":`, error);
                    // caches déjà vidés, on continue
                });
            }
        }
    }

    // ============================================
    // Fonctions utilitaires globales
    // ============================================

    /**
     * Obtient les données selon le mode actif (normal, simulation, anonymisation)
     * Fonction utilitaire pour simplifier l'accès aux données dans tous les modules
     *
     * @param {string} cle - Clé de stockage (ex: 'groupeEtudiants', 'evaluationsSauvegardees')
     * @param {*} defaut - Valeur par défaut si la clé n'existe pas (défaut: [])
     * @returns {*} Les données parsées ou la valeur par défaut
     *
     * USAGE:
     * const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
     * const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees', []);
     */
    function obtenirDonneesSelonMode(cle, defaut = []) {
        // Lecture depuis db.getSync (cache hybride localStorage + IndexedDB)
        const donnees = db.getSync(cle, null);

        // Si pas de données, retourner la valeur par défaut
        if (!donnees) {
            return defaut;
        }

        // Si les données sont déjà un objet/array, les retourner directement
        if (typeof donnees === 'object') {
            return donnees;
        }

        // Sinon, tenter de parser le JSON (pour compatibilité avec anciens modules)
        try {
            return JSON.parse(donnees);
        } catch (e) {
            console.warn(`[obtenirDonneesSelonMode] Impossible de parser la clé "${cle}":`, e);
            return defaut;
        }
    }

    // ============================================
    // Initialisation et export global
    // ============================================

    // Créer instance unique (singleton)
    const db = new Database();

    /**
     * Migration one-shot : MonitorageFichiers → MonitoragePedagogique.fichiers
     * Idempotente : ne s'exécute qu'une fois grâce au flag _migration_fichiers_done
     */
    async function _migrerMonitorageFichiers() {
        // Déjà migrée ?
        if (db.getSync('_migration_fichiers_done', false)) return;

        try {
            // Tenter d'ouvrir l'ancienne base
            const oldDB = await new Promise((resolve, reject) => {
                const req = indexedDB.open('MonitorageFichiers');
                req.onsuccess = (e) => resolve(e.target.result);
                req.onerror = () => reject(req.error);
            });

            // Vérifier que le store fichiers existe dans l'ancienne base
            if (!oldDB.objectStoreNames.contains('fichiers')) {
                oldDB.close();
                // Pas de store fichiers : supprimer la base vide et marquer fait
                indexedDB.deleteDatabase('MonitorageFichiers');
                db.setSync('_migration_fichiers_done', true);
                return;
            }

            // Lire tous les enregistrements de l'ancien store
            const records = await new Promise((resolve, reject) => {
                const tx = oldDB.transaction(['fichiers'], 'readonly');
                const store = tx.objectStore('fichiers');
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => reject(req.error);
            });


            // Copier vers le nouveau store
            for (const record of records) {
                await db.storeBlob(record);
            }

            // Fermer et supprimer l'ancienne base
            oldDB.close();
            indexedDB.deleteDatabase('MonitorageFichiers');

            // Marquer la migration complète
            db.setSync('_migration_fichiers_done', true);
        } catch (e) {
            // Si l'ancienne base n'existe pas, l'ouverture crée une base vide v1
            // On la supprime simplement
            try { indexedDB.deleteDatabase('MonitorageFichiers'); } catch (ex) { console.warn('[DB] deleteDatabase skipped:', ex.message || ex); }
            db.setSync('_migration_fichiers_done', true);
        }
    }

    // Initialiser automatiquement et synchroniser le cache
    db.init().then(async () => {

        // Synchroniser IndexedDB → localStorage cache si IndexedDB est disponible
        if (db.useIndexedDB) {
            await db.syncToLocalStorageCache();

            // Migration one-shot des blobs depuis l'ancienne base MonitorageFichiers
            await _migrerMonitorageFichiers();
        }
    }).catch((error) => {
        console.error('❌ [DB] Erreur initialisation:', error);
    });

    // Beforeunload : signaler si des écritures IDB sont en cours
    // Le returnValue donne au navigateur le temps de finir les transactions
    window.addEventListener('beforeunload', function(event) {
        if (db._pendingWrites.size > 0) {
            console.warn('[DB] ' + db._pendingWrites.size + ' écriture(s) IDB en cours au déchargement');
            event.returnValue = '';
        }
    });

    // Exporter globalement
    window.db = db;
    // NOTE: obtenirDonneesSelonMode est exportée par modes.js (version avec cle() namespace)
    // Ne PAS exporter la version locale qui lit les clés brutes sans namespace

    // Export pour modules ES6 (futur)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = db;
    }

})();
