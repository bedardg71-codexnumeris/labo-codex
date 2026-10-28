/**
 * SENTINELLE (28 oct. 2026) — LA NOTE SUIT LES DÉCISIONS DE GRÉGOIRE (E1, E2, E3, E4, E7 ; #1152, trou 2).
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-28-construction-de-la-note-correctifs.md ; décisions (14 h 43 à
 * 14 h 46) : plans de travail/DECISIONS-2026-10-28-construction-de-la-note.md. Le banc de la mesure
 * (sentinelle-construction-de-la-note-2026-10-28) dit « avant → après » cas par cas ; ce fichier porte ce que le banc
 * ne posait pas : un essai par décision qui rougit sans son correctif, et le STOCK — une copie déjà verrouillée, déjà
 * marquée, suit sans qu'on écrive dans ses données.
 *   E1 : en sommative, une pondération de 0 vaut 0 ; absente, 1 ; toutes à 0 : non constructible (jamais NaN ni 0).
 *   E2 : « Portfolio de progression » quitte l'assistant ; une pratique qui la porte la garde.
 *   E3 : en hybride, « Nombre d'artefacts retenus » de l'assistant est le N des meilleures ; rouvrir ne le change pas.
 *   E4 : une originale gardée compte jusqu'à ce que sa reprise entre dans la note ; supprimée, rien ne compte.
 *   E7 : l'export dit « provisoire » tant que « Notes finalisées » n'est pas cochée.
 * Monte les modules RÉELS (même bac que le banc de la mesure). Données fictives (Alice, Bruno).
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
const remplacer = (copies, da, prodId, champs) => copies.map(e => (e.etudiantDA === da && e.productionId === prodId ? Object.assign({}, e, champs) : e));
/** Ce que fait `appliquerJetonReprise` : l'originale gardée (`remplaceeParId`, `archivee`) ; la reprise, déverrouillée. */
function reprise(copies, da, prodId, { reevaluee = null, extra = {} } = {}) {
    const orig = copies.find(e => e.etudiantDA === da && e.productionId === prodId && !e.remplaceeParId);
    const nouvelle = Object.assign({}, orig, { id: orig.id + '-R', repriseDeId: orig.id, jetonRepriseApplique: true, verrouillee: false }, extra);
    if (reevaluee !== null) Object.assign(nouvelle, { noteFinale: reevaluee, niveauFinal: niveau(reevaluee), verrouillee: true });
    return copies.map(e => (e === orig ? Object.assign({}, e, { remplaceeParId: nouvelle.id, archivee: true }) : e)).concat([nouvelle]);
}

