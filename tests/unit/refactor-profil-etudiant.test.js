import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Tests de régression pour le refactoring de profil-etudiant.js (PLAN-MOYEN-TERME
// §4.4, MODULES-MAP §2.3). Cible MODULES-MAP : 7 tests Vitest + 2 Playwright.
//
// Périmètre effectif pré-refactor : 8 818 LOC, 105 fonctions, 36 exports
// `window.X` (vs 24 prévus, dispersés en 5 zones du fichier). Cf. MODULES-MAP
// §2.3 « Écarts observés à l'exécution » (étape 1 — 17 mai 2026).
//
// Note méthodologique : MODULES-MAP §2.3 recommande de réutiliser 5 snippets
// depuis `audit/01-fidelity/calculations-tests.md` pour les tests régression
// des calculs (IPB, moyennes critères, diagnostic suivi, pattern actuel, niveau
// RaI). Ce fichier d'audit n'est pas présent dans le worktree refactor au
// moment de l'étape 2 (audit annuel Phase 3 sur branche `audit/2026-mai`, sujet
// distinct). Les 5 tests de calculs seront ajoutés en session A de l'étape 3,
// quand les fonctions concernées seront extraites dans `profil-etudiant-calculs.js`
// (logique pure, faible risque, faciles à tester en isolation).
//
// Couverture immédiate (5 tests Vitest + 2 Playwright) :
//   - Canari de chargement (le module se charge dans la sandbox sans erreur)
//   - Sentinelle d'exports (30 exports représentatifs des 7 zones)
//   - Structure du monstre `afficherProfilComplet` (cyc 58, function declaration, arité 1)
//   - État pivot `window.profilActuelDA` initialisé à null au chargement IIFE
//   - Structure de l'orchestrateur cascade `consulterEvaluation` (function declaration, arité 2)
//
// Profil-etudiant.js dépend de plusieurs globaux pour les fonctions non-pures :
// db, cle, obtenirDonneesSelonMode, obtenirPreference, obtenirEtudiantsCoursActif,
// echapperHtml, calculerTousLesIndices, etc. Stubs minimaux ci-dessous — les
// exports ne sont évalués qu'à l'appel, le chargement IIFE ne les touche pas
// (vérifié à la lecture étape 1, sauf `window.profilActuelDA = null` L2362).

let win;

beforeAll(() => {
    const stubs = {
        // db.* : 44 accès, opérations no-op pour le canari
        db: {
            get: async () => null,
            getSync: (k, defaut) => defaut !== undefined ? defaut : null,
            set: async () => {},
            setSync: () => {}
        },
        // cle() : namespacing (défini réellement dans trimestres.js:211)
        cle: (k) => 'test_' + k,
        // echapperHtml : 1 accès, helper global
        echapperHtml: (s) => String(s == null ? '' : s),
        // Helpers cross-module densément consommés (Écart #7) :
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null,
        obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee: () => {},
        afficherSection: () => {},
        afficherSousSection: () => {},
        // indices.js (chargé AVANT profil-etudiant.js dans index.html) :
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }),
        obtenirSeuil: () => 0.65,
        chargerSeuilsInterpretation: () => ({}),
        // Helpers misc consommés via `typeof X === 'function'` :
        estEtudiantExclu: () => false,
        filtrerEtudiantsParMode: (arr) => arr,
        estModeeLectureSeule: () => false,
        genererSeancesCompletes: () => {},
        calculerEtSauvegarderIndicesAssiduite: () => {},
        calculerEtStockerIndicesCP: () => {}
    };

    // Refactor étape 3 session A (17 mai 2026) : profil-etudiant-helpers.js
    // extrait depuis profil-etudiant.js (zone L50-637 originale, 16 fonctions
    // helpers/badges/interprétations + 16 exports window.X — décision étape 1 b
    // de promotion systématique des helpers cross-zones). Chargé AVANT le résidu
    // dans index.html.
    win = chargerScript('js/profil-etudiant-helpers.js', stubs);
    // #821 lot A (10 sept. 2026) : interpreterMobilisation / interpreterCompletion /
    // interpreterAssiduite ont déménagé dans contexte-qualification.js — même sandbox.
    chargerScript('js/contexte-qualification.js', stubs, win);

    // Refactor étape 3 session A (18 mai 2026) : profil-etudiant-calculs.js
    // extrait depuis profil-etudiant.js (zone L4185-5686 originale, 14 fonctions
    // de calculs pédagogiques + 14 exports window.X). Charge APRÈS helpers.js
    // car calculerMoyennesCriteres consomme des helpers du sous-module précédent.
    chargerScript('js/profil-etudiant-calculs.js', stubs, win);

    // Refactor étape 3 session A (18 mai 2026) : profil-etudiant-rapport.js
    // extrait depuis profil-etudiant.js (zone L7452-7842 originale, 7 fonctions
    // rapport API + préférences + 7 exports window.X). Charge APRÈS helpers+calculs
    // (consomme obtenirTermeProduction + résultats calculs).
    chargerScript('js/profil-etudiant-rapport.js', stubs, win);

    // Refactor étape 3 session B (18 mai 2026) : profil-etudiant-diagnostics.js
    // extrait depuis profil-etudiant.js (zone L3598-4429 originale, 11 fonctions
    // diagnostics SRPNF/Critères + blocs RLO + onglets + 11 exports window.X).
    // Charge APRÈS rapport (les blocs RLO consomment des helpers + calculs).
    chargerScript('js/profil-etudiant-diagnostics.js', stubs, win);

    // Refactor étape 3 session B (18 mai 2026) : profil-etudiant-confidentiel.js
    // extrait depuis profil-etudiant.js (zone L5098-5395 résidu post-diagnostics,
    // 8 fonctions modal PII + services adaptés + 2 variables module-scope
    // encapsulées + 8 exports window.X — 6 existants + 2 promotions session B).
    // Données SENSIBLE §1.2 (SKILL_Securite_donnees.md) — préservation comportementale
    // stricte, échappement existant conservé.
    chargerScript('js/profil-etudiant-confidentiel.js', stubs, win);

    // Refactor étape 3 session C (18 mai 2026) : profil-etudiant-actions.js
    // extrait depuis profil-etudiant.js (zone L4531-5096 résidu post-confidentiel,
    // 8 fonctions actions cascade : consulterEvaluation orchestrateur multi-timeouts
    // + calculerDetailsNoteFinale cyc 57 + jetons personnalisés + patterns groupe
    // Beta 91 + 8 exports window.X — 4 existants + 4 promotions session C).
    // Timers cascade `window._consulterEvalTimerId` + `window._apresOuvertureFichier`
    // préservés (atomicité critique race guard clics rapides). Consommé par
    // evaluation.js, travaux-ui.js, liste-evaluations.js, portfolio.js,
    // synthese-retroaction-data.js, tableau-bord-apercu.js.
    chargerScript('js/profil-etudiant-actions.js', stubs, win);

    // Refactor étape 3 session D (18 mai 2026) : profil-etudiant-sections-affichage.js
    // (renommage du résidu profil-etudiant.js — 4642 LOC inchangées, juste nouveau
    // nom de fichier pour cohérence avec le découpage). Contient afficherProfilComplet
    // orchestre cyc 58 (à éclater étape 4) + ~30 fonctions genererSection* + handlers
    // UI + 3 variables module-scope encapsulées dans IIFE (profilActuelDA dual-write +
    // sectionProfilActive + indiceActif).
    chargerScript('js/profil-etudiant-sections-affichage.js', stubs, win);
});

