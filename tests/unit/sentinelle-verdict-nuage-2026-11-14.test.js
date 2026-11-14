import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// ═══════════════════════════════════════════════════════════════════════════
// LE NUAGE JUGE LE VERDICT COMPLET, LE MAC EN COMPLÉMENT — 14 novembre 2026.
// Décision de Grégoire (15 h 51), qui revient sur celle du 10 oct. (« le Mac est
// le juge du push ») : le verdict du Mac durait 111 min, machine immobilisée ; celui
// de GitHub rend le même commit en 33 min, mais n'avait jamais conclu vert.
//
// Ce que ce fichier verrouille :
//   A. LA LISTE NE DÉRIVE PLUS — chaque entrée de scripts/playwright-baseline-linux.json
//      a sa famille et sa cause. Une entrée sans cause rougit ici, et rend le
//      verdict du nuage NON JUGÉ (scripts/juger-rapport-playwright.mjs).
//   B. LE JUGEMENT D'UN COMMIT = nuage vert pour ce SHA + complément vert pour ce
//      SHA (scripts/lire-verdict.mjs) ; le verdict complet du Mac reste accepté seul.
//   C. LE COMPLÉMENT DU MAC rejoue ce que Linux ne juge pas, et rien d'autre ; une
//      entrée non jouée n'est pas verte.
//   D. LE RELEVÉ DU NUAGE ne prend pas pour le verdict d'un commit un run qui en a
//      joué un autre (champ `branche`).
//   E. LE DÉCLENCHEUR juge une branche avant sa fusion, à la demande.
//
// BREAK-TESTS (faits le 14 nov.) — la cause d'une entrée retirée du fichier réel →
// A.a rouge ; `parts.nuage === 0 &&` retiré de jugerLeJeton → B.c rouge ; le filtre
// MARQUE_AUTRE_REFERENCE retiré de lireLesRuns → D.b rouge ; le `break` de
// commitsQuiValent retiré → D.e rouge.
// ═══════════════════════════════════════════════════════════════════════════

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');
const { defautsDesCauses, FAMILLES_DE_CAUSE } = await import(path.join(racine, 'scripts', 'rapport-playwright.mjs'));
const { jugerLeJeton } = await import(path.join(racine, 'scripts', 'lire-verdict.mjs'));
const { jugerComplement, jetonAvecComplement, direDuree } = await import(path.join(racine, 'scripts', 'complement-mac.mjs'));
const { lireLesRuns, jetonAvecNuage, commitsQuiValent, MARQUE_AUTRE_REFERENCE, JOB_VERDICT } = await import(path.join(racine, 'scripts', 'verdict-nuage.mjs'));
const cfg = await import(path.join(racine, 'tests', 'playwright.config.js'));

const LINUX = JSON.parse(lire('scripts', 'playwright-baseline-linux.json'));
const WORKFLOW = lire('.github', 'workflows', 'tests.yml');
const SHA = 'a'.repeat(40);
const AUTRE = 'b'.repeat(40);

/** Un rapport JSON de Playwright, fabriqué : `essais` = [{ fichier, blocs, titre, statut }]. */
function rapport(essais) {
    const parFichier = new Map();
    for (const e of essais) {
        if (!parFichier.has(e.fichier)) parFichier.set(e.fichier, { title: e.fichier, file: e.fichier, specs: [], suites: [] });
        let noeud = parFichier.get(e.fichier);
        for (const b of e.blocs ?? []) {
            let enfant = noeud.suites.find((s) => s.title === b);
            if (!enfant) { enfant = { title: b, file: e.fichier, specs: [], suites: [] }; noeud.suites.push(enfant); }
            noeud = enfant;
        }
        noeud.specs.push({ title: e.titre, file: e.fichier, ok: e.statut !== 'unexpected', tests: [{ status: e.statut, results: [{ status: e.statut === 'unexpected' ? 'failed' : 'passed' }] }] });
    }
    return { suites: [...parFichier.values()], errors: [], stats: {} };
}
const essaiDe = (id, statut) => { const [fichier, ...reste] = id.split(' › '); return { fichier, blocs: reste.slice(0, -1), titre: reste.at(-1), statut }; };

