#!/usr/bin/env node
/**
 * Sentinelle Playwright — comparaison à une baseline d'échecs connus.
 *
 * POURQUOI CE SCRIPT EXISTE
 * -------------------------
 * Les specs Playwright ont dérivé en silence pendant des mois (#456) : WebKit
 * n'existe pas dans les conteneurs, personne ne les lançait en local, et Vitest
 * restait vert pendant ce temps. Le 18 août 2026, la suite a tourné pour de vrai
 * et rendu 87 passées / 6 échecs — alors que la documentation en annonçait 5.
 *
 * Un hook qui BLOQUE sur toute rougeur est inapplicable ici : six specs sont
 * déjà rouges, il refuserait tous les pushes. Un hook qui se contente
 * d'AVERTIR se fait ignorer en trois jours. D'où cette forme : la dette connue
 * est inventoriée dans une baseline versionnée, et seule une rougeur NOUVELLE
 * bloque.
 *
 * ⚠ La baseline n'est PAS une permission de laisser pourrir. C'est un cliché
 * daté de la dette de #456, qui doit rétrécir. Chaque spec réparée s'en retire.
 *
 * USAGE
 * -----
 *   node scripts/verifier-playwright.mjs            # compare (code 1 si nouveauté)
 *   node scripts/verifier-playwright.mjs --ecrire   # régénère la baseline
 *
 * Code de sortie : 0 = rien de neuf · 1 = échec nouveau · 2 = impossible à juger.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..');
const DOSSIER_TESTS = path.join(RACINE, 'tests');
const BASELINE = path.join(__dirname, 'playwright-baseline.json');

// ESC construit plutôt qu'écrit : un octet 0x1b littéral dans le source est
// invisible à la relecture et se perd à la première réédition du fichier.
const ESC = String.fromCharCode(27);
const ROUGE = `${ESC}[0;31m`;
const VERT = `${ESC}[0;32m`;
const JAUNE = `${ESC}[0;33m`;
const RAZ = `${ESC}[0m`;

const ecrire = process.argv.includes('--ecrire');

/**
 * Identité d'une spec, STABLE dans le temps.
 *
 * Volontairement « fichier › titre », sans le numéro de ligne : une ligne bouge
 * dès qu'on édite le fichier au-dessus, et la baseline se mettrait alors à
 * dénoncer des échecs « nouveaux » qui sont les mêmes. Le titre, lui, ne bouge
 * que si l'on change ce que la spec vérifie — auquel cas la revoir est justement
 * ce qu'on veut.
 */
function identite(fichier, titre) {
    return `${fichier.replace(/\\/g, '/')} › ${titre}`;
}

/** Parcourt l'arbre de suites du rapport JSON et rend les specs en échec. */
function echecsDuRapport(rapport) {
    const trouves = [];
    const descendre = (suites) => {
        for (const suite of suites ?? []) {
            for (const spec of suite.specs ?? []) {
                if (spec.ok === false) trouves.push(identite(spec.file ?? suite.file ?? '?', spec.title));
            }
            descendre(suite.suites);
        }
    };
    descendre(rapport.suites);
    return trouves.sort();
}

// ── WebKit est-il seulement là ? ───────────────────────────────────────────────
// Sans lui, on ne peut RIEN juger. Ne pas confondre avec « tout va bien » : le
// script sort en 2, et c'est à l'appelant de décider s'il laisse passer.
//
// ⚠ PIÈGE ÉPROUVÉ (18 août 2026) : une première version de cette sonde lisait le
// code de retour de `playwright install --dry-run webkit` et cherchait « not
// installed » dans sa sortie. Elle était INERTE. `--dry-run` se contente
// d'imprimer l'emplacement où le navigateur IRAIT et rend 0 dans tous les cas,
// installé ou non — en conteneur, elle aurait répondu « WebKit est là ». Seule
// la présence du dossier sur le disque répond vraiment à la question.
const sondeWebKit = spawnSync('npx', ['playwright', 'install', '--dry-run', 'webkit'], {
    cwd: DOSSIER_TESTS, encoding: 'utf8'
});
const cheminAnnonce = (`${sondeWebKit.stdout}`.match(/^\s*Install location:\s*(.+)$/m) ?? [])[1]?.trim();
const webkitAbsent = sondeWebKit.status !== 0 || !cheminAnnonce || !existsSync(cheminAnnonce);

if (webkitAbsent) {
    process.stderr.write(`${JAUNE}⚠ WebKit introuvable — la suite Playwright ne peut pas être jugée ici.${RAZ}\n`);
    process.stderr.write('  C\'est le cas de tous les conteneurs (cf. #456). Sur le Mac : cd tests && npx playwright install webkit\n');
    process.exit(2);
}

