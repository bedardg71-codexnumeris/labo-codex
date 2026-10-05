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
 * DURABILITÉ DONNÉES (#353 — Options A/B/C):
 *   - Écritures ET suppressions IDB (keyvalue + fichiers) résolvent sur le COMMIT
 *     de transaction (transaction.oncomplete), PAS request.onsuccess → durables
 *     sous WebKit / origine file:// où le commit est différé après onsuccess
 *   - Opérations fire-and-forget (setSync, removeSync, set() non-awaité) trackées
 *     dans _pendingWrites (Set de promesses) via _trackOperation
 *   - db.flush() attend la fin des opérations pendantes ; elles sont aussi drainées
 *     au déchargement via visibilitychange/pagehide (Option B). beforeunload avertit.
 *   - Quota localStorage dépassé : bascule silencieuse en memoryCache + IDB
 *     (comportement géré, pas de notification utilisateur)
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

    // ========================================================================
    // #353 (10 août 2026) — L'UNITÉ DU QUOTA, MESURÉE PLUTÔT QUE SUPPOSÉE
    // ------------------------------------------------------------------------
    // Le navigateur facture localStorage en UNITÉS DE CODE UTF-16 (autrement
    // dit : en caractères), pas en octets. Vérifié au navigateur le 10 août
    // (Chromium, origine file://) en remplissant jusqu'au QuotaExceededError :
    //
    //   · avec 'x' (1 caractère = 1 octet UTF-8)  → 4,94 M caractères tenus
    //   · avec 'é' (1 caractère = 2 octets UTF-8) → 4,94 M caractères tenus
    //
    // Même capacité en caractères des deux côtés : c'est le caractère qui est
    // compté, pas l'octet. Le plafond nominal est donc 5 Mi CARACTÈRES.
    //
    // ⮕ CE QUE CETTE MESURE A CORRIGÉ. `statsStockage` comptait
    // `(cle + valeur).length * 2` — des octets UTF-16 — et divisait par un
    // budget de 5 Mi. Le ratio affiché valait donc le DOUBLE de la réalité :
    // les « 173 % » du 9 août étaient 86 %, et les « 200 % » du 10 août sont
    // **100 %**. Le chiffre n'était pas absurde, il était dans la mauvaise
    // monnaie — et un ratio impossible (200 % d'un quota qu'on ne peut pas
    // dépasser) invite à ne plus le croire, ce qui est le pire résultat pour
    // une alerte. Toutes les mesures d'occupation sont désormais en caractères.
    // ========================================================================
    const BUDGET_LOCALSTORAGE = 5 * 1024 * 1024; // 5 Mi CARACTÈRES (unités UTF-16)
    const PALIERS_ALERTE_OCCUPATION = [0.8, 0.95];

    // Seuil IDB-first (#334 D, zéro-dette) : au-delà, une valeur va directement
    // dans memoryCache + IndexedDB, sans tenter localStorage (évite un
    // QuotaExceededError systématique sur les grosses clés). Source unique —
    // consommé par set(), setSync() et syncToLocalStorageCache().
    //
    // #353 : exprimé dans la MÊME monnaie que le budget (caractères). Il l'était
    // en octets UTF-8 (`new Blob(...).size`) — une troisième unité, incomparable
    // aux deux autres : un seuil « 200 Ko » et un budget « 5 Mo » qui ne
    // parlaient pas de la même chose. L'écart pratique est de quelques pour cent
    // (les accents coûtent 2 octets UTF-8 pour 1 caractère), mais l'incohérence
    // rendait tout arbitrage sur chiffres impossible — or c'est exactement ce
    // que #353 demande.
    //
    // ⮕ VALEUR TRANCHÉE SUR CHIFFRES le 10 août 2026 (option 2 du RAPPORT-353,
    // décision Grégoire) : 200 Ki → **25 Ki caractères**.
    //
    // Le relevé terrain des DEUX navigateurs de Grégoire, une fois l'unité
    // corrigée (Chrome 100 % / 475 clés · Safari 88,3 % / 462 clés) :
    //
    //   seuil       Chrome reste   Safari reste   clés déplacées
    //   200 Ki         100 %           88 %          0  /  0     ← l'ancien
    //   100 Ki          88 %           84 %          4  /  2
    //    50 Ki          70 %           68 %         17  / 13
    //    25 Ki          44 %           44 %         60  / 55     ← retenu
    //    10 Ki           9 %            8 %        165  /161
    //
    // ▣ CE QUE LA PREMIÈRE LIGNE DIT, ET QUI EXPLIQUE TOUT : à 200 Ki, **zéro
    // clé ne basculait** — la plus grosse clé de Grégoire pèse 184 K car. Le
    // mécanisme IDB-first existe depuis #334 D ; il n'avait jamais pu se
    // déclencher chez lui. Un seuil au-dessus du plus gros objet n'est pas un
    // seuil, c'est un plafond décoratif.
    // ▣ Deux jeux de données distincts convergent sur 44 % à 25 Ki : la masse
    // est dans la LONGUE TRAÎNE (475 clés pour 5 119 K car.), pas dans quelques
    // géants — ce qui écarte l'option 3 (liste blanche de grosses clés).
    //
    // ⚠ Ce que ce changement NE fait pas : il ne déplace rien de lui-même dans
    // l'instant. C'est `syncToLocalStorageCache` qui, à CHAQUE démarrage,
    // réapplique le seuil et retire de localStorage ce qui le dépasse — donc la
    // projection se réalise au rechargement suivant, sans script de migration.
    // ⚠ Corollaire assumé : plus de clés sont servies depuis `memoryCache`. Ce
    // n'est pas une exposition neuve quand IndexedDB est absent (le routage est
    // gardé par `idbDispo` et retombe alors sur localStorage), mais ça élargit
    // la fenêtre « lecture avant hydratation du boot » — la même que surveille
    // #418. Tout lecteur doit passer par `auDbPret`.
    const SEUIL_IDB_FIRST = 25 * 1024; // 25 Ki caractères (voir la table ci-dessus)

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
            // #392 — opérations synchrones émises AVANT la fin de init() :
            // sans file, un setSync/removeSync pré-init n'atteignait JAMAIS
            // IndexedDB (clé invisible à db.keys(), suppression ressuscitée).
            // Rejouées par _rejouerOperationsAvantInit() à la fin de _init().
            this._operationsAvantInit = [];
            // #340 — Gardes d'écriture par clé de base. Une garde reçoit
            // (cleEffective, valeur) et retourne { coherent:false, raison } pour
            // BLOQUER une écriture incohérente (ex. productions d'un trimestre
            // écrites sous le namespace d'un autre). Domaine-agnostique : la
            // logique métier est injectée par un module dédié (cf.
            // js/productions-namespace-garde.js).
            this._gardesEcriture = new Map();
            // #510 — files d'attente des lectures-modifications-écritures, une
            // par clé. Voir `modifier()` : c'est ce qui empêche deux rafales
            // d'autosave de lire le même instantané et de s'entre-écraser.
            this._filesModification = new Map();
            // #962 — le commit IDB attendu, par clé, de la DERNIÈRE écriture
            // synchrone (`_trackWrite`) : { commit, grosse }. Voir `commitEnAttente`.
            this._commitsEnAttente = new Map();
            // #962 — l'abonné aux échecs des écritures IDB d'arrière-plan
            // (voir `surEchecEcriture`).
            this._surEchecEcriture = null;
            // #1029 — la connexion IndexedDB est-elle connue pour perdue
            // (`close` / `versionchange` reçus) ? Et la réouverture en cours,
            // partagée par toutes les opérations qui l'attendent.
            this._connexionPerdue = false;
            this._reouverture = null;
            // #1029 — la dernière valeur demandée par clé, tant qu'une écriture IDB de
            // cette clé est en vol (voir `_ecrireIDB`).
            this._dernieresValeurs = new Map();
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
         * #447 (10 août 2026) — Signale qu'une clé va être écrite.
         *
         * POURQUOI CE CROCHET EXISTE. Le cache de lecture de pipeline (#397,
         * `modes.js`) promet dans son propre commentaire « jamais de lecture
         * périmée », et il tenait cette promesse par un seul moyen : toute
         * écriture passant par `sauvegarderDonneesSelonMode` le vidait. Mais
         * une partie du code écrit ses clés en `db.setSync`/`db.set` DIRECT
         * (le propriétaire SSOT écrit sa propre clé — c'est légitime), et ces
         * écritures-là ne vidaient rien. Mesuré au navigateur le 10 août :
         * pendant un seul `chargerTableauBordApercu()`, `indicesCP` est écrit
         * à une profondeur de pipeline de 2 — le pipeline extérieur SURVIT à
         * l'écriture et garde sa mémoïsation d'avant.
         *
         * ⮕ La promesse est donc rétablie à l'endroit où TOUTES les écritures
         * passent, au lieu de dépendre de la discipline de chaque appelant.
         * `db.js` se contente d'émettre ; c'est `modes.js` (couche au-dessus)
         * qui s'abonne — le sens des dépendances est préservé.
         *
         * Aucune écriture n'est modifiée, aucun mode n'est changé : ce crochet
         * ne fait que notifier.
         */
        _signalerEcriture(key) {
            var abonne = this._surEcriture;
            if (typeof abonne !== 'function') return;
            try { abonne(key); } catch (e) {
                // Un abonné ne doit jamais casser une écriture.
                console.warn('[DB] abonné _surEcriture a levé une exception :', e && e.message);
            }
        }

        /**
         * Abonne un rappel aux écritures (voir `_signalerEcriture`).
         * Un seul abonné : le besoin est unique et connu (invalidation du
         * cache de lecture #397). Pas de liste « au cas où ».
         */
        surEcriture(rappel) {
            this._surEcriture = typeof rappel === 'function' ? rappel : null;
        }

        /**
         * #962 (5 oct. 2026) — UN ÉCHEC D'ÉCRITURE NE SE TAIT JAMAIS.
         *
         * `setSync` rend la main avant le commit IndexedDB : son échec (quota,
         * transaction avortée, connexion fermée après une mise en arrière-plan sur
         * l'iPad) n'était qu'un `console.warn` de `_trackOperation`, alors que le
         * témoin avait déjà dit « Enregistré ». Au rechargement, le démarrage relit
         * IndexedDB : la valeur perdue disparaît, et pour une petite clé, l'ancienne
         * copie d'IndexedDB réécrit même celle de localStorage
         * (`syncToLocalStorageCache`).
         *
         * Même forme que `surEcriture` : `db.js` émet, `modes.js` (couche du témoin)
         * s'abonne. Un seul abonné, le besoin est unique.
         * @param {function(string, Error)} rappel - (clé, erreur)
         */
        surEchecEcriture(rappel) {
            this._surEchecEcriture = typeof rappel === 'function' ? rappel : null;
        }

        _signalerEchecEcriture(key, erreur) {
            var abonne = this._surEchecEcriture;
            if (typeof abonne !== 'function') return;
            try { abonne(key, erreur); } catch (e) {
                console.warn('[DB] abonné _surEchecEcriture a levé une exception :', e && e.message);
            }
        }

        /**
         * #1029 (5 oct. 2026) — ROUVRIR LA CONNEXION PERDUE, UNE FOIS.
         *
         * Sur l'iPad, après une mise en arrière-plan, la connexion IndexedDB peut être
         * perdue : `transaction()` lève `InvalidStateError` (ou la transaction avorte,
         * « connection … lost »). Rien ne la rouvrait : chaque écriture échouait jusqu'au
         * rechargement, et le rechargement perdait ces écritures (le démarrage relit
         * IndexedDB). Depuis #962, chacune disait « Non enregistré » — un aveu sans issue.
         *
         * `_avecReprise(operation)` : si la connexion est connue perdue, la rouvrir
         * d'abord ; si l'opération échoue parce que la connexion est fermée, la rouvrir
         * UNE fois et refaire l'opération. Seul l'échec de cette nouvelle tentative
         * remonte (et devient « Non enregistré »). `operation` est une fonction rappelée
         * à chaque tentative : l'écriture relit alors la DERNIÈRE valeur demandée pour
         * sa clé (`_dernieresValeurs`), jamais une valeur périmée.
         */
        _connexionFermee(erreur) {
            if (this._connexionPerdue) return true;
            if (!erreur) return false;
            if (erreur.name === 'InvalidStateError') return true;
            return /connection.*(lost|clos)/i.test(String(erreur.message || ''));
        }

        /** Une seule réouverture à la fois : les opérations en vol attendent la même. */
        _rouvrirConnexion() {
            if (!this._reouverture) {
                const ancienne = this.db;
                try { if (ancienne) ancienne.close(); } catch (e) { /* déjà fermée */ }
                this._reouverture = this._initIndexedDB().finally(() => {
                    this._reouverture = null;
                });
            }
            return this._reouverture;
        }

        async _avecReprise(operation) {
            if (this._reouverture) {
                try { await this._reouverture; } catch (e) { /* l'opération dira l'échec */ }
            } else if (this._connexionPerdue) {
                try { await this._rouvrirConnexion(); } catch (e) { /* idem */ }
            }
            const connexion = this.db;
            try {
                return await operation();
            } catch (erreur) {
                if (!this._connexionFermee(erreur)) throw erreur;
                // Déjà remplacée par une autre opération : ne pas fermer la neuve.
                if (this.db === connexion) await this._rouvrirConnexion();
                else if (this._reouverture) await this._reouverture;
                return await operation();
            }
        }

        /**
         * Écriture IDB de la clé-valeur, par `setSync` comme par `set` : chaque tentative
         * écrit la valeur la plus récente demandée pour cette clé. Le registre ne garde
         * que la dernière, et la libère quand SON écriture se termine.
         */
        _ecrireIDB(key, value) {
            const entree = { value: value };
            this._dernieresValeurs.set(key, entree);
            const ecriture = this._avecReprise(() => {
                const derniere = this._dernieresValeurs.get(key);
                return this._setIndexedDB(key, derniere ? derniere.value : value);
            });
            const liberer = () => {
                if (this._dernieresValeurs.get(key) === entree) this._dernieresValeurs.delete(key);
            };
            ecriture.then(liberer, liberer);
            return ecriture;
        }

        _supprimerIDB(key) {
            return this._avecReprise(() => this._removeIndexedDB(key));
        }

        /**
         * #962 — le commit IndexedDB que la dernière écriture synchrone de cette clé
         * attend encore : `{ commit, grosse }`, ou `null` s'il n'y en a pas (commit
         * fait, écriture par `set` qui l'attend elle-même, IndexedDB absent).
         * `commit` est la promesse d'ORIGINE : elle rejette sur l'échec. `grosse` :
         * la valeur dépasse `SEUIL_IDB_FIRST`, elle ne vit qu'en mémoire jusqu'au
         * commit (aucune copie en localStorage).
         */
        commitEnAttente(key) {
            return this._commitsEnAttente.get(key) || null;
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
            this._rejouerOperationsAvantInit();
            return this;
        }

        /**
         * #392 — Rejoue vers IndexedDB les setSync/removeSync émis avant la
         * fin de l'init (leur couche synchrone était déjà servie ; seule la
         * persistance IDB avait été silencieusement sautée). No-op si
         * IndexedDB est indisponible (localStorage reste la seule couche).
         */
        _rejouerOperationsAvantInit() {
            if (this._operationsAvantInit.length === 0) return;
            const enAttente = this._operationsAvantInit.splice(0);
            if (!this.useIndexedDB) return;
            for (const op of enAttente) {
                if (op.type === 'set') {
                    this._trackWrite(op.key, op.value);
                } else {
                    this._trackOperation(this._supprimerIDB(op.key), 'suppression', op.key);
                }
            }
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
                    const connexion = event.target.result;
                    // #1029 : savoir la connexion perdue AVANT la prochaine écriture.
                    // `close` : perte anormale (iPad, après une mise en arrière-plan) ;
                    // `versionchange` : un autre onglet change le schéma, on lui cède.
                    connexion.onclose = () => {
                        if (this.db === connexion) this._connexionPerdue = true;
                    };
                    connexion.onversionchange = () => {
                        try { connexion.close(); } catch (e) { /* déjà fermée */ }
                        if (this.db === connexion) this._connexionPerdue = true;
                    };
                    this.db = connexion;
                    this._connexionPerdue = false;
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

            // #392 — memoryCache d'abord : c'est la source de vérité des
            // grosses clés (cf. en-tête) et son contenu peut être PLUS FRAIS
            // qu'IndexedDB quand une écriture setSync est encore pendante
            // (ex. export lancé dans la foulée d'une modification).
            if (this.memoryCache.has(key)) {
                return this.memoryCache.get(key);
            }

            if (this.useIndexedDB) {
                return await this._avecReprise(() => this._getIndexedDB(key, defaultValue));
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

            this._signalerEcriture(key);

            if (this.useIndexedDB) {
                // Écrire dans IndexedDB (stockage persistant). #353 Option C (W1) :
                // tracker la promesse dans _pendingWrites pour qu'un `db.set(...)` NON
                // awaité (fire-and-forget) reste drainable par flush() / Option B.
                // _trackOperation retourne la promesse d'origine → `await` ci-dessous
                // conserve la durabilité (commit via Option A) et la propagation d'erreur.
                await this._trackOperation(this._ecrireIDB(key, value), 'écriture', key);

                // Seuil IDB-first (#334 D) : harmonisé avec setSync — au-delà du
                // seuil, on NE tente PAS localStorage (évite un QuotaExceededError
                // systématique sur les grosses clés) et on sert getSync via
                // memoryCache. Comportement observable identique, chemin plus propre.
                // #401 : sérialiser UNE fois (taille + écriture sur la même chaîne).
                const jsonString = JSON.stringify(value);
                if (this._estimateSizeFromString(jsonString) > SEUIL_IDB_FIRST) {
                    this.memoryCache.set(key, value);
                    try { localStorage.removeItem(key); } catch (ex) { console.warn('[DB] localStorage.removeItem skipped:', key, ex.message || ex); }
                    return;
                }

                // Valeur raisonnable → AUSSI écrire dans localStorage (cache
                // synchrone) pour que getSync() voie immédiatement la donnée.
                try {
                    this._setLocalStorageString(key, jsonString);
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
         * #510 — LIRE, MODIFIER, ÉCRIRE SANS SE FAIRE DOUBLER (25 août 2026).
         *
         * ⚠⚠ CE QUE ÇA CORRIGE, ET POURQUOI ON NE LE VOYAIT PAS. Les éditeurs
         * de gabarits enregistrent champ par champ : le `change` d'un champ
         * part au blur, c'est-à-dire au moment PRÉCIS où on clique dans le
         * champ suivant. Chaque enregistrement lisait la collection entière,
         * y changeait une valeur, puis la réécrivait entière. Deux rafales
         * rapprochées lisaient donc le même instantané, et la seconde
         * réécrivait la collection SANS la modification de la première :
         *
         *     A : get(grilles) ─────────── set(grilles + nomA)
         *     B :     get(grilles) ──────────────── set(grilles SANS nomA)
         *
         * La saisie disparaissait sans erreur et sans message — d'où le
         * « je l'avais rempli, c'est pas resté » rapporté par Grégoire, et
         * son caractère intermittent : la fenêtre est étroite, mais réelle,
         * chaque `get` IndexedDB rendant la main.
         *
         * Le remède n'est PAS de sérialiser les écritures : deux `set` bien
         * ordonnés perdent quand même la première modification, puisque le
         * mal est fait à la LECTURE. C'est la séquence entière qui doit être
         * atomique — d'où la file par clé.
         *
         * @param {string} key - la clé à modifier
         * @param {function} mutateur - reçoit la valeur lue, rend la valeur à
         *   écrire ; peut être asynchrone. Rendre `undefined` ANNULE
         *   l'écriture (rien n'est touché) : c'est le chemin des refus,
         *   « grille introuvable », « index hors bornes », etc.
         * @param {*} defaut - valeur rendue par la lecture si la clé est vide
         * @returns {Promise<*>} ce que le mutateur a rendu
         */
        async modifier(key, mutateur, defaut = null) {
            const precedente = this._filesModification.get(key) || Promise.resolve();

            // ⚠ La file ne doit pas se rompre sur un échec : une opération qui
            // lève laisserait toutes les suivantes en attente pour toujours.
            // On chaîne donc sur l'issue, pas sur le succès.
            const courante = precedente.then(() => {}, () => {}).then(async () => {
                const valeur = await this.get(key, defaut);
                const resultat = await mutateur(valeur);
                if (resultat === undefined) return undefined;
                await this.set(key, resultat);
                return resultat;
            });

            this._filesModification.set(key, courante);

            // Ne pas laisser la Map enfler : la dernière opération de la file
            // retire son entrée. (Le `then` vide évite un rejet non capté ici ;
            // l'appelant, lui, reçoit bien `courante` et son erreur.)
            courante.then(() => {}, () => {}).then(() => {
                if (this._filesModification.get(key) === courante) {
                    this._filesModification.delete(key);
                }
            });

            return courante;
        }

        /**
         * #401 : lecture de TOUS les enregistrements IDB en UNE transaction
         * readonly (getAll) — le boot faisait N allers-retours séquentiels
         * (une transaction par clé), terme dominant probable des 729-1057 ms
         * mesurés en terrain (Safari, codex réel, 5 août soir).
         * @returns {Promise<Array<{key:string, value:*}>>}
         */
        async _getAllIndexedDB() {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['keyvalue'], 'readonly');
                const store = transaction.objectStore('keyvalue');
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error || new Error('IndexedDB getAll error'));
            });
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
            this._setLocalStorageString(key, JSON.stringify(value));
        }

        /**
         * #401 : écriture d'une chaîne DÉJÀ sérialisée — permet aux chemins qui
         * viennent d'estimer la taille (setSync, set, syncToLocalStorageCache)
         * de sérialiser UNE seule fois (mesuré à l'audit : 243 ms de double
         * stringify au boot sur 5,2 Mo/120 clés, payés aussi à chaque écriture
         * de grosse clé).
         */
        _setLocalStorageString(key, jsonString) {
            localStorage.setItem(key, jsonString);
            // #353 Option 1 : point de passage des écritures localStorage →
            // vérification (throttlée) de l'occupation vs budget. Observabilité
            // seule — ne modifie jamais l'écriture qui vient d'aboutir.
            this._verifierBudgetLocalStorage();
        }

        /**
         * Estime la taille d'une valeur en bytes
         */
        _estimateSize(value) {
            try {
                return this._estimateSizeFromString(JSON.stringify(value));
            } catch (e) {
                return -1;
            }
        }

        /**
         * Coût d'une chaîne déjà sérialisée, DANS LA MONNAIE DU QUOTA :
         * les unités de code UTF-16, c'est-à-dire `.length` (voir la mesure
         * documentée près de BUDGET_LOCALSTORAGE).
         *
         * #401 : pas de re-stringify. #353 (10 août) : plus de `new Blob(...)`
         * non plus — il rendait des octets UTF-8, une unité que le navigateur
         * ne facture pas, et allouait un Blob à CHAQUE écriture sur un chemin
         * chaud pour produire un chiffre incomparable au budget.
         */
        _estimateSizeFromString(jsonString) {
            return typeof jsonString === 'string' ? jsonString.length : -1;
        }

        /**
         * #353 — mesure FRAÎCHE de l'occupation localStorage, EN CARACTÈRES
         * UTF-16 (la monnaie du quota, mesurée le 10 août — voir le bloc au-
         * dessus de BUDGET_LOCALSTORAGE). `.length` est O(1) : le parcours des
         * quelques centaines de clés est bon marché.
         *
         * ⚠ Le champ s'appelle `unites` et non `octets` : il tenait le second
         * nom en portant la première valeur, ce qui a fait lire « 200 % d'un
         * quota » là où l'app était à 100 % de son plafond réel.
         *
         * @param {number} nbTop - nombre de plus grosses clés à détailler
         * @returns {{unites:number, budget:number, ratio:number, nbCles:number,
         *            topCles:Array<{cle:string,unites:number}>,
         *            contributeursConnus:Object, seuilCourantKi:number,
         *            projectionSeuils:Array}}
         */
        statsStockage(nbTop = 10) {
            const tailles = [];
            let unites = 0;
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const cle = localStorage.key(i);
                    if (cle === null) continue;
                    const valeur = localStorage.getItem(cle) || '';
                    // #353 : la clé COMPTE aussi dans le quota, et l'unité est
                    // le caractère UTF-16 — pas l'octet.
                    const t = cle.length + valeur.length;
                    unites += t;
                    tailles.push({ cle: cle, unites: t });
                }
            } catch (e) { /* mesure best-effort */ }
            tailles.sort((a, b) => b.unites - a.unites);
            // Contributeurs identifiés par le RAPPORT-353 §3, agrégés pour lecture rapide
            const somme = (pred) => tailles.filter(pred).reduce((acc, x) => acc + x.unites, 0);

            // #353 — DE QUOI TRANCHER L'OPTION 2 SUR DES CHIFFRES. Pour chaque
            // seuil candidat : ce que basculer les clés au-dessus libérerait.
            // Le rapport demandait « mesurer avant de trancher » ; sans cette
            // projection, choisir un seuil reste une intuition déguisée.
            const projection = [25, 50, 100, 200].map(function (ko) {
                const seuil = ko * 1024;
                const concernees = tailles.filter(x => x.unites > seuil);
                const liberees = concernees.reduce((acc, x) => acc + x.unites, 0);
                return {
                    seuilKi: ko,
                    nbCles: concernees.length,
                    uniteesLiberees: liberees,
                    ratioApres: (unites - liberees) / BUDGET_LOCALSTORAGE
                };
            });

            return {
                unites: unites,
                budget: BUDGET_LOCALSTORAGE,
                ratio: unites / BUDGET_LOCALSTORAGE,
                nbCles: tailles.length,
                topCles: tailles.slice(0, nbTop),
                contributeursConnus: {
                    backupsV1: somme(x => x.cle.endsWith('_backup_v1')),
                    tamponsImages: somme(x => x.cle.indexOf('tamponsImages') !== -1)
                },
                seuilCourantKi: SEUIL_IDB_FIRST / 1024,
                projectionSeuils: projection
            };
        }

        /**
         * #353 Option 1 — alerte de budget, appelée au fil de l'eau par
         * `_setLocalStorage`. Throttle 60 s ; chaque palier (80 %, 95 %) n'émet
         * qu'UN console.warn par session. Aucune action corrective : le but est
         * de produire le chiffre AVANT la décision (options 2/3/4 du rapport).
         */
        _verifierBudgetLocalStorage() {
            const maintenant = Date.now();
            if (this._budgetDerniereVerif && maintenant - this._budgetDerniereVerif < 60000) {
                return;
            }
            this._budgetDerniereVerif = maintenant;
            this._budgetPaliersEmis = this._budgetPaliersEmis || {};
            const stats = this.statsStockage(5);
            for (const palier of PALIERS_ALERTE_OCCUPATION) {
                if (stats.ratio >= palier && !this._budgetPaliersEmis[palier]) {
                    this._budgetPaliersEmis[palier] = true;
                    const top = stats.topCles
                        .map(x => x.cle + ' (' + (x.unites / 1024).toFixed(0) + ' K car.)')
                        .join(', ');
                    console.warn(
                        '[DB #353] localStorage à ' + (stats.ratio * 100).toFixed(0) + ' % du quota ' +
                        '(' + (stats.unites / 1024).toFixed(0) + ' K car. / ' + (stats.budget / 1024).toFixed(0) + ' K car., ' +
                        stats.nbCles + ' clés). Aucune donnée en danger (durabilité A/B/C) — ' +
                        'au-delà du quota les écritures basculent en memoryCache+IDB. ' +
                        'Top clés : ' + top + '. Détail : db.statsStockage().'
                    );
                }
            }
        }

        /**
         * #353 hygiène (outil CONSOLE, jamais appelé par l'app) — purge des
         * sauvegardes `*_backup_v1` posées par migration-diagnostic.js et jamais
         * nettoyées. DRY-RUN PAR DÉFAUT : liste les clés et leur poids sans rien
         * toucher ; `db.purgerBackupsV1({ dryRun: false })` supprime réellement
         * (removeSync → toutes les couches, durable via Option C). Décision
         * d'exécution : Grégoire, sur données réelles (août).
         */
        purgerBackupsV1(options) {
            const dryRun = !options || options.dryRun !== false;
            const cibles = [];
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const cle = localStorage.key(i);
                    if (cle && cle.endsWith('_backup_v1')) {
                        const valeur = localStorage.getItem(cle) || '';
                        // #353 : caractères UTF-16, comme partout ailleurs.
                        cibles.push({ cle: cle, unites: cle.length + valeur.length });
                    }
                }
                // Les backups refoulés hors localStorage (saturation) vivent en
                // memoryCache : les couvrir aussi.
                this.memoryCache.forEach((_, cle) => {
                    if (cle.endsWith('_backup_v1') && !cibles.some(c => c.cle === cle)) {
                        cibles.push({ cle: cle, unites: -1 });
                    }
                });
            } catch (e) { /* énumération best-effort */ }
            if (!dryRun) {
                cibles.forEach(c => this.removeSync(c.cle));
            }
            const total = (cibles.reduce((acc, c) => acc + Math.max(c.unites, 0), 0) / 1024).toFixed(1);
            console.warn('[DB #353] purgerBackupsV1 ' + (dryRun ? 'DRY-RUN' : 'EXÉCUTÉ') + ' : ' +
                cibles.length + ' clé(s) *_backup_v1, ~' + total + ' K car.' +
                (dryRun ? ' — rien touché. Exécuter : db.purgerBackupsV1({ dryRun: false })' : ' supprimées.'));
            return { dryRun: dryRun, cibles: cibles };
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
                await this._supprimerIDB(key);

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

                // #353 durabilité (Option C) : résoudre sur le COMMIT de la transaction
                // (`oncomplete`), PAS sur `request.onsuccess`. Symétrie exacte avec
                // _setIndexedDB : sous WebKit / origine file://, le commit readwrite est
                // différé après onsuccess → résoudre trop tôt laissait une suppression
                // non durable → un hard refresh avant le commit avortait la transaction
                // → IndexedDB gardait la clé → réapparition silencieuse au boot
                // (syncToLocalStorageCache réhydrate localStorage depuis l'IDB non purgé).
                transaction.oncomplete = () => {
                    resolve();
                };
                transaction.onabort = () => {
                    console.error(`[DB] Transaction suppression IndexedDB avortée clé "${key}":`, transaction.error);
                    reject(transaction.error || new Error('IndexedDB transaction abort'));
                };
                transaction.onerror = () => {
                    console.error(`[DB] Erreur transaction suppression IndexedDB clé "${key}":`, transaction.error);
                    reject(transaction.error || new Error('IndexedDB transaction error'));
                };

                // Journalisation seule : l'échec de la requête fait avorter la
                // transaction → onabort/onerror tranche (pas de double reject).
                request.onerror = () => {
                    console.error(`[DB] Erreur suppression IndexedDB clé "${key}":`, request.error);
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
         * #389 — Énumération SYNCHRONE des clés visibles par getSync :
         * localStorage ∪ memoryCache. Après le boot (syncToLocalStorageCache),
         * cette union couvre toutes les clés d'IndexedDB. À utiliser à la
         * place de Object.keys(localStorage) / localStorage.key(i) : une clé
         * peut vivre en memoryCache SEULEMENT après une bascule silencieuse
         * sur quota (leçon du 5 août 2026 — migration #374 muette).
         * @returns {string[]}
         */
        keysSync() {
            const cles = new Set();
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k !== null) cles.add(k);
                }
            } catch (e) { /* énumération best-effort */ }
            this.memoryCache.forEach((_, k) => cles.add(k));
            return Array.from(cles);
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

                // #353 durabilité (Option C) : résoudre sur le COMMIT (oncomplete).
                // `clear()` est chaîné à un location.reload() (reinitialiserDonnees) :
                // sans attendre le commit, le store pouvait n'être pas vidé avant le
                // reload → toutes les données réapparaissaient.
                transaction.oncomplete = () => {
                    resolve();
                };
                transaction.onabort = () => {
                    console.error('[DB] Transaction vidage IndexedDB avortée:', transaction.error);
                    reject(transaction.error || new Error('IndexedDB transaction abort'));
                };
                transaction.onerror = () => {
                    console.error('[DB] Erreur transaction vidage IndexedDB:', transaction.error);
                    reject(transaction.error || new Error('IndexedDB transaction error'));
                };
                request.onerror = () => {
                    console.error('[DB] Erreur vidage IndexedDB:', request.error);
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
         * Synchronisation IndexedDB → localStorage au démarrage
         * Charge toutes les données d'IndexedDB dans le cache localStorage
         * pour permettre un accès synchrone rapide
         */
        async syncToLocalStorageCache() {
            if (!this.useIndexedDB) {
                return;
            }


            try {
                // #401 : lecture de TOUT le magasin en UNE transaction getAll —
                // avant : keys() puis `await this.get(key)` PAR clé (N transactions
                // readonly séquentielles + double sérialisation par clé). La part
                // CPU (double stringify) était de 243 ms mesurés sur 5,2 Mo/120
                // clés ; le terme IDB (N allers-retours) dominait en terrain
                // (729-1057 ms, Safari, codex réel).
                const enregistrements = await this._getAllIndexedDB();
                let synced = 0;
                let inMemory = 0;

                // #300 — Invalidation préventive du cache AVANT réhydratation.
                // localStorage est un cache de la session précédente, qui peut
                // être périmé vis-à-vis d'IndexedDB (source de vérité). On ne
                // vide QUE les clés présentes en IDB : elles sont restaurées
                // juste après (écritures désormais SYNCHRONES — la fenêtre
                // « clé vidée pas encore réhydratée » du correctif #300 est
                // réduite à ce bloc, sans await intercalé). Les clés
                // localStorage-seules (jamais passées par IDB) restent intactes.
                for (const rec of enregistrements) {
                    if (!rec || rec.key === 'travaux_fsapi_handle') continue;
                    try { localStorage.removeItem(rec.key); } catch (ex) {}
                }

                for (const rec of enregistrements) {
                    // Skip : FileSystemDirectoryHandle non sérialisable en JSON
                    if (!rec || rec.key === 'travaux_fsapi_handle') continue;
                    const key = rec.key;

                    // #392/#401 : memoryCache-first, comme get() — lors d'un
                    // re-sync post-import, memoryCache porte la donnée COURANTE
                    // (une écriture IDB peut encore être en vol) ; l'enregistrement
                    // getAll ne sert que si le cache n'a rien.
                    const value = this.memoryCache.has(key) ? this.memoryCache.get(key) : rec.value;

                    // #401 : sérialiser UNE fois (taille estimée sur la même chaîne)
                    var jsonString;
                    try {
                        jsonString = JSON.stringify(value);
                    } catch (eSer) {
                        console.warn('[DB] Valeur non sérialisable ignorée à la sync :', key);
                        continue;
                    }
                    var taille = this._estimateSizeFromString(jsonString);

                    // Seuil IDB-first : les grosses valeurs restent dans memoryCache
                    // (pas de tentative localStorage, cohérent avec setSync)
                    if (taille > SEUIL_IDB_FIRST) {
                        try { localStorage.removeItem(key); } catch (ex) {}
                        this.memoryCache.set(key, value);
                        inMemory++;
                        continue;
                    }

                    // Valeur raisonnable → synchroniser dans localStorage
                    try {
                        this._setLocalStorageString(key, jsonString);
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
                // #353 : même monnaie que statsStockage et que le quota —
                // le caractère UTF-16, clé comprise.
                var lsTaille = 0;
                try {
                    for (var lsKey in localStorage) {
                        if (localStorage.hasOwnProperty(lsKey)) {
                            lsTaille += lsKey.length + (localStorage.getItem(lsKey) || '').length;
                        }
                    }
                } catch (e) {}
                window._storageStats = {
                    localStorage: {
                        nbCles: Object.keys(localStorage).length,
                        tailleEstimee: lsTaille,
                        tailleFormatee: (lsTaille / 1024).toFixed(1) + ' K car.',
                        // #353 Option 1 : situe le snapshot par rapport au budget.
                        // Mesure fraîche + top clés : db.statsStockage().
                        budget: BUDGET_LOCALSTORAGE,
                        ratio: lsTaille / BUDGET_LOCALSTORAGE
                    },
                    memoryCache: {
                        nbCles: this.memoryCache.size
                    },
                    idb: {
                        nbCles: enregistrements.length,
                        syncLocalStorage: synced,
                        dansMemoryCache: inMemory
                    },
                    seuilIDBFirst: '200 Ko'
                };

                // ✅ Définir flag global pour indiquer que la DB est prête
                window.dbReady = true;

                // Émettre événement pour notifier que les données sont prêtes
                window.dispatchEvent(new CustomEvent('db-ready', {
                    detail: { synced, inMemory, total: enregistrements.length }
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
                // #353 durabilité (Option C) : résoudre sur le COMMIT (oncomplete) du
                // store 'fichiers' — l'Option A ne couvrait que 'keyvalue'.
                tx.oncomplete = () => resolve();
                tx.onabort = () => {
                    console.error(`[DB] Transaction storeBlob avortée "${record.id}":`, tx.error);
                    reject(tx.error || new Error('IndexedDB transaction abort'));
                };
                tx.onerror = () => {
                    console.error(`[DB] Erreur transaction storeBlob "${record.id}":`, tx.error);
                    reject(tx.error || new Error('IndexedDB transaction error'));
                };
                request.onerror = () => {
                    console.error(`[DB] Erreur storeBlob "${record.id}":`, request.error);
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
                // #353 durabilité (Option C) : résoudre sur le COMMIT (oncomplete).
                tx.oncomplete = () => resolve();
                tx.onabort = () => {
                    console.error(`[DB] Transaction deleteBlob avortée "${id}":`, tx.error);
                    reject(tx.error || new Error('IndexedDB transaction abort'));
                };
                tx.onerror = () => {
                    console.error(`[DB] Erreur transaction deleteBlob "${id}":`, tx.error);
                    reject(tx.error || new Error('IndexedDB transaction error'));
                };
                request.onerror = () => {
                    console.error(`[DB] Erreur deleteBlob "${id}":`, request.error);
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
                // #353 durabilité (Option C) : résoudre sur le COMMIT (oncomplete).
                tx.oncomplete = () => resolve();
                tx.onabort = () => {
                    console.error('[DB] Transaction storeFSAPIHandle avortée:', tx.error);
                    reject(tx.error || new Error('IndexedDB transaction abort'));
                };
                tx.onerror = () => {
                    console.error('[DB] Erreur transaction storeFSAPIHandle:', tx.error);
                    reject(tx.error || new Error('IndexedDB transaction error'));
                };
                request.onerror = () => {
                    console.error('[DB] Erreur storeFSAPIHandle:', request.error);
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
                // #353 durabilité (Option C) : attendre le COMMIT (oncomplete) de la
                // suppression du handle (Défense D — MODELE-MENACES §D-03). Idempotent :
                // on RÉSOUT aussi sur onabort/onerror (pas de reject) — contrat conservé.
                tx.oncomplete = () => resolve();
                tx.onabort = () => resolve();
                tx.onerror = () => resolve();
                request.onerror = () => {};
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
                // #353 durabilité (Option C) : résoudre sur le COMMIT (oncomplete).
                tx.oncomplete = () => {
                    resolve();
                };
                tx.onabort = () => {
                    console.error('[DB] Transaction clearBlobs avortée:', tx.error);
                    reject(tx.error || new Error('IndexedDB transaction abort'));
                };
                tx.onerror = () => {
                    console.error('[DB] Erreur transaction clearBlobs:', tx.error);
                    reject(tx.error || new Error('IndexedDB transaction error'));
                };
                request.onerror = () => {
                    console.error('[DB] Erreur clearBlobs:', request.error);
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
         * @returns {boolean} false si la garde #340 a refusé l'écriture (rien
         *   n'est écrit), true sinon. Lot B de l'enregistrement (27 sept. 2026) :
         *   avant, un `return` nu — `sauvegarderDonneesSelonMode` ne pouvait pas
         *   distinguer le refus d'un succès, et disait « écrit » sans rien écrire.
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
            if (!this._ecritureAutorisee(key, value)) return false;

            this._signalerEcriture(key);

            // Seuil IDB-first (constante unique module, #334 D) : les grosses
            // valeurs vont directement dans memoryCache + IDB (évite QuotaExceeded).
            // #401 : sérialiser UNE fois (la taille est estimée sur la même chaîne
            // que celle écrite — avant, chaque setSync payait un double stringify).
            var jsonString = JSON.stringify(value);
            var taille = this._estimateSizeFromString(jsonString);
            var idbDispo = this.ready && this.useIndexedDB;

            if (idbDispo && taille > SEUIL_IDB_FIRST) {
                // Grosse valeur → IDB-first, pas de localStorage
                this.memoryCache.set(key, value);
                // Supprimer l'éventuelle ancienne version de localStorage
                try { localStorage.removeItem(key); } catch (ex) {}
                // Écriture IDB en arrière-plan (trackée pour flush)
                this._trackWrite(key, value, true);
                return true;
            }

            // 1. Essayer d'écrire dans localStorage (cache rapide)
            try {
                this._setLocalStorageString(key, jsonString);
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
            } else if (!this.ready) {
                // #392 — init pas terminée : mémoriser pour rejouer, sinon la
                // clé ne vit qu'en localStorage (invisible à db.keys()).
                this._operationsAvantInit.push({ type: 'set', key: key, value: value });
            }
            return true;
        }

        /**
         * Tracke une opération IDB (écriture OU suppression) dans _pendingWrites
         * pour permettre son drainage par flush() / Option B
         * (visibilitychange/pagehide). Primitive unique partagée par _trackWrite,
         * removeSync et set() async (#353 Option C — symétrie écriture/suppression).
         * @param {Promise} promise - promesse d'opération IDB (_setIndexedDB / _removeIndexedDB)
         * @param {string} label - 'écriture' | 'suppression' (journalisation)
         * @param {string} key
         * @returns {Promise} la promesse d'ORIGINE (préserve l'await/reject de l'appelant)
         */
        _trackOperation(promise, label, key) {
            var self = this;
            // Copie CATCHÉE distincte : drainée par flush()/Option B sans masquer le
            // reject de `promise` pour un appelant qui l'attend (set() async awaité).
            var tracked = Promise.resolve(promise).then(function() {}, function(error) {
                console.warn('[DB] Erreur ' + label + ' async IDB clé "' + key + '":', error);
            }).finally(function() {
                self._pendingWrites.delete(tracked);
            });
            this._pendingWrites.add(tracked);
            return promise;
        }

        /**
         * Lance une écriture IDB et la tracke dans _pendingWrites
         * pour permettre le drainage au déchargement (flush() / Option B).
         */
        _trackWrite(key, value, grosse) {
            var self = this;
            var commit = this._trackOperation(this._ecrireIDB(key, value), 'écriture', key);
            // #962 : le commit attendu de cette clé, puis l'échec dit à l'abonné.
            var attente = { commit: commit, grosse: !!grosse };
            this._commitsEnAttente.set(key, attente);
            commit.then(function() {}, function(erreur) {
                self._signalerEchecEcriture(key, erreur);
            }).then(function() {
                if (self._commitsEnAttente.get(key) === attente) self._commitsEnAttente.delete(key);
            });
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

            // 3. Suppression asynchrone d'IndexedDB si disponible, TRACKÉE dans
            //    _pendingWrites (#353 Option C) → drainée par flush() / Option B au
            //    déchargement, comme les écritures setSync. Sans ce tracking, une
            //    suppression émise près d'un hard refresh n'était jamais drainée.
            if (this.ready && this.useIndexedDB) {
                this._trackOperation(this._supprimerIDB(key), 'suppression', key);
            } else if (!this.ready) {
                // #392 — symétrique de setSync : une suppression pré-init non
                // rejouée laissait la copie IDB ressusciter la clé au boot.
                this._operationsAvantInit.push({ type: 'remove', key: key });
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
        } else {
            // #418 — mode localStorage-seul : les données SONT lisibles dès la
            // fin d'init() (localStorage est synchrone, pas de cache à
            // hydrater). Sans cette branche, `window.dbReady` n'était JAMAIS
            // posé et `db-ready` jamais émis : aucun rappel `auDbPret` ne
            // partait — donc toutes les migrations du boot étaient sautées en
            // silence, sans limite de durée (navigation privée Safari, IDB
            // bloqué). L'ORDRE compte : le drapeau AVANT l'événement, comme
            // dans syncToLocalStorageCache (#414).
            window.dbReady = true;
            window.dispatchEvent(new CustomEvent('db-ready', {
                detail: { modeLocalStorageSeul: true }
            }));
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

    // =========================================================================
    // PORTILLON UNIQUE D'ATTENTE DE LA DB — #414 (8 août 2026)
    // =========================================================================
    // `db-ready` est un événement FUGACE : qui n'écoute pas au moment où il
    // passe ne le voit jamais. Neuf sites l'attendaient chacun à leur manière,
    // et l'audit de #414 a trouvé TROIS familles de défauts, aucune détectable
    // à la lecture d'un site isolé :
    //
    //   1. LA COURSE (#413, 7 août) — écouteur posé APRÈS l'émission. Le
    //      handler ne s'exécute jamais, en silence. C'est ce qui a sauté
    //      TOUTES les migrations du boot dans main.js.
    //   2. LA MAUVAISE CIBLE — `document.addEventListener('db-ready', …)`.
    //      L'événement est émis sur `window` (l. 983/993) et ne descend PAS
    //      vers `document` : l'écouteur est mort-né. Jamais une régression —
    //      `db.js` n'a jamais émis sur `document` (vérifié sur tout l'historique).
    //   3. LE MAUVAIS DRAPEAU — `db.ready` est vrai dès la fin d'`init()`,
    //      soit AVANT `syncToLocalStorageCache()` : lire à ce moment-là donne
    //      un `memoryCache` non hydraté. Une migration qui s'y fie migre des
    //      données incomplètes puis pose son drapeau « fait ». `db.isReady`,
    //      lui, n'a jamais existé — la garde était donc toujours fausse.
    //
    // Le seul drapeau qui signifie « les données sont lisibles » est
    // `window.dbReady`, posé juste avant l'émission. Ce portillon est le seul
    // endroit du code qui a le droit de le savoir.
    //
    // @param {Function} callback   exécuté quand la DB est prête (ou tout de suite si elle l'est déjà)
    // @param {{once?: boolean}} [options]
    //        once=true (défaut) : migrations et initialisations one-shot.
    //        once=false : rejoué à chaque `db-ready` — l'événement est réémis
    //        après un import, et ce qui dépend des données doit alors se relire.
    function auDbPret(callback, options) {
        if (typeof callback !== 'function') return;
        var once = !options || options.once !== false;
        var dejaFait = false;

        function executer(evenement) {
            if (once) {
                if (dejaFait) return;
                dejaFait = true;
                window.removeEventListener('db-ready', executer);
            }
            callback(evenement);
        }

        // L'écouteur est posé DANS TOUS LES CAS avant le rattrapage : si la DB
        // est déjà prête on exécute immédiatement, sinon on attend l'événement.
        // Les deux chemins ne peuvent pas se doubler (once) ni se manquer.
        window.addEventListener('db-ready', executer);
        if (window.dbReady) {
            executer({ detail: { rattrapage: true } });
        }
    }

    window.auDbPret = auDbPret;

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
    // #392 — registre réaligné sur les écrivains RÉELS post-refactor
    // trimestre-v2 (session A/B/C 17 mai) + fusion #374. Source : audit du
    // 5 août 2026 (rapport C5) + docs/DATA-OWNERSHIP.md.
    db._SSOT_OWNERS = {
        // Données étudiantes
        'groupeEtudiants':          ['trimestre-v2-etudiants.js'],
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
        'cadreCalendrier':          ['trimestre-v2-init.js', 'trimestre.js'],
        'planification_mindmap':    ['planification-donnees.js'],
        // Configuration
        'modeApplication':          ['modes.js'],
        'groupeCoursActif':         ['trimestre-v2-orchestre.js', 'trimestre-v2-groupes-cours.js'],
        'journeesSansCours':        ['trimestre-v2-init.js', 'migrations.js']
    };

})();
