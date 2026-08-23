import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #291 / #476 · L'IDENTITÉ SURVIT JUSQU'À L'AFFICHAGE.
//
// Les cinq détecteurs remplacés par ce module commençaient tous par
// dédupliquer par `id` avant de regrouper par nom. Mesuré le 23 août 2026,
// en rejouant leur logique telle quelle :
//
//   A — même `id` deux fois dans la liste  →  []            INVISIBLE
//   B — copie (id neuf + idOriginal)       →  signalé, « IDs différents »
//   C — homonymes légitimes (#450)         →  signalé, « IDs différents »
//
// B et C sortaient donc INDISCERNABLES, et A — l'anomalie la plus grave —
// ne sortait pas du tout. Le bandeau affirmait pourtant « IDs identiques =
// vraies copies, IDs différents = homonymes légitimes » : faux des deux côtés.
//
// Ce fichier verrouille les sorties NOUVELLES : A → 'collision-id',
// B → 'copie', C → 'homonymes'.
//
// BREAK-TEST (fait le 23 août 2026, §4 du rituel /fin-de-session) —
// rétablir la déduplication par `id` en tête de `analyserDoublons` :
//   const parId = new Map();
//   liste.forEach(it => { if (it && it.id && !parId.has(it.id)) parId.set(it.id, it); });
//   liste = [...parId.values()];
// → « cas A · même id deux fois » ROUGIT (0 groupe rendu au lieu de 1).
// Sans ce rouge, la sentinelle ne verrouillerait pas ce qu'on croit.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

let win;
beforeEach(() => {
    win = chargerScript('js/identite-item.js');
});

/* ------------------------------------------------------------------ */
/* Les trois cas mesurés du §1.2 du plan                               */
/* ------------------------------------------------------------------ */

describe('#291 · les trois cas du constat, avec leurs sorties nouvelles', () => {
    it('cas A · même id deux fois → collision-id (l\'ancien code rendait [])', () => {
        const liste = [{ id: 'X1', nom: 'G' }, { id: 'X1', nom: 'G' }];
        const groupes = win.analyserDoublons(liste, 'nom');

        expect(groupes).toHaveLength(1);
        expect(groupes[0].categorie).toBe('collision-id');
        expect(groupes[0].count).toBe(2);
        // Les DEUX exemplaires sont marqués : c'est ce qui permet au bandeau de
        // dire lesquels sont lesquels.
        expect(groupes[0].exemplaires.map(e => e.collisionId)).toEqual([true, true]);
    });

    it('cas B · copie (id neuf + idOriginal) → copie', () => {
        const liste = [{ id: 'X1', nom: 'G' }, { id: 'X2', idOriginal: 'X1', nom: 'G' }];
        const groupes = win.analyserDoublons(liste, 'nom');

        expect(groupes).toHaveLength(1);
        expect(groupes[0].categorie).toBe('copie');
        // Une seule lignée : les deux exemplaires descendent du même original.
        expect(groupes[0].exemplaires.map(e => e.lignee)).toEqual([1, 1]);
        expect(groupes[0].exemplaires.every(e => e.collisionId === false)).toBe(true);
    });

    it('cas C · homonymes légitimes (#450) → homonymes, PAS copie', () => {
        const liste = [
            { id: 'A', nom: 'IDME et niv 0' },
            { id: 'B', nom: 'IDME et niv 0' }
        ];
        const groupes = win.analyserDoublons(liste, 'nom');

        expect(groupes).toHaveLength(1);
        expect(groupes[0].categorie).toBe('homonymes');
        // Deux lignées distinctes : deux entités réellement différentes.
        expect(groupes[0].exemplaires.map(e => e.lignee)).toEqual([1, 2]);
    });

    it('B et C ne sortent plus indiscernables — c\'était le cœur du défaut', () => {
        const b = win.analyserDoublons(
            [{ id: 'X1', nom: 'G' }, { id: 'X2', idOriginal: 'X1', nom: 'G' }], 'nom');
        const c = win.analyserDoublons(
            [{ id: 'A', nom: 'G' }, { id: 'B', nom: 'G' }], 'nom');

        expect(b[0].categorie).not.toBe(c[0].categorie);
    });
});

/* ------------------------------------------------------------------ */
/* identitesDe — les quatre formes réellement posées par le code       */
/* ------------------------------------------------------------------ */

