/* ===============================
   BIBLIOTHÈQUE D'ÉCHELLES DE PERFORMANCE
   ✅ REFACTORING (2 janvier 2026)

   Bibliothèque partagée d'échelles de performance.
   - Indépendante du trimestre (clé non-namespacée)
   - Stockage dans IndexedDB/localStorage
   - Import/export avec collègues
   - Plus de données hardcodées

   Clé de stockage: 'bibliothequeEchelles' (sans namespace)
   =============================== */

(function() {
'use strict';

/**
 * Clé de stockage pour la bibliothèque (NON namespacée = partagée entre trimestres)
 */
const CLE_BIBLIOTHEQUE_ECHELLES = 'bibliothequeEchelles';

/**
 * Obtenir toutes les échelles de la bibliothèque
 * @returns {Promise<Array>} Tableau de toutes les échelles disponibles
 */
async function obtenirToutesLesEchellesBibliotheque() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_ECHELLES) || [];
    return bibliotheque;
}

/**
 * Version synchrone pour compatibilité
 * @returns {Array} Tableau de toutes les échelles disponibles
 */
function obtenirToutesLesEchellesBibliothequeSync() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_ECHELLES) || [];
    return bibliotheque;
}

/**
 * Obtenir les échelles d'une discipline spécifique
 * @param {string} discipline - Nom de la discipline
 * @returns {Array} Tableau des échelles de cette discipline
 */
function obtenirEchellesParDiscipline(discipline) {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_ECHELLES) || [];
    if (!discipline || discipline === 'toutes') {
        return bibliotheque;
    }
    return bibliotheque.filter(e =>
        e.discipline && e.discipline.toLowerCase() === discipline.toLowerCase()
    );
}

// #327 — obtenirDisciplinesDisponiblesEchelles retiré (code mort) : le seul
// appelant était le filtre par discipline de la modale, supprimé au profit du
// classement par dossiers.

/**
 * Ajouter une échelle à la bibliothèque partagée
 * @param {Object} echelle - L'échelle à ajouter
 * @returns {Promise<boolean>} true si ajoutée, false si déjà existante
 */
async function ajouterEchelleALaBibliotheque(echelle) {
    // B-β — passage obligé par assainirObjet.
    const echelleSafe = (typeof window.assainirObjet === 'function' && window.SCHEMAS_IMPORT && window.SCHEMAS_IMPORT.echelle)
        ? window.assainirObjet(echelle, window.SCHEMAS_IMPORT.echelle)
        : echelle;

    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_ECHELLES) || [];

    const existe = bibliotheque.some(e => e.id === echelleSafe.id);
    if (existe) {
        return false;
    }

    // 🆕 Beta 95.4 : Obtenir l'auteur depuis le profil enseignant si non défini
    const auteur = echelleSafe.auteur || (typeof obtenirProfilAuteurActifSync === 'function' ? obtenirProfilAuteurActifSync()?.auteur_original : null) || 'Inconnu';

    const echelleBiblio = {
        ...echelleSafe,
        dansBibliotheque: true,
        dateAjoutBiblio: new Date().toISOString(),
        auteur: auteur
    };

    bibliotheque.push(echelleBiblio);
    await db.set(CLE_BIBLIOTHEQUE_ECHELLES, bibliotheque);

    return true;
}

/**
 * Retirer une échelle de la bibliothèque
 * @param {string} echelleId - ID de l'échelle à retirer
 * @returns {Promise<boolean>} true si retirée, false si non trouvée
 */
async function retirerEchelleDeLaBibliotheque(echelleId) {
    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_ECHELLES) || [];

    const indexAvant = bibliotheque.length;
    bibliotheque = bibliotheque.filter(e => e.id !== echelleId);

    if (bibliotheque.length === indexAvant) {
        return false;
    }

    await db.set(CLE_BIBLIOTHEQUE_ECHELLES, bibliotheque);

    // #327 — hook de cohérence : l'échelle retirée sort de tout dossier de
    // classement (le moteur range par identité, sans toucher l'échelle).
    if (window.repertoiresBibliotheque && typeof window.repertoiresBibliotheque.retirerItem === 'function') {
        window.repertoiresBibliotheque.retirerItem(echelleId, 'echelles');
    }
    return true;
}

/**
 * Importer des échelles dans la bibliothèque
 * @param {Array} echelles - Tableau d'échelles à importer
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function importerEchellesDansBibliotheque(echelles) {
    let ajoutees = 0;
    let existantes = 0;

    for (const echelle of echelles) {
        const resultat = await ajouterEchelleALaBibliotheque(echelle);
        if (resultat) {
            ajoutees++;
        } else {
            existantes++;
        }
    }

    return { ajoutees, existantes };
}

/**
 * Exporter toute la bibliothèque d'échelles
 * @returns {Promise<Object>} Objet JSON exportable
 */
