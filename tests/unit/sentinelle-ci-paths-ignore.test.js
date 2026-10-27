import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche, position } from './_helpers/tranche.js';

// SENTINELLE-CLIQUET — 23 AOÛT 2026 · L'OPTIMISATION DE LA CI NE DOIT PAS
// CRÉER D'ANGLE MORT.
//
// POURQUOI CE FICHIER EXISTE. Depuis le 21 août, le workflow Actions ne
// démarre plus : aucun runner ne lui est assigné et il « échoue » en 3-5 s.
// La cause exacte n'est pas établissable depuis le dépôt (voir l'en-tête de
// .github/workflows/tests.yml), mais une chose l'est : ce workflow coûtait
// **12,5 minutes par run** — mesuré sur le dernier run complet du 18 août — et
// sur les 87 derniers runs, 61 ont été annulés et aucun n'a réussi. Une bonne
// part partait sur des commits PUREMENT DOCUMENTAIRES.
//
// D'où un `paths-ignore` : un commit qui ne touche que de la doc ne déclenche
// plus la CI. C'est un gain réel, ET UN RISQUE : si un test se met un jour à
// LIRE un fichier de ces dossiers, sa régression passerait inaperçue — la CI
// ne tournerait pas sur le commit qui l'a causée.
//
// ⮕ Ce cliquet lie les deux : la liste `paths-ignore` du workflow et ce que
//   les tests lisent réellement. L'une ne peut plus bouger sans l'autre.
//
// ⚠ `.claude/**` EST VOLONTAIREMENT ABSENT de `paths-ignore` :
// `sentinelle-skill-alignement.test.js` lit
// `.claude/skills/alignement/SKILL.md`. C'est précisément le cas que ce cliquet
// existe pour empêcher de reproduire ailleurs.
//
// BREAK-TEST (fait le 23 août 2026) — faire lire `docs/DEPLOY.md` à un test
// (`readFileSync(path.join(racine, 'docs', 'x.md'))`) → le cliquet rougit en
// nommant le fichier et le chemin ignoré.
//
// ↻ BLOC 2, AJOUTÉ LE 2 SEPTEMBRE 2026 — LA MÊME RÈGLE POUR LA CONDITION
// PLAYWRIGHT. Le workflow est devenu deux jobs : `vitest` juge tout, `playwright`
// ne tourne que si le push touche un chemin de la liste `OBSERVABLE` (env du job
// `vitest`). Même gain, même risque, même cliquet : si un spec de
// tests/integration/ se met à LIRE un chemin absent de cette liste, sa régression
// passerait sans Playwright. Ce bloc lie la liste à ce que les specs lisent.
// BREAK-TESTS (faits le 2 septembre) — retirer `scripts/` de OBSERVABLE → rouge
// (deux specs lisent scripts/) ; faire lire `docs/x.md` à un spec → rouge.
//
// ↻ BLOC 2 RÉÉCRIT LE 20 SEPTEMBRE 2026 — PLAYWRIGHT A QUITTÉ LA VOIE DU PUSH.
// Décision de Grégoire (journal de tests.yml, point 7) : la suite entière, mais
// une fois par jour (`schedule`) et à la demande (`workflow_dispatch`) — le Mac
// la fait déjà tourner avant chaque push. L'intention du bloc ne change pas : le
// workflow ne peut pas dériver en silence. Ce qu'il verrouille maintenant : trois
// jobs ; `playwright` ne dépend que de `garde`, et `garde` ne part JAMAIS sur un
// push ; le cron est celui-là ; la garde d'inutilité existe, est appelée, et
// DÉCIDE (banc git jetable : le vrai script, six cas). La liste `OBSERVABLE`
// reste — elle a trois lecteurs vivants (lot-observable.sh, la garde, ce bloc).
// BREAK-TESTS (faits le 20 septembre) — `|| github.event_name == 'push'` ajouté
// au `if:` de `garde` → rouge ; le bloc `schedule:` retiré → rouge ; la garde
// remplacée par `echo "oui"` dans le script → rouge (banc), et l'appel du script
// remplacé par `juger=oui` dans le workflow → rouge.
//
// ↻ BLOC 2 RÉÉCRIT LE 10 OCTOBRE 2026 — LE PASSAGE DE NUIT EST RETIRÉ (#1048).
// Décision de Grégoire (journal de tests.yml, point 8) : les huit derniers runs
// planifiés étaient coupés à 60 min ; Playwright ne part plus qu'à la demande.
// La garde d'inutilité et son script sont retirés avec lui (sur une demande, elle
// répondait toujours « oui »). Ce qu'il verrouille maintenant : deux jobs ;
// `playwright` ne part QUE sur `workflow_dispatch` ; aucun `schedule` ne revient ;
// Vitest garde le push. `OBSERVABLE` a deux lecteurs vivants (lot-observable.sh,
// ce bloc).
// BREAK-TESTS (faits le 10 octobre) — `|| github.event_name == 'push'` ajouté au
// `if:` de `playwright` → rouge ; un bloc `schedule:` remis → rouge ; un job
// `garde` remis → rouge.
//
// ↻ BLOC 2 RÉÉCRIT LE 16 OCTOBRE 2026 — LE DÉPÔT EST PUBLIC, PLAYWRIGHT PART EN
// MORCEAUX (journal de tests.yml, point 9). Quatre jobs : `vitest` juge tout ;
// `decision` dit si Playwright juge (à la demande : oui ; sur un push : si le lot
// touche un chemin OBSERVABLE, par scripts/lot-observable.sh ; sur une pull
// request : sauté) et porte le nombre de morceaux ; `playwright` joue en
// morceaux et ne juge pas ; `verdict` fusionne et juge contre la baseline. Ce
// qu'il verrouille : ce câblage ; aucun `schedule` ; un saut reste `skipped` ; la
// décision appelle la règle du crochet au lieu d'en porter une copie, et DÉCIDE
// (banc git jetable : le vrai script, cinq cas).
// BREAK-TESTS (faits le 16 octobre) — `|| github.event_name == 'pull_request'`
// ajouté au `if:` de `decision` → rouge ; `juger=non` forcé sur le push dans le
// script → rouge (banc) ; `&& needs.playwright.result != 'skipped'` retiré du
// verdict → rouge.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const dossierTests = path.join(racineProjet, 'tests');

