import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Tests Playwright pré-refactor evaluation.js (MODULES-MAP §2.1, étape 2).
// METHODE §7 productions.js note pour modules suivants : « Le Playwright est
// NÉCESSAIRE ici (changement de contexte = side-effects DOM cross-vue
// invisibles aux tests pures) ». Cible : 2 tests Playwright avant refactor.
//
// Couverture : (1) chargement IIFE dans WebKit sans erreur console, surface
// d'exports `window.X` réelle après chargement complet de tous les scripts.
// (2) Les 3 monstres EXPORTÉS (sur 9 cyc > 30, Écart #1) + 4e monstre cyc 61
// restent accessibles dans l'environnement browser (vs Vitest sandbox Node) :
// `sauvegarderEvaluation`, `modifierEvaluation`, `calculerNoteAlgorithmique
// AvecCategories`, `genererRetroaction`. Note : `window.evaluationEnCours`
// n'est PAS initialisé au chargement (créé à la 1re sauvegarde, Écart #4 §2.1).

test('Défense refactor · evaluation charge dans WebKit sans erreur console', async ({ page }) => {
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

test('Défense refactor · sentinelle exports browser evaluation', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Vérifier qu'un sous-ensemble représentatif des 63 exports est défini
    // dans l'environnement browser (vs Vitest sandbox Node — les deux doivent
    // converger). Si une extraction casse le contrat avec le dispatcher
    // `data-action`, ce test l'attrape.
    const surface = await page.evaluate(() => ({
        // 3 monstres EXPORTÉS sur 9 (Écart #1 §2.1) + 4e monstre cyc 61
        sauvegarderEvaluation: typeof window.sauvegarderEvaluation,
        modifierEvaluation: typeof window.modifierEvaluation,
        calculerNoteAlgorithmiqueAvecCategories: typeof window.calculerNoteAlgorithmiqueAvecCategories,
        genererRetroaction: typeof window.genererRetroaction,
        sauvegarderEvaluationEstFunction: window.sauvegarderEvaluation
            ? window.sauvegarderEvaluation.toString().startsWith('function')
            : false,
        // Zone Chargement
        chargerListeEtudiantsEval: typeof window.chargerListeEtudiantsEval,
        chargerEvaluationsEtudiant: typeof window.chargerEvaluationsEtudiant,
        chargerProduction: typeof window.chargerProduction,
        cartoucheSelectionnee: typeof window.cartoucheSelectionnee,
        niveauSelectionne: typeof window.niveauSelectionne,
        // Zone Calcul (4 exports depuis evaluation-calcul.js — session B)
        // calculerNoteAlgorithmiqueAvecCategories déjà couvert L73 (monstre)
        calculerNoteAlgorithmiqueSimple: typeof window.calculerNoteAlgorithmiqueSimple,
        calculerNote: typeof window.calculerNote,                  // promotion §5.6 session B
        obtenirCouleurNiveau: typeof window.obtenirCouleurNiveau,  // promotion §5.6 session B
        // Zone Rétroaction (extraits dans -retroaction.js session B 2e sous-module)
        regenererRetroactionAvecFeedback: typeof window.regenererRetroactionAvecFeedback,
        copierRetroaction: typeof window.copierRetroaction,
        basculerVueRetroaction: typeof window.basculerVueRetroaction,
        copierToutRetroaction: typeof window.copierToutRetroaction,
        mettreAJourCompteurMots: typeof window.mettreAJourCompteurMots, // promotion §5.6 session B
        // Zone Sauvegarde (extraits dans -sauvegarde.js session B 3e sous-module)
        // sauvegarderEvaluation déjà couvert L71 (monstre)
        mettreAJourPillStatut: typeof window.mettreAJourPillStatut,
        peuplementOptJetons: typeof window.peuplementOptJetons,
        majBadgesApresEvaluation: typeof window.majBadgesApresEvaluation, // promotion §5.6 session B 3e
        afficherBadgesJetons: typeof window.afficherBadgesJetons,         // promotion §5.6 session B 3e
        afficherGestionJetons: typeof window.afficherGestionJetons,       // promotion §5.6 session B 3e
        // Zone Modification + Banque
        supprimerEvaluation: typeof window.supprimerEvaluation,
        evaluerProduction: typeof window.evaluerProduction,
        editerFichierDepuisEvaluation: typeof window.editerFichierDepuisEvaluation,
        // État pivot (PAS initialisé au chargement — créé à la 1re sauvegarde)
        evaluationEnCoursEstUndefined: typeof window.evaluationEnCours === 'undefined'
    }));

    expect(surface.sauvegarderEvaluation).toBe('function');
    expect(surface.modifierEvaluation).toBe('function');
    expect(surface.calculerNoteAlgorithmiqueAvecCategories).toBe('function');
    expect(surface.genererRetroaction).toBe('function');
    expect(surface.sauvegarderEvaluationEstFunction).toBe(true);
    expect(surface.chargerListeEtudiantsEval).toBe('function');
    expect(surface.chargerEvaluationsEtudiant).toBe('function');
    expect(surface.chargerProduction).toBe('function');
    expect(surface.cartoucheSelectionnee).toBe('function');
    expect(surface.niveauSelectionne).toBe('function');
    expect(surface.calculerNoteAlgorithmiqueSimple).toBe('function');
    expect(surface.calculerNote).toBe('function');
    expect(surface.obtenirCouleurNiveau).toBe('function');
    expect(surface.regenererRetroactionAvecFeedback).toBe('function');
    expect(surface.copierRetroaction).toBe('function');
    expect(surface.basculerVueRetroaction).toBe('function');
    expect(surface.copierToutRetroaction).toBe('function');
    expect(surface.mettreAJourCompteurMots).toBe('function');
    expect(surface.mettreAJourPillStatut).toBe('function');
    expect(surface.peuplementOptJetons).toBe('function');
    expect(surface.majBadgesApresEvaluation).toBe('function');
    expect(surface.afficherBadgesJetons).toBe('function');
    expect(surface.afficherGestionJetons).toBe('function');
    expect(surface.supprimerEvaluation).toBe('function');
    expect(surface.evaluerProduction).toBe('function');
    expect(surface.editerFichierDepuisEvaluation).toBe('function');
    expect(surface.evaluationEnCoursEstUndefined).toBe(true);
});
