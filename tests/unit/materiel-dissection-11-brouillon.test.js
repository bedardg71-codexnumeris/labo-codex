/**
 * « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 11 — elle s'enregistre toute seule, à chaque geste.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-19-dissection-11-enregistrement.md (points 1, 2, 5 et 7).
 * Symptôme vécu par Grégoire le 19 oct. (7 h 37) : en reprenant sa dissection de la veille, tout était perdu.
 *
 * Ce que ce banc verrouille :
 *   A — l'aller-retour du brouillon (`brouillon` → stockage → `lireBrouillon`) : document disséqué, étiquettes,
 *       coupes et leur annulation, rattachements, saisie, IDENTIQUES ; la lecture de l'application aussi ; le
 *       brouillon ne partage aucune référence avec l'état (un geste après l'écriture ne le change pas).
 *   I — un brouillon illisible (format inconnu, champ abîmé) est ignoré : `null`, et rien n'y est touché.
 *   R — la clé : au registre des trimestres (donc `demo_` en démo), exclue de l'archive d'un groupe,
 *       à DATA-OWNERSHIP avec son propriétaire.
 *
 * Break-test (fait le 19 oct.) : `lireBrouillon` qui oublie les rattachements → A.a, A.b et A.c rouges.
 *
 * Grilles FICTIVES (tests/unit/_helpers/grilles-fictives-dissection.js), jamais le texte d'une grille réelle.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';
import {
    GRILLE_D7, NOM_D7, enHtml, etiquettes, liensPar, decouperD
} from './_helpers/grilles-fictives-dissection.js';

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;
const racine = resolve(__dirname, '..', '..');
const source = (f) => readFileSync(resolve(racine, f), 'utf8');

let D;
beforeAll(() => {
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    D = w.materielDissectionLecture;
});

const idDe = (doc, t) => { const M = D.morceaux(doc); return M.ordre.find((id) => M.texte[id] === t); };
/** Ce que le stockage rend : une copie structurée (IndexedDB) ou relue du JSON (localStorage). */
const stocker = (x) => structuredClone(x);

/** Une dissection de (d7) en cours : étiquetée, coupée (deux fois, pile gardée), rattachée, saisie. */
function dissectionEnCours() {
    const doc0 = D.docDepuisPressePapiers({ html: enHtml(GRILLE_D7), texte: '' });
    let e = decouperD(D, { doc: doc0, liens: liensPar(D.morceaux(doc0).ordre, etiquettes(GRILLE_D7)) });
    // Deux coupes de plus, empilées comme le fait l'écran (le document d'avant, l'étiquette d'origine).
    const coupes = [];
    [NOM_D7[1], NOM_D7[0]].forEach((t) => {
        const id = idDe(e.doc, t);
        const r = D.couper(e.doc, id, t.indexOf(' '));
        coupes.push({ doc: e.doc, id, type: e.liens[id] || null, parties: r.parties });
        e = { doc: r.doc, liens: D.liensApresCoupe(e.liens, id, r.parties) };
    });
    const debut = coupes[1].parties[0];
    const fin = idDe(e.doc, NOM_D7[2]);
    const r = D.joindre(e.doc, {}, e.liens, fin, debut);
    return {
        doc: e.doc, liens: r.liens, coupes, rattachements: r.rattachements,
        nomSaisi: 'Évaluation fictive reprise', compte: 'niveaux', valeurs: { 'Fictif\n1': { min: '60', max: '69', note: '65' } },
        // L'état d'écran, qui ne s'enregistre pas.
        actif: 'rattacher', choix: debut, erreur: 'une erreur affichée', enCours: false
    };
}