const workflow = readFileSync(
    path.join(racineProjet, '.github', 'workflows', 'tests.yml'), 'utf8');

/** Les entrées `paths-ignore` déclarées par le workflow. */
function cheminsIgnores() {
    const bloc = /paths-ignore:\s*&doc\n([\s\S]*?)\n  pull_request:/.exec(workflow);
    if (!bloc) return null;
    return bloc[1]
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith("- '"))
        .map((l) => l.slice(3, -1));       // - 'docs/**'  →  docs/**
}

/**
 * Retire commentaires de bloc et lignes de commentaire.
 * Les `//` en fin de ligne de code sont conservés : les couper demanderait de
 * distinguer une URL (`https://`) d'un commentaire, et aucun cas réel ne
 * l'exige ici.
 */
function sansCommentaires(src) {
    return src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter((l) => !l.trim().startsWith('//'))
        .join('\n');
}

/** Tous les fichiers de test, récursivement. */
function fichiersDeTest(dossier = dossierTests, acc = []) {
    for (const entree of readdirSync(dossier, { withFileTypes: true })) {
        if (entree.name === 'node_modules' || entree.name === 'test-results') continue;
        const complet = path.join(dossier, entree.name);
        if (entree.isDirectory()) fichiersDeTest(complet, acc);
        else if (/\.(test|spec)\.js$/.test(entree.name) || entree.name.endsWith('.js')) acc.push(complet);
    }
    return acc;
}

