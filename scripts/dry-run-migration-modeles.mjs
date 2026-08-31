#!/usr/bin/env node
/**
 * scripts/dry-run-migration-modeles.mjs
 *
 * DRY-RUN d'OBSERVATION — Brique D namespacing (cadrage §3.4, pas « dry-run »).
 * Préparation NON DESTRUCTIVE de la migration des modèles globaux vers le régime
 * namespacé par trimestre. LECTURE SEULE : aucune écriture, aucune décision de
 * mécanique (D-D1 reste à trancher). Ce script CARTOGRAPHIE ce qu'une migration
 * devrait traiter et signale les pièges connus du cadrage, sur le codex réel.
 *
 * Il complète l'oracle L2 (sentinelle-isolation-grilles-trimestre.mjs) : le L2
 * répond « y a-t-il un partage ? » (le symptôme) ; ce dry-run répond « si je
 * migrais, que copierais-je où, et qu'est-ce qui me piège ? » (le plan).
 *
 * RÉCONCILIE DEUX VUES D'USAGE (✓ vérifié au code, divergence remontée le 26 juin) :
 *   - ÉVALUATIONS  : <trim>_evaluationsSauvegardees[].{grilleId, echelleId, cartoucheId}
 *                    (echelleId préfixé « pratique- » = usage d'une pratique)
 *   - PRODUCTIONS  : <trim>_productions[].{grilleId, echelleId, pratiqueId}
 * Le mécanisme d'archivage existant (identifierTemplatesUtilises, trimestres.js:587)
 * ne regarde QUE les productions : un modèle utilisé en éval sans production
 * correspondante serait raté par lui. Ce dry-run croise les deux pour le révéler.
 *
 * CE QU'IL SIGNALE :
 *   - PARTAGÉS    : modèle utilisé par ≥2 trimestres (cause du L2 rouge, à isoler).
 *   - ORPHELINS   : id référencé (éval/prod) mais ABSENT du catalogue → la copie
 *                   échouerait, risque de perte.
 *   - EN RÉSERVE  : modèle présent au catalogue global mais utilisé par AUCUN
 *                   trimestre → laissé derrière si on migre « par usage » (trou §4-pt7,
 *                   décision « migrer tous les modèles attribuables » à confirmer).
 *   - DIVERGENCES : même id, contenu DIFFÉRENT entre le catalogue global et une copie
 *                   namespacée → id déjà ambigu (D-D6, hash de divergence).
 *
 * Usage :
 *   node scripts/dry-run-migration-modeles.mjs --codex "<donnees.json>" [--verbeux]
 *
 * Codes de sortie : 0 = observation produite · 2 = erreur d'exécution.
 * (Pas de notion rouge/vert : c'est un rapport, pas une sentinelle.)
 */

import { readFileSync } from 'node:fs';

// Familles de modèles + extracteurs d'usage, par source. IDENTIQUES à ceux de
// l'oracle L2 (sentinelle-isolation-grilles-trimestre.mjs) côté évaluation ;
// étendus ici à la vue PRODUCTION. Si l'un change, aligner l'autre.
const MODELES = {
    grille: {
        label: 'grille',
        depuisEval: e => (e && e.grilleId) ? e.grilleId : null,
        depuisProd: p => (p && p.grilleId) ? p.grilleId : null,
        collection: 'grillesTemplates'
    },
    echelle: {
        label: 'échelle',
        depuisEval: e => (e && typeof e.echelleId === 'string' && e.echelleId && !e.echelleId.startsWith('pratique-')) ? e.echelleId : null,
        depuisProd: p => (p && p.echelleId) ? p.echelleId : null,
        collection: 'echellesTemplates'
    },
    pratique: {
        label: 'pratique',
        depuisEval: e => (e && typeof e.echelleId === 'string' && e.echelleId.startsWith('pratique-')) ? e.echelleId.slice('pratique-'.length) : null,
        depuisProd: p => (p && p.pratiqueId) ? p.pratiqueId : null,
        collection: 'pratiquesConfigurables'
    },
    cartouche: {
        label: 'cartouche',
        depuisEval: e => (e && e.cartoucheId) ? e.cartoucheId : null,
        depuisProd: () => null, // les productions ne portent pas de cartoucheId
        collection: null        // cartouches éparpillées sous cartouches_<grilleId>
    }
};
const TYPES = Object.keys(MODELES);

function lireArgs(argv) {
    const a = { verbeux: false };
    for (let i = 2; i < argv.length; i++) {
        const t = argv[i];
        if (t === '--codex') a.codex = argv[++i];
        else if (t === '--verbeux') a.verbeux = true;
        else { console.error('Argument inconnu : ' + t); process.exit(2); }
    }
    if (!a.codex) {
        console.error('Usage : --codex <donnees.json> [--verbeux]');
        process.exit(2);
    }
    return a;
}