describe('profil-etudiant — régression refactoring 2026-mai (canari + sentinelle)', () => {

    // -----------------------------------------------------------------------
    // Test 0 : Canari — le module charge sans erreur dans la sandbox.
    // Une régression silencieuse au chargement (helper consommé au top-level
    // qui n'existe plus, IIFE qui plante avant les exports) serait attrapée
    // ici. Particulièrement critique vu les 5 zones d'exports dispersées
    // (Écart #3 MODULES-MAP §2.3).
    // -----------------------------------------------------------------------
    it('0. Canari — profil-etudiant.js charge sans erreur', () => {
        expect(win).toBeDefined();
        expect(typeof win).toBe('object');
    });

    // -----------------------------------------------------------------------
    // Test 1 : Sentinelle d'exports — vérifier qu'un sous-ensemble
    // représentatif des 36 exports est défini comme fonctions. Si un export
    // disparaît silencieusement lors d'une extraction (zone d'exports oubliée
    // par sed, pattern feedback `exports-orphelins-grep-window`), ce test
    // attrape la rupture.
    //
    // Sélection : 3-6 exports clés par zone fonctionnelle (7 zones).
    // -----------------------------------------------------------------------
    it('1. Sentinelle exports — 30+ exports représentatifs des 7 zones sont définis', () => {
        const exportsAttendus = [
            // Zone Helpers — 20 exports au 27 août 2026 (session A 17 mai 2026 :
            // tous promus window.X). `interpreterPerformance` a été retirée de
            // cette liste au pas 3c-3 de #542 : la fonction n'existe plus, son
            // résultat n'était lu nulle part. Voir le commentaire de retrait dans
            // `js/profil-etudiant-helpers.js`.
            'obtenirTermeProduction',
            'obtenirCouleurNiveauIDME',
            'obtenirNiveauIDMEDepuisPourcentage',
            'obtenirNombreProductionsPourPatterns',
            'obtenirIdsProductionsEvaluables',
            'obtenirGrilleReferenceDepistage',
            'obtenirCriteresAvecValeurs',
            'initialiserModuleProfilEtudiant',
            'genererBadgePratiqueProfil',
            'genererBadgePatternProfil',
            // Zone Qualification d'un contexte — 3 exports déplacés le 10 sept. 2026 (#821 lot A)
            // de la zone Helpers vers `js/contexte-qualification.js`, chargé dans le même sandbox.
            'interpreterMobilisation',
            'interpreterCompletion',
            'interpreterAssiduite',
            // Zone Sections affichage (L644-4189) — 5 exports
            'afficherProfilComplet',
            'changerSectionProfil',
            'toggleSectionCollapsible',
            'changerOngletDeveloppement',
            'naviguerVersPresenceAvecDate',
            // Zone Calculs — 14 exports (session A 18 mai 2026 : tous promus window.X)
            'obtenirTableConversionNiveaux',
            'convertirNiveauEnScore',
            'calculerMoyennesCriteres',
            'calculerMoyennesCriteresRecents',
            'calculerIPB',
            'diagnostiquerSuiviApprentissage',
            'diagnostiquerForcesChallenges',
            'calculerIndicesNDerniersArtefacts',
            'calculerProgressionEleve',
            'identifierDefiSpecifique',
            'identifierPatternActuel',
            'determinerNiveauRaiPedagogique',
            'determinerAlerteContextuelle',
            'determinerCibleIntervention',
            // calculerDirectionsCriteres : reste dans le résidu (zone Sections affichage L2517-2724)
            // Zone Diagnostics — 8 exports (session B 18 mai 2026 : tous promus window.X ;
            // #824, 11 sept. 2026 : `genererDiagnosticCriteres` / `SRPNF` / `Generique` retirées,
            // aucun appelant — voir le commentaire de retrait dans `js/profil-etudiant-diagnostics.js`)
            '_genererBarresSRPNF',
            'genererBlocProfilRLO',
            'genererConteneurGestesCognitifs',
            'genererNoteRLO',
            'genererOngletsDeveloppement',
            'genererBlocEvolutionRLO',
            // changerOngletDeveloppement : déjà listé ci-dessus (zone Sections affichage)
            // Zone Navigation (résidu) — 2 exports
            'naviguerVersIntervention',
            'naviguerVersNouvelleIntervention',
            // Zone Rapport — 8 exports (session A 18 mai 2026 : tous promus window.X ; cocherSectionRapport, lot 4 du cadrage 11)
            'genererRapportAPI',
            'cocherSectionRapport',
            'genererSectionRapport',
            'genererEtAfficherRapport',
            'copierRapport',
            'viderRapport',
            'sauvegarderPreferencesRapport',
            'restaurerPreferencesRapport',
            // Zone Actions cascade — 4 exports (session C 18 mai 2026 : 8 ; trois gestes sans bouton retirés par le lot 4 du cadrage 11 ;
            // `evaluerProduction` partie dans evaluation.js, sa définition unique, #868 du 15 sept. 2026)
            'consulterEvaluation',
            'calculerDetailsNoteFinale',
            'calculerEtStockerPatternsGroupe',
            'obtenirPatternEtudiant',
            // Zone Confidentiel — 8 exports (session B 18 mai 2026 : 6 existants + 2 promus window.X)
            'ouvrirModalConfidentiel',
            'chargerNotesPresencesConfidentiel',
            'sauvegarderNotesPresencesConfidentiel',
            'fermerModalConfidentiel',
            'sauvegarderConfidentiel',
            'toggleServicesAdaptes',
            'mettreAJourSousCategories',
            'aDesInfosConfidentielles'
        ];
        for (const nom of exportsAttendus) {
            expect(typeof win[nom], `window.${nom}`).toBe('function');
        }
    });

    // -----------------------------------------------------------------------
    // Test 2 : Structure du monstre `afficherProfilComplet` (Écart #2 MODULES-MAP
    // §2.3) — cyc 58, 285 LOC, orchestre 7 sections + 4 prefs UI + 3 recalculs
    // indices + 2 modes SOM/PAN + post-rendu setTimeout @100ms. Sera éclatée
    // à la session D de l'étape 3 (extraction sections affichage + étape 4).
    // L'atomicité du couple dual-write `profilActuelDA = X; window.profilActuelDA = X`
    // (L2807-2808) doit être préservée — un wrapper public restera la signature
    // canonique avec arité 1.
    // -----------------------------------------------------------------------
    it('2. afficherProfilComplet — function declaration avec arité 1 (daOuEl)', () => {
        expect(typeof win.afficherProfilComplet).toBe('function');
        const src = win.afficherProfilComplet.toString();
        expect(src.startsWith('function')).toBe(true);
        // Arité 1 paramètre (`daOuEl` — accepte string DA ou element depuis dispatcher)
        expect(win.afficherProfilComplet.length).toBe(1);
    });

    // -----------------------------------------------------------------------
    // Test 3 : État pivot — `window.profilActuelDA` est initialisé à `null`
    // au chargement IIFE (L2361-2362). Le couple dual-write (local +
    // window) doit rester atomique pendant le découpage — la déclaration
    // initiale est le seul effet de bord top-level de l'IIFE. Si l'extraction
    // dissocie la déclaration local de la propagation window.X, ce test
    // attrape l'inversion (window.profilActuelDA serait undefined au lieu
    // de null).
    // -----------------------------------------------------------------------
    it('3. État pivot — window.profilActuelDA initialisé à null au chargement IIFE', () => {
        expect(win.profilActuelDA).toBeNull();
    });

    // -----------------------------------------------------------------------
    // Test 4 : Orchestrateur cascade `consulterEvaluation` (Écart #8 MODULES-MAP
    // §2.3) — multi-timeouts T+200/500/300ms avec `window._consulterEvalTimerId`
    // race guard. Sera extraite à la session C de l'étape 3 dans
    // `profil-etudiant-actions.js` (chargé EN DERNIER avec sections affichage
    // car appelle window.modifierEvaluationParId + travauxResolution +
    // travauxUI + afficherSection). Arité 2 (da, productionId).
    // -----------------------------------------------------------------------
    it('4. consulterEvaluation — function declaration avec arité 2 (da, productionId)', () => {
        expect(typeof win.consulterEvaluation).toBe('function');
        const src = win.consulterEvaluation.toString();
        expect(src.startsWith('function')).toBe(true);
        expect(win.consulterEvaluation.length).toBe(2);
    });
});
