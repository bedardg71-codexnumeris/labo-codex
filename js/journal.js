/* ===============================
   MODULE JOURNAL DE BORD DES PRODUCTIONS
   Version: 2026032001

   Traçabilité complète de chaque évaluation :
   import → évaluation → tampons → jetons → modifications → export.

   Le journal est un tableau d'entrées stocké directement
   dans l'objet évaluation (evaluation.journal[]).
   Aucune clé IDB séparée — le journal voyage avec l'évaluation
   dans backup, codex et import/export.
   =============================== */

(function() {
'use strict';

// ============================================
// CONSTANTES
// ============================================

var MAX_ENTREES = 100;

var ACTIONS = {
    IMPORT: 'import',
    EVALUATION_DEBUT: 'evaluation_debut',
    EVALUATION_FIN: 'evaluation_fin',
    TAMPONS: 'tampons',
    CODES_IDME: 'codes_idme',
    JETON_APPLIQUE: 'jeton_applique',
    MODIFICATION_POST_REPRISE: 'modification_post_reprise',
    RETROACTION_GENEREE: 'retroaction_generee',
    EXPORT: 'export',
    VERROUILLAGE: 'verrouillage',
    DEVERROUILLAGE: 'deverrouillage'
};

var LABELS_ACTIONS = {
    'import': 'Import du fichier',
    'evaluation_debut': 'Début de l\'évaluation',
    'evaluation_fin': 'Évaluation terminée',
    'tampons': 'Tampons diagnostiques',
    'codes_idme': 'Codes IDME',
    'jeton_applique': 'Jeton appliqué',
    'modification_post_reprise': 'Modification post-reprise',
    'retroaction_generee': 'Rétroaction générée',
    'export': 'Export',
    'verrouillage': 'Verrouillage',
    'deverrouillage': 'Déverrouillage'
};

var COULEURS_ACTIONS = {
    'import': 'var(--info)',
    'evaluation_debut': 'var(--primaire)',
    'evaluation_fin': 'var(--succes)',
    'tampons': 'var(--avertissement)',
    'codes_idme': 'var(--primaire)',
    'jeton_applique': 'var(--info)',
    'modification_post_reprise': 'var(--avertissement)',
    'retroaction_generee': 'var(--succes)',
    'export': 'var(--info)',
    'verrouillage': 'var(--texte-secondaire)',
    'deverrouillage': 'var(--texte-secondaire)'
};

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Ajoute une entrée au journal d'une évaluation (in-memory).
 * L'évaluation doit être sauvegardée séparément par l'appelant.
 * @param {Object} evaluation - L'objet évaluation (modifié in-place)
 * @param {string} action - Une des clés de ACTIONS
 * @param {Object} [details] - Détails libres de l'action
 */
function ajouterEntree(evaluation, action, details) {
    if (!evaluation || !action) return;

    if (!evaluation.journal) {
        evaluation.journal = [];
    }

    var entree = {
        date: new Date().toISOString(),
        action: action,
        details: details || {}
    };

    evaluation.journal.push(entree);

    // Cap à MAX_ENTREES — garder les plus récentes
    if (evaluation.journal.length > MAX_ENTREES) {
        evaluation.journal = evaluation.journal.slice(-MAX_ENTREES);
    }
}

/**
 * Lit le journal d'une évaluation depuis IDB.
 * @param {string} evaluationId
 * @returns {Array} Le journal ou []
 */
function obtenirJournal(evaluationId) {
    if (!evaluationId) return [];
    var evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    var evaluation = evaluations.find(function(e) { return e.id === evaluationId; });
    return (evaluation && evaluation.journal) || [];
}

/**
 * Capture la fin d'évaluation : crée les entrées evaluation_fin + codes_idme + tampons.
 * @param {Object} evaluation - L'objet évaluation (modifié in-place)
 * @param {number|null} dureeMs - Durée en ms du chrono
 */
function capturerFinEvaluation(evaluation, dureeMs) {
    if (!evaluation) return;

    // 1. Entrée evaluation_fin
    ajouterEntree(evaluation, ACTIONS.EVALUATION_FIN, {
        dureeMs: dureeMs || null,
        dureeSec: dureeMs ? Math.round(dureeMs / 1000) : null,
        noteFinale: evaluation.noteFinale,
        // #941 lot S1 — une copie en points n'a pas de niveau à journaliser (décision A) ; les
        // entrées déjà écrites restent telles quelles.
        niveauFinal: (typeof niveauFinalAffichable === 'function') ? niveauFinalAffichable(evaluation) : evaluation.niveauFinal,
        statutIntegrite: evaluation.statutIntegrite
    });

    // 2. Entrée codes_idme (critères évalués)
    if (evaluation.criteres && evaluation.criteres.length > 0) {
        var criteresResume = evaluation.criteres.map(function(c) {
            return { critereId: c.critereId, niveau: c.niveauSelectionne };
        });
        ajouterEntree(evaluation, ACTIONS.CODES_IDME, {
            criteres: criteresResume
        });
    }

    // 3. Entrée tampons (annotations visuelles)
    try {
        var fichierActuel = (typeof travauxVisionneuse !== 'undefined' && travauxVisionneuse.getFichierActuel)
            ? travauxVisionneuse.getFichierActuel() : null;
        if (fichierActuel) {
            var annotationFichier = (typeof travauxStockage !== 'undefined')
                ? travauxStockage.obtenirAnnotationFichier(fichierActuel.id) : null;
            if (annotationFichier) {
                var statsAnnot = (typeof travauxExportPDF !== 'undefined' && travauxExportPDF.compterAnnotationsDetailees)
                    ? travauxExportPDF.compterAnnotationsDetailees(annotationFichier) : null;
                if (statsAnnot && (statsAnnot.totalTampons > 0 || statsAnnot.totalErreursFr > 0)) {
                    ajouterEntree(evaluation, ACTIONS.TAMPONS, {
                        tampons: statsAnnot.tampons,
                        erreursFr: statsAnnot.erreursFr,
                        totalTampons: statsAnnot.totalTampons,
                        totalErreursFr: statsAnnot.totalErreursFr
                    });
                }
            }
        }
    } catch (e) {
        console.warn('[Journal] Erreur capture tampons:', e);
    }
}

// ============================================
// PHASE 3 — MODALE JOURNAL (UI)
// ============================================

/**
 * Formate une entrée du journal en HTML.
 * @param {Object} entree - { date, action, details }
 * @returns {string} HTML
 */
function formaterEntreeJournal(entree) {
    if (!entree) return '';

    var dateObj = new Date(entree.date);
    var dateStr = dateObj.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
    var heureStr = dateObj.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
    var label = LABELS_ACTIONS[entree.action] || entree.action;
    var couleur = COULEURS_ACTIONS[entree.action] || 'var(--texte-secondaire)';

    var detailsHtml = '';
    var d = entree.details;

    switch (entree.action) {
        case ACTIONS.EVALUATION_FIN:
            if (d.dureeSec) {
                var min = Math.floor(d.dureeSec / 60);
                var sec = d.dureeSec % 60;
                detailsHtml += '<span class="journal-detail">Durée : ' + min + ' min ' + sec + ' s</span>';
            }
            if (d.noteFinale !== undefined) {
                detailsHtml += '<span class="journal-detail">Note : ' + formaterNotePourcentage(d.noteFinale) + '</span>';
            }
            if (d.niveauFinal) {
                detailsHtml += '<span class="journal-detail">Niveau : ' + d.niveauFinal + '</span>';
            }
            if (d.modification) {
                detailsHtml += '<span class="journal-detail journal-detail--modif">Modification</span>';
            }
            break;

        case ACTIONS.CODES_IDME:
            if (d.criteres && d.criteres.length > 0) {
                detailsHtml += '<span class="journal-detail">' + d.criteres.length + ' critère(s) évalué(s)</span>';
                var niveaux = d.criteres.map(function(c) { return c.niveau; }).join(', ');
                detailsHtml += '<span class="journal-detail">' + niveaux + '</span>';
            }
            break;

        case ACTIONS.TAMPONS:
            if (d.totalTampons) {
                detailsHtml += '<span class="journal-detail">' + d.totalTampons + ' tampon(s)</span>';
            }
            if (d.totalErreursFr) {
                detailsHtml += '<span class="journal-detail">' + d.totalErreursFr + ' erreur(s) de français</span>';
            }
            break;

        case ACTIONS.JETON_APPLIQUE:
            if (d.type) {
                var typeLabel = d.type === 'reprise' ? 'Jeton de reprise' :
                    d.type === 'reprise_ciblee' ? 'Jeton de reprise ciblée' :
                    d.type === 'delai' ? 'Jeton de délai' : d.type;
                detailsHtml += '<span class="journal-detail">' + typeLabel + '</span>';
            }
            break;

        case ACTIONS.MODIFICATION_POST_REPRISE:
            if (d.avant && d.apres) {
                if (d.avant.noteFinale !== d.apres.noteFinale) {
                    detailsHtml += '<span class="journal-detail">Note : ' + formaterNotePourcentage(d.avant.noteFinale) + ' → ' + formaterNotePourcentage(d.apres.noteFinale) + '</span>';
                }
                if (d.avant.niveauFinal !== d.apres.niveauFinal) {
                    detailsHtml += '<span class="journal-detail">Niveau : ' + d.avant.niveauFinal + ' → ' + d.apres.niveauFinal + '</span>';
                }
            }
            break;
    }

    return '<div class="journal-entree">' +
        '<div class="journal-entree-pastille" style="background:' + couleur + '"></div>' +
        '<div class="journal-entree-contenu">' +
            '<div class="journal-entree-date">' + dateStr + ' à ' + heureStr + '</div>' +
            '<div class="journal-entree-action">' + label + '</div>' +
            (detailsHtml ? '<div class="journal-entree-details">' + detailsHtml + '</div>' : '') +
        '</div>' +
    '</div>';
}

/**
 * Affiche la modale journal pour une évaluation.
 * @param {string} evaluationId
 */
function afficherJournal(evaluationId) {
    if (!evaluationId) return;

    var evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    var evaluation = evaluations.find(function(e) { return e.id === evaluationId; });
    if (!evaluation) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    var journal = evaluation.journal || [];
    var nomEtudiant = evaluation.etudiantNom || 'Étudiant inconnu';
    var nomProduction = evaluation.productionNom || 'Production';

    // Construire le contenu
    var contenuHtml = '';
    if (journal.length === 0) {
        contenuHtml = '<div class="journal-vide">Aucune entrée dans le journal.<br>Les entrées seront ajoutées automatiquement lors des prochaines actions.</div>';
    } else {
        contenuHtml = '<div class="journal-timeline">';
        // Chronologique (plus ancien en haut)
        for (var i = 0; i < journal.length; i++) {
            contenuHtml += formaterEntreeJournal(journal[i]);
        }
        contenuHtml += '</div>';
    }

    // Créer la modale
    var overlay = document.getElementById('journal-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'journal-modal-overlay';
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
    }

    overlay.innerHTML =
        '<div class="journal-modal">' +
            '<div class="journal-modal-entete">' +
                '<h3>Journal de bord</h3>' +
                '<span class="journal-modal-sous-titre">' + nomEtudiant + ' – ' + nomProduction + '</span>' +
                '<button class="journal-modal-fermer" data-action="Journal.fermerJournal" title="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>' +
            '</div>' +
            '<div class="journal-modal-corps">' + contenuHtml + '</div>' +
        '</div>';

    overlay.classList.add('actif');
}

/**
 * Ferme la modale journal.
 */
function fermerJournal() {
    var overlay = document.getElementById('journal-modal-overlay');
    if (overlay) {
        overlay.classList.remove('actif');
    }
}

// ============================================
// PHASE 4 — EXPORT ANONYMISÉ
// ============================================

/**
 * Exporte une expérience anonymisée (toutes les évaluations avec journal).
 * Génère un ZIP téléchargeable contenant un JSON anonymisé.
 */
function exporterExperienceAnonymisee() {
    // ACCÈS DIRECT INTENTIONNEL — export complet, doit lire TOUTES les évaluations du trimestre
    var evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    if (!evaluations || evaluations.length === 0) {
        notifications.erreur('Aucune donnée', 'Aucune évaluation à exporter');
        return;
    }

    // Salt aléatoire pour cette session d'export
    var salt = '';
    try {
        var arr = new Uint8Array(8);
        crypto.getRandomValues(arr);
        salt = Array.from(arr).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    } catch (e) {
        salt = Math.random().toString(36).substring(2, 10);
    }

    // Map DA → pseudonyme consistant
    var daMap = {};
    var compteur = 1;

    var evalAnonymisees = evaluations.map(function(ev) {
        var da = ev.etudiantDA || '';
        if (!daMap[da]) {
            daMap[da] = 'USR_' + salt + '_ETU_' + String(compteur++).padStart(3, '0');
        }

        return {
            id: ev.id,
            etudiantPseudo: daMap[da],
            productionId: ev.productionId,
            productionNom: ev.productionNom,
            grilleId: ev.grilleId,
            grilleNom: ev.grilleNom,
            dateEvaluation: ev.dateEvaluation,
            dateCreation: ev.dateCreation,
            dateModification: ev.dateModification,
            dureeEvaluation: ev.dureeEvaluation,
            noteFinale: ev.noteFinale,
            niveauFinal: ev.niveauFinal,
            statutIntegrite: ev.statutIntegrite,
            statutRemise: ev.statutRemise,
            criteres: (ev.criteres || []).map(function(c) {
                return {
                    critereId: c.critereId,
                    critereNom: c.critereNom,
                    niveauSelectionne: c.niveauSelectionne,
                    ponderation: c.ponderation
                    // retroaction supprimée (texte libre)
                };
            }),
            verrouillee: ev.verrouillee,
            jetonRepriseApplique: ev.jetonRepriseApplique,
            jetonRepriseCibleeApplique: ev.jetonRepriseCibleeApplique,
            jetonDelaiApplique: ev.jetonDelaiApplique,
            remplaceeParId: ev.remplaceeParId,
            journal: (ev.journal || []).map(function(j) {
                return {
                    date: j.date,
                    action: j.action,
                    details: j.details || {}
                };
            })
            // Champs supprimés : etudiantNom, etudiantDA, notesIntegrite, retroactionFinale
        };
    });

    var exportId = 'EXP_' + salt + '_' + Date.now().toString(36).toUpperCase();
    var payload = {
        type: 'monitorage-experience',
        version: 1,
        exportId: exportId,
        dateExport: new Date().toISOString(),
        nombreEvaluations: evalAnonymisees.length,
        evaluations: evalAnonymisees
    };

    var jsonStr = JSON.stringify(payload, null, 2);
    var blob = new Blob([jsonStr], { type: 'application/json' });
    var nomFichier = 'experience_' + exportId + '.json';

    // Télécharger directement (pas de ZIP pour simplifier)
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);

    notifications.succes('Expérience exportée (' + evalAnonymisees.length + ' évaluations anonymisées)');
}

// ============================================
// API PUBLIQUE
// ============================================

window.Journal = {
    ACTIONS: ACTIONS,
    ajouterEntree: ajouterEntree,
    obtenirJournal: obtenirJournal,
    capturerFinEvaluation: capturerFinEvaluation,
    formaterEntreeJournal: formaterEntreeJournal,
    afficherJournal: afficherJournal,
    fermerJournal: fermerJournal,
    exporterExperienceAnonymisee: exporterExperienceAnonymisee
};

})();
