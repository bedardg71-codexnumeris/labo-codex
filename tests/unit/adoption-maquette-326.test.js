import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #326 R1 — adoption d'une maquette (SPEC §3.3 + invariant CC §3.1/§5).
// adopterMaquette(id) : estMaquette → false ; inspireDe/sourceId INTACTS.
// (Renommage R1 : « promouvoir une variante d'essai » → « adopter une maquette ».)

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
const adopter = win.adopterMaquette;

const maquette = () => ({
    id: 'p_maquette', nom: 'Maquette A', estMaquette: true,
    inspireDe: { nom: 'Souche', auteur: 'Greg', date: '2026-06-10', sourceId: 'p_souche' },
    config: { id: 'p_maquette', nom: 'Maquette A', calcul_note: { methode: 'moyenne_ponderee' } }
});

beforeEach(() => {
    store = { 'h2026_pratiquesConfigurables': [maquette()] };
});

describe('#326 R1 · adopterMaquette', () => {
    it('bascule estMaquette à false et persiste', async () => {
        const ok = await adopter('p_maquette');
        expect(ok).toBe(true);
        const apres = store['h2026_pratiquesConfigurables'].find(p => p.id === 'p_maquette');
        expect(apres.estMaquette).toBe(false);
    });

    it('INVARIANT CC : inspireDe/sourceId restent intacts', async () => {
        const avant = JSON.stringify(maquette().inspireDe);
        await adopter('p_maquette');
        const apres = store['h2026_pratiquesConfigurables'].find(p => p.id === 'p_maquette');
        expect(JSON.stringify(apres.inspireDe)).toBe(avant);
        expect(apres.inspireDe.sourceId).toBe('p_souche');
    });

    it('ne duplique pas la pratique (bascule en place, même id)', async () => {
        await adopter('p_maquette');
        expect(store['h2026_pratiquesConfigurables']).toHaveLength(1);
    });

    it('pratique déjà aboutie (estMaquette absent/false) → false, aucune écriture', async () => {
        store['h2026_pratiquesConfigurables'] = [{ id: 'p_abouti', nom: 'X', config: {} }];
        const snapshot = JSON.stringify(store);
        expect(await adopter('p_abouti')).toBe(false);
        expect(JSON.stringify(store)).toBe(snapshot);
    });

    it('id introuvable → false', async () => {
        expect(await adopter('inexistant')).toBe(false);
    });
});
