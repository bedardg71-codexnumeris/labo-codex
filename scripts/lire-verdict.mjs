#!/usr/bin/env node
/**
 * Lecteur du jeton de verdict Playwright — le hook pré-push l'appelle à la
 * place de la suite elle-même.
 *
 * POURQUOI (#533, 26 août 2026). `git push` ouvre la connexion vers le serveur
 * AVANT d'exécuter le hook. Tant que le hook lançait WebKit lui-même, la session
 * restait muette six minutes et GitHub la fermait : le verdict tombait juste
 * après, juste et inutile, et le push échouait sans que rien ne soit cassé.
 * La suite tourne maintenant en amont (scripts/pousser.sh) et dépose son verdict ;
 * il ne reste ici qu'une lecture, instantanée.
 *
 * Le SHA attendu est ce qui empêche le jeton de mentir. Un verdict rendu sur un
 * commit ne couvre pas le suivant : recommiter le périme, et le hook redemande
 * la garde.
 *
 * USAGE
 *   node scripts/lire-verdict.mjs <sha-poussé>
 *
 * Code de sortie :
 *   0 = verdict vert et à jour · 1 = rougeur nouvelle déjà constatée
 *   2 = verdict impossible ici (WebKit absent) · 3 = aucun verdict à jour
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Le chemin est surchargeable pour les bancs d'essai : sans cette couture, un
// test devrait écrire dans le jeton RÉEL de la machine et le corrompre.
const VERDICT = process.env.VERDICT_PLAYWRIGHT || path.join(__dirname, '.verdict-playwright.json');

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

// Un jeton sans SHA ne peut être rattaché à rien — donc à aucun push.
if (!jeton.sha || (shaAttendu && jeton.sha !== shaAttendu)) process.exit(3);

const code = Number(jeton.code);
// #1008 — un code 2 de la garde n'est pas « WebKit absent » : le dire, sans
// quoi le message du hook ment sur la raison.
if (code === 2 && jeton.garde?.nonJuge) {
    process.stderr.write(`⚠ Verdict non jugé (${jeton.garde.nonJuge}) : ${jeton.garde.raison}\n`);
}
process.exit(code === 0 || code === 1 || code === 2 ? code : 3);
