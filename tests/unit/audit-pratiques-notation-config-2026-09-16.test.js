/**
 * AUDIT — pratiques de notation : configuration et discours (16 septembre 2026) — banc d'exécution.
 *
 * Rapport : Rapports/AUDIT-pratiques-notation-configuration-et-discours-2026-09-16.md. Cadré par
 * Rapports/prompts-audit/PROMPT-AUDIT-pratiques-notation-configuration-et-discours-2026-09-16.md.
 * Ce banc ne juge pas et ne corrige rien : il charge les modules RÉELS de js/ (dont l'ASSISTANT
 * wizard-pratique-v2.js et la bibliothèque) dans le bac à sable du banc du 5 septembre, crée des
 * pratiques par l'assistant depuis des réponses NON par défaut, les fait calculer par le moteur, puis
 * les rouvre et les ré-enregistre pour mesurer ce qui survit. L'ATTENDU est écrit à la main dans le
 * commentaire qui précède chaque mesure, AVANT le code ; les `expect` sont les valeurs OBTENUES.
 *
 * DEVENU SENTINELLE LE 17 SEPT. 2026 (lot 28, 1.142.24). A3 et B2 portent maintenant les valeurs JUSTES,
 * que leur correctif a rendues vraies. Les autres mesures gardent leurs valeurs — dont des valeurs
 * FAUSSES, figées exprès : chacune nomme en commentaire le constat qu'elle fige et sa fiche. Le jour où
 * la fiche est livrée, la mesure rougit : c'est voulu, on y pose alors la valeur juste.
 * En fin de fichier, G-1 : le tour complet par famille (écrit = relu = calculé), huit mutations rouges.
 *
 *   cd tests && npx vitest run unit/audit-pratiques-notation-config-2026-09-16.test.js
 */
import { describe, it, expect, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerAvecInterne, fauxDocument, dbBanc } from './_helpers/bac-suivi.js';
import { pontsResolution } from './_helpers/ponts-resolution.js';   // lot N1a (21 sept. 2026)
import { tranche } from './_helpers/tranche.js';   // lot N4 (23 sept. 2026)

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MESURES = {};
function noter(cle, valeur) { MESURES[cle] = valeur; return valeur; }
afterAll(() => { console.log('AUDIT-PNC-MESURES ' + JSON.stringify(MESURES, null, 1)); });
const clone = (x) => JSON.parse(JSON.stringify(x));
const r2 = (x) => (typeof x === 'number' ? Math.round(x * 100) / 100 : x);

/** Diff plat de deux objets (chemins pointés), tableaux comparés en bloc. */
function aplatir(o, prefixe = '', out = {}) {
    if (o === null || typeof o !== 'object' || Array.isArray(o)) { out[prefixe || '(racine)'] = o; return out; }
    for (const k of Object.keys(o)) aplatir(o[k], prefixe ? prefixe + '.' + k : k, out);
    return out;
}
function diff(a, b, ignorer = ['dateCreation']) {
    const fa = aplatir(a), fb = aplatir(b), res = [];
    for (const k of new Set([...Object.keys(fa), ...Object.keys(fb)])) {
        if (ignorer.some(i => k === i || k.startsWith(i + '.'))) continue;
        const va = JSON.stringify(fa[k]), vb = JSON.stringify(fb[k]);
        if (va !== vb) res.push({ chemin: k, avant: fa[k] === undefined ? '(absent)' : fa[k], apres: fb[k] === undefined ? '(absent)' : fb[k] });
    }
    return res.sort((x, y) => x.chemin.localeCompare(y.chemin));
}

/** Lot N4 (#713) — le statut d'export d'une spécification sans types ni forfaits (la cause, nommée). */
const STATUT_SANS_TYPES_NI_FORFAITS = 'non constructible – Ta pratique n\'a pas encore ses types de productions et ses forfaits : aucune note ne peut être calculée. Règle-les dans Conception → Pratiques de notation (clique sur la pratique).';
const DA = { SOM: '1000001', STD: '1000002', SPE: '1000003', DEN: '1000004' };
const ETUDIANTS = [
    { da: DA.SOM, nom: 'Sommative', prenom: 'Alice', groupe: '01', coursId: 'GC1' },
    { da: DA.STD, nom: 'Standards', prenom: 'Bruno', groupe: '01', coursId: 'GC1' },
    { da: DA.SPE, nom: 'Specifications', prenom: 'Chloé', groupe: '01', coursId: 'GC1' },
    { da: DA.DEN, nom: 'Denotation', prenom: 'Dani', groupe: '01', coursId: 'GC1' }
];
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
const BROUILLON0 = { noteFinale: 0, niveauFinal: '0', ponderationCouverte: 50, verrouillee: false,
    criteres: [{ critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: '0', ponderation: 50 }] };

/* Les jeux d'évaluations du 5 septembre (mêmes élèves, mêmes nombres) — SANS pratique : c'est l'assistant qui la crée. */
function jeuSOM() {
    return {
        productions: [
            { id: 'P1', titre: 'Dissertation', type: 'travail', ponderation: 40, dateEcheance: '2026-02-01' },
            { id: 'P2', titre: 'Examen', type: 'examen', ponderation: 60, dateEcheance: '2026-03-01' },
            { id: 'P3', titre: 'Exercice (pondération 0)', type: 'travail', ponderation: 0, dateEcheance: '2026-02-15' },
            { id: 'P4', titre: 'Quiz (sans pondération)', type: 'quiz', dateEcheance: '2026-02-20' }
        ],
        evaluations: [
            ev('EV_S1', DA.SOM, 'P1', 84, 'M'),
            ev('EV_S2_OLD', DA.SOM, 'P2', 50, 'I', { remplaceeParId: 'EV_S2_NEW', archivee: true }),
            ev('EV_S2_NEW', DA.SOM, 'P2', 90, 'E', { repriseDeId: 'EV_S2_OLD', jetonRepriseApplique: true, dateEvaluation: '2026-03-10T12:00:00.000Z' }),
            ev('EV_S3', DA.SOM, 'P3', 70, 'D'),
            ev('EV_S4', DA.SOM, 'P4', 0, '0', BROUILLON0)
        ]
    };
}
function jeuSTD(opts = {}) {
    const productions = [
        { id: 'PORT', titre: 'Portfolio', type: 'portfolio', ponderation: 60, regles: { nombreARetenir: 3, minimumCompletion: 1, nombreTotal: 6 } },
        { id: 'TERM', titre: 'Analyse finale', type: 'terminale', ponderation: 40, numero: 7, dateEcheance: '2026-05-01' }
    ];
    for (let i = 1; i <= 6; i++) productions.push({ id: 'A' + i, titre: 'Artefact ' + i, type: 'artefact-portfolio', numero: i, ponderation: 0, dateEcheance: '2026-0' + (1 + Math.floor(i / 3)) + '-1' + i });
    const d = (j) => ({ dateEvaluation: '2026-0' + (1 + Math.floor(j / 3)) + '-1' + j + 'T12:00:00.000Z' });
    const evaluations = [
        ev('EV_A1', DA.STD, 'A1', 85, 'M', d(1)),
        ev('EV_A2', DA.STD, 'A2', 60, 'D', d(2)),
        ev('EV_A3', DA.STD, 'A3', 78, 'M', d(3)),
        ev('EV_A4_OLD', DA.STD, 'A4', 90, 'E', { remplaceeParId: 'EV_A4_NEW', archivee: true }),
        ev('EV_A4_NEW', DA.STD, 'A4', 70, 'D', Object.assign({ repriseDeId: 'EV_A4_OLD', jetonRepriseApplique: true }, d(4))),
        ev('EV_A5', DA.STD, 'A5', 78, 'M', d(5)),
        ev('EV_A6', DA.STD, 'A6', 0, '0', opts.a6Valide ? Object.assign({ noteFinale: 95, niveauFinal: 'E' }, d(6)) : BROUILLON0),
        ev('EV_TERM', DA.STD, 'TERM', 82, 'M')
    ];
    return { productions, evaluations };
}
function jeuSPE() {
    return {
        productions: [
            { id: 'D1', titre: 'Dissertation 1', type: 'dissertation', dateEcheance: '2026-02-01' },
            { id: 'D2', titre: 'Dissertation 2', type: 'dissertation', dateEcheance: '2026-03-01' },
            { id: 'X1', titre: 'Examen 1', type: 'examen', dateEcheance: '2026-02-15' },
            { id: 'X2', titre: 'Examen 2', type: 'examen', dateEcheance: '2026-04-15' },
            { id: 'F1', titre: 'Dossier', type: 'dossier', dateEcheance: '2026-04-01' }
        ],
        evaluations: [
            ev('EV_D1', DA.SPE, 'D1', 80, 'M'),
            ev('EV_D2_OLD', DA.SPE, 'D2', 75, 'M', { remplaceeParId: 'EV_D2_NEW', archivee: true }),
            ev('EV_D2_NEW', DA.SPE, 'D2', 65, 'D', { repriseDeId: 'EV_D2_OLD', jetonRepriseApplique: true }),
            ev('EV_X1', DA.SPE, 'X1', 90, 'E'),
            ev('EV_X2', DA.SPE, 'X2', 0, '0', BROUILLON0),
            ev('EV_F1', DA.SPE, 'F1', 72, 'D')
        ]
    };
}
function jeuDEN() {
    return {
        productions: [
            { id: 'W1', titre: 'Travail 1', type: 'travail', dateEcheance: '2026-02-01' },
            { id: 'W2', titre: 'Travail 2', type: 'travail', dateEcheance: '2026-03-01' }
        ],
        evaluations: [ev('EV_W1', DA.DEN, 'W1', 85, 'M'), ev('EV_W2', DA.DEN, 'W2', 90, 'E')]
    };
}

