/* ===============================
   MODULE CARTOUCHES-DECALEES — #1144 : mesurer, et réparer sur accord, les cartouches rangées
   sous une grille avec les critères d'une autre (23 oct. 2026)

   LE STOCK. Le correctif de l'écran (evaluation-chargement.js, `cartoucheSelectionnee` : les
   critères affichés sont ceux de la grille) rend ces cartouches inoffensives à l'évaluation,
   mais leurs commentaires restent indexés par des ids que la grille ne porte pas : ils ne
   s'affichent jamais. Mesuré par Cowork le 23 oct. chez Grégoire : deux cartouches, « Plan de
   rédaction (refonte A26) » sous G5H (quatre critères aux ids de G4H) et « Rédaction (refonte
   A26) » sous G5M (quatre aux ids d'une grille absente). CLAUDE.md, « tarir n'est pas réparer ».

   À LA CONSOLE de l'onglet, sur le modèle de `ComptesErreurs` (comptes-erreurs-stock.js) :
     await CartouchesDecalees.verifier()                    → la liste ; n'écrit RIEN
     await CartouchesDecalees.verifier({ reparer: true })   → réécrit les seules cartouches listées
   ⛔ La réparation écrit dans ses données : accord de Grégoire du 23 oct., 13 h 25 (rattacher par
   le NOM), et un codex à jour exigé (`Codex.estAJour`) : c'est la copie de l'état d'avant.

   CE QUI EST RÉPARÉ. La correspondance est celle du déplacement de cartouches
   (`cartoucheCorrespondance.remapper` : id, puis nom). Un critère qui ne trouve aucun critère
   de la grille RESTE dans la cartouche avec ses commentaires, et il est listé : rien n'est jeté.
   Pas de proposition (la cartouche est listée, rien n'est écrit pour elle) si deux critères
   visent le même critère de la grille, ou si le nombre de commentaires ne se conserve pas.

   PÉRIMÈTRE : le trimestre actif, et les seules clés `cartouches_<id>` dont la grille existe.
   Les clés qui pointent une grille absente (anciennes orphelines) sont hors lot. Jamais A2025 ni
   H2026 (décision du 1er sept. 2026 : ces notes ne sont pas rouvertes).
   =============================== */

