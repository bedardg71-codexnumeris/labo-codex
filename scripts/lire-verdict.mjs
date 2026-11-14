#!/usr/bin/env node
/**
 * Lecteur du jeton de verdict Playwright — le hook pré-push l'appelle à la
 * place de la suite elle-même.
 *
 * POURQUOI (#533, 26 août 2026). `git push` ouvre la connexion vers le serveur
 * AVANT d'exécuter le hook. Tant que le hook lançait WebKit lui-même, la session
 * restait muette six minutes et GitHub la fermait : le verdict tombait juste
 * après, juste et inutile, et le push échouait sans que rien ne soit cassé.
 * Le jugement se rend maintenant en amont et dépose son verdict ; il ne reste ici
 * qu'une lecture, instantanée, SANS RÉSEAU.
 *
 * LE JUGEMENT D'UN COMMIT (14 nov. 2026, décision de Grégoire) tient en deux
 * parts, chacune rattachée au SHA :
 *   · `nuage`      — le verdict complet, rendu par GitHub sur ses machines Linux,
 *                    relevé par scripts/verdict-nuage.mjs ;
 *   · `complement` — ce que Linux ne juge pas, rejoué sous le WebKit du Mac par
 *                    scripts/complement-mac.mjs.
 * Vert = les deux vertes pour CE commit. Le verdict complet du Mac (le haut du
 * jeton, écrit par scripts/verdict-en-morceaux.mjs ou verifier-playwright.mjs)
 * reste accepté à lui seul : il juge tout, il est seulement devenu facultatif.
 *
 * Le SHA attendu est ce qui empêche le jeton de mentir. Un verdict rendu sur un
 * commit ne couvre pas le suivant : recommiter le périme.
 *
 * USAGE
 *   node scripts/lire-verdict.mjs <sha-poussé>
 *
 * Code de sortie :
 *   0 = jugement vert et à jour · 1 = rougeur déjà constatée (une part suffit)
 *   2 = verdict impossible ici (WebKit absent) · 3 = jugement absent ou incomplet
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Le chemin est surchargeable pour les bancs d'essai : sans cette couture, un
// test devrait écrire dans le jeton RÉEL de la machine et le corrompre.
const VERDICT = process.env.VERDICT_PLAYWRIGHT || path.join(__dirname, '.verdict-playwright.json');

/**
 * Le code d'une part pour ce SHA : 0, 1 ou 2 ; `null` si elle est absente, d'un
 * autre commit, ou illisible. Une part sans SHA ne se rattache à rien.
 */
function codeDeLaPart(part, sha) {
    if (!part || !part.sha || (sha && part.sha !== sha)) return null;
    const code = Number(part.code);
    return code === 0 || code === 1 || code === 2 ? code : null;
}

/**
 * Le jugement, PUR. Rend `{ code, parts }` ; `parts` dit ce que chaque part vaut
 * pour ce SHA, pour que le hook nomme celle qui manque.
 */
export function jugerLeJeton(jeton, sha) {
    const parts = {
        complet: codeDeLaPart(jeton, sha),
        nuage: codeDeLaPart(jeton?.nuage, sha),
        complement: codeDeLaPart(jeton?.complement, sha)
    };
    // Une rougeur constatée l'emporte sur tout : aucune part verte ne la rachète.
    if (parts.complet === 1 || parts.nuage === 1 || parts.complement === 1) return { code: 1, parts };
    if (parts.complet === 0) return { code: 0, parts };
    if (parts.nuage === 0 && parts.complement === 0) return { code: 0, parts };
    // « Impossible ici » ne vaut que si rien d'autre n'a été jugé pour ce commit.
    if (parts.complet === 2 && parts.nuage === null && parts.complement === null) return { code: 2, parts };
    return { code: 3, parts };
}

const direLaPart = (code) => (code === 0 ? 'vert' : code === 1 ? 'ROUGE' : code === 2 ? 'non jugé' : 'absent pour ce commit');

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const shaAttendu = (process.argv[2] ?? '').trim();

    if (!existsSync(VERDICT)) process.exit(3);

    let jeton;
    try {
        jeton = JSON.parse(readFileSync(VERDICT, 'utf8'));
    } catch {
        // Jeton illisible : traité comme absent. Un verdict qu'on ne sait pas lire
        // ne doit jamais valoir « tout va bien ».
        process.exit(3);
    }

    const { code, parts } = jugerLeJeton(jeton, shaAttendu);
    // #1008 — un code 2 de la garde n'est pas « WebKit absent » : le dire, sans
    // quoi le message du hook ment sur la raison.
    if (code === 2 && jeton.garde?.nonJuge) {
        process.stderr.write(`⚠ Verdict non jugé (${jeton.garde.nonJuge}) : ${jeton.garde.raison}\n`);
    }
    // Le hook nomme ainsi la part qui manque ou qui rougit, pas seulement « aucun verdict ».
    if ((code === 1 || code === 3) && (parts.nuage !== null || parts.complement !== null)) {
        process.stderr.write(`  Verdict du nuage : ${direLaPart(parts.nuage)} · complément du Mac : ${direLaPart(parts.complement)}.\n`);
    }
    process.exit(code);
}
