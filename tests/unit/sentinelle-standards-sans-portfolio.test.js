/**
 * SENTINELLE (28 oct. 2026) — DES STANDARDS SANS PORTFOLIO, LOT 1 : LE POOL SANS ARTEFACTS (LE CALCUL).
 *
 * Chantier de Grégoire (28 oct., 14 h 54) : « La [PAN] standard peut ne pas avoir de portfolio dans d'autres disciplines
 * que la littérature, par exemple en chimie. » Plan : plans de travail/PLAN-2026-10-28-standards-sans-portfolio.md (§ 1,
 * le banc ; § 3, lot 1) ; décisions : DECISIONS-2026-10-28-construction-de-la-note.md (Q1 à Q6, mots neufs 1 et 2,
 * erratum de Q3, mot neuf 3) ; consignes : CONSIGNE-LOT-2026-10-28-standards-sans-portfolio-lot-1.md et sa retouche (R1-R3).
 *
 * VERROUILLÉ ICI :
 *   A. Le pool sans « Artefact » prend les productions quelle que soit leur pondération (avant : les seules non pondérées) ;
 *      une catégorie n'y restreint rien hors hybride (retouche R1). Avec un « Artefact », le pool d'aujourd'hui (GREG-0 à 2).
 *   B. La cause d'une note qui manque (mot neuf 2), au caractère près : une source, trois lecteurs (profil, rapport, export).
 *   C. La formule du récit (mot neuf 1) : une partie absente ne s'écrit pas ; jamais « terminale × 0 % ».
 *   D. Le doublon réconcilié n'est plus dit « remplacée par une reprise » : ni au récit, ni à la tuile du registre ; aux deux
 *      récits (Standards, sommatif), il se dit « en double · comptée une seule fois » (mot neuf 3, retouche R3).
 *
 * Données fictives (Alice, Bruno). Banc : les modules RÉELS (le bac du banc du 28 oct.). Aucune écriture dans `js/`.
 * Stock : rien n'est réécrit ; tout se lit au calcul (les captures déjà prises gardent leur P).
 * BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, clone } from './_helpers/bac-suivi.js';
import { chargerScript } from './_helpers/charger-script.js';

const DA = { ALICE: '2000001', BRUNO: '2000002' };
const E0 = { id: 'E0', nom: 'IDME banc', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40 }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75 }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100 }
] };
const niveau = (n) => (n >= 85 ? 'E' : n >= 75 ? 'M' : n >= 65 ? 'D' : 'I');
const ev = (da, prodId, note, extra) => Object.assign({
    id: 'EV-' + da + '-' + prodId, etudiantDA: da, productionId: prodId, noteFinale: note, niveauFinal: niveau(note), echelleId: 'E0', ponderationCouverte: 100,
    verrouillee: true, coursId: 'GC1', groupe: '01', dateEvaluation: '2026-05-20T12:00:00.000Z', statutIntegrite: 'recevable', statutRemise: 'evalue', criteres: []
}, extra || {});

/** La forme que l'assistant écrit (wizard-pratique-v2.js). */
function std({ methodeSelection = 'meilleurs', nombreARetenir = 3, categories = null } = {}) {
    const portfolio = { utiliser: true, nombreTotal: 6, nombreARetenir, methodeSelection, minimumCompletion: 3 };
    return { id: 'std-banc', nom: 'STD banc', type: 'standards', calcul_note: { methode: 'conversion_niveaux' }, dansBibliotheque: true,
        configuration: Object.assign({ approcheEvaluation: 'par-artefacts', echelleId: 'E0', grilleId: null, portfolio, notesFinales: false },
            categories ? { categories } : {}) };
}
/* Chimie : trois laboratoires, deux examens, pondérés comme le formulaire Productions l'exige hors « Artefact ». */
function prodChimie({ ponderees = true, terminale = false, categories = null } = {}) {
    const l = [
        { id: 'L1', titre: 'Laboratoire 1', type: 'laboratoire', numero: 1, ponderation: 15 },
        { id: 'L2', titre: 'Laboratoire 2', type: 'laboratoire', numero: 2, ponderation: 15 },
        { id: 'L3', titre: 'Laboratoire 3', type: 'laboratoire', numero: 3, ponderation: 15 },
        { id: 'X1', titre: 'Examen 1', type: 'examen', numero: 4, ponderation: 25 },
        { id: 'X2', titre: 'Examen 2', type: terminale ? 'terminale' : 'examen', numero: 5, ponderation: 30 }
    ].map(p => Object.assign(p, { coursId: 'GC1' }, categories ? { categorie: categories[p.id] } : {}));
    if (!ponderees) l.forEach(p => { delete p.ponderation; });
    return l;
}
const NOTES_CHIMIE = { [DA.ALICE]: { L1: 70, L2: 80, L3: 90, X1: 60, X2: 85 }, [DA.BRUNO]: { L1: 55, L2: 65, L3: 75, X1: 80, X2: 70 } };
const COPIES_CHIMIE = [];
for (const da of [DA.ALICE, DA.BRUNO]) for (const [p, n] of Object.entries(NOTES_CHIMIE[da])) COPIES_CHIMIE.push(ev(da, p, n));
/** Les copies d'Alice réduites à `ids` ; celles de Bruno restent (la production est évaluée dans le groupe). */
const seulement = (ids) => COPIES_CHIMIE.filter(c => c.etudiantDA !== DA.ALICE || ids.includes(c.productionId));
const CATEGORIES = { actif: true, selection: { nombreARetenir: 2, ponderation: 65 }, obligatoires: { nombre: 2, ponderation: 35 } };
const CATEGORIES_CHIMIE = { L1: 'selection', L2: 'selection', L3: 'selection', X1: 'obligatoire', X2: 'obligatoire' };

