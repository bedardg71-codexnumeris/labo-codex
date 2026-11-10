import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { monter, storeBase, clone } from './_helpers/bac-suivi.js';
import { predicatsTableauNotation } from './_helpers/predicats-copie.js';

// TABLEAU DE NOTATION, LOT 1 (9 nov. 2026) — plan : `plans de travail/PLAN-2026-11-09-tableau-de-notation.md`.
//
// UN RÉSULTAT SANS GRILLE (décisions de Grégoire du 9 nov.) : en standards, un NIVEAU de l'échelle (son code et sa
// valeur ponctuelle) ; en spécifications, ACCEPTABLE ou NON ACCEPTABLE, sans pourcentage ni seuil. La copie porte
// `sansGrille: true`, `grilleId: null`, `criteres: []`. Ce banc éprouve :
//   A · l'écriture pure (module `tableau-notation-donnees.js`) ;
//   B · les prédicats du registre (le jugement binaire compte en spécifications et pour C, jamais dans la règle commune) ;
//   C · le VRAI moteur, sur le magasin de base des bancs, qui n'a ni horaire, ni enseignant, ni dates de trimestre
//       (l'inféré du plan : « le calcul ne lit ni l'horaire, ni l'enseignant, ni les dates du trimestre ») ;
//   D · la Liste (statut « Évalué », « Acceptable ») ; E · l'écran (échappement, couleur filtrée, règle dite).
// Noms fictifs.

const registre = chargerScript('js/pratiques/pratique-registre.js', {}, {});
const ECHELLE = { id: 'E0', echelle_id: 'E0', niveaux: [
    { code: 'PS', nom: 'Préstructurel', valeurCalcul: 0, couleur: 'var(--gris-moyen)' },
    { code: 'I', nom: 'Incomplet', valeurCalcul: 40 },
    { code: 'D', nom: 'Développement', valeurCalcul: 65 },
    { code: 'X', nom: 'Sans valeur' },                     // ni valeur ni bornes : ne peut pas compter
    { code: 'M', nom: 'Maîtrise', valeurCalcul: 75 },
    { code: 'E', nom: 'Étendu', valeurCalcul: 100 }
] };
const valeurNumeriqueDuNiveau = (n) => (n && n.valeurCalcul != null && !isNaN(Number(n.valeurCalcul)) ? Number(n.valeurCalcul) : null);
const donnees = chargerScript('js/tableau-notation-donnees.js', {}, { valeurNumeriqueDuNiveau }).TableauNotationDonnees;
const ETUDIANT = { da: '2000001', nom: 'Fictive', prenom: 'Alice', groupe: '01' };
const contexte = (production = { id: 'A1', titre: 'Artefact 1' }) => ({
    etudiant: ETUDIANT, production, coursId: 'GC1', groupeCoursId: 'GC1', id: 'EVAL_NEUF', maintenant: new Date('2026-11-09T15:00:00.000Z')
});
const COPIE_GRILLE = { id: 'EV_G', etudiantDA: ETUDIANT.da, productionId: 'A1', grilleId: 'G1', noteFinale: 75, niveauFinal: 'M', verrouillee: true, criteres: [{ critereId: 'c', niveauSelectionne: 'M' }] };

