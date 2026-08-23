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
import { execFileSync } from 'node:child_process';
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

// --- parametre anti-cache des <script> (BACKLOG #417, 8 aout 2026) ---
//
// Pourquoi c'est ICI et pas dans les doigts du developpeur : ce script
// reecrivait `_SCRIPT_BUILD_main` a chaque release SANS jamais toucher au
// `?v=` du <script> correspondant. Resultat mesure le 7 aout : le `?v=` de
// init-inline.js etait reste au 20260629 apres plus de VINGT reecritures.
// Un fichier reecrit mais servi sous la meme URL peut sortir du cache du
// navigateur dans sa version PERIMEE — c'est ce qui a masque la migration
// #367 pendant des heures. Bumper a la main ne corrige qu'une fois ; la
// desynchronisation, elle, revient a chaque release.
//
// Le format existant est `AAAAMMJJ` suivi d'un suffixe alphabetique
// facultatif (`20260807e`). Deux releases le meme jour doivent produire deux
// URL differentes, sinon le cache n'est pas casse : d'ou le suffixe qui
// s'incremente quand la date ne change pas.
function anneeToronto() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric' }).format(new Date());
}

function incrementerSuffixe(lettres) {
  if (!lettres) return 'a';
  // Compteur bijectif base 26 : a..z, aa, ab, … Pas de plafond silencieux.
  const chiffres = lettres.split('').map((c) => c.charCodeAt(0) - 96);
  let i = chiffres.length - 1;
  chiffres[i] += 1;
  while (i >= 0 && chiffres[i] > 26) {
    chiffres[i] = 1;
    if (i === 0) { chiffres.unshift(1); break; }
    chiffres[--i] += 1;
  }
  return chiffres.map((n) => String.fromCharCode(96 + n)).join('');
}

function prochainParamCache(actuel, dateDuJour) {
  const m = /^(\d{8})([a-z]*)$/.exec(actuel || '');
  // Format inattendu ou date d'un autre jour : on repart proprement a `a`.
  if (!m || m[1] !== dateDuJour) return dateDuJour + 'a';
  return dateDuJour + incrementerSuffixe(m[2]);
}

