#!/usr/bin/env node
/**
 * scripts/restaurer-isoler-cartouches-A25.mjs
 *
 * §8.4 — PLAN-restauration-longitudinale-A25.md (« recréation propre »).
 * Couche ESSENTIELLE : restaure les cartouches A25 RÉELLES depuis le backup
 * du 4 février 2026 et ISOLE la grille FR-ALGO partagée avec H26.
 *
 * STRATÉGIE (tranchée par l'audit du code, 23 juin) :
 *   - Les cartouches sont lues EN DIRECT par `db.getSync(`cartouches_${grilleId}`)`
 *     (jamais via cle()) → l'isolation par ID DISTINCT de grille est la bonne
 *     (le mécanisme d'archivage <tri>_cartouches_* est dormant). Cf. plan §8.7.
 *   - SOURCE des cartouches = backup 4 février (dump localStorage, valeurs
 *     double-encodées) : descripteurs/niveaux/commentaires réels, critereId
 *     IDENTIQUES aux évals actuelles. La pondération A25 (Fr30) n'est PAS prise
 *     du backup (ses grilles portaient déjà Fr20 H26) — elle vit dans les évals.
 *   - Les NOTES d'artefact stockées ne sont jamais touchées → L0 reste vert.
 *
 * TRANSFORME (sur une COPIE, jamais l'original) :
 *   1. FR-ALGO (GRILLE1759529438501, PARTAGÉE 66 A25 + 89 H26) → nouvel id A25
 *      `GRILLE_A2025_FR_ALGO`. Cartouche CART1763652289229 (backup) écrite dans
 *      `cartouches_GRILLE_A2025_FR_ALGO`. Les 66 évals A25 re-pointées. H26
 *      conserve `cartouches_GRILLE1759529438501` (2 cartouches H26) intact.
 *   2. GLOBAL-4 (GRILLE1759264206489, NON partagée, clé cartouches VIDE) :
 *      restaure ses 4 cartouches (backup) sous le même id. Pas de re-pointage.
 *   3. FR-HOLIS (GRILLE1759243306842) : cartouches déjà intactes → inchangée.
 *
 * SÉCURITÉ DES DONNÉES : lit codex + backup, écrit un NOUVEAU fichier. L'original
 * n'est jamais modifié. Aucun chemin personnel codé en dur (arguments).
 *
 * Usage :
 *   node scripts/restaurer-isoler-cartouches-A25.mjs \
 *     --codex "<donnees.json actuel>" \
 *     --backup "<sauvegarde-monitorage-2026-02-04-…json>" \
 *     --sortie "<chemin copie de sortie>" [--ecrire] [--verbeux]
 *
 *   (sans --ecrire : DRY-RUN, rapport seulement, aucune écriture.)
 *
 * Codes de sortie : 0 = succès · 2 = erreur (source manquante/incohérente).
 */

import { readFileSync, writeFileSync } from 'node:fs';

// ── Config A25 ───────────────────────────────────────────────────────────────
const TRIMESTRE = 'a2025';
const GRILLES = [
    {
        role: 'FR-ALGO', ancienId: 'GRILLE1759529438501', nouvelId: 'GRILLE_A2025_FR_ALGO',
        partagee: true, libelle: 'Grille-5 FR-ALGO A25',
        cartouches: ['CART1763652289229']
    },
    {
        role: 'GLOBAL-4', ancienId: 'GRILLE1759264206489', nouvelId: 'GRILLE1759264206489',
        partagee: false, libelle: 'Grille-4 A25',
        cartouches: ['GAB1759269075967', 'GAB1759620598310', 'CART1765107186166', 'CART1765292766944']
    },
    {
        role: 'FR-HOLIS', ancienId: 'GRILLE1759243306842', nouvelId: 'GRILLE1759243306842',
        partagee: false, libelle: 'Grille-5 FR-HOLIS A25',
        cartouches: [] // déjà intactes dans le codex courant
    }
];

// ── Arguments ────────────────────────────────────────────────────────────────
function lireArgs(argv) {
    const a = { ecrire: false, verbeux: false };
    for (let i = 2; i < argv.length; i++) {
        const t = argv[i];
        if (t === '--codex') a.codex = argv[++i];
        else if (t === '--backup') a.backup = argv[++i];
        else if (t === '--sortie') a.sortie = argv[++i];
        else if (t === '--ecrire') a.ecrire = true;
        else if (t === '--verbeux') a.verbeux = true;
        else { console.error('Argument inconnu : ' + t); process.exit(2); }
    }
    if (!a.codex || !a.backup) {
        console.error('Usage : --codex <donnees.json> --backup <sauvegarde…json> [--sortie <out.json>] [--ecrire] [--verbeux]');
        process.exit(2);
    }
    if (a.ecrire && !a.sortie) { console.error('--ecrire exige --sortie <chemin>'); process.exit(2); }
    return a;
}

// Le backup est un dump localStorage : chaque valeur est une chaîne JSON
// (parfois double-encodée). Parse défensif.
function parseLS(v) {
    let x = v;
    for (let i = 0; i < 2 && typeof x === 'string'; i++) {
        try { x = JSON.parse(x); } catch { break; }
    }
    return x;
}