describe('CI · le `paths-ignore` du workflow ne masque aucun test', () => {
    it('le workflow déclare bien une liste `paths-ignore`', () => {
        const liste = cheminsIgnores();
        expect(liste, 'bloc `paths-ignore: &doc` introuvable dans .github/workflows/tests.yml')
            .not.toBeNull();
        expect(liste.length, 'la liste ignorée est vide — le gain de minutes disparaît')
            .toBeGreaterThan(0);
    });

    it('l\'ancre YAML est réutilisée par `pull_request` (une seule liste, pas deux)', () => {
        // Deux listes qui divergent, c'est la porte ouverte à un `push` ignoré
        // et une `pull_request` déclenchée — ou l'inverse, en silence.
        expect(workflow).toMatch(/pull_request:[\s\S]{0,120}paths-ignore: \*doc/);
    });

    it('AUCUN test ne LIT un chemin déclaré dans `paths-ignore`', () => {
        const ignores = cheminsIgnores() || [];
        // `docs/**` → `docs`, `RELAIS.md` → `RELAIS.md`
        const racines = ignores.map((p) => p.replace(/\/\*\*$/, ''));

        const coupables = [];
        for (const fichier of fichiersDeTest()) {
            // On lit le CODE, pas les commentaires. Des dizaines de fichiers
            // citent `docs/securite/…` ou le BACKLOG dans leur en-tête, et le
            // break-test de CE fichier écrit lui-même un appel d'exemple :
            // sans ce nettoyage, le cliquet s'attrape lui-même (constaté au
            // premier lancement, 23 août).
            const src = sansCommentaires(readFileSync(fichier, 'utf8'));
            // On ne cherche que dans les APPELS de lecture / construction de
            // chemin : une simple mention en commentaire est légitime, et il y
            // en a des dizaines (références à docs/securite/, au BACKLOG…).
            const appels = src.match(/(?:readFileSync|existsSync|readdirSync|path\.join)\([^)]*\)/g) || [];
            for (const appel of appels) {
                for (const r of racines) {
                    // On exige le chemin ENTRE GUILLEMETS pour éviter les
                    // faux positifs sur des fragments de mots.
                    if (appel.includes(`'${r}'`) || appel.includes(`"${r}"`) ||
                        appel.includes(`'${r}/`) || appel.includes(`"${r}/`)) {
                        coupables.push(`${path.relative(racineProjet, fichier)} → ${r}\n      ${appel.trim()}`);
                    }
                }
            }
        }

        expect(
            coupables,
            'Ces tests LISENT un chemin que la CI ignore : leur régression ne serait pas\n' +
            'attrapée, puisque le commit fautif ne déclencherait aucun run.\n' +
            'Deux issues : retirer ce chemin de `paths-ignore`, ou cesser de le lire.\n  ' +
            coupables.join('\n  ')
        ).toEqual([]);
    });

    it('`.claude/**` n\'est PAS ignoré — un test y lit un skill', () => {
        const ignores = cheminsIgnores() || [];
        expect(ignores.some((p) => p.startsWith('.claude')),
            'sentinelle-skill-alignement.test.js lit .claude/skills/alignement/SKILL.md : ' +
            'ignorer ce dossier rendrait sa régression invisible').toBe(false);
    });
});

