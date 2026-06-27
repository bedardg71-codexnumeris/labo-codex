import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Brique D — hygiène namespacing (juin 2026). La pré-sélection grille/échelle/
// cartouche d'une NOUVELLE évaluation (`_modeleProductionPourEval`,
// evaluation-chargement.js) doit suivre le modèle des ÉVALUATIONS EXISTANTES de la
// production — PAS le champ `production.grilleId/echelleId/cartoucheId`, qui peut
// être un résidu de migration périmé pointant un modèle GLOBAL partagé (cf. #346
// coursId ; famille Brique D #358). Le pré-sélectionner ré-injecterait ce modèle
// dans une éval fraîche et défairait l'isolation par trimestre que l'oracle L2
// (scripts/sentinelle-isolation-grilles-trimestre.mjs) rapporte comme propre.
//
// CONSTAT TERRAIN (dry-run sur le codex réel, 26 juin) : 4 productions portent un
// grilleId/echelleId périmé alors que leurs ~30-44 évals utilisent un id isolé.
//
// Break-test : dans `_modeleProductionPourEval`, remplacer la dérivation depuis
// les évals par `return { grilleId: prod.grilleId, echelleId: prod.echelleId,
// cartoucheId: prod.cartoucheId };` (faire confiance au champ périmé) → le cas
// « évals existantes priment » rougit.

function monter(evaluations) {
    const store = { evaluationsSauvegardees: evaluations };
    const stubs = {
        db: { getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)) },
        cle: (k) => k,
        obtenirDonneesSelonMode: (k) => (k in store ? store[k] : []),
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirPreference: () => null
    };
    return chargerScript('js/evaluation-chargement.js', stubs, {
        addEventListener: () => {}, removeEventListener: () => {}
    });
}

describe('Brique D · _modeleProductionPourEval — les évals existantes priment sur le champ périmé', () => {
    it('expose _modeleProductionPourEval', () => {
        const win = monter([]);
        expect(typeof win._modeleProductionPourEval).toBe('function');
    });

    it('dérive le modèle des évals existantes (ignore un production.grilleId périmé)', () => {
        const win = monter([
            { id: 'E1', productionId: 'P1', grilleId: 'GRILLE_ISOLEE_H26', echelleId: 'ECH_H26', cartoucheId: 'CART_H26' },
            { id: 'E2', productionId: 'P1', grilleId: 'GRILLE_ISOLEE_H26', echelleId: 'ECH_H26', cartoucheId: 'CART_H26' }
        ]);
        const prod = { id: 'P1', grilleId: 'GRILLE_GLOBALE_PARTAGEE', echelleId: 'ECH_GLOB', cartoucheId: 'CART_GLOB' };
        const ref = win._modeleProductionPourEval(prod);
        expect(ref.grilleId).toBe('GRILLE_ISOLEE_H26');
        expect(ref.echelleId).toBe('ECH_H26');
        expect(ref.cartoucheId).toBe('CART_H26');
    });

    it('utilise les valeurs vides des évals (n\'hérite PAS d\'une cartouche périmée de la production)', () => {
        const win = monter([
            { id: 'E1', productionId: 'P1', grilleId: 'G_ISO', echelleId: 'E_ISO', cartoucheId: '' }
        ]);
        const prod = { id: 'P1', grilleId: 'G_PERIME', echelleId: 'E_PERIME', cartoucheId: 'CART_FANTOME' };
        const ref = win._modeleProductionPourEval(prod);
        expect(ref.grilleId).toBe('G_ISO');
        expect(ref.cartoucheId).toBe('');
    });

    it('repli sur le champ production quand AUCUNE éval n\'existe (1re évaluation)', () => {
        const win = monter([{ id: 'EX', productionId: 'AUTRE', grilleId: 'X' }]);
        const prod = { id: 'P1', grilleId: 'G_PROD', echelleId: 'E_PROD', cartoucheId: 'C_PROD' };
        const ref = win._modeleProductionPourEval(prod);
        expect(ref).toEqual({ grilleId: 'G_PROD', echelleId: 'E_PROD', cartoucheId: 'C_PROD' });
    });

    it('ignore les évals remplacées (remplaceeParId)', () => {
        const win = monter([
            { id: 'E1', productionId: 'P1', grilleId: 'G_REMPLACEE', remplaceeParId: 'E2' },
            { id: 'E2', productionId: 'P1', grilleId: 'G_ACTIVE' }
        ]);
        const ref = win._modeleProductionPourEval({ id: 'P1', grilleId: 'G_PERIME' });
        expect(ref.grilleId).toBe('G_ACTIVE');
    });

    it('repli sur le champ production si les évals divergent (ne tranche pas ici)', () => {
        const win = monter([
            { id: 'E1', productionId: 'P1', grilleId: 'G_A' },
            { id: 'E2', productionId: 'P1', grilleId: 'G_B' }
        ]);
        const ref = win._modeleProductionPourEval({ id: 'P1', grilleId: 'G_PROD' });
        expect(ref.grilleId).toBe('G_PROD');
    });

    it('production absente → modèle vide (pas de crash)', () => {
        const win = monter([]);
        expect(win._modeleProductionPourEval(null)).toEqual({ grilleId: '', echelleId: '', cartoucheId: '' });
    });
});