/* --------------------------------------------------------------------------------------------- */
const MODULES = ['js/pratiques/pratique-configurable.js', 'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js',
    'js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js', 'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js',
    'js/profil-etudiant-helpers.js', 'js/export-resultats-finaux.js', 'js/pratiques-bibliotheque.js', 'js/wizard-pratique-v2.js',
    'js/pratiques/construction-attributs.js'];
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
        test_groupesCours: [{ id: 'GC1', trimestreId: 'test', pratiqueId: opts.pratiqueId || null }],
        test_pratiquesConfigurables: clone(opts.pratiques || []),
        test_productions: clone(jeu.productions),
        test_evaluationsSauvegardees: clone(jeu.evaluations),
        test_echellesTemplates: [clone(E1)],
        test_grillesTemplates: [clone(GRILLE)],
        test_groupeEtudiants: clone(ETUDIANTS),
        test_jugementsDenotation: clone(opts.jugements || {}),
        test_modalitesEvaluation: clone(opts.modalites || {}),
        test_portfoliosEleves: {},
        bibliothequePratiques: [],
        infoCours: { id: 'GC1', nom: 'Cours banc', groupe: '01' }
    }, opts.store || {});
    const ecritures = [], notifs = [];
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
    const sauvegarderDonneesSelonMode = (k, v) => { store['test_' + k] = clone(v); ecritures.push('test_' + k); return true; };
    const document = {
        getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom(), readyState: 'complete'
    };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', dateLocaleYMD: () => '2026-09-16' };
    const fwd = (nom) => (...a) => win[nom](...a);
    let compteurId = 0;
    const globaux = {
        document, db, cle, obtenirDonneesSelonMode, sauvegarderDonneesSelonMode,
        echapperHtml: (s) => String(s == null ? '' : s),
        estEtudiantExclu: (e) => !!(e && e.exclu),
        obtenirPreference: () => null, obtenirSeuil: (n) => ({ 'defiSpecifique': 0.70, 'idme.insuffisant': 0.64, 'idme.developpement': 0.75 })[n],
        chargerSeuilsInterpretation: () => ({}), filtrerEtudiantsParMode: (a) => a, estModeeLectureSeule: () => false,
        obtenirEtudiantsCoursActif: () => clone(store.test_groupeEtudiants), genererSeancesCompletes() {},
        afficherSection() {}, afficherSousSection() {}, calculerEtSauvegarderIndicesAssiduite() {},
        notifications: { succes(t, m) { notifs.push({ type: 'succes', t, m }); }, erreur(t, m) { notifs.push({ type: 'erreur', t, m }); }, info() {}, warning() {} },
        confirm: () => true, genererIdUnique: (p) => p + 'NEUF' + (++compteurId),
        // #898 (lot 34) : adopter un modèle Standards sans échelle DEMANDE l'échelle. Le banc répond `opts.echelleAdoption`
        // (absent = la question est fermée sans choix : rien n'est adopté).
        uiDialogues: { demanderChoix: async () => (opts.echelleAdoption || null) },
        resoudreModeleParId: (type, id) => { const l = store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []; return clone(l.find(m => m && m.id === id) || null); },
        obtenirPratiqueActiveGroupeCours: () => (store.test_groupesCours[0].pratiqueId || null), ...pontsResolution(win, () => (store.test_groupesCours[0].pratiqueId || null)),
        obtenirPratiqueParId: fwd('obtenirPratiqueParId'), obtenirTypePratiqueActive: fwd('obtenirTypePratiqueActive'), normaliserIdPratique: fwd('normaliserIdPratique'),
        obtenirConfigPratiqueActive: fwd('obtenirConfigPratiqueActive'), obtenirConfigCategories: fwd('obtenirConfigCategories'), calculerNoteAvecCategories: fwd('calculerNoteAvecCategories'),
        calculerDetailsNoteFinale: fwd('calculerDetailsNoteFinale'), calculerEtStockerIndicesCP: fwd('calculerEtStockerIndicesCP'), simulerIndices: fwd('simulerIndices'),
        obtenirIndicesCP: fwd('obtenirIndicesCP'), calculerTousLesIndices: fwd('calculerTousLesIndices'),
        obtenirEchelleResolue: fwd('obtenirEchelleResolue'), obtenirTableConversionNiveaux: fwd('obtenirTableConversionNiveaux'),
        obtenirEchelleCommuneDesEvaluations: fwd('obtenirEchelleCommuneDesEvaluations'),
        obtenirIdsProductionsEvaluables: fwd('obtenirIdsProductionsEvaluables'), obtenirNombreProductionsPourPatterns: fwd('obtenirNombreProductionsPourPatterns'),
        obtenirToutesLesPratiquesBibliothequeSync: fwd('obtenirToutesLesPratiquesBibliothequeSync'), construireConfigComplete: fwd('construireConfigComplete')
    };
    const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', '_exportResultats', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT',
        'wizardState', 'ETAPES_WIZARD', 'TYPE_BADGES', 'MODELES_PRATIQUES_PREDEFINIS', 'ConstructionAttributs'];
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
    chargerScript('js/pratiques-bibliotheque.js', globaux, win);
    chargerScript('js/pratiques/construction-attributs.js', globaux, win);
    chargerScript('js/pratiques/editeur-cibles.js', globaux, win);   // lot N5 (#717)
    chargerScript('js/wizard-pratique-v2.js', globaux, win);
    return { win, store, ecritures, notifs, db };
}

/** Crée (ou ré-enregistre, si `pratiqueId`) une pratique par l'assistant RÉEL depuis des réponses. */
async function creerParAssistant(b, reponses, pratiqueId = null) {
    b.win.wizardState.reponses = clone(reponses);
    b.win.wizardState.pratiqueId = pratiqueId;
    b.win.wizardState.modeEdition = !!pratiqueId;
    await b.win.creerPratiqueV2();
    const liste = b.store.test_pratiquesConfigurables;
    return clone(pratiqueId ? liste.find(p => p.id === pratiqueId) : liste[liste.length - 1]);
}
/** Rouvre par l'assistant (chargerPratiqueExistante) puis ré-enregistre SANS toucher aux réponses. */
async function rouvrirEtResauver(b, id) {
    b.win.wizardState.reponses = {};
    b.win.chargerPratiqueExistante(id);
    const reponses = clone(b.win.wizardState.reponses);
    const apres = await creerParAssistant(b, reponses, id);
    return { reponses, apres };
}
function activer(b, id) { b.store.test_groupesCours[0].pratiqueId = id; }

/**
 * #903 (21 sept. 2026) — LE STOCK. L'assistant n'écrit plus le plafonnement, le remplacement ni les reprises :
 * ces essais ne peuvent plus les CRÉER par lui. Ils sèment donc l'objet que l'ancien assistant écrivait — capturé
 * sur le code de `fe3e884e` par l'ancien A1 de ce banc, pas réécrit de mémoire — et jugent ce qu'il devient.
 */
const STOCK_SOM_TROIS_REGLES = {
    id: 'STOCK_SOM', nom: 'SOM banc', auteur: 'A B', etablissement: '', description: '', discipline: '',
    type: 'sommative', variante: 'progressive', pratiques: ['SOM'], dansBibliotheque: true, dateCreation: '2026-09-17T12:00:00.000Z',
    configuration: { afficherRang: true, afficherMoyenneGroupe: true, reglesSommatives: ['remplacement', 'double_verrou', 'plafonnement'],
        remplacement: { actif: true, nbPaires: 3 },
        conditions_speciales: [
            { type: 'double_verrou', condition: { evaluation: 'Dissertation', comparateur: '<', seuil: 90 }, consequence: { action: 'echec', note_max: 50 } },
            { type: 'plafonnement', description: 'Examen non remis', consequence: { action: 'plafonner', valeur: 50 } }],
        reprises: { permises: true, mode: 'limite' } },
    calcul_note: { methode: 'moyenne_ponderee' },
    seuils: { type: 'pourcentage', va_bien: 80, difficulte: 70, grande_difficulte: 60 }, nbEvaluationsPrevues: 8,
    reglesSpeciales: ['remplacement', 'double_verrou', 'plafonnement']
};
function noteDe(b, da, id) {
    const inst = b.win.obtenirPratiqueParId(id);
    const perf = inst ? inst.calculerPerformance(da) : undefined;
    const details = b.win.calculerDetailsNoteFinale(da);
    const sim = b.win.simulerIndices(da, id);
    const ligne = b.win._exportResultats.construireLignesSynthese([ETUDIANTS.find(e => e.da === da)], { pratiqueId: id }, b.win.simulerIndices)[0];
    return { famille: inst ? inst.obtenirCode() : null, perf: r2(perf === null || perf === undefined ? perf : perf * 100),
        export: { note: ligne[8], statut: ligne[9] },
        riche: details ? (details.erreur ? { erreur: details.erreur } : r2(details.noteFinale)) : null,
        simule: sim ? { P: sim.P, noteFinale: r2(sim.noteFinale), noteConstructible: sim.noteConstructible } : null };
}

/* =============================================================================================
   A · TROIS ÉCRIVAINS, UN LECTEUR — l'assistant crée, le moteur lit, l'assistant rouvre et ré-enregistre
   ============================================================================================= */
