#!/usr/bin/env node
/**
 * scripts/audit-attribution-cc.mjs
 *
 * AUDIT #342 — attribution CC erronée sur les pratiques (et tout objet portant
 * metadata_cc.auteur_original). LECTURE SEULE, aucune écriture.
 *
 *   CONTEXTE. La PRÉVENTION #342 est livrée (1.20.0, js/cc-license.js) : on ne
 *   grave plus silencieusement un enseignant arbitraire comme auteur. Avant ce
 *   correctif, `obtenirIdentiteCCUtilisateur()` repliait sur `enseignantsReels[0]`
 *   (le PREMIER enseignant de la liste). C'est ce repli qui a stampé « par Bruno
 *   Voisard » sur une pratique de littérature de Grégoire : à la création
 *   (`creerNouvellePratique`, js/pratiques-gestion.js), `metadata_cc.auteur_original`
 *   a figé ce mauvais auteur. La prévention empêche de NOUVELLES erreurs ; elle ne
 *   RÉPARE PAS les pratiques déjà stampées. Cet outil les LISTE pour revue humaine.
 *
 *   CE QUE FAIT L'OUTIL. Il scanne `pratiquesConfigurables` (forme namespacée
 *   `<trim>_pratiquesConfigurables`, plus le fallback historique
 *   `pratiques_configurations`) et toute autre collection dont les éléments
 *   portent `metadata_cc.auteur_original`. Il signale, SANS rien décider à la
 *   place de Grégoire, les attributions SUSPECTES selon des règles conservatrices
 *   (voir `detecterAttributionSuspecte`), et imprime un PLAN avant/après.
 *
 *   PERSONNE n'est réparé automatiquement. Le « bon » auteur dépend du jugement de
 *   Grégoire (la plupart de ses pratiques devraient porter son identité ; certaines
 *   peuvent légitimement créditer un autre auteur). L'outil propose une CIBLE
 *   suggérée (`--auteur-attendu`, ou l'auteur majoritaire non-suspect observé) mais
 *   ne l'applique pas.
 *
 *   POURQUOI PAS D'ÉCRITURE ICI. Contrairement à reparer-coursid-productions.mjs,
 *   il n'existe pas de signal mécanique « unanime » qui désigne le bon auteur sans
 *   risque : l'attribution est une donnée éditoriale. On expose donc seulement, en
 *   COMMENTAIRE non exécuté (voir bas de fichier), le snippet de réécriture que
 *   Grégoire pourra coller dans la console de l'app APRÈS revue du plan.
 *
 * Usage :
 *   node scripts/audit-attribution-cc.mjs --codex "<donnees.json>" [--verbeux]
 *   node scripts/audit-attribution-cc.mjs --codex "<in.json>" --auteur-attendu "Grégoire Bédard"
 *   node scripts/audit-attribution-cc.mjs --codex "<in.json>" --repli "Bruno Voisard" --repli "Primo Primavera"
 *
 * Codes de sortie : 0 = audit produit · 2 = erreur d'exécution.
 */

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------
// Répli(s) historiques connus. Valeurs d'auteur que la prévention #342 a éliminées
// mais qui ont pu être GRAVÉES avant le correctif. « Inconnu »/« Anonyme »/vide ne
// sont PAS suspects (ce sont les défauts légitimes post-#342) — ils sont traités à
// part comme « manquants », pas comme « erronés ».
const REPLIS_HISTORIQUES_CONNUS = ['Bruno Voisard', 'Primo Primavera'];

// Valeurs d'auteur considérées « non attribuées » (légitimes, pas une erreur).
const VALEURS_NON_ATTRIBUEES = ['', 'inconnu', 'anonyme', 'non spécifié', 'non specifie', 'unknown'];

function normaliser(s) {
    return String(s || '').trim();
}
function normaliserCmp(s) {
    return normaliser(s).toLowerCase();
}

// ---------------------------------------------------------------------------
// CŒUR PUR (testable). Classe un auteur_original observé sur un objet.
//   Rend l'une de : 'suspect-repli' | 'suspect-divergent' | 'non-attribue' | 'ok'
//
//   options = {
//     auteurAttendu : string|null   // identité CC réelle de l'utilisateur (Grégoire)
//     replis        : string[]      // noms-repli historiques connus (case-insensible)
//   }
//
// Règles (conservatrices — on préfère NE PAS signaler en cas de doute) :
//  1. valeur non attribuée (vide/Inconnu/Anonyme...) ⇒ 'non-attribue' (jamais « erroné »)
//  2. auteur ∈ replis historiques ⇒ 'suspect-repli' (cas Bruno Voisard)
//  3. auteurAttendu fourni ET auteur ≠ auteurAttendu (et non couvert ci-dessus)
//        ⇒ 'suspect-divergent' (à confirmer par Grégoire : peut être un auteur légitime)
//  4. sinon ⇒ 'ok'
export function classerAuteur(auteur, options = {}) {
    const valeur = normaliser(auteur);
    const cmp = normaliserCmp(valeur);
    const replis = (options.replis || REPLIS_HISTORIQUES_CONNUS).map(normaliserCmp);
    const attendu = options.auteurAttendu ? normaliserCmp(options.auteurAttendu) : null;

    if (VALEURS_NON_ATTRIBUEES.includes(cmp)) return 'non-attribue';
    if (replis.includes(cmp)) return 'suspect-repli';
    if (attendu && cmp !== attendu) return 'suspect-divergent';
    return 'ok';
}

