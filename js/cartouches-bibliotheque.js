/* ===============================
   BIBLIOTHÈQUE DE CARTOUCHES DE RÉTROACTION
   ✅ REFACTORING (2 janvier 2026)

   Bibliothèque de cartouches de rétroaction.
   - Indépendante du trimestre (clé non-namespacée)
   - Stockage dans IndexedDB/localStorage
   - Import/export avec collègues
   - Plus de données hardcodées

   Clé de stockage: 'bibliothequeCartouches' (sans namespace)
   =============================== */

(function() {
'use strict';

/**
 * Clé de stockage pour la bibliothèque (NON namespacée = partagée entre trimestres)
 */
const CLE_BIBLIOTHEQUE_CARTOUCHES = 'bibliothequeCartouches';

/**
 * Obtenir toutes les cartouches de la bibliothèque
 * @returns {Promise<Array>} Tableau de toutes les cartouches disponibles
 */
async function obtenirToutesLesCartouchesBibliotheque() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_CARTOUCHES) || [];
    return bibliotheque;
}

/**
 * Version synchrone pour compatibilité
 * @returns {Array} Tableau de toutes les cartouches disponibles
 */
function obtenirToutesLesCartouchesBibliothequeSync() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_CARTOUCHES) || [];
    return bibliotheque;
}

/**
 * Obtenir les cartouches d'une discipline spécifique
 * @param {string} discipline - Nom de la discipline
 * @returns {Array} Tableau des cartouches de cette discipline
 */
function obtenirCartouchesParDiscipline(discipline) {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_CARTOUCHES) || [];
    if (!discipline || discipline === 'toutes') {
        return bibliotheque;
    }
    return bibliotheque.filter(c =>
        c.discipline && c.discipline.toLowerCase() === discipline.toLowerCase()
    );
}

/**
 * Obtenir la liste des disciplines disponibles dans la bibliothèque
 * @returns {Array} Tableau des noms de disciplines uniques
 */
function obtenirDisciplinesDisponiblesCartouches() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_CARTOUCHES) || [];
    const disciplines = new Set();

    bibliotheque.forEach(cartouche => {
        if (cartouche.discipline) {
            disciplines.add(cartouche.discipline);
        }
    });

    return Array.from(disciplines).sort();
}

/**
 * Ajouter une cartouche à la Bibliothèque
 * @param {Object} cartouche - La cartouche à ajouter
 * @returns {Promise<boolean>} true si ajoutée, false si déjà existante
 */
async function ajouterCartoucheALaBibliotheque(cartouche) {
    // B-β — passage obligé par assainirObjet.
    const cartoucheSafe = (typeof window.assainirObjet === 'function' && window.SCHEMAS_IMPORT && window.SCHEMAS_IMPORT.cartouche)
        ? window.assainirObjet(cartouche, window.SCHEMAS_IMPORT.cartouche)
        : cartouche;

    // #599 — la présence est vérifiée DANS la file. Hors file, deux ajouts
    // concurrents du même item passaient tous les deux, et la bibliothèque
    // partagée gardait un doublon que rien ne signalait.
    let dejaPresente = false;
    const ecritLotF = await db.modifier(CLE_BIBLIOTHEQUE_CARTOUCHES, (lues) => {
        const bibliotheque = lues || [];

        const existe = bibliotheque.some(c => c.id === cartoucheSafe.id);
        if (existe) {
            dejaPresente = true;
            return undefined;
        }

        // 🆕 Beta 95.4 : Obtenir l'auteur depuis le profil enseignant si non défini
        const auteur = cartoucheSafe.auteur || (typeof obtenirProfilAuteurActifSync === 'function' ? obtenirProfilAuteurActifSync()?.auteur_original : null) || 'Inconnu';

        const cartoucheBiblio = {
        ...cartoucheSafe,
        dansBibliotheque: true,
        dateAjoutBiblio: new Date().toISOString(),
        auteur: auteur
        };

        bibliotheque.push(cartoucheBiblio);
        return bibliotheque;
    }, []);
    if (ecritLotF !== undefined && window.signalerEcritureUsager) window.signalerEcritureUsager(CLE_BIBLIOTHEQUE_CARTOUCHES);   // lot F : geste hors témoin (ajouterCartoucheALaBibliotheque)   // #982 : machine (seul appelant : la migration au démarrage) — le codex apprend, l'écran se tait

    if (dejaPresente) {
        return false;
    }

    return true;
}

