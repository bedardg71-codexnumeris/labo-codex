import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// LES PARCOURS ASSISTÉS SONT FERMÉS — 15 NOVEMBRE 2026 (consigne relayée par Cowork)
// =======================================================================
// La liste est en développement : le panneau « Assistance » dit « À venir » à sa place, et aucun
// parcours ne part, d'aucune porte. Le reste du panneau ne bouge pas. Ce banc est le SEUL qui
// charge l'application telle qu'elle est livrée (`parcoursFermes: true`) : les autres bancs
// rouvrent les parcours par le harnais (attendre-application.js).
// ⮕ Quand `PARCOURS_OUVERTS` repasse à true (js/assistance.js), ce banc part avec la fermeture.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

async function ouvrirEspaceVide(page, largeur = 1180) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.setViewportSize({ width: largeur, height: 900 });
    await page.goto(indexHtml);
    await attendreApplication(page, { parcoursFermes: true });
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
    await attendreApplication(page, { parcoursFermes: true });
    await page.evaluate(() => { window.afficherSection('accueil'); window.afficherAccueil(); window.scrollTo(0, 0); });
}

const bulles = (page) => page.locator('.parcours-bulle');

test('le panneau « Assistance » : « À venir » à la place de la liste, le reste inchangé', async ({ page }) => {
    await ouvrirEspaceVide(page);
    expect(await page.evaluate(() => window.Assistance.parcoursOuverts())).toBe(false);
    // Le menu ne porte plus de rang (« 1 sur 9 ») : rien n'est à faire.
    await expect(page.locator('#assistance-menu-rang')).toHaveText('');

    await page.evaluate(() => window.ouvrirPanneauAssistance());
    const panneau = page.locator('#panneau-assistance');
    await expect(panneau).toBeVisible();
    await expect(panneau.locator('#assistance-a-venir')).toHaveText('À venir');
    await expect(panneau.locator('#assistance-parcours-liste')).toHaveCount(0);
    await expect(panneau.locator('.assistance-parcours-item')).toHaveCount(0);
    await expect(panneau.locator('.assistance-parcours-bouton')).toHaveCount(0);

    // Ce qui reste : le titre, « Aide dans les pages » et son interrupteur, qui bascule toujours.
    await expect(panneau.locator('#assistance-titre')).toHaveText('Assistance');
    await expect(panneau.locator('#assistance-aide-titre')).toHaveText('Aide dans les pages');
    const inter = panneau.locator('#assistance-interrupteur');
    const avant = await inter.getAttribute('aria-checked');
    await inter.click();
    await expect(inter).not.toHaveAttribute('aria-checked', avant);
    await inter.click();
    await expect(inter).toHaveAttribute('aria-checked', avant);

    // Les seuls boutons du panneau : fermer et l'interrupteur. Échap le ferme.
    expect(await panneau.locator('button').count()).toBe(2);
    await page.keyboard.press('Escape');
    await expect(panneau).toHaveCount(0);
});

test('aucune porte ne lance un parcours : le registre rendu est vide, « Parcours suivant » refuse, « Tu enseignes ? » mène à Cadre › Trimestre', async ({ page }) => {
    await ouvrirEspaceVide(page);
    const lu = await page.evaluate(() => ({
        offerts: window.Assistance.parcours().length,
        lances: ['decouvrir', 'classe', 'cours', 'evaluer'].map((id) => window.Assistance.lancerParcours(id)),
        actif: !!(window.ParcoursMoteur && window.ParcoursMoteur.actif && window.ParcoursMoteur.actif())
    }));
    expect(lu.offerts, 'les parcours restent inscrits, mais ne sont plus offerts').toBe(0);
    expect(lu.lances).toEqual([false, false, false, false]);
    expect(lu.actif).toBe(false);
    await expect(bulles(page)).toHaveCount(0);
    await expect(page.locator('#panneau-assistance')).toHaveCount(0);

    // La porte « Tu enseignes ? » : plus de parcours, mais elle ne reste pas muette.
    await page.click('#accueil-portes .accueil-porte:first-child .accueil-porte-bouton');
    await expect(page.locator('#calendrier-trimestre')).toBeVisible();
    await expect(bulles(page)).toHaveCount(0);
    expect(await page.evaluate(() => !!(window.ParcoursMoteur.actif && window.ParcoursMoteur.actif()))).toBe(false);
});

test('le lien « Assistance » de « À propos » ouvre toujours le panneau', async ({ page }) => {
    await ouvrirEspaceVide(page);
    await page.locator('#banniere-bienvenue .apropos-lien', { hasText: 'Assistance' }).click();
    await expect(page.locator('#panneau-assistance #assistance-a-venir')).toBeVisible();
});
