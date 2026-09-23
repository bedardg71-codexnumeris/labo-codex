/**
 * AUDIT DE L'ONGLET SUIVI — banc d'exécution des mesures (5 septembre 2026)
 *
 * Rapport : Rapports/AUDIT-onglet-suivi-2026-09-05.md. Cadré par
 * Rapports/prompts-audit/PROMPT-AUDIT-onglet-suivi-2026-09-05.md. Troisième audit cadré : il repart
 * des flux H des deux premiers (Rapports/AUDIT-moteur-evaluation-2026-09-05.md,
 * Rapports/AUDIT-pratique-de-notation-2026-09-05.md) sans les remesurer.
 *
 * Ce fichier ne juge pas et ne corrige rien : il charge les modules RÉELS de js/ dans le bac à sable
 * (patron des deux bancs précédents et des sentinelles #330, #541, #542) et appelle leurs fonctions
 * publiques telles quelles. Chaque `it` porte une mesure du rapport (A1, B2…). Le nombre ATTENDU est
 * calculé À LA MAIN dans le commentaire qui précède la mesure, AVANT le code ; les `expect` sont les
 * valeurs OBTENUES au 5 septembre 2026 (HEAD 7d335a16, 1.122.1) — quand elles divergent du calcul à
 * la main, le commentaire le dit et le rapport en fait un constat. Si l'un rougit, le comportement
 * mesuré a changé et le constat est à remesurer.
 *
 * Quatre élèves de banc, dans un groupe-cours sommatif GC1 (quatre travaux 20/20/30/30, dix séances
 * de deux périodes, échelle 0-I-D-M-E à valeurs 0/40/65/75/100 avec repère de maîtrise « M », grille
 * de dépistage Structure + Rigueur (multistructurels) et Nuance (relationnel)) :
 *   · l'ASSIDU QUI PROGRESSE  2000001 — présent partout, 60 → 70 → 80 → 90 ;
 *   · l'ABSENT QUI RÉGRESSE   2000002 — présent 4 séances sur 10, 85 → 70 → 55 → 50 ;
 *   · SANS AUCUNE ÉVALUATION  2000003 — présent partout, rien de remis ;
 *   · l'INCOHÉRENT            2000004 — DA absent du groupe, présences dans un AUTRE groupe-cours
 *                                        (GC2), une évaluation sur une production qui n'existe pas.
 *
 * Miroirs (pas le code réel), nommés : `obtenirSeancesCompletes` / `obtenirSeancesHoraire` /
 * `obtenirCalendrierComplet` (le calendrier et l'horaire sont le geste 1, éprouvé par Grégoire ; ici
 * dix lundis de deux périodes), `obtenirEcheanceEffective` (copie des sept lignes de productions.js:152),
 * `resoudreModeleParId`, `obtenirPreference`. Tout le reste est le code de js/ — y compris modes.js
 * (`obtenirDonneesSelonMode` et son filtre par cours, `obtenirEtudiantsCoursActif`), chargé dans son
 * propre bac branché sur le même store, parce que le cas « présences dans un autre groupe-cours »
 * dépend précisément de ce filtre. Aucune donnée réelle lue ni écrite. Rien dans js/.
 *
 *   cd tests && npx vitest run unit/audit-onglet-suivi-2026-09-05.test.js
 */
import { describe, it, expect, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Même chargement que chargerScript, mais des noms INTERNES du module sont exposés sous
 * `window.__audit[<fichier>]` par des accesseurs (lus à l'appel, donc à jour pour une variable `let`).
 * Injection avant le `})();` final quand le module est une IIFE, en fin de fichier sinon.
 */
function chargerAvecInterne(chemin, globaux, win, noms) {
    let code = readFileSync(path.join(RACINE, chemin), 'utf8');
    const expo = '\n;window.__audit = window.__audit || {}; window.__audit[' + JSON.stringify(path.basename(chemin)) + '] = {'
        + noms.map(n => 'get ' + n + '() { return ' + n + '; }').join(', ') + '};\n';
    const fin = code.lastIndexOf('})();');
    code = fin >= 0 ? code.slice(0, fin) + expo + code.slice(fin) : code + expo;
    const { document: doc, localStorage: ls, ...autres } = globaux;
    const storage = () => ({ _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } });
    const nomsG = ['window', 'document', 'console', 'localStorage', 'sessionStorage', ...Object.keys(autres)];
    const vals = [win, doc, console, ls || storage(), storage(), ...Object.values(autres)];
    new Function(...nomsG, '"use strict";\n' + code)(...vals);
    return win;
}

const MESURES = {};
function noter(cle, valeur) { MESURES[cle] = valeur; return valeur; }
afterAll(() => { console.log('AUDIT-SUIVI-MESURES ' + JSON.stringify(MESURES, null, 1)); });

const clone = (x) => JSON.parse(JSON.stringify(x));
const r2 = (x) => (typeof x === 'number' ? Math.round(x * 100) / 100 : x);
const r3 = (x) => (typeof x === 'number' ? Math.round(x * 1000) / 1000 : x);

const DA = { ASSIDU: '2000001', ABSENT: '2000002', SILENCE: '2000003', INCOHERENT: '2000004' };
const ETUDIANTS = [
    { da: DA.ASSIDU, nom: 'Assidu', prenom: 'Alice', groupe: '01', coursId: 'GC1', statut: 'actif' },
    { da: DA.ABSENT, nom: 'Absent', prenom: 'Bruno', groupe: '01', coursId: 'GC1', statut: 'actif' },
    { da: DA.SILENCE, nom: 'Silence', prenom: 'Chloé', groupe: '01', coursId: 'GC1', statut: 'actif' }
    // DA.INCOHERENT n'est PAS dans le groupe : c'est le premier de ses trois défauts.
];

// L'échelle de Grégoire, telle que le rapport du 28 août la décrit : « 0 » 0-0, puis I/D/M/E à
// valeurs ponctuelles 40/65/75/100 ; repère de maîtrise posé sur M (#555).
const E0 = { id: 'E0', nom: 'IDME0 banc', seuilMaitrise: 'M', niveaux: [
    { code: '0', nom: 'Aucun', min: 0, max: 0, valeurCalcul: 0, couleur: '#999999' },
    { code: 'I', nom: 'Insuffisant', min: 1, max: 64, valeurCalcul: 40, couleur: '#aa0000' },
    { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75, couleur: '#00aa00' },
    { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100, couleur: '#0000aa' }
] };
// Une échelle à TROIS niveaux (A/B/C), repère de maîtrise sur B (60 et plus).
const E3N = { id: 'E3N', nom: 'Trois paliers', seuilMaitrise: 'B', niveaux: [
    { code: 'A', nom: 'À reprendre', min: 0, max: 59, valeurCalcul: 50, couleur: '#aa0000' },
    { code: 'B', nom: 'Atteint', min: 60, max: 84, valeurCalcul: 75, couleur: '#00aa00' },
    { code: 'C', nom: 'Dépassé', min: 85, max: 100, valeurCalcul: 95, couleur: '#0000aa' }
] };
// Une échelle dont les bornes sont 60 / 75 / 90 (pas 65 / 75 / 85).
const E60 = { id: 'E60', nom: 'Bornes 60-75-90', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 59, valeurCalcul: 45, couleur: '#aa0000' },
    { code: 'D', nom: 'En développement', min: 60, max: 74, valeurCalcul: 67, couleur: '#aa8800' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82, couleur: '#00aa00' },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95, couleur: '#0000aa' }
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
const DATE_EVAL = { P1: '2026-02-01T12:00:00.000Z', P2: '2026-03-01T12:00:00.000Z', P3: '2026-04-01T12:00:00.000Z', P4: '2026-05-01T12:00:00.000Z', PX: '2026-04-15T12:00:00.000Z' };

// Dix lundis de deux périodes, du 12 janvier au 16 mars 2026.
const DATES = ['2026-01-12', '2026-01-19', '2026-01-26', '2026-02-02', '2026-02-09', '2026-02-16', '2026-02-23', '2026-03-02', '2026-03-09', '2026-03-16'];
function seancesCompletes() {
    const s = {};
    DATES.forEach((d, i) => { s[d] = [{ id: 'S-' + d, date: d, nombrePeriodes: 2, numeroSemaine: i + 1, jour: 'Lundi' }]; });
    return s;
}
function calendrier() {
    const c = {};
    DATES.forEach((d, i) => { c[d] = { statut: 'cours', numeroSemaine: i + 1, jourSemaine: 'Lundi' }; });
    c['2026-02-10'] = { statut: 'jour-ouvrable', numeroSemaine: 5, jourSemaine: 'Mardi' };
    c['2026-03-23'] = { statut: 'conge', numeroSemaine: 11, jourSemaine: 'Lundi', motif: 'Relâche' };
    c['2027-01-11'] = { statut: 'cours', numeroSemaine: 99, jourSemaine: 'Lundi' };   // un jour de cours dans le futur
    return c;
}

function pres(da, date, periodes, extra) {
    return Object.assign({ da, date, periodesPresentes: periodes, notes: '', coursId: 'GC1' }, extra || {});
}
function ev(id, da, prodId, note, niveau, codes, extra) {
    return Object.assign({
        id, etudiantDA: da, productionId: prodId, noteFinale: note, niveauFinal: niveau,
        echelleId: 'E0', grilleId: 'G1', ponderationCouverte: 100, verrouillee: true, coursId: 'GC1', groupe: '01',
        dateEvaluation: DATE_EVAL[prodId], retroactionFinale: 'Rétroaction de banc.',
        statutIntegrite: 'recevable', statutRemise: 'remis',
        criteres: CRITERES.map((nom, i) => ({ critereId: 'c' + (i + 1), critereNom: nom, niveauSelectionne: codes[i], ponderation: GRILLE.criteres[i].ponderation }))
    }, extra || {});
}

/* ---------------------------------------------------------------------------------------------
   Le jeu de base : quatre élèves, un groupe-cours sommatif.
   --------------------------------------------------------------------------------------------- */
function jeuBase() {
    const presences = [];
    DATES.forEach(d => presences.push(pres(DA.ASSIDU, d, 2)));
    DATES.slice(0, 4).forEach(d => presences.push(pres(DA.ABSENT, d, 2)));        // présent aux 4 premières
    DATES.forEach(d => presences.push(pres(DA.SILENCE, d, 2)));
    DATES.forEach(d => presences.push(pres(DA.INCOHERENT, d, 2, { coursId: 'GC2' })));   // dans l'AUTRE groupe-cours
    return {
        etudiants: clone(ETUDIANTS),
        productions: clone(PRODUCTIONS),
        presences,
        evaluations: [
            ev('E1P1', DA.ASSIDU, 'P1', 60, 'I', ['D', 'D', 'D']),
            ev('E1P2', DA.ASSIDU, 'P2', 70, 'D', ['D', 'M', 'D']),
            ev('E1P3', DA.ASSIDU, 'P3', 80, 'M', ['M', 'M', 'M']),
            ev('E1P4', DA.ASSIDU, 'P4', 90, 'E', ['E', 'M', 'E']),
            ev('E2P1', DA.ABSENT, 'P1', 85, 'E', ['M', 'E', 'M']),
            ev('E2P2', DA.ABSENT, 'P2', 70, 'D', ['D', 'D', 'M']),
            ev('E2P3', DA.ABSENT, 'P3', 55, 'I', ['I', 'I', 'D']),
            ev('E2P4', DA.ABSENT, 'P4', 50, 'I', ['I', 'I', 'I']),
            ev('E4P1', DA.INCOHERENT, 'P1', 70, 'D', ['D', 'D', 'D']),
            ev('E4PX', DA.INCOHERENT, 'PX', 95, 'E', ['E', 'E', 'E'])           // production inexistante
        ],
        echelles: [clone(E0)],
        grilles: [clone(GRILLE)],
        pratiques: [{ id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' }, dansBibliotheque: true,
            configuration: { approcheEvaluation: 'sommative' } }],
        pratiqueId: 'som-banc'
    };
}

/* ---------------------------------------------------------------------------------------------
   Le bac à sable
   --------------------------------------------------------------------------------------------- */
const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/pratiques/pratique-configurable.js', 'js/pratiques/pratique-registre.js',
    'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-pan-standards.js',
    'js/pratiques/pratique-pan-specifications.js', 'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js',
    'js/saisie-presences.js', 'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js',
    'js/profil-etudiant-rapport.js', 'js/profil-etudiant-diagnostics.js', 'js/profil-etudiant-confidentiel.js',
    'js/profil-etudiant-sections-affichage.js', 'js/interventions.js', 'js/snapshots.js',
    'js/tableau-bord-apercu.js', 'js/graphiques-progression.js'];
