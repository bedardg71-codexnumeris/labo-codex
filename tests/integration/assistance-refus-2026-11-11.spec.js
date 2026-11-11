import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// LE REFUS MONTRE OÙ COMMENCER — 11 NOVEMBRE 2026 (Grégoire, sur l'iPad, 6 h 28 à 6 h 39)
// =======================================================================
// Toucher « Commencer » d'un parcours dont la condition manque ne lance rien, et le motif s'écrivait sous le bouton en
// texte ordinaire : le toucher semblait ne rien faire. Désormais, au refus, la pulsation orange des parcours va sur le
// bouton du premier parcours préalable non fait (js/assistance.js, `prealable`) ; le motif reste dessous, mot pour mot,
// et ne pulse pas.
// Break-test (11 nov.) : l'appel à `appelerPrealable` retiré du toucher → ROUGE ici (aucun bouton n'appelle).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const bouton = (page, id) => page.locator(`#assistance-parcours-liste [data-parcours="${id}"] .assistance-parcours-bouton`);
const appels = (page) => page.evaluate(() => [...document.querySelectorAll('.assistance-parcours-bouton--appel')]
    .map((b) => b.closest('[data-parcours]').dataset.parcours));

async function espaceVide(page) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.goto(indexHtml);
    await attendreApplication(page);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await attendreApplication(page);
}

test('au refus, la pulsation va au bouton du premier parcours préalable non fait ; le motif reste dessous, sans pulser', async ({ page }) => {
    await espaceVide(page);
    await page.evaluate(() => window.ouvrirPanneauAssistance());
    await expect(bouton(page, 'evaluer')).toBeVisible();
    expect(await appels(page), 'rien ne pulse avant un refus').toEqual([]);

    // « Évaluer une première production », sans classe : « Mettre ta classe en place » pulse.
    await bouton(page, 'evaluer').click();
    const motif = page.locator('[data-parcours="evaluer"] .assistance-parcours-refus');
    await expect(motif).toHaveText('Commence par « Mettre ta classe en place » : il faut une classe pour évaluer une production.');
    await expect.poll(() => appels(page)).toEqual(['classe']);
    const anim = await bouton(page, 'classe').evaluate((el) => getComputedStyle(el).animationName);
    expect(anim, 'la pulsation des parcours').toBe('parcours-pulsation');
    expect(await motif.evaluate((el) => getComputedStyle(el).animationName), 'le motif ne pulse pas').toBe('none');
    // Rien n'est lancé : le panneau reste ouvert, aucune bulle.
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    await expect(page.locator('#parcours-bulle')).toHaveCount(0);

    // Une chaîne : « Automatiser tes commentaires » demande « Évaluer… », qui demande « Mettre ta classe en place » —
    // le premier maillon non fait, et lui seul.
    await bouton(page, 'commentaires').click();
    await expect.poll(() => appels(page)).toEqual(['classe']);

    // La classe faite, le maillon suivant : « Évaluer une première production ».
    await page.evaluate(() => { window.Assistance.fermerPanneau(); window.Assistance.definirEtat('classe', 'fait', 0); window.ouvrirPanneauAssistance(); });
    await bouton(page, 'commentaires').click();
    await expect.poll(() => appels(page)).toEqual(['evaluer']);
});

test('prefers-reduced-motion : le bouton appelé porte un contour pointillé fixe', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await espaceVide(page);
    await page.evaluate(() => window.ouvrirPanneauAssistance());
    await bouton(page, 'evaluer').click();
    await expect.poll(() => bouton(page, 'classe').evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.animationName, s.outlineStyle].join(' ');
    })).toBe('none dashed');
});
