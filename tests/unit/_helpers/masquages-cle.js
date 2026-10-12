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

/**
 * #642, lot 23 (12 oct. 2026) — le TRI : un masquage n'est un défaut que si un appel `cle(…)` vit
 * dans sa portée (il viserait alors la variable). Rend la liste « fichier:ligne » de ceux-là.
 * Portée : le corps de la fonction (paramètre), le corps ou l'expression de la flèche, le bloc
 * englobant (`const|let|var`), le corps de la boucle (`for (const cle of|in …)`). Approximation
 * assumée : accolades appariées sans lire les chaînes (aucun faux positif mesuré le 12 oct.).
 */
export function masquagesActifs(racine) {
    const fichiers = [
        ...readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js')).map((f) => 'js/' + f),
        ...readdirSync(path.join(racine, 'js', 'pratiques')).filter((f) => f.endsWith('.js')).map((f) => 'js/pratiques/' + f)
    ];
    const noms = (liste) => liste.split(',').map((p) => p.split('=')[0]).flatMap((p) => p.match(/[A-Za-z_$][\w$]*/g) || []);
    const apparier = (s, i) => {
        let prof = 0;
        for (let j = i; j < s.length; j++) {
            if (s[j] === '{') prof++;
            else if (s[j] === '}' && --prof === 0) return j;
        }
        return s.length;
    };
    const blocEnglobant = (s, i) => {
        let prof = 0;
        for (let j = i; j >= 0; j--) {
            if (s[j] === '}') prof++;
            else if (s[j] === '{') { if (prof === 0) return apparier(s, j); prof--; }
        }
        return s.length;
    };
    const finExpression = (s, k) => (s[k] === '{' ? apparier(s, k) : (s.indexOf('\n', k) < 0 ? s.length : s.indexOf('\n', k)));
    const actifs = [];
    for (const f of fichiers) {
        // Commentaires blanchis à longueur égale : les positions (et les lignes) restent justes.
        const s = readFileSync(path.join(racine, f), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
            .replace(/(^|[^:\\])(\/\/[^\n]*)/g, (m, a, b) => a + ' '.repeat(b.length));
        const sites = [];
        for (const m of s.matchAll(/function\s*[\w$]*\s*\(([^)]*)\)\s*\{/g)) {
            if (noms(m[1]).includes('cle')) sites.push([m.index, m.index + m[0].length - 1, apparier(s, m.index + m[0].length - 1)]);
        }
        for (const m of s.matchAll(/\(([^()]*)\)\s*=>\s*/g)) {
            if (noms(m[1]).includes('cle')) { const k = m.index + m[0].length; sites.push([m.index, k, finExpression(s, k)]); }
        }
        for (const m of s.matchAll(/(?<![\w$.])cle\s*=>\s*/g)) {
            const k = m.index + m[0].length; sites.push([m.index, k, finExpression(s, k)]);
        }
        for (const m of s.matchAll(/\b(?:const|let|var)\s+cle\b/g)) {
            const avant = s.slice(Math.max(0, m.index - 6), m.index);
            const fin = (avant.includes('for') && avant.includes('(')) ? apparier(s, s.indexOf('{', m.index)) : blocEnglobant(s, m.index);
            sites.push([m.index, m.index + m[0].length, fin]);
        }
        for (const [debut, a, b] of sites) {
            if (/(?<![\w$.])cle\s*\(/.test(s.slice(a, b))) actifs.push(f + ':' + (s.slice(0, debut).split('\n').length));
        }
    }
    return actifs;
}