describe('A — la liste Linux ne dérive plus : chaque entrée a sa famille et sa cause', () => {
    it('A.a le fichier réel est dans la règle, et ses comptes disent vrai', () => {
        expect(defautsDesCauses(LINUX)).toEqual([]);
        expect(LINUX.echecsConnus.length).toBe(LINUX.totalEchecsConnus);
        expect(LINUX.echecsIntermittents.length).toBe(LINUX.totalEchecsIntermittents);
        expect(Object.keys(LINUX.causes).length).toBe(LINUX.echecsConnus.length + LINUX.echecsIntermittents.length);
        for (const c of Object.values(LINUX.causes)) expect(FAMILLES_DE_CAUSE).toContain(c.famille);
    });

    it('A.b une entrée sans cause, une famille inventée, une cause creuse, un reste : chacun est nommé', () => {
        const base = { echecsConnus: ['a.spec.js › un'], echecsIntermittents: ['b.spec.js › deux'], causes: {
            'a.spec.js › un': { famille: 'minutage', cause: 'Délai de 30 s dépassé au run 1, attente d’un bouton.' },
            'b.spec.js › deux': { famille: 'geometrie-rendu', cause: 'La bulle couvre sa cible au run 2, 1 passage sur 7.' }
        } };
        expect(defautsDesCauses(base)).toEqual([]);
        const sans = structuredClone(base); delete sans.causes['a.spec.js › un'];
        expect(defautsDesCauses(sans)).toEqual(['sans cause : a.spec.js › un']);
        const inventee = structuredClone(base); inventee.causes['a.spec.js › un'].famille = 'linux';
        expect(defautsDesCauses(inventee)[0]).toMatch(/^famille inconnue/);
        const creuse = structuredClone(base); creuse.causes['b.spec.js › deux'].cause = 'à voir';
        expect(defautsDesCauses(creuse)[0]).toMatch(/^cause vide ou trop courte/);
        const reste = structuredClone(base); reste.echecsConnus = [];
        expect(defautsDesCauses(reste)[0]).toMatch(/^cause sans entrée/);
        const double = structuredClone(base); double.echecsIntermittents.push('a.spec.js › un');
        expect(defautsDesCauses(double).some((d) => d.startsWith('dans les deux listes'))).toBe(true);
    });

    it('A.c le juge du nuage refuse de s’appuyer sur une liste hors règle : NON JUGÉ, pas vert', () => {
        const d = mkdtempSync(path.join(tmpdir(), 'verdict-nuage-'));
        try {
            const r = rapport([{ fichier: 'a.spec.js', titre: 'un', statut: 'expected' }]);
            r.stats = { expected: 1 };
            writeFileSync(path.join(d, 'rapport.json'), JSON.stringify(r));
            const juger = (baseline) => {
                writeFileSync(path.join(d, 'baseline.json'), JSON.stringify(baseline));
                return spawnSync('node', [path.join(racine, 'scripts', 'juger-rapport-playwright.mjs'), path.join(d, 'rapport.json'), path.join(d, 'baseline.json')], { encoding: 'utf8', env: { ...process.env, GITHUB_STEP_SUMMARY: '' } });
            };
            const horsRegle = juger({ echecsConnus: ['z.spec.js › rangé sans lire'], echecsIntermittents: [], causes: {} });
            expect(horsRegle.status).toBe(2);
            expect(horsRegle.stderr).toContain('sans cause : z.spec.js › rangé sans lire');
            const dansLaRegle = juger({ echecsConnus: ['z.spec.js › lu'], echecsIntermittents: [], causes: { 'z.spec.js › lu': { famille: 'non-elucide', cause: 'Rouge à 7 passages sur 7, « Expected 1, Received 0 ».' } } });
            expect(dansLaRegle.status).toBe(0);
        } finally { rmSync(d, { recursive: true, force: true }); }
    });

    it('A.d le job de verdict juge contre cette liste', () => {
        expect(WORKFLOW).toContain('node ../scripts/juger-rapport-playwright.mjs rapport.json ../scripts/playwright-baseline-linux.json');
    });
});

