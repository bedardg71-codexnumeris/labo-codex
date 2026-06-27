#!/usr/bin/env node
/**
 * scripts/reparer-references-productions.mjs
 *
 * BLOC 2 hygiène — Brique D namespacing (juin 2026). Répare deux dettes de
 * RÉFÉRENCE révélées par le dry-run d'observation sur le codex réel, SANS toucher
 * aux notes ni aux fichiers :
 *
 *   1. PRODUCTION.grilleId / .echelleId PÉRIMÉS — un champ de production pointe un
 *      ancien modèle (souvent GLOBAL partagé), alors que TOUTES les évaluations de
 *      cette production utilisent un id ISOLÉ par trimestre (famille « ancien id non
 *      migré » de #346/#358). On réaligne le champ production sur l'id UNANIME des
 *      évals. Conservateur : on ne remappe QUE si les évals existent ET s'accordent
 *      sur un seul id ≠ du champ production. Aucune éval / désaccord ⇒ on ne touche pas.
 *
 *   2. CARTOUCHE orpheline dans les évaluations — une évaluation référence une
 *      cartoucheId dont le gabarit a été supprimé (absent de toute collection
 *      cartouches_*). La rétroaction destinée à l'élève est stockée EN CLAIR sur
 *      l'évaluation (retroactionFinale + critères) ⇒ neutraliser la cartoucheId
 *      pendante (→ '') ne perd RIEN ; ça retire seulement un avertissement cosmétique
 *      à la réouverture. ACTIVÉ uniquement avec --cartouches (décision séparée).
 *
 * NON DESTRUCTIF par défaut : LECTURE SEULE, imprime le plan. --ecrire --sortie
 * produit une COPIE corrigée du codex (jamais d'écriture en place). Pour la donnée
 * LIVE, le même calcul est exposé en console dans l'app (geste sur backup).
 *
 * Usage :
 *   node scripts/reparer-references-productions.mjs --codex "<donnees.json>" [--cartouches] [--verbeux]
 *   node scripts/reparer-references-productions.mjs --codex "<in.json>" --ecrire --sortie "<out.json>" [--cartouches]
 *
 * Codes de sortie : 0 = plan produit (ou écriture faite) · 2 = erreur d'exécution.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

function lireArgs(argv) {
    const a = { cartouches: false, verbeux: false, ecrire: false };
    for (let i = 2; i < argv.length; i++) {
        const t = argv[i];
        if (t === '--codex') a.codex = argv[++i];
        else if (t === '--sortie') a.sortie = argv[++i];
        else if (t === '--cartouches') a.cartouches = true;
        else if (t === '--ecrire') a.ecrire = true;
        else if (t === '--verbeux') a.verbeux = true;
        else { console.error('Argument inconnu : ' + t); process.exit(2); }
    }
    if (!a.codex) { console.error('Usage : --codex <donnees.json> [--cartouches] [--ecrire --sortie <out.json>] [--verbeux]'); process.exit(2); }
    if (a.ecrire && !a.sortie) { console.error('--ecrire exige --sortie <out.json>'); process.exit(2); }
    return a;
}

function detecterTrimestres(codex) {
    const set = new Set();
    for (const k of Object.keys(codex)) {
        const m = k.match(/^([ah]\d{4})_(evaluationsSauvegardees|productions)$/);
        if (m) set.add(m[1]);
    }
    return [...set].sort();
}

// Id unanime d'un champ parmi un sous-ensemble d'évaluations, ou null si vide/divergent.
function unanime(evals, champ) {
    const vus = new Set();
    for (const e of evals) vus.add((e && e[champ]) || '');
    return vus.size === 1 ? [...vus][0] : null;
}

// CŒUR PUR (testable + réutilisé par la fonction console live). Calcule le plan de
// réparation sans rien muter. Rend { remaps, cartouches }.
//   remaps[]    = { trimestre, productionId, titre, champ, de, vers, nbEvals }
//   cartouches[]= { trimestre, cartoucheId, nbEvals }
export function calculerReparations(codex, trimestres, opts = {}) {
    const remaps = [];
    const cartouches = [];

    // 1) Catalogue des ids de cartouches existants (toutes collections cartouches_*).
    const cartouchesConnues = new Set();
    for (const k of Object.keys(codex)) {
        if (/(^|_)cartouches_/.test(k) && Array.isArray(codex[k])) {
            for (const c of codex[k]) if (c && c.id) cartouchesConnues.add(c.id);
        }
    }

    for (const t of trimestres) {
        const productions = codex[t + '_productions'] || [];
        const evals = codex[t + '_evaluationsSauvegardees'] || [];

        // 1) Remap des références de production périmées.
        for (const prod of productions) {
            if (!prod || !prod.id) continue;
            const liees = evals.filter(e => e && !e.remplaceeParId && e.productionId === prod.id && e.grilleId);
            if (!liees.length) continue; // aucune éval ⇒ rien à quoi s'aligner
            for (const champ of ['grilleId', 'echelleId']) {
                if (!(champ in prod)) continue; // le champ n'existe pas sur cette production
                const cible = unanime(liees, champ);
                if (cible === null) continue;            // évals divergentes ⇒ on ne tranche pas
                if ((prod[champ] || '') === cible) continue; // déjà aligné
                remaps.push({ trimestre: t, productionId: prod.id, titre: prod.titre || prod.nom || '', champ, de: prod[champ] || '', vers: cible, nbEvals: liees.length });
            }
        }

        // 2) Cartouches orphelines (gabarit supprimé) référencées par des évals.
        //    SIGNALÉES seulement — jamais réécrites : neutraliser une cartoucheId
        //    impose de réécrire l'évaluation, or ces évals sont en pratique VERROUILLÉES
        //    (notes archivées figées, invariant #350). nbVerrouillees le documente.
        if (opts.cartouches) {
            const parCartouche = {};
            for (const e of evals) {
                if (!e || e.remplaceeParId) continue;
                const cid = e.cartoucheId;
                if (cid && !cartouchesConnues.has(cid)) {
                    const r = parCartouche[cid] || (parCartouche[cid] = { nbEvals: 0, nbVerrouillees: 0 });
                    r.nbEvals++;
                    if (e.verrouillee === true) r.nbVerrouillees++;
                }
            }
            for (const [cid, r] of Object.entries(parCartouche)) {
                cartouches.push({ trimestre: t, cartoucheId: cid, nbEvals: r.nbEvals, nbVerrouillees: r.nbVerrouillees });
            }
        }
    }
    return { remaps, cartouches };
}

// Applique le plan sur une COPIE profonde du codex. Idempotent (un 2e passage ne
// trouve plus rien à changer). Rend le nouveau codex.
function appliquer(codex, plan) {
    const out = JSON.parse(JSON.stringify(codex));
    for (const r of plan.remaps) {
        const prod = (out[r.trimestre + '_productions'] || []).find(p => p && p.id === r.productionId);
        if (prod && (prod[r.champ] || '') === r.de) prod[r.champ] = r.vers;
    }
    // Cartouches orphelines : SIGNALEES seulement, jamais reecrites (reecrire une
    // cartoucheId imposerait de reecrire l eval, or elles sont verrouillees — invariant #350).
    return out;
}

function main() {
    const args = lireArgs(process.argv);
    let codex;
    try { codex = JSON.parse(readFileSync(args.codex, 'utf8')); }
    catch (e) { console.error('Lecture impossible : ' + e.message); process.exit(2); }

    const trimestres = detecterTrimestres(codex);
    const plan = calculerReparations(codex, trimestres, { cartouches: args.cartouches });

    console.log('');
    console.log('RÉPARATION RÉFÉRENCES PRODUCTIONS — codex ' + trimestres.join(', ') +
        (args.ecrire ? ' · ÉCRITURE (copie)' : ' · LECTURE SEULE (aucune écriture)'));

    console.log('');
    console.log('── PRODUCTIONS À REMAPPER (champ périmé ≠ id unanime des évals) ──');
    if (!plan.remaps.length) console.log('  (aucune)');
    for (const r of plan.remaps) {
        console.log('  [' + r.trimestre + '] ' + r.productionId + (r.titre ? ' « ' + r.titre + ' »' : '') +
            '  ' + r.champ + ' : ' + (r.de || '∅') + ' → ' + r.vers + '  (' + r.nbEvals + ' éval. unanimes)');
    }

    console.log('');
    if (args.cartouches) {
        console.log('── CARTOUCHES ORPHELINES (signalées, NON réécrites — évals verrouillées, invariant #350) ──');
        if (!plan.cartouches.length) console.log('  (aucune)');
        for (const c of plan.cartouches) {
            console.log('  [' + c.trimestre + '] ' + c.cartoucheId + '  référencée par ' + c.nbEvals +
                ' éval. (' + c.nbVerrouillees + ' verrouillée(s)) · rétroaction conservée · NON réécrite');
        }
        console.log('');
    } else {
        console.log('(cartouches orphelines NON examinées — ajouter --cartouches pour les signaler)');
        console.log('');
    }

    console.log('RÉSUMÉ : ' + plan.remaps.length + ' référence(s) de production à remapper · ' +
        plan.cartouches.length + ' cartouche(s) orpheline(s) signalée(s) (non réécrite(s) — verrouillées).');

    if (args.ecrire) {
        const out = appliquer(codex, plan);
        // Vérification d'idempotence : un 2e calcul sur la sortie doit être vide.
        const verif = calculerReparations(out, trimestres, { cartouches: args.cartouches });
        if (verif.remaps.length) {
            console.error('ÉCHEC idempotence : la sortie comporte encore des réparations en attente. Écriture annulée.');
            process.exit(2);
        }
        writeFileSync(args.sortie, JSON.stringify(out));
        console.log('ÉCRIT (copie corrigée, idempotence vérifiée) : ' + args.sortie);
        console.log('⚠ BACKUP de l\'original AVANT toute ré-importation. Les notes et fichiers ne sont pas touchés.');
    } else {
        console.log('LECTURE SEULE — aucune donnée modifiée. --ecrire --sortie <out.json> pour produire la copie corrigée.');
    }
    process.exit(0);
}

// N'exécute le CLI que lancé directement (pas à l'import par la sentinelle Vitest).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main();
}
