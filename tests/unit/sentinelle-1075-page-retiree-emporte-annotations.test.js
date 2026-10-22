/**
 * #1075, POINT 7 — UNE PAGE RETIRÉE EMPORTE SES ANNOTATIONS (22 oct. 2026).
 *
 * Constat (audit 5.79) : les annotations d'une copie sont rangées par rang de page (`pages[0]`,
 * `pages[1]`…). L'éditeur de pages retirait ou déplaçait des pages et réécrivait le fichier sans toucher
 * aux annotations : celles d'une page retirée glissaient sur la page suivante.
 *
 * Ce banc verrouille :
 *   A — `reindexerPagesAnnotation` (travaux-stockage.js RÉEL) : chaque page garde les siennes à son
 *       nouveau rang ; une page retirée perd les siennes ; une page venue d'ailleurs n'en reçoit aucune ;
 *   B — `reporterAnnotationsPages` réécrit les annotations du fichier, celles des autres fichiers restent,
 *       et un ordre inchangé n'écrit rien ;
 *   C — dans l'éditeur (travaux-ui.js RÉEL) : ouvrir une copie de trois pages, retirer la première,
 *       enregistrer → les annotations des pages 2 et 3 passent aux rangs 0 et 1, celles de la page 1 partent.
 *
 * Break-test (22 oct.) : `reporterAnnotationsPages` qui ne fait rien rougit B1 et C ; retirer l'appel
 * dans `sauvegarderEdition` rougit C.
 *
 * Données FICTIVES.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const page = (marque) => ({ strokes: [{ id: marque }], textAnnotations: [], shapes: [], stickers: [] });

function stockage(annotations) {
    const store = { test_annotationsTravaux: JSON.parse(JSON.stringify(annotations)) };
    const db = { getSync: (k, d) => (k in store ? store[k] : d), setSync: (k, v) => { store[k] = JSON.parse(JSON.stringify(v)); return true; } };
    const w = chargerScript('js/travaux-stockage.js', {
        db, cle: (k) => 'test_' + k, Image: function () {},
        document: { createElement: () => ({ getContext: () => null }) }, navigator: { storage: null }
    });
    return { S: w.travauxStockage, store };
}

const ANNOT = () => [
    { id: 'ANN_1', fichierId: 'F1', pages: { 0: page('p1'), 1: page('p2'), 2: page('p3') } },
    { id: 'ANN_2', fichierId: 'F2', pages: { 0: page('autre') } }
];

describe('#1075, point 7 — la règle de réindexation', () => {
    it('A — chaque page garde les siennes ; une page retirée perd les siennes ; une page d\'ailleurs n\'en a pas', () => {
        const { S } = stockage([]);
        const pages = ANNOT()[0].pages;
        expect(S.reindexerPagesAnnotation(pages, [1, 2])).toEqual({ 0: page('p2'), 1: page('p3') });
        expect(S.reindexerPagesAnnotation(pages, [2, 0, 1])).toEqual({ 0: page('p3'), 1: page('p1'), 2: page('p2') });
        expect(S.reindexerPagesAnnotation(pages, [0, null, 1])).toEqual({ 0: page('p1'), 2: page('p2') });
    });

    it('B1 — les annotations du fichier suivent ; celles d\'un autre fichier restent', () => {
        const { S, store } = stockage(ANNOT());
        expect(S.reporterAnnotationsPages('F1', [1, 2])).toBe(1);
        const [a1, a2] = store.test_annotationsTravaux;
        expect(a1.pages).toEqual({ 0: page('p2'), 1: page('p3') });
        expect(a2).toEqual(ANNOT()[1]);
    });

    it('B2 — un ordre inchangé n\'écrit rien', () => {
        const { S, store } = stockage(ANNOT());
        const avant = JSON.stringify(store.test_annotationsTravaux);
        expect(S.reporterAnnotationsPages('F1', [0, 1, 2])).toBe(0);
        expect(JSON.stringify(store.test_annotationsTravaux)).toBe(avant);
    });
});

describe('#1075, point 7 — dans l\'éditeur de pages', () => {
    it('C — retirer la première page puis enregistrer : les annotations suivent leur page', async () => {
        const { S, store } = stockage(ANNOT());
        const travauxStockage = Object.assign({}, S, {
            obtenirFichierParId: (id) => ({ id, typeMIME: 'application/pdf', etudiantDA: '', productionId: 'P1', nomFichier: 'copie.pdf' }),
            recupererBlob: async () => ({ size: 1 }),
            stockerBlob: async () => {}, genererMiniaturePDF: async () => ({ thumbnail: '' }),
            mettreAJourFichier: () => true, supprimerFichierTravail: async () => {}
        });
        const inerte = () => ({ innerHTML: '', textContent: '', style: {}, classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
            appendChild() {}, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], setAttribute() {}, focus() {} });
        const document = { getElementById: () => inerte(), querySelector: () => null, querySelectorAll: () => [], createElement: inerte, addEventListener() {}, body: inerte() };
        const win = chargerScript('js/travaux-ui.js', {
            document, travauxStockage,
            travauxImport: {
                trouverEtudiantParDA: () => null,
                decomposerPDF: async () => [1, 2, 3].map((n) => ({ pageNum: n, dataUrl: '', largeur: 1, hauteur: 1 })),
                reassemblerPages: async () => ({ size: 2 }),
                obtenirFileDAttente: () => [], initialiserDropZone() {}
            },
            Codex: { proposerAvantSuppression: async () => true },
            notifications: { succes() {}, erreur() {}, info() {} },
            obtenirDonneesSelonMode: () => [], echapperHtml: (s) => String(s), confirm: () => true, alert() {},
            setTimeout: () => 0, clearTimeout: () => {}, requestAnimationFrame: () => 0
        }, { addEventListener() {}, removeEventListener() {} });
        await win.travauxUI.ouvrirEditeurPages('F1');
        win.travauxUI.supprimerPageEditeur(0);
        await win.travauxUI.sauvegarderEdition();
        const [a1, a2] = store.test_annotationsTravaux;
        expect(a1.pages).toEqual({ 0: page('p2'), 1: page('p3') });
        expect(a2.pages).toEqual({ 0: page('autre') });
    });

    it('C bis — une page venue d\'ailleurs n\'a pas d\'origine dans ce fichier', () => {
        const win = chargerScript('js/travaux-ui.js', { travauxImport: {}, travauxStockage: {}, echapperHtml: (s) => String(s), setTimeout: () => 0, clearTimeout: () => {} },
            { addEventListener() {}, removeEventListener() {} });
        const pages = [{ origine: { fichierId: 'F1', page: 2 } }, { pageNum: 4 }, { origine: { fichierId: 'F9', page: 0 } }];
        expect(win.travauxUI.originesDesPages(pages, 'F1')).toEqual([2, null, null]);
    });
});
