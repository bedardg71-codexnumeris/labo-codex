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
// #1182 (29 oct. 2026) : le snapshot de référence (`_codex_snapshot_avant`), ancêtre de l'ancienne
// fusion 3-way, est retiré avec elle : la fusion copie par copie n'a pas d'ancêtre. La clé déjà
// écrite chez les gens reste (stock assumé, quelques dizaines de Ko que plus rien ne lit).
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
        { ancien: CLE_ETAT_ANCIEN,           nouveau: CLE_ETAT_CODEX }
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
 * @param {{titre: string, texteConfirmer: string}} [options.motsApercu] - le titre et le bouton de
 *   l'aperçu ; sans eux, ceux de « Mettre à jour le codex » (le codex à part a les siens)
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

/** #1028/#1184 — les ids que la marque portée par `donnees` dit aux archives (reserve-copies.js). */
function _idsAuxArchives(donnees) {
    return (window.ReserveCopies && typeof window.ReserveCopies.idsDansDonnees === 'function')
        ? window.ReserveCopies.idsDansDonnees(donnees) : {};
}

/**
 * #1184 — l'entrée d'un codex ouvert est-elle écrite ici ? Les clés `_…` restent à l'appareil,
 * sauf la marque des archives (reserve-copies.js) : portée par le codex, elle remplace celle
 * d'ici ; absente (codex d'avant #1028), rien ne bouge. `_manifesteReserve` décrit le dossier
 * d'archives de CET appareil : il reste chez lui.
 */
function _entreeEcriteALOuverture(entree) {
    var cleDeLaMarque = window.ReserveCopies ? window.ReserveCopies.CLE : null;
    if (cleDeLaMarque && entree[0] === cleDeLaMarque) {
        return !!entree[1] && typeof entree[1] === 'object' && !Array.isArray(entree[1]);
    }
    return !entree[0].startsWith('_');
}

/** #1184 — la vignette `thumbnail_<id>` d'une copie marquée aux archives ? */
function _estVignetteAuxArchives(nomCle, auxArchives) {
    return nomCle.indexOf('thumbnail_') === 0 && !!auxArchives[nomCle.slice('thumbnail_'.length)];
}

