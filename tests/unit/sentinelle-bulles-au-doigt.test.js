import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE DES BULLES D'ÉLÈVE AU DOIGT (7 septembre 2026, #540).
//
// Le retour de Grégoire, depuis l'iPad : « j'ai du mal à saisir les bulles
// blanches dans les barres de dégradés ». Son journal d'actions le montre sans
// ambiguïté — cinq touchers de suite atterrissent sur `.barre-indicateur`, le
// fond de la barre, et pas une seule fois sur une bulle.
//
// Deux causes, mesurées au code :
//   1. Une bulle fait 10 px (`.barre-etudiant`), là où la règle du projet
//      demande 44 px de cible tactile (skill design-interface §5) — et elle
//      BOUGE : `float-vertical` la fait osciller sans arrêt.
//   2. Elle portait un style `:hover` sans garde. Sur iPad, un élément qui
//      porte un `:hover` fait du PREMIER toucher un survol simulé : la bulle
//      grossit, et le clic ne part qu'au toucher suivant. Sur une cible de
//      10 px qui oscille, ce premier toucher pour rien est indiscernable
//      d'un raté.
//
// ⚠ CE QUI A ÉTÉ ÉCARTÉ, et pourquoi ça compte : donner 44 px de zone sensible
// à chaque bulle, le réflexe habituel. Vingt-huit élèves sur une barre
// d'environ 700 px se tiennent à 25 px les uns des autres en moyenne, et bien
// moins là où la distribution se resserre : des zones de 44 px s'y
// recouvriraient de part en part, et le toucher irait à la bulle du DESSUS —
// celle que l'empilement désigne, pas celle qu'on vise. La cible de 44 px est
// donc obtenue par DISTANCE au doigt. C'est S1 qui tient cette différence, et
// elle est la raison d'être du correctif.
//
// Ce que cette sentinelle tient :
//   S1 — l'arbitrage : la plus PROCHE gagne, même contre une bulle posée plus
//        tard dans le DOM ; le rayon borne ; les égalités sont stables.
//   S2 — le survol des bulles est sous `hover: hover`.
//   S3 — la tolérance est branchée, bornée au pointeur grossier et à la barre
//        touchée, et mesure la position ANIMÉE.
//
// ⚠ Ce qu'elle NE tient PAS : qu'une bulle se saisisse au doigt. Ça se juge sur
// l'iPad — WebKit est absent des conteneurs (#456), et aucun banc ici n'a de
// doigt. Elle tient l'arbitrage et la forme, qui sont les causes.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
const source = readFileSync(path.join(racine, 'js', 'tableau-bord-apercu.js'), 'utf8');

function chargerModule() {
    const store = {};
    return chargerScript('js/tableau-bord-apercu.js', {
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async (k, d) => (k in store ? store[k] : d),
            set: async (k, v) => { store[k] = v; }
        },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => (t == null ? '' : String(t)),
        obtenirCoursActifId: () => null
    });
}

/* ------------------------------------------------------- S1 — l'arbitrage */