(function() {
'use strict';

var TRIMESTRES_FERMES = ['a2025', 'h2026'];   // 1er sept. 2026 : ces notes ne sont pas rouvertes

/**
 * La ligne d'une cartouche décalée, et sa réparation proposée. Pure.
 * @returns {Object|null} null si tous ses critères sont dans la grille
 */
function examiner(cartouche, grille) {
    var C = window.cartoucheCorrespondance;
    var horsGrille = C.criteresHorsGrille(cartouche, grille);
    if (horsGrille.length === 0) return null;
    var t = C.rattacher(cartouche, grille.criteres || []);
    var r = t.r;
    var reparee = t.cartouche;
    var rattaches = horsGrille.filter(function(c) { return r.correspondance[c.id]; })
        .map(function(c) { return c.nom + ' → ' + r.correspondance[c.id].nom; });

    var ligne = {
        grille: grille.nom || grille.id,
        grilleId: grille.id,
        cartouche: cartouche.nom || cartouche.id,
        cartoucheId: cartouche.id,
        rattaches: rattaches,
        nonRattaches: r.nonRattaches.map(function(nr) {
            return nr.nom + ' (' + Object.keys(nr.commentaires).filter(function(k) { return nr.commentaires[k]; }).length + ' commentaire(s), gardés)';
        }),
        nonCouverts: C.criteresNonCouverts(grille, reparee).map(function(c) { return c.nom || c.id; }),
        proposition: t.sur && rattaches.length > 0
    };
    if (cartouche.grilleId && cartouche.grilleId !== grille.id) ligne.champGrilleId = cartouche.grilleId;
    if (r.collisions.length) ligne.pourquoi = 'deux critères de la cartouche visent le même critère de la grille';
    else if (!t.sur) ligne.pourquoi = 'le rattachement écraserait un commentaire';
    else if (!ligne.proposition) ligne.pourquoi = 'aucun critère ne se rattache';
    ligne._reparee = reparee;
    return ligne;
}

/** La mesure, sans rien écrire. `lire(grilleId)` rend la liste des cartouches rangées sous cette grille. */
function mesurer(grilles, lire) {
    var rapport = { examinees: 0, decalees: [] };
    (grilles || []).forEach(function(grille) {
        if (!grille || !grille.id) return;
        var cartouches = lire(grille.id);
        if (!Array.isArray(cartouches)) return;
        cartouches.forEach(function(cartouche) {
            if (!cartouche || !Array.isArray(cartouche.criteres)) return;
            rapport.examinees++;
            var ligne = examiner(cartouche, grille);
            if (ligne) rapport.decalees.push(ligne);
        });
    });
    return rapport;
}

function _sansInterne(ligne) {
    var l = {};
    Object.keys(ligne).forEach(function(k) { if (k.charAt(0) !== '_') l[k] = ligne[k]; });
    return l;
}

/**
 * Réécrit, sous une grille, les seules cartouches `ids`, par la file : la mesure est refaite
 * sur ce que lit l'écriture. Rend ce qui est écrit, ou null si l'écriture a échoué ou été refusée.
 */
async function _ecrireSousGrille(grille, ids) {
    var ecritesIci = [];
    var resultat;
    try {
        resultat = await modifierEtAnnoncer(cle('cartouches_' + grille.id), function(lues) {
            ecritesIci = [];
            if (!Array.isArray(lues)) return undefined;
            var liste = lues.map(function(c) {
                if (!c || ids.indexOf(c.id) === -1 || !Array.isArray(c.criteres)) return c;
                var ligne = examiner(c, grille);
                if (!ligne || !ligne.proposition) return c;
                ecritesIci.push({ grille: ligne.grille, cartouche: ligne.cartouche, rattaches: ligne.rattaches });
                return ligne._reparee;
            });
            return ecritesIci.length ? liste : undefined;
        }, [], { geste: 'Réparation des cartouches décalées (#1144)' });
    } catch (e) {
        return null;   // le témoin a dit l'échec
    }
    if (resultat === undefined && ecritesIci.length) return null;   // refusée (trimestre clos, garde)
    return resultat === undefined ? [] : ecritesIci;
}

/**
 * La fonction de console. Sans paramètre : la mesure, rien d'écrit. `{ reparer: true }` : la
 * réparation des cartouches proposées par cette mesure, refaite sur ce que lit chaque écriture.
 * @param {{reparer?: boolean}} [options]
 * @returns {Promise<Object|null>} le rapport (et `ecrites` après une réparation) ; null sur refus
 */
async function verifier(options) {
    var trimestre = (typeof window.obtenirTrimestreId === 'function') ? window.obtenirTrimestreId() : null;
    if (!trimestre || TRIMESTRES_FERMES.indexOf(String(trimestre).toLowerCase()) !== -1) {
        console.warn('[#1144] Refusé : le trimestre actif (' + trimestre + ') n\'est pas mesuré. Les notes d\'A2025 et d\'H2026 ne sont pas rouvertes.');
        return null;
    }
    var grilles = db.getSync(cle('grillesTemplates'), []) || [];
    var rapport = mesurer(grilles, function(id) { return db.getSync(cle('cartouches_' + id), []); });
    var sortie = { trimestre: trimestre, examinees: rapport.examinees, decalees: rapport.decalees.map(_sansInterne) };
    var proposees = rapport.decalees.filter(function(l) { return l.proposition; });
    console.warn('[#1144] ' + rapport.examinees + ' cartouche(s) examinée(s) dans ' + trimestre + ' : '
        + rapport.decalees.length + ' dont un critère n\'est pas dans leur grille, ' + proposees.length + ' à rattacher.');
    sortie.decalees.forEach(function(l) {
        console.warn('[#1144] « ' + l.cartouche + ' » sous « ' + l.grille + ' »'
            + (l.proposition ? '' : ' — SANS PROPOSITION : ' + l.pourquoi)
            + (l.rattaches.length ? ' · rattachés : ' + l.rattaches.join(', ') : '')
            + (l.nonRattaches.length ? ' · sans critère dans la grille : ' + l.nonRattaches.join(', ') : '')
            + (l.nonCouverts.length ? ' · critères de la grille sans commentaires : ' + l.nonCouverts.join(', ') : ''));
    });
    if (!options || options.reparer !== true) return sortie;

    // ⛔ L'ÉCRITURE : un codex à jour d'abord, et rien d'autre que les cartouches proposées.
    if (typeof window.Codex === 'undefined' || typeof window.Codex.estAJour !== 'function' || !window.Codex.estAJour()) {
        console.warn('[#1144] Réparation refusée : mets d\'abord ton codex à jour (menu Codex), puis relance. Rien n\'est écrit.');
        return null;
    }
    var ecrites = [];
    var parGrille = {};
    proposees.forEach(function(l) { (parGrille[l.grilleId] = parGrille[l.grilleId] || []).push(l.cartoucheId); });
    for (var grilleId in parGrille) {
        var grille = grilles.find(function(g) { return g.id === grilleId; });
        var ecritesIci = await _ecrireSousGrille(grille, parGrille[grilleId]);
        if (ecritesIci === null) {
            console.warn('[#1144] L\'écriture sous « ' + (grille.nom || grilleId) + ' » a échoué : rien n\'y est réparé.');
            continue;
        }
        ecrites = ecrites.concat(ecritesIci);
    }
    console.warn('[#1144] ' + ecrites.length + ' cartouche(s) rattachée(s) à leur grille.');
    sortie.ecrites = ecrites;
    return sortie;
}

window.CartouchesDecalees = { verifier: verifier, mesurer: mesurer };

})();
