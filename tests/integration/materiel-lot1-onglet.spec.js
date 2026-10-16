import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL », LOT 1 (consigne du 16 oct. 2026), dans un vrai WebKit.
//
//   · ouvrir Conception affiche le nouvel onglet, EN TÊTE, et sa page d'accueil ;
//   · « Essayer avec un exemple » : l'aperçu montre 3 critères, 4 niveaux, 1 passage à classer ;
//   · « Recommencer » ramène à l'accueil ;
//   · ce que Vitest/jsdom ne prouve pas : un <script> ou un onerror dans le HTML collé ne
//     s'exécutent pas — le DOMParser de WebKit fabrique un document inerte.

test('lot 1 · Conception s’ouvre sur « Apporter mon matériel » ; l’exemple s’affiche tel que lu', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    await page.evaluate(() => window.afficherSection('conception'));
    await page.waitForTimeout(200);

    const premier = page.locator('#sous-navigation button').first();
    await expect(premier).toHaveText('Apporter mon matériel');
    await expect(premier).toHaveAttribute('data-sous-onglet', 'conception-materiel');
    await expect(page.locator('#conception-materiel')).toBeVisible();
    await expect(page.locator('#conception-carte')).toBeHidden();
    await expect(page.locator('#materiel-accueil h2')).toHaveText('Apporter mon matériel');
    await expect(page.locator('#materiel-zone-collage')).toBeVisible();

    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await expect(page.locator('#materiel-lecture')).toBeVisible();
    await expect(page.locator('#materiel-accueil')).toBeHidden();
    await expect(page.locator('#materiel-lecture tbody tr')).toHaveCount(3);
    await expect(page.locator('#materiel-lecture thead th.materiel-col-niveau')).toHaveCount(4);
    await expect(page.locator('#materiel-lecture .materiel-a-classer li')).toHaveCount(1);
    await expect(page.locator('#materiel-titre-apercu')).toBeFocused();   // règle SPA

    // iPad : le tableau défile dans son cadre, la page non (largeur d'un iPad Air en portrait).
    await page.setViewportSize({ width: 820, height: 1180 });
    const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(debord, 'la page ne défile pas horizontalement').toBeLessThanOrEqual(0);

    await page.locator('[data-action="materiel.recommencer"]').click();
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(page.locator('#materiel-lecture')).toBeHidden();
});

test('lot 1 · un script collé ne s’exécute pas : le DOMParser de WebKit est inerte', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    const r = await page.evaluate(async () => {
        window.__pirate = 0;
        const lu = window.materielLecture.lireHtml(
            '<script>window.__pirate = 1;</script>' +
            '<table><tr><td>C</td><td>A</td><td>B<img src="x" onerror="window.__pirate = 2"></td></tr>' +
            '<tr><td>X</td><td>1</td><td>2</td></tr></table>');
        await new Promise((ok) => setTimeout(ok, 300));   // le temps qu'un onerror aurait de partir
        return { pirate: window.__pirate, json: JSON.stringify(lu) };
    });
    expect(r.pirate).toBe(0);
    expect(r.json).not.toContain('__pirate');
});
