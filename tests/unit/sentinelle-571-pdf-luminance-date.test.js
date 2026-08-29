import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #571 (29 août 2026) — LE PDF DE RÉTROACTION RESTE LISIBLE SUR LES
// COULEURS DE L'ÉCHELLE, ET LA DATE EST ÉCHAPPÉE.
//
// Arbitrage de Grégoire (28 août) : les correctifs OUI (garde de luminance,
// date échappée), les tailles NON avant l'automne. Les couleurs des niveaux sont
// celles de SON échelle ; du blanc y était posé sans garde — sur un jaune, le
// code devenait illisible dans le document remis à l'élève.
//
//   A — `texteSur` : encre sur un fond clair, papier sur un fond sombre, papier
//       (comme avant) sur une couleur qu'on ne sait pas lire ;
//   B — le rendu applique la garde aux quatre sites (niveau général, trajectoire,
//       segments de critère, pastilles d'erreurs) ;
//   C — la date d'évaluation passe par esc() (le repli `return iso` rend la chaîne brute).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

function charger() {
    return chargerScript('js/synthese-retroaction-rendu.js', {
        echapperHtml: (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    });
}

describe('#571 · A — texteSur', () => {
    it('fond clair → encre ; fond sombre → papier ; illisible → papier', () => {
        const t = charger().syntheseRetroactionRendu._texteSur;
        expect(t('#ffc107')).toBe('#141414');   // jaune
        expect(t('#ffffff')).toBe('#141414');
        expect(t('#fd7e14')).toBe('#141414');   // orange clair
        expect(t('#dc3545')).toBe('#ffffff');   // rouge
        expect(t('#032e5c')).toBe('#ffffff');   // bleu foncé
        expect(t('#0a0')).toBe('#141414');      // 3 chiffres, vert vif
        expect(t('var(--bleu)')).toBe('#ffffff');
        expect(t('')).toBe('#ffffff');
        expect(t(null)).toBe('#ffffff');
    });
});

describe('#571 · B — le rendu applique la garde là où le fond vient de l\'échelle', () => {
    it('niveau général jaune → texte encre ; rouge → texte papier', () => {
        const win = charger();
        const base = {
            course: { code: '601-101' }, artefact: { title: 'Dissertation', corrected: '2026-03-10' },
            student: { firstName: 'A', lastName: 'B', da: '111' },
            scale: [{ code: 'J', label: 'Jaune', color: '#ffc107' }, { code: 'R', label: 'Rouge', color: '#dc3545' }],
            criteria: [], trajectory: [], errors: [], tokens: [], objectives: []
        };
        const jaune = win.syntheseRetroactionRendu.rendreSyntheseHTML(Object.assign({}, base, { overall: { code: 'J', label: 'Jaune', color: '#ffc107' } }));
        expect(jaune).toMatch(/background: #ffc107; color: #141414;/);
        const rouge = win.syntheseRetroactionRendu.rendreSyntheseHTML(Object.assign({}, base, { overall: { code: 'R', label: 'Rouge', color: '#dc3545' } }));
        expect(rouge).toMatch(/background: #dc3545; color: #ffffff;/);
    });

    it('cliquet : plus aucun `color: ${PAPER}` posé sur une couleur venue des données', () => {
        const src = readFileSync(path.join(racineProjet, 'js', 'synthese-retroaction-rendu.js'), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
        // Les fonds venus des données : ctx.codeColor[...], couleur (niveau général), pastilleBg.
        expect(src).not.toMatch(/background: \$\{couleur\}; color: \$\{PAPER\}/);
        expect(src).not.toMatch(/background: \$\{pastilleBg\}; color: \$\{PAPER\}/);
        expect(src).not.toMatch(/ctx\.codeColor\[[^\]]+\] \|\| MUTED; color = PAPER/);
        expect(src).not.toMatch(/courant \? PAPER : \(atteint \? PAPER/);
    });
});

describe('#571 · C — la date d\'évaluation est échappée', () => {
    it('une date non parsable (repli brut) ne sort pas telle quelle', () => {
        const win = charger();
        const html = win.syntheseRetroactionRendu.rendreSyntheseHTML({
            course: {}, artefact: { title: 'X', corrected: '<img src=x>' }, student: { da: '1' },
            scale: [], overall: { code: '', label: '' }, criteria: [], trajectory: [], errors: [], tokens: [], objectives: []
        });
        expect(html).not.toContain('<img src=x>');
        expect(html).toContain('&lt;img src=x&gt;');
    });
});
