import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { elementEchappant } from './_helpers/element-echappant.js';

// Sentinelle #514 (26 août 2026) — CE QUI DÉPASSE LE BAS DE LA FEUILLE N'EXISTE PAS.
//
// Constat B3 de l'audit du 25 août : `poserBlocsInfoPDF` ne consultait JAMAIS la
// hauteur de page — aucun `addPage`, aucun `getHeight`. Le tableau des critères,
// lui, pagine (autoTable s'en charge). D'où un document où la partie évaluation
// se poursuit proprement pendant que les consignes sont dessinées sous le bord du
// papier, et disparaissent à l'impression. Et l'aperçu affichait « le PDF le
// poursuivra sur une page de plus » : promesse tenue pour le tableau seulement.
//
// Le cas d'usage réel est précisément celui qui déborde — un « Détail de la
// tâche » en étapes numérotées, ce que Grégoire distribue.
//
// ⚠ CE BANC MESURE CE QUI EST DESSINÉ, pas ce qui est écrit dans le source. Un
// faux jsPDF note chaque `text()` avec la page et l'ordonnée qui avaient cours :
// une ligne posée sous la limite est une ligne perdue, et le test la voit.

/* ------------------------------------------------------------------ harnais */

const HAUTEUR_PAGE = 297;   // A4 portrait, mm
const LARGEUR_PAGE = 210;
const MARGE_BAS = 13;
const LIMITE = HAUTEUR_PAGE - MARGE_BAS;

/**
 * Un jsPDF de banc. `splitTextToSize` coupe à raison d'un fragment par tranche
 * de 40 caractères : déterministe, et suffisant pour fabriquer un débordement.
 */
function fauxDoc() {
    const journal = [];
    let page = 1;
    return {
        journal,
        get page() { return page; },
        internal: { pageSize: { getHeight: () => HAUTEUR_PAGE, getWidth: () => LARGEUR_PAGE } },
        addPage() { page += 1; journal.push({ type: 'addPage', page }); },
        setFillColor() {}, setTextColor() {}, setFont() {}, setFontSize() {},
        rect(x, y, l, h) { journal.push({ type: 'rect', page, x, y, l, h }); },
        splitTextToSize(texte, largeur) {
            const n = Math.max(1, Math.ceil(String(texte).length / 40));
            return Array.from({ length: n }, (_, i) => `${texte.slice(0, 12)}#${i}`);
        },
        text(contenu, x, y) {
            const lignes = Array.isArray(contenu) ? contenu : [contenu];
            lignes.forEach((ligne, i) => {
                // jsPDF empile un tableau de lignes à 5 mm d'intervalle : le banc
                // doit le refléter, sinon un bloc non paginé semblerait tenir.
                journal.push({ type: 'text', page, x, y: y + i * 5, texte: ligne });
            });
        }
    };
}

function charger() {
    return chargerScript('js/export-pdf.js', {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null),
              set: async () => {}, setSync: () => {} },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t == null ? '' : t),
        toggleDisplay: () => {}, alert: () => {},
        document: {
            getElementById: () => null, querySelector: () => null,
            querySelectorAll: () => [], addEventListener() {},
            createElement: (tag) => elementEchappant(tag)
        }
    });
}

const win = charger();

const bloc = (titre, longueurCaracteres) => ({
    titre: titre + ' :', texte: titre.toUpperCase() + '-' + 'x'.repeat(longueurCaracteres)
});

/** Toutes les lignes de texte posées SOUS la limite basse : autant de perdues. */
const lignesPerdues = (doc) =>
    doc.journal.filter(e => e.type === 'text' && e.y > LIMITE);

/* ------------------------------------------------- A — la disposition continue */

