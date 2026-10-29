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
 *   node scripts/juger-rapport-playwright.mjs <rapport.json> [baseline.json]
 *
 * #1114 (25 oct. 2026) : le second argument nomme la baseline. Sans lui, la
 * commune (scripts/playwright-baseline.json, celle du Mac) ; le job `verdict`
 * de GitHub passe scripts/playwright-baseline-linux.json, les rougeurs propres
 * à Linux. Les règles du jugement ne changent pas.
 *
 * #1114 (28 oct. 2026) : la baseline peut porter une seconde liste,
 * `echecsIntermittents` — les essais qui changent de côté d'un soir à l'autre
 * sous Linux. Seule une rouge hors des deux listes fait échouer ; une connue
 * n'est « redevenue verte » que jouée et verte (absente : « non jouée ») ; une
 * intermittente ne bloque ni rouge ni verte, le juge dit combien sont rouges.
 *
 * Code de sortie : 0 = rien de neuf · 1 = échec nouveau · 2 = impossible à juger.
 * Si GITHUB_STEP_SUMMARY est posée, le verdict s'y écrit aussi : c'est ce que
 * l'application GitHub du téléphone affiche.
 */

import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { echecsDuRapport, flakyDuRapport, vertsDuRapport, comparerALaBaseline } from './rapport-playwright.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASELINE = process.argv[3] ? path.resolve(process.argv[3]) : path.join(__dirname, 'playwright-baseline.json');

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
if (!existsSync(BASELINE)) nonJuge(`Baseline absente (${path.relative(process.cwd(), BASELINE) || BASELINE}).`);

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
const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
const { nouveaux, reparees, aPasserAuxIntermittentes, nonJouees, intermittentesRouges } = comparerALaBaseline({ echecs, verts: vertsDuRapport(rapport), instables }, baseline);
const nIntermittentes = (baseline.echecsIntermittents ?? []).length;

dire(nouveaux.length > 0
    ? `## ✗ ${nouveaux.length} spec(s) Playwright NOUVELLEMENT rouge(s)`
    : `## ✓ Playwright : aucune rougeur nouvelle`);
dire('');
dire(`${joues} essais joués : ${stats.expected ?? 0} verts, ${stats.flaky ?? 0} verts au second essai, ${stats.unexpected ?? 0} rouges, ${stats.skipped ?? 0} sautés. ${echecs.length - nouveaux.length - intermittentesRouges.length} échec(s) connu(s) de la baseline (${path.basename(BASELINE)})${nIntermittentes > 0 ? ` ; ${intermittentesRouges.length} intermittente(s) rouge(s) sur ${nIntermittentes} (ne bloque ni rouge ni verte)` : ''}.`);
if (nouveaux.length > 0) { dire(''); dire('Absentes de la baseline — une régression :'); liste(nouveaux); }
if (instables.length > 0) { dire(''); dire(`⚠ ${instables.length} spec(s) VERTE(S) AU SECOND ESSAI — passées, mais instables (ne bloque pas, #534) :`); liste(instables); }
// La commune se régénère sur le Mac ; une autre (Linux) se tient à la main.
const commentRetirer = process.argv[3] ? `de ${path.basename(BASELINE)}, à la main` : '(node scripts/verifier-playwright.mjs --ecrire, sur le Mac)';
if (reparees.length > 0) { dire(''); dire(`✓ ${reparees.length} spec(s) de la baseline REDEVENUES VERTES — à retirer ${commentRetirer} :`); liste(reparees); }
// Rouge puis verte : une intermittente, pas une réparée — la retirer la ferait rougir « nouvelle ».
if (aPasserAuxIntermittentes.length > 0) { dire(''); dire(`⚠ ${aPasserAuxIntermittentes.length} spec(s) connue(s) VERTE(S) AU SECOND ESSAI — à passer aux intermittentes de ${path.basename(BASELINE)}, à la main, pas à retirer :`); liste(aPasserAuxIntermittentes); }
// Une connue absente du rapport n'a pas été jouée : rien à en conclure.
if (nonJouees.length > 0) { dire(''); dire(`${nonJouees.length} spec(s) de la baseline NON JOUÉE(S) dans ce rapport — ni rouge ni verte, rien à conclure :`); liste(nonJouees); }
conclure(nouveaux.length > 0 ? 1 : 0);
