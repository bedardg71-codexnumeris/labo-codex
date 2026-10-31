import { test, expect } from '@playwright/test';
import { ouvrirCopie, compteAnnotations, pointCanevas } from './harness/banc-copie-annotation.js';

// PORTE #1209 — LE TAMPON SE POSE DU PREMIER TOUCHER, ET SA TUILE EST SURLIGNÉE.
//
// Rapport de Grégoire, 29 oct. 2026, 11 h 36 (1.223.0, Safari, iPad) : 11:34:43 choix du tampon,
// 11:34:45 toucher sur `#travaux-canvas-document` (pas celui d'annotation), 11:34:46 il choisit un outil,
// et le tampon ne se pose qu'ensuite.
//
// CE QUI SE PASSAIT. `setAutocollantActif` changeait l'outil sans émettre `travaux-outil-change`, l'événement
// qui rend le toucher au canevas d'annotation. L'outil à l'ouverture étant `position` (canevas en
// `pointer-events: none`), le premier toucher traversait jusqu'au canevas du document.
//
// ⚠ LA SPEC #1123 NE POUVAIT PAS LE VOIR : elle envoie ses événements DIRECTEMENT au canevas, ce qui
// contourne `pointer-events`. Ici, un vrai clic de la souris : c'est le navigateur qui choisit la cible.

const choisirTampon = (page) => page.evaluate(() => {
    if (!document.getElementById('travaux-palette-tampons')) window.travauxOutils.togglePaletteAutocollants();
    const el = document.querySelector('#travaux-palette-tampons .travaux-autocollant-item[data-action="travauxOutils.setAutocollantActif"]');
    el.click();
    return el.dataset.param;
});
const clicVrai = async (page) => {
    const p = await pointCanevas(page, 0.3, 0.5);
    await page.mouse.click(p.x, p.y);
};
const tuilesActives = (page) => page.evaluate(() =>
    [...document.querySelectorAll('#travaux-palette-tampons .travaux-autocollant-item.actif')].map((el) => el.dataset.param));

test.describe('#1209 · le tampon choisi se pose du premier toucher', () => {
    test('choisir un tampon à l’ouverture, puis un vrai clic : le tampon se pose', async ({ page }) => {
        const suivi = await ouvrirCopie(page);
        expect(await page.evaluate(() => window.travauxOutils.getOutilActif().id)).toBe('position');
        await choisirTampon(page);
        await clicVrai(page);
        expect(await compteAnnotations(page)).toEqual({ shapes: 0, stickers: 1, strokes: 0 });
        expect(suivi.erreurs).toEqual([]);
    });

    test('le tampon de jeton : même chemin, même premier toucher', async ({ page }) => {
        await ouvrirCopie(page);
        await page.evaluate(() => window.travauxOutils.activerTamponJeton('delai'));
        await clicVrai(page);
        expect((await compteAnnotations(page)).stickers).toBe(1);
    });

    test('la tuile du tampon choisi est surlignée, et une seule ; choisir un autre outil l’éteint', async ({ page }) => {
        await ouvrirCopie(page);
        const id = await choisirTampon(page);
        expect(await tuilesActives(page)).toEqual([id]);
        await page.evaluate(() => window.travauxOutils.setOutilActif('stylo'));
        expect(await tuilesActives(page)).toEqual([]);
    });

    test('témoin : un code posait déjà du premier toucher, et Déplacer la page rend le toucher à la page', async ({ page }) => {
        await ouvrirCopie(page);
        await page.evaluate(() => {
            if (!document.getElementById('travaux-palette-erreurs-fr')) window.travauxOutils.togglePaletteErreursFrancais();
            document.querySelector('.travaux-errfr-item').click();
        });
        await clicVrai(page);
        expect((await compteAnnotations(page)).shapes).toBe(1);

        await choisirTampon(page);
        await page.evaluate(() => window.travauxOutils.setOutilActif('position'));
        expect(await page.evaluate(() => document.getElementById('travaux-canvas-annotation').style.pointerEvents)).toBe('none');
    });
});
