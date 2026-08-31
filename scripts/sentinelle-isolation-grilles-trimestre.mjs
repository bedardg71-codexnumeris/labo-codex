#!/usr/bin/env node
/**
 * scripts/sentinelle-isolation-grilles-trimestre.mjs
 *
 * L2 — PLAN-restauration-longitudinale-A25.md (lot « Isolation grilles par
 * trimestre », cause racine de la contamination §8.2) — ÉTENDU aux quatre
 * familles de modèles évaluables (Brique D namespacing, 26 juin 2026).
 *
 * INVARIANT VERROUILLÉ : aucun MODÈLE utilisé par les évaluations d'un trimestre
 * n'est partagé (à l'usage) avec un autre trimestre. Un modèle partagé ET présent
 * dans la liste active est éditable pour le trimestre courant ; or les définitions
 * de grilles/échelles sont GLOBALES (`CLES_GLOBALES`, cf. SKILL_integrite_globaux).
 * Les modifier change donc la base de calcul d'un AUTRE trimestre **au recalcul
 * d'une évaluation rouverte** (les notes déjà stockées ne bougent pas tant qu'on
 * ne rouvre/recalcule pas).
 *
 * POURQUOI ÉTENDU AUX 4 MODÈLES (✓ vérifié au code) : surveiller les seules
 * grilles laissait un faux positif. Une évaluation sauvegardée référence quatre
 * modèles, chacun un vecteur de partage possible :
 *   - GRILLE     : champ `grilleId`            → grillesTemplates (CLES_GLOBALES)
 *   - ÉCHELLE    : champ `echelleId`           → echellesTemplates (CLES_GLOBALES)
 *   - PRATIQUE   : champ `echelleId` préfixé   → pratiquesConfigurables, via
 *                  `pratique-<id>` (evaluation-chargement.js:794-814)
 *   - CARTOUCHE  : champ `cartoucheId`         → cartouches_<grilleId>
 * Réf. construction de l'objet : evaluation-sauvegarde.js:203-246 (echelleId /
 * cartoucheId via _lireChampsDOMSauv, grilleId / productionId via le contexte).
 *
 * POURQUOI STRUCTUREL ET NON « PAR RECALCUL » : la note d'artefact est calculée
 * à la SAISIE (chemin DOM, `evaluation-calcul.js`) puis stockée ; le recalcul ne
 * survient qu'à la réouverture. Tester ce chemin hors navigateur n'est pas
 * fiable. La sentinelle verrouille donc l'INVARIANT de partage d'id — ce qui
 * suffit : pas de partage ⇒ pas de contamination possible, quel que soit le chemin.
 *
 * Lecture seule. Le codex est lu en mémoire, jamais réécrit. ROUGE tant qu'un
 * modèle (quel que soit son type) est partagé ; `--simuler-isolation` re-pointe
 * (en mémoire) le trimestre cible vers des ids distincts et prouve le passage
 * à VERT.
 *
 * Usage :
 *   node scripts/sentinelle-isolation-grilles-trimestre.mjs --codex "<donnees.json>"
 *
 * Options :
 *   --trimestre-cible <prefixe>  focaliser sur un trimestre (ex: a2025). Sans,
 *                                vérifie tout partage entre trimestres.
 *   --type <grille|echelle|pratique|cartouche>
 *                                focaliser sur une seule famille de modèles.
 *                                Sans, les quatre sont vérifiées.
 *   --simuler-isolation          re-pointe (copie en mémoire) les évaluations du
 *                                trimestre cible reposant sur un modèle partagé
 *                                vers un id distinct, et exige que ça fasse VERDIR.
 *   --verbeux                    liste tous les modèles (pas que les partagés).
 *
 * Codes de sortie : 0 = vert (ou isolation prouvée) · 1 = rouge ·
 *                   2 = erreur d'exécution.
 */

import { readFileSync } from 'node:fs';

