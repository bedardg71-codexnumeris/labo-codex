/**
 * AUDIT DU MOTEUR DE LA PRATIQUE DE NOTATION — banc d'exécution des mesures (5 septembre 2026)
 *
 * Rapport : Rapports/AUDIT-pratique-de-notation-2026-09-05.md. Cadré par
 * Rapports/prompts-audit/PROMPT-AUDIT-pratique-de-notation-2026-09-05.md. Second audit :
 * il repart du flux H du premier (Rapports/AUDIT-moteur-evaluation-2026-09-05.md) sans le remesurer.
 *
 * Ce fichier ne juge pas et ne corrige rien : il charge les modules RÉELS de js/ dans le bac à
 * sable (patron du banc du premier audit et des sentinelles #395, #307, #542) et appelle leurs
 * fonctions publiques telles quelles. Chaque `it` porte une mesure du rapport (A1, B2…). Le nombre
 * ATTENDU est calculé À LA MAIN dans le commentaire qui précède la mesure, AVANT le code ; les
 * `expect` sont les valeurs OBTENUES au 5 septembre 2026 (HEAD 93b744b4, 1.121.0) — si l'un rougit,
 * le comportement mesuré a changé et le constat est à remesurer.
 *
 * Quatre élèves de banc, un par famille : SOM 1000001 · STD 1000002 · SPE 1000003 · DEN 1000004.
 * Chacun porte : une évaluation normale verrouillée, une reprise (`remplaceeParId` + `repriseDeId`),
 * un brouillon « 0 » à portée incomplète (`noteFinale 0`, `ponderationCouverte 50`, non verrouillé —
 * la forme que #674 écrit depuis le 2 septembre), une évaluation dont un critère est analytique en
 * points, et une évaluation verrouillée.
 *
 * Miroirs (pas le code réel) : `obtenirDonneesSelonMode` (lecture du store sans filtre coursId),
 * `sauvegarderDonneesSelonMode`, `resoudreModeleParId` (lookup par id dans le trimestre `test`).
 * Tout le reste est le code de js/. Aucune donnée réelle lue ni écrite. Rien dans js/.
 *
 *   cd tests && npx vitest run unit/audit-pratique-de-notation-2026-09-05.test.js
 *
 * ↻ LE MÊME JOUR, en soirée — Grégoire a arbitré : D-3 (#708), F-1 (#709) et C-1 (#706, règle
 * arrêtée : un brouillon n'entre pas dans la note) sont livrés. Les mesures touchées portent
 * désormais les valeurs D'APRÈS, et la valeur d'avant en commentaire ; les sentinelles #706, #708,
 * #709 tiennent le comportement corrigé. Les autres mesures sont inchangées : inscrites.
 */
import { describe, it, expect, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
/**
 * Même chargement que chargerScript, mais une fonction INTERNE de l'IIFE est exposée sous
 * `window.__audit` (injection AVANT le `})();` final). Sert à appeler genererSectionPerformance,
 * le panneau « Développement des habiletés » du profil, que seuls des rendus DOM atteignent.
 */
function chargerAvecInterne(chemin, globaux, win, noms) {
    let code = readFileSync(path.join(RACINE, chemin), 'utf8');
    const fin = code.lastIndexOf('})();');
    const expo = '\n;window.__audit = Object.assign(window.__audit || {}, {' + noms.map(n => n + ': ' + n).join(', ') + '});\n';
    code = code.slice(0, fin) + expo + code.slice(fin);
    const { document: doc, ...autres } = globaux;
    const storage = () => ({ _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } });
    const nomsG = ['window', 'document', 'console', 'localStorage', 'sessionStorage', ...Object.keys(autres)];
    const vals = [win, doc, console, storage(), storage(), ...Object.values(autres)];
    new Function(...nomsG, '"use strict";\n' + code)(...vals);
    return win;
}

const MESURES = {};
function noter(cle, valeur) { MESURES[cle] = valeur; return valeur; }
afterAll(() => { console.log('AUDIT-PN-MESURES ' + JSON.stringify(MESURES, null, 1)); });

const clone = (x) => JSON.parse(JSON.stringify(x));
const r2 = (x) => (typeof x === 'number' ? Math.round(x * 100) / 100 : x);

const DA = { SOM: '1000001', STD: '1000002', SPE: '1000003', DEN: '1000004' };
const ETUDIANTS = [
    { da: DA.SOM, nom: 'Sommative', prenom: 'Alice', groupe: '01', coursId: 'GC1' },
    { da: DA.STD, nom: 'Standards', prenom: 'Bruno', groupe: '01', coursId: 'GC1' },
    { da: DA.SPE, nom: 'Specifications', prenom: 'Chloé', groupe: '01', coursId: 'GC1' },
    { da: DA.DEN, nom: 'Denotation', prenom: 'Dani', groupe: '01', coursId: 'GC1' }
];

// Échelle à bornes ENTIÈRES, la forme des quatre échelles par défaut (echelles.js) : les trous
// 54,x · 74,x · 89,x existent. Valeurs ponctuelles de la sentinelle #674 (I 40 · D 65 · M 82 · E 95).
const E1 = { id: 'E1', nom: 'IDME banc', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40, couleur: '#a00' },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65, couleur: '#a80' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82, couleur: '#0a0' },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95, couleur: '#00a' }
] };
const GRILLE = { id: 'G1', nom: 'Grille banc', criteres: [{ id: 'c1', nom: 'Contenu', ponderation: 100 }] };

function ev(id, da, productionId, noteFinale, niveauFinal, extra) {
    return Object.assign({
        id, etudiantDA: da, productionId, noteFinale, niveauFinal,
        echelleId: 'E1', grilleId: 'G1', ponderationCouverte: 100, verrouillee: true,
        dateEvaluation: '2026-02-01T12:00:00.000Z', retroactionFinale: 'Rétroaction de banc.',
        statutIntegrite: 'recevable', statutRemise: 'remis',
        criteres: [{ critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: niveauFinal, ponderation: 100 }]
    }, extra || {});
}
// Un critère analytique en points (lot 2 du 4 sept.) : `points` + niveau déduit, `pointsAnalytiques`.
const ANALYTIQUE = {
    criteres: [{ critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'D', ponderation: 100, type: 'analytique', points: 21, pointsMax: 30 }],
    pointsAnalytiques: { c1: 21 }
};
// Le brouillon « 0 » à portée incomplète que #674 écrit : niveau 0 sur la moitié de la grille, non verrouillé.
const BROUILLON0 = { noteFinale: 0, niveauFinal: '0', ponderationCouverte: 50, verrouillee: false,
    criteres: [{ critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: '0', ponderation: 50 }] };
// Le brouillon « 95 sur 50 % » (l'autre forme de #674, celle que H-1 du premier audit a mesurée à 80 %).
const BROUILLON95 = { noteFinale: 95, niveauFinal: 'E', ponderationCouverte: 50, verrouillee: false };

/* ---------------------------------------------------------------------------------------------
   Les quatre jeux — configurations dans la forme que l'assistant écrit (`type` + `calcul_note` à
   la racine, `configuration.*`), sauf mention.
   --------------------------------------------------------------------------------------------- */
function jeuSOM() {
    return {
        pratiqueId: 'som-banc',
        pratiques: [{ id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' }, dansBibliotheque: true,
            configuration: { approcheEvaluation: 'sommative' } }],
        productions: [
            { id: 'P1', titre: 'Dissertation', type: 'travail', ponderation: 40, dateEcheance: '2026-02-01' },
            { id: 'P2', titre: 'Examen', type: 'examen', ponderation: 60, dateEcheance: '2026-03-01' },
            { id: 'P3', titre: 'Exercice (pondération 0)', type: 'travail', ponderation: 0, dateEcheance: '2026-02-15' },
            { id: 'P4', titre: 'Quiz (sans pondération)', type: 'quiz', dateEcheance: '2026-02-20' }
        ],
        evaluations: [
            ev('EV_S1', DA.SOM, 'P1', 84, 'M'),
            ev('EV_S2_OLD', DA.SOM, 'P2', 50, 'I', { remplaceeParId: 'EV_S2_NEW', archivee: true, dateArchivage: '2026-03-05', dateEvaluation: '2026-03-01T12:00:00.000Z' }),
            ev('EV_S2_NEW', DA.SOM, 'P2', 90, 'E', { repriseDeId: 'EV_S2_OLD', jetonRepriseApplique: true, dateEvaluation: '2026-03-10T12:00:00.000Z' }),
            ev('EV_S3', DA.SOM, 'P3', 70, 'D', ANALYTIQUE),
            ev('EV_S4', DA.SOM, 'P4', 0, '0', BROUILLON0)
        ]
    };
}
function jeuSTD(opts = {}) {
    const N = opts.nombreARetenir || 4;
    const productions = [
        { id: 'TERM', titre: 'Analyse finale', type: 'terminale', ponderation: 40, numero: 7, dateEcheance: '2026-05-01' }
    ];
    // Le conteneur porte ses `regles` comme le formulaire Productions les écrit — volontairement DIFFÉRENTES
    // de la pratique (3 ici, 4 dans la pratique) pour voir laquelle des deux le profil lit.
    if (!opts.sansConteneur) productions.unshift({ id: 'PORT', titre: 'Portfolio', type: 'portfolio', ponderation: 60, regles: { nombreARetenir: 3, minimumCompletion: 1, nombreTotal: 6 } });
    if (opts.sansTerminale) productions.splice(productions.findIndex(p => p.id === 'TERM'), 1);
    for (let i = 1; i <= 6; i++) productions.push({ id: 'A' + i, titre: 'Artefact ' + i, type: 'artefact-portfolio', numero: i, ponderation: 0, dateEcheance: '2026-0' + (1 + Math.floor(i / 3)) + '-1' + i });
    const evaluations = [
        ev('EV_A1', DA.STD, 'A1', 85, 'M'),
        ev('EV_A2', DA.STD, 'A2', 60, 'D'),
        ev('EV_A3', DA.STD, 'A3', 78, 'M'),
        ev('EV_A4_OLD', DA.STD, 'A4', 90, 'E', { remplaceeParId: 'EV_A4_NEW', archivee: true }),
        ev('EV_A4_NEW', DA.STD, 'A4', 70, 'D', { repriseDeId: 'EV_A4_OLD', jetonRepriseApplique: true }),
        ev('EV_A5', DA.STD, 'A5', 78, 'M', ANALYTIQUE),
        ev('EV_A6', DA.STD, 'A6', 0, '0', opts.brouillon95 ? BROUILLON95 : BROUILLON0)
    ];
    if (!opts.sansTerminale && !opts.terminaleNonEvaluee) evaluations.push(ev('EV_TERM', DA.STD, 'TERM', 82, 'M'));
    return {
        pratiqueId: 'std-banc',
        pratiques: [{ id: 'std-banc', nom: 'STD banc', type: 'standards', calcul_note: { methode: 'conversion_niveaux' }, dansBibliotheque: true,
            configuration: { type: 'standards', approcheEvaluation: 'par-artefacts', echelleId: opts.echelleId === undefined ? 'E1' : opts.echelleId, grilleId: 'G1',
                portfolio: { utiliser: true, nombreARetenir: N, minimumCompletion: 1, methodeSelection: opts.methodeSelection || 'meilleurs', reglesConformite: { actif: false } },
                notesFinales: false } }],
        productions, evaluations
    };
}
const TYPES_SPE = [
    { id: 'dissertation', nom: 'Dissertation', seuilAcceptable: 70 },
    { id: 'examen', nom: 'Examen', seuilAcceptable: 70 },
    { id: 'dossier', nom: 'Dossier', seuilAcceptable: 70 }
];
const BUNDLES_SPE = [
    { noteFixe: 100, label: 'A', requis: { dissertation: 2, examen: 2, dossier: 1 } },
    { noteFixe: 80, label: 'B', requis: { dissertation: 2, examen: 1, dossier: 1 } },
    { noteFixe: 70, label: 'C+', requis: { dissertation: 1, examen: 1, dossier: 1 } },
    { noteFixe: 60, label: 'C', requis: { dissertation: 1, examen: 1 } },
    { noteFixe: 50, label: 'F', requis: null }
];
function jeuSPE(opts = {}) {
    const productions = [
        { id: 'D1', titre: 'Dissertation 1', type: 'dissertation', dateEcheance: '2026-02-01' },
        { id: 'D2', titre: 'Dissertation 2', type: 'dissertation', dateEcheance: '2026-03-01' },
        { id: 'X1', titre: 'Examen 1', type: 'examen', dateEcheance: '2026-02-15' },
        { id: 'X2', titre: 'Examen 2', type: 'examen', dateEcheance: '2026-04-15' },
        { id: 'F1', titre: 'Dossier', type: 'dossier', dateEcheance: '2026-04-01' }
    ];
    const evaluations = [
        ev('EV_D1', DA.SPE, 'D1', 80, 'M'),
        ev('EV_D2_OLD', DA.SPE, 'D2', 75, 'M', { remplaceeParId: 'EV_D2_NEW', archivee: true }),
        ev('EV_D2_NEW', DA.SPE, 'D2', opts.repriseD2 === undefined ? 65 : opts.repriseD2, 'D', { repriseDeId: 'EV_D2_OLD', jetonRepriseApplique: true }),
        ev('EV_X1', DA.SPE, 'X1', 90, 'E'),
        ev('EV_X2', DA.SPE, 'X2', 0, '0', opts.brouillon95 ? BROUILLON95 : BROUILLON0),
        ev('EV_F1', DA.SPE, 'F1', 72, 'D', ANALYTIQUE)
    ];
    if (opts.sansDossier) evaluations.splice(evaluations.findIndex(e => e.id === 'EV_F1'), 1);
    return {
        pratiqueId: 'spe-banc',
        pratiques: [{ id: 'spe-banc', nom: 'SPE banc', type: 'specifications', calcul_note: { methode: 'specifications' }, dansBibliotheque: true,
            configuration: { type: 'specifications', typesTravaux: clone(TYPES_SPE), tableBundles: clone(BUNDLES_SPE) } }],
        productions, evaluations: opts.sansEvaluations ? [] : evaluations
    };
}
// La forme que l'assistant, le gabarit « Modèle simple » et l'éditeur de gabarit ÉCRIVENT pour une SPE
// (pratiques-bibliotheque.js:60-80, pratiques-gestion.js:1855-2035, wizard-pratique-v2.js:2749-2770).
function pratiqueSPEGabarit() {
    return { id: 'spe-gabarit', nom: 'SPE (forme gabarit)', type: 'specifications', calcul_note: { methode: 'specifications' }, dansBibliotheque: true,
        configuration: { seuilAcceptable: 70,
            typesTravaux: [{ id: 1, nom: 'Dissertation', description: '' }, { id: 2, nom: 'Examen', description: '' }],
            forfaits: [{ id: 1, lettre: 'A', note: 100, travaux: { 1: 2, 2: 1 } }, { id: 2, lettre: 'C', note: 60, travaux: { 1: 1, 2: 1 } }] } };
}
function jeuDEN(opts = {}) {
    const cibles = opts.ciblesConfig || [{ id: 'cible-1', nom: 'Lire' }, { id: 'cible-2', nom: 'Écrire' }];
    const saisie = opts.sansSaisie ? {} : { 'den-banc': { [DA.DEN]: {
        ciblesAtteintes: opts.ciblesAtteintes || { 'cible-1': true, 'cible-2': true },
        noteFinale: 78, justification: 'Jugement de banc', date: '2026-05-01' } } };
    return {
        pratiqueId: 'den-banc',
        pratiques: [{ id: 'den-banc', nom: 'DEN banc', type: 'denotation', calcul_note: { methode: 'jugement_global' }, dansBibliotheque: true,
            configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: cibles, suggestion: { methode: 'mode' }, echelleId: null, grilleId: null } }],
        productions: [
            { id: 'W1', titre: 'Travail 1', type: 'travail', dateEcheance: '2026-02-01' },
            { id: 'W2', titre: 'Travail 2', type: 'travail', dateEcheance: '2026-03-01' },
            { id: 'W3', titre: 'Travail 3', type: 'travail', dateEcheance: '2026-04-01' }
        ],
        evaluations: opts.sansEvaluations ? [] : [
            ev('EV_W1', DA.DEN, 'W1', 85, 'M', ANALYTIQUE),
            ev('EV_W2_OLD', DA.DEN, 'W2', 50, 'I', { remplaceeParId: 'EV_W2_NEW', archivee: true }),
            ev('EV_W2_NEW', DA.DEN, 'W2', 90, 'E', { repriseDeId: 'EV_W2_OLD', jetonRepriseApplique: true }),
            ev('EV_W3', DA.DEN, 'W3', 0, '0', BROUILLON0)
        ],
        jugements: saisie
    };
}

