/**
 * collections-projection.js — LES COLLECTIONS DE PARAMÈTRES DE PROJECTION
 * (lot B du 5 septembre 2026 ; cadrage du 3 sept., tranché par Grégoire : LA COPIE).
 *
 * Une collection = un jeu NOMMÉ de réglages de projection — le modèle, ses
 * paramètres, ses paliers — pris sur un critère et rangé dans le trimestre
 * (clé `collectionsProjection`, namespacée par `cle()` : registre
 * CLES_NAMESPACEES de trimestres.js). La choisir dans le menu de projection d'un
 * critère COPIE ces valeurs dans le critère (`projectionAlgo.appliquerAuCritere`) :
 * le critère reste la source unique du calcul et du texte, et ne garde AUCUN
 * lien vers la collection. Corriger ou supprimer la collection ensuite ne touche
 * aucune grille, aucune évaluation — ce qu'un élève a déjà lu ne bouge pas.
 *
 * Forme d'une collection (docs/DATA-OWNERSHIP.md) :
 *   { id, nom, dateCreation, modeleId, params: { …les paramètres du modèle }, paliers: [ … ] }
 *
 * Propriétaire de la clé : ce module. Il n'écrit que par `db.modifier`
 * (durabilité, #352), sous `cle()` — jamais une clé nue —, et ne lit rien
 * d'autre que sa clé. Le registre de projection (`evaluation-projection.js`),
 * lui, ne lit toujours rien en base (sentinelle de l'aperçu, A.e).
 * Testable en Node : les fonctions pures n'ont besoin que du registre ; les
 * fonctions de stockage reçoivent `db` et `cle` des globaux.
 */
(function() {
'use strict';

var CLE = 'collectionsProjection';

function _registre() {
    if (typeof window !== 'undefined' && window.projectionAlgo) return window.projectionAlgo;
    throw new Error('[collectionsProjection] registre de projection absent');
}

function _cleStockage() {
    // ⛔ Sans `cle()`, la clé serait NUE — partagée entre trimestres et avec la
    // démo (#464). On refuse plutôt que d'écrire au mauvais endroit.
    if (typeof cle !== 'function') throw new Error('[collectionsProjection] cle() absent : la clé serait nue');
    return cle(CLE);
}

function _base() {
    if (typeof db === 'undefined' || !db) throw new Error('[collectionsProjection] db absent');
    return db;
}

function _copie(v) { return JSON.parse(JSON.stringify(v)); }
function _nomPropre(nom) { return (typeof nom === 'string') ? nom.trim() : ''; }
function _memeNom(a, b) { return _nomPropre(a).toLowerCase() === _nomPropre(b).toLowerCase(); }
function _genererId() { return 'coll_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8); }

/** Pure — le nom est-il déjà pris dans une liste ? (après trim, sans casse) */
function nomPris(liste, nom) {
    return (Array.isArray(liste) ? liste : []).some(function(c) { return c && _memeNom(c.nom, nom); });
}

/**
 * Pure — la collection qu'un critère donnerait sous ce nom, ou null (nom vide,
 * modèle qui ne projette pas). Les paramètres et les paliers sont ceux que
 * `normaliser` rend — complets, typés, ordonnés —, copiés profondément.
 */
function depuisCritere(critere, nom) {
    var propre = _nomPropre(nom);
    if (!propre) return null;
    var p = _registre().normaliser(critere);
    if (!p.modele || !p.modele.projette) return null;
    return {
        id: _genererId(),
        nom: propre,
        dateCreation: new Date().toISOString(),
        modeleId: p.modeleId,
        params: _copie(p.params),
        paliers: _copie(p.paliers)
    };
}

/** Pure — COPIE la collection dans le critère (muté) ; rend le critère. */
function appliquerCollection(critere, collection) {
    if (!critere || !collection) return null;
    return _registre().appliquerAuCritere(critere, collection.modeleId, _copie(collection.params || {}), _copie(collection.paliers || []));
}

/** Les collections du trimestre, par nom, en COPIES (le stock ne se mute pas par ici). */
function lister() {
    var brut = _base().getSync(_cleStockage(), []);
    var liste = (Array.isArray(brut) ? brut : []).filter(function(c) { return c && typeof c === 'object' && typeof c.id === 'string'; });
    return _copie(liste).sort(function(a, b) {
        return String(a.nom || '').localeCompare(String(b.nom || ''), 'fr', { sensitivity: 'base' });
    });
}

function obtenir(id) {
    return lister().find(function(c) { return c.id === id; }) || null;
}

/**
 * Enregistre les réglages d'un critère sous un nom. Rend { ok: true, collection }
 * ou { ok: false, raison: 'nom_vide' | 'sans_paliers' | 'nom_pris' } — et dans
 * ce cas rien n'est écrit. L'unicité du nom se vérifie DANS le mutateur.
 */
async function enregistrer(nom, critere) {
    if (!_nomPropre(nom)) return { ok: false, raison: 'nom_vide' };
    var collection = depuisCritere(critere, nom);
    if (!collection) return { ok: false, raison: 'sans_paliers' };
    var refus = null;
    await _base().modifier(_cleStockage(), function(lues) {
        var liste = Array.isArray(lues) ? lues : [];
        if (nomPris(liste, nom)) { refus = 'nom_pris'; return undefined; }
        return liste.concat([collection]);
    }, []);
    if (refus) return { ok: false, raison: refus };
    return { ok: true, collection: _copie(collection) };
}

/** Retire une collection ; rend true si elle existait. Aucune grille n'est touchée. */
async function supprimer(id) {
    var retiree = false;
    await _base().modifier(_cleStockage(), function(lues) {
        var liste = Array.isArray(lues) ? lues : [];
        var reste = liste.filter(function(c) { return !(c && c.id === id); });
        retiree = reste.length !== liste.length;
        return retiree ? reste : undefined;
    }, []);
    return retiree;
}

/** COPIE la collection `id` dans le critère ; rend false si l'id est inconnu (rien n'est écrit). */
function appliquer(critere, id) {
    var c = obtenir(id);
    if (!c) return false;
    appliquerCollection(critere, c);
    return true;
}

var api = {
    CLE: CLE,
    nomPris: nomPris,
    depuisCritere: depuisCritere,
    appliquerCollection: appliquerCollection,
    lister: lister,
    obtenir: obtenir,
    enregistrer: enregistrer,
    supprimer: supprimer,
    appliquer: appliquer
};

if (typeof window !== 'undefined') window.collectionsProjection = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
