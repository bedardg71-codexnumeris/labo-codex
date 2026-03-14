/* ===============================
   📂 MODULE: CLASSEUR
   Flux de travail portable USB multi-appareil

   Le Classeur est un espace de travail exportable en ZIP
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
const EXTENSION_CLASSEUR = '.classeur.zip';
const NOM_MANIFESTE = 'classeur-manifeste.json';
const NOM_DONNEES = 'donnees.json';
const DOSSIER_TRAVAUX = 'travaux';
const DOSSIER_HISTORIQUE = 'historique';

// Rotation TimeMachine
const MAX_SNAPSHOTS = 10;
const MAX_JOURS_HISTORIQUE = 30;

// Clés de stockage (non namespacées — globales)
const CLE_ETAT_CLASSEUR = '_classeur_etat';
const CLE_HIST_INDEX = '_classeur_hist_index';
const CLE_SNAPSHOT_AVANT = '_classeur_snapshot_avant';
const PREFIXE_HIST = '_classeur_hist_';

/* ===============================
   ÉTAT INTERNE
   =============================== */

let _etat = {
    actif: false,                  // Un classeur est-il chargé ?
    nom: '',                       // Nom du classeur
    derniereSauvegarde: null,      // Date ISO de la dernière sauvegarde
    modificationsDepuis: null,     // Date ISO de la première modif non sauvegardée
    manifeste: null                // Manifeste complet du classeur chargé
};

/* ===============================
   INITIALISATION
   =============================== */

/**
 * Restaure l'état du classeur depuis le stockage (au démarrage de l'app)
 */
function initialiserClasseur() {
    const etatSauve = db.getSync(CLE_ETAT_CLASSEUR, null);
    if (etatSauve && etatSauve.actif) {
        _etat = Object.assign({}, _etat, etatSauve);
        console.log(`📂 Classeur restauré : "${_etat.nom}"`);
    } else {
        console.log('📂 Classeur : aucun classeur actif');
    }
    _mettreAJourIndicateur();
}

/**
 * Persiste l'état courant du classeur
 */
