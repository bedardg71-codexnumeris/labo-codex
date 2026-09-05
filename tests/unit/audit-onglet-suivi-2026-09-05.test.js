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

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Même chargement que chargerScript, mais des noms INTERNES du module sont exposés sous
 * `window.__audit[<fichier>]` par des accesseurs (lus à l'appel, donc à jour pour une variable `let`).
 * Injection avant le `})();` final quand le module est une IIFE, en fin de fichier sinon (consolidation.js).
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
const MODULES = ['js/interpretation-config.js', 'js/pratiques/pratique-configurable.js', 'js/pratiques/pratique-registre.js',
    'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-pan-standards.js',
    'js/pratiques/pratique-pan-specifications.js', 'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js',
    'js/saisie-presences.js', 'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js',
    'js/profil-etudiant-rapport.js', 'js/profil-etudiant-diagnostics.js', 'js/profil-etudiant-confidentiel.js',
    'js/profil-etudiant-sections-affichage.js', 'js/interventions.js', 'js/consolidation.js', 'js/snapshots.js',
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

    const globaux = Object.assign({}, globauxBase, {
        obtenirDonneesSelonMode: winModes.obtenirDonneesSelonMode, sauvegarderDonneesSelonMode: winModes.sauvegarderDonneesSelonMode,
        obtenirEtudiantsCoursActif: winModes.obtenirEtudiantsCoursActif, obtenirContexteCoursActif: winModes.obtenirContexteCoursActif,
        demarrerCacheLecture: winModes.demarrerCacheLecture, terminerCacheLecture: winModes.terminerCacheLecture, invaliderCacheLecture: winModes.invaliderCacheLecture,
        filtrerEtudiantsParMode: winModes.filtrerEtudiantsParMode, estModeeLectureSeule: winModes.estModeeLectureSeule,
        // Aiguillages vers les exports réels, résolus à l'appel.
        obtenirPratiqueActiveGroupeCours: fwd('obtenirPratiqueActiveGroupeCours'),
        // ⚠ PONT DU BANC, que l'application N'A PAS : `obtenirDetailsAssiduite` vit dans l'IIFE de sections-affichage.js
        // sans export window, et rapport.js l'appelle par son nom nu (mesure B5). Sans ce pont, genererRapportAPI lève.
        obtenirDetailsAssiduite: (...a) => win.__audit['profil-etudiant-sections-affichage.js'].obtenirDetailsAssiduite(...a)
    });
    const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', '__audit'];
    for (const nom of EXPORTS_WINDOW) if (!(nom in globaux) && !/^[A-Z]/.test(nom) && !OBJETS_EXPORTES.includes(nom)) globaux[nom] = fwd(nom);

    chargerScript('js/interpretation-config.js', globaux, win);
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
    chargerAvecInterne('js/profil-etudiant-sections-affichage.js', globaux, win, ['obtenirDetailsAssiduite']);
    chargerAvecInterne('js/interventions.js', globaux, win, ['genererAffichageNotesIndividuelles']);
    chargerAvecInterne('js/consolidation.js', globaux, win, ['calculerMatriceConsolidation']);
    chargerScript('js/snapshots.js', globaux, win);
    chargerAvecInterne('js/tableau-bord-apercu.js', globaux, win, ['_tousEtudiantsEnrichis', '_etudiantsPrioritaires', '_filtresActifs', 'appliquerFiltres', 'nettoyerEtudiantsSuivis']);
    chargerAvecInterne('js/graphiques-progression.js', globaux, win, ['obtenirDonneesCriteres', 'niveauHabiletesVersDecimal', 'genererZonesDepuisEchelle']);

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
        suivi: suivi ? { ipb: suivi.ipb, direction: suivi.direction, diagnostic: suivi.diagnostic, niveauRaI: suivi.niveauRaI, scoreActuel: r3(suivi.scoreActuel) } : null,
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
        // Lecteurs sans recalcul : calculerTousLesIndices lit le stock → l'incohérent y lit A = 0 (aucune entrée).
        expect(b.win.calculerTousLesIndices(DA.INCOHERENT).A).toBe(0);
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
        const n6 = /compteur\.innerHTML = `[^`]*\$\{echapperHtml\(message\)\}/.test(src);
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

    it('B2 · un BROUILLON (non verrouillé) : hors de la note du cours (#706), mais COMPTÉ comme remis par C et comme artefact par le dépistage', () => {
        // À la main : Assidu, P4 en brouillon. Note du cours sans P4 = (60·20 + 70·20 + 80·30) / 70 = 71,43 → 71 ;
        // C sommatif compte « noteFinale !== null » → 4/4 = 100 ; la fenêtre du dépistage (3 derniers) lit
        // 90, 80, 70 → 0,80 et le RàI pédagogique croise P = 0,71 (< 0,75) → niveau 2, pattern « Stable ».
        const jeu = jeuBase(); jeu.evaluations.find(e => e.id === 'E1P4').verrouillee = false;
        const b = monter(jeu); b.calculerTout();
        const p = portrait(b, DA.ASSIDU);
        const ecartees = b.win.compterEvaluationsEcarteesDeLaNote(DA.ASSIDU);
        noter('B2', { p, ecartees });
        expect(p.P).toBe(71);
        expect(ecartees).toEqual({ brouillons: 1, sansPortee: 0, total: 1 });
        expect(p.C).toBe(100);                    // le brouillon est « remis » pour C
        expect(p.performance3).toBe(0.8);         // et il entre dans la performance du dépistage
        expect(p.nbArtefacts).toBe(3);
        expect(p.rai).toMatchObject({ niveau: 2, pattern: 'Stable' });
    });

    it('B3 · une REPRISE : la note du cours remplace ; le dépistage compte l\'originale ET la reprise', () => {
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
        expect(p.P).toBe(69);                                        // la note du cours REMPLACE
        expect(p.performance3).toBe(0.6);                            // le dépistage lit 50, 75, 55 : l'originale remplacée est dedans
        expect(ipb.historiqueComplet.length).toBe(5);                // cinq artefacts pour quatre productions
        expect(r3(moy.structure)).toBe(r3((0.75 + 0.65 + 0.40 + 0.75 + 0.40) / 5)); // l'originale pèse dans la moyenne
        expect(p.rai.niveau).toBe(3);                                // « Difficulté persistante » (0,60 < 0,64) — à la main : 0,65 → niveau 2
    });

    it('B4 · un « non remis » enregistré avec 0 : remis pour le C sommatif, écarté par le C des snapshots', () => {
        // À la main : Silence reçoit une évaluation P1 à 0 marquée statutRemise « non-remis ». Le C sommatif ne lit pas ce
        // statut (noteFinale !== null suffit) → 1 remise sur 4 = 25 ; le C historique des snapshots l'exclut → 0/1 = 0 au 1er février.
        const jeu = jeuBase();
        jeu.evaluations.push(ev('E3P1', DA.SILENCE, 'P1', 0, '0', ['0', '0', '0'], { statutRemise: 'non-remis' }));
        const b = monter(jeu); b.calculerTout();
        const cSom = b.store.test_indicesCP[DA.SILENCE].actuel.C;
        const hist = b.win.calculerIndicesHistoriques(DA.SILENCE, '2026-02-15');
        const srcSom = readFileSync(path.join(RACINE, 'js/pratiques/pratique-sommative.js'), 'utf8');
        const corpsC = srcSom.slice(srcSom.indexOf('    calculerCompletion(da) {'), srcSom.indexOf('    detecterDefis(da) {'));
        noter('B4', { cSom, cSnapshot: hist.C, completionSomLitStatutRemise: /statutRemise/.test(corpsC) });
        expect(cSom).toBe(25);
        expect(hist.C).toBe(0);
        expect(/statutRemise/.test(corpsC)).toBe(false);   // l'historique SOM (l. 311) le lit ; le C courant, non
    });

    it('B5 · le même P partout ? tableau de bord, liste et profil lisent le même stock ; le RAPPORT du profil recalcule le sien', () => {
        // À la main : le stock indicesCP dit 77 pour Assidu. Le rapport (genererRapportAPI) refait « les 4 meilleurs » :
        // (90 + 80 + 70 + 60) / 4 = 75 ; et sa complétion compte des « artefact-portfolio » — il n'y en a aucun : « 0 remises / 0 productions ».
        const b = monter(jeuBase()); b.calculerTout();
        const stock = b.win.calculerIndicesEtudiant(DA.ASSIDU).sommatif.performance * 100;   // ce que lit le tableau de bord
        const profil = b.win.calculerTousLesIndices(DA.ASSIDU).P;                              // ce que lit le profil et la liste
        // ⚠ Dans l'application, ce rapport LÈVE : `obtenirDetailsAssiduite` n'est exporté sur window par aucun fichier de js/,
        // et rapport.js l'appelle par son nom nu depuis une autre IIFE. Le banc lui prête un pont pour lire ses nombres.
        const exportsDetailsA = readFileSync(path.join(RACINE, 'js/profil-etudiant-sections-affichage.js'), 'utf8').match(/window\.obtenirDetailsAssiduite\s*=/g) || [];
        const appelNu = /const detailsA = obtenirDetailsAssiduite\(da\);/.test(readFileSync(path.join(RACINE, 'js/profil-etudiant-rapport.js'), 'utf8'));
        const rapport = b.win.genererRapportAPI(DA.ASSIDU);
        const ligneP = (rapport.match(/Performance : [^\n]*/) || [''])[0];
        const ligneC = (rapport.match(/Complétion : [^\n]*/) || [''])[0];
        noter('B5', { stock, profil, ligneP, ligneC, exportsDetailsA: exportsDetailsA.length, appelNu });
        expect(exportsDetailsA.length).toBe(0);
        expect(appelNu).toBe(true);
        expect(stock).toBe(77);
        expect(profil).toBe(77);
        expect(ligneP).toBe('Performance : 75% (4 meilleurs artefacts actuels)');
        expect(ligneC).toBe('Complétion : 100% (0 remises / 0 productions)');
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
        expect(p.suivi).toMatchObject({ ipb: 0, direction: '↗', diagnostic: 'Maîtrise acquise', niveauRaI: 1 });
        expect(p.rai).toMatchObject({ niveau: 1, pattern: 'Stable', defi: 'Aucun' });
        expect(p.cible).toMatchObject({ niveau: 1, cible: 'Maîtrise acquise', pattern: 'Stable' });
        expect(p.contexte.niveau).toBe('tres-favorable');
    });

    it('C2 · l\'absent qui régresse : IPB 3 → « Difficulté persistante » niveau 3 ; RàI niveau 3, défi « Structure » ; contexte « fragile »', () => {
        // À la main : fondations P4 0,40 · P3 0,40 · P2 0,65 — trois sous 0,70 → IPB 3 ; 0,40 − 0,40 = 0 → « → ».
        // Moyennes : Structure 0,55 · Rigueur 0,6125 · Nuance 0,6375 → défi principal Structure. P 0,625 < 0,64 → niveau 3.
        // Contexte : A 0,40 < 0,65 → « fragile ».
        const b = monter(jeuBase()); b.calculerTout();
        const p = noter('C2', portrait(b, DA.ABSENT));
        expect(p.suivi).toMatchObject({ ipb: 3, direction: '→', diagnostic: 'Difficulté persistante', niveauRaI: 3 });
        expect(p.rai).toMatchObject({ niveau: 3, pattern: 'Difficulté persistante', defi: 'Structure' });
        expect(p.cible.niveau).toBe(3);
        expect(p.cible.cible).toMatch(/^Difficulté persistante — Structure/);
        expect(p.contexte.niveau).toBe('fragile');
    });

    it('C3 · une échelle à TROIS paliers (A/B/C, maîtrise dès B = 60) : la consolidation dit « consolidé », le RàI dit « niveau 2 »', () => {
        // À la main : quatre travaux à 70, tous les critères « B » (valeur 75). Sur SON échelle, 70 est « B » = atteint, et le repère
        // de maîtrise est B (min 60 → 0,60) : chaque critère est à 0,75 ≥ 0,60 dès P1 et le reste → consolidé. Le RàI compare
        // P = 0,70 à idme.developpement 0,75 → niveau 2 « Performance en développement ». Deux verdicts pour le même élève.
        const jeu = jeuBase();
        jeu.echelles = [clone(E3N)]; jeu.grilles[0].echelleId = 'E3N'; jeu.productions.forEach(p => { p.echelleId = 'E3N'; });
        jeu.evaluations = ['P1', 'P2', 'P3', 'P4'].map((pid, i) => ev('E1' + pid, DA.ASSIDU, pid, 70, 'B', ['B', 'B', 'B'], { echelleId: 'E3N' }));
        const b = monter(jeu); b.calculerTout();
        const p = portrait(b, DA.ASSIDU);
        const conso = b.win.calculerConsolidationIndividuelle(DA.ASSIDU);
        const situe = b.win.situerPourcentageDansEchelle(70, E3N);
        noter('C3', { rai: p.rai, suivi: p.suivi, scoreMaitrise: conso.scoreMaitrise, deduit: conso.scoreMaitriseDeduit, structure: conso.resume.Structure.type, niveauEchelle: situe && situe.code });
        expect(situe.code).toBe('B');
        expect(conso.scoreMaitrise).toBe(0.6);
        expect(conso.scoreMaitriseDeduit).toBe(false);
        expect(conso.resume.Structure.type).toBe('consolide');
        expect(p.rai.niveau).toBe(2);
        expect(p.suivi.diagnostic).toBe('Maîtrise acquise');
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

    it('C5 · un critère analytique en points (21/30 = 70 %) : le dépistage lit la valeur du NIVEAU déduit (65), pas les points', () => {
        // À la main : la note de la copie compte 21/30 ; le dépistage convertit `niveauSelectionne` D par l'échelle → 0,65.
        const jeu = jeuBase();
        jeu.evaluations = [ev('E1P1', DA.ASSIDU, 'P1', 70, 'D', ['D', 'D', 'D'])];
        jeu.evaluations[0].criteres[0] = Object.assign(jeu.evaluations[0].criteres[0], { type: 'analytique', points: 21, pointsMax: 30 });
        jeu.evaluations[0].pointsAnalytiques = { c1: 21 };
        const b = monter(jeu); b.calculerTout();
        const moy = b.win.calculerMoyennesCriteres(DA.ASSIDU);
        noter('C5', { structure: moy.structure, pointsIgnores: moy.structure !== 0.7 });
        expect(moy.structure).toBe(0.65);
    });

    it('C6 · un critère SOLO « Aucun » : hors de l\'IPB, mais TOUJOURS un défi pour la carte RàI, le défi spécifique et les critères ciblés', () => {
        // À la main : quatrième critère « Méthode » (niveauSOLO 'aucun'), noté I (0,40) partout chez l'assidu. L'IPB ne surveille
        // que Structure et Rigueur (libellé : « surveillés : Structure, Rigueur »). Mais diagnostiquerForcesChallenges,
        // identifierDefiSpecifique et calculerMoyennesCriteres n'ont pas de filtre SOLO : Méthode devient le défi principal.
        const jeu = jeuBase();
        jeu.grilles[0].criteres.push({ id: 'c4', nom: 'Méthode', ponderation: 0, niveauSOLO: 'aucun' });
        jeu.evaluations.filter(e => e.etudiantDA === DA.ASSIDU).forEach(e => e.criteres.push({ critereId: 'c4', critereNom: 'Méthode', niveauSelectionne: 'I', ponderation: 0 }));
        const b = monter(jeu); b.calculerTout();
        const rai = b.win.determinerNiveauRaiPedagogique(DA.ASSIDU);
        const defi = b.win.identifierDefiSpecifique(DA.ASSIDU);
        const ipb = b.win.calculerIPB(DA.ASSIDU);
        const libelle = b.win.libelleCriteresMultiSurveilles(b.store.test_grillesTemplates[0]);
        noter('C6', { raiDefi: rai.defi, raiPattern: rai.pattern, defiSpecifique: defi, criteresIPB: ipb.criteresMulti, libelle });
        expect(ipb.criteresMulti).toEqual(['structure', 'rigueur']);
        expect(libelle).toBe('Critères multistructurels surveillés : Structure, Rigueur');
        expect(rai.defi).toBe('Méthode');
        expect(rai.pattern).toBe('Défi spécifique');
        expect(defi.defi).toBe('Méthode');
    });

    it('C7 · une évaluation SANS texte de rétroaction finale : elle compte dans P, pas dans le dépistage', () => {
        // À la main : Assidu, P4 enregistrée sans `retroactionFinale`. P la compte (90 → 77) ; l'IPB, les moyennes par critère et
        // le défi spécifique filtrent `e.retroactionFinale` → pour eux P4 n'existe pas (trois artefacts, pas quatre).
        const jeu = jeuBase(); jeu.evaluations.find(e => e.id === 'E1P4').retroactionFinale = '';
        const b = monter(jeu); b.calculerTout();
        const p = portrait(b, DA.ASSIDU);
        const ipb = b.win.calculerIPB(DA.ASSIDU);
        noter('C7', { P: p.P, nbArtefactsPerformance: p.nbArtefacts, nbHistoriqueIPB: ipb.historiqueComplet.length, dernierScoreIPB: r3(ipb.scoreActuel) });
        expect(p.P).toBe(77);
        expect(p.nbArtefacts).toBe(3);                 // calculerIndicesNDerniersArtefacts ne filtre pas la rétroaction
        expect(ipb.historiqueComplet.length).toBe(3);  // l'IPB, si : P4 est invisible pour lui
        expect(r3(ipb.scoreActuel)).toBe(0.75);        // P3, pas P4 (0,875)
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

    it('D2 · DÉBUT DE TRIMESTRE : présences prises, AUCUNE évaluation pour personne → les trois élèves sont « Non-participation » niveau 3', () => {
        // À la main : la règle ne regarde pas si un travail est dû ou évalué ; A > 0 et nbArtefacts 0 suffisent. Au retour de la
        // première séance, avant le premier travail, la carte RàI, la barre RàI du groupe et la barre des patterns disent
        // « Niveau 3 – Non-participation » pour tout le groupe ; l'alerte nommée du tableau de bord le dit aussi (nombreSeances > 0, rien remis).
        const jeu = jeuBase(); jeu.evaluations = [];
        const b = monter(jeu); b.calculerTout();
        const niveaux = [DA.ASSIDU, DA.ABSENT, DA.SILENCE].map(da => b.win.determinerNiveauRaiPedagogique(da).label);
        const cibles = [DA.ASSIDU, DA.ABSENT, DA.SILENCE].map(da => b.win.determinerCibleIntervention(da).cible);
        // Le filtre de l'alerte « présents sans aucun travail remis » (tableau-bord-apercu.js, afficherAlerteNonParticipation), rejoué :
        const alerte = [DA.ASSIDU, DA.ABSENT, DA.SILENCE].filter(da => { const i = b.win.calculerIndicesEtudiant(da).sommatif; return i.nombreSeances > 0 && !(i.completion > 0 || i.performance > 0); });
        noter('D2', { niveaux, cibles, alerteNommee: alerte.length });
        expect(niveaux).toEqual(['Non-participation', 'Non-participation', 'Non-participation']);
        expect(cibles).toEqual(['Non-participation', 'Non-participation', 'Non-participation']);
        expect(alerte.length).toBe(3);
    });

    it('D3 · ZÉRO DONNÉE (ni présence ni évaluation) : A vaut 100 par défaut → « Non-participation » niveau 3 dès que les indices ont été calculés une fois', () => {
        // À la main : calculerAssiduite sans aucune séance saisie rend { indice: 1 } — 100 %. Le RàI lit A > 0 → « Non-participation ».
        // Tant que le stock indicesAssiduite n'existe pas (aucun écran du Suivi ouvert), A = 0 → « En attente », niveau 0.
        const jeu = jeuBase(); jeu.evaluations = []; jeu.presences = [];
        const avant = monter(jeu);
        const raiAvant = avant.win.determinerNiveauRaiPedagogique(DA.ASSIDU);
        const apres = monter(jeu); apres.calculerTout();
        const raiApres = apres.win.determinerNiveauRaiPedagogique(DA.ASSIDU);
        const A = apres.win.calculerTousLesIndices(DA.ASSIDU).A;
        noter('D3', { avantCalcul: { niveau: raiAvant.niveau, label: raiAvant.label }, apresCalcul: { niveau: raiApres.niveau, label: raiApres.label, A } });
        expect(raiAvant).toMatchObject({ niveau: 0, label: 'En attente' });
        expect(A).toBe(100);
        expect(raiApres).toMatchObject({ niveau: 3, label: 'Non-participation' });
    });

    it('D4 · UNE SEULE évaluation faible : le suivi des fondations dit « Difficulté émergente » niveau 1, la carte RàI dit niveau 3', () => {
        // À la main : Silence remet P1 à 55 (I, I, D). Fondations 0,40 < 0,70 → IPB 1, pas de précédent → « → » → « Difficulté
        // émergente », niveau RàI 1 (matrice IPB × direction). Le RàI pédagogique lit P = 0,55 < 0,64 → niveau 3 « Difficulté persistante ».
        const jeu = jeuBase(); jeu.evaluations.push(ev('E3P1', DA.SILENCE, 'P1', 55, 'I', ['I', 'I', 'D']));
        const b = monter(jeu); b.calculerTout();
        const p = noter('D4', portrait(b, DA.SILENCE));
        expect(p.suivi).toMatchObject({ ipb: 1, direction: '→', diagnostic: 'Difficulté émergente', niveauRaI: 1 });
        expect(p.rai).toMatchObject({ niveau: 3, pattern: 'Difficulté persistante' });
        expect(p.cible.niveau).toBe(1);   // la cible suit le suivi des fondations, pas la carte RàI
    });

    it('D5 · l\'incohérent (DA hors du groupe, évaluation sur une production inexistante) : invisible aux écrans du groupe, calculé à la volée sur son profil', () => {
        // À la main : absent de groupeEtudiants → aucun indice stocké ; le profil retombe sur « calcul à la volée » (indices.js) :
        // A 0 (pas d'entrée), C via calculerTauxCompletion (non chargé ici → 0), P via calculerPerformancePAN = les 3 meilleures notes
        // parmi ses évaluations qui entrent dans la note : (95 + 70) / 2 = 82,5 → l'évaluation sans production COMPTE ici ; le dépistage,
        // lui, la filtre par productionsIds → une seule évaluation (P1 à 70).
        const b = monter(jeuBase()); b.calculerTout();
        const indices = b.win.calculerTousLesIndices(DA.INCOHERENT);
        const n3 = b.win.calculerIndicesNDerniersArtefacts(DA.INCOHERENT, true);
        const moy = b.win.calculerMoyennesCriteres(DA.INCOHERENT);
        const enrichis = b.win.calculerEtudiantsPrioritaires.call(null); b.interne['tableau-bord-apercu.js']._tousEtudiantsEnrichis;
        const dansGroupe = b.interne['tableau-bord-apercu.js']._tousEtudiantsEnrichis.some(e => e.da === DA.INCOHERENT);
        noter('D5', { A: indices.A, C: indices.C, P: indices.P, nbArtefactsDepistage: n3.nbArtefacts, performance3: r3(n3.performance), moyStructure: r3(moy.structure), dansTableauDeBord: dansGroupe, enrichis: enrichis.length });
        expect(indices.A).toBe(0);
        expect(indices.P).toBe(83);                     // (95 + 70) / 2 — la production fantôme compte
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
    function creer(b, extra) {
        const id = b.win.creerIntervention(Object.assign({ date: '2026-02-09', duree: 2, niveauRai: 2, titre: 'Rattrapage banc', contexte: 'rattrapage', marquerNonParticipantsMotives: true, seanceConcernee: '2026-02-09' }, extra || {}));
        return id;
    }
    it('E1 · les clés sont namespacées par trimestre ; l\'intervention ne porte AUCUN groupe-cours : elle apparaît dans tous les groupes-cours du trimestre', () => {
        const b = monter(jeuBase());
        const id = creer(b);
        const cleEcrite = b.ecritures.filter(k => /interventions/.test(k));
        // Changer de groupe-cours actif (GC2) : la liste des interventions est-elle la même ?
        b.store.infoCours = { id: 'GC2', nom: 'Autre cours', groupe: '02', _groupeCoursId: 'GC2' };
        b.store.groupeCoursActif = { id: 'GC2', trimestreId: 'test' };
        const sousGC2 = b.win.obtenirInterventions();
        noter('E1', { cleEcrite, champsCours: Object.keys(sousGC2[0]).filter(k => /cours|groupe/i.test(k)), visibleSousGC2: sousGC2.length });
        expect(cleEcrite).toEqual(['test_interventions']);
        expect(sousGC2.length).toBe(1);
        expect(sousGC2[0].id).toBe(id);
        expect(Object.keys(sousGC2[0]).filter(k => /coursId|groupeCoursId/.test(k))).toEqual([]);
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
        b.win.marquerPresences(id, [DA.ABSENT]);
        b.win.transfererPresencesVersModule(id);
        const silenceApres = b.win.calculerAssiduite(DA.SILENCE, null);
        const fiches = b.store.test_presences.filter(p => p.date === '2026-02-09' && p.facultatif).map(p => ({ da: p.da, heures: p.heures, notes: p.notes }));
        const aApres = b.win.calculerAssiduite(DA.ABSENT, null);
        // Hors séance : un rattrapage un mardi.
        const id2 = creer(b, { date: '2026-02-10', seanceConcernee: null, marquerNonParticipantsMotives: false, contexte: 'hors-classe' });
        b.win.marquerPresences(id2, [DA.ABSENT]);
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

    it('E3 · retirer l\'élève du groupe : l\'intervention garde son DA, mais sa note individuelle disparaît de l\'affichage sans un mot', () => {
        const b = monter(jeuBase());
        const id = creer(b);
        b.store.test_interventions[0].etudiants = [DA.ABSENT]; b.store.test_interventions[0].notesIndividuelles = { [DA.ABSENT]: 'Note confidentielle sur Bruno' };
        const avec = b.interne['interventions.js'].genererAffichageNotesIndividuelles({ [DA.ABSENT]: 'Note confidentielle sur Bruno' });
        b.store.test_groupeEtudiants = b.store.test_groupeEtudiants.filter(e => e.da !== DA.ABSENT);
        const sans = b.interne['interventions.js'].genererAffichageNotesIndividuelles({ [DA.ABSENT]: 'Note confidentielle sur Bruno' });
        noter('E3', { daConserve: b.win.obtenirIntervention(id).etudiants, noteVisibleAvant: /Bruno/.test(avec), noteVisibleApres: /Bruno/.test(sans), compteurAffiche: (sans.match(/<strong>(\d+)<\/strong>/) || [])[1] });
        expect(b.win.obtenirIntervention(id).etudiants).toEqual([DA.ABSENT]);
        expect(/Note confidentielle/.test(avec)).toBe(true);
        expect(/Note confidentielle/.test(sans)).toBe(false);
        expect((sans.match(/<strong>(\d+)<\/strong>/) || [])[1]).toBe('1');   // le compteur dit 1, la liste est vide
    });

    it('E4 · la porte d\'écriture : db.setSync direct, jamais sauvegarderDonneesSelonMode — le mode anonymisation n\'arrête aucune écriture d\'intervention', () => {
        const src = readFileSync(path.join(RACINE, 'js/interventions.js'), 'utf8');
        const res = noter('E4', { setSync: (src.match(/db\.setSync\(/g) || []).length, parMode: (src.match(/sauvegarderDonneesSelonMode\(/g) || []).length });
        expect(res.parMode).toBe(0);
        expect(res.setSync).toBeGreaterThanOrEqual(3);
    });

    it('E5 · le bilan avant/après traduit une moyenne 0-1 en lettre par 0,85 / 0,75 / 0,65 écrits en clair — pas par l\'échelle, ni par les seuils configurés (0,64)', () => {
        const src = readFileSync(path.join(RACINE, 'js/interventions.js'), 'utf8');
        const ligne = src.split('\n').find(l => /niveauAvant = avant !== null \? \(avant >= 0\.85/.test(l));
        noter('E5', { ligne: ligne && ligne.trim().slice(0, 120) });
        expect(ligne).toMatch(/avant >= 0\.85 \? 'E' : avant >= 0\.75 \? 'M' : avant >= 0\.65 \? 'D' : 'I'/);
    });

    it('E6 · les observations de l\'intervention sont injectées dans un <textarea> SANS echapperHtml (règle 1) ; le bilan, lui, est échappé', () => {
        const src = readFileSync(path.join(RACINE, 'js/interventions.js'), 'utf8');
        const brut = /<textarea id="observationsIntervention"[^>]*>\$\{intervention\.observations \|\| ''\}<\/textarea>/.test(src);
        const bilanEchappe = /<textarea id="observationsBilan"[^>]*>' \+ echapperHtml\(bilan\.observationsBilan \|\| ''\)/.test(src);
        noter('E6', { observationsBrutes: brut, bilanEchappe });
        expect(brut).toBe(true);
        expect(bilanEchappe).toBe(true);
    });
});

/* =============================================================================================
   F · SUIVI DU GROUPE ET LISTE — les agrégats
   ============================================================================================= */
describe('F · les nombres du groupe sont-ils la somme des profils', () => {
    it('F1 · le panneau du Suivi du groupe enrichit chaque élève avec les MÊMES fonctions que le profil ; les filtres P < 65 et A+C < 65 retiennent qui on attend', () => {
        // À la main : Assidu (A 100, C 100, P 77, niveau 1), Absent (40, 100, 63, niveau 3), Silence (100, 0, P non constructible, niveau 3).
        // Filtre P < 65 : Absent (63) et Silence (0). Filtre M = (A + C) / 2 < 65 : Silence (50) seulement (Absent : 70).
        const b = monter(jeuBase()); b.calculerTout();
        b.win.calculerEtudiantsPrioritaires();
        const tb = b.interne['tableau-bord-apercu.js'];
        const enrichis = tb._tousEtudiantsEnrichis.map(e => ({ da: e.da, A: e.A, C: e.C, P: e.P, M: e.M, niveau: e.niveau, pattern: e.pattern, ipb: e.suivi ? e.suivi.ipb : null }));
        tb._filtresActifs.push('P'); tb.appliquerFiltres(); const filtreP = tb._etudiantsPrioritaires.map(e => e.da);
        tb._filtresActifs.length = 0; tb._filtresActifs.push('M'); tb.appliquerFiltres(); const filtreM = tb._etudiantsPrioritaires.map(e => e.da);
        tb._filtresActifs.length = 0;
        noter('F1', { enrichis, filtreP, filtreM });
        expect(enrichis).toEqual([
            { da: DA.ASSIDU, A: 100, C: 100, P: 77, M: 100, niveau: 1, pattern: 'Stable', ipb: 0 },
            { da: DA.ABSENT, A: 40, C: 100, P: 63, M: 70, niveau: 3, pattern: 'Difficulté persistante', ipb: 3 },
            { da: DA.SILENCE, A: 100, C: 0, P: 0, M: 50, niveau: 3, pattern: 'Non-participation', ipb: null }
        ]);
        expect(filtreP).toEqual([DA.SILENCE, DA.ABSENT]);
        expect(filtreM).toEqual([DA.SILENCE]);
    });

    it('F2 · un élève EXCLU (décrochage) n\'a plus d\'indices stockés : son profil retombe sur « 3 meilleures notes » — un P différent de la pratique', () => {
        // À la main : Absent en décrochage. calculerEtStockerIndicesCP et calculerEtSauvegarderIndicesAssiduite l'écartent → aucune
        // entrée. Son profil (calculerTousLesIndices) lit A = 0 (il a pourtant 4 présences) et P = calculerPerformancePAN =
        // (85 + 70 + 55) / 3 = 70 — la pratique dit 62,5.
        const jeu = jeuBase(); jeu.etudiants[1].statut = 'décrochage';
        const b = monter(jeu); b.calculerTout();
        const indices = b.win.calculerTousLesIndices(DA.ABSENT);
        const pratique = b.win.obtenirPratiqueParId('som-banc').calculerPerformance(DA.ABSENT);
        noter('F2', { stocke: b.store.test_indicesCP[DA.ABSENT] || null, profil: { A: indices.A, C: indices.C, P: indices.P }, pratique: r3(pratique) });
        expect(b.store.test_indicesCP[DA.ABSENT]).toBeUndefined();
        expect(indices.A).toBe(0);
        expect(indices.P).toBe(70);
        expect(r3(pratique)).toBe(0.625);
    });

    it('F3 · les élèves suivis (au plus cinq) vivent sous une clé NUE partagée entre trimestres et groupes ; changer de groupe la réécrit', () => {
        // À la main : la liste porte un DA de GC1 et un DA d'un autre groupe ; nettoyerEtudiantsSuivis, sous GC1, retire l'autre ET SAUVE.
        const b = monter(jeuBase(), { store: { etudiantsSuivis: [{ da: DA.ASSIDU }, { da: '3000001' }] } });
        const apres = b.interne['tableau-bord-apercu.js'].nettoyerEtudiantsSuivis();
        const clesTrimestres = readFileSync(path.join(RACINE, 'js/trimestres.js'), 'utf8');
        noter('F3', { apres, ecriture: b.ecritures.filter(k => /etudiantsSuivis/.test(k)), namespacee: /'etudiantsSuivis'/.test(clesTrimestres) });
        expect(apres).toEqual([{ da: DA.ASSIDU }]);
        expect(b.ecritures).toContain('etudiantsSuivis');          // clé nue, pas test_etudiantsSuivis
        expect(/'etudiantsSuivis'/.test(clesTrimestres)).toBe(false);
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

    it('G2 · le snapshot d\'archivage : par élève { da, nom, A, C, P } — rien du volet confidentiel ; son P historique n\'est pas la note du cours (#716)', async () => {
        // À la main : au 16 mars, deux travaux dus (P1, P2). Assidu : C 2/2 = 100 ; sa note du cours sur ces deux travaux est
        // (60 + 70) / 2 = 65. Le P historique sommatif (#716) : `calculerPerformanceHistorique` lit `e.da` / `e.note` (jamais
        // remplis) → null → repli IDME en dur (I 40, D 65)… sur des évaluations FILTRÉES SANS le DA : toutes celles du groupe
        // dues au 16 mars — Assidu I, D ; Absent E, D ; Incohérent D → (40 + 65 + 100 + 65 + 65) / 5 = 67. Le même 67 pour tous.
        const b = monter(jeuBase(), { store: { test_confidentielEtudiants: { [DA.ASSIDU]: { notes: 'NOTE-SENSIBLE-BANC' } } } }); b.calculerTout();
        const snap = await b.win.capturerSnapshotSeance('2026-03-16', null, { numeroSemaine: 10 });
        const assidu = snap.etudiants.find(e => e.da === DA.ASSIDU);
        const absent = snap.etudiants.find(e => e.da === DA.ABSENT);
        const cleEcrite = b.ecritures.filter(k => /snapshots/.test(k));
        // Le filtre du repli, tel qu'écrit (snapshots.js, `evaluationsFiltrees`) : aucun `etudiantDA` avant `productionsDues`.
        const srcSnap = readFileSync(path.join(RACINE, 'js/snapshots.js'), 'utf8');
        const blocFiltre = srcSnap.slice(srcSnap.indexOf('const evaluationsFiltrees = evaluations.filter'), srcSnap.indexOf('const productionsDues = productions.filter'));
        noter('G2', { champs: Object.keys(assidu), assidu, absentP: absent.P, cleEcrite, filtreParDA: /etudiantDA/.test(blocFiltre), sensible: /SENSIBLE/.test(JSON.stringify(snap)) });
        expect(Object.keys(assidu).sort()).toEqual(['A', 'A_cumulatif', 'C', 'P', 'da', 'nom', 'pattern', 'rai'].sort());
        expect(assidu).toMatchObject({ A: 100, C: 100, P: 67, nom: 'Alice Assidu' });
        expect(absent.P).toBe(67);                       // le même P pour l'absent qui régresse
        expect(/etudiantDA/.test(blocFiltre)).toBe(false);
        expect(cleEcrite).toEqual(['test_snapshots_GC1']);
        expect(/SENSIBLE/.test(JSON.stringify(snap))).toBe(false);
    });

    it('G3 · la consolidation lit le repère de maîtrise de l\'échelle (M = 75) : l\'assidu consolide Rigueur à P2, Structure et Nuance à P3 ; l\'absent ne consolide rien', () => {
        const b = monter(jeuBase()); b.calculerTout();
        const c1 = b.win.calculerConsolidationIndividuelle(DA.ASSIDU);
        const c2 = b.win.calculerConsolidationIndividuelle(DA.ABSENT);
        const c3 = b.win.calculerConsolidationIndividuelle(DA.SILENCE);
        const resume = (c) => c && Object.fromEntries(Object.entries(c.resume).map(([k, v]) => [k, v.type + (v.artefactNom ? ' (' + v.artefactNom + ')' : '')]));
        noter('G3', { seuil: c1.scoreMaitrise, deduit: c1.scoreMaitriseDeduit, assidu: resume(c1), absent: resume(c2), silence: c3 });
        expect(c1.scoreMaitrise).toBe(0.75);
        expect(c1.scoreMaitriseDeduit).toBe(false);
        expect(resume(c1)).toEqual({ Structure: 'consolide (Dissertation)', Rigueur: 'consolide (Analyse 2)', Nuance: 'consolide (Dissertation)' });
        expect(resume(c2)).toEqual({ Structure: 'non-consolide-avec-tentatives', Rigueur: 'non-consolide-avec-tentatives', Nuance: 'non-consolide-avec-tentatives' });
        expect(c3).toBeNull();
    });

    it('G4 · le volet confidentiel : un seul module le lit ; ni la synthèse PDF, ni l\'export CSV, ni les snapshots, ni un console.* ne le touchent ; le codex complet l\'emporte (sauvegarde personnelle) ; le mode anonymisation ne l\'anonymise pas', () => {
        const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
        const lecteurs = ['js/profil-etudiant-rapport.js', 'js/snapshots.js', 'js/export-resultats-finaux.js', 'js/synthese-retroaction-data.js', 'js/export-pdf.js', 'js/consolidation.js', 'js/tableau-bord-apercu.js', 'js/etudiants.js', 'js/graphiques-progression.js']
            .filter(f => /confidentielEtudiants|servicesAdaptes|sousCategorie|portraitStructure/.test(lire(f)));
        const modes = lire('js/modes.js');
        const casAnonymises = (modes.slice(modes.indexOf('function anonymiserDonnees')).match(/case '(\w+)':/g) || []).map(s => s.replace(/case '|':/g, ''));
        const confidentiel = lire('js/profil-etudiant-confidentiel.js');
        const consoleSensible = /console\.\w+\([^)]*(infos|donnees|notes)/.test(confidentiel);
        const litBrut = /db\.getSync\(cleConfidentiel|db\.getSync\(clePresences/.test(confidentiel);
        const nonEchappes = (confidentiel.match(/data-(date|da)="\$\{[^}]+\}"/g) || []);
        const boutonSansGarde = !/estModeeLectureSeule|anonymisation/.test(lire('js/profil-etudiant-sections-affichage.js').split('\n').filter(l => /ouvrirModalConfidentiel/.test(l)).join('\n'));
        noter('G4', { autresLecteurs: lecteurs, casAnonymises, consoleSensible, litLeStoreBrut: litBrut, attributsNonEchappes: nonEchappes, boutonSansGarde });
        expect(lecteurs).toEqual([]);
        expect(casAnonymises).toEqual(['groupeEtudiants', 'evaluationsSauvegardees', 'presences']);   // pas confidentielEtudiants, pas interventions
        expect(consoleSensible).toBe(false);
        expect(litBrut).toBe(true);
        expect(nonEchappes).toEqual(['data-date="${p.date}"', 'data-da="${da}"']);
        expect(boutonSansGarde).toBe(true);
    });

    it('G5 · #539 tenu : les identifiants du volet confidentiel portent encore les cinq critères de Grégoire', () => {
        const confidentiel = readFileSync(path.join(RACINE, 'js/profil-etudiant-confidentiel.js'), 'utf8');
        const ids = (confidentiel.match(/confidentiel-portrait-(\w+)/g) || []).filter((v, i, a) => a.indexOf(v) === i);
        noter('G5', { ids });
        expect(ids).toEqual(['confidentiel-portrait-structure', 'confidentiel-portrait-rigueur', 'confidentiel-portrait-plausibilite', 'confidentiel-portrait-nuance', 'confidentiel-portrait-francais']);
    });
});

/* =============================================================================================
   H · LES GRAPHIQUES — cinq mesures
   ============================================================================================= */
describe('H · ce que les courbes lisent', () => {
    it('H1 · les courbes par critère convertissent I/D/M/E en 40/65/75/100 ÉCRITS EN DUR : justes chez Grégoire par coïncidence, vides pour une échelle A/B/C', () => {
        const b = monter(jeuBase());
        const g = b.interne['graphiques-progression.js'];
        const d = g.obtenirDonneesCriteres(DA.ASSIDU);
        const jeu = jeuBase(); jeu.echelles = [clone(E3N)]; jeu.evaluations = ['P1', 'P2'].map(pid => ev('E1' + pid, DA.ASSIDU, pid, 70, 'B', ['B', 'B', 'B'], { echelleId: 'E3N' }));
        const b3 = monter(jeu);
        const d3 = b3.interne['graphiques-progression.js'].obtenirDonneesCriteres(DA.ASSIDU);
        noter('H1', { structureIDME: d.criteres.Structure, structureABC: d3.criteres.Structure, habiletes: { D: g.niveauHabiletesVersDecimal('D'), B: g.niveauHabiletesVersDecimal('B') } });
        expect(d.criteres.Structure).toEqual([65, 65, 75, 100]);
        expect(d3.criteres.Structure).toEqual([null, null]);
        expect(g.niveauHabiletesVersDecimal('B')).toBeNull();
    });

    it('H2 · les zones colorées du graphique viennent de « la première échelle du trimestre » (ou celle marquée parDefaut), pas de celle des évaluations', () => {
        const b = monter(jeuBase(), { store: { test_echellesTemplates: [clone(E60), clone(E0)] } });
        const zones = b.interne['graphiques-progression.js'].genererZonesDepuisEchelle();
        noter('H2', { codes: zones.map(z => z.code), premiereBorne: zones[1] && zones[1].yMin });
        expect(zones.map(z => z.code)).toEqual(['I', 'D', 'M', 'E']);
        expect(zones[1].yMin).toBe(0.6);   // E60, pas E0 (dont D commence à 65)
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
