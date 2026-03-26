/* ===============================
   MODULE: PLANIFICATION — COUCHE DONNÉES
   Gestion du stockage des cartes mentales
   via db.getSync/db.setSync + cle()

   Export: window.planificationDonnees
   =============================== */

(function() {
'use strict';

// === CONSTANTES ===
const CLE_DONNEES = 'planification_mindmap';

// Clés localStorage du prototype (pour migration)
const PROTO_PREFIXE = 'proto_cm_';
const PROTO_CLE_INDEX = PROTO_PREFIXE + 'index';

// === FONCTIONS INTERNES ===

/**
 * Récupère toutes les données de planification pour le trimestre actif.
 * Structure : { index: { active, compteurCartes, cartes: [] }, cartes: { carte_1: {...}, ... } }
 */
function getDonnees() {
    try {
        return db.getSync(cle(CLE_DONNEES), null);
    } catch (e) {
        console.warn('[Planification] Erreur lecture données :', e);
        return null;
    }
}

/**
 * Sauvegarde toutes les données de planification.
 */
function setDonnees(donnees) {
    try {
        db.setSync(cle(CLE_DONNEES), donnees);
    } catch (e) {
        console.warn('[Planification] Erreur sauvegarde données :', e);
    }
}

/**
 * Récupère l'index des cartes.
 */
function getIndex() {
    const donnees = getDonnees();
    return donnees ? donnees.index : null;
}

/**
 * Sauvegarde l'index des cartes.
 */
function sauvegarderIndex(index) {
    let donnees = getDonnees();
    if (!donnees) {
        donnees = { index: index, cartes: {} };
    } else {
        donnees.index = index;
    }
    setDonnees(donnees);
}

/**
 * Sauvegarde le contenu d'une carte spécifique.
 */
function sauvegarderCarte(carteId, contenu) {
    let donnees = getDonnees();
    if (!donnees) {
        donnees = { index: null, cartes: {} };
    }
    if (!donnees.cartes) donnees.cartes = {};
    donnees.cartes[carteId] = contenu;
    setDonnees(donnees);
}

/**
 * Charge le contenu d'une carte spécifique.
 */
function chargerCarte(carteId) {
    const donnees = getDonnees();
    if (!donnees || !donnees.cartes) return null;
    return donnees.cartes[carteId] || null;
}

/**
 * Supprime une carte du stockage.
 */
function supprimerCarte(carteId) {
    const donnees = getDonnees();
    if (!donnees || !donnees.cartes) return;
    delete donnees.cartes[carteId];
    setDonnees(donnees);
}

/**
 * Initialise la structure de données si elle n'existe pas.
 * Retourne l'index (existant ou nouvellement créé).
 */
function initialiserSiNecessaire() {
    let donnees = getDonnees();
    if (!donnees || !donnees.index || !donnees.index.cartes || donnees.index.cartes.length === 0) {
        const index = {
            active: 'carte_1',
            compteurCartes: 1,
            cartes: [{
                id: 'carte_1',
                nom: 'Sans titre',
                dateCreation: new Date().toISOString()
            }]
        };
        donnees = { index: index, cartes: {} };
        setDonnees(donnees);
        return index;
    }
    return donnees.index;
}

/**
 * Migration one-shot des données du prototype (localStorage proto_cm_*)
 * vers le format namespacé db.getSync/setSync + cle().
 */
function migrerDonneesProto() {
    // Vérifier si des données proto existent
    let protoIndex = null;
    try {
        const json = localStorage.getItem(PROTO_CLE_INDEX);
        if (json) protoIndex = JSON.parse(json);
    } catch (e) { console.warn('[Planif-Donnees] proto index JSON parse fallback:', e.message || e); }

    // Vérifier aussi l'ancien format unique
    let ancienneCarteUnique = null;
    try {
        const json = localStorage.getItem('proto_carte_mentale');
        if (json) ancienneCarteUnique = JSON.parse(json);
    } catch (e) { console.warn('[Planif-Donnees] legacy carte JSON parse fallback:', e.message || e); }

    if (!protoIndex && !ancienneCarteUnique) return false; // Rien à migrer

    // Ne pas écraser des données déjà migrées
    const existant = getDonnees();
    if (existant && existant.index && existant.index.cartes && existant.index.cartes.length > 0) {
        return false;
    }

    console.log('[Planification] Migration des données du prototype...');

    // Cas 1 : ancien format unique → convertir en multi-cartes
    if (ancienneCarteUnique && !protoIndex) {
        const index = {
            active: 'carte_1',
            compteurCartes: 1,
            cartes: [{ id: 'carte_1', nom: 'Sans titre', dateCreation: new Date().toISOString() }]
        };
        const donnees = {
            index: index,
            cartes: { 'carte_1': ancienneCarteUnique }
        };
        setDonnees(donnees);
        // Nettoyer le localStorage proto
        localStorage.removeItem('proto_carte_mentale');
        console.log('[Planification] Migration (ancien format unique) terminée.');
        return true;
    }

    // Cas 2 : format multi-cartes proto
    if (protoIndex) {
        const cartes = {};
        for (const carte of protoIndex.cartes) {
            try {
                const json = localStorage.getItem(PROTO_PREFIXE + carte.id);
                if (json) cartes[carte.id] = JSON.parse(json);
            } catch (e) { console.warn('[Planif-Donnees] carte migration JSON parse fallback:', carte.id, e.message || e); }
        }

        const donnees = {
            index: protoIndex,
            cartes: cartes
        };
        setDonnees(donnees);

        // Nettoyer le localStorage proto
        localStorage.removeItem(PROTO_CLE_INDEX);
        for (const carte of protoIndex.cartes) {
            localStorage.removeItem(PROTO_PREFIXE + carte.id);
        }
        localStorage.removeItem('proto_carte_mentale');

        console.log('[Planification] Migration (' + protoIndex.cartes.length + ' carte(s)) terminée.');
        return true;
    }

    return false;
}

/**
 * Importe un alignement depuis la bibliothèque partagée dans le trimestre actif.
 * Deep-clone les données pour éviter les références croisées.
 * @param {Object} alignementBiblio - Item de la bibliothèque { nom, donnees: { compteur, compteurLiens, noeuds, liens } }
 * @returns {string|null} ID de la nouvelle carte créée, ou null si échec
 */
function importerDepuisBibliotheque(alignementBiblio) {
    if (!alignementBiblio || !alignementBiblio.donnees) return null;

    var donnees = getDonnees();
    if (!donnees || !donnees.index) {
        // Initialiser si nécessaire
        initialiserSiNecessaire();
        donnees = getDonnees();
        if (!donnees) return null;
    }

    var index = donnees.index;
    index.compteurCartes = (index.compteurCartes || 0) + 1;
    var nouvelId = 'carte_' + index.compteurCartes;

    // Ajouter à l'index
    index.cartes.push({
        id: nouvelId,
        nom: alignementBiblio.nom || 'Alignement importé',
        dateCreation: new Date().toISOString()
    });

    // Deep-clone les données de la carte
    var contenuClone = JSON.parse(JSON.stringify(alignementBiblio.donnees));

    // Sauvegarder
    if (!donnees.cartes) donnees.cartes = {};
    donnees.cartes[nouvelId] = contenuClone;
    index.active = nouvelId;
    donnees.index = index;
    setDonnees(donnees);

    return nouvelId;
}

/**
 * Exporte une carte du trimestre actif pour la bibliothèque.
 * @param {string} carteId - ID de la carte à exporter (ex: 'carte_1')
 * @returns {Object|null} { nom, dateCreation, donnees: { compteur, compteurLiens, noeuds, liens } }
 */
function exporterCartePourBibliotheque(carteId) {
    var donnees = getDonnees();
    if (!donnees || !donnees.cartes || !donnees.cartes[carteId]) return null;

    var index = donnees.index;
    var infosCarte = null;
    if (index && index.cartes) {
        for (var i = 0; i < index.cartes.length; i++) {
            if (index.cartes[i].id === carteId) {
                infosCarte = index.cartes[i];
                break;
            }
        }
    }

    var contenu = donnees.cartes[carteId];
    return {
        nom: infosCarte ? infosCarte.nom : 'Sans titre',
        dateCreation: infosCarte ? infosCarte.dateCreation : new Date().toISOString(),
        donnees: JSON.parse(JSON.stringify({
            compteur: contenu.compteur || 0,
            compteurLiens: contenu.compteurLiens || 0,
            noeuds: contenu.noeuds || [],
            liens: contenu.liens || []
        }))
    };
}

// === EXPORT ===
window.planificationDonnees = {
    getIndex: getIndex,
    sauvegarderIndex: sauvegarderIndex,
    sauvegarderCarte: sauvegarderCarte,
    chargerCarte: chargerCarte,
    supprimerCarte: supprimerCarte,
    initialiserSiNecessaire: initialiserSiNecessaire,
    migrerDonneesProto: migrerDonneesProto,
    importerDepuisBibliotheque: importerDepuisBibliotheque,
    exporterCartePourBibliotheque: exporterCartePourBibliotheque
};

})();