describe('B — le jugement d’un commit : nuage vert + complément vert, pour CE sha', () => {
    const vert = (sha = SHA) => ({ sha, code: 0 });
    it('B.a les deux parts vertes pour ce commit ⮕ vert', () => {
        expect(jugerLeJeton({ nuage: vert(), complement: vert() }, SHA).code).toBe(0);
    });
    it('B.b le verdict complet du Mac reste accepté à lui seul (possible, plus exigé)', () => {
        expect(jugerLeJeton({ sha: SHA, code: 0 }, SHA).code).toBe(0);
    });
    it('B.c une seule part ne suffit pas ; une part d’un autre commit non plus ⮕ 3', () => {
        expect(jugerLeJeton({ nuage: vert() }, SHA).code).toBe(3);
        expect(jugerLeJeton({ complement: vert() }, SHA).code).toBe(3);
        expect(jugerLeJeton({ nuage: vert(), complement: vert(AUTRE) }, SHA).code).toBe(3);
        expect(jugerLeJeton({ nuage: vert(AUTRE), complement: vert() }, SHA).code).toBe(3);
        expect(jugerLeJeton({ sha: AUTRE, code: 0, nuage: vert(AUTRE), complement: vert(AUTRE) }, SHA).code).toBe(3);
    });
    it('B.d une rougeur constatée l’emporte : aucune part verte ne la rachète ⮕ 1', () => {
        expect(jugerLeJeton({ nuage: { sha: SHA, code: 1 }, complement: vert() }, SHA).code).toBe(1);
        expect(jugerLeJeton({ nuage: vert(), complement: { sha: SHA, code: 1 } }, SHA).code).toBe(1);
        expect(jugerLeJeton({ sha: SHA, code: 0, nuage: { sha: SHA, code: 1 } }, SHA).code).toBe(1);
        expect(jugerLeJeton({ sha: SHA, code: 1, nuage: vert(), complement: vert() }, SHA).code).toBe(1);
    });
    it('B.e un complément non jugé n’est pas vert ⮕ 3', () => {
        expect(jugerLeJeton({ nuage: vert(), complement: { sha: SHA, code: 2 } }, SHA).code).toBe(3);
    });
    it('B.f le lecteur, lancé comme le hook le lance, rend ces codes et nomme la part qui manque', () => {
        const d = mkdtempSync(path.join(tmpdir(), 'jeton-nuage-'));
        const lancer = (jeton) => {
            writeFileSync(path.join(d, 'j.json'), JSON.stringify(jeton));
            return spawnSync('node', [path.join(racine, 'scripts', 'lire-verdict.mjs'), SHA], { env: { ...process.env, VERDICT_PLAYWRIGHT: path.join(d, 'j.json') }, encoding: 'utf8' });
        };
        try {
            expect(lancer({ nuage: vert(), complement: vert() }).status).toBe(0);
            const manque = lancer({ nuage: vert() });
            expect(manque.status).toBe(3);
            expect(manque.stderr).toContain('Verdict du nuage : vert · complément du Mac : absent pour ce commit.');
            expect(lancer({ nuage: { sha: SHA, code: 1 }, complement: vert() }).status).toBe(1);
        } finally { rmSync(d, { recursive: true, force: true }); }
    });
});

