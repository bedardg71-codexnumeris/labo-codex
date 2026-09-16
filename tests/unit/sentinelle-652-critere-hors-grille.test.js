/**
 * #652 · UNE ÉVALUATION DONT UN CRITÈRE A QUITTÉ SA GRILLE S'OUVRE, LE SIGNALE, LE GARDE
 * (16 septembre 2026).
 *
 * Rapport de Grégoire du 31 août (13 h 57) : « Timeout génération selects critères » alors que les
 * cartes étaient rendues. Mesuré au banc le 16 sept. (spec WebKit evaluation-652) : l'attente guettait
 * le PREMIER critère enregistré ; sorti de la grille, il n'est jamais rendu, et l'ouverture échouait.
 * Arrêté par Grégoire le même jour : CONSERVER et SIGNALER le critère sorti de la grille.
 *
 *   A — `criteresHorsGrille` : ce qui est hors grille, et seulement pour la même grille ;
 *   B — l'attente : n'importe quel critère enregistré suffit ; sans aucun, des cartes rendues au délai
 *       suffisent ; sans carte, elle rejette toujours ;
 *   C — témoins de source : les deux réécritures d'une évaluation existante (auto-save, « Enregistrer »
 *       en modification) ajoutent les critères hors grille ; les deux renderers signalent.
 *
 * Le comportement à l'écran (avis, niveaux restaurés, auto-save qui garde) est jugé par la spec WebKit.
 * Aucune donnée réelle lue ni écrite.
 */
import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

const elementDom = () => ({
    value: '', textContent: '', style: {}, classList: { add() {}, remove() {}, contains: () => false },
    closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    appendChild() {}, remove() {}, setAttribute() {}, addEventListener() {}, dispatchEvent() { return true; }
});

function chargerChargement() {
    const document = {
        getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {}
    };
    return chargerScript('js/evaluation-chargement.js', {
        document, evaluationEnCours: null,
        db: { getSync: (k, d) => d, setSync() {} }, cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s)
    }, { addEventListener() {}, removeEventListener() {} });
}

/** `evaluation.js` avec un écran où seuls `elementsRendus` existent, et des cartes ou non. */
function monterOuverture(elementsRendus, { cartes }) {
    const ecran = {};
    elementsRendus.forEach((id) => { ecran[id] = elementDom(); });
    const document = {
        getElementById: (id) => ecran[id] || null,
        querySelector: (sel) => (cartes && sel === '#listeCriteresGrille1 .eval-critere-carte' ? elementDom() : null),
        querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom()
    };
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: null };
    chargerScript('js/evaluation.js', {
        document, evaluationEnCours: null,
        db: { getSync: (k, d) => d, setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => 'test_' + k, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [], sauvegarderDonneesSelonMode: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        obtenirPreference: () => null, obtenirCoursActifId: () => null,
        afficherSection() {}, afficherSousSection() {}, estModeeLectureSeule: () => false,
        obtenirConfigJetons: () => ({}), verifierDisponibiliteJeton: () => true, compterJetonsUtilises: () => 0
    }, win);
    return win;
}

const GRILLE = { id: 'G1', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }] };
const EVAL = { grilleId: 'G1', criteres: [
    { critereId: 'c0', critereNom: 'Ancien critère', niveauSelectionne: 'E' },
    { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M' },
    { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'D' }
] };

/** L'issue de l'attente après `ms` millisecondes, en minuteries simulées. */
async function issueApres(win, evaluation, ms) {
    const attente = win._attendreSaisiePremierCritereModif(evaluation);
    const issue = attente.then((v) => `résolue:${v}`, (e) => `rejetée:${e.message}`);
    await vi.advanceTimersByTimeAsync(ms);
    return Promise.race([issue, Promise.resolve('en attente')]);
}

describe('#652 · A — criteresHorsGrille', () => {
    it('A.a rend le critère enregistré que la grille ne contient plus, tel quel', () => {
        const win = chargerChargement();
        expect(win.criteresHorsGrille(EVAL, GRILLE)).toEqual([EVAL.criteres[0]]);
    });

    it('A.b rien quand tous les critères enregistrés sont dans la grille', () => {
        const win = chargerChargement();
        expect(win.criteresHorsGrille({ grilleId: 'G1', criteres: EVAL.criteres.slice(1) }, GRILLE)).toEqual([]);
    });

    it('A.c rien quand l\'évaluation porte sur une AUTRE grille : changer de grille n\'emporte rien', () => {
        const win = chargerChargement();
        expect(win.criteresHorsGrille({ ...EVAL, grilleId: 'G2' }, GRILLE)).toEqual([]);
    });

    it('A.d entrées incomplètes et arguments absents : aucune erreur, rien de rendu', () => {
        const win = chargerChargement();
        expect(win.criteresHorsGrille({ grilleId: 'G1', criteres: [null, { critereNom: 'sans id' }] }, GRILLE)).toEqual([]);
        expect(win.criteresHorsGrille(null, GRILLE)).toEqual([]);
        expect(win.criteresHorsGrille(EVAL, null)).toEqual([]);
    });
});

describe('#652 · B — l\'attente ne dépend plus du premier critère', () => {
    it('B.a premier critère absent, le deuxième rendu → résolue sans attendre le délai', async () => {
        vi.useFakeTimers();
        try {
            // AVANT : rejet après 3 s — l'attente ne guettait que `eval_c0`.
            expect(await issueApres(monterOuverture(['eval_c1', 'eval_c2'], { cartes: true }), EVAL, 100)).toBe('résolue:true');
        } finally { vi.useRealTimers(); }
    });

    it('B.b aucun critère enregistré rendu, mais des cartes au délai → résolue (ouverture sur la grille actuelle)', async () => {
        vi.useFakeTimers();
        const silence = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const seulementHors = { grilleId: 'G1', criteres: [EVAL.criteres[0]] };
            const win = monterOuverture(['eval_c1'], { cartes: true });
            expect(await issueApres(win, seulementHors, 2900)).toBe('en attente');
            expect(await issueApres(monterOuverture(['eval_c1'], { cartes: true }), seulementHors, 3000)).toBe('résolue:true');
        } finally { silence.mockRestore(); vi.useRealTimers(); }
    });

    it('B.c sans carte au délai → rejetée, comme avant', async () => {
        vi.useFakeTimers();
        const silence = vi.spyOn(console, 'error').mockImplementation(() => {});
        try {
            expect(await issueApres(monterOuverture([], { cartes: false }), EVAL, 3000)).toBe('rejetée:Timeout : les critères de la grille ne sont pas rendus');
        } finally { silence.mockRestore(); vi.useRealTimers(); }
    });
});

describe('#652 · C — témoins de source', () => {
    it('C.a les deux réécritures d\'une évaluation existante ajoutent les critères hors grille', () => {
        expect(source('js/evaluation-chargement.js'))
            .toContain('_majEvaluationExistanteAutoSave(evaluations[idx], ec, criteres.concat(criteresHorsGrille(evaluations[idx], grille)));');
        expect(source('js/evaluation.js'))
            .toContain('criteres: criteres.concat(window.criteresHorsGrille(evaluations[indexEval], grille)),');
    });

    it('C.b les deux renderers signalent, juste après avoir écrit la liste', () => {
        const src = source('js/evaluation-chargement.js');
        expect(src).toContain("document.getElementById('listeCriteresGrille1').innerHTML = html;\n    _signalerCriteresHorsGrille(document.getElementById('listeCriteresGrille1'), grille);");
        expect(src).toContain('conteneur.innerHTML = html;\n    _signalerCriteresHorsGrille(conteneur, grille);');
    });
});
