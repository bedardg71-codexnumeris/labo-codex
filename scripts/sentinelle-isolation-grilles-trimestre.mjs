#!/usr/bin/env node
/**
 * scripts/sentinelle-isolation-grilles-trimestre.mjs
 *
 * L2 — PLAN-restauration-longitudinale-A25.md (lot « Isolation grilles par
 * trimestre », cause racine de la contamination §8.2).
 *
 * INVARIANT VERROUILLÉ : aucune grille utilisée par les évaluations d'un
 * trimestre n'est partagée (à l'usage) avec un autre trimestre. Une grille
 * partagée ET présente dans la liste active `grillesTemplates` est éditable
 * pour le trimestre courant ; or les définitions de grille sont GLOBALES
 * (`CLES_GLOBALES`, cf. SKILL_integrite_globaux). La modifier change donc la
 * base de calcul d'un AUTRE trimestre **au recalcul d'une évaluation rouverte**
 * (les notes déjà stockées ne bougent pas tant qu'on ne rouvre/recalcule pas).
 *
 * POURQUOI STRUCTUREL ET NON « PAR RECALCUL » : la note d'artefact est calculée
 * à la SAISIE (chemin DOM, `evaluation-calcul.js`) puis stockée ; le recalcul
 * ne survient qu'à la réouverture (rechargement du formulaire depuis la grille).
 * Tester ce chemin hors navigateur n'est pas fiable, et la grille partagée
 * d'A25 (FR-ALGO) porte des notes « posées » (champs erreurs/mots vides). La
 * sentinelle verrouille donc l'INVARIANT de partage d'id — ce qui suffit :
 * pas de partage ⇒ pas de contamination possible, quel que soit le chemin.
 *
 * Lecture seule. Le codex est lu en mémoire, jamais réécrit. ROUGE tant qu'une
 * grille est partagée ; `--simuler-isolation` re-pointe (en mémoire) le
 * trimestre cible vers des ids distincts et prouve que le verdict passe à VERT.
 *
 * Usage :
 *   node scripts/sentinelle-isolation-grilles-trimestre.mjs --codex "<donnees.json>"
 *
 * Options :
 *   --trimestre-cible <prefixe>  focaliser sur un trimestre (ex: a2025). Sans,
 *                                vérifie tout partage entre trimestres.
 *   --simuler-isolation          re-pointe (copie en mémoire) les évaluations du
 *                                trimestre cible reposant sur une grille partagée
 *                                vers un id distinct, et exige que ça fasse VERDIR.
 *   --verbeux                    liste toutes les grilles (pas que les partagées).
 *
 * Codes de sortie : 0 = vert (ou isolation prouvée) · 1 = rouge ·
 *                   2 = erreur d'exécution.
 */

import { readFileSync } from 'node:fs';

function lireArgs(argv) {
    const a = { simuler: false, verbeux: false };
    for (let i = 2; i < argv.length; i++) {
        const t = argv[i];
        if (t === '--codex') a.codex = argv[++i];
        else if (t === '--trimestre-cible') a.cible = argv[++i];
        else if (t === '--simuler-isolation') a.simuler = true;
        else if (t === '--verbeux') a.verbeux = true;
        else { console.error('Argument inconnu : ' + t); process.exit(2); }
    }
    if (!a.codex) {
        console.error('Usage : --codex <donnees.json> [--trimestre-cible a2025] [--simuler-isolation] [--verbeux]');
        process.exit(2);
    }
    if (a.simuler && !a.cible) a.cible = 'a2025'; // l'isolation porte sur un trimestre
    return a;
}

// Trimestres présents = préfixes a/h + 4 chiffres portant des évaluations.
function detecterTrimestres(codex) {
    const set = new Set();
    for (const k of Object.keys(codex)) {
        const m = k.match(/^([ah]\d{4})_evaluationsSauvegardees$/);
        if (m) set.add(m[1]);
    }
    return [...set].sort();
}

// usage[grilleId] = { [trimestre]: nbEvaluations }
function cartographierUsage(codex, trimestres) {
    const usage = {};
    for (const t of trimestres) {
        for (const e of (codex[t + '_evaluationsSauvegardees'] || [])) {
            const g = e && e.grilleId;
            if (!g) continue;
            (usage[g] || (usage[g] = {}))[t] = (usage[g][t] || 0) + 1;
        }
    }
    return usage;
}

