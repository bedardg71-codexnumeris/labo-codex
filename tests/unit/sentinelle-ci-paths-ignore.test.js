import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

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

describe('CI · Playwright tourne une fois par jour, et ne saute que si RIEN d\'observable n\'a bougé', () => {
    /** La liste `OBSERVABLE` du workflow (env global) — l'unique source que le shell lit. */
    function cheminsObservables() {
        const m = /^\s*OBSERVABLE:\s*"([^"]+)"/m.exec(workflow);
        return m ? m[1].trim().split(/\s+/) : null;
    }
    const estObservable = (chemin, liste) => liste.some((e) =>
        e.endsWith('/') ? chemin.startsWith(e) : chemin === e);

    it('trois jobs : Vitest sur le push, Playwright derrière la garde — JAMAIS sur un push', () => {
        expect(workflow).toMatch(/^  vitest:\n/m);
        expect(workflow).toMatch(/^  garde:\n/m);
        // Playwright ne tient qu'à la garde : ni `needs: vitest`, ni la sortie retirée.
        expect(workflow).toMatch(/^  playwright:\n(?:.*\n)*?    needs: garde\n    if: needs\.garde\.outputs\.juger == 'oui'\n/m);
        // Hors commentaires : le journal en tête NOMME ce qui a été retiré.
        const code = workflow.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
        expect(code).not.toMatch(/outputs\.playwright/);
        expect(code).not.toMatch(/needs:.*vitest/);
        // La garde ne part QUE planifiée ou demandée. Sur un push elle est sautée,
        // donc Playwright aussi : `skipped`, jamais `success`.
        const blocGarde = tranche(workflow, '\n  garde:\n', '\n  playwright:\n');
        const conditions = blocGarde.match(/^    if:.*$/m);
        expect(conditions, 'le job `garde` n\'a plus de `if:` : il partirait sur chaque push').not.toBeNull();
        expect(conditions[0]).toBe("    if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'");
        // Vitest garde le push et la pull_request ; il ne saute que le planifié.
        const blocVitest = tranche(workflow, '\n  vitest:\n', '\n  garde:\n');
        expect(blocVitest.match(/^    if:.*$/m)[0]).toBe("    if: github.event_name != 'schedule'");
        // Un job sauté doit rester `skipped` : pas de `continue-on-error`, pas de
        // `if: always()` qui transformerait un saut en vert.
        expect(workflow).not.toMatch(/if:\s*always\(\)/);
        expect(workflow).not.toMatch(/continue-on-error/);
    });

    it('le run quotidien existe : un seul cron, 8 h UTC, et le lancement à la demande', () => {
        const declencheurs = tranche(workflow, '\non:\n', '\npermissions:\n');
        expect(declencheurs).toMatch(/^  schedule:\n    - cron: '0 8 \* \* \*'\n/m);
        expect((declencheurs.match(/- cron:/g) || []).length).toBe(1);
        expect(declencheurs).toMatch(/^  workflow_dispatch:/m);
        // Le push du matin ne doit pas annuler le run planifié en cours.
        expect(workflow).toMatch(/^  group: tests-\$\{\{ github\.ref \}\}-\$\{\{ github\.event_name \}\}$/m);
    });

    it('la garde d\'inutilité est APPELÉE par le job `garde`, et c\'est elle qui pose `juger`', () => {
        const blocGarde = tranche(workflow, '\n  garde:\n', '\n  playwright:\n');
        expect(blocGarde).toContain('bash scripts/ci-garde-inutilite.sh');
        expect(blocGarde).toContain('--event schedule');
        expect(blocGarde).toMatch(/read -r juger raison < <\(bash scripts\/ci-garde-inutilite\.sh\)/);
        expect(blocGarde).toContain('echo "juger=$juger" >> "$GITHUB_OUTPUT"');
        // Dans le doute on juge : seule la réponse `non` du script fait sauter.
        expect(blocGarde).toContain('[ "$juger" = "non" ] || juger=oui');
        // Aucune installation avant la décision : la garde n'installe rien.
        expect(blocGarde).not.toMatch(/npm ci|playwright install/);
    });

    describe('la garde DÉCIDE — le vrai script, dans un dépôt jetable', () => {
        // ⚠ Aucune variable `GIT_*` ne passe : lancé sous un hook depuis un worktree,
        // un `git init` jetable écrirait sinon dans le VRAI dépôt (#856).
        const ENV_SANS_GIT = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
        const git = (bac, ...args) => execFileSync('git', args, { cwd: bac, env: ENV_SANS_GIT, encoding: 'utf8' }).trim();

        function avecDepotJetable(fn) {
            const bac = mkdtempSync(path.join(tmpdir(), 'ci-garde-'));
            try {
                mkdirSync(path.join(bac, 'scripts'));
                mkdirSync(path.join(bac, '.github', 'workflows'), { recursive: true });
                mkdirSync(path.join(bac, 'js'));
                for (const f of ['ci-garde-inutilite.sh', 'lot-observable.sh']) {
                    copyFileSync(path.join(racineProjet, 'scripts', f), path.join(bac, 'scripts', f));
                }
                copyFileSync(path.join(racineProjet, '.github', 'workflows', 'tests.yml'),
                    path.join(bac, '.github', 'workflows', 'tests.yml'));
                writeFileSync(path.join(bac, 'js', 'a.js'), '// un\n');
                writeFileSync(path.join(bac, 'NOTES.md'), 'un\n');
                git(bac, 'init', '-q');
                git(bac, 'config', 'user.email', 'banc@exemple.invalid');
                git(bac, 'config', 'user.name', 'Banc');
                git(bac, 'add', '-A');
                git(bac, 'commit', '-q', '-m', 'base');
                return fn(bac, git(bac, 'rev-parse', 'HEAD'));
            } finally {
                rmSync(bac, { recursive: true, force: true });
            }
        }
        function garde(bac, evenement, dernier) {
            const r = spawnSync('bash', [path.join(bac, 'scripts', 'ci-garde-inutilite.sh')], {
                cwd: bac, encoding: 'utf8',
                env: { ...ENV_SANS_GIT, REPO_ROOT: bac, EVENEMENT: evenement, DERNIER: dernier }
            });
            expect(r.status, r.stderr).toBe(0);
            const [juger, raison] = r.stdout.trim().split('\t');
            return { juger, raison };
        }
        const commit = (bac, fichier, contenu) => {
            writeFileSync(path.join(bac, fichier), contenu);
            git(bac, 'add', '-A');
            git(bac, 'commit', '-q', '-m', fichier);
        };

        it('main immobile depuis le dernier SHA jugé → NON : on ne paie pas la suite', () => {
            avecDepotJetable((bac, base) => {
                const v = garde(bac, 'schedule', base);
                expect(v.juger).toBe('non');
                expect(v.raison).toContain(base.slice(0, 8));
            });
        });

        it('seulement de la documentation depuis → NON ; du code observable → OUI', () => {
            avecDepotJetable((bac, base) => {
                commit(bac, 'NOTES.md', 'deux\n');
                expect(garde(bac, 'schedule', base).juger).toBe('non');
                commit(bac, 'js/a.js', '// deux\n');
                expect(garde(bac, 'schedule', base).juger).toBe('oui');
            });
        });

        it('dans le doute, on juge : base inconnue, base introuvable, lancement à la demande', () => {
            avecDepotJetable((bac, base) => {
                expect(garde(bac, 'schedule', '').juger).toBe('oui');
                expect(garde(bac, 'schedule', '0123456789012345678901234567890123456789').juger).toBe('oui');
                // À la demande, même sur un dépôt immobile : c'est la porte de sortie.
                expect(garde(bac, 'workflow_dispatch', base).juger).toBe('oui');
            });
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
            'du Mac (pousser.sh) ni la garde du run quotidien ne le verraient bouger.\n' +
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