// Détecte les clés de codex porteuses de pratiques configurables (namespacées +
// fallback historique). N'inclut QUE des clés réellement présentes dans le codex.
export function detecterClesPratiques(codex) {
    const cles = [];
    for (const k of Object.keys(codex)) {
        if (k === 'pratiques_configurations') { cles.push(k); continue; }
        if (/^([ah]\d{4})_pratiquesConfigurables$/.test(k)) cles.push(k);
        else if (k === 'pratiquesConfigurables') cles.push(k); // forme nue (rare)
    }
    return cles.sort();
}

// Détecte TOUTE collection (tableau) dont au moins un élément porte
// metadata_cc.auteur_original — pour couvrir grilles/échelles/cartouches/productions
// au-delà des seules pratiques. Rend les noms de clés.
export function detecterClesPorteusesMetadataCc(codex) {
    const cles = [];
    for (const [k, v] of Object.entries(codex)) {
        if (!Array.isArray(v)) continue;
        const enPorte = v.some(el => el && el.metadata_cc && 'auteur_original' in el.metadata_cc);
        if (enPorte) cles.push(k);
    }
    return cles.sort();
}

// Extrait l'auteur_original d'un élément, en couvrant les variantes observées dans
// cc-license.js (metadata_cc prioritaire, puis metadata, puis champ plat `auteur`).
function lireAuteurOriginal(el) {
    if (!el) return '';
    return normaliser(
        (el.metadata_cc && el.metadata_cc.auteur_original) ||
        (el.metadata && el.metadata.auteur_original) ||
        el.auteur ||
        ''
    );
}

// CŒUR PUR (testable). Construit le plan d'audit sans rien muter.
//   Rend { lignes, clesScannees, auteurMajoritaire }
//   lignes[] = { cle, index, id, nom, auteurActuel, classe, cibleSuggeree }
//
// La cible suggérée = options.auteurAttendu si fourni, sinon l'auteur « ok »
// majoritaire observé (heuristique d'aide à la revue, JAMAIS appliquée).
export function auditerAttributions(codex, options = {}) {
    const clesPratiques = detecterClesPratiques(codex);
    const clesMeta = detecterClesPorteusesMetadataCc(codex);
    // Union ordonnée, sans doublon.
    const clesScannees = [...new Set([...clesPratiques, ...clesMeta])].sort();

    // 1er passage : compter les auteurs « ok » pour déduire un majoritaire.
    const compteOk = new Map();
    for (const k of clesScannees) {
        const liste = Array.isArray(codex[k]) ? codex[k] : [];
        for (const el of liste) {
            const a = lireAuteurOriginal(el);
            if (classerAuteur(a, options) === 'ok') {
                compteOk.set(a, (compteOk.get(a) || 0) + 1);
            }
        }
    }
    let auteurMajoritaire = null;
    let maxN = 0;
    for (const [a, n] of compteOk) {
        if (n > maxN) { maxN = n; auteurMajoritaire = a; }
    }

    const cibleParDefaut = options.auteurAttendu ? normaliser(options.auteurAttendu) : auteurMajoritaire;

    // 2e passage : produire les lignes suspectes/non-attribuées.
    const lignes = [];
    for (const k of clesScannees) {
        const liste = Array.isArray(codex[k]) ? codex[k] : [];
        liste.forEach((el, index) => {
            if (!el) return;
            const auteurActuel = lireAuteurOriginal(el);
            const classe = classerAuteur(auteurActuel, options);
            if (classe === 'ok') return; // rien à signaler
            lignes.push({
                cle: k,
                index,
                id: el.id || '',
                nom: el.nom || el.titre || '',
                auteurActuel,
                classe,
                cibleSuggeree: (classe === 'non-attribue') ? '' : (cibleParDefaut || '')
            });
        });
    }

    return { lignes, clesScannees, auteurMajoritaire };
}

// ---------------------------------------------------------------------------
// CLI
function lireArgs(argv) {
    const a = { verbeux: false, replis: [] };
    for (let i = 2; i < argv.length; i++) {
        const t = argv[i];
        if (t === '--codex') a.codex = argv[++i];
        else if (t === '--auteur-attendu') a.auteurAttendu = argv[++i];
        else if (t === '--repli') a.replis.push(argv[++i]);
        else if (t === '--verbeux') a.verbeux = true;
        else { console.error('Argument inconnu : ' + t); process.exit(2); }
    }
    if (!a.codex) {
        console.error('Usage : --codex <donnees.json> [--auteur-attendu "<Nom>"] [--repli "<Nom>" ...] [--verbeux]');
        process.exit(2);
    }
    return a;
}

