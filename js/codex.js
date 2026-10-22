/* ===============================
   📂 MODULE: CODEX
   Flux de travail portable USB multi-appareil

   Le Codex est un espace de travail exportable en ZIP
   qui permet de travailler sur n'importe quel appareil
   (Mac, iPad, etc.) via clé USB, sans cloud.

   DEPENDANCES:
   - db.js (Database, IndexedDB, blobs)
   - trimestres.js (cle() pour namespacing)
   - travaux-stockage.js (recupererBlob, stockerBlob)
   - JSZip (libs/jszip.min.js)
   - fichier-sortant.js (assemblerZip, entreesDuZip, telecharger,
     confirmerTelechargement)
   - taille-fichier.js (TailleFichier.dire : toute taille dite à l'usager, #993)
   - reserve-verifier.js (lireRepertoireZip : reconnaître un codex sans le lire
     en entier, estUnFichierDeCodex)
   =============================== */

(function() {
'use strict';

/* ===============================
   CONSTANTES
   =============================== */

const FORMAT_VERSION = 1;
// Convention #262 — extension simple (pas de double point). L'ancien
// `.codex.zip` reste lisible (le filtre input file accepte `.zip`).
const EXTENSION_CODEX = '.zip';
const NOM_MANIFESTE = 'codex-manifeste.json';
// Rétrocompatibilité : accepter aussi l'ancien nom de manifeste à l'import
const NOM_MANIFESTE_ANCIEN = 'classeur-manifeste.json';
const NOM_DONNEES = 'donnees.json';
const DOSSIER_TRAVAUX = 'travaux';

// #1014 — les trois listes qui désignent un fichier du magasin `fichiers` : les copies de travail,
// la corbeille (le fichier y reste intact et restaurable), la Modélisation (ses fichiers sous le
// même id que leurs métadonnées). Le codex emporte les fichiers des trois, rangés côte à côte dans
// DOSSIER_TRAVAUX, et le manifeste les déclare (`contenu.listesDeFichiers`) : un codex d'avant
// ne les déclare pas, et l'absence de leurs fichiers n'y est pas un manque.
const LISTES_DE_FICHIERS = ['fichiersTravaux', 'corbeilleFichiers', 'fichiersModelisation'];

// Clés de stockage (non namespacées — globales)
// Migré de _classeur_* vers _codex_* — voir _migrerClesClasseurVersCodex()
const CLE_ETAT_CODEX = '_codex_etat';
// Snapshot de référence : utilisé par actionFusionner comme ancêtre 3-way.
// Le TimeMachine (#250) a été retiré le 28 avril 2026, mais ce snapshot reste utile.
const CLE_SNAPSHOT_AVANT = '_codex_snapshot_avant';
// #334 session C : la clé ne contient plus le dataset intégral mais un index
// de hachés {__format, cles: {clé: sha256hex(JSON)}} — quelques Ko au lieu de
// plusieurs Mo dupliqués en IDB + memoryCache à chaque boot.
const FORMAT_SNAPSHOT_HASH = 'codex-snapshot-hash-v1';
// Flag de purge unique des clés _codex_hist_* / _classeur_hist_* (ex-TimeMachine, #250)
const CLE_PURGE_TIMEMACHINE_FAITE = '_codex_purge_timemachine_done';

/* ===============================
   ÉTAT INTERNE
   =============================== */

let _etat = {
    actif: false,                  // Un codex est-il chargé ?
    nom: '',                       // Nom du codex
    derniereSauvegarde: null,      // Date ISO de la dernière sauvegarde
    modificationsDepuis: null,     // Date ISO de la première modif non sauvegardée
    manifeste: null                // Manifeste complet du codex chargé
};

// Handle FSAPI — non sérialisable, vit en mémoire seulement.
// Permet de ré-écrire vers le même fichier sans dialogue.
// Perdu au rechargement de la page (comportement normal).
var _fileHandle = null;

// Lot F (29 sept. 2026) : l'enregistrement automatique « Toutes les 5 min » est RETIRÉ,
// décision de Grégoire (« on ne peut pas produire un backup de 1 Go à chaque 5 minutes ») :
// le codex est sa copie de sûreté, un automate qui l'écrase sans aperçu pourrait remplacer
// une bonne copie par un état fautif. Le fichier ne s'écrit que par « Mettre à jour le
// codex ». Aucun réglage n'était persisté (mesuré) : rien à ignorer à la lecture.

// Lot F (D4) : compte les modifications marquées. Une écriture du fichier ne remet le
// codex « à jour » que si aucune modification n'est survenue PENDANT sa génération.
var _compteurModifications = 0;

/* ===============================
   MIGRATION CLASSEUR → CODEX
   =============================== */

// Anciennes clés (classeur) — pour la migration uniquement
const CLE_ETAT_ANCIEN = '_classeur_etat';
const CLE_SNAPSHOT_AVANT_ANCIEN = '_classeur_snapshot_avant';

// Drapeau pour ne migrer qu'une seule fois
const CLE_MIGRATION_FAITE = '_codex_migration_classeur_done';

/**
 * Migre les clés _classeur_* vers _codex_*.
 * - Lit chaque ancienne clé
 * - Copie la valeur vers la nouvelle clé
 * - Supprime l'ancienne SEULEMENT après confirmation de la copie
 * - Gère les clés dynamiques _classeur_hist_<DATE> via db.keys()
 *
 * Idempotente : ne fait rien si déjà exécutée (drapeau _codex_migration_classeur_done).
 * @returns {Promise<{migrees: number, ignorees: number}>}
 */
async function _migrerClesClasseurVersCodex() {
    // Attendre que IndexedDB soit prêt (obligatoire pour lire les vraies données)
    if (!db.ready) {
        await db.init();
    }

    // Déjà fait ? Vérifier dans IDB (pas seulement localStorage)
    var dejaMigre = await db.get(CLE_MIGRATION_FAITE, false);
    if (dejaMigre) {
        return { migrees: 0, ignorees: 0 };
    }


    var migrees = 0;
    var ignorees = 0;

    // Table de correspondance pour les clés fixes encore migrables
    // (la clé _classeur_hist_index et les snapshots _classeur_hist_<DATE> ne sont
    //  plus migrés depuis le retrait du TimeMachine (#250) — ils sont purgés par
    //  _purgerCodexHistLegacy au démarrage)
    var clesFixes = [
        { ancien: CLE_ETAT_ANCIEN,           nouveau: CLE_ETAT_CODEX },
        { ancien: CLE_SNAPSHOT_AVANT_ANCIEN, nouveau: CLE_SNAPSHOT_AVANT }
    ];

    // 1. Migrer les clés fixes
    for (var i = 0; i < clesFixes.length; i++) {
        var paire = clesFixes[i];
        var valeur = await db.get(paire.ancien, null);
        if (valeur !== null) {
            // Écriture async — attend la confirmation IDB
            await db.set(paire.nouveau, valeur);
            // Vérification : relire depuis IDB (pas le cache localStorage)
            var verification = await db.get(paire.nouveau, null);
            if (verification !== null) {
                // Suppression async — attend la confirmation IDB
                await db.remove(paire.ancien);
                migrees++;
            } else {
                console.error('  ✗ Échec vérification pour ' + paire.nouveau + ', ancienne clé conservée');
                ignorees++;
            }
        } else {
            ignorees++;
        }
    }

    // 3. Marquer la migration comme terminée SEULEMENT si au moins une clé a été migrée
    //    ou si aucune ancienne clé n'existait (rien à migrer)
    var clesRestantes = await db.keys();
    var anciennesRestantes = clesRestantes.filter(function(c) { return c.startsWith('_classeur_'); });
    if (anciennesRestantes.length === 0) {
        await db.set(CLE_MIGRATION_FAITE, true);
    } else {
        console.error('📂 Migration INCOMPLÈTE — clés _classeur_* restantes : ' + anciennesRestantes.join(', '));
        console.error('📂 Le drapeau de migration N\'A PAS été posé. La migration sera retentée au prochain chargement.');
    }

    return { migrees: migrees, ignorees: ignorees };
}

/* ===============================
   INITIALISATION
   =============================== */

/**
 * Purge silencieuse des snapshots TimeMachine (#250 — 28 avril 2026).
 * Le TimeMachine a été retiré : ses clés IDB (_codex_hist_*, _classeur_hist_*,
 * et leurs index) sont obsolètes et peuvent libérer 400-800 Mo. Idempotente
 * via le flag CLE_PURGE_TIMEMACHINE_FAITE.
 */
async function _purgerCodexHistLegacy() {
    if (!db.ready) {
        await db.init();
    }
    var dejaFait = await db.get(CLE_PURGE_TIMEMACHINE_FAITE, false);
    if (dejaFait) return { purgees: 0 };

    var toutes = await db.keys();
    var aPurger = toutes.filter(function(k) {
        return k.indexOf('_codex_hist_') === 0 ||
               k.indexOf('_classeur_hist_') === 0;
    });

    var purgees = 0;
    for (var i = 0; i < aPurger.length; i++) {
        try {
            await db.remove(aPurger[i]);
            purgees++;
        } catch (e) {
            console.warn('[Codex] Purge TimeMachine : suppression échouée pour ' + aPurger[i], e.message || e);
        }
    }

    await db.set(CLE_PURGE_TIMEMACHINE_FAITE, true);

    if (purgees > 0) {
        console.warn('[Codex] TimeMachine retiré (#250) — ' + purgees + ' clé(s) historique purgée(s).');
    }
    return { purgees: purgees };
}

/**
 * Restaure l'état du codex depuis le stockage (au démarrage de l'app)
 */
function initialiserCodex() {
    // Lot F (D4) : le témoin du codex dit vrai. Chaque « Enregistré » du témoin commun
    // (une écriture faite par l'usager) rend le codex « pas à jour ». Les écritures
    // silencieuses de l'application (indices recalculés, migrations : `discret`) ne
    // parlent pas au témoin commun, et ne touchent donc pas celui du codex : mesuré le
    // 28 sept., chaque ouverture réécrit une quinzaine de clés sans geste de l'usager.
    window.addEventListener('donnees-enregistrees', function() { marquerModification(); });

    // Lancer la migration (async, non bloquante pour le premier rendu)
    _migrerClesClasseurVersCodex().then(function(resultat) {
        if (resultat.migrees > 0) {
            // Relire l'état depuis la nouvelle clé après migration
            var etatMigre = db.getSync(CLE_ETAT_CODEX, null);
            if (etatMigre && etatMigre.actif) {
                _etat = Object.assign({}, _etat, etatMigre);
                _marquerStockAvantLotF(etatMigre);
                _mettreAJourIndicateur();
            }
        }
    }).catch(function(e) {
        console.error('📂 Erreur migration classeur → codex :', e);
    });

    // Purge unique des snapshots TimeMachine (#250)
    _purgerCodexHistLegacy().catch(function(e) {
        console.error('[Codex] Erreur purge TimeMachine :', e);
    });

    // Conversion unique du snapshot de fusion legacy en index haché (#334 C)
    // — sinon un utilisateur qui n'enregistre jamais son codex garde la
    // duplication IDB + memoryCache du dataset intégral.
    _migrerSnapshotVersIndexHash();

    // #336 : réafficher le plan de purge persisté par le dernier import (le
    // reload post-import efface la console — constat terrain 11 juin). Après
    // db-ready : la clé peut n'être qu'en IDB au premier rendu.
    // #414 (8 août 2026) : site déjà correct — c'est même celui dont le patron a
    // servi à corriger #413 — passé au portillon commun sans changer de sens.
    window.auDbPret(_restaurerPlanPurge);

    // CLE_ETAT_CODEX pointe maintenant vers _codex_etat
    // Fallback sur l'ancienne clé pour le premier chargement avant que la migration async ne termine
    var etatSauve = db.getSync(CLE_ETAT_CODEX, null) || db.getSync(CLE_ETAT_ANCIEN, null);
    if (etatSauve && etatSauve.actif) {
        _etat = Object.assign({}, _etat, etatSauve);
        _marquerStockAvantLotF(etatSauve);
    } else {
        // #142 — quand localStorage est saturé, _codex_etat est refoulé en
        // IndexedDB seulement : à DOMContentLoaded la lecture synchrone tombe
        // sur du vide (la sync IDB → cache n'a pas fini) et le menu affiche
        // « Aucun codex actif » alors que les données sont là. Relire après
        // db-ready (même patron que la migration ci-dessus). Bug terrain
        // Grégoire 10 juin 2026.
        var relireEtatTardif = function() {
            if (_etat.actif) return; // un geste utilisateur a déjà activé
            var etatTardif = db.getSync(CLE_ETAT_CODEX, null) || db.getSync(CLE_ETAT_ANCIEN, null);
            if (etatTardif && etatTardif.actif) {
                _etat = Object.assign({}, _etat, etatTardif);
                _marquerStockAvantLotF(etatTardif);
                _mettreAJourIndicateur();
            }
        };
        // #414 : idem — portillon commun, sémantique inchangée.
        window.auDbPret(relireEtatTardif);
    }
    _mettreAJourIndicateur();

    // #230 : Rappel d'enregistrer avant de quitter si modifications non sauvegardées
    window.addEventListener('beforeunload', function(e) {
        if (_etat.actif && _etat.modificationsDepuis) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

/**
 * Persiste l'état courant du codex
 */
function _sauvegarderEtat() {
    db.setSync(CLE_ETAT_CODEX, _instantaneEtat());
}

/**
 * L'état tel qu'il est persisté. `temoinFiable` : écrit par une version dont le
 * témoin dit vrai (lot F) — voir _marquerStockAvantLotF.
 */
function _instantaneEtat() {
    return {
        actif: _etat.actif,
        nom: _etat.nom,
        derniereSauvegarde: _etat.derniereSauvegarde,
        modificationsDepuis: _etat.modificationsDepuis,
        manifeste: _etat.manifeste,
        temoinFiable: true
    };
}

/**
 * Lot F, le stock (décision de Grégoire, 29 sept., option b) : avant le lot, rien ne
 * marquait les changements, et un codex actif disait « à jour » depuis sa dernière
 * écriture. Un état actif écrit avant le lot (sans `temoinFiable`) est donc posé
 * « pas à jour », une seule fois : l'écriture ajoute le drapeau. N'écrit que
 * `_codex_etat`, jamais les données ; sans codex actif, rien.
 * La marque est posée en mémoire tout de suite (le menu dit vrai dès l'ouverture),
 * et persistée après db-ready : écrite avant, la synchronisation IDB → cache du
 * démarrage la réécrasait par l'ancien état (mesuré par le banc du stock).
 * @param {Object} etatLu - l'état relu du stockage
 */
function _marquerStockAvantLotF(etatLu) {
    if (!etatLu || !etatLu.actif || etatLu.temoinFiable) return;
    if (!_etat.modificationsDepuis) _etat.modificationsDepuis = new Date().toISOString();
    window.auDbPret(_sauvegarderEtat);
}

/* ===============================
   GÉNÉRATION D'UN CLASSEUR (EXPORT)
   =============================== */

/**
 * Génère un Codex ZIP depuis les données IndexedDB actuelles.
 * @param {Object} [options]
 * @param {string} [options.nom] - Nom du codex
 * @param {function(number, number): Promise<boolean>} [options.confirmerCopiesManquantes] - #1012 :
 *   appelée avec (manquantes, attendues) quand des copies attendues n'ont pas de fichier, avant
 *   l'aperçu ; rend false pour renoncer (la génération rend alors null, comme un aperçu refusé)
 * @returns {Promise<{blob: Blob, nomFichier: string, manifeste: Object,
 *   copies: {attendues: number, manquantes: number}}|null>}
 */
/**
 * #1014 — les clés de `cles` qui portent une des `listes` (LISTES_DE_FICHIERS), tous trimestres.
 * Les copies de travail gardent leur règle d'avant (toute clé qui contient le nom, H5) ; les deux
 * autres listes se reconnaissent à leur nom exact, nu ou préfixé d'un trimestre, pour ne pas
 * prendre leur sauvegarde de migration (`corbeilleFichiers_backup_v1`).
 * @returns {Array<{cle: string, liste: string}>}
 */
function _clesDesListesDeFichiers(cles, listes) {
    var trouvees = [];
    cles.forEach(function(c) {
        for (var i = 0; i < listes.length; i++) {
            var liste = listes[i];
            var porte = (liste === 'fichiersTravaux')
                ? c.includes(liste)
                : new RegExp('^(?:(?:[aeh]\\d{4}|demo)_)?' + liste + '$').test(c);
            if (porte) { trouvees.push({ cle: c, liste: liste }); return; }
        }
    });
    return trouvees;
}

/**
 * T2 du chantier du démo (décision G1 de Grégoire, 6 oct. 2026) : le codex n'emporte pas le
 * démo, et ouvrir un codex ne le touche plus. Le démo se réinstalle depuis l'application.
 * Les listes du démo dont les ids désignent des fichiers : copies, corbeille, annotations
 * (celles-ci par `fichierId`).
 */
var LISTES_DU_DEMO = ['demo_fichiersTravaux', 'demo_corbeilleFichiers', 'demo_annotationsTravaux'];

function _estCleDuDemo(cle) {
    return typeof cle === 'string' && cle.indexOf('demo_') === 0;
}

/** Les ids de fichier que portent les listes du démo de `donnees`. */
function _idsDuDemo(donnees) {
    var ids = {};
    LISTES_DU_DEMO.forEach(function(cle) {
        var liste = donnees && donnees[cle];
        if (!Array.isArray(liste)) return;
        liste.forEach(function(e) {
            var id = e && (cle === 'demo_annotationsTravaux' ? e.fichierId : e.id);
            if (id) ids[id] = true;
        });
    });
    return ids;
}

/**
 * T2 — la part du démo dans `donnees` (fonction pure) : toute clé `demo_*`, et la vignette
 * `thumbnail_<id>` de chaque fichier du démo (constat C4 : la vignette vit sous une clé
 * globale). Sélection par IDENTITÉ, au modèle de la Réserve (reserve-copies.js) : un id que
 * porte aussi une liste réelle reste à la copie réelle, sa vignette avec elle.
 * @returns {{cles: Object<string, boolean>, ids: Object<string, boolean>}} `ids` : les
 *   fichiers du démo seulement
 */
function _partDuDemo(donnees) {
    var cles = {};
    var toutes = Object.keys(donnees || {});
    toutes.forEach(function(c) { if (_estCleDuDemo(c)) cles[c] = true; });
    var idsReels = {};
    toutes.forEach(function(c) {
        if (_estCleDuDemo(c) || !Array.isArray(donnees[c])) return;
        var annotations = /^(?:[aeh]\d{4}_)?annotationsTravaux$/.test(c);
        if (!annotations && _clesDesListesDeFichiers([c], LISTES_DE_FICHIERS).length === 0) return;
        donnees[c].forEach(function(e) {
            var id = e && (annotations ? e.fichierId : e.id);
            if (id) idsReels[id] = true;
        });
    });
    var ids = {};
    Object.keys(_idsDuDemo(donnees)).forEach(function(id) {
        if (idsReels[id]) return;
        ids[id] = true;
        if (Object.prototype.hasOwnProperty.call(donnees, 'thumbnail_' + id)) cles['thumbnail_' + id] = true;
    });
    return { cles: cles, ids: ids };
}

/** T2 — `donnees` sans la part du démo (nouvel objet ; l'original n'est pas touché). */
function _sansLeDemo(donnees, part) {
    var p = part || _partDuDemo(donnees);
    var reste = {};
    Object.keys(donnees || {}).forEach(function(c) { if (!p.cles[c]) reste[c] = donnees[c]; });
    return reste;
}

/**
 * #1014 — l'extension d'une entrée du codex. Celle du nom de fichier quand elle tient dans la
 * liste blanche de l'export (lettres et chiffres), sinon 'bin' : un nom de Modélisation est celui
 * du fichier choisi sur l'appareil, et une extension hors liste bloquerait tout le codex.
 */
function _extensionDansLeCodex(nomFichier) {
    var nf = nomFichier || '';
    var ext = (nf.indexOf('.') !== -1) ? nf.split('.').pop() : 'bin';
    return /^[A-Za-z0-9]+$/.test(ext) ? ext : 'bin';
}

async function genererCodex(options = {}) {
    if (typeof JSZip === 'undefined') {
        throw new Error('JSZip non disponible. Impossible de générer le codex.');
    }

    var compteurAuDebut = _compteurModifications;

    const debut = performance.now();
    var _prog = _majProgression;
    var _progMasquer = _masquerProgression;

    _afficherProgression('Génération du codex');
    _prog(0, 'Lecture des données…');
    if (options.suivreTentative) _noterTentative({ etape: 'lecture des données' });
    await _yield(); // laisser le navigateur peindre l'overlay

    try {

    // 1. Collecter toutes les clés depuis IndexedDB
    const toutesLesCles = await db.keys();
    const clesFiltrees = toutesLesCles.filter(function(c) { return !c.startsWith('_codex_'); });
    let donnees = {};
    for (var i = 0; i < clesFiltrees.length; i++) {
        var valeur = await db.get(clesFiltrees[i], null);
        if (valeur !== null) {
            donnees[clesFiltrees[i]] = valeur;
        }
        if (i % 10 === 0) {
            _prog(
                Math.round((i / clesFiltrees.length) * 20),
                'Lecture des données…',
                (i + 1) + '/' + clesFiltrees.length + ' clés'
            );
            await _yield();
        }
    }

    // 1 bis. T2 : le démo n'entre pas dans le codex (ni ses clés, ni ses fichiers, ni leurs
    //        vignettes). Les listes de fichiers et le manifeste se lisent après ce retrait.
    const partDuDemo = _partDuDemo(donnees);
    donnees = _sansLeDemo(donnees, partDuDemo);
    const clesDuCodex = clesFiltrees.filter(function(c) { return !partDuDemo.cles[c]; });

    // 2. Construire le ZIP
    _prog(20, 'Préparation du ZIP…');
    const zip = new JSZip();

    // 2a. Données JSON
    const json = JSON.stringify(donnees, null, 0); // compact
    zip.file(NOM_DONNEES, json);

    // 2b. Blobs des travaux
    let nbBlobs = 0;
    let tailleTotale = 0;
    // Capturer TOUTES les cles fichiersTravaux : un codex peut contenir
    // plusieurs trimestres (h2026_fichiersTravaux + a2025_fichiersTravaux,
    // etc.). find() ne retournait que la premiere, les blobs des autres
    // trimestres etaient ignores. (H5)
    // #1014 : et celles de la corbeille et de la Modélisation, par le même chemin.
    const clesFT = _clesDesListesDeFichiers(clesDuCodex, LISTES_DE_FICHIERS);
    zip.folder(DOSSIER_TRAVAUX);
    // Lot J0 (#988) : les copies ne sont plus confiées à JSZip, qui les lisait toutes en
    // mémoire dès leur dépôt. On n'en garde que la référence ; `FichierSortant.assemblerZip`
    // les range (la pièce vit dans js/fichier-sortant.js depuis le lot A1 : l'archive l'emploie aussi).
    const copies = [];
    const rangDeLaCopie = {};
    // #1012 — le signal de l'avertissement, COMPTÉ ici et non lu dans les statuts (cf.
    // _creerCompteDesCopies). Le statut ne décide de rien d'autre : tout fichier présent part dans
    // le codex, « exporte » et « manquant » compris.
    const compteDesCopies = _creerCompteDesCopies();

    if (clesFT.length > 0 && typeof travauxStockage !== 'undefined') {
        // Aplatir les listes des differents trimestres ; seules les copies de travail comptent
        // pour l'avertissement (#1014 : il ne change pas).
        var fichiers = [];
        var estUneCopie = [];
        clesFT.forEach(function(c) {
            if (Array.isArray(donnees[c.cle])) {
                donnees[c.cle].forEach(function(f) {
                    fichiers.push(f);
                    estUneCopie.push(c.liste === 'fichiersTravaux');
                });
            }
        });
        for (var j = 0; j < fichiers.length; j++) {
            var f = fichiers[j];
            var copieTrouvee = false;
            try {
                var blob = await travauxStockage.recupererBlob(f.id);
                if (blob) {
                    copieTrouvee = true;
                    // Extension : si nomFichier ne contient pas de point,
                    // 'bin' (sinon split('.').pop() retourne le nom complet,
                    // produisant FT_abc.monfichier au lieu de FT_abc.bin). (M3)
                    var ext = _extensionDansLeCodex(f.nomFichier);
                    // JSZip acceptait aussi un tampon d'octets : on l'enveloppe, pour ne pas
                    // perdre une copie qui ne serait pas stockée en Blob.
                    if (!(blob instanceof Blob)) blob = new Blob([blob]);
                    // Un même nom déposé deux fois : le dernier l'emporte, à la place du premier
                    // (ce que faisait JSZip).
                    var nomEntree = DOSSIER_TRAVAUX + '/' + f.id + '.' + ext;
                    if (Object.prototype.hasOwnProperty.call(rangDeLaCopie, nomEntree)) {
                        copies[rangDeLaCopie[nomEntree]].blob = blob;
                    } else {
                        rangDeLaCopie[nomEntree] = copies.length;
                        copies.push({ nom: nomEntree, blob: blob });
                    }
                    nbBlobs++;
                    tailleTotale += blob.size || 0;
                }
            } catch (e) {
                console.warn('📂 Codex : blob ignoré pour ' + f.id, e.message);
            }
            if (estUneCopie[j]) compteDesCopies.noter(f, copieTrouvee);
            if (j % 5 === 0) {
                _prog(
                    20 + Math.round((j / fichiers.length) * 50),
                    'Ajout des fichiers travaux…',
                    nbBlobs + '/' + fichiers.length + ' fichiers (' + window.TailleFichier.dire(tailleTotale) + ')'
                );
                await _yield();
            }
        }
    }

    // 2c. #1012 — des copies attendues manquent : l'appelant qui va écrire le codex hors de
    //     l'application le dit AVANT l'aperçu et avant toute écriture. Un refus sort comme un
    //     aperçu refusé : rien n'est préparé, rien n'est écrit.
    if (compteDesCopies.manquantes > 0 && typeof options.confirmerCopiesManquantes === 'function') {
        _progMasquer();
        if (options.suivreTentative) _noterTentative({ etape: 'avertissement des copies manquantes' });
        if (!(await options.confirmerCopiesManquantes(compteDesCopies.manquantes, compteDesCopies.attendues))) {
            return null;
        }
        _afficherProgression('Génération du codex');
        _prog(70, 'Préparation du ZIP…', _nombreDeFichiers(nbBlobs) + ', ' + window.TailleFichier.dire(tailleTotale));
    }

    // 3. Le snapshot de référence pour la fusion 3-way n'est plus écrit ici : il décrit
    //    le FICHIER, et le fichier n'existe qu'après son écriture (lot F, _marquerCodexAJour).

    // 4. Manifeste
    const maintenant = new Date().toISOString();
    const auteur = _obtenirAuteur();
    const trimestreActif = (typeof window.trimestreActif === 'string') ? window.trimestreActif : '';

    const manifeste = {
        formatVersion: FORMAT_VERSION,
        appVersion: _obtenirVersionApp(),
        nom: options.nom || _etat.nom || _genererNomCodex(),
        auteur: auteur,
        dateCreation: _etat.manifeste?.dateCreation || maintenant,
        dateDerniereModification: maintenant,
        appareil: _identifierAppareil(),
        navigateur: _identifierNavigateur(),        // #244 (11 mai 2026)
        userAgent: navigator.userAgent,             // #244 (string complète pour diagnostic)
        trimestre: trimestreActif,
        contenu: {
            cles: clesDuCodex,
            nombreFichiersTravaux: nbBlobs,
            tailleTotaleOctets: new Blob([json]).size + tailleTotale,
            listesDeFichiers: LISTES_DE_FICHIERS.slice()   // #1014
        }
    };

    zip.file(NOM_MANIFESTE, JSON.stringify(manifeste, null, 2));
    // Lot G (#988) : la taille se voit AVANT (aperçu). Les travaux (PDF, images) se
    // compressent peu : la taille non compressée est une estimation honnête du fichier.
    var tailleEstimee = manifeste.contenu.tailleTotaleOctets;
    if (options.suivreTentative) _noterTentative({ etape: 'aperçu', tailleEstimeeOctets: tailleEstimee });

    // Défense K — valider que le ZIP ne contient que les entrées attendues
    // avant de le sérialiser. Si un payload a tenté d'ajouter un fichier
    // annexe (cf. MODELE-MENACES.md §X-02), l'export est bloqué ici.
    if (window.SecuriteExportValidation && typeof window.SecuriteExportValidation.validerExportCodex === 'function') {
        window.SecuriteExportValidation.validerExportCodex(window.FichierSortant.entreesDuZip(zip, copies, DOSSIER_TRAVAUX + '/'));
    }

    // K-β — preview UI : montrer la liste des fichiers à l'utilisateur
    // avant compression et téléchargement. L'utilisateur peut annuler.
    // Sautée seulement si le module preview n'est pas chargé (dégradation gracieuse).
    //
    // Important UX : on masque l'overlay de progression avant la modale
    // (sinon double affichage), puis on le RÉAFFICHE après le clic
    // Télécharger pour montrer la compression (qui peut prendre plusieurs
    // minutes avec beaucoup de fichiers). Sans réaffichage, l'utilisateur
    // attend dans le noir pendant generateAsync.
    if (window.SecuriteExportPreview && typeof window.SecuriteExportPreview.previewZipEtConfirmer === 'function') {
        _progMasquer();
        const ok = await window.SecuriteExportPreview.previewZipEtConfirmer(window.FichierSortant.entreesDuZip(zip, copies, DOSSIER_TRAVAUX + '/'), 'codex', { taille: window.TailleFichier.dire(tailleEstimee, { environ: true }) });
        if (!ok) {
            return null;
        }
        // Recréer l'overlay pour la phase compression (peut être longue).
        _afficherProgression('Génération du codex');
        _prog(70, 'Compression du ZIP…', _nombreDeFichiers(nbBlobs) + ', ' + window.TailleFichier.dire(tailleTotale));
    }

    // 5. Générer le blob ZIP
    if (options.suivreTentative) _noterTentative({ etape: 'compression' });
    _prog(70, 'Compression du ZIP…', _nombreDeFichiers(nbBlobs) + ', ' + window.TailleFichier.dire(tailleTotale));
    const zipBlob = await window.FichierSortant.assemblerZip(zip, copies, function(pourcent) {
        _prog(
            70 + Math.round(pourcent * 0.28),
            'Compression du ZIP…',
            window.formaterPourcentage(Math.round(pourcent)) + ' compressé'
        );
    });

    // 6. L'état « à jour » n'est PAS posé ici (lot F, D4) : le fichier n'est pas encore
    //    écrit. Avant, un aperçu annulé ou une écriture refusée laissait « Tout est
    //    enregistré ». C'est `_marquerCodexAJour`, après l'écriture réussie, qui le pose.
    _prog(98, 'Finalisation…');

    const duree = Math.round(performance.now() - debut);

    _prog(100, 'Codex prêt !', window.TailleFichier.dire(zipBlob.size));

    // Pause brève pour que l'utilisateur voie "100%"
    await new Promise(function(r) { setTimeout(r, 500); });
    _progMasquer();

    // Nom de fichier avec horodatage
    const nomFichier = _genererNomFichier(manifeste.nom);

    return {
        blob: zipBlob, nomFichier, manifeste, donnees, compteurAuDebut,
        copies: { attendues: compteDesCopies.attendues, manquantes: compteDesCopies.manquantes }
    };

    } catch (erreur) {
        _progMasquer();
        throw erreur;
    }
}

/* ===============================
   CHARGEMENT D'UN CLASSEUR (IMPORT)
   =============================== */

/**
 * #292 : détermine si une clé de stockage correspond à une bibliothèque
 * partagée susceptible de contenir des doublons d'ID (collection d'objets
 * avec .id). Utilisé par chargerCodex pour appliquer verifierUniciteIds
 * avant restauration. Accepte les variantes namespacées (h2026_, a2025_).
 *
 * Liste alignée avec les sites qui appliquent déjà verifierUniciteIds dans
 * import-export.js (echelles/grilles/productions/cartouches/pratiques).
 */
function _estBiblioPartagee(cle) {
    if (typeof cle !== 'string') return false;
    var cleBase = cle.replace(/^[aeh]\d{4}_/, '');
    var ciblesExactes = [
        'grillesTemplates',
        'echellesTemplates',
        'pratiquesConfigurables',
        'bibliothequePratiques',
        'bibliothequeGrilles',
        'bibliothequeEchelles',
        'bibliothequeCartouches',
        'bibliothequeProductions'
    ];
    if (ciblesExactes.indexOf(cleBase) !== -1) return true;
    if (cleBase.indexOf('cartouches_') === 0) return true;
    return false;
}

/**
 * #684 (15 oct. 2026) : le drapeau du renommage du matériel de départ suit le codex. Un codex
 * qui ne le porte pas date d'avant la migration : ses anciens noms reviennent avec lui, et la
 * migration (main.js, égalité stricte) doit rejouer au démarrage suivant. Un codex qui le porte
 * l'a déjà écrit, par la boucle d'ouverture.
 * @param {Object} donnees - les entrées du codex ouvert
 */
async function _drapeau684SuitLeCodex(donnees) {
    var drapeau = window.FLAG_MIGRATION_NOMS_MATERIEL_684;
    if (!drapeau || Object.prototype.hasOwnProperty.call(donnees, drapeau)) return;
    await db.remove(drapeau);
}

/**
 * Charge un Codex ZIP dans IndexedDB.
 * @param {File|Blob} fichierZip - Le fichier ZIP à charger
 * @returns {Promise<{manifeste: Object, stats: Object}>}
 */
async function chargerCodex(fichierZip) {
    if (typeof JSZip === 'undefined') {
        throw new Error('JSZip non disponible. Impossible de charger le codex.');
    }

    const debut = performance.now();
    _afficherProgression('Ouverture du codex', fichierZip && fichierZip.name);
    _majProgression(0, 'Validation du fichier…', window.TailleFichier.dire(fichierZip.size));
    await _yield(); // laisser le navigateur peindre l'overlay

    try {

    // 1. Valider le ZIP
    const validation = await validerCodex(fichierZip);
    if (!validation.valide) {
        _masquerProgression();
        throw new Error('Codex invalide : ' + validation.erreurs.join(', '));
    }

    const zip = validation._zip;
    const manifeste = validation._manifeste;

    // Détection d'un codex legacy (#250) : dossier historique/ + champ manifeste.historique
    // sont ignorés silencieusement depuis le retrait du TimeMachine.
    var aHistoriqueLegacy = !!(manifeste && Array.isArray(manifeste.historique) && manifeste.historique.length > 0);
    if (!aHistoriqueLegacy) {
        var nomsZip = Object.keys(zip.files);
        for (var iz = 0; iz < nomsZip.length; iz++) {
            if (nomsZip[iz].indexOf('historique/') === 0) {
                aHistoriqueLegacy = true;
                break;
            }
        }
    }
    if (aHistoriqueLegacy) {
        console.warn('[Codex] ZIP legacy : le dossier historique/ et les snapshots TimeMachine sont ignorés (#250).');
    }

    // 1b. Pré-vol stockage (#334 session A) : refuser AVANT toute écriture si
    // le quota WebKit ne suffira pas (quota proportionnel à l'espace libre de
    // l'appareil — cas réel iPad saturé du 10 juin 2026).
    _majProgression(10, 'Vérification de l\'espace disponible…');

    // Stockage persistant : revérifier ICI, sur geste utilisateur frais —
    // meilleures chances d'octroi, et c'est le moment où ça compte (l'appel
    // du boot dans travaux-stockage.js ignore son résultat ; D1).
    if (navigator.storage && navigator.storage.persisted && navigator.storage.persist) {
        try {
            if (!(await navigator.storage.persisted())) {
                var persistAccorde = await navigator.storage.persist();
                if (!persistAccorde) {
                    console.warn('[Codex] persist() refusé — le stockage reste susceptible d\'éviction.');
                }
            }
        } catch (ePersist) {
            console.warn('[Codex] persisted()/persist() indisponible :', ePersist.message);
        }
    }

    var estimationStockage = null;
    if (navigator.storage && navigator.storage.estimate) {
        try {
            var brutEstimation = await navigator.storage.estimate();
            estimationStockage = { usage: brutEstimation.usage || 0, quota: brutEstimation.quota || 0 };
        } catch (eEstimate) {
            console.warn('[Codex] estimate() indisponible :', eEstimate.message);
        }
    }

    var prevol = evaluerPrevolStockage(validation._tailleDecompressee || 0, fichierZip.size, estimationStockage);
    if (prevol.verdict === 'refus') {
        _masquerProgression();
        // Mots tranchés par Grégoire le 1er oct. 2026 (#1011) : un seul texte partout,
        // sans nommer de navigateur ; le chemin de l'iPad est dans le texte même,
        // sans détection d'appareil (un iPad se présente souvent comme un Mac).
        var msgPrevol = 'Espace insuffisant pour ouvrir ce codex. Il a besoin d\'environ ' +
            window.TailleFichier.dire(prevol.besoin) + ', mais le navigateur n\'accorde que ' +
            window.TailleFichier.dire(prevol.disponible) + ' à l\'application. ' +
            'Libère environ ' + window.TailleFichier.dire(prevol.manque * 2) +
            ' sur l\'appareil, puis réessaie. ' +
            'Sur un iPad : Réglages → Général → Stockage iPad.';
        if (prevol.quotaFaible) {
            msgPrevol += ' Si tu navigues en privé, rouvre l\'application dans une fenêtre normale.';
        }
        throw new Error(msgPrevol);
    }
    if (prevol.verdict === 'inconnu') {
        console.warn('[Codex] Pré-vol stockage sans verdict (estimate() indisponible) — l\'import journalisé sert de filet.');
    }

    // 2. Extraire et charger les données JSON
    _majProgression(15, 'Extraction des données…');
    const jsonStr = await zip.file(NOM_DONNEES).async('string');
    // T2 : un codex d'avant G1 peut porter le démo ; il n'est pas écrit, ses fichiers ne
    // sont ni restaurés ni comptés dans le bilan, et le démo installé reste tel quel.
    const donnees = _sansLeDemo(JSON.parse(jsonStr));

    // 2 bis. Garde de modèle antérieur (#335 Lot A) : AVANT toute écriture.
    var detectionModele = _detecterModeleAnterieur(donnees, manifeste);
    if (detectionModele) {
        _masquerProgression();
        if (!(await uiDialogues.confirmerAction({
            titre: 'Modèle antérieur détecté',
            message: _messageModeleAnterieur(detectionModele, 'remplacer', fichierZip && fichierZip.name),
            texteConfirmer: 'Remplacer',
            variante: 'danger',
            preformate: true
        }))) {
            throw new Error('Import annulé : ton espace de travail n\'a pas été modifié.');
        }
        _majProgression(15, 'Extraction des données…');
    }

    // #1012 (1er oct. 2026) : à partir d'ici, l'espace change. Le fichier d'origine
    // tenu jusque-là portait les données d'AVANT : l'application l'oublie, pour que
    // « Mettre à jour le codex » ne puisse y écrire ni les données d'un autre codex,
    // ni un espace à moitié remplacé. Avant ce point (fichier refusé, pré-vol, garde
    // de modèle antérieur), rien n'a bougé : elle le garde. `_ouvrirLeFichierChoisi`
    // adopte le fichier choisi, une fois l'ouverture complète.
    _fileHandle = null;

    var entreesData = Object.entries(donnees).filter(function(e) { return !e[0].startsWith('_'); });
    let nbCles = 0;
    for (var i = 0; i < entreesData.length; i++) {
        var cleEntree = entreesData[i][0];
        var valeurEntree = entreesData[i][1];
        // #292 : filet anti-doublons. Si la clé est une Bibliothèque
        // (collection d'objets avec .id), appliquer verifierUniciteIds avant
        // l'écriture pour éviter de propager les doublons d'ID d'un codex source
        // infecté. Les chemins d'import historiques ont parfois contourné
        // verifierUniciteIds (cf. BACKLOG #292) — ce filet sécurise désormais
        // toute restauration de codex.
        if (_estBiblioPartagee(cleEntree) && Array.isArray(valeurEntree) && typeof window.verifierUniciteIds === 'function') {
            valeurEntree = window.verifierUniciteIds(valeurEntree, cleEntree);
        }
        try {
            await db.set(cleEntree, valeurEntree);
        } catch (errSet) {
            // Échec dur en phase données : le noyau JSON doit être cohérent
            // (D7 du plan #334 — pas de rollback, mais pas de demi-noyau
            // silencieux non plus). Sur quota, dire où on en était et quoi faire.
            if (errSet && errSet.name === 'QuotaExceededError') {
                throw new Error(
                    'L\'espace s\'est rempli pendant l\'import (' + nbCles + '/' +
                    entreesData.length + ' clés écrites). Les données sont partielles : ' +
                    'libère de l\'espace puis rouvre ton codex (le ZIP est toujours dans Fichiers).'
                );
            }
            throw errSet;
        }
        nbCles++;
        if (i % 10 === 0) {
            _majProgression(
                15 + Math.round((i / entreesData.length) * 20),
                'Restauration des données…',
                (i + 1) + '/' + entreesData.length + ' clés'
            );
            await _yield();
        }
    }
    await _drapeau684SuitLeCodex(donnees);

    // 3. Synchroniser le cache localStorage
    _majProgression(35, 'Synchronisation du cache…');
    await db.syncToLocalStorageCache();

    // 4. Restaurer les blobs — journalisé (#334 session B) : chaque échec est
    //    compté avec sa raison, plus aucun n'est silencieux. stockerBlob est
    //    appelé avec notifier:false (une notification par blob refusé = avalanche
    //    de bandeaux en import massif) ; le bilan est rendu en fin d'import.
    let nbBlobs = 0;
    var blobsEchecs = [];        // [{id, raison}] — raison : 'quota' | 'erreur'
    var blobsRefusesMagic = [];  // [id] — magic bytes invalides
    var blobsAbsentsDuZip = [];  // [id] — attendus (statut avec blob) mais absents du ZIP
    var nbBlobsAttendus = 0;
    // Memes raisons que cote export (genererCodex) : un codex peut contenir
    // plusieurs trimestres, on doit toutes les capturer. (H5)
    // #1014 : les listes que le codex déclare emporter ; un codex d'avant n'en déclare aucune et
    // n'emportait que les copies de travail — il s'ouvre comme avant.
    var listesDeclarees = (manifeste && manifeste.contenu && Array.isArray(manifeste.contenu.listesDeFichiers))
        ? LISTES_DE_FICHIERS.filter(function(l) { return l === 'fichiersTravaux' || manifeste.contenu.listesDeFichiers.indexOf(l) !== -1; })
        : ['fichiersTravaux'];
    const clesFTImport = _clesDesListesDeFichiers(Object.keys(donnees), listesDeclarees).map(function(c) { return c.cle; });
    var auxArchives = (window.ReserveCopies && typeof window.ReserveCopies.idsDansDonnees === 'function')
        ? window.ReserveCopies.idsDansDonnees(donnees) : {};
    if (clesFTImport.length > 0 && typeof travauxStockage !== 'undefined') {
        var fichiers = [];
        clesFTImport.forEach(function(cle) {
            if (Array.isArray(donnees[cle])) {
                fichiers = fichiers.concat(donnees[cle]);
            }
        });
        for (var j = 0; j < fichiers.length; j++) {
            var f = fichiers[j];
            // Un statut 'exporte' n'a légitimement pas de blob dans le ZIP
            // (le blob avait déjà quitté l'app au moment de l'export).
            // #1028 : ni une copie aux archives (la marque `_copiesAuxArchives` voyage dans le
            // codex) : elle n'est jamais dite « manquante ».
            var blobAttendu = f.blobStatut !== 'exporte' && !auxArchives[f.id];
            if (blobAttendu) nbBlobsAttendus++;
            try {
                var pattern = new RegExp('^' + DOSSIER_TRAVAUX + '/' + _echapperRegex(f.id) + '\\.');
                var entries = zip.file(pattern);
                if (entries && entries.length > 0) {
                    var blobData = await entries[0].async('blob');
                    // Verifier les magic bytes : un codex compromis peut contenir
                    // un blob malveillant deguise en image/PDF. Sans ce check,
                    // chargerCodex stocke n'importe quel contenu dans le blob
                    // store, qui sera ensuite servi par travaux-visionneuse.
                    if (window.travauxImport && typeof window.travauxImport.validerMagicBytes === 'function') {
                        var magicOk = await window.travauxImport.validerMagicBytes(blobData);
                        if (!magicOk) {
                            console.warn('📂 Codex : blob refuse (magic bytes invalides) pour ' + f.id);
                            blobsRefusesMagic.push(f.id);
                            continue;
                        }
                    }
                    await travauxStockage.stockerBlob(f.id, blobData, f.etudiantDA, f.productionId, { notifier: false });
                    nbBlobs++;
                } else if (blobAttendu) {
                    console.warn('📂 Codex : blob attendu mais absent du ZIP pour ' + f.id);
                    blobsAbsentsDuZip.push(f.id);
                }
            } catch (e) {
                var raison = 'erreur';
                if (e && e.name === 'QuotaExceededError') raison = 'quota';
                blobsEchecs.push({ id: f.id, raison: raison });
                console.warn('📂 Codex : blob ignoré pour ' + f.id + ' (' + raison + ')', e.message);
            }
            if (j % 5 === 0) {
                _majProgression(
                    35 + Math.round((j / fichiers.length) * 60),
                    'Restauration des fichiers travaux…',
                    nbBlobs + '/' + fichiers.length + ' fichiers'
                );
                await _yield();
            }
        }

        // Marquer les fichiers sans blob pour que la visionneuse affiche l'état
        // manquant au lieu d'un visualiseur vide. Les entrées de `fichiers` sont
        // des références dans donnees[cle] : réécrire les clés après marquage
        // (le snapshot 3-way de l'étape 5 reflète alors l'état réellement stocké).
        var idsManquants = {};
        blobsRefusesMagic.forEach(function(id) { idsManquants[id] = true; });
        blobsAbsentsDuZip.forEach(function(id) { idsManquants[id] = true; });
        blobsEchecs.forEach(function(e) { idsManquants[e.id] = true; });
        if (Object.keys(idsManquants).length > 0) {
            // #1011 (1er oct. 2026) : quand l'espace manque, cette réécriture est
            // refusée elle aussi. Elle ne doit pas emporter l'ouverture : les
            // données sont écrites, le bilan de l'ouverture incomplète doit être rendu
            // et le rechargement proposé. Une clé dont le marquage n'a pas pu
            // s'écrire reprend ses statuts d'avant, pour que la mémoire et le
            // snapshot de l'étape 5 disent ce qui est réellement stocké.
            for (var k = 0; k < clesFTImport.length; k++) {
                var listeFT = donnees[clesFTImport[k]];
                if (!Array.isArray(listeFT)) continue;
                var statutsAvant = [];
                listeFT.forEach(function(fic) {
                    if (!idsManquants[fic.id]) return;
                    statutsAvant.push({ fic: fic, avait: Object.prototype.hasOwnProperty.call(fic, 'blobStatut'), statut: fic.blobStatut });
                    fic.blobStatut = 'manquant';
                });
                if (statutsAvant.length === 0) continue;
                try {
                    await db.set(clesFTImport[k], listeFT);
                } catch (eMarquage) {
                    statutsAvant.forEach(function(s) {
                        if (s.avait) s.fic.blobStatut = s.statut;
                        else delete s.fic.blobStatut;
                    });
                    console.warn('[Codex] Marquage des copies manquantes non écrit pour ' + clesFTImport[k] + ' :', eMarquage && (eMarquage.message || eMarquage.name));
                }
            }
        }
    }

    // 5. Stocker l'index haché des données chargées comme snapshot de référence
    //    pour la fusion 3-way — #334 C (le TimeMachine a été retiré le 28 avril 2026 — #250)
    //    #1011 : un snapshot refusé (espace plein) n'emporte pas l'ouverture non
    //    plus. On tente alors de retirer l'ancien, pour qu'une fusion ne se
    //    réfère pas au codex précédent.
    try {
        await _ecrireSnapshotAvant(donnees);
    } catch (eSnapshot) {
        console.warn('[Codex] Snapshot de référence non écrit :', eSnapshot && (eSnapshot.message || eSnapshot.name));
        try {
            await db.remove(CLE_SNAPSHOT_AVANT);
        } catch (eRetrait) {
            console.warn('[Codex] Ancien snapshot de référence non retiré :', eRetrait && (eRetrait.message || eRetrait.name));
        }
    }

    // 5 bis. Vérification d'écriture (#335 Lot C, 11 juin 2026) : relire en
    // IndexedDB les clés témoins du modèle et comparer à ce qui vient d'être
    // écrit. Leçon de l'incident bis du 11 juin : une écriture qui ne persiste
    // pas (ou une copie périmée qui survit en IDB) ressuscite un ancien état
    // au prochain rechargement — ça ne doit JAMAIS passer sous silence.
    _majProgression(96, 'Vérification de la persistance…');
    await db.flush();
    var ecartsPersistance = await _verifierEcritureTemoins(donnees);
    if (ecartsPersistance.length > 0) {
        // Une seule retentative ciblée, puis alerte honnête.
        console.warn('[Codex] Persistance non confirmée pour : ' + ecartsPersistance.join(', ') + ' — retentative.');
        for (var ep = 0; ep < ecartsPersistance.length; ep++) {
            await db.set(ecartsPersistance[ep], donnees[ecartsPersistance[ep]]);
        }
        await db.flush();
        ecartsPersistance = await _verifierEcritureTemoins(donnees, ecartsPersistance);
    }
    if (ecartsPersistance.length > 0) {
        console.error('[Codex] Échec de persistance après retentative : ' + ecartsPersistance.join(', '));
        await uiDialogues.informer({
            titre: 'Vérification de persistance échouée',
            message: 'Vérification de persistance échouée pour ' + ecartsPersistance.length
                + ' clé(s) : ' + ecartsPersistance.join(', ')
                + '\n\nTes données sont chargées pour cette session, mais le stockage du navigateur '
                + 'n\'a pas confirmé l\'écriture — au prochain rechargement, une ANCIENNE version '
                + 'pourrait réapparaître.\n\nQuoi faire : réessaie « Ouvrir un codex » avec le même '
                + 'fichier ; si le problème persiste, libère de l\'espace disque puis réessaie.',
            preformate: true
        });
    }

    // 5 ter. Purge de l'espace précédent (#336 Lot D — phase PREVIEW, 11 juin
    // 2026). Ouvrir un codex = REMPLACEMENT : ce qui n'est pas dans le codex
    // importé est un résidu de l'espace précédent (doublement Safari, constat
    // iPad du 11 juin). AUCUNE suppression automatique tant que la preview
    // n'est pas validée sur le terrain (critère de fin du plan #335/#336) —
    // on planifie, on affiche, et Codex.purgerEspacePrecedent() exécute sur
    // décision humaine. Périmètre strictement import complet : la fusion et
    // la comparaison ne passent jamais ici.
    try {
        var clesStockage = await db.keys();
        var blobIdsStockage = (typeof db.listBlobIds === 'function') ? await db.listBlobIds() : [];
        // T2 : le codex ne porte plus le démo ; les fichiers du démo installé ne sont pas des résidus.
        var listesDuDemoInstalle = {};
        for (var ld = 0; ld < LISTES_DU_DEMO.length; ld++) {
            listesDuDemoInstalle[LISTES_DU_DEMO[ld]] = await db.get(LISTES_DU_DEMO[ld], null);
        }
        var planPurge = _planifierPurgeEspace(donnees, clesStockage, blobIdsStockage, _idsDuDemo(listesDuDemoInstalle));
        _dernierPlanPurge = planPurge;
        if (planPurge.clesOrphelines.length === 0 && planPurge.blobsOrphelins.length === 0) {
            console.warn('[Codex] #336 purge (preview) : aucun orphelin — espace déjà propre.');
            _dernierPlanPurge = null;
            await db.remove(CLE_PLAN_PURGE);
        } else {
            // Persister AVANT le reload proposé par actionOuvrir : la console
            // est effacée et la mémoire du module perdue — le plan est
            // réaffiché au boot par _restaurerPlanPurge().
            db.setSync(CLE_PLAN_PURGE, {
                plan: planPurge,
                date: new Date().toISOString(),
                fichier: (fichierZip && fichierZip.name) || null
            });
            _afficherPlanPurge(planPurge, 'survivra au rechargement');
        }
    } catch (ePurge) {
        // La preview ne doit jamais faire échouer un import réussi.
        console.warn('[Codex] #336 preview de purge impossible :', ePurge.message || ePurge);
    }

    // 6. Mettre à jour l'état
    _majProgression(98, 'Finalisation…');
    const maintenant = new Date().toISOString();
    _etat.actif = true;
    _etat.nom = manifeste.nom;
    _etat.derniereSauvegarde = maintenant;
    _etat.modificationsDepuis = null;
    _etat.manifeste = manifeste;
    _sauvegarderEtat();
    _mettreAJourIndicateur();

    const duree = Math.round(performance.now() - debut);
    const stats = {
        nbCles: nbCles,
        nbBlobs: nbBlobs,
        nbBlobsAttendus: nbBlobsAttendus,
        blobsEchecs: blobsEchecs,
        blobsRefusesMagic: blobsRefusesMagic,
        blobsAbsentsDuZip: blobsAbsentsDuZip,
        incomplet: (blobsEchecs.length + blobsRefusesMagic.length + blobsAbsentsDuZip.length) > 0,
        dureeMs: duree
    };

    _majProgression(
        100,
        stats.incomplet ? 'Import terminé — incomplet' : 'Codex chargé !',
        nbCles + ' clés, ' + nbBlobs + (stats.incomplet ? '/' + nbBlobsAttendus : '') + ' fichiers'
    );
    await new Promise(function(r) { setTimeout(r, 800); });
    _masquerProgression();

    return { manifeste, stats };

    } catch (erreur) {
        _masquerProgression();
        throw erreur;
    }
}

/**
 * Construit le bilan d'une ouverture incomplète (#334 session B), tel que le porte la
 * fenêtre de rechargement (#1012) : son titre, et son message qui finit par la question.
 * Fonction pure : ne lit ni le DOM ni le stockage — testable en Vitest. Appelée seulement
 * quand il manque au moins une copie (`stats.incomplet`).
 *
 * Un seul cadre, celui du manque d'espace (mots acceptés par Grégoire le 1er oct. 2026,
 * 12 h 40) : le titre, une première phrase qui compte, « Tes données, elles, sont
 * complètes… », le conseil, la question. Seuls la première phrase et le conseil changent
 * avec la cause ; les mots des trois autres causes ont été acceptés par Grégoire le même
 * jour (17 h 55) et remplacent les phrases de #334.
 *
 * Un MÉLANGE de causes (composition de Cowork) : une première phrase qui donne le nombre par
 * cause, puis le conseil de chaque cause présente, celui de l'espace en premier. Chaque
 * conseil y est précédé du nom de sa cause, repris de la première phrase : sans lui, « rouvre
 * le même codex » et « rouvrir le même codex ne les ramènera pas » se suivraient sans qu'on
 * sache de quelles copies chacun parle.
 * @param {{nbCles: number, nbBlobs: number, nbBlobsAttendus: number,
 *          blobsEchecs: Array<{id: string, raison: string}>,
 *          blobsRefusesMagic: string[], blobsAbsentsDuZip: string[]}} stats
 * @returns {{titre: string, message: string}}
 */
function construireBilanImport(stats) {
    var echecs = stats.blobsEchecs || [];
    var nbQuota = echecs.filter(function(e) { return e.raison === 'quota'; }).length;
    var compte = function(n) { return n + (n === 1 ? ' copie' : ' copies') + ' sur ' + stats.nbBlobsAttendus; };

    // Dans l'ordre de la phrase d'un mélange, qui est aussi celui des conseils.
    var causes = [
        {
            n: nbQuota,
            phrase: function(une) { return (une ? ' n\'a pas pu revenir' : ' n\'ont pas pu revenir') + ', faute d\'espace.'; },
            part: function() { return 'faute d\'espace'; },
            conseil: function(une) {
                return 'Pour retrouver ' + (une ? 'cette copie' : 'ces copies') + ' : si tu es en navigation privée, ' +
                    'rouvre l\'application dans une fenêtre normale. Sinon, libère de l\'espace sur le disque de ' +
                    'l\'appareil (vide la corbeille, retire de gros fichiers), puis rouvre le même codex.';
            }
        },
        {
            n: (stats.blobsAbsentsDuZip || []).length,
            phrase: function(une) { return (une ? ' n\'est pas' : ' ne sont pas') + ' dans ce fichier de codex.'; },
            part: function(une) { return (une ? 'absente' : 'absentes') + ' du fichier'; },
            conseil: function(une) {
                return (une ? 'Elle manquait' : 'Elles manquaient') + ' déjà quand ce codex a été écrit : le rouvrir ne ' +
                    (une ? 'la' : 'les') + ' ramènera pas. ' + (une ? 'Cherche-la' : 'Cherche-les') +
                    ' dans un codex plus ancien ou dans une archive.';
            }
        },
        {
            n: (stats.blobsRefusesMagic || []).length,
            phrase: function(une) {
                return (une ? ' n\'a pas été reprise : son contenu' : ' n\'ont pas été reprises : leur contenu') +
                    ' n\'est ni une image ni un PDF.';
            },
            part: function() { return 'dans un format non reconnu'; },
            conseil: function(une) { return 'Rouvrir le même codex ne ' + (une ? 'la' : 'les') + ' ramènera pas.'; }
        },
        {
            n: echecs.length - nbQuota,
            phrase: function(une) { return (une ? ' n\'a pas pu revenir' : ' n\'ont pas pu revenir') + ', à cause d\'une erreur.'; },
            part: function() { return 'à cause d\'une erreur'; },
            // Sans « : le détail y sera » (mots proposés) : mesuré par le geste le 1er oct. 2026,
            // le détail de l'erreur est dans le signalement tant que la page n'est pas rechargée,
            // et n'y est plus après « Recharger », le bouton principal de cette même fenêtre.
            conseil: function(une) {
                return 'Pour retrouver ' + (une ? 'cette copie' : 'ces copies') + ' : rouvre le même codex. Si l\'erreur ' +
                    'revient, utilise « Signaler un bug ou donner ton avis ».';
            }
        }
    ].filter(function(c) { return c.n > 0; });

    var nbManquantes = causes.reduce(function(somme, c) { return somme + c.n; }, 0);
    var premiere, conseils;
    if (causes.length === 1) {
        premiere = compte(nbManquantes) + causes[0].phrase(nbManquantes === 1);
        conseils = [causes[0].conseil(nbManquantes === 1)];
    } else {
        premiere = compte(nbManquantes) + ' n\'ont pas pu revenir : ' +
            causes.map(function(c) { return c.n + ' ' + c.part(c.n === 1); }).join(', ') + '.';
        conseils = causes.map(function(c) {
            var nom = c.part(c.n === 1);
            return nom.charAt(0).toUpperCase() + nom.slice(1) + '. ' + c.conseil(c.n === 1);
        });
    }

    return {
        titre: 'Codex ouvert, mais incomplet',
        message: premiere + ' Tes données, elles, sont complètes, et ton fichier de codex n\'a pas changé.\n\n' +
            conseils.join('\n\n') + '\n\n' +
            'Recharger la page pour appliquer les données ?'
    };
}

/**
 * #1012 — les mots de l'avertissement à l'écriture d'un codex auquel des copies manquent
 * (acceptés par Grégoire le 1er oct. 2026, 17 h 52 ; l'accord en nombre est de la grammaire).
 * Fonction pure, testable en Vitest.
 * @param {number} manquantes - copies attendues sans fichier dans l'application (au moins 1)
 * @param {number} attendues - copies attendues (statut autre que « exporte »)
 * @returns {{titre: string, message: string, texteConfirmer: string}}
 */
function construireAvertissementCopiesManquantes(manquantes, attendues) {
    var une = manquantes === 1;
    return {
        titre: 'Ce codex n\'aura pas toutes tes copies',
        message: _direCopiesAbsentes(manquantes, attendues, 'Le codex') + '\n\n' +
            'Si un autre fichier de codex ' + (une ? 'la' : 'les') + ' contient encore, ne le remplace pas : ' +
            'donne un autre nom à celui-ci.',
        texteConfirmer: une ? 'Écrire sans cette copie' : 'Écrire sans ces copies'
    };
}

/**
 * #1012 — les mots de l'avertissement à l'export d'une sélection à laquelle des copies manquent
 * (acceptés par Grégoire le 2 oct. 2026, 7 h 21). Pas de seconde phrase : une sélection demande
 * toujours où écrire et ne s'écrit jamais dans le fichier tenu. Fonction pure, testable en Vitest.
 * @param {number} manquantes - copies attendues sans fichier dans l'application (au moins 1)
 * @param {number} attendues - copies attendues de la sélection (statut autre que « exporte »)
 * @returns {{titre: string, message: string, texteConfirmer: string}}
 */
function construireAvertissementSelectionIncomplete(manquantes, attendues) {
    return {
        titre: 'Cette sélection n\'aura pas toutes ses copies',
        message: _direCopiesAbsentes(manquantes, attendues, 'Le fichier'),
        texteConfirmer: manquantes === 1 ? 'Écrire sans cette copie' : 'Écrire sans ces copies'
    };
}

/** #1012 — les deux phrases communes aux deux avertissements ; `sujet` : « Le codex » ou « Le fichier ». */
function _direCopiesAbsentes(manquantes, attendues, sujet) {
    var une = manquantes === 1;
    return manquantes + (une ? ' copie' : ' copies') + ' sur ' + attendues +
        (une ? ' n\'est pas' : ' ne sont pas') + ' dans l\'application. ' +
        sujet + ' que tu vas écrire ne ' + (une ? 'la' : 'les') + ' contiendra pas.';
}

/**
 * #1012 — le compte des copies attendues et manquantes, partagé par la génération du codex et
 * l'export d'une sélection. « Attendue » : une entrée de la liste des copies dont le statut
 * déclaré n'est pas « exporte » (celle-là a quitté l'application, c'est voulu). Une copie
 * attendue dont le fichier ne se lit pas ne sera pas dans le fichier écrit : elle manque.
 * Compté à la lecture des fichiers, jamais lu dans les statuts (un marquage « manquant » refusé
 * faute d'espace laisse des copies absentes se dire présentes).
 * @returns {{attendues: number, manquantes: number, noter: function(Object, boolean)}}
 */
function _creerCompteDesCopies() {
    var compte = { attendues: 0, manquantes: 0 };
    compte.noter = function(copie, trouvee) {
        if (copie.blobStatut === 'exporte') return;
        // #1028 : une copie aux archives a quitté l'application, c'est voulu ; la marque voyage
        // dans le codex, qui ne prétend donc pas la contenir.
        if (!trouvee && window.ReserveCopies && window.ReserveCopies.estAuxArchives(copie.id)) return;
        compte.attendues++;
        if (!trouvee) compte.manquantes++;
    };
    return compte;
}

/* ===============================
   PRÉ-VOL STOCKAGE (#334 session A)
   =============================== */

// Marges du pré-vol (plan #334 §A.3) — marges TECHNIQUES documentées, pas des
// valeurs métier : double écriture JSON tant que la session C (snapshot haché)
// n'est pas livrée, enrobage structured-clone/SQLite WebKit (~10-20 %),
// estimate() arrondi volontairement par WebKit. Conserver 1,5 même après C
// (fragmentation).
var PREVOL_FACTEUR_MARGE = 1.5;
var PREVOL_PLANCHER_LIBRE = 100 * 1024 * 1024;  // coussin de fonctionnement post-import
var PREVOL_FACTEUR_ZIP = 3;       // D6 : taille décompressée inconnue → borne conservatrice
                                  // (blobs quasi incompressibles, JSON ~×5)
var PREVOL_QUOTA_PRIVE = 500 * 1024 * 1024;     // heuristique navigation privée WebKit

/**
 * Évalue si l'espace accordé par le navigateur suffit pour ouvrir un codex.
 * Fonction PURE (ne lit ni navigator ni le DOM) — testable en Vitest.
 *
 * @param {number} tailleDecompressee - Somme des entrées du ZIP (0 = inconnue, cf. D6)
 * @param {number} tailleZip - Taille du fichier ZIP (fallback quand tailleDecompressee = 0)
 * @param {{usage: number, quota: number}|null} estimation - storage.estimate(), ou null si indisponible
 * @returns {{verdict: 'ok'|'refus'|'inconnu', besoin: number, disponible: number,
 *            manque: number, approximatif: boolean, quotaFaible: boolean}}
 */
function evaluerPrevolStockage(tailleDecompressee, tailleZip, estimation) {
    var approximatif = !(tailleDecompressee > 0);
    var besoin = (approximatif
        ? (tailleZip || 0) * PREVOL_FACTEUR_ZIP
        : tailleDecompressee * PREVOL_FACTEUR_MARGE) + PREVOL_PLANCHER_LIBRE;

    if (!estimation || !(estimation.quota > 0)) {
        return { verdict: 'inconnu', besoin: besoin, disponible: 0, manque: 0,
                 approximatif: approximatif, quotaFaible: false };
    }

    var disponible = Math.max(0, estimation.quota - (estimation.usage || 0));
    var manque = Math.max(0, besoin - disponible);
    return {
        verdict: manque > 0 ? 'refus' : 'ok',
        besoin: besoin,
        disponible: disponible,
        manque: manque,
        approximatif: approximatif,
        quotaFaible: estimation.quota < PREVOL_QUOTA_PRIVE
    };
}

/* ===============================
   VALIDATION
   =============================== */

/**
 * Vérifie si un fichier est un Codex valide.
 * @param {File|Blob} fichierZip
 * @returns {Promise<{valide: boolean, erreurs: string[], _zip?: JSZip, _manifeste?: Object}>}
 */
async function validerCodex(fichierZip) {
    const erreurs = [];

    // 1. Taille minimale
    if (!fichierZip || fichierZip.size === 0) {
        return { valide: false, erreurs: ['Fichier vide'] };
    }

    // 2. Charger le ZIP
    let zip;
    try {
        const buffer = await _lireCommeArrayBuffer(fichierZip);
        zip = await JSZip.loadAsync(buffer);
    } catch (e) {
        return { valide: false, erreurs: ['Fichier ZIP invalide : ' + e.message] };
    }

    // 2b. Validation sécurité ZIP (taille décompressée + path traversal)
    var tailleDecompressee = 0;
    if (typeof validerZipSecurite === 'function') {
        var securite = validerZipSecurite(zip);
        if (!securite.valide) {
            return { valide: false, erreurs: [securite.erreur] };
        }
        tailleDecompressee = securite.tailleDecompressee || 0;
    }

    // 3. Vérifier la présence du manifeste (accepte aussi l'ancien nom)
    var entreeManifeste = zip.file(NOM_MANIFESTE) || zip.file(NOM_MANIFESTE_ANCIEN);
    if (!entreeManifeste) {
        erreurs.push('Manifeste manquant (' + NOM_MANIFESTE + ' ou ' + NOM_MANIFESTE_ANCIEN + ')');
    }

    // 4. Vérifier la présence des données
    const entreeDonnees = zip.file(NOM_DONNEES);
    if (!entreeDonnees) {
        erreurs.push('Données manquantes (' + NOM_DONNEES + ')');
    }

    if (erreurs.length > 0) {
        return { valide: false, erreurs };
    }

    // 5. Lire et valider le manifeste
    let manifeste;
    try {
        const manifesteStr = await entreeManifeste.async('string');
        manifeste = JSON.parse(manifesteStr);
    } catch (e) {
        return { valide: false, erreurs: ['Manifeste illisible : ' + e.message] };
    }

    if (!manifeste.formatVersion) {
        erreurs.push('Version de format manquante dans le manifeste');
    }

    if (manifeste.formatVersion > FORMAT_VERSION) {
        erreurs.push(`Format trop récent (v${manifeste.formatVersion}), cette version supporte v${FORMAT_VERSION}`);
    }

    // 6. Vérifier que les données JSON sont lisibles ET respectent le schema
    // attendu : un objet (pas null, pas un tableau, pas un primitif). Schema
    // validation minimale -- validerCodex est l'unique frontiere avant que
    // les donnees touchent le storage de l'app. Cf. SKILL_Securite_donnees §9.1.2.
    try {
        const jsonStr = await entreeDonnees.async('string');
        const donnees = JSON.parse(jsonStr);
        if (donnees === null || typeof donnees !== 'object' || Array.isArray(donnees)) {
            erreurs.push('Données JSON invalides : objet attendu, recu ' + (Array.isArray(donnees) ? 'tableau' : typeof donnees));
        }
    } catch (e) {
        erreurs.push('Données JSON illisibles : ' + e.message);
    }

    return {
        valide: erreurs.length === 0,
        erreurs,
        _zip: zip,
        _manifeste: manifeste,
        _tailleDecompressee: tailleDecompressee
    };
}

/**
 * Lit le manifeste d'un Codex sans charger les données.
 * @param {File|Blob} fichierZip
 * @returns {Promise<Object>} Le manifeste
 */
async function lireManifeste(fichierZip) {
    const buffer = await _lireCommeArrayBuffer(fichierZip);
    const zip = await JSZip.loadAsync(buffer);
    // Validation securite : verifier la taille decompressee et les chemins
    // (path traversal). API publique, doit etre defendue meme si le caller
    // est interne -- le ZIP vient toujours d'un fichier externe.
    if (typeof validerZipSecurite === 'function') {
        var securite = validerZipSecurite(zip);
        if (!securite.valide) {
            throw new Error('ZIP refuse : ' + securite.erreur);
        }
    }
    var entree = zip.file(NOM_MANIFESTE) || zip.file(NOM_MANIFESTE_ANCIEN);
    if (!entree) {
        throw new Error('Ce fichier ne contient pas de manifeste de codex.');
    }
    const str = await entree.async('string');
    return JSON.parse(str);
}

/**
 * Ce fichier est-il un codex ? Répond en ne lisant que le répertoire central du ZIP (la
 * fin du fichier, où le nom de chaque entrée est écrit) : ni le fichier entier, ni JSZip.
 *
 * LOT I BIS (1er oct. 2026) — la case « Ouvrir un Codex » de Réglages › Données doit savoir
 * à qui confier le fichier AVANT de le lire : un codex pèse jusqu'à 1 Go environ sur
 * l'iPad, et le lire une fois pour le reconnaître puis une fois pour l'ouvrir doublerait
 * la mémoire demandée. Cette réponse ne VALIDE rien, elle aiguille : le fichier reconnu
 * passe ensuite par chargerCodex, donc par validerCodex et validerZipSecurite, comme
 * au menu.
 *
 * @param {File|Blob} fichier
 * @returns {Promise<boolean|null>} true : le manifeste d'un codex y est nommé ; false : un
 *   ZIP lisible, sans ce manifeste ; null : illisible par ce moyen (pas un ZIP, ZIP64,
 *   répertoire hors du fichier ou trop lourd) — à l'appelant de retomber sur sa lecture.
 */
async function estUnFichierDeCodex(fichier) {
    try {
        var entrees = await window.ReserveVerifier.lireRepertoireZip(fichier);
        return entrees.some(function(e) {
            return e.nom === NOM_MANIFESTE || e.nom === NOM_MANIFESTE_ANCIEN;
        });
    } catch (e) {
        return null;
    }
}

/* ===============================
   LECTURE EXTERNE (FUSION — Phase 3)
   =============================== */

/**
 * Lit un codex ZIP en mémoire SANS écrire dans IndexedDB.
 * Utilisé pour la comparaison et la fusion avec un autre codex.
 *
 * @param {File|Blob} fichierZip - Le fichier ZIP à lire
 * @returns {Promise<{manifeste: Object, donnees: Object, travauxListe: string[]}>}
 *   - manifeste : le manifeste complet du codex externe
 *   - donnees : toutes les clés/valeurs de donnees.json (en mémoire)
 *   - travauxListe : liste des chemins de fichiers dans travaux/ (ex: "travaux/FT_abc123.pdf")
 */
async function lireCodexExterne(fichierZip) {
    if (typeof JSZip === 'undefined') {
        throw new Error('JSZip non disponible.');
    }

    // 1. Valider le ZIP
    var validation = await validerCodex(fichierZip);
    if (!validation.valide) {
        throw new Error('Codex invalide : ' + validation.erreurs.join(', '));
    }

    var zip = validation._zip;
    var manifeste = validation._manifeste;

    // 2. Extraire les données JSON en mémoire
    var jsonStr = await zip.file(NOM_DONNEES).async('string');
    // T2 : la fusion n'écrit pas le démo d'un codex d'avant G1, ni ses fichiers.
    var brut = JSON.parse(jsonStr);
    var partDuDemo = _partDuDemo(brut);
    var donnees = _sansLeDemo(brut, partDuDemo);

    // 3. Lister les fichiers travaux (sans les extraire)
    var travauxListe = [];
    zip.forEach(function(cheminRelatif) {
        if (cheminRelatif.startsWith(DOSSIER_TRAVAUX + '/') && !cheminRelatif.endsWith('/')) {
            var nom = cheminRelatif.slice(DOSSIER_TRAVAUX.length + 1);
            var point = nom.lastIndexOf('.');
            if (partDuDemo.ids[point > 0 ? nom.slice(0, point) : nom]) return;
            travauxListe.push(cheminRelatif);
        }
    });


    return {
        manifeste: manifeste,
        donnees: donnees,
        travauxListe: travauxListe,
        _zip: zip  // conservé pour extraction ultérieure des blobs lors de la fusion
    };
}

/* ===============================
   ÉTAT DU CLASSEUR
   =============================== */

/**
 * Retourne l'état courant du codex.
 * @returns {Object}
 */
function etatCodex() {
    return {
        actif: _etat.actif,
        nom: _etat.nom,
        derniereSauvegarde: _etat.derniereSauvegarde,
        modificationsNonSauvees: _etat.modificationsDepuis !== null,
        modificationsDepuis: _etat.modificationsDepuis,
        manifeste: _etat.manifeste ? Object.assign({}, _etat.manifeste) : null,
        handleFSAPI: !!_fileHandle      // true si ré-écriture directe possible (Chrome/Edge)
    };
}

/**
 * Marque qu'une modification a eu lieu depuis la dernière écriture du fichier.
 * Lot F (D4) : appelé à chaque « Enregistré » du témoin commun (événement
 * `donnees-enregistrees`, voir initialiserCodex), plus le renommage et la fusion.
 */
function marquerModification() {
    _compteurModifications++;
    if (!_etat.actif) return;
    if (!_etat.modificationsDepuis) {
        _etat.modificationsDepuis = new Date().toISOString();
        _sauvegarderEtat();
    }
    _mettreAJourIndicateur();
}

/**
 * Lot F (D4) : pose l'état « Ton codex est à jour », APRÈS l'écriture réussie du
 * fichier, et seulement là. Le snapshot de référence de la fusion 3-way décrit lui
 * aussi le fichier : il est écrit ici, pas avant (un aperçu annulé le laissait
 * pointer vers un fichier qui n'existait pas).
 * Une modification survenue pendant la génération n'est pas dans le fichier : le
 * codex reste alors « pas à jour ».
 * @param {{manifeste: Object, donnees: Object, compteurAuDebut: number}} resultat - rendu par genererCodex
 */
async function _marquerCodexAJour(resultat) {
    var donnees = resultat.donnees;
    await _ecrireSnapshotAvant(donnees);
    _etat.actif = true;
    _etat.nom = resultat.manifeste.nom;
    _etat.derniereSauvegarde = resultat.manifeste.dateDerniereModification;
    _etat.manifeste = resultat.manifeste;
    if (_compteurModifications === resultat.compteurAuDebut) {
        _etat.modificationsDepuis = null;
    } else if (!_etat.modificationsDepuis) {
        _etat.modificationsDepuis = new Date().toISOString();
    }
    _sauvegarderEtat();
    _mettreAJourIndicateur();
    // Lot I (#985, D8) : un codex à jour repousse le rappel. Posé ici, pas au clic.
    if (window.backupReminder && typeof window.backupReminder.reporterApresMiseAJourDuCodex === 'function') {
        window.backupReminder.reporterApresMiseAJourDuCodex();
    }
}

/**
 * Désactive le codex actif (retour au mode local seul).
 */
function fermerCodex() {
    _etat.actif = false;
    _etat.nom = '';
    _etat.derniereSauvegarde = null;
    _etat.modificationsDepuis = null;
    _etat.manifeste = null;
    _fileHandle = null;
    _sauvegarderEtat();
    _mettreAJourIndicateur();
    // Effacer le snapshot de référence (utilisé par la fusion 3-way) — il appartenait
    // au codex qu'on vient de fermer
    db.remove(CLE_SNAPSHOT_AVANT);
}

/* ===============================
   SAUVEGARDE MULTI-PLATEFORME
   =============================== */

/**
 * Écrit un blob via un FileSystemFileHandle FSAPI existant.
 * @param {FileSystemFileHandle} handle
 * @param {Blob} blob
 * @returns {Promise<void>}
 */
async function _ecrireViaHandle(handle, blob) {
    // FSAPI atomicité : createWritable() écrit dans un fichier temporaire.
    // close() remplace l'original atomiquement. abort() annule sans corruption.
    // Si crash avant close(), l'ancien fichier est préservé (comportement Chrome).
    var writable = await handle.createWritable();
    try {
        await writable.write(blob);
        await writable.close();
    } catch (e) {
        // Écriture échouée → avorter proprement sans corrompre le fichier original
        try { await writable.abort(); } catch (_) { /* ignore abort error */ }
        throw e;
    }
}

/**
 * Sauvegarde le codex vers un emplacement choisi par l'utilisateur.
 * Détecte la meilleure stratégie selon le navigateur :
 * 1. showSaveFilePicker (Chrome/Edge — choix de destination natif)
 * 2. navigator.share (iPad Safari — "Enregistrer dans Fichiers")
 * 3. <a download> (fallback — dossier Téléchargements)
 *
 * Lot G (#988) : `options.sansRepli` (la mise à jour du codex) : un partage qui échoue,
 * AbortError comprise, rend `{ methode: 'echec' }` au lieu de glisser en silence vers le
 * téléchargement ; l'appelant le dit et propose lui-même « Télécharger à la place »
 * (`options.telechargementDirect`). Sans ces options (export sélectif), un partage qui
 * échoue glisse encore vers le téléchargement.
 * Chaque résultat nomme sa `strategie` ; un échec porte son `erreur`.
 *
 * @param {Blob} blob - Le blob ZIP du codex
 * @param {string} nomFichier - Le nom de fichier suggéré
 * @param {Object} [options]
 * @param {boolean} [options.forcerDialogue=false] - Force le dialogue même si un handle existe
 * @param {boolean} [options.sansAdoption=false] - #1012 : la destination choisie n'est pas tenue ensuite
 * @param {boolean} [options.sansRepli=false] - Un échec du partage est rendu, pas replié
 * @param {boolean} [options.telechargementDirect=false] - Stratégie 3 seule
 * @param {function(string): Promise<boolean>} [options.toucherFrais] - Lot J0 bis : appelée
 *   avant le partage (et, depuis #995, avant la fenêtre de choix de fichier) quand le toucher
 *   n'est plus actif ; rend true si l'usager en a donné un
 *   frais, false s'il renonce (rendu `annule`, avec `toucherRefuse`)
 * @param {function(boolean): void} [options.attentePartage] - Lot J0 ter : appelée, de façon
 *   synchrone, avec true juste avant `navigator.share`, puis avec false quand il se termine
 * @returns {Promise<{methode: string, strategie: string, erreur?: Error, toucherRefuse?: boolean}>}
 */
async function sauvegarderVersDestination(blob, nomFichier, options) {
    var forcerDialogue = options && options.forcerDialogue;
    var sansRepli = !!(options && options.sansRepli);
    var sansAdoption = !!(options && options.sansAdoption);
    if (options && options.telechargementDirect) return window.FichierSortant.telecharger(blob, nomFichier);

    // Stratégie 1a : Ré-écriture directe via handle FSAPI existant (pas de dialogue)
    if (_fileHandle && !forcerDialogue) {
        try {
            await _ecrireViaHandle(_fileHandle, blob);
            return { methode: 'fsapi', strategie: 'fichier tenu (FSAPI)' };
        } catch (e) {
            // Handle invalide (fichier déplacé, clé USB retirée, etc.)
            // Issue 3 assumée (15 oct. 2026) : la cause de ce premier échec ne parvient pas au message ;
            // le second échec, par la fenêtre de choix, porte la sienne (seule son annulation la perd).
            console.warn('📂 Handle FSAPI invalide, on redemande...', e.message);
            _fileHandle = null;
        }
    }

    // Stratégie 1b : File System Access API avec dialogue (Chrome/Edge sur Mac/PC)
    if (window.showSaveFilePicker) {
        // #995 : la fenêtre de choix exige aussi un toucher actif. Mesuré le 11 oct. 2026 sous
        // Chrome 154 : actif à 4,8 s, éteint à 5 s ; au-delà, SecurityError (« Must be handling a
        // user gesture to show a file picker ») et « Codex non mis à jour ». Même remède que le partage.
        var motifFenetre = options && typeof options.toucherFrais === 'function' ? _motifToucherFrais() : null;
        if (motifFenetre && !(await options.toucherFrais(motifFenetre))) {
            return { methode: 'annule', strategie: 'fenêtre de choix (FSAPI)', toucherRefuse: true };
        }
        try {
            var handle = await window.showSaveFilePicker({
                suggestedName: nomFichier,
                types: [{
                    description: 'Codex Labo Codex',
                    accept: { 'application/zip': ['.zip'] }
                }]
            });
            await _ecrireViaHandle(handle, blob);
            // Conserver le handle pour les sauvegardes suivantes — sauf `sansAdoption` (#1012) :
            // ce fichier-là n'est pas le codex de l'espace (une sélection, ou un codex écrit
            // sans toutes ses copies) ; le réécrire en place plus tard serait le défaut.
            if (!sansAdoption) _fileHandle = handle;
            return { methode: 'fsapi', strategie: 'fenêtre de choix (FSAPI)' };
        } catch (e) {
            // Ici, AbortError ne vient que de l'usager (« Annuler » de la fenêtre de choix) :
            // elle reste une annulation, comme l'aperçu refusé (banc du lot F, g).
            if (e.name === 'AbortError') {
                return { methode: 'annule', strategie: 'fenêtre de choix (FSAPI)', erreur: e };
            }
            console.warn('📂 FSAPI échoué, fallback...', e.message);
            if (sansRepli) return { methode: 'echec', strategie: 'fenêtre de choix (FSAPI)', erreur: e };
        }
    }

    // Stratégie 2 : Web Share API (iPad Safari)
    if (_peutPartagerFichier(blob, nomFichier)) {
        // Lot J0 bis (#988) : le partage exige un toucher encore actif. Expiré (préparation
        // longue), on en demande un frais au lieu d'aller au refus.
        var motifToucher = options && typeof options.toucherFrais === 'function' ? _motifToucherFrais() : null;
        if (motifToucher && !(await options.toucherFrais(motifToucher))) {
            return { methode: 'annule', strategie: 'partage (Enregistrer dans Fichiers)', toucherRefuse: true };
        }
        var attentePartage = options && typeof options.attentePartage === 'function' ? options.attentePartage : null;
        try {
            var fichier = new File([blob], nomFichier, { type: 'application/zip' });
            // Lot J0 ter (#988) : le message d'attente se pose de façon SYNCHRONE, juste avant
            // l'appel. Rien d'asynchrone (ni await, ni minuterie) entre le toucher et le partage.
            if (attentePartage) attentePartage(true);
            await navigator.share({
                files: [fichier],
                title: 'Codex Labo Codex'
            });
            return { methode: 'share', strategie: 'partage (Enregistrer dans Fichiers)' };
        } catch (e) {
            // #988 : sur l'iPad, AbortError vient de l'usager qui ferme la feuille OU d'un
            // refus du système ; on ne peut pas les distinguer. Avec `sansRepli`, c'est un
            // échec dit, jamais une sortie muette.
            console.warn('[Codex] Partage du fichier échoué : ' + e.name + ' – ' + e.message);
            if (sansRepli) return { methode: 'echec', strategie: 'partage (Enregistrer dans Fichiers)', erreur: e };
            if (e.name === 'AbortError') {
                return { methode: 'annule', strategie: 'partage (Enregistrer dans Fichiers)', erreur: e };
            }
        } finally {
            // Réussite, échec ou feuille refermée : le message d'attente s'en va.
            if (attentePartage) attentePartage(false);
        }
    }

    // Stratégie 3 : Téléchargement classique (fallback universel). Rend `download` : il est
    // LANCÉ ; l'application ne peut pas savoir s'il s'est terminé (js/fichier-sortant.js).
    return window.FichierSortant.telecharger(blob, nomFichier);
}

/**
 * Lot J0 bis (#988) : faut-il un toucher frais avant `navigator.share` ? WebKit refuse le
 * partage (NotAllowedError) quand l'activation du dernier toucher a expiré : environ 5 s,
 * mesuré le 30 sept. 2026 sous WebKit 26.4 (actif à 4,5 s, éteint à 5,5 s), et vécu sur
 * l'iPad le même jour (préparation de 8 s, codex de 1,3 Go). `navigator.userActivation.isActive`
 * lit cette même activation. API absente (Safari d'avant 16.4) : on ne sait pas, on demande.
 * @returns {string|null} le motif de la demande, ou null si le toucher est encore actif
 */
function _motifToucherFrais() {
    var activation = navigator.userActivation;
    if (!activation) return 'activation illisible';
    return activation.isActive === true ? null : 'toucher expiré';
}

/**
 * Ouvre un dialogue de sélection de fichier pour choisir un codex.
 * @returns {Promise<File|null>} Le fichier sélectionné ou null si annulé
 */
function ouvrirDialogueFichier() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip';
        input.style.display = 'none';
        input.addEventListener('change', () => {
            const fichier = input.files[0] || null;
            document.body.removeChild(input);
            resolve(fichier);
        });
        // Gérer l'annulation (le change ne se déclenche pas)
        input.addEventListener('cancel', () => {
            document.body.removeChild(input);
            resolve(null);
        });
        document.body.appendChild(input);
        input.click();
    });
}

/* ===============================
   YIELD — CÉDER LE THREAD POUR LE RENDU
   =============================== */

/**
 * Cède le thread principal au navigateur pour qu'il puisse peindre.
 * Utilise requestAnimationFrame + setTimeout pour garantir un cycle de rendu.
 */
function _yield() {
    return new Promise(function(resolve) {
        requestAnimationFrame(function() {
            setTimeout(resolve, 0);
        });
    });
}

/* ===============================
   OVERLAY DE PROGRESSION — délégué à window.afficherProgression (#229)
   =============================== */

var _afficherProgression = window.afficherProgression;
var _majProgression = window.majProgression;
var _masquerProgression = window.masquerProgression;

/* ===============================
   UTILITAIRES DE FUSION
   =============================== */

/**
 * Regroupe une liste de clés par préfixe commun (ex: h2026_).
 * Si un préfixe a plus de 3 clés, les condense en "préfixe_* (N clés)".
 * @param {string[]} cles
 * @returns {string[]} Lignes formatées
 */
function _grouperParPrefixe(cles) {
    var groupes = {};
    for (var i = 0; i < cles.length; i++) {
        var parts = cles[i].split('_');
        var prefixe = parts.length > 1 ? parts[0] + '_' : '';
        var reste = prefixe ? cles[i].substring(prefixe.length) : cles[i];
        if (!groupes[prefixe]) groupes[prefixe] = [];
        groupes[prefixe].push(reste);
    }

    var lignes = [];
    var prefixes = Object.keys(groupes);
    for (var j = 0; j < prefixes.length; j++) {
        var p = prefixes[j];
        var items = groupes[p];
        if (items.length <= 3) {
            for (var k = 0; k < items.length; k++) {
                lignes.push(p + items[k]);
            }
        } else {
            lignes.push(p + '* (' + items.length + ' clés)');
        }
    }

    return lignes;
}

/* ===============================
   SNAPSHOT DE FUSION — INDEX HACHÉ (#334 session C)
   =============================== */

/**
 * SHA-256 hexadécimal d'une chaîne. Helper local (même patron que
 * reserve.js) plutôt qu'une dépendance inter-modules : codex.js ne doit pas
 * exiger que reserve.js soit chargé.
 * @param {string} str
 * @returns {Promise<string|null>} hex, ou null si crypto.subtle indisponible
 */
async function _sha256Hex(str) {
    if (typeof crypto === 'undefined' || !crypto.subtle) return null;
    try {
        var data = new TextEncoder().encode(str);
        var buffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(buffer))
            .map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    } catch (e) {
        console.warn('[Codex] Calcul SHA-256 échoué :', e.message || e);
        return null;
    }
}

/**
 * Construit l'index de hachés d'un dataset pour la fusion 3-way.
 * _analyserFusion n'utilise jamais les VALEURS de l'ancêtre — uniquement la
 * présence de clé et l'égalité JSON (audit D4 du plan #334) : un index
 * {clé: hash} est donc sémantiquement identique au dataset intégral.
 * Ignore les clés `_codex_*`, exactement comme _analyserFusion.
 * @param {Object} donnees - Dataset complet (format data.json du codex)
 * @returns {Promise<{__format: string, cles: Object}|null>} null si crypto indisponible
 */
async function _indexerSnapshot(donnees) {
    if (!donnees || typeof donnees !== 'object') return null;
    if (typeof crypto === 'undefined' || !crypto.subtle) {
        console.warn('[Codex] crypto.subtle indisponible — snapshot de fusion non indexé (prochaines fusions en diff 2 parties).');
        return null;
    }
    var index = { __format: FORMAT_SNAPSHOT_HASH, cles: {} };
    var cles = Object.keys(donnees);
    for (var i = 0; i < cles.length; i++) {
        if (cles[i].startsWith('_codex_')) continue;
        index.cles[cles[i]] = await _sha256Hex(JSON.stringify(donnees[cles[i]]));
    }
    return index;
}

/**
 * Écrit le snapshot de référence sous forme d'index haché.
 * Si l'indexation est impossible, retire la clé : un vieux dataset intégral
 * qui traîne vaut moins qu'un diff 2 parties assumé.
 */
async function _ecrireSnapshotAvant(donnees) {
    var index = await _indexerSnapshot(donnees);
    if (index) {
        await db.set(CLE_SNAPSHOT_AVANT, index);
    } else {
        await db.remove(CLE_SNAPSHOT_AVANT);
    }
}

/**
 * Lit le snapshot de référence. Un snapshot legacy (dataset intégral écrit
 * avant la session C) est converti à la volée — l'ancien format n'est plus
 * jamais écrit (migration de données, pas un alias de compat).
 * @returns {Promise<Object|null>} index haché ou null
 */
async function _lireSnapshotAvant() {
    var brut = await db.get(CLE_SNAPSHOT_AVANT, null);
    if (!brut) return null;
    if (brut.__format === FORMAT_SNAPSHOT_HASH) return brut;
    return await _indexerSnapshot(brut);
}

/**
 * Migration one-shot au boot : convertit un gros snapshot legacy en index
 * haché — sinon un utilisateur qui n'enregistre jamais son codex garderait
 * la duplication IDB + memoryCache indéfiniment.
 */
async function _migrerSnapshotVersIndexHash() {
    try {
        var brut = await db.get(CLE_SNAPSHOT_AVANT, null);
        if (!brut || brut.__format === FORMAT_SNAPSHOT_HASH) return false;
        var index = await _indexerSnapshot(brut);
        if (index) {
            await db.set(CLE_SNAPSHOT_AVANT, index);
        } else {
            await db.remove(CLE_SNAPSHOT_AVANT);
        }
        console.warn('[Codex] Snapshot de fusion legacy converti en index haché (' + FORMAT_SNAPSHOT_HASH + ').');
        return true;
    } catch (e) {
        console.warn('[Codex] Conversion du snapshot de fusion échouée :', e.message || e);
        return false;
    }
}

/**
 * Cours référencés par les données d'un trimestre (productions, évaluations,
 * groupes-cours). Sert de signature du MODÈLE de données (#335 Lot A).
 * @returns {string[]} coursId uniques
 */
function _coursReferences(productions, evaluations, groupesCours) {
    var set = {};
    (Array.isArray(productions) ? productions : []).forEach(function(x) { if (x && x.coursId) set[x.coursId] = true; });
    (Array.isArray(evaluations) ? evaluations : []).forEach(function(x) { if (x && x.coursId) set[x.coursId] = true; });
    (Array.isArray(groupesCours) ? groupesCours : []).forEach(function(x) { if (x && x.coursId) set[x.coursId] = true; });
    return Object.keys(set);
}

/**
 * Détecte un codex externe porteur d'un modèle de données DIVERGENT
 * (probablement antérieur) de l'espace courant — #335 Lot A, décisions
 * Grégoire 11 juin 2026 (D2 : marqueur = coursId référencés ; D3 : garde
 * bloquante avec choix, posée par l'appelant).
 *
 * Marqueur : pour chaque trimestre présent des DEUX côtés avec des données,
 * si l'ensemble des coursId référencés par l'externe est totalement DISJOINT
 * de celui de l'espace courant, les deux états ne parlent pas du même modèle
 * (cas réels I1/I3 : codex pré-chantier-D sur COURS1766455789356 vs espace
 * consolidé sur h2026-…). Un chevauchement même partiel = même lignée → pas
 * d'alerte (un backup plus ancien du MÊME modèle reste importable sans bruit).
 *
 * @param {Object} donneesExternes - dataset du codex externe
 * @param {Object|null} manifesteExterne - pour dater l'alerte (appoint)
 * @returns {null|{suspects: Array, dateExterne: string|null}}
 */
function _detecterModeleAnterieur(donneesExternes, manifesteExterne) {
    var tids = {};
    Object.keys(donneesExternes).forEach(function(k) {
        var m = k.match(/^(.+)_(productions|evaluationsSauvegardees|groupesCours)$/);
        if (m && !m[1].startsWith('_')) tids[m[1]] = true;
    });
    var suspects = [];
    Object.keys(tids).forEach(function(tid) {
        var locaux = _coursReferences(
            db.getSync(tid + '_productions', null),
            db.getSync(tid + '_evaluationsSauvegardees', null),
            db.getSync(tid + '_groupesCours', null)
        );
        if (locaux.length === 0) return;   // rien à protéger localement
        var externes = _coursReferences(
            donneesExternes[tid + '_productions'],
            donneesExternes[tid + '_evaluationsSauvegardees'],
            donneesExternes[tid + '_groupesCours']
        );
        if (externes.length === 0) return;
        var commun = externes.some(function(c) { return locaux.indexOf(c) !== -1; });
        if (!commun) suspects.push({ trimestre: tid, locaux: locaux, externes: externes });
    });
    if (suspects.length === 0) return null;
    return {
        suspects: suspects,
        dateExterne: (manifesteExterne && manifesteExterne.dateDerniereModification) || null
    };
}

/**
 * Message de la garde bloquante (#335 Lot A) — quoi / pourquoi / quoi faire.
 * @param {{suspects: Array, dateExterne: string|null}} detection
 * @param {string} verbe - 'remplacer' (import) ou 'fusionner avec' (fusion)
 */
function _messageModeleAnterieur(detection, verbe, nomFichier) {
    var lignes = detection.suspects.map(function(sus) {
        var ext = sus.externes.slice(0, 2).join(', ') + (sus.externes.length > 2 ? '…' : '');
        var loc = sus.locaux.slice(0, 2).join(', ') + (sus.locaux.length > 2 ? '…' : '');
        return '• ' + sus.trimestre + ' : le codex référence « ' + ext +
            ' » alors que ton espace actuel référence « ' + loc + ' »';
    }).join('\n');
    return (nomFichier ? 'Fichier : « ' + nomFichier + ' »\n\n' : '') +
        '⚠️ ATTENTION : ce codex semble porter un MODÈLE DE DONNÉES différent ' +
        '(probablement antérieur) de ton espace de travail actuel.\n\n' + lignes +
        (detection.dateExterne ? '\n\nDernière modification du codex : ' + detection.dateExterne : '') +
        '\n\nContinuer va ' + verbe + ' ton espace avec cet ancien état — c\'est ' +
        'exactement le scénario des incidents des 10-11 juin (productions « Non associé », ' +
        'indices à zéro).\n\nContinuer quand même ?\n(Annuler = ne rien toucher)';
}

/**
 * Vérifie que les clés TÉMOINS du modèle relues depuis le stockage persistant
 * correspondent à ce qui vient d'être écrit (#335 Lot C, 11 juin 2026).
 *
 * Témoins = le cœur du modèle de données — les clés dont la résurrection d'une
 * version périmée a causé les incidents des 10-11 juin : productions,
 * évaluations, groupes-cours, étudiant·es (toutes namespacées) + `trimestres`.
 * Comparaison par JSON.stringify strict (pas de hachage : exactitude, zéro
 * dépendance). db.get lit IndexedDB en priorité — c'est précisément la couche
 * dont une copie périmée peut survivre à un import.
 *
 * @param {Object} donnees - dataset qui vient d'être écrit (état attendu)
 * @param {string[]} [cibles] - restreindre la vérification à ces clés
 * @returns {Promise<string[]>} clés dont la relecture ne correspond pas
 */
async function _verifierEcritureTemoins(donnees, cibles) {
    var SUFFIXES_TEMOINS = ['productions', 'evaluationsSauvegardees', 'groupesCours', 'groupeEtudiants'];
    var temoins;
    if (Array.isArray(cibles)) {
        temoins = cibles;
    } else {
        temoins = [];
        if ('trimestres' in donnees) temoins.push('trimestres');
        Object.keys(donnees).forEach(function(k) {
            for (var i = 0; i < SUFFIXES_TEMOINS.length; i++) {
                if (k.endsWith('_' + SUFFIXES_TEMOINS[i])) { temoins.push(k); break; }
            }
        });
    }
    var ecarts = [];
    for (var j = 0; j < temoins.length; j++) {
        var cleTemoin = temoins[j];
        if (!(cleTemoin in donnees)) continue;
        try {
            var relu = await db.get(cleTemoin, null);
            if (JSON.stringify(relu) !== JSON.stringify(donnees[cleTemoin])) {
                ecarts.push(cleTemoin);
            }
        } catch (e) {
            // Une lecture qui ÉCHOUE est un écart : on ne peut pas confirmer.
            console.warn('[Codex] Relecture impossible pour ' + cleTemoin + ' :', e.message || e);
            ecarts.push(cleTemoin);
        }
    }
    return ecarts;
}

/* ===============================
   PURGE DE L'ESPACE PRÉCÉDENT (#336 Lot D)
   =============================== */

// Dernier plan de purge calculé par chargerCodex (phase PREVIEW).
// Consommé par Codex.purgerEspacePrecedent() après vérification en console.
// PERSISTÉ sous CLE_PLAN_PURGE : l'import propose un location.reload() qui
// efface la console ET la mémoire du module (constat terrain Grégoire,
// 11 juin 15h27) — le plan est donc réaffiché au boot suivant.
var _dernierPlanPurge = null;
var CLE_PLAN_PURGE = '_codex_planPurge336';

/**
 * Affiche le plan de purge en console (preview #336) — même format à l'import
 * et au boot suivant le rechargement.
 * @param {{clesOrphelines: string[], blobsOrphelins: string[]}} plan
 * @param {string} [contexte] - ex. nom du fichier importé, date du calcul
 */
function _afficherPlanPurge(plan, contexte) {
    console.warn('[Codex] #336 purge (PREVIEW — rien n\'est supprimé' +
        (contexte ? ' ; ' + contexte : '') + ') : ' +
        plan.clesOrphelines.length + ' clé(s) orpheline(s), ' +
        plan.blobsOrphelins.length + ' blob(s) orphelin(s) détecté(s).');
    if (plan.clesOrphelines.length > 0) {
        console.warn('[Codex] #336 clés orphelines : ' + plan.clesOrphelines.join(', '));
    }
    if (plan.blobsOrphelins.length > 0) {
        console.warn('[Codex] #336 blobs orphelins (' + plan.blobsOrphelins.length + ') : ' +
            plan.blobsOrphelins.slice(0, 20).join(', ') +
            (plan.blobsOrphelins.length > 20 ? ', …' : ''));
    }
    console.warn('[Codex] #336 pour purger après vérification : Codex.purgerEspacePrecedent()');
}

/**
 * Recharge au boot le plan de purge persisté par le dernier import (#336) :
 * le réaffiche et réarme Codex.purgerEspacePrecedent(). Sans ça, le reload
 * post-import efface la preview avant qu'elle soit lisible.
 */
function _restaurerPlanPurge() {
    var stocke = db.getSync(CLE_PLAN_PURGE, null);
    if (!stocke || !stocke.plan) return;
    var plan = stocke.plan;
    if (!Array.isArray(plan.clesOrphelines) || !Array.isArray(plan.blobsOrphelins)) return;
    if (plan.clesOrphelines.length + plan.blobsOrphelins.length === 0) return;
    _dernierPlanPurge = plan;
    _afficherPlanPurge(plan, 'plan de l\'import du ' + (stocke.date || '?') +
        (stocke.fichier ? ' — « ' + stocke.fichier + ' »' : ''));
}

/**
 * Planifie la purge de l'espace précédent après un import COMPLET (#336 Lot D).
 * Fonction PURE (ne lit ni le stockage ni le DOM) — testable en Vitest.
 *
 * Ouvrir un codex = REMPLACEMENT (ECOSYSTEME-DONNEES.md) : ce qui reste en
 * stockage sans figurer dans le codex importé est un résidu de l'espace
 * précédent. Périmètre volontairement restreint par IDENTITÉ (jamais par
 * flag — SKILL_integrite_globaux) :
 * - clés : seules les clés namespacées par trimestre (`h2026_…`) sont
 *   candidates. Les clés globales (trimestres, bibliothèques, préférences,
 *   `_codex_*`, espace démo `demo_…`) ne sont JAMAIS touchées.
 * - blobs : seuls les blobs du store fichiers non référencés par le codex
 *   importé — travaux actifs, corbeille ET modélisation, tous trimestres
 *   confondus (#614 S10 : les deux dernières familles manquaient).
 *
 * @param {Object} donnees - dataset du codex qui vient d'être écrit
 * @param {string[]} clesStockage - toutes les clés présentes en stockage (db.keys())
 * @param {string[]} blobIdsStockage - tous les ids du store fichiers (db.listBlobIds())
 * @param {Object<string, boolean>} [idsDuDemoInstalle] - T2 : les fichiers du démo installé,
 *   que le codex ne porte plus ; jamais orphelins
 * @returns {{clesOrphelines: string[], blobsOrphelins: string[]}}
 */
function _planifierPurgeEspace(donnees, clesStockage, blobIdsStockage, idsDuDemoInstalle) {
    // Clés du nouvel espace — même filtre que la phase d'écriture (les
    // entrées `_…` du dataset ne sont pas écrites, elles ne comptent pas).
    var clesNouvelEspace = {};
    Object.keys(donnees || {}).forEach(function(c) {
        if (c.charAt(0) !== '_') clesNouvelEspace[c] = true;
    });

    var clesOrphelines = (clesStockage || []).filter(function(c) {
        return typeof c === 'string' &&
            /^[a-z]\d{4}_/.test(c) &&      // identité : clé d'espace trimestre
            !clesNouvelEspace[c];
    });

    // #614 (S10) — tout ce qui REFERENCE un blob du store `fichiers`, pas
    // seulement les travaux actifs. La corbeille conserve le blob intact et
    // reste restaurable (`deplacerEnCorbeille`, travaux-stockage.js:965) ; la
    // modelisation stocke ses fichiers sous le meme id que ses metadonnees
    // (modelisation.js:276 et :290). Les omettre revenait a recenser des
    // blobs VIVANTS en « orphelins » : un enseignant qui suivait la console
    // apres ouverture d'un codex detruisait sa corbeille restaurable.
    var idsReferences = {};
    Object.keys(donnees || {}).forEach(function(c) {
        var referenceDesBlobs = LISTES_DE_FICHIERS.some(function(motif) {
            return c.indexOf(motif) !== -1;
        });
        if (!referenceDesBlobs) return;
        var liste = donnees[c];
        if (!Array.isArray(liste)) return;
        liste.forEach(function(f) { if (f && f.id) idsReferences[f.id] = true; });
    });
    var blobsOrphelins = (blobIdsStockage || []).filter(function(id) {
        return !idsReferences[id] && !(idsDuDemoInstalle && idsDuDemoInstalle[id]);
    });

    return { clesOrphelines: clesOrphelines, blobsOrphelins: blobsOrphelins };
}

/**
 * Exécute un plan de purge (#336 Lot D) : supprime clés (localStorage + IDB
 * + memoryCache via db.remove) et blobs orphelins. Zéro-silence : chaque clé
 * supprimée est loggée, décompte final retourné.
 * @param {{clesOrphelines: string[], blobsOrphelins: string[]}} plan
 * @returns {Promise<{clesSupprimees: number, blobsSupprimes: number, echecs: string[]}>}
 */
async function _executerPurgeEspace(plan) {
    var bilan = { clesSupprimees: 0, blobsSupprimes: 0, echecs: [] };
    for (var i = 0; i < plan.clesOrphelines.length; i++) {
        var clePurge = plan.clesOrphelines[i];
        try {
            await db.remove(clePurge);
            bilan.clesSupprimees++;
            console.warn('[Codex] #336 purge : clé supprimée — ' + clePurge);
        } catch (e) {
            bilan.echecs.push(clePurge);
            console.error('[Codex] #336 purge : échec sur la clé ' + clePurge, e);
        }
    }
    for (var j = 0; j < plan.blobsOrphelins.length; j++) {
        var idBlob = plan.blobsOrphelins[j];
        try {
            await db.deleteBlob(idBlob);
            bilan.blobsSupprimes++;
        } catch (e2) {
            bilan.echecs.push(idBlob);
            console.error('[Codex] #336 purge : échec sur le blob ' + idBlob, e2);
        }
    }
    console.warn('[Codex] #336 purge terminée : ' + bilan.clesSupprimees + ' clé(s), ' +
        bilan.blobsSupprimes + ' blob(s) supprimé(s)' +
        (bilan.echecs.length ? ', ' + bilan.echecs.length + ' échec(s)' : '') + '.');
    return bilan;
}

/**
 * One-shot console (#336 Lot D, phase PREVIEW) : exécute le dernier plan de
 * purge affiché par chargerCodex, après vérification humaine de la liste.
 * Usage : Codex.purgerEspacePrecedent()
 */
async function purgerEspacePrecedent() {
    if (!_dernierPlanPurge) {
        console.warn('[Codex] #336 : aucun plan de purge en attente — ouvre d\'abord un codex.');
        return null;
    }
    var plan = _dernierPlanPurge;
    _dernierPlanPurge = null;            // consommé : pas de double exécution
    await db.remove(CLE_PLAN_PURGE);     // y compris après un rechargement
    return _executerPurgeEspace(plan);
}

/* ===============================
   ANALYSE DE FUSION (Phase 3)
   =============================== */

/**
 * Analyse les différences entre deux codex pour préparer une fusion.
 *
 * Trois modes selon la disponibilité d'un ancêtre commun :
 * - Avec ancêtre : diff 3 parties (détecte les vrais conflits)
 * - Sans ancêtre : diff 2 parties (toute différence = conflit potentiel)
 *
 * @param {Object} local - Données du codex local (actuellement dans IDB)
 * @param {Object} externe - Données du codex externe (lu en mémoire)
 * @param {Object|null} [ancetre=null] - Index haché du dernier état commun
 *        ({__format, cles} via _indexerSnapshot / _lireSnapshotAvant), ou null
 * @returns {Promise<{
 *   ajouteesLocal: string[],    - Clés nouvelles seulement dans local
 *   ajouteesExterne: string[],  - Clés nouvelles seulement dans externe
 *   modifieesLocal: string[],   - Clés modifiées seulement dans local (auto-merge: garder local)
 *   modifieesExterne: string[], - Clés modifiées seulement dans externe (auto-merge: prendre externe)
 *   supprimeesLocal: string[],  - Clés supprimées seulement dans local
 *   supprimeesExterne: string[],- Clés supprimées seulement dans externe
 *   conflits: string[],         - Clés modifiées/supprimées des DEUX côtés (choix utilisateur requis)
 *   identiques: number          - Nombre de clés identiques (pas de stats, juste le compte)
 * }>}
 */
async function _analyserFusion(local, externe, ancetre) {
    // L'ancêtre est un index de hachés (#334 C) : présence de clé dans
    // ancetre.cles, égalité par sha256(JSON) — image fidèle de l'ancien
    // JSON.stringify(ancetre[cle]), qui n'était jamais utilisé autrement.
    var clesAncetre = (ancetre && ancetre.cles) ? ancetre.cles : null;
    var toutesLesCles = new Set(
        Object.keys(local).concat(Object.keys(externe))
    );
    if (clesAncetre) {
        Object.keys(clesAncetre).forEach(function(c) { toutesLesCles.add(c); });
    }

    // T2 : le démo ne se fusionne pas — ni écrit, ni supprimé, ni compté.
    var horsFusion = _partDuDemo(local).cles;

    var resultat = {
        ajouteesLocal: [],
        ajouteesExterne: [],
        modifieesLocal: [],
        modifieesExterne: [],
        supprimeesLocal: [],
        supprimeesExterne: [],
        conflits: [],
        identiques: 0
    };

    for (var cle of toutesLesCles) {
        // Ignorer les clés internes du codex
        if (cle.startsWith('_codex_')) continue;
        if (_estCleDuDemo(cle) || horsFusion[cle]) continue;

        var dansLocal = cle in local;
        var dansExterne = cle in externe;
        var dansAncetre = clesAncetre ? (cle in clesAncetre) : false;

        var jsonLocal = dansLocal ? JSON.stringify(local[cle]) : undefined;
        var jsonExterne = dansExterne ? JSON.stringify(externe[cle]) : undefined;

        // Cas trivial : valeurs identiques
        if (dansLocal && dansExterne && jsonLocal === jsonExterne) {
            resultat.identiques++;
            continue;
        }

        if (clesAncetre) {
            // ── Diff 3 parties (avec ancêtre) ──
            // Mêmes sémantiques qu'avant : un côté absent garde un hash
            // undefined, donc « change » vrai face à un ancêtre présent —
            // exactement comme jsonLocal !== jsonAncetre avec undefined.
            var hashAncetre = dansAncetre ? clesAncetre[cle] : undefined;
            var hashLocal = dansLocal ? await _sha256Hex(jsonLocal) : undefined;
            var hashExterne = dansExterne ? await _sha256Hex(jsonExterne) : undefined;
            var localChange = hashLocal !== hashAncetre;
            var externeChange = hashExterne !== hashAncetre;

            if (!dansAncetre && dansLocal && !dansExterne) {
                // Ajoutée dans local seulement
                resultat.ajouteesLocal.push(cle);
            } else if (!dansAncetre && !dansLocal && dansExterne) {
                // Ajoutée dans externe seulement
                resultat.ajouteesExterne.push(cle);
            } else if (!dansAncetre && dansLocal && dansExterne) {
                // Ajoutée des deux côtés avec valeurs différentes → conflit
                resultat.conflits.push(cle);
            } else if (dansAncetre && !dansLocal && dansExterne && !externeChange) {
                // Supprimée dans local, inchangée dans externe → garder suppression
                resultat.supprimeesLocal.push(cle);
            } else if (dansAncetre && dansLocal && !dansExterne && !localChange) {
                // Supprimée dans externe, inchangée dans local → garder suppression
                resultat.supprimeesExterne.push(cle);
            } else if (dansAncetre && !dansLocal && dansExterne && externeChange) {
                // Supprimée dans local, modifiée dans externe → conflit
                resultat.conflits.push(cle);
            } else if (dansAncetre && dansLocal && !dansExterne && localChange) {
                // Modifiée dans local, supprimée dans externe → conflit
                resultat.conflits.push(cle);
            } else if (dansAncetre && !dansLocal && !dansExterne) {
                // Supprimée des deux côtés → rien à faire
                resultat.identiques++;
            } else if (localChange && !externeChange) {
                // Modifiée seulement dans local
                resultat.modifieesLocal.push(cle);
            } else if (!localChange && externeChange) {
                // Modifiée seulement dans externe
                resultat.modifieesExterne.push(cle);
            } else if (localChange && externeChange) {
                // Modifiée des deux côtés → conflit
                resultat.conflits.push(cle);
            }
        } else {
            // ── Diff 2 parties (sans ancêtre) ──
            // Sans ancêtre, on ne peut pas savoir qui a ajouté/modifié quoi.
            // Seul dans local → garder ; seul dans externe → ajouter ; les deux différents → conflit.
            if (dansLocal && !dansExterne) {
                resultat.ajouteesLocal.push(cle);
            } else if (!dansLocal && dansExterne) {
                resultat.ajouteesExterne.push(cle);
            } else {
                // dansLocal && dansExterne && valeurs différentes (identiques déjà filtré)
                resultat.conflits.push(cle);
            }
        }
    }

    return resultat;
}

/**
 * Analyse les différences entre les fichiers travaux de deux codex.
 *
 * @param {string[]} travauxLocal - Chemins des fichiers travaux locaux (ex: "travaux/FT_abc.pdf")
 * @param {string[]} travauxExterne - Chemins des fichiers travaux externes
 * @returns {{uniquementLocal: string[], uniquementExterne: string[], communs: string[]}}
 */
function _analyserFusionTravaux(travauxLocal, travauxExterne) {
    var setLocal = new Set(travauxLocal);
    var setExterne = new Set(travauxExterne);

    var uniquementLocal = [];
    var uniquementExterne = [];
    var communs = [];

    travauxLocal.forEach(function(chemin) {
        if (setExterne.has(chemin)) {
            communs.push(chemin);
        } else {
            uniquementLocal.push(chemin);
        }
    });

    travauxExterne.forEach(function(chemin) {
        if (!setLocal.has(chemin)) {
            uniquementExterne.push(chemin);
        }
    });

    return {
        uniquementLocal: uniquementLocal,
        uniquementExterne: uniquementExterne,
        communs: communs
    };
}

/**
 * Formate le résultat d'une analyse de fusion pour affichage utilisateur.
 *
 * @param {Object} analyse - Retour de _analyserFusion()
 * @param {Object} [analyseTravaux] - Retour de _analyserFusionTravaux() (optionnel)
 * @returns {string}
 */
function _formaterAnalyseFusion(analyse, analyseTravaux) {
    var lignes = [];

    // Résumé global
    var totalAuto = analyse.ajouteesLocal.length + analyse.ajouteesExterne.length +
        analyse.modifieesLocal.length + analyse.modifieesExterne.length +
        analyse.supprimeesLocal.length + analyse.supprimeesExterne.length;
    var nbConflits = analyse.conflits.length;

    lignes.push('═══ Analyse de fusion ═══\n');
    lignes.push('Clés identiques : ' + analyse.identiques);
    lignes.push('Résolution automatique : ' + totalAuto + ' clé(s)');
    lignes.push('Conflits à résoudre : ' + nbConflits + '\n');

    // Détails auto-merge
    if (analyse.ajouteesLocal.length > 0) {
        lignes.push('Garder (nouvelles locales) : ' + analyse.ajouteesLocal.length);
        var gl = _grouperParPrefixe(analyse.ajouteesLocal);
        for (var a = 0; a < gl.length; a++) lignes.push('  + ' + gl[a]);
        lignes.push('');
    }

    if (analyse.ajouteesExterne.length > 0) {
        lignes.push('Importer (nouvelles externes) : ' + analyse.ajouteesExterne.length);
        var ge = _grouperParPrefixe(analyse.ajouteesExterne);
        for (var b = 0; b < ge.length; b++) lignes.push('  ← ' + ge[b]);
        lignes.push('');
    }

    if (analyse.modifieesLocal.length > 0) {
        lignes.push('Garder (modifiées localement) : ' + analyse.modifieesLocal.length);
        var gml = _grouperParPrefixe(analyse.modifieesLocal);
        for (var c = 0; c < gml.length; c++) lignes.push('  ✓ ' + gml[c]);
        lignes.push('');
    }

    if (analyse.modifieesExterne.length > 0) {
        lignes.push('Importer (modifiées dans externe) : ' + analyse.modifieesExterne.length);
        var gme = _grouperParPrefixe(analyse.modifieesExterne);
        for (var d = 0; d < gme.length; d++) lignes.push('  ← ' + gme[d]);
        lignes.push('');
    }

    if (nbConflits > 0) {
        lignes.push('⚠ CONFLITS (' + nbConflits + ') :');
        var gc = _grouperParPrefixe(analyse.conflits);
        for (var e = 0; e < gc.length; e++) lignes.push('  ⚠ ' + gc[e]);
        lignes.push('');
    }

    // Travaux
    if (analyseTravaux) {
        if (analyseTravaux.uniquementExterne.length > 0) {
            lignes.push('Fichiers travaux à importer : ' + analyseTravaux.uniquementExterne.length);
        }
        if (analyseTravaux.communs.length > 0) {
            lignes.push('Fichiers travaux communs : ' + analyseTravaux.communs.length);
        }
    }

    return lignes.join('\n');
}

/* ===============================
   RÉSOLUTION DE CONFLITS (Phase 3)
   =============================== */

/**
 * Produit un résumé lisible d'une valeur pour l'affichage dans les prompts de conflit.
 * @param {*} val
 * @returns {string}
 */
function _resumerValeur(val) {
    if (val === null || val === undefined) return '(vide)';
    if (typeof val === 'string') {
        if (val.length <= 60) return '"' + val + '"';
        return 'Texte (' + val.length + ' car.)';
    }
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (Array.isArray(val)) {
        return 'Liste [' + val.length + ' élément' + (val.length > 1 ? 's' : '') + ']';
    }
    if (typeof val === 'object') {
        var nb = Object.keys(val).length;
        return 'Objet {' + nb + ' propriété' + (nb > 1 ? 's' : '') + '}';
    }
    return typeof val;
}

/**
 * Pilote la résolution interactive des conflits de fusion.
 *
 * Flux :
 * 1. Affiche le résumé global (auto-merge + conflits)
 * 2. Si conflits > 0, propose une stratégie globale ou "un par un"
 * 3. Retourne un plan de résolution complet
 *
 * @param {Object} analyse - Retour de _analyserFusion()
 * @param {Object} donneesLocales - Données du codex local
 * @param {Object} donneesExternes - Données du codex externe
 * @param {Object} [analyseTravaux] - Retour de _analyserFusionTravaux() (optionnel)
 * @returns {{
 *   resolutions: Object.<string, 'local'|'externe'|'supprimer'>,
 *   importerTravaux: string[],
 *   annule: boolean
 * }}
 */
async function _resoudreConflits(analyse, donneesLocales, donneesExternes, analyseTravaux) {
    // 1. Construire les résolutions automatiques
    var resolutions = {};

    // Clés ajoutées localement → garder (déjà dans IDB)
    for (var i = 0; i < analyse.ajouteesLocal.length; i++) {
        resolutions[analyse.ajouteesLocal[i]] = 'local';
    }

    // Clés ajoutées dans l'externe → importer
    for (var j = 0; j < analyse.ajouteesExterne.length; j++) {
        resolutions[analyse.ajouteesExterne[j]] = 'externe';
    }

    // Modifiées seulement localement → garder
    for (var k = 0; k < analyse.modifieesLocal.length; k++) {
        resolutions[analyse.modifieesLocal[k]] = 'local';
    }

    // Modifiées seulement dans l'externe → importer
    for (var l = 0; l < analyse.modifieesExterne.length; l++) {
        resolutions[analyse.modifieesExterne[l]] = 'externe';
    }

    // Supprimées localement (et inchangées dans externe) → supprimer
    for (var m = 0; m < analyse.supprimeesLocal.length; m++) {
        resolutions[analyse.supprimeesLocal[m]] = 'supprimer';
    }

    // Supprimées dans l'externe (et inchangées dans local) → supprimer
    for (var n = 0; n < analyse.supprimeesExterne.length; n++) {
        resolutions[analyse.supprimeesExterne[n]] = 'supprimer';
    }

    // Travaux à importer (fichiers présents seulement dans l'externe)
    var importerTravaux = analyseTravaux ? analyseTravaux.uniquementExterne.slice() : [];

    // 2. Afficher le résumé et demander confirmation
    var resume = _formaterAnalyseFusion(analyse, analyseTravaux);

    if (analyse.conflits.length === 0) {
        // Pas de conflit — confirmer l'auto-merge
        var totalActions = Object.keys(resolutions).length + importerTravaux.length;
        if (totalActions === 0) {
            notifications.info('Les deux codex sont identiques. Rien à fusionner.');
            return { resolutions: resolutions, importerTravaux: importerTravaux, annule: true };
        }

        const okAuto = await uiDialogues.confirmerAction({
            titre: 'Fusion automatique',
            message: resume + '\n\nAucun conflit. Procéder à la fusion automatique ?',
            texteConfirmer: 'Fusionner',
            preformate: true
        });
        if (!okAuto) {
            return { resolutions: resolutions, importerTravaux: importerTravaux, annule: true };
        }

        return { resolutions: resolutions, importerTravaux: importerTravaux, annule: false };
    }

    // 3. Conflits présents — proposer une stratégie
    var nbConflits = analyse.conflits.length;
    var strategieTexte = resume + '\n\n' +
        'Comment résoudre les ' + nbConflits + ' conflit(s) ?\n\n' +
        '1. Garder local pour tous les conflits\n' +
        '2. Prendre externe pour tous les conflits\n' +
        '3. Résoudre un par un\n' +
        '4. Annuler la fusion\n\n' +
        'Entrer 1, 2, 3 ou 4 :';

    var choixStrategie = await uiDialogues.demanderSaisie({
        titre: 'Résoudre les conflits',
        message: strategieTexte,
        preformate: true
    });
    if (!choixStrategie || choixStrategie.trim() === '4') {
        return { resolutions: resolutions, importerTravaux: importerTravaux, annule: true };
    }

    var strategie = parseInt(choixStrategie.trim(), 10);

    if (strategie === 1) {
        // Tout garder local
        for (var p = 0; p < analyse.conflits.length; p++) {
            resolutions[analyse.conflits[p]] = 'local';
        }
    } else if (strategie === 2) {
        // Tout prendre externe
        for (var q = 0; q < analyse.conflits.length; q++) {
            resolutions[analyse.conflits[q]] = 'externe';
        }
    } else if (strategie === 3) {
        // Résoudre un par un
        for (var r = 0; r < analyse.conflits.length; r++) {
            var cle = analyse.conflits[r];
            var valLocal = donneesLocales[cle];
            var valExterne = donneesExternes[cle];

            var texteConflit = 'Conflit ' + (r + 1) + '/' + nbConflits + ' : ' + cle + '\n\n' +
                'Local :  ' + _resumerValeur(valLocal) + '\n' +
                'Externe : ' + _resumerValeur(valExterne) + '\n\n' +
                '1. Garder local\n' +
                '2. Prendre externe\n' +
                '3. Ignorer (ne pas toucher)\n\n' +
                'Entrer 1, 2 ou 3 :';

            var choixConflit = await uiDialogues.demanderSaisie({
                titre: 'Conflit ' + (r + 1) + '/' + nbConflits,
                message: texteConflit,
                preformate: true
            });
            if (!choixConflit) {
                // Annulation en cours de résolution — demander confirmation
                if (await uiDialogues.confirmerAction({
                    titre: 'Annuler la fusion',
                    message: 'Annuler toute la fusion ? (Les conflits déjà résolus seront perdus.)',
                    texteConfirmer: 'Annuler la fusion',
                    variante: 'danger'
                })) {
                    return { resolutions: {}, importerTravaux: [], annule: true };
                }
                // Re-poser la question pour ce conflit
                r--;
                continue;
            }

            var choixNum = parseInt(choixConflit.trim(), 10);
            if (choixNum === 1) {
                resolutions[cle] = 'local';
            } else if (choixNum === 2) {
                resolutions[cle] = 'externe';
            }
            // choixNum === 3 ou autre → pas de résolution, on ne touche pas
        }
    } else {
        // Choix invalide → annuler
        notifications.warning('Choix invalide. Fusion annulée.');
        return { resolutions: resolutions, importerTravaux: importerTravaux, annule: true };
    }

    return { resolutions: resolutions, importerTravaux: importerTravaux, annule: false };
}

/* ===============================
   EXPORT SÉLECTIF (Phase 3)
   =============================== */

/**
 * Détecte les trimestres disponibles dans un jeu de données.
 * Scanne les préfixes de clés pour trouver les trimestres (h2026_, a2025_, demo_, etc.).
 *
 * @param {Object} donnees - Objet clé/valeur (de IDB ou d'un codex)
 * @returns {string[]} Liste triée des préfixes de trimestre détectés (ex: ["a2025", "h2026"])
 */
function _detecterTrimestresDisponibles(donnees) {
    var prefixes = new Set();
    var cles = Object.keys(donnees);

    // Pattern : un préfixe de trimestre est [a|e|h|demo]NNNN_ ou "demo_"
    var regex = /^([aeh]\d{4}|demo)_/;

    for (var i = 0; i < cles.length; i++) {
        var match = cles[i].match(regex);
        if (match) {
            prefixes.add(match[1]);
        }
    }

    var liste = [];
    prefixes.forEach(function(p) { liste.push(p); });
    liste.sort();
    return liste;
}

/**
 * Filtre un jeu de données pour ne garder que les clés des trimestres sélectionnés
 * + les clés globales (sans préfixe de trimestre).
 *
 * @param {Object} donnees - Objet clé/valeur complet
 * @param {string[]} trimestresChoisis - Préfixes à inclure (ex: ["h2026"])
 * @param {boolean} [inclureGlobales=true] - Inclure les clés sans préfixe de trimestre
 * @returns {{donneesFiltrees: Object, stats: {total: number, gardees: number, exclues: number}}}
 */
function _filtrerDonneesPourExport(donnees, trimestresChoisis, inclureGlobales) {
    if (inclureGlobales === undefined) inclureGlobales = true;

    var regex = /^([aeh]\d{4}|demo)_/;
    var setTrimestres = new Set(trimestresChoisis);

    var donneesFiltrees = {};
    var gardees = 0;
    var exclues = 0;

    var cles = Object.keys(donnees);
    for (var i = 0; i < cles.length; i++) {
        var cle = cles[i];

        // Ignorer les clés internes du codex
        if (cle.startsWith('_codex_') || cle.startsWith('_')) {
            continue;
        }

        var match = cle.match(regex);
        if (match) {
            // Clé namespacée — garder si le trimestre est sélectionné
            if (setTrimestres.has(match[1])) {
                donneesFiltrees[cle] = donnees[cle];
                gardees++;
            } else {
                exclues++;
            }
        } else if (inclureGlobales) {
            // Clé globale (pas de préfixe de trimestre)
            donneesFiltrees[cle] = donnees[cle];
            gardees++;
        } else {
            exclues++;
        }
    }

    return {
        donneesFiltrees: donneesFiltrees,
        stats: { total: cles.length, gardees: gardees, exclues: exclues }
    };
}

/**
 * Filtre les chemins de fichiers travaux pour ne garder que ceux référencés
 * dans les données filtrées (via la clé fichiersTravaux du trimestre).
 *
 * @param {Object} donneesFiltrees - Données après filtrage par trimestre
 * @param {string[]} tousLesTravauxChemins - Liste complète des chemins travaux
 * @returns {string[]} Chemins à inclure dans l'export
 */
function _filtrerTravauxPourExport(donneesFiltrees, tousLesTravauxChemins) {
    // Collecter les IDs de fichiers référencés dans les données filtrées
    var idsRefereces = new Set();
    var cles = Object.keys(donneesFiltrees);
    for (var i = 0; i < cles.length; i++) {
        if (cles[i].includes('fichiersTravaux')) {
            var liste = donneesFiltrees[cles[i]];
            if (Array.isArray(liste)) {
                for (var j = 0; j < liste.length; j++) {
                    if (liste[j].id) idsRefereces.add(liste[j].id);
                }
            }
        }
    }

    if (idsRefereces.size === 0) return [];

    // Garder seulement les chemins dont l'ID est référencé
    return tousLesTravauxChemins.filter(function(chemin) {
        var nomFichier = chemin.replace(DOSSIER_TRAVAUX + '/', '');
        var pointIndex = nomFichier.lastIndexOf('.');
        var idFichier = pointIndex > 0 ? nomFichier.substring(0, pointIndex) : nomFichier;
        return idsRefereces.has(idFichier);
    });
}

/* ===============================
   FUSION DES TRAVAUX / BLOBS (Phase 3)
   =============================== */

/**
 * Importe les blobs travaux d'un codex externe qui ne sont pas dans le codex local.
 *
 * @param {JSZip} zipExterne - Instance JSZip du codex externe (de lireCodexExterne._zip)
 * @param {Object} donneesExternes - donnees.json du codex externe
 * @param {string[]} cheminsAImporter - Chemins des fichiers à importer (ex: "travaux/FT_abc.pdf")
 * @param {Function} [onProgression] - Callback optionnel (pourcentage, message)
 * @returns {Promise<{importes: number, ignores: number, erreurs: string[]}>}
 */
async function _fusionnerTravaux(zipExterne, donneesExternes, cheminsAImporter, onProgression) {
    if (!cheminsAImporter || cheminsAImporter.length === 0) {
        return { importes: 0, ignores: 0, erreurs: [] };
    }

    if (typeof travauxStockage === 'undefined') {
        console.warn('📂 Fusion : travauxStockage non disponible, blobs ignorés');
        return { importes: 0, ignores: cheminsAImporter.length, erreurs: ['travauxStockage non disponible'] };
    }

    // Construire un index id → métadonnées depuis donneesExternes.fichiersTravaux
    var cleFT = Object.keys(donneesExternes).find(function(c) { return c.includes('fichiersTravaux'); });
    var indexFT = {};
    if (cleFT && Array.isArray(donneesExternes[cleFT])) {
        donneesExternes[cleFT].forEach(function(f) {
            indexFT[f.id] = f;
        });
    }

    var importes = 0;
    var ignores = 0;
    var erreurs = [];

    for (var i = 0; i < cheminsAImporter.length; i++) {
        var chemin = cheminsAImporter[i];

        // Extraire l'ID du chemin (ex: "travaux/FT_abc123.pdf" → "FT_abc123")
        var nomFichier = chemin.replace(DOSSIER_TRAVAUX + '/', '');
        var pointIndex = nomFichier.lastIndexOf('.');
        var idFichier = pointIndex > 0 ? nomFichier.substring(0, pointIndex) : nomFichier;

        try {
            var entree = zipExterne.file(chemin);
            if (!entree) {
                erreurs.push(chemin + ' : introuvable dans le ZIP');
                ignores++;
                continue;
            }

            var blobData = await entree.async('blob');

            // #614 (S9) — meme regle que le chemin « ouvrir » (:698-706) : un
            // codex recu d'un collegue peut contenir un blob deguise en PDF,
            // que travaux-visionneuse servirait ensuite. La fusion ecrit dans
            // le MEME store `fichiers` : elle valide avant de stocker.
            //
            // FAIL-CLOSED, la ou le chemin « ouvrir » est fail-open : un
            // module de validation absent ne vaut pas « validation reussie ».
            // Le message nomme la cause, pour ne pas faire passer un
            // chargement incomplet pour un fichier corrompu.
            var validerOctets = window.travauxImport && window.travauxImport.validerMagicBytes;
            if (typeof validerOctets !== 'function') {
                erreurs.push(chemin + ' : validation impossible (module travauxImport non charge)');
                ignores++;
                continue;
            }
            if (!(await window.travauxImport.validerMagicBytes(blobData))) {
                console.warn('📂 Fusion : blob refuse (magic bytes invalides) pour ' + idFichier);
                erreurs.push(chemin + ' : contenu refuse (pas une image ni un PDF)');
                ignores++;
                continue;
            }

            var meta = indexFT[idFichier];
            var etudiantDA = meta ? meta.etudiantDA : '';
            var productionId = meta ? meta.productionId : '';

            await travauxStockage.stockerBlob(idFichier, blobData, etudiantDA, productionId);
            importes++;
        } catch (e) {
            erreurs.push(chemin + ' : ' + e.message);
            ignores++;
        }

        if (onProgression && i % 3 === 0) {
            onProgression(
                Math.round((i / cheminsAImporter.length) * 100),
                importes + '/' + cheminsAImporter.length + ' fichiers'
            );
            await _yield();
        }
    }

    // Fusionner la liste fichiersTravaux locale avec les nouvelles entrées
    // #522 lot 5 : la liste locale est lue, complétée et écrite dans la file de la clé
    // (db.modifier) — une copie enregistrée pendant la fusion n'est plus écrasée.
    if (cleFT && importes > 0) {

        // Set d'IDs reellement importes : on extrait l'id depuis chaque chemin
        // avec la meme logique que dans la boucle d'import (lastIndexOf('.')).
        // Plus sur que l'ancien `ch.indexOf(f.id) !== -1` qui acceptait toute
        // sous-chaine -- ex: f.id = 'FT_abc' matchait faussement chemin
        // 'travaux/FT_abc_extended.pdf'. (H4)
        var idsImportes = new Set();
        cheminsAImporter.forEach(function(ch) {
            var nom = ch.replace(DOSSIER_TRAVAUX + '/', '');
            var pi = nom.lastIndexOf('.');
            var id = pi > 0 ? nom.substring(0, pi) : nom;
            idsImportes.add(id);
        });

        await db.modifier(cleFT, function(lue) {
            var listeLocale = lue || [];
            var idsLocaux = new Set(listeLocale.map(function(f) { return f.id; }));
            var ajoutees = 0;
            donneesExternes[cleFT].forEach(function(f) {
                if (!idsLocaux.has(f.id) && idsImportes.has(f.id)) {
                    listeLocale.push(f);
                    ajoutees++;
                }
            });
            return ajoutees > 0 ? listeLocale : undefined;
        }, []);
    }


    return { importes: importes, ignores: ignores, erreurs: erreurs };
}

/* ===============================
   UTILITAIRES PRIVÉS
   =============================== */

/**
 * Vérifie si navigator.share supporte le partage de fichiers
 */
function _peutPartagerFichier(blob, nomFichier) {
    if (!navigator.canShare) return false;
    try {
        const fichier = new File([blob], nomFichier, { type: 'application/zip' });
        return navigator.canShare({ files: [fichier] });
    } catch (e) {
        return false;
    }
}

/**
 * Lit un File/Blob comme ArrayBuffer
 */
function _lireCommeArrayBuffer(fichier) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
        reader.readAsArrayBuffer(fichier);
    });
}