// Les quatre familles de modèles et comment chaque évaluation sauvegardée les
// référence. `extraire(e)` rend l'id du modèle utilisé par l'évaluation, ou null.
const MODELES = {
    grille: {
        label: 'grilles',
        extraire: e => (e && e.grilleId) ? e.grilleId : null,
        // collections où retrouver un nom lisible (global + copies namespacées)
        collections: ['grillesTemplates']
    },
    echelle: {
        label: 'échelles',
        // echelleId classique : tout sauf le préfixe « pratique- » (= pratique).
        extraire: e => (e && typeof e.echelleId === 'string' && e.echelleId && !e.echelleId.startsWith('pratique-')) ? e.echelleId : null,
        collections: ['echellesTemplates']
    },
    pratique: {
        label: 'pratiques',
        // une pratique est utilisée quand echelleId vaut « pratique-<id> ».
        extraire: e => (e && typeof e.echelleId === 'string' && e.echelleId.startsWith('pratique-')) ? e.echelleId.slice('pratique-'.length) : null,
        collections: ['pratiquesConfigurables']
    },
    cartouche: {
        label: 'cartouches',
        extraire: e => (e && e.cartoucheId) ? e.cartoucheId : null,
        // Historiquement : pas de collection unique à interroger — les cartouches
        // vivaient sous des clés GLOBALES `cartouches_<grilleId>`, une par grille,
        // donc partagées par tous les trimestres. D'où `collections: []` : la
        // sentinelle ne pouvait pas dire qui les possédait.
        //
        // ⚠ CONSTAT NON TRAITÉ (31 août 2026, #636). Depuis S5/#623 elles ONT un
        // domicile par trimestre : `<trimestreId>_cartouches_<grilleId>`. Ce
        // `collections: []` n'est donc plus une impossibilité, c'est un ANGLE
        // MORT : la sentinelle d'isolation ne vérifie pas une famille qu'elle
        // pourrait désormais couvrir, et son vert ne dit rien des cartouches.
        //
        // ⚠⚠ SI TU L'ÉTENDS : élargir son périmètre et élargir son MOTIF sont un
        // SEUL geste. Déclarer la famille couverte sans que le motif la trouve
        // donnerait un vert qui ressemble à une preuve — une garde à qui on prête
        // un mérite qu'elle n'a pas finit par servir d'alibi. Le motif doit
        // reconnaître les deux régimes (`/^(?:([ahe]\d{4}|demo)_)?cartouches_(.+)$/`), et un
        // témoin doit prouver qu'il rougit sur un partage fabriqué exprès.
        collections: []
    }
};
const TYPES = Object.keys(MODELES);

