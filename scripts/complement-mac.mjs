#!/usr/bin/env node
/**
 * Le complément du Mac : ce que Linux ne juge pas, rejoué sous le WebKit de macOS.
 *
 * POURQUOI CE SCRIPT EXISTE (14 nov. 2026, décision de Grégoire)
 * -------------------------------------------------------------
 * Le verdict complet se juge désormais dans le nuage (.github/workflows/tests.yml,
 * point 12 de son journal) : 20 machines, une demi-heure, le Mac libre. Mais le
 * WebKit de Linux n'est pas le Safari de macOS : une liste d'essais y rougit pour
 * des raisons qui tiennent à la plateforme (scripts/playwright-baseline-linux.json,
 * chaque entrée avec sa cause), et six autres en sont exclus
 * (tests/playwright.config.js, EXCLUS_WEBKIT_LINUX). Ces essais-là, et eux seuls,
 * se rejouent ici.
 *
 * Le jugement d'un commit = verdict du nuage vert pour ce SHA + ce complément vert
 * pour ce SHA (scripts/lire-verdict.mjs). Ce script écrit SA part du jeton
 * (`complement`) et ne touche pas aux autres.
 *
 * USAGE
 * -----
 *   node scripts/complement-mac.mjs             # se tait s'il est déjà vert pour ce commit
 *   node scripts/complement-mac.mjs --rejouer   # rejoue quand même
 * Il dit sa durée. Aucun morceau : la liste tient en quelques minutes.
 *
 * Code de sortie : 0 = vert · 1 = un essai de la liste est rouge au Mac ·
 * 2 = NON JUGÉ (un essai de la liste n'a pas été joué, arbre de travail faussé,
 * Playwright n'a rien rendu).
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { echecsDuRapport, flakyDuRapport, vertsDuRapport, comparerALaBaseline } from './rapport-playwright.mjs';
import { listeObservable, fichiersQuiFaussent, cheminsDuStatut } from './verdict-en-morceaux.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..');
const DOSSIER_TESTS = path.join(RACINE, 'tests');
const BASELINE_MAC = path.join(__dirname, 'playwright-baseline.json');
// Même couture que lire-verdict.mjs : un banc n'écrit jamais dans le jeton RÉEL.
const VERDICT = process.env.VERDICT_PLAYWRIGHT || path.join(__dirname, '.verdict-playwright.json');

export const CODES = { VERT: 0, ROUGE: 1, NON_JUGE: 2 };

// ── Fonctions pures ───────────────────────────────────────────────────────────

/**
 * Juge le rapport du complément. `liste` : les identités à rejouer ; `motifDe` :
 * le motif d'une identité (tests/playwright.config.js, motifDuComplement).
 *   · une entrée de la liste que le rapport n'a jouée ni verte ni rouge n'est pas
 *     jugée : NON JUGÉ, et elle est nommée — une liste périmée ne passe pas pour verte ;
 *   · un essai rouge ici, absent de la baseline du Mac, est ROUGE : Linux ne le
 *     jugeait pas, le Mac vient de le faire.
 */
export function jugerComplement({ rapport, liste, motifDe, baselineMac = {} }) {
    const echecs = echecsDuRapport(rapport);
    const verts = vertsDuRapport(rapport);
    const instables = flakyDuRapport(rapport);
    const joues = [...echecs, ...verts];
    const nonJoues = liste.filter((id) => { const motif = motifDe(id); return !joues.some((j) => motif.test(j)); });
    const { nouveaux } = comparerALaBaseline({ echecs, verts, instables }, baselineMac);
    const code = nouveaux.length > 0 ? CODES.ROUGE : nonJoues.length > 0 || joues.length === 0 ? CODES.NON_JUGE : CODES.VERT;
    return { code, essais: joues.length, verts: verts.length, rouges: nouveaux, instables, nonJoues };
}

/** La part `complement` du jeton. Les autres parts (verdict complet, `nuage`) ne bougent pas. */
export function jetonAvecComplement(jeton, { sha, jugement, dureeS, renduLe = new Date().toISOString() }) {
    return {
        ...(jeton && typeof jeton === 'object' ? jeton : {}),
        complement: {
            sha, code: jugement.code, essais: jugement.essais, verts: jugement.verts,
            rouges: jugement.rouges, instables: jugement.instables, nonJoues: jugement.nonJoues,
            dureeS, renduLe
        }
    };
}

/** « 4 min 12 s », pour dire la durée. */
export function direDuree(secondes) {
    const s = Math.round(secondes);
    return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
}

// ── Exécution ─────────────────────────────────────────────────────────────────

function lireJeton() {
    try { return JSON.parse(readFileSync(VERDICT, 'utf8')); } catch { return {}; }
}

