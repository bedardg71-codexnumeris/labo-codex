/**
 * « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 12 — rattacher sans que l'ordre des touchers compte.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-19-dissection-12-rattacher-sans-ordre.md (points 1, 3, 4 et 7).
 * Symptôme vécu par Grégoire le 19 oct. (7 h 54, 1.207.0) : touchés dans l'ordre naturel (le début, puis la
 * fin), les morceaux se rattachaient à l'envers, et un troisième ne se chaînait pas.
 *
 * Ce que ce banc verrouille :
 *   O — l'ordre des touchers indifférent : A puis B, B puis A, même groupe et même lecture ; trois morceaux
 *       dans les six ordres → le même nom, dans l'ordre du document ; la tête est le premier membre.
 *   G — la fusion de deux groupes ; deux membres d'un même groupe : rien ne change.
 *   X — détacher un membre, puis la tête (le suivant devient la tête et garde l'étiquette ; un groupe d'un
 *       seul morceau cesse d'exister).
 *   E — l'étiquette du groupe : celle de la tête ; sans elle, celle du premier membre étiqueté, reportée.
 *   D — (d7) jointe dans l'ordre de la capture : le critère créé porte le nom entier.
 *
 * Break-tests (faits le 19 oct.) : la tête prise dans l'ordre des touchers (celle du second touché, comme au
 * lot 7) au lieu de l'ordre du document → O.a, O.b, E.b, D.a rouges ; le texte d'un groupe pris tête d'abord
 * (sans le tri par l'ordre du document, dans `morceauxLus`) → O.c rouge.
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
const ctx = () => ({ id: (pre) => pre + (++compteur), maintenant: '2026-10-19T12:00:00.000Z' });

const docTexte = (t) => ({ mode: 'texte', lines: t.map((x, i) => ({ id: 'm' + (i + 1), t: x })) });
const lus = (doc, rat) => { const M = D.morceauxLus(doc, rat); return M.ordre.map((id) => M.texte[id]); };
const idDe = (doc, t) => { const M = D.morceaux(doc); return M.ordre.find((id) => M.texte[id] === t); };
/** Une suite de jointures, chacune [premier touché, second touché]. */
const joindreTout = (doc, paires, liens = {}) => paires.reduce((e, [x, y]) => {
    const r = D.joindre(doc, e.rattachements, e.liens, x, y);
    expect(r.rien).toBeUndefined();
    return r;
}, { rattachements: {}, liens });

const NOM = ['Idées fictives', '(exemples, contrastes,', 'renvois)'];
const doc3 = () => docTexte([NOM[0], '/ 24', NOM[1], '[ ] case', NOM[2]]);

describe('O — l’ordre des touchers ne compte pas', () => {
    it('O.a — A puis B, B puis A : le même groupe, la tête est le premier dans le document', () => {
        const doc = doc3();
        const ab = joindreTout(doc, [['m1', 'm5']]);
        const ba = joindreTout(doc, [['m5', 'm1']]);
        expect(ab.rattachements).toEqual({ m5: 'm1' });
        expect(ba.rattachements).toEqual({ m5: 'm1' });
        expect(ba.tete).toBe('m1');
        expect(lus(doc, ba.rattachements)).toEqual(lus(doc, ab.rattachements));
        expect(lus(doc, ba.rattachements)[0]).toBe('Idées fictives renvois)');
    });

    it('O.b — trois morceaux, dans les six ordres : le même nom, dans l’ordre du document', () => {
        const doc = doc3();
        const ids = ['m1', 'm3', 'm5'];
        const ordres = [];
        ids.forEach((p) => ids.forEach((q) => ids.forEach((r) => { if (new Set([p, q, r]).size === 3) ordres.push([p, q, r]); })));
        expect(ordres).toHaveLength(6);
        const liens = { m1: 'critere', m2: 'ponderation', m3: 'critere', m5: 'critere' };
        ordres.forEach(([p, q, r]) => {
            // Le geste de la capture : p puis q, puis r puis l'un des deux autres (chacun essayé).
            [p, q].forEach((s) => {
                const e = joindreTout(doc, [[p, q], [r, s]], liens);
                expect(e.rattachements).toEqual({ m3: 'm1', m5: 'm1' });
                expect(lus(doc, e.rattachements)).toEqual(['Idées fictives (exemples, contrastes, renvois)', '/ 24', '[ ] case']);
                const R = D.comprendre(doc, e.liens, e.rattachements);
                expect(R.criteres.map((c) => [c.nom, c.pond])).toEqual([['Idées fictives (exemples, contrastes, renvois)', 24]]);
            });
        });
    });

    it('O.c — une tête forcée APRÈS un membre dans les données : le texte reste dans l’ordre du document, rien ne se perd', () => {
        const doc = doc3();
        expect(lus(doc, { m1: 'm5' })).toEqual(['/ 24', '(exemples, contrastes,', '[ ] case', 'Idées fictives renvois)']);
    });
});