/**
 * Échappe les caractères spéciaux pour usage dans un RegExp
 */
function _echapperRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Génère un nom de codex par défaut basé sur le contexte
 */
function _genererNomCodex() {
    const infoCours = db.getSync('infoCours', {});
    const trimestre = (typeof window.trimestreActif === 'string') ? window.trimestreActif : '';
    const parties = [];
    if (infoCours.nomCours) parties.push(infoCours.nomCours);
    if (trimestre) parties.push(trimestre.toUpperCase());
    return parties.length > 0 ? parties.join(' — ') : 'Mon codex';
}

/**
 * Génère un nom de fichier avec horodatage
 */
function _genererNomFichier(nomCodex) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const heure = `${pad(now.getHours())}h${pad(now.getMinutes())}`;
    const nomNettoye = nomCodex.replace(/[^a-zA-Z0-9àâéèêëïîôùûüçÀÂÉÈÊËÏÎÔÙÛÜÇ _-]/g, '').trim().replace(/\s+/g, '-');
    return `codex-${nomNettoye}-${date}-${heure}${EXTENSION_CODEX}`;
}

/**
 * Identifie l'appareil courant (pour le manifeste)
 */
function _identifierAppareil() {
    const ua = navigator.userAgent;
    if (/iPad/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document)) {
        return 'iPad — Safari';
    }
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) {
        return 'Mac — Chrome';
    }
    if (/Edg/.test(ua)) {
        return 'Mac — Edge';
    }
    if (/Safari/.test(ua)) {
        return 'Mac — Safari';
    }
    if (/Firefox/.test(ua)) {
        return 'Mac — Firefox';
    }
    return navigator.platform || 'Inconnu';
}

