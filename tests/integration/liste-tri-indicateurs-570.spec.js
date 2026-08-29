import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #570 — trier la Liste des évaluations change la flèche DE LA LISTE (pas celle du
// tableau des étudiants, qui portait les mêmes ids), et la flèche est de la couleur
// de son en-tête dans les deux modes (plus de gris de fond clair à 1,96:1).

async function ouvrir(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
}

test('trier par DA change la flèche de la Liste, et seulement elle', async ({ page }) => {
    await ouvrir(page);
    const avantEtudiants = await page.locator('#tri-da').textContent();
    await page.evaluate(() => window.trierTableauParColonne('da'));
    await expect(page.locator('#tri-eval-da')).toHaveText('↑');
    await page.evaluate(() => window.trierTableauParColonne('da'));
    await expect(page.locator('#tri-eval-da')).toHaveText('↓');
    // Le tableau des étudiants n'a pas bougé.
    expect(await page.locator('#tri-da').textContent()).toBe(avantEtudiants);
    // Une autre colonne de la Liste retombe au repos.
    await page.evaluate(() => window.trierTableauParColonne('nom'));
    await expect(page.locator('#tri-eval-da')).toHaveText('↕');
    await expect(page.locator('#tri-eval-nom')).toHaveText('↑');
});

for (const mode of ['sombre', 'clair']) {
    test(`la flèche a la couleur de son en-tête — mode ${mode}`, async ({ page }) => {
        await ouvrir(page);
        await page.evaluate((m) => { document.body.classList.toggle('mode-clair', m === 'clair'); }, mode);
        const couleurs = await page.evaluate(() => {
            const span = document.getElementById('tri-eval-da');
            const th = span.closest('th');
            return { fleche: getComputedStyle(span).color, entete: getComputedStyle(th).color };
        });
        expect(couleurs.fleche).toBe(couleurs.entete);
    });
}
