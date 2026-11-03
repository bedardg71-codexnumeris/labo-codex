/**
 * #1106 — « APPORTER MON MATÉRIEL » : DEUX LIGNES « TOTAL » NE CRÉENT PLUS DE FAUX ÉCART.
 *
 * `LIRE_CADRE.total` gardait le dernier total étiqueté : sur une grille à deux sous-totaux (« / 70 »,
 * puis « / 30 »), le constat disait « Somme des pondérations : 100 · ton total : 30 : écart ».
 * Plusieurs « Total » s'additionnent, sauf si le dernier vaut la somme des autres (total général).
 *
 * Grilles FICTIVES.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { liensPar } from './_helpers/grilles-fictives-dissection.js';

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

let D;
beforeAll(() => {
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    D = w.materielDissectionLecture;
});

function compriseTexte(lignes) {
    const doc = D.docDepuisPressePapiers({ texte: lignes.map((x) => x[0]).join('\n') });
    return D.comprendre(doc, liensPar(D.morceaux(doc).ordre, lignes.map((x) => x[1])));
}

const PARTIE_A = [['Grille fictive', 'titre'], ['Critère fictif 1', 'critere'], ['/ 40', 'ponderation'],
    ['Critère fictif 2', 'critere'], ['/ 30', 'ponderation']];
const PARTIE_B = [['Critère fictif 3', 'critere'], ['/ 30', 'ponderation']];

describe('#1106 · plusieurs « Total » dans la dissection', () => {

    it('deux sous-totaux (/ 70 puis / 30) : le total visé est 100, sans écart', () => {
        const R = compriseTexte([...PARTIE_A, ['Total : / 70', 'total'], ...PARTIE_B, ['Total : / 30', 'total']]);
        expect(R.totalNb).toBe(100);
        expect(D.bilan(R)).toMatchObject({ somme: 100, jusqua: 100, totalOk: true });
    });

    it('deux sous-totaux puis le total général (/ 100) : le total visé reste 100', () => {
        const R = compriseTexte([...PARTIE_A, ['Total : / 70', 'total'], ...PARTIE_B, ['Total : / 30', 'total'],
            ['Total général : / 100', 'total']]);
        expect(R.totalNb).toBe(100);
        expect(D.bilan(R).totalOk).toBe(true);
    });

    it('un total répété (trois « / 100 ») ou courant (/ 70 puis / 100) : 100, sans écart', () => {
        const T = ['Total : / 100', 'total'];
        const repete = compriseTexte([...PARTIE_A, T, ...PARTIE_B, T, T]);
        expect(D.bilan(repete)).toMatchObject({ total: 100, jusqua: 100, totalOk: true });
        const courant = compriseTexte([...PARTIE_A, ['Total : / 70', 'total'], ...PARTIE_B, T]);
        expect(D.bilan(courant)).toMatchObject({ total: 100, jusqua: 100, totalOk: true });
    });

    it('un seul « Total » : inchangé, et un vrai écart reste un écart', () => {
        const juste = compriseTexte([...PARTIE_A, ...PARTIE_B, ['Total : / 100', 'total']]);
        expect(D.bilan(juste)).toMatchObject({ jusqua: 100, totalOk: true });
        const faux = compriseTexte([...PARTIE_A, ...PARTIE_B, ['Total : / 90', 'total']]);
        expect(D.bilan(faux)).toMatchObject({ jusqua: 90, totalOk: false });
    });
});
