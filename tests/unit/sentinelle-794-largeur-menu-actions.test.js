import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE #794 (9 sept. 2026) — LE MENU « ACTIONS… » A LA MÊME LARGEUR D'UNE
// LIGNE À L'AUTRE.
//
// Rapport testeur du 9 sept. : dans la liste des évaluations, la colonne Actions
// montrait des boîtes en escalier. Cause : un <select> natif se dimensionne sur
// son option la plus longue, et `genererDropdownActions` compose les options
// ligne par ligne — « Supprimer l'évaluation » et « Transférer » ne cohabitent
// jamais. La règle CSS ne posait aucune largeur.
//
// Ce que la sentinelle verrouille : une largeur FIXE en pixels sur la règle de
// base, et aucune reprise en `auto` ailleurs (ce qui rendrait de nouveau la
// boîte tributaire de son contenu). Mesuré dans le Chrome de Grégoire sur un
// banc à quatre listes d'options différentes : 150 px pour les quatre.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
const listeEvaluations = readFileSync(path.join(racine, 'js', 'liste-evaluations.js'), 'utf8');

describe('#794 · la largeur du menu Actions ne dépend plus de ses options', () => {
    it('la règle de base pose une largeur fixe en pixels', () => {
        const m = /^\.eval-actions-select\s*\{([^}]*)\}/m.exec(css);
        expect(m, 'règle .eval-actions-select introuvable').toBeTruthy();
        expect(m[1]).toMatch(/\bwidth:\s*\d+px;/);
    });

    it('aucune règle ne rend la largeur tributaire du contenu', () => {
        const declarations = [...css.matchAll(/\.eval-actions-select[^{]*\{([^}]*)\}/g)]
            .map(m => m[1]);
        expect(declarations.length).toBeGreaterThanOrEqual(2); // base + pointeur grossier
        for (const bloc of declarations) {
            expect(bloc).not.toMatch(/\bwidth:\s*(auto|max-content|fit-content)/);
        }
    });

    it('les options restent conditionnelles — c\'est bien le CSS qui uniformise', () => {
        // Si un jour les options devenaient identiques partout, la sentinelle
        // mesurerait autre chose que ce qu'elle prétend mesurer.
        expect(listeEvaluations).toContain('<select class="eval-actions-select"');
        expect(listeEvaluations).toMatch(/if \(!fichierId && evalId\) \{\s*\n\s*options\.push/);
    });
});
