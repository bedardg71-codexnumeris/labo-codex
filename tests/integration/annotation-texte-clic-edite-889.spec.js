import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// PORTE #889 — AVEC L'OUTIL TEXTE, CLIQUER SUR UN TEXTE EXISTANT L'OUVRE EN ÉDITION.
//
// Rapport de bug de Grégoire, 16 septembre 2026, 13 h 10 (1.142.13, Chrome, Mac) : « Je veux modifier
// un bloc de texte, mais quand je clique sur le texte, ça crée un nouveau bloc. » Capture : une zone
// vide « Texte… » posée par-dessus le bloc « Envoie ta photo… ».
//
// CE QUI SE PASSAIT. Sous l'outil Texte, `onPointerDown` appelait `ajouterTexte` sans regarder ce qu'il
// y avait sous le clic. Seul le double-clic de l'outil Sélection menait à `editerTexte`.
//
// LE BANC. `js/travaux-annotation.js` seul, dans une page nue, avec des doublures minimales de
// travauxOutils / travauxVisionneuse / travauxStockage — le moteur d'annotation complet exige une copie
// importée (Blob en IndexedDB, que WebKit refuse au banc). Mesuré le 16 sept. : ROUGE sur le fichier
// de 1.142.13 (zone vide « Texte… »), VERT après.

const SOURCE = readFileSync(path.join(racineProjet, 'js', 'travaux-annotation.js'), 'utf8');

async function monter(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setContent('<div id="travaux-conteneur-document" style="position:relative;width:800px;height:1000px">'
        + '<canvas id="travaux-canvas-annotation" width="800" height="1000" style="position:absolute;left:0;top:0"></canvas></div>');
    await page.evaluate(() => {
        const canvas = document.getElementById('travaux-canvas-annotation');
        const annotation = { id: 'A1', pages: { 0: { strokes: [], shapes: [], stickers: [], textAnnotations: [
            { id: 'TXT_1', x: 0.1, y: 0.1, text: 'Envoie ta photo', fontSize: 20, color: '#ff0000', width: 0.3 }
        ] } } };
        window.travauxOutils = {
            getOutilActif: () => ({ id: 'texte' }), getAutocollantActif: () => null,
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

// Un clic de souris, en coordonnées du canvas (le texte existant est en x 80 px, y 100 px).
const cliquer = (page, x, y) => page.evaluate(([x, y]) => {
    const c = document.getElementById('travaux-canvas-annotation');
    const r = c.getBoundingClientRect();
    c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse', button: 0, clientX: r.left + x, clientY: r.top + y }));
}, [x, y]);

const zone = (page) => page.evaluate(() => {
    const t = document.getElementById('travaux-texte-inline');
    return t ? { valeur: t.value, placeholder: t.placeholder } : null;
});

test.describe('#889 · outil Texte : cliquer sur un texte le modifie', () => {
    test('un clic sur le texte existant l\'ouvre en édition, sans créer de 2e bloc', async ({ page }) => {
        const erreurs = await monter(page);
        await cliquer(page, 95, 108);
        expect(await zone(page)).toEqual({ valeur: 'Envoie ta photo', placeholder: '' });

        // Échap rend le texte d'origine ; il n'y a toujours qu'un bloc.
        await page.evaluate(() => document.getElementById('travaux-texte-inline')
            .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
        const textes = await page.evaluate(() => __annotation.pages[0].textAnnotations.map(a => a.text));
        expect(textes).toEqual(['Envoie ta photo']);
        expect(erreurs).toEqual([]);
    });

    test('témoin : un clic dans le vide crée toujours un nouveau bloc', async ({ page }) => {
        const erreurs = await monter(page);
        await cliquer(page, 500, 700);
        expect(await zone(page)).toEqual({ valeur: '', placeholder: 'Texte…' });
        expect(erreurs).toEqual([]);
    });
});
