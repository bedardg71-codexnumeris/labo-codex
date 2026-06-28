import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #353 — Durabilité de l'écriture IndexedDB (db.js _setIndexedDB).
//
// _setIndexedDB DOIT résoudre sa promesse sur `transaction.oncomplete` (le COMMIT
// disque), PAS sur `request.onsuccess` (la requête a réussi, mais sous WebKit /
// origine file:// le commit est différé après onsuccess). Résoudre trop tôt rendait
// `await db.set(...)` non durable : un hard refresh avant le commit avortait la
// transaction → IndexedDB gardait l'ANCIENNE valeur → revert silencieux des données
// (racine prouvée live le 2026-06-28 des incidents #352 / #353 / #346 et du 10-11 juin).
//
// Break-test (ROUGE avec resolve-sur-onsuccess, VERT avec resolve-sur-oncomplete) :
//   1. sémantique : la promesse ne résout PAS tant que oncomplete n'a pas tiré ;
//   2. erreur : elle REJETTE si la transaction avorte (onabort).

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Charge db.js (IIFE) SANS stubber _setIndexedDB — on veut tester le vrai code.
function chargerDbReel() {
    const code = readFileSync(path.join(racine, 'js/db.js'), 'utf8');
    const ls = {
        _d: {},
        getItem(k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
        setItem(k, v) { this._d[k] = String(v); },
        removeItem(k) { delete this._d[k]; },
        clear() { this._d = {}; }
    };
    const win = { addEventListener() {}, dispatchEvent() {} };
    const doc = { addEventListener() {} };
    const silencieux = { log() {}, warn() {}, error() {} };
    const fn = new Function(
        'window', 'document', 'console', 'localStorage', 'sessionStorage', 'indexedDB',
        '"use strict";\n' + code
    );
    fn(win, doc, silencieux, ls, ls, undefined);
    const db = win.db;
    db.useIndexedDB = true;
    db.ready = true;
    db.memoryCache.clear();
    ls.clear();
    return { db, ls };
}

// Mock IDB qui DISTINGUE request.onsuccess (immédiat) et transaction.oncomplete
// (commit, déclenché manuellement). `committed` = backing store « disque » : il
// n'est mis à jour que lorsque la transaction commite réellement (ctrl.commit()).
//
// _setIndexedDB n'utilise que `this.db` ; on l'invoque donc en ISOLATION via
// `.call({ db: ctrl.connection })` pour ne tester QUE cette méthode, sans déclencher
// les écritures de fond de l'instance db (qui ouvrent d'autres transactions).
function creerMockIDB() {
    const committed = new Map();
    const ctrl = { tx: null, put: null, committed };
    const store = {
        put(record) {
            const req = {};
            ctrl.put = record;
            // onsuccess = la requête put a réussi → tiré tout de suite (microtask),
            // APRÈS que _setIndexedDB ait assigné ses handlers (exécution synchrone).
            Promise.resolve().then(() => { if (req.onsuccess) req.onsuccess(); });
            return req;
        }
    };
    ctrl.connection = {
        transaction() {
            const tx = { objectStore() { return store; } };
            ctrl.tx = tx;
            return tx;
        }
    };
    // commit = oncomplete : écrit réellement dans `committed` PUIS tire oncomplete.
    ctrl.commit = () => {
        if (ctrl.put) committed.set(ctrl.put.key, ctrl.put.value);
        if (ctrl.tx && ctrl.tx.oncomplete) ctrl.tx.oncomplete();
    };
    ctrl.abort = () => {
        if (ctrl.tx && ctrl.tx.onabort) ctrl.tx.onabort();
    };
    return ctrl;
}

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('#353 · durabilité _setIndexedDB (résolution sur le commit de transaction)', () => {
    it('ne résout PAS tant que la transaction n\'a pas committé (oncomplete), pas à onsuccess', async () => {
        const { db } = chargerDbReel();
        const ctrl = creerMockIDB();
        let resolu = false;
        const p = db._setIndexedDB.call({ db: ctrl.connection }, 'K', { v: 1 }).then(() => { resolu = true; });
        await tick(); // laisse request.onsuccess se déclencher
        // AVANT fix (resolve sur onsuccess) : déjà résolu ici → ROUGE attendu.
        expect(resolu).toBe(false);
        ctrl.commit(); // transaction.oncomplete → commit disque
        await p;
        expect(resolu).toBe(true);
        expect(ctrl.committed.get('K')).toEqual({ v: 1 });
    });

    it('rejette si la transaction avorte (onabort) au lieu de résoudre', async () => {
        const { db } = chargerDbReel();
        const ctrl = creerMockIDB();
        const p = db._setIndexedDB.call({ db: ctrl.connection }, 'K', { v: 1 });
        await tick();
        ctrl.abort(); // transaction.onabort (jamais committé)
        await expect(p).rejects.toBeTruthy();
    });
});
