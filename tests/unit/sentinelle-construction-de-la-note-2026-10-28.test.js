/**
 * SENTINELLE (28 oct. 2026) — COMMENT CHAQUE PRATIQUE CONSTRUIT LA NOTE (#1152, trou 2 de l'Aide, mesure en lecture seule).
 *
 * Gardée comme sentinelle : les textes du trou 2 décrivent ce que ce banc mesure. Si un cas rougit, la note ne se
 * construit plus comme l'Aide le dit — corriger le cas ET le texte. ⚠ Trois cas figent des écarts nommés au rapport,
 * à trancher par Grégoire (SOM-2/SOM-4 : un artefact pèse 1 ; SOM-C11 : « Portfolio de progression » sans effet ;
 * STD-H2 : le N de l'assistant ignoré en hybride) : ils rougiront le jour où l'écart se corrige, et c'est voulu.
 * Break-test du 28 oct. : `|| 1` → `?? 1` dans pratique-sommative.js rougit SOM-2, SOM-4 et SOM-C11.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-28-mesure-construction-de-la-note.md ; rapport :
 * plans de travail/RAPPORT-2026-10-28-construction-de-la-note.md (chaque mesure y renvoie par son nom de cas).
 *
 * Monte les modules RÉELS (le bac de #716 et de la sentinelle du 28 oct. sur les copies non recevables, plus
 * production-diagnostique.js) et lit, pour chaque cas, les quatre chemins de la note : l'indice P stocké
 * (`calculerEtStockerIndicesCP`), le Comparateur et l'export (`simulerIndices`), et, en standards, la note du profil
 * (`calculerDetailsNoteFinale`, non arrondie). Données fictives. Aucune écriture dans `js/`.
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, clone } from './_helpers/bac-suivi.js';

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
const remplacer = (copies, da, prodId, champs) => copies.map(e => (e.etudiantDA === da && e.productionId === prodId ? Object.assign({}, e, champs) : e));
const retirer = (copies, da, prodId) => copies.filter(e => !(e.etudiantDA === da && e.productionId === prodId));
/** Ce que fait `appliquerJetonReprise` (evaluation-jetons.js) : l'originale gardée (`remplaceeParId`) ou supprimée ; la reprise, déverrouillée. */
function reprise(copies, da, prodId, { garder = true, reevaluee = null } = {}) {
    const orig = copies.find(e => e.etudiantDA === da && e.productionId === prodId);
    const nouvelle = Object.assign({}, orig, { id: orig.id + '-R', repriseDeId: orig.id, jetonRepriseApplique: true, verrouillee: false });
    if (reevaluee !== null) Object.assign(nouvelle, { noteFinale: reevaluee, niveauFinal: niveau(reevaluee), verrouillee: true });
    const base = garder ? remplacer(copies, da, prodId, { remplaceeParId: nouvelle.id, archivee: true }) : retirer(copies, da, prodId);
    return base.concat([nouvelle]);
}

/* ---------------------------------------------------------------- Sommative */
const PROD_SOM = [
    { id: 'P1', titre: 'Dissertation', type: 'travail', ponderation: 40, coursId: 'GC1' },
    { id: 'P2', titre: 'Examen', type: 'examen', ponderation: 60, coursId: 'GC1' }
];
const COPIES_SOM = [ev(DA.ALICE, 'P1', 80), ev(DA.ALICE, 'P2', 90), ev(DA.BRUNO, 'P1', 62), ev(DA.BRUNO, 'P2', 71)];
const somConfigurable = (extra) => Object.assign({ id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' },
    dansBibliotheque: true, configuration: {} }, extra || {});
/** La forme que l'assistant écrit pour un verrou (wizard-pratique-v2.js, `conditions_speciales`, action « echec »). */
const VERROU_ASSISTANT = [{ type: 'double_verrou', condition: { evaluation: 'Examen', comparateur: '<', seuil: 60 }, consequence: { action: 'echec', note_max: 55 } }];

