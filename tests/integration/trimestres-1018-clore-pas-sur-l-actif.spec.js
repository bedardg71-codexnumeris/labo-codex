import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1018 (lot 8, décision de Cowork du 11 oct. 2026) — « CLORE » N'EST PLUS OFFERT SUR LE TRIMESTRE ACTIF.
//
// Le menu ⋮ de la bibliothèque des trimestres offrait « Clore » sur le trimestre actif, et
// `archiverTrimestre` (trimestres.js) le refuse toujours : « Impossible de clore le trimestre actif.
// Change de trimestre d'abord. » Un geste qui ne peut que refuser ne s'offre pas. Sans autre action,
// la carte du trimestre actif n'a plus de menu ⋮ (rien de vide à l'écran). Aucun mot neuf.
//
// Témoin : un trimestre disponible (ni actif ni clos) garde « Clore ». Noms fictifs.

const IPAD_PORTRAIT = { width: 820, height: 1180 };

test.describe('#1018 — « Clore » n\'est offert que là où il peut réussir', () => {
    test('la carte du trimestre actif n\'a ni « Clore » ni menu ; un trimestre disponible garde « Clore »', async ({ page }) => {
        page.setDefaultTimeout(15000);
        await page.setViewportSize(IPAD_PORTRAIT);
        await page.goto(indexHtml);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(800);
        await page.evaluate(async () => {
            localStorage.clear();
            if (window.db && db.memoryCache) db.memoryCache.clear();
            await new Promise((res) => {
                const req = indexedDB.deleteDatabase('LaboCodexDB');
                req.onsuccess = req.onerror = req.onblocked = () => res();
                setTimeout(res, 1500);
            });
        });
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1500);
        await page.evaluate(() => {
            db.setSync('trimestres', [
                { id: 'a2032', nom: 'Automne 2032', actif: true },
                { id: 'h2033', nom: 'Hiver 2033' }
            ]);
            db.setSync('trimestreActif', 'a2032');
        });

        await page.evaluate(() => ouvrirBibliothequeTrimestreV2());
        const modale = page.locator('#modalBibliothequeTrimestres');
        await expect(modale).toBeVisible();

        // Témoin : le trimestre disponible garde « Clore » (le banc sait trouver le geste).
        await expect(modale.locator('[data-action="confirmerArchivage"][data-param="h2033"]')).toHaveCount(1);
        await expect(modale.locator('[data-param="biblio-menu-h2033"]')).toHaveCount(1);

        // Le trimestre actif : ni « Clore », ni menu ⋮.
        await expect(modale.locator('[data-action="confirmerArchivage"][data-param="a2032"]')).toHaveCount(0);
        await expect(modale.locator('[data-param="biblio-menu-a2032"]')).toHaveCount(0);
        await expect(modale).toContainText('Trimestre actuellement actif');

        await page.screenshot({ path: test.info().outputPath('bibliotheque-trimestres-1018.png'), fullPage: false });
    });
});
