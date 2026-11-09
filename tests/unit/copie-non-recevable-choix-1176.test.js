/**
 * #1176 (lot du 9 nov. 2026) — L'UTILISATEUR CHOISIT LE SORT D'UNE COPIE NON RECEVABLE : « l'écarter » ou « lui mettre 0 ».
 * Consigne : plans de travail/CONSIGNE-LOT-2026-11-08-copie-non-recevable-choix.md (décisions de Grégoire du 8 nov. 2026).
 *
 * Ce que l'essai garde, famille × choix × place (portfolio, obligatoire hybride, terminale) :
 * - « l'écarter » = EXACTEMENT une copie non remise : chaque cas est comparé à son témoin, la même copie RETIRÉE ;
 * - « lui mettre 0 » = 0 en sommative, non satisfaisant en spécifications, 0 en standards ;
 * - la règle vit dans la pratique (`configuration.sortCopieNonRecevable`) ; une pratique sans règle écrite se lit comme
 *   avant ce lot (sommative 0, spécifications non satisfaisant, standards écartée) ; le choix de la copie la remplace ;
 * - terminale des standards : manquante (non remise OU écartée), provisoire pendant le trimestre, 0 une fois les notes
 *   finales cochées (décision 4) ;
 * - le dépistage et les trajectoires suivent la règle ; rien n'est écrit dans les copies.
 *
 * Le banc monte les modules RÉELS (bac du Suivi, celui de la sentinelle du 28 oct.) et juge chaque note sur ses chemins :
 * P stocké, Comparateur (`simulerIndices`), captures, note du profil (standards). Alice porte la copie ; Bruno est le témoin.
 *
 *   cd tests && npx vitest run unit/copie-non-recevable-choix-1176.test.js
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, clone, elementDom } from './_helpers/bac-suivi.js';

const DA = { ALICE: '2000001', BRUNO: '2000002' };
const FIN = '2026-06-30';

const E0 = { id: 'E0', nom: 'IDME0 banc', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40, couleur: '#aa0000' }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75, couleur: '#00aa00' }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100, couleur: '#0000aa' }
] };
const niveau = (n) => (n >= 85 ? 'E' : n >= 75 ? 'M' : n >= 65 ? 'D' : 'I');
const ev = (da, prodId, note, extra) => Object.assign({
    id: 'EV-' + da + '-' + prodId, etudiantDA: da, productionId: prodId, noteFinale: note, niveauFinal: niveau(note), echelleId: 'E0', ponderationCouverte: 100,
    verrouillee: true, coursId: 'GC1', groupe: '01', dateEvaluation: '2026-05-20T12:00:00.000Z', statutIntegrite: 'recevable', statutRemise: 'evalue', criteres: []
}, extra || {});
const PLAGIAT = { statutIntegrite: 'plagiat', notesIntegrite: 'Banc' };
/** Marque la copie (statut, et le choix fait sur elle quand il y en a un). */
const marquer = (evaluations, da, prodId, choix) =>
    evaluations.map(e => (e.etudiantDA === da && e.productionId === prodId ? Object.assign({}, e, PLAGIAT, choix ? { sortCopieNonRecevable: choix } : {}) : e));
/** Le témoin : la copie n'existe pas (non remise). */
const retirer = (evaluations, da, prodId) => evaluations.filter(e => !(e.etudiantDA === da && e.productionId === prodId));
const avecRegle = (pratique, regle) => {
    const p = clone(pratique);
    if (regle) p.configuration.sortCopieNonRecevable = regle;
    return p;
};

