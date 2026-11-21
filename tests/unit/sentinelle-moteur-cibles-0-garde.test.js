/**
 * SENTINELLE (20 nov. 2026) — LE MOTEUR PAR CIBLES, LOT 0 : LA GARDE.
 *
 * Plan : plans de travail/PLAN-2026-11-20-moteur-par-objectifs.md (§ 6 et § 8, lot 0).
 * Consigne : plans de travail/CONSIGNE-LOT-2026-11-20-moteur-cibles-0-garde.md.
 * Posée AVANT la première ligne de moteur : rien dans `js/` ne change avec ce lot.
 *
 * LES DEUX NOMS ARRÊTÉS ICI (techniques, jamais lus par un·e étudiant·e) :
 *   - la clé      : `inscriptionsCibles`  (par trimestre, donc `cle('inscriptionsCibles')`) ;
 *   - la méthode  : `niveaux_par_cible`   (`calcul_note.methode`). Ce n'est pas le jeton `pan_par_objectif`
 *                   que garde la sentinelle #396 : le chemin retiré ne revient pas sous son nom.
 * PROVISOIRES, à arrêter au lot 1 (ils servent ici à poser les objets à la main) : la clé de l'ensemble
 * (`ensemblesCibles`) et l'identifiant du type (`cibles`), qui suit un mot encore ouvert.
 *
 * VERROUILLÉ ICI :
 *   A. LA NON-INGÉRENCE. Les cas déjà épinglés (le golden master de la sommative, SOM-1, GREG-0 à GREG-2, SPE-1,
 *      DEN-1 et DEN-2) rejoués dans un espace qui contient AUSSI un ensemble de cibles, une pratique par cibles
 *      non active et des inscriptions pour les mêmes DA : mêmes chiffres, sur chaque chemin de la note. Et aucun
 *      des modules montés ne LIT les clés neuves (le store du banc consigne chaque lecture) : un moteur qui
 *      lirait la collection sans déplacer de chiffre aujourd'hui rougit quand même.
 *   B. LE CLIQUET DE SILENCE. Les six fichiers des moteurs existants (§ 6, point 2) ne nomment ni la clé ni la
 *      méthode, commentaires compris.
 *
 * CE QUE CET ESSAI NE PROUVE PAS : le sens inverse (la pratique par cibles ne lit pas les évaluations). Il ne
 * peut pas s'épingler avant que le moteur existe : inscrit au plan, lot 4.
 *
 * Données fictives (Alice Assidu, Boréal Absent : les élèves du banc partagé). Les modules RÉELS, aucun navigateur.
 * BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, clone, RACINE } from './_helpers/bac-suivi.js';
import { chargerScript } from './_helpers/charger-script.js';

/* ---------------------------------------------------------------- Les noms */
const CLE_INSCRIPTIONS = 'inscriptionsCibles';
const METHODE = 'niveaux_par_cible';
const CLE_ENSEMBLES_PROVISOIRE = 'ensemblesCibles';
const TYPE_PROVISOIRE = 'cibles';
const JETONS_NEUFS = [CLE_INSCRIPTIONS, METHODE, CLE_ENSEMBLES_PROVISOIRE];

/* ---------------------------------------------------------------- Les objets neufs, posés à la main (plan, § 3) */
const DA = { ALICE: '2000001', BOREAL: '2000002' };
const ENSEMBLE = { id: 'ENS1', nom: 'Cibles du cours banc', coursId: 'GC1', objectifs: [
    { id: 'cib-a', nom: 'Lire un texte', poids: 1, type: 'fondamental' },
    { id: 'cib-b', nom: 'Rédiger une analyse', poids: 1, type: 'fondamental' },
    { id: 'cib-c', nom: 'Réviser sa copie', poids: 1, type: 'transversal' }
] };
const PRATIQUE_CIBLES = { id: 'cib-banc', nom: 'Par cibles banc', type: TYPE_PROVISOIRE, calcul_note: { methode: METHODE }, dansBibliotheque: true,
    configuration: { type: TYPE_PROVISOIRE, echelleId: 'E0', ensembleCiblesId: 'ENS1', retenue: 'meilleur' } };
let numero = 0;
const inscription = (da, cibleId, niveau, productionId, date) => ({ id: 'INS' + (++numero), da, ensembleId: 'ENS1', cibleId, niveau, echelleId: 'E0',
    date, horodatage: date + 'T10:00:00.000Z', productionId, annulee: false });
