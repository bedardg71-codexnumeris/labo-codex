import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE — l'harmonisation des guides (8 août 2026)
// =======================================================================
//
// Demande Grégoire, sur captures Chrome/Mac : « des polices parfois trop
// grosses, uniformiser la présentation » + « je voudrais que les trois
// guides se ressemblent ».
//
// Ce qui est verrouillé ici :
//   A. UNE échelle typographique, partagée par les DEUX familles de guides
//      (planif-guide-* de la Carte, guide-pedagogique-* de SOLO/ACP/RàI/
//      SOM/PAN) — en sélecteurs GROUPÉS : une seule source, pas deux
//      déclarations qui divergeront ;
//   B. tailles EXPLICITES sur p et li — l'uniformité ne doit pas dépendre
//      de l'héritage (c'est exactement ce qui avait lâché) ;
//   C. plus AUCUN masque `icone-inline` dans le contenu du guide de la
//      Carte : ces spans rendaient VIDE chez Grégoire, et un span sans
//      texte échoue sans laisser de trace ;
//   D. le contenu ne documente plus la page « Plan de la leçon » ni
//      l'import MD, tous deux supprimés en 1.57.0 (#424 Lot G).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
const sourceCarte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');

/** Le contenu de GUIDE_PAGES, bornes vérifiées avant le slice (leçon #413). */
function blocGuidePages() {
    const debut = sourceCarte.indexOf('var GUIDE_PAGES = [');
    expect(debut).toBeGreaterThan(-1);
    const fin = sourceCarte.indexOf('\n];\n', debut);
    expect(fin).toBeGreaterThan(debut);
    return sourceCarte.slice(debut, fin);
}

describe('Guides · A — une seule échelle, partagée par les deux familles', () => {
    it('le corps des deux familles est déclaré ENSEMBLE', () => {
        expect(css).toMatch(/\.planif-guide-corps,\s*\.guide-pedagogique-corps\s*\{[^}]*font-size:\s*0\.9rem/);
    });

    it('astuce et référence aussi — plus de doublon qui diverge', () => {
        expect(css).toMatch(/\.planif-guide-astuce,\s*\.guide-pedagogique-astuce\s*\{/);
        expect(css).toMatch(/\.planif-guide-ref,\s*\.guide-pedagogique-ref\s*\{[^}]*font-size/);
    });

    it('chaque famille ne redéclare PAS sa propre taille de corps', () => {
        // Une redéclaration isolée est le retour du problème : deux guides
        // qui se ressemblent aujourd'hui et divergent au prochain patch.
        // ⚠ Sélecteur ancré en DÉBUT DE LIGNE : sans l'ancre, le motif
        // matchait la fin du sélecteur GROUPÉ (« …, .guide-pedagogique-corps {
        // font-size… ») et l'assertion rougissait sur le code correct.
        // Attrapé au premier run — une assertion qui vise à côté aurait pu
        // tout aussi bien rester verte sur du code cassé.
        const isole = /^\.planif-guide-corps\s*\{[^}]*font-size/m;
        const isolePedago = /^\.guide-pedagogique-corps\s*\{[^}]*font-size/m;
        expect(isole.test(css), 'planif-guide-corps redéclare font-size seul').toBe(false);
        expect(isolePedago.test(css), 'guide-pedagogique-corps redéclare font-size seul').toBe(false);
    });
});

describe('Guides · B — les tailles sont explicites, pas héritées', () => {
    it('p et li portent leur propre font-size dans les deux familles', () => {
        expect(css).toMatch(/\.planif-guide-corps p,\s*\.guide-pedagogique-corps p\s*\{[^}]*font-size/);
        expect(css).toMatch(/\.planif-guide-corps li,\s*\.guide-pedagogique-corps li\s*\{[^}]*font-size/);
    });

    it('la conclusion de la page 7 est dans l’échelle (l’accent est la couleur)', () => {
        expect(css).toMatch(/\.planif-guide-conclusion\s*\{[^}]*font-size/);
    });

    it('text-size-adjust est neutralisé sur le corps des guides', () => {
        expect(css).toMatch(/\.planif-guide-corps,\s*\.guide-pedagogique-corps\s*\{[^}]*text-size-adjust:\s*100%/);
    });
});

describe('Guides · C — les glyphes sont du TEXTE, jamais des masques', () => {
    it('aucun `icone-inline` ne subsiste dans le contenu du guide', () => {
        expect(blocGuidePages()).not.toContain('icone-inline');
    });

    it('les trois glyphes de badge sont rendus en texte stylé', () => {
        const bloc = blocGuidePages();
        expect(bloc).toContain('guide-glyphe--check');
        expect(bloc).toContain('guide-glyphe--gris');
        expect(bloc).toContain('guide-glyphe--warning');
        // Le caractère lui-même est présent : un span vide ne se voit pas.
        expect(bloc).toMatch(/guide-glyphe--check">\\u2713</);
    });

    it('leurs classes existent bien au CSS', () => {
        for (const classe of ['.guide-glyphe--check', '.guide-glyphe--gris', '.guide-glyphe--warning']) {
            expect(css, classe).toContain(classe);
        }
    });
});

describe('Guides · D — le contenu décrit l’application RÉELLE (post-#424)', () => {
    it('plus aucune trace de la page supprimée ni de l’import MD', () => {
        const bloc = blocGuidePages();
        for (const mort of ['Plan de la leçon', 'Importer MD', 'Copier MD', 'Exporter MD', 'Prévisualiser']) {
            expect(bloc, mort).not.toContain(mort);
        }
    });

    it('la dernière page documente le menu Actions et les trois niveaux', () => {
        const bloc = blocGuidePages();
        expect(bloc).toContain('Exporte ton plan');
        expect(bloc).toContain('Exporter le plan');
        expect(bloc).toContain('Plan de cours');
        expect(bloc).toContain('En classe');
        expect(bloc).toContain('Régler le niveau personnalisé');
    });

    it('la page des activités connaît l’Exposé et l’enseignement explicite', () => {
        const bloc = blocGuidePages();
        expect(bloc).toContain('Exposé');
        expect(bloc).toContain('enseignement explicite');
    });

    it('le guide compte toujours ses 8 pages, chacune avec un titre', () => {
        const titres = blocGuidePages().match(/titre: '/g) || [];
        expect(titres.length).toBe(8);
    });
});
