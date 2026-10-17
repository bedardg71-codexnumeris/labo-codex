import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { f6Html } from '../unit/_helpers/grilles-fictives-5b.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// RELECTURE DE COWORK DU 17 OCT. 2026 (C3), dans un vrai WebKit : l'icône « i » du type de critère, dans
// Grilles de critères, désigne une clé du catalogue (`grille-type-critere-detail`) sans élément de ce
// nom ; elle n'ouvrait rien. Elle ouvre maintenant l'aide « Type de critère d'évaluation ».
// Chemin : la grille fictive F6 collée et créée par « Apporter mon matériel », puis « La voir dans
// Grilles de critères » — celui que la communauté prendra lundi. Assistance active (le défaut).

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

/** Un VRAI événement « coller » sur la zone, avec le HTML au presse-papiers (comme Word ou Pages). */
async function coller(page, html) {
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        const donnees = { 'text/html': h, 'text/plain': '' };
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (t) => donnees[t] || '' } });
        zone.dispatchEvent(ev);
    }, html);
}

async function ecarterTout(page) {
    await expect(page.locator('#materiel-titre-etape')).toHaveText('Que faire de ces passages ?');
    while (await page.locator('[data-action="materiel.ecarter"]').count()) await page.locator('[data-action="materiel.ecarter"]').first().click();
}

test('C3 · dans Grilles de critères, le « i » du type de critère ouvre l’aide des trois types', async ({ page }) => {
    const erreurs = [], avertissements = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('console', (m) => { if (m.type() === 'warning' && /target non trouvé/.test(m.text())) avertissements.push(m.text()); });
    await ouvrirConception(page);
    expect(await page.evaluate(() => document.body.classList.contains('aide-contextuelle-active'))).toBe(true);
    await coller(page, f6Html());
    await page.locator('[data-action="materiel.suivant"]').click();
    await page.locator('[data-action="materiel.suivant"]').click();
    while (await page.locator('[data-action="materiel.ecarter"]').count()) await page.locator('[data-action="materiel.ecarter"]').first().click();
    await page.locator('[data-action="materiel.suivant"]').click();
    await page.locator('[data-action="materiel.creer"]').click();
    await page.locator('[data-action="materiel.voir"][data-param="grille-criteres"]').click();

    const icone = page.locator('#listeCriteres .primo-aide[data-target="grille-type-critere-detail"]').first();
    await expect(icone).toBeVisible();
    await icone.click();
    const aide = page.locator('.aide-contextuelle-modal.active');
    await expect(aide).toBeVisible();
    await expect(aide.locator('#aide-ctx-titre')).toHaveText(/Type de critère d’évaluation/);
    await expect(aide.locator('.primo-popup-body')).toContainText('Algorithmique');
    await aide.locator('[data-action="fermerAideContextuelle"]').click();
    await expect(page.locator('.aide-contextuelle-modal.active')).toHaveCount(0);
    expect(avertissements).toEqual([]);
    expect(erreurs).toEqual([]);
});