describe('G — les groupes', () => {
    it('G.a — deux groupes se rejoignent ; la tête du premier dans le document reste tête', () => {
        const doc = docTexte(['a1', 'b1', 'c1', 'd1', 'e1']);
        let e = joindreTout(doc, [['m4', 'm3'], ['m2', 'm1']], { m1: 'critere', m3: 'critere' });
        expect(e.rattachements).toEqual({ m4: 'm3', m2: 'm1' });
        e = D.joindre(doc, e.rattachements, e.liens, 'm4', 'm2');
        expect(e.rattachements).toEqual({ m2: 'm1', m3: 'm1', m4: 'm1' });
        expect(lus(doc, e.rattachements)).toEqual(['a1 b1 c1 d1', 'e1']);
        expect(e.liens).toEqual({ m1: 'critere' });
        expect(e.retiree).toBe('critere');
    });

    it('G.b — deux membres d’un même groupe, ou deux fois le même : rien ne change', () => {
        const doc = doc3();
        const rat = { m3: 'm1', m5: 'm1' };
        expect(D.joindre(doc, rat, {}, 'm5', 'm3')).toEqual({ rien: true });
        expect(D.joindre(doc, rat, {}, 'm1', 'm5')).toEqual({ rien: true });
        expect(D.joindre(doc, {}, {}, 'm2', 'm2')).toEqual({ rien: true });
        expect(rat).toEqual({ m3: 'm1', m5: 'm1' });
    });

    it('G.c — estRattache et teteDuGroupe : la tête comme les membres', () => {
        const rat = { m3: 'm1' };
        expect([D.estRattache(rat, 'm1'), D.estRattache(rat, 'm3'), D.estRattache(rat, 'm2')]).toEqual([true, true, false]);
        expect([D.teteDuGroupe(rat, 'm1'), D.teteDuGroupe(rat, 'm3'), D.teteDuGroupe(rat, 'm2')]).toEqual(['m1', 'm1', null]);
    });
});

describe('X — détacher', () => {
    it('X.a — un membre, puis la tête : le suivant devient la tête et garde l’étiquette ; seul, il n’est plus un groupe', () => {
        const doc = doc3();
        const e = joindreTout(doc, [['m5', 'm1'], ['m3', 'm5']], { m1: 'critere' });
        expect(e.rattachements).toEqual({ m3: 'm1', m5: 'm1' });
        const x1 = D.detacher(doc, e.rattachements, e.liens, 'm3');
        expect(x1.rattachements).toEqual({ m5: 'm1' });
        expect(lus(doc, x1.rattachements)).toEqual(['Idées fictives renvois)', '/ 24', '(exemples, contrastes,', '[ ] case']);
        const x2 = D.detacher(doc, x1.rattachements, x1.liens, 'm1');
        expect(x2.rattachements).toEqual({});
        expect(x2.liens).toEqual({ m5: 'critere' });
        expect(lus(doc, x2.rattachements)).toEqual(D.morceaux(doc).ordre.map((id) => D.morceaux(doc).texte[id]));
        expect(e.rattachements).toEqual({ m3: 'm1', m5: 'm1' });
    });

    it('X.b — la tête d’un groupe de trois : les deux autres restent ensemble, sous le suivant', () => {
        const doc = doc3();
        const e = joindreTout(doc, [['m1', 'm3'], ['m5', 'm1']], { m1: 'critere' });
        const x = D.detacher(doc, e.rattachements, e.liens, 'm1');
        expect(x.rattachements).toEqual({ m5: 'm3' });
        expect(x.liens).toEqual({ m3: 'critere' });
        expect(lus(doc, x.rattachements)).toEqual(['Idées fictives', '/ 24', '(exemples, contrastes, renvois)', '[ ] case']);
    });
});

describe('E — l’étiquette du groupe', () => {
    it('E.a — la tête étiquetée garde la sienne ; celle de l’autre est retirée', () => {
        const r = D.joindre(doc3(), {}, { m1: 'critere', m5: 'descripteur' }, 'm5', 'm1');
        expect(r.liens).toEqual({ m1: 'critere' });
        expect(r.retiree).toBe('descripteur');
        expect(r.reportee).toBeNull();
    });

    it('E.b — la tête sans étiquette : celle du premier membre étiqueté lui est reportée, les autres retirées', () => {
        const doc = doc3();
        let e = joindreTout(doc, [['m3', 'm5']], { m3: 'critere', m5: 'descripteur' });
        expect(e.liens).toEqual({ m3: 'critere' });
        e = D.joindre(doc, e.rattachements, e.liens, 'm3', 'm1');
        expect(e.rattachements).toEqual({ m3: 'm1', m5: 'm1' });
        expect(e.liens).toEqual({ m1: 'critere' });
        expect(e.reportee).toBe('critere');
        expect(e.retiree).toBeNull();
    });

    it('E.c — aucune étiquette : aucune posée', () => {
        const r = D.joindre(doc3(), {}, {}, 'm1', 'm3');
        expect([r.liens, r.reportee, r.retiree]).toEqual([{}, null, null]);
    });
});

/** (d7) collée, étiquetée comme dans le fichier fictif, puis découpée. */
function collerD7() {
    const doc = D.docDepuisPressePapiers({ html: enHtml(GRILLE_D7), texte: '' });
    return decouperD(D, { doc, liens: liensPar(D.morceaux(doc).ordre, etiquettes(GRILLE_D7)), rattachements: {} });
}

describe('D — la grille fictive (d7)', () => {
    it('D.a — jointe dans l’ordre de la capture (le début, la fin ; le milieu, la fin) : le critère créé porte le nom entier', () => {
        const e = collerD7();
        const [debut, milieu, fin] = NOM_D7.map((t) => idDe(e.doc, t));
        const r = joindreTout(e.doc, [[debut, fin], [milieu, fin]], e.liens);
        expect(r.tete).toBe(debut);
        expect(r.rattachements).toEqual({ [milieu]: debut, [fin]: debut });
        const R = D.comprendre(e.doc, r.liens, r.rattachements);
        expect(R.sansPlace).toEqual([]);
        const c = D.creation(R, {});
        expect(c.raisons).toEqual([]);
        const o = A.construire(c.modele, ctx());
        const der = o.grille.criteres[6];
        expect(der.nom).toBe('Partie D : nuancer – ' + NOM_D7.join(' '));
        expect(der.ponderation).toBe(24);
        expect(der.sousCriteres.map((x) => x.nom)).toEqual(CASES_D7);
    });
});
