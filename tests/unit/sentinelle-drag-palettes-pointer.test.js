import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle statique — bug #144 (11 juin 2026), palettes immobiles sur iPad.
// Le drag des palettes flottantes (Paramètres/Évaluation/Rétroaction, Annotation,
// Tampons, Codes, Chrono) et de la palette Nœuds (carte mentale) n'écoutait que
// les événements souris : aucun touchstart/pointerdown → palettes figées au
// toucher. Verrouille trois défenses (cf. feedback-fix-perdu-refactoring-extraction) :
//   1. configurerDragPalette (travaux-outils.js) draggue en Pointer Events
//      avec setPointerCapture — couvre souris, doigt et Apple Pencil ;
//   2. la palette Nœuds (planification-carte.js) fait de même ;
//   3. les barres ont touch-action:none (styles.css), sinon Safari iPad cède
//      le geste au défilement natif et le drag ne démarre jamais.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('sentinelle · drag des palettes en Pointer Events (#144)', () => {
    const outils = readFileSync(path.join(racine, 'js', 'travaux-outils.js'), 'utf8');
    const carte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
    const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');

    // Périmètre : corps de configurerDragPalette.
    const debut = outils.indexOf('function configurerDragPalette(');
    const fin = outils.indexOf('function togglePaletteReplie(');
    const corps = outils.slice(debut, fin);

    it('configurerDragPalette existe et précède togglePaletteReplie (périmètre valide)', () => {
        expect(debut).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(debut);
    });

    it('configurerDragPalette draggue en Pointer Events capturés (pas de retour au mousedown seul)', () => {
        expect(corps).toContain("barre.addEventListener('pointerdown'");
        expect(corps).toContain('barre.setPointerCapture(pointerId)');
        expect(corps).toContain("barre.addEventListener('pointercancel'");
        // Le drag souris-seulement ne doit pas revenir.
        expect(corps).not.toContain("barre.addEventListener('mousedown'");
        expect(corps).not.toContain("document.addEventListener('mousemove'");
    });

    it('palette Nœuds (carte mentale) : drag en Pointer Events capturés', () => {
        expect(carte).toContain("paletteBarre.addEventListener('pointerdown'");
        expect(carte).toContain('paletteBarre.setPointerCapture(pointerId)');
        expect(carte).not.toContain("paletteBarre.addEventListener('mousedown'");
    });

    it('creerLayoutAnnotation câble le drag de la palette Annotation (mode normal)', () => {
        const ui = readFileSync(path.join(racine, 'js', 'travaux-ui.js'), 'utf8');
        expect(ui).toContain('travauxOutils.configurerDragPalette(paletteEl, zoneCanvas)');
    });

    it('restaurerPositionPalette borne la position au conteneur (palette jamais hors zone)', () => {
        const restaure = outils.slice(outils.indexOf('function restaurerPositionPalette('), debut);
        expect(restaure).toContain('offsetLeft > maxLeft');
        expect(restaure).toContain('offsetTop > maxTop');
    });

    it('les barres de palettes portent touch-action:none', () => {
        const regleFlottante = css.slice(css.indexOf('.palette-flottante-barre {'), css.indexOf('.palette-flottante-barre:active'));
        const reglePlanif = css.slice(css.indexOf('.planif-palette-barre {'), css.indexOf('.planif-palette-barre:active'));
        expect(regleFlottante).toContain('touch-action: none');
        expect(reglePlanif).toContain('touch-action: none');
    });

    // #937 (23 sept. 2026) — la palette chrono n'existe plus : le chrono vit dans la barre du haut.
    it('poignée visuelle ⠿ présente dans les barres (éval, annotation, tampons, codes, nœuds)', () => {
        const ui = readFileSync(path.join(racine, 'js', 'travaux-ui.js'), 'utf8');
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        expect((outils.match(/class="palette-grip"/g) || []).length).toBeGreaterThanOrEqual(3);
        expect(ui).toContain('class="palette-grip"');
        expect(html).toContain('class="palette-grip"');
    });
});
