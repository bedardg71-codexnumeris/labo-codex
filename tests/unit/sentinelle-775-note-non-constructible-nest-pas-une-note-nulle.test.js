/**
 * SENTINELLE #775 — UNE NOTE QUI N'EXISTE PAS ENCORE N'EST PAS UNE NOTE DE ZÉRO.
 *
 * Retour terrain du 7 septembre 2026 (SUIVI-BUGS #541, iPad, 1.123.11), captures à l'appui :
 * dans Suivi › Groupe, A = 96 %, C = 96 %, une seule production évaluée avec de vraies notes
 * (23 %, 41,7 %, 83,3 %, 96,3 %…) — et pourtant « Distribution : Incomplet ou insuffisant : 28 »,
 * « Parmi les 28 étudiant·es en difficulté… », « Niveau 3 Intensif : 27 (100 %) » pendant que la
 * barre des patterns disait « Progression stable : 24 (89 %) ». Deux chemins, deux vérités sur
 * les mêmes copies.
 *
 * CAUSE : `portfolio.js` stocke `P = 0` + `noteConstructible: false` tant que la note du cours ne
 * se construit pas (PAN-Standards qui attend ses N résultats, config portfolio en erreur…) — c'est
 * le comportement voulu (#394, règle 4). Le drapeau était honoré par les bulles, le panneau
 * prioritaire, le rapport de profil, le comparateur et l'export ; quatre lecteurs l'ignoraient et
 * lisaient le 0 comme une performance nulle.
 *
 * RÈGLE ARRÊTÉE PAR GRÉGOIRE (7 septembre 2026) : tant que la note n'est pas constructible, le
 * palier RàI se décide SUR LE DÉPISTAGE SEUL — le pattern des N derniers artefacts, la même donnée
 * que la barre SOLO. Et la carte du groupe ne répartit que les élèves dont la note existe.
 *
 * Break-test attendu : remettre `P < seuilIdmeInsuffisant` sans la garde `noteConstructible`
 * (profil-etudiant-calculs.js) → le premier cas rougit ; retirer un des filtres
 * `!e.sansEvaluation && !e.nonConstructible` (tableau-bord-apercu.js) → les cas de la carte rougissent.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript, completerNoteParDefaut } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';   // lot A (16 sept. 2026) : les deux prédicats réels du registre

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const clone = (x) => JSON.parse(JSON.stringify(x));
const DA = '2000003';

const E0 = { id: 'E0', nom: 'IDME0', parDefaut: true, niveaux: [
    { code: 'I', nom: 'Incomplet ou insuffisant', min: 0, max: 64, valeurCalcul: 40 },
    { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75 },
    { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100 }
] };
const GRILLE = { id: 'G1', nom: 'Dépistage', criteres: [
    { id: 'c1', nom: 'Structure', ponderation: 50, niveauSOLO: 'multistructurel' },
    { id: 'c2', nom: 'Nuance', ponderation: 50, niveauSOLO: 'relationnel' }
] };
// Pratique PAN-Standards : seuls les artefacts de portfolio sont évaluables (obtenirIdsProductionsEvaluables).
const PRODUCTIONS = [{ id: 'P1', titre: 'Texte diagnostic', type: 'artefact-portfolio', numero: 1, dateEcheance: '2026-09-01' }];
const EVALUATION = {
    id: 'EV1', etudiantDA: DA, productionId: 'P1', noteFinale: 96, niveauFinal: 'E', echelleId: 'E0',
    ponderationCouverte: 100, verrouillee: true, dateEvaluation: '2026-09-05T12:00:00.000Z',
    retroactionFinale: 'R.', criteres: [
        { critereId: 'c1', critereNom: 'Structure', niveauSelectionne: 'E' },
        { critereId: 'c2', critereNom: 'Nuance', niveauSelectionne: 'E' }
    ]
};

const MODULES = ['js/interpretation-config.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/tableau-bord-apercu.js'];
const EXPORTS = (() => { const n = new Set(); for (const f of MODULES) for (const m of readFileSync(path.join(RACINE, f), 'utf8').matchAll(/^\s*window\.([A-Za-z_$][\w$]*)\s*=/gm)) n.add(m[1]); return [...n]; })();

/**
 * Monte le groupe avec UNE production évaluée à 96 % pour l'élève, et un stock d'indices
 * dont le P vaut 0 — `noteConstructible` disant si ce 0 est une note ou une absence de note.
 */