describe('C — le complément du Mac : ce que Linux ne juge pas, et rien d’autre', () => {
    const liste = cfg.listeDuComplement();

    it('C.a la liste = les rouges constants + les intermittents de Linux + les exclus', () => {
        expect(liste.length).toBe(LINUX.echecsConnus.length + LINUX.echecsIntermittents.length + cfg.EXCLUS_WEBKIT_LINUX.length);
        expect(new Set(liste).size).toBe(liste.length);
        for (const id of [...LINUX.echecsConnus, ...LINUX.echecsIntermittents]) expect(liste).toContain(id);
    });

    it('C.b le motif d’une identité retrouve l’essai sous ses deux écritures (grep de Playwright, rapport)', () => {
        for (const id of liste) {
            const motif = cfg.motifDuComplement(id);
            expect(motif.test(id), id).toBe(true);
            expect(motif.test(`webkit integration/${id.split(' › ').join(' ')}`), id).toBe(true);
        }
        // Le motif suit les segments dans l'ordre : un autre titre, ou un autre fichier, n'est pas pris.
        expect(cfg.motifDuComplement('a.spec.js › bloc › titre (1)').test('a.spec.js › bloc › titre (2)')).toBe(false);
        expect(cfg.motifDuComplement('a.spec.js › bloc › titre (1)').test('b.spec.js › bloc › titre (1)')).toBe(false);
    });

    it('C.c la configuration ne filtre que sous PW_COMPLEMENT_MAC, que le script est seul à poser', () => {
        const config = lire('tests', 'playwright.config.js');
        expect(config).toContain("grep: process.env.PW_COMPLEMENT_MAC === '1' ? listeDuComplement().map(motifDuComplement) : undefined,");
        expect(lire('scripts', 'complement-mac.mjs')).toContain("PW_COMPLEMENT_MAC: '1'");
        expect(WORKFLOW).not.toContain('PW_COMPLEMENT_MAC');
    });

    it('C.d toute la liste jouée verte ⮕ vert ; une entrée non jouée ⮕ NON JUGÉ, nommée ; une rouge ⮕ rouge, nommée', () => {
        const juger = (essais) => jugerComplement({ rapport: rapport(essais), liste, motifDe: cfg.motifDuComplement, baselineMac: { echecsConnus: [] } });
        const tous = liste.map((id) => essaiDe(id, 'expected'));
        const vert = juger(tous);
        expect(vert).toMatchObject({ code: 0, essais: liste.length, verts: liste.length, rouges: [], nonJoues: [] });

        const sansLeDernier = juger(tous.slice(0, -1));
        expect(sansLeDernier.code).toBe(2);
        expect(sansLeDernier.nonJoues).toEqual([liste.at(-1)]);

        const sautee = juger([...tous.slice(0, -1), essaiDe(liste.at(-1), 'skipped')]);
        expect(sautee.code, 'un essai sauté n’a rien jugé').toBe(2);

        const rouge = juger([essaiDe(liste[0], 'unexpected'), ...tous.slice(1)]);
        expect(rouge.code).toBe(1);
        expect(rouge.rouges).toHaveLength(1);

        expect(juger([]).code, 'rien de joué n’est pas vert').toBe(2);
    });

    it('C.e il écrit SA part du jeton, avec sa durée, sans toucher aux autres', () => {
        const avant = { sha: AUTRE, code: 0, nuage: { sha: SHA, code: 0, run: 1 } };
        const apres = jetonAvecComplement(avant, { sha: SHA, jugement: { code: 0, essais: 57, verts: 57, rouges: [], instables: [], nonJoues: [] }, dureeS: 402, renduLe: 'x' });
        expect(apres.sha).toBe(AUTRE);
        expect(apres.nuage).toEqual(avant.nuage);
        expect(apres.complement).toMatchObject({ sha: SHA, code: 0, essais: 57, dureeS: 402 });
        expect(direDuree(402)).toBe('6 min 42 s');
        expect(direDuree(41)).toBe('41 s');
    });
});

describe('D — le relevé du verdict du nuage', () => {
    const run = (id, conclusion, extra = {}) => ({ id, titre: 'Verdict du nuage — lot/x', statut: 'completed', url: `u/${id}`, jobVerdict: conclusion ? { conclusion } : null, ...extra });

    it('D.a le plus récent verdict conclu l’emporte ; un job sauté ou annulé ne conclut rien', () => {
        expect(lireLesRuns([run(3, 'success'), run(2, 'failure')])).toMatchObject({ code: 0, run: 3 });
        expect(lireLesRuns([run(3, 'failure'), run(2, 'success')])).toMatchObject({ code: 1, run: 3 });
        expect(lireLesRuns([run(3, 'skipped'), run(2, 'cancelled'), run(1, 'success')])).toMatchObject({ code: 0, run: 1 });
        expect(lireLesRuns([run(3, null), run(2, 'skipped')]).code).toBe(3);
        expect(lireLesRuns([]).code).toBe(3);
    });

    it('D.b un run qui a joué une AUTRE référence ne juge pas le commit qui le porte', () => {
        const autre = run(9, 'success', { titre: `Verdict du nuage — ${MARQUE_AUTRE_REFERENCE} : lot/ailleurs` });
        expect(lireLesRuns([autre]).code).toBe(3);
        expect(lireLesRuns([autre, run(8, 'failure')])).toMatchObject({ code: 1, run: 8 });
        // Les deux bouts de la marque : le nom que le workflow donne au run, et le lecteur.
        expect(WORKFLOW).toMatch(new RegExp(`^run-name: .*format\\('${MARQUE_AUTRE_REFERENCE} : \\{0\\}', inputs\\.branche\\)`, 'm'));
    });

    it('D.c un run en cours se dit, sans passer pour un verdict', () => {
        const enCours = run(5, null, { statut: 'in_progress' });
        expect(lireLesRuns([enCours])).toMatchObject({ code: 3, enCours: { run: 5 } });
        expect(lireLesRuns([enCours, run(4, 'success')])).toMatchObject({ code: 0, run: 4, enCours: { run: 5 } });
    });

    it('D.d il écrit SA part du jeton sans toucher aux autres, et lit le job que le workflow nomme', () => {
        const avant = { complement: { sha: SHA, code: 0 } };
        const apres = jetonAvecNuage(avant, { sha: SHA, lecture: { code: 0, run: 7, url: 'u' }, luLe: 'x' });
        expect(apres.complement).toEqual(avant.complement);
        expect(apres.nuage).toEqual({ sha: SHA, code: 0, run: 7, url: 'u', luLe: 'x' });
        expect(WORKFLOW).toContain(`    name: ${JOB_VERDICT}`);
    });
});

