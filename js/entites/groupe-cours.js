/* ===============================
   ENTITÉ : GROUPE-COURS (Assemblage)
   Beta 95.2 - Refactoring Trimestre

   Assemblage des entités Cours, Enseignant, Horaire et Pratique
   en un groupe-cours pour un trimestre donné.

   Clé de stockage: '{trimestreId}_groupesCours' (array, namespacé)

   ⚠️ Surface RÉDUITE (27 juin 2026, zéro-dette) : l'ancien CRUD complet
   (creer/mettreAJour/supprimer/valider/definirActif + lectures par id/complet,
   libellé court, compter, tousTrims) n'avait AUCUN appelant vivant — seul
   `js/_archives/entites-ui.js` (non chargé) les invoquait. Supprimés. Le module
   expose désormais uniquement ce qui est réellement consommé : lecture
   (`obtenirTous`), synchronisation infoCours (`synchroniserInfoCours`) et
   normalisation canonique (`normaliserCanonique`, migration #130/#306). Les
   helpers internes restants (actif/complet/hydrater/libellé) servent la chaîne
   de `synchroniserInfoCours` et ne sont plus exportés.
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
// LECTURE / HYDRATATION
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
 * Obtient le groupe-cours actif pour un trimestre
 * @param {string} trimestreId - ID du trimestre
 * @returns {Promise<GroupeCours|null>}
 */
async function obtenirGroupeCoursActif(trimestreId) {
    const groupesCours = await obtenirGroupesCours(trimestreId);
    return groupesCours.find(gc => gc.actif) || groupesCours[0] || null;
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

        // #464/CT-11 : l'écriture legacy dans la clé NUE 'seancesHoraire' est
        // retirée (fuite inter-trimestre ; les lecteurs passent par cle()).

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
    obtenirTous: obtenirGroupesCours,
    normaliserCanonique: normaliserGroupesCoursCanonique,
    synchroniserInfoCours: synchroniserInfoCours
};



})();
