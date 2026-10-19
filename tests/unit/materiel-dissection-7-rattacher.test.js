/**
 * « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 7 — « Rattacher » un morceau à celui dont il est la suite.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-18-dissection-7-rattacher.md (« Ce qu'il faut », points 1, 2, 5, 6, 7).
 *
 * Ce que ce banc verrouille :
 *   L — le lien : A suivi de ses B, dans l'ordre de LECTURE du document (pas celui des gestes) ; chaque B
 *       sort de l'ordre de lecture et ne compte plus à part ; l'étiquette de A vaut pour le texte entier ;
 *       l'étiquette de B retirée au lien, et sans effet ensuite ; le document jamais touché.
 *   F — un lien en boucle forcé dans les données, ou un bout absent, ne perd aucun texte. (Les trois refus
 *       du lot 7 — soi, déjà la suite, boucle — sont tombés au lot 12 : l'ordre des touchers ne compte plus,
 *       voir materiel-dissection-12-rattacher-sans-ordre.test.js.)
 *   X — défaire : le morceau rendu tel quel, la lecture comme avant le lien.
 *   K — avec les coupes : la première partie prend la place du morceau coupé dans ses liens ; annuler une
 *       coupe défait d'abord les liens qui touchent ses parties ; l'aller-retour ne perd rien.
 *   D — la grille fictive (d7) : telle qu'étiquetée, les fins du nom sont des critères à part ; coupée,
 *       rattachée, étiquetée, le critère se crée sous son nom entier.
 *
 * Break-tests (faits le 18 oct.) : les suites rangées dans l'ordre des gestes (`morceauxLus` parcourant les
 * rattachements plutôt que le document) → L.b, L.e, K.d et D.b rouges ; B gardé dans l'ordre de lecture → L.a,
 * L.c, L.d, L.e et K.d rouges. Lot 12 (19 oct.) : `rattacher(rat, liens, B, A)` devient `joindre(doc, rat,
 * liens, x, y)`, sans refus ; les gestes de ce banc restent ceux du lot 7 (la suite d'abord), et leur
 * lecture ne change pas.
 *
 * Grilles FICTIVES (tests/unit/_helpers/grilles-fictives-dissection.js), jamais le texte d'une grille réelle.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import {
    GRILLE_D7, NOM_D7, CASES_D7, enHtml, etiquettes, liensPar, decouperD
} from './_helpers/grilles-fictives-dissection.js';

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

let D;
let A;
beforeAll(() => {
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    D = w.materielDissectionLecture;
    A = w.materielAssistant;
});

let compteur = 0;
const ctx = () => ({ id: (pre) => pre + (++compteur), maintenant: '2026-10-18T12:00:00.000Z' });

const docTexte = (t) => ({ mode: 'texte', lines: t.map((x, i) => ({ id: 'm' + (i + 1), t: x })) });
/** Les textes tels que la lecture les prend, dans son ordre. */
const lus = (doc, rat) => { const M = D.morceauxLus(doc, rat); return M.ordre.map((id) => M.texte[id]); };
const idDe = (doc, t) => { const M = D.morceaux(doc); return M.ordre.find((id) => M.texte[id] === t); };
const lier = (doc, rat, liens, b, a) => { const r = D.joindre(doc, rat, liens, b, a); expect(r.rien).toBeUndefined(); return r; };

