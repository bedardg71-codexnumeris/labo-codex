#!/usr/bin/env node
/**
 * Le verdict du nuage, depuis le terminal : le lancer, l'attendre, le lire.
 *
 * POURQUOI CE SCRIPT EXISTE (14 nov. 2026, décision de Grégoire)
 * -------------------------------------------------------------
 * GitHub juge le verdict complet (.github/workflows/tests.yml, point 12 de son
 * journal) ; le crochet pré-push, lui, ne lit qu'un jeton local, sans réseau
 * (scripts/lire-verdict.mjs — `git push` a déjà ouvert la connexion, #533). Ce
 * script fait le pont : il demande à GitHub ce que le job « Playwright — verdict »
 * a conclu POUR CE COMMIT et l'écrit dans SA part du jeton (`nuage`).
 *
 * USAGE
 * -----
 *   node scripts/verdict-nuage.mjs              # lit le verdict du commit courant, écrit sa part du jeton
 *   node scripts/verdict-nuage.mjs --lancer     # lance le verdict sur la branche courante (déjà poussée)
 *   node scripts/verdict-nuage.mjs --attendre   # relit chaque minute jusqu'à la conclusion (une heure au plus)
 * Du téléphone, sans ce script : application GitHub ▸ le dépôt ▸ Actions ▸ Tests ▸
 * Run workflow ▸ choisir la branche ▸ Run workflow.
 *
 * LE REPORT. Un commit qui ne touche RIEN d'observable au navigateur (un rapport
 * dans `plans de travail/`, le relais) ne change pas ce que le nuage a jugé : le
 * verdict du plus proche ancêtre vaut pour lui, tant qu'aucun fichier OBSERVABLE
 * (la liste de tests.yml, celle du crochet) n'a bougé entre les deux. Le jeton
 * dit alors sur quel commit le verdict a été rendu (`jugeSur`).
 *
 * Code de sortie : 0 = vert pour ce commit · 1 = rouge · 2 = impossible ici
 * (`gh` absent ou sans réseau) · 3 = aucun verdict conclu pour ce commit.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listeObservable, fichiersQuiFaussent } from './verdict-en-morceaux.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..');
// Même couture que lire-verdict.mjs : un banc n'écrit jamais dans le jeton RÉEL.
const VERDICT = process.env.VERDICT_PLAYWRIGHT || path.join(__dirname, '.verdict-playwright.json');

export const CODES = { VERT: 0, ROUGE: 1, IMPOSSIBLE: 2, AUCUN: 3 };
export const JOB_VERDICT = 'Playwright — verdict';
/**
 * Un run lancé avec le champ `branche` joue une AUTRE référence que son propre
 * commit : il ne dit rien du commit qui le porte. Le workflow le marque dans son
 * nom (`run-name`), et ce lecteur l'écarte.
 */
export const MARQUE_AUTRE_REFERENCE = 'autre référence';

// ── Fonctions pures ───────────────────────────────────────────────────────────

/**
 * Ce que les runs d'un commit disent de lui. `runs` : du plus récent au plus
 * ancien, chacun `{ id, titre, statut, url, jobVerdict: { conclusion, statut } | null }`.
 * Le plus récent verdict CONCLU l'emporte ; un run en cours ne périme pas un
 * verdict déjà rendu sur le même commit, mais il se dit.
 */
export function lireLesRuns(runs) {
    const propres = runs.filter((r) => !(r.titre ?? '').includes(MARQUE_AUTRE_REFERENCE));
    let enCours = null;
    for (const r of propres) {
        const c = r.jobVerdict?.conclusion;
        if (c === 'success') return { code: CODES.VERT, run: r.id, url: r.url, enCours };
        if (c === 'failure') return { code: CODES.ROUGE, run: r.id, url: r.url, enCours };
        if (!enCours && (r.statut === 'in_progress' || r.statut === 'queued' || r.statut === 'pending' || r.statut === 'waiting')) enCours = { run: r.id, url: r.url };
    }
    return { code: CODES.AUCUN, run: null, url: null, enCours };
}

/**
 * Les commits dont le verdict vaut pour `tete` : elle-même, puis ses ancêtres tant
 * qu'AUCUN fichier observable n'a bougé entre l'ancêtre et elle. `ancetres` : du
 * plus proche au plus lointain ; `fichiersDepuis(c)` : ce qui a changé de `c` à `tete`.
 */
export function commitsQuiValent(tete, ancetres, fichiersDepuis, observable) {
    const valent = [tete];
    for (const c of ancetres) {
        if (fichiersQuiFaussent(fichiersDepuis(c), observable).length > 0) break;
        valent.push(c);
    }
    return valent;
}

/** La part `nuage` du jeton. Les autres parts (verdict complet, `complement`) ne bougent pas. */
export function jetonAvecNuage(jeton, { sha, lecture, luLe = new Date().toISOString() }) {
    const nuage = { sha, code: lecture.code, run: lecture.run, url: lecture.url, luLe };
    if (lecture.jugeSur && lecture.jugeSur !== sha) nuage.jugeSur = lecture.jugeSur;
    return { ...(jeton && typeof jeton === 'object' ? jeton : {}), nuage };
}

// ── Exécution ─────────────────────────────────────────────────────────────────

