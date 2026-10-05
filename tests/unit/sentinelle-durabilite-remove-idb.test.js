import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #353 Option C — Durabilité du chemin de SUPPRESSION (db.js _removeIndexedDB + removeSync).
//
// Symétrie exacte d'Option A (écriture). _removeIndexedDB DOIT résoudre sur
// `transaction.oncomplete` (commit disque), PAS sur `request.onsuccess` : sous
// WebKit / origine file:// le commit est différé → une suppression « réussie »
// (onsuccess) mais non committée est avortée par un hard refresh → la clé
// RESSUSCITE (syncToLocalStorageCache réhydrate localStorage depuis l'IDB non purgé).
// Et removeSync (fire-and-forget) DOIT tracker sa suppression dans _pendingWrites
// pour que flush() / Option B (visibilitychange/pagehide) la drainent.
//
// Break-tests (ROUGE avec l'ancien code, VERT avec Option C) :
//   1. _removeIndexedDB ne résout PAS tant que oncomplete n'a pas tiré ;
//   2. il REJETTE si la transaction avorte (onabort) ;
//   3. removeSync entre dans _pendingWrites et flush() attend son commit.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Charge db.js (IIFE) avec des stubs minimaux. Identique au harnais de
// sentinelle-durabilite-set-idb.test.js (sentinelle autoportante).
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

// Mock IDB distinguant request.onsuccess (immédiat) de transaction.oncomplete
// (commit, déclenché manuellement via ctrl.commit()). Supporte put ET delete.
function creerMockIDB() {
    const committed = new Map();
    const ctrl = { tx: null, op: null, committed };
    const store = {
        put(record) {
            const req = {};
            ctrl.op = { type: 'put', key: record.key, value: record.value };
            Promise.resolve().then(() => { if (req.onsuccess) req.onsuccess(); });
            return req;
        },
        delete(key) {
            const req = {};
            ctrl.op = { type: 'delete', key };
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
    // commit = oncomplete : applique l'op sur le backing store « disque » PUIS tire oncomplete.
    ctrl.commit = () => {
        if (ctrl.op) {
            if (ctrl.op.type === 'put') committed.set(ctrl.op.key, ctrl.op.value);
            else if (ctrl.op.type === 'delete') committed.delete(ctrl.op.key);
        }
        if (ctrl.tx && ctrl.tx.oncomplete) ctrl.tx.oncomplete();
    };
    ctrl.abort = () => { if (ctrl.tx && ctrl.tx.onabort) ctrl.tx.onabort(); };
    return ctrl;
}

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('#353 Option C · durabilité _removeIndexedDB (résolution sur le commit)', () => {
    it('ne résout PAS tant que la transaction n\'a pas committé (oncomplete), pas à onsuccess', async () => {
        const { db } = chargerDbReel();
        const ctrl = creerMockIDB();
        ctrl.committed.set('K', { v: 1 }); // la clé existe « sur disque »
        let resolu = false;
        const p = db._removeIndexedDB.call({ db: ctrl.connection }, 'K').then(() => { resolu = true; });
        await tick(); // laisse request.onsuccess se déclencher
        expect(resolu).toBe(false); // AVANT fix (resolve sur onsuccess) : déjà résolu → ROUGE
        ctrl.commit(); // transaction.oncomplete → commit disque
        await p;
        expect(resolu).toBe(true);
        expect(ctrl.committed.has('K')).toBe(false); // la suppression a bien committé
    });

    it('rejette si la transaction de suppression avorte (onabort)', async () => {
        const { db } = chargerDbReel();
        const ctrl = creerMockIDB();
        const p = db._removeIndexedDB.call({ db: ctrl.connection }, 'K');
        await tick();
        ctrl.abort(); // transaction.onabort (jamais committé)
        await expect(p).rejects.toBeTruthy();
    });
});

describe('#353 Option C · removeSync tracke la suppression (drainage flush/Option B)', () => {
    // Isolation via un `this` minimal (comme `_setIndexedDB.call({db})` pour A) :
    // tester removeSync sur l'instance réelle laisserait la syncToLocalStorageCache
    // de fond rouvrir des transactions sur le mock et fausser le commit ciblé.
    it('entre dans _pendingWrites et la promesse trackée résout sur le commit', async () => {
        const { db } = chargerDbReel();
        const ctrl = creerMockIDB();
        const pendingWrites = new Set();
        const fakeThis = {
            _removeLocalStorage() {},
            memoryCache: new Map(),
            ready: true,
            useIndexedDB: true,
            db: ctrl.connection,
            _pendingWrites: pendingWrites,
            _trackOperation: db._trackOperation,   // le vrai helper
            // #1029 : l'opération IDB passe par la reprise (réouverture d'une connexion
            // perdue). VRAIES méthodes, connexion saine : elles ne font rien de plus ici.
            _ecrireIDB: db._ecrireIDB, _supprimerIDB: db._supprimerIDB,
            _avecReprise: db._avecReprise, _connexionFermee: db._connexionFermee,
            _dernieresValeurs: new Map(), _connexionPerdue: false, _reouverture: null,
            _removeIndexedDB: db._removeIndexedDB,  // la vraie méthode
        };

        db.removeSync.call(fakeThis, 'K');
        // AVANT fix (removeSync fire-and-forget non tracké) : size === 0 → ROUGE
        expect(pendingWrites.size).toBe(1);

        // flush() = Promise.all(_pendingWrites). On le reproduit sur le Set isolé.
        let drained = false;
        const pf = Promise.all(Array.from(pendingWrites)).then(() => { drained = true; });
        await tick();
        expect(drained).toBe(false); // la promesse trackée attend le commit de la suppression
        ctrl.commit();
        await pf;
        expect(drained).toBe(true);
        expect(pendingWrites.size).toBe(0);     // retirée du Set après commit (finally)
        expect(ctrl.committed.has('K')).toBe(false); // suppression réellement committée
    });
});
