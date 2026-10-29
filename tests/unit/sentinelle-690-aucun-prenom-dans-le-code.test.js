/**
 * #690 · AUCUN NOM DE PERSONNE DANS LE CODE SERVI
 *
 * ⮕ CE QU'ELLE GARDE, ET POURQUOI C'EST GRÉGOIRE QUI L'A DEMANDÉE.
 * Décision du 2 septembre 2026, en deux temps : « on retire absolument tout nom
 * de collègue », puis, la mesure sous les yeux : « on retire TOUS les noms. »
 * Le motif tient en une phrase, et il est le sien : ce code est servi au
 * navigateur de tout le monde. Un nom gravé dedans est un nom PUBLIÉ, par
 * quelqu'un d'autre que son porteur, sans qu'on le lui ait demandé.
 *
 * Ce qui a été retiré ce jour-là, et que cette sentinelle empêche de revenir :
 *   · six identifiants et quatre constantes de `js/pratiques/pratiques-predefines.js`
 *     (`pan-standards-bruno`, `sommative-traditionnelle-mhl`, `pan-specifications-fah`,
 *     `pan-objectifs-ponderes-michel`, `sommative-remplacement-jordan`,
 *     `pan-jugement-global-isabelle`) ;
 *   · les huit identifiants d'échelles disciplinaires, de `IDS_GABARITS_HARDCODES`
 *     (`js/main.js`) et de la sonde (`js/echelles-bibliotheque.js`) — voir le
 *     bloc « #574 étendu · 6 », cas D, de `sentinelle-464-cles-nues.test.js` ;
 *   · une quinzaine d'étiquettes de circonstance en commentaire (« Bug Bruno »,
 *     « cours François », « retour Jean-François »…).
 *
 * ⚠ CE QU'ELLE NE COUVRE PAS, ET C'EST DÉLIBÉRÉ.
 * 1. LES COMMENTAIRES SONT RETIRÉS AVANT LA RECHERCHE. Le retrait se documente
 *    sur place, et cette documentation doit pouvoir citer ce qui est parti ;
 *    un grep naïf rougirait sur la trace du correctif au lieu du correctif.
 *    Même piège, même parade qu'aux sentinelles #542 et #551.
 *    ↻ Tranché le 2 sept. 2026 (addendum), après le retrait des deux dernières
 *    attributions « — Voisard » : la garde N'EST PAS étendue aux commentaires.
 *    La seule distinction qui compte — une ÉTIQUETTE DE CIRCONSTANCE (« Bug
 *    Bruno ») contre une EXPLICATION DE RETRAIT (« config-francois-chimie.js
 *    est parti avec #687 ») — n'est pas mesurable : dans les deux cas le nom
 *    n'apparaît nulle part ailleurs dans le code vivant, et toute heuristique
 *    (mots-clés « parti », « retiré », liste blanche de lignes) est une liste à
 *    maintenir qui rougit à chaque reformulation. Ce que le lot a retiré des
 *    commentaires, c'est la relecture qui l'a fait, pas une machine — et
 *    c'est ce qu'il faudra refaire la prochaine fois. Les trois mentions qui
 *    restent dans js/ sont le témoin : un zéro là serait un défaut.
 * 2. LE PACK DE DÉMONSTRATION EST HORS PÉRIMÈTRE (#351). `pack-demo-10.js` et
 *    `demo-namespace.js` portent des noms d'élèves FICTIFS : des totems scouts (animal + qualité)
 *    depuis #1180 (29 oct. 2026), des figures historiques et culturelles avant. Ce sont des données de démonstration
 *    assumées, pas des personnes réelles.
 * 3. `config.js` EST HORS PÉRIMÈTRE — zone protégée (`noms_stables.json`), et sa
 *    `listeEtudiants` est du même statut que le pack : des fiches fictives.
 *
 * ⚠ ET CE QU'ELLE NE RÈGLE PAS. Les copies de ces échelles et de ces pratiques
 * vivent toujours dans la base des gens qui les ont reçues. Tarir la source ne
 * touche pas le stock, et personne n'ira réécrire dans les données de quelqu'un.
 * C'est #674.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

// Les prénoms des collègues et testeurs dont le matériel a nourri l'application.
const PRENOMS = ['bruno', 'michel', 'isabelle', 'xavier', 'hélène', 'helene',
    'marie-hélène', 'marie-helene', 'étienne', 'etienne', 'olivier', 'jordan',
    'françois', 'francois', 'voisard'];

const HORS_PERIMETRE = new Set(['pack-demo-10.js', 'demo-namespace.js', 'config.js']);

function fichiersJs(dossier, acc = []) {
    for (const e of readdirSync(dossier, { withFileTypes: true })) {
        const p = path.join(dossier, e.name);
        if (e.isDirectory()) fichiersJs(p, acc);
        else if (e.name.endsWith('.js') && !HORS_PERIMETRE.has(e.name)) acc.push(p);
    }
    return acc;
}

/** Retire blocs et lignes de commentaire — voir la note 1 de l'en-tête. */
const sansCommentaires = (src) => src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');

