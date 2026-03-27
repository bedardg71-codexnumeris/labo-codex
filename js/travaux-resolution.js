(function() {
    'use strict';

    /**
     * Module de résolution centralisé fichier ↔ évaluation.
     *
     * Résolution par clé composite (etudiantDA, productionId) uniquement.
     * En cas d'ambiguïté (2+ résultats), retourne null + log warning.
     *
     * Phase 3b : fichierId supprimé — un seul chemin de résolution.
     */

    // Dernier avertissement (ambiguïté/incohérence) pour affichage UI
    var _dernierAvertissement = null;

    /**
     * Trouve l'évaluation active pour un fichier donné.
     * Résolution par (etudiantDA, productionId).
     * En cas d'ambiguïté (2+ résultats), retourne le plus récent + warning.
     * @param {Object} fichier - Le fichier importé
     * @returns {Object|null} L'évaluation active ou null
     */
    function trouverEvaluationPourFichier(fichier) {
        _dernierAvertissement = null;
        if (!fichier) return null;
        const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];

        // Résolution par clé composite (etudiantDA, productionId)
        if (!fichier.etudiantDA || !fichier.productionId) return null;
        const candidats = evaluations.filter(e =>
            e.etudiantDA === fichier.etudiantDA &&
            e.productionId === fichier.productionId &&
            !e.remplaceeParId
        );
        if (candidats.length === 0) return null;
        if (candidats.length === 1) return candidats[0];

        // 2+ résultats : retourner le plus récent + signaler l'ambiguïté
        candidats.sort((a, b) =>
            new Date(b.dateEvaluation || 0) - new Date(a.dateEvaluation || 0)
        );
        console.warn(`[Résolution] AMBIGUÏTÉ: ${candidats.length} évaluations pour (${fichier.etudiantDA}, ${fichier.productionId}) — retourne la plus récente`);
        _dernierAvertissement = {
            type: 'ambiguite-evaluation',
            da: fichier.etudiantDA,
            productionId: fichier.productionId,
            candidats: candidats.map(e => ({ id: e.id, date: e.dateEvaluation }))
        };
        return candidats[0];
    }

    /**
     * Trouve le fichier associé à une évaluation.
     * Résolution par (etudiantDA, productionId).
     * En cas d'ambiguïté (2+ résultats), retourne le plus récent + warning.
     * @param {Object} evaluation - L'évaluation sauvegardée
     * @returns {Object|null} Le fichier ou null
     */
    function trouverFichierPourEvaluation(evaluation) {
        _dernierAvertissement = null;
        if (!evaluation) return null;
        if (typeof travauxStockage === 'undefined') return null;

        // Chemin prioritaire : résolution directe par evaluationId
        if (evaluation.id) {
            var tousLesFichiers = travauxStockage.obtenirFichiersTravaux();
            var parEvalId = tousLesFichiers.filter(function(f) {
                return f.evaluationId === evaluation.id && f.statut !== 'corbeille';
            });
            if (parEvalId.length === 1) return parEvalId[0];
            if (parEvalId.length > 1) {
                parEvalId.sort(function(a, b) {
                    return new Date(b.dateModification || 0) - new Date(a.dateModification || 0);
                });
                return parEvalId[0];
            }
        }

        // Fallback : résolution par clé composite (etudiantDA, productionId)
        if (!evaluation.etudiantDA) {
            return null;
        }
        var fichiers = travauxStockage.obtenirFichiersEtudiant(evaluation.etudiantDA);
        if (evaluation.productionId) {
            fichiers = fichiers.filter(function(f) { return f.productionId === evaluation.productionId; });
        }
        if (fichiers.length === 0) {
            return null;
        }
        if (fichiers.length === 1) return fichiers[0];

        // 2+ résultats : retourner le plus récent + signaler l'ambiguïté
        fichiers.sort(function(a, b) {
            return new Date(b.dateModification || 0) - new Date(a.dateModification || 0);
        });
        console.warn('[Résolution] AMBIGUÏTÉ: ' + fichiers.length + ' fichiers pour (' + evaluation.etudiantDA + ', ' + evaluation.productionId + ') — retourne le plus récent');
        _dernierAvertissement = {
            type: 'ambiguite-fichier',
            da: evaluation.etudiantDA,
            productionId: evaluation.productionId,
            candidats: fichiers.map(function(f) { return { id: f.id, nom: f.nomFichier, date: f.dateModification }; })
        };
        return fichiers[0];
    }

    /**
     * Retourne le dernier avertissement émis par la résolution (ambiguïté).
     * Réinitialisé à chaque appel de résolution.
     * @returns {Object|null}
     */
    function dernierAvertissement() {
        return _dernierAvertissement;
    }

    /**
     * Diagnostic : affiche toutes les associations fichier↔évaluation pour un étudiant.
     * Usage console : travauxResolution.diagnostiquer('DA_ICI')
     * ou : travauxResolution.diagnostiquer() pour chercher par prénom
     * @param {string} [daOuPrenom] - DA de l'étudiant ou début de prénom
     */
    function diagnostiquer(daOuPrenom) {
        const etudiants = db.getSync(cle('groupeEtudiants'), []);
        let da = daOuPrenom;

        // Si pas un DA (pas numérique), chercher par prénom
        if (da && !/^\d+$/.test(da)) {
            const cherche = da.toLowerCase();
            const trouve = etudiants.find(e =>
                (e.prenom || '').toLowerCase().includes(cherche) ||
                (e.nom || '').toLowerCase().includes(cherche)
            );
            if (!trouve) {
                console.error(`Aucun étudiant trouvé pour "${daOuPrenom}"`);
                return;
            }
            da = trouve.da;
        }

        if (!da) {
            console.error('Usage : travauxResolution.diagnostiquer("Benjamin") ou travauxResolution.diagnostiquer("1234567")');
            return;
        }

        const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
        const productions = db.getSync(cle('productions'), []);
        const fichiers = travauxStockage.obtenirFichiersEtudiant(da);

        // Nom des productions
        const prodNom = {};
        productions.forEach(p => { prodNom[p.id] = p.titre || p.nom || p.id; });

        fichiers.forEach(f => {
        });

        const evalsDA = evaluations.filter(e => e.etudiantDA === da && !e.remplaceeParId);
        evalsDA.forEach(e => {
            const fichierResolu = trouverFichierPourEvaluation(e);
        });

        evalsDA.forEach(e => {
            const fichierResolu = trouverFichierPourEvaluation(e);
            if (fichierResolu && fichierResolu.productionId !== e.productionId) {
                console.warn(
                    `  INCOHÉRENCE : éval ${e.id} [${prodNom[e.productionId]}] → fichier ${fichierResolu.id} dont productionId=${fichierResolu.productionId} [${prodNom[fichierResolu.productionId] || '?'}]`
                );
            }
        });
    }

    // API publique
    window.travauxResolution = {
        trouverEvaluationPourFichier,
        trouverFichierPourEvaluation,
        dernierAvertissement,
        diagnostiquer
    };

})();
