/**
 * SENTINELLE — TOUT NOMBRE AFFICHÉ, À LA FRANÇAISE (#1137, 22 oct. 2026).
 *
 * Décision de Grégoire (22 oct., 6 h 59) : ce qui n'est pas une note suit la norme que les notes suivent depuis
 * la 1.213 — virgule décimale, espace insécable U+00A0 avant « % » et « pts ». Indices, taux, pondérations,
 * points, critères diagnostiques, axes et infobulles des graphiques, valeurs de configuration ; à l'écran et
 * dans le PDF de l'élève. Les saisies, les exports, les valeurs stockées et les calculs ne bougent pas.
 * Consigne : `plans de travail/CONSIGNE-LOT-2026-10-22-tout-a-la-virgule.md`.
 *
 * Les notes ont leur propre garde : sentinelle-note-pourcentage-affichage.test.js.
 *
 * A — les fonctions neuves du module (js/note-pourcentage.js).
 * B — l'invariant : aucun fichier de `js/` n'affiche un nombre suivi de « % » ou de « pts » sans passer par le
 *     module, hors d'une liste blanche nommée et justifiée. Un affichage ajouté demain est couvert.
 * C — un seul formateur : plus aucun `replace('.', ',')` hors du module.
 *
 * Break-tests (22 oct. 2026, code restauré ensuite, `cmp` identique) : `poids ${r.poids.toFixed(1)} %` remis dans le
 * profil et `(v * 100).toFixed(0) + '%'` remis dans une graduation de graphiques-progression.js → B rougit en nommant
 * les deux lignes ; `String(n).replace('.', ',')` remis dans miroir-algo.js → C rougit en nommant la ligne.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const MODULE = path.join('js', 'note-pourcentage.js');

function fichiersJs(d) {
    return readdirSync(path.join(racine, d)).flatMap((n) => {
        const r = path.join(d, n);
        return statSync(path.join(racine, r)).isDirectory() ? fichiersJs(r) : (r.endsWith('.js') ? [r] : []);
    });
}

/**
 * Un nombre (fin d'expression : `toFixed(n)`, une parenthèse, un identifiant, un indice) puis, sur la même ligne,
 * « % » ou « pts » collé par interpolation (`}%`, `} %`, `} pts`, `} pt`) ou par concaténation (`+ '%'`, `+ ' pts'`).
 * « pt » collé (`${7.5 * f}pt`) est une taille de police CSS, pas un point : il ne compte pas.
 */
export const NOMBRE_PUIS_SIGNE = /(toFixed\(\d\)|\)|[\w\]'"])\s*(\}(\s?%|\s?pts\b|\spt\b)|\+\s*['"`](\s?%|\s?pts\b|\spt\b))/;

