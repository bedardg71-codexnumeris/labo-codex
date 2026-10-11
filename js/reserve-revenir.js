/* ===============================
   MODULE : ARCHIVES — FAIRE REVENIR DES COPIES
   Date : 4 octobre 2026 (lot A3 du chantier des archives, #1000)
   Plan : plans de travail/PLAN-2026-09-30-chantier-archives.md (§ 4, lot A3)
   Consigne : plans de travail/CONSIGNE-DU-JOUR.md (Cowork, 4 oct. 2026, 12 h 19)

   Vocation
     Depuis une archive VÉRIFIÉE dans ce navigateur (lot A2), remettre le fichier de chaque
     copie sous sa fiche. C'est la moitié de la règle 4 de Grégoire : une copie ne quittera
     l'application (lot A4) que si l'archive qui la contient « sait la rendre ».

   Il ne remplace rien et n'efface rien
     Pour chaque copie déclarée dans meta.json (integrite.travaux_sha256), au moment du geste :
     - aucune fiche dans l'application → rien (« sans fiche ») ;
     - la fiche d'un élève supprimé → rien (décision de Grégoire du 2 oct. : un ancien fichier
       ne ramène plus rien de lui) ;
     - le navigateur a le fichier : son empreinte est recalculée ; égale à celle de l'archive →
       rien (« déjà là »), sauf la fiche dite « manquant » qui redevient présente (#997) ;
       différente → rien (« changée depuis l'archive ») : JAMAIS remplacée ;
     - le navigateur n'a pas le fichier : la copie de l'archive est lue, son empreinte
       recalculée ; égale → la copie est écrite, et une fiche « manquant » redevient présente ;
       différente, tronquée ou absente de l'archive → rien (« abîmée »).
     Aucune confiance n'est faite à la vérification d'hier (#1001) : seules entrent des copies
     dont l'empreinte vient d'être recalculée.

   La mémoire
     Une copie à la fois, par les sources du lot A2 (le ZIP n'est jamais chargé en entier) :
     la mémoire prise est celle de la plus grosse copie (ses octets, puis son Blob), pas celle
     du groupe.

   Ce qui est écrit
     Les fichiers des copies revenues (travauxStockage.stockerBlob, le magasin ordinaire des
     copies) ; le statut « manquant » → « present » des fiches dont le fichier est là ;
     rien d'autre. Une copie revenue est une copie ordinaire.

   Dépendances
     - reserve-verifier.js (window.ReserveVerifier) : sources, empreintes, état « vérifiée »
     - reserve.js (window.Reserve) : lireManifesteLocal, supporteFSAPI, obtenirHandle
     - travaux-stockage.js (window.travauxStockage) : recupererBlob, stockerBlob
     - import-export.js (window.dasElevesEcartes) : les élèves supprimés du trimestre de l'archive
     - reserve-copies.js (window.ReserveCopies, #1028) : lever la marque des copies revenues
     - db.js, progression.js, ui-dialogues.js, utils-notifications.js
   =============================== */