function analyser(codex, args) {
    const trimestres = detecterTrimestres(codex);
    const usage = cartographierUsage(codex, trimestres);
    const gt = codex.grillesTemplates || [];
    const noms = {}; gt.forEach(g => { noms[g.id] = g.nom || g.titre || null; });
    const listeActive = new Set(gt.map(g => g.id));

    // Grilles partagées entre ≥ 2 trimestres.
    let partagees = Object.entries(usage)
        .filter(([, u]) => Object.keys(u).length > 1)
        .map(([grille, u]) => ({ grille, nom: noms[grille] || null, usage: u, dansListe: listeActive.has(grille) }));

    // Focalisation éventuelle sur un trimestre cible.
    if (args.cible) partagees = partagees.filter(p => p.usage[args.cible]);

    const exposition = args.cible
        ? partagees.reduce((s, p) => s + (p.usage[args.cible] || 0), 0)
        : partagees.reduce((s, p) => s + Object.values(p.usage).reduce((x, y) => x + y, 0), 0);

    return { trimestres, usage, partagees, exposition };
}

// Re-pointe (sur une COPIE) les évaluations du trimestre cible qui reposent sur
// une grille partagée, vers un id distinct « <grille>__<cible> » : c'est ce que
// fera la « recréation propre » (§8.4). Sert à prouver que l'invariant verdit.
function simulerIsolation(codex, cible) {
    const copie = JSON.parse(JSON.stringify(codex));
    const trimestres = detecterTrimestres(copie);
    const usage = cartographierUsage(copie, trimestres);
    const aIsoler = new Set(Object.entries(usage)
        .filter(([, u]) => u[cible] && Object.keys(u).length > 1)
        .map(([g]) => g));
    for (const e of (copie[cible + '_evaluationsSauvegardees'] || [])) {
        if (e && aIsoler.has(e.grilleId)) e.grilleId = e.grilleId + '__' + cible;
    }
    return copie;
}

function afficherRapport(r, args) {
    console.log('');
    console.log('SENTINELLE ISOLATION GRILLES — codex ' + r.trimestres.join(', ') +
        (args.cible ? ' · cible ' + args.cible : ' · tous trimestres'));
    console.log('');
    if (args.verbeux) {
        console.log('Toutes les grilles utilisées et leur usage par trimestre :');
        for (const [g, u] of Object.entries(r.usage)) console.log('   ' + g + '  ' + JSON.stringify(u));
        console.log('');
    }
    if (r.partagees.length === 0) {
        console.log('Aucune grille partagée entre trimestres détectée.');
    } else {
        console.log('Grilles PARTAGÉES entre trimestres (vecteur de contamination) :');
        for (const p of r.partagees) {
            console.log('   ' + p.grille + (p.nom ? ' (' + p.nom + ')' : '') +
                '  usage ' + JSON.stringify(p.usage) +
                '  | dans liste active: ' + p.dansListe);
        }
        console.log('');
        console.log('Évaluations exposées' + (args.cible ? ' (' + args.cible + ')' : '') + ' : ' + r.exposition);
    }
}

function main() {
    const args = lireArgs(process.argv);
    let codex;
    try {
        codex = JSON.parse(readFileSync(args.codex, 'utf8'));
    } catch (e) {
        console.error('Lecture impossible : ' + e.message);
        process.exit(2);
    }

    const r = analyser(codex, args);
    const vert = r.partagees.length === 0;
    afficherRapport(r, args);
    console.log('');
    console.log('VERDICT : ' + (vert ? '✅ VERT — aucune grille partagée' :
        '❌ ROUGE — ' + r.partagees.length + ' grille(s) partagée(s)' + (args.cible ? ' impliquant ' + args.cible : '')));

    if (args.simuler) {
        console.log('');
        console.log('── Simulation d\'isolation (--simuler-isolation, cible ' + args.cible + ') ──');
        if (vert) {
            console.log('⚠ Déjà VERT sans isolation : rien à prouver ici.');
            process.exit(0);
        }
        const rIsole = analyser(simulerIsolation(codex, args.cible), args);
        const vertApres = rIsole.partagees.length === 0;
        console.log('Re-pointage des ' + r.exposition + ' évaluations ' + args.cible +
            ' vers des ids « <grille>__' + args.cible + ' » distincts.');
        console.log('Résultat isolé : ' + (vertApres ? '✅ VERT' : '❌ ROUGE (' + rIsole.partagees.length + ' restante(s))'));
        if (!vertApres) {
            console.log('❌ L\'isolation simulée n\'a pas suffi — invariant non rétabli.');
            process.exit(2);
        }
        console.log('✅ ISOLATION PROUVÉE : rouge aujourd\'hui (grille partagée), vert une fois ' +
            args.cible + ' re-pointé. C\'est la cible de la recréation propre (§8.4).');
        process.exit(0);
    }

    process.exit(vert ? 0 : 1);
}

main();
