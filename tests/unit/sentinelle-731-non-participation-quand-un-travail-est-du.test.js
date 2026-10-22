/**
 * SENTINELLE #731 — « NON-PARTICIPATION » SEULEMENT QUAND UN TRAVAIL EST DÛ ET QU'UNE COPIE DU GROUPE EST ÉVALUÉE.
 *
 * Audit de l'onglet Suivi, 5 septembre 2026, constats D-2 et D-3 (Rapports/AUDIT-onglet-suivi-2026-09-05.md).
 * La règle « nbArtefacts 0 ET assiduité > 0 → Non-participation, niveau 3 » ne regardait pas si un travail
 * était dû ni si une copie était évaluée : au retour de la première séance, TOUTE la classe était en palier
 * intensif (carte RàI, cible d'intervention, barre RàI et barre des patterns du groupe, alerte nommée) ;
 * et un élève à zéro donnée l'était aussi dès qu'un écran du Suivi avait calculé les indices (une
 * assiduité sans séance vaut 100 %).
 *
 * RÈGLE ARRÊTÉE PAR GRÉGOIRE (5 septembre 2026, au mot) : un élève qui n'a rien remis n'est
 * « Non-participation » que lorsqu'un travail est dû ET qu'au moins une copie du groupe est évaluée ;
 * avant, tout le monde reste « En attente ». Une fonction partagée, `depistagePeutJugerLaNonParticipation`
 * (profil-etudiant-calculs.js), et trois lecteurs : `determinerNiveauRaiPedagogique`,
 * `determinerCibleIntervention`, `afficherAlerteNonParticipation` (tableau-bord-apercu.js).
 *
 * Le cas fondé reste fondé : un travail dû, une copie évaluée pour un autre, rien pour lui → niveau 3.
 * Le défaut « assiduité 100 % sans séance » (indices.js) n'est PAS touché : inscrit, la garde le couvre.
 *
 * Break-test attendu : retirer la garde d'UN site → les cas « avant le premier travail » de ce site rougissent.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript, completerNoteParDefaut } from './_helpers/charger-script.js';
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
function monter({ echeance, evaluations, A }) {
    const store = { test_evaluationsSauvegardees: clone(evaluations), test_productions: PROD(echeance), test_echellesTemplates: [clone(E0)], test_grillesTemplates: [clone(GRILLE)],
        test_groupeEtudiants: [{ da: DA, nom: 'Silence', prenom: 'Chloé', groupe: '01' }, { da: AUTRE, nom: 'Assidu', prenom: 'Alice', groupe: '01' }],
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
    const { document: doc, ...autres } = completerNoteParDefaut(globaux);   // #1137 : le module des nombres affichés
    const storage = () => ({ _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } });
    new Function('window', 'document', 'console', 'localStorage', 'sessionStorage', ...Object.keys(autres), '"use strict";\n' + code)(win, doc, console, storage(), storage(), ...Object.values(autres));
    // Ce que le tableau de bord passe à l'alerte : la forme de calculerIndicesEtudiant, pour l'élève seul.
    const etudiantsTB = [{ da: DA, nom: 'Silence', prenom: 'Chloé', sommatif: { assiduite: A > 0 ? A / 100 : null, completion: 0, performance: 0, nombreSeances: A > 0 ? 3 : 0, nbEvaluations: 0 }, alternatif: { assiduite: A > 0 ? A / 100 : null, completion: 0, performance: 0, nombreSeances: A > 0 ? 3 : 0 } }];
    return { win, insertions, alerte: () => { win.__alerte(etudiantsTB); return insertions.length; } };
}
const portrait = (b) => ({ garde: b.win.depistagePeutJugerLaNonParticipation(), rai: b.win.determinerNiveauRaiPedagogique(DA), cible: b.win.determinerCibleIntervention(DA), alertes: b.alerte() });

describe('#731 · avant le premier travail, tout le monde reste « En attente »', () => {
    it('aucun travail dû (échéances futures), rien d\'évalué, élève présent : En attente (RàI niveau 0, cible niveau 0), aucune alerte nommée', () => {
        // Avant : « Non-participation », niveau 3, sur les trois écrans.
        const p = portrait(monter({ echeance: '2026-04-01', evaluations: [], A: 100 }));
        expect(p.garde).toEqual({ possible: false, raison: 'aucun-travail-du' });
        expect(p.rai).toMatchObject({ niveau: 0, label: 'En attente' });
        expect(p.cible).toMatchObject({ niveau: 0, cible: 'En attente' });
        expect(p.alertes).toBe(0);
    });
    it('un travail dû mais AUCUNE copie évaluée dans le groupe, élève présent : En attente partout', () => {
        const p = portrait(monter({ echeance: '2026-02-01', evaluations: [], A: 100 }));
        expect(p.garde).toEqual({ possible: false, raison: 'aucune-copie-evaluee' });
        expect(p.rai).toMatchObject({ niveau: 0, label: 'En attente' });
        expect(p.cible).toMatchObject({ niveau: 0, cible: 'En attente' });
        expect(p.alertes).toBe(0);
    });
    it('un travail dû ET une copie évaluée pour un autre, rien pour lui, présent : le cas fondé reste « Non-participation » niveau 3, et l\'alerte le nomme', () => {
        const p = portrait(monter({ echeance: '2026-02-01', evaluations: [EVAL_AUTRE], A: 100 }));
        expect(p.garde).toEqual({ possible: true, raison: null });
        expect(p.rai).toMatchObject({ niveau: 3, label: 'Non-participation' });
        expect(p.cible).toMatchObject({ niveau: 3, cible: 'Non-participation' });
        expect(p.alertes).toBe(1);
    });
    it('zéro donnée (aucune séance : A inconnu, `null` depuis #743) : En attente, pas « Non-participation »', () => {
        // D-3 de l'audit : avant le lot D (19 sept. 2026), « assiduité 100 % sans séance » ; la garde #731 couvrait le cas, et `null > 0` le couvre aussi.
        const p = portrait(monter({ echeance: '2026-02-01', evaluations: [], A: null }));
        expect(p.rai.label).toBe('En attente');
        expect(p.cible.cible).toBe('En attente');
    });
    it('aucune présence, garde ouverte : En attente pour le RàI (inchangé), et la cible ne dit pas « Non-participation »', () => {
        const p = portrait(monter({ echeance: '2026-02-01', evaluations: [EVAL_AUTRE], A: 0 }));
        expect(p.rai).toMatchObject({ niveau: 0, label: 'En attente' });
        expect(p.cible.cible).not.toBe('Non-participation');
        expect(p.alertes).toBe(0);   // pas de séance saisie pour lui
    });
});
