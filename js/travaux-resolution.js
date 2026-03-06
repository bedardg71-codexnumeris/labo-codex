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
     * Nettoyage one-time : efface les fichierId assignés par la migration
     * automatique ou par des corrections manuelles erronées.
     * Les nouvelles évaluations continueront à écrire fichierId normalement.
     * Gardé par un flag pour ne s'exécuter qu'une seule fois.
     */
    function nettoyerFichierIdsMigres() {
        const FLAG = cle('fichierIds_nettoyes_v1');
        if (db.getSync(FLAG)) return;

        const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
        if (!evaluations.length) {
            db.setSync(FLAG, true);
            return;
        }

        let nbNettoyes = 0;
        evaluations.forEach(e => {
            if (e.fichierId) {
                e.fichierId = '';
                nbNettoyes++;
            }
        });

        if (nbNettoyes > 0) {
            sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);
            console.log(`[Travaux-Resolution] Nettoyage fichierId : ${nbNettoyes} évaluation(s) nettoyée(s) — fallback (DA,prod) actif`);
        } else {
            console.log('[Travaux-Resolution] Nettoyage fichierId : aucun fichierId à nettoyer');
        }

        // Réverser les productionId modifiés par erreur sur les fichiers de Benjamin A. (DA 9000175)
        if (typeof travauxStockage !== 'undefined') {
            const corrections = {
                'FT_1772022760702_biwu4': 'Artefact 1',
                'FT_1771789103562_pk403': 'Artefact 3'
            };
            let nbFichiersCorr = 0;
            for (const [fId, prodIdOriginal] of Object.entries(corrections)) {
                const f = travauxStockage.obtenirFichierParId(fId);
                if (f && f.productionId !== prodIdOriginal) {
                    travauxStockage.mettreAJourFichier(fId, { productionId: prodIdOriginal });
                    nbFichiersCorr++;
                    console.log(`[Travaux-Resolution] Fichier ${fId} : productionId restauré → "${prodIdOriginal}"`);
                }
            }
            if (nbFichiersCorr === 0) {
                console.log('[Travaux-Resolution] Fichiers Benjamin : productionId déjà corrects');
            }
        }

        db.setSync(FLAG, true);
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
            console.log(`Étudiant trouvé : ${trouve.prenom} ${trouve.nom} (DA: ${da})`);
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

        console.log('\n%c=== FICHIERS ===', 'font-weight:bold; font-size:14px');
        fichiers.forEach(f => {
            console.log(
                `  ${f.id}  prod=${f.productionId || '(aucun)'}  [${prodNom[f.productionId] || '?'}]  nom="${f.nomFichier}"  modif=${f.dateModification || '?'}`
            );
        });

        const evalsDA = evaluations.filter(e => e.etudiantDA === da && !e.remplaceeParId);
        console.log('\n%c=== ÉVALUATIONS (actives) ===', 'font-weight:bold; font-size:14px');
        evalsDA.forEach(e => {
            const fichierResolu = trouverFichierPourEvaluation(e);
            const source = e.fichierId ? 'fichierId' : '(DA,prod)';
            console.log(
                `  ${e.id}  prod=${e.productionId}  [${prodNom[e.productionId] || '?'}]  fichierId=${e.fichierId || '(vide)'}  → fichier résolu: ${fichierResolu ? fichierResolu.id + ' "' + fichierResolu.nomFichier + '"' : 'AUCUN'}  (via ${source})`
            );
        });

        console.log('\n%c=== CROISEMENT ===', 'font-weight:bold; font-size:14px');
        evalsDA.forEach(e => {
            const fichierResolu = trouverFichierPourEvaluation(e);
            if (fichierResolu && fichierResolu.productionId !== e.productionId) {
                console.warn(
                    `  ⚠️ INCOHÉRENCE : éval ${e.id} [${prodNom[e.productionId]}] → fichier ${fichierResolu.id} dont productionId=${fichierResolu.productionId} [${prodNom[fichierResolu.productionId] || '?'}]`
                );
            }
        });

        console.log('\n%cPour corriger : travauxResolution.lierManuellement("EVAL_xxx", "FT_yyy")', 'color: #888');
    }

    /**
     * Correction manuelle : lie une évaluation à un fichier spécifique.
     * Usage console : travauxResolution.lierManuellement('EVAL_xxx', 'FT_yyy')
     * @param {string} evaluationId - ID de l'évaluation
     * @param {string} fichierId - ID du fichier
     */
    function lierManuellement(evaluationId, fichierId) {
        // Permettre de délier (fichierId vide)
        if (fichierId) {
            const fichier = travauxStockage.obtenirFichierParId(fichierId);
            if (!fichier) {
                console.error(`Fichier introuvable : ${fichierId}`);
                return;
            }
        }

        const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
        const index = evaluations.findIndex(e => e.id === evaluationId);
        if (index === -1) {
            console.error(`Évaluation introuvable : ${evaluationId}`);
            return;
        }

        const ancien = evaluations[index].fichierId;
        evaluations[index].fichierId = fichierId || '';
        sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

        if (fichierId) {
            const fichier = travauxStockage.obtenirFichierParId(fichierId);
            console.log(`✅ ${evaluationId} → ${fichierId} ("${fichier.nomFichier}") — ancien: ${ancien || '(vide)'}`);
        } else {
            console.log(`✅ ${evaluationId} → (délié) — ancien: ${ancien || '(vide)'}`);
        }
    }

    // API publique
    window.travauxResolution = {
        trouverEvaluationPourFichier,
        trouverFichierPourEvaluation,
        nettoyerFichierIdsMigres,
        diagnostiquer,
        lierManuellement
    };

})();
