/* ===============================
   MODULE : RÉSERVE — VERSEMENT D'UN GROUPE-COURS
   Date : 26 avril 2026
   Spec : docs/architecture/SPEC-RESERVE-V1.md
   Architecture : docs/architecture/ECOSYSTEME-DONNEES.md

   Vocation
     Génère un ZIP structuré contenant les données et travaux d'UN
     groupe-cours d'un trimestre. Le ZIP est téléchargé via le navigateur ;
     l'utilisateur le décompresse dans ~/Documents/Réserve_LaboCodex/
     pour compléter le versement.

   Granularité
     Un versement = un groupe-cours. Plusieurs groupes du même trimestre
     produisent plusieurs versements indépendants, chacun avec son UUID v4.

   Filtrage en deux passes
     1. Préfixe « {trimestre}_ » sur les clés IndexedDB
     2. Pour chaque clé connue, isolation par groupeCoursId (étudiants par
        numéro de groupe, présences/évaluations/interventions par DA,
        fichiersTravaux par groupeCoursId, snapshots par suffixe de clé)

   Dépendances
     - db.js (window.db)
     - trimestres.js (window.obtenirTrimestres, window.cle)
     - travaux-stockage.js (window.travauxStockage.recupererBlob)
     - JSZip (libs/jszip.min.js)
     - import-export.js (window.estRessourceDemo / filtrerRessourcesNonDemo)
     - progression.js (window.afficherProgression / majProgression / masquerProgression)

   Pas de couplage avec codex.js ni import-export.js (au-delà des helpers démo).
   =============================== */

