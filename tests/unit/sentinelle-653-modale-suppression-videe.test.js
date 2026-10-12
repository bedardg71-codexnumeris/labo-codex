import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// =====================================================================
// #653 — LA FENÊTRE DE SUPPRESSION NE GARDE PAS LA LISTE D'AVANT (11 oct. 2026)
// =====================================================================
//
// `ouvrirModalSuppressionRessource` (donnees-v2.js) masquait ses deux blocs, « dépendances
// bloquantes » et « avertissements », sans les vider : la liste de l'ouverture précédente
// restait sous le masque. Un lecteur du texte (le premier témoin de #647) s'y est trompé ; un
// futur chemin qui démasquerait sans remplir annoncerait les dépendances d'une AUTRE ressource.
// Remède : chaque bloc est vidé quand il est masqué.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const corps = tranche(readFileSync(path.join(racine, 'js', 'donnees-v2.js'), 'utf8'),
    'async function ouvrirModalSuppressionRessource', 'const divRemplacement');

describe('#653 · masquer, c\'est aussi vider', () => {
    [['dependances', 'listeDependances', 'divDependances'], ['avertissements', 'listeAvertissements', 'divAvertissements']]
        .forEach(([nom, liste, div]) => {
            it(`${nom} : la branche qui masque vide d'abord la liste`, () => {
                const branche = tranche(corps, `${div}.classList.remove('u-hide');`, `${div}.classList.add('u-hide');`);
                expect(branche).toContain(`${liste}.innerHTML = '';`);   // security-ok: texte cherché dans la source, aucun DOM
            });
        });
});
