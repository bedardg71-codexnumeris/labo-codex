import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Retour terrain 8 juin : le bandeau orange « une mise à jour a été déployée, recharge
// pour l'activer » s'affichait AU CHARGEMENT (build chargé == build actif → non-sens) et
// revenait en boucle après chaque Recharger. Il ne doit plus apparaître à l'ouverture —
// seul le polling distant (vraie MAJ déployée en cours de session) peut le déclencher.

test('le bandeau de mise à jour n\'est PAS affiché au chargement', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800); // laisse passer les listeners DOMContentLoaded

    const bandeau = page.locator('#bandeau-mise-a-jour');
    await expect(bandeau).toHaveCount(1);                       // l'élément existe (pour le polling)
    await expect(bandeau).not.toHaveClass(/\bvisible\b/);      // mais pas affiché à l'ouverture
});
