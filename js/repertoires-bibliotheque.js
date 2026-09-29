/* ===============================
   RÉPERTOIRES DE CLASSEMENT DES BIBLIOTHÈQUES (#320)
   Lot L0 — modèle de données + CRUD pur. Aucune UI.

   Système de rangement par DOSSIERS EXCLUSIFS (un item dans au plus un
   répertoire de la même bibliothèque), créé librement par l'utilisateur.

   COUCHE PAR-DESSUS les bibliothèques : on ne modifie JAMAIS les items
   eux-mêmes (conformité SKILL_integrite_globaux — pas de flag/champ de
   classement greffé sur des items globaux partagés). Le classement vit
   dans une collection séparée, range PAR IDENTITÉ (itemIds).

   Clé de stockage : 'repertoiresBibliotheques' (GLOBALE, non namespacée —
   un essai classé le reste quel que soit le trimestre actif). Petite clé
   (noms + listes d'ids) → localStorage synchrone via db.getSync/setSync.

   Cadrage : plans de travail/CADRAGE-320-repertoires-bibliotheques.md
   =============================== */

(function() {
'use strict';

const CLE_REPERTOIRES = 'repertoiresBibliotheques';

// --- I/O bas niveau -------------------------------------------------------

function _lire() {
    const v = db.getSync(CLE_REPERTOIRES, []);
    return Array.isArray(v) ? v : [];
}

function _ecrire(repertoires) {
    db.setSync(CLE_REPERTOIRES, repertoires);
    if (window.signalerEcritureUsager) window.signalerEcritureUsager(CLE_REPERTOIRES);   // lot F : geste hors témoin (_ecrire)
}

function _genererId() {
    return 'rep_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

// --- Fonctions PURES (sans I/O, immuables — cœur testable) ----------------
// Chacune reçoit la collection COMPLÈTE (toutes biblios) et en retourne une
// nouvelle ; aucune mutation en place.

/**
 * Répertoires d'une bibliothèque donnée, triés par ordre d'affichage.
 */
function repertoiresPourBibliothequePur(repertoires, biblio) {
    return (repertoires || [])
        .filter(r => r && r.biblio === biblio)
        .slice()
        .sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
}

/**
 * Crée un répertoire. `nom` est trimé ; vide → aucune création.
 * `id` est injecté (déterministe pour les tests). `ordre` = max(biblio)+1.
 * @returns {{repertoires: Array, cree: Object|null}}
 */
function creerPur(repertoires, { id, nom, biblio }) {
    const base = Array.isArray(repertoires) ? repertoires : [];
    const nomNet = (nom || '').trim();
    if (!nomNet) return { repertoires: base, cree: null };

    const ordres = base.filter(r => r.biblio === biblio).map(r => r.ordre || 0);
    const ordre = ordres.length ? Math.max(...ordres) + 1 : 0;
    const cree = { id, nom: nomNet, biblio, itemIds: [], ordre };
    return { repertoires: [...base, cree], cree };
}

/**
 * Renomme un répertoire. Nom vide ou id absent → inchangé.
 */
function renommerPur(repertoires, id, nom) {
    const nomNet = (nom || '').trim();
    if (!nomNet) return repertoires || [];
    return (repertoires || []).map(r =>
        r.id === id ? { ...r, nom: nomNet } : r
    );
}

/**
 * Supprime un répertoire. Ses items repassent « non classés » (rien d'autre
 * à faire : l'appartenance n'est stockée que dans `itemIds`).
 */
function supprimerPur(repertoires, id) {
    return (repertoires || []).filter(r => r.id !== id);
}

/**
 * Range un item dans un répertoire — DOSSIER EXCLUSIF : l'item est d'abord
 * retiré de tout autre répertoire de la MÊME bibliothèque, puis ajouté à la
 * cible. Idempotent. Cible absente (ou autre biblio) → inchangé (no-op).
 */
function assignerPur(repertoires, itemId, repertoireId, biblio) {
    const cible = (repertoires || []).find(r => r.id === repertoireId && r.biblio === biblio);
    if (!cible) return repertoires || [];

    return (repertoires || []).map(r => {
        if (r.biblio !== biblio) return r;
        if (r.id === repertoireId) {
            const itemIds = r.itemIds || [];
            return itemIds.includes(itemId) ? r : { ...r, itemIds: [...itemIds, itemId] };
        }
        // exclusivité : retirer l'item des autres répertoires de la biblio
        if ((r.itemIds || []).includes(itemId)) {
            return { ...r, itemIds: r.itemIds.filter(x => x !== itemId) };
        }
        return r;
    });
}

/**
 * Retire un item de tous les répertoires d'une bibliothèque (→ non classé).
 * Sert aussi de hook de cohérence quand une pratique est supprimée.
 */
function retirerItemPur(repertoires, itemId, biblio) {
    return (repertoires || []).map(r => {
        if (r.biblio !== biblio) return r;
        if (!(r.itemIds || []).includes(itemId)) return r;
        return { ...r, itemIds: r.itemIds.filter(x => x !== itemId) };
    });
}

/**
 * Ids du pool qui n'appartiennent à aucun répertoire de la bibliothèque.
 * `idsPool` = ids des items actuellement affichables. Tolère les orphelins
 * (un itemId classé dont l'item n'existe plus est simplement ignoré ici).
 */
function itemsNonClassesPur(repertoires, idsPool, biblio) {
    const classes = new Set();
    repertoiresPourBibliothequePur(repertoires, biblio).forEach(r => {
        (r.itemIds || []).forEach(id => classes.add(id));
    });
    return (idsPool || []).filter(id => !classes.has(id));
}

/**
 * Groupe une liste d'items par répertoire (dossiers exclusifs), pour l'affichage.
 * Retourne `[{ id, titre, items }]` : un groupe par répertoire NON VIDE (dans
 * l'ordre), suivi d'un groupe « Non classées » (id null) s'il reste des items.
 * `getId` extrait l'identité d'un item (défaut : it.id) — permet de grouper des
 * cartes/vues, pas seulement des items bruts. Tolère les ids orphelins.
 */
function grouperPur(items, repertoires, biblio, getId) {
    var idDe = getId || function (it) { return it.id; };
    var reps = repertoiresPourBibliothequePur(repertoires, biblio);
    var assigne = {};
    reps.forEach(function (r) { (r.itemIds || []).forEach(function (id) { assigne[id] = true; }); });

    var groupes = [];
    reps.forEach(function (r) {
        var dans = (items || []).filter(function (it) { return (r.itemIds || []).indexOf(idDe(it)) !== -1; });
        if (dans.length) groupes.push({ id: r.id, titre: r.nom, items: dans });
    });
    var nonClasses = (items || []).filter(function (it) { return !assigne[idDe(it)]; });
    if (nonClasses.length) groupes.push({ id: null, titre: 'Non classées', items: nonClasses });
    return groupes;
}

// --- Fonctions PUBLIQUES (I/O = lire → transformer pur → écrire) ----------

function obtenir(biblio = 'pratiques') {
    return repertoiresPourBibliothequePur(_lire(), biblio);
}

function creer(nom, biblio = 'pratiques') {
    const { repertoires, cree } = creerPur(_lire(), { id: _genererId(), nom, biblio });
    if (!cree) return null;
    _ecrire(repertoires);
    return cree;
}

function renommer(id, nom) {
    _ecrire(renommerPur(_lire(), id, nom));
}

function supprimer(id) {
    _ecrire(supprimerPur(_lire(), id));
}

function assigner(itemId, repertoireId, biblio = 'pratiques') {
    _ecrire(assignerPur(_lire(), itemId, repertoireId, biblio));
}

function retirerItem(itemId, biblio = 'pratiques') {
    _ecrire(retirerItemPur(_lire(), itemId, biblio));
}

function itemsNonClasses(idsPool, biblio = 'pratiques') {
    return itemsNonClassesPur(_lire(), idsPool, biblio);
}

function grouper(items, biblio = 'pratiques', getId) {
    return grouperPur(items, _lire(), biblio, getId);
}

// --- Export ---------------------------------------------------------------

window.repertoiresBibliotheque = {
    CLE_REPERTOIRES,
    // pures (testables)
    repertoiresPourBibliothequePur,
    creerPur,
    renommerPur,
    supprimerPur,
    assignerPur,
    retirerItemPur,
    itemsNonClassesPur,
    grouperPur,
    // publiques (I/O)
    obtenir,
    creer,
    renommer,
    supprimer,
    assigner,
    retirerItem,
    itemsNonClasses,
    grouper
};

})();
