#!/usr/bin/env node
/**
 * scripts/valider-golden-master-trimestre.mjs
 *
 * L0 — PLAN-restauration-longitudinale-A25.md (lot « Cadre & golden master »).
 *
 * Recalcule la note finale de chaque élève d'un trimestre AVEC LE VRAI MOTEUR
 * de l'app (`calculerDetailsNoteFinale`, js/profil-etudiant-actions.js), chargé
 * hors navigateur via le sandbox des tests (`chargerScript`), puis la réconcilie
 * à deux oracles. C'est un golden master : il fige le résultat attendu et
 * ROUGIT si une note bouge.
 *
 * Deux faces de réconciliation (PLAN §0 / §2 / §8.1) :
 *   1. « Note finale conforme » (les 30 élèves du CSV de reconstruction) — le
 *      moteur DOIT la reproduire (écart attendu ~0). C'est le test du moteur SUR
 *      LE CODEX : si le codex contient bien les données de la reconstruction, la
 *      note ressort identique. Un écart = le codex (ou le moteur) a dérivé.
 *   2. « Omnivox » (les 30 élèves, depuis le bulletin HTML) — fidélité externe :
 *      MAE < seuil sur la MOYENNE. Écart individuel max connu : ~1,4 sur un artefact
 *      à français algorithmique — toléré, pas une régression (§8.1).
 *
 * Ce script EST le « break-test moteur sur le codex » que le plan §8.1 annonce
 * comme restant à confirmer (la MAE 0,203 avait été mesurée contre les notes
 * « conformes », pas encore par recalcul moteur). Réutilisable par L1–L7 : tout
 * lot qui touche au codex doit le laisser VERT.
 *
 * FIDÉLITÉ : le cœur du calcul (sélection des N meilleurs, plafond de
 * conformité, agrégation portfolio/terminale) est exécuté depuis le vrai
 * module — rien n'est ré-implémenté ici. Seule la résolution « quelle pratique
 * est active » est fournie par des adaptateurs, et elle l'est À PARTIR de la
 * vraie config stockée dans le codex (pratiquesConfigurables du trimestre).
 *
 * PÉRIMÈTRE (cf. plan §8.4) : L0 agrège les `noteFinale` d'artefact STOCKÉES
 * (notes « posées »). Il ne recalcule pas les notes d'artefact depuis les
 * grilles/critères — ça, c'est la « recréation propre » (L2/L3). L0 sert
 * d'oracle de validation à cette recréation.
 *
 * SÉCURITÉ DES DONNÉES : le codex est lu en mémoire, jamais réécrit. Aucun
 * chemin personnel n'est codé en dur (les chemins sont des arguments).
 *
 * Usage :
 *   node scripts/valider-golden-master-trimestre.mjs \
 *     --codex "<…/donnees.json>" \
 *     --reference "<…/resultats-conformes-A25.csv>" \
 *     --omnivox "<…/groupe-00001.xls (HTML Omnivox, 30 él.)>"
 *
 * Options :
 *   --reference <csv>       CSV de reconstruction (« Note finale conforme » +
 *                           noms) — oracle de REPRODUCTION du moteur. Requis SAUF
 *                           si --omnivox est fourni (mode Omnivox-seul, ci-dessous).
 *   --omnivox <xls-html>    bulletin Omnivox (HTML ; col. « Moyenne actuelle »
 *                           X.X/100) — oracle de FIDÉLITÉ. RÉPÉTABLE (un fichier
 *                           par groupe ; les DA sont fusionnés). À défaut de
 *                           --reference, ces bulletins deviennent l'UNIQUE oracle :
 *                           la « ref » est synthétisée depuis eux (noms tirés de
 *                           <trim>_groupeEtudiants, « conforme » sans objet, verdict
 *                           porté sur la MAE Omnivox). Utile pour un trimestre sans
 *                           CSV de reconstruction (ex. h2026, 2 groupes).
 *   --trimestre <prefixe>   préfixe namespacé du trimestre (défaut: a2025)
 *   --seuil <n>             seuil MAE vs Omnivox (défaut: 0.5)
 *   --epsilon <n>           tolérance moteur vs « conforme » (défaut: 0.1)
 *   --prouver-rougit        vérification adverse : injecte un écart connu et
 *                           exige que le verdict bascule de VERT à ROUGE
 *   --verbeux               affiche toutes les lignes (sinon seulement le résumé
 *                           et les lignes hors tolérance)
 *   --nominatif             🆕 #356 : affiche les vrais noms et DA. PAR DÉFAUT la
 *                           sortie est ANONYMISÉE (pseudonymes stables Élève-NNN
 *                           + DA masqué « …483 ») — posture Loi 25 : un rapport
 *                           collé dans une session/un ticket ne fuit rien.
 *
 * Codes de sortie : 0 = vert (ou rougissement prouvé) · 1 = rouge ·
 *                   2 = erreur d'exécution / harnais défaillant.
 */

