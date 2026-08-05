import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #374 (relais Cadre→Trimestre, fusion du 5 août 2026) —
// migrerJourneesSansCours : evenementsPrevus + evenementsImprevus →
// journeesSansCours, PAR trimestre (préfixes h2026_, a2026_, demo_, …).
// C'est une migration de données réelles : la préservation des données est
// LA contrainte de rétro-compat du projet (CLAUDE.md).

function creerEnvironnement(donnees) {
    const store = { ...donnees };
    const fauxLocalStorage = {
        get length() { return Object.keys(store).length; },
        key: (i) => Object.keys(store)[i] ?? null,
        getItem: (k) => (k in store ? JSON.stringify(store[k]) : null),
        setItem: (k, v) => { store[k] = JSON.parse(v); },
        removeItem: (k) => { delete store[k]; }
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : d),
        setSync: (k, v) => { store[k] = v; },
        removeSync: (k) => { delete store[k]; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const win = chargerScript('js/migrations.js', {
        db, localStorage: fauxLocalStorage, cle: (k) => 'h2026_' + k
    });
    return { win, store };
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

    it('no-op sans anciennes clés : journeesSansCours existant reste INTACT', () => {
        const { win, store } = creerEnvironnement({
            h2026_journeesSansCours: [EVT('A', '2026-09-07', 'Fête du travail', 'ferie')]
        });
        expect(win.migrerJourneesSansCours()).toBe(0);
        expect(store.h2026_journeesSansCours).toEqual([EVT('A', '2026-09-07', 'Fête du travail', 'ferie')]);
    });
});
