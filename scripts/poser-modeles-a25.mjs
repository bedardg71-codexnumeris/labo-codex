#!/usr/bin/env node
/**
 * scripts/poser-modeles-a25.mjs
 *
 * PILOTE A25 — PLAN-namespacing-par-trimestre.md §4.1 (« Intégrer les modèles A25 »).
 *
 * Pose les copies namespacées `a2025_grillesTemplates` et `a2025_echellesTemplates`
 * dans le codex, pour que les écrans (branchés sur cle() par la Brique A) RÉSOLVENT
 * les modèles A25 au lieu de tomber en repli sur le global H26 (cause de #348 « grille
 * introuvable » et #349 composante 2 « échelle vide »).
 *
 * POURQUOI ces clés sont absentes : à l'archivage d'A25, le mécanisme de snapshot
 * (`creerSnapshotRessources`, trimestres.js) était dormant ; depuis, le global
 * `grillesTemplates`/`echellesTemplates` a été rafraîchi en H26 → les définitions A25
 * (ids `GRILLE1759243306842`, `GRILLE1759264206489`, échelles `ECH...`) ont disparu.
 * Les 305 évals A25 les référencent encore. On reconstruit les templates A25 :
 *
 *   GRILLES (source = backup 4 février, critereId IDENTIQUES aux évals — vérifié) :
 *     · GRILLE1759243306842  FR-HOLIS  (121 évals) — copie directe
 *     · GRILLE1759264206489  Grille-4  (118 évals) — copie directe
 *     · GRILLE1759529438501  FR-ALGO   (66 évals)  — copiée sous le NOUVEL id
 *       GRILLE_A2025_FR_ALGO (les évals ont été re-pointées le 23 juin, script
 *       restaurer-isoler-cartouches-A25.mjs, pour isoler la grille partagée avec H26).
 *
 *   ÉCHELLES (source = pratique-A2025-reconstituee.json, fournie par Grégoire) :
 *     · ECH1759264511178  « IDME et niv 0 » (235 évals) — échelle A25 de référence,
 *       convertie au format template (code/nom/min/max/valeurCalcul/couleur). min/max
 *       et couleurs empruntés à l'échelle descendante « IDME0 - H26 » (1767389426695).
 *     · ECH1762273745231  (70 évals) — 2e échelle A25, AUCUNE définition d'origine
 *       retrouvée (ni codex, ni backup). Reconstituée comme COPIE de ECH1759264511178
 *       (même schéma de codes 0/I/D/M/E ; les 70 évals n'utilisent que {I,D,M,E}).
 *       ⚠ POINT DE JUGEMENT — à confirmer par Grégoire.
 *
 * NOTE-NEUTRE : le calcul (calculerDetailsNoteFinale) lit les évals (niveauSelectionne
 * + ponderation snapshotés) et la pratique active (pan-litterature-a2025, qui embarque
 * sa propre conversion niveau→%). Il ne lit PAS echellesTemplates. Donc poser ces
 * templates n'affecte AUCUNE note → le golden master L0 doit rester VERT (à prouver).
 *
 * SÉCURITÉ DES DONNÉES : lit codex + backup + pratique, écrit un NOUVEAU fichier.
 * L'original n'est JAMAIS modifié. Aucun chemin personnel codé en dur (arguments).
 * Refuse d'écraser des clés a2025_*Templates déjà présentes (garde-fou).
 *
 * Usage :
 *   node scripts/poser-modeles-a25.mjs \
 *     --codex    "<donnees.json actuel>" \
 *     --backup   "<sauvegarde-…-2026-02-04-…json>" \
 *     --pratique "<pratique-A2025-reconstituee.json>" \
 *     --sortie   "<chemin copie de sortie>" [--ecrire] [--verbeux]
 *
 *   (sans --ecrire : DRY-RUN, rapport seulement, aucune écriture.)
 *
 * Codes de sortie : 0 = succès (ou dry-run) · 2 = erreur (source manquante/incohérente).
 */

import { readFileSync, writeFileSync } from 'node:fs';

const TRIMESTRE = 'a2025';

// Grilles A25 : id d'éval -> id source dans le backup (renommage FR-ALGO).
const GRILLES = [
    { evalId: 'GRILLE1759243306842',  backupId: 'GRILLE1759243306842', role: 'FR-HOLIS' },
    { evalId: 'GRILLE1759264206489',  backupId: 'GRILLE1759264206489', role: 'Grille-4' },
    { evalId: 'GRILLE_A2025_FR_ALGO', backupId: 'GRILLE1759529438501', role: 'FR-ALGO'  },
];

