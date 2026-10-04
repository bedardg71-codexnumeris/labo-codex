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

import { spawn, spawnSync } from 'node:child_process';
import {
    lireEchangeMo, lirePression, lireCapacites, lireAlimentation,
    lireAssertionsSysteme, lireAssertionsDuProcessus, jugerEveil,
    jugerMemoire, jugerLancementMemoire, memoireAuPlusHaut, lireVeillesDuJournal, formaterMo
} from './garde-eveil.mjs';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..');
const DOSSIER_TESTS = path.join(RACINE, 'tests');
const BASELINE = path.join(__dirname, 'playwright-baseline.json');

// Jeton de verdict — état LOCAL, jamais versionné (.gitignore).
//
// POURQUOI IL EXISTE (#533, 26 août 2026). Le hook pré-push lançait cette suite
// lui-même. Or git ouvre la connexion vers le serveur AVANT d'exécuter le hook :
// pendant les six minutes de WebKit, la session SSH ne transmet rien, et GitHub
// la ferme. Le verdict arrivait juste après la fermeture — juste, et inutile.
// Désormais la suite tourne EN AMONT (scripts/pousser.sh) et dépose ici son
// verdict ; le hook ne fait plus que le lire, en une fraction de seconde.
//
// Le SHA est ce qui empêche le jeton de mentir : un verdict rendu sur un commit
// ne couvre pas le suivant. Commiter à nouveau périme le jeton, et le hook
// redemande la garde — c'est voulu.
const VERDICT = process.env.VERDICT_PLAYWRIGHT || path.join(__dirname, '.verdict-playwright.json');

// ── Seuils de la garde mémoire (#1008, 4 oct. 2026) ──────────────────────────
// Ils vivent ICI, et non dans pousser.sh, parce que tout verdict passe par ce
// script, quel que soit l'appelant (fin-de-session, lancement à la main) ; celui
// de la nuit du 1er oct. avait contourné pousser.sh.
//
// MESURÉ : au repos, le 4 oct. à 7 h 09, l'échange était à 5 524 Mo (pression 1,
// Mac de 16 Go). La nuit du 1er, à 3 h 48, il était à 14,6 Go sur 15,4 (charge
// 157), et le Mac a fini figé, redémarré par le bouton.
// ECHANGE_LANCEMENT_MO = 10 Go : deux fois le repos ; au-delà, la suite part sur
//   une machine déjà en manque, on ne lance pas.
// ECHANGE_SEUIL_MO = 12 Go : sous les 14,6 Go de la nuit du 1er, avec la marge
//   d'un relevé (30 s). Au-delà, sur deux relevés de suite, on arrête la suite.
// PRESSION_SEUIL = 4 : le niveau « critique » de kern.memorystatus_vm_pressure_level
//   (1 normal, 2 avertissement, 4 critique).
// GARDE_PAS_S = 30 : un relevé, comme la garde de charge.
// ⚠ NON MESURÉ au moment d'écrire : le plus haut d'échange d'une suite saine. Le
//   rapport le relève désormais (garde.memoire) ; c'est lui qui dira si 12 Go est juste.
// Les variables LABO_* servent à la contre-épreuve ; les lever pour forcer un
// lancement est un geste explicite, jamais un défaut.
const ECHANGE_LANCEMENT_MO = Number(process.env.LABO_ECHANGE_LANCEMENT_MO || 10 * 1024);
const ECHANGE_SEUIL_MO = Number(process.env.LABO_ECHANGE_SEUIL_MO || 12 * 1024);
const PRESSION_SEUIL = Number(process.env.LABO_PRESSION_SEUIL || 4);
const GARDE_PAS_S = Math.max(1, Number(process.env.LABO_GARDE_PAS_S || 30));

/**
 * Dépose le verdict pour le commit courant.
 *
 * Silencieux en cas d'échec : hors dépôt git, ou dossier en lecture seule, un
 * jeton non écrit fait retomber le hook sur « pas de verdict » — il redemandera
 * la garde. C'est le bon repli : jamais un push non vérifié.
 */
