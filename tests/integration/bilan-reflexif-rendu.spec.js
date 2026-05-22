import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Chantier I (Cat-B Track 4) — Test Playwright rendu DOM bilan-reflexif.
// Complète les sentinelles exports déjà en place : vérifie que la vue éditeur
// produit effectivement un DOM utilisable (titre, préambule, blocs Likert,
// barre d'actions). Attrape les régressions silencieuses post-refactor où
// `rendreEditeur()` se charge sans erreur mais produit un DOM vide ou cassé.

test('Chantier I · bilan-reflexif rend la vue éditeur (titre + préambule + blocs)', async ({ page }) => {
    const erreurs = [];
    const patternsAttendus = [
        /version\.json.*access control/i,
        /Cross origin requests are only supported/i,
        /Not allowed to load local resource.*\.(svg|png)/i
    ];
    const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

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

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Initialiser le module — peuple #bilan-conteneur-principal puis
    // appelle rendreEditeur() via afficherVue('editeur') par défaut.
    const resultat = await page.evaluate(() => {
        if (typeof window.initialiserBilanReflexif !== 'function') {
            return { erreur: 'window.initialiserBilanReflexif absent' };
        }
        window.initialiserBilanReflexif();

        const vue = document.getElementById('bilan-vue-editeur');
        if (!vue) return { erreur: '#bilan-vue-editeur absent du DOM' };

        const html = vue.innerHTML;
        return {
            longueur: html.length,
            aChampTitre: !!vue.querySelector('#bilan-titre'),
            aChampPreambule: !!vue.querySelector('#bilan-preambule'),
            aBoutonExport: html.includes('BilanReflexif.exporterTexte'),
            aBoutonImport: html.includes('BilanReflexif.ouvrirModaleImport'),
            nbBlocs: vue.querySelectorAll('.bilan-bloc, [data-action*="toggleBloc"]').length,
            nbQuestions: vue.querySelectorAll('.bilan-question').length,
            aPanneauAide: html.includes('Comment distribuer ce questionnaire')
        };
    });

    expect(resultat.erreur, `Erreur init : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.longueur).toBeGreaterThan(1000);
    expect(resultat.aChampTitre).toBe(true);
    expect(resultat.aChampPreambule).toBe(true);
    expect(resultat.aBoutonExport).toBe(true);
    expect(resultat.aBoutonImport).toBe(true);
    expect(resultat.nbBlocs).toBeGreaterThan(0);
    expect(resultat.nbQuestions).toBeGreaterThan(0);
    expect(resultat.aPanneauAide).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
