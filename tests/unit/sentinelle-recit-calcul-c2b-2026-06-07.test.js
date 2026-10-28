import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// C2-b (Comparateur, fiche de profil) — récit de calcul SOM : traçabilité ADDITIVE
// via PratiqueSommative.decrireCalcul(da). Contrat NOTE-CONCEPTION-C2 §4. Garde-fou
// de l'orientation A : exposer le « sort » de chaque résultat (compté une fois à son
// poids / remplacé) SANS modifier le moindre calcul.
//  (1) PARITÉ : la note du récit == calculerPerformance × 100 (P inchangé, golden).
//  (2) CONTRAT : recit.resultats rempli, tous les `sort` dans l'énumération.
//  (3) SÉMANTIQUE SOM : chaque valide comptée une fois ; remplacée hors moyenne.
//  (4) NEUTRALITÉ : le niveau reste un code BRUT (traduit par l'échelle à la vue).

const DA = '1234567';

// p3 a une pondération 0 → poids 0 depuis E1 (décision de Grégoire, 28 oct. 2026 ; avant : défaut 1, le piège SOM) :
// nommée « pondération 0 · non comptée », hors de la moyenne.
const PRODUCTIONS = [
    { id: 'p1', titre: 'Dissertation 1', ponderation: 60 },
    { id: 'p2', titre: 'Examen final', ponderation: 40 },
    { id: 'p3', titre: 'Exercice', ponderation: 0 }
];

// 3 évaluations valides + 1 ancienne version remplacée (p1) — exclue de la moyenne.
const EVALS = [
    { etudiantDA: DA, productionId: 'p1', noteFinale: 80, niveauFinal: 'M', dateEvaluation: '2026-02-01' },
    { etudiantDA: DA, productionId: 'p3', noteFinale: 50, niveauFinal: 'I', dateEvaluation: '2026-02-15' },
    { etudiantDA: DA, productionId: 'p2', noteFinale: 90, niveauFinal: 'E', dateEvaluation: '2026-05-01' },
    { etudiantDA: DA, productionId: 'p1', noteFinale: 30, niveauFinal: 'I', dateEvaluation: '2026-01-10', remplaceeParId: 'rep-x' }
];

const SORTS_VALIDES = ['compte', 'ecarte', 'remplace', 'obligatoire', 'non-exige', 'satisfait', 'manquant'];

// Golden master : (80×60 + 90×40) / 100 = 84 (E1, 28 oct. 2026 ; avant (… + 50×1) / 101 = 83,663…)
const GOLDEN = 8400 / 100;

let win, som, recit;

beforeAll(() => {
    // #706 (5 sept. 2026) : la règle « ce qui entre dans la note » vit dans pratique-registre.js —
    // le charger d'abord sur le même window. Changement de HARNAIS seulement : assertions inchangées.
    const dbStub = { getSync: (k, d) => (d !== undefined ? d : null), setSync: () => {}, get: async () => null, set: async () => {} };
    win = chargerScript('js/pratiques/pratique-registre.js', { db: dbStub, cle: (k) => k });
    chargerScript('js/pratiques/pratique-sommative.js', {
        obtenirDonneesSelonMode: (k) =>
            k === 'evaluationsSauvegardees' ? EVALS : (k === 'productions' ? PRODUCTIONS : [])
    }, win);
    // obtenirCode() délègue au registre (window.obtenirCodePratique) — stub neutre.
    win.obtenirCodePratique = () => 'SOM';
    som = new win.PratiqueSommative();
    recit = som.decrireCalcul(DA);
});

describe('C2-b · récit de calcul SOM (traçabilité additive)', () => {
    it('expose decrireCalcul sur PratiqueSommative', () => {
        expect(typeof som.decrireCalcul).toBe('function');
    });

    it('PARITÉ : la note du récit == calculerPerformance × 100 (golden 84 ; 83,66 avant E1)', () => {
        const p = som.calculerPerformance(DA);
        expect(recit.synthese.noteFinale).toBe(p * 100);
        expect(recit.synthese.noteFinale).toBeCloseTo(GOLDEN, 1);
    });

    it('CONTRAT : recit rempli, sorts dans l\'énumération, detail en texte', () => {
        expect(recit.famille).toBe('SOM');
        expect(recit.pratiqueNom).toBe('Sommative traditionnelle');
        expect(recit.resultats.length).toBe(4); // 2 comptées + 1 à pondération 0 (E1) + 1 remplacée
        recit.resultats.forEach(r => {
            expect(SORTS_VALIDES).toContain(r.sort);
            expect(typeof r.detail).toBe('string');
        });
        expect(recit.synthese.plafonnement).toBeNull();
    });

    it('SÉMANTIQUE SOM : 2 comptées une fois + 1 à pondération 0 nommée (E1 ; avant : 3 comptées) + 1 remplacée hors moyenne', () => {
        const parSort = (s) => recit.resultats.filter(r => r.sort === s);
        expect(parSort('compte').length).toBe(2);
        expect(parSort('ecarte')).toEqual([expect.objectContaining({ label: 'Exercice', detail: 'pondération 0 · non comptée' })]);
        expect(parSort('remplace').length).toBe(1);
        parSort('compte').forEach(r => expect(r.detail).toMatch(/comptée une fois/));
        // La version remplacée (note 30) n'entre pas dans la moyenne (parité golden).
        const remplacee = parSort('remplace')[0];
        expect(remplacee.label).toBe('Dissertation 1');
        expect(remplacee.note).toBe(30);
    });

    it('résultats comptés triés par date croissante', () => {
        const comptes = recit.resultats.filter(r => r.sort === 'compte').map(r => r.label);
        expect(comptes).toEqual(['Dissertation 1', 'Examen final']);   // E1 : l'Exercice (pondération 0) n'est plus compté
    });

    it('NEUTRALITÉ : le niveau est un code BRUT, jamais un libellé d\'échelle', () => {
        const examen = recit.resultats.find(r => r.label === 'Examen final');
        expect(examen.niveau).toBe('E'); // code source, pas « Étendu »
        expect(examen.sort).toBe('compte');
    });

    it('cas non calculable → null (DA invalide ou aucune évaluation)', () => {
        expect(som.decrireCalcul('123')).toBeNull();
        const winVide = chargerScript('js/pratiques/pratique-registre.js', { db: { getSync: (k, d) => (d !== undefined ? d : null), setSync: () => {}, get: async () => null, set: async () => {} }, cle: (k) => k });
        chargerScript('js/pratiques/pratique-sommative.js', {
            obtenirDonneesSelonMode: () => []
        }, winVide);
        winVide.obtenirCodePratique = () => 'SOM';
        const somVide = new winVide.PratiqueSommative();
        expect(somVide.decrireCalcul(DA)).toBeNull();
    });
});
