import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #326 D-3 — dérivation d'une variante d'essai (SPEC §8).
// deriverVarianteEssai(sourceId) : nom auto « <souche> · essai N », duplication
// AVEC estEssai:true + inspireDe.sourceId (via forgerInspireDe), puis ouverture
// de l'assistant (editerPratique → ouvrirWizardV2(true, newId)).

let store;
let wizardOuvert;
let compteurId;

const db = {
    getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
    setSync: (k, v) => { store[k] = v; },
    set: async (k, v) => { store[k] = v; },
    get: async (k, d) => (k in store ? store[k] : d)
};
const cle = (k) => `h2026_${k}`;

const PratiqueManager = {
    sauvegarderPratique: async (p) => { store['h2026_pratiquesConfigurables'].push(p); },
    supprimerPratique: async () => {}
};
const BibliothequeUI = {
    obtenirAuteurActif: () => 'Grégoire',
    forgerInspireDe: (s) => ({ nom: s.nom, auteur: s.auteur || 'Inconnu', date: '2026-06-15', sourceId: s.id })
};

const win = chargerScript('js/pratiques.js', {
    db, cle, PratiqueManager, BibliothequeUI,
    genererIdUnique: (p) => p + (++compteurId),
    ouvrirWizardV2: (mode, id) => { wizardOuvert = { mode, id }; }
});
const deriver = win.deriverVarianteEssai;

const souche = () => ({
    id: 'p_souche', nom: 'Standards Bédard', auteur: 'Grégoire',
    config: { id: 'p_souche', nom: 'Standards Bédard', calcul_note: { methode: 'conversion_niveaux' }, echelle: { type: 'niveaux', niveaux: [{ code: 'A', valeur_pourcentage: 90 }] } }
});

beforeEach(() => {
    store = { 'h2026_pratiquesConfigurables': [souche()] };
    wizardOuvert = null;
    compteurId = 0;
});

describe('#326 D-3 · deriverVarianteEssai', () => {
    it('crée une variante estEssai:true avec inspireDe.sourceId = souche', async () => {
        const id = await deriver('p_souche');
        expect(id).toBeTruthy();
        const variante = store['h2026_pratiquesConfigurables'].find(p => p.id === id);
        expect(variante.estEssai).toBe(true);
        expect(variante.inspireDe.sourceId).toBe('p_souche');
    });

    it('nom auto « <souche> · essai N » incrémental', async () => {
        const id1 = await deriver('p_souche');
        const id2 = await deriver('p_souche');
        const v1 = store['h2026_pratiquesConfigurables'].find(p => p.id === id1);
        const v2 = store['h2026_pratiquesConfigurables'].find(p => p.id === id2);
        expect(v1.nom).toBe('Standards Bédard · essai 1');
        expect(v2.nom).toBe('Standards Bédard · essai 2');
    });

    it('ouvre l\'assistant sur la nouvelle variante (editerPratique → wizard édition)', async () => {
        const id = await deriver('p_souche');
        expect(wizardOuvert).toEqual({ mode: true, id });
    });

    it('source introuvable → null, aucune création', async () => {
        const avant = store['h2026_pratiquesConfigurables'].length;
        expect(await deriver('inexistant')).toBeNull();
        expect(store['h2026_pratiquesConfigurables']).toHaveLength(avant);
    });
});
