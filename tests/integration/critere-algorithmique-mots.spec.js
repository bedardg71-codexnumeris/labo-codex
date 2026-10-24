import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LE CRITÈRE ALGORITHMIQUE, LOT DE MOTS (consigne du 21 oct. 2026), dans un vrai WebKit :
//   · une grille neuve, un critère algorithmique « Français écrit » : « Partir de la liste du français écrit
//     (codes 1 à 10) » donne les dix sous-critères de la grille démo (hors code 0), et Annoter les offre comme codes ;
//   · l'onglet Aide, section 5c : « Les critères algorithmiques », sans « Avantages pédagogiques ».
// Le montage : celui de `critere-algorithmique-etape-0`. Captures : CAPTURES_MOTS=<dossier>.

async function ouvrir(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await page.waitForFunction(() => window.dbReady === true && window.travauxOutils && window.PACK_DEMARRAGE, null, { timeout: 20000 });
    return erreurs;
}

/** La copie d'une production ouverte dans Annoter : la palette des codes, telle qu'elle se rend. */
const PALETTE = `(productionId) => {
    window.dispatchEvent(new CustomEvent('travaux-fichier-ouvert', { detail: { fichier: { id: 'F_' + productionId, productionId: productionId } } }));
    const grille = travauxOutils.grilleCourante();
    return { html: travauxOutils.genererContenuErreursFr(), codes: codesAnnotation.listeCodes(grille).map((c) => [c.numero, c.nom]) };
}`;

test('une grille neuve : « Partir de la liste du français écrit (codes 1 à 10) » donne les dix sous-critères, Annoter les offre comme codes', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await page.locator('[data-action="creerNouvelleGrille"]').click();
    await page.locator('#nomGrilleTemplate').fill('Rédaction fictive');
    const carte = page.locator('#listeCriteres .item-liste').first();
    await carte.locator('select[data-on-change="modifierTypeCritereTempHandler"]').selectOption('algorithmique');
    const nom = carte.locator('input[data-on-change="modifierCritereTempHandler"][data-champ="nom"]');
    await nom.fill('Français écrit');
    await nom.press('Tab');
    const bouton = carte.locator('[data-action="initialiserSousCriteresParDefaut"]');
    await expect(bouton).toHaveText('Partir de la liste du français écrit (codes 1 à 10)');
    await bouton.click();
    await expect(carte.locator('.sous-critere-item')).toHaveCount(10);
    if (process.env.CAPTURES_MOTS) await carte.screenshot({ path: path.join(process.env.CAPTURES_MOTS, 'dix-sous-criteres-crees.png') });

    await page.locator('#btnCreerGrille').click();
    await expect.poll(() => page.evaluate(() => db.getSync(cle('grillesTemplates'), []).some((g) => g.nom === 'Rédaction fictive'))).toBe(true);
    const r = await page.evaluate('(' + `() => {
        const g = db.getSync(cle('grillesTemplates'), []).find((x) => x.nom === 'Rédaction fictive');
        const demo = window.PACK_DEMARRAGE.grillesTemplates.find((x) => x.nom === 'Grille-5 FR-ALGO-20 H26')
            .criteres.find((c) => c.nom === 'Français écrit').sousCriteres.filter((s) => s.code !== '0');
        // security-ok: fixture littérale du spec, aucune source externe.
        db.setSync(cle('productions'), [{ id: 'P_REDAC', titre: 'Dissertation fictive', grilleId: g.id }]);
        return { sousCriteres: g.criteres[0].sousCriteres, demo, palette: (${PALETTE})('P_REDAC') };
    }` + ')()');
    expect(r.sousCriteres).toEqual(r.demo);
    expect(r.palette.codes).toEqual(r.demo.map((s) => [s.code, s.nom]));
    const palette = r.palette.html.replace(/&#0?39;|&apos;/g, '\'');
    for (const s of r.demo) expect(palette).toContain(s.nom);
    expect(erreurs).toEqual([]);
});

test('l’onglet Aide, section 5c : « Les critères algorithmiques », sans « Avantages pédagogiques »', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    const erreurs = await ouvrir(page);
    // ↻ #1152, lot 1 (audit de l'Aide du 24 oct. 2026, D11) : l'entrée est rangée sous « Conception », son titre perd « 5c. ».
    await page.evaluate(() => window.naviguerVers('aide', 'conception'));
    const carte = page.locator('#accordeon-aide-sous-criteres');
    await expect(carte.locator('h3')).toContainText('Les critères algorithmiques');
    await expect(carte.locator('h3')).not.toContainText('5c.');
    await carte.locator('.accordeon-header').click();
    const contenu = carte.locator('.accordeon-contenu');
    await expect(contenu).toBeVisible();
    await expect(contenu).toContainText('Partir de la liste du français écrit » crée d’un coup'.replace('’', '\''));
    await expect(contenu).toContainText('7 erreurs (5 après pondération) sur 400 mots → 13,75/20 (68,8 %)');
    await expect(contenu).not.toContainText('Avantages pédagogiques');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    if (process.env.CAPTURES_MOTS) await carte.screenshot({ path: path.join(process.env.CAPTURES_MOTS, 'aide-section-5c.png') });
    expect(erreurs).toEqual([]);
});
