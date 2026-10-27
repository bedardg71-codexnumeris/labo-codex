import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    CODES, planDesMorceaux, jugerRapportFusionne, listeObservable, fichiersQuiFaussent,
    cheminsDuStatut, conditionsDuReport, jetonDeVerdict, executerVerdict, executerReport
} from '../../scripts/verdict-en-morceaux.mjs';

// SENTINELLE — 26 OCTOBRE 2026 · LE VERDICT DU MAC EN MORCEAUX, OUTILLÉ (tri de Git, volet B).
//
// scripts/verdict-en-morceaux.mjs fait ce que Claude Code faisait à la main :
// jouer les morceaux l'un après l'autre, fusionner, juger contre la baseline
// commune, écrire le jeton ; et reporter un verdict vert sur un commit qui ne
// touche que des tests et des plans. Ces essais ne lancent AUCUN navigateur :
// les effets (Playwright, git, pmset) sont des doublures, les rapports sont
// factices. Ce qu'ils gardent : un morceau manquant, une spec non jouée ou un
// sommet qui bouge ne passent JAMAIS pour du vert ; un report ne passe jamais
// sur un diff qui touche l'application.
//
// BREAK-TESTS (faits le 26 octobre, consignés dans
// plans de travail/DEMANDE-RELECTURE-2026-10-26-tri-de-git.md) :
// - la garde des specs prévues absentes retirée de jugerRapportFusionne → A.c et E.c rouges ;
// - `cheminReportable` qui accepte tout `tests/` → C.c rouge ;
// - le compte des rapports (`recus !== total`) retiré → D.b rouge ;
// - le contrôle du sommet après chaque morceau retiré → D.c rouge ;
// - le rejeu des specs touchées sauté dans executerReport → E.a, E.b et E.c rouges.
// Chaque fois, le script restauré : `shasum` identique.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

/** Un rapport JSON minimal, à la forme de `merge-reports --reporter=json`. */
function rapport(specs, { errors = [] } = {}) {
    const compte = (statut) => specs.filter((s) => s.statut === statut).length;
    return {
        suites: [...new Set(specs.map((s) => s.file))].map((file) => ({
            file, specs: [], suites: [{
                specs: specs.filter((s) => s.file === file).map((s) => ({
                    file, title: s.titre, ok: s.statut !== 'unexpected', tests: [{ status: s.statut }]
                }))
            }]
        })),
        errors,
        stats: { expected: compte('expected'), unexpected: compte('unexpected'), flaky: compte('flaky'), skipped: compte('skipped') }
    };
}
const vert = (file, titre = 't') => ({ file, titre, statut: 'expected' });

describe('A — le jugement du rapport fusionné', () => {
    it('A.a tout vert ⮕ 0 ; une rougeur connue de la baseline ⮕ 0 ; une neuve ⮕ 1, nommée', () => {
        expect(jugerRapportFusionne(rapport([vert('a.spec.js')]), [], ['a.spec.js']).code).toBe(CODES.VERT);
        const connu = rapport([vert('a.spec.js'), { file: 'b.spec.js', titre: 'x', statut: 'unexpected' }]);
        expect(jugerRapportFusionne(connu, ['b.spec.js › x'], ['a.spec.js', 'b.spec.js']).code).toBe(CODES.VERT);
        const j = jugerRapportFusionne(connu, [], ['a.spec.js', 'b.spec.js']);
        expect(j.code).toBe(CODES.ROUGE);
        expect(j.nouveaux).toEqual(['b.spec.js › x']);
    });

    it('A.b aucun essai joué, ou une erreur hors essai ⮕ 2 (NON JUGÉ), jamais 0', () => {
        expect(jugerRapportFusionne(rapport([]), [], []).code).toBe(CODES.NON_JUGE);
        expect(jugerRapportFusionne(rapport([vert('a.spec.js')], { errors: [{ message: 'Error: chargement\n at' }] }), [], ['a.spec.js']).code).toBe(CODES.NON_JUGE);
    });

    it('A.c une spec PRÉVUE absente du rapport ⮕ 2 : non jouée n’est pas verte', () => {
        const j = jugerRapportFusionne(rapport([vert('a.spec.js')]), [], ['a.spec.js', 'b.spec.js']);
        expect(j.code).toBe(CODES.NON_JUGE);
        expect(j.raison).toContain('b.spec.js');
    });

    it('A.d une verte au second essai ne bloque pas, mais se garde', () => {
        const j = jugerRapportFusionne(rapport([{ file: 'a.spec.js', titre: 'r', statut: 'flaky' }]), [], ['a.spec.js']);
        expect(j.code).toBe(CODES.VERT);
        expect(j.instables).toEqual(['a.spec.js › r']);
    });
});

