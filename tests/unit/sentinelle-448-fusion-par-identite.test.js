import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #448 — UNE COLLISION D'ID À L'IMPORT N'EST PAS UN ACCIDENT À RENOMMER.
//
// Mesuré sur les données réelles de Grégoire les 10-11 août 2026. L'ancien
// `verifierUniciteIds` traitait une collision comme un accident : il renommait
// le second et GARDAIT LES DEUX. Juste pour deux éléments distincts qui se
// disputent un id ; faux pour un réimport, où la collision est la preuve que
// c'est le MÊME élément.
//
// Deux formes observées dans son corpus, et les deux sont couvertes ici :
//   · collision sur une CARTOUCHE → jumeau en place, original cité 50-79 fois,
//     copie citée 0 fois (lot du 24 mars) ;
//   · collision sur une GRILLE → remap vers un id neuf, et ses cartouches
//     partent dans un magasin `cartouches_<neuf>` que rien ne référence
//     (lot du 27 juin, 8 éléments à 0/0). Un magasin fantôme.
//
// ⚠ LA RÈGLE DE PRUDENCE, ET ELLE EST ASYMÉTRIQUE. On ne fusionne que sur
// contenu STRICTEMENT identique. Croire à tort à l'identité ⇒ on ÉCARTE un
// élément et on perd ce qu'il portait : irréversible. Croire à tort à la
// différence ⇒ on garde un doublon : c'est le statu quo, et ça se nettoie.
// C'est la leçon de #442 : « ne rien casser » n'est pas « ne rien perdre ».

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceImport = readFileSync(path.join(racineProjet, 'js', 'import-export.js'), 'utf8');

function monter() {
    // La VRAIE fabrique d'ids du projet (js/main.js:33).
    const genererIdUnique = (function () {
        let compteur = 0;
        return function (prefix) {
            prefix = prefix || '';
            compteur = (compteur + 1) % 0xFFFF;
            const ts = Date.now();
            const rnd = crypto.getRandomValues(new Uint8Array(6));
            const hex = Array.from(rnd, (b) => b.toString(16).padStart(2, '0')).join('');
            return prefix + ts + '_' + compteur.toString(16) + '_' + hex;
        };
    })();
    return chargerScript('js/import-export.js', { genererIdUnique });
}

let win;
beforeEach(() => { win = monter(); });

const cartouche = (id, nom, extra = {}) => ({ id, nom, grilleId: 'G1', ...extra });

// ⚠ PIÈGE `indexOf` — trouvé le 11 août par un break-test resté VERT.
// `indexOf` rend -1 quand la chaîne est absente, et -1 est inférieur à tout
// index positif : une assertion d'ORDRE écrite naïvement passe donc quand le
// code qu'elle est censée protéger DISPARAÎT. Toute comparaison de position
// doit d'abord exiger la PRÉSENCE des deux motifs.
function ordreStrict(texte, avant, apres) {
    const i = texte.indexOf(avant);
    const j = texte.indexOf(apres);
    expect(i, `motif absent : ${avant}`).toBeGreaterThan(-1);
    expect(j, `motif absent : ${apres}`).toBeGreaterThan(-1);
    expect(i).toBeLessThan(j);
}


