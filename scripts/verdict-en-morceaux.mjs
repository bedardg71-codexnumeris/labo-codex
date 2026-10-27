#!/usr/bin/env node
/**
 * Le verdict du Mac EN MORCEAUX, outillé — et son report sur un commit de tests.
 *
 * POURQUOI CE SCRIPT EXISTE (26 oct. 2026, consigne du tri de Git, volet B)
 * -------------------------------------------------------------------------
 * D'un bloc (scripts/verifier-playwright.mjs), la suite tient ~45 min et la
 * mémoire du Mac de 16 Go ne la supporte plus à côté de Cowork. Depuis le
 * 25 oct., Claude Code la joue À LA MAIN en dix morceaux (RELAIS.md, 26 oct. :
 * scripts/morceau-playwright.mjs, `caffeinate -d -i -s`, fusion des rapports
 * blob, jugement contre scripts/playwright-baseline.json) — puis écrit le jeton
 * à la main. Deux fois le 26. Et une fois, il a REPORTÉ à la main un verdict
 * sur un commit qui ne changeait que des tests, aux trois conditions de
 * plans de travail/CONSIGNE-LOT-2026-10-26-verdict-rouge-1220-retouche.md.
 * Ce script fait ces deux gestes, sans main.
 *
 * CE QUI NE CHANGE PAS : le juge. Le Mac reste le juge du push (décision de
 * Grégoire, 10 oct.), le crochet pré-push lit le même jeton
 * (scripts/lire-verdict.mjs), et les règles du jugement sont celles de
 * scripts/rapport-playwright.mjs — seule une rougeur absente de la baseline
 * commune fait échouer.
 *
 * USAGE
 * -----
 *   node scripts/verdict-en-morceaux.mjs               # dix morceaux, l'un après l'autre
 *   node scripts/verdict-en-morceaux.mjs --morceaux 12 # un autre découpage
 *   node scripts/verdict-en-morceaux.mjs --reporter    # reporte le jeton vert sur HEAD
 *
 * Avant de lancer les morceaux : Cowork, Chrome et Safari fermés, sur secteur.
 *
 * LE REPORT — les trois conditions de la consigne du 26 oct., généralisées :
 *   1. Le jeton en place est VERT (code 0) et son SHA est un ancêtre de HEAD ;
 *      entre les deux, `git diff --name-only` ne nomme que `plans de travail/`,
 *      des specs `tests/integration/*.spec.js` ou des essais `tests/unit/`.
 *      ⚠ Plus strict que la consigne, qui disait « tests/ » : la configuration,
 *      les aides partagées ou le lock des tests changent la façon dont TOUTES
 *      les specs tournent — la suite entière repasse.
 *   2. Chaque spec de `tests/integration/` touchée par ce diff, rejouée EN
 *      ENTIER, seule (sans le reste de la suite), est verte.
 *   3. (« aucune autre spec recalée ») : découle du 2 — toute spec touchée est
 *      rejouée, il n'y en a pas d'autre.
 *   Si une condition manque : code 3, aucun jeton écrit, la suite entière repasse.
 *
 * Code de sortie : 0 = vert · 1 = rougeur nouvelle · 2 = NON JUGÉ · 3 = report refusé.
 */

import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, mkdirSync, copyFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { echecsDuRapport, flakyDuRapport, comparerALaBaseline } from './rapport-playwright.mjs';
import { fichiersDuMorceau, filtreDe } from './morceau-playwright.mjs';
import {
    lireEchangeMo, lirePression, lireCapacites, lireAlimentation, lireAssertionsSysteme,
    lireAssertionsDuProcessus, jugerEveil, jugerLancementMemoire, memoireAuPlusHaut,
    lireVeillesDuJournal, formaterMo
} from './garde-eveil.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..');
const DOSSIER_TESTS = path.join(RACINE, 'tests');
const BASELINE = path.join(__dirname, 'playwright-baseline.json');
// Même couture que lire-verdict.mjs : un banc n'écrit jamais dans le jeton RÉEL.
const VERDICT = process.env.VERDICT_PLAYWRIGHT || path.join(__dirname, '.verdict-playwright.json');
// Même seuil que verifier-playwright.mjs (#1008) : au-delà, on ne lance pas un morceau.
const ECHANGE_LANCEMENT_MO = Number(process.env.LABO_ECHANGE_LANCEMENT_MO || 10 * 1024);