/* ================================================================ A */
describe('A · l\'écriture d\'un résultat sans grille (pure)', () => {
    it('A1 les niveaux saisissables : l\'ordre de l\'échelle, le zéro compris (PS 0), le niveau sans valeur exclu', () => {
        expect(donnees.niveauxSaisissables(ECHELLE).map(n => [n.code, n.valeur])).toEqual([['PS', 0], ['I', 40], ['D', 65], ['M', 75], ['E', 100]]);
        expect(donnees.cycleDeLaFamille('STD', ECHELLE)).toEqual(['', 'PS', 'I', 'D', 'M', 'E']);
        expect(donnees.cycleDeLaFamille('SPE', null)).toEqual(['', 'A', 'N']);
    });
    it('A2 le toucher fait le tour, la case vide comprise ; le clavier vise une lettre unique ou vide', () => {
        const cycle = donnees.cycleDeLaFamille('STD', ECHELLE);
        expect(donnees.valeurSuivante(cycle, '')).toBe('PS');
        expect(donnees.valeurSuivante(cycle, 'E')).toBe('');
        // Relecture neuve (9 nov.) : un code que le cycle ne porte pas repart du premier niveau ; avant, la case se vidait.
        expect(donnees.valeurSuivante(cycle, 'inconnu')).toBe('PS');
        expect(donnees.valeurSuivante([''], 'inconnu')).toBe('');
        expect(donnees.valeurParTouche(cycle, 'm')).toBe('M');
        expect(donnees.valeurParTouche(cycle, 'p')).toBe('PS');
        expect(donnees.valeurParTouche(cycle, 'Backspace')).toBe('');
        expect(donnees.valeurParTouche(cycle, 'z')).toBeNull();
        expect(donnees.valeurParTouche(cycle, 'ArrowUp')).toBeNull();
        expect(donnees.valeurParTouche(['', 'MA', 'MI'], 'm')).toBeNull();   // deux candidates : la touche ne tranche pas
    });
    it('A3 standards : la copie neuve porte le niveau, sa valeur ponctuelle, aucune grille, et elle est verrouillée', () => {
        const stock = [COPIE_GRILLE];
        const r = donnees.appliquerSaisie(stock, { famille: 'STD', valeur: 'D', echelle: ECHELLE, contexte: contexte({ id: 'A2', titre: 'Artefact 2' }) });
        expect(r.action).toBe('cree');
        expect(stock).toHaveLength(1);   // l'entrée n'est jamais modifiée
        expect(r.evaluations).toHaveLength(2);
        expect(r.evaluation).toMatchObject({ id: 'EVAL_NEUF', etudiantDA: '2000001', productionId: 'A2', sansGrille: true, grilleId: null, criteres: [],
            niveauFinal: 'D', noteFinale: 65, echelleId: 'E0', verrouillee: true, statutRemise: 'evalue', statutIntegrite: 'recevable' });
        expect('ponderationCouverte' in r.evaluation).toBe(false);   // 0 la sortirait de la note (#706)
    });
    it('A4 standards : changer la valeur garde la copie ; vider la retire ; vider une case vide ne fait rien', () => {
        const cree = donnees.appliquerSaisie([], { famille: 'STD', valeur: 'PS', echelle: ECHELLE, contexte: contexte() });
        expect(cree.evaluation.noteFinale).toBe(0);
        const modif = donnees.appliquerSaisie(cree.evaluations, { famille: 'STD', valeur: 'E', echelle: ECHELLE, contexte: contexte() });
        expect(modif.action).toBe('modifie');
        expect(modif.evaluations).toHaveLength(1);
        expect(modif.evaluation).toMatchObject({ id: 'EVAL_NEUF', niveauFinal: 'E', noteFinale: 100 });
        const retire = donnees.appliquerSaisie(modif.evaluations, { famille: 'STD', valeur: '', echelle: ECHELLE, contexte: contexte() });
        expect([retire.action, retire.evaluations.length]).toEqual(['retire', 0]);
        expect(donnees.appliquerSaisie([], { famille: 'STD', valeur: '', echelle: ECHELLE, contexte: contexte() }).action).toBe('inchange');
    });
    it('A5 une copie évaluée AVEC une grille ne se touche pas, et une valeur hors du cycle est refusée', () => {
        const r = donnees.appliquerSaisie([COPIE_GRILLE], { famille: 'STD', valeur: 'E', echelle: ECHELLE, contexte: contexte() });
        expect([r.action, r.evaluations[0]]).toEqual(['refuse', COPIE_GRILLE]);
        expect(donnees.appliquerSaisie([COPIE_GRILLE], { famille: 'STD', valeur: '', echelle: ECHELLE, contexte: contexte() }).action).toBe('refuse');
        expect(donnees.appliquerSaisie([], { famille: 'STD', valeur: 'X', echelle: ECHELLE, contexte: contexte() }).action).toBe('refuse');
        expect(donnees.appliquerSaisie([], { famille: 'SPE', valeur: 'M', echelle: null, contexte: contexte() }).action).toBe('refuse');
    });
    it('A6 spécifications : acceptable ou non, et AUCUN chiffre (noteFinale null)', () => {
        const a = donnees.appliquerSaisie([], { famille: 'SPE', valeur: 'A', echelle: null, contexte: contexte() });
        expect(a.evaluation).toMatchObject({ sansGrille: true, acceptable: true, noteFinale: null, niveauFinal: '' });
        const n = donnees.appliquerSaisie(a.evaluations, { famille: 'SPE', valeur: 'N', echelle: null, contexte: contexte() });
        expect(n.evaluation).toMatchObject({ id: 'EVAL_NEUF', acceptable: false, noteFinale: null });
        expect(donnees.etatDeLaCase(n.evaluation, 'SPE', true)).toEqual({ valeur: 'N', forme: 'plein', modifiable: true, evaluationId: 'EVAL_NEUF' });
    });
    it('A7 la case montre la copie qui n\'est pas remplacée', () => {
        const orig = Object.assign({}, COPIE_GRILLE, { id: 'O', remplaceeParId: 'R' });
        const rep = Object.assign({}, COPIE_GRILLE, { id: 'R', niveauFinal: 'E' });
        expect(donnees.copieDeLaCase([orig, rep], ETUDIANT.da, 'A1').id).toBe('R');
        expect(donnees.etatDeLaCase(rep, 'STD', false)).toMatchObject({ valeur: 'E', forme: 'contour', modifiable: false, evaluationId: 'R' });
        expect(donnees.etatDeLaCase(null, 'STD', false)).toMatchObject({ valeur: '', forme: 'vide', modifiable: true });
    });
    it('A8 relecture neuve : une copie sans grille REMPLACÉE ne se touche pas ; une saisie repose le verrou ; sans valeur, la case est vide', () => {
        const remplacee = { id: 'SG', etudiantDA: ETUDIANT.da, productionId: 'A1', sansGrille: true, criteres: [], niveauFinal: 'M', noteFinale: 75, verrouillee: true, remplaceeParId: 'DISPARUE' };
        expect(donnees.etatDeLaCase(remplacee, 'STD', false).modifiable).toBe(false);
        expect(donnees.appliquerSaisie([remplacee], { famille: 'STD', valeur: 'E', echelle: ECHELLE, contexte: contexte() }).action).toBe('refuse');
        expect(donnees.appliquerSaisie([remplacee], { famille: 'STD', valeur: '', echelle: ECHELLE, contexte: contexte() }).action).toBe('refuse');
        const deverrouillee = Object.assign({}, remplacee, { remplaceeParId: undefined, verrouillee: false });
        expect(donnees.appliquerSaisie([deverrouillee], { famille: 'STD', valeur: 'E', echelle: ECHELLE, contexte: contexte() }).evaluation.verrouillee).toBe(true);
        // Une copie de standards sous une pratique devenue « spécifications » : pas de jugement binaire, la case est vide.
        expect(donnees.etatDeLaCase(Object.assign({}, deverrouillee, { verrouillee: true }), 'SPE', true).forme).toBe('vide');
    });
    // Décision de Grégoire (9 nov. 2026, 15 h 38) : « Annuler » défait le dernier geste, quel qu'il soit.
    it('A9 annuler : un niveau changé revient, une case vidée retrouve son résultat, une case remplie redevient vide', () => {
        const saisir = (stock, valeur) => donnees.appliquerSaisie(stock, { famille: 'STD', valeur, echelle: ECHELLE, contexte: contexte() });
        const geste = (avant, r) => ({ da: ETUDIANT.da, productionId: 'A1', avant: avant ? clone(avant) : null, apresId: r.action === 'retire' ? null : r.evaluation.id });
        // Créer puis annuler : la case redevient vide.
        const cree = saisir([], 'M');
        expect(donnees.defaireSaisie(cree.evaluations, geste(null, cree))).toEqual({ evaluations: [], action: 'defait' });
        // Changer M → E puis annuler : M, sa valeur et son verrou reviennent.
        const change = saisir(cree.evaluations, 'E');
        const revenu = donnees.defaireSaisie(change.evaluations, geste(cree.evaluation, change));
        expect(revenu.action).toBe('defait');
        expect(revenu.evaluations).toHaveLength(1);
        expect(revenu.evaluations[0]).toMatchObject({ id: 'EVAL_NEUF', niveauFinal: 'M', noteFinale: 75, verrouillee: true, sansGrille: true });
        // Vider (le toucher de trop) puis annuler : le résultat est rendu, le même.
        const vide = saisir(cree.evaluations, '');
        expect(vide.evaluations).toHaveLength(0);
        const rendu = donnees.defaireSaisie(vide.evaluations, geste(cree.evaluation, vide));
        expect(rendu.evaluations).toEqual([cree.evaluation]);
    });
    it('A10 annuler ne touche jamais une évaluation à grille, et renonce si la case a changé depuis le geste', () => {
        const saisir = (stock, valeur) => donnees.appliquerSaisie(stock, { famille: 'STD', valeur, echelle: ECHELLE, contexte: contexte() });
        const cree = saisir([], 'M');
        const g = { da: ETUDIANT.da, productionId: 'A1', avant: null, apresId: cree.evaluation.id };
        // Entre-temps, une évaluation à grille est venue pour le même couple : rien ne se défait.
        const avecGrille = cree.evaluations.concat([COPIE_GRILLE]);
        expect(donnees.defaireSaisie(avecGrille, g)).toEqual({ evaluations: avecGrille, action: 'refuse' });
        // La copie du geste n'est plus là, ou c'est une évaluation à grille qui porte cet id : refus.
        expect(donnees.defaireSaisie([], g).action).toBe('refuse');
        expect(donnees.defaireSaisie([Object.assign({}, COPIE_GRILLE, { id: cree.evaluation.id })], g).action).toBe('refuse');
        // Un geste qui avait vidé la case ne remet rien si la case n'est plus vide ; et jamais une évaluation à grille.
        expect(donnees.defaireSaisie([COPIE_GRILLE], { da: ETUDIANT.da, productionId: 'A1', avant: cree.evaluation, apresId: null }).action).toBe('refuse');
        expect(donnees.defaireSaisie([], { da: ETUDIANT.da, productionId: 'A1', avant: COPIE_GRILLE, apresId: null }).action).toBe('refuse');
        expect(donnees.defaireSaisie([], null).action).toBe('refuse');
    });
});

