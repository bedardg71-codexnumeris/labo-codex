import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #374 (relais Cadre→Trimestre, fusion du 5 août 2026) —
// migrerJourneesSansCours : evenementsPrevus + evenementsImprevus →
// journeesSansCours, PAR trimestre (préfixes h2026_, a2026_, demo_, …).
// C'est une migration de données réelles : la préservation des données est
// LA contrainte de rétro-compat du projet (CLAUDE.md).

/**
 * Reproduit les DEUX couches du stockage hybride réel (db.js) : localStorage
 * ET memoryCache (IndexedDB hydratée au boot). Une clé peut vivre dans une
 * seule des deux — c'est exactement le cas qui a fait rater la migration sur
 * le poste réel de Grégoire (5 août : congés A2026 en memoryCache seulement,
 * bascule silencieuse sur quota). Le premier stub de cette sentinelle
 * confondait les couches : il validait sa propre prémisse.
 * @param {Object} donneesLS - clés résidentes en localStorage
 * @param {Object} donneesCache - clés résidentes en memoryCache/IDB seulement
 */
function creerEnvironnement(donneesLS, donneesCache = {}) {
    const ls = { ...donneesLS };
    const cache = new Map(Object.entries(donneesCache));
    const fauxLocalStorage = {
        get length() { return Object.keys(ls).length; },
        key: (i) => Object.keys(ls)[i] ?? null,
        getItem: (k) => (k in ls ? JSON.stringify(ls[k]) : null),
        setItem: (k, v) => { ls[k] = JSON.parse(v); },
        removeItem: (k) => { delete ls[k]; }
    };
    const db = {
        memoryCache: cache,
        // Lecture : memoryCache prioritaire puis localStorage (comme db.js)
        getSync: (k, d) => (cache.has(k) ? cache.get(k) : (k in ls ? ls[k] : d)),
        setSync: (k, v) => { ls[k] = v; },
        removeSync: (k) => { delete ls[k]; cache.delete(k); },
        get: async (k, d) => (cache.has(k) ? cache.get(k) : (k in ls ? ls[k] : d)),
        set: async (k, v) => { ls[k] = v; }
    };
    const win = chargerScript('js/migrations.js', {
        db, localStorage: fauxLocalStorage, cle: (k) => 'h2026_' + k
    });
    // Vue fusionnée pour les assertions (les deux couches)
    const store = new Proxy({}, {
        get: (_, k) => (cache.has(k) ? cache.get(k) : ls[k]),
        has: (_, k) => cache.has(k) || (k in ls)
    });
    return { win, store, ls, cache };
}

const EVT = (id, date, desc, cat) => ({ id, dateEvenement: date, description: desc, categorie: cat || 'institutionnel' });

describe('#374 — migrerJourneesSansCours (fusion des deux clés d\'événements)', () => {
    it('fusionne prévus PUIS imprévus dans journeesSansCours et SUPPRIME les anciennes clés', () => {
        const { win, store } = creerEnvironnement({
            h2026_evenementsPrevus: [EVT('A', '2026-09-07', 'Fête du travail'), EVT('B', '2026-11-09', 'Journée Carrière')],
            h2026_evenementsImprevus: [EVT('C', '2026-10-20', 'Tempête')]
        });
        const nb = win.migrerJourneesSansCours();
        expect(nb).toBe(3);
        expect(store.h2026_journeesSansCours.map(e => e.id)).toEqual(['A', 'B', 'C']);
        expect('h2026_evenementsPrevus' in store).toBe(false);
        expect('h2026_evenementsImprevus' in store).toBe(false);
    });

    it('migre TOUS les préfixes de trimestre présents (h2026_, a2026_, demo_)', () => {
        const { win, store } = creerEnvironnement({
            h2026_evenementsPrevus: [EVT('H1', '2026-02-02', 'Congé hiver')],
            a2026_evenementsImprevus: [EVT('A1', '2026-10-20', 'Tempête automne')],
            demo_evenementsPrevus: [EVT('D1', '2026-09-07', 'Congé démo')]
        });
        expect(win.migrerJourneesSansCours()).toBe(3);
        expect(store.h2026_journeesSansCours.map(e => e.id)).toEqual(['H1']);
        expect(store.a2026_journeesSansCours.map(e => e.id)).toEqual(['A1']);
        expect(store.demo_journeesSansCours.map(e => e.id)).toEqual(['D1']);
    });

    it('IDEMPOTENTE : une ancienne clé qui réapparaît (import d\'archive) ne crée pas de doublons', () => {
        const { win, store } = creerEnvironnement({
            h2026_journeesSansCours: [EVT('A', '2026-09-07', 'Fête du travail')],
            h2026_evenementsPrevus: [EVT('A', '2026-09-07', 'Fête du travail'), EVT('B', '2026-11-09', 'Journée Carrière')]
        });
        expect(win.migrerJourneesSansCours()).toBe(1); // seul B est nouveau
        expect(store.h2026_journeesSansCours.map(e => e.id)).toEqual(['A', 'B']);
        expect(win.migrerJourneesSansCours()).toBe(0); // plus rien à faire
        expect(store.h2026_journeesSansCours).toHaveLength(2);
    });

    it('CAS DU 5 AOÛT : clés résidentes en memoryCache SEULEMENT (éviction quota) → migrées quand même', () => {
        // Sur le poste réel : localStorage ne contenait PAS les congés A2026
        // (bascule silencieuse vers IndexedDB) ; l'énumération localStorage
        // seule rendait la migration muette → « 0 déclarée », 77 jours, 16 sem.
        const { win, store, ls } = creerEnvironnement(
            {}, // localStorage VIDE
            {
                a2026_evenementsPrevus: [EVT('A', '2026-09-07', 'Fête du travail'), EVT('B', '2026-11-09', 'Journée Carrière')]
            }
        );
        expect(win.migrerJourneesSansCours()).toBe(2);
        expect(ls.a2026_journeesSansCours.map(e => e.id)).toEqual(['A', 'B']);
        expect('a2026_evenementsPrevus' in store).toBe(false);
    });

    it('no-op sans anciennes clés : journeesSansCours existant reste INTACT', () => {
        const { win, store } = creerEnvironnement({
            h2026_journeesSansCours: [EVT('A', '2026-09-07', 'Fête du travail', 'ferie')]
        });
        expect(win.migrerJourneesSansCours()).toBe(0);
        expect(store.h2026_journeesSansCours).toEqual([EVT('A', '2026-09-07', 'Fête du travail', 'ferie')]);
    });
});