describe('A · l\'assistant comme écrivain : ce qu\'il écrit, ce que le moteur en lit, ce qui survit à une réédition', () => {

    // A-1 ET A-2 LIVRÉS AU LOT 29 (17 sept. 2026, 1.142.25 — #897, #854) : les valeurs ci-dessous sont maintenant les JUSTES.
    it('A1 · SOM avec les trois règles spéciales et des valeurs non par défaut (stock semé depuis #903)', async () => {
        // L'objet porte configuration.remplacement.nbPaires = 3, conditions_speciales = [double_verrou {Dissertation < 90 →
        // note_max 50}, plafonnement {valeur 50}], reprises {permises:true, mode:'limite'}, seuils {80/70/60}, 8 évaluations.
        // construireConfigComplete renvoie ces conditions sous calcul_note.conditions_speciales (le seul lecteur du moteur).
        // Moyenne 8830/101 = 87,43 ; la Dissertation est à 84 < 90 → le verrou plafonne à 50, au profil ET à l'export.
        // Le plafonnement et le remplacement ne s'appliquent pas (#903) — et l'assistant ne les offre plus.
        // À la réédition : le verrou est relu, les trois règles retirées passent telles quelles → diff VIDE, la note reste 50.
        const b = monter(jeuSOM(), { pratiques: [STOCK_SOM_TROIS_REGLES] });
        const p0 = clone(STOCK_SOM_TROIS_REGLES);
        activer(b, p0.id);
        const inst = b.win.obtenirPratiqueParId(p0.id);
        const note = noteDe(b, DA.SOM, p0.id);
        const { reponses, apres } = await rouvrirEtResauver(b, p0.id);
        const d = diff(p0, apres, []);
        noter('A1', { ecrit: p0.configuration, seuils: p0.seuils, note, conditionsLuesParLeMoteur: inst.config.calcul_note.conditions_speciales || null, perdu: d });
        expect(inst.config.calcul_note.conditions_speciales).toEqual(p0.configuration.conditions_speciales);   // le moteur les voit
        expect(note.perf).toBe(50);                                               // verrou : 84 < 90 → max 50
        expect(note.simule.P).toBe(50);
        expect(note.export).toEqual({ note: 50, statut: 'final' });
        expect(reponses).toMatchObject({ reglesSommatives: ['double_verrou'], nomEvalVerrouillee: 'Dissertation', seuilVerrou: 90, plafondVerrou: 50 });
        for (const retire of ['nbPairesRemplacement', 'conditionPlafonnement', 'valeurPlafonnement', 'reprisesPermises']) expect(reponses[retire]).toBeUndefined();
        expect(d).toEqual([]);                                                    // rouvrir ne change rien, dateCreation comprise
        expect(apres.configuration.remplacement).toEqual({ actif: true, nbPaires: 3 });
        expect(apres.configuration.reprises).toEqual({ permises: true, mode: 'limite' });
        expect(apres.configuration.conditions_speciales).toHaveLength(2);
        expect(noteDe(b, DA.SOM, p0.id).perf).toBe(50);
    });

    it('A2 · STD « les N derniers », 4 sur 6, minimum 2, reprises limitées', async () => {
        // À LA MAIN : configuration.portfolio = {utiliser:true, nombreTotal:6, nombreARetenir:4, methodeSelection:'derniers',
        // minimumCompletion:2, reprisesPermises:'limite', hybride:false}, varianteCalcul 'n-recents', echelleId E1, grilleId G1.
        // Le chemin riche lit 'derniers' comme 'recents' (profil-etudiant-actions.js:182). Artefacts valides A1..A5 (A6 brouillon
        // exclu, #706), les 4 plus récents par date = A2, A3, A4, A5 → (60+78+70+78)/4 = 71,5 → 71,5×0,6 + 82×0,4 = 75,7.
        // Réédition : chargerPratiqueExistante relit les noms standardisés et 'derniers' → tout survit (attendu : diff vide).
        const b = monter(jeuSTD());
        const p0 = await creerParAssistant(b, { nom: 'STD banc', calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts', echelleId: 'E1', grilleId: 'G1',
            modeSelectionPortfolio: 'derniers', nbArtefactsSoumis: 6, nbArtefactsRetenus: 4, minAvantCalculFormatif: 2, reprisesPermises: 'limite', utiliserPortfolio: true });
        activer(b, p0.id);
        const note = noteDe(b, DA.STD, p0.id);
        const { apres } = await rouvrirEtResauver(b, p0.id);
        const d = diff(p0, apres);
        noter('A2', { ecrit: p0.configuration, note, perdu: d });
        expect(p0.configuration.portfolio.methodeSelection).toBe('derniers');
        expect(p0.configuration.varianteCalcul).toBe('n-recents');
        expect(note.riche).toBe(75.7);
        expect(d).toEqual([]);
    });

    // A-5 LIVRÉ LE 21 SEPT. 2026 (#715) : sous « tous », le chemin riche ne coupe plus à nombreARetenir — 77,32, la valeur JUSTE
    // (avant : 76,75, figée exprès). Les quatre lectures de la note s'accordent : profil, instance, simulerIndices, export.
    it('A2b · STD « tous » : le moteur retient tout, l\'enveloppe dit « n-meilleurs »', async () => {
        // À LA MAIN : methodeSelection 'tous' mais varianteCalcul 'n-meilleurs' (creerPratiqueV2 : « Par défaut »). Note : moyenne
        // des 5 valides (85+60+78+70+78)/5 = 74,2 → 44,52 + 32,8 = 77,32.
        const b = monter(jeuSTD());
        const p0 = await creerParAssistant(b, { nom: 'STD tous', calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts', echelleId: 'E1', grilleId: 'G1',
            modeSelectionPortfolio: 'tous', nbArtefactsSoumis: 6, nbArtefactsRetenus: 4, minAvantCalculFormatif: 2, utiliserPortfolio: true });
        activer(b, p0.id);
        const note = noteDe(b, DA.STD, p0.id);
        const attributs = b.win.ConstructionAttributs.extraire(b.win.construireConfigComplete(p0));
        noter('A2b', { methodeSelection: p0.configuration.portfolio.methodeSelection, varianteCalcul: p0.configuration.varianteCalcul, note, attributs });
        expect(p0.configuration.portfolio.methodeSelection).toBe('tous');
        expect(p0.configuration.varianteCalcul).toBe('n-meilleurs');
        // AVANT #715 : 76,75 = (85+60+78+70)/4 × 0,6 + 32,8 — le chemin riche coupait à nombreARetenir = 4 (les 4 premiers par
        // ordre de stockage), mesuré le 5 sept. en B-5. L'attribut affiché disait « 4 retenu(s) sur 2 minimum » à côté de « Méthode
        // de sélection : tous » ; il dit maintenant ce que le moteur fait (mots validés par Grégoire le 21 sept.).
        expect(attributs.attributs.find(x => x.axe === 'nbProductions').valeur).toBe('Toutes les productions évaluées (2 minimum)');
        expect(note.riche).toBe(77.32);
        expect(note.simule.noteFinale).toBe(77.32);
        expect(note.export).toEqual({ note: 77, statut: 'final' });
        // `note.perf` n'est pas jugé ici : dans ce banc, calculerPerformance rend null pour toute STD (A2 aussi — mesuré, cause
        // non cherchée). L'accord du chemin riche avec l'instance PAN-Standards est jugé par
        // sentinelle-715-tous-prend-toutes-les-productions.test.js.
    });

    it('A3 · SPE par l\'assistant : seuil 70, jetons 4/5 jours + délai sur reprise, 3 reprises', async () => {
        // À LA MAIN : configuration = {seuilAcceptabilite:70, jetons:{activer:true, delai:{nombre:4,dureeJours:5,surReprise:true}, reprise:{nombre:3}},
        // modeleBundle:'simple'} — NI typesTravaux NI forfaits/tableBundles : le moteur SPE ne peut compter aucun travail acceptable
        // ni trouver un palier → la note d'un élève qui a 4 évaluations valides est… à mesurer (0 ? null ?).
        // Réédition : chargerPratiqueExistante n'a PAS de branche 'specifications' → seuil réécrit parseInt(undefined)||100 = 100,
        // jetons {activer:false}, modeleBundle absent (#854 b, élargi au seuil).
        const b = monter(jeuSPE());
        const p0 = await creerParAssistant(b, { nom: 'SPE banc', calcNoteFinale: 'acceptable', seuilAcceptabilite: 70, utiliserJetons: true,
            nbJetonsDelai: 4, dureeDelaiJours: 5, delaiSurReprise: true, nbJetonsReprise: 3, modeleBundle: 'simple' });
        activer(b, p0.id);
        const note = noteDe(b, DA.SPE, p0.id);
        // Puis ce que la PAGE fait avant d'afficher un profil : une passe d'indices (calculerEtStockerIndicesCP), et on relit.
        b.win.calculerEtStockerIndicesCP();
        const cache = (b.store.test_indicesCP || {})[DA.SPE];
        const noteApresPasse = noteDe(b, DA.SPE, p0.id);
        const diag = b.win.calculerDetailsNoteFinale(DA.SPE);
        const { apres } = await rouvrirEtResauver(b, p0.id);
        const d = diff(p0, apres);
        noter('A3', { ecrit: p0.configuration, note, cacheApresPasse: cache && cache.actuel, noteApresPasse, diag: diag && diag.erreur, perdu: d });
        expect(p0.configuration.typesTravaux).toBeUndefined();      // FIGE A-3, le reste : l'assistant ne collecte ni types ni forfaits (#899)
        expect(p0.configuration.forfaits).toBeUndefined();
        // A-3 CORRIGÉ (1.142.24) — « non constructible » à la PREMIÈRE et à la DEUXIÈME passe. Avant : la passe d'indices
        // écrivait { P: 0, noteConstructible: false }, _lireIndiceStocke relisait ce 0 comme une note → « 0, final ».
        expect(note.export).toEqual({ note: '', statut: STATUT_SANS_TYPES_NI_FORFAITS });   // lot N4 : la cause est nommée
        expect(cache.actuel.P).toBe(0);
        expect(cache.actuel.noteConstructible).toBe(false);          // le cache porte bien le bouche-trou : la garde a quelque chose à garder
        expect(noteApresPasse.export).toEqual({ note: '', statut: STATUT_SANS_TYPES_NI_FORFAITS });
        expect(noteApresPasse.perf).toBeNull();
        expect(noteApresPasse.simule).toEqual({ P: 0, noteFinale: null, noteConstructible: false });
        // Champ additif (#394) : une entrée ANTÉRIEURE, sans le champ, reste lue comme une note.
        b.store.test_indicesCP = { [DA.SPE]: { actuel: { P: 64, C: 100 } } };
        expect(noteDe(b, DA.SPE, p0.id).perf).toBe(64);
        // CHEMIN FRÈRE D'A-3 (20 sept. 2026, rouge du runner GitHub sur « Flux E · SPE ») : le cache calculé SOUS UNE AUTRE
        // PRATIQUE (passe faite avant l'application, groupe-cours encore en « sommative ») n'est pas la note de celle-ci.
        // Avant : relu « 85, constructible » → « SPE, 85, final » à l'export, et la passe suivante le réécrivait tel quel.
        b.store.test_indicesCP = { [DA.SPE]: { actuel: { pratique: 'sommative', P: 85, C: 100, noteConstructible: true } } };
        const sousAutrePratique = noteDe(b, DA.SPE, p0.id);
        expect(sousAutrePratique.perf).toBeNull();
        expect(sousAutrePratique.export).toEqual({ note: '', statut: STATUT_SANS_TYPES_NI_FORFAITS });
        b.win.calculerEtStockerIndicesCP();                           // le stock se soigne seul à la passe suivante
        expect(b.store.test_indicesCP[DA.SPE].actuel).toMatchObject({ pratique: p0.id, P: 0, noteConstructible: false });
        // Témoin : le cache de CETTE pratique reste lu.
        b.store.test_indicesCP = { [DA.SPE]: { actuel: { pratique: p0.id, P: 64, C: 100, noteConstructible: true } } };
        expect(noteDe(b, DA.SPE, p0.id).perf).toBe(64);
        // A-4 CORRIGÉ (lot N4, #854 volet spécifications) : la réédition garde le seuil, les jetons et le modèle — diff vide.
        // Avant : seuil ramené à 100, jetons { activer: false }, modèle perdu.
        expect(d).toEqual([]);
        expect(apres.configuration.seuilAcceptabilite).toBe(70);
        expect(apres.configuration.jetons).toEqual({ activer: true, delai: { nombre: 4, dureeJours: 5, surReprise: true }, reprise: { nombre: 3 } });
        expect(apres.configuration.modeleBundle).toBe('simple');
    });

    // A-6 (#717) LIVRÉ au lot N5 (23 sept. 2026) : chaque cible garde l'id reçu à sa création. Avant : retirer la
    // première faisait de « Écrire » la `cible-1`, la coche de « Lire » glissait sur elle, et la note passait de 59 à 78.
    it('A4 · DEN : deux cibles, suggestion médiane, échelle et grille de rétroaction', async () => {
        // À LA MAIN : objectifs [{idL, Lire}, {idE, Écrire}] (ids reçus à la création), suggestion.methode 'mediane',
        // echelleId E1, grilleId G1, modeDEN 'eliminee'. Jugement 78 et les deux cibles confirmées → 78.
        // Réédition : la branche 'denotation' restaure tout, ids compris → diff vide.
        const b = monter(jeuDEN());
        const idL = b.win.EditeurCibles.nouvelId(), idE = b.win.EditeurCibles.nouvelId();
        const p0 = await creerParAssistant(b, { nom: 'DEN banc', calcNoteFinale: 'jugement', ciblesDenotation: [{ id: idL, nom: 'Lire' }, { id: idE, nom: 'Écrire' }], methodeSuggestionDen: 'mediane', echelleId: 'E1', grilleId: 'G1' });
        activer(b, p0.id);
        b.store.test_jugementsDenotation = { [p0.id]: { [DA.DEN]: { ciblesAtteintes: { [idL]: true, [idE]: false }, noteFinale: 78, justification: 'banc', date: '2026-05-01' } } };
        const note = noteDe(b, DA.DEN, p0.id);
        const { apres } = await rouvrirEtResauver(b, p0.id);
        const d = diff(p0, apres);
        // Puis l'enseignant RETIRE « Lire », la cible confirmée : « Écrire » garde son id et son absence de coche.
        b.win.wizardState.reponses = {}; b.win.chargerPratiqueExistante(p0.id);
        const reponses = clone(b.win.wizardState.reponses);
        const apres2 = await creerParAssistant(b, Object.assign(reponses, { ciblesDenotation: reponses.ciblesDenotation.filter(c => c.id !== idL) }), p0.id);
        const apresRetrait = noteDe(b, DA.DEN, p0.id).perf;
        noter('A4', { ecrit: p0.configuration, note, perdu: d, ciblesApresRetrait: apres2.configuration.objectifs, apresRetrait });
        expect(p0.configuration.objectifs).toEqual([{ id: idL, nom: 'Lire' }, { id: idE, nom: 'Écrire' }]);
        expect(note.perf).toBe(59);              // « Écrire » non confirmée → plafond RREC
        expect(d).toEqual([]);
        expect(apres2.configuration.objectifs).toEqual([{ id: idE, nom: 'Écrire' }]);
        expect(apresRetrait).toBe(59);           // la garde retrouve « Écrire » par son id (avant #717 : 78, sans un mot)
    });
});

