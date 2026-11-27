/**
 * #1208 (entrée 18 de la file, 4 nov. 2026) — sous la barre P de l'Aperçu, « 1 étudiant·e en
 * Développement montrent » : le nom s'accordait (`window.pluriel`), pas le verbe. Les quatre messages
 * de `genererInterpretationPerformance` accordent désormais leurs verbes, avec le même `pluriel`.
 * ↻ 27 nov. 2026 (#1190) : les phrases nomment les deux seuils de l'échelle, plus les niveaux ; les accords restent.
 *
 *   cd tests && npx vitest run unit/apercu-verbes-accordes-1208.test.js
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerAvecInterne } from './_helpers/bac-suivi.js';

const ECHELLE = { seuilSuffisance: 'D', seuilMaitrise: 'M', niveaux: [
    { code: '0', min: 0, max: 0 }, { code: 'PS', min: 0, max: 39.99 }, { code: 'I', min: 40, max: 64.99 },
    { code: 'D', min: 65, max: 74.99 }, { code: 'M', min: 75, max: 84.99 }, { code: 'E', min: 85, max: 100 }] };
// #1190 (27 nov. 2026) : la phrase lit les deux repères, tels que `reperesPerformance` les rend pour cette échelle
// (le `min` de D et celui de M). La lecture réelle est éprouvée par apercu-phrase-performance-seuils-1190.test.js.
const REPERES = { echelle: ECHELLE, suffisance: 65, maitrise: 75, audela: 85, passage: 60 };
// Le vrai `pluriel` (trimestre-v2-etudiants.js), pas une copie.
const vraiPluriel = chargerScript('js/trimestre-v2-etudiants.js', {}).pluriel;

function interpreter(etudiants, patterns) {
    const win = { addEventListener() {}, removeEventListener() {}, pluriel: vraiPluriel };
    const db = { getSync: (k, d) => (k === 'test_indicesPatternsRaI' ? patterns : (d !== undefined ? d : null)), setSync() {}, get: async () => null, set: async () => {} };
    chargerAvecInterne('js/tableau-bord-apercu.js', { db, cle: (k) => 'test_' + k, formaterPourcentage: (v) => v + ' %',
        document: { addEventListener() {}, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], readyState: 'complete' } },
    win, ['genererInterpretationPerformance']);
    return win.__audit['tableau-bord-apercu.js'].genererInterpretationPerformance(etudiants, REPERES);
}

describe('#1208 · les verbes de l\'Aperçu s\'accordent', () => {
    it('un·e seul·e : « a atteint », « montre … pourrait », « montre des signes », au singulier', () => {
        const msg = interpreter(
            [{ da: 'm', valeur: 0.80 }, { da: 'd', valeur: 0.70 }, { da: 'i', valeur: 0.50 }],
            { d: { pattern: 'Stable' }, i: { pattern: 'Stable' } });
        expect(msg).toContain('1 étudiant·e (33 %) a atteint ou dépassé le seuil de maîtrise');
        expect(msg).toContain('1 étudiant·e entre le seuil minimal de réussite et le seuil de maîtrise montre une progression favorable et pourrait atteindre la maîtrise prochainement');
        expect(msg).toContain('sous le seuil minimal de réussite, 1 montre des signes de progrès');
    });

    it('un·e seul·e sous le seuil minimal, sans progrès : « nécessite »', () => {
        expect(interpreter([{ da: 'i', valeur: 0.50 }], { i: { pattern: 'Difficulté persistante' } }))
            .toContain('1 étudiant·e sous le seuil minimal de réussite nécessite un accompagnement intensif');
    });

    it('« montre des signes » s\'accorde au nombre en progrès, pas au nombre sous le seuil minimal (relecture neuve)', () => {
        const msg = interpreter([{ da: 'i1', valeur: 0.50 }, { da: 'i2', valeur: 0.45 }, { da: 'i3', valeur: 0.30 }],
            { i1: { pattern: 'Stable' }, i2: { pattern: 'Difficulté persistante' }, i3: { pattern: 'Difficulté persistante' } });
        expect(msg).toContain('Parmi les 3 étudiant·es sous le seuil minimal de réussite, 1 montre des signes de progrès');
    });

    it('plusieurs : le pluriel reste', () => {
        const msg = interpreter(
            [{ da: 'm1', valeur: 0.80 }, { da: 'm2', valeur: 0.90 }, { da: 'd1', valeur: 0.70 }, { da: 'd2', valeur: 0.66 },
             { da: 'i1', valeur: 0.50 }, { da: 'i2', valeur: 0.30 }],
            { d1: { pattern: 'Stable' }, d2: { pattern: 'Stable' }, i1: { pattern: 'Stable' }, i2: { pattern: 'Stable' } });
        expect(msg).toContain('2 étudiant·es (33 %) ont atteint');
        expect(msg).toContain('2 étudiant·es entre le seuil minimal de réussite et le seuil de maîtrise montrent une progression favorable et pourraient atteindre');
        expect(msg).toContain('sous le seuil minimal de réussite, 2 montrent des signes de progrès');
        expect(interpreter([{ da: 'i1', valeur: 0.50 }, { da: 'i2', valeur: 0.30 }], {}))
            .toContain('2 étudiant·es sous le seuil minimal de réussite nécessitent un accompagnement intensif');
    });
});
