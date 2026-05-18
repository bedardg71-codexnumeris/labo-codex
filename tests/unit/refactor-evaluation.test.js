import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Tests de régression pour le refactoring de evaluation.js (PLAN-MOYEN-TERME
// §4.5, MODULES-MAP §2.1). Cible MODULES-MAP : 7 tests Vitest + 2 Playwright.
//
// Périmètre effectif pré-refactor : 7 348 LOC, 123 fonctions, 63 exports
// `window.X` (vs 57 prévus §2.1) — pattern profil-etudiant-like avec bloc
// concentré en bas du fichier (lignes 7259-7312) + 1 dispersé ligne 2130.
// Cf. MODULES-MAP §2.1 « Écarts observés à l'exécution » (étape 1 — 18 mai 2026).
//
// Note méthodologique : §2.1 recommande des tests sur les fonctions PURES de
// calcul (algo notation IDME). Inspection révèle qu'AUCUNE fonction de calcul
// n'est pure dans la version actuelle : toutes lisent `window.evaluationEnCours`
// + DOM + db.getSync. Tests des fonctions pures REPORTÉS à étape 3 session A
// (extraction `evaluation-calcul.js`) — pattern profil-etudiant validé 18 mai.
//
// Couverture immédiate (7 tests Vitest + 2 Playwright) :
//   - Canari de chargement (le module se charge dans la sandbox sans erreur)
//   - Sentinelle d'exports (25+ exports représentatifs des 7 zones §2.1)
//   - Structure des 3 monstres EXPORTÉS (sur 9 cyc > 30 identifiés Écart #1) :
//       · sauvegarderEvaluation cyc 70 (function declaration, arité 0)
//       · modifierEvaluation cyc 78 via async arrow interne (arité 1)
//       · calculerNoteAlgorithmiqueAvecCategories cyc 42 (arité 4)
//   - Structure du 4e monstre cyc 61 `genererRetroaction` (arité 1) — exporté
//   - État pivot `window.evaluationEnCours` undefined au chargement IIFE
//     (vs profil-etudiant `window.profilActuelDA = null` initialisé) —
//     evaluation.js n'initialise PAS le pivot, il est créé à la 1re sauvegarde.
//
// 6/9 monstres cyc > 30 sont privés à l'IIFE (non testables en sandbox) :
// `genererRetroactionBilan` 75, async arrow interne 78 (testé via parent),
// `sauvegarderEvaluationModifiee` 58, `_autoSauvegarderCriteres` 55,
// `chargerEchellePerformance` 36 (cas limite — exporté mais hors top sentinelle),
// `peuplementOptJetons` 33 (cas limite — exporté). Préservation comportementale
// stricte : pas de promotion `window.X` juste pour tester (méthode mûre).

let win;

beforeAll(() => {
    const stubs = {
        // db.* : 78 accès, opérations no-op pour le canari
        db: {
            get: async () => null,
            getSync: (k, defaut) => defaut !== undefined ? defaut : null,
            set: async () => {},
            setSync: () => {}
        },
        // cle() : namespacing par trimestre (22 usages)
        cle: (k) => 'test_' + k,
        // echapperHtml : 57 usages, helper global
        echapperHtml: (s) => String(s == null ? '' : s),
        // Helpers cross-module densément consommés (Écart #7) :
        obtenirDonneesSelonMode: () => [],
        sauvegarderDonneesSelonMode: () => {},
        obtenirPreference: () => null,
        obtenirCoursActifId: () => null,
        // Notifications : wrappers redéfinis localement evaluation.js:3583 mais
        // aussi consommés via typeof === 'function' depuis d'autres modules
        afficherNotificationSucces: () => {},
        afficherNotificationErreur: () => {},
        afficherNotificationCopiee: () => {},
        // navigation.js
        afficherSection: () => {},
        afficherSousSection: () => {},
        // modes.js
        estModeeLectureSeule: () => false,
        // jetons / business logic
        obtenirConfigJetons: () => ({}),
        verifierDisponibiliteJeton: () => true,
        compterJetonsUtilises: () => 0,
        // Format TSV (clipboard)
        copierEnFormatTSV: () => {}
    };

    // Pré-peupler le faux `window` avec `addEventListener` : evaluation.js fait
    // un side-effect top-level IIFE ligne 7163 (origine) — `window.addEventListener
    // ('modeChanged', ...)`. Pattern absent des 4 autres god modules refactorés.
    // Le 3e paramètre `fauxWindowExistant` du helper permet d'injecter cet API.
    const fauxWindow = {
        addEventListener: () => {},
        removeEventListener: () => {}
    };

    // Refactor étape 3 session A (18 mai 2026) : evaluation-chargement.js
    // extrait depuis evaluation.js (zone L77-1110 Chargement + L1112-1247
    // Auto-save originale, 17 fonctions). Chargé AVANT le résidu dans
    // index.html — le résidu consomme window.afficherCriteresDepuisGrille
    // (L5521 d'origine → patch §5.6 fait dans evaluation.js).
    // Session B (18 mai après-midi) : 2 patches §5.6 ajoutés pour
    // window.obtenirCouleurNiveau (consommée L652 + L1026 chargement.js).
    win = chargerScript('js/evaluation-chargement.js', stubs, fauxWindow);

    // Refactor étape 3 session B (18 mai 2026) : evaluation-calcul.js extrait
    // depuis evaluation.js (zone L61-L720 Calcul de notes + Gestion couleurs,
    // 6 fonctions : calculerNoteAlgorithmique, genererRetroactionEUF privées,
    // calculerNoteAlgorithmiqueAvecCategories cyc 42 exportée, calculerNote
    // AlgorithmiqueSimple, calculerNote, obtenirCouleurNiveau). Chargé ENTRE
    // chargement et résidu — promotions §5.6 nouvelles : window.calculerNote
    // (6 sites résidu) + window.obtenirCouleurNiveau (2 sites chargement.js).
    chargerScript('js/evaluation-calcul.js', stubs, win);

    // Résidu evaluation.js post-extractions Chargement+Calcul (~5427 LOC,
    // anciennement 7321 LOC pré-refactor, -25,9 %). Consomme window.afficher
    // CriteresDepuisGrille (chargement) + window.calculerNote (calcul, 6 sites
    // patchés §5.6 zones changerStatutIntegrite, changerEchelleEvaluation,
    // verifierEtChargerEvaluationExistante, modifierEvaluation × 2).
    chargerScript('js/evaluation.js', stubs, win);

    // Refactor étape 3 session A (18 mai 2026) : evaluation-handlers.js
    // extrait depuis evaluation.js (zone L7240-7256 + L7314-7346 originale,
    // 3 fonctions wrappers Phase 5 + édition fichier). Chargé APRÈS le résidu
    // dans index.html — consomme window.calculerNoteAlgorithmique* via
    // dispatcher data-action (au moment du clic, pas au chargement IIFE).
    chargerScript('js/evaluation-handlers.js', stubs, win);
});

describe('evaluation — régression refactoring 2026-mai (pré-refactor, 7 tests)', () => {

    // -----------------------------------------------------------------------
    // Test 0 : Canari — le module charge sans erreur dans la sandbox.
    // Une régression silencieuse au chargement (helper consommé au top-level
    // qui n'existe plus, IIFE qui plante avant les exports) serait attrapée
    // ici. Particulièrement critique vu le triple monstre cyc 70/75/78 + IIFE
    // complète englobante (Écart #8 §2.1).
    // -----------------------------------------------------------------------
    it('0. Canari — evaluation.js charge sans erreur', () => {
        expect(win).toBeDefined();
        expect(typeof win).toBe('object');
    });

    // -----------------------------------------------------------------------
    // Test 1 : Sentinelle d'exports — vérifier qu'un sous-ensemble
    // représentatif des 63 exports est défini comme fonctions. Si un export
    // disparaît silencieusement lors d'une extraction (zone d'exports oubliée
    // par sed, pattern feedback `exports-orphelins-grep-window`), ce test
    // attrape la rupture.
    //
    // Sélection : 3-5 exports clés par zone §2.1 (7 zones) + dispersé L2130.
    // -----------------------------------------------------------------------
    it('1. Sentinelle exports — 25+ exports représentatifs des 7 zones §2.1', () => {
        const exportsAttendus = [
            // Zone Chargement (L77-1043) — 6 exports
            'chargerListeEtudiantsEval',
            'chargerGroupesEval',
            'chargerGrillesDansSelect',
            'chargerEchellePerformance',
            'chargerEvaluationsEtudiant',
            'chargerProduction',
            'chargerGrilleSelectionnee',
            'cartoucheSelectionnee',
            'niveauSelectionne',
            'filtrerEtudiantsParGroupe',
            // Zone Calcul (L1257-1892) — 5 exports (4 depuis evaluation-calcul.js
            // session B + 2 handlers depuis evaluation-handlers.js session A)
            'calculerNoteAlgorithmiqueAvecCategories',
            'calculerNoteAlgorithmiqueSimple',
            'calculerNote',                // promotion §5.6 session B
            'obtenirCouleurNiveau',        // promotion §5.6 session B
            'calculerNoteAlgoSimpleHandler',
            'calculerNoteAlgoCatHandler',
            // Zone Rétroaction (L1929-3582) — 5 exports + 1 dispersé L2130
            'genererRetroaction',
            'regenererRetroactionAvecFeedback',  // export dispersé L2130
            'copierRetroaction',
            'basculerVueRetroaction',
            'copierToutRetroaction',
            // Zone Sauvegarde + jetons (L2177-2984) — 6 exports
            'sauvegarderEvaluation',
            'changerStatutRemise',
            'mettreAJourPillStatut',
            'changerStatutIntegrite',
            'peuplementOptJetons',
            'gererChangementCheckboxJetonReprise',
            'gererChangementCheckboxJetonDelai',
            'gererChangementCheckboxJetonRepriseCiblee',
            // Zone Nouvelle/formulaire (L2985-3132) — 3 exports
            'nouvelleEvaluation',
            'reinitialiserFormulaire',
            'evaluerProduction',
            // Zone Liste + filtres + tri + modification (L3737-5975) — 4 exports
            'toggleEtudiantEval',
            'modifierEvaluation',
            'naviguerEtudiantPrecedent',
            'naviguerEtudiantSuivant',
            // Zone Verrouillage + suppression + banque (L5976-6850) — 6 exports
            'basculerVerrouillageEvaluation',
            'basculerVerrouillageEvaluationCourante',
            'supprimerEvaluation',
            'chargerEvaluationDepuisBanque',
            'appliquerJetonRepriseDepuisBanque',
            'supprimerEvaluationBanque',
            // Zone Banque jetons + recherche + édition (L6851-7348) — 5 exports
            'retirerJeton',
            'retirerJetonDepuisSidebar',
            'afficherJetonsPersonnalisesEvaluation',
            'appliquerJetonPersonnalise',
            'copierCriteresSRPN',
            'copierCriteresSRPNF',
            'editerFichierDepuisEvaluation',
            'confirmerSuppressionEvaluationSidebar',
            'changerEchelleEvaluation'
        ];
        for (const nom of exportsAttendus) {
            expect(typeof win[nom], `window.${nom}`).toBe('function');
        }
    });

    // -----------------------------------------------------------------------
    // Test 2 : Structure du monstre `sauvegarderEvaluation` (Écart #1 §2.1,
    // cyc 70, L2177-2426, 250 LOC). Sera éclatée à l'étape 4 si N=50 acté
    // (proposition méthode mûre). Initialise `window.evaluationEnCours` au
    // 1er appel (L3062 — code dans nouvelleEvaluation appelle reinitialiser).
    // Atomicité couple `evaluationEnCours = X; window.evaluationEnCours = X`
    // à préserver pendant les extractions.
    // -----------------------------------------------------------------------
    it('2. sauvegarderEvaluation — function declaration avec arité 0', () => {
        expect(typeof win.sauvegarderEvaluation).toBe('function');
        const src = win.sauvegarderEvaluation.toString();
        expect(src.startsWith('function')).toBe(true);
        expect(win.sauvegarderEvaluation.length).toBe(0);
    });

    // -----------------------------------------------------------------------
    // Test 3 : Structure du monstre `modifierEvaluation` (Écart #1 §2.1, cyc
    // 78 via async arrow interne L5323, 507 LOC L5207-5713). Le PLUS GROS
    // monstre du module. Sera la priorité absolue de l'étape 4 (au-dessus
    // de tout seuil N proposé). L'async arrow interne L5323 contient des
    // boucles d'attente Promise (attendreOption, attendreSelectsCriteres)
    // qui devront être extraites en helpers privés.
    // -----------------------------------------------------------------------
    it('3. modifierEvaluation — function declaration avec arité 1 (evaluationId)', () => {
        expect(typeof win.modifierEvaluation).toBe('function');
        const src = win.modifierEvaluation.toString();
        expect(src.startsWith('function')).toBe(true);
        expect(win.modifierEvaluation.length).toBe(1);
    });

    // -----------------------------------------------------------------------
    // Test 4 : Structure de `calculerNoteAlgorithmiqueAvecCategories` (Écart
    // #1 §2.1, cyc 42, L1370-1597). Algo notation critique métier (Mode
    // catégorisation des erreurs — Mode IDME × SRPNF, parser sous-critères,
    // mode dominant). Au-dessus du seuil dur 30, sous le seuil proposé N=50
    // — décision Grégoire à acter (cycle Cat-B héritage vs éclatement étape 4).
    //
    // NOTE — 6/9 monstres cyc > 30 inaccessibles au sandbox (privés à l'IIFE) :
    //   • genererRetroactionBilan cyc 75 (L3316)
    //   • async arrow interne cyc 78 (L5323 dans modifierEvaluation)
    //   • sauvegarderEvaluationModifiee cyc 58 (L5719)
    //   • _autoSauvegarderCriteres cyc 55 (L1150, préfixe _ privé)
    //   • genererRetroaction (testé via export, cf. test 5)
    // Décision : préservation comportementale stricte — ne pas promouvoir
    // window.X juste pour les tester. La structure des 3 monstres EXPORTÉS
    // (modifier/sauvegarderEvaluation/calculerNoteAlgo*) suffit comme sentinelle.
    // -----------------------------------------------------------------------
    it('4. calculerNoteAlgorithmiqueAvecCategories — function declaration avec arité 4', () => {
        expect(typeof win.calculerNoteAlgorithmiqueAvecCategories).toBe('function');
        const src = win.calculerNoteAlgorithmiqueAvecCategories.toString();
        expect(src.startsWith('function')).toBe(true);
        // Arité 4 : (critereId, ponderation, facteur, critereGrilleId)
        expect(win.calculerNoteAlgorithmiqueAvecCategories.length).toBe(4);
    });

    // -----------------------------------------------------------------------
    // Test 5 : Structure du 4e monstre `genererRetroaction` (Écart #1 §2.1,
    // cyc 61, L1929-2128). Parent de la chaîne génération de retroaction —
    // appelée par `calculerNoteAlgorithmique` + `niveauSelectionne`. Reste
    // au-dessus de seuil N=50 si acté. Note l'export dispersé L2130 immédiat
    // après cette fonction (`regenererRetroactionAvecFeedback`).
    // -----------------------------------------------------------------------
    it('5. genererRetroaction — function declaration avec arité 1 (num)', () => {
        expect(typeof win.genererRetroaction).toBe('function');
        const src = win.genererRetroaction.toString();
        expect(src.startsWith('function')).toBe(true);
        expect(win.genererRetroaction.length).toBe(1);
    });

    // -----------------------------------------------------------------------
    // Test 6 : État pivot `window.evaluationEnCours` (Écart #4 §2.1) —
    // **PAS initialisé au chargement IIFE** (contrairement à
    // `window.profilActuelDA = null` de profil-etudiant). evaluation.js
    // crée le pivot uniquement à la 1re sauvegarde (L3062 dans
    // `sauvegarderEvaluation`) ou modification (L5433 dans `modifierEvaluation`).
    // Couplage cross-module : `travaux-ui.js:4639` réassigne aussi le pivot
    // — comportement à préserver atomiquement pendant les extractions.
    // Si l'extraction provoque une initialisation involontaire (e.g. `let
    // evaluationEnCours = null` au top de l'IIFE résidu), ce test l'attrape.
    // -----------------------------------------------------------------------
    it('6. État pivot — window.evaluationEnCours undefined au chargement IIFE', () => {
        expect(win.evaluationEnCours).toBeUndefined();
    });
});