/**
 * Identifie le navigateur + version + OS (pour le diagnostic codex Safari ↔ Chrome).
 * Format : "Chrome 146 / macOS", "Safari 17 / iPadOS", etc.
 * Gère les variantes iOS (CriOS, EdgiOS, FxiOS) qui sont du WebKit re-brandé.
 * (#244)
 */
function _identifierNavigateur() {
    const ua = navigator.userAgent;
    let nom = 'Inconnu';
    let version = '';
    let m;

    // iOS browsers (forcés WebKit par Apple, UA différent)
    if ((m = ua.match(/CriOS\/(\d+)/))) { nom = 'Chrome'; version = m[1]; }
    else if ((m = ua.match(/EdgiOS\/(\d+)/))) { nom = 'Edge'; version = m[1]; }
    else if ((m = ua.match(/FxiOS\/(\d+)/))) { nom = 'Firefox'; version = m[1]; }
    // Desktop browsers — Edge avant Chrome (Edge contient "Chrome" dans son UA)
    else if ((m = ua.match(/Edg\/(\d+)/))) { nom = 'Edge'; version = m[1]; }
    else if (!/Edg/.test(ua) && (m = ua.match(/Chrome\/(\d+)/))) { nom = 'Chrome'; version = m[1]; }
    else if ((m = ua.match(/Firefox\/(\d+)/))) { nom = 'Firefox'; version = m[1]; }
    // Safari en dernier (Chrome contient aussi "Safari" dans son UA)
    else if ((m = ua.match(/Version\/(\d+).*Safari/))) { nom = 'Safari'; version = m[1]; }

    let os = 'Inconnu';
    if (/iPad/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document)) os = 'iPadOS';
    else if (/iPhone|iPod/.test(ua)) os = 'iOS';
    else if (/Macintosh|Mac OS X/.test(ua)) os = 'macOS';
    else if (/Windows/.test(ua)) os = 'Windows';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/Linux/.test(ua)) os = 'Linux';

    return version ? `${nom} ${version} / ${os}` : `${nom} / ${os}`;
}

