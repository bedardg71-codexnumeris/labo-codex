/**
 * SENTINELLE (28 oct. 2026) — UNE COPIE NON RECEVABLE VAUT CE QUE LA RÈGLE DIT, DANS LE CALCUL.
 *
 * Mesuré par Claude Code le 28 oct. (lot 2c de l'Aide) : une copie marquée « Plagiat » gardait sa note calculée
 * (E et M, 87,5) et comptait telle quelle dans P en sommative. Les menus devaient passer les critères à « 0 »
 * (`evaluation-sauvegarde.js`), mais leur sélecteur ne trouvait rien. La règle (Grégoire, 15 oct. 2026, telle que
 * l'Aide la dit) : en sommative elle vaut 0 ; en spécifications, un travail non satisfaisant ; en standards, elle
 * sort du portfolio et une terminale non recevable vaut 0 (en hybride, notes finales cochées, une obligatoire
 * aussi) ; en dénotation, aucune copie n'entre dans la note par calcul.
 *
 * Le correctif la lit AU CALCUL, sur `statutIntegrite`, par une seule fonction du registre
 * (`valeurCopieNonRecevable` / `noteRetenueParLeCalcul`) : les copies déjà verrouillées suivent sans écriture.
 *
 * Le banc monte les modules RÉELS (bac du Suivi, même montage que #716) et juge chaque famille sur ses chemins :
 * l'indice P écrit par `calculerEtStockerIndicesCP`, la note du profil (`calculerDetailsNoteFinale`, standards),
 * le Comparateur (`simulerIndices` : note et récit) et les captures (`calculerIndicesHistoriques`).
 * Alice a la copie non recevable ; Bruno, toutes ses copies recevables, est le témoin.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, clone, RACINE } from './_helpers/bac-suivi.js';

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
/** La copie telle que l'application l'enregistre aujourd'hui : statut posé, note calculée intacte (le stock). */
const PLAGIAT = { statutIntegrite: 'plagiat', notesIntegrite: 'Banc' };
const marquer = (evaluations, da, prodId, statut = PLAGIAT) =>
    evaluations.map(e => (e.etudiantDA === da && e.productionId === prodId ? Object.assign({}, e, statut) : e));

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
function pratiqueSTD({ hybride = false, notesFinales = false, methodeSelection = 'meilleurs' } = {}) {
    return { id: 'std-banc', nom: 'STD banc', type: 'standards', calcul_note: { methode: 'conversion_niveaux' }, dansBibliotheque: true,
        configuration: Object.assign({ type: 'standards', approcheEvaluation: 'par-artefacts', echelleId: 'E0', grilleId: 'G1',
            portfolio: { utiliser: true, nombreARetenir: 3, minimumCompletion: 1, methodeSelection, reglesConformite: { actif: false } }, notesFinales },
        hybride ? { categories: { actif: true, selection: { nombreARetenir: 2, ponderation: 65 }, obligatoires: { ponderation: 35 } } } : {}) };
}
const CATEGORIES = { A1: 'selection', A2: 'selection', A3: 'selection', A4: 'selection', A5: 'obligatoire', A6: 'obligatoire' };

/* ------------------------------------------------------------------ Dénotation */
const PRATIQUE_DEN = { id: 'den-banc', nom: 'DEN banc', type: 'denotation', calcul_note: { methode: 'jugement_global' }, dansBibliotheque: true,
    configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: [{ id: 'cible-1', nom: 'Lire' }], suggestion: { methode: 'mode' }, echelleId: null, grilleId: null } };
const JUGEMENTS_DEN = { 'den-banc': { [DA.ALICE]: { ciblesAtteintes: { 'cible-1': true }, noteFinale: 78, justification: 'Jugement de banc', date: '2026-05-01' } } };

/* ------------------------------------------------------------------ Le bac (celui de #716) */
const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/pratiques/pratique-configurable.js',
    'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js',
    'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js', { chemin: 'js/saisie-presences.js', internes: [] },
    'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/snapshots.js'];
const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', '__audit'];