function _sauvegarderEtat() {
    db.setSync(CLE_ETAT_CLASSEUR, {
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
 * Génère un Classeur ZIP depuis les données IndexedDB actuelles.
 * @param {Object} [options]
 * @param {string} [options.nom] - Nom du classeur
 * @returns {Promise<{blob: Blob, nomFichier: string, manifeste: Object}>}
 */
async function genererClasseur(options = {}) {
    if (typeof JSZip === 'undefined') {
        throw new Error('JSZip non disponible. Impossible de générer le classeur.');
    }

    const debut = performance.now();
    console.log('📂 Génération du classeur...');
    _afficherProgression('Génération du classeur');
    _majProgression(0, 'Lecture des données...');
    await _yield(); // laisser le navigateur peindre l'overlay

    try {

    // 1. Collecter toutes les clés depuis IndexedDB
    const toutesLesCles = await db.keys();
    const clesFiltrees = toutesLesCles.filter(function(c) { return !c.startsWith('_classeur_'); });
    const donnees = {};
    for (var i = 0; i < clesFiltrees.length; i++) {
        var valeur = await db.get(clesFiltrees[i], null);
        if (valeur !== null) {
            donnees[clesFiltrees[i]] = valeur;
        }
        if (i % 10 === 0) {
            _majProgression(
                Math.round((i / clesFiltrees.length) * 20),
                'Lecture des données...',
                (i + 1) + '/' + clesFiltrees.length + ' clés'
            );
            await _yield();
        }
    }

    // 2. Construire le ZIP
    _majProgression(20, 'Préparation du ZIP...');
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
                console.warn('📂 Classeur : blob ignoré pour ' + f.id, e.message);
            }
            if (j % 5 === 0) {
                _majProgression(
                    20 + Math.round((j / fichiers.length) * 50),
                    'Ajout des fichiers travaux...',
                    nbBlobs + '/' + fichiers.length + ' fichiers (' + _formaterTaille(tailleTotale) + ')'
                );
                await _yield();
            }
        }
    }

    // 3. TimeMachine — archiver le snapshot précédent + inclure l'historique
    _majProgression(62, 'Archivage de l\'historique...');
    await _yield();

    var dossierHistorique = zip.folder(DOSSIER_HISTORIQUE);
    var historiqueIndex = await db.get(CLE_HIST_INDEX, []);
    var snapshotPrecedent = await db.get(CLE_SNAPSHOT_AVANT, null);
    var dejaAjoutes = new Set();

    // 3a. Archiver le snapshot précédent comme nouvelle entrée historique
    if (snapshotPrecedent) {
        var dateSnapshot = _etat.derniereSauvegarde
            || (_etat.manifeste ? _etat.manifeste.dateDerniereModification : null)
            || new Date().toISOString();

        // Éviter les doublons (même date = même sauvegarde)
        var dejaPresent = historiqueIndex.some(function(e) { return e.date === dateSnapshot; });
        if (!dejaPresent) {
            var jsonSnapshot = JSON.stringify(snapshotPrecedent);
            var nomSnapshot = dateSnapshot.replace(/[:.]/g, '-') + '.json';
            dossierHistorique.file(nomSnapshot, jsonSnapshot);
            dejaAjoutes.add(nomSnapshot);

            // Stocker aussi dans IDB pour la prochaine session
            var cleSnapshot = PREFIXE_HIST + dateSnapshot.replace(/[:.]/g, '-');
            await db.set(cleSnapshot, snapshotPrecedent);

            historiqueIndex.push({
                date: dateSnapshot,
                appareil: (_etat.manifeste ? _etat.manifeste.appareil : null) || _identifierAppareil(),
                taille: jsonSnapshot.length
            });

            console.log('📂 TimeMachine : snapshot archivé (' + dateSnapshot + ')');
        }
    }

    // 3b. Rotation (purger les snapshots trop anciens ou en surplus)
    historiqueIndex = _purgerHistorique(historiqueIndex);

    // 3c. Inclure les snapshots existants dans le ZIP
    await _ecrireHistoriqueDansZip(dossierHistorique, historiqueIndex, dejaAjoutes);

    // 3d. Mettre à jour IDB : le snapshot "avant" est désormais les données courantes
    await db.set(CLE_SNAPSHOT_AVANT, donnees);
    await db.set(CLE_HIST_INDEX, historiqueIndex);

    // 4. Manifeste
    const maintenant = new Date().toISOString();
    const infoCours = db.getSync('infoCours', {});
    const auteur = (typeof infoCours?.enseignant === 'string') ? infoCours.enseignant : '';
    const trimestreActif = (typeof window.trimestreActif === 'string') ? window.trimestreActif : '';

    var historiqueManifeste = [];
    for (var hm = 0; hm < historiqueIndex.length; hm++) {
        historiqueManifeste.push({
            date: historiqueIndex[hm].date,
            appareil: historiqueIndex[hm].appareil,
            taille: historiqueIndex[hm].taille
        });
    }

    const manifeste = {
        formatVersion: FORMAT_VERSION,
        appVersion: _obtenirVersionApp(),
        nom: options.nom || _etat.nom || _genererNomClasseur(),
        auteur: auteur,
        dateCreation: _etat.manifeste?.dateCreation || maintenant,
        dateDerniereModification: maintenant,
        appareil: _identifierAppareil(),
        trimestre: trimestreActif,
        contenu: {
            cles: toutesLesCles.filter(c => !c.startsWith('_classeur_')),
            nombreFichiersTravaux: nbBlobs,
            tailleTotaleOctets: new Blob([json]).size + tailleTotale
        },
        historique: historiqueManifeste
    };

    zip.file(NOM_MANIFESTE, JSON.stringify(manifeste, null, 2));

    // 5. Générer le blob ZIP
    _majProgression(70, 'Compression du ZIP...', nbBlobs + ' fichier(s), ' + _formaterTaille(tailleTotale));
    const zipBlob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        function(meta) {
            _majProgression(
                70 + Math.round(meta.percent * 0.28),
                'Compression du ZIP...',
                Math.round(meta.percent) + '% compressé'
            );
        }
    );

    // 6. Mettre à jour l'état
    _majProgression(98, 'Finalisation...');
    _etat.actif = true;
    _etat.nom = manifeste.nom;
    _etat.derniereSauvegarde = maintenant;
    _etat.modificationsDepuis = null;
    _etat.manifeste = manifeste;
    _sauvegarderEtat();
    _mettreAJourIndicateur();

    const duree = Math.round(performance.now() - debut);
    var nbSnapshotsExport = historiqueManifeste.length;
    console.log('📂 Classeur généré en ' + duree + 'ms : ' + nbBlobs + ' fichier(s), ' + nbSnapshotsExport + ' snapshot(s), ' + _formaterTaille(zipBlob.size));

    _majProgression(100, 'Classeur prêt !', _formaterTaille(zipBlob.size));

    // Pause brève pour que l'utilisateur voie "100%"
    await new Promise(function(r) { setTimeout(r, 500); });
    _masquerProgression();

    // Nom de fichier avec horodatage
    const nomFichier = _genererNomFichier(manifeste.nom);

    return { blob: zipBlob, nomFichier, manifeste };

    } catch (erreur) {
        _masquerProgression();
        throw erreur;
    }
}