/**
 * Obtient la version de l'application
 */
function _obtenirVersionApp() {
    if (typeof window.VERSION_MAJEURE === 'string') return window.VERSION_MAJEURE;
    return 'inconnue';
}

/**
 * Obtient le nom de l'auteur depuis le profil enseignant (#231).
 * Cascade : profilEnseignant (prenom+nom) → infoCours.enseignant (string)
 */
function _obtenirAuteur() {
    var profil = db.getSync('profilEnseignant', null);
    if (profil && (profil.prenom || profil.nom)) {
        return ((profil.prenom || '') + ' ' + (profil.nom || '')).trim();
    }
    var infoCours = db.getSync('infoCours', {});
    if (typeof infoCours?.enseignant === 'string' && infoCours.enseignant.trim()) {
        return infoCours.enseignant.trim();
    }
    return '';
}

/* ===============================
   INDICATEUR EN-TÊTE
   =============================== */

/**
 * Met à jour l'indicateur visuel dans l'en-tête.
 */
function _mettreAJourIndicateur() {
    // TODO Étape 1.3 : mettre à jour la pastille dans l'en-tête
    const indicateur = document.getElementById('codex-indicateur');
    if (!indicateur) return; // Le bouton n'existe pas encore

    if (!_etat.actif) {
        indicateur.classList.add('u-hide');
        return;
    }

    indicateur.classList.remove('u-hide');
    if (_etat.modificationsDepuis) {
        indicateur.textContent = '\u25C9'; // ◉
        indicateur.classList.add('codex-indicateur--modifie');
        indicateur.classList.remove('codex-indicateur--sauve');
    } else {
        indicateur.textContent = '\u25C9'; // ◉
        indicateur.classList.remove('codex-indicateur--modifie');
        indicateur.classList.add('codex-indicateur--sauve');
    }

    // Tooltip du bouton : résumé de l'état
    // Le statut du codex est affiché dans le menu (codex-menu-statut-haut),
    // pas en title natif (conflit avec data-tooltip personnalisé).
}