describe('#690 · aucun nom de personne dans le code applicatif', () => {

    it('aucun identifiant, aucune constante et aucun libellé de js/ ne porte un prénom', () => {
        const fautifs = [];
        for (const f of fichiersJs(path.join(racine, 'js'))) {
            const lignes = sansCommentaires(readFileSync(f, 'utf8')).split('\n');
            lignes.forEach((ligne, i) => {
                for (const prenom of PRENOMS) {
                    if (new RegExp('\\b' + prenom + '\\b', 'i').test(ligne)) {
                        fautifs.push(path.relative(racine, f) + ':' + (i + 1) + ' → ' + prenom);
                    }
                }
            });
        }
        expect(fautifs, 'un nom de personne est revenu dans le code servi').toEqual([]);
    });

    // ⚠ LE VERT CI-DESSUS DOIT PORTER SON TÉMOIN. Un balayage qui ne lit aucun
    // fichier rend la même liste vide qu'un code propre, et un motif cassé rend
    // zéro partout. Les deux cas suivants excluent ces deux verts creux.
    //
    // ⮕ POURQUOI PAS LE PACK DE DÉMONSTRATION COMME TÉMOIN. C'était l'idée de
    // départ, et la mesure du 2 septembre l'a écartée : le pack ne contient AUCUN
    // de ces prénoms. Ses dix élèves fictifs étaient alors des figures historiques
    // et culturelles (#351 ; des totems scouts depuis #1180), pas les collègues dont ce lot retire les noms. Un
    // témoin qu'on n'a pas mesuré est une supposition de plus.

    it('témoin 1 — le balayage lit RÉELLEMENT le code applicatif', () => {
        const fichiers = fichiersJs(path.join(racine, 'js'));
        expect(fichiers.length, 'le balayage ne trouve presque aucun fichier').toBeGreaterThan(100);
        // …et il lit du contenu, pas des fichiers vides.
        const total = fichiers.reduce((n, f) => n + readFileSync(f, 'utf8').length, 0);
        expect(total, 'le balayage lit des fichiers vides').toBeGreaterThan(1000000);
        // …et il ne balaie PAS ce qui est hors périmètre.
        const noms = fichiers.map((f) => path.basename(f));
        for (const exclu of HORS_PERIMETRE) expect(noms).not.toContain(exclu);
    });

    it('témoin 2 — le motif VOIT un prénom quand il y en a un', () => {
        // Ligne de contrôle : ce que le lot a retiré, tel qu'il était écrit.
        const controle = "    id: 'pan-standards-bruno',";
        const vus = PRENOMS.filter((p) => new RegExp('\\b' + p + '\\b', 'i').test(controle));
        expect(vus, 'le motif ne reconnaît plus ce qu\'il a servi à retirer').toContain('bruno');
        // …et il ne rougit pas sur n'importe quoi.
        expect(PRENOMS.some((p) => new RegExp('\\b' + p + '\\b', 'i').test("id: 'pan-standards-cinq-niveaux',"))).toBe(false);
    });

    it('les pratiques offertes ne déclarent AUCUNE matière : `discipline` ne vaut que « Général »', () => {
        // La seconde moitié de l'énoncé 4 : un enseignant qui n'enseigne pas la
        // chimie ne doit pas lire « Chimie » dans une pratique qu'on lui offre.
        const src = readFileSync(path.join(racine, 'js/pratiques/pratiques-predefines.js'), 'utf8');
        const valeurs = [...src.matchAll(/^\s*discipline: '([^']*)',/gm)].map((m) => m[1]);
        expect(valeurs.length, 'plus aucune entrée ne déclare de discipline — motif à revoir').toBeGreaterThan(0);
        expect([...new Set(valeurs)]).toEqual(['Général']);
    });

    it('…ni aucun établissement nommé : combiné à la matière, il désigne une personne', () => {
        const src = readFileSync(path.join(racine, 'js/pratiques/pratiques-predefines.js'), 'utf8');
        const valeurs = [...src.matchAll(/^\s*etablissement: '([^']*)',/gm)].map((m) => m[1]);
        expect(valeurs.length, 'plus aucune entrée ne déclare d\'établissement — motif à revoir').toBeGreaterThan(0);
        expect([...new Set(valeurs)]).toEqual(['Cégep']);
    });
});
