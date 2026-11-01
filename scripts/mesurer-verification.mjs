#!/usr/bin/env node
/**
 * Où passe le temps d'une vérification complète (M2 et M3, 1er nov. 2026).
 *
 * Lit les rapports blob d'une passe, ceux du Mac (gardés par
 * scripts/verdict-en-morceaux.mjs) ou ceux de GitHub (artefacts `blob-*`), et rend
 * ce que Playwright a RÉELLEMENT chronométré, étape par étape, reprises comprises :
 *   · durée cumulée des essais, et les 20 fichiers les plus longs ;
 *   · ouvertures de l'application (`page.goto` sur index.html, `page.reload`) ;
 *   · pauses fixes (`page.waitForTimeout`).
 * Ne voit pas un `setTimeout` écrit DANS un `page.evaluate` : ni étape, ni durée.
 *
 * USAGE
 *   node scripts/mesurer-verification.mjs [dossier de blobs] [--json sortie.json]
 * Sans dossier : la dernière passe gardée du Mac.
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CE_FICHIER = fileURLToPath(import.meta.url);
const RACINE = path.resolve(path.dirname(CE_FICHIER), '..');

/** La dernière passe gardée sur le Mac, hors dépôt (une seule, la plus récente). */
export const PASSE_GARDEE = process.env.VERIFICATION_GARDEE || path.join(homedir(), 'Library', 'Caches', 'labo-codex', 'derniere-verification');

/** La nature d'une étape de Playwright, d'après sa catégorie et son titre. */
export function natureDeLEtape(categorie, titre) {
    if (categorie !== 'pw:api') return null;
    if (titre === 'Wait for timeout') return 'pause';
    if (/^Navigate to "[^"]*index\.html/.test(titre)) return 'ouverture';
    if (titre === 'Reload') return 'rechargement';
    return null;
}

/** Le reporter : Playwright le rejoue sur les blobs (`merge-reports`). */
export default class MesureVerification {
    constructor() {
        this.fichiers = new Map();
        this.etapes = {};
        for (const nature of ['pause', 'ouverture', 'rechargement']) this.etapes[nature] = { n: 0, ms: 0, nPremier: 0, msPremier: 0 };
        this.essais = 0;
        this.reprises = 0;
    }

    printsToStdio() { return false; }

    onStepEnd(_test, resultat, etape) {
        const nature = natureDeLEtape(etape.category, etape.title);
        if (!nature) return;
        const compte = this.etapes[nature];
        compte.n += 1;
        compte.ms += etape.duration;
        // Sans les reprises : la part comparable d'une machine à l'autre (GitHub reprend ses rouges, pas le Mac).
        if (resultat.retry === 0) { compte.nPremier += 1; compte.msPremier += etape.duration; }
    }

    onTestEnd(test, resultat) {
        if (resultat.status === 'skipped') return;
        if (resultat.retry === 0) this.essais += 1; else this.reprises += 1;
        const f = path.basename(test.location.file);
        this.fichiers.set(f, (this.fichiers.get(f) ?? 0) + resultat.duration);
    }

    onEnd() {
        const minutes = (ms) => Math.round(ms / 600) / 100;
        const cumulMs = [...this.fichiers.values()].reduce((a, b) => a + b, 0);
        const dire = ({ n, ms, nPremier, msPremier }) => ({ nombre: n, minutes: minutes(ms), nombreSansReprises: nPremier, minutesSansReprises: minutes(msPremier) });
        const bilan = {
            essaisJoues: this.essais,
            reprises: this.reprises,
            minutesEssais: minutes(cumulMs),
            ouvertures: dire(this.etapes.ouverture),
            rechargements: dire(this.etapes.rechargement),
            pauses: dire(this.etapes.pause),
            vingtFichiersLesPlusLongs: [...this.fichiers].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([fichier, ms]) => ({ fichier, minutes: minutes(ms) }))
        };
        writeFileSync(process.env.MESURE_SORTIE, `${JSON.stringify(bilan, null, 2)}\n`, 'utf8');
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === CE_FICHIER) {
    const args = process.argv.slice(2);
    const i = args.indexOf('--json');
    const sortie = i >= 0 ? path.resolve(args.splice(i, 2)[1]) : path.join(PASSE_GARDEE, 'mesure.json');
    const blobs = path.resolve(args[0] ?? path.join(PASSE_GARDEE, 'blobs'));
    const r = spawnSync('npx', ['playwright', 'merge-reports', '--config', 'playwright.config.js', `--reporter=${CE_FICHIER}`, blobs], {
        cwd: path.join(RACINE, 'tests'), encoding: 'utf8', env: { ...process.env, MESURE_SORTIE: sortie }
    });
    if (r.status !== 0) { process.stderr.write(r.stderr || `merge-reports : code ${r.status}\n`); process.exit(2); }
    process.stdout.write(`${sortie}\n`);
}