describe('identitesDe · les quatre porteurs d\'identité du corpus', () => {
    it('collecte id, idOriginal, inspireDe.idOriginal et inspireDe.sourceId', () => {
        const jetons = win.identitesDe({
            id: 'ID',
            idOriginal: 'ORIG',
            inspireDe: { idOriginal: 'PAQUET', sourceId: 'SOURCE', nom: 'x', auteur: 'y' }
        });
        expect([...jetons].sort()).toEqual(['ID', 'ORIG', 'PAQUET', 'SOURCE']);
    });

    it('`inspireDeTrimestre` n\'est PAS une identité (c\'est un id de trimestre)', () => {
        // pratiques-gestion.js:662 pose `inspireDeTrimestre = srcId` à l'import
        // inter-trimestre. Le confondre avec une identité d'item ferait passer
        // pour « copies » toutes les pratiques importées du même trimestre.
        const jetons = win.identitesDe({ id: 'P1', inspireDeTrimestre: 'a2025' });
        expect([...jetons]).toEqual(['P1']);

        const liste = [
            { id: 'P1', nom: 'Pratique', inspireDeTrimestre: 'a2025' },
            { id: 'P2', nom: 'Pratique', inspireDeTrimestre: 'a2025' }
        ];
        expect(win.analyserDoublons(liste, 'nom')[0].categorie).toBe('homonymes');
    });

    it('`inspireDe` en STRING brute ne casse rien et ne crée aucune identité', () => {
        // formaterInspireDe tolère les deux formes ; du matériel ancien peut
        // porter une string là où le schéma CC attend un objet.
        const jetons = win.identitesDe({ id: 'P1', inspireDe: 'Inspiré de machin' });
        expect([...jetons]).toEqual(['P1']);
    });

    it('item nul, non-objet, ou sans identifiant → Set vide', () => {
        expect(win.identitesDe(null).size).toBe(0);
        expect(win.identitesDe(undefined).size).toBe(0);
        expect(win.identitesDe('grille').size).toBe(0);
        expect(win.identitesDe({ nom: 'sans id' }).size).toBe(0);
    });

    it('les jetons non-chaînes ou vides sont écartés (pas d\'identité fantôme)', () => {
        const jetons = win.identitesDe({ id: '  ID  ', idOriginal: '   ', inspireDe: { sourceId: 42 } });
        expect([...jetons]).toEqual(['ID']);
    });
});

/* ------------------------------------------------------------------ */
/* memeIdentite                                                        */
/* ------------------------------------------------------------------ */

describe('memeIdentite', () => {
    it('vrai dès qu\'un jeton se recoupe, quel que soit le porteur', () => {
        expect(win.memeIdentite({ id: 'X' }, { id: 'Y', idOriginal: 'X' })).toBe(true);
        expect(win.memeIdentite({ id: 'X' }, { id: 'Y', inspireDe: { sourceId: 'X' } })).toBe(true);
        expect(win.memeIdentite({ id: 'X' }, { id: 'Y', inspireDe: { idOriginal: 'X' } })).toBe(true);
        // deux copies du même original, sans lien direct entre elles
        expect(win.memeIdentite({ id: 'Y', idOriginal: 'X' }, { id: 'Z', idOriginal: 'X' })).toBe(true);
    });

    it('faux entre deux entités distinctes, et faux si un côté n\'a aucun jeton', () => {
        expect(win.memeIdentite({ id: 'A' }, { id: 'B' })).toBe(false);
        expect(win.memeIdentite({ id: 'A' }, { nom: 'sans id' })).toBe(false);
        expect(win.memeIdentite(null, { id: 'A' })).toBe(false);
        expect(win.memeIdentite({ nom: 'x' }, { nom: 'y' })).toBe(false);
    });
});

/* ------------------------------------------------------------------ */
/* Transitivité                                                        */
/* ------------------------------------------------------------------ */