/** Les mots de l'aperçu pour « Mettre à jour le codex » et « Enregistrer sous » (Grégoire, 24 oct. 2026). */
const MOTS_APERCU_CODEX = { titre: 'Mettre à jour le codex', texteConfirmer: 'Mettre à jour' };

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
    // 1 ter. #1184 : une copie marquée aux archives (la marque des données qu'on écrit, comme à
    //        l'ouverture) ne part pas, même si son fichier est encore ici : ni son fichier, ni sa
    //        vignette. Sans risque : la marque n'est posée que si l'archive rend le même fichier.
    const auxArchives = _idsAuxArchives(donnees);
    Object.keys(auxArchives).forEach(function(id) { delete donnees['thumbnail_' + id]; });
    const clesDuCodex = clesFiltrees.filter(function(c) { return !partDuDemo.cles[c] && !_estVignetteAuxArchives(c, auxArchives); });

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
    // le codex, « exporte » et « manquant » compris — sauf celui d'une copie marquée aux archives.
    const compteDesCopies = _creerCompteDesCopies();

    if (clesFT.length > 0 && typeof travauxStockage !== 'undefined') {
        // Aplatir les listes des differents trimestres ; seules les copies de travail comptent
        // pour l'avertissement (#1014 : il ne change pas).
        var fichiers = [];
        var estUneCopie = [];
        clesFT.forEach(function(c) {
            if (Array.isArray(donnees[c.cle])) {
                donnees[c.cle].forEach(function(f) {
                    // #1184 : ni lue, ni écrite, ni comptée (attendue ou manquante).
                    if (f && auxArchives[f.id]) return;
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
    // avant compression et écriture du fichier. L'utilisateur peut annuler.
    // Sautée seulement si le module preview n'est pas chargé (dégradation gracieuse).
    //
    // Le codex n'est pas un export (D4, 26 sept. 2026) : la fenêtre dit « Mettre à jour
    // le codex » et son bouton « Mettre à jour » (mots de Grégoire, 24 oct. 2026) pour
    // « Mettre à jour le codex » et « Enregistrer sous » ; le codex à part avant une
    // suppression passe les siens (`options.motsApercu`).
    //
    // Important UX : on masque l'overlay de progression avant la modale
    // (sinon double affichage), puis on le RÉAFFICHE après le clic
    // « Mettre à jour » pour montrer la compression (qui peut prendre plusieurs
    // minutes avec beaucoup de fichiers). Sans réaffichage, l'utilisateur
    // attend dans le noir pendant generateAsync.
    if (window.SecuriteExportPreview && typeof window.SecuriteExportPreview.previewZipEtConfirmer === 'function') {
        _progMasquer();
        const mots = Object.assign({}, MOTS_APERCU_CODEX, options.motsApercu);
        const ok = await window.SecuriteExportPreview.previewZipEtConfirmer(window.FichierSortant.entreesDuZip(zip, copies, DOSSIER_TRAVAUX + '/'), 'codex', {
            taille: window.TailleFichier.dire(tailleEstimee, { environ: true }),
            titre: mots.titre,
            texteConfirmer: mots.texteConfirmer
        });
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

    // #1184 : les clés `_…` restent à l'appareil, sauf la marque des archives.
    var entreesData = Object.entries(donnees).filter(_entreeEcriteALOuverture);
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
    var auxArchives = _idsAuxArchives(donnees);
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
        // des références dans donnees[cle] : réécrire les clés après marquage.
        var idsManquants = {};
        blobsRefusesMagic.forEach(function(id) { idsManquants[id] = true; });
        blobsAbsentsDuZip.forEach(function(id) { idsManquants[id] = true; });
        blobsEchecs.forEach(function(e) { idsManquants[e.id] = true; });
        if (Object.keys(idsManquants).length > 0) {
            // #1011 (1er oct. 2026) : quand l'espace manque, cette réécriture est
            // refusée elle aussi. Elle ne doit pas emporter l'ouverture : les
            // données sont écrites, le bilan de l'ouverture incomplète doit être rendu
            // et le rechargement proposé. Une clé dont le marquage n'a pas pu
            // s'écrire reprend ses statuts d'avant, pour que la mémoire dise ce qui
            // est réellement stocké.
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
 * fichier, et seulement là.
 * Une modification survenue pendant la génération n'est pas dans le fichier : le
 * codex reste alors « pas à jour ».
 * @param {{manifeste: Object, donnees: Object, compteurAuDebut: number}} resultat - rendu par genererCodex
 */
async function _marquerCodexAJour(resultat) {
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
   FUSION COPIE PAR COPIE (#1182)
   =============================== */

/*
 * #1182 (29 oct. 2026) — la fusion réunit deux codex élément par élément, sans ancêtre.
 * L'ancienne comparait des clés entières à un ancêtre, le dernier codex écrit ou ouvert SUR
 * L'APPAREIL : entre deux appareils partis du même codex, il contient déjà les changements de
 * celui qui fusionne, qui se voyait « inchangé » ; la fusion prenait la liste de l'autre sans
 * annoncer de conflit, et les évaluations faites ici disparaissaient en silence.
 * Décision de Grégoire (29 oct., 14 h 36) : un élément présent d'un seul côté est gardé, la
 * fusion n'efface rien. Faire voyager les suppressions d'un appareil à l'autre est une suite
 * possible (#1182), non faite.
 *
 * Les familles de clés (_familleDeLaCle) :
 *   - l'appareil : les clés `_*` (internes, dont la marque des archives), REGLAGES_DE_L_APPAREIL
 *     et les drapeaux de migration — la valeur d'ici, sans question ; rien n'est importé ;
 *   - calculées (CLES_CALCULEES, DATA-OWNERSHIP « Indices ») : ni d'ici ni de l'autre, leur
 *     module les recalcule après la fusion (_recalculerApresFusion) ;
 *   - une vignette `thumbnail_<id>` suit sa copie ;
 *   - une liste d'objets à `id` : union par `id` ; un même `id` différent des deux côtés est
 *     le conflit de CET élément ;
 *   - une liste à règle d'écrivain (LISTES_PAR_CONTENU) : union par le contenu, puis la règle ;
 *   - le reste (objets, valeurs simples, autres listes) : absent d'un côté, gardé ; différent
 *     des deux côtés, montré.
 */

// Ce qui règle l'affichage de CET appareil (mesuré le 29 oct. sur les codex du Mac et de
// l'iPad) : vus, rappels, onglets, positions, la palette d'annotation, les accès aux dossiers.
var REGLAGES_DE_L_APPAREIL = [
    'backupProchainRappel', 'bienvenue_vu', 'tutoriel_demo_vu', 'nouveautes-beta-93-vue',
    'monitorage-version-vue', 'monitorage-build-vu', 'monitorage-bandeau-vu', 'manifeste-masque',
    'profilOngletDeveloppementActif', 'etatsAccordeonsV2', 'biblio_active_tab', 'biblio-masquer-deja-present',
    'filtresListeEvaluations', 'preferenceTriEvaluations', 'dernieresSelectionsEvaluation',
    'etudiantEnCours', 'exportPDF_derniersReglages', 'rythmeColonnesT1',
    'travaux-fond-canvas', 'travaux-palette-eval-droite-pos', 'travaux-palette-eval-gauche-pos',
    'planif-fond-canvas', 'planif-liens-contourner',
    'elementsMasques', 'categoriesMasquees', 'couleursCategories', 'ordreCategories', 'raccourcisAnnotation',
    'modeApplication', 'trimestreActif', 'groupeCoursActif', 'demo-chargees', 'demo-version-installee',
    'fsapi_persistance_handles'
];

// Les valeurs calculées (nues ou préfixées d'un trimestre).
var CLES_CALCULEES = ['indicesCP', 'indicesAssiduite', 'indicesAssiduiteDetailles', 'indicesPatternsRaI'];

// Les listes sans `id` dont l'écrivain a une règle : chronoEvaluations (travaux-ui.js, le
// chronomètre) garde les 200 dernières entrées, dans l'ordre où elles ont été écrites.
var LISTES_PAR_CONTENU = {
    chronoEvaluations: function(liste) {
        var triee = liste.slice().sort(function(a, b) {
            var da = (a && a.date) || '', db_ = (b && b.date) || '';
            return da < db_ ? -1 : (da > db_ ? 1 : 0);
        });
        return triee.length > 200 ? triee.slice(-200) : triee;
    }
};

// Ce que la fin de la fusion nomme, en mots d'utilisateur (tous féminins : « venues »).
var MOTS_DES_ELEMENTS = {
    evaluationsSauvegardees: ['évaluation', 'évaluations'],
    annotationsTravaux: ['annotation', 'annotations'],
    fichiersTravaux: ['copie', 'copies'],
    corbeilleFichiers: ['copie à la corbeille', 'copies à la corbeille'],
    fichiersModelisation: ['copie de modélisation', 'copies de modélisation'],
    chronoEvaluations: ['mesure du chronomètre', 'mesures du chronomètre']
};
var MOTS_AUTRES = ['autre donnée', 'autres données'];

function _a(objet, nomCle) { return Object.prototype.hasOwnProperty.call(objet, nomCle); }

/** Le nom d'une clé sans son trimestre (`a2026_evaluationsSauvegardees` → `evaluationsSauvegardees`). */
function _nomDeBase(nomCle) {
    return nomCle.replace(/^[aeh]\d{4}_/, '');
}

/** #1182 — la famille d'une clé pour la fusion : 'appareil', 'calculee', 'vignette' ou 'donnee'. */
function _familleDeLaCle(nomCle) {
    if (nomCle.charAt(0) === '_') return 'appareil';
    if (REGLAGES_DE_L_APPAREIL.indexOf(nomCle) !== -1) return 'appareil';
    if (/migration/i.test(nomCle) || /_done$/.test(nomCle) || /^fichierIds_nettoyes_v\d+$/.test(nomCle)) return 'appareil';
    if (CLES_CALCULEES.indexOf(_nomDeBase(nomCle)) !== -1) return 'calculee';
    if (nomCle.indexOf('thumbnail_') === 0) return 'vignette';
    return 'donnee';
}

/**
 * JSON aux propriétés triées : deux appareils peuvent écrire le même objet dans un autre ordre.
 * Suit la sémantique de JSON.stringify, parce que l'autre côté vient d'un fichier JSON et celui
 * d'ici d'IndexedDB : une propriété `undefined` (ou fonction, symbole) est absente, `null` dans
 * une liste ; `toJSON` est respecté (une Date devient sa chaîne). Sinon, un élément gardé ici avec
 * `dateModification: undefined` diffère de lui-même relu d'un codex (retouche de #1182, 29 oct.).
 */
function _jsonStable(v, propriete) {
    if (v && typeof v.toJSON === 'function') v = v.toJSON(propriete === undefined ? '' : propriete);
    if (v instanceof Number || v instanceof String || v instanceof Boolean) v = v.valueOf();
    if (v === undefined || typeof v === 'function' || typeof v === 'symbol') return undefined;
    if (Array.isArray(v)) {
        return '[' + v.map(function(e, i) {
            var j = _jsonStable(e, String(i));
            return j === undefined ? 'null' : j;
        }).join(',') + ']';
    }
    if (v && typeof v === 'object') {
        var parties = [];
        Object.keys(v).sort().forEach(function(k) {
            var j = _jsonStable(v[k], k);
            if (j !== undefined) parties.push(JSON.stringify(k) + ':' + j);
        });
        return '{' + parties.join(',') + '}';
    }
    return JSON.stringify(v);
}

function _aUnId(e) {
    return !!e && typeof e === 'object' && !Array.isArray(e) &&
        ((typeof e.id === 'string' && e.id !== '') || typeof e.id === 'number');
}

/** Une liste dont chaque élément porte un `id` (une liste vide en est une). */
function _estListeAId(v) {
    return Array.isArray(v) && v.every(_aUnId);
}

function _estListeDeFichiers(nomCle) {
    return _clesDesListesDeFichiers([nomCle], LISTES_DE_FICHIERS).length > 0;
}

function _unionParContenu(local, externe, regle) {
    var vus = {};
    var union = [];
    local.concat(externe).forEach(function(e) {
        var j = _jsonStable(e);
        if (vus[j]) return;
        vus[j] = true;
        union.push(e);
    });
    return regle(union);
}

/** L'identifiant d'un conflit dans les choix (`cle`, ou `cle` + `id` pour un élément). */
function _cleDuConflit(c) {
    return c.id === undefined ? c.cle : c.cle + '\n' + c.id;
}

/**
 * #1182 — ce que la fusion ferait de chaque clé (fonction pure, sans ancêtre).
 * @param {Object} local - les données d'ici
 * @param {Object} externe - les données du codex externe
 * @param {{auxArchives?: Object<string, boolean>}} [options] - les ids que la marque D'ICI
 *   (`_copiesAuxArchives`) dit aux archives : ni leur fichier ni leur fiche ne viennent de l'autre
 * @returns {{
 *   identiques: number,
 *   importees: string[],     clés absentes ici, prises de l'autre codex
 *   ajouts: Object<string, Object[]>,   par liste à id : les éléments venus de l'autre
 *   parContenu: Object<string, {ajouts: number}>,  listes à règle d'écrivain (la valeur se
 *                            recalcule à l'écriture, sur ce qui est lu)
 *   conflits: Array<{cle: string, id?: (string|number)}>,  ce qui est montré
 *   vignettes: Object<string, string>,  vignette différente des deux côtés → l'id de sa copie
 *   versLaCorbeille: Object<string, Array>,  liste des copies → ids qui partent à la corbeille
 *   calculees: string[], appareil: string[], auxArchives: number
 * }}
 */
function _analyserFusion(local, externe, options) {
    var auxArchives = (options && options.auxArchives) || {};
    // T2 : le démo ne se fusionne pas — ni écrit, ni supprimé, ni compté.
    var horsFusion = _partDuDemo(local).cles;
    var res = {
        identiques: 0, importees: [], ajouts: {}, parContenu: {}, conflits: [], vignettes: {},
        versLaCorbeille: {}, calculees: [], appareil: [], auxArchives: 0
    };
    var toutesLesCles = new Set(Object.keys(local).concat(Object.keys(externe)));

    for (var nomCle of toutesLesCles) {
        if (nomCle.startsWith('_codex_')) continue;
        if (_estCleDuDemo(nomCle) || horsFusion[nomCle]) continue;

        var dansLocal = nomCle in local;
        var dansExterne = nomCle in externe;
        if (dansLocal && dansExterne && JSON.stringify(local[nomCle]) === JSON.stringify(externe[nomCle])) {
            res.identiques++;
            continue;
        }
        var famille = _familleDeLaCle(nomCle);
        if (famille === 'appareil') { res.appareil.push(nomCle); continue; }
        if (famille === 'calculee') { res.calculees.push(nomCle); continue; }
        if (famille === 'vignette' && auxArchives[nomCle.slice('thumbnail_'.length)]) {
            if (dansExterne) res.auxArchives++;
            continue;
        }
        if (!dansExterne) continue;                                   // seulement ici : gardée
        // Une liste à id absente d'ici se fusionne comme une liste vide : ses éléments sont comptés,
        // et une copie aux archives n'en vient pas.
        var listeVenue = !dansLocal && _estListeAId(externe[nomCle]) && externe[nomCle].length > 0;
        if (!dansLocal && !listeVenue) { res.importees.push(nomCle); continue; }
        var valeurIci = dansLocal ? local[nomCle] : [];
        if (_jsonStable(valeurIci) === _jsonStable(externe[nomCle])) { res.identiques++; continue; }
        if (famille === 'vignette') { res.vignettes[nomCle] = nomCle.slice('thumbnail_'.length); continue; }

        var regle = LISTES_PAR_CONTENU[_nomDeBase(nomCle)];
        if (regle && Array.isArray(valeurIci) && Array.isArray(externe[nomCle])) {
            var dejaIci = {};
            valeurIci.forEach(function(e) { dejaIci[_jsonStable(e)] = true; });
            res.parContenu[nomCle] = {
                ajouts: _unionParContenu(valeurIci, externe[nomCle], regle)
                    .filter(function(e) { return !dejaIci[_jsonStable(e)]; }).length
            };
            continue;
        }

        if (_estListeAId(valeurIci) && _estListeAId(externe[nomCle])) {
            _comparerListeAId(nomCle, valeurIci, externe[nomCle], _estListeDeFichiers(nomCle) ? auxArchives : {}, res);
            continue;
        }

        res.conflits.push({ cle: nomCle });
    }

    _verserALaCorbeille(local, externe, res);
    return res;
}

/**
 * #1182 — une liste à id : un élément seulement là-bas vient (sauf une copie aux archives ici) ;
 * un même id différent des deux côtés est le conflit de cet élément. Écrit dans `res`.
 */
function _comparerListeAId(nomCle, ici, labas, ignorer, res) {
    var parId = {};
    ici.forEach(function(e) { if (!_a(parId, e.id)) parId[e.id] = _jsonStable(e); });
    var vus = {};
    var ajouts = [];
    labas.forEach(function(e) {
        if (_a(vus, e.id)) return;
        vus[e.id] = true;
        if (ignorer[e.id]) { res.auxArchives++; return; }
        if (!_a(parId, e.id)) { ajouts.push(e); return; }
        if (parId[e.id] !== _jsonStable(e)) res.conflits.push({ cle: nomCle, id: e.id });
    });
    if (ajouts.length > 0) res.ajouts[nomCle] = ajouts;
}

/**
 * #1182 — une copie à la corbeille d'un côté et dans les travaux de l'autre va à la corbeille
 * (la corbeille se reprend, rien n'est perdu) : elle ne vient pas de l'autre dans les travaux,
 * n'y est pas un conflit, et la liste d'ici la retire.
 */
function _verserALaCorbeille(local, externe, res) {
    var vues = {};
    Object.keys(local).concat(Object.keys(externe)).forEach(function(cleT) {
        if (vues[cleT] || _nomDeBase(cleT) !== 'fichiersTravaux' || _estCleDuDemo(cleT)) return;
        vues[cleT] = true;
        var cleC = cleT.replace('fichiersTravaux', 'corbeilleFichiers');
        var aLaCorbeille = {};
        [local[cleC], externe[cleC]].forEach(function(liste) {
            if (Array.isArray(liste)) liste.forEach(function(e) { if (_aUnId(e)) aLaCorbeille[e.id] = true; });
        });
        if (Object.keys(aLaCorbeille).length === 0) return;
        if (res.ajouts[cleT]) {
            res.ajouts[cleT] = res.ajouts[cleT].filter(function(e) { return !aLaCorbeille[e.id]; });
            if (res.ajouts[cleT].length === 0) delete res.ajouts[cleT];
        }
        res.conflits = res.conflits.filter(function(c) {
            return !(c.cle === cleT && c.id !== undefined && aLaCorbeille[c.id]);
        });
        var aRetirer = (Array.isArray(local[cleT]) ? local[cleT] : [])
            .filter(function(e) { return _aUnId(e) && aLaCorbeille[e.id]; })
            .map(function(e) { return e.id; });
        if (aRetirer.length > 0) res.versLaCorbeille[cleT] = aRetirer;
    });
}

/**
 * #1182 — les copies dont la fusion prend la version de l'autre codex : venues de l'autre, ou
 * leur conflit tranché pour l'autre. Leur fichier (et leur vignette) vient avec elles.
 * @returns {Object<string, boolean>} ids
 */
function _copiesPrisesDeLAutre(analyse, choix) {
    var ids = {};
    Object.keys(analyse.ajouts).forEach(function(nomCle) {
        if (!_estListeDeFichiers(nomCle)) return;
        analyse.ajouts[nomCle].forEach(function(e) { ids[e.id] = true; });
    });
    analyse.conflits.forEach(function(c) {
        if (c.id !== undefined && _estListeDeFichiers(c.cle) && choix[_cleDuConflit(c)] === 'externe') ids[c.id] = true;
    });
    return ids;
}

/**
 * #1182 — la valeur d'une clé après la fusion (fonction pure), calculée sur la valeur LUE dans la
 * file de la clé (db.modifier) : un geste fait pendant la fusion n'est pas écrasé.
 * @param {string} cle
 * @param {*} lue - la valeur d'ici au moment d'écrire (null si absente)
 * @param {Object} externe - les données du codex externe
 * @param {Object} analyse - rendue par _analyserFusion
 * @param {Object<string, 'local'|'externe'>} choix - par _cleDuConflit ; sans choix, ici
 * @param {Object<string, boolean>} [manquants] - copies prises de l'autre dont le fichier n'a pas
 *   pu venir : marquées « manquant », comme à l'ouverture
 * @returns {*} la valeur à écrire, ou undefined : rien à écrire
 */
function _valeurApresFusion(nomCle, lue, externe, analyse, choix, manquants) {
    manquants = manquants || {};
    if (analyse.importees.indexOf(nomCle) !== -1) {
        return (lue === null || lue === undefined) ? externe[nomCle] : undefined;
    }
    if (choix[nomCle] === 'externe' && analyse.conflits.some(function(c) { return c.cle === nomCle && c.id === undefined; })) {
        return externe[nomCle];
    }
    if (analyse.parContenu[nomCle]) {
        var regle = LISTES_PAR_CONTENU[_nomDeBase(nomCle)];
        return _unionParContenu(Array.isArray(lue) ? lue : [], externe[nomCle], regle);
    }
    if (_a(analyse.vignettes, nomCle)) {
        return _copiesPrisesDeLAutre(analyse, choix)[analyse.vignettes[nomCle]] ? externe[nomCle] : undefined;
    }

    var ajouts = analyse.ajouts[nomCle] || [];
    var remplaces = {};
    analyse.conflits.forEach(function(c) {
        if (c.cle === nomCle && c.id !== undefined && choix[_cleDuConflit(c)] === 'externe') remplaces[c.id] = true;
    });
    var retires = {};
    (analyse.versLaCorbeille[nomCle] || []).forEach(function(id) { retires[id] = true; });
    if (ajouts.length === 0 && Object.keys(remplaces).length === 0 && Object.keys(retires).length === 0) return undefined;

    var deLAutre = {};
    (Array.isArray(externe[nomCle]) ? externe[nomCle] : []).forEach(function(e) { if (_aUnId(e) && !_a(deLAutre, e.id)) deLAutre[e.id] = e; });
    var fichiers = _estListeDeFichiers(nomCle);
    function venu(e) {
        if (!fichiers || !manquants[e.id]) return e;
        var copie = Object.assign({}, e);
        copie.blobStatut = 'manquant';
        return copie;
    }

    var liste = (Array.isArray(lue) ? lue : []).filter(function(e) { return !(_aUnId(e) && retires[e.id]); });
    var remplace = {};
    liste = liste.map(function(e) {
        if (!_aUnId(e) || !remplaces[e.id] || remplace[e.id] || !deLAutre[e.id]) return e;
        remplace[e.id] = true;
        return venu(deLAutre[e.id]);
    });
    var ici = {};
    liste.forEach(function(e) { if (_aUnId(e)) ici[e.id] = true; });
    ajouts.forEach(function(e) {
        if (ici[e.id]) return;
        ici[e.id] = true;
        liste.push(venu(e));
    });
    return liste;
}

/** Les clés que la fusion écrit ; la corbeille avant les travaux (une copie y arrive avant de partir). */
function _clesAEcrire(analyse, choix) {
    var cles = {};
    analyse.importees.forEach(function(c) { cles[c] = true; });
    Object.keys(analyse.ajouts).forEach(function(c) { cles[c] = true; });
    Object.keys(analyse.parContenu).forEach(function(c) { cles[c] = true; });
    Object.keys(analyse.vignettes).forEach(function(c) { cles[c] = true; });
    Object.keys(analyse.versLaCorbeille).forEach(function(c) { cles[c] = true; });
    analyse.conflits.forEach(function(c) { if (choix[_cleDuConflit(c)] === 'externe') cles[c.cle] = true; });
    return Object.keys(cles).sort(function(a, b) {
        var ca = _nomDeBase(a) === 'corbeilleFichiers' ? 0 : 1;
        var cb = _nomDeBase(b) === 'corbeilleFichiers' ? 0 : 1;
        return ca - cb;
    });
}

/* ----- Les mots ----- */

function _motsDe(nomCle) {
    return MOTS_DES_ELEMENTS[_nomDeBase(nomCle)] || MOTS_AUTRES;
}

/** « 14 évaluations, 14 annotations et 2 copies », dans l'ordre de MOTS_DES_ELEMENTS ; '' si rien. */
function _direLesComptes(comptes) {
    var ordre = Object.keys(MOTS_DES_ELEMENTS).map(function(k) { return MOTS_DES_ELEMENTS[k][1]; });
    ordre.push(MOTS_AUTRES[1]);
    var parties = [];
    ordre.forEach(function(mot) {
        var c = comptes[mot];
        if (c && c.n > 0) parties.push(c.n + ' ' + (c.n > 1 ? c.mots[1] : c.mots[0]));
    });
    if (parties.length <= 1) return parties.join('');
    return parties.slice(0, -1).join(', ') + ' et ' + parties[parties.length - 1];
}

function _compter(comptes, nomCle, n) {
    var mots = _motsDe(nomCle);
    if (!comptes[mots[1]]) comptes[mots[1]] = { mots: mots, n: 0 };
    comptes[mots[1]].n += n;
}

/**
 * #1182 — ce qui entre, compté en mots d'utilisateur. Une clé venue entière de l'autre compte
 * ses éléments si c'est une liste nommée, sinon pour une « autre donnée ». Les vignettes ne
 * comptent pas : elles suivent leur copie.
 * @returns {{venues: string, nbVenues: number, remplacees: string, nbRemplacees: number,
 *   versLaCorbeille: string, nbVersLaCorbeille: number}}
 */
function _direCeQuiEntre(analyse, externe, choix) {
    var venues = {};
    var remplacees = {};
    var corbeille = {};
    Object.keys(analyse.ajouts).forEach(function(nomCle) { _compter(venues, nomCle, analyse.ajouts[nomCle].length); });
    Object.keys(analyse.parContenu).forEach(function(nomCle) { _compter(venues, nomCle, analyse.parContenu[nomCle].ajouts); });
    analyse.importees.forEach(function(nomCle) {
        if (_familleDeLaCle(nomCle) === 'vignette') return;
        var v = externe[nomCle];
        if (v === null || v === undefined || (typeof v === 'object' && Object.keys(v).length === 0)) return;   // une liste vide n'apporte rien
        var nomme = _a(MOTS_DES_ELEMENTS, _nomDeBase(nomCle)) && Array.isArray(v);
        _compter(venues, nomme ? cle : '', nomme ? v.length : 1);
    });
    analyse.conflits.forEach(function(c) {
        if (choix[_cleDuConflit(c)] === 'externe') _compter(remplacees, c.id !== undefined ? c.cle : '', 1);
    });
    Object.keys(analyse.versLaCorbeille).forEach(function(nomCle) { _compter(corbeille, nomCle, analyse.versLaCorbeille[nomCle].length); });
    var total = function(comptes) {
        return Object.keys(comptes).reduce(function(n, mot) { return n + comptes[mot].n; }, 0);
    };
    return {
        venues: _direLesComptes(venues), nbVenues: total(venues),
        remplacees: _direLesComptes(remplacees), nbRemplacees: total(remplacees),
        versLaCorbeille: _direLesComptes(corbeille), nbVersLaCorbeille: total(corbeille)
    };
}

/** Ce qui nomme un élément à l'écran : sa production et son élève (jamais dans un rapport). */
function _nommerElement(nomCle, e, donnees) {
    var prefixe = (/^([aeh]\d{4})_/.exec(nomCle) || [])[1];
    function cleDe(nom) { return prefixe ? prefixe + '_' + nom : nom; }
    var production = e.productionNom || '';
    if (!production && e.productionId && Array.isArray(donnees[cleDe('productions')])) {
        var p = donnees[cleDe('productions')].find(function(x) { return x && x.id === e.productionId; });
        if (p) production = p.titre || p.nom || '';
    }
    var eleve = e.etudiantNom || '';
    if (!eleve && e.etudiantDA && Array.isArray(donnees[cleDe('groupeEtudiants')])) {
        var et = donnees[cleDe('groupeEtudiants')].find(function(x) { return x && x.da === e.etudiantDA; });
        if (et) eleve = [et.prenom, et.nom].filter(Boolean).join(' ');
    }
    var mot = _motsDe(nomCle)[0];
    var nom = [production, eleve].filter(Boolean).join(' · ') || e.nomFichier || e.titre || e.nom || String(e.id);
    return mot.charAt(0).toUpperCase() + mot.slice(1) + ' — ' + nom;
}

function _dateDe(e) {
    var d = e && (e.dateModification || e.dateEvaluation || e.dateCreation || e.dateImport);
    return d ? _formaterDateLocale(d) : 'date inconnue';
}

/** Un conflit dit à l'écran : ce qu'il touche, puis ce qu'il vaut ici et dans l'autre codex. */
function _direLeConflit(c, donneesLocales, donneesExternes) {
    if (c.id === undefined) {
        return {
            titre: 'La donnée « ' + c.cle + ' »',
            ici: _resumerValeur(donneesLocales[c.cle]),
            autre: _resumerValeur(donneesExternes[c.cle])
        };
    }
    var trouver = function(liste) {
        return (Array.isArray(liste) ? liste : []).find(function(e) { return _aUnId(e) && e.id === c.id; });
    };
    var eLocal = trouver(donneesLocales[c.cle]);
    var eExterne = trouver(donneesExternes[c.cle]);
    return {
        titre: _nommerElement(c.cle, eLocal || eExterne, donneesLocales),
        ici: 'modifiée le ' + _dateDe(eLocal),
        autre: 'modifiée le ' + _dateDe(eExterne)
    };
}

/**
 * Le résumé d'avant la fusion, en mots d'utilisateur.
 * @param {Object} analyse - rendue par _analyserFusion
 * @param {Object} donneesLocales
 * @param {Object} donneesExternes
 * @returns {string}
 */
function _formaterAnalyseFusion(analyse, donneesLocales, donneesExternes) {
    var lignes = [];
    var entre = _direCeQuiEntre(analyse, donneesExternes, {});
    lignes.push(entre.venues
        ? 'Viendront de l\'autre codex : ' + entre.venues + '.'
        : 'Rien de neuf ne viendra de l\'autre codex.');
    if (entre.versLaCorbeille) {
        lignes.push('Iront à la corbeille, comme dans l\'autre codex : ' + entre.versLaCorbeille + '.');
    }
    lignes.push('Rien n\'est effacé : ce qui n\'est qu\'ici est gardé.');
    if (analyse.auxArchives > 0) {
        lignes.push('Les copies aux archives ici ne sont pas reprises de l\'autre codex.');
    }
    if (analyse.calculees.length > 0) {
        lignes.push('Les indices seront recalculés après la fusion.');
    }
    if (analyse.conflits.length > 0) {
        lignes.push('');
        lignes.push('Différent des deux côtés (' + analyse.conflits.length + ') :');
        analyse.conflits.forEach(function(c) {
            lignes.push('  ⚠ ' + _direLeConflit(c, donneesLocales, donneesExternes).titre);
        });
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
 * 1. Affiche le résumé (ce qui viendra de l'autre, ce qui diffère des deux côtés)
 * 2. Si conflits > 0, propose une stratégie globale ou "un par un"
 * 3. Retourne les choix, par conflit (_cleDuConflit) ; sans choix, la version d'ici
 *
 * @param {Object} analyse - Retour de _analyserFusion()
 * @param {Object} donneesLocales - Données d'ici
 * @param {Object} donneesExternes - Données du codex externe
 * @returns {Promise<{choix: Object<string, 'local'|'externe'>, annule: boolean}>}
 */
async function _resoudreConflits(analyse, donneesLocales, donneesExternes) {
    var choix = {};
    var resume = _formaterAnalyseFusion(analyse, donneesLocales, donneesExternes);
    var conflits = analyse.conflits;

    if (conflits.length === 0) {
        if (_clesAEcrire(analyse, choix).length === 0) {
            notifications.info('Les deux codex sont identiques. Rien à fusionner.');
            return { choix: choix, annule: true };
        }

        const okAuto = await uiDialogues.confirmerAction({
            titre: 'Fusionner',
            message: resume + '\n\nAucun conflit. Fusionner ?',
            texteConfirmer: 'Fusionner',
            preformate: true
        });
        return { choix: choix, annule: !okAuto };
    }

    // Conflits présents — proposer une stratégie
    var nbConflits = conflits.length;
    var strategieTexte = resume + '\n\n' +
        'Comment résoudre les ' + nbConflits + ' conflit(s) ?\n\n' +
        '1. Garder la version d\'ici pour tous\n' +
        '2. Prendre celle de l\'autre codex pour tous\n' +
        '3. Résoudre un par un\n' +
        '4. Annuler la fusion\n\n' +
        'Entrer 1, 2, 3 ou 4 :';

    var choixStrategie = await uiDialogues.demanderSaisie({
        titre: 'Résoudre les conflits',
        message: strategieTexte,
        preformate: true
    });
    if (!choixStrategie || choixStrategie.trim() === '4') {
        return { choix: choix, annule: true };
    }

    var strategie = parseInt(choixStrategie.trim(), 10);

    if (strategie === 1 || strategie === 2) {
        conflits.forEach(function(c) { choix[_cleDuConflit(c)] = strategie === 1 ? 'local' : 'externe'; });
    } else if (strategie === 3) {
        for (var r = 0; r < conflits.length; r++) {
            var dit = _direLeConflit(conflits[r], donneesLocales, donneesExternes);

            var texteConflit = 'Conflit ' + (r + 1) + '/' + nbConflits + ' : ' + dit.titre + '\n\n' +
                'Ici :           ' + dit.ici + '\n' +
                'Autre codex :   ' + dit.autre + '\n\n' +
                '1. Garder la version d\'ici\n' +
                '2. Prendre celle de l\'autre codex\n' +
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
                    return { choix: {}, annule: true };
                }
                // Re-poser la question pour ce conflit
                r--;
                continue;
            }

            var choixNum = parseInt(choixConflit.trim(), 10);
            if (choixNum === 1) {
                choix[_cleDuConflit(conflits[r])] = 'local';
            } else if (choixNum === 2) {
                choix[_cleDuConflit(conflits[r])] = 'externe';
            }
            // choixNum === 3 ou autre → pas de choix : la version d'ici reste
        }
    } else {
        // Choix invalide → annuler
        notifications.warning('Choix invalide. Fusion annulée.');
        return { choix: choix, annule: true };
    }

    return { choix: choix, annule: false };
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

/** L'id d'une copie d'après son chemin dans le codex (« travaux/FT_abc.pdf » → « FT_abc »). */
function _idDuChemin(chemin) {
    var nom = chemin.replace(DOSSIER_TRAVAUX + '/', '');
    var point = nom.lastIndexOf('.');
    return point > 0 ? nom.substring(0, point) : nom;
}

/**
 * Importe les fichiers des copies que la fusion prend de l'autre codex. Leurs fiches, elles, sont
 * écrites par la fusion (_ecrireLaFusion, #1182) : ici, seulement les fichiers.
 *
 * @param {JSZip} zipExterne - Instance JSZip du codex externe (de lireCodexExterne._zip)
 * @param {Object} donneesExternes - donnees.json du codex externe
 * @param {string[]} cheminsAImporter - Chemins des fichiers à importer (ex: "travaux/FT_abc.pdf")
 * @param {Function} [onProgression] - Callback optionnel (pourcentage, message)
 * @returns {Promise<{importes: number, ignores: number, erreurs: string[], manquants: Object<string, boolean>}>}
 *   `manquants` : les ids dont le fichier n'est pas venu
 */
async function _fusionnerTravaux(zipExterne, donneesExternes, cheminsAImporter, onProgression) {
    if (!cheminsAImporter || cheminsAImporter.length === 0) {
        return { importes: 0, ignores: 0, erreurs: [], manquants: {} };
    }

    var manquants = {};
    if (typeof travauxStockage === 'undefined') {
        console.warn('📂 Fusion : travauxStockage non disponible, blobs ignorés');
        cheminsAImporter.forEach(function(ch) { manquants[_idDuChemin(ch)] = true; });
        return { importes: 0, ignores: cheminsAImporter.length, erreurs: ['travauxStockage non disponible'], manquants: manquants };
    }

    // Un index id → fiche, depuis TOUTES les listes de fichiers, tous trimestres (H5, #1014,
    // #1182 : `.find` ne lisait que la première).
    var indexFT = {};
    _clesDesListesDeFichiers(Object.keys(donneesExternes), LISTES_DE_FICHIERS).forEach(function(c) {
        if (!Array.isArray(donneesExternes[c.cle])) return;
        donneesExternes[c.cle].forEach(function(f) {
            if (f && !indexFT[f.id]) indexFT[f.id] = f;
        });
    });

    var importes = 0;
    var ignores = 0;
    var erreurs = [];

    for (var i = 0; i < cheminsAImporter.length; i++) {
        var chemin = cheminsAImporter[i];

        var idFichier = _idDuChemin(chemin);
        manquants[idFichier] = true;

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
            delete manquants[idFichier];
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

    return { importes: importes, ignores: ignores, erreurs: erreurs, manquants: manquants };
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
/** L'aperçu du codex à part : il n'écrit pas dans le codex tenu, mais un autre fichier (Grégoire, 24 oct. 2026, 9 h 01). */
const MOTS_APERCU_CODEX_A_PART = { titre: 'Écrire le codex à part', texteConfirmer: 'Écrire' };

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
        resultat = await genererCodex({ suivreTentative: true, confirmerCopiesManquantes: avertissement.confirmer, nom: _nomDuCodexAPart(), motsApercu: MOTS_APERCU_CODEX_A_PART });
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
    // #1075, point 4 (22 oct. 2026) : « Remplacer l'existant » au doublon d'une copie importée. L'ancienne
    // va à la corbeille, qui l'efface pour de bon après 30 jours. Mots proposés, à Grégoire avant la release.
    copieRemplacee:        { premiere: 'Remplacer ce fichier envoie l\'ancien à la corbeille, qui l\'efface pour de bon après 30 jours.', pronom: 'le', infinitif: 'remplacer' },
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
/** #1182 — les ids que la marque d'ICI dit aux archives (reserve-copies.js, son propriétaire). */
function _copiesAuxArchivesIci() {
    return (window.ReserveCopies && typeof window.ReserveCopies.tousLesIdsMarques === 'function')
        ? window.ReserveCopies.tousLesIdsMarques() : {};
}

/**
 * #1182 — écrit la fusion clé par clé, chacune dans sa file (db.modifier) : la valeur est
 * recalculée sur ce qui est lu au moment d'écrire, un geste fait entre-temps n'est pas écrasé.
 * @returns {Promise<number>} le nombre de clés écrites
 */
async function _ecrireLaFusion(analyse, externe, choix, manquants, onProgression) {
    var cles = _clesAEcrire(analyse, choix);
    var ecrites = 0;
    for (var i = 0; i < cles.length; i++) {
        var nomCle = cles[i];
        var ecrite = await db.modifier(nomCle, function(lue) {
            return _valeurApresFusion(nomCle, lue, externe, analyse, choix, manquants);
        }, null);
        if (ecrite !== undefined) ecrites++;
        if (onProgression && i % 10 === 0) {
            onProgression(Math.round((i / cles.length) * 100), (i + 1) + '/' + cles.length);
            await _yield();
        }
    }
    return ecrites;
}

/**
 * #1182 — les valeurs calculées ne viennent ni d'ici ni de l'autre codex : leur module les
 * recalcule. Mesuré le 29 oct. : rien ne le garantit au retour à l'écran (le drapeau de
 * démarrage `recalculerIndicesCP` de main.js n'a aucun écrivain), d'où l'appel. L'assiduité
 * (indices.js) recalcule A, puis C et P, pour le trimestre actif ; les patterns RàI se
 * recalculent à l'affichage du tableau de bord (tableau-bord-apercu.js). Les autres trimestres
 * gardent leurs valeurs d'ici.
 * @returns {boolean} recalculé
 */
function _recalculerApresFusion() {
    if (typeof window.calculerEtSauvegarderIndicesAssiduite !== 'function') return false;
    try {
        window.calculerEtSauvegarderIndicesAssiduite();
        return true;
    } catch (e) {
        console.warn('[Codex] Recalcul des indices après la fusion :', e && e.message);
        return false;
    }
}

/** #1182 — la fin de la fusion, en mots d'utilisateur. */
function _direLaFinDeLaFusion(nomExterne, analyse, externe, choix, statsTravaux, recalcule) {
    var entre = _direCeQuiEntre(analyse, externe, choix);
    var lignes = ['Codex externe : « ' + nomExterne + ' »', ''];
    lignes.push(entre.venues
        ? entre.venues + ' ' + (entre.nbVenues > 1 ? 'venues' : 'venue') + ' de l\'autre codex.'
        : 'Rien de neuf n\'est venu de l\'autre codex.');
    if (entre.remplacees) {
        lignes.push(entre.remplacees + ' ' + (entre.nbRemplacees > 1 ? 'remplacées' : 'remplacée') +
            ' par la version de l\'autre codex.');
    }
    if (entre.versLaCorbeille) {
        lignes.push(entre.versLaCorbeille + ' ' + (entre.nbVersLaCorbeille > 1 ? 'mises' : 'mise') +
            ' à la corbeille, comme dans l\'autre codex.');
    }
    var gardes = analyse.conflits.filter(function(c) { return choix[_cleDuConflit(c)] !== 'externe'; }).length;
    if (gardes > 0) {
        lignes.push(gardes + (gardes > 1 ? ' différences gardées' : ' différence gardée') + ' telles qu\'ici.');
    }
    if (statsTravaux.importes > 0) {
        lignes.push(statsTravaux.importes + (statsTravaux.importes > 1 ? ' fichiers de copies reçus.' : ' fichier de copie reçu.'));
    }
    if (statsTravaux.erreurs.length > 0) {
        lignes.push(statsTravaux.erreurs.length + ' fichier(s) de copie non reçu(s) : leur copie est dite « manquante ».');
    }
    if (analyse.auxArchives > 0) {
        lignes.push('Les copies aux archives ici n\'ont pas été reprises de l\'autre codex.');
    }
    if (recalcule) lignes.push('Les indices ont été recalculés.');
    lignes.push('');
    lignes.push('Pense à mettre à jour le codex pour y mettre la fusion.');
    return lignes.join('\n');
}

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

    // 4. Garde de modèle antérieur (#335 Lot A) : un externe d'un modèle divergent
    // apporterait des éléments d'un autre modèle de données.
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
    }

    // 5. Analyser, élément par élément (#1182)
    _majProgression(35, 'Analyse des différences…');
    await _yield();
    var auxArchives = _copiesAuxArchivesIci();
    var analyse = _analyserFusion(donneesLocales, externe.donnees, { auxArchives: auxArchives });

    _masquerProgression();

    // 6. Résolution des conflits (interaction utilisateur)
    var plan = await _resoudreConflits(analyse, donneesLocales, externe.donnees);

    if (plan.annule) {
        return;
    }

    // 7. Les fichiers des copies prises de l'autre codex, avant leurs fiches : une fiche dont le
    //    fichier n'a pas pu venir est écrite « manquante ». Jamais une copie aux archives ici.
    _afficherProgression('Application de la fusion');
    var prises = _copiesPrisesDeLAutre(analyse, plan.choix);
    var chemins = (externe.travauxListe || []).filter(function(ch) {
        var id = _idDuChemin(ch);
        return prises[id] && !auxArchives[id];
    });
    var statsTravaux = await _fusionnerTravaux(
        externe._zip, externe.donnees, chemins,
        function(pct, msg) {
            _majProgression(Math.round(pct * 0.5), 'Import des fichiers des copies…', msg);
        }
    );

    // 8. Les données, clé par clé
    var nbEcrites = await _ecrireLaFusion(analyse, externe.donnees, plan.choix, statsTravaux.manquants,
        function(pct, msg) {
            _majProgression(50 + Math.round(pct * 0.4), 'Écriture des données…', msg);
        });

    // 9. Synchroniser le cache localStorage
    _majProgression(90, 'Synchronisation du cache…');
    await db.syncToLocalStorageCache();

    // 10. Les valeurs calculées
    var recalcule = nbEcrites > 0 ? _recalculerApresFusion() : false;

    // 11. Marquer comme modifié (il faudra réenregistrer le codex)
    marquerModification();

    // 12. Résumé final
    _majProgression(100, 'Fusion terminée !');
    await new Promise(function(r) { setTimeout(r, 800); });
    _masquerProgression();

    await uiDialogues.informer({
        titre: 'Fusion terminée',
        message: _direLaFinDeLaFusion(externe.manifeste.nom, analyse, externe.donnees, plan.choix, statsTravaux, recalcule),
        preformate: true
    });


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

        _majProgression(65, 'Analyse des différences…');
        await _yield();
        var auxArchives = _copiesAuxArchivesIci();
        var analyse = _analyserFusion(donneesLocales, externe.donnees, { auxArchives: auxArchives });
        var prises = _copiesPrisesDeLAutre(analyse, {});
        var fichiersAImporter = (externe.travauxListe || []).filter(function(ch) {
            var id = _idDuChemin(ch);
            return prises[id] && !auxArchives[id];
        }).length;

        _majProgression(90, 'Construction du rapport…');
        await _yield();

        var rapport = _construireRapportComparaison(externe, analyse, fichiersAImporter);

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
function _construireRapportComparaison(externe, analyse, fichiersAImporter) {
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

    var entre = _direCeQuiEntre(analyse, externe.donnees, {});

    lignes.push('───────── Synthèse ─────────');
    lignes.push('Clés identiques             : ' + analyse.identiques);
    lignes.push('Viendraient de l\'autre codex : ' + (entre.venues || 'rien'));
    if (entre.versLaCorbeille) lignes.push('Iraient à la corbeille      : ' + entre.versLaCorbeille);
    lignes.push('Différents des deux côtés   : ' + analyse.conflits.length);
    lignes.push('Fichiers de copies à recevoir : ' + fichiersAImporter);
    if (analyse.auxArchives > 0) lignes.push('Aux archives ici, non repris : ' + analyse.auxArchives);
    lignes.push('Rien n\'est effacé : ce qui n\'est qu\'ici est gardé.');
    lignes.push('');

    function bloc(titre, items, marqueur) {
        if (!items || items.length === 0) return;
        lignes.push('───────── ' + titre + ' (' + items.length + ') ─────────');
        var tries = items.slice().sort();
        for (var i = 0; i < tries.length; i++) {
            lignes.push('  ' + marqueur + ' ' + tries[i]);
        }
        lignes.push('');
    }

    // Le rapport se copie et s'envoie : des clés et des ids, jamais de noms.
    bloc('Éléments qui viendraient de l\'autre codex, par clé', Object.keys(analyse.ajouts).map(function(c) {
        return c + ' : ' + analyse.ajouts[c].length;
    }).concat(Object.keys(analyse.parContenu).map(function(c) {
        return c + ' : ' + analyse.parContenu[c].ajouts;
    })), '←');
    bloc('Clés absentes ici, qui viendraient de l\'autre codex', analyse.importees, '←');
    bloc('Vers la corbeille, par clé', Object.keys(analyse.versLaCorbeille).map(function(c) {
        return c + ' : ' + analyse.versLaCorbeille[c].length;
    }), '✗');
    bloc('CONFLITS — différent des deux côtés', analyse.conflits.map(function(c) {
        return c.id === undefined ? c.cle : c.cle + ' · ' + c.id;
    }), '⚠');
    bloc('Réglages de cet appareil (gardés tels qu\'ici)', analyse.appareil, '·');
    bloc('Valeurs calculées (recalculées après la fusion)', analyse.calculees, '·');

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
        var entre = _direCeQuiEntre(analyse, externe.donnees, {});
        resume.textContent = 'Comparaison avec « ' + nomExterne + ' » : ' +
            analyse.identiques + ' clé(s) identique(s) ; ' +
            (entre.venues ? entre.venues + ' viendraient de l\'autre codex' : 'rien de neuf ne viendrait de l\'autre codex') + ' ; ' +
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
    // Internes exposés pour les tests Vitest (#1182 — la fusion copie par copie ;
    // #335 C — vérification de persistance post-import ; #336 D — purge)
    _analyserFusion: _analyserFusion,
    _valeurApresFusion: _valeurApresFusion,
    _clesAEcrire: _clesAEcrire,
    _copiesPrisesDeLAutre: _copiesPrisesDeLAutre,
    _direLaFinDeLaFusion: _direLaFinDeLaFusion,
    _ecrireLaFusion: _ecrireLaFusion,
    _recalculerApresFusion: _recalculerApresFusion,
    _familleDeLaCle: _familleDeLaCle,
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
    estAJour: function() { return !!(_etat.actif && !_etat.modificationsDepuis); },   // #1142 — la réparation du stock l'exige
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