function deposerVerdict(code, echecs, instables = [], garde = null) {
    try {
        const tete = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: RACINE, encoding: 'utf8' });
        if (tete.status !== 0) return;
        writeFileSync(VERDICT, `${JSON.stringify({
            _lisezMoi: 'Verdict local de la sentinelle Playwright, lu par le hook pré-push. Non versionné. Régénérer : scripts/pousser.sh, ou node scripts/verifier-playwright.mjs',
            sha: tete.stdout.trim(),
            code,
            echecsConnus: echecs.length,
            // #685, 1er sept. 2026 — l'instabilité ne survivait pas au jeton.
            // Elle sortait sur stderr, que personne ne relit ; le jeton, lui, est
            // ce que le hook et la session suivante lisent, et il disait « vert »
            // sans dire « au second essai ». Un vert rattrapé ressemblait à un
            // vert franc — exactement ce que la doc de flakyDuRapport() interdit.
            instables,
            // #1008 — l'éveil, les veilles et la mémoire de la suite (null hors macOS).
            // `garde.nonJuge` nomme la garde qui a refusé de juger (code 2).
            garde,
            rendule: new Date().toISOString()
        }, null, 4)}\n`, 'utf8');
    } catch {
        /* voir ci-dessus : l'absence de jeton est un repli sûr */
    }
}

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

/**
 * Specs VERTES AU SECOND ESSAI (#534, 26 août 2026).
 *
 * `retries: 1` empêche qu'un dépassement de délai isolé refuse un push légitime.
 * Mais une reprise silencieuse est un tapis : elle transforme l'instabilité en
 * vert, et personne ne voit plus rien. Ces specs ne bloquent pas — elles se
 * DISENT. C'est la même règle que le « verdict impossible » plus bas : ce qu'on
 * n'a pas su juger ne doit jamais ressembler à ce qui va bien.
 */
