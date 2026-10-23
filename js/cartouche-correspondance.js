/* ===============================
   MODULE CARTOUCHE-CORRESPONDANCE — rattacher une cartouche aux critères d'une grille
   (#1144, 23 oct. 2026). Fonctions PURES : rien n'est lu ni écrit en base.

   POURQUOI CE MODULE EXISTE. Une cartouche COPIE les critères de sa grille (`criteres:
   [{id, nom}]`) et indexe ses commentaires par `<critereId>_<niveauCode>`. Deux chemins ont
   besoin de la même correspondance vers les critères d'une autre grille :
     · `deplacerCartouchesVersAutreGrille` (grilles.js, #624) — le déplacement au retrait
       d'une grille ;
     · `CartouchesDecalees` (cartouches-decalees.js, #1144) — le stock : les cartouches
       rangées sous une grille avec les critères d'une autre.
   Une seule règle, ici, plutôt que deux copies qui divergeraient.

   LA RÈGLE (décision de Grégoire du 31 août 2026, reprise le 23 oct. pour le stock) : par ID
   d'abord, par NOM ensuite. ⚠ NE PAS DÉCOUPER LA CLÉ d'un commentaire : un id de critère
   (`genererIdUnique('CR_')`) contient déjà un souligné. On RECONNAÎT l'id qui préfixe la clé,
   le plus long gagnant si l'un préfixe l'autre.
   =============================== */

(function() {
'use strict';

/**
 * La correspondance d'une cartouche vers des critères cibles.
 * @param {{criteres?: Array<{id: string, nom?: string}>, commentaires?: Object}} cartouche
 * @param {Array<{id: string, nom?: string}>} criteresCible
 * @returns {{
 *   correspondance: Object,   // ancien id → critère cible
 *   criteres: Array<{id: string, nom: string}>,   // les critères RATTACHÉS, aux ids de la cible
 *   commentaires: Object,     // les clés rattachées réécrites ; les clés qu'aucun critère ne revendique, telles quelles
 *   nonRattaches: Array<{id: string, nom: string, commentaires: Object}>,   // critères sans cible, avec LEURS commentaires
 *   perdus: Object,           // nom (ou id) du critère sans cible → nombre de commentaires non vides
 *   sansCritere: number,      // commentaires non vides qu'aucun critère de la cartouche ne revendique
 *   collisions: Array<string> // ids cibles visés par plus d'un critère source (les commentaires s'y écraseraient)
 * }}
 */
function remapper(cartouche, criteresCible) {
    const cible = Array.isArray(criteresCible) ? criteresCible : [];
    const criteresSource = (cartouche && Array.isArray(cartouche.criteres)) ? cartouche.criteres : [];

    const correspondance = {};
    const vises = {};
    criteresSource.forEach(cs => {
        if (!cs || !cs.id) return;
        let c = cible.find(cc => cc.id === cs.id);
        if (!c && cs.nom) c = cible.find(cc => cc.nom === cs.nom);
        if (!c) return;
        correspondance[cs.id] = c;
        vises[c.id] = (vises[c.id] || 0) + 1;
    });

    const commentaires = (cartouche && cartouche.commentaires) || {};
    const commentairesRemappes = {};
    const parNonRattache = {};
    const perdus = {};
    let sansCritere = 0;

    Object.keys(commentaires).forEach(clef => {
        let source = null;
        criteresSource.forEach(cs => {
            if (!cs || !cs.id) return;
            if (clef.startsWith(cs.id + '_') && (!source || cs.id.length > source.id.length)) source = cs;
        });
        // Une clé qu'aucun critère ne revendique était déjà orpheline : elle voyage telle quelle, comptée.
        if (!source) {
            commentairesRemappes[clef] = commentaires[clef];
            if (commentaires[clef]) sansCritere++;
            return;
        }
        const c = correspondance[source.id];
        if (c) {
            commentairesRemappes[c.id + clef.slice(source.id.length)] = commentaires[clef];
            return;
        }
        (parNonRattache[source.id] = parNonRattache[source.id] || {})[clef] = commentaires[clef];
        // Seuls les commentaires NON VIDES comptent comme une perte.
        if (commentaires[clef]) perdus[source.nom || source.id] = (perdus[source.nom || source.id] || 0) + 1;
    });

    return {
        correspondance,
        criteres: criteresSource
            .filter(cs => cs && correspondance[cs.id])
            .map(cs => ({ id: correspondance[cs.id].id, nom: correspondance[cs.id].nom })),
        commentaires: commentairesRemappes,
        nonRattaches: criteresSource
            .filter(cs => cs && cs.id && !correspondance[cs.id])
            .map(cs => ({ id: cs.id, nom: cs.nom || '', commentaires: parNonRattache[cs.id] || {} })),
        perdus,
        sansCritere,
        collisions: Object.keys(vises).filter(id => vises[id] > 1)
    };
}

/**
 * La cartouche rattachée aux critères cibles SANS RIEN JETER : les critères rattachés prennent
 * l'id de la cible ; un critère sans cible reste, avec ses commentaires. Sert la réparation du
 * stock et les deux chemins qui rangent une cartouche venue d'ailleurs sous une grille locale
 * (#1144). `sur` est faux quand le rattachement écraserait un commentaire (deux critères visent la
 * même cible, ou une clé déjà là) : la cartouche est alors rendue TELLE QUELLE.
 * @returns {{cartouche: Object, r: Object, sur: boolean}}
 */
function rattacher(cartouche, criteresCible) {
    const r = remapper(cartouche, criteresCible);
    const commentaires = Object.assign({}, r.commentaires);
    r.nonRattaches.forEach(nr => Object.assign(commentaires, nr.commentaires));
    const avant = Object.keys((cartouche && cartouche.commentaires) || {}).length;
    const sur = r.collisions.length === 0 && Object.keys(commentaires).length === avant;
    if (!sur) return { cartouche, r, sur };
    const criteres = r.criteres.concat(r.nonRattaches.map(nr => ({ id: nr.id, nom: nr.nom })));
    return { cartouche: Object.assign({}, cartouche, { criteres, commentaires }), r, sur };
}

/**
 * Les critères de la grille que la cartouche ne couvre pas (aucun critère de même id). Par id
 * seulement : à la lecture, une correspondance par nom masquerait le prochain décalage.
 * @returns {Array} les critères de la grille, dans son ordre
 */
function criteresNonCouverts(grille, cartouche) {
    const ids = new Set(((cartouche && cartouche.criteres) || []).map(c => c && c.id));
    return ((grille && grille.criteres) || []).filter(c => c && !ids.has(c.id));
}

/** Les critères de la cartouche absents de la grille (par id). */
function criteresHorsGrille(cartouche, grille) {
    const ids = new Set(((grille && grille.criteres) || []).map(c => c && c.id));
    return ((cartouche && cartouche.criteres) || []).filter(c => c && !ids.has(c.id));
}

window.cartoucheCorrespondance = { remapper, rattacher, criteresNonCouverts, criteresHorsGrille };

})();
