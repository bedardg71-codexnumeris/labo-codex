import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Brique 1 — Phase 0 A25 (juin 2026). L'auto-save `_autoSauvegarderCriteres`
// (evaluation-chargement.js) ne doit JAMAIS réécrire une évaluation VERROUILLÉE.
//
// Pourquoi : l'auto-save est déclenché par `niveauSelectionne` (interaction sur un
// select de niveau). En consultation d'une éval verrouillée, le formulaire est
// désactivé — SAUF angle mort en éval terminale, où le panneau « Critères » est
// déplacé hors de #listeCriteresGrille1 (cause de #348) et échappe à
// `desactiverFormulaireEvaluation`. Un recalcul y déclencherait une réécriture
// silencieuse de la note archivée (risque #350). La garde rend l'auto-save
// inoffensif pour toute éval verrouillée, quel que soit l'état du DOM.
//
// Break-test : retirer `if (evaluations[idx].verrouillee === true) return;`
// dans `_autoSauvegarderCriteres` → les tests « aucune écriture » et « critères
// inchangés » rougissent (l'éval verrouillée est mutée + sauvegardée).

function monter(verrouillee) {
    let ecrit = null;
    const store = {
        grillesTemplates: [
            { id: 'G1', criteres: [{ id: 'C1', nom: 'Français écrit', ponderation: 30 }] }
        ],
        evaluationsSauvegardees: [
            {
                id: 'E1', etudiantDA: '111', productionId: 'P1', grilleId: 'G1',
                verrouillee,
                criteres: [{ critereId: 'C1', critereNom: 'Français écrit', niveauSelectionne: 'M', ponderation: 30 }],
                noteFinale: 76.6
            }
        ]
    };
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            set: async () => {},
            setSync: () => {}
        },
        cle: (k) => k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [],
        sauvegarderDonneesSelonMode: (k, v) => { ecrit = { k, v }; },
        obtenirPreference: () => null
    };
    const win = chargerScript('js/evaluation-chargement.js', stubs, {
        addEventListener: () => {}, removeEventListener: () => {}
    });
    return { win, store, getEcrit: () => ecrit };
}

// Snapshot d'un recalcul qui FERAIT monter la note (niveau M → E).
const snapshotGonfle = () => ({
    etudiantDA: '111', productionId: 'P1', grilleId: 'G1',
    criteres: { C1: 'E' }, donneesAlgorithmiques: {}
});

describe('Brique 1 · l’auto-save ne réécrit pas une évaluation verrouillée', () => {
    it('expose _autoSauvegarderCriteres', () => {
        const { win } = monter(true);
        expect(typeof win._autoSauvegarderCriteres).toBe('function');
    });

    it('éval VERROUILLÉE → aucune écriture en stockage', () => {
        const { win, getEcrit } = monter(true);
        win._autoSauvegarderCriteres(snapshotGonfle());
        expect(getEcrit()).toBe(null);
    });

    it('éval VERROUILLÉE → critères stockés inchangés (niveau reste M)', () => {
        const { win, store } = monter(true);
        win._autoSauvegarderCriteres(snapshotGonfle());
        expect(store.evaluationsSauvegardees[0].criteres[0].niveauSelectionne).toBe('M');
    });

    it('contrôle : éval NON verrouillée → bien sauvegardée (garde ciblée, pas globale)', () => {
        const { win, getEcrit } = monter(false);
        win._autoSauvegarderCriteres(snapshotGonfle());
        expect(getEcrit()).not.toBe(null);
        expect(getEcrit().k).toBe('evaluationsSauvegardees');
    });
});
