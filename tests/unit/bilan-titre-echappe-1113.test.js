import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racineProjet = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// #1113 — LE BILAN D'UNE ÉVALUATION ÉCHAPPE LE TITRE DE LA PRODUCTION (règle de sécurité 1).
// Deux concaténations de `js/evaluation-retroaction.js` posaient un titre nu dans `innerHTML` :
// la ligne « Progrès : … depuis ‹titre› » et la liste des jetons (« Reprise — ‹titre› »). Une
// production voyage (partage, import) : son titre peut venir d'un autre.

const PIEGE = '<img src=x onerror=alert(1)>';

function echapperHtml(texte) {
    if (texte == null) return '';
    return String(texte).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Les trois fonctions du bilan sont privées au script : on les prélève dans la source, telles
// quelles, de `_listeEchappeeBilan` jusqu'à `genererRetroactionBilan` (exclue), plus `_rangBilan`.
const source = readFileSync(path.join(racineProjet, 'js', 'evaluation-retroaction.js'), 'utf8');
function prelever(depuis, jusqua) {
    const i = source.indexOf(depuis);
    const j = source.indexOf(jusqua, i);
    if (i === -1 || j === -1) throw new Error('bornes introuvables : ' + depuis);
    return source.slice(i, j);
}
const bloc = prelever('function _listeEchappeeBilan', 'function genererRetroactionBilan')
    + prelever('function _rangBilan', '/**');

function monter(evaluations, productions) {
    // Le niveau actuel se lit dans l'écran (`#niveauProduction1`).
    const document = { getElementById: (id) => (id === 'niveauProduction1' ? { textContent: 'M' } : null) };
    return new Function('document', 'echapperHtml', 'echellesComparables', 'jetonsDeclares',
        'obtenirDonneesSelonMode', 'window',
        bloc + '\nreturn { _rendreJetonsBilan, _rendreRecurrentsBilan };')(
        document, echapperHtml, () => true, () => ({ actif: true, reprise: { nombre: 2 } }),
        (q) => (q === 'evaluationsSauvegardees' ? evaluations : q === 'productions' ? productions : []), {});
}

describe('#1113 — le titre d\'une production ressort en texte dans le bilan', () => {
    it('la liste des jetons échappe le titre', () => {
        const win = monter([{ etudiantDA: 'DA1', productionId: 'p1', jetonRepriseApplique: true }],
            [{ id: 'p1', titre: PIEGE }]);
        const html = win._rendreJetonsBilan('DA1');
        expect(html).toContain('Reprise — &lt;img');
        expect(html).not.toContain('<img');
    });

    it('la ligne « Progrès » échappe le titre de la production précédente', () => {
        const win = monter([], []);
        const niveaux = { I: { rang: 0 }, D: { rang: 1 }, M: { rang: 2 }, E: { rang: 3 } };
        const html = win._rendreRecurrentsBilan(
            { productionNom: PIEGE, niveauFinal: 'D', echelleId: 'E1' },
            [], (code) => niveaux[code] || null, 'E1', () => null, [], false);
        expect(html).toMatch(/Progrès : D → M depuis &lt;img/);
        expect(html).not.toContain('<img');
    });
});
