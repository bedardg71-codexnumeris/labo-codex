import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #300 Lot 2 — cause racine de la désync getSync↔IDB au boot.
//
// localStorage est un cache de la session précédente, potentiellement périmé
// vis-à-vis d'IndexedDB (source de vérité). `syncToLocalStorageCache` réhydrate
// localStorage depuis IDB au démarrage. AVANT cette réhydratation, getSync lit
// le localStorage périmé (ex. `trimestres` aux id vides → ",,,").
//
// Correctif Lot 2 (clear-then-hydrate) : invalider préventivement le cache
// localStorage des clés présentes en IDB AVANT de les réhydrater. Pendant la
// fenêtre, une lecture rend le DÉFAUT (sûr) plutôt qu'une valeur périmée. On ne
// vide QUE les clés présentes en IDB (restaurées juste après → aucune perte) ;
// les clés localStorage-seules restent intactes.

const CustomEvent = class { constructor(t, o) { this.type = t; this.detail = o && o.detail; } };

function chargerDb() {
    const win = chargerScript('js/db.js', { CustomEvent }, {
        addEventListener: () => {},
        dispatchEvent: () => {}
    });
    return win.db;
}

describe('#300 Lot 2 · syncToLocalStorageCache vide le cache périmé avant réhydratation', () => {
    let db;
    // NB : on laisse `useIndexedDB` à false au chargement pour que l'auto-init
    // top-level de db.js (db.init().then(...)) se saute lors du flush des
    // micro-tasks, AVANT que le test ne l'active. On l'active dans chaque test.
    beforeEach(() => { db = chargerDb(); });

    // #401 (5 août 2026) : la réhydratation lit désormais TOUT le magasin en UNE
    // transaction getAll (_getAllIndexedDB) puis clear + réécrit SANS await
    // intercalé — la fenêtre asynchrone « clé vidée, pas encore réhydratée » que
    // ce test capturait via db.get(clé) n'existe structurellement plus. Le test
    // verrouille l'invariant restant : plus AUCUNE lecture IDB par clé, et la
    // valeur périmée ne survit jamais à la sync.
    it('hydratation en UNE passe getAll : db.get par clé n\'est plus consulté, le périmé est remplacé', async () => {
        db.useIndexedDB = true;
        const idb = { trimestres: [{ id: 'h2026', nom: 'Hiver 2026' }, { id: 'a2025' }] };
        db._getAllIndexedDB = async () => Object.keys(idb).map(k => ({ key: k, value: idb[k] }));

        // localStorage = cache PÉRIMÉ de la session précédente (id vides)
        db._setLocalStorage('trimestres', [{ id: '' }, { id: '' }]);

        let getParCle = 0;
        db.get = async () => { getParCle++; return null; };

        await db.syncToLocalStorageCache();

        expect(getParCle).toBe(0); // plus de N allers-retours par clé
        expect(db._getLocalStorage('trimestres', null)).toEqual(idb.trimestres);
    });

    it('après la sync, localStorage reflète IDB (source de vérité)', async () => {
        db.useIndexedDB = true;
        const idb = { trimestres: [{ id: 'h2026' }, { id: 'a2025' }] };
        db._getAllIndexedDB = async () => Object.keys(idb).map(k => ({ key: k, value: idb[k] })); // #401
        db._setLocalStorage('trimestres', [{ id: '' }, { id: '' }]); // périmé

        await db.syncToLocalStorageCache();

        expect(db._getLocalStorage('trimestres', null)).toEqual([{ id: 'h2026' }, { id: 'a2025' }]);
    });

    it('une clé localStorage-seule (absente d\'IDB) reste INTACTE', async () => {
        db.useIndexedDB = true;
        const idb = { trimestres: [{ id: 'h2026' }] };
        db._getAllIndexedDB = async () => Object.keys(idb).map(k => ({ key: k, value: idb[k] })); // #401

        // Clé qui n'existe QUE dans localStorage (jamais passée par IDB).
        db._setLocalStorage('pref_locale_seule', { theme: 'sombre' });

        await db.syncToLocalStorageCache();

        // Non touchée : le clear ne vise que les clés présentes en IDB.
        expect(db._getLocalStorage('pref_locale_seule', null)).toEqual({ theme: 'sombre' });
    });
});