/* ------------------------------------------------------------------ Sommative */
const PRODUCTIONS_SOM = [
    { id: 'P1', titre: 'Dissertation', type: 'travail', ponderation: 40, dateEcheance: '2026-02-01', coursId: 'GC1' },
    { id: 'P2', titre: 'Examen', type: 'examen', ponderation: 60, dateEcheance: '2026-03-15', coursId: 'GC1' }
];
const COPIES_SOM = [ev(DA.ALICE, 'P1', 87.5), ev(DA.ALICE, 'P2', 90), ev(DA.BRUNO, 'P1', 62), ev(DA.BRUNO, 'P2', 71)];
const PRATIQUE_SOM = { id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' }, dansBibliotheque: true, configuration: { approcheEvaluation: 'sommative' } };

/* ------------------------------------------------------------------ Spécifications */
const PRODUCTIONS_SPE = [
    { id: 'D1', titre: 'Dissertation 1', type: 'dissertation', dateEcheance: '2026-02-01', coursId: 'GC1' },
    { id: 'X1', titre: 'Examen 1', type: 'examen', dateEcheance: '2026-02-15', coursId: 'GC1' },
    { id: 'D2', titre: 'Dissertation 2', type: 'dissertation', dateEcheance: '2026-03-15', coursId: 'GC1' },
    { id: 'F1', titre: 'Dossier', type: 'dossier', dateEcheance: '2026-04-01', coursId: 'GC1' }
];
const COPIES_SPE = [ev(DA.ALICE, 'D1', 80), ev(DA.ALICE, 'X1', 90), ev(DA.ALICE, 'D2', 87.5), ev(DA.ALICE, 'F1', 72),
    ev(DA.BRUNO, 'D1', 71), ev(DA.BRUNO, 'X1', 50), ev(DA.BRUNO, 'D2', 88), ev(DA.BRUNO, 'F1', 90)];
const PRATIQUE_SPE = { id: 'spe-banc', nom: 'SPE banc', type: 'specifications', calcul_note: { methode: 'specifications' }, dansBibliotheque: true,
    configuration: { type: 'specifications',
        typesTravaux: [{ id: 'dissertation', nom: 'Dissertation', seuilAcceptable: 70 }, { id: 'examen', nom: 'Examen', seuilAcceptable: 70 }, { id: 'dossier', nom: 'Dossier', seuilAcceptable: 70 }],
        tableBundles: [
            { noteFixe: 100, label: 'A', requis: { dissertation: 2, examen: 1, dossier: 1 } },
            { noteFixe: 80, label: 'B', requis: { dissertation: 2, examen: 1 } },
            { noteFixe: 60, label: 'C', requis: { dissertation: 1, examen: 1 } },
            { noteFixe: 50, label: 'F', requis: null }
        ] } };

/* ------------------------------------------------------------------ Standards : six artefacts, une terminale */
const ECHEANCES = { A1: '2026-02-01', A2: '2026-02-15', A3: '2026-03-01', A4: '2026-03-15', A5: '2026-04-01', A6: '2026-04-15', T1: '2026-05-01' };
function productionsSTD(categories = null) {
    const l = [{ id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 60, coursId: 'GC1' }];
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].forEach((id, i) => l.push(Object.assign({ id, titre: 'Artefact ' + (i + 1), type: 'artefact-portfolio', numero: i + 1,
        ponderation: 0, dateEcheance: ECHEANCES[id], coursId: 'GC1' }, categories ? { categorie: categories[id] } : {})));
    l.push({ id: 'T1', titre: 'Analyse finale', type: 'terminale', numero: 7, ponderation: 40, dateEcheance: ECHEANCES.T1, coursId: 'GC1' });
    return l;
}
const NOTES_STD = { [DA.ALICE]: { A1: 60, A2: 70, A3: 88, A4: 92, A5: 75, A6: 80, T1: 82 }, [DA.BRUNO]: { A1: 90, A2: 55, A3: 72, A4: 66, A5: 95, A6: 70, T1: 68 } };
const COPIES_STD = [];
for (const da of [DA.ALICE, DA.BRUNO]) for (const [p, n] of Object.entries(NOTES_STD[da])) COPIES_STD.push(ev(da, p, n));
function pratiqueSTD({ hybride = false, notesFinales = false, methodeSelection = 'meilleurs', regle = null, minimum = 1, conformite = { actif: false } } = {}) {
    const p = { id: 'std-banc', nom: 'STD banc', type: 'standards', calcul_note: { methode: 'conversion_niveaux' }, dansBibliotheque: true,
        configuration: Object.assign({ type: 'standards', approcheEvaluation: 'par-artefacts', echelleId: 'E0', grilleId: 'G1',
            portfolio: { utiliser: true, nombreARetenir: 3, minimumCompletion: minimum, methodeSelection, reglesConformite: conformite }, notesFinales },
        hybride ? { categories: { actif: true, selection: { nombreARetenir: 2, ponderation: 65 }, obligatoires: { ponderation: 35 } } } : {}) };
    if (regle) p.configuration.sortCopieNonRecevable = regle;
    return p;
}
const CATEGORIES = { A1: 'selection', A2: 'selection', A3: 'selection', A4: 'selection', A5: 'obligatoire', A6: 'obligatoire' };

/* ------------------------------------------------------------------ Dénotation */
const PRATIQUE_DEN = { id: 'den-banc', nom: 'DEN banc', type: 'denotation', calcul_note: { methode: 'jugement_global' }, dansBibliotheque: true,
    configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: [{ id: 'cible-1', nom: 'Lire' }], suggestion: { methode: 'mode' }, echelleId: null, grilleId: null } };
const JUGEMENTS_DEN = { 'den-banc': { [DA.ALICE]: { ciblesAtteintes: { 'cible-1': true }, noteFinale: 78, justification: 'Jugement de banc', date: '2026-05-01' } } };

/* ------------------------------------------------------------------ Le bac (celui de #716 et du 28 oct.) */
const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/pratiques/pratique-configurable.js',
    'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js',
    'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js', { chemin: 'js/saisie-presences.js', internes: [] },
    'js/profil-etudiant-actions.js', { chemin: 'js/profil-etudiant-calculs.js', internes: ['_copiesDuDepistage'] },
    'js/profil-etudiant-helpers.js', 'js/snapshots.js'];
const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', '__audit'];

