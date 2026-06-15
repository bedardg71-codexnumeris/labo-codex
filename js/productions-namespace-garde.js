/* =====================================================================
   MODULE PRODUCTIONS-NAMESPACE-GARDE — Garde-fou anti-contamination #340

   Contexte (#340) : un changement de trimestre a écrasé `h2026_productions`
   avec le contenu intégral de `a2025_productions` (productions d'un cours
   du trimestre quitté). Mécanisme : un read-modify-write asynchrone lit la
   collection sous un namespace, puis — le trimestre actif ayant basculé —
   ré-écrit le tableau périmé sous le namespace du NOUVEAU trimestre, car
   `getCleProductions()` / `cle('productions')` se résout dynamiquement.

   L'écrivain fautif exact n'a pas pu être prouvé par analyse statique seule
   (le chemin de sauvegarde d'évaluation n'écrit jamais `productions`). Cette
   garde rend le mécanisme inoffensif QUEL QUE SOIT l'écrivain : elle bloque,
   au point de persistance (db.set / db.setSync, donc localStorage ET IDB),
   toute écriture de `<trimestre>_productions` dont le contenu appartient en
   réalité à un AUTRE trimestre, et journalise la pile d'appel du fautif pour
   le prouver sur le terrain.

   Résolution `coursId → trimestreId` via la collection GLOBALE `cours`
   (chaque cours porte `id` + `trimestreId`). Les productions sans `coursId`
   (bibliothèque, démo) ou dont le cours est introuvable sont neutres.

   FAUX POSITIFS évités : l'ajout d'UNE production issue de la bibliothèque
   partagée inter-trimestres (qui peut conserver un `coursId` étranger) reste
   autorisé. On ne bloque que la signature de la corruption : un tableau qui
   ne contient AUCUNE production du trimestre cible mais des productions
   étrangères, soit en quantité (≥ 2), soit en remplacement d'un tableau qui
   contenait jusque-là des productions natives.

   Chargé juste après db.js dans index.html. Enregistre la garde au chargement.
   ===================================================================== */

(function() {
'use strict';

/**
 * Évaluation PURE de la cohérence (testable sans db).
 *
 * @param {string} cleEcrite - clé namespacée écrite (ex. 'h2026_productions')
 * @param {Array}  valeur - tableau de productions à écrire
 * @param {Object} mapCoursTrimestre - { coursId: trimestreId }
 * @param {Array}  [valeurActuelle] - contenu actuellement stocké sous la clé
 * @returns {{coherent:boolean, raison?:string, fautifs?:Array}}
 */
function evaluerCoherenceProductions(cleEcrite, valeur, mapCoursTrimestre, valeurActuelle) {
    var m = typeof cleEcrite === 'string' ? cleEcrite.match(/^([aeh]\d{4})_productions$/) : null;
    if (!m) return { coherent: true };               // clé non namespacée (boot/legacy) — ne pas bloquer
    var trimestreCible = m[1];

    if (!Array.isArray(valeur) || valeur.length === 0) return { coherent: true };
    if (!mapCoursTrimestre) return { coherent: true };

    function trimestreDe(p) {
        if (!p || !p.coursId) return null;            // sans cours → neutre (biblio/démo)
        return mapCoursTrimestre[p.coursId] || null;  // cours inconnu → neutre (indéterminé)
    }

    var nNatif = 0;
    var fautifs = [];
    for (var i = 0; i < valeur.length; i++) {
        var tr = trimestreDe(valeur[i]);
        if (tr === null) continue;
        if (tr === trimestreCible) {
            nNatif++;
        } else {
            fautifs.push({ id: valeur[i] && valeur[i].id, coursId: valeur[i].coursId, trimestre: tr });
        }
    }

    if (fautifs.length === 0 || nNatif > 0) {
        // Aucun item étranger, ou au moins un item natif coexiste → écriture
        // légitime (y compris l'ajout ponctuel d'un item de la bibliothèque).
        return { coherent: true };
    }

    // Ici : nNatif === 0 ET fautifs.length >= 1 → tableau 100 % étranger.
    var actuelAvaitDuNatif = Array.isArray(valeurActuelle) && valeurActuelle.some(function(p) {
        return trimestreDe(p) === trimestreCible;
    });

    if (fautifs.length >= 2 || actuelAvaitDuNatif) {
        return {
            coherent: false,
            raison: 'productions du trimestre ' + fautifs[0].trimestre + ' écrites sous ' +
                trimestreCible + ' (' + fautifs.length + '/' + valeur.length +
                ' items étrangers' + (actuelAvaitDuNatif ? ', remplacement de données natives' : '') +
                ', ex. coursId ' + fautifs[0].coursId + ')',
            fautifs: fautifs
        };
    }

    // Un seul item étranger sur une cible sans natif (ex. 1re production ajoutée
    // depuis la bibliothèque inter-trimestres) → toléré.
    return { coherent: true };
}

/**
 * Garde branchée sur db : reconstruit la map cours et lit l'état actuel.
 */
function gardeProductions(cleEcrite, valeur) {
    if (typeof db === 'undefined' || !db.getSync) return { coherent: true };

    var cours = db.getSync('cours', []) || [];
    if (!Array.isArray(cours) || cours.length === 0) return { coherent: true };

    var mapCoursTrimestre = {};
    for (var i = 0; i < cours.length; i++) {
        var c = cours[i];
        if (c && c.id && c.trimestreId) mapCoursTrimestre[c.id] = c.trimestreId;
    }

    var valeurActuelle = db.getSync(cleEcrite, null);
    return evaluerCoherenceProductions(cleEcrite, valeur, mapCoursTrimestre, valeurActuelle);
}

// Exposer la logique pure pour les tests (sentinelle #340).
window.evaluerCoherenceProductions = evaluerCoherenceProductions;
window.gardeNamespaceProductions = gardeProductions;

// Enregistrer la garde dès que db est disponible.
if (typeof db !== 'undefined' && db.enregistrerGardeEcriture) {
    db.enregistrerGardeEcriture('productions', gardeProductions);
}

})();
