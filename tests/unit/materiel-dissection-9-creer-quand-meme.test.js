/**
 * « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 9 — créer la grille même s'il manque des points.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-18-dissection-9-creer-quand-meme.md ; cadrage :
 * CADRAGE-2026-10-18-creer-quand-meme.md (décision de Grégoire, 17 h 34).
 *
 * Ce que ce banc verrouille :
 *   L — la lecture : sans niveaux, la grille se lit en points dès qu'un critère a une pondération ; les points
 *       ou pondérations manquants ne bloquent plus (dits à part, `aCompleter`), en points comme en niveaux ;
 *       la logique nulle et un morceau sans place bloquent toujours, comme des points hors de 0 à 100.
 *   A — l'absence écrite : `null`, la même en IndexedDB (clone structuré) et en localStorage (JSON) ; un 0
 *       reste 0 ; la confirmation compte les critères à compléter et n'additionne jamais `null`.
 *   R — la règle de l'absence (`ponderationAbsente`) : null, champ manquant, '', NaN, texte ; jamais 0.
 *
 * Break-tests (faits le 18 oct.) : `estACompleter` rendant toujours faux (la raison des points redevenue
 * bloquante) → L.a, L.b, L.e et L.f rouges ; la création écrivant NaN au lieu de `null` → A.a et A.b rouges.
 * Le break-test de `calculerPortee` (l'absence traitée comme 0) n'est pas fait : le point 4 de la consigne est
 * suspendu par la mesure du stock (voir la demande de relecture).
 *
 * Grilles FICTIVES (tests/unit/_helpers/grilles-fictives-dissection.js), jamais le texte d'une grille réelle.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import {
    GRILLE_D7, GRILLE_N, NOM_D7, enHtml, etiquettes, liensPar, decouperD
} from './_helpers/grilles-fictives-dissection.js';

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

let D;
let A;
let calcul;
beforeAll(() => {
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    D = w.materielDissectionLecture;
    A = w.materielAssistant;
    calcul = chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau: () => undefined }, { addEventListener() {}, removeEventListener() {} });
});

let compteur = 0;
const ctx = () => ({ id: (pre) => pre + (++compteur), maintenant: '2026-10-18T12:00:00.000Z' });

const coller = (grille) => {
    const doc = D.docDepuisPressePapiers({ html: enHtml(grille), texte: '' });
    return { doc, liens: liensPar(D.morceaux(doc).ordre, etiquettes(grille)) };
};
const lire = (e) => D.comprendre(e.doc, e.liens);

/** (d7) coupée, SANS rattachement : les deux fins du nom restent deux critères sans pondération. */
const d7SansLien = () => decouperD(D, coller(GRILLE_D7));