/* =============================================================================================
   B · CE QUI EST OFFERT AU DÉPART — « Partir d'un modèle », puis calculer, puis rééditer
   ============================================================================================= */
describe('B · les modèles offerts, adoptés par l\'assistant, calculent-ils ?', () => {
    const JEU_PAR_TYPE = { sommative: [jeuSOM, DA.SOM], standards: [jeuSTD, DA.STD], specifications: [jeuSPE, DA.SPE], denotation: [jeuDEN, DA.DEN] };

    // B-1 LIVRÉ AU LOT 34 (17 sept. 2026, #898) : l'adoption d'un modèle Standards sans échelle DEMANDE l'échelle ; le banc
    // choisit E1. Les valeurs ci-dessous sont maintenant les JUSTES : instance construite, export « final », et la même note
    // au profil et au lecteur du Comparateur. (Avant : pas d'instance, export « non constructible », profil 77,32.)
    // Reste une MESURE pour B-3 (#713 : plancher 50).
    it('B1 · chaque modèle de MODELES_PRATIQUES_PREDEFINIS, adopté tel quel', async () => {
        const b0 = monter(jeuSOM());
        const modeles = b0.win.obtenirToutesLesPratiquesBibliothequeSync(true).filter(m => m.estGabarit);
        const res = {};
        for (const m of modeles) {
            const [jeu, da] = JEU_PAR_TYPE[b0.win.normaliserIdPratique(m.type)];
            const b = monter(jeu(), { echelleAdoption: 'E1' });
            const p0 = await creerParAssistant(b, { nom: 'Adoptée ' + m.id, _modeleAdopte: true, _gabaritSource: clone(m), modeleChoisi: m.id, calcNoteFinale: 'x' });
            activer(b, p0.id);
            if (p0.type === 'denotation') b.store.test_jugementsDenotation = { [p0.id]: { [da]: { ciblesAtteintes: Object.fromEntries((p0.configuration.objectifs || []).map(o => [o.id, true])), noteFinale: 78, justification: 'banc', date: '2026-05-01' } } };
            let note, erreur = null;
            try { note = noteDe(b, da, p0.id); } catch (e) { erreur = String(e && e.message); }
            const inst = b.win.obtenirPratiqueParId(p0.id);
            const details = b.win.calculerDetailsNoteFinale(da);
            res[m.id] = { type: p0.type, calcul_note: p0.calcul_note || '(absent)', echelleId: p0.configuration && p0.configuration.echelleId, instance: !!inst, note, erreur,
                diagnosticProfil: details && details.erreur ? details.erreur : null, badge: b.win.obtenirRepresentationPratique ? b.win.obtenirRepresentationPratique(p0.id) : undefined,
                seuilsLus: inst && inst.config && inst.config.seuils ? inst.config.seuils : null };
        }
        noter('B1', res);
        expect(Object.keys(res).length).toBeGreaterThanOrEqual(5);
        for (const id of ['STD-n-meilleurs', 'STD-n-recents']) {
            expect([id, res[id].echelleId, res[id].instance]).toEqual([id, 'E1', true]);
            expect([id, res[id].note.export.statut]).toEqual([id, 'final']);
            expect([id, res[id].note.riche]).toEqual([id, res[id].note.simule.noteFinale]);
        }
        for (const id of ['SOM-litterature', 'SPE-simple', 'DEN-base']) expect([id, res[id].echelleId == null]).toEqual([id, true]);   // sans question
    });

    it('B2 · « N plus récentes » adoptée puis rouverte par l\'assistant : la méthode relue est « récents », le portfolio est intact', async () => {
        // À LA MAIN : le gabarit STD-n-recents porte methodeSelection 'recents' ; chargerPratiqueExistante ne connaît que
        // {meilleurs, tous, derniers} → 'n_meilleurs' → ré-enregistrée en 'meilleurs' (et varianteCalcul 'n-meilleurs').
        // Avec 6 artefacts valides (A6 = 95) et N = 5 : récents = A2..A6 → (60+78+70+78+95)/5 = 76,2 → 45,72+32,8 = 78,52 ;
        // meilleurs = A6,A1,A3,A5,A4 → (95+85+78+78+70)/5 = 81,2 → 48,72+32,8 = 81,52.
        // #898 (lot 34) — CE CAS EST DÉSORMAIS CELUI DU STOCK : une pratique adoptée SANS échelle AVANT que l'adoption ne la
        // demande (tarir n'est pas réparer). Elle est donc semée telle qu'elle a été écrite à l'époque, pas adoptée par
        // l'assistant d'aujourd'hui ; sa sortie reste celle-ci : la rouvrir par l'assistant, qui exige l'échelle.
        const m0 = monter(jeuSTD()).win.obtenirToutesLesPratiquesBibliothequeSync(true).find(x => x.id === 'STD-n-recents');
        const p0 = Object.assign(clone(m0), { id: 'pratique_STOCK', nom: 'Récentes', dansBibliotheque: true, dateCreation: '2026-09-10T12:00:00.000Z' });
        delete p0.estGabarit;
        const b = monter(jeuSTD({ a6Valide: true }), { pratiques: [p0] });
        activer(b, p0.id);
        const avant = noteDe(b, DA.STD, p0.id);
        const { reponses, apres } = await rouvrirEtResauver(b, p0.id);   // sans échelle : l'assistant REFUSE d'enregistrer
        const refus = b.notifs.filter(n => n.type === 'erreur').map(n => n.t);
        // L'enseignant choisit alors une échelle (seul geste qui débloque) et enregistre sans rien changer d'autre.
        b.win.wizardState.reponses = {}; b.win.chargerPratiqueExistante(p0.id);
        const r2e = Object.assign(clone(b.win.wizardState.reponses), { echelleId: 'E1' });
        const apres2 = await creerParAssistant(b, r2e, p0.id);
        const apresNote = noteDe(b, DA.STD, p0.id);
        noter('B2', { methodeAvant: p0.configuration.portfolio.methodeSelection, reponseRelue: reponses.modeSelectionPortfolio, approcheRelue: reponses.approcheEvaluation,
            refusSansEchelle: refus, inchangeeSansEchelle: diff(p0, apres).length === 0,
            configApresEchelle: apres2.configuration, noteAvant: avant, noteApres: apresNote, perdu: diff(p0, apres2) });
        expect(p0.configuration.portfolio.methodeSelection).toBe('recents');
        // B-2 CORRIGÉ (1.142.24) — la méthode relue est « récents » (l'option « N derniers » de l'écran), l'approche se
        // déduit du portfolio, et choisir l'échelle puis enregistrer sans rien toucher d'autre GARDE le portfolio.
        expect(reponses.modeSelectionPortfolio).toBe('derniers');
        expect(reponses.approcheEvaluation).toBe('par-artefacts');
        expect(diff(p0, apres)).toEqual([]);                          // sans échelle : refus, rien d'écrit (inchangé)
        expect(apres2.configuration.portfolio).toMatchObject({ nombreARetenir: 5, minimumCompletion: 5, nombreTotal: 10, methodeSelection: 'derniers' });
        expect(apres2.configuration.varianteCalcul).toBe('n-recents');
        expect(avant.riche).toBe(78.52);
        expect(apresNote.riche).toBe(78.52);                          // « derniers » = « recents » (alias du moteur) : la note n'a pas bougé
        expect(apresNote.export).toEqual({ note: 79, statut: 'final' });
    });

    it('B2 bis · la table de relecture connaît tout le vocabulaire du moteur', async () => {
        // Une pratique d'avant #434 peut porter « recents-meilleurs », que l'écran n'offre plus : la valeur est GARDÉE telle
        // quelle à la relecture et repasse intacte à l'écriture — jamais convertie en « N meilleurs » en silence.
        const attendu = { meilleurs: 'n_meilleurs', tous: 'tous', derniers: 'derniers', recents: 'derniers', 'recents-meilleurs': 'recents-meilleurs' };
        for (const [methode, mode] of Object.entries(attendu)) {
            const b = monter(jeuSTD({ a6Valide: true }), { pratiques: [{ id: 'PX', nom: 'Legacy', type: 'standards', calcul_note: { methode: 'conversion_niveaux' },
                configuration: { echelleId: 'E1', portfolio: { methodeSelection: methode, nombreARetenir: 4, minimumCompletion: 2, nombreTotal: 6 } } }] });
            const { reponses, apres } = await rouvrirEtResauver(b, 'PX');
            expect([methode, reponses.modeSelectionPortfolio]).toEqual([methode, mode]);
            expect([methode, reponses.approcheEvaluation]).toEqual([methode, 'par-artefacts']);
            expect([methode, apres.configuration.portfolio.nombreARetenir]).toEqual([methode, 4]);
        }
        const b = monter(jeuSTD({ a6Valide: true }), { pratiques: [{ id: 'PX', nom: 'Legacy', type: 'standards', calcul_note: { methode: 'conversion_niveaux' },
            configuration: { echelleId: 'E1', portfolio: { methodeSelection: 'recents-meilleurs', nombreARetenir: 4, minimumCompletion: 2, nombreTotal: 6 } } }] });
        const { apres } = await rouvrirEtResauver(b, 'PX');
        expect(apres.configuration.portfolio.methodeSelection).toBe('recents-meilleurs');
    });
});

/* =============================================================================================
   D · APPLIQUER, CHANGER, RETIRER
   ============================================================================================= */