describe('L — le lien', () => {
    it('L.a — A suivi de B, séparés par une espace ; B sort de l’ordre de lecture ; le document n’est pas touché', () => {
        const doc = docTexte(['Idées fictives', '/ 24', '(exemples,', 'renvois)']);
        const avant = JSON.stringify(doc);
        const r = lier(doc, {}, {}, 'm3', 'm1');
        expect(r.rattachements).toEqual({ m3: 'm1' });
        expect(lus(doc, r.rattachements)).toEqual(['Idées fictives (exemples,', '/ 24', 'renvois)']);
        expect(JSON.stringify(doc)).toBe(avant);
        expect(D.morceaux(doc).texte.m3).toBe('(exemples,');
    });

    it('L.b — l’ordre de LECTURE du document, pas celui des gestes', () => {
        const doc = docTexte(['Idées fictives', '[ ] case', '(exemples,', '[ ] case', 'renvois)']);
        // La fin d'abord, le milieu ensuite : la lecture garde l'ordre du document.
        let r = lier(doc, {}, {}, 'm5', 'm1');
        r = lier(doc, r.rattachements, r.liens, 'm3', 'm1');
        expect(D.morceauxLus(doc, r.rattachements).texte.m1).toBe('Idées fictives (exemples, renvois)');
        expect(D.morceauxLus(doc, r.rattachements).suites).toEqual({ m1: ['m3', 'm5'] });
    });

    it('L.c — B ne compte plus comme morceau à part : un seul critère, sous le nom entier ; l’étiquette de A vaut pour tout', () => {
        const doc = docTexte(['Idées fictives', '/ 24', '(exemples,', 'renvois)']);
        const liens = { m1: 'critere', m2: 'ponderation', m3: 'critere', m4: 'critere' };
        expect(D.comprendre(doc, liens).criteres.map((c) => c.nom)).toEqual(['Idées fictives', '(exemples,', 'renvois)']);
        let r = lier(doc, {}, liens, 'm3', 'm1');
        r = lier(doc, r.rattachements, r.liens, 'm4', 'm1');
        const R = D.comprendre(doc, r.liens, r.rattachements);
        expect(R.criteres.map((c) => [c.nom, c.pond])).toEqual([['Idées fictives (exemples, renvois)', 24]]);
        expect(R.nb).toEqual({ critere: 1, ponderation: 1 });
        // Un B sans étiquette ne compte pas non plus parmi les morceaux sans étiquette.
        const sans = D.comprendre(doc, { m1: 'critere' }, { m4: 'm1' });
        expect(sans.sansEtiquette).toBe(2);
    });

    it('L.d — l’étiquette de B est retirée au lien ; posée ensuite, elle ne change rien', () => {
        const doc = docTexte(['Idées fictives', '/ 24', '(exemples,']);
        const liens = { m1: 'critere', m3: 'critere' };
        const r = lier(doc, {}, liens, 'm3', 'm1');
        expect(r.retiree).toBe('critere');
        expect(r.liens).toEqual({ m1: 'critere' });
        expect(liens).toEqual({ m1: 'critere', m3: 'critere' });
        const R1 = D.comprendre(doc, r.liens, r.rattachements);
        const R2 = D.comprendre(doc, Object.assign({}, r.liens, { m3: 'descripteur' }), r.rattachements);
        expect(R2).toEqual(R1);
        expect(lier(doc, {}, { m1: 'critere' }, 'm3', 'm1').retiree).toBeNull();
    });

    it('L.e — B qui avait ses propres suites les passe à A : un seul niveau, tout dans l’ordre du document', () => {
        const doc = docTexte(['Idées fictives', '(exemples,', 'contrastes,', 'renvois)']);
        let r = lier(doc, {}, {}, 'm4', 'm2');
        r = lier(doc, r.rattachements, r.liens, 'm2', 'm1');
        expect(r.rattachements).toEqual({ m4: 'm1', m2: 'm1' });
        expect(lus(doc, r.rattachements)).toEqual(['Idées fictives (exemples, renvois)', 'contrastes,']);
    });
});

describe('F — des données abîmées : aucun texte perdu', () => {
    it('F.d — une boucle forcée dans les données, ou un bout absent du document : aucun texte perdu', () => {
        const doc = docTexte(['Idées fictives', '(exemples,', 'renvois)']);
        expect(lus(doc, { m1: 'm2', m2: 'm1' })).toEqual(['Idées fictives', '(exemples,', 'renvois)']);
        expect(lus(doc, { m3: 'm9', m9: 'm1' })).toEqual(['Idées fictives', '(exemples,', 'renvois)']);
        expect(lus(doc, { m3: 'm3' })).toEqual(['Idées fictives', '(exemples,', 'renvois)']);
    });
});

describe('X — défaire', () => {
    it('X.a — le lien défait, le morceau est rendu tel quel et la lecture redevient celle d’avant', () => {
        const doc = docTexte(['Idées fictives', '/ 24', '(exemples,']);
        const liens = { m1: 'critere', m2: 'ponderation' };
        const avant = D.comprendre(doc, liens);
        const r = lier(doc, {}, liens, 'm3', 'm1');
        const rat = D.detacher(doc, r.rattachements, r.liens, 'm3').rattachements;
        expect(rat).toEqual({});
        expect(r.rattachements).toEqual({ m3: 'm1' });
        expect(D.morceauxLus(doc, rat).texte).toEqual(D.morceaux(doc).texte);
        expect(D.comprendre(doc, r.liens, rat)).toEqual(avant);
    });
});

