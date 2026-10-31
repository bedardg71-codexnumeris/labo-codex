import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// PORTE #1210 — LE BLOC DE TEXTE SE MODIFIE SANS PERDRE SON TEXTE.
//
// Rapport de Grégoire, 31 oct. 2026, 10 h 09 (iPad, deux captures) : toucher un long bloc avec l'outil Texte
// ouvre une zone plus petite, et il ne peut plus atteindre la fin du texte. Il dicte ses commentaires :
// pouvoir corriger est essentiel. Trois causes, lues dans `editerTexte` : hauteur de deux lignes en
// `overflow: hidden`, `max-width: 400px`, et `select()` : une lettre dictée remplaçait tout le bloc.
//
// LE BANC : celui de #889, le module seul dans une page nue.

const SOURCE = readFileSync(path.join(racineProjet, 'js', 'travaux-annotation.js'), 'utf8');
const DIX_LIGNES = Array.from({ length: 10 }, (_, i) => 'Ligne numéro ' + (i + 1) + ' du commentaire dicté').join('\n');

async function monter(page, texte = { id: 'TXT_1', x: 0.1, y: 0.1, text: DIX_LIGNES, fontSize: 20, color: '#ff0000', width: 0.6 }) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setContent('<div id="travaux-conteneur-document" style="position:relative;width:800px;height:1000px">'
        + '<canvas id="travaux-canvas-annotation" width="800" height="1000" style="position:absolute;left:0;top:0"></canvas></div>');
    await page.evaluate((texte) => {
        const canvas = document.getElementById('travaux-canvas-annotation');
        const annotation = { id: 'A1', pages: { 0: { strokes: [], shapes: [], stickers: [], textAnnotations: texte ? [texte] : [] } } };
        window.travauxOutils = {
            getOutilActif: () => ({ id: 'texte' }), getAutocollantActif: () => null,
            getTailleTexte: () => 20, getCouleurActive: () => '#ff0000', getEpaisseurActive: () => 2,
            getFlechePointes: () => 'aucune', RESOLUTION_REFERENCE: 1000,
            genererHTMLPalette: () => '<div id="travaux-palette-flottante"></div>', configurerDragPalette() {}
        };
        window.travauxVisionneuse = { getFichierActuel: () => ({ id: 'F1' }), getCanvas: () => canvas, getPageActuelle: () => 1 };
        window.travauxStockage = { obtenirAnnotationFichier: () => annotation, sauvegarderAnnotation() {} };
        window.__annotation = annotation;
    }, texte);
    await page.addScriptTag({ content: SOURCE });
    await page.evaluate(() => {
        const conteneur = document.getElementById('travaux-conteneur-document');
        travauxAnnotation.setContext({ canvasAnnotation: document.getElementById('travaux-canvas-annotation'), conteneurPalette: conteneur });
        travauxAnnotation.activerAnnotation();
    });
    return erreurs;
}

const cliquer = (page, x, y) => page.evaluate(([x, y]) => {
    const c = document.getElementById('travaux-canvas-annotation');
    const r = c.getBoundingClientRect();
    c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse', button: 0, clientX: r.left + x, clientY: r.top + y }));
}, [x, y]);

