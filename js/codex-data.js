/* ===============================
   MODULE : CODEX DATA — Extraction et format
   Date : 6 mai 2026
   Backlog : #251
   Architecture : docs/architecture/ECOSYSTEME-DONNEES.md §3
   Skill : Skills pour Claude Code/SKILL_Securite_donnees.md §4 (intégrité format)

   Vocation
     Extrait une ou plusieurs archives de les Archives locales pour produire
     un fichier .codex-data.json (5-30 Mo, sans blobs). Format auto-descriptif,
     versionné, vérifiable (SHA-256), conçu pour la pérennité (50+ ans,
     lisible sans logiciel — JSON texte UTF-8).

   Sources de lecture
     - FSAPI (Chrome/Edge) : lit donnees.json directement dans le dossier lié.
     - ZIP (Safari, iPad, fallback) : input file multi-sélection, ouverture JSZip.

   Format produit (résumé)
     {
       format: 'codex-data',
       version: 1,
       metadata: { auteur, date_extraction, archives[], anonymise,
                   application_version, description },
       integrite: { contenu_sha256, algorithme, date_calcul, note },
       groupes: { <dossier>: { uuid, trimestre, cours, groupe, date_archive,
                               <clés_namespacées_du_donnees.json>... } },
       bibliotheques: { grilles, echelles, productions, cartouches }
     }

   Le hash d'intégrité est calculé sur la sérialisation JSON du document
   AVANT ajout du champ `integrite`. Pour vérifier : retirer le champ
   `integrite` du JSON, sérialiser dans le même format (2-space indent),
   recalculer SHA-256, comparer.

   Dépendances
     - JSZip (libs/jszip.min.js) — pour les ZIP
     - validerZipSecurite (window.validerZipSecurite, depuis import-export.js)
     - obtenirIdentiteCCUtilisateur (window.obtenirIdentiteCCUtilisateur, cc-license.js)
     - Reserve (window.Reserve : lireManifesteLocal, obtenirHandle, supporteFSAPI)
     - VERSION_MAJEURE (window.VERSION_MAJEURE, init-inline.js)
     - taille-fichier.js (window.TailleFichier.dire : #993)
*/

