/* ===============================
   MODULE : QUALIFICATION D'UN CONTEXTE D'APPRENTISSAGE
   Créé le 10 septembre 2026 (#821, lot A) — sur l'arbitrage de Grégoire :
   « L'application nomme un contexte et on ne sait pas comment elle fait pour
   le qualifier ainsi. […] Il faut unifier les définitions. »

   ⮕ CE QUE CE MODULE EST : LE SEUL ENDROIT où les règles qui qualifient un
   contexte d'apprentissage (à partir des indices A et C, ou d'un pourcentage)
   sont ÉCRITES, avec leurs bornes NOMMÉES, leur provenance et leur date —
   donc comparables entre elles, ligne à ligne.

   ⮕ CE QU'IL N'EST PAS : une règle unique. Les quatre mécanismes ne prennent
   pas les mêmes entrées et ne rendent pas la même chose. Deux qualifient par
   CONJONCTION sur A et C (mécanismes 3 et 4), un applique un SEUIL à un
   scalaire (mécanisme 2), et celui du tableau de bord NE CLASSE RIEN — c'est
   un dégradé continu (mécanisme 1). Les fusionner en une fonction serait un
   changement de comportement déguisé en refactorisation.

   ⮕ LES MOTS (15 oct. 2026, décision de Grégoire, groupe 4 question 3, mots
   adoptés à 11 h 38) : des mots qui DÉCRIVENT ce qu'on observe (la présence,
   la remise), pas des mots qui jugent l'élève ; UN SEUL vocabulaire, celui du
   mécanisme 2. Les mécanismes 3 et 4 n'ont plus de mot à eux : ils se disent
   par les deux descriptions du mécanisme 2 (« Absences rares, quelques travaux
   manquants »), ce qui empêche deux mots contradictoires pour le même élève.
   Le mécanisme 1 n'a aucun mot. « Décrochage », statut posé par l'enseignant,
   reste. Les recommandations attachées n'ont pas été réécrites (relecture).

   ⛔ AUCUNE BORNE NE BOUGE, AUCUNE COULEUR NE CHANGE (gel d'octobre, #742
   close) : renommer n'est pas reborner. Les bornes sont de la pédagogie, elles
   remontent à Grégoire.

   LES QUATRE MÉCANISMES, côte à côte (mesuré le 10 sept. 2026, `5c29d3fd`) :

   | # | Où ça s'affiche                     | Entrée         | Forme                          | Réglable |
   |---|-------------------------------------|----------------|--------------------------------|----------|
   | 1 | Tableau de bord › Aperçu (légende)  | UN indice (A, C ou P), par barre | dégradé CONTINU, 4 bandes | non |
   | 2 | couleur des indices, profil (A, C)  | UN pourcentage | 4 paliers (+ un 5e, fixe)      | OUI      |
   | 3 | Profil › contexte d'apprentissage   | A ET C         | 4 paliers par conjonction      | non      |
   | 4 | Profil › interprétation A-C (M)     | A ET C         | 9 branches par conjonction     | non      |

   ⚠ LA DIVERGENCE DES BORNES, PRÉSERVÉE TELLE QUELLE : un·e étudiant·e à
   A = 80 %, C = 80 % tombe dans le palier « favorable » du mécanisme 3
   (A ≥ 75 ET C ≥ 75) et dans la branche « acceptable » du mécanisme 4 (pas
   A ≥ 90 ET C ≥ 90) : badges et couleurs diffèrent, mais depuis le 15 oct.
   les deux cartes écrivent la MÊME phrase. Le tableau des divergences est dans
   `Rapports/INVENTAIRE-2026-09-10-nomenclature-des-zones.md`, § LOT B.

   Verrouillé par `tests/unit/sentinelle-821a-quatre-regles-un-seul-endroit.test.js`.

   Chargé après `interpretation-config.js` (le mécanisme 2 lit `obtenirSeuil`
   à l'appel). Le mécanisme 1 lit `tableau-bord-apercu.js` à l'appel aussi.
   =============================== */

