import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Tests Playwright pré-refactor profil-etudiant.js (MODULES-MAP §2.3, étape 2).
// METHODE §7 productions.js note pour modules suivants : « Le Playwright est
// NÉCESSAIRE ici (changement de contexte = side-effects DOM cross-vue
// invisibles aux tests pures) ». Cible : 2 tests Playwright avant refactor.
//
// Couverture : (1) chargement IIFE dans WebKit sans erreur console, surface
// d'exports `window.X` réelle après chargement complet de tous les scripts.
// (2) `afficherProfilComplet` et `consulterEvaluation` restent accessibles
// dans l'environnement browser (vs Vitest sandbox Node).

test('Défense refactor · profil-etudiant charge dans WebKit sans erreur console', async ({ page }) => {
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

    // Donner un délai à l'init différée
    await page.waitForTimeout(500);

    // Aucune erreur console au chargement (filet pour régression silencieuse
    // type ReferenceError sur un export disparu lors d'une extraction).
    // Les limitations file:// connues sont filtrées ci-dessus.
    expect(erreurs, `Erreurs console détectées : ${erreurs.join(' | ')}`).toEqual([]);
});

test('Défense refactor · sentinelle exports browser profil-etudiant', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Vérifier qu'un sous-ensemble représentatif des 36 exports est défini
    // dans l'environnement browser (vs Vitest sandbox Node — les deux doivent
    // converger). Si une extraction casse le contrat avec le dispatcher
    // `data-action`, ce test l'attrape.
    const surface = await page.evaluate(() => ({
        // Orchestrateurs (chargés EN DERNIER après refactor — session C+D)
        afficherProfilComplet: typeof window.afficherProfilComplet,
        consulterEvaluation: typeof window.consulterEvaluation,
        consulterEvaluationEstFunction: window.consulterEvaluation
            ? window.consulterEvaluation.toString().startsWith('function')
            : false,
        // Calculs (Session A LOW)
        calculerMoyennesCriteres: typeof window.calculerMoyennesCriteres,
        calculerIPB: typeof window.calculerIPB,
        determinerNiveauRaiPedagogique: typeof window.determinerNiveauRaiPedagogique,
        determinerCibleIntervention: typeof window.determinerCibleIntervention,
        // Actions (Session C)
        calculerEtStockerPatternsGroupe: typeof window.calculerEtStockerPatternsGroupe,
        calculerDetailsNoteFinale: typeof window.calculerDetailsNoteFinale,
        // Confidentiel (Session B — PII)
        ouvrirModalConfidentiel: typeof window.ouvrirModalConfidentiel,
        sauvegarderConfidentiel: typeof window.sauvegarderConfidentiel,
        // État pivot (toujours déclaré au chargement IIFE)
        profilActuelDAEstNull: window.profilActuelDA === null
    }));

    expect(surface.afficherProfilComplet).toBe('function');
    expect(surface.consulterEvaluation).toBe('function');
    expect(surface.consulterEvaluationEstFunction).toBe(true);
    expect(surface.calculerMoyennesCriteres).toBe('function');
    expect(surface.calculerIPB).toBe('function');
    expect(surface.determinerNiveauRaiPedagogique).toBe('function');
    expect(surface.determinerCibleIntervention).toBe('function');
    expect(surface.calculerEtStockerPatternsGroupe).toBe('function');
    expect(surface.calculerDetailsNoteFinale).toBe('function');
    expect(surface.ouvrirModalConfidentiel).toBe('function');
    expect(surface.sauvegarderConfidentiel).toBe('function');
    expect(surface.profilActuelDAEstNull).toBe(true);
});
