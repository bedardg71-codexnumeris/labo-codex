import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Session C (#303) Lot 1 — seam `_modalites()` (décision b).
// Les instances codées en dur lisent leurs modalités via _modalites() :
//  - pas de this.config (cas du singleton ACTIF) → repli sur le SSOT global
//    → comportement STRICTEMENT identique à avant (preuve d'invariant).
//  - this.config.modalites présent (cas d'une instance SIMULÉE #307) → utilise
//    la config propre, sans toucher l'état global.

const MODALITES_GLOBAL = { marqueur: 'GLOBAL', varianteCalcul: 'standard', configPAN: { nombreARetenir: 3 } };
const store = { modalitesEvaluation: MODALITES_GLOBAL };
const db = {
    getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
    setSync: () => {}, get: async () => null, set: async () => {}
};
const cle = (k) => k;

let standards;

beforeAll(() => {
    const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle });
    chargerScript('js/pratiques/pratique-pan-standards.js', { db, cle }, win);
    standards = win.obtenirPratiqueParId('standards');
});

describe('Session C Lot 1 · seam _modalites()', () => {
    it('résout l\'instance codée en dur', () => {
        expect(standards?.obtenirId()).toBe('standards');
        expect(typeof standards._modalites).toBe('function');
    });

    it('sans this.config → repli sur le SSOT global (no-op, invariant)', () => {
        // L'instance active (singleton) n'a pas de this.config → global identique à avant.
        expect(standards.config).toBeUndefined();
        expect(standards._modalites()).toBe(MODALITES_GLOBAL);
    });

    it('avec this.config.modalites → utilise la config propre (simulation #307)', () => {
        const sim = Object.create(Object.getPrototypeOf(standards));
        sim.config = { modalites: { marqueur: 'SIMULATION', varianteCalcul: 'standard' } };
        expect(sim._modalites().marqueur).toBe('SIMULATION');
        // Le global n'est pas touché.
        expect(standards._modalites().marqueur).toBe('GLOBAL');
    });
});
