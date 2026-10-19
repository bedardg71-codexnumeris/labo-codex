import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL », SON AIDE ET SON ACCOMPAGNEMENT (consigne du 19 oct. 2026, soir), dans un vrai WebKit.
//
//   · l'aide « i » à côté du titre ouvre la même aide, à l'accueil comme dans l'écran d'étiquetage ;
//   · une bulle au survol sur les boutons de l'accueil, ET sur « Couper » et « Rattacher », que la palette
//     fait naître en JavaScript : l'attribut posé ne suffit pas, la bulle doit s'afficher avec son texte ;
//   · la section « Apporter une grille que tu as déjà » de l'onglet Aide, trouvée par sa recherche.
// Les bulles du formulaire de création sont éprouvées dans materiel-dissection-2b.spec.js, là où la grille a
// les deux logiques.

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
    // Un témoin, pas un délai (même que la spec du lot 1).
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

const bulle = (page) => page.locator('#tooltip-bulle.tooltip-visible .tooltip-contenu');

/** Le survol d'un élément affiche sa bulle (après le délai de 400 ms de accompagnement.js), avec ce texte. */
async function survoler(page, locator, texte) {
    await page.mouse.move(0, 0);
    await expect(bulle(page)).toHaveCount(0);
    await locator.hover();
    await expect(bulle(page)).toHaveText(texte);
}

/** L'aide « i » de l'écran visible s'ouvre, avec son titre et son conseil ; puis se ferme. */
async function ouvrirAideI(page, ecran) {
    const i = page.locator(ecran + ' .btn-aide-contextuelle[data-aide="conception-materiel"]');
    await expect(i).toBeVisible();
    await i.click();
    const modale = page.locator('.aide-contextuelle-modal.active');
    await expect(modale.locator('#aide-ctx-titre')).toHaveText('Apporter mon matériel');
    await expect(modale).toContainText('Rien n’entre dans tes grilles avant ce dernier geste.');
    await expect(modale).toContainText('plutôt que depuis un PDF');
    await expect(modale.locator('.aide-lien-voir-aussi')).toHaveCount(3);
    await page.evaluate(() => window.fermerAideContextuelle());
    await expect(modale).toHaveCount(0);
}

test('aide d’« Apporter mon matériel » · l’aide « i » aux deux écrans, les bulles, y compris celles de la palette', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);

    // L'accueil : l'aide « i », deux bulles.
    await ouvrirAideI(page, '#materiel-accueil');
    await survoler(page, page.locator('[data-action="materiel.essayerExemple"]'),
        'Ouvre une grille fictive, pour essayer l’étiquetage sans ton propre document.');
    await survoler(page, page.locator('[data-action="materiel.taperMain"]'),
        'Mène à Grilles de critères, pour composer une grille directement dans l’application.');

    // L'écran d'étiquetage : l'aide « i », les boutons de son en-tête, et les deux outils nés en JavaScript.
    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await ouvrirAideI(page, '#materiel-dissection');
    await survoler(page, page.locator('[data-action="materielDissection.toutRetirer"]'),
        'Enlève toutes les étiquettes posées sur cette grille, pour recommencer l’étiquetage. Le texte collé reste.');
    // Break-test (fait le 19 oct.) : la ligne `BULLES_OUTILS[t.k]` retirée de materiel-dissection.js → rouge ici.
    await survoler(page, page.locator('#dissection-palette [data-param="couper"]'),
        'Quand une case porte deux choses sur une même ligne (un critère et ses points, par exemple), touche l’endroit entre les deux : le morceau devient deux, que tu étiquettes chacun.');
    await survoler(page, page.locator('#dissection-palette [data-param="rattacher"]'),
        'Quand un nom s’étend sur plusieurs lignes, touche ses morceaux : l’application les lit comme un seul texte, dans l’ordre de ta grille.');
    // Les étiquettes ont déjà leur phrase dans la palette : aucune bulle ne s'y ajoute.
    await expect(page.locator('#dissection-palette [data-tooltip]')).toHaveCount(2);

    // « Couper » en main : « Terminer » a sa bulle.
    await page.locator('#dissection-palette [data-param="couper"]').click();
    await survoler(page, page.locator('#dissection-terminer'),
        'Repose ce que tu as en main : une étiquette, « Couper » ou « Rattacher ». La touche Échap fait la même chose.');

    expect(erreurs).toEqual([]);
});

test('aide d’« Apporter mon matériel » · la section de l’onglet Aide, trouvée par la recherche', async ({ page }) => {
    await ouvrirConception(page);
    await page.evaluate(() => window.afficherSection('aide'));
    const carte = page.locator('#accordeon-aide-apporter-grille');
    for (const recherche of ['Apporter une grille', 'élément observable']) {
        // Le champ cherche au `keyup` (data-on-keyup) : une vraie touche après le texte.
        await page.locator('#aide-recherche-input').fill(recherche);
        await page.locator('#aide-recherche-input').press('End');
        await expect(carte).toBeVisible();
        await expect(page.locator('#accordeon-aide-creer-echelles')).toBeHidden();
    }
    await expect(carte.locator('#aide-apporter-grille-etiquettes li')).toHaveCount(6);
});
