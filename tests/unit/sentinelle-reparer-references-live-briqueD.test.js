import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// La fonction émet son rapport via console.warn — on le neutralise pour garder
// la sortie de test propre (chargerScript passe déjà `console` en paramètre fixe :
// le re-stubber créerait un doublon de paramètre → SyntaxError).
let _spyWarn;
beforeAll(() => { _spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterAll(() => { _spyWarn.mockRestore(); });

// Brique D — hygiène namespacing, BLOC 2 — FONCTION CONSOLE LIVE (juin 2026).
// window.reparerReferencesProductions (migration-diagnostic.js) applique le remap des
// références de production sur la donnée LIVE via cleSource()+db. Invariants vérifiés :
//   - dry-run PAR DÉFAUT : aucune écriture ;
//   - apply : écrit SEULEMENT <trim>_productions (jamais les évaluations) ;
//   - cartouche orpheline : SIGNALÉE mais JAMAIS écrite (évals verrouillées, #350) ;
//   - lecture/écriture routées par cleSource (clés namespacées par trimestre).
//
// Break-test : dans reparerReferencesProductions, retirer la garde `if (dryRun)` autour
// des écritures (toujours écrire) → le test « dry-run n'écrit pas » rougit. Ou faire
// écrire les évals pour la cartouche → le test « cartouche jamais écrite » rougit.

function monter(store, trimestres) {
    const ecrits = [];
    const stubs = {
        db: {
            get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            set: async (k, v) => { ecrits.push({ k, v }); store[k] = v; },
            keys: async () => Object.keys(store)
        },
        // routage simplifié mais fidèle : productions/évals = namespacées ; cartouches_* = globales
        cleSource: (nomCle, trimId) => /^cartouches_/.test(nomCle) ? nomCle : `${trimId}_${nomCle}`,
        obtenirTrimestres: () => (trimestres || [{ id: 'h2026' }]),
        obtenirDonneesSelonMode: () => []
    };
    const win = chargerScript('js/migration-diagnostic.js', stubs, {
        addEventListener: () => {}, removeEventListener: () => {}
    });
    return { win, ecrits, store };
}

const PROD_STALE = () => ({
    h2026_productions: [{ id: 'P1', grilleId: 'STALE' }],
    h2026_evaluationsSauvegardees: [
        { id: 'E1', productionId: 'P1', grilleId: 'ISO' },
        { id: 'E2', productionId: 'P1', grilleId: 'ISO' }
    ]
});

describe('Brique D · BLOC 2 · reparerReferencesProductions (live)', () => {
    it('expose la fonction', () => {
        const { win } = monter(PROD_STALE());
        expect(typeof win.reparerReferencesProductions).toBe('function');
    });

    it('dry-run par défaut : calcule le remap mais N’ÉCRIT RIEN', async () => {
        const { win, ecrits, store } = monter(PROD_STALE());
        const res = await win.reparerReferencesProductions();
        expect(res.remaps).toHaveLength(1);
        expect(res.remaps[0]).toMatchObject({ trimestre: 'h2026', champ: 'grilleId', de: 'STALE', vers: 'ISO' });
        expect(res.ecrit).toBe(false);
        expect(ecrits).toHaveLength(0);
        expect(store.h2026_productions[0].grilleId).toBe('STALE'); // intact
    });

    it('apply : écrit SEULEMENT <trim>_productions, avec le champ remappé', async () => {
        const { win, ecrits, store } = monter(PROD_STALE());
        const res = await win.reparerReferencesProductions({ dryRun: false });
        expect(res.ecrit).toBe(true);
        expect(ecrits).toHaveLength(1);
        expect(ecrits[0].k).toBe('h2026_productions');
        expect(store.h2026_productions[0].grilleId).toBe('ISO');
        // les évaluations ne sont JAMAIS réécrites
        expect(ecrits.some(e => e.k === 'h2026_evaluationsSauvegardees')).toBe(false);
    });

    it('apply idempotent : données déjà propres ⇒ aucune écriture', async () => {
        const { win, ecrits } = monter({
            h2026_productions: [{ id: 'P1', grilleId: 'ISO' }],
            h2026_evaluationsSauvegardees: [{ id: 'E1', productionId: 'P1', grilleId: 'ISO' }]
        });
        const res = await win.reparerReferencesProductions({ dryRun: false });
        expect(res.ecrit).toBe(false);
        expect(ecrits).toHaveLength(0);
    });

    it('cartouche orpheline : SIGNALÉE mais l’évaluation n’est JAMAIS réécrite', async () => {
        const store = {
            h2026_productions: [{ id: 'P1', grilleId: 'ISO' }],
            h2026_evaluationsSauvegardees: [
                { id: 'E1', productionId: 'P1', grilleId: 'ISO', cartoucheId: 'DISPARUE', verrouillee: true }
            ],
            'cartouches_ISO': [{ id: 'VIVANTE' }]
        };
        const { win, ecrits } = monter(store);
        const res = await win.reparerReferencesProductions({ dryRun: false, cartouches: true });
        expect(res.cartouches).toHaveLength(1);
        expect(res.cartouches[0]).toMatchObject({ cartoucheId: 'DISPARUE', nbEvals: 1, nbVerrouillees: 1 });
        // jamais d'écriture des évaluations, et la cartoucheId reste pendante (conservée)
        expect(ecrits.some(e => e.k === 'h2026_evaluationsSauvegardees')).toBe(false);
        expect(store.h2026_evaluationsSauvegardees[0].cartoucheId).toBe('DISPARUE');
    });

    it('route par trimestre via cleSource (a2025 + h2026) et ignore les évals divergentes', async () => {
        const store = {
            a2025_productions: [{ id: 'PA', grilleId: 'X' }],            // évals divergentes ⇒ pas de remap
            a2025_evaluationsSauvegardees: [
                { id: 'EA1', productionId: 'PA', grilleId: 'G1' },
                { id: 'EA2', productionId: 'PA', grilleId: 'G2' }
            ],
            h2026_productions: [{ id: 'PH', grilleId: '' }],            // vide ⇒ rempli
            h2026_evaluationsSauvegardees: [{ id: 'EH1', productionId: 'PH', grilleId: 'GH' }]
        };
        const { win, ecrits } = monter(store, [{ id: 'a2025' }, { id: 'h2026' }]);
        const res = await win.reparerReferencesProductions({ dryRun: false });
        expect(res.remaps).toHaveLength(1);
        expect(res.remaps[0]).toMatchObject({ trimestre: 'h2026', productionId: 'PH', de: '', vers: 'GH' });
        expect(ecrits.map(e => e.k)).toEqual(['h2026_productions']);
        expect(store.a2025_productions[0].grilleId).toBe('X'); // divergent ⇒ intact
    });
});
