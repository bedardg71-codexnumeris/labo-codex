import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =====================================================================
// #1152, LOT 4 — LES TROUS COMBLÉS (consigne plans de travail/CONSIGNE-LOT-2026-10-28-aide-lot-4-les-trous.md, §2)
// =====================================================================
//
// Le pendant OBSERVABLE de `tests/unit/sentinelle-aide-2026-10-28-lot-4.test.js` : la recherche de l'Aide trouve
// « orthopédagogie » dans « Les rencontres d'un service d'orthopédagogie » (le Suivi) et « table de correspondance » dans
// « Ce qui sort de l'application » (Codex et archives), deux entrées neuves.
//
// BREAK-TEST (29 oct. 2026) : « table de correspondance » retiré de `ce-qui-sort` → rouge (0 résultat au lieu de 1) ; arbre
// restauré, sha256 vérifié.
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

test('#1152 lot 4 · la recherche trouve « orthopédagogie » et « table de correspondance » dans les deux entrées neuves', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherSection === 'function');
    await page.evaluate(() => window.afficherSection('aide'));

    const resultats = page.locator('#aide-recherche-resultats');
    for (const [mot, partie, id] of [['orthopédagogie', 'suivi', 'rencontres'], ['table de correspondance', 'codex-archives', 'ce-qui-sort']]) {
        await chercher(page, mot);
        await expect(resultats.locator(`button[data-param="accordeon-aide-${id}"]`), mot).toHaveCount(1);
        await expect(page.locator(`#aide-${partie} > #accordeon-aide-${id}`), mot).toBeVisible();
    }

    await page.fill('#aide-recherche-input', '');
    await page.locator('#aide-recherche-input').dispatchEvent('keyup');
    expect(erreurs).toEqual([]);
});