const EXPORTS_WINDOW = (() => {
    const noms = new Set();
    for (const f of MODULES) for (const m of readFileSync(path.join(RACINE, f), 'utf8').matchAll(/^\s*window\.([A-Za-z_$][\w$]*)\s*=/gm)) noms.add(m[1]);
    return [...noms];
})();
function classList() { const s = new Set(); return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle() { return false; }, liste() { return [...s]; } }; }
function elementDom(init) {
    return Object.assign({ innerHTML: '', textContent: '', value: '', style: {}, dataset: {}, classList: classList(), setAttribute() {}, getAttribute() { return null; },
        appendChild() {}, addEventListener() {}, removeEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, insertAdjacentHTML() {}, remove() {} }, init || {});
}

function monter(jeu, opts = {}) {
    const store = Object.assign({
        infoCours: { id: 'GC1', nom: 'Cours banc', groupe: '01', _groupeCoursId: 'GC1' },
        groupeCoursActif: { id: 'GC1', trimestreId: 'test', nom: 'Groupe 01' },
        test_groupesCours: [{ id: 'GC1', coursId: 'GC1', trimestreId: 'test', actif: true, groupeNum: '01', pratiqueId: jeu.pratiqueId }],
        test_pratiquesConfigurables: clone(jeu.pratiques),
        test_productions: clone(jeu.productions),
        test_evaluationsSauvegardees: clone(jeu.evaluations),
        test_presences: clone(jeu.presences),
        test_echellesTemplates: clone(jeu.echelles),
        test_grillesTemplates: clone(jeu.grilles),
        test_groupeEtudiants: clone(jeu.etudiants),
        test_seancesCompletes: jeu.seances || seancesCompletes(),
        test_modalitesEvaluation: {},
        test_portfoliosEleves: {}
    }, opts.store || {});
    if (opts.sansIndicesA) delete store.test_indicesAssiduite;

    const ecritures = [], notifs = [], avertissements = [];
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); ecritures.push(k); },
        removeSync: (k) => { delete store[k]; ecritures.push('-' + k); },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); ecritures.push(k); },
        keys: async () => Object.keys(store),
        useIndexedDB: false, memoryCache: new Map()
    };
    const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);
    const prefs = Object.assign({ grilleReferenceDepistage: 'G1' }, opts.prefs || {});
    const obtenirPreference = (n) => (n in prefs ? prefs[n] : null);
    const definirPreference = (n, v) => { prefs[n] = v; ecritures.push('pref:' + n); };
    const elements = Object.assign({}, opts.elements || {});
    const document = {
        getElementById: (id) => elements[id] || null, querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom(), readyState: 'complete'
    };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', dateLocaleYMD: () => (opts.aujourdhui || '2026-05-15') };
    const fwd = (nom) => (...a) => win[nom](...a);
    const notifications = { succes(t, m) { notifs.push({ type: 'succes', t, m }); }, erreur(t, m) { notifs.push({ type: 'erreur', t, m }); }, info(t, m) { notifs.push({ type: 'info', t, m }); }, warning(t, m) { notifs.push({ type: 'warning', t, m }); } };

    let compteurIds = 0;
    // Tout ce qui ne dépend pas de modes.js : partagé par les deux bacs.
    const globauxBase = {
        document, db, cle, notifications, obtenirPreference, definirPreference,
        echapperHtml: (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        estEtudiantExclu: (e) => !!(e && e.statut && (e.statut === 'inactif' || e.statut === 'décrochage' || e.statut === 'abandon')),
        obtenirDureePeriode: () => 50,
        // Miroirs du calendrier et de l'horaire (geste 1, éprouvé) : dix lundis de deux périodes.
        obtenirSeancesCompletes: () => clone(store.test_seancesCompletes),
        obtenirSeancesHoraire: () => clone(opts.horaire || []),
        obtenirCalendrierComplet: () => calendrier(),
        genererSeancesCompletes() {},
        obtenirCoursActifId: () => store.infoCours && store.infoCours.id,
        // Copie de productions.js:152 (sept lignes, pure).
        obtenirEcheanceEffective: (production, gcId) => {
            if (production.echeancesParGroupe && gcId) { const e = production.echeancesParGroupe[gcId]; if (e) return { date: e.date || null, assignee: e.assignee !== false }; }
            return { date: production.dateEcheance || null, assignee: true };
        },
        resoudreModeleParId: (type, id) => { const l = store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []; return clone(l.find(m => m && m.id === id) || null); },
        genererIdUnique: (p) => p + 'BANC' + (++compteurIds),
        alert: (m) => { avertissements.push(m); }, confirm: () => true,
        afficherNotificationCopiee() {}, afficherSection() {}, afficherSousSection() {}, afficherListeEtudiantsConsultation() {},
        COULEURS: { indices: { A: '#1976D2', C: '#FF6B35', P: '#4CAF50' } }
    };

    // modes.js RÉEL, dans son propre bac branché sur le même store : c'est lui qui filtre par cours.
    const winModes = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', cle };
    chargerScript('js/modes.js', globauxBase, winModes);
    win.obtenirPratiqueActiveGroupeCours = winModes.obtenirPratiqueActiveGroupeCours;
    win.lirePointeurPratiqueGroupeCours = winModes.lirePointeurPratiqueGroupeCours;

    const globaux = Object.assign({}, globauxBase, {
        obtenirDonneesSelonMode: winModes.obtenirDonneesSelonMode, sauvegarderDonneesSelonMode: winModes.sauvegarderDonneesSelonMode,
        obtenirEtudiantsCoursActif: winModes.obtenirEtudiantsCoursActif, obtenirContexteCoursActif: winModes.obtenirContexteCoursActif,
        demarrerCacheLecture: winModes.demarrerCacheLecture, terminerCacheLecture: winModes.terminerCacheLecture, invaliderCacheLecture: winModes.invaliderCacheLecture,
        // Lot N2 (#716) : le P historique pose les évaluations échues dans le contexte de simulation de modes.js.
        definirContexteSimulation: winModes.definirContexteSimulation, effacerContexteSimulation: winModes.effacerContexteSimulation, contexteImposeNoteProvisoire: winModes.contexteImposeNoteProvisoire,
        filtrerEtudiantsParMode: winModes.filtrerEtudiantsParMode, estModeeLectureSeule: winModes.estModeeLectureSeule,
        // #834 lot E (cadrage « Rencontres », 12 sept. 2026) : l'identifiant du contexte, point unique de modes.js.
        obtenirIdContexteActif: winModes.obtenirIdContexteActif, contexteActifEstService: winModes.contexteActifEstService,
        // Aiguillages vers les exports réels, résolus à l'appel.
        obtenirPratiqueActiveGroupeCours: fwd('obtenirPratiqueActiveGroupeCours'), lirePointeurPratiqueGroupeCours: fwd('lirePointeurPratiqueGroupeCours')
        // (Le pont `obtenirDetailsAssiduite` que le banc prêtait à rapport.js n'a plus lieu d'être : #732 l'exporte — mesure B5.)
    });
    const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', '__audit'];
    for (const nom of EXPORTS_WINDOW) if (!(nom in globaux) && !/^[A-Z]/.test(nom) && !OBJETS_EXPORTES.includes(nom)) globaux[nom] = fwd(nom);

    chargerScript('js/interpretation-config.js', globaux, win);
    chargerScript('js/contexte-qualification.js', globaux, win);   // #821 lot A : les quatre règles de qualification d'un contexte
    chargerScript('js/pratiques/pratique-configurable.js', globaux, win);
    chargerScript('js/pratiques/pratique-registre.js', Object.assign({ PratiqueConfigurable: win.PratiqueConfigurable }, globaux), win);
    chargerScript('js/pratiques/pratique-manager.js', Object.assign({ PratiqueConfigurable: win.PratiqueConfigurable }, globaux), win);
    chargerScript('js/pratiques/pratique-sommative.js', globaux, win);
    chargerScript('js/pratiques/pratique-pan-standards.js', globaux, win);
    chargerScript('js/pratiques/pratique-pan-specifications.js', globaux, win);
    chargerScript('js/pratiques/denotation-jugements.js', globaux, win);
    chargerScript('js/portfolio.js', globaux, win);
    chargerScript('js/indices.js', globaux, win);
    chargerAvecInterne('js/saisie-presences.js', globaux, win, ['obtenirClasseSaisiePeriodes', 'validerDateSaisie']);
    chargerScript('js/profil-etudiant-actions.js', globaux, win);
    chargerScript('js/profil-etudiant-calculs.js', globaux, win);
    chargerScript('js/profil-etudiant-helpers.js', Object.assign({ PratiquePANStandards: win.PratiquePANStandards, PratiqueSommative: win.PratiqueSommative }, globaux), win);
    chargerScript('js/profil-etudiant-rapport.js', globaux, win);
    chargerScript('js/profil-etudiant-diagnostics.js', globaux, win);
    chargerScript('js/profil-etudiant-confidentiel.js', globaux, win);
    chargerAvecInterne('js/profil-etudiant-sections-affichage.js', globaux, win, ['obtenirDetailsAssiduite', 'genererSectionAccompagnement']);
    chargerAvecInterne('js/interventions.js', globaux, win, ['genererAffichageNotesIndividuelles']);
    chargerScript('js/snapshots.js', globaux, win);
    chargerAvecInterne('js/tableau-bord-apercu.js', globaux, win, ['_tousEtudiantsEnrichis', '_etudiantsPrioritaires', '_filtresActifs', 'appliquerFiltres', 'nettoyerEtudiantsSuivis', 'afficherAlerteNonParticipation']);
    chargerAvecInterne('js/graphiques-progression.js', globaux, win, ['obtenirDonneesCriteres', 'moyenneCriteresHabiletes', 'genererZonesDepuisEchelle']);

    /** La chaîne complète de calcul, comme l'ouverture du Suivi du groupe la déclenche. */
    const calculerTout = () => { win.calculerEtSauvegarderIndicesAssiduite(); win.calculerEtStockerIndicesCP(); };
    return { win, store, ecritures, notifs, avertissements, elements, db, calculerTout, interne: win.__audit };
}

/** Les nombres d'un élève sur les écrans du Suivi : indices, RàI, suivi des fondations, cible, contexte. */
function portrait(b, da) {
    const { win } = b;
    const indices = win.calculerTousLesIndices(da);
    const rai = win.determinerNiveauRaiPedagogique(da);
    const suivi = win.diagnostiquerSuiviApprentissage(da);
    const cible = win.determinerCibleIntervention(da);
    const contexte = win.determinerAlerteContextuelle(da);
    const n3 = win.calculerIndicesNDerniersArtefacts(da, true);
    return {
        A: indices.A, C: indices.C, P: indices.P, noteConstructible: indices.noteConstructible,
        rai: { niveau: rai.niveau, label: rai.label, pattern: rai.pattern, defi: rai.defi },
        suivi: suivi ? { ipb: suivi.ipb, direction: suivi.direction, diagnostic: suivi.diagnostic, rendUnPalier: ('niveauRaI' in suivi) || ('niveau' in suivi), scoreActuel: r3(suivi.scoreActuel) } : null,
        cible: { cible: cible.cible, niveau: cible.niveau, pattern: cible.pattern },
        contexte: { niveau: contexte.niveau, label: contexte.label },
        performance3: r3(n3.performance), nbArtefacts: n3.nbArtefacts
    };
}

/* =============================================================================================
   A · PRÉSENCES → ASSIDUITÉ
   ============================================================================================= */