const PROD_SOM = [
    { id: 'P1', titre: 'Dissertation', type: 'travail', ponderation: 40, coursId: 'GC1' },
    { id: 'P2', titre: 'Examen', type: 'examen', ponderation: 60, coursId: 'GC1' }
];
const COPIES_SOM = [ev(DA.ALICE, 'P1', 80), ev(DA.ALICE, 'P2', 90), ev(DA.BRUNO, 'P1', 62), ev(DA.BRUNO, 'P2', 71)];
const som = (configuration = {}) => ({ id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' }, dansBibliotheque: true, configuration });

const PROD_SPE = [{ id: 'D1', titre: 'Dissertation 1', type: 'dissertation', coursId: 'GC1' }, { id: 'X1', titre: 'Examen 1', type: 'examen', coursId: 'GC1' }];
const spe = (configuration = {}) => ({ id: 'spe-banc', nom: 'SPE banc', type: 'specifications', calcul_note: { methode: 'specifications' }, dansBibliotheque: true,
    configuration: Object.assign({ type: 'specifications', seuilAcceptable: 70, typesTravaux: [{ id: 'dissertation', nom: 'Dissertation' }, { id: 'examen', nom: 'Examen' }],
        forfaits: [{ lettre: 'A', note: 100, travaux: { dissertation: 1, examen: 1 } }, { lettre: 'F', note: 50, travaux: {} }] }, configuration) });
const den = (configuration = {}) => ({ id: 'den-banc', nom: 'DEN banc', type: 'denotation', calcul_note: { methode: 'jugement_global' }, dansBibliotheque: true,
    configuration: Object.assign({ type: 'denotation', modeDEN: 'eliminee', objectifs: [{ id: 'c1', nom: 'Lire' }], suggestion: { methode: 'mode' } }, configuration) });

function prodSTD() {
    const l = [{ id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 60, coursId: 'GC1' }];
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].forEach((id, i) => l.push({ id, titre: 'Artefact ' + (i + 1), type: 'artefact-portfolio', numero: i + 1, ponderation: 0, coursId: 'GC1' }));
    l.push({ id: 'T1', titre: 'Analyse finale', type: 'terminale', numero: 7, ponderation: 40, coursId: 'GC1' });
    return l;
}
const NOTES_STD = { A1: 60, A2: 70, A3: 88, A4: 92, A5: 75, A6: 80, T1: 82 };
const COPIES_STD = Object.entries(NOTES_STD).map(([p, n]) => ev(DA.ALICE, p, n));
const std = () => ({ id: 'std-banc', nom: 'STD banc', type: 'standards', calcul_note: { methode: 'conversion_niveaux' }, dansBibliotheque: true,
    configuration: { approcheEvaluation: 'par-artefacts', echelleId: 'E0', grilleId: null, notesFinales: false,
        portfolio: { utiliser: true, nombreTotal: 6, nombreARetenir: 3, methodeSelection: 'meilleurs', minimumCompletion: 3 } } });

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
    let win = null;
    const classe = (nom) => function (config) { return new win[nom](config); };
    const b = monter(store, {
        modules: MODULES, objetsExportes: OBJETS_EXPORTES, aujourdhui: '2026-10-28', journal: [],
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
    return Object.assign(b, { pratiqueId: pratiqueId || pratique.id });
}
function note(b, da = DA.ALICE) {
    const sim = b.win.simulerIndices(da, b.pratiqueId);
    const d = b.win.calculerDetailsNoteFinale(da);
    const entree = b.store.test_indicesCP[da] && b.store.test_indicesCP[da].actuel;
    const ex = b.win._exportResultats;
    const ligne = ex.construireLignesSynthese([{ da, nom: 'X', prenom: 'Y' }], { pratiqueId: b.pratiqueId, notesFinales: ex.notesFinaliseesDe(b.pratiqueId) },
        (x, id) => b.win.simulerIndices(x, id))[0];
    return {
        P: entree ? (entree.noteConstructible === false ? null : entree.P) : null,
        comparateur: sim && sim.noteConstructible !== false ? sim.P : null,
        recit: sim ? sim.recit : null,
        profil: d && typeof d.noteFinale === 'number' ? Math.round(d.noteFinale * 100) / 100 : null,
        details: d,
        export: [ligne[8], ligne[9]]
    };
}
const avecSom = (copies, productions = PROD_SOM, pratique = som()) => note(banc({ pratique, productions, evaluations: copies }));

/* ================================================================ E1 */
describe('E1 — en sommative, une pondération de 0 vaut 0', () => {
    it('E1-a toutes les copies qui comptent sont à pondération 0 : non constructible partout (avant : 0 constructible), jamais NaN', () => {
        const prod = PROD_SOM.map(p => Object.assign({}, p, { ponderation: 0 }));
        const n = avecSom(COPIES_SOM, prod);
        expect([n.P, n.comparateur, n.export[0], n.export[1]]).toEqual([null, null, '', 'non constructible']);
        expect(n.recit).toBeNull();
    });
    it('E1-b une pondération ABSENTE garde le poids 1 : (80 × 1 + 90 × 60) / 61 = 89,84 → 90', () => {
        const prod = [{ id: 'P1', titre: 'Dissertation', type: 'travail', coursId: 'GC1' }, PROD_SOM[1]];
        const n = avecSom(COPIES_SOM, prod);
        expect(n.P).toBe(90);
        expect(n.recit.synthese.noteFinale).toBeCloseTo(5480 / 61, 9);
    });
    it('E1-c le récit nomme la production à pondération 0 sans la compter (le PDF ne la montre pas parmi les comptées)', () => {
        const prod = PROD_SOM.concat([{ id: 'A1', titre: 'Artefact 1', type: 'artefact-portfolio', ponderation: 0, coursId: 'GC1' }]);
        const n = avecSom(COPIES_SOM.concat([ev(DA.ALICE, 'A1', 50)]), prod);
        const a1 = n.recit.resultats.filter(r => r.label === 'Artefact 1');
        expect(a1).toEqual([expect.objectContaining({ sort: 'ecarte', detail: 'pondération 0 · non comptée' })]);
        expect(n.recit.synthese.formuleTexte).toBe('moyenne pondérée de 2 évaluations');
    });
});

/* ================================================================ E4 */
describe('E4 — l\'originale gardée compte jusqu\'à ce que sa reprise entre dans la note', () => {
    it('E4-a sommative : l\'originale compte pendant la fenêtre (86), le récit la COMPTE et ne la dit pas « remplacée »', () => {
        const n = avecSom(reprise(COPIES_SOM, DA.ALICE, 'P1'));
        expect(n.P).toBe(86);
        const p1 = n.recit.resultats.filter(r => r.label === 'Dissertation');
        expect(p1.map(r => r.sort).sort()).toEqual(['compte', 'ecarte']);   // l'originale comptée ; la reprise, non verrouillée
        expect(p1.find(r => r.sort === 'compte').note).toBe(80);
    });
    it('E4-b la reprise verrouillée la remplace (95 → 92) ; une reprise « Incomplet ; travail en cours » ou de portée 0 ne la remplace pas (86)', () => {
        expect(avecSom(reprise(COPIES_SOM, DA.ALICE, 'P1', { reevaluee: 95 })).P).toBe(92);
        expect(avecSom(reprise(COPIES_SOM, DA.ALICE, 'P1', { reevaluee: 95, extra: { travailEnCours: true } })).P).toBe(86);
        expect(avecSom(reprise(COPIES_SOM, DA.ALICE, 'P1', { reevaluee: 95, extra: { ponderationCouverte: 0 } })).P).toBe(86);
    });
    it('E4-c reprise de reprise, maillon par maillon : la reprise réévaluée (95) compte pendant que SA reprise attend → 92', () => {
        const deux = reprise(reprise(COPIES_SOM, DA.ALICE, 'P1', { reevaluee: 95 }), DA.ALICE, 'P1');
        expect(deux.filter(e => e.productionId === 'P1' && e.etudiantDA === DA.ALICE)).toHaveLength(3);
        expect(avecSom(deux).P).toBe(92);
    });
    it('E4-d restent remplacés comme avant : un doublon réconcilié (#360) et une originale dont la reprise est introuvable', () => {
        const doublon = COPIES_SOM.concat([ev(DA.ALICE, 'P1', 30, { id: 'EV-DOUBLON', verrouillee: false, remplaceeParId: 'EV-' + DA.ALICE + '-P1', reconcilieParDoublon: true })]);
        expect(avecSom(doublon).P).toBe(86);   // 30 n'entre pas
        const orpheline = remplacer(COPIES_SOM, DA.ALICE, 'P1', { remplaceeParId: 'EV-DISPARUE', archivee: true });
        expect(avecSom(orpheline).P).toBe(90);
    });
    it('E4-e spécifications : le travail reste satisfaisant pendant la fenêtre (A, 100) ; standards : l\'artefact reste au pool, pas « remplacé » au récit', () => {
        const copiesSpe = [ev(DA.ALICE, 'D1', 80), ev(DA.ALICE, 'X1', 90)];
        expect(note(banc({ pratique: spe(), productions: PROD_SPE, evaluations: reprise(copiesSpe, DA.ALICE, 'D1') })).P).toBe(100);
        const n = note(banc({ pratique: std(), productions: prodSTD(), evaluations: reprise(COPIES_STD, DA.ALICE, 'A4') }));
        expect(n.profil).toBe(84.8);
        expect(n.details.recit.resultats.filter(r => r.sort === 'remplace')).toEqual([]);
    });
    it('E4-f le prédicat lit la liste fournie quand on la lui donne', () => {
        const b = banc({ pratique: som(), productions: PROD_SOM, evaluations: COPIES_SOM });
        const liste = reprise(COPIES_SOM, DA.ALICE, 'P1');
        const orig = liste.find(e => e.remplaceeParId);
        expect(b.win.evaluationEntreDansLaNote(orig)).toBe(false);          // le stockage ne connaît pas la reprise : remplacée, comme avant
        expect(b.win.evaluationEntreDansLaNote(orig, liste)).toBe(true);    // la liste la connaît, déverrouillée : l'originale compte
    });
    it('E4-STOCK une originale DÉJÀ marquée suit au calcul, sans écriture : ses champs ne bougent pas', () => {
        const copies = reprise(COPIES_SOM, DA.ALICE, 'P1');
        const b = banc({ pratique: som(), productions: PROD_SOM, evaluations: copies });
        const avant = JSON.stringify(b.store.test_evaluationsSauvegardees);
        expect(note(b).P).toBe(86);
        b.win.calculerEtStockerIndicesCP();
        expect(JSON.stringify(b.store.test_evaluationsSauvegardees)).toBe(avant);
        expect(b.store.test_evaluationsSauvegardees.find(e => e.id === 'EV-' + DA.ALICE + '-P1').remplaceeParId).toBe('EV-' + DA.ALICE + '-P1-R');
    });
});

/* ================================================================ E7 */
describe('E7 — l\'export dit « provisoire » tant que « Notes finalisées » n\'est pas cochée', () => {
    it('E7-a sommative, spécifications, dénotation : « provisoire » sans la case, « final » avec', () => {
        const j = { 'den-banc': { [DA.ALICE]: { ciblesAtteintes: { c1: true }, noteFinale: 78, justification: 'Banc', date: '2026-05-01' } } };
        const copiesSpe = [ev(DA.ALICE, 'D1', 80), ev(DA.ALICE, 'X1', 90)];
        for (const [fabrique, productions, evaluations, jugements, attendu] of [
            [som, PROD_SOM, COPIES_SOM, {}, 86], [spe, PROD_SPE, copiesSpe, {}, 100], [den, PROD_SOM, COPIES_SOM, j, 78]]) {
            expect(note(banc({ pratique: fabrique(), productions, evaluations, jugements })).export).toEqual([attendu, 'provisoire']);
            expect(note(banc({ pratique: fabrique({ notesFinales: true }), productions, evaluations, jugements })).export).toEqual([attendu, 'final']);
        }
    });
    it('E7-b standards, case cochée : « final » avec la terminale, « provisoire » tant qu\'elle ne compte pas', () => {
        const fin = () => Object.assign(std(), { configuration: Object.assign(std().configuration, { notesFinales: true }) });
        expect(note(banc({ pratique: fin(), productions: prodSTD(), evaluations: COPIES_STD })).export).toEqual([85, 'final']);
        expect(note(banc({ pratique: fin(), productions: prodSTD(), evaluations: COPIES_STD.filter(e => e.productionId !== 'T1') })).export).toEqual([87, 'provisoire']);
    });
    it('E7-d standards SANS production terminale (ajout de Cowork, 14 h 55 : la chimie, par exemple) : case cochée, « final » ; le profil ne la dit pas provisoire (avant : « provisoire » pour toujours)', () => {
        const fin = () => Object.assign(std(), { configuration: Object.assign(std().configuration, { notesFinales: true }) });
        const sansTerminale = prodSTD().filter(p => p.type !== 'terminale');
        const n = note(banc({ pratique: fin(), productions: sansTerminale, evaluations: COPIES_STD.filter(e => e.productionId !== 'T1') }));
        expect(n.profil).toBe(86.67);   // le pool seul, à 100 % (le calcul n'a pas changé)
        expect(n.details.estProvisoire).toBe(false);
        expect(n.export).toEqual([87, 'final']);
        const nonCochee = note(banc({ pratique: std(), productions: sansTerminale, evaluations: COPIES_STD.filter(e => e.productionId !== 'T1') }));
        expect(nonCochee.export).toEqual([87, 'provisoire']);   // E7 : la case décide
    });
    it('E7-c la sommative codée en dur (id « sommative », sans configuration) n\'a pas de case : « provisoire »', () => {
        const b = banc({ pratique: null, pratiqueId: 'sommative', productions: PROD_SOM, evaluations: COPIES_SOM });
        expect(b.win._exportResultats.notesFinaliseesDe('sommative')).toBe(false);
        expect(note(b).export).toEqual([86, 'provisoire']);
    });
});

/* ================================================================ E2 et E3 : l'assistant */
let store = [];
let modalites = {};
const db = {
    getSync: (k, def) => {
        if (k === 'pratiquesConfigurables') return store;
        if (k === 'modalitesEvaluation') return modalites;
        return def !== undefined ? def : null;
    },
    setSync: (k, v) => { if (k === 'pratiquesConfigurables') store = v; }
};
const globaux = { db, cle: (k) => k, notifications: { erreur: () => {}, succes: () => {} }, normaliserIdPratique: (t) => t,
    genererIdUnique: () => 'id-genere', echapperHtml: (s) => String(s == null ? '' : s) };
const win = chargerScript('js/pratiques/modalites-evaluation.js', globaux);
chargerScript('js/pratiques/construction-attributs.js', globaux, win);
chargerScript('js/wizard-pratique-v2.js', globaux, win);

async function creerNeuve(reponses) {
    store = [];
    win.wizardState.reponses = clone(reponses);
    win.wizardState.pratiqueId = 'neuve';
    win.wizardState.modeEdition = false;
    await win.creerPratiqueV2();
    return clone(store[0]);
}
async function rouvrirEtEnregistrer(stock) {
    store = [clone(stock)];
    win.wizardState.reponses = {};
    win.chargerPratiqueExistante(stock.id);
    const reponses = clone(win.wizardState.reponses);
    win.wizardState.pratiqueId = stock.id;
    win.wizardState.modeEdition = true;
    await win.creerPratiqueV2();
    return { reponses, apres: clone(store[0]) };
}
const REPONSES_STD = { nom: 'STD hybride', calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts', echelleId: 'E0',
    modeSelectionPortfolio: 'hybride', nbArtefactsSoumis: 10, nbArtefactsRetenus: 5, minAvantCalculFormatif: 3 };

describe('E2 — « Portfolio de progression » quitte l\'assistant', () => {
    it('E2-a la case n\'est plus offerte ; cochée dans de vieilles réponses, elle ne s\'écrit pas', async () => {
        expect(win.ETAPES_WIZARD['regles-sommative'].champs[0].options.map(o => o.value)).not.toContain('portfolio');
        const p = await creerNeuve({ nom: 'SOM', calcNoteFinale: 'moyenne', reglesSommatives: ['portfolio'] });
        expect(p.reglesSpeciales || []).not.toContain('portfolio');
        expect(win.ConstructionAttributs.libelleRegleSommative('portfolio')).toBe('portfolio');   // plus de libellé « Actif »
    });
    it('E2-STOCK une pratique qui la porte la garde à la réédition, avec sa variante (rien n\'est effacé)', async () => {
        const stock = { id: 'stock-port', nom: 'SOM portfolio', auteur: 'A B', etablissement: '', description: '', discipline: '', type: 'sommative',
            variante: 'portfolio', pratiques: ['SOM'], dansBibliotheque: true, dateCreation: '2026-09-01T12:00:00.000Z',
            configuration: {}, calcul_note: { methode: 'moyenne_ponderee' }, reglesSpeciales: ['portfolio'] };
        const { reponses, apres } = await rouvrirEtEnregistrer(stock);
        expect(reponses.reglesSommatives).toEqual([]);
        expect(apres.reglesSpeciales).toEqual(['portfolio']);
        expect(apres.variante).toBe('portfolio');
    });
});

describe('E3 — en hybride, le nombre de l\'assistant est le N des meilleures', () => {
    it('E3-a une pratique hybride neuve écrit la réponse dans `categories.selection.nombreARetenir` (5 ; avant : les modalités, sinon 4)', async () => {
        modalites = { categories: { selection: { nombreARetenir: 2 } } };
        const p = await creerNeuve(REPONSES_STD);
        expect(p.configuration.categories.actif).toBe(true);
        expect(p.configuration.categories.selection.nombreARetenir).toBe(5);
        modalites = {};
    });
    it('E3-b hors hybride, des catégories activées par les modalités gardent leur nombre (inchangé)', async () => {
        modalites = { categories: { actif: true, selection: { nombreARetenir: 2 } } };
        const p = await creerNeuve(Object.assign({}, REPONSES_STD, { modeSelectionPortfolio: 'n_meilleurs' }));
        expect(p.configuration.categories.selection.nombreARetenir).toBe(2);
        modalites = {};
    });
    it('E3-STOCK une hybride déjà créée garde son N : rouvrir montre celui que le calcul lit, ré-enregistrer ne le change pas', async () => {
        const stock = { id: 'stock-hyb', nom: 'STD hybride', auteur: 'A B', etablissement: '', description: '', discipline: '', type: 'standards',
            variante: 'n-meilleurs', pratiques: ['STD'], dansBibliotheque: true, dateCreation: '2026-09-01T12:00:00.000Z', calcul_note: { methode: 'conversion_niveaux' },
            configuration: { approcheEvaluation: 'par-artefacts', echelleId: 'E0', grilleId: null,
                portfolio: { utiliser: true, nombreTotal: 12, nombreARetenir: 7, methodeSelection: 'meilleurs', minimumCompletion: 3 },
                categories: { actif: true, selection: { nombreARetenir: 4, ponderation: 65 }, obligatoires: { nombre: 2, ponderation: 35 } } } };
        const { reponses, apres } = await rouvrirEtEnregistrer(stock);
        expect(reponses.nbArtefactsRetenus).toBe(4);
        expect(apres.configuration.categories.selection.nombreARetenir).toBe(4);
    });
});
