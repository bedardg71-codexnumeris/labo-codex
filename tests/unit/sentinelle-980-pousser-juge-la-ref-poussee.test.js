import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #980 (11 oct. 2026) — `pousser.sh` juge l'arbre de travail : une référence qui n'est pas la
// branche courante est refusée, avant tout verdict. La règle vit dans scripts/ref-poussee.sh,
// jouée ici par bash (et non par le shell de l'utilisateur).
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const juger = (branche, args) => spawnSync('bash', ['-c', '. scripts/ref-poussee.sh; ref_poussee_conforme "$@"', '_', branche, ...args],
    { cwd: racine, encoding: 'utf8' });

describe('#980 · pousser.sh refuse une autre référence que la branche courante', () => {
    const CAS = [
        [[], 0], [['origin', 'main'], 0], [['origin', 'refs/heads/main'], 0], [['origin', 'HEAD:main'], 0],
        [['-u', 'origin', 'main'], 0], [['origin', '--force'], 0],
        [['origin', 'lot-e3'], 1], [['origin', 'HEAD:lot-e3'], 1], [['origin', 'lot-e3:main'], 1], [['-u', 'origin', 'lot-e3'], 1]
    ];
    CAS.forEach(([args, attendu]) => {
        it(`branche « main », pousser.sh ${args.join(' ') || '(sans argument)'} → ${attendu === 0 ? 'accepté' : 'refusé'}`, () => {
            const r = juger('main', args);
            expect(r.status).toBe(attendu);
            if (attendu === 1) expect(r.stderr).toContain('juge l’arbre de travail');
        });
    });

    it('pousser.sh appelle la règle avant le verdict, et sort sur un refus', () => {
        const src = readFileSync(path.join(racine, 'scripts', 'pousser.sh'), 'utf8');
        const i = src.indexOf('ref_poussee_conforme "$BRANCHE" "$@" || exit 1');
        expect(i).toBeGreaterThan(-1);
        expect(i).toBeLessThan(src.indexOf('verifier-playwright.mjs'));
    });
});