// Échelles A25 : id d'éval. La 1re est définie par la pratique ; la 2e en est une copie.
const ECHELLE_REFERENCE = 'ECH1759264511178'; // 235 évals — définie dans la pratique reconstituée
const ECHELLE_COPIE     = 'ECH1762273745231'; // 70 évals  — sans définition d'origine

// min/max/couleur de référence (échelle descendante « IDME0 - H26 »), par code.
const GABARIT_NIVEAUX = {
    '0': { min: 0,  max: 0,   couleur: '#cccccc' },
    'I': { min: 0,  max: 64,  couleur: '#ff6a00' },
    'D': { min: 65, max: 74,  couleur: '#ffb43f' },
    'M': { min: 75, max: 84,  couleur: '#77bb41' },
    'E': { min: 85, max: 100, couleur: '#3a88fe' },
};

// ── Arguments ────────────────────────────────────────────────────────────────
function lireArgs(argv) {
    const a = { ecrire: false, verbeux: false };
    for (let i = 2; i < argv.length; i++) {
        const t = argv[i];
        if (t === '--codex') a.codex = argv[++i];
        else if (t === '--backup') a.backup = argv[++i];
        else if (t === '--pratique') a.pratique = argv[++i];
        else if (t === '--sortie') a.sortie = argv[++i];
        else if (t === '--ecrire') a.ecrire = true;
        else if (t === '--verbeux') a.verbeux = true;
        else { console.error('Argument inconnu : ' + t); process.exit(2); }
    }
    if (!a.codex || !a.backup || !a.pratique) {
        console.error('Usage : --codex <donnees.json> --backup <4fév.json> --pratique <reconstituee.json> [--sortie <out.json> --ecrire] [--verbeux]');
        process.exit(2);
    }
    if (a.ecrire && !a.sortie) { console.error('--ecrire exige --sortie.'); process.exit(2); }
    return a;
}

// Le backup est un dump localStorage : valeurs possiblement double-encodées (string JSON).
function deballer(v) {
    if (typeof v === 'string') { try { return JSON.parse(v); } catch { return v; } }
    return v;
}

