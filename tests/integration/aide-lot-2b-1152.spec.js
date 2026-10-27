import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =====================================================================
// #1152, LOT 2b — LA CONCEPTION (audit de l'Aide du 24 oct. 2026 ; remesure du 27 oct.)
// =====================================================================
//
// Le pendant OBSERVABLE de `tests/unit/sentinelle-aide-2026-10-27-lot-2b.test.js` : la recherche de l'Aide trouve
// « Cas d'interprétation » et « Composer ton propre calcul » dans « Les critères algorithmiques », et « IDME » ne
// mène plus qu'à une entrée de la Conception, « SOLO et l'échelle de départ (IDME) » (`idme` absorbée).
// CAPTURES_AIDE_2B=<dossier> enregistre, à 1 440 et 820 px, les entrées `sous-criteres` et `solo` ouvertes.
//
// Lecture seule : ce fichier ne pose ni ne retire aucune clé de stockage.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

async function chercher(page, mot) {
    await page.fill('#aide-recherche-input', mot);
    await page.locator('#aide-recherche-input').dispatchEvent('keyup');
    await expect(page.locator('#aide-recherche-resultats')).toBeVisible();
}

/** Les ids des cartes de la Conception que la recherche montre. */
const cartesConceptionVisibles = (page) => page.locator('#aide-conception > .carte.accordeon').evaluateAll(
    (cartes) => cartes.filter((c) => c.style.display === 'block').map((c) => c.id));

test('#1152 lot 2b · la recherche trouve l\'atelier du critère algorithmique ; « IDME » mène à une seule entrée de la Conception', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherSection === 'function');
    await page.evaluate(() => window.afficherSection('aide'));

    const resultats = page.locator('#aide-recherche-resultats');
    for (const mot of ['Cas d\'interprétation', 'Composer ton propre calcul']) {
        await chercher(page, mot);
        await expect(resultats.locator('button[data-param="accordeon-aide-sous-criteres"]')).toHaveCount(1);
        expect(await cartesConceptionVisibles(page)).toEqual(['accordeon-aide-sous-criteres']);
    }

    await chercher(page, 'IDME');
    await expect(resultats.locator('button[data-param="accordeon-aide-solo"]')).toHaveCount(1);
    await expect(resultats.locator('button[data-param="accordeon-aide-idme"]')).toHaveCount(0);
    expect(await cartesConceptionVisibles(page)).toEqual(['accordeon-aide-solo']);

    await page.fill('#aide-recherche-input', '');
    await page.locator('#aide-recherche-input').dispatchEvent('keyup');

    if (process.env.CAPTURES_AIDE_2B) {
        const dossier = process.env.CAPTURES_AIDE_2B;
        await page.evaluate(() => window.naviguerVers && window.naviguerVers('aide', 'conception'));
        for (const largeur of [1440, 820]) {
            await page.setViewportSize({ width: largeur, height: 900 });
            for (const id of ['sous-criteres', 'solo']) {
                const carte = page.locator(`#accordeon-aide-${id}`);
                if (!(await carte.locator('.accordeon-contenu').isVisible())) await carte.locator('.accordeon-header').click();
                await carte.scrollIntoViewIfNeeded();
                await page.waitForTimeout(200);
                await carte.screenshot({ path: path.join(dossier, `aide-${id}-${largeur}.png`) });
            }
            // La page ne défile pas de côté (les deux tableaux de `solo` compris).
            expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
        }
    }

    expect(erreurs).toEqual([]);
});
