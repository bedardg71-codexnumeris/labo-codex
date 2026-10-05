/* ===============================
   BIBLIOTHÈQUE DE GRILLES DE CRITÈRES
   ✅ REFACTORING (2 janvier 2026)

   Bibliothèque de grilles de critères.
   - Indépendante du trimestre (clé non-namespacée)
   - Stockage dans IndexedDB/localStorage
   - Import/export avec collègues
   - Plus de données hardcodées

   Clé de stockage: 'bibliothequeGrilles' (sans namespace)
   =============================== */

(function() {
'use strict';

/**
 * Clé de stockage pour la bibliothèque (NON namespacée = partagée entre trimestres)
 */
const CLE_BIBLIOTHEQUE_GRILLES = 'bibliothequeGrilles';

/**
 * Obtenir toutes les grilles de la bibliothèque
 * @returns {Promise<Array>} Tableau de toutes les grilles disponibles
 */
async function obtenirToutesLesGrillesBibliotheque() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_GRILLES) || [];
    return bibliotheque;
}

/**
 * Version synchrone pour compatibilité
 * @returns {Array} Tableau de toutes les grilles disponibles
 */
function obtenirToutesLesGrillesBibliothequeSync() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_GRILLES) || [];
    return bibliotheque;
}

/**
 * Obtenir les grilles d'une discipline spécifique
 * @param {string} discipline - Nom de la discipline
 * @returns {Array} Tableau des grilles de cette discipline
 */
function obtenirGrillesParDiscipline(discipline) {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_GRILLES) || [];
    if (!discipline || discipline === 'toutes') {
        return bibliotheque;
    }
    return bibliotheque.filter(g =>
        g.discipline && g.discipline.toLowerCase() === discipline.toLowerCase()
    );
}

// #327 — obtenirDisciplinesDisponiblesGrilles retiré (code mort) : le seul
// appelant était le filtre par discipline de la modale, supprimé au profit du
// classement par dossiers.

/**
 * Ajouter une grille à la Bibliothèque
 * @param {Object} grille - La grille à ajouter
 * @returns {Promise<boolean>} true si ajoutée, false si déjà existante
 */
// B-β — helper de sanitisation locale. Passage obligé pour rendre la
// fonction d'ajout indépendante de la discipline du call-site (tout call-site
// qui appelle ajouterGrilleALaBibliotheque profite de la sanitisation, sans
// dépendre du pipeline d'import). Fallback safe si SCHEMAS_IMPORT non chargé.
function _assainirGrilleSafe(g) {
    if (typeof window.assainirObjet === 'function' && window.SCHEMAS_IMPORT && window.SCHEMAS_IMPORT.grille) {
        return window.assainirObjet(g, window.SCHEMAS_IMPORT.grille);
    }
    return g;
}

