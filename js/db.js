/**
 * Couche d'abstraction unifiée pour le stockage de données
 * Architecture de cache hybride localStorage + IndexedDB
 *
 * SOURCE DE VÉRITÉ (mise à jour 27 mars 2026):
 *
 *   Petites clés (< 200 Ko) :
 *     localStorage = source synchrone, IDB = backup async
 *     getSync() lit localStorage puis memoryCache
 *     setSync() écrit localStorage + IDB fire-and-forget
 *
 *   Grosses clés (> 200 Ko) :
 *     IDB + memoryCache = source de vérité
 *     setSync() saute localStorage, écrit memoryCache + IDB
 *     getSync() lit memoryCache (chargé par syncToLocalStorageCache au démarrage)
 *
 * DÉMARRAGE:
 *   init() → syncToLocalStorageCache() lit TOUTES les clés IDB :
 *   - Petites → localStorage (cache synchrone)
 *   - Grosses → memoryCache (seuil 200 Ko, pas de tentative localStorage)
 *   - Émet événement 'db-ready' quand terminé
 *
 * SÉCURITÉ DONNÉES:
 *   - Écritures IDB trackées dans _pendingWrites (Set de promesses)
 *   - beforeunload signale si des écritures sont en cours
 *   - db.flush() attend la fin de toutes les écritures pendantes
 *   - Notification utilisateur (une fois/session) si quota localStorage dépassé
 *
 * MÉTHODES SYNCHRONES (getSync/setSync/removeSync):
 * - Lecture: memoryCache (prioritaire) puis localStorage
 * - Écriture: localStorage ou memoryCache (selon taille) + IDB async
 * - Suppression: localStorage + memoryCache + IDB async
 *
 * MÉTHODES ASYNCHRONES (get/set/remove):
 * - Accès direct à IndexedDB avec fallback localStorage
 * - Utilisées pour migration, thumbnails, et synchronisation
 *
 * @author Grégoire Bédard avec assistance Claude Code
 * @version Beta 98.9 (Seuil IDB-first, flush beforeunload)
 * @date 27 mars 2026
 */

