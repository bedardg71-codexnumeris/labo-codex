/* ===============================
   MODULE : ARCHIVES — VERSEMENT D'UN GROUPE-COURS
   Date : 26 avril 2026
   Spec : docs/architecture/SPEC-RESERVE-V1.md
   Architecture : docs/architecture/ECOSYSTEME-DONNEES.md

   Vocation
     Génère un ZIP structuré contenant les données et travaux d'UN
     groupe-cours d'un trimestre. Le ZIP est téléchargé via le navigateur ;
     l'utilisateur le décompresse dans ~/Documents/Archives_LaboCodex/
     pour compléter l’archive.

   Granularité
     Une archive = un groupe-cours. Plusieurs groupes du même trimestre
     produisent plusieurs archives indépendants, chacun avec son UUID v4.

   Filtrage en deux passes
     1. Préfixe « {trimestre}_ » sur les clés IndexedDB
     2. Pour chaque clé connue, isolation par groupeCoursId (étudiants par
        numéro de groupe, présences/évaluations/interventions par DA,
        fichiersTravaux par groupeCoursId, snapshots par suffixe de clé)

   Dépendances
     - db.js (window.db)
     - trimestres.js (window.obtenirTrimestres, window.cle)
     - travaux-stockage.js (window.travauxStockage.recupererBlob)
     - JSZip (libs/jszip.min.js) : les textes de l'archive seulement
     - fichier-sortant.js (window.FichierSortant) : l'assemblage du fichier sans
       faire passer les copies par la mémoire, son téléchargement, et la
       confirmation par l'usager (lot A1, 30 sept. 2026)
     - ui-dialogues.js (window.uiDialogues.demanderAction)
     - import-export.js (window.estRessourceDemo / filtrerRessourcesNonDemo)
     - progression.js (window.afficherProgression / majProgression / masquerProgression)

   Pas de couplage avec codex.js ni import-export.js (au-delà des helpers démo).
   =============================== */

(function() {
'use strict';

/* ===============================
   CONSTANTES
   =============================== */

// Convention #262 — extension simple (pas de double point). L'ancienne
// extension `.reserve.zip` reste lisible par reserve-ouvrir.js (rétro-compat).
var EXTENSION_ARCHIVE = '.zip';

// Clé db non namespacée du manifeste local (cross-trimestre).
// Préfixe `_` → exclue automatiquement des archives (cf. PREFIXES_EXCLUS).
var CLE_MANIFESTE_LOCAL = '_manifesteReserve';

// Préfixes de clés à exclure de l’archive
var PREFIXES_EXCLUS = ['_codex_', '_'];

// Clés globales (non namespacées) à inclure dans l’archive
var CLES_GLOBALES_INCLUSES = [
    'listeCours',
    'cours',
    'enseignants',
    'horaires',
    // #358 (G4) : grilles/échelles RETIRÉES de ce pass global — elles sont
    // namespacées (`<trim>_grillesTemplates`) et capturées par le pass préfixe
    // (CLES_SANS_FILTRE, l. 111-112). La clé globale héritée est vidée au boot.
    'productionsTemplates',
    'pratiquesConfigurables',
    'modalitesEvaluation',
    'infoCours',
    'profilEnseignant',
    'trimestres'
];

// Clés à filtrer par DA dans la collecte (passe 2)
// Forme acceptée : tableau d'entrées avec `da`/`etudiantDA`, OU objet `{[da]: ...}`
var CLES_FILTRER_PAR_DA = [
    'presences',
    'evaluationsSauvegardees',
    'interventions',
    'objectifsAssignes',
    'indicesAssiduite',
    'indicesCP',
    'portfoliosEleves'
];

// Clés à NE PAS filtrer (partagées entre groupes du même cours/trimestre)
var CLES_SANS_FILTRE = [
    'productions',
    'productionsPedagogiques',
    'seances',
    'objectifs',
    'calendrierComplet',
    'horaireHebdo',
    'seancesHoraire',
    'horaireSelectionne',
    'noteDePassage',
    'indicesEvaluation',
    'indicesPatternsRaI',
    'preferencesUtilisateur',
    // Trimestre-shared (cadre temporel / planification / horaires)
    'cadreCalendrier',
    'journeesSansCours',
    // Héritage (archives antérieures au 5 août 2026) : fusionnées vers
    // journeesSansCours au boot par migrerJourneesSansCours (migrations.js)
    'evenementsPrevus',
    'evenementsImprevus',
    'horaires',
    'planification_mindmap',
    // Fallback legacy : la version vivante est `seancesCompletes_gc_{id}` (non
    // namespacée). Inclure le fallback trimestre tel quel.
    'seancesCompletes',
    // Snapshots pré-namespacing par groupe-cours. La version vivante est
    // `{trimestre}_snapshots_{gcId}` (déjà gérée). Le bare `snapshots` est
    // un legacy ; on l'inclut tel quel pour ne pas perdre de données.
    'snapshots',
    // Copies archivées des bibliothèques (trimestres archivés — Beta 95.6+).
    // Voir CLES_TEMPLATES_ARCHIVES dans trimestres.js. Quand un trimestre est
    // archivé, ces templates sont copiés vers `{trimestre}_grillesTemplates`,
    // etc. — incluons-les sans filtre pour préserver l’état archivé.
    'grillesTemplates',
    'echellesTemplates',
    'pratiquesConfigurables'
];

// Clés à filtrer par groupeCoursId sur chaque entrée (tableau)
var CLES_FILTRER_PAR_GC = [
    'corbeilleFichiers'
];

/* ===============================
   FSAPI — File System Access API (Chrome/Edge)
   ===============================
   Mode automatique pour Chrome/Edge sur Mac : ecriture directe dans un
   dossier choisi par l'utilisateur (~/Documents/Archives_LaboCodex/ ou
   ailleurs) sans telechargement de ZIP a chaque archivage, et fusion
   automatique du manifeste-archives.json global.

   Persistence : les FileSystemDirectoryHandle ne sont pas JSON-serialisables
   mais sont structuredClone-compatibles (donc compatibles IDB direct).
   db.set() passe aussi par localStorage qui ferait JSON.stringify et
   perdrait le handle silencieusement — on utilise un objectStore IDB dedie.

   Permissions : un handle persiste necessite re-verification a chaque
   session via queryPermission, et requestPermission doit s'executer dans
   un user gesture. Le clic « Archiver ce groupe » satisfait cette contrainte.

   Safari et iPad ne supportent pas FSAPI : _supporteFSAPI() retourne false
   et le flux ZIP v1 prend le relais (zero regression).
*/

var FSAPI_DB_NAME = 'reserve_fsapi';
var FSAPI_DB_VERSION = 1;
var FSAPI_STORE = 'handles';
var FSAPI_KEY_RACINE = 'dossierRacine';

// Lot A2 (30 sept. 2026) : le dossier choisi dans CETTE page, gardé jusqu'à sa fermeture.
// Mesuré à la porte du lot A1 : sans la préférence « Mémoriser le dossier … entre les
// sessions » (Défense D-03, refusée par défaut), rien ne retenait le dossier, même d'un
// geste au suivant dans la même page : Chrome le redemandait à chaque archivage, et l'écran
// « Archives » disait « Aucun dossier lié » juste après un archivage réussi. D-03 vise la
// PERSISTANCE entre sessions (un handle rémanent dans IndexedDB) : une variable de la page
// meurt avec elle et n'y contrevient pas.
var _handleSession = null;

function _supporteFSAPI() {
    return typeof window.showDirectoryPicker === 'function';
}

function _ouvrirStoreHandles() {
    return new Promise(function(resolve, reject) {
        var req = indexedDB.open(FSAPI_DB_NAME, FSAPI_DB_VERSION);
        req.onupgradeneeded = function(e) {
            var idb = e.target.result;
            if (!idb.objectStoreNames.contains(FSAPI_STORE)) {
                idb.createObjectStore(FSAPI_STORE);
            }
        };
        req.onsuccess = function() { resolve(req.result); };
        req.onerror = function() { reject(req.error); };
    });
}

function _persistanceFSAPIActive() {
    // Défense D — cf. MODELE-MENACES.md §D-03 : par défaut, on ne persiste
    // pas les handles FSAPI entre sessions. L'utilisateur peut activer
    // la persistance dans Réglages > Préférences > Sécurité.
    if (window.db && typeof window.db.getFSAPIPersistance === 'function') {
        return window.db.getFSAPIPersistance();
    }
    return localStorage.getItem('fsapi_persistance_handles') === 'true';
}

function _lireHandlePersiste() {
    if (!_persistanceFSAPIActive()) return Promise.resolve(null);
    return _ouvrirStoreHandles().then(function(idb) {
        return new Promise(function(resolve, reject) {
            var tx = idb.transaction(FSAPI_STORE, 'readonly');
            var store = tx.objectStore(FSAPI_STORE);
            var r = store.get(FSAPI_KEY_RACINE);
            r.onsuccess = function() { resolve(r.result || null); };
            r.onerror = function() { reject(r.error); };
        });
    }).catch(function(e) {
        console.warn('[Reserve] Lecture handle persiste echouee', e.message || e);
        return null;
    });
}

function _ecrireHandlePersiste(handle) {
    if (!_persistanceFSAPIActive()) return Promise.resolve();
    return _ouvrirStoreHandles().then(function(idb) {
        return new Promise(function(resolve, reject) {
            var tx = idb.transaction(FSAPI_STORE, 'readwrite');
            var store = tx.objectStore(FSAPI_STORE);
            var r = store.put(handle, FSAPI_KEY_RACINE);
            r.onsuccess = function() { resolve(); };
            r.onerror = function() { reject(r.error); };
        });
    });
}

function _supprimerHandlePersiste() {
    _handleSession = null;
    return _ouvrirStoreHandles().then(function(idb) {
        return new Promise(function(resolve, reject) {
            var tx = idb.transaction(FSAPI_STORE, 'readwrite');
            var store = tx.objectStore(FSAPI_STORE);
            var r = store.delete(FSAPI_KEY_RACINE);
            r.onsuccess = function() { resolve(); };
            r.onerror = function() { reject(r.error); };
        });
    }).catch(function(e) {
        console.warn('[Reserve] Suppression handle persiste echouee', e.message || e);
    });
}

/**
 * Verifie ou redemande la permission readwrite sur un handle.
 * Doit etre appelee dans un user gesture (clic) si la permission est 'prompt'.
 * @returns {Promise<boolean>} true si permission accordee
 */
async function _verifierPermissionHandle(handle) {
    if (!handle || typeof handle.queryPermission !== 'function') return false;
    try {
        var perm = await handle.queryPermission({ mode: 'readwrite' });
        if (perm === 'granted') return true;
        if (perm === 'prompt') {
            var demande = await handle.requestPermission({ mode: 'readwrite' });
            return demande === 'granted';
        }
        return false;
    } catch (e) {
        console.warn('[Reserve] Verification permission echouee', e.message || e);
        return false;
    }
}

/**
 * Obtient un handle de repertoire utilisable (reutilise persiste ou demande).
 *
 * @param {Object} [opts]
 * @param {boolean} [opts.forcer=false] - Force le picker meme si un handle est persiste
 * @returns {Promise<FileSystemDirectoryHandle|null>} null si non supporte ou annule
 */
async function _obtenirHandleReserve(opts) {
    if (!_supporteFSAPI()) return null;
    var forcer = !!(opts && opts.forcer);

    if (!forcer) {
        // Lot A2 : le dossier de cette page d'abord (sa permission est revérifiée).
        if (_handleSession) {
            if (await _verifierPermissionHandle(_handleSession)) return _handleSession;
            _handleSession = null;
        }
        var persiste = await _lireHandlePersiste();
        if (persiste) {
            var ok = await _verifierPermissionHandle(persiste);
            if (ok) { _handleSession = persiste; return persiste; }
            await _supprimerHandlePersiste();
        }
    }

    var nouveau;
    try {
        nouveau = await window.showDirectoryPicker({
            id: 'reserve-labo-codex',
            mode: 'readwrite',
            startIn: 'documents'
        });
    } catch (e) {
        if (e.name === 'AbortError') return null;
        console.warn('[Reserve] showDirectoryPicker echoue', e.message || e);
        return null;
    }
    // Lot A2 : garde-fou du mauvais niveau (porte du lot A1, 16 h 17 : « trimestres » choisi à
    // la place de sa racine, d'où un manifeste-archives.json isolé dans trimestres/).
    if (await _dossierMalChoisi(nouveau)) {
        notifications.erreur(MOTS_DOSSIER.mauvaisNiveau.titre, MOTS_DOSSIER.mauvaisNiveau.texte);
        // Pas `null` : null veut dire « pas de dossier », et « Archiver… » basculerait en mode
        // fichier (un ZIP à télécharger dans Chrome). Le geste s'arrête, l'usager recommence.
        var refus = new Error(MOTS_DOSSIER.mauvaisNiveau.texte);
        refus.name = 'DossierRefuse';
        throw refus;
    }
    _handleSession = nouveau;
    await _ecrireHandlePersiste(nouveau);
    return nouveau;
}

// Mots du garde-fou, en un seul endroit. Acceptés par Grégoire le 30 sept. 2026 (consigne de release du lot A2).
var MOTS_DOSSIER = {
    mauvaisNiveau: {
        titre: 'Dossier à choisir de nouveau',
        texte: 'Choisis le dossier qui contient « trimestres » (la racine de tes archives), ' +
               'pas « trimestres » lui-même ni le dossier d\'une archive.'
    }
};

/**
 * Lot A2 : le dossier choisi est-il « trimestres », « travaux », ou le dossier d'une archive
 * (il contient meta.json ou donnees.json) ? Tout autre dossier est accepté : la racine des
 * archives peut porter n'importe quel nom, et peut être vide.
 */
async function _dossierMalChoisi(handle) {
    if (!handle) return false;
    if (handle.name === 'trimestres' || handle.name === 'travaux') return true;
    var temoins = ['meta.json', 'donnees.json'];
    for (var i = 0; i < temoins.length; i++) {
        try {
            await handle.getFileHandle(temoins[i]);
            return true;
        } catch (e) {
            if (!e || e.name !== 'NotFoundError') {
                console.warn('[Reserve] Garde-fou du dossier : lecture échouée', e && e.message || e);
            }
        }
    }
    return false;
}

/**
 * Inspecte l'etat du handle persiste sans demander de permission interactive.
 * Utilise par l'UI pour afficher un statut.
 *
 * @returns {Promise<{supporte: boolean, persiste: boolean, nom: string, permission: string}>}
 */
async function _statutHandleReserve() {
    var statut = { supporte: _supporteFSAPI(), persiste: false, nom: '', permission: 'inconnu', handle: null };
    if (!statut.supporte) return statut;
    // Lot A2 : le dossier de cette page compte aussi. Avant, seul le persisté était lu, et le
    // champ `handle` que l'écran « Archives » lisait n'existait pas : il disait toujours
    // « Aucun dossier d'archives n'est actuellement lié » (mesuré à la porte du lot A1).
    var persiste = await _lireHandlePersiste();
    var h = persiste || _handleSession;
    if (!h) return statut;
    statut.persiste = !!persiste;
    statut.handle = h;
    statut.nom = h.name || '';
    if (typeof h.queryPermission === 'function') {
        try {
            statut.permission = await h.queryPermission({ mode: 'readwrite' });
        } catch (e) {
            statut.permission = 'erreur';
        }
    }
    return statut;
}

/* ===============================
   UTILITAIRES
   =============================== */

/**
 * La taille, telle que tout l'écran des archives la dit (une seule fonction : reserve-trimestre,
 * -verifier, -reglages et -renvoyer s'en servent). Virgule décimale (« 1,08 Go », « 80,0 Ko »),
 * décision de Grégoire du 5 oct. 2026 (mots d'E3).
 */
function _formaterTaille(octets) {
    if (!octets) return '0 o';
    var texte;
    if (octets < 1024) texte = octets + ' o';
    else if (octets < 1024 * 1024) texte = (octets / 1024).toFixed(1) + ' Ko';
    else if (octets < 1024 * 1024 * 1024) texte = (octets / (1024 * 1024)).toFixed(1) + ' Mo';
    else texte = (octets / (1024 * 1024 * 1024)).toFixed(2) + ' Go';
    return texte.replace('.', ',');
}

function _normaliserGroupe(g) {
    return String(g || '').padStart(5, '0');
}

function _yield() {
    return new Promise(function(resolve) {
        requestAnimationFrame(function() { setTimeout(resolve, 0); });
    });
}

function _identifierAppareil() {
    var ua = navigator.userAgent;
    if (/iPad/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document)) return 'iPad — Safari';
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) return 'Mac — Chrome';
    if (/Edg/.test(ua)) return 'Mac — Edge';
    if (/Safari/.test(ua)) return 'Mac — Safari';
    if (/Firefox/.test(ua)) return 'Mac — Firefox';
    return navigator.platform || 'Inconnu';
}