import { readFileSync } from 'node:fs';
import { chargerScript } from '../tests/unit/_helpers/charger-script.js';

// ────────────────────────────────────────────────────────────────────────────
// 1. Arguments
// ────────────────────────────────────────────────────────────────────────────
function lireArgs(argv) {
    const a = { trimestre: 'a2025', seuil: 0.5, epsilon: 0.1, prouverRougit: false, verbeux: false, nominatif: false, omnivox: [] };
    for (let i = 2; i < argv.length; i++) {
        const t = argv[i];
        if (t === '--codex') a.codex = argv[++i];
        else if (t === '--reference') a.reference = argv[++i];
        else if (t === '--omnivox') a.omnivox.push(argv[++i]); // répétable (un par groupe)
        else if (t === '--trimestre') a.trimestre = argv[++i];
        else if (t === '--seuil') a.seuil = parseFloat(argv[++i]);
        else if (t === '--epsilon') a.epsilon = parseFloat(argv[++i]);
        else if (t === '--prouver-rougit') a.prouverRougit = true;
        else if (t === '--verbeux') a.verbeux = true;
        else if (t === '--nominatif') a.nominatif = true; // 🆕 #356 : opt-in explicite
        else { console.error('Argument inconnu : ' + t); process.exit(2); }
    }
    // Au moins un oracle : CSV de reconstruction OU bulletin(s) Omnivox.
    if (!a.codex || (!a.reference && a.omnivox.length === 0)) {
        console.error('Usage : --codex <donnees.json> (--reference <conforme.csv> | --omnivox <bulletin.xls> [--omnivox ...]) [--trimestre a2025] [--seuil 0.5] [--epsilon 0.1] [--prouver-rougit] [--verbeux]');
        process.exit(2);
    }
    return a;
}

// ────────────────────────────────────────────────────────────────────────────
// 2. CSV de reconstruction (séparateur « ; », décimales « . »)
//    Colonnes : DA;Groupe;Nom;Note finale conforme;Portfolio (4 meill.);
//               Analyse finale;Remises;Plafonné complétion;Note Omnivox;Écart
// ────────────────────────────────────────────────────────────────────────────
function parserCsvReference(texte) {
    const lignes = texte.split(/\r?\n/).filter(l => l.trim() !== '');
    const ref = new Map(); // DA (string) -> { nom, conforme, portfolio, analyse, remises, omnivox }
    const nombre = (s) => { const v = parseFloat((s || '').replace(',', '.')); return Number.isFinite(v) ? v : null; };
    for (let i = 1; i < lignes.length; i++) { // saute l'en-tête
        const c = lignes[i].split(';');
        const da = (c[0] || '').trim();
        if (!da) continue;
        ref.set(da, {
            nom: (c[2] || '').trim(),
            conforme: nombre(c[3]),
            portfolio: nombre(c[4]),
            analyse: nombre(c[5]),
            remises: (c[6] || '').trim(),
            omnivox: nombre(c[8]) // sous-ensemble (repli si --omnivox absent)
        });
    }
    return ref;
}