/* ================================================================ B */
describe('B · les prédicats du registre', () => {
    const binaire = (extra) => Object.assign({ id: 'B', etudiantDA: '2000001', productionId: 'D1', sansGrille: true, acceptable: true, noteFinale: null, verrouillee: true, criteres: [] }, extra);
    it('B1 le jugement binaire compte en spécifications, jamais dans la règle commune (qui exige une note)', () => {
        expect(registre.resultatAcceptableSansGrille(binaire())).toBe(true);
        expect(registre.resultatAcceptableSansGrille(binaire({ acceptable: false }))).toBe(false);
        expect(registre.resultatAcceptableSansGrille(binaire({ sansGrille: false }))).toBeNull();
        expect(registre.evaluationEntreDansLaNote(binaire())).toBe(false);
        expect(registre.evaluationCompteEnSpecifications(binaire())).toBe(true);
        expect(registre.evaluationCompteEnSpecifications(binaire({ acceptable: false }))).toBe(true);
    });
    it('B2 mêmes exclusions que la règle commune : brouillon, « Incomplet », portée 0, remplacé', () => {
        expect(registre.evaluationCompteEnSpecifications(binaire({ verrouillee: false }))).toBe(false);
        expect(registre.evaluationCompteEnSpecifications(binaire({ travailEnCours: true }))).toBe(false);
        expect(registre.evaluationCompteEnSpecifications(binaire({ ponderationCouverte: 0 }))).toBe(false);
        expect(registre.evaluationCompteEnSpecifications(binaire({ remplaceeParId: 'INTROUVABLE' }), [])).toBe(false);
    });
    it('B3 pour l\'indice C, un jugement (même non acceptable) est une remise ; une non-remise ne l\'est pas', () => {
        expect(registre.evaluationCompteCommeRemise(binaire({ acceptable: false }))).toBe(true);
        expect(registre.evaluationCompteCommeRemise(binaire({ statutRemise: 'non-recu' }))).toBe(false);
    });
    it('B4 « la copie porte une évaluation » : des critères, ou un résultat sans grille ; pas un jeton seul', () => {
        expect(registre.copiePorteUneEvaluation(COPIE_GRILLE)).toBe(true);
        expect(registre.copiePorteUneEvaluation({ sansGrille: true, criteres: [], niveauFinal: 'M', noteFinale: 75 })).toBe(true);
        expect(registre.copiePorteUneEvaluation(binaire({ acceptable: false }))).toBe(true);
        expect(registre.copiePorteUneEvaluation({ criteres: [], jetonDelaiApplique: true })).toBe(false);
        expect(registre.copiePorteUneEvaluation({ sansGrille: true, criteres: [] })).toBe(false);
        expect(registre.libelleJugementSansGrille(binaire())).toBe('Acceptable');
        expect(registre.libelleJugementSansGrille(binaire({ acceptable: false }))).toBe('Non acceptable');
        expect(registre.libelleJugementSansGrille(COPIE_GRILLE)).toBeNull();
    });
});

