import { test, expect } from '@playwright/test';
import { ouvrirCopie } from './harness/banc-copie-annotation.js';

// CONSIGNE DU 31 OCT. 2026, PARTIE F — MÊME ORDRE AUX TROIS EN-TÊTES : à gauche la poignée, le nom, l'engrenage ;
// à droite ↔ ↕ − (Annotation : − seul). L'engrenage était à gauche du nom dans Tampons et Codes, et le nom de Codes, centré.
const lire = (page, id) => page.evaluate((id) => {
    const b = document.querySelector(`#${id} .palette-flottante-barre`);
    const r = (el) => el.getBoundingClientRect();
    const grip = b.querySelector('.palette-grip');
    const titre = b.querySelector('.palette-flottante-titre');
    const engrenage = b.querySelector('img[src*="icon-gear"]').closest('button');
    const droite = [...b.querySelector('.palette-barre-droite').querySelectorAll('button')];
    return {
        gauche: [...b.querySelector('.palette-barre-gauche').children].map((e) => e.tagName),
        grip: r(grip).left - r(b).left,
        ordre: r(grip).right <= r(titre).right && r(titre).right <= r(engrenage).left,
        ecartEngrenage: r(engrenage).left - r(titre).right,
        droite: droite.map((d) => d.textContent),
        collee: Math.abs(r(droite[droite.length - 1]).right - r(b).right) < 16
    };
}, id);

test('les trois en-têtes ont le même ordre', async ({ page }) => {
    await ouvrirCopie(page);
    await page.evaluate(() => {
        if (!document.getElementById('travaux-palette-tampons')) window.travauxOutils.togglePaletteAutocollants();
        if (!document.getElementById('travaux-palette-erreurs-fr')) window.travauxOutils.togglePaletteErreursFrancais();
    });
    const fleches = ['↔︎', '↕︎', '−'];
    // Seule la palette Codes a le bouton de la version compacte, une icône sans texte (consigne du 1er nov. 2026, partie B).
    for (const [id, droite] of [['travaux-palette-flottante', ['−']], ['travaux-palette-tampons', fleches], ['travaux-palette-erreurs-fr', ['↔︎', '↕︎', '', '−']]]) {
        const e = await lire(page, id);
        expect(e.gauche).toEqual(['SPAN', 'BUTTON']);
        expect(e.ordre).toBe(true);
        expect(e.ecartEngrenage).toBeLessThan(10);  // le nom de Codes n'est plus centré
        expect(e.grip).toBeLessThan(20);
        expect(e.droite).toEqual(droite);
        expect(e.collee).toBe(true);
    }
});