(function() {
    'use strict';

    // Seuil IDB-first (#334 D, zéro-dette) : au-delà, une valeur va directement
    // dans memoryCache + IndexedDB, sans tenter localStorage (évite un
    // QuotaExceededError systématique sur les grosses clés). Source unique —
    // consommé par set(), setSync() et syncToLocalStorageCache().
    const SEUIL_IDB_FIRST = 200 * 1024; // 200 Ko

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
            // #340 — Gardes d'écriture par clé de base. Une garde reçoit
            // (cleEffective, valeur) et retourne { coherent:false, raison } pour
            // BLOQUER une écriture incohérente (ex. productions d'un trimestre
            // écrites sous le namespace d'un autre). Domaine-agnostique : la
            // logique métier est injectée par un module dédié (cf.
            // js/productions-namespace-garde.js).
            this._gardesEcriture = new Map();
        }

        /**
         * #340 — Enregistre une garde d'écriture pour une clé de base donnée.
         * @param {string} cleBase - clé sans namespace (ex. 'productions')
         * @param {function} garde - (cleEffective, valeur) => { coherent, raison }
         */
        enregistrerGardeEcriture(cleBase, garde) {
            if (typeof garde === 'function') this._gardesEcriture.set(cleBase, garde);
        }

        /**
         * #340 — Vérifie la garde d'écriture applicable à `key`.
         * @returns {boolean} true si l'écriture est autorisée (ou aucune garde),
         *   false si une garde la bloque (la corruption est alors évitée).
         */
        _ecritureAutorisee(key, value) {
            if (!this._gardesEcriture || this._gardesEcriture.size === 0) return true;
            var cleBase = key;
            var m = typeof key === 'string' ? key.match(/^[aeh]\d{4}_(.+)$/) : null;
            if (m) cleBase = m[1];
            var garde = this._gardesEcriture.get(cleBase);
            if (!garde) return true;
            try {
                var res = garde(key, value);
                if (res && res.coherent === false) {
                    var stack = (new Error().stack || '').split('\n').slice(2, 8).join('\n');
                    console.error(
                        '[DB][GARDE #340] Écriture BLOQUÉE sur "' + key + '" — ' +
                        (res.raison || 'incohérence de namespace') +
                        '\n   Donnée saine préservée. Pile d\'appel de l\'écrivain fautif :\n' + stack
                    );
                    return false;
                }
            } catch (e) {
                // Une garde ne doit jamais casser une écriture : en cas d'erreur
                // interne, on autorise par défaut (fail-open) et on journalise.
                console.warn('[DB][GARDE #340] garde "' + cleBase + '" a levé une exception (écriture autorisée) :', e && e.message);
            }
            return true;
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

                    // Détection double stringify — UNIQUEMENT pour objets/arrays.
                    // Un vrai double stringify produit après re-parse un objet ou un array
                    // (ex: '"[{...}]"' → parse → '[{...}]' string → reparse → [{...}] array).
                    // Pour les primitifs string dont le contenu est un littéral JSON valide
                    // (ex: setSync('demo-actif', 'true') → storage '"true"' → parse → 'true' string),
                    // un re-parse donnerait un boolean/number/null : c'est un faux positif,
                    // la string est la valeur légitime voulue par le call site.
                    if (typeof parsed === 'string') {
                        try {
                            const reparsed = JSON.parse(parsed);
                            if (reparsed !== null && typeof reparsed === 'object') {
                                console.warn(`[DB] Double stringify détecté pour clé "${key}", correction automatique appliquée`);
                                this._setLocalStorage(key, reparsed);
                                return reparsed;
                            }
                            // Primitif → faux positif, on retourne la string d'origine
                            return parsed;
                        } catch (reparseError) {
                            // Re-parse impossible → string légitime
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

            // #340 — Garde d'écriture : bloque une écriture incohérente avant
            // qu'elle n'atteigne IDB et localStorage (les deux couches).
            if (!this._ecritureAutorisee(key, value)) return;

            if (this.useIndexedDB) {
                // Écrire dans IndexedDB (stockage persistant)
                await this._setIndexedDB(key, value);

                // Seuil IDB-first (#334 D) : harmonisé avec setSync — au-delà du
                // seuil, on NE tente PAS localStorage (évite un QuotaExceededError
                // systématique sur les grosses clés) et on sert getSync via
                // memoryCache. Comportement observable identique, chemin plus propre.
                if (this._estimateSize(value) > SEUIL_IDB_FIRST) {
                    this.memoryCache.set(key, value);
                    try { localStorage.removeItem(key); } catch (ex) { console.warn('[DB] localStorage.removeItem skipped:', key, ex.message || ex); }
                    return;
                }

                // Valeur raisonnable → AUSSI écrire dans localStorage (cache
                // synchrone) pour que getSync() voie immédiatement la donnée.
                try {
                    this._setLocalStorage(key, value);
                    // Plus à jour que memoryCache : retirer une éventuelle copie périmée.
                    this.memoryCache.delete(key);
                } catch (e) {
                    // Filet : QuotaExceededError résiduel (estimation sous le seuil
                    // mais localStorage saturé par ailleurs) → memoryCache.
                    if (e.name === 'QuotaExceededError' || e.code === 22) {
                        console.warn(`[DB] ⚠️ Clé "${key}" rejetée par localStorage (quota), utilisation memoryCache`);
                        this.memoryCache.set(key, value);
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

                // #353 durabilité : résoudre sur le COMMIT de la transaction
                // (`oncomplete`), PAS sur `request.onsuccess`. onsuccess = la requête
                // put a réussi ; oncomplete = la transaction readwrite a COMMIT sur
                // disque. Sous WebKit / origine file://, le commit est différé après
                // onsuccess : résoudre trop tôt laissait `await db.set(...)` rendre la
                // main avant que la donnée soit durable → un hard refresh avant le
                // commit avortait la transaction → IndexedDB gardait l'ancienne valeur
                // → revert silencieux (racine #352/#353/#346 + incidents 10-11 juin).
                transaction.oncomplete = () => {
                    resolve();
                };
                transaction.onabort = () => {
                    console.error(`[DB] Transaction IndexedDB avortée clé "${key}":`, transaction.error);
                    reject(transaction.error || new Error('IndexedDB transaction abort'));
                };
                transaction.onerror = () => {
                    console.error(`[DB] Erreur transaction IndexedDB clé "${key}":`, transaction.error);
                    reject(transaction.error || new Error('IndexedDB transaction error'));
                };

                // Journaliser la clé fautive précise. Ne PAS reject ici : l'échec de la
                // requête fait avorter la transaction → onabort/onerror tranche.
                request.onerror = () => {
                    console.error(`[DB] Erreur écriture IndexedDB clé "${key}":`, request.error);
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

                // #300 — Invalidation préventive du cache AVANT réhydratation.
                // localStorage est un cache de la session précédente, qui peut
                // être périmé vis-à-vis d'IndexedDB (source de vérité). Tant
                // qu'une clé n'est pas réhydratée par la boucle ci-dessous,
                // getSync doit rendre le DÉFAUT (sûr) plutôt qu'une valeur
                // périmée — ex. `trimestres` aux id vides → `",,,"` lu avant
                // `db-ready`. On ne vide QUE les clés présentes en IDB : elles
                // sont restaurées juste après, donc aucune perte. Les clés
                // localStorage-seules (jamais passées par IDB) restent intactes.
                // On ne touche pas memoryCache : vide au boot, et porteur des
                // données courantes lors des syncs post-import (pas périmé).
                for (const key of indexedDBKeys) {
                    if (key === 'travaux_fsapi_handle') continue;
                    try { localStorage.removeItem(key); } catch (ex) {}
                }

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


                // Diagnostic storage (accessible via window._storageStats)
                var lsTaille = 0;
                try {
                    for (var lsKey in localStorage) {
                        if (localStorage.hasOwnProperty(lsKey)) {
                            lsTaille += (localStorage.getItem(lsKey) || '').length * 2; // UTF-16
                        }
                    }
                } catch (e) {}
                window._storageStats = {
                    localStorage: {
                        nbCles: Object.keys(localStorage).length,
                        tailleEstimee: lsTaille,
                        tailleFormatee: (lsTaille / 1024).toFixed(1) + ' Ko'
                    },
                    memoryCache: {
                        nbCles: this.memoryCache.size
                    },
                    idb: {
                        nbCles: indexedDBKeys.length,
                        syncLocalStorage: synced,
                        dansMemoryCache: inMemory
                    },
                    seuilIDBFirst: '200 Ko'
                };

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
         * Liste les ids de TOUS les blobs du store fichiers (#336 Lot D).
         * @returns {Promise<string[]>}
         */
        async listBlobIds() {
            if (!this.ready) await this.init();
            if (!this.useIndexedDB || !this.db) return [];
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction(['fichiers'], 'readonly');
                const store = tx.objectStore('fichiers');
                const request = store.getAllKeys();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => {
                    console.error('[DB] Erreur listBlobIds:', request.error);
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
         * Préférence de persistance des handles FSAPI entre sessions.
         * Source : localStorage (pas IndexedDB, pour pouvoir lire la pref de
         * façon synchrone dès le boot avant l'init IDB).
         *
         * Défaut : false (sécurité par défaut, cf. MODELE-MENACES.md §D-03).
         * @returns {boolean}
         */
        getFSAPIPersistance() {
            return localStorage.getItem('fsapi_persistance_handles') === 'true';
        }

        /**
         * Bascule la préférence de persistance. Quand on désactive, on prend
         * soin de supprimer les handles déjà persistés pour qu'aucune session
         * future ne les réutilise (cf. MODELE-MENACES.md §D-03 P1).
         * @param {boolean} actif
         * @returns {Promise<void>}
         */
        async setFSAPIPersistance(actif) {
            if (actif) {
                localStorage.setItem('fsapi_persistance_handles', 'true');
            } else {
                localStorage.setItem('fsapi_persistance_handles', 'false');
                await this.removeFSAPIHandle();
                if (window.Reserve && typeof window.Reserve.effacerLiaisonFSAPI === 'function') {
                    try { await window.Reserve.effacerLiaisonFSAPI(); } catch (e) { /* silent */ }
                }
            }
        }

        /**
         * Persiste un FileSystemDirectoryHandle dans keyvalue.
         * No-op silencieux si la préférence de persistance est désactivée
         * (Défense D — cf. MODELE-MENACES.md §D-03).
         * @param {FileSystemDirectoryHandle} handle
         * @returns {Promise<void>}
         */
        async storeFSAPIHandle(handle) {
            if (!this.getFSAPIPersistance()) return;
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
         * Récupère le FileSystemDirectoryHandle. Retourne null si la
         * préférence de persistance est désactivée (Défense D).
         * @returns {Promise<FileSystemDirectoryHandle|null>}
         */
        async getFSAPIHandle() {
            if (!this.getFSAPIPersistance()) return null;
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
         * Supprime le handle FSAPI persisté. Idempotent.
         * Utilisé par setFSAPIPersistance(false) et lors de la migration.
         * @returns {Promise<void>}
         */
        async removeFSAPIHandle() {
            if (!this.ready) await this.init();
            if (!this.useIndexedDB || !this.db) return;
            return new Promise((resolve) => {
                const tx = this.db.transaction(['keyvalue'], 'readwrite');
                const store = tx.objectStore('keyvalue');
                const request = store.delete('travaux_fsapi_handle');
                request.onsuccess = () => resolve();
                request.onerror = () => resolve();
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
            // Tier 6.6 : Assertions SSOT en mode développement
            // Activer via console : window._SSOT_DEV_MODE = true
            // Voir docs/DATA-OWNERSHIP.md pour le registre complet
            if (window._SSOT_DEV_MODE && db._SSOT_OWNERS) {
                var cleBase = key;
                // Extraire la clé de base si namespacée (ex: h2026_presences → presences)
                var match = key.match(/^[aeh]\d{4}_(.+)$/);
                if (match) cleBase = match[1];

                var proprietaire = db._SSOT_OWNERS[cleBase];
                if (proprietaire) {
                    var stack = new Error().stack || '';
                    var appelant = stack.split('\n').slice(1, 4).join(' ');
                    var estProprietaire = proprietaire.some(function(f) {
                        return appelant.indexOf(f) !== -1;
                    });
                    if (!estProprietaire) {
                        console.warn(
                            '⚠️ [SSOT] Écriture dans "' + cleBase + '" depuis un module non propriétaire.' +
                            '\n   Propriétaires déclarés : ' + proprietaire.join(', ') +
                            '\n   Appelant : ' + appelant.trim().substring(0, 200)
                        );
                    }
                }
            }
            // #340 — Garde d'écriture : bloque une écriture incohérente avant
            // toute persistance (localStorage, memoryCache ou IDB).
            if (!this._ecritureAutorisee(key, value)) return;

            // Seuil IDB-first (constante unique module, #334 D) : les grosses
            // valeurs vont directement dans memoryCache + IDB (évite QuotaExceeded).
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
                        // Pas de notification utilisateur : avec IDB-first,
                        // le fallback memoryCache est un comportement normal et géré.
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
     * Obtient les données selon le mode actif (normal, anonymisation)
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

        let oldDB = null;
        let copieEnCours = false;
        let recordsCopies = 0;
        let recordsTotal = 0;

        try {
            // Tenter d'ouvrir l'ancienne base
            oldDB = await new Promise((resolve, reject) => {
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
            recordsTotal = records.length;

            // Copier vers le nouveau store. Si une copie echoue (quota, etc.)
            // on PRESERVE l'ancienne base et on NE pose PAS le flag : la
            // migration sera retentee au prochain boot. Les copies deja
            // faites sont idempotentes (storeBlob keys par record.id).
            copieEnCours = true;
            for (const record of records) {
                await db.storeBlob(record);
                recordsCopies++;
            }
            copieEnCours = false;

            // Fermer et supprimer l'ancienne base
            oldDB.close();
            indexedDB.deleteDatabase('MonitorageFichiers');

            // Marquer la migration complète
            db.setSync('_migration_fichiers_done', true);
        } catch (e) {
            if (oldDB) { try { oldDB.close(); } catch (_) {} }

            // Echec PENDANT la copie : ne PAS supprimer l'ancienne base, ne PAS
            // marquer fait. Les blobs originaux sont preserves pour retry au
            // prochain boot. Les blobs deja copies dans le nouveau store
            // restent (storeBlob est idempotent par id : pas de doublons au retry).
            if (copieEnCours) {
                console.error('[DB] Migration MonitorageFichiers interrompue : ' + recordsCopies + '/' + recordsTotal + ' fichiers copies. L\'ancienne base est PRESERVEE pour retry au prochain boot. Erreur :', e);
                return;
            }

            // Echec AVANT la copie (ouverture / lecture) : pas de donnees
            // migrees, on peut nettoyer la base vide creee par open() et
            // marquer fait.
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

    // #353 Option B — drainage proactif des écritures setSync fire-and-forget.
    // `setSync()` lance ses écritures IDB sans les attendre (_trackWrite) ; le
    // handler `beforeunload` ci-dessus ne fait qu'AVERTIR (un handler synchrone
    // ne peut pas attendre une transaction async). On déclenche donc db.flush()
    // au moment le plus fiable du cycle de vie : `visibilitychange`→hidden — qui
    // tire sur changement d'onglet, mise en arrière-plan ou navigation, et où la
    // page reste généralement vivante assez longtemps pour que le commit (rendu
    // durable par l'Option A : résolution sur `transaction.oncomplete`) aboutisse.
    // `pagehide` complète pour le déchargement réel / bfcache. flush() est un
    // no-op immédiat quand _pendingWrites est vide → aucun coût sur un simple
    // changement d'onglet sans écriture en attente.
    function drainerEcrituresPendantes() {
        if (db._pendingWrites.size === 0) return;
        db.flush().catch(function(error) {
            console.error('[DB] Échec du drainage des écritures pendantes:', error);
        });
    }
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            drainerEcrituresPendantes();
        }
    });
    window.addEventListener('pagehide', drainerEcrituresPendantes);

    /**
     * Test de résistance stockage — exécutable via console :
     *   window._testResistanceStorage()
     *
     * Crée des clés de test de taille croissante, vérifie la cohérence
     * getSync/IDB, puis nettoie.
     */
    window._testResistanceStorage = async function() {
        var resultats = [];
        var CLE_PREFIX = '_test_resistance_';
        var tailles = [1, 10, 50, 100, 200, 500, 1000]; // Ko

        console.warn('[Test résistance] Début — ' + tailles.length + ' tailles à tester');

        for (var i = 0; i < tailles.length; i++) {
            var ko = tailles[i];
            var cle = CLE_PREFIX + ko + 'ko';
            // Générer une valeur de la taille voulue
            var payload = '';
            for (var j = 0; j < ko * 100; j++) {
                payload += '0123456789';  // 10 chars × ko×100 = ko×1000 chars ≈ ko Ko
            }
            var valeur = { data: payload, taille: ko + ' Ko', timestamp: Date.now() };

            // Écrire via setSync
            var t0 = performance.now();
            try {
                db.setSync(cle, valeur);
            } catch (e) {
                resultats.push({ taille: ko + ' Ko', erreur: e.message });
                continue;
            }
            var tEcriture = (performance.now() - t0).toFixed(1);

            // Lire via getSync (memoryCache ou localStorage)
            var lu = db.getSync(cle, null);
            var coherent = lu && lu.taille === ko + ' Ko';

            // Vérifier où la donnée est stockée
            var dansLS = false;
            try { dansLS = localStorage.getItem(cle) !== null; } catch (e) {}
            var dansCache = db.memoryCache.has(cle);
            var stockage = dansLS ? 'localStorage' : (dansCache ? 'memoryCache' : 'inconnu');

            // Attendre flush IDB et vérifier
            await db.flush();
            var dansIDB = await db.get(cle, null) !== null;

            resultats.push({
                taille: ko + ' Ko',
                ecriture: tEcriture + ' ms',
                stockage: stockage,
                idb: dansIDB,
                coherent: coherent
            });
        }

        // Nettoyage
        for (var k = 0; k < tailles.length; k++) {
            var cleNettoyage = CLE_PREFIX + tailles[k] + 'ko';
            db.removeSync(cleNettoyage);
            try { await db.remove(cleNettoyage); } catch (e) {}
        }

        console.warn('[Test résistance] Résultats :');
        console.table(resultats);

        // Résumé
        var erreurs = resultats.filter(function(r) { return r.erreur; });
        var incoherents = resultats.filter(function(r) { return r.coherent === false; });
        if (erreurs.length === 0 && incoherents.length === 0) {
            console.warn('[Test résistance] SUCCÈS — toutes les tailles gérées correctement');
        } else {
            if (erreurs.length > 0) console.error('[Test résistance] ' + erreurs.length + ' erreur(s)');
            if (incoherents.length > 0) console.error('[Test résistance] ' + incoherents.length + ' incohérence(s)');
        }

        return resultats;
    };

    // Exporter globalement
    window.db = db;
    // NOTE: obtenirDonneesSelonMode est exportée par modes.js (version avec cle() namespace)
    // Ne PAS exporter la version locale qui lit les clés brutes sans namespace

    // Export pour modules ES6 (futur)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = db;
    }

    // ================================================================
    // Tier 6.6 : Registre SSOT des propriétaires de clés
    // Activer via console : window._SSOT_DEV_MODE = true
    // Chaque clé liste les fichiers JS autorisés à écrire.
    // Les migrations et imports sont tolérés (non listés = warning seulement).
    // Voir docs/DATA-OWNERSHIP.md pour le registre complet.
    // ================================================================
    db._SSOT_OWNERS = {
        // Données étudiantes
        'groupeEtudiants':          ['trimestre-v2.js'],
        'evaluationsSauvegardees':  ['evaluation.js'],
        'presences':                ['saisie-presences.js'],
        'fichiersTravaux':          ['travaux-stockage.js', 'travaux-import.js'],
        'annotationsTravaux':       ['travaux-stockage.js'],
        'corbeilleFichiers':        ['travaux-stockage.js'],
        'portfoliosEleves':         ['portfolio.js'],
        'interventions':            ['interventions.js'],
        // Structure pédagogique
        'productions':              ['productions.js'],
        'grillesTemplates':         ['grilles.js'],
        'echellesTemplates':        ['echelles.js'],
        'pratiquesConfigurables':   ['pratiques.js', 'wizard-pratique-v2.js'],
        // Indices
        'indicesCP':                ['portfolio.js'],
        'indicesAssiduite':         ['indices.js', 'saisie-presences.js'],
        // Planification
        'calendrierComplet':        ['trimestre.js'],
        'cadreCalendrier':          ['trimestre.js'],
        'planification_mindmap':    ['planification-donnees.js'],
        // Configuration
        'modeApplication':          ['modes.js'],
        'groupeCoursActif':         ['trimestre-v2.js']
    };

})();