/* ---------------------------------------------------------------- Spécifications */
const PROD_SPE = [
    { id: 'D1', titre: 'Dissertation 1', type: 'dissertation', coursId: 'GC1' },
    { id: 'X1', titre: 'Examen 1', type: 'examen', coursId: 'GC1' },
    { id: 'D2', titre: 'Dissertation 2', type: 'dissertation', coursId: 'GC1' },
    { id: 'F1', titre: 'Dossier', type: 'dossier', coursId: 'GC1' }
];
const COPIES_SPE = [ev(DA.ALICE, 'D1', 80), ev(DA.ALICE, 'X1', 90), ev(DA.ALICE, 'D2', 87.5), ev(DA.ALICE, 'F1', 72),
    ev(DA.BRUNO, 'D1', 71), ev(DA.BRUNO, 'X1', 50), ev(DA.BRUNO, 'D2', 88), ev(DA.BRUNO, 'F1', 90)];
const TYPES_SPE = [{ id: 'dissertation', nom: 'Dissertation' }, { id: 'examen', nom: 'Examen' }, { id: 'dossier', nom: 'Dossier' }];
/** La forme que l'application écrit (gabarit, éditeur) : `forfaits` + un seuil à la racine (#708). */
const speForfaits = ({ seuil = 70, echec = true } = {}) => ({ id: 'spe-banc', nom: 'SPE banc', type: 'specifications', calcul_note: { methode: 'specifications' },
    dansBibliotheque: true, configuration: Object.assign({ type: 'specifications', typesTravaux: clone(TYPES_SPE),
        forfaits: [
            { lettre: 'A', note: 100, travaux: { dissertation: 2, examen: 1, dossier: 1 } },
            { lettre: 'B', note: 80, travaux: { dissertation: 2, examen: 1 } },
            { lettre: 'C', note: 60, travaux: { dissertation: 1, examen: 1 } }
        ].concat(echec ? [{ lettre: 'F', note: 50, travaux: {} }] : []) }, seuil === null ? {} : { seuilAcceptable: seuil }) });

/* ---------------------------------------------------------------- Standards : six artefacts, une terminale */
function prodSTD({ categories = null, conteneur = true } = {}) {
    const l = conteneur ? [{ id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 60, coursId: 'GC1' }] : [];
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].forEach((id, i) => l.push(Object.assign({ id, titre: 'Artefact ' + (i + 1), type: 'artefact-portfolio', numero: i + 1,
        ponderation: 0, coursId: 'GC1' }, categories ? { categorie: categories[id] } : {})));
    l.push({ id: 'T1', titre: 'Analyse finale', type: 'terminale', numero: 7, ponderation: 40, coursId: 'GC1' });
    return l;
}
const NOTES_STD = { [DA.ALICE]: { A1: 60, A2: 70, A3: 88, A4: 92, A5: 75, A6: 80, T1: 82 }, [DA.BRUNO]: { A1: 90, A2: 55, A3: 72, A4: 66, A5: 95, A6: 70, T1: 68 } };
const COPIES_STD = [];
for (const da of [DA.ALICE, DA.BRUNO]) for (const [p, n] of Object.entries(NOTES_STD[da])) COPIES_STD.push(ev(da, p, n));
const CATEGORIES = { A1: 'selection', A2: 'selection', A3: 'selection', A4: 'selection', A5: 'obligatoire', A6: 'obligatoire' };
/** La forme que l'assistant écrit (wizard-pratique-v2.js) ; en hybride, `methodeSelection: 'meilleurs'` et `categories`. */
function std({ methodeSelection = 'meilleurs', nombreARetenir = 3, notesFinales = false, categories = null, reglesConformite, minimumCompletion = 3 } = {}) {
    const portfolio = { utiliser: true, nombreTotal: 6, nombreARetenir, methodeSelection, minimumCompletion };
    if (reglesConformite) portfolio.reglesConformite = reglesConformite;
    return { id: 'std-banc', nom: 'STD banc', type: 'standards', calcul_note: { methode: 'conversion_niveaux' }, dansBibliotheque: true,
        configuration: Object.assign({ approcheEvaluation: 'par-artefacts', echelleId: 'E0', grilleId: null, portfolio, notesFinales },
            categories ? { categories } : {}) };
}

/* ---------------------------------------------------------------- Dénotation */
const DEN = { id: 'den-banc', nom: 'DEN banc', type: 'denotation', calcul_note: { methode: 'jugement_global' }, dansBibliotheque: true,
    configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: [{ id: 'c1', nom: 'Lire' }, { id: 'c2', nom: 'Écrire' }], suggestion: { methode: 'mode' } } };
