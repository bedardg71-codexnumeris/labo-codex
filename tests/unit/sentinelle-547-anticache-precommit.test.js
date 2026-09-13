import { describe, it, expect, afterAll } from 'vitest';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    extraireSuffixes,
    trouverSuffixesInchanges,
    referencesSansJeton,
    chargementsDynamiques,
    lireHistoriqueJetons,
    trouverJetonsDejaServis,
    proposerJeton,
} from '../../scripts/verifier-anticache-stage.mjs';

// SENTINELLE #547 — L'ANTI-CACHE RAPPELÉ AU MOMENT DU COMMIT.
//
// LE MOTIF QUI L'A FAIT NAÎTRE. Quatre oublis du même geste en deux jours
// (25-26 août 2026), sur trois sessions et trois chantiers sans rapport :
// #540 lot C, #540 lot D sur `styles.css`, #541, #542. À chaque fois un
// fichier modifié dont le `?v=` d'index.html ne suit pas — donc un navigateur
// qui sert la version périmée pendant que le bas de page annonce la neuve.
//
// POURQUOI LE FILET EXISTANT NE SUFFISAIT PAS. La sentinelle
// `anticache-fichiers-modifies` compare des COMMITS : elle ne voit rien tant
// que le travail est dans l'arbre, et le hook pre-push la lit une fois le
// commit écrit. Le geste correcteur était connu de tous et correctement
// appliqué à chaque fois : ce qui manquait, c'était le RAPPEL AU BON MOMENT.
//
// CE QUI EST VERROUILLÉ ICI, en trois invariants :
//   1. un fichier stagé dont le `?v=` n'a pas bougé depuis HEAD est SIGNALÉ ;
//   2. le hook pre-commit APPELLE réellement le script — un contrôle jamais
//      invoqué est un contrôle qui n'existe pas ;
//   3. il l'appelle AVANT la sortie anticipée de la Défense J, qui filtre sur
//      '*.js' '*.html' et laisserait passer un commit de `styles.css` seul.
//
// BREAK-TESTS VÉRIFIÉS le 27 août 2026 — voir le journal en fin de fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

/** index.html minimal : les trois formes de suffixe réellement présentes. */
const INDEX_AVANT = `
<link rel="stylesheet" href="styles.css?v=20260827a">
<script src="version.js?v=08270953"></script>
<script src="js/db.js?v=20260826b"></script>
<script src="js/portfolio.js?v=20260805a"></script>
<script src="js/sans-version.js"></script>
<script src="libs/pdf.min.js?v=3.11.174"></script>
`;

describe('#547 · extraireSuffixes — lire les URL versionnées', () => {
    it('relève src et href, et rend le chemin sans le suffixe', () => {
        const s = extraireSuffixes(INDEX_AVANT);
        expect(s.get('styles.css')).toBe('20260827a');
        expect(s.get('js/db.js')).toBe('20260826b');
        expect(s.get('version.js')).toBe('08270953');
    });

    it('ignore un fichier référencé SANS ?v= — il n\'a pas d\'URL à rafraîchir', () => {
        expect(extraireSuffixes(INDEX_AVANT).has('js/sans-version.js')).toBe(false);
    });

    it('première occurrence gagnante', () => {
        const doublon = '<script src="js/db.js?v=AAA"></script><script src="js/db.js?v=BBB"></script>';
        expect(extraireSuffixes(doublon).get('js/db.js')).toBe('AAA');
    });

    it('relève les suffixes À POINTS des bibliothèques tierces', () => {
        // Mesuré le 27 août sur l'index.html réel : une classe [A-Za-z0-9]
        // laissait échapper `libs/pdf.min.js?v=3.11.174`, `libs/jszip.min.js`
        // et `libs/html2canvas.min.js` — trois fichiers invisibles au contrôle,
        // donc trois libs repatchables sous la même URL. 185 relevées sur 188.
        expect(extraireSuffixes(INDEX_AVANT).get('libs/pdf.min.js')).toBe('3.11.174');
    });

    it('un index vide ou absent ne fait pas tomber la lecture', () => {
        expect(extraireSuffixes('').size).toBe(0);
        expect(extraireSuffixes(null).size).toBe(0);
    });
});

