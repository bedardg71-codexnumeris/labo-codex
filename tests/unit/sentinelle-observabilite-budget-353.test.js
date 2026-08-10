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

    it('statsStockage mesure frais : unités, ratio, top clés triées, contributeurs connus', () => {
        ls.setItem('petite', 'x');
        ls.setItem('h2026_evaluationsSauvegardees', 'y'.repeat(50000));
        ls.setItem('h2026_fichiersTravaux_backup_v1', 'b'.repeat(20000));
        ls.setItem('tamponsImages', 'i'.repeat(30000));
        const stats = db.statsStockage(3);
        expect(stats.nbCles).toBe(4);
        expect(stats.budget).toBe(5 * 1024 * 1024);
        expect(stats.ratio).toBeCloseTo(stats.unites / stats.budget, 10);
        expect(stats.topCles[0].cle).toBe('h2026_evaluationsSauvegardees'); // tri décroissant
        expect(stats.contributeursConnus.backupsV1).toBeGreaterThan(20000 - 100);
        expect(stats.contributeursConnus.tamponsImages).toBeGreaterThan(30000 - 100);
    });

    it('⚠ L\'UNITÉ EST LE CARACTÈRE, exactement — pas l\'octet UTF-16', () => {
        // LE cas de #353 (10 août 2026). Le navigateur facture localStorage en
        // unités de code UTF-16 : mesuré au navigateur en remplissant jusqu'au
        // QuotaExceededError, 4,94 M caractères tenus AUSSI BIEN avec 'x'
        // (1 octet UTF-8) qu'avec 'é' (2 octets UTF-8) — c'est le caractère qui
        // est compté. La mesure doublait, donc le ratio affiché doublait : les
        // « 200 % » du terrain étaient 100 % du plafond réel.
        //
        // ⮕ Un ratio impossible invite à ne plus croire l'alerte. C'est le pire
        // résultat pour une alerte, et c'est ce que cette assertion empêche.
        ls.clear();
        ls.setItem('k', 'a'.repeat(1000));       // 1 + 1000 caractères
        const stats = db.statsStockage(1);
        expect(stats.unites).toBe(1001);          // × 2 ⇒ 2002 ⇒ ROUGE
        expect(stats.topCles[0].unites).toBe(1001);

        // Et l'accent ne change RIEN au coût : 1 caractère = 1 unité.
        ls.clear();
        ls.setItem('k', 'é'.repeat(1000));
        expect(db.statsStockage(1).unites).toBe(1001);
    });

    it('⚠ L\'ESTIMATEUR de routage parle la MÊME monnaie que le budget', () => {
        // Trou trouvé par break-test le 10 août : remettre `new Blob(...).size`
        // (octets UTF-8) ne faisait rougir AUCUN cas. Or c'est ce chiffre qui
        // décide du routage IDB-first, comparé à SEUIL_IDB_FIRST — un seuil
        // exprimé dans la monnaie du quota. Deux unités de part et d'autre du
        // même `>` : l'arbitrage sur chiffres que #353 réclame devient impossible.
        //
        // L'accent est le témoin qui tranche : 1 caractère, 2 octets UTF-8.
        expect(db._estimateSizeFromString('a'.repeat(1000))).toBe(1000);
        expect(db._estimateSizeFromString('é'.repeat(1000))).toBe(1000);  // Blob ⇒ 2000 ⇒ ROUGE
        expect(db._estimateSizeFromString(null)).toBe(-1);
    });

    it('⚠ LE SEUIL EST À 25 Ki — la valeur tranchée sur les chiffres du terrain', () => {
        // Option 2 du RAPPORT-353, décidée par Grégoire le 10 août sur le relevé
        // des DEUX navigateurs (Chrome 100 % / 475 clés · Safari 88,3 % / 462) :
        //
        //   seuil     Chrome reste   Safari reste
        //   200 Ki       100 %          88 %   ← ZÉRO clé déplacée : la plus
        //                                        grosse clé pèse 184 K car., donc
        //                                        le seuil était au-dessus de tout
        //    25 Ki        44 %          44 %   ← retenu (les deux convergent)
        //
        // ⮕ Ce cas verrouille la VALEUR et son motif. Sans lui, la remonter à
        //   200 Ki serait indolore pour la suite de tests — et redonnerait un
        //   seuil qui ne peut jamais se déclencher.
        const stats = db.statsStockage(1);
        expect(stats.seuilCourantKi).toBe(25);

        // ⚠ ET LE GARDE QUI REND LA BAISSE SANS DANGER : sans IndexedDB, une
        // valeur au-dessus du seuil retombe en localStorage au lieu d'aller
        // nulle part. C'est `idbDispo` dans setSync — ici IDB est absent (bac à
        // sable Node), donc c'est exactement le cas testé. Abaisser le seuil
        // n'expose donc RIEN de neuf quand IDB manque.
        db.setSync('moyenne', 'x'.repeat(30 * 1024));
        expect(ls.getItem('moyenne')).not.toBeNull();
        expect(db.getSync('moyenne', null)).not.toBeNull();
    });

    it('la projection de seuils donne de quoi trancher l\'option 2 sur des chiffres', () => {
        ls.clear();
        ls.setItem('enorme', 'z'.repeat(300 * 1024));   // > 200 Ki car.
        ls.setItem('moyenne', 'y'.repeat(60 * 1024));   // > 50, < 100
        ls.setItem('menue', 'w'.repeat(1024));
        const stats = db.statsStockage(5);

        expect(stats.seuilCourantKi).toBe(25);
        const par = Object.fromEntries(stats.projectionSeuils.map(p => [p.seuilKi, p]));
        expect(par[200].nbCles).toBe(1);              // seule l'énorme dépasse
        expect(par[50].nbCles).toBe(2);               // l'énorme + la moyenne
        expect(par[50].uniteesLiberees).toBeGreaterThan(par[200].uniteesLiberees);
        // Baisser le seuil ne peut que réduire l'occupation restante.
        expect(par[50].ratioApres).toBeLessThan(par[200].ratioApres);
    });

    it('à ≥80 % du budget, UNE alerte console.warn — et l\'écriture qui la déclenche aboutit quand même', () => {
        // #353 : le budget est en CARACTÈRES — 85 % de 5 Mi car. ≈ 4,46 M car.
        ls.setItem('gros_contenu', 'z'.repeat(4460000));
        db.setSync('cle_declencheuse', 'valeur');
        const alertes = warns.filter(w => w.includes('[DB #353]'));
        expect(alertes).toHaveLength(1);
        expect(alertes[0]).toContain('% du quota');
        expect(alertes[0]).toContain('db.statsStockage()');
        // Observabilité seule : l'écriture n'a pas été altérée
        expect(db.getSync('cle_declencheuse', null)).toBe('valeur');
    });

    it('le palier 80 % n\'émet qu\'une fois par session (pas de spam au fil des écritures)', () => {
        ls.setItem('gros_contenu', 'z'.repeat(4460000));
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
