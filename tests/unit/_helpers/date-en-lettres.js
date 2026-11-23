import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racineProjet = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

/**
 * Publication des parcours (23 nov. 2026) — pose le VRAI `js/date-en-lettres.js` (`window.dateEnLettres`, la seule
 * façon d'écrire une date en toutes lettres, « 1er octobre ») sur un faux `window`, quand il ne l'a pas. index.html le
 * charge avant tout module qui en écrit une ; `chargerScript` le pose de lui-même, ce helper sert aux harnais qui
 * montent leurs modules autrement (vm, new Function). Rend le `window`.
 */
export function poserDateEnLettres(fauxWindow) {
    if (fauxWindow && typeof fauxWindow.dateEnLettres !== 'function') {
        new Function('window', '"use strict";\n' +
            readFileSync(path.join(racineProjet, 'js/date-en-lettres.js'), 'utf8'))(fauxWindow);
    }
    return fauxWindow;
}