describe('D · appliquer une pratique au groupe-cours, en changer, la retirer', () => {
    // FIGE D-1 (sous #710 : l'indice de l'ancienne pratique survit jusqu'au recalcul) et D-3 (#483 : 85 et non 87,43).
    it('D1 · STD appliquée puis remplacée par SOM puis rétablie : ce qui est écrit, ce qui reste, ce qui bouge', async () => {
        // À LA MAIN : changerPratiqueActive écrit groupesCours[0].pratiqueId + groupeCoursActif.pratiqueId, invalide le cache et
        // recharge la pratique ; il n'appelle PAS calculerEtStockerIndicesCP (lecture de pratique-manager.js) → indicesCP reste
        // celui de l'ancienne pratique tant qu'un recalcul n'a pas eu lieu. La note STD (derniers, 4/6) = 75,7 ; SOM = 87,43.
        const b = monter(jeuSTD());
        b.store.test_evaluationsSauvegardees = b.store.test_evaluationsSauvegardees.concat(clone(jeuSOM().evaluations.map(e => Object.assign(e, { etudiantDA: DA.STD }))));
        b.store.test_productions = b.store.test_productions.concat(clone(jeuSOM().productions));
        const std = await creerParAssistant(b, { nom: 'STD', calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts', echelleId: 'E1', grilleId: 'G1',
            modeSelectionPortfolio: 'derniers', nbArtefactsSoumis: 6, nbArtefactsRetenus: 4, minAvantCalculFormatif: 2, utiliserPortfolio: true });
        const som = await creerParAssistant(b, { nom: 'SOM', calcNoteFinale: 'moyenne', reglesSommatives: [] });
        const journal = [];
        const etape = async (id, libelle) => {
            b.ecritures.length = 0;
            if (id) await b.win.PratiqueManager.changerPratiqueActive(id); else { b.store.test_groupesCours[0].pratiqueId = null; }
            const ecrit = [...new Set(b.ecritures)];
            const indicesAvantRecalcul = (b.store.test_indicesCP || {})[DA.STD] ? (b.store.test_indicesCP[DA.STD].actuel || {}).P : '(aucun)';
            b.win.calculerEtStockerIndicesCP();
            const details = b.win.calculerDetailsNoteFinale(DA.STD);
            journal.push({ etape: libelle, pratiqueId: b.store.test_groupesCours[0].pratiqueId, ecritParLeGeste: ecrit, indicesAvantRecalcul,
                indicesApresRecalcul: b.store.test_indicesCP[DA.STD].actuel.P, noteConstructible: b.store.test_indicesCP[DA.STD].actuel.noteConstructible,
                riche: details ? (details.erreur ? { erreur: details.erreur.slice(0, 80) } : r2(details.noteFinale)) : null,
                portfoliosEleves: clone(b.store.test_portfoliosEleves) });
        };
        await etape(std.id, '1. appliquer STD');
        await etape(som.id, '2. passer à SOM');
        await etape(std.id, '3. revenir à STD');
        await etape(null, '4. retirer la pratique');
        noter('D1', journal);
        expect(journal[0].ecritParLeGeste).toEqual(expect.arrayContaining(['test_groupesCours', 'groupeCoursActif']));
        expect(journal[0].riche).toBe(75.7);
        // ↻ Lot N1a (21 sept. 2026, #710 ajout D-1) : `changerPratiqueActive` recalcule les indices — l'indice suit la
        // pratique qu'on vient d'assigner (avant : 76, celui de STD, survivait au changement jusqu'au premier recalcul).
        expect(journal[1].indicesAvantRecalcul).toBe(85);
        // OBTENU : 85, pas 87,43 — sous SOM, les six artefacts STD (pondération 0) pèsent chacun 1 (« ponderation || 1 »,
        // skill §10) et entrent dans la moyenne avec les productions sommatives : (84×40 + 90×60 + 70 + 85+60+78+70+78 + 82×1)/…
        expect(journal[1].indicesApresRecalcul).toBe(85);
        expect(journal[2].riche).toBe(75.7);
        // ↻ Lot N1a : RETIRER la pratique rend « non constructible », à l'indice comme au profil (avant : un 76
        // « constructible » restait à l'indice pendant que le profil disait qu'aucune pratique n'était assignée).
        expect(journal[3].indicesApresRecalcul).toBe(0);
        expect(journal[3].noteConstructible).toBe(false);
        expect(journal[3].riche.erreur).toMatch(/Aucune pratique de notation n'est assignée/);
    });
});

/* =============================================================================================
   G-1 · LE TOUR COMPLET, PAR FAMILLE — ce que l'assistant et le formulaire ÉCRIVENT est ce qui est RELU,
   puis ce qui CALCULE (lot 28, 17 sept. 2026). L'audit avait mesuré cinq mutations sur huit sans un rouge :
   la méthode de sélection (les deux écrivains), le seuil SPE par défaut, les ids de cibles DEN, le minimum
   du portfolio. Chaque essai ci-dessous porte l'ATTENDU À LA MAIN dans son commentaire.
   ============================================================================================= */

/** Le formulaire de gestion RÉEL (pratiques-gestion.js) sur un faux document — patron de la sentinelle 853. */
function monterFormulaire(pratique) {
    const store = { test_pratiquesConfigurables: [clone(pratique)], test_echellesTemplates: [clone(E1)], test_grillesTemplates: [clone(GRILLE)] };
    const elements = {};
    const win = { addEventListener() {}, removeEventListener() {} };
    const globaux = { document: fauxDocument(elements, {}), db: dbBanc(store, []), cle: (k) => 'test_' + k, echapperHtml: (x) => String(x == null ? '' : x),
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {}, warning() {} },
        setTimeout: (f) => { f(); return 0; }, clearTimeout() {},
        toggleDisplay: (el, visible) => { if (el) el.style.display = visible ? '' : 'none'; } };
    chargerScript('js/pratiques/editeur-cibles.js', globaux, win);   // lot N5 (#717)
    chargerAvecInterne('js/pratiques-gestion.js', globaux, win, ['appliquerFormulaireDansCollection']);
    return { win, store, elements, interne: win.__audit['pratiques-gestion.js'] };
}
const REPONSES_STD = (mode, extra) => Object.assign({ nom: 'STD ' + mode, calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts', echelleId: 'E1', grilleId: 'G1',
    modeSelectionPortfolio: mode, nbArtefactsSoumis: 6, nbArtefactsRetenus: 4, utiliserPortfolio: true }, extra || {});

describe('G-1 · STD : la méthode de sélection écrite est celle relue et celle qui calcule', () => {
    // À LA MAIN — six artefacts valides : A1 85, A2 60, A3 78, A4 70 (reprise retenue), A5 78, A6 95 ; terminale 82 ; 60 / 40 ; N = 4.
    //   meilleurs : (95+85+78+78)/4 = 84    → 84 × 0,6 + 82 × 0,4 = 83,2
    //   derniers  : (78+70+78+95)/4 = 80,25 → 80,25 × 0,6 + 32,8  = 80,95
    const CAS = [['n_meilleurs', 'meilleurs', 'n-meilleurs', 83.2], ['derniers', 'derniers', 'n-recents', 80.95]];

    for (const [mode, methode, variante, attendu] of CAS) {
        it(`assistant · « ${mode} » : écrit « ${methode} », relu « ${mode} », ré-écrit « ${methode} », calcule ${attendu}`, async () => {
            const b = monter(jeuSTD({ a6Valide: true }));
            const p0 = await creerParAssistant(b, REPONSES_STD(mode));
            activer(b, p0.id);
            const note = noteDe(b, DA.STD, p0.id);
            const { reponses, apres } = await rouvrirEtResauver(b, p0.id);
            expect(p0.configuration.portfolio.methodeSelection).toBe(methode);
            expect(p0.configuration.varianteCalcul).toBe(variante);
            expect(reponses.modeSelectionPortfolio).toBe(mode);
            expect(apres.configuration.portfolio.methodeSelection).toBe(methode);
            expect(note.riche).toBe(attendu);
            expect(note.simule.noteFinale).toBe(attendu);
            // Le détail du profil NOMME la méthode que le moteur a suivie (libellé de profil-etudiant-actions.js).
            expect(b.win.calculerDetailsNoteFinale(DA.STD).portfolio.methodeSelection).toBe(methode === 'derniers' ? 'plus récents' : 'meilleurs');
        });

        it(`formulaire · une pratique « ${methode} » : relue « ${methode} » à l'écran, ré-écrite « ${methode} », calcule ${attendu}`, async () => {
            const b = monter(jeuSTD({ a6Valide: true }));
            const p0 = await creerParAssistant(b, REPONSES_STD(mode, { minAvantCalculFormatif: 2 }));
            const f = monterFormulaire(p0);
            await f.win.chargerPratiquePourModif(p0.id);
            expect(f.elements['mat-portfolio-selection'].value).toBe(methode);
            // L'enseignant·e enregistre sans rien toucher.
            const ecrite = f.interne.appliquerFormulaireDansCollection(clone(f.store.test_pratiquesConfigurables))[0];
            expect(ecrite.configuration.portfolio).toMatchObject({ methodeSelection: methode, nombreARetenir: 4, minimumCompletion: 2, nombreTotal: 6 });
            expect(ecrite.configuration.varianteCalcul).toBe(variante);
            expect(ecrite.configuration.echelleId).toBe('E1');
            const b2 = monter(jeuSTD({ a6Valide: true }), { pratiques: [ecrite], pratiqueId: p0.id });
            expect(noteDe(b2, DA.STD, p0.id).riche).toBe(attendu);
        });
    }

    it('assistant · « tous » : écrit, relu et ré-écrit « tous » (la note sous « tous » est figée en A2b, #715)', async () => {
        const b = monter(jeuSTD({ a6Valide: true }));
        const p0 = await creerParAssistant(b, REPONSES_STD('tous'));
        const { reponses, apres } = await rouvrirEtResauver(b, p0.id);
        expect([p0.configuration.portfolio.methodeSelection, reponses.modeSelectionPortfolio, apres.configuration.portfolio.methodeSelection]).toEqual(['tous', 'tous', 'tous']);
    });

    it('assistant · le minimum du portfolio par défaut (3) est écrit, relu, et c\'est celui que le moteur lit', async () => {
        // À LA MAIN : sans réponse, `minimumCompletion` = 3. Un·e élève à DEUX artefacts (85, 60) et la terminale (82) :
        // le moteur lit « minimum requis : 3 », en retient 2 → (85+60)/2 = 72,5 → 43,5 + 32,8 = 76,3.
        const jeu = jeuSTD();
        jeu.evaluations = jeu.evaluations.filter(e => ['EV_A1', 'EV_A2', 'EV_TERM'].includes(e.id));
        const b = monter(jeu);
        const p0 = await creerParAssistant(b, REPONSES_STD('n_meilleurs'));
        activer(b, p0.id);
        const details = b.win.calculerDetailsNoteFinale(DA.STD);
        const { reponses, apres } = await rouvrirEtResauver(b, p0.id);
        expect(p0.configuration.portfolio.minimumCompletion).toBe(3);
        expect(reponses.minAvantCalculFormatif).toBe(3);
        expect(apres.configuration.portfolio.minimumCompletion).toBe(3);
        expect(details.portfolio.minimumRequis).toBe(3);
        expect(details.portfolio.nombreRetenus).toBe(2);
        expect(r2(details.noteFinale)).toBe(76.3);
    });
});

