import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #334 Session D — harmonisation de db.set() avec setSync() sur le seuil
// IDB-first (SEUIL_IDB_FIRST = 200 Ko, constante unique).
//
// Au-delà du seuil, set() doit aller DIRECTEMENT en memoryCache (+ removeItem)
// sans tenter localStorage — plus de QuotaExceededError systématique sur les
// grosses clés. En dessous : localStorage (cache synchrone), comme avant.
//
// Break-test : avec un localStorage factice SANS quota, l'ancien set() écrivait
// la grosse valeur dans localStorage (pas de garde de seuil) → le cas « grosse »
// rougit si l'on retire la garde IDB-first.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function chargerDb() {
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
    // Simuler un IDB disponible sans toucher un vrai IndexedDB.
    db.useIndexedDB = true;
    db.ready = true;
    db._setIndexedDB = async () => {};
    db.memoryCache.clear();
    ls.clear();
    return { db, ls };
}

const GROSSE = 'x'.repeat(250 * 1024); // > 200 Ko
const PETITE = { a: 1, b: 'court' };   // < 200 Ko

describe('#334 D · db.set() harmonisé sur le seuil IDB-first', () => {
    it('grosse valeur (>200 Ko) → memoryCache, jamais localStorage', async () => {
        const { db, ls } = chargerDb();
        await db.set('GROSSE', GROSSE);
        expect(db.memoryCache.has('GROSSE')).toBe(true);
        expect(ls.getItem('GROSSE')).toBeNull(); // aucune tentative localStorage
    });

    it('petite valeur (<200 Ko) → localStorage (cache synchrone), pas memoryCache', async () => {
        const { db, ls } = chargerDb();
        await db.set('PETITE', PETITE);
        expect(ls.getItem('PETITE')).not.toBeNull();
        expect(db.memoryCache.has('PETITE')).toBe(false);
    });

    it('set() et setSync() rendent le même verdict de seuil sur une grosse valeur', () => {
        const { db, ls } = chargerDb();
        db.setSync('GS', GROSSE);
        expect(db.memoryCache.has('GS')).toBe(true);
        expect(ls.getItem('GS')).toBeNull();
    });
});