// ────────────────────────────────────────────────────────────────────────────
// 2 bis. Bulletin Omnivox — fichier « .xls » qui est en réalité du HTML, encodé
//    latin1 (cf. plan §8.1). Oracle de fidélité sur les 30 élèves. Colonne utile
//    = « Moyenne actuelle » au format « XX.X/100 » (décimale ; PAS « Résultat
//    final » qui est arrondi à l'entier). Une ligne = un élève dès que sa 1re
//    cellule porte un DA (≥ 6 chiffres) — ce qui exclut en-têtes et pieds.
// ────────────────────────────────────────────────────────────────────────────
function parserOmnivoxXls(html) {
    const lignes = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    const cellulesDe = (row) => (row.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || [])
        .map(c => c.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim());
    const omni = new Map(); // DA (string) -> note décimale /100
    for (const row of lignes) {
        const c = cellulesDe(row);
        if (!c.length) continue;
        const mDA = (c[0] || '').match(/(\d{6,})/); // DA = 1re cellule, ≥ 6 chiffres
        if (!mDA) continue;
        let note = null;
        for (const cell of c) {
            const m = cell.match(/^(\d+(?:\.\d+)?)\/100\b/); // « 73.2/100 »
            if (m) { note = parseFloat(m[1]); break; }
        }
        if (note != null) omni.set(mDA[1], note);
    }
    return omni;
}

// ────────────────────────────────────────────────────────────────────────────
// 2 ter. Mode Omnivox-seul (trimestre sans CSV de reconstruction).
//    Noms lisibles DA -> « Prénom Nom » depuis <trim>_groupeEtudiants, et « ref »
//    synthétique dont l'UNIQUE oracle est Omnivox (conforme = null → la face
//    « reproduction » est sans objet, le verdict porte sur la MAE Omnivox).
// ────────────────────────────────────────────────────────────────────────────
function indexerNoms(codex, prefixe) {
    const noms = new Map();
    for (const e of (codex[prefixe + '_groupeEtudiants'] || [])) {
        const da = String((e && (e.da ?? e.numeroDA ?? e.DA)) || '').trim();
        if (!da) continue;
        noms.set(da, [e.prenom, e.nom].filter(Boolean).join(' ').trim() || null);
    }
    return noms;
}

function refDepuisOmnivox(omnivox30, noms) {
    const ref = new Map();
    for (const [da, note] of omnivox30) {
        ref.set(da, { nom: noms.get(da) || null, conforme: null, portfolio: null, analyse: null, remises: '', omnivox: note });
    }
    return ref;
}

// ────────────────────────────────────────────────────────────────────────────
// 3. Store du trimestre — extrait les clés namespacées utiles du codex.
//    `portfoliosEleves` (array indexé par DA, très creux) est ignoré : le
//    moteur ne le lit pas et il pèse l'essentiel des dizaines de Mo du codex.
// ────────────────────────────────────────────────────────────────────────────
function extraireStoreTrimestre(codex, prefixe) {
    const store = {};
    const re = new RegExp('^' + prefixe + '_');
    for (const k of Object.keys(codex)) {
        if (!re.test(k)) continue;
        if (k === prefixe + '_portfoliosEleves') continue;
        store[k] = codex[k];
    }
    return store;
}

// Index DA (string) -> valeur DA telle que stockée (number ou string), pour que
// la comparaison stricte `e.etudiantDA === da` du moteur matche.
function indexerDA(evaluations) {
    const idx = new Map();
    for (const e of evaluations || []) {
        if (e && e.etudiantDA != null) idx.set(String(e.etudiantDA), e.etudiantDA);
    }
    return idx;
}

