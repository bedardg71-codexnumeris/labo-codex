import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
// ⏸ 18 oct. 2026 (la dissection, lot 1) : l'assistant en sept étapes est DÉBRANCHÉ de l'onglet, plus aucun
// collage ni bouton ne l'ouvre. Ces essais le parcouraient : suspendus, pas supprimés, comme son code. Son
// retrait est inscrit pour après lundi (PLAN-2026-10-18-la-dissection-pour-lundi.md, « Après lundi »).
test.skip(() => true, 'Assistant en sept étapes débranché le 18 oct. 2026 (dissection, lot 1) ; retrait après lundi.');

// « APPORTER MON MATÉRIEL », LOT 3b1 (consigne du 17 oct. 2026), dans un vrai WebKit.
//
//   · créer avec l'exemple, « La voir dans Grilles de critères » : la grille créée est OUVERTE et
//     sélectionnée dans la barre latérale ; sous chaque critère, le bloc « Ce qui est attendu à
//     chaque niveau », en lecture ;
//   · même chose pour l'échelle, dans Échelles de performance, et pour la cartouche (rétroactions).

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

const PLAGES = [['85', '100', '92'], ['75', '84', '80'], ['65', '74', '70'], ['0', '64', '50']];

async function creerExemple(page, nature = 'descripteurs') {
    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await page.locator('[data-action="materiel.suivant"]').click();
    await page.locator('[data-action="materiel.suivant"]').click();
    await page.locator(`[data-action="materiel.choisirNature"][data-param="${nature}"]`).click();
    await page.locator('[data-action="materiel.suivant"]').click();
    for (let j = 0; j < 4; j++) {
        await page.fill('#materiel-q-min-' + j, PLAGES[j][0]);
        await page.fill('#materiel-q-max-' + j, PLAGES[j][1]);
        await page.fill('#materiel-q-note-' + j, PLAGES[j][2]);
    }
    await page.locator('[data-action="materiel.suivant"]').click();
    await page.locator('[data-action="materiel.ecarter"]').click();
    await page.locator('[data-action="materiel.suivant"]').click();
    await page.locator('[data-action="materiel.creer"]').click();
    await expect(page.locator('#materiel-titre-cree')).toBeVisible();
    return page.evaluate(() => {
        const g = db.getSync(cle('grillesTemplates'), []);
        const e = db.getSync(cle('echellesTemplates'), []);
        const grille = g[g.length - 1];
        return { grille, echelle: e[e.length - 1], cartouche: db.getSync(cle('cartouches_' + grille.id), [])[0] || null };
    });
}

test('lot 3b1 · « La voir dans Grilles de critères » ouvre la grille créée, sélectionnée, ses niveaux en lecture', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    const { grille, echelle } = await creerExemple(page);

    await page.locator('[data-action="materiel.voir"][data-param="grille-criteres"]').click();
    await expect(page.locator('#conception-grille-criteres')).toBeVisible();
    await expect(page.locator('#nomGrilleTemplate')).toHaveValue(grille.nom);
    await expect(page.locator(`#conception-grille-criteres .sidebar-item[data-id="${grille.id}"]`)).toHaveClass(/\bactive\b/);
    const blocs = page.locator('#listeCriteres .grille-attendu');
    await expect(blocs).toHaveCount(grille.criteres.filter(c => c.descripteurs).length);
    await expect(blocs.first().locator('.grille-attendu-titre').first()).toHaveText('Ce qui est attendu à chaque niveau');
    const noms = echelle.niveaux.filter(n => grille.criteres[0].descripteurs.parNiveau[n.code]).map(n => n.nom);
    await expect(blocs.first().locator('.grille-attendu-niveau strong')).toHaveText(noms);
    await expect(blocs.first().locator('input, select')).toHaveCount(0);   // lot 13 : lié à l'échelle, le texte seul se modifie
    expect(erreurs).toEqual([]);
});

test('lot 3b1 · « Les voir dans Échelles de performance » ouvre l’échelle créée, sélectionnée', async ({ page }) => {
    await ouvrirConception(page);
    const { echelle } = await creerExemple(page);
    await page.locator('[data-action="materiel.voir"][data-param="echelle-performance"]').click();
    await expect(page.locator('#conception-echelle-performance')).toBeVisible();
    await expect(page.locator('#nomEchelleTemplate')).toHaveValue(echelle.nom);
    await expect(page.locator(`#conception-echelle-performance .sidebar-item[data-id="${echelle.id}"]`)).toHaveClass(/\bactive\b/);
});

test('lot 3b1 · « Les voir dans Cartouches de rétroaction » ouvre la cartouche créée, sélectionnée', async ({ page }) => {
    await ouvrirConception(page);
    const { cartouche } = await creerExemple(page, 'retroactions');
    expect(cartouche).not.toBeNull();
    await page.locator('[data-action="materiel.voir"][data-param="retroactions"]').click();
    await expect(page.locator('#conception-retroactions')).toBeVisible();
    await expect(page.locator('#nomCartouche')).toHaveValue(cartouche.nom);
    await expect(page.locator(`#conception-retroactions .sidebar-item[data-cartouche-id="${cartouche.id}"]`)).toHaveClass(/\bactive\b/);
});