(function() {
'use strict';

/* ===============================
   CONSTANTES
   =============================== */

var FORMAT = 'codex-data';
var VERSION_SCHEMA = 1;
// Convention #262 — extension simple. L'ancien `.codex-data.json` reste
// lisible (input file accepte `.json` génériquement).
var EXTENSION = '.json';

// Limite de sécurité : un codex data ne devrait jamais dépasser 100 Mo.
// Au-delà, c'est probablement une corruption ou une tentative d'abus.
var TAILLE_MAX_OCTETS = 100 * 1024 * 1024;

/* ===============================
   UTILITAIRES
   =============================== */

function _yield() {
    return new Promise(function(r) { setTimeout(r, 0); });
}

function _versionApp() {
    if (typeof window.VERSION_MAJEURE === 'string') return window.VERSION_MAJEURE;
    return 'inconnue';
}

function _obtenirAuteur() {
    if (typeof window.obtenirIdentiteCCUtilisateur === 'function') {
        try { return window.obtenirIdentiteCCUtilisateur(); }
        catch (e) { /* fallback */ }
    }
    return 'Utilisateur de Labo Codex';
}

/**
 * Calcule un SHA-256 hexadécimal d'une chaîne UTF-8.
 * @param {string} texte
 * @returns {Promise<string>} hash hexadécimal (64 caractères)
 */
async function _calculerSHA256(texte) {
    var enc = new TextEncoder();
    var data = enc.encode(texte);
    var hash = await crypto.subtle.digest('SHA-256', data);
    var bytes = new Uint8Array(hash);
    var hex = '';
    for (var i = 0; i < bytes.length; i++) {
        var h = bytes[i].toString(16);
        if (h.length === 1) h = '0' + h;
        hex += h;
    }
    return hex;
}

/* ===============================
   LECTURE D'UNE ARCHIVE — FSAPI
   =============================== */

/**
 * Lit meta.json + donnees.json d'une archive depuis le dossier FSAPI lié.
 * @param {FileSystemDirectoryHandle} handleRacine - Dossier racine Archives_LaboCodex
 * @param {string} dossier - Nom du dossier d'archive (ex: 'h2026-601-101-gr00002')
 * @returns {Promise<{ meta: Object, donnees: Object, dossier: string }>}
 */
async function _lireArchiveFSAPI(handleRacine, dossier) {
    if (!handleRacine) throw new Error('Handle dossier Archives manquant');
    if (!dossier) throw new Error('Nom de dossier manquant');

    var dossierTrimestres;
    try {
        dossierTrimestres = await handleRacine.getDirectoryHandle('trimestres');
    } catch (e) {
        throw new Error('Sous-dossier "trimestres" introuvable dans le dossier Archives');
    }

    var dossierArchive;
    try {
        dossierArchive = await dossierTrimestres.getDirectoryHandle(dossier);
    } catch (e) {
        throw new Error('Archive introuvable : ' + dossier);
    }

    var meta = await _lireFichierJSON(dossierArchive, 'meta.json');
    var donnees = await _lireFichierJSON(dossierArchive, 'donnees.json');

    return { meta: meta, donnees: donnees, dossier: dossier };
}

async function _lireFichierJSON(dossierHandle, nomFichier) {
    var fh = await dossierHandle.getFileHandle(nomFichier);
    var fichier = await fh.getFile();
    var texte = await fichier.text();
    try {
        return JSON.parse(texte);
    } catch (e) {
        throw new Error('Fichier ' + nomFichier + ' corrompu : ' + (e.message || e));
    }
}

/* ===============================
   LECTURE D'UNE ARCHIVE — ZIP
   =============================== */

/**
 * Lit meta.json + donnees.json d'un fichier ZIP archive.
 * @param {File} file - Fichier .reserve.zip sélectionné
 * @returns {Promise<{ meta: Object, donnees: Object, dossier: string }>}
 */
async function _lireArchiveZIP(file) {
    if (!file) throw new Error('Aucun fichier ZIP fourni');
    if (typeof JSZip === 'undefined') {
        throw new Error('Bibliothèque de compression non chargée (JSZip)');
    }

    var zip;
    try {
        zip = await JSZip.loadAsync(file);
    } catch (e) {
        throw new Error('ZIP illisible : ' + (e.message || e));
    }

    if (typeof window.validerZipSecurite === 'function') {
        var verif = window.validerZipSecurite(zip);
        if (!verif.valide) throw new Error(verif.erreur);
    }

    // Localiser le dossier d'archive et ses fichiers
    var dossier = null;
    var entryMeta = null;
    var entryDonnees = null;

    var noms = Object.keys(zip.files);
    for (var i = 0; i < noms.length; i++) {
        var chemin = noms[i];
        var m = chemin.match(/^trimestres\/([^\/]+)\/(meta|donnees)\.json$/);
        if (!m) continue;
        if (!dossier) dossier = m[1];
        else if (dossier !== m[1]) {
            throw new Error('ZIP contient plusieurs archives : ' + dossier + ' et ' + m[1]);
        }
        if (m[2] === 'meta') entryMeta = zip.files[chemin];
        else if (m[2] === 'donnees') entryDonnees = zip.files[chemin];
    }

    if (!dossier) throw new Error('Aucune archive trouvée dans le ZIP (trimestres/<dossier>/...)');
    if (!entryMeta) throw new Error('meta.json manquant dans l\'archive ' + dossier);
    if (!entryDonnees) throw new Error('donnees.json manquant dans l\'archive ' + dossier);

    var texteMeta = await entryMeta.async('text');
    var texteDonnees = await entryDonnees.async('text');

    var meta, donnees;
    try { meta = JSON.parse(texteMeta); }
    catch (e) { throw new Error('meta.json corrompu : ' + (e.message || e)); }
    try { donnees = JSON.parse(texteDonnees); }
    catch (e) { throw new Error('donnees.json corrompu : ' + (e.message || e)); }

    return { meta: meta, donnees: donnees, dossier: dossier };
}

/* ===============================
   EXTRACTION DES BIBLIOTHÈQUES
   =============================== */

/**
 * Extrait les bibliothèques globales (grilles, échelles, productions,
 * cartouches) en prenant la version la plus récente parmi les archives.
 *
 * Justification : les bibliothèques peuvent évoluer entre deux archives
 * (ex. ajout d'une grille). Pour l'analyse longitudinale, on prend la
 * version la plus récente — c'est elle qui a la couverture la plus large
 * et qui est cohérente avec le dernier état du Codex.
 *
 * @param {Array<{donnees: Object, date_archive: string}>} lectures
 * @returns {{grilles, echelles, productions, cartouches}}
 */
function _extraireBibliotheques(lectures) {
    var biblio = { grilles: [], echelles: [], productions: [], pratiques: [], cartouches: {} };
    if (lectures.length === 0) return biblio;

    var plusRecent = lectures.reduce(function(acc, l) {
        if (!acc) return l;
        var dAcc = acc.date_archive || '';
        var dL = l.date_archive || '';
        return (dL > dAcc) ? l : acc;
    }, null);

    var d = plusRecent.donnees || {};
    if (Array.isArray(d.grillesTemplates)) biblio.grilles = d.grillesTemplates;
    if (Array.isArray(d.echellesTemplates)) biblio.echelles = d.echellesTemplates;
    if (Array.isArray(d.productionsTemplates)) biblio.productions = d.productionsTemplates;
    if (Array.isArray(d.pratiquesConfigurables)) biblio.pratiques = d.pratiquesConfigurables;

    Object.keys(d).forEach(function(k) {
        if (k.indexOf('cartouches_') === 0) {
            var grilleId = k.substring('cartouches_'.length);
            biblio.cartouches[grilleId] = d[k];
        }
    });

    return biblio;
}

/**
 * Retire les clés de bibliothèques du donnees.json d'une archive
 * pour éviter la duplication entre `bibliotheques` et `groupes`.
 * Retourne une copie peu profonde sans ces clés.
 */
function _retirerBibliothequesDuGroupe(donnees) {
    var copie = {};
    Object.keys(donnees).forEach(function(k) {
        if (k === 'grillesTemplates') return;
        if (k === 'echellesTemplates') return;
        if (k === 'productionsTemplates') return;
        if (k === 'pratiquesConfigurables') return;
        if (k.indexOf('cartouches_') === 0) return;
        copie[k] = donnees[k];
    });
    return copie;
}

/* ===============================
   CONSTRUCTION DU CODEX DATA
   =============================== */

/**
 * Assemble le codex data à partir d'une liste d'archives lues.
 * @param {Array<{meta, donnees, dossier}>} lectures
 * @param {Object} options - { description?: string }
 * @returns {Promise<Object>} Codex data complet (avec champ integrite)
 */
async function _construireCodexData(lectures, options) {
    options = options || {};
    var _hasProg = typeof window.majProgression === 'function';

    if (!Array.isArray(lectures) || lectures.length === 0) {
        throw new Error('Aucune archive à extraire');
    }

    if (_hasProg) window.majProgression(70, 'Construction du document...', lectures.length + ' archives');

    // Bibliothèques globales (version la plus récente)
    var bibliotheques = _extraireBibliotheques(lectures.map(function(l) {
        return { donnees: l.donnees, date_archive: l.meta && l.meta.date_archive };
    }));

    // Groupes-cours indexés par dossier, sans bibliothèques
    var groupes = {};
    var archivesMeta = [];
    var dossiersVus = {};

    for (var i = 0; i < lectures.length; i++) {
        var l = lectures[i];
        if (!l.meta || !l.dossier) {
            throw new Error('Archive ' + i + ' invalide (meta ou dossier manquant)');
        }
        if (dossiersVus[l.dossier]) {
            throw new Error('Archive en double : ' + l.dossier);
        }
        dossiersVus[l.dossier] = true;

        var donneesNet = _retirerBibliothequesDuGroupe(l.donnees || {});
        // Métadonnées en DERNIER pour qu'elles ne soient pas écrasées par
        // d'éventuelles clés globales du groupe (ex. `cours` = liste globale
        // de tous les cours du trimestre, qui écraserait `cours` = code-cours
        // du groupe).
        groupes[l.dossier] = Object.assign({}, donneesNet, {
            uuid: l.meta.uuid || null,
            trimestre: l.meta.trimestre || null,
            cours: l.meta.cours || null,
            groupe: l.meta.groupe || null,
            date_archive: l.meta.date_archive || null
        });

        archivesMeta.push({
            uuid: l.meta.uuid || null,
            dossier: l.dossier,
            date_archive: l.meta.date_archive || null
        });
    }

    var dateExtraction = new Date().toISOString();

    var codexData = {
        format: FORMAT,
        version: VERSION_SCHEMA,
        metadata: {
            auteur: _obtenirAuteur(),
            date_extraction: dateExtraction,
            archives: archivesMeta,
            anonymise: false,
            application_version: _versionApp(),
            description: options.description || _genererDescriptionParDefaut(archivesMeta)
        },
        groupes: groupes,
        bibliotheques: bibliotheques
    };

    if (_hasProg) window.majProgression(85, 'Sérialisation...');

    // Hash d'intégrité (calculé AVANT ajout du champ integrite)
    var jsonAvantIntegrite = JSON.stringify(codexData, null, 2);

    // Vérification taille (sécurité)
    var tailleOctets = new Blob([jsonAvantIntegrite]).size;
    if (tailleOctets > TAILLE_MAX_OCTETS) {
        throw new Error('Codex data trop volumineux (' +
            window.TailleFichier.dire(tailleOctets, { decimales: 1 }) + '). Limite : ' +
            window.TailleFichier.dire(TAILLE_MAX_OCTETS, { decimales: 0 }) + '.');
    }

    if (_hasProg) window.majProgression(95, 'Calcul du hash d\'intégrité...', window.TailleFichier.dire(tailleOctets, { decimales: 1 }));
    var hash = await _calculerSHA256(jsonAvantIntegrite);

    codexData.integrite = {
        contenu_sha256: hash,
        algorithme: 'SHA-256',
        date_calcul: dateExtraction,
        note: 'Hash calculé sur la sérialisation JSON (indent 2) du document avant ajout de ce champ.'
    };

    return codexData;
}

function _genererDescriptionParDefaut(archivesMeta) {
    if (archivesMeta.length === 0) return '';
    if (archivesMeta.length === 1) {
        return 'Extrait de l\'archive ' + archivesMeta[0].dossier + '.';
    }
    return 'Extrait de ' + archivesMeta.length + ' archives : ' +
        archivesMeta.map(function(a) { return a.dossier; }).join(', ') + '.';
}

/* ===============================
   API : EXTRACTION DEPUIS LES ARCHIVES
   =============================== */

/**
 * Extrait un codex data depuis une liste d'UUIDs présents dans le manifeste
 * local. Mode FSAPI uniquement (Chrome/Edge avec dossier lié).
 *
 * @param {Array<string>} uuids - UUIDs des archives à extraire
 * @param {Object} [options] - { description?: string }
 * @returns {Promise<Object>} Codex data prêt à être téléchargé
 */
async function extraireDepuisArchivesFSAPI(uuids, options) {
    if (!Array.isArray(uuids) || uuids.length === 0) {
        throw new Error('Aucun UUID fourni');
    }

    var Reserve = window.Reserve;
    if (!Reserve || typeof Reserve.supporteFSAPI !== 'function') {
        throw new Error('Module Archives non disponible');
    }
    if (!Reserve.supporteFSAPI()) {
        throw new Error('Mode FSAPI non supporté par ce navigateur. Utilise l\'extraction par fichiers ZIP.');
    }

    var handle = await Reserve.obtenirHandle();
    if (!handle) throw new Error('Aucun dossier Archives lié. Lie d\'abord un dossier dans Réglages > Données > Archives.');

    // Résoudre uuid → dossier via le manifeste local
    var manifeste = Reserve.lireManifesteLocal();
    var entrees = manifeste && manifeste.archives ? manifeste.archives : {};
    var aLire = [];
    var uuidsAbsents = [];

    uuids.forEach(function(uuid) {
        var trouve = false;
        Object.keys(entrees).forEach(function(dossier) {
            var e = entrees[dossier];
            if (e && e.uuid === uuid) {
                aLire.push(dossier);
                trouve = true;
            }
        });
        if (!trouve) uuidsAbsents.push(uuid);
    });

    if (uuidsAbsents.length > 0) {
        throw new Error('UUID(s) absent(s) du manifeste local : ' + uuidsAbsents.join(', '));
    }

    var _hasProg = typeof window.afficherProgression === 'function';
    if (_hasProg) window.afficherProgression('Extraction codex data');
    try {
        var lectures = [];
        for (var i = 0; i < aLire.length; i++) {
            if (_hasProg) {
                var pct = Math.round((i / aLire.length) * 65);
                window.majProgression(pct, 'Lecture des archives...', (i + 1) + '/' + aLire.length);
            }
            var lue = await _lireArchiveFSAPI(handle, aLire[i]);
            lectures.push(lue);
            await _yield();
        }

        return await _construireCodexData(lectures, options);
    } finally {
        if (_hasProg) window.masquerProgression();
    }
}

/**
 * Extrait un codex data depuis une liste de fichiers ZIP archives.
 * Mode universel (Safari, iPad, Chrome/Edge sans handle).
 *
 * @param {FileList|Array<File>} files - Fichiers .reserve.zip sélectionnés
 * @param {Object} [options] - { description?: string }
 * @returns {Promise<Object>} Codex data prêt à être téléchargé
 */
async function extraireDepuisFichiersZIP(files, options) {
    if (!files || files.length === 0) {
        throw new Error('Aucun fichier ZIP fourni');
    }

    var _hasProg = typeof window.afficherProgression === 'function';
    if (_hasProg) window.afficherProgression('Extraction codex data');
    try {
        var lectures = [];
        for (var i = 0; i < files.length; i++) {
            if (_hasProg) {
                var pct = Math.round((i / files.length) * 65);
                window.majProgression(pct, 'Lecture des fichiers ZIP...', (i + 1) + '/' + files.length);
            }
            var lue = await _lireArchiveZIP(files[i]);
            lectures.push(lue);
            await _yield();
        }

        return await _construireCodexData(lectures, options);
    } finally {
        if (_hasProg) window.masquerProgression();
    }
}

/* ===============================
   LECTURE DEPUIS UN DOSSIER (webkitdirectory)
   ===============================
   Permet à l'utilisateur de sélectionner son dossier Archives_LaboCodex/
   directement (sans extraire les ZIP au préalable, ou si déjà extraits).
   L'input file avec attribut webkitdirectory renvoie tous les fichiers du
   dossier avec leur chemin relatif via `webkitRelativePath`.
*/

/**
 * Détecte les archives contenues dans une FileList issue d'un input avec
 * webkitdirectory. Regroupe les fichiers par leur dossier d'archive et
 * retourne un index `{ dossier: { metaFile, donneesFile, ... } }`.
 *
 * @param {FileList|Array<File>} files
 * @returns {Object} Index par nom de dossier d'archive
 */
function _indexerArchivesDeDossier(files) {
    var index = {};
    for (var i = 0; i < files.length; i++) {
        var f = files[i];
        var chemin = f.webkitRelativePath || f.name || '';
        // Format attendu : <racine>/trimestres/<dossier>/<fichier>.json
        // Ou : trimestres/<dossier>/<fichier>.json (si pas de racine)
        var m = chemin.match(/(?:^|\/)trimestres\/([^\/]+)\/(meta|donnees)\.json$/);
        if (!m) continue;
        var dossier = m[1];
        var nom = m[2];
        if (!index[dossier]) index[dossier] = { dossier: dossier };
        if (nom === 'meta') index[dossier].metaFile = f;
        else if (nom === 'donnees') index[dossier].donneesFile = f;
    }
    return index;
}

/**
 * Liste les archives détectées dans une FileList (sans encore les lire).
 * Utile pour l'UI (afficher une liste à cocher après sélection du dossier).
 *
 * @param {FileList|Array<File>} files
 * @returns {Promise<Array<{dossier, uuid, trimestre, cours, groupe, date_archive,
 *                          nombre_etudiants}>>}
 */
async function listerArchivesDansDossier(files) {
    if (!files || files.length === 0) return [];
    var index = _indexerArchivesDeDossier(files);
    var dossiers = Object.keys(index);
    var liste = [];

    for (var i = 0; i < dossiers.length; i++) {
        var d = dossiers[i];
        var entree = index[d];
        if (!entree.metaFile || !entree.donneesFile) continue; // archive incomplète, ignorée

        var meta = null;
        try {
            var texteMeta = await entree.metaFile.text();
            meta = JSON.parse(texteMeta);
        } catch (e) {
            console.warn('[CodexData] meta.json illisible pour', d, e.message || e);
            continue;
        }

        liste.push({
            dossier: d,
            uuid: meta.uuid || null,
            trimestre: meta.trimestre || '',
            cours: meta.cours || '',
            groupe: meta.groupe || '',
            date_archive: meta.date_archive || '',
            nombre_etudiants: (meta.contenu && meta.contenu.nombre_etudiants) || null,
            // Conserver une référence pour la lecture ultérieure (sans re-parser meta)
            _meta: meta,
            _donneesFile: entree.donneesFile
        });
        await _yield();
    }

    liste.sort(function(a, b) {
        return (b.date_archive || '').localeCompare(a.date_archive || '');
    });
    return liste;
}

/**
 * Extrait un codex data depuis un sous-ensemble d'archives détectées par
 * listerArchivesDansDossier (chaque entrée porte _meta + _donneesFile).
 *
 * @param {Array} archivesAvecRefs - Sortie de listerArchivesDansDossier filtrée
 * @param {Object} [options]
 * @returns {Promise<Object>} Codex data
 */
async function extraireDepuisDossier(archivesAvecRefs, options) {
    if (!Array.isArray(archivesAvecRefs) || archivesAvecRefs.length === 0) {
        throw new Error('Aucune archive sélectionnée');
    }

    var _hasProg = typeof window.afficherProgression === 'function';
    if (_hasProg) window.afficherProgression('Extraction codex data');
    try {
        var lectures = [];
        for (var i = 0; i < archivesAvecRefs.length; i++) {
            if (_hasProg) {
                var pct = Math.round((i / archivesAvecRefs.length) * 65);
                window.majProgression(pct, 'Lecture du dossier...', (i + 1) + '/' + archivesAvecRefs.length);
            }
            var a = archivesAvecRefs[i];
            if (!a._meta || !a._donneesFile) {
                throw new Error('Référence d\'archive invalide pour ' + (a.dossier || '?'));
            }
            var texteDonnees;
            try {
                texteDonnees = await a._donneesFile.text();
            } catch (e) {
                throw new Error('Lecture de donnees.json échouée pour ' + a.dossier + ' : ' + (e.message || e));
            }
            var donnees;
            try {
                donnees = JSON.parse(texteDonnees);
            } catch (e) {
                throw new Error('donnees.json corrompu pour ' + a.dossier + ' : ' + (e.message || e));
            }
            lectures.push({ meta: a._meta, donnees: donnees, dossier: a.dossier });
            await _yield();
        }

        return await _construireCodexData(lectures, options);
    } finally {
        if (_hasProg) window.masquerProgression();
    }
}

/* ===============================
   API : TÉLÉCHARGEMENT
   =============================== */

/**
 * Déclenche le téléchargement d'un codex data sous forme de fichier .json.
 * @param {Object} codexData - Document construit par extraireDepuis...
 * @param {string} [nomFichier] - Nom optionnel (sinon généré)
 */
function telecharger(codexData, nomFichier) {
    if (!codexData || codexData.format !== FORMAT) {
        throw new Error('Document non reconnu comme codex data');
    }

    var json = JSON.stringify(codexData, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var nom = nomFichier || _genererNomFichier(codexData);
    var a = document.createElement('a');
    a.href = url;
    a.download = nom;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function _genererNomFichier(codexData) {
    var date = (codexData.metadata && codexData.metadata.date_extraction) || new Date().toISOString();
    var dateCourt = date.split('T')[0]; // YYYY-MM-DD
    var nbArchives = (codexData.metadata && codexData.metadata.archives) ?
        codexData.metadata.archives.length : 0;
    // Convention #262 : `codex-data-{N}-groupes-{date}.json` (au lieu de `{N}gc`).
    return 'codex-data-' + nbArchives + '-groupes-' + dateCourt + EXTENSION;
}

/* ===============================
   API : CHARGEMENT (lecture d'un .codex-data.json)
   Utilisé par le Labo (#252) pour consommer le format produit ici.
   =============================== */

/**
 * Lit et valide un fichier .codex-data.json. Vérifie le format, la version
 * et l'intégrité (hash SHA-256).
 *
 * @param {File} file - Fichier .codex-data.json
 * @returns {Promise<Object>} Codex data validé
 */
async function chargerDepuisFichier(file) {
    if (!file) throw new Error('Aucun fichier fourni');

    var taille = file.size || 0;
    if (taille > TAILLE_MAX_OCTETS) {
        throw new Error('Fichier trop volumineux (' +
            window.TailleFichier.dire(taille, { decimales: 1 }) + '). Limite : ' +
            window.TailleFichier.dire(TAILLE_MAX_OCTETS, { decimales: 0 }) + '.');
    }

    var texte = await file.text();
    var donnees;
    try {
        donnees = JSON.parse(texte);
    } catch (e) {
        throw new Error('Fichier illisible (JSON invalide) : ' + (e.message || e));
    }

    return _validerEtNormaliser(donnees);
}

function _validerEtNormaliser(donnees) {
    if (!donnees || typeof donnees !== 'object') {
        throw new Error('Document vide ou invalide');
    }
    if (donnees.format !== FORMAT) {
        throw new Error('Format non reconnu (attendu : ' + FORMAT + ', reçu : ' + donnees.format + ')');
    }
    if (typeof donnees.version !== 'number') {
        throw new Error('Version absente ou invalide');
    }
    if (donnees.version > VERSION_SCHEMA) {
        throw new Error('Version du fichier (' + donnees.version +
            ') trop récente. Version supportée : ' + VERSION_SCHEMA + '. Mets à jour Labo Codex.');
    }
    if (!donnees.groupes || typeof donnees.groupes !== 'object') {
        throw new Error('Champ "groupes" absent ou invalide');
    }
    if (!donnees.metadata || typeof donnees.metadata !== 'object') {
        throw new Error('Champ "metadata" absent');
    }
    return donnees;
}

/**
 * Vérifie l'intégrité d'un codex data en recalculant le hash SHA-256
 * et en le comparant à `integrite.contenu_sha256`.
 *
 * @param {Object} codexData - Document chargé
 * @returns {Promise<{valide: boolean, hashAttendu: string, hashCalcule: string}>}
 */
async function verifierIntegrite(codexData) {
    if (!codexData || !codexData.integrite || !codexData.integrite.contenu_sha256) {
        return { valide: false, hashAttendu: null, hashCalcule: null,
                 raison: 'Champ integrite absent — fichier non vérifiable.' };
    }
    var attendu = codexData.integrite.contenu_sha256;

    // Reconstituer le document tel qu'il était avant ajout du champ integrite :
    // copie sans ce champ, sérialisée dans le même format (indent 2).
    var copie = {};
    Object.keys(codexData).forEach(function(k) {
        if (k !== 'integrite') copie[k] = codexData[k];
    });
    var json = JSON.stringify(copie, null, 2);
    var calcule = await _calculerSHA256(json);

    return {
        valide: calcule === attendu,
        hashAttendu: attendu,
        hashCalcule: calcule
    };
}

/* ===============================
   API : LISTE DES ARCHIVES DISPONIBLES (pour l'UI de sélection)
   =============================== */

/**
 * Renvoie la liste des archives extractibles depuis le manifeste local.
 * Tri décroissant par date_archive. Format adapté à un sélecteur UI.
 *
 * @returns {Array<{uuid, dossier, trimestre, cours, groupe, nom_cours,
 *                  date_archive, mode_archive, nombre_etudiants}>}
 */
function listerArchivesDisponibles() {
    var Reserve = window.Reserve;
    if (!Reserve || typeof Reserve.lireManifesteLocal !== 'function') {
        return [];
    }

    var manifeste = Reserve.lireManifesteLocal();
    var entrees = manifeste && manifeste.archives ? manifeste.archives : {};
    var liste = [];

    Object.keys(entrees).forEach(function(dossier) {
        var e = entrees[dossier];
        if (!e || !e.uuid) return;
        liste.push({
            uuid: e.uuid,
            dossier: dossier,
            trimestre: e.trimestre || '',
            cours: e.cours || '',
            groupe: e.groupe || '',
            nom_cours: e.nom_cours || '',
            date_archive: e.date_archive || '',
            mode_archive: e.mode_archive || '',
            nombre_etudiants: typeof e.nombre_etudiants === 'number' ? e.nombre_etudiants : null
        });
    });

    liste.sort(function(a, b) {
        return (b.date_archive || '').localeCompare(a.date_archive || '');
    });

    return liste;
}

/* ===============================
   EXPORT — API publique
   =============================== */

window.CodexData = {
    // Constantes
    FORMAT: FORMAT,
    VERSION_SCHEMA: VERSION_SCHEMA,
    EXTENSION: EXTENSION,

    // Production
    extraireDepuisArchivesFSAPI: extraireDepuisArchivesFSAPI,
    extraireDepuisFichiersZIP: extraireDepuisFichiersZIP,
    listerArchivesDansDossier: listerArchivesDansDossier,
    extraireDepuisDossier: extraireDepuisDossier,
    telecharger: telecharger,

    // Consommation (pour le Labo, SP3)
    chargerDepuisFichier: chargerDepuisFichier,
    verifierIntegrite: verifierIntegrite,

    // Aide UI
    listerArchivesDisponibles: listerArchivesDisponibles
};

})();
