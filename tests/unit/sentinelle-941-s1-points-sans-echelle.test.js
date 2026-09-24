/**
 * Sentinelle — #941 LOT S1 (24 septembre 2026) : UNE GRILLE EN POINTS SE NOTE SANS ÉCHELLE, ET
 * L'ÉLÈVE LIT SA NOTE (décisions D1 et D4 de Grégoire, `plans de travail/DECISIONS-2026-09-24-
 * parcours-sommatif.md` ; décision A du même jour : copies déjà enregistrées comprises, règle
 * d'affichage, rien n'est réécrit).
 *
 *   S.a `grilleEntierementEnPoints` : la règle du badge « ANALY », une grille mixte n'en est pas une ;
 *   S.b `evaluationEnPoints` : lue dans l'évaluation seule (chaque critère porte ses `points`) ;
 *   S.c `niveauFinalAffichable` : rien pour une copie en points, même avec « I » en base ; rien pour « -- » ;
 *   S.d témoins de source : le calcul ne sort plus à « -- » sous une grille en points, les collecteurs
 *       font entrer un critère par ses points, le PDF écrit « Note de la copie : ».
 *
 * La preuve de bout en bout est le banc WebKit du parcours :
 * `tests/integration/audit-parcours-sommatif-2026-09-24.spec.js`.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

let G;
beforeAll(() => {
    const store = {};
    G = chargerScript('js/gabarits-utils.js', {
        db: { getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)), setSync: (c, v) => { store[c] = v; },
              get: async (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)), set: async (c, v) => { store[c] = v; } },
        cle: (k) => 'a2026_' + k, echapperHtml: (t) => String(t == null ? '' : t),
        estRessourceSupprimee: () => false, marquerRessourceSupprimee: () => {}
    }).GabaritsUtils;
});

const grille = (...types) => ({ id: 'G', nom: 'G', criteres: types.map((t, i) => ({ id: 'C' + i, nom: 'c' + i, type: t, ponderation: 50 })) });
const critere = (id, extra) => Object.assign({ critereId: id, critereNom: id, niveauSelectionne: '', ponderation: 50 }, extra);

describe('#941 S1 · S.a — une grille entièrement en points', () => {
    it('tous analytiques : oui', () => {
        expect(G.grilleEntierementEnPoints(grille('analytique', 'analytique'))).toBe(true);
    });
    it('une grille mixte ne change pas', () => {
        expect(G.grilleEntierementEnPoints(grille('analytique', 'holistique'))).toBe(false);
        expect(G.grilleEntierementEnPoints(grille('analytique', 'algorithmique'))).toBe(false);
    });
    it('holistique, vide ou absente : non', () => {
        expect(G.grilleEntierementEnPoints(grille('holistique'))).toBe(false);
        expect(G.grilleEntierementEnPoints(grille())).toBe(false);
        expect(G.grilleEntierementEnPoints(null)).toBe(false);
    });
});

describe('#941 S1 · S.b — une évaluation en points, lue dans l\'évaluation seule', () => {
    it('chaque critère porte ses points : oui, avec ou sans niveau déduit', () => {
        expect(G.evaluationEnPoints({ criteres: [critere('a', { points: 30 }), critere('b', { points: 0 })] })).toBe(true);
        expect(G.evaluationEnPoints({ criteres: [critere('a', { points: 30, niveauSelectionne: 'M' })] })).toBe(true);
    });
    it('un critère sans points (holistique) : non', () => {
        expect(G.evaluationEnPoints({ criteres: [critere('a', { points: 30 }), critere('b', { niveauSelectionne: 'D' })] })).toBe(false);
        expect(G.evaluationEnPoints({ criteres: [critere('a', { niveauSelectionne: 'D' })] })).toBe(false);
    });
    it('sans critères enregistrés, les points saisis décident', () => {
        expect(G.evaluationEnPoints({ criteres: [], pointsAnalytiques: { a: 12 } })).toBe(true);
        expect(G.evaluationEnPoints({ criteres: [], pointsAnalytiques: {} })).toBe(false);
        expect(G.evaluationEnPoints(null)).toBe(false);
    });
});

describe('#941 S1 · S.c — le niveau qu\'un écran peut montrer', () => {
    it('une copie en points enregistrée avec l\'échelle de départ (« I » en base) : rien — et la donnée reste', () => {
        const stock = { niveauFinal: 'I', echelleId: 'ECHELLE_IDME_DEPART', criteres: [critere('a', { points: 30, niveauSelectionne: 'M' })] };
        expect(G.niveauFinalAffichable(stock)).toBe('');
        expect(stock.niveauFinal).toBe('I');
    });
    it('« -- » n\'est pas un niveau', () => {
        expect(G.niveauFinalAffichable({ niveauFinal: '--', criteres: [critere('a', { niveauSelectionne: 'D' })] })).toBe('');
    });
    it('une copie à niveaux garde le sien (Standards : rien ne change)', () => {
        expect(G.niveauFinalAffichable({ niveauFinal: 'M', criteres: [critere('a', { niveauSelectionne: 'M' })] })).toBe('M');
    });
});

describe('#941 S1 · S.d — témoins de source', () => {
    it('le calcul ne sort à « -- » faute d\'échelle QUE hors d\'une grille en points', () => {
        const src = source('js/evaluation-calcul.js');
        expect(src).toContain('if (!echelleResolue && !enPoints) {');
        expect(src).toContain("const niveaux = echelleResolue ? echelleSelectionnee.niveaux : [];");
    });
    it('les quatre collecteurs font entrer un critère par ses points', () => {
        for (const f of ['js/evaluation-sauvegarde.js', 'js/evaluation.js', 'js/evaluation-chargement.js']) {
            expect(source(f), f).toContain('if (niveau || aDesPoints) {');
        }
        expect(source('js/evaluation-retroaction.js')).toContain('if (niv || aDesPoints) {');
    });
    it('le PDF écrit « Note de la copie : » et la note cumulée d\'une sommative', () => {
        expect(source('js/synthese-retroaction-rendu.js')).toContain("'Note de la copie : '");
        expect(source('js/synthese-retroaction-data.js')).toContain('|| construireNoteSommative(da)');
    });
});
