import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// RATCHET — L'ORDRE DES ÉCOUTEURS DANS L'INSPECTEUR
// =======================================================================
//
// `ouvrirPanneau` construit le panneau par ACCUMULATION : une quinzaine de
// blocs conditionnels font `extra.innerHTML += …` selon le type du nœud.
//
// ⚠ CHAQUE `innerHTML +=` RE-SÉRIALISE TOUT LE CONTENEUR. Les nœuds DOM
// existants sont détruits et recréés à partir de leur texte — et un écouteur
// attaché à l'un d'eux disparaît avec lui, sans erreur, sans avertissement.
// Le contrôle reste à l'écran, il se coche, il ne fait RIEN.
//
// ⚠⚠ CE DÉFAUT EST ARRIVÉ TROIS FOIS DANS CE FICHIER :
//   1. « Dans la leçon » (6 août 2026) ;
//   2. Rétroaction et Production sur un nœud Évaluation (#424 Lot E) — le
//      commentaire qui le raconte est toujours à sa place dans la source ;
//   3. « Travail hors classe » (#416 lot B, 12 août) — trouvé par la PORTE
//      TERRAIN, pas par les tests. La sentinelle du lot vérifiait la porte
//      d'écriture, qui était juste ; personne ne vérifiait le fil entre la
//      case et cette porte.
//
// D'où ce ratchet. Il ne teste aucune fonctionnalité : il teste que la source
// respecte l'ordre qui rend les fonctionnalités atteignables.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
    path.resolve(__dirname, '..', '..', 'js', 'planification-carte.js'), 'utf8');

/** Le corps de `ouvrirPanneau`, de sa signature à la fonction suivante. */
function corpsOuvrirPanneau() {
    const debut = source.indexOf('function ouvrirPanneau(id)');
    expect(debut).toBeGreaterThan(-1);
    const fin = source.indexOf('\nfunction ', debut + 100);
    expect(fin).toBeGreaterThan(debut);
    return source.slice(debut, fin);
}

describe('Ratchet · aucun écouteur n’est attaché avant la dernière écriture du panneau', () => {
    it('la dernière écriture `extra.innerHTML` précède TOUS les écouteurs sur `extra`', () => {
        const corps = corpsOuvrirPanneau();

        const ecritures = [...corps.matchAll(/extra\.innerHTML\s*\+?=/g)].map((m) => m.index);
        expect(ecritures.length).toBeGreaterThan(5);
        const derniereEcriture = Math.max(...ecritures);

        // Un écouteur attaché à un élément retrouvé DANS `extra` — quelle que
        // soit la forme : chaînée, ou passée par une variable.
        const attaches = [
            ...corps.matchAll(/extra\.querySelector\([^)]*\)\.addEventListener/g),
            ...corps.matchAll(/extra\.querySelectorAll\([^)]*\)\.forEach/g)
        ].map((m) => ({ index: m.index, extrait: m[0] }));

        const tropTot = attaches.filter((a) => a.index < derniereEcriture);

        expect(
            tropTot.map((a) => a.extrait),
            'Écouteur attaché AVANT la dernière écriture de `extra` : il sera ' +
            'détruit par la re-sérialisation. Déplacer l’attache en fin de ' +
            '`ouvrirPanneau`, avec les autres.'
        ).toEqual([]);
    });

    it('les cases à cocher du panneau attachent leur écouteur par VARIABLE, en fin', () => {
        const corps = corpsOuvrirPanneau();
        const derniereEcriture = Math.max(
            ...[...corps.matchAll(/extra\.innerHTML\s*\+?=/g)].map((m) => m.index));

        // Les deux cases du panneau, nommément — elles ont chacune cassé ou
        // failli casser pour cette raison.
        for (const id of ['planif-panneau-hors-classe', 'planif-panneau-prealable']) {
            const attache = corps.indexOf(`.addEventListener`, corps.indexOf(id));
            const declaration = corps.indexOf(`extra.querySelector('#${id}')`);

            expect(declaration, `${id} : introuvable dans ouvrirPanneau`).toBeGreaterThan(-1);
            expect(
                declaration,
                `${id} : sa recherche dans \`extra\` doit venir APRÈS la dernière ` +
                'écriture innerHTML, sinon l’écouteur qui suit sera détruit.'
            ).toBeGreaterThan(derniereEcriture);
            expect(attache).toBeGreaterThan(derniereEcriture);
        }
    });

    it('le HTML des deux cases, lui, est écrit AVEC les champs de son type', () => {
        // L'inverse serait aussi faux : le HTML doit rester dans le bloc
        // conditionnel qui décide si la case existe pour ce type de nœud.
        // Seule l'ATTACHE se déplace.
        const corps = corpsOuvrirPanneau();
        const derniereEcriture = Math.max(
            ...[...corps.matchAll(/extra\.innerHTML\s*\+?=/g)].map((m) => m.index));

        for (const id of ['planif-panneau-hors-classe', 'planif-panneau-prealable']) {
            expect(corps.indexOf(`id="${id}"`)).toBeLessThan(derniereEcriture);
        }
    });
});
