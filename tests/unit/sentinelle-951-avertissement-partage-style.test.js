import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// #951 (11 oct. 2026) — l'avertissement « grille utilisée dans N trimestres » de la confirmation
// d'export d'un partage portait la classe `texte-avertissement`, qu'aucune feuille ne définit :
// un paragraphe ordinaire. Il prend la classe du même rôle à l'import (#583).
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

describe('#951 · l\'avertissement du partage a un style', () => {
    it('le paragraphe porte « alerte alerte-attention », plus « texte-avertissement »', () => {
        const bloc = tranche(lire('js/partage-export.js'), 'var porteurs = trimestresPortantGrille(grilleAncrage);', 'les autres trimestres peuvent en avoir de différentes');
        expect(bloc).toContain("el('p', 'alerte alerte-attention',");
        expect(lire('js/partage-export.js')).not.toMatch(/'texte-avertissement'/);
    });
    it('les deux classes sont définies dans styles.css', () => {
        const css = lire('styles.css');
        expect(css).toMatch(/^\.alerte\s*\{/m);
        expect(css).toMatch(/\.alerte-attention\s*\{/);
    });
});
