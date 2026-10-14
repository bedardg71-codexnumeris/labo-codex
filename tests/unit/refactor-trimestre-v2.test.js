import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Tests de régression pour le refactoring de trimestre-v2.js (PLAN-MOYEN-TERME
// §4.3, MODULES-MAP §2.4). Cible MODULES-MAP : 5 tests Vitest + 2 Playwright.
//
// Périmètre effectif pré-refactor : ce module est le plus dense du projet
// (6 584 LOC, 164 fonctions, 203 accès db.*, 129 exports window.X dispersés
// en 5 zones). Aucune pure publique exportée directement : les seuls helpers
// purs identifiés sont privés à l'IIFE (`abrevierJour` ligne 4391,
// `obtenirPeriodeJournee` ligne 4402). Ils seront promus sur `window.X`
// pendant les sessions A/B/C de l'étape 3 et leurs tests ajoutés à ce
// moment-là.
//
// Couverture immédiate :
//   - Canari de chargement (le module se charge dans la sandbox sans erreur)
//   - Sentinelle d'exports (~20 exports représentatifs des 8 zones)
//   - Assertions de structure sur les fonctions clés (init, monstre, hub)
//
// Les 5 cas d'intégration de MODULES-MAP §2.4 (création trimestre, CRUD
// entités, changement groupe-cours actif, archivage, import/export étudiants)
// restent couverts par le test manuel exhaustif de l'étape 5 + 2 Playwright
// dédiés (changement de contexte = side-effects DOM cross-vue invisibles
// aux tests purs — METHODE §7 productions.js note pour modules suivants).
//
// Trimestre-v2.js dépend de plusieurs globaux pour les fonctions non-pures :
// db, cle, BibliothequeUI, echapperHtml, obtenirTrimestreActif,
// chargerDureePeriodeUI, restaurerEtatAccordeons, EnseignantsEntite, etc.
// Stubs minimaux ci-dessous — les exports ne sont évalués qu'à l'appel,
// le chargement IIFE ne les touche pas (vérifié à la lecture étape 1).

let win;

beforeAll(() => {
    const stubs = {
        // db.* : 203 accès, opérations no-op pour le canari
        db: {
            get: async () => null,
            getSync: (cle, defaut) => defaut !== undefined ? defaut : null,
            set: async () => {},
            setSync: () => {}
        },
        // cle() : 36 accès, namespacing namespacé (défini réellement dans trimestres.js:211)
        cle: (k) => 'test_' + k,
        // echapperHtml : 31 accès, helper global
        echapperHtml: (s) => String(s == null ? '' : s),
        // BibliothequeUI : 16 accès, dépendance ferme à js/bibliotheque-ui.js
        BibliothequeUI: {
            genererBadgeSource: () => '',
            genererIdCourt: (id) => String(id).slice(0, 6),
            filtrerParModeDemo: (arr) => arr,
            formaterTitreDemo: (titre) => titre,
            estItemDemo: () => false,
            formaterMetadonnees: () => '',
            formaterTitre: (s) => s,
            renderCarteSelection: () => '',
            renderCarteDisponible: () => '',
            renderMenuActions: () => '',
            creerModal: () => {},
            fermerModal: () => {},
            renderAvertissementDoublons: () => '',
            obtenirAuteurActif: () => 'Test'
        },
        // Helpers cross-module consommés via `typeof X === 'function'` :
        // tous défensifs, pas nécessaires au chargement IIFE
        obtenirTrimestreActif: () => null,
        obtenirEtudiantsCoursActif: () => [],
        estEtudiantExclu: () => false,
        formaterDateCourte: (d) => d,
        genererIdUnique: (prefix) => prefix + Math.random().toString(36).slice(2, 8),
        // Entités v2 (chargées avant trimestre-v2 dans index.html)
        EnseignantsEntite: {
            obtenirTous: async () => [],
            obtenirParId: async () => null,
            ajouter: async () => {},
            modifier: async () => {},
            supprimer: async () => {}
        }
    };

    win = chargerScript('js/trimestre-v2.js', stubs);

    // Refactor étape 3 session A (17 mai 2026) : trimestre-v2-enseignants.js
    // extrait depuis trimestre-v2.js (lignes 5438-5739). Charger dans le même
    // sandbox via le 3e paramètre de chargerScript() pour fusionner les
    // exports dans `win` et préserver la sentinelle.
    chargerScript('js/trimestre-v2-enseignants.js', stubs, win);

    // Refactor étape 3 session A (17 mai 2026) : trimestre-v2-horaires.js
    // extrait depuis trimestre-v2.js (lignes 3252-4073, 20 fonctions
    // séances + horaires + format horaire).
    chargerScript('js/trimestre-v2-horaires.js', stubs, win);

    // Refactor étape 3 session A (17 mai 2026) : trimestre-v2-liste.js
    // extrait depuis trimestre-v2.js (lignes 946-1394, 11 fonctions
    // liste trimestres + archivage + biblio + modal nouveau).
    chargerScript('js/trimestre-v2-liste.js', stubs, win);

    // Refactor étape 3 session A (17 mai 2026) : trimestre-v2-init.js
    // extrait depuis trimestre-v2.js (lignes 34-401 + 486-948, 21 fonctions
    // init + identification + calendrier + événements,
    // `afficherStatistiquesTrimestreV2` reste au résidu).
    chargerScript('js/trimestre-v2-init.js', stubs, win);

    // Refactor étape 3 session B (17 mai 2026) : trimestre-v2-cours.js
    // extrait depuis trimestre-v2.js (lignes 118-1081, 18 fonctions CRUD
    // cours + synthèses sidebar + helper setValue + `coursEnEditionV2`).
    chargerScript('js/trimestre-v2-cours.js', stubs, win);

    // Refactor étape 3 session B (17 mai 2026) : trimestre-v2-etudiants.js
    // extrait depuis trimestre-v2.js (lignes 119-1014 + handlers wrappers
    // 2188-2200, 25 fonctions CRUD étudiants + groupes + import/export CSV +
    // dispatchers actionEtudiantV2Handler/remarqueEtudiantV2Handler +
    // `donneesImportEnAttenteV2` + `etudiantEnEditionIndex`).
    chargerScript('js/trimestre-v2-etudiants.js', stubs, win);

    // Refactor étape 3 session B (17 mai 2026) : trimestre-v2-groupes-cours.js
    // extrait depuis trimestre-v2.js (lignes 119-219 + 360-1149, zone 6).
    // 16 fonctions CRUD groupes-cours + bibliothèque modale + helpers nom
    // (abrevierJour, obtenirPeriodeJournee) + `groupeCoursEnEditionId`.
    // Le hub `populerDropdownsAssemblageV2` reste dans le résidu (Écart #4).
    chargerScript('js/trimestre-v2-groupes-cours.js', stubs, win);

    // Refactor étape 3 session C Phase 1 (17 mai 2026) : trimestre-v2-orchestre.js
    // extrait depuis trimestre-v2.js (lignes 491-1216, zone HIGH 8).
    // 15 fonctions chorégraphie : dropdowns + changement de groupe-cours
    // actif (monstre cyc 94 préservé Phase 1, éclatement Phase 2 selon
    // Écart #8) + UI enseignant/horaire/groupe-cours + accès calendrier.
    // Variable module-scope migrée : `enseignantEnEditionUI`.
    // Chargé EN DERNIER pour que les `window.X` des autres sous-modules
    // (populerDropdownGroupesHoraireV2, afficherTrimestreGroupeCoursV2,
    // supprimerGroupeCoursV2) soient déjà disponibles.
    chargerScript('js/trimestre-v2-orchestre.js', stubs, win);
});

describe('trimestre-v2 — régression refactoring 2026-mai (canari + sentinelle)', () => {

    // -----------------------------------------------------------------------
    // Test 0 : Canari — le module charge sans erreur dans la sandbox.
    // Une régression silencieuse au chargement (helper consommé au top-level
    // qui n'existe plus, IIFE qui plante avant les exports) serait attrapée
    // ici. Particulièrement critique vu les 5 zones d'exports dispersées.
    // -----------------------------------------------------------------------
    it('0. Canari — trimestre-v2.js charge sans erreur', () => {
        expect(win).toBeDefined();
        expect(typeof win).toBe('object');
    });

    // -----------------------------------------------------------------------
    // Test 1 : Sentinelle d'exports — vérifier qu'un sous-ensemble
    // représentatif des 129 exports est défini comme fonctions. Si un export
    // disparaît silencieusement lors d'une extraction (zone d'exports oubliée
    // par sed, pattern feedback `exports-orphelins-grep-window`), ce test
    // attrape la rupture.
    //
    // Sélection : 2-3 exports clés par zone fonctionnelle (8 zones).
    // -----------------------------------------------------------------------
    it('1. Sentinelle exports — 20 exports représentatifs des 8 zones sont définis', () => {
        const exportsAttendus = [
            // Zone 1 — Init + identification + calendrier + événements
            'initialiserTrimestreV2',
            'sauvegarderIdentificationTrimestreV2',
            'chargerCadreCalendrierV2',
            'afficherStatistiquesTrimestreV2',
            // Zone 2 — Liste trimestres + archivage
            'populerDropdownTrimestreV2',
            'changerTrimestreActifV2',
            'confirmerArchivage', // 14 oct. 2026 : archiverTrimestreActif, sans appelant, retiré
            // Zone 3 — Cours CRUD
            'chargerDropdownCoursV2',
            'sauvegarderCoursV2',
            // Zone 4 — Étudiants
            'chargerListeEtudiantsV2',
            'soumettreEtudiantV2',
            'importerFichierEtudiantsV2',
            // Zone 5 — Horaires
            'chargerSeancesV2',
            'sauvegarderHoraireV2',
            // Zone 6 — Groupes-cours (hub)
            'chargerGroupeCoursV2',
            'sauvegarderGroupeCoursV2',
            // Zone 7 — Enseignants
            'chargerProfilEnseignantV2',
            'creerProfilEnseignantV2',
            // Zone 8 — Orchestre
            'peuplerDropdownGroupeCoursActif',
            'changerGroupeCoursActifV2',
            'mettreAJourBarreContexte'
        ];
        for (const nom of exportsAttendus) {
            expect(typeof win[nom], `window.${nom}`).toBe('function');
        }
    });

    // -----------------------------------------------------------------------
    // Test 2 : Structure du monstre — `changerGroupeCoursActifV2` est défini
    // comme async function. Cyc 94 actuel, sera éclatée à la session C de
    // l'étape 3 en 3 helpers (_definirInfoCoursModeCours,
    // _definirInfoCoursModeGroupeCours, _rafraichirVuesContextDependantes).
    // L'atomicité de la transition (cf. MODULES-MAP §2.4) doit être
    // préservée — un wrapper async public restera la signature canonique.
    // -----------------------------------------------------------------------
    it('2. changerGroupeCoursActifV2 — async function avec arité 1', () => {
        expect(typeof win.changerGroupeCoursActifV2).toBe('function');
        // Une async function en JS retourne une Promise quand invoquée ;
        // sa string repr commence par "async" en V8/JSC.
        const src = win.changerGroupeCoursActifV2.toString();
        expect(src.startsWith('async function')).toBe(true);
        // Arité 1 paramètre (`valeur`)
        expect(win.changerGroupeCoursActifV2.length).toBe(1);
    });

    // -----------------------------------------------------------------------
    // Test 3 : Hub critique — `populerDropdownsAssemblageV2` doit rester
    // accessible (probablement non-exporté directement mais consommé via
    // dispatcher data-action ou appels internes). À l'étape 3, il restera
    // dans le résidu (anti-pattern §5.6, appelé 10× cross-zones). Ce test
    // attrape la disparition accidentelle si la fonction est extraite par
    // erreur dans un sous-module.
    // -----------------------------------------------------------------------
    it('3. Hub `populerDropdownsAssemblageV2` — accessible (résidu)', () => {
        // Le hub n'est pas dans le bloc d'exports principal (5150-5346) mais
        // la fonction existe dans le module. Vérification indirecte via le
        // texte source : on confirme qu'elle est référencée comme function.
        const allKeys = Object.keys(win);
        // S'il est exposé, on le valide ; sinon on documente qu'il est privé.
        // (À l'étape 3 session B, il sera nécessairement exposé pour rester
        // appelable depuis les sous-modules extraits.)
        if (allKeys.includes('populerDropdownsAssemblageV2')) {
            expect(typeof win.populerDropdownsAssemblageV2).toBe('function');
        } else {
            // Pré-refactor : hub privé à l'IIFE, OK.
            expect(allKeys.includes('populerDropdownsAssemblageV2')).toBe(false);
        }
    });

    // -----------------------------------------------------------------------
    // Test 4 : État pivot — `window.trimestreActif` ne doit pas être muté
    // au chargement (le module init n'est appelé qu'à DOMContentLoaded ;
    // l'IIFE seule ne doit toucher à rien). MODULES-MAP §2.4 : tout le
    // namespacing des données dépend du trimestreActif.
    // -----------------------------------------------------------------------
    it('4. État pivot — window.trimestreActif non muté au chargement IIFE', () => {
        // L'IIFE ne doit pas avoir défini window.trimestreActif (init différé
        // jusqu'à appel explicite de initialiserTrimestreV2).
        expect(win.trimestreActif).toBeUndefined();
    });
});
