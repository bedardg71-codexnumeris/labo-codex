/**
 * #1107 — « APPORTER MON MATÉRIEL » : LES RAISONS D'UN REFUS NOMMENT LES CRITÈRES EN CAUSE.
 *
 * Dans la dissection, « des points en nombre entier de 0 à 100 pour # critères », « une pondération en
 * nombre entier… », « le nom de # critères » et « au plus 30 sous-critères par critère » comptaient
 * sans dire lesquels (`materielAssistant.calculs`, repris par `raisonDissection`). Le lot 5 nommait déjà
 * les noms trop longs, les points et les pondérations qui manquent ; ces quatre-là suivent la même forme.
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
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    D = w.materielDissectionLecture;
});

function raisons(lignes) {
    const doc = D.docDepuisPressePapiers({ texte: lignes.map((x) => x[0]).join('\n') });
    const R = D.comprendre(doc, liensPar(D.morceaux(doc).ordre, lignes.map((x) => x[1])));
    return D.creation(R, {}, undefined, {}).raisons;
}

describe('#1107 · les raisons nomment les critères en cause', () => {

    it('des points hors de 0 à 100 : le critère est nommé', () => {
        const r = raisons([['Grille fictive', 'titre'],
            ['Clarté fictive', 'critere'], ['/ 40', 'ponderation'], ['Tout juste', 'descripteur'],
            ['Rigueur fictive', 'critere'], ['/ 150', 'ponderation'], ['Tout juste', 'descripteur']]);
        expect(r).toEqual(['des points en nombre entier de 0 à 100 pour un critère (« Rigueur fictive »)']);
    });

    it('plusieurs critères en cause : tous nommés', () => {
        const r = raisons([['Grille fictive', 'titre'],
            ['Clarté fictive', 'critere'], ['/ 12,5', 'ponderation'], ['Tout juste', 'descripteur'],
            ['Rigueur fictive', 'critere'], ['/ 150', 'ponderation'], ['Tout juste', 'descripteur']]);
        expect(r).toEqual(['des points en nombre entier de 0 à 100 pour 2 critères (« Clarté fictive » et « Rigueur fictive »)']);
    });

    it('plus de 30 éléments observables : le critère est nommé', () => {
        const obs = Array.from({ length: 31 }, (_, i) => [`Observable fictif ${i + 1}`, 'souscritere']);
        const r = raisons([['Grille fictive', 'titre'],
            ['Clarté fictive', 'critere'], ['/ 40', 'ponderation'], ['Tout juste', 'descripteur'],
            ['Nuance fictive', 'critere'], ['/ 60', 'ponderation'], ...obs, ['Tout juste', 'descripteur']]);
        expect(r).toEqual(['au plus 30 éléments observables par critère (« Nuance fictive »)']);
    });
});
