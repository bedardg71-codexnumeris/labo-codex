#!/usr/bin/env node
/**
 * Verdict Playwright de la CI — juge un rapport JSON DÉJÀ PRODUIT.
 *
 * POURQUOI CE SCRIPT EXISTE (16 oct. 2026)
 * ----------------------------------------
 * Sur GitHub, la suite est découpée en morceaux (shards) qui tournent sur des
 * machines distinctes ; aucun ne voit la suite entière. Le job `verdict` de
 * .github/workflows/tests.yml fusionne leurs rapports, puis appelle ce script,
 * qui rend le MÊME jugement que le Mac (scripts/verifier-playwright.mjs) : seule
 * une rougeur absente de scripts/playwright-baseline.json fait échouer. Les
 * règles vivent une seule fois, dans scripts/rapport-playwright.mjs.
 *
 * USAGE
 * -----
 *   node scripts/juger-rapport-playwright.mjs <rapport.json>
 *
 * Code de sortie : 0 = rien de neuf · 1 = échec nouveau · 2 = impossible à juger.
 * Si GITHUB_STEP_SUMMARY est posée, le verdict s'y écrit aussi : c'est ce que
 * l'application GitHub du téléphone affiche.
 */

import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { echecsDuRapport, flakyDuRapport, comparerALaBaseline } from './rapport-playwright.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASELINE = path.join(__dirname, 'playwright-baseline.json');

const lignes = [];
const dire = (texte = '') => { lignes.push(texte); process.stderr.write(`${texte}\n`); };
const conclure = (code) => {
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lignes.join('\n')}\n`, 'utf8');
    process.exit(code);
};
const nonJuge = (raison) => { dire(`## ✗ Playwright NON JUGÉ`); dire(''); dire(raison); conclure(2); };
const liste = (specs) => specs.forEach((s) => dire(`- ${s}`));

const fichier = process.argv[2];
if (!fichier || !existsSync(fichier)) nonJuge(`Rapport introuvable : ${fichier ?? '(aucun chemin donné)'}.`);
if (!existsSync(BASELINE)) nonJuge('Baseline absente (scripts/playwright-baseline.json).');

let rapport;
try {
    rapport = JSON.parse(readFileSync(fichier, 'utf8'));
} catch (erreur) {
    nonJuge(`Rapport JSON illisible : ${erreur.message}`);
}

// Une erreur hors essai (config, chargement d'un spec) ne laisse aucune spec
// rouge derrière elle : sans cette garde, elle passerait pour du vert.
const erreurs = rapport.errors ?? [];
if (erreurs.length > 0) {
    nonJuge(`${erreurs.length} erreur(s) hors essai :\n\n${erreurs.map((e) => `- ${(e.message ?? String(e)).split('\n')[0]}`).join('\n')}`);
}
const stats = rapport.stats ?? {};
const joues = (stats.expected ?? 0) + (stats.unexpected ?? 0) + (stats.flaky ?? 0);
if (joues === 0) nonJuge('Le rapport ne contient aucun essai joué.');

const echecs = echecsDuRapport(rapport);
const instables = flakyDuRapport(rapport);
const { nouveaux, reparees } = comparerALaBaseline(echecs, JSON.parse(readFileSync(BASELINE, 'utf8')).echecsConnus);

dire(nouveaux.length > 0
    ? `## ✗ ${nouveaux.length} spec(s) Playwright NOUVELLEMENT rouge(s)`
    : `## ✓ Playwright : aucune rougeur nouvelle`);
dire('');
dire(`${joues} essais joués : ${stats.expected ?? 0} verts, ${stats.flaky ?? 0} verts au second essai, ${stats.unexpected ?? 0} rouges, ${stats.skipped ?? 0} sautés. ${echecs.length - nouveaux.length} échec(s) connu(s) de la baseline.`);
if (nouveaux.length > 0) { dire(''); dire('Absentes de la baseline — une régression :'); liste(nouveaux); }
if (instables.length > 0) { dire(''); dire(`⚠ ${instables.length} spec(s) VERTE(S) AU SECOND ESSAI — passées, mais instables (ne bloque pas, #534) :`); liste(instables); }
if (reparees.length > 0) { dire(''); dire(`✓ ${reparees.length} spec(s) de la baseline REDEVENUES VERTES — à retirer (node scripts/verifier-playwright.mjs --ecrire, sur le Mac) :`); liste(reparees); }
conclure(nouveaux.length > 0 ? 1 : 0);
