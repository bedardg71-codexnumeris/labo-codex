import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLES #569 + #568 (29 août 2026) — L'ÉCRAN « EXPORTER ET ARCHIVER » ENTRE
// DANS LE DESIGN SYSTEM, ET LES CIBLES TACTILES ATTEIGNENT 44 PX AU DOIGT.
//
// #569 (C3) : huit <select class="form-select"> — classe quasi inexistante dans
// styles.css, rendu natif sans jetons de surface ni de focus — passent à
// `.controle-form`, la classe canonique ; le titre dit « Exporter et archiver »
// comme la navigation ; sans fichier, le module rend son propre état vide.
// #568 (C2) : `.travaux-btn-nav` et `.travaux-fond-swatch` (28 px), `.eval-actions-select`
// (~24 px) montent à 44 px SOUS `@media (pointer: coarse)` — la norme là où elle
// compte (iPad), la densité conservée au Mac. Rendu réel = porte terrain iPad.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const ui = readFileSync(path.join(racine, 'js', 'travaux-ui.js'), 'utf8');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
const config = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');

describe('#569 · l\'écran Exporter et archiver', () => {
    it('plus aucun select hors design system dans travaux-ui.js', () => {
        expect(ui).not.toContain('class="form-select');
        expect((ui.match(/class="controle-form(?: pipeline-select-petit)?"/g) || []).length).toBeGreaterThanOrEqual(8);
    });
    it('le titre de l\'écran est celui de la navigation', () => {
        const m = /\{ id: 'exporter', label: '([^']+)' \}/.exec(config);
        expect(m, 'libellé de navigation introuvable').toBeTruthy();
        expect(ui).toContain('<h3>' + m[1] + ' <button class="btn-aide-contextuelle" data-aide="archiver-travaux"');
        expect(ui).not.toContain('<h3>Archivage des travaux');
    });
    it('sans fichier, le module rend un état vide au lieu de rien', () => {
        expect(ui).toMatch(/fichiersTravaux\.length > 0\s*\?\s*\(fichiersMontres\.length > 0 \? genererGrilleFichiers\(fichiersMontres, 'ouvrirPreviewInline'\) : ''\)\s*:\s*`<p class="placeholder-vide">/);
        expect(css).toMatch(/^\.placeholder-vide\s*\{/m);
    });
});

describe('#568 · cibles tactiles à 44 px sous pointeur grossier', () => {
    it('les trois sélecteurs de l\'audit sont couverts par @media (pointer: coarse)', () => {
        const i = css.indexOf('@media (pointer: coarse) {');
        expect(i, 'bloc pointer: coarse absent').toBeGreaterThan(-1);
        const bloc = css.slice(i, css.indexOf('\n}', i));
        expect(bloc).toMatch(/\.travaux-btn-nav\s*\{[^}]*min-width: 44px;[^}]*min-height: 44px;/);
        expect(bloc).toMatch(/\.travaux-fond-swatch\s*\{[^}]*width: 44px;[^}]*height: 44px;/);
        expect(bloc).toMatch(/\.eval-actions-select\s*\{[^}]*min-height: 44px;/);
    });
    it('la densité du Mac est conservée hors du bloc (28 px en pointeur fin)', () => {
        const base = /\.travaux-btn-nav\s*\{[^}]*width: 28px;[^}]*height: 28px;/.test(css);
        expect(base).toBe(true);
    });
});