function banc({ pratique, productions, evaluations, jugements = {}, autres = [], modules = [] }) {
    const store = storeBase();
    store.test_groupeEtudiants = store.test_groupeEtudiants.filter(e => e.da === DA.ALICE || e.da === DA.BRUNO);
    store.test_groupesCours[0].pratiqueId = pratique.id;
    store.test_pratiquesConfigurables = [clone(pratique)].concat(clone(autres));   // `autres` : simulées, jamais actives
    store.test_echellesTemplates = [clone(E0)];
    store.test_productions = clone(productions);
    store.test_evaluationsSauvegardees = clone(evaluations);
    store.test_jugementsDenotation = clone(jugements);
    const journal = [];
    let win = null;
    const classe = (nom) => function (config) { return new win[nom](config); };
    const b = monter(store, {
        modules: MODULES.concat(modules), objetsExportes: OBJETS_EXPORTES, aujourdhui: '2026-10-28', journal,
        globaux: {
            PratiqueConfigurable: classe('PratiqueConfigurable'), PratiqueSommative: classe('PratiqueSommative'), PratiquePANStandards: classe('PratiquePANStandards'),
            obtenirEcheanceEffective: (production, gcId) => {
                if (production.echeancesParGroupe && gcId) { const e = production.echeancesParGroupe[gcId]; if (e) return { date: e.date || null, assignee: e.assignee !== false }; }
                return { date: production.dateEcheance || null, assignee: true };
            },
            resoudreModeleParId: (type, id) => { const l = store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []; return clone(l.find(m => m && m.id === id) || null); },
            obtenirInterventionsEtudiant: () => [], aDesInfosConfidentielles: () => false
        }
    });
    win = b.win;
    win.calculerEtStockerIndicesCP();
    return Object.assign(b, { journal, pratique });
}
/** Les chemins de la note, pour un élève : P stocké, Comparateur, captures, et la note du profil en standards. */
function chemins(b, da) {
    const sim = b.win.simulerIndices(da, b.pratique.id);
    const profil = b.win.calculerDetailsNoteFinale(da);
    return {
        P: b.store.test_indicesCP[da].actuel.P,
        comparateur: sim.P,
        capture: b.win.calculerIndicesHistoriques(da, FIN).P,
        profil: profil ? Math.round(profil.noteFinale * 100) / 100 : null
    };
}
const noteDe = (args, da = DA.ALICE) => chemins(banc(args), da);