function monter({ noteConstructible }) {
    const store = {
        test_evaluationsSauvegardees: [clone(EVALUATION)], test_productions: clone(PRODUCTIONS),
        test_echellesTemplates: [clone(E0)], test_grillesTemplates: [clone(GRILLE)],
        test_groupeEtudiants: [{ da: DA, nom: 'R.', prenom: 'Jacob', groupe: '00007' }],
        infoCours: { id: 'GC1', groupe: '00007', _groupeCoursId: 'GC1' }
    };
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); }, get: async () => null, set: async () => {} };
    const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);
    const document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ style: {}, classList: { add() {}, remove() {}, contains() { return false; } } }), addEventListener() {}, body: { classList: { add() {}, remove() {}, contains() { return false; } } }, documentElement: {}, readyState: 'complete' };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', dateLocaleYMD: () => '2026-09-07', pluriel: (n, s, p) => (n > 1 ? p : s) };
    const fwd = (nom) => (...a) => win[nom](...a);
    const globaux = { document, db, cle,
        obtenirDonneesSelonMode: (k) => { const kb = String(k).replace(/^test_/, ''); return ('test_' + kb) in store ? clone(store['test_' + kb]) : []; },
        obtenirPreference: (n) => (n === 'grilleReferenceDepistage' ? 'G1' : null), definirPreference() {}, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirTypePratiqueActive: () => 'standards', estEtudiantExclu: () => false, filtrerEtudiantsParMode: (a) => a, estModeeLectureSeule: () => false,
        obtenirEtudiantsCoursActif: () => clone(store.test_groupeEtudiants),
        // Le stock d'indices : P à 0, `noteConstructible` disant ce que ce 0 veut dire.
        calculerTousLesIndices: () => ({ A: 96, C: 96, P: 0, M: 0.96, noteConstructible: noteConstructible }),
        obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
        resoudreModeleParId: (type, id) => clone((store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []).find(m => m.id === id) || null),
        accordTermeProduction: (m, n) => (m === 'evalue' ? (n > 1 ? 'évalués' : 'évalué') : m), obtenirTermeProduction: (c) => (c === 'pluriel' ? 'artefacts' : 'artefact'), anonymiserNom: undefined };
    for (const nom of EXPORTS) if (!(nom in globaux) && !/^[A-Z]/.test(nom) && nom !== 'SEUILS_PAR_DEFAUT') globaux[nom] = fwd(nom);
    chargerPredicatsCopie(win);
    chargerScript('js/interpretation-config.js', globaux, win);
    chargerScript('js/profil-etudiant-calculs.js', globaux, win);
    chargerScript('js/profil-etudiant-helpers.js', globaux, win);
    // Les trois lecteurs de la carte ne sont pas exportés : accesseurs injectés avant le `})();` final.
    let code = readFileSync(path.join(RACINE, 'js/tableau-bord-apercu.js'), 'utf8');
    const fin = code.lastIndexOf('})();');
    code = code.slice(0, fin)
        + '\n;window.__distribution = calculerDistributionPerformance;'
        + '\n;window.__interpretation = genererInterpretationPerformance;'
        + '\n;window.__notePassage = genererDiagnosticNotePassage;\n'
        + code.slice(fin);
    const { document: doc, ...autres } = completerNoteParDefaut(globaux);   // #1137 : le module des nombres affichés
    const storage = () => ({ _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } });
    new Function('window', 'document', 'console', 'localStorage', 'sessionStorage', ...Object.keys(autres), '"use strict";\n' + code)(win, doc, console, storage(), storage(), ...Object.values(autres));
    return win;
}

/** Le groupe tel que `genererBarreDistribution` le passe à ses lecteurs : n élèves à P = 0. */
const groupe = (n, drapeau) => Array.from({ length: n }, (_, i) => ({
    da: '200000' + i, nom: 'Nom' + i, prenom: 'Prénom' + i, valeur: 0,
    sansEvaluation: false, nonConstructible: false, ...drapeau
}));

describe('#775 · le palier RàI ne se décide pas sur une note qui n\'existe pas encore', () => {
    it('note NON constructible (PAN-STD qui attend ses résultats) : le palier vient du dépistage, pas du 0', () => {
        // Avant : `P < 0,64` → « Niveau 3 - Intensif » pour tout le groupe dès le premier artefact.
        const rai = monter({ noteConstructible: false }).determinerNiveauRaiPedagogique(DA);
        expect(rai.niveau).toBe(1);
        expect(rai.label).toBe('Niveau 1 - Universel');
        expect(rai.pattern).toBe('Stable');
    });

    it('note CONSTRUCTIBLE à 0 % : c\'est une vraie performance nulle, le palier 3 reste', () => {
        const rai = monter({ noteConstructible: true }).determinerNiveauRaiPedagogique(DA);
        expect(rai.niveau).toBe(3);
    });
});

describe('#775 · la carte du groupe ne répartit que les élèves dont la note existe', () => {
    const win = () => monter({ noteConstructible: false });

    it('tout le groupe sans note constructible : aucune répartition, aucun « en difficulté »', () => {
        // Avant : « Incomplet ou insuffisant : 28 » et « Parmi les 28 étudiant·es en difficulté… ».
        const w = win();
        const etudiants = groupe(28, { nonConstructible: true });
        expect(w.__distribution(etudiants)).toBeNull();
        expect(w.__interpretation(etudiants, clone(E0))).toBe('');
        expect(w.__notePassage(etudiants)).toBe('');
    });

    it('mélange : seuls les élèves à note constructible entrent dans la répartition', () => {
        const w = win();
        const etudiants = [
            ...groupe(3, { nonConstructible: true }),
            { da: '2000010', nom: 'A', prenom: 'A', valeur: 0.90, sansEvaluation: false, nonConstructible: false },
            { da: '2000011', nom: 'B', prenom: 'B', valeur: 0.30, sansEvaluation: false, nonConstructible: false }
        ];
        const html = w.__distribution(etudiants);
        expect(html).toContain('Étendu : 1');
        expect(html).toContain('Incomplet ou insuffisant : 1');
        // Les trois sans note ne gonflent pas le premier niveau de l'échelle.
        expect(html).not.toContain('Incomplet ou insuffisant : 4');
        expect(w.__notePassage(etudiants)).toContain('1 étudiant·e (50\u00A0%) sont en difficulté');
    });

    it('un élève sans aucune remise ne compte pas non plus comme une performance nulle', () => {
        const w = win();
        const etudiants = [
            { da: '2000012', nom: 'C', prenom: 'C', valeur: 0, sansEvaluation: true, nonConstructible: false },
            { da: '2000013', nom: 'D', prenom: 'D', valeur: 0.90, sansEvaluation: false, nonConstructible: false }
        ];
        expect(w.__distribution(etudiants)).toContain('Incomplet ou insuffisant : 0');
        expect(w.__notePassage(etudiants)).not.toContain('en difficulté');
    });
});
