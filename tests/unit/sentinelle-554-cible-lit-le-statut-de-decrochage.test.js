/**
 * SENTINELLE #554 — LE STATUT « DÉCROCHAGE » ARRIVE JUSQU'À LA CIBLE D'INTERVENTION.
 *
 * `interpreterMobilisation(A, C, statutDecrochage)` ne rend « Décrochage » que si son 3e argument
 * est vrai ; `determinerCibleIntervention` l'appelait avec deux. Branché le 11 oct. 2026 (lot 10) :
 * le statut vient de la fiche du groupe-cours actif (Cadre › Trimestre).
 * Rien ne change à l'écran : le seul appelant vivant (tableau de bord) écarte déjà les exclus.
 * Harnais : celui de #731 (vrais modules), l'élève a une copie évaluée pour atteindre la branche.
 *
 * Break-test : rendre le 3e argument `false` → l'essai « décrochage » rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';   // lot A (16 sept. 2026) : les deux prédicats réels du registre

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const clone = (x) => JSON.parse(JSON.stringify(x));
const DA = '2000003', AUTRE = '2000001';

const E0 = { id: 'E0', nom: 'IDME0', niveaux: [{ code: 'I', min: 0, max: 64, valeurCalcul: 40 }, { code: 'D', min: 65, max: 74, valeurCalcul: 65 }, { code: 'M', min: 75, max: 84, valeurCalcul: 75 }, { code: 'E', min: 85, max: 100, valeurCalcul: 100 }] };
const GRILLE = { id: 'G1', nom: 'Dépistage', criteres: [{ id: 'c1', nom: 'Structure', ponderation: 50, niveauSOLO: 'multistructurel' }, { id: 'c2', nom: 'Nuance', ponderation: 50, niveauSOLO: 'relationnel' }] };
const PROD = (echeance) => [{ id: 'P1', titre: 'Analyse 1', type: 'travail', ponderation: 50, dateEcheance: echeance }, { id: 'P2', titre: 'Analyse 2', type: 'travail', ponderation: 50, dateEcheance: echeance }];
const EVAL_AUTRE = { id: 'EA', etudiantDA: AUTRE, productionId: 'P1', noteFinale: 80, niveauFinal: 'M', echelleId: 'E0', ponderationCouverte: 100, verrouillee: true,
    dateEvaluation: '2026-02-02T12:00:00.000Z', retroactionFinale: 'R.', criteres: [{ critereId: 'c1', critereNom: 'Structure', niveauSelectionne: 'M' }, { critereId: 'c2', critereNom: 'Nuance', niveauSelectionne: 'M' }] };

const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/tableau-bord-apercu.js'];
const EXPORTS = (() => { const n = new Set(); for (const f of MODULES) for (const m of readFileSync(path.join(RACINE, f), 'utf8').matchAll(/^\s*window\.([A-Za-z_$][\w$]*)\s*=/gm)) n.add(m[1]); return [...n]; })();

/** Monte le groupe : `echeance` des deux travaux, `evaluations` du groupe, `A` de l'élève. */
function monter({ echeance, evaluations, A, STATUT }) {
    const store = { test_evaluationsSauvegardees: clone(evaluations), test_productions: PROD(echeance), test_echellesTemplates: [clone(E0)], test_grillesTemplates: [clone(GRILLE)],
        test_groupeEtudiants: [{ da: DA, nom: 'Silence', prenom: 'Chloé', groupe: '01', statut: STATUT }, { da: AUTRE, nom: 'Assidu', prenom: 'Alice', groupe: '01' }],
        infoCours: { id: 'GC1', groupe: '01', _groupeCoursId: 'GC1' } };
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); }, get: async () => null, set: async () => {} };
    const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);
    const insertions = [];
    const carte = { querySelector: () => null, insertAdjacentHTML: (ou, html) => { insertions.push(html); } };
    const document = { getElementById: (id) => (id === 'carte-indicateurs-acpe' ? carte : null), querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ style: {}, classList: { add() {}, remove() {}, contains() { return false; } } }), addEventListener() {}, body: { classList: { add() {}, remove() {}, contains() { return false; } } }, documentElement: {}, readyState: 'complete' };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', dateLocaleYMD: () => '2026-02-10' };
    const fwd = (nom) => (...a) => win[nom](...a);
    const globaux = { document, db, cle,
        obtenirDonneesSelonMode: (k) => { const kb = String(k).replace(/^test_/, ''); return ('test_' + kb) in store ? clone(store['test_' + kb]) : []; },
        obtenirPreference: (n) => (n === 'grilleReferenceDepistage' ? 'G1' : null), definirPreference() {}, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirTypePratiqueActive: () => 'sommative', estEtudiantExclu: () => false, filtrerEtudiantsParMode: (a) => a, estModeeLectureSeule: () => false,
        obtenirEtudiantsCoursActif: () => clone(store.test_groupeEtudiants),
        // L'élève n'a aucune évaluation : le stock d'indices dit A (100 par défaut sans séance — indices.js, non touché ici), C 0, P 0.
        calculerTousLesIndices: (da) => (da === DA ? { A, C: 0, P: 0, M: A / 2, noteConstructible: false } : { A: 100, C: 100, P: 80, M: 100, noteConstructible: true }),
        obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
        resoudreModeleParId: (type, id) => clone((store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []).find(m => m.id === id) || null),
        accordTermeProduction: (m) => m, obtenirTermeProduction: () => 'travail', anonymiserNom: undefined };
    for (const nom of EXPORTS) if (!(nom in globaux) && !/^[A-Z]/.test(nom) && nom !== 'SEUILS_PAR_DEFAUT') globaux[nom] = fwd(nom);
    chargerPredicatsCopie(win);
    chargerScript('js/interpretation-config.js', globaux, win);
    chargerScript('js/contexte-qualification.js', globaux, win);   // #821 lot A : les quatre règles de qualification d'un contexte
    chargerScript('js/profil-etudiant-calculs.js', globaux, win);
    chargerScript('js/profil-etudiant-helpers.js', globaux, win);
    // `afficherAlerteNonParticipation` n'est pas exportée : exposée par un accesseur injecté avant le `})();` final.
    let code = readFileSync(path.join(RACINE, 'js/tableau-bord-apercu.js'), 'utf8');
    const fin = code.lastIndexOf('})();');
    code = code.slice(0, fin) + '\n;window.__alerte = afficherAlerteNonParticipation;\n' + code.slice(fin);
    const { document: doc, ...autres } = globaux;
    const storage = () => ({ _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } });
    new Function('window', 'document', 'console', 'localStorage', 'sessionStorage', ...Object.keys(autres), '"use strict";\n' + code)(win, doc, console, storage(), storage(), ...Object.values(autres));
    // Ce que le tableau de bord passe à l'alerte : la forme de calculerIndicesEtudiant, pour l'élève seul.
    const etudiantsTB = [{ da: DA, nom: 'Silence', prenom: 'Chloé', sommatif: { assiduite: A > 0 ? A / 100 : null, completion: 0, performance: 0, nombreSeances: A > 0 ? 3 : 0, nbEvaluations: 0 }, alternatif: { assiduite: A > 0 ? A / 100 : null, completion: 0, performance: 0, nombreSeances: A > 0 ? 3 : 0 } }];
    return { win, insertions, alerte: () => { win.__alerte(etudiantsTB); return insertions.length; } };
}
const EVAL_DA = Object.assign(clone(EVAL_AUTRE), { id: 'ED', etudiantDA: DA });

describe('#554 · la cible d\'intervention lit le statut de décrochage', () => {
    it('élève en décrochage, avec une copie évaluée : cible « Décrochage », niveau 3', () => {
        const b = monter({ echeance: '2026-02-01', evaluations: [EVAL_AUTRE, EVAL_DA], A: 90, STATUT: 'décrochage' });
        expect(b.win.determinerCibleIntervention(DA)).toMatchObject({ cible: 'Décrochage', niveau: 3 });
    });
    it('même élève, actif : la cible ne dit pas « Décrochage »', () => {
        const b = monter({ echeance: '2026-02-01', evaluations: [EVAL_AUTRE, EVAL_DA], A: 90, STATUT: 'actif' });
        expect(b.win.determinerCibleIntervention(DA).cible).not.toBe('Décrochage');
    });
    it('statut « inactif » (registrariat) : pas « Décrochage » non plus', () => {
        const b = monter({ echeance: '2026-02-01', evaluations: [EVAL_AUTRE, EVAL_DA], A: 90, STATUT: 'inactif' });
        expect(b.win.determinerCibleIntervention(DA).cible).not.toBe('Décrochage');
    });
});
