import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =====================================================================
// #1152, LOT 2c — L'ÉVALUATION (audit de l'Aide du 24 oct. 2026 ; remesure du 27 oct.)
// =====================================================================
//
// Le pendant OBSERVABLE de `tests/unit/sentinelle-aide-2026-10-28-lot-2c.test.js` : la recherche de l'Aide trouve
// « corbeille » dans « La liste des évaluations », « tranche », « note remise » et « barème » dans « Annoter et évaluer
// un travail » (gestes neufs n° 5, 6 et 7 de la remesure) ; « Évaluer les productions », absorbée, ne sort plus.
// CAPTURES_AIDE_2C=<dossier> enregistre, à 1 440 et 820 px, les entrées `liste-evaluations` et `annoter-evaluer` ouvertes.
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

/** Les ids des cartes de l'Évaluation que la recherche montre. */
const cartesEvaluationVisibles = (page) => page.locator('#aide-evaluation > .carte.accordeon').evaluateAll(
    (cartes) => cartes.filter((c) => c.style.display === 'block').map((c) => c.id.replace('accordeon-aide-', '')));

test('#1152 lot 2c · la recherche trouve la corbeille, les tranches et la note remise dans l\'Évaluation', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherSection === 'function');
    await page.evaluate(() => window.afficherSection('aide'));

    // Verdict de relecture du 28 oct. 2026, retouche 1 : « La liste des évaluations » vient après « Préparer et importer
    // les travaux », dans l'ordre des sous-onglets.
    const titres = await page.locator('#aide-evaluation > .carte.accordeon h3').allTextContents();
    expect(titres.slice(0, 2).map((t) => t.replace(/[▼▶]/, '').replace(/\s+/g, ' ').trim())).toEqual(['Préparer et importer les travaux', 'La liste des évaluations']);

    const resultats = page.locator('#aide-recherche-resultats');
    for (const [mot, id] of [['corbeille', 'liste-evaluations'], ['tranche', 'annoter-evaluer'], ['note remise', 'annoter-evaluer'], ['barème', 'annoter-evaluer']]) {
        await chercher(page, mot);
        await expect(resultats.locator(`button[data-param="accordeon-aide-${id}"]`), mot).toHaveCount(1);
        expect(await cartesEvaluationVisibles(page), mot).toContain(id);
    }
    await expect(resultats.locator('button[data-param="accordeon-aide-evaluer-productions"]')).toHaveCount(0);

    await page.fill('#aide-recherche-input', '');
    await page.locator('#aide-recherche-input').dispatchEvent('keyup');

    if (process.env.CAPTURES_AIDE_2C) {
        const dossier = process.env.CAPTURES_AIDE_2C;
        await page.evaluate(() => window.naviguerVers && window.naviguerVers('aide', 'evaluation'));
        for (const largeur of [1440, 820]) {
            await page.setViewportSize({ width: largeur, height: 900 });
            for (const id of ['liste-evaluations', 'annoter-evaluer']) {
                const carte = page.locator(`#accordeon-aide-${id}`);
                if (!(await carte.locator('.accordeon-contenu').isVisible())) await carte.locator('.accordeon-header').click();
                await carte.scrollIntoViewIfNeeded();
                await page.waitForTimeout(200);
                await carte.screenshot({ path: path.join(dossier, `aide-${id}-${largeur}.png`) });
            }
            // La page ne défile pas de côté.
            expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
        }
    }

    expect(erreurs).toEqual([]);
});
