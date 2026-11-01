#!/usr/bin/env node
/**
 * Combien coûte UNE ouverture de l'application, sous WebKit (M1, 1er nov. 2026).
 *
 * Mesure, pour chaque ouverture (nouveau contexte, comme un essai) :
 *   · load : `await page.goto(index)` sans option, donc jusqu'à l'événement `load` :
 *     ce que font les 393 ouvertures écrites dans tests/integration/ (mesuré le
 *     1er nov. 2026). C'est le seul signal commun à toutes ;
 *   · pret : jusqu'à `window.dbReady === true`, la première attente de 88 d'entre
 *     elles, le signal explicite le plus fréquent.
 *
 * USAGE (hors de toute passe lourde, Mac au repos)
 *   node scripts/mesurer-ouverture.mjs [--fois 20] [chemin/index.html]
 * Sans chemin : index.html de la racine. Écrit le détail en JSON sur stdout.
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { webkit, devices } = createRequire(path.join(RACINE, 'tests', 'package.json'))('@playwright/test');

const args = process.argv.slice(2);
const i = args.indexOf('--fois');
const fois = i >= 0 ? Number(args.splice(i, 2)[1]) : 20;
const cible = path.resolve(args[0] ?? path.join(RACINE, 'index.html'));

const mediane = (v) => { const t = [...v].sort((a, b) => a - b); const m = t.length >> 1; return t.length % 2 ? t[m] : (t[m - 1] + t[m]) / 2; };
const resumer = (v) => ({ mediane: Math.round(mediane(v)), min: Math.round(Math.min(...v)), max: Math.round(Math.max(...v)) });

const navigateur = await webkit.launch();
const load = [];
const pret = [];
try {
    for (let k = 0; k < fois; k++) {
        const contexte = await navigateur.newContext(devices['Desktop Safari']);
        const page = await contexte.newPage();
        const debut = performance.now();
        await page.goto(`file://${cible}`);
        load.push(performance.now() - debut);
        await page.waitForFunction(() => window.dbReady === true, null, { timeout: 60000 });
        pret.push(performance.now() - debut);
        await contexte.close();
    }
} finally {
    await navigateur.close();
}
process.stdout.write(`${JSON.stringify({ cible: path.relative(RACINE, cible), fois, load: resumer(load), pret: resumer(pret), detailLoad: load.map(Math.round), detailPret: pret.map(Math.round) }, null, 2)}\n`);
