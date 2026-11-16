// =======================================================================
// LA DÉMO DANS LE MENU DE L'EN-TÊTE — 16 NOVEMBRE 2026 (#1283)
// =======================================================================
// Demande de Grégoire (16 nov. 2026, 11 h 29, relais de Cowork) : depuis le 7 nov. (« l'accueil épuré », d6357733c),
// on n'entrait dans la démo que par la porte « Tu es conseiller·ère pédagogique ? » de l'accueil. Le menu de
// l'en-tête porte maintenant une ligne « Explorer la démo », qui appelle la même fonction que la porte ; en démo,
// elle dit « Quitter la démo » et fait ce que fait le bouton du bandeau vert. En vue étendue seulement.
// Ce banc part d'un espace vide, sous WebKit, à 1180, 820 et 390 px de large : il entre par le menu et sort par le
// menu, puis juge la vue simple (aucune des deux lignes).
// Break-test (16 nov. 2026) : la règle « body.mode-demo #menu-demo-explorer, body:not(.mode-demo) #menu-demo-quitter »
// retirée de styles.css → ROUGE aux trois largeurs (les deux lignes se voient ensemble) ; rétablie → vert.

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

test.setTimeout(120000);

const HAUTEURS = { 1180: 820, 820: 1180, 390: 844 };

async function ouvrirEspaceVide(page, largeur, erreurs) {
    page.on('dialog', async (d) => { await d.accept(); });
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setViewportSize({ width: largeur, height: HAUTEURS[largeur] });
    await page.goto(indexHtml);
    await attendreApplication(page);
}

/** Ouvre le menu de l'en-tête et rend ses lignes visibles, dans l'ordre, telles qu'on les lit. */
async function ouvrirMenu(page) {
    await page.click('#entete-menu-bouton');
    await expect(page.locator('#entete-menu-panneau')).toBeVisible();
    return page.evaluate(() => [...document.querySelectorAll('#entete-menu-panneau > button')]
        .filter((b) => b.getBoundingClientRect().height > 0)
        .map((b) => b.querySelector('.entete-menu-mot').firstChild.textContent.trim()));
}

const enDemo = (page) => page.evaluate(() => ({
    mode: typeof window.estEnModeDemo === 'function' && window.estEnModeDemo(),
    classe: document.body.classList.contains('mode-demo')
}));

for (const largeur of [1180, 820, 390]) {
    test(`${largeur} px : « Explorer la démo » entre dans la démo par le menu, « Quitter la démo » en sort par le menu`, async ({ page }) => {
        const erreurs = [];
        await ouvrirEspaceVide(page, largeur, erreurs);
        expect(await enDemo(page)).toEqual({ mode: false, classe: false });
        await expect(page.locator('body')).not.toHaveClass(/vue-simple/);

        // Hors démo : « Explorer la démo », entre « Assistance » et « Aide » ; « Quitter la démo » ne se voit pas.
        let lignes = await ouvrirMenu(page);
        expect(lignes).toEqual(['Assistance', 'Explorer la démo', 'Aide', 'Signaler', 'Soutenir', 'Réglages', 'Vue simple']);
        const ligne = await page.locator('#menu-demo-explorer').boundingBox();
        expect(ligne.height, 'la ligne se touche du doigt').toBeGreaterThanOrEqual(40);
        expect(ligne.x + ligne.width, 'la ligne tient dans l’écran').toBeLessThanOrEqual(largeur);

        // Le geste : la même entrée que la porte de l'accueil. Le menu se referme, la démo s'ouvre dans Suivi.
        await page.click('#menu-demo-explorer');
        await expect(page.locator('body')).toHaveClass(/mode-demo/, { timeout: 30000 });
        await expect(page.locator('#entete-menu-panneau')).toBeHidden();
        await expect(page.locator('#bandeau-demo')).toBeVisible();
        await expect(page.locator('#section-suivi')).toHaveClass(/active/);
        expect(await enDemo(page)).toEqual({ mode: true, classe: true });
        // À la première entrée, la fenêtre d'aide « Données démo » s'ouvre, comme par la porte : on la referme.
        expect(await page.evaluate(() => window.obtenirPreference('aideDemoVue'))).toBe(true);
        await page.evaluate(() => window.accompagnement.fermerAide());

        // En démo : la ligne dit « Quitter la démo », à la même place ; « Explorer la démo » ne se voit plus.
        lignes = await ouvrirMenu(page);
        expect(lignes).toEqual(['Assistance', 'Quitter la démo', 'Aide', 'Signaler', 'Soutenir', 'Réglages', 'Vue simple']);

        // Le geste du bandeau vert, par le menu : on sort, le bandeau part, la ligne redevient « Explorer la démo ».
        await page.click('#menu-demo-quitter');
        await expect(page.locator('body')).not.toHaveClass(/mode-demo/, { timeout: 30000 });
        await expect(page.locator('#bandeau-demo')).toBeHidden();
        expect(await enDemo(page)).toEqual({ mode: false, classe: false });
        lignes = await ouvrirMenu(page);
        expect(lignes).toContain('Explorer la démo');
        expect(lignes).not.toContain('Quitter la démo');

        expect(erreurs, 'aucune erreur de page').toEqual([]);
    });
}

test('vue simple : le menu ne porte aucune des deux lignes de la démo, hors démo comme en démo', async ({ page }) => {
    const erreurs = [];
    await ouvrirEspaceVide(page, 1180, erreurs);
    await page.evaluate(() => window.VueSimple.basculer('simple'));
    await expect(page.locator('body')).toHaveClass(/vue-simple/);
    expect(await ouvrirMenu(page)).toEqual(['Vue étendue']);
    await page.click('#entete-menu-bouton');

    // En démo (entrée en vue étendue, puis bascule) : toujours une seule ligne ; on sort par le bandeau.
    await page.evaluate(() => window.VueSimple.basculer('etendue'));
    await expect(page.locator('body')).not.toHaveClass(/vue-simple/);
    await ouvrirMenu(page);
    await page.click('#menu-demo-explorer');
    await expect(page.locator('body')).toHaveClass(/mode-demo/, { timeout: 30000 });
    await page.evaluate(() => window.accompagnement.fermerAide());
    await page.evaluate(() => window.VueSimple.basculer('simple'));
    await expect(page.locator('body')).toHaveClass(/vue-simple/);
    expect(await ouvrirMenu(page)).toEqual(['Vue étendue']);
    await expect(page.locator('#bandeau-demo [data-action="desactiverModeDemo"]')).toBeVisible();
    expect(erreurs, 'aucune erreur de page').toEqual([]);
});
