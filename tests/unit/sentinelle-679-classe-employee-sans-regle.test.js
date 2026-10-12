import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
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