// ── Exécution ─────────────────────────────────────────────────────────────────
const dossierTemporaire = mkdtempSync(path.join(tmpdir(), 'pw-sentinelle-'));
const fichierRapport = path.join(dossierTemporaire, 'rapport.json');

process.stderr.write(`${VERT}→ Sentinelle Playwright : exécution de la suite WebKit (~4 min)...${RAZ}\n`);

const execution = spawnSync('npx', ['playwright', 'test', '--reporter=json'], {
    cwd: DOSSIER_TESTS,
    encoding: 'utf8',
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: fichierRapport },
    maxBuffer: 64 * 1024 * 1024
});

if (!existsSync(fichierRapport)) {
    process.stderr.write(`${ROUGE}✗ Sentinelle Playwright : aucun rapport produit — la suite n'a pas pu s'exécuter.${RAZ}\n`);
    process.stderr.write(`${execution.stderr || execution.stdout || '(aucune sortie)'}\n`);
    rmSync(dossierTemporaire, { recursive: true, force: true });
    process.exit(2);
}

let rapport;
try {
    rapport = JSON.parse(readFileSync(fichierRapport, 'utf8'));
} catch (erreur) {
    process.stderr.write(`${ROUGE}✗ Rapport JSON illisible : ${erreur.message}${RAZ}\n`);
    rmSync(dossierTemporaire, { recursive: true, force: true });
    process.exit(2);
}
rmSync(dossierTemporaire, { recursive: true, force: true });

const echecs = echecsDuRapport(rapport);

// ── Mode écriture ─────────────────────────────────────────────────────────────
if (ecrire) {
    const contenu = {
        _lisezMoi: 'Cliché des specs Playwright rouges CONNUES (#456). Une rougeur absente de cette liste bloque le push. Cette liste doit RÉTRÉCIR : chaque spec réparée s\'en retire. Régénérer : node scripts/verifier-playwright.mjs --ecrire',
        genereLe: new Date().toISOString().slice(0, 10),
        totalEchecsConnus: echecs.length,
        echecsConnus: echecs
    };
    writeFileSync(BASELINE, `${JSON.stringify(contenu, null, 4)}\n`, 'utf8');
    process.stderr.write(`${VERT}✓ Baseline écrite : ${echecs.length} échec(s) connu(s).${RAZ}\n`);
    for (const echec of echecs) process.stderr.write(`    · ${echec}\n`);
    process.exit(0);
}

// ── Mode comparaison ──────────────────────────────────────────────────────────
if (!existsSync(BASELINE)) {
    process.stderr.write(`${ROUGE}✗ Baseline absente (${path.relative(RACINE, BASELINE)}).${RAZ}\n`);
    process.stderr.write('  La créer : node scripts/verifier-playwright.mjs --ecrire\n');
    process.exit(2);
}

const connus = new Set(JSON.parse(readFileSync(BASELINE, 'utf8')).echecsConnus ?? []);
const nouveaux = echecs.filter((e) => !connus.has(e));
const reparees = [...connus].filter((e) => !echecs.includes(e)).sort();

// Une spec réparée n'a jamais à bloquer un push — mais si personne ne le dit, la
// baseline se met à couvrir des specs vertes et devient un mensonge silencieux.
if (reparees.length > 0) {
    process.stderr.write(`\n${VERT}✓ ${reparees.length} spec(s) de la baseline sont REDEVENUES VERTES :${RAZ}\n`);
    for (const spec of reparees) process.stderr.write(`    · ${spec}\n`);
    process.stderr.write(`${JAUNE}  ⮕ Retire-les de la baseline, sinon elle couvre du vert :${RAZ}\n`);
    process.stderr.write('     node scripts/verifier-playwright.mjs --ecrire\n');
}

if (nouveaux.length > 0) {
    process.stderr.write(`\n${ROUGE}✗ ${nouveaux.length} spec(s) Playwright NOUVELLEMENT rouge(s) — push bloqué.${RAZ}\n\n`);
    for (const spec of nouveaux) process.stderr.write(`    · ${spec}\n`);
    process.stderr.write(`\n${ROUGE}Ces specs ne sont pas dans la dette connue de #456 : c'est une régression.${RAZ}\n`);
    process.stderr.write(`Bypass d'urgence (déconseillé) : ${JAUNE}git push --no-verify${RAZ}\n`);
    process.exit(1);
}

process.stderr.write(`${VERT}✓ Sentinelle Playwright : aucune rougeur nouvelle (${echecs.length} échec(s) connu(s), inchangé).${RAZ}\n`);
process.exit(0);
