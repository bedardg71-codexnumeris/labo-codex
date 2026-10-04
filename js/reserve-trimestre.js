/* ===============================
   MODULE : ARCHIVES — ARCHIVER UN TRIMESTRE ENTIER
   Date : 4 octobre 2026 (E1 du plan « emprunter et rendre un trimestre », #1022)
   Plan : plans de travail/PLAN-2026-10-04-emprunter-et-rendre-un-trimestre.md
   Consigne : plans de travail/CONSIGNE-DU-JOUR.md (Cowork, 4 oct. 16 h 27)

   Vocation
     Fabrique l'EXEMPLAIRE d'un trimestre clos : tout ce qui le fait, hors du navigateur,
     vérifiable comme l'archive d'un groupe-cours (lot A2). C'est sur lui que reposeront
     « emprunter » (E2) et « rendre » (E3).

   Ce que l'archive emporte (décisions de Cowork, point 2)
     - toutes les clés `<trimestre>_*`, ENTIÈRES (aucun filtre de groupe ni d'élève) ;
     - les séances vivantes `seancesCompletes_gc_<id>` des groupes du trimestre (globales,
       sans « <trimestre> » dans leur nom : on les retrouve par `<trimestre>_groupesCours`) ;
     - tous les fichiers des copies du trimestre : `<trimestre>_fichiersTravaux` ET
       `<trimestre>_corbeilleFichiers` ;
     - une empreinte SHA-256 par fichier (`integrite.travaux_sha256`, comme le lot A1) et
       une par clé (`integrite.cles_sha256` : l'empreinte de JSON.stringify de sa valeur).

   Ce qu'elle n'emporte pas
     Aucune clé globale dans donnees.json : rien que E2 pourrait réécrire par-dessus un
     autre trimestre (cours, listeCours, enseignants, profil, trimestres, registre
     longitudinal, bibliothèques). Pour lire l'archive seule, meta.json porte une section
     `pour_memoire` (l'entrée du trimestre dans le registre, et le code et le nom des cours
     de ses groupes) que E2 ne réécrira jamais.

   Ce qui est écrit
     Rien dans les données : seule la liste des archives (`_manifesteReserve`) gagne une
     entrée, après le « Il y est » de l'usager (mode fichier) ou l'écriture du dossier.

   Dépendances
     - reserve.js (window.Reserve) : obtenirHandle, deposerArchive, empreinteDeLaCopie,
       empreinteDuTexte, extensionDuNom, nouvelUuid, appareil, versionApp
     - db.js (window.db), trimestres.js (window.obtenirTrimestres)
     - travaux-stockage.js (window.travauxStockage.recupererBlob)
     - ui-dialogues.js, progression.js, utils-notifications.js
   =============================== */