async function principal() {
    const dire = (t = '') => process.stderr.write(`${t}\n`);
    const git = (...args) => { const r = spawnSync('git', ['-C', RACINE, ...args], { encoding: 'utf8' }); return r.status === 0 ? r.stdout : ''; };
    const sha = git('rev-parse', 'HEAD').trim();
    const { listeDuComplement, motifDuComplement } = await import(path.join(DOSSIER_TESTS, 'playwright.config.js'));
    const liste = listeDuComplement();
    const finir = (jugement, dureeS) => {
        writeFileSync(VERDICT, `${JSON.stringify(jetonAvecComplement(lireJeton(), { sha, jugement, dureeS }), null, 4)}\n`, 'utf8');
        return jugement.code;
    };

    const deja = lireJeton().complement;
    if (deja && deja.sha === sha && Number(deja.code) === CODES.VERT && !process.argv.includes('--rejouer')) {
        dire(`✓ Complément du Mac : déjà vert pour ${sha.slice(0, 9)} (${deja.essais} essais, ${direDuree(deja.dureeS)}, rendu le ${deja.renduLe}).`);
        return CODES.VERT;
    }

    // Un jeton rattaché à un SHA doit juger CE commit : un fichier observable modifié fausse le complément.
    const observable = listeObservable(readFileSync(path.join(RACINE, '.github', 'workflows', 'tests.yml'), 'utf8'));
    const faussent = fichiersQuiFaussent(cheminsDuStatut(git('status', '--porcelain', '-z', '--untracked-files=all')), observable);
    if (faussent.length > 0) {
        dire(`✗ Complément NON JUGÉ : ${faussent.length} fichier(s) observable(s) modifié(s) hors commit (${faussent.slice(0, 3).join(', ')}${faussent.length > 3 ? '…' : ''}). Commite, ou range-les.`);
        return CODES.NON_JUGE;
    }

    dire(`→ Complément du Mac : ${liste.length} essais que Linux ne juge pas, sous le WebKit de macOS (commit ${sha.slice(0, 9)}).`);
    const dossier = mkdtempSync(path.join(tmpdir(), 'complement-mac-'));
    const fichierRapport = path.join(dossier, 'rapport.json');
    const debut = Date.now();
    // `caffeinate -i` : le Mac ne s'endort pas au milieu (un essai endormi dépasse son délai).
    const commande = process.platform === 'darwin' ? ['caffeinate', '-i', 'npx'] : ['npx'];
    spawnSync(commande[0], [...commande.slice(1), 'playwright', 'test', '--reporter=list,json'], {
        cwd: DOSSIER_TESTS,
        stdio: 'inherit',
        env: { ...process.env, PW_COMPLEMENT_MAC: '1', PLAYWRIGHT_JSON_OUTPUT_NAME: fichierRapport }
    });
    const dureeS = Math.round((Date.now() - debut) / 1000);

    let rapport = null;
    try { rapport = JSON.parse(readFileSync(fichierRapport, 'utf8')); } catch { /* jugé plus bas */ }
    rmSync(dossier, { recursive: true, force: true });
    if (!rapport || (rapport.errors ?? []).length > 0) {
        dire(`✗ Complément NON JUGÉ : Playwright n'a pas rendu de rapport exploitable${rapport ? ` (${rapport.errors.length} erreur(s) hors essai)` : ''}.`);
        return finir({ code: CODES.NON_JUGE, essais: 0, verts: 0, rouges: [], instables: [], nonJoues: liste }, dureeS);
    }

    const baselineMac = existsSync(BASELINE_MAC) ? JSON.parse(readFileSync(BASELINE_MAC, 'utf8')) : {};
    const jugement = jugerComplement({ rapport, liste, motifDe: motifDuComplement, baselineMac });
    dire('');
    dire(`${jugement.code === CODES.VERT ? '✓' : '✗'} Complément du Mac : ${jugement.essais} essais joués, ${jugement.verts} verts, ${jugement.rouges.length} rouge(s), ${jugement.instables.length} au second essai, ${jugement.nonJoues.length} non joué(s). Durée : ${direDuree(dureeS)}.`);
    if (jugement.rouges.length > 0) { dire('Rouges au Mac (Linux ne les jugeait pas) :'); jugement.rouges.forEach((r) => dire(`  · ${r}`)); }
    if (jugement.instables.length > 0) { dire('Verts au second essai (ne bloque pas, #534) :'); jugement.instables.forEach((r) => dire(`  · ${r}`)); }
    if (jugement.nonJoues.length > 0) { dire('De la liste, NON JOUÉS (essai renommé ou retiré ? mettre scripts/playwright-baseline-linux.json d\'accord) :'); jugement.nonJoues.forEach((r) => dire(`  · ${r}`)); }
    return finir(jugement, dureeS);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    process.exit(await principal());
}
