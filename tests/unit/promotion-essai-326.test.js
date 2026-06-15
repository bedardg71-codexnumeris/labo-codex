import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #326 D-2 — promotion d'une variante d'essai (SPEC §3.3 + invariant CC §3.1/§5).
// promouvoirPratiqueEssai(id) : estEssai → false ; inspireDe/sourceId INTACTS.

let store;
const db = {
    getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
    setSync: (k, v) => { store[k] = v; },
    set: async (k, v) => { store[k] = v; },
    get: async (k, d) => (k in store ? store[k] : d)
};
const cle = (k) => `h2026_${k}`;

const win = chargerScript('js/pratiques.js', {
    db, cle,
    PratiqueManager: { sauvegarderPratique: async () => {}, supprimerPratique: async () => {} },
    BibliothequeUI: {}
});
const promouvoir = win.promouvoirPratiqueEssai;

const essai = () => ({
    id: 'p_essai', nom: 'Variante A', estEssai: true,
    inspireDe: { nom: 'Souche', auteur: 'Greg', date: '2026-06-10', sourceId: 'p_souche' },
    config: { id: 'p_essai', nom: 'Variante A', calcul_note: { methode: 'moyenne_ponderee' } }
});

beforeEach(() => {
    store = { 'h2026_pratiquesConfigurables': [essai()] };
});

describe('#326 D-2 · promouvoirPratiqueEssai', () => {
    it('bascule estEssai à false et persiste', async () => {
        const ok = await promouvoir('p_essai');
        expect(ok).toBe(true);
        const apres = store['h2026_pratiquesConfigurables'].find(p => p.id === 'p_essai');
        expect(apres.estEssai).toBe(false);
    });

    it('INVARIANT CC : inspireDe/sourceId restent intacts', async () => {
        const avant = JSON.stringify(essai().inspireDe);
        await promouvoir('p_essai');
        const apres = store['h2026_pratiquesConfigurables'].find(p => p.id === 'p_essai');
        expect(JSON.stringify(apres.inspireDe)).toBe(avant);
        expect(apres.inspireDe.sourceId).toBe('p_souche');
    });

    it('ne duplique pas la pratique (bascule en place, même id)', async () => {
        await promouvoir('p_essai');
        expect(store['h2026_pratiquesConfigurables']).toHaveLength(1);
    });

    it('pratique déjà aboutie (estEssai absent/false) → false, aucune écriture', async () => {
        store['h2026_pratiquesConfigurables'] = [{ id: 'p_abouti', nom: 'X', config: {} }];
        const snapshot = JSON.stringify(store);
        expect(await promouvoir('p_abouti')).toBe(false);
        expect(JSON.stringify(store)).toBe(snapshot);
    });

    it('id introuvable → false', async () => {
        expect(await promouvoir('inexistant')).toBe(false);
    });
});