function banc({ pratique, productions, evaluations, jugements = {} }) {
    const store = storeBase();
    store.test_groupeEtudiants = store.test_groupeEtudiants.filter(e => e.da === DA.ALICE || e.da === DA.BRUNO);
    store.test_groupesCours[0].pratiqueId = pratique.id;
    store.test_pratiquesConfigurables = [clone(pratique)];
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
/** Les quatre chemins, pour un élève : P stocké, Comparateur (note), captures, et la note du profil en standards. */
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
const recitDe = (b, da) => b.win.simulerIndices(da, b.pratique.id).recit;

describe('Sommative — la copie non recevable vaut 0 (P, Comparateur, captures)', () => {
    const b = banc({ pratique: PRATIQUE_SOM, productions: PRODUCTIONS_SOM, evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1') });

    it('Alice : (0 × 40 + 90 × 60) / 100 = 54 — avant le correctif : (87,5 × 40 + 90 × 60) / 100 = 89', () => {
        expect(chemins(b, DA.ALICE)).toEqual({ P: 54, comparateur: 54, capture: 54, profil: null });
    });
    it('le récit du Comparateur donne à la copie la note que le calcul retient (0), pas 87,5', () => {
        const ligne = recitDe(b, DA.ALICE).resultats.find(r => r.productionId === 'P1');
        expect(ligne).toMatchObject({ sort: 'compte', note: 0 });
        expect(recitDe(b, DA.ALICE).synthese.noteFinale).toBeCloseTo(54, 6);
    });
    it('TÉMOIN — Bruno, tout recevable : 67 partout (la valeur de #716)', () => {
        expect(chemins(b, DA.BRUNO)).toEqual({ P: 67, comparateur: 67, capture: 67, profil: null });
    });
    it('TÉMOIN — la même copie RECEVABLE garde sa note : Alice 89', () => {
        const t = banc({ pratique: PRATIQUE_SOM, productions: PRODUCTIONS_SOM, evaluations: COPIES_SOM });
        expect(chemins(t, DA.ALICE)).toEqual({ P: 89, comparateur: 89, capture: 89, profil: null });
    });
    it('l\'exception de la règle : une reprise remplace la copie non recevable (75) — (75 × 40 + 90 × 60) / 100 = 84', () => {
        const copies = marquer(COPIES_SOM, DA.ALICE, 'P1', Object.assign({ remplaceeParId: 'EV-reprise' }, PLAGIAT))
            .concat([ev(DA.ALICE, 'P1', 75, { id: 'EV-reprise', repriseDeId: 'EV-' + DA.ALICE + '-P1' })]);
        expect(chemins(banc({ pratique: PRATIQUE_SOM, productions: PRODUCTIONS_SOM, evaluations: copies }), DA.ALICE).P).toBe(84);
    });
    it('« IA non autorisée » suit la même règle que « Plagiat »', () => {
        const t = banc({ pratique: PRATIQUE_SOM, productions: PRODUCTIONS_SOM, evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1', { statutIntegrite: 'ia' }) });
        expect(chemins(t, DA.ALICE).P).toBe(54);
    });
});

describe('Sommative configurable — le verrou de l\'assistant lit la note que le calcul retient', () => {
    // « Une évaluation doit être réussie pour que la note dépasse un plafond » (#897) : Dissertation sous 60 → plafond 40.
    const pratique = (conditions) => Object.assign(clone(PRATIQUE_SOM), { calcul_note: { methode: 'moyenne_ponderee', conditions_speciales: conditions } });
    const VERROU = [{ type: 'double_verrou', condition: { evaluation: 'Dissertation', comparateur: '<', seuil: 60 }, consequence: { action: 'plafonner', valeur: 40 } }];

    it('la Dissertation non recevable vaut 0 < 60 : la note est plafonnée à 40 — avant : 87,5 ≥ 60, aucun plafond (54)', () => {
        const b = banc({ pratique: pratique(VERROU), productions: PRODUCTIONS_SOM, evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1') });
        expect(chemins(b, DA.ALICE)).toEqual({ P: 40, comparateur: 40, capture: 40, profil: null });
    });
    it('TÉMOIN — la même Dissertation recevable (87,5) : aucun plafond, 89', () => {
        const b = banc({ pratique: pratique(VERROU), productions: PRODUCTIONS_SOM, evaluations: COPIES_SOM });
        expect(chemins(b, DA.ALICE).P).toBe(89);
    });
});

describe('Spécifications — la copie non recevable est un travail non satisfaisant', () => {
    const b = banc({ pratique: PRATIQUE_SPE, productions: PRODUCTIONS_SPE, evaluations: marquer(COPIES_SPE, DA.ALICE, 'D2') });

    it('Alice : une seule dissertation satisfaisante → palier C (60) — avant : 87,5 ≥ 70, palier A (100)', () => {
        expect(chemins(b, DA.ALICE)).toEqual({ P: 60, comparateur: 60, capture: 60, profil: null });
    });
    it('TÉMOIN — la même copie recevable : palier A (100) ; Bruno : palier F (50)', () => {
        const t = banc({ pratique: PRATIQUE_SPE, productions: PRODUCTIONS_SPE, evaluations: COPIES_SPE });
        expect(chemins(t, DA.ALICE).P).toBe(100);
        expect(chemins(b, DA.BRUNO).P).toBe(50);
    });
});

describe('Standards — hors du portfolio ; la terminale non recevable vaut 0', () => {
    it('TERMINALE non recevable : 86,67 × 60 % + 0 × 40 % = 52 — avant : 82 comptait (84,8)', () => {
        const b = banc({ pratique: pratiqueSTD(), productions: productionsSTD(), evaluations: marquer(COPIES_STD, DA.ALICE, 'T1') });
        expect(chemins(b, DA.ALICE)).toEqual({ P: 52, comparateur: 52, capture: 52, profil: 52 });
        const terminale = recitDe(b, DA.ALICE).resultats.find(r => r.label === 'Analyse finale');
        expect(terminale).toMatchObject({ note: 0, sort: 'compte' });
    });
    // L'instance codée en dur (`PratiquePANStandards.calculerPerformance`) : le repli de la note du cours et du Comparateur.
    it('INSTANCE standards, terminale non recevable : 0,52 — avant : 0,848', () => {
        const b = banc({ pratique: pratiqueSTD(), productions: productionsSTD(), evaluations: marquer(COPIES_STD, DA.ALICE, 'T1') });
        expect(new b.win.PratiquePANStandards().calculerPerformance(DA.ALICE)).toBeCloseTo(0.52, 6);
    });
    it('INSTANCE standards, artefact non recevable (A4, 92) : hors du pool, 0,814 — avant : 92 y restait (0,848)', () => {
        const b = banc({ pratique: pratiqueSTD(), productions: productionsSTD(), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') });
        expect(new b.win.PratiquePANStandards().calculerPerformance(DA.ALICE)).toBeCloseTo(0.814, 6);
    });
    it('ARTEFACT non recevable (A4, 92) : sort du pool — les trois meilleures deviennent 88, 80, 75 → 81,4 (déjà vrai avant)', () => {
        const b = banc({ pratique: pratiqueSTD(), productions: productionsSTD(), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') });
        expect(chemins(b, DA.ALICE)).toEqual({ P: 81, comparateur: 81, capture: 81, profil: 81.4 });
    });
    // En « meilleurs », une copie à 0 sortirait d'elle-même des trois retenues : « récents » départage (A6, A5, A4 par numéro).
    it('« RÉCENTS », artefact non recevable (A4) : hors du pool, A6, A5, A3 → 81 × 60 % + 82 × 40 % = 81,4 (profil et instance)', () => {
        const b = banc({ pratique: pratiqueSTD({ methodeSelection: 'recents' }), productions: productionsSTD(), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') });
        expect(chemins(b, DA.ALICE)).toEqual({ P: 81, comparateur: 81, capture: 81, profil: 81.4 });
        expect(new b.win.PratiquePANStandards().calculerPerformance(DA.ALICE)).toBeCloseTo(0.814, 6);
    });
    it('HYBRIDE, notes finales : une obligatoire non recevable (A5) compte 0 — 80 / 2 = 40 aux obligatoires → 76,3 (déjà vrai avant)', () => {
        const b = banc({ pratique: pratiqueSTD({ hybride: true, notesFinales: true }), productions: productionsSTD(CATEGORIES), evaluations: marquer(COPIES_STD, DA.ALICE, 'A5') });
        const c = chemins(b, DA.ALICE);
        expect([c.P, c.comparateur, c.profil]).toEqual([76, 76, 76.3]);
    });
    it('TÉMOIN — tout recevable : Alice 84,8, Bruno inchangé entre les deux bancs', () => {
        const t = banc({ pratique: pratiqueSTD(), productions: productionsSTD(), evaluations: COPIES_STD });
        const b = banc({ pratique: pratiqueSTD(), productions: productionsSTD(), evaluations: marquer(COPIES_STD, DA.ALICE, 'T1') });
        expect(chemins(t, DA.ALICE).profil).toBe(84.8);
        expect(chemins(b, DA.BRUNO)).toEqual(chemins(t, DA.BRUNO));
    });
});

describe('Un réglage qui remplacerait la règle n\'a rien à changer aux familles (chantier de Grégoire, 28 oct.)', () => {
    // Le réglage n'existe pas : on le SIMULE en remplaçant les deux lecteurs du registre sur le window du banc — « la copie
    // reste au portfolio, à 0 ». Si une famille relisait la note calculée (tri, somme, récit), elle trahirait le réglage.
    function avecReglage(b) {
        const VALEUR = { note: 0, satisfaisante: false, dansLePortfolio: true };
        b.win.valeurCopieNonRecevable = (e) => (b.win.evaluationNonRecevable(e) ? VALEUR : null);
        b.win.noteRetenueParLeCalcul = (e) => (b.win.evaluationNonRecevable(e) ? VALEUR.note : e.noteFinale);
        return b;
    }
    it('« meilleurs » : A4 reste au pool à 0, triée à sa note retenue → 88, 80, 75 → 81,4 (trié sur 92 : 0, 88, 80 → 72,4)', () => {
        const b = avecReglage(banc({ pratique: pratiqueSTD(), productions: productionsSTD(), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') }));
        expect(Math.round(b.win.calculerDetailsNoteFinale(DA.ALICE).noteFinale * 100) / 100).toBe(81.4);
        expect(new b.win.PratiquePANStandards().calculerPerformance(DA.ALICE)).toBeCloseTo(0.814, 6);
    });
    it('« récents » : A6, A5, A4 à 0 → 51,67 × 60 % + 32,8 = 63,8 ; le récit montre A4 à 0', () => {
        const b = avecReglage(banc({ pratique: pratiqueSTD({ methodeSelection: 'recents' }), productions: productionsSTD(), evaluations: marquer(COPIES_STD, DA.ALICE, 'A4') }));
        const d = b.win.calculerDetailsNoteFinale(DA.ALICE);
        expect(Math.round(d.noteFinale * 100) / 100).toBe(63.8);
        expect(d.recit.resultats.find(r => r.label === 'Artefact 4')).toMatchObject({ sort: 'compte', note: 0 });
        expect(new b.win.PratiquePANStandards().calculerPerformance(DA.ALICE)).toBeCloseTo(0.638, 6);
    });
});

describe('Dénotation — aucune copie n\'entre dans la note par calcul', () => {
    it('la note reste le jugement saisi (78), copie non recevable ou non (déjà vrai avant)', () => {
        const b = banc({ pratique: PRATIQUE_DEN, productions: PRODUCTIONS_SOM, evaluations: marquer(COPIES_SOM, DA.ALICE, 'P1'), jugements: JUGEMENTS_DEN });
        const t = banc({ pratique: PRATIQUE_DEN, productions: PRODUCTIONS_SOM, evaluations: COPIES_SOM, jugements: JUGEMENTS_DEN });
        expect(b.store.test_indicesCP[DA.ALICE].actuel.P).toBe(78);
        expect(b.win.simulerIndices(DA.ALICE, 'den-banc').P).toBe(t.win.simulerIndices(DA.ALICE, 'den-banc').P);
    });
});

describe('Le stock — une copie verrouillée avant le correctif suit la règle, sans aucune écriture dans ses données', () => {
    it('la copie garde sa note enregistrée (87,5) ; aucun site n\'écrit dans les évaluations', () => {
        const copies = marquer(COPIES_SOM, DA.ALICE, 'P1');
        const b = banc({ pratique: PRATIQUE_SOM, productions: PRODUCTIONS_SOM, evaluations: copies });
        chemins(b, DA.ALICE);
        expect(b.store.test_evaluationsSauvegardees).toEqual(copies);
        expect(b.store.test_evaluationsSauvegardees.find(e => e.etudiantDA === DA.ALICE && e.productionId === 'P1').noteFinale).toBe(87.5);
        expect(b.journal.filter(j => /evaluationsSauvegardees/.test(j.k))).toEqual([]);
        expect(b.store.test_indicesCP[DA.ALICE].actuel.P).toBe(54);
    });
});

describe('La source unique — aucune famille ne relit `statutIntegrite` elle-même', () => {
    const FICHIERS = ['js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
        'js/pratiques/pratique-configurable.js', 'js/pratiques/denotation-jugements.js', 'js/profil-etudiant-actions.js', 'js/comparateur-pratiques.js',
        'js/portfolio.js', 'js/snapshots.js'];
    for (const f of FICHIERS) {
        it(f, () => {
            const code = readFileSync(path.join(RACINE, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
            expect(code).not.toMatch(/statutIntegrite|'plagiat'|'ia'/);
        });
    }
    it('l\'Aide dit ce que fait l\'écran : les critères gardent l\'évaluation ; les menus ne passent plus à « 0 »', () => {
        const aide = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
        expect(aide).toContain('Non recevable, tes critères gardent ton évaluation et la note de la copie suit la règle ci-dessus&nbsp;; verrouille ensuite.');
        expect(aide).not.toContain('tous les critères passent à');
        expect(readFileSync(path.join(RACINE, 'js/evaluation-sauvegarde.js'), 'utf8')).not.toContain(`querySelectorAll('select[id^="critere"]')`);
    });
    it('le registre porte la règle : un objet, deux lecteurs', () => {
        const code = readFileSync(path.join(RACINE, 'js/pratiques/pratique-registre.js'), 'utf8');
        expect(code).toMatch(/const VALEUR_COPIE_NON_RECEVABLE_PAR_DEFAUT = Object\.freeze\(\{/);
        expect(code).toMatch(/window\.valeurCopieNonRecevable = valeurCopieNonRecevable;/);
        expect(code).toMatch(/window\.noteRetenueParLeCalcul = noteRetenueParLeCalcul;/);
    });
});
