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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scripts = path.resolve(__dirname, '..', '..', 'scripts');
const nettoyer = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const releves = readdirSync(scripts).filter((f) => /^releve-.*\.js$/.test(f))
    .map((f) => [f, nettoyer(readFileSync(path.join(scripts, f), 'utf8'))]);

describe('Les relevés de scripts/ sont en lecture seule', () => {
    it('il y en a au moins un (sinon la sentinelle ne garde rien)', () => {
        expect(releves.length).toBeGreaterThan(0);
    });

    it('aucun ne lit par db.get (qui recopie dans IndexedDB) ni n\'appelle un écrivain', () => {
        const ecrivains = /\bdb\.(get|set|setSync|remove|removeSync|clear)\s*\(|localStorage\.(setItem|removeItem|clear)\s*\(|indexedDB\.|\.put\s*\(|\.delete\s*\(/;
        const fautifs = releves.filter(([, src]) => ecrivains.test(src)).map(([f, src]) => f + ' : ' + src.match(ecrivains)[0]);
        expect(fautifs).toEqual([]);
    });
});
