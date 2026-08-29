import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE #567 (29 août 2026) — LES VARIABLES CSS FANTÔMES.
//
// Constat C1 de l'audit du 25 août : `var(--attention)`, `--orange`, `--orange-pale`,
// `--radius` n'existaient nulle part ; les avertissements (« Non associé », modales de
// suppression, « à re-déposer ») perdaient leur couleur d'alerte dans les deux modes.
// Remplacées par la palette : `--alerte-texte-attention`, `--alerte-fond-attention`,
// `--alerte-bordure-attention`, `--radius-moyen` (définies en clair ET en sombre).
//
// ⚠ MESURÉ EN CHEMIN : le projet emploie 78 AUTRES variables jamais définies
// (272 usages, dont une partie sans repli, donc transparents ou hérités).
// C'est #595. Ce banc pose un CLIQUET : la liste fermée ci-dessous, avec le nombre
// d'usages de chacune ; une variable neuve non définie, ou un usage de plus, rougit.
// Le compte ne peut que baisser — retirer une entrée ici quand elle tombe à zéro.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

function mesurer() {
    const files = ['index.html', 'styles.css',
        ...readdirSync(path.join(racine, 'js')).filter(f => f.endsWith('.js')).map(f => 'js/' + f),
        ...(existsSync(path.join(racine, 'css')) ? readdirSync(path.join(racine, 'css')).filter(f => f.endsWith('.css')).map(f => 'css/' + f) : [])];
    const used = new Map(), defined = new Set();
    for (const f of files) {
        const s = strip(readFileSync(path.join(racine, f), 'utf8'));
        for (const m of s.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)\s*[,)]/g)) used.set(m[1], (used.get(m[1]) || 0) + 1);
        for (const m of s.matchAll(/(^|[\s;{])(--[a-zA-Z0-9_-]+)\s*:/g)) defined.add(m[2]);
    }
    const fantomes = {};
    for (const [k, n] of used) if (!defined.has(k)) fantomes[k] = n;
    return { used, defined, fantomes };
}

// Liste fermée au 29 août 2026 (#595) : variable → usages tolérés.
const TOLEREES = {
    "--accent": 5,
    "--accent-primaire-hover": 1,
    "--accent-principal": 5,
    "--accent-survol": 1,
    "--avertissement": 3,
    "--avertissement-fond": 2,
    "--blanc": 1,
    "--bordure": 25,
    "--bordure-discrete": 4,
    "--bordure-douce": 6,
    "--bordure-legere": 12,
    "--bordure-subtile": 8,
    "--couleur-attention": 2,
    "--couleur-texte-secondaire": 1,
    "--couleur-texte-sombre": 1,
    "--critere-couleur": 4,
    "--danger-500": 1,
    "--erreur": 1,
    "--fond-carte": 2,
    "--fond-principal": 1,
    "--fond-secondaire": 1,
    "--fond-surface": 2,
    "--fond-surface-clair": 1,
    "--fond-survol": 1,
    "--fond-survol-clair": 1,
    "--gris-bordure": 5,
    "--gris-leger": 5,
    "--gris-pale": 12,
    "--gris-texte": 11,
    "--gris-texte-pale": 7,
    "--info": 3,
    "--jaune-clair": 1,
    "--jaune-moyen": 1,
    "--jaune-principal": 1,
    "--jaune-tres-pale": 1,
    "--lien": 1,
    "--ombre-elevation-3": 1,
    "--orange-attention": 15,
    "--orange-clair": 1,
    "--orange-fonce": 1,
    "--orange-fond": 1,
    "--orange-principal": 8,
    "--primaire": 2,
    "--primary-500": 3,
    "--radius-lg": 1,
    "--radius-md": 2,
    "--radius-sm": 8,
    "--radius-standard": 10,
    "--rayon-moyen": 2,
    "--rouge": 7,
    "--rouge-principal": 1,
    "--shadow-elevee": 1,
    "--surface": 1,
    "--surface-0": 1,
    "--surface-1": 2,
    "--surface-2": 3,
    "--surface-alt": 1,
    "--surface-elevee": 2,
    "--surface-fond": 1,
    "--surface-hover": 1,
    "--surface-secondaire": 5,
    "--surface-sureleve": 2,
    "--surface-survol": 2,
    "--surface-tertiaire": 1,
    "--texte": 5,
    "--texte-clair": 4,
    "--texte-fonce": 1,
    "--texte-primaire": 6,
    "--texte-principal-clair": 1,
    "--turquoise-500": 2,
    "--vert-accent": 1,
    "--vert-fonce": 2,
    "--vert-moyen": 1,
    "--vert-positif": 6,
    "--vert-principal": 7,
    "--vert-valide": 1,
    "--violet-jeton": 3,
    "--violet-pale": 1
};

describe('#567 · les quatre variables de l\'audit n\'existent plus nulle part', () => {
    it('--attention, --orange, --orange-pale, --radius : zéro usage', () => {
        const { used } = mesurer();
        for (const v of ['--attention', '--orange', '--orange-pale', '--radius']) {
            expect(used.get(v) || 0, v).toBe(0);
        }
    });
    it('leurs remplaçantes sont définies dans la palette, en clair comme en sombre', () => {
        const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
        for (const v of ['--alerte-texte-attention', '--alerte-fond-attention', '--alerte-bordure-attention', '--radius-moyen']) {
            expect((css.match(new RegExp('^\\s*' + v + '\\s*:', 'gm')) || []).length, v + ' (deux thèmes)').toBeGreaterThanOrEqual(v === '--radius-moyen' ? 1 : 2);
        }
    });
});

describe('#595 · cliquet — aucune variable fantôme nouvelle, aucun usage de plus', () => {
    it('les fantômes restants sont dans la liste fermée, sans dépasser leur compte', () => {
        const { fantomes } = mesurer();
        const nouvelles = Object.keys(fantomes).filter(k => !(k in TOLEREES));
        expect(nouvelles, 'variable(s) non définie(s) NOUVELLE(S) — la définir dans styles.css ou employer la palette').toEqual([]);
        const enHausse = Object.keys(fantomes).filter(k => fantomes[k] > TOLEREES[k]).map(k => k + ' ' + TOLEREES[k] + ' → ' + fantomes[k]);
        expect(enHausse, 'usage(s) en hausse d\'une variable fantôme').toEqual([]);
    });
    it('la liste ne garde pas de fantôme disparu (le cliquet descend avec le code)', () => {
        const { fantomes } = mesurer();
        const disparues = Object.keys(TOLEREES).filter(k => !(k in fantomes));
        expect(disparues, 'retirer ces entrées de TOLEREES').toEqual([]);
    });
});
