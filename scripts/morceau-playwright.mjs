#!/usr/bin/env node
/**
 * Les fichiers de spec d'UN morceau de la CI, distribués EN ALTERNANCE.
 *
 * POURQUOI PAS `--shard` (16 oct. 2026, mesuré)
 * ---------------------------------------------
 * `--shard=k/n` coupe la liste des essais en n tranches CONTIGUËS. Or les specs
 * lentes sur le runner Linux sont voisines dans l'ordre alphabétique : les
 * `codex-*` y coûtent 40 à 100 s l'essai. À 16 morceaux (run 38957826759), le
 * morceau 4 n'a reçu qu'elles — coupé à 30 min après 30 essais sur 49 —, quand
 * les quinze autres finissaient entre 3 et 22 min. Distribuer les fichiers en
 * alternance (le i-ème fichier trié va au morceau i mod n) étale ces voisins
 * sur tous les morceaux. Playwright 1.60 n'offre pas de découpe pondérée.
 *
 * USAGE
 * -----
 *   node scripts/morceau-playwright.mjs <morceau> <total>
 * Écrit, un par ligne, le FILTRE de chaque spec du morceau, tel que `playwright
 * test` le lit : une expression régulière, ici ancrée (`integration/x\.spec\.js$`)
 * pour qu'un fichier n'en attrape jamais un autre dont le nom le contient.
 * Sort en 2 si le morceau est hors bornes, ou s'il ne reçoit aucun fichier :
 * un morceau vide ne doit pas ressembler à un morceau vert.
 */

import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Le `morceau`-ième (de 1 à `total`) des `total` lots, fichiers triés puis pris en alternance. */
export function fichiersDuMorceau(fichiers, morceau, total) {
    return [...fichiers].sort().filter((_, i) => i % total === morceau - 1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const morceau = Number(process.argv[2]);
    const total = Number(process.argv[3]);
    if (!Number.isInteger(total) || total < 1 || !Number.isInteger(morceau) || morceau < 1 || morceau > total) {
        process.stderr.write(`morceau-playwright : morceau « ${process.argv[2]} » sur « ${process.argv[3]} » hors bornes.\n`);
        process.exit(2);
    }
    const dossier = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tests', 'integration');
    const specs = readdirSync(dossier).filter((f) => f.endsWith('.spec.js'));
    const choisis = fichiersDuMorceau(specs, morceau, total);
    if (choisis.length === 0) {
        process.stderr.write(`morceau-playwright : le morceau ${morceau}/${total} ne reçoit aucun fichier.\n`);
        process.exit(2);
    }
    process.stdout.write(choisis.map((f) => `integration/${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`).join('\n') + '\n');
}