/* ===============================
   MENU EN-TÊTE
   =============================== */

var _menuOuvert = false;

/**
 * Ouvre/ferme le menu déroulant du codex
 */
function toggleMenu() {
    var menu = document.getElementById('codex-menu');
    if (!menu) return;

    _menuOuvert = !_menuOuvert;

    if (_menuOuvert) {
        // Actualiser les items selon l'état
        _actualiserMenu();
        menu.classList.remove('u-hide');
        // Fermer le menu si on clique ailleurs
        setTimeout(function() {
            document.addEventListener('click', _fermerMenuExterne);
        }, 0);
    } else {
        menu.classList.add('u-hide');
        document.removeEventListener('click', _fermerMenuExterne);
    }
}

function _fermerMenu() {
    var menu = document.getElementById('codex-menu');
    if (menu) menu.classList.add('u-hide');
    _menuOuvert = false;
    document.removeEventListener('click', _fermerMenuExterne);
}

function _fermerMenuExterne(e) {
    var controle = document.getElementById('codex-controle');
    if (controle && !controle.contains(e.target)) {
        _fermerMenu();
    }
}

/**
 * Actualise la visibilité des items selon l'état du codex
 */
function _actualiserMenu() {
    // Bandeau de statut en haut du menu (#230)
    var statutHaut = document.getElementById('codex-menu-statut-haut');
    if (statutHaut) {
        if (_etat.actif) {
            var modifie = !!_etat.modificationsDepuis;
            var classePastille = modifie ? 'codex-statut-pastille--orange' : 'codex-statut-pastille--vert';
            var texteEtat = modifie ? 'Ton codex n\'a pas tes derniers changements' : 'Ton codex est à jour';
            // _etat.nom est saisi par l'utilisateur (renommage codex). echapper
            // pour eviter qu'un nom contenant <script> ou des attributs event-handler
            // ne soit injecte dans le DOM via innerHTML (XSS).
            var esc = (typeof window.echapperHtml === 'function')
                ? window.echapperHtml
                : function(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); };
            // Ligne d'info : dernier fichier enregistré
            var ligneInfo = '';
            if (_etat.derniereSauvegarde) {
                var d = new Date(_etat.derniereSauvegarde);
                var pad = function(n) { return String(n).padStart(2, '0'); };
                var dateStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
                var heureStr = pad(d.getHours()) + 'h' + pad(d.getMinutes());
                var nomNettoye = (_etat.nom || 'codex').replace(/[^a-zA-Z0-9àâéèêëïîôùûüçÀÂÉÈÊËÏÎÔÙÛÜÇ _-]/g, '').trim().replace(/\s+/g, '-');
                var nomFichierAffiche = 'codex-' + nomNettoye + '-' + dateStr + '-' + heureStr + EXTENSION_CODEX;
                ligneInfo = '<div class="codex-statut-fichier">Dernier fichier\u00a0: ' + esc(nomFichierAffiche) + '</div>';
            }
            statutHaut.innerHTML =
                '<div class="codex-statut-nom" data-action="Codex.actionRenommer" title="Cliquer pour renommer">' + esc(_etat.nom || 'Codex') + '</div>' +
                '<div class="codex-statut-etat"><span class="codex-statut-pastille ' + classePastille + '">\u25C9</span> ' + texteEtat + '</div>' +
                ligneInfo;
            statutHaut.classList.remove('u-hide');
        } else {
            statutHaut.innerHTML = '<div class="codex-statut-etat">Aucun codex actif — ouvre ou crée un codex pour commencer.</div>';
            statutHaut.classList.remove('u-hide');
        }
    }

    var details = document.getElementById('codex-menu-details');
    var fermerItem = document.getElementById('codex-menu-fermer');
    if (details) {
        if (_etat.actif) details.classList.remove('u-hide');
        else details.classList.add('u-hide');
    }
    if (fermerItem) {
        if (_etat.actif) fermerItem.classList.remove('u-hide');
        else fermerItem.classList.add('u-hide');
    }
    var fusionnerItem = document.getElementById('codex-menu-fusionner');
    if (fusionnerItem) {
        if (_etat.actif) fusionnerItem.classList.remove('u-hide');
        else fusionnerItem.classList.add('u-hide');
    }
    var comparerItem = document.getElementById('codex-menu-comparer');
    if (comparerItem) {
        if (_etat.actif) comparerItem.classList.remove('u-hide');
        else comparerItem.classList.add('u-hide');
    }

    // Libellé canonique « Mettre à jour le codex » partout (D4, Grégoire, 26 sept. 2026 :
    // « Enregistré » ne veut plus dire qu'écrit dans l'application ; le codex a son verbe).
    // La mécanique Safari (téléchargement d'un nouveau fichier) reste dite par le sous-texte.
    var fsapiOk = (typeof window.showSaveFilePicker === 'function');
    var enregLabel = document.getElementById('codex-menu-enreg-label');
    if (enregLabel) {
        enregLabel.textContent = 'Mettre à jour le codex';
    }

    // Sous-texte "Enregistrer" : montre le bon mode selon le contexte
    var enregInfo = document.getElementById('codex-menu-enreg-info');
    if (enregInfo) {
        if (!fsapiOk) {
            enregInfo.textContent = 'Télécharge un nouveau fichier';
            enregInfo.classList.remove('u-hide');
        } else if (_fileHandle) {
            enregInfo.textContent = 'Dans le même fichier';
            enregInfo.classList.remove('u-hide');
        } else {
            enregInfo.classList.add('u-hide');
        }
    }
}

