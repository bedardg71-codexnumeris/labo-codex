import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE #606 (30 août 2026) — LA CORBEILLE A SON EN-TÊTE, ET IL COMPTE
// AUTANT DE COLONNES QU'ELLE POSE DE CELLULES.
//
// Relevé par Grégoire, capture à l'appui : « le contenu des colonnes ne
// correspond pas aux en-têtes ». La vue Corbeille écrivait ses lignes dans le
// tbody du tableau des évaluations et héritait de SON en-tête, qui nomme de
// tout autres données. Le nom de fichier s'affichait sous « Prénom », la date
// de suppression sous « Statut », le nombre de jours sous « Niveau ».
//
// Deux mécanismes se composaient, et il fallait défaire les deux :
//   · l'en-tête emprunté — neuf colonnes d'évaluation pour six données de
//     corbeille, comblées par des colspan (2 sur l'élève, 3 sur les actions)
//     qui déplaçaient la lecture au lieu de l'aligner ;
//   · le sélecteur de colonnes — il masque par RANG DE CELLULE
//     (`th:nth-child(n)`), pas par colonne logique. Décocher « Jeton »
//     retirait la 5e cellule de chaque ligne de corbeille, c'est-à-dire la
//     date, et décalait tout ce qui suivait d'un cran de plus.
//
// Ce banc verrouille l'invariant qui se mesure hors navigateur : autant de
// `<th>` dans l'en-tête de corbeille que de `<td>` dans ses lignes, aucun
// colspan pour combler l'écart, et un sélecteur de colonnes qui ne peut plus
// atteindre cette vue. L'ALIGNEMENT RÉEL, lui, ne se voit qu'au rendu — il est
// mesuré par `tests/integration/corbeille-entete-606.spec.js`, parce que Vitest
// tourne sous Node et ne peint rien.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceHtml = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
const sourceJs = readFileSync(path.join(racineProjet, 'js', 'liste-evaluations.js'), 'utf8');

// Les commentaires de ce correctif CITENT « colspan » et les noms de colonnes
// pour expliquer le défaut. Sans ce filtre, ils satisferaient les assertions
// qu'ils documentent.
const jsNu = sourceJs
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
const htmlNu = sourceHtml.replace(/<!--[\s\S]*?-->/g, '');

function extraire(source, debutAncre, finAncre) {
    const debut = source.indexOf(debutAncre);
    expect(debut, `ancre de début introuvable : ${debutAncre}`).toBeGreaterThan(-1);
    const fin = source.indexOf(finAncre, debut);
    expect(fin, `ancre de fin introuvable : ${finAncre}`).toBeGreaterThan(debut);
    return source.slice(debut, fin);
}

const enteteCorbeille = extraire(htmlNu, 'id="entete-corbeille"', '</tr>');
const corpsVueCorbeille = extraire(jsNu, 'function afficherVueCorbeille', '\nfunction restaurerFichierCorbeille');
const ligneCorbeille = extraire(corpsVueCorbeille, 'html += `<tr>', '</tr>`;');
const bandeauCorbeille = extraire(corpsVueCorbeille, 'let html = `<tr>', '</tr>`;');

const compter = (texte, motif) => (texte.match(motif) || []).length;

