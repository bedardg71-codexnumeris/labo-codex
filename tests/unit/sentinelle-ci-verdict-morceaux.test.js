import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    echecsDuRapport, flakyDuRapport, vertsDuRapport, comparerALaBaseline
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
// #1114 (25 oct. 2026) — `process.argv[3]` ignoré par le juge (la commune toujours lue) → C.f
// rouge ; la baseline Linux retirée de l'étape du workflow → D.a rouge.
// #1114 (28 oct. 2026) — l'ancienne règle de `reparees` (toute connue absente des
// échecs) → E.c, E.d, E.e et E.g rouges ; `echecsIntermittents` ignorée par le
// juge → E.b et E.g rouges. Arbre restauré, sha256 vérifié.
// #1114 (29 oct. 2026, retouche du verdict de Cowork) — la garde `!rattrapees.has(e)`
// retirée de `reparees` → E.e et E.i rouges ; `instables` retiré de l'appel du
// juge de la CI → E.i et E.j rouges.

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

/** `baseline` : null (la commune), une liste d'échecs connus ou un objet de baseline (écrits dans un fichier), ou un chemin. */
function juger(contenu, baseline = null) {
    const dossier = mkdtempSync(path.join(tmpdir(), 'juge-pw-'));
    try {
        const fichier = path.join(dossier, 'rapport.json');
        const resume = path.join(dossier, 'resume.md');
        writeFileSync(fichier, JSON.stringify(contenu), 'utf8');
        writeFileSync(resume, '', 'utf8');
        const args = [JUGE, fichier];
        if (baseline && typeof baseline === 'object') {
            const chemin = path.join(dossier, 'baseline.json');
            writeFileSync(chemin, JSON.stringify(Array.isArray(baseline) ? { echecsConnus: baseline } : baseline), 'utf8');
            args.push(chemin);
        } else if (baseline) {
            args.push(baseline);
        }
        const r = spawnSync('node', args, {
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
        expect(comparerALaBaseline({ echecs: ['x › 1', 'x › 2'], verts: ['x › 3'] }, { echecsConnus: ['x › 2', 'x › 3'] })).toEqual({
            nouveaux: ['x › 1'], reparees: ['x › 3'], aPasserAuxIntermittentes: [], nonJouees: [], intermittentesRouges: []
        });
        expect(comparerALaBaseline({ echecs: [], verts: [] }, undefined)).toEqual({ nouveaux: [], reparees: [], aPasserAuxIntermittentes: [], nonJouees: [], intermittentesRouges: [] });
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

    it('C.f #1114 : la baseline nommée en second argument est celle qui juge', () => {
        const r = rapport([
            { titre: 'propre à Linux', statut: 'unexpected', file: 'l.spec.js' },
            { titre: 'neuve', statut: 'unexpected', file: 'n.spec.js' }
        ]);
        // La commune (vide) ne connaît ni l'une ni l'autre ; la nommée en connaît une.
        expect(juger(r).resume).toContain('2 spec(s) Playwright NOUVELLEMENT');
        r.suites[0].suites[0].specs.push({ file: 'r.spec.js', title: 'réparée', ok: true, tests: [{ status: 'expected' }] });
        r.stats.expected += 1;
        const { code, resume } = juger(r, ['l.spec.js › propre à Linux', 'r.spec.js › réparée']);
        expect(code).toBe(1);
        expect(resume).toContain('1 spec(s) Playwright NOUVELLEMENT');
        expect(resume).toContain('n.spec.js › neuve');
        expect(resume).toContain('baseline.json');
        // Une entrée redevenue verte ne bloque pas, et se retire à la main.
        expect(resume).toContain('r.spec.js › réparée');
        expect(resume).toContain('à retirer de baseline.json, à la main');
        expect(juger(rapport([{ titre: 'propre à Linux', statut: 'unexpected', file: 'l.spec.js' }]), ['l.spec.js › propre à Linux']).code).toBe(0);
    });

    it('C.g #1114 : une baseline nommée mais absente ⮕ 2 (NON JUGÉ)', () => {
        const { code, resume } = juger(rapport([{ titre: 'vert', statut: 'expected' }]), path.join(tmpdir(), 'baseline-inexistante-1114.json'));
        expect(code).toBe(2);
        expect(resume).toContain('Baseline absente');
    });
});

describe('D — #1114 : GitHub juge contre la baseline Linux', () => {
    it('D.a le job de verdict passe scripts/playwright-baseline-linux.json au juge, et le fichier est bien formé', () => {
        const workflow = readFileSync(path.join(racine, '.github', 'workflows', 'tests.yml'), 'utf8');
        expect(workflow).toContain('node ../scripts/juger-rapport-playwright.mjs rapport.json ../scripts/playwright-baseline-linux.json');
        const linux = JSON.parse(readFileSync(path.join(racine, 'scripts', 'playwright-baseline-linux.json'), 'utf8'));
        expect(Array.isArray(linux.echecsConnus)).toBe(true);
        expect(linux.echecsConnus.length).toBe(linux.totalEchecsConnus);
        for (const e of linux.echecsConnus) expect(e).toMatch(/^[^/›]+\.spec\.js › ./);
        expect(new Set(linux.echecsConnus).size).toBe(linux.echecsConnus.length);
    });
});

describe('E — #1114 (28 oct. 2026) : les intermittentes de Linux, et « redevenue verte » seulement jouée verte', () => {
    const base = { echecsConnus: ['c.spec.js › connue', 'c.spec.js › absente'], echecsIntermittents: ['i.spec.js › va-et-vient'] };
    const comparer = (specs, baseline = base) => {
        const r = rapport(specs);
        return comparerALaBaseline({ echecs: echecsDuRapport(r), verts: vertsDuRapport(r), instables: flakyDuRapport(r) }, baseline);
    };

    it('E.a une rouge hors des deux listes est nouvelle', () => {
        expect(comparer([{ titre: 'neuve', statut: 'unexpected', file: 'n.spec.js' }]).nouveaux).toEqual(['n.spec.js › neuve']);
    });

    it('E.b une intermittente rouge n’est pas nouvelle ; elle se compte', () => {
        const j = comparer([{ titre: 'va-et-vient', statut: 'unexpected', file: 'i.spec.js' }]);
        expect(j.nouveaux).toEqual([]);
        expect(j.intermittentesRouges).toEqual(['i.spec.js › va-et-vient']);
    });

    it('E.c une intermittente verte n’est ni nouvelle ni « redevenue verte »', () => {
        const j = comparer([{ titre: 'va-et-vient', statut: 'expected', file: 'i.spec.js' }]);
        expect(j.nouveaux).toEqual([]);
        expect(j.reparees).toEqual([]);
        expect(j.intermittentesRouges).toEqual([]);
    });

    it('E.d une connue jouée verte est réparée ; une connue absente du rapport est « non jouée », pas réparée', () => {
        const j = comparer([{ titre: 'connue', statut: 'expected', file: 'c.spec.js' }]);
        expect(j.reparees).toEqual(['c.spec.js › connue']);
        expect(j.nonJouees).toEqual(['c.spec.js › absente']);
    });

    it('E.e une connue sautée n’est pas jouée ; une connue verte au SECOND essai n’est pas réparée : elle passe aux intermittentes (verdict du 29 oct.)', () => {
        const j = comparer([{ titre: 'connue', statut: 'flaky', file: 'c.spec.js' }, { titre: 'absente', statut: 'skipped', file: 'c.spec.js' }]);
        expect(j.reparees).toEqual([]);
        expect(j.aPasserAuxIntermittentes).toEqual(['c.spec.js › connue']);
        expect(j.nonJouees).toEqual(['c.spec.js › absente']);
        expect(j.nouveaux).toEqual([]);
    });

    it('E.f une baseline sans `echecsIntermittents` juge comme avant', () => {
        const sans = { echecsConnus: base.echecsConnus };
        const j = comparer([{ titre: 'va-et-vient', statut: 'unexpected', file: 'i.spec.js' }, { titre: 'connue', statut: 'unexpected', file: 'c.spec.js' }], sans);
        expect(j.nouveaux).toEqual(['i.spec.js › va-et-vient']);
        expect(j.intermittentesRouges).toEqual([]);
    });

    it('E.g le juge de la CI : une intermittente rouge ⮕ 0, comptée ; une rouge hors des listes ⮕ 1 ; une connue absente ⮕ « non jouée »', () => {
        const ok = juger(rapport([
            { titre: 'va-et-vient', statut: 'unexpected', file: 'i.spec.js' },
            { titre: 'connue', statut: 'unexpected', file: 'c.spec.js' }
        ]), base);
        expect(ok.code).toBe(0);
        expect(ok.resume).toContain('aucune rougeur nouvelle');
        expect(ok.resume).toContain('1 intermittente(s) rouge(s) sur 1');
        expect(ok.resume).toContain('NON JOUÉE(S)');
        expect(ok.resume).toContain('c.spec.js › absente');
        expect(ok.resume).not.toContain('REDEVENUES VERTES');
        const ko = juger(rapport([
            { titre: 'va-et-vient', statut: 'unexpected', file: 'i.spec.js' },
            { titre: 'neuve', statut: 'unexpected', file: 'n.spec.js' }
        ]), base);
        expect(ko.code).toBe(1);
        expect(ko.resume).toContain('n.spec.js › neuve');
        expect(ko.resume).not.toContain('- i.spec.js › va-et-vient');
    });

    it('E.i le juge de la CI : une connue verte au second essai ⮕ 0, « à passer aux intermittentes », jamais « redevenue verte »', () => {
        const { code, resume } = juger(rapport([
            { titre: 'connue', statut: 'flaky', file: 'c.spec.js' },
            { titre: 'absente', statut: 'unexpected', file: 'c.spec.js' }
        ]), base);
        expect(code).toBe(0);
        expect(resume).toContain('1 spec(s) connue(s) VERTE(S) AU SECOND ESSAI — à passer aux intermittentes');
        expect(resume).toContain('- c.spec.js › connue');
        expect(resume).not.toContain('REDEVENUES VERTES');
    });

    it('E.j les trois juges passent leurs instables à comparerALaBaseline', () => {
        for (const juge of ['juger-rapport-playwright.mjs', 'verifier-playwright.mjs', 'verdict-en-morceaux.mjs']) {
            const source = readFileSync(path.join(racine, 'scripts', juge), 'utf8');
            expect(source, juge).toMatch(/comparerALaBaseline\(\{ echecs, verts: vertsDuRapport\(rapport\), instables \}/);
            expect(source, juge).toContain('aPasserAuxIntermittentes');
        }
    });

    it('E.h la baseline Linux : deux listes disjointes, bien formées, aux totaux justes', () => {
        const linux = JSON.parse(readFileSync(path.join(racine, 'scripts', 'playwright-baseline-linux.json'), 'utf8'));
        expect(Array.isArray(linux.echecsIntermittents)).toBe(true);
        expect(linux.echecsIntermittents.length).toBe(linux.totalEchecsIntermittents);
        for (const e of linux.echecsIntermittents) expect(e).toMatch(/^[^/›]+\.spec\.js › ./);
        expect(new Set(linux.echecsIntermittents).size).toBe(linux.echecsIntermittents.length);
        const connues = new Set(linux.echecsConnus);
        expect(linux.echecsIntermittents.filter((e) => connues.has(e))).toEqual([]);
    });
});
