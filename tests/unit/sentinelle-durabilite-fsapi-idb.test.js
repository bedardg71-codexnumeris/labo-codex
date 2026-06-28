import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #353 Option C volet 4 (C6) — Durabilité du handle FSAPI.
//
// storeFSAPIHandle (écriture) et removeFSAPIHandle (suppression, Défense D —
// MODELE-MENACES §D-03) résolvaient sur request.onsuccess. La purge du handle
// dormant lors de setFSAPIPersistance(false) n'était donc pas garantie durable.
// Fix : résoudre sur transaction.oncomplete. storeFSAPIHandle reject sur
// onabort/onerror ; removeFSAPIHandle reste IDEMPOTENT (résout aussi sur erreur).

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

function creerMockIDB() {
    const ctrl = { tx: null };
    const store = {
        put() { const q = {}; Promise.resolve().then(() => q.onsuccess && q.onsuccess()); return q; },
        delete() { const q = {}; Promise.resolve().then(() => q.onsuccess && q.onsuccess()); return q; },
    };
    ctrl.connection = {
        transaction() { const tx = { objectStore() { return store; } }; ctrl.tx = tx; return tx; }
    };
    ctrl.commit = () => { if (ctrl.tx && ctrl.tx.oncomplete) ctrl.tx.oncomplete(); };
    ctrl.abort = () => { if (ctrl.tx && ctrl.tx.onabort) ctrl.tx.onabort(); };
    return ctrl;
}

const tick = () => new Promise((r) => setTimeout(r, 0));
const fakeStore = (ctrl) => ({ getFSAPIPersistance: () => true, ready: true, useIndexedDB: true, db: ctrl.connection });

describe('#353 Option C volet 4 · handle FSAPI durable', () => {
    it('storeFSAPIHandle résout sur le commit (oncomplete), pas onsuccess', async () => {
        const { db } = chargerDbReel();
        const ctrl = creerMockIDB();
        let resolu = false;
        Promise.resolve(db.storeFSAPIHandle.call(fakeStore(ctrl), { fake: 'handle' })).then(() => { resolu = true; });
        await tick();
        expect(resolu).toBe(false); // sans fix (onsuccess) → ROUGE
        ctrl.commit();
        await tick();
        expect(resolu).toBe(true);
    });

    it('storeFSAPIHandle rejette si la transaction avorte (onabort)', async () => {
        const { db } = chargerDbReel();
        const ctrl = creerMockIDB();
        const p = db.storeFSAPIHandle.call(fakeStore(ctrl), { fake: 'handle' });
        await tick();
        ctrl.abort();
        await expect(p).rejects.toBeTruthy();
    });

    it('removeFSAPIHandle résout sur le commit (oncomplete), pas onsuccess', async () => {
        const { db } = chargerDbReel();
        const ctrl = creerMockIDB();
        let resolu = false;
        Promise.resolve(db.removeFSAPIHandle.call({ ready: true, useIndexedDB: true, db: ctrl.connection })).then(() => { resolu = true; });
        await tick();
        expect(resolu).toBe(false); // sans fix (onsuccess) → ROUGE
        ctrl.commit();
        await tick();
        expect(resolu).toBe(true);
    });

    it('removeFSAPIHandle reste IDEMPOTENT : résout (ne rejette pas) si la transaction avorte', async () => {
        // Guard de contrat (Défense D) : protège contre une régression future qui
        // ferait reject sur abort. N'est pas le break-test du fix (cf. test ci-dessus).
        const { db } = chargerDbReel();
        const ctrl = creerMockIDB();
        const p = db.removeFSAPIHandle.call({ ready: true, useIndexedDB: true, db: ctrl.connection });
        await tick();
        ctrl.abort();
        await expect(p).resolves.toBeUndefined();
    });
});
