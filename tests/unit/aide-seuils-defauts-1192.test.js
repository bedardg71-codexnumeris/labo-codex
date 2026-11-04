/**
 * #1192 (entrée 20 de la file, 4 nov. 2026) — l'aide « Seuils d'interprétation du dépistage » dit les
 * VRAIS défauts. Elle disait « Progression : 5 points » ; le défaut vaut 0,10, soit 10 points
 * (`SEUILS_PAR_DEFAUT.progressionArtefacts`, interpretation-config.js ; l'écran convertit ×100,
 * `_fractionEnPoints`, preferences-v2.js). Mesuré aussi : « Sensibilité des flèches » (5) et « Défi » (70) étaient justes.
 * L'essai lit les trois nombres de l'aide et les compare aux défauts : il rougit si l'un des deux bouge seul.
 *
 *   cd tests && npx vitest run unit/aide-seuils-defauts-1192.test.js
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

describe('#1192 · l\'aide des seuils dit les défauts du code', () => {
    let recues = {};
    chargerScript('js/accompagnement-contenu-popup.js', {}, { accompagnement: { ajouterEntrees: (o) => { recues = o; } } });
    const D = chargerScript('js/interpretation-config.js', { db: { getSync: (k, d) => d, setSync() {} } }).SEUILS_PAR_DEFAUT;
    const entree = recues['depistage-interpretation'];
    const aide = entree && (entree.popup || entree);
    const texte = ((aide && aide.sections) || []).filter((s) => s.titre === 'Valeurs par défaut').map((s) => s.contenu).join(' ');
    const nombre = (re) => { const m = re.exec(texte); return m ? Number(m[1]) : null; };

    it('« Progression » : 10 points, le défaut de progressionArtefacts', () => {
        expect(nombre(/Progression\s*:\s*(\d+)\s*points/)).toBe(Math.round(D.progressionArtefacts * 100));
        expect(nombre(/Progression\s*:\s*(\d+)\s*points/)).toBe(10);
    });
    it('« Sensibilité des flèches » et « Défi » suivent aussi leurs défauts', () => {
        expect(nombre(/Sensibilité des flèches par critère\s*:\s*(\d+)\s*points/)).toBe(Math.round(D.directionRisque * 100));
        expect(nombre(/Défi\s*:\s*≤\s*(\d+)/)).toBe(Math.round(D.defiSpecifique * 100));
    });
});