describe('#606 · l\'en-tête de corbeille et ses lignes comptent pareil', () => {

    it('la corbeille a son propre en-tête, distinct de celui des évaluations', () => {
        expect(htmlNu).toContain('id="entete-evaluations"');
        expect(htmlNu).toContain('id="entete-corbeille"');
    });

    it('autant de colonnes annoncées que de cellules posées', () => {
        const nbTh = compter(enteteCorbeille, /<th\b/g);
        const nbTd = compter(ligneCorbeille, /<td\b/g);
        expect(nbTh, 'l\'en-tête doit annoncer des colonnes').toBeGreaterThan(0);
        expect(nbTd, 'la ligne doit poser des cellules').toBe(nbTh);
    });

    it('aucun colspan ne comble l\'écart dans une ligne de corbeille', () => {
        // Le colspan était le symptôme : il servait à remplir un en-tête
        // emprunté. Une cellule, une colonne.
        expect(ligneCorbeille).not.toMatch(/colspan/i);
    });

    it('le bandeau d\'information couvre exactement la largeur annoncée', () => {
        const nbTh = compter(enteteCorbeille, /<th\b/g);
        const m = bandeauCorbeille.match(/colspan="(\d+)"/);
        expect(m, 'le bandeau doit déclarer un colspan').not.toBeNull();
        expect(Number(m[1])).toBe(nbTh);
    });

    it('l\'en-tête de corbeille ne propose aucun tri', () => {
        // Ses colonnes n'existent pas dans `colonneIndexMap` ni dans les clés de
        // tri : un en-tête cliquable y promettrait un geste sans effet.
        expect(enteteCorbeille).not.toContain('trierTableauParColonne');
    });
});

describe('#606 · une seule vue à la fois, et le sélecteur suit', () => {

    const fnEntete = extraire(jsNu, 'function appliquerEnTeteSelonVue', '\nfunction toggleColonneEval');

    it('les deux en-têtes et le sélecteur de colonnes basculent ensemble', () => {
        expect(fnEntete).toContain('entete-evaluations');
        expect(fnEntete).toContain('entete-corbeille');
        expect(fnEntete).toContain('eval-colonnes-selecteur');
        // Les trois suivent `vueCorbeilleActive`, en sens inverse pour l'un.
        expect(fnEntete).toMatch(/entete-corbeille[\s\S]*?!vueCorbeilleActive|!vueCorbeilleActive[\s\S]*?entete-corbeille/);
    });

    it('les trois chemins qui changent de vue posent l\'en-tête', () => {
        for (const fn of ['function basculerVueCorbeille', 'function afficherVueCorbeille', 'function afficherTableauEvaluations']) {
            const debut = jsNu.indexOf(fn);
            expect(debut, fn).toBeGreaterThan(-1);
            const bloc = jsNu.slice(debut, debut + 1600);
            expect(bloc, fn).toContain('appliquerEnTeteSelonVue()');
        }
    });

    it('le masquage de colonne ne peut plus atteindre la vue Corbeille', () => {
        const fnToggle = extraire(jsNu, 'function toggleColonneEval', '\nfunction sauvegarderPreferencesColonnes');
        expect(fnToggle).toMatch(/if\s*\(vueCorbeilleActive\)\s*return/);
    });

    it('le masquage de colonne vise la rangée d\'en-tête des évaluations, pas toutes', () => {
        // Depuis qu'une seconde rangée existe, un `th:nth-child(n)` non qualifié
        // atteindrait aussi la colonne de même rang dans l'en-tête de corbeille.
        const fnToggle = extraire(jsNu, 'function toggleColonneEval', '\nfunction sauvegarderPreferencesColonnes');
        expect(fnToggle).toContain('#entete-evaluations th:nth-child(');
        expect(fnToggle).not.toMatch(/[^-]`th:nth-child\(/);
    });

    it('`vueCorbeilleActive` est déclaré avant tous ses lecteurs', () => {
        // `let` n'est pas hissé : un lecteur défini plus haut MAIS appelé pendant
        // le chargement lèverait une ReferenceError. La déclaration remonte donc
        // au-dessus de `afficherTableauEvaluations` et de `toggleColonneEval`.
        const posDecl = jsNu.indexOf('let vueCorbeilleActive');
        expect(posDecl).toBeGreaterThan(-1);
        for (const fn of ['function afficherTableauEvaluations', 'function appliquerEnTeteSelonVue', 'function toggleColonneEval']) {
            expect(jsNu.indexOf(fn), fn).toBeGreaterThan(posDecl);
        }
    });
});