describe('B — le découpage, la copie de travail, le jeton', () => {
    it('B.a dix morceaux : chaque spec dans un seul, en alternance', () => {
        const specs = Array.from({ length: 23 }, (_, i) => `s${String(i).padStart(2, '0')}.spec.js`);
        const plan = planDesMorceaux(specs, 10);
        expect(plan).toHaveLength(10);
        expect(plan.flat().sort()).toEqual(specs);
        expect(plan[0]).toEqual(['s00.spec.js', 's10.spec.js', 's20.spec.js']);
    });

    it('B.b la liste OBSERVABLE est lue dans le vrai tests.yml ; un fichier modifié hors commit qui s’y trouve fausse le verdict', () => {
        const observable = listeObservable(readFileSync(path.join(racine, '.github', 'workflows', 'tests.yml'), 'utf8'));
        expect(observable).toContain('js/');
        expect(fichiersQuiFaussent(['js/main.js', 'plans de travail/x.md', 'index.html'], observable)).toEqual(['js/main.js', 'index.html']);
        expect(fichiersQuiFaussent(['plans de travail/x.md', 'RELAIS.md'], observable)).toEqual([]);
    });

    it('B.c le statut git -z : chemins à espaces entiers, ancien chemin d’un renommage compris', () => {
        const sortie = [' M plans de travail/a b.md', 'R  js/neuf.js', 'js/ancien.js', '?? tests/unit/x.test.js', ''].join('\0');
        expect(cheminsDuStatut(sortie)).toEqual(['plans de travail/a b.md', 'js/neuf.js', 'js/ancien.js', 'tests/unit/x.test.js']);
    });

    it('B.d le jeton a la forme de verifier-playwright.mjs, et lire-verdict.mjs l’accepte pour CE sha seulement', () => {
        const dossier = mkdtempSync(path.join(tmpdir(), 'jeton-morceaux-'));
        try {
            const fichier = path.join(dossier, 'verdict.json');
            const jeton = jetonDeVerdict({ sha: 'abc123', code: 0, echecs: ['x › y'], instables: [], garde: { raison: 'r' } });
            expect(Object.keys(jeton)).toEqual(['_lisezMoi', 'sha', 'code', 'echecsConnus', 'instables', 'garde', 'rendule']);
            expect(jeton.echecsConnus).toBe(1);
            writeFileSync(fichier, JSON.stringify(jeton), 'utf8');
            const lire = (sha) => spawnSync('node', [path.join(racine, 'scripts', 'lire-verdict.mjs'), sha], { env: { ...process.env, VERDICT_PLAYWRIGHT: fichier } }).status;
            expect(lire('abc123')).toBe(0);
            expect(lire('autre')).toBe(3);
        } finally {
            rmSync(dossier, { recursive: true, force: true });
        }
    });
});