describe('lignées · fermeture transitive', () => {
    it('X ← Y ← Z : une seule lignée, alors que X et Z n\'ont aucun jeton commun', () => {
        const X = { id: 'X', nom: 'Artefact 7' };
        const Y = { id: 'Y', idOriginal: 'X', nom: 'Artefact 7' };
        const Z = { id: 'Z', idOriginal: 'Y', nom: 'Artefact 7' };

        // Le lien direct manque bien entre les deux extrémités…
        expect(win.memeIdentite(X, Z)).toBe(false);
        // …et pourtant les trois sont une seule lignée.
        const groupes = win.analyserDoublons([X, Y, Z], 'nom');
        expect(groupes[0].categorie).toBe('copie');
        expect(groupes[0].exemplaires.map(e => e.lignee)).toEqual([1, 1, 1]);
    });

    it('groupe MIXTE : deux copies + un homonyme → classé « copie », lignées distinctes', () => {
        // Un groupe mixte prend la catégorie la plus grave qu'il contient ; le
        // détail par exemplaire dit lesquels sont concernés.
        const liste = [
            { id: 'X', nom: 'Grille FR' },
            { id: 'Y', idOriginal: 'X', nom: 'Grille FR' },
            { id: 'Q', nom: 'Grille FR' }
        ];
        const g = win.analyserDoublons(liste, 'nom')[0];
        expect(g.categorie).toBe('copie');
        expect(g.exemplaires.map(e => e.lignee)).toEqual([1, 1, 2]);
    });

    it('collision d\'id l\'emporte sur la copie (gravité décroissante)', () => {
        const liste = [
            { id: 'X', nom: 'G' },
            { id: 'X', nom: 'G' },
            { id: 'Y', idOriginal: 'X', nom: 'G' }
        ];
        expect(win.analyserDoublons(liste, 'nom')[0].categorie).toBe('collision-id');
    });
});

/* ------------------------------------------------------------------ */
/* Regroupement par nom : casse, espaces, champ titre                  */
/* ------------------------------------------------------------------ */

describe('analyserDoublons · regroupement par nom', () => {
    it('insensible à la casse et aux espaces de bord ou multiples', () => {
        const liste = [
            { id: 'A', nom: 'Artefact 7' },
            { id: 'B', nom: '  ARTEFACT   7 ' }
        ];
        const groupes = win.analyserDoublons(liste, 'nom');
        expect(groupes).toHaveLength(1);
        // Le nom AFFICHÉ reste celui du premier exemplaire, tel que stocké.
        expect(groupes[0].nom).toBe('Artefact 7');
    });

    it('champNom = "titre" pour les productions — seule différence entre les 5 détecteurs', () => {
        const liste = [{ id: 'A', titre: 'Dissertation' }, { id: 'B', titre: 'Dissertation' }];
        expect(win.analyserDoublons(liste, 'titre')).toHaveLength(1);
        // Avec le mauvais champ, aucun nom n'est lisible : zéro groupe, pas un plantage.
        expect(win.analyserDoublons(liste, 'nom')).toHaveLength(0);
    });

    it('champNom par défaut = "nom"', () => {
        expect(win.analyserDoublons([{ id: 'A', nom: 'G' }, { id: 'B', nom: 'G' }])).toHaveLength(1);
    });

    it('les noms vides ou absents ne forment jamais un groupe', () => {
        const liste = [
            { id: 'A', nom: '' }, { id: 'B', nom: '   ' },
            { id: 'C' }, { id: 'D', nom: null }
        ];
        expect(win.analyserDoublons(liste, 'nom')).toEqual([]);
    });

    it('un nom unique ne sort pas', () => {
        expect(win.analyserDoublons([{ id: 'A', nom: 'Seule' }], 'nom')).toEqual([]);
    });

    it('l\'ID court est celui de l\'affichage (6 derniers caractères)', () => {
        const g = win.analyserDoublons([
            { id: 'GRILLE_1755900000_a_b209ef', nom: 'G' },
            { id: 'GRILLE_1755900001_a_6fdd43', nom: 'G' }
        ], 'nom')[0];
        expect(g.exemplaires.map(e => e.idCourt)).toEqual(['b209ef', '6fdd43']);
    });
});

/* ------------------------------------------------------------------ */
/* Robustesse                                                          */
/* ------------------------------------------------------------------ */

