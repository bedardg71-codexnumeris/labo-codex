#!/usr/bin/env node
/**
 * scripts/reparer-coursid-productions.mjs
 *
 * Brique D namespacing — hygiène coursId (juin 2026). Sibling de
 * scripts/reparer-references-productions.mjs : MÊME logique conservatrice
 * « id UNANIME des évaluations de la production », appliquée au champ coursId.
 *
 *   PRODUCTION.coursId PÉRIMÉ — un champ coursId de production pointe un ANCIEN
 *   id de cours (avant namespacing), alors que TOUTES les évaluations de cette
 *   production portent l'id de cours canonique du trimestre (famille « ancien id
 *   non migré » de #346). Le filtre coursId d'obtenirDonneesSelonMode écarte alors
 *   ces productions du périmètre du cours actif → portfolio vide, note à 0.
 *   On réaligne production.coursId sur l'id UNANIME des évals. CONSERVATEUR :
 *   on ne remappe QUE si des évals existent ET s'accordent sur un seul coursId
 *   ≠ du champ production. Aucune éval / désaccord ⇒ on ne touche pas.
 *
 * AUTO-LIMITÉ par construction : un trimestre dont les productions sont déjà
 * cohérentes avec leurs évals (cas A24/A25, où l'ancien id est l'id LÉGITIME et
 * partagé par productions ET évals) ne produit AUCUN remap. La règle ne « migre »
 * jamais un trimestre cohérent vers un autre id. (Sentinelle : cas cross-trimestre.)
 *
 * Productions SANS évaluation (ex. conteneur « Portfolio », pondération 100) :
 * aucun signal unanime ⇒ NON touchées (décision Grégoire 27 juin : laissées de côté).
 *
 * NON DESTRUCTIF par défaut : LECTURE SEULE, imprime le plan. --ecrire --sortie
 * produit une COPIE corrigée du codex (jamais d'écriture en place). Pour la donnée
 * LIVE, le même calcul est exposé en console dans l'app (window.reparerCoursIdProductions).
 *
 * Usage :
 *   node scripts/reparer-coursid-productions.mjs --codex "<donnees.json>" [--verbeux]
 *   node scripts/reparer-coursid-productions.mjs --codex "<in.json>" --ecrire --sortie "<out.json>"
 *
 * Codes de sortie : 0 = plan produit (ou écriture faite) · 2 = erreur d'exécution.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

function lireArgs(argv) {
    const a = { verbeux: false, ecrire: false };
    for (let i = 2; i < argv.length; i++) {
        const t = argv[i];
        if (t === '--codex') a.codex = argv[++i];
        else if (t === '--sortie') a.sortie = argv[++i];
        else if (t === '--ecrire') a.ecrire = true;
        else if (t === '--verbeux') a.verbeux = true;
        else { console.error('Argument inconnu : ' + t); process.exit(2); }
    }
    if (!a.codex) { console.error('Usage : --codex <donnees.json> [--ecrire --sortie <out.json>] [--verbeux]'); process.exit(2); }
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
// remap coursId sans rien muter. Rend { remaps }.
//   remaps[] = { trimestre, productionId, titre, champ:'coursId', de, vers, nbEvals }
export function calculerRemapsCoursId(codex, trimestres) {
    const remaps = [];
    for (const t of trimestres) {
        const productions = codex[t + '_productions'] || [];
        const evals = codex[t + '_evaluationsSauvegardees'] || [];
        for (const prod of productions) {
            if (!prod || !prod.id) continue;
            // Évals actives de CETTE production qui DÉCLARENT un coursId (seules à « voter »).
            const liees = evals.filter(e => e && !e.remplaceeParId && e.productionId === prod.id && e.coursId);
            if (!liees.length) continue;            // aucune éval votante ⇒ rien à quoi s'aligner
            const cible = unanime(liees, 'coursId');
            if (cible === null) continue;            // évals divergentes ⇒ on ne tranche pas
            if ((prod.coursId || '') === cible) continue; // déjà aligné
            remaps.push({ trimestre: t, productionId: prod.id, titre: prod.titre || prod.nom || '', champ: 'coursId', de: prod.coursId || '', vers: cible, nbEvals: liees.length });
        }
    }
    return { remaps };
}

// Applique le plan sur une COPIE profonde du codex. Idempotent (un 2e passage ne
// trouve plus rien à changer). N'écrit QUE le champ coursId des productions visées.
function appliquer(codex, plan) {
    const out = JSON.parse(JSON.stringify(codex));
    for (const r of plan.remaps) {
        const prod = (out[r.trimestre + '_productions'] || []).find(p => p && p.id === r.productionId);
        if (prod && (prod.coursId || '') === r.de) prod.coursId = r.vers;
    }
    return out;
}

function main() {
    const args = lireArgs(process.argv);
    let codex;
    try { codex = JSON.parse(readFileSync(args.codex, 'utf8')); }
    catch (e) { console.error('Lecture impossible : ' + e.message); process.exit(2); }

    const trimestres = detecterTrimestres(codex);
    const plan = calculerRemapsCoursId(codex, trimestres);

    console.log('');
    console.log('RÉPARATION coursId PRODUCTIONS — codex ' + trimestres.join(', ') +
        (args.ecrire ? ' · ÉCRITURE (copie)' : ' · LECTURE SEULE (aucune écriture)'));

    console.log('');
    console.log('── PRODUCTIONS À REMAPPER (coursId périmé ≠ id unanime des évals) ──');
    if (!plan.remaps.length) console.log('  (aucune)');
    for (const r of plan.remaps) {
        console.log('  [' + r.trimestre + '] ' + r.productionId + (r.titre ? ' « ' + r.titre + ' »' : '') +
            '  coursId : ' + (r.de || '∅') + ' → ' + r.vers + '  (' + r.nbEvals + ' éval. unanimes)');
    }

    // Clés effectivement touchées (transparence : on doit voir QUE des *_productions).
    const clesTouchees = [...new Set(plan.remaps.map(r => r.trimestre + '_productions'))].sort();
    console.log('');
    console.log('CLÉS QUI SERAIENT ÉCRITES : ' + (clesTouchees.join(', ') || '(aucune)'));
    console.log('RÉSUMÉ : ' + plan.remaps.length + ' coursId de production à remapper. Notes, fichiers et autres trimestres NON touchés.');

    if (args.ecrire) {
        const out = appliquer(codex, plan);
        // Vérification d'idempotence : un 2e calcul sur la sortie doit être vide.
        const verif = calculerRemapsCoursId(out, trimestres);
        if (verif.remaps.length) {
            console.error('ÉCHEC idempotence : la sortie comporte encore des remaps en attente. Écriture annulée.');
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
