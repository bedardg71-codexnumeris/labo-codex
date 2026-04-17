/**
 * actions-rlo.js — Profil RLO (Repérage / Liaison / Ouverture)
 *
 * Agrège les décomptes des tampons `action-*` posés sur l'annotation d'un
 * fichier d'évaluation, pour produire un profil structuré inscrit dans
 * l'objet évaluation au moment de la sauvegarde.
 *
 * Source des décomptes : annotation du fichier résolu pour l'évaluation,
 * via la chaîne Évaluation → Fichier (travauxResolution) → Annotation
 * (travauxStockage) → comptage par autocollantId (travauxExportPdf).
 *
 * Les tampons legacy (qualité, diagnostic) sont ignorés — seuls les IDs
 * `action-*` alimentent le profil RLO.
 *
 * API publique : window.actionsRLO = { agregerActionsRLO }
 *   - Pure : aucune dépendance à l'UI ou à une vue active
 *   - Le toggle `activerActionsRLO` est vérifié au site d'appel, pas ici,
 *     pour permettre la réutilisation par la migration rétroactive.
 */

(function() {
    'use strict';

    /**
     * Mapping IDs internes → clés de sortie du profil RLO.
     * Les noms de sortie (reperage/liaison/ouverture/...) sont la convention
     * stable utilisée par l'export anonymisé et la visualisation.
     */
    const MAPPING_RLO = {
        'action-reperage':  'reperage',
        'action-liaison':   'liaison',
        'action-ouverture': 'ouverture',
        'action-incertain': 'incertain',
        'action-incomplet': 'incomplet',
        'action-inexact':   'inexact'
    };

    /**
     * Agrège les décomptes RLO depuis l'annotation d'un fichier d'évaluation.
     *
     * @param {Object} evaluation - Au minimum { etudiantDA, productionId }
     * @returns {Object|null}
     *   { reperage, liaison, ouverture, incertain, incomplet, inexact, total }
     *   OU null si aucun fichier ou aucune annotation n'est résolu.
     *
     *   - null         = pas de données (pas d'annotation)
     *   - tous à zéro  = annotation présente mais aucun tampon `action-*`
     */
    function agregerActionsRLO(evaluation) {
        if (!evaluation || !evaluation.etudiantDA || !evaluation.productionId) {
            return null;
        }
        if (typeof travauxResolution === 'undefined' ||
            typeof travauxStockage === 'undefined' ||
            typeof travauxExportPdf === 'undefined') {
            return null;
        }

        const fichier = travauxResolution.trouverFichierPourEvaluation(evaluation);
        if (!fichier) return null;

        const annotation = travauxStockage.obtenirAnnotationFichier(fichier.id);
        if (!annotation) return null;

        const stats = travauxExportPdf.compterAnnotationsDetailees(annotation);
        if (!stats || !stats.tampons) return null;

        const profil = {
            reperage: 0, liaison: 0, ouverture: 0,
            incertain: 0, incomplet: 0, inexact: 0,
            total: 0
        };
        for (const id in stats.tampons) {
            const cle = MAPPING_RLO[id];
            if (cle) {
                const n = stats.tampons[id] || 0;
                profil[cle] += n;
                profil.total += n;
            }
        }
        return profil;
    }

    window.actionsRLO = { agregerActionsRLO };
})();
