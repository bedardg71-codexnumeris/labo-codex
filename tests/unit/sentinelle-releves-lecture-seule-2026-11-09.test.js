import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — UN RELEVÉ À COLLER DANS LA CONSOLE NE RIEN ÉCRIT (9 nov. 2026, relayé par Cowork).
//
// Le relevé des rétroactions retouchées se disait en lecture seule, mais lisait par `db.get` : celui-ci recopie
// dans IndexedDB une clé qu'il ne trouve que dans le localStorage (js/db.js, `_getIndexedDB`). Grégoire l'a lancé
// dans la version corrigée par Cowork (`db.getSync`). Tout `scripts/releve-*.js` lit par `db.getSync` et n'appelle
// aucun écrivain.
//
// Groupe 3 (9 nov., file de Cowork) : les `scripts/diagnostic-*.js` aussi. Une seule exception, déclarée :
// `diagnostic-353-cles-orphelines.js` recense ET purge (la purge est un geste séparé, qu'on appelle soi-même) ;
// sa lecture par `db.get` garde une copie de la clé juste avant de la supprimer.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scripts = path.resolve(__dirname, '..', '..', 'scripts');
const nettoyer = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const lireTous = (motif) => readdirSync(scripts).filter((f) => motif.test(f))
    .map((f) => [f, nettoyer(readFileSync(path.join(scripts, f), 'utf8'))]);
const releves = lireTous(/^releve-.*\.js$/);
const PURGE_DECLAREE = 'diagnostic-353-cles-orphelines.js';
const diagnostics = lireTous(/^diagnostic-.*\.js$/);
const ecrivains = /\bdb\.(get|set|setSync|remove|removeSync|clear)\s*\(|localStorage\.(setItem|removeItem|clear)\s*\(|indexedDB\.|\.put\s*\(|\.delete\s*\(/;

describe('Les relevés de scripts/ sont en lecture seule', () => {
    it('il y en a au moins un (sinon la sentinelle ne garde rien)', () => {
        expect(releves.length).toBeGreaterThan(0);
    });

    it('aucun ne lit par db.get (qui recopie dans IndexedDB) ni n\'appelle un écrivain', () => {
        const fautifs = releves.filter(([, src]) => ecrivains.test(src)).map(([f, src]) => f + ' : ' + src.match(ecrivains)[0]);
        expect(fautifs).toEqual([]);
    });
});

describe('Les diagnostics de scripts/ sont en lecture seule (groupe 3)', () => {
    it('ils sont là, et la purge déclarée aussi (sinon l\'exception ne garde rien)', () => {
        expect(diagnostics.length).toBeGreaterThan(10);
        expect(diagnostics.map(([f]) => f)).toContain(PURGE_DECLAREE);
    });

    it('aucun ne lit par db.get ni n\'appelle un écrivain, hors la purge déclarée', () => {
        const fautifs = diagnostics.filter(([f, src]) => f !== PURGE_DECLAREE && ecrivains.test(src))
            .map(([f, src]) => f + ' : ' + src.match(ecrivains)[0]);
        expect(fautifs).toEqual([]);
    });
});
