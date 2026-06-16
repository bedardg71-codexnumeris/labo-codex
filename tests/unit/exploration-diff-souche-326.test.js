import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #326 D-4 — helpers purs du « diff avant matrice ».
// partagentSouche : n'afficher le diff que pour des variantes d'une même base.
// phrasesEffetEntreConfigs : diff résolu → phrases « ce que ça change ».

const win = chargerScript('js/pratiques/pratiques-exploration.js');
const { partagentSouche, phrasesEffetEntreConfigs } = win.ExplorationPratiques;

const p = (id, sourceId) => ({ id, inspireDe: sourceId ? { sourceId } : undefined });

describe('#326 D-4 · partagentSouche', () => {
    it('vrai si l\'un dérive de l\'autre', () => {
        expect(partagentSouche(p('variante', 'souche'), p('souche'))).toBe(true);
        expect(partagentSouche(p('souche'), p('variante', 'souche'))).toBe(true);
    });
    it('vrai si les deux dérivent de la même souche', () => {
        expect(partagentSouche(p('v1', 'souche'), p('v2', 'souche'))).toBe(true);
    });
    it('faux si aucune filiation commune', () => {
        expect(partagentSouche(p('a'), p('b'))).toBe(false);
        expect(partagentSouche(p('a', 'sx'), p('b', 'sy'))).toBe(false);
    });
    it('faux pour une pratique avec elle-même, ou entrée incomplète', () => {
        expect(partagentSouche(p('a', 's'), p('a', 's'))).toBe(false);
        expect(partagentSouche(null, p('a'))).toBe(false);
        expect(partagentSouche(p('a'), {})).toBe(false);
    });
});

describe('#326 D-4 · phrasesEffetEntreConfigs (diff résolu → phrases)', () => {
    it('produit une phrase d\'effet par réglage changé', () => {
        const a = { id: 'a', nom: 'A', portfolio: { methodeSelection: 'meilleurs' } };
        const b = { id: 'b', nom: 'B', portfolio: { methodeSelection: 'recents' } };
        const out = phrasesEffetEntreConfigs(a, b);
        const sel = out.find(e => e.chemin === 'portfolio.methodeSelection');
        expect(sel).toBeTruthy();
        expect(sel.effet).toMatch(/récents/i);
        // L'identité (id/nom) change aussi mais retombe sur le repli neutre, jamais d'échec.
        expect(out.every(e => typeof e.effet === 'string' && e.effet.length > 0)).toBe(true);
    });
    it('configs identiques → aucune phrase', () => {
        const a = { id: 'x', nom: 'X', portfolio: { nombreARetenir: 3 } };
        expect(phrasesEffetEntreConfigs(a, JSON.parse(JSON.stringify(a)))).toEqual([]);
    });
    it('ne lève jamais (repli neutre garanti)', () => {
        expect(() => phrasesEffetEntreConfigs(null, undefined)).not.toThrow();
    });
});
