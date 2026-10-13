import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * #784 (11 oct. 2026) — un élément du HTML STATIQUE logé dans un conteneur que le JS RÉÉCRIT
 * (`innerHTML =`) disparaît au premier rendu (le bouton « Reporter dans Léa » de la 1.124.0).
 * Rend la liste triée « id-du-conteneur » des conteneurs qui :
 *   - sont réécrits par js/ : `getElementById('X').innerHTML =`, ou `const v = …getElementById('X')`
 *     suivi, dans le même fichier, de `v.innerHTML =` ;
 *   - et portent dans index.html, entre leur balise ouvrante et leur fermante, au moins un
 *     descendant à `id=` ou à `data-action=` (ce qui serait détruit).
 * Approximation assumée : le nom de variable est lu fichier par fichier, sans portée.
 */
/** Fin du bloc `{…}` qui contient la position `i` (accolades appariées, chaînes non lues). */
function finDuBloc(s, i) {
    let prof = 0;
    for (let j = i; j < s.length; j++) {
        if (s[j] === '{') prof++;
        else if (s[j] === '}' && --prof < 0) return j;
    }
    return s.length;
}

export function conteneursRegeneres(racine) {
    const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
    const fichiers = [
        ...readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js')).map((f) => 'js/' + f),
        ...readdirSync(path.join(racine, 'js', 'pratiques')).filter((f) => f.endsWith('.js')).map((f) => 'js/pratiques/' + f)
    ];
    const reecrits = new Set();
    for (const f of fichiers) {
        const s = readFileSync(path.join(racine, f), 'utf8');
        for (const m of s.matchAll(/getElementById\('([\w-]+)'\)\.innerHTML\s*=/g)) reecrits.add(m[1]);
        for (const m of s.matchAll(/(?:const|let|var)\s+([\w$]+)\s*=\s*document\.getElementById\('([\w-]+)'\)/g)) {
            // #784, lot 23 (12 oct. 2026) : la réécriture se cherche dans la PORTÉE de la
            // déclaration (son bloc englobant), plus dans tout le fichier — sept des neuf
            // conteneurs du 11 oct. étaient des homonymes réécrits par une autre fonction.
            const portee = s.slice(m.index, finDuBloc(s, m.index));
            if (new RegExp(`\\b${m[1].replace(/\$/g, '\\$')}\\.innerHTML\\s*=`).test(portee)) reecrits.add(m[2]);
        }
    }
    const sortie = [];
    for (const id of reecrits) {
        const ouvre = html.search(new RegExp(`<(\\w+)[^>]*\\bid="${id}"`));
        if (ouvre < 0) continue;
        const balise = /<(\w+)/.exec(html.slice(ouvre))[1];
        // Fin de l'élément : on compte les balises de même nom ouvertes et fermées.
        const re = new RegExp(`<${balise}\\b|</${balise}>`, 'g');
        re.lastIndex = ouvre + 1;
        let profondeur = 1, m, fin = -1;
        const debutContenu = html.indexOf('>', ouvre) + 1;
        while ((m = re.exec(html))) {
            if (m[0].startsWith('</')) { if (--profondeur === 0) { fin = m.index; break; } } else profondeur++;
        }
        if (fin < 0) continue;
        const contenu = html.slice(debutContenu, fin).replace(/<!--[\s\S]*?-->/g, '');
        if (/\bid="|\bdata-action="/.test(contenu)) sortie.push(id);
    }
    return sortie.sort();
}