/** Une ligne qui passe par le module est conforme (même règle que la sentinelle des notes). */
const PAR_LE_MODULE = /\b(formaterPourcentage|formaterNombre|formaterPoints|formaterNotePourcentage|formaterNoteNombre)\(|\bESPACE_INSECABLE\b/;

/**
 * CE QUI N'EST PAS LU : retiré de la ligne AVANT le test, pour qu'un affichage sur la même ligne reste vu.
 * Une longueur ou une fonction CSS (« width: 40% », la barre d'une jauge, un filtre d'image, l'arrêt d'un
 * dégradé) est une consigne au navigateur, pas un nombre qu'on lit.
 */
const NON_LU = [
    /\b(width|height|left|top|right|bottom|flex-basis|max-width|min-width|max-height)\s*:\s*\$\{[^}]*\}\s?%/g,
    /\b(width|height|left|top|right|bottom|flex-basis)\s*:\s*['"`]\s*\+[^+]*?\+\s*['"`]\s?%/g,
    /\.style\.(width|height|left|top)\s*=.*$/g,
    /\b(brightness|contrast)\(\$\{[^}]*\}%\)/g,
    /stops\.push\(.*$/g,
    /linear-gradient\(.*$/g,
    /console\.(warn|error|info)\(.*$/g        // le journal de la console : personne ne le lit à l'écran
];

/**
 * LA LISTE BLANCHE — `fichier` + un extrait EXACT de la ligne, et pourquoi elle garde sa forme.
 * Une saisie et un export ne sont pas de l'affichage (consigne du lot : « ce qui voyage » garde sa forme).
 */
const LISTE_BLANCHE = [
    { fichier: 'js/db.js', extrait: "'[DB #353] localStorage à ' + (stats.ratio * 100).toFixed(0) + ' % du quota '",
      motif: 'le journal de la console (avertissement #353), la ligne qui suit `console.warn(` : personne ne le lit à l’écran' },
    { fichier: 'js/export-pdf.js', extrait: "? `${(88 / nbNiveaux).toFixed(1)}%`",
      motif: 'la largeur CSS d’une colonne de niveau dans l’aperçu du PDF (`width: ${largeurNiveau}`), pas un nombre lu' },
    { fichier: 'js/export-pdf.js', extrait: ": `${((100 - 28) / nbNiveaux).toFixed(1)}%`",
      motif: 'la même largeur CSS, sans cartouche longue' },
    { fichier: 'js/materiel-creation.js', extrait: "' à ' + String(n.max.valeur).trim() + ' %)'",
      motif: 'l’écho d’une saisie : les bornes telles que la personne les a tapées dans le matériel (« 64,99 », « 85 % »), une chaîne, pas un nombre' }
];

function retirerNonLu(ligne) {
    return NON_LU.reduce((l, re) => l.replace(re, ''), ligne);
}

function fautesDe(fichiers) {
    const fautes = [];
    for (const f of fichiers) {
        if (f === MODULE || f === path.join('js', 'pack-demo-10.js')) continue;
        lire(f).split('\n').forEach((ligne, i) => {
            const t = ligne.trim();
            if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return;
            if (!NOMBRE_PUIS_SIGNE.test(retirerNonLu(ligne))) return;
            if (PAR_LE_MODULE.test(ligne)) return;
            if (LISTE_BLANCHE.some((b) => f === b.fichier && ligne.includes(b.extrait))) return;
            fautes.push(`${f}:${i + 1} : ${t.slice(0, 140)}`);
        });
    }
    return fautes;
}

describe('A — les fonctions du module : la virgule, l’insécable, la précision de l’appelant', () => {
    const w = chargerScript('js/note-pourcentage.js');

    it('formaterNombre : décimales FIXES quand l’appelant les donne, comme toFixed', () => {
        expect(w.formaterNombre(0.8234, 2)).toBe('0,82');
        expect(w.formaterNombre(12, 1)).toBe('12,0');
        expect(w.formaterNombre(2.755, 0)).toBe('3');
        expect(w.formaterNombre(1.25, 3)).toBe('1,250');
    });

    it('formaterNombre : sans décimales demandées, deux AU PLUS, sans zéro final, sans bruit binaire', () => {
        expect(w.formaterNombre(12.5)).toBe('12,5');
        expect(w.formaterNombre(40)).toBe('40');
        expect(w.formaterNombre(33.333333)).toBe('33,33');
        expect(w.formaterNombre(0.1 + 0.2)).toBe('0,3');
        expect(w.formaterNombre('7.25')).toBe('7,25');
    });

    it('zéro et négatif : « 0 », « -3,5 », jamais « -0 »', () => {
        expect(w.formaterNombre(0)).toBe('0');
        expect(w.formaterNombre(0, 1)).toBe('0,0');
        expect(w.formaterNombre(-3.5)).toBe('-3,5');
        expect(w.formaterNombre(-3.46, 1)).toBe('-3,5');
        expect(w.formaterNombre(-0.2, 0)).toBe('0');
        expect(w.formaterNombre(-0.04, 1)).toBe('0,0');
        expect(w.formaterNombre(-0.001)).toBe('0');
    });

    it('pas un nombre : rien (l’appelant garde son repli)', () => {
        for (const v of [null, undefined, '', 'abc', NaN, Infinity, -Infinity, true, false, {}]) {
            expect(w.formaterNombre(v), String(v)).toBe('');
            expect(w.formaterPourcentage(v), String(v)).toBe('');
            expect(w.formaterPoints(v), String(v)).toBe('');
        }
    });

    it('formaterPourcentage : le CARACTÈRE U+00A0 avant « % », jamais l’entité ni une espace ordinaire', () => {
        expect(w.formaterPourcentage(78)).toBe('78\u00A0%');
        expect(w.formaterPourcentage(0.823 * 100, 1)).toBe('82,3\u00A0%');
        expect(w.formaterPourcentage(65, 0)).toBe('65\u00A0%');
        expect(w.formaterPourcentage(0)).toBe('0\u00A0%');
        expect(w.formaterPourcentage(-12.5)).toBe('-12,5\u00A0%');
        const t = w.formaterPourcentage(40);
        expect(t).not.toContain('&nbsp;');
        expect(t).not.toContain(' ');
        expect(t.charCodeAt(2)).toBe(0xA0);
    });

    it('formaterPoints : une décimale fixe par défaut (la règle du PDF), sinon celle de l’appelant', () => {
        expect(w.formaterPoints(44.5)).toBe('44,5\u00A0pts');
        expect(w.formaterPoints(24)).toBe('24,0\u00A0pts');
        expect(w.formaterPoints(22.5, 0)).toBe('23\u00A0pts');
        expect(w.formaterPoints(-3, 0)).toBe('-3\u00A0pts');
    });
});

describe('B — l’invariant : aucun nombre suivi de « % » ou de « pts » hors du module', () => {
    it('dans tout js/ (hors du module et du pack démo, une donnée)', () => {
        expect(fautesDe(fichiersJs('js'))).toEqual([]);
    });

    it('chaque entrée de la liste blanche vise une ligne qui existe (sinon elle est périmée)', () => {
        for (const b of LISTE_BLANCHE) {
            expect(lire(b.fichier).includes(b.extrait), `${b.fichier} : ${b.extrait}`).toBe(true);
            expect(b.motif.length, b.extrait).toBeGreaterThan(10);
        }
    });

    it('le motif attrape les formes d’hier, et laisse le CSS (sinon B ne garderait rien)', () => {
        for (const l of [
            "callback: value => (value * 100).toFixed(0) + '%',",
            "const texteA = assiduiteInconnue ? '—' : (A * 100).toFixed(0) + '%';",
            '<strong class="profil-indicateur-valeur">${indices.A}%</strong>',
            "`poids ${r.poids.toFixed(0)} %`",
            "+ ` × ${ponderation}% = <strong>${calc.contribution.toFixed(1)} pts</strong>`;",
            "var deltaTexte = delta !== null ? ((delta >= 0 ? '+' : '') + delta + ' pts') : '—';",
            "fmt(p[0]) + ' à ' + fmt(p[1]) + ' pts';",
            "total + ' pt'",
            "`${c.points} pts`",
            "row.push(Math.round((n / total) * 100) + '%');"
        ]) expect(NOMBRE_PUIS_SIGNE.test(retirerNonLu(l)), l).toBe(true);
        for (const l of [
            "if (barre) barre.style.width = pourcent + '%';",
            '<div class="barre" style="width: ${pct}%"></div>',
            "parts.push(`brightness(${100 + op.value}%)`);",
            "const styleTextePetit = `font-size: ${7.5 * facteurTaille}pt;`;",
            "stops.push(niveau.couleur + ' ' + debut + '%');",
            "html += '<div class=\"rythme-barre\" style=\"width:' + pctBarre.toFixed(0) + '%\"></div>';"
        ]) expect(NOMBRE_PUIS_SIGNE.test(retirerNonLu(l)), l).toBe(false);
        // Le CSS retiré ne cache pas l'affichage voisin.
        expect(NOMBRE_PUIS_SIGNE.test(retirerNonLu('<div style="width: ${pct}%">${pct}%</div>'))).toBe(true);
    });
});

describe('C — un seul formateur : la virgule ne se pose qu’au module', () => {
    it('aucun `replace(\'.\', \',\')` dans js/ hors de js/note-pourcentage.js', () => {
        const VIRGULE_LOCALE = /\.replace\(\s*(['"`]\.['"`]|\/\\\.\/g?)\s*,\s*['"`],['"`]\s*\)/;
        const fautes = [];
        for (const f of fichiersJs('js')) {
            if (f === MODULE) continue;
            lire(f).split('\n').forEach((ligne, i) => {
                if (VIRGULE_LOCALE.test(ligne)) fautes.push(`${f}:${i + 1} : ${ligne.trim().slice(0, 120)}`);
            });
        }
        expect(fautes).toEqual([]);
        // Le motif reconnaît les formes rangées le 22 oct. (`_nb` du miroir, `nombreFr`, `fmt`…).
        expect(VIRGULE_LOCALE.test("return String(Math.round(Number(n) * 100) / 100).replace('.', ',');")).toBe(true);
        expect(VIRGULE_LOCALE.test("const nombreFr = (n) => String(n).replace('.', ',');")).toBe(true);
        expect(VIRGULE_LOCALE.test("x.replace(/\\./, ',')")).toBe(true);
    });
});

/**
 * D — LES POURCENTAGES ÉCRITS EN DUR (verdict de Cowork, 22 oct. 2026, point 1). Un « 60% » d'une aide se lit
 * comme un nombre, à côté d'écrans qui disent « 60 % » : la prose de `js/` (aides, descriptions des pratiques
 * prédéfinies) et le texte visible d'index.html prennent aussi l'insécable (` ` en JS, `&nbsp;` en HTML).
 * Restent tels quels : le CSS, les commentaires, et l'historique des Nouvelles publiées (changelog-data.js).
 * Le plan exporté sort de la liste blanche de B (même verdict, point 2) : c'est un document qu'on lit, pas un export
 * de données ; golden-exports-416 est refigé en conséquence.
 *
 * Break-test (22 oct. 2026, restauré, `cmp` identique) : « (≥60%) » remis dans pratiques-predefines.js et
 * « &lt; 65% » dans index.html → les deux tests de D rougissent en nommant les deux lignes.
 */
const CSS_LITTERAL = [
    /style\s*=\s*\\?["'][^"']*["']/g,                       // attribut style d'un gabarit
    /\.style\.\w+\s*=.*$/g, /setAttribute\(\s*'(width|height)'.*$/g,
    /linear-gradient\(.*$/g, /translate[XY]?\([^)]*\)/g, /calc\([^)]*\)/g,
    /<!--.*?-->/g,                                          // un commentaire HTML dans un gabarit
    /\b(x1|x2|y1|y2|offset)="[^"]*"/g,
    /\b(width|height|left|top|max-width|min-width|max-height|border-radius)\s*:\s*[\d.]+%/g,
    /console\.\w+\(.*$/g
];
/** Un chiffre, puis « % » collé ou après une espace ordinaire — pas après un identifiant (`${n}%` est l'affaire de B). */
const LITTERAL = /(^|[^\w$}).])(\d+(?:[.,]\d+)?) ?%/g;

/** Deux largeurs CSS passées par une variable (`width: ${largeurCritere}`) : la ligne ne dit pas « style ». */
const CSS_PAR_VARIABLE = [
    { fichier: 'js/export-pdf.js', extrait: "const largeurCritere = aCartoucheLongue ? '8%' : '20%';" },
    { fichier: 'js/export-pdf.js', extrait: "const largeurPond = aCartoucheLongue ? '4%' : '8%';" }
];

export function litterauxJs(texte, fichier = '') {
    const fautes = [];
    // Les commentaires de bloc sont vidés d'abord, lignes gardées (un « 25 % » d'une explication n'est pas lu).
    const sansBlocs = texte.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
    sansBlocs.split('\n').forEach((ligne, i) => {
        const t = ligne.trim();
        if (/^(\/\/|\*|\/\*)/.test(t)) return;
        if (CSS_PAR_VARIABLE.some((c) => c.fichier === fichier && ligne.includes(c.extrait))) return;
        const s = CSS_LITTERAL.reduce((l, re) => l.replace(re, ''), ligne.replace(/(^|[^:'"\\])\/\/.*$/, '$1'));
        if ([...s.matchAll(LITTERAL)].length) fautes.push(`${i + 1} : ${t.slice(0, 120)}`);
    });
    return fautes;
}

export function litterauxHtml(texte) {
    const [tete, ...reste] = texte.split('<body');
    const corps = '<body' + reste.join('<body');
    const debut = tete.split('\n').length - 1;
    // Les commentaires et les attributs qui ne se lisent pas (style, data-*, value) sont vidés, lignes gardées.
    const lisible = corps
        .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))
        .replace(/\b(style|data-[\w-]+|value)="[^"]*"/g, (m) => m.replace(/[^\n]/g, ' '));
    const fautes = [];
    lisible.split('\n').forEach((ligne, i) => {
        if ([...ligne.matchAll(LITTERAL)].length) fautes.push(`${debut + i + 1} : ${ligne.trim().slice(0, 120)}`);
    });
    return fautes;
}

describe('D — les pourcentages écrits en dur prennent l’insécable, eux aussi', () => {
    it('dans la prose de js/ (hors du module, du pack démo et des Nouvelles publiées)', () => {
        const fautes = fichiersJs('js')
            .filter((f) => f !== MODULE && !/pack-demo|changelog-data/.test(f))
            .flatMap((f) => litterauxJs(lire(f), f).map((l) => `${f}:${l}`));
        expect(fautes).toEqual([]);
    });

    it('chaque largeur CSS exemptée vise une ligne qui existe', () => {
        for (const c of CSS_PAR_VARIABLE) expect(lire(c.fichier).includes(c.extrait), c.extrait).toBe(true);
    });

    it('dans le texte visible d’index.html', () => {
        expect(litterauxHtml(lire('index.html'))).toEqual([]);
    });

    it('le motif attrape les formes d’hier, et laisse le CSS et l’insécable', () => {
        for (const l of [
            "description: 'Si moyenne standards terminaux < 60%, note plafonnée à 55%',",
            "'Réinitialise les seuils à leurs valeurs par défaut (70 / 80 / 85 %).',",
            "help: '100% = toutes les spécifications doivent être respectées'",
            "<span class=\"tb-texte-mini\">0 (0%)</span>"
        ]) expect(litterauxJs(l), l).not.toEqual([]);
        for (const l of [
            "description: 'Si moyenne < 60\\u00a0%, note plafonnée à 55\\u00a0%',",
            "couche.style.width = '100%';",
            "<summary style=\"background: linear-gradient(135deg, var(--a) 0%, var(--b) 100%);\">",
            "return `${label}\\u00a0: ${formaterPourcentage(value)}`;",
            "// commentaire à 25 % de zoom"
        ]) expect(litterauxJs(l), l).toEqual([]);
        expect(litterauxHtml('<body>\n<td>&lt; 65%</td>')).not.toEqual([]);
        expect(litterauxHtml('<body>\n<td>&lt; 65&nbsp;%</td>\n<div style="width: 40%"></div>\n<!-- « 100% » -->')).toEqual([]);
    });
});
