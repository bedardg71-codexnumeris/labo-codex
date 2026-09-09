/**
 * SENTINELLE #797 — LE LIBELLÉ D'UN CODE TIENT DANS LA LARGEUR DE LA PALETTE.
 *
 * Rapport testeur du 9 septembre 2026 : « Je voudrais que la description des
 * codes, dans la palette des codes, ne dépasse pas la largeur de la palette. »
 * Mesuré : `.travaux-errfr-nom` portait déjà `nowrap` + `text-overflow:
 * ellipsis`, qui ne s'appliquaient JAMAIS — les items d'un flex `wrap` prennent
 * la largeur de leur contenu, aucune contrainte ne descendait jusqu'au nom, et
 * `.palette-flottante { overflow: auto }` rendait la barre horizontale visible
 * sur la capture. Décision de Grégoire : passer à la ligne plutôt que couper.
 *
 * Mesuré après correctif dans le Chrome de Grégoire (banc à dix codes réels,
 * palette à 257 px) : `scrollWidth === clientWidth === 255`, zéro item qui
 * déborde, les deux libellés longs sur deux lignes (36 px de haut).
 *
 * Break-test attendu : retirer `width: 100%` de l'item, ou remettre
 * `white-space: nowrap` sur le nom → l'essai correspondant rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
const outils = readFileSync(path.join(racine, 'js', 'travaux-outils.js'), 'utf8');

function regle(selecteur) {
    const debut = css.indexOf('\n' + selecteur + ' {');
    expect(debut, 'règle CSS présente : ' + selecteur).toBeGreaterThan(-1);
    return css.slice(debut, css.indexOf('}', debut));
}

describe('#797 · dans la palette, un libellé long revient à la ligne', () => {
    it('l\'item est borné à la largeur de la palette', () => {
        const r = regle('.palette-flottante .travaux-errfr-item');
        expect(r).toMatch(/max-width: 100%;/);
        expect(r).toMatch(/min-width: 0;/);
    });

    it('la liste n\'est PAS empilée : le bandeau (↔) en dépend', () => {
        // Régression attrapée par `palette-layout-h-hauteur-774` : passer la
        // liste en `flex-direction: column` empile les dix codes au lieu des
        // deux lignes du bandeau, et la palette occupe la moitié de la copie.
        expect(css).not.toMatch(/\.palette-flottante \.travaux-errfr-liste \{[^}]*flex-direction: column/);
        expect(regle('.travaux-errfr-liste')).toMatch(/flex-wrap: wrap;/);
    });

    it('le nom se replie au lieu de pousser la ligne', () => {
        const r = regle('.palette-flottante .travaux-errfr-nom');
        expect(r).toMatch(/white-space: normal;/);
        expect(r).toMatch(/overflow-wrap: break-word;/);
        expect(r).toMatch(/min-width: 0;/);
    });

    it('la colonne droite ancrée n\'est pas touchée (elle a la largeur)', () => {
        // Le correctif est scopé : aucune des trois règles ne vise
        // `.annot-col-droite`, et la règle de base garde son ellipsis.
        expect(css).not.toMatch(/\.annot-col-droite \.travaux-errfr-nom \{[^}]*white-space: normal/);
        expect(regle('.travaux-errfr-nom')).toMatch(/text-overflow: ellipsis;/);
    });

    it('le libellé complet reste lisible au survol', () => {
        // L'infobulle porte le nom : c'est elle qui rend la troncature
        // acceptable partout ailleurs, et elle doit survivre au chantier.
        expect(outils).toMatch(/class="travaux-errfr-item\$\{actif\}"[^`]*title="\$\{echapperHtml\(c\.nom\)\}/);
    });
});
