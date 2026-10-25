/**
 * SENTINELLE — LOT A DU CADRAGE « LES RÈGLES DU DÉPISTAGE » (16 septembre 2026) :
 * LES MÊMES COPIES PARTOUT. Tranché par Grégoire le 16 sept., 17 h 18-17 h 21.
 *
 *   R1 (#737, #741, #718) — une copie compte quand l'enseignant l'a ENREGISTRÉE, avec ou sans
 *      commentaire final, partout : note, complétion, dépistage (moyennes par critère, IPB, défi
 *      spécifique, performance des N derniers artefacts), carte RàI, niveau de la note globale.
 *      Un brouillon (verrouillee: false) ne compte nulle part. UN prédicat : `evaluationEntreDansLaNote`
 *      (pratique-registre.js, #706) — plus aucun lecteur ne filtre `e.retroactionFinale` (#529).
 *   R2 (#738, volet complétion) — la complétion ne compte JAMAIS un travail non remis, sous
 *      aucune pratique ; « non-recu » (le menu depuis février 2026) vaut l'ancien « non-remis ».
 *      UN prédicat : `evaluationNonRemise` (pratique-registre.js). La NOTE d'un non-remis garde
 *      la règle de sa famille (cadrage du 5 sept.) : hors de ce lot, mesurée ici sans être tranchée.
 *
 * Banc : le groupe-cours sommatif du banc d'audit du 5 sept. (quatre travaux 20/20/30/30, échelle
 * 0/40/65/75/100, grille Structure + Rigueur (multistructurels) + Nuance (relationnel)), deux élèves :
 *   · ASSIDU 2000001, le sujet — P1 60 (D,D,D), P2 70 (D,M,D) SANS commentaire final, P3 80 (M,M,M),
 *     et P4 selon la variante : brouillon ; « non-remis » à 0 ; « non-recu » à 0 ;
 *   · TÉMOIN 2000002 — quatre copies enregistrées à 70 : c'est lui qui met P4 au dénominateur de C.
 * À la main, pour les trois variantes : P1-P3 sont les trois copies lues partout → C = 3 / 4 = 75 ;
 * IPB : trois artefacts, score actuel P3 (0,75) ; Rigueur = (0,65 + 0,75 + 0,75) / 3 = 0,7167 (P2 compte :
 * sans elle, 0,70) ; performance des 3 derniers = (0,80 + 0,70 + 0,60) / 3 = 0,70 ; note du cours sans P4
 * = (60·20 + 70·20 + 80·30) / 70 = 71 ; RàI : 0,71 < 0,75 et 0,70 dans [0,64 ; 0,75[ avec un défi → niveau 2
 * « Difficulté émergente » ; l'échelle commune se résout (E0), sans raison.
 *
 * BREAK-TESTS (16 sept. 2026, journal dans RELAIS.md) : voir le rapport du lot.
 *
 *   cd tests && npx vitest run unit/sentinelle-lot-A-737-741-718-738-les-memes-copies-partout.test.js
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, clone, RACINE } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

const source = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const sansCommentaires = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\/\/[^\n'"]*$/gm, '');
const r3 = (x) => (typeof x === 'number' ? Math.round(x * 1000) / 1000 : x);

const DA = { ASSIDU: '2000001', TEMOIN: '2000002' };
const E0 = { id: 'E0', nom: 'IDME0 banc', seuilMaitrise: 'M', niveaux: [
    { code: '0', nom: 'Aucun', min: 0, max: 0, valeurCalcul: 0, couleur: '#999999' },
    { code: 'I', nom: 'Insuffisant', min: 1, max: 64, valeurCalcul: 40, couleur: '#aa0000' },
    { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75, couleur: '#00aa00' },
    { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100, couleur: '#0000aa' }
] };
const GRILLE = { id: 'G1', nom: 'Grille de dépistage banc', echelleId: 'E0', criteres: [
    { id: 'c1', nom: 'Structure', ponderation: 30, niveauSOLO: 'multistructurel' },
    { id: 'c2', nom: 'Rigueur', ponderation: 30, niveauSOLO: 'multistructurel' },
    { id: 'c3', nom: 'Nuance', ponderation: 40, niveauSOLO: 'relationnel' }
] };
const CRITERES = ['Structure', 'Rigueur', 'Nuance'];
const PRODUCTIONS = [
    { id: 'P1', titre: 'Analyse 1', type: 'travail', ponderation: 20, dateEcheance: '2026-02-01', echelleId: 'E0', grilleId: 'G1', coursId: 'GC1' },
    { id: 'P2', titre: 'Analyse 2', type: 'travail', ponderation: 20, dateEcheance: '2026-03-01', echelleId: 'E0', grilleId: 'G1', coursId: 'GC1' },
    { id: 'P3', titre: 'Dissertation', type: 'travail', ponderation: 30, dateEcheance: '2026-04-01', echelleId: 'E0', grilleId: 'G1', coursId: 'GC1' },
    { id: 'P4', titre: 'Examen', type: 'examen', ponderation: 30, dateEcheance: '2026-05-01', echelleId: 'E0', grilleId: 'G1', coursId: 'GC1' }
];
const DATE_EVAL = { P1: '2026-02-01T12:00:00.000Z', P2: '2026-03-01T12:00:00.000Z', P3: '2026-04-01T12:00:00.000Z', P4: '2026-05-01T12:00:00.000Z' };
const DATES = ['2026-01-12', '2026-01-19', '2026-01-26', '2026-02-02', '2026-02-09', '2026-02-16', '2026-02-23', '2026-03-02', '2026-03-09', '2026-03-16'];

function ev(id, da, prodId, note, niveau, codes, extra) {
    return Object.assign({
        id, etudiantDA: da, productionId: prodId, noteFinale: note, niveauFinal: niveau,
        echelleId: 'E0', grilleId: 'G1', ponderationCouverte: 100, verrouillee: true, coursId: 'GC1', groupe: '01',
        dateEvaluation: DATE_EVAL[prodId], retroactionFinale: 'Rétroaction de banc.',
        statutIntegrite: 'recevable', statutRemise: 'evalue',
        criteres: CRITERES.map((nom, i) => ({ critereId: 'c' + (i + 1), critereNom: nom, niveauSelectionne: codes[i], ponderation: GRILLE.criteres[i].ponderation }))
    }, extra || {});
}
/** Les trois copies enregistrées d'Assidu — P2 SANS commentaire final — et les quatre du témoin. */
function copiesDeBase() {
    return [
        ev('E1P1', DA.ASSIDU, 'P1', 60, 'I', ['D', 'D', 'D']),
        ev('E1P2', DA.ASSIDU, 'P2', 70, 'D', ['D', 'M', 'D'], { retroactionFinale: '' }),
        ev('E1P3', DA.ASSIDU, 'P3', 80, 'M', ['M', 'M', 'M']),
        ev('E2P1', DA.TEMOIN, 'P1', 70, 'D', ['D', 'D', 'M']),
        ev('E2P2', DA.TEMOIN, 'P2', 70, 'D', ['D', 'D', 'M']),
        ev('E2P3', DA.TEMOIN, 'P3', 70, 'D', ['D', 'D', 'M']),
        ev('E2P4', DA.TEMOIN, 'P4', 70, 'D', ['D', 'D', 'M'])
    ];
}
/** La quatrième copie d'Assidu, selon la variante. */
const P4 = {
    brouillon: () => ev('E1P4', DA.ASSIDU, 'P4', 90, 'E', ['E', 'M', 'E'], { verrouillee: false }),
    // Un « non remis » enregistré avec ses trois critères à « 0 » (la forme du banc B-4 de l'audit du 5 sept.).
    nonRemisNote0: (statut) => ev('E1P4', DA.ASSIDU, 'P4', 0, '0', ['0', '0', '0'], { statutRemise: statut }),
    // Un « Non reçu » tel que le formulaire l'écrit quand rien n'est noté : aucun critère, portée nulle.
    nonRecuSansCritere: () => ev('E1P4', DA.ASSIDU, 'P4', 0, '', [], { statutRemise: 'non-recu', criteres: [], ponderationCouverte: 0 })
};