(function() {
'use strict';

/* ===============================
   LES MOTS — UN SEUL ENDROIT
   ===============================
   Acceptés par Grégoire le 4 oct. 2026 (consigne de Cowork de 12 h 47), avec une retouche :
   « étudiant·e supprimé·e ».
*/
var MOTS = {
    bouton: 'Faire revenir',
    infobulle: 'Remettre dans l\'application les copies de cette archive',
    enCours: 'Retour des copies…',
    compte: function(n, m) { return n + ' copies sur ' + m; },
    fenetre: {
        titre: 'Faire revenir les copies',
        texte: function(m) {
            return 'Les copies de cette archive (' + m + ') reviennent sous leurs fiches, quand le fichier n\'est plus dans l\'application.\n\n' +
                'Rien n\'est remplacé ni effacé : une copie déjà là, ou qui a changé depuis l\'archive, reste telle quelle.';
        },
        confirmer: 'Faire revenir'
    },
    bilan: {
        titre: 'Copies revenues',
        titreAbimee: 'Copies revenues, archive abîmée',
        enTeteAbimee: function(n) { return n + (n > 1 ? ' copies de l\'archive sont abîmées' : ' copie de l\'archive est abîmée') + ' : elle' + (n > 1 ? 's ne sont pas revenues' : ' n\'est pas revenue') + '. Vérifie de nouveau cette archive.'; },
        revenues: function(n) { return n + (n > 1 ? ' copies revenues' : ' copie revenue'); },
        dejaLa: function(n) { return n + (n > 1 ? ' copies déjà là' : ' copie déjà là'); },
        changees: function(n) { return n + (n > 1 ? ' copies changées depuis l\'archive, laissées telles quelles' : ' copie changée depuis l\'archive, laissée telle quelle'); },
        sansFiche: function(n) { return n + (n > 1 ? ' copies sans fiche dans l\'application' : ' copie sans fiche dans l\'application'); },
        supprimes: function(n) { return n + (n > 1 ? ' copies d\'étudiant·es supprimé·es' : ' copie d\'un·e étudiant·e supprimé·e'); },
        nonEcrites: function(n) { return n + (n > 1 ? ' copies n\'ont pas pu être écrites' : ' copie n\'a pas pu être écrite') + ' (espace du navigateur ?)'; }
    },
    refus: {
        titre: 'Impossible de faire revenir les copies',
        nonVerifiee: 'Cette archive n\'est pas vérifiée dans ce navigateur. Vérifie-la d\'abord.',
        changeeDepuis: 'Cette archive a changé depuis sa vérification. Vérifie-la de nouveau.',
        sansEmpreintes: 'Cette archive date d\'avant les empreintes : ses copies ne peuvent pas revenir. Archive de nouveau ce groupe.',
        sansMagasin: 'Le stockage des copies n\'est pas disponible dans cette page.'
    }
};

/* ===============================
   LE RETOUR
   =============================== */

function _yield() {
    return new Promise(function(resolve) { setTimeout(resolve, 0); });
}

async function _octets(blob) {
    return new Uint8Array(await blob.arrayBuffer());
}

/** Les DA des élèves supprimés du trimestre DE L'ARCHIVE (pas forcément le trimestre affiché). */
function _supprimesDuTrimestre(trimestre) {
    if (typeof window.dasElevesEcartes !== 'function') return new Set();
    return window.dasElevesEcartes(
        window.db.getSync(trimestre + '_elevesDesinscrits', []) || [],
        window.db.getSync(trimestre + '_groupeEtudiants', []) || []
    );
}

/**
 * Fait revenir les copies d'une archive. Écrit les copies revenues et remet « present » les
 * fiches dont le fichier est là ; rien d'autre.
 * @param {Object} source - ReserveVerifier.sourceFichier(...) ou sourceDossier(...)
 * @param {Object} entree - l'entrée de la liste locale (uuid, trimestre, verification, …)
 * @param {Function} [onProg] - (copiesFaites, total)
 * @returns {Promise<Object>} bilan : etat ∈ fait | refus ; compteurs ; ids par cas
 */
async function faireRevenir(source, entree, onProg) {
    onProg = onProg || function() {};
    var RV = window.ReserveVerifier;
    var bilan = {
        etat: null, motif: null, total: 0,
        revenues: [], dejaLa: [], changees: [], sansFiche: [], supprimes: [], abimees: [], nonEcrites: [],
        fichesRemises: 0
    };
    if (!window.travauxStockage || typeof window.travauxStockage.stockerBlob !== 'function') {
        bilan.etat = 'refus'; bilan.motif = 'sansMagasin'; return bilan;
    }

    await source.ouvrir();
    var metaTexte = await source.lireTexte('meta.json');
    if (metaTexte == null) throw new Error(RV.MOTS.erreurs.sansMeta);
    var meta;
    try { meta = JSON.parse(metaTexte); } catch (e) { throw new Error(RV.MOTS.erreurs.metaIllisible); }
    if (!meta || typeof meta !== 'object') throw new Error(RV.MOTS.erreurs.metaIllisible);

    // C'est CETTE archive, et telle qu'elle a été vérifiée.
    if (entree.uuid && meta.uuid && entree.uuid !== meta.uuid) {
        bilan.etat = 'refus'; bilan.motif = 'autreArchive'; return bilan;
    }
    var v = entree.verification || {};
    if (v.meta_sha256 && (await RV.sha256Texte(metaTexte)) !== v.meta_sha256) {
        bilan.etat = 'refus'; bilan.motif = 'changeeDepuis'; return bilan;
    }
    var empreintes = meta.integrite && meta.integrite.travaux_sha256;
    if (!empreintes || typeof empreintes !== 'object') {
        bilan.etat = 'refus'; bilan.motif = 'sansEmpreintes'; return bilan;
    }

    var trimestre = entree.trimestre;
    var cleFT = trimestre + '_fichiersTravaux';
    var fiches = (await window.db.get(cleFT, [])) || [];
    var parId = {};
    (Array.isArray(fiches) ? fiches : []).forEach(function(f) { if (f && f.id && !parId[f.id]) parId[f.id] = f; });
    // #1028 : l'archive d'un trimestre entier range aussi la corbeille ; ses copies aux archives
    // reviennent sous leur fiche de la corbeille.
    if (entree.type_archive === 'trimestre') {
        var corbeille = (await window.db.get(trimestre + '_corbeilleFichiers', [])) || [];
        (Array.isArray(corbeille) ? corbeille : []).forEach(function(f) { if (f && f.id && !parId[f.id]) parId[f.id] = f; });
    }
    var supprimes = _supprimesDuTrimestre(trimestre);
    var presentes = {};
    (await source.listerCopies()).forEach(function(c) { if (!RV.fichierDuSysteme(c.nom)) presentes[c.nom] = true; });

    var noms = Object.keys(empreintes);
    bilan.total = noms.length;
    var aRemettre = {};

    for (var i = 0; i < noms.length; i++) {
        var nom = noms[i];
        var id = RV.idDeLaCopie(nom);
        var fiche = parId[id];
        onProg(i, noms.length);

        if (!fiche) { bilan.sansFiche.push(id); continue; }
        if (fiche.etudiantDA && supprimes.has(String(fiche.etudiantDA))) { bilan.supprimes.push(id); continue; }

        // Le navigateur a-t-il déjà un fichier ? Son empreinte, au moment du geste.
        var chezNous = null;
        try { chezNous = await window.travauxStockage.recupererBlob(id); } catch (e) { chezNous = null; }
        if (chezNous) {
            if (!(chezNous instanceof Blob)) chezNous = new Blob([chezNous]);
            var empreinteIci = await RV.sha256(await _octets(chezNous));
            chezNous = null;
            if (empreinteIci === empreintes[nom]) {
                bilan.dejaLa.push(id);
                if (fiche.blobStatut === 'manquant') aRemettre[id] = true;
            } else {
                bilan.changees.push(id);
            }
            continue;
        }

        // Le fichier manque : la copie de l'archive, recomparée à son empreinte.
        if (!presentes[nom]) { bilan.abimees.push(id); continue; }
        var lu = await source.lireCopie(nom);
        if (lu.probleme) { bilan.abimees.push(id); continue; }
        // Le Blob est fait AVANT l'empreinte : le calcul rend le tampon des octets.
        var blob = new Blob([lu.octets], { type: fiche.typeMIME || '' });
        var empreinteArchive = await RV.sha256(lu.octets);
        lu = null;
        if (empreinteArchive !== empreintes[nom]) { bilan.abimees.push(id); continue; }
        try {
            await window.travauxStockage.stockerBlob(id, blob, fiche.etudiantDA || '', fiche.productionId || '', { notifier: false });
            // Revenue se lit au magasin lui-même, pas dans l'absence d'erreur.
            var relu = await window.travauxStockage.recupererBlob(id);
            if (relu && (relu.size === undefined || relu.size === blob.size)) {
                bilan.revenues.push(id);
                if (fiche.blobStatut === 'manquant') aRemettre[id] = true;
            } else {
                bilan.nonEcrites.push(id);
            }
        } catch (e) {
            console.warn('[Archives] Copie non écrite : ' + id, e && e.message || e);
            bilan.nonEcrites.push(id);
        }
        blob = null;
        if (i % 5 === 4) await _yield();
    }
    onProg(noms.length, noms.length);

    // Les fiches « manquant » dont le fichier est là redeviennent présentes (#997, par le geste).
    var ids = Object.keys(aRemettre);
    if (ids.length > 0) {
        // #522 lot 7 : dans la file de la clé ; n'écrit que si une fiche change, comme avant.
        await window.db.modifier(cleFT, function(liste) {
            if (!Array.isArray(liste)) return undefined;
            var remises = 0;
            liste.forEach(function(f) {
                if (f && aRemettre[f.id] && f.blobStatut === 'manquant') { f.blobStatut = 'present'; remises++; }
            });
            bilan.fichesRemises = remises;
            return remises > 0 ? liste : undefined;
        }, []);
    }
    if ((bilan.revenues.length > 0 || bilan.fichesRemises > 0) && window.signalerEcritureUsager) {
        window.signalerEcritureUsager(cleFT);
    }
    // #1028 : la marque « aux archives » des copies dont le fichier est là est levée.
    if (window.ReserveCopies && window.ReserveCopies.idsMarques(trimestre).length) {
        bilan.restentAuxArchives = (await window.ReserveCopies.lever(trimestre)).length;
    }
    bilan.etat = 'fait';
    return bilan;
}

/* ===============================
   LE COMPTE RENDU À L'USAGER
   =============================== */

function compteRendu(bilan) {
    var RV = window.ReserveVerifier;
    if (bilan.etat === 'refus') {
        if (bilan.motif === 'autreArchive') return { titre: RV.MOTS.autreArchive.titre, message: RV.MOTS.autreArchive.texte };
        return { titre: MOTS.refus.titre, message: MOTS.refus[bilan.motif] || '' };
    }
    var lignes = [];
    var abimees = bilan.abimees.length;
    if (abimees) lignes.push(MOTS.bilan.enTeteAbimee(abimees), '');
    lignes.push(MOTS.bilan.revenues(bilan.revenues.length));
    if (bilan.dejaLa.length) lignes.push(MOTS.bilan.dejaLa(bilan.dejaLa.length));
    if (bilan.changees.length) lignes.push(MOTS.bilan.changees(bilan.changees.length));
    if (bilan.sansFiche.length) lignes.push(MOTS.bilan.sansFiche(bilan.sansFiche.length));
    if (bilan.supprimes.length) lignes.push(MOTS.bilan.supprimes(bilan.supprimes.length));
    if (bilan.nonEcrites.length) lignes.push(MOTS.bilan.nonEcrites(bilan.nonEcrites.length));
    return { titre: abimees ? MOTS.bilan.titreAbimee : MOTS.bilan.titre, message: lignes.join('\n') };
}

/* ===============================
   LE GESTE, DEPUIS L'ÉCRAN « ARCHIVES »
   =============================== */

function _prog(pct, detail, stats) {
    if (typeof window.majProgression === 'function') window.majProgression(pct, detail, stats);
}

async function _informer(cr) {
    if (window.uiDialogues && typeof window.uiDialogues.informer === 'function') {
        await window.uiDialogues.informer({ titre: cr.titre, message: cr.message, preformate: true });
    }
}

/** La fenêtre, puis le retour, puis le bilan. La source est déjà choisie (geste actif, #995). */
async function _executer(entree, source) {
    var confirme = window.uiDialogues && typeof window.uiDialogues.confirmerAction === 'function'
        ? await window.uiDialogues.confirmerAction({
            titre: MOTS.fenetre.titre,
            message: MOTS.fenetre.texte(entree.verification && entree.verification.nombre_copies || entree.nombre_fichiers_travaux || 0),
            texteConfirmer: MOTS.fenetre.confirmer,
            preformate: true
        })
        : true;
    if (!confirme) return null;

    if (typeof window.afficherProgression === 'function') window.afficherProgression(MOTS.enCours, entree.dossier || '');
    _prog(0, MOTS.enCours, '');
    var bilan;
    try {
        bilan = await faireRevenir(source, entree, function(n, m) {
            _prog(m ? Math.round((n / m) * 100) : 100, MOTS.enCours, MOTS.compte(n, m));
        });
    } catch (e) {
        if (typeof window.masquerProgression === 'function') window.masquerProgression();
        console.error('[Archives] Retour des copies échoué :', e);
        notifications.erreur(window.ReserveVerifier.MOTS.illisible.titre, e.message || String(e));
        return null;
    }
    if (typeof window.masquerProgression === 'function') window.masquerProgression();
    await _informer(compteRendu(bilan));
    return bilan;
}

/**
 * Action du bouton « Faire revenir » d'une ligne de la liste (data-action, data-param = dossier).
 * Offert seulement pour une archive vérifiée dans ce navigateur ; la garde est aussi ICI.
 */
function actionFaireRevenir(dossier) {
    var Reserve = window.Reserve;
    var RV = window.ReserveVerifier;
    if (!dossier || !Reserve || typeof Reserve.lireManifesteLocal !== 'function' || !RV) return;
    var entree = Reserve.lireManifesteLocal().archives[dossier];
    if (!entree) {
        notifications.erreur(RV.MOTS.illisible.titre, RV.MOTS.erreurs.nonListee);
        return;
    }
    entree = Object.assign({ dossier: dossier }, entree);
    // L'archive d'un trimestre entier n'a ce bouton que quand le trimestre est dans l'application
    // et que des copies y sont aux archives (#1028, reserve-reglages.js) ; sinon son retour est E2.
    if (!RV.etatVerification(entree).verifiee) {
        _informer({ titre: MOTS.refus.titre, message: MOTS.refus.nonVerifiee });
        return;
    }
    if (entree.mode_archive === 'fsapi' && typeof Reserve.supporteFSAPI === 'function' && Reserve.supporteFSAPI()) {
        Reserve.obtenirHandle().then(function(handle) {
            if (!handle) return;
            return _executer(entree, RV.sourceDossier(handle, dossier));
        }).catch(function(e) {
            if (e && e.name === 'DossierRefuse') return; // le garde-fou du dossier a déjà parlé
            console.error('[Archives] Retour des copies (dossier) échoué :', e);
            notifications.erreur(RV.MOTS.illisible.titre, e && e.message || String(e));
        });
        return;
    }
    RV.choisirFichier(function(fichier) {
        _executer(entree, RV.sourceFichier(fichier));
    });
}

window.ReserveRevenir = {
    MOTS: MOTS,
    faireRevenir: faireRevenir,
    compteRendu: compteRendu,
    executer: _executer,
    actionFaireRevenir: actionFaireRevenir
};

})();
