/* ===============================
   ENTITÉ : RÉCONCILIATION DES ÉVALUATIONS (prévention doublons #360)

   Problème : pour un couple (etudiantDA, productionId), plusieurs évaluations
   ACTIVES (sans `remplaceeParId`) peuvent coexister. Deux cas se ressemblent :
   - REPRISE LÉGITIME : signée (repriseDeId / jetonRepriseApplique, ou les
     variantes ciblées) → à conserver telle quelle.
   - DOUBLON ORPHELIN : re-sauvegarde empilée SANS marque, née d'un re-clic
     intra-session ou d'une non-persistance silencieuse au reload. Quand il est
     NOTE-ÉGALE à une autre active, il double-compte la production (top-N, somme
     pondérée, consolidation, flag dépistage) sans rien apporter.

   Ce module expose UNE fonction pure de réconciliation, SSOT appelée depuis les
   deux chemins de sauvegarde (manuel + auto-save) et, plus tard, le diagnostic
   rétroactif. Elle marque les surnuméraires NOTE-ÉGALE avec `remplaceeParId`
   (le moteur les exclut alors, comportement INCHANGÉ) PLUS un drapeau
   discriminant `reconcilieParDoublon` (Option A, décision §3.2 du plan #360)
   que les writers de reprise (`restaurerOriginaleSiReprise`, `retirerJetonReprise`)
   apprennent à IGNORER — sinon le marqueur de réconciliation serait pris pour une
   « originale archivée par une reprise », rouvrant le bug qu'on prétend fermer.

   LIMITE ASSUMÉE : seuls les surnuméraires NOTE-ÉGALE sont réconciliés. Un
   orphelin re-noté DIVERGENT (ex. Fictivam : 77,3 / 79, validé Omnivox) est laissé
   intact — le code n'a aucun champ pour distinguer une double remise volontaire
   d'un orphelin re-noté. Décision actée : ne JAMAIS trancher un divergent.

   Mémoire : [[distinguer-reprises-doublons]],
   [[audit-integrite-reconstruction-2026-06-27]]. Plan :
   `plans de travail/PLAN-360-prevention-doublons-evals.md`.
   =============================== */

(function() {
'use strict';

/**
 * Une éval porte-t-elle une marque de reprise (l'une des QUATRE) ?
 * Une reprise est légitime — jamais à marquer comme doublon. La variante
 * CIBLÉE copie la `noteFinale` de l'originale jusqu'au re-notage : sans cette
 * exclusion elle serait note-égale à son originale et marquée à tort.
 */
function _porteMarqueDeReprise(e) {
    return !!(e.repriseDeId
        || e.jetonRepriseApplique
        || e.repriseDeIdCiblee
        || e.jetonRepriseCibleeApplique);
}

/**
 * Prédicat « active au sens MOTEUR » restreint à un couple (da, pid).
 * Reproduit `_filtrerEvaluationsArtefactsValides` (profil-etudiant-actions.js) :
 * !remplaceeParId + noteFinale non null/undefined + statutIntegrite ∉ {plagiat,ia}.
 * Toute divergence ici fabriquerait des faux positifs/négatifs de réconciliation.
 */
function _estActiveMoteur(e, da, pid) {
    if (!e) return false;
    if (e.etudiantDA !== da) return false;
    if (e.productionId !== pid) return false;
    if (e.remplaceeParId) return false;
    if (e.noteFinale === null || e.noteFinale === undefined) return false;
    const statut = e.statutIntegrite || 'recevable';
    if (statut === 'plagiat' || statut === 'ia') return false;
    return true;
}

/**
 * Note normalisée à 1 décimale. Sans ça, un import a2025 stockant 77.30 vs
 * 77.3000001 passerait pour divergent et ne serait pas réconcilié.
 */
function _noteNormalisee(n) {
    return Math.round(n * 10) / 10;
}

/**
 * Choisit le SURVIVANT d'un groupe note-égale selon la même priorité que
 * `_trouverEvaluationActive` (profil-etudiant-sections-affichage.js) :
 * reprise ciblée > reprise normale > la première en ordre de disque (stable).
 */
function _choisirSurvivant(groupe) {
    return groupe.find(e => e.jetonRepriseCibleeApplique === true)
        || groupe.find(e => e.repriseDeId)
        || groupe[0];
}

/**
 * Réconcilie les actives NOTE-ÉGALE d'un couple (da, pid) : mutation IN-PLACE.
 * Marque chaque surnuméraire note-égale (qui n'est ni une reprise ni verrouillée)
 * avec `remplaceeParId = <id survivant>` + `reconcilieParDoublon: true`.
 *
 * @param {Array} evaluations - toutes les évaluations (muté en place)
 * @param {string} etudiantDA
 * @param {string} productionId
 * @returns {{modifie: boolean, marquees: string[]}}
 */
function reconcilierActivesNoteEgale(evaluations, etudiantDA, productionId) {
    const resultat = { modifie: false, marquees: [] };
    if (!Array.isArray(evaluations) || !etudiantDA || !productionId) return resultat;

    // 1. Actives au sens moteur pour ce couple (ordre de disque préservé).
    const actives = evaluations.filter(e => _estActiveMoteur(e, etudiantDA, productionId));
    if (actives.length < 2) return resultat;

    // 2. Grouper par note normalisée. Un groupe de taille 1 = note unique → on n'y
    //    touche pas (c'est le cas « Fictivam divergent » qui doit rester intact).
    const groupes = new Map();
    for (const e of actives) {
        const k = _noteNormalisee(e.noteFinale);
        if (!groupes.has(k)) groupes.set(k, []);
        groupes.get(k).push(e);
    }

    const horodatage = new Date().toISOString();

    for (const groupe of groupes.values()) {
        if (groupe.length < 2) continue;

        const survivant = _choisirSurvivant(groupe);
        // Le prédicat moteur est truthy : un id vide ('', 0, false) laisserait la
        // surnuméraire dans le pool → refuser de marquer si pas d'id survivant net.
        if (!survivant || !survivant.id) continue;

        for (const e of groupe) {
            if (e === survivant) continue;
            // 3. Ne JAMAIS marquer une reprise légitime (les 4 marques)...
            if (_porteMarqueDeReprise(e)) continue;
            // ...ni une éval verrouillée (invariant lecture-seule #348/#350)...
            if (e.verrouillee === true) continue;
            // ...ni une déjà marquée (défensif).
            if (e.remplaceeParId) continue;

            e.remplaceeParId = survivant.id;        // exclusion MOTEUR (inchangée)
            e.dateRemplacement = horodatage;
            e.reconcilieParDoublon = true;          // Option A : drapeau discriminant
            resultat.marquees.push(e.id);
            resultat.modifie = true;
        }
    }

    return resultat;
}

// ============================================
// EXPORTS GLOBAUX
// ============================================

window.ReconciliationEvaluations = {
    reconcilierActivesNoteEgale: reconcilierActivesNoteEgale,
    // Exposés pour les sentinelles (testabilité Vitest via chargerScript)
    _estActiveMoteur: _estActiveMoteur,
    _porteMarqueDeReprise: _porteMarqueDeReprise,
    _noteNormalisee: _noteNormalisee
};

})();