describe('D bis — le report : un commit sans rien d’observable garde le verdict de son ancêtre', () => {
    const OBSERVABLE = ['js/', 'tests/', 'index.html'];
    it('D.e un rapport ou un relais posé après le verdict ne le périme pas ; un fichier observable, si', () => {
        const depuis = { c1: ['plans de travail/RAPPORT.md'], c2: ['plans de travail/RAPPORT.md', 'RELAIS.md'], c3: ['RELAIS.md', 'js/main.js'], c4: ['RELAIS.md'] };
        expect(commitsQuiValent('tete', ['c1', 'c2', 'c3', 'c4'], (c) => depuis[c], OBSERVABLE)).toEqual(['tete', 'c1', 'c2']);
        expect(commitsQuiValent('tete', ['c3'], (c) => depuis[c], OBSERVABLE)).toEqual(['tete']);
        expect(commitsQuiValent('tete', [], () => [], OBSERVABLE)).toEqual(['tete']);
    });
    it('D.f le jeton dit sur quel commit le verdict a été rendu, quand ce n’est pas celui qui part', () => {
        expect(jetonAvecNuage({}, { sha: SHA, lecture: { code: 0, run: 7, url: 'u', jugeSur: AUTRE }, luLe: 'x' }).nuage).toEqual({ sha: SHA, code: 0, run: 7, url: 'u', luLe: 'x', jugeSur: AUTRE });
        expect(jetonAvecNuage({}, { sha: SHA, lecture: { code: 0, run: 7, url: 'u', jugeSur: SHA }, luLe: 'x' }).nuage.jugeSur).toBeUndefined();
    });
});

describe('E — le déclencheur : une branche se juge avant sa fusion, à la demande', () => {
    it('E.a le lancement à la demande porte le champ `branche`, facultatif et vide par défaut', () => {
        const champ = tranche(WORKFLOW, '\n  workflow_dispatch:\n    inputs:\n      branche:\n', '\npermissions:\n', { longueurMin: 60 });
        expect(champ).toContain("\n        required: false\n        type: string\n        default: ''\n");
    });

    it('E.b Vitest, la décision et les morceaux jouent la référence jugée ; le verdict garde le juge d’où part le run', () => {
        const job = (nom, suivant) => tranche(WORKFLOW, `\n  ${nom}:\n`, suivant ? `\n  ${suivant}:\n` : undefined, { longueurMin: 400 });
        const ref = 'ref: ${{ inputs.branche || github.sha }}';
        expect(job('vitest', 'decision')).toContain(ref);
        expect(job('decision', 'playwright')).toContain(ref);
        expect(job('playwright', 'verdict')).toContain(ref);
        expect(job('verdict')).not.toContain('inputs.branche');
    });

    it('E.c la décision dit le commit jugé, là où le téléphone le lit', () => {
        expect(WORKFLOW).toContain('juge="$(git rev-parse HEAD)"');
        expect(WORKFLOW).toMatch(/Commit jugé : \$juge .* >> "\$GITHUB_STEP_SUMMARY"/);
    });
});
