import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE — bug du 20 octobre 2026 (Grégoire, 1.209.0) : « Le compte des erreurs ne se fait pas
// automatiquement. » Des codes `errfr_*` posés sur la copie, la palette CODES fermée, et
// « Nombre d'erreurs » restait à 0 : `mettreAJourCompteursErreurs` (travaux-outils.js) commençait
// par `if (!palette) return;`, et les badges de la palette tenaient le champ de l'évaluation en otage.
// Le banc #700 ne le voyait pas : il crée lui-même une palette factice.
//
// LE BANC. Même montage que `erreurs-700-…`, SANS palette : la vraie fonction, par le vrai évènement
// (`travaux-annotation-modifiee`) et par l'appel direct d'avant sauvegarde.

async function monter(page) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.travauxOutils && typeof window.travauxOutils.mettreAJourCompteursErreurs === 'function'
        && window.travauxAnnotation && typeof window.travauxAnnotation.getAnnotationCourante === 'function');
    await page.evaluate(() => {
        const pal = document.getElementById('travaux-palette-erreurs-fr');
        if (pal) pal.remove();
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'eval_erreurs_CPF';
        input.value = '0';
        document.body.appendChild(input);

        window.__annotCPF = null;
        window.travauxAnnotation.getAnnotationCourante = function () { return window.__annotCPF; };
        window.__copieCPF = function (fichierId, nbCodes) {
            const shapes = [];
            for (let i = 0; i < nbCodes; i++) shapes.push({ type: i % 2 ? 'errfr_accord' : 'errfr_syntaxe', x: i, y: i });
            window.__annotCPF = { id: 'A_' + fichierId, fichierId, pages: { 1: { shapes } } };
            window.dispatchEvent(new CustomEvent('travaux-annotation-modifiee'));
            return document.getElementById('eval_erreurs_CPF').value;
        };
    });
}

test('Palette CODES fermée · cinq codes posés : « Nombre d\'erreurs » passe à 5', async ({ page }) => {
    await monter(page);
    const r = await page.evaluate(() => ({
        paletteAbsente: !document.getElementById('travaux-palette-erreurs-fr'),
        champ: window.__copieCPF('FTCPF', 5)
    }));
    // AVANT : { paletteAbsente: true, champ: '0' }.
    expect(r).toEqual({ paletteAbsente: true, champ: '5' });
});

test('Palette CODES fermée · l\'appel d\'avant sauvegarde relit les codes, puis tous retirés : retour à 0', async ({ page }) => {
    await monter(page);
    const r = await page.evaluate(() => {
        // Codes déjà sur la copie à l'ouverture, aucun évènement encore reçu.
        window.__annotCPF = { id: 'A_FTCPF', fichierId: 'FTCPF', pages: { 1: { shapes: [{ type: 'errfr_accord' }, { type: 'errfr_syntaxe' }] } } };
        window.travauxOutils.mettreAJourCompteursErreurs();
        const avantSauvegarde = document.getElementById('eval_erreurs_CPF').value;
        return { avantSauvegarde, retires: window.__copieCPF('FTCPF', 0) };
    });
    expect(r).toEqual({ avantSauvegarde: '2', retires: '0' });
});