const zone = (page) => page.evaluate(() => {
    const t = document.getElementById('travaux-texte-inline');
    return t && {
        valeur: t.value, largeur: t.offsetWidth, hauteur: t.offsetHeight, clientH: t.clientHeight, scrollH: t.scrollHeight,
        debut: t.selectionStart, fin: t.selectionEnd
    };
});
const blocs = (page) => page.evaluate(() => __annotation.pages[0].textAnnotations.map((a) => ({ text: a.text, width: a.width })));
const attendrePret = (page) => page.evaluate(() => new Promise((r) => setTimeout(r, 150)));
const cliquerDehors = (page) => page.evaluate(() =>
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse', button: 0, clientX: 790, clientY: 990 })));

test.describe('#1210 · la zone du bloc de texte', () => {
    test('un bloc de dix lignes : la zone couvre tout le texte, sans rien cacher', async ({ page }) => {
        const erreurs = await monter(page);
        await cliquer(page, 95, 108);
        const z = await zone(page);
        expect(z.valeur).toBe(DIX_LIGNES);
        expect(z.hauteur).toBeGreaterThan(20 * 1.3 * 0.8 * 10); // témoin : bien plus que les deux lignes d'avant
        expect(z.scrollH).toBeLessThanOrEqual(z.clientH);
        expect(erreurs).toEqual([]);
    });

    test('la zone s’ouvre à la largeur enregistrée, sans plafond ; un aller-retour ne rétrécit pas le bloc', async ({ page }) => {
        await monter(page);
        await cliquer(page, 95, 108);
        expect((await zone(page)).largeur).toBe(480); // 0,6 × 800 : au-delà de l'ancien plafond de 400
        await attendrePret(page);
        await cliquerDehors(page);
        expect(await blocs(page)).toEqual([{ text: DIX_LIGNES, width: 0.6 }]);
    });

    test('rien n’est sélectionné : le curseur est à la fin, et une lettre tapée ne remplace pas le bloc', async ({ page }) => {
        await monter(page);
        await cliquer(page, 95, 108);
        const z = await zone(page);
        expect(z.debut).toBe(DIX_LIGNES.length);
        expect(z.fin).toBe(DIX_LIGNES.length);
        await page.keyboard.type('x');
        expect((await zone(page)).valeur).toBe(DIX_LIGNES + 'x');
    });

    test('la zone grandit en hauteur pendant la saisie', async ({ page }) => {
        await monter(page);
        await cliquer(page, 95, 108);
        const avant = (await zone(page)).hauteur;
        for (let i = 0; i < 4; i++) await page.keyboard.press('Shift+Enter');
        const apres = await zone(page);
        expect(apres.hauteur).toBeGreaterThan(avant);
        expect(apres.scrollH).toBeLessThanOrEqual(apres.clientH);
    });

    test('un bloc d’avant sans largeur enregistrée reste sans largeur ; la zone couvre sa plus longue ligne', async ({ page }) => {
        const longue = 'Une très longue ligne de commentaire dicté, écrite avant que les blocs aient une largeur enregistrée.';
        await monter(page, { id: 'TXT_2', x: 0.1, y: 0.1, text: longue, fontSize: 20, color: '#ff0000' });
        await cliquer(page, 95, 108);
        const z = await zone(page);
        expect(z.scrollH).toBeLessThanOrEqual(z.clientH);
        await page.keyboard.type('x');
        await attendrePret(page);
        await cliquerDehors(page);
        const [b] = await page.evaluate(() => __annotation.pages[0].textAnnotations);
        expect(b.text).toBe(longue + 'x');
        expect(b.width).toBeUndefined();
    });

    test('à la création aussi : pas de plafond de largeur, et la zone grandit à la saisie', async ({ page }) => {
        await monter(page, null);
        await cliquer(page, 100, 100);
        const debut = await zone(page);
        expect(debut.valeur).toBe('');
        expect(await page.evaluate(() => document.getElementById('travaux-texte-inline').style.maxWidth)).toBe('');
        for (let i = 0; i < 5; i++) await page.keyboard.press('Shift+Enter');
        const apres = await zone(page);
        expect(apres.hauteur).toBeGreaterThan(debut.hauteur);
        expect(apres.scrollH).toBeLessThanOrEqual(apres.clientH);
    });

    test('créer un bloc avec Entrée, puis cliquer ailleurs : un seul bloc', async ({ page }) => {
        await monter(page, null);
        await cliquer(page, 100, 100);
        await page.keyboard.type('Un commentaire');
        await attendrePret(page);
        await page.keyboard.press('Enter');
        await cliquerDehors(page);
        expect((await blocs(page)).map((b) => b.text)).toEqual(['Un commentaire']);
    });
});
