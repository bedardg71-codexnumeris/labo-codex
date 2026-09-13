import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — 23 AOÛT 2026 · LE BON NUMÉRO DE VERSION SUR L'ANCIENNE APP.
//
// L'INCIDENT, mesuré sur l'iPad de Grégoire. Le bas de page annonçait
// « 1.92.0 · build 0823-1013 » — la version fraîchement déployée — et l'écran
// affichait l'ANCIEN bandeau de doublons, consigne fausse comprise. Les deux
// à la fois, sur le même appareil, à la même minute.
//
// LA CAUSE. `scripts/release.mjs` détectait les fichiers à bumper avec
// `git status --porcelain`, c'est-à-dire l'ARBRE DE TRAVAIL seul. Le chantier
// #291/#476 avait été COMMITÉ avant de lancer la release : `git status` ne
// voyait plus rien, et seuls `init-inline.js` et `main.js` (toujours inclus,
// car réécrits par le script) ont reçu un nouveau `?v=`.
//
// Or ce sont précisément les deux fichiers qui AFFICHENT le numéro de version.
// Tous les autres — `bibliotheque-ui.js`, les cinq familles, `styles.css` —
// gardaient leur ancienne URL, donc leur ancien contenu en cache Safari.
//
// ▣ POURQUOI C'EST LE PIRE DES SYMPTÔMES, et pas une gêne d'affichage : la
// porte terrain vérifie le numéro de version AVANT tout le reste (§0.2),
// précisément pour écarter le « build en retard ». Ici ce contrôle passait au
// vert sur une app périmée. La porte aurait éprouvé l'état d'AVANT en croyant
// éprouver l'après — et tout relevé en serait sorti faux.
//
// L'INVARIANT VERROUILLÉ ICI : tout fichier `js/` ou `.css` référencé par
// index.html et modifié depuis la release précédente doit porter un `?v=`
// daté du build courant. Sinon le navigateur sert l'ancien.
//
// BREAK-TEST (fait le 23 août 2026) — remettre `js/bibliotheque-ui.js?v=`
// à `20260821a` dans index.html → le test rougit en nommant le fichier.
//
// CE QU'ELLE NE COUVRE PAS (#602, 13 sept. 2026) : son `git diff` est borné à
// `js/`, `styles.css` et `css/`. Les bibliothèques de `libs/` (jetons = numéros
// de version, ou pas de jeton du tout) et les chargements par `importScripts` ou
// `workerSrc` lui échappent. Le garde pre-commit (`verifier-anticache-stage.mjs`)
// les NOMME au moment du commit ; `release.mjs` les nomme à la release.
//
// BREAK-TEST #675 (13 sept. 2026) — `-2` remis à `-1` dans `release.mjs` :
// « bumpe le fichier du chantier », « bumpe le fichier de js/ que porte ce
// commit » ROUGES ; l'ancien essai par chaîne, lui, restait vert. Remis.
//
// RELECTURE CROISÉE DE COWORK (13 sept. 2026) — deux retouches, deux mutations :
//   M7. repli sur la racine remis à `commits[1] || commits[0]` (le défaut §1 :
//       un seul commit de version.json, qui est HEAD) → « dépôt jeune … bumpe
//       les fichiers de js/ » ROUGE. Remis.
//   ⚠ Un premier repli sur l'ARBRE VIDE a été essayé : il faisait rougir
//       « un module INTOUCHÉ garde son ?v= » et « une feuille INTOUCHÉE » du
//       banc #417 (tout était bumpé). D'où la racine de l'historique.
//   M8. filtre d'extension retiré de `horsPerimetre` (§5a) → « ne nomme pas
//       VERSIONS.md » ROUGE. Remis.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

const indexHtml = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
const version = JSON.parse(readFileSync(path.join(racineProjet, 'version.json'), 'utf8'));

