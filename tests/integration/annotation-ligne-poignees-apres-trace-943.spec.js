import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #943 — UNE LIGNE QU'ON VIENT DE TRACER SE COURBE SANS CHANGER D'OUTIL.
//
// Retour de Grégoire, 24 septembre 2026, 10 h 18 (1.156.3, Chrome, Mac) : « Je voudrais que lorsque
// j'utilise une ligne (fléchée ou non), les sélecteurs de cet objet soient actifs aussitôt qu'elle est
// tracée, de manière à ce que je puisse la courber sans avoir à la sélectionner en changeant d'outil
// dans la palette. »
//
// CE QUI SE PASSAIT. Les poignées d'une ligne (extrémités, point de courbure) n'étaient lues que sous
// l'outil Sélection ; sous l'outil Ligne, tout clic commençait une nouvelle ligne.
//
// LE BANC. Même montage que #889 : `js/travaux-annotation.js` seul, dans une page nue, doublures
// minimales de travauxOutils / travauxVisionneuse / travauxStockage. Canvas de 800 × 1000 px.

const SOURCE = readFileSync(path.join(racineProjet, 'js', 'travaux-annotation.js'), 'utf8');

async function monter(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setContent('<div id="travaux-conteneur-document" style="position:relative;width:800px;height:1000px">'
        + '<canvas id="travaux-canvas-annotation" width="800" height="1000" style="position:absolute;left:0;top:0"></canvas></div>');
    await page.evaluate(() => {
        const canvas = document.getElementById('travaux-canvas-annotation');
        const annotation = { id: 'A1', pages: { 0: { strokes: [], shapes: [], stickers: [], textAnnotations: [] } } };
        window.__outil = { id: 'fleche', type: 'forme' };
        window.travauxOutils = {
            getOutilActif: () => window.__outil, getAutocollantActif: () => null,
            getTailleTexte: () => 20, getCouleurActive: () => '#ff0000', getEpaisseurActive: () => 2,
            getFlechePointes: () => 'fin', RESOLUTION_REFERENCE: 1000,
            genererHTMLPalette: () => '<div id="travaux-palette-flottante"></div>', configurerDragPalette() {}
        };
        window.travauxVisionneuse = { getFichierActuel: () => ({ id: 'F1' }), getCanvas: () => canvas, getPageActuelle: () => 1 };
        window.travauxStockage = { obtenirAnnotationFichier: () => annotation, sauvegarderAnnotation() {} };
        window.__annotation = annotation;
    });
    await page.addScriptTag({ content: SOURCE });
    await page.evaluate(() => {
        const conteneur = document.getElementById('travaux-conteneur-document');
        travauxAnnotation.setContext({ canvasAnnotation: document.getElementById('travaux-canvas-annotation'), conteneurPalette: conteneur });
        travauxAnnotation.activerAnnotation();
    });
    return erreurs;
}

// Un geste de souris complet (appui, glisser, relâcher), en pixels du canvas.
const glisser = (page, [x1, y1], [x2, y2]) => page.evaluate(([x1, y1, x2, y2]) => {
    const c = document.getElementById('travaux-canvas-annotation');
    const r = c.getBoundingClientRect();
    const ev = (type, x, y) => c.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerType: 'mouse', button: 0,
        clientX: r.left + x, clientY: r.top + y }));
    ev('pointerdown', x1, y1);
    ev('pointermove', (x1 + x2) / 2, (y1 + y2) / 2);
    ev('pointermove', x2, y2);
    ev('pointerup', x2, y2);
}, [x1, y1, x2, y2]);

const formes = (page) => page.evaluate(() => __annotation.pages[0].shapes.map(f => ({
    type: f.type, color: f.color, x1: f.x1, y1: f.y1, x2: f.x2, y2: f.y2,
    cx: f.cx == null ? null : Math.round(f.cx * 1000) / 1000, cy: f.cy == null ? null : Math.round(f.cy * 1000) / 1000 })));