describe('G-1 · SPE : le seuil d\'acceptabilité écrit est celui qui décide des travaux acceptables', () => {
    // À LA MAIN — dissertations 80 et 65 (reprise retenue), examen 90 (l'autre est un brouillon, hors note) ;
    // forfaits : A = 90 pour 2 dissertations + 1 examen ; C = 70 pour 1 dissertation + 1 examen. L'assistant ne collecte
    // ni types ni forfaits (A-3, #899) : ils sont posés ici comme le formulaire de gestion les écrit.
    //   seuil 70  : une seule dissertation acceptable (80) → C → 70
    //   seuil 60  : les deux (80, 65)                      → A → 90
    //   sans réponse : l'assistant écrit 100 → rien d'acceptable → aucune note, la cause nommée (lot N4, #713 ; avant :
    //   plancher 50, B-3). À 75, ce serait 70.
    const TYPES_ET_FORFAITS = { typesTravaux: [{ id: 'dissertation', nom: 'Dissertation' }, { id: 'examen', nom: 'Examen' }],
        forfaits: [{ id: 1, lettre: 'A', note: 90, travaux: { dissertation: 2, examen: 1 } }, { id: 2, lettre: 'C', note: 70, travaux: { dissertation: 1, examen: 1 } }] };
    for (const [reponse, ecrit, attendu] of [[70, 70, 70], [60, 60, 90], [undefined, 100, null]]) {
        it(`assistant · seuil ${reponse === undefined ? 'par défaut' : reponse} : écrit ${ecrit}, calcule ${attendu === null ? 'aucune note' : attendu}`, async () => {
            const b = monter(jeuSPE());
            const p0 = await creerParAssistant(b, { nom: 'SPE', calcNoteFinale: 'acceptable', seuilAcceptabilite: reponse });
            Object.assign(b.store.test_pratiquesConfigurables[0].configuration, clone(TYPES_ET_FORFAITS));
            activer(b, p0.id);
            const note = noteDe(b, DA.SPE, p0.id);
            expect(p0.configuration.seuilAcceptabilite).toBe(ecrit);
            expect(note.perf).toBe(attendu);
            expect(note.export).toEqual(attendu === null
                ? { note: '', statut: 'non constructible – Ta pratique ne dit pas quelle note donner quand aucun forfait n\'est atteint.' }
                : { note: attendu, statut: 'final' });
        });
    }
});

describe('G-1 · DEN : les ids de cibles écrits sont ceux que le jugement indexe', () => {
    it('assistant · « Lire / Écrire » : les ids reçus à la création sont écrits, relus, ré-écrits, et la garde par cible les retrouve', async () => {
        // À LA MAIN : jugement 78, deux cibles confirmées → 78 ; « Écrire » non confirmée → plafond RREC 59.
        // Des ids écrits autrement (la position, un id neuf à l'écriture…) ne retrouveraient aucune confirmation : 59 partout.
        const b = monter(jeuDEN());
        const cibles = [{ id: b.win.EditeurCibles.nouvelId(), nom: 'Lire' }, { id: b.win.EditeurCibles.nouvelId(), nom: 'Écrire' }];
        const p0 = await creerParAssistant(b, { nom: 'DEN', calcNoteFinale: 'jugement', ciblesDenotation: clone(cibles), methodeSuggestionDen: 'mediane', echelleId: 'E1', grilleId: 'G1' });
        activer(b, p0.id);
        const juger = (c2) => { b.store.test_jugementsDenotation = { [p0.id]: { [DA.DEN]: { ciblesAtteintes: { [cibles[0].id]: true, [cibles[1].id]: c2 }, noteFinale: 78, justification: 'banc', date: '2026-05-01' } } }; };
        expect(p0.configuration.objectifs).toEqual(cibles);
        juger(true);
        expect(noteDe(b, DA.DEN, p0.id).perf).toBe(78);
        juger(false);
        expect(noteDe(b, DA.DEN, p0.id).perf).toBe(59);
        const { reponses, apres } = await rouvrirEtResauver(b, p0.id);
        expect(reponses.ciblesDenotation).toEqual(cibles);
        expect(apres.configuration.objectifs).toEqual(p0.configuration.objectifs);
    });
});

describe('G-1 · SOM : les reprises ne sont plus écrites (#903) ; celles d\'une pratique enregistrée restent', () => {
    it('assistant · une pratique neuve n\'écrit pas de reprises ; le stock « limitées » survit à la réédition ; la moyenne 87,43 ne bouge pas', async () => {
        const b = monter(jeuSOM());
        const neuve = await creerParAssistant(b, { nom: 'SOM', calcNoteFinale: 'moyenne', reglesSommatives: [], reprisesPermises: 'limite' });
        expect(neuve.configuration.reprises).toBeUndefined();
        const stock = Object.assign(clone(neuve), { id: 'STOCK_REPRISES' });
        stock.configuration.reprises = { permises: true, mode: 'limite' };
        b.store.test_pratiquesConfigurables.push(clone(stock));
        activer(b, stock.id);
        const { reponses, apres } = await rouvrirEtResauver(b, stock.id);
        expect(reponses.reprisesPermises).toBeUndefined();
        expect(diff(stock, apres, [])).toEqual([]);
        expect(apres.configuration.reprises).toEqual({ permises: true, mode: 'limite' });
        expect(noteDe(b, DA.SOM, stock.id).perf).toBe(87.43);
    });
});

/* =============================================================================================
   LOT 29 (17 sept. 2026, 1.142.25) · #897 + #854 — LE VERROU QUE L'ASSISTANT ÉCRIT EST RELU À L'IDENTIQUE ET CALCULE,
   au profil (calculerPerformance), par simulerIndices et à l'export. « Brancher » : tranché par Grégoire, à la condition
   que rouvrir la pratique ne change aucune règle (A-2). Jeu SOM : Dissertation 84 (×40), Examen 50 remplacé par 90 (×60),
   Exercice 70 (pondération 0 → poids 1) ; moyenne (3360 + 5400 + 70) / 101 = 87,43.
   ============================================================================================= */
const SOM_VERROU = (extra) => Object.assign({ nom: 'SOM verrou', calcNoteFinale: 'moyenne', reglesSommatives: ['double_verrou'],
    nomEvalVerrouillee: 'Dissertation', seuilVerrou: 90, plafondVerrou: 50 }, extra || {});

describe('lot 29 · SOM : le verrou écrit par l\'assistant s\'applique à la note', () => {
    it('déclenché (84 < 90 → max 50) : 50 au profil, par simulerIndices et à l\'export', async () => {
        const b = monter(jeuSOM());
        const p0 = await creerParAssistant(b, SOM_VERROU());
        activer(b, p0.id);
        const n = noteDe(b, DA.SOM, p0.id);
        expect(n.perf).toBe(50);
        expect(n.simule).toMatchObject({ P: 50, noteConstructible: true });
        expect(n.export).toEqual({ note: 50, statut: 'final' });
    });

    it('non déclenché (84 ≥ 80) : la moyenne 87,43 ne bouge pas ; un plafond plus haut que la moyenne non plus', async () => {
        const b = monter(jeuSOM());
        const p80 = await creerParAssistant(b, SOM_VERROU({ seuilVerrou: 80 }));
        const p95 = await creerParAssistant(b, SOM_VERROU({ nom: 'SOM plafond haut', plafondVerrou: 95 }));
        expect(noteDe(b, DA.SOM, p80.id).perf).toBe(87.43);
        expect(noteDe(b, DA.SOM, p95.id).perf).toBe(87.43);   // min(87,43 ; 95) : un verrou plafonne, il ne hausse jamais
    });

    it('note SUR le seuil (84 = 84) : non plafonnée — « sous le seuil » est strict ; un point plus haut (85), elle l\'est', async () => {
        // Trou de preuve de la relecture croisée du lot 29 (Cowork, 17 sept. 2026) : aucun essai ne posait la note SUR le
        // seuil, et la mutation `comparateur: '<'` → `'<='` de l'assistant restait verte. La Dissertation est à 84.
        const b = monter(jeuSOM());
        const pSur = await creerParAssistant(b, SOM_VERROU({ nom: 'SOM seuil égal', seuilVerrou: 84 }));
        const pAuDessus = await creerParAssistant(b, SOM_VERROU({ nom: 'SOM seuil 85', seuilVerrou: 85 }));
        expect(noteDe(b, DA.SOM, pSur.id).perf).toBe(87.43);
        expect(noteDe(b, DA.SOM, pAuDessus.id).perf).toBe(50);   // témoin : le même montage plafonne dès que 84 < seuil
    });

    it('le nom saisi se compare au TITRE de la production, sans casse ni espaces de bord ; un nom sans production : sans effet', async () => {
        const b = monter(jeuSOM());
        const pCasse = await creerParAssistant(b, SOM_VERROU({ nomEvalVerrouillee: '  dissertation ' }));
        const pAbsent = await creerParAssistant(b, SOM_VERROU({ nom: 'SOM absent', nomEvalVerrouillee: 'Analyse finale' }));
        expect(noteDe(b, DA.SOM, pCasse.id).perf).toBe(50);
        expect(noteDe(b, DA.SOM, pAbsent.id).perf).toBe(87.43);
    });

    it('seule la copie qui ENTRE dans la note compte : l\'Examen à 50 REMPLACÉ par 90 ne déclenche pas un verrou à 60', async () => {
        const b = monter(jeuSOM());
        const p = await creerParAssistant(b, SOM_VERROU({ nomEvalVerrouillee: 'Examen', seuilVerrou: 60, plafondVerrou: 55 }));
        expect(noteDe(b, DA.SOM, p.id).perf).toBe(87.43);
    });

    it('le plafonnement et le remplacement d\'une pratique enregistrée ne s\'appliquent PAS et ne lèvent pas (#903) : 87,43', () => {
        // Le plafonnement n'a pour condition qu'un texte libre, le remplacement qu'un nombre de paires : rien ne les devine.
        // Depuis #903 l'assistant ne les écrit plus : le stock est semé.
        const stock = clone(STOCK_SOM_TROIS_REGLES);
        stock.variante = 'progressive';
        stock.reglesSpeciales = ['remplacement', 'plafonnement'];
        stock.configuration.reglesSommatives = ['remplacement', 'plafonnement'];
        stock.configuration.conditions_speciales = [{ type: 'plafonnement', description: 'Examen non remis', consequence: { action: 'plafonner', valeur: 40 } }];
        const b = monter(jeuSOM(), { pratiques: [stock] });
        const inst = b.win.obtenirPratiqueParId(stock.id);
        expect(inst.config.calcul_note.conditions_speciales).toHaveLength(1);
        expect(noteDe(b, DA.SOM, stock.id).perf).toBe(87.43);
    });

    it('la copie d\'un·e AUTRE élève ne déclenche rien : Bruno a 40 à la Dissertation, Alice (84 ≥ 60) garde 87,43', async () => {
        const jeu = jeuSOM();
        jeu.evaluations.push(ev('EV_AUTRE', DA.STD, 'P1', 40, 'I'));
        const b = monter(jeu);
        const p = await creerParAssistant(b, SOM_VERROU({ seuilVerrou: 60, plafondVerrou: 55 }));
        expect(noteDe(b, DA.SOM, p.id).perf).toBe(87.43);
        expect(noteDe(b, DA.STD, p.id).perf).toBe(40);        // lui : une seule copie, 40 < 60 → min(40 ; 55) = 40
    });

    it('seul le type « double_verrou » verrouille : une autre règle qui nommerait une évaluation n\'agit pas', () => {
        const b = monter(jeuSOM(), { pratiques: [{ id: 'PT', nom: 'Autre type', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee',
            conditions_speciales: [{ type: 'plafonnement', condition: { evaluation: 'Dissertation', comparateur: '<', seuil: 90 }, consequence: { action: 'plafonner', valeur: 50 } }] } }] });
        expect(noteDe(b, DA.SOM, 'PT').perf).toBe(87.43);
    });

    it('une pratique qui porte déjà ses conditions sous calcul_note (forme des gabarits) garde les siennes', () => {
        const verrouGabarit = { type: 'double_verrou', condition: { evaluation: 'Dissertation', comparateur: '<', seuil: 85 }, consequence: { action: 'echec', note_max: 55 } };
        const b = monter(jeuSOM(), { pratiques: [{ id: 'PG', nom: 'Gabarit', type: 'sommative',
            calcul_note: { methode: 'moyenne_ponderee', conditions_speciales: [verrouGabarit] },
            configuration: { conditions_speciales: [{ type: 'double_verrou', condition: { evaluation: 'Dissertation', comparateur: '<', seuil: 90 }, consequence: { action: 'echec', note_max: 10 } }] } }] });
        expect(noteDe(b, DA.SOM, 'PG').perf).toBe(55);   // 84 < 85 → 55 ; le 10 de configuration.* n'est pas lu
    });
});

