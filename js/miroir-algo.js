/* ===============================
   MODULE MIROIR-ALGO — Le critère algorithmique, étape 1 : le miroir
   Date : 22 octobre 2026 (consigne `CONSIGNE-LOT-2026-10-21-critere-algorithmique-miroir.md`,
   plan `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, étape 1)

   Vocation
     Pendant qu'il règle son critère algorithmique, l'enseignant·e voit ce que sa règle donne
     sur quelques copies FICTIVES : la note, et ce que l'élève lirait. C'est ce qu'un tableur
     ne fait pas : vérifier que la formule dit ce qu'il pense.

   UN SEUL CALCUL
     Rien n'est calculé ici qui ne le soit déjà à l'évaluation : la note sort de
     `formulesAlgo.calculer`, la phrase de `enoncesAlgo.enonce` (avec `mentionPonderee`, comme
     `calculerNoteAlgorithmiqueSimple`), la projection de `projectionAlgo.calculer`, la somme
     pondérée de `codesAnnotation.sommePonderee` (celle d'Annoter). Aucune formule recopiée.
     La note affichée est celle que l'évaluation retient : le pourcentage BORNÉ (`pctBorne`,
     ce que `evaluation-calcul.js` garde sous `pourcentage`), ramené à la pondération.

   LA RÈGLE DES COPIES — tous les nombres viennent des réglages de la grille
     · Leur étendue (les « mots ») : la longueur de référence de la PROJECTION, si elle projette
       (`motsReference`, la longueur où ses paliers se lisent) ; sinon celle de la FORMULE quand
       son modèle en a une (`facteurNormalisation`) ; sinon, pour le ratio visé, dix fois le
       ratio visé (la copie où dix erreurs gardent la note complète) ; sinon aucune : la copie
       est sans étendue, et l'évaluation recevrait 0, comme un champ laissé vide.
       ⚠ La projection passe AVANT le facteur, et c'est mesuré : une copie longue du facteur
       perd toujours « pondération × erreurs ÷ facteur × facteur », un point par erreur quel que
       soit le facteur — changer le facteur ne changerait aucune note. Sans projection, c'est
       pourtant la seule longueur que la grille donne : les notes restent celles d'une copie à
       la longueur de référence, et c'est ce que la formule dit (l'étape 2 nommera l'étendue).
     · « Aucune » : 0 erreur.
     · « Beaucoup » : le premier nombre d'erreurs où la note touche le plancher (0 %), cherché
       par la formule elle-même ; une formule qui n'y arrive jamais (ratio visé) : le premier
       nombre où elle tombe à la moitié.
     · « Quelques-unes » : le quart de « beaucoup », arrondi, au moins 1.
     · « Égalité » (lot 3a, 26 oct.) : au moins deux codes posables ; voir `_copieEgalite`.
     · « Pondérée » : seulement si le critère tire ses codes de ses sous-critères
       (`donneSesCodes`) et qu'un code ne pèse pas 1. Autant d'erreurs que « quelques-unes »,
       partagées entre le code le plus lourd et le plus léger (le plus lourd prend la moitié
       arrondie vers le haut) : la parenthèse « (N après pondération) » et son effet sur la note.
     Sans pondération du critère, aucune note ne se calcule : aucune copie, une phrase le dit.

   LES MOTS
     Tous ceux du miroir passent par `libelles(critere)`. Étape 2a (22 oct. 2026) : ce que la
     copie compte et ce à quoi elle le rapporte portent les deux noms du critère
     (`enoncesAlgo.noms`) ; aucun mot de discipline.

   ↻ #1150, LOT 4 (24 oct. 2026) : le bloc « Essai sur des copies fictives » de la carte « Formule » est
     parti ; « Ce que l'élève lira », dans l'atelier du critère (js/atelier-algo.js), règle UNE copie
     fictive par `essayer`, à partir de `copies` (les trois copies de référence) et de `etendue`. Ses
     libellés de liste (titre, intro, « L'élève lira : », « aucune phrase ») sont partis avec le bloc.

   LECTURE SEULE : rien n'est écrit dans le critère, la grille ni le stockage.
   Dépendances (lues à l'appel, sur `window`) : formulesAlgo, enoncesAlgo, projectionAlgo,
   codesAnnotation.
   =============================== */