const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/pratiques/pratique-configurable.js',
    'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js',
    'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js', 'js/pratiques/denotation-jugements.js',
    'js/portfolio.js', 'js/indices.js', { chemin: 'js/saisie-presences.js', internes: [] }, 'js/profil-etudiant-actions.js',
    'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/profil-etudiant-rapport.js',
    { chemin: 'js/profil-etudiant-sections-affichage.js', internes: ['genererSectionAccompagnement'] }, 'js/snapshots.js'];
const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', '__audit'];

/** Le banc : les modules RÉELS sur le bac partagé du Suivi, la pratique sommative résolue par le registre. */
function banc(quatrieme) {
    const store = storeBase();
    store.test_groupeEtudiants = store.test_groupeEtudiants.filter(e => e.da === DA.ASSIDU || e.da === DA.TEMOIN);
    store.test_groupesCours[0].pratiqueId = 'som-banc';
    store.test_pratiquesConfigurables = [{ id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' }, dansBibliotheque: true, configuration: { approcheEvaluation: 'sommative' } }];
    store.test_productions = clone(PRODUCTIONS);
    store.test_evaluationsSauvegardees = copiesDeBase().concat(quatrieme ? [quatrieme] : []);
    store.test_echellesTemplates = [clone(E0)];
    store.test_grillesTemplates = [clone(GRILLE)];
    store.test_presences = [];
    DATES.forEach(d => { store.test_presences.push({ da: DA.ASSIDU, date: d, periodesPresentes: 2, notes: '', coursId: 'GC1' }); store.test_presences.push({ da: DA.TEMOIN, date: d, periodesPresentes: 2, notes: '', coursId: 'GC1' }); });
    const seances = {}; DATES.forEach((d, i) => { seances[d] = [{ id: 'S-' + d, date: d, nombrePeriodes: 2, numeroSemaine: i + 1, jour: 'Lundi' }]; });
    store.test_seancesCompletes = seances;
    const calendrier = {}; DATES.forEach((d, i) => { calendrier[d] = { statut: 'cours', numeroSemaine: i + 1, jourSemaine: 'Lundi' }; });
    store.test_calendrierComplet = calendrier;

    // Les classes des familles, que le registre et helpers appellent par leur nom nu : renvoi vers la VRAIE, une fois chargée.
    let win = null;
    const classe = (nom) => function (config) { return new win[nom](config); };
    const b = monter(store, {
        modules: MODULES, objetsExportes: OBJETS_EXPORTES, aujourdhui: '2026-05-15', prefs: { grilleReferenceDepistage: 'G1' },
        globaux: {
            PratiqueConfigurable: classe('PratiqueConfigurable'), PratiqueSommative: classe('PratiqueSommative'), PratiquePANStandards: classe('PratiquePANStandards'),
            // Copie de productions.js:152 (sept lignes, pure), comme au banc d'audit du 5 sept.
            obtenirEcheanceEffective: (production, gcId) => {
                if (production.echeancesParGroupe && gcId) { const e = production.echeancesParGroupe[gcId]; if (e) return { date: e.date || null, assignee: e.assignee !== false }; }
                return { date: production.dateEcheance || null, assignee: true };
            },
            resoudreModeleParId: (type, id) => { const l = store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []; return clone(l.find(m => m && m.id === id) || null); },
            // La section « Accompagnement » (le « (sur N) ») lit les interventions (interventions.js, pas chargé) et les termes.
            obtenirInterventionsEtudiant: () => [], aDesInfosConfidentielles: () => false, obtenirTermeProduction: (c) => (c === 'pluriel' ? 'artefacts' : 'artefact'),
            accordTermeProduction: (m, n) => (m === 'evalue' ? (n > 1 ? 'évalués' : 'évalué') : m)
        }
    });
    win = b.win;
    // La chaîne complète, comme l'ouverture du Suivi la déclenche : A, puis C et P stockés par la pratique (indicesCP).
    // Sans le second, `calculerTousLesIndices` retombe sur `calculerTauxCompletion`, un repli qui n'est pas la pratique.
    win.calculerEtSauvegarderIndicesAssiduite();
    win.calculerEtStockerIndicesCP();
    return b;
}

/** Tout ce que les écrans lisent d'Assidu — et la complétion sous les TROIS familles plus les snapshots. */
function lecture(b, da = DA.ASSIDU) {
    const { win } = b;
    const indices = win.calculerTousLesIndices(da);
    const ipb = win.calculerIPB(da);
    const moy = win.calculerMoyennesCriteres(da);
    const n3 = win.calculerIndicesNDerniersArtefacts(da, true);
    const rai = win.determinerNiveauRaiPedagogique(da);
    const commune = win.obtenirEchelleCommuneDesEvaluations(da);
    const som = new win.PratiqueSommative();
    const configurable = win.obtenirPratiqueParId('som-banc');
    const std = new win.PratiquePANStandards();
    const hist = win.calculerIndicesHistoriques(da, '2026-05-15');
    return {
        P: indices.P, C: indices.C,
        cSom: r3(som.calculerCompletion(da)), cConfigurable: r3(configurable.calculerCompletion(da)), cStd: r3(std.calculerCompletion(da)), cSnapshot: hist.C,
        nbIPB: ipb ? ipb.historiqueComplet.length : null, scoreIPB: ipb ? r3(ipb.scoreActuel) : null,
        rigueur: moy ? r3(moy.rigueur) : null, structure: moy ? r3(moy.structure) : null,
        performance3: r3(n3.performance), nbArtefacts: n3.nbArtefacts,
        rai: { niveau: rai.niveau, pattern: rai.pattern },
        echelleCommune: commune.echelle ? commune.echelle.id : null, raisonCommune: commune.raison,
        defi: win.identifierDefiSpecifique(da)
    };
}

/** L'attendu des trois copies P1-P3, identique pour toutes les variantes. */
function attenduTroisCopies(l) {
    expect(l.P).toBe(71);
    expect([l.cSom, l.cConfigurable, l.cStd, l.cSnapshot, l.C]).toEqual([0.75, 0.75, 0.75, 75, 75]);
    expect(l.nbIPB).toBe(3);
    expect(l.scoreIPB).toBe(0.75);                                     // P3 : Structure M, Rigueur M
    expect(l.rigueur).toBe(r3((0.65 + 0.75 + 0.75) / 3));             // 0,717 — P2 (sans texte) est dedans ; sans elle : 0,70
    expect(l.structure).toBe(r3((0.65 + 0.65 + 0.75) / 3));
    expect([l.performance3, l.nbArtefacts]).toEqual([0.7, 3]);        // 80, 70, 60
    expect(l.rai).toEqual({ niveau: 2, pattern: 'Difficulté émergente' });
    expect([l.echelleCommune, l.raisonCommune]).toEqual(['E0', null]);
}

/* ============================================================ A · R1 — le brouillon ne compte nulle part */
describe('A · #737 — P4 en BROUILLON : note, complétion (SOM = configurable = STD = snapshots), IPB, moyennes, performance, RàI et échelle commune lisent P1-P3', () => {
    it('A1 · les trois mêmes copies partout ; C = 75 sous les trois familles et les snapshots', () => {
        const l = lecture(banc(P4.brouillon()));
        attenduTroisCopies(l);
    });
    it('A2 · TÉMOIN — la même P4 ENREGISTRÉE (verrouillée) compte partout : C 100, quatre artefacts, RàI niveau 1', () => {
        const l = lecture(banc(ev('E1P4', DA.ASSIDU, 'P4', 90, 'E', ['E', 'M', 'E'])));
        expect(l.P).toBe(77);
        expect([l.cSom, l.cConfigurable, l.cStd, l.cSnapshot, l.C]).toEqual([1, 1, 1, 100, 100]);
        expect([l.nbIPB, l.scoreIPB]).toEqual([4, 0.875]);
        expect([l.performance3, l.nbArtefacts]).toEqual([0.8, 3]);       // 90, 80, 70
        expect(l.rai.niveau).toBe(1);
    });
    it('A3 · la garde « une copie évaluée » du jugement de non-participation ne s\'ouvre pas sur un brouillon seul', () => {
        const b = banc(P4.brouillon());
        b.store.test_evaluationsSauvegardees = [P4.brouillon()];
        expect(b.win.depistagePeutJugerLaNonParticipation()).toEqual({ possible: false, raison: 'aucune-copie-evaluee' });
        b.store.test_evaluationsSauvegardees = [ev('E1P4', DA.ASSIDU, 'P4', 90, 'E', ['E', 'M', 'E'])];
        expect(b.win.depistagePeutJugerLaNonParticipation()).toEqual({ possible: true, raison: null });
    });
});

/* ===================================================== B · R1 — la copie sans commentaire final compte */
describe('B · #741, #718 — P2 SANS commentaire final compte dans le dépistage et situe la note globale', () => {
    it('B1 · retirer le texte des TROIS copies ne change rien : mêmes trois copies, même échelle commune', () => {
        const b = banc(P4.brouillon());
        b.store.test_evaluationsSauvegardees.forEach(e => { if (e.etudiantDA === DA.ASSIDU) e.retroactionFinale = ''; });
        attenduTroisCopies(lecture(b));
    });
    it('B2 · le défi spécifique lit P2 : avec un « I » en Nuance sur P2 (sans texte), Nuance tombe à 0,60 ; si P2 était ignorée, Structure et Nuance seraient à 0,70 et Structure sortirait', () => {
        const b = banc(P4.brouillon());
        b.store.test_evaluationsSauvegardees.find(e => e.id === 'E1P2').criteres[2].niveauSelectionne = 'I';
        expect(lecture(b).defi).toEqual({ defi: 'Nuance', score: expect.closeTo((0.65 + 0.40 + 0.75) / 3, 10) });
    });
});

/* ================================================ C · R2 — un non-remis n'est jamais une remise, sous aucune pratique */
describe('C · #738 — P4 « non-remis » ou « non-recu » enregistrée à 0 : la complétion ne la compte jamais, sous les trois familles ni dans les snapshots', () => {
    ['non-remis', 'non-recu'].forEach(statut => {
        it(`C1 · « ${statut} » avec ses critères à 0 (forme du banc B-4) : C = 75 partout ; la NOTE suit sa famille (SOM compte le 0 : 50), hors de ce lot`, () => {
            const l = lecture(banc(P4.nonRemisNote0(statut)));
            expect([l.cSom, l.cConfigurable, l.cStd, l.cSnapshot, l.C]).toEqual([0.75, 0.75, 0.75, 75, 75]);
            expect(l.P).toBe(50);   // (60·20 + 70·20 + 80·30 + 0·30) / 100 — la règle de la famille SOM, cadrage du 5 sept., NON tranchée ici
        });
    });
    it('C2 · « Non reçu » tel que le menu l\'écrit sans rien noter (aucun critère, portée nulle) : ne compte nulle part — les trois copies partout, C = 75, P = 71', () => {
        attenduTroisCopies(lecture(banc(P4.nonRecuSansCritere())));
    });
    // LOT 30 (17 sept. 2026) — tranché par Grégoire, chiffres du pack démo en main (DEMO004 : la copie « plagiat » comptait
    // comme remise, 90 % ; la carte la disait « non recevable ») : UNE COPIE NON RECEVABLE N'EST PAS UNE REMISE.
    ['plagiat', 'ia'].forEach(statut => {
        it(`C4 · lot 30 · P4 enregistrée à 0 et marquée « ${statut} » : C = 75 sous les trois familles et dans les snapshots (avant : 100)`, () => {
            const l = lecture(banc(ev('E1P4', DA.ASSIDU, 'P4', 0, '0', ['0', '0', '0'], { statutIntegrite: statut })));
            expect([l.cSom, l.cConfigurable, l.cStd, l.cSnapshot, l.C]).toEqual([0.75, 0.75, 0.75, 75, 75]);
        });
    });
    it('C5 · lot 30 · le témoin : la même copie « recevable » est une remise (C = 100) ; le prédicat ne lit que « plagiat » et « ia »', () => {
        const l = lecture(banc(ev('E1P4', DA.ASSIDU, 'P4', 0, '0', ['0', '0', '0'], { statutIntegrite: 'recevable' })));
        expect([l.cSom, l.cConfigurable, l.cStd, l.cSnapshot, l.C]).toEqual([1, 1, 1, 100, 100]);
        const b = banc(null);
        expect(['plagiat', 'ia', 'recevable', undefined, ''].map(x => b.win.evaluationNonRecevable({ statutIntegrite: x }))).toEqual([true, true, false, false, false]);
        expect(b.win.evaluationNonRecevable(null)).toBe(false);
    });
    it('C3 · les deux prédicats vivent dans le registre et disent R1 et R2', () => {
        const b = banc(null);
        const brouillon = P4.brouillon(), nonRecu = P4.nonRemisNote0('non-recu'), nonRemis = P4.nonRemisNote0('non-remis'), enregistree = ev('X', DA.ASSIDU, 'P4', 90, 'E', ['E', 'M', 'E'], { retroactionFinale: '' });
        expect([brouillon, nonRecu, nonRemis, enregistree].map(e => b.win.evaluationEntreDansLaNote(e))).toEqual([false, true, true, true]);
        expect([brouillon, nonRecu, nonRemis, enregistree].map(e => b.win.evaluationNonRemise(e))).toEqual([false, true, true, false]);
        expect(b.win.evaluationNonRemise({ statutRemise: 'evalue' })).toBe(false);
        expect(b.win.evaluationNonRemise(null)).toBe(false);
    });
});

/* ================= E · complément 1.142.20 — les cinq lecteurs que D3 ne jugeait que par le texte, et le rapport */
describe('E · complément 1.142.20 — dénominateur de C, rapport, « (sur N) » et directions se jugent par leur comportement', () => {
    const brouillonTemoin = () => ev('E2P4', DA.TEMOIN, 'P4', 70, 'D', ['D', 'D', 'M'], { verrouillee: false });
    /** P4 en brouillon pour les DEUX élèves : plus aucune copie qui compte ne touche P4. */
    function bancDeuxBrouillons() {
        const b = banc(P4.brouillon());
        const copies = b.store.test_evaluationsSauvegardees;
        copies.splice(copies.findIndex(e => e.id === 'E2P4'), 1, brouillonTemoin());
        b.win.calculerEtStockerIndicesCP();   // les indices stockés se recalculent sur le store modifié
        return b;
    }
    it('E1 · P4 en brouillon pour les deux élèves : P4 quitte le dénominateur — C = 3 / 3 sous SOM et la configurable, et le rapport écrit « 3 remises / 3 productions »', () => {
        const b = bancDeuxBrouillons();
        const l = lecture(b);
        expect([l.cSom, l.cConfigurable, l.C]).toEqual([1, 1, 100]);
        expect(b.win.genererRapportAPI(DA.ASSIDU)).toMatch(/Complétion : 100\u00A0% \(3 remises \/ 3 productions\)/);
    });
    it('E2 · TÉMOIN — la P4 du témoin enregistrée remet P4 au dénominateur : C = 3 / 4 et « 3 remises / 4 productions »', () => {
        const b = banc(P4.brouillon());
        expect(b.win.genererRapportAPI(DA.ASSIDU)).toMatch(/Complétion : 75\u00A0% \(3 remises \/ 4 productions\)/);
    });
    it('E3 · nbRemis du rapport : P4 « non-recu » notée 0 reste au dénominateur (elle compte) mais n\'est pas une remise — « 3 remises / 4 productions »', () => {
        const b = banc(P4.nonRemisNote0('non-recu'));
        expect(b.win.genererRapportAPI(DA.ASSIDU)).toMatch(/Complétion : 75\u00A0% \(3 remises \/ 4 productions\)/);
    });
    it('E4 · le « (sur N) » du profil : 3 artefacts avec P4 en brouillon, 4 quand elle est enregistrée', () => {
        const surN = (b) => (b.interne['profil-etudiant-sections-affichage.js'].genererSectionAccompagnement(DA.ASSIDU).match(/\(sur (\d+) artefacts?\)/) || [])[1];
        expect(surN(banc(P4.brouillon()))).toBe('3');
        expect(surN(banc(ev('E1P4', DA.ASSIDU, 'P4', 90, 'E', ['E', 'M', 'E'])))).toBe('4');
    });
    it('E5 · les directions par critère ne lisent pas P4 en brouillon : trois copies pour N = 3, « Données insuffisantes » ; enregistrée, quatre copies suffisent et une flèche apparaît', () => {
        const dir = (b) => Object.values(b.win.calculerDirectionsCriteres(DA.ASSIDU)).map(d => d.symbole);
        const avecBrouillon = dir(banc(P4.brouillon()));
        expect(avecBrouillon.length).toBe(3);
        expect(avecBrouillon.every(s => s === '')).toBe(true);
        expect(dir(banc(ev('E1P4', DA.ASSIDU, 'P4', 90, 'E', ['E', 'M', 'E']))).some(s => s !== '')).toBe(true);
    });
});

/* ============================================== D · le verrou structurel : un seul lecteur de chaque règle */
describe('D · un seul endroit pour chaque règle — aucun site ne recopie « non-remis », « non-recu » ni le filtre du commentaire', () => {
    const LECTEURS = ['js/profil-etudiant-calculs.js', 'js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-configurable.js',
        'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js', 'js/snapshots.js', 'js/profil-etudiant-rapport.js'];
    it('D1 · plus aucun filtre `e.retroactionFinale` dans les calculs du profil ni dans les familles (le lecteur dormant de STD, `_calculerMoyennesCriteresRecents`, excepté et nommé)', () => {
        const calculs = sansCommentaires(source('js/profil-etudiant-calculs.js'));
        expect((calculs.match(/\.retroactionFinale\b/g) || []).length).toBe(0);
        const std = sansCommentaires(source('js/pratiques/pratique-pan-standards.js'));
        const dormant = tranche(std, '    _calculerMoyennesCriteresRecents(da) {', '    _diagnostiquerForcesChallenges(moyennes) {');
        expect((std.match(/\.retroactionFinale\b/g) || []).length).toBe((dormant.match(/\.retroactionFinale\b/g) || []).length);
    });
    it('D2 · les chaînes « non-remis » et « non-recu » ne sont lues que par `evaluationNonRemise`, dans le registre', () => {
        for (const f of LECTEURS) {
            const src = sansCommentaires(source(f));
            expect((src.match(/'non-remis'|'non-recu'/g) || []).length, f).toBe(0);
        }
        const registre = sansCommentaires(source('js/pratiques/pratique-registre.js'));
        expect((registre.match(/'non-remis'/g) || []).length).toBe(1);
        expect((registre.match(/'non-recu'/g) || []).length).toBe(1);
        expect((registre.match(/^function evaluationNonRemise\(/gm) || []).length).toBe(1);
    });
    it('D3 · les complétions des trois familles et les deux lecteurs des snapshots passent par les DEUX prédicats (le troisième est parti avec le repli, #716) ; les directions et le « (sur N) » du profil par le premier', () => {
        // #871 (17 sept. 2026) : le compte vit dans `calculerDetailsCompletion` ; `calculerCompletion` n'est plus que le quotient.
        const corps = (f, debut, fin) => sansCommentaires(tranche(source(f), debut, fin));
        // Statut incomplet (25 oct. 2026) : la remise pour C a UN lecteur, `evaluationCompteCommeRemise` (registre),
        // qui lit les trois prédicats — les sites ne les recopient plus (un site qui en oubliait un rougissait ici).
        const regle = sansCommentaires(tranche(source('js/pratiques/pratique-registre.js'), 'function evaluationCompteCommeRemise(', 'function compterEvaluationsEcarteesDeLaNote('));
        expect(/evaluationEntreDansLaNote\(/.test(regle) && /!evaluationNonRemise\(/.test(regle) && /evaluationNonRecevable\(/.test(regle)).toBe(true);
        const deux = (s) => /window\.evaluationCompteCommeRemise\(e\)/.test(s);
        expect(deux(corps('js/pratiques/pratique-sommative.js', '    calculerDetailsCompletion(da) {', '    calculerCompletion(da) {'))).toBe(true);
        expect(deux(corps('js/pratiques/pratique-configurable.js', '    calculerDetailsCompletion(da) {', '    calculerCompletion(da) {'))).toBe(true);
        expect(deux(corps('js/pratiques/pratique-pan-standards.js', '    calculerDetailsCompletion(da) {', '    calculerCompletion(da) {'))).toBe(true);
        // Lot 30 : partout où la complétion lit « non remise », elle lit aussi « non recevable » — par la règle unique.
        ['js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-configurable.js', 'js/pratiques/pratique-pan-standards.js'].forEach(fichier =>
            expect([fichier, /evaluationNonRemise\(|evaluationNonRecevable\(/.test(corps(fichier, '    calculerDetailsCompletion(da) {', '    calculerCompletion(da) {'))]).toEqual([fichier, false]));
        const snapshots = sansCommentaires(source('js/snapshots.js'));
        expect((snapshots.match(/window\.evaluationCompteCommeRemise\(e\)/g) || []).length).toBe(2);
        // Lot N2 (#716, 22 sept. 2026) : le troisième lecteur — le filtre du repli du P historique — est parti avec
        // le repli. Le P historique est la note du cours : il lit les copies par les accesseurs de la pratique.
        expect((snapshots.match(/window\.evaluationNonRecevable\(e\)\) return false/g) || []).length).toBe(0);
        expect(/calculerNoteDuCours\(da, pratiqueP\)/.test(snapshots)).toBe(true);
        expect((sansCommentaires(source('js/pratiques/pratique-registre.js')).match(/'plagiat'/g) || []).length).toBe(1);
        expect((snapshots.match(/!window\.evaluationNonRemise\(|!window\.evaluationNonRecevable\(/g) || []).length).toBe(0);   // 25 oct. : par la règle unique
        expect((snapshots.match(/window\.evaluationNonRemise\(e\)\) return false/g) || []).length).toBe(0);
        const affichage = sansCommentaires(source('js/profil-etudiant-sections-affichage.js'));
        expect(/evaluationEntreDansLaNote\(e\)/.test(tranche(affichage, 'function calculerDirectionsCriteres(da) {', 'const resultatParDefaut'))).toBe(true);
        expect(/const evaluationsDA = [^\n]*evaluationEntreDansLaNote\(e\)/.test(affichage)).toBe(true);
        // Les lecteurs que ce banc n'exerce pas sous une pratique sommative : la performance des N derniers artefacts de STD
        // (vivante : detecterDefis / genererCarte) et le compte de remises du rapport du profil.
        expect(/evaluationEntreDansLaNote\(e\)/.test(corps('js/pratiques/pratique-pan-standards.js', '    _calculerIndicesTroisDerniersArtefacts(da) {', '        if (evaluationsEleve.length === 0) {'))).toBe(true);
        const rapport = sansCommentaires(source('js/profil-etudiant-rapport.js'));
        // #871, volet complétion (17 sept. 2026) : le rapport ne compte plus les remises lui-même — il lit le détail de la pratique
        // (réancré : la preuve portait sur son ancien compteur ; le compte réel est jugé par les trois complétions ci-dessus).
        expect(/obtenirDetailsCompletion\(da\)/.test(rapport) && !/evaluationNonRemise\(/.test(rapport)).toBe(true);
        expect(/const compteDansLaNote = \(e\) => window\.evaluationEntreDansLaNote\(e\);/.test(rapport)).toBe(true);   // 1.142.20 : sans copie de secours
    });
});