function flakyDuRapport(rapport) {
    const trouves = [];
    const descendre = (suites) => {
        for (const suite of suites ?? []) {
            for (const spec of suite.specs ?? []) {
                const instable = (spec.tests ?? []).some((t) => t.status === 'flaky');
                if (instable) trouves.push(identite(spec.file ?? suite.file ?? '?', spec.title));
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
    deposerVerdict(2, []);
    process.exit(2);
}

// ── Garde-éveil, au lancement (#987, puis #1008) ──────────────────────────────
// #987 (29 sept. 2026) : 75 des 115 min d'un passage tombaient dans des essais
// commencés à l'instant d'une veille d'inactivité ; `caffeinate -i` y répondait.
// #1008 (nuit du 1er oct.) : lancé écran éteint, en éveil sombre, le verdict de
// 1.173.0 a subi deux « Maintenance Sleep » malgré `caffeinate -i`.
// D'où trois gestes : déclarer l'utilisateur actif (-u, ramène l'écran — mesuré
// après `pmset displaysleepnow`), tenir écran, inactivité et système (-d -i -s)
// le temps de CE processus (-w), puis VÉRIFIER que c'est tenu. Sinon, on ne
// lance pas : un verdict rendu dans un Mac qui dort ne juge pas le code.
// Les décisions sont dans garde-eveil.mjs (fonctions pures, sentinelle #1008).
// ⚠ Rien n'empêche la veille quand on ferme le couvercle du MacBook.
const surMac = process.platform === 'darwin';
const lire = (commande, args) => {
    const r = spawnSync(commande, args, { encoding: 'utf8' });
    return r.status === 0 ? r.stdout : '';
};
const releverMemoire = () => ({
    instant: new Date().toISOString(),
    echangeMo: lireEchangeMo(lire('sysctl', ['vm.swapusage'])),
    pression: lirePression(lire('sysctl', ['-n', 'kern.memorystatus_vm_pressure_level']))
});
const garde = surMac ? { eveilCompletTenu: null, alimentation: null, systemeRetenu: null, veilles: [], nombreVeilles: 0, dureeVeillesS: 0, memoire: null, nonJuge: null, raison: '' } : null;

/** Refus d'une garde : code 2, une ligne qui dit pourquoi. */
function nonJuge(quoi, raison) {
    garde.nonJuge = quoi;
    garde.raison = raison;
    process.stderr.write(`${ROUGE}✗ Sentinelle Playwright NON JUGÉE (${quoi}) : ${raison}.${RAZ}\n`);
    deposerVerdict(2, [], [], garde);
    process.exit(2);
}

let caffeinate = null;
if (surMac) {
    spawnSync('caffeinate', ['-u', '-t', '2']);
    caffeinate = spawn('caffeinate', ['-d', '-i', '-s', '-w', String(process.pid)], { stdio: 'ignore', detached: true });
    // Sans écouteur, un caffeinate absent ferait tomber ce processus plus tard ;
    // ici il n'y a rien à tolérer : la vérification ci-dessous refusera.
    caffeinate.on('error', () => {});
    caffeinate.unref();
    spawnSync('sleep', ['2']);

    const assertions = lire('pmset', ['-g', 'assertions']);
    garde.alimentation = lireAlimentation(lire('pmset', ['-g', 'ps']));
    const eveil = jugerEveil({
        capacites: lireCapacites(lire('pmset', ['-g', 'systemstate'])),
        assertionsProcessus: lireAssertionsDuProcessus(assertions, caffeinate.pid),
        assertionsSysteme: lireAssertionsSysteme(assertions),
        alimentation: garde.alimentation
    });
    garde.systemeRetenu = eveil.systemeRetenu;
    if (!eveil.ok) nonJuge('éveil', eveil.raison);
    garde.eveilCompletTenu = true;

    const auLancement = releverMemoire();
    const lancement = jugerLancementMemoire(auLancement, ECHANGE_LANCEMENT_MO);
    if (!lancement.ok) nonJuge('mémoire', lancement.raison);
    process.stderr.write(`${VERT}✓ Éveil complet tenu (caffeinate -d -i -s, ${garde.alimentation ?? 'alimentation illisible'}${garde.systemeRetenu ? '' : ', -s inopérant sur batterie'}) ; échange ${formaterMo(auLancement.echangeMo)}, pression ${auLancement.pression ?? '?'}.${RAZ}\n`);
}

// ── Exécution ─────────────────────────────────────────────────────────────────
const dossierTemporaire = mkdtempSync(path.join(tmpdir(), 'pw-sentinelle-'));
const fichierRapport = path.join(dossierTemporaire, 'rapport.json');

process.stderr.write(`${VERT}→ Sentinelle Playwright : exécution de la suite WebKit (~45 min)...${RAZ}\n`);

// #1008 — lancement ASYNCHRONE, dans un groupe de processus à soi (detached) :
// un spawnSync bloquait la boucle d'événements les ~45 min, et rien ne pouvait
// surveiller. Le groupe permet d'arrêter la suite ENTIÈRE, WebKit compris.
const debutMs = Date.now();
const sorties = { stdout: '', stderr: '' };
const garder = (cle) => (morceau) => { sorties[cle] = (sorties[cle] + morceau).slice(-64 * 1024); };
const suite = spawn('npx', ['playwright', 'test', '--reporter=json'], {
    cwd: DOSSIER_TESTS,
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: fichierRapport },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true
});
suite.stdout.setEncoding('utf8').on('data', garder('stdout'));
suite.stderr.setEncoding('utf8').on('data', garder('stderr'));

let arretMemoire = '';
const arreterLaSuite = () => {
    try { process.kill(-suite.pid, 'SIGTERM'); } catch { /* déjà terminée */ }
    setTimeout(() => { try { process.kill(-suite.pid, 'SIGKILL'); } catch { /* idem */ } }, 10_000).unref();
};
for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => { arreterLaSuite(); process.exit(130); });
}

// La surveillance, toutes les GARDE_PAS_S : la mémoire (arrêt sur dépassement
// tenu), l'éveil complet, et le réveil (kern.waketime bouge = une veille a eu
// lieu ; le compte exact se lit au journal à la fin, l'horloge de Node comptant
// le temps de veille — mesuré, cf. garde-eveil.mjs).
const releves = [];
let reveilConnu = surMac ? lire('sysctl', ['-n', 'kern.waketime']) : '';
const surveillance = surMac ? setInterval(() => {
    const releve = releverMemoire();
    releves.push(releve);
    const memoire = jugerMemoire(releves, { echangeSeuilMo: ECHANGE_SEUIL_MO, pressionSeuil: PRESSION_SEUIL });
    if (memoire.arreter && !arretMemoire) {
        arretMemoire = memoire.raison;
        process.stderr.write(`${ROUGE}✗ Mémoire : ${memoire.raison} — arrêt de la suite.${RAZ}\n`);
        arreterLaSuite();
    }
    if (!lireCapacites(lire('pmset', ['-g', 'systemstate'])).includes('Graphics')) garde.eveilCompletTenu = false;
    const reveil = lire('sysctl', ['-n', 'kern.waketime']);
    if (reveil && reveil !== reveilConnu) {
        reveilConnu = reveil;
        process.stderr.write(`${JAUNE}⚠ Le Mac s'est endormi pendant la suite (réveil à ${releve.instant}).${RAZ}\n`);
    }
}, GARDE_PAS_S * 1000) : null;