/* La pratique de Grégoire : six artefacts, un conteneur à 60, une terminale à 40 (STD-1 du banc du 28 oct. = 84,8). */
function prodGreg() {
    const l = [{ id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 60, coursId: 'GC1' }];
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].forEach((id, i) => l.push({ id, titre: 'Artefact ' + (i + 1), type: 'artefact-portfolio', numero: i + 1, ponderation: 0, coursId: 'GC1' }));
    l.push({ id: 'T1', titre: 'Analyse finale', type: 'terminale', numero: 7, ponderation: 40, coursId: 'GC1' });
    return l;
}
const NOTES_GREG = { A1: 60, A2: 70, A3: 88, A4: 92, A5: 75, A6: 80, T1: 82 };
const COPIES_GREG = Object.entries(NOTES_GREG).map(([p, n]) => ev(DA.ALICE, p, n));

const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/entites/production-diagnostique.js', 'js/pratiques/pratique-configurable.js',
    'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js',
    'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js', { chemin: 'js/saisie-presences.js', internes: [] },
    'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/snapshots.js', 'js/export-resultats-finaux.js'];
const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', '__audit', 'ProductionDiagnostique', '_exportResultats'];

function banc({ pratique, productions, evaluations, modules = [] }) {
    const store = storeBase();
    store.test_groupeEtudiants = store.test_groupeEtudiants.filter(e => e.da === DA.ALICE || e.da === DA.BRUNO);
    store.test_groupesCours[0].pratiqueId = pratique.id;
    store.test_pratiquesConfigurables = [clone(pratique)];
    store.test_echellesTemplates = [clone(E0)];
    store.test_productions = clone(productions);
    store.test_evaluationsSauvegardees = clone(evaluations);
    store.test_jugementsDenotation = {};
    let win = null;
    const classe = (nom) => function (config) { return new win[nom](config); };
    const b = monter(store, {
        modules: MODULES.concat(modules), objetsExportes: OBJETS_EXPORTES, aujourdhui: '2026-10-28', journal: [],
        globaux: {
            PratiqueConfigurable: classe('PratiqueConfigurable'), PratiqueSommative: classe('PratiqueSommative'), PratiquePANStandards: classe('PratiquePANStandards'),
            PratiquePanSpecifications: classe('PratiquePanSpecifications'),
            obtenirEcheanceEffective: (production) => ({ date: production.dateEcheance || null, assignee: true }),
            resoudreModeleParId: (type, id) => { const l = store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []; return clone(l.find(m => m && m.id === id) || null); },
            obtenirInterventionsEtudiant: () => [], aDesInfosConfidentielles: () => false
        }
    });
    win = b.win;
    win.calculerEtStockerIndicesCP();
    return Object.assign(b, { pratiqueId: pratique.id });
}

