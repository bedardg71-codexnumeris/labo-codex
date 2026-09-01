import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle §3 — LE MATÉRIEL SEMÉ SE DIT UTILISABLE (1er septembre 2026).
//
// L'application semait trois pièces et n'en disait rien : un nouvel enseignant
// croyait devoir tout construire. Deux d'entre elles portaient « générique
// (exemple) » — un libellé qui dit « ceci ILLUSTRE » à qui a besoin de lire
// « ceci SERT ».
//
// ⚠ CE QUE LA MESURE A CHANGÉ AU PLAN. Le §3 supposait qu'on réécrirait des
// libellés ET des descriptions. Mesuré sous WebKit le 1er septembre : la
// `description` d'une grille, d'une échelle ou d'une cartouche **n'est affichée
// dans AUCUNE liste** — seul le NOM est visible, dans les `<select>` de l'écran
// d'évaluation. Tout le message devait donc tenir dans le nom ; réécrire les
// descriptions n'aurait rien changé à ce que l'enseignant voit.
//
// ⚠⚠ ET LE NOM DE LA GRILLE VOYAGE JUSQU'À L'ÉLÈVE. `travaux-export-pdf.js`
// l'imprime sous « Évaluation : … » depuis `evaluation.grilleNom`. Un élève
// lisait donc le mot « exemple » sur son propre document. C'est la première
// raison de ce changement, avant le confort du nouvel enseignant — et c'est
// l'assertion D qui la garde.
//
// Break-test du 1er septembre, sur la source EN MÉMOIRE : remettre « (exemple) »
// dans un nom → A et D rougissent ; retirer l'ancrage par identifiant de
// `estRessourceDemo` → C rougit, et c'est le point qui compte, parce que ce
// lot-là aurait sinon changé les exports EN SILENCE.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racineProjet, 'js', f), 'utf8');

/** Le littéral `nom:` de l'objet semé dont l'id est donné. */
function nomSeme(fichier, id) {
    const src = lire(fichier);
    const ancre = src.indexOf("id: '" + id + "'");
    expect(ancre, id + ' introuvable dans ' + fichier).toBeGreaterThan(-1);
    // Le `nom:` qui suit, en sautant les commentaires intercalés.
    const suite = src.slice(ancre, ancre + 1400)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
    const m = suite.match(/nom:\s*'([^']+)'/);
    expect(m, 'aucun `nom:` après ' + id).not.toBeNull();
    return m[1];
}

const PIECES = [
    ['grilles.js', 'GRILLE_GENERIQUE', 'Grille de départ'],
    ['cartouches.js', 'CART_GENERIQUE', 'Cartouche de départ'],
    ['echelles.js', 'ECHELLE_IDME_DEPART', 'Échelle de départ (IDME)']
];

describe('§3 · les trois pièces semées se présentent comme un point de départ', () => {

    it('A · aucune ne se dit « exemple » ni « générique » — les mots qui disaient « ceci illustre »', () => {
        for (const [f, id] of PIECES) {
            const nom = nomSeme(f, id);
            expect(nom.toLowerCase(), id + ' porte encore « exemple »').not.toContain('exemple');
            expect(nom.toLowerCase(), id + ' porte encore « générique »').not.toContain('générique');
        }
    });

    it('B · les trois se reconnaissent par le MÊME mot — sinon elles ne font pas un ensemble', () => {
        for (const [f, id, attendu] of PIECES) {
            expect(nomSeme(f, id), id).toBe(attendu);
            expect(nomSeme(f, id).toLowerCase()).toContain('de départ');
        }
    });

    it('C · l\'exclusion d\'export tient par IDENTIFIANT, pas par le nom — le lot ne change rien à ce qui part', () => {
        const win = chargerScript('js/import-export.js');
        // Les trois pièces, sous leurs NOUVEAUX noms, restent hors export.
        for (const [f, id, nom] of PIECES) {
            const type = id.startsWith('GRILLE') ? 'grille' : (id.startsWith('CART') ? 'cartouche' : 'echelle');
            expect(win.estRessourceDemo({ id, nom }, type),
                id + ' entrerait maintenant dans les exports — le renommage a changé un COMPORTEMENT').toBe(true);
        }
        // Et une ressource de l'utilisateur qui porterait un nom voisin n'est PAS
        // emportée : c'est l'identifiant qui décide, pas le vocabulaire.
        expect(win.estRessourceDemo({ id: 'GRILLE_A_MOI', nom: 'Ma grille de départ pour la session' }, 'grille'),
            'une grille personnelle est exclue de son propre export').toBe(false);
    });

    it('D · le nom de la grille est digne du PDF de l\'élève — il y est imprimé', () => {
        // `travaux-export-pdf.js` écrit « Évaluation : <grilleNom> » sur le
        // document remis. Ce banc garde le fait, pas seulement le mot : si le
        // site d'impression disparaît, l'assertion doit être revue, pas supprimée.
        const pdf = lire('travaux-export-pdf.js');
        expect(pdf, 'le nom de la grille ne s\'imprime plus — cette garde est à revoir')
            .toContain('evaluation.grilleNom');
        const nom = nomSeme('grilles.js', 'GRILLE_GENERIQUE');
        for (const mot of ['exemple', 'test', 'démo', 'generique', 'générique']) {
            expect(nom.toLowerCase(), 'un élève lirait « ' + mot + ' » sur son évaluation').not.toContain(mot);
        }
    });

    it('E · les descriptions décrivent, elles ne donnent plus de consigne d\'interface', () => {
        // Elles ne sont affichées dans AUCUNE liste, mais elles S'IMPRIMENT sur
        // les PDF de la grille (`export-pdf.js`) : « Modifie ou duplique selon tes
        // besoins » y était une consigne d'écran égarée dans un document.
        // ⚠ Retirer les commentaires AVANT d'asserter : le commentaire qui
        // explique le retrait CITE la formule retirée, et faisait rougir ce banc
        // au premier jet. Une chaîne citée dans une phrase n'est pas une chaîne
        // écrite dans le code — leçon des assertions statiques de ce dépôt.
        const sansCommentaires = (t) => t
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
        const src = sansCommentaires(lire('grilles.js')) + sansCommentaires(lire('cartouches.js'));
        expect(src).not.toContain('Modifie ou duplique selon tes besoins');
        expect(src).not.toContain('Exemple de cartouche de rétroaction');
    });
});