describe('L — la lecture : ce qui manque de points ne bloque plus', () => {
    it('L.a — (d7) sans rattachement : créable, les deux critères sans points nommés à part, pas dans les raisons', () => {
        const R = lire(d7SansLien());
        expect(R.criteres.map((c) => c.nom).slice(-3)).toEqual(NOM_D7);
        expect(D.bilan(R).logique).toBe('points');
        const c = D.creation(R, {});
        expect(c.raisons).toEqual([]);
        expect(c.aCompleter).toEqual(['les points de 2 critères (« (exemples, contrastes, » et « renvois) »)']);
    });

    it('L.b — un seul critère pondéré suffit : la grille se lit en points', () => {
        const grille = [[{ l: [['Titre fictif', 'titre']] }], [{ l: [['Critère A fictif', 'critere'], ['/ 10', 'ponderation']] }], [{ l: [['Critère B fictif', 'critere']] }]];
        const R = lire(coller(grille));
        expect(D.bilan(R).logique).toBe('points');
        const c = D.creation(R, {});
        expect(c.raisons).toEqual([]);
        expect(c.aCompleter).toEqual(['les points d’un critère (« Critère B fictif »)']);
    });

    it('L.c — logique nulle (ni points, ni pondération, ni niveaux) : bloque toujours', () => {
        const grille = [[{ l: [['Titre fictif', 'titre']] }], [{ l: [['Critère A fictif', 'critere']] }], [{ l: [['Critère B fictif', 'critere']] }]];
        const R = lire(coller(grille));
        expect(D.bilan(R).logique).toBeNull();
        const c = D.creation(R, {});
        expect(c.raisons.some((r) => r.startsWith('des points ou des niveaux'))).toBe(true);
    });

    it('L.d — un morceau étiqueté sans place : bloque toujours', () => {
        const grille = [[{ l: [['Titre fictif', 'titre']] }], [{ l: [['/ 5', 'ponderation']] }], [{ l: [['Critère A fictif', 'critere'], ['/ 10', 'ponderation']] }]];
        const c = D.creation(lire(coller(grille)), {});
        expect(c.raisons).toContain('une place pour le morceau étiqueté listé plus bas');
    });

    it('L.e — des points hors de 0 à 100 : bloquent toujours (un objet faux)', () => {
        const grille = [[{ l: [['Titre fictif', 'titre']] }], [{ l: [['Critère A fictif', 'critere'], ['/ 150', 'ponderation']] }], [{ l: [['Critère B fictif', 'critere']] }]];
        const c = D.creation(lire(coller(grille)), {});
        expect(c.raisons).toEqual(['des points en nombre entier de 0 à 100 pour un critère']);
        expect(c.aCompleter).toEqual(['les points d’un critère (« Critère B fictif »)']);
    });

    it('L.f — en niveaux, une pondération manquante ne bloque plus non plus', () => {
        const e = coller(GRILLE_N);
        const idPond = Object.keys(e.liens).find((id) => e.liens[id] === 'ponderation');
        delete e.liens[idPond];   // le premier critère perd « (40 %) »
        const R = lire(e);
        const valeurs = {};
        D.clesNiveaux(R).forEach((k, i) => { valeurs[k] = [{ min: '0', max: '59', note: '50' }, { min: '60', max: '79', note: '70' }, { min: '80', max: '100', note: '90' }][i]; });
        const c = D.creation(R, {}, undefined, { valeurs });
        expect(c.enNiveaux).toBe(true);
        expect(c.raisons).toEqual([]);
        expect(c.aCompleter).toEqual(['la pondération d’un critère (« Le travail fictif répond à l’attente 1 »)']);
    });
});

describe('A — l’absence écrite, franche et uniforme', () => {
    it('A.a — les deux critères sans points s’écrivent `null` ; les autres gardent leurs points', () => {
        const c = D.creation(lire(d7SansLien()), {});
        const g = A.construire(c.modele, ctx()).grille;
        expect(g.criteres.map((x) => x.ponderation)).toEqual([10, 20, 15, 25, 10, 20, 24, null, null]);
    });

    it('A.b — la même valeur en IndexedDB (clone structuré) et en localStorage (JSON)', () => {
        const g = A.construire(D.creation(lire(d7SansLien()), {}).modele, ctx()).grille;
        expect(structuredClone(g).criteres.map((x) => x.ponderation)).toEqual(JSON.parse(JSON.stringify(g)).criteres.map((x) => x.ponderation));
        expect(g.criteres.some((x) => Number.isNaN(x.ponderation))).toBe(false);
    });

    it('A.c — un 0 écrit reste 0 (un choix, pas une absence)', () => {
        const grille = [[{ l: [['Titre fictif', 'titre']] }], [{ l: [['Critère A fictif', 'critere'], ['/ 0', 'ponderation']] }], [{ l: [['Critère B fictif', 'critere'], ['/ 10', 'ponderation']] }]];
        const g = A.construire(D.creation(lire(coller(grille)), {}).modele, ctx()).grille;
        expect(g.criteres.map((x) => x.ponderation)).toEqual([0, 10]);
    });
});

describe('R — la règle de l’absence (`ponderationAbsente`)', () => {
    it('R.a — absente : null, champ manquant, chaîne vide, NaN, texte ; présente : 0, « 0 », 12, « 12 »', () => {
        const absente = calcul.ponderationAbsente;
        [{ ponderation: null }, {}, { ponderation: '' }, { ponderation: '  ' }, { ponderation: NaN }, { ponderation: 'abc' }, null]
            .forEach((c) => expect(absente(c)).toBe(true));
        [{ ponderation: 0 }, { ponderation: '0' }, { ponderation: 12 }, { ponderation: '12' }]
            .forEach((c) => expect(absente(c)).toBe(false));
    });
});
