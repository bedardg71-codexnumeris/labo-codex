import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * #679 (11 oct. 2026) — les classes CSS que js/ pose (gabarits `class="…"`, `className = '…'`,
 * `classList.add|toggle('…')`) et qu'aucune feuille ne définit (styles.css, css/*.css, les
 * <style> d'index.html). Un morceau de gabarit interpolé (`${…}`) est sauté ; une valeur
 * construite par concaténation aussi : le détecteur ne lit que ce qui est écrit en toutes
 * lettres. Rend une liste triée « fichier:classe ».
 */
export function classesSansRegle(racine) {
    const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
    const html = lire('index.html');
    const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
    const feuilles = ['styles.css', ...readdirSync(path.join(racine, 'css')).filter((f) => f.endsWith('.css')).map((f) => 'css/' + f)];
    const css = feuilles.map(lire).join('\n') + styles;
    const definies = new Set([...css.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)].map((m) => m[1]));
    const nom = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
    const fichiers = [
        ...readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js')).map((f) => 'js/' + f),
        ...readdirSync(path.join(racine, 'js', 'pratiques')).filter((f) => f.endsWith('.js')).map((f) => 'js/pratiques/' + f)
    ];
    const sortie = new Set();
    for (const f of fichiers) {
        const s = lire(f);
        const poser = (t) => { if (nom.test(t) && !definies.has(t)) sortie.add(f + ':' + t); };
        for (const m of s.matchAll(/class="([^"]*)"/g)) {
            const v = m[1].replace(/\$\{[^}]*\}/g, ' ');
            if (v.includes("'") || v.includes('+')) continue;
            v.split(/\s+/).forEach(poser);
        }
        for (const m of s.matchAll(/className\s*=\s*'([^'+]*)'/g)) m[1].split(/\s+/).forEach(poser);
        for (const m of s.matchAll(/classList\.(?:add|toggle)\('([\w-]+)'/g)) poser(m[1]);
    }
    return [...sortie].sort();
}