/* ================================================================== SOMMATIVE */
describe('Sommative — écarter : hors de la moyenne, comme une copie non remise ; 0 : compte pour 0', () => {
    const base = { productions: PRODUCTIONS_SOM };
    const NON_REMISE = noteDe({ ...base, pratique: PRATIQUE_SOM, evaluations: retirer(COPIES_SOM, DA.ALICE, 'P1') });

    it('TÉMOIN — la Dissertation non remise : 90 × 60 / 60 = 90', () => {
        expect(NON_REMISE).toEqual({ P: 90, comparateur: 90, capture: 90, profil: null });
    });
    it('règle « l\'écarter » : 90, exactement la non remise (avant ce lot : 54)', () => {
        expect(noteDe({ ...base, pratique: avecRegle(PRATIQUE_SOM, 'ecarter'), evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1') })).toEqual(NON_REMISE);
    });
    it('règle « lui mettre 0 » : (0 × 40 + 90 × 60) / 100 = 54', () => {
        expect(noteDe({ ...base, pratique: avecRegle(PRATIQUE_SOM, 'zero'), evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1') }).P).toBe(54);
    });
    it('SANS RÈGLE ÉCRITE (pratique existante) : la sommative se lit « 0 », son comportement d\'avant — 54', () => {
        expect(noteDe({ ...base, pratique: PRATIQUE_SOM, evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1') }).P).toBe(54);
    });
    it('LE CHOIX DE LA COPIE remplace la règle, dans les deux sens', () => {
        expect(noteDe({ ...base, pratique: avecRegle(PRATIQUE_SOM, 'zero'), evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1', 'ecarter') }).P).toBe(90);
        expect(noteDe({ ...base, pratique: avecRegle(PRATIQUE_SOM, 'ecarter'), evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1', 'zero') }).P).toBe(54);
    });
    it('le récit : écartée, la copie n\'y est pas (comme une non remise) ; à 0, elle compte à 0', () => {
        const recit = (regle) => banc({ ...base, pratique: avecRegle(PRATIQUE_SOM, regle), evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1') })
            .win.simulerIndices(DA.ALICE, 'som-banc').recit;
        expect(recit('ecarter').resultats.map(r => r.productionId).filter(Boolean)).toEqual(['P2']);
        expect(recit('zero').resultats.find(r => r.productionId === 'P1')).toMatchObject({ sort: 'compte', note: 0 });
    });
    it('le verrou de l\'assistant : écartée, la Dissertation manque — aucun plafond (90) ; à 0, plafond 40', () => {
        const VERROU = [{ type: 'double_verrou', condition: { evaluation: 'Dissertation', comparateur: '<', seuil: 60 }, consequence: { action: 'plafonner', valeur: 40 } }];
        const p = (regle) => Object.assign(avecRegle(PRATIQUE_SOM, regle), { calcul_note: { methode: 'moyenne_ponderee', conditions_speciales: VERROU } });
        // La note calculée de la copie plagiée est SOUS le seuil (50) : un verrou qui la lirait plafonnerait à tort.
        const sousLeSeuil = COPIES_SOM.map(e => (e.etudiantDA === DA.ALICE && e.productionId === 'P1' ? Object.assign({}, e, { noteFinale: 50 }) : e));
        expect(noteDe({ ...base, pratique: p('ecarter'), evaluations: marquer(sousLeSeuil, DA.ALICE, 'P1') }).P).toBe(90);
        expect(noteDe({ ...base, pratique: p('zero'), evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1') }).P).toBe(40);
    });
    it('TÉMOIN — Bruno, tout recevable, ne bouge pas selon la règle (67)', () => {
        expect(noteDe({ ...base, pratique: avecRegle(PRATIQUE_SOM, 'ecarter'), evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1') }, DA.BRUNO).P).toBe(67);
    });
});

/* ================================================================== SPÉCIFICATIONS */
describe('Spécifications — écarter : un travail non remis ; 0 : un travail non satisfaisant', () => {
    const base = { productions: PRODUCTIONS_SPE };
    it('D2 plagiée : palier C (60) dans les deux cas, et la non remise aussi', () => {
        expect(noteDe({ ...base, pratique: avecRegle(PRATIQUE_SPE, 'ecarter'), evaluations: marquer(COPIES_SPE, DA.ALICE, 'D2') }).P).toBe(60);
        expect(noteDe({ ...base, pratique: avecRegle(PRATIQUE_SPE, 'zero'), evaluations: marquer(COPIES_SPE, DA.ALICE, 'D2') }).P).toBe(60);
        expect(noteDe({ ...base, pratique: PRATIQUE_SPE, evaluations: retirer(COPIES_SPE, DA.ALICE, 'D2') }).P).toBe(60);
    });
    // Le cas qui les départage : l'élève n'a QUE la copie plagiée. Non remise : aucune copie, aucune note ; non satisfaisante :
    // une copie, aucun forfait atteint, le palier d'échec (50).
    const seule = (regle, choix) => banc({ ...base, pratique: regle ? avecRegle(PRATIQUE_SPE, regle) : PRATIQUE_SPE,
        evaluations: marquer([ev(DA.ALICE, 'D1', 80)], DA.ALICE, 'D1', choix) });
    it('SEULE COPIE, écartée : aucune note, comme un élève sans copie (non constructible)', () => {
        const b = seule('ecarter');
        expect(b.win.simulerIndices(DA.ALICE, 'spe-banc').noteConstructible).toBe(false);
        expect(b.store.test_indicesCP[DA.ALICE].actuel.noteConstructible).toBe(false);
        const sansCopie = banc({ ...base, pratique: PRATIQUE_SPE, evaluations: [ev(DA.BRUNO, 'D1', 80)] });
        expect(sansCopie.win.simulerIndices(DA.ALICE, 'spe-banc').noteConstructible).toBe(false);
    });
    it('SEULE COPIE, à 0 (règle absente = non satisfaisant, l\'avant) : le palier d\'échec, 50', () => {
        expect(seule(null).win.simulerIndices(DA.ALICE, 'spe-banc').P).toBe(50);
        expect(seule('zero').win.simulerIndices(DA.ALICE, 'spe-banc').P).toBe(50);
    });
    it('LE CHOIX DE LA COPIE remplace la règle : « zero » sur la copie sous une règle « écarter » → 50', () => {
        expect(seule('ecarter', 'zero').win.simulerIndices(DA.ALICE, 'spe-banc').P).toBe(50);
        expect(seule('zero', 'ecarter').win.simulerIndices(DA.ALICE, 'spe-banc').noteConstructible).toBe(false);
    });
});

/* ================================================================== STANDARDS */
describe('Standards, portfolio — écarter : elle manque, comme une non remise ; 0 : elle y entre à 0', () => {
    const base = { productions: productionsSTD() };
    it('« meilleurs », A4 (92) plagiée : écartée → 88, 80, 75 → 81,4 (la non remise aussi) ; à 0, sortie des trois meilleures → 81,4', () => {
        expect(noteDe({ ...base, pratique: pratiqueSTD({ regle: 'ecarter' }), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') }).profil).toBe(81.4);
        expect(noteDe({ ...base, pratique: pratiqueSTD(), evaluations: retirer(COPIES_STD, DA.ALICE, 'A4') }).profil).toBe(81.4);
        expect(noteDe({ ...base, pratique: pratiqueSTD({ regle: 'zero' }), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') }).profil).toBe(81.4);
    });
    it('« récents », A4 plagiée : écartée → A6, A5, A3 → 81,4 ; à 0 → A6, A5, A4 à 0 → 51,67 × 60 % + 32,8 = 63,8', () => {
        const p = (regle) => pratiqueSTD({ methodeSelection: 'recents', regle });
        expect(noteDe({ ...base, pratique: p('ecarter'), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') })).toEqual({ P: 81, comparateur: 81, capture: 81, profil: 81.4 });
        expect(noteDe({ ...base, pratique: p(null), evaluations: retirer(COPIES_STD, DA.ALICE, 'A4') }).profil).toBe(81.4);
        expect(noteDe({ ...base, pratique: p('zero'), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') })).toEqual({ P: 64, comparateur: 64, capture: 64, profil: 63.8 });
        const b = banc({ ...base, pratique: p('zero'), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') });
        expect(b.win.calculerDetailsNoteFinale(DA.ALICE).recit.resultats.find(r => r.label === 'Artefact 4')).toMatchObject({ sort: 'compte', note: 0 });
        expect(new b.win.PratiquePANStandards().calculerPerformance(DA.ALICE)).toBeCloseTo(0.638, 6);
    });
    it('SANS RÈGLE ÉCRITE (pratique existante) : la standards se lit « l\'écarter », son comportement d\'avant (« récents » → 81,4)', () => {
        expect(noteDe({ ...base, pratique: pratiqueSTD({ methodeSelection: 'recents' }), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') }).profil).toBe(81.4);
    });
    it('LE CHOIX DE LA COPIE remplace la règle : « zero » sur la copie, sous une règle absente (écarter) → 63,8', () => {
        expect(noteDe({ ...base, pratique: pratiqueSTD({ methodeSelection: 'recents' }), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4', 'zero') }).profil).toBe(63.8);
    });
    // Le minimum : « ce que la pratique fait déjà d'une copie manquante sous le nombre minimal » (le plafonnement de conformité).
    it('LE MINIMUM (6 requis, plafond 70 à un manquant) : écartée, elle manque → 70 × 60 % + 32,8 = 74,8, comme la non remise ; à 0, elle compte → 81 × 60 % + 32,8 = 81,4', () => {
        const p = (regle) => pratiqueSTD({ regle, minimum: 6, conformite: { actif: true, plafonds: [{ deficit: 1, seuilMax: 70, niveauCode: 'D' }] } });
        expect(noteDe({ ...base, pratique: p('ecarter'), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') }).profil).toBe(74.8);
        expect(noteDe({ ...base, pratique: p(null), evaluations: retirer(COPIES_STD, DA.ALICE, 'A4') }).profil).toBe(74.8);
        expect(noteDe({ ...base, pratique: p('zero'), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') }).profil).toBe(81.4);
    });
});

describe('Standards, terminale — écartée : provisoire, puis 0 aux notes finales (comme une non remise) ; à 0 : 0 tout de suite', () => {
    const base = { productions: productionsSTD() };
    const details = (args) => banc(args).win.calculerDetailsNoteFinale(DA.ALICE);
    it('PENDANT LE TRIMESTRE, écartée : la note reste provisoire, le pool seul (86,67), comme la terminale non remise', () => {
        const d = details({ ...base, pratique: pratiqueSTD({ regle: 'ecarter' }), evaluations: marquer(COPIES_STD, DA.ALICE, 'T1') });
        expect([Math.round(d.noteFinale * 100) / 100, d.estProvisoire, d.terminal.note]).toEqual([86.67, true, null]);
        const t = details({ ...base, pratique: pratiqueSTD(), evaluations: retirer(COPIES_STD, DA.ALICE, 'T1') });
        expect([Math.round(t.noteFinale * 100) / 100, t.estProvisoire]).toEqual([86.67, true]);
    });
    it('NOTES FINALES COCHÉES : écartée OU non remise, la terminale vaut 0 → 86,67 × 60 % = 52, finale (décision 4)', () => {
        const d = details({ ...base, pratique: pratiqueSTD({ regle: 'ecarter', notesFinales: true }), evaluations: marquer(COPIES_STD, DA.ALICE, 'T1') });
        expect([Math.round(d.noteFinale * 100) / 100, d.estProvisoire, d.terminal.note]).toEqual([52, false, 0]);
        const t = details({ ...base, pratique: pratiqueSTD({ notesFinales: true }), evaluations: retirer(COPIES_STD, DA.ALICE, 'T1') });
        expect([Math.round(t.noteFinale * 100) / 100, t.estProvisoire, t.terminal.note]).toEqual([52, false, 0]);
    });
    it('À 0 : la terminale vaut 0 tout de suite (52), notes finales cochées ou non', () => {
        for (const notesFinales of [false, true]) {
            expect(noteDe({ ...base, pratique: pratiqueSTD({ regle: 'zero', notesFinales }), evaluations: marquer(COPIES_STD, DA.ALICE, 'T1') })).toEqual({ P: 52, comparateur: 52, capture: 52, profil: 52 });
        }
    });
    it('LE CHOIX DE LA COPIE remplace la règle : « zero » sur la terminale, sous une règle « écarter » → 52 pendant le trimestre', () => {
        expect(noteDe({ ...base, pratique: pratiqueSTD({ regle: 'ecarter' }), evaluations: marquer(COPIES_STD, DA.ALICE, 'T1', 'zero') }).profil).toBe(52);
    });
    it('UN BROUILLON de terminale ne manque pas (la décision 4 ne le nomme pas) : provisoire, aux notes finales comme avant', () => {
        const brouillon = COPIES_STD.map(e => (e.etudiantDA === DA.ALICE && e.productionId === 'T1' ? Object.assign({}, e, { verrouillee: false }) : e));
        const d = details({ ...base, pratique: pratiqueSTD({ notesFinales: true }), evaluations: brouillon });
        expect([Math.round(d.noteFinale * 100) / 100, d.estProvisoire, d.terminal.note]).toEqual([86.67, true, null]);
        const inst = new (banc({ ...base, pratique: pratiqueSTD({ notesFinales: true }), evaluations: brouillon }).win.PratiquePANStandards)().calculerPerformance(DA.ALICE);
        expect(inst).toBeCloseTo(0.86667, 4);
        const incomplet = COPIES_STD.map(e => (e.etudiantDA === DA.ALICE && e.productionId === 'T1' ? Object.assign({}, e, { travailEnCours: true }) : e));
        expect(details({ ...base, pratique: pratiqueSTD({ notesFinales: true }), evaluations: incomplet }).estProvisoire).toBe(true);
    });
    it('les captures se calculent en provisoire (#716) : une terminale manquante n\'y vaut pas 0, même notes finales cochées', () => {
        const b = banc({ ...base, pratique: pratiqueSTD({ notesFinales: true }), evaluations: retirer(COPIES_STD, DA.ALICE, 'T1') });
        expect(b.win.calculerIndicesHistoriques(DA.ALICE, FIN).P).toBe(87);
    });
    it('L\'INSTANCE standards (repli) dit la même chose : 0,8667 provisoire, 0,52 aux notes finales ou à 0', () => {
        const inst = (args) => new (banc(args).win.PratiquePANStandards)().calculerPerformance(DA.ALICE);
        expect(inst({ ...base, pratique: pratiqueSTD({ regle: 'ecarter' }), evaluations: marquer(COPIES_STD, DA.ALICE, 'T1') })).toBeCloseTo(0.86667, 4);
        expect(inst({ ...base, pratique: pratiqueSTD({ regle: 'ecarter', notesFinales: true }), evaluations: marquer(COPIES_STD, DA.ALICE, 'T1') })).toBeCloseTo(0.52, 6);
        expect(inst({ ...base, pratique: pratiqueSTD({ notesFinales: true }), evaluations: retirer(COPIES_STD, DA.ALICE, 'T1') })).toBeCloseTo(0.52, 6);
        expect(inst({ ...base, pratique: pratiqueSTD({ regle: 'zero' }), evaluations: marquer(COPIES_STD, DA.ALICE, 'T1') })).toBeCloseTo(0.52, 6);
    });
});

describe('Standards hybride, obligatoire — écartée : comme une obligatoire non remise ; à 0 : 0 tout de suite', () => {
    // Sélection : 92, 88 → 90 (× 65) ; obligatoires A5 (75), A6 (80) (× 35) ; terminale 82 (× 40 %).
    const base = { productions: productionsSTD(CATEGORIES) };
    const p = (regle, notesFinales) => pratiqueSTD({ hybride: true, notesFinales, regle });
    it('provisoire, écartée : ignorée, comme la non remise → obligatoires 80 → 86,5 × 60 % + 32,8 = 84,7', () => {
        expect(noteDe({ ...base, pratique: p('ecarter', false), evaluations: marquer(COPIES_STD, DA.ALICE, 'A5') }).profil).toBe(84.7);
        expect(noteDe({ ...base, pratique: p(null, false), evaluations: retirer(COPIES_STD, DA.ALICE, 'A5') }).profil).toBe(84.7);
    });
    it('notes finales, écartée : 0 au dénominateur, comme la non remise → 80 / 2 = 40 → 76,3', () => {
        expect(noteDe({ ...base, pratique: p('ecarter', true), evaluations: marquer(COPIES_STD, DA.ALICE, 'A5') }).profil).toBe(76.3);
        expect(noteDe({ ...base, pratique: p(null, true), evaluations: retirer(COPIES_STD, DA.ALICE, 'A5') }).profil).toBe(76.3);
    });
    it('à 0 : (0 + 80) / 2 = 40 → 76,3 pendant le trimestre aussi', () => {
        expect(noteDe({ ...base, pratique: p('zero', false), evaluations: marquer(COPIES_STD, DA.ALICE, 'A5') }).profil).toBe(76.3);
        expect(noteDe({ ...base, pratique: p('zero', true), evaluations: marquer(COPIES_STD, DA.ALICE, 'A5') }).profil).toBe(76.3);
    });
});

/* ================================================================== LE COMPARATEUR (relecture du 9 nov.) */
describe('Le Comparateur simule une pratique NON ACTIVE avec SA règle, pas celle de la pratique active', () => {
    it('sommative active sans règle (0 : 54) ; simulée « l\'écarter » : 90', () => {
        const ecarter = Object.assign(avecRegle(PRATIQUE_SOM, 'ecarter'), { id: 'som-ecarter', nom: 'SOM écarter' });
        const b = banc({ pratique: PRATIQUE_SOM, productions: PRODUCTIONS_SOM, evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1'), autres: [ecarter] });
        expect(b.store.test_indicesCP[DA.ALICE].actuel.P).toBe(54);
        expect(b.win.simulerIndices(DA.ALICE, 'som-ecarter').P).toBe(90);
        expect(b.win.simulerIndices(DA.ALICE, 'som-banc').P).toBe(54);
    });
    it('standards active sans règle (écartée, « récents » : 81,4) ; simulée « lui mettre 0 » : 63,8', () => {
        const active = pratiqueSTD({ methodeSelection: 'recents' });
        const zero = Object.assign(pratiqueSTD({ methodeSelection: 'recents', regle: 'zero' }), { id: 'std-zero', nom: 'STD zéro' });
        const b = banc({ pratique: active, productions: productionsSTD(), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4'), autres: [zero] });
        expect(Math.round(b.win.calculerDetailsNoteFinale(DA.ALICE).noteFinale * 100) / 100).toBe(81.4);
        expect(Math.round(b.win.simulerIndices(DA.ALICE, 'std-zero').noteFinale * 100) / 100).toBe(63.8);
    });
    it('spécifications : la configurable simulée porte sa règle à son délégué (seule copie écartée : aucune note)', () => {
        const ecarter = Object.assign(avecRegle(PRATIQUE_SPE, 'ecarter'), { id: 'spe-ecarter', nom: 'SPE écarter' });
        const b = banc({ pratique: PRATIQUE_SPE, productions: PRODUCTIONS_SPE, evaluations: marquer([ev(DA.ALICE, 'D1', 80)], DA.ALICE, 'D1'), autres: [ecarter] });
        expect(b.win.simulerIndices(DA.ALICE, 'spe-banc').P).toBe(50);
        expect(b.win.simulerIndices(DA.ALICE, 'spe-ecarter').noteConstructible).toBe(false);
    });
});

/* ================================================================== CE QUE LES VUES LISENT (relecture du 9 nov.) */
describe('Gardée à 0 et retenue, la copie montre son libellé et le 0 compté — jamais sa note ni son niveau d\'origine', () => {
    it('la liste des retenues (profil, bilan, PDF) : « Non recevable (Plagiat) », 0', () => {
        const b = banc({ pratique: pratiqueSTD({ methodeSelection: 'recents', regle: 'zero' }), productions: productionsSTD(), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') });
        const a4 = b.win.calculerDetailsNoteFinale(DA.ALICE).portfolio.artefactsRetenus.find(a => a.productionId === 'A4');
        expect(a4).toEqual({ productionId: 'A4', note: 0, niveau: 'Non recevable (Plagiat)', enPoints: false, nonRecevable: true });
    });
    it('le bloc Note du PDF : la retenue et l\'obligatoire hybride gardées à 0 portent le libellé et 0, pas 92 ni « E »', () => {
        const PDF = [{ chemin: 'js/synthese-retroaction-data.js', internes: ['construireNoteProvisoire'] }];
        const b = banc({ pratique: pratiqueSTD({ methodeSelection: 'recents', regle: 'zero' }), productions: productionsSTD(), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4'), modules: PDF });
        const bloc = b.win.__audit['synthese-retroaction-data.js'].construireNoteProvisoire(DA.ALICE, false);
        const a4 = bloc.selection.find(x => x.titre === 'Artefact 4');
        expect([a4.niveau, a4.note]).toEqual(['Non recevable (Plagiat)', 0]);
        // Hybride, provisoire : l'obligatoire A5 gardée à 0 compte 0 au calcul du PDF, comme au moteur (avant : sans note).
        const h = banc({ pratique: pratiqueSTD({ hybride: true, regle: 'zero' }), productions: productionsSTD(CATEGORIES), evaluations: marquer(COPIES_STD, DA.ALICE, 'A5'), modules: PDF });
        const blocH = h.win.__audit['synthese-retroaction-data.js'].construireNoteProvisoire(DA.ALICE, false);
        expect(blocH.obligatoires.find(o => o.titre === 'Artefact 5')).toMatchObject({ niveau: 'Non recevable (Plagiat)', note: 0 });
        // Écartée : sans note, comme une obligatoire non remise.
        const e = banc({ pratique: pratiqueSTD({ hybride: true, regle: 'ecarter' }), productions: productionsSTD(CATEGORIES), evaluations: marquer(COPIES_STD, DA.ALICE, 'A5'), modules: PDF });
        expect(e.win.__audit['synthese-retroaction-data.js'].construireNoteProvisoire(DA.ALICE, false).obligatoires.find(o => o.titre === 'Artefact 5'))
            .toMatchObject({ niveau: 'Non recevable (Plagiat)', note: null });
    });
    it('TÉMOIN — une copie recevable retenue garde sa note et son niveau', () => {
        const b = banc({ pratique: pratiqueSTD({ methodeSelection: 'recents' }), productions: productionsSTD(), evaluations: COPIES_STD });
        expect(b.win.calculerDetailsNoteFinale(DA.ALICE).portfolio.artefactsRetenus.find(a => a.productionId === 'A4'))
            .toMatchObject({ note: 92, niveau: 'E', nonRecevable: false });
    });
});

/* ================================================================== DÉNOTATION */
describe('Dénotation — sans objet : la note reste le jugement saisi, quel que soit le choix', () => {
    it('78, la copie à 0 ou écartée', () => {
        for (const choix of ['zero', 'ecarter']) {
            const b = banc({ pratique: PRATIQUE_DEN, productions: PRODUCTIONS_SOM, evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1', choix), jugements: JUGEMENTS_DEN });
            expect(b.store.test_indicesCP[DA.ALICE].actuel.P).toBe(78);
        }
    });
});

/* ================================================================== LE REGISTRE */
describe('Le registre — la règle d\'une pratique, lue sans rien écrire', () => {
    const b = banc({ pratique: PRATIQUE_SOM, productions: PRODUCTIONS_SOM, evaluations: COPIES_SOM });
    const lire = b.win.sortCopieNonRecevableDeLaPratique;
    it('sans règle écrite : sommative et spécifications « zero », standards « ecarter », dénotation sans objet (null)', () => {
        expect([lire({}, 'sommative'), lire({}, 'specifications'), lire({}, 'standards'), lire({}, 'pan-standards'), lire({}, 'denotation')])
            .toEqual(['zero', 'zero', 'ecarter', 'ecarter', null]);
    });
    it('une règle écrite gagne ; une valeur inconnue ne compte pas', () => {
        expect([lire({ sortCopieNonRecevable: 'zero' }, 'standards'), lire({ sortCopieNonRecevable: 'ecarter' }, 'sommative'), lire({ sortCopieNonRecevable: 'autre' }, 'standards')])
            .toEqual(['zero', 'ecarter', 'ecarter']);
    });
    it('la valeur d\'une copie : null si recevable ; le choix de la copie, sinon la règle nommée', () => {
        const v = b.win.valeurCopieNonRecevable;
        expect(v({ statutIntegrite: 'recevable', sortCopieNonRecevable: 'zero' }, 'ecarter')).toBeNull();
        expect(v({ statutIntegrite: 'ia' }, 'ecarter')).toMatchObject({ sort: 'ecarter', entreDansLeCalcul: false, note: null });
        expect(v({ statutIntegrite: 'plagiat', sortCopieNonRecevable: 'zero' }, 'ecarter')).toMatchObject({ sort: 'zero', entreDansLeCalcul: true, note: 0, satisfaisante: false, dansLePortfolio: true });
    });
    it('sans règle nommée, la pratique active (ici une sommative sans règle : « zero »)', () => {
        expect(b.win.sortCopieNonRecevableDeLaPratiqueActive()).toBe('zero');
        expect(b.win.noteRetenueParLeCalcul({ statutIntegrite: 'plagiat', noteFinale: 87.5 })).toBe(0);
    });
});

/* ================================================================== LE DÉPISTAGE */
describe('Le dépistage suit la règle — écartée : comme une non remise ; à 0 : 0 (avant : sa note brute)', () => {
    const base = { productions: PRODUCTIONS_SOM };
    const lecture = (regle, choix) => {
        const b = banc({ ...base, pratique: avecRegle(PRATIQUE_SOM, regle), evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1', choix) });
        return { b, indices: b.win.calculerIndicesNDerniersArtefacts(DA.ALICE, true), copies: b.win.__audit['profil-etudiant-calculs.js']._copiesDuDepistage().get(DA.ALICE) };
    };
    it('à 0 : la performance compte la copie à 0 → (0 + 90) / 2 = 0,45 ; les copies du dépistage : 2 remises, notes 0 et 90', () => {
        const { indices, copies } = lecture('zero');
        expect([indices.performance, indices.nbArtefacts]).toEqual([0.45, 2]);
        expect(copies).toEqual({ remises: 2, notes: [0, 90] });
    });
    it('écartée : la copie sort, comme une non remise → 90 / 1 = 0,9 ; une seule copie au dépistage', () => {
        const { indices, copies } = lecture('ecarter');
        expect([indices.performance, indices.nbArtefacts]).toEqual([0.9, 1]);
        expect(copies).toEqual({ remises: 1, notes: [90] });
        const t = banc({ ...base, pratique: PRATIQUE_SOM, evaluations: retirer(COPIES_SOM, DA.ALICE, 'P1') });
        expect(t.win.calculerIndicesNDerniersArtefacts(DA.ALICE, true).performance).toBe(0.9);
    });
    it('le choix de la copie remplace la règle de la pratique active', () => {
        expect(lecture('zero', 'ecarter').indices.performance).toBe(0.9);
        expect(lecture('ecarter', 'zero').indices.performance).toBe(0.45);
    });
});

/* ================================================================== LE STOCK */
describe('Le stock — aucune copie n\'est réécrite, aucune pratique non plus', () => {
    it('le calcul lit la règle et le choix ; ni les évaluations ni les pratiques ne reçoivent d\'écriture', () => {
        const copies = marquer(COPIES_STD, DA.ALICE, 'T1');
        const b = banc({ productions: productionsSTD(), pratique: pratiqueSTD({ notesFinales: true }), evaluations: copies });
        chemins(b, DA.ALICE);
        expect(b.store.test_evaluationsSauvegardees).toEqual(copies);
        expect(b.store.test_pratiquesConfigurables[0].configuration.sortCopieNonRecevable).toBeUndefined();
        expect(b.journal.filter(j => /evaluationsSauvegardees|pratiquesConfigurables/.test(j.k))).toEqual([]);
    });
});

/* ================================================================== LES TRAJECTOIRES */
describe('Les trajectoires, mode note finale (#1226) — à 0 : un point à 0 ; écartée : aucun point', () => {
    const CANVAS = 'graphique-trajectoires-production';
    const contexte = () => new Proxy({ measureText: () => ({ width: 40 }) }, { get(c, k) { return k in c ? c[k] : () => {}; }, set() { return true; } });
    function courbe(choix) {
        const store = storeBase();
        store.test_productions = [{ id: 'P1', titre: 'Un', nom: 'Un', dateEcheance: '2026-02-03' }, { id: 'P2', titre: 'Deux', nom: 'Deux', dateEcheance: '2026-02-10' }];
        store.test_echellesTemplates = [clone(E0)];
        const crit = [{ critereId: 'c1', critereNom: 'Structure', ponderation: 100, niveauSelectionne: 'M' }];
        store.test_evaluationsSauvegardees = [
            ev(DA.ALICE, 'P1', 80, Object.assign({ criteres: crit, dateEvaluation: '2026-02-03T12:00:00.000Z' }, PLAGIAT, { sortCopieNonRecevable: choix })),
            ev(DA.ALICE, 'P2', 90, { criteres: crit, dateEvaluation: '2026-02-10T12:00:00.000Z' })
        ];
        const configs = [];
        const Chart = function (c, config) { configs.push(config); this.destroy = () => {}; };
        Chart.getChart = () => null;
        const b = monter(store, {
            elements: { [CANVAS]: elementDom({ id: CANVAS, parentNode: {}, ownerDocument: {}, getContext: contexte }) },
            globaux: { Chart, obtenirTermeProduction: (f) => (f === 'pluriel' ? 'Productions' : 'production'), obtenirInterventionsEtudiant: () => [], toggleDisplay() {} },
            modules: ['js/profil-etudiant-calculs.js', 'js/profil-etudiant-rapport.js', 'js/profil-etudiant-confidentiel.js', 'js/graphiques-progression.js'],
            objetsExportes: ['profilActuelDA', 'etudiantsListeCache']
        });
        b.win.creerGraphiqueTrajectoiresProduction(CANVAS, { mesure: 'noteFinale', daSurbrillance: 'TOUS' });
        return (configs[0].data.datasets.find(d => d.da === DA.ALICE) || {}).data;
    }
    it('à 0 : 0 puis 0,9 ; écartée : rien, puis 0,9', () => {
        expect(courbe('zero')).toEqual([0, 0.9]);
        expect(courbe('ecarter')).toEqual([null, 0.9]);
    });
});