export const CODES = { VERT: 0, ROUGE: 1, NON_JUGE: 2, REPORT_REFUSE: 3 };

// ── Fonctions pures ───────────────────────────────────────────────────────────

/** Les specs de chaque morceau, en alternance (la répartition de la CI). */
export function planDesMorceaux(specs, total) {
    return Array.from({ length: total }, (_, i) => fichiersDuMorceau(specs, i + 1, total));
}

/** Les fichiers de spec présents dans un rapport JSON (chemins relatifs à integration/). */
export function fichiersDuRapport(rapport) {
    const vus = new Set();
    const descendre = (suites) => {
        for (const suite of suites ?? []) {
            for (const spec of suite.specs ?? []) vus.add((spec.file ?? suite.file ?? '').replace(/\\/g, '/'));
            descendre(suite.suites);
        }
    };
    descendre(rapport.suites);
    return vus;
}

/**
 * Juge un rapport FUSIONNÉ. Une spec prévue absente du rapport n'a pas été
 * jouée : NON JUGÉ — jamais « verte ». (Le 26 oct., 14 des 18 « redevenues
 * vertes » d'un jugement à la main sur 12 rapports sur 16 n'avaient pas tourné.)
 */
export function jugerRapportFusionne(rapport, echecsConnus, fichiersPrevus = []) {
    const erreurs = rapport.errors ?? [];
    if (erreurs.length > 0) {
        return { code: CODES.NON_JUGE, raison: `${erreurs.length} erreur(s) hors essai : ${(erreurs[0].message ?? String(erreurs[0])).split('\n')[0]}` };
    }
    const stats = rapport.stats ?? {};
    const joues = (stats.expected ?? 0) + (stats.unexpected ?? 0) + (stats.flaky ?? 0);
    if (joues === 0) return { code: CODES.NON_JUGE, raison: 'le rapport ne contient aucun essai joué' };
    const presents = fichiersDuRapport(rapport);
    const absents = fichiersPrevus.filter((f) => !presents.has(f));
    if (absents.length > 0) return { code: CODES.NON_JUGE, raison: `${absents.length} spec(s) prévue(s) absente(s) du rapport : ${absents.join(', ')}` };
    const echecs = echecsDuRapport(rapport);
    const instables = flakyDuRapport(rapport);
    const { nouveaux, reparees } = comparerALaBaseline(echecs, echecsConnus);
    return {
        code: nouveaux.length > 0 ? CODES.ROUGE : CODES.VERT,
        echecs, instables, nouveaux, reparees,
        stats: { joues, verts: stats.expected ?? 0, instables: stats.flaky ?? 0, rouges: stats.unexpected ?? 0, sautes: stats.skipped ?? 0 }
    };
}

/** La liste OBSERVABLE du workflow (une seule source, lue aussi par lot-observable.sh). */
export function listeObservable(workflow) {
    const m = /^\s*OBSERVABLE:\s*"([^"]+)"/m.exec(workflow);
    if (!m) throw new Error('liste OBSERVABLE introuvable dans tests.yml');
    return m[1].trim().split(/\s+/);
}

/** Les chemins modifiés hors commit qui fausseraient le verdict (ce qui est jugé ≠ ce qui part). */
export function fichiersQuiFaussent(sales, observable) {
    return sales.filter((f) => observable.some((e) => (e.endsWith('/') ? f.startsWith(e) : f === e)));
}

/**
 * Les chemins de `git status --porcelain -z` : « XY chemin », et pour un
 * renommage ou une copie, l'ancien chemin suit en entrée nue. -z garde entiers
 * les chemins accentués ou à espaces (« plans de travail/ »).
 */
export function cheminsDuStatut(sortie) {
    const entrees = sortie.split('\0');
    const chemins = [];
    for (let i = 0; i < entrees.length; i++) {
        const e = entrees[i];
        if (e.length < 4) continue;
        chemins.push(e.slice(3));
        if (/[RC]/.test(e.slice(0, 2))) chemins.push(entrees[++i]);
    }
    return chemins.filter(Boolean);
}

const SPEC = /^tests\/integration\/[^/]+\.spec\.js$/;
/** Condition 1 du report : ce que le diff a le droit de toucher. */
export function cheminReportable(f) {
    return f.startsWith('plans de travail/') || SPEC.test(f) || f.startsWith('tests/unit/');
}