const ETIQUETTE = {
    'suspect-repli': 'REPLI HISTORIQUE (#342 — auteur arbitraire gravé avant le correctif)',
    'suspect-divergent': 'DIVERGENT de l\'auteur attendu (à confirmer — peut être légitime)',
    'non-attribue': 'NON ATTRIBUÉ (Inconnu/Anonyme/vide — légitime post-#342, listé pour info)'
};

function main() {
    const args = lireArgs(process.argv);
    let codex;
    try { codex = JSON.parse(readFileSync(args.codex, 'utf8')); }
    catch (e) { console.error('Lecture impossible : ' + e.message); process.exit(2); }

    const options = {
        auteurAttendu: args.auteurAttendu || null,
        replis: args.replis.length ? args.replis : REPLIS_HISTORIQUES_CONNUS
    };

    const { lignes, clesScannees, auteurMajoritaire } = auditerAttributions(codex, options);

    console.log('');
    console.log('AUDIT ATTRIBUTION CC (#342) — LECTURE SEULE (aucune écriture)');
    console.log('Clés scannées : ' + (clesScannees.join(', ') || '(aucune collection porteuse trouvée)'));
    console.log('Auteur attendu : ' + (options.auteurAttendu || '(non fourni)') +
        ' · auteur « ok » majoritaire observé : ' + (auteurMajoritaire || '(aucun)'));
    console.log('Replis historiques surveillés : ' + options.replis.join(', '));

    const suspects = lignes.filter(l => l.classe.startsWith('suspect'));
    const nonAttr = lignes.filter(l => l.classe === 'non-attribue');

    console.log('');
    console.log('── ATTRIBUTIONS SUSPECTES (à RÉPARER après revue) ──');
    if (!suspects.length) console.log('  (aucune)');
    for (const l of suspects) {
        console.log('  [' + l.cle + '][' + l.index + '] ' + (l.id || '∅') +
            (l.nom ? ' « ' + l.nom + ' »' : ''));
        console.log('      auteur_original : « ' + (l.auteurActuel || '∅') + ' »   → suggéré : « ' +
            (l.cibleSuggeree || '(à décider)') + ' »');
        console.log('      motif : ' + ETIQUETTE[l.classe]);
    }

    if (args.verbeux && nonAttr.length) {
        console.log('');
        console.log('── NON ATTRIBUÉES (info, PAS une erreur) ──');
        for (const l of nonAttr) {
            console.log('  [' + l.cle + '][' + l.index + '] ' + (l.id || '∅') +
                (l.nom ? ' « ' + l.nom + ' »' : '') + '  auteur : « ' + (l.auteurActuel || '∅') + ' »');
        }
    }

    console.log('');
    console.log('RÉSUMÉ : ' + suspects.length + ' attribution(s) suspecte(s), ' +
        nonAttr.length + ' non attribuée(s)' + (args.verbeux ? '' : ' (── --verbeux pour les lister ──)') + '.');
    console.log('AUCUNE écriture effectuée. La réécriture relève du jugement de Grégoire (voir snippet en bas du script).');
    process.exit(0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main();
}

/* ===========================================================================
   SNIPPET DE RÉÉCRITURE — NON EXÉCUTÉ. À COLLER DANS LA CONSOLE DE L'APP
   (onglet trimestre concerné chargé) APRÈS REVUE DU PLAN CI-DESSUS.
   ---------------------------------------------------------------------------
   Ce bloc est volontairement laissé en commentaire : il n'existe AUCUN chemin
   d'écriture actif dans ce script. Grégoire décide, pour chaque ligne suspecte,
   du bon auteur, puis applique. Faire un BACKUP codex AVANT.

   // 1) Choisir l'auteur correct (l'identité CC réelle de l'utilisateur) :
   //    const BON_AUTEUR = 'Grégoire Bédard';
   //
   // 2) Lister les ids de pratiques à corriger (copiés depuis le plan d'audit) :
   //    const IDS_A_CORRIGER = ['pratique_xxxx', 'pratique_yyyy'];
   //
   // 3) Réécrire metadata_cc.auteur_original UNIQUEMENT sur ces ids :
   //
   //    (async () => {
   //      const k = cle('pratiquesConfigurables');
   //      const pratiques = await db.get(k) || [];
   //      let n = 0;
   //      for (const p of pratiques) {
   //        if (!IDS_A_CORRIGER.includes(p.id)) continue;
   //        if (!p.metadata_cc) p.metadata_cc = {};
   //        const avant = p.metadata_cc.auteur_original;
   //        p.metadata_cc.auteur_original = BON_AUTEUR;
   //        if (p.auteur) p.auteur = BON_AUTEUR; // champ plat, garde la cohérence
   //        console.warn('[#342] ' + p.id + ' : « ' + avant + ' » → « ' + BON_AUTEUR + ' »');
   //        n++;
   //      }
   //      await db.set(k, pratiques);  // db.set(cle(pratiquesConfigurables), corrigees)
   //      console.warn('[#342] ' + n + ' attribution(s) corrigée(s). Hard refresh pour vérifier la durabilité (cf. #353).');
   //    })();
   //
   // Note durabilité : après écriture, vérifier au HARD refresh que la correction
   // tient (localStorage saturé pouvait avaler des écritures IDB avant 1.24.2).
   =========================================================================== */