// ────────────────────────────────────────────────────────────────────────────
// 4. Monte le vrai moteur dans un sandbox Node, avec adaptateurs de résolution.
// ────────────────────────────────────────────────────────────────────────────
function monterMoteur(store, prefixe) {
    const groupesCours = store[prefixe + '_groupesCours'] || [];
    const pratiques = store[prefixe + '_pratiquesConfigurables'] || [];
    const pratiqueId = groupesCours[0] && groupesCours[0].pratiqueId;
    const pratique = pratiques.find(p => p.id === pratiqueId) || null;
    if (!pratique) {
        throw new Error('Pratique active introuvable (groupe-cours[0].pratiqueId="' + pratiqueId +
            '" absent de ' + prefixe + '_pratiquesConfigurables).');
    }
    const configuration = pratique.configuration || {};
    // Famille canonique : MIROIR de TABLE_NORMALISATION_PRATIQUE (js/pratiques/
    // pratique-registre.js — SSOT). Le moteur teste `obtenirTypePratiqueActive()
    // === 'standards'` (profil-etudiant-actions.js:427) ; or un trimestre peut
    // stocker le type legacy 'pan-standards' (cas h2026) qu'il faut folder en
    // 'standards' comme le fait normaliserIdPratique() dans l'app. Sans ce fold,
    // h2026 retournait null pour tous les élèves (faux « non calculé »).
    const NORM_FAMILLE = {
        'alternative': 'standards', 'pan-maitrise': 'standards', 'pan-maitrise-json': 'standards',
        'pan-standards': 'standards', 'pan-objectifs': 'standards',
        'pan-specifications': 'specifications', 'pan-denotation': 'denotation'
    };
    const familleBrute = configuration.type || pratique.type || 'standards';
    const famille = NORM_FAMILLE[familleBrute] || familleBrute;

    // db : lit le store namespacé. cle() préfixe par le trimestre.
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async () => null, set: async () => {}
    };
    const cle = (k) => prefixe + '_' + k;

    // Adaptateurs de résolution — fournissent ce que l'app lirait du contexte
    // d'exécution (mode actif, groupe-cours actif). Ils délèguent à la VRAIE
    // config stockée : ils ne fabriquent aucun chiffre de calcul.
    const globaux = {
        db,
        cle,
        obtenirDonneesSelonMode: (k) => store[prefixe + '_' + k] || [],
        obtenirTypePratiqueActive: () => famille,
        // Lots N1a / N1b (21 sept. 2026) : le chemin riche lit LA désignation de la pratique active
        // (`designerPratiqueActive`, pratique-registre.js), plus le pointeur ni le type. Même adaptateur :
        // la vraie pratique stockée, aucune valeur fabriquée.
        designerPratiqueActive: () => ({ etat: pratiqueId ? 'ok' : 'aucune', idBrut: pratiqueId, id: pratiqueId,
            donnees: pratiqueId ? { id: pratiqueId, configuration } : null, famille }),
        trouverPratiqueEnBibliotheque: (id) => (id === pratiqueId ? { id: pratiqueId, configuration } : null),
        obtenirConfigPratiqueActive: () => configuration
    };

    const win = chargerScript('js/profil-etudiant-actions.js', globaux, {});
    if (typeof win.calculerDetailsNoteFinale !== 'function') {
        throw new Error('calculerDetailsNoteFinale non exposée après chargement du module.');
    }
    return { win, pratiqueId, famille };
}