describe('#448 · réimporter le même codex n’ajoute plus rien', () => {

    it('⚠ LE CAS DE GRÉGOIRE : un lot réimporté à l’identique ne double plus', () => {
        const lot = () => ([
            cartouche('CART_1782504228322_2_aaa', 'Description d’un personnage'),
            cartouche('CART_1782504228322_3_bbb', '10 HOC Mécanismes et procédés'),
            cartouche('CART_1782504228322_4_ccc', 'Plan de rédaction'),
            cartouche('CART_1782504228322_5_ddd', '5 HOC')
        ]);

        const r1 = win.fusionnerParIdentite([], lot(), 'cartouches');
        expect(r1.liste).toHaveLength(4);
        expect(r1.ajoutes).toBe(4);

        const r2 = win.fusionnerParIdentite(r1.liste, lot(), 'cartouches');
        expect(r2.liste).toHaveLength(4);      // ← 8 avant le correctif
        expect(r2.ignores).toBe(4);
        expect(r2.ajoutes).toBe(0);
        expect(r2.conflits).toBe(0);
    });

    it('la progression est PLATE, pas linéaire : 2 → 2 → 2', () => {
        const lot = () => ([cartouche('CART_A', 'Structure'), cartouche('CART_B', 'Cohérence')]);
        let magasin = win.fusionnerParIdentite([], lot(), 'cartouches').liste;
        const tailles = [magasin.length];
        for (let i = 0; i < 2; i++) {
            magasin = win.fusionnerParIdentite(magasin, lot(), 'cartouches').liste;
            tailles.push(magasin.length);
        }
        expect(tailles).toEqual([2, 2, 2]);     // ← [2, 4, 6] avant le correctif
    });

    it('⚠⚠ un contenu DIFFÉRENT sous le même id est conservé, jamais écrasé', () => {
        // Le garde-fou qui compte. Perdre une donnée est irréversible ; garder
        // un doublon ne l'est pas. En cas de doute, on garde les deux.
        const existant = [cartouche('CART_X', 'Structure', { commentaire: 'version de mars' })];
        const entrant = [cartouche('CART_X', 'Structure', { commentaire: 'RÉÉCRITE en juin' })];

        const r = win.fusionnerParIdentite(existant, entrant, 'cartouches');
        expect(r.liste).toHaveLength(2);
        expect(r.conflits).toBe(1);
        expect(r.ignores).toBe(0);
        // Les deux commentaires survivent — rien n'est perdu.
        const commentaires = r.liste.map((c) => c.commentaire).sort();
        expect(commentaires).toEqual(['RÉÉCRITE en juin', 'version de mars']);
        // Et le nouvel arrivant a bien reçu un id distinct.
        expect(new Set(r.liste.map((c) => c.id)).size).toBe(2);
    });

    it('un élément réellement NOUVEAU entre normalement', () => {
        const existant = [cartouche('CART_A', 'Structure')];
        const r = win.fusionnerParIdentite(existant, [cartouche('CART_B', 'Cohérence')], 'cartouches');
        expect(r.liste).toHaveLength(2);
        expect(r.ajoutes).toBe(1);
        expect(r.ignores).toBe(0);
    });

    it('⚠ deux HOMONYMES à ids différents restent deux — le nom ne fusionne rien', () => {
        // Ses deux échelles « IDME et niv 0 » (a2025) sont citées 344 et 72
        // fois : ce sont deux ressources réellement utilisées. Un correctif
        // qui dédoublonnerait par NOM les aurait fondues et cassé 72 renvois.
        const existant = [{ id: 'ECH_1', nom: 'IDME et niv 0', niveaux: 5 }];
        const entrant = [{ id: 'ECH_2', nom: 'IDME et niv 0', niveaux: 5 }];
        const r = win.fusionnerParIdentite(existant, entrant, 'échelles');
        expect(r.liste).toHaveLength(2);
        expect(r.ajoutes).toBe(1);
        expect(r.conflits).toBe(0);
    });

    it('l’ORDRE des clés ne fait pas croire à une différence', () => {
        // JSON.stringify conserve l'ordre d'insertion : sans tri, deux objets
        // identiques écrits différemment passeraient pour un conflit, et le
        // doublon reviendrait par la fenêtre.
        const existant = [{ id: 'CART_A', nom: 'Structure', grilleId: 'G1' }];
        const entrant = [{ grilleId: 'G1', id: 'CART_A', nom: 'Structure' }];
        const r = win.fusionnerParIdentite(existant, entrant, 'cartouches');
        expect(r.liste).toHaveLength(1);
        expect(r.ignores).toBe(1);
    });

    it('le lot ENTRANT peut porter ses propres doublons d’id — le filet tient', () => {
        const r = win.fusionnerParIdentite([], [
            cartouche('CART_A', 'Structure'),
            cartouche('CART_A', 'Autre chose')
        ], 'cartouches');
        expect(r.liste).toHaveLength(2);
        expect(new Set(r.liste.map((c) => c.id)).size).toBe(2);
    });

    it('une collection vide ou absente ne fait rien exploser', () => {
        expect(win.fusionnerParIdentite(null, null, 'x').liste).toEqual([]);
        expect(win.fusionnerParIdentite([], [], 'x').liste).toEqual([]);
    });
});

