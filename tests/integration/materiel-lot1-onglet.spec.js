import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL », LOT 1 (consigne du 16 oct. 2026), dans un vrai WebKit.
//
//   · ouvrir Conception affiche le nouvel onglet, EN TÊTE, et sa page d'accueil ;
//   · « Essayer avec un exemple » ouvre la grille fictive (18 oct. 2026 : dans la dissection, l'assistant
//     en sept étapes étant débranché ; avant : l'aperçu de 3 critères, 4 niveaux, 1 passage à classer) ;
//   · « Coller une autre grille » ramène à l'accueil ;
//   · ce que Vitest/jsdom ne prouve pas : un <script> ou un onerror dans le HTML collé ne
//     s'exécutent pas — le DOMParser de WebKit fabrique un document inerte.

test('lot 1 · Conception s’ouvre sur « Apporter mon matériel » ; l’exemple s’affiche tel que lu', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => window.afficherSection('conception'));
    await page.waitForTimeout(200);

    const premier = page.locator('#sous-navigation button').first();
    await expect(premier).toHaveText('Apporter mon matériel');
    await expect(premier).toHaveAttribute('data-sous-onglet', 'conception-materiel');
    await expect(page.locator('#conception-materiel')).toBeVisible();
    await expect(page.locator('#conception-carte')).toBeHidden();
    await expect(page.locator('#materiel-accueil h2')).toHaveText('Apporter mon matériel');
    await expect(page.locator('#materiel-zone-collage')).toBeVisible();

    // La dissection, lot 1 (18 oct.) : l'exemple s'ouvre dans la dissection, sans étiquette.
    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await expect(page.locator('#materiel-accueil')).toBeHidden();
    await expect(page.locator('#materiel-lecture')).toBeHidden();
    await expect(page.locator('#dissection-contenu .dissection-feuille tr')).toHaveCount(8);
    await expect(page.locator('#dissection-titre')).toBeFocused();   // règle SPA

    // iPad : la grille défile dans son canevas, la page non (largeur d'un iPad Air en portrait).
    await page.setViewportSize({ width: 820, height: 1180 });
    const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(debord, 'la page ne défile pas horizontalement').toBeLessThanOrEqual(0);

    await page.locator('#materiel-dissection [data-action="materielDissection.collerAutre"]').click();   // « Coller une autre grille », sans étiquette : un toucher
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(page.locator('#materiel-dissection')).toBeHidden();
});

// ⚠ Relecture de Cowork (16 oct.) : la première version de cet essai ne pouvait pas échouer. La CSP
// bloque un `onerror` inline, et un <script> posé par innerHTML ne s'exécute jamais : un collage
// INJECTÉ dans la page passait quand même. Les deux témoins qui départagent : aucune requête vers
// l'image piégée, aucune image de cette source dans la page après la lecture.
// Break-test : `document.body.insertAdjacentHTML('beforeend', html)` en tête de lireHtml → rouge.
const SOURCE_PIEGE = 'http://127.0.0.1:9/piege-materiel-lot1.png';

test('lot 1 · un collage piégé n’entre pas dans la page : rien ne s’exécute, rien ne se charge', async ({ page }) => {
    const requetes = [];
    page.on('request', (r) => { if (r.url().includes('piege-materiel-lot1')) requetes.push(r.url()); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    const r = await page.evaluate(async (source) => {
        window.__pirate = 0;
        const lu = window.materielLecture.lireHtml(
            '<script>window.__pirate = 1;</script>' +
            '<table><tr><td>C</td><td>A</td><td>B<img src="' + source + '" onerror="window.__pirate = 2"></td></tr>' +
            '<tr><td>X</td><td>1</td><td>2</td></tr></table>');
        await new Promise((ok) => setTimeout(ok, 500));   // le temps qu'une image aurait de partir
        return {
            pirate: window.__pirate,
            json: JSON.stringify(lu),
            imagesPiegees: document.querySelectorAll('img[src*="piege-materiel-lot1"]').length
        };
    }, SOURCE_PIEGE);
    expect(r.imagesPiegees, 'aucune image du collage dans la page').toBe(0);
    expect(requetes, 'aucune requête vers l’image piégée').toEqual([]);
    expect(r.pirate).toBe(0);
    expect(r.json).not.toContain('__pirate');
    expect(r.json).not.toContain('piege-materiel');
});
