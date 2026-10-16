import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    echecsDuRapport, flakyDuRapport, comparerALaBaseline
} from '../../scripts/rapport-playwright.mjs';
import { fichiersDuMorceau } from '../../scripts/morceau-playwright.mjs';
import { readdirSync } from 'node:fs';

// SENTINELLE — 16 OCTOBRE 2026 · LE VERDICT DES MORCEAUX JUGE COMME LE MAC.
//
// Sur GitHub, Playwright tourne en morceaux (shards) ; le job `verdict` fusionne
// leurs rapports et appelle scripts/juger-rapport-playwright.mjs. Ce juge doit
// rendre le jugement du Mac (seule une rougeur NOUVELLE fait échouer) et ne
// jamais confondre « rien n'a été joué » avec « tout est vert ».
//
// BREAK-TESTS (faits le 16 octobre) — le garde `joues === 0` retiré du juge →
// C.c rouge (code 0 au lieu de 2) ; `spec.ok === false` remplacé par « un
// essai n'est pas `expected` » dans rapport-playwright.mjs → A.a et C.e rouges
// (une spec rattrapée au second essai deviendrait un échec, #534).
// La répartition en tranches contiguës (comme `--shard`) au lieu de l'alternance
// dans morceau-playwright.mjs → B.b et B.c rouges.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const JUGE = path.join(racine, 'scripts', 'juger-rapport-playwright.mjs');

/** Un rapport JSON minimal, à la forme de celui de `playwright merge-reports --reporter=json`. */
function rapport(specs, { errors = [] } = {}) {
    const compte = (statut) => specs.filter((s) => s.statut === statut).length;
    return {
        suites: [{
            file: 'a.spec.js',
            specs: [],
            suites: [{
                specs: specs.map((s) => ({
                    file: s.file ?? 'a.spec.js',
                    title: s.titre,
                    ok: s.statut !== 'unexpected',
                    tests: [{ status: s.statut }]
                }))
            }]
        }],
        errors,
        stats: { expected: compte('expected'), unexpected: compte('unexpected'), flaky: compte('flaky'), skipped: compte('skipped') }
    };
}

function juger(contenu) {
    const dossier = mkdtempSync(path.join(tmpdir(), 'juge-pw-'));
    try {
        const fichier = path.join(dossier, 'rapport.json');
        const resume = path.join(dossier, 'resume.md');
        writeFileSync(fichier, JSON.stringify(contenu), 'utf8');
        writeFileSync(resume, '', 'utf8');
        const r = spawnSync('node', [JUGE, fichier], {
            encoding: 'utf8', env: { ...process.env, GITHUB_STEP_SUMMARY: resume }
        });
        return { code: r.status, resume: readFileSync(resume, 'utf8') };
    } finally {
        rmSync(dossier, { recursive: true, force: true });
    }
}

