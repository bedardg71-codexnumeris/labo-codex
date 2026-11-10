import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// LE REGISTRE DES PARCOURS SUR MAIN : LEUR NOMBRE, LEUR ORDRE, CEUX QUI NE SE FONT PAS SUR TÉLÉPHONE
// (groupe 3, 9 nov. 2026 ; relecture neuve de la fusion du groupe 2).
//
// Les bancs des parcours lisent le nombre de parcours sur le registre au lieu de l'écrire : un parcours manquant
// ou mal placé passerait inaperçu chez eux. Ce banc-ci l'écrit. Un parcours qui s'ajoute le met à jour.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

const TITRES = [
    'Découvrir',
    'Mettre ta classe en place',
    'Évaluer une première production',
    'Recevoir les productions, rendre tes rétroactions',
    'Monter ton cours',
    "Mettre tes données à l'abri",
    'Lire ta classe et intervenir',
    'Automatiser tes commentaires',
    'Mettre en place ta notation alternative'
];

test('neuf parcours, dans l’ordre du panneau ; le cinquième et le huitième pour grand écran seulement', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(String(e)));
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.goto(indexHtml);
    await attendreApplication(page);
    const reg = await page.evaluate(() => window.Assistance.parcours().map((d) => ({
        titre: d.titre, grandEcran: !!d.grandEcranSeulement, refus: typeof d.refus === 'function'
    })));
    expect(reg.map((d) => d.titre)).toEqual(TITRES);
    expect(reg.filter((d) => d.grandEcran).map((d) => d.titre)).toEqual(['Monter ton cours', 'Automatiser tes commentaires']);
    // La condition d'entrée s'appelle `refus` partout (unifié aux groupes 2 et 3) : aucun parcours n'en a d'autre nom.
    expect(await page.evaluate(() => window.Assistance.parcours().filter((d) => 'condition' in d).length)).toBe(0);
    // Les pastilles du panneau disent 1 à 9 ; le menu, « 1 sur 9 ».
    await page.evaluate(() => document.getElementById('btn-assistance-menu').click());
    await expect(page.locator('.assistance-parcours-item .assistance-pastille')).toHaveText(TITRES.map((_, i) => String(i + 1)));
    await expect(page.locator('#assistance-menu-rang')).toHaveText('1 sur ' + TITRES.length);
    expect(erreurs).toEqual([]);
});
