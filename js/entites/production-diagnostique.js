/* ===============================
   ENTITÉ : LA PRODUCTION DIAGNOSTIQUE (#790)

   Un travail de REPÉRAGE, en début de trimestre : l'enseignant fait produire
   quelque chose pour situer ses élèves, l'évalue sur une dimension seulement, et
   veut s'en servir pour repérer qui soutenir — SANS que ça pèse sur quoi que ce
   soit d'autre.

   ⚠ RIEN ICI N'EST DISCIPLINAIRE, et c'est une exigence, pas un hasard. Le cas
   qui a fondé le besoin est un portrait de lecteur corrigé sur le seul critère du
   français (Grégoire, 7 septembre 2026) ; un enseignant de chimie doit pouvoir
   faire la même chose sur le sien. Aucun mot de discipline n'entre dans ce
   fichier, ni dans le champ qu'il définit.

   CE QU'ELLE RESTE : une production ENTIÈRE et visible. Copie importée,
   annotation, rétroaction, résultat — tout demeure consultable dans le dossier de
   l'élève, en tout temps. On lui retire son POIDS, pas son existence.

   LES QUATRE PORTES QU'ELLE NE FRANCHIT PAS. Elles ne sont pas quatre variantes
   d'une même chose : chacune mène au palier RàI par un chemin différent, et il
   suffit d'en oublier une pour que le reste ne serve à rien.
     1. LA NOTE ET L'INDICE P — la sélection des productions de chaque famille de
        pratiques (`js/pratiques/`).
     2. LA FENÊTRE DES PATTERNS — `obtenirIdsProductionsEvaluables`
        (`profil-etudiant-helpers.js`), que cinq appelants partagent. Motif : cette
        fenêtre moyenne des NOTES FINALES ; une note d'une seule dimension y
        entrerait comme si elle mesurait la compétence entière.
     3. L'INDICE C (complétion) — les quatre `calculerCompletion`. Motif, dans les
        mots de Grégoire : « Certains élèves ne sont pas au premier cours pour des
        raisons administratives (horaire, inscription, etc.). »
     4. ⚠ LE JUGEMENT DE NON-PARTICIPATION — `depistagePeutJugerLaNonParticipation`
        (`profil-etudiant-calculs.js`). C'EST LE PIÈGE : il autorise
        « Non-participation → niveau 3 » dès que le groupe réunit UN TRAVAIL DÛ et
        UNE COPIE ÉVALUÉE. En première semaine, la production diagnostique remplit
        les DEUX à elle seule dès la première copie corrigée — un élève arrivé en
        retard basculerait en palier intensif par cette porte, l'exclusion de C n'y
        changeant rien.

   ⛔ CE MODULE N'ÉCRIT RIEN ET NE LIT AUCUN STOCKAGE. Fonctions pures sur les
   objets qu'on lui passe. C'est ce qui permet de le sentinelliser sans bac, et de
   n'avoir qu'UN endroit à faire rougir pour éprouver les quatre portes.

   ⮕ ÉLARGI LE 15 OCT. 2026 (#1055), DANS LES MOTS DE GRÉGOIRE : « si c'est un
   diagnostic, qu'elle soit vue et lue autrement qu'une production ordinaire ».
   Au-delà des quatre portes, AUCUNE surface qui compile, compte ou trace le
   parcours d'un élève ne lit un diagnostic comme une production ordinaire,
   l'historique compris (captures, courbes, graphiques par critère, trajectoires,
   comptes du profil et de la liste, export de recherche). Et là où elle s'affiche
   parmi les autres, elle porte sa marque (`marqueHTML`). Le signalement « Aide en
   français recommandée » la lit toujours : c'est voulu (7 sept.).

   SOURCE OU STOCK : le champ est NEUF. Aucune production existante ne le porte,
   aucune migration ne le pose. C'est l'enseignant qui coche, et c'est ce qui lui
   fait voir le changement.

   Cadrage : `plans de travail/CADRAGE-2026-09-07-depistage-du-francais-semaine-1.md`.
   =============================== */

