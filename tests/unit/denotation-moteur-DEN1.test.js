import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Lot DEN-1 (#318, Dénotation couche 2) — moteur.
// Couvre les deux livrables du lot :
//  1. suggererNoteHolistique : helper PUR extrait de _calculerModeHolistique,
//     avec PARITÉ STD (golden master + délégation de la méthode).
//  2. _calculerPerformanceDenotation : garde « cibles atteintes » par cible
//     (manquante → 59, toutes → note saisie), pas de saisie → null (RREC : la
//     présence d'une saisie produit TOUJOURS un chiffre).

// --- Stubs partagés ---------------------------------------------------------
let store;
const db = {
    getSync: (k, def) => (k in store ? store[k] : (def !== undefined ? def : null)),
    setSync: (k, v) => { store[k] = v; }
};
const cle = (k) => `h2026_${k}`;

// ============================================================================
// 1. Helper partagé suggererNoteHolistique (golden master)
// ============================================================================

// fauxWindow pré-gréé : stub enregistrerPratique pour éviter le console.error
// de l'auto-enregistrement (le registre n'est pas chargé dans ce sandbox).
const winStd = { enregistrerPratique: () => {} };
chargerScript('js/pratiques/pratique-pan-standards.js', { db, cle }, winStd);
const suggererNoteHolistique = winStd.suggererNoteHolistique;

const niveaux = (...notes) => notes.map(n => (n === null ? null : { note: n }));

describe('DEN-1 · suggererNoteHolistique (helper partagé, golden master)', () => {
    it('mode : la note la plus fréquente', () => {
        expect(suggererNoteHolistique(niveaux(0.8, 0.8, 0.65), 'mode')).toBeCloseTo(0.8, 10);
    });
    it('médiane (impair) : valeur centrale', () => {
        expect(suggererNoteHolistique(niveaux(0.5, 0.8, 0.65), 'mediane')).toBeCloseTo(0.65, 10);
    });
    it('médiane (pair) : moyenne des deux centrales', () => {
        expect(suggererNoteHolistique(niveaux(0.5, 0.8, 0.65, 0.95), 'mediane')).toBeCloseTo(0.725, 10);
    });
    it('moyenne : moyenne arithmétique', () => {
        expect(suggererNoteHolistique(niveaux(0.5, 0.8, 0.65), 'moyenne')).toBeCloseTo(0.65, 10);
    });
    it('méthode inconnue → repli sur moyenne', () => {
        expect(suggererNoteHolistique(niveaux(0.5, 0.8, 0.65), 'inconnue')).toBeCloseTo(0.65, 10);
    });
    it('ignore les objectifs sans note (null)', () => {
        expect(suggererNoteHolistique(niveaux(0.8, null, 0.65), 'moyenne')).toBeCloseTo(0.725, 10);
    });
    it('aucune note exploitable → null', () => {
        expect(suggererNoteHolistique(niveaux(null, null), 'moyenne')).toBeNull();
        expect(suggererNoteHolistique([], 'mode')).toBeNull();
        expect(suggererNoteHolistique(null, 'mode')).toBeNull();
    });
});

describe('DEN-1 · survie des deux dépendances STD de la suggestion DEN (post-#435)', () => {
    // #435 (9 août 2026) a retiré _calculerModeHolistique et les trois autres
    // modes « par objectifs » du moteur STD (extension de #396 — chemin jamais
    // fonctionnel). Le test de parité méthode↔helper n'a donc plus de sujet :
    // la parité valait tant que DEUX chemins coexistaient ; il n'en reste qu'un.
    // Ce qui doit survivre — et que ce bloc verrouille — ce sont les deux
    // dépendances de la suggestion holistique DEN (denotation-saisie-ui.js) :
    // le helper pur (golden master ci-dessus) et _calculerNiveauxParObjectif.
    it('_calculerNiveauxParObjectif existe toujours sur l’instance STD (DEN s’en sert)', () => {
        const std = new winStd.PratiquePANStandards();
        expect(typeof std._calculerNiveauxParObjectif).toBe('function');
    });
    it('le moteur par objectifs, lui, ne revient pas (cliquet, même famille que #396)', () => {
        const std = new winStd.PratiquePANStandards();
        for (const morte of ['_calculerPerformanceParObjectifs', '_calculerModeComptage',
                             '_calculerModeMoyennePonderee', '_calculerModeSeuilsCritiques',
                             '_calculerModeHolistique', '_convertirNoteEnNiveau']) {
            expect(std[morte], morte).toBeUndefined();
        }
    });
});

// ============================================================================
// 2. Moteur DEN : _calculerPerformanceDenotation + court-circuit
// ============================================================================

const win = chargerScript('js/pratiques/denotation-jugements.js', { db, cle });
chargerScript('js/pratiques/pratique-configurable.js', { db, cle }, win);

const configDEN = () => ({
    id: 'pDEN',
    nom: 'Démonstration Dénotation',
    calcul_note: { methode: 'jugement_global' },
    objectifs: [{ id: 'o1', nom: 'Cible 1' }, { id: 'o2', nom: 'Cible 2' }]
});

const seedSaisie = (saisie) => {
    store['h2026_jugementsDenotation'] = { pDEN: { DA1: saisie } };
};

describe('DEN-1 · moteur _calculerPerformanceDenotation (garde cibles + RREC)', () => {
    beforeEach(() => { store = {}; });

    it('toutes les cibles confirmées → la note saisie (P en 0-1)', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        seedSaisie({ ciblesAtteintes: { o1: true, o2: true }, noteFinale: 78 });
        expect(inst.calculerPerformance('DA1')).toBeCloseTo(0.78, 10);
    });

    it('une cible manquante → plafonné à 59 (RREC échec), jamais ≥ 60', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        seedSaisie({ ciblesAtteintes: { o1: true, o2: false }, noteFinale: 85 });
        expect(inst.calculerPerformance('DA1')).toBeCloseTo(0.59, 10);
    });

    it('cible manquante mais note déjà sous 60 → note inchangée (toujours un chiffre)', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        seedSaisie({ ciblesAtteintes: { o1: true }, noteFinale: 40 });
        expect(inst.calculerPerformance('DA1')).toBeCloseTo(0.40, 10);
    });

    it('aucune saisie → null (non calculable, pas un zéro)', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        expect(inst.calculerPerformance('DA1')).toBeNull();
    });

    it('saisie sans note finale numérique → 0, plafonné par la garde si besoin', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        seedSaisie({ ciblesAtteintes: { o1: true, o2: true } }); // noteFinale absente
        expect(inst.calculerPerformance('DA1')).toBeCloseTo(0, 10);
    });

    it('module DEN absent → null sans lever', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        seedSaisie({ ciblesAtteintes: { o1: true, o2: true }, noteFinale: 78 });
        const sauv = win.denotationJugements;
        delete win.denotationJugements;
        try {
            expect(inst.calculerPerformance('DA1')).toBeNull();
        } finally {
            win.denotationJugements = sauv;
        }
    });

    it('lecture seule : le calcul n\'écrit jamais dans jugementsDenotation', () => {
        const inst = new win.PratiqueConfigurable(configDEN());
        seedSaisie({ ciblesAtteintes: { o1: true, o2: true }, noteFinale: 78 });
        const avant = JSON.stringify(store['h2026_jugementsDenotation']);
        inst.calculerPerformance('DA1');
        expect(JSON.stringify(store['h2026_jugementsDenotation'])).toBe(avant);
    });
});
