import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// LES MOTS DE « CONFLIT DE NOM » (js/modal-doublon.js), VALIDÉS PAR GRÉGOIRE (8 oct. 2026, 9 h 52)
//
// Trouvés en passant la porte de #967 : la fenêtre disait « Une echelle de performance portant
// le nom "IDME 4 niv" existe deja », et « La ressource existante sera ecrasee par la nouvelle ».
// Mots validés : « Une échelle de performance porte déjà le nom « IDME 4 niv ». » (même forme
// pour la grille et la cartouche) et « L'existante sera remplacée par la nouvelle, si rien ne
// l'emploie. Cette action est irréversible. »
//
// Le cas de l'échelle se joue par le vrai geste (« + Nouvelle échelle », le nom de l'exemple,
// « Créer l'échelle ») ; la grille et la cartouche, par la fenêtre elle-même, avec leur type.
// Le texte est lu tel que l'écran le rend (espaces insécables ramenés à des espaces).
// Noms fictifs, sauf « IDME 4 niv », l'exemple que fournit Labo Codex.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrirDemo(page) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
}

const lire = (page, selecteur) => page.evaluate((s) =>
    document.querySelector(s).textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim(), selecteur);
const OUVERTURE = '#modalConflitDoublon .modal-section p';
const REMPLACER = '#btnDoublonEcraser';

test('échelle, par le vrai geste : la fenêtre dit les mots validés', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'echelle-performance'));
    await pause(page, 800);
    await page.locator('button[data-action="creerNouvelleEchelle"]:visible').first().click();
    await pause(page, 800);
    await page.locator('#nomEchelleTemplate').fill('IDME 4 niv');
    await page.evaluate(() => document.getElementById('btnCreerEchelle').click());
    await pause(page, 800);
    expect(await page.evaluate(() => document.getElementById('modalConflitDoublon')?.classList.contains('actif')),
        'la fenêtre « Conflit de nom » est ouverte').toBe(true);

    expect(await lire(page, OUVERTURE)).toBe('Une échelle de performance porte déjà le nom « IDME 4 niv ».');
    // La phrase sous « Remplacer l'existante », dans le même bloc que son bouton.
    const sousRemplacer = await page.evaluate((s) =>
        document.querySelector(s).parentElement.querySelector('p').textContent.replace(/\s+/g, ' ').trim(), REMPLACER);
    expect(sousRemplacer).toBe('L\'existante sera remplacée par la nouvelle, si rien ne l\'emploie. Cette action est irréversible.');
    expect(await page.evaluate((s) => document.querySelector(s).parentElement.querySelector('p strong').textContent, REMPLACER),
        'la seconde phrase reste en gras').toBe('Cette action est irréversible.');
    await page.evaluate(() => document.getElementById('btnDoublonAnnuler').click());
});

for (const [type, attendu] of [
    ['grille', 'Une grille de critères porte déjà le nom « Modèle fictif du banc ».'],
    ['cartouche', 'Une cartouche de rétroaction porte déjà le nom « Modèle fictif du banc ».']
]) {
    test(`${type} : l'ouverture nomme le type avec ses accents`, async ({ page }) => {
        test.setTimeout(60000);
        await ouvrirDemo(page);
        await page.evaluate((t) => { window.afficherModalDoublon(t, 'Modèle fictif du banc'); }, type);
        await pause(page, 400);
        expect(await lire(page, OUVERTURE)).toBe(attendu);
    });
}