/** Des niveaux faibles, sur les productions des cas rejoués : un moteur qui les lirait par mégarde baisserait la note. */
const inscriptionsPour = (productionId) => [DA.ALICE, DA.BOREAL].flatMap(da => [
    inscription(da, 'cib-a', 'I', productionId, '2026-05-01'),
    inscription(da, 'cib-a', 'D', productionId, '2026-05-15'),
    inscription(da, 'cib-b', 'I', null, '2026-05-10'),
    Object.assign(inscription(da, 'cib-c', 'E', null, '2026-05-12'), { annulee: true })
]);

/* ---------------------------------------------------------------- Les cas rejoués (formes des sentinelles d'origine) */
const E0 = { id: 'E0', nom: 'IDME banc', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40 }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75 }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100 }
] };
const niveau = (n) => (n >= 85 ? 'E' : n >= 75 ? 'M' : n >= 65 ? 'D' : 'I');
const ev = (da, prodId, note) => ({
    id: 'EV-' + da + '-' + prodId, etudiantDA: da, productionId: prodId, noteFinale: note, niveauFinal: niveau(note), echelleId: 'E0', ponderationCouverte: 100,
    verrouillee: true, coursId: 'GC1', groupe: '01', dateEvaluation: '2026-05-20T12:00:00.000Z', statutIntegrite: 'recevable', statutRemise: 'evalue', criteres: []
});

// Sommative (sentinelle-construction-de-la-note, SOM-1)
const PROD_SOM = [
    { id: 'P1', titre: 'Dissertation', type: 'travail', ponderation: 40, coursId: 'GC1' },
    { id: 'P2', titre: 'Examen', type: 'examen', ponderation: 60, coursId: 'GC1' }
];
const COPIES_SOM = [ev(DA.ALICE, 'P1', 80), ev(DA.ALICE, 'P2', 90), ev(DA.BOREAL, 'P1', 62), ev(DA.BOREAL, 'P2', 71)];
const SOM = { id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' }, dansBibliotheque: true, configuration: {} };

// Standards : la pratique de Grégoire (sentinelle-standards-sans-portfolio, GREG-0 à GREG-2)
function prodGreg() {
    const l = [{ id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 60, coursId: 'GC1' }];
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].forEach((id, i) => l.push({ id, titre: 'Artefact ' + (i + 1), type: 'artefact-portfolio', numero: i + 1, ponderation: 0, coursId: 'GC1' }));
    l.push({ id: 'T1', titre: 'Analyse finale', type: 'terminale', numero: 7, ponderation: 40, coursId: 'GC1' });
    return l;
}
const NOTES_GREG = { A1: 60, A2: 70, A3: 88, A4: 92, A5: 75, A6: 80, T1: 82 };
const COPIES_GREG = Object.entries(NOTES_GREG).map(([p, n]) => ev(DA.ALICE, p, n));
function std() {
    return { id: 'std-banc', nom: 'STD banc', type: 'standards', calcul_note: { methode: 'conversion_niveaux' }, dansBibliotheque: true,
        configuration: { approcheEvaluation: 'par-artefacts', echelleId: 'E0', grilleId: null, notesFinales: false,
            portfolio: { utiliser: true, nombreTotal: 6, nombreARetenir: 3, methodeSelection: 'meilleurs', minimumCompletion: 3 } } };
}

// Spécifications (sentinelle-construction-de-la-note, SPE-1)
const PROD_SPE = [
    { id: 'D1', titre: 'Dissertation 1', type: 'dissertation', coursId: 'GC1' }, { id: 'X1', titre: 'Examen 1', type: 'examen', coursId: 'GC1' },
    { id: 'D2', titre: 'Dissertation 2', type: 'dissertation', coursId: 'GC1' }, { id: 'F1', titre: 'Dossier', type: 'dossier', coursId: 'GC1' }
];
const COPIES_SPE = [ev(DA.ALICE, 'D1', 80), ev(DA.ALICE, 'X1', 90), ev(DA.ALICE, 'D2', 87.5), ev(DA.ALICE, 'F1', 72),
    ev(DA.BOREAL, 'D1', 71), ev(DA.BOREAL, 'X1', 50), ev(DA.BOREAL, 'D2', 88), ev(DA.BOREAL, 'F1', 90)];