(function() {
'use strict';

/* ===============================
   MÉCANISME 1 — l'Aperçu du tableau de bord : un dégradé continu
   =============================== */

// ⚠ NE CLASSE RIEN. Chaque barre de distribution (une pour A, une pour C,
// une pour P — l'inventaire disait « indice composite », c'est faux : chaque
// barre positionne UN indice) est un dégradé continu ; la couleur d'un point
// est interpolée. La légende pose quatre plages de pourcentage sous le
// dégradé ; depuis le 15 oct. 2026 (#821), AUCUN MOT ne les nomme : un mot
// découpait des catégories là où il n'y en a pas.
//
// La GÉOMÉTRIE du dégradé (axe 30 → 100 %, arrêts posés à 0 / 25 / 50 / 75 %
// de la barre, donc à 30 / 47,5 / 65 / 82,5 %) vit dans `tableau-bord-apercu.js`
// (#818, 10 sept. 2026), où la chaîne CSS, l'interpolation de couleur et la
// légende la lisent toutes trois. La sentinelle du lot B de l'audit de l'Aide
// la verrouille LÀ, dans le texte de ce fichier : elle n'est pas recopiée ici,
// elle est LUE à l'appel. Une copie ferait renaître la dérive que #818 a fermée.

/**
 * Les quatre bandes de la légende de l'Aperçu, avec leurs bornes en score 0-1,
 * dérivées de la géométrie du dégradé (jamais recopiées).
 * @returns {Array<{de: number, a: (number|null), couleur: string}>}
 *          `a` vaut null pour la dernière bande (« ≥ »).
 */
function bandesLegendeApercu() {
    const arrets = window.ARRETS_DEGRADE;
    const score = window.scoreALaPositionDistribution;
    if (!Array.isArray(arrets) || typeof score !== 'function') {
        throw new Error('bandesLegendeApercu : tableau-bord-apercu.js n\'expose pas la géométrie du dégradé');
    }
    return arrets.map((arret, i) => ({
        de: score(arret.position),
        a: i < arrets.length - 1 ? score(arrets[i + 1].position) : null,
        couleur: arret.couleur
    }));
}

/* ===============================
   MÉCANISME 2 — les seuils d'interprétation : un seuil sur un scalaire
   =============================== */

// Les trois bornes RÉGLABLES (Labo › Outils d'observation) sont lues par
// `obtenirSeuil('interpretation.*')` — la seule porte d'entrée des seuils
// configurables. Aucune n'est recopiée ici : défauts 0,70 / 0,80 / 0,85 dans
// `interpretation-config.js` (31 oct. 2025).
//
// ⚠ UNE QUATRIÈME BORNE, FIXE, QUE L'INVENTAIRE N'AVAIT PAS VUE : sous le
// seuil « acceptable », `interpreterAssiduite` et `interpreterCompletion`
// distinguent encore « insuffisante » (≥ 60 %) de « critique » (< 60 %). Elle
// est en dur depuis `97e80038` (23 oct. 2025), n'est pas réglable, et n'existe
// pas dans la couleur des indices (`obtenirCouleurSelonSeuils` : rouge sous
// « acceptable », sans distinction). Elle est nommée ici, et pas déplacée.
const BORNE_FIXE_INSUFFISANT = 0.60;

/** Les trois seuils réglables, lus à l'appel — jamais mis en cache ici. */
function seuilsInterpretation() {
    return {
        excellent: obtenirSeuil('interpretation.excellent'),
        bon: obtenirSeuil('interpretation.bon'),
        acceptable: obtenirSeuil('interpretation.acceptable')
    };
}

// Les cinq paliers, du plus régulier au moins régulier : les mots adoptés par
// Grégoire le 15 oct. 2026 (11 h 38), tels quels. Les anciennes `description`
// (« engagement soutenu », « situation d'urgence »…) jugeaient l'élève et
// n'étaient lues par aucun écran : retirées. Les couleurs n'ont pas bougé.
const MOTS_PRESENCE = ['Aucune absence ou presque', 'Absences rares', 'Quelques absences',
    'Absences fréquentes', 'Absences très fréquentes'];
const MOTS_REMISE = ['Aucun travail manquant ou presque', 'Travaux manquants rares',
    'Quelques travaux manquants', 'Travaux manquants fréquents', 'Travaux manquants très fréquents'];
const COULEURS_PALIERS = ['#2196F3', '#28a745', '#ffc107', '#ff9800', '#dc3545']; // bleu, vert, jaune, orange, rouge

/**
 * Le palier (0 = le plus régulier, 4 = le moins régulier) d'une proportion 0-1,
 * selon les trois seuils réglés et la borne fixe. Une valeur illisible (NaN)
 * tombe au dernier palier, comme avant.
 */
function palierInterpretation(p) {
    const seuils = seuilsInterpretation();
    if (p >= seuils.excellent) return 0;
    if (p >= seuils.bon) return 1;
    if (p >= seuils.acceptable) return 2;
    if (p >= BORNE_FIXE_INSUFFISANT) return 3;
    return 4;
}

/**
 * Interprète l'indice A (Assiduité).
 * Déplacée depuis `profil-etudiant-helpers.js` le 10 sept. 2026 ; mots du 15 oct.
 * @param {number} valeur - Valeur en pourcentage (0-100)
 * @returns {Object} - { niveau, couleur }
 */
function interpreterAssiduite(valeur) {
    const i = palierInterpretation(valeur / 100);
    return { niveau: MOTS_PRESENCE[i], couleur: COULEURS_PALIERS[i] };
}

/**
 * Interprète l'indice C (Complétion).
 * Déplacée depuis `profil-etudiant-helpers.js` le 10 sept. 2026 ; mots du 15 oct.
 * @param {number} valeur - Valeur en pourcentage (0-100)
 * @returns {Object} - { niveau, couleur }
 */
function interpreterCompletion(valeur) {
    const i = palierInterpretation(valeur / 100);
    return { niveau: MOTS_REMISE[i], couleur: COULEURS_PALIERS[i] };
}

/**
 * La phrase qui dit un contexte par ses deux observations : « Absences rares,
 * quelques travaux manquants ». C'est le seul mot des mécanismes 3 et 4.
 * Les proportions sont lues telles quelles (pas de passage par ×100 / ÷100,
 * qui déplace 0,57 sous 0,57).
 * @param {number} A - Assiduité en proportion 0-1
 * @param {number} C - Complétion en proportion 0-1
 * @returns {string}
 */
function decrireContexte(A, C) {
    const remise = MOTS_REMISE[palierInterpretation(C)];
    return MOTS_PRESENCE[palierInterpretation(A)] + ', ' + remise.charAt(0).toLowerCase() + remise.slice(1);
}

/**
 * La couleur d'un indice (A, C, P ou M) selon les seuils réglés.
 * Déplacée depuis `etudiants.js` le 10 sept. 2026. Elle y portait un repli
 * « si le module des seuils n'est pas chargé » avec les trois défauts recopiés
 * en dur (`36b1e64a`, 1er nov. 2025) : retiré — `obtenirSeuil` retombe déjà
 * sur `SEUILS_PAR_DEFAUT`, et une copie des défauts est une seconde vérité.
 * @param {number} pourcentage - Valeur en pourcentage (0-100)
 * @returns {string} - Couleur CSS
 */
function obtenirCouleurSelonSeuils(pourcentage) {
    const seuils = seuilsInterpretation();
    const valeur = pourcentage / 100; // Convertir en 0-1

    if (valeur >= seuils.excellent) {
        return '#0284c7'; // Bleu (excellent)
    } else if (valeur >= seuils.bon) {
        return 'var(--vert-succes)'; // Vert (bon)
    } else if (valeur >= seuils.acceptable) {
        return '#ca8a04'; // Jaune (acceptable)
    } else {
        return '#dc2626'; // Rouge (fragile/critique)
    }
}

/* ===============================
   MÉCANISME 3 — le contexte d'apprentissage du profil : conjonction sur A et C
   =============================== */

// Quatre paliers, chacun par CONJONCTION « A ≥ x ET C ≥ x », en dur depuis
// `e4bb0db9` (16 nov. 2025). Le dernier palier est un OU : « Fragile » dès
// qu'UN des deux indices passe sous 65 %.
const BORNES_CONTEXTE = {
    tresFavorable: 0.85,   // A ≥ 85 % ET C ≥ 85 %
    favorable: 0.75,       // A ≥ 75 % ET C ≥ 75 %
    modere: 0.65           // A ≥ 65 % ET C ≥ 65 % ; en dessous de l'un des deux : Fragile
};

/**
 * Qualifie le contexte d'apprentissage à partir de A et C seuls (sans P).
 * Corps de `determinerAlerteContextuelle` (`profil-etudiant-calculs.js`),
 * déplacé tel quel le 10 sept. 2026 ; la lecture des indices et le cas
 * « En attente » (données insuffisantes) restent chez l'appelant.
 * #821 (15 oct. 2026) : le palier garde son code, son badge et sa couleur ;
 * son `label` est la phrase des deux observations (`decrireContexte`), et la
 * `description` qui le jugeait (« Contexte fragile. […] ») est retirée.
 * @param {number} A - Assiduité en proportion 0-1
 * @param {number} C - Complétion en proportion 0-1
 * @returns {Object} - { niveau, label, badgeClasse, A, C, recommandation }
 */
function qualifierContexteApprentissage(A, C) {
    // Contexte très favorable : A ≥ 85% ET C ≥ 85%
    if (A >= BORNES_CONTEXTE.tresFavorable && C >= BORNES_CONTEXTE.tresFavorable) {
        return {
            niveau: 'tres-favorable',
            label: decrireContexte(A, C),
            badgeClasse: 'badge-engagement-tres-favorable',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Les interventions peuvent se concentrer sur le développement des habiletés et compétences.'
        };
    }

    // Contexte favorable : A ≥ 75% ET C ≥ 75%
    if (A >= BORNES_CONTEXTE.favorable && C >= BORNES_CONTEXTE.favorable) {
        return {
            niveau: 'favorable',
            label: decrireContexte(A, C),
            badgeClasse: 'badge-engagement-favorable',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Les interventions peuvent se concentrer sur le développement des habiletés et compétences.'
        };
    }

    // Contexte modéré : A ≥ 65% ET C ≥ 65%
    if (A >= BORNES_CONTEXTE.modere && C >= BORNES_CONTEXTE.modere) {
        return {
            niveau: 'modere',
            label: decrireContexte(A, C),
            badgeClasse: 'badge-engagement-modere',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Suivi régulier recommandé pour maintenir l\'engagement et éviter une baisse de performance.'
        };
    }

    // Contexte fragile : A < 65% OU C < 65% — tout ce qui n'est pas « modéré ».
    // #822 (lot C du cadrage du 16 sept. 2026) : un cinquième palier, « Insuffisant »,
    // suivait celui-ci sans pouvoir être atteint (ce OU attrapait tout avant lui).
    // Retiré sur décision de Grégoire : il n'a jamais servi, et son mot qualifiait la
    // personne là où les bandes décrivent un état du contexte. Aucune borne n'a bougé.
    return {
        niveau: 'fragile',
        label: decrireContexte(A, C),
        badgeClasse: 'badge-engagement-fragile',
        A: (A * 100).toFixed(0) + '%',
        C: (C * 100).toFixed(0) + '%',
        recommandation: 'Interventions recommandées : Rencontrer l\'étudiant·e pour comprendre les absences/non-remises, encourager la mobilisation, vérifier s\'il y a des obstacles (emploi, santé, etc.).'
    };
}

/* ===============================
   MÉCANISME 4 — l'interprétation A-C de la mobilisation (M) : conjonction sur A et C
   =============================== */

// Trois bornes, en dur depuis `c80216e4` (23 oct. 2025, « première ébauche des
// indices MER »), qui découpent neuf branches. Elles sont AUSSI lues par la
// carte Mobilisation du profil (`profil-etudiant-sections-affichage.js`), qui
// choisit ses blocs de recommandation et écrit ses pourcentages avec elles.
const BORNES_MOBILISATION = {
    critique: 0.7,     // sous 70 % : critique (A, C, ou les deux)
    fragile: 0.8,      // sous 80 % : fragile (A, C, ou les deux)
    favorable: 0.9     // A ≥ 90 % ET C ≥ 90 % : Favorable ; sinon Acceptable
};

/**
 * Interprète l'indice M (Mobilisation) selon la logique pédagogique avancée.
 * Implémente la formule Excel avec diagnostic précis des composantes A et C.
 * Déplacée telle quelle depuis `profil-etudiant-helpers.js` le 10 sept. 2026.
 * #821 (15 oct. 2026) : les neuf branches gardent leurs bornes et leurs
 * couleurs ; elles n'ont plus de mot à elles. `code` nomme la branche (les
 * lecteurs choisissent leur prose par lui) ; `niveau` est la phrase des deux
 * observations (`decrireContexte`), sauf « Décrochage », statut posé par
 * l'enseignant, qui reste.
 * @param {number} A - Assiduité en proportion 0-1
 * @param {number} C - Complétion en proportion 0-1
 * @param {boolean} statutDecrochage - Indicateur de décrochage (défaut: false)
 * @returns {Object} - { code, niveau, couleur }
 */
function interpreterMobilisation(A, C, statutDecrochage = false) {
    // 1. Décrochage (priorité absolue - interventions impossibles)
    if (statutDecrochage) {
        return { code: 'decrochage', niveau: 'Décrochage', couleur: '#9e9e9e' }; // Gris
    }
    const branche = brancheMobilisation(A, C);
    return { code: branche.code, niveau: decrireContexte(A, C), couleur: branche.couleur };
}

/** Les branches 2 à 9 de la mobilisation : un code et une couleur, sans mot. */
function brancheMobilisation(A, C) {
    const B = BORNES_MOBILISATION;

    // 2. Assiduité ET complétion sous la borne critique (A<0.7 ET C<0.7)
    if (A < B.critique && C < B.critique) return { code: 'critiques', couleur: '#dc3545' }; // Rouge
    // 3. Assiduité seule sous la borne critique (A<0.7)
    if (A < B.critique) return { code: 'assiduite-critique', couleur: '#ff9800' }; // Orange
    // 4. Complétion seule sous la borne critique (C<0.7)
    if (C < B.critique) return { code: 'completion-critique', couleur: '#ff9800' }; // Orange
    // 5. Les deux sous la borne fragile (A<0.8 ET C<0.8)
    if (A < B.fragile && C < B.fragile) return { code: 'fragile', couleur: '#ffc107' }; // Jaune
    // 6. Assiduité seule sous la borne fragile (A<0.8 ET C≥0.8)
    if (A < B.fragile && C >= B.fragile) return { code: 'assiduite-fragile', couleur: '#ffc107' }; // Jaune
    // 7. Complétion seule sous la borne fragile (A≥0.8 ET C<0.8)
    if (A >= B.fragile && C < B.fragile) return { code: 'completion-fragile', couleur: '#ffc107' }; // Jaune
    // 8. Les deux au-dessus de la borne favorable (A≥0.9 ET C≥0.9)
    if (A >= B.favorable && C >= B.favorable) return { code: 'favorable', couleur: '#2196F3' }; // Bleu
    // 9. Sinon : A≥0.8 ET C≥0.8, mais pas tous deux ≥0.9
    return { code: 'acceptable', couleur: '#28a745' }; // Vert
}

/* ===============================
   LES QUATRE RÈGLES, DÉCLARÉES CÔTE À CÔTE
   =============================== */

/**
 * Le tableau des quatre mécanismes, avec leurs bornes VIVANTES (le mécanisme 2
 * lit les seuils réglés, le mécanisme 1 lit la géométrie du dégradé). C'est la
 * vue comparable ; les fonctions ci-dessus restent les seules à qualifier.
 * @returns {Array<Object>}
 */
function reglesDeQualification() {
    const s = seuilsInterpretation();
    return [
        {
            mecanisme: 1, nom: 'Aperçu du tableau de bord', entree: 'un indice (A, C ou P), un par barre',
            classe: false, reglable: false,
            bandes: bandesLegendeApercu()
        },
        {
            mecanisme: 2, nom: 'Seuils d\'interprétation', entree: 'un pourcentage',
            classe: true, reglable: true,
            bornes: { excellent: s.excellent, bon: s.bon, acceptable: s.acceptable, insuffisantFixe: BORNE_FIXE_INSUFFISANT }
        },
        {
            mecanisme: 3, nom: 'Contexte d\'apprentissage (profil)', entree: 'A et C',
            classe: true, reglable: false,
            bornes: Object.assign({}, BORNES_CONTEXTE)
        },
        {
            mecanisme: 4, nom: 'Interprétation A-C de la mobilisation (profil)', entree: 'A et C',
            classe: true, reglable: false,
            bornes: Object.assign({}, BORNES_MOBILISATION)
        }
    ];
}

// Exporter vers window (convention systématique cross-zones).
window.bandesLegendeApercu = bandesLegendeApercu;
window.BORNE_FIXE_INSUFFISANT = BORNE_FIXE_INSUFFISANT;
window.interpreterAssiduite = interpreterAssiduite;
window.interpreterCompletion = interpreterCompletion;
window.decrireContexte = decrireContexte;
window.obtenirCouleurSelonSeuils = obtenirCouleurSelonSeuils;
window.BORNES_CONTEXTE = BORNES_CONTEXTE;
window.qualifierContexteApprentissage = qualifierContexteApprentissage;
window.BORNES_MOBILISATION = BORNES_MOBILISATION;
window.interpreterMobilisation = interpreterMobilisation;
window.reglesDeQualification = reglesDeQualification;

})();
