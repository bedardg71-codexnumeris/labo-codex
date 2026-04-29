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
   =============================== */

(function() {
'use strict';

/* ===============================
   CONSTANTES
   =============================== */

const FORMAT_VERSION = 1;
const EXTENSION_CODEX = '.codex.zip';
const NOM_MANIFESTE = 'codex-manifeste.json';
// Rétrocompatibilité : accepter aussi l'ancien nom de manifeste à l'import
const NOM_MANIFESTE_ANCIEN = 'classeur-manifeste.json';
const NOM_DONNEES = 'donnees.json';
const DOSSIER_TRAVAUX = 'travaux';

// Clés de stockage (non namespacées — globales)
// Migré de _classeur_* vers _codex_* — voir _migrerClesClasseurVersCodex()
const CLE_ETAT_CODEX = '_codex_etat';
// Snapshot de référence : utilisé par actionFusionner comme ancêtre 3-way.
// Le TimeMachine (#250) a été retiré le 28 avril 2026, mais ce snapshot reste utile.
const CLE_SNAPSHOT_AVANT = '_codex_snapshot_avant';
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

// Auto-save — sauvegarde silencieuse à intervalle quand un handle FSAPI existe.
var AUTO_SAVE_DELAI = 5 * 60 * 1000;  // 5 minutes par défaut
var _autoSaveTimerId = null;
var _autoSaveEnCours = false;
var _derniereAutoSave = null;          // Date ISO de la dernière auto-save réussie

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
    // Lancer la migration (async, non bloquante pour le premier rendu)
    _migrerClesClasseurVersCodex().then(function(resultat) {
        if (resultat.migrees > 0) {
            // Relire l'état depuis la nouvelle clé après migration
            var etatMigre = db.getSync(CLE_ETAT_CODEX, null);
            if (etatMigre && etatMigre.actif) {
                _etat = Object.assign({}, _etat, etatMigre);
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

    // CLE_ETAT_CODEX pointe maintenant vers _codex_etat
    // Fallback sur l'ancienne clé pour le premier chargement avant que la migration async ne termine
    var etatSauve = db.getSync(CLE_ETAT_CODEX, null) || db.getSync(CLE_ETAT_ANCIEN, null);
    if (etatSauve && etatSauve.actif) {
        _etat = Object.assign({}, _etat, etatSauve);
    } else {
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
    db.setSync(CLE_ETAT_CODEX, {
        actif: _etat.actif,
        nom: _etat.nom,
        derniereSauvegarde: _etat.derniereSauvegarde,
        modificationsDepuis: _etat.modificationsDepuis,
        manifeste: _etat.manifeste
    });
}

/* ===============================
   GÉNÉRATION D'UN CLASSEUR (EXPORT)
   =============================== */

/**
 * Génère un Codex ZIP depuis les données IndexedDB actuelles.
 * @param {Object} [options]
 * @param {string} [options.nom] - Nom du codex
 * @param {boolean} [options.silencieux=false] - Si true, pas d'overlay de progression (auto-save)
 * @returns {Promise<{blob: Blob, nomFichier: string, manifeste: Object}>}
 */
async function genererCodex(options = {}) {
    if (typeof JSZip === 'undefined') {
        throw new Error('JSZip non disponible. Impossible de générer le codex.');
    }

    var silencieux = !!options.silencieux;

    const debut = performance.now();
    // En mode silencieux (auto-save), pas d'overlay de progression
    var _prog = silencieux ? function() {} : _majProgression;
    var _progMasquer = silencieux ? function() {} : _masquerProgression;

    if (!silencieux) _afficherProgression('Génération du codex');
    _prog(0, 'Lecture des données...');
    await _yield(); // laisser le navigateur peindre l'overlay

    try {

    // 1. Collecter toutes les clés depuis IndexedDB
    const toutesLesCles = await db.keys();
    const clesFiltrees = toutesLesCles.filter(function(c) { return !c.startsWith('_codex_'); });
    const donnees = {};
    for (var i = 0; i < clesFiltrees.length; i++) {
        var valeur = await db.get(clesFiltrees[i], null);
        if (valeur !== null) {
            donnees[clesFiltrees[i]] = valeur;
        }
        if (i % 10 === 0) {
            _prog(
                Math.round((i / clesFiltrees.length) * 20),
                'Lecture des données...',
                (i + 1) + '/' + clesFiltrees.length + ' clés'
            );
            await _yield();
        }
    }

    // 2. Construire le ZIP
    _prog(20, 'Préparation du ZIP...');
    const zip = new JSZip();

    // 2a. Données JSON
    const json = JSON.stringify(donnees, null, 0); // compact
    zip.file(NOM_DONNEES, json);

    // 2b. Blobs des travaux
    let nbBlobs = 0;
    let tailleTotale = 0;
    const cleFT = toutesLesCles.find(function(c) { return c.includes('fichiersTravaux'); });
    const dossier = zip.folder(DOSSIER_TRAVAUX);

    if (cleFT && donnees[cleFT] && Array.isArray(donnees[cleFT]) && typeof travauxStockage !== 'undefined') {
        const fichiers = donnees[cleFT];
        for (var j = 0; j < fichiers.length; j++) {
            var f = fichiers[j];
            try {
                var blob = await travauxStockage.recupererBlob(f.id);
                if (blob) {
                    var ext = (f.nomFichier || 'bin').split('.').pop();
                    dossier.file(f.id + '.' + ext, blob);
                    nbBlobs++;
                    tailleTotale += blob.size || 0;
                }
            } catch (e) {
                console.warn('📂 Codex : blob ignoré pour ' + f.id, e.message);
            }
            if (j % 5 === 0) {
                _prog(
                    20 + Math.round((j / fichiers.length) * 50),
                    'Ajout des fichiers travaux...',
                    nbBlobs + '/' + fichiers.length + ' fichiers (' + _formaterTaille(tailleTotale) + ')'
                );
                await _yield();
            }
        }
    }

    // 3. Mettre à jour le snapshot de référence pour la fusion 3-way
    //    (le TimeMachine a été retiré le 28 avril 2026 — #250)
    await db.set(CLE_SNAPSHOT_AVANT, donnees);

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
        trimestre: trimestreActif,
        contenu: {
            cles: toutesLesCles.filter(c => !c.startsWith('_codex_')),
            nombreFichiersTravaux: nbBlobs,
            tailleTotaleOctets: new Blob([json]).size + tailleTotale
        }
    };

    zip.file(NOM_MANIFESTE, JSON.stringify(manifeste, null, 2));

    // 5. Générer le blob ZIP
    _prog(70, 'Compression du ZIP...', nbBlobs + ' fichier(s), ' + _formaterTaille(tailleTotale));
    const zipBlob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        function(meta) {
            _prog(
                70 + Math.round(meta.percent * 0.28),
                'Compression du ZIP...',
                Math.round(meta.percent) + '% compressé'
            );
        }
    );

    // 6. Mettre à jour l'état
    _prog(98, 'Finalisation...');
    _etat.actif = true;
    _etat.nom = manifeste.nom;
    _etat.derniereSauvegarde = maintenant;
    _etat.modificationsDepuis = null;
    _etat.manifeste = manifeste;
    _sauvegarderEtat();
    _mettreAJourIndicateur();

    const duree = Math.round(performance.now() - debut);

    _prog(100, 'Codex prêt !', _formaterTaille(zipBlob.size));

    // Pause brève pour que l'utilisateur voie "100%" (sauf auto-save)
    if (!silencieux) {
        await new Promise(function(r) { setTimeout(r, 500); });
    }
    _progMasquer();

    // Nom de fichier avec horodatage
    const nomFichier = _genererNomFichier(manifeste.nom);

    return { blob: zipBlob, nomFichier, manifeste };

    } catch (erreur) {
        _progMasquer();
        throw erreur;
    }
}

/* ===============================
   CHARGEMENT D'UN CLASSEUR (IMPORT)
   =============================== */

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
    _afficherProgression('Ouverture du codex');
    _majProgression(0, 'Validation du fichier...', _formaterTaille(fichierZip.size));
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

    // 2. Extraire et charger les données JSON
    _majProgression(15, 'Extraction des données...');
    const jsonStr = await zip.file(NOM_DONNEES).async('string');
    const donnees = JSON.parse(jsonStr);

    var entreesData = Object.entries(donnees).filter(function(e) { return !e[0].startsWith('_'); });
    let nbCles = 0;
    for (var i = 0; i < entreesData.length; i++) {
        await db.set(entreesData[i][0], entreesData[i][1]);
        nbCles++;
        if (i % 10 === 0) {
            _majProgression(
                15 + Math.round((i / entreesData.length) * 20),
                'Restauration des données...',
                (i + 1) + '/' + entreesData.length + ' clés'
            );
            await _yield();
        }
    }

    // 3. Synchroniser le cache localStorage
    _majProgression(35, 'Synchronisation du cache...');
    await db.syncToLocalStorageCache();

    // 4. Restaurer les blobs
    let nbBlobs = 0;
    const cleFT = Object.keys(donnees).find(function(c) { return c.includes('fichiersTravaux'); });
    if (cleFT && donnees[cleFT] && Array.isArray(donnees[cleFT]) && typeof travauxStockage !== 'undefined') {
        var fichiers = donnees[cleFT];
        for (var j = 0; j < fichiers.length; j++) {
            var f = fichiers[j];
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
                            continue;
                        }
                    }
                    await travauxStockage.stockerBlob(f.id, blobData, f.etudiantDA, f.productionId);
                    nbBlobs++;
                }
            } catch (e) {
                console.warn('📂 Codex : blob ignoré pour ' + f.id, e.message);
            }
            if (j % 5 === 0) {
                _majProgression(
                    35 + Math.round((j / fichiers.length) * 60),
                    'Restauration des fichiers travaux...',
                    nbBlobs + '/' + fichiers.length + ' fichiers'
                );
                await _yield();
            }
        }
    }

    // 5. Stocker les données chargées comme snapshot de référence pour la fusion 3-way
    //    (le TimeMachine a été retiré le 28 avril 2026 — #250)
    await db.set(CLE_SNAPSHOT_AVANT, donnees);

    // 6. Mettre à jour l'état
    _majProgression(98, 'Finalisation...');
    const maintenant = new Date().toISOString();
    _etat.actif = true;
    _etat.nom = manifeste.nom;
    _etat.derniereSauvegarde = maintenant;
    _etat.modificationsDepuis = null;
    _etat.manifeste = manifeste;
    _sauvegarderEtat();
    _mettreAJourIndicateur();

    const duree = Math.round(performance.now() - debut);
    const stats = { nbCles: nbCles, nbBlobs: nbBlobs, dureeMs: duree };

    _majProgression(100, 'Codex chargé !', nbCles + ' clés, ' + nbBlobs + ' fichiers');
    await new Promise(function(r) { setTimeout(r, 800); });
    _masquerProgression();

    return { manifeste, stats };

    } catch (erreur) {
        _masquerProgression();
        throw erreur;
    }
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
    if (typeof validerZipSecurite === 'function') {
        var securite = validerZipSecurite(zip);
        if (!securite.valide) {
            return { valide: false, erreurs: [securite.erreur] };
        }
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
        _manifeste: manifeste
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
    var donnees = JSON.parse(jsonStr);

    // 3. Lister les fichiers travaux (sans les extraire)
    var travauxListe = [];
    zip.forEach(function(cheminRelatif) {
        if (cheminRelatif.startsWith(DOSSIER_TRAVAUX + '/') && !cheminRelatif.endsWith('/')) {
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
        handleFSAPI: !!_fileHandle,     // true si ré-écriture directe possible (Chrome/Edge)
        autoSaveActif: !!_autoSaveTimerId,
        derniereAutoSave: _derniereAutoSave
    };
}

/**
 * Marque qu'une modification a eu lieu depuis la dernière sauvegarde.
 * Appelé par les autres modules lorsqu'ils modifient des données.
 */
function marquerModification() {
    if (!_etat.actif) return;
    if (!_etat.modificationsDepuis) {
        _etat.modificationsDepuis = new Date().toISOString();
        _sauvegarderEtat();
    }
    _mettreAJourIndicateur();
}

/**
 * Désactive le codex actif (retour au mode local seul).
 */
function fermerCodex() {
    _arreterAutoSave();
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
 * @param {Blob} blob - Le blob ZIP du codex
 * @param {string} nomFichier - Le nom de fichier suggéré
 * @param {Object} [options]
 * @param {boolean} [options.forcerDialogue=false] - Force le dialogue même si un handle existe
 * @returns {Promise<{methode: string}>}
 */
async function sauvegarderVersDestination(blob, nomFichier, options) {
    var forcerDialogue = options && options.forcerDialogue;

    // Stratégie 1a : Ré-écriture directe via handle FSAPI existant (pas de dialogue)
    if (_fileHandle && !forcerDialogue) {
        try {
            await _ecrireViaHandle(_fileHandle, blob);
            return { methode: 'fsapi' };
        } catch (e) {
            // Handle invalide (fichier déplacé, clé USB retirée, etc.)
            console.warn('📂 Handle FSAPI invalide, on redemande...', e.message);
            _fileHandle = null;
            _arreterAutoSave();
        }
    }

    // Stratégie 1b : File System Access API avec dialogue (Chrome/Edge sur Mac/PC)
    if (window.showSaveFilePicker) {
        try {
            var handle = await window.showSaveFilePicker({
                suggestedName: nomFichier,
                types: [{
                    description: 'Codex Labo Codex',
                    accept: { 'application/zip': ['.zip'] }
                }]
            });
            await _ecrireViaHandle(handle, blob);
            // Conserver le handle pour les sauvegardes suivantes
            _fileHandle = handle;
            _demarrerAutoSave();
            return { methode: 'fsapi' };
        } catch (e) {
            if (e.name === 'AbortError') {
                return { methode: 'annule' };
            }
            console.warn('📂 FSAPI échoué, fallback...', e.message);
        }
    }

    // Stratégie 2 : Web Share API (iPad Safari)
    if (_peutPartagerFichier(blob, nomFichier)) {
        try {
            var fichier = new File([blob], nomFichier, { type: 'application/zip' });
            await navigator.share({
                files: [fichier],
                title: 'Codex Labo Codex'
            });
            return { methode: 'share' };
        } catch (e) {
            if (e.name === 'AbortError') {
                return { methode: 'annule' };
            }
            console.warn('📂 Share API échoué, fallback...', e.message);
        }
    }

    // Stratégie 3 : Téléchargement classique (fallback universel)
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { methode: 'download' };
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
 * @param {Object|null} [ancetre=null] - Dernier état commun connu (snapshot partagé)
 * @returns {{
 *   ajouteesLocal: string[],    - Clés nouvelles seulement dans local
 *   ajouteesExterne: string[],  - Clés nouvelles seulement dans externe
 *   modifieesLocal: string[],   - Clés modifiées seulement dans local (auto-merge: garder local)
 *   modifieesExterne: string[], - Clés modifiées seulement dans externe (auto-merge: prendre externe)
 *   supprimeesLocal: string[],  - Clés supprimées seulement dans local
 *   supprimeesExterne: string[],- Clés supprimées seulement dans externe
 *   conflits: string[],         - Clés modifiées/supprimées des DEUX côtés (choix utilisateur requis)
 *   identiques: number          - Nombre de clés identiques (pas de stats, juste le compte)
 * }}
 */
function _analyserFusion(local, externe, ancetre) {
    var toutesLesCles = new Set(
        Object.keys(local).concat(Object.keys(externe))
    );
    if (ancetre) {
        Object.keys(ancetre).forEach(function(c) { toutesLesCles.add(c); });
    }

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

    toutesLesCles.forEach(function(cle) {
        // Ignorer les clés internes du codex
        if (cle.startsWith('_codex_')) return;

        var dansLocal = cle in local;
        var dansExterne = cle in externe;
        var dansAncetre = ancetre ? (cle in ancetre) : false;

        var jsonLocal = dansLocal ? JSON.stringify(local[cle]) : undefined;
        var jsonExterne = dansExterne ? JSON.stringify(externe[cle]) : undefined;
        var jsonAncetre = (ancetre && dansAncetre) ? JSON.stringify(ancetre[cle]) : undefined;

        // Cas trivial : valeurs identiques
        if (dansLocal && dansExterne && jsonLocal === jsonExterne) {
            resultat.identiques++;
            return;
        }

        if (ancetre) {
            // ── Diff 3 parties (avec ancêtre) ──
            var localChange = jsonLocal !== jsonAncetre;
            var externeChange = jsonExterne !== jsonAncetre;

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
    });

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
function _resoudreConflits(analyse, donneesLocales, donneesExternes, analyseTravaux) {
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
            alert('Les deux codex sont identiques. Rien à fusionner.');
            return { resolutions: resolutions, importerTravaux: importerTravaux, annule: true };
        }

        if (!confirm(resume + '\n\nAucun conflit ! Procéder à la fusion automatique ?')) {
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

    var choixStrategie = prompt(strategieTexte);
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

            var choixConflit = prompt(texteConflit);
            if (!choixConflit) {
                // Annulation en cours de résolution — demander confirmation
                if (confirm('Annuler toute la fusion ?\n\n(Les conflits déjà résolus seront perdus.)')) {
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
        alert('Choix invalide. Fusion annulée.');
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

    // Pattern : un préfixe de trimestre est [a|h|demo]NNNN_ ou "demo_"
    var regex = /^([ah]\d{4}|demo)_/;

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

    var regex = /^([ah]\d{4}|demo)_/;
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
    if (cleFT && importes > 0) {
        var listeLocale = await db.get(cleFT, []);
        var idsLocaux = new Set(listeLocale.map(function(f) { return f.id; }));

        var ajoutees = 0;
        donneesExternes[cleFT].forEach(function(f) {
            if (!idsLocaux.has(f.id)) {
                // Vérifier que ce fichier fait partie de ceux importés
                var importé = cheminsAImporter.some(function(ch) {
                    return ch.indexOf(f.id) !== -1;
                });
                if (importé) {
                    listeLocale.push(f);
                    ajoutees++;
                }
            }
        });

        if (ajoutees > 0) {
            await db.set(cleFT, listeLocale);
        }
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

/**
 * Formate une taille en octets de façon lisible
 */
function _formaterTaille(octets) {
    if (octets < 1024) return octets + ' o';
    if (octets < 1024 * 1024) return (octets / 1024).toFixed(1) + ' Ko';
    if (octets < 1024 * 1024 * 1024) return (octets / (1024 * 1024)).toFixed(1) + ' Mo';
    return (octets / (1024 * 1024 * 1024)).toFixed(2) + ' Go';
}

/* ===============================
   AUTO-SAVE FSAPI
   =============================== */

/**
 * Démarre le timer d'auto-save.
 * Ne fait rien si pas de handle FSAPI ou si déjà démarré.
 */
function _demarrerAutoSave() {
    if (!_fileHandle || _autoSaveTimerId) return;
    _autoSaveTimerId = setInterval(_executerAutoSave, AUTO_SAVE_DELAI);
    _mettreAJourIndicateur();
}

/**
 * Arrête le timer d'auto-save.
 */
function _arreterAutoSave() {
    if (_autoSaveTimerId) {
        clearInterval(_autoSaveTimerId);
        _autoSaveTimerId = null;
    }
    _derniereAutoSave = null;
    _autoSaveEnCours = false;
    _mettreAJourIndicateur();
}

/**
 * Exécute une sauvegarde automatique silencieuse.
 * Ne se déclenche que si :
 * - un handle FSAPI est disponible
 * - il y a des modifications non sauvegardées
 * - aucune auto-save n'est déjà en cours
 */
async function _executerAutoSave() {
    // Gardes
    if (!_fileHandle) { _arreterAutoSave(); return; }
    if (!_etat.actif) return;
    if (!_etat.modificationsDepuis) return;
    if (_autoSaveEnCours) return;

    _autoSaveEnCours = true;

    // Capture du marqueur AVANT que genererCodex ne le mette a null en interne
    // (cf. _etat.modificationsDepuis = null dans genererCodex). Si l'ecriture
    // FSAPI echoue ensuite, il faut restaurer le marqueur sinon les modifs
    // apparaissent comme « sauvees » alors que le fichier disque ne les a pas
    // (data loss invisible pour l'utilisateur).
    var marqueurModifsAvant = _etat.modificationsDepuis;

    try {
        var resultat = await genererCodex({ silencieux: true });
        // Ré-écriture directe via le handle (pas de dialogue)
        await _ecrireViaHandle(_fileHandle, resultat.blob);

        _derniereAutoSave = new Date().toISOString();

        if (typeof window.afficherNotificationSucces === 'function') {
            window.afficherNotificationSucces(
                'Auto-save',
                _formaterTaille(resultat.blob.size) + ' — ' + _formaterHeureLocale(_derniereAutoSave)
            );
        }
    } catch (e) {
        console.warn('📂 Auto-save échoué :', e.message);
        // Restaurer le marqueur de modifications : genererCodex a deja mis
        // modificationsDepuis a null en interne, mais l'ecriture FSAPI a
        // echoue donc les modifs sont en realite toujours non sauvees.
        // L'indicateur d'en-tete reste « modifie » et l'utilisateur sait.
        if (_etat.modificationsDepuis === null && marqueurModifsAvant) {
            _etat.modificationsDepuis = marqueurModifsAvant;
            _sauvegarderEtat();
            _mettreAJourIndicateur();
        }
        // Handle devenu invalide — arrêter l'auto-save
        if (e.name === 'NotAllowedError' || e.name === 'NotFoundError' || e.name === 'InvalidStateError') {
            _fileHandle = null;
            _arreterAutoSave();
        }
    } finally {
        _autoSaveEnCours = false;
    }
}

/**
 * Formate une heure locale courte (ex: "11h45")
 */
function _formaterHeureLocale(dateISO) {
    if (!dateISO) return '';
    try {
        var d = new Date(dateISO);
        return d.getHours() + 'h' + String(d.getMinutes()).padStart(2, '0');
    } catch (e) {
        return '';
    }
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
            var texteEtat = modifie ? 'Modifications non enregistrées' : 'Tout est enregistré';
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

    // Sous-texte "Enregistrer" : montre si handle FSAPI connecté
    var enregInfo = document.getElementById('codex-menu-enreg-info');
    if (enregInfo) {
        if (_fileHandle) {
            enregInfo.textContent = 'Vers le même emplacement';
            enregInfo.classList.remove('u-hide');
        } else {
            enregInfo.classList.add('u-hide');
        }
    }

    // Indicateur auto-save dans le menu
    var autoSaveItem = document.getElementById('codex-menu-autosave');
    var autoSaveSep = document.getElementById('codex-menu-autosave-sep');
    if (autoSaveItem) {
        if (_autoSaveTimerId) {
            autoSaveItem.classList.remove('u-hide');
            if (autoSaveSep) autoSaveSep.classList.remove('u-hide');
            var detail = document.getElementById('codex-menu-autosave-detail');
            if (detail) {
                var intervMin = Math.round(AUTO_SAVE_DELAI / 60000);
                var texte = 'Toutes les ' + intervMin + ' min';
                if (_derniereAutoSave) {
                    texte += ' — dernier : ' + _formaterHeureLocale(_derniereAutoSave);
                }
                detail.textContent = texte;
            }
        } else {
            autoSaveItem.classList.add('u-hide');
            if (autoSaveSep) autoSaveSep.classList.add('u-hide');
        }
    }
}

/* ===============================
   ACTIONS DU MENU
   =============================== */

/**
 * Ouvrir un codex depuis un fichier.
 * Sur Chrome/Edge, utilise showOpenFilePicker pour obtenir un handle FSAPI
 * réutilisable lors de la prochaine sauvegarde.
 */
async function actionOuvrir() {
    _fermerMenu();

    var fichier = null;

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
            // Conserver le handle pour les sauvegardes suivantes
            _fileHandle = handle;
            _demarrerAutoSave();
        } catch (e) {
            if (e.name === 'AbortError') return; // Annulé par l'utilisateur
            console.warn('📂 showOpenFilePicker échoué, fallback input file', e.message);
        }
    }

    // Fallback : input file classique (iPad, Firefox, etc.)
    if (!fichier) {
        fichier = await ouvrirDialogueFichier();
        _fileHandle = null; // Pas de handle disponible
    }

    if (!fichier) return;

    try {
        var resultat = await chargerCodex(fichier);
        if (typeof window.afficherNotificationSucces === 'function') {
            window.afficherNotificationSucces(
                'Codex ouvert : ' + resultat.manifeste.nom,
                resultat.stats.nbCles + ' clés, ' + resultat.stats.nbBlobs + ' fichiers'
            );
        }
        // Proposer de recharger pour appliquer les données
        if (confirm('Codex chargé avec succès !\n\nRecharger la page pour appliquer les données ?')) {
            window.location.reload();
        }
    } catch (e) {
        console.error('📂 Erreur ouverture codex:', e);
        alert('Erreur : ' + e.message);
    }
}

/**
 * Enregistrer le codex (génère + sauvegarde).
 * Si un handle FSAPI est disponible, ré-écrit directement sans dialogue.
 */
async function actionEnregistrer() {
    _fermerMenu();

    try {
        var avaitHandle = !!_fileHandle;
        var resultat = await genererCodex();
        var sauvegarde = await sauvegarderVersDestination(resultat.blob, resultat.nomFichier);

        if (sauvegarde.methode === 'annule') return;

        if (typeof window.afficherNotificationSucces === 'function') {
            var methodeLabel = avaitHandle ? 'même emplacement' :
                               sauvegarde.methode === 'fsapi' ? 'emplacement choisi' :
                               sauvegarde.methode === 'share' ? 'Fichiers' : 'Téléchargements';
            window.afficherNotificationSucces(
                'Codex enregistré',
                _formaterTaille(resultat.blob.size) + ' — ' + methodeLabel
            );
        }
    } catch (e) {
        console.error('📂 Erreur enregistrement codex:', e);
        alert('Erreur : ' + e.message);
    }
}

/**
 * Enregistrer sous... (force le dialogue de destination, même si un handle existe).
 */
async function actionEnregistrerSous() {
    _fermerMenu();

    try {
        var resultat = await genererCodex();
        var sauvegarde = await sauvegarderVersDestination(resultat.blob, resultat.nomFichier, { forcerDialogue: true });

        if (sauvegarde.methode === 'annule') return;

        if (typeof window.afficherNotificationSucces === 'function') {
            var methodeLabel = sauvegarde.methode === 'fsapi' ? 'nouvel emplacement' :
                               sauvegarde.methode === 'share' ? 'Fichiers' : 'Téléchargements';
            window.afficherNotificationSucces(
                'Codex enregistré',
                _formaterTaille(resultat.blob.size) + ' — ' + methodeLabel
            );
        }
    } catch (e) {
        console.error('📂 Erreur enregistrement codex:', e);
        alert('Erreur : ' + e.message);
    }
}

/**
 * Créer un nouveau codex (marque l'état actif sans exporter)
 */
function actionNouveau() {
    _fermerMenu();

    var nom = prompt('Nom du codex :', _genererNomCodex());
    if (!nom) return;

    _etat.actif = true;
    _etat.nom = nom;
    _etat.derniereSauvegarde = null;
    _etat.modificationsDepuis = new Date().toISOString();
    _etat.manifeste = null;
    _sauvegarderEtat();
    _mettreAJourIndicateur();

    if (typeof window.afficherNotificationSucces === 'function') {
        window.afficherNotificationSucces('Nouveau codex : ' + nom);
    }
}

/**
 * Affiche les détails du codex actif
 */
function actionDetails() {
    _fermerMenu();

    if (!_etat.manifeste) {
        alert('Aucun codex actif.\n\nPour commencer :\n• « Ouvrir un codex » pour charger un fichier existant\n• « Nouveau codex » pour en créer un\n• « Enregistrer le codex » pour sauvegarder tes données actuelles');
        return;
    }

    var m = _etat.manifeste;
    var details = 'Codex : ' + m.nom + '\n' +
        'Auteur : ' + (m.auteur || 'non défini') + '\n' +
        'Trimestre : ' + (m.trimestre || 'non défini') + '\n' +
        'Appareil : ' + (m.appareil || 'inconnu') + '\n' +
        'Version app : ' + (m.appVersion || '?') + '\n' +
        '\nCréé : ' + _formaterDateLocale(m.dateCreation) + '\n' +
        'Dernière sauvegarde : ' + _formaterDateLocale(m.dateDerniereModification) + '\n' +
        '\nContenu :\n' +
        '  ' + (m.contenu.cles ? m.contenu.cles.length : '?') + ' clés de données\n' +
        '  ' + (m.contenu.nombreFichiersTravaux || 0) + ' fichiers travaux\n' +
        '  ' + _formaterTaille(m.contenu.tailleTotaleOctets || 0);

    alert(details);
}

/**
 * Renomme le codex actif via prompt().
 */
async function actionRenommer() {
    if (!_etat.actif) return;

    var nouveauNom = prompt('Nouveau nom du codex :', _etat.nom || '');
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
    await db.set(CLE_ETAT_CODEX, {
        actif: _etat.actif,
        nom: _etat.nom,
        derniereSauvegarde: _etat.derniereSauvegarde,
        modificationsDepuis: _etat.modificationsDepuis,
        manifeste: _etat.manifeste
    });
}

/**
 * Fusionner un codex externe avec le codex local.
 * Flux complet : file picker → lecture externe → analyse → résolution → application → notification.
 */
async function actionFusionner() {
    _fermerMenu();

    if (!_etat.actif) {
        alert('Aucun codex actif.\n\nOuvre d\'abord un codex (ou enregistre tes données), puis utilise « Fusionner » pour combiner avec un autre codex.');
        return;
    }

    // 1. Choisir le fichier externe
    var fichier = await ouvrirDialogueFichier();
    if (!fichier) return;

    _afficherProgression('Fusion de codex');
    _majProgression(0, 'Lecture du codex externe...');
    await _yield();

    try {

    // 2. Lire le codex externe en mémoire (sans toucher à IDB)
    var externe = await lireCodexExterne(fichier);

    // 3. Collecter les données locales depuis IndexedDB
    _majProgression(15, 'Lecture des données locales...');
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
                'Lecture des données locales...', (i + 1) + '/' + clesFiltrees.length);
            await _yield();
        }
    }

    // 4. Chercher un ancêtre commun (dernier snapshot partagé)
    _majProgression(30, 'Recherche d\'un ancêtre commun...');
    await _yield();
    var ancetre = await db.get(CLE_SNAPSHOT_AVANT, null);

    // 5. Analyser les différences (données)
    _majProgression(35, 'Analyse des différences...');
    await _yield();

    var analyse = _analyserFusion(donneesLocales, externe.donnees, ancetre);

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
    var plan = _resoudreConflits(analyse, donneesLocales, externe.donnees, analyseTravaux);

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
                'Écriture des données...', (j + 1) + '/' + clesResolution.length);
            await _yield();
        }
    }

    // 9. Synchroniser le cache localStorage
    _majProgression(60, 'Synchronisation du cache...');
    await db.syncToLocalStorageCache();

    // 10. Importer les blobs travaux externes
    var statsTravaux = { importes: 0, ignores: 0, erreurs: [] };
    if (plan.importerTravaux.length > 0) {
        statsTravaux = await _fusionnerTravaux(
            externe._zip, externe.donnees, plan.importerTravaux,
            function(pct, msg) {
                _majProgression(60 + Math.round(pct * 0.35), 'Import des fichiers travaux...', msg);
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

    resume += '\nPense à enregistrer le codex pour sauvegarder la fusion.';

    alert(resume);


    } catch (erreur) {
        _masquerProgression();
        alert('Erreur lors de la fusion :\n\n' + erreur.message);
        console.error('📂 Fusion : erreur', erreur);
    }
}

/**
 * Exporter une sélection de données (par trimestre) dans un codex partiel.
 * Génère un ZIP contenant uniquement les trimestres choisis + clés globales + blobs associés.
 */
async function actionExporterSelection() {
    _fermerMenu();

    _afficherProgression('Export sélectif');
    _majProgression(0, 'Lecture des données...');
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
                'Lecture des données...', (i + 1) + '/' + clesFiltrees.length);
            await _yield();
        }
    }

    _masquerProgression();

    // 2. Détecter les trimestres disponibles
    var trimestres = _detecterTrimestresDisponibles(donnees);

    if (trimestres.length === 0) {
        alert('Aucun trimestre détecté dans les données.\n\nIl n\'y a rien à exporter.');
        return;
    }

    if (trimestres.length === 1) {
        alert('Un seul trimestre détecté (' + trimestres[0] + ').\n\nUtilise « Enregistrer le codex » pour un export complet.');
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

    var choix = prompt(listeChoix);
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
        alert('Aucun trimestre sélectionné. Export annulé.');
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

    if (!confirm(resume)) return;

    // 7. Construire le ZIP partiel
    _afficherProgression('Export sélectif');
    _majProgression(25, 'Préparation du ZIP...');
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
    var dossier = zip.folder(DOSSIER_TRAVAUX);

    // Collecter les IDs de fichiers référencés dans les données filtrées
    var cleFT = Object.keys(donneesFiltrees).filter(function(c) {
        return c.includes('fichiersTravaux');
    });

    if (cleFT.length > 0 && typeof travauxStockage !== 'undefined') {
        var tousLesFichiers = [];
        for (var ft = 0; ft < cleFT.length; ft++) {
            var liste = donneesFiltrees[cleFT[ft]];
            if (Array.isArray(liste)) {
                tousLesFichiers = tousLesFichiers.concat(liste);
            }
        }

        for (var j = 0; j < tousLesFichiers.length; j++) {
            var f = tousLesFichiers[j];
            try {
                var blob = await travauxStockage.recupererBlob(f.id);
                if (blob) {
                    var ext = (f.nomFichier || 'bin').split('.').pop();
                    dossier.file(f.id + '.' + ext, blob);
                    nbBlobs++;
                    tailleTotale += blob.size || 0;
                }
            } catch (e) {
                console.warn('📂 Export sélectif : blob ignoré pour ' + f.id, e.message);
            }
            if (j % 5 === 0) {
                _majProgression(25 + Math.round((j / tousLesFichiers.length) * 35),
                    'Ajout des fichiers travaux...', nbBlobs + '/' + tousLesFichiers.length);
                await _yield();
            }
        }
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
        trimestre: trimestresChoisis.join(', '),
        exportSelectif: true,
        trimestresInclus: trimestresChoisis,
        contenu: {
            cles: Object.keys(donneesFiltrees),
            nombreFichiersTravaux: nbBlobs,
            tailleTotaleOctets: new Blob([json]).size + tailleTotale
        },
        historique: []
    };

    zip.file(NOM_MANIFESTE, JSON.stringify(manifeste, null, 2));

    // 8. Générer le blob
    _majProgression(65, 'Compression du ZIP...');
    var zipBlob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        function(meta) {
            _majProgression(65 + Math.round(meta.percent * 0.30),
                'Compression du ZIP...', Math.round(meta.percent) + '%');
        }
    );

    _majProgression(98, 'Enregistrement...');
    await _yield();

    // 9. Sauvegarder
    var nomFichier = _genererNomFichier(manifeste.nom);
    var resultatSave = await sauvegarderVersDestination(zipBlob, nomFichier);

    _majProgression(100, 'Export terminé !');
    await new Promise(function(r) { setTimeout(r, 500); });
    _masquerProgression();

    if (resultatSave.methode !== 'annule') {

        if (typeof window.afficherNotificationSucces === 'function') {
            window.afficherNotificationSucces(
                'Export sélectif enregistré',
                nomsTrimestres + ' — ' + _formaterTaille(zipBlob.size)
            );
        }
    }

    } catch (erreur) {
        _masquerProgression();
        alert('Erreur lors de l\'export sélectif :\n\n' + erreur.message);
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
    if (saison === 'h') return 'Hiver ' + annee;
    if (saison === 'a') return 'Automne ' + annee;
    return prefixe;
}

/**
 * Fermer le codex actif
 */
function actionFermer() {
    _fermerMenu();

    if (_etat.modificationsDepuis) {
        if (!confirm('Des modifications ne sont pas enregistrées.\n\nFermer quand même ?')) {
            return;
        }
    }

    fermerCodex();

    if (typeof window.afficherNotificationSucces === 'function') {
        window.afficherNotificationSucces('Codex fermé');
    }
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
    lireExterne: lireCodexExterne,

    // Sauvegarde multi-plateforme
    sauvegarder: sauvegarderVersDestination,
    ouvrirDialogue: ouvrirDialogueFichier,

    // Menu en-tête
    toggleMenu: toggleMenu,
    actionOuvrir: actionOuvrir,
    actionEnregistrer: actionEnregistrer,
    actionEnregistrerSous: actionEnregistrerSous,
    actionNouveau: actionNouveau,
    actionDetails: actionDetails,
    actionRenommer: actionRenommer,
    actionFusionner: actionFusionner,
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
