/**
 * #812 (3 nov. 2026) — UN RAPPORT DE BUG ÉCRIT LE SOIR PORTE LA BONNE DATE.
 * L'identifiant et le nom du fichier mêlaient la date UTC (`toISOString`) et l'heure locale
 * (`toTimeString`) : le rapport de Grégoire écrit le 26 oct. à 21 h 05 s'appelle
 * `FEEDBACK__grégoire__2026-10-27_21-05-27.txt`. Le vrai module, dans un JSDOM, à Toronto.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = readFileSync(path.join(racine, 'js/rapport-bug.js'), 'utf8');

let w, magasin, telecharge, tzAvant;
beforeEach(() => {
    tzAvant = process.env.TZ;
    process.env.TZ = 'America/Toronto';
    const dom = new JSDOM('<!doctype html><html><body><textarea id="descriptionBug">Un défaut fictif</textarea>'
        + '<input id="prenomTesteur" value="Testeur"></body></html>', { runScripts: 'outside-only', url: 'https://exemple.test/' });
    w = dom.window;
    // 27 oct. 2026, 1 h 05 min 27 s UTC = 26 oct., 21 h 05 min 27 s à Toronto (HAE). L'horloge
    // fixée DANS la fenêtre : le `Date` du JSDOM n'est pas celui que Vitest sait truquer.
    const FIXE = Date.parse('2026-10-27T01:05:27Z');
    const DateDeLaFenetre = w.Date;
    w.Date = class extends DateDeLaFenetre {
        constructor(...a) { if (a.length) super(...a); else super(FIXE); }
        static now() { return FIXE; }
    };
    magasin = {};
    w.db = { getSync: (k, d) => (k in magasin ? magasin[k] : d), setSync: (k, v) => { magasin[k] = v; } };
    w.genererIdUnique = (p) => p + '1';
    w.URL.createObjectURL = () => 'blob:fictif';
    w.URL.revokeObjectURL = () => {};
    telecharge = null;
    w.HTMLAnchorElement.prototype.click = function () { telecharge = this.download; };
    w.eval(source);
});
afterEach(() => {
    if (tzAvant === undefined) delete process.env.TZ; else process.env.TZ = tzAvant;
});

describe('#812 — la date du rapport est celle du jour local', () => {
    it('le nom du fichier TXT porte le 26 oct. à 21-05-27, pas le 27', async () => {
        await w.telechargerRapportTxt(null);
        expect(telecharge).toBe('BUG_testeur_2026-10-26_21-05-27.txt');
    });

    it('l\'identifiant écrit dans le rapport porte la même date', async () => {
        await w.telechargerRapportTxt(null);
        const rapport = magasin.rapportsBugArchives[0].rapport;
        expect(rapport).toContain('BUG_testeur_2026-10-26_21-05-27');
        expect(rapport).not.toContain('2026-10-27_21-05-27');
    });
});