// ────────────────────────────────────────────────────────────────────────────
// 5. Évaluation : recalcule chaque élève et réconcilie.
//    omnivox30 : Map DA -> note (bulletin) ; si absente, repli sur la colonne
//    Omnivox du CSV de reconstruction (sous-ensemble).
// ────────────────────────────────────────────────────────────────────────────
function evaluer(store, prefixe, ref, omnivox30 = null) {
    const { win, pratiqueId, famille } = monterMoteur(store, prefixe);
    const idxDA = indexerDA(store[prefixe + '_evaluationsSauvegardees']);

    const lignes = [];
    for (const [da, attendu] of ref) {
        const daStocke = idxDA.has(da) ? idxDA.get(da) : da;
        let res, erreur = null;
        try {
            res = win.calculerDetailsNoteFinale(daStocke);
        } catch (e) {
            erreur = e.message;
        }
        const noteMoteur = (res && !res.erreur && res.noteFinale != null) ? Number(res.noteFinale) : null;
        const portfolioMoteur = (res && res.portfolio && res.portfolio.moyenne != null) ? Number(res.portfolio.moyenne) : null;
        const terminalMoteur = (res && res.terminal && res.terminal.note != null) ? Number(res.terminal.note) : null;
        const omnivoxVal = (omnivox30 && omnivox30.has(da)) ? omnivox30.get(da) : attendu.omnivox;
        lignes.push({
            da, nom: attendu.nom, remises: attendu.remises,
            noteMoteur, portfolioMoteur, terminalMoteur,
            conforme: attendu.conforme, portfolio: attendu.portfolio, analyse: attendu.analyse,
            omnivox: omnivoxVal,
            erreur: erreur || (res && res.erreur) || null,
            dConforme: (noteMoteur != null && attendu.conforme != null) ? Math.abs(noteMoteur - attendu.conforme) : null,
            dOmnivox: (noteMoteur != null && omnivoxVal != null) ? Math.abs(noteMoteur - omnivoxVal) : null
        });
    }

    const moy = (arr) => arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null;
    const max = (arr) => arr.length ? Math.max(...arr) : null;
    const ecartsConf = lignes.map(l => l.dConforme).filter(x => x != null);
    const ecartsOmni = lignes.map(l => l.dOmnivox).filter(x => x != null);
    const lignesOmni = lignes.filter(l => l.dOmnivox != null);
    const pireOmni = lignesOmni.length ? lignesOmni.reduce((a, b) => (b.dOmnivox > a.dOmnivox ? b : a)) : null;

    return {
        pratiqueId, famille, lignes,
        nbEleves: lignes.length,
        nbNonCalcule: lignes.filter(l => l.noteMoteur == null).length,
        maeConforme: moy(ecartsConf), maxConforme: max(ecartsConf), nbAvecConforme: ecartsConf.length,
        maeOmnivox: moy(ecartsOmni), maxOmnivox: max(ecartsOmni), nbAvecOmnivox: ecartsOmni.length,
        pireOmni, sourceOmnivox: (omnivox30 ? 'bulletin' : 'CSV')
    };
}

// ────────────────────────────────────────────────────────────────────────────
// 6. Verdict + rapport
// ────────────────────────────────────────────────────────────────────────────
// Oracle du verdict = Omnivox (PLAN §2 : « Omnivox = golden master » ; la
// reconstruction « conforme » est une source SECONDAIRE). Quand Omnivox est
// disponible, le verdict porte sur sa MAE, et les écarts « conforme » deviennent
// un DIAGNOSTIC non bloquant (ils signalent des valeurs CSV à regénérer, pas une
// dérive du codex). Sans aucune référence Omnivox, on retombe sur « conforme ».
function verdict(r, args) {
    const raisons = [];
    if (r.nbNonCalcule > 0) raisons.push(r.nbNonCalcule + ' élève(s) non calculé(s)');
    const horsTol = r.lignes.filter(l => l.dConforme != null && l.dConforme > args.epsilon);
    if (r.nbAvecOmnivox > 0) {
        if (r.maeOmnivox >= args.seuil) raisons.push('MAE Omnivox ' + r.maeOmnivox.toFixed(3) + ' ≥ seuil ' + args.seuil);
    } else if (horsTol.length > 0) {
        raisons.push(horsTol.length + ' élève(s) hors tolérance « conforme » (>' + args.epsilon + ', aucune réf Omnivox)');
    }
    return { vert: raisons.length === 0, raisons, horsTol, oracleOmnivox: r.nbAvecOmnivox > 0 };
}

function f(n, d = 1) { return n == null ? '—' : Number(n).toFixed(d); }

// ────────────────────────────────────────────────────────────────────────────
// 6 bis. 🆕 #356 — anonymisation de la SORTIE (posture Loi 25).
//    Par défaut, aucun nom ni DA complet n'est imprimé : pseudonymes stables
//    « Élève-NNN » (ordre des DA triés — stable d'une exécution à l'autre pour
//    une même cohorte) et DA masqué « …483 » (3 derniers chiffres, assez pour
//    retrouver l'élève localement, pas pour l'identifier hors contexte).
//    Les vrais noms/DA ne sortent qu'avec --nominatif (opt-in explicite).
//    NB : conformément à SKILL_Securite_donnees §9.3, on n'imprime jamais un
//    hash de DA (réversible par force brute) — on masque.
// ────────────────────────────────────────────────────────────────────────────
function construirePseudonymes(lignes) {
    const das = lignes.map(l => String(l.da)).sort();
    const map = new Map();
    das.forEach((da, i) => map.set(da, 'Élève-' + String(i + 1).padStart(3, '0')));
    return map;
}

