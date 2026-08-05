import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #401 — boot et modal d'export (rapport P4+P5, débloqué par les
// mesures terrain du 5 août soir : re-sync boot 729-1057 ms, modal 473-488 ms).
//  (a) syncToLocalStorageCache lit TOUT le magasin en UNE transaction getAll
//      (_getAllIndexedDB) au lieu de N `await get(clé)` séquentiels ;
//  (b) chaque chemin d'écriture sérialise UNE seule fois (la taille est estimée
//      sur la même chaîne que celle écrite — avant : double stringify, 243 ms
//      de CPU mesurés au boot sur 5,2 Mo/120 clés, payés aussi par chaque
//      setSync de grosse clé) ;
//  (c) ouvrirModalExport affiche les tailles SANS matérialiser les valeurs
//      (chaîne déjà dans localStorage, objet déjà dans memoryCache — zéro
//      db.get, zéro transaction IDB).

const CustomEvent = class { constructor(t, o) { this.type = t; this.detail = o && o.detail; } };

// localStorage partagé entre modules d'un même scénario (db.js écrit, le modal lit)
function creerStoragePartage() {
    return {
        _data: {},
        getItem(k) { return k in this._data ? this._data[k] : null; },
        setItem(k, v) { this._data[k] = String(v); },
        removeItem(k) { delete this._data[k]; },
        clear() { this._data = {}; }
    };
}

function chargerDb(jsonSpy, storage) {
    const globaux = { CustomEvent };
    if (jsonSpy) globaux.JSON = jsonSpy;
    if (storage) globaux.localStorage = storage;
    return chargerScript('js/db.js', globaux, {
        addEventListener: () => {},
        dispatchEvent: () => {}
    }).db;
}

// JSON espionné : compte les stringify par valeur (le parse reste natif).
function creerJsonComptable() {
    const compte = { stringify: 0 };
    return {
        compte,
        spy: {
            stringify: (...a) => { compte.stringify++; return JSON.stringify(...a); },
            parse: (...a) => JSON.parse(...a)
        }
    };
}

describe('#401 (a) · boot — une transaction getAll, plus de N get(clé)', () => {
    it('syncToLocalStorageCache consomme _getAllIndexedDB et ne rappelle NI keys() NI get()', async () => {
        const db = chargerDb();
        db.useIndexedDB = true;
        let appelsGetAll = 0, appelsGet = 0, appelsKeys = 0;
        db._getAllIndexedDB = async () => { appelsGetAll++; return [
            { key: 'a', value: { x: 1 } },
            { key: 'b', value: { y: 2 } },
            { key: 'c', value: { z: 3 } }
        ]; };
        db.get = async () => { appelsGet++; return null; };
        db.keys = async () => { appelsKeys++; return []; };

        await db.syncToLocalStorageCache();

        expect(appelsGetAll).toBe(1);
        expect(appelsGet).toBe(0);
        expect(appelsKeys).toBe(0);
        expect(db._getLocalStorage('b', null)).toEqual({ y: 2 });
    });

    it('memoryCache-first (#392) préservé : un re-sync n\'écrase pas la donnée courante par l\'IDB en vol', async () => {
        const db = chargerDb();
        db.useIndexedDB = true;
        db.memoryCache.set('a', { x: 'FRAIS' });
        db._getAllIndexedDB = async () => [{ key: 'a', value: { x: 'STALE' } }];

        await db.syncToLocalStorageCache();

        expect(db._getLocalStorage('a', null)).toEqual({ x: 'FRAIS' });
    });
});

describe('#401 (b) · une seule sérialisation par écriture', () => {
    it('setSync : 1 stringify par appel (avant : 2 — estimation PUIS écriture)', () => {
        const { compte, spy } = creerJsonComptable();
        const db = chargerDb(spy);
        db.useIndexedDB = false;

        compte.stringify = 0;
        db.setSync('maCle', { valeur: 42 });
        expect(compte.stringify).toBe(1);
        expect(db.getSync('maCle', null)).toEqual({ valeur: 42 });
    });

    it('syncToLocalStorageCache : 1 stringify par clé réhydratée', async () => {
        const { compte, spy } = creerJsonComptable();
        const db = chargerDb(spy);
        db.useIndexedDB = true;
        db._getAllIndexedDB = async () => [
            { key: 'a', value: { x: 1 } },
            { key: 'b', value: { y: 2 } }
        ];

        compte.stringify = 0;
        await db.syncToLocalStorageCache();
        // 1 par clé (2 clés) — le diagnostic _storageStats de fin de sync ne
        // sérialise pas (il mesure les .length des chaînes déjà écrites).
        expect(compte.stringify).toBe(2);
    });
});

describe('#401 (c) · modal export — tailles sans matérialiser les valeurs', () => {
    function chargerModal(db, doc, storage) {
        return chargerScript('js/import-export.js', {
            db,
            cle: (k) => k,
            echapperHtml: (v) => String(v),
            document: doc,
            localStorage: storage
        });
    }

    it('ouvrirModalExport ne fait AUCUN db.get (chaîne localStorage / objet memoryCache suffisent)', async () => {
        const storage = creerStoragePartage();
        const db = chargerDb(null, storage);
        db.useIndexedDB = false;
        db.setSync('petiteCle', { a: 1 });                 // vit dans localStorage
        db.memoryCache.set('grosseCle', { blob: 'x'.repeat(1000) }); // vit en RAM
        let appelsGet = 0;
        db.get = async () => { appelsGet++; return null; };
        db.keys = async () => ['petiteCle', 'grosseCle'];

        const zones = {};
        const doc = {
            addEventListener: () => {}, removeEventListener: () => {},
            querySelectorAll: () => [], querySelector: () => null,
            getElementById: (id) => (zones[id] = zones[id] || { innerHTML: '', checked: false, style: {}, classList: { add() {}, remove() {} } }),
            createElement: () => ({ setAttribute() {}, appendChild() {}, addEventListener() {}, style: {}, classList: { add() {}, remove() {} } }),
            body: { addEventListener() {}, appendChild() {}, setAttribute() {}, classList: { add() {}, remove() {} }, style: {} }
        };
        const win = chargerModal(db, doc, storage);
        await win.ouvrirModalExport();

        expect(appelsGet).toBe(0); // le cœur P5 : zéro matérialisation
        const html = zones['listeClesExport'].innerHTML;
        expect(html).toContain('petiteCle');
        expect(html).toContain('grosseCle');
        expect(html).not.toContain('? Ko'); // les deux tailles sont calculées
    });
});