const SPE = { id: 'spe-banc', nom: 'SPE banc', type: 'specifications', calcul_note: { methode: 'specifications' }, dansBibliotheque: true,
    configuration: { type: 'specifications', seuilAcceptable: 70,
        typesTravaux: [{ id: 'dissertation', nom: 'Dissertation' }, { id: 'examen', nom: 'Examen' }, { id: 'dossier', nom: 'Dossier' }],
        forfaits: [
            { lettre: 'A', note: 100, travaux: { dissertation: 2, examen: 1, dossier: 1 } }, { lettre: 'B', note: 80, travaux: { dissertation: 2, examen: 1 } },
            { lettre: 'C', note: 60, travaux: { dissertation: 1, examen: 1 } }, { lettre: 'F', note: 50, travaux: {} }
        ] } };

// Dénotation (sentinelle-construction-de-la-note, DEN-1 et DEN-2)
const DEN = { id: 'den-banc', nom: 'DEN banc', type: 'denotation', calcul_note: { methode: 'jugement_global' }, dansBibliotheque: true,
    configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: [{ id: 'c1', nom: 'Lire' }, { id: 'c2', nom: 'Écrire' }], suggestion: { methode: 'mode' } } };
const jugement = (cibles, note) => ({ 'den-banc': { [DA.ALICE]: { ciblesAtteintes: cibles, noteFinale: note, justification: 'Banc', date: '2026-05-01' } } });

function greg2() {
    const productions = prodGreg().concat([{ id: 'W1', titre: 'Exercice', type: 'travail', numero: 8, ponderation: 10, coursId: 'GC1', categorie: 'obligatoire' }]);
    productions.find(p => p.id === 'A1').categorie = 'selection';
    return { pratique: std(), productions, evaluations: COPIES_GREG.concat([ev(DA.ALICE, 'W1', 50)]) };
}
const sansPortfolio = () => { const s = std(); s.configuration.portfolio.utiliser = false; return s; };

/** Chaque cas, et ce que sa sentinelle d'origine épingle (les chiffres ne sont pas recalculés ici : ils sont recopiés). */
const CAS = [
    { nom: 'SOM-1', monde: () => ({ pratique: SOM, productions: PROD_SOM, evaluations: COPIES_SOM }), production: 'P1',
        attendu: { [DA.ALICE]: { P: 86, comparateur: 86, profil: null, export: [86, 'provisoire'] } } },
    { nom: 'GREG-0', monde: () => ({ pratique: std(), productions: prodGreg(), evaluations: COPIES_GREG }), production: 'A4',
        attendu: { [DA.ALICE]: { profil: 84.8, P: 85, comparateur: 85, export: [85, 'provisoire'] } } },
    { nom: 'GREG-1', monde: () => ({ pratique: sansPortfolio(), productions: prodGreg(), evaluations: COPIES_GREG }), production: 'A4',
        attendu: { [DA.ALICE]: { profil: 84.8 } } },
    { nom: 'GREG-2', monde: greg2, production: 'W1', attendu: { [DA.ALICE]: { profil: 84.8 } } },
    { nom: 'SPE-1', monde: () => ({ pratique: SPE, productions: PROD_SPE, evaluations: COPIES_SPE }), production: 'D2',
        attendu: { [DA.ALICE]: { P: 100, comparateur: 100, export: [100, 'provisoire'] }, [DA.BOREAL]: { P: 50 } } },
    { nom: 'DEN-1', monde: () => ({ pratique: DEN, productions: PROD_SOM, evaluations: COPIES_SOM, jugements: jugement({ c1: true, c2: true }, 78) }), production: 'P1',
        attendu: { [DA.ALICE]: { P: 78, comparateur: 78, export: [78, 'provisoire'] } } },
    { nom: 'DEN-2', monde: () => ({ pratique: DEN, productions: PROD_SOM, evaluations: COPIES_SOM, jugements: jugement({ c1: true, c2: false }, 78) }), production: 'P1',
        attendu: { [DA.ALICE]: { P: 59 } } }
];

