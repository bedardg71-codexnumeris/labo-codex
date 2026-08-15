import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ═══════════════════════════════════════════════════════════════════════════
// LA MODALE « GABARITS D'EXPORT » — retours terrain du 15 août 2026
//
// Trois demandes de Grégoire, trois invariants :
//   A. la modale doit s'afficher PAR-DESSUS le plein écran de la carte ;
//   B. elle ne doit plus manger tout l'écran en hauteur ;
//   C. les cases « à ajouter » se rangent en blocs qui se serrent (« tétris »).
// ═══════════════════════════════════════════════════════════════════════════

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
const source = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');

/** z-index d'une règle, lue par son sélecteur exact. */
function zIndexDe(selecteur) {
    const bloc = css.match(
        new RegExp(selecteur.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{[^}]*\\}'));
    if (!bloc) return null;
    const m = bloc[0].match(/z-index:\s*(\d+)/);
    return m ? parseInt(m[1], 10) : null;
}

describe('A · la modale passe AU-DESSUS du plein écran de la carte', () => {
    it('le plein écran de la carte est SOUS la couche des modales', () => {
        // Retour terrain : « il faut fermer le plein écran pour voir la modale ».
        // Les deux étaient à 9999 — et à z-index ÉGAL c'est l'ordre du DOM qui
        // tranche, or #conception-carte (index.html:4187) vient APRÈS la modale
        // (4082). Reproduit au navigateur : #planif-zone-travail était l'élément
        // atteint au centre de la modale.
        const pleinEcran = zIndexDe('#conception-carte.planif-plein-ecran');
        const modale = zIndexDe('.modal-overlay');
        expect(pleinEcran, 'z-index du plein écran introuvable').toBeTruthy();
        expect(modale, 'z-index de .modal-overlay introuvable').toBeTruthy();
        // STRICTEMENT inférieur : l'égalité EST le bug, pas une marge de sûreté.
        expect(pleinEcran).toBeLessThan(modale);
    });

    it('il reste aussi sous l’UI flottante de la carte, attachée au <body>', () => {
        // ⮕ Ce n'était pas le défaut d'UNE modale : le plein écran faisait
        // COUVERCLE sur tout ce qui est attaché au <body>. La barre d'alignement
        // (planification-carte.js : document.body.appendChild(barre)) et la loupe
        // passaient dessous elles aussi. Si quelqu'un remonte le plein écran, ces
        // deux-là redeviennent invisibles en plein écran sans que rien ne le dise.
        const pleinEcran = zIndexDe('#conception-carte.planif-plein-ecran');
        expect(pleinEcran, 'la barre d’alignement repasserait sous le plein écran')
            .toBeLessThan(zIndexDe('#planif-barre-alignement'));
        expect(pleinEcran, 'la loupe repasserait sous le plein écran')
            .toBeLessThan(zIndexDe('#planif-loupe'));
        // Les deux sont bien posées sur le <body>, donc hors du contexte
        // d'empilement du plein écran : c'est ce qui rend la comparaison valide.
        // Les déplacer DANS #conception-carte rendrait ces bornes sans objet —
        // d'où ces deux assertions, qui verrouillent la prémisse elle-même.
        expect(source).toMatch(/document\.body\.appendChild\(barre\)/);
        expect(source).toMatch(/document\.body\.appendChild\(_loupeEl\)/);
    });
});

describe('B · la modale tient dans l’écran', () => {
    it('sa hauteur est plafonnée en vh, et son corps défile', () => {
        // Mesurée à 1283 px sur un écran de 900 avant correction : il fallait
        // défiler la PAGE pour atteindre les boutons. Le tétris reprend ~320 px,
        // mais un gabarit à vingt colonnes redéborderait — seul un plafond en
        // `vh` tient quel que soit le contenu.
        const bloc = css.match(/\.modal-export-perso\s*\{[^}]*\}/);
        expect(bloc, 'règle .modal-export-perso introuvable').toBeTruthy();
        expect(bloc[0]).toMatch(/max-height:\s*\d+vh/);
        expect(bloc[0]).toMatch(/flex-direction:\s*column/);

        // ⚠ `min-height: 0` sur le corps n'est PAS décoratif : sans lui, un
        // enfant flex refuse de rétrécir sous son contenu (défaut `auto`) et le
        // plafond ne s'applique jamais. C'est la ligne dont l'absence rend les
        // deux assertions ci-dessus vraies mais SANS EFFET.
        const corps = css.match(/\.modal-export-perso\s*>\s*\.export-perso-corps\s*\{[^}]*\}/);
        expect(corps, 'règle du corps introuvable').toBeTruthy();
        expect(corps[0]).toMatch(/min-height:\s*0/);
        expect(corps[0]).toMatch(/overflow-y:\s*auto/);
    });
});

describe('C · les colonnes « à ajouter » se rangent en tétris', () => {
    it('le conteneur tétris existe et laisse les blocs se serrer', () => {
        const bloc = css.match(/\.export-perso-tetris\s*\{[^}]*\}/);
        expect(bloc, 'règle .export-perso-tetris introuvable').toBeTruthy();
        expect(bloc[0]).toMatch(/flex-wrap:\s*wrap/);

        // ⚠ `flex: 0 1 auto` est LE point : chaque bloc se dimensionne à SON
        // contenu. Avec `flex: 1`, les blocs s'étireraient à parts égales et on
        // reperdrait la place que la disposition cherche à récupérer.
        const bloque = css.match(/\.export-perso-tetris\s+\.export-perso-colonne-case\s*\{[^}]*\}/);
        expect(bloque, 'règle des blocs tétris introuvable').toBeTruthy();
        expect(bloque[0]).toMatch(/flex:\s*0\s+1\s+auto/);
    });

    it('le rendu émet bien le conteneur — sinon la règle ne vise RIEN', () => {
        // Couplage rendu ↔ style, silencieux : sans le conteneur, le CSS reste
        // valide, aucune assertion de style ne bronche, et les cases se
        // réempilent une par ligne comme avant.
        expect(source).toContain('<div class="export-perso-tetris">');
        expect(source).toContain('<div class="export-perso-choisies">');
    });

    it('l’ordre des colonnes disponibles reste celui du CATALOGUE', () => {
        // Décision de Grégoire, 15 août : « il n'est pas nécessaire de reclasser
        // en ordre alphabétique — on peut les laisser dans une position fixe ».
        // Une case qui change de place entre deux rendus se recherche à chaque
        // fois. On verrouille donc l'ABSENCE de tri sur cette liste.
        const bloc = source.match(
            /var disponibles = Object\.keys\(exporteur\.CATALOGUE_COLONNES\)[\s\S]{0,220}?\n\s{8}\}\);/);
        expect(bloc, 'construction de `disponibles` introuvable').toBeTruthy();
        expect(bloc[0]).not.toMatch(/\.sort\(/);
    });
});
