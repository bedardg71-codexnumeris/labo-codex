import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL » — le bandeau « En construction » (demande de Grégoire, 17 oct. 2026),
// dans un vrai WebKit : visible à TOUTES les étapes de l'onglet (accueil, chaque étape de
// l'assistant, vérification, confirmation), pas seulement à l'accueil, que materiel.js masque
// dès que l'assistant s'ouvre. Il reste jusqu'à ce que Grégoire décide de le retirer.

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
    await page.waitForTimeout(500);
    await page.evaluate(() => window.afficherSection('conception'));
    await page.waitForTimeout(200);
}

const PLAGES = [['85', '100', '92'], ['75', '84', '80'], ['65', '74', '70'], ['0', '64', '50']];

test('bandeau « En construction » : visible à l’accueil, à chaque étape, à la vérification et à la confirmation', async ({ page }) => {
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
    await visible('étape 1, Sens du tableau');
    await page.locator('[data-action="materiel.suivant"]').click();
    await visible('étape 2, Ce que contient ton tableau');
    await page.locator('[data-action="materiel.suivant"]').click();
    await visible('étape 3, Nature des cases');
    await page.locator('[data-action="materiel.choisirNature"][data-param="descripteurs"]').click();
    await page.locator('[data-action="materiel.suivant"]').click();
    await visible('étape 4, Plages de notes');
    for (let j = 0; j < 4; j++) {
        await page.fill('#materiel-q-min-' + j, PLAGES[j][0]);
        await page.fill('#materiel-q-max-' + j, PLAGES[j][1]);
        await page.fill('#materiel-q-note-' + j, PLAGES[j][2]);
    }
    await page.locator('[data-action="materiel.suivant"]').click();
    await visible('étape 5, À classer');
    await page.locator('[data-action="materiel.ecarter"]').click();
    await page.locator('[data-action="materiel.suivant"]').click();
    await expect(page.locator('#materiel-titre-etape')).toHaveText('Vérifie ta grille, puis crée-la');
    await visible('vérification');

    await page.locator('[data-action="materiel.creer"]').click();
    await expect(page.locator('#materiel-titre-cree')).toBeVisible();
    await visible('confirmation');

    // Le bandeau est au-dessus de ce que l'onglet montre, pas glissé dessous.
    const ordre = await page.evaluate(() => {
        const b = document.getElementById('materiel-en-construction');
        return !!(b.compareDocumentPosition(document.getElementById('materiel-lecture')) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(ordre).toBe(true);
    expect(erreurs).toEqual([]);
});
