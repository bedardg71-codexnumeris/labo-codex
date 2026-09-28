import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Tests Playwright pré-refactor trimestre-v2.js (MODULES-MAP §2.4, étape 2).
// METHODE §7 productions.js note pour modules suivants : « Le Playwright est
// NÉCESSAIRE ici (changement de contexte = side-effects DOM cross-vue
// invisibles aux tests pures) ». Cible : 2 tests Playwright avant refactor.
//
// Couverture : (1) chargement IIFE dans WebKit sans erreur console,
// surface d'exports `window.X` réelle après chargement complet de tous les
// scripts. (2) `changerGroupeCoursActifV2` reste accessible et est bien une
// async function dans l'environnement browser (vs Vitest sandbox Node).

test('Défense refactor · trimestre-v2 charge dans WebKit sans erreur console', async ({ page }) => {
    const erreurs = [];

    // Limitations connues du protocole file:// en WebKit (pas des régressions
    // de l'app) : version.json est fetché en cross-origin, certains SVG icons
    // déclenchent CORS, et le helper hors-ligne fallback masque ces erreurs
    // en production. Ces patterns ne doivent pas faire échouer le test.
    const patternsAttendus = [
        /version\.json.*access control/i,
        /Cross origin requests are only supported/i,
        /Not allowed to load local resource.*\.svg/i,
        /Not allowed to load local resource.*\.png/i
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

    // Donner un délai à l'init différée (initialiserTrimestreV2 + autres)
    await page.waitForTimeout(500);

    // Aucune erreur console au chargement (filet pour régression silencieuse
    // type ReferenceError sur un export disparu lors d'une extraction).
    // Les limitations file:// connues sont filtrées ci-dessus.
    expect(erreurs, `Erreurs console détectées : ${erreurs.join(' | ')}`).toEqual([]);
});

test('Défense refactor · sentinelle exports browser trimestre-v2', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Vérifier qu'un sous-ensemble représentatif des 129 exports est défini
    // dans l'environnement browser (vs Vitest sandbox Node — les deux doivent
    // converger). Si une extraction casse le contrat avec le dispatcher
    // `data-action`, ce test l'attrape.
    const surface = await page.evaluate(() => ({
        initialiserTrimestreV2: typeof window.initialiserTrimestreV2,
        changerGroupeCoursActifV2: typeof window.changerGroupeCoursActifV2,
        changerGroupeCoursActifV2EstAsync: window.changerGroupeCoursActifV2
            ? window.changerGroupeCoursActifV2.toString().startsWith('async function')
            : false,
        sauvegarderCoursV2: typeof window.sauvegarderCoursV2,
        sauvegarderGroupeCoursV2: typeof window.sauvegarderGroupeCoursV2,
        sauvegarderHoraireV2: typeof window.sauvegarderHoraireV2,
        creerProfilEnseignantV2: typeof window.creerProfilEnseignantV2,
        peuplerDropdownGroupeCoursActif: typeof window.peuplerDropdownGroupeCoursActif,
        mettreAJourBarreContexte: typeof window.mettreAJourBarreContexte
    }));

    expect(surface.initialiserTrimestreV2).toBe('function');
    expect(surface.changerGroupeCoursActifV2).toBe('function');
    expect(surface.changerGroupeCoursActifV2EstAsync).toBe(true);
    expect(surface.sauvegarderCoursV2).toBe('function');
    expect(surface.sauvegarderGroupeCoursV2).toBe('function');
    expect(surface.sauvegarderHoraireV2).toBe('function');
    expect(surface.creerProfilEnseignantV2).toBe('function');
    expect(surface.peuplerDropdownGroupeCoursActif).toBe('function');
    expect(surface.mettreAJourBarreContexte).toBe('function');
});
