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
 * @property {number|null} heuresContact - Heures d'enseignement attendues du cours (RREC). Source de vérité de la conformité.
 * @property {string} ponderation - Pondération « théorie-labo-perso » (ex. "2-2-3"). Métadonnée de saisie ; propose heuresContact et le repère d'unités.
 * @property {string} [nature] - 'cours' (défaut ; absent = cours) ou 'service' (cadrage « Rencontres », 12 sept. 2026).
 *   Un SERVICE EST UN COURS : même enregistrement, même magasin, aucun troisième chemin de données. Il n'a ni
 *   code, ni discipline, ni pondération, ni compétence — seul `nomCours` est requis — et un groupe-cours qui le
 *   porte peut n'avoir aucun horaire. Ce qui affiche un code vide affiche son nom (règle appliquée site par site,
 *   sans changer l'affichage d'un cours qui a un code). Le mot « orthopédagogie » n'apparaît nulle part : un
 *   enseignant qui reçoit des élèves à son bureau a le même service.
 * @property {string} dateCreation - Date de création ISO
 * @property {string} dateModification - Date de dernière modification ISO
 */

// ============================================
// CRUD - CREATE
// ============================================

/**
 * Cherche une fiche de cours portant DÉJÀ le même code (décision #455 :
 * l'identité d'un cours est son code, seul — le devis ministériel ne change
 * pas d'un trimestre à l'autre).
 *
 * Exposé pour que l'appelant puisse DEMANDER avant d'écrire : c'est le
 * formulaire qui parle à l'humain, l'entité ne fait qu'appliquer.
 *
 * @param {Object} donnees - le cours qu'on s'apprête à écrire
 * @param {Object} [opts]
 * @param {string} [opts.exclureId] - id à ignorer (l'item lui-même en édition)
 * @returns {Promise<Cours|null>} - la fiche en place, ou null
 */
async function chercherDoublonCode(donnees, opts) {
    const cours = await db.get(CLE_COURS) || [];
    return trouverDoublonNaturel(cours, donnees, cleNaturelleCours, opts);
}

/**
 * Crée un nouveau cours.
 *
 * CT-15 (23 août 2026) — GARDE AU POINT D'ÉCRITURE. Cette fonction créait
 * sans rien vérifier : l'invariant #455 (une fiche par code) n'était défendu
 * qu'au formulaire (`sauvegarderCoursV2`) et à l'import (`cours.js`), chacun
 * avec sa propre comparaison — dont une, à l'import, en `===` brut qui
 * laissait « 601-101-mq » s'installer à côté de « 601-101-MQ ».
 *
 * ⚠ CETTE GARDE NE DÉCIDE PAS À LA PLACE DE GRÉGOIRE. Décision #455 : le
 * geste reste possible, jamais silencieux. L'appelant qui a POSÉ la question
 * et reçu un oui passe `{ doublonAssume: true }` ; celui qui ne l'a pas posée
 * se voit refuser — c'est un filet, pas un veto.
 *
 * @param {Object} donnees - Données du cours
 * @param {Object} [options]
 * @param {boolean} [options.doublonAssume] - true = l'utilisateur a confirmé
 * @returns {Promise<Cours|null>} - Le cours créé, ou null si la garde a refusé
 */
async function creerCours(donnees, options) {
    const cours = await db.get(CLE_COURS) || [];

    const dejaLa = trouverDoublonNaturel(cours, donnees, cleNaturelleCours);
    if (dejaLa && !(options && options.doublonAssume === true)) {
        console.warn(
            '[Cours] Création refusée : une fiche « ' +
            (dejaLa.codeCours || dejaLa.id) + ' » existe déjà (#455). ' +
            'Demander confirmation, puis rappeler avec { doublonAssume: true }.');
        return null;
    }

    const nouveauCours = {
        id: genererIdUnique('COURS_'),
        codeCours: donnees.codeCours || '',
        nomCours: donnees.nomCours || '',
        discipline: donnees.discipline || '',
        numeroCompetence: donnees.numeroCompetence || '',
        competence: donnees.competence || '',
        elementsCompetence: donnees.elementsCompetence || '',
        heuresContact: (donnees.heuresContact === 0 || donnees.heuresContact) ? donnees.heuresContact : null,
        ponderation: donnees.ponderation || '',
        nature: donnees.nature === 'service' ? 'service' : 'cours',
        // #458 (19 août 2026) : une fiche que tu crées est dans ta sélection.
        // Sans ce champ, la Bibliothèque (filtres stricts ===true/===false) ne
        // la montrait dans AUCUNE section avant le prochain rechargement — la
        // migration de boot posait le drapeau trop tard. Trouvé par la porte
        // terrain #449, à la création de la fiche de test.
        dansBibliotheque: true,
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
    // Même normalisation que la garde d'unicité : sans quoi la garde et la
    // recherche répondraient différemment à « est-ce le même cours ? », et
    // « 601-101-mq » serait introuvable après avoir été refusé comme doublon.
    const cible = cleNaturelle(codeCours);
    if (!cible) return null;
    return cours.find(c => cleNaturelleCours(c) === cible) || null;
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
 *
 * CT-15 : la garde #455 vaut AUSSI en édition. Renommer le code d'une fiche
 * pour lui donner celui d'une autre fabrique exactement le doublon que la
 * création refuse — par un chemin que personne ne surveillait.
 *
 * @param {string} coursId - ID du cours à mettre à jour
 * @param {Object} modifications - Champs à modifier
 * @param {Object} [options]
 * @param {boolean} [options.doublonAssume] - true = l'utilisateur a confirmé
 * @returns {Promise<Cours|null>} - Le cours modifié, ou null (introuvable, ou
 *          garde refusée — les deux cas sont distingués par `console.warn`)
 */
async function mettreAJourCours(coursId, modifications, options) {
    const cours = await db.get(CLE_COURS) || [];
    const index = cours.findIndex(c => c.id === coursId);

    if (index === -1) {
        console.warn('[Cours] Non trouvé pour mise à jour:', coursId);
        return null;
    }

    // On s'exclut soi-même : sans `exclureId`, enregistrer une fiche sans
    // toucher son code la ferait rougir contre elle-même à chaque fois.
    if (modifications && modifications.codeCours !== undefined) {
        const dejaLa = trouverDoublonNaturel(
            cours, modifications, cleNaturelleCours, { exclureId: coursId });
        if (dejaLa && !(options && options.doublonAssume === true)) {
            console.warn(
                '[Cours] Mise à jour refusée : « ' +
                (dejaLa.codeCours || dejaLa.id) + ' » est déjà porté par une ' +
                'autre fiche (#455).');
            return null;
        }
    }

    // Mettre à jour les champs (sauf id et dateCreation)
    const champsModifiables = ['codeCours', 'nomCours', 'discipline', 'numeroCompetence', 'competence', 'elementsCompetence', 'heuresContact', 'ponderation', 'nature'];

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
    chercherDoublonCode: chercherDoublonCode,
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
