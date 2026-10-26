import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Tests de régression pour le refactoring de productions.js (PLAN-MOYEN-TERME
// §4.2, MODULES-MAP §2.2). Cible MODULES-MAP : 6 tests d'intégration (CRUD
// + import/export + bibliothèque + verrouillage). Périmètre effectif : les
// fonctions du module sont fortement couplées au DOM (document.getElementById,
// alert/confirm) et au stockage (db.get/set, FileReader, Blob). Les helpers
// purs isolables sont peu nombreux :
//
//   - obtenirEcheanceEffective(production, groupeCoursId) — exposée window.X ✓
//   - obtenirEcheancePlusTot(production)                  — privée à l'IIFE
//   - detecterDoublonsProductions(prodLoc, prodBibl)      — privée à l'IIFE
//   - getTypeLabel(type)                                  — exposée window.X ✓
//
// Couverture immédiate (pré-refactor) : seules les pures publiques sont
// testables sans intrusion dans le module. Les pures privées seront promues
// vers `window.X` à l'étape 3 (extraction de productions-core.js) et leurs
// tests ajoutés à ce moment-là. Les 6 cas d'intégration de MODULES-MAP §2.2
// (création, modification, suppression, import/export, bibliothèque,
// verrouillage) restent couverts par le test manuel exhaustif de l'étape 5
// (METHODE-REFACTORING §3 étape 5).
//
// Dette résiduelle à rattraper à l'étape 3 :
//   - test pure : obtenirEcheancePlusTot
//   - test pure : detecterDoublonsProductions
//   - test Playwright : ouvrir Productions + déclencher rendu (anti-pattern §5.6)
//
// Productions.js dépend de plusieurs globaux pour les fonctions non-pures :
// db, cle, BibliothequeUI, echapperHtml, GabaritsUtils, genererIdUnique,
// obtenirCoursActifId, obtenirSeancesCompletes, formaterDateCourte, etc.
// Aucun n'est nécessaire pour les pures testées ici (elles ne réfèrent qu'à
// leur paramètre + window pour les exports).

let win;
let obtenirEcheanceEffective;
let getTypeLabel;

beforeAll(() => {
    // Stubber les globaux que le script consomme au top-level (les exports
    // ne sont évalués qu'à l'appel, mais le chargement de l'IIFE peut
    // accéder à `BibliothequeUI` si une fonction est invoquée au top-level
    // — ce n'est pas le cas pour productions.js, vérifié à la lecture).
    const stubs = {
        // Stubs minimaux : ne sont utilisés que si les fonctions exposées
        // sont effectivement invoquées par les tests. Les pures n'en touchent
        // aucun.
        BibliothequeUI: {
            genererBadgeSource: () => '',
            genererIdCourt: (id) => String(id).slice(0, 6),
            filtrerParModeDemo: (arr) => arr,
            formaterTitreDemo: (titre) => titre,
            estItemDemo: () => false,
            formaterInspireDe: () => '',
            fermerModal: () => {},
            renderAvertissementDoublons: () => '',
            obtenirAuteurActif: () => 'Test',
            forkerItem: (item, prefix) => ({ ...item, id: prefix + 'TEST' })
        },
        // Helpers globaux référencés mais non appelés par les pures
        echapperHtml: (s) => String(s == null ? '' : s),
        cle: (k) => 'test_' + k,
        genererIdUnique: (prefix) => prefix + Math.random().toString(36).slice(2, 8),
        obtenirCoursActifId: () => null,
        obtenirIdentiteCCUtilisateur: () => 'Test',
        formaterDateCourte: (d) => d,
        db: {
            get: async () => [],
            getSync: () => [],
            set: async () => {},
            setSync: () => {}
        },
        // Variable de config.js (let productionEnEdition = null;) — les exports
        // ne la touchent qu'à l'appel, mais le résidu top-level y fait référence
        // dans les commentaires uniquement
        productionEnEdition: null
    };
    win = chargerScript('js/productions.js', stubs);

    // Refactor étape 3 (16 mai 2026) : productions-import-export.js extrait depuis
    // productions.js. Les exports `exporterProductions`, `importerProductions`,
    // `confirmerImportProductions` y vivent désormais. On charge le sous-module
    // dans un sandbox séparé puis on fusionne ses exports dans `win` pour préserver
    // la sentinelle anti-régression.
    chargerScript('js/productions-import-export.js', stubs, win);

    // Refactor étape 3 (16 mai 2026) : productions-liste.js extrait depuis
    // productions.js. Sidebar + CRUD utilisateur (afficherListeProductions,
    // chargerProductionPourModif, creerNouvelleProduction, dupliquerProduction,
    // supprimerProductionActive, dupliquerEtEditerProduction, importerProductionsExternes).
    chargerScript('js/productions-liste.js', stubs, win);

    // Refactor étape 3 (16 mai 2026) : productions-bibliotheque-ui.js extrait depuis
    // productions.js. Modale Gestionnaire de bibliothèque + 14 actions associées
    // (afficherBibliothequeProductions, ajouterProductionIndividuelle, etc.).
    chargerScript('js/productions-bibliotheque-ui.js', stubs, win);

    obtenirEcheanceEffective = win.obtenirEcheanceEffective;
    getTypeLabel = win.getTypeLabel;
});

describe('productions — régression refactoring 2026-mai (pures publiques)', () => {

    // -----------------------------------------------------------------------
    // Canari : le module charge sans erreur dans la sandbox.
    // Une régression silencieuse qui plante au chargement (par exemple un
    // helper consommé au top-level qui n'existe plus) serait attrapée ici.
    // -----------------------------------------------------------------------
    it('0. Canari — productions.js charge et expose les pures publiques', () => {
        expect(typeof obtenirEcheanceEffective).toBe('function');
        expect(typeof getTypeLabel).toBe('function');

        // Vérifier la surface d'exports clés (sentinelle anti-régression).
        // Si une fonction disparaît silencieusement de l'export, ce test
        // attrape la rupture du contrat avec le dispatcher data-action.
        const exportsAttendus = [
            'afficherTableauProductions',
            'afficherFormProduction',
            'sauvegarderProduction',
            'annulerFormProduction',
            'modifierProduction',
            'supprimerProduction',
            'monterEvaluation',
            'descendreEvaluation',
            'gererChangementTypeProduction',
            'mettreAJourPonderationTotale',
            'getTypeLabel',
            'initialiserModuleProductions',
            'exporterProductions',
            'importerProductions',
            'afficherListeProductions',
            'chargerProductionPourModif',
            'creerNouvelleProduction',
            'dupliquerProduction',
            'afficherBibliothequeProductions',
            'obtenirEcheanceEffective',
            'importerProductionsExternes',
            'confirmerImportProductions'
        ];
        for (const nom of exportsAttendus) {
            expect(typeof win[nom], `window.${nom}`).toBe('function');
        }
    });

    // -----------------------------------------------------------------------
    // Test 1 : obtenirEcheanceEffective — résolution multi-groupe + legacy
    // -----------------------------------------------------------------------
    describe('1. obtenirEcheanceEffective', () => {

        it('1.a Mode legacy — pas de echeancesParGroupe : retourne dateEcheance + assignee=true', () => {
            const prod = { dateEcheance: '2026-03-15' };
            const res = obtenirEcheanceEffective(prod, 'GC_quelconque');
            expect(res).toEqual({ date: '2026-03-15', assignee: true });
        });

        it('1.b Mode legacy — dateEcheance vide : retourne null + assignee=true', () => {
            const prod = { dateEcheance: '' };
            const res = obtenirEcheanceEffective(prod, 'GC_quelconque');
            expect(res).toEqual({ date: null, assignee: true });
        });

        it('1.c Multi-groupe — groupeCoursId présent avec entrée : retourne sa date et assignee', () => {
            const prod = {
                dateEcheance: '2026-03-15', // legacy ignoré quand multi
                echeancesParGroupe: {
                    GC_001: { date: '2026-03-20', assignee: true },
                    GC_002: { date: '2026-03-22', assignee: false }
                }
            };
            expect(obtenirEcheanceEffective(prod, 'GC_001')).toEqual({ date: '2026-03-20', assignee: true });
            expect(obtenirEcheanceEffective(prod, 'GC_002')).toEqual({ date: '2026-03-22', assignee: false });
        });

        it('1.d Multi-groupe — groupeCoursId absent du map : fallback legacy', () => {
            const prod = {
                dateEcheance: '2026-03-15',
                echeancesParGroupe: {
                    GC_001: { date: '2026-03-20', assignee: true }
                }
            };
            const res = obtenirEcheanceEffective(prod, 'GC_inconnu');
            expect(res).toEqual({ date: '2026-03-15', assignee: true });
        });

        it('1.e Multi-groupe — entrée sans date : retourne null mais conserve assignee', () => {
            const prod = {
                echeancesParGroupe: {
                    GC_001: { date: null, assignee: true },
                    GC_002: { assignee: false }
                }
            };
            expect(obtenirEcheanceEffective(prod, 'GC_001')).toEqual({ date: null, assignee: true });
            expect(obtenirEcheanceEffective(prod, 'GC_002')).toEqual({ date: null, assignee: false });
        });

        it('1.f Pas de groupeCoursId : fallback legacy même si echeancesParGroupe présent', () => {
            const prod = {
                dateEcheance: '2026-03-15',
                echeancesParGroupe: {
                    GC_001: { date: '2026-03-20', assignee: true }
                }
            };
            const res = obtenirEcheanceEffective(prod, null);
            expect(res).toEqual({ date: '2026-03-15', assignee: true });
        });
    });

    // -----------------------------------------------------------------------
    // Test 2 : getTypeLabel — table de correspondance complète
    // -----------------------------------------------------------------------
    describe('2. getTypeLabel', () => {

        it('2.a Tous les types connus retournent leur libellé', () => {
            expect(getTypeLabel('examen')).toBe('Examen');
            expect(getTypeLabel('travail')).toBe('Travail écrit');
            expect(getTypeLabel('quiz')).toBe('Quiz/Test');
            expect(getTypeLabel('presentation')).toBe('Présentation');
            expect(getTypeLabel('portfolio')).toBe('📁 Portfolio (conteneur)');
            expect(getTypeLabel('artefact-portfolio')).toBe('Artefact d\'un portfolio');
            expect(getTypeLabel('autre')).toBe('Autre');
        });

        it('2.b Type inconnu retourne la valeur d\'entrée (fallback)', () => {
            expect(getTypeLabel('type_invente_2027')).toBe('type_invente_2027');
            expect(getTypeLabel('')).toBe('');
        });
    });

    // -----------------------------------------------------------------------
    // Test 3 : importerProductionsExternes — pure async sur db mocké
    // -----------------------------------------------------------------------
    // importerProductionsExternes est exposée window.X (3955) et utilisée par
    // reserve-ouvrir.js:1120. Elle est appelable depuis l'extérieur — donc
    // testable avec un db mocké. Elle vérifie : ajout vs mise à jour selon
    // option.remplacer, comptage, mode silencieux.
    // -----------------------------------------------------------------------
    describe('3. importerProductionsExternes (canari intégration)', () => {

        // Helper local : charge productions.js + productions-liste.js dans le
        // même sandbox avec db mocké (importerProductionsExternes vit dans
        // productions-liste.js depuis le refactor étape 3, 16 mai 2026).
        function chargerSandbox(stockage) {
            const stubs = {
                BibliothequeUI: { obtenirAuteurActif: () => 'T', forkerItem: () => ({}) },
                echapperHtml: (s) => String(s == null ? '' : s),
                cle: (k) => 'test_' + k,
                genererIdUnique: (p) => p + 'X',
                obtenirCoursActifId: () => null,
                obtenirIdentiteCCUtilisateur: () => 'Test',
                formaterDateCourte: (d) => d,
                db: {
                    get: async (k) => stockage[k] || [],
                    getSync: (k, def) => stockage[k] !== undefined ? stockage[k] : (def || []),
                    set: async (k, v) => { stockage[k] = v; },
                    setSync: (k, v) => { stockage[k] = v; }
                },
                productionEnEdition: null
            };
            const winLocal = chargerScript('js/productions.js', stubs);
            chargerScript('js/productions-liste.js', stubs, winLocal);
            return winLocal;
        }

        it('3.a Tableau vide retourne 0', () => {
            const res = win.importerProductionsExternes([], { silencieux: true });
            expect(res).toBe(0);
        });

        it('3.b null retourne 0', () => {
            const res = win.importerProductionsExternes(null, { silencieux: true });
            expect(res).toBe(0);
        });

        it('3.c Productions sans id sont ignorées', () => {
            const stockage = {};
            const winLocal = chargerSandbox(stockage);

            const res = winLocal.importerProductionsExternes(
                [{ titre: 'sans id' }, { id: 'P1', titre: 'avec id' }],
                { silencieux: true }
            );
            expect(res).toBe(1);
            expect(stockage['test_productions']).toEqual([{ id: 'P1', titre: 'avec id' }]);
        });

        it('3.d Production existante : non remplacée par défaut', () => {
            const stockage = { test_productions: [{ id: 'P1', titre: 'original' }] };
            const winLocal = chargerSandbox(stockage);

            const res = winLocal.importerProductionsExternes(
                [{ id: 'P1', titre: 'modifié' }],
                { silencieux: true }
            );
            expect(res).toBe(0); // pas d'ajout ni mise à jour (option.remplacer absent)
            expect(stockage['test_productions'][0].titre).toBe('original');
        });

        it('3.e Production existante avec remplacer=true : mise à jour', () => {
            const stockage = { test_productions: [{ id: 'P1', titre: 'original' }] };
            const winLocal = chargerSandbox(stockage);

            const res = winLocal.importerProductionsExternes(
                [{ id: 'P1', titre: 'modifié' }, { id: 'P2', titre: 'nouvelle' }],
                { remplacer: true, silencieux: true }
            );
            expect(res).toBe(2);
            expect(stockage['test_productions']).toEqual([
                { id: 'P1', titre: 'modifié' },
                { id: 'P2', titre: 'nouvelle' }
            ]);
        });
    });
});