describe('#448 · signatureContenu', () => {
    it('trie les clés récursivement', () => {
        const a = { b: 1, a: { d: 2, c: 3 } };
        const b = { a: { c: 3, d: 2 }, b: 1 };
        expect(win.signatureContenu(a)).toBe(win.signatureContenu(b));
    });

    it('ignore les champs demandés', () => {
        expect(win.signatureContenu({ id: 'X', n: 1 }, ['id']))
            .toBe(win.signatureContenu({ id: 'Y', n: 1 }, ['id']));
    });

    it('⚠ une valeur non sérialisable rend null — et null ne conclut JAMAIS à l’identité', () => {
        const cyclique = { n: 1 };
        cyclique.moi = cyclique;
        expect(win.signatureContenu(cyclique)).toBeNull();
        // Deux objets cycliques donnent null tous les deux : si le code
        // comparait bêtement `sigA === sigB`, il conclurait à l'identité et
        // ÉCARTERAIT un élément. La garde `sigA !== null` est vitale.
        expect(sourceImport).toMatch(/sigEnPlace !== null && sigEnPlace === sigEntrant/);
    });
});

describe('#448 · les invariants de source', () => {
    it('⚠ plus AUCUNE fusion d’import par renommage', () => {
        // Neuf sites appelaient `verifierUniciteIds([...existants, ...entrants])`.
        // Chacun était un endroit où réimporter doublait la collection.
        expect(sourceImport).not.toMatch(/verifierUniciteIds\(\[\.\.\./);
    });

    it('les cinq familles passent par la fusion par identité', () => {
        for (const famille of ['cartouches', 'grilles', 'échelles', 'productions', 'pratiques']) {
            expect(sourceImport).toMatch(
                new RegExp("fusionnerParIdentite\\([^)]*'" + famille + "'")
            );
        }
    });

    it('⚠⚠ une GRILLE identique n’est plus remappée — sinon magasin fantôme', () => {
        // La forme la plus insidieuse : remapper une grille identique déplace
        // ses cartouches vers `cartouches_<nouvelId>` que rien ne référence.
        // Rien ne double à l'écran ; un magasin entier devient orphelin.
        const bloc = sourceImport.slice(
            sourceImport.indexOf('// 2. Importer les grilles'),
            sourceImport.indexOf('// 3. Importer les productions')
        );
        expect(bloc).toMatch(/signatureContenu\(enPlace, \['id'\]\)/);
        // La sortie ANTICIPÉE quand la grille est identique — à ne pas
        // confondre avec le `return grille;` de fin de branche, qui existe de
        // toute façon. C'est cette ligne-ci qui empêche le magasin fantôme.
        expect(bloc).toMatch(/if \(sigA !== null && sigA === sigB\) return grille;/);
        // Le remap ne doit exister QUE sous la condition de différence.
        ordreStrict(bloc, 'sigA !== null && sigA === sigB', 'remapGrilles[ancienId] = nouvelId');
    });

    it('une ÉCHELLE identique n’est plus remappée non plus', () => {
        const bloc = sourceImport.slice(
            sourceImport.indexOf('// 1. Importer les échelles'),
            sourceImport.indexOf('// 2. Importer les grilles')
        );
        expect(bloc).toMatch(/if \(sigA !== null && sigA === sigB\) return echelle;/);
        ordreStrict(bloc, 'sigA !== null && sigA === sigB', 'remapEchelles[ancienId] = nouvelId');
    });

    it('le compte annoncé à l’utilisateur reflète ce qui est VRAIMENT entré', () => {
        // `nbCartouchesTotal` comptait les cartouches REÇUES, pas les
        // ajoutées : après le correctif, il annoncerait un import de 8
        // cartouches quand aucune n'est entrée.
        expect(sourceImport).toMatch(/nbCartouchesTotal \+= fusionC\.ajoutes;/);
    });
});