describe('K — avec les coupes', () => {
    it('K.a — la première partie prend la place du morceau coupé, comme A ou comme B', () => {
        expect(D.rattachementsApresCoupe({ m3: 'm1' }, 'm1', ['m8', 'm9'])).toEqual({ m3: 'm8' });
        expect(D.rattachementsApresCoupe({ m3: 'm1' }, 'm3', ['m8', 'm9'])).toEqual({ m8: 'm1' });
        expect(D.rattachementsApresCoupe({ m3: 'm1' }, 'm2', ['m8', 'm9'])).toEqual({ m3: 'm1' });
    });

    it('K.b — annuler une coupe défait d’abord les liens qui touchent ses deux parties, et eux seuls', () => {
        const rat = { m8: 'm1', m4: 'm9', m5: 'm2' };
        expect(D.rattachementsSansParties(rat, ['m8', 'm9'])).toEqual({ m5: 'm2' });
        expect(rat).toEqual({ m8: 'm1', m4: 'm9', m5: 'm2' });
    });

    it('K.c — l’aller-retour (couper, rattacher, annuler) rend le document et la lecture d’avant', () => {
        const doc0 = docTexte(['Idées fictives (exemples,', 'renvois)']);
        const liens0 = { m1: 'critere' };
        const avant = D.comprendre(doc0, liens0);
        const c = D.couper(doc0, 'm1', 14);
        const liens1 = D.liensApresCoupe(liens0, 'm1', c.parties);
        // La seconde partie et « renvois) » rattachées à la première : le nom se relit entier.
        let r = lier(c.doc, {}, liens1, c.parties[1], c.parties[0]);
        r = lier(c.doc, r.rattachements, r.liens, 'm2', c.parties[0]);
        expect(D.comprendre(c.doc, r.liens, r.rattachements).criteres.map((x) => x.nom)).toEqual(['Idées fictives (exemples, renvois)']);
        const rat = D.rattachementsSansParties(r.rattachements, c.parties);
        expect(rat).toEqual({});
        const back = D.recoller(r.liens, { doc: doc0, id: 'm1', type: 'critere', parties: c.parties });
        expect(back.doc).toEqual(doc0);
        expect(D.comprendre(back.doc, back.liens, rat)).toEqual(avant);
    });

    it('K.d — rien ne se perd : bout à bout, les textes lus sont ceux du document, avec ou sans liens', () => {
        const doc = docTexte(['a1 a2', 'b1', 'c1 c2', 'd1', 'e1']);
        const tout = (rat) => lus(doc, rat).join(' ').split(' ').sort();
        const r = [['m4', 'm1'], ['m2', 'm1'], ['m5', 'm3']].reduce((e, [b, a]) => lier(doc, e.rattachements, e.liens, b, a), { rattachements: {}, liens: {} });
        expect(tout(r.rattachements)).toEqual(tout({}));
        expect(lus(doc, r.rattachements)).toEqual(['a1 a2 b1 d1', 'c1 c2 e1']);
    });
});

/** (d7) collée, étiquetée comme dans le fichier fictif. */
function collerD7() {
    const doc = D.docDepuisPressePapiers({ html: enHtml(GRILLE_D7), texte: '' });
    return { doc, liens: liensPar(D.morceaux(doc).ordre, etiquettes(GRILLE_D7)), rattachements: {} };
}

describe('D — la grille fictive (d7)', () => {
    it('D.a — telle qu’étiquetée à la porte : les deux fins du nom deviennent des critères à part', () => {
        const e = collerD7();
        const R = D.comprendre(e.doc, e.liens, e.rattachements);
        expect(R.criteres.map((c) => c.nom).slice(-3)).toEqual(NOM_D7);
    });

    it('D.b — coupée, rattachée, étiquetée : le critère se crée sous son nom entier, sa pondération et ses cases lues', () => {
        const e = decouperD(D, collerD7());
        const idNom = idDe(e.doc, NOM_D7[0]);
        // Le geste de la porte : la fin d'abord, le milieu ensuite.
        let r = lier(e.doc, e.rattachements, e.liens, idDe(e.doc, NOM_D7[2]), idNom);
        expect(r.retiree).toBe('critere');
        r = lier(e.doc, r.rattachements, r.liens, idDe(e.doc, NOM_D7[1]), idNom);
        const R = D.comprendre(e.doc, r.liens, r.rattachements);
        expect(R.sansPlace).toEqual([]);
        expect(R.criteres).toHaveLength(7);
        const c = D.creation(R, {});
        expect(c.raisons).toEqual([]);
        const o = A.construire(c.modele, ctx());
        const der = o.grille.criteres[6];
        expect(der.nom).toBe('Partie D : nuancer – ' + NOM_D7.join(' '));
        expect(der.ponderation).toBe(24);
        expect(der.sousCriteres.map((x) => x.nom)).toEqual(CASES_D7);
        expect(o.grille.criteres.map((x) => x.ponderation)).toEqual([10, 20, 15, 25, 10, 20, 24]);
    });
});
