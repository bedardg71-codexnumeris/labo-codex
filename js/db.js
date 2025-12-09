/**
 * Couche d'abstraction unifiée pour le stockage de données
 * Architecture de cache hybride localStorage + IndexedDB
 *
 * FONCTIONNEMENT:
 * - localStorage = Cache synchrone rapide (accès immédiat)
 * - IndexedDB = Stockage principal asynchrone (grandes capacités)
 * - Synchronisation bidirectionnelle automatique
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
                console.log('📊 [DB] IndexedDB détecté, initialisation...');
                try {
                    await this._initIndexedDB();
                    console.log('✅ [DB] IndexedDB initialisé avec succès');
                } catch (error) {
                    console.error('❌ [DB] Erreur initialisation IndexedDB, fallback localStorage:', error);
                    this.useIndexedDB = false;
                }
            } else {
                console.log('📁 [DB] Utilisation de localStorage (IndexedDB non disponible)');
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
                const request = indexedDB.open('MonitoragePedagogique', 1);

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

                    // Stores relationnels (pour futur - Phase 2)
                    /*
                    if (!db.objectStoreNames.contains('groupes')) {
                        const groupesStore = db.createObjectStore('groupes', { keyPath: 'id', autoIncrement: true });
                        groupesStore.createIndex('code', 'code', { unique: true });
                        groupesStore.createIndex('session', 'session', { unique: false });
                    }

                    if (!db.objectStoreNames.contains('etudiants')) {
                        const etudiantsStore = db.createObjectStore('etudiants', { keyPath: 'id', autoIncrement: true });
                        etudiantsStore.createIndex('da', 'da', { unique: true });
                        etudiantsStore.createIndex('groupeId', 'groupeId', { unique: false });
                    }

                    // Autres stores: evaluations, presences, indices, etc.
                    */
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
         * Lecture depuis IndexedDB
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
                        resolve(defaultValue);
                    }
                };

                request.onerror = () => {
                    console.error(`[DB] Erreur lecture IndexedDB clé "${key}":`, request.error);
                    resolve(defaultValue);
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
                    // continuer sans cache localStorage (IndexedDB suffit)
                    if (e.name === 'QuotaExceededError' || e.code === 22) {
                        console.warn(`[DB] ⚠️ Clé "${key}" trop grande pour localStorage (${this._estimateSize(value)} bytes), stockée uniquement dans IndexedDB`);
                        // Supprimer du cache localStorage si elle y était
                        try { localStorage.removeItem(key); } catch (ex) { /* ignore */ }
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

            console.log('🔄 [DB] Début migration localStorage → IndexedDB...');

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

            console.log(`✅ [DB] Migration terminée:`, result);
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
            } else {
                localStorage.clear();
            }
        }

        /**
         * Vider IndexedDB
         */
        async _clearIndexedDB() {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['keyvalue'], 'readwrite');
                const store = transaction.objectStore('keyvalue');
                const request = store.clear();

                request.onsuccess = () => {
                    console.log('🗑️ [DB] IndexedDB vidé');
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

            return {
                type: type,
                nbCles: keys.length,
                ready: this.ready
            };
        }

        /**
         * Synchronisation IndexedDB → localStorage au démarrage
         * Charge toutes les données d'IndexedDB dans le cache localStorage
         * pour permettre un accès synchrone rapide
         */
        async syncToLocalStorageCache() {
            if (!this.useIndexedDB) {
                console.log('[DB] Pas de synchronisation nécessaire (IndexedDB non utilisé)');
                return;
            }

            console.log('🔄 [DB] Synchronisation IndexedDB → localStorage cache...');

            try {
                const indexedDBKeys = await this.keys();
                let synced = 0;
                let skipped = 0;

                for (const key of indexedDBKeys) {
                    // Lire depuis IndexedDB
                    const value = await this.get(key);

                    // Vérifier si la clé existe déjà dans localStorage
                    const existsInCache = localStorage.getItem(key) !== null;

                    if (!existsInCache) {
                        // Clé manquante dans cache, synchroniser
                        this._setLocalStorage(key, value);
                        synced++;
                    } else {
                        // Clé déjà présente, on garde la version localStorage (cache chaud)
                        skipped++;
                    }
                }

                console.log(`✅ [DB] Synchronisation terminée: ${synced} clés synchronisées, ${skipped} déjà en cache`);

                // ✅ Définir flag global pour indiquer que la DB est prête
                window.dbReady = true;

                // Émettre événement pour notifier que les données sont prêtes
                window.dispatchEvent(new CustomEvent('db-ready', {
                    detail: { synced, skipped, total: indexedDBKeys.length }
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
        // MÉTHODES SYNCHRONES (Migration progressive)
        // ============================================
        // Ces méthodes utilisent localStorage de manière synchrone
        // pour permettre une migration progressive sans tout casser

        /**
         * Lecture synchrone (utilise toujours localStorage)
         * @param {string} key - Clé de la donnée
         * @param {*} defaultValue - Valeur par défaut
         * @returns {*} Valeur stockée ou valeur par défaut
         */
        getSync(key, defaultValue = null) {
            return this._getLocalStorage(key, defaultValue);
        }

        /**
         * Écriture synchrone (cache hybride)
         * Écrit immédiatement dans localStorage (synchrone, cache rapide)
         * et déclenche écriture asynchrone dans IndexedDB si disponible
         * @param {string} key - Clé de la donnée
         * @param {*} value - Valeur à stocker
         */
        setSync(key, value) {
            // 1. Écriture synchrone dans localStorage (cache rapide)
            this._setLocalStorage(key, value);

            // 2. Écriture asynchrone dans IndexedDB si disponible (en arrière-plan)
            if (this.ready && this.useIndexedDB) {
                this._setIndexedDB(key, value).catch(error => {
                    console.warn(`[DB] Erreur écriture async IndexedDB clé "${key}":`, error);
                    // localStorage a déjà la valeur, on continue
                });
            }
        }

        /**
         * Suppression synchrone (cache hybride)
         * Supprime immédiatement de localStorage (synchrone, cache rapide)
         * et déclenche suppression asynchrone d'IndexedDB si disponible
         * @param {string} key - Clé à supprimer
         */
        removeSync(key) {
            // 1. Suppression synchrone de localStorage (cache rapide)
            this._removeLocalStorage(key);

            // 2. Suppression asynchrone d'IndexedDB si disponible (en arrière-plan)
            if (this.ready && this.useIndexedDB) {
                this._removeIndexedDB(key).catch(error => {
                    console.warn(`[DB] Erreur suppression async IndexedDB clé "${key}":`, error);
                    // localStorage a déjà supprimé, on continue
                });
            }
        }
    }

    // ============================================
    // Initialisation et export global
    // ============================================

    // Créer instance unique (singleton)
    const db = new Database();

    // Initialiser automatiquement et synchroniser le cache
    db.init().then(async () => {
        console.log('✅ [DB] Base de données prête:', db.useIndexedDB ? 'IndexedDB' : 'localStorage');

        // Synchroniser IndexedDB → localStorage cache si IndexedDB est disponible
        if (db.useIndexedDB) {
            await db.syncToLocalStorageCache();
        }
    }).catch((error) => {
        console.error('❌ [DB] Erreur initialisation:', error);
    });

    // Exporter globalement
    window.db = db;

    // Export pour modules ES6 (futur)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = db;
    }

})();