/**
 * Trimestres présents dans un codex, déduits de ses propres clés.
 *
 * ⚠ LE MOTIF A ÉTÉ ÉLARGI (31 août 2026, #636). Il était `^([ah]\d{4})_`, ce qui
 * ratait DEUX familles pourtant réelles :
 *   · la session ÉTÉ — `creerTrimestre` accepte 'A', 'H' ET 'E'
 *     (js/trimestres.js), donc `e2026` est un id légitime ;
 *   · le pack de démonstration, dont les clés sont préfixées `demo_`.
 * Tant que ce helper ne servait qu'au rapport de ce dry-run, l'angle mort
 * coûtait une ligne manquante. Depuis #636 il porte aussi le routage des
 * cartouches côté node : un trimestre non détecté devient un magasin non
 * examiné, c'est-à-dire un zéro qui se lit « rien à réparer ».
 *
 * ⮕ Le registre fait AUTORITÉ quand il est là. `trimestres` est une clé globale
 * (CLES_GLOBALES, js/trimestres.js) donc présente dans tout codex exporté ; on
 * ne retombe sur le balayage des clés que si elle manque ou n'apprend rien.
 */
function detecterTrimestres(codex) {
    const set = new Set();

    // 1. Le registre, source de vérité quand il est présent.
    const registre = codex && codex['trimestres'];
    if (Array.isArray(registre)) {
        for (const t of registre) if (t && typeof t.id === 'string' && t.id) set.add(t.id);
    }

    // 2. Repli/complément : déduire des clés. `[ahe]` couvre les trois sessions,
    //    `demo` le pack de démonstration. Un trimestre porteur de données mais
    //    absent du registre doit quand même être vu — c'est précisément l'état
    //    incohérent qu'un outil de réparation existe pour trouver.
    for (const k of Object.keys(codex || {})) {
        const m = k.match(/^([ahe]\d{4}|demo)_(evaluationsSauvegardees|productions)$/);
        if (m) set.add(m[1]);
    }
    return [...set].sort();
}

// usage[type][id][trim] = nb de références (évaluations + productions).
function cartographierUsage(codex, trimestres) {
    const usage = {};
    for (const type of TYPES) usage[type] = {};
    const ajouter = (type, id, t) => {
        if (!id) return;
        const u = usage[type][id] || (usage[type][id] = {});
        u[t] = (u[t] || 0) + 1;
    };
    for (const t of trimestres) {
        for (const e of (codex[t + '_evaluationsSauvegardees'] || [])) {
            for (const type of TYPES) ajouter(type, MODELES[type].depuisEval(e), t);
        }
        for (const p of (codex[t + '_productions'] || [])) {
            for (const type of TYPES) ajouter(type, MODELES[type].depuisProd(p), t);
        }
    }
    return usage;
}

// catalogue[type] = Map(id → { collections: [..], defs: { collection: jsonDef } }).
// Recense où chaque modèle est DÉFINI : catalogue global + copies namespacées
// <trim>_<collection> (archives / futur régime hybride).
function cartographierCatalogue(codex, trimestres) {
    const catalogue = {};
    for (const type of TYPES) catalogue[type] = new Map();

    const enregistrer = (type, item, collection) => {
        if (!item || !item.id) return;
        const m = catalogue[type];
        const rec = m.get(item.id) || { collections: [], defs: {} };
        if (!rec.collections.includes(collection)) rec.collections.push(collection);
        rec.defs[collection] = JSON.stringify(item);
        rec.nom = rec.nom || item.nom || item.titre || null;
        m.set(item.id, rec);
    };

    for (const type of TYPES) {
        const col = MODELES[type].collection;
        if (!col) continue; // cartouches : traitées à part ci-dessous
        for (const item of (codex[col] || [])) enregistrer(type, item, col);
        for (const t of trimestres) {
            for (const item of (codex[t + '_' + col] || [])) enregistrer(type, item, t + '_' + col);
        }
    }

    // Cartouches : éparpillées sous cartouches_<grilleId> et <trim>_cartouches_<grilleId>.
    for (const k of Object.keys(codex)) {
        if (/(^|_)cartouches_/.test(k) && Array.isArray(codex[k])) {
            for (const item of codex[k]) enregistrer('cartouche', item, k);
        }
    }
    return catalogue;
}