const jugement = (cibles, note) => ({ 'den-banc': { [DA.ALICE]: { ciblesAtteintes: cibles, noteFinale: note, justification: 'Banc', date: '2026-05-01' } } });

/* ---------------------------------------------------------------- Le bac */
const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/entites/production-diagnostique.js', 'js/pratiques/pratique-configurable.js',
    'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js',
    'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js', { chemin: 'js/saisie-presences.js', internes: [] },
    'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/snapshots.js', 'js/export-resultats-finaux.js'];
const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', '__audit', 'ProductionDiagnostique', '_exportResultats'];

function banc({ pratique, productions, evaluations, jugements = {}, pratiqueId = null }) {
    const store = storeBase();
    store.test_groupeEtudiants = store.test_groupeEtudiants.filter(e => e.da === DA.ALICE || e.da === DA.BRUNO);
    store.test_groupesCours[0].pratiqueId = pratiqueId || pratique.id;
    store.test_pratiquesConfigurables = pratique ? [clone(pratique)] : [];
    store.test_echellesTemplates = [clone(E0)];
    store.test_productions = clone(productions);
    store.test_evaluationsSauvegardees = clone(evaluations);
    store.test_jugementsDenotation = clone(jugements);
    const journal = [];
    let win = null;
    const classe = (nom) => function (config) { return new win[nom](config); };
    const b = monter(store, {
        modules: MODULES, objetsExportes: OBJETS_EXPORTES, aujourdhui: '2026-10-28', journal,
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
    return Object.assign(b, { journal, pratiqueId: pratiqueId || pratique.id });
}
/** Les chemins de la note pour un élève. `profil` : la note du profil (standards), à deux décimales, non arrondie à l'entier. */
function note(b, da = DA.ALICE) {
    const sim = b.win.simulerIndices(da, b.pratiqueId);
    const d = b.win.calculerDetailsNoteFinale(da);
    const entree = b.store.test_indicesCP[da] && b.store.test_indicesCP[da].actuel;
    const ex = b.win._exportResultats;
    const ligne = ex
        ? ex.construireLignesSynthese([{ da, nom: 'X', prenom: 'Y' }], { pratiqueId: b.pratiqueId }, (x, id) => b.win.simulerIndices(x, id))[0] : null;
    return {
        P: entree ? (entree.noteConstructible === false ? null : entree.P) : null,
        comparateur: sim && sim.noteConstructible !== false ? sim.P : null,
        profil: d && typeof d.noteFinale === 'number' ? Math.round(d.noteFinale * 100) / 100 : null,
        export: ligne ? [ligne[8], ligne[9]] : null
    };
}

/* ================================================================ SOMMATIVE */
describe('SOM — ce qui entre, comment ça se combine', () => {
    it('SOM-1 base : (80 × 40 + 90 × 60) / 100 = 86', () => {
        expect(note(banc({ pratique: somConfigurable(), productions: PROD_SOM, evaluations: COPIES_SOM }))).toMatchObject({ P: 86, comparateur: 86, profil: null, export: [86, 'final'] });
    });
    it('SOM-1b la sommative codée en dur (id « sommative ») calcule la même chose', () => {
        expect(note(banc({ pratique: null, pratiqueId: 'sommative', productions: PROD_SOM, evaluations: COPIES_SOM })).comparateur).toBe(86);
    });
    it('SOM-2 un ARTEFACT évalué (pondération 0) pèse 1 : (80 × 40 + 90 × 60 + 50 × 1) / 101 = 85,64 → 86 ; à 0 : 85,15 → 85', () => {
        const prod = PROD_SOM.concat([{ id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 0, coursId: 'GC1' },
            { id: 'A1', titre: 'Artefact 1', type: 'artefact-portfolio', ponderation: 0, coursId: 'GC1' }]);
        const b = banc({ pratique: somConfigurable(), productions: prod, evaluations: COPIES_SOM.concat([ev(DA.ALICE, 'A1', 50)]) });
        expect(note(b).P).toBe(86);
        expect(b.win.simulerIndices(DA.ALICE, 'som-banc').recit.synthese.noteFinale).toBeCloseTo(8650 / 101, 6);
        const zero = banc({ pratique: somConfigurable(), productions: prod, evaluations: COPIES_SOM.concat([ev(DA.ALICE, 'A1', 0)]) });
        expect(zero.win.simulerIndices(DA.ALICE, 'som-banc').recit.synthese.noteFinale).toBeCloseTo(8600 / 101, 6);
        expect(note(zero).P).toBe(85);
    });
    it('SOM-3 le conteneur « portfolio » évalué compte à sa pondération, comme une production (PF 20 %, 70) : (3200 + 5400 + 1400) / 120 = 83,33', () => {
        const prod = PROD_SOM.concat([{ id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 20, coursId: 'GC1' }]);
        const b = banc({ pratique: somConfigurable(), productions: prod, evaluations: COPIES_SOM.concat([ev(DA.ALICE, 'PF', 70)]) });
        expect(b.win.simulerIndices(DA.ALICE, 'som-banc').recit.synthese.noteFinale).toBeCloseTo(10000 / 120, 6);
    });
    it('SOM-4 une production à pondération 0 (type « travail ») pèse 1 aussi', () => {
        const prod = PROD_SOM.concat([{ id: 'P3', titre: 'Exercice', type: 'travail', ponderation: 0, coursId: 'GC1' }]);
        const b = banc({ pratique: somConfigurable(), productions: prod, evaluations: COPIES_SOM.concat([ev(DA.ALICE, 'P3', 50)]) });
        expect(b.win.simulerIndices(DA.ALICE, 'som-banc').recit.synthese.noteFinale).toBeCloseTo(8650 / 101, 6);
    });
    it('SOM-5 une production FACULTATIVE évaluée entre dans la note (P3 facultative 20 %, 50) : (3200 + 5400 + 1000) / 120 = 80', () => {
        const prod = PROD_SOM.concat([{ id: 'P3', titre: 'Bonus', type: 'travail', ponderation: 20, facultatif: true, coursId: 'GC1' }]);
        const b = banc({ pratique: somConfigurable(), productions: prod, evaluations: COPIES_SOM.concat([ev(DA.ALICE, 'P3', 50)]) });
        expect(note(b).P).toBe(80);
    });
    it('SOM-6 une production DIAGNOSTIQUE évaluée n\'entre pas (86 inchangé)', () => {
        const prod = PROD_SOM.concat([{ id: 'P3', titre: 'Portrait', type: 'travail', ponderation: 20, diagnostique: true, coursId: 'GC1' }]);
        expect(note(banc({ pratique: somConfigurable(), productions: prod, evaluations: COPIES_SOM.concat([ev(DA.ALICE, 'P3', 10)]) })).P).toBe(86);
    });
    it('SOM-7 la note se recalcule sur les productions évaluées : Examen seul → 90', () => {
        const n = note(banc({ pratique: somConfigurable(), productions: PROD_SOM, evaluations: retirer(COPIES_SOM, DA.ALICE, 'P1') }));
        expect(n.P).toBe(90);
        expect(n.export).toEqual([90, 'final']);   // l'export ne dit « provisoire » qu'en standards
    });
});

describe('SOM — les cas qui changent la note', () => {
    const avec = (copies, pratique = somConfigurable()) => note(banc({ pratique, productions: PROD_SOM, evaluations: copies }));
    it('SOM-C1 non remis SANS copie : 90 (la Dissertation sort de la moyenne)', () => {
        expect(avec(retirer(COPIES_SOM, DA.ALICE, 'P1')).P).toBe(90);
    });
    it('SOM-C2 non remis, copie « non-recu » sans critère (portée 0) : 90 ; « non-recu » avec une note portée 100 (0) : 54', () => {
        expect(avec(remplacer(COPIES_SOM, DA.ALICE, 'P1', { statutRemise: 'non-recu', noteFinale: 0, ponderationCouverte: 0 })).P).toBe(90);
        expect(avec(remplacer(COPIES_SOM, DA.ALICE, 'P1', { statutRemise: 'non-recu', noteFinale: 0 })).P).toBe(54);
        expect(avec(remplacer(COPIES_SOM, DA.ALICE, 'P1', { statutRemise: 'non-recu', noteFinale: 80 })).P).toBe(86);
    });
    it('SOM-C3 non recevable (Plagiat) : 0 × 40 + 90 × 60 → 54', () => {
        expect(avec(remplacer(COPIES_SOM, DA.ALICE, 'P1', { statutIntegrite: 'plagiat' })).P).toBe(54);
    });
    it('SOM-C4 « Incomplet ; travail en cours » : hors note → 90', () => {
        expect(avec(remplacer(COPIES_SOM, DA.ALICE, 'P1', { travailEnCours: true })).P).toBe(90);
    });
    it('SOM-C5 brouillon (non verrouillée) : hors note → 90', () => {
        expect(avec(remplacer(COPIES_SOM, DA.ALICE, 'P1', { verrouillee: false })).P).toBe(90);
    });
    it('SOM-C6 jeton de délai : aucun effet → 86', () => {
        expect(avec(remplacer(COPIES_SOM, DA.ALICE, 'P1', { jetonDelaiApplique: true, delaiAccorde: true })).P).toBe(86);
    });
    it('SOM-C7 jeton de reprise, reprise pas encore réévaluée : ni l\'originale ni la reprise ne comptent → 90 (gardée ou supprimée)', () => {
        expect(avec(reprise(COPIES_SOM, DA.ALICE, 'P1', { garder: true })).P).toBe(90);
        expect(avec(reprise(COPIES_SOM, DA.ALICE, 'P1', { garder: false })).P).toBe(90);
    });
    it('SOM-C8 reprise réévaluée à 95 : (95 × 40 + 90 × 60) / 100 = 92 (gardée ou supprimée)', () => {
        expect(avec(reprise(COPIES_SOM, DA.ALICE, 'P1', { garder: true, reevaluee: 95 })).P).toBe(92);
        expect(avec(reprise(COPIES_SOM, DA.ALICE, 'P1', { garder: false, reevaluee: 95 })).P).toBe(92);
    });
    it('SOM-C9 le niveau n\'est pas lu : même note, niveau changé → 86 ; copie en points (pointsAnalytiques) → 86', () => {
        expect(avec(remplacer(COPIES_SOM, DA.ALICE, 'P1', { niveauFinal: 'I' })).P).toBe(86);
        expect(avec(remplacer(COPIES_SOM, DA.ALICE, 'P1', { niveauFinal: '', pointsAnalytiques: { c1: 32 } })).P).toBe(86);
    });
    it('SOM-C10 verrou de l\'assistant (Examen < 60 → 55 au plus) : Examen 50 → moyenne 62 plafonnée à 55 ; Examen 90 → 86', () => {
        const p = somConfigurable({ configuration: { conditions_speciales: clone(VERROU_ASSISTANT) } });
        expect(avec(remplacer(COPIES_SOM, DA.ALICE, 'P2', { noteFinale: 50 }), p).P).toBe(55);
        expect(avec(COPIES_SOM, p).P).toBe(86);
    });
    it('SOM-C11 « Portfolio de progression » (`reglesSpeciales: [\'portfolio\']`, la forme de l\'assistant) : aucune différence, avec ou sans artefact', () => {
        const prod = PROD_SOM.concat([{ id: 'A1', titre: 'Artefact 1', type: 'artefact-portfolio', ponderation: 0, coursId: 'GC1' },
            { id: 'A2', titre: 'Artefact 2', type: 'artefact-portfolio', ponderation: 0, coursId: 'GC1' }]);
        const copies = COPIES_SOM.concat([ev(DA.ALICE, 'A1', 40), ev(DA.ALICE, 'A2', 95)]);
        const sans = banc({ pratique: somConfigurable(), productions: prod, evaluations: copies });
        const avecRegle = banc({ pratique: somConfigurable({ reglesSpeciales: ['portfolio'], variante: 'portfolio' }), productions: prod, evaluations: copies });
        const r = (b) => b.win.simulerIndices(DA.ALICE, 'som-banc').recit.synthese.noteFinale;
        expect(r(avecRegle)).toBeCloseTo(r(sans), 9);
        expect(r(sans)).toBeCloseTo((3200 + 5400 + 40 + 95) / 102, 6);
    });
    it('SOM-C12 arrondi : 57,5 → P 58 (profil et Comparateur lisent 57,5 dans le récit)', () => {
        const b = banc({ pratique: somConfigurable(), productions: PROD_SOM, evaluations: remplacer(remplacer(COPIES_SOM, DA.ALICE, 'P1', { noteFinale: 50 }), DA.ALICE, 'P2', { noteFinale: 62.5 }) });
        expect(note(b).P).toBe(58);
        expect(b.win.simulerIndices(DA.ALICE, 'som-banc').recit.synthese.noteFinale).toBeCloseTo(57.5, 9);
    });
    it('SOM-C13 aucune copie qui compte : non constructible (pas un 0)', () => {
        const n = note(banc({ pratique: somConfigurable(), productions: PROD_SOM, evaluations: COPIES_SOM.filter(e => e.etudiantDA === DA.BRUNO) }));
        expect([n.P, n.comparateur, n.export[0], n.export[1]]).toEqual([null, null, '', 'non constructible']);
    });
});

/* ================================================================ SPÉCIFICATIONS */
describe('SPE — paliers et forfaits (forme écrite par l\'application)', () => {
    const avec = (copies, pratique = speForfaits()) => note(banc({ pratique, productions: PROD_SPE, evaluations: copies }));
    it('SPE-1 base, seuil 70 : Alice 2 dissertations + examen + dossier → A (100) ; Bruno examen 50 → aucun palier, F (50)', () => {
        const b = banc({ pratique: speForfaits(), productions: PROD_SPE, evaluations: COPIES_SPE });
        expect(note(b)).toMatchObject({ P: 100, comparateur: 100, export: [100, 'final'] });
        expect(note(b, DA.BRUNO).P).toBe(50);
    });
    it('SPE-2 la note est le palier, pas une moyenne : dossier 72 → 69 fait passer d\'A (100) à B (80)', () => {
        expect(avec(remplacer(COPIES_SPE, DA.ALICE, 'F1', { noteFinale: 69 })).P).toBe(80);
    });
    it('SPE-3 sans seuil écrit, le seuil est 100 % (#935) : aucune copie à 100 → F (50)', () => {
        expect(avec(COPIES_SPE, speForfaits({ seuil: null })).P).toBe(50);
    });
    it('SPE-4 sans palier d\'échec et aucun forfait atteint : non constructible, et la cause est dite', () => {
        const b = banc({ pratique: speForfaits({ echec: false }), productions: PROD_SPE, evaluations: COPIES_SPE });
        const n = note(b, DA.BRUNO);
        expect([n.P, n.comparateur]).toEqual([null, null]);
        expect(n.export[1]).toBe('non constructible – Ta pratique ne dit pas quelle note donner quand aucun forfait n\'est atteint.');
    });
    it('SPE-C1 non remis avec une note (« non-recu », 90) : pas satisfaisant → B (80)', () => {
        expect(avec(remplacer(COPIES_SPE, DA.ALICE, 'F1', { statutRemise: 'non-recu', noteFinale: 90 })).P).toBe(80);
    });
    it('SPE-C2 non recevable : non satisfaisant → D2 tombe, C (60)', () => {
        expect(avec(remplacer(COPIES_SPE, DA.ALICE, 'D2', { statutIntegrite: 'plagiat' })).P).toBe(60);
    });
    it('SPE-C3 incomplet ; travail en cours → C (60)', () => {
        expect(avec(remplacer(COPIES_SPE, DA.ALICE, 'D2', { travailEnCours: true })).P).toBe(60);
    });
    it('SPE-C4 reprise pas encore réévaluée → C (60) ; réévaluée à 90 → A (100)', () => {
        expect(avec(reprise(COPIES_SPE, DA.ALICE, 'D2')).P).toBe(60);
        expect(avec(reprise(COPIES_SPE, DA.ALICE, 'D2', { reevaluee: 90 })).P).toBe(100);
    });
    it('SPE-C5 jeton de délai : aucun effet (100)', () => {
        expect(avec(remplacer(COPIES_SPE, DA.ALICE, 'D2', { jetonDelaiApplique: true })).P).toBe(100);
    });
});

/* ================================================================ STANDARDS */
describe('STD — sélection, portfolio, terminale', () => {
    const avec = (pratique, copies = COPIES_STD, productions = prodSTD()) => note(banc({ pratique, productions, evaluations: copies }));
    it('STD-1 « N meilleurs », N = 3 : (92 + 88 + 80) / 3 = 86,67 × 60 % + 82 × 40 % = 84,8 → P 85', () => {
        expect(avec(std())).toMatchObject({ P: 85, comparateur: 85, profil: 84.8, export: [85, 'final'] });
    });
    it('STD-2 « Tous » : 77,5 × 60 % + 82 × 40 % = 79,3', () => {
        expect(avec(std({ methodeSelection: 'tous' })).profil).toBe(79.3);
    });
    it('STD-3 « N derniers » (`derniers`, lu `recents`) : A6, A5, A4 → 82,33 × 60 % + 32,8 = 82,2', () => {
        expect(avec(std({ methodeSelection: 'derniers' })).profil).toBe(82.2);
    });
    it('STD-4 provisoire : terminale pas encore évaluée → la note est le portfolio seul (86,67), « provisoire »', () => {
        const n = avec(std(), retirer(COPIES_STD, DA.ALICE, 'T1'));
        expect(n).toMatchObject({ P: 87, profil: 86.67, export: [87, 'provisoire'] });
    });
    it('STD-5 sans conteneur « Portfolio » : la terminale à 40 donne au pool le complément (60) → 84,8', () => {
        expect(avec(std(), COPIES_STD, prodSTD({ conteneur: false })).profil).toBe(84.8);
    });
    it('STD-6 « Notes finalisées » hors hybride : aucun effet sur la note (84,8), l\'export dit toujours « final » quand la terminale est là', () => {
        expect(avec(std({ notesFinales: true }))).toMatchObject({ profil: 84.8, export: [85, 'final'] });
        expect(avec(std({ notesFinales: true }), retirer(COPIES_STD, DA.ALICE, 'T1')).export).toEqual([87, 'provisoire']);
    });
    it('STD-7 le niveau n\'est pas lu, seule la note : A4 niveau « I », note 92 → 84,8', () => {
        expect(avec(std(), remplacer(COPIES_STD, DA.ALICE, 'A4', { niveauFinal: 'I' })).profil).toBe(84.8);
    });
    it('STD-8 plafonnement de conformité (6 évalués, minimum 7, déficit 1 → 70 au plus) : 70 × 60 % + 32,8 = 74,8', () => {
        const regles = { actif: true, plafonds: [{ deficit: 1, seuilMax: 70, niveauCode: 'D' }] };
        expect(avec(std({ minimumCompletion: 7, reglesConformite: regles })).profil).toBe(74.8);
        expect(avec(std({ minimumCompletion: 7 })).profil).toBe(84.8);   // le minimum seul ne fait rien
    });
    it('STD-9 le « Minimum d\'artefacts avant calcul formatif » (3) ne retient pas le calcul : un seul artefact (A4, 92) → 92 × 60 % + 32,8 = 88', () => {
        const copies = COPIES_STD.filter(e => !(e.etudiantDA === DA.ALICE && ['A1', 'A2', 'A3', 'A5', 'A6'].includes(e.productionId)));
        expect(avec(std({ minimumCompletion: 3 }), copies)).toMatchObject({ profil: 88, export: [88, 'final'] });
    });
});

describe('STD — hybride (la forme écrite par l\'assistant)', () => {
    const cat = (n = 2) => ({ actif: true, selection: { nombreARetenir: n, ponderation: 65 }, obligatoires: { nombre: 2, ponderation: 35 } });
    const avec = (pratique, copies = COPIES_STD) => note(banc({ pratique, productions: prodSTD({ categories: CATEGORIES }), evaluations: copies }));
    it('STD-H1 N = 2 meilleures (92, 88 → 90) × 65 + obligatoires (75, 80 → 77,5) × 35 = 85,63 ; × 60 % + 32,8 = 84,18', () => {
        expect(avec(std({ categories: cat(2) })).profil).toBe(84.18);
    });
    it('STD-H2 le « Nombre d\'artefacts retenus » de l\'assistant (portfolio.nombreARetenir) n\'est pas lu en hybride : 1 ou 7, 84,18', () => {
        expect(avec(std({ categories: cat(2), nombreARetenir: 1 })).profil).toBe(84.18);
        expect(avec(std({ categories: cat(2), nombreARetenir: 7 })).profil).toBe(84.18);
    });
    it('STD-H3 obligatoire non remise (A6 sans copie) : provisoire, laissée de côté (75) ; notes finalisées, 0 (37,5)', () => {
        const copies = retirer(COPIES_STD, DA.ALICE, 'A6');
        expect(avec(std({ categories: cat(2) }), copies).profil).toBe(Math.round(((90 * 65 + 75 * 35) / 100 * 0.6 + 32.8) * 100) / 100);
        expect(avec(std({ categories: cat(2), notesFinales: true }), copies).profil).toBe(Math.round(((90 * 65 + 37.5 * 35) / 100 * 0.6 + 32.8) * 100) / 100);
    });
});

describe('STD — les cas qui changent la note', () => {
    const avec = (copies, pratique = std()) => note(banc({ pratique, productions: prodSTD(), evaluations: copies }));
    it('STD-C1 artefact non remis SANS copie (A4) : hors pool → 88, 80, 75 → 81,4', () => {
        expect(avec(retirer(COPIES_STD, DA.ALICE, 'A4')).profil).toBe(81.4);
    });
    it('STD-C2 artefact « non-recu » qui porte une note (A4, 92, portée 100) : il RESTE au pool → 84,8', () => {
        expect(avec(remplacer(COPIES_STD, DA.ALICE, 'A4', { statutRemise: 'non-recu' })).profil).toBe(84.8);
    });
    it('STD-C3 artefact non recevable (A4) : hors pool → 81,4 ; terminale non recevable : 0 → 52', () => {
        expect(avec(remplacer(COPIES_STD, DA.ALICE, 'A4', { statutIntegrite: 'plagiat' })).profil).toBe(81.4);
        expect(avec(remplacer(COPIES_STD, DA.ALICE, 'T1', { statutIntegrite: 'ia' })).profil).toBe(52);
    });
    it('STD-C4 terminale « Incomplet » : hors note → provisoire, portfolio seul (86,67)', () => {
        expect(avec(remplacer(COPIES_STD, DA.ALICE, 'T1', { travailEnCours: true }))).toMatchObject({ profil: 86.67, export: [87, 'provisoire'] });
    });
    it('STD-C5 reprise de A4 pas encore réévaluée : A4 hors pool → 81,4 ; réévaluée à 60 → 88, 80, 75 → 81,4 ; reprise de A1 réévaluée à 95 → 95, 92, 88', () => {
        expect(avec(reprise(COPIES_STD, DA.ALICE, 'A4')).profil).toBe(81.4);
        expect(avec(reprise(COPIES_STD, DA.ALICE, 'A4', { reevaluee: 60 })).profil).toBe(81.4);
        expect(avec(reprise(COPIES_STD, DA.ALICE, 'A1', { reevaluee: 95 })).profil).toBe(Math.round(((95 + 92 + 88) / 3 * 0.6 + 32.8) * 100) / 100);
    });
    it('STD-C6 jeton de délai : aucun effet (84,8)', () => {
        expect(avec(remplacer(COPIES_STD, DA.ALICE, 'A4', { jetonDelaiApplique: true })).profil).toBe(84.8);
    });
    it('STD-C7 aucun artefact qui compte et pas de terminale : non constructible', () => {
        const n = avec(COPIES_STD.filter(e => e.etudiantDA === DA.BRUNO));
        expect([n.P, n.comparateur, n.profil, n.export[1]]).toEqual([null, null, null, 'non constructible']);
    });
});

/* ================================================================ DÉNOTATION */
describe('DEN — le jugement saisi', () => {
    const avec = (jugements, copies = COPIES_SOM) => note(banc({ pratique: DEN, productions: PROD_SOM, evaluations: copies, jugements }));
    it('DEN-1 deux cibles confirmées, 78 : 78 (les copies n\'y entrent pas)', () => {
        expect(avec(jugement({ c1: true, c2: true }, 78))).toMatchObject({ P: 78, comparateur: 78, export: [78, 'final'] });
        expect(avec(jugement({ c1: true, c2: true }, 78), [])).toMatchObject({ P: 78 });
    });
    it('DEN-2 une cible non confirmée : 78 ramené à 59 ; 45 reste 45', () => {
        expect(avec(jugement({ c1: true, c2: false }, 78)).P).toBe(59);
        expect(avec(jugement({ c1: true }, 45)).P).toBe(45);
    });
    it('DEN-3 aucune saisie : non constructible', () => {
        const n = avec({});
        expect([n.P, n.comparateur, n.export[1]]).toEqual([null, null, 'non constructible']);
    });
});