// Convertit l'échelle de la pratique (niveaux {code,label,valeur_pourcentage}) au
// format template de l'app (niveaux {code,nom,min,max,valeurCalcul,couleur}).
function echelleDepuisPratique(echPratique, id, nom) {
    const niveaux = (echPratique.niveaux || []).map(n => {
        const g = GABARIT_NIVEAUX[n.code] || { min: 0, max: 100, couleur: '#999999' };
        return {
            code: n.code,
            nom: n.label || n.nom || n.code,
            min: g.min,
            max: g.max,
            valeurCalcul: n.valeur_pourcentage,
            couleur: g.couleur,
        };
    });
    return {
        id,
        nom,
        description: 'Échelle A25 reconstituée (pilote namespacing — PLAN-restauration-longitudinale-A25).',
        niveaux,
        dateCreation: '2025-10-01',
        dansBibliotheque: true,
        verrouille: false,
    };
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
    const args = lireArgs(process.argv);
    let codex, backupRaw, pratique;
    try {
        codex = JSON.parse(readFileSync(args.codex, 'utf8'));
        backupRaw = JSON.parse(readFileSync(args.backup, 'utf8'));
        pratique = JSON.parse(readFileSync(args.pratique, 'utf8'));
    } catch (e) {
        console.error('Lecture impossible : ' + e.message);
        process.exit(2);
    }

    const cleG = `${TRIMESTRE}_grillesTemplates`;
    const cleE = `${TRIMESTRE}_echellesTemplates`;

    // Garde-fou : ne pas écraser des templates A25 déjà posés (observer avant transformer).
    const dejaG = codex[cleG] !== undefined;
    const dejaE = codex[cleE] !== undefined;
    if (dejaG || dejaE) {
        console.error(`⚠ ${cleG}=${dejaG ? 'PRÉSENT' : 'absent'}, ${cleE}=${dejaE ? 'PRÉSENT' : 'absent'} — le pilote suppose ces clés absentes. Abandon (vérifier le codex).`);
        process.exit(2);
    }

    // 1) Grilles depuis le backup
    const grillesBackup = deballer(backupRaw['grillesTemplates']) || [];
    const grillesA25 = [];
    for (const g of GRILLES) {
        const src = grillesBackup.find(x => x.id === g.backupId);
        if (!src) { console.error(`⚠ Grille ${g.backupId} (${g.role}) absente du backup. Abandon.`); process.exit(2); }
        const copie = JSON.parse(JSON.stringify(src));
        if (copie.id !== g.evalId) copie.id = g.evalId; // renommage FR-ALGO
        grillesA25.push(copie);
    }

    // 2) Échelles depuis la pratique reconstituée
    const echPratique = pratique.echelle;
    if (!echPratique || !Array.isArray(echPratique.niveaux)) {
        console.error('⚠ La pratique ne contient pas echelle.niveaux. Abandon.'); process.exit(2);
    }
    if (echPratique.echelle_id !== ECHELLE_REFERENCE) {
        console.error(`⚠ La pratique définit l'échelle ${echPratique.echelle_id}, attendu ${ECHELLE_REFERENCE}. Abandon.`); process.exit(2);
    }
    const echRef = echelleDepuisPratique(echPratique, ECHELLE_REFERENCE, echPratique.echelle_nom || 'IDME et niv 0');
    const echCopie = echelleDepuisPratique(echPratique, ECHELLE_COPIE, (echPratique.echelle_nom || 'IDME et niv 0'));
    const echellesA25 = [echRef, echCopie];

    // 3) Validation de couverture : toute grille/échelle référencée par une éval est posée.
    const evals = codex[`${TRIMESTRE}_evaluationsSauvegardees`] || [];
    const grilleRefs = new Set(evals.map(e => e.grilleId));
    const echelleRefs = new Set(evals.map(e => e.echelleId));
    const grillesPosees = new Set(grillesA25.map(g => g.id));
    const echellesPosees = new Set(echellesA25.map(e => e.id));
    const grilleManquantes = [...grilleRefs].filter(id => id && !grillesPosees.has(id));
    const echelleManquantes = [...echelleRefs].filter(id => id && !echellesPosees.has(id));

    // ── Rapport ────────────────────────────────────────────────────────────────
    console.log('\nPILOTE A25 — pose des modèles namespacés' + (args.ecrire ? '' : '  [DRY-RUN]'));
    console.log('');
    console.log(`${cleG} (${grillesA25.length} grilles) :`);
    for (const g of grillesA25) console.log(`  · ${g.id.padEnd(24)} "${g.nom}" — ${(g.criteres || []).length} critères`);
    console.log(`${cleE} (${echellesA25.length} échelles) :`);
    for (const e of echellesA25) console.log(`  · ${e.id.padEnd(24)} "${e.nom}" — ${e.niveaux.length} niveaux [${e.niveaux.map(n => n.code + ':' + n.valeurCalcul).join(' ')}]`);
    console.log('');
    console.log('Couverture des références d\'éval :');
    console.log(`  grilles référencées ${[...grilleRefs].filter(Boolean).length} → manquantes après pose : ${grilleManquantes.length ? grilleManquantes.join(', ') : 'AUCUNE ✅'}`);
    console.log(`  échelles référencées ${[...echelleRefs].filter(Boolean).length} → manquantes après pose : ${echelleManquantes.length ? echelleManquantes.join(', ') : 'AUCUNE ✅'}`);

    if (grilleManquantes.length || echelleManquantes.length) {
        console.error('\n⚠ Couverture incomplète — des évals resteraient sans modèle. Abandon.');
        process.exit(2);
    }

    // 4) Pose sur une COPIE (jamais l'original).
    codex[cleG] = grillesA25;
    codex[cleE] = echellesA25;

    if (args.ecrire) {
        try {
            writeFileSync(args.sortie, JSON.stringify(codex));
            console.log(`\n✅ Écrit : ${args.sortie}`);
            console.log('   (les évals, productions, notes et la pratique sont INCHANGÉES — seuls ' + cleG + ' et ' + cleE + ' ajoutés.)');
        } catch (e) {
            console.error('Écriture impossible : ' + e.message); process.exit(2);
        }
    } else {
        console.log('\n[DRY-RUN] aucune écriture. Ajouter --sortie <out.json> --ecrire pour produire le codex enrichi.');
    }
    process.exit(0);
}

main();