/* ===============================
   ACTIONS DU MENU
   =============================== */

/**
 * Ouvrir un codex depuis un fichier.
 * Sur Chrome/Edge, utilise showOpenFilePicker pour obtenir un handle FSAPI
 * réutilisable lors de la prochaine sauvegarde. #1012 : ce handle n'est PAS rangé
 * ici. L'application ne l'adopte qu'après une ouverture complète
 * (`_ouvrirLeFichierChoisi`) ; d'ici là, elle tient le fichier d'avant.
 */
async function actionOuvrir() {
    _fermerMenu();

    var fichier = null;
    var poignee = null;

    // Chrome/Edge : showOpenFilePicker donne un handle réutilisable
    if (window.showOpenFilePicker) {
        try {
            var handles = await window.showOpenFilePicker({
                types: [{
                    description: 'Codex Labo Codex',
                    accept: { 'application/zip': ['.zip'] }
                }],
                multiple: false
            });
            var handle = handles[0];
            fichier = await handle.getFile();
            poignee = handle;
        } catch (e) {
            if (e.name === 'AbortError') return; // Annulé par l'utilisateur
            console.warn('📂 showOpenFilePicker échoué, fallback input file', e.message);
        }
    }

    // Fallback : input file classique (iPad, Firefox, etc.) — pas de handle disponible
    if (!fichier) {
        fichier = await ouvrirDialogueFichier();
    }

    if (!fichier) return;

    await _ouvrirLeFichierChoisi(fichier, poignee);
}

/**
 * Ouvrir un codex dont le fichier est DÉJÀ choisi (lot I bis, 1er oct. 2026) : la case
 * « Ouvrir un Codex » de Réglages › Données, qui reçoit son fichier d'un champ de
 * fichier. Même chemin que le menu, mêmes confirmations. Pas de handle : un fichier
 * venu d'un champ ne se réécrit pas en place, comme au repli d'actionOuvrir.
 * @param {File} fichier
 */
async function ouvrirFichier(fichier) {
    if (!fichier) return;
    await _ouvrirLeFichierChoisi(fichier, null);
}

/**
 * La suite commune du menu et de la case : charger, dire le bilan, proposer de recharger.
 *
 * #1012 — le fichier d'origine n'est tenu qu'à bon droit (règle de Cowork, 1er oct. 2026) :
 *  - après une ouverture COMPLÈTE, l'application adopte le fichier choisi (`poignee`, ou
 *    aucun quand le fichier vient d'un champ) ;
 *  - après une annulation ou un refus d'AVANT toute écriture, elle garde celui d'avant ;
 *  - après toute autre fin (incomplète, échec en cours d'écriture), elle n'en tient aucun.
 * `chargerCodex` oublie le fichier d'avant à sa première écriture ; il ne reste ici qu'à
 * adopter le nouveau.
 * @param {File} fichier
 * @param {FileSystemFileHandle|null} poignee - rendue par le sélecteur de Chrome, sinon null
 */
async function _ouvrirLeFichierChoisi(fichier, poignee) {
    try {
        var resultat = await chargerCodex(fichier);
        // Bilan honnête (#334 session B) : ne pas déclarer « ouvert » un codex dont
        // des fichiers travaux manquent. Le bilan est porté par la fenêtre de
        // rechargement, qui reste à l'écran tant qu'on n'a pas répondu (#1012,
        // remarque de Grégoire à la porte : « Le message ne reste pas longtemps »).
        var bilan = null;
        if (resultat.stats.incomplet) {
            // Le fichier choisi n'est PAS adopté : « Mettre à jour le codex » réécrirait
            // EN PLACE, sans les copies qui manquent, le seul fichier qui les portait
            // toutes. Il demandera où écrire.
            bilan = construireBilanImport(resultat.stats);
        } else {
            if (poignee) _fileHandle = poignee;
            notifications.succes(
                'Codex ouvert : ' + resultat.manifeste.nom,
                resultat.stats.nbCles + ' clés, ' + resultat.stats.nbBlobs + ' fichiers'
            );
        }
        // Attendre la fin des écritures IDB pendantes AVANT de proposer le
        // rechargement : avec un localStorage saturé, les clés passées par
        // setSync (dont le marqueur de codex actif) ne vivent qu'en
        // memoryCache + écriture IDB asynchrone — un reload immédiat les
        // coupe et l'app redémarre « sans codex actif » alors que les
        // données, elles, sont écrites. Bug terrain iPad 10 juin 2026.
        // (confirm bloque la boucle d'événements : flush AVANT le dialogue.)
        await db.flush();
        // Proposer de recharger pour appliquer les données. Une ouverture
        // COMPLÈTE rappelle de garder le fichier de codex (#1012, 2 oct. 2026) :
        // c'est la seule copie hors de l'application — l'ancien conseil de le
        // supprimer (piste 5 du plan #334) est retiré. En cas d'import
        // incomplet, le bilan conseille de rouvrir le même codex.
        var msgReload = bilan
            ? bilan.message
            : 'Codex chargé depuis « ' + fichier.name + ' » (' + window.TailleFichier.dire(fichier.size) +
              ').\n\nTon fichier de codex n\'a pas changé : garde-le, c\'est ta copie hors de ' +
              'l\'application. Recharger la page pour appliquer les données ?';
        if (await uiDialogues.confirmerAction({
            titre: bilan ? bilan.titre : 'Recharger la page',
            message: msgReload,
            texteConfirmer: 'Recharger',
            preformate: true
        })) {
            // #795 : ne pas se saborder si le serveur ne répond plus — les
            // données viennent d'être écrites, l'écran doit le dire.
            await window.rechargerSiLeServeurRepond();
        }
    } catch (e) {
        // Une annulation volontaire (garde de modèle antérieur, #335 A) n'est
        // pas une erreur — message neutre, sans préfixe alarmant.
        if (e && e.message && e.message.indexOf('Import annulé') === 0) {
            notifications.info(e.message);
            return;
        }
        console.error('📂 Erreur ouverture codex:', e);
        notifications.erreur('Le codex n\'a pas pu être ouvert', e.message);
    }
}

/**
 * Mettre à jour le codex (génère + écrit le fichier).
 * Si un handle FSAPI est disponible, ré-écrit directement sans dialogue.
 */
async function actionEnregistrer() {
    await _mettreAJourLeCodex(false);
}

/**
 * Enregistrer sous... (force le dialogue de destination, même si un handle existe).
 */
async function actionEnregistrerSous() {
    await _mettreAJourLeCodex(true);
}

/* ===============================
   LOT G (#988) — L'ÉCHEC SE DIT, LA CAUSE SE LIT
   ===============================
   Le 29 sept., sur l'iPad (codex d'environ 1 Go), « Mettre à jour le codex » n'a écrit
   aucun fichier et n'a rien dit. Trois règles :
   1. Seul un refus de l'usager sort sans message : « Annuler » de l'aperçu, ou de la
      fenêtre de choix de Chrome. Toute autre issue sans fichier dit « Codex non mis à
      jour » par le témoin commun, qui reste affiché, et propose « Réessayer » (le même
      fichier, sans le refaire) ou « Télécharger à la place ».
   2. Un téléchargement direct est LANCÉ, pas vérifié : l'état « à jour » n'est posé que
      si l'usager dit avoir trouvé le fichier.
   3. La dernière tentative (heure, étape, taille, stratégie, erreur) est gardée pour le
      rapport de bug, et survit au rechargement de l'onglet (sessionStorage) : une page
      tuée pendant la tentative se lit « interrompue ». Rien de personnel : ni nom de
      fichier, ni contenu.
   =============================== */

var CLE_TEMOIN_CODEX = '_codex_fichier';
var CLE_DERNIERE_TENTATIVE = 'labo_codex_derniere_maj_codex';
var _derniereTentative = null;

function _memoriserTentative() {
    try { sessionStorage.setItem(CLE_DERNIERE_TENTATIVE, JSON.stringify(_derniereTentative)); }
    catch (e) { /* stockage de session refusé : la mémoire vive suffit */ }
}

function _debuterTentative(geste) {
    _derniereTentative = {
        debut: new Date().toISOString(),
        geste: geste,
        etape: 'début',
        tailleEstimeeOctets: null,
        tailleOctets: null,
        essais: 0,
        strategie: null,
        toucherFrais: null,
        erreur: null,
        issue: 'en cours',
        fin: null
    };
    _memoriserTentative();
}

function _noterTentative(champs) {
    if (!_derniereTentative) return;
    Object.assign(_derniereTentative, champs);
    _memoriserTentative();
}

function _finirTentative(issue, erreur) {
    var champs = { issue: issue, fin: new Date().toISOString() };
    if (erreur) champs.erreur = { nom: String(erreur.name || 'Error'), message: String(erreur.message || '').slice(0, 300) };
    _noterTentative(champs);
}

/**
 * La dernière tentative de mise à jour du codex, pour le rapport de bug. Après un
 * rechargement, relue du stockage de session : restée « en cours », elle a été interrompue.
 * @returns {Object|null}
 */
function derniereTentative() {
    if (_derniereTentative) return Object.assign({}, _derniereTentative);
    try {
        var lu = JSON.parse(sessionStorage.getItem(CLE_DERNIERE_TENTATIVE) || 'null');
        if (lu && lu.issue === 'en cours') lu.issue = 'interrompue (la page a été rechargée pendant la tentative)';
        return lu;
    } catch (e) {
        return null;
    }
}

/** « 1 fichier », « 12 fichiers » (mots de Grégoire, 29 sept. : plus de « (s) »). */
function _nombreDeFichiers(n) {
    return n + (n > 1 ? ' fichiers' : ' fichier');
}

/**
 * Lot J0 ter (#988) : le message d'attente pendant que l'appareil prépare le fichier pour la
 * feuille de partage. Vécu sur l'iPad le 30 sept. 2026 : un délai assez long pour qu'on se
 * demande s'il y a un problème. C'est la fenêtre de progression du parcours, sans sa barre :
 * il n'y a rien à mesurer. Mots acceptés par Grégoire le 30 sept. 2026.
 * ⚠ SYNCHRONE : appelée entre le toucher et `navigator.share` ; n'y mettre ni await ni minuterie.
 */
function _afficherAttentePartage(taille) {
    _afficherProgression('Ouverture de la feuille de partage…');
    _majProgression(0, 'Ton appareil prépare le fichier (' + taille + '). Ça peut prendre un moment : elle va s\'ouvrir.');
    var piste = document.querySelector('#progression-overlay .progression-piste');
    if (piste) piste.classList.add('u-hide');
}

/** #994 : seulement quand le navigateur signale lui-même un manque d'espace (`QuotaExceededError`). */
var MOTS_MANQUE_D_ESPACE = 'Ton appareil manque d\'espace : libères-en, puis réessaie.';

function _direNonMisAJour(raison) {
    if (window.temoinEnregistrement) {
        window.temoinEnregistrement.nonEnregistre(raison, undefined, CLE_TEMOIN_CODEX, 'Codex non mis à jour');
    }
}

/**
 * #1012 — l'avertissement : des copies attendues n'ont pas de fichier dans l'application.
 * Mots acceptés par Grégoire le 1er oct. 2026 (17 h 52). Il avertit sans refuser : un refus
 * bloquerait pour toujours quelqu'un dont des copies sont vraiment perdues. « Annuler » a le
 * focus (variante `danger`) : une touche Entrée donnée par réflexe n'écrit rien.
 * #1007 : partagé par la mise à jour et le codex à part, comme toute écriture de codex.
 * @returns {{confirmer: function(number, number): Promise<boolean>, refuse: function(): boolean}}
 */
function _avertissementDesCopies() {
    var refuse = false;
    return {
        confirmer: async function(manquantes, attendues) {
            var avertissement = construireAvertissementCopiesManquantes(manquantes, attendues);
            var accepte = await uiDialogues.confirmerAction({
                titre: avertissement.titre,
                message: avertissement.message,
                texteAnnuler: 'Annuler',
                texteConfirmer: avertissement.texteConfirmer,
                variante: 'danger',
                preformate: true
            }) === true;
            refuse = !accepte;
            return accepte;
        },
        refuse: function() { return refuse; }
    };
}

/**
 * L'écriture d'un codex préparé par `genererCodex`, jusqu'au bout : le fichier est écrit, ou
 * l'usager renonce. Le même chemin pour la mise à jour et pour le codex à part (#1007), sur
 * chaque navigateur : la fenêtre de choix (Chrome, Edge), la feuille de partage (iPad), le
 * téléchargement dit trouvé (« Il y est »). Un échec se dit, et propose « Réessayer » ou
 * « Télécharger à la place ».
 * @param {Object} resultat - ce que rend `genererCodex`
 * @param {Object} reglage
 * @param {boolean} reglage.forcerDialogue - demander où écrire, même si un fichier est tenu
 * @param {boolean} reglage.sansAdoption - la destination choisie n'est pas tenue ensuite
 * @param {function(string, boolean): {titre: string, message: string}} reglage.echec - les mots
 *   de l'échec, selon la taille dite et selon que le navigateur a signalé lui-même un manque
 *   d'espace (#994) ; appelée quand aucun fichier n'a été écrit
 * @returns {Promise<{ecrit: boolean, methode?: string}>}
 */
async function _ecrireLeCodexPrepare(resultat, reglage) {
    var taille = window.TailleFichier.dire(resultat.blob.size, { environ: true });
    // Lot J0 bis (#988) : la fenêtre du toucher frais. Mots acceptés par Grégoire le
    // 30 sept. 2026 ; « Touche » devenu « Appuie sur » le 11 oct. (décision de Grégoire : depuis
    // #995, la fenêtre se voit aussi à la souris). « Enregistrer » résout dans son clic : le
    // partage (ou la fenêtre de choix) part dans le geste.
    var toucherFrais = async function(motif) {
        _noterTentative({ toucherFrais: 'demandé (' + motif + ')' });
        var accorde = await uiDialogues.confirmerAction({
            titre: 'Ton codex est prêt',
            message: 'Le fichier (' + taille + ') est préparé. Appuie sur « Enregistrer » pour choisir où le ranger.',
            texteAnnuler: 'Annuler',
            texteConfirmer: 'Enregistrer'
        }) === true;
        _noterTentative({ toucherFrais: 'demandé (' + motif + '), ' + (accorde ? 'accordé' : 'refusé') });
        return accorde;
    };
    // Lot J0 ter (#988) : le message d'attente, tant que le partage est en cours. L'affichage
    // ne doit jamais empêcher le partage : une panne de la fenêtre est avalée ici.
    var attentePartage = function(enCours) {
        try {
            if (enCours) _afficherAttentePartage(taille);
            else _masquerProgression();
        } catch (e) { /* le partage continue sans le message */ }
    };
    var options = { forcerDialogue: reglage.forcerDialogue, sansAdoption: reglage.sansAdoption, sansRepli: true, toucherFrais: toucherFrais, attentePartage: attentePartage };
    while (true) {
        _noterTentative({
            etape: 'enregistrement du fichier',
            tailleOctets: resultat.blob.size,
            essais: _derniereTentative.essais + 1,
            erreur: null
        });
        var sauvegarde;
        try {
            sauvegarde = await sauvegarderVersDestination(resultat.blob, resultat.nomFichier, options);
        } catch (e) {
            console.warn('[Codex] Écriture du fichier échouée : ' + (e && e.name) + ' – ' + (e && e.message));
            sauvegarde = { methode: 'echec', strategie: 'inconnue', erreur: e };
        }
        _noterTentative({ strategie: sauvegarde.strategie || sauvegarde.methode });

        if (sauvegarde.methode === 'annule') {
            _finirTentative(sauvegarde.toucherRefuse ? 'fenêtre « Ton codex est prêt » refusée par l\'usager'
                                                     : 'fenêtre de choix refusée par l\'usager', sauvegarde.erreur);
            return { ecrit: false };
        }

        var ecrit = sauvegarde.methode === 'fsapi' || sauvegarde.methode === 'share';
        if (sauvegarde.methode === 'download') {
            _noterTentative({ etape: 'téléchargement lancé, en attente de l\'usager' });
            ecrit = await window.FichierSortant.confirmerTelechargement(resultat.nomFichier, taille);
            if (!ecrit) console.warn('[Codex] Téléchargement direct : fichier non trouvé par l\'usager.');
        }

        if (ecrit) {
            _finirTentative(sauvegarde.methode === 'download' ? 'téléchargement confirmé par l\'usager' : 'réussie');
            return { ecrit: true, methode: sauvegarde.methode };
        }

        // Aucun fichier écrit : on le dit, et on propose de réessayer.
        _finirTentative(sauvegarde.methode === 'download' ? 'téléchargement non trouvé par l\'usager' : 'échec de l\'écriture du fichier', sauvegarde.erreur);
        // #994 (décision de Grégoire, 15 oct. 2026, 9 h 18) : l'espace n'est nommé que si le
        // navigateur le signale lui-même. Les autres refus (fenêtre de choix, partage,
        // téléchargement dit absent) ne disent pas leur cause : le message ne la devine pas.
        var manqueEspace = !!(sauvegarde.erreur && sauvegarde.erreur.name === 'QuotaExceededError');
        var echec = reglage.echec(taille, manqueEspace);
        var geste = await uiDialogues.demanderAction({
            titre: echec.titre,
            message: echec.message,
            actions: [
                { valeur: 'telecharger', texte: 'Télécharger à la place' },
                { valeur: 'reessayer', texte: 'Réessayer', principal: true }
            ]
        });
        if (geste === 'reessayer') {
            // Sans `toucherFrais` : le clic sur « Réessayer » en est un, et le partage le suit aussitôt.
            options = { forcerDialogue: reglage.forcerDialogue, sansAdoption: reglage.sansAdoption, sansRepli: true, attentePartage: attentePartage };
        } else if (geste === 'telecharger') {
            options = { telechargementDirect: true };
        } else {
            return { ecrit: false };
        }
    }
}

