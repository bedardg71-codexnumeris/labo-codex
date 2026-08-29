import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE #570 (29 août 2026) — LES FLÈCHES DE TRI DE LA LISTE ONT LEURS PROPRES IDS.
//
// `tri-da`, `tri-nom`, `tri-prenom` existaient DEUX fois dans index.html (tableau des
// étudiants, Liste des évaluations) : `getElementById` atteignait le premier, et trier
// la Liste ne changeait jamais sa flèche. Le correctif de couleur seul (1,96:1 en mode
// clair) aurait été invérifiable. La Liste porte désormais `tri-eval-*`, et ses flèches
// héritent de la couleur de l'en-tête. Le comportement à l'écran est prouvé par la spec
// WebKit `liste-tri-indicateurs-570.spec.js` ; ici, l'invariant statique.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
const js = readFileSync(path.join(racine, 'js', 'liste-evaluations.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

describe('#570 · ids de tri', () => {
    it('aucun id="tri-…" n\'est dupliqué dans index.html', () => {
        const ids = [...html.matchAll(/id="(tri-[a-zA-Z-]+)"/g)].map(m => m[1]);
        const doublons = ids.filter((id, i) => ids.indexOf(id) !== i);
        expect([...new Set(doublons)], 'ids de tri dupliqués').toEqual([]);
    });
    it('la Liste lit tri-eval-* et n\'atteint plus les ids du tableau des étudiants', () => {
        const i = js.indexOf('function mettreAJourIndicateursTri(');
        const corps = js.slice(i, js.indexOf('\n}', i));
        expect(corps).toContain('`tri-eval-${col}`');
        expect(corps).toContain('`tri-eval-${triEvaluationsActuel.colonne}`');
        expect(corps).not.toMatch(/`tri-\$\{/);
        for (const col of ['da', 'nom', 'prenom', 'production', 'jetons', 'niveau', 'niveauIDME', 'note']) {
            expect(html, 'tri-eval-' + col).toContain('id="tri-eval-' + col + '"');
        }
    });
    it('les flèches de la Liste n\'ont plus de couleur en dur : elles portent la classe qui hérite', () => {
        const spans = [...html.matchAll(/<span id="tri-eval-[a-zA-Z]+"[^>]*>/g)].map(m => m[0]);
        expect(spans.length).toBe(8);
        for (const s of spans) {
            expect(s).toContain('class="tri-indicateur"');
            expect(s).not.toContain('gris-clair');
        }
        expect(html).toMatch(/\.thead-sticky-bleu \.tri-indicateur \{[^}]*color: inherit/);
    });
});