describe('Bulles au doigt · S1 — la plus proche gagne', () => {
    const bulleLaPlusProche = chargerModule()._bulleLaPlusProche;

    it('la fonction est bien exposée', () => {
        expect(typeof bulleLaPlusProche).toBe('function');
    });

    // Le centre d'une bulle, tel que le code le mesure.
    const b = (nom, x, y) => ({ x, y, element: nom });

    it('LE POINT DÉCISIF — la plus proche gagne contre une bulle POSTÉRIEURE dans le DOM', () => {
        // C'est tout l'écart avec une zone sensible de 44 px : là, « Dupont »
        // recouvrirait « Tremblay » et gagnerait par empilement, alors que le
        // doigt est posé sur Tremblay.
        const centres = [b('Tremblay', 100, 50), b('Dupont', 118, 50)];
        expect(bulleLaPlusProche(centres, 102, 50, 22)).toBe('Tremblay');
    });

    it('la plus proche gagne aussi quand elle est ANTÉRIEURE dans le DOM', () => {
        // Le miroir du cas précédent : sans lui, un test passerait aussi bien
        // sur une implémentation qui rendrait toujours la première venue.
        const centres = [b('Tremblay', 100, 50), b('Dupont', 118, 50)];
        expect(bulleLaPlusProche(centres, 116, 50, 22)).toBe('Dupont');
    });

    it('la distance compte les deux axes, pas seulement l\'horizontale', () => {
        // Les bulles oscillent verticalement : deux bulles peuvent partager
        // la même abscisse et n'être pas à la même hauteur.
        const centres = [b('haute', 200, 30), b('basse', 200, 70)];
        expect(bulleLaPlusProche(centres, 200, 64, 22)).toBe('basse');
        expect(bulleLaPlusProche(centres, 200, 36, 22)).toBe('haute');
    });

    it('rien d\'assez près : le toucher ne saisit personne', () => {
        const centres = [b('loin', 500, 50)];
        expect(bulleLaPlusProche(centres, 100, 50, 22)).toBe(null);
    });

    it('le rayon borne bien à 22 px, en diagonale comme à l\'horizontale', () => {
        const centres = [b('cible', 100, 50)];
        expect(bulleLaPlusProche(centres, 121, 50, 22)).toBe('cible');   // 21 px : dedans
        expect(bulleLaPlusProche(centres, 123, 50, 22)).toBe(null);      // 23 px : dehors
        // 3-4-5 : (15, 20) est à exactement 25 px, donc hors d'un rayon de 22.
        expect(bulleLaPlusProche(centres, 115, 70, 22)).toBe(null);
        expect(bulleLaPlusProche(centres, 109, 62, 22)).toBe('cible');   // 15 px
    });

    it('à égalité stricte, l\'ordre du DOM tranche — le résultat est stable', () => {
        // Deux touchers identiques doivent saisir la même bulle : autrement le
        // geste devient une loterie, ce qui est le défaut qu'on corrige.
        const centres = [b('premiere', 90, 50), b('seconde', 110, 50)];
        expect(bulleLaPlusProche(centres, 100, 50, 22)).toBe('premiere');
        expect(bulleLaPlusProche(centres, 100, 50, 22)).toBe('premiere');
    });

    it('une barre sans bulle ne saisit rien', () => {
        expect(bulleLaPlusProche([], 100, 50, 22)).toBe(null);
    });

    it('trois bulles serrées : c\'est bien la médiane qui est saisie quand on la vise', () => {
        const centres = [b('a', 100, 50), b('b', 112, 50), b('c', 124, 50)];
        expect(bulleLaPlusProche(centres, 113, 50, 22)).toBe('b');
    });
});

/* ------------------------------------------- S2 — le survol simulé de l'iPad */

