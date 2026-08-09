import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #417 — `release.mjs` BUMPE LUI-MÊME LE ?v= DES FICHIERS QU'IL EMBARQUE.
//
// INCIDENT (trouvé au rituel de fin du 7 août 2026). Le script réécrivait
// `VERSION_MAJEURE`, `BUILD_ID` et `_SCRIPT_BUILD` dans `js/init-inline.js` à
// CHAQUE release, mais n'a jamais touché au `?v=` de son <script> : resté au
// `20260629a` après plus de vingt réécritures. Un fichier réécrit mais servi
// sous la même URL peut sortir du cache du navigateur dans sa version
// périmée — c'est le mécanisme qui a masqué la migration #367 pendant des
// heures, un fichier plus loin.
//
// ⚠ LE CORRECTIF N'ÉTAIT PAS DE BUMPER À LA MAIN. Un bump manuel corrige une
// release et se réoublie à la suivante ; la désynchronisation, elle, revient.
//
// CE QUE CE TEST VERROUILLE, et pourquoi il ne pouvait pas être un grep :
// `sentinelle-cache-busting-main.test.js` ne sait vérifier que `main.js` et
// `init-inline.js`, parce qu'eux seuls embarquent un build auquel comparer
// leur `?v=`. Pour les DIX AUTRES modules d'un chantier, aucune source de
// vérité statique n'existe — la garantie ne peut venir que du script de
// release. On l'exerce donc pour de vrai, sur un dépôt jetable.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const scriptRelease = path.join(racineProjet, 'scripts', 'release.mjs');

let bac; // dépôt git jetable

function git(...args) {
    execFileSync('git', args, { cwd: bac, stdio: ['ignore', 'pipe', 'pipe'] });
}

beforeAll(() => {
    bac = mkdtempSync(path.join(os.tmpdir(), 'release-417-'));
    mkdirSync(path.join(bac, 'js'));

    writeFileSync(path.join(bac, 'version.json'), JSON.stringify({ build: '0101-0900', beta: '1.0.0' }) + '\n');
    writeFileSync(
        path.join(bac, 'js', 'init-inline.js'),
        "let VERSION_MAJEURE = '1.0.0';\nlet BUILD_ID = '0101-0900';\n"
    );
    writeFileSync(path.join(bac, 'js', 'main.js'), "window._SCRIPT_BUILD_main = '0101-0900';\n");
    // Module ordinaire : ni réécrit par le script, ni porteur d'un build.
    // C'est LUI le cas que rien ne couvrait avant #417.
    writeFileSync(path.join(bac, 'js', 'module-ordinaire.js'), '// v1\n');
    writeFileSync(path.join(bac, 'js', 'module-intouche.js'), '// stable\n');
    // #438 : le CSS. `styles.css` est un <link>, pas un <script> — c'est
    // exactement ce qui l'avait fait échapper au balayage de #417.
    mkdirSync(path.join(bac, 'css'));
    writeFileSync(path.join(bac, 'styles.css'), '/* v1 */\n');
    writeFileSync(path.join(bac, 'css', 'accompagnement.css'), '/* stable */\n');
    writeFileSync(
        path.join(bac, 'index.html'),
        [
            '<link rel="stylesheet" href="styles.css?v=20260101a">',
            '<link rel="stylesheet" href="css/accompagnement.css?v=20260101a">',
            '<script src="js/init-inline.js?v=20260101a"></script>',
            '<script src="js/main.js?v=20260101a"></script>',
            '<script src="js/module-ordinaire.js?v=20260101a"></script>',
            '<script src="js/module-intouche.js?v=20260101a"></script>',
            ''
        ].join('\n')
    );

    git('init', '-q');
    git('config', 'user.email', 'test@example.invalid');
    git('config', 'user.name', 'Test');
    git('add', '-A');
    git('commit', '-qm', 'base');

    // Le chantier simulé : un module ordinaire ET la feuille de style
    // principale sont modifiés, non commités. Le second est le cas de #438.
    writeFileSync(path.join(bac, 'js', 'module-ordinaire.js'), '// v2 — le correctif du jour\n');
    writeFileSync(path.join(bac, 'styles.css'), '/* v2 — le correctif CSS du jour */\n');

    execFileSync('node', [scriptRelease, 'patch', '--root', bac], { encoding: 'utf8' });
});