describe('A · les présences saisies deviennent l\'indice A', () => {
    it('A1 · les quatre élèves de banc : A = 100, 40, 100 — et l\'incohérent est ABSENT partout ici (ses présences sont dans GC2)', () => {
        // À la main : dix séances de 2 périodes saisies pour le groupe (20 périodes offertes).
        //   Assidu 20/20 = 1,00 · Absent 8/20 = 0,40 (présent aux quatre premières, aucune fiche ensuite = absent)
        //   Silence 20/20 = 1,00 · Incohérent : ses dix fiches portent coursId GC2 → écartées par le filtre de
        //   cours ; il n'a pas de fiche dans le groupe → absent à toutes les séances saisies → 0/20 = 0,00.
        const b = monter(jeuBase());
        const a = (da) => b.win.calculerAssiduite(da, null);
        const res = noter('A1', { assidu: a(DA.ASSIDU), absent: a(DA.ABSENT), silence: a(DA.SILENCE), incoherent: a(DA.INCOHERENT) });
        expect(res.assidu).toEqual({ indice: 1, periodesPresentes: 20, periodesOffertes: 20, nombreSeances: 10 });
        expect(res.absent).toEqual({ indice: 0.4, periodesPresentes: 8, periodesOffertes: 20, nombreSeances: 10 });
        expect(res.silence.indice).toBe(1);
        expect(res.incoherent).toEqual({ indice: 0, periodesPresentes: 0, periodesOffertes: 20, nombreSeances: 10 });
    });

    it('A2 · le producteur écrit UNE clé namespacée (indicesAssiduite), enchaîne indicesCP, et n\'écrit RIEN pour le DA absent du groupe', () => {
        const b = monter(jeuBase());
        b.win.calculerEtSauvegarderIndicesAssiduite();   // seul : il enchaîne lui-même indicesCP
        const ecrits = b.ecritures.filter(k => /indices/.test(k));
        const stockA = b.store.test_indicesAssiduite;
        noter('A2', { ecrits, das: Object.keys(stockA.sommatif), A_absent: stockA.sommatif[DA.ABSENT].indice });
        expect(ecrits).toEqual(['test_indicesAssiduite', 'test_indicesCP']);
        expect(Object.keys(stockA.sommatif).sort()).toEqual([DA.ASSIDU, DA.ABSENT, DA.SILENCE]);
        // Lecteurs sans recalcul : calculerTousLesIndices lit le stock → l'incohérent n'y a aucune entrée. Valeur d'après #745
        // (17 sept.) : il n'est plus calculé du tout — A null, « hors groupe » (constat d'origine : A = 0, un nombre inventé).
        expect(b.win.calculerTousLesIndices(DA.INCOHERENT)).toMatchObject({ A: null, horsGroupe: true });
    });

    it('A3 · un élève ajouté en semaine 6 : les cinq séances d\'AVANT son arrivée comptent comme des absences', () => {
        // À la main : le groupe a saisi dix séances ; Silence n'a de fiche que sur les cinq dernières (présent).
        // Aucun champ « date d'arrivée » n'existe (grep dateAjout|dateInscription|dateArrivee js/ : rien sur un élève).
        // Les cinq premières séances sont saisies pour le groupe sans fiche pour lui → absent → 10/20 = 0,50.
        const jeu = jeuBase();
        jeu.presences = jeu.presences.filter(p => !(p.da === DA.SILENCE && DATES.indexOf(p.date) < 5));
        const b = monter(jeu);
        const a = noter('A3', b.win.calculerAssiduite(DA.SILENCE, null));
        expect(a.indice).toBe(0.5);
        expect(a.periodesOffertes).toBe(20);
    });

    it('A4 · congé, séance annulée, date future, autre groupe-cours le même jour : ce que la saisie refuse et ce que le calcul ignore', () => {
        // À la main : un congé n'est pas une séance (pas dans seancesCompletes) → jamais compté, même si une
        // fiche traînait à cette date ; une séance sans aucune saisie (annulée) n'entre ni au numérateur ni au
        // dénominateur ; une date future est refusée par la porte de saisie ; une fiche d'un autre groupe-cours
        // le même jour est écartée par le filtre de cours.
        const jeu = jeuBase();
        jeu.presences.push(pres(DA.ASSIDU, '2026-03-23', 2));           // congé : fiche fantôme
        jeu.presences.push(pres(DA.ASSIDU, '2026-01-12', 0, { coursId: 'GC2' })); // autre groupe-cours, même jour, absent là-bas
        delete jeu.seances;
        const b = monter(jeu, { aujourdhui: '2026-05-15' });
        const a = b.win.calculerAssiduite(DA.ASSIDU, null);
        const conge = b.interne['saisie-presences.js'].validerDateSaisie('2026-03-23');
        const future = b.interne['saisie-presences.js'].validerDateSaisie('2027-01-11');
        // Séance « annulée » = une séance au calendrier que PERSONNE n'a saisie : retirer toutes les fiches du 16 mars.
        const jeu2 = jeuBase(); jeu2.presences = jeu2.presences.filter(p => p.date !== '2026-03-16');
        const b2 = monter(jeu2);
        const a2 = b2.win.calculerAssiduite(DA.ABSENT, null);
        noter('A4', { congeCompte: a.periodesOffertes, congeRefus: conge.raison, futurRefus: future.raison, annuleeOffertes: a2.periodesOffertes, annuleeIndice: a2.indice });
        expect(a).toEqual({ indice: 1, periodesPresentes: 20, periodesOffertes: 20, nombreSeances: 10 });   // le congé et GC2 ne comptent pas
        expect(conge).toMatchObject({ valide: false, raison: 'conge', motif: 'Relâche' });
        expect(future).toMatchObject({ valide: false, raison: 'future' });
        expect(a2).toEqual({ indice: 8 / 18, periodesPresentes: 8, periodesOffertes: 18, nombreSeances: 9 });  // 9 séances saisies sur 10
    });

    it('A5 · les six constats de mai (N1-N6) remesurés : N1, N2, N3, N4, N5, N6 corrigés ; le parseInt de la classe couleur reste', () => {
        const b = monter(jeuBase());
        const src = readFileSync(path.join(RACINE, 'js/saisie-presences.js'), 'utf8');
        // N2 : un jour à DEUX séances de 2 périodes rend 4, pas la première seule.
        b.store.test_seancesCompletes['2026-01-12'] = [{ nombrePeriodes: 2 }, { nombrePeriodes: 2 }];
        const n2 = b.win.obtenirNombrePeriodesSeance('2026-01-12');
        // N1 : la branche « format inconnu » n'assigne plus rien (l'invariant est `+=`).
        const corpsHeures = src.slice(src.indexOf('function obtenirHeuresSeance'), src.indexOf('function formaterHeuresAffichage'))
            .split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');   // le code, pas les commentaires qui citent l'ancien `=`
        const n1 = { affectations: (corpsHeures.match(/^\s*totalHeures\s*=\s*[^=]/gm) || []).length, accumulations: (corpsHeures.match(/totalHeures\s*\+=/g) || []).length };
        // N3 : le flag est lu sur le DOM (dataset.facultatif) à l'édition live.
        const input = elementDom({ value: '0', dataset: { facultatif: 'true' } });
        b.win.appliquerCodeCouleurPeriodes(input, 2);
        const n3 = input.classList.liste();
        // N4 : les deux sites sans garde en ont une.
        const n4 = (src.match(/etudiants = etudiants \|\| \[\];/g) || []).length;
        // N5 : deux fiches, même élève, même date, deux cours — seule celle du cours actif est modifiée.
        b.store.test_presences.unshift(pres(DA.ASSIDU, '2026-01-19', 0, { coursId: 'GC2', notes: 'GC2 intact' }));
        const modifie = b.win.modifierNotesPresence(DA.ASSIDU, '2026-01-19', 'note du cours actif');
        const fiches = b.store.test_presences.filter(p => p.da === DA.ASSIDU && p.date === '2026-01-19').map(p => [p.coursId, p.notes]);
        // N6 : le motif de congé passe par echapperHtml.
        // #782 (7 sept. 2026) — MESURE MISE À JOUR, la valeur a changé pour une
        // bonne raison. Le 5 sept., N6 vérifiait que le message du compteur passait
        // par `echapperHtml()` avant d'entrer dans `innerHTML`. Ce chemin n'existe
        // plus : le message est posé en `textContent`, où l'injection de HTML est
        // impossible par construction plutôt que traitée. On mesure donc l'invariant
        // (le message n'est jamais du HTML), pas l'ancienne forme de sa défense.
        const n6 = /zoneMessage\.textContent = message/.test(src)
                   && !/compteur\.innerHTML\s*=/.test(src);
        // Le constat resté hors du JSON de mai : parseInt au rendu initial, parseFloat à l'édition.
        const initial = b.interne['saisie-presences.js'].obtenirClasseSaisiePeriodes(0.5, 2, false);
        const live = elementDom({ value: '0.5', dataset: {} }); b.win.appliquerCodeCouleurPeriodes(live, 2);
        noter('A5', { n1, n2, n3, n4, n5: { modifie, fiches }, n6, demiPeriode: { initial, live: live.classList.liste() } });
        expect(n2).toBe(4);
        expect(n1).toEqual({ affectations: 0, accumulations: 2 });
        expect(n3).toEqual(['saisie-absence-motivee']);
        expect(n4).toBe(2);
        expect(modifie).toBe(true);
        expect(fiches).toEqual([['GC2', 'GC2 intact'], ['GC1', 'note du cours actif']]);
        expect(n6).toBe(true);
        expect(initial).toBe('saisie-absence');                 // 0,5 période lue comme 0
        expect(live.classList.liste()).toEqual(['saisie-retard']); // la même valeur, lue comme 0,5
    });

    it('A6 · trois portes d\'écriture des présences, deux régimes : enregistrerPresences passe par le mode, les deux API directes non', () => {
        const src = readFileSync(path.join(RACINE, 'js/saisie-presences.js'), 'utf8');
        const parMode = (src.match(/sauvegarderDonneesSelonMode\('presences'/g) || []).length;
        const directes = (src.match(/db\.setSync\(clePresences, presences\)/g) || []).length;
        noter('A6', { parMode, directes });
        expect(parMode).toBe(1);   // enregistrerPresences
        expect(directes).toBe(3);  // sauvegarderPresencesSansValidation, modifierNotesPresence, ajouterPresencesIntervention
    });
});

/* =============================================================================================
   B · COMPLÉTION ET PERFORMANCE — la frontière avec les évaluations
   ============================================================================================= */
describe('B · ce que C compte comme remis, et quel P le Suivi lit', () => {
    it('B1 · les quatre élèves : C = 100 / 100 / 0, P = 77 / 63 / non constructible ; l\'incohérent n\'a pas d\'indices', () => {
        // À la main (sommative, moyenne pondérée 20/20/30/30) :
        //   Assidu (60·20 + 70·20 + 80·30 + 90·30) / 100 = 77,0 ; Absent (85·20 + 70·20 + 55·30 + 50·30) / 100 = 62,5 → 63 ;
        //   Silence : aucune évaluation → P null → « non constructible » (stocké 0) ; C = 0 remis sur 4 productions évaluées.
        const b = monter(jeuBase()); b.calculerTout();
        const cp = b.store.test_indicesCP;
        const res = noter('B1', {
            assidu: cp[DA.ASSIDU].actuel, absent: cp[DA.ABSENT].actuel, silence: cp[DA.SILENCE].actuel, incoherent: cp[DA.INCOHERENT] || null,
            pratiqueP: { assidu: b.win.obtenirPratiqueParId('som-banc').calculerPerformance(DA.ASSIDU), absent: b.win.obtenirPratiqueParId('som-banc').calculerPerformance(DA.ABSENT), silence: b.win.obtenirPratiqueParId('som-banc').calculerPerformance(DA.SILENCE) }
        });
        expect([res.assidu.C, res.assidu.P, res.assidu.noteConstructible]).toEqual([100, 77, true]);
        expect([res.absent.C, res.absent.P]).toEqual([100, 63]);
        expect([res.silence.C, res.silence.P, res.silence.noteConstructible]).toEqual([0, 0, false]);
        expect(res.incoherent).toBeNull();
        expect(res.pratiqueP.silence).toBeNull();
    });

    it('B2 · un BROUILLON (non verrouillé) : hors de la note du cours (#706), et depuis #737 hors de C ET du dépistage — valeur d\'après (constat d\'origine : remis pour C, artefact pour le dépistage)', () => {
        // À la main : Assidu, P4 en brouillon. Note du cours sans P4 = (60·20 + 70·20 + 80·30) / 70 = 71,43 → 71.
        // ↻ Valeur D'APRÈS #737 (lot A du 16 sept. 2026) : un brouillon ne compte nulle part. C sommatif = 3 remises sur
        // 4 productions évaluées (P4 l'est par les autres) = 75 ; la fenêtre du dépistage (3 derniers) lit 80, 70, 60 → 0,70 ;
        // le RàI pédagogique croise P = 0,71 (< 0,75) et 0,70 (< 0,75, ≥ 0,64) → niveau 2, « Difficulté émergente ».
        // Avant : C 100 (« noteFinale !== null » suffisait), 90/80/70 → 0,80, niveau 2 « Stable ».
        const jeu = jeuBase(); jeu.evaluations.find(e => e.id === 'E1P4').verrouillee = false;
        const b = monter(jeu); b.calculerTout();
        const p = portrait(b, DA.ASSIDU);
        const ecartees = b.win.compterEvaluationsEcarteesDeLaNote(DA.ASSIDU);
        noter('B2', { p, ecartees });
        expect(p.P).toBe(71);
        expect(ecartees).toEqual({ brouillons: 1, sansPortee: 0, total: 1 });
        expect(p.C).toBe(75);                     // le brouillon n'est PAS remis pour C — avant 100
        expect(p.performance3).toBe(0.7);         // ni un artefact du dépistage — avant 0,80 (90, 80, 70)
        expect(p.nbArtefacts).toBe(3);
        expect(p.rai).toMatchObject({ niveau: 2, pattern: 'Difficulté émergente' });   // avant : « Stable »
    });

    it('B3 · une REPRISE : la note du cours remplace, et le dépistage aussi (#730 ; avant, il comptait l\'originale ET la reprise)', () => {
        // À la main : Absent reprend P3 (55 → 75, le 20 avril). Note du cours = (1700 + 1400 + 75·30 + 1500) / 100 = 68,5 → 69,
        // donc niveau 2 (< 0,75). Les trois évaluations les plus récentes, si la remplacée est écartée : P4 50, P3' 75, P2 70
        // → 0,65 ; si elle ne l'est pas : P4 50, P3' 75, P3 55 → 0,60. Même question pour l'IPB (fenêtre de 3 sur les
        // fondations) et pour les moyennes par critère.
        const jeu = jeuBase();
        jeu.evaluations.find(e => e.id === 'E2P3').remplaceeParId = 'E2P3R';
        jeu.evaluations.find(e => e.id === 'E2P3').archivee = true;
        jeu.evaluations.push(ev('E2P3R', DA.ABSENT, 'P3', 75, 'M', ['M', 'M', 'M'], { repriseDeId: 'E2P3', jetonRepriseApplique: true, dateEvaluation: '2026-04-20T12:00:00.000Z' }));
        const b = monter(jeu); b.calculerTout();
        const p = portrait(b, DA.ABSENT);
        const ipb = b.win.calculerIPB(DA.ABSENT);
        const moy = b.win.calculerMoyennesCriteres(DA.ABSENT);
        noter('B3', { P: p.P, performance3: p.performance3, nbHistorique: ipb.historiqueComplet.length, scoresParArtefact: ipb.scoresParArtefact.map(r3), ipb: ipb.ipb, moyStructure: r3(moy.structure), rai: p.rai, suivi: p.suivi });
        // ↻ Valeurs D'APRÈS #730 (5 sept. 2026, soir) ; l'avant en commentaire.
        expect(p.P).toBe(69);                                        // la note du cours REMPLACE (inchangé)
        expect(p.performance3).toBe(0.65);                           // 50, 75, 70 — avant 0,60 (50, 75, 55 : l'originale remplacée était dedans)
        expect(ipb.historiqueComplet.length).toBe(4);                // quatre artefacts pour quatre productions — avant 5
        expect(r3(moy.structure)).toBe(r3((0.75 + 0.65 + 0.75 + 0.40) / 4)); // 0,6375 — avant 0,59 (l'originale pesait)
        expect(p.rai).toMatchObject({ niveau: 2, pattern: 'Difficulté émergente' });   // avant : niveau 3 « Difficulté persistante » (0,60 < 0,64)
    });

    it('B4 · un « non remis » enregistré avec 0 : écarté par le C sommatif COMME par le C des snapshots — valeur d\'après #738 (constat d\'origine : C sommatif 25)', () => {
        // À la main : Silence reçoit une évaluation P1 à 0 marquée statutRemise « non-remis ». ↻ Valeur D'APRÈS #738 (lot A du
        // 16 sept. 2026, volet complétion) : la complétion ne compte JAMAIS un non-remis, par `evaluationNonRemise` (registre)
        // → 0 remise sur 4 = 0 ; le C historique des snapshots l'exclut toujours → 0/1 = 0 au 1er février. Avant : C sommatif 25
        // (« noteFinale !== null » suffisait ; le corps de calculerCompletion ne lisait pas le statut).
        const jeu = jeuBase();
        jeu.evaluations.push(ev('E3P1', DA.SILENCE, 'P1', 0, '0', ['0', '0', '0'], { statutRemise: 'non-remis' }));
        const b = monter(jeu); b.calculerTout();
        const cSom = b.store.test_indicesCP[DA.SILENCE].actuel.C;
        const hist = b.win.calculerIndicesHistoriques(DA.SILENCE, '2026-02-15');
        const srcSom = readFileSync(path.join(RACINE, 'js/pratiques/pratique-sommative.js'), 'utf8');
        const corpsC = tranche(srcSom, '    calculerDetailsCompletion(da) {', '    calculerCompletion(da) {')   /* #871 : le compte vit dans le détail */;
        noter('B4', { cSom, cSnapshot: hist.C, completionSomLitLePredicat: /evaluationNonRemise\(/.test(corpsC) });
        expect(cSom).toBe(0);                                  // avant : 25
        expect(hist.C).toBe(0);
        expect(/evaluationNonRemise\(/.test(corpsC)).toBe(true);   // le C courant lit le prédicat du registre — avant : ne lisait aucun statut
    });

    it('B5 · le même P partout : tableau de bord, liste, profil ET rapport lisent le même stock (#732 ; avant, le rapport levait, puis recalculait le sien)', () => {
        // À la main : le stock indicesCP dit 77 pour Assidu. Avant #732 : « Performance : 75% (4 meilleurs artefacts actuels) » et
        // « Complétion : 100% (0 remises / 0 productions) » — et dans l'application, une ReferenceError. Après : 77 (note du cours), 4 remises / 4.
        const b = monter(jeuBase()); b.calculerTout();
        const stock = b.win.calculerIndicesEtudiant(DA.ASSIDU).sommatif.performance * 100;   // ce que lit le tableau de bord
        const profil = b.win.calculerTousLesIndices(DA.ASSIDU).P;                              // ce que lit le profil et la liste
        // #732 — `obtenirDetailsAssiduite` est désormais exportée (avant : 0 export, et rapport.js l'appelait par son nom nu).
        const exportsDetailsA = readFileSync(path.join(RACINE, 'js/profil-etudiant-sections-affichage.js'), 'utf8').match(/window\.obtenirDetailsAssiduite\s*=/g) || [];
        const appelNu = /const detailsA = obtenirDetailsAssiduite\(da\);/.test(readFileSync(path.join(RACINE, 'js/profil-etudiant-rapport.js'), 'utf8'));
        const rapport = b.win.genererRapportAPI(DA.ASSIDU);
        const ligneP = (rapport.match(/Performance : [^\n]*/) || [''])[0];
        const ligneC = (rapport.match(/Complétion : [^\n]*/) || [''])[0];
        noter('B5', { stock, profil, ligneP, ligneC, exportsDetailsA: exportsDetailsA.length, appelNu });
        expect(exportsDetailsA.length).toBe(1);                               // avant : 0
        expect(appelNu).toBe(true);
        expect(stock).toBe(77);
        expect(profil).toBe(77);
        expect(ligneP).toBe('Performance : 77% (note du cours)');             // avant : « 75% (4 meilleurs artefacts actuels) »
        expect(ligneC).toBe('Complétion : 100% (4 remises / 4 productions)');  // avant : « 0 remises / 0 productions »
    });
});

/* =============================================================================================
   C · NIVEAU, IPB, PATTERNS, PALIER — les deux définitions de la maîtrise
   ============================================================================================= */
describe('C · le palier que chaque écran rend, et l\'échelle qu\'il lit', () => {
    it('C1 · l\'assidu qui progresse : IPB 0 ↗ « Maîtrise acquise », RàI niveau 1 « Stable », cible « Maîtrise acquise »', () => {
        // À la main : fondations par artefact (Structure, Rigueur) : P1 0,65 · P2 0,70 · P3 0,75 · P4 0,875 ; la plus récente
        // ≥ 0,70 → IPB 0 ; 0,875 − 0,75 = +0,125 > 0,10 → ↗. Moyennes : Structure 0,7625, Rigueur 0,725, Nuance 0,7625 :
        // aucun défi (< 0,70). P 0,77 ≥ 0,75, performance des 3 derniers 0,80 → « Stable », niveau 1.
        const b = monter(jeuBase()); b.calculerTout();
        const p = noter('C1', portrait(b, DA.ASSIDU));
        expect(p.suivi).toMatchObject({ ipb: 0, direction: '↗', diagnostic: 'Maîtrise acquise', rendUnPalier: false });   // #744 (17 sept.) : le suivi ne rend plus de palier
        expect(p.rai).toMatchObject({ niveau: 1, pattern: 'Stable', defi: 'Aucun' });
        expect(p.cible).toMatchObject({ niveau: 1, cible: 'Maîtrise acquise', pattern: 'Stable' });
        expect(p.contexte.niveau).toBe('tres-favorable');
    });

    it('C2 · l\'absent qui régresse : IPB 3 → « Difficulté persistante », sans palier (#744) ; RàI niveau 3, défi « Structure » ; contexte « fragile »', () => {
        // À la main : fondations P4 0,40 · P3 0,40 · P2 0,65 — trois sous 0,70 → IPB 3 ; 0,40 − 0,40 = 0 → « → ».
        // Moyennes : Structure 0,55 · Rigueur 0,6125 · Nuance 0,6375 → défi principal Structure. P 0,625 < 0,64 → niveau 3.
        // Contexte : A 0,40 < 0,65 → « fragile ».
        const b = monter(jeuBase()); b.calculerTout();
        const p = noter('C2', portrait(b, DA.ABSENT));
        expect(p.suivi).toMatchObject({ ipb: 3, direction: '→', diagnostic: 'Difficulté persistante', rendUnPalier: false });
        expect(p.rai).toMatchObject({ niveau: 3, pattern: 'Difficulté persistante', defi: 'Structure' });
        expect(p.cible.niveau).toBe(3);
        expect(p.cible.cible).toMatch(/^Difficulté persistante — Structure/);
        expect(p.contexte.niveau).toBe('fragile');
    });


    it('C4 · une échelle 60 / 75 / 90 : 62 est « D » sur l\'échelle, « Difficulté persistante » niveau 3 pour le RàI', () => {
        // À la main : trois travaux à 62, critères « D » (valeur 67, sous le seuil de défi 0,70 → défis). P 0,62 < idme.insuffisant 0,64
        // → niveau 3. Sur son échelle, 62 tombe dans D (60-74), le deuxième palier sur quatre.
        const jeu = jeuBase();
        jeu.echelles = [clone(E60)]; jeu.grilles[0].echelleId = 'E60'; jeu.productions.forEach(p => { p.echelleId = 'E60'; });
        jeu.evaluations = ['P1', 'P2', 'P3'].map(pid => ev('E1' + pid, DA.ASSIDU, pid, 62, 'D', ['D', 'D', 'D'], { echelleId: 'E60' }));
        const b = monter(jeu); b.calculerTout();
        const p = portrait(b, DA.ASSIDU);
        const situe = b.win.situerPourcentageDansEchelle(62, E60);
        noter('C4', { rai: p.rai, P: p.P, niveauEchelle: situe && situe.code, suivi: p.suivi });
        expect(situe.code).toBe('D');
        expect(p.rai).toMatchObject({ niveau: 3, pattern: 'Difficulté persistante' });
        expect(p.suivi).toMatchObject({ ipb: 3, diagnostic: 'Difficulté persistante' });   // 0,67 < 0,70 : les fondations sont « en défi » sur cette échelle
    });

    it('C5 · un critère analytique en points (21/30 = 70 %) : le dépistage lit les POINTS (0,70), plus le niveau déduit — valeur d\'après #739 (constat d\'origine : 0,65)', () => {
        // À la main : la note de la copie compte 21/30 ; le dépistage lisait `niveauSelectionne` D par l'échelle → 0,65.
        // ↻ #739 (lot B du 16 sept. 2026) : `scoreCritereEvaluation` lit `points / ponderation` → 0,70 — comme les courbes.
        // Remesure du 16 sept. : la fiche disait `pointsMax` ; le champ que porte `evaluation.criteres[]` (lot 2 du 4 sept.,
        // `_collecterCriteresAutoSave`) est `ponderation` — 30 ici, celle du critère Structure de la grille.
        const jeu = jeuBase();
        jeu.evaluations = [ev('E1P1', DA.ASSIDU, 'P1', 70, 'D', ['D', 'D', 'D'])];
        jeu.evaluations[0].criteres[0] = Object.assign(jeu.evaluations[0].criteres[0], { type: 'analytique', points: 21 });
        jeu.evaluations[0].pointsAnalytiques = { c1: 21 };
        const b = monter(jeu); b.calculerTout();
        const moy = b.win.calculerMoyennesCriteres(DA.ASSIDU);
        noter('C5', { structure: moy.structure, pointsLus: moy.structure === 0.7 });
        expect(jeu.evaluations[0].criteres[0].ponderation).toBe(30);
        expect(moy.structure).toBeCloseTo(0.70, 10);
    });

    it('C6 · un critère SOLO « Aucun » sort de TOUT le dépistage : IPB, défi principal de la carte RàI, défi spécifique, moyennes — valeur d\'après #740 (constat d\'origine : Méthode devenait le défi principal, pattern « Défi spécifique »)', () => {
        // À la main : quatrième critère « Méthode » (niveauSOLO 'aucun'), noté I (0,40) partout chez l'assidu. L'IPB ne surveillait
        // que Structure et Rigueur (libellé : « surveillés : Structure, Rigueur »), mais diagnostiquerForcesChallenges,
        // identifierDefiSpecifique et calculerMoyennesCriteres n'avaient pas de filtre SOLO : Méthode devenait le défi principal.
        // ↻ #740 (lot B du 16 sept. 2026) : un seul filtre (`estCritereSurveilleParDepistage`, helpers) pour tous les lecteurs —
        // l'assidu retrouve le portrait de C1 (aucun défi, « Stable »), et « methode » n'a pas de clé dans les moyennes.
        const jeu = jeuBase();
        jeu.grilles[0].criteres.push({ id: 'c4', nom: 'Méthode', ponderation: 0, niveauSOLO: 'aucun' });
        jeu.evaluations.filter(e => e.etudiantDA === DA.ASSIDU).forEach(e => e.criteres.push({ critereId: 'c4', critereNom: 'Méthode', niveauSelectionne: 'I', ponderation: 0 }));
        const b = monter(jeu); b.calculerTout();
        const rai = b.win.determinerNiveauRaiPedagogique(DA.ASSIDU);
        const defi = b.win.identifierDefiSpecifique(DA.ASSIDU);
        const ipb = b.win.calculerIPB(DA.ASSIDU);
        const libelle = b.win.libelleCriteresMultiSurveilles(b.store.test_grillesTemplates[0]);
        const moy = b.win.calculerMoyennesCriteres(DA.ASSIDU);
        noter('C6', { raiDefi: rai.defi, raiPattern: rai.pattern, defiSpecifique: defi, criteresIPB: ipb.criteresMulti, libelle, clesMoyennes: Object.keys(moy) });
        expect(ipb.criteresMulti).toEqual(['structure', 'rigueur']);
        expect(libelle).toBe('Critères multistructurels surveillés : Structure, Rigueur');
        expect(rai.defi).toBe('Aucun');
        expect(rai.pattern).toBe('Stable');
        expect(defi.defi).toBe('Aucun');
        expect(Object.keys(moy)).toEqual(['structure', 'rigueur', 'nuance']);
    });

    it('C7 · une évaluation SANS texte de rétroaction finale : elle compte dans P ET dans le dépistage — valeur d\'après #741 (constat d\'origine : trois artefacts pour l\'IPB, pas quatre)', () => {
        // À la main : Assidu, P4 enregistrée sans `retroactionFinale`. P la compte (90 → 77). ↻ Valeur D'APRÈS #741 (lot A du
        // 16 sept. 2026) : l'IPB, les moyennes par critère et le défi spécifique lisent `evaluationEntreDansLaNote`, plus
        // `e.retroactionFinale` → P4 existe pour eux : quatre artefacts, score actuel = P4 sur Structure E (1,0) et Rigueur M (0,75)
        // → 0,875. Avant : trois artefacts, score actuel P3 (0,75).
        const jeu = jeuBase(); jeu.evaluations.find(e => e.id === 'E1P4').retroactionFinale = '';
        const b = monter(jeu); b.calculerTout();
        const p = portrait(b, DA.ASSIDU);
        const ipb = b.win.calculerIPB(DA.ASSIDU);
        noter('C7', { P: p.P, nbArtefactsPerformance: p.nbArtefacts, nbHistoriqueIPB: ipb.historiqueComplet.length, dernierScoreIPB: r3(ipb.scoreActuel) });
        expect(p.P).toBe(77);
        expect(p.nbArtefacts).toBe(3);                 // la fenêtre des 3 derniers (N = 3), inchangée
        expect(ipb.historiqueComplet.length).toBe(4);  // l'IPB voit P4 — avant : 3
        expect(r3(ipb.scoreActuel)).toBe(0.875);       // P4 — avant : P3 (0,75)
    });
});

/* =============================================================================================
   D · DIAGNOSTIC CROISÉ ET CIBLE D'INTERVENTION — l'élève dont on ne sait rien
   ============================================================================================= */
describe('D · quel palier pour celui dont on ne sait rien', () => {
    it('D1 · Silence (présent partout, rien remis alors que quatre travaux sont évalués) : niveau 3 « Non-participation » ; contexte « En attente »', () => {
        // À la main : nbArtefacts 0 et A > 0 → « Non-participation », niveau 3 (RàI et cible) ; determinerAlerteContextuelle
        // juge C non calculable (nbArtefacts 0, C 0) → « En attente ». Ici les quatre productions ONT été évaluées : le signal est fondé.
        const b = monter(jeuBase()); b.calculerTout();
        const p = noter('D1', portrait(b, DA.SILENCE));
        expect(p.rai).toMatchObject({ niveau: 3, label: 'Non-participation' });
        expect(p.cible).toMatchObject({ niveau: 3, cible: 'Non-participation' });
        expect(p.contexte).toMatchObject({ niveau: 'attente', label: 'En attente' });
        expect(p.suivi).toBeNull();
    });

    it('D2 · DÉBUT DE TRIMESTRE : présences prises, AUCUNE évaluation pour personne → « En attente » partout (#731 ; avant : « Non-participation » niveau 3 pour les trois)', () => {
        // À la main : la règle de Grégoire (5 sept.) — « Non-participation » seulement si un travail est dû ET qu'une copie du groupe est
        // évaluée. Ici les quatre travaux sont dus, aucune copie n'est évaluée → la garde rend { possible: false, raison: 'aucune-copie-evaluee' } :
        // carte RàI niveau 0, cible niveau 0, aucune alerte nommée. Avant #731, la règle ne regardait que « A > 0 et nbArtefacts 0 ».
        const jeu = jeuBase(); jeu.evaluations = [];
        const inserts = [];
        const b = monter(jeu, { elements: { 'carte-indicateurs-acpe': elementDom({ insertAdjacentHTML: (ou, h) => inserts.push(h) }) } }); b.calculerTout();
        const garde = b.win.depistagePeutJugerLaNonParticipation();
        const niveaux = [DA.ASSIDU, DA.ABSENT, DA.SILENCE].map(da => b.win.determinerNiveauRaiPedagogique(da).label);
        const cibles = [DA.ASSIDU, DA.ABSENT, DA.SILENCE].map(da => b.win.determinerCibleIntervention(da).cible);
        // L'alerte nommée RÉELLE du tableau de bord, avec ce qu'il lui passe (calculerIndicesEtudiant par élève).
        b.interne['tableau-bord-apercu.js'].afficherAlerteNonParticipation([DA.ASSIDU, DA.ABSENT, DA.SILENCE].map(da => Object.assign({ da }, b.win.calculerIndicesEtudiant(da))));
        noter('D2', { garde, niveaux, cibles, alerteNommee: inserts.length });
        expect(garde).toEqual({ possible: false, raison: 'aucune-copie-evaluee' });
        expect(niveaux).toEqual(['En attente', 'En attente', 'En attente']);        // avant : trois « Non-participation »
        expect(cibles).toEqual(['En attente', 'En attente', 'En attente']);         // avant : trois « Non-participation »
        expect(inserts.length).toBe(0);                                              // avant : « 3 étudiants présents sans aucun travail remis »
    });

    it('D3 · ZÉRO DONNÉE (ni présence ni évaluation) : A est INCONNU (null, #743 — avant le lot D : 100 par défaut), et le palier reste « En attente » — avant #731 : « Non-participation » dès le premier calcul', () => {
        // À la main : calculerAssiduite sans aucune séance saisie rend { indice: null } — assiduité inconnue (#743, lot D du 19 sept. 2026 ; avant : { indice: 1 }, 100 %).
        // Avant #731, le RàI lisait A > 0 → « Non-participation » dès que le stock indicesAssiduite existait. La garde le couvre : aucune copie évaluée.
        const jeu = jeuBase(); jeu.evaluations = []; jeu.presences = [];
        const avant = monter(jeu);
        const raiAvant = avant.win.determinerNiveauRaiPedagogique(DA.ASSIDU);
        const apres = monter(jeu); apres.calculerTout();
        const raiApres = apres.win.determinerNiveauRaiPedagogique(DA.ASSIDU);
        const A = apres.win.calculerTousLesIndices(DA.ASSIDU).A;
        noter('D3', { avantCalcul: { niveau: raiAvant.niveau, label: raiAvant.label }, apresCalcul: { niveau: raiApres.niveau, label: raiApres.label, A } });
        expect(raiAvant).toMatchObject({ niveau: 0, label: 'En attente' });
        expect(A).toBeNull();                                                        // #743 : inconnue, ni 100 ni 0
        expect(raiApres).toMatchObject({ niveau: 0, label: 'En attente' });          // avant #731 : niveau 3 « Non-participation »
    });

    it('D4 · UNE SEULE évaluation faible : le suivi des fondations dit « Difficulté récente » SANS palier, la carte RàI dit niveau 3, la cible la suit (#744)', () => {
        // À la main : Silence remet P1 à 55 (I, I, D). Fondations 0,40 < 0,70 → IPB 1, pas de précédent → « → » → « Difficulté
        // récente » (mot de Grégoire, 17 sept. ; avant : « Difficulté émergente », niveau RàI 1 par la matrice IPB × direction).
        // Le RàI pédagogique lit P = 0,55 < 0,64 → niveau 3 « Difficulté persistante ». Avant #744, la cible rendait 1 : deux paliers.
        const jeu = jeuBase(); jeu.evaluations.push(ev('E3P1', DA.SILENCE, 'P1', 55, 'I', ['I', 'I', 'D']));
        const b = monter(jeu); b.calculerTout();
        const p = noter('D4', portrait(b, DA.SILENCE));
        expect(p.suivi).toMatchObject({ ipb: 1, direction: '→', diagnostic: 'Difficulté récente', rendUnPalier: false });
        expect(p.rai).toMatchObject({ niveau: 3, pattern: 'Difficulté persistante' });
        expect(p.cible.niveau).toBe(3);   // #744 : la cible suit la carte RàI (avant : 1, le palier du suivi)
        expect(p.cible.cible).toMatch(/^Difficulté récente/);   // le suivi NOMME toujours la cible
    });

    it('D4 bis · SANS suivi (aucune grille de référence) : la cible nomme la cause ET rend le palier de la carte (#744 ; avant : niveau null)', () => {
        // À la main : préférence `grilleReferenceDepistage` vide → `calculerIPB` rend null → aucun suivi. La carte RàI, elle,
        // ne dépend pas du suivi. Avant #744 la cible rendait `niveau: null` (« Intensité non calculable ») : l'intensité EST
        // calculable, c'est la carte qui la donne ; seule la persistance ne l'est pas.
        const b = monter(jeuBase(), { prefs: { grilleReferenceDepistage: null } }); b.calculerTout();
        const p = noter('D4bis', portrait(b, DA.ABSENT));
        expect(p.suivi).toBeNull();
        expect(p.rai.niveau).toBeGreaterThanOrEqual(1);
        expect(p.cible.niveau).toBe(p.rai.niveau);
        expect(p.cible.cible).toMatch(/^Persistance non calculable/);
    });

    it('D5 · l\'incohérent (DA hors du groupe, évaluation sur une production inexistante) : invisible aux écrans du groupe, et PLUS calculé — valeur d\'après #745 (constat d\'origine : A 0, P 83 « à la volée »)', () => {
        // Constat d'origine (5 sept.) : absent de groupeEtudiants → aucun indice stocké ; calculerTousLesIndices retombait sur un repli
        // « à la volée » : A 0, C 0, P = les 3 meilleures notes = (95 + 70) / 2 = 82,5 → 83, la production fantôme comprise.
        // Depuis #745 (lot E du cadrage du dépistage, 17 sept. 2026 ; tranché par Grégoire le 16) : un DA qui n'est plus dans le groupe
        // n'est PAS calculé — A, C, P, M null, `horsGroupe`. Le repli est retiré. Le dépistage, lui, filtre toujours par productionsIds
        // (une seule évaluation, P1 à 70) et les moyennes par critère comptent toujours la fantôme : ces deux-là ne sont pas de ce lot.
        const b = monter(jeuBase()); b.calculerTout();
        const indices = b.win.calculerTousLesIndices(DA.INCOHERENT);
        const n3 = b.win.calculerIndicesNDerniersArtefacts(DA.INCOHERENT, true);
        const moy = b.win.calculerMoyennesCriteres(DA.INCOHERENT);
        const enrichis = b.win.calculerEtudiantsPrioritaires.call(null); b.interne['tableau-bord-apercu.js']._tousEtudiantsEnrichis;
        const dansGroupe = b.interne['tableau-bord-apercu.js']._tousEtudiantsEnrichis.some(e => e.da === DA.INCOHERENT);
        noter('D5', { A: indices.A, C: indices.C, P: indices.P, nbArtefactsDepistage: n3.nbArtefacts, performance3: r3(n3.performance), moyStructure: r3(moy.structure), dansTableauDeBord: dansGroupe, enrichis: enrichis.length });
        expect(indices).toEqual({ A: null, C: null, P: null, M: null, pratique: 'SOM', noteConstructible: false, horsGroupe: true });
        expect(n3).toMatchObject({ nbArtefacts: 1, performance: 0.7 });   // le dépistage l'écarte
        expect(r3(moy.structure)).toBe(r3((0.65 + 1.0) / 2));   // mais les moyennes par critère la comptent
        expect(dansGroupe).toBe(false);
    });

    it('D6 · #554 : un élève en décrochage n\'est jamais lu « Décrochage » par la cible (le troisième argument n\'est pas passé)', () => {
        const jeu = jeuBase(); jeu.etudiants[1].statut = 'décrochage';
        const b = monter(jeu); b.calculerTout();
        const cible = b.win.determinerCibleIntervention(DA.ABSENT);
        noter('D6', { cible: cible.cible, niveau: cible.niveau });
        expect(cible.cible).not.toBe('Décrochage');
    });
});

/* =============================================================================================
   E · INTERVENTIONS
   ============================================================================================= */
describe('E · le cycle d\'une intervention et ce qu\'il écrit', () => {
    // ↻ Lot 5 du cadrage 11 (12 sept. 2026) : `creerIntervention` et `marquerPresences` sont retirées (aucun appelant
    // en production). La création suit les vrais gestes — « Planifier » (le brouillon, en mémoire) puis « Enregistrer » —,
    // les champs du formulaire portant ce que l'objet `data` portait (`marquerNonParticipantsMotives` et `seanceConcernee`
    // se déduisent du contexte « rattrapage », comme à l'écran). Les participants d'un cas de banc se posent en base.
    function creer(b, extra) {
        const d = Object.assign({ date: '2026-02-09', duree: 2, niveauRai: 2, titre: 'Rattrapage banc', contexte: 'rattrapage', seanceConcernee: '2026-02-09' }, extra || {});
        const champs = { interventionNiveau: d.niveauRai, interventionContexte: d.contexte, interventionTitre: d.titre, interventionDate: d.date, interventionHeure: '',
            interventionDuree: d.duree, interventionDescription: '', interventionSeance: d.seanceConcernee || '', observationsIntervention: '' };
        for (const [idChamp, v] of Object.entries(champs)) b.elements[idChamp] = elementDom({ value: String(v) });
        if (!b.elements.conteneurPrincipal) b.elements.conteneurPrincipal = elementDom();
        b.win.afficherFormulaireIntervention();
        const id = (b.elements.conteneurPrincipal.innerHTML.match(/data-action="sauvegarderPresencesIntervention" data-param="([^"]+)"/) || [])[1];
        b.win.sauvegarderPresencesIntervention(id);
        return id;
    }
    const participer = (b, id, das) => { const t = b.store.test_interventions; t.find(i => i.id === id).etudiants = das; b.store.test_interventions = t; };
    it('E1 · les clés sont namespacées par trimestre ; l\'intervention ne portait AUCUN groupe-cours (constat du 5) — depuis #834 lot D, elle porte son groupe-cours de naissance et la liste ne la montre plus sous un autre (valeur d\'après)', () => {
        const b = monter(jeuBase());
        const naissance = b.store.infoCours._groupeCoursId || b.store.infoCours.id;
        const id = creer(b);
        const cleEcrite = b.ecritures.filter(k => /interventions/.test(k));
        // Changer de groupe-cours actif (GC2) : le magasin du trimestre est le même, la LISTE ne l'est plus.
        b.store.infoCours = { id: 'GC2', nom: 'Autre cours', groupe: '02', _groupeCoursId: 'GC2' };
        b.store.groupeCoursActif = { id: 'GC2', trimestreId: 'test' };
        const sousGC2 = b.win.obtenirInterventions();
        noter('E1', { cleEcrite, champsCours: Object.keys(sousGC2[0]).filter(k => /cours|groupe/i.test(k)), stockSousGC2: sousGC2.length, visiblesSousGC2: b.win.interventionsDuContexteActif(sousGC2).length });
        expect(cleEcrite).toEqual(['test_interventions']);
        expect(sousGC2.length).toBe(1);
        expect(sousGC2[0].id).toBe(id);
        expect(sousGC2[0].groupeCoursId).toBe(naissance);
        expect(b.win.interventionsDuContexteActif(sousGC2).length).toBe(0);
    });

    it('E2 · le transfert des présences d\'un rattrapage : l\'absent présent au rattrapage passe de 40 à 50 % ; un rattrapage hors séance ne compte pas ; un présent le jour même est ignoré', () => {
        // À la main : Absent n'a pas de fiche le 9 février (absent). Le rattrapage du 9 février (2 périodes) où il est présent
        // écrit une fiche facultative { heures: 2 } → calculerAssiduite lit `heures` comme des périodes (#728) → présent 2/2 ce
        // jour-là → 10/20 = 0,50. Assidu, absent du rattrapage : « Absence motivée RàI » à 0 — mais il a déjà une fiche le 9 février
        // (présent au cours) : le contrôle de doublon (da + date + coursId, sans regarder `facultatif`) rejette l'entrée.
        const jeu = jeuBase(); jeu.presences = jeu.presences.filter(p => !(p.da === DA.SILENCE && p.date === '2026-02-09'));   // Silence absent du cours ce jour-là
        const b = monter(jeu); b.calculerTout();
        const silenceAvant = b.win.calculerAssiduite(DA.SILENCE, null).indice;   // 18/20 = 0,90
        const id = creer(b);
        participer(b, id, [DA.ABSENT]);
        b.win.transfererPresencesVersModule(id);
        const silenceApres = b.win.calculerAssiduite(DA.SILENCE, null);
        const fiches = b.store.test_presences.filter(p => p.date === '2026-02-09' && p.facultatif).map(p => ({ da: p.da, heures: p.heures, notes: p.notes }));
        const aApres = b.win.calculerAssiduite(DA.ABSENT, null);
        // Hors séance : un rattrapage un mardi.
        const id2 = creer(b, { date: '2026-02-10', seanceConcernee: null, marquerNonParticipantsMotives: false, contexte: 'hors-classe' });
        participer(b, id2, [DA.ABSENT]);
        b.win.transfererPresencesVersModule(id2);
        const aMardi = b.win.calculerAssiduite(DA.ABSENT, null);
        noter('E2', { fiches, A_apres: aApres.indice, A_apresMardi: aMardi.indice, silence: { avant: silenceAvant, apres: silenceApres.indice, offertes: silenceApres.periodesOffertes } });
        expect(fiches).toEqual([
            { da: DA.ABSENT, heures: 2, notes: 'Intervention RàI : Rattrapage banc' },
            { da: DA.SILENCE, heures: 0, notes: 'Absence motivée RàI' }
        ]);   // Assidu : rejeté par le contrôle de doublon (il a une fiche régulière le même jour)
        expect([silenceAvant, silenceApres.indice, silenceApres.periodesOffertes]).toEqual([0.9, 1, 18]);   // l'absence motivée RETIRE la séance : 18/18
        expect(aApres.indice).toBe(0.5);
        expect(aMardi.indice).toBe(0.5);   // le mardi n'est pas une séance : rien ne change
    });

    it('E3 · retirer l\'élève du groupe : l\'intervention garde son DA ; sa note individuelle disparaissait de l\'affichage sans un mot — depuis le lot 5 du cadrage 11, elle reste, grisée, « (n\'est plus dans le groupe) » (valeur d\'après)', () => {
        const b = monter(jeuBase());
        const id = creer(b);
        b.store.test_interventions[0].etudiants = [DA.ABSENT]; b.store.test_interventions[0].notesIndividuelles = { [DA.ABSENT]: 'Note confidentielle sur Bruno' };
        const avec = b.interne['interventions.js'].genererAffichageNotesIndividuelles({ [DA.ABSENT]: 'Note confidentielle sur Bruno' });
        b.store.test_groupeEtudiants = b.store.test_groupeEtudiants.filter(e => e.da !== DA.ABSENT);
        const sans = b.interne['interventions.js'].genererAffichageNotesIndividuelles({ [DA.ABSENT]: 'Note confidentielle sur Bruno' });
        noter('E3', { daConserve: b.win.obtenirIntervention(id).etudiants, noteVisibleAvant: /Bruno/.test(avec), noteVisibleApres: /Bruno/.test(sans), compteurAffiche: (sans.match(/<strong>(\d+)<\/strong>/) || [])[1] });
        expect(b.win.obtenirIntervention(id).etudiants).toEqual([DA.ABSENT]);
        expect(/Note confidentielle/.test(avec)).toBe(true);
        // Constat d'origine (5 sept.) : la note disparaissait et le compteur disait 1 sur une liste vide.
        expect(/Note confidentielle/.test(sans)).toBe(true);
        expect(sans).toContain('<strong>' + DA.ABSENT + '</strong> (n\'est plus dans le groupe) : Note confidentielle sur Bruno');
        expect((sans.match(/<strong>(\d+)<\/strong>/) || [])[1]).toBe('1');   // le compteur dit 1, et la ligne est là
    });

    it('E4 · la porte d\'écriture : db.setSync direct, jamais sauvegarderDonneesSelonMode — le mode anonymisation n\'arrête aucune écriture d\'intervention', () => {
        const src = readFileSync(path.join(RACINE, 'js/interventions.js'), 'utf8');
        const res = noter('E4', { setSync: (src.match(/db\.setSync\(/g) || []).length, parMode: (src.match(/sauvegarderDonneesSelonMode\(/g) || []).length });
        expect(res.parMode).toBe(0);
        expect(res.setSync).toBeGreaterThanOrEqual(3);
    });

    it('E5 · le bilan avant/après traduisait une moyenne 0-1 en lettre par 0,85 / 0,75 / 0,65 écrits en clair — depuis le lot 5 du cadrage 11, par les seuils configurés (valeur d\'après ; le comportement : audit du 6, I-5, et la sentinelle du lot)', () => {
        const src = readFileSync(path.join(RACINE, 'js/interventions.js'), 'utf8');
        const enClair = /(avant|apres) >= 0\.(85|75|65) \?/.test(src);
        const parSeuils = /obtenirNiveauIDMEDepuisPourcentage\(pct\)/.test(src);
        noter('E5', { enClair, parSeuils });
        expect(enClair).toBe(false);   // constat d'origine : true
        expect(parSeuils).toBe(true);
    });

    it('E6 · les observations de l\'intervention passent par echapperHtml dans le <textarea> (#733 ; avant : brutes, le bilan seul était échappé)', () => {
        const src = readFileSync(path.join(RACINE, 'js/interventions.js'), 'utf8');
        const brut = /<textarea id="observationsIntervention"[^>]*>\$\{intervention\.observations \|\| ''\}<\/textarea>/.test(src);
        const echappe = /<textarea id="observationsIntervention"[^>]*>\$\{echapperHtml\(intervention\.observations \|\| ''\)\}<\/textarea>/.test(src);
        const bilanEchappe = /<textarea id="observationsBilan"[^>]*>' \+ echapperHtml\(bilan\.observationsBilan \|\| ''\)/.test(src);
        noter('E6', { observationsBrutes: brut, observationsEchappees: echappe, bilanEchappe });
        expect(brut).toBe(false);      // avant #733 : true
        expect(echappe).toBe(true);
        expect(bilanEchappe).toBe(true);
    });
});

/* =============================================================================================
   F · SUIVI DU GROUPE ET LISTE — les agrégats
   ============================================================================================= */
describe('F · les nombres du groupe sont-ils la somme des profils', () => {
    it('F1 · le panneau du Suivi du groupe enrichit chaque élève avec les MÊMES fonctions que le profil ; les filtres P < 65 et « A ou C < 70 » retiennent qui on attend', () => {
        // À la main : Assidu (A 100, C 100, P 77, niveau 1), Absent (40, 100, 63, niveau 3), Silence (100, 0, P non constructible, niveau 3).
        // Filtre P < 65 : Absent (63) seulement — depuis #749 (11 sept.), Silence (P non constructible, affiché « — ») est ÉCARTÉ.
        // Filtre « A ou C < 70 » (#828, lot F du 16 sept.) : Silence (C 0) puis Absent (A 40), le pire indice d'abord.
        // Avant le 16 : M = (A + C) / 2 < 65 → Silence (50) seulement (Absent : 70) ; M n'est plus calculé.
        const b = monter(jeuBase()); b.calculerTout();
        b.win.calculerEtudiantsPrioritaires();
        const tb = b.interne['tableau-bord-apercu.js'];
        const enrichis = tb._tousEtudiantsEnrichis.map(e => ({ da: e.da, A: e.A, C: e.C, P: e.P, niveau: e.niveau, pattern: e.pattern, ipb: e.suivi ? e.suivi.ipb : null }));
        tb._filtresActifs.push('P'); tb.appliquerFiltres(); const filtreP = tb._etudiantsPrioritaires.map(e => e.da);
        tb._filtresActifs.length = 0; tb._filtresActifs.push('M'); tb.appliquerFiltres(); const filtreM = tb._etudiantsPrioritaires.map(e => e.da);
        tb._filtresActifs.length = 0;
        noter('F1', { enrichis, filtreP, filtreM });
        expect(enrichis).toEqual([
            { da: DA.ASSIDU, A: 100, C: 100, P: 77, niveau: 1, pattern: 'Stable', ipb: 0 },
            { da: DA.ABSENT, A: 40, C: 100, P: 63, niveau: 3, pattern: 'Difficulté persistante', ipb: 3 },
            { da: DA.SILENCE, A: 100, C: 0, P: 0, niveau: 3, pattern: 'Non-participation', ipb: null }
        ]);
        expect(filtreP).toEqual([DA.ABSENT]);
        expect(filtreM).toEqual([DA.SILENCE, DA.ABSENT]);
    });

    it('F2 · un élève EXCLU (décrochage) est calculé par SA pratique, comme un actif — valeur d\'après #745 (constat d\'origine : aucune entrée, A 0 et P 70 par « les meilleures notes »)', () => {
        // Constat d'origine (5 sept.) : Absent en décrochage, écarté des deux producteurs → aucune entrée ; calculerTousLesIndices lisait
        // A = 0 (il a pourtant 4 présences) et P = (85 + 70 + 55) / 3 = 70 par le repli — la pratique dit 62,5.
        // Depuis #745 (17 sept. 2026 ; tranché par Grégoire le 16) : les producteurs le calculent. À la main : A = 4 séances sur 10 = 40 ;
        // C = 4 remises sur 4 = 100 ; P = (85×20 + 70×20 + 55×30 + 50×30) / 100 = 62,5 → 63. Ce sont ses nombres d'élève actif (B1).
        const jeu = jeuBase(); jeu.etudiants[1].statut = 'décrochage';
        const b = monter(jeu); b.calculerTout();
        const indices = b.win.calculerTousLesIndices(DA.ABSENT);
        const pratique = b.win.obtenirPratiqueParId('som-banc').calculerPerformance(DA.ABSENT);
        noter('F2', { stocke: b.store.test_indicesCP[DA.ABSENT] || null, profil: { A: indices.A, C: indices.C, P: indices.P }, pratique: r3(pratique) });
        expect(b.store.test_indicesCP[DA.ABSENT].actuel).toMatchObject({ C: 100, P: 63, pratique: 'som-banc' });
        expect(indices).toMatchObject({ A: 40, C: 100, P: 63, noteConstructible: true });
        expect(indices.horsGroupe).toBeUndefined();
        expect(r3(pratique)).toBe(0.625);
    });

    it('F3 · les élèves suivis vivent sous une clé PAR TRIMESTRE ET GROUPE-COURS ; la clé nue d\'avant est lue une fois (semis) et jamais réécrite — valeur d\'après #749 (11 sept.)', () => {
        // Constat d'origine (5 sept.) : clé NUE partagée, réécrite par nettoyerEtudiantsSuivis. À la main : la nue porte un DA de GC1 et un DA
        // d'un autre groupe ; la première lecture sous GC1 SÈME le DA de GC1 dans la clé du groupe, et laisse la nue intacte.
        const b = monter(jeuBase(), { store: { etudiantsSuivis: [{ da: DA.ASSIDU }, { da: '3000001' }] } });
        const apres = b.interne['tableau-bord-apercu.js'].nettoyerEtudiantsSuivis();
        const clesTrimestres = readFileSync(path.join(RACINE, 'js/trimestres.js'), 'utf8');
        const ecritures = b.ecritures.filter(k => /etudiantsSuivis/.test(k));
        noter('F3', { apres, ecriture: ecritures, nueApres: b.store.etudiantsSuivis, namespacee: /'etudiantsSuivis'/.test(clesTrimestres) });
        expect(apres).toEqual([{ da: DA.ASSIDU }]);
        expect(ecritures.every(k => /^test_etudiantsSuivis(_gc_|$)/.test(k))).toBe(true);   // jamais la nue
        expect(b.store.etudiantsSuivis).toEqual([{ da: DA.ASSIDU }, { da: '3000001' }]);      // intacte
        expect(/'etudiantsSuivis'/.test(clesTrimestres)).toBe(true);                         // inscrite au registre
    });

    it('F4 · deux « moyenne A » sur deux écrans : le Suivi du groupe compte les élèves avec des séances saisies (l\'absent total à 0 % compris), la Liste ne compte que ceux qui ont une fiche', () => {
        // À la main : Silence sans AUCUNE fiche alors que le groupe a saisi dix séances → A = 0 % ; nombreSeances 10 > 0.
        // Tableau de bord (afficherMetriquesGlobales) : « e.sommatif.nombreSeances > 0 » → inclus, moyenne (100 + 40 + 0) / 3 = 46,7.
        // Liste (afficherListeEtudiantsConsultation) : « presencesCours.some(p => p.da === e.da) » → exclu, moyenne (100 + 40) / 2 = 70.
        const jeu = jeuBase(); jeu.presences = jeu.presences.filter(p => p.da !== DA.SILENCE);
        const b = monter(jeu); b.calculerTout();
        const das = [DA.ASSIDU, DA.ABSENT, DA.SILENCE];
        const A = Object.fromEntries(das.map(da => [da, b.win.calculerTousLesIndices(da).A]));
        const tableau = das.filter(da => b.win.calculerIndicesEtudiant(da).sommatif.nombreSeances > 0);
        const presences = b.store.test_presences.filter(p => p.coursId === 'GC1');
        const liste = das.filter(da => presences.some(p => p.da === da));
        const moy = (l) => Math.round(l.reduce((s, da) => s + A[da], 0) / l.length * 10) / 10;
        noter('F4', { A, tableau: moy(tableau), liste: moy(liste), nbTableau: tableau.length, nbListe: liste.length });
        expect(A[DA.SILENCE]).toBe(0);
        expect([tableau.length, liste.length]).toEqual([3, 2]);
        expect([moy(tableau), moy(liste)]).toEqual([46.7, 70]);
    });
});

/* =============================================================================================
   G · CE QUI SORT — et ce qui ne doit pas sortir
   ============================================================================================= */
describe('G · les sorties du Suivi et le volet confidentiel', () => {
    const CHAMPS_CONFIDENTIELS = ['servicesAdaptes', 'sousCategorie', 'portraitStructure', 'portraitFrancais', 'defiFLS', 'coursDecrochage', 'epgc'];
    it('G1 · le rapport du profil : A, C, P et jetons — aucun champ du volet confidentiel, aucune note de présence', () => {
        const b = monter(jeuBase(), { store: { test_confidentielEtudiants: { [DA.ASSIDU]: { servicesAdaptes: true, categorie: 'apprentissage', sousCategorie: 'Dyslexie', notes: 'NOTE-SENSIBLE-BANC', portraitStructure: 'fragile' } } } });
        b.store.test_presences[0].notes = 'NOTE-PRESENCE-BANC';
        b.calculerTout();
        const rapport = b.win.genererRapportAPI(DA.ASSIDU);
        noter('G1', { lignes: rapport.split('\n').filter(Boolean).length, sensible: /SENSIBLE|Dyslexie|fragile|PRESENCE-BANC/.test(rapport) });
        expect(rapport).toMatch(/^Alice Assidu \(DA: 2000001\)/);
        expect(/SENSIBLE|Dyslexie|fragile|PRESENCE-BANC/.test(rapport)).toBe(false);
    });

    it('G2 · le snapshot d\'archivage : par élève { da, nom, A, C, P } — rien du volet confidentiel ; son P historique est la note du cours de l\'ÉLÈVE à cette date (#734, #716)', async () => {
        // À la main : au 16 mars, deux travaux dus (P1, P2). Assidu : C 2/2 = 100 ; sa note du cours sur ces deux travaux est
        // (60 + 70) / 2 = 65 ; Absent (85 + 70) / 2 = 77,5 → 78.
        // ↻ Lot N2 (#716, 22 sept. 2026) — valeurs d'après : 65 et 78. Avant, la méthode historique sommative lisait `e.da` /
        // `e.note` (jamais remplis) → null → repli IDME en dur (I 40, D 65) : 53 et 83 ; et avant #734, 67 pour tous.
        const b = monter(jeuBase(), { store: { test_confidentielEtudiants: { [DA.ASSIDU]: { notes: 'NOTE-SENSIBLE-BANC' } } } }); b.calculerTout();
        const snap = await b.win.capturerSnapshotSeance('2026-03-16', null, { numeroSemaine: 10 });
        const assidu = snap.etudiants.find(e => e.da === DA.ASSIDU);
        const absent = snap.etudiants.find(e => e.da === DA.ABSENT);
        const cleEcrite = b.ecritures.filter(k => /snapshots/.test(k));
        noter('G2', { champs: Object.keys(assidu), assidu, absentP: absent.P, cleEcrite, sensible: /SENSIBLE/.test(JSON.stringify(snap)) });
        expect(Object.keys(assidu).sort()).toEqual(['A', 'A_cumulatif', 'C', 'P', 'da', 'nom', 'pattern', 'rai'].sort());
        expect(assidu).toMatchObject({ A: 100, C: 100, P: 65, nom: 'Alice Assidu' });   // avant #716 : 53 (table I/D/M/E) ; avant #734 : 67
        expect(absent.P).toBe(78);                       // avant #716 : 83 ; avant #734 : 67, le même que l'assidu
        expect(cleEcrite).toEqual(['test_snapshots_GC1']);
        expect(/SENSIBLE/.test(JSON.stringify(snap))).toBe(false);
    });


    it('G4 · le volet confidentiel : un seul module le lit ; ni la synthèse PDF, ni l\'export CSV, ni les snapshots, ni un console.* ne le touchent ; le codex complet l\'emporte (sauvegarde personnelle) ; le mode anonymisation ne l\'anonymise pas', () => {
        const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
        const lecteurs = ['js/profil-etudiant-rapport.js', 'js/snapshots.js', 'js/export-resultats-finaux.js', 'js/synthese-retroaction-data.js', 'js/export-pdf.js', 'js/tableau-bord-apercu.js', 'js/etudiants.js', 'js/graphiques-progression.js']
            .filter(f => /confidentielEtudiants|servicesAdaptes|sousCategorie|portraitStructure/.test(lire(f)));
        const modes = lire('js/modes.js');
        const casAnonymises = (tranche(modes, 'function anonymiserDonnees').match(/case '(\w+)':/g) || []).map(s => s.replace(/case '|':/g, ''));
        const confidentiel = lire('js/profil-etudiant-confidentiel.js');
        const consoleSensible = /console\.\w+\([^)]*(infos|donnees|notes)/.test(confidentiel);
        const litBrut = /db\.getSync\(cleConfidentiel|db\.getSync\(clePresences/.test(confidentiel);
        const nonEchappes = (confidentiel.match(/data-(date|da)="\$\{(?!echapperHtml\()[^}]+\}"/g) || []);   // #733 : les deux attributs passent par echapperHtml
        const boutonSansGarde = !/estModeeLectureSeule|anonymisation/.test(lire('js/profil-etudiant-sections-affichage.js').split('\n').filter(l => /ouvrirModalConfidentiel/.test(l)).join('\n'));
        noter('G4', { autresLecteurs: lecteurs, casAnonymises, consoleSensible, litLeStoreBrut: litBrut, attributsNonEchappes: nonEchappes, boutonSansGarde });
        expect(lecteurs).toEqual([]);
        expect(casAnonymises).toEqual(['groupeEtudiants', 'evaluationsSauvegardees', 'presences']);   // pas confidentielEtudiants, pas interventions
        expect(consoleSensible).toBe(false);
        expect(litBrut).toBe(true);
        expect(nonEchappes).toEqual([]);   // avant #733 : ['data-date="${p.date}"', 'data-da="${da}"']
        expect(boutonSansGarde).toBe(true);
    });

    it('G5 · le « Portrait de lecteur » (cinq critères de Grégoire codés en dur dans le volet confidentiel) est parti — valeur d\'après le lot 4 du cadrage 11 (constat d\'origine, #539 : les cinq identifiants y étaient)', () => {
        const confidentiel = readFileSync(path.join(RACINE, 'js/profil-etudiant-confidentiel.js'), 'utf8');
        const ids = (confidentiel.match(/confidentiel-portrait-(\w+)/g) || []).filter((v, i, a) => a.indexOf(v) === i);
        noter('G5', { ids });
        expect(ids).toEqual([]);
    });
});

/* =============================================================================================
   H · LES GRAPHIQUES — cinq mesures
   ============================================================================================= */
describe('H · ce que les courbes lisent', () => {
    it('H1 · les courbes par critère lisent l\'échelle de chaque évaluation : les mêmes valeurs chez Grégoire, et une échelle A/B/C trace ses paliers — valeur d\'après #752 (lot 4 du cadrage 11 ; constat d\'origine : 40/65/75/100 écrits en dur, courbe vide pour A/B/C)', () => {
        const b = monter(jeuBase());
        const g = b.interne['graphiques-progression.js'];
        const d = g.obtenirDonneesCriteres(DA.ASSIDU);
        const jeu = jeuBase(); jeu.echelles = [clone(E3N)]; jeu.evaluations = ['P1', 'P2'].map(pid => ev('E1' + pid, DA.ASSIDU, pid, 70, 'B', ['B', 'B', 'B'], { echelleId: 'E3N' }));
        const b3 = monter(jeu);
        const g3 = b3.interne['graphiques-progression.js'];
        const d3 = g3.obtenirDonneesCriteres(DA.ASSIDU);
        const habileteB = g3.moyenneCriteresHabiletes(jeu.evaluations[0], new Set(['Structure']), new Map());
        noter('H1', { structureIDME: d.criteres.Structure, structureABC: d3.criteres.Structure, habiletes: { B: habileteB }, sansValeur: d3.sansValeurConvertible });
        expect(d.criteres.Structure).toEqual([65, 65, 75, 100]);
        expect(d3.criteres.Structure).toEqual([75, 75]);            // valeurCalcul de « B » dans E3N
        expect(habileteB).toBe(0.75);
        expect(d3.sansValeurConvertible).toEqual({ evaluations: 0, points: 0 });
    });

    it('H2 · les zones d\'un graphique viennent de l\'échelle qu\'on lui passe — plus de repli sur « la première échelle du trimestre » (#860, 16 sept.)', () => {
        // Constat d'origine (6 sept.) : sans argument, la première échelle du trimestre (E60). Depuis #860, sans échelle : aucune zone.
        const b = monter(jeuBase(), { store: { test_echellesTemplates: [clone(E60), clone(E0)] } });
        const g = b.interne['graphiques-progression.js'];
        const zones = g.genererZonesDepuisEchelle(clone(E60));
        noter('H2', { codes: zones.map(z => z.code), premiereBorne: zones[1] && zones[1].yMin, sansEchelle: g.genererZonesDepuisEchelle() });
        expect(zones.map(z => z.code)).toEqual(['I', 'D', 'M', 'E']);
        expect(zones[1].yMin).toBe(0.6);
        expect(g.genererZonesDepuisEchelle()).toEqual([]);
    });

    it('H3 · un élève sans donnée : pas de courbe à zéro — null, et le graphique individuel refuse sans snapshot', () => {
        const b = monter(jeuBase());
        const d = b.interne['graphiques-progression.js'].obtenirDonneesCriteres(DA.SILENCE);
        const snaps = b.win.obtenirSnapshotsEtudiant(DA.SILENCE);
        noter('H3', { donneesCriteres: d, snapshots: snaps.length });
        expect(d).toBeNull();
        expect(snaps).toEqual([]);
    });
});

/* =============================================================================================
   I · LOT N1b (21 sept. 2026) — UN GROUPE SANS PRATIQUE ASSIGNÉE : « — », ET AUCUNE ALERTE
   ============================================================================================= */
describe('I · groupe-cours sans pratique assignée (lot N1b)', () => {
    /** Le groupe de banc, sa pratique retirée, toute la chaîne recalculée. */
    const sansPratique = (pointeur) => {
        const jeu = jeuBase(); jeu.pratiqueId = pointeur;
        const b = monter(jeu); b.calculerTout(); b.win.calculerEtudiantsPrioritaires();
        return b;
    };
    const filtrer = (b, filtre) => {
        const tb = b.interne['tableau-bord-apercu.js'];
        tb._filtresActifs.length = 0; tb._filtresActifs.push(filtre); tb.appliquerFiltres();
        const das = tb._etudiantsPrioritaires.map(e => e.da);
        tb._filtresActifs.length = 0;
        return das;
    };

    it('I1 · l\'écrivain pose « complétion non constructible » (champ additif) et le lecteur rend C = null, jamais 0 ; P « non constructible »', () => {
        const b = sansPratique(undefined);
        const stock = b.store.test_indicesCP[DA.ASSIDU].actuel;
        const indices = b.win.calculerTousLesIndices(DA.ASSIDU);
        noter('I1', { stock: { C: stock.C, P: stock.P, noteConstructible: stock.noteConstructible, completionConstructible: stock.completionConstructible }, indices });
        expect(stock).toMatchObject({ pratique: null, C: 0, P: 0, noteConstructible: false, completionConstructible: false });
        expect(indices.A).toBe(100);            // l'assiduité ne dépend d'aucune pratique
        expect(indices.C).toBeNull();
        expect(indices.M).toBeNull();
        expect(indices.noteConstructible).toBe(false);
        expect(indices.completionConstructible).toBe(false);
        // Le bloc du tableau de bord (barres du groupe) : complétion inconnue, pas 0.
        expect(b.win.calculerIndicesEtudiant(DA.ASSIDU).sommatif.completion).toBeNull();
    });

    it('I2 · AUCUNE ALERTE DUE À C : le filtre « A ou C sous la borne » ne retient que l\'assiduité réellement basse ; le filtre P personne ; le contexte se lit « — » pour tous', () => {
        // À la main : Assidu A 100, Absent A 40, Silence A 100 ; C inconnu pour les trois. Avant ce lot, C valait 0 :
        // le filtre retenait les TROIS élèves et le contexte d'apprentissage disait « Fragile » à tout le groupe.
        const b = sansPratique(undefined);
        const filtreM = filtrer(b, 'M'), filtreP = filtrer(b, 'P');
        const contextes = [DA.ASSIDU, DA.ABSENT, DA.SILENCE].map(da => b.win.determinerAlerteContextuelle(da));
        noter('I2', { filtreM, filtreP, contextes: contextes.map(c => ({ niveau: c.niveau, label: c.label, C: c.C })) });
        expect(filtreM).toEqual([DA.ABSENT]);
        expect(filtreP).toEqual([]);
        contextes.forEach(c => {
            expect(c).toMatchObject({ niveau: 'inconnu', label: '—', C: '—', donneesSuffisantes: false });
            expect(c.recommandation).toMatch(/^Aucune pratique de notation n'est assignée/);   // la phrase du diagnostic, aucun mot neuf
        });
    });

    it('I3 · le dépistage lit les COPIES, pas la pratique : les paliers sont ceux du même groupe AVEC sa pratique (F1) — aucun élève de plus n\'est signalé', () => {
        const avec = (() => { const b = monter(jeuBase()); b.calculerTout(); b.win.calculerEtudiantsPrioritaires(); return b; })();
        const sans = sansPratique(undefined);
        const paliers = (b) => [DA.ASSIDU, DA.ABSENT, DA.SILENCE].map(da => { const r = b.win.determinerNiveauRaiPedagogique(da); return { niveau: r.niveau, pattern: r.pattern }; });
        const cibles = (b) => [DA.ASSIDU, DA.ABSENT, DA.SILENCE].map(da => b.win.determinerCibleIntervention(da).cible);
        noter('I3', { paliers: paliers(sans), cibles: cibles(sans) });
        expect(paliers(sans)).toEqual(paliers(avec));
        expect(cibles(sans)).toEqual(cibles(avec));
        expect(paliers(sans)[0]).toEqual({ niveau: 1, pattern: 'Stable' });
        expect(filtrer(sans, 'rai')).toEqual(filtrer(avec, 'rai'));
    });

    it('I4 · les écrans : badge « C — », rapport « Complétion : — », type de pratique null (aucun mot de pratique inventé)', () => {
        const b = sansPratique(undefined);
        const tb = b.interne['tableau-bord-apercu.js'];
        const enrichi = tb._tousEtudiantsEnrichis.find(e => e.da === DA.ASSIDU);
        const rapport = b.win.genererRapportAPI(DA.ASSIDU, { assiduite: true, completion: true, performance: true });
        noter('I4', { enrichi: { A: enrichi.A, C: enrichi.C, P: enrichi.P, noteConstructible: enrichi.noteConstructible }, type: b.win.obtenirTypePratiqueActive(), id: b.win.obtenirIdPratiqueActive(), terme: b.win.obtenirTermeProduction('singulier') });
        expect(enrichi).toMatchObject({ A: 100, C: null, noteConstructible: false });
        expect(b.win.obtenirTypePratiqueActive()).toBeNull();
        expect(b.win.obtenirIdPratiqueActive()).toBeNull();
        expect(b.win.obtenirTermeProduction('singulier')).toBe('production');     // avant : « artefact », le mot du repli PRATIQUE_DEFAUT
        expect(b.win.determinerModeAffichageTableauBord({})).toEqual({ afficherSom: false, afficherPan: true });
        expect(rapport).toContain('Complétion : —');
        expect(rapport).not.toMatch(/null\s*%/);
        expect(rapport).toContain('Performance : non constructible');
    });

    it('I6 · l\'alerte NOMMÉE du tableau de bord (« N étudiant·e·s présent·e·s sans aucune production remise ») ne nomme PERSONNE sans pratique — avec la pratique, Silence seul', () => {
        // Trouvé sur la VRAIE page (pack démo, pratique retirée, WebKit) : les 10 élèves y étaient nommés — complétion inconnue
        // lue comme « rien remis ». Le témoin AVEC pratique prouve que l'alerte sait encore parler : Silence (A 100, rien remis).
        const monterAvecCarte = (pointeur) => {
            const inserts = [];
            const jeu = jeuBase(); jeu.pratiqueId = pointeur;
            const b = monter(jeu, { elements: { 'carte-indicateurs-acpe': elementDom({ insertAdjacentHTML: (ou, h) => inserts.push(h) }) } }); b.calculerTout();
            b.interne['tableau-bord-apercu.js'].afficherAlerteNonParticipation([DA.ASSIDU, DA.ABSENT, DA.SILENCE].map(da => Object.assign({ da, nom: da, prenom: '' }, b.win.calculerIndicesEtudiant(da))));
            return inserts;
        };
        const avec = monterAvecCarte('som-banc'), sans = monterAvecCarte(undefined);
        noter('I6', { avec: avec.length, sans: sans.length });
        expect(avec).toHaveLength(1);
        expect(avec[0]).toContain('1 étudiant·e présent·e');
        expect(avec[0]).toContain(DA.SILENCE);
        expect(sans).toEqual([]);
    });

    it('I7 · profil › Accompagnement, SANS pratique et SANS présence saisie : un élève qui a des copies voit ses forces et défis, pas « En attente de données » — celui qui n\'a rien, si', () => {
        // Rattrapé par les specs Playwright #542 au verdict du 21 sept. : la première écriture du lot comptait une complétion
        // inconnue comme un zéro dans « aucune donnée » — A inconnu + C inconnu + P 0 = « En attente », copies ou pas.
        const jeu = jeuBase(); jeu.pratiqueId = undefined; jeu.presences = [];
        const b = monter(jeu); b.calculerTout();
        const section = b.interne['profil-etudiant-sections-affichage.js'].genererSectionAccompagnement;
        const indices = b.win.calculerTousLesIndices(DA.ASSIDU);
        const avecCopies = section(DA.ASSIDU), sansRien = section(DA.SILENCE);
        noter('I7', { A: indices.A, C: indices.C, P: indices.P, avecCopies: avecCopies.includes('En attente de données'), sansRien: sansRien.includes('En attente de données') });
        expect(indices).toMatchObject({ A: null, C: null, P: 0 });
        expect(avecCopies).not.toContain('En attente de données');
        expect(avecCopies.length).toBeGreaterThan(sansRien.length);        // la section pleine, pas la version simplifiée
        expect(sansRien).toContain('En attente de données');
    });

    it('I5 · un pointeur `standards` NU (jamais configuré) est « introuvable » : mêmes écrans que sans pratique — et `sommative` nu reste une pratique assignée', () => {
        const nu = sansPratique('standards');
        expect(nu.win.designerPratiqueActive().etat).toBe('introuvable');
        expect(nu.win.obtenirTypePratiqueActive()).toBeNull();                   // avant : « standards », lu au registre
        expect(nu.win.calculerTousLesIndices(DA.ASSIDU).C).toBeNull();
        expect(filtrer(nu, 'M')).toEqual([DA.ABSENT]);
        const som = sansPratique('sommative');
        expect(som.win.obtenirTypePratiqueActive()).toBe('sommative');
        expect(som.win.calculerTousLesIndices(DA.ASSIDU)).toMatchObject({ C: 100, P: 77, noteConstructible: true });
    });
});
