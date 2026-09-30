import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..', '..');

/**
 * Monte `js/fichier-sortant.js` dans le `window` d'un bac à sable : il y pose
 * `window.FichierSortant`, que `js/codex.js` et `js/reserve.js` appellent depuis le lot A1
 * (30 sept. 2026). À appeler AVANT de monter l'un ou l'autre.
 *
 * @param {object} win - le faux `window` du banc
 * @param {object} [options]
 * @param {function(string): string} [options.muter] - mutation de la SOURCE (témoins)
 * @param {object} [options.document] - le faux `document` (seul `telecharger` s'en sert)
 * @param {function} [options.setTimeout]
 * @param {object} [options.URL] - un faux `URL` (pour voir créer et libérer une adresse)
 * @returns {{ mute: boolean }} `mute` : la mutation a-t-elle remplacé quelque chose ici ?
 */
export function monterFichierSortant(win, options = {}) {
    const brut = readFileSync(path.join(racineProjet, 'js/fichier-sortant.js'), 'utf8');
    const code = options.muter ? options.muter(brut) : brut;
    new Function('window', 'document', 'setTimeout', 'URL', '"use strict";\n' + code)(
        win, options.document || {}, options.setTimeout || setTimeout, options.URL || URL
    );
    return { mute: code !== brut };
}
