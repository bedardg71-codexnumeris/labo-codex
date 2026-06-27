import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// La fonction émet son rapport via console.warn — neutralisé pour garder la sortie propre.
let _spyWarn;
beforeAll(() => { _spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterAll(() => { _spyWarn.mockRestore(); });

// Brique D — hygiène namespacing coursId — FONCTION CONSOLE LIVE (juin 2026).
// window.reparerCoursIdProductions (migration-diagnostic.js) réaligne production.coursId
// sur l'id de cours UNANIME des évaluations, sur la donnée LIVE via cleSource()+db.
// Invariants vérifiés :
//   - dry-run PAR DÉFAUT : aucune écriture ;
//   - apply : écrit SEULEMENT <trim>_productions (jamais les évaluations) ;
//   - AUTO-LIMITÉ : un trimestre cohérent (A24/A25, ancien id légitime partagé) n'est PAS touché ;
//   - lecture/écriture routées par cleSource (clés namespacées par trimestre).
// Cette sentinelle couvre la fonction LIVE elle-même (l'algorithme pur est testé à part dans
// sentinelle-reparer-coursid-productions.test.js).
//
// Break-test : dans reparerCoursIdProductions, retirer la garde `if (!dryRun)` autour de la
// mutation/écriture → le test « dry-run n'écrit pas » rougit. Ou retirer la garde « déjà aligné »
// → le test cross-trimestre (a2025 intact) rougit.

function monter(store, trimestres) {
    const ecrits = [];
    const stubs = {
        db: {
            get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            set: async (k, v) => { ecrits.push({ k, v }); store[k] = v; },
            keys: async () => Object.keys(store)
        },
        cleSource: (nomCle, trimId) => /^cartouches_/.test(nomCle) ? nomCle : `${trimId}_${nomCle}`,
        obtenirTrimestres: () => (trimestres || [{ id: 'h2026' }]),
        obtenirDonneesSelonMode: () => []
    };
    const win = chargerScript('js/migration-diagnostic.js', stubs, {
        addEventListener: () => {}, removeEventListener: () => {}
    });
    return { win, ecrits, store };
}

const COURS_STALE = () => ({
    h2026_productions: [{ id: 'P1', titre: 'Artefact 3', coursId: 'COURS_LEGACY' }],
    h2026_evaluationsSauvegardees: [
        { id: 'E1', productionId: 'P1', coursId: 'h2026-601-101-MQ-00001' },
        { id: 'E2', productionId: 'P1', coursId: 'h2026-601-101-MQ-00001' }
    ]
});

describe('Brique D · reparerCoursIdProductions (live)', () => {
    it('expose la fonction', () => {
        const { win } = monter(COURS_STALE());
        expect(typeof win.reparerCoursIdProductions).toBe('function');
    });

    it('dry-run par défaut : calcule le remap mais N’ÉCRIT RIEN', async () => {
        const { win, ecrits, store } = monter(COURS_STALE());
        const res = await win.reparerCoursIdProductions();
        expect(res.remaps).toHaveLength(1);
        expect(res.remaps[0]).toMatchObject({ trimestre: 'h2026', champ: 'coursId', de: 'COURS_LEGACY', vers: 'h2026-601-101-MQ-00001' });
        expect(res.ecrit).toBe(false);
        expect(ecrits).toHaveLength(0);
        expect(store.h2026_productions[0].coursId).toBe('COURS_LEGACY'); // intact
    });

    it('apply : écrit SEULEMENT <trim>_productions, avec le coursId remappé', async () => {
        const { win, ecrits, store } = monter(COURS_STALE());
        const res = await win.reparerCoursIdProductions({ dryRun: false });
        expect(res.ecrit).toBe(true);
        expect(ecrits).toHaveLength(1);
        expect(ecrits[0].k).toBe('h2026_productions');
        expect(store.h2026_productions[0].coursId).toBe('h2026-601-101-MQ-00001');
        // les évaluations ne sont JAMAIS réécrites
        expect(ecrits.some(e => e.k === 'h2026_evaluationsSauvegardees')).toBe(false);
    });

    it('apply idempotent : coursId déjà propres ⇒ aucune écriture', async () => {
        const { win, ecrits } = monter({
            h2026_productions: [{ id: 'P1', coursId: 'h2026-601-101-MQ-00001' }],
            h2026_evaluationsSauvegardees: [{ id: 'E1', productionId: 'P1', coursId: 'h2026-601-101-MQ-00001' }]
        });
        const res = await win.reparerCoursIdProductions({ dryRun: false });
        expect(res.ecrit).toBe(false);
        expect(ecrits).toHaveLength(0);
    });

    it('conteneur sans évaluation : NON touché (pas de signal unanime)', async () => {
        const { win, ecrits, store } = monter({
            h2026_productions: [{ id: 'PORTFOLIO', titre: 'Portfolio', coursId: 'COURS_LEGACY' }],
            h2026_evaluationsSauvegardees: [{ id: 'E1', productionId: 'AUTRE', coursId: 'h2026-601-101-MQ-00001' }]
        });
        const res = await win.reparerCoursIdProductions({ dryRun: false });
        expect(res.remaps).toHaveLength(0);
        expect(ecrits).toHaveLength(0);
        expect(store.h2026_productions[0].coursId).toBe('COURS_LEGACY'); // intact
    });

    it('route par trimestre via cleSource : a2025 cohérent INTACT, seul h2026 désaligné est écrit', async () => {
        const store = {
            // a2025 : productions ET évals portent l'ancien id LÉGITIME ⇒ cohérent ⇒ pas de remap
            a2025_productions: [{ id: 'PA', coursId: 'COURS1766455789356' }],
            a2025_evaluationsSauvegardees: [{ id: 'EA1', productionId: 'PA', coursId: 'COURS1766455789356' }],
            // h2026 : production sur l'ancien id, évals sur l'id canonique ⇒ remap
            h2026_productions: [{ id: 'PH', coursId: 'COURS1766455789356' }],
            h2026_evaluationsSauvegardees: [{ id: 'EH1', productionId: 'PH', coursId: 'h2026-601-101-MQ-00001' }]
        };
        const { win, ecrits } = monter(store, [{ id: 'a2025' }, { id: 'h2026' }]);
        const res = await win.reparerCoursIdProductions({ dryRun: false });
        expect(res.remaps).toHaveLength(1);
        expect(res.remaps[0]).toMatchObject({ trimestre: 'h2026', productionId: 'PH', de: 'COURS1766455789356', vers: 'h2026-601-101-MQ-00001' });
        expect(ecrits.map(e => e.k)).toEqual(['h2026_productions']);
        expect(store.a2025_productions[0].coursId).toBe('COURS1766455789356'); // ancien id légitime ⇒ intact
    });
});