describe('analyserDoublons · entrées hostiles', () => {
    it('non-tableau → [] plutôt qu\'un plantage', () => {
        expect(win.analyserDoublons(null, 'nom')).toEqual([]);
        expect(win.analyserDoublons(undefined, 'nom')).toEqual([]);
        expect(win.analyserDoublons('grilles', 'nom')).toEqual([]);
        expect(win.analyserDoublons({ 0: { id: 'A', nom: 'G' } }, 'nom')).toEqual([]);
    });

    it('entrées nulles ou non-objets écartées sans casser le reste', () => {
        const liste = [null, { id: 'A', nom: 'G' }, undefined, 'texte', 42, { id: 'B', nom: 'G' }];
        const groupes = win.analyserDoublons(liste, 'nom');
        expect(groupes).toHaveLength(1);
        expect(groupes[0].count).toBe(2);
    });

    it('items sans `id` : regroupés par nom, jamais fusionnés par identité', () => {
        const liste = [{ nom: 'G' }, { nom: 'G' }];
        const g = win.analyserDoublons(liste, 'nom')[0];
        expect(g.categorie).toBe('homonymes');
        expect(g.exemplaires.map(e => e.id)).toEqual(['', '']);
        expect(g.exemplaires.map(e => e.idCourt)).toEqual(['?', '?']);
        // Un `id` vide n'est pas une collision : deux « rien » ne se collisionnent pas.
        expect(g.exemplaires.every(e => e.collisionId === false)).toBe(true);
    });

    it('liste vide → []', () => {
        expect(win.analyserDoublons([], 'nom')).toEqual([]);
    });
});

/* ------------------------------------------------------------------ */
/* reunirSources — le garde-fou anti fausses collisions                */
/* ------------------------------------------------------------------ */

describe('reunirSources · le même objet vu de deux magasins n\'est pas une collision', () => {
    it('même id dans la sélection ET dans la bibliothèque partagée → UN exemplaire', () => {
        // `ajouterGrilleALaBibliotheque` verse la grille dans le magasin partagé
        // en conservant son `id`. Sans ce helper, chaque grille que Grégoire a
        // publiée serait classée « collision d'identifiant ».
        const locale = { id: 'G1', nom: 'Grille FR' };
        const partagee = { id: 'G1', nom: 'Grille FR', dansBibliotheque: true, dateAjoutBiblio: 'x' };

        const reunies = win.reunirSources([locale], [partagee]);
        expect(reunies).toHaveLength(1);
        expect(reunies[0]).toBe(locale);   // le premier magasin fait foi
        // …et donc aucun groupe de doublon n'est signalé.
        expect(win.analyserDoublons(reunies, 'nom')).toEqual([]);
    });

    it('RÉGRESSION : concaténer sans réunir produirait la fausse collision', () => {
        // Ce test dit pourquoi `reunirSources` existe. Il échouerait si on
        // rebranchait un jour les appelants sur une simple concaténation.
        const locale = { id: 'G1', nom: 'Grille FR' };
        const partagee = { id: 'G1', nom: 'Grille FR' };
        const naif = win.analyserDoublons([locale, partagee], 'nom');
        expect(naif[0].categorie).toBe('collision-id');       // le piège…
        expect(win.analyserDoublons(win.reunirSources([locale], [partagee]), 'nom')).toEqual([]); // …et la parade
    });

    it('même id DEUX FOIS dans le MÊME magasin → la collision survit', () => {
        const a = { id: 'G1', nom: 'Grille FR' };
        const b = { id: 'G1', nom: 'Grille FR' };
        const reunies = win.reunirSources([a, b], []);
        expect(reunies).toHaveLength(2);
        expect(win.analyserDoublons(reunies, 'nom')[0].categorie).toBe('collision-id');
    });

    it('collision dans le SECOND magasin, alors que le premier a l\'id une fois', () => {
        // Cas retors : le maximum par magasin, pas la somme, et pas le premier
        // magasin seul. Deux exemplaires attendus, donc une collision visible.
        const locale = { id: 'G1', nom: 'G' };
        const p1 = { id: 'G1', nom: 'G' };
        const p2 = { id: 'G1', nom: 'G' };
        const reunies = win.reunirSources([locale], [p1, p2]);
        expect(reunies).toHaveLength(2);
        expect(win.analyserDoublons(reunies, 'nom')[0].categorie).toBe('collision-id');
    });

    it('une copie (id neuf + idOriginal) reste visible à travers la réunion', () => {
        // Le parcours réel de Grégoire : la grille partagée G1 est ajoutée à sa
        // sélection, ce qui crée G2 (idOriginal: G1). Les deux doivent sortir.
        const copieLocale = { id: 'G2', idOriginal: 'G1', nom: 'Grille FR' };
        const partagee = { id: 'G1', nom: 'Grille FR' };
        const g = win.analyserDoublons(win.reunirSources([copieLocale], [partagee]), 'nom')[0];
        expect(g.categorie).toBe('copie');
        expect(g.count).toBe(2);
    });

    it('les items sans id sont tous retenus (rien ne permet de les rapprocher)', () => {
        const reunies = win.reunirSources([{ nom: 'G' }], [{ nom: 'G' }]);
        expect(reunies).toHaveLength(2);
    });

    it('ordre préservé, magasin par magasin, dans l\'ordre des arguments', () => {
        const reunies = win.reunirSources(
            [{ id: 'A', nom: 'a' }, { id: 'B', nom: 'b' }],
            [{ id: 'C', nom: 'c' }]);
        expect(reunies.map(i => i.id)).toEqual(['A', 'B', 'C']);
    });

    it('entrées hostiles : non-tableaux, nuls, aucun argument', () => {
        expect(win.reunirSources()).toEqual([]);
        expect(win.reunirSources(null, undefined, 'texte')).toEqual([]);
        expect(win.reunirSources([null, { id: 'A', nom: 'a' }, 42])).toHaveLength(1);
    });

    it('ne mute ni les listes ni les items', () => {
        const listes = [[{ id: 'A', nom: 'a' }], [{ id: 'A', nom: 'a' }]];
        const avant = JSON.parse(JSON.stringify(listes));
        win.reunirSources(listes[0], listes[1]);
        expect(listes).toEqual(avant);
        expect(listes[0]).toHaveLength(1);
    });
});

