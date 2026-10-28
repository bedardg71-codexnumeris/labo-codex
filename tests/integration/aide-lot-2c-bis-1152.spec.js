import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =====================================================================
// #1152, LOT 2c bis — LE SUIVI (audit de l'Aide du 24 oct. 2026 ; remesure du 27 oct.)
// =====================================================================
//
// Le pendant OBSERVABLE de `tests/unit/sentinelle-aide-2026-10-28-lot-2c-bis.test.js` : la recherche de l'Aide trouve
// « profil » dans « Lire le profil d'un·e étudiant·e », « report » dans « Planifier les interventions RàI » (la case de report,
// seule part gardée de « Interventions RàI avec absences motivées ») et « Recalculer les captures » dans les captures, chacune
// dans le Suivi ; les deux entrées absorbées ne sortent plus.
// CAPTURES_AIDE_2C_BIS=<dossier> enregistre, à 1 440 et 820 px, les entrées `profil-etudiant` et `planifier-rai` ouvertes.
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

/** Les ids des cartes du Suivi que la recherche montre. */
const cartesSuiviVisibles = (page) => page.locator('#aide-suivi > .carte.accordeon').evaluateAll(
    (cartes) => cartes.filter((c) => c.style.display === 'block').map((c) => c.id.replace('accordeon-aide-', '')));

test('#1152 lot 2c bis · la recherche trouve le profil, le report et le recalcul des captures dans le Suivi', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherSection === 'function');
    await page.evaluate(() => window.afficherSection('aide'));

    const resultats = page.locator('#aide-recherche-resultats');
    for (const [mot, id] of [['profil', 'profil-etudiant'], ['report', 'planifier-rai'], ['Recalculer les captures', 'snapshots']]) {
        await chercher(page, mot);
        await expect(resultats.locator(`button[data-param="accordeon-aide-${id}"]`), mot).toHaveCount(1);
        expect(await cartesSuiviVisibles(page), mot).toContain(id);
    }
    for (const id of ['guide-profil', 'rai-absences']) {
        await expect(resultats.locator(`button[data-param="accordeon-aide-${id}"]`)).toHaveCount(0);
    }

    await page.fill('#aide-recherche-input', '');
    await page.locator('#aide-recherche-input').dispatchEvent('keyup');

    if (process.env.CAPTURES_AIDE_2C_BIS) {
        const dossier = process.env.CAPTURES_AIDE_2C_BIS;
        await page.evaluate(() => window.naviguerVers && window.naviguerVers('aide', 'suivi'));
        for (const largeur of [1440, 820]) {
            await page.setViewportSize({ width: largeur, height: 900 });
            for (const id of ['profil-etudiant', 'planifier-rai']) {
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
