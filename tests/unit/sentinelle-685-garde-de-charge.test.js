import { describe, it, expect } from 'vitest';
import { readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche, position } from './_helpers/tranche.js';

// #685 — LA GARDE DE CHARGE DE pousser.sh (19 sept. 2026).
//
// Mesuré ce jour-là : sous charge, ce qui rougit au verdict Playwright n'est pas une
// assertion, c'est le plafond de 30 s par essai. Un verdict lancé sous charge ne juge donc
// pas le code. La boucle improvisée en session le 18 « abandonnait après 5 min et lançait
// quand même » : l'invariant que ce banc verrouille est l'inverse —
// PLAFOND ATTEINT ⮕ ON NE LANCE PAS. Aucun lancement par défaut.
//
// Le fragment est sourcé dans un bash, et `lire_charge` y est REMPLACÉE par une suite de
// valeurs : rien ne dépend de la charge réelle de la machine qui fait tourner ce banc.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const FRAGMENT = path.join(racine, 'scripts', 'garde-charge.sh');
const POUSSER = readFileSync(path.join(racine, 'scripts', 'pousser.sh'), 'utf8');

/** Joue la garde avec des relevés fictifs, un par ligne ; le dernier se répète. */
function jouer(releves, { seuil = 8, plafond = 2, pas = 1 } = {}) {
    const script = `
        . "$FRAGMENT"
        # \`lire_charge\` est appelée dans un sous-shell : le rang du relevé vit dans un fichier.
        lire_charge() {
            local n=$(( $(cat "$COMPTEUR" 2>/dev/null || echo 0) + 1 ))
            printf '%s' "$n" > "$COMPTEUR"
            printf '%s' "$RELEVES" | awk -v n="$n" '{ l[NR] = $0 } END { printf "%s", (n <= NR) ? l[n] : l[NR] }'
        }
        attendre_charge_basse
        echo "CODE=$?"
    `;
    const compteur = path.join(process.env.TMPDIR || '/tmp', `garde-charge-${process.pid}-${Math.random().toString(36).slice(2)}`);
    const r = spawnSync('bash', ['-c', script], {
        encoding: 'utf8',
        timeout: 20000,
        env: {
            PATH: process.env.PATH, FRAGMENT, COMPTEUR: compteur, RELEVES: releves.join('\n'),
            CHARGE_SEUIL: String(seuil), CHARGE_PLAFOND_S: String(plafond), CHARGE_PAS_S: String(pas)
        }
    });
    rmSync(compteur, { force: true });
    const code = Number((/CODE=(\d+)/.exec(r.stdout) || [])[1]);
    return { code, sortie: r.stdout, erreur: r.stderr };
}

describe('#685 · A — la garde : attendre, et au plafond NE PAS lancer', () => {

    it('A.a charge sous le seuil : on lance tout de suite, sans attendre', () => {
        const r = jouer(['3.2']);
        expect(r.code, r.sortie + r.erreur).toBe(0);
        expect(r.sortie).toContain('Charge 3.2, sous le seuil de 8.');
        expect(r.sortie).not.toContain('on attend');
    });

    it('A.b LE CAS QUI COMPTE : charge haute jusqu\'au plafond ⮕ code 3, et la ligne dit la charge et la durée', () => {
        const r = jouer(['48.0'], { plafond: 2, pas: 1 });
        expect(r.code, r.sortie + r.erreur).toBe(3);
        expect(r.sortie).toContain('Verdict NON LANCÉ');
        expect(r.sortie).toContain('charge 48.0 après 2 s d\'attente');
        expect(r.sortie).toContain('seuil 8, plafond 2 s');
        // Elle a bien ATTENDU avant de refuser : deux relevés d'attente, pas un refus immédiat.
        expect(r.sortie.match(/on attend/g) || []).toHaveLength(2);
    });

    it('A.c la charge redescend pendant l\'attente : on lance, et la ligne dit combien on a attendu', () => {
        const r = jouer(['31.5', '12.0', '4.1'], { plafond: 10, pas: 1 });
        expect(r.code, r.sortie + r.erreur).toBe(0);
        expect(r.sortie).toContain('Charge 4.1, sous le seuil de 8 après 2 s d\'attente.');
    });

    it('A.d le seuil est une borne stricte : à 8 tout rond on attend encore', () => {
        expect(jouer(['8']).code).toBe(3);
        expect(jouer(['7.99']).code).toBe(0);
    });

    it('A.e charge illisible : ce n\'est PAS le plafond atteint — on le dit, et la garde ne juge pas', () => {
        const r = jouer(['']);
        expect(r.code, r.sortie + r.erreur).toBe(0);
        expect(r.sortie).toContain('Charge de la machine illisible');
        expect(jouer(['{']).sortie).toContain('illisible');
    });

    it('A.f un pas nul n\'enferme pas la boucle : le plafond reste atteignable', () => {
        const r = jouer(['48.0'], { plafond: 2, pas: 0 });
        expect(r.code, r.sortie + r.erreur).toBe(3);
    });

    it('A.g le vrai lecteur rend un nombre à point décimal sur cette machine', () => {
        const r = spawnSync('bash', ['-c', '. "$FRAGMENT"; lire_charge'], { encoding: 'utf8', env: { PATH: process.env.PATH, FRAGMENT } });
        expect(r.stdout).toMatch(/^[0-9]+(\.[0-9]+)?$/);
    });
});