(function() {
'use strict';

/* ===============================
   CONSTANTES
   =============================== */

var EXTENSION_RESERVE = '.reserve.zip';

// Préfixes de clés à exclure du versement
var PREFIXES_EXCLUS = ['_codex_', '_'];

// Clés globales (non namespacées) à inclure dans le versement
var CLES_GLOBALES_INCLUSES = [
    'listeCours',
    'cours',
    'enseignants',
    'horaires',
    'grillesTemplates',
    'echellesTemplates',
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
    // etc. — incluons-les sans filtre pour préserver l'état archivé.
    'grillesTemplates',
    'echellesTemplates',
    'pratiquesConfigurables'
];

// Clés à filtrer par groupeCoursId sur chaque entrée (tableau)
var CLES_FILTRER_PAR_GC = [
    'corbeilleFichiers'
];

/* ===============================
   UTILITAIRES
   =============================== */

function _formaterTaille(octets) {
    if (octets < 1024) return octets + ' o';
    if (octets < 1024 * 1024) return (octets / 1024).toFixed(1) + ' Ko';
    if (octets < 1024 * 1024 * 1024) return (octets / (1024 * 1024)).toFixed(1) + ' Mo';
    return (octets / (1024 * 1024 * 1024)).toFixed(2) + ' Go';
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
                groupe: _normaliserGroupe(gc.groupe || gc.groupeNum),
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
 * Collecte les clés et données nécessaires au versement.
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

    onProg(5, 'Inventaire des clés...', '');
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
    var idx = 0;
    for (var i = 0; i < clesTrimestre.length; i++) {
        var cleComplete = clesTrimestre[i];
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
                // Si aucun fichier dans le groupe → aucune annotation à verser
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

        if (idx % 5 === 0) {
            onProg(15 + Math.round((i / clesTrimestre.length) * 15),
                'Lecture des données...',
                (i + 1) + ' / ' + clesTrimestre.length + ' clés');
            await _yield();
        }
        idx++;
    }

    if (clesInconnues.length > 0) {
        console.warn('[Réserve] Clés trimestre non reconnues, incluses sans filtrage :',
            clesInconnues.join(', '));
    }

    // 3) Clés globales (non namespacées)
    onProg(32, 'Clés globales...', '');
    for (var g = 0; g < CLES_GLOBALES_INCLUSES.length; g++) {
        var cg = CLES_GLOBALES_INCLUSES[g];
        var v = await db.get(cg, null);
        if (v !== null && v !== undefined) {
            // Filtrer démo dans les bibliothèques
            if (cg === 'grillesTemplates' && typeof window.filtrerRessourcesNonDemo === 'function') {
                v = window.filtrerRessourcesNonDemo(v, 'grille');
            } else if (cg === 'echellesTemplates' && typeof window.filtrerRessourcesNonDemo === 'function') {
                v = window.filtrerRessourcesNonDemo(v, 'echelle');
            } else if (cg === 'productionsTemplates' && typeof window.filtrerRessourcesNonDemo === 'function') {
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
        return { blobs: [], trouves: 0, manquants: 0, tailleTotale: 0 };
    }

    if (typeof window.travauxStockage === 'undefined' ||
        typeof window.travauxStockage.recupererBlob !== 'function') {
        console.warn('[Réserve] travauxStockage indisponible — aucun blob versé');
        return { blobs: [], trouves: 0, manquants: fichiers.length, tailleTotale: 0 };
    }

    var blobs = [];
    var manquants = 0;
    var tailleTotale = 0;

    for (var j = 0; j < fichiers.length; j++) {
        var f = fichiers[j];
        try {
            var blob = await window.travauxStockage.recupererBlob(f.id);
            if (blob) {
                var ext = _extensionDepuisNomFichier(f.nomFichier);
                blobs.push({ id: f.id, ext: ext, blob: blob });
                tailleTotale += blob.size || 0;
            } else {
                manquants++;
                console.warn('[Réserve] Blob introuvable pour ' + f.id);
            }
        } catch (e) {
            manquants++;
            console.warn('[Réserve] Erreur récupération blob ' + f.id, e.message || e);
        }

        if (j % 5 === 0) {
            onProg(40 + Math.round((j / fichiers.length) * 30),
                'Collecte des fichiers travaux...',
                blobs.length + ' / ' + fichiers.length + ' (' + _formaterTaille(tailleTotale) + ')');
            await _yield();
        }
    }

    return {
        blobs: blobs,
        trouves: blobs.length,
        manquants: manquants,
        tailleTotale: tailleTotale
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
                groupe: _normaliserGroupe(gc.groupe || gc.groupeNum),
                source: 'groupe-cours'
            };
            info.dossier = _nomDossier(trimestreId, info);
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
        info.dossier = _nomDossier(trimestreId, info);
        resultats.push(info);
    });

    return resultats;
}

/* ===============================
   API : VERSEMENT
   =============================== */

async function verserGroupeCours(trimestre, groupeCoursId) {
    if (typeof JSZip === 'undefined') {
        var msg = 'Bibliothèque de compression non chargée.';
        if (typeof window.afficherNotificationErreur === 'function') {
            window.afficherNotificationErreur('Erreur', msg);
        }
        throw new Error(msg);
    }

    var gc = _resoudreGroupeCours(trimestre, groupeCoursId);
    if (!gc) {
        var m = 'Groupe-cours introuvable pour le trimestre ' + trimestre + '.';
        if (typeof window.afficherNotificationErreur === 'function') {
            window.afficherNotificationErreur('Versement impossible', m);
        }
        throw new Error(m);
    }

    var dossier = _nomDossier(trimestre, gc);
    var uuid = _genererUUIDv4();

    _progShow('Versement dans la réserve');
    _prog(0, 'Préparation...', dossier);
    await _yield();

    try {
        // 1. Collecte des données
        var collecte = await _collecterDonnees(trimestre, gc, _prog);
        var donnees = collecte.donnees;
        var statsDonnees = collecte.stats;

        if (statsDonnees.nombreEtudiants === 0 && statsDonnees.nombreCles === 0) {
            _progHide();
            var msgVide = 'Aucune donnée trouvée pour ce groupe-cours dans ' + trimestre + '.';
            if (typeof window.afficherNotificationErreur === 'function') {
                window.afficherNotificationErreur('Versement vide', msgVide);
            }
            throw new Error(msgVide);
        }

        var tailleJsonDonnees = 0;
        try {
            tailleJsonDonnees = new Blob([JSON.stringify(donnees)]).size;
        } catch (eMes) {
            console.warn('[Réserve] Mesure taille JSON échouée:', eMes.message || eMes);
        }

        // 2. Collecte des blobs
        _prog(40, 'Collecte des fichiers travaux...', '');
        await _yield();
        var collecteBlobs = await _collecterBlobs(donnees, trimestre, _prog);

        // 3. Construction du ZIP
        _prog(72, 'Construction du ZIP...', dossier);
        await _yield();

        var zip = new JSZip();
        var dossierBase = zip.folder('trimestres').folder(dossier);

        dossierBase.file('donnees.json', JSON.stringify(donnees, null, 0));

        var dossierTravaux = dossierBase.folder('travaux');
        for (var b = 0; b < collecteBlobs.blobs.length; b++) {
            var entree = collecteBlobs.blobs[b];
            dossierTravaux.file(entree.id + '.' + entree.ext, entree.blob);
        }

        // 4. meta.json
        var meta = {
            uuid: uuid,
            trimestre: trimestre,
            cours: gc.codeCours || '',
            groupe: gc.groupe,
            dossier: dossier,
            statut: 'verse',
            source: 'application (IndexedDB)',
            date_versement: new Date().toISOString(),
            appareil: _identifierAppareil(),
            application_version: _versionApp(),
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
            notes: 'Versement automatique depuis l\'application.'
        };
        dossierBase.file('meta.json', JSON.stringify(meta, null, 2));

        // 5. patch manifeste
        var patch = {
            dossier: dossier,
            patch: {
                uuid: uuid,
                trimestre: trimestre,
                cours: gc.codeCours || '',
                groupe: gc.groupe,
                statut: 'verse',
                source: 'application (IndexedDB)',
                date_versement: meta.date_versement,
                donnees: true,
                travaux: collecteBlobs.trouves > 0,
                nombre_etudiants: statsDonnees.nombreEtudiants,
                notes: 'Versement du ' + _dateAujourdhui() + '.'
            }
        };
        dossierBase.file('manifeste-reserve-patch.json', JSON.stringify(patch, null, 2));

        // 6. Compression
        _prog(80, 'Compression du ZIP...', '');
        await _yield();
        var zipBlob = await zip.generateAsync(
            { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
            function(metaCompr) {
                _prog(80 + Math.round(metaCompr.percent * 0.18),
                    'Compression du ZIP...',
                    Math.round(metaCompr.percent) + '% compressé');
            }
        );

        // 7. Téléchargement
        var nomFichier = 'CONFIDENTIEL-versement-' + dossier + '-' + _dateAujourdhui() + EXTENSION_RESERVE;
        _prog(99, 'Téléchargement...', nomFichier);

        var url = URL.createObjectURL(zipBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        _prog(100, 'Versement prêt !', _formaterTaille(zipBlob.size));
        await new Promise(function(r) { setTimeout(r, 600); });
        _progHide();

        // Notification finale
        if (typeof window.afficherNotificationSucces === 'function') {
            window.afficherNotificationSucces(
                'Versement téléchargé',
                statsDonnees.nombreEtudiants + ' étudiant(s), ' +
                collecteBlobs.trouves + ' fichier(s) (' + _formaterTaille(zipBlob.size) + ')'
            );
        }

        return {
            succes: true,
            uuid: uuid,
            dossier: dossier,
            nomFichier: nomFichier,
            stats: {
                etudiants: statsDonnees.nombreEtudiants,
                cles: statsDonnees.nombreCles,
                fichiersTrouves: collecteBlobs.trouves,
                fichiersManquants: collecteBlobs.manquants,
                tailleZip: zipBlob.size,
                tailleTravaux: collecteBlobs.tailleTotale
            }
        };

    } catch (err) {
        _progHide();
        console.error('[Réserve] Erreur versement:', err);
        if (typeof window.afficherNotificationErreur === 'function') {
            window.afficherNotificationErreur('Erreur de versement', err.message || String(err));
        }
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
        console.warn('[Réserve] Erreur estimation:', e);
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
        console.error('[Réserve] Modale #modalReserve introuvable dans le DOM');
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

    modal.classList.add('actif');
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
        if (typeof window.afficherNotificationErreur === 'function') {
            window.afficherNotificationErreur('Sélection incomplète',
                'Choisis un trimestre et un groupe-cours.');
        }
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

window.Reserve = {
    verserGroupeCours: verserGroupeCours,
    estimerVersement: estimerVersement,
    listerGroupesVersables: listerGroupesVersables,
    actionVerser: actionVerser,
    fermerDialogue: fermerDialogue,
    lancerDepuisDialogue: lancerDepuisDialogue,
    onChangerTrimestre: _onChangerTrimestre,
    onChangerGroupe: _onChangerGroupe
};

})();
