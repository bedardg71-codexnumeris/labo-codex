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

/**
 * #616, lot 23 (12 oct. 2026) — « B suit A, dans la même fonction » : la forme juste de ce que
 * `/A[\s\S]{0,N}B/` approchait par une DISTANCE en caractères (un commentaire ajouté la faisait
 * rougir sans que rien ne change ; un retrait ailleurs pouvait la faire verdir sur un code cassé).
 * Les commentaires sont blanchis ; pour CHAQUE occurrence de A, la portée est le corps de la
 * fonction qui la contient (`function …(…) {` ou `=> {`, sinon le fichier) ; vrai si les marqueurs
 * suivants y paraissent dans l'ordre. Chaque marqueur est une chaîne ou une RegExp.
 */
export function suitDansLaFonction(source, ...marqueurs) {
    const s = source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
        .replace(/(^|[^:\\'"`])(\/\/[^\n]*)/g, (m, a, b) => a + ' '.repeat(b.length));
    const chercher = (m, depuis, fin) => {
        if (typeof m === 'string') { const i = s.indexOf(m, depuis); return i >= 0 && i < fin ? [i, i + m.length] : null; }
        const re = new RegExp(m.source, m.flags.includes('g') ? m.flags : m.flags + 'g');
        re.lastIndex = depuis;
        const r = re.exec(s);
        return r && r.index < fin ? [r.index, r.index + r[0].length] : null;
    };
    const corpsEnglobant = (i) => {
        let prof = 0;
        for (let j = i; j >= 0; j--) {
            if (s[j] === '}') prof++;
            else if (s[j] === '{') {
                if (prof > 0) { prof--; continue; }
                if (/(?:function\b[^{};]*\)|=>)\s*$/.test(s.slice(Math.max(0, j - 300), j))) {
                    let p = 0;
                    for (let k = j; k < s.length; k++) {
                        if (s[k] === '{') p++;
                        else if (s[k] === '}' && --p === 0) return k;
                    }
                    return s.length;
                }
            }
        }
        return s.length;
    };
    for (let depart = 0; ;) {
        const a = chercher(marqueurs[0], depart, s.length);
        if (!a) return false;
        const fin = corpsEnglobant(a[0]);
        let pos = a[1], ok = true;
        for (const m of marqueurs.slice(1)) {
            const r = chercher(m, pos, fin);
            if (!r) { ok = false; break; }
            pos = r[1];
        }
        if (ok) return true;
        depart = a[0] + 1;
    }
}