(function() {
'use strict';

/**
 * Le nom du champ, en un seul endroit.
 *
 * ⚠ POURQUOI UNE CONSTANTE ET PAS LA CHAÎNE EN CLAIR : ce champ voyage (schéma
 * d'import `import-export.js`, exports, pack de démonstration). Une faute de
 * frappe dans l'un des dix sites de lecture produirait un `undefined` — donc un
 * `false` silencieux, donc une production qui recommence à compter, sans que rien
 * ne rougisse. La sentinelle vérifie que tous les sites passent par ici.
 */
var CHAMP = 'diagnostique';

/**
 * La marque d'une production diagnostique, là où elle s'affiche parmi les autres
 * (#1055). Le mot est celui de la case de la fiche, sans mot neuf ; la bulle reprend
 * son libellé. Constante : aucune donnée d'utilisateur n'y entre.
 */
var MOT = 'Diagnostique';
var MARQUE_HTML = '<span class="marque-diagnostique" title="Travail diagnostique — ne compte dans aucun calcul">' + MOT + '</span>';

/** La marque, ou rien si la production n'est pas diagnostique. */
function marqueHTML(production) {
    return estDiagnostique(production) ? MARQUE_HTML : '';
}

/**
 * Cette production est-elle diagnostique ?
 *
 * ⚠ TOLÉRANTE PAR CONSTRUCTION. Elle reçoit indifféremment `null`, un objet
 * partiel, ou une production complète, et répond `false` par défaut : le champ est
 * neuf, donc ABSENT de toutes les productions déjà enregistrées. Un défaut à
 * `true` ferait disparaître le trimestre entier des calculs.
 *
 * @param {Object|null} production
 * @returns {boolean}
 */
function estDiagnostique(production) {
    return !!(production && production[CHAMP] === true);
}

/**
 * Retire les productions diagnostiques d'une liste de productions.
 *
 * @param {Array|null} productions
 * @returns {Array} une NOUVELLE liste ; l'entrée n'est jamais modifiée
 */
function filtrerProductions(productions) {
    if (!Array.isArray(productions)) return [];
    return productions.filter(function(p) { return !estDiagnostique(p); });
}

/**
 * L'ensemble des ids de productions diagnostiques — pour les sites qui ne
 * tiennent que des ÉVALUATIONS en main et doivent remonter à leur production.
 *
 * @param {Array|null} productions
 * @returns {Set<string>}
 */
function idsDiagnostiques(productions) {
    var ids = new Set();
    if (!Array.isArray(productions)) return ids;
    productions.forEach(function(p) {
        if (estDiagnostique(p) && p && p.id) ids.add(p.id);
    });
    return ids;
}

/**
 * Retire d'une liste d'ÉVALUATIONS celles qui portent sur une production
 * diagnostique.
 *
 * ⚠ UNE ÉVALUATION SANS `productionId` EST CONSERVÉE. Elle ne peut pas être
 * rattachée, donc rien ne prouve qu'elle est diagnostique — et écarter dans le
 * doute retirerait de la note des copies qui doivent y rester. Le doute penche du
 * côté qui ne fait rien disparaître.
 *
 * @param {Array|null} evaluations
 * @param {Array|null} productions
 * @returns {Array} une NOUVELLE liste
 */
function filtrerEvaluations(evaluations, productions) {
    if (!Array.isArray(evaluations)) return [];
    var exclus = idsDiagnostiques(productions);
    if (exclus.size === 0) return evaluations.slice();
    return evaluations.filter(function(e) {
        return !(e && e.productionId && exclus.has(e.productionId));
    });
}

// ============================================
// EXPORTS GLOBAUX
// ============================================

window.ProductionDiagnostique = {
    CHAMP: CHAMP,
    estDiagnostique: estDiagnostique,
    filtrerProductions: filtrerProductions,
    idsDiagnostiques: idsDiagnostiques,
    filtrerEvaluations: filtrerEvaluations,
    MOT: MOT,
    marqueHTML: marqueHTML
};

})();
