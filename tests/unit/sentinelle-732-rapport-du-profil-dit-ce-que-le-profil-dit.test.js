/**
 * SENTINELLE #732 — LE RAPPORT DU PROFIL SE GÉNÈRE, ET SES NOMBRES SONT CEUX DU PROFIL.
 *
 * Audit de l'onglet Suivi, 5 septembre 2026, constat B-5 (Rapports/AUDIT-onglet-suivi-2026-09-05.md).
 * Deux moitiés : (a) `obtenirDetailsAssiduite` (profil-etudiant-sections-affichage.js) est appelée
 * par son nom nu depuis l'IIFE de profil-etudiant-rapport.js et n'était exportée nulle part — le
 * bouton « Rapport » écrivait un message d'erreur (vu dans WebKit : spec
 * tests/integration/profil-rapport-732-se-genere.spec.js, rouge avant, verte après) ; (b) le rapport
 * recalculait P (« 75 % (4 meilleurs artefacts actuels) ») et C sur des artefacts de portfolio que le
 * cours n'a pas (« 0 remises / 0 productions ») : ses trois nombres viennent maintenant de
 * `calculerTousLesIndices`, la source du profil et de la Liste (règle « même source », #699).
 *
 * Break-test attendu : retirer l'export → le cas (a) rougit ; remettre l'ancien calcul de P (les N
 * meilleurs) → le cas (b) rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';   // lot A (16 sept. 2026) : les deux prédicats réels du registre

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DA = '2000001';
const PRODUCTIONS = [
    { id: 'P1', titre: 'Analyse 1', type: 'travail', ponderation: 20 }, { id: 'P2', titre: 'Analyse 2', type: 'travail', ponderation: 20 },
    { id: 'P3', titre: 'Dissertation', type: 'travail', ponderation: 30 }, { id: 'P4', titre: 'Examen', type: 'examen', ponderation: 30 },
    { id: 'P5', titre: 'Exercice facultatif', type: 'travail', ponderation: 0, facultatif: true }
];
const ev = (id, prod, note, niveau, date, extra) => Object.assign({ id, etudiantDA: DA, productionId: prod, noteFinale: note, niveauFinal: niveau, ponderationCouverte: 100, verrouillee: true, dateEvaluation: date }, extra || {});
const EVALUATIONS = [
    ev('E1', 'P1', 60, 'I', '2026-02-01'), ev('E2', 'P2', 70, 'D', '2026-03-01'),
    ev('E3', 'P3', 55, 'I', '2026-04-01', { remplaceeParId: 'E3R' }), ev('E3R', 'P3', 80, 'M', '2026-04-20', { repriseDeId: 'E3' }),
    ev('E4', 'P4', 90, 'E', '2026-05-01'), ev('E5', 'P5', 100, 'E', '2026-05-02'),
    ev('EX', 'P1', 88, 'E', '2026-02-01', { etudiantDA: '2000002' })
];

function monterRapport(indices) {
    const store = { test_groupeEtudiants: [{ da: DA, nom: 'Assidu', prenom: 'Alice' }], test_productions: PRODUCTIONS, test_evaluationsSauvegardees: EVALUATIONS, test_modalitesEvaluation: {} };
    const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)), setSync() {}, get: async () => null, set: async () => {} };
    const globaux = { db, cle: (k) => 'test_' + k, document: { getElementById: () => null, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] },
        obtenirDonneesSelonMode: (k) => JSON.parse(JSON.stringify(store['test_' + String(k).replace(/^test_/, '')] || [])),
        // La source du profil et de la Liste, telle que le profil la lit.
        calculerTousLesIndices: () => indices,
        obtenirDetailsAssiduite: () => ({ periodesPresentes: 20, periodesOffertes: 20, nombreSeances: 10, absences: [] }),
        // #871 (17 sept. 2026) : le rapport met les périodes en forme par le formateur RÉEL du profil (helpers.js).
        formaterNombrePeriodes: chargerScript('js/profil-etudiant-helpers.js').formaterNombrePeriodes,
        // Les règles partagées, telles que les modules réels les exportent (helpers ; le registre #706 est posé plus bas, en VRAI).
        // #871, volet complétion (17 sept. 2026) : le rapport ne recompte plus, il lit le détail de la pratique active
        // (`obtenirDetailsCompletion`, portfolio.js). Ce banc à globaux simulés le fournit tel que la pratique le rendrait
        // (quatre productions comptées, quatre remises) ; la fraction RÉELLE des quatre familles est jugée par
        // sentinelle-871-la-fraction-de-completion-compte-ce-que-compte-C.
        obtenirDetailsCompletion: () => ({ remis: 4, total: 4 }),
        calculerEtStockerIndicesCP() {}, estModeeLectureSeule: () => false, notifications: { succes() {}, erreur() {} }, alert() {} };
    const win = { addEventListener() {}, removeEventListener() {} };
    chargerPredicatsCopie(win);                                        // window.evaluationNonRemise (lot A)
    globaux.evaluationEntreDansLaNote = win.evaluationEntreDansLaNote;   // le rapport l'appelle par son nom nu
    chargerScript('js/profil-etudiant-rapport.js', globaux, win);
    return win;
}

describe('#732 · le rapport du profil', () => {
    it('(a) `obtenirDetailsAssiduite` est exportée sur window par sections-affichage.js — avant, aucun export, et rapport.js levait', () => {
        const src = readFileSync(path.join(RACINE, 'js/profil-etudiant-sections-affichage.js'), 'utf8');
        expect((src.match(/^\s*window\.obtenirDetailsAssiduite\s*=\s*obtenirDetailsAssiduite;/gm) || []).length).toBe(1);
        expect(/const detailsA = obtenirDetailsAssiduite\(da\);/.test(readFileSync(path.join(RACINE, 'js/profil-etudiant-rapport.js'), 'utf8'))).toBe(true);
    });
    it('(b) P et C sont ceux de calculerTousLesIndices : « Performance : 77% (note du cours) », « Complétion : 100% (4 remises / 4 productions) »', () => {
        // À la main : quatre productions comptées (non facultatives, évaluées pour au moins un élève) ; l'élève en a remis quatre ;
        // la note du cours dit 77. Avant : « 75% (4 meilleurs artefacts actuels) » (les 4 meilleures notes : 90, 80, 70, 60) et « 0 remises / 0 productions ».
        const rapport = monterRapport({ A: 100, C: 100, P: 77, M: 100, noteConstructible: true }).genererRapportAPI(DA);
        expect(rapport).toContain('Assiduité : 100\u00A0% (20 / 20 périodes)');
        expect(rapport).toContain('Complétion : 100\u00A0% (4 remises / 4 productions)');
        expect(rapport).toContain('Performance : 77\u00A0% (note du cours)');
        expect(rapport).not.toMatch(/meilleurs artefacts/);
    });
    it('les évaluations listées sont celles qui COMPTENT dans la note du cours : la reprise, pas l\'originale remplacée ; le facultatif y est (il compte), l\'autre élève non', () => {
        const rapport = monterRapport({ A: 100, C: 100, P: 77, noteConstructible: true }).genererRapportAPI(DA);
        const lignes = rapport.split('\n').filter(l => /^\d+- /.test(l));
        expect(lignes).toEqual(['1- Analyse 1 : I (60,0)', '2- Analyse 2 : D (70,0)', '3- Dissertation : M (80,0)', '4- Examen : E (90,0)', '5- Exercice facultatif : E (100,0)']);
    });
    it('une note non constructible se dit, elle ne s\'écrit pas 0', () => {
        const rapport = monterRapport({ A: 100, C: 0, P: 0, noteConstructible: false }).genererRapportAPI(DA);
        expect(rapport).toContain('Performance : non constructible');
        expect(rapport).not.toMatch(/Performance : 0%/);
    });
});
