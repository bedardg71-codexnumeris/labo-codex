import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #700 (16 septembre 2026) — RETIRER TOUTES LES ANNOTATIONS D'UNE COPIE RAMÈNE « NOMBRE D'ERREURS » À 0,
// SANS JAMAIS ÉCRASER UNE SAISIE MANUELLE.
//
// `mettreAJourCompteursErreurs` (travaux-outils.js) ne propageait le total des codes `errfr_*` vers
// `eval_erreurs_*` que si `total > 0` — garde délibérée (sentinelle `erreurs-saisie-manuelle-preservee`) :
// sans elle, un compte tapé à la main, sans tampons, était écrasé par 0, notamment avant chaque sauvegarde.
// Effet de bord : une copie « nettoyée » gardait le dernier total dans le champ, et la note se calcule sur ce
// champ. Décision (Cowork, dite à Grégoire, 16 sept.) : le champ suit les annotations jusqu'à 0 TANT QU'IL
// CONTIENT ENCORE le total qu'elles y ont écrit, POUR CETTE COPIE ; une valeur tapée n'est jamais écrasée.
//
// LE BANC. La vraie fonction, appelée par le vrai évènement (`travaux-annotation-modifiee`, que la
// sauvegarde différée des annotations émet). L'annotation courante est fournie en enveloppant
// `travauxAnnotation.getAnnotationCourante` : poser/retirer des tampons, c'est changer ses formes. Le trajet
// complet (copie, grille algorithmique, palette) n'est pas rejoué : il ne change rien à ce que la fonction
// lit et écrit, et le monter coûterait une grille algorithmique entière.

async function monter(page) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.travauxOutils && typeof window.travauxOutils.mettreAJourCompteursErreurs === 'function'
        && window.travauxAnnotation && typeof window.travauxAnnotation.getAnnotationCourante === 'function');
    await page.evaluate(() => {
        if (!document.getElementById('travaux-palette-erreurs-fr')) {
            const pal = document.createElement('div');
            pal.id = 'travaux-palette-erreurs-fr';
            document.body.appendChild(pal);
        }
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'eval_erreurs_C700';
        document.body.appendChild(input);

        window.__annot700 = null;
        window.travauxAnnotation.getAnnotationCourante = function () { return window.__annot700; };
        // Les gestes du banc : la copie ouverte et ses tampons, la saisie au clavier, l'évènement émis.
        window.__copie700 = function (fichierId, nbTampons) {
            const shapes = [];
            for (let i = 0; i < nbTampons; i++) shapes.push({ type: i % 2 ? 'errfr_accord' : 'errfr_syntaxe', x: i, y: i });
            window.__annot700 = { id: 'A_' + fichierId, fichierId, pages: { 1: { shapes } } };
            window.dispatchEvent(new CustomEvent('travaux-annotation-modifiee'));
            return document.getElementById('eval_erreurs_C700').value;
        };
        window.__taper700 = function (valeur) {
            const champ = document.getElementById('eval_erreurs_C700');
            champ.value = valeur;
            champ.dispatchEvent(new Event('input', { bubbles: true }));
        };
        // L'appel d'avant sauvegarde (`_forcerRecalculAlgorithmiqueAvantSauvegarde`) : direct, sans évènement.
        window.__avantSauvegarde700 = function () {
            window.travauxOutils.mettreAJourCompteursErreurs();
            return document.getElementById('eval_erreurs_C700').value;
        };
    });
}

test('Porte #700 · trois tampons posés, puis tous retirés : le champ retombe à 0', async ({ page }) => {
    await monter(page);
    const r = await page.evaluate(() => ({
        poses: window.__copie700('FT700', 3),
        retires: window.__copie700('FT700', 0),
        avantSauvegarde: window.__avantSauvegarde700()
    }));
    // AVANT : { poses: '3', retires: '3', avantSauvegarde: '3' } — le compte fantôme partait dans la note.
    expect(r).toEqual({ poses: '3', retires: '0', avantSauvegarde: '0' });
});

test('Porte #700 · garde : une saisie manuelle sans tampons n\'est écrasée ni par l\'évènement ni par l\'appel d\'avant sauvegarde', async ({ page }) => {
    await monter(page);
    const r = await page.evaluate(() => {
        window.__copie700('FT700', 0);
        window.__taper700('12');
        return { evenement: window.__copie700('FT700', 0), avantSauvegarde: window.__avantSauvegarde700() };
    });
    expect(r).toEqual({ evenement: '12', avantSauvegarde: '12' });
});

test('Porte #700 · garde : une saisie manuelle APRÈS des tampons survit à leur retrait', async ({ page }) => {
    await monter(page);
    const r = await page.evaluate(() => {
        const poses = window.__copie700('FT700', 3);
        window.__taper700('7');
        return { poses, retires: window.__copie700('FT700', 0), avantSauvegarde: window.__avantSauvegarde700() };
    });
    expect(r).toEqual({ poses: '3', retires: '7', avantSauvegarde: '7' });
});

test('Porte #700 · garde : le même champ sert à toutes les copies — un total écrit pour une copie n\'efface pas la saisie d\'une autre', async ({ page }) => {
    await monter(page);
    const r = await page.evaluate(() => {
        // Copie A : trois tampons, le champ vaut 3.
        const copieA = window.__copie700('FT700A', 3);
        // Copie B, sans tampons : son évaluation enregistrée porte 3, tapé à la main — le chargeur l'écrit
        // dans le même champ (evaluation-chargement.js), sans passer par le compteur.
        window.__annot700 = { id: 'A_FT700B', fichierId: 'FT700B', pages: { 1: { shapes: [] } } };
        document.getElementById('eval_erreurs_C700').value = '3';
        return { copieA, copieB: window.__copie700('FT700B', 0), avantSauvegarde: window.__avantSauvegarde700() };
    });
    expect(r).toEqual({ copieA: '3', copieB: '3', avantSauvegarde: '3' });
});