describe('#685 · B — pousser.sh : la garde passe AVANT le verdict, et son refus arrête tout', () => {

    it('B.a le fragment est sourcé, et la garde est appelée avant verifier-playwright.mjs', () => {
        expect(POUSSER).toContain('. "$REPO_ROOT/scripts/garde-charge.sh"');
        const iGarde = position(POUSSER, '    attendre_charge_basse\n');
        const iVerdict = position(POUSSER, 'node "$REPO_ROOT/scripts/verifier-playwright.mjs"');
        expect(iGarde).toBeLessThan(iVerdict);
    });

    it('B.b entre la garde et le verdict, un code non nul SORT du script — aucun lancement par défaut', () => {
        const entre = tranche(POUSSER, '    attendre_charge_basse\n', 'node "$REPO_ROOT/scripts/verifier-playwright.mjs"', { longueurMin: 80 });
        expect(entre).toMatch(/CODE_CHARGE=\$\?/);
        expect(entre).toMatch(/if \[ \$CODE_CHARGE -ne 0 \]; then\s+exit 3\s+fi/);
        // Et rien dans cet intervalle ne pousse.
        expect(entre).not.toContain('git push');
    });

    it('B.c la garde n\'est appelée que dans la branche qui lance le verdict', () => {
        const branche = tranche(POUSSER, 'if [ $LANCER -eq 1 ]; then', 'Sentinelle Playwright : sans objet', { longueurMin: 200 });
        expect(branche).toContain('attendre_charge_basse');
        expect(POUSSER.match(/^\s*attendre_charge_basse\s*$/gm) || []).toHaveLength(1);
    });

    it('B.d les seuils vivent en tête de pousser.sh, nommés, avant tout le reste — et la mesure y est citée', () => {
        const tete = tranche(POUSSER, 'set -eu', 'REPO_ROOT=$(git rev-parse --show-toplevel)', { longueurMin: 500 });
        expect(tete).toContain('CHARGE_SEUIL="${LABO_CHARGE_SEUIL:-8}"');
        expect(tete).toContain('CHARGE_PLAFOND_S="${LABO_CHARGE_PLAFOND_S:-900}"');
        expect(tete).toContain('CHARGE_PAS_S="${LABO_CHARGE_PAS_S:-30}"');
        expect(tete).toContain('MESURE-2026-09-19-specs-au-second-essai.md');
        // Ce qui n'est pas éprouvé est NOMMÉ, pas inventé.
        expect(tete).toMatch(/NON ÉPROUVÉ : la charge DISQUE/);
    });

    it('B.e le fragment ne porte aucun seuil : une seule source', () => {
        const fragment = readFileSync(FRAGMENT, 'utf8');
        expect(fragment).not.toMatch(/^\s*CHARGE_(SEUIL|PLAFOND_S|PAS_S)=/m);
    });
});
