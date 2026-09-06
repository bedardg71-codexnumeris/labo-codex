import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle statique — #773 (6 septembre 2026), la palette des codes ne se
// redimensionnait pas au doigt sur iPad. Les palettes flottantes comptaient sur
// `resize: both` : WebKit iPadOS ne rend pas cette poignée native au toucher.
// Verrouille le remplacement (Pointer Events, comme le glisser du #144) :
//   1. configurerPoigneeRedimension existe, capture le pointeur, écoute
//      pointercancel, et configurerDragPalette l'appelle — la poignée suit
//      chaque palette qui a un glisser ;
//   2. la poignée CSS garde le geste (touch-action:none), fait la cible tactile
//      iPad (44 px), et le JS la ramène au coin VISIBLE quand la palette défile
//      (une poignée absolue part avec le contenu — l'ancien ::after le faisait) ;
//   3. le `resize: both` natif est PARTI des palettes (zéro-dette : le chantier
//      retire ce qu'il remplace) — et la palette repliée cache la poignée.
// Le geste lui-même est mesuré au navigateur : palette-redim-poignee-773.spec.js.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const outils = readFileSync(path.join(racine, 'js', 'travaux-outils.js'), 'utf8');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');

function regle(selecteur) {
    const debut = css.indexOf('\n' + selecteur + ' {');
    expect(debut, 'règle CSS présente : ' + selecteur).toBeGreaterThan(-1);
    return css.slice(debut, css.indexOf('}', debut));
}

describe('sentinelle #773 · redimensionnement des palettes au doigt', () => {
    const debut = outils.indexOf('function configurerPoigneeRedimension(');
    const finFn = outils.indexOf('function configurerDragPalette(');
    const corps = outils.slice(debut, finFn);
    const drag = outils.slice(finFn, outils.indexOf('function togglePaletteReplie('));

    it('configurerPoigneeRedimension existe et précède configurerDragPalette (périmètre valide)', () => {
        expect(debut).toBeGreaterThan(-1);
        expect(finFn).toBeGreaterThan(debut);
    });

    it('la poignée est posée en Pointer Events capturés, avec pointercancel', () => {
        expect(corps).toContain("poignee.className = 'palette-poignee-redim'");
        expect(corps).toContain("poignee.addEventListener('pointerdown'");
        expect(corps).toContain('poignee.setPointerCapture(pointerId)');
        expect(corps).toContain("poignee.addEventListener('pointercancel'");
        expect(corps).not.toContain("addEventListener('mousedown'");
    });

    it('la taille est persistée au relâchement (ce que le resize natif ne faisait pas)', () => {
        expect(corps).toContain('sauvegarderPositionPalette(palette)');
        const sauve = outils.slice(outils.indexOf('function sauvegarderPositionPalette('), outils.indexOf('function restaurerPositionPalette('));
        expect(sauve).toContain('width: palette.style.width');
        expect(sauve).toContain('height: palette.style.height');
    });

    it('configurerDragPalette pose la poignée — toute palette qui se glisse se redimensionne', () => {
        expect(drag).toContain('configurerPoigneeRedimension(palette, conteneur)');
    });

    it('CSS : la poignée garde le geste, siège dans le coin et fait 44 px', () => {
        const r = regle('.palette-poignee-redim');
        expect(r).toContain('touch-action: none');
        expect(r).toContain('position: absolute');
        expect(r).toContain('width: 44px');
        expect(r).toContain('height: 44px');
    });

    it('la poignée suit le défilement de la palette (ramenée au coin visible)', () => {
        expect(corps).toContain("palette.addEventListener('scroll'");
        expect(corps).toContain('translateY(');
    });

    it('CSS : le resize natif est parti des palettes flottantes (Annotation, Codes, Tampons, Évaluer)', () => {
        expect(regle('.palette-flottante')).not.toMatch(/^\s*resize:/m);
        expect(regle('#travaux-palette-erreurs-fr,\n#travaux-palette-tampons')).not.toMatch(/^\s*resize:/m);
    });

    it('CSS : la palette repliée cache la poignée', () => {
        const debutReplie = css.indexOf('.palette-flottante.replie .palette-flottante-contenu,');
        expect(debutReplie).toBeGreaterThan(-1);
        const bloc = css.slice(debutReplie, css.indexOf('}', debutReplie));
        expect(bloc).toContain('.palette-flottante.replie .palette-poignee-redim');
        expect(bloc).toContain('display: none');
    });
});