describe('A — les règles partagées par le Mac et la CI', () => {
    const r = rapport([
        { titre: 'vert', statut: 'expected' },
        { titre: 'rouge', statut: 'unexpected' },
        { titre: 'rattrapé', statut: 'flaky' },
        { titre: 'sauté', statut: 'skipped' }
    ]);

    it('A.a seule une spec définitivement rouge est un échec', () => {
        expect(echecsDuRapport(r)).toEqual(['a.spec.js › rouge']);
    });

    it('A.b une spec verte au second essai se DIT, à part', () => {
        expect(flakyDuRapport(r)).toEqual(['a.spec.js › rattrapé']);
    });

    it('A.c seule une rougeur absente de la baseline est nouvelle ; une connue redevenue verte se dit', () => {
        expect(comparerALaBaseline(['x › 1', 'x › 2'], ['x › 2', 'x › 3'])).toEqual({
            nouveaux: ['x › 1'], reparees: ['x › 3']
        });
        expect(comparerALaBaseline([], undefined)).toEqual({ nouveaux: [], reparees: [] });
    });

    it('A.d le juge du Mac lit ces règles-là, il n’en porte pas de copie', () => {
        const mac = readFileSync(path.join(racine, 'scripts', 'verifier-playwright.mjs'), 'utf8');
        expect(mac).toContain("from './rapport-playwright.mjs'");
        expect(mac).not.toMatch(/function (echecsDuRapport|flakyDuRapport|identite)\(/);
    });
});

describe('B — la répartition des fichiers entre les morceaux', () => {
    const MORCEAU = path.join(racine, 'scripts', 'morceau-playwright.mjs');
    /** Toutes les specs, RÉCURSIVEMENT : un sous-dossier qui échapperait aux morceaux rougit ici. */
    const toutes = readdirSync(path.join(racine, 'tests', 'integration'), { recursive: true })
        .filter((f) => f.endsWith('.spec.js'));

    it('B.a les specs vivent à plat dans integration/ : le script les voit toutes', () => {
        expect(toutes.length).toBeGreaterThan(100);
        expect(toutes.filter((f) => f.includes(path.sep)), 'une spec en sous-dossier ne serait jouée par aucun morceau').toEqual([]);
    });

    it('B.b chaque spec va à UN morceau, et un seul ; les tailles diffèrent d’au plus un', () => {
        for (const total of [1, 4, 10, 16]) {
            const lots = Array.from({ length: total }, (_, k) => fichiersDuMorceau(toutes, k + 1, total));
            expect(lots.flat().sort()).toEqual([...toutes].sort());
            const tailles = lots.map((l) => l.length);
            expect(Math.max(...tailles) - Math.min(...tailles)).toBeLessThanOrEqual(1);
        }
    });

    it('B.c en ALTERNANCE : deux voisins de l’ordre alphabétique ne tombent pas dans le même morceau', () => {
        const triees = [...toutes].sort();
        const lot = new Set(fichiersDuMorceau(toutes, 1, 16));
        expect(lot.has(triees[0])).toBe(true);
        expect(lot.has(triees[1])).toBe(false);
        expect(lot.has(triees[16])).toBe(true);
    });

    it('B.d hors bornes ⮕ 2, et les filtres sont ancrés', () => {
        expect(spawnSync('node', [MORCEAU, '17', '16']).status).toBe(2);
        expect(spawnSync('node', [MORCEAU, '0', '16']).status).toBe(2);
        const r = spawnSync('node', [MORCEAU, '1', '16'], { encoding: 'utf8' });
        expect(r.status).toBe(0);
        for (const ligne of r.stdout.trim().split('\n')) expect(ligne).toMatch(/^integration\/[^/]+\\\.spec\\\.js\$$/);
    });
});

describe('C — le juge de la CI (scripts/juger-rapport-playwright.mjs)', () => {
    it('C.a tout vert ⮕ 0, et le résumé le dit', () => {
        const { code, resume } = juger(rapport([{ titre: 'vert', statut: 'expected' }]));
        expect(code).toBe(0);
        expect(resume).toContain('aucune rougeur nouvelle');
    });

    it('C.b une rougeur absente de la baseline ⮕ 1, et elle est nommée', () => {
        const { code, resume } = juger(rapport([
            { titre: 'vert', statut: 'expected' },
            { titre: 'cassé', statut: 'unexpected', file: 'b.spec.js' }
        ]));
        expect(code).toBe(1);
        expect(resume).toContain('b.spec.js › cassé');
    });

    it('C.c aucun essai joué ⮕ 2 (NON JUGÉ), jamais 0', () => {
        expect(juger(rapport([])).code).toBe(2);
    });

    it('C.d une erreur hors essai ⮕ 2, même si les essais présents sont verts', () => {
        const { code, resume } = juger(rapport([{ titre: 'vert', statut: 'expected' }], {
            errors: [{ message: 'Error: impossible de charger x.spec.js\n    at …' }]
        }));
        expect(code).toBe(2);
        expect(resume).toContain('impossible de charger x.spec.js');
    });

    it('C.e une spec verte au second essai ne bloque pas, mais se dit', () => {
        const { code, resume } = juger(rapport([{ titre: 'rattrapé', statut: 'flaky' }]));
        expect(code).toBe(0);
        expect(resume).toContain('VERTE(S) AU SECOND ESSAI');
    });
});
