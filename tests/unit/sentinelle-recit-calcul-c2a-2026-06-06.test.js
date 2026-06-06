import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// C2-a (Comparateur, fiche de profil) — récit de calcul STD : traçabilité ADDITIVE
// dans calculerDetailsNoteFinale. Contrat NOTE-CONCEPTION-C2 §4. Garde-fou de
// l'orientation A : exposer le « sort » de chaque résultat (compté / écarté /
// remplacé / terminale) SANS modifier le moindre calcul.
//  (1) PARITÉ : la note finale reste celle du calcul d'origine (golden master).
//  (2) CONTRAT : recit.resultats rempli, tous les `sort` dans l'énumération.
//  (3) COUVERTURE : retenus ∪ écartés = toutes les évaluations valides.
//  (4) NEUTRALITÉ : le niveau reste un code BRUT (traduit par l'échelle à la vue).

const DA = '1234567';
const PRAT = 'std-test';

// Config STD : 3 meilleurs retenus, pas de plafonnement (minimumCompletion bas).
const CONFIG_STD = {
    notesFinales: true,
    portfolio: {
        nombreARetenir: 3,
        minimumCompletion: 1,
        methodeSelection: 'meilleurs',
        reglesConformite: { actif: false }
    }
};

const PRODUCTIONS = [
    { id: 'port', type: 'portfolio', ponderation: 60 },
    { id: 'term', type: 'terminale', titre: 'Évaluation terminale', ponderation: 40 },
    { id: 'a1', type: 'artefact-portfolio', titre: 'Artefact 1', numero: 1, ponderation: 0 },
    { id: 'a2', type: 'artefact-portfolio', titre: 'Artefact 2', numero: 2, ponderation: 0 },
    { id: 'a3', type: 'artefact-portfolio', titre: 'Artefact 3', numero: 3, ponderation: 0 },
    { id: 'a4', type: 'artefact-portfolio', titre: 'Artefact 4', numero: 4, ponderation: 0 },
    { id: 'a5', type: 'artefact-portfolio', titre: 'Artefact 5', numero: 5, ponderation: 0 }
];

// 5 artefacts valides (a1..a5) + 1 ancienne version remplacée (a1) + 1 terminale.
const EVALS = [
    { etudiantDA: DA, productionId: 'a1', noteFinale: 85, niveauFinal: 'M', dateEvaluation: '2026-02-01' },
    { etudiantDA: DA, productionId: 'a2', noteFinale: 60, niveauFinal: 'D', dateEvaluation: '2026-02-08' },
    { etudiantDA: DA, productionId: 'a3', noteFinale: 78, niveauFinal: 'M', dateEvaluation: '2026-02-15' },
    { etudiantDA: DA, productionId: 'a4', noteFinale: 90, niveauFinal: 'E', dateEvaluation: '2026-02-22' },
    { etudiantDA: DA, productionId: 'a5', noteFinale: 50, niveauFinal: 'I', dateEvaluation: '2026-03-01' },
    { etudiantDA: DA, productionId: 'a1', noteFinale: 40, niveauFinal: 'I', dateEvaluation: '2026-01-15', remplaceeParId: 'rep-x' },
    { etudiantDA: DA, productionId: 'term', noteFinale: 82, niveauFinal: 'M', dateEvaluation: '2026-05-01' }
];

const SORTS_VALIDES = ['compte', 'ecarte', 'remplace', 'obligatoire', 'non-exige', 'satisfait', 'manquant'];

let win, details;

beforeAll(() => {
    const store = {
        modalitesEvaluation: { pratique: 'standards' },
        pratiquesConfigurables: [{ id: PRAT, nom: 'Standards test' }]
    };
    const globaux = {
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: () => {}, get: async () => null, set: async () => {}
        },
        cle: (k) => k,
        obtenirDonneesSelonMode: (k) =>
            k === 'evaluationsSauvegardees' ? EVALS : (k === 'productions' ? PRODUCTIONS : []),
        obtenirConfigPratiqueActive: () => CONFIG_STD,
        obtenirConfigCategories: () => null,
        obtenirPratiqueParId: () => ({ obtenirCode: () => 'STD' }),
        obtenirPratiqueActiveGroupeCours: () => PRAT
    };
    win = chargerScript('js/profil-etudiant-actions.js', globaux);
    details = win.calculerDetailsNoteFinale(DA, PRAT);
});