async function exporterBibliothequeEchelles() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_ECHELLES) || [];
    const echelles = typeof ajouterMetadonnéesCC === 'function'
        ? bibliotheque.map(e => ajouterMetadonnéesCC(e, 'echelle', e.nom || '').contenu || e)
        : bibliotheque;

    return {
        version: '1.0',
        type: 'echelles',
        dateExport: new Date().toISOString(),
        nombreEchelles: echelles.length,
        echelles
    };
}

/**
 * Migrer les échelles d'un trimestre vers la bibliothèque partagée
 * @param {string} cleSource - Clé source (ex: 'a2025_echelles')
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function migrerEchellesVersBibliotheque(cleSource) {
    const echelles = db.getSync(cleSource, null);
    if (!echelles) {
        return { ajoutees: 0, existantes: 0 };
    }
    if (!Array.isArray(echelles)) {
        return { ajoutees: 0, existantes: 0 };
    }

    return await importerEchellesDansBibliotheque(echelles);
}

/**
 * Lister tous les trimestres qui ont des échelles
 * @returns {Array<{cle: string, code: string, nom: string, nombre: number}>}
 */
function listerTrimestresAvecEchelles() {
    const trimestres = [];
    const trimestreActuel = window.trimestreActif || '';

    // #389 : keysSync (localStorage ∪ memoryCache) — un trimestre dont la
    // collection a basculé hors localStorage (quota) était invisible au scan.
    const clesStockage = db.keysSync();
    for (let i = 0; i < clesStockage.length; i++) {
        const cle = clesStockage[i];
        if (cle && cle.endsWith('_echelles')) {
            try {
                const data = db.getSync(cle, null);
                if (Array.isArray(data) && data.length > 0) {
                    const codeTrimestre = cle.replace('_echelles', '');

                    if (codeTrimestre !== trimestreActuel) {
                        const nomTrimestre = formaterNomTrimestreEchelles(codeTrimestre);
                        trimestres.push({
                            cle: cle,
                            code: codeTrimestre,
                            nom: nomTrimestre,
                            nombre: data.length
                        });
                    }
                }
            } catch (e) {
                // Ignorer
            }
        }
    }

    trimestres.sort((a, b) => b.code.localeCompare(a.code));
    return trimestres;
}

/**
 * Formater un code trimestre pour affichage
 */
function formaterNomTrimestreEchelles(code) {
    if (!code) return 'Inconnu';
    const saison = code.charAt(0).toLowerCase();
    const annee = code.substring(1);
    const saisons = { 'a': 'Automne', 'h': 'Hiver', 'e': 'Été' };
    return `${saisons[saison] || saison.toUpperCase()} ${annee}`;
}

/**
 * Obtenir les échelles d'un trimestre spécifique
 * @param {string} cleOuCode - Clé complète ou code trimestre
 * @returns {Array}
 */
function obtenirEchellesTrimestre(cleOuCode) {
    const cle = cleOuCode.includes('_') ? cleOuCode : `${cleOuCode}_echelles`;
    try {
        const data = db.getSync(cle, null);
        if (data) {
            return data;
        }
    } catch (e) {
        console.error('[Bibliothèque Échelles] Erreur lecture trimestre:', e);
    }
    return [];
}

/**
 * Obtenir le nombre d'échelles dans la bibliothèque
 * @returns {number}
 */
function getNombreEchellesBibliotheque() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_ECHELLES) || [];
    return bibliotheque.length;
}

// ===========================
// EXPORTS GLOBAUX
// ===========================
window.obtenirToutesLesEchellesBibliotheque = obtenirToutesLesEchellesBibliotheque;
window.obtenirToutesLesEchellesBibliothequeSync = obtenirToutesLesEchellesBibliothequeSync;
window.obtenirEchellesParDiscipline = obtenirEchellesParDiscipline;
window.ajouterEchelleALaBibliotheque = ajouterEchelleALaBibliotheque;
window.retirerEchelleDeLaBibliotheque = retirerEchelleDeLaBibliotheque;
window.importerEchellesDansBibliotheque = importerEchellesDansBibliotheque;
window.exporterBibliothequeEchelles = exporterBibliothequeEchelles;
window.migrerEchellesVersBibliotheque = migrerEchellesVersBibliotheque;
window.listerTrimestresAvecEchelles = listerTrimestresAvecEchelles;
window.formaterNomTrimestreEchelles = formaterNomTrimestreEchelles;
window.obtenirEchellesTrimestre = obtenirEchellesTrimestre;
window.getNombreEchellesBibliotheque = getNombreEchellesBibliotheque;
window.CLE_BIBLIOTHEQUE_ECHELLES = CLE_BIBLIOTHEQUE_ECHELLES;

// Rétrocompatibilité: ECHELLES_BIBLIOTHEQUE vide (plus de hardcodé)
window.ECHELLES_BIBLIOTHEQUE = {};


})();
