/* ===============================
   MODULE: IDENTITÉ NATURELLE D'UNE ENTITÉ DU CADRE (CT-15 / #476 volet 2)

   Rôle: fonctions PURES, sans lecture ni écriture de stockage, sans DOM.

   ⚠ À NE PAS CONFONDRE AVEC `js/identite-item.js`. Les deux modules parlent
   d'identité, mais pas de la même :

     · `identite-item.js` (#291/#476 volet 1) — identité de LIGNÉE. « Cet item
       descend-il de celui-là ? » Elle se lit dans `idOriginal`, `inspireDe`…
       Elle sert aux bibliothèques, où le même contenu circule en copies.

     · CE MODULE — identité NATURELLE. « Ces deux fiches désignent-elles la
       même chose dans le monde réel ? » Elle se lit dans les données métier :
       le code d'un cours, le courriel d'un enseignant, le triplet d'un
       groupe-cours. Elle sert au cadre du trimestre, où deux fiches jumelles
       ne sont pas des copies : ce sont deux vérités concurrentes.

   POURQUOI CE MODULE EXISTE

   L'audit du 20 août 2026 (CT-15) a mesuré trois créations silencieuses :

     · `js/trimestre-v2-groupes-cours.js` poussait un groupe-cours sans jamais
       regarder si le triplet (trimestre, cours, groupe) existait déjà. Or le
       nom d'un GC est ENGENDRÉ à partir de ce triplet : deux jumeaux portent
       le même libellé dans les menus, et les présences comme les évaluations
       se répartissent entre eux au hasard du clic ;
     · `js/trimestre-v2-enseignants.js` ne vérifiait aucun courriel à la
       création manuelle — alors que la migration du vieux `profilEnseignant`,
       trente lignes plus haut, vérifie, elle ;
     · `js/entites/cours-entite.js` créait sans aucun contrôle : l'invariant
       #455 n'était défendu qu'au formulaire et à l'import, jamais au point
       d'écriture.

   ET TROIS NORMALISATIONS DIFFÉRENTES POUR LA MÊME QUESTION. Le formulaire de
   cours comparait `trim().toUpperCase()` ; l'import comparait `===` brut —
   « 601-101-mq » entrait donc à côté de « 601-101-MQ » sans un mot ; l'entité
   ne comparait rien. Trois réponses possibles à « est-ce le même cours ? »,
   c'est zéro source de vérité.

   ⚠ DÉCISION #455 (19 août 2026, Grégoire) — LE COURS EST GLOBAL : « le devis
   ministériel ne change pas d'un trimestre à l'autre, une seule fiche sert
   toutes les sessions ». L'identité d'un cours est donc SON CODE, SEUL — ni la
   session, ni l'année, ni le trimestre n'y entrent. Ce module applique cette
   décision, il ne la contourne pas.

   LA RÈGLE COMMUNE AUX TROIS GARDES QUI S'APPUIENT SUR CE MODULE :
   le geste reste possible, il n'est jamais silencieux. On ne bloque pas
   l'utilisateur — un enseignant peut réellement porter deux profils dans deux
   institutions, une équipe peut réellement co-porter un groupe-cours — on
   l'AVERTIT, et c'est lui qui tranche.

   API publique (toutes pures) :
   - cleNaturelle(valeur)                     → chaîne normalisée, ou ''
   - cleNaturelleCours(cours)                 → 'MAT-101-MQ' | null
   - cleNaturelleEnseignant(enseignant)       → 'X@EXEMPLE.COM' | null
   - cleNaturelleGroupeCours(gc)              → 'A2026|COURS_X|3' | null
   - trouverDoublonNaturel(liste, candidat, calculer, opts) → item | null
   =============================== */

