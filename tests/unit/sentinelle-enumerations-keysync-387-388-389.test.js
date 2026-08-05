import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLES — #387 + #388 + #389 (audit qualité 5 août 2026, rapports A6/C1/C2)
//
// #387 : detecterFormatConfig reconnaissait les clés namespacées par la chaîne
// « 2026 » codée en dur — toute sauvegarde 2027+ devenait « Fichier non
// reconnu ». Verrou : patron de préfixe trimestre /^(?:[ahe]\d{4}|demo)_/.
//
// #388 : purgerTrimestresOrphelins supprimait par localStorage.removeItem BRUT
// — la copie IndexedDB survivait et syncToLocalStorageCache RESSUSCITAIT les
// clés purgées au boot suivant. Verrou : db.removeSync (3 couches) + union.
//
// #389 : classe « énumération localStorage seulement » — une clé peut vivre en
// memoryCache SEULEMENT (bascule silencieuse sur quota, leçon du 5 août).
// Verrou : helper db.keysSync() (localStorage ∪ memoryCache) + bascule des
// 7 sites à risque (export config, exporterCartouches, cartouches à l'éval,
// 4 scans de bibliothèques) + lister/purger orphelins.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racineProjet, 'js', f), 'utf8');

function fauxLocalStorage(donnees) {
    const ls = { ...donnees };
    return {
        _data: ls,
        get length() { return Object.keys(ls).length; },
        key: (i) => Object.keys(ls)[i] ?? null,
        getItem: (k) => (k in ls ? JSON.stringify(ls[k]) : null),
        setItem: (k, v) => { ls[k] = JSON.parse(v); },
        removeItem: (k) => { delete ls[k]; }
    };
}

describe('#389 · db.keysSync() = localStorage ∪ memoryCache (fonctionnel)', () => {
    it('énumère les clés des DEUX couches, sans doublon', () => {
        const win = chargerScript('js/db.js', {
            localStorage: fauxLocalStorage({ h2026_a: 1, commun: 2 })
        }, { addEventListener: () => {}, dispatchEvent: () => {} });
        win.db.memoryCache.set('a2026_b', [1]);
        win.db.memoryCache.set('commun', 3); // présent dans les deux couches
        const cles = win.db.keysSync();
        expect(cles.sort()).toEqual(['a2026_b', 'commun', 'h2026_a']);
    });
});

describe('#388 · purge des trimestres orphelins durable (fonctionnel)', () => {
    it('purgerTrimestresOrphelins passe par db.removeSync pour CHAQUE clé, memoryCache incluse', () => {
        const removeSyncSpy = vi.fn();
        const dbStub = {
            keysSync: () => ['h2025_groupeEtudiants', 'h2025_productions', 'h2026_groupeEtudiants', 'trimestres'],
            removeSync: removeSyncSpy,
            getSync: () => [], setSync: () => {}, get: async () => null, set: async () => {},
            memoryCache: new Map()
        };
        const win = chargerScript('js/trimestres.js', {
            db: dbStub, localStorage: fauxLocalStorage({}),
            notifications: { succes: () => {}, erreur: () => {} },
            echapperHtml: (s) => s
        }, { addEventListener: () => {}, dispatchEvent: () => {}, location: {} });
        const n = win.purgerTrimestresOrphelins(['h2025']);
        expect(n).toBe(2);
        expect(removeSyncSpy.mock.calls.map(c => c[0]).sort()).toEqual(['h2025_groupeEtudiants', 'h2025_productions']);
    });

    it('le corps de purgerTrimestresOrphelins ne contient PLUS de localStorage.removeItem (résurrection au boot)', () => {
        const src = lire('trimestres.js');
        const corps = src.slice(src.indexOf('function purgerTrimestresOrphelins'), src.indexOf('window.listerTrimestresOrphelins'));
        expect(corps).not.toMatch(/localStorage\.removeItem\(/);
        expect(corps).toMatch(/db\.removeSync\(cle\)/);
    });
});

describe('#387 · détection de format par patron de préfixe, plus d\'année en dur', () => {
    const src = lire('import-export.js');
    it('utilise le patron [ahe]AAAA_/demo_', () => {
        expect(src).toMatch(/\^\(\?:\[ahe\]\\d\{4\}\|demo\)_/);
    });
    it('ne réintroduit pas c.includes(\'2026\')', () => {
        expect(src).not.toMatch(/c\.includes\('2026'\)/);
    });
});

describe('#389 · les 7 sites à risque énumèrent via db.keysSync()', () => {
    it('export config complète + exporterCartouches + cartouches à l\'éval', () => {
        expect(lire('import-export.js')).toMatch(/const allKeys = db\.keysSync\(\);/);
        expect(lire('cartouches.js')).toMatch(/const allKeys = db\.keysSync\(\);/);
        expect(lire('evaluation.js')).toMatch(/db\.keysSync\(\)\.filter\(key => key\.startsWith\('cartouches_'\)\)/);
        expect(lire('import-export.js')).not.toMatch(/const allKeys = Object\.keys\(localStorage\);/);
        expect(lire('cartouches.js')).not.toMatch(/const allKeys = Object\.keys\(localStorage\);/);
    });

    it('les 4 scans de bibliothèques (grilles/échelles/cartouches/productions)', () => {
        for (const f of ['grilles-bibliotheque.js', 'echelles-bibliotheque.js', 'cartouches-bibliotheque.js', 'productions-bibliotheque.js']) {
            const src = lire(f);
            expect(src, f).toMatch(/const clesStockage = db\.keysSync\(\);/);
            expect(src, f).not.toMatch(/for \(let i = 0; i < localStorage\.length; i\+\+\)/);
        }
    });
});
