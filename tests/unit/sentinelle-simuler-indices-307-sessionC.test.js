import { describe, it, expect, beforeAll, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Session C Lot 5 (#307) — simulerIndices(da, pratiqueId) : indices C/P d'une pratique
// donnée, en LECTURE SEULE. Contrat :
//  (1) PARITÉ : appelé avec la pratique active, rend exactement les C/P que
//      calculerEtStockerIndicesCP() stocke (même chaîne de calcul).
//  (2) LECTURE SEULE : n'écrit jamais le store indicesCP.
//  (3) PARAMÉTRAGE : varie selon la pratique demandée (cœur de la simulation).
//  (4) Fallback calculerPerformance quand pas de note finale portfolio.

const DA = '1111111';
const ACTIVE = 'prat-A';

// Pratiques mockées (valeurs distinctes). 'prat-C' n'a pas de note portfolio → fallback.
const instances = {
    'prat-A': { calculerCompletion: () => 0.80, calculerPerformance: () => 0.70 },
    'prat-B': { calculerCompletion: () => 0.60, calculerPerformance: () => 0.50 },
    'prat-C': { calculerCompletion: () => 0.50, calculerPerformance: () => 0.42 }
};
// Note finale par pratique (chemin portfolio paramétré). prat-C absente ⇒ null.
const NOTES = { 'prat-A': 73, 'prat-B': 88 };

let store, setSyncSpy, win;

beforeAll(() => {
    store = { indicesCP: {} };
    setSyncSpy = vi.fn((k, v) => { store[k] = v; });
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: setSyncSpy,
        get: async () => null, set: async () => {}
    };
    const cle = (k) => k;
    const globaux = {
        db, cle,
        obtenirPratiqueParId: (id) => instances[id] || null,
        obtenirPratiqueActiveGroupeCours: () => ACTIVE,
        // Lot N1a (21 sept. 2026) : l'écrivain d'indicesCP résout la pratique active par LA résolution du registre.
        resoudrePratiqueActive: () => ({ etat: instances[ACTIVE] ? 'ok' : 'illisible', idBrut: ACTIVE, id: ACTIVE, donnees: null, configuration: null, pratique: instances[ACTIVE] || null }),
        obtenirDonneesSelonMode: (k) => (k === 'groupeEtudiants' ? [{ da: DA }] : []),
        estEtudiantExclu: () => false,
        // Sans pratiqueId ⇒ pratique active (comme calculerEtStockerIndicesCP l'appelle).
        calculerDetailsNoteFinale: (da, pratiqueId) => {
            const id = pratiqueId || ACTIVE;
            return { noteFinale: id in NOTES ? NOTES[id] : null };
        }
    };
    win = chargerScript('js/portfolio.js', globaux);
});

describe('Session C Lot 5 · simulerIndices (#307)', () => {
    it('expose simulerIndices', () => {
        expect(typeof win.simulerIndices).toBe('function');
    });

    it('PARITÉ : simulerIndices(da, active) == indices stockés par calculerEtStockerIndicesCP', () => {
        const stockes = win.calculerEtStockerIndicesCP()[DA].actuel; // calcule + STOCKE pour l'active
        const simules = win.simulerIndices(DA, ACTIVE);
        expect(simules.C).toBe(stockes.C); // 80
        expect(simules.P).toBe(stockes.P); // 73
    });

    it('LECTURE SEULE : ne déclenche aucune écriture du store', () => {
        const avant = setSyncSpy.mock.calls.length;
        win.simulerIndices(DA, 'prat-B');
        expect(setSyncSpy.mock.calls.length).toBe(avant); // 0 setSync supplémentaire
    });

    it('PARAMÉTRAGE : deux pratiques ⇒ indices distincts sur les mêmes données', () => {
        const a = win.simulerIndices(DA, 'prat-A');
        const b = win.simulerIndices(DA, 'prat-B');
        expect(a).toMatchObject({ C: 80, P: 73, noteFinale: 73 });
        expect(b).toMatchObject({ C: 60, P: 88, noteFinale: 88 });
    });

    it('fallback calculerPerformance quand pas de note finale portfolio', () => {
        const c = win.simulerIndices(DA, 'prat-C'); // NOTES['prat-C'] absent → noteFinale null
        expect(c.noteFinale).toBeNull();
        expect(c.P).toBe(42); // vient de calculerPerformance (0.42 → 42)
        expect(c.C).toBe(50);
    });

    it('garde-fous : da/pratiqueId manquant ou pratique inconnue → null', () => {
        expect(win.simulerIndices('', 'prat-A')).toBeNull();
        expect(win.simulerIndices(DA, null)).toBeNull();
        expect(win.simulerIndices(DA, 'prat-inexistante')).toBeNull();
    });
});
