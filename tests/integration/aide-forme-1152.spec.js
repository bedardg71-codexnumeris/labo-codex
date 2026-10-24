import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =====================================================================
// #1152, LOT 1 — L'AIDE RANGÉE COMME L'APPLICATION (audit du 24 oct. 2026, D11)
// =====================================================================
//
// Le pendant OBSERVABLE de `tests/unit/sentinelle-aide-2026-10-24-forme.test.js`.
// On ouvre l'Aide : la barre montre les huit sous-onglets du tableau 'aide' de
// config.js (lus dans la page, pas recopiés) ; « Référence » rend le glossaire,
// qu'`accompagnement.js` n'écoute que sur `aide-reference` ; la recherche
// « codex » trouve des cartes et montre le titre de leur sous-section.
// CAPTURES_AIDE=<dossier> enregistre la barre à 768 et 1024 px de large.
//
// Lecture seule : ce fichier ne pose ni ne retire aucune clé de stockage.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

test('#1152 · l\'Aide : huit sous-onglets, le glossaire sous « Référence », la recherche nomme ses sous-sections', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherSection === 'function');
    await page.evaluate(() => window.afficherSection('aide'));

    // 1. La barre : les huit libellés de config.js, dans l'ordre ; « Commencer » actif.
    const attendus = await page.evaluate(() => configurationsOnglets.aide.map((o) => ({ id: `aide-${o.id}`, label: o.label })));
    expect(attendus).toHaveLength(8);
    const boutons = page.locator('#sous-navigation button');
    await expect(boutons).toHaveCount(8);
    const lus = await boutons.evaluateAll((bs) => bs.map((b) => ({ id: b.dataset.sousOnglet, label: b.textContent.trim() })));
    expect(lus).toEqual(attendus);
    await expect(page.locator('#aide-commencer')).toHaveClass(/\bactive\b/);
    await expect(page.locator('#aide-commencer h2')).toHaveText('Commencer');

    // Jusqu'à 1024 px, la barre de boutons cède la place au menu « Sous-section » (styles.css, règle mobile) :
    // ses huit options doivent être les mêmes.
    await page.setViewportSize({ width: 1024, height: 900 });
    const options = await page.locator('#select-sous-nav-mobile option').evaluateAll((os) => os.map((o) => o.textContent.trim()));
    expect(options).toEqual(attendus.map((a) => a.label));
    if (process.env.CAPTURES_AIDE) {
        for (const largeur of [768, 1024, 1280]) {
            await page.setViewportSize({ width: largeur, height: 900 });
            await page.waitForTimeout(250);
            await page.screenshot({ path: path.join(process.env.CAPTURES_AIDE, `aide-sous-onglets-${largeur}.png`), clip: { x: 0, y: 0, width: largeur, height: 340 } });
        }
    }
    await page.setViewportSize({ width: 1280, height: 900 });

    // 2. « Référence » rend le glossaire.
    await page.locator('#sous-navigation button[data-sous-onglet="aide-reference"]').click();
    await expect(page.locator('#aide-reference')).toHaveClass(/\bactive\b/);
    await expect(page.locator('#aide-reference h2')).toHaveText('Référence');
    await page.locator('#accordeon-aide-glossaire .accordeon-header').click();
    await expect.poll(() => page.locator('#glossaire-rendu').evaluate((el) => el.textContent.trim().length)).toBeGreaterThan(200);

    // 3. La recherche « codex » : des cartes trouvées, la carte du Codex parmi elles, sa sous-section titrée.
    await page.fill('#aide-recherche-input', 'codex');
    await page.locator('#aide-recherche-input').dispatchEvent('keyup');
    const resultats = page.locator('#aide-recherche-resultats');
    await expect(resultats).toBeVisible();
    await expect(resultats.locator('button[data-action="allerVersCarte"]').first()).toBeVisible();
    await expect(resultats.locator('button[data-param="accordeon-aide-codex"]')).toHaveCount(1);
    await expect(page.locator('#aide-codex-archives')).toHaveClass(/\bactive\b/);
    await expect(page.locator('#aide-codex-archives h2')).toBeVisible();
    await expect(page.locator('#aide-codex-archives h2')).toHaveText('Codex et archives');
    await expect(page.locator('#accordeon-aide-codex')).toBeVisible();

    expect(erreurs).toEqual([]);
});
