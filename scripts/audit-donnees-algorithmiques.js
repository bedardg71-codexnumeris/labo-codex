/**
 * audit-donnees-algorithmiques.js
 *
 * Audit console à coller dans l'app pour détecter les évaluations dont
 * `donneesAlgorithmiques` (erreurs, mots) ne correspond pas à l'annotation
 * réelle du fichier lié.
 *
 * Hypothèse à tester : décalage systématique +1 alphabétique — chaque
 * étudiant a les valeurs stockées du suivant.
 *
 * Usage : ouvrir la console de l'app, coller ce fichier en entier, lire
 * `window.__auditAlgo` pour les résultats détaillés.
 */
(function() {
    'use strict';

    function compterErrfrAnnotation(annotation) {
        if (!annotation || !annotation.pages) return 0;
        let total = 0;
        for (const k of Object.keys(annotation.pages)) {
            const p = annotation.pages[k];
            if (!p || !p.shapes) continue;
            for (const s of p.shapes) {
                if (s.type && s.type.indexOf('errfr_') === 0) total++;
            }
        }
        return total;
    }

    const evaluations = (typeof obtenirDonneesSelonMode === 'function'
        ? obtenirDonneesSelonMode('evaluationsSauvegardees')
        : db.getSync(cle('evaluationsSauvegardees'), [])) || [];

    const etudiants = (typeof obtenirDonneesSelonMode === 'function'
        ? obtenirDonneesSelonMode('groupeEtudiants')
        : db.getSync(cle('groupeEtudiants'), [])) || [];

    const grilles = db.getSync('grillesTemplates', []) || [];

    // Index étudiant par DA
    const etudParDA = {};
    etudiants.forEach(function(e) { etudParDA[e.da] = e; });

    // Trier étudiants par nom alphabétique (comme dans la palette)
    const etudiantsSortes = etudiants.slice().sort(function(a, b) {
        const na = ((a.nom || '') + ' ' + (a.prenom || '')).toLowerCase();
        const nb = ((b.nom || '') + ' ' + (b.prenom || '')).toLowerCase();
        return na.localeCompare(nb);
    });

    // Pour chaque (DA, productionId), récupérer l'éval active (non remplacée)
    // et le fichier associé.
    const lignes = [];
    evaluations.forEach(function(ev) {
        if (ev.remplaceeParId) return;
        if (!ev.donneesAlgorithmiques) return;
        const cles = Object.keys(ev.donneesAlgorithmiques);
        if (!cles.length) return;

        const grille = grilles.find(function(g) { return g.id === ev.grilleId; });
        const fichier = (typeof travauxResolution !== 'undefined'
            ? travauxResolution.trouverFichierPourEvaluation(ev)
            : null);
        const annotation = (fichier && typeof travauxStockage !== 'undefined'
            ? travauxStockage.obtenirAnnotationFichier(fichier.id)
            : null);
        const errfrLive = annotation ? compterErrfrAnnotation(annotation) : null;

        cles.forEach(function(critereId) {
            const da = ev.donneesAlgorithmiques[critereId] || {};
            const critereGrille = grille && grille.criteres
                ? grille.criteres.find(function(c) { return c.id === critereId; })
                : null;
            const estAlgo = critereGrille && critereGrille.type === 'algorithmique';
            if (!estAlgo) return;

            const etudiant = etudParDA[ev.etudiantDA] || {};
            const nomComplet = ((etudiant.nom || '') + ' ' + (etudiant.prenom || '')).trim() || ev.etudiantNom || ev.etudiantDA;

            lignes.push({
                evalId: ev.id,
                etudiantDA: ev.etudiantDA,
                nomComplet: nomComplet,
                productionId: ev.productionId,
                productionNom: ev.productionNom || '',
                critereId: critereId,
                critereNom: critereGrille ? critereGrille.nom : critereId,
                stockeErreurs: typeof da.erreurs === 'number' ? da.erreurs : (typeof da.totalErreurs === 'number' ? da.totalErreurs : null),
                stockeMots: typeof da.mots === 'number' ? da.mots : null,
                stockePourcentage: typeof da.pourcentage === 'number' ? da.pourcentage : null,
                stockeNiveau: typeof da.niveau === 'string' ? da.niveau : null,
                fichierId: fichier ? fichier.id : null,
                annotationErrfrLive: errfrLive,
                divergeAnnotation: (errfrLive !== null
                    && da.erreurs !== undefined
                    && errfrLive !== da.erreurs),
                dateEvaluation: ev.dateEvaluation,
                dateModification: ev.dateModification
            });
        });
    });

    // Tester l'hypothèse +1 alphabétique : pour chaque ligne divergente,
    // vérifier si stockeErreurs correspond à l'annotation du voisin suivant.
    const indexParDA = {};
    etudiantsSortes.forEach(function(e, i) { indexParDA[e.da] = i; });

    lignes.forEach(function(l) {
        if (!l.divergeAnnotation) return;
        const idx = indexParDA[l.etudiantDA];
        if (idx === undefined || idx >= etudiantsSortes.length - 1) {
            l.testVoisinSuivant = 'pas-de-suivant';
            return;
        }
        const voisinDA = etudiantsSortes[idx + 1].da;
        // Chercher la même production chez le voisin
        const evVoisin = evaluations.find(function(e) {
            return e.etudiantDA === voisinDA
                && e.productionId === l.productionId
                && !e.remplaceeParId;
        });
        if (!evVoisin) {
            l.testVoisinSuivant = 'voisin-pas-d-eval';
            return;
        }
        const fichierVoisin = (typeof travauxResolution !== 'undefined'
            ? travauxResolution.trouverFichierPourEvaluation(evVoisin)
            : null);
        const annotationVoisin = (fichierVoisin && typeof travauxStockage !== 'undefined'
            ? travauxStockage.obtenirAnnotationFichier(fichierVoisin.id)
            : null);
        const errfrVoisin = annotationVoisin ? compterErrfrAnnotation(annotationVoisin) : null;
        l.errfrVoisinSuivant = errfrVoisin;
        l.testVoisinSuivant = (errfrVoisin !== null && errfrVoisin === l.stockeErreurs)
            ? 'MATCH-VOISIN-SUIVANT'
            : 'pas-de-match';
    });

    const corrompues = lignes.filter(function(l) { return l.divergeAnnotation; });
    const matchVoisin = corrompues.filter(function(l) { return l.testVoisinSuivant === 'MATCH-VOISIN-SUIVANT'; });

    console.group('[Audit Algo] Résultats');
    console.log('Total critères algorithmiques scannés :', lignes.length);
    console.log('Divergent de l\'annotation :', corrompues.length);
    console.log('Pattern +1 confirmé (stocké = annotation du voisin suivant) :', matchVoisin.length);
    console.groupEnd();

    if (corrompues.length > 0) {
        console.group('[Audit Algo] Détail des divergences');
        console.table(corrompues.map(function(l) {
            return {
                etudiant: l.nomComplet,
                DA: l.etudiantDA,
                production: l.productionNom,
                stocke: l.stockeErreurs + '/' + l.stockeMots,
                live: l.annotationErrfrLive,
                voisinSuivant: l.errfrVoisinSuivant,
                test: l.testVoisinSuivant,
                dateEval: l.dateEvaluation
            };
        }));
        console.groupEnd();
    }

    window.__auditAlgo = {
        lignes: lignes,
        corrompues: corrompues,
        matchVoisinSuivant: matchVoisin,
        etudiantsTriesParNom: etudiantsSortes.map(function(e) {
            return { da: e.da, nom: e.nom, prenom: e.prenom };
        })
    };

    console.log('Résultats complets dans window.__auditAlgo');
    return window.__auditAlgo;
})();
