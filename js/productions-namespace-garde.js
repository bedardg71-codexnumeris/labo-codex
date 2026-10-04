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
/**
 * Construit la table `coursId -> trimestreId`.
 *
 * ⚠⚠ NE PAS REVENIR au magasin GLOBAL `cours` (22 aout 2026).
 *
 * Cette garde date du 30 mars 2026, quand une fiche de cours appartenait a UN
 * trimestre et portait un `trimestreId` qui voulait dire quelque chose. La
 * decision #455 (aout) a rendu le magasin `cours` GLOBAL : « identite = code
 * seul » (cf. js/cours.js). Une meme fiche « 601-101-MQ » sert desormais TOUS
 * les trimestres, et son champ `trimestreId` ne dit plus que le trimestre ou
 * elle a ete creee.
 *
 * La garde attribuait donc les productions au mauvais trimestre. Constate sur
 * les donnees reelles de Gregoire le 22 aout : une seule fiche de cours, dont
 * le `trimestreId` ne valait pas le trimestre actif ⇒ sa collection entiere
 * comptait comme ETRANGERE ⇒ la garde refusait TOUTE ecriture, des la
 * premiere, et son trimestre ne pouvait plus jamais recevoir de production.
 *
 * La source correcte est `<trimestre>_groupesCours`, qui est NAMESPACEE : un
 * groupe-cours ne vit que dans son trimestre. Regle d'attribution :
 *   · un coursId vu dans UN SEUL trimestre  -> attribuable a ce trimestre ;
 *   · un coursId vu dans PLUSIEURS          -> NON attribuable (neutre), ce
 *     qui est la verite d'un cours global reutilise d'un trimestre a l'autre ;
 *   · aucun groupe-cours nulle part         -> aucune attribution possible :
 *     la garde reste inerte plutot que de bloquer sur une base fausse.
 *
 * @returns {Object} coursId -> trimestreId (uniquement les cas non ambigus)
 */
function construireMapCoursTrimestre() {
    var map = {};
    if (typeof db === 'undefined' || !db.getSync) return map;

    var trimestres = db.getSync('trimestres', []) || [];
    if (!Array.isArray(trimestres) || trimestres.length === 0) return map;

    var vus = {};   // coursId -> { trimestreId: true }
    for (var i = 0; i < trimestres.length; i++) {
        var t = trimestres[i];
        if (!t || !t.id) continue;
        var groupes = db.getSync(t.id + '_groupesCours', []) || [];
        if (!Array.isArray(groupes)) continue;
        for (var j = 0; j < groupes.length; j++) {
            var gc = groupes[j];
            if (!gc || !gc.coursId) continue;
            if (!vus[gc.coursId]) vus[gc.coursId] = {};
            vus[gc.coursId][t.id] = true;
        }
    }

    Object.keys(vus).forEach(function (coursId) {
        var ts = Object.keys(vus[coursId]);
        if (ts.length === 1) map[coursId] = ts[0];   // sans ambiguite seulement
    });

    return map;
}

/**
 * Garde branchée sur db : reconstruit la map cours et lit l'état actuel.
 */
function gardeProductions(cleEcrite, valeur) {
    if (typeof db === 'undefined' || !db.getSync) return { coherent: true };

    // E2 (#1023, 4 oct. 2026) : un trimestre ABSENT du registre ne se juge pas. La table
    // ci-dessous ne lit que les trimestres du registre : les cours de celui-là n'y sont pas, et
    // un cours qu'il partage avec un autre lui paraîtrait étranger. Mesuré : l'emprunt d'un
    // trimestre (qui n'entre au registre qu'en dernier) voyait ses productions bloquées, le
    // cours 601-101 étant aussi celui du trimestre en cours. Le cas #340 (deux trimestres du
    // registre) est jugé comme avant.
    var mCible = typeof cleEcrite === 'string' ? cleEcrite.match(/^([aeh]\d{4})_productions$/) : null;
    var registre = db.getSync('trimestres', []) || [];
    if (mCible && Array.isArray(registre) && !registre.some(function (t) { return t && t.id === mCible[1]; })) {
        return { coherent: true };
    }

    var mapCoursTrimestre = construireMapCoursTrimestre();
    if (Object.keys(mapCoursTrimestre).length === 0) {
        // Rien d'attribuable : ne jamais bloquer sur une base vide.
        return { coherent: true };
    }

    var valeurActuelle = db.getSync(cleEcrite, null);
    return evaluerCoherenceProductions(cleEcrite, valeur, mapCoursTrimestre, valeurActuelle);
}

// Exposer la logique pure pour les tests (sentinelle #340).
window.evaluerCoherenceProductions = evaluerCoherenceProductions;
window.gardeNamespaceProductions = gardeProductions;
window.construireMapCoursTrimestre = construireMapCoursTrimestre;

// Enregistrer la garde dès que db est disponible.
if (typeof db !== 'undefined' && db.enregistrerGardeEcriture) {
    db.enregistrerGardeEcriture('productions', gardeProductions);
}

})();
