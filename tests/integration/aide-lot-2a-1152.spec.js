import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =====================================================================
// #1152, LOT 2a — COMMENCER ET CADRE (audit de l'Aide du 24 oct. 2026 ; remesure du 27 oct.)
// =====================================================================
//
// Le pendant OBSERVABLE de `tests/unit/sentinelle-aide-2026-10-27-lot-2a.test.js` :
//   · la recherche de l'Aide trouve les deux entrées neuves, « La bibliothèque » et « Les chaînes d'étapes » ;
//   · la popup « Comment fonctionne la bibliothèque » et l'entrée de l'Aide montrent le même texte, lu dans la page.
// CAPTURES_AIDE_2A=<dossier> enregistre, à 1 440 et 820 px, l'en-tête (le bouton du mode anonymisé) et les deux
// entrées neuves ouvertes.
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

test('#1152 lot 2a · la recherche trouve les deux entrées neuves ; la popup et l\'Aide disent la même bibliothèque', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherSection === 'function' && typeof window.afficherAideContextuelle === 'function');
    await page.evaluate(() => window.afficherSection('aide'));
    await expect(page.locator('#aide-commencer')).toHaveClass(/\bactive\b/);

    // 1. La recherche.
    const resultats = page.locator('#aide-recherche-resultats');
    await chercher(page, 'bibliothèque');
    await expect(resultats.locator('button[data-param="accordeon-aide-bibliotheque"]')).toHaveCount(1);
    await chercher(page, 'chaînes d\'étapes');
    await expect(resultats.locator('button[data-param="accordeon-aide-chaines-etapes"]')).toHaveCount(1);
    await page.fill('#aide-recherche-input', '');
    await page.locator('#aide-recherche-input').dispatchEvent('keyup');

    // 2. Le même texte des deux côtés, tel que la page l'affiche.
    const entree = await page.locator('#aide-bibliotheque-listes li').allTextContents();
    expect(entree.length).toBe(9);
    await page.evaluate(() => window.afficherAideContextuelle('bibliotheque-fonctionnement'));
    const modal = page.locator('.aide-contextuelle-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Comment fonctionne la bibliothèque');
    const popup = await modal.locator('li').allTextContents();
    const net = (l) => l.map((t) => t.replace(/\s+/g, ' ').trim());
    expect(net(popup)).toEqual(net(entree));
    await page.evaluate(() => window.fermerAideContextuelle && window.fermerAideContextuelle());

    // 3. Les captures pour la demande de relecture.
    if (process.env.CAPTURES_AIDE_2A) {
        const dossier = process.env.CAPTURES_AIDE_2A;
        for (const largeur of [1440, 820]) {
            await page.setViewportSize({ width: largeur, height: 900 });
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.waitForTimeout(300);
            await page.screenshot({ path: path.join(dossier, `en-tete-mode-anonymise-${largeur}.png`), clip: { x: 0, y: 0, width: largeur, height: 160 } });
            for (const id of ['bibliotheque', 'chaines-etapes']) {
                const carte = page.locator(`#accordeon-aide-${id}`);
                if (!(await carte.locator('.accordeon-contenu').isVisible())) await carte.locator('.accordeon-header').click();
                await carte.scrollIntoViewIfNeeded();
                await page.waitForTimeout(200);
                await carte.screenshot({ path: path.join(dossier, `aide-${id}-${largeur}.png`) });
            }
        }
    }

    expect(erreurs).toEqual([]);
});