/* ---------------------------------------------------------------------------------------------
   Le bac à sable
   --------------------------------------------------------------------------------------------- */
const MODULES = ['js/pratiques/pratique-configurable.js', 'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js',
    'js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js', 'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js',
    'js/profil-etudiant-helpers.js', 'js/export-resultats-finaux.js', 'js/profil-etudiant-rapport.js', 'js/profil-etudiant-diagnostics.js',
    'js/profil-etudiant-confidentiel.js', 'js/profil-etudiant-sections-affichage.js', 'js/evaluation-jetons.js'];
const EXPORTS_WINDOW = (() => {
    const noms = new Set();
    for (const f of MODULES) for (const m of readFileSync(path.join(RACINE, f), 'utf8').matchAll(/^\s*window\.([A-Za-z_$][\w$]*)\s*=/gm)) noms.add(m[1]);
    return [...noms];
})();
function classList() { const s = new Set(); return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle() { return false; } }; }
function elementDom(init) {
    return Object.assign({ innerHTML: '', textContent: '', value: '', style: {}, classList: classList(), setAttribute() {}, getAttribute() { return null; },
        appendChild() {}, addEventListener() {}, removeEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; } }, init || {});
}

function monter(jeu, opts = {}) {
    const store = Object.assign({
        groupeCoursActif: { id: 'GC1', trimestreId: 'test', nom: 'Groupe 1' },
        test_groupesCours: [{ id: 'GC1', trimestreId: 'test', pratiqueId: (opts.pratiqueId === undefined ? jeu.pratiqueId : opts.pratiqueId) }],
        test_pratiquesConfigurables: clone(jeu.pratiques).concat(clone(opts.pratiquesEnPlus || [])),
        test_productions: clone(jeu.productions),
        test_evaluationsSauvegardees: clone(jeu.evaluations),
        test_echellesTemplates: clone(opts.echelles || [E1]),
        test_grillesTemplates: [clone(GRILLE)],
        test_groupeEtudiants: clone(ETUDIANTS),
        test_jugementsDenotation: clone(jeu.jugements || {}),
        test_modalitesEvaluation: {},
        test_portfoliosEleves: {},
        infoCours: { id: 'GC1', nom: 'Cours banc', groupe: '01' }
    }, opts.store || {});
    if (opts.retirerPratiqueId) delete store.test_groupesCours[0].pratiqueId;

    const ecritures = [], notifs = [], confirmations = [];
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); ecritures.push(k); },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); ecritures.push(k); },
        modifier: async () => {}
    };
    const cle = (k) => 'test_' + k;
    const OBJETS = ['indicesCP', 'indicesAssiduite', 'indicesAssiduiteDetailles', 'jugementsDenotation', 'portfoliosEleves', 'modalitesEvaluation'];
    const obtenirDonneesSelonMode = (k) => {
        const kb = k.startsWith('test_') ? k.slice(5) : k;
        if (('test_' + kb) in store) return clone(store['test_' + kb]);
        return OBJETS.includes(kb) ? {} : [];
    };
    const sauvegarderDonneesSelonMode = (k, v) => {
        if (opts.refuserEcriture) return false;
        store['test_' + k] = clone(v); ecritures.push('test_' + k); return true;
    };
    const elements = { portfolioEleveDetail: elementDom() };
    const document = {
        getElementById: (id) => elements[id] || null, querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom(), readyState: 'complete'
    };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', dateLocaleYMD: () => '2026-09-05' };
    const fwd = (nom) => (...a) => win[nom](...a);
    const fichiers = [];
    const travauxStockage = opts.avecFichiers ? {
        obtenirFichiersTravaux: () => clone(store.test_fichiersTravaux || []),
        deplacerEnCorbeille: (id) => { fichiers.push({ id, geste: 'corbeille' }); },
        mettreAJourFichier: (id, patch) => { fichiers.push({ id, geste: 'delier', patch }); }
    } : undefined;

    const globaux = {
        document, db, cle, obtenirDonneesSelonMode, sauvegarderDonneesSelonMode,
        echapperHtml: (s) => String(s == null ? '' : s),
        estEtudiantExclu: (e) => !!(e && e.exclu),
        obtenirPreference: () => null, obtenirSeuil: (n) => ({ 'defiSpecifique': 0.70, 'idme.insuffisant': 0.64, 'idme.developpement': 0.75 })[n],
        chargerSeuilsInterpretation: () => ({}), filtrerEtudiantsParMode: (a) => a, estModeeLectureSeule: () => false,
        obtenirEtudiantsCoursActif: () => clone(store.test_groupeEtudiants), genererSeancesCompletes() {},
        afficherNotificationCopiee() {}, afficherSection() {}, afficherSousSection() {}, calculerEtSauvegarderIndicesAssiduite() {},
        notifications: { succes(t, m) { notifs.push({ type: 'succes', t, m }); }, erreur(t, m) { notifs.push({ type: 'erreur', t, m }); }, info() {}, warning() {} },
        confirm: () => { confirmations.push(1); return true; }, genererIdUnique: (p) => p + 'NEUF' + confirmations.length,
        travauxStockage,
        resoudreModeleParId: (type, id) => { const l = store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []; return clone(l.find(m => m && m.id === id) || null); },
        // Aiguillages vers les exports réels, résolus à l'appel (les scripts se référencent par nom nu).
        obtenirPratiqueActiveGroupeCours: fwd('obtenirPratiqueActiveGroupeCours'), lirePointeurPratiqueGroupeCours: fwd('lirePointeurPratiqueGroupeCours'),
        obtenirPratiqueParId: fwd('obtenirPratiqueParId'), obtenirTypePratiqueActive: fwd('obtenirTypePratiqueActive'), normaliserIdPratique: fwd('normaliserIdPratique'),
        obtenirConfigPratiqueActive: fwd('obtenirConfigPratiqueActive'), obtenirConfigCategories: fwd('obtenirConfigCategories'),
        calculerDetailsNoteFinale: fwd('calculerDetailsNoteFinale'), calculerEtStockerIndicesCP: fwd('calculerEtStockerIndicesCP'), simulerIndices: fwd('simulerIndices'),
        obtenirIndicesCP: fwd('obtenirIndicesCP'), calculerTousLesIndices: fwd('calculerTousLesIndices'),
        obtenirEchelleResolue: fwd('obtenirEchelleResolue'), obtenirTableConversionNiveaux: fwd('obtenirTableConversionNiveaux'),
        obtenirEchelleCommuneDesEvaluations: fwd('obtenirEchelleCommuneDesEvaluations'),
        situerPourcentageDansEchelle: fwd('situerPourcentageDansEchelle'), interpreterNiveauAtteint: fwd('interpreterNiveauAtteint'), lireNiveauNoteGlobale: fwd('lireNiveauNoteGlobale'),
        // Le panneau « Développement des habiletés » du profil référence par nom nu des exports d'autres IIFE.
        _genererBarresSRPNF: fwd('_genererBarresSRPNF'),
        genererConteneurGestesCognitifs: fwd('genererConteneurGestesCognitifs'), genererOngletsDeveloppement: fwd('genererOngletsDeveloppement'),
        calculerMoyennesCriteres: fwd('calculerMoyennesCriteres'), diagnostiquerForcesChallenges: fwd('diagnostiquerForcesChallenges'),
        obtenirTermeProduction: fwd('obtenirTermeProduction'), accordTermeProduction: fwd('accordTermeProduction'),
        niveauxEtGradientDesEvaluations: fwd('niveauxEtGradientDesEvaluations'), diagnostiquerConversionNiveaux: fwd('diagnostiquerConversionNiveaux'),
        diagnostiquerGrilleReferenceDepistage: fwd('diagnostiquerGrilleReferenceDepistage'), obtenirGrilleReferenceDepistage: fwd('obtenirGrilleReferenceDepistage'),
        couleurCssSure: fwd('couleurCssSure'), obtenirCouleurNiveauIDME: fwd('obtenirCouleurNiveauIDME'), obtenirIdsProductionsEvaluables: fwd('obtenirIdsProductionsEvaluables'),
        obtenirNombreProductionsPourPatterns: fwd('obtenirNombreProductionsPourPatterns'), calculerDirectionsCriteres: fwd('calculerDirectionsCriteres')
    };
    // Tout export `window.X = …` des modules chargés est aussi joignable par nom nu (comme dans le
    // navigateur, où `window.X` est un global) : aiguillage générique, résolu à l'appel.
    // Les classes (`new X`) et les objets exportés ne s'enveloppent pas : ils sont joints par `window.X`.
    const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', '_exportResultats', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT'];
    for (const nom of EXPORTS_WINDOW) if (!(nom in globaux) && !/^[A-Z]/.test(nom) && !OBJETS_EXPORTES.includes(nom)) globaux[nom] = fwd(nom);

    chargerScript('js/pratiques/pratique-configurable.js', globaux, win);
    chargerScript('js/pratiques/pratique-registre.js', Object.assign({ PratiqueConfigurable: win.PratiqueConfigurable }, globaux), win);
    chargerScript('js/pratiques/pratique-manager.js', Object.assign({ PratiqueConfigurable: win.PratiqueConfigurable }, globaux), win);
    chargerScript('js/pratiques/pratique-sommative.js', globaux, win);
    chargerScript('js/pratiques/pratique-pan-standards.js', globaux, win);
    chargerScript('js/pratiques/pratique-pan-specifications.js', globaux, win);
    chargerScript('js/pratiques/denotation-jugements.js', globaux, win);
    chargerScript('js/portfolio.js', globaux, win);
    chargerScript('js/indices.js', globaux, win);
    chargerScript('js/profil-etudiant-actions.js', globaux, win);
    chargerScript('js/profil-etudiant-calculs.js', globaux, win);
    chargerScript('js/profil-etudiant-helpers.js', Object.assign({ PratiquePANStandards: win.PratiquePANStandards, PratiqueSommative: win.PratiqueSommative }, globaux), win);
    chargerScript('js/export-resultats-finaux.js', globaux, win);
    // Le panneau Portfolio du profil (genererSectionPerformance) et ses dépendances de rendu.
    chargerScript('js/profil-etudiant-rapport.js', globaux, win);
    chargerScript('js/profil-etudiant-diagnostics.js', globaux, win);
    chargerScript('js/profil-etudiant-confidentiel.js', globaux, win);
    chargerAvecInterne('js/profil-etudiant-sections-affichage.js', globaux, win, ['genererSectionPerformance']);   // _lireDetailsRapportPerformance retirée (#714)
    if (opts.avecJetons) chargerScript('js/evaluation-jetons.js', globaux, win);

    // La résolution de la pratique active : le CODE RÉEL de modes.js, chargé dans un bac à part
    // (son initialisation touche le DOM), branché sur le même store.
    const winModes = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test' };
    chargerScript('js/modes.js', Object.assign({}, globaux, { document }), winModes);
    win.obtenirPratiqueActiveGroupeCours = winModes.obtenirPratiqueActiveGroupeCours;
    win.lirePointeurPratiqueGroupeCours = winModes.lirePointeurPratiqueGroupeCours;

    return { win, store, ecritures, notifs, confirmations, elements, fichiers, db };
}

