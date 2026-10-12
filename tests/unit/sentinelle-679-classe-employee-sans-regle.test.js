import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classesSansRegle } from './_helpers/classes-sans-regle.js';

// =====================================================================
// #679 — UNE CLASSE EMPLOYÉE DANS js/ SANS RÈGLE CSS (11 oct. 2026)
// =====================================================================
// Les bancs lisent le DOM et le texte, jamais le RENDU : une classe posée mais jamais définie leur
// est invisible (cas réel du 1er sept. : `travaux-bandeau-da-inconnu`, bandeau sans encadré). Ce
// CLIQUET fige l'inventaire du jour (316 couples fichier:classe, dont beaucoup sont des crochets
// pour le JS, pas du style) : une classe NEUVE sans règle rougit ; une classe qui reçoit sa règle,
// ou qui disparaît, doit sortir de la liste (le compte ne fait que descendre).
// Mettre à jour : tests/fixtures/cliquets/classes-sans-regle-679.json.

const ici = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(ici, '..', '..');
const fige = JSON.parse(readFileSync(path.join(racine, 'tests', 'fixtures', 'cliquets', 'classes-sans-regle-679.json'), 'utf8'));

// TRI DU LOT 23 (12 oct. 2026) — 305 couples, 248 classes. Deux familles :
//   CROCHETS (voulus) : la classe est LUE par le JS (sélecteur '.x', classList.contains/toggle,
//     matches, getElementsByClassName) ; elle sert au code, pas au style. Reconnus ci-dessous,
//     automatiquement : c'est leur raison écrite.
//   MUETTES : ni règle ni lecteur ; posées pour rien, ou un style attendu qui manque. Deux fautes
//     nettes corrigées ce jour-là (`btn-primaire` → `btn-principal`, le nom de la palette ;
//     `u-flex-between-mb15/20`, dont la règle existait sous un nom `d-` que rien ne posait).
//     Les autres sont inscrites à #679 avec cette mesure : leur compte ne fait que descendre.
const MUETTES_MAX = 103;
const sourcesJs = (() => {
    const lister = (d) => readdirSync(path.join(racine, d), { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? (e.name === '_archives' ? [] : lister(path.join(d, e.name))) : (e.name.endsWith('.js') ? [path.join(d, e.name)] : []));
    return lister('js').map((f) => readFileSync(path.join(racine, f), 'utf8')).join('\n');
})();
const echapper = (c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const estUnCrochet = (classe) => new RegExp('[\'"`][^\'"`]*\\.' + echapper(classe) + '(?![\\w-])').test(sourcesJs)
    || new RegExp('(?:contains|getElementsByClassName|toggle|matches)\\(\\s*[\'"`]\\.?' + echapper(classe) + '[\'"`]').test(sourcesJs);

describe('#679 · le tri : crochets voulus, muettes comptées', () => {
    const classes = [...new Set(fige.map((c) => c.split(':').pop()))];
    const muettes = classes.filter((c) => !estUnCrochet(c));
    it(`les classes muettes (ni règle ni lecteur) ne dépassent pas ${MUETTES_MAX}`, () => {
        expect(muettes.length).toBeLessThanOrEqual(MUETTES_MAX);
    });
    it('TÉMOIN · un crochet connu est reconnu, une faute corrigée ne revient pas', () => {
        expect(classes.length).toBeGreaterThan(100);
        expect(muettes.length).toBeLessThan(classes.length);
        expect(fige.some((c) => c.endsWith(':btn-primaire'))).toBe(false);
        expect(fige.some((c) => c.endsWith(':u-flex-between-mb15'))).toBe(false);
    });
});

describe('#679 · cliquet des classes sans règle', () => {
    const mesure = classesSansRegle(racine);
    it('aucune classe NEUVE sans règle (définis-la dans styles.css, ou dis pourquoi c\'est un crochet)', () => {
        expect(mesure.filter((c) => !fige.includes(c))).toEqual([]);
    });
    it('la liste figée ne garde rien qui a reçu sa règle ou disparu (le cliquet descend)', () => {
        expect(fige.filter((c) => !mesure.includes(c))).toEqual([]);
    });
    it('TÉMOIN · le détecteur voit une classe neuve écrite en toutes lettres', () => {
        expect(fige.length).toBeGreaterThan(100);
        expect(mesure).not.toContain('js/travaux-ui.js:travaux-bandeau-da-inconnu');   // le cas du 1er sept., réglé
    });
});

describe('#679 · TÉMOIN POSITIF — le détecteur trouve une classe posée sans règle', () => {
    it('sur un dépôt fabriqué : la classe sans règle est trouvée, la stylée, l\'interpolée et la concaténée ne le sont pas', () => {
        const d = mkdtempSync(path.join(tmpdir(), 'classes-679-'));
        try {
            mkdirSync(path.join(d, 'js', 'pratiques'), { recursive: true });
            mkdirSync(path.join(d, 'css'));
            writeFileSync(path.join(d, 'index.html'), '<style>.dans-le-html{}</style>');
            writeFileSync(path.join(d, 'styles.css'), '.stylee { color: red; }');
            writeFileSync(path.join(d, 'js', 'banc.js'), [
                'const a = `<div class="stylee fantome-banc dans-le-html ${x}">`;',
                "el.className = 'autre-fantome';",
                "el.classList.add('fantome-ajoute');",
                "const b = '<p class=\"' + c + '\">';"
            ].join('\n'));
            expect(classesSansRegle(d)).toEqual(['js/banc.js:autre-fantome', 'js/banc.js:fantome-ajoute', 'js/banc.js:fantome-banc']);
        } finally { rmSync(d, { recursive: true, force: true }); }
    });
});