/**
 * « Mettre à jour le codex », du menu ou de la fenêtre qui propose le codex avant une
 * suppression (#1007, second lot) : le même chemin, une seule fois écrit.
 * @returns {Promise<boolean>} true seulement si le fichier est écrit
 */
async function _mettreAJourLeCodex(forcerDialogue) {
    _fermerMenu();
    _debuterTentative(forcerDialogue ? 'Enregistrer sous' : 'Mettre à jour le codex');

    var avertissement = _avertissementDesCopies();
    var resultat;
    try {
        resultat = await genererCodex({ suivreTentative: true, confirmerCopiesManquantes: avertissement.confirmer });
    } catch (e) {
        console.error('📂 Erreur enregistrement codex:', e);
        _finirTentative('échec de la préparation du fichier', e);
        // Le message du navigateur reste dans la tentative (rapport de bug), pas à l'écran.
        _direNonMisAJour('le fichier n\'a pas pu être préparé. Tes données restent dans l\'application. ' +
                         'Si ça se répète, utilise « Signaler un bug » : le détail y sera.');
        return false;
    }
    // Avertissement ou aperçu refusé par l'usager : les seules sorties sans message.
    if (!resultat) {
        _finirTentative(avertissement.refuse() ? 'avertissement des copies manquantes refusé par l\'usager'
                                               : 'aperçu refusé par l\'usager');
        return false;
    }

    // #1012 — tant que des copies manquent, l'application demande toujours où écrire : jamais
    // dans le fichier tenu (qui reste tenu, pour le jour où les copies seront revenues), et la
    // destination choisie n'est pas adoptée. C'est ce qui rend utile la dernière phrase de
    // l'avertissement (« donne un autre nom à celui-ci »). Décision de Cowork, 1er oct. 2026.
    var copiesManquent = resultat.copies.manquantes > 0;
    var demanderOuEcrire = forcerDialogue || copiesManquent;
    var avaitHandle = !!_fileHandle && !demanderOuEcrire;

    var ecriture = await _ecrireLeCodexPrepare(resultat, {
        forcerDialogue: demanderOuEcrire,
        sansAdoption: copiesManquent,
        echec: function(taille, manqueEspace) {
            // Le témoin le dit et reste ; le menu garde « pas à jour ».
            _direNonMisAJour('le fichier (' + taille + ') n\'a pas été enregistré. Tes données restent dans l\'application.');
            // Mots acceptés par Grégoire le 15 oct. 2026 (9 h 18, #994).
            return {
                titre: 'Codex non mis à jour',
                message: 'Le fichier (' + taille + ') n\'a pas été enregistré. ' +
                         (manqueEspace ? MOTS_MANQUE_D_ESPACE + ' ' : '') +
                         'Tes données restent dans l\'application. ' +
                         'Si ça se répète, utilise « Signaler un bug » : le détail y sera.'
            };
        }
    });
    if (!ecriture.ecrit) return false;

    await _marquerCodexAJour(resultat);
    if (window.temoinEnregistrement) window.temoinEnregistrement.fermerSi(CLE_TEMOIN_CODEX);
    var methodeLabel = avaitHandle ? 'même fichier' :
                       ecriture.methode === 'fsapi' ? (forcerDialogue ? 'nouveau fichier' : 'fichier choisi') :
                       ecriture.methode === 'share' ? 'Fichiers' : 'Téléchargements';
    notifications.succes('Codex mis à jour', window.TailleFichier.dire(resultat.blob.size) + ' – ' + methodeLabel);
    return true;
}

/* ===============================
   #1007 (PREMIER LOT) — AVANT DE SUPPRIMER, UN CODEX À PART
   ===============================
   Cinq gestes effacent un trimestre, un groupe ou toutes les données : supprimer un
   trimestre, un groupe-cours, « Supprimer un groupe… », « Vider la liste », « Réinitialiser
   toutes les données ». Décision de Grégoire (2 oct. 2026) : ils EXIGENT un fichier à part,
   sous un autre nom, écrit sans être adopté (la mise à jour suivante n'y touche pas),
   confirmé avant que la suppression puisse se faire. Une seule fonction pour les cinq.
   Mots de la fenêtre acceptés par Grégoire le 15 oct. 2026 (9 h 23, #1020).
   =============================== */

/** Le nom du codex à part : le nom habituel, suivi de « avant-suppression » (la date suit, `_genererNomFichier`). */
function _nomDuCodexAPart() {
    return (_etat.nom || _genererNomCodex()) + ' avant-suppression';
}

/**
 * La fenêtre, puis l'écriture du codex à part. L'appelant ne supprime que sur `true`.
 * Rien n'est adopté, et l'état « à jour » du codex habituel n'est pas touché : ce fichier
 * n'est pas le codex de l'espace.
 * @param {string} premierePhrase - ce que le geste efface (la variante de la première phrase)
 * @returns {Promise<boolean>} true seulement si le fichier à part est écrit (téléchargement :
 *   dit trouvé, « Il y est ») ; « Annuler » ou un échec, à n'importe quelle étape : false
 */
async function ecrireCodexAPartAvantSuppression(premierePhrase) {
    var accepte = await uiDialogues.confirmerAction({
        titre: 'Avant de supprimer, un codex à part',
        message: premierePhrase + '\n' +
            'L\'application va d\'abord écrire un codex à part, sous un autre nom. ' +
            'Tes prochaines mises à jour n\'y toucheront pas. ' +
            'Le rouvrir ramènerait ce que tu supprimes, mais remettrait aussi le reste de tes données ' +
            'dans leur état d\'aujourd\'hui : des changements faits entre-temps pourraient être perdus.',
        texteAnnuler: 'Annuler',
        texteConfirmer: 'Écrire le codex à part',
        variante: 'danger',   // « Annuler » a le focus : une touche Entrée réflexe n'écrit rien
        preformate: true
    }) === true;
    if (!accepte) return false;

    _debuterTentative('Codex à part avant une suppression');
    var avertissement = _avertissementDesCopies();
    var resultat;
    try {
        resultat = await genererCodex({ suivreTentative: true, confirmerCopiesManquantes: avertissement.confirmer, nom: _nomDuCodexAPart() });
    } catch (e) {
        console.error('[Codex] Codex à part non préparé :', e);
        _finirTentative('échec de la préparation du fichier', e);
        await uiDialogues.demanderAction({
            titre: 'Codex à part non écrit',
            message: 'Le fichier n\'a pas pu être préparé : rien n\'a été supprimé. ' +
                     'Si ça se répète, utilise « Signaler un bug » : le détail y sera.',
            actions: []
        });
        return false;
    }
    if (!resultat) {
        _finirTentative(avertissement.refuse() ? 'avertissement des copies manquantes refusé par l\'usager'
                                               : 'aperçu refusé par l\'usager');
        return false;
    }

    var ecriture = await _ecrireLeCodexPrepare(resultat, {
        forcerDialogue: true,
        sansAdoption: true,
        echec: function(taille, manqueEspace) {
            // Mots acceptés par Grégoire le 15 oct. 2026 (9 h 18, #994).
            return {
                titre: 'Codex à part non écrit',
                message: 'Le fichier (' + taille + ') n\'a pas été enregistré : rien n\'a été supprimé. ' +
                         (manqueEspace ? MOTS_MANQUE_D_ESPACE + ' ' : '') +
                         'Si ça se répète, utilise « Signaler un bug » : le détail y sera.'
            };
        }
    });
    if (ecriture.ecrit) notifications.succes('Codex à part écrit', resultat.nomFichier);
    return ecriture.ecrit;
}

/* ===============================
   #1007 (SECOND LOT, 2a) — AVANT DE SUPPRIMER, LE CODEX PROPOSÉ
   ===============================
   Les gestes du côté « propose » (décisions de Grégoire du 2 oct. 2026, § 1, 2 et 8) :
   les données de classe, l'évaluation et les copies, le matériel pédagogique, la corbeille
   et la Modélisation, et deux paramètres de configuration (`enseignants`,
   `modalitesEvaluation`). Codex à jour : rien ne change. Sinon, avant la confirmation
   habituelle du geste, une fenêtre propose la mise à jour, par le chemin même de
   « Mettre à jour le codex » (`_mettreAJourLeCodex`). Une seule fonction pour toutes
   les portes. Lot 2a-2 : les gestes sans question (fusion, pages, « Effacer tout »)
   ne l'appellent que si quelque chose sera effacé. Mots de la fenêtre acceptés par
   Grégoire le 2 oct. 2026 (20 h 29) ; les variantes de la première phrase, une par
   geste, sont dans ce registre et à lui.
   =============================== */

/**
 * Une variante par geste : la première phrase, et le pronom de la seconde (« te la
 * rendre »). Une porte passe sa clé ; une clé absente de ce registre ne supprime rien.
 */
var PROPOSITIONS_AVANT_SUPPRESSION = {
    // Structure et données de classe
    cours:                 { premiere: 'Supprimer cette fiche de cours l\'efface pour de bon.', pronom: 'la' },
    eleve:                 { premiere: 'Supprimer la fiche de cet·te étudiant·e l\'efface pour de bon.', pronom: 'la' },
    enseignant:            { premiere: 'Supprimer ce profil l\'efface pour de bon.', pronom: 'le' },
    horaire:               { premiere: 'Supprimer cet horaire l\'efface pour de bon.', pronom: 'le' },
    // Évaluation et copies
    production:            { premiere: 'Supprimer cette production l\'efface pour de bon.', pronom: 'la' },
    evaluation:            { premiere: 'Supprimer cette évaluation l\'efface pour de bon.', pronom: 'la' },
    copiesExportees:       { premiere: 'Retirer ces copies les efface pour de bon.', pronom: 'les' },
    intervention:          { premiere: 'Supprimer cette intervention l\'efface pour de bon.', pronom: 'la' },
    rencontre:             { premiere: 'Supprimer cette rencontre l\'efface pour de bon.', pronom: 'la' },
    questionnaire:         { premiere: 'Remplacer ce questionnaire l\'efface pour de bon.', pronom: 'le' },
    // Matériel pédagogique et bibliothèques
    grille:                { premiere: 'Supprimer cette grille l\'efface pour de bon.', pronom: 'la' },
    grilleBibliotheque:    { premiere: 'Supprimer cette grille de la Bibliothèque l\'efface pour de bon.', pronom: 'la' },
    collection:            { premiere: 'Supprimer cette collection l\'efface pour de bon.', pronom: 'la' },
    echelle:               { premiere: 'Supprimer cette échelle l\'efface pour de bon.', pronom: 'la' },
    echelleBibliotheque:   { premiere: 'Supprimer cette échelle de la Bibliothèque l\'efface pour de bon.', pronom: 'la' },
    cartouche:             { premiere: 'Supprimer cette cartouche l\'efface pour de bon.', pronom: 'la' },
    cartoucheBibliotheque: { premiere: 'Supprimer cette cartouche de la Bibliothèque l\'efface pour de bon.', pronom: 'la' },
    pratique:              { premiere: 'Supprimer cette pratique l\'efface pour de bon.', pronom: 'la' },
    pratiqueBibliotheque:  { premiere: 'Supprimer cette pratique de la Bibliothèque l\'efface pour de bon.', pronom: 'la' },
    maquette:              { premiere: 'Jeter cette maquette l\'efface pour de bon.', pronom: 'la' },
    ressource:             { premiere: 'Supprimer cette ressource l\'efface pour de bon.', pronom: 'la' },
    productionBibliotheque: { premiere: 'Supprimer cette production de la Bibliothèque l\'efface pour de bon.', pronom: 'la' },
    tampon:                { premiere: 'Supprimer ce tampon l\'efface pour de bon.', pronom: 'le' },
    carte:                 { premiere: 'Supprimer cette carte l\'efface pour de bon.', pronom: 'la' },
    carteBibliotheque:     { premiere: 'Supprimer cette carte de la Bibliothèque l\'efface pour de bon.', pronom: 'la' },
    // Corbeille et Modélisation
    copieCorbeille:        { premiere: 'Supprimer cette copie l\'efface pour de bon.', pronom: 'la' },
    corbeille:             { premiere: 'Vider la corbeille efface pour de bon ces copies.', pronom: 'les' },
    fichierModelisation:   { premiere: 'Supprimer ce fichier l\'efface pour de bon.', pronom: 'le' },
    // Configuration (`enseignants`, `modalitesEvaluation` seulement)
    parametre:             { premiere: 'Supprimer ce paramètre l\'efface pour de bon.', pronom: 'le' },
    // Lot 2a-2 (3 oct. 2026) : les gestes qui demandaient un travail de structure
    fusionCopies:          { premiere: 'Fusionner ces copies efface pour de bon celles qui sont absorbées.', pronom: 'les' },
    copieImportee:         { premiere: 'Supprimer cette copie l\'efface pour de bon.', pronom: 'la' },
    repriseOriginale:      { premiere: 'Appliquer ce jeton de reprise efface pour de bon l\'évaluation originale.', pronom: 'la' },
    reprise:               { premiere: 'Retirer ce jeton de reprise efface pour de bon la reprise.', pronom: 'la' },
    pages:                 { premiere: 'Retirer ces pages les efface pour de bon.', pronom: 'les' },
    remplacement:          { premiere: 'Remplacer celle qui porte déjà ce nom l\'efface pour de bon.', pronom: 'la' },
    seance:                { premiere: 'Réinitialiser cette séance efface pour de bon ses présences et ses notes.', pronom: 'les' },
    annotationsPage:       { premiere: '« Effacer tout » efface pour de bon les annotations de cette page.', pronom: 'les' },
    registreLongitudinal:  { premiere: 'Retirer cet·te étudiant·e du registre efface pour de bon sa copie et ses résultats ultérieurs.', pronom: 'les' },
    resultatsBilan:        { premiere: 'Supprimer ces résultats les efface pour de bon.', pronom: 'les' },
    // Lot 2b (3 oct. 2026) : une ligne d'éditeur, seulement si une évaluation l'emploie
    critere:               { premiere: 'Supprimer ce critère l\'efface pour de bon.', pronom: 'le' },
    sousCritere:           { premiere: 'Supprimer ce sous-critère l\'efface pour de bon.', pronom: 'le' },
    niveau:                { premiere: 'Supprimer ce niveau l\'efface pour de bon.', pronom: 'le' },
    cible:                 { premiere: 'Retirer cette cible l\'efface pour de bon.', pronom: 'la' },
    cibles:                { premiere: 'Retirer ces cibles les efface pour de bon.', pronom: 'les' },
    // #1015 (11 oct. 2026) : seulement si une évaluation porte sur une production de ses types.
    // Mots neufs, à Grégoire avant la release.
    typeTravail:           { premiere: 'Retirer ce type de production l\'efface pour de bon, et la note des spécifications change.', pronom: 'le' },
    forfait:               { premiere: 'Retirer ce forfait l\'efface pour de bon, et la note des spécifications change.', pronom: 'le' },
    // #976 (8 oct. 2026) : un geste qui DÉPLACE, sans rien effacer — `infinitif` remplace
    // « supprimer » dans le titre et les boutons. Mots proposés, à Grégoire avant la release.
    corrigerDA:            { premiere: 'Corriger ce DA déplace sous le nouveau DA tout ce que porte l\'ancien.', pronom: 'le', infinitif: 'corriger' }
};

/**
 * Le message de la fenêtre, pour un geste du registre.
 * @param {string} geste - une clé de PROPOSITIONS_AVANT_SUPPRESSION
 * @returns {string|null} null si la clé est inconnue
 */
function messageDeLaProposition(geste) {
    var v = Object.prototype.hasOwnProperty.call(PROPOSITIONS_AVANT_SUPPRESSION, geste) ? PROPOSITIONS_AVANT_SUPPRESSION[geste] : null;
    if (!v) return null;
    return v.premiere + ' Ton codex à jour pourra te ' + v.pronom + ' rendre, jusqu\'à ta mise à jour suivante.';
}

/**
 * Avant une suppression du côté « propose ». L'appelant ne supprime que sur `true`, et
 * ne fait rien d'autre sur `false` ; sa confirmation habituelle vient APRÈS.
 * - codex à jour : true, sans rien afficher ;
 * - sinon, la fenêtre : « Annuler » (focus) → false ; « Supprimer sans mettre à jour »
 *   → true ; « Mettre à jour, puis supprimer » → le chemin de « Mettre à jour le codex »,
 *   avertissement des copies manquantes compris : true seulement si le fichier est écrit.
 * - aucun codex actif : la même fenêtre ; le bouton du milieu dit « Supprimer sans codex »
 *   (mots acceptés par Grégoire le 3 oct. 2026, 7 h 56) et le troisième écrit un codex (même
 *   chemin : sans fichier tenu, la destination est demandée).
 * @param {string} geste - une clé de PROPOSITIONS_AVANT_SUPPRESSION
 * @returns {Promise<boolean>}
 */
async function proposerCodexAvantSuppression(geste) {
    var message = messageDeLaProposition(geste);
    if (message === null) {
        // Une porte mal branchée ne supprime pas : la sentinelle #1007 le verrouille aussi.
        console.error('[Codex] Geste inconnu avant une suppression : ' + geste);
        return false;
    }
    if (_etat.actif && !_etat.modificationsDepuis) return true;

    var sansCodex = !_etat.actif;
    var verbe = PROPOSITIONS_AVANT_SUPPRESSION[geste].infinitif || 'supprimer';   // #976
    var Verbe = verbe.charAt(0).toUpperCase() + verbe.slice(1);
    var choix = await uiDialogues.demanderAction({
        titre: sansCodex ? 'Écrire un codex avant de ' + verbe + ' ?' : 'Mettre ton codex à jour avant de ' + verbe + ' ?',
        message: message,
        texteFermer: 'Annuler',   // sans bouton « principal », c'est lui qui a le focus
        actions: [
            { valeur: 'sans', texte: sansCodex ? Verbe + ' sans codex' : Verbe + ' sans mettre à jour' },
            { valeur: 'maj', texte: sansCodex ? 'Écrire un codex, puis ' + verbe : 'Mettre à jour, puis ' + verbe }
        ]
    });
    if (choix === 'sans') return true;
    if (choix !== 'maj') return false;
    return (await _mettreAJourLeCodex(false)) === true;
}

/**
 * Créer un nouveau codex (marque l'état actif sans exporter)
 */
async function actionNouveau() {
    _fermerMenu();

    var nom = await uiDialogues.demanderSaisie({
        titre: 'Nouveau codex',
        message: 'Nom du codex :',
        valeurInitiale: _genererNomCodex()
    });
    if (!nom) return;

    _etat.actif = true;
    _etat.nom = nom;
    _etat.derniereSauvegarde = null;
    _etat.modificationsDepuis = new Date().toISOString();
    _etat.manifeste = null;
    _sauvegarderEtat();
    _mettreAJourIndicateur();

    notifications.succes('Nouveau codex : ' + nom);
}

/**
 * Affiche les détails du codex actif
 */
function actionDetails() {
    _fermerMenu();

    var fsapiOk = (typeof window.showSaveFilePicker === 'function');
    var noteFsapi = fsapiOk
        ? '\n\nMode : mise à jour directe du fichier ouvert (Chrome/Edge).'
        : '\n\nMode : téléchargement d\'un nouveau fichier à chaque mise à jour (Safari/iPad). Pense à remplacer toi-même le fichier précédent sur ta clé USB.';

    if (!_etat.manifeste) {
        uiDialogues.informer({
            titre: 'Aucun codex actif',
            message: 'Pour commencer :\n• « Ouvrir un codex » pour charger un fichier existant\n• « Nouveau codex » pour en créer un\n• « Mettre à jour le codex » pour mettre tes données actuelles dans un fichier' + noteFsapi,
            preformate: true
        });
        return;
    }

    var m = _etat.manifeste;
    var details = 'Codex : ' + m.nom + '\n' +
        'Auteur : ' + (m.auteur || 'non défini') + '\n' +
        'Trimestre : ' + (m.trimestre || 'non défini') + '\n' +
        'Appareil : ' + (m.appareil || 'inconnu') + '\n' +
        'Version app : ' + (m.appVersion || '?') + '\n' +
        '\nCréé : ' + _formaterDateLocale(m.dateCreation) + '\n' +
        'Dernière mise à jour : ' + _formaterDateLocale(m.dateDerniereModification) + '\n' +
        '\nContenu :\n' +
        '  ' + (m.contenu.cles ? m.contenu.cles.length : '?') + ' clés de données\n' +
        '  ' + (m.contenu.nombreFichiersTravaux || 0) + ' fichiers travaux\n' +
        '  ' + window.TailleFichier.dire(m.contenu.tailleTotaleOctets || 0) +
        noteFsapi;

    uiDialogues.informer({ titre: 'Détails du codex', message: details, preformate: true });
}

/**
 * Renomme le codex actif via une modale de saisie (uiDialogues.demanderSaisie).
 */
async function actionRenommer() {
    if (!_etat.actif) return;

    var nouveauNom = await uiDialogues.demanderSaisie({
        titre: 'Renommer le codex',
        message: 'Nouveau nom du codex :',
        valeurInitiale: _etat.nom || ''
    });
    if (nouveauNom === null) return; // annulé
    nouveauNom = nouveauNom.trim();
    if (!nouveauNom) return;
    if (nouveauNom === _etat.nom) return;

    _etat.nom = nouveauNom;
    if (_etat.manifeste) _etat.manifeste.nom = nouveauNom;
    marquerModification();
    _actualiserMenu();
    _sauvegarderEtat();
    // ✅ CORRIGÉ (16 mars 2026) : forcer l'écriture IDB pour que syncToLocalStorageCache
    // au prochain chargement ne réécrase pas le nouveau nom avec l'ancien
    await db.set(CLE_ETAT_CODEX, _instantaneEtat());
}

/**
 * Fusionner un codex externe avec le codex local.
 * Flux complet : file picker → lecture externe → analyse → résolution → application → notification.
 */
async function actionFusionner() {
    _fermerMenu();

    if (!_etat.actif) {
        notifications.info('Aucun codex actif', 'Ouvre d\'abord un codex (ou mets à jour le codex avec tes données), puis utilise « Fusionner » pour combiner avec un autre codex.');
        return;
    }

    // 1. Choisir le fichier externe
    var fichier = await ouvrirDialogueFichier();
    if (!fichier) return;

    _afficherProgression('Fusion de codex', fichier && fichier.name);
    _majProgression(0, 'Lecture du codex externe…');
    await _yield();

    try {

    // 2. Lire le codex externe en mémoire (sans toucher à IDB)
    var externe = await lireCodexExterne(fichier);

    // 3. Collecter les données locales depuis IndexedDB
    _majProgression(15, 'Lecture des données locales…');
    await _yield();

    var toutesLesCles = await db.keys();
    var clesFiltrees = toutesLesCles.filter(function(c) {
        return !c.startsWith('_codex_') && !c.startsWith('_');
    });
    var donneesLocales = {};
    for (var i = 0; i < clesFiltrees.length; i++) {
        var val = await db.get(clesFiltrees[i], null);
        if (val !== null) donneesLocales[clesFiltrees[i]] = val;
        if (i % 20 === 0) {
            _majProgression(15 + Math.round((i / clesFiltrees.length) * 15),
                'Lecture des données locales…', (i + 1) + '/' + clesFiltrees.length);
            await _yield();
        }
    }

    // 4. Chercher un ancêtre commun (dernier snapshot partagé, index haché)
    _majProgression(30, 'Recherche d\'un ancêtre commun…');
    await _yield();
    var ancetre = await _lireSnapshotAvant();

    // 4 bis. Garde de modèle antérieur (#335 Lot A) : un externe d'un modèle
    // divergent régresserait silencieusement toute clé non modifiée localement
    // (mécanique 3-way correcte, résultat désastreux).
    var detectionModeleFusion = _detecterModeleAnterieur(externe.donnees, externe.manifeste || null);
    if (detectionModeleFusion) {
        _masquerProgression();
        if (!(await uiDialogues.confirmerAction({
            titre: 'Modèle antérieur détecté',
            message: _messageModeleAnterieur(detectionModeleFusion, 'fusionner avec', fichier && fichier.name),
            texteConfirmer: 'Fusionner quand même',
            variante: 'danger',
            preformate: true
        }))) {
            notifications.warning('Fusion annulée', 'Ton espace de travail n\'a pas été modifié.');
            return;
        }
        _majProgression(35, 'Analyse des différences…');
    }

    // 5. Analyser les différences (données)
    _majProgression(35, 'Analyse des différences…');
    await _yield();

    var analyse = await _analyserFusion(donneesLocales, externe.donnees, ancetre);

    // 6. Analyser les différences (travaux/blobs)
    // Construire la liste des chemins locaux
    var travauxLocaux = [];
    var cleFTLocale = toutesLesCles.find(function(c) { return c.includes('fichiersTravaux'); });
    if (cleFTLocale && donneesLocales[cleFTLocale] && Array.isArray(donneesLocales[cleFTLocale])) {
        donneesLocales[cleFTLocale].forEach(function(f) {
            var ext = (f.nomFichier || 'bin').split('.').pop();
            travauxLocaux.push(DOSSIER_TRAVAUX + '/' + f.id + '.' + ext);
        });
    }

    var analyseTravaux = _analyserFusionTravaux(travauxLocaux, externe.travauxListe);

    _masquerProgression();

    // 7. Résolution des conflits (interaction utilisateur)
    var plan = await _resoudreConflits(analyse, donneesLocales, externe.donnees, analyseTravaux);

    if (plan.annule) {
        return;
    }

    // 8. Appliquer les résolutions dans IndexedDB
    _afficherProgression('Application de la fusion');
    var clesResolution = Object.keys(plan.resolutions);
    var nbAppliquees = 0;
    var nbSupprimees = 0;

    for (var j = 0; j < clesResolution.length; j++) {
        var cle = clesResolution[j];
        var action = plan.resolutions[cle];

        if (action === 'externe') {
            // Écrire la valeur externe dans IDB
            await db.set(cle, externe.donnees[cle]);
            nbAppliquees++;
        } else if (action === 'supprimer') {
            // Supprimer la clé de IDB
            await db.remove(cle);
            nbSupprimees++;
        }
        // 'local' → rien à faire, la valeur est déjà en IDB

        if (j % 10 === 0) {
            _majProgression(Math.round((j / clesResolution.length) * 60),
                'Écriture des données…', (j + 1) + '/' + clesResolution.length);
            await _yield();
        }
    }

    // 9. Synchroniser le cache localStorage
    _majProgression(60, 'Synchronisation du cache…');
    await db.syncToLocalStorageCache();

    // 10. Importer les blobs travaux externes
    var statsTravaux = { importes: 0, ignores: 0, erreurs: [] };
    if (plan.importerTravaux.length > 0) {
        statsTravaux = await _fusionnerTravaux(
            externe._zip, externe.donnees, plan.importerTravaux,
            function(pct, msg) {
                _majProgression(60 + Math.round(pct * 0.35), 'Import des fichiers travaux…', msg);
            }
        );
    }

    // 11. Marquer comme modifié (il faudra réenregistrer le codex)
    marquerModification();

    // 12. Résumé final
    _majProgression(100, 'Fusion terminée !');
    await new Promise(function(r) { setTimeout(r, 800); });
    _masquerProgression();

    var nbExternes = 0;
    var nbLocaux = 0;
    for (var k = 0; k < clesResolution.length; k++) {
        if (plan.resolutions[clesResolution[k]] === 'externe') nbExternes++;
        else if (plan.resolutions[clesResolution[k]] === 'local') nbLocaux++;
    }

    var resume = 'Fusion terminée !\n\n' +
        'Codex externe : "' + externe.manifeste.nom + '"\n\n' +
        'Clés identiques : ' + analyse.identiques + '\n' +
        'Gardées (locales) : ' + nbLocaux + '\n' +
        'Importées (externes) : ' + nbExternes + '\n' +
        'Supprimées : ' + nbSupprimees + '\n';

    if (statsTravaux.importes > 0) {
        resume += 'Fichiers travaux importés : ' + statsTravaux.importes + '\n';
    }
    if (statsTravaux.erreurs.length > 0) {
        resume += 'Erreurs fichiers : ' + statsTravaux.erreurs.length + '\n';
    }

    resume += '\nPense à mettre à jour le codex pour y mettre la fusion.';

    await uiDialogues.informer({ titre: 'Fusion terminée', message: resume, preformate: true });


    } catch (erreur) {
        _masquerProgression();
        notifications.erreur('Erreur lors de la fusion', erreur.message);
        console.error('📂 Fusion : erreur', erreur);
    }
}

