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
//
// ⚠⚠ CE CLIQUET A LAISSÉ PASSER #811 (10 sept. 2026), ET VOICI POURQUOI.
// Il COMPTAIT les usages sans les QUALIFIER. `--surface` y figurait pour 1 usage,
// jugé anodin : c'était le `background` de la modale « Journal de bord », SANS valeur
// de repli. Une variable inexistante sans repli rend la déclaration invalide — le
// panneau n'avait plus de fond du tout, et le journal se lisait à même le voile de la
// modale sur l'iPad de Grégoire. Avec repli, la même variable manquante est bénigne.
// D'où le troisième cliquet, plus bas : les usages SANS REPLI comptés à part.
// (#595 reste ouvert pour les 29 noms restants ; #813 porte leur mesure.)

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

function mesurer() {
    const files = ['index.html', 'styles.css',
        ...readdirSync(path.join(racine, 'js')).filter(f => f.endsWith('.js')).map(f => 'js/' + f),
        ...(existsSync(path.join(racine, 'css')) ? readdirSync(path.join(racine, 'css')).filter(f => f.endsWith('.css')).map(f => 'css/' + f) : [])];
    const used = new Map(), nu = new Map(), defined = new Set();
    for (const f of files) {
        const s = strip(readFileSync(path.join(racine, f), 'utf8'));
        for (const m of s.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)\s*[,)]/g)) used.set(m[1], (used.get(m[1]) || 0) + 1);
        // var(--x) fermé DIRECTEMENT par ')' : pas de valeur de repli.
        for (const m of s.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)\s*\)/g)) nu.set(m[1], (nu.get(m[1]) || 0) + 1);
        for (const m of s.matchAll(/(^|[\s;{])(--[a-zA-Z0-9_-]+)\s*:/g)) defined.add(m[2]);
    }
    const fantomes = {}, fantomesSansRepli = {};
    for (const [k, n] of used) if (!defined.has(k)) fantomes[k] = n;
    for (const [k, n] of nu) if (!defined.has(k)) fantomesSansRepli[k] = n;
    return { used, defined, fantomes, fantomesSansRepli };
}

// Liste fermée au 29 août 2026 (#595) : variable → usages tolérés.
const TOLEREES = {
    "--accent": 5,
    "--accent-primaire-hover": 1,
    "--accent-principal": 5,
    "--accent-survol": 1,
    "--avertissement": 2,
    "--avertissement-fond": 1,
    "--blanc": 1,
    "--bordure": 23,
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
    "--fond-surface": 2,
    "--fond-surface-clair": 1,
    "--fond-survol": 1,
    "--fond-survol-clair": 1,
    "--gris-bordure": 5,
    "--gris-leger": 5,
    "--gris-pale": 12,
    "--gris-texte": 10,
    "--gris-texte-pale": 7,
    "--info": 3,
    "--jaune-clair": 1,
    "--jaune-moyen": 1,
    "--jaune-principal": 1,
    "--jaune-tres-pale": 1,
    "--lien": 1,
    "--orange-attention": 15,
    "--orange-fond": 1,
    "--orange-principal": 8,
    "--primaire": 2,
    "--primary-500": 3,
    "--rayon-moyen": 2,
    "--rouge": 7,
    "--rouge-principal": 1,
    "--shadow-elevee": 1,
    "--surface-0": 1,
    "--surface-1": 2,
    "--surface-2": 3,
    "--surface-alt": 1,
    "--surface-elevee": 2,
    "--surface-fond": 1,
    "--surface-secondaire": 4,
    "--surface-sureleve": 2,
    "--surface-survol": 2,
    "--surface-tertiaire": 1,
    "--texte": 5,
    "--texte-clair": 4,
    "--texte-primaire": 6,
    "--texte-principal-clair": 1,
    "--turquoise-500": 2,
    "--vert-accent": 1,
    "--vert-fonce": 2,
    "--vert-moyen": 1,
    "--vert-positif": 6,
    "--vert-principal": 7,
    "--vert-valide": 1,
    "--violet-jeton": 3
    // "--violet-pale" : son seul usage était la Banque d'évaluations, retirée par #489 (15 oct. 2026).
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

// Liste fermée au 10 septembre 2026 (#811 / #813) : variable jamais définie → usages
// SANS valeur de repli. Ceux-là ne dégradent pas : ils ANNULENT la déclaration. Un fond
// qui disparaît, une bordure qui n'existe plus, un texte qui hérite de son parent.
// C'est la moitié dangereuse de #595, et elle ne doit plus grossir d'une seule ligne.
const SANS_REPLI_TOLERES = {
    "--accent-principal": 1,
    "--avertissement": 2,
    "--blanc": 1,
    "--bordure": 5,
    "--bordure-douce": 6,
    "--bordure-legere": 11,
    "--couleur-texte-secondaire": 1,
    "--fond-surface": 1,
    "--gris-bordure": 4,
    "--gris-leger": 5,
    "--gris-pale": 8,
    "--gris-texte": 10,
    "--gris-texte-pale": 7,
    "--info": 3,
    "--orange-principal": 4,
    "--primaire": 2,
    "--rouge": 4,
    "--rouge-principal": 1,
    "--surface-alt": 1,
    "--texte-primaire": 6,
    "--vert-accent": 1,
    "--vert-fonce": 1,
    "--vert-moyen": 1,
    "--vert-positif": 6,
    "--vert-principal": 7,
    "--vert-valide": 1
};

describe('#811 · cliquet — une variable fantôme SANS REPLI ne s\'ajoute plus', () => {
    it('aucun nom neuf employé sans valeur de repli', () => {
        const { fantomesSansRepli } = mesurer();
        const neufs = Object.keys(fantomesSansRepli).filter(k => !(k in SANS_REPLI_TOLERES));
        expect(neufs, 'var(--x) sans repli sur une variable qui n\'existe pas : la déclaration est ANNULÉE (c\'était #811). Employer la palette, ou donner un repli.').toEqual([]);
    });
    it('aucun usage de plus, pour les noms déjà tolérés', () => {
        const { fantomesSansRepli } = mesurer();
        const enHausse = Object.keys(fantomesSansRepli)
            .filter(k => fantomesSansRepli[k] > SANS_REPLI_TOLERES[k])
            .map(k => k + ' ' + SANS_REPLI_TOLERES[k] + ' → ' + fantomesSansRepli[k]);
        expect(enHausse, 'usage(s) sans repli en hausse').toEqual([]);
    });
    it('la liste descend avec le code (retirer ce qui a disparu)', () => {
        const { fantomesSansRepli } = mesurer();
        const disparues = Object.keys(SANS_REPLI_TOLERES).filter(k => !(k in fantomesSansRepli));
        expect(disparues, 'retirer ces entrées de SANS_REPLI_TOLERES').toEqual([]);
    });
});