/** Les quatre chemins de la note (P stocké, Comparateur, profil, export) et ce que chacun dit d'une note qui manque. */
function note(b, da = DA.ALICE) {
    const w = b.win;
    const d = w.calculerDetailsNoteFinale(da);
    const entree = b.store.test_indicesCP[da] && b.store.test_indicesCP[da].actuel;
    const sim = w.simulerIndices(da, b.pratiqueId);
    const ex = w._exportResultats;
    const ligne = ex.construireLignesSynthese([{ da, nom: 'X', prenom: 'Y' }], { pratiqueId: b.pratiqueId, notesFinales: ex.notesFinaliseesDe(b.pratiqueId) },
        (x, id) => w.simulerIndices(x, id))[0];
    return {
        P: entree && entree.noteConstructible !== false ? entree.P : null,
        comparateur: sim && sim.noteConstructible !== false ? sim.P : null,
        profil: typeof d.noteFinale === 'number' ? Math.round(d.noteFinale * 100) / 100 : d.noteFinale,
        erreur: d.erreur,
        cause: w.causeNoteNonConstructible(da),
        export: [ligne[8], ligne[9]],
        formule: d.recit ? d.recit.synthese.formuleTexte : null,
        recit: d.recit ? d.recit.resultats : []
    };
}
const avec = (pratique, productions, evaluations) => note(banc({ pratique, productions, evaluations }));

// Les phrases du mot neuf 2, validées par Grégoire le 28 oct. 2026 à 20 h 13 — recopiées, au caractère près.
const AUCUNE_PRODUCTION = 'Aucune production retenue pour la note n\'est encore évaluée.';
const AUCUN_ARTEFACT = 'Aucun artefact du portfolio n\'est encore évalué.';
const TERMINALE_SEULE_PRODUCTIONS = 'Seule l\'évaluation terminale a une note. En standards, la note du cours s\'appuie aussi sur les productions retenues : elle ne se calcule pas sur la terminale seule.';
const TERMINALE_SEULE_ARTEFACTS = 'Seule l\'évaluation terminale a une note. En standards, la note du cours s\'appuie aussi sur les artefacts du portfolio : elle ne se calcule pas sur la terminale seule.';