describe('C — les conditions du report', () => {
    const base = { jeton: { sha: 'a', code: 0 }, tete: 'b', estAncetre: true, existe: () => true };

    it('C.a seulement des plans et des essais unitaires ⮕ permis, rien à rejouer', () => {
        const c = conditionsDuReport({ ...base, fichiersDuDiff: ['plans de travail/x.md', 'tests/unit/y.test.js'] });
        expect(c).toEqual({ ok: true, dejaAJour: false, aRejouer: [] });
    });

    it('C.b une spec touchée ⮕ permis, et ELLE est à rejouer (une spec supprimée, non)', () => {
        const c = conditionsDuReport({ ...base, existe: (f) => !f.includes('partie'), fichiersDuDiff: ['tests/integration/lot-c.spec.js', 'tests/integration/partie.spec.js'] });
        expect(c.aRejouer).toEqual(['lot-c.spec.js']);
    });

    it('C.c l’application, la configuration ou le lock des tests ⮕ refusé, nommé', () => {
        for (const f of ['js/main.js', 'styles.css', 'index.html', 'version.json', 'tests/playwright.config.js', 'tests/package-lock.json', 'tests/integration/_aides/commun.js']) {
            const c = conditionsDuReport({ ...base, fichiersDuDiff: ['plans de travail/x.md', f] });
            expect(c.ok, f).toBe(false);
            expect(c.raison).toContain(f);
        }
    });

    it('C.d jeton absent, rouge, ou pas un ancêtre ⮕ refusé ; jeton déjà sur HEAD ⮕ rien à faire', () => {
        expect(conditionsDuReport({ ...base, jeton: null, fichiersDuDiff: [] }).ok).toBe(false);
        expect(conditionsDuReport({ ...base, jeton: { sha: 'a', code: 1 }, fichiersDuDiff: [] }).ok).toBe(false);
        expect(conditionsDuReport({ ...base, estAncetre: false, fichiersDuDiff: [] }).ok).toBe(false);
        expect(conditionsDuReport({ ...base, tete: 'a', fichiersDuDiff: [] }).dejaAJour).toBe(true);
    });
});

/** Les effets du verdict en morceaux, en doublures. `surcharges` change l'une d'elles. */
function effetsVerdict(surcharges = {}) {
    const ecrits = [];
    const specs = ['a.spec.js', 'b.spec.js', 'c.spec.js'];
    const joues = [];
    const effets = {
        sha: () => 'sommet', fichiersSales: () => [], observable: () => ['js/'], specs: () => specs,
        tenirEveil: () => null, releverMemoire: () => null, maintenant: () => 0, veilles: () => [],
        jouerMorceau: async (k) => { joues.push(k); return 0; },
        blobs: () => joues.map((k) => `report-${k}.zip`),
        fusionner: () => rapport(specs.map((f) => vert(f))),
        baseline: () => [],
        ecrireJeton: (j) => ecrits.push(j), dire: () => {},
        ...surcharges
    };
    return { effets, ecrits, joues };
}

describe('D — le verdict en morceaux (effets en doublures)', () => {
    it('D.a trois morceaux joués dans l’ordre, fusionnés, jugés : jeton vert sur le sommet', async () => {
        const { effets, ecrits, joues } = effetsVerdict();
        const r = await executerVerdict(effets, { total: 3 });
        expect(joues).toEqual([1, 2, 3]);
        expect(r.code).toBe(CODES.VERT);
        expect(ecrits).toHaveLength(1);
        expect(ecrits[0]).toMatchObject({ sha: 'sommet', code: 0 });
        expect(ecrits[0].garde.raison).toContain('3 essais en 3 morceaux');
    });

    it('D.b un rapport manquant ⮕ NON JUGÉ (2), et le jeton le dit', async () => {
        const { effets, ecrits } = effetsVerdict({ blobs: () => ['report-1.zip', 'report-2.zip'] });
        const r = await executerVerdict(effets, { total: 3 });
        expect(r.code).toBe(CODES.NON_JUGE);
        expect(ecrits[0]).toMatchObject({ code: 2 });
        expect(ecrits[0].garde.nonJuge).toBe('rapports');
    });

    it('D.c le sommet bouge pendant un morceau ⮕ NON JUGÉ : le verdict ne couvre aucun commit', async () => {
        let n = 0;
        const { effets, joues } = effetsVerdict({ sha: () => (n++ < 2 ? 'sommet' : 'autre') });
        const r = await executerVerdict(effets, { total: 3 });
        expect(r.code).toBe(CODES.NON_JUGE);
        expect(r.garde.nonJuge).toBe('sommet');
        expect(joues.length).toBeLessThan(3);
    });

    it('D.d du code modifié hors commit ⮕ NON JUGÉ avant le premier morceau', async () => {
        const { effets, joues } = effetsVerdict({ fichiersSales: () => ['js/main.js'] });
        expect((await executerVerdict(effets, { total: 3 })).code).toBe(CODES.NON_JUGE);
        expect(joues).toEqual([]);
    });

    it('D.e la mémoire au-delà du seuil avant un morceau ⮕ NON JUGÉ ; l’éveil refusé ⮕ NON JUGÉ', async () => {
        const memoire = effetsVerdict({ releverMemoire: () => ({ instant: 'x', echangeMo: 11 * 1024, pression: 1 }) });
        expect((await executerVerdict(memoire.effets, { total: 3 })).garde.nonJuge).toBe('mémoire');
        const eveil = effetsVerdict({ tenirEveil: () => ({ ok: false, raison: 'sur batterie' }) });
        expect((await executerVerdict(eveil.effets, { total: 3 })).garde.nonJuge).toBe('éveil');
    });

    it('D.f une rougeur neuve ⮕ 1, jeton rouge ; une connue de la baseline ⮕ 0', async () => {
        const rouge = () => rapport([vert('a.spec.js'), vert('b.spec.js'), { file: 'c.spec.js', titre: 't', statut: 'unexpected' }]);
        const neuve = effetsVerdict({ fusionner: rouge });
        expect((await executerVerdict(neuve.effets, { total: 3 })).code).toBe(CODES.ROUGE);
        expect(neuve.ecrits[0].code).toBe(1);
        const connue = effetsVerdict({ fusionner: rouge, baseline: () => ['c.spec.js › t'] });
        expect((await executerVerdict(connue.effets, { total: 3 })).code).toBe(CODES.VERT);
    });
});