/** La note SPE par la configurable, APRÈS une passe d'indices (sans elle, le cache vide rend 0 — mesure F1). */
function pSPE(b) { b.win.calculerEtStockerIndicesCP(); return b.win.obtenirPratiqueParId('spe-banc').calculerPerformance(DA.SPE) * 100; }

/** Les cinq nombres d'un élève : les deux systèmes, la simulation, l'indice stocké (après deux passes), l'export. */
function mesurerEleve(b, da, pratiqueId) {
    const { win, store } = b;
    const details = win.calculerDetailsNoteFinale(da);
    const instanceConfigurable = win.obtenirPratiqueParId(pratiqueId);
    const famille = instanceConfigurable && instanceConfigurable.obtenirCode();
    const instanceRegistre = win.obtenirPratiqueParId(win.obtenirTypePratiqueActive() || 'sommative');
    const passe1 = win.calculerEtStockerIndicesCP()[da]?.actuel || null;
    const passe2 = win.calculerEtStockerIndicesCP()[da]?.actuel || null;
    const configurableP = instanceConfigurable ? instanceConfigurable.calculerPerformance(da) : undefined;
    const registreP = instanceRegistre ? instanceRegistre.calculerPerformance(da) : undefined;
    const simule = win.simulerIndices(da, pratiqueId);
    const ligneExport = win._exportResultats.construireLignesSynthese([ETUDIANTS.find(e => e.da === da)], { pratiqueId }, win.simulerIndices)[0];
    const indices = win.calculerTousLesIndices(da);
    const niveau = win.lireNiveauNoteGlobale(da, indices.P);
    return {
        famille,
        riche: details ? (details.erreur ? { erreur: details.erreur } : r2(details.noteFinale)) : null,
        registreP: r2(registreP), configurableP: r2(configurableP),
        simule: simule ? { P: simule.P, noteFinale: r2(simule.noteFinale), noteConstructible: simule.noteConstructible } : null,
        indicesPasse1: passe1 && { P: passe1.P, noteConstructible: passe1.noteConstructible },
        indicesPasse2: passe2 && { P: passe2.P, noteConstructible: passe2.noteConstructible },
        profilP: indices.P, profilNiveau: niveau.niveau ? niveau.niveau.code : null, profilRaison: niveau.raison,
        export: { note: ligneExport[8], statut: ligneExport[9] }
    };
}

/* =============================================================================================
   A · LA RÉSOLUTION DE LA PRATIQUE
   ============================================================================================= */