describe('lot 29 · SOM : rouvrir une pratique ne change aucune règle (A-2, la condition de Grégoire)', () => {
    it('les cinq champs du verrou et du portfolio sont relus ; le diff de réédition est vide, règles retirées comprises (#903) ; la note reste 50', async () => {
        const p0 = clone(STOCK_SOM_TROIS_REGLES);
        p0.id = 'STOCK_QUATRE';
        p0.reglesSpeciales = ['remplacement', 'double_verrou', 'portfolio', 'plafonnement'];
        p0.configuration.reglesSommatives = ['remplacement', 'double_verrou', 'portfolio', 'plafonnement'];
        p0.configuration.portfolio = { utiliser: true, nbArtefacts: 8, qualitatif: true };
        p0.configuration.conditions_speciales[1].consequence.valeur = 45;
        const b = monter(jeuSOM(), { pratiques: [p0] });
        activer(b, p0.id);
        const { reponses, apres } = await rouvrirEtResauver(b, p0.id);
        expect(reponses).toMatchObject({ reglesSommatives: ['double_verrou', 'portfolio'], nomEvalVerrouillee: 'Dissertation', seuilVerrou: 90, plafondVerrou: 50,
            nbArtefactsPortfolio: 8, portfolioQualitatif: true });
        expect(diff(p0, apres, [])).toEqual([]);
        expect(noteDe(b, DA.SOM, p0.id).perf).toBe(50);
    });
});

describe('lot 29 · #899 : le récapitulatif d\'une spécification dit où régler types et forfaits', () => {
    const LIGNE = 'Types de productions et forfaits';
    const REPONSES_SPE = { nom: 'SPE récap', typePratique: 'specifications', calcNoteFinale: 'acceptable', seuilAcceptabilite: 70, echelleId: 'E1' };
    it('création : la ligne paraît ; sommative et standards : jamais', () => {
        const b = monter(jeuSPE());
        b.win.wizardState.modeEdition = false; b.win.wizardState.pratiqueId = null;
        b.win.wizardState.reponses = clone(REPONSES_SPE);
        expect(b.win.genererRecapitulatif()).toContain(LIGNE);
        b.win.wizardState.reponses = { nom: 'STD', typePratique: 'standards', calcNoteFinale: 'niveaux', echelleId: 'E1' };
        expect(b.win.genererRecapitulatif()).not.toContain(LIGNE);
        b.win.wizardState.reponses = { nom: 'SOM', typePratique: 'sommative', calcNoteFinale: 'moyenne' };
        expect(b.win.genererRecapitulatif()).not.toContain(LIGNE);
    });

    it('réédition : la ligne se tait seulement si types ET forfaits sont présents', () => {
        const types = [{ id: 'dissertation', nom: 'Dissertation' }];
        const forfaits = [{ note: 80, requis: { dissertation: 1 } }];
        const CAS = [[{ typesTravaux: types, forfaits }, false], [{ typesTravaux: types, tableBundles: forfaits }, false],
            [{ typesTravaux: types }, true], [{ forfaits }, true], [{}, true]];
        for (const [configuration, attendue] of CAS) {
            const b = monter(jeuSPE(), { pratiques: [{ id: 'PS', nom: 'SPE', type: 'specifications', configuration }] });
            b.win.wizardState.modeEdition = true; b.win.wizardState.pratiqueId = 'PS';
            b.win.wizardState.reponses = clone(REPONSES_SPE);
            expect(b.win.genererRecapitulatif().includes(LIGNE), JSON.stringify(Object.keys(configuration))).toBe(attendue);
        }
    });
});

/* =============================================================================================
   LOT N4 (23 sept. 2026) · #713 volet plancher, #854 volet spécifications
   Décision de Grégoire (23 sept., 8 h 20, réponse A) : sans forfait atteint et sans palier d'échec créé par le collègue,
   AUCUNE NOTE, la cause nommée — ni 50, ni 0, ni une suite de notes par défaut.
   ============================================================================================= */
const CAUSE_AUCUN_FORFAIT = 'Ta pratique ne dit pas quelle note donner quand aucun forfait n\'est atteint.';
/** Le gabarit « Modèle simple » TEL QU'IL EST OFFERT (pratiques-bibliotheque.js, 'SPE-simple'), adopté tel quel. */
const MODELE_SIMPLE = { id: 'SPE_SIMPLE', nom: 'Modèle simple', type: 'specifications', pratiques: ['SPE'], dansBibliotheque: true,
    dateCreation: '2026-09-23T12:00:00.000Z', calcul_note: { methode: 'specifications' },
    configuration: { seuilAcceptable: 75,
        typesTravaux: [{ id: 1, nom: 'Projet', description: 'Travail pratique ou créatif' }, { id: 2, nom: 'Examen', description: 'Évaluation sommative' }],
        forfaits: [{ id: 1, lettre: 'Excellence', note: 90, travaux: { 1: 2, 2: 1 } }, { id: 2, lettre: 'Réussite', note: 70, travaux: { 1: 1, 2: 1 } }] } };
// À LA MAIN (seuil 75) — Chloé (DA.SPE) : projet 80 + examen 90 → Réussite → 70.
//                        Alice (DA.SOM) : projet 60 (< 75) + examen 90 → aucun forfait, aucun palier d'échec → aucune note.
function jeuN4() {
    return {
        productions: [{ id: 'PJ1', titre: 'Projet 1', type: 'projet', dateEcheance: '2026-02-01' },
            { id: 'PJ2', titre: 'Projet 2', type: 'projet', dateEcheance: '2026-03-01' },
            { id: 'EX1', titre: 'Examen', type: 'examen', dateEcheance: '2026-04-01' }],
        evaluations: [ev('N4_C1', DA.SPE, 'PJ1', 80, 'M'), ev('N4_C2', DA.SPE, 'EX1', 90, 'E'),
            ev('N4_A1', DA.SOM, 'PJ1', 60, 'D'), ev('N4_A2', DA.SOM, 'EX1', 90, 'E')]
    };
}
function monterN4(pratique) {
    const b = monter(jeuN4(), { pratiques: [clone(pratique)], pratiqueId: pratique.id,
        store: { TYPES_PRODUCTION: undefined } });
    b.win.TYPES_PRODUCTION = [{ id: 'projet', libelle: 'Projet' }, { id: 'examen', libelle: 'Examen' }];
    return b;
}