/* ---------------------------------------------------------------- Le bac (celui du banc du 28 oct., modules RÉELS) */
const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/entites/production-diagnostique.js', 'js/pratiques/pratique-configurable.js',
    'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js',
    'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js', { chemin: 'js/saisie-presences.js', internes: [] },
    'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/snapshots.js', 'js/export-resultats-finaux.js'];
const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', '__audit', 'ProductionDiagnostique', '_exportResultats'];

/** Un store qui consigne chaque clé LUE (par `in` ou par accès) : c'est le témoin des lectures. */
function storeTemoin(store) {
    const lues = new Set();
    const noter = (k) => { if (typeof k === 'string') lues.add(k); };
    return { lues, store: new Proxy(store, { has(t, k) { noter(k); return k in t; }, get(t, k) { noter(k); return t[k]; } }) };
}

function banc({ pratique, productions, evaluations, jugements = {} }, { habite, production }) {
    const brut = storeBase();
    brut.test_groupeEtudiants = brut.test_groupeEtudiants.filter(e => e.da === DA.ALICE || e.da === DA.BOREAL);
    brut.test_groupesCours[0].pratiqueId = pratique.id;
    brut.test_pratiquesConfigurables = [clone(pratique)];
    brut.test_echellesTemplates = [clone(E0)];
    brut.test_productions = clone(productions);
    brut.test_evaluationsSauvegardees = clone(evaluations);
    brut.test_jugementsDenotation = clone(jugements);
    if (habite) {
        brut.test_pratiquesConfigurables.push(clone(PRATIQUE_CIBLES));               // présente, NON active
        brut['test_' + CLE_ENSEMBLES_PROVISOIRE] = [clone(ENSEMBLE)];
        brut['test_' + CLE_INSCRIPTIONS] = inscriptionsPour(production);
    }
    const { store, lues } = storeTemoin(brut);
    let win = null;
    const classe = (nom) => function (config) { return new win[nom](config); };
    const b = monter(store, {
        modules: MODULES, objetsExportes: OBJETS_EXPORTES, aujourdhui: '2026-10-28', journal: [],
        globaux: {
            PratiqueConfigurable: classe('PratiqueConfigurable'), PratiqueSommative: classe('PratiqueSommative'), PratiquePANStandards: classe('PratiquePANStandards'),
            PratiquePanSpecifications: classe('PratiquePanSpecifications'),
            obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
            resoudreModeleParId: (type, id) => { const l = brut['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []; return clone(l.find(m => m && m.id === id) || null); },
            obtenirInterventionsEtudiant: () => [], aDesInfosConfidentielles: () => false
        }
    });
    win = b.win;
    win.calculerEtStockerIndicesCP();
    return Object.assign(b, { brut, lues, pratiqueId: pratique.id });
}

/**
 * Les quatre chemins de la note (P stocké, Comparateur, profil, export), le récit du profil, puis deux appels directs :
 * `directe`, le `calculerPerformance` de l'instance de la pratique active (une configurable), et `enDur`, celui des
 * trois instances codées en dur. Une pratique enregistrée ne passe JAMAIS par `pratique-pan-standards.js` pour sa
 * note (break-test M5) : sans `enDur`, une lecture posée là échapperait au témoin.
 */
function note(b, da) {
    const w = b.win;
    const sim = w.simulerIndices(da, b.pratiqueId);
    const d = w.calculerDetailsNoteFinale(da);
    const entree = b.brut.test_indicesCP[da] && b.brut.test_indicesCP[da].actuel;
    const ex = w._exportResultats;
    const ligne = ex.construireLignesSynthese([{ da, nom: 'X', prenom: 'Y' }], { pratiqueId: b.pratiqueId, notesFinales: ex.notesFinaliseesDe(b.pratiqueId) },
        (x, id) => w.simulerIndices(x, id))[0];
    return {
        P: entree ? (entree.noteConstructible === false ? null : entree.P) : null,
        comparateur: sim && sim.noteConstructible !== false ? sim.P : null,
        profil: d && typeof d.noteFinale === 'number' ? Math.round(d.noteFinale * 100) / 100 : null,
        export: [ligne[8], ligne[9]],
        cause: typeof w.causeNoteNonConstructible === 'function' ? w.causeNoteNonConstructible(da) : null,
        formule: d && d.recit ? d.recit.synthese.formuleTexte : null,
        indices: clone(sim || null),
        directe: performanceDe(w, b.pratiqueId, da),
        enDur: Object.fromEntries(INSTANCES_EN_DUR.map(id => [id, performanceDe(w, id, da)]))
    };
}
const INSTANCES_EN_DUR = ['sommative', 'standards', 'specifications'];
function performanceDe(w, id, da) {
    const p = w.obtenirPratiqueParId(id);
    if (!p || typeof p.calculerPerformance !== 'function') return 'sans instance';
    try { return p.calculerPerformance(da); } catch (e) { return 'erreur : ' + e.message; }
}
const jouer = (cas, habite) => {
    const b = banc(cas.monde(), { habite, production: cas.production });
    const notes = {};
    for (const da of [DA.ALICE, DA.BOREAL]) notes[da] = note(b, da);
    return { b, notes };
};

/* ================================================================ A. LA NON-INGÉRENCE */
describe('A · non-ingérence : les notes épinglées ne bougent pas quand les objets du moteur par cibles sont là', () => {
    it('TÉMOIN — l\'espace habité porte bien les trois objets, et le store consigne les lectures', () => {
        const { b } = jouer(CAS[0], true);
        expect(b.brut.test_pratiquesConfigurables.map(p => p.id)).toEqual(['som-banc', 'cib-banc']);
        expect(b.brut.test_groupesCours[0].pratiqueId).toBe('som-banc');                       // la pratique par cibles n'est PAS active
        expect(b.brut.test_ensemblesCibles).toHaveLength(1);
        expect(b.brut.test_inscriptionsCibles.filter(i => i.da === DA.ALICE)).toHaveLength(4);
        expect(b.brut.test_inscriptionsCibles.some(i => i.productionId === 'P1')).toBe(true);  // sur une production du cas
        expect(b.lues.has('test_evaluationsSauvegardees')).toBe(true);                         // le témoin voit les lectures
        expect(b.lues.has('test_pratiquesConfigurables')).toBe(true);
    });

    for (const cas of CAS) {
        it(cas.nom + ' : mêmes chiffres, nu et habité, sur chaque chemin ; et aucune lecture des clés neuves', () => {
            const nu = jouer(cas, false);
            const habite = jouer(cas, true);
            // 1. Le cas est bien celui de sa sentinelle d'origine (sinon l'égalité ci-dessous ne dirait rien).
            for (const [da, attendu] of Object.entries(cas.attendu)) {
                expect(nu.notes[da], cas.nom + ' nu ' + da).toMatchObject(attendu);
                expect(habite.notes[da], cas.nom + ' habité ' + da).toMatchObject(attendu);
            }
            // 2. Rien ne diffère, pour les deux élèves : P stocké, Comparateur, profil, export, cause, formule, indices, appel direct.
            expect(habite.notes).toEqual(nu.notes);
            for (const v of [nu.notes[DA.ALICE].directe, ...Object.values(nu.notes[DA.ALICE].enDur)]) expect(String(v), 'une instance répond, sans lever').not.toMatch(/^sans instance|^erreur/);
            // 3. Aucun module monté n'a lu les clés neuves.
            const luesNeuves = [...habite.b.lues].filter(k => JETONS_NEUFS.some(j => k.includes(j)));
            expect(luesNeuves, 'clés neuves lues par un moteur existant').toEqual([]);
            // 4. Et rien n'y a été écrit.
            expect(habite.b.journal.map(e => e.k).filter(k => JETONS_NEUFS.some(j => String(k).includes(j)))).toEqual([]);
        });
    }

    it('le golden master de la sommative (session C) : 0,86, avec les objets neufs dans la base', () => {
        const lues = [];
        const store = {
            productions: [{ id: 'P1', ponderation: 40 }, { id: 'P2', ponderation: 60 }],
            evaluationsSauvegardees: [
                { etudiantDA: '1234567', productionId: 'P1', noteFinale: 80, remplaceeParId: null },
                { etudiantDA: '1234567', productionId: 'P2', noteFinale: 90, remplaceeParId: null },
                { etudiantDA: '1234567', productionId: 'P1', noteFinale: 10, remplaceeParId: 'x' },
                { etudiantDA: '1234567', productionId: 'P2', noteFinale: null, remplaceeParId: null }
            ],
            pratiquesConfigurables: [clone(PRATIQUE_CIBLES)],
            [CLE_ENSEMBLES_PROVISOIRE]: [clone(ENSEMBLE)],
            [CLE_INSCRIPTIONS]: [inscription('1234567', 'cib-a', 'I', 'P1', '2026-05-01'), inscription('1234567', 'cib-b', 'I', null, '2026-05-10')]
        };
        const db = { getSync: (k, d) => { lues.push(k); return k in store ? store[k] : (d !== undefined ? d : null); }, setSync: () => {}, get: async () => null, set: async () => {} };
        const cle = (k) => k;
        const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle });
        chargerScript('js/pratiques/pratique-sommative.js', { db, cle }, win);
        expect(win.obtenirPratiqueParId('sommative').calculerPerformance('1234567')).toBeCloseTo(0.86, 10);
        expect(lues).toContain('evaluationsSauvegardees');
        expect(lues.filter(k => JETONS_NEUFS.some(j => k.includes(j)))).toEqual([]);
    });
});