async function ajouterGrilleALaBibliotheque(grille) {
    // B-β — passage obligé par assainirObjet (whitelist + débalisage).
    const grilleSafe = _assainirGrilleSafe(grille);

    // #599 — la présence est vérifiée DANS la file. Hors file, deux ajouts
    // concurrents du même item passaient tous les deux, et la bibliothèque
    // partagée gardait un doublon que rien ne signalait.
    let dejaPresente = false;
    const ecritLotF = await db.modifier(CLE_BIBLIOTHEQUE_GRILLES, (lues) => {
        const bibliotheque = lues || [];

        const existe = bibliotheque.some(g => g.id === grilleSafe.id);
        if (existe) {
            dejaPresente = true;
            return undefined;
        }

        // 🆕 Beta 95.4 : Obtenir l'auteur depuis le profil enseignant si non défini
        const auteur = grilleSafe.auteur || (typeof obtenirProfilAuteurActifSync === 'function' ? obtenirProfilAuteurActifSync()?.auteur_original : null) || 'Inconnu';

        const grilleBiblio = {
            ...grilleSafe,
            dansBibliotheque: true,
            dateAjoutBiblio: new Date().toISOString(),
            auteur: auteur
        };

        bibliotheque.push(grilleBiblio);
        return bibliotheque;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_BIBLIOTHEQUE_GRILLES);   // lot F : geste hors témoin (ajouterGrilleALaBibliotheque)

    if (dejaPresente) {
        return false;
    }

    return true;
}

/**
 * Retirer une grille de la bibliothèque
 * @param {string} grilleId - ID de la grille à retirer
 * @returns {Promise<boolean>} true si retirée, false si non trouvée
 */
async function retirerGrilleDeLaBibliotheque(grilleId) {
    // #599 — le retrait passe par la file. Hors file, un retrait et un ajout
    // concurrents sur la MÊME Bibliothèque s'écrasaient l'un l'autre :
    // les cinq familles écrivent dans un seul magasin, pas un par famille.
    let retiree = false;
    const ecritLotF = await db.modifier(CLE_BIBLIOTHEQUE_GRILLES, (lues) => {
        const bibliotheque = lues || [];
        const restants = bibliotheque.filter(g => g.id !== grilleId);

        // Rien retiré : le mutateur rend `undefined`, aucune écriture.
        if (restants.length === bibliotheque.length) return undefined;

        retiree = true;
        return restants;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_BIBLIOTHEQUE_GRILLES);   // lot F : geste hors témoin (retirerGrilleDeLaBibliotheque)

    if (!retiree) {
        return false;
    }

    // #327 — hook de cohérence : la grille retirée sort de tout dossier de
    // classement (le moteur range par identité, sans toucher la grille).
    if (window.repertoiresBibliotheque && typeof window.repertoiresBibliotheque.retirerItem === 'function') {
        window.repertoiresBibliotheque.retirerItem(grilleId, 'grilles');
    }
    return true;
}

/**
 * Importer des grilles dans la bibliothèque
 * @param {Array} grilles - Tableau de grilles à importer
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function importerGrillesDansBibliotheque(grilles) {
    let ajoutees = 0;
    let existantes = 0;

    for (const grille of grilles) {
        const resultat = await ajouterGrilleALaBibliotheque(grille);
        if (resultat) {
            ajoutees++;
        } else {
            existantes++;
        }
    }

    return { ajoutees, existantes };
}

/**
 * Exporter toute la bibliothèque de grilles
 * @returns {Promise<Object>} Objet JSON exportable
 */
async function exporterBibliothequeGrilles() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_GRILLES) || [];
    const grilles = typeof ajouterMetadonnéesCC === 'function'
        ? bibliotheque.map(g => ajouterMetadonnéesCC(g, 'grille', g.nom || '').contenu || g)
        : bibliotheque;

    return {
        version: '1.0',
        type: 'grilles',
        dateExport: new Date().toISOString(),
        nombreGrilles: grilles.length,
        grilles
    };
}

/**
 * Migrer les grilles d'un trimestre vers la Bibliothèque
 * @param {string} cleSource - Clé source (ex: 'a2025_grilles')
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function migrerGrillesVersBibliotheque(cleSource) {
    const grilles = db.getSync(cleSource, null);
    if (!grilles) {
        return { ajoutees: 0, existantes: 0 };
    }
    if (!Array.isArray(grilles)) {
        return { ajoutees: 0, existantes: 0 };
    }

    return await importerGrillesDansBibliotheque(grilles);
}

/**
 * Obtenir le nombre de grilles dans la bibliothèque
 * @returns {number}
 */
function getNombreGrillesBibliotheque() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_GRILLES) || [];
    return bibliotheque.length;
}

// ===========================
// EXPORTS GLOBAUX
// ===========================
window.obtenirToutesLesGrillesBibliotheque = obtenirToutesLesGrillesBibliotheque;
window.obtenirToutesLesGrillesBibliothequeSync = obtenirToutesLesGrillesBibliothequeSync;
window.obtenirGrillesParDiscipline = obtenirGrillesParDiscipline;
window.ajouterGrilleALaBibliotheque = ajouterGrilleALaBibliotheque;
window.retirerGrilleDeLaBibliotheque = retirerGrilleDeLaBibliotheque;
window.importerGrillesDansBibliotheque = importerGrillesDansBibliotheque;
window.exporterBibliothequeGrilles = exporterBibliothequeGrilles;
window.migrerGrillesVersBibliotheque = migrerGrillesVersBibliotheque;
window.getNombreGrillesBibliotheque = getNombreGrillesBibliotheque;
window.CLE_BIBLIOTHEQUE_GRILLES = CLE_BIBLIOTHEQUE_GRILLES;

// Rétrocompatibilité: GRILLES_BIBLIOTHEQUE vide (plus de hardcodé)
window.GRILLES_BIBLIOTHEQUE = {};


})();
