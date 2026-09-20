/**
 * SENTINELLE #756 — LE HOOK ET LA CI POSENT LA MÊME QUESTION.
 *
 * « Ce push touche-t-il du code observable au navigateur ? » se décidait à deux
 * endroits qui ne s'accordaient pas. Le hook pré-push (scripts/lot-observable.sh)
 * ne comptait que `js/`, `index.html`, `styles.css`, `tests/integration/` et deux
 * scripts ; la CI (.github/workflows/tests.yml, `OBSERVABLE`) comptait AUSSI
 * `css/`, `icons/`, `img/`, `libs/`, `version.js`, `version.json`,
 * `noms_stables.json`, `scripts/`, tout `tests/` et le workflow lui-même.
 *
 * Mesuré le 6 septembre 2026 sur le push `d5f911b0` (un banc Vitest neuf) : le
 * hook a dit « Sentinelle Playwright : sans objet », la CI a lancé Playwright
 * (run 34028716398). Conséquence : le message du hook rassure à tort, et une
 * session peut écrire « Playwright sauté » dans le relais alors que le runner
 * juge. Un hook qui rassure à tort vaut moins que pas de hook.
 *
 * Correctif : le fragment LIT la liste de la CI. Une seule liste, un lecteur de
 * plus. Ce banc ne compare pas deux listes — il exécute le VRAI fragment en bash
 * et confronte son verdict à la règle du workflow, chemin par chemin.
 *
 * BREAK-TESTS attendus : rendre au fragment son motif en dur → A rougit ;
 * retirer `scripts/` de `OBSERVABLE` → B rougit sur `scripts/pousser.sh` ;
 * faire répondre « non » quand la liste est illisible → C rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const FRAGMENT = readFileSync(path.join(racineProjet, 'scripts', 'lot-observable.sh'), 'utf8');
const WORKFLOW = readFileSync(path.join(racineProjet, '.github', 'workflows', 'tests.yml'), 'utf8');

/** La liste `OBSERVABLE` du workflow — la seule source. */
function listeCI() {
    const m = /^\s*OBSERVABLE:\s*"([^"]+)"/m.exec(WORKFLOW);
    return m ? m[1].trim().split(/\s+/) : null;
}

/** La règle du workflow : une entrée finissant par `/` couvre le dossier ; sinon, fichier exact. */
function observableSelonCI(chemin, liste) {
    return liste.some((e) => (e.endsWith('/') ? chemin.startsWith(e) : chemin === e));
}

/**
 * Le VRAI fragment, sourcé en bash, interrogé chemin par chemin.
 * @param {string[]} chemins
 * @param {string} racine - la racine passée en REPO_ROOT (permet de simuler l'absence du workflow)
 * @returns {Object<string, boolean>}
 */
function verdictDuFragment(chemins, racine = racineProjet) {
    const script = `
set -u
REPO_ROOT=${JSON.stringify(racine)}
. "${path.join(racineProjet, 'scripts', 'lot-observable.sh')}"
for f in "$@"; do
  if printf '%s\\n' "$f" | lot_observable; then echo "OUI $f"; else echo "NON $f"; fi
done
`;
    const r = spawnSync('bash', ['-c', script, 'lot-observable', ...chemins], { encoding: 'utf8' });
    expect(r.status, 'le fragment a échoué : ' + (r.stderr || '')).toBe(0);
    const verdicts = {};
    for (const ligne of r.stdout.trim().split('\n')) {
        const [mot, ...reste] = ligne.split(' ');
        verdicts[reste.join(' ')] = mot === 'OUI';
    }
    return verdicts;
}

describe('#756 · A — le motif n\'existe plus qu\'à un seul endroit', () => {
    it('le fragment LIT la liste du workflow au lieu d\'en garder une copie', () => {
        expect(FRAGMENT).toContain('.github/workflows/tests.yml');
        expect(FRAGMENT).toMatch(/OBSERVABLE/);
        expect(/\^\(js\/\|index\\?\.html/.test(FRAGMENT),
            'le fragment a repris une copie du motif : c\'est la divergence de #756 qui revient')
            .toBe(false);
    });

    it('la liste de la CI est lisible et non vide', () => {
        expect(listeCI(), '`OBSERVABLE:` introuvable dans tests.yml').not.toBeNull();
        expect(listeCI().length).toBeGreaterThan(5);
    });
});

describe('#756 · B — le hook et la CI rendent le MÊME verdict', () => {
    // Un échantillon qui couvre chaque forme d'entrée : dossier, fichier exact,
    // documentaire, et les quatre cas qui divergeaient avant le correctif.
    const ECHANTILLON = [
        'js/saisie-presences.js',
        'index.html',
        'styles.css',
        'tests/integration/x.spec.js',
        'tests/unit/sentinelle-756-une-seule-liste-observable.test.js',  // divergeait
        'scripts/pousser.sh',                                            // divergeait
        'icons/icone-192.png',                                           // divergeait
        'version.json',                                                  // divergeait
        'css/imprime.css',
        'img/logo.png',
        'libs/chart.min.js',
        'noms_stables.json',
        '.github/workflows/tests.yml',
        'BACKLOG.md',
        'SESSION.md',
        'docs/modules/travaux.md',
        'plans de travail/PLAN.md',
        'README.md',
        'index.html.bak',      // pas index.html : un fichier exact ne se préfixe pas
        'version.json.orig'
    ];

    it('chemin par chemin, aucun désaccord', () => {
        const liste = listeCI();
        const duHook = verdictDuFragment(ECHANTILLON);
        const desaccords = ECHANTILLON
            .filter((c) => duHook[c] !== observableSelonCI(c, liste))
            .map((c) => `${c} — hook: ${duHook[c] ? 'oui' : 'non'} · CI: ${observableSelonCI(c, liste) ? 'oui' : 'non'}`);
        expect(
            desaccords,
            'Le hook et la CI ne répondent pas la même chose. Le hook peut donc dire\n' +
            '« sans objet » sur un lot que le runner juge au navigateur — #756.\n  ' +
            desaccords.join('\n  ')
        ).toEqual([]);
    });

    it('les quatre cas qui divergeaient avant le correctif sont désormais retenus', () => {
        const duHook = verdictDuFragment([
            'tests/unit/banc-neuf.test.js', 'scripts/pousser.sh', 'icons/a.png', 'version.json'
        ]);
        expect(Object.values(duHook).every(Boolean),
            JSON.stringify(duHook)).toBe(true);
    });

    it('un lot purement documentaire ne demande toujours rien', () => {
        const duHook = verdictDuFragment(['BACKLOG.md', 'SESSION.md', 'docs/x.md']);
        expect(Object.values(duHook).some(Boolean)).toBe(false);
    });
});

describe('#756 · C — liste illisible : on exige le verdict, on ne le saute pas', () => {
    it('sans le workflow, tout lot est déclaré observable', () => {
        const faux = mkdtempSync(path.join(tmpdir(), 'lot-observable-'));
        try {
            mkdirSync(path.join(faux, '.github', 'workflows'), { recursive: true });
            writeFileSync(path.join(faux, '.github', 'workflows', 'tests.yml'), '# sans OBSERVABLE\n');
            const duHook = verdictDuFragment(['BACKLOG.md'], faux);
            expect(duHook['BACKLOG.md'],
                'liste illisible et réponse « non » : le verdict Playwright serait sauté en silence')
                .toBe(true);
        } finally {
            rmSync(faux, { recursive: true, force: true });
        }
    });
});
