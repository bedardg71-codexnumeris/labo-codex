#!/usr/bin/env node
/**
 * release.mjs — synchronise le numero de version et le build dans TOUS les
 * points de verite du projet, d'un seul geste.
 *
 * Pourquoi : le build/version vit dans 4 endroits (version.json, deux
 * fallbacks de js/init-inline.js, un snapshot dans js/main.js). Les recopier
 * a la main desynchronise — c'est la cause du mecanisme « scripts perimes »
 * (BACKLOG #285). Ce script ecrit les 4 de facon atomique : soit tout, soit
 * rien (si un ancrage est introuvable, il abandonne sans rien modifier).
 *
 * Le JUGEMENT reste a toi : tu declares l'intention (patch/minor/major) ou
 * tu fixes la version. Le script ne fait que la mecanique : calcul du numero,
 * horodatage du build (heure de Toronto), ecriture synchronisee.
 *
 *   patch  1.0.0 -> 1.0.1   correction de bug, rien de neuf a l'usage
 *   minor  1.0.1 -> 1.1.0   nouveaute qui ne casse rien d'existant
 *   major  1.1.0 -> 2.0.0   rupture / changement de format des donnees
 *
 * La cle « beta » de version.json porte le numero (l'app affiche « Beta X »).
 * Tant que tu es en beta publique, « Beta 1.0.0 » est le libelle voulu.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

const HELP = `release.mjs — bump de version + build synchronise

Usage :
  node scripts/release.mjs patch          1.0.0 -> 1.0.1  (corrections)
  node scripts/release.mjs minor          1.0.1 -> 1.1.0  (nouveautes)
  node scripts/release.mjs major          1.1.0 -> 2.0.0  (rupture / donnees)
  node scripts/release.mjs --set 1.0.0    fixe une version precise
  node scripts/release.mjs --build-only   ne touche qu'au build (commit doc/UI)

Options :
  --dry-run        affiche le resultat sans rien ecrire
  --root <dir>     racine du projet (defaut : dossier parent de ce script)
  --help
`;

function fail(msg) {
  console.error('✖ ' + msg);
  process.exit(1);
}

// --- arguments ---
const args = process.argv.slice(2);
if (args.includes('--help')) {
  process.stdout.write(HELP);
  process.exit(0);
}
const dryRun = args.includes('--dry-run');
const buildOnly = args.includes('--build-only');

let root = resolve(SCRIPT_DIR, '..');
const rootIdx = args.indexOf('--root');
if (rootIdx !== -1) {
  if (!args[rootIdx + 1]) fail('--root attend un chemin.');
  root = resolve(args[rootIdx + 1]);
}

const setIdx = args.indexOf('--set');
let setVersion = null;
if (setIdx !== -1) {
  setVersion = args[setIdx + 1];
  if (!setVersion) fail('--set attend une version (ex. 1.0.0).');
}

const bumpArgs = args.filter((a) => ['patch', 'minor', 'major'].includes(a));
const bumpArg = bumpArgs[0] || null;

const modes = [...bumpArgs, setVersion ? 'set' : null, buildOnly ? 'build-only' : null].filter(Boolean);
if (modes.length === 0) fail('Precise un mode : patch | minor | major | --set X.Y.Z | --build-only (voir --help).');
if (modes.length > 1) fail('Un seul mode a la fois (recu : ' + modes.join(', ') + ').');

// --- semver ---
function parseSemver(v) {
  const m = String(v).trim().match(/^(\d+)\.(\d+)(?:\.(\d+))?(?:[-+].*)?$/);
  if (!m) fail(`Version courante illisible comme SemVer : « ${v} ».`);
  return { major: +m[1], minor: +m[2], patch: m[3] != null ? +m[3] : 0 };
}
function bumpSemver(v, kind) {
  const s = parseSemver(v);
  if (kind === 'major') return `${s.major + 1}.0.0`;
  if (kind === 'minor') return `${s.major}.${s.minor + 1}.0`;
  return `${s.major}.${s.minor}.${s.patch + 1}`;
}
function validateSet(v) {
  if (!/^\d+\.\d+\.\d+$/.test(v)) fail(`--set attend X.Y.Z (ex. 1.0.0), recu « ${v} ».`);
  return v;
}

// --- build (heure de Toronto, format MMJJ-HHMM) ---
function torontoBuild() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get('month')}${get('day')}-${get('hour')}${get('minute')}`;
}

// --- remplacement strict : exactement 1 occurrence, sinon abandon ---
function replaceOnce(content, regex, fn, label) {
  let count = 0;
  const g = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  const out = content.replace(g, (...m) => {
    count++;
    const groups = m.slice(1, m.length - 2);
    return fn(...groups);
  });
  if (count !== 1) {
    fail(`Ancrage introuvable ou ambigu dans ${label} : ${count} occurrence(s). Aucun fichier modifie.`);
  }
  return out;
}

// --- chemins ---
const versionJsonPath = join(root, 'version.json');
const initPath = join(root, 'js', 'init-inline.js');
const mainPath = join(root, 'js', 'main.js');

function read(p, label) {
  try {
    return readFileSync(p, 'utf8');
  } catch {
    fail(`${label} introuvable : ${p}`);
  }
}

// --- etat courant ---
const versionRaw = read(versionJsonPath, 'version.json');
let data;
try {
  data = JSON.parse(versionRaw);
} catch {
  fail('version.json illisible (JSON invalide).');
}
const curVersion = data.beta;
const curBuild = data.build;
if (curVersion == null || curBuild == null) fail('version.json doit contenir les cles « beta » et « build ».');

// --- nouvelles valeurs ---
const newVersion = buildOnly ? curVersion : setVersion ? validateSet(setVersion) : bumpSemver(curVersion, bumpArg);
const newBuild = torontoBuild();

// --- preparer les ecritures (tout valider AVANT d'ecrire) ---
const initRaw = read(initPath, 'js/init-inline.js');
let initNew = replaceOnce(
  initRaw,
  /(let VERSION_MAJEURE = ')[^']*(';)/,
  (p1, p2) => p1 + newVersion + p2,
  'init-inline.js (VERSION_MAJEURE)'
);
initNew = replaceOnce(
  initNew,
  /(let BUILD_ID = ')[^']*(';)/,
  (p1, p2) => p1 + newBuild + p2,
  'init-inline.js (BUILD_ID)'
);

const mainRaw = read(mainPath, 'js/main.js');
const mainNew = replaceOnce(
  mainRaw,
  /(window\._SCRIPT_BUILD_main = ')[^']*(';)/,
  (p1, p2) => p1 + newBuild + p2,
  'main.js (_SCRIPT_BUILD_main)'
);

const versionNew = JSON.stringify({ build: newBuild, beta: newVersion }) + '\n';

// --- rapport ---
console.log('Version : ' + curVersion + '  ->  ' + newVersion + (buildOnly ? '   (inchangee)' : ''));
console.log('Build   : ' + curBuild + '  ->  ' + newBuild);
console.log('Fichiers: version.json, js/init-inline.js (x2), js/main.js');

if (dryRun) {
  console.log('\n--dry-run : aucun fichier ecrit.');
  process.exit(0);
}

// --- ecriture ---
writeFileSync(versionJsonPath, versionNew);
writeFileSync(initPath, initNew);
writeFileSync(mainPath, mainNew);
console.log('\n✔ Ecrit. Ensuite : cd tests && npm test, verifier en navigation, puis committer.');
