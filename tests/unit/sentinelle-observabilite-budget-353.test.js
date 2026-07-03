import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle — #353 Option 1 (3 juillet 2026, décision Grégoire du 28 juin :
// « observabilité d'abord, mesurer avant de trancher entre les options 2/3/4 »).
//
// Verrouille :
//   1. db.statsStockage() mesure l'occupation FRAÎCHE de localStorage (octets,
//      ratio vs budget ~5 Mo WebKit file://, top clés triées, contributeurs
//      connus du RAPPORT-353 §3 : *_backup_v1, tamponsImages) ;
//   2. l'alerte de budget : UN console.warn par palier (80 %) et par session,
//      throttlée — émise au fil de l'eau par _setLocalStorage, JAMAIS deux fois ;
//   3. purgerBackupsV1 : outil console DRY-RUN PAR DÉFAUT (liste sans toucher),
//      suppression réelle seulement sur { dryRun: false } ;
//   4. zéro-dette : libereCacheLocalStorage (code mort, 0 appelant) est RETIRÉ.
//
// Observabilité SEULE : aucun changement de comportement d'écriture — vérifié
// par le cas 2 (la valeur écrite au moment de l'alerte est bien présente).

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function chargerDb({ console: consoleCapture } = {}) {
    const code = readFileSync(path.join(racine, 'js/db.js'), 'utf8');
    const ls = {
        _d: {},
        get length() { return Object.keys(this._d).length; },
        key(i) { return Object.keys(this._d)[i] ?? null; },
        getItem(k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
        setItem(k, v) { this._d[k] = String(v); },
        removeItem(k) { delete this._d[k]; },
        clear() { this._d = {}; }
    };
    const win = { addEventListener() {}, dispatchEvent() {} };
    const doc = { addEventListener() {} };
    const cons = consoleCapture || { log() {}, warn() {}, error() {} };
    const fn = new Function(
        'window', 'document', 'console', 'localStorage', 'sessionStorage', 'indexedDB',
        '"use strict";\n' + code
    );
    fn(win, doc, cons, ls, ls, undefined);
    const db = win.db;
    db.useIndexedDB = false; // pas d'IDB dans ce harnais : localStorage + memoryCache
    db.ready = true;
    db.memoryCache.clear();
    ls.clear();
    return { db, ls };
}

describe('sentinelle · observabilité du budget localStorage (#353 Option 1)', () => {
    let warns, db, ls;

    beforeEach(() => {
        warns = [];
        ({ db, ls } = chargerDb({
            console: { log() {}, warn(msg) { warns.push(String(msg)); }, error() {} }
        }));
    });

    it('statsStockage mesure frais : octets, ratio, top clés triées, contributeurs connus', () => {
        ls.setItem('petite', 'x');
        ls.setItem('h2026_evaluationsSauvegardees', 'y'.repeat(50000));
        ls.setItem('h2026_fichiersTravaux_backup_v1', 'b'.repeat(20000));
        ls.setItem('tamponsImages', 'i'.repeat(30000));
        const stats = db.statsStockage(3);
        expect(stats.nbCles).toBe(4);
        expect(stats.budget).toBe(5 * 1024 * 1024);
        expect(stats.octets).toBeGreaterThan(100000 * 2 - 1000); // ≈ (50k+20k+30k+…)×2
        expect(stats.ratio).toBeCloseTo(stats.octets / stats.budget, 10);
        expect(stats.topCles[0].cle).toBe('h2026_evaluationsSauvegardees'); // tri décroissant
        expect(stats.contributeursConnus.backupsV1).toBeGreaterThan(20000 * 2 - 100);
        expect(stats.contributeursConnus.tamponsImages).toBeGreaterThan(30000 * 2 - 100);
    });

    it('à ≥80 % du budget, UNE alerte console.warn — et l\'écriture qui la déclenche aboutit quand même', () => {
        // Remplir à ~85 % du budget (5 Mo) : 2,23 M de caractères ≈ 4,46 Mo UTF-16
        ls.setItem('gros_contenu', 'z'.repeat(2230000));
        db.setSync('cle_declencheuse', 'valeur');
        const alertes = warns.filter(w => w.includes('[DB #353]'));
        expect(alertes).toHaveLength(1);
        expect(alertes[0]).toContain('% du budget');
        expect(alertes[0]).toContain('db.statsStockage()');
        // Observabilité seule : l'écriture n'a pas été altérée
        expect(db.getSync('cle_declencheuse', null)).toBe('valeur');
    });

    it('le palier 80 % n\'émet qu\'une fois par session (pas de spam au fil des écritures)', () => {
        ls.setItem('gros_contenu', 'z'.repeat(2230000));
        db.setSync('a', '1');
        db._budgetDerniereVerif = 0; // neutralise le throttle pour prouver la garde par palier
        db.setSync('b', '2');
        db._budgetDerniereVerif = 0;
        db.setSync('c', '3');
        expect(warns.filter(w => w.includes('[DB #353]'))).toHaveLength(1);
    });

    it('sous le palier : aucune alerte', () => {
        db.setSync('normal', 'contenu modeste');
        expect(warns.filter(w => w.includes('[DB #353]'))).toHaveLength(0);
    });

    it('purgerBackupsV1 : DRY-RUN par défaut (liste sans toucher), suppression réelle sur dryRun:false', () => {
        db.setSync('h2026_fichiersTravaux_backup_v1', { gros: 'backup' });
        db.setSync('a2025_corbeilleFichiers_backup_v1', { autre: 'backup' });
        db.setSync('h2026_productions', ['donnée vivante']);

        const dry = db.purgerBackupsV1();
        expect(dry.dryRun).toBe(true);
        expect(dry.cibles.map(c => c.cle).sort()).toEqual([
            'a2025_corbeilleFichiers_backup_v1', 'h2026_fichiersTravaux_backup_v1'
        ]);
        expect(db.getSync('h2026_fichiersTravaux_backup_v1', null)).not.toBeNull(); // rien touché

        const exec = db.purgerBackupsV1({ dryRun: false });
        expect(exec.dryRun).toBe(false);
        expect(db.getSync('h2026_fichiersTravaux_backup_v1', null)).toBeNull();
        expect(db.getSync('a2025_corbeilleFichiers_backup_v1', null)).toBeNull();
        expect(db.getSync('h2026_productions', null)).not.toBeNull(); // donnée vivante intacte
    });

    it('zéro-dette : libereCacheLocalStorage (code mort) est retiré de db.js', () => {
        const code = readFileSync(path.join(racine, 'js/db.js'), 'utf8');
        expect(code).not.toContain('libereCacheLocalStorage');
        expect(typeof db.libereCacheLocalStorage).toBe('undefined');
    });
});
