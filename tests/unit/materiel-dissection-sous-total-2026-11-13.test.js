/**
 * LOT « ÉTIQUETTE SOUS-TOTAL » (13 nov. 2026) — « APPORTER MON MATÉRIEL », LA LECTURE.
 *
 * Retour terrain de Grégoire (13 nov. 2026, iPad) : une grille à quatre tableaux fermés chacun par un sous-total (/18,
 * /17,5, /17, /6), un grand total (/58,5) et une conversion. Avec « Total » posé partout, le constat disait « Somme des
 * pondérations : 18 · ton total : 197 : écart » : une seule étiquette ne dit pas lequel est un sous-total.
 *   · « Sous-total » ferme la TRANCHE des critères lus depuis le sous-total précédent (pas depuis la « Section ») ;
 *   · avec au moins un « Sous-total », « Total » ne s'additionne plus à eux ; sans « Total », la somme des sous-totaux ;
 *   · sans aucun « Sous-total », la règle #1106 se lit comme avant (source ET stock).
 * Break-tests : `plans de travail/RAPPORT-2026-11-13-etiquette-sous-total.md`. Grilles FICTIVES.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { enHtml, etiquettes, liensPar } from './_helpers/grilles-fictives-dissection.js';
import { grilleSousTotaux } from './_helpers/grille-fictive-sous-totaux.js';

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

let D;
beforeAll(() => {
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    D = w.materielDissectionLecture;
});

function comprise(grille) {
    const doc = D.docDepuisPressePapiers({ html: enHtml(grille), texte: '' });
    expect(doc.mode).toBe('table');
    return D.comprendre(doc, liensPar(D.morceaux(doc).ordre, etiquettes(grille)));
}
function compriseTexte(lignes) {
    const doc = D.docDepuisPressePapiers({ texte: lignes.map((x) => x[0]).join('\n') });
    return D.comprendre(doc, liensPar(D.morceaux(doc).ordre, lignes.map((x) => x[1])));
}
const tranches = (R) => R.sousTotaux.map((s) => [s.ecrit, s.somme, s.ok]);

describe('l’étiquette « Sous-total » dans la légende', () => {
    it('« Sous-total », juste avant « Total », dans « La grille »', () => {
        const k = D.TYPES.map((t) => t.k);
        expect(k.indexOf('soustotal')).toBe(k.indexOf('total') - 1);
        expect(D.TYPE.soustotal).toMatchObject({ nom: 'Sous-total', aide: 'Le total d’une partie de la grille', groupe: 'La grille' });
    });

    it('une étiquette de grille : posée à côté de codes, la liste de codes est refusée', () => {
        const R = compriseTexte([['A1', 'code'], ['/ 10', 'soustotal']]);
        expect(D.codesCompris(R).raisons.join(' ')).toContain('une liste de codes seule');
    });
});

describe('la lecture des tranches', () => {
    it('quatre tranches justes et le « Total » juste : 58,5, sans écart ; les sous-totaux ne s’additionnent pas au total', () => {
        const R = comprise(grilleSousTotaux());
        expect(tranches(R)).toEqual([[18, 18, true], [17.5, 17.5, true], [17, 17, true], [6, 6, true]]);
        expect(R.totaux).toEqual([58.5]);
        expect(D.bilan(R)).toMatchObject({ somme: 58.5, total: 58.5, jusqua: 58.5, totalOk: true });
        expect(R.sansPlace).toEqual([]);
    });

    it('la tranche part du sous-total précédent, pas de la section : la première section tient deux tranches', () => {
        const R = comprise(grilleSousTotaux());
        const plan = R.criteres.filter((c) => c.section && c.section.nom === 'PLAN FICTIF');
        expect(plan.map((c) => c.tranche)).toEqual([0, 0, 1, 1]);
        expect(R.criteres.map((c) => c.tranche)).toEqual([0, 0, 1, 1, 2, 2, 3]);
    });

    it('une tranche en écart : elle seule, avec ce que donnent ses critères ; le total reste juste', () => {
        const R = comprise(grilleSousTotaux({ premier: '20' }));
        expect(tranches(R)).toEqual([[20, 18, false], [17.5, 17.5, true], [17, 17, true], [6, 6, true]]);
        expect(D.bilan(R)).toMatchObject({ total: 58.5, totalOk: true });
    });

    it('des sous-totaux sans « Total » : le total visé est leur somme', () => {
        const R = comprise(grilleSousTotaux({ total: false }));
        expect(R.totalNb).toBe(null);
        expect(D.bilan(R)).toMatchObject({ somme: 58.5, total: 58.5, jusqua: 58.5, totalOk: true });
        const faux = comprise(grilleSousTotaux({ total: false, premier: '20' }));
        expect(D.bilan(faux)).toMatchObject({ somme: 58.5, total: 60.5, totalOk: false });
    });

    it('un sous-total sans nombre n’a pas de place ; des critères lus après le dernier sous-total n’ont pas de tranche', () => {
        const R = compriseTexte([['Critère fictif 1', 'critere'], ['/ 4', 'ponderation'], ['Sous-total', 'soustotal'],
            ['Sous-total : / 4', 'soustotal'], ['Critère fictif 2', 'critere'], ['/ 6', 'ponderation']]);
        expect(R.sansPlace.map((s) => [s.t, s.type, s.raison])).toEqual([['Sous-total', 'soustotal', 'aucun nombre']]);
        expect(tranches(R)).toEqual([[4, 4, true]]);
        // Relecture de la fusion (13 nov., soir) : un critère qui pèse hors de toute tranche, la somme des sous-totaux
        // n'est pas un total. Avant : « ton total : 4 : écart », sans qu'aucun total n'ait été étiqueté.
        expect(D.bilan(R)).toMatchObject({ somme: 10, total: null, jusqua: 10, totalOk: null });
    });

    it('des sous-totaux étiquetés un à un, sans « Total » : tant qu’un critère pesé reste hors tranche, aucun total visé, aucun écart', () => {
        const lignes = [['Critère fictif 1', 'critere'], ['/ 40', 'ponderation'], ['Sous-total : / 40', 'soustotal'],
            ['Critère fictif 2', 'critere'], ['/ 60', 'ponderation'], ['Sous-total : / 60', null]];
        const enCours = compriseTexte(lignes);
        expect(tranches(enCours)).toEqual([[40, 40, true]]);
        expect(D.bilan(enCours)).toMatchObject({ somme: 100, total: null, jusqua: 100, totalOk: null });
        // Le second sous-total étiqueté : tous les critères sont couverts, leur somme redevient le total visé.
        lignes[5][1] = 'soustotal';
        expect(D.bilan(compriseTexte(lignes))).toMatchObject({ somme: 100, total: 100, totalOk: true });
        // Un critère SANS poids hors tranche ne retire pas le total (rien à additionner).
        const sansPoids = compriseTexte([['Critère fictif 1', 'critere'], ['/ 40', 'ponderation'], ['Sous-total : / 40', 'soustotal'], ['Critère fictif 2', 'critere']]);
        expect(D.bilan(sansPoids)).toMatchObject({ somme: 40, total: 40, totalOk: true });
    });

    it('une tranche dont aucun critère n’a de poids ne se compare pas (`ok` : null)', () => {
        const R = compriseTexte([['Critère fictif 1', 'critere'], ['Sous-total : / 4', 'soustotal']]);
        expect(tranches(R)).toEqual([[4, 0, null]]);
    });

    it('en texte brut, un sous-total ferme le critère en cours : une pondération qui le suit n’est à personne', () => {
        const R = compriseTexte([['Critère fictif 1', 'critere'], ['Sous-total : / 4', 'soustotal'], ['/ 9', 'ponderation']]);
        expect(R.criteres[0].pond).toBe(null);
        expect(R.sansPlace.map((s) => [s.t, s.raison])).toEqual([['/ 9', 'aucun critère avant lui ; une ligne de total prend l’étiquette « Total »']]);
    });
});

describe('#1106 n’a pas bougé : plusieurs « Total », aucun « Sous-total »', () => {
    const A = [['Grille fictive', 'titre'], ['Critère fictif 1', 'critere'], ['/ 40', 'ponderation'], ['Critère fictif 2', 'critere'], ['/ 30', 'ponderation']];
    const B = [['Critère fictif 3', 'critere'], ['/ 30', 'ponderation']];

    it('deux sous-totaux étiquetés « Total » s’additionnent ; le dernier qui vaut la somme des autres est le total général', () => {
        const deux = compriseTexte([...A, ['Total : / 70', 'total'], ...B, ['Total : / 30', 'total']]);
        expect(deux.sousTotaux).toEqual([]);
        expect(D.bilan(deux)).toMatchObject({ somme: 100, total: 100, totalOk: true, sousTotaux: [] });
        const trois = compriseTexte([...A, ['Total : / 70', 'total'], ...B, ['Total : / 30', 'total'], ['Total général : / 100', 'total']]);
        expect(trois.totaux).toEqual([70, 30, 100]);
        expect(D.bilan(trois)).toMatchObject({ total: 100, totalOk: true });
    });

    it('le stock : la grille de Grégoire étiquetée « Total » partout se lit comme le 13 nov. (197, écart)', () => {
        const R = comprise(grilleSousTotaux({ sousTotal: 'total', conversion: 'total' }));
        expect(R.totaux).toEqual([18, 17.5, 17, 6, 58.5, 80]);
        expect(D.bilan(R)).toMatchObject({ total: 197, totalOk: false });
    });
});

describe('hors lot, état connu : la conversion étiquetée « Total » après un « Total »', () => {
    it('« Résultat sur 80 » en « Total » : l’écart revient (58,5 + 80), les tranches restent justes', () => {
        const R = comprise(grilleSousTotaux({ conversion: 'total' }));
        expect(tranches(R).every((t) => t[2] === true)).toBe(true);
        expect(D.bilan(R)).toMatchObject({ somme: 58.5, total: 138.5, totalOk: false });
    });
});
