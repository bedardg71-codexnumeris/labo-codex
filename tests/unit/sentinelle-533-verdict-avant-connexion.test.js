import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE #533 — LA GARDE LOURDE PASSE AVANT LA CONNEXION, PAS APRÈS
// =======================================================================
//
// Le 26 août 2026, trois pushs de suite ont échoué sans que rien ne soit cassé :
//
//     Connection to github.com closed by remote host.
//     Transferred: sent 3620, received 19832 bytes, in 360.5 seconds
//     ✓ Sentinelle Playwright : aucune rougeur nouvelle (1 échec connu, inchangé).
//
// Lire ces trois lignes dans l'ordre, c'est tout le défaut. `git push` ouvre la
// connexion vers le serveur AVANT d'exécuter le hook pré-push. Le hook lançait
// WebKit lui-même — six minutes — pendant lesquelles la session ne transmettait
// rien. GitHub la fermait. Le verdict tombait ensuite : juste, vert, et sans
// personne à qui le dire.
//
// ▣ CE QUI REND CE DÉFAUT DANGEREUX n'est pas l'échec, c'est ce qu'il enseigne.
//   Un push qui échoue alors que tout est vert apprend à taper `--no-verify` par
//   réflexe — et ce réflexe emporte AUSSI Vitest, la baseline #456, tout. Une
//   garde qu'on apprend à contourner pour une raison de calendrier ne garde plus
//   rien. C'est la même leçon que le hook s'écrivait à lui-même en 2026 :
//   « un hook inapplicable se contourne au lieu de servir ».
//
// ⮕ LE RENVERSEMENT : la suite tourne EN AMONT (scripts/pousser.sh) et dépose un
//   verdict rattaché au SHA ; le hook ne fait plus que le LIRE. Chaque suite ne
//   tourne qu'une fois — Playwright dans le script, Vitest dans le hook — et le
//   hook ne dépasse plus la trentaine de secondes de Vitest.
//
// ⮕ CE QUI EST VERROUILLÉ ICI :
//   A. le hook ne lance plus WebKit ; il lit un verdict ;
//   B. le verdict est rattaché à un commit — il ne couvre pas le suivant ;
//   C. l'absence de verdict BLOQUE (elle ne vaut pas « tout va bien »), et le
//      refus donne le geste exact, sinon il se contourne ;
//   D. le motif « code observable » n'existe qu'à UN endroit, partagé ;
//   E. le jeton n'est jamais versionné — il ne parle que de la machine locale ;
//   F. dans pousser.sh, la garde vient AVANT le push. C'est tout l'objet.
//
// ⚠ CE QUE CETTE SENTINELLE NE COUVRE PAS : la durée réelle de WebKit, ni le
// délai de patience de GitHub. Les deux peuvent changer ; l'ordre, lui, doit
// tenir quoi qu'il arrive.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

const HOOK = lire('scripts', 'hooks', 'pre-push');
const POUSSER = lire('scripts', 'pousser.sh');
const GITIGNORE = lire('.gitignore');

/** Exécute le lecteur avec un jeton fabriqué, sans toucher au jeton réel. */
function lireVerdict(jeton, shaAttendu) {
    const dossier = mkdtempSync(path.join(tmpdir(), 'verdict-533-'));
    const fichier = path.join(dossier, 'jeton.json');
    if (jeton !== null) writeFileSync(fichier, typeof jeton === 'string' ? jeton : JSON.stringify(jeton));
    try {
        return spawnSync('node', [path.join(racine, 'scripts', 'lire-verdict.mjs'), shaAttendu], {
            env: { ...process.env, VERDICT_PLAYWRIGHT: fichier },
            encoding: 'utf8'
        }).status;
    } finally {
        rmSync(dossier, { recursive: true, force: true });
    }
}

const SHA = 'a'.repeat(40);
const AUTRE_SHA = 'b'.repeat(40);

/* ------------------------------------------------ A — le hook lit, il ne lance plus */

