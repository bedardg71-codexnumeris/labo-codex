import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');
const BUILD = JSON.parse(readFileSync(path.join(racineProjet, 'version.json'), 'utf8')).build;

// Le bandeau orange « nouvelle version » au chargement — réintroduit le 29 août
// 2026 (demande de Grégoire), CONDITIONNÉ au dernier build vu. Le retour terrain
// du 8 juin (bandeau sans condition, « recharge pour l'activer », en boucle) reste
// verrouillé : première visite silencieuse, une fois par nouveau build, jamais
// après fermeture.
//
// #850 (13 sept. 2026) : le repère s'écrit par `db` (JSON en localStorage, copie
// IDB) — il se relit donc par `db.getSync`, pas brut. Le semis brut de `ouvrir`
// reste valable : c'est la forme qu'a laissée l'ancien code, et db la relit.

async function ouvrir(page, buildVu) {
    await page.addInitScript((v) => {
        try { localStorage.removeItem('monitorage-build-vu'); if (v !== null) localStorage.setItem('monitorage-build-vu', v); } catch (e) {}
    }, buildVu);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800); // laisse passer les listeners DOMContentLoaded
}

test('première visite (aucun build vu) : PAS de bandeau, et le build est pris comme repère', async ({ page }) => {
    await ouvrir(page, null);
    const bandeau = page.locator('#bandeau-mise-a-jour');
    await expect(bandeau).toHaveCount(1);
    await expect(bandeau).not.toHaveClass(/\bvisible\b/);
    expect(await page.evaluate(() => window.db.getSync('monitorage-build-vu'))).toBe(BUILD);
});

test('build vu différent : le bandeau s\'affiche, au présent, sans bouton Recharger', async ({ page }) => {
    await ouvrir(page, '0101-0000');
    const bandeau = page.locator('#bandeau-mise-a-jour');
    await expect(bandeau).toHaveClass(/\bvisible\b/);
    await expect(page.locator('#bandeau-mise-a-jour-build')).toContainText('BUILD ' + BUILD);
    await expect(page.locator('#bandeau-mise-a-jour-texte')).toContainText('Nouvelle version chargée');
    await expect(page.locator('#bandeau-mise-a-jour-texte')).not.toContainText('Rafraîchis');
    await expect(page.locator('#bandeau-mise-a-jour [data-action="rechargerPage"]')).toBeHidden();
});

test('fermer le bandeau marque le build vu : au rechargement suivant, plus de bandeau', async ({ page }) => {
    await ouvrir(page, '0101-0000');
    await expect(page.locator('#bandeau-mise-a-jour')).toHaveClass(/\bvisible\b/);
    await page.locator('#bandeau-mise-a-jour .bandeau-mise-a-jour-close').click();
    await expect(page.locator('#bandeau-mise-a-jour')).not.toHaveClass(/\bvisible\b/);
    expect(await page.evaluate(() => window.db.getSync('monitorage-build-vu'))).toBe(BUILD);

    // Une SECONDE page, sans script d'init : même stockage, aucun faux build réinjecté.
    // (`addInitScript` se rejoue à chaque navigation de `page` — un `reload` ici
    // remettrait le faux build vu et prouverait le contraire de ce qu'on regarde.)
    const page2 = await page.context().newPage();
    await page2.goto(indexHtml);
    await page2.waitForLoadState('domcontentloaded');
    await page2.waitForTimeout(800);
    expect(await page2.evaluate(() => window.db.getSync('monitorage-build-vu'))).toBe(BUILD);
    await expect(page2.locator('#bandeau-mise-a-jour')).not.toHaveClass(/\bvisible\b/);
});

test('même build déjà vu : rien à l\'ouverture (pas de boucle du 8 juin)', async ({ page }) => {
    await ouvrir(page, BUILD);
    await expect(page.locator('#bandeau-mise-a-jour')).not.toHaveClass(/\bvisible\b/);
});
