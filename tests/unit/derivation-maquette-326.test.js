import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #326 R1 — dérivation d'une maquette (renommage « variante d'essai » → « maquette »).
// deriverMaquette(sourceId) : nom auto « <souche> · maquette N », duplication AVEC
// estMaquette:true + inspireDe.sourceId (via forgerInspireDe). #326 T4 (terrain 21 juin) :
// la dérivation N'OUVRE PLUS le wizard — elle crée la maquette puis l'appelant atterrit
// sur l'arbre d'exploration (édition fine à la demande). Plus de « maquette fantôme »
// (il n'y a plus de wizard à annuler).
//
// GARDE-FOU R1 « max 1 dérivé » : on ne dérive JAMAIS une maquette (profondeur 1).
//
// Régression terrain 16 juin : dupliquerPratique lisait `original.config`, mais les
// pratiques du wizard rangent leur config sous `.configuration` (+ racine).
// → `JSON.parse(JSON.stringify(undefined))` levait, et `silencieux:true` avalait
// l'erreur → « Dériver » sans effet. Le fix résout la config via construireConfigComplete.

let store;
let wizardOuvert;
let compteurId;
let notifs;

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

const notifications = {
    succes: (t, m) => { notifs.push(['succes', t, m]); },
    info: (t, m) => { notifs.push(['info', t, m]); },
    erreur: (t, m) => { notifs.push(['erreur', t, m]); }
};

const win = chargerScript('js/pratiques.js', {
    db, cle, PratiqueManager, BibliothequeUI, construireConfigComplete, notifications,
    genererIdUnique: (p) => p + (++compteurId),
    ouvrirWizardV2: (mode, id) => { wizardOuvert = { mode, id }; }
});
const deriver = win.deriverMaquette;

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
    notifs = [];
});

describe('#326 R1 · deriverMaquette (source au format wizard — régression terrain)', () => {
    it('dérive sans planter et crée une maquette à la config VALIDE', async () => {
        const id = await deriver('p_souche');
        expect(id).toBeTruthy();
        const maquette = store['h2026_pratiquesConfigurables'].find(p => p.id === id);
        expect(maquette).toBeTruthy();
        // La config résolue est présente et valide (le bug rendait copie.config undefined).
        expect(maquette.config).toBeTruthy();
        expect(maquette.config.id).toBe(id);
        expect(maquette.config.calcul_note).toBeTruthy();
    });

    it('crée une maquette estMaquette:true avec inspireDe.sourceId = souche', async () => {
        const id = await deriver('p_souche');
        const maquette = store['h2026_pratiquesConfigurables'].find(p => p.id === id);
        expect(maquette.estMaquette).toBe(true);
        expect(maquette.inspireDe.sourceId).toBe('p_souche');
    });

    it('nom auto « <souche> · maquette N » incrémental', async () => {
        const id1 = await deriver('p_souche');
        const id2 = await deriver('p_souche');
        const v1 = store['h2026_pratiquesConfigurables'].find(p => p.id === id1);
        const v2 = store['h2026_pratiquesConfigurables'].find(p => p.id === id2);
        expect(v1.nom).toBe('Standards Bédard · maquette 1');
        expect(v2.nom).toBe('Standards Bédard · maquette 2');
    });

    it('#326 T4 : N\'OUVRE PAS le wizard — crée la maquette puis atterrit sur l\'arbre', async () => {
        const id = await deriver('p_souche');
        // T4 : plus de wizard parasite à dérouler/annuler.
        expect(wizardOuvert).toBeNull();
        // La maquette est bien créée (l'appelant — dispatcher — rafraîchit l'arbre).
        const maquette = store['h2026_pratiquesConfigurables'].find(p => p.id === id);
        expect(maquette).toBeTruthy();
        expect(maquette.estMaquette).toBe(true);
        // Feedback explicite « Maquette créée » (l'arbre est le lieu d'atterrissage).
        expect(notifs.some(n => n[0] === 'succes')).toBe(true);
    });

    it('GARDE-FOU « max 1 dérivé » : dériver une maquette → null, aucune création', async () => {
        const idMaquette = await deriver('p_souche');           // souche → maquette (OK)
        const nAvant = store['h2026_pratiquesConfigurables'].length;
        wizardOuvert = null;
        const refus = await deriver(idMaquette);                 // maquette → refus
        expect(refus).toBeNull();
        expect(store['h2026_pratiquesConfigurables']).toHaveLength(nAvant);
        expect(wizardOuvert).toBeNull(); // n'ouvre pas l'assistant
    });

    it('source introuvable → null, aucune création', async () => {
        const avant = store['h2026_pratiquesConfigurables'].length;
        expect(await deriver('inexistant')).toBeNull();
        expect(store['h2026_pratiquesConfigurables']).toHaveLength(avant);
    });
});