/* ================================================================ A. LE POOL */
describe('A · le pool sans « Artefact » prend les productions évaluées, quelle que soit leur pondération', () => {
    it('GREG-0 à GREG-2 : la pratique de Grégoire garde sa note, 84,8 (l\'invariant, décision Q2)', () => {
        expect(avec(std(), prodGreg(), COPIES_GREG)).toMatchObject({ profil: 84.8, P: 85, comparateur: 85, export: [85, 'provisoire'], erreur: null });
        const sansPortfolio = std(); sansPortfolio.configuration.portfolio.utiliser = false;   // GREG-1
        expect(avec(sansPortfolio, prodGreg(), COPIES_GREG).profil).toBe(84.8);
        // GREG-2 : une production pondérée de plus, « obligatoire », et A1 « sélection », hors hybride.
        const g2 = prodGreg().concat([{ id: 'W1', titre: 'Exercice', type: 'travail', numero: 8, ponderation: 10, coursId: 'GC1', categorie: 'obligatoire' }]);
        g2.find(p => p.id === 'A1').categorie = 'selection';
        expect(avec(std(), g2, COPIES_GREG.concat([ev(DA.ALICE, 'W1', 50)])).profil).toBe(84.8);
    });

    it('CHIM-1 laboratoires et examens pondérés, « Tous » : 77 (avant : non constructible, sans cause)', () => {
        expect(avec(std({ methodeSelection: 'tous' }), prodChimie(), COPIES_CHIMIE))
            .toMatchObject({ profil: 77, P: 77, comparateur: 77, export: [77, 'provisoire'], erreur: null });
    });

    it('CHIM-2 et CHIM-5 (les mêmes sans pondération ; plus un test diagnostique) restent 77', () => {
        expect(avec(std({ methodeSelection: 'tous' }), prodChimie({ ponderees: false }), COPIES_CHIMIE).profil).toBe(77);
        const c5 = prodChimie({ ponderees: false }).concat([{ id: 'D0', titre: 'Test diagnostique', type: 'quiz', numero: 0, diagnostique: true, coursId: 'GC1' }]);
        expect(avec(std({ methodeSelection: 'tous' }), c5, COPIES_CHIMIE.concat([ev(DA.ALICE, 'D0', 10)])).profil).toBe(77);
    });

    it('CHIM-3 hybride, labos « sélection » (N = 2), examens « obligatoire », pondérés : 80,63 (avant : non constructible)', () => {
        // (80 + 90) / 2 × 65 + (60 + 85) / 2 × 35, sur 100.
        expect(avec(std({ categories: CATEGORIES }), prodChimie({ categories: CATEGORIES_CHIMIE }), COPIES_CHIMIE))
            .toMatchObject({ profil: 80.63, P: 81, comparateur: 81 });
    });

    it('CHIM-4 l\'Examen 2 typé terminale (30 %), le reste pondéré : 75 × 70 % + 85 × 30 % = 78 (avant : non constructible ; erratum de Q3)', () => {
        expect(avec(std({ methodeSelection: 'tous' }), prodChimie({ terminale: true }), COPIES_CHIMIE)).toMatchObject({ profil: 78, P: 78, export: [78, 'provisoire'] });
    });

    it('une catégorie restée hors hybride, sans « Artefact » : elle ne restreint rien, toutes les productions sont au pool (77)', () => {
        // Retouche R1 (28 oct. 2026) : une catégorie ne compte qu'en hybride. La catégorie est écrite sur la PRODUCTION et
        // survit au retrait de l'hybride ; au lot 1, elle restreignait le pool à L1 (70).
        for (const ponderees of [true, false]) {
            const p = prodChimie({ ponderees }); p.find(x => x.id === 'L1').categorie = 'selection';
            expect(avec(std({ methodeSelection: 'tous' }), p, COPIES_CHIMIE).profil, ponderees ? 'pondérées' : 'non pondérées').toBe(77);
        }
    });

    it('la marque « obligatoire » d\'une terminale ne fait pas un pool désigné (#339) : les autres productions restent au pool', () => {
        const p = prodChimie({ terminale: true }); p.find(x => x.id === 'X2').categorie = 'obligatoire';
        expect(avec(std({ methodeSelection: 'tous' }), p, COPIES_CHIMIE).profil).toBe(78);
    });
});

