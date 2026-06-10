import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #300 — désync getSync('trimestres') localStorage↔IDB.
// Au démarrage, avant `db-ready`, getSync peut rendre un localStorage périmé
// où les trimestres ont un `id` vide. Tout code qui bâtit une clé namespacée
// `${trimestre.id}_suffixe` produit alors `_suffixe` (mauvais namespace →
// agrégations silencieusement amputées : c'était le cas des 8 énumérateurs de
// donnees-v2.js + listerTrimestresAvecAlignements).
//
// Garde-fou : `enumererTrimestres()` écarte les trimestres à id falsy, EN
// LECTURE SEULE (jamais de réécriture — sinon une lecture périmée au boot
// effacerait des trimestres réels du stockage).

let store;
let ecritures;
const db = {
    getSync: (k, def) => (k in store ? store[k] : (def !== undefined ? def : null)),
    setSync: (k, v) => { ecritures.push(k); store[k] = v; }
};
const win = chargerScript('js/trimestres.js', { db });
const enumererTrimestres = win.enumererTrimestres;

beforeEach(() => { store = {}; ecritures = []; });

describe('#300 · enumererTrimestres écarte les id vides en lecture seule', () => {
    it('est exporté globalement', () => {
        expect(typeof enumererTrimestres).toBe('function');
    });

    it('écarte les trimestres à id vide, conserve les valides', () => {
        store['trimestres'] = [
            { id: 'h2026', nom: 'Hiver 2026', actif: true },
            { id: '', nom: 'corrompu A' },
            { id: 'a2025', nom: 'Automne 2025' }
        ];
        const ids = enumererTrimestres().map(t => t.id);
        expect(ids).toEqual(['h2026', 'a2025']);
    });

    it('écarte aussi les entrées null/undefined et id manquant', () => {
        store['trimestres'] = [
            null,
            { nom: 'sans id du tout' },
            undefined,
            { id: 'h2026' }
        ];
        expect(enumererTrimestres().map(t => t.id)).toEqual(['h2026']);
    });

    it('le cas pathologique du bug (4 ids vides → ",,,") rend une liste vide', () => {
        store['trimestres'] = [{ id: '' }, { id: '' }, { id: '' }, { id: '' }];
        expect(enumererTrimestres()).toEqual([]);
    });

    it('NE RÉÉCRIT JAMAIS le stockage (lecture seule, même avec des id vides)', () => {
        store['trimestres'] = [{ id: 'h2026' }, { id: '' }, { id: '' }];
        enumererTrimestres();
        // Aucune écriture : une lecture périmée au boot ne doit pas effacer de trimestres.
        expect(ecritures).toEqual([]);
        // Le stockage d'origine est intact (les id vides sont toujours là).
        expect(store['trimestres']).toHaveLength(3);
    });

    it('valeur absente ou non-array → liste vide, sans planter', () => {
        expect(enumererTrimestres()).toEqual([]);
        store['trimestres'] = 'corrompu-non-array';
        expect(enumererTrimestres()).toEqual([]);
    });
});