describe('Bulles au doigt · S2 — le survol est réservé aux pointeurs qui survolent', () => {
    /** Le bloc `@media (hover: hover)` qui contient un sélecteur donné. */
    function blocHoverContenant(selecteur) {
        let i = -1;
        while ((i = css.indexOf('@media (hover: hover) {', i + 1)) !== -1) {
            const ouvrante = css.indexOf('{', i);
            let profondeur = 0, fin = -1;
            for (let j = ouvrante; j < css.length; j++) {
                if (css[j] === '{') profondeur++;
                else if (css[j] === '}') {
                    profondeur--;
                    if (profondeur === 0) { fin = j; break; }
                }
            }
            const bloc = css.slice(ouvrante, fin);
            if (bloc.includes(selecteur)) return bloc;
        }
        return null;
    }

    it('`.barre-etudiant:hover` est sous `hover: hover`', () => {
        expect(blocHoverContenant('.barre-etudiant:hover')).not.toBe(null);
    });

    it('`.barre-etudiant-sans-eval:hover` aussi', () => {
        expect(blocHoverContenant('.barre-etudiant-sans-eval:hover')).not.toBe(null);
    });

    it('aucune règle `:hover` de bulle ne subsiste hors garde', () => {
        // Le compte total doit être celui des règles gardées : si quelqu'un en
        // rajoute une sans garde, elle rend le premier toucher inerte à nouveau.
        const toutes = css.match(/\.barre-etudiant[\w-]*:hover\s*\{/g) || [];
        // ⚠ La troisième a été TROUVÉE PAR CE TEST : `.mode-clair
        // .barre-etudiant:hover` a sa propre règle, 12 000 lignes plus bas, et
        // elle avait été manquée au premier jet. Sans elle, le mode clair
        // gardait sur iPad le premier toucher inerte que le mode sombre venait
        // de perdre.
        const gardees = ['.barre-etudiant:hover', '.barre-etudiant-sans-eval:hover',
                         '.mode-clair .barre-etudiant:hover']
            .filter((s) => blocHoverContenant(s) !== null);
        expect(toutes.length).toBe(gardees.length);
    });

    it('la sélection au clic, elle, reste hors garde — le doigt y a droit', () => {
        // `.selected` est posée par le gestionnaire, pas par le survol : elle ne
        // doit surtout PAS suivre `:hover` sous la garde.
        const i = css.indexOf('.barre-etudiant.selected {');
        expect(i).toBeGreaterThan(-1);
        expect(blocHoverContenant('.barre-etudiant.selected')).toBe(null);
    });
});

/* --------------------------------------------- S3 — la tolérance est branchée */

describe('Bulles au doigt · S3 — la tolérance est branchée et bornée', () => {
    function corpsDe(nomFonction) {
        const debut = source.indexOf(`function ${nomFonction}(`);
        expect(debut, `${nomFonction} doit exister`).toBeGreaterThan(-1);
        const ouvrante = source.indexOf('{', debut);
        let profondeur = 0, fin = -1;
        for (let i = ouvrante; i < source.length; i++) {
            if (source[i] === '{') profondeur++;
            else if (source[i] === '}') {
                profondeur--;
                if (profondeur === 0) { fin = i; break; }
            }
        }
        return source.slice(ouvrante, fin);
    }

    it('le gestionnaire de clic consulte la tolérance quand rien n\'est touché', () => {
        expect(source).toMatch(
            /closest\('\.barre-etudiant'\)\s*\n\s*\|\|\s*pointLePlusProcheDuToucher\(e\)/
        );
    });

    const tolerance = corpsDe('pointLePlusProcheDuToucher');

    it('elle ne s\'applique qu\'au pointeur grossier — la souris garde son geste', () => {
        // La garde vit dans `pointeurEstGrossier`, que la tolérance appelle en
        // tout premier et dont elle sort aussitôt. Les deux moitiés comptent :
        // une garde qui n'interroge pas la bonne requête média, ou une tolérance
        // qui ne l'appelle pas, laissent la souris changer de comportement.
        expect(corpsDe('pointeurEstGrossier')).toContain("'(pointer: coarse)'");
        expect(tolerance).toMatch(/if \(!pointeurEstGrossier\(\)\) return null;/);
    });

    it('la requête média ne se recrée pas à chaque clic de l\'application', () => {
        // Le gestionnaire est délégué au document : il voit TOUS les clics de
        // l'app. Un `matchMedia` neuf à chacun serait une dépense pour rien.
        const garde = corpsDe('pointeurEstGrossier');
        expect(garde).toMatch(/if \(!_pointeurGrossier\)/);
    });

    it('elle est bornée à la barre touchée, pas au document', () => {
        expect(tolerance).toContain("closest('.barre-indicateur')");
        expect(tolerance).toContain("barre.querySelectorAll('.barre-etudiant')");
        expect(tolerance, 'chercher sur tout le document volerait le toucher d\'une barre voisine')
            .not.toMatch(/document\.querySelectorAll\('\.barre-etudiant'\)/);
    });

    it('elle mesure la position ANIMÉE, pas le style au repos', () => {
        // Les bulles oscillent : lire `style.left` viserait où elles ne sont pas.
        expect(tolerance).toContain('getBoundingClientRect()');
    });

    it('le rayon vaut 22 px — la cible de 44 px de la règle du projet', () => {
        const m = source.match(/const RAYON_TOUCHER_BULLE = (\d+);/);
        expect(m, 'le rayon doit être une constante nommée').toBeTruthy();
        expect(Number(m[1]) * 2).toBe(44);
    });
});
