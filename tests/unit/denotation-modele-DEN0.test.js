import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Lot DEN-0 (#318, Dénotation couche 2) — modèle de données.
// Verrouille le contrat posé par js/pratiques/denotation-jugements.js :
//  - reconnaissance d'une pratique DEN et validation du schéma « éliminée » ;
//  - lecture de la saisie NAMESPACÉE par trimestre (window.cle), avec isolation.
// L'écriture de la saisie (UI profil, DEN-2) et le calcul (moteur, DEN-1)
// sont couverts par leurs lots respectifs.

// Store + namespace mutables, partagés avec le module via injection de globaux.
// Le module ne touche ni db ni cle au chargement (aucun effet de bord top-level),
// donc on peut le charger avant le premier beforeEach.
let store;
let ns;
const db = {
    getSync: (k, def) => (k in store ? store[k] : (def !== undefined ? def : null)),
    setSync: (k, v) => { store[k] = v; }
};
const cle = (k) => `${ns}_${k}`;

const win = chargerScript('js/pratiques/denotation-jugements.js', { db, cle });
const DEN = win.denotationJugements;

beforeEach(() => {
    store = {};
    ns = 'h2026';
});

const configValide = () => ({
    type: 'denotation',
    modeDEN: 'eliminee',
    objectifs: [{ id: 'o1', nom: 'Cible 1' }, { id: 'o2', nom: 'Cible 2' }],
    suggestion: { methode: 'mode' }
});

describe('DEN-0 · reconnaissance d\'une pratique DEN', () => {
    it('reconnaît via le type canonique', () => {
        expect(DEN.estPratiqueDenotation({ type: 'denotation' })).toBe(true);
    });
    it('reconnaît via la méthode de calcul jugement_global', () => {
        expect(DEN.estPratiqueDenotation({ calcul_note: { methode: 'jugement_global' } })).toBe(true);
    });
    it('reconnaît via une config brute (configuration.type)', () => {
        expect(DEN.estPratiqueDenotation({ configuration: { type: 'denotation' } })).toBe(true);
    });
    it('rejette une autre famille', () => {
        expect(DEN.estPratiqueDenotation({ type: 'standards', calcul_note: { methode: 'conversion_niveaux' } })).toBe(false);
    });
    it('rejette null/undefined sans lever', () => {
        expect(DEN.estPratiqueDenotation(null)).toBe(false);
        expect(DEN.estPratiqueDenotation(undefined)).toBe(false);
    });
});

describe('DEN-0 · validation du schéma de config « éliminée »', () => {
    it('accepte une config DEN éliminée complète', () => {
        expect(DEN.estConfigDenotationValide(configValide())).toBe(true);
    });
    it('accepte la config emballée dans configuration', () => {
        expect(DEN.estConfigDenotationValide({ configuration: configValide() })).toBe(true);
    });
    it('refuse sans cibles (garde-fou Dyer : jamais de note nue)', () => {
        const c = configValide();
        c.objectifs = [];
        expect(DEN.estConfigDenotationValide(c)).toBe(false);
        delete c.objectifs;
        expect(DEN.estConfigDenotationValide(c)).toBe(false);
    });
    it('refuse un mode non offert au premier lot', () => {
        const c = configValide();
        c.modeDEN = 'reduite';
        expect(DEN.estConfigDenotationValide(c)).toBe(false);
    });
    it('refuse une méthode de suggestion inconnue', () => {
        const c = configValide();
        c.suggestion = { methode: 'aleatoire' };
        expect(DEN.estConfigDenotationValide(c)).toBe(false);
    });
    it('refuse une config non-DEN', () => {
        expect(DEN.estConfigDenotationValide({ type: 'standards' })).toBe(false);
        expect(DEN.estConfigDenotationValide(null)).toBe(false);
    });
    it('expose les méthodes de suggestion attendues (parité STD)', () => {
        expect(DEN.METHODES_SUGGESTION).toEqual(['mode', 'mediane', 'moyenne']);
    });
});

describe('DEN-0 · lecture namespacée de la saisie (window.cle)', () => {
    const saisie = {
        ciblesAtteintes: { o1: true, o2: true },
        noteFinale: 72,
        justification: 'Cibles atteintes, jugement narratif consigné.',
        date: '2026-06-08'
    };

    it('lit la saisie du trimestre actif via la clé namespacée', () => {
        store['h2026_jugementsDenotation'] = { p1: { DA1: saisie } };
        expect(DEN.lireJugementDenotation('p1', 'DA1').noteFinale).toBe(72);
    });
    it('rend null quand l\'étudiant ou la pratique n\'a pas de saisie', () => {
        store['h2026_jugementsDenotation'] = { p1: { DA1: saisie } };
        expect(DEN.lireJugementDenotation('p1', 'DA2')).toBeNull();
        expect(DEN.lireJugementDenotation('pX', 'DA1')).toBeNull();
    });
    it('rend null sur arguments manquants sans lever', () => {
        expect(DEN.lireJugementDenotation(null, 'DA1')).toBeNull();
        expect(DEN.lireJugementDenotation('p1', null)).toBeNull();
    });
    it('isole les trimestres : une saisie h2026 est invisible sous a2025', () => {
        store['h2026_jugementsDenotation'] = { p1: { DA1: saisie } };
        ns = 'a2025';
        expect(DEN.lireJugementDenotation('p1', 'DA1')).toBeNull();
        expect(DEN.lireTousLesJugements()).toEqual({});
    });
    it('rend un objet vide quand la collection n\'existe pas encore', () => {
        expect(DEN.lireTousLesJugements()).toEqual({});
    });
});