/* ================================================================ C */
const DA = { ALICE: '2000001', BRUNO: '2000002' };
const E0 = { id: 'E0', nom: 'IDME banc', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40 }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75 }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100 }] };
const VALEUR = { I: 40, D: 65, M: 75, E: 100 };
const sansGrille = (da, prodId, code, extra) => Object.assign({ id: 'SG-' + da + '-' + prodId, etudiantDA: da, productionId: prodId, sansGrille: true, grilleId: null, grilleNom: '',
    criteres: [], niveauFinal: code, noteFinale: VALEUR[code], echelleId: 'E0', verrouillee: true, coursId: 'GC1', groupe: '01', statutRemise: 'evalue', statutIntegrite: 'recevable',
    dateEvaluation: '2026-10-20T12:00:00.000Z' }, extra || {});
const avecGrille = (da, prodId, code) => Object.assign(sansGrille(da, prodId, code), { id: 'AG-' + da + '-' + prodId, sansGrille: undefined, grilleId: 'G1', grilleNom: 'Grille banc',
    ponderationCouverte: 100, criteres: [{ critereId: 'c1', critereNom: 'Critère', niveauSelectionne: code, ponderation: 100 }] });
const binaire = (da, prodId, acceptable, extra) => Object.assign(sansGrille(da, prodId, 'M'), { id: 'SB-' + da + '-' + prodId, niveauFinal: '', noteFinale: null, echelleId: null, acceptable }, extra || {});

function prodSTD() {
    const l = [{ id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 60, coursId: 'GC1' }];
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].forEach((id, i) => l.push({ id, titre: 'Artefact ' + (i + 1), type: 'artefact-portfolio', numero: i + 1, ponderation: 0, coursId: 'GC1' }));
    l.push({ id: 'T1', titre: 'Analyse finale', type: 'terminale', numero: 7, ponderation: 40, coursId: 'GC1' });
    return l;
}
const std = () => ({ id: 'std-banc', nom: 'STD banc', type: 'standards', calcul_note: { methode: 'conversion_niveaux' }, dansBibliotheque: true,
    configuration: { approcheEvaluation: 'par-artefacts', echelleId: 'E0', grilleId: null, notesFinales: false,
        portfolio: { utiliser: true, nombreTotal: 6, nombreARetenir: 3, methodeSelection: 'meilleurs', minimumCompletion: 3 } } });
const PROD_SPE = [{ id: 'D1', titre: 'Dissertation 1', type: 'dissertation', dateEcheance: '2026-10-01', coursId: 'GC1' },
    { id: 'X1', titre: 'Examen 1', type: 'examen', dateEcheance: '2026-10-15', coursId: 'GC1' }];
const spe = () => ({ id: 'spe-banc', nom: 'SPE banc', type: 'specifications', calcul_note: { methode: 'specifications' }, dansBibliotheque: true,
    configuration: { type: 'specifications', seuilAcceptable: 70, typesTravaux: [{ id: 'dissertation', nom: 'Dissertation' }, { id: 'examen', nom: 'Examen' }],
        forfaits: [{ lettre: 'A', note: 100, travaux: { dissertation: 1, examen: 1 } }, { lettre: 'F', note: 50, travaux: {} }] } });

const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/entites/production-diagnostique.js', 'js/pratiques/pratique-configurable.js',
    'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js',
    'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js', { chemin: 'js/saisie-presences.js', internes: [] },
    'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/snapshots.js', 'js/export-resultats-finaux.js'];
const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', '__audit', 'ProductionDiagnostique', '_exportResultats'];

