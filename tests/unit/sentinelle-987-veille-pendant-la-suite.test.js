/**
 * Sentinelle #987 — le Mac ne s'endort pas pendant le verdict Playwright.
 *
 * Mesuré le 29 sept. 2026 : 75 des 115 minutes d'un passage complet tombaient
 * dans 13 essais qui avaient chacun commencé à l'instant d'une veille
 * d'inactivité (`pmset -g log`). Ils portaient les 2 échecs et les 10 reprises.
 * Le verdict tient donc le Mac éveillé par `caffeinate`, attaché à son propre
 * processus, AVANT de lancer la suite.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const VERIF = readFileSync(path.join(racine, 'scripts', 'verifier-playwright.mjs'), 'utf8');

describe('#987 — caffeinate pendant le verdict Playwright', () => {
    const appel = VERIF.search(/spawn\(\s*'caffeinate'/);
    const suite = VERIF.indexOf("spawnSync('npx', ['playwright', 'test'");

    it('caffeinate est lancé, et avant la suite', () => {
        expect(appel).toBeGreaterThan(-1);
        expect(suite).toBeGreaterThan(-1);
        expect(appel).toBeLessThan(suite);
    });

    it('il empêche la veille d’inactivité (-i) le temps de CE processus (-w pid)', () => {
        const ligne = VERIF.slice(appel, VERIF.indexOf('\n', appel));
        expect(ligne).toMatch(/\['-i',\s*'-w',\s*String\(process\.pid\)\]/);
    });

    it('un caffeinate absent avertit au lieu de faire tomber le verdict (écouteur error)', () => {
        const chaine = VERIF.slice(appel, VERIF.indexOf('.unref()', appel));
        expect(chaine).toMatch(/\.on\(\s*'error'\s*,[\s\S]*console\.warn\(/);
    });

    it('il n’est pas commenté ni enfermé dans une condition autre que macOS', () => {
        const avant = VERIF.slice(VERIF.lastIndexOf('\n', appel - 1) + 1, appel);
        expect(avant.trim()).not.toMatch(/^\/\//);
        const bloc = VERIF.slice(VERIF.lastIndexOf('if (', appel), appel);
        expect(bloc).toMatch(/^if \(process\.platform === 'darwin'\) \{\s*$/);
    });
});
