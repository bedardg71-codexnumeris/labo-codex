import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
// ⏸ 18 oct. 2026 (la dissection, lot 1) : l'assistant en sept étapes est DÉBRANCHÉ de l'onglet, plus aucun
// collage ni bouton ne l'ouvre. Ces essais le parcouraient : suspendus, pas supprimés, comme son code. Son
// retrait est inscrit pour après lundi (PLAN-2026-10-18-la-dissection-pour-lundi.md, « Après lundi »).
test.skip(() => true, 'Assistant en sept étapes débranché le 18 oct. 2026 (dissection, lot 1) ; retrait après lundi.');

// « APPORTER MON MATÉRIEL », LOT 2 (consigne du 17 oct. 2026), dans un vrai WebKit.
//
//   · l'exemple mène à six étapes : Sens du tableau, Ce que contient ton tableau (lot 3a),
//     Nature des cases, Plages de notes, À classer, Vérification (pas de Pondération : le
//     document la donne) ;
//   · « Créer ma grille » fait apparaître la grille dans Grilles de critères et l'échelle dans
//     Échelles de performance ; la branche rétroactions crée une cartouche, visible dans
//     Cartouches de rétroaction ;
//   · iPad : la page ne défile pas de côté, les commandes font 44 px.
//
// Un trimestre fictif (« Automne 2032 ») est posé avant le rechargement : sans trimestre actif,
// la création est refusée (éprouvé par Vitest, materiel-lot2-assistant.test.js, W.b).

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
    expect(await page.evaluate(() => cle('grillesTemplates'))).toBe('a2032_grillesTemplates');
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

const PLAGES = [['85', '100', '92'], ['75', '84', '80'], ['65', '74', '70'], ['0', '64', '50']];

/** De l'exemple à la Vérification : la nature choisie, les plages et les notes saisies, le passage écarté. */
async function parcourirExemple(page, nature) {
    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await page.locator('[data-action="materiel.suivant"]').click();                       // Sens du tableau
    await page.locator('[data-action="materiel.suivant"]').click();                       // Ce que contient ton tableau
    await page.locator(`[data-action="materiel.choisirNature"][data-param="${nature}"]`).click();
    await expect(page.locator(`[data-action="materiel.choisirNature"][data-param="${nature}"]`)).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-action="materiel.suivant"]').click();                       // Nature des cases
    for (let j = 0; j < 4; j++) {
        await page.fill('#materiel-q-min-' + j, PLAGES[j][0]);
        await page.fill('#materiel-q-max-' + j, PLAGES[j][1]);
        await page.fill('#materiel-q-note-' + j, PLAGES[j][2]);
    }
    await page.locator('[data-action="materiel.suivant"]').click();                       // Plages de notes
    await page.locator('[data-action="materiel.ecarter"]').click();
    await page.locator('[data-action="materiel.suivant"]').click();                       // À classer
    await expect(page.locator('#materiel-titre-etape')).toHaveText('Vérifie ta grille, puis crée-la');
}

test('lot 2 · l’exemple mène à six étapes ; « Créer » fait apparaître la grille et l’échelle dans leurs outils', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);

    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await expect(page.locator('.materiel-etapes-nav button')).toHaveText([
        '1. Sens du tableau', '2. Ce que contient ton tableau', '3. Nature des cases', '4. Plages de notes', '5. À classer', '6. Vérification'
    ]);
    await expect(page.locator('.materiel-etape-texte')).toHaveText('Étape 1 sur 6');
    await expect(page.locator('#materiel-titre-etape')).toBeFocused();
    await expect(page.locator('.materiel-mot-app')).toContainText('grille de critères');
    await page.locator('[data-action="materiel.precedent"]').click();

    // Créer trop tôt : la liste des manques, rien d'écrit.
    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await page.locator('[data-action="materiel.allerEtape"][data-param="5"]').click();
    await page.locator('[data-action="materiel.creer"]').click();
    await expect(page.locator('.materiel-manquants')).toContainText('un passage à classer ou à écarter');
    expect(await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).length)).toBe(1);   // la grille de départ seule
    await page.locator('[data-action="materiel.precedent"]').click();
    await page.locator('[data-action="materiel.precedent"]').click();
    await page.locator('[data-action="materiel.precedent"]').click();
    await page.locator('[data-action="materiel.precedent"]').click();
    await page.locator('[data-action="materiel.precedent"]').click();
    await page.locator('[data-action="materiel.precedent"]').click();

    await parcourirExemple(page, 'descripteurs');
    await page.locator('[data-action="materiel.creer"]').click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Exposé oral : grille d’évaluation » est créée');
    await expect(page.locator('#materiel-titre-cree')).toBeFocused();
    await expect(page.locator('[data-action="materiel.voir"][data-param="retroactions"]')).toHaveCount(0);

    await page.locator('[data-action="materiel.voir"][data-param="grille-criteres"]').click();
    await expect(page.locator('#conception-grille-criteres')).toBeVisible();
    await expect(page.locator('#conception-grille-criteres')).toContainText('Exposé oral : grille d’évaluation');
    await page.evaluate(() => window.afficherSousSection('conception-echelle-performance'));
    await expect(page.locator('#conception-echelle-performance')).toContainText('Échelle – Exposé oral : grille d’évaluation');

    const cree = await page.evaluate(() => {
        const g = db.getSync(cle('grillesTemplates'), []);
        return { ids: g.map(x => x.id), descr: g[g.length - 1].criteres[0].descripteurs, echelles: db.getSync(cle('echellesTemplates'), []).map(e => e.id) };
    });
    expect(cree.ids[0]).toBe('GRILLE_GENERIQUE');
    expect(cree.descr.echelleId).toBe(cree.echelles[cree.echelles.length - 1]);
    expect(erreurs).toEqual([]);
});

test('lot 2 · des cases qui s’adressent à l’étudiant·e : la création fait une cartouche de rétroaction', async ({ page }) => {
    await ouvrirConception(page);
    await parcourirExemple(page, 'retroactions');
    await expect(page.locator('#materiel-cree')).toContainText('Une cartouche de rétroaction');
    await page.locator('[data-action="materiel.creer"]').click();
    await expect(page.locator('#materiel-titre-cree')).toBeVisible();
    const r = await page.evaluate(() => {
        const g = db.getSync(cle('grillesTemplates'), []);
        const grille = g[g.length - 1];
        return { cartouches: db.getSync(cle('cartouches_' + grille.id), []), descr: grille.criteres.some(c => c.descripteurs) };
    });
    expect(r.descr).toBe(false);
    expect(r.cartouches).toHaveLength(1);
    expect(Object.keys(r.cartouches[0].commentaires)).toHaveLength(12);
    await page.locator('[data-action="materiel.voir"][data-param="retroactions"]').click();
    await expect(page.locator('#conception-retroactions')).toContainText('Rétroactions – Exposé oral : grille d’évaluation');
});

test('lot 2 · iPad : la page ne défile pas de côté, les commandes font 44 px', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await ouvrirConception(page);
    await parcourirExemple(page, 'descripteurs');
    const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(debord, 'la page ne défile pas horizontalement').toBeLessThanOrEqual(0);
    const petites = await page.evaluate(() => Array.from(document.querySelectorAll(
        '#materiel-lecture button, #materiel-lecture input[type="text"]'))
        .filter((b) => b.offsetParent && b.getBoundingClientRect().height < 44)
        .map((b) => b.textContent.trim() || b.id));
    expect(petites, 'cibles tactiles de 44 px').toEqual([]);
});
