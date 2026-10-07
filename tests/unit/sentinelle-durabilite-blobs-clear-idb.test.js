import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #353 Option C volet 2 — Durabilité de l'EFFACEMENT et des BLOBS.
//
// L'Option A ne couvrait que le store 'keyvalue' via _setIndexedDB. Les
// transactions d'effacement (_clearIndexedDB, clearBlobs) et d'écriture/suppression
// de blobs (storeBlob, deleteBlob, store 'fichiers') résolvaient encore sur
// `request.onsuccess` → non durables au hard refresh (clear() est chaîné à un
// location.reload() ; un import storeBlob est suivi d'un reload). Symétrie d'A :
// résoudre sur `transaction.oncomplete` + reject sur onabort/onerror.
//
// Break-tests (ROUGE sans le fix, VERT avec) : pour chaque méthode,
//   (1) ne résout PAS tant que oncomplete n'a pas tiré ; (2) rejette sur onabort.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

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
    return { db: win.db };
}

// Mock IDB générique : put/delete/clear capturent une requête dont onsuccess est
// tirée tout de suite (microtask) ; oncomplete/onabort de la transaction sont
// déclenchés manuellement via ctrl.commit() / ctrl.abort().
function creerMockIDB() {
    const ctrl = { tx: null };
    const store = {
        put() { const q = {}; Promise.resolve().then(() => q.onsuccess && q.onsuccess()); return q; },
        delete() { const q = {}; Promise.resolve().then(() => q.onsuccess && q.onsuccess()); return q; },
        clear() { const q = {}; Promise.resolve().then(() => q.onsuccess && q.onsuccess()); return q; },
    };
    ctrl.connection = {
        transaction() { const tx = { objectStore() { return store; } }; ctrl.tx = tx; return tx; }
    };
    ctrl.commit = () => { if (ctrl.tx && ctrl.tx.oncomplete) ctrl.tx.oncomplete(); };
    ctrl.abort = () => { if (ctrl.tx && ctrl.tx.onabort) ctrl.tx.onabort(); };
    return ctrl;
}

const tick = () => new Promise((r) => setTimeout(r, 0));

// Chaque méthode est invoquée en ISOLATION via .call(fakeThis) pour ne déclencher
// QUE la transaction testée (pas les écritures de fond de l'instance).
// #1031 (7 oct. 2026) : les opérations du magasin `fichiers` passent par la reprise (#1029).
// VRAIES méthodes, connexion saine : elles ne font rien de plus ici.
const avecReprise = (db, ctrl) => ({
    ready: true, useIndexedDB: true, db: ctrl.connection,
    _avecReprise: db._avecReprise, _connexionFermee: db._connexionFermee,
    _connexionPerdue: false, _reouverture: null
});
const CAS = [
    { nom: 'storeBlob', invoke: (db, ctrl) => db.storeBlob.call(avecReprise(db, ctrl), { id: 'B1', blob: 'x' }) },
    { nom: 'deleteBlob', invoke: (db, ctrl) => db.deleteBlob.call(avecReprise(db, ctrl), 'B1') },
    { nom: 'clearBlobs', invoke: (db, ctrl) => db.clearBlobs.call(avecReprise(db, ctrl)) },
    { nom: '_clearIndexedDB', invoke: (db, ctrl) => db._clearIndexedDB.call({ db: ctrl.connection }) },
];

describe('#353 Option C volet 2 · effacement + blobs durables (résolution sur le commit)', () => {
    for (const c of CAS) {
        it(`${c.nom} ne résout PAS avant le commit (oncomplete), pas à onsuccess`, async () => {
            const { db } = chargerDbReel();
            const ctrl = creerMockIDB();
            let resolu = false;
            Promise.resolve(c.invoke(db, ctrl)).then(() => { resolu = true; });
            await tick(); // laisse request.onsuccess se déclencher
            expect(resolu).toBe(false); // AVANT fix (resolve sur onsuccess) → déjà résolu → ROUGE
            ctrl.commit();
            await tick();
            expect(resolu).toBe(true);
        });

        it(`${c.nom} rejette si la transaction avorte (onabort)`, async () => {
            const { db } = chargerDbReel();
            const ctrl = creerMockIDB();
            const p = c.invoke(db, ctrl);
            await tick();
            ctrl.abort();
            await expect(p).rejects.toBeTruthy();
        });
    }
});
