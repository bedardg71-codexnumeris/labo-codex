import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #333 Lot 1 (export des résultats finaux) — récit de calcul DEN.
//
// Le chemin de récit UNIFIÉ de simulerIndices couvrait déjà SOM/SPE (via leur
// `decrireCalcul`) et STD (via `calculerDetailsNoteFinale.recit`) ; DEN était le
// seul trou (recit=null). Ce lot ajoute `PratiqueConfigurable.decrireCalcul` pour
// les pratiques DEN (jugement_global), additif et lecture seule, avec PARITÉ de la
// note (réutilise `_calculerPerformanceDenotation`, garde « cibles → 59 »).

let store;
const db = {
    getSync: (k, def) => (k in store ? store[k] : (def !== undefined ? def : null)),
    setSync: (k, v) => { store[k] = v; }
};
const cle = (k) => `h2026_${k}`;

const win = chargerScript('js/pratiques/denotation-jugements.js', { db, cle });
chargerScript('js/pratiques/pratique-configurable.js', { db, cle }, win);
// La famille (obtenirCode) est déléguée au registre, absent du sandbox : on la stube.
win.obtenirCodePratique = () => 'DEN';

const configDEN = () => ({
    id: 'pDEN',
    nom: 'Démonstration Dénotation',
    calcul_note: { methode: 'jugement_global' },
    objectifs: [{ id: 'o1', nom: 'Cible 1' }, { id: 'o2', nom: 'Cible 2' }]
});

const configSOM = () => ({
    id: 'pSOM',
    nom: 'Sommative configurable',
    calcul_note: { methode: 'moyenne_ponderee' }
});

const seedSaisie = (saisie) => {
    store['h2026_jugementsDenotation'] = { pDEN: { DA1: saisie } };
};

describe('#333 · PratiqueConfigurable.decrireCalcul (Dénotation)', () => {
    beforeEach(() => { store = {}; });

    it('toutes cibles confirmées → récit DEN avec note saisie, sans plafonnement', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        seedSaisie({ ciblesAtteintes: { o1: true, o2: true }, noteFinale: 78, justification: 'Maîtrise démontrée.' });
        const recit = inst.decrireCalcul('DA1');

        expect(recit).not.toBeNull();
        expect(recit.famille).toBe('DEN');
        expect(recit.pratiqueNom).toBe('Démonstration Dénotation');
        expect(recit.synthese.noteFinale).toBe(78);
        expect(recit.synthese.plafonnement).toBeNull();
        expect(recit.synthese.justification).toBe('Maîtrise démontrée.');
        // Une ligne par cible, toutes confirmées.
        expect(recit.resultats).toHaveLength(2);
        expect(recit.resultats.every(r => r.sort === 'compte')).toBe(true);
        expect(recit.resultats[0].label).toBe('Cible 1');
        // DEN ne note pas la cible (note/niveau null) — elle la confirme.
        expect(recit.resultats[0].note).toBeNull();
        expect(recit.resultats[0].niveau).toBeNull();
    });

    it('une cible non confirmée → note plafonnée à 59 + plafonnement signalé', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        seedSaisie({ ciblesAtteintes: { o1: true, o2: false }, noteFinale: 85 });
        const recit = inst.decrireCalcul('DA1');

        expect(recit.synthese.noteFinale).toBe(59);
        expect(recit.synthese.plafonnement).toEqual({ type: 'cibles-non-atteintes', noteGardee: 59 });
        const sorts = recit.resultats.map(r => r.sort);
        expect(sorts).toEqual(['compte', 'ecarte']);
        expect(recit.resultats[1].detail).toMatch(/non confirmée/);
    });

    it('parité : recit.synthese.noteFinale === calculerPerformance × 100', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        seedSaisie({ ciblesAtteintes: { o1: true, o2: true }, noteFinale: 73 });
        const recit = inst.decrireCalcul('DA1');
        expect(recit.synthese.noteFinale).toBeCloseTo(inst.calculerPerformance('DA1') * 100, 10);
    });

    it('aucune saisie → null (note non encore arrêtée, jamais un zéro)', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        expect(inst.decrireCalcul('DA1')).toBeNull();
    });

    it('pratique configurable NON-DEN → null (aucune régression : recit restait null)', () => {
        const inst = new win.PratiqueConfigurable(configSOM());
        expect(inst.decrireCalcul('DA1')).toBeNull();
    });

    it('da absent → null sans lever', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        expect(inst.decrireCalcul('')).toBeNull();
        expect(inst.decrireCalcul(null)).toBeNull();
    });

    it('module denotationJugements absent → null sans lever', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        seedSaisie({ ciblesAtteintes: { o1: true, o2: true }, noteFinale: 78 });
        const sauv = win.denotationJugements;
        delete win.denotationJugements;
        try {
            expect(inst.decrireCalcul('DA1')).toBeNull();
        } finally {
            win.denotationJugements = sauv;
        }
    });

    it('lecture seule : decrireCalcul n\'écrit jamais dans jugementsDenotation', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        seedSaisie({ ciblesAtteintes: { o1: true, o2: true }, noteFinale: 78 });
        const avant = JSON.stringify(store['h2026_jugementsDenotation']);
        inst.decrireCalcul('DA1');
        expect(JSON.stringify(store['h2026_jugementsDenotation'])).toBe(avant);
    });
});