function afficherRapport(r, v, args) {
    const pad = (s, n) => String(s).padEnd(n);
    const padL = (s, n) => String(s).padStart(n);
    const pseudo = construirePseudonymes(r.lignes);
    const nomAff = (l) => args.nominatif ? (l.nom || '') : (pseudo.get(String(l.da)) || 'Élève-???');
    const daAff = (l) => {
        const s = String(l.da);
        return args.nominatif ? s : (s.length > 3 ? '…' + s.slice(-3) : s);
    };
    console.log('');
    console.log('GOLDEN MASTER — trimestre ' + args.trimestre + ' · pratique ' + r.pratiqueId + ' (' + r.famille + ')');
    if (!args.nominatif) {
        console.log('(sortie anonymisée — pseudonymes stables + DA masqués ; --nominatif pour les vrais noms)');
    }
    console.log('');
    const aMontrer = args.verbeux ? r.lignes : r.lignes.filter(l => l.noteMoteur == null || (l.dConforme != null && l.dConforme > args.epsilon));
    if (aMontrer.length) {
        console.log(pad('DA', 9) + pad('Nom', 30) + padL('Moteur', 8) + padL('Conf.', 8) + padL('ΔConf', 8) + padL('Omni', 8) + padL('ΔOmni', 8));
        console.log('─'.repeat(79));
        for (const l of aMontrer) {
            if (l.noteMoteur == null) {
                console.log(pad(daAff(l), 9) + pad(nomAff(l).slice(0, 28), 30) + padL('NON CALCULÉ', 32) + '  ' + (l.erreur || ''));
            } else {
                console.log(
                    pad(daAff(l), 9) + pad(nomAff(l).slice(0, 28), 30) +
                    padL(f(l.noteMoteur), 8) + padL(f(l.conforme), 8) + padL(f(l.dConforme, 2), 8) +
                    padL(f(l.omnivox), 8) + padL(f(l.dOmnivox, 2), 8)
                );
            }
        }
        console.log('');
    } else {
        console.log('(toutes les lignes dans la tolérance — utiliser --verbeux pour le détail)');
        console.log('');
    }
    console.log('Reproduction « conforme »  : MAE ' + f(r.maeConforme, 3) + ' · max ' + f(r.maxConforme, 2) +
        ' · ' + (r.nbAvecConforme - v.horsTol.length) + '/' + r.nbAvecConforme + ' dans la tolérance (ε=' + args.epsilon + ')');
    console.log('Fidélité Omnivox (' + r.nbAvecOmnivox + ' él. · ' + r.sourceOmnivox + ') : MAE ' + f(r.maeOmnivox, 3) +
        ' · max ' + f(r.maxOmnivox, 2) + (r.pireOmni ? ' [' + nomAff(r.pireOmni) + ']' : '') + ' · seuil ' + args.seuil);
    console.log('Élèves recalculés          : ' + (r.nbEleves - r.nbNonCalcule) + '/' + r.nbEleves);
    if (v.oracleOmnivox && v.horsTol.length > 0) {
        console.log('');
        console.log('⚠ Diagnostic (non bloquant) — ' + v.horsTol.length + ' valeur(s) « conforme » du CSV divergent du codex');
        console.log('  (le codex fait foi car il colle à Omnivox ; ces valeurs de la reconstruction sont à regénérer) :');
        for (const l of v.horsTol) {
            console.log('    · ' + nomAff(l) + ' : conforme ' + f(l.conforme) + ' vs moteur ' + f(l.noteMoteur) +
                ' (Δ ' + f(l.dConforme, 2) + ') · Omnivox ' + f(l.omnivox) + ' (Δ ' + f(l.dOmnivox, 2) + ')');
        }
    }
    console.log('');
    console.log('VERDICT : ' + (v.vert ? '✅ VERT' : '❌ ROUGE — ' + v.raisons.join(' ; ')));
}