describe('CI · Playwright juge à la demande et sur un push observable, en morceaux ; Vitest juge chaque push', () => {
    /** La liste `OBSERVABLE` du workflow (env global) — l'unique source que le shell lit. */
    function cheminsObservables() {
        const m = /^\s*OBSERVABLE:\s*"([^"]+)"/m.exec(workflow);
        return m ? m[1].trim().split(/\s+/) : null;
    }
    const estObservable = (chemin, liste) => liste.some((e) =>
        e.endsWith('/') ? chemin.startsWith(e) : chemin === e);

    // Hors commentaires : le journal en tête NOMME ce qui a été retiré.
    const code = workflow.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
    const bloc = (job, fin = '\n    steps:\n') => tranche(workflow, `\n  ${job}:\n`, fin);
    const conditionDe = (job) => (bloc(job).match(/^    if:.*$/m) || [null])[0];

    it('quatre jobs : vitest, decision, playwright (en morceaux), verdict — pas de garde de nuit', () => {
        for (const job of ['vitest', 'decision', 'playwright', 'verdict']) {
            expect(workflow, `job \`${job}\` absent`).toMatch(new RegExp(`^  ${job}:\\n`, 'm'));
        }
        expect(code, 'un job `garde` est revenu : le passage de nuit est retiré (#1048)').not.toMatch(/^  garde:/m);
        expect(code).not.toMatch(/ci-garde-inutilite/);
        expect(existsSync(path.join(racineProjet, 'scripts', 'ci-garde-inutilite.sh')), 'le script de la garde est revenu').toBe(false);
        // Vitest garde le push, la pull_request et la demande : aucun `if:`, aucune dépendance.
        expect(bloc('vitest')).not.toMatch(/^    (if|needs):/m);
    });

    it('la décision part à la demande et sur le push — JAMAIS sur une pull request', () => {
        expect(conditionDe('decision')).toBe("    if: github.event_name == 'workflow_dispatch' || github.event_name == 'push'");
    });

    it('les morceaux dépendent de la décision ; leur nombre vit en UN endroit', () => {
        const morceaux = bloc('playwright');
        expect(morceaux).toMatch(/^    needs: decision$/m);
        expect(conditionDe('playwright')).toBe("    if: needs.decision.outputs.juger == 'oui'");
        expect(morceaux).toMatch(/morceau: \$\{\{ fromJSON\(needs\.decision\.outputs\.morceaux\) \}\}/);
        expect(morceaux).toMatch(/fail-fast: false/);
        expect((code.match(/^\s*total=\d+$/gm) || []).length, 'le nombre de morceaux doit vivre UNE fois').toBe(1);
        // Les fichiers en alternance (scripts/morceau-playwright.mjs), pas `--shard` :
        // ses tranches contiguës regroupaient les specs lentes (point 9a).
        expect(workflow).toMatch(/node \.\.\/scripts\/morceau-playwright\.mjs \$\{\{ matrix\.morceau \}\} \$\{\{ needs\.decision\.outputs\.total \}\}/);
        expect(code).not.toMatch(/--shard/);
        expect(workflow).toMatch(/PLAYWRIGHT_BLOB_OUTPUT_NAME: report-\$\{\{ matrix\.morceau \}\}\.zip/);
    });

    it('point 10 : l’étape apt est bornée — un miroir lent ne coupe plus le morceau entier', () => {
        const etape = tranche(workflow, '- name: Dépendances système de WebKit\n', '\n      - name:');
        // Les 8 morceaux coupés des runs 40326337181 et 40412553265 l'étaient dans apt.
        expect(etape, 'plafond propre à l’étape').toMatch(/^        timeout-minutes: \d+$/m);
        expect(etape, 'chaque essai borné').toMatch(/timeout --kill-after=\d+ \d+ npx playwright install-deps webkit/);
        expect(etape, 'plusieurs essais').toMatch(/for essai in 1 2 3; do/);
        expect(etape, 'le miroir lent quitte la liste après un échec').toMatch(/sed -i '\/azure\\\.archive\\\.ubuntu\\\.com\/d' \/etc\/apt\/apt-mirrors\.txt/);
        expect(etape, 'un nu `npx playwright install-deps` sans borne est revenu').not.toMatch(/^\s*(run: )?npx playwright install-deps webkit$/m);
    });

    it('un morceau ne juge pas : il garde le code de Playwright et dépose son rapport, ou rougit', () => {
        const etapes = tranche(workflow, '\n  playwright:\n', '\n  verdict:\n');
        expect(etapes).toMatch(/\|\| code=\$\?/);
        expect(etapes).toMatch(/--reporter=blob,list/);
        expect(etapes).toMatch(/if-no-files-found: error/);
    });

    it('le verdict juge l’ensemble contre la baseline ; il est sauté si les morceaux le sont', () => {
        const verdict = tranche(workflow, '\n  verdict:\n', 'juger-rapport-playwright.mjs rapport.json');
        expect(verdict).toMatch(/^    needs: \[decision, playwright\]$/m);
        expect(conditionDe('verdict')).toBe("    if: ${{ !cancelled() && needs.playwright.result != 'skipped' }}");
        // Un morceau sans rapport = des essais NON JUGÉS : le verdict compte avant de juger.
        expect(verdict).toMatch(/\[ "\$recus" = "\$TOTAL" \] \|\| \{/);
        expect(verdict).toMatch(/npx playwright merge-reports --config playwright\.config\.js --reporter=json/);
        // Un job sauté doit rester `skipped` : pas de `continue-on-error`, pas de
        // `if: always()` qui transformerait un saut en vert.
        expect(workflow).not.toMatch(/if:\s*always\(\)/);
        expect(workflow).not.toMatch(/continue-on-error/);
    });

    it('aucun passage de nuit : pas de `schedule`, le lancement à la demande reste', () => {
        const declencheurs = tranche(workflow, '\non:\n', '\npermissions:\n');
        const codeDecl = declencheurs.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
        expect(codeDecl, 'le passage de nuit est revenu (#1048)').not.toMatch(/schedule:|- cron:/);
        expect(codeDecl).toMatch(/^  workflow_dispatch:/m);
        // Un push ne doit pas annuler un run lancé à la demande.
        expect(workflow).toMatch(/^  group: tests-\$\{\{ github\.ref \}\}-\$\{\{ github\.event_name \}\}$/m);
    });

    describe('la décision DÉCIDE — banc git jetable, le vrai script', () => {
        // Le script de l'étape « Décider », tel que le workflow le porte.
        const script = (() => {
            const t = tranche(workflow, '      - name: Décider\n', '\n\n');
            return t.slice(position(t, 'run: |\n') + 'run: |\n'.length)
                .split('\n').map((l) => l.replace(/^ {10}/, '')).join('\n');
        })();

        it('il appelle la règle du crochet (lot-observable.sh), sans en porter de copie', () => {
            expect(script).toMatch(/^\s*\. scripts\/lot-observable\.sh$/m);
            expect(script).toMatch(/\| lot_observable/);
            expect(script).not.toMatch(/grep -/);
        });

        // ⚠ SANS LES VARIABLES GIT_* (16 oct. 2026, vécu) : lancé par le crochet
        // pré-push, ce banc héritait de GIT_DIR et écrivait dans le VRAI dépôt —
        // `git init` y a posé `core.bare = true`, et trois commits parasites sur
        // la branche poussée. Même règle que sentinelle-anticache-fichiers-modifies.
        const ENV_SANS_GIT = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
        const banc = () => {
            const d = mkdtempSync(path.join(tmpdir(), 'decision-ci-'));
            const git = (...args) => spawnSync('git', args, { cwd: d, encoding: 'utf8', env: ENV_SANS_GIT });
            mkdirSync(path.join(d, '.github', 'workflows'), { recursive: true });
            mkdirSync(path.join(d, 'scripts'));
            mkdirSync(path.join(d, '.claude'));
            mkdirSync(path.join(d, 'js'));
            copyFileSync(path.join(racineProjet, '.github', 'workflows', 'tests.yml'), path.join(d, '.github', 'workflows', 'tests.yml'));
            copyFileSync(path.join(racineProjet, 'scripts', 'lot-observable.sh'), path.join(d, 'scripts', 'lot-observable.sh'));
            git('init', '-q');
            // Le banc ne s'exécute QUE dans son dépôt jetable — sinon il s'arrête là.
            expect(realpathSync(git('rev-parse', '--show-toplevel').stdout.trim())).toBe(realpathSync(d));
            git('-c', 'user.email=b@b', '-c', 'user.name=banc', 'add', '.');
            git('-c', 'user.email=b@b', '-c', 'user.name=banc', 'commit', '-qm', 'base');
            const commit = (fichier) => {
                writeFileSync(path.join(d, fichier), String(Math.random()));
                git('add', '.');
                git('-c', 'user.email=b@b', '-c', 'user.name=banc', 'commit', '-qm', fichier);
                return git('rev-parse', 'HEAD').stdout.trim();
            };
            const decider = (evenement, avant, apres) => {
                const sortie = path.join(d, 'sortie');
                writeFileSync(sortie, '');
                const r = spawnSync('bash', ['-c', script], {
                    cwd: d, encoding: 'utf8',
                    env: { ...ENV_SANS_GIT, EVENEMENT: evenement, AVANT: avant, APRES: apres, GITHUB_OUTPUT: sortie, GITHUB_STEP_SUMMARY: path.join(d, 'resume') }
                });
                expect(r.status, r.stderr).toBe(0);
                return Object.fromEntries(readFileSync(sortie, 'utf8').trim().split('\n').map((l) => l.split('=')));
            };
            return { d, git, commit, decider };
        };

        it('cinq cas : demande, push sans observable, push de code, `before` nul, `before` inconnu', () => {
            const { d, git, commit, decider } = banc();
            try {
                const base = git('rev-parse', 'HEAD').stdout.trim();
                const doc = commit('.claude/note.md');
                const js = commit('js/module.js');
                expect(decider('workflow_dispatch', '', js).juger).toBe('oui');
                expect(decider('push', base, doc).juger, 'un push sans chemin observable ne lance pas Playwright').toBe('non');
                expect(decider('push', doc, js).juger, 'un push de js/ lance Playwright').toBe('oui');
                expect(decider('push', '0000000000000000000000000000000000000000', js).juger, 'dans le doute, on juge').toBe('oui');
                expect(decider('push', 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef', js).juger, 'dans le doute, on juge').toBe('oui');
                const sortie = decider('workflow_dispatch', '', js);
                expect(JSON.parse(sortie.morceaux)).toHaveLength(Number(sortie.total));
            } finally {
                rmSync(d, { recursive: true, force: true });
            }
        });
    });

    it('la liste OBSERVABLE existe, et elle porte ce qu\'index.html charge', () => {
        const liste = cheminsObservables();
        expect(liste, '`OBSERVABLE:` introuvable dans tests.yml').not.toBeNull();
        for (const attendu of ['js/', 'index.html', 'styles.css', 'tests/', '.github/workflows/tests.yml']) {
            expect(liste, attendu + ' absent de OBSERVABLE').toContain(attendu);
        }
    });

    it('AUCUN spec Playwright ne LIT un chemin qui ne déclencherait pas Playwright', () => {
        const liste = cheminsObservables() || [];
        const dossierInt = path.join(dossierTests, 'integration');
        const coupables = [];
        for (const fichier of fichiersDeTest(dossierInt)) {
            const src = sansCommentaires(readFileSync(fichier, 'utf8'));
            // Les chemins construits depuis la racine du projet — c'est là que
            // vivent les fichiers hors tests/ que les specs peuvent lire.
            const appels = src.match(/path\.(?:join|resolve)\(\s*(?:racineProjet|racine)\s*,[^)]*\)/g) || [];
            for (const appel of appels) {
                const segments = [...appel.matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((x) => x !== '..');
                if (!segments.length) continue;
                const chemin = segments.join('/');
                if (!estObservable(chemin, liste)) {
                    coupables.push(`${path.relative(racineProjet, fichier)} → ${chemin}\n      ${appel.trim()}`);
                }
            }
        }
        expect(
            coupables,
            'Ces specs Playwright LISENT un chemin qui n\'est PAS observable : ni le verdict\n' +
            'du Mac (pousser.sh) ne le verrait bouger.\n' +
            'Deux issues : ajouter le chemin à OBSERVABLE (tests.yml), ou cesser de le lire.\n  ' +
            coupables.join('\n  ')
        ).toEqual([]);
    });

    it('témoin — le bloc voit bien des lectures : scripts/ et version.json sont lus par des specs', () => {
        // Un cliquet qui ne trouve aucun appel rend une liste vide pour rien.
        const liste = cheminsObservables() || [];
        expect(liste).toContain('scripts/');
        expect(liste).toContain('version.json');
        const dossierInt = path.join(dossierTests, 'integration');
        let lectures = 0;
        for (const fichier of fichiersDeTest(dossierInt)) {
            lectures += (sansCommentaires(readFileSync(fichier, 'utf8')).match(/path\.(?:join|resolve)\(\s*(?:racineProjet|racine)\s*,/g) || []).length;
        }
        expect(lectures).toBeGreaterThan(50);
    });
});

// ↻ BLOC 3, AJOUTÉ LE 2 SEPTEMBRE 2026 (SOIR) — LES EXCLUS DE WEBKIT LINUX SONT
// NOMMÉS, COMPTÉS, ET DITS. Six essais (dans cinq specs) ne peuvent pas juger sur
// le runner Linux ; ils sont exclus PAR TITRE à l'étape Playwright de la CI, et là
// seulement. Ce bloc est la garde contre la dérive : une exclusion qui peut
// grandir en silence finit par tout exclure. Il exige que la liste soit CELLE-CI,
// pas une de plus ; que chaque titre existe encore dans son fichier (un titre
// reformulé ferait revenir le rouge — mieux vaut le savoir ici) ; que le job CI
// la DISE (nom d'étape, avec le compte) ; et que la variable qui l'active ne soit
// posée QUE dans la CI.
// ⚠ POURQUOI PAR TITRE : la première version excluait par fichier — les cinq
// fichiers portent 17 essais, dont onze verts. Ce cliquet l'a attrapé avant la CI
// (« expected 6 to be 17 »).
// BREAK-TESTS (faits le 2 septembre) — ajouter une septième entrée à la liste →
// rouge ; changer le compte dans le nom de l'étape → rouge.
describe('CI · les essais exclus de WebKit Linux sont nommés, comptés, et dits', () => {
    const EXCLUS_ATTENDUS = [
        ['bandeau-non-modal-508.spec.js',   '#508 — les clics traversent le bandeau, sauf sur son bouton'],
        ['planif-alignement.spec.js',       '⚠ un bloc glissé près d’un autre COLLE, et un guide dit pourquoi'],
        ['planif-drag-pointer-148.spec.js', 'CAS D — un drag souris déplace un nœud libre'],
        ['planif-drag-pointer-148.spec.js', 'CAS B — tirer une évaluation HORS de sa leçon la détache (le geste du terrain)'],
        ['planif-toolbar.spec.js',          'planificateur — il CADRE la carte, il ne la filtre plus ; palettes commandées par la barre'],
        ['portes-relais-cadre.spec.js',     '#371 · Semaines spéciales : empilées, la borne de fin de planification est atteignable']
    ];
    const cle = (e) => e.fichier + ' › ' + e.titre;

    it('la liste est CELLE-CI, nommément — pas une de plus, pas une de moins', async () => {
        const cfg = await import('../playwright.config.js');
        expect(cfg.EXCLUS_WEBKIT_LINUX.map(cle).sort())
            .toEqual(EXCLUS_ATTENDUS.map(([fichier, titre]) => cle({ fichier, titre })).sort());
    });

    it('chaque titre exclu existe ENCORE, tel quel, dans son fichier', async () => {
        const cfg = await import('../playwright.config.js');
        for (const e of cfg.EXCLUS_WEBKIT_LINUX) {
            const chemin = path.join(dossierTests, 'integration', e.fichier);
            expect(existsSync(chemin), e.fichier + ' n\'existe plus').toBe(true);
            const src = readFileSync(chemin, 'utf8');
            expect(src.includes("test('" + e.titre + "'"), 'titre introuvable tel quel dans ' + e.fichier + ' : « ' + e.titre + ' »').toBe(true);
        }
    });

    it('sans la variable, RIEN n\'est exclu : sur macOS, npm run test:int lance tout', async () => {
        expect(process.env.PW_EXCLURE_WEBKIT_LINUX).toBeUndefined();
        const cfg = await import('../playwright.config.js');
        expect(cfg.default.grepInvert).toBeUndefined();
        // …et chaque motif, lui, matche bien la forme « fichier … titre » de Playwright.
        cfg.MOTIFS_EXCLUS_WEBKIT_LINUX.forEach((re, k) => {
            const e = cfg.EXCLUS_WEBKIT_LINUX[k];
            expect(re.test('[webkit] › integration/' + e.fichier + ':1:1 › ' + e.titre), 'motif ' + k).toBe(true);
            expect(re.test('[webkit] › integration/' + e.fichier + ':1:1 › autre essai'), 'motif ' + k + ' trop large').toBe(false);
        });
    });

    it('la CI DIT le compte : le nom de l\'étape annonce les essais et les specs de la liste', () => {
        const m = /- name: "(\d+) essais NON JUGÉS ici \((\d+) specs, WebKit Linux ≠ Safari macOS\)"/.exec(workflow);
        expect(m, 'l\'étape « N essais NON JUGÉS ici » a disparu du job Playwright').not.toBeNull();
        expect(Number(m[1]), 'le nom de l\'étape ne compte pas les essais de la liste').toBe(EXCLUS_ATTENDUS.length);
        expect(Number(m[2]), 'le nom de l\'étape ne compte pas les specs de la liste').toBe(new Set(EXCLUS_ATTENDUS.map(([f]) => f)).size);
    });

    it('la variable d\'exclusion n\'est posée QUE sur l\'étape Playwright de la CI', () => {
        const occurrences = (workflow.match(/PW_EXCLURE_WEBKIT_LINUX: "1"/g) || []).length;
        expect(occurrences).toBe(1);
        expect(workflow).toMatch(/- name: Run integration tests \(Playwright WebKit\)\n\s+working-directory: tests\n\s+env:\n\s+PW_EXCLURE_WEBKIT_LINUX: "1"/);
        expect(readFileSync(path.join(dossierTests, 'package.json'), 'utf8')).not.toContain('PW_EXCLURE');
    });
});