describe('#514 · A — en continu, les consignes longues changent de page', () => {

    it('A.a LE CAS QUI PORTE LE SENS : rien n\'est dessiné sous le bas de la feuille', () => {
        const doc = fauxDoc();
        // Un détail de tâche de ~200 lignes : plus de deux pages à lui seul.
        const modele = { disposition: 'continu', blocsInfo: [bloc('Détail de la tâche', 8000)] };

        win.poserBlocsInfoPDF(doc, modele, 40, 184, 1);

        expect(lignesPerdues(doc), 'lignes dessinées sous le bord du papier').toEqual([]);
        expect(doc.journal.some(e => e.type === 'addPage'), 'le document a bien changé de page').toBe(true);
    });

    it('A.b le contenu n\'est pas perdu au passage : toutes les lignes sont posées', () => {
        const doc = fauxDoc();
        const texte = bloc('Détail', 8000);
        const attendu = doc.splitTextToSize(texte.texte, 184).length;

        win.poserBlocsInfoPDF(doc, { disposition: 'continu', blocsInfo: [texte] }, 40, 184, 1);

        const posees = doc.journal.filter(e => e.type === 'text' && e.texte.includes('#'));
        expect(posees.length).toBe(attendu);
    });

    it('A.c un titre ne reste pas seul au bas d\'une page', () => {
        const doc = fauxDoc();
        // Le premier bloc s'arrête tout près de la limite ; le second commence.
        win.poserBlocsInfoPDF(doc, {
            disposition: 'continu',
            blocsInfo: [bloc('Objectif', 1800), bloc('Tâche', 200)]
        }, 40, 184, 1);

        const titres = doc.journal.filter(e => e.type === 'text' && /TÂCHE|Tâche/.test(e.texte));
        titres.forEach(t => expect(t.y, 'un titre posé sous la limite').toBeLessThanOrEqual(LIMITE));
    });

    it('A.d ce qui TIENT sur la feuille ne change pas de page pour autant', () => {
        const doc = fauxDoc();
        win.poserBlocsInfoPDF(doc, {
            disposition: 'continu', blocsInfo: [bloc('Objectif', 60), bloc('Tâche', 60)]
        }, 40, 184, 1);
        expect(doc.journal.some(e => e.type === 'addPage')).toBe(false);
    });
});

/* ------------------------------------------------- B — la disposition en deux colonnes */

describe('#514 · B — en deux colonnes, le flux se poursuit colonne par colonne', () => {

    it('B.a rien n\'est dessiné sous le bas de la feuille', () => {
        const doc = fauxDoc();
        win.poserBlocsInfoPDF(doc, {
            disposition: 'deux-colonnes',
            blocsInfo: [bloc('Objectif', 4000), bloc('Détail', 6000), bloc('Remise', 3000)]
        }, 40, 184, 1);

        expect(lignesPerdues(doc)).toEqual([]);
    });

    it('B.b LE PIÈGE DU FLUX : après un repli, le texte change bien de colonne', () => {
        const doc = fauxDoc();
        win.poserBlocsInfoPDF(doc, {
            disposition: 'deux-colonnes', blocsInfo: [bloc('Détail de la tâche', 9000)]
        }, 40, 184, 1);

        // Un bloc unique plus long qu'une colonne DOIT se poursuivre à droite.
        // Une abscisse lue une seule fois avant la pose l'aurait laissé à gauche,
        // à cheval sur la colonne voisine — et personne ne l'aurait vu dans le
        // source, seulement sur le papier.
        // ⚠ Seulement les lignes de CONTENU : le titre d'un bandeau est posé
        // CENTRÉ, à une abscisse qui lui est propre. Les compter rendait le
        // test complaisant — il restait vert avec une abscisse figée, le
        // défaut même qu'il doit attraper (vu au break-test du 26 août).
        const abscisses = new Set(doc.journal
            .filter(e => e.type === 'text' && e.texte.includes('#'))
            .map(e => e.x));
        expect(abscisses.size, 'le texte doit occuper les DEUX colonnes').toBeGreaterThan(1);
    });

    it('B.c ce qui tient sur la feuille garde la répartition équilibrée d\'origine', () => {
        const doc = fauxDoc();
        win.poserBlocsInfoPDF(doc, {
            disposition: 'deux-colonnes', blocsInfo: [bloc('Objectif', 60), bloc('Tâche', 60)]
        }, 40, 184, 1);

        expect(doc.journal.some(e => e.type === 'addPage')).toBe(false);
        // Les deux blocs repartent de la MÊME ordonnée : c'est la signature de
        // la répartition en colonnes équilibrées, pas d'un flux.
        const bandeaux = doc.journal.filter(e => e.type === 'rect');
        expect(bandeaux).toHaveLength(2);
        expect(bandeaux[0].y).toBe(bandeaux[1].y);
    });
});