await new Promise((fin) => suite.on('close', fin).on('error', fin));
if (surveillance) clearInterval(surveillance);

if (surMac) {
    garde.veilles = lireVeillesDuJournal(lire('pmset', ['-g', 'log']), debutMs, Date.now());
    garde.nombreVeilles = garde.veilles.length;
    garde.dureeVeillesS = garde.veilles.reduce((s, v) => s + v.dureeS, 0);
    garde.memoire = { ...memoireAuPlusHaut(releves), releves: releves.length };
    process.stderr.write(`  Garde : éveil complet ${garde.eveilCompletTenu ? 'tenu' : 'NON tenu'} ; ${garde.nombreVeilles} veille(s) (${garde.dureeVeillesS} s) ; mémoire au plus haut : échange ${formaterMo(garde.memoire.echangeMo)}, pression ${garde.memoire.pression ?? '?'}.\n`);
    if (arretMemoire) {
        rmSync(dossierTemporaire, { recursive: true, force: true });
        nonJuge('mémoire', arretMemoire);
    }
}

if (!existsSync(fichierRapport)) {
    process.stderr.write(`${ROUGE}✗ Sentinelle Playwright : aucun rapport produit — la suite n'a pas pu s'exécuter.${RAZ}\n`);
    process.stderr.write(`${sorties.stderr || sorties.stdout || '(aucune sortie)'}\n`);
    rmSync(dossierTemporaire, { recursive: true, force: true });
    deposerVerdict(2, [], [], garde);
    process.exit(2);
}

let rapport;
try {
    rapport = JSON.parse(readFileSync(fichierRapport, 'utf8'));
} catch (erreur) {
    process.stderr.write(`${ROUGE}✗ Rapport JSON illisible : ${erreur.message}${RAZ}\n`);
    rmSync(dossierTemporaire, { recursive: true, force: true });
    deposerVerdict(2, [], [], garde);
    process.exit(2);
}
rmSync(dossierTemporaire, { recursive: true, force: true });

const echecs = echecsDuRapport(rapport);
const instables = flakyDuRapport(rapport);

// Dit avant tout verdict : une spec rattrapée au second essai est passée, mais
// elle a échoué une fois, et c'est une information qui se perd si on se tait.
if (instables.length > 0) {
    process.stderr.write(`\n${JAUNE}⚠ ${instables.length} spec(s) VERTE(S) AU SECOND ESSAI — passées, mais instables :${RAZ}\n`);
    for (const spec of instables) process.stderr.write(`    · ${spec}\n`);
    process.stderr.write(`${JAUNE}  ⮕ Ne bloque pas (#534). Si la même revient souvent, c'est un vrai sujet.${RAZ}\n`);
}

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
    deposerVerdict(2, [], [], garde);
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
    deposerVerdict(1, echecs, instables, garde);
    // #1008 — un rouge rendu après une veille le dit EN TÊTE : le délai d'un
    // essai court pendant la veille, et ces rougeurs-là ne jugent pas le code.
    if (garde && garde.nombreVeilles > 0) {
        process.stderr.write(`\n${JAUNE}⚠ VERDICT ROUGE RENDU APRÈS ${garde.nombreVeilles} VEILLE(S) (${garde.dureeVeillesS} s) — relancer, Mac éveillé, avant d'y croire.${RAZ}\n`);
    }
    process.stderr.write(`\n${ROUGE}✗ ${nouveaux.length} spec(s) Playwright NOUVELLEMENT rouge(s) — push bloqué.${RAZ}\n\n`);
    for (const spec of nouveaux) process.stderr.write(`    · ${spec}\n`);
    process.stderr.write(`\n${ROUGE}Ces specs ne sont pas dans la dette connue de #456 : c'est une régression.${RAZ}\n`);
    process.stderr.write(`Bypass d'urgence (déconseillé) : ${JAUNE}git push --no-verify${RAZ}\n`);
    process.exit(1);
}

deposerVerdict(0, echecs, instables, garde);
process.stderr.write(`${VERT}✓ Sentinelle Playwright : aucune rougeur nouvelle (${echecs.length} échec(s) connu(s), inchangé).${RAZ}\n`);
process.exit(0);