(function() {
'use strict';

/* ===============================
   LES MOTS — UN SEUL ENDROIT
   ===============================
   Acceptés par Grégoire le 4 oct. 2026 (consigne de Cowork de 17 h 19), avec « étudiant·e ».
*/
function _etudiants(n) { return n + (n > 1 ? ' étudiant·es' : ' étudiant·e'); }

var MOTS = {
    menu: 'Archiver le trimestre…',
    menuTitre: 'Déposer une copie complète de ce trimestre hors du navigateur',
    confirmation: {
        titre: function(nom) { return 'Archiver ' + nom + ' ?'; },
        texte: function(c) {
            return 'L\'archive emporte tout le trimestre : ' +
                c.etudiants + ' étudiant·e' + (c.etudiants > 1 ? 's' : '') + ', ' +
                c.groupes + ' groupe' + (c.groupes > 1 ? 's' : '') + ', ' +
                c.copies + ' copie' + (c.copies > 1 ? 's' : '') +
                (c.corbeille ? ' (dont ' + c.corbeille + ' à la corbeille)' : '') +
                ', environ ' + c.taille + '.\n' +
                'Rien n\'est retiré de l\'application : le trimestre reste là, clos.';
        },
        bouton: 'Archiver'
    },
    archive: function(stats, chemin) {
        return { titre: 'Trimestre archivé', texte: _etudiants(stats.etudiants) + ', ' + stats.fichiersTrouves + ' copie(s) : ' + chemin };
    },
    telecharge: function(stats, taille) {
        return { titre: 'Trimestre archivé : fichier téléchargé', texte: _etudiants(stats.etudiants) + ', ' + stats.fichiersTrouves + ' copie(s) (' + taille + ')' };
    },
    nonArchive: 'Trimestre non archivé',
    refus: {
        titre: 'Trimestre non archivé',
        pasClos: 'Seul un trimestre clos peut être archivé. Clos-le d\'abord.',
        introuvable: 'Ce trimestre n\'est pas dans la bibliothèque.',
        vide: 'Ce trimestre ne contient aucune donnée.'
    },
    // Dans la liste des archives (Réglages › Données › Archives), colonne « Cours ».
    liste: { cours: 'Trimestre entier' },
    progression: 'Archive du trimestre'
};

/** Le nom du dossier de l'archive. Distinct de celui d'un groupe (`<trim>-<cours>-gr<n>`). */
function nomDossier(trimestre) {
    return trimestre + '-trimestre';
}

function _prog(pct, detail, stats) {
    if (typeof window.majProgression === 'function') window.majProgression(pct, detail, stats);
}

function _yield() {
    return new Promise(function(resolve) { setTimeout(resolve, 0); });
}

function _formaterTaille(octets) {
    if (!octets) return '0 o';
    if (octets < 1024 * 1024) return (octets / 1024).toFixed(1) + ' Ko';
    if (octets < 1024 * 1024 * 1024) return (octets / (1024 * 1024)).toFixed(1) + ' Mo';
    return (octets / (1024 * 1024 * 1024)).toFixed(2) + ' Go';
}

function _entreeRegistre(trimestre) {
    var liste = (typeof window.obtenirTrimestres === 'function')
        ? window.obtenirTrimestres()
        : (window.db.getSync('trimestres', []) || []);
    return (liste || []).find(function(t) { return t && t.id === trimestre; }) || null;
}

/** Les ids des groupes-cours du trimestre (pour ses séances vivantes). */
function _idsGroupes(trimestre) {
    var gcs = window.db.getSync(trimestre + '_groupesCours', []) || [];
    return Array.isArray(gcs) ? gcs.filter(function(g) { return g && g.id; }).map(function(g) { return g.id; }) : [];
}

/** Les fiches de toutes les copies du trimestre : travail ET corbeille. */
function fichesDuTrimestre(trimestre) {
    var fiches = [];
    ['fichiersTravaux', 'corbeilleFichiers'].forEach(function(liste) {
        var v = window.db.getSync(trimestre + '_' + liste, []) || [];
        if (Array.isArray(v)) v.forEach(function(f) { if (f && f.id) fiches.push({ liste: liste, fiche: f }); });
    });
    return fiches;
}

/* ===============================
   LA COLLECTE
   =============================== */

/**
 * Ce que l'archive du trimestre contiendra : les clés (valeur et empreinte) et la liste
 * des copies à ranger. Ne lit aucun fichier de copie.
 * @returns {Promise<{donnees, empreintesCles, seances, stats}>}
 */
async function collecterDonnees(trimestre) {
    var Reserve = window.Reserve;
    var prefixe = trimestre + '_';
    var toutes = await window.db.keys();
    var cles = toutes.filter(function(k) { return k.indexOf(prefixe) === 0; });
    var seances = _idsGroupes(trimestre).map(function(id) { return 'seancesCompletes_gc_' + id; })
        .filter(function(k) { return toutes.indexOf(k) !== -1; });
    cles = cles.concat(seances).sort();

    var donnees = {};
    var empreintesCles = {};
    for (var i = 0; i < cles.length; i++) {
        var v = await window.db.get(cles[i], null);
        if (v === null || v === undefined) continue;
        donnees[cles[i]] = v;
        empreintesCles[cles[i]] = await Reserve.empreinteDuTexte(JSON.stringify(v));
        if (i % 10 === 9) {
            _prog(5 + Math.round((i / cles.length) * 25), 'Lecture des données…', (i + 1) + ' / ' + cles.length + ' clés');
            await _yield();
        }
    }

    var etudiants = donnees[prefixe + 'groupeEtudiants'];
    return {
        donnees: donnees,
        empreintesCles: empreintesCles,
        seances: seances.filter(function(k) { return Object.prototype.hasOwnProperty.call(donnees, k); }),
        stats: {
            nombreCles: Object.keys(donnees).length,
            nombreEtudiants: Array.isArray(etudiants) ? etudiants.length : 0,
            nombreGroupes: _idsGroupes(trimestre).length
        }
    };
}

/**
 * Les copies du trimestre (travail et corbeille), par référence, chacune avec son empreinte.
 * Une copie à la fois : la mémoire prise est celle de la plus grosse (lot A1).
 */
async function collecterCopies(donnees, trimestre) {
    var Reserve = window.Reserve;
    var fiches = [];
    ['fichiersTravaux', 'corbeilleFichiers'].forEach(function(liste) {
        var v = donnees[trimestre + '_' + liste];
        if (Array.isArray(v)) v.forEach(function(f) { if (f && f.id) fiches.push({ liste: liste, fiche: f }); });
    });

    var blobs = [];
    var empreintes = {};
    var manquants = 0;
    var corbeille = 0;
    var tailleTotale = 0;
    var vus = {};
    for (var j = 0; j < fiches.length; j++) {
        var f = fiches[j].fiche;
        if (vus[f.id]) continue; // une même copie citée deux fois n'est rangée qu'une fois
        vus[f.id] = true;
        var blob = null;
        try {
            blob = await window.travauxStockage.recupererBlob(f.id);
        } catch (e) {
            console.warn('[Archives] Erreur récupération blob ' + f.id, e.message || e);
        }
        if (!blob) {
            manquants++;
            console.warn('[Archives] Blob introuvable pour ' + f.id);
        } else {
            if (!(blob instanceof Blob)) blob = new Blob([blob]);
            var ext = Reserve.extensionDuNom(f.nomFichier);
            empreintes[f.id + '.' + ext] = await Reserve.empreinteDeLaCopie(blob);
            blobs.push({ id: f.id, ext: ext, blob: blob });
            tailleTotale += blob.size || 0;
            if (fiches[j].liste === 'corbeilleFichiers') corbeille++;
        }
        if (j % 5 === 0) {
            _prog(30 + Math.round((j / fiches.length) * 40), 'Empreintes des copies…',
                blobs.length + ' / ' + fiches.length + ' (' + _formaterTaille(tailleTotale) + ')');
            await _yield();
        }
    }
    return { blobs: blobs, empreintes: empreintes, trouves: blobs.length, corbeille: corbeille, manquants: manquants, tailleTotale: tailleTotale };
}

/** Pour lire l'archive seule. Jamais réécrit par E2. */
function _pourMemoire(trimestre, donnees) {
    var gcs = donnees[trimestre + '_groupesCours'];
    var idsCours = {};
    if (Array.isArray(gcs)) gcs.forEach(function(g) { if (g && g.coursId) idsCours[g.coursId] = true; });
    var cours = (window.db.getSync('cours', []) || []).filter(function(c) { return c && idsCours[c.id]; })
        .map(function(c) { return { id: c.id, codeCours: c.codeCours || '', nomCours: c.nomCours || '' }; });
    var t = _entreeRegistre(trimestre);
    return {
        avertissement: 'Pour lire cette archive seule. Ces valeurs ne sont jamais réécrites dans l\'application.',
        trimestre: t ? JSON.parse(JSON.stringify(t)) : null,
        cours: cours
    };
}

/* ===============================
   LE GESTE
   =============================== */

/** Le refus, ou null si le trimestre peut être archivé. La garde vit ici, pas seulement au menu. */
function refus(trimestre) {
    var t = _entreeRegistre(trimestre);
    if (!t) return MOTS.refus.introuvable;
    if (t.archive !== true) return MOTS.refus.pasClos;
    return null;
}

/**
 * Archive le trimestre clos `trimestre`. N'écrit rien dans les données ; seule la liste des
 * archives gagne une entrée (après confirmation du fichier, en mode téléchargement).
 * @param {string} trimestre
 * @param {Object} [options] - { sansConfirmation: true } pour les bancs
 */
async function archiverTrimestre(trimestre, options) {
    options = options || {};
    var Reserve = window.Reserve;
    var motif = refus(trimestre);
    if (motif) {
        notifications.erreur(MOTS.refus.titre, motif);
        return { succes: false, refus: motif };
    }
    var t = _entreeRegistre(trimestre);
    var nom = t.nom || trimestre;

    if (!options.sansConfirmation) {
        var fiches = fichesDuTrimestre(trimestre);
        var ids = {};
        var taille = 0;
        var corbeille = 0;
        fiches.forEach(function(x) {
            if (ids[x.fiche.id]) return;
            ids[x.fiche.id] = true;
            taille += x.fiche.tailleFichier || 0;
            if (x.liste === 'corbeilleFichiers') corbeille++;
        });
        var etu = window.db.getSync(trimestre + '_groupeEtudiants', []) || [];
        var ok = await window.uiDialogues.confirmerAction({
            titre: MOTS.confirmation.titre(nom),
            message: MOTS.confirmation.texte({
                etudiants: Array.isArray(etu) ? etu.length : 0,
                groupes: _idsGroupes(trimestre).length,
                copies: Object.keys(ids).length,
                corbeille: corbeille,
                taille: _formaterTaille(taille)
            }),
            texteConfirmer: MOTS.confirmation.bouton,
            preformate: true
        });
        if (!ok) return null;
    }

    // Le dossier des archives, demandé tôt : le clic de la confirmation vaut geste (Chrome).
    var handleReserve;
    try {
        handleReserve = await Reserve.obtenirHandle();
    } catch (eDossier) {
        if (eDossier && eDossier.name === 'DossierRefuse') return null;
        throw eDossier;
    }
    if (!handleReserve && (typeof JSZip === 'undefined' || !window.FichierSortant)) {
        notifications.erreur('Erreur', 'Bibliotheque de compression non chargee.');
        return null;
    }

    var dossier = nomDossier(trimestre);
    if (typeof window.afficherProgression === 'function') window.afficherProgression(MOTS.progression);
    _prog(0, 'Préparation…', dossier);
    await _yield();

    try {
        var collecte = await collecterDonnees(trimestre);
        if (collecte.stats.nombreCles === 0) {
            if (typeof window.masquerProgression === 'function') window.masquerProgression();
            notifications.erreur(MOTS.refus.titre, MOTS.refus.vide);
            return { succes: false, refus: MOTS.refus.vide };
        }
        var donneesJson = JSON.stringify(collecte.donnees);
        var donneesSha = await Reserve.empreinteDuTexte(donneesJson);
        var tailleDonnees = new Blob([donneesJson]).size;
        donneesJson = null;

        var copies = await collecterCopies(collecte.donnees, trimestre);
        var toutesEmpreintes = Object.keys(copies.empreintes).every(function(n) { return !!copies.empreintes[n]; }) &&
            Object.keys(collecte.empreintesCles).every(function(k) { return !!collecte.empreintesCles[k]; });

        var uuid = Reserve.nouvelUuid();
        var dateArchive = new Date().toISOString();
        var mode = handleReserve ? 'fsapi' : 'zip';
        var meta = {
            uuid: uuid,
            type_archive: 'trimestre',
            trimestre: trimestre,
            nom_trimestre: nom,
            dossier: dossier,
            statut: 'verse',
            source: 'application (IndexedDB)',
            mode_archive: mode,
            date_archive: dateArchive,
            appareil: Reserve.appareil(),
            application_version: Reserve.versionApp(),
            integrite: {
                donnees_json_sha256: donneesSha,
                algorithme: donneesSha ? 'SHA-256' : null,
                date_calcul: donneesSha ? dateArchive : null,
                travaux_sha256: toutesEmpreintes ? copies.empreintes : null,
                cles_sha256: toutesEmpreintes ? collecte.empreintesCles : null
            },
            contenu: {
                donnees: true,
                cles: Object.keys(collecte.donnees),
                seances_vivantes: collecte.seances,
                travaux: copies.trouves > 0,
                nombre_etudiants: collecte.stats.nombreEtudiants,
                nombre_groupes: collecte.stats.nombreGroupes,
                nombre_cles: collecte.stats.nombreCles,
                nombre_fichiers_travaux: copies.trouves,
                nombre_fichiers_corbeille: copies.corbeille,
                nombre_fichiers_manquants: copies.manquants,
                taille_donnees_json: tailleDonnees,
                taille_travaux_totale: copies.tailleTotale
            },
            pour_memoire: _pourMemoire(trimestre, collecte.donnees),
            notes: 'Archive du trimestre entier, depuis l’application.'
        };
        var patch = {
            dossier: dossier,
            patch: {
                uuid: uuid,
                type_archive: 'trimestre',
                trimestre: trimestre,
                cours: '',
                nom_cours: '',
                groupe: '',
                statut: 'verse',
                source: 'application (IndexedDB)',
                mode_archive: mode,
                date_archive: dateArchive,
                donnees: true,
                travaux: copies.trouves > 0,
                nombre_etudiants: collecte.stats.nombreEtudiants,
                nombre_fichiers_travaux: copies.trouves,
                taille_travaux_totale: copies.tailleTotale,
                notes: 'Archive du trimestre entier.'
            }
        };

        return await Reserve.deposerArchive({
            handleReserve: handleReserve,
            dossier: dossier,
            donnees: collecte.donnees,
            meta: meta,
            patch: patch,
            blobs: copies.blobs,
            stats: {
                etudiants: collecte.stats.nombreEtudiants,
                cles: collecte.stats.nombreCles,
                fichiersTrouves: copies.trouves,
                fichiersCorbeille: copies.corbeille,
                fichiersManquants: copies.manquants,
                tailleTravaux: copies.tailleTotale
            },
            mots: MOTS
        });
    } catch (err) {
        if (typeof window.masquerProgression === 'function') window.masquerProgression();
        console.error('[Archives] Erreur d’archivage du trimestre :', err);
        notifications.erreur(MOTS.nonArchive, err.message || String(err));
        throw err;
    }
}

/** Action du menu ⋮ d'une carte de la bibliothèque des trimestres (data-param = id). */
function actionArchiver(trimestre) {
    archiverTrimestre(trimestre).catch(function() { /* déjà dit à l'usager */ });
}

window.ReserveTrimestre = {
    MOTS: MOTS,
    // Le nom de l'action du menu ⋮ (dispatcher data-action de main.js).
    ACTION: 'ReserveTrimestre.actionArchiver',
    nomDossier: nomDossier,
    estDansLApplication: function(trimestre) { return !!_entreeRegistre(trimestre); },
    fichesDuTrimestre: fichesDuTrimestre,
    collecterDonnees: collecterDonnees,
    collecterCopies: collecterCopies,
    refus: refus,
    archiverTrimestre: archiverTrimestre,
    actionArchiver: actionArchiver
};

})();