// Fichiers que CETTE release embarque : ceux que le script reecrit lui-meme,
// plus ceux que le developpeur a modifies sans les avoir commites. Sans ce
// second groupe, un chantier qui touche dix modules livrerait dix fichiers
// sous leur ancienne URL — le meme defaut, un fichier plus loin.
//
// ⚠ #438 (9 aout 2026) — LE CSS EN FAIT PARTIE. Le bloc #417 ci-dessus ne
// balayait que `js/` : `styles.css` n'a JAMAIS ete bumpe par ce script. Deux
// releases du 9 aout ont du le faire a la main. Or la regle de #417 vaut mot
// pour mot pour une feuille de style — un correctif CSS servi sous la meme
// URL sort du cache dans sa version perimee, donc il est INERTE, et rien ne
// le signale : la page s'affiche, simplement avec l'ancien style. C'est la
// lecon de #417 qui n'avait pas ete poussee jusqu'au CSS.
//
// La boucle de bump plus bas n'avait, elle, rien de specifique au JS : elle
// cherche `<chemin>?v=` sans savoir si c'est un <script src> ou un <link
// href>. Il ne manquait que le fichier dans la liste.
// INCIDENT DU 23 AOUT 2026 — LE BON NUMERO DE VERSION SUR L'ANCIENNE APP.
//
// Cette fonction ne regardait que `git status --porcelain`, c'est-a-dire
// l'ARBRE DE TRAVAIL. Elle supposait donc qu'on lance la release AVANT de
// commiter (l'ordre de DEPLOY.md §2.1). Le 23 aout, le chantier #291/#476 a
// ete commite d'abord, puis release : `git status` ne voyait plus rien, et
// SEULS `init-inline.js` et `main.js` ont ete bumpes — c'est-a-dire
// precisement les deux fichiers qui AFFICHENT le numero de version.
//
// Resultat mesure sur l'iPad de Gregoire : « 1.92.0 build 0823-1013 » en bas
// de page, et l'ANCIEN bandeau de doublons a l'ecran, consigne fausse
// comprise. Le pire des symptomes — l'app annonce une version qu'elle
// n'execute pas, donc la porte terrain teste l'etat d'AVANT en croyant tester
// l'apres.
//
// La parade : ne plus faire confiance a un seul point de vue. On reunit
//   (a) l'arbre de travail   — le chantier pas encore commite ;
//   (b) tout ce qui a change DEPUIS LA RELEASE PRECEDENTE — le chantier deja
//       commite. Le repere est le dernier commit qui a touche `version.json`,
//       c'est-a-dire la release d'avant, par construction.
// L'ordre de travail n'a plus d'importance.
function fichiersModifies(racine) {
  const git = (args) => execFileSync('git', args, {
    cwd: racine, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
  });
  const retenir = (liste) => liste
    .filter((f) => (f.endsWith('.js') || f.endsWith('.css')) && !f.includes('_archives/'));

  try {
    // (a) arbre de travail
    const travail = git(['status', '--porcelain', '--', 'js', 'styles.css', 'css'])
      .split('\n').map((l) => l.slice(3).trim()).filter(Boolean);

    // (b) depuis la release precedente
    let depuisRelease = [];
    try {
      const repere = git(['log', '-1', '--format=%H', '--', 'version.json']).trim();
      if (repere) {
        depuisRelease = git(['diff', '--name-only', repere, 'HEAD', '--', 'js', 'styles.css', 'css'])
          .split('\n').map((l) => l.trim()).filter(Boolean);
      }
    } catch {
      // Depot sans historique de version.json (premier commit, greffe) :
      // l'arbre de travail reste une base valable, on ne bloque pas.
    }

    return [...new Set(retenir([...travail, ...depuisRelease]))];
  } catch {
    // Pas de git (archive, tarball) : on ne bloque pas la release, mais on ne
    // fait pas semblant non plus — l'appelant affiche l'avertissement.
    return null;
  }
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

// --- parametres anti-cache d'index.html (#417) ---
const indexPath = join(root, 'index.html');
const indexRaw = read(indexPath, 'index.html');
const dateDuJour = anneeToronto() + newBuild.slice(0, 4); // AAAA + MMJJ

const modifies = fichiersModifies(root);
const gitIndisponible = modifies === null;
// `init-inline.js` et `main.js` sont reecrits par ce script : ils sont toujours
// de la partie, meme si git ne les signale pas encore comme modifies.
const aBumper = [...new Set(['js/init-inline.js', 'js/main.js', ...(modifies || [])])].sort();

let indexNew = indexRaw;
const bumpes = [];
const absents = [];
for (const relatif of aBumper) {
  const motif = new RegExp('(' + relatif.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\?v=)([A-Za-z0-9]+)', 'g');
  const trouvailles = [...indexNew.matchAll(motif)];
  if (trouvailles.length === 0) {
    // Fichier non reference dans index.html (charge autrement, ou nouveau) :
    // ce n'est pas une erreur de release, mais ca se dit.
    absents.push(relatif);
    continue;
  }
  if (trouvailles.length > 1) {
    fail(`${relatif} est reference ${trouvailles.length} fois dans index.html : bump ambigu. Aucun fichier modifie.`);
  }
  const ancien = trouvailles[0][2];
  const nouveau = prochainParamCache(ancien, dateDuJour);
  indexNew = indexNew.replace(motif, (_m, p1) => p1 + nouveau);
  bumpes.push(`${relatif} : ${ancien} -> ${nouveau}`);
}

// --- rapport ---
console.log('Version : ' + curVersion + '  ->  ' + newVersion + (buildOnly ? '   (inchangee)' : ''));
console.log('Build   : ' + curBuild + '  ->  ' + newBuild);
console.log('Fichiers: version.json, js/init-inline.js (x2), js/main.js');
console.log('Anti-cache index.html : ' + bumpes.length + ' fichier(s) bumpe(s) (script + css)');
for (const ligne of bumpes) console.log('  · ' + ligne);
if (absents.length) {
  console.log('  (non references dans index.html, ignores : ' + absents.join(', ') + ')');
}
if (gitIndisponible) {
  console.log('  ⚠ git indisponible : seuls init-inline.js et main.js ont ete bumpes.');
  console.log('    Verifier a la main le ?v= des autres fichiers modifies par ce chantier.');
}

if (dryRun) {
  console.log('\n--dry-run : aucun fichier ecrit.');
  process.exit(0);
}

// --- ecriture ---
writeFileSync(versionJsonPath, versionNew);
writeFileSync(initPath, initNew);
writeFileSync(mainPath, mainNew);
writeFileSync(indexPath, indexNew);
console.log('\n✔ Ecrit. Ensuite : cd tests && npm test, verifier en navigation, puis committer.');
