import { test, expect } from '@playwright/test';
import { ouvrirCopie, compteAnnotations, pointCanevas, attendre } from './harness/banc-copie-annotation.js';

// =======================================================================
// 15 nov. 2026 — UNE CONFIRMATION AVANT « EFFACER LA PAGE »
// =======================================================================
//
// Commentaire de Grégoire (iPad, 8 h 54) : il a touché « Effacer la page » deux fois sans
// qu'on lui demande rien. Son codex était à jour : `Codex.proposerAvantSuppression`, qui
// précède l'effacement, ne s'affiche alors pas.
//
// Une seule question à l'écran :
//  - codex à jour : la confirmation, aux mots approuvés par Grégoire ;
//  - codex absent ou en retard : la fenêtre du codex est la question, sans seconde fenêtre.
// Dans les deux cas, le retour arrière rétablit la page.

const fenetre = (page) => page.locator('#overlay-ui-dialogue');
const cliquer = (page, texte) => page.locator('#overlay-ui-dialogue .modal-actions button', { hasText: texte }).click();
const effacer = (page) => page.evaluate(() => { window.travauxAnnotation.effacerPage(); });

/** Trace `n` lignes sur la copie du banc. */
async function tracer(page, n) {
    await page.evaluate(() => window.travauxOutils.setOutilActif('fleche'));
    for (let i = 0; i < n; i++) {
        const a = await pointCanevas(page, 0.2, 0.3 + i * 0.15);
        const b = await pointCanevas(page, 0.6, 0.3 + i * 0.15);
        await page.mouse.move(a.x, a.y);
        await page.mouse.down();
        await page.mouse.move(b.x, b.y, { steps: 3 });
        await page.mouse.up();
    }
    expect((await compteAnnotations(page)).shapes).toBe(n);
}

test.describe('15 nov. 2026 — « Effacer la page » demande avant d’effacer', () => {
    test.setTimeout(120000);

    test('codex à jour : la confirmation ; « Annuler » garde tout, « Effacer » efface, le retour arrière rétablit', async ({ page }) => {
        const suivi = await ouvrirCopie(page);
        await page.evaluate(() => { window.Codex.estAJour = () => true; window.Codex.proposerAvantSuppression = async () => true; });
        await tracer(page, 3);

        await effacer(page);
        await expect(fenetre(page)).toBeVisible();
        await expect(page.locator('#ui-dialogue-titre')).toHaveText('Effacer les 3 annotations de cette page ?');
        await expect(fenetre(page).locator('.modal-section p')).toHaveText('Tu pourras les rétablir avec la flèche de retour arrière.');
        expect(await fenetre(page).locator('.modal-actions button').allTextContents()).toEqual(expect.arrayContaining(['Annuler', 'Effacer']));
        expect(await fenetre(page).locator('.modal-actions button').count()).toBe(2);
        expect((await compteAnnotations(page)).shapes).toBe(3);   // rien n'est effacé pendant la question

        await cliquer(page, 'Annuler');
        await attendre(page, 300);
        expect((await compteAnnotations(page)).shapes).toBe(3);

        await effacer(page);
        await cliquer(page, 'Effacer');
        await expect.poll(async () => (await compteAnnotations(page)).shapes).toBe(0);
        await expect(fenetre(page)).toHaveCount(0);

        await page.evaluate(() => window.travauxAnnotation.annuler());
        expect((await compteAnnotations(page)).shapes).toBe(3);
        expect(suivi.erreurs).toEqual([]);
    });

    test('une seule annotation : la question au singulier', async ({ page }) => {
        await ouvrirCopie(page);
        await page.evaluate(() => { window.Codex.estAJour = () => true; window.Codex.proposerAvantSuppression = async () => true; });
        await tracer(page, 1);
        await effacer(page);
        await expect(page.locator('#ui-dialogue-titre')).toHaveText("Effacer l'annotation de cette page ?");
        await expect(fenetre(page).locator('.modal-section p')).toHaveText('Tu pourras la rétablir avec la flèche de retour arrière.');
        await cliquer(page, 'Annuler');
    });

    test('sans codex : la fenêtre du codex est la seule question ; le retour arrière rétablit', async ({ page }) => {
        const suivi = await ouvrirCopie(page);
        await tracer(page, 2);

        await effacer(page);
        await expect(page.locator('#ui-dialogue-titre')).toHaveText('Écrire un codex avant de supprimer ?');
        // Les mots de la fenêtre : rien n'y dit « pour de bon », le retour arrière rétablit la page.
        const mots = (await fenetre(page).locator('.modal-section').innerText()).replace(/\s+/g, ' ').trim();
        expect(mots).toBe('« Effacer la page » efface les annotations de cette page. Tu pourras les rétablir avec la flèche de retour arrière. Ton codex à jour pourra te les rendre, jusqu\'à ta mise à jour suivante.');
        await cliquer(page, 'Annuler');
        await attendre(page, 300);
        await expect(fenetre(page)).toHaveCount(0);
        expect((await compteAnnotations(page)).shapes).toBe(2);

        await effacer(page);
        await cliquer(page, 'Supprimer sans codex');
        await expect.poll(async () => (await compteAnnotations(page)).shapes).toBe(0);
        await attendre(page, 300);
        await expect(fenetre(page)).toHaveCount(0);   // aucune seconde question

        await page.evaluate(() => window.travauxAnnotation.annuler());
        expect((await compteAnnotations(page)).shapes).toBe(2);
        expect(suivi.erreurs).toEqual([]);
    });
});