/**
 * Conditions 1 et 2 du report, avant de rejouer quoi que ce soit.
 * `existantes` : les specs touchées qui existent encore à HEAD (une spec
 * supprimée n'a rien à rejouer).
 */
export function conditionsDuReport({ jeton, tete, estAncetre, fichiersDuDiff, existe }) {
    if (!jeton) return { ok: false, raison: 'aucun jeton de verdict en place' };
    if (Number(jeton.code) !== 0) return { ok: false, raison: `le jeton en place n'est pas vert (code ${jeton.code})` };
    if (!jeton.sha) return { ok: false, raison: 'le jeton en place ne porte aucun SHA' };
    if (jeton.sha === tete) return { ok: true, dejaAJour: true, aRejouer: [] };
    if (!estAncetre) return { ok: false, raison: `${jeton.sha.slice(0, 8)} n'est pas un ancêtre de HEAD` };
    const interdits = fichiersDuDiff.filter((f) => !cheminReportable(f));
    if (interdits.length > 0) return { ok: false, raison: `le diff touche hors des tests et des plans : ${interdits.join(', ')}` };
    const aRejouer = fichiersDuDiff.filter((f) => SPEC.test(f) && existe(f)).map((f) => path.posix.basename(f)).sort();
    return { ok: true, dejaAJour: false, aRejouer };
}

/** Le jeton, au format de verifier-playwright.mjs (deposerVerdict), que lire-verdict.mjs lit. */
export function jetonDeVerdict({ sha, code, echecs = [], instables = [], garde = null, rendule = new Date().toISOString() }) {
    return {
        _lisezMoi: 'Verdict local de la sentinelle Playwright, lu par le hook pré-push. Non versionné. Régénérer : node scripts/verdict-en-morceaux.mjs (en morceaux), scripts/pousser.sh, ou node scripts/verifier-playwright.mjs',
        sha, code,
        echecsConnus: typeof echecs === 'number' ? echecs : echecs.length,
        instables, garde, rendule
    };
}

// ── Les deux gestes, effets injectés (les bancs passent des doublures) ────────

/**
 * Joue les morceaux l'un après l'autre, fusionne, juge, écrit le jeton.
 * `effets` : sha, fichiersSales, observable, specs, tenirEveil, releverMemoire,
 * jouerMorceau, blobs, fusionner, baseline, veilles, ecrireJeton, dire, maintenant.
 */