function categoriser(usage, catalogue) {
    const r = {};
    for (const type of TYPES) {
        const partages = [], orphelins = [], reserves = [], divergences = [];
        const usageType = usage[type];
        const catType = catalogue[type];

        for (const [id, u] of Object.entries(usageType)) {
            const trims = Object.keys(u);
            const present = catType.has(id);
            if (trims.length > 1) partages.push({ id, usage: u, nom: present ? catType.get(id).nom : null });
            if (!present) orphelins.push({ id, usage: u });
        }
        for (const [id, rec] of catType.entries()) {
            const utilise = !!usageType[id];
            if (!utilise) reserves.push({ id, nom: rec.nom, collections: rec.collections });
            if (rec.collections.length > 1) {
                const defsUniques = new Set(Object.values(rec.defs));
                if (defsUniques.size > 1) divergences.push({ id, nom: rec.nom, collections: rec.collections });
            }
        }
        r[type] = { partages, orphelins, reserves, divergences };
    }
    return r;
}

// Plan de copie : par trimestre, combien de modèles utilisés ET présents au
// catalogue seraient copiés vers <trim>_<collection>.
function planCopie(usage, catalogue, trimestres) {
    const plan = {};
    for (const t of trimestres) {
        plan[t] = {};
        for (const type of TYPES) {
            let n = 0;
            for (const [id, u] of Object.entries(usage[type])) {
                if (u[t] && catalogue[type].has(id)) n++;
            }
            plan[t][type] = n;
        }
    }
    return plan;
}

function afficher(codex, args) {
    const trimestres = detecterTrimestres(codex);
    const usage = cartographierUsage(codex, trimestres);
    const catalogue = cartographierCatalogue(codex, trimestres);
    const cat = categoriser(usage, catalogue);
    const plan = planCopie(usage, catalogue, trimestres);

    console.log('');
    console.log('DRY-RUN MIGRATION MODÈLES — codex ' + trimestres.join(', ') + ' · LECTURE SEULE (aucune écriture)');
    console.log('Sources d\'usage : évaluations + productions (réconciliées).');

    console.log('');
    console.log('── PLAN DE COPIE PAR TRIMESTRE (utilisés ET présents au catalogue → <trim>_*) ──');
    for (const t of trimestres) {
        const p = plan[t];
        console.log('  ' + t + ' : ' + TYPES.map(ty => MODELES[ty].label + 's=' + p[ty]).join('  '));
    }

    let totaux = { partages: 0, orphelins: 0, reserves: 0, divergences: 0 };
    const bloc = (titre, cle, format) => {
        console.log('');
        console.log('── ' + titre + ' ──');
        let vide = true;
        for (const type of TYPES) {
            for (const item of cat[type][cle]) {
                console.log('  [' + MODELES[type].label + '] ' + format(item));
                vide = false;
                totaux[cle]++;
            }
        }
        if (vide) console.log('  (aucun)');
    };

    bloc('PARTAGÉS ENTRE TRIMESTRES (cause du L2 rouge, à isoler)', 'partages',
        i => i.id + (i.nom ? ' (' + i.nom + ')' : '') + '  usage ' + JSON.stringify(i.usage));
    bloc('ORPHELINS (référencés mais absents du catalogue — risque de perte)', 'orphelins',
        i => i.id + '  référencé par ' + JSON.stringify(i.usage) + ' · ABSENT du catalogue');
    bloc('EN RÉSERVE (au catalogue, utilisés par aucun trimestre — trou §4-pt7)', 'reserves',
        i => i.id + (i.nom ? ' (' + i.nom + ')' : '') + '  présent: ' + i.collections.join(', '));
    bloc('DIVERGENCES DE DÉFINITION (même id, contenu différent selon collection — D-D6)', 'divergences',
        i => i.id + (i.nom ? ' (' + i.nom + ')' : '') + '  diverge entre: ' + i.collections.join(', '));

    if (args.verbeux) {
        console.log('');
        console.log('── USAGE DÉTAILLÉ (--verbeux) ──');
        for (const type of TYPES) {
            console.log('  ' + MODELES[type].label.toUpperCase() + 'S :');
            for (const [id, u] of Object.entries(usage[type])) console.log('     ' + id + '  ' + JSON.stringify(u));
        }
    }

    console.log('');
    console.log('RÉSUMÉ : ' + totaux.partages + ' partagé(s) · ' + totaux.orphelins + ' orphelin(s) · ' +
        totaux.reserves + ' en réserve · ' + totaux.divergences + ' divergence(s).');
    console.log('LECTURE SEULE — aucune donnée modifiée. Décision D-D1 (mécanique) et §4-pt7 (réserves) restent à trancher.');
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
    afficher(codex, args);
    process.exit(0);
}

main();
