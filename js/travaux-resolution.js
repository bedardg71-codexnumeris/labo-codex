(function() {
    'use strict';

    /**
     * Module de résolution centralisé fichier ↔ évaluation.
     *
     * Remplace les 26+ lookups inline dispersés dans le code.
     * Priorité : fichierId direct > (etudiantDA, productionId) > null
     */

    /**
     * Trouve l'évaluation active pour un fichier donné.
     * @param {Object} fichier - Le fichier importé
     * @returns {Object|null} L'évaluation active ou null
     */
    function trouverEvaluationPourFichier(fichier) {
        if (!fichier) return null;
        const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];

        // Priorité 1 : lien direct par fichierId
        const parId = evaluations.find(e =>
            e.fichierId && e.fichierId === fichier.id && !e.remplaceeParId
        );
        if (parId) return parId;

        // Priorité 2 : fallback (etudiantDA, productionId)
        if (!fichier.etudiantDA || !fichier.productionId) return null;
        const candidats = evaluations.filter(e =>
            e.etudiantDA === fichier.etudiantDA &&
            e.productionId === fichier.productionId &&
            !e.remplaceeParId
        );
        if (candidats.length === 0) return null;
        if (candidats.length === 1) return candidats[0];

        // Multiples résultats : prendre le plus récent
        candidats.sort((a, b) =>
            new Date(b.dateEvaluation || 0) - new Date(a.dateEvaluation || 0)
        );
        return candidats[0];
    }

    /**
     * Trouve le fichier associé à une évaluation.
     * @param {Object} evaluation - L'évaluation sauvegardée
     * @returns {Object|null} Le fichier ou null
     */
    function trouverFichierPourEvaluation(evaluation) {
        if (!evaluation) return null;
        if (typeof travauxStockage === 'undefined') return null;

        // Priorité 1 : lien direct par fichierId
        if (evaluation.fichierId) {
            const fichier = travauxStockage.obtenirFichierParId(evaluation.fichierId);
            if (fichier) return fichier;
        }

        // Priorité 2 : fallback (etudiantDA, productionId)
        if (!evaluation.etudiantDA) return null;
        let fichiers = travauxStockage.obtenirFichiersEtudiant(evaluation.etudiantDA);
        if (evaluation.productionId) {
            fichiers = fichiers.filter(f => f.productionId === evaluation.productionId);
        }
        if (fichiers.length === 0) return null;
        if (fichiers.length === 1) return fichiers[0];

        // Multiples résultats : prendre le plus récent
        fichiers.sort((a, b) =>
            new Date(b.dateModification || 0) - new Date(a.dateModification || 0)
        );
        return fichiers[0];
    }

    /**
     * Migration : assigne fichierId aux évaluations existantes
     * quand l'association est non-ambiguë (1 fichier par DA+production).
     * Idempotent — safe à appeler plusieurs fois.
     */
    function migrerFichierIds() {
        if (typeof travauxStockage === 'undefined') return;
        const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
        if (!evaluations.length) return;

        let nbMigrees = 0;
        evaluations.forEach(e => {
            if (e.fichierId || e.remplaceeParId) return;
            if (!e.etudiantDA || !e.productionId) return;

            const fichiers = travauxStockage.obtenirFichiersEtudiant(e.etudiantDA)
                .filter(f => f.productionId === e.productionId);

            if (fichiers.length === 1) {
                e.fichierId = fichiers[0].id;
                nbMigrees++;
            }
        });

        if (nbMigrees > 0) {
            sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);
            console.log(`[Travaux-Resolution] Migration fichierId : ${nbMigrees} évaluation(s) liée(s)`);
        } else {
            console.log('[Travaux-Resolution] Migration fichierId : aucune évaluation à migrer');
        }
    }

    // API publique
    window.travauxResolution = {
        trouverEvaluationPourFichier,
        trouverFichierPourEvaluation,
        migrerFichierIds
    };

})();
