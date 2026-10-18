import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRILLE_D7, SECTION_D7, NOM_D7, POND_D7, CASES_D7, enHtml } from '../unit/_helpers/grilles-fictives-dissection.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 9 (créer même s'il manque des points, consigne du 18 oct. 2026),
// dans un vrai WebKit.
//
//   · la grille fictive (d7) collée, SANS rattachement : sa case donne trois critères, dont deux sans points ;
//     « Créer ma grille » s'active, et la liste à part dit les deux critères à compléter ;
//   · la confirmation compte les critères à compléter, sans « NaN » ni « null » ;
//   · dans Grilles de critères, la ligne du total dit combien de critères n'ont pas de points ; saisis, le
//     signal baisse puis disparaît, et les points sont écrits en base.

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

/** Un VRAI événement « coller » sur la zone, avec le HTML au presse-papiers (comme Word ou Pages). */
async function coller(page, html) {
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (k) => (k === 'text/html' ? h : '') } });
        zone.dispatchEvent(ev);
    }, html);
}

/** Une étiquette en main, un geste de pointeur sur tous les morceaux dont le texte est dans la liste, puis Échap. */
async function etiqueter(page, type, textes) {
    await page.locator('#dissection-palette [data-param="' + type + '"]').click();
    await page.evaluate((ts) => {
        const blocs = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].filter((b) => ts.includes(b.textContent));
        const centre = (b) => { b.scrollIntoView({ block: 'center', inline: 'center' }); const r = b.getBoundingClientRect(); return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }; };
        const ev = (t, b) => new PointerEvent(t, Object.assign({ bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true }, centre(b)));
        blocs[0].dispatchEvent(ev('pointerdown', blocs[0]));
        blocs.slice(1).forEach((b) => b.dispatchEvent(ev('pointermove', b)));
        const der = blocs[blocs.length - 1];
        der.dispatchEvent(ev('pointerup', der));
    }, textes);
    await page.keyboard.press('Escape');
}

test('dissection 9 · (d7) sans rattachement : créée avec deux critères sans points, signalés puis complétés dans Grilles de critères', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setViewportSize({ width: 820, height: 1180 });
    await ouvrirConception(page);
    await coller(page, enHtml(GRILLE_D7));
    await expect(page.locator('#materiel-dissection')).toBeVisible();

    // Étiquetée comme à la porte, sans « Rattacher » : les deux fins du nom sont deux critères sans points.
    await etiqueter(page, 'titre', ['Évaluation fictive sur les images']);
    await etiqueter(page, 'section', [SECTION_D7]);
    await etiqueter(page, 'critere', NOM_D7);
    await etiqueter(page, 'ponderation', [POND_D7]);
    await etiqueter(page, 'souscritere', CASES_D7);
    await expect(page.locator('#dissection-constats')).toContainText('3 critères');
    await expect(page.locator('#dissection-logique')).toContainText('L’application y lirait une grille en points');

    // Le bouton s'active ; la liste à part nomme les deux critères à compléter ; aucune raison bloquante.
    const bouton = page.locator('#dissection-creer [data-action="materielDissection.creer"]');
    await expect(bouton).toBeEnabled();
    await expect(page.locator('#dissection-creer-raisons')).toHaveCount(0);
    const aCompleter = page.locator('#dissection-creer-a-completer');
    await expect(aCompleter).toContainText('Tu pourras créer ta grille, puis compléter dans « Grilles de critères » :');
    await expect(aCompleter.locator('li')).toHaveText(['les points de 2 critères (« (exemples, contrastes, » et « renvois) »)']);

    await bouton.click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Évaluation fictive sur les images » est créée');
    const confirmation = page.locator('.materiel-confirmation');
    await expect(confirmation).toContainText('Il te restera à donner des points à 2 critères, dans « Grilles de critères ».');
    await expect(confirmation).toContainText('3 critères, sur 24 points ; 2 critères sans points pour l’instant.');
    await expect(confirmation).not.toContainText('NaN');
    await expect(confirmation).not.toContainText('null');

    // En base : `null` pour les deux critères sans points.
    const g = await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).slice(-1)[0]);
    expect(g.criteres.map((c) => c.ponderation)).toEqual([24, null, null]);

    // Grilles de critères : la ligne du total le dit ; chaque saisie le fait baisser, puis disparaître.
    await page.locator('[data-action="materiel.voir"][data-param="grille-criteres"]').click();
    const total = page.locator('#totalPonderationAffichage');
    await expect(total).toHaveText('24 points (2 critères sans points)');
    const champs = page.locator('#listeCriteres .critere-rangee input[data-champ="ponderation"]');
    await expect(champs).toHaveCount(3);
    await expect(champs.nth(1)).toHaveValue('');
    await champs.nth(1).fill('6');
    await champs.nth(1).press('Tab');
    await expect(total).toHaveText('30 points (1 critère sans points)');
    await champs.nth(2).fill('4');
    await champs.nth(2).press('Tab');
    await expect(total).toHaveText('34 points');
    await expect.poll(() => page.evaluate(() => db.getSync(cle('grillesTemplates'), []).slice(-1)[0].criteres.map((c) => c.ponderation))).toEqual([24, 6, 4]);
    expect(erreurs).toEqual([]);
});
