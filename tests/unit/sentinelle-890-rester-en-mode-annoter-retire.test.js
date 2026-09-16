import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE-CLIQUET — #890 · LE DRAPEAU `_resterEnModeAnnoter` NE REVIENT PAS.
//
// Plus aucune ligne ne le mettait à vrai depuis 59690542 (29 mars 2026). Restaient
// une remise à faux (ouvrirFichier), un terme toujours vrai dans la restauration du
// mode (travaux-ui.js) et une garde jamais prise (evaluation.js). Retirés le
// 16 sept. 2026 : un drapeau qu'on lit sans jamais l'écrire fait croire qu'un
// trajet existe.
//
// BREAK-TEST (fait le 16 sept. 2026) — réintroduire dans js/travaux-ui.js :
//   if (window._resterEnModeAnnoter) window._resterEnModeAnnoter = false;
// → l'essai ROUGIT en nommant travaux-ui.js.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dossierJs = path.resolve(__dirname, '..', '..', 'js');

/** Tous les .js de js/, récursivement, hors _archives. */
function fichiersJs(dossier = dossierJs, acc = []) {
    for (const entree of readdirSync(dossier)) {
        if (entree === '_archives') continue;
        const complet = path.join(dossier, entree);
        if (statSync(complet).isDirectory()) fichiersJs(complet, acc);
        else if (entree.endsWith('.js')) acc.push(complet);
    }
    return acc;
}

describe('#890 · le drapeau mort _resterEnModeAnnoter ne revient pas', () => {
    it('balaie bien des fichiers (le balayage mesure quelque chose)', () => {
        const noms = fichiersJs().map(f => path.basename(f));
        expect(noms).toContain('travaux-ui.js');
        expect(noms).toContain('evaluation.js');
    });

    it('aucun fichier de js/ ne nomme _resterEnModeAnnoter', () => {
        const fautifs = fichiersJs()
            .filter(f => readFileSync(f, 'utf8').includes('_resterEnModeAnnoter'))
            .map(f => path.relative(dossierJs, f));
        expect(fautifs).toEqual([]);
    });
});
