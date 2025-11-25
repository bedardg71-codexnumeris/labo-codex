/**
 * Couche d'abstraction unifiée pour le stockage de données
 * Gère automatiquement localStorage OU IndexedDB selon disponibilité
 *
 * Architecture de migration progressive:
 * - Phase 1: Support dual (localStorage + IndexedDB)
 * - Phase 2: IndexedDB uniquement avec fallback localStorage
 *
 * @author Grégoire Bédard avec assistance Claude Code
 * @version Beta 91.5 (Migration IndexedDB)
 * @date 24 novembre 2025
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
                return JSON.parse(value);
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
                await this._setIndexedDB(key, value);
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
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error(`[DB] Erreur écriture localStorage clé "${key}":`, e);
                throw e;
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
                await this._removeIndexedDB(key);
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
         * Migration localStorage → IndexedDB
         * Copie toutes les données de localStorage vers IndexedDB
         */
        async migrateFromLocalStorage() {
            if (!this.useIndexedDB) {
                console.warn('[DB] IndexedDB non disponible, migration impossible');
                return;
            }

            console.log('🔄 [DB] Début migration localStorage → IndexedDB...');

            let compteur = 0;
            const keys = Object.keys(localStorage);

            for (const key of keys) {
                try {
                    const value = JSON.parse(localStorage.getItem(key));
                    await this.set(key, value);
                    compteur++;
                } catch (e) {
                    console.error(`[DB] Erreur migration clé "${key}":`, e);
                }
            }

            console.log(`✅ [DB] Migration terminée: ${compteur}/${keys.length} clés migrées`);
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
    }

    // ============================================
    // Initialisation et export global
    // ============================================

    // Créer instance unique (singleton)
    const db = new Database();

    // Initialiser automatiquement
    db.init().then(() => {
        console.log('✅ [DB] Base de données prête:', db.useIndexedDB ? 'IndexedDB' : 'localStorage');
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