afterAll(() => {
    if (bac) rmSync(bac, { recursive: true, force: true });
});

function paramDe(fichier) {
    const index = readFileSync(path.join(bac, 'index.html'), 'utf8');
    const m = new RegExp(fichier.replace(/[.\/]/g, '\\$&') + '\\?v=([A-Za-z0-9]+)').exec(index);
    return m ? m[1] : null;
}

describe('#417 · release.mjs bumpe le ?v= de ce qu’il embarque', () => {
    it('init-inline.js est bumpé — le défaut d’origine', () => {
        // Réécrit à chaque release pendant des mois sans jamais changer d'URL.
        expect(paramDe('js/init-inline.js')).not.toBe('20260101a');
    });

    it('main.js est bumpé', () => {
        expect(paramDe('js/main.js')).not.toBe('20260101a');
    });

    it('⭐ un module ORDINAIRE modifié est bumpé lui aussi', () => {
        // Le cas que `sentinelle-cache-busting-main.test.js` ne peut pas voir :
        // aucun build embarqué, donc aucune vérification statique possible.
        // Sans ce comportement, un chantier de douze fichiers en livrerait dix
        // sous leur ancienne URL.
        expect(
            paramDe('js/module-ordinaire.js'),
            'un module modifié par le chantier garde son ancienne URL : il sera servi depuis le cache'
        ).not.toBe('20260101a');
    });

    it('un module INTOUCHÉ garde son ?v= — le cache reste utile', () => {
        // Bumper tout à chaque release reviendrait à supprimer le cache. La
        // précision est ce qui rend le geste tenable dans la durée.
        expect(paramDe('js/module-intouche.js')).toBe('20260101a');
    });

    it('les fichiers bumpés portent tous la MÊME date que le nouveau build', () => {
        const build = JSON.parse(readFileSync(path.join(bac, 'version.json'), 'utf8')).build;
        const mmjj = build.slice(0, 4);
        for (const f of ['js/init-inline.js', 'js/main.js', 'js/module-ordinaire.js']) {
            expect(paramDe(f).slice(4, 8), `${f} n’est pas daté du build courant`).toBe(mmjj);
        }
    });

    it('deux releases le même jour produisent deux URL différentes', () => {
        // Sinon le second déploiement d'une même journée n'est pas servi — et
        // c'est justement les jours de correctif qu'on livre plusieurs fois.
        const avant = paramDe('js/main.js');
        writeFileSync(path.join(bac, 'js', 'module-ordinaire.js'), '// v3\n');
        execFileSync('node', [scriptRelease, 'patch', '--root', bac], { encoding: 'utf8' });
        expect(paramDe('js/main.js')).not.toBe(avant);
    });
});

describe('#438 · le CSS aussi — la règle de #417 poussée jusqu’à la feuille de style', () => {
    // TROU TROUVÉ le 9 août 2026 : le balayage de #417 ne regardait que `js/`.
    // `styles.css` n'a jamais été bumpé par le script, et deux releases du même
    // jour ont dû le faire à la main.
    //
    // ⚠ Ce qui rend ce trou VICIEUX : un correctif CSS livré derrière un cache
    // non invalidé est INERTE, et rien ne le signale. La page s'affiche, sans
    // erreur, simplement avec l'ancien style. Aucun test ne peut voir ça — la
    // garantie ne peut venir que du script de release, comme pour #417.
    it('⭐ une feuille de style modifiée est bumpée', () => {
        expect(
            paramDe('styles.css'),
            'styles.css garde son ancienne URL : le correctif CSS sera servi depuis le cache'
        ).not.toBe('20260101a');
    });

    it('une feuille INTOUCHÉE garde son ?v=', () => {
        // Même précision que pour le JS : bumper tout reviendrait à supprimer
        // le cache.
        expect(paramDe('css/accompagnement.css')).toBe('20260101a');
    });

    it('elle porte la même date de build que les fichiers JS bumpés', () => {
        expect(paramDe('styles.css').slice(0, 8)).toBe(paramDe('js/main.js').slice(0, 8));
    });
});