function banc({ pratique, productions, evaluations }) {
    const store = storeBase();
    store.test_groupeEtudiants = store.test_groupeEtudiants.filter(e => e.da === DA.ALICE || e.da === DA.BRUNO);
    store.test_groupesCours[0].pratiqueId = pratique.id;
    store.test_pratiquesConfigurables = [clone(pratique)];
    store.test_echellesTemplates = [clone(E0)];
    store.test_productions = clone(productions);
    store.test_evaluationsSauvegardees = clone(evaluations);
    let win = null;
    const classe = (nom) => function (config) { return new win[nom](config); };
    const b = monter(store, {
        modules: MODULES, objetsExportes: OBJETS_EXPORTES, aujourdhui: '2026-11-09', journal: [],
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
function lire(b, da) {
    const sim = b.win.simulerIndices(da, b.pratiqueId);
    const entree = b.store.test_indicesCP[da] && b.store.test_indicesCP[da].actuel;
    return { P: sim && sim.noteConstructible ? sim.P : null, stockP: entree && entree.noteConstructible !== false ? entree.P : null, C: entree ? entree.C : null, sim };
}

describe('C · le vrai moteur, sur un magasin sans horaire, sans enseignant, sans dates de trimestre', () => {
    const NIVEAUX_ALICE = { A1: 'E', A2: 'M', A3: 'D', A4: 'I', A5: 'M', A6: 'E', T1: 'M' };
    it('C0 TÉMOIN DE L\'INFÉRÉ : le magasin des bancs ne porte ni horaire, ni enseignant, ni dates de trimestre', () => {
        const s = storeBase();
        const texte = JSON.stringify(s);
        expect(texte).not.toMatch(/horaire|enseignant|dateDebut|dateFin|seances|calendrier/i);
    });
    it('C1 standards : des niveaux saisis sans grille font la note, comme la grille la ferait (3 meilleures 100, 100, 75 → 91,67 × 60 % + 75 × 40 % = 85)', () => {
        const sans = banc({ pratique: std(), productions: prodSTD(), evaluations: Object.entries(NIVEAUX_ALICE).map(([p, c]) => sansGrille(DA.ALICE, p, c)) });
        const avec = banc({ pratique: std(), productions: prodSTD(), evaluations: Object.entries(NIVEAUX_ALICE).map(([p, c]) => avecGrille(DA.ALICE, p, c)) });
        const a = lire(sans, DA.ALICE);
        expect(a.P).toBe(85);
        expect(a.stockP).toBe(85);
        expect(lire(avec, DA.ALICE).P).toBe(a.P);   // parité avec la grille
        expect(a.sim.details.portfolio.artefactsRetenus.map(r => r.productionId).sort()).toEqual(['A1', 'A2', 'A6']);
    });
    it('C2 spécifications : « acceptable » sans seuil, « non acceptable » ne compte pas ; forfait A 100 ou palier F 50', () => {
        const b = banc({ pratique: spe(), productions: PROD_SPE, evaluations: [
            binaire(DA.ALICE, 'D1', true), binaire(DA.ALICE, 'X1', true),
            binaire(DA.BRUNO, 'D1', true), binaire(DA.BRUNO, 'X1', false)] });
        expect(lire(b, DA.ALICE).P).toBe(100);
        expect(lire(b, DA.BRUNO).P).toBe(50);
        expect(lire(b, DA.ALICE).stockP).toBe(100);
    });
    // ⚠ Le dénominateur de C (pratique configurable) ne comptait que les productions à copie CHIFFRÉE : un jugement sans
    // grille le laissait vide, C nul pour tous (mesuré en écrivant ce banc, corrigé dans pratique-configurable.js).
    it('C3 spécifications : le jugement non acceptable est une REMISE pour C (2 sur 2), un brouillon ne compte nulle part', () => {
        const b = banc({ pratique: spe(), productions: PROD_SPE, evaluations: [
            binaire(DA.BRUNO, 'D1', true), binaire(DA.BRUNO, 'X1', false),
            binaire(DA.ALICE, 'D1', true), binaire(DA.ALICE, 'X1', true, { verrouillee: false })] });
        expect(lire(b, DA.BRUNO).C).toBe(100);
        expect(lire(b, DA.ALICE).C).toBe(50);
        expect(lire(b, DA.ALICE).P).toBe(50);   // le brouillon « acceptable » ne fait pas le forfait A
    });
    it('C4 TÉMOIN : une copie chiffrée garde son seuil (80 ≥ 70 acceptable, 60 non)', () => {
        const chiffree = (da, p, n) => Object.assign(avecGrille(da, p, 'M'), { noteFinale: n });
        const b = banc({ pratique: spe(), productions: PROD_SPE, evaluations: [
            chiffree(DA.ALICE, 'D1', 80), chiffree(DA.ALICE, 'X1', 80), chiffree(DA.BRUNO, 'D1', 80), chiffree(DA.BRUNO, 'X1', 60)] });
        expect([lire(b, DA.ALICE).P, lire(b, DA.BRUNO).P]).toEqual([100, 50]);
    });
    // Consigne du lot (9 nov. 2026, reçue après la première passe) : « les deux calculs avec des résultats directs seuls,
    // puis MÊLÉS à des évaluations à grille ».
    it('C5 standards, mêlés : trois résultats sans grille et quatre copies avec grille font la même note (85), la terminale saisie au tableau comprise', () => {
        const auTableau = ['A1', 'A6', 'T1'];
        const b = banc({ pratique: std(), productions: prodSTD(), evaluations: Object.entries(NIVEAUX_ALICE)
            .map(([p, c]) => (auTableau.includes(p) ? sansGrille(DA.ALICE, p, c) : avecGrille(DA.ALICE, p, c))) });
        expect(lire(b, DA.ALICE).P).toBe(85);
        // Sans la terminale, la note est celle des productions retenues seules (91,67 → 92), et elle reste provisoire.
        const sansTerminale = banc({ pratique: std(), productions: prodSTD(), evaluations: Object.entries(NIVEAUX_ALICE)
            .filter(([p]) => p !== 'T1').map(([p, c]) => sansGrille(DA.ALICE, p, c)) });
        expect(lire(sansTerminale, DA.ALICE).P).toBe(92);
        expect(lire(sansTerminale, DA.ALICE).sim.details.estProvisoire).toBe(true);
    });
    it('C6 spécifications, mêlés : un jugement sans grille et une copie chiffrée (son seuil) comptent ensemble', () => {
        const chiffree = (da, p, n) => Object.assign(avecGrille(da, p, 'M'), { noteFinale: n });
        const b = banc({ pratique: spe(), productions: PROD_SPE, evaluations: [
            binaire(DA.ALICE, 'D1', true), chiffree(DA.ALICE, 'X1', 80),
            binaire(DA.BRUNO, 'D1', true), chiffree(DA.BRUNO, 'X1', 60)] });
        expect([lire(b, DA.ALICE).P, lire(b, DA.BRUNO).P]).toEqual([100, 50]);
    });
    // Précision 3 de Cowork (9 nov., 15 h) : une case dont l'originale est remplacée par une reprise affiche la reprise.
    it('C7 la reprise : la case montre la reprise ; la note la lit dès qu\'elle est verrouillée, et l\'originale d\'ici là (E4)', () => {
        const prods = prodSTD();
        const base = Object.entries(NIVEAUX_ALICE).filter(([p]) => p !== 'A4').map(([p, c]) => avecGrille(DA.ALICE, p, c));
        const originale = Object.assign(avecGrille(DA.ALICE, 'A4', 'I'), { id: 'O-A4', remplaceeParId: 'R-A4', dateEvaluation: '2026-11-05T12:00:00.000Z' });   // plus récente que la reprise : « remplacée » décide, pas la date
        const reprise = (verrouillee) => Object.assign(avecGrille(DA.ALICE, 'A4', 'E'), { id: 'R-A4', repriseDeId: 'O-A4', jetonRepriseApplique: true, verrouillee,
            dateEvaluation: '2026-11-01T12:00:00.000Z' });
        const reevaluee = banc({ pratique: std(), productions: prods, evaluations: base.concat([originale, reprise(true)]) });
        const copie = donnees.copieDeLaCase(reevaluee.store.test_evaluationsSauvegardees, DA.ALICE, 'A4');
        expect(copie.id).toBe('R-A4');
        expect(donnees.etatDeLaCase(copie, 'STD', true)).toMatchObject({ valeur: 'E', modifiable: false, evaluationId: 'R-A4' });
        // 3 meilleures : E, E, E (A1, A6, et A4 par sa reprise) → 100 × 60 % + 75 × 40 % = 90.
        expect(lire(reevaluee, DA.ALICE).P).toBe(90);
        expect(lire(reevaluee, DA.ALICE).sim.details.portfolio.artefactsRetenus.map(r => r.productionId)).toContain('A4');
        // La reprise pas encore réévaluée : la case montre toujours la reprise (non modifiable), la note lit l'originale (I) : 85.
        const enAttente = banc({ pratique: std(), productions: prods, evaluations: base.concat([originale, reprise(false)]) });
        expect(donnees.copieDeLaCase(enAttente.store.test_evaluationsSauvegardees, DA.ALICE, 'A4').id).toBe('R-A4');
        expect(lire(enAttente, DA.ALICE).P).toBe(85);
    });
    // Piège de la consigne : « une échelle modifiée après coup ». MESURE : la note écrite à la saisie ne suit pas l'échelle,
    // comme celle de toute évaluation enregistrée ; rien n'est réécrit (tarir n'est pas réparer).
    it('C8 MESURE : l\'échelle modifiée après la saisie ne change pas un résultat déjà saisi (M reste 75, même si M vaut maintenant 80)', () => {
        const b = banc({ pratique: std(), productions: prodSTD(), evaluations: ['A1', 'A2', 'A3'].map(p => sansGrille(DA.ALICE, p, 'M')) });
        expect(lire(b, DA.ALICE).P).toBe(75);
        b.store.test_echellesTemplates[0].niveaux.find(n => n.code === 'M').valeurCalcul = 80;
        b.win.calculerEtStockerIndicesCP();
        expect(lire(b, DA.ALICE).P).toBe(75);
        expect(b.store.test_evaluationsSauvegardees.every(e => e.noteFinale === 75)).toBe(true);
    });
});

/* ================================================================ D */
describe('D · la Liste des évaluations', () => {
    const PRODS = [{ id: 'P1', titre: 'Production fictive', type: 'travail' }];
    const ELEVE = { da: '2000001', nom: 'Fictive', prenom: 'Alice', groupe: '01' };
    const liste = () => chargerScript('js/liste-evaluations.js', {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k, echapperHtml: (t) => String(t == null ? '' : t), obtenirLibelleStatut: (s) => s, obtenirDonneesSelonMode: () => [],
        libelleCopieNonRecevable: registre.libelleCopieNonRecevable,
        ProductionDiagnostique: { estDiagnostique: () => false, marqueHTML: () => '' },
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} }
    }, predicatsTableauNotation(registre));
    const ligne = (ev) => liste()._construireLignesEvaluations([ev], PRODS, [ELEVE])[0];
    it('D1 un niveau saisi sans grille est « évalué » et montre son niveau (avant : « Non reçu », sans critère)', () => {
        const l = ligne({ id: 'S1', etudiantDA: '2000001', productionId: 'P1', sansGrille: true, criteres: [], niveauFinal: 'M', noteFinale: 75, verrouillee: true });
        expect(l.evaluationNotee).toBe(true);
        expect(l.niveauFinal).toBe('M');
    });
    it('D2 un jugement sans grille dit « Acceptable » ou « Non acceptable » dans la colonne du niveau', () => {
        const base = { id: 'S2', etudiantDA: '2000001', productionId: 'P1', sansGrille: true, criteres: [], niveauFinal: '', noteFinale: null, verrouillee: true };
        expect(ligne(Object.assign({ acceptable: true }, base)).niveauFinal).toBe('Acceptable');
        expect(ligne(Object.assign({ acceptable: false }, base)).niveauFinal).toBe('Non acceptable');
    });
    it('D3 TÉMOIN : un jeton seul (aucun critère, pas un résultat sans grille) n\'est toujours pas évalué', () => {
        expect(ligne({ id: 'S3', etudiantDA: '2000001', productionId: 'P1', criteres: [], jetonDelaiApplique: true }).evaluationNotee).toBe(false);
    });
});

/* ================================================================ E */
describe('E · l\'écran (sécurité et règle dite)', () => {
    const ecran = chargerScript('js/tableau-notation.js', { db: { getSync: (k, d) => (d !== undefined ? d : null) }, echapperHtml: (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') },
        { TableauNotationDonnees: donnees }).TableauNotation;
    it('E1 une couleur d\'échelle n\'entre dans `style` que si elle en est une', () => {
        expect(ecran.couleurSure('#a02030')).toBe('#a02030');
        expect(ecran.couleurSure('var(--niveau-attention-nul)')).toBe('var(--niveau-attention-nul)');
        expect(ecran.couleurSure('rgba(10, 20, 30, 0.5)')).toBe('rgba(10, 20, 30, 0.5)');
        expect(ecran.couleurSure('red; background:url(https://exemple.invalid/x)')).toBe('var(--accent-primaire)');
        expect(ecran.couleurSure('"><img src=x>')).toBe('var(--accent-primaire)');
    });
    it('E2 un nom d\'élève, un titre et un nom de pratique sont échappés', () => {
        const ctx = { etat: 'ok', famille: 'STD', pratiqueId: 'p', pratiqueNom: '<b>Pratique</b>', config: { portfolio: { nombreARetenir: 3, methodeSelection: 'recents' } },
            echelle: ECHELLE, cycle: donnees.cycleDeLaFamille('STD', ECHELLE), etudiants: [{ da: '2000001', prenom: '<img src=x onerror=alert(1)>', nom: 'Fictive' }],
            productions: [{ id: 'P1', titre: '<script>x</script>' }], evaluations: [], terminalId: null };
        const html = ecran.construireHTML(ctx);
        expect(html).not.toMatch(/<img src=x|<script>x|<b>Pratique/);
        expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });
    it('E3 la règle des standards se dit avec les réglages de la pratique (mots validés par Grégoire, 9 nov. 2026)', () => {
        expect(ecran.phraseRegleStd({ portfolio: { nombreARetenir: 3, methodeSelection: 'recents' } }, false)).toBe('La note retient les 3 productions les plus récentes.');
        expect(ecran.phraseRegleStd({ portfolio: { nombreARetenir: 4, methodeSelection: 'meilleurs' } }, true)).toBe('La note retient les 4 meilleures productions, et la terminale.');
        expect(ecran.phraseRegleStd({ categories: { actif: true }, portfolio: {} }, false)).toBe('La note retient les catégories de ta pratique.');
    });
});

/* ================================================================ F */
// LES MOTS DE L'ÉCRAN, VALIDÉS PAR GRÉGOIRE MOT POUR MOT (9 nov. 2026, 15 h 38 à 15 h 40, relayés par Cowork). Ce bloc les
// exige : une phrase retouchée ici sans son accord rougit. Seule l'infobulle de l'échelle modifiée reste proposée.
describe('F · les mots validés', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const lire = (f) => fs.readFileSync(path.resolve(__dirname, '..', '..', f), 'utf8');
    const echapper = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const MAC = { platform: 'MacIntel', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/26.0 Safari/605.1.15' };
    const IPAD = { platform: 'iPad', userAgent: 'Mozilla/5.0 (iPad; CPU OS 26_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1' };
    const WINDOWS = { platform: 'Win32', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36' };
    const LINUX = { platform: 'Linux x86_64', userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36' };
    const ecranSur = (navigator) => chargerScript('js/tableau-notation.js', { db: { getSync: (k, d) => (d !== undefined ? d : null) }, echapperHtml: echapper, navigator },
        { TableauNotationDonnees: donnees }).TableauNotation;
    const ecran = ecranSur(MAC);
    const ctxStd = (extra) => Object.assign({ etat: 'ok', famille: 'STD', pratiqueId: 'p', pratiqueNom: 'Pratique fictive', config: { portfolio: { nombreARetenir: 4, methodeSelection: 'meilleurs' } },
        echelle: ECHELLE, etudiants: [{ da: '2000001', prenom: 'Alice', nom: 'Fictive' }], productions: [{ id: 'P1', titre: 'Production fictive' }], evaluations: [], terminalId: 'T1' }, extra || {});
    it('F1 le tableau en standards : intro, avertissement, règle, colonne de la note, légende et ⌘Z', () => {
        const html = ecran.construireHTML(ctxStd());
        for (const mot of [
            'Tableau de notation',
            'Saisis le résultat de chaque production, qu’elle ait été évaluée ici ou ailleurs. La note de chaque étudiant·e se construit dans la dernière colonne, selon les réglages de ta pratique.',
            'Un résultat saisi ici compte dans la note, mais il n’a pas de critères : il ne donne ni forces, ni défis, ni rétroaction par critère.',
            'La note retient les 4 meilleures productions, et la terminale.',
            'Note provisoire', 'Étudiant·e', 'en attente de résultats', '>Annuler<',
            'Plein : compte dans la note', 'Contour : évaluée, non retenue', 'Pointillé : à saisir', 'Point : évaluée avec une grille',
            'Touche une case pour changer le niveau. Au clavier : la lettre du niveau, Retour arrière pour vider, les flèches pour se déplacer. ⌘Z annule le dernier geste.'
        ]) expect(html, mot).toContain(mot);
        expect(html).not.toContain('puis la terminale');
        // 9 nov., 17 h 38 (Grégoire) : « Aucune production n'est encore évaluée. » à la SOURCE, pour tous les écrans ; le tableau
        // n'a plus de remplacement à lui : il écrit la cause que le calcul lui rend, telle quelle.
        expect(registre.causeNoteStdSansProductionNotee(true, false)).toBe('Aucune production n\'est encore évaluée.');
        expect(registre.causeNoteStdSansProductionNotee(false, false)).toBe('Aucune production retenue pour la note n\'est encore évaluée.');   // la jumelle ne bouge pas
        expect(registre.causeNoteStdSansProductionNotee(true, true)).toBe('Seule l\'évaluation terminale a une note. En standards, la note du cours s\'appuie aussi sur les artefacts du portfolio : elle ne se calcule pas sur la terminale seule.');
        expect(lire('js/pratiques/pratique-registre.js')).not.toContain("'Aucun artefact du portfolio n");
        const sim = (cause) => () => ({ noteConstructible: false, P: 0, causeNonConstructible: cause, details: null });
        const avecCause = (cause) => chargerScript('js/tableau-notation.js', { db: { getSync: (k, d) => (d !== undefined ? d : null) }, simulerIndices: sim(cause), echapperHtml: echapper, navigator: MAC },
            { TableauNotationDonnees: donnees }).TableauNotation.construireHTML(ctxStd());
        for (const cause of [registre.causeNoteStdSansProductionNotee(true, false), registre.causeNoteStdSansProductionNotee(false, false)]) {
            expect(avecCause(cause)).toContain('<span class="tn-note-detail">' + echapper(cause) + '</span>');
        }
        expect(lire('js/tableau-notation.js')).not.toMatch(/aucuneEvaluee|_causeAuTableau/);   // une seule source
        const finalisee = ecran.construireHTML(ctxStd({ config: { notesFinales: true, portfolio: { nombreARetenir: 4, methodeSelection: 'meilleurs' } } }));
        expect(finalisee).toContain('>Note finale<');
        expect(finalisee).not.toContain('Note provisoire');
    });
    it('F2 les états sans tableau, la légende des spécifications, la bascule et l\'avis du formulaire', () => {
        expect(ecran.construireHTML({ etat: 'autre-famille' })).toContain('Le tableau de notation sert aux pratiques par standards et par spécifications. Pour la pratique de ce groupe-cours, la Liste reste la vue de tes évaluations.');
        expect(ecran.construireHTML({ etat: 'aucune-pratique' })).toContain('Ce groupe-cours n’a pas de pratique de notation. Choisis-en une dans Conception › Pratiques : le tableau suivra ses réglages.');
        const source = lire('js/tableau-notation.js');
        expect(source).toContain("aideSpe: 'Touche une case pour changer le résultat. Au clavier : A ou N, Retour arrière pour vider, les flèches pour se déplacer.',");
        expect(source).toContain('annulerAuClavier: (raccourci) => `${raccourci} annule le dernier geste.`');
        // Le refus d'une reprise sur un résultat sans grille (validé le 9 nov., 16 h 20).
        expect(lire('js/evaluation-jetons.js')).toContain("notifications.info('Résultat saisi sans grille', 'Cette production a été évaluée au tableau de notation : c\\'est là que tu changes son résultat, sans reprise.')");
        expect(source).toContain("legendeSpe: ['✓ Acceptable', '✗ Non acceptable', 'Pointillé : à saisir', 'Point : évaluée avec une grille']");
        const index = lire('index.html');
        expect(index).toMatch(/id="tn-vue-liste"[^>]*>Liste<\/button>/);
        expect(index).toMatch(/id="tn-vue-tableau"[^>]*>Tableau de notation<\/button>/);
        const formulaire = lire('js/evaluation.js');
        expect(formulaire).toContain("notifications.info('Résultat saisi sans grille',");
        expect(formulaire).toContain("'Cette production a été évaluée au tableau de notation (Évaluation › Liste). C\\'est là que tu changes son résultat.'");
        expect(registre.LIBELLES_JUGEMENT_SANS_GRILLE).toEqual({ acceptable: 'Acceptable', nonAcceptable: 'Non acceptable' });
    });
    // Décision de Cowork (9 nov., 16 h 21) : la légende affiche le raccourci du poste.
    it('F4 la légende dit ⌘Z sur Mac et iPad, Ctrl+Z ailleurs ; jamais ⌘Z sur un poste qui n\'est pas d\'Apple', () => {
        const fin = (raccourci) => `les flèches pour se déplacer. ${raccourci} annule le dernier geste.`;
        for (const poste of [MAC, IPAD]) {
            const html = ecranSur(poste).construireHTML(ctxStd());
            expect(html).toContain(fin('⌘Z'));
            expect(html).not.toContain('Ctrl+Z');
        }
        for (const poste of [WINDOWS, LINUX, {}, undefined]) {
            const html = ecranSur(poste).construireHTML(ctxStd());
            expect(html).toContain(fin('Ctrl+Z'));
            expect(html).not.toContain('⌘');
        }
    });
    // Validée par Grégoire avec son ajout (9 nov., 16 h 20) : l'infobulle et le lecteur d'écran disent la même phrase.
    it('F5 l\'échelle modifiée : l\'infobulle et le libellé lu portent la phrase validée, avec la valeur écrite', () => {
        const phrase = 'L’échelle a changé depuis la saisie : ce résultat compte encore pour 75. Ressaisis le niveau pour prendre la valeur d’aujourd’hui.';
        const E80 = { id: 'E0', nom: 'IDME', niveaux: ECHELLE.niveaux.map(n => (n.code === 'M' ? Object.assign({}, n, { valeurCalcul: 80 }) : n)) };
        const html = chargerScript('js/tableau-notation.js', { db: { getSync: (k, d) => (d !== undefined ? d : null) }, echapperHtml: echapper, navigator: MAC,
            obtenirEchelleResolue: (id) => (id === 'E0' ? E80 : null) }, { TableauNotationDonnees: donnees }).TableauNotation
            .construireHTML(ctxStd({ evaluations: [{ id: 'SG', etudiantDA: '2000001', productionId: 'P1', sansGrille: true, criteres: [], niveauFinal: 'M', noteFinale: 75, echelleId: 'E0', verrouillee: true }] }));
        expect(html).toContain(`title="${phrase}"`);
        expect(html).toContain(`Maîtrise. ${phrase}"`);
        expect(html).toContain('tn-case--valeur-changee');
    });
    // Validée par Grégoire, mot pour mot (9 nov., 17 h 48) : au doigt sur l'iPad, l'infobulle ne se lit pas.
    it('F6 la légende nomme le signe « ≠ » quand une case le porte, et seulement alors', () => {
        const ligne = '≠ : l’échelle a changé depuis la saisie. Ressaisis le niveau pour prendre la valeur d’aujourd’hui.';
        const E80 = { id: 'E0', nom: 'IDME', niveaux: ECHELLE.niveaux.map(n => (n.code === 'M' ? Object.assign({}, n, { valeurCalcul: 80 }) : n)) };
        const rendre = (echelle, evaluations) => chargerScript('js/tableau-notation.js', { db: { getSync: (k, d) => (d !== undefined ? d : null) }, echapperHtml: echapper, navigator: IPAD,
            obtenirEchelleResolue: (id) => (id === 'E0' ? echelle : null) }, { TableauNotationDonnees: donnees }).TableauNotation.construireHTML(ctxStd({ evaluations }));
        const saisie = [{ id: 'SG', etudiantDA: '2000001', productionId: 'P1', sansGrille: true, criteres: [], niveauFinal: 'M', noteFinale: 75, echelleId: 'E0', verrouillee: true }];
        const marquee = rendre(E80, saisie);
        expect(marquee).toContain('tn-case--valeur-changee');
        expect(marquee).toContain('<span class="tn-legende-signe">' + ligne + '</span>');
        // La même saisie sous l'échelle d'origine, puis un tableau vide : aucune case marquée, aucune ligne.
        for (const sans of [rendre({ id: 'E0', nom: 'IDME', niveaux: ECHELLE.niveaux }, saisie), rendre(E80, [])]) {
            expect(sans).not.toContain('tn-case--valeur-changee');
            expect(sans).not.toContain('tn-legende-signe');
            expect(sans).not.toContain('≠');
        }
    });
    it('F3 plus aucun mot du tableau n\'est marqué « PROPOSÉ »', () => {
        const marques = (f) => (lire(f).match(/PROPOS[ÉE]+S?/g) || []).length;
        expect(marques('js/tableau-notation.js')).toBe(0);
        expect(lire('js/evaluation-jetons.js')).not.toMatch(/tableau[^\n]*PROPOS/);
        expect(marques('js/tableau-notation-donnees.js')).toBe(0);
        expect(marques('css/tableau-notation.css')).toBe(0);
    });
});