export async function executerVerdict(effets, { total = 10 } = {}) {
    const dire = effets.dire;
    const debutMs = effets.maintenant();
    const sha = effets.sha();
    const garde = { verdict: `en ${total} morceaux (scripts/verdict-en-morceaux.mjs)`, eveilCompletTenu: null, alimentation: null, releves: [], veilles: [], nombreVeilles: 0, dureeVeillesS: 0, memoire: null, nonJuge: null, raison: '' };
    const finir = (code, juge = {}) => {
        effets.ecrireJeton(jetonDeVerdict({ sha, code, echecs: juge.echecs ?? [], instables: juge.instables ?? [], garde }));
        return { code, garde, ...juge };
    };
    const nonJuge = (quoi, raison) => { garde.nonJuge = quoi; garde.raison = raison; dire(`✗ NON JUGÉ (${quoi}) : ${raison}.`); return finir(CODES.NON_JUGE); };

    const faussent = fichiersQuiFaussent(effets.fichiersSales(), effets.observable());
    if (faussent.length > 0) return nonJuge('copie de travail', `modifié hors commit, la suite jugerait autre chose que ${sha.slice(0, 8)} : ${faussent.join(', ')}`);

    const eveil = effets.tenirEveil();
    if (eveil) {
        garde.alimentation = eveil.alimentation ?? null;
        if (!eveil.ok) return nonJuge('éveil', eveil.raison);
        garde.eveilCompletTenu = true;
    }

    const plan = planDesMorceaux(effets.specs(), total);
    if (plan.some((m) => m.length === 0)) return nonJuge('découpage', `un des ${total} morceaux ne reçoit aucune spec`);

    for (let k = 1; k <= total; k++) {
        const releve = effets.releverMemoire();
        if (releve) {
            garde.releves.push(releve);
            const lancement = jugerLancementMemoire(releve, ECHANGE_LANCEMENT_MO);
            if (!lancement.ok) return nonJuge('mémoire', `avant le morceau ${k}/${total} : ${lancement.raison}`);
        }
        dire(`→ Morceau ${k}/${total} : ${plan[k - 1].length} specs${releve ? ` (échange ${formaterMo(releve.echangeMo)}, pression ${releve.pression ?? '?'})` : ''}.`);
        await effets.jouerMorceau(k, total, plan[k - 1].map(filtreDe));
        if (effets.sha() !== sha) return nonJuge('sommet', `HEAD a bougé pendant le morceau ${k} : le verdict ne couvrirait aucun commit`);
    }

    const recus = effets.blobs().length;
    if (recus !== total) return nonJuge('rapports', `${recus} rapport(s) sur ${total} — des essais n'ont pas été joués`);

    garde.veilles = effets.veilles(debutMs, effets.maintenant());
    garde.nombreVeilles = garde.veilles.length;
    garde.dureeVeillesS = garde.veilles.reduce((s, v) => s + v.dureeS, 0);
    if (garde.releves.length > 0) garde.memoire = memoireAuPlusHaut(garde.releves);

    let rapport;
    try {
        rapport = effets.fusionner();
    } catch (erreur) {
        return nonJuge('fusion', erreur.message);
    }
    const juge = jugerRapportFusionne(rapport, effets.baseline(), plan.flat());
    if (juge.code === CODES.NON_JUGE) return nonJuge('rapport', juge.raison);

    const s = juge.stats;
    garde.raison = `${s.joues} essais en ${total} morceaux : ${s.verts} verts, ${s.instables} au second essai, ${s.rouges} rouges (${juge.echecs.length - juge.nouveaux.length} connus), ${s.sautes} sautés`;
    if (juge.instables.length > 0) dire(`⚠ ${juge.instables.length} spec(s) verte(s) au second essai (ne bloque pas, #534) :\n${juge.instables.map((x) => `    · ${x}`).join('\n')}`);
    if (juge.reparees.length > 0) dire(`✓ ${juge.reparees.length} spec(s) de la baseline redevenues vertes — à retirer (node scripts/verifier-playwright.mjs --ecrire, ou à la main).`);
    if (juge.code === CODES.ROUGE) {
        if (garde.nombreVeilles > 0) dire(`⚠ VERDICT ROUGE RENDU APRÈS ${garde.nombreVeilles} VEILLE(S) (${garde.dureeVeillesS} s) — relancer, Mac éveillé, avant d'y croire.`);
        dire(`✗ ${juge.nouveaux.length} spec(s) NOUVELLEMENT rouge(s) — push bloqué :\n${juge.nouveaux.map((x) => `    · ${x}`).join('\n')}`);
    } else {
        dire(`✓ Verdict vert sur ${sha.slice(0, 8)} : ${garde.raison}.`);
    }
    return finir(juge.code, juge);
}

/**
 * Reporte le jeton vert sur HEAD, aux trois conditions (voir l'en-tête).
 * `effets` : sha, lireJeton, estAncetre, diff, existe, fichiersSales, observable,
 * rejouer, ecrireJeton, dire.
 */