/* ================================================================ B. LA CAUSE */
describe('B · une note qui manque dit pourquoi (mot neuf 2), au profil, au rapport et à l\'export', () => {
    const attendu = (phrase) => ({ profil: null, P: null, comparateur: null, erreur: phrase, cause: phrase, export: ['', 'non constructible – ' + phrase] });

    it('CHIM-6 seule l\'Examen 2 (terminale) est évalué : non constructible, la seconde phrase, « productions »', () => {
        expect(avec(std({ methodeSelection: 'tous' }), prodChimie({ terminale: true }), seulement(['X2']))).toMatchObject(attendu(TERMINALE_SEULE_PRODUCTIONS));
    });
    it('CHIM-7 rien d\'évalué : la première phrase, « productions »', () => {
        expect(avec(std({ methodeSelection: 'tous' }), prodChimie(), seulement([]))).toMatchObject(attendu(AUCUNE_PRODUCTION));
    });
    it('GREG-3 aucun artefact évalué : la première phrase, « artefact »', () => {
        expect(avec(std(), prodGreg(), [])).toMatchObject(attendu(AUCUN_ARTEFACT));
    });
    it('GREG-4 seule la terminale : la seconde phrase, « artefacts du portfolio »', () => {
        expect(avec(std(), prodGreg(), COPIES_GREG.filter(c => c.productionId === 'T1'))).toMatchObject(attendu(TERMINALE_SEULE_ARTEFACTS));
    });

    it('une note qui se calcule, ou une erreur de configuration, ne porte pas la phrase', () => {
        expect(avec(std({ methodeSelection: 'tous' }), prodChimie(), COPIES_CHIMIE).cause).toBeNull();
        const sansPoidsTerminale = prodChimie({ terminale: true }); delete sansPoidsTerminale.find(x => x.id === 'X2').ponderation;
        const n = avec(std({ methodeSelection: 'tous' }), sansPoidsTerminale, seulement([]));
        expect(n.erreur).toMatch(/^Pondération manquante/);
        expect(n.cause).toBeNull();
    });

    it('la source unique : la carte du profil, le rapport et l\'export rendent la même chaîne (CHIM-6)', () => {
        const b = banc({ pratique: std({ methodeSelection: 'tous' }), productions: prodChimie({ terminale: true }), evaluations: seulement(['X2']),
            modules: ['js/profil-etudiant-rapport.js', { chemin: 'js/profil-etudiant-sections-affichage.js', internes: ['genererSectionProductions'] }] });
        const carte = b.win.__audit['profil-etudiant-sections-affichage.js'].genererSectionProductions(DA.ALICE);
        expect(carte).toContain('<div class="note-finale-non-evalue">' + b.win.echapperHtml(TERMINALE_SEULE_PRODUCTIONS) + '</div>');
        expect(b.win.genererRapportAPI(DA.ALICE)).toContain('Performance : non constructible (' + TERMINALE_SEULE_PRODUCTIONS + ')');
        expect(note(b).export[1]).toBe('non constructible – ' + TERMINALE_SEULE_PRODUCTIONS);
    });

    it('retouche R2 et R2 bis : une cause propre à l\'étudiant·e garde la carte (son titre) et son bouton, sans note, sans l\'alerte ni son bouton (CHIM-6, GREG-3)', () => {
        const carte = (pratique, productions, evaluations, phrase) => {
            const { win } = banc({ pratique, productions, evaluations,
                modules: [{ chemin: 'js/profil-etudiant-sections-affichage.js', internes: ['genererSectionProductions'] }] });
            return [win.__audit['profil-etudiant-sections-affichage.js'].genererSectionProductions(DA.ALICE), win.echapperHtml(phrase)];
        };
        for (const [cas, [html, phrase]] of [
            ['CHIM-6', carte(std({ methodeSelection: 'tous' }), prodChimie({ terminale: true }), seulement(['X2']), TERMINALE_SEULE_PRODUCTIONS)],
            ['GREG-3', carte(std(), prodGreg(), [], AUCUN_ARTEFACT)]]) {
            expect(html, cas).toContain('Note provisoire de session');
            expect(html, cas).toContain('<div class="note-finale-non-evalue">' + phrase + '</div>');
            expect(html, cas).not.toContain('Note finale non calculable');
            expect(html, cas).toContain('title="Modifier le statut (provisoire / finale) et les pondérations dans les réglages de la pratique">Réglages de la pratique</button>');
            expect(html, cas).not.toContain('corriger ses paramètres');
            expect(html, cas).not.toContain('note-finale-total');
            expect(html, cas).not.toContain('Basée uniquement sur le portfolio');
        }
    });

    it('retouche R2 : une erreur de configuration garde l\'alerte et le bouton des réglages', () => {
        const sansPoidsTerminale = prodChimie({ terminale: true }); delete sansPoidsTerminale.find(x => x.id === 'X2').ponderation;
        const html = banc({ pratique: std({ methodeSelection: 'tous' }), productions: sansPoidsTerminale, evaluations: seulement([]),
            modules: [{ chemin: 'js/profil-etudiant-sections-affichage.js', internes: ['genererSectionProductions'] }] })
            .win.__audit['profil-etudiant-sections-affichage.js'].genererSectionProductions(DA.ALICE);
        expect(html).toContain('<strong>Note finale non calculable.</strong> Pondération manquante');
        expect(html).toContain('Ouvrir les réglages de cette pratique pour corriger ses paramètres');
    });

    it('le panneau « Développement des habiletés » garde sa règle et son « aucun évalué » : la cause n\'est pas une erreur de configuration (GREG-3)', () => {
        const b = banc({ pratique: std(), productions: prodGreg(), evaluations: [],
            modules: [{ chemin: 'js/profil-etudiant-sections-affichage.js', internes: ['_lireNotePourPanneauHabiletes'] }] });
        const lue = b.win.__audit['profil-etudiant-sections-affichage.js']._lireNotePourPanneauHabiletes(DA.ALICE, prodGreg());
        expect(lue).not.toBeNull();
        expect(lue.retenues).toEqual([]);
    });

    it('la phrase n\'est écrite qu\'à un endroit : le registre de la famille Standards', async () => {
        const { readFileSync, readdirSync } = await import('node:fs');
        const path = await import('node:path');
        const racine = path.resolve(import.meta.dirname, '..', '..');
        const fichiers = ['js', 'js/pratiques'].flatMap(d => readdirSync(path.join(racine, d)).filter(f => f.endsWith('.js')).map(f => d + '/' + f));
        const lieux = fichiers.filter(f => readFileSync(path.join(racine, f), 'utf8').includes('ne se calcule pas sur la terminale seule'));
        expect(lieux).toEqual(['js/pratiques/pratique-registre.js']);
    });
});

