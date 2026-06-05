import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Session C (#303) Lot 4 — fold pan-objectifs ⊂ standards (décision D1).
// L'instance séparée PratiquePANObjectifs a été retirée ; tout id legacy
// 'pan-objectifs' résout désormais vers l'instance Standards (la variante
// par-objectifs vit dans PratiquePANStandards). Pas de portage de logique :
// aucune donnée de production n'utilisait pan-objectifs comme pratique active
// (audit confirmé). Cette sentinelle verrouille la résolution + la représentation.

const db = {
    getSync: (k, d) => (d !== undefined ? d : null),
    setSync: () => {}, get: async () => null, set: async () => {}
};
const cle = (k) => k;

let win;
beforeAll(() => {
    win = chargerScript('js/pratiques/pratique-registre.js', { db, cle });
    chargerScript('js/pratiques/pratique-pan-standards.js', { db, cle }, win);
});

describe('Session C Lot 4 · fold pan-objectifs ⊂ standards', () => {
    it('normaliserIdPratique folde pan-objectifs → standards', () => {
        expect(win.normaliserIdPratique('pan-objectifs')).toBe('standards');
    });

    it('obtenirPratiqueParId(pan-objectifs) résout vers l\'instance Standards', () => {
        const inst = win.obtenirPratiqueParId('pan-objectifs');
        expect(inst).toBeTruthy();
        expect(inst.obtenirId()).toBe('standards');
        // Plus jamais l'ancien id séparé.
        expect(inst.obtenirId()).not.toBe('pan-objectifs');
    });

    it('la représentation reste STD / PAN (affichage inchangé)', () => {
        expect(win.obtenirCodePratique('pan-objectifs')).toBe('STD');
        expect(win.obtenirLabelFamillePratique('pan-objectifs')).toBe('PAN');
        expect(win.obtenirRepresentationPratiqueStricte('pan-objectifs').code).toBe('STD');
    });

    it('l\'instance séparée PratiquePANObjectifs n\'est plus chargée', () => {
        expect(win.PratiquePANObjectifs).toBeUndefined();
    });
});