// ────────────────────────────────────────────────────────────────────────────
// 7. Vérification adverse : injecte un écart connu et exige que ça rougisse.
//    Perturbe la note finale du 1er artefact évalué de chaque élève (+15) :
//    si le golden master reste VERT malgré ça, la détection est cassée.
// ────────────────────────────────────────────────────────────────────────────
function perturberStore(store, prefixe) {
    const copie = JSON.parse(JSON.stringify(store));
    const evals = copie[prefixe + '_evaluationsSauvegardees'] || [];
    const productions = copie[prefixe + '_productions'] || [];
    const idsArtefacts = new Set(productions.filter(p => p.type === 'artefact-portfolio').map(p => p.id));
    const vus = new Set();
    for (const e of evals) {
        if (!idsArtefacts.has(e.productionId)) continue;
        if (vus.has(e.etudiantDA)) continue; // un seul artefact perturbé par élève
        if (typeof e.noteFinale === 'number') { e.noteFinale = Math.min(100, e.noteFinale + 15); vus.add(e.etudiantDA); }
    }
    return copie;
}

// ────────────────────────────────────────────────────────────────────────────
// main
// ────────────────────────────────────────────────────────────────────────────
function main() {
    const args = lireArgs(process.argv);
    let codex, omnivox30 = null, ref;
    try {
        codex = JSON.parse(readFileSync(args.codex, 'utf8'));
        if (args.omnivox.length) {
            omnivox30 = new Map(); // fusion des bulletins (un par groupe), DA -> note
            for (const f of args.omnivox) {
                for (const [da, note] of parserOmnivoxXls(readFileSync(f, 'latin1'))) omnivox30.set(da, note);
            }
        }
        ref = args.reference
            ? parserCsvReference(readFileSync(args.reference, 'utf8'))
            : refDepuisOmnivox(omnivox30, indexerNoms(codex, args.trimestre)); // mode Omnivox-seul
    } catch (e) {
        console.error('Lecture impossible : ' + e.message);
        process.exit(2);
    }
    const store = extraireStoreTrimestre(codex, args.trimestre);

    let r, v;
    try {
        r = evaluer(store, args.trimestre, ref, omnivox30);
    } catch (e) {
        console.error('Échec du harnais : ' + e.message);
        process.exit(2);
    }
    v = verdict(r, args);
    afficherRapport(r, v, args);

    if (args.prouverRougit) {
        console.log('');
        console.log('── Vérification adverse (--prouver-rougit) ──');
        if (!v.vert) {
            console.log('⚠ Le golden master est déjà ROUGE sans perturbation : la preuve « sait rougir » est sans objet ici (corriger d\'abord le vert).');
            process.exit(1);
        }
        let rp;
        try {
            rp = evaluer(perturberStore(store, args.trimestre), args.trimestre, ref, omnivox30);
        } catch (e) {
            console.error('Échec du harnais (passe adverse) : ' + e.message);
            process.exit(2);
        }
        const vp = verdict(rp, args);
        console.log('Perturbation : +15 sur la note finale d\'un artefact par élève.');
        console.log('Résultat perturbé : ' + (vp.vert ? '✅ VERT' : '❌ ROUGE') + ' (MAE Omnivox ' + f(rp.maeOmnivox, 3) + ', conforme ' + f(rp.maeConforme, 3) + ')');
        if (vp.vert) {
            console.log('❌ HARNAIS DÉFAILLANT : une dérive injectée n\'a PAS fait rougir le golden master.');
            process.exit(2);
        }
        console.log('✅ ROUGISSEMENT PROUVÉ : vert sans perturbation, rouge avec. Le golden master détecte une dérive.');
        process.exit(0);
    }

    process.exit(v.vert ? 0 : 1);
}

main();
