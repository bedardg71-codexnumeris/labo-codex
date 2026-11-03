/**
 * #1129 — DANS LE PDF DE LA GRILLE, LA PREMIÈRE CASE A LA GRAISSE DE L'APERÇU : le nom du critère en
 * gras, ses éléments observables (et sa description, « Desc. critères ») maigres.
 *
 * jsPDF met toute une case en gras ou rien ; la colonne 0 porte `fontStyle: 'bold'`. Le correctif
 * vide la case avant le dessin d'autoTable et la dessine à la main (`willDrawCell` / `didDrawCell`).
 *
 * Ce banc rend un VRAI PDF (jsPDF 2.5.1 et autoTable 3.8.1 du dépôt, non compressé) et lit, pour
 * chaque texte posé, la police qui le pose. Grilles et textes FICTIFS.
 */
import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';

const require = createRequire(import.meta.url);
const { jsPDF } = require('../../libs/jspdf.umd.min.js');
require('../../libs/jspdf-autotable.min.js').applyPlugin(jsPDF);

function monter() {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const store = { 'trimestres': [{ id: 'a2026', nom: 'Automne 2026', actif: true }] };
    const docs = [];
    const win = chargerScript('js/export-pdf.js', {
        db: {
            get: async (k) => (k in store ? store[k] : null),
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            set: async () => {}, setSync: () => {}
        },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t == null ? '' : t),
        toggleDisplay: () => {}, alert: () => {},
        document: dom.window.document
    });
    win.jspdf = {
        jsPDF: function (opts) {
            const d = new jsPDF(Object.assign({}, opts, { compress: false }));
            d.save = () => {};
            docs.push(d);
            return d;
        }
    };
    return { win, docs };
}

/** Chaque texte posé dans le PDF, avec sa graisse : [{ texte, gras }]. */
function textesPoses(doc) {
    const idGras = doc.internal.getFont('helvetica', 'bold').id;
    const idMaigre = doc.internal.getFont('helvetica', 'normal').id;
    const sortie = doc.output();
    const poses = [];
    let police = null;
    const re = /\/(F\d+) [\d.]+ Tf|\(((?:\\.|[^\\)])*)\) Tj/g;
    let m;
    while ((m = re.exec(sortie)) !== null) {
        if (m[1]) police = m[1];
        else poses.push({ texte: m[2], gras: police === idGras, maigre: police === idMaigre });
    }
    return poses;
}

const tranche = (id, nom, min, max, texte) => ({ id, nom, pointsMin: min, pointsMax: max, texte });
const NOMS = ['Insuffisant', 'Partiel', 'Satisfaisant', 'Remarquable'];
function critere(n) {
    return {
        id: `CR_${n}`, nom: `Partie fictive ${n}`, type: 'analytique', ponderation: 5,
        description: `Description fictive ${n}`,
        sousCriteres: [{ id: `SC_${n}a`, code: '0', nom: `Observable ${n}a` }, { id: `SC_${n}b`, code: '1', nom: `Observable ${n}b` }],
        bareme: NOMS.map((nom, k) => tranche(`TR_${n}${k}`, nom, k + 1, k + 1, `Texte ${n}.${k}`))
    };
}
const ORIGINE = { id: 'GR_O', nom: 'Grille fictive', criteres: [critere(1), critere(2)] };
const OPTIONS = { cran: 'retroaction', taillePolice: 'petit' };

describe('#1129 · la première case du PDF de la grille : le nom en gras, le reste maigre', () => {

    it('le nom du critère est posé en gras, ses éléments observables en maigre', async () => {
        const { win, docs } = monter();
        await win.genererPDFCombine(ORIGINE, null, null, OPTIONS);
        const poses = textesPoses(docs[0]);

        for (const n of [1, 2]) {
            const nom = poses.filter(p => p.texte === `Partie fictive ${n}`);
            expect(nom.length, `le nom ${n} est posé une fois`).toBe(1);
            expect(nom[0].gras, `le nom ${n} en gras`).toBe(true);
            for (const o of [`${n}a`, `${n}b`]) {
                const obs = poses.filter(p => p.texte.includes(`Observable ${o}`));
                expect(obs.length, `l'observable ${o} est posé une fois`).toBe(1);
                expect(obs[0].maigre, `l'observable ${o} en maigre`).toBe(true);
            }
        }
    });

    it('« Desc. critères » coché : la description du critère est maigre elle aussi', async () => {
        const { win, docs } = monter();
        await win.genererPDFCombine(ORIGINE, null, null, Object.assign({}, OPTIONS, { inclureDescCriteres: true }));
        const poses = textesPoses(docs[0]);

        const desc = poses.filter(p => p.texte === 'Description fictive 1');
        expect(desc.length).toBe(1);
        expect(desc[0].maigre).toBe(true);
        expect(poses.find(p => p.texte === 'Partie fictive 1').gras).toBe(true);
    });

    it('un mot trop long pour la colonne, coupé en son milieu : l\'observable reste maigre', async () => {
        const { win, docs } = monter();
        const LONG = 'Anticonstitutionnellementfictifetencoreplusloinquelacolonne';
        const g = JSON.parse(JSON.stringify(ORIGINE));
        g.criteres[0].sousCriteres[0].nom = LONG;
        await win.genererPDFCombine(g, null, null, OPTIONS);
        const poses = textesPoses(docs[0]);
        const morceaux = poses.filter(p => LONG.includes(p.texte.replace(/^· /, '')) && p.texte.length > 3);
        expect(morceaux.length, 'le mot est coupé sur plusieurs lignes').toBeGreaterThan(1);
        expect(morceaux.every(p => p.maigre)).toBe(true);
    });

    it('le reste de la grille ne change pas : l\'en-tête « Critère » et le « Total » restent en gras', async () => {
        const { win, docs } = monter();
        await win.genererPDFCombine(ORIGINE, null, null, OPTIONS);
        const poses = textesPoses(docs[0]);
        expect(poses.filter(p => p.texte === 'Total').every(p => p.gras)).toBe(true);
        expect(poses.filter(p => p.texte === 'Total').length).toBe(1);
    });
});