/* ------------------------------------------------------------------ */
/* Pureté                                                              */
/* ------------------------------------------------------------------ */

describe('pureté · aucune entrée n\'est mutée', () => {
    it('analyserDoublons ne touche ni la liste ni les items', () => {
        const liste = [
            { id: 'X', nom: 'G' },
            { id: 'Y', idOriginal: 'X', nom: 'G' },
            { id: 'X', nom: 'G' }
        ];
        const avant = JSON.parse(JSON.stringify(liste));
        win.analyserDoublons(liste, 'nom');
        expect(liste).toEqual(avant);
        expect(liste).toHaveLength(3);
    });

    it('classerGroupe et memeIdentite ne mutent pas non plus', () => {
        const a = { id: 'X', nom: 'G' };
        const b = { id: 'Y', idOriginal: 'X', nom: 'G' };
        const avant = JSON.parse(JSON.stringify([a, b]));
        win.classerGroupe([a, b]);
        win.memeIdentite(a, b);
        expect([a, b]).toEqual(avant);
    });

    it('l\'exemplaire rendu référence l\'item d\'origine sans le copier', () => {
        const item = { id: 'X', nom: 'G' };
        const g = win.analyserDoublons([item, { id: 'Y', nom: 'G' }], 'nom')[0];
        expect(g.exemplaires[0].item).toBe(item);
    });
});

/* ------------------------------------------------------------------ */
/* classerGroupe appelé seul                                           */
/* ------------------------------------------------------------------ */

describe('classerGroupe · appel direct', () => {
    it('moins de deux exemplaires → homonymes (rien à signaler)', () => {
        expect(win.classerGroupe([])).toBe('homonymes');
        expect(win.classerGroupe([{ id: 'A' }])).toBe('homonymes');
        expect(win.classerGroupe(null)).toBe('homonymes');
    });
});

/* ------------------------------------------------------------------ */
/* Parité de l'ID court avec l'UI                                      */
/* ------------------------------------------------------------------ */

describe('cohérence avec BibliothequeUI', () => {
    it('l\'ID court du module et celui de l\'UI rendent la même chose', () => {
        // Le bandeau et les cartes doivent afficher le MÊME fragment, sinon
        // « repère l'ID #b209ef dans la liste » redevient impossible.
        const ui = chargerScript('js/bibliotheque-ui.js').BibliothequeUI;
        for (const id of ['GRILLE_1755900000_a_b209ef', 'court', 'abcdef', '', 'exactement6']) {
            const g = win.analyserDoublons(
                [{ id: id, nom: 'G' }, { id: id + 'zz', nom: 'G' }], 'nom')[0];
            expect(g.exemplaires[0].idCourt, `id=${JSON.stringify(id)}`)
                .toBe(ui.genererIdCourt(id));
        }
    });

    it('le module est bien chargé par index.html', () => {
        const html = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
        expect(html).toMatch(/<script src="js\/identite-item\.js/);
    });
});