describe('#547 · trouverSuffixesInchanges — le cœur du contrôle', () => {
    it('SIGNALE un fichier modifié dont le ?v= n\'a pas bougé', () => {
        const perimes = trouverSuffixesInchanges(['js/db.js'], INDEX_AVANT, INDEX_AVANT);
        expect(perimes).toEqual([{ fichier: 'js/db.js', suffixe: '20260826b' }]);
    });

    it('se tait quand le ?v= a changé', () => {
        const apres = INDEX_AVANT.replace('js/db.js?v=20260826b', 'js/db.js?v=20260827a');
        expect(trouverSuffixesInchanges(['js/db.js'], apres, INDEX_AVANT)).toEqual([]);
    });

    it('se tait sur un fichier qu\'index.html ne sert pas (test, script, doc)', () => {
        const stages = ['tests/unit/quelque-chose.test.js', 'BACKLOG.md', 'scripts/release.mjs'];
        expect(trouverSuffixesInchanges(stages, INDEX_AVANT, INDEX_AVANT)).toEqual([]);
    });

    it('se tait sur un fichier NEUF : son URL n\'a jamais été servie, aucun cache ne la porte', () => {
        const apres = INDEX_AVANT + '<script src="js/tout-neuf.js?v=20260827a"></script>';
        expect(trouverSuffixesInchanges(['js/tout-neuf.js'], apres, INDEX_AVANT)).toEqual([]);
    });

    it('attrape styles.css — le lot où la Défense J est aveugle', () => {
        // #540 lot D : un `styles.css` modifié seul. La Défense J filtre sur
        // '*.js' '*.html' et sort avant de rien voir. C'est un des quatre oublis.
        const perimes = trouverSuffixesInchanges(['styles.css'], INDEX_AVANT, INDEX_AVANT);
        expect(perimes.map((p) => p.fichier)).toEqual(['styles.css']);
    });

    it('nomme TOUS les périmés d\'un lot mixte, pas seulement le premier', () => {
        const apres = INDEX_AVANT.replace('js/db.js?v=20260826b', 'js/db.js?v=20260827c');
        const stages = ['js/db.js', 'js/portfolio.js', 'styles.css', 'BACKLOG.md'];
        const perimes = trouverSuffixesInchanges(stages, apres, INDEX_AVANT);
        expect(perimes.map((p) => p.fichier)).toEqual(['js/portfolio.js', 'styles.css']);
    });

    it('SIGNALE une bibliothèque tierce repatchée sous la même URL', () => {
        const perimes = trouverSuffixesInchanges(['libs/pdf.min.js'], INDEX_AVANT, INDEX_AVANT);
        expect(perimes).toEqual([{ fichier: 'libs/pdf.min.js', suffixe: '3.11.174' }]);
    });

    it('un lot stagé vide ne signale rien', () => {
        expect(trouverSuffixesInchanges([], INDEX_AVANT, INDEX_AVANT)).toEqual([]);
    });
});

