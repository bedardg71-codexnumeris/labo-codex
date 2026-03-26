/* ===============================
   ENTITÉ : ENSEIGNANT·E (Profil Auteur)
   Beta 95.2 - Refactoring Trimestre

   Structure de données pour les enseignants.
   Sert de source unique pour les métadonnées CC.

   Clé de stockage: 'enseignants' (array, non-namespacé)
   =============================== */

(function() {
'use strict';

/**
 * Clé de stockage pour les enseignants
 */
const CLE_ENSEIGNANTS = 'enseignants';

/**
 * Structure d'un enseignant
 * @typedef {Object} Enseignant
 * @property {string} id - Identifiant unique (ENS_timestamp)
 * @property {string} prenom - Prénom
 * @property {string} nom - Nom de famille
 * @property {string} courriel - Adresse courriel
 * @property {string} institution - Nom de l'institution (ex: Cégep de Drummondville)
 * @property {string} departement - Département (ex: Lettres)
 * @property {string} siteWeb - Site web personnel (optionnel)
 * @property {string} niveau - Niveau d'enseignement (Collégial, Universitaire, etc.)
 * @property {string} dateCreation - Date de création ISO
 * @property {string} dateModification - Date de dernière modification ISO
 */

/**
 * Niveaux d'enseignement disponibles
 */
const NIVEAUX_ENSEIGNEMENT = [
    'Secondaire',
    'Collégial',
    'Universitaire',
    'Formation continue',
    'Autre'
];

// ============================================
// CRUD - CREATE
// ============================================

/**
 * Crée un nouvel enseignant
 * @param {Object} donnees - Données de l'enseignant
 * @returns {Promise<Enseignant>} - L'enseignant créé avec son ID
 */
async function creerEnseignant(donnees) {
    const enseignants = await db.get(CLE_ENSEIGNANTS) || [];

    const nouvelEnseignant = {
        id: genererIdUnique('ENS_'),
        prenom: donnees.prenom || '',
        nom: donnees.nom || '',
        courriel: donnees.courriel || '',
        institution: donnees.institution || '',
        departement: donnees.departement || '',
        siteWeb: donnees.siteWeb || '',
        niveau: donnees.niveau || 'Collégial',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
    };

    enseignants.push(nouvelEnseignant);
    await db.set(CLE_ENSEIGNANTS, enseignants);

    return nouvelEnseignant;
}

// ============================================
// CRUD - READ
// ============================================

/**
 * Obtient tous les enseignants
 * @returns {Promise<Enseignant[]>}
 */
async function obtenirTousLesEnseignants() {
    return await db.get(CLE_ENSEIGNANTS) || [];
}

/**
 * Version synchrone pour compatibilité
 * @returns {Enseignant[]}
 */
function obtenirTousLesEnseignantsSync() {
    return db.getSync(CLE_ENSEIGNANTS) || [];
}

/**
 * Obtient un enseignant par son ID
 * @param {string} enseignantId - ID de l'enseignant
 * @returns {Promise<Enseignant|null>}
 */
async function obtenirEnseignantParId(enseignantId) {
    const enseignants = await db.get(CLE_ENSEIGNANTS) || [];
    return enseignants.find(e => e.id === enseignantId) || null;
}

/**
 * Obtient un enseignant par son courriel
 * @param {string} courriel - Courriel de l'enseignant
 * @returns {Promise<Enseignant|null>}
 */
async function obtenirEnseignantParCourriel(courriel) {
    const enseignants = await db.get(CLE_ENSEIGNANTS) || [];
    return enseignants.find(e => e.courriel?.toLowerCase() === courriel?.toLowerCase()) || null;
}

/**
 * Obtient les enseignants par institution
 * @param {string} institution - Nom de l'institution
 * @returns {Promise<Enseignant[]>}
 */
async function obtenirEnseignantsParInstitution(institution) {
    const enseignants = await db.get(CLE_ENSEIGNANTS) || [];
    if (!institution) return enseignants;
    return enseignants.filter(e => e.institution?.toLowerCase() === institution.toLowerCase());
}

/**
 * Obtient la liste des institutions uniques
 * @returns {Promise<string[]>}
 */
async function obtenirInstitutions() {
    const enseignants = await db.get(CLE_ENSEIGNANTS) || [];
    const institutions = new Set();
    enseignants.forEach(e => {
        if (e.institution) institutions.add(e.institution);
    });
    return Array.from(institutions).sort();
}

// ============================================
// CRUD - UPDATE
// ============================================

/**
 * Met à jour un enseignant existant
 * @param {string} enseignantId - ID de l'enseignant à mettre à jour
 * @param {Object} modifications - Champs à modifier
 * @returns {Promise<Enseignant|null>} - L'enseignant modifié ou null si non trouvé
 */
async function mettreAJourEnseignant(enseignantId, modifications) {
    const enseignants = await db.get(CLE_ENSEIGNANTS) || [];
    const index = enseignants.findIndex(e => e.id === enseignantId);

    if (index === -1) {
        console.warn('[Enseignants] Non trouvé pour mise à jour:', enseignantId);
        return null;
    }

    // Mettre à jour les champs (sauf id et dateCreation)
    const champsModifiables = ['prenom', 'nom', 'courriel', 'institution', 'departement', 'siteWeb', 'niveau'];

    champsModifiables.forEach(champ => {
        if (modifications[champ] !== undefined) {
            enseignants[index][champ] = modifications[champ];
        }
    });

    enseignants[index].dateModification = new Date().toISOString();

    await db.set(CLE_ENSEIGNANTS, enseignants);

    return enseignants[index];
}

// ============================================
// CRUD - DELETE
// ============================================

/**
 * Supprime un enseignant
 * @param {string} enseignantId - ID de l'enseignant à supprimer
 * @returns {Promise<boolean>} - true si supprimé, false si non trouvé
 */
async function supprimerEnseignant(enseignantId) {
    let enseignants = await db.get(CLE_ENSEIGNANTS) || [];
    const indexAvant = enseignants.length;

    enseignants = enseignants.filter(e => e.id !== enseignantId);

    if (enseignants.length === indexAvant) {
        console.warn('[Enseignants] Non trouvé pour suppression:', enseignantId);
        return false;
    }

    await db.set(CLE_ENSEIGNANTS, enseignants);
    return true;
}

/**
 * Vérifie si un enseignant peut être supprimé (non utilisé dans un groupe-cours)
 * @param {string} enseignantId - ID de l'enseignant
 * @returns {Promise<{peutSupprimer: boolean, raison?: string}>}
 */
async function verifierSuppressionEnseignant(enseignantId) {
    // Vérifier dans tous les trimestres si cet enseignant est utilisé
    const trimestres = await db.get('trimestres') || [];

    for (const trim of trimestres) {
        const groupesCours = await db.get(`${trim.id}_groupesCours`) || [];
        const utilise = groupesCours.some(gc => gc.enseignantId === enseignantId);

        if (utilise) {
            return {
                peutSupprimer: false,
                raison: `Cet enseignant est associé à un groupe-cours dans le trimestre ${trim.nom || trim.id}`
            };
        }
    }

    return { peutSupprimer: true };
}

// ============================================
// PROFIL AUTEUR (pour métadonnées CC)
// ============================================

/**
 * Convertit un enseignant en profil auteur pour les métadonnées CC
 * @param {Enseignant} enseignant - L'enseignant
 * @returns {Object} - Données formatées pour CC
 */
function convertirEnProfilAuteur(enseignant) {
    if (!enseignant) return null;

    return {
        auteur_original: `${enseignant.prenom} ${enseignant.nom}`.trim(),
        email_auteur: enseignant.courriel || '',
        institution: enseignant.institution || '',
        site_auteur: enseignant.siteWeb || '',
        niveau: enseignant.niveau || '',
        attribution: `Créé par ${enseignant.prenom} ${enseignant.nom}`.trim()
    };
}

/**
 * Obtient le profil auteur de l'enseignant actif (du groupe-cours actif)
 * @returns {Promise<Object|null>} - Profil auteur ou null
 */
async function obtenirProfilAuteurActif() {
    // Obtenir le groupe-cours actif
    const trimestreActif = window.trimestreActif;
    if (!trimestreActif) return null;

    const groupesCours = await db.get(`${trimestreActif}_groupesCours`) || [];
    const groupeActif = groupesCours.find(gc => gc.actif);

    if (!groupeActif || !groupeActif.enseignantId) return null;

    const enseignant = await obtenirEnseignantParId(groupeActif.enseignantId);
    return convertirEnProfilAuteur(enseignant);
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Génère un libellé court pour l'enseignant
 * @param {Enseignant} enseignant - L'enseignant
 * @returns {string} - Ex: "Marie Tremblay"
 */
function genererLibelleEnseignant(enseignant) {
    if (!enseignant) return 'Enseignant inconnu';
    return `${enseignant.prenom || ''} ${enseignant.nom || ''}`.trim() || 'Sans nom';
}

/**
 * Génère un libellé complet pour l'enseignant
 * @param {Enseignant} enseignant - L'enseignant
 * @returns {string} - Ex: "Marie Tremblay (Cégep de Drummondville)"
 */
function genererLibelleCompletEnseignant(enseignant) {
    if (!enseignant) return 'Enseignant inconnu';
    const nom = genererLibelleEnseignant(enseignant);
    if (enseignant.institution) {
        return `${nom} (${enseignant.institution})`;
    }
    return nom;
}

/**
 * Valide les données d'un enseignant
 * @param {Object} donnees - Données à valider
 * @returns {{valide: boolean, erreurs: string[]}}
 */
function validerDonneesEnseignant(donnees) {
    const erreurs = [];

    if (!donnees.prenom?.trim()) {
        erreurs.push('Le prénom est requis');
    }

    if (!donnees.nom?.trim()) {
        erreurs.push('Le nom est requis');
    }

    if (!donnees.courriel?.trim()) {
        erreurs.push('Le courriel est requis');
    } else if (!donnees.courriel.includes('@')) {
        erreurs.push('Le courriel doit être valide');
    }

    if (!donnees.institution?.trim()) {
        erreurs.push('L\'institution est requise');
    }

    return {
        valide: erreurs.length === 0,
        erreurs
    };
}

/**
 * Compte le nombre d'enseignants
 * @returns {Promise<number>}
 */
async function compterEnseignants() {
    const enseignants = await db.get(CLE_ENSEIGNANTS) || [];
    return enseignants.length;
}

// ============================================
// EXPORTS GLOBAUX
// ============================================

window.EnseignantsEntite = {
    // CRUD
    creer: creerEnseignant,
    obtenirTous: obtenirTousLesEnseignants,
    obtenirTousSync: obtenirTousLesEnseignantsSync,
    obtenirParId: obtenirEnseignantParId,
    obtenirParCourriel: obtenirEnseignantParCourriel,
    obtenirParInstitution: obtenirEnseignantsParInstitution,
    mettreAJour: mettreAJourEnseignant,
    supprimer: supprimerEnseignant,
    verifierSuppression: verifierSuppressionEnseignant,

    // Profil auteur (métadonnées CC)
    convertirEnProfilAuteur: convertirEnProfilAuteur,
    obtenirProfilAuteurActif: obtenirProfilAuteurActif,

    // Utilitaires
    obtenirInstitutions: obtenirInstitutions,
    genererLibelle: genererLibelleEnseignant,
    genererLibelleComplet: genererLibelleCompletEnseignant,
    valider: validerDonneesEnseignant,
    compter: compterEnseignants,

    // Constantes
    CLE: CLE_ENSEIGNANTS,
    NIVEAUX: NIVEAUX_ENSEIGNEMENT
};



})();
