/**
 * SENTINELLE — L'ORANGE BRÛLÉ DE LA ZONE SOUS LE SEUIL (décisions de Grégoire du 30 oct. 2026, 22 h 29 et 22 h 30).
 *
 *   « retirer le rouge actuel, trop associé au danger […] un orange brûlé, comme dans les barres originales »
 *   « oui, partout. Attention au mode sombre. »
 *
 *   · Barres, liste, pastilles, paliers et Mobilisation lisent l'orange brûlé quand la couleur marque la zone `bas`.
 *   · Le texte et les pastilles tiennent 4,5:1 dans chaque mode, les barres 3:1 : mesuré ici, sur les surfaces de styles.css
 *     (tests/integration/seuils-une-source.spec.js le mesure aussi à l'écran, sur les fonds empilés).
 *   · Les badges du niveau RàI ne changent pas (décision de Grégoire).
 *
 *   cd tests && npx vitest run unit/sentinelle-orange-brule-2026-10-30.test.js
 *
 * Break-tests : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

const lire = (fichier) => readFileSync(path.join(RACINE, fichier), 'utf8');
const CSS = lire('styles.css');

function banc() {
    return monter(storeBase(), { modules: ['js/contexte-qualification.js'] }).win;
}

/** Les variables d'un bloc CSS, lues dans la feuille de style. */
function variables(debut) {
    const bloc = tranche(CSS, debut, '\n}');
    return Object.fromEntries([...bloc.matchAll(/(--[a-z-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}
const SOMBRE = variables(':root {');
const CLAIR = variables('.mode-clair {');

const canaux = (couleur) => (couleur.startsWith('#')
    ? [1, 3, 5].map((d) => parseInt(couleur.slice(d, d + 2), 16))
    : couleur.match(/[\d.]+/g).map(Number));
const superpose = (dessus, dessous) => {
    const [r, g, b, a] = canaux(dessus);
    return [r, g, b].map((c, k) => c * a + canaux(dessous)[k] * (1 - a));
};
const lineaire = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminance = (rgb) => { const [r, g, b] = rgb.map(lineaire); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contraste = (a, b) => {
    const [haut, bas] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (haut + 0.05) / (bas + 0.05);
};

describe('(a) la zone basse lit l’orange brûlé, partout où la couleur la marque', () => {
    const win = banc();

    it('les barres de A, de C et de P', () => {
        for (const indice of ['A', 'C', 'P']) expect(win.zonesDeLaBarre(indice)[0]).toMatchObject({ zone: 'bas', couleur: '#CC5500' });
    });

    it('la liste, et ce que rendent les paliers et la Mobilisation', () => {
        expect(win.obtenirCouleurSelonSeuils(50)).toBe('var(--zone-bas-texte)');
        expect(win.obtenirCouleurPerformanceSelonEchelle(10)).toBe('var(--zone-bas-texte)');
        expect(win.interpreterAssiduite(50).couleur).toBe('var(--zone-bas-texte)');
        expect(win.interpreterCompletion(50).couleur).toBe('var(--zone-bas-texte)');
        expect(win.interpreterMobilisation(0.5, 0.5).couleur).toBe('#CC5500');
    });

    it('les pastilles, dans les deux modes', () => {
        expect(CSS).toMatch(/\n\.prioritaire-indice-critique \{\s*background: var\(--zone-bas-pastille-fond\);\s*color: var\(--zone-bas-pastille-texte\);/);
        expect(CSS).toMatch(/\.mode-clair \.prioritaire-indice-critique \{\s*background: var\(--zone-bas-pastille-fond\);\s*color: var\(--zone-bas-pastille-texte\);/);
    });

    it('il ne reste aucun rouge dans ce qui dessine une zone', () => {
        const zones = tranche(lire('js/contexte-qualification.js'), 'const CLASSE_PASTILLE', 'function classePastilleDeLaZone');
        expect(zones).not.toMatch(/#dc2626|#dc3545/i);
        expect(lire('js/contexte-qualification.js')).not.toMatch(/COULEURS_PALIERS = \[[^\]]*#dc3545/);
    });

    it('l’aide du réglage dit la couleur à l’écran', () => {
        const bulle = lire('js/accompagnement-contenu-hover.js');
        expect(bulle).toContain('un chiffre sous ce seuil est orange brûlé.');
        expect(bulle).not.toContain('un chiffre sous ce seuil est rouge');
    });

    it('la source de vérité des couleurs le dit', () => {
        const ds = lire('design-system.html');
        for (const valeur of ['#CC5500', SOMBRE['--zone-bas-texte'], SOMBRE['--zone-bas-pastille-texte'], SOMBRE['--zone-bas-pastille-fond'], CLAIR['--zone-bas-texte'], CLAIR['--zone-bas-pastille-texte'], CLAIR['--zone-bas-pastille-fond']]) {
            expect(ds).toContain(valeur);
        }
    });
});

describe('(b) le contraste se mesure dans chaque mode', () => {
    const surfaces = (mode) => ['--surface-section', '--surface-carte'].map((v) => mode[v]);

    it('le texte de la liste et du profil : 4,5:1 sur les surfaces du mode', () => {
        for (const mode of [SOMBRE, CLAIR]) {
            for (const fond of surfaces(mode)) {
                expect(contraste(canaux(mode['--zone-bas-texte']), canaux(fond)), fond).toBeGreaterThanOrEqual(4.5);
            }
        }
    });

    it('le texte de la pastille sur son fond, posé sur les surfaces du mode : 4,5:1', () => {
        for (const mode of [SOMBRE, CLAIR]) {
            for (const fond of surfaces(mode)) {
                const fondPastille = superpose(mode['--zone-bas-pastille-fond'], fond);
                expect(contraste(canaux(mode['--zone-bas-pastille-texte']), fondPastille), fond).toBeGreaterThanOrEqual(4.5);
            }
        }
    });

    // Sans le voile, gardé sur décision de Grégoire : il assombrit la couleur à l'écran (mesuré au rapport du lot).
    it('les barres : 3:1 sur les surfaces des deux modes, et le point blanc d’un·e élève reste lisible', () => {
        for (const mode of [SOMBRE, CLAIR]) {
            for (const fond of surfaces(mode)) expect(contraste(canaux('#CC5500'), canaux(fond)), fond).toBeGreaterThanOrEqual(3);
        }
        expect(contraste(canaux('#CC5500'), [255, 255, 255])).toBeGreaterThanOrEqual(3);
    });

    it('à l’impression, le texte prend les valeurs du mode clair', () => {
        const racine = tranche(CSS, '@media print {\n    :root {', '\n    }');
        expect(racine).toContain(`--zone-bas-texte: ${CLAIR['--zone-bas-texte']};`);
        expect(racine).toContain(`--zone-bas-pastille-texte: ${CLAIR['--zone-bas-pastille-texte']};`);
        expect(racine).toContain(`--zone-bas-pastille-fond: ${CLAIR['--zone-bas-pastille-fond']};`);
    });
});

describe('(c) ce qui ne change pas', () => {
    it('les badges du niveau RàI ne lisent pas la zone basse', () => {
        for (const m of CSS.matchAll(/[^\n]*badge-rai-3[^{]*\{[^}]*\}/g)) expect(m[0]).not.toContain('--zone-bas');
    });

    it('le jaune des barres ne bouge pas : la décision du jaune (sentinelle-jaune-signale-2026-10-30.test.js) ne touche que le texte et les pastilles', () => {
        expect(banc().zonesDeLaBarre('A')[1].couleur).toBe('#ffc107');
    });
});

// JOURNAL DES BREAK-TESTS — 30 oct. 2026, dans un banc jetable (copie de js/, index.html, styles.css, design-system.html et tests/), une mutation à la fois :
//   M1  les barres repassent au rouge ...................... 5 rouges
//   M2  la liste repasse au rouge .......................... 5 rouges
//   M3  les paliers repassent au rouge ..................... 2 rouges
//   M4  la Mobilisation repasse au rouge ................... 2 rouges
//   M5  le texte sombre en #CC5500 ......................... 1 rouge  (b)
//   M6  le texte clair en #CC5500 .......................... 2 rouges (b)
//   M7  la pastille sombre en #CC5500 ...................... 1 rouge  (b)
//   M8  la pastille claire garde le rouge .................. 1 rouge  (a)
//   M9  l'impression perd le texte clair ................... 1 rouge  (b)
//   M10 la pastille sombre garde le rouge .................. 1 rouge  (a)
//   M16 l'aide dit encore rouge ............................ 1 rouge  (a)
//   M17 le design system oublie le texte clair ............. 1 rouge  (a)
//   M18 les badges RàI lisent la zone basse ................ 1 rouge  (c)
//   M19 le jaune change sans décision ...................... 4 rouges (c, et les gardes des seuils)
// Dans la spec WebKit (tests/integration/seuils-une-source.spec.js), mêmes conditions :
//   M20 la variable de la pastille disparaît en sombre ..... 1 rouge
//   M21 la pastille claire sous 4,5:1 à l'écran ............ 1 rouge  (les surfaces seules ne la voient pas : d'où la spec)
//   M22 la liste en dur à l'écran .......................... 1 rouge
// M11 à M15 (le passage à la cassure) : journal de sentinelle-barres-apercu-2026-10-30.test.js.