export async function executerReport(effets) {
    const dire = effets.dire;
    const tete = effets.sha();
    const jeton = effets.lireJeton();
    const refuser = (raison) => { dire(`✗ Report refusé : ${raison}. La suite entière repasse (node scripts/verdict-en-morceaux.mjs).`); return { code: CODES.REPORT_REFUSE, raison }; };

    const faussent = fichiersQuiFaussent(effets.fichiersSales(), effets.observable());
    if (faussent.length > 0) return refuser(`modifié hors commit : ${faussent.join(', ')}`);

    const ancetre = jeton?.sha ? effets.estAncetre(jeton.sha, tete) : false;
    const fichiers = jeton?.sha && ancetre ? effets.diff(jeton.sha, tete) : [];
    const conditions = conditionsDuReport({ jeton, tete, estAncetre: ancetre, fichiersDuDiff: fichiers, existe: effets.existe });
    if (!conditions.ok) return refuser(conditions.raison);
    if (conditions.dejaAJour) { dire(`✓ Le jeton vert porte déjà HEAD (${tete.slice(0, 8)}) : rien à reporter.`); return { code: CODES.VERT, raison: 'déjà à jour' }; }

    let instables = [];
    if (conditions.aRejouer.length > 0) {
        dire(`→ ${conditions.aRejouer.length} spec(s) touchée(s), rejouée(s) en entier : ${conditions.aRejouer.join(', ')}.`);
        let rapport;
        try {
            rapport = await effets.rejouer(conditions.aRejouer.map(filtreDe));
        } catch (erreur) {
            return refuser(`rejeu impossible : ${erreur.message}`);
        }
        // Ici, aucune baseline : une spec qu'on vient de toucher doit être VERTE.
        const juge = jugerRapportFusionne(rapport, [], conditions.aRejouer);
        if (juge.code !== CODES.VERT) return refuser(juge.raison ?? `rouge au rejeu : ${juge.nouveaux.join(' ; ')}`);
        instables = juge.instables;
    }

    const raison = `REPORT du verdict vert de ${jeton.sha.slice(0, 8)} (${jeton.garde?.raison || 'verdict complet'}) : (1) le diff ne touche que ${fichiers.length} fichier(s) de tests et de plans ; (2) ${conditions.aRejouer.length} spec(s) touchée(s) rejouée(s) en entier, vertes${conditions.aRejouer.length ? ` : ${conditions.aRejouer.join(', ')}` : ''} ; (3) aucune autre spec touchée`;
    const garde = { ...(jeton.garde ?? {}), raison, report: { de: jeton.sha, verdictComplet: jeton.garde?.report?.verdictComplet ?? jeton.sha, fichiers, rejouees: conditions.aRejouer } };
    effets.ecrireJeton(jetonDeVerdict({ sha: tete, code: CODES.VERT, echecs: jeton.echecsConnus ?? 0, instables: [...new Set([...(jeton.instables ?? []), ...instables])].sort(), garde }));
    dire(`✓ ${raison}.`);
    return { code: CODES.VERT, raison };
}

// ── Les effets réels (Mac) ────────────────────────────────────────────────────