/** Les effets du report, en doublures. */
function effetsReport(surcharges = {}) {
    const ecrits = [];
    const rejoues = [];
    const effets = {
        sha: () => 'tete', fichiersSales: () => [], observable: () => ['js/'],
        lireJeton: () => ({ sha: 'juge', code: 0, echecsConnus: 0, instables: [], garde: { raison: '1 046 essais en 10 morceaux' } }),
        estAncetre: () => true,
        diff: () => ['plans de travail/x.md', 'tests/integration/lot-c.spec.js'],
        existe: () => true,
        rejouer: async (filtres) => { rejoues.push(...filtres); return rapport([vert('lot-c.spec.js')]); },
        ecrireJeton: (j) => ecrits.push(j), dire: () => {},
        ...surcharges
    };
    return { effets, ecrits, rejoues };
}

describe('E — le report du verdict (effets en doublures)', () => {
    it('E.a diff de tests, spec touchée rejouée verte ⮕ jeton vert sur HEAD, sa raison dit les trois conditions', async () => {
        const { effets, ecrits, rejoues } = effetsReport();
        expect((await executerReport(effets)).code).toBe(CODES.VERT);
        expect(rejoues).toEqual(['integration/lot-c\\.spec\\.js$']);
        expect(ecrits[0]).toMatchObject({ sha: 'tete', code: 0 });
        expect(ecrits[0].garde.raison).toMatch(/REPORT du verdict vert de juge.*\(1\).*\(2\).*lot-c\.spec\.js.*\(3\)/);
        expect(ecrits[0].garde.report).toMatchObject({ de: 'juge', verdictComplet: 'juge', rejouees: ['lot-c.spec.js'] });
    });

    it('E.b la spec touchée rouge au rejeu ⮕ refusé (3), aucun jeton', async () => {
        const { effets, ecrits } = effetsReport({ rejouer: async () => rapport([{ file: 'lot-c.spec.js', titre: 't', statut: 'unexpected' }]) });
        expect((await executerReport(effets)).code).toBe(CODES.REPORT_REFUSE);
        expect(ecrits).toEqual([]);
    });

    it('E.c la spec touchée absente du rapport de rejeu ⮕ refusé : non jouée n’est pas verte', async () => {
        const { effets, ecrits } = effetsReport({ rejouer: async () => rapport([vert('autre.spec.js')]) });
        expect((await executerReport(effets)).code).toBe(CODES.REPORT_REFUSE);
        expect(ecrits).toEqual([]);
    });

    it('E.d un diff qui touche js/ ⮕ refusé sans rien rejouer', async () => {
        const { effets, ecrits, rejoues } = effetsReport({ diff: () => ['tests/integration/lot-c.spec.js', 'js/main.js'] });
        expect((await executerReport(effets)).code).toBe(CODES.REPORT_REFUSE);
        expect(rejoues).toEqual([]);
        expect(ecrits).toEqual([]);
    });
});