(function() {
'use strict';

// #1137 (22 oct. 2026) : les nombres affichés passent par js/note-pourcentage.js, que index.html
// charge avant ce module ; un banc Node (`require`) le requiert.
var _formaterNombre = (typeof window !== 'undefined' && typeof window.formaterNombre === 'function')
    ? window.formaterNombre : require('./note-pourcentage.js').formaterNombre;

// Borne de la recherche du plancher : une borne de RECHERCHE, pas une longueur de copie.
var PLAFOND_RECHERCHE = 100000;

function _reg(nom) {
    return (typeof window !== 'undefined' && window[nom]) ? window[nom] : null;
}

/** Le nombre et son nom, accordé par la règle unique des énoncés (le singulier sous 2). */
function _accord(n, paire) {
    var E = _reg('enoncesAlgo');
    var nom = E ? E.accorder(n, paire) : (Math.abs(Number(n)) >= 2 ? paire.pluriel : paire.singulier);
    return _formaterNombre(n) + ' ' + nom;
}

/** Les noms du critère — « erreur » et « mot » sans le registre (un banc qui ne le charge pas). */
function _noms(critere) {
    var E = _reg('enoncesAlgo');
    return E ? E.noms(critere)
        : { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } };
}

/**
 * LES MOTS DU MIROIR — la seule fonction de libellés. Étape 2a (22 oct. 2026) : les deux noms
 * du critère. ⚠ Sans « de » devant un nom (« nombre de unités ») : le nom du champ, entre
 * guillemets, comme le libellé de l'évaluation (`enEtiquette`, au pluriel).
 */
function libelles(critere) {
    var N = _noms(critere);
    var E = _reg('enoncesAlgo');
    var champMots = '« ' + (E ? E.enEtiquette(N.mots.pluriel) : N.mots.pluriel) + ' »';
    return {
        occurrences: function(n) { return _accord(n, N.erreurs); },
        etendue: function(n) { return _accord(n, N.mots); },
        sansEtendue: 'champ ' + champMots + ' vide',
        code: function(nombre, nom, poids) { return _formaterNombre(nombre) + ' × « ' + nom + ' » (poids ' + _formaterNombre(poids) + ')'; },
        plancher: 'la note touche le plancher',
        noteImpossible: 'aucune note : la formule a besoin du champ ' + champMots,
        sansPonderation: 'Donne une pondération à ce critère : l\'essai montrera la note de chaque copie.',
        etendueDuFacteur: 'Sans projection, ces copies ont la longueur du facteur : chaque ' + N.erreurs.singulier + ' y coûte un point, quel que soit le facteur.'
    };
}

/** La pondération du critère, ou null quand aucune note ne peut se calculer. */
function _ponderation(critere) {
    var p = Number(critere && critere.ponderation);
    return (isFinite(p) && p > 0) ? p : null;
}

/**
 * D'où vient l'étendue des copies (voir « La règle des copies ») : {origine, mots}, origine
 * 'projection' | 'facteur' | 'ratio' | null (copie sans étendue, mots null).
 */
function sourceEtendue(critere) {
    var F = _reg('formulesAlgo');
    var P = _reg('projectionAlgo');
    var p = P ? P.normaliser(critere) : null;
    if (p && p.modele.projette && isFinite(Number(p.params.motsReference))) return { origine: 'projection', mots: Number(p.params.motsReference) };
    var f = F ? F.normaliser(critere) : null;
    if (f && isFinite(Number(f.params.facteurNormalisation))) return { origine: 'facteur', mots: Number(f.params.facteurNormalisation) };
    if (f && isFinite(Number(f.params.motsParErreurCible))) return { origine: 'ratio', mots: Number(f.params.motsParErreurCible) * 10 };
    return { origine: null, mots: null };
}

/** L'étendue des copies, ou null : copie sans étendue. */
function etendue(critere) {
    return sourceEtendue(critere).mots;
}

/** La note de la formule pour `erreurs` (ce que la formule reçoit) sur une copie de `mots`. */
function _calculer(critere, ponderation, erreurs, mots) {
    return _reg('formulesAlgo').calculer(critere, { ponderation: ponderation, erreurs: erreurs, mots: mots || 0 });
}

/**
 * Le plus petit nombre entier d'erreurs (≥ 1) dont la note satisfait `accepte`, ou null.
 * La note ne croît jamais avec les erreurs (les trois modèles) : doublement, puis dichotomie.
 */
function _premier(critere, ponderation, mots, accepte) {
    var ok = function(e) { var r = _calculer(critere, ponderation, e, mots); return r.applicable && accepte(r); };
    var haut = 1;
    while (haut < PLAFOND_RECHERCHE && !ok(haut)) haut *= 2;
    if (haut >= PLAFOND_RECHERCHE) {
        if (!ok(PLAFOND_RECHERCHE)) return null;
        haut = PLAFOND_RECHERCHE;
    }
    var bas = Math.floor(haut / 2);   // échoue (ou vaut 0)
    while (haut - bas > 1) {
        var milieu = Math.floor((haut + bas) / 2);
        if (ok(milieu)) haut = milieu; else bas = milieu;
    }
    return haut;
}

/** La grille d'un seul critère : pour que les codes posés se lisent sous CE critère. */
function _grilleDe(critere) {
    return { criteres: [critere] };
}

/** La copie pondérée, ou null (voir « La règle des copies »). */
function _copiePonderee(critere, nombre, mots) {
    var C = _reg('codesAnnotation');
    if (!C || !C.donneSesCodes(critere)) return null;
    var codes = C.apercuCodes(critere);
    if (!codes.some(function(c) { return Number(c.poids) !== 1; })) return null;
    var lourd = codes[0], leger = codes[0];
    codes.forEach(function(c) {
        if (Number(c.poids) > Number(lourd.poids)) lourd = c;
        if (Number(c.poids) < Number(leger.poids)) leger = c;
    });
    var compteurs = {};
    var repartition = [];
    var poses = [];
    var poser = function(c, k) { for (var i = 0; i < k; i++) poses.push(c.id); };
    if (lourd.id === leger.id) {
        compteurs[lourd.id] = nombre;
        repartition.push({ code: lourd.code, nom: lourd.nom, poids: Number(lourd.poids), nombre: nombre });
        poser(lourd, nombre);
    } else {
        var nLourd = Math.ceil(nombre / 2);
        var nLeger = nombre - nLourd;
        compteurs[lourd.id] = nLourd;
        repartition.push({ code: lourd.code, nom: lourd.nom, poids: Number(lourd.poids), nombre: nLourd });
        poser(lourd, nLourd);
        if (nLeger > 0) {
            compteurs[leger.id] = nLeger;
            repartition.push({ code: leger.code, nom: leger.nom, poids: Number(leger.poids), nombre: nLeger });
            poser(leger, nLeger);
        }
    }
    return {
        cle: 'ponderee', erreurs: nombre, mots: mots,
        erreursFormule: C.sommePonderee(_grilleDe(critere), compteurs),
        codes: repartition, poses: poses
    };
}

/**
 * LA COPIE « ÉGALITÉ » (lot 3a de la table de cas, 26 oct. 2026) — seulement si le critère a au moins deux
 * codes posables : les deux premiers de sa liste, posés deux fois chacun, LE SECOND POSÉ LE PREMIER. C'est
 * la copie où la règle d'égalité se voit : un critère neuf lit le premier de sa liste, un critère existant
 * le premier posé (`codesAnnotation.lePlusFrequent`). `codes` dit l'ordre de pose.
 */
function _copieEgalite(critere, mots) {
    var C = _reg('codesAnnotation');
    if (!C || !C.donneSesCodes(critere)) return null;
    var codes = C.apercuCodes(critere);
    if (codes.length < 2) return null;
    var premier = codes[0], second = codes[1];
    var compteurs = {};
    compteurs[premier.id] = 2;
    compteurs[second.id] = 2;
    return {
        cle: 'egalite', erreurs: 4, mots: mots,
        erreursFormule: C.sommePonderee(_grilleDe(critere), compteurs),
        codes: [second, premier].map(function(c) { return { code: c.code, nom: c.nom, poids: Number(c.poids), nombre: 2 }; }),
        poses: [second.id, premier.id, second.id, premier.id]
    };
}

/**
 * Les copies fictives du miroir, dans l'ordre d'affichage. `[]` sans pondération.
 * Chacune : {cle, erreurs (le nombre brut, ce que l'élève lit), erreursFormule (ce que la
 * formule reçoit), mots (null : sans étendue), codes ([] hors copie pondérée)}.
 */
function copies(critere) {
    var ponderation = _ponderation(critere);
    if (ponderation === null || !_reg('formulesAlgo')) return [];
    var mots = etendue(critere);
    var plancher = _premier(critere, ponderation, mots, function(r) { return r.pctBorne <= 0; });
    var beaucoup = (plancher !== null) ? plancher
        : _premier(critere, ponderation, mots, function(r) { return r.pctBorne <= 50; });
    var liste = [{ cle: 'aucune', erreurs: 0 }];
    if (beaucoup !== null) {
        var quelques = Math.max(1, Math.round(beaucoup / 4));
        if (quelques < beaucoup) liste.push({ cle: 'quelques', erreurs: quelques });
        liste.push({ cle: 'beaucoup', erreurs: beaucoup });
        var ponderee = _copiePonderee(critere, quelques, mots);
        if (ponderee) liste.push(ponderee);
    }
    var egalite = _copieEgalite(critere, mots);
    if (egalite) liste.push(egalite);
    return liste.map(function(c) {
        var copie = {
            cle: c.cle, erreurs: c.erreurs, mots: mots,
            erreursFormule: (c.erreursFormule !== undefined) ? c.erreursFormule : c.erreurs,
            codes: c.codes || []
        };
        if (c.poses) copie.poses = c.poses.slice();
        return copie;
    });
}

/**
 * Ce que l'évaluation ferait d'une copie : la note et la phrase de l'élève.
 * @returns {{copie, applicable, points, pourcentage, plancher, decompte, projection, eleve}}
 */
function essayer(critere, copie) {
    var E = _reg('enoncesAlgo');
    var P = _reg('projectionAlgo');
    var ponderation = _ponderation(critere);
    var res = _calculer(critere, ponderation, copie.erreursFormule, copie.mots);
    var mots = copie.mots || 0;
    var mention = E ? E.mentionPonderee(copie.erreurs, copie.erreursFormule) : '';
    var decompte = E ? E.enonce(critere, 'decompte', { erreurs: copie.erreurs, mots: mots, points: mention }) : '';
    var proj = P ? P.calculer(critere, { erreurs: copie.erreurs, mots: mots }) : null;
    var projection = (proj && proj.applicable) ? (proj.texte || '') : '';
    return {
        copie: copie,
        applicable: res.applicable,
        points: res.applicable ? res.pctBorne * ponderation / 100 : null,
        pourcentage: res.applicable ? res.pctBorne : null,
        plancher: res.applicable && res.pctBorne <= 0,
        mention: mention,
        decompte: decompte,
        projection: projection,
        eleve: [decompte, projection].filter(Boolean).join(' ')
    };
}

/** Les copies et leurs résultats, d'un geste. */
function essais(critere) {
    return copies(critere).map(function(c) { return essayer(critere, c); });
}

var api = {
    libelles: libelles,
    sourceEtendue: sourceEtendue,
    etendue: etendue,
    copies: copies,
    essayer: essayer,
    essais: essais
};

if (typeof window !== 'undefined') window.miroirAlgo = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
