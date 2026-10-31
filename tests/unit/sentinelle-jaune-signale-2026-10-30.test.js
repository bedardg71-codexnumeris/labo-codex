/**
 * SENTINELLE — LE JAUNE « SIGNALÉ » RESTE LOIN DE L'ORANGE BRÛLÉ (décision de Grégoire du 30 oct. 2026, 22 h 55).
 *
 *   « oui, pas de problème » : éclaircir le jaune en mode sombre, renforcer le fond de sa pastille en mode clair.
 *
 *   · Texte et pastilles lisent le jaune par jetons de thème ; la liste en clair et les barres ne bougent pas.
 *   · Mesuré ici en simulation (repère, pas une norme : sous 10, difficile à distinguer). Aucune personne daltonienne n'a regardé.
 *   · En clair, le texte des deux pastilles se rapproche (1,9 en protanopie) : c'est leur fond qui les sépare.
 *   · tests/integration/seuils-une-source.spec.js lit les mêmes couleurs à l'écran.
 *
 *   cd tests && npx vitest run unit/sentinelle-jaune-signale-2026-10-30.test.js
 *
 * Break-tests : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';
import { canauxAffiches, ciede2000, ecarts } from './_helpers/ecart-daltonisme.js';

const lire = (fichier) => readFileSync(path.join(RACINE, fichier), 'utf8');
const CSS = lire('styles.css');
const variables = (debut) => Object.fromEntries([...tranche(CSS, debut, '\n}').matchAll(/(--[a-z-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const SOMBRE = variables(':root {');
const CLAIR = variables('.mode-clair {');

const lineaire = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminance = (rgb) => { const [r, g, b] = rgb.map(lineaire); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contraste = (a, b) => {
    const [haut, bas] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (haut + 0.05) / (bas + 0.05);
};
const REPERE = 10;

describe('(a) la mesure elle-même', () => {
    it('CIEDE2000 rend les valeurs de référence de Sharma, Wu et Dalal (2005)', () => {
        expect(ciede2000([50, 2.6772, -79.7751], [50, 0, -82.7485])).toBeCloseTo(2.0425, 3);
        expect(ciede2000([50, 2.5, 0], [73, 25, -18])).toBeCloseTo(27.1492, 3);
        expect(ciede2000([2.0776, 0.0795, -1.135], [0.9033, -0.0636, -0.5514])).toBeCloseTo(0.9082, 3);
    });

    it('la simulation voit la confusion d’avant la décision', () => {
        const avant = ecarts(SOMBRE['--zone-bas-texte'], '#ca8a04');
        expect(avant.typique).toBeGreaterThan(REPERE);
        expect(avant.protanopie).toBeLessThan(REPERE);
        expect(avant.deuteranopie).toBeLessThan(REPERE);
    });
});

describe('(b) les valeurs de la décision', () => {
    it('la liste et les pastilles lisent le jaune par jetons, dans les deux modes', () => {
        const win = monter(storeBase(), { modules: ['js/contexte-qualification.js'] }).win;
        expect(win.obtenirCouleurSelonSeuils(86)).toBe('var(--zone-signale-texte)');
        expect(CSS).toMatch(/\n\.prioritaire-indice-attention \{\s*background: var\(--zone-signale-pastille-fond\);\s*color: var\(--zone-signale-pastille-texte\);/);
        expect(CSS).toMatch(/\.mode-clair \.prioritaire-indice-attention \{\s*background: var\(--zone-signale-pastille-fond\);\s*color: var\(--zone-signale-pastille-texte\);/);
    });

    it('le sombre s’éclaircit, le fond clair se renforce ; la liste en clair ne bouge pas', () => {
        expect(SOMBRE['--zone-signale-texte']).toBe('#facc15');
        expect(SOMBRE['--zone-signale-pastille-texte']).toBe('#ffe082');
        expect(CLAIR['--zone-signale-pastille-fond']).toBe('rgba(250, 204, 21, 0.45)');
        expect(CLAIR['--zone-signale-pastille-texte']).toBe('#5f5200');
        expect(CLAIR['--zone-signale-texte']).toBe('#ca8a04');
    });

    it('les barres gardent leur jaune', () => {
        expect(lire('js/contexte-qualification.js')).toMatch(/COULEUR_BANDE = \{[^}]*signale: '#ffc107'/);
    });

    it('à l’impression, le jaune prend les valeurs du mode clair', () => {
        const racine = tranche(CSS, '@media print {\n    :root {', '\n    }');
        for (const v of ['--zone-signale-texte', '--zone-signale-pastille-texte', '--zone-signale-pastille-fond']) {
            expect(racine).toContain(`${v}: ${CLAIR[v]};`);
        }
    });

    it('la source de vérité des couleurs le dit', () => {
        const ds = lire('design-system.html');
        for (const mode of [SOMBRE, CLAIR]) {
            for (const v of ['--zone-signale-texte', '--zone-signale-pastille-texte', '--zone-signale-pastille-fond']) expect(ds).toContain(mode[v]);
        }
    });
});

describe('(c) les écarts avec l’orange, en simulation', () => {
    const tient = (e) => {
        for (const vision of ['typique', 'protanopie', 'deuteranopie']) expect(e[vision], vision).toBeGreaterThanOrEqual(REPERE);
    };
    const [surfaceSombre, surfaceClaire] = [SOMBRE, CLAIR].map((m) => canauxAffiches(m['--surface-carte']));

    it('la liste en sombre', () => tient(ecarts(SOMBRE['--zone-signale-texte'], SOMBRE['--zone-bas-texte'])));
    it('la liste en clair', () => tient(ecarts(CLAIR['--zone-signale-texte'], CLAIR['--zone-bas-texte'])));
    it('le texte de la pastille en sombre', () => tient(ecarts(SOMBRE['--zone-signale-pastille-texte'], SOMBRE['--zone-bas-pastille-texte'])));

    it('le fond de la pastille en clair', () => {
        tient(ecarts(canauxAffiches(CLAIR['--zone-signale-pastille-fond'], surfaceClaire), canauxAffiches(CLAIR['--zone-bas-pastille-fond'], surfaceClaire)));
    });

    it('le texte de la pastille tient 4,5:1 sur son fond, dans les deux modes', () => {
        for (const [mode, surface] of [[SOMBRE, surfaceSombre], [CLAIR, surfaceClaire]]) {
            const fond = canauxAffiches(mode['--zone-signale-pastille-fond'], surface);
            expect(contraste(canauxAffiches(mode['--zone-signale-pastille-texte']), fond)).toBeGreaterThanOrEqual(4.5);
        }
    });

    it('la liste en sombre tient 4,5:1 sur les surfaces du mode', () => {
        for (const v of ['--surface-section', '--surface-carte']) {
            expect(contraste(canauxAffiches(SOMBRE['--zone-signale-texte']), canauxAffiches(SOMBRE[v])), v).toBeGreaterThanOrEqual(4.5);
        }
    });
});

// JOURNAL DES BREAK-TESTS — 30 oct. 2026, dans un banc jetable (copie de js/, index.html, styles.css, design-system.html et tests/), une mutation à la fois :
//   M1  la liste sombre revient à #ca8a04 .................. 2 rouges (c)
//   M2  la pastille sombre revient à #f0c060 ............... 3 rouges (b, c)
//   M3  le fond clair revient à 0,12 ....................... 4 rouges (b, c)
//   M4  le texte clair revient à #906000 ................... 4 rouges (b, c)
//   M5  la liste en clair bouge ............................ 2 rouges (b, c)
//   M6  la liste en dur dans le JS ......................... 4 rouges (b, et les gardes des seuils)
//   M7  l'impression perd le fond clair .................... 1 rouge  (b)
//   M8  le jaune des barres bouge .......................... 2 rouges (b, et la garde de l'orange)
//   M9  le design system oublie le texte clair ............. 1 rouge  (b)
//   M10 la pastille sombre en dur .......................... 1 rouge  (b)
//   M11 la pastille claire en dur .......................... 1 rouge  (b)
//   M12 CIEDE2000 sans la pondération de la clarté ......... 1 rouge  (a)
//   M13 la simulation ne simule rien ....................... 1 rouge  (a)
// Dans la spec WebKit (tests/integration/seuils-une-source.spec.js), mêmes conditions :
//   M14 la variable de la pastille disparaît en sombre ..... 1 rouge
//   M15 la pastille claire sous 4,5:1 à l'écran ............ 1 rouge
//   M16 la liste en dur à l'écran .......................... 1 rouge
