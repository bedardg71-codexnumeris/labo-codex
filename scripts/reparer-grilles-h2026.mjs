#!/usr/bin/env node
/**
 * scripts/reparer-grilles-h2026.mjs
 *
 * #362 — Grilles h2026 DÉSAPPARIÉES des évaluations (récupération de DÉFINITION).
 * Sibling de scripts/reparer-coursid-productions.mjs : MÊME discipline (logique pure
 * testable + CLI offline non destructif, dry-run par défaut, --ecrire gaté pour le live).
 *
 *   GRILLE DE TRAVAIL ABSENTE — des évaluations h2026 (grade-bearing) portent un
 *   grilleId dont la DÉFINITION est introuvable dans le pool des grilles de travail
 *   (*_grillesTemplates). Le dropdown montre à la place des COPIES orphelines créées
 *   en juin (suffixe « A25 », ZÉRO éval) dont les critereId sont IDENTIQUES à ceux
 *   que les évals attendent (même pattern que #346 coursId, mais sur evaluation.grilleId).
 *   Conséquence : notes saines (stockées dans l'éval) mais dépistage SOLO / critères /
 *   ré-évaluation cassés (« Pas de grille de référence »).
 *
 *   RÉCUPÉRATION : recréer chaque grille manquante SOUS L'ID ATTENDU PAR LES ÉVALS,
 *   en copiant les criteres (+ echelleId, dansBibliotheque) depuis la copie orpheline
 *   dont l'empreinte de critereId correspond EXACTEMENT, avec un nom propre fourni par
 *   Grégoire. Les criteres déjà stockés dans chaque éval s'apparient alors à la
 *   définition recréée → recalcul identique.
 *
 * CONSERVATEUR — on ne planifie une recréation QUE si :
 *   - le grilleId est référencé par au moins une éval active (!remplaceeParId) ;
 *   - ce grilleId est ABSENT du pool des grilles de travail (sinon : déjà résoluble) ;
 *   - une (et une seule) copie orpheline a l'EMPREINTE de critereId EXACTE attendue par
 *     les évals (set d'ids identique). Ambiguïté (0 ou ≥2 candidates) ⇒ on NE tranche pas.
 *
 * INVARIANT NON NÉGOCIABLE : on ne réécrit JAMAIS les évaluations (grade-bearing,
 * invariant #350). On ne fabrique QUE des entrées de DÉFINITION de grille.
 *
 * NON DESTRUCTIF par défaut : LECTURE SEULE, imprime le plan de correspondance
 * (critereId, pondérations, cartouches). --ecrire --sortie produit une COPIE corrigée
 * du codex (jamais d'écriture en place). Les NOMS PROPRES des grilles recréées sont des
 * DÉCISIONS de Grégoire : --ecrire EXIGE --noms <fichier.json> (sinon refus). Le retrait
 * des copies orphelines et le réglage de la pref restent des décisions signalées, NON
 * appliquées par ce script sans confirmation explicite des noms.
 *
 * Usage :
 *   node scripts/reparer-grilles-h2026.mjs --codex "<donnees.json>" [--verbeux]
 *   node scripts/reparer-grilles-h2026.mjs --codex "<in.json>" --ecrire --sortie "<out.json>" --noms "<noms.json>"
 *
 * Format --noms (mappe l'id ATTENDU → nom propre voulu) :
 *   { "grille_1772187755149_uq1oiiafa": "Grille-5 FR-HOLIS-30", ... }
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
        else if (t === '--noms') a.noms = argv[++i];
        else if (t === '--ecrire') a.ecrire = true;
        else if (t === '--verbeux') a.verbeux = true;
        else { console.error('Argument inconnu : ' + t); process.exit(2); }
    }
    if (!a.codex) { console.error('Usage : --codex <donnees.json> [--ecrire --sortie <out.json> --noms <noms.json>] [--verbeux]'); process.exit(2); }
    if (a.ecrire && !a.sortie) { console.error('--ecrire exige --sortie <out.json>'); process.exit(2); }
    if (a.ecrire && !a.noms) { console.error('--ecrire exige --noms <noms.json> (les noms propres sont une décision de Grégoire, pas une valeur par défaut)'); process.exit(2); }
    return a;
}

// Toutes les clés *_grillesTemplates (pool des grilles de travail, tous trimestres + global).
function clesGrillesTemplates(codex) {
    return Object.keys(codex).filter(k => /(^|_)grillesTemplates$/.test(k)).sort();
}

// Union de toutes les grilles de travail connues (le « pool »). Rend une Map id→grille.
function indexerGrilles(codex) {
    const idx = new Map();
    for (const k of clesGrillesTemplates(codex)) {
        const liste = codex[k];
        if (Array.isArray(liste)) for (const g of liste) if (g && g.id) {
            idx.set(g.id, { grille: g, cle: k });
        }
    }
    return idx;
}

// Empreinte ordonnée des critereId d'un ensemble de critères (signature comparable).
function empreinteCriteres(criteres) {
    const ids = (criteres || []).map(c => c && c.id).filter(Boolean);
    return [...ids].sort().join('|');
}

// Empreinte attendue par un groupe d'évals : union triée des critereId stockés dans
// leurs criteres (l'éval porte ses propres criteres avec un id = le critereId de la grille).
function empreinteAttendueDesEvals(evals) {
    const ids = new Set();
    for (const e of evals) for (const c of (e && e.criteres) || []) {
        if (c && c.id) ids.add(c.id);
    }
    return [...ids].sort().join('|');
}

// CŒUR PUR (testable + réutilisable par une fonction console live). Calcule le plan de
// RECRÉATION de définitions de grille sans rien muter, ni jamais toucher aux évaluations.
//   noms : objet { idAttendu -> nomPropre } (facultatif en dry-run ; requis avant --ecrire).
//
// Rend { recreations, orphelines } où :
//   recreations[] = { trimestre, cleCible, idAttendu, nbEvals, empreinte, sourceId, sourceCle,
//                     nbCriteres, echelleId, nomPropre|null }
//   orphelines[]  = { cle, id, nom, raison:'source-d-une-recreation'|'sans-eval' }   (signalées, NON retirées)
export function calculerRecreationGrilles(codex, trimestre, noms) {
    noms = noms || {};
    const cleCible = trimestre + '_grillesTemplates';
    const evals = (codex[trimestre + '_evaluationsSauvegardees'] || []).filter(e => e && !e.remplaceeParId);
    const pool = indexerGrilles(codex);

    // 1. Regrouper les évals actives par grilleId référencé.
    const parGrilleId = new Map();
    for (const e of evals) {
        const gid = e.grilleId;
        if (!gid) continue;
        if (!parGrilleId.has(gid)) parGrilleId.set(gid, []);
        parGrilleId.get(gid).push(e);
    }

    // 2. Pour chaque grilleId ABSENT du pool, chercher la copie orpheline d'empreinte exacte.
    const recreations = [];
    const sourcesUtilisees = new Set();
    for (const [idAttendu, evalsDuGroupe] of parGrilleId) {
        if (pool.has(idAttendu)) continue;                 // déjà résoluble → rien à faire
        const empreinteAttendue = empreinteAttendueDesEvals(evalsDuGroupe);
        if (!empreinteAttendue) continue;                  // évals sans critère → aucun signal d'appariement

        // Candidates : grilles du pool dont l'empreinte de critereId == empreinte attendue.
        const candidates = [];
        for (const [, { grille, cle }] of pool) {
            if (empreinteCriteres(grille.criteres) === empreinteAttendue) candidates.push({ grille, cle });
        }
        if (candidates.length !== 1) continue;             // 0 ou ≥2 → ambigu, on NE tranche pas
        const src = candidates[0];

        recreations.push({
            trimestre,
            cleCible,
            idAttendu,
            nbEvals: evalsDuGroupe.length,
            empreinte: empreinteAttendue,
            sourceId: src.grille.id,
            sourceCle: src.cle,
            nbCriteres: (src.grille.criteres || []).length,
            echelleId: src.grille.echelleId || null,
            nomPropre: Object.prototype.hasOwnProperty.call(noms, idAttendu) ? noms[idAttendu] : null
        });
        sourcesUtilisees.add(src.grille.id);
    }
    recreations.sort((a, b) => a.idAttendu.localeCompare(b.idAttendu));

    // 3. Signaler les copies orphelines (zéro éval ne les utilise). Celles qui ont servi de
    //    source à une recréation sont marquées comme retirables APRÈS recréation.
    const cibleListe = codex[cleCible] || [];
    const idsReferencesParEvals = new Set([...parGrilleId.keys()]);
    const orphelines = [];
    for (const g of cibleListe) {
        if (!g || !g.id) continue;
        if (idsReferencesParEvals.has(g.id)) continue;     // utilisée par des évals → pas orpheline
        orphelines.push({
            cle: cleCible,
            id: g.id,
            nom: g.nom || '',
            raison: sourcesUtilisees.has(g.id) ? 'source-d-une-recreation' : 'sans-eval'
        });
    }
    orphelines.sort((a, b) => a.id.localeCompare(b.id));

    return { recreations, orphelines };
}

// Construit une entrée de DÉFINITION de grille à recréer (copie profonde de la source,
// id forcé à l'id attendu, nom propre, drapeau de provenance). NE TOUCHE AUCUNE ÉVAL.
export function fabriquerGrille(codex, rec) {
    const pool = indexerGrilles(codex);
    const src = pool.get(rec.sourceId);
    const copie = JSON.parse(JSON.stringify(src.grille));
    copie.id = rec.idAttendu;
    copie.nom = rec.nomPropre;
    copie.recreeePar = '#362-reparer-grilles-h2026';
    copie.recreeeDe = rec.sourceId;
    return copie;
}

// Applique le plan sur une COPIE profonde : AJOUTE les définitions recréées dans la clé
// cible (sans écraser une grille de même id déjà présente → idempotent). N'écrit QUE
// *_grillesTemplates. Ne retire PAS les orphelines, ne touche PAS la pref (décisions).
export function appliquer(codex, plan) {
    const out = JSON.parse(JSON.stringify(codex));
    for (const rec of plan.recreations) {
        if (!Array.isArray(out[rec.cleCible])) out[rec.cleCible] = [];
        const liste = out[rec.cleCible];
        if (liste.some(g => g && g.id === rec.idAttendu)) continue;  // déjà recréée → idempotent
        liste.push(fabriquerGrille(out, rec));
    }
    return out;
}

function main() {
    const args = lireArgs(process.argv);
    let codex, noms = {};
    try { codex = JSON.parse(readFileSync(args.codex, 'utf8')); }
    catch (e) { console.error('Lecture impossible : ' + e.message); process.exit(2); }
    if (args.noms) {
        try { noms = JSON.parse(readFileSync(args.noms, 'utf8')); }
        catch (e) { console.error('Lecture des noms impossible : ' + e.message); process.exit(2); }
    }

    const trimestre = 'h2026';
    const plan = calculerRecreationGrilles(codex, trimestre, noms);

    console.log('');
    console.log('RÉPARATION grilles ' + trimestre + ' (définitions désappariées des évals)' +
        (args.ecrire ? ' · ÉCRITURE (copie)' : ' · LECTURE SEULE (aucune écriture)'));

    console.log('');
    console.log('── GRILLES À RECRÉER (grilleId des évals ABSENT du pool, copie orpheline d\'empreinte exacte trouvée) ──');
    if (!plan.recreations.length) console.log('  (aucune)');
    for (const r of plan.recreations) {
        console.log('  [' + r.trimestre + '] recréer ' + r.idAttendu +
            '  ← copie ' + r.sourceId + ' (' + r.sourceCle + ')  · ' +
            r.nbCriteres + ' critères · ' + r.nbEvals + ' éval. · échelle ' + (r.echelleId || '∅') +
            '  · nom propre : ' + (r.nomPropre ? '« ' + r.nomPropre + ' »' : '⚠ NON FOURNI (décision Grégoire)'));
        if (args.verbeux) console.log('       empreinte critereId : ' + r.empreinte);
    }

    console.log('');
    console.log('── COPIES ORPHELINES (0 éval) — SIGNALÉES, NON retirées par ce script ──');
    if (!plan.orphelines.length) console.log('  (aucune)');
    for (const o of plan.orphelines) {
        console.log('  [' + o.cle + '] ' + o.id + (o.nom ? ' « ' + o.nom + ' »' : '') + ' — ' + o.raison);
    }

    const clesTouchees = [...new Set(plan.recreations.map(r => r.cleCible))].sort();
    console.log('');
    console.log('CLÉS QUI SERAIENT ÉCRITES : ' + (clesTouchees.join(', ') || '(aucune)'));
    console.log('RÉSUMÉ : ' + plan.recreations.length + ' définition(s) de grille à recréer. ' +
        'ÉVALUATIONS NON touchées (grade-bearing). Pref de dépistage et retrait des orphelines = décisions à part.');

    if (args.ecrire) {
        // Garde : refuser si une recréation manque son nom propre.
        const sansNom = plan.recreations.filter(r => !r.nomPropre);
        if (sansNom.length) {
            console.error('ÉCRITURE ANNULÉE : ' + sansNom.length + ' grille(s) sans nom propre dans --noms : ' +
                sansNom.map(r => r.idAttendu).join(', '));
            process.exit(2);
        }
        const out = appliquer(codex, plan);
        // Idempotence : un 2e calcul sur la sortie ne doit plus rien recréer (ids désormais dans le pool).
        const verif = calculerRecreationGrilles(out, trimestre, noms);
        if (verif.recreations.length) {
            console.error('ÉCHEC idempotence : la sortie comporte encore des recréations en attente. Écriture annulée.');
            process.exit(2);
        }
        writeFileSync(args.sortie, JSON.stringify(out));
        console.log('ÉCRIT (copie corrigée, idempotence vérifiée) : ' + args.sortie);
        console.log('⚠ BACKUP de l\'original AVANT toute ré-importation. Évaluations, notes et pref NON touchées par ce script.');
    } else {
        console.log('LECTURE SEULE — aucune donnée modifiée. --ecrire --sortie <out.json> --noms <noms.json> pour produire la copie corrigée.');
    }
    process.exit(0);
}

// N'exécute le CLI que lancé directement (pas à l'import par la sentinelle Vitest).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main();
}
