import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #353 Option C volet 3 (W1) — La voie async set() doit TRACKER son écriture IDB.
//
// set() faisait `await this._setIndexedDB(key, value)` SANS _trackWrite : un
// `db.set(...)` NON awaité (fire-and-forget) échappait à flush() ET à l'Option B
// (absent de _pendingWrites) → trou structurel pour toute écriture async non-awaitée.
// Le fix route la promesse par _trackOperation (qui la renvoie pour préserver
// l'await/reject d'un set() awaité), donc un db.set non-awaité devient drainable.
//
// Break-test : sans le tracking, _pendingWrites reste vide après set() → ROUGE.

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
    };
    ctrl.connection = {
        transaction() { const tx = { objectStore() { return store; } }; ctrl.tx = tx; return tx; }
    };
    ctrl.commit = () => { if (ctrl.tx && ctrl.tx.oncomplete) ctrl.tx.oncomplete(); };
    return ctrl;
}

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('#353 Option C volet 3 · set() async tracke son écriture IDB (W1)', () => {
    // Isolation via `this` minimal : set() touche beaucoup de champs d'instance ;
    // on ne veut exercer QUE le routage par _trackOperation.
    it('un db.set() non-awaité entre dans _pendingWrites et est drainé au commit', async () => {
        const { db } = chargerDbReel();
        const ctrl = creerMockIDB();
        const pendingWrites = new Set();
        const fakeThis = {
            ready: true,
            useIndexedDB: true,
            db: ctrl.connection,
            _ecritureAutorisee: () => true,
            // #447 : `set()` signale l'écriture (crochet d'invalidation du cache
            // de lecture #397). On branche la VRAIE méthode — sans abonné elle
            // ne fait rien, et le routage testé ici reste le seul objet du cas.
            _signalerEcriture: db._signalerEcriture,
            _setIndexedDB: db._setIndexedDB,
            _trackOperation: db._trackOperation,   // helper du volet 1
            // #1029 : l'opération IDB passe par la reprise (réouverture d'une connexion
            // perdue). VRAIES méthodes, connexion saine : elles ne font rien de plus ici.
            _ecrireIDB: db._ecrireIDB, _supprimerIDB: db._supprimerIDB,
            _avecReprise: db._avecReprise, _connexionFermee: db._connexionFermee,
            _dernieresValeurs: new Map(), _connexionPerdue: false, _reouverture: null,
            _estimateSize: () => 10,               // sous le seuil IDB-first
            // #401 : set() sérialise une fois et écrit la chaîne (helpers neufs)
            _estimateSizeFromString: () => 10,
            _setLocalStorageString() {},
            memoryCache: new Map(),
            _setLocalStorage() {},
            _pendingWrites: pendingWrites,
        };

        db.set.call(fakeThis, 'k', 'v'); // NON awaité (fire-and-forget)
        // AVANT fix (set() sans tracking) : size === 0 → ROUGE
        expect(pendingWrites.size).toBe(1);

        let drained = false;
        const pf = Promise.all(Array.from(pendingWrites)).then(() => { drained = true; });
        await tick();
        expect(drained).toBe(false); // attend le commit
        ctrl.commit();
        await pf;
        expect(drained).toBe(true);
        expect(pendingWrites.size).toBe(0); // retirée après commit
    });
});
