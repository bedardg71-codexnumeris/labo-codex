/* ===============================
   MODULE EVALUATION-HANDLERS — Wrappers Phase 5 delegation + édition fichier

   Extrait de js/evaluation.js (zone L7240-7256 + L7318-7346 originale,
   session A étape 3 refactor evaluation, 2026-05-18 — beta 99.48 b0518-0720).

   3 fonctions : calculerNoteAlgoSimpleHandler, calculerNoteAlgoCatHandler,
   editerFichierDepuisEvaluation.

   Chargé APRÈS evaluation.js dans index.html — consomme via window.X :
     · window.calculerNoteAlgorithmiqueSimple (résidu evaluation.js zone Calcul)
     · window.calculerNoteAlgorithmiqueAvecCategories (résidu evaluation.js)
     · window.evaluationEnCours (état pivot, créé à la 1re sauvegarde)
     · travauxVisionneuse / travauxResolution / travauxUI (modules externes)
     · afficherSousSection (navigation.js)
   =============================== */

(function() {
'use strict';

/**
 * Lot C de l'enregistrement (D1) — le nombre d'erreurs et le nombre de mots s'enregistrent
 * tout seuls, comme un niveau choisi : seul « Enregistrer » les écrivait, et ils se perdaient
 * au changement d'élève. Armé ICI, dans le geste, et non dans le calcul : la porte du
 * verrouillage recalcule elle aussi (`_forcerRecalculAlgorithmiqueAvantSauvegarde`). Un
 * chargeur qui relance le calcul par `input` passe par ici : les gardes de `_debouncerAutoSave`
 * (suspension, compteur #960) le font taire.
 */
function _armerEnregistrementAutomatique() {
    if (typeof window._debouncerAutoSave === 'function') window._debouncerAutoSave();
}

/** Handler oninput pour calculerNoteAlgorithmiqueSimple(critereId, ponderation, facteur) */
function calculerNoteAlgoSimpleHandler(el) {
    if (typeof window.calculerNoteAlgorithmiqueSimple !== 'function') return;
    window.calculerNoteAlgorithmiqueSimple(
        el.dataset.critereId,
        parseFloat(el.dataset.ponderation),
        parseFloat(el.dataset.facteur)
    );
    _armerEnregistrementAutomatique();
}

/** Handler oninput pour calculerNoteAlgorithmiqueAvecCategories(critereId, ponderation, facteur, critereGrilleId) */
function calculerNoteAlgoCatHandler(el) {
    if (typeof window.calculerNoteAlgorithmiqueAvecCategories !== 'function') return;
    window.calculerNoteAlgorithmiqueAvecCategories(
        el.dataset.critereId,
        parseFloat(el.dataset.ponderation),
        parseFloat(el.dataset.facteur),
        el.dataset.critereGrilleId || ''
    );
    _armerEnregistrementAutomatique();
}

/**
 * Ouvre l'éditeur de pages PDF pour le fichier actuellement chargé.
 * Cherche le fichier via la visionneuse, puis via travauxResolution en fallback.
 */
function editerFichierDepuisEvaluation() {
    var fichier = (typeof travauxVisionneuse !== 'undefined' && typeof travauxVisionneuse.getFichierActuel === 'function')
        ? travauxVisionneuse.getFichierActuel() : null;

    if (!fichier && window.evaluationEnCours) {
        var da = window.evaluationEnCours.etudiantDA;
        var prodId = window.evaluationEnCours.productionId;
        if (da && prodId && typeof travauxResolution !== 'undefined' && typeof travauxResolution.trouverFichierPourEvaluation === 'function') {
            fichier = travauxResolution.trouverFichierPourEvaluation({ etudiantDA: da, productionId: prodId });
        }
    }

    if (!fichier || !fichier.id) {
        console.warn('[Évaluation] Bouton Éditer : aucun fichier trouvé');
        alert('Aucun fichier n’est associé à cette évaluation.');
        return;
    }

    if (typeof afficherSousSection === 'function') {
        afficherSousSection('evaluations-importer');
    }
    setTimeout(function() {
        if (typeof travauxUI !== 'undefined' && typeof travauxUI.ouvrirEditeurPages === 'function') {
            travauxUI.ouvrirEditeurPages(fichier.id);
        }
    }, 300);
}

// Exports window.X
window.calculerNoteAlgoSimpleHandler = calculerNoteAlgoSimpleHandler;
window.calculerNoteAlgoCatHandler = calculerNoteAlgoCatHandler;
window.editerFichierDepuisEvaluation = editerFichierDepuisEvaluation;

})();
