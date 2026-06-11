import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #335 Lot B — multi-actifs : l'INTENTION prime sur le calendrier (11 juin 2026).
//
// Incident I2 (10 juin) : après l'import d'un codex H2026 en juin,
// corrigerTrimestresMultiplesActifs choisissait le trimestre suggéré par la
// DATE DU JOUR (juin → Été 2026) même s'il n'était PAS marqué actif, et
// PERSISTAIT ce choix — l'intention déclarée (H2026 actif dans le codex)
// était écrasée par une heuristique de calendrier.
//
// Règle verrouillée ici : la correction choisit PARMI les trimestres
// réellement marqués actifs (le plus récent : année décroissante, H > E > A) ;
// un trimestre non marqué actif ne peut JAMAIS être élu par la date.
// La correction se déclenche via obtenirTrimestreActif() quand actifs > 1.

let store;
let ecritures;
const db = {
    getSync: (k, def) => (k in store ? store[k] : (def !== undefined ? def : null)),
    setSync: (k, v) => { ecritures.push(k); store[k] = v; }
};
const win = chargerScript('js/trimestres.js', { db });

beforeEach(() => { store = {}; ecritures = []; });

describe('#335 B · multi-actifs — l\'intention prime sur le calendrier', () => {

    it('repro I2 : H2026 + A2025 actifs, Été 2026 EXISTE mais non actif → H2026 gagne (jamais Été)', () => {
        store['trimestres'] = [
            { id: 'h2026', session: 'H', annee: 2026, actif: true },
            { id: 'a2025', session: 'A', annee: 2025, actif: true },
            { id: 'e2026', session: 'E', annee: 2026, actif: false }   // le piège calendrier (juin)
        ];
        const actif = win.obtenirTrimestreActif();
        expect(actif.id).toBe('h2026');
        // Et le choix est persisté : un seul actif, le bon
        const persiste = store['trimestres'].filter(t => t.actif);
        expect(persiste.map(t => t.id)).toEqual(['h2026']);
    });

    it('parmi les actifs : le plus récent gagne (année desc, H > E > A)', () => {
        store['trimestres'] = [
            { id: 'a2025', session: 'A', annee: 2025, actif: true },
            { id: 'h2026', session: 'H', annee: 2026, actif: true },
            { id: 'e2026', session: 'E', annee: 2026, actif: true }
        ];
        expect(win.obtenirTrimestreActif().id).toBe('h2026');
    });

    it('le trimestre démo marqué actif ne peut pas être élu', () => {
        store['trimestres'] = [
            { id: 'demo', session: 'H', annee: 2099, actif: true },
            { id: 'h2026', session: 'H', annee: 2026, actif: true }
        ];
        expect(win.obtenirTrimestreActif().id).toBe('h2026');
    });

    it('un seul actif → aucune correction, aucune écriture', () => {
        store['trimestres'] = [
            { id: 'h2026', session: 'H', annee: 2026, actif: true },
            { id: 'a2025', session: 'A', annee: 2025, actif: false }
        ];
        expect(win.obtenirTrimestreActif().id).toBe('h2026');
        expect(ecritures).toEqual([]);
    });

});
