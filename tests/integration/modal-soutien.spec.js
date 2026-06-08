import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Bouton « Soutenir Labo Codex » dans l'entête (consigne-bouton-soutien.md) :
// présence du bouton, ouverture de la modale, contenu/liens conformes, a11y
// (focus déplacé, Échap ferme, clic arrière-plan ferme).

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function brancherErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
}

test('bouton Soutenir : ouvre la modale avec le bon contenu + liens', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(400);

    // Bouton d'entête : dans le 1er cluster, juste après le bouton bug (révision),
    // en icône masquée teintée (.ico-coeur), pas un <img>.
    const bouton = page.locator('.entete-utilitaires button[data-action="ouvrirModalSoutien"]');
    await expect(bouton).toHaveCount(1);
    await expect(bouton.locator('span.ico-coeur')).toHaveCount(1);
    const positionOk = await page.evaluate(() => {
        const btn = document.querySelector('.entete-utilitaires button[data-action="ouvrirModalSoutien"]');
        const prev = btn && btn.previousElementSibling;
        return !!(prev && prev.getAttribute('data-action') === 'ouvrirModalRapportBug');
    });
    expect(positionOk).toBe(true); // précédé du bouton bug

    await bouton.click();

    const modal = page.locator('#modalSoutien');
    await expect(modal).toHaveClass(/\bactif\b/);
    await expect(page.locator('#modalSoutien-titre')).toHaveText('Soutenir Labo Codex');

    // Sections attendues.
    await expect(modal).toContainText('S\'impliquer dans la communauté');
    await expect(modal).toContainText('Suivre le projet');
    await expect(modal).toContainText('Soutenir financièrement');
    await expect(modal).toContainText('Voici plusieurs façons de contribuer');
    await expect(modal).toContainText('Offrir un abonnement de soutien'); // item ajouté (révision)

    // CoP : lien externe AQPC (la CoP n'est pas une section interne) — sécurité rel/target.
    const lienCoP = modal.locator('a[href="https://www.aqpc.qc.ca/fr/cop-labocodex"]');
    await expect(lienCoP).toHaveCount(1);
    await expect(lienCoP).toHaveAttribute('target', '_blank');
    await expect(lienCoP).toHaveAttribute('rel', 'noopener noreferrer');

    // Liens du portail Codex Numeris câblés (révision) — destinations exactes + rel.
    for (const href of [
        'https://codexnumeris.org/#/portal/signup/free',
        'https://codexnumeris.org/#/portal/signup/68d7cf7691267900011c2b4c/yearly',
        'https://codexnumeris.org/#/portal/gift',
        'https://codexnumeris.org/#/portal/support'
    ]) {
        const lien = modal.locator(`a[href="${href}"]`);
        await expect(lien).toHaveCount(1);
        await expect(lien).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(lien).toHaveAttribute('target', '_blank');
    }

    // Contact : section « Nous écrire » avec un lien mailto.
    await expect(modal).toContainText('demande de présentation');
    const mailto = modal.locator('a[href="mailto:labo@codexnumeris.org"]');
    await expect(mailto).toHaveCount(1);
    await expect(mailto).toHaveText('labo@codexnumeris.org');

    // Focus déplacé dans la modale (bouton de fermeture).
    const focusDansModale = await page.evaluate(() => {
        const m = document.getElementById('modalSoutien');
        return !!(m && document.activeElement && m.contains(document.activeElement));
    });
    expect(focusDansModale).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('modale Soutien : Échap et clic sur l\'arrière-plan ferment', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(400);

    // Échap.
    await page.locator('button[data-action="ouvrirModalSoutien"]').first().click();
    await expect(page.locator('#modalSoutien')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('#modalSoutien')).toHaveCount(0);

    // Clic sur l'arrière-plan (l'overlay lui-même, pas le contenu).
    await page.locator('button[data-action="ouvrirModalSoutien"]').first().click();
    await expect(page.locator('#modalSoutien')).toHaveCount(1);
    await page.locator('#modalSoutien').click({ position: { x: 8, y: 8 } });
    await expect(page.locator('#modalSoutien')).toHaveCount(0);
});
