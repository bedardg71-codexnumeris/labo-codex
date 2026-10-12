import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * #642 (11 oct. 2026) — les MASQUAGES du helper global `cle()` dans js/ : une déclaration locale
 * nommée `cle` couvre toute sa portée, et tout appel `cle('…')` à l'intérieur vise la variable,
 * pas le namespacing (le remède par alias échoue, mesuré par la fiche). Les cinq formes de la
 * fiche : paramètre de fonction ; paramètre de flèche entre parenthèses ; flèche sans
 * parenthèses (`cle => …`) ; `const|let|var cle` ; variable de boucle `for (… cle of|in …)`.
 * Une valeur par défaut (`k = cle('x')`) n'est PAS un masquage : seul le nom du paramètre compte.
 * Rend { "fichier": nombre } pour les fichiers qui en portent.
 */
export function masquagesDeCle(racine) {
    const fichiers = [
        ...readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js')).map((f) => 'js/' + f),
        ...readdirSync(path.join(racine, 'js', 'pratiques')).filter((f) => f.endsWith('.js')).map((f) => 'js/pratiques/' + f)
    ];
    const nomsDeParametres = (liste) => liste.split(',').map((p) => p.split('=')[0])
        .flatMap((p) => p.match(/[A-Za-z_$][\w$]*/g) || []);
    const comptes = {};
    for (const f of fichiers) {
        const s = readFileSync(path.join(racine, f), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:\\])\/\/[^\n]*/g, '$1');
        let n = 0;
        for (const m of s.matchAll(/function\s*[\w$]*\s*\(([^)]*)\)/g)) if (nomsDeParametres(m[1]).includes('cle')) n++;
        for (const m of s.matchAll(/\(([^()]*)\)\s*=>/g)) if (nomsDeParametres(m[1]).includes('cle')) n++;
        n += (s.match(/(?<![\w$.])cle\s*=>/g) || []).length;
        n += (s.match(/\b(?:const|let|var)\s+cle\b/g) || []).length;
        if (n) comptes[f] = n;
    }
    return comptes;
}
