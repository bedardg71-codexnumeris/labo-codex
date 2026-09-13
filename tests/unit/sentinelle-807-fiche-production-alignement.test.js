import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE #807 — LA FICHE PRODUCTION NE SE DÉSALIGNE PLUS QUAND UN CHAMP
// DISPARAÎT.
//
// LE SYMPTÔME, RAPPORTÉ PAR GRÉGOIRE LE 9 SEPTEMBRE 2026 : « plusieurs champs
// désalignés » sur la fiche d'un artefact. Deux causes distinctes, et aucune ne
// se voit en lisant le code — il faut ouvrir la fiche du bon type.
//
//   1. La définition du type vivait en colonne de gauche, alignée sur le BAS de
//      la colonne voisine (`justify-content: flex-end`, choix du 20 août). Cet
//      alignement supposait deux colonnes de hauteur comparable. Pour un
//      ARTEFACT, la pondération disparaît — les artefacts n'en ont pas — et la
//      colonne droite reste seule à porter la hauteur : la définition tombait
//      alors tout en bas, sous un grand trou blanc.
//
//   2. Les trois choix (grille / échelle / cartouche) étaient alignés par le
//      BAS. Leurs libellés n'ont pas le même nombre de lignes : « Grille de
//      critères d'évaluation » en prend trois là où « Échelle de performance »
//      en prend deux. Les trois libellés démarraient donc à trois hauteurs
//      différentes — 67 px d'écart, mesuré dans Chrome.
//
// ⮕ CE QUE CE FICHIER TIENT : une disposition ne doit pas dépendre de la
// hauteur de son voisin. La définition prend toute la largeur (plus de voisine),
// et les trois colonnes de choix s'étirent (libellés en haut, sélecteurs en bas)
// au lieu de se caler chacune sur son propre contenu.

const racine = path.resolve(process.cwd(), '..');
const html = fs.readFileSync(path.join(racine, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(racine, 'styles.css'), 'utf8');

// La Section 3 de la fiche : de la définition du type jusqu'aux trois choix.
function sectionFicheProduction() {
    const debut = html.indexOf('id="carteDefinitionType"');
    const fin = html.indexOf('id="noteGrille"');
    expect(debut, 'la carte de définition a disparu de la fiche').toBeGreaterThan(-1);
    expect(fin, 'la note de grille a disparu de la fiche').toBeGreaterThan(debut);
    return html.slice(debut, fin);
}

describe('#807 · la fiche production ne dépend plus de la hauteur du voisin', () => {

    it('1. la définition du type n\'est plus alignée sur le bas d\'une colonne', () => {
        // ⮕ L'ASSERTION QUI PORTE LE SENS. `flex-end` est ce qui faisait tomber
        // la définition sous un trou blanc dès que la colonne voisine grandissait.
        const bloc = sectionFicheProduction();
        expect(bloc, 'la définition est de nouveau calée sur le bas d\'une colonne')
            .not.toMatch(/justify-content:\s*flex-end/);
    });

    it('2. la définition du type précède les deux colonnes (pleine largeur)', () => {
        // Si elle repassait DANS une colonne, elle retrouverait une voisine sur
        // laquelle s'aligner — et le défaut avec.
        const posDefinition = html.indexOf('id="carteDefinitionType"');
        const posDiagnostique = html.indexOf('class="prod-marqueur-diagnostique"');
        const posChoix = html.indexOf('id="champGrille"');
        expect(posDefinition).toBeLessThan(posDiagnostique);
        expect(posDefinition).toBeLessThan(posChoix);

        const bloc = html.slice(posDefinition, posDefinition + 400);
        expect(bloc, 'la carte de définition doit être un bloc de premier niveau, pas une colonne')
            .not.toMatch(/grid-template-columns/);
    });

    it('3. les trois choix s\'étirent au lieu de se caler sur leur propre contenu', () => {
        const bloc = sectionFicheProduction();
        const champGrille = tranche(bloc, 'id="champGrille"');
        const styleInline = champGrille.slice(0, champGrille.indexOf('>'));
        expect(styleInline, 'align-items: end fait démarrer les trois libellés à trois hauteurs')
            .not.toMatch(/align-items:\s*end/);
        expect(styleInline).toMatch(/align-items:\s*stretch/);
    });

    it('4. et la règle qui pousse chaque sélecteur au pied de sa colonne existe', () => {
        // ⚠ SANS ELLE, `stretch` seul EMPIRE les choses : les colonnes prennent
        // la même hauteur, les libellés s'alignent en haut — et les sélecteurs se
        // retrouvent à trois hauteurs différentes. Mesuré : 0 px d'écart sur les
        // libellés, 67 px sur les sélecteurs. Les deux moitiés vont ensemble.
        expect(css, 'la règle #champGrille .groupe-form a disparu de styles.css')
            .toMatch(/#champGrille\s+\.groupe-form\s*\{[^}]*justify-content:\s*space-between/);
        expect(css.match(/#champGrille\s+\.groupe-form\s*\{[^}]*\}/)[0])
            .toMatch(/flex-direction:\s*column/);
    });

    it('5. la pondération et le marqueur diagnostique restent voisins (#790)', () => {
        // Le marqueur se lit « juste sous la pondération — c'est là que le poids
        // d'un travail se décide, donc c'est là qu'on dit qu'il n'en a aucun ».
        // Un remaniement de disposition ne doit pas les séparer.
        const bloc = sectionFicheProduction();
        const posPonderation = bloc.indexOf('id="champPonderation"');
        const posDiagnostique = bloc.indexOf('class="prod-marqueur-diagnostique"');
        const posChoix = bloc.indexOf('id="champGrille"');
        expect(posPonderation, 'la pondération a quitté ce bloc').toBeGreaterThan(-1);
        expect(posPonderation).toBeLessThan(posDiagnostique);
        expect(posDiagnostique, 'les trois choix se sont glissés entre la pondération et le marqueur')
            .toBeLessThan(posChoix);
    });
});