describe('C2-a · récit de calcul STD (traçabilité additive)', () => {
    it('expose calculerDetailsNoteFinale', () => {
        expect(typeof win.calculerDetailsNoteFinale).toBe('function');
    });

    it('PARITÉ : la note finale est inchangée (golden master = 83,4)', () => {
        // (84,33 × 60 + 82 × 40) / 100. L'ajout du récit ne touche aucun calcul.
        expect(details.noteFinale).toBeCloseTo(83.4, 1);
        expect(details.recit.synthese.noteFinale).toBe(details.noteFinale);
    });

    it('CONTRAT : recit rempli, sorts dans l\'énumération', () => {
        expect(details.recit.famille).toBe('STD');
        expect(details.recit.resultats.length).toBe(7); // 3 retenus + 2 écartés + 1 remplacé + 1 terminale
        details.recit.resultats.forEach(r => {
            expect(SORTS_VALIDES).toContain(r.sort);
            expect(typeof r.detail).toBe('string');
        });
    });

    it('décompte des sorts : 4 comptées (3 retenues + terminale), 2 écartées, 1 remplacée', () => {
        const parSort = (s) => details.recit.resultats.filter(r => r.sort === s);
        expect(parSort('compte').length).toBe(4);
        expect(parSort('ecarte').length).toBe(2);
        expect(parSort('remplace').length).toBe(1);
    });

    it('les retenues du récit == artefactsRetenus du portfolio (mêmes productions)', () => {
        const retenusRecit = details.recit.resultats
            .filter(r => r.sort === 'compte' && r.label.startsWith('Artefact'))
            .map(r => r.label).sort();
        // a4(90), a1(85), a3(78) — les 3 meilleurs
        expect(retenusRecit).toEqual(['Artefact 1', 'Artefact 3', 'Artefact 4']);
        expect(details.portfolio.artefactsRetenus.map(a => a.productionId).sort())
            .toEqual(['a1', 'a3', 'a4']);
    });

    it('COUVERTURE : retenues ∪ écartées = toutes les évaluations valides (a1..a5)', () => {
        const labelsCalcul = details.recit.resultats
            .filter(r => (r.sort === 'compte' || r.sort === 'ecarte') && r.label.startsWith('Artefact'))
            .map(r => r.label).sort();
        expect(labelsCalcul).toEqual(['Artefact 1', 'Artefact 2', 'Artefact 3', 'Artefact 4', 'Artefact 5']);
    });

    it('NEUTRALITÉ : le niveau est un code BRUT, jamais un libellé d\'échelle', () => {
        const a4 = details.recit.resultats.find(r => r.label === 'Artefact 4');
        expect(a4.niveau).toBe('E'); // code source, pas « Étendu »
        expect(a4.sort).toBe('compte');
    });

    it('cas non calculable → recit null (forme cohérente)', () => {
        const win2 = chargerScript('js/profil-etudiant-actions.js', {
            db: { getSync: (k, d) => (d !== undefined ? d : null), setSync: () => {}, get: async () => null, set: async () => {} },
            cle: (k) => k,
            obtenirDonneesSelonMode: () => [],
            obtenirConfigPratiqueActive: () => null, // pas de config → erreur
            obtenirPratiqueParId: () => ({ obtenirCode: () => 'STD' }),
            obtenirPratiqueActiveGroupeCours: () => PRAT
        });
        const d = win2.calculerDetailsNoteFinale(DA, PRAT);
        expect(d.erreur).toBeTruthy();
        expect(d.recit).toBeNull();
    });
});