/* ===============================
   CHARGEMENT D'UN CLASSEUR (IMPORT)
   =============================== */

/**
 * Charge un Classeur ZIP dans IndexedDB.
 * @param {File|Blob} fichierZip - Le fichier ZIP à charger
 * @returns {Promise<{manifeste: Object, stats: Object}>}
 */
async function chargerClasseur(fichierZip) {
    if (typeof JSZip === 'undefined') {
        throw new Error('JSZip non disponible. Impossible de charger le classeur.');
    }

    const debut = performance.now();
    console.log('📂 Chargement du classeur (' + _formaterTaille(fichierZip.size) + ')...');
    _afficherProgression('Ouverture du classeur');
    _majProgression(0, 'Validation du fichier...', _formaterTaille(fichierZip.size));
    await _yield(); // laisser le navigateur peindre l'overlay

    try {

    // 1. Valider le ZIP
    const validation = await validerClasseur(fichierZip);
    if (!validation.valide) {
        _masquerProgression();
        throw new Error('Classeur invalide : ' + validation.erreurs.join(', '));
    }

    const zip = validation._zip;
    const manifeste = validation._manifeste;

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
                    await travauxStockage.stockerBlob(f.id, blobData, f.etudiantDA, f.productionId);
                    nbBlobs++;
                }
            } catch (e) {
                console.warn('📂 Classeur : blob ignoré pour ' + f.id, e.message);
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

    // 5. TimeMachine — capturer le snapshot et charger l'historique
    _majProgression(92, 'Chargement de l\'historique...');
    await _yield();

    // 5a. Stocker les données chargées comme snapshot de référence
    // (servira de base pour le prochain archivage à la sauvegarde)
    await db.set(CLE_SNAPSHOT_AVANT, donnees);

    // 5b. Charger l'historique existant du ZIP vers IndexedDB
    var nbSnapshots = 0;
    var historiqueCharge = await _chargerHistoriqueDepuisZip(zip, manifeste);
    nbSnapshots = historiqueCharge.length;

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
    const stats = { nbCles: nbCles, nbBlobs: nbBlobs, nbSnapshots: nbSnapshots, dureeMs: duree };
    console.log('📂 Classeur chargé en ' + duree + 'ms : ' + nbCles + ' clé(s), ' + nbBlobs + ' blob(s), ' + nbSnapshots + ' snapshot(s)');

    _majProgression(100, 'Classeur chargé !', nbCles + ' clés, ' + nbBlobs + ' fichiers');
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
 * Vérifie si un fichier est un Classeur valide.
 * @param {File|Blob} fichierZip
 * @returns {Promise<{valide: boolean, erreurs: string[], _zip?: JSZip, _manifeste?: Object}>}
 */
async function validerClasseur(fichierZip) {
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

    // 3. Vérifier la présence du manifeste
    const entreeManifeste = zip.file(NOM_MANIFESTE);
    if (!entreeManifeste) {
        erreurs.push('Manifeste manquant (' + NOM_MANIFESTE + ')');
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

    // 6. Vérifier que les données JSON sont lisibles
    try {
        const jsonStr = await entreeDonnees.async('string');
        JSON.parse(jsonStr);
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
 * Lit le manifeste d'un Classeur sans charger les données.
 * @param {File|Blob} fichierZip
 * @returns {Promise<Object>} Le manifeste
 */
async function lireManifeste(fichierZip) {
    const buffer = await _lireCommeArrayBuffer(fichierZip);
    const zip = await JSZip.loadAsync(buffer);
    const entree = zip.file(NOM_MANIFESTE);
    if (!entree) {
        throw new Error('Ce fichier ne contient pas de manifeste de classeur.');
    }
    const str = await entree.async('string');
    return JSON.parse(str);
}

/* ===============================
   ÉTAT DU CLASSEUR
   =============================== */

/**
 * Retourne l'état courant du classeur.
 * @returns {Object}
 */
function etatClasseur() {
    return {
        actif: _etat.actif,
        nom: _etat.nom,
        derniereSauvegarde: _etat.derniereSauvegarde,
        modificationsNonSauvees: _etat.modificationsDepuis !== null,
        modificationsDepuis: _etat.modificationsDepuis,
        manifeste: _etat.manifeste ? Object.assign({}, _etat.manifeste) : null
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
 * Désactive le classeur actif (retour au mode local seul).
 */
function fermerClasseur() {
    _etat.actif = false;
    _etat.nom = '';
    _etat.derniereSauvegarde = null;
    _etat.modificationsDepuis = null;
    _etat.manifeste = null;
    _sauvegarderEtat();
    _mettreAJourIndicateur();
    // Nettoyer l'historique TimeMachine de IndexedDB
    _nettoyerHistoriqueIDB();
    console.log('📂 Classeur fermé');
}

/* ===============================
   SAUVEGARDE MULTI-PLATEFORME
   =============================== */

/**
 * Sauvegarde le classeur vers un emplacement choisi par l'utilisateur.
 * Détecte la meilleure stratégie selon le navigateur :
 * 1. showSaveFilePicker (Chrome/Edge — choix de destination natif)
 * 2. navigator.share (iPad Safari — "Enregistrer dans Fichiers")
 * 3. <a download> (fallback — dossier Téléchargements)
 *
 * @param {Blob} blob - Le blob ZIP du classeur
 * @param {string} nomFichier - Le nom de fichier suggéré
 * @returns {Promise<{methode: string}>}
 */
async function sauvegarderVersDestination(blob, nomFichier) {
    // Stratégie 1 : File System Access API (Chrome/Edge sur Mac/PC)
    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: nomFichier,
                types: [{
                    description: 'Classeur Labo Codex',
                    accept: { 'application/zip': ['.zip'] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return { methode: 'fsapi' };
        } catch (e) {
            // L'utilisateur a annulé le dialogue
            if (e.name === 'AbortError') {
                return { methode: 'annule' };
            }
            console.warn('📂 FSAPI échoué, fallback...', e.message);
        }
    }

    // Stratégie 2 : Web Share API (iPad Safari)
    if (_peutPartagerFichier(blob, nomFichier)) {
        try {
            const fichier = new File([blob], nomFichier, { type: 'application/zip' });
            await navigator.share({
                files: [fichier],
                title: 'Classeur Labo Codex'
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { methode: 'download' };
}

/**
 * Ouvre un dialogue de sélection de fichier pour choisir un classeur.
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
   OVERLAY DE PROGRESSION
   =============================== */

let _overlayEl = null;

/**
 * Affiche un overlay de progression plein écran.
 * @param {string} titre - Ex: "Génération du classeur"
 */
function _afficherProgression(titre) {
    _masquerProgression(); // nettoyage si déjà visible

    const overlay = document.createElement('div');
    overlay.id = 'classeur-progression-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:100000;backdrop-filter:blur(4px);';

    const boite = document.createElement('div');
    boite.style.cssText = 'background:var(--surface-carte,#1a3040);border-radius:var(--radius-moyen,12px);padding:32px 40px;min-width:340px;max-width:480px;text-align:center;color:white;box-shadow:0 8px 32px rgba(0,0,0,0.4);';

    boite.innerHTML =
        '<div style="font-size:1.2rem;font-weight:600;margin-bottom:8px;" id="classeur-prog-titre">' + titre + '</div>' +
        '<div style="font-size:0.85rem;color:rgba(255,255,255,0.6);margin-bottom:20px;" id="classeur-prog-detail">Préparation...</div>' +
        '<div style="background:rgba(255,255,255,0.1);border-radius:6px;height:8px;overflow:hidden;margin-bottom:12px;">' +
            '<div id="classeur-prog-barre" style="height:100%;width:0%;background:var(--accent-principal,#6aacb8);border-radius:6px;transition:width 0.3s ease;"></div>' +
        '</div>' +
        '<div style="font-size:0.8rem;color:rgba(255,255,255,0.4);" id="classeur-prog-stats"></div>';

    overlay.appendChild(boite);
    document.body.appendChild(overlay);
    _overlayEl = overlay;
}

/**
 * Met à jour la progression.
 * @param {number} pourcentage - 0 à 100
 * @param {string} detail - Message de détail
 * @param {string} [stats] - Stats supplémentaires (ex: "42/117 fichiers")
 */
function _majProgression(pourcentage, detail, stats) {
    var barre = document.getElementById('classeur-prog-barre');
    var detailEl = document.getElementById('classeur-prog-detail');
    var statsEl = document.getElementById('classeur-prog-stats');
    if (barre) barre.style.width = Math.min(100, Math.max(0, pourcentage)) + '%';
    if (detailEl) detailEl.textContent = detail;
    if (statsEl && stats) statsEl.textContent = stats;
}

/**
 * Masque l'overlay de progression.
 */
function _masquerProgression() {
    if (_overlayEl) {
        _overlayEl.remove();
        _overlayEl = null;
    }
    // Nettoyage résiduel
    var ancien = document.getElementById('classeur-progression-overlay');
    if (ancien) ancien.remove();
}

/* ===============================
   HISTORIQUE / TIMEMACHINE
   =============================== */

/**
 * Applique la rotation sur l'index historique :
 * - Max 10 snapshots
 * - Max 30 jours
 * Supprime les clés IndexedDB des snapshots purgés.
 * @param {Array} index - Entrées {date, appareil, taille}
 * @returns {Array} Index purgé
 */
function _purgerHistorique(index) {
    var limiteDate = Date.now() - (MAX_JOURS_HISTORIQUE * 24 * 60 * 60 * 1000);

    // Trier par date décroissante (plus récent en premier)
    index.sort(function(a, b) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    var gardes = [];
    var supprimes = [];
    for (var i = 0; i < index.length; i++) {
        var dateEntry = new Date(index[i].date).getTime();
        if (gardes.length < MAX_SNAPSHOTS && dateEntry >= limiteDate) {
            gardes.push(index[i]);
        } else {
            supprimes.push(index[i]);
        }
    }

    // Nettoyer les clés supprimées de IndexedDB (fire-and-forget)
    for (var j = 0; j < supprimes.length; j++) {
        var cle = PREFIXE_HIST + supprimes[j].date.replace(/[:.]/g, '-');
        db.remove(cle);
    }

    if (supprimes.length > 0) {
        console.log('📂 TimeMachine : ' + supprimes.length + ' snapshot(s) purgé(s)');
    }

    return gardes;
}

/**
 * Charge les snapshots historiques depuis IndexedDB vers le ZIP.
 * @param {JSZip} dossierHist - Le dossier historique/ du ZIP
 * @param {Array} index - Index des entrées
 * @param {Set} [dejaAjoutes] - Noms de fichiers déjà dans le dossier
 * @returns {Promise<void>}
 */
async function _ecrireHistoriqueDansZip(dossierHist, index, dejaAjoutes) {
    for (var i = 0; i < index.length; i++) {
        var nomFichier = index[i].date.replace(/[:.]/g, '-') + '.json';
        if (dejaAjoutes && dejaAjoutes.has(nomFichier)) continue;

        var cle = PREFIXE_HIST + index[i].date.replace(/[:.]/g, '-');
        var donnees = await db.get(cle, null);
        if (donnees) {
            dossierHist.file(nomFichier, JSON.stringify(donnees));
        }
    }
}

/**
 * Charge l'historique depuis un ZIP vers IndexedDB.
 * @param {JSZip} zip - Le ZIP chargé
 * @param {Object} manifeste - Le manifeste du classeur
 * @returns {Promise<Array>} L'index historique chargé
 */
async function _chargerHistoriqueDepuisZip(zip, manifeste) {
    var index = [];
    if (!manifeste.historique || !Array.isArray(manifeste.historique)) {
        return index;
    }

    for (var i = 0; i < manifeste.historique.length; i++) {
        var entree = manifeste.historique[i];
        var nomFichier = entree.date.replace(/[:.]/g, '-') + '.json';
        var fichier = zip.file(DOSSIER_HISTORIQUE + '/' + nomFichier);

        if (fichier) {
            try {
                var contenu = await fichier.async('string');
                var donnees = JSON.parse(contenu);
                var cle = PREFIXE_HIST + entree.date.replace(/[:.]/g, '-');
                await db.set(cle, donnees);
                index.push({
                    date: entree.date,
                    appareil: entree.appareil || '',
                    taille: entree.taille || contenu.length
                });
            } catch (e) {
                console.warn('📂 TimeMachine : snapshot ignoré ' + nomFichier, e.message);
            }
        }
    }

    await db.set(CLE_HIST_INDEX, index);
    console.log('📂 TimeMachine : ' + index.length + ' snapshot(s) chargé(s) depuis le ZIP');
    return index;
}

/**
 * Nettoie toutes les données historiques de IndexedDB.
 */
async function _nettoyerHistoriqueIDB() {
    var index = await db.get(CLE_HIST_INDEX, []);
    for (var i = 0; i < index.length; i++) {
        var cle = PREFIXE_HIST + index[i].date.replace(/[:.]/g, '-');
        await db.remove(cle);
    }
    await db.remove(CLE_HIST_INDEX);
    await db.remove(CLE_SNAPSHOT_AVANT);
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
 * Génère un nom de classeur par défaut basé sur le contexte
 */
function _genererNomClasseur() {
    const infoCours = db.getSync('infoCours', {});
    const trimestre = (typeof window.trimestreActif === 'string') ? window.trimestreActif : '';
    const parties = [];
    if (infoCours.nomCours) parties.push(infoCours.nomCours);
    if (trimestre) parties.push(trimestre.toUpperCase());
    return parties.length > 0 ? parties.join(' — ') : 'Mon classeur';
}

/**
 * Génère un nom de fichier avec horodatage
 */
function _genererNomFichier(nomClasseur) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const heure = `${pad(now.getHours())}h${pad(now.getMinutes())}`;
    const nomNettoye = nomClasseur.replace(/[^a-zA-Z0-9àâéèêëïîôùûüçÀÂÉÈÊËÏÎÔÙÛÜÇ _-]/g, '').trim().replace(/\s+/g, '-');
    return `classeur-${nomNettoye}-${date}-${heure}${EXTENSION_CLASSEUR}`;
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
 * Formate une taille en octets de façon lisible
 */
function _formaterTaille(octets) {
    if (octets < 1024) return octets + ' o';
    if (octets < 1024 * 1024) return (octets / 1024).toFixed(1) + ' Ko';
    if (octets < 1024 * 1024 * 1024) return (octets / (1024 * 1024)).toFixed(1) + ' Mo';
    return (octets / (1024 * 1024 * 1024)).toFixed(2) + ' Go';
}

/**
 * Met à jour l'indicateur visuel dans l'en-tête.
 * Stub — sera implémenté à l'étape 1.3 (UI en-tête).
 */
function _mettreAJourIndicateur() {
    // TODO Étape 1.3 : mettre à jour la pastille dans l'en-tête
    const indicateur = document.getElementById('classeur-indicateur');
    if (!indicateur) return; // Le bouton n'existe pas encore

    if (!_etat.actif) {
        indicateur.classList.add('u-hide');
        return;
    }

    indicateur.classList.remove('u-hide');
    if (_etat.modificationsDepuis) {
        indicateur.classList.add('classeur-indicateur--modifie');
        indicateur.classList.remove('classeur-indicateur--sauve');
    } else {
        indicateur.classList.remove('classeur-indicateur--modifie');
        indicateur.classList.add('classeur-indicateur--sauve');
    }
}

/* ===============================
   MENU EN-TÊTE
   =============================== */

var _menuOuvert = false;

/**
 * Ouvre/ferme le menu déroulant du classeur
 */
function toggleMenu() {
    var menu = document.getElementById('classeur-menu');
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
    var menu = document.getElementById('classeur-menu');
    if (menu) menu.classList.add('u-hide');
    _menuOuvert = false;
    document.removeEventListener('click', _fermerMenuExterne);
}

function _fermerMenuExterne(e) {
    var controle = document.getElementById('classeur-controle');
    if (controle && !controle.contains(e.target)) {
        _fermerMenu();
    }
}

/**
 * Actualise la visibilité des items selon l'état du classeur
 */
function _actualiserMenu() {
    var details = document.getElementById('classeur-menu-details');
    var fermerItem = document.getElementById('classeur-menu-fermer');
    if (details) {
        if (_etat.actif) details.classList.remove('u-hide');
        else details.classList.add('u-hide');
    }
    if (fermerItem) {
        if (_etat.actif) fermerItem.classList.remove('u-hide');
        else fermerItem.classList.add('u-hide');
    }
}

/* ===============================
   ACTIONS DU MENU
   =============================== */

/**
 * Ouvrir un classeur depuis un fichier
 */
async function actionOuvrir() {
    _fermerMenu();

    // Créer un input file déclenché par le geste utilisateur (le clic sur le menu)
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', async function() {
        var fichier = input.files[0];
        document.body.removeChild(input);
        if (!fichier) return;

        try {
            var resultat = await chargerClasseur(fichier);
            if (typeof window.afficherNotificationSucces === 'function') {
                window.afficherNotificationSucces(
                    'Classeur ouvert : ' + resultat.manifeste.nom,
                    resultat.stats.nbCles + ' clés, ' + resultat.stats.nbBlobs + ' fichiers'
                );
            }
            // Proposer de recharger pour appliquer les données
            if (confirm('Classeur chargé avec succès !\n\nRecharger la page pour appliquer les données ?')) {
                window.location.reload();
            }
        } catch (e) {
            console.error('📂 Erreur ouverture classeur:', e);
            alert('Erreur : ' + e.message);
        }
    });

    input.click();
}

/**
 * Enregistrer le classeur (génère + sauvegarde)
 */
async function actionEnregistrer() {
    _fermerMenu();

    try {
        var resultat = await genererClasseur();
        var sauvegarde = await sauvegarderVersDestination(resultat.blob, resultat.nomFichier);

        if (sauvegarde.methode === 'annule') return;

        if (typeof window.afficherNotificationSucces === 'function') {
            var methodeLabel = sauvegarde.methode === 'fsapi' ? 'emplacement choisi' :
                               sauvegarde.methode === 'share' ? 'Fichiers' : 'Téléchargements';
            window.afficherNotificationSucces(
                'Classeur enregistré',
                _formaterTaille(resultat.blob.size) + ' — ' + methodeLabel
            );
        }
    } catch (e) {
        console.error('📂 Erreur enregistrement classeur:', e);
        alert('Erreur : ' + e.message);
    }
}

/**
 * Enregistrer sous... (force le dialogue de destination)
 */
async function actionEnregistrerSous() {
    // Identique à actionEnregistrer — le dialogue est toujours affiché
    await actionEnregistrer();
}

/**
 * Créer un nouveau classeur (marque l'état actif sans exporter)
 */
function actionNouveau() {
    _fermerMenu();

    var nom = prompt('Nom du classeur :', _genererNomClasseur());
    if (!nom) return;

    _etat.actif = true;
    _etat.nom = nom;
    _etat.derniereSauvegarde = null;
    _etat.modificationsDepuis = new Date().toISOString();
    _etat.manifeste = null;
    _sauvegarderEtat();
    _mettreAJourIndicateur();

    if (typeof window.afficherNotificationSucces === 'function') {
        window.afficherNotificationSucces('Nouveau classeur : ' + nom);
    }
    console.log('📂 Nouveau classeur créé : ' + nom);
}

/**
 * Affiche les détails du classeur actif
 */
function actionDetails() {
    _fermerMenu();

    if (!_etat.manifeste) {
        alert('Aucun détail disponible.\nEnregistre le classeur une première fois.');
        return;
    }

    var m = _etat.manifeste;
    var details = 'Classeur : ' + m.nom + '\n' +
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
 * Fermer le classeur actif
 */
function actionFermer() {
    _fermerMenu();

    if (_etat.modificationsDepuis) {
        if (!confirm('Des modifications ne sont pas enregistrées.\n\nFermer quand même ?')) {
            return;
        }
    }

    fermerClasseur();

    if (typeof window.afficherNotificationSucces === 'function') {
        window.afficherNotificationSucces('Classeur fermé');
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

window.Classeur = {
    // Initialisation
    initialiser: initialiserClasseur,

    // Opérations principales
    generer: genererClasseur,
    charger: chargerClasseur,
    fermer: fermerClasseur,

    // Validation
    valider: validerClasseur,
    lireManifeste: lireManifeste,

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
    actionFermer: actionFermer,

    // État
    etat: etatClasseur,
    marquerModification: marquerModification
};

/* ===============================
   AUTO-INITIALISATION
   =============================== */

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserClasseur);
} else {
    initialiserClasseur();
}

})();
