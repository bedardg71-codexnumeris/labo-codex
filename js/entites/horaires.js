/* ===============================
   ENTITÉ : HORAIRE
   Beta 95.2 - Refactoring Trimestre

   Structure de données pour les horaires hebdomadaires.
   Les horaires sont des entités réutilisables dans les groupe-cours.

   Clé de stockage: 'horaires' (array, non-namespacé)
   =============================== */

(function() {
'use strict';

/**
 * Clé de stockage pour les horaires
 */
const CLE_HORAIRES = 'horaires';

/**
 * Structure d'un horaire
 * @typedef {Object} Horaire
 * @property {string} id - Identifiant unique (HOR_timestamp)
 * @property {string} nom - Nom descriptif (ex: "Lun-Mer 10h")
 * @property {number} periodesParSemaine - Nombre de périodes par semaine
 * @property {string} formatHoraire - Format (ex: "2x2" pour 2 séances de 2 périodes)
 * @property {string} local - Local/salle (optionnel)
 * @property {Seance[]} seances - Liste des séances hebdomadaires
 * @property {string} dateCreation - Date de création ISO
 * @property {string} dateModification - Date de dernière modification ISO
 */

/**
 * Structure d'une séance
 * @typedef {Object} Seance
 * @property {string} jour - Jour de la semaine (lundi, mardi, ...)
 * @property {string} heureDebut - Heure de début (HH:MM)
 * @property {string} heureFin - Heure de fin (HH:MM)
 */

/**
 * Jours de la semaine
 */
const JOURS_SEMAINE = [
    { id: 'lundi', nom: 'Lundi', abrev: 'Lun' },
    { id: 'mardi', nom: 'Mardi', abrev: 'Mar' },
    { id: 'mercredi', nom: 'Mercredi', abrev: 'Mer' },
    { id: 'jeudi', nom: 'Jeudi', abrev: 'Jeu' },
    { id: 'vendredi', nom: 'Vendredi', abrev: 'Ven' },
    { id: 'samedi', nom: 'Samedi', abrev: 'Sam' },
    { id: 'dimanche', nom: 'Dimanche', abrev: 'Dim' }
];

/**
 * Formats d'horaire courants
 */
const FORMATS_HORAIRE = [
    { id: '1x4', nom: '1 séance de 4 périodes', periodes: 4, seances: 1 },
    { id: '2x2', nom: '2 séances de 2 périodes', periodes: 4, seances: 2 },
    { id: '1x3', nom: '1 séance de 3 périodes', periodes: 3, seances: 1 },
    { id: '2x1.5', nom: '2 séances de 1.5 périodes', periodes: 3, seances: 2 },
    { id: '1x2', nom: '1 séance de 2 périodes', periodes: 2, seances: 1 },
    { id: '2x1', nom: '2 séances de 1 période', periodes: 2, seances: 2 },
    { id: 'autre', nom: 'Autre format', periodes: 0, seances: 0 }
];

// ============================================
// CRUD - CREATE
// ============================================

/**
 * Crée un nouvel horaire
 * @param {Object} donnees - Données de l'horaire
 * @returns {Promise<Horaire>} - L'horaire créé avec son ID
 */
async function creerHoraire(donnees) {
    const horaires = await db.get(CLE_HORAIRES) || [];

    const nouvelHoraire = {
        id: 'HOR_' + Date.now(),
        nom: donnees.nom || genererNomHoraireAuto(donnees.seances),
        periodesParSemaine: donnees.periodesParSemaine || calculerPeriodes(donnees.seances),
        formatHoraire: donnees.formatHoraire || 'autre',
        local: donnees.local || '',
        seances: donnees.seances || [],
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
    };

    horaires.push(nouvelHoraire);
    await db.set(CLE_HORAIRES, horaires);

    console.log('[Horaires] Créé:', nouvelHoraire.nom);
    return nouvelHoraire;
}

// ============================================
// CRUD - READ
// ============================================

/**
 * Obtient tous les horaires
 * @returns {Promise<Horaire[]>}
 */
async function obtenirTousLesHoraires() {
    return await db.get(CLE_HORAIRES) || [];
}

/**
 * Version synchrone pour compatibilité
 * @returns {Horaire[]}
 */
function obtenirTousLesHorairesSync() {
    return db.getSync(CLE_HORAIRES) || [];
}

/**
 * Obtient un horaire par son ID
 * @param {string} horaireId - ID de l'horaire
 * @returns {Promise<Horaire|null>}
 */
async function obtenirHoraireParId(horaireId) {
    const horaires = await db.get(CLE_HORAIRES) || [];
    return horaires.find(h => h.id === horaireId) || null;
}

/**
 * Obtient les horaires par format
 * @param {string} formatHoraire - Format (ex: "2x2")
 * @returns {Promise<Horaire[]>}
 */
async function obtenirHorairesParFormat(formatHoraire) {
    const horaires = await db.get(CLE_HORAIRES) || [];
    if (!formatHoraire) return horaires;
    return horaires.filter(h => h.formatHoraire === formatHoraire);
}

// ============================================
// CRUD - UPDATE
// ============================================

/**
 * Met à jour un horaire existant
 * @param {string} horaireId - ID de l'horaire à mettre à jour
 * @param {Object} modifications - Champs à modifier
 * @returns {Promise<Horaire|null>} - L'horaire modifié ou null si non trouvé
 */
async function mettreAJourHoraire(horaireId, modifications) {
    const horaires = await db.get(CLE_HORAIRES) || [];
    const index = horaires.findIndex(h => h.id === horaireId);

    if (index === -1) {
        console.warn('[Horaires] Non trouvé pour mise à jour:', horaireId);
        return null;
    }

    // Mettre à jour les champs (sauf id et dateCreation)
    const champsModifiables = ['nom', 'periodesParSemaine', 'formatHoraire', 'local', 'seances'];

    champsModifiables.forEach(champ => {
        if (modifications[champ] !== undefined) {
            horaires[index][champ] = modifications[champ];
        }
    });

    // Recalculer les périodes si les séances ont changé
    if (modifications.seances) {
        horaires[index].periodesParSemaine = calculerPeriodes(modifications.seances);
    }

    horaires[index].dateModification = new Date().toISOString();

    await db.set(CLE_HORAIRES, horaires);
    console.log('[Horaires] Mis à jour:', horaires[index].nom);

    return horaires[index];
}

// ============================================
// CRUD - DELETE
// ============================================

/**
 * Supprime un horaire
 * @param {string} horaireId - ID de l'horaire à supprimer
 * @returns {Promise<boolean>} - true si supprimé, false si non trouvé
 */
async function supprimerHoraire(horaireId) {
    let horaires = await db.get(CLE_HORAIRES) || [];
    const indexAvant = horaires.length;

    horaires = horaires.filter(h => h.id !== horaireId);

    if (horaires.length === indexAvant) {
        console.warn('[Horaires] Non trouvé pour suppression:', horaireId);
        return false;
    }

    await db.set(CLE_HORAIRES, horaires);
    console.log('[Horaires] Supprimé:', horaireId);
    return true;
}

/**
 * Vérifie si un horaire peut être supprimé (non utilisé dans un groupe-cours)
 * @param {string} horaireId - ID de l'horaire
 * @returns {Promise<{peutSupprimer: boolean, raison?: string}>}
 */
async function verifierSuppressionHoraire(horaireId) {
    // Vérifier dans tous les trimestres si cet horaire est utilisé
    const trimestres = await db.get('trimestres') || [];

    for (const trim of trimestres) {
        const groupesCours = await db.get(`${trim.id}_groupesCours`) || [];
        const utilise = groupesCours.some(gc => gc.horaireId === horaireId);

        if (utilise) {
            return {
                peutSupprimer: false,
                raison: `Cet horaire est utilisé dans le trimestre ${trim.nom || trim.id}`
            };
        }
    }

    return { peutSupprimer: true };
}

// ============================================
// GESTION DES SÉANCES
// ============================================

/**
 * Ajoute une séance à un horaire
 * @param {string} horaireId - ID de l'horaire
 * @param {Seance} seance - Séance à ajouter
 * @returns {Promise<Horaire|null>}
 */
async function ajouterSeance(horaireId, seance) {
    const horaire = await obtenirHoraireParId(horaireId);
    if (!horaire) return null;

    const seances = [...(horaire.seances || []), seance];
    return await mettreAJourHoraire(horaireId, { seances });
}

/**
 * Supprime une séance d'un horaire
 * @param {string} horaireId - ID de l'horaire
 * @param {number} indexSeance - Index de la séance à supprimer
 * @returns {Promise<Horaire|null>}
 */
async function supprimerSeance(horaireId, indexSeance) {
    const horaire = await obtenirHoraireParId(horaireId);
    if (!horaire) return null;

    const seances = [...(horaire.seances || [])];
    seances.splice(indexSeance, 1);
    return await mettreAJourHoraire(horaireId, { seances });
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Génère un nom automatique basé sur les séances
 * @param {Seance[]} seances - Liste des séances
 * @returns {string} - Ex: "Lun-Mer 10h"
 */
function genererNomHoraireAuto(seances) {
    if (!seances || seances.length === 0) return 'Nouvel horaire';

    const joursAbrev = seances.map(s => {
        const jour = JOURS_SEMAINE.find(j => j.id === s.jour);
        return jour ? jour.abrev : s.jour;
    });

    const premiereHeure = seances[0]?.heureDebut?.split(':')[0] || '';

    return `${joursAbrev.join('-')} ${premiereHeure}h`;
}

/**
 * Calcule le nombre de périodes à partir des séances
 * @param {Seance[]} seances - Liste des séances
 * @returns {number} - Nombre de périodes
 */
function calculerPeriodes(seances) {
    if (!seances || seances.length === 0) return 0;

    let totalMinutes = 0;
    seances.forEach(s => {
        if (s.heureDebut && s.heureFin) {
            const [hDebut, mDebut] = s.heureDebut.split(':').map(Number);
            const [hFin, mFin] = s.heureFin.split(':').map(Number);
            const duree = (hFin * 60 + mFin) - (hDebut * 60 + mDebut);
            totalMinutes += duree;
        }
    });

    // Approximation: 1 période = 50-55 minutes
    return Math.round(totalMinutes / 50);
}

/**
 * Génère un libellé pour l'horaire
 * @param {Horaire} horaire - L'horaire
 * @returns {string} - Ex: "Lun-Mer 10h (2x2)"
 */
function genererLibelleHoraire(horaire) {
    if (!horaire) return 'Horaire inconnu';

    let libelle = horaire.nom || 'Sans nom';
    if (horaire.formatHoraire && horaire.formatHoraire !== 'autre') {
        libelle += ` (${horaire.formatHoraire})`;
    }
    return libelle;
}

/**
 * Valide les données d'un horaire
 * @param {Object} donnees - Données à valider
 * @returns {{valide: boolean, erreurs: string[]}}
 */
function validerDonneesHoraire(donnees) {
    const erreurs = [];

    if (!donnees.seances || donnees.seances.length === 0) {
        erreurs.push('Au moins une séance est requise');
    } else {
        donnees.seances.forEach((s, i) => {
            if (!s.jour) {
                erreurs.push(`Séance ${i + 1}: Le jour est requis`);
            }
            if (!s.heureDebut) {
                erreurs.push(`Séance ${i + 1}: L'heure de début est requise`);
            }
            if (!s.heureFin) {
                erreurs.push(`Séance ${i + 1}: L'heure de fin est requise`);
            }
        });
    }

    return {
        valide: erreurs.length === 0,
        erreurs
    };
}

/**
 * Compte le nombre d'horaires
 * @returns {Promise<number>}
 */
async function compterHoraires() {
    const horaires = await db.get(CLE_HORAIRES) || [];
    return horaires.length;
}

/**
 * Formate une séance pour affichage
 * @param {Seance} seance - La séance
 * @returns {string} - Ex: "Lundi 10:00-12:00"
 */
function formaterSeance(seance) {
    if (!seance) return '';
    const jour = JOURS_SEMAINE.find(j => j.id === seance.jour);
    return `${jour?.nom || seance.jour} ${seance.heureDebut}-${seance.heureFin}`;
}

// ============================================
// EXPORTS GLOBAUX
// ============================================

window.HorairesEntite = {
    // CRUD
    creer: creerHoraire,
    obtenirTous: obtenirTousLesHoraires,
    obtenirTousSync: obtenirTousLesHorairesSync,
    obtenirParId: obtenirHoraireParId,
    obtenirParFormat: obtenirHorairesParFormat,
    mettreAJour: mettreAJourHoraire,
    supprimer: supprimerHoraire,
    verifierSuppression: verifierSuppressionHoraire,

    // Séances
    ajouterSeance: ajouterSeance,
    supprimerSeance: supprimerSeance,

    // Utilitaires
    genererNomAuto: genererNomHoraireAuto,
    calculerPeriodes: calculerPeriodes,
    genererLibelle: genererLibelleHoraire,
    formaterSeance: formaterSeance,
    valider: validerDonneesHoraire,
    compter: compterHoraires,

    // Constantes
    CLE: CLE_HORAIRES,
    JOURS: JOURS_SEMAINE,
    FORMATS: FORMATS_HORAIRE
};

console.log('[Entités] Module Horaires chargé');


})();
