/* ===============================
   ENTITÉ : COURS (Informations générales)
   Beta 95.2 - Refactoring Trimestre

   Structure de données pour les cours (sans enseignant, ni horaire).
   Les cours sont des entités réutilisables dans les groupe-cours.

   Clé de stockage: 'cours' (array, non-namespacé)
   =============================== */

(function() {
'use strict';

/**
 * Clé de stockage pour les cours
 */
const CLE_COURS = 'cours';

/**
 * Structure d'un cours
 * @typedef {Object} Cours
 * @property {string} id - Identifiant unique (COURS_timestamp)
 * @property {string} codeCours - Code du cours (ex: 601-101-MQ)
 * @property {string} nomCours - Nom du cours
 * @property {string} discipline - Discipline (ex: Français)
 * @property {string} numeroCompetence - Numéro de la compétence
 * @property {string} competence - Description de la compétence
 * @property {string} elementsCompetence - Éléments de compétence
 * @property {string} dateCreation - Date de création ISO
 * @property {string} dateModification - Date de dernière modification ISO
 */

// ============================================
// CRUD - CREATE
// ============================================

/**
 * Crée un nouveau cours
 * @param {Object} donnees - Données du cours
 * @returns {Promise<Cours>} - Le cours créé avec son ID
 */
async function creerCours(donnees) {
    const cours = await db.get(CLE_COURS) || [];

    const nouveauCours = {
        id: genererIdUnique('COURS_'),
        codeCours: donnees.codeCours || '',
        nomCours: donnees.nomCours || '',
        discipline: donnees.discipline || '',
        numeroCompetence: donnees.numeroCompetence || '',
        competence: donnees.competence || '',
        elementsCompetence: donnees.elementsCompetence || '',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
    };

    cours.push(nouveauCours);
    await db.set(CLE_COURS, cours);

    return nouveauCours;
}

// ============================================
// CRUD - READ
// ============================================

/**
 * Obtient tous les cours
 * @returns {Promise<Cours[]>}
 */
async function obtenirTousLesCours() {
    return await db.get(CLE_COURS) || [];
}

/**
 * Version synchrone pour compatibilité
 * @returns {Cours[]}
 */
function obtenirTousLesCoursSync() {
    return db.getSync(CLE_COURS) || [];
}

/**
 * Obtient un cours par son ID
 * @param {string} coursId - ID du cours
 * @returns {Promise<Cours|null>}
 */
async function obtenirCoursParId(coursId) {
    const cours = await db.get(CLE_COURS) || [];
    return cours.find(c => c.id === coursId) || null;
}

/**
 * Obtient un cours par son code
 * @param {string} codeCours - Code du cours (ex: 601-101-MQ)
 * @returns {Promise<Cours|null>}
 */
async function obtenirCoursParCode(codeCours) {
    const cours = await db.get(CLE_COURS) || [];
    return cours.find(c => c.codeCours === codeCours) || null;
}

/**
 * Obtient les cours par discipline
 * @param {string} discipline - Nom de la discipline
 * @returns {Promise<Cours[]>}
 */
async function obtenirCoursParDiscipline(discipline) {
    const cours = await db.get(CLE_COURS) || [];
    if (!discipline) return cours;
    return cours.filter(c => c.discipline?.toLowerCase() === discipline.toLowerCase());
}

/**
 * Obtient la liste des disciplines uniques
 * @returns {Promise<string[]>}
 */
async function obtenirDisciplinesCours() {
    const cours = await db.get(CLE_COURS) || [];
    const disciplines = new Set();
    cours.forEach(c => {
        if (c.discipline) disciplines.add(c.discipline);
    });
    return Array.from(disciplines).sort();
}

// ============================================
// CRUD - UPDATE
// ============================================

/**
 * Met à jour un cours existant
 * @param {string} coursId - ID du cours à mettre à jour
 * @param {Object} modifications - Champs à modifier
 * @returns {Promise<Cours|null>} - Le cours modifié ou null si non trouvé
 */
async function mettreAJourCours(coursId, modifications) {
    const cours = await db.get(CLE_COURS) || [];
    const index = cours.findIndex(c => c.id === coursId);

    if (index === -1) {
        console.warn('[Cours] Non trouvé pour mise à jour:', coursId);
        return null;
    }

    // Mettre à jour les champs (sauf id et dateCreation)
    const champsModifiables = ['codeCours', 'nomCours', 'discipline', 'numeroCompetence', 'competence', 'elementsCompetence'];

    champsModifiables.forEach(champ => {
        if (modifications[champ] !== undefined) {
            cours[index][champ] = modifications[champ];
        }
    });

    cours[index].dateModification = new Date().toISOString();

    await db.set(CLE_COURS, cours);

    return cours[index];
}

// ============================================
// CRUD - DELETE
// ============================================

/**
 * Supprime un cours
 * @param {string} coursId - ID du cours à supprimer
 * @returns {Promise<boolean>} - true si supprimé, false si non trouvé
 */
async function supprimerCours(coursId) {
    let cours = await db.get(CLE_COURS) || [];
    const indexAvant = cours.length;

    cours = cours.filter(c => c.id !== coursId);

    if (cours.length === indexAvant) {
        console.warn('[Cours] Non trouvé pour suppression:', coursId);
        return false;
    }

    await db.set(CLE_COURS, cours);
    return true;
}

/**
 * Vérifie si un cours peut être supprimé (non utilisé dans un groupe-cours)
 * @param {string} coursId - ID du cours
 * @returns {Promise<{peutSupprimer: boolean, raison?: string}>}
 */
async function verifierSuppressionCours(coursId) {
    // Vérifier dans tous les trimestres si ce cours est utilisé
    const trimestres = await db.get('trimestres') || [];

    for (const trim of trimestres) {
        const groupesCours = await db.get(`${trim.id}_groupesCours`) || [];
        const utilise = groupesCours.some(gc => gc.coursId === coursId);

        if (utilise) {
            return {
                peutSupprimer: false,
                raison: `Ce cours est utilisé dans le trimestre ${trim.nom || trim.id}`
            };
        }
    }

    return { peutSupprimer: true };
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Génère un libellé court pour le cours
 * @param {Cours} cours - Le cours
 * @returns {string} - Ex: "601-101-MQ - Écriture et littérature"
 */
function genererLibelleCours(cours) {
    if (!cours) return 'Cours inconnu';
    return `${cours.codeCours || '???'} - ${cours.nomCours || 'Sans nom'}`;
}

/**
 * Valide les données d'un cours
 * @param {Object} donnees - Données à valider
 * @returns {{valide: boolean, erreurs: string[]}}
 */
function validerDonneesCours(donnees) {
    const erreurs = [];

    if (!donnees.codeCours?.trim()) {
        erreurs.push('Le code du cours est requis');
    }

    if (!donnees.nomCours?.trim()) {
        erreurs.push('Le nom du cours est requis');
    }

    return {
        valide: erreurs.length === 0,
        erreurs
    };
}

/**
 * Compte le nombre de cours
 * @returns {Promise<number>}
 */
async function compterCours() {
    const cours = await db.get(CLE_COURS) || [];
    return cours.length;
}

// ============================================
// EXPORTS GLOBAUX
// ============================================

window.CoursEntite = {
    // CRUD
    creer: creerCours,
    obtenirTous: obtenirTousLesCours,
    obtenirTousSync: obtenirTousLesCoursSync,
    obtenirParId: obtenirCoursParId,
    obtenirParCode: obtenirCoursParCode,
    obtenirParDiscipline: obtenirCoursParDiscipline,
    mettreAJour: mettreAJourCours,
    supprimer: supprimerCours,
    verifierSuppression: verifierSuppressionCours,

    // Utilitaires
    obtenirDisciplines: obtenirDisciplinesCours,
    genererLibelle: genererLibelleCours,
    valider: validerDonneesCours,
    compter: compterCours,

    // Constantes
    CLE: CLE_COURS
};



})();