function lireArgs(argv) {
    const a = { simuler: false, verbeux: false };
    for (let i = 2; i < argv.length; i++) {
        const t = argv[i];
        if (t === '--codex') a.codex = argv[++i];
        else if (t === '--trimestre-cible') a.cible = argv[++i];
        else if (t === '--type') a.type = argv[++i];
        else if (t === '--simuler-isolation') a.simuler = true;
        else if (t === '--verbeux') a.verbeux = true;
        else { console.error('Argument inconnu : ' + t); process.exit(2); }
    }
    if (!a.codex) {
        console.error('Usage : --codex <donnees.json> [--trimestre-cible a2025] [--type grille|echelle|pratique|cartouche] [--simuler-isolation] [--verbeux]');
        process.exit(2);
    }
    if (a.type && !MODELES[a.type]) {
        console.error('Type inconnu : ' + a.type + ' (attendu : ' + TYPES.join(', ') + ')');
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

// Les types à analyser : tous, ou le seul demandé par --type.
function typesActifs(args) {
    return args.type ? [args.type] : TYPES;
}

// usage[id] = { [trimestre]: nbEvaluations } pour une famille de modèles donnée.
function cartographierUsage(codex, trimestres, extraire) {
    const usage = {};
    for (const t of trimestres) {
        for (const e of (codex[t + '_evaluationsSauvegardees'] || [])) {
            const id = extraire(e);
            if (!id) continue;
            (usage[id] || (usage[id] = {}))[t] = (usage[id][t] || 0) + 1;
        }
    }
    return usage;
}

// Noms lisibles + appartenance à une liste active, collectés best-effort depuis
// les collections globales ET leurs copies namespacées <trim>_<collection>.
function indexerModeles(codex, trimestres, type) {
    const noms = {};
    const listeActive = new Set();
    for (const col of MODELES[type].collections) {
        for (const item of (codex[col] || [])) {
            if (item && item.id) { noms[item.id] = item.nom || item.titre || null; listeActive.add(item.id); }
        }
        for (const t of trimestres) {
            for (const item of (codex[t + '_' + col] || [])) {
                if (item && item.id && !(item.id in noms)) noms[item.id] = item.nom || item.titre || null;
            }
        }
    }
    return { noms, listeActive };
}

function analyserType(codex, trimestres, type, args) {
    const usage = cartographierUsage(codex, trimestres, MODELES[type].extraire);
    const { noms, listeActive } = indexerModeles(codex, trimestres, type);

    let partagees = Object.entries(usage)
        .filter(([, u]) => Object.keys(u).length > 1)
        .map(([id, u]) => ({ id, nom: noms[id] || null, usage: u, dansListe: listeActive.has(id) }));

    if (args.cible) partagees = partagees.filter(p => p.usage[args.cible]);

    const exposition = args.cible
        ? partagees.reduce((s, p) => s + (p.usage[args.cible] || 0), 0)
        : partagees.reduce((s, p) => s + Object.values(p.usage).reduce((x, y) => x + y, 0), 0);

    return { type, usage, partagees, exposition };
}

function analyser(codex, args) {
    const trimestres = detecterTrimestres(codex);
    const parType = typesActifs(args).map(type => analyserType(codex, trimestres, type, args));
    const partageesTotal = parType.reduce((s, r) => s + r.partagees.length, 0);
    const expositionTotal = parType.reduce((s, r) => s + r.exposition, 0);
    return { trimestres, parType, partageesTotal, expositionTotal };
}

// Re-pointe (sur une COPIE) les évaluations du trimestre cible qui reposent sur
// un modèle partagé, vers un id distinct (suffixe « __<cible> ») : c'est ce que
// fera la « recréation propre » (§8.4). Sert à prouver que l'invariant verdit.
// Couvre les trois champs porteurs : grilleId, echelleId (échelle ET pratique),
// cartoucheId. Limité au(x) type(s) actif(s).
function simulerIsolation(codex, cible, args) {
    const copie = JSON.parse(JSON.stringify(codex));
    const trimestres = detecterTrimestres(copie);
    const types = typesActifs(args);

    // Pour chaque champ, l'ensemble des ids (bruts, tels qu'écrits dans l'éval)
    // à isoler pour le trimestre cible.
    const champs = {
        grilleId: new Set(),
        echelleId: new Set(),
        cartoucheId: new Set()
    };
    for (const type of types) {
        const usage = cartographierUsage(copie, trimestres, MODELES[type].extraire);
        const partages = new Set(Object.entries(usage)
            .filter(([, u]) => u[cible] && Object.keys(u).length > 1)
            .map(([id]) => id));
        if (partages.size === 0) continue;
        for (const e of (copie[cible + '_evaluationsSauvegardees'] || [])) {
            if (!e) continue;
            if (type === 'grille' && e.grilleId && partages.has(e.grilleId)) champs.grilleId.add(e.grilleId);
            if (type === 'echelle' && typeof e.echelleId === 'string' && partages.has(e.echelleId)) champs.echelleId.add(e.echelleId);
            if (type === 'pratique' && typeof e.echelleId === 'string' && e.echelleId.startsWith('pratique-')
                && partages.has(e.echelleId.slice('pratique-'.length))) champs.echelleId.add(e.echelleId);
            if (type === 'cartouche' && e.cartoucheId && partages.has(e.cartoucheId)) champs.cartoucheId.add(e.cartoucheId);
        }
    }

    for (const e of (copie[cible + '_evaluationsSauvegardees'] || [])) {
        if (!e) continue;
        if (e.grilleId && champs.grilleId.has(e.grilleId)) e.grilleId = e.grilleId + '__' + cible;
        if (typeof e.echelleId === 'string' && champs.echelleId.has(e.echelleId)) e.echelleId = e.echelleId + '__' + cible;
        if (e.cartoucheId && champs.cartoucheId.has(e.cartoucheId)) e.cartoucheId = e.cartoucheId + '__' + cible;
    }
    return copie;
}

function afficherRapport(r, args) {
    console.log('');
    console.log('SENTINELLE ISOLATION MODÈLES — codex ' + r.trimestres.join(', ') +
        (args.cible ? ' · cible ' + args.cible : ' · tous trimestres') +
        (args.type ? ' · type ' + args.type : ' · grilles/échelles/pratiques/cartouches'));

    for (const rt of r.parType) {
        const titre = MODELES[rt.type].label.toUpperCase();
        console.log('');
        console.log('── ' + titre + ' ──');
        if (args.verbeux) {
            console.log('  Tous les ' + MODELES[rt.type].label + ' utilisés et leur usage par trimestre :');
            for (const [id, u] of Object.entries(rt.usage)) console.log('     ' + id + '  ' + JSON.stringify(u));
        }
        if (rt.partagees.length === 0) {
            console.log('  Aucun modèle partagé entre trimestres détecté.');
        } else {
            console.log('  PARTAGÉS entre trimestres (vecteur de contamination) :');
            for (const p of rt.partagees) {
                console.log('     ' + p.id + (p.nom ? ' (' + p.nom + ')' : '') +
                    '  usage ' + JSON.stringify(p.usage) +
                    '  | dans liste active: ' + p.dansListe);
            }
            console.log('  Évaluations exposées' + (args.cible ? ' (' + args.cible + ')' : '') + ' : ' + rt.exposition);
        }
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
    const vert = r.partageesTotal === 0;
    afficherRapport(r, args);
    console.log('');
    console.log('VERDICT : ' + (vert ? '✅ VERT — aucun modèle partagé' :
        '❌ ROUGE — ' + r.partageesTotal + ' modèle(s) partagé(s)' + (args.cible ? ' impliquant ' + args.cible : '')));

    if (args.simuler) {
        console.log('');
        console.log('── Simulation d\'isolation (--simuler-isolation, cible ' + args.cible + ') ──');
        if (vert) {
            console.log('⚠ Déjà VERT sans isolation : rien à prouver ici.');
            process.exit(0);
        }
        const rIsole = analyser(simulerIsolation(codex, args.cible, args), args);
        const vertApres = rIsole.partageesTotal === 0;
        console.log('Re-pointage des ' + r.expositionTotal + ' évaluations ' + args.cible +
            ' vers des ids « <modèle>__' + args.cible + ' » distincts.');
        console.log('Résultat isolé : ' + (vertApres ? '✅ VERT' : '❌ ROUGE (' + rIsole.partageesTotal + ' restant(s))'));
        if (!vertApres) {
            console.log('❌ L\'isolation simulée n\'a pas suffi — invariant non rétabli.');
            process.exit(2);
        }
        console.log('✅ ISOLATION PROUVÉE : rouge aujourd\'hui (modèle partagé), vert une fois ' +
            args.cible + ' re-pointé. C\'est la cible de la recréation propre (§8.4).');
        process.exit(0);
    }

    process.exit(vert ? 0 : 1);
}

main();