/** `?v=` porté par un fichier dans index.html, ou null s'il n'y est pas référencé. */
function paramCache(relatif) {
    const motif = new RegExp(relatif.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\?v=([A-Za-z0-9]+)');
    const m = motif.exec(indexHtml);
    return m ? m[1] : null;
}

function git(args) {
    return execFileSync('git', args, {
        cwd: racineProjet, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
        // index.html pèse ~1 Mo — au-dessus du tampon par défaut d'execFileSync,
        // qui est EXACTEMENT 1 Mo. Sans ce relèvement, `git show <commit>:index.html`
        // lève ENOBUFS. La première version de la comparaison ci-dessous attrapait
        // cette exception et rendait `null` : elle sautait la vérification EN
        // SILENCE, et le test passait au vert sans avoir rien comparé. Trouvé par
        // le break-test, pas par la lecture du code.
        maxBuffer: 64 * 1024 * 1024,
    });
}

/**
 * Fichiers js/css modifiés depuis la release PRÉCÉDENTE.
 *
 * Le repère est l'avant-dernier commit qui a touché `version.json` : le
 * dernier est la release courante elle-même, celle qu'on est en train de
 * vérifier. Prendre le dernier rendrait un ensemble vide — un test qui passe
 * toujours, donc un test qui ne dit rien.
 */
function commitReleasePrecedente() {
    const commits = git(['log', '-3', '--format=%H', '--', 'version.json'])
        .split('\n').map((l) => l.trim()).filter(Boolean);
    return commits.length < 2 ? null : commits[1];
}

function fichiersDepuisReleasePrecedente() {
    const repere = commitReleasePrecedente();
    if (repere === null) return null;   // dépôt trop jeune : rien à comparer
    return git(['diff', '--name-only', repere, 'HEAD', '--', 'js', 'styles.css', 'css'])
        .split('\n').map((l) => l.trim())
        .filter((f) => (f.endsWith('.js') || f.endsWith('.css')) && !f.includes('_archives/'));
}

/**
 * index.html tel qu'il était à la release PRÉCÉDENTE, ou null s'il n'existait pas.
 * Lu UNE fois (le fichier fait ~1 Mo).
 *
 * ⚠ Ne rend `null` que pour l'absence réelle du fichier. Toute autre panne de
 * `git show` remonte : un helper qui avale ses erreurs transforme une sentinelle
 * en décoration.
 */
function indexPrecedent(repere) {
    try {
        return git(['show', repere + ':index.html']);
    } catch (e) {
        const msg = String((e && e.message) || '');
        if (/does not exist|exists on disk, but not in|unknown revision/i.test(msg)) return null;
        throw e;
    }
}

/** `?v=` que portait un fichier dans un index.html donné. */
function paramCacheDans(contenu, relatif) {
    if (!contenu) return null;
    const motif = new RegExp(relatif.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\?v=([A-Za-z0-9]+)');
    const m = motif.exec(contenu);
    return m ? m[1] : null;
}

describe('anti-cache · un fichier modifié ne peut pas être servi sous son ancienne URL', () => {
    it('la date du build est cohérente avec version.json', () => {
        // `?v=` vaut AAAAMMJJ + suffixe ; `build` vaut MMJJ-HHMM.
        expect(version.build, 'version.json doit porter un build MMJJ-HHMM').toMatch(/^\d{4}-\d{4}$/);
    });

    it('tout fichier modifié depuis la release précédente porte un ?v= du jour du build', () => {
        const modifies = fichiersDepuisReleasePrecedente();
        if (modifies === null) return;   // dépôt sans deux releases : rien à prouver

        const mmjjBuild = version.build.slice(0, 4);
        const repere = commitReleasePrecedente();
        const ancienIndex = repere ? indexPrecedent(repere) : null;
        const perimes = [];
        let comparaisons = 0;

        for (const relatif of modifies) {
            const param = paramCache(relatif);
            // Un fichier non référencé dans index.html (chargé autrement, ou
            // nouveau et pas encore branché) n'est pas concerné.
            if (param === null) continue;

            const mmjjParam = param.slice(4, 8);   // AAAAMMJJ → MMJJ
            if (mmjjParam !== mmjjBuild) {
                perimes.push(`${relatif} : ?v=${param} (build ${version.build})`);
                continue;
            }

            // ▣ DURCISSEMENT DU 24 AOÛT 2026. Comparer le seul JOUR laissait
            // passer le cas des releases MULTIPLES dans la même journée — et il
            // y en a eu quatre le 24 août. Un fichier modifié après la release
            // du matin garde `20260824a` : même jour, donc vert, alors que
            // l'URL n'a PAS changé et que le navigateur sert le cache.
            //
            // Constaté sur pièces : `js/bibliotheque-ui.js` est resté à
            // `20260824a` après avoir reçu le helper de persistance de la
            // section d'import, et ce test passait. C'est exactement l'incident
            // du 23 août, rejoué à l'intérieur d'une journée.
            //
            // L'invariant juste n'est pas « le ?v= porte la bonne date », c'est
            // « le ?v= a CHANGÉ depuis la release précédente ».
            const avant = paramCacheDans(ancienIndex, relatif);
            if (avant !== null) comparaisons++;
            if (avant !== null && avant === param) {
                perimes.push(`${relatif} : ?v=${param} INCHANGÉ depuis la release précédente`);
            }
        }

        // Garde anti-silence : si AUCUNE comparaison n'a pu se faire alors qu'il y
        // avait des fichiers à comparer, ce test n'a rien prouvé. Le dire, plutôt
        // que de rendre un vert vide.
        expect(
            comparaisons > 0 || modifies.length === 0,
            'Aucun ?v= n\'a pu être comparé à la release précédente : la sentinelle\n' +
            'n\'a rien vérifié. Vérifier la lecture de l\'index.html du commit repère.'
        ).toBe(true);

        expect(
            perimes,
            'Ces fichiers ont changé mais gardent leur ancienne URL : le navigateur servira\n' +
            'leur version PÉRIMÉE, pendant que le bas de page annoncera la version neuve.\n' +
            'C\'est l\'incident du 23 août — relancer `node scripts/release.mjs --build-only`.\n  ' +
            perimes.join('\n  ')
        ).toEqual([]);
    });

    // L'essai « release.mjs ne se fie plus au seul arbre de travail » pinait la
    // chaîne `--format=%H', '--', 'version.json'` : vraie avec `-1` comme avec
    // `-2`, il est resté VERT sous la mutation de #675 (13 sept.). Remplacé par
    // le banc ci-dessous, qui exécute le script — et couvre le même risque :
    // le chantier y est commité, l'arbre propre.
});

// ─────────────────────────────────────────────────────────────────────────────
// #675 — LE REPÈRE DE release.mjs, ÉPROUVÉ SUR UN DÉPÔT JETABLE (13 sept. 2026)
//
// L'incident du 1er sept. : un commit qui touche `version.json` SANS être une
// release (`24eeaa89`, un correctif) devient le repère de `release.mjs`, qui
// prenait le DERNIER commit touchant ce fichier. Les fichiers modifiés entre la
// release précédente et ce correctif sortent du bump : 18 fichiers ce jour-là.
//
// Le montage qui isole le contrôle : le dernier commit touchant `version.json`
// porte AUSSI un fichier de `js/`, et HEAD est ce commit. Avec `-1`, le repère
// vaut HEAD, le `git diff` rend le vide, l'arbre est propre : rien d'autre que
// les deux fichiers réécrits par le script n'est bumpé. Un banc qui ne pinnerait
// que la chaîne `--format=%H -- version.json` resterait vert (vraie avec `-1`
// comme avec `-2`) : il faut exécuter le script.
// ─────────────────────────────────────────────────────────────────────────────

describe('#675 · release.mjs part de la release PRÉCÉDENTE, pas du dernier commit de version.json', () => {
    let bac;
    let sortie;
    // ⚠ ISOLEMENT (incident du 13 sept., 12 h 05) : sous le hook pre-push d'un
    // worktree, `GIT_DIR` hérité fait écrire ce dépôt « jetable » dans le VRAI
    // `.git/config`. Aucune variable `GIT_*` ne passe — ni à git, ni à release.mjs.
    const ENV_SANS_GIT = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
    const gitBac = (...args) => execFileSync('git', args, { cwd: bac, env: ENV_SANS_GIT, stdio: ['ignore', 'pipe', 'pipe'] });
    const ecrire = (rel, contenu) => writeFileSync(path.join(bac, rel), contenu);
    const jetonDe = (rel) => {
        const m = new RegExp(rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\?v=([A-Za-z0-9]+)')
            .exec(readFileSync(path.join(bac, 'index.html'), 'utf8'));
        return m ? m[1] : null;
    };

    beforeAll(() => {
        bac = mkdtempSync(path.join(os.tmpdir(), 'release-675-'));
        mkdirSync(path.join(bac, 'js'));
        mkdirSync(path.join(bac, 'libs'));
        ecrire('version.json', JSON.stringify({ build: '0101-0900', beta: '1.0.0' }) + '\n');
        ecrire('js/init-inline.js', "let VERSION_MAJEURE = '1.0.0';\nlet BUILD_ID = '0101-0900';\n");
        ecrire('js/main.js', "window._SCRIPT_BUILD_main = '0101-0900';\n");
        for (const f of ['a', 'b', 'c']) ecrire(`js/${f}.js`, `// ${f} v1\n`);
        ecrire('libs/pdf.worker.min.js', '/* 3.11.174 */\n');
        ecrire('index.html', [
            '<script src="version.js?v=01010900"></script>',
            '<script src="js/init-inline.js?v=20260101a"></script>',
            '<script src="js/main.js?v=20260101a"></script>',
            '<script src="js/a.js?v=20260101a"></script>',
            '<script src="js/b.js?v=20260101a"></script>',
            '<script src="js/c.js?v=20260101a"></script>',
            '',
        ].join('\n'));
        gitBac('init', '-q');
        gitBac('config', 'user.email', 'test@example.invalid');
        gitBac('config', 'user.name', 'Test');
        gitBac('add', '-A');
        gitBac('commit', '-qm', 'release 1.0.0');

        // Le chantier, commité avant la release — l'ordre du 23 août.
        ecrire('js/a.js', '// a v2 — le chantier\n');
        ecrire('libs/pdf.worker.min.js', '/* 3.11.175 */\n');
        ecrire('libs/VERSIONS.md', '- pdf.js 3.11.175\n');
        gitBac('commit', '-qam', 'chantier');

        // Le commit qui fausse le repère : il touche version.json ET un fichier
        // de js/, sans être une release (le cas de 24eeaa89).
        ecrire('version.json', JSON.stringify({ build: '0102-0900', beta: '1.0.0' }) + '\n');
        ecrire('js/b.js', '// b v2 — le correctif\n');
        gitBac('commit', '-qam', 'fix touchant version.json');

        // Sortie standard ET d'erreur : l'avertissement libs/ part en console.warn.
        const r = spawnSync('node', [path.join(racineProjet, 'scripts', 'release.mjs'), 'patch', '--root', bac],
            { encoding: 'utf8', env: ENV_SANS_GIT });
        if (r.status !== 0) throw new Error('release.mjs a échoué : ' + r.stderr);
        sortie = r.stdout + r.stderr;
    });

    afterAll(() => {
        if (bac) rmSync(bac, { recursive: true, force: true });
    });

    it('bumpe le fichier du chantier, commité AVANT le commit qui a touché version.json', () => {
        // Le cœur de #675 : avec `-1`, le repère vaut HEAD et a.js reste à 20260101a.
        expect(jetonDe('js/a.js'), sortie).not.toBe('20260101a');
    });

    it('bumpe le fichier de js/ que porte ce commit lui-même', () => {
        expect(jetonDe('js/b.js'), sortie).not.toBe('20260101a');
    });

    it('ne bumpe pas ce qui n\'a pas bougé — le repère n\'est pas « tout »', () => {
        expect(jetonDe('js/c.js')).toBe('20260101a');
    });

    it('#602 · NOMME la bibliothèque modifiée qu\'il ne bumpe pas', () => {
        expect(sortie).toMatch(/libs\/pdf\.worker\.min\.js/);
        expect(sortie).toMatch(/NON bumpe/);
    });

    it('#602 · ne nomme pas un fichier de libs/ qui n\'a pas d\'URL (VERSIONS.md) — relecture Cowork §5a', () => {
        expect(sortie).not.toMatch(/VERSIONS\.md/);
    });
});

// Relecture croisée de Cowork (13 sept.), §1 : le repli du dépôt JEUNE. Un seul
// commit touche `version.json`, il EST HEAD et porte du `js/` — la forme de
// `24eeaa89`, sans avant-dernier. Se rabattre sur ce commit rendait un diff
// vide : a.js et b.js restaient sous leur ancienne URL en silence.
describe('#675 · dépôt jeune : un seul commit de version.json, qui est HEAD et porte du js/', () => {
    let bac;
    let sortie;
    const ENV_SANS_GIT = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
    const gitBac = (...args) => execFileSync('git', args, { cwd: bac, env: ENV_SANS_GIT, stdio: ['ignore', 'pipe', 'pipe'] });
    const ecrire = (rel, contenu) => writeFileSync(path.join(bac, rel), contenu);
    const jetonDe = (rel) => {
        const m = new RegExp(rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\?v=([A-Za-z0-9]+)')
            .exec(readFileSync(path.join(bac, 'index.html'), 'utf8'));
        return m ? m[1] : null;
    };

    beforeAll(() => {
        bac = mkdtempSync(path.join(os.tmpdir(), 'release-675-jeune-'));
        mkdirSync(path.join(bac, 'js'));
        ecrire('js/init-inline.js', "let VERSION_MAJEURE = '1.0.0';\nlet BUILD_ID = '0101-0900';\n");
        ecrire('js/main.js', "window._SCRIPT_BUILD_main = '0101-0900';\n");
        for (const f of ['a', 'b']) ecrire(`js/${f}.js`, `// ${f} v1\n`);
        ecrire('index.html', [
            '<script src="version.js?v=01010900"></script>',
            '<script src="js/init-inline.js?v=20260101a"></script>',
            '<script src="js/main.js?v=20260101a"></script>',
            '<script src="js/a.js?v=20260101a"></script>',
            '<script src="js/b.js?v=20260101a"></script>',
            '',
        ].join('\n'));
        gitBac('init', '-q');
        gitBac('config', 'user.email', 'test@example.invalid');
        gitBac('config', 'user.name', 'Test');
        gitBac('add', '-A');
        gitBac('commit', '-qm', 'base, sans version.json');

        // Le SEUL commit qui touche version.json : il est HEAD et porte du js/.
        ecrire('version.json', JSON.stringify({ build: '0102-0900', beta: '1.0.0' }) + '\n');
        ecrire('js/a.js', '// a v2\n');
        ecrire('js/b.js', '// b v2\n');
        gitBac('add', '-A');
        gitBac('commit', '-qm', 'version.json + js');

        sortie = execFileSync('node', [path.join(racineProjet, 'scripts', 'release.mjs'), 'patch', '--root', bac],
            { encoding: 'utf8', env: ENV_SANS_GIT });
    });

    afterAll(() => {
        if (bac) rmSync(bac, { recursive: true, force: true });
    });

    it('bumpe les fichiers de js/ que porte ce commit unique', () => {
        expect(jetonDe('js/a.js'), sortie).not.toBe('20260101a');
        expect(jetonDe('js/b.js'), sortie).not.toBe('20260101a');
    });
});