describe('A — l’aller-retour du brouillon', () => {
    it('A.a — document, étiquettes, coupes, rattachements et saisie : identiques après la reprise', () => {
        const e = dissectionEnCours();
        expect(Object.keys(e.rattachements)).toHaveLength(1);
        const b = stocker(D.brouillon(e));
        expect(b.format).toBe('dissection-1');
        expect(Object.keys(b).sort()).toEqual(['compte', 'coupes', 'doc', 'format', 'liens', 'nomSaisi', 'rattachements', 'valeurs']);
        const r = D.lireBrouillon(b);
        expect(r).toEqual({ doc: e.doc, liens: e.liens, coupes: e.coupes, rattachements: e.rattachements, nomSaisi: e.nomSaisi, compte: e.compte, valeurs: e.valeurs });
    });

    it('A.b — la lecture de l’application est la même, et « Annuler la dernière coupe » rend le document d’avant', () => {
        const e = dissectionEnCours();
        const r = D.lireBrouillon(stocker(D.brouillon(e)));
        expect(D.comprendre(r.doc, r.liens, r.rattachements)).toEqual(D.comprendre(e.doc, e.liens, e.rattachements));
        // Annuler, de la dernière coupe à la première, comme l'écran : liens des parties défaits, recoller.
        const annuler = (x) => {
            const c = x.coupes[x.coupes.length - 1];
            const rat = D.rattachementsSansParties(x.rattachements, c.parties);
            const back = D.recoller(x.liens, c);
            return { doc: back.doc, liens: back.liens, rattachements: rat, coupes: x.coupes.slice(0, -1) };
        };
        const a = annuler(annuler(r)), b = annuler(annuler(e));
        expect(a).toEqual(b);
        expect(D.morceaux(a.doc).ordre.map((id) => D.morceaux(a.doc).texte[id])).toContain(NOM_D7[1]);
    });

    it('A.c — le brouillon ne partage rien avec l’état : un geste après l’écriture ne le change pas', () => {
        const e = dissectionEnCours();
        const b = D.brouillon(e);
        const avant = JSON.stringify(b);
        e.liens[Object.keys(e.liens)[0]] = 'ignorer';
        e.rattachements.zz = 'm1';
        e.coupes.pop();
        e.valeurs['Fictif\n1'].note = '99';
        e.doc.rows[0][0].lines[0].t = 'changé';
        expect(JSON.stringify(b)).toBe(avant);
        const r = D.lireBrouillon(b);
        r.liens.autre = 'critere';
        expect(JSON.stringify(b)).toBe(avant);
        expect(Object.keys(D.lireBrouillon(b).rattachements)).toHaveLength(1);
    });

    it('A.d — un texte brut, sans coupe ni saisie : repris aussi', () => {
        const e = { doc: { mode: 'texte', lines: [{ id: 'm1', t: 'Critère fictif' }, { id: 'm2', t: '/ 10' }] }, liens: { m1: 'critere' }, coupes: [], rattachements: {}, nomSaisi: null, compte: 'points', valeurs: {} };
        expect(D.lireBrouillon(stocker(D.brouillon(e)))).toEqual({ doc: e.doc, liens: e.liens, coupes: [], rattachements: {}, nomSaisi: null, compte: 'points', valeurs: {} });
    });
});

describe('I — un brouillon illisible est ignoré, sans effacement', () => {
    it('I.a — format inconnu, champ manquant ou abîmé : null ; l’objet lu n’est pas touché', () => {
        const bon = D.brouillon(dissectionEnCours());
        const abimes = [
            null, 'texte', 42, [],
            { ...bon, format: 'dissection-2' },
            { ...bon, format: undefined },
            { ...bon, doc: null },
            { ...bon, doc: { mode: 'image', lines: [] } },
            { ...bon, doc: { mode: 'texte', lines: [{ id: 'm1', t: 3 }] } },
            { ...bon, doc: { mode: 'table', rows: [[{ cs: 0, lines: [] }]] } },
            { ...bon, liens: { m1: 7 } },
            { ...bon, rattachements: ['m1'] },
            { ...bon, coupes: [{ doc: bon.doc, id: 'm1', type: null, parties: ['m9'] }] },
            { ...bon, nomSaisi: 12 },
            { ...bon, compte: 'pourcentages' },
            { ...bon, valeurs: { niveau: '60' } }
        ];
        abimes.forEach((x) => {
            const avant = JSON.stringify(x);
            expect(D.lireBrouillon(x)).toBeNull();
            expect(JSON.stringify(x)).toBe(avant);
        });
    });
});

describe('R — la clé du brouillon', () => {
    it('R.a — au registre des trimestres, exclue de l’archive d’un groupe, à DATA-OWNERSHIP avec son propriétaire', () => {
        expect(tranche(source('js/trimestres.js'), 'const CLES_NAMESPACEES = [', '];')).toContain("'brouillonDissection'");
        expect(tranche(source('js/reserve.js'), 'var CLES_EXCLUES_ARCHIVE = [', '];')).toContain("'brouillonDissection'");
        expect(source('docs/DATA-OWNERSHIP.md')).toMatch(/\| `<trim>_brouillonDissection` \| NS .*\| `materiel-dissection\.js`/);
        // Un seul écrivain : celui de la dissection, par le témoin commun.
        expect(source('js/materiel-dissection.js')).toContain('window.sauvegarderDonneesSelonMode(CLE_BROUILLON, D().brouillon(etat)');
    });
});
