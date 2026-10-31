import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ouvrirCopie } from './harness/banc-copie-annotation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const captures = path.resolve(__dirname, '..', '..', 'plans de travail', 'captures');

// CONSIGNE DU 31 OCT. 2026, PARTIE D — LA PALETTE TAMPONS.
// Ébauche validée par Grégoire : plans de travail/EBAUCHE-2026-10-31-palette-tampons.dc.html.

const assurerPalette = (page) => page.evaluate(() => {
    if (!document.getElementById('travaux-palette-tampons')) window.travauxOutils.togglePaletteAutocollants();
    window.db.setSync('couleursCategories', { observations: '#7b3fb3', comprehension: '#3f7fe6' });
    window.travauxOutils.togglePaletteAutocollants();
    window.travauxOutils.togglePaletteAutocollants();
});
const section = (page, cat) => page.evaluate((cat) => {
    const s = document.querySelector(`#travaux-palette-tampons .tampons-categorie[data-categorie="${cat}"]`);
    if (!s) return null;
    const g = s.querySelector('.travaux-autocollants-grille');
    const compte = s.querySelector('.tampons-categorie-compte');
    return {
        replie: s.classList.contains('replie'),
        grilleVisible: !!g.offsetParent && g.getBoundingClientRect().height > 0,
        compteVisible: getComputedStyle(compte).display !== 'none',
        compte: compte.textContent,
        tuiles: g.children.length,
        expanded: s.querySelector('.tampons-categorie-titre').getAttribute('aria-expanded')
    };
}, cat);
const toucherTitre = (page, cat) => page.evaluate((cat) =>
    document.querySelector(`#travaux-palette-tampons .tampons-categorie[data-categorie="${cat}"] .tampons-categorie-titre`).click(), cat);

test.describe('La palette Tampons', () => {
    test('un bloc de tuiles soudées, trois colonnes à la largeur de la palette', async ({ page }) => {
        await ouvrirCopie(page);
        await assurerPalette(page);
        const m = await page.evaluate(() => {
            const g = document.querySelector('#travaux-palette-tampons .tampons-categorie[data-categorie="observations"] .travaux-autocollants-grille');
            const t = [...g.children];
            const hauts = t.slice(0, 3).map((x) => x.getBoundingClientRect().top);
            const palette = document.getElementById('travaux-palette-tampons');
            return {
                tuiles: t.length, memeRangee: new Set(hauts).size,
                quatriemeDessous: t[3].getBoundingClientRect().top > hauts[0],
                ecart: t[1].getBoundingClientRect().left - t[0].getBoundingClientRect().right,
                rayon: getComputedStyle(g).borderTopLeftRadius,
                largeur: palette.getBoundingClientRect().width,
                ordre: [...t[0].children].map((e) => e.tagName)
            };
        });
        expect(m.tuiles).toBeGreaterThan(3);
        expect(m).toMatchObject({ memeRangee: 1, quatriemeDessous: true, ecart: 1, rayon: '6px', largeur: 200 });
        expect(m.ordre.filter((n) => n === 'IMG')).toHaveLength(1);
    });

    test('la couleur de catégorie est un carré devant le titre, plus un liseré', async ({ page }) => {
        await ouvrirCopie(page);
        await assurerPalette(page);
        const r = await page.evaluate(() => {
            const entete = document.querySelector('#travaux-palette-tampons .tampons-categorie[data-categorie="observations"] .travaux-autocollants-label');
            const carre = entete.querySelector('.tampons-categorie-carre');
            const nom = entete.querySelector('.tampons-categorie-nom');
            return {
                bordure: getComputedStyle(entete).borderLeftWidth,
                couleur: getComputedStyle(carre).backgroundColor,
                avant: carre.getBoundingClientRect().right <= nom.getBoundingClientRect().left
            };
        });
        expect(r).toEqual({ bordure: '0px', couleur: 'rgb(123, 63, 179)', avant: true });
    });

    test('toucher le titre replie : une ligne dit « N tampons », et l’état survit à la palette fermée et rouverte', async ({ page }) => {
        await ouvrirCopie(page);
        await assurerPalette(page);
        const ouverte = await section(page, 'observations');
        expect(ouverte).toMatchObject({ replie: false, grilleVisible: true, compteVisible: false, expanded: 'true' });

        await toucherTitre(page, 'observations');
        const repliee = await section(page, 'observations');
        expect(repliee).toMatchObject({ replie: true, grilleVisible: false, compteVisible: true, expanded: 'false' });
        expect(repliee.compte).toBe(ouverte.tuiles + ' tampons');
        expect(await page.evaluate(() => window.db.getSync('categoriesTamponsRepliees', null))).toEqual(['observations']);

        await page.evaluate(() => { window.travauxOutils.togglePaletteAutocollants(); window.travauxOutils.togglePaletteAutocollants(); });
        expect(await section(page, 'observations')).toMatchObject({ replie: true, grilleVisible: false });
        // Une catégorie par catégorie : sa voisine ne bouge pas.
        expect(await section(page, 'comprehension')).toMatchObject({ replie: false, grilleVisible: true });

        await toucherTitre(page, 'observations');
        expect(await section(page, 'observations')).toMatchObject({ replie: false, grilleVisible: true });
        expect(await page.evaluate(() => window.db.getSync('categoriesTamponsRepliees', null))).toEqual([]);
    });

    test('le « ? » du guide SOLO ne replie pas sa catégorie', async ({ page }) => {
        await ouvrirCopie(page);
        await assurerPalette(page);
        await page.evaluate(() => {
            window.ouvrirGuidePedagogique = () => {};
            document.querySelector('#travaux-palette-tampons .tampons-categorie[data-categorie="comprehension"] .travaux-categorie-guide-btn').click();
        });
        expect((await section(page, 'comprehension')).replie).toBe(false);
    });

    test('captures sur demande (CAPTURES=1), clair et sombre', async ({ page }) => {
        test.skip(!process.env.CAPTURES, 'Captures sur demande.');
        await page.setViewportSize({ width: 1180, height: 1000 });
        await ouvrirCopie(page);
        await assurerPalette(page);
        await page.evaluate(() => { document.getElementById('travaux-palette-tampons').style.height = '560px'; });
        await toucherTitre(page, 'comprehension');
        await page.evaluate(() => document.querySelector('#travaux-palette-tampons .tampons-categorie[data-categorie="observations"] .travaux-autocollant-item').click());
        for (const [nom, clair] of [['clair', true], ['sombre', false]]) {
            await page.evaluate((clair) => document.body.classList.toggle('mode-clair', clair), clair);
            await page.locator('#travaux-palette-tampons').screenshot({ path: path.join(captures, `palette-tampons-${nom}.png`) });
        }
    });
});
