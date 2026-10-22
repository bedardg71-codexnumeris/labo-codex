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
 * « % » ou « pts » collé par interpolation (`}%`, `} %`, `} pts`) ou par concaténation (`+ '%'`, `+ ' pts'`).
 */
export const NOMBRE_PUIS_SIGNE = /(toFixed\(\d\)|\)|[\w\]'"])\s*(\}\s?(%|pts?\b)|\+\s*['"`]\s?(%|pts?\b))/;

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
      motif: 'le journal de la console (avertissement #353), la ligne qui suit `console.warn(` : personne ne le lit à l’écran' }
];

/**
 * ⏳ EN COURS (22 oct. 2026) — les fichiers que le lot convertit encore, famille par famille, un commit par
 * famille (consigne, §5). La liste se vide au dernier commit du lot et disparaît avec lui.
 */
const EN_COURS = [
    'js/cartouches.js',
    'js/codex.js',
    'js/correlations-longitudinales.js',
    'js/echelles.js',
    'js/evaluation-calcul.js',
    'js/evaluation-chargement.js',
    'js/export-pdf.js',
    'js/graphiques-progression.js',
    'js/grilles.js',
    'js/impact-jetons.js',
    'js/materiel-creation.js',
    'js/modelisation.js',
    'js/objectifs.js',
    'js/planification-carte.js',
    'js/planification-export.js',
    'js/pratiques-gestion.js',
    'js/pratiques/construction-attributs.js',
    'js/productions-bibliotheque-ui.js',
    'js/productions-liste.js',
    'js/productions.js',
    'js/reserve.js',
    'js/travaux-preparation.js',
    'js/travaux-visionneuse.js',
    'js/wizard-pratique-v2.js',
];

function retirerNonLu(ligne) {
    return NON_LU.reduce((l, re) => l.replace(re, ''), ligne);
}

function fautesDe(fichiers, enCours = EN_COURS) {
    const fautes = [];
    for (const f of fichiers) {
        if (f === MODULE || f === path.join('js', 'pack-demo-10.js') || enCours.includes(f)) continue;
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
        expect(w.formaterPourcentage(78)).toBe('78 %');
        expect(w.formaterPourcentage(0.823 * 100, 1)).toBe('82,3 %');
        expect(w.formaterPourcentage(65, 0)).toBe('65 %');
        expect(w.formaterPourcentage(0)).toBe('0 %');
        expect(w.formaterPourcentage(-12.5)).toBe('-12,5 %');
        const t = w.formaterPourcentage(40);
        expect(t).not.toContain('&nbsp;');
        expect(t).not.toContain(' ');
        expect(t.charCodeAt(2)).toBe(0xA0);
    });

    it('formaterPoints : une décimale fixe par défaut (la règle du PDF), sinon celle de l’appelant', () => {
        expect(w.formaterPoints(44.5)).toBe('44,5 pts');
        expect(w.formaterPoints(24)).toBe('24,0 pts');
        expect(w.formaterPoints(22.5, 0)).toBe('23 pts');
        expect(w.formaterPoints(-3, 0)).toBe('-3 pts');
    });
});

describe('B — l’invariant : aucun nombre suivi de « % » ou de « pts » hors du module', () => {
    it('dans tout js/ (hors du module et du pack démo, une donnée)', () => {
        expect(fautesDe(fichiersJs('js'))).toEqual([]);
    });

    it('EN COURS : chaque fichier encore à convertir a bien des fautes (sinon il sort de la liste)', () => {
        for (const f of EN_COURS) {
            expect(fautesDe([f], []).length, `${f} n'a plus de faute : retire-le de EN_COURS`).toBeGreaterThan(0);
        }
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
            "row.push(Math.round((n / total) * 100) + '%');"
        ]) expect(NOMBRE_PUIS_SIGNE.test(retirerNonLu(l)), l).toBe(true);
        for (const l of [
            "if (barre) barre.style.width = pourcent + '%';",
            '<div class="barre" style="width: ${pct}%"></div>',
            "parts.push(`brightness(${100 + op.value}%)`);",
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
