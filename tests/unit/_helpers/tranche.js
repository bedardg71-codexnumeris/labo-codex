/**
 * tranche.js — découper un fichier source entre deux marqueurs, en REFUSANT
 * de rendre une tranche vide (#858, règle 10 du PROTOCOLE).
 *
 * POURQUOI CE HELPER EXISTE (13 septembre 2026).
 * Un banc qui cherche une ABSENCE dans une tranche (`not.toContain`,
 * `not.toMatch`) est vrai par construction si la tranche est vide. L'idiome qui
 * la produisait passait un `indexOf` tel quel à `slice` : un marqueur disparu
 * rend −1, la tranche devient vide — ou inversée quand la fin est trouvée AVANT
 * le début — et le banc reste VERT. C'est la seule famille de défauts qui ne
 * peut pas se signaler, et le marqueur est justement ce qu'un refactor déplace.
 *
 * Ici, un marqueur introuvable JETTE en le nommant, et la fin se cherche APRÈS
 * le début : une tranche ne peut être ni vide ni inversée. Les découpes qui
 * s'en passent encore sont comptées par `sentinelle-858-decoupe-qui-refuse`,
 * dont le compte ne peut que descendre.
 */

const apercu = (m) => JSON.stringify(m.length > 60 ? m.substring(0, 57) + '…' : m);

/**
 * Position d'un marqueur dans la source ; jette s'il est absent.
 *
 * @param {string} source
 * @param {string} marqueur
 * @param {number} [depuis=0] - position où commencer la recherche
 * @returns {number}
 */
export function position(source, marqueur, depuis = 0) {
    const i = source.indexOf(marqueur, depuis);
    if (i === -1) {
        throw new Error('marqueur introuvable : ' + apercu(marqueur)
            + (depuis ? ' (cherché à partir du caractère ' + depuis + ')' : '')
            + ' — le code découpé a changé : ce banc ne mesure plus rien tant qu\'il n\'est pas réancré.');
    }
    return i;
}

/**
 * La tranche de `source` qui commence au marqueur `debut` (inclus) et s'arrête :
 *  - au premier `fin` trouvé APRÈS lui (exclu), si `fin` est une chaîne ;
 *  - `fin` caractères plus loin, si `fin` est un nombre ;
 *  - à la fin de la source, si `fin` est omis.
 * Jette si un marqueur manque, ou si la tranche compte moins de `longueurMin`
 * caractères.
 *
 * @param {string} source
 * @param {string} debut
 * @param {string|number} [fin]
 * @param {{longueurMin?: number}} [options]
 * @returns {string}
 */
export function tranche(source, debut, fin, { longueurMin = 1 } = {}) {
    const i = position(source, debut);
    let j;
    if (fin === undefined) j = source.length;
    else if (typeof fin === 'number') j = i + fin;
    else j = position(source, fin, i + debut.length);
    const t = source.substring(i, j);
    if (t.length < longueurMin) {
        throw new Error('tranche trop courte (' + t.length + ' < ' + longueurMin + ') à partir de ' + apercu(debut)
            + (typeof fin === 'string' ? ', jusqu\'à ' + apercu(fin) : '') + '.');
    }
    return t;
}
