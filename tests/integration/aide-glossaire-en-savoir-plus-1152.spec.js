import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =====================================================================
// #1152, LOT 3 — « EN SAVOIR PLUS » MÈNE À LA FICHE DU GLOSSAIRE
// =====================================================================
//
// Consigne du lot 3 (plans de travail/CONSIGNE-LOT-2026-10-28-aide-lot-3-un-seul-glossaire.md, §2.4 et §4) :
// le dossier d'audit l'avait lu, pas vu — `afficherTermeGlossaire` ouvrait l'Aide sur sa première partie
// (Commencer), alors que le glossaire est dans Référence, sous un accordéon fermé, et n'est rendu qu'à
// l'ouverture de Référence. Le geste : un terme souligné dans une aide contextuelle, « En savoir plus ».
// Rouge avant le correctif d'`accompagnement.js` (mesuré le 28 oct. 2026).
//
// Lecture seule : ce fichier ne pose ni ne retire aucune clé de stockage.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

test('#1152 · lot 3 : un terme souligné d\'une aide, « En savoir plus », ouvre Aide › Référence sur sa fiche', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherAideContextuelle === 'function' && !!window.accompagnement);

    // L'aide contextuelle des grilles : son texte porte des termes du glossaire, soulignés à l'affichage.
    await page.evaluate(() => window.afficherAideContextuelle('construction-grilles'));
    const modal = page.locator('.aide-contextuelle-modal.active');
    await expect(modal).toBeVisible();
    const terme = modal.locator('[data-glossaire]').first();
    await expect(terme).toBeVisible();
    const cle = await terme.getAttribute('data-glossaire');
    expect(cle).toBeTruthy();

    await terme.click();
    const micro = page.locator('#glossaire-micropopup');
    await expect(micro).toBeVisible();
    await micro.getByRole('button', { name: 'En savoir plus' }).click();

    // L'aide contextuelle se referme : elle couvrirait la fiche.
    await expect(page.locator('.aide-contextuelle-modal.active')).toHaveCount(0);
    // Aide › Référence, le glossaire ouvert, la fiche du terme à l'écran.
    await expect(page.locator('#section-aide')).toHaveClass(/\bactive\b/);
    await expect(page.locator('#aide-reference')).toHaveClass(/\bactive\b/);
    await expect(page.locator('#aide-commencer')).not.toHaveClass(/\bactive\b/);
    const fiche = page.locator(`#glossaire-${cle}`);
    await expect(fiche).toBeVisible();
    await expect(fiche).toBeInViewport();

    expect(erreurs).toEqual([]);
});