describe('A · quelle pratique calcule pour cet élève', () => {
    it('A1 · groupe-cours SANS pratiqueId — modes.js répond « sommative », le registre répond null → le profil calcule en « standards »', () => {
        // À la main : deux replis différents. L'indice P suit la sommative (8830/102 = 86,57 → 87) ;
        // le profil (calculerDetailsNoteFinale) prend le défaut PRATIQUE_DEFAUT = standards et cherche
        // une config de portfolio pour l'id « sommative » → « introuvable dans la bibliothèque ».
        // ↻ #762 (6 sept. 2026, retour testeur) : le diagnostic lit maintenant la source de vérité
        // (`groupesCours[].pratiqueId`) et dit « aucune pratique de notation n'est assignée » —
        // la moitié « diagnostic » de #710 ; les deux replis de calcul (87 ici) restent à trancher.
        const b = monter(jeuSOM(), { retirerPratiqueId: true });
        const actif = b.win.obtenirIdPratiqueActive();
        const type = b.win.obtenirTypePratiqueActive();
        b.win.calculerEtStockerIndicesCP(); const p = b.win.calculerEtStockerIndicesCP()[DA.SOM].actuel;
        const details = b.win.calculerDetailsNoteFinale(DA.SOM);
        noter('A1', { actif, type, indicesP: p.P, noteConstructible: p.noteConstructible, erreurProfil: details && details.erreur });
        // ↻ Lot N1a (21 sept. 2026, #710 — décision de Grégoire : sans pratique assignée, aucune note). Les deux replis
        // de calcul sont retirés : l'indice dit « non constructible » (avant : P 87, par la sommative de repli), comme le
        // profil. `obtenirPratiqueActiveGroupeCours` garde « sommative » pour les lecteurs d'écran jusqu'au lot N1b ; ce
        // qui calcule lit le pointeur SANS repli.
        // ↻ Lot N1b (21 sept. 2026) : `obtenirPratiqueActiveGroupeCours` et son repli « sommative » sont retirés ; l'id que
        // lisent les écrans est celui de la désignation — null.
        expect(actif).toBeNull();
        expect(b.win.obtenirPratiqueActiveGroupeCours).toBeUndefined();
        expect(b.win.lirePointeurPratiqueGroupeCours()).toBeNull();
        expect(b.win.resoudrePratiqueActive().etat).toBe('aucune');
        expect(type).toBeNull();
        expect(p.P).toBe(0);
        expect(p.noteConstructible).toBe(false);
        expect(p.pratique).toBeNull();
        expect(details.erreur).toMatch(/[Aa]ucune pratique de notation n'est assignée/);   // avant #762 : « introuvable dans la bibliothèque »
    });

    it('A2 · identifiant legacy « pan-standards » dans le groupe-cours — le registre calcule avec ses défauts (3 / meilleurs), le profil dit « non calculable »', () => {
        // À la main : la configurable std-banc (N = 4) n'est PAS lue (l'id pointé ne la désigne pas) ;
        // l'instance registre applique 3 / meilleurs : (85 + 78 + 78) / 3 = 80,333 → 80,333 × 0,6 + 82 × 0,4 = 81,0.
        // Avec N = 4 (la vraie config) : (85 + 78 + 78 + 70) / 4 = 77,75 → 46,65 + 32,8 = 79,45.
        const b = monter(jeuSTD(), { pratiqueId: 'pan-standards' });
        const inst = b.win.obtenirPratiqueParId('pan-standards');
        const details = b.win.calculerDetailsNoteFinale(DA.STD);
        b.win.calculerEtStockerIndicesCP(); const p = b.win.calculerEtStockerIndicesCP()[DA.STD].actuel;
        const simule = b.win.simulerIndices(DA.STD, 'pan-standards');
        noter('A2', { instance: inst && inst.obtenirId(), registreP: r2(inst.calculerPerformance(DA.STD)), erreurProfil: details.erreur, indicesP: p.P, noteConstructible: p.noteConstructible, simule: simule && { P: simule.P, noteConstructible: simule.noteConstructible } });
        expect(inst.obtenirId()).toBe('standards');
        expect(r2(inst.calculerPerformance(DA.STD))).toBe(0.81);
        expect(details.erreur).toMatch(/introuvable/);
        expect(p.noteConstructible).toBe(false);
        expect(p.P).toBe(0);
    });

    it('A3 · pratique importée rangée sous `.config` seul — l\'instance résout (STD), le profil et la simulation ne trouvent pas sa configuration', () => {
        // À la main : construireConfigComplete lit `.config` ; obtenirConfigPratiqueActive ne lit que
        // `.configuration` → portfolio absent → erreur de profil, non constructible, export vide.
        const jeu = jeuSTD();
        jeu.pratiques = [{ id: 'std-config', nom: 'STD (.config)', config: { id: 'std-config', nom: 'STD (.config)', type: 'standards',
            calcul_note: { methode: 'conversion_niveaux' }, echelle: { type: 'niveaux', niveaux: clone(E1.niveaux) },
            portfolio: { nombreARetenir: 4, minimumCompletion: 1, methodeSelection: 'meilleurs' } } }];
        jeu.pratiqueId = 'std-config';
        const b = monter(jeu);
        const inst = b.win.obtenirPratiqueParId('std-config');
        const details = b.win.calculerDetailsNoteFinale(DA.STD);
        const simule = b.win.simulerIndices(DA.STD, 'std-config');
        const ligne = b.win._exportResultats.construireLignesSynthese([ETUDIANTS[1]], { pratiqueId: 'std-config' }, b.win.simulerIndices)[0];
        noter('A3', { code: inst && inst.obtenirCode(), type: b.win.obtenirTypePratiqueActive(), erreurProfil: details.erreur, simule: { P: simule.P, noteConstructible: simule.noteConstructible }, export: [ligne[8], ligne[9]] });
        expect(inst.obtenirCode()).toBe('STD');
        // ↻ Lot N1a (21 sept. 2026, #712) : la configuration se lit `.configuration` PUIS `.config`, comme
        // `construireConfigComplete`. La pratique importée calcule : (85+78+78+70)/4 = 77,75 → 46,65 + 32,8 = 79,45.
        // Avant : « configuration de portfolio absente », non constructible, export vide.
        expect(details.erreur == null).toBe(true);
        expect(r2(details.noteFinale)).toBe(79.45);
        expect(simule.noteConstructible).toBe(true);
        expect(simule.P).toBe(79);
        expect(ligne[8]).toBe(79);
    });

    it('A4 · un pointeur « pan-specifications » (ou « specifications ») résout vers l\'instance registre SPE, jamais configurée : aucune note pour personne', () => {
        // À la main : typesTravaux [] → comptes {} → aucun palier → palierEchec absent → aucune note (lot N4 ; avant : 50 → 0,5) ;
        // la configurable spe-banc, elle, donne C+ = 70.
        const b = monter(jeuSPE(), { pratiqueId: 'pan-specifications' });
        const inst = b.win.obtenirPratiqueParId('pan-specifications');
        b.win.calculerEtStockerIndicesCP(); const p = b.win.calculerEtStockerIndicesCP()[DA.SPE].actuel;
        const bon = b.win.obtenirPratiqueParId('spe-banc');
        noter('A4', { instance: inst.obtenirId(), registreP: inst.calculerPerformance(DA.SPE), indicesP: p.P, noteConstructible: p.noteConstructible, configurableP: bon.calculerPerformance(DA.SPE) });
        // ↻ Lot N4 (#713, 23 sept. 2026) : l'instance du registre, interrogée À LA MAIN, n'a ni forfait ni palier d'échec → aucune note.
        // Avant : son 50 codé en dur.
        expect(inst.calculerPerformance(DA.SPE)).toBeNull();
        // ↻ Lot N1a (21 sept. 2026, #713 volet registre) : le pointeur nu ne mène à aucune pratique de la bibliothèque →
        // « introuvable », non constructible. Avant : P 50 « constructible » pour tout le monde.
        expect(b.win.resoudrePratiqueActive().etat).toBe('introuvable');
        expect(p.P).toBe(0);
        expect(p.noteConstructible).toBe(false);
        expect(bon.calculerPerformance(DA.SPE)).toBe(0.7);
    });
});

/* =============================================================================================
   N1a · LA PRATIQUE ACTIVE SE TROUVE D'UNE SEULE FAÇON (lot N1a, 21 sept. 2026 — #710, #711, #712, #713, #719)
   Six montages sur le vrai moteur. Pour chacun, QUATRE SURFACES doivent dire la même chose : l'indice stocké
   (ce que lit le tableau de bord), le profil (chemin riche), l'export des résultats (par l'id que rend
   `obtenirIdPratiqueActive`, comme `_collecterContexteActif`), et le diagnostic du profil.
   La parité « pratique assignée normale, notes identiques à avant » est tenue par B1 à B4, dont aucune
   valeur n'a été retouchée par ce lot.
   ============================================================================================= */
function quatreSurfaces(b, da) {
    const { win } = b;
    win.calculerEtStockerIndicesCP();
    const indice = win.calculerEtStockerIndicesCP()[da].actuel;
    const details = win.calculerDetailsNoteFinale(da);
    const idExport = win.obtenirIdPratiqueActive();
    const ligne = win._exportResultats.construireLignesSynthese([ETUDIANTS.find(e => e.da === da)], { pratiqueId: idExport }, win.simulerIndices)[0];
    return {
        etat: win.resoudrePratiqueActive().etat,
        indice: { P: indice.P, noteConstructible: indice.noteConstructible, pratique: indice.pratique },
        profil: details ? (details.erreur ? { erreur: details.erreur, pratique: details.pratique } : r2(details.noteFinale)) : null,
        export: { id: idExport, note: ligne[8], statut: ligne[9] },
        diagnostic: win._diagnostiquerNoteNonCalculable(),
        // ↻ Lot N7 (23 sept. 2026) : `obtenirPratiqueActuelle` est retirée ; on lit ce qu'elle servait, le niveau global.
        raisonNiveau: win.lireNiveauNoteGlobale(da, 80).raison
    };
}
const AUCUNE = /Aucune pratique de notation n'est assignée à ce groupe-cours/;
const INTROUVABLE = /introuvable dans la bibliothèque/;

describe('N1a · la pratique active se trouve d\'une seule façon', () => {
    it('N1 · SANS pratique assignée : « non constructible » partout, et le diagnostic dit « Aucune pratique… » (#710)', () => {
        const m = noter('N1', quatreSurfaces(monter(jeuSOM(), { retirerPratiqueId: true }), DA.SOM));
        expect(m.etat).toBe('aucune');
        expect(m.indice).toEqual({ P: 0, noteConstructible: false, pratique: null });   // avant : P 87, « constructible », par la sommative de repli
        expect(m.profil.erreur).toMatch(AUCUNE);
        expect(m.profil.pratique).toBeNull();                                           // avant : étiqueté « PAN-Standards », par PRATIQUE_DEFAUT
        expect(m.export).toEqual({ id: null, note: '', statut: 'non constructible' });
        expect(m.diagnostic).toMatch(AUCUNE);
        expect(m.raisonNiveau).toBe('pratique-sans-methode');                           // avant N1a : une PratiquePANStandards fabriquée lisait un niveau
    });

    it('N2 · un id assigné qui ne mène à RIEN (pratique supprimée) : « non constructible » partout, diagnostic « introuvable »', () => {
        const m = noter('N2', quatreSurfaces(monter(jeuSOM(), { pratiqueId: 'pratique-supprimee' }), DA.SOM));
        expect(m.etat).toBe('introuvable');
        expect(m.indice).toEqual({ P: 0, noteConstructible: false, pratique: null });
        expect(m.profil.erreur).toMatch(INTROUVABLE);
        expect(m.export).toEqual({ id: null, note: '', statut: 'non constructible' });
        expect(m.diagnostic).toMatch(INTROUVABLE);
        expect(m.raisonNiveau).toBe('pratique-sans-methode');
    });

    it('N3 · #711 — le pointeur ancien « pan-standards » mène, normalisé, à la pratique rangée sous « standards » : SA configuration (N = 4) calcule, 79,45 partout', () => {
        // À la main (A2) : N = 4 → (85+78+78+70)/4 = 77,75 → 46,65 + 32,8 = 79,45. Les défauts du registre (3 / meilleurs) donnaient 81,0.
        const jeu = jeuSTD();
        jeu.pratiques = jeu.pratiques.map(p => Object.assign(p, { id: 'standards' }));
        const b = monter(jeu, { pratiqueId: 'pan-standards' });
        const m = noter('N3', quatreSurfaces(b, DA.STD));
        expect(m.etat).toBe('ok');
        expect(m.profil).toBe(79.45);
        expect(m.indice).toEqual({ P: 79, noteConstructible: true, pratique: 'standards' });
        expect(m.export).toEqual({ id: 'standards', note: 79, statut: 'final' });   // même statut que B2 (pratique assignée par son id)
        expect(b.store.test_groupesCours[0].pratiqueId).toBe('pan-standards');          // lecture tolérante : le pointeur n'est PAS réécrit
    });

    it('N4 · #712 — la pratique rangée sous `.config` seul calcule : 79,45 à l\'indice, au profil et à l\'export', () => {
        const jeu = jeuSTD();
        jeu.pratiques = [{ id: 'std-config', nom: 'STD (.config)', config: { id: 'std-config', nom: 'STD (.config)', type: 'standards',
            calcul_note: { methode: 'conversion_niveaux' }, echelle: { type: 'niveaux', niveaux: clone(E1.niveaux) },
            portfolio: { nombreARetenir: 4, minimumCompletion: 1, methodeSelection: 'meilleurs' } } }];
        jeu.pratiqueId = 'std-config';
        const m = noter('N4', quatreSurfaces(monter(jeu), DA.STD));
        expect(m.profil).toBe(79.45);
        expect(m.indice).toEqual({ P: 79, noteConstructible: true, pratique: 'std-config' });
        expect(m.export.note).toBe(79);
    });

    it('N5 · #713 — un pointeur « specifications » (ou « pan-specifications ») nu : « introuvable », non constructible partout ; plus de 50 % pour tout le monde', () => {
        for (const pointeur of ['specifications', 'pan-specifications']) {
            const m = noter('N5-' + pointeur, quatreSurfaces(monter(jeuSPE(), { pratiqueId: pointeur }), DA.SPE));
            expect(m.etat, pointeur).toBe('introuvable');
            expect(m.indice, pointeur).toEqual({ P: 0, noteConstructible: false, pratique: null });
            expect(m.profil.erreur, pointeur).toMatch(INTROUVABLE);
            expect(m.export, pointeur).toEqual({ id: null, note: '', statut: 'non constructible' });
        }
    });

    it('N6 · #719 — dénotation active, jugement 78 : 78 à l\'indice et à l\'export, et AUCUNE lettre (avant : « M », par une Standards fabriquée)', () => {
        const b = monter(jeuDEN());
        const m = noter('N6', quatreSurfaces(b, DA.DEN));
        expect(m.indice).toEqual({ P: 78, noteConstructible: true, pratique: 'den-banc' });
        expect(m.profil).toBeNull();                       // pas de note « portfolio » pour une dénotation : le profil rend sa carte de jugement
        expect(m.export).toEqual({ id: 'den-banc', note: 78, statut: 'final' });
        expect(m.raisonNiveau).toBe('note-chiffree');     // la pratique ASSIGNÉE répond (la configurable de dénotation)
        const lettre = b.win.lireNiveauNoteGlobale(DA.DEN, 78);
        expect(lettre.niveau).toBeNull();
        expect(lettre.raison).toBe('note-chiffree');
    });

    it('N7 · le pointeur « sommative » nu reste une pratique assignée (la seule famille du registre sans configuration) : 87 partout, comme avant', () => {
        const m = noter('N7', quatreSurfaces(monter(jeuSOM(), { pratiqueId: 'sommative' }), DA.SOM));
        expect(m.etat).toBe('ok');
        expect(m.indice).toEqual({ P: 87, noteConstructible: true, pratique: 'sommative' });
        expect(m.export.note).toBe(87);
    });
});

/* =============================================================================================
   N7 · LE NIVEAU DE LA NOTE GLOBALE SE LIT DANS UNE SEULE RÈGLE (lot N7, 23 sept. 2026)
   Décision de Grégoire (22 sept., soir) : pour une Standards, l'échelle des ÉVALUATIONS (règle A),
   jamais celle rangée dans la pratique (règle B). Et : « L'échelle IDME est ma pratique personnelle.
   On ne peut l'imposer à aucun utilisateur. » D'où une échelle d'essai aux codes et bornes inventés,
   décalées d'IDME : à 72 %, E1 dit « D » (55-74), l'échelle d'essai dit « AQ » (72-93).
   ============================================================================================= */
const ESSAI = { id: 'ESSAI', nom: 'Échelle d\'essai', niveaux: [
    { code: 'AM', nom: 'Amorce', min: 0, max: 47, valeurCalcul: 30 },
    { code: 'CH', nom: 'En chemin', min: 48, max: 71, valeurCalcul: 60 },
    { code: 'AQ', nom: 'Acquis', min: 72, max: 93, valeurCalcul: 80 },
    { code: 'TR', nom: 'Transféré', min: 94, max: 100, valeurCalcul: 97 }
] };
const VERS_ESSAI = { I: 'AM', D: 'CH', M: 'AQ', E: 'TR', 0: '0' };
/** Le jeu STD, ses évaluations passées dans l'échelle d'essai (toutes, ou celles que `garder` écarte). */
function jeuSTDEssai(opts = {}) {
    const jeu = jeuSTD({ echelleId: opts.echelleDeLaPratique || 'ESSAI' });
    jeu.evaluations.forEach((e, i) => {
        if (opts.laisserEnE1 && opts.laisserEnE1(e, i)) return;
        e.echelleId = 'ESSAI';
        e.niveauFinal = VERS_ESSAI[e.niveauFinal];
        e.criteres.forEach(c => { c.niveauSelectionne = VERS_ESSAI[c.niveauSelectionne]; });
    });
    if (opts.idDeLaPratique) jeu.pratiques.forEach(p => { p.id = opts.idDeLaPratique; });
    return jeu;
}
const lettre = (b, pct) => { const l = b.win.lireNiveauNoteGlobale(DA.STD, pct); return { code: l.niveau ? l.niveau.code : null, raison: l.raison }; };

describe('N7 · le niveau de la note globale : la règle des évaluations, et elle seule', () => {
    it('N7-1 · STD, évaluations dans UNE échelle créée par l\'utilisateur (pas IDME) : le niveau est lu dans cette échelle', () => {
        const b = monter(jeuSTDEssai(), { echelles: [E1, ESSAI] });
        const m = noter('N7-1', { a72: lettre(b, 72), a50: lettre(b, 50), a95: lettre(b, 95) });
        expect(m.a72).toEqual({ code: 'AQ', raison: null });   // E1 dirait « D »
        expect(m.a50.code).toBe('CH');                          // E1 dirait « I »
        expect(m.a95.code).toBe('TR');
    });

    it('N7-2 · STD dont la pratique porte une échelle B DIFFÉRENTE de celle des évaluations (cas #648) : le niveau vient des évaluations, jamais de B', () => {
        const b = monter(jeuSTDEssai({ echelleDeLaPratique: 'E1' }), { echelles: [E1, ESSAI] });
        const inst = b.win.obtenirPratiqueParId('std-banc');
        expect(inst.config.echelle.echelle_id).toBe('E1');                 // B est bien rangée dans la pratique
        expect(b.win.situerPourcentageDansEchelle(72, inst.config.echelle).code).toBe('D');   // et B dirait « D »
        const m = noter('N7-2', lettre(b, 72));
        expect(m).toEqual({ code: 'AQ', raison: null });
    });

    it('N7-2bis · même cas, pratique rangée sous l\'id « standards » et pointeur ancien « pan-standards » (#711) : avant N7, l\'instance « du registre » ÉTAIT la configurable, et B répondait — plus maintenant', () => {
        // Avant N7, `obtenirPratiqueActuelle` demandait `obtenirPratiqueParId('standards')`, qui trouve d'abord la
        // bibliothèque (#711) : la PratiqueConfigurable, donc `config.echelle` — « D » à 72 %. Seul chemin où la
        // règle B servait une Standards à l'écran. Ni le pack démo (`demo-std-litt`) ni les bancs n'y passaient.
        const b = monter(jeuSTDEssai({ echelleDeLaPratique: 'E1', idDeLaPratique: 'standards' }), { echelles: [E1, ESSAI], pratiqueId: 'pan-standards' });
        expect(b.win.resoudrePratiqueActive().famille).toBe('standards');
        expect(noter('N7-2bis', lettre(b, 72))).toEqual({ code: 'AQ', raison: null });
    });

    it('N7-3 · STD, évaluations dans DEUX échelles : aucun niveau, la cause nommée', () => {
        const b = monter(jeuSTDEssai({ laisserEnE1: (e, i) => i % 2 === 0 }), { echelles: [E1, ESSAI] });
        const l = b.win.lireNiveauNoteGlobale(DA.STD, 72);
        noter('N7-3', { code: l.niveau, raison: l.raison, survol: l.survol });
        expect(l.niveau).toBeNull();
        expect(l.raison).toBe('echelles-divergentes');
        expect(l.survol).not.toBe('');
    });

    it('N7-4 · SOM, SPE, DEN : niveau inchangé par rapport à main d\'avant le lot (aucun niveau ; « note-chiffree », « pratique-sans-methode », « note-chiffree »)', () => {
        // Valeurs de `main` à 73445a4c (E4, E5, N6) ; le message de la sommative est celui de PratiqueSommative, recopié mot pour mot.
        const som = monter(jeuSOM()).win.lireNiveauNoteGlobale(DA.SOM, 87);
        const spe = monter(jeuSPE()).win.lireNiveauNoteGlobale(DA.SPE, 70);
        const den = monter(jeuDEN()).win.lireNiveauNoteGlobale(DA.DEN, 78);
        noter('N7-4', { som, spe, den });
        expect(som).toEqual({ niveau: null, raison: 'note-chiffree', survol: 'La pratique sommative établit la note globale comme un pourcentage pondéré. Elle ne la situe dans aucune échelle de niveaux — c\'est une note, pas un niveau atteint.' });
        expect(spe).toEqual({ niveau: null, raison: 'pratique-sans-methode', survol: '' });
        expect(den.niveau).toBeNull(); expect(den.raison).toBe('note-chiffree');
        // Et même une SPE qui PORTE une échelle de niveaux n'en reçoit pas un en passant (décision de didactique, pas de refactor).
        const jeu = jeuSPE(); jeu.pratiques[0].configuration.echelleId = 'E1';
        expect(monter(jeu).win.lireNiveauNoteGlobale(DA.SPE, 80).niveau).toBeNull();
    });
});

/* =============================================================================================
   B · LES DEUX SYSTÈMES DE CALCUL, PAR FAMILLE — le nœud
   ============================================================================================= */
describe('B · les deux systèmes, la simulation, l\'indice stocké, l\'export, le profil', () => {
    it('B1 · SOM — attendu 87,43 : (84×40 + 90×60 + 70×1) / (40+60+1) = 8830/101 (↻ #706 : le brouillon 0 est écarté ; avant 8830/102 = 86,57) ; P 0,87 ; profil et export « 87 »', () => {
        const b = monter(jeuSOM());
        const m = noter('B1', mesurerEleve(b, DA.SOM, 'som-banc'));
        expect(m.famille).toBe('SOM');
        expect(m.riche).toBeNull();                       // le chemin riche ne répond pas pour SOM
        expect(m.registreP).toBe(0.87);                   // 0,8657 arrondi au centième
        expect(m.configurableP).toBe(0.87);
        expect(m.simule).toEqual({ P: 87, noteFinale: null, noteConstructible: true });
        expect(m.indicesPasse1).toEqual({ P: 87, noteConstructible: true });  // ↻ #709 : juste dès la 1re passe (avant : { P: 0, noteConstructible: true }, voir F1)
        expect(m.indicesPasse2).toEqual({ P: 87, noteConstructible: true });
        expect(m.export).toEqual({ note: 87, statut: 'final' });
        expect(m.profilNiveau).toBeNull(); expect(m.profilRaison).toBe('note-chiffree');
    });

    it('B2 · STD (N = 4, meilleurs) — attendu 79,45 : (85+78+78+70)/4 = 77,75 ; 77,75×0,6 + 82×0,4 = 79,45 ; niveau M', () => {
        const b = monter(jeuSTD());
        const m = noter('B2', mesurerEleve(b, DA.STD, 'std-banc'));
        expect(m.famille).toBe('STD');
        expect(m.riche).toBe(79.45);
        expect(m.registreP).toBe(0.79);                   // 0,7945 → 0,79 ; même chaîne que le riche
        expect(m.configurableP).toBe(0.79);               // lu dans indicesCP (après deux passes) — un cache
        expect(m.simule).toEqual({ P: 79, noteFinale: 79.45, noteConstructible: true });
        expect(m.indicesPasse2).toEqual({ P: 79, noteConstructible: true });
        expect(m.export).toEqual({ note: 79, statut: 'final' });
        expect(m.profilNiveau).toBe('M');
    });

    it('B2b · STD — la configurable lue AVANT toute passe d\'indices rend null (↻ #709 ; avant : 0, un nombre)', () => {
        const b = monter(jeuSTD());
        const p = b.win.obtenirPratiqueParId('std-banc').calculerPerformance(DA.STD);
        noter('B2b', { configurableP_sansCache: p });
        expect(p).toBeNull();   // avant #709 : 0
    });

    it('B3 · STD — l\'« écran Portfolio » de portfolio.js (chargerPortfolioEleveDetail) n\'a AUCUN appelant ni conteneur : code mort ; sa règle propre (originale 90 retenue, terminale ignorée → 82,75) ne s\'affiche nulle part', () => {
        // À la main, ce que cette fonction calculerait (portfolio.js:150-247) : note de A4 = PREMIÈRE évaluation
        // trouvée = l'originale 90 ; A6 : 0 || null → sans note ; « meilleurs » N = 4 → 90, 85, 78, 78 → 82,75.
        // Mesuré [grep] : `grep -rn "chargerPortfolioEleveDetail(" js/` → sa définition et son propre repli ;
        // `grep -c portfolioEleveDetail index.html` → 0 ; `window.chargerPortfolioEleveDetail` n'existe pas.
        const b = monter(jeuSTD());
        noter('B3', { exposee: typeof b.win.chargerPortfolioEleveDetail, toggleExpose: typeof b.win.toggleArtefactPortfolioFromEl, profil: r2(b.win.calculerDetailsNoteFinale(DA.STD).noteFinale) });
        expect(typeof b.win.chargerPortfolioEleveDetail).toBe('undefined');
        // ↻ #722 (11 oct. 2026) : le panneau et sa bascule sont retirés ; la bascule n'est plus exposée.
        expect(typeof b.win.toggleArtefactPortfolioFromEl).toBe('undefined');
    });

    it('B3b · STD — le VRAI panneau Portfolio du profil (genererSectionPerformance) : l\'indice P y est juste (79 %), mais la « Méthodologie de calcul » ne retrouve aucun artefact retenu et écrit « Calcul impossible »', () => {
        // À la main : _lireDetailsRapportPerformance lit indicesCP.details.artefactsRetenus, que calculerEtStockerIndicesCP
        // n'écrit plus (details = { calculViaPratique: true }) → liste vide → « aucun … évalué » et « Calcul impossible :
        // aucune évaluation disponible » sous un P de 79 %. Et le rendu ÉCRIT portfoliosEleves (sélection auto) + recalcule.
        const b = monter(jeuSTD());
        b.win.calculerEtStockerIndicesCP(); b.win.calculerEtStockerIndicesCP();
        let html = null, erreur = null;
        try { html = b.win.__audit.genererSectionPerformance(DA.STD); } catch (e) { erreur = e.constructor.name + ' : ' + e.message; }
        const m = noter('B3b', {
            erreur,
            pGrand: html && (html.match(/profil-valeur-grande-bleu[\s\S]*?(\d+%)<\/strong>/) || [])[1],
            niveauGrand: html && (html.match(/profil-valeur-grande-bleu[^>]*><span[^>]*>([^<]*)<\/span>/) || [])[1],
            methodeBloc: html && (html.match(/profil-liste-simple[\s\S]*?<strong>• ([^<]*)</) || [])[1],
            methodo: html && (html.match(/Calcul de l'indice P :<\/strong>\s*([^<]*)/) || [])[1]?.trim(),
            retenus: html && (html.match(/retenu[^<]*:<\/strong>\s*([^<]*)/) || [])[1]?.trim(),
            ecritures: b.ecritures.filter(k => k === 'test_portfoliosEleves').length
        });
        expect(erreur).toBeNull();
        expect(m.pGrand).toMatch(/79%/);
        // ↻ #714 (lot N3, 22 sept. 2026) — valeurs D'APRÈS. Avant : « Calcul impossible : aucune évaluation
        // disponible » et au moins une écriture de `portfoliosEleves` par rendu. Le panneau lit désormais
        // `calculerDetailsNoteFinale` et n'écrit rien (sentinelle-714-panneau-habiletes-lit-la-note).
        expect(m.methodo).not.toMatch(/Calcul impossible/);
        expect(m.methodo).toMatch(/^Moyenne des 4 /);
        expect(m.ecritures).toBe(0);
    });

    it('B4 · SPE — attendu 70 (palier C+) : dissertation 1 acceptable (80 ; la reprise 65 remplace le 75), examen 1 (90), dossier 1 (72)', () => {
        const b = monter(jeuSPE());
        const m = noter('B4', mesurerEleve(b, DA.SPE, 'spe-banc'));
        expect(m.famille).toBe('SPE');
        expect(m.riche).toBeNull();
        expect(m.registreP).toBeNull();                   // l'instance registre, jamais configurée : aucune note (lot N4 ; voir A4)
        expect(m.configurableP).toBe(0.7);
        expect(m.simule).toEqual({ P: 70, noteFinale: null, noteConstructible: true });
        expect(m.indicesPasse2).toEqual({ P: 70, noteConstructible: true });
        expect(m.export).toEqual({ note: 70, statut: 'final' });
        expect(m.profilNiveau).toBeNull(); expect(m.profilRaison).toBe('pratique-sans-methode');
    });

    it('B5 · DEN — attendu 78 (le jugement saisi, deux cibles confirmées) ; les quatre évaluations n\'y entrent pas', () => {
        const b = monter(jeuDEN());
        const m = noter('B5', mesurerEleve(b, DA.DEN, 'den-banc'));
        expect(m.famille).toBe('DEN');
        expect(m.riche).toBeNull();
        expect(m.configurableP).toBe(0.78);
        expect(m.simule).toEqual({ P: 78, noteFinale: null, noteConstructible: true });
        expect(m.indicesPasse1).toEqual({ P: 78, noteConstructible: true });   // DEN court-circuite le cache : juste dès la 1re passe
        expect(m.export).toEqual({ note: 78, statut: 'final' });
        // ↻ Lot N1a (21 sept. 2026, #719) : plus de lettre « M » qu'aucune règle de la dénotation ne donne — voir E5.
        expect(m.profilNiveau).toBeNull();
        expect(m.profilRaison).toBe('note-chiffree');
        const sansEvals = monter(jeuDEN({ sansEvaluations: true }));
        expect(sansEvals.win.obtenirPratiqueParId('den-banc').calculerPerformance(DA.DEN)).toBe(0.78);
    });

    it('B6 · un élève sans évaluation sous chaque famille — ce que chaque écran écrit', () => {
        // À la main : SOM null → non constructible ; STD non constructible ; DEN sans saisie → non constructible ;
        // SPE configurable → la délégation rend 0 (nombre) → « 0, final ».
        const res = {};
        for (const [fam, jeu] of [['SOM', jeuSOM()], ['STD', jeuSTD()], ['SPE', jeuSPE({ sansEvaluations: true })], ['DEN', jeuDEN({ sansSaisie: true, sansEvaluations: true })]]) {
            jeu.evaluations = [];
            const b = monter(jeu);
            b.win.calculerEtStockerIndicesCP(); const p = b.win.calculerEtStockerIndicesCP()[DA[fam]].actuel;
            const s = b.win.simulerIndices(DA[fam], jeu.pratiqueId);
            const l = b.win._exportResultats.construireLignesSynthese([ETUDIANTS.find(e => e.da === DA[fam])], { pratiqueId: jeu.pratiqueId }, b.win.simulerIndices)[0];
            const cfg = b.win.obtenirPratiqueParId(jeu.pratiqueId).calculerPerformance(DA[fam]);
            const reg = fam === 'DEN' ? null : b.win.obtenirPratiqueParId(b.win.obtenirTypePratiqueActive()).calculerPerformance(DA[fam]);
            res[fam] = { configurableP: cfg, registreP: reg, indicesP: p.P, noteConstructible: p.noteConstructible, simule: { P: s.P, noteConstructible: s.noteConstructible }, export: [l[8], l[9]] };
        }
        noter('B6', res);
        expect(res.SOM.export).toEqual(['', 'non constructible']);
        expect(res.STD.export).toEqual(['', 'non constructible']);
        expect(res.DEN.export).toEqual(['', 'non constructible']);
        expect(res.SPE.registreP).toBeNull();
        expect(res.SPE.configurableP).toBeNull();              // ↻ #709 (avant : 0 là où l'instance rend null)
        expect(res.SPE.export).toEqual(['', 'non constructible']);   // ↻ #709 (avant : [0, 'final'], un zéro qui a l'air d'un résultat)
    });
});

/* =============================================================================================
   C · CE QUE LA PRATIQUE FAIT DES CHAMPS NEUFS DE L'ÉVALUATION
   ============================================================================================= */
describe('C · brouillon « 0 » à portée incomplète, brouillon « 95 sur 50 % », points analytiques, verrou', () => {
    it('C1 · SOM — le brouillon 0/50 % est écarté (↻ #706) : 87,43 avec comme sans (avant : 86,57 avec, il comptait 0 au poids 1)', () => {
        const avec = monter(jeuSOM());
        const jeu = jeuSOM(); jeu.evaluations = jeu.evaluations.filter(e => e.id !== 'EV_S4');
        const sans = monter(jeu);
        const m = noter('C1', { avec: r2(avec.win.obtenirPratiqueParId('sommative').calculerPerformance(DA.SOM) * 100), sans: r2(sans.win.obtenirPratiqueParId('sommative').calculerPerformance(DA.SOM) * 100) });
        expect(m.avec).toBe(87.43);   // avant #706 : 86.57
        expect(m.sans).toBe(87.43);
    });

    it('C2 · SOM — le brouillon « 95 sur 50 % » est écarté (↻ #706) : 87,43 (avant : il comptait 95, (8830 + 95) / 102 = 87,5 — H-1 du premier audit)', () => {
        const jeu = jeuSOM(); Object.assign(jeu.evaluations.find(e => e.id === 'EV_S4'), BROUILLON95);
        const b = monter(jeu);
        const p = noter('C2', r2(b.win.obtenirPratiqueParId('sommative').calculerPerformance(DA.SOM) * 100));
        expect(p).toBe(87.43);   // avant #706 : 87.5
    });

    it('C3 · STD — le brouillon 0 entre dans le pool (écarté sous « meilleurs » N = 4) ; sous « tous », les DEUX systèmes prennent tout : 77,32 (↻ #715 ; avant : le riche tronquait à N, 76,75)', () => {
        // À la main, « tous » = toutes les évaluations : (85+60+78+70+78+0)/6 = 61,833 → 61,833×0,6 + 82×0,4 = 69,9 ;
        // sans le brouillon : 371/5 = 74,2 → 44,52 + 32,8 = 77,32.
        // AVANT #715 (21 sept. 2026) : le chemin riche appliquait `.slice(0, nombreARetenir)` à TOUS les modes (profil-etudiant-actions.js,
        // _selectionnerArtefactsLegacy) → les 4 PREMIÈRES de l'ordre de stockage : (85+60+78+70)/4 = 73,25 → 43,95 + 32,8 = 76,75.
        // DEPUIS : sous « tous », il ne coupe plus — les cinq valides, 77,32, comme l'instance.
        const meilleurs = monter(jeuSTD());
        const tous = monter(jeuSTD({ methodeSelection: 'tous' }));
        const jeuSans = jeuSTD({ methodeSelection: 'tous' }); jeuSans.evaluations = jeuSans.evaluations.filter(e => e.id !== 'EV_A6');
        const tousSans = monter(jeuSans);
        const dm = meilleurs.win.calculerDetailsNoteFinale(DA.STD);
        const sortA6 = dm.recit.resultats.find(x => x.label === 'Artefact 6');
        const dTous = tous.win.calculerDetailsNoteFinale(DA.STD);
        const m = noter('C3', { meilleurs: r2(dm.noteFinale), sortBrouillonSousMeilleurs: sortA6 && sortA6.sort, nombreEvalues: dm.portfolio.nombreEvalues,
            tousRiche: r2(dTous.noteFinale), tousRicheRetenus: dTous.portfolio.artefactsRetenus.map(a => a.productionId),
            tousInstance: r2(tous.win.obtenirPratiqueParId('standards').calculerPerformance(DA.STD) * 100),
            tousSansBrouillonInstance: r2(tousSans.win.obtenirPratiqueParId('standards').calculerPerformance(DA.STD) * 100) });
        expect(m.meilleurs).toBe(79.45);
        expect(m.sortBrouillonSousMeilleurs).toBe('ecarte');
        expect(m.nombreEvalues).toBe(5);   // ↻ #706 : le brouillon n'est plus dans le pool (avant : 6)
        expect(m.tousRiche).toBe(77.32);   // ↻ #715 (avant : 76,75)
        expect(m.tousRicheRetenus).toEqual(['A1', 'A2', 'A3', 'A4', 'A5']);   // ↻ #715 (avant : les 4 premières stockées)
        expect(m.tousInstance).toBe(77.32);   // ↻ #706 (avant : 69,9, le brouillon 0 comptait) ; ↻ #715 : la divergence riche/instance (B-5) est levée
        expect(m.tousSansBrouillonInstance).toBe(77.32);
    });

    it('C4 · STD — le brouillon « 95 sur 50 % » n\'entre plus en tête de sélection (↻ #706) : 79,45 (avant : (95+85+78+78)/4 = 84 → 83,2)', () => {
        const b = monter(jeuSTD({ brouillon95: true }));
        const d = b.win.calculerDetailsNoteFinale(DA.STD);
        noter('C4', { noteFinale: r2(d.noteFinale), retenus: d.portfolio.artefactsRetenus.map(a => a.productionId) });
        expect(r2(d.noteFinale)).toBe(79.45);   // avant #706 : 83.2
        expect(d.portfolio.artefactsRetenus.map(a => a.productionId)).not.toContain('A6');
    });

    it('C5 · SPE — ni le brouillon 0 ni le brouillon « 95 sur 50 % » ne sont des travaux acceptables (↻ #706) : B (80) dans les deux cas (avant : le 95 faisait monter à A = 100)', () => {
        const b0 = monter(jeuSPE({ repriseD2: 75 }));
        const b95 = monter(jeuSPE({ repriseD2: 75, brouillon95: true }));
        const m = noter('C5', { brouillon0: pSPE(b0), brouillon95: pSPE(b95) });
        expect(m.brouillon0).toBe(80);
        expect(m.brouillon95).toBe(80);   // avant #706 : 100
    });

    it('C6 · DEN — brouillons, reprises, points : aucun effet (78 dans tous les cas) ; SOLO « Aucun » et `verrouillee` : lus nulle part dans pratiques/ [grep]', () => {
        const a = monter(jeuDEN());
        const jeu = jeuDEN(); Object.assign(jeu.evaluations.find(e => e.id === 'EV_W3'), BROUILLON95);
        const c = monter(jeu);
        noter('C6', { brouillon0: a.win.obtenirPratiqueParId('den-banc').calculerPerformance(DA.DEN), brouillon95: c.win.obtenirPratiqueParId('den-banc').calculerPerformance(DA.DEN) });
        expect(a.win.obtenirPratiqueParId('den-banc').calculerPerformance(DA.DEN)).toBe(0.78);
        expect(c.win.obtenirPratiqueParId('den-banc').calculerPerformance(DA.DEN)).toBe(0.78);
    });
});

/* =============================================================================================
   D · PAR FAMILLE, LA RÈGLE CONFIGURÉE CONTRE LA RÈGLE CALCULÉE
   ============================================================================================= */
describe('D · SOM', () => {
    it('D1 · pondérations 40 + 50 = 90 : la moyenne se normalise sur 90 (7860/90 = 87,33), pas sur 100 (78,6)', () => {
        const jeu = jeuSOM();
        jeu.productions = [{ id: 'P1', titre: 'Dissertation', ponderation: 40 }, { id: 'P2', titre: 'Examen', ponderation: 50 }];
        jeu.evaluations = jeu.evaluations.filter(e => ['EV_S1', 'EV_S2_OLD', 'EV_S2_NEW'].includes(e.id));
        const b = monter(jeu);
        const p = noter('D1', r2(b.win.obtenirPratiqueParId('sommative').calculerPerformance(DA.SOM) * 100));
        expect(p).toBe(87.33);
    });
    it('D2 · production évaluée deux fois (P1 : 84 puis 60, aucune remplacée) : les deux comptent, chacune au poids 40 → 11230/141 = 79,65 (↻ #706 : sans le brouillon ; avant 11230/142 = 79,08)', () => {
        const jeu = jeuSOM(); jeu.evaluations.push(ev('EV_S1B', DA.SOM, 'P1', 60, 'D'));
        const b = monter(jeu);
        const recit = b.win.obtenirPratiqueParId('sommative').decrireCalcul(DA.SOM);
        noter('D2', { P: r2(b.win.obtenirPratiqueParId('sommative').calculerPerformance(DA.SOM) * 100), comptees: recit.resultats.filter(x => x.sort === 'compte').length });
        expect(r2(b.win.obtenirPratiqueParId('sommative').calculerPerformance(DA.SOM) * 100)).toBe(79.65);   // avant #706 : 79.08
    });
    it('D3 · production à pondération 0 ou sans pondération : poids 1, comptée (le « poids 1 » de #483) — récit « poids 1 % »', () => {
        const b = monter(jeuSOM());
        const recit = b.win.obtenirPratiqueParId('sommative').decrireCalcul(DA.SOM);
        const p3 = recit.resultats.find(x => x.label === 'Exercice (pondération 0)');
        noter('D3', { detailP3: p3 && p3.detail });
        expect(p3.sort).toBe('compte');
        expect(p3.detail).toMatch(/poids 1 %/);
    });
});

describe('D · STD', () => {
    it('D4 · nombreARetenir 10 > 5 évaluations : moyenne de toutes → 77,32 (↻ #706 : brouillon écarté ; avant : brouillon compris, 69,9)', () => {
        const b = monter(jeuSTD({ nombreARetenir: 10 }));
        const d = b.win.calculerDetailsNoteFinale(DA.STD);
        noter('D4', { noteFinale: r2(d.noteFinale), retenus: d.portfolio.nombreRetenus, aRetenir: d.portfolio.nombreARetenir });
        expect(r2(d.noteFinale)).toBe(77.32);   // avant #706 : 69.9
        expect(d.portfolio.nombreRetenus).toBe(5);   // avant : 6
    });
    it('D5 · terminale absente des productions : note = pool seul 77,75, provisoire ; terminale présente non évaluée : 77,75, provisoire ; l\'export dit « provisoire »', () => {
        const sans = monter(jeuSTD({ sansTerminale: true }));
        const nonEval = monter(jeuSTD({ terminaleNonEvaluee: true }));
        const ds = sans.win.calculerDetailsNoteFinale(DA.STD), dn = nonEval.win.calculerDetailsNoteFinale(DA.STD);
        const l = nonEval.win._exportResultats.construireLignesSynthese([ETUDIANTS[1]], { pratiqueId: 'std-banc' }, nonEval.win.simulerIndices)[0];
        noter('D5', { sansTerminale: { note: r2(ds.noteFinale), provisoire: ds.estProvisoire, terminalePresente: ds.terminal.present }, nonEvaluee: { note: r2(dn.noteFinale), provisoire: dn.estProvisoire }, export: [l[8], l[9]] });
        expect(r2(ds.noteFinale)).toBe(77.75); expect(ds.estProvisoire).toBe(true);
        expect(r2(dn.noteFinale)).toBe(77.75); expect(dn.estProvisoire).toBe(true);
        expect(l[9]).toBe('provisoire');
    });
    it('D6 · égalité à la coupure (N = 2 : 85 | 78, 78) : l\'ordre de stockage départage — A3 retenu, A5 écarté, note identique 81,7', () => {
        // À la main : (85 + 78) / 2 = 81,5 → 81,5×0,6 + 32,8 = 48,9 + 32,8 = 81,7.
        const b = monter(jeuSTD({ nombreARetenir: 2 }));
        const d = b.win.calculerDetailsNoteFinale(DA.STD);
        const p = b.win.obtenirPratiqueParId('standards').calculerPerformance(DA.STD);
        noter('D6', { note: r2(d.noteFinale), retenus: d.portfolio.artefactsRetenus.map(a => a.productionId), registreP: r2(p * 100) });
        expect(r2(d.noteFinale)).toBe(81.7);
        expect(d.portfolio.artefactsRetenus.map(a => a.productionId)).toEqual(['A1', 'A3']);
        expect(r2(p * 100)).toBe(81.7);
    });
    it('D7 · la reprise plus faible (90 → 70) remplace une évaluation déjà retenue : 82,45 → 79,45 (récence, décision documentée) ; la SOM même chose', () => {
        const jeu = jeuSTD(); jeu.evaluations = jeu.evaluations.filter(e => e.id !== 'EV_A4_NEW'); delete jeu.evaluations.find(e => e.id === 'EV_A4_OLD').remplaceeParId;
        const avant = monter(jeu); const apres = monter(jeuSTD());
        noter('D7', { sansReprise: r2(avant.win.calculerDetailsNoteFinale(DA.STD).noteFinale), avecReprise: r2(apres.win.calculerDetailsNoteFinale(DA.STD).noteFinale) });
        expect(r2(avant.win.calculerDetailsNoteFinale(DA.STD).noteFinale)).toBe(82.45);
        expect(r2(apres.win.calculerDetailsNoteFinale(DA.STD).noteFinale)).toBe(79.45);
    });
});

describe('D · SPE', () => {
    it('D8 · bundle dont une pièce manque (pas de dossier) : C (60) ; palier atteint puis perdu par une reprise plus faible : B (80) → C+ (70)', () => {
        const sansDossier = monter(jeuSPE({ sansDossier: true }));
        const jeuAvant = jeuSPE(); jeuAvant.evaluations = jeuAvant.evaluations.filter(e => e.id !== 'EV_D2_NEW'); delete jeuAvant.evaluations.find(e => e.id === 'EV_D2_OLD').remplaceeParId;
        const avant = monter(jeuAvant); const apres = monter(jeuSPE());
        const m = noter('D8', { sansDossier: pSPE(sansDossier), avantReprise: pSPE(avant), apresReprise: pSPE(apres) });
        expect(m.sansDossier).toBe(60); expect(m.avantReprise).toBe(80); expect(m.apresReprise).toBe(70);
    });
    it('D9 · une SPE dans la forme du gabarit et de l\'éditeur (`forfaits`, ids numériques) CALCULE (↻ #708) : C = 60 (avant : 0 pour tout le monde, « constructible », exporté « 0 final »)', () => {
        // À la main, APRÈS #708 (seuil 70 à la racine) : « Dissertation » s'apparie par NOM aux productions
        // de type `dissertation` → D1 80 ✓, D2 reprise 65 ✗ → 1 ; « Examen » → X1 90 ✓ (X2 brouillon écarté) → 1 ;
        // A {1:2, 2:1} ✗, C {1:1, 2:1} ✓ → 60. AVANT : `forfaits` n'était lu nulle part → repli `indicesCP.P || 0` → 0.
        const jeu = jeuSPE(); jeu.pratiques = [pratiqueSPEGabarit()]; jeu.pratiqueId = 'spe-gabarit';
        const b = monter(jeu);
        b.win.calculerEtStockerIndicesCP(); const p = b.win.calculerEtStockerIndicesCP()[DA.SPE].actuel;
        const s = b.win.simulerIndices(DA.SPE, 'spe-gabarit');
        const l = b.win._exportResultats.construireLignesSynthese([ETUDIANTS[2]], { pratiqueId: 'spe-gabarit' }, b.win.simulerIndices)[0];
        noter('D9', { configurableP: b.win.obtenirPratiqueParId('spe-gabarit').calculerPerformance(DA.SPE), indicesP: p.P, noteConstructible: p.noteConstructible, simule: { P: s.P, noteConstructible: s.noteConstructible }, export: [l[8], l[9]], recit: b.win.obtenirPratiqueParId('spe-gabarit').decrireCalcul(DA.SPE) });
        expect(p.P).toBe(60); expect(p.noteConstructible).toBe(true);   // avant #708 : P 0
        expect(l[8]).toBe(60); expect(l[9]).toBe('final');               // avant #708 : [0, 'final']
    });
});

describe('D · DEN', () => {
    it('D10 · aucun jugement saisi → null partout (jamais 0 ni une moyenne) ; profil P 0 « non constructible » ; export vide', () => {
        const b = monter(jeuDEN({ sansSaisie: true }));
        const m = noter('D10', mesurerEleve(b, DA.DEN, 'den-banc'));
        expect(m.configurableP).toBeNull();
        expect(m.indicesPasse2).toEqual({ P: 0, noteConstructible: false });
        expect(m.export).toEqual({ note: '', statut: 'non constructible' });
        expect(m.simule.noteConstructible).toBe(false);
    });
    it('D11 · une cible non confirmée plafonne à 59 ; des identifiants de cibles CHANGÉS dans la config (la saisie garde les anciens) plafonnent aussi à 59, sans un mot', () => {
        const nonConfirmee = monter(jeuDEN({ ciblesAtteintes: { 'cible-1': true, 'cible-2': false } }));
        const idsChanges = monter(jeuDEN({ ciblesConfig: [{ id: 'cible-A', nom: 'Lire' }, { id: 'cible-B', nom: 'Écrire' }] }));
        const recit = idsChanges.win.obtenirPratiqueParId('den-banc').decrireCalcul(DA.DEN);
        const m = noter('D11', { nonConfirmee: nonConfirmee.win.obtenirPratiqueParId('den-banc').calculerPerformance(DA.DEN) * 100, idsChanges: idsChanges.win.obtenirPratiqueParId('den-banc').calculerPerformance(DA.DEN) * 100, recitIdsChanges: recit.resultats.map(x => x.sort), plafonnement: recit.synthese.plafonnement });
        expect(m.nonConfirmee).toBe(59);
        expect(m.idsChanges).toBe(59);
        expect(m.recitIdsChanges).toEqual(['ecarte', 'ecarte']);
    });
});

/* =============================================================================================
   E · L'ÉCHELLE DE LA NOTE GLOBALE
   ============================================================================================= */
describe('E · dans quoi la note du cours se lit', () => {
    it('E1 · STD : 79,46 → M (75-89) ; 89,5 et 74,5 → AUCUN niveau (trous entre bornes entières) là où une copie prend « le plus proche » (#701, banc B1 du premier audit)', () => {
        const b = monter(jeuSTD());
        const lire = (pct) => { const l = b.win.lireNiveauNoteGlobale(DA.STD, pct); return { niveau: l.niveau ? l.niveau.code : null, raison: l.raison }; };
        const m = noter('E1', { n7946: lire(79.46), n895: lire(89.5), n745: lire(74.5), n75: lire(75), n89: lire(89) });
        expect(m.n7946.niveau).toBe('M');
        expect(m.n895.niveau).toBeNull(); expect(m.n895.raison).toBe('hors-echelle');
        expect(m.n745.niveau).toBeNull();
        expect(m.n75.niveau).toBe('M'); expect(m.n89.niveau).toBe('M');
    });
    it('E2 · STD : l\'échelle de la note globale est celle des évaluations ENREGISTRÉES, texte de rétroaction ou pas — valeur d\'après #718 (constat d\'origine : sans texte, « aucune évaluation retenue », pas de niveau)', () => {
        // ↻ Valeur D'APRÈS #718 (lot A du 16 sept. 2026) : `obtenirEchelleCommuneDesEvaluations` lit `evaluationEntreDansLaNote`,
        // plus `e.retroactionFinale` — quatre copies sans texte situent 79,45 sur leur échelle : M. Avant : null, « aucune-evaluation ».
        const jeu = jeuSTD(); jeu.evaluations.forEach(e => { e.retroactionFinale = ''; });
        const b = monter(jeu);
        const l = b.win.lireNiveauNoteGlobale(DA.STD, 79.45);
        const commune = b.win.obtenirEchelleCommuneDesEvaluations(DA.STD);
        noter('E2', { niveau: l.niveau && l.niveau.code, raison: l.raison, survol: l.survol, raisonCommune: commune.raison });
        expect(l.niveau && l.niveau.code).toBe('M');   // avant : null
        expect(commune.raison).toBeNull();             // avant : 'aucune-evaluation'
    });
    it('E3 · échelle remplacée (#648) : les évaluations désignent E1, le trimestre porte E2 { idOriginal: E1 } → résolue, niveau M ; E1 disparue sans successeur → « échelle non résolue »', () => {
        const E2 = Object.assign(clone(E1), { id: 'E2', idOriginal: 'E1', nom: 'IDME remplacée' });
        const remplacee = monter(jeuSTD(), { echelles: [E2] });
        const disparue = monter(jeuSTD(), { echelles: [] });
        const lr = remplacee.win.lireNiveauNoteGlobale(DA.STD, 79.45), ld = disparue.win.lireNiveauNoteGlobale(DA.STD, 79.45);
        const m = noter('E3', { remplacee: { niveau: lr.niveau && lr.niveau.code, raison: lr.raison }, disparue: { niveau: ld.niveau, raison: ld.raison } });
        expect(m.remplacee.niveau).toBe('M');
        expect(m.disparue.niveau).toBeNull(); expect(m.disparue.raison).toBe('echelle-non-resolue');
    });
    it('E4 · SOM → « note-chiffree » (décision du 27 août) ; SPE → « pratique-sans-methode » ; les deux sans niveau, comme voulu', () => {
        const som = monter(jeuSOM()), spe = monter(jeuSPE());
        const ls = som.win.lireNiveauNoteGlobale(DA.SOM, 86.57), lp = spe.win.lireNiveauNoteGlobale(DA.SPE, 70);
        noter('E4', { SOM: ls.raison, SPE: lp.raison });
        expect(ls.raison).toBe('note-chiffree'); expect(lp.raison).toBe('pratique-sans-methode');
    });
    it('E5 · DEN : la pratique ASSIGNÉE (configurable de dénotation) répond « note-chiffree » — le jugement 78 ne se lit dans aucune échelle (avant N1a : « M », par une PratiquePANStandards fabriquée)', () => {
        // ↻ Lot N7 (23 sept. 2026) : `obtenirPratiqueActuelle` est retirée ; la dénotation passe par la branche
        // « autre famille » de `lireEchelleNoteGlobale`, qui interroge la pratique que rend LA résolution.
        const b = monter(jeuDEN());
        const l = b.win.lireNiveauNoteGlobale(DA.DEN, 78);
        const propre = b.win.obtenirPratiqueParId('den-banc').obtenirEchelleNoteGlobale(DA.DEN);
        noter('E5', { niveau: l.niveau && l.niveau.code, raison: l.raison, raisonConfigurable: propre.raison });
        expect(b.win.resoudrePratiqueActive().pratique.obtenirId()).toBe('den-banc');
        expect(l.niveau).toBeNull();
        expect(l.raison).toBe('note-chiffree');
        expect(propre.raison).toBe('note-chiffree');
    });
    it('E6 · STD configurable dont l\'echelleId ne se résout pas (↻ #590, 11 oct. : plus d\'IDME codée en dur) : l\'échelle embarquée est VIDE et marquée introuvable, la pratique se charge, elle ne situe rien ; le calcul n\'y touche pas', () => {
        const b = monter(jeuSTD({ echelleId: 'ECHELLE_DISPARUE' }));
        const inst = b.win.obtenirPratiqueParId('std-banc');
        const situe = b.win.situerPourcentageDansEchelle(79.45, inst.config.echelle);
        noter('E6', { echelleEmbarquee: inst.config.echelle && inst.config.echelle.niveaux.map(n => n.code + ':' + n.valeur_pourcentage), situe, note: r2(b.win.calculerDetailsNoteFinale(DA.STD).noteFinale) });
        expect(inst, 'la pratique doit encore se charger').not.toBeNull();
        expect(inst.config.echelle.niveaux).toEqual([]);
        expect(inst.config.echelle.introuvable).toBe(true);
        expect(inst.config.echelle.echelle_id).toBe('ECHELLE_DISPARUE');
        expect(situe).toBeNull();
        expect(r2(b.win.calculerDetailsNoteFinale(DA.STD).noteFinale)).toBe(79.45);
    });
});

/* =============================================================================================
   F · NON CALCULABLE — le premier calcul d'un trimestre
   ============================================================================================= */
describe('F · le zéro qui a l\'air d\'un résultat', () => {
    it('F1 · SOM et SPE configurables, PREMIÈRE passe d\'indices (cache indicesCP vide) : le bon nombre dès la première passe (↻ #709 ; avant : 0 « constructible », puis le bon nombre à la seconde)', () => {
        const som = monter(jeuSOM()), spe = monter(jeuSPE());
        const s1 = som.win.calculerEtStockerIndicesCP()[DA.SOM].actuel, s2 = som.win.calculerEtStockerIndicesCP()[DA.SOM].actuel;
        const p1 = spe.win.calculerEtStockerIndicesCP()[DA.SPE].actuel, p2 = spe.win.calculerEtStockerIndicesCP()[DA.SPE].actuel;
        noter('F1', { SOM: [{ P: s1.P, c: s1.noteConstructible }, { P: s2.P, c: s2.noteConstructible }], SPE: [{ P: p1.P, c: p1.noteConstructible }, { P: p2.P, c: p2.noteConstructible }] });
        expect([s1.P, s1.noteConstructible]).toEqual([87, true]);   // avant #709 : [0, true]
        expect([s2.P, s2.noteConstructible]).toEqual([87, true]);
        expect([p1.P, p1.noteConstructible]).toEqual([70, true]);   // avant #709 : [0, true]
        expect([p2.P, p2.noteConstructible]).toEqual([70, true]);
    });
    it('F2 · l\'export appelé AVANT toute passe d\'indices (élève ajouté, données importées) : « 87, final » d\'emblée (↻ #709 ; avant : « 0, final », puis « 87, final » après une passe)', () => {
        const b = monter(jeuSOM());
        const avant = b.win._exportResultats.construireLignesSynthese([ETUDIANTS[0]], { pratiqueId: 'som-banc' }, b.win.simulerIndices)[0];
        b.win.calculerEtStockerIndicesCP();
        const apres = b.win._exportResultats.construireLignesSynthese([ETUDIANTS[0]], { pratiqueId: 'som-banc' }, b.win.simulerIndices)[0];
        noter('F2', { avant: [avant[8], avant[9]], apres: [apres[8], apres[9]] });
        expect([avant[8], avant[9]]).toEqual([87, 'final']);   // avant #709 : [0, 'final']
        expect([apres[8], apres[9]]).toEqual([87, 'final']);
    });
    it('F3 · l\'export arrondit à l\'ENTIER (P) : 86,57 → 87 ; 79,45 → 79, alors que la section « Note finale de session » du profil affiche « 79.4 » (79,45 flottant → toFixed(1))', () => {
        const std = monter(jeuSTD()); std.win.calculerEtStockerIndicesCP(); std.win.calculerEtStockerIndicesCP();
        const l = std.win._exportResultats.construireLignesSynthese([ETUDIANTS[1]], { pratiqueId: 'std-banc' }, std.win.simulerIndices)[0];
        const brute = std.win.calculerDetailsNoteFinale(DA.STD).noteFinale;
        const profil = brute.toFixed(1);
        noter('F3', { export: l[8], profilSection: profil, brute, indiceP: std.win.calculerTousLesIndices(DA.STD).P });
        expect(l[8]).toBe(79); expect(profil).toBe('79.4'); expect(brute).toBeCloseTo(79.45, 10);
    });
});

/* =============================================================================================
   G · LES JETONS DÉCIDENT QUELLE ÉVALUATION COMPTE
   ============================================================================================= */
describe('G · reprise, retrait, héritage', () => {
    it('G1 · retirer le jeton de la reprise (90) restaure l\'originale (50) : la note SOM passe de 87,43 à 63,66 (6430/101 ; ↻ #706 sans le brouillon — avant 86,57 → 63,04) — l\'originale n\'est plus « remplacée »', async () => {
        const b = monter(jeuSOM(), { avecJetons: true });
        const avant = r2(b.win.obtenirPratiqueParId('sommative').calculerPerformance(DA.SOM) * 100);
        const ok = await b.win.retirerJetonReprise('EV_S2_NEW');
        const evals = b.store.test_evaluationsSauvegardees;
        const orig = evals.find(e => e.id === 'EV_S2_OLD');
        const apres = r2(b.win.obtenirPratiqueParId('sommative').calculerPerformance(DA.SOM) * 100);
        noter('G1', { ok, avant, apres, origRemplacee: orig.remplaceeParId, origArchivee: orig.archivee, repriseSubsiste: !!evals.find(e => e.id === 'EV_S2_NEW'), notifs: b.notifs.map(n => n.type + ':' + n.t) });
        expect(ok).toBe(true); expect(avant).toBe(87.43); expect(apres).toBe(63.66);   // avant #706 : 86.57 → 63.04
        expect(orig.remplaceeParId).toBeUndefined(); expect(orig.archivee).toBeUndefined();
    });
    it('G2 · (N2, ↻ #720) la reprise ne recopie plus `jetonDelaiApplique` : après un jeton de délai puis une reprise, l\'élève a « 1 » délai utilisé pour un accordé (avant #720 : 2)', async () => {
        const jeu = jeuSOM(); jeu.evaluations = [ev('EV_ORIG', DA.SOM, 'P1', 60, 'D', { jetonDelaiApplique: true, delaiAccorde: true })];
        const b = monter(jeu, { avecJetons: true });
        const avant = b.win.compterJetonsUtilises(DA.SOM, 'delai');
        const reprise = await b.win.appliquerJetonReprise('EV_ORIG');
        const apres = b.win.compterJetonsUtilises(DA.SOM, 'delai');
        noter('G2', { avant, apres, repriseHerite: reprise && reprise.jetonDelaiApplique, repriseNote: reprise && reprise.noteFinale, repriseVerrou: reprise && reprise.verrouillee });
        expect(avant).toBe(1); expect(apres).toBe(1);   // avant #720 : 2
        expect(reprise.jetonDelaiApplique).toBeUndefined(); expect(reprise.delaiAccorde).toBeUndefined();
        expect(reprise.noteFinale).toBe(60); expect(reprise.verrouillee).toBe(false);
    });
    it('G3 · (N5, ↻ #724) une originale déjà « remplacée » par réconciliation (#360) ne reçoit plus de jeton de reprise : refus, rien d\'écrit (avant #724 : reprise créée avec `remplaceeParId` hérité — invisible au calcul)', async () => {
        const jeu = jeuSOM(); jeu.evaluations = [ev('EV_SURV', DA.SOM, 'P1', 80, 'M'), ev('EV_DOUBLON', DA.SOM, 'P1', 80, 'M', { remplaceeParId: 'EV_SURV', reconcilieParDoublon: true })];
        const b = monter(jeu, { avecJetons: true });
        const reprise = await b.win.appliquerJetonReprise('EV_DOUBLON');
        const p = r2(b.win.obtenirPratiqueParId('sommative').calculerPerformance(DA.SOM) * 100);
        noter('G3', { repriseCreee: !!reprise, nbEvals: b.store.test_evaluationsSauvegardees.length, notifs: b.notifs.map(n => n.type + ':' + n.t), P: p });
        expect(reprise).toBeNull();   // avant #724 : reprise créée, remplaceeParId === 'EV_SURV'
        expect(b.store.test_evaluationsSauvegardees.map(e => e.id)).toEqual(['EV_SURV', 'EV_DOUBLON']);
        expect(b.notifs.map(n => n.type)).toEqual(['erreur']);
    });
    it('G4 · (N8) `archiverOriginale: false` supprime l\'originale et laisse `repriseDeId` pointer un id disparu ; retirer ensuite le jeton nettoie sans restaurer', async () => {
        const jeu = jeuSOM(); jeu.evaluations = [ev('EV_ORIG', DA.SOM, 'P1', 60, 'D')];
        const b = monter(jeu, { avecJetons: true });
        const reprise = await b.win.appliquerJetonReprise('EV_ORIG', false);
        const origSubsiste = !!b.store.test_evaluationsSauvegardees.find(e => e.id === 'EV_ORIG');
        const ok = await b.win.retirerJetonReprise(reprise.id);
        const apres = b.store.test_evaluationsSauvegardees.find(e => e.id === reprise.id);
        noter('G4', { repriseDeId: reprise.repriseDeId, origSubsiste, retrait: ok, apres: apres && { repriseDeId: apres.repriseDeId, jeton: apres.jetonRepriseApplique, note: apres.noteFinale }, notifs: b.notifs.map(n => n.t) });
        expect(reprise.repriseDeId).toBe('EV_ORIG'); expect(origSubsiste).toBe(false);
        expect(apres.repriseDeId).toBeUndefined(); expect(apres.noteFinale).toBe(60);
    });
    it('G5 · (H2, #563, ↻ #725, ↻ lot B) écriture refusée au retrait : AUCUNE notification du module — l\'échec est dit par le témoin commun de `sauvegarderDonneesSelonMode` (avant #725 : « succès » d\'abord, puis l\'erreur ; avant le lot B : « Modification non enregistrée »)', async () => {
        const b = monter(jeuSOM(), { avecJetons: true, refuserEcriture: true });
        const ok = await b.win.retirerJetonReprise('EV_S2_NEW');
        noter('G5', { ok, notifs: b.notifs.map(n => n.type + ':' + n.t) });
        expect(ok).toBe(false);
        expect(b.notifs.map(n => n.type)).toEqual([]);   // avant #725 : ['succes', 'erreur'] ; avant le lot B : ['erreur']
    });
    it('G6 · (↻ #617) écriture refusée au retrait : le fichier de la reprise RESTE actif, l\'évaluation aussi (avant #617 : fichier à la corbeille, évaluation intacte)', async () => {
        const b = monter(jeuSOM(), { avecJetons: true, refuserEcriture: true, avecFichiers: true, store: { test_fichiersTravaux: [{ id: 'F_REP', evaluationId: 'EV_S2_NEW', etudiantDA: DA.SOM, productionId: 'P2' }] } });
        await b.win.retirerJetonReprise('EV_S2_NEW');
        const repriseSubsiste = !!b.store.test_evaluationsSauvegardees.find(e => e.id === 'EV_S2_NEW');
        noter('G6', { fichiers: b.fichiers, repriseSubsiste });
        expect(b.fichiers).toEqual([]);   // avant #617 : [{ id: 'F_REP', geste: 'corbeille' }]
        expect(repriseSubsiste).toBe(true);
    });
    it('G7 · (N6, N7, H3) lire le statut des jetons ÉCRIT la clé NUE `jetonsEtudiants` ; « attribuer » un jeton prédéfini y écrit aussi, sans que le compte affiché en tienne compte', () => {
        const b = monter(jeuSOM(), { avecJetons: true });
        const avant = b.ecritures.length;
        const statut = b.win.obtenirStatutJetonsEtudiant(DA.SOM);
        const ecritParLecture = b.ecritures.slice(avant);
        const ok = b.win.attribuerJetonPersonnalise(DA.SOM, 'delai', 'test');
        const statutApres = b.win.obtenirStatutJetonsEtudiant(DA.SOM);
        noter('G7', { ecritParLecture, types: Object.keys(statut), attribue: ok, storeJetons: b.store.jetonsEtudiants && b.store.jetonsEtudiants[DA.SOM].delai, delaiUtilisesAffiche: statutApres.delai.utilises, typesPersonnalises: Object.keys(statut).length });
        expect(ecritParLecture).toEqual(['jetonsEtudiants']);
        expect(ok).toBe(true);
        expect(b.store.jetonsEtudiants[DA.SOM].delai).toBe(1);
        expect(statutApres.delai.utilises).toBe(0);
        expect(Object.keys(statut)).toEqual(['delai', 'reprise', 'repriseCiblee']);   // H1 : aucun type personnalisé n'existe
    });
    it('G8 · `archivee` n\'est lu par aucun calcul ; la seule décision est `remplaceeParId` — une originale « archivée » sans `remplaceeParId` compte', () => {
        const jeu = jeuSOM(); delete jeu.evaluations.find(e => e.id === 'EV_S2_OLD').remplaceeParId;
        const b = monter(jeu);
        // À la main : les deux P2 comptent (50×60 + 90×60) → (3360 + 3000 + 5400 + 70) / (40+60+60+1) = 11830/161 = 73,48
        // (↻ #706 : sans le brouillon ; avant 11830/162 = 73,02).
        const p = noter('G8', r2(b.win.obtenirPratiqueParId('sommative').calculerPerformance(DA.SOM) * 100));
        expect(p).toBe(73.48);   // avant #706 : 73.02
    });
});