function _versionApp() {
    return typeof window.VERSION_MAJEURE === 'string' ? window.VERSION_MAJEURE : 'inconnue';
}

function _genererUUIDv4() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Fallback (Safari < 15.4) — génération RFC 4122 v4
    var hex = '0123456789abcdef';
    var s = '';
    for (var i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            s += '-';
        } else if (i === 14) {
            s += '4';
        } else if (i === 19) {
            s += hex[(Math.random() * 4 | 0) + 8];
        } else {
            s += hex[Math.random() * 16 | 0];
        }
    }
    return s;
}

/**
 * Calcule le hash SHA-256 d'une chaine JSON, en hexadecimal.
 * Cf. SKILL_Securite_donnees §4.3 : chaque archive Archives doit inclure
 * un hash SHA-256 de donnees.json dans meta.json pour permettre la detection
 * de corruption (disque, transfert, modification accidentelle).
 * @param {string} jsonStr - La chaine a hasher
 * @returns {Promise<string|null>} hex string ou null si crypto.subtle indispo
 */
async function _calculerSHA256(jsonStr) {
    if (typeof crypto === 'undefined' || !crypto.subtle) return null;
    try {
        var encoder = new TextEncoder();
        var data = encoder.encode(jsonStr);
        var hashBuffer = await crypto.subtle.digest('SHA-256', data);
        var hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    } catch (e) {
        console.warn('[Archives] Calcul SHA-256 échoué :', e.message || e);
        return null;
    }
}

/**
 * Lot A1 (30 sept. 2026) : l'empreinte SHA-256 d'UNE copie, en hexadécimal. C'est elle qui
 * permettra de vérifier l'archive copie par copie (lot A2), dans les deux modes : le CRC du
 * ZIP n'existe pas en mode dossier, et « Ouvrir une archive… » ne le contrôle pas.
 * La copie est lue en entier, une à la fois, et son tampon est rendu aussitôt : la mémoire
 * prise est celle de la plus grosse copie, pas celle du groupe.
 * Une copie illisible n'est pas avalée : l'erreur remonte, et le groupe n'est pas archivé.
 * @param {Blob} blob
 * @returns {Promise<string|null>} null si `crypto.subtle` est indisponible
 */