// ── Transformation ───────────────────────────────────────────────────────────
function transformer(codex, backup, log) {
    const rapport = { cartouchesEcrites: [], evalsRepointees: 0, orphelinsRestants: [], deviantes: [] };
    const evals = codex[TRIMESTRE + '_evaluationsSauvegardees'] || [];

    for (const g of GRILLES) {
        if (g.cartouches.length) {
            // Source = backup, clé cartouches_<ancienId>
            const sourceCart = parseLS(backup['cartouches_' + g.ancienId]) || [];
            const restaurees = [];
            for (const cid of g.cartouches) {
                const c = sourceCart.find(x => (x.id || x.cartoucheId) === cid);
                if (!c) { log(`  ⚠ cartouche ${cid} introuvable dans le backup (cartouches_${g.ancienId})`); continue; }
                const copie = JSON.parse(JSON.stringify(c));
                copie.grilleId = g.nouvelId;                       // ancrage vers la grille A25
                if (g.libelle) copie.contexteRestauration = 'A25 §8.4'; // trace douce
                restaurees.push(copie);
            }
            codex['cartouches_' + g.nouvelId] = restaurees;
            rapport.cartouchesEcrites.push({ cle: 'cartouches_' + g.nouvelId, n: restaurees.length, role: g.role });
            log(`  ${g.role} : ${restaurees.length} cartouche(s) → cartouches_${g.nouvelId}`);
        }

        if (g.partagee) {
            // Re-pointer les évals A25 de l'ancienne grille vers la nouvelle.
            let n = 0;
            for (const e of evals) {
                if (e.grilleId === g.ancienId) {
                    e.grilleId = g.nouvelId;
                    if (e.grilleNom && /H26|H2026/i.test(e.grilleNom)) e.grilleNom = g.libelle;
                    n++;
                }
            }
            rapport.evalsRepointees += n;
            log(`  ${g.role} : ${n} éval(s) A25 re-pointée(s) ${g.ancienId} → ${g.nouvelId}`);
        }
    }

    // Diagnostic : pondérations déviantes (non modifiées) + orphelins restants.
    const PROFILS_A25 = new Set(['15·20·10·25·30', '20·30·15·35']);
    for (const e of evals) {
        const sig = (e.criteres || []).map(c => c.ponderation).join('·');
        if (sig && !PROFILS_A25.has(sig)) rapport.deviantes.push({ prod: e.productionId, grille: e.grilleId, profil: sig });
    }
    // orphelins : cartoucheId d'éval introuvable dans cartouches_<grilleId>
    for (const e of evals) {
        if (!e.cartoucheId) continue;
        const arr = codex['cartouches_' + e.grilleId];
        const ok = Array.isArray(arr) && arr.some(c => (c.id || c.cartoucheId) === e.cartoucheId);
        if (!ok) rapport.orphelinsRestants.push({ grille: e.grilleId, cart: e.cartoucheId });
    }
    rapport.orphelinsRestants = [...new Map(rapport.orphelinsRestants.map(o => [o.grille + o.cart, o])).values()];
    return rapport;
}

// ── main ─────────────────────────────────────────────────────────────────────
function main() {
    const args = lireArgs(process.argv);
    let codex, backup;
    try {
        codex = JSON.parse(readFileSync(args.codex, 'utf8'));
        backup = JSON.parse(readFileSync(args.backup, 'utf8'));
    } catch (e) { console.error('Lecture impossible : ' + e.message); process.exit(2); }

    console.log('\nRESTAURATION/ISOLATION A25 — ' + (args.ecrire ? 'ÉCRITURE' : 'DRY-RUN (aucune écriture)'));
    console.log('Source cartouches : backup ' + args.backup.split('/').pop());
    console.log('');

    const log = (m) => console.log(m);
    const r = transformer(codex, backup, log);

    console.log('');
    console.log('── Diagnostic ──');
    console.log('Cartouches écrites : ' + r.cartouchesEcrites.reduce((s, x) => s + x.n, 0) +
        ' (' + r.cartouchesEcrites.map(x => x.role + ':' + x.n).join(', ') + ')');
    console.log('Évals A25 re-pointées : ' + r.evalsRepointees);
    console.log('Cartouches orphelines RESTANTES : ' + r.orphelinsRestants.length +
        (r.orphelinsRestants.length ? ' → ' + r.orphelinsRestants.map(o => o.cart + '@' + o.grille).join(', ') : ' ✅'));
    console.log('Évals à pondération déviante (NON modifiées, diagnostic) : ' + r.deviantes.length);
    if (args.verbeux) for (const d of r.deviantes) console.log('    · prod ' + d.prod + ' grille ' + d.grille + ' profil ' + d.profil);

    if (args.ecrire) {
        writeFileSync(args.sortie, JSON.stringify(codex));
        console.log('\n✅ Copie transformée écrite : ' + args.sortie);
        console.log('   (l\'original n\'a PAS été modifié)');
    } else {
        console.log('\n(DRY-RUN — relancer avec --ecrire --sortie <chemin> pour produire la copie)');
    }
    process.exit(0);
}

main();
