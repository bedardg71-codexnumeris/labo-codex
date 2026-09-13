import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE #600 — LE HOOK PRE-PUSH NOMME CE QUI A ÉCHOUÉ.
//
// L'INCIDENT (30 août 2026, release 1.106.4). `vitest run` sort en 1 dès
// qu'une erreur NON GÉRÉE survient, même quand tous les essais sont verts : le
// résumé porte « Tests 4153 passed » ET « Errors 3 errors ». Le hook ne lisait
// que le code de sortie et imprimait « Corrige les tests rouges » — on a
// cherché un test rouge qui n'existait pas, et le push a été perdu.
//
// ⚠ LE PIÈGE DU BANC. Le push est bloqué dans les deux cas : un essai qui
// n'éprouverait que le blocage passerait pour la mauvaise raison. C'est le
// LIBELLÉ qui est en cause, donc c'est lui qu'on lit.
//
// Premier banc de `scripts/hooks/pre-push` (aucun avant le 13 sept. 2026). Le
// hook RÉEL est exécuté dans un dépôt jetable dont `tests/` porte un faux
// `test:unit` qui imprime un résumé choisi et sort avec le code choisi.
//
// BREAK-TESTS VÉRIFIÉS le 13 septembre 2026 — journal en fin de fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hook = path.resolve(__dirname, '..', '..', 'scripts', 'hooks', 'pre-push');

let bac;

// ⚠ ISOLEMENT (incident du 13 sept. 2026, 12 h 05). Ce banc tourne lui-même
// SOUS le hook pre-push : sans ce filtre, `GIT_DIR` hérité ferait résoudre au
// hook exécuté ici la racine du VRAI dépôt — et relancer sa vraie suite Vitest,
// ou écrire dans son `.git/config`. Aucune variable `GIT_*` ne passe.
const ENV_SANS_GIT = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));

beforeAll(() => {
    bac = mkdtempSync(path.join(os.tmpdir(), 'prepush-600-'));
    execFileSync('git', ['init', '-q'], { cwd: bac, env: ENV_SANS_GIT });
    mkdirSync(path.join(bac, 'tests', 'node_modules'), { recursive: true });
    writeFileSync(path.join(bac, 'tests', 'package.json'),
        JSON.stringify({ name: 'faux', private: true, scripts: { 'test:unit': 'node faux-vitest.js' } }));
    writeFileSync(path.join(bac, 'tests', 'faux-vitest.js'),
        'process.stdout.write(process.env.FAUX_RESUME || "");\nprocess.exit(Number(process.env.FAUX_CODE || 0));\n');
});

afterAll(() => {
    if (bac) rmSync(bac, { recursive: true, force: true });
});

/** Lance le vrai hook ; rend sa sortie, couleurs retirées, et son code. */
function pousser(resume, code) {
    const r = spawnSync('bash', [hook], {
        cwd: bac,
        input: '',
        encoding: 'utf8',
        env: { ...ENV_SANS_GIT, FAUX_RESUME: resume, FAUX_CODE: String(code), SKIP_PLAYWRIGHT: '1' },
    });
    // eslint-disable-next-line no-control-regex
    return { sortie: (r.stdout + r.stderr).replace(/\x1b\[[0-9;]*m/g, ''), code: r.status };
}

const ESC = '\x1b';
const RESUME_ERREURS = [
    ' Test Files  552 passed (552)',
    '      Tests  4153 passed (4153)',
    '     Errors  3 errors',
    '   Start at  12:00:00',
].join('\n');

describe('#600 · pre-push — le libellé dit ce qui a échoué', () => {
    it('erreur non gérée, tous les essais verts : il NOMME l\'erreur et ne parle pas de test rouge', () => {
        const { sortie, code } = pousser(RESUME_ERREURS, 1);
        expect(code, 'le push reste bloqué').toBe(1);
        expect(sortie).toMatch(/NON GÉRÉE/);
        expect(sortie).toMatch(/Errors\s+3 errors/);
        expect(sortie).toMatch(/aucun test n'est rouge/);
        expect(sortie).not.toMatch(/Corrige les tests rouges/);
    });

    it('le même résumé EN COULEURS (sortie de vitest sous FORCE_COLOR) est lu pareil', () => {
        const colore = RESUME_ERREURS
            .replace('Errors', `${ESC}[2mErrors${ESC}[22m`)
            .replace('3 errors', `${ESC}[1m${ESC}[31m3 errors${ESC}[39m${ESC}[22m`);
        const { sortie } = pousser(colore, 1);
        expect(sortie).toMatch(/NON GÉRÉE/);
        expect(sortie).not.toMatch(/Corrige les tests rouges/);
    });

    it('un vrai test rouge : il dit « Corrige les tests rouges », sans parler d\'erreur non gérée', () => {
        const { sortie, code } = pousser('      Tests  2 failed | 4151 passed (4153)\n', 1);
        expect(code).toBe(1);
        expect(sortie).toMatch(/Corrige les tests rouges/);
        expect(sortie).toMatch(/2 failed/);
        expect(sortie).not.toMatch(/NON GÉRÉE/);
    });

    it('les deux à la fois : il nomme les deux', () => {
        const { sortie } = pousser('      Tests  1 failed | 4152 passed (4153)\n     Errors  1 error\n', 1);
        expect(sortie).toMatch(/Corrige les tests rouges/);
        expect(sortie).toMatch(/NON GÉRÉE/);
        expect(sortie).not.toMatch(/aucun test n'est rouge/);
    });

    it('ni l\'un ni l\'autre dans le résumé : il avoue ne pas savoir, sans inventer de test rouge', () => {
        const { sortie, code } = pousser('Error: Cannot find module vitest\n', 1);
        expect(code).toBe(1);
        expect(sortie).toMatch(/sans test rouge ni erreur non gérée/);
        expect(sortie).not.toMatch(/Corrige les tests rouges/);
    });

    it('suite verte : le hook passe (témoin du montage)', () => {
        const { sortie, code } = pousser('      Tests  4153 passed (4153)\n', 0);
        expect(code).toBe(0);
        expect(sortie).toMatch(/suite Vitest verte/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS — 13 septembre 2026
//
// 1. Hook remis dans son état d'avant (`git show c049633d:scripts/hooks/pre-push`)
//    → 4 rouges : « erreur non gérée, tous les essais verts » (la mutation de la
//      consigne : « Tests 4153 passed » + « Errors 3 errors », code 1),
//      « le même résumé EN COULEURS », « les deux à la fois », « ni l'un ni
//      l'autre ». Restent verts, et c'est juste : « un vrai test rouge » et
//      « suite verte » — l'ancien hook disait déjà vrai dans ces deux cas.
// 2. Isolement : les trois bancs du lot lancés sous `GIT_DIR` pointé vers un
//    dépôt leurre → 48 verts, leurre intact. (Mutation d'isolement éprouvée sur
//    le banc #547, voir son journal.)
// ─────────────────────────────────────────────────────────────────────────────