async function _empreinteDeLaCopie(blob) {
    if (typeof crypto === 'undefined' || !crypto.subtle) return null;
    var tampon = await blob.arrayBuffer();
    var condense = await crypto.subtle.digest('SHA-256', tampon);
    // Rendre le tampon tout de suite : laissés au ramasse-miettes, ils s'empilent (lot J0).
    if (typeof tampon.transfer === 'function') tampon.transfer(0);
    return Array.from(new Uint8Array(condense)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
}

function _codeCoursCourt(codeCours) {
    // Extrait le préfixe numérique (ex. "601-101" depuis "601-101-MQ")
    var m = String(codeCours || '').match(/^(\d{3}-\d{3})/);
    return m ? m[1] : (codeCours || 'cours');
}

/**
 * Cherche un code de cours (NNN-NNN ou NNN-NNN-XX) dans une chaîne libre.
 * Utilisé en fallback quand l'entité `cours` globale ne résout pas le `coursId`
 * du groupe-cours (cas des trimestres archivés dont le cours d'origine a été
 * remplacé). Le `nom` du groupe-cours contient en général le code du cours.
 *
 * Le pattern doit être précédé soit du début de chaîne, soit d'un caractère
 * non-numérique. Sans cette ancre, sur "A2025-601-101-MQ-00001" la regex
 * attraperait "025-601" en partant de la position 2.
 */
function _extraireCodeCoursDepuisChaine(s) {
    var m = String(s || '').match(/(?:^|[^0-9])(\d{3}-\d{3}(?:-[A-Z]{2})?)/);
    return m ? m[1] : '';
}

function _dateAujourdhui() {
    var now = new Date();
    var pad = function(n) { return String(n).padStart(2, '0'); };
    return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
}

function _extensionDepuisNomFichier(nomFichier) {
    var base = String(nomFichier || '').split('.');
    if (base.length < 2) return 'bin';
    return base.pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
}

/* ===============================
   PROGRESSION (délégué à window.afficherProgression)
   =============================== */

function _prog() {
    if (typeof window.majProgression === 'function') {
        window.majProgression.apply(null, arguments);
    }
}
function _progShow(titre) {
    if (typeof window.afficherProgression === 'function') {
        window.afficherProgression(titre);
    }
}
function _progHide() {
    if (typeof window.masquerProgression === 'function') {
        window.masquerProgression();
    }
}

/* ===============================
   RÉSOLUTION DU GROUPE-COURS
   =============================== */

/**
 * Trouve une entrée groupe-cours pour un trimestre + groupeCoursId donnés.
 * Cherche d'abord dans la clé Beta 95.2 ({trimestre}_groupesCours), puis
 * dans listeCours (legacy).
 *
 * @returns {Object|null} { id, coursId, groupe, codeCours, nomCours, source }
 */
function _resoudreGroupeCours(trimestre, groupeCoursId) {
    // Beta 95.2 : groupes-cours namespacés
    var groupesCours = db.getSync(trimestre + '_groupesCours', null);
    if (Array.isArray(groupesCours)) {
        var gc = groupesCours.find(function(g) { return g.id === groupeCoursId; });
        if (gc) {
            var coursTous = db.getSync('cours', []) || [];
            var c = coursTous.find(function(x) { return x.id === gc.coursId; }) || {};
            // Fallback : si le cours d'origine a disparu de la bibliothèque
            // (trimestre archivé, cours renommé/supprimé), extraire le code
            // depuis le nom du groupe-cours, qui contient typiquement
            // « A2025-601-101-MQ-00001 ... ».
            var codeCoursResolu = c.codeCours
                || _extraireCodeCoursDepuisChaine(gc.nom)
                || '';
            return {
                id: gc.id,
                coursId: gc.coursId,
                groupe: _normaliserGroupe(gc.groupeNum),
                codeCours: codeCoursResolu,
                nomCours: c.nomCours || '',
                source: 'groupe-cours'
            };
        }
    }

    // Legacy : listeCours
    var listeCours = db.getSync('listeCours', []) || [];
    var lc = listeCours.find(function(x) { return x.id === groupeCoursId; });
    if (lc) {
        return {
            id: lc.id,
            coursId: lc.coursId || lc.id,
            groupe: _normaliserGroupe(lc.groupe),
            codeCours: lc.codeCours || lc.sigle || '',
            nomCours: lc.nomCours || lc.titre || '',
            source: 'liste-cours'
        };
    }

    return null;
}

function _nomDossier(trimestre, gc) {
    return trimestre + '-' + _codeCoursCourt(gc.codeCours) + '-gr' + _normaliserGroupe(gc.groupe);
}

/* ===============================
   COLLECTE DES DONNÉES (deux passes)
   =============================== */

/**
 * Collecte les clés et données nécessaires à l’archive.
 * Renvoie un objet { donnees, fichiers, stats }.
 *
 * @param {string} trimestre
 * @param {Object} gc - Résultat de _resoudreGroupeCours
 * @param {Function} onProg - callback(percent, msg, detail)
 */
async function _collecterDonnees(trimestre, gc, onProg) {
    var prefixe = trimestre + '_';
    var groupeCoursId = gc.id;
    var donnees = {};
    var clesInconnues = [];

    onProg(5, 'Inventaire des clés…', '');
    var toutesCles = await db.keys();

    // PASSE 1 — préfixe trimestre
    var clesTrimestre = toutesCles.filter(function(k) {
        if (k.startsWith('_codex_') || k.startsWith('_')) return false;
        return k.startsWith(prefixe);
    });

    // 1) groupeEtudiants → filtrer par numéro de groupe ; en extraire la liste de DA
    var cleEtudiants = prefixe + 'groupeEtudiants';
    var etudiantsTous = db.getSync(cleEtudiants, []) || [];
    if (!Array.isArray(etudiantsTous)) etudiantsTous = [];

    // Filtrer démo + appartenance au groupe ciblé
    var groupeCible = _normaliserGroupe(gc.groupe);
    var etudiantsFiltres = etudiantsTous
        .filter(function(e) {
            if (typeof window.estRessourceDemo === 'function' && window.estRessourceDemo(e, 'etudiant')) return false;
            return _normaliserGroupe(e.groupe) === groupeCible;
        });

    var dasDuGroupe = new Set(etudiantsFiltres.map(function(e) { return String(e.da || ''); }));

    if (etudiantsFiltres.length > 0) {
        donnees[cleEtudiants] = etudiantsFiltres;
    }

    onProg(15, 'Étudiants filtrés', etudiantsFiltres.length + ' / ' + etudiantsTous.length);
    await _yield();

    // 2) Pré-traiter fichiersTravaux pour que annotationsTravaux puisse s'y référer.
    //    L'ordre retourné par db.keys() n'est pas garanti.
    var cleFichiers = prefixe + 'fichiersTravaux';
    if (clesTrimestre.indexOf(cleFichiers) !== -1) {
        var fichiersBruts = await db.get(cleFichiers, null);
        if (Array.isArray(fichiersBruts)) {
            var fichiersFiltresPre = fichiersBruts.filter(function(f) {
                return f && f.groupeCoursId === groupeCoursId;
            });
            if (fichiersFiltresPre.length > 0) {
                donnees[cleFichiers] = fichiersFiltresPre;
            }
        }
    }

    // 3) Itérer les autres clés du trimestre
    for (var i = 0; i < clesTrimestre.length; i++) {
        var cleComplete = clesTrimestre[i];

        // Reporter le progres a chaque iteration (avant les `continue` dans
        // les branches connues). Avant : le bloc onProg etait dans la branche
        // « cle inconnue » uniquement, donc seules les cles inconnues
        // declenchaient le callback. Pour un trimestre avec 0 cle inconnue,
        // l'utilisateur voyait la barre figee. (M4)
        if (i % 5 === 0) {
            onProg(15 + Math.round((i / clesTrimestre.length) * 15),
                'Lecture des données…',
                (i + 1) + ' / ' + clesTrimestre.length + ' clés');
            await _yield();
        }

        if (cleComplete === cleEtudiants) continue; // déjà traité (étape 1)
        if (cleComplete === cleFichiers) continue;  // déjà traité (étape 2)

        var nomCourt = cleComplete.substring(prefixe.length);
        var valeur = await db.get(cleComplete, null);
        if (valeur === null || valeur === undefined) continue;

        // Snapshots : namespace par groupe-cours dans le suffixe de clé
        if (nomCourt.indexOf('snapshots_') === 0) {
            var suffixe = nomCourt.substring('snapshots_'.length);
            if (suffixe === groupeCoursId) {
                donnees[cleComplete] = valeur;
            }
            continue;
        }

        // Clés à filtrer par groupeCoursId (tableau d'entrées)
        if (CLES_FILTRER_PAR_GC.indexOf(nomCourt) !== -1) {
            if (Array.isArray(valeur)) {
                var entreesGc = valeur.filter(function(item) {
                    return item && item.groupeCoursId === groupeCoursId;
                });
                if (entreesGc.length > 0) donnees[cleComplete] = entreesGc;
            }
            continue;
        }

        // annotationsTravaux : filtrage par fichierId (les fichiers de ce groupe)
        // Doit s'exécuter APRÈS le traitement de fichiersTravaux pour avoir la liste.
        if (nomCourt === 'annotationsTravaux') {
            if (Array.isArray(valeur)) {
                var fichiersFiltresPourAnnotations = donnees[prefixe + 'fichiersTravaux'] || [];
                var idsFichiersDuGroupe = new Set(
                    fichiersFiltresPourAnnotations.map(function(f) { return f.id; })
                );
                if (idsFichiersDuGroupe.size > 0) {
                    var annotationsFiltrees = valeur.filter(function(a) {
                        return a && idsFichiersDuGroupe.has(a.fichierId);
                    });
                    if (annotationsFiltrees.length > 0) {
                        donnees[cleComplete] = annotationsFiltrees;
                    }
                }
                // Si aucun fichier dans le groupe → aucune annotation à archiver
            }
            continue;
        }

        // Clés à filtrer par DA
        if (CLES_FILTRER_PAR_DA.indexOf(nomCourt) !== -1) {
            if (Array.isArray(valeur)) {
                var entreesFiltrees = valeur.filter(function(item) {
                    if (!item) return false;
                    var da = String(item.da || item.etudiantDA || '');
                    return da !== '' && dasDuGroupe.has(da);
                });
                if (entreesFiltrees.length > 0) {
                    donnees[cleComplete] = entreesFiltrees;
                }
            } else if (valeur && typeof valeur === 'object') {
                // Forme objet indexé par DA : { '1234567': {...} }
                var sousObjet = {};
                var conserve = false;
                Object.keys(valeur).forEach(function(k) {
                    if (dasDuGroupe.has(String(k))) {
                        sousObjet[k] = valeur[k];
                        conserve = true;
                    }
                });
                if (conserve) donnees[cleComplete] = sousObjet;
            }
            continue;
        }

        // Clés sans filtre (partagées trimestre)
        if (CLES_SANS_FILTRE.indexOf(nomCourt) !== -1) {
            donnees[cleComplete] = valeur;
            continue;
        }

        // groupesCours : filtrer pour ne garder que l'entité du groupe ciblé
        if (nomCourt === 'groupesCours') {
            if (Array.isArray(valeur)) {
                var entiteGc = valeur.filter(function(g) { return g && g.id === groupeCoursId; });
                if (entiteGc.length > 0) donnees[cleComplete] = entiteGc;
            }
            continue;
        }

        // Cartouches namespacés par trimestre archivé : laisser passer (globales du trimestre)
        if (nomCourt.indexOf('cartouches_') === 0) {
            donnees[cleComplete] = valeur;
            continue;
        }

        // Inconnue : inclure sans filtre + warning
        donnees[cleComplete] = valeur;
        clesInconnues.push(nomCourt);
    }

    if (clesInconnues.length > 0) {
        console.warn('[Archives] Clés trimestre non reconnues, incluses sans filtrage :',
            clesInconnues.join(', '));
    }

    // 3) Clés globales (non namespacées)
    onProg(32, 'Clés globales…', '');
    for (var g = 0; g < CLES_GLOBALES_INCLUSES.length; g++) {
        var cg = CLES_GLOBALES_INCLUSES[g];
        var v = await db.get(cg, null);
        if (v !== null && v !== undefined) {
            // Filtrer démo dans les bibliothèques (grilles/échelles retirées en G4 :
            // plus dans ce pass — cf. CLES_GLOBALES_INCLUSES).
            if (cg === 'productionsTemplates' && typeof window.filtrerRessourcesNonDemo === 'function') {
                v = window.filtrerRessourcesNonDemo(v, 'production');
            } else if (cg === 'pratiquesConfigurables' && typeof window.filtrerRessourcesNonDemo === 'function') {
                v = window.filtrerRessourcesNonDemo(v, 'pratique');
            } else if (cg === 'listeCours' && typeof window.filtrerRessourcesNonDemo === 'function') {
                v = window.filtrerRessourcesNonDemo(v, 'cours');
            }
            donnees[cg] = v;
        }
    }

    // 4) Cartouches globales : pattern dynamique cartouches_{grilleId}
    var clesCartouches = toutesCles.filter(function(k) {
        return k.indexOf('cartouches_') === 0;
    });
    for (var cc = 0; cc < clesCartouches.length; cc++) {
        var cval = await db.get(clesCartouches[cc], null);
        if (cval !== null && cval !== undefined) donnees[clesCartouches[cc]] = cval;
    }

    var stats = {
        nombreEtudiants: etudiantsFiltres.length,
        nombreCles: Object.keys(donnees).length,
        listeDA: Array.from(dasDuGroupe)
    };

    return { donnees: donnees, stats: stats };
}

/* ===============================
   COLLECTE DES BLOBS TRAVAUX
   =============================== */

async function _collecterBlobs(donnees, trimestre, onProg) {
    var cleFichiers = trimestre + '_fichiersTravaux';
    var fichiers = donnees[cleFichiers];
    if (!Array.isArray(fichiers) || fichiers.length === 0) {
        return { blobs: [], trouves: 0, manquants: 0, tailleTotale: 0, empreintes: {} };
    }

    if (typeof window.travauxStockage === 'undefined' ||
        typeof window.travauxStockage.recupererBlob !== 'function') {
        console.warn('[Archives] travauxStockage indisponible — aucun blob versé');
        return { blobs: [], trouves: 0, manquants: fichiers.length, tailleTotale: 0, empreintes: {} };
    }

    var blobs = [];
    var manquants = 0;
    var tailleTotale = 0;
    // Lot A1 : nom du fichier sous `travaux/` → empreinte SHA-256. Un même nom cité deux
    // fois : la dernière copie l'emporte, comme dans le fichier.
    var empreintes = {};

    for (var j = 0; j < fichiers.length; j++) {
        var f = fichiers[j];
        var blob = null;
        try {
            blob = await window.travauxStockage.recupererBlob(f.id);
            if (!blob) {
                manquants++;
                console.warn('[Archives] Blob introuvable pour ' + f.id);
            }
        } catch (e) {
            manquants++;
            console.warn('[Archives] Erreur récupération blob ' + f.id, e.message || e);
        }
        if (blob) {
            var ext = _extensionDepuisNomFichier(f.nomFichier);
            // JSZip acceptait aussi un tampon d'octets : on l'enveloppe, pour ne pas perdre
            // une copie qui ne serait pas stockée en Blob.
            if (!(blob instanceof Blob)) blob = new Blob([blob]);
            // Hors du try : une copie présente mais illisible fait échouer l'archivage, comme
            // avant le lot (JSZip échouait à la lire) ; elle n'est pas comptée « manquante ».
            empreintes[f.id + '.' + ext] = await _empreinteDeLaCopie(blob);
            blobs.push({ id: f.id, ext: ext, blob: blob });
            tailleTotale += blob.size || 0;
        }

        if (j % 5 === 0) {
            onProg(40 + Math.round((j / fichiers.length) * 30),
                'Collecte des fichiers travaux…',
                blobs.length + ' / ' + fichiers.length + ' (' + _formaterTaille(tailleTotale) + ')');
            await _yield();
        }
    }

    return {
        blobs: blobs,
        trouves: blobs.length,
        manquants: manquants,
        tailleTotale: tailleTotale,
        empreintes: empreintes
    };
}

/* ===============================
   API : ESTIMATION
   =============================== */

async function estimerVersement(trimestre, groupeCoursId) {
    var gc = _resoudreGroupeCours(trimestre, groupeCoursId);
    if (!gc) {
        return { erreur: 'Groupe-cours introuvable', nombreCles: 0, nombreEtudiants: 0, nombreFichiers: 0, tailleEstimee: 0 };
    }

    var prefixe = trimestre + '_';
    var groupeCible = _normaliserGroupe(gc.groupe);
    var toutesCles = await db.keys();
    var clesTrimestre = toutesCles.filter(function(k) { return k.startsWith(prefixe); });

    // Étudiants
    var etudiantsTous = db.getSync(prefixe + 'groupeEtudiants', []) || [];
    var etudiantsFiltres = etudiantsTous.filter(function(e) {
        if (typeof window.estRessourceDemo === 'function' && window.estRessourceDemo(e, 'etudiant')) return false;
        return _normaliserGroupe(e.groupe) === groupeCible;
    });

    // Fichiers travaux
    var fichiers = db.getSync(prefixe + 'fichiersTravaux', []) || [];
    var fichiersFiltres = fichiers.filter(function(f) { return f && f.groupeCoursId === groupeCoursId; });
    var tailleTravaux = fichiersFiltres.reduce(function(somme, f) { return somme + (f.tailleFichier || 0); }, 0);

    return {
        nombreCles: clesTrimestre.length,
        nombreEtudiants: etudiantsFiltres.length,
        nombreFichiers: fichiersFiltres.length,
        tailleEstimee: tailleTravaux,
        gc: gc,
        dossier: _nomDossier(trimestre, gc)
    };
}

/* ===============================
   API : LISTAGE DES GROUPES VERSABLES
   =============================== */

function listerGroupesVersables(trimestre) {
    var trimestreId = trimestre;
    if (!trimestreId) {
        trimestreId = (typeof window.obtenirTrimestreId === 'function') ? window.obtenirTrimestreId() : '';
    }
    if (!trimestreId) return [];

    var resultats = [];

    // Beta 95.2 : groupesCours
    var groupesCours = db.getSync(trimestreId + '_groupesCours', []) || [];
    if (Array.isArray(groupesCours) && groupesCours.length > 0) {
        var coursTous = db.getSync('cours', []) || [];
        groupesCours.forEach(function(gc) {
            var c = coursTous.find(function(x) { return x.id === gc.coursId; }) || {};
            var codeCoursResolu = c.codeCours
                || _extraireCodeCoursDepuisChaine(gc.nom)
                || '';
            var info = {
                id: gc.id,
                coursId: gc.coursId,
                cours: codeCoursResolu,
                nomCours: c.nomCours || '',
                groupe: _normaliserGroupe(gc.groupeNum),
                source: 'groupe-cours'
            };
            // Lot A2 : `_nomDossier` lit `codeCours`, que `info` nomme `cours` ; le champ rendait
            // « a2026-cours-gr00007 » (sans lecteur jusqu'à « Vérifier », qui s'en sert pour la couverture).
            info.dossier = _nomDossier(trimestreId, { codeCours: info.cours, groupe: info.groupe });
            resultats.push(info);
        });
        return resultats;
    }

    // Legacy : listeCours
    var listeCours = db.getSync('listeCours', []) || [];
    if (typeof window.filtrerRessourcesNonDemo === 'function') {
        listeCours = window.filtrerRessourcesNonDemo(listeCours, 'cours');
    }
    listeCours.forEach(function(lc) {
        var info = {
            id: lc.id,
            coursId: lc.coursId || lc.id,
            cours: lc.codeCours || lc.sigle || '',
            nomCours: lc.nomCours || lc.titre || '',
            groupe: _normaliserGroupe(lc.groupe),
            source: 'liste-cours'
        };
        info.dossier = _nomDossier(trimestreId, { codeCours: info.cours, groupe: info.groupe });
        resultats.push(info);
    });

    return resultats;
}

/* ===============================
   ECRITURE DIRECTE FSAPI (Chrome/Edge)
   =============================== */

async function _ecrireFichierTexte(dossierHandle, nomFichier, contenu) {
    var fh = await dossierHandle.getFileHandle(nomFichier, { create: true });
    var w = await fh.createWritable();
    try {
        await w.write(contenu);
        await w.close();
    } catch (e) {
        try { await w.abort(); } catch (_) { /* ignore */ }
        throw e;
    }
}

async function _ecrireFichierBlob(dossierHandle, nomFichier, blob) {
    var fh = await dossierHandle.getFileHandle(nomFichier, { create: true });
    var w = await fh.createWritable();
    try {
        await w.write(blob);
        await w.close();
    } catch (e) {
        try { await w.abort(); } catch (_) { /* ignore */ }
        throw e;
    }
}

/**
 * Ecrit une archive complet directement dans le dossier reserve.
 *
 * Atomicite partielle (acceptee, voir BACKLOG #253) : si l'ecriture est
 * interrompue, l’archive sur disque peut etre incomplet. Pour permettre
 * la detection, meta.json est ecrit en DERNIER (sentinelle de completude) :
 * sa presence garantit que les autres fichiers du dossier sont
 * entierement ecrits. Le manifeste global est fusionne ensuite (voir
 * _fusionnerManifesteGlobal). Les blobs orphelins (un fichier supprime
 * entre archives) restent en place et doivent etre purges manuellement.
 *
 * E3 (#1024, 5 oct. 2026) : avec `options.mettreDeCote` (l'archive d'un trimestre entier), les
 * copies d'une archive précédente que celle-ci ne range plus sont DÉPLACÉES dans un dossier
 * frère `hors-archive-<date>/`, jamais effacées : « Vérifier » ne les dit plus « en trop » (et
 * « Renvoyer aux archives » devient possible), et rien ne se perd (règle du 20 sept.).
 */
async function _ecrireVersementDirect(handleRacine, dossier, donnees, meta, patch, blobs, onProg, options) {
    var dossierTrim = await handleRacine.getDirectoryHandle('trimestres', { create: true });
    var dossierVersement = await dossierTrim.getDirectoryHandle(dossier, { create: true });
    var dossierTravaux = await dossierVersement.getDirectoryHandle('travaux', { create: true });

    onProg(73, 'Écriture des données…', dossier);
    await _ecrireFichierTexte(dossierVersement, 'donnees.json', JSON.stringify(donnees, null, 0));

    for (var i = 0; i < blobs.length; i++) {
        var entree = blobs[i];
        await _ecrireFichierBlob(dossierTravaux, entree.id + '.' + entree.ext, entree.blob);
        if (i % 5 === 0 || i === blobs.length - 1) {
            var p = 75 + Math.round((i / Math.max(blobs.length, 1)) * 18);
            onProg(p, 'Écriture des travaux…', (i + 1) + ' / ' + blobs.length);
            await _yield();
        }
    }

    if (options && options.mettreDeCote) {
        await _mettreDeCoteLesAnciennes(dossierVersement, dossierTravaux, blobs, meta && meta.date_archive);
    }

    onProg(94, 'Écriture des fichiers…', '');
    await _ecrireFichierTexte(dossierVersement, 'manifeste-archives-patch.json', JSON.stringify(patch, null, 2));

    // Sentinelle de completude : meta.json en dernier
    onProg(96, 'Finalisation…', '');
    await _ecrireFichierTexte(dossierVersement, 'meta.json', JSON.stringify(meta, null, 2));

    return { cheminDossier: 'trimestres/' + dossier + '/' };
}

/**
 * E3 (#1024) : déplace hors de travaux/ les copies que cette archive ne range pas (celles d'une
 * archive précédente du même dossier), dans `hors-archive-<date>/`. Copie, relue à sa taille,
 * PUIS retrait de l'original. Les fichiers du système (`.DS_Store`…) restent où ils sont.
 * @returns {Promise<number>} le nombre de copies mises de côté
 */
async function _mettreDeCoteLesAnciennes(dossierVersement, dossierTravaux, blobs, dateArchive) {
    var gardees = {};
    blobs.forEach(function(b) { gardees[b.id + '.' + b.ext] = true; });
    var aDeplacer = [];
    for await (var paire of dossierTravaux.entries()) {
        var nom = paire[0];
        if (!paire[1] || paire[1].kind !== 'file' || gardees[nom]) continue;
        if (nom.charAt(0) === '.' || nom === 'Thumbs.db' || nom === 'desktop.ini') continue;
        aDeplacer.push(paire[1]);
    }
    if (!aDeplacer.length) return 0;
    var date = String(dateArchive || new Date().toISOString()).slice(0, 19).replace(/[:T]/g, '-');
    var cote = await dossierVersement.getDirectoryHandle('hors-archive-' + date, { create: true });
    for (var i = 0; i < aDeplacer.length; i++) {
        var fichier = await aDeplacer[i].getFile();
        await _ecrireFichierBlob(cote, aDeplacer[i].name, fichier);
        var relu = await (await cote.getFileHandle(aDeplacer[i].name)).getFile();
        if (relu.size !== fichier.size) throw new Error('Copie mise de côté incomplète : ' + aDeplacer[i].name);
        await dossierTravaux.removeEntry(aDeplacer[i].name);
    }
    return aDeplacer.length;
}

/**
 * Lit, met a jour et reecrit manifeste-archives.json a la racine du dossier
 * reserve. Cree le manifeste si absent. Idempotent : un re-archivage du meme
 * groupe-cours ecrase l'entree precedente (nouveau UUID, nouvelle date).
 */
async function _fusionnerManifesteGlobal(handleRacine, dossier, patchEntry) {
    var manifeste = {
        format: 'manifeste-archives',
        version: 1,
        archives: {},
        derniere_mise_a_jour: null
    };

    try {
        var fhLecture = await handleRacine.getFileHandle('manifeste-archives.json');
        var fichier = await fhLecture.getFile();
        var texte = await fichier.text();
        var existant = JSON.parse(texte);
        if (existant && typeof existant === 'object') {
            manifeste = Object.assign(manifeste, existant);
            if (!manifeste.archives || typeof manifeste.archives !== 'object') {
                manifeste.archives = {};
            }
        }
    } catch (e) {
        if (e.name !== 'NotFoundError') {
            console.warn('[Reserve] Lecture manifeste-archives.json echouee, recreation', e.message || e);
        }
    }

    manifeste.archives[dossier] = patchEntry;
    manifeste.derniere_mise_a_jour = new Date().toISOString();

    await _ecrireFichierTexte(handleRacine, 'manifeste-archives.json', JSON.stringify(manifeste, null, 2));
}

/* ===============================
   MANIFESTE LOCAL (cross-mode FSAPI + ZIP Safari)
   ===============================
   Une seule clé db non namespacée (`_manifesteReserve`) qui agrège
   l'historique de TOUS les archives faits depuis cette installation,
   peu importe le mode (FSAPI ou ZIP). Hydratable depuis le manifeste
   FSAPI quand un dossier est lié.
*/

function _manifesteSkeleton() {
    return {
        format: 'manifeste-archives-local',
        version: 1,
        archives: {},
        derniere_mise_a_jour: null
    };
}

function _lireManifesteLocal() {
    if (typeof window.db === 'undefined' || typeof window.db.getSync !== 'function') {
        return _manifesteSkeleton();
    }
    var brut = window.db.getSync(CLE_MANIFESTE_LOCAL, null);
    if (!brut || typeof brut !== 'object') return _manifesteSkeleton();
    var m = Object.assign(_manifesteSkeleton(), brut);
    if (!m.archives || typeof m.archives !== 'object') m.archives = {};
    return m;
}

function _ecrireManifesteLocal(manifeste) {
    if (typeof window.db === 'undefined' || typeof window.db.setSync !== 'function') return;
    window.db.setSync(CLE_MANIFESTE_LOCAL, manifeste);
}

function _upsertEntreeManifesteLocal(dossier, patchEntry) {
    var m = _lireManifesteLocal();
    m.archives[dossier] = patchEntry;
    m.derniere_mise_a_jour = new Date().toISOString();
    _ecrireManifesteLocal(m);
    _notifierReglagesSiPresent();
    return m;
}

function _notifierReglagesSiPresent() {
    if (window.ReserveReglages && typeof window.ReserveReglages.rafraichir === 'function') {
        try { window.ReserveReglages.rafraichir(); } catch (e) { /* silent */ }
    }
    // #251 : notifier la carte « Codex data » pour rafraîchir le compteur d'archives
    try {
        window.dispatchEvent(new CustomEvent('codex-data-manifeste-change'));
    } catch (e) { /* silent */ }
}

function _purgerEntreeManifesteLocal(dossier) {
    var m = _lireManifesteLocal();
    if (!m.archives[dossier]) return m;
    delete m.archives[dossier];
    m.derniere_mise_a_jour = new Date().toISOString();
    _ecrireManifesteLocal(m);
    _notifierReglagesSiPresent();
    return m;
}

/**
 * Fusionne un manifeste reçu (objet { archives: { dossier: entry } })
 * dans le manifeste local. Garde l'entrée la plus récente par
 * `date_archive`. Idempotent.
 *
 * @returns {{ ajoutes: number, mis_a_jour: number, total: number }}
 */
function _fusionnerManifesteRecu(recu) {
    var stats = { ajoutes: 0, mis_a_jour: 0, total: 0 };
    if (!recu || !recu.archives || typeof recu.archives !== 'object') return stats;

    var m = _lireManifesteLocal();
    Object.keys(recu.archives).forEach(function(dossier) {
        var entreeRecue = recu.archives[dossier];
        var entreeLocale = m.archives[dossier];
        stats.total++;
        if (!entreeLocale) {
            m.archives[dossier] = entreeRecue;
            stats.ajoutes++;
        } else {
            var dRecue = entreeRecue && entreeRecue.date_archive;
            var dLocale = entreeLocale && entreeLocale.date_archive;
            if (dRecue && (!dLocale || dRecue > dLocale)) {
                m.archives[dossier] = entreeRecue;
                stats.mis_a_jour++;
            }
        }
    });

    if (stats.ajoutes || stats.mis_a_jour) {
        m.derniere_mise_a_jour = new Date().toISOString();
        _ecrireManifesteLocal(m);
        _notifierReglagesSiPresent();
    }
    return stats;
}

/**
 * Hydrate le manifeste local depuis le manifeste-archives.json du dossier
 * FSAPI lié. Idempotent.
 */
async function _hydrateManifesteDepuisFSAPI(handleRacine) {
    var stats = { ajoutes: 0, mis_a_jour: 0, total: 0 };
    if (!handleRacine) return stats;

    var existant = null;
    try {
        var fh = await handleRacine.getFileHandle('manifeste-archives.json');
        var fichier = await fh.getFile();
        var texte = await fichier.text();
        existant = JSON.parse(texte);
    } catch (e) {
        if (e && e.name !== 'NotFoundError') {
            console.warn('[Reserve] Hydratation manifeste FSAPI : lecture échouée', e.message || e);
        }
        return stats;
    }

    return _fusionnerManifesteRecu(existant);
}

/* ===============================
   DÉPÔT D'UNE ARCHIVE (commun au groupe-cours et au trimestre entier)
   ===============================
   E1 (#1022, 4 oct. 2026) : l'étape 4 de `verserGroupeCours`, sortie telle quelle pour que
   l'archive d'un trimestre entier (reserve-trimestre.js) passe par le MÊME dépôt : mêmes
   deux modes, même assemblage sans charger les copies en mémoire, même aperçu (défense K),
   même « Il y est » de l'usager, même inscription à la liste. Seuls les mots changent.
*/

/**
 * Écrit l'archive (dossier lié, ou fichier téléchargé) et l'inscrit à la liste.
 * @param {Object} o
 * @param {Object|null} o.handleReserve - le dossier des archives (Chrome), ou null (fichier)
 * @param {string} o.dossier
 * @param {Object} o.donnees - le contenu de donnees.json
 * @param {Object} o.meta - le contenu de meta.json
 * @param {Object} o.patch - { dossier, patch } : l'entrée de la liste
 * @param {Array<{id, ext, blob}>} o.blobs - les copies, par référence
 * @param {Object} o.stats - les comptes rendus à l'appelant (sans la taille du ZIP)
 * @param {boolean} [o.mettreDeCote] - E3 : mode dossier, déplacer les copies d'une archive précédente
 * @param {Object} o.mots - { archive(stats, chemin), telecharge(stats, taille), nonArchive }
 * @returns {Promise<Object|null>} le résultat ; null si l'aperçu est annulé
 */
async function _deposerArchive(o) {
    var dossier = o.dossier;
    var patch = o.patch;
    var mots = o.mots;

    if (o.handleReserve) {
        // === MODE FSAPI : écriture directe ===
        _prog(72, 'Écriture sur disque…', dossier);
        await _yield();

        var ecriture = await _ecrireVersementDirect(
            o.handleReserve, dossier, o.donnees, o.meta, patch, o.blobs, _prog,
            { mettreDeCote: !!o.mettreDeCote }
        );

        _prog(98, 'Mise à jour du manifeste global…', '');
        await _yield();
        try {
            await _fusionnerManifesteGlobal(o.handleReserve, dossier, patch.patch);
        } catch (eFusion) {
            console.warn('[Archives] Fusion manifeste-archives.json échouée, l’archive reste valide :', eFusion.message || eFusion);
        }

        // Manifeste local : toujours mis à jour, même si la fusion FSAPI a échoué
        try { _upsertEntreeManifesteLocal(dossier, patch.patch); }
        catch (eLoc) { console.warn('[Archives] Upsert manifeste local échoué', eLoc.message || eLoc); }

        _prog(100, 'Archivage réussi !', ecriture.cheminDossier);
        await new Promise(function(r) { setTimeout(r, 600); });
        _progHide();

        var nomDossierRacine = o.handleReserve.name || 'Archives';
        var annonce = mots.archive(o.stats, nomDossierRacine + '/' + ecriture.cheminDossier);
        notifications.succes(annonce.titre, annonce.texte);

        return {
            succes: true,
            uuid: patch.patch.uuid,
            dossier: dossier,
            mode: 'fsapi',
            cheminDossier: ecriture.cheminDossier,
            stats: o.stats
        };
    }

    // === MODE ZIP : flux v1 (téléchargement manuel) ===
    _prog(72, 'Construction du ZIP…', dossier);
    await _yield();

    // Manifeste local : l'entrée est CALCULÉE avant la construction du ZIP, pour que
    // le ZIP porte l'historique complet (#248), mais elle n'est INSCRITE à la liste
    // qu'une fois le fichier confirmé par l'usager (lot F, D0, puis lot A1 : un échec ne
    // se déguise pas en réussite). Avant, un aperçu annulé ou une compression échouée
    // laissait l'archive listée sans qu'aucun fichier n'existe (mesuré sous Safari).
    // Copie de `archives` : la lecture rend l'objet du cache mémoire, qu'il ne faut pas muter.
    var manifesteLocal = _lireManifesteLocal();
    manifesteLocal.archives = Object.assign({}, manifesteLocal.archives);
    manifesteLocal.archives[dossier] = patch.patch;
    manifesteLocal.derniere_mise_a_jour = new Date().toISOString();

    var zip = new JSZip();
    var dossierBase = zip.folder('trimestres').folder(dossier);

    dossierBase.file('donnees.json', JSON.stringify(o.donnees, null, 0));

    // Lot A1 : les copies ne sont plus confiées à JSZip, qui les lisait toutes en mémoire
    // (mesuré : 3,4 Go pour 607 Mo de copies). On n'en garde que la référence ;
    // `FichierSortant.assemblerZip` les range telles quelles, comme pour le codex (lot J0).
    dossierBase.folder('travaux');
    var cheminTravaux = 'trimestres/' + dossier + '/travaux/';
    var copies = [];
    var rangDeLaCopie = {};
    for (var b = 0; b < o.blobs.length; b++) {
        var entree2 = o.blobs[b];
        // Un même nom déposé deux fois : le dernier l'emporte, à la place du premier
        // (ce que faisait JSZip).
        var nomEntree = cheminTravaux + entree2.id + '.' + entree2.ext;
        if (Object.prototype.hasOwnProperty.call(rangDeLaCopie, nomEntree)) {
            copies[rangDeLaCopie[nomEntree]].blob = entree2.blob;
        } else {
            rangDeLaCopie[nomEntree] = copies.length;
            copies.push({ nom: nomEntree, blob: entree2.blob });
        }
    }

    dossierBase.file('meta.json', JSON.stringify(o.meta, null, 2));
    dossierBase.file('manifeste-archives-patch.json', JSON.stringify(patch, null, 2));

    // Manifeste local agrégé à la racine du ZIP (sous le nom canonique).
    // Permet à l'utilisateur de retrouver l'historique de tous ses
    // archives précédents dans n'importe quel ZIP récent.
    zip.file('manifeste-archives.json', JSON.stringify(manifesteLocal, null, 2));

    // Ce que le fichier contiendra : les textes et les copies, dans l'ordre d'avant le lot.
    var entreesArchive = window.FichierSortant.entreesDuZip(zip, copies, cheminTravaux);

    // Défense K — valider la structure du ZIP avant compression. Si un
    // payload a tenté d'ajouter une entrée annexe transportant des
    // données identifiantes (cf. MODELE-MENACES.md §X-02), l'export
    // est bloqué ici et l'utilisateur reçoit une alerte claire.
    if (window.SecuriteExportValidation && typeof window.SecuriteExportValidation.validerExportReserve === 'function') {
        window.SecuriteExportValidation.validerExportReserve(entreesArchive);
    }

    // K-β — preview UI avant compression. L'utilisateur peut annuler.
    // On masque l'overlay avant la modale (sinon double affichage)
    // puis on le réaffiche après le clic Télécharger pour montrer la
    // compression. Sans réaffichage, l'utilisateur attend dans le
    // noir pendant l'assemblage.
    if (window.SecuriteExportPreview && typeof window.SecuriteExportPreview.previewZipEtConfirmer === 'function') {
        _progHide();
        var okPreview = await window.SecuriteExportPreview.previewZipEtConfirmer(entreesArchive, 'archive');
        if (!okPreview) {
            return null;
        }
        _progShow('Génération de l\'archive');
    }

    _prog(80, 'Compression du ZIP…', '');
    await _yield();
    var zipBlob = await window.FichierSortant.assemblerZip(zip, copies, function(pourcent) {
        _prog(80 + Math.round(pourcent * 0.18),
            'Compression du ZIP…',
            Math.round(pourcent) + '% compressé');
    });

    // Convention #262 : préfixe `archive-` + dossier + date + extension simple.
    // CONFIDENTIEL- retiré (l'archive est implicitement personnelle).
    var nomFichier = 'archive-' + dossier + '-' + _dateAujourdhui() + EXTENSION_ARCHIVE;

    // Le fichier est assemblé ; il n'est pas encore écrit.
    _prog(100, 'Archive prête !', _formaterTaille(zipBlob.size));
    await new Promise(function(r) { setTimeout(r, 600); });
    _progHide();

    var statsZip = Object.assign({}, o.stats, { tailleZip: zipBlob.size });

    // Lot A1 : le parcours du codex téléchargé (lot G, #988). L'application ne peut pas
    // savoir si un téléchargement s'est terminé : la réussite n'est plus annoncée
    // d'office, c'est l'usager qui dit si le fichier est là. Sans son « Il y est », rien
    // n'entre au registre et l'écran ne dit pas « archivé ». L'adresse du fichier n'est
    // plus libérée aussitôt (`FichierSortant.telecharger`).
    var tailleDite = window.FichierSortant.tailleEnviron(zipBlob.size);
    while (true) {
        window.FichierSortant.telecharger(zipBlob, nomFichier);
        if (await window.FichierSortant.confirmerTelechargement(nomFichier, tailleDite)) break;

        console.warn('[Archives] Téléchargement : fichier non trouvé par l\'usager.');
        var geste = await window.uiDialogues.demanderAction({
            titre: mots.nonArchive,
            message: 'Le fichier (' + tailleDite + ') n\'a pas été enregistré. Tes données restent dans l\'application.',
            actions: [{ valeur: 'reessayer', texte: 'Réessayer', principal: true }]
        });
        if (geste !== 'reessayer') {
            return { succes: false, nonConfirme: true, uuid: patch.patch.uuid, dossier: dossier, nomFichier: nomFichier, mode: 'zip', stats: statsZip };
        }
    }

    // Inscrite à la liste seulement maintenant : le fichier est là, l'usager l'a dit.
    try { _upsertEntreeManifesteLocal(dossier, patch.patch); }
    catch (eLoc) { console.warn('[Archives] Upsert manifeste local échoué', eLoc.message || eLoc); }

    var annonceZip = mots.telecharge(o.stats, _formaterTaille(zipBlob.size));
    notifications.succes(annonceZip.titre, annonceZip.texte);

    return {
        succes: true,
        uuid: patch.patch.uuid,
        dossier: dossier,
        nomFichier: nomFichier,
        mode: 'zip',
        stats: statsZip
    };
}

/** Les mots du dépôt de l'archive d'un groupe-cours (inchangés par E1). */
var MOTS_DEPOT_GROUPE = {
    archive: function(stats, chemin) {
        return { titre: 'Groupe archivé', texte: stats.etudiants + ' étudiant(s), ' + stats.fichiersTrouves + ' fichier(s) : ' + chemin };
    },
    telecharge: function(stats, taille) {
        return { titre: 'Groupe archivé : fichier téléchargé', texte: stats.etudiants + ' étudiant(s), ' + stats.fichiersTrouves + ' fichier(s) (' + taille + ')' };
    },
    nonArchive: 'Groupe non archivé'
};

/* ===============================
   API : VERSEMENT
   =============================== */

async function verserGroupeCours(trimestre, groupeCoursId) {
    var gc = _resoudreGroupeCours(trimestre, groupeCoursId);
    if (!gc) {
        var m = 'Groupe-cours introuvable pour le trimestre ' + trimestre + '.';
        notifications.erreur('Archivage impossible', m);
        throw new Error(m);
    }

    var dossier = _nomDossier(trimestre, gc);
    var uuid = _genererUUIDv4();

    // Detection du mode FSAPI : appel TOT pour preserver le user gesture du clic.
    // Retourne null si non supporte (Safari) ou si l'utilisateur annule le picker.
    var handleReserve;
    try {
        handleReserve = await _obtenirHandleReserve();
    } catch (eDossier) {
        // Lot A2 : le dossier choisi est refusé (mauvais niveau) ; l'usager a été prévenu.
        if (eDossier && eDossier.name === 'DossierRefuse') return null;
        throw eDossier;
    }
    var modeFSAPI = !!handleReserve;

    if (!modeFSAPI && (typeof JSZip === 'undefined' || !window.FichierSortant)) {
        var msgZip = 'Bibliotheque de compression non chargee.';
        notifications.erreur('Erreur', msgZip);
        throw new Error(msgZip);
    }

    _progShow('Création de l’archive');
    _prog(0, modeFSAPI ? 'Mode automatique…' : 'Préparation…', dossier);
    await _yield();

    try {
        // 1. Collecte des données
        var collecte = await _collecterDonnees(trimestre, gc, _prog);
        var donnees = collecte.donnees;
        var statsDonnees = collecte.stats;

        if (statsDonnees.nombreEtudiants === 0 && statsDonnees.nombreCles === 0) {
            _progHide();
            var msgVide = 'Aucune donnée trouvée pour ce groupe-cours dans ' + trimestre + '.';
            notifications.erreur('Archivage vide', msgVide);
            throw new Error(msgVide);
        }

        var tailleJsonDonnees = 0;
        var donneesJsonStr = '';
        try {
            donneesJsonStr = JSON.stringify(donnees);
            tailleJsonDonnees = new Blob([donneesJsonStr]).size;
        } catch (eMes) {
            console.warn('[Archives] Sérialisation JSON échouée:', eMes.message || eMes);
        }

        // Hash SHA-256 du JSON (integrite, cf. SKILL_Securite_donnees §4.3)
        var donneesSha256 = donneesJsonStr ? await _calculerSHA256(donneesJsonStr) : null;

        // 2. Collecte des blobs
        _prog(40, 'Collecte des fichiers travaux…', '');
        await _yield();
        var collecteBlobs = await _collecterBlobs(donnees, trimestre, _prog);

        // Lot A1 : une empreinte par copie, dans les deux modes. Sans `crypto.subtle`, aucune
        // n'a pu être calculée : le champ vaut null, comme celui des données.
        var empreintesCopies = Object.keys(collecteBlobs.empreintes).every(function(n) {
            return !!collecteBlobs.empreintes[n];
        }) ? collecteBlobs.empreintes : null;

        // 3. Construction de meta.json et du patch (commun aux deux modes)
        var dateArchive = new Date().toISOString();
        var meta = {
            uuid: uuid,
            trimestre: trimestre,
            cours: gc.codeCours || '',
            groupe: gc.groupe,
            dossier: dossier,
            statut: 'verse',
            source: 'application (IndexedDB)',
            mode_archive: modeFSAPI ? 'fsapi' : 'zip',
            date_archive: dateArchive,
            appareil: _identifierAppareil(),
            application_version: _versionApp(),
            integrite: {
                donnees_json_sha256: donneesSha256,
                algorithme: donneesSha256 ? 'SHA-256' : null,
                date_calcul: donneesSha256 ? dateArchive : null,
                // Lot A1 : { « <id>.<ext> » (le nom sous travaux/) : SHA-256 en hexadécimal }.
                // Un lecteur d'avant le lot ignore ce champ.
                travaux_sha256: empreintesCopies
            },
            contenu: {
                donnees: true,
                travaux: collecteBlobs.trouves > 0,
                nombre_etudiants: statsDonnees.nombreEtudiants,
                nombre_cles: statsDonnees.nombreCles,
                nombre_fichiers_travaux: collecteBlobs.trouves,
                nombre_fichiers_manquants: collecteBlobs.manquants,
                taille_donnees_json: tailleJsonDonnees,
                taille_travaux_totale: collecteBlobs.tailleTotale
            },
            notes: 'Archivage automatique depuis l’application.'
        };

        var patch = {
            dossier: dossier,
            patch: {
                uuid: uuid,
                trimestre: trimestre,
                cours: gc.codeCours || '',
                nom_cours: gc.nomCours || '',
                groupe: gc.groupe,
                statut: 'verse',
                source: 'application (IndexedDB)',
                mode_archive: meta.mode_archive,
                date_archive: dateArchive,
                donnees: true,
                travaux: collecteBlobs.trouves > 0,
                nombre_etudiants: statsDonnees.nombreEtudiants,
                nombre_fichiers_travaux: collecteBlobs.trouves,
                taille_travaux_totale: collecteBlobs.tailleTotale,
                notes: 'Archivage du ' + _dateAujourdhui() + '.'
            }
        };

        // 4. Le dépôt, commun à l'archive d'un trimestre entier (E1, #1022)
        return await _deposerArchive({
            handleReserve: handleReserve,
            dossier: dossier,
            donnees: donnees,
            meta: meta,
            patch: patch,
            blobs: collecteBlobs.blobs,
            stats: {
                etudiants: statsDonnees.nombreEtudiants,
                cles: statsDonnees.nombreCles,
                fichiersTrouves: collecteBlobs.trouves,
                fichiersManquants: collecteBlobs.manquants,
                tailleTravaux: collecteBlobs.tailleTotale
            },
            mots: MOTS_DEPOT_GROUPE
        });

    } catch (err) {
        _progHide();
        console.error('[Archives] Erreur d’archivage:', err);
        notifications.erreur('Groupe non archivé', err.message || String(err));
        throw err;
    }
}

/* ===============================
   INTERFACE UTILISATEUR — DIALOGUE DE CHOIX
   =============================== */

function _echapper(s) {
    if (typeof window.echapperHtml === 'function') return window.echapperHtml(s);
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function _trimestresAvecDonnees() {
    // Dérive depuis db.keys() — pas de promesse ici, on prend ce que getSync voit.
    var trimestresOnglet = (typeof window.obtenirTrimestres === 'function')
        ? window.obtenirTrimestres()
        : (db.getSync('trimestres', []) || []);
    return trimestresOnglet.filter(function(t) { return t && t.id && t.id !== 'demo'; });
}

function _construireOptionsTrimestres(trimestreParDefaut) {
    var trims = _trimestresAvecDonnees();
    return trims.map(function(t) {
        var sel = (t.id === trimestreParDefaut) ? ' selected' : '';
        return '<option value="' + _echapper(t.id) + '"' + sel + '>' +
            _echapper(t.nom || t.id) + '</option>';
    }).join('');
}

function _construireOptionsGroupes(trimestre, groupeIdParDefaut) {
    var groupes = listerGroupesVersables(trimestre);
    if (groupes.length === 0) {
        return '<option value="">-- Aucun groupe-cours dans ' + _echapper(trimestre) + ' --</option>';
    }
    return groupes.map(function(g) {
        var sel = (g.id === groupeIdParDefaut) ? ' selected' : '';
        var libelle = (g.cours || '???') + ' · gr ' + g.groupe +
            (g.nomCours ? ' — ' + g.nomCours : '');
        return '<option value="' + _echapper(g.id) + '"' + sel + '>' +
            _echapper(libelle) + '</option>';
    }).join('');
}

async function _afficherEstimation() {
    var modal = document.getElementById('modalReserve');
    if (!modal) return;
    var selT = modal.querySelector('#reserve-select-trimestre');
    var selG = modal.querySelector('#reserve-select-groupe');
    var apercu = modal.querySelector('#reserve-apercu');
    if (!selT || !selG || !apercu) return;

    var trimestre = selT.value;
    var groupeId = selG.value;
    if (!trimestre || !groupeId) {
        apercu.innerHTML = '<em>Sélectionne un trimestre et un groupe-cours.</em>';
        return;
    }

    apercu.innerHTML = '<em>Estimation en cours...</em>';

    try {
        var est = await estimerVersement(trimestre, groupeId);
        if (est.erreur) {
            apercu.innerHTML = '<span style="color: var(--rouge);">' + _echapper(est.erreur) + '</span>';
            return;
        }

        apercu.innerHTML =
            '<div><strong>Dossier cible :</strong> <code>' + _echapper(est.dossier) + '</code></div>' +
            '<div><strong>Étudiants :</strong> ' + est.nombreEtudiants + '</div>' +
            '<div><strong>Clés trimestre :</strong> ' + est.nombreCles + '</div>' +
            '<div><strong>Fichiers travaux :</strong> ' + est.nombreFichiers +
                ' (~' + _echapper(_formaterTaille(est.tailleEstimee)) + ')</div>';
    } catch (e) {
        console.warn('[Archives] Erreur estimation:', e);
        apercu.innerHTML = '<span style="color: var(--rouge);">Erreur : ' + _echapper(e.message || e) + '</span>';
    }
}

function _peuplerTrimestres(trimestreParDefaut, groupeIdParDefaut) {
    var modal = document.getElementById('modalReserve');
    if (!modal) return;
    var selT = modal.querySelector('#reserve-select-trimestre');
    var selG = modal.querySelector('#reserve-select-groupe');
    if (!selT || !selG) return;

    selT.innerHTML = _construireOptionsTrimestres(trimestreParDefaut);
    var trimChoisi = selT.value || trimestreParDefaut;
    selG.innerHTML = _construireOptionsGroupes(trimChoisi, groupeIdParDefaut);
}

function _onChangerTrimestre() {
    var modal = document.getElementById('modalReserve');
    if (!modal) return;
    var selT = modal.querySelector('#reserve-select-trimestre');
    var selG = modal.querySelector('#reserve-select-groupe');
    if (!selT || !selG) return;
    selG.innerHTML = _construireOptionsGroupes(selT.value, null);
    _afficherEstimation();
}

function _onChangerGroupe() {
    _afficherEstimation();
}

/**
 * Action déclenchée par le bouton du menu codex.
 * Affiche le dialogue de choix trimestre + groupe.
 */
function actionVerser() {
    // Fermer le menu codex si ouvert (synchroniser flag interne via toggleMenu)
    var menu = document.getElementById('codex-menu');
    if (menu && !menu.classList.contains('u-hide') &&
        window.Codex && typeof window.Codex.toggleMenu === 'function') {
        window.Codex.toggleMenu();
    }

    var modal = document.getElementById('modalReserve');
    if (!modal) {
        console.error('[Archives] Modale #modalReserve introuvable dans le DOM');
        return;
    }

    // Détecter le trimestre et groupe-cours actifs pour pré-sélection
    var trimestreActuel = '';
    if (typeof window.obtenirTrimestreId === 'function') {
        trimestreActuel = window.obtenirTrimestreId();
    }
    var gcActif = db.getSync('groupeCoursActif', null);
    var groupeActifId = gcActif ? gcActif.id : '';

    _peuplerTrimestres(trimestreActuel, groupeActifId);
    _afficherEstimation();
    _majBandeauStatut();  // fire-and-forget : met à jour le bandeau quand prêt

    modal.classList.add('actif');
}

/**
 * Met à jour le bandeau de statut FSAPI dans la modale.
 * Affiche le mode (auto/manuel), l'emplacement du dossier d’archives, et un
 * bouton « Changer le dossier » si applicable.
 */
async function _majBandeauStatut() {
    var modal = document.getElementById('modalReserve');
    if (!modal) return;
    var bandeau = modal.querySelector('#reserve-statut');
    if (!bandeau) return;

    var statut;
    try {
        statut = await _statutHandleReserve();
    } catch (e) {
        console.warn('[Archives] Statut handle échoué', e.message || e);
        statut = { supporte: false, persiste: false, nom: '', permission: 'erreur' };
    }

    var html = '';

    if (!statut.supporte) {
        html =
            '<strong>Mode manuel</strong> (Safari) — un fichier ZIP sera téléchargé. ' +
            'Décompresse-le ensuite dans <code>~/Documents/Archives_LaboCodex/</code> ' +
            'pour compléter l’archive.';
    } else if (!statut.persiste) {
        html =
            '<strong>Mode automatique</strong> (Chrome/Edge) : au premier archivage, ' +
            'choisis le dossier <em>Archives</em> où ranger tes archives. ' +
            'Les suivantes iront automatiquement au même endroit.';
    } else if (statut.permission === 'granted' || statut.permission === 'prompt') {
        html =
            '<strong>Mode automatique</strong> — dossier d’archives&nbsp;: <code>' +
            _echapper(statut.nom) + '</code>' +
            '<button data-action="Reserve.actionChangerDossier" ' +
            'class="btn btn-secondaire u-texte-petit" ' +
            'style="margin-left: 10px; padding: 2px 8px;">' +
            'Changer le dossier...</button>';
    } else {
        html =
            '<strong>Accès au dossier refusé</strong> — archivage par ZIP en attendant. ' +
            '<button data-action="Reserve.actionChangerDossier" ' +
            'class="btn btn-secondaire u-texte-petit" ' +
            'style="margin-left: 10px; padding: 2px 8px;">' +
            'Réessayer</button>';
    }

    bandeau.innerHTML = html;
}

/**
 * Action utilisateur : oublier le handle persisté et redemander un dossier.
 * Doit être déclenchée par un clic (user gesture requis pour showDirectoryPicker).
 */
async function actionChangerDossier() {
    await _supprimerHandlePersiste();
    var nouveau = null;
    try {
        nouveau = await _obtenirHandleReserve();
    } catch (e) {
        if (!e || e.name !== 'DossierRefuse') console.warn('[Reserve] Changement de dossier échoué', e && e.message || e);
    }
    await _majBandeauStatut();
    if (nouveau) {
        notifications.succes('Dossier d’archives mis à jour', nouveau.name || '');
    }
}

function fermerDialogue() {
    var modal = document.getElementById('modalReserve');
    if (!modal) return;
    modal.classList.remove('actif');
}

async function lancerDepuisDialogue() {
    var modal = document.getElementById('modalReserve');
    if (!modal) return;
    var selT = modal.querySelector('#reserve-select-trimestre');
    var selG = modal.querySelector('#reserve-select-groupe');
    if (!selT || !selG) return;

    var trimestre = selT.value;
    var groupeId = selG.value;
    if (!trimestre || !groupeId) {
        notifications.erreur('Sélection incomplète',
            'Choisis un trimestre et un groupe-cours.');
        return;
    }

    fermerDialogue();
    try {
        await verserGroupeCours(trimestre, groupeId);
    } catch (e) {
        // Notifications déjà gérées dans verserGroupeCours
    }
}

/* ===============================
   EXPORTS
   =============================== */

/* ===============================
   INIT : hydratation auto au démarrage
   =============================== */

/**
 * Au boot du module, si un handle FSAPI est persisté avec permission
 * encore accordée (sans prompt), hydrate le manifeste local depuis le
 * manifeste-archives.json du dossier. Idempotent et silencieux : aucun
 * effet si le handle est absent, refusé, ou si le manifeste FSAPI est
 * inaccessible.
 */
async function _initHydratationAuto() {
    try {
        if (!_supporteFSAPI()) return;
        var handle = await _lireHandlePersiste();
        if (!handle || typeof handle.queryPermission !== 'function') return;
        var perm = await handle.queryPermission({ mode: 'read' });
        if (perm !== 'granted') return;
        await _hydrateManifesteDepuisFSAPI(handle);
    } catch (e) {
        console.warn('[Reserve] Hydratation auto échouée', e.message || e);
    }
}

// Différé après le boot pour ne pas bloquer le démarrage
if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
        setTimeout(_initHydratationAuto, 100);
    } else {
        window.addEventListener('load', function() { setTimeout(_initHydratationAuto, 100); });
    }
}