test.describe('#943 · outil Ligne : la ligne tracée se courbe aussitôt, sans l\'outil Sélection', () => {
    test('tracer, puis tirer le point de courbure, puis une extrémité : une seule ligne, courbée et allongée', async ({ page }) => {
        const erreurs = await monter(page);
        await glisser(page, [100, 100], [500, 100]);                  // la ligne : (0,125 ; 0,1) → (0,625 ; 0,1)
        expect(await formes(page)).toHaveLength(1);

        await glisser(page, [300, 100], [300, 300]);                   // son milieu = le point de courbure
        let f = await formes(page);
        expect(f, 'aucune 2e ligne : le geste a courbé la première').toHaveLength(1);
        expect([f[0].cx, f[0].cy]).toEqual([0.375, 0.3]);

        await glisser(page, [500, 100], [600, 150]);                   // l'extrémité (pointe)
        f = await formes(page);
        expect(f).toHaveLength(1);
        expect([f[0].x2, f[0].y2]).toEqual([0.75, 0.15]);
        expect([f[0].x1, f[0].y1], 'l\'autre extrémité ne bouge pas').toEqual([0.125, 0.1]);
        expect(erreurs).toEqual([]);
    });

    test('ailleurs qu\'une poignée, l\'outil Ligne trace une nouvelle ligne ; la première reste telle quelle', async ({ page }) => {
        const erreurs = await monter(page);
        await glisser(page, [100, 100], [500, 100]);
        await glisser(page, [100, 600], [500, 700]);
        const f = await formes(page);
        expect(f).toHaveLength(2);
        expect(f[0]).toMatchObject({ x1: 0.125, y1: 0.1, x2: 0.625, y2: 0.1, cx: null, cy: null });
        // Et c'est la NOUVELLE qui a maintenant ses poignées : son milieu (300, 650) la courbe.
        await glisser(page, [300, 650], [300, 800]);
        const g = await formes(page);
        expect(g).toHaveLength(2);
        expect([g[1].cx, g[1].cy]).toEqual([0.375, 0.8]);
        expect(erreurs).toEqual([]);
    });

    test('la couleur choisie après un tracé vise la PROCHAINE ligne, pas celle qu\'on vient de tracer', async ({ page }) => {
        const erreurs = await monter(page);
        await glisser(page, [100, 100], [500, 100]);
        await page.evaluate(() => window.dispatchEvent(new CustomEvent('travaux-couleur-change', { detail: { couleur: '#0000ff' } })));
        const f = await formes(page);
        expect(f[0].color).toBe('#ff0000');
        // …et la sélection est tombée : le milieu ne courbe plus, il trace une nouvelle ligne.
        await glisser(page, [300, 100], [300, 300]);
        expect(await formes(page)).toHaveLength(2);
        expect(erreurs).toEqual([]);
    });

    test('changer d\'outil retire les poignées ; vers l\'outil Sélection, la ligne reste sélectionnée', async ({ page }) => {
        const erreurs = await monter(page);
        await glisser(page, [100, 100], [500, 100]);
        await page.evaluate(() => {
            window.__outil = { id: 'crayon', type: 'dessin' };
            window.dispatchEvent(new CustomEvent('travaux-outil-change', { detail: { outil: window.__outil } }));
            window.__outil = { id: 'fleche', type: 'forme' };
            window.dispatchEvent(new CustomEvent('travaux-outil-change', { detail: { outil: window.__outil } }));
        });
        await glisser(page, [300, 100], [300, 300]);
        expect(await formes(page), 'après un autre outil, le milieu trace une nouvelle ligne').toHaveLength(2);

        // Vers l'outil Sélection : la ligne tracée y arrive sélectionnée, sa courbure se tire.
        await glisser(page, [100, 600], [500, 600]);
        await page.evaluate(() => {
            window.__outil = { id: 'selection', type: 'selection' };
            window.dispatchEvent(new CustomEvent('travaux-outil-change', { detail: { outil: window.__outil } }));
        });
        await glisser(page, [300, 600], [300, 700]);
        const f = await formes(page);
        expect(f).toHaveLength(3);
        expect([f[2].cx, f[2].cy]).toEqual([0.375, 0.7]);
        expect(erreurs).toEqual([]);
    });

    test('témoin : un rectangle tracé n\'est pas sélectionné (seules les lignes ont des poignées de courbure)', async ({ page }) => {
        const erreurs = await monter(page);
        await page.evaluate(() => { window.__outil = { id: 'rectangle', type: 'forme' }; });
        await glisser(page, [100, 100], [300, 300]);
        await glisser(page, [300, 300], [400, 400]);                  // un coin : sans sélection, c'est un 2e rectangle
        expect(await formes(page)).toHaveLength(2);
        expect(erreurs).toEqual([]);
    });
});