/* ================================================================ C. LA FORMULE */
describe('C · la formule du récit (mot neuf 1) : une partie absente ne s\'écrit pas', () => {
    it('avec un « Artefact » et une terminale : « portfolio × 60 % + terminale × 40 % » (inchangé)', () => {
        expect(avec(std(), prodGreg(), COPIES_GREG).formule).toBe('portfolio × 60 % + terminale × 40 %');
    });
    it('sans « Artefact », avec une terminale : « productions retenues × 70 % + terminale × 30 % »', () => {
        expect(avec(std({ methodeSelection: 'tous' }), prodChimie({ terminale: true }), COPIES_CHIMIE).formule).toBe('productions retenues × 70 % + terminale × 30 %');
    });
    it('avec un « Artefact », sans terminale : « moyenne du portfolio »', () => {
        const sansTerminale = prodGreg().filter(p => p.type !== 'terminale' && p.type !== 'portfolio');
        expect(avec(std(), sansTerminale, COPIES_GREG).formule).toBe('moyenne du portfolio');
    });
    it('sans « Artefact » ni terminale : « moyenne des productions retenues » (avant : « portfolio × 100 % + terminale × 0 % »)', () => {
        const n = avec(std({ methodeSelection: 'tous' }), prodChimie(), COPIES_CHIMIE);
        expect(n.formule).toBe('moyenne des productions retenues');
        expect(n.formule).not.toContain('terminale');
    });
});

