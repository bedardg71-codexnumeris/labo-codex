import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Tests pour js/travaux-export-pdf.js — Ultrareview 2 (12 mai 2026).
//
// Couvre les 3 fixes du Commit 1 :
//   B — pdfDoc.destroy() dans exporterDepuisPDF + rendrePDFAvecAnnotations
//   C — previsualiserPDF passe par fermerPreviewPDF() en re-ouverture
//   X — afficherRevisionExport echappe fichierId dans data-param (defense-in-depth)
//
// Approche : tests structurels sur le source du module. Le pipeline PDF
// exige pdfjsLib + jsPDF + DOM ; mocker tout l'environnement aurait plus
// de surface de bug que le code teste. La regression visee (un futur
// commit qui retire destroy() ou l'escape) est entierement detectable
// au niveau du source.

let source;
beforeAll(() => {
    source = readFileSync(path.join(racineProjet, 'js/travaux-export-pdf.js'), 'utf8');
});

function corpsFonction(nom) {
    // Extrait le corps d'une fonction (sync ou async) jusqu'a la prochaine
    // declaration de fonction au meme niveau d'indentation. Suffisant pour
    // verifier la presence d'un pattern dans le corps.
    const re = new RegExp(
        `(?:async\\s+)?function\\s+${nom}\\s*\\([^)]*\\)\\s*\\{`,
        'm'
    );
    const m = source.match(re);
    if (!m) return null;
    const debut = m.index + m[0].length;
    // Parcours pour trouver l'accolade fermante equilibree
    let depth = 1;
    let i = debut;
    while (i < source.length && depth > 0) {
        const c = source[i];
        if (c === '{') depth++;
        else if (c === '}') depth--;
        i++;
    }
    return source.slice(debut, i - 1);
}

describe('travaux-export-pdf.js — Fix B · pdfDoc.destroy() (memory leak worker PDF.js)', () => {

    it('exporterDepuisPDF appelle pdfDoc.destroy() dans un bloc finally', () => {
        const corps = corpsFonction('exporterDepuisPDF');
        expect(corps, 'fonction exporterDepuisPDF introuvable').not.toBeNull();
        // Doit contenir un try ... finally avec destroy()
        expect(corps).toMatch(/finally\s*\{[^}]*pdfDoc\.destroy\s*\(\s*\)/s);
    });

    it('rendrePDFAvecAnnotations appelle pdfDoc.destroy() dans un bloc finally', () => {
        const corps = corpsFonction('rendrePDFAvecAnnotations');
        expect(corps, 'fonction rendrePDFAvecAnnotations introuvable').not.toBeNull();
        expect(corps).toMatch(/finally\s*\{[^}]*pdfDoc\.destroy\s*\(\s*\)/s);
    });

});

describe('travaux-export-pdf.js — Fix C · previsualiserPDF cleanup en re-ouverture', () => {

    it('previsualiserPDF passe par fermerPreviewPDF() quand un overlay existe deja', () => {
        const corps = corpsFonction('previsualiserPDF');
        expect(corps, 'fonction previsualiserPDF introuvable').not.toBeNull();
        // L'ancien code faisait `if (overlay) overlay.remove();` ce qui laissait
        // fuir le keydown listener et le worker PDF.js precedent.
        expect(corps).toMatch(/if\s*\(\s*overlay\s*\)\s*fermerPreviewPDF\s*\(\s*\)/);
        // Sentinelle anti-regression : pas de `overlay.remove()` nu au debut
        // (le `overlay.remove()` qui reste dans la fonction est celui de
        // fermerPreviewPDF lui-meme, hors de cette fonction).
        const debutCorps = corps.slice(0, 400);
        expect(debutCorps).not.toMatch(/if\s*\(\s*overlay\s*\)\s*overlay\.remove\s*\(/);
    });

});

describe('travaux-export-pdf.js — Fix X · afficherRevisionExport echappe fichierId (defense-in-depth)', () => {

    it('le bouton "Exporter le PDF" passe fichierId par echapperHtml dans data-param', () => {
        const corps = corpsFonction('afficherRevisionExport');
        expect(corps, 'fonction afficherRevisionExport introuvable').not.toBeNull();
        // Le data-param du bouton _travauxRevisionExporter doit etre echappe.
        // fichierId est genere par genererIdUnique('FT_') donc ASCII pur en
        // pratique, mais on respecte le pattern uniforme des autres
        // interpolations de cette modale (toutes echappees).
        expect(corps).toMatch(
            /data-action="_travauxRevisionExporter"\s+data-param="\$\{echapperHtml\(\s*fichierId\s*\)\}"/
        );
    });

});