describe('lot N4 · #713 : aucun forfait atteint, aucun palier d\'échec créé → aucune note, la cause nommée', () => {
    it('« Modèle simple » adopté tel quel : Alice n\'a PAS de note (null, « — », export vide avec la cause) ; Chloé garde 70', () => {
        const b = monterN4(MODELE_SIMPLE);
        const alice = noteDe(b, DA.SOM, MODELE_SIMPLE.id);
        expect(alice.perf).toBeNull();                                       // avant le lot : 50
        expect(alice.simule).toEqual({ P: 0, noteFinale: null, noteConstructible: false });
        expect(alice.export).toEqual({ note: '', statut: 'non constructible – ' + CAUSE_AUCUN_FORFAIT });
        expect(b.win.simulerIndices(DA.SOM, MODELE_SIMPLE.id).causeNonConstructible).toBe(CAUSE_AUCUN_FORFAIT);
        // L'indice P stocké (ce que lisent le profil, le Suivi et la courbe) : non constructible ; la cause se relit à la source.
        b.win.calculerEtStockerIndicesCP();
        expect(b.store.test_indicesCP[DA.SOM].actuel).toMatchObject({ P: 0, noteConstructible: false });
        expect(b.win.calculerTousLesIndices(DA.SOM).noteConstructible).toBe(false);
        expect(b.win.causeNoteNonConstructible(DA.SOM)).toBe(CAUSE_AUCUN_FORFAIT);
        // Le récit du calcul (la carte de la note, le Comparateur) dit la même cause.
        expect(b.win.obtenirPratiqueParId(MODELE_SIMPLE.id).decrireCalcul(DA.SOM).synthese).toMatchObject({ noteFinale: null, formuleTexte: CAUSE_AUCUN_FORFAIT });
        // Un forfait atteint : la note du forfait, inchangée, et aucune cause.
        const chloe = noteDe(b, DA.SPE, MODELE_SIMPLE.id);
        expect(chloe.perf).toBe(70);
        expect(chloe.export).toEqual({ note: 70, statut: 'final' });
        expect(b.win.causeNoteNonConstructible(DA.SPE)).toBeNull();
        expect(b.win.simulerIndices(DA.SPE, MODELE_SIMPLE.id).causeNonConstructible).toBeNull();
    });

    it('le palier d\'échec CRÉÉ par le collègue (un forfait sans travaux) s\'applique : Alice 45, sans cause', () => {
        const avecEchec = clone(MODELE_SIMPLE);
        avecEchec.configuration.forfaits.push({ id: 3, lettre: 'Échec', note: 45, travaux: {} });
        const b = monterN4(avecEchec);
        const alice = noteDe(b, DA.SOM, avecEchec.id);
        expect(alice.perf).toBe(45);
        expect(alice.export).toEqual({ note: 45, statut: 'final' });
        expect(b.win.causeNoteNonConstructible(DA.SOM)).toBeNull();
        expect(noteDe(b, DA.SPE, avecEchec.id).perf).toBe(70);
    });

    it('sans forfaits configurés : aucune note pour personne, et la cause le dit ; avec un seul palier d\'échec, sa note', () => {
        const sansForfaits = clone(MODELE_SIMPLE); sansForfaits.configuration.forfaits = [];
        const b = monterN4(sansForfaits);
        expect(noteDe(b, DA.SPE, sansForfaits.id).perf).toBeNull();
        expect(b.win.causeNoteNonConstructible(DA.SPE)).toBe(STATUT_SANS_TYPES_NI_FORFAITS.replace('non constructible – ', ''));
        const echecSeul = clone(MODELE_SIMPLE); echecSeul.configuration.forfaits = [{ id: 9, lettre: 'Échec', note: 45, travaux: {} }];
        const b2 = monterN4(echecSeul);
        expect(noteDe(b2, DA.SPE, echecSeul.id).perf).toBe(45);
        expect(b2.win.causeNoteNonConstructible(DA.SPE)).toBeNull();
    });

    it('un élève dont la SEULE copie est un brouillon n\'a pas de note, et ne reçoit PAS la cause « aucun forfait atteint » (#706 : un brouillon ne compte nulle part)', () => {
        // Complément de la relecture de Cowork (mutation survivante : le filtre `evaluationEntreDansLaNote` de la cause).
        // À LA MAIN : Alice n'a qu'un projet à 60 NON ENREGISTRÉ → aucune copie ne compte → pas de note, et la cause
        // n'est pas celle d'un forfait manqué : aucune copie n'a été jugée.
        const b = monterN4(MODELE_SIMPLE);
        b.store.test_evaluationsSauvegardees = b.store.test_evaluationsSauvegardees
            .filter(e => e.etudiantDA !== DA.SOM).concat([ev('N4_BR', DA.SOM, 'PJ1', 60, 'D', { verrouillee: false })]);
        expect(noteDe(b, DA.SOM, MODELE_SIMPLE.id).perf).toBeNull();
        expect(b.win.causeNoteNonConstructible(DA.SOM)).toBeNull();
        expect(b.win.simulerIndices(DA.SOM, MODELE_SIMPLE.id).causeNonConstructible).toBeNull();
        // Témoin : la même copie ENREGISTRÉE reçoit la cause (le banc sait la voir).
        b.store.test_evaluationsSauvegardees = b.store.test_evaluationsSauvegardees.map(e => e.id === 'N4_BR' ? Object.assign(e, { verrouillee: true }) : e);
        expect(b.win.causeNoteNonConstructible(DA.SOM)).toBe(CAUSE_AUCUN_FORFAIT);
    });

    it('la configurable n\'a plus de chemin « specifications » à elle : pas de suite de notes par défaut, la note vient du moteur', () => {
        const b = monterN4(MODELE_SIMPLE);
        const inst = b.win.obtenirPratiqueParId(MODELE_SIMPLE.id);
        expect(inst.constructor.name).toBe('PratiqueConfigurable');
        expect(typeof inst.calculerParSpecifications).toBe('undefined');
        expect(inst.calculerPerformance(DA.SOM)).toBeNull();
    });

    it('sentinelle : ni 50 en repli de palier, ni suite [100, 80, 60, 50] dans les deux moteurs', () => {
        const spe = readFileSync(path.join(RACINE, 'js/pratiques/pratique-pan-specifications.js'), 'utf8');
        const conf = readFileSync(path.join(RACINE, 'js/pratiques/pratique-configurable.js'), 'utf8');
        const corps = tranche(spe, '    _determinerPalierBundle(comptesAcceptables) {', '    expliquerNoteNonConstructible(da) {', { longueurMin: 200 });
        expect(corps).not.toMatch(/:\s*50\s*;/);
        for (const src of [spe, conf]) expect(src.replace(/\s/g, '')).not.toContain('[100,80,60,50]');
    });
});

describe('lot N4 · #854 volet spécifications : rouvrir puis enregistrer sans rien toucher rend la même configuration, à l\'octet', () => {
    // Ignoré, et nommé : `dateCreation` (l'assistant la réécrit ; sauvegarderPratique remet l'ancienne — le diff la saute
    // par prudence, comme partout dans ce banc). Aucune autre date n'est écrite par l'assistant. La CONFIGURATION se compare
    // par JSON.stringify : mêmes clés, mêmes valeurs, même ordre.
    it('« Modèle simple » ADOPTÉ par l\'assistant, palier d\'échec ajouté : seuil (sous `seuilAcceptable`), types, forfaits, palier d\'échec — identiques ; la note ne bouge pas', async () => {
        const b = monterN4(MODELE_SIMPLE);
        const gabarit = b.win.obtenirToutesLesPratiquesBibliothequeSync(true).find(m => m.id === 'SPE-simple');
        const p0 = await creerParAssistant(b, { nom: 'Adoptée SPE-simple', _modeleAdopte: true, _gabaritSource: clone(gabarit), modeleChoisi: 'SPE-simple', calcNoteFinale: 'x' });
        const cible = b.store.test_pratiquesConfigurables.find(p => p.id === p0.id);
        cible.configuration.forfaits.push({ id: 3, lettre: 'Échec', note: 45, travaux: {} });
        activer(b, p0.id);
        const avant = clone(cible);
        const { reponses, apres } = await rouvrirEtResauver(b, p0.id);
        expect(reponses).toMatchObject({ seuilAcceptabilite: 75, utiliserJetons: false });
        expect(JSON.stringify(apres.configuration)).toBe(JSON.stringify(avant.configuration));
        // L'ENVELOPPE (hors `configuration`), mesurée et nommée : l'assistant y ajoute `calcul_note.methode: 'specifications'`
        // (le gabarit adopté n'en porte pas ; c'est la méthode que le type désigne déjà), `etablissement: ''` et
        // `variante: 'bundles'` — comme pour toute famille qu'il enregistre. La note ci-dessous prouve qu'ils ne changent rien.
        noter('N4-reedition-enveloppe', diff(avant, apres));
        expect(diff(avant, apres).map(d => d.chemin)).toEqual(['calcul_note.methode', 'etablissement', 'variante']);
        expect([noteDe(b, DA.SOM, p0.id).perf, noteDe(b, DA.SPE, p0.id).perf]).toEqual([45, 70]);
    });

    it('SPE de l\'assistant, jetons actifs (délai sur reprise), types et forfaits posés ensuite par le formulaire : identique', async () => {
        const b = monterN4(MODELE_SIMPLE);
        const p0 = await creerParAssistant(b, { nom: 'SPE jetons', calcNoteFinale: 'acceptable', seuilAcceptabilite: 70, utiliserJetons: true,
            nbJetonsDelai: 4, dureeDelaiJours: 5, delaiSurReprise: true, nbJetonsReprise: 3, modeleBundle: 'simple' });
        const cible = b.store.test_pratiquesConfigurables.find(p => p.id === p0.id);
        Object.assign(cible.configuration, clone({ typesTravaux: MODELE_SIMPLE.configuration.typesTravaux,
            forfaits: MODELE_SIMPLE.configuration.forfaits.concat([{ id: 3, lettre: 'Échec', note: 45, travaux: {} }]) }));
        const avant = clone(cible);
        const { apres } = await rouvrirEtResauver(b, p0.id);
        expect(JSON.stringify(apres.configuration)).toBe(JSON.stringify(avant.configuration));
        expect(diff(avant, apres)).toEqual([]);
    });

    it('modèle de forfaits autre que le défaut (« litterature ») : rouvrir PRÉSÉLECTIONNE le modèle enregistré, enregistrer sans toucher le garde', async () => {
        // Complément de la relecture de Cowork (mutation survivante : la relecture de `modeleBundle` — la fusion gardait
        // l'ancienne valeur quand rien n'était répondu, et l'écran, lui, ne présélectionnait rien).
        const b = monterN4(MODELE_SIMPLE);
        const p0 = await creerParAssistant(b, { nom: 'SPE flexibles', calcNoteFinale: 'acceptable', seuilAcceptabilite: 80, utiliserJetons: false, modeleBundle: 'litterature' });
        const avant = clone(b.store.test_pratiquesConfigurables.find(p => p.id === p0.id));
        expect(avant.configuration.modeleBundle).toBe('litterature');
        const { reponses, apres } = await rouvrirEtResauver(b, p0.id);
        expect(reponses.modeleBundle).toBe('litterature');                      // la carte cochée à l'écran
        expect(apres.configuration.modeleBundle).toBe('litterature');
        expect(JSON.stringify(apres.configuration)).toBe(JSON.stringify(avant.configuration));
    });

    it('jetons DÉSACTIVÉS par l\'assistant : restent `{ activer: false }`, seuil 60 gardé', async () => {
        const b = monterN4(MODELE_SIMPLE);
        const p0 = await creerParAssistant(b, { nom: 'SPE sans jetons', calcNoteFinale: 'acceptable', seuilAcceptabilite: 60, utiliserJetons: false });
        const avant = clone(b.store.test_pratiquesConfigurables.find(p => p.id === p0.id));
        expect(avant.configuration.jetons).toEqual({ activer: false });
        const { reponses, apres } = await rouvrirEtResauver(b, p0.id);
        expect(reponses.utiliserJetons).toBe(false);
        expect(JSON.stringify(apres.configuration)).toBe(JSON.stringify(avant.configuration));
    });

    it('un vrai changement passe : le seuil modifié s\'écrit sous le nom que la pratique porte (le moteur le lit) ; décocher les jetons les désactive', async () => {
        const b = monterN4(MODELE_SIMPLE);
        b.win.wizardState.reponses = {}; b.win.chargerPratiqueExistante(MODELE_SIMPLE.id);
        const apres = await creerParAssistant(b, Object.assign(clone(b.win.wizardState.reponses), { seuilAcceptabilite: 55 }), MODELE_SIMPLE.id);
        expect(apres.configuration.seuilAcceptable).toBe(55);
        expect(apres.configuration.seuilAcceptabilite).toBeUndefined();
        expect(noteDe(b, DA.SOM, MODELE_SIMPLE.id).perf).toBe(70);           // 60 ≥ 55 : Alice atteint Réussite
        const b2 = monterN4(MODELE_SIMPLE);
        const p0 = await creerParAssistant(b2, { nom: 'SPE J', calcNoteFinale: 'acceptable', seuilAcceptabilite: 70, utiliserJetons: true, nbJetonsDelai: 2, dureeDelaiJours: 2, nbJetonsReprise: 1 });
        b2.win.wizardState.reponses = {}; b2.win.chargerPratiqueExistante(p0.id);
        const sansJetons = await creerParAssistant(b2, Object.assign(clone(b2.win.wizardState.reponses), { utiliserJetons: false }), p0.id);
        expect(sansJetons.configuration.jetons).toEqual({ activer: false });
    });
});