/* ===============================
   COMPARAISON DE CODEX (#243)
   Rapport diagnostic copiable + téléchargeable, sans appliquer
   aucune modification au codex local.
   =============================== */

// Mémoire du dernier rapport généré (pour Copier / Télécharger)
var _dernierRapportComparaison = null;
var _dernierRapportNomFichier = null;

/**
 * Compare le codex actif avec un codex externe et affiche un rapport texte.
 * Aucune donnée locale n'est modifiée.
 */
async function actionComparer() {
    _fermerMenu();

    if (!_etat.actif) {
        notifications.info('Aucun codex actif', 'Ouvre d\'abord un codex (ou mets à jour le codex avec tes données), puis utilise « Comparer » pour analyser les différences avec un autre codex.');
        return;
    }

    var fichier = await ouvrirDialogueFichier();
    if (!fichier) return;

    _afficherProgression('Comparaison de codex', fichier && fichier.name);
    _majProgression(0, 'Lecture du codex externe…');
    await _yield();

    try {
        var externe = await lireCodexExterne(fichier);

        _majProgression(20, 'Lecture des données locales…');
        await _yield();

        var toutesLesCles = await db.keys();
        var clesFiltrees = toutesLesCles.filter(function(c) {
            return !c.startsWith('_codex_') && !c.startsWith('_');
        });
        var donneesLocales = {};
        for (var i = 0; i < clesFiltrees.length; i++) {
            var val = await db.get(clesFiltrees[i], null);
            if (val !== null) donneesLocales[clesFiltrees[i]] = val;
        }

        _majProgression(50, 'Recherche d\'un ancêtre commun…');
        await _yield();
        var ancetre = await _lireSnapshotAvant();

        _majProgression(65, 'Analyse des différences…');
        await _yield();
        var analyse = await _analyserFusion(donneesLocales, externe.donnees, ancetre);

        var travauxLocaux = [];
        var cleFTLocale = toutesLesCles.find(function(c) { return c.includes('fichiersTravaux'); });
        if (cleFTLocale && donneesLocales[cleFTLocale] && Array.isArray(donneesLocales[cleFTLocale])) {
            donneesLocales[cleFTLocale].forEach(function(f) {
                var ext = (f.nomFichier || 'bin').split('.').pop();
                travauxLocaux.push(DOSSIER_TRAVAUX + '/' + f.id + '.' + ext);
            });
        }
        var analyseTravaux = _analyserFusionTravaux(travauxLocaux, externe.travauxListe);

        _majProgression(90, 'Construction du rapport…');
        await _yield();

        var rapport = _construireRapportComparaison(externe, analyse, analyseTravaux);

        _masquerProgression();
        _afficherModalComparaison(externe, analyse, rapport);

    } catch (erreur) {
        _masquerProgression();
        notifications.erreur('Erreur lors de la comparaison', erreur.message);
        console.error('📂 Comparaison : erreur', erreur);
    }
}

/**
 * Construit le rapport texte détaillé (liste exhaustive des clés par catégorie).
 * @returns {string}
 */
function _construireRapportComparaison(externe, analyse, analyseTravaux) {
    var lignes = [];
    var nomLocal = _etat.nom || '(codex local)';
    var nomExterne = (externe.manifeste && externe.manifeste.nom) || '(codex externe)';

    lignes.push('═══ Rapport de comparaison de codex ═══');
    lignes.push('Généré le : ' + _formaterDateLocale(new Date().toISOString()));
    lignes.push('');
    lignes.push('Codex local   : ' + nomLocal);
    if (_etat.manifeste) {
        lignes.push('  Dernière mise à jour : ' + _formaterDateLocale(_etat.manifeste.dateDerniereModification));
        lignes.push('  Trimestre : ' + (_etat.manifeste.trimestre || 'non défini'));
    }
    lignes.push('');
    lignes.push('Codex externe : ' + nomExterne);
    if (externe.manifeste) {
        lignes.push('  Dernière mise à jour : ' + _formaterDateLocale(externe.manifeste.dateDerniereModification));
        lignes.push('  Trimestre : ' + (externe.manifeste.trimestre || 'non défini'));
        lignes.push('  Auteur : ' + (externe.manifeste.auteur || 'non défini'));
    }
    lignes.push('');

    var totalAuto = analyse.ajouteesLocal.length + analyse.ajouteesExterne.length +
        analyse.modifieesLocal.length + analyse.modifieesExterne.length +
        analyse.supprimeesLocal.length + analyse.supprimeesExterne.length;

    lignes.push('───────── Synthèse ─────────');
    lignes.push('Clés identiques            : ' + analyse.identiques);
    lignes.push('Différences sans conflit   : ' + totalAuto);
    lignes.push('Conflits (modif. des deux) : ' + analyse.conflits.length);
    if (analyseTravaux) {
        lignes.push('Fichiers travaux communs   : ' + analyseTravaux.communs.length);
        lignes.push('Fichiers travaux externes  : ' + analyseTravaux.uniquementExterne.length);
    }
    lignes.push('');

    function bloc(titre, cles, marqueur) {
        if (!cles || cles.length === 0) return;
        lignes.push('───────── ' + titre + ' (' + cles.length + ') ─────────');
        var triees = cles.slice().sort();
        for (var i = 0; i < triees.length; i++) {
            lignes.push('  ' + marqueur + ' ' + triees[i]);
        }
        lignes.push('');
    }

    bloc('Présent uniquement dans local', analyse.ajouteesLocal, '+');
    bloc('Présent uniquement dans externe', analyse.ajouteesExterne, '←');
    bloc('Modifié dans local seulement', analyse.modifieesLocal, '✓');
    bloc('Modifié dans externe seulement', analyse.modifieesExterne, '←');
    bloc('Supprimé dans local seulement', analyse.supprimeesLocal, '✗');
    bloc('Supprimé dans externe seulement', analyse.supprimeesExterne, '✗');
    bloc('CONFLITS — modifié des deux côtés', analyse.conflits, '⚠');

    if (analyseTravaux && analyseTravaux.uniquementExterne.length > 0) {
        bloc('Fichiers travaux présents uniquement dans externe', analyseTravaux.uniquementExterne, '←');
    }

    lignes.push('───────── Fin du rapport ─────────');
    return lignes.join('\n');
}

/**
 * Affiche la modale de comparaison avec le rapport pré-rempli.
 */
function _afficherModalComparaison(externe, analyse, rapport) {
    _dernierRapportComparaison = rapport;

    var nomExterne = (externe.manifeste && externe.manifeste.nom) || 'externe';
    var horodatage = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', 'h');
    _dernierRapportNomFichier = 'comparaison-codex-' + nomExterne.replace(/[^a-z0-9-]+/gi, '-') + '-' + horodatage + '.txt';

    var resume = document.getElementById('codex-comparer-resume');
    if (resume) {
        var nbTotal = analyse.ajouteesLocal.length + analyse.ajouteesExterne.length +
            analyse.modifieesLocal.length + analyse.modifieesExterne.length +
            analyse.supprimeesLocal.length + analyse.supprimeesExterne.length +
            analyse.conflits.length;
        resume.textContent = 'Comparaison avec « ' + nomExterne + ' » : ' +
            analyse.identiques + ' clé(s) identique(s), ' +
            nbTotal + ' différence(s), ' +
            analyse.conflits.length + ' conflit(s).';
    }

    var textarea = document.getElementById('codex-comparer-rapport');
    if (textarea) textarea.value = rapport;

    var modal = document.getElementById('modalCodexComparer');
    if (modal) modal.classList.add('actif');
}

function fermerModalComparer() {
    var modal = document.getElementById('modalCodexComparer');
    if (modal) modal.classList.remove('actif');
}

async function copierRapportComparaison() {
    if (!_dernierRapportComparaison) return;
    try {
        await navigator.clipboard.writeText(_dernierRapportComparaison);
        var btn = document.querySelector('[data-action="Codex.copierRapportComparaison"]');
        if (btn) {
            var orig = btn.innerHTML;
            btn.innerHTML = '<span class="icone-inline icone-inline--check" aria-hidden="true"></span>Copié';
            setTimeout(function() { btn.innerHTML = orig; }, 1500);
        }
    } catch (e) {
        // Fallback : sélectionne le textarea pour copie manuelle
        var ta = document.getElementById('codex-comparer-rapport');
        if (ta) { ta.focus(); ta.select(); }
        notifications.warning('Copie automatique refusée', 'Le texte est sélectionné — fais Cmd+C / Ctrl+C.');
    }
}

function telechargerRapportComparaison() {
    if (!_dernierRapportComparaison) return;
    var blob = new Blob([_dernierRapportComparaison], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = _dernierRapportNomFichier || 'comparaison-codex.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
}

/**
 * Exporter une sélection de données (par trimestre) dans un codex partiel.
 * Génère un ZIP contenant uniquement les trimestres choisis + clés globales + blobs associés.
 */
async function actionExporterSelection() {
    _fermerMenu();

    _afficherProgression('Export sélectif');
    _majProgression(0, 'Lecture des données…');
    await _yield();

    try {

    // 1. Collecter toutes les données depuis IndexedDB
    var toutesLesCles = await db.keys();
    var clesFiltrees = toutesLesCles.filter(function(c) {
        return !c.startsWith('_codex_') && !c.startsWith('_');
    });
    var donnees = {};
    for (var i = 0; i < clesFiltrees.length; i++) {
        var val = await db.get(clesFiltrees[i], null);
        if (val !== null) donnees[clesFiltrees[i]] = val;
        if (i % 20 === 0) {
            _majProgression(Math.round((i / clesFiltrees.length) * 20),
                'Lecture des données…', (i + 1) + '/' + clesFiltrees.length);
            await _yield();
        }
    }

    _masquerProgression();

    // T2 : le démo n'est pas un trimestre qu'un codex emporte.
    donnees = _sansLeDemo(donnees);

    // 2. Détecter les trimestres disponibles
    var trimestres = _detecterTrimestresDisponibles(donnees);

    if (trimestres.length === 0) {
        notifications.info('Aucun trimestre détecté dans les données.', 'Il n\'y a rien à exporter.');
        return;
    }

    if (trimestres.length === 1) {
        notifications.info('Un seul trimestre détecté (' + trimestres[0] + ').', 'Utilise « Mettre à jour le codex » pour un export complet.');
        return;
    }

    // 3. Proposer le choix des trimestres
    var listeChoix = 'Quels trimestres exporter ?\n\n';
    for (var t = 0; t < trimestres.length; t++) {
        var nbCles = Object.keys(donnees).filter(function(c) {
            return c.startsWith(trimestres[t] + '_');
        }).length;
        listeChoix += (t + 1) + '.  ' + _formaterNomTrimestre(trimestres[t]) + '  (' + nbCles + ' clés)\n';
    }
    listeChoix += '\nEntrer les numéros séparés par des virgules (ex: 1,3)\nou "tous" pour tout exporter :';

    var choix = await uiDialogues.demanderSaisie({
        titre: 'Export sélectif',
        message: listeChoix,
        preformate: true
    });
    if (!choix) return;

    // 4. Parser la sélection
    var trimestresChoisis = [];
    var choixTrim = choix.trim().toLowerCase();

    if (choixTrim === 'tous' || choixTrim === 'tout') {
        trimestresChoisis = trimestres.slice();
    } else {
        var nums = choixTrim.split(/[,;\s]+/);
        for (var n = 0; n < nums.length; n++) {
            var idx = parseInt(nums[n].trim(), 10);
            if (!isNaN(idx) && idx >= 1 && idx <= trimestres.length) {
                var pref = trimestres[idx - 1];
                if (trimestresChoisis.indexOf(pref) === -1) {
                    trimestresChoisis.push(pref);
                }
            }
        }
    }

    if (trimestresChoisis.length === 0) {
        notifications.warning('Aucun trimestre sélectionné. Export annulé.');
        return;
    }

    // 5. Filtrer les données
    var resultat = _filtrerDonneesPourExport(donnees, trimestresChoisis, true);
    var donneesFiltrees = resultat.donneesFiltrees;

    // 6. Confirmer avec résumé
    var nomsTrimestres = trimestresChoisis.map(function(p) { return _formaterNomTrimestre(p); }).join(', ');
    var resume = 'Export sélectif : ' + nomsTrimestres + '\n\n' +
        'Clés à exporter : ' + resultat.stats.gardees + '\n' +
        'Clés exclues : ' + resultat.stats.exclues + '\n' +
        '(Les données globales sont toujours incluses)\n\n' +
        'Continuer ?';

    if (!(await uiDialogues.confirmerAction({
        titre: 'Export sélectif',
        message: resume,
        texteConfirmer: 'Continuer',
        preformate: true
    }))) return;

    // 7. Construire le ZIP partiel
    _afficherProgression('Export sélectif');
    _majProgression(25, 'Préparation du ZIP…');
    await _yield();

    if (typeof JSZip === 'undefined') {
        _masquerProgression();
        throw new Error('JSZip non disponible.');
    }

    var zip = new JSZip();

    // 7a. Données JSON filtrées
    var json = JSON.stringify(donneesFiltrees, null, 0);
    zip.file(NOM_DONNEES, json);

    // 7b. Blobs travaux associés aux trimestres sélectionnés
    var nbBlobs = 0;
    var tailleTotale = 0;
    zip.folder(DOSSIER_TRAVAUX);
    // #991 : les copies ne sont plus confiées à JSZip ; on n'en garde que la référence, et
    // `FichierSortant.assemblerZip` les range, comme pour « Mettre à jour le codex » (lot J0).
    var copies = [];
    var rangDeLaCopie = {};

    // Collecter les IDs de fichiers référencés dans les données filtrées
    // #1014 : les trois listes, comme le codex entier ; seules les copies de travail comptent
    // pour l'avertissement.
    var cleFT = _clesDesListesDeFichiers(Object.keys(donneesFiltrees), LISTES_DE_FICHIERS);
    var compteDesCopies = _creerCompteDesCopies();

    if (cleFT.length > 0 && typeof travauxStockage !== 'undefined') {
        var tousLesFichiers = [];
        var estUneCopieSel = [];
        for (var ft = 0; ft < cleFT.length; ft++) {
            var liste = donneesFiltrees[cleFT[ft].cle];
            if (Array.isArray(liste)) {
                for (var lf = 0; lf < liste.length; lf++) {
                    tousLesFichiers.push(liste[lf]);
                    estUneCopieSel.push(cleFT[ft].liste === 'fichiersTravaux');
                }
            }
        }

        for (var j = 0; j < tousLesFichiers.length; j++) {
            var f = tousLesFichiers[j];
            var copieTrouvee = false;
            try {
                var blob = await travauxStockage.recupererBlob(f.id);
                if (blob) {
                    copieTrouvee = true;
                    var ext = _extensionDansLeCodex(f.nomFichier);
                    // Comme `genererCodex` : un tampon d'octets est enveloppé, et un même nom
                    // déposé deux fois garde le dernier (ce que faisait JSZip).
                    if (!(blob instanceof Blob)) blob = new Blob([blob]);
                    var nomEntree = DOSSIER_TRAVAUX + '/' + f.id + '.' + ext;
                    if (Object.prototype.hasOwnProperty.call(rangDeLaCopie, nomEntree)) {
                        copies[rangDeLaCopie[nomEntree]].blob = blob;
                    } else {
                        rangDeLaCopie[nomEntree] = copies.length;
                        copies.push({ nom: nomEntree, blob: blob });
                    }
                    nbBlobs++;
                    tailleTotale += blob.size || 0;
                }
            } catch (e) {
                console.warn('📂 Export sélectif : blob ignoré pour ' + f.id, e.message);
            }
            if (estUneCopieSel[j]) compteDesCopies.noter(f, copieTrouvee);
            if (j % 5 === 0) {
                _majProgression(25 + Math.round((j / tousLesFichiers.length) * 35),
                    'Ajout des fichiers travaux…', nbBlobs + '/' + tousLesFichiers.length);
                await _yield();
            }
        }
    }

    // 7b bis. #1012 — des copies attendues de la sélection n'ont pas de fichier : la même fenêtre
    //     que l'avertissement du codex, avant d'écrire. « Annuler » a le focus (variante `danger`)
    //     et n'écrit rien, sans message.
    if (compteDesCopies.manquantes > 0) {
        _masquerProgression();
        var avertissement = construireAvertissementSelectionIncomplete(compteDesCopies.manquantes, compteDesCopies.attendues);
        if (await uiDialogues.confirmerAction({
            titre: avertissement.titre,
            message: avertissement.message,
            texteAnnuler: 'Annuler',
            texteConfirmer: avertissement.texteConfirmer,
            variante: 'danger',
            preformate: true
        }) !== true) return;
        _afficherProgression('Export sélectif');
        _majProgression(60, 'Préparation du ZIP…');
    }

    // 7c. Manifeste (partiel)
    var maintenant = new Date().toISOString();
    var manifeste = {
        formatVersion: FORMAT_VERSION,
        appVersion: _obtenirVersionApp(),
        nom: (_etat.nom || _genererNomCodex()) + ' (sélection)',
        auteur: _etat.manifeste ? _etat.manifeste.auteur : '',
        dateCreation: maintenant,
        dateDerniereModification: maintenant,
        appareil: _identifierAppareil(),
        navigateur: _identifierNavigateur(),        // #244 (11 mai 2026)
        userAgent: navigator.userAgent,             // #244 (string complète pour diagnostic)
        trimestre: trimestresChoisis.join(', '),
        exportSelectif: true,
        trimestresInclus: trimestresChoisis,
        contenu: {
            cles: Object.keys(donneesFiltrees),
            nombreFichiersTravaux: nbBlobs,
            tailleTotaleOctets: new Blob([json]).size + tailleTotale,
            listesDeFichiers: LISTES_DE_FICHIERS.slice()   // #1014
        },
        historique: []
    };

    zip.file(NOM_MANIFESTE, JSON.stringify(manifeste, null, 2));

    // 8. Générer le blob
    _majProgression(65, 'Compression du ZIP…');
    var zipBlob = await window.FichierSortant.assemblerZip(zip, copies, function(pourcent) {
        _majProgression(65 + Math.round(pourcent * 0.30),
            'Compression du ZIP…', window.formaterPourcentage(Math.round(pourcent)));
    });

    _majProgression(98, 'Enregistrement…');
    await _yield();

    // 9. Sauvegarder. #1012 (règle de Cowork, 1er oct. 2026) : une sélection n'est pas le codex
    //    de l'espace. Elle ne s'écrit jamais dans le fichier tenu, demande toujours où écrire,
    //    et sa destination n'est jamais adoptée : « Mettre à jour le codex » y écrirait ensuite
    //    le codex entier, « Dans le même fichier ».
    var nomFichier = _genererNomFichier(manifeste.nom);
    var resultatSave = await sauvegarderVersDestination(zipBlob, nomFichier, { forcerDialogue: true, sansAdoption: true });

    _majProgression(100, 'Export terminé !');
    await new Promise(function(r) { setTimeout(r, 500); });
    _masquerProgression();

    if (resultatSave.methode !== 'annule') {

        notifications.succes(
            'Export sélectif terminé',
            nomsTrimestres + ' — ' + window.TailleFichier.dire(zipBlob.size)
        );
    }

    } catch (erreur) {
        _masquerProgression();
        notifications.erreur('Erreur lors de l\'export sélectif', erreur.message);
        console.error('📂 Export sélectif : erreur', erreur);
    }
}

/**
 * Formate un préfixe de trimestre en nom lisible.
 * @param {string} prefixe - ex: "h2026", "a2025", "demo"
 * @returns {string} - ex: "Hiver 2026", "Automne 2025", "Démo"
 */
function _formaterNomTrimestre(prefixe) {
    if (prefixe === 'demo') return 'Démo';
    var saison = prefixe.charAt(0);
    var annee = prefixe.substring(1);
    if (saison === 'h' || saison === 'e' || saison === 'a') {
        return (window.nomSession ? window.nomSession(saison) : saison) + ' ' + annee;
    }
    return prefixe;
}

/**
 * Fermer le codex actif
 */
async function actionFermer() {
    _fermerMenu();

    if (_etat.modificationsDepuis) {
        if (!(await uiDialogues.confirmerAction({
            titre: 'Ton codex n\'a pas tes derniers changements',
            message: 'Tes données restent dans l\'application ; seul le fichier du codex n\'est pas à jour. Fermer le codex quand même ?',
            texteConfirmer: 'Fermer'
        }))) {
            return;
        }
    }

    fermerCodex();

    notifications.succes('Codex fermé');
}

/**
 * Formate une date ISO en format lisible local
 */
function _formaterDateLocale(dateISO) {
    if (!dateISO) return 'jamais';
    try {
        var d = new Date(dateISO);
        return d.toLocaleDateString('fr-CA', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return dateISO;
    }
}

/* ===============================
   API PUBLIQUE
   =============================== */

window.Codex = {
    // Initialisation
    initialiser: initialiserCodex,

    // Opérations principales
    generer: genererCodex,
    charger: chargerCodex,
    fermer: fermerCodex,

    // Validation / lecture
    valider: validerCodex,
    lireManifeste: lireManifeste,
    estUnFichierDeCodex: estUnFichierDeCodex,
    lireExterne: lireCodexExterne,
    partDuDemo: _partDuDemo,   // T2 du chantier du démo : aussi pour les fichiers anciens (import-export.js)
    construireBilanImport: construireBilanImport,
    construireAvertissementCopiesManquantes: construireAvertissementCopiesManquantes,
    construireAvertissementSelectionIncomplete: construireAvertissementSelectionIncomplete,
    evaluerPrevolStockage: evaluerPrevolStockage,
    // Internes exposés pour les tests Vitest (#334 C — fusion 3-way sensible ;
    // #335 C — vérification de persistance post-import ; #336 D — purge)
    _analyserFusion: _analyserFusion,
    _indexerSnapshot: _indexerSnapshot,
    _verifierEcritureTemoins: _verifierEcritureTemoins,
    _detecterModeleAnterieur: _detecterModeleAnterieur,
    _planifierPurgeEspace: _planifierPurgeEspace,
    _executerPurgeEspace: _executerPurgeEspace,
    _restaurerPlanPurge: _restaurerPlanPurge,
    // #614 — la fusion est une voie d'entrée de blobs vers le store `fichiers`
    // au même titre que `chargerCodex` : elle doit être testable directement.
    _fusionnerTravaux: _fusionnerTravaux,

    // #336 Lot D (phase preview) : exécution manuelle du dernier plan de purge
    purgerEspacePrecedent: purgerEspacePrecedent,

    // Sauvegarde multi-plateforme
    sauvegarder: sauvegarderVersDestination,
    ouvrirDialogue: ouvrirDialogueFichier,

    // Menu en-tête
    toggleMenu: toggleMenu,
    actionOuvrir: actionOuvrir,
    ouvrirFichier: ouvrirFichier,
    actionEnregistrer: actionEnregistrer,
    derniereTentative: derniereTentative,
    actionEnregistrerSous: actionEnregistrerSous,
    ecrireAPartAvantSuppression: ecrireCodexAPartAvantSuppression,   // #1007
    proposerAvantSuppression: proposerCodexAvantSuppression,         // #1007, second lot
    messageDeLaProposition: messageDeLaProposition,
    actionNouveau: actionNouveau,
    actionDetails: actionDetails,
    actionRenommer: actionRenommer,
    actionFusionner: actionFusionner,
    actionComparer: actionComparer,
    fermerModalComparer: fermerModalComparer,
    copierRapportComparaison: copierRapportComparaison,
    telechargerRapportComparaison: telechargerRapportComparaison,
    actionExporterSelection: actionExporterSelection,
    actionFermer: actionFermer,

    // État
    etat: etatCodex,
    marquerModification: marquerModification
};

/* ===============================
   AUTO-INITIALISATION
   =============================== */

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserCodex);
} else {
    initialiserCodex();
}

})();
