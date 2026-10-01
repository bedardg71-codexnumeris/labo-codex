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
//  (c) [retiré au lot I bis, 30 sept. 2026 : la fenêtre des clés n'existe plus]

const CustomEvent = class { constructor(t, o) { this.type = t; this.detail = o && o.detail; } };

function chargerDb(jsonSpy) {
    const globaux = { CustomEvent };
    if (jsonSpy) globaux.JSON = jsonSpy;
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

// (c) RETIRÉ au lot I bis (D9, 30 sept. 2026) : `ouvrirModalExport` affichait les tailles
// sans matérialiser les valeurs. La fenêtre des clés et sa fonction n'existent plus (le
// cliquet sentinelle-lot-I-bis-un-seul-terme refuse leur retour) : il n'y a plus rien à juger.
