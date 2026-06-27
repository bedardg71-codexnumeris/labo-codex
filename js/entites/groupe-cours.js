/* ===============================
   ENTITÉ : GROUPE-COURS (Assemblage)
   Beta 95.2 - Refactoring Trimestre

   Assemblage des entités Cours, Enseignant, Horaire et Pratique
   en un groupe-cours pour un trimestre donné.

   Clé de stockage: '{trimestreId}_groupesCours' (array, namespacé)
   =============================== */

(function() {
'use strict';

/**
 * Structure d'un groupe-cours
 * @typedef {Object} GroupeCours
 * @property {string} id - Identifiant unique (GC_timestamp)
 * @property {string} trimestreId - ID du trimestre (ex: "h2026")
 * @property {string} coursId - Référence vers l'entité Cours
 * @property {string} enseignantId - Référence vers l'entité Enseignant
 * @property {string} horaireId - Référence vers l'entité Horaire
 * @property {string} pratiqueId - Référence vers la Pratique de notation
 * @property {string} groupeNum - Numéro de groupe CANONIQUE (ex: "00001").
 *   Champ d'identité qui fait foi : écrit par le chemin de création vivant
 *   (`sauvegarderGroupeCoursV2`) et cohérent avec `nom`. L'ancien champ `groupe`
 *   (chemin Entité archivé) est purgé au démarrage — cf. normaliserCanonique().
 * @property {boolean} actif - Si ce groupe-cours est actuellement actif
 * @property {string} dateCreation - Date de création ISO
 * @property {string} dateModification - Date de dernière modification ISO
 */

/**
 * Obtient la clé de stockage pour un trimestre
 * @param {string} trimestreId - ID du trimestre
 * @returns {string} - Clé de stockage
 */
function getCleGroupesCours(trimestreId) {
    return `${trimestreId}_groupesCours`;
}

// ============================================
// CRUD - CREATE
// ============================================

/**
 * Crée un nouveau groupe-cours
 * @param {Object} donnees - Données du groupe-cours
 * @returns {Promise<{succes: boolean, groupeCours?: GroupeCours, erreur?: string}>}
 */
async function creerGroupeCours(donnees) {
    // Valider les données
    const validation = await validerDonneesGroupeCours(donnees);
    if (!validation.valide) {
        return { succes: false, erreur: validation.erreurs.join(', ') };
    }

    const trimestreId = donnees.trimestreId;
    const cle = getCleGroupesCours(trimestreId);
    const groupesCours = await db.get(cle) || [];

    // Vérifier qu'un groupe-cours avec le même cours et groupe n'existe pas déjà
    const existe = groupesCours.some(gc =>
        gc.coursId === donnees.coursId && gc.groupeNum === donnees.groupeNum
    );
    if (existe) {
        return {
            succes: false,
            erreur: `Un groupe-cours avec ce cours et ce numéro de groupe existe déjà`
        };
    }

    const nouveauGroupeCours = {
        id: genererIdUnique('GC_'),
        trimestreId: trimestreId,
        coursId: donnees.coursId,
        enseignantId: donnees.enseignantId,
        horaireId: donnees.horaireId,
        pratiqueId: donnees.pratiqueId || '',
        groupeNum: donnees.groupeNum || '00001',
        actif: groupesCours.length === 0, // Premier groupe-cours = actif par défaut
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
    };

    groupesCours.push(nouveauGroupeCours);
    await db.set(cle, groupesCours);

    return { succes: true, groupeCours: nouveauGroupeCours };
}

// ============================================
// CRUD - READ
// ============================================

/**
 * Obtient tous les groupe-cours d'un trimestre
 * @param {string} trimestreId - ID du trimestre
 * @returns {Promise<GroupeCours[]>}
 */
async function obtenirGroupesCours(trimestreId) {
    const cle = getCleGroupesCours(trimestreId);
    return await db.get(cle) || [];
}

/**
 * Version synchrone pour compatibilité
 * @param {string} trimestreId - ID du trimestre
 * @returns {GroupeCours[]}
 */
function obtenirGroupesCoursSync(trimestreId) {
    const cle = getCleGroupesCours(trimestreId);
    return db.getSync(cle) || [];
}

/**
 * Obtient un groupe-cours par son ID
 * @param {string} trimestreId - ID du trimestre
 * @param {string} groupeCoursId - ID du groupe-cours
 * @returns {Promise<GroupeCours|null>}
 */
async function obtenirGroupeCoursParId(trimestreId, groupeCoursId) {
    const groupesCours = await obtenirGroupesCours(trimestreId);
    return groupesCours.find(gc => gc.id === groupeCoursId) || null;
}

/**
 * Obtient le groupe-cours actif pour un trimestre
 * @param {string} trimestreId - ID du trimestre
 * @returns {Promise<GroupeCours|null>}
 */
async function obtenirGroupeCoursActif(trimestreId) {
    const groupesCours = await obtenirGroupesCours(trimestreId);
    return groupesCours.find(gc => gc.actif) || groupesCours[0] || null;
}

/**
 * Obtient un groupe-cours avec toutes ses entités hydratées
 * @param {string} trimestreId - ID du trimestre
 * @param {string} groupeCoursId - ID du groupe-cours
 * @returns {Promise<Object|null>} - Groupe-cours avec cours, enseignant, horaire
 */
async function obtenirGroupeCoursComplet(trimestreId, groupeCoursId) {
    const groupeCours = await obtenirGroupeCoursParId(trimestreId, groupeCoursId);
    if (!groupeCours) return null;

    return await hydraterGroupeCours(groupeCours);
}

/**
 * Obtient le groupe-cours actif avec toutes ses entités
 * @param {string} trimestreId - ID du trimestre
 * @returns {Promise<Object|null>}
 */
async function obtenirGroupeCoursActifComplet(trimestreId) {
    const groupeCours = await obtenirGroupeCoursActif(trimestreId);
    if (!groupeCours) return null;

    return await hydraterGroupeCours(groupeCours);
}

/**
 * Hydrate un groupe-cours avec ses entités
 * @param {GroupeCours} groupeCours - Le groupe-cours
 * @returns {Promise<Object>} - Groupe-cours avec entités
 */
async function hydraterGroupeCours(groupeCours) {
    const [cours, enseignant, horaire] = await Promise.all([
        window.CoursEntite?.obtenirParId(groupeCours.coursId),
        window.EnseignantsEntite?.obtenirParId(groupeCours.enseignantId),
        window.HorairesEntite?.obtenirParId(groupeCours.horaireId)
    ]);

    return {
        ...groupeCours,
        cours,
        enseignant,
        horaire,
        // Libellé complet pour affichage
        libelle: genererLibelleGroupeCours(groupeCours, cours, enseignant, horaire)
    };
}

// ============================================
// CRUD - UPDATE
// ============================================

/**
 * Met à jour un groupe-cours existant
 * @param {string} trimestreId - ID du trimestre
 * @param {string} groupeCoursId - ID du groupe-cours
 * @param {Object} modifications - Champs à modifier
 * @returns {Promise<GroupeCours|null>}
 */
async function mettreAJourGroupeCours(trimestreId, groupeCoursId, modifications) {
    const cle = getCleGroupesCours(trimestreId);
    const groupesCours = await db.get(cle) || [];
    const index = groupesCours.findIndex(gc => gc.id === groupeCoursId);

    if (index === -1) {
        console.warn('[GroupeCours] Non trouvé pour mise à jour:', groupeCoursId);
        return null;
    }

    // Mettre à jour les champs (sauf id, trimestreId et dateCreation)
    const champsModifiables = ['coursId', 'enseignantId', 'horaireId', 'pratiqueId', 'groupeNum', 'actif'];

    champsModifiables.forEach(champ => {
        if (modifications[champ] !== undefined) {
            groupesCours[index][champ] = modifications[champ];
        }
    });

    groupesCours[index].dateModification = new Date().toISOString();

    await db.set(cle, groupesCours);

    return groupesCours[index];
}

/**
 * Définit un groupe-cours comme actif (désactive les autres)
 * @param {string} trimestreId - ID du trimestre
 * @param {string} groupeCoursId - ID du groupe-cours à activer
 * @returns {Promise<boolean>}
 */
async function definirGroupeCoursActif(trimestreId, groupeCoursId) {
    const cle = getCleGroupesCours(trimestreId);
    const groupesCours = await db.get(cle) || [];

    let trouve = false;
    groupesCours.forEach(gc => {
        if (gc.id === groupeCoursId) {
            gc.actif = true;
            trouve = true;
        } else {
            gc.actif = false;
        }
    });

    if (!trouve) {
        console.warn('[GroupeCours] Non trouvé pour activation:', groupeCoursId);
        return false;
    }

    await db.set(cle, groupesCours);

    // Émettre un événement pour notifier le changement
    window.dispatchEvent(new CustomEvent('groupeCoursChange', {
        detail: { trimestreId, groupeCoursId }
    }));

    return true;
}

// ============================================
// CRUD - DELETE
// ============================================

/**
 * Supprime un groupe-cours
 * @param {string} trimestreId - ID du trimestre
 * @param {string} groupeCoursId - ID du groupe-cours à supprimer
 * @returns {Promise<boolean>}
 */
async function supprimerGroupeCours(trimestreId, groupeCoursId) {
    const cle = getCleGroupesCours(trimestreId);
    let groupesCours = await db.get(cle) || [];
    const indexAvant = groupesCours.length;

    const groupeASupprimer = groupesCours.find(gc => gc.id === groupeCoursId);
    groupesCours = groupesCours.filter(gc => gc.id !== groupeCoursId);

    if (groupesCours.length === indexAvant) {
        console.warn('[GroupeCours] Non trouvé pour suppression:', groupeCoursId);
        return false;
    }

    // Si le groupe supprimé était actif, activer le premier restant
    if (groupeASupprimer?.actif && groupesCours.length > 0) {
        groupesCours[0].actif = true;
    }

    await db.set(cle, groupesCours);
    return true;
}

// ============================================
// VALIDATION
// ============================================

/**
 * Valide les données d'un groupe-cours
 * @param {Object} donnees - Données à valider
 * @returns {Promise<{valide: boolean, erreurs: string[]}>}
 */
async function validerDonneesGroupeCours(donnees) {
    const erreurs = [];

    if (!donnees.trimestreId?.trim()) {
        erreurs.push('Le trimestre est requis');
    }

    if (!donnees.coursId?.trim()) {
        erreurs.push('Le cours est requis');
    } else {
        // Vérifier que le cours existe
        const cours = await window.CoursEntite?.obtenirParId(donnees.coursId);
        if (!cours) {
            erreurs.push('Le cours sélectionné n\'existe pas');
        }
    }

    if (!donnees.enseignantId?.trim()) {
        erreurs.push('L\'enseignant·e est requis');
    } else {
        // Vérifier que l'enseignant existe
        const enseignant = await window.EnseignantsEntite?.obtenirParId(donnees.enseignantId);
        if (!enseignant) {
            erreurs.push('L\'enseignant·e sélectionné·e n\'existe pas');
        }
    }

    if (!donnees.horaireId?.trim()) {
        erreurs.push('L\'horaire est requis');
    } else {
        // Vérifier que l'horaire existe
        const horaire = await window.HorairesEntite?.obtenirParId(donnees.horaireId);
        if (!horaire) {
            erreurs.push('L\'horaire sélectionné n\'existe pas');
        }
    }

    if (!donnees.groupeNum?.trim()) {
        erreurs.push('Le numéro de groupe est requis');
    }

    return {
        valide: erreurs.length === 0,
        erreurs
    };
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Génère un libellé complet pour un groupe-cours
 * @param {GroupeCours} gc - Le groupe-cours
 * @param {Object} cours - L'entité cours
 * @param {Object} enseignant - L'entité enseignant
 * @param {Object} horaire - L'entité horaire
 * @returns {string}
 */
function genererLibelleGroupeCours(gc, cours, enseignant, horaire) {
    const codeCours = cours?.codeCours || cours?.code || cours?.sigle || null;
    const groupe = gc?.groupeNum || '00001';
    const nomEns = enseignant ? `${enseignant.prenom?.[0] || ''}. ${enseignant.nom || ''}` : '';
    const nomHor = horaire?.nom || '';

    // 🆕 FIX (9 jan 2026) : Libellé lisible même sans cours
    let label;
    if (codeCours) {
        label = `${codeCours} gr.${groupe}`;
    } else {
        label = `Groupe ${groupe}`;
    }
    if (nomEns) label += ` - ${nomEns}`;
    if (nomHor) label += ` (${nomHor})`;

    return label;
}

/**
 * Génère un libellé court pour un groupe-cours
 * @param {GroupeCours} gc - Le groupe-cours
 * @param {Object} cours - L'entité cours
 * @returns {string}
 */
function genererLibelleCourtGroupeCours(gc, cours) {
    const codeCours = cours?.codeCours || cours?.code || cours?.sigle || null;
    const groupe = gc?.groupeNum || '00001';
    // 🆕 FIX (9 jan 2026) : Libellé lisible même sans cours
    return codeCours ? `${codeCours} gr.${groupe}` : `Groupe ${groupe}`;
}

/**
 * Compte le nombre de groupe-cours d'un trimestre
 * @param {string} trimestreId - ID du trimestre
 * @returns {Promise<number>}
 */
async function compterGroupesCours(trimestreId) {
    const groupesCours = await obtenirGroupesCours(trimestreId);
    return groupesCours.length;
}

/**
 * Obtient tous les groupe-cours de tous les trimestres
 * @returns {Promise<Object[]>} - Array avec {trimestreId, groupesCours}
 */
async function obtenirTousLesGroupesCours() {
    const trimestres = await db.get('trimestres') || [];
    const resultats = [];

    for (const trim of trimestres) {
        const groupesCours = await obtenirGroupesCours(trim.id);
        if (groupesCours.length > 0) {
            resultats.push({
                trimestreId: trim.id,
                trimestreNom: trim.nom || trim.id,
                groupesCours
            });
        }
    }

    return resultats;
}

/**
 * Normalise une liste de groupe-cours sur le champ canonique `groupeNum`.
 *
 * Dette d'intégrité #130/#306 (27 juin 2026). L'identité d'un groupe-cours est
 * portée par `groupeNum` — SEUL champ écrit par le chemin de création vivant
 * (`sauvegarderGroupeCoursV2`) et structurellement cohérent avec `nom` (même
 * champ de formulaire `#v2-gc-groupe`). Le champ legacy `groupe` n'est plus
 * écrit que par du code archivé (`js/_archives/`) ; il a pu réapparaître périmé
 * — voire inversé entre deux groupes (cas 601-101-MQ H26) — via une
 * reconstruction ou un import de codex ancien, et il GAGNE alors à tort dans les
 * lectures historiques `gc.groupe || gc.groupeNum`. On le retire.
 *
 * Règle pilotée par la donnée, jamais destructrice du canonique : si `groupeNum`
 * est absent (très anciens enregistrements du chemin Entité archivé), on promeut
 * `groupe` AVANT de le retirer ; un `groupeNum` présent n'est jamais écrasé.
 * Idempotente (un second passage ne trouve plus de champ `groupe`). Mute la
 * liste en place.
 *
 * @param {Array} liste - tableau de groupe-cours (muté en place)
 * @returns {{modifie: boolean, divergences: Array<{id, nom, groupe, groupeNum}>}}
 */
function normaliserGroupesCoursCanonique(liste) {
    const divergences = [];
    let modifie = false;
    if (!Array.isArray(liste)) return { modifie, divergences };
    liste.forEach(gc => {
        if (!gc || !Object.prototype.hasOwnProperty.call(gc, 'groupe')) return;
        const numPresent = gc.groupeNum !== undefined && gc.groupeNum !== null && gc.groupeNum !== '';
        const legacyPresent = gc.groupe !== undefined && gc.groupe !== null && gc.groupe !== '';
        if (!numPresent && legacyPresent) {
            // Promotion : le legacy devient le canonique avant son retrait.
            gc.groupeNum = gc.groupe;
        } else if (numPresent && legacyPresent && String(gc.groupe) !== String(gc.groupeNum)) {
            // Trace d'audit : divergence legacy ≠ canonique (le canonique fait foi).
            divergences.push({ id: gc.id, nom: gc.nom, groupe: gc.groupe, groupeNum: gc.groupeNum });
        }
        delete gc.groupe;
        modifie = true;
    });
    return { modifie, divergences };
}

// ============================================
// COMPATIBILITÉ AVEC infoCours (MIGRATION)
// ============================================

/**
 * Met à jour infoCours à partir du groupe-cours actif
 * Utile pour la rétrocompatibilité pendant la transition
 * 🆕 BETA 95.2 : Synchronise aussi les séances horaire et groupeCoursActif
 * @param {string} trimestreId - ID du trimestre
 */
async function synchroniserInfoCours(trimestreId) {
    const gcComplet = await obtenirGroupeCoursActifComplet(trimestreId);
    if (!gcComplet) return;

    // Construire un objet infoCours compatible avec l'ancien format
    const infoCours = {
        id: gcComplet.id,
        codeCours: gcComplet.cours?.codeCours || '',
        nomCours: gcComplet.cours?.nomCours || '',
        discipline: gcComplet.cours?.discipline || '',
        numeroCompetence: gcComplet.cours?.numeroCompetence || '',
        competence: gcComplet.cours?.competence || '',
        elementsCompetence: gcComplet.cours?.elementsCompetence || '',
        prenomEnseignant: gcComplet.enseignant?.prenom || '',
        nomEnseignant: gcComplet.enseignant?.nom || '',
        courriel: gcComplet.enseignant?.courriel || '',
        institution: gcComplet.enseignant?.institution || '',
        departement: gcComplet.enseignant?.departement || '',
        siteWeb: gcComplet.enseignant?.siteWeb || '',
        periodesParSemaine: gcComplet.horaire?.periodesParSemaine || 0,
        formatHoraire: gcComplet.horaire?.formatHoraire || '',
        local: gcComplet.horaire?.local || '',
        pratiqueId: gcComplet.pratiqueId || '',
        // Canonique groupeNum d'abord ; `|| groupe` = filet transitoire pour un
        // enregistrement non encore purgé (cf. normaliserCanonique).
        groupe: gcComplet.groupeNum || '',
        trimestreId: gcComplet.trimestreId,
        actif: true,
        // Source v96
        _source: 'groupe-cours',
        _groupeCoursId: gcComplet.id
    };

    await db.set('infoCours', infoCours);

    // 🆕 BETA 95.2 : Stocker groupeCoursActif pour obtenirSeancesHoraire()
    // ✅ CORRIGÉ (8 jan 2026) : Utiliser setSync pour persistance localStorage
    db.setSync('groupeCoursActif', {
        id: gcComplet.id,
        trimestreId: gcComplet.trimestreId,
        coursId: gcComplet.coursId,
        enseignantId: gcComplet.enseignantId,
        horaireId: gcComplet.horaireId,
        groupe: gcComplet.groupeNum
    });

    // 🆕 BETA 95.2 : Synchroniser les séances horaire pour rétrocompatibilité
    // Les modules saisie-presences.js et calendrier-vue.js lisent seancesHoraire
    if (gcComplet.horaire?.seances && gcComplet.horaire.seances.length > 0) {
        // Clé namespacée par trimestre
        const cleSeances = cle('seancesHoraire');
        await db.set(cleSeances, gcComplet.horaire.seances);

        // Également la clé legacy non namespacée (pour certains modules)
        await db.set('seancesHoraire', gcComplet.horaire.seances);

        // 🔧 FIX (30 mars 2026) : Synchroniser horaireHebdo avec le groupe actif
        // genererCalendrierComplet() lit cette clé pour marquer les jours de cours.
        // Sans cette sync, horaireHebdo contient les horaires fusionnés de tous les groupes
        // → le calendrier affiche les mauvais jours.
        db.setSync(cle('horaireHebdo'), gcComplet.horaire.seances);
    }

}

// ============================================
// EXPORTS GLOBAUX
// ============================================

window.GroupeCoursEntite = {
    // CRUD
    creer: creerGroupeCours,
    obtenirTous: obtenirGroupesCours,
    obtenirTousSync: obtenirGroupesCoursSync,
    obtenirParId: obtenirGroupeCoursParId,
    obtenirActif: obtenirGroupeCoursActif,
    obtenirComplet: obtenirGroupeCoursComplet,
    obtenirActifComplet: obtenirGroupeCoursActifComplet,
    mettreAJour: mettreAJourGroupeCours,
    definirActif: definirGroupeCoursActif,
    supprimer: supprimerGroupeCours,

    // Utilitaires
    hydrater: hydraterGroupeCours,
    normaliserCanonique: normaliserGroupesCoursCanonique,
    valider: validerDonneesGroupeCours,
    genererLibelle: genererLibelleGroupeCours,
    genererLibelleCourt: genererLibelleCourtGroupeCours,
    compter: compterGroupesCours,
    obtenirTousTrims: obtenirTousLesGroupesCours,

    // Compatibilité
    synchroniserInfoCours: synchroniserInfoCours,
    getCle: getCleGroupesCours
};



})();
