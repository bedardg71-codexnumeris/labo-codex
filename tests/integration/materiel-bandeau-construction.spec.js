import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL » — le bandeau « En construction » (demande de Grégoire, 17 oct. 2026),
// dans un vrai WebKit : visible à TOUS les écrans de l'onglet, pas seulement à l'accueil, que
// materiel.js masque dès qu'un collage s'ouvre. Il reste jusqu'à ce que Grégoire décide de le retirer.
// 18 oct. 2026 (la dissection, lot 1) : l'assistant en sept étapes est débranché (retiré le 19) ; les écrans
// sont l'accueil et la dissection, étiquette en main ou non.

async function ouvrirConception(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    // Un témoin, pas un délai : le dernier drapeau des migrations de démarrage (main.js, auDbReady)
    // et la zone de collage qui écoute « coller » (materiel.js, au DOMContentLoaded).
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

test('bandeau « En construction » : visible à l’accueil et dans la dissection, étiquette en main ou non', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    const bandeau = page.locator('#materiel-en-construction');
    const visible = async (ou) => expect(bandeau, ou).toBeVisible();

    await visible('accueil');
    await expect(bandeau).toContainText('Cet outil est en développement');
    await expect(bandeau.locator('span[aria-hidden="true"]')).toHaveText('🚧');

    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await expect(page.locator('#materiel-accueil')).toBeHidden();
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await visible('dissection');
    await page.locator('#dissection-palette [data-param="critere"]').click();
    await expect(page.locator('#dissection-terminer')).toBeVisible();
    await visible('dissection, étiquette en main');

    // Le bandeau est au-dessus de ce que l'onglet montre, pas glissé dessous.
    const ordre = await page.evaluate(() => {
        const b = document.getElementById('materiel-en-construction');
        return !!(b.compareDocumentPosition(document.getElementById('materiel-dissection')) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(ordre).toBe(true);
    expect(erreurs).toEqual([]);
});
