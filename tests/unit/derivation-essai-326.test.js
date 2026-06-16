import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #326 D-3 — dérivation d'une variante d'essai (SPEC §8).
// deriverVarianteEssai(sourceId) : nom auto « <souche> · essai N », duplication
// AVEC estEssai:true + inspireDe.sourceId (via forgerInspireDe), puis ouverture
// de l'assistant (editerPratique → ouvrirWizardV2(true, newId)).
//
// FIX terrain 16 juin : dupliquerPratique lisait `original.config`, mais les
// pratiques du wizard rangent leur config sous `.configuration` (+ racine).
// → `JSON.parse(JSON.stringify(undefined))` levait, et `silencieux:true` avalait
// l'erreur → « Dériver » sans effet. Le fix résout la config via construireConfigComplete.

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

// Reflète la VRAIE validation de PratiqueManager.sauvegarderPratique
// (new PratiqueConfigurable(pratique.config) exige id/nom/calcul_note à la racine).
const PratiqueManager = {
    sauvegarderPratique: async (p) => {
        if (!p.config || !p.config.id || !p.config.nom || !p.config.calcul_note) {
            throw new Error('Champ obligatoire manquant (config invalide)');
        }
        store['h2026_pratiquesConfigurables'].push(p);
    },
    supprimerPratique: async () => {}
};
const BibliothequeUI = {
    obtenirAuteurActif: () => 'Grégoire',
    forgerInspireDe: (s) => ({ nom: s.nom, auteur: s.auteur || 'Inconnu', date: '2026-06-16', sourceId: s.id })
};
// Mime construireConfigComplete : résout la config quelle que soit la forme
// stockée (.config legacy OU .configuration + racine du wizard).
const construireConfigComplete = (p) => {
    const c = p.config || {};
    return {
        id: c.id || p.id,
        nom: c.nom || p.nom,
        type: c.type || p.type || (p.configuration && p.configuration.type),
        calcul_note: c.calcul_note || p.calcul_note || { methode: 'conversion_niveaux' },
        echelle: c.echelle || p.echelle,
        portfolio: c.portfolio || (p.configuration && p.configuration.portfolio),
        configuration: p.configuration
    };
};

const win = chargerScript('js/pratiques.js', {
    db, cle, PratiqueManager, BibliothequeUI, construireConfigComplete,
    genererIdUnique: (p) => p + (++compteurId),
    ouvrirWizardV2: (mode, id) => { wizardOuvert = { mode, id }; }
});
const deriver = win.deriverVarianteEssai;

// Souche AU FORMAT WIZARD : config sous `.configuration` (+ racine), PAS `.config`.
// C'est exactement la forme qui faisait planter dupliquerPratique sur le terrain.
const soucheWizard = () => ({
    id: 'p_souche', nom: 'Standards Bédard', auteur: 'Grégoire',
    type: 'standards',
    calcul_note: { methode: 'conversion_niveaux' },
    echelle: { type: 'niveaux', niveaux: [{ code: 'A', valeur_pourcentage: 90 }] },
    configuration: { type: 'standards', portfolio: { nombreARetenir: 3 } }
    // NB : aucun champ `.config` — c'est le piège.
});

beforeEach(() => {
    store = { 'h2026_pratiquesConfigurables': [soucheWizard()] };
    wizardOuvert = null;
    compteurId = 0;
});

describe('#326 D-3 · deriverVarianteEssai (source au format wizard — régression terrain)', () => {
    it('dérive sans planter et crée une variante à la config VALIDE', async () => {
        const id = await deriver('p_souche');
        expect(id).toBeTruthy();
        const variante = store['h2026_pratiquesConfigurables'].find(p => p.id === id);
        expect(variante).toBeTruthy();
        // La config résolue est présente et valide (le bug rendait copie.config undefined).
        expect(variante.config).toBeTruthy();
        expect(variante.config.id).toBe(id);
        expect(variante.config.calcul_note).toBeTruthy();
    });

    it('crée une variante estEssai:true avec inspireDe.sourceId = souche', async () => {
        const id = await deriver('p_souche');
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
