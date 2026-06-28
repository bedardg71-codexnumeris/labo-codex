import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #353 Option B — drainage des écritures setSync au cycle de vie de la page.
//
// `setSync()` lance ses écritures IndexedDB en fire-and-forget (_trackWrite) : nul
// ne les attend. Le handler `beforeunload` ne fait qu'AVERTIR (un handler synchrone
// ne peut pas attendre une transaction async). db.js doit donc déclencher
// `db.flush()` au moment le plus fiable du cycle de vie — `visibilitychange`→hidden
// (et `pagehide`) — pour committer les écritures pendantes avant le démontage.
//
// Break-test (ROUGE sans le listener visibilitychange/pagehide, VERT avec) :
//   1. visibilitychange→hidden + écriture pendante  ⟹ flush appelé ;
//   2. pagehide + écriture pendante                  ⟹ flush appelé ;
//   3. visibilitychange→visible                      ⟹ flush NON appelé ;
//   4. aucune écriture pendante                      ⟹ flush NON appelé (no-op).

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Charge db.js (IIFE) avec un window/document qui CAPTURENT les listeners, pour
// pouvoir déclencher manuellement visibilitychange / pagehide.
function chargerDbAvecListeners() {
    const code = readFileSync(path.join(racine, 'js/db.js'), 'utf8');
    const ls = {
        _d: {},
        getItem(k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
        setItem(k, v) { this._d[k] = String(v); },
        removeItem(k) { delete this._d[k]; },
        clear() { this._d = {}; }
    };
    const winListeners = {};
    const docListeners = {};
    const win = {
        addEventListener(type, fn) { (winListeners[type] || (winListeners[type] = [])).push(fn); },
        removeEventListener() {},
        dispatchEvent() {}
    };
    const doc = {
        addEventListener(type, fn) { (docListeners[type] || (docListeners[type] = [])).push(fn); },
        removeEventListener() {},
        visibilityState: 'visible'
    };
    const silencieux = { log() {}, warn() {}, error() {} };
    const fn = new Function(
        'window', 'document', 'console', 'localStorage', 'sessionStorage', 'indexedDB',
        '"use strict";\n' + code
    );
    fn(win, doc, silencieux, ls, ls, undefined);
    const db = win.db;
    db.memoryCache.clear();
    ls.clear();
    return { db, win, doc, winListeners, docListeners };
}

// Remplace db.flush par un compteur (lookup au moment de l'appel → le listener,
// qui appelle db.flush(), tombe sur l'espion).
function espionnerFlush(db) {
    const etat = { appels: 0 };
    db.flush = () => { etat.appels++; return Promise.resolve(); };
    return etat;
}

describe('#353 Option B · drainage des écritures pendantes au cycle de vie', () => {
    it('visibilitychange→hidden avec une écriture pendante ⟹ db.flush() appelé', () => {
        const { db, doc, docListeners } = chargerDbAvecListeners();
        const flush = espionnerFlush(db);
        db._pendingWrites.add(Promise.resolve()); // simule une écriture setSync en vol
        doc.visibilityState = 'hidden';
        expect(docListeners['visibilitychange'], 'aucun listener visibilitychange enregistré').toBeTruthy();
        docListeners['visibilitychange'].forEach((h) => h());
        expect(flush.appels).toBe(1);
    });

    it('pagehide avec une écriture pendante ⟹ db.flush() appelé', () => {
        const { db, winListeners } = chargerDbAvecListeners();
        const flush = espionnerFlush(db);
        db._pendingWrites.add(Promise.resolve());
        expect(winListeners['pagehide'], 'aucun listener pagehide enregistré').toBeTruthy();
        winListeners['pagehide'].forEach((h) => h());
        expect(flush.appels).toBe(1);
    });

    it('visibilitychange→visible (la page revient au premier plan) ⟹ pas de flush', () => {
        const { db, doc, docListeners } = chargerDbAvecListeners();
        const flush = espionnerFlush(db);
        db._pendingWrites.add(Promise.resolve());
        doc.visibilityState = 'visible';
        docListeners['visibilitychange'].forEach((h) => h());
        expect(flush.appels).toBe(0);
    });

    it('aucune écriture pendante ⟹ pas de flush (no-op, zéro coût au changement d\'onglet)', () => {
        const { db, doc, docListeners } = chargerDbAvecListeners();
        const flush = espionnerFlush(db);
        // _pendingWrites volontairement vide
        doc.visibilityState = 'hidden';
        docListeners['visibilitychange'].forEach((h) => h());
        expect(flush.appels).toBe(0);
    });
});