describe('#533 · A — le hook ne lance plus WebKit derrière une connexion ouverte', () => {

    it('A.a il n\'invoque plus verifier-playwright.mjs', () => {
        // On vise l'EXÉCUTION, pas la mention : le hook a le droit — et le
        // devoir — de nommer la commande dans son message de refus. Ce qu'il ne
        // doit plus faire, c'est la lancer.
        const invocations = HOOK.split('\n').filter(
            (l) => /(^|[;&|]\s*)node\s+\S*verifier-playwright\.mjs/.test(l) && !/^\s*(#|printf)/.test(l)
        );
        expect(
            invocations,
            'le relancer ici, c\'est six minutes de silence sur une session que GitHub finit par fermer'
        ).toEqual([]);
    });

    it('A.b il invoque le lecteur de verdict, avec le SHA poussé', () => {
        expect(HOOK).toMatch(/lire-verdict\.mjs"?\s+"\$SHA_POUSSE"/);
    });

    it('A.c il retient le SHA que git lui annonce sur stdin', () => {
        expect(HOOK).toMatch(/SHA_POUSSE="\$sha_local"/);
    });
});

/* ------------------------------------------- B+C — ce que le verdict vaut, et ne vaut pas */

describe('#533 · B — un verdict ne couvre que le commit sur lequel il a été rendu', () => {

    it('B.a verdict vert sur CE commit : le push passe', () => {
        expect(lireVerdict({ sha: SHA, code: 0 }, SHA)).toBe(0);
    });

    it('B.b LE CAS QUI COMPTE : verdict vert, mais rendu sur un AUTRE commit', () => {
        expect(
            lireVerdict({ sha: AUTRE_SHA, code: 0 }, SHA),
            'sans ça, un verdict d\'hier couvrirait le code d\'aujourd\'hui'
        ).toBe(3);
    });

    it('B.c rougeur nouvelle : bloque', () => {
        expect(lireVerdict({ sha: SHA, code: 1 }, SHA)).toBe(1);
    });

    it('B.d verdict impossible (WebKit absent) : laisse passer', () => {
        expect(lireVerdict({ sha: SHA, code: 2 }, SHA)).toBe(2);
    });
});

describe('#533 · C — l\'absence de verdict ne vaut pas « tout va bien »', () => {

    it('C.a aucun jeton : le hook n\'a rien pour juger', () => {
        expect(lireVerdict(null, SHA)).toBe(3);
    });

    it('C.b jeton illisible : traité comme absent, jamais comme vert', () => {
        expect(lireVerdict('{ ceci n\'est pas du JSON', SHA)).toBe(3);
    });

    it('C.c jeton sans SHA : rattaché à rien, donc à aucun push', () => {
        expect(lireVerdict({ code: 0 }, SHA)).toBe(3);
    });

    it('C.d code inconnu : pas d\'interprétation généreuse', () => {
        expect(lireVerdict({ sha: SHA, code: 42 }, SHA)).toBe(3);
    });

    it('C.e le refus donne le geste exact — sinon il se contourne', () => {
        const refus = HOOK.slice(HOOK.indexOf('aucun verdict pour ce commit'));
        expect(refus).toContain('scripts/pousser.sh');
        expect(refus).toContain('node scripts/verifier-playwright.mjs');
    });
});

/* --------------------------------------------------- D+E+F — les trois invariants restants */

describe('#533 · D — le motif « code observable » n\'existe qu\'à un endroit', () => {

    it('D.a le hook et pousser.sh sourcent le même fragment', () => {
        expect(HOOK).toContain('scripts/lot-observable.sh');
        expect(POUSSER).toContain('scripts/lot-observable.sh');
    });

    it('D.b ni l\'un ni l\'autre ne garde une copie du motif', () => {
        const enDur = /\^\(js\/\|index\\?\.html/;
        expect(enDur.test(HOOK), 'copie du motif dans le hook').toBe(false);
        expect(enDur.test(POUSSER), 'copie du motif dans pousser.sh').toBe(false);
        expect(enDur.test(lire('scripts', 'lot-observable.sh'))).toBe(true);
    });
});

describe('#533 · E — le jeton reste local', () => {

    it('E.a il est ignoré par git : il ne parle que de la machine qui l\'a écrit', () => {
        expect(GITIGNORE).toContain('scripts/.verdict-playwright.json');
    });
});

describe('#533 · F — dans pousser.sh, la garde vient AVANT le push', () => {

    it('F.a l\'ordre des deux appels est le sujet même de ce script', () => {
        const garde = POUSSER.indexOf('node "$REPO_ROOT/scripts/verifier-playwright.mjs"');
        const push = POUSSER.indexOf('git push "$@"');
        expect(garde, 'la garde a disparu du script').toBeGreaterThan(-1);
        expect(push, 'le push a disparu du script').toBeGreaterThan(-1);
        expect(
            garde < push,
            'garder l\'ordre inverse, c\'est reproduire exactement le défaut du 26 août'
        ).toBe(true);
    });

    it('F.b une rougeur nouvelle arrête le script avant toute connexion', () => {
        const entre = POUSSER.slice(
            POUSSER.indexOf('node "$REPO_ROOT/scripts/verifier-playwright.mjs"'),
            POUSSER.indexOf('git push "$@"')
        );
        expect(entre).toMatch(/CODE_PW -eq 1[\s\S]*exit 1/);
    });
});