const dire = (t = '') => process.stderr.write(`${t}\n`);
const git = (...args) => { const r = spawnSync('git', ['-C', RACINE, ...args], { encoding: 'utf8' }); return r.status === 0 ? r.stdout.trim() : ''; };
const gh = (...args) => spawnSync('gh', args, { cwd: RACINE, encoding: 'utf8' });

function runsDuCommit(sha) {
    const liste = gh('run', 'list', '--workflow', 'tests.yml', '--commit', sha, '--limit', '20', '--json', 'databaseId,displayTitle,status,url,event');
    if (liste.error || liste.status !== 0) return null;
    return JSON.parse(liste.stdout)
        .filter((r) => r.event === 'workflow_dispatch' || r.event === 'push')
        .map((r) => {
            const vue = gh('run', 'view', String(r.databaseId), '--json', 'jobs');
            const job = vue.status === 0 ? (JSON.parse(vue.stdout).jobs ?? []).find((j) => j.name === JOB_VERDICT) : null;
            return { id: r.databaseId, titre: r.displayTitle, statut: r.status, url: r.url, jobVerdict: job ? { conclusion: job.conclusion, statut: job.status } : null };
        });
}

function lancer(sha) {
    const branche = git('rev-parse', '--abbrev-ref', 'HEAD');
    const distant = git('rev-parse', '--verify', '--quiet', `origin/${branche}`);
    if (distant !== sha) {
        dire(`✗ ${branche} n'est pas poussée telle quelle (origin : ${distant ? distant.slice(0, 9) : 'absente'}, ici : ${sha.slice(0, 9)}). Pousse la branche, puis relance : GitHub juge ce qu'il a reçu.`);
        return CODES.AUCUN;
    }
    const r = gh('workflow', 'run', 'tests.yml', '--ref', branche);
    if (r.error || r.status !== 0) { dire(`✗ Lancement impossible : ${(r.stderr || r.error?.message || '').trim()}`); return CODES.IMPOSSIBLE; }
    dire(`→ Verdict du nuage lancé sur ${branche} (${sha.slice(0, 9)}) : 20 morceaux, une demi-heure environ.`);
    dire('  Pour le suivre : application GitHub ▸ Actions ▸ Tests ; ou node scripts/verdict-nuage.mjs --attendre');
    return CODES.AUCUN;
}

function lire(sha) {
    const observable = listeObservable(readFileSync(path.join(RACINE, '.github', 'workflows', 'tests.yml'), 'utf8'));
    const ancetres = git('rev-list', '--first-parent', '-n', '15', `${sha}~1`).split('\n').filter(Boolean);
    const valent = commitsQuiValent(sha, ancetres, (c) => git('diff', '--name-only', c, sha).split('\n').filter(Boolean), observable);
    let enCours = null;
    for (const c of valent) {
        const runs = runsDuCommit(c);
        if (runs === null) { dire('⚠ Verdict du nuage illisible ici (`gh` absent, non connecté, ou sans réseau).'); return { code: CODES.IMPOSSIBLE }; }
        const lecture = lireLesRuns(runs);
        if (lecture.code !== CODES.AUCUN) return { ...lecture, jugeSur: c };
        enCours = enCours ?? lecture.enCours;
    }
    return { code: CODES.AUCUN, run: null, url: null, enCours };
}

async function principal() {
    const sha = git('rev-parse', 'HEAD');
    if (process.argv.includes('--lancer')) return lancer(sha);

    let lecture = lire(sha);
    if (process.argv.includes('--attendre')) {
        const limite = Date.now() + 60 * 60 * 1000;
        while (lecture.code === CODES.AUCUN && lecture.enCours && Date.now() < limite) {
            dire(`  … run ${lecture.enCours.run} en cours (${new Date().toLocaleTimeString('fr-CA')}).`);
            await new Promise((r) => setTimeout(r, 60000));
            lecture = lire(sha);
        }
    }
    if (lecture.code === CODES.IMPOSSIBLE) return CODES.IMPOSSIBLE;

    if (lecture.code === CODES.VERT || lecture.code === CODES.ROUGE) {
        let jeton = {};
        try { jeton = JSON.parse(readFileSync(VERDICT, 'utf8')); } catch { /* pas de jeton : on en ouvre un */ }
        writeFileSync(VERDICT, `${JSON.stringify(jetonAvecNuage(jeton, { sha, lecture }), null, 4)}\n`, 'utf8');
        const report = lecture.jugeSur !== sha ? ` — rendu sur ${lecture.jugeSur.slice(0, 9)}, rien d'observable n'a bougé depuis` : '';
        dire(`${lecture.code === CODES.VERT ? '✓ Verdict du nuage : VERT' : '✗ Verdict du nuage : ROUGE'} pour ${sha.slice(0, 9)} (run ${lecture.run})${report}.`);
        dire(`  ${lecture.url}`);
        return lecture.code;
    }
    dire(lecture.enCours
        ? `… Verdict du nuage en cours pour ${sha.slice(0, 9)} (run ${lecture.enCours.run}) : ${lecture.enCours.url}`
        : `⚠ Aucun verdict du nuage pour ${sha.slice(0, 9)}. Pour le lancer : node scripts/verdict-nuage.mjs --lancer (ou, du téléphone : Actions ▸ Tests ▸ Run workflow ▸ la branche).`);
    return CODES.AUCUN;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    process.exit(await principal());
}
