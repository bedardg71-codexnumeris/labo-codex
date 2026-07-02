import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #145 — sentinelle « production sans fichier → PDF étranger » (2 juillet 2026).
// Bug réel (SUIVI-BUGS #145, 27 juin 2026) : évaluer une production SANS
// fichier importé (evaluation.productionId vide, cas productionIdEffective || ''
// d'evaluation-chargement.js:497/513) faisait sauter le filtre par production
// dans trouverFichierPourEvaluation → le fichier LE PLUS RÉCENT de l'élève,
// toutes productions confondues, était affiché (PDF étranger) + un warning
// « AMBIGUÏTÉ (DA, ) » par candidat surnuméraire.
// Contrat verrouillé :
//  1. productionId vide → null (jamais de résolution par DA seul) ;
//  2. le chemin PRIORITAIRE par evaluation.id reste intact (y compris la
//     chaîne de reprise repriseDeId) — même quand productionId est vide ;
//  3. la résolution composite normale (DA + productionId non vide) est intacte.

const DA = '1234567';

let fichiers;
let win;

function fichier(id, productionId, evaluationId, dateModification) {
    return {
        id, etudiantDA: DA, productionId, evaluationId,
        statut: 'actif', nomFichier: id + '.pdf', dateModification
    };
}

beforeEach(() => {
    // Deux fichiers d'AUTRES productions (le plus récent = l'« étranger » que
    // le bug renvoyait), aucun fichier pour la production évaluée.
    fichiers = [
        fichier('F-ANCIEN', 'PROD-A', 'EVAL-A', '2026-05-01T10:00:00Z'),
        fichier('F-ETRANGER', 'PROD-B', 'EVAL-B', '2026-06-20T10:00:00Z')
    ];

    const travauxStockage = {
        obtenirFichiersTravaux: () => fichiers,
        obtenirFichiersEtudiant: (da) => fichiers.filter(f => f.etudiantDA === da)
    };

    win = chargerScript('js/travaux-resolution.js', {
        travauxStockage,
        obtenirDonneesSelonMode: () => [],
        db: { getSync: () => [] },
        cle: (k) => k
    });
});

describe('#145 · trouverFichierPourEvaluation — refus de la résolution par DA seul', () => {
    it('évaluation avec productionId VIDE → null (pas le PDF étranger le plus récent)', () => {
        const evaluation = { id: 'EVAL-SANS-FICHIER', etudiantDA: DA, productionId: '' };
        const resultat = win.travauxResolution.trouverFichierPourEvaluation(evaluation);
        expect(resultat).toBeNull();
    });

    it('productionId vide → aucun avertissement « AMBIGUÏTÉ (DA, ) » émis', () => {
        const evaluation = { id: 'EVAL-SANS-FICHIER', etudiantDA: DA, productionId: '' };
        win.travauxResolution.trouverFichierPourEvaluation(evaluation);
        expect(win.travauxResolution.dernierAvertissement()).toBeNull();
    });

    it('objet synthétique {etudiantDA} sans productionId → null aussi', () => {
        const resultat = win.travauxResolution.trouverFichierPourEvaluation({ etudiantDA: DA });
        expect(resultat).toBeNull();
    });

    it('chemin PRIORITAIRE par evaluation.id intact, même avec productionId vide', () => {
        fichiers.push(fichier('F-PROPRE', 'PROD-C', 'EVAL-C', '2026-06-01T10:00:00Z'));
        const evaluation = { id: 'EVAL-C', etudiantDA: DA, productionId: '' };
        const resultat = win.travauxResolution.trouverFichierPourEvaluation(evaluation);
        expect(resultat).not.toBeNull();
        expect(resultat.id).toBe('F-PROPRE');
    });

    it('chaîne de reprise (repriseDeId) intacte', () => {
        const evaluation = { id: 'EVAL-REPRISE', repriseDeId: 'EVAL-B', etudiantDA: DA, productionId: '' };
        const resultat = win.travauxResolution.trouverFichierPourEvaluation(evaluation);
        expect(resultat).not.toBeNull();
        expect(resultat.id).toBe('F-ETRANGER'); // fichier de l'éval originale, voulu
    });

    it('résolution composite normale (DA + productionId non vide) intacte', () => {
        const evaluation = { etudiantDA: DA, productionId: 'PROD-A' };
        const resultat = win.travauxResolution.trouverFichierPourEvaluation(evaluation);
        expect(resultat).not.toBeNull();
        expect(resultat.id).toBe('F-ANCIEN');
    });
});