describe('#547 · le contrôle est réellement branché au hook', () => {
    const hook = readFileSync(path.join(racineProjet, 'scripts', 'hooks', 'pre-commit'), 'utf8');

    it('le hook pre-commit appelle le script', () => {
        // Un contrôle que rien n'invoque est un contrôle qui n'existe pas —
        // c'est le patron « fix perdu au refactoring » du projet.
        expect(hook, 'scripts/hooks/pre-commit doit invoquer verifier-anticache-stage.mjs')
            .toMatch(/node\s+"?\$?\{?[A-Za-z_]*\}?"?\/?.*verifier-anticache-stage\.mjs/);
    });

    it('une sortie non nulle du script BLOQUE le commit', () => {
        // Un script de garde qui échoue sans arrêter la suite ne garde rien :
        // mesuré le 27 août sur un script de bump dont l'exception n'a arrêté
        // personne, et le commit est parti en croyant l'anti-cache posé.
        expect(hook).toMatch(/if\s+!\s+node\s+[^\n]*verifier-anticache-stage\.mjs[^\n]*;\s*then\s*\n\s*exit 1/);
    });

    it('il est appelé AVANT la sortie anticipée de la Défense J', () => {
        // La Défense J calcule son diff sur '*.js' '*.html' puis sort si le lot
        // est vide. Placé après, l'anti-cache ne verrait jamais un commit de
        // `styles.css` seul — précisément un des quatre oublis du 25-26 août.
        const posAntiCache = hook.indexOf('verifier-anticache-stage.mjs');
        const posSortieDefenseJ = hook.indexOf('if [ -z "$DIFF" ]');
        expect(posAntiCache, 'appel anti-cache introuvable dans le hook').toBeGreaterThan(-1);
        expect(posSortieDefenseJ, 'sortie anticipée de la Défense J introuvable').toBeGreaterThan(-1);
        expect(posAntiCache).toBeLessThan(posSortieDefenseJ);
    });

    it('fail-open documenté : pas de node, pas de blocage', () => {
        expect(hook).toMatch(/command -v node/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 13 SEPT. 2026 — LE GARDE DIT LA VÉRITÉ SUR CE QU'IL A VÉRIFIÉ (#600, #547, #826, #602)
//
// ⚠ Chaque banc ci-dessous EXÉCUTE le script dans un dépôt jetable et LIT sa
// sortie. Un banc qui n'assertait que le code de sortie resterait vert sous
// les mutations de #600 et de #547 (ii) : il vaut 0 avant comme après.
// ─────────────────────────────────────────────────────────────────────────────

const script = path.join(racineProjet, 'scripts', 'verifier-anticache-stage.mjs');
// ⚠ ISOLEMENT (incident du 13 sept. 2026, 12 h 05). Lancé par le hook pre-push
// d'un worktree, Vitest hérite de `GIT_DIR` : un `git init` / `git config`
// « jetable » écrit alors dans le VRAI dépôt — `core.bare = true` et un
// `[user] Test` y ont été posés, git refusait tout. Aucune variable `GIT_*` ne
// passe dans les dépôts jetables.
const ENV_SANS_GIT = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
const bacs = [];
afterAll(() => { for (const b of bacs) rmSync(b, { recursive: true, force: true }); });

/** Dépôt jetable : `fichiers` commités en un premier commit. */
function depot(fichiers) {
    const bac = mkdtempSync(path.join(os.tmpdir(), 'garde-547-'));
    bacs.push(bac);
    const g = (...args) => execFileSync('git', args, { cwd: bac, env: ENV_SANS_GIT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const ecrire = (map) => {
        for (const [rel, contenu] of Object.entries(map)) {
            mkdirSync(path.dirname(path.join(bac, rel)), { recursive: true });
            writeFileSync(path.join(bac, rel), contenu);
        }
    };
    g('init', '-q');
    g('config', 'user.email', 'test@example.invalid');
    g('config', 'user.name', 'Test');
    ecrire(fichiers);
    g('add', '-A');
    g('commit', '-qm', 'base');
    return {
        bac, g, ecrire,
        commit(map, msg) { ecrire(map); g('add', '-A'); g('commit', '-qm', msg); return g('rev-parse', 'HEAD').trim(); },
        stager(map) { ecrire(map); g('add', '-A'); },
        garde() {
            const r = spawnSync('node', [script], { cwd: bac, encoding: 'utf8', env: { ...ENV_SANS_GIT, LABO_ANTICACHE_SKIP: '' } });
            // eslint-disable-next-line no-control-regex
            const net = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
            return { code: r.status, out: net(r.stdout), err: net(r.stderr), tout: net(r.stdout + r.stderr) };
        },
    };
}

const indexAvec = (jeton) => `<script src="version.js?v=09131013"></script>\n<script src="js/a.js?v=${jeton}"></script>\n`;
const VERSION = JSON.stringify({ build: '0913-1013', beta: '1.0.0' }) + '\n';

describe('#600 · rien de stagé : le garde DIT qu\'il n\'a rien vérifié', () => {
    it('index vide → une ligne « rien de stagé — RIEN VÉRIFIÉ », code 0', () => {
        const d = depot({ 'index.html': indexAvec('20260912a'), 'js/a.js': '// v1\n', 'version.json': VERSION });
        const r = d.garde();
        expect(r.code).toBe(0);
        expect(r.out).toMatch(/rien de stagé/);
        expect(r.out).toMatch(/RIEN VÉRIFIÉ/);
    });
});

describe('#547 (ii) · le refus conseille le JOUR DU BUILD, plus la lettre', () => {
    const d = depot({ 'index.html': indexAvec('20260912a'), 'js/a.js': '// v1\n', 'version.json': VERSION });
    d.stager({ 'js/a.js': '// v2\n' });
    const r = d.garde();

    it('refuse (code 1) le fichier modifié sous le même jeton — témoin du montage', () => {
        expect(r.code).toBe(1);
        expect(r.err).toMatch(/js\/a\.js\s+\?v=20260912a/);
    });

    it('nomme le build de version.json et le jour qu\'il impose', () => {
        expect(r.err).toMatch(/JOUR DU BUILD/);
        expect(r.err).toMatch(/0913-1013/);
        expect(r.err).toMatch(/20\d\d0913\b/);
    });

    it('propose un jeton du jour du build, fichier par fichier', () => {
        expect(r.err).toMatch(/js\/a\.js[^\n]*→ \?v=20\d\d0913a/);
    });

    it('n\'imprime plus « incrementer la lettre » (20260827a -> 20260827b) — la sentinelle refuserait', () => {
        expect(r.err).not.toMatch(/20260827a -> 20260827b/);
        expect(r.err).not.toMatch(/incrementer la lettre/);
    });
});

describe('#826 · un jeton qui a DÉJÀ servi ce chemin avec un autre contenu est refusé', () => {
    // Le montage qui isole le contrôle neuf : HEAD porte `20260910d`, le stagé
    // repose `20260910a`, qui a servi PLUS HAUT dans l'historique. Avec un
    // jeton égal à celui de HEAD, l'ancien garde refuserait déjà : l'essai ne
    // prouverait rien.
    const d = depot({ 'index.html': indexAvec('20260910a'), 'js/a.js': '// v1\n', 'version.json': VERSION });
    const premier = d.g('rev-parse', 'HEAD').trim();
    d.commit({ 'index.html': indexAvec('20260910d'), 'js/a.js': '// v2\n' }, 'bump d');

    it('HEAD à 20260910d, stagé qui repose 20260910a sur un contenu neuf → refus qui nomme le commit', () => {
        d.stager({ 'index.html': indexAvec('20260910a'), 'js/a.js': '// v3\n' });
        const r = d.garde();
        expect(r.code).toBe(1);
        expect(r.err).toMatch(/DEJA servi/);
        expect(r.err).toMatch(new RegExp('js/a\\.js\\s+\\?v=20260910a[^\\n]*' + premier.slice(0, 8)));
        d.g('reset', '-q', '--hard');
    });

    it('le même jeton sur le MÊME contenu (un revert) passe — une URL, un contenu', () => {
        d.stager({ 'index.html': indexAvec('20260910a'), 'js/a.js': '// v1\n' });
        const r = d.garde();
        expect(r.err).not.toMatch(/DEJA servi/);
        expect(r.code).toBe(0);
        d.g('reset', '-q', '--hard');
    });

    it('un jeton jamais servi passe (témoin)', () => {
        d.stager({ 'index.html': indexAvec('20260910e'), 'js/a.js': '// v3\n' });
        expect(d.garde().code).toBe(0);
        d.g('reset', '-q', '--hard');
    });

    it('le jeton posé par une AUTRE branche du dépôt compte — le cas du 10 sept. (deux sessions)', () => {
        d.g('checkout', '-q', '-b', 'session-parallele');
        d.commit({ 'index.html': indexAvec('20260910e'), 'js/a.js': '// v3 — l\'autre session\n' }, 'autre session');
        d.g('checkout', '-q', '-');
        d.stager({ 'index.html': indexAvec('20260910e'), 'js/a.js': '// v3 — cette session\n' });
        const r = d.garde();
        expect(r.code).toBe(1);
        expect(r.err).toMatch(/js\/a\.js\s+\?v=20260910e/);
        d.g('reset', '-q', '--hard');
    });
});

describe('#602 · les chargements hors index.html : couverts quand ils ont un jeton, NOMMÉS sinon', () => {
    it('libs/pdf.worker.min.js modifié (workerSrc sans jeton) → nommé « HORS de ce contrôle », commit non bloqué', () => {
        // La mutation de la consigne : modifier la bibliothèque sans toucher
        // `js/travaux-visionneuse.js:71`. Avant le 13 sept., le garde se taisait.
        const d = depot({
            'index.html': indexAvec('20260912a'),
            'js/a.js': '// v1\n',
            'js/travaux-visionneuse.js': "pdfjsLib.GlobalWorkerOptions.workerSrc = 'libs/pdf.worker.min.js';\n",
            'libs/pdf.worker.min.js': '/* 3.11.174 */\n',
            'version.json': VERSION,
        });
        d.stager({ 'libs/pdf.worker.min.js': '/* 3.11.175 */\n' });
        const r = d.garde();
        expect(r.code).toBe(0);
        expect(r.err).toMatch(/HORS de ce contrôle/);
        expect(r.err).toMatch(/libs\/pdf\.worker\.min\.js[^\n]*js\/travaux-visionneuse\.js/);
    });

    it('une bibliothèque qu\'index.html charge sans ?v= → nommée aussi', () => {
        const d = depot({
            'index.html': indexAvec('20260912a') + '<script src="libs/chart.min.js"></script>\n',
            'js/a.js': '// v1\n', 'libs/chart.min.js': '/* 4.4 */\n', 'version.json': VERSION,
        });
        d.stager({ 'libs/chart.min.js': '/* 4.5 */\n' });
        const r = d.garde();
        expect(r.code).toBe(0);
        expect(r.err).toMatch(/libs\/chart\.min\.js[^\n]*sans \?v=/);
    });

    it('importScripts à jeton ÉCRIT EN DUR : la bibliothèque modifiée sous le même jeton est REFUSÉE', () => {
        const d = depot({
            'index.html': indexAvec('20260912a'),
            'js/a.js': '// v1\n',
            'js/heic-worker.js': "importScripts('../libs/libheif-bundle.js?v=20260830a');\n",
            'libs/libheif-bundle.js': '// 1.17\n',
            'version.json': VERSION,
        });
        d.stager({ 'libs/libheif-bundle.js': '// 1.18\n' });
        const r = d.garde();
        expect(r.code).toBe(1);
        expect(r.err).toMatch(/libs\/libheif-bundle\.js\s+\?v=20260830a/);
    });
});

describe('#602 · chargementsDynamiques — les quatre formes, chemin résolu', () => {
    it('lit workerSrc et importScripts, et résout importScripts depuis le worker', () => {
        const src = "importScripts('../libs/libheif-bundle.js?v=20260830a');\n"
            + "pdfjsLib.GlobalWorkerOptions.workerSrc = 'libs/pdf.worker.min.js';\n";
        const sites = chargementsDynamiques(src, 'js/heic-worker.js');
        expect(sites.map((s) => [s.chemin, s.jeton])).toEqual([
            ['libs/libheif-bundle.js', '20260830a'],
            ['libs/pdf.worker.min.js', null],
        ]);
    });

    it('distingue un jeton calculé au chargement d\'une URL nue', () => {
        const [s] = chargementsDynamiques("_worker = new Worker('js/heic-worker.js?v=' + jetonAntiCache());", 'js/heic-decodeur.js');
        expect(s).toMatchObject({ chemin: 'js/heic-worker.js', avecJeton: true, calcule: true, jeton: null });
    });

    it('ignore les commentaires et les URL qui ne sont pas des scripts', () => {
        const src = "// Source : js/pack-demo-10.js\n/* importScripts('libs/x.js') */\nimg.src = 'images/logo.png';\n";
        expect(chargementsDynamiques(src, 'js/a.js')).toEqual([]);
    });

    it('referencesSansJeton relève les scripts locaux nus, pas ceux à jeton ni les URL distantes', () => {
        const html = '<script src="libs/chart.min.js"></script><script src="js/a.js?v=1"></script>'
            + '<script src="https://cdn.example/x.js"></script><link href="styles.css">';
        expect([...referencesSansJeton(html)]).toEqual(['libs/chart.min.js', 'styles.css']);
    });
});

describe('#826 · lecture de l\'historique et proposition de jeton (fonctions pures)', () => {
    const LOG = [
        'commit aaaa1111',
        '+++ b/index.html',
        '+<script src="js/a.js?v=20260910a"></script>',
        '-<script src="js/a.js?v=20260909c"></script>',
        'commit bbbb2222',
        '+<script src="js/a.js?v=20260910d"></script> <script src="js/b.js?v=20260910a"></script>',
    ].join('\n');

    it('lireHistoriqueJetons ne retient que les lignes AJOUTÉES, avec leur commit', () => {
        const h = lireHistoriqueJetons(LOG);
        expect([...h.get('js/a.js').keys()]).toEqual(['20260910a', '20260910d']);
        expect([...h.get('js/a.js').get('20260910a')]).toEqual(['aaaa1111']);
        expect(h.get('js/b.js').get('20260910a').has('bbbb2222')).toBe(true);
    });

    it('trouverJetonsDejaServis : refuse sur un autre contenu, pas sur le même, pas sur une inconnue', () => {
        const h = lireHistoriqueJetons(LOG);
        const candidats = new Map([['js/a.js', '20260910a'], ['js/b.js', '20260910a']]);
        const autre = trouverJetonsDejaServis(candidats, h, (c, f) => (f === 'js/a.js' ? false : null));
        expect(autre).toEqual([{ fichier: 'js/a.js', suffixe: '20260910a', commit: 'aaaa1111' }]);
        expect(trouverJetonsDejaServis(candidats, h, () => true)).toEqual([]);
    });

    it('proposerJeton : jour du build, après le rang actuel, jamais un jeton déjà servi', () => {
        expect(proposerJeton('20260913b', '20260913', new Set(['20260913c']))).toBe('20260913d');
        expect(proposerJeton('20260912z', '20260913', new Set())).toBe('20260913a');
        expect(proposerJeton('20260913z', '20260913', new Set())).toBe('20260913aa');
        expect(proposerJeton('20260913a', null, new Set())).toBeNull();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS — 27 août 2026
//
// 1. `trouverSuffixesInchanges` rendant toujours `[]`
//    → 3 rouges : « SIGNALE un fichier modifié », « attrape styles.css »,
//      « nomme TOUS les périmés ».
// 2. Comparaison `ancien !== suffixe` au lieu de `===`
//    → 4 rouges : les trois ci-dessus plus « se tait quand le ?v= a changé ».
// 3. Appel du script retiré du hook
//    → 4 rouges : « le hook appelle le script », « une sortie non nulle BLOQUE »,
//      « appelé AVANT la sortie anticipée », « fail-open documenté ».
// 4. Appel déplacé APRÈS `if [ -z "$DIFF" ]`
//    → 1 rouge, et c'est le bon : « appelé AVANT la sortie anticipée ».
// 5. `if ! node ...` remplacé par `node ... || true`
//    → 1 rouge : « une sortie non nulle BLOQUE le commit ».
// 6. Classe du suffixe ramenée à [A-Za-z0-9] (l'état d'avant la mesure)
//    → 2 rouges : « relève les suffixes À POINTS », « SIGNALE une bibliothèque
//      tierce repatchée ».
//
// 13 SEPTEMBRE 2026 — chaque mutation posée seule, fichier restauré après :
// 7. #600 — `main()` muet sur index vide (écriture remplacée par `void`)
//    → 1 rouge : « index vide → une ligne « rien de stagé » ». Le code de
//      sortie vaut 0 avant comme après : seule la lecture de la sortie mord.
// 8. #547 (ii) — la phrase « incrementer la lettre (20260827a -> 20260827b) »
//    remise → 2 rouges : « nomme le build de version.json », « n'imprime plus
//    incrementer la lettre ».
// 9. #826 — `memeContenu(...) === false` remplacé par `false` → 3 rouges :
//    « HEAD à 20260910d, stagé qui repose 20260910a », « le jeton posé par une
//    AUTRE branche », et la fonction pure. Le montage isole le contrôle neuf :
//    le jeton stagé DIFFÈRE de HEAD, l'ancien refus ne pouvait pas mordre.
// 10. #602 — les non-couverts tus (`if (false)`) → 2 rouges : workerSrc et
//    bibliothèque nue d'index.html.
// 11. #602 — jeton en dur d'importScripts ignoré → 1 rouge : « importScripts à
//    jeton ÉCRIT EN DUR ».
// 12. #602 — la lecture ramenée à `.src =` et `new Worker(` → 3 rouges ici
//    (plus 2 dans la sentinelle #825, qui lit par la même fonction).
// 13. AVANT LE CORRECTIF (garde de c049633d, montage libs/pdf.worker.min.js
//    stagé sans toucher travaux-visionneuse.js) : sortie VIDE, code 0 ; le
//    garde neuf nomme le fichier. Le banc rougissait donc avant.
// 14. ISOLEMENT — `env: ENV_SANS_GIT` retiré du dépôt jetable, suite lancée
//    sous `GIT_DIR` pointé vers un dépôt LEURRE : 11 rouges, et le leurre
//    reçoit `user.email = test@example.invalid` et 8 commits parasites. Avec
//    le filtre : 36 verts, leurre intact (config locale vide, 1 commit).
// ─────────────────────────────────────────────────────────────────────────────