/* ================================================================ B. LE CLIQUET DE SILENCE */
const MOTEURS_EXISTANTS = ['js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js', 'js/evaluation-calcul.js'];

describe('B · cliquet de silence : les moteurs existants ne nomment ni la clé ni la méthode du moteur par cibles', () => {
    for (const fichier of MOTEURS_EXISTANTS) {
        it(fichier + ' ne nomme aucun des jetons neufs (commentaires compris)', () => {
            const src = readFileSync(path.join(RACINE, fichier), 'utf8');
            expect(src.length, fichier + ' est bien lu').toBeGreaterThan(1000);
            for (const jeton of JETONS_NEUFS) expect(src.includes(jeton), fichier + ' nomme « ' + jeton + ' »').toBe(false);
        });
    }
    it('la méthode neuve n\'est pas le jeton que garde la sentinelle #396', () => {
        expect(METHODE).not.toMatch(/pan[_-]par[_-]objectif/);
        expect(/objectif/i.test(METHODE) || /objectif/i.test(CLE_INSCRIPTIONS)).toBe(false);
    });
});

/* ================================================================ JOURNAL DES BREAK-TESTS (20 nov. 2026)
 *
 * Chaque mutation a été posée dans `js/`, l'essai lancé, le rouge relevé, puis la mutation retirée (`git diff js/` vide).
 *
 * M1 — `pratique-sommative.js`, en tête de `calculerPerformance` : lire `db.getSync(cle('inscriptionsCibles'), [])` et
 *      retrancher un point par inscription du DA.
 *      ROUGE : A · SOM-1 (86 attendu, la note baisse ; la clé apparaît aux lectures), A · golden master, B · pratique-sommative.js.
 * M2 — la même, mais le nom de la clé est fabriqué (`'inscriptions' + 'Cibles'`) et la valeur lue n'entre pas dans le calcul.
 *      ROUGE : A · SOM-1 et le golden master, par le SEUL témoin des lectures. B reste VERT : c'est pourquoi A ne se
 *      contente pas de comparer des chiffres, et pourquoi B ne suffit pas seul.
 * M3 — `profil-etudiant-calculs.js` : un commentaire qui nomme `niveaux_par_cible`, sans code.
 *      ROUGE : B · profil-etudiant-calculs.js. A reste VERT : c'est pourquoi le cliquet existe à côté de la sentinelle.
 * M4 — la lecture au nom fabriqué de M2, posée en tête de `calculerDetailsNoteFinale` (`profil-etudiant-actions.js`).
 *      ROUGE : les sept cas de A (SOM-1, GREG-0 à GREG-2, SPE-1, DEN-1, DEN-2), par le témoin des lectures.
 * M5 — la même, en tête de `PratiquePANStandards.calculerPerformance` (`pratique-pan-standards.js`).
 *      D'ABORD VERT PARTOUT : une pratique enregistrée (celle de Grégoire comprise) est une `PratiqueConfigurable`, et
 *      sa note ne passe par aucune méthode de ce fichier. C'est ce qui a fait ajouter `enDur` à `note()` : les trois
 *      instances codées en dur sont appelées dans chaque espace. Depuis : ROUGE sur les sept cas de A.
 *
 * LIMITE ASSUMÉE : A ne voit que le code qu'il exécute, B que les noms écrits en clair. Une lecture au nom fabriqué,
 * posée dans une fonction qu'aucun cas rejoué n'atteint, passe les deux.
 */