/**
 * Retirer une cartouche de la bibliothèque
 * @param {string} cartoucheId - ID de la cartouche à retirer
 * @returns {Promise<boolean>} true si retirée, false si non trouvée
 */
async function retirerCartoucheDeLaBibliotheque(cartoucheId) {
    // #599 — le retrait passe par la file. Hors file, un retrait et un ajout
    // concurrents sur la MÊME Bibliothèque s'écrasaient l'un l'autre :
    // les cinq familles écrivent dans un seul magasin, pas un par famille.
    let retiree = false;
    const ecritLotF = await db.modifier(CLE_BIBLIOTHEQUE_CARTOUCHES, (lues) => {
        const bibliotheque = lues || [];
        const restants = bibliotheque.filter(c => c.id !== cartoucheId);

        // Rien retiré : le mutateur rend `undefined`, aucune écriture.
        if (restants.length === bibliotheque.length) return undefined;

        retiree = true;
        return restants;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_BIBLIOTHEQUE_CARTOUCHES);   // lot F : geste hors témoin (retirerCartoucheDeLaBibliotheque)

    if (!retiree) {
        return false;
    }
    return true;
}

/**
 * Importer des cartouches dans la bibliothèque
 * @param {Array} cartouches - Tableau de cartouches à importer
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function importerCartouchesDansBibliotheque(cartouches) {
    let ajoutees = 0;
    let existantes = 0;

    for (const cartouche of cartouches) {
        const resultat = await ajouterCartoucheALaBibliotheque(cartouche);
        if (resultat) {
            ajoutees++;
        } else {
            existantes++;
        }
    }

    return { ajoutees, existantes };
}

/**
 * Exporter toute la bibliothèque de cartouches
 * @returns {Promise<Object>} Objet JSON exportable
 */
async function exporterBibliothequeCartouches() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_CARTOUCHES) || [];
    const cartouches = typeof ajouterMetadonnéesCC === 'function'
        ? bibliotheque.map(c => ajouterMetadonnéesCC(c, 'cartouche', c.nom || '').contenu || c)
        : bibliotheque;

    return {
        version: '1.0',
        type: 'cartouches',
        dateExport: new Date().toISOString(),
        nombreCartouches: cartouches.length,
        cartouches
    };
}

/**
 * Migrer les cartouches d'un trimestre vers la Bibliothèque
 * @param {string} cleSource - Clé source (ex: 'a2025_cartouches')
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function migrerCartouchesVersBibliotheque(cleSource) {
    const cartouches = db.getSync(cleSource, null);
    if (!cartouches) {
        return { ajoutees: 0, existantes: 0 };
    }
    if (!Array.isArray(cartouches)) {
        return { ajoutees: 0, existantes: 0 };
    }

    return await importerCartouchesDansBibliotheque(cartouches);
}

/**
 * Obtenir le nombre de cartouches dans la bibliothèque
 * @returns {number}
 */
function getNombreCartouchesBibliotheque() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_CARTOUCHES) || [];
    return bibliotheque.length;
}

// ===========================
// EXPORTS GLOBAUX
// ===========================
window.obtenirToutesLesCartouchesBibliotheque = obtenirToutesLesCartouchesBibliotheque;
window.obtenirToutesLesCartouchesBibliothequeSync = obtenirToutesLesCartouchesBibliothequeSync;
window.obtenirCartouchesParDiscipline = obtenirCartouchesParDiscipline;
window.obtenirDisciplinesDisponiblesCartouches = obtenirDisciplinesDisponiblesCartouches;
window.ajouterCartoucheALaBibliotheque = ajouterCartoucheALaBibliotheque;
window.retirerCartoucheDeLaBibliotheque = retirerCartoucheDeLaBibliotheque;
window.importerCartouchesDansBibliotheque = importerCartouchesDansBibliotheque;
window.exporterBibliothequeCartouches = exporterBibliothequeCartouches;
window.migrerCartouchesVersBibliotheque = migrerCartouchesVersBibliotheque;
window.getNombreCartouchesBibliotheque = getNombreCartouchesBibliotheque;
window.CLE_BIBLIOTHEQUE_CARTOUCHES = CLE_BIBLIOTHEQUE_CARTOUCHES;

// Rétrocompatibilité: CARTOUCHES_BIBLIOTHEQUE vide (plus de hardcodé)
window.CARTOUCHES_BIBLIOTHEQUE = {};


})();