window.Reserve = {
    verserGroupeCours: verserGroupeCours,
    estimerVersement: estimerVersement,
    listerGroupesVersables: listerGroupesVersables,
    actionVerser: actionVerser,
    actionChangerDossier: actionChangerDossier,
    fermerDialogue: fermerDialogue,
    lancerDepuisDialogue: lancerDepuisDialogue,
    onChangerTrimestre: _onChangerTrimestre,
    onChangerGroupe: _onChangerGroupe,
    // FSAPI — exposés pour les modules qui consomment les archives (ex. reserve-ouvrir.js)
    obtenirHandle: _obtenirHandleReserve,
    statutHandle: _statutHandleReserve,
    supporteFSAPI: _supporteFSAPI,
    effacerLiaisonFSAPI: _supprimerHandlePersiste,
    // Manifeste local (#248) — consommé par la section Réglages (#249) et
    // par reserve-ouvrir.js pour l'auto-hydration au chargement d'un ZIP.
    lireManifesteLocal: _lireManifesteLocal,
    upsertEntreeManifeste: _upsertEntreeManifesteLocal,
    fusionnerManifesteRecu: _fusionnerManifesteRecu,
    purgerEntreeManifeste: _purgerEntreeManifesteLocal,
    hydrateDepuisFSAPI: _hydrateManifesteDepuisFSAPI,
    // E1 (#1022) : l'archive d'un trimestre entier (reserve-trimestre.js) passe par le même
    // dépôt et les mêmes empreintes.
    deposerArchive: _deposerArchive,
    formaterTaille: _formaterTaille,
    empreinteDeLaCopie: _empreinteDeLaCopie,
    empreinteDuTexte: _calculerSHA256,
    extensionDuNom: _extensionDepuisNomFichier,
    nouvelUuid: _genererUUIDv4,
    appareil: _identifierAppareil,
    versionApp: _versionApp
};

})();