function git(...args) {
    const r = spawnSync('git', args, { cwd: RACINE, encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`git ${args.join(' ')} : ${r.stderr.trim()}`);
    return r.stdout;
}
const lire = (commande, args) => {
    const r = spawnSync(commande, args, { encoding: 'utf8' });
    return r.status === 0 ? r.stdout : '';
};
const surMac = process.platform === 'darwin';

function effetsCommuns() {
    return {
        sha: () => git('rev-parse', 'HEAD').trim(),
        fichiersSales: () => cheminsDuStatut(git('status', '--porcelain', '-z', '--untracked-files=all')),
        observable: () => listeObservable(readFileSync(path.join(RACINE, '.github', 'workflows', 'tests.yml'), 'utf8')),
        ecrireJeton: (jeton) => writeFileSync(VERDICT, `${JSON.stringify(jeton, null, 4)}\n`, 'utf8'),
        dire: (texte) => process.stderr.write(`${texte}\n`)
    };
}

/** Lance `playwright test` sur des filtres, dans son propre groupe (arrêtable en entier). */
function lancerPlaywright(filtres, env) {
    return new Promise((fin) => {
        const p = spawn('npx', ['playwright', 'test', ...filtres], { cwd: DOSSIER_TESTS, env: { ...process.env, ...env }, stdio: ['ignore', 'ignore', 'inherit'], detached: true });
        const arreter = () => { try { process.kill(-p.pid, 'SIGTERM'); } catch { /* déjà terminée */ } process.exit(130); };
        process.once('SIGINT', arreter);
        p.on('close', (code) => { process.off('SIGINT', arreter); fin(code); }).on('error', () => fin(-1));
    });
}

function tenirEveilMac() {
    if (!surMac) return null;
    spawnSync('caffeinate', ['-u', '-t', '2']);
    const caffeinate = spawn('caffeinate', ['-d', '-i', '-s', '-w', String(process.pid)], { stdio: 'ignore', detached: true });
    caffeinate.on('error', () => {});
    caffeinate.unref();
    spawnSync('sleep', ['2']);
    const assertions = lire('pmset', ['-g', 'assertions']);
    const alimentation = lireAlimentation(lire('pmset', ['-g', 'ps']));
    const eveil = jugerEveil({
        capacites: lireCapacites(lire('pmset', ['-g', 'systemstate'])),
        assertionsProcessus: lireAssertionsDuProcessus(assertions, caffeinate.pid),
        assertionsSysteme: lireAssertionsSysteme(assertions),
        alimentation
    });
    return { ...eveil, alimentation };
}

async function principal() {
    const args = process.argv.slice(2);
    const communs = effetsCommuns();
    if (args.includes('--reporter')) {
        const dossier = mkdtempSync(path.join(tmpdir(), 'pw-report-'));
        try {
            const { code } = await executerReport({
                ...communs,
                lireJeton: () => { try { return JSON.parse(readFileSync(VERDICT, 'utf8')); } catch { return null; } },
                estAncetre: (a, b) => spawnSync('git', ['merge-base', '--is-ancestor', a, b], { cwd: RACINE }).status === 0,
                diff: (a, b) => git('diff', '--name-only', '-z', a, b).split('\0').filter(Boolean),
                existe: (f) => existsSync(path.join(RACINE, f)),
                rejouer: async (filtres) => {
                    const fichier = path.join(dossier, 'rejeu.json');
                    await lancerPlaywright([...filtres, '--reporter=json'], { PLAYWRIGHT_JSON_OUTPUT_NAME: fichier });
                    if (!existsSync(fichier)) throw new Error('aucun rapport produit');
                    return JSON.parse(readFileSync(fichier, 'utf8'));
                }
            });
            process.exitCode = code;
        } finally {
            rmSync(dossier, { recursive: true, force: true });
        }
        return;
    }

    const i = args.indexOf('--morceaux');
    const total = i >= 0 ? Number(args[i + 1]) : 10;
    if (!Number.isInteger(total) || total < 1) { process.stderr.write(`--morceaux « ${args[i + 1]} » : un entier ≥ 1.\n`); process.exitCode = CODES.NON_JUGE; return; }
    const dossier = mkdtempSync(path.join(tmpdir(), 'pw-morceaux-'));
    const blobs = path.join(dossier, 'blobs');
    try {
        const { code } = await executerVerdict({
            ...communs,
            maintenant: () => Date.now(),
            specs: () => readdirSync(path.join(DOSSIER_TESTS, 'integration')).filter((f) => f.endsWith('.spec.js')),
            tenirEveil: tenirEveilMac,
            releverMemoire: () => (surMac ? {
                instant: new Date().toISOString(),
                echangeMo: lireEchangeMo(lire('sysctl', ['vm.swapusage'])),
                pression: lirePression(lire('sysctl', ['-n', 'kern.memorystatus_vm_pressure_level']))
            } : null),
            // Le rapport blob VIDE son dossier avant d'écrire (Playwright 1.60,
            // `_prepareOutputFile`) : chaque morceau écrit dans le sien, puis
            // son rapport rejoint ceux qu'on fusionnera.
            jouerMorceau: async (k, _total, filtres) => {
                const sien = path.join(dossier, `morceau-${k}`);
                const code = await lancerPlaywright([...filtres, '--reporter=blob'], { PLAYWRIGHT_BLOB_OUTPUT_DIR: sien, PLAYWRIGHT_BLOB_OUTPUT_NAME: `report-${k}.zip` });
                const zip = path.join(sien, `report-${k}.zip`);
                if (existsSync(zip)) { mkdirSync(blobs, { recursive: true }); copyFileSync(zip, path.join(blobs, `report-${k}.zip`)); }
                return code;
            },
            blobs: () => (existsSync(blobs) ? readdirSync(blobs).filter((f) => f.endsWith('.zip')) : []),
            fusionner: () => {
                const fichier = path.join(dossier, 'rapport.json');
                const r = spawnSync('npx', ['playwright', 'merge-reports', '--config', 'playwright.config.js', '--reporter=json', blobs], { cwd: DOSSIER_TESTS, encoding: 'utf8', env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: fichier } });
                if (!existsSync(fichier)) throw new Error(`merge-reports n'a rien produit (code ${r.status}) : ${(r.stderr || '').split('\n')[0]}`);
                return JSON.parse(readFileSync(fichier, 'utf8'));
            },
            baseline: () => JSON.parse(readFileSync(BASELINE, 'utf8')).echecsConnus,
            veilles: (debut, fin) => (surMac ? lireVeillesDuJournal(lire('pmset', ['-g', 'log']), debut, fin) : [])
        }, { total });
        process.exitCode = code;
    } finally {
        rmSync(dossier, { recursive: true, force: true });
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    await principal();
}