/* ================================================================ D. LE DOUBLON RÉCONCILIÉ */
describe('D · un doublon réconcilié n\'est pas « remplacée par une reprise »', () => {
    // A2 : une reprise réévaluée (l'originale est remplacée) ; A3 : un doublon note-égale réconcilié (#360).
    const copies = () => COPIES_GREG.map(e => (e.productionId === 'A2' ? Object.assign({}, e, { remplaceeParId: 'R-A2' })
        : e.productionId === 'A3' ? Object.assign({}, e, { id: 'DBL-A3', remplaceeParId: 'EV-' + DA.ALICE + '-A3', reconcilieParDoublon: true }) : e))
        .concat([ev(DA.ALICE, 'A2', 74, { id: 'R-A2', repriseDeId: 'EV-' + DA.ALICE + '-A2' }), ev(DA.ALICE, 'A3', 88)]);

    it('au récit Standards : la reprise garde « remplacée par une reprise », le doublon dit « en double · comptée une seule fois »', () => {
        const n = avec(std(), prodGreg(), copies());
        const sort = (id) => n.recit.filter(r => r.sort === 'remplace' && r.label === id).map(r => r.detail);
        expect(sort('Artefact 2')).toEqual(['remplacée par une reprise']);
        expect(sort('Artefact 3')).toEqual(['en double · comptée une seule fois']);
    });

    it('au récit sommatif : le doublon dit « en double · comptée une seule fois » (mot neuf 3, le même mot qu\'en standards)', () => {
        const som = { id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' }, dansBibliotheque: true, configuration: {} };
        const prods = [{ id: 'P1', titre: 'Dissertation', type: 'travail', ponderation: 40, coursId: 'GC1' }, { id: 'P2', titre: 'Examen', type: 'examen', ponderation: 60, coursId: 'GC1' }];
        const copies = [ev(DA.ALICE, 'P1', 80), ev(DA.ALICE, 'P2', 90),
            ev(DA.ALICE, 'P1', 80, { id: 'DBL-P1', remplaceeParId: 'EV-' + DA.ALICE + '-P1', reconcilieParDoublon: true })];
        const b = banc({ pratique: som, productions: prods, evaluations: copies });
        const recit = b.win.simulerIndices(DA.ALICE, b.pratiqueId).recit;
        expect(recit.resultats.filter(r => r.sort === 'remplace' && r.label === 'Dissertation').map(r => r.detail))
            .toEqual(['en double · comptée une seule fois']);
    });

    it('à la tuile du registre longitudinal : ni le doublon ni l\'originale qui compte encore (E4) ne le disent ; la reprise réévaluée, si', () => {
        const store = storeBase();
        Object.keys(store).filter(k => k.startsWith('test_')).forEach(k => delete store[k]);
        const base = { etudiantDA: DA.ALICE, coursId: 'C101', grilleId: 'G1', grilleNom: 'Grille-5', echelleId: 'ECH1', criteres: [], noteFinale: 70, niveauFinal: 'D', verrouillee: true };
        Object.assign(store, {
            trimestres: [{ id: 'a2025', nom: 'Automne 2025', session: 'A', annee: 2025, actif: true, archive: true }],
            cours: [{ id: 'C101', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature' }],
            a2025_groupeEtudiants: [{ da: DA.ALICE, nom: 'Assidu', prenom: 'Alice', groupe: '00001', coursId: 'C101', statut: 'actif' }],
            a2025_evaluationsSauvegardees: [
                Object.assign({}, base, { id: 'O1', productionNom: 'Reprise réévaluée', dateEvaluation: '2025-10-01', remplaceeParId: 'R1' }),
                Object.assign({}, base, { id: 'R1', productionNom: 'Sa reprise', dateEvaluation: '2025-10-02' }),
                Object.assign({}, base, { id: 'O2', productionNom: 'En fenêtre de reprise', dateEvaluation: '2025-10-03', remplaceeParId: 'R2' }),
                Object.assign({}, base, { id: 'R2', productionNom: 'Reprise ouverte', dateEvaluation: '2025-10-04', noteFinale: null, verrouillee: false }),
                Object.assign({}, base, { id: 'D1', productionNom: 'Doublon', dateEvaluation: '2025-10-05', remplaceeParId: 'K1', reconcilieParDoublon: true }),
                Object.assign({}, base, { id: 'K1', productionNom: 'Copie gardée', dateEvaluation: '2025-10-06' }),
                Object.assign({}, base, { id: 'O3', productionNom: 'Reprise absente du dossier', dateEvaluation: '2025-10-07', remplaceeParId: 'AILLEURS' })
            ],
            a2025_grillesTemplates: [{ id: 'G1', nom: 'Grille-5', criteres: [] }],
            a2025_echellesTemplates: [{ id: 'ECH1', nom: 'IDME', niveaux: [{ code: 'D', nom: 'En Développement' }] }]
        });
        const registre = chargerScript('js/pratiques/pratique-registre.js', {}, {});
        const b = monter(store, { modules: ['js/registre-longitudinal.js'], objetsExportes: ['registreLongitudinal'], globaux: {
            cle: (k) => 'a2025_' + k, cleSource: (k, t) => t + '_' + k, obtenirTrimestres: () => clone(store.trimestres),
            calculerEtStockerIndicesCP() {}, calculerTousLesIndices: () => ({}), originaleEstRemplacee: registre.originaleEstRemplacee } });
        return b.win.registreLongitudinal.inscrire(DA.ALICE).then(() => {
            b.win.initialiserRegistreLongitudinal();
            const tous = (el, t, r = []) => { if (t(el)) r.push(el); (el.children || []).forEach(c => tous(c, t, r)); return r; };
            const zone = b.elements['registre-longitudinal-conteneur'].children.find(c => c.id === 'rl-zone-inscrits');
            const contexte = {};
            tous(zone, el => el.className === 'rl-tuile').forEach(t => {
                const entete = t.children[0].children.map(c => c.textContent);
                contexte[entete[0]] = entete.filter(x => x.includes('Grille-5')).join('');
            });
            expect(contexte['Reprise réévaluée']).toBe('Grille-5 · remplacée par une reprise');
            expect(contexte['En fenêtre de reprise']).toBe('Grille-5');
            expect(contexte['Doublon']).toBe('Grille-5');
            // La tuile ne peut pas savoir : la reprise n'est pas dans le dossier. Comme avant.
            expect(contexte['Reprise absente du dossier']).toBe('Grille-5 · remplacée par une reprise');
        });
    });
});

/* ================================================================ E. LA PHRASE DE L'AIDE QUI N'ÉTAIT QUE LUE */
describe('E · l\'Aide, lot 4 (29 oct. 2026) : « Une production retenue non recevable sort du calcul », mesurée hors artefact', () => {
    // Consigne : plans de travail/CONSIGNE-LOT-2026-10-28-aide-lot-4-les-trous.md (§ 1, trou 2) ; la phrase de la réécriture
    // Standards validée le 29 oct. à 5 h 12 était « lue, non mesurée pour une production qui n'est pas un artefact ».
    it('CHIM-1, Laboratoire 1 non recevable (plagiat) : hors du pool, (80 + 90 + 60 + 85) / 4 = 78,75 — pas un 0 (63)', () => {
        const copies = COPIES_CHIMIE.map(c => (c.etudiantDA === DA.ALICE && c.productionId === 'L1' ? Object.assign(clone(c), { statutIntegrite: 'plagiat' }) : c));
        expect(avec(std({ methodeSelection: 'tous' }), prodChimie(), copies)).toMatchObject({ profil: 78.75, P: 79, erreur: null });
    });
});

// JOURNAL DES BREAK-TESTS (28 oct. 2026) — copie de référence, mutation, lancement, restauration (empreinte sha256 identique).
//   M1 pratique-registre.js — le repli d'avant (les seules productions non pondérées)          → 6 rouges (CHIM-1, 3, 4 ; l'égarée ;
//      la terminale « obligatoire » ; la note qui se calcule)
//   M2 profil-etudiant-actions.js — `_causeNoteAbsenteStd` rend null                           → 5 rouges (CHIM-6, 7 ; GREG-3, 4 ; source unique)
//   M3 pratique-registre.js — la seconde phrase ne passe plus avant la première                 → 3 rouges (CHIM-6, GREG-4, source unique)
//   M4 profil-etudiant-actions.js — la formule écrit toujours « … + terminale × … »             → 2 rouges (les deux « moyenne … »)
//   M5 profil-etudiant-actions.js — le doublon retourne parmi les « remplacée par une reprise » → 1 rouge (récit)
//   M6 registre-longitudinal.js — la tuile d'avant (tout `remplaceeParId`)                     → 1 rouge (tuile)
//   M7 pratique-registre.js — la catégorie ne désigne plus le pool                              → 1 rouge (l'égarée) [périmé : c'est R1]
//   M8 profil-etudiant-sections-affichage.js — le panneau relit toute `erreur`                  → 1 rouge (panneau)
// RETOUCHE R1-R3 (28 oct. 2026, 24 essais) — même procédure, arbre restauré identique (sha256) :
//   R-M1 pratique-registre.js — la restriction aux catégories remise                           → 1 rouge (la catégorie restée)
//   R-M2 profil-etudiant-actions.js — « doublon note-égale »                                    → 1 rouge (récit Standards)
//   R-M3 pratique-sommative.js — « doublon note-égale · exclu de la moyenne »                   → 1 rouge (récit sommatif)
//   R-M4 profil-etudiant-sections-affichage.js — toute `erreur` rend l'alerte                   → 2 rouges (source unique ; R2 carte)
//   R-M5 [périmé : R2 bis, le bouton de la carte reste quand la cause est propre à l'étudiant·e]
//   R-M6 profil-etudiant-sections-affichage.js — `_totalCarteNote` rend le total, pas la phrase  → 2 rouges (source unique ; R2 carte)
//   Playwright (WebKit) : R-M4 → CHIM-6 et GREG-3 rouges, l'erreur de configuration verte.
// RETOUCHE R2 bis (28 oct. 2026) : `|| details.causeNoteAbsente` remis dans `_boutonReglagesCarteNote`, arbre restauré
//   → Vitest : 1 rouge (R2 carte) ; Playwright (WebKit) : CHIM-6 et GREG-3 rouges (0 bouton au lieu de 1).