(function() {
'use strict';

/**
 * Normalise une valeur pour la COMPARAISON, jamais pour l'affichage.
 *
 * Casse et espaces ne font pas l'identité : « 601-101-mq », « 601-101-MQ » et
 * «  601-101-MQ  » désignent le même cours. C'est exactement le trou par
 * lequel l'import de `cours.js` laissait passer un doublon.
 *
 * @param {*} valeur
 * @returns {string} chaîne normalisée, ou '' si la valeur est vide
 */
function cleNaturelle(valeur) {
    if (valeur === null || valeur === undefined) return '';
    return String(valeur).trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Identité naturelle d'un cours : SON CODE, SEUL (décision #455).
 *
 * Les fiches héritées portent le code sous trois noms de champ selon leur
 * génération (`codeCours`, `sigle`, `code`) ; on les accepte tous les trois en
 * LECTURE, sans quoi une fiche legacy passerait au travers de la garde.
 *
 * @param {Object} cours
 * @returns {string|null} clé de comparaison, ou null si le cours n'a pas de code
 */
function cleNaturelleCours(cours) {
    if (!cours) return null;
    return cleNaturelle(cours.codeCours || cours.sigle || cours.code) || null;
}

/**
 * Identité naturelle d'un profil enseignant : son courriel.
 *
 * Ni le nom ni le prénom n'entrent dans l'identité — deux homonymes existent,
 * et c'est la leçon #450 transposée : on ne bloque jamais sur un nom.
 *
 * @param {Object} enseignant
 * @returns {string|null}
 */
function cleNaturelleEnseignant(enseignant) {
    if (!enseignant) return null;
    return cleNaturelle(enseignant.courriel) || null;
}

/**
 * Identité naturelle d'un groupe-cours : le triplet (trimestre, cours, groupe).
 *
 * ⚠ L'horaire et l'enseignant n'en font PAS partie, délibérément. Ce sont eux
 * qui rendent deux jumeaux légitimes quand ils diffèrent (co-enseignement,
 * horaire scindé) : les inclure dans l'identité désarmerait la garde
 * précisément dans le cas où elle doit parler.
 *
 * Les trois composantes sont requises : un triplet incomplet ne désigne rien.
 *
 * @param {Object} gc
 * @returns {string|null}
 */
function cleNaturelleGroupeCours(gc) {
    if (!gc) return null;
    const trimestre = cleNaturelle(gc.trimestreId);
    const cours = cleNaturelle(gc.coursId);
    const groupe = cleNaturelle(gc.groupeNum);
    if (!trimestre || !cours || !groupe) return null;
    return trimestre + '|' + cours + '|' + groupe;
}

/**
 * Cherche dans `liste` un item qui porte la même identité naturelle que
 * `candidat`.
 *
 * @param {Array} liste             la collection existante
 * @param {Object} candidat         l'item qu'on s'apprête à écrire
 * @param {Function} calculer       l'une des `cleNaturelle*` ci-dessus
 * @param {Object} [opts]
 * @param {string} [opts.exclureId] id à ignorer — l'item lui-même en ÉDITION.
 *        Sans lui, modifier une fiche sans toucher son code la ferait
 *        rougir contre elle-même : la garde crierait au doublon à chaque
 *        enregistrement, et on la désactiverait dans la semaine.
 * @returns {Object|null} l'item en place, ou null
 */
function trouverDoublonNaturel(liste, candidat, calculer, opts) {
    if (!Array.isArray(liste) || typeof calculer !== 'function') return null;
    const cle = calculer(candidat);
    // Une identité indéterminable n'autorise aucun verdict : mieux vaut
    // laisser passer que refuser sur une comparaison de `null` avec `null`.
    if (!cle) return null;

    const exclureId = opts && opts.exclureId;
    for (const item of liste) {
        if (!item) continue;
        if (exclureId && item.id === exclureId) continue;
        if (calculer(item) === cle) return item;
    }
    return null;
}

/* ===============================
   EXPORTS GLOBAUX
   =============================== */

window.cleNaturelle = cleNaturelle;
window.cleNaturelleCours = cleNaturelleCours;
window.cleNaturelleEnseignant = cleNaturelleEnseignant;
window.cleNaturelleGroupeCours = cleNaturelleGroupeCours;
window.trouverDoublonNaturel = trouverDoublonNaturel;

})();
