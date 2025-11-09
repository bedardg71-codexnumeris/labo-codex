/* ===============================
   MODULE: GESTION DES JETONS D'ÉVALUATION
   Version: Beta 90 - Refonte ciblée

   ⚠️ PRINCIPES DE CONCEPTION:
   - Pas d'ID spéciaux (tous les ID sont EVAL_[timestamp])
   - Propriétés explicites (jetonDelaiApplique, repriseDeId, etc.)
   - Sauvegardes cohérentes via obtenirDonneesSelonMode/sauvegarderDonneesSelonMode
   - Pas de reload de page
   =============================== */

/* ===============================
   JETON DE DÉLAI
   =============================== */

/**
 * Applique un jeton de délai à une évaluation
 * @param {string} evaluationId - ID de l'évaluation
 * @returns {boolean} Succès ou échec
 */
function appliquerJetonDelai(evaluationId) {
    console.log('⭐ Application jeton de délai:', evaluationId);

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return false;
    }

    // Vérifier qu'il n'y a pas déjà un jeton de reprise
    if (evaluation.repriseDeId || evaluation.remplaceeParId) {
        afficherNotificationErreur('Conflit', 'Cette évaluation a déjà un jeton de reprise');
        return false;
    }

    // Appliquer le jeton
    evaluation.jetonDelaiApplique = true;
    evaluation.dateApplicationJetonDelai = new Date().toISOString();
    evaluation.delaiAccorde = true;

    // Sauvegarder
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Erreur', 'Impossible de sauvegarder');
        return false;
    }

    console.log('✅ Jeton de délai appliqué');

    // Mettre à jour evaluationEnCours si c'est l'évaluation active
    if (window.evaluationEnCours?.idModification === evaluationId) {
        window.evaluationEnCours.jetonDelaiApplique = true;
        window.evaluationEnCours.dateApplicationJetonDelai = evaluation.dateApplicationJetonDelai;
        window.evaluationEnCours.delaiAccorde = true;
    }

    // Rafraîchir l'affichage
    if (typeof afficherBadgesJetons === 'function') {
        afficherBadgesJetons();
    }

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Rafraîchir le tableau
    if (typeof initialiserListeEvaluations === 'function') {
        setTimeout(() => initialiserListeEvaluations(), 150);
    }

    afficherNotificationSucces('Jeton de délai appliqué');
    return true;
}

/**
 * Retire un jeton de délai d'une évaluation
 * @param {string} evaluationId - ID de l'évaluation
 * @returns {boolean} Succès ou échec
 */
function retirerJetonDelai(evaluationId) {
    console.log('🗑️ Retrait jeton de délai:', evaluationId);

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return false;
    }

    // Retirer le jeton
    delete evaluation.jetonDelaiApplique;
    delete evaluation.dateApplicationJetonDelai;
    delete evaluation.delaiAccorde;

    // Sauvegarder
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Erreur', 'Impossible de sauvegarder');
        return false;
    }

    console.log('✅ Jeton de délai retiré');

    // Mettre à jour evaluationEnCours si c'est l'évaluation active
    if (window.evaluationEnCours?.idModification === evaluationId) {
        delete window.evaluationEnCours.jetonDelaiApplique;
        delete window.evaluationEnCours.dateApplicationJetonDelai;
        delete window.evaluationEnCours.delaiAccorde;
    }

    // Rafraîchir l'affichage
    if (typeof afficherBadgesJetons === 'function') {
        afficherBadgesJetons();
    }

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Rafraîchir le tableau
    if (typeof initialiserListeEvaluations === 'function') {
        setTimeout(() => initialiserListeEvaluations(), 150);
    }

    afficherNotificationSucces('Jeton de délai retiré');
    return true;
}

/* ===============================
   JETON DE REPRISE
   =============================== */

/**
 * Applique un jeton de reprise à une évaluation
 * Crée une nouvelle évaluation qui remplace l'originale
 *
 * @param {string} evaluationOriginaleId - ID de l'évaluation à remplacer
 * @param {boolean} archiverOriginale - Si true, archive l'originale; sinon la supprime
 * @returns {object|null} La nouvelle évaluation créée, ou null si échec
 */
function appliquerJetonReprise(evaluationOriginaleId, archiverOriginale = true) {
    console.log('⭐ Application jeton de reprise:', evaluationOriginaleId, 'archiver:', archiverOriginale);

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const indexOriginal = evaluations.findIndex(e => e.id === evaluationOriginaleId);

    if (indexOriginal === -1) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return null;
    }

    const evaluationOriginale = evaluations[indexOriginal];

    // Créer la nouvelle évaluation (duplicata)
    const nouvelleEvaluation = {
        ...evaluationOriginale,
        id: 'EVAL_' + Date.now(), // ID NORMAL, pas EVAL_REPRISE_
        dateEvaluation: new Date().toISOString(),
        dateCreation: new Date().toISOString(),
        repriseDeId: evaluationOriginaleId, // Lien vers l'originale
        jetonRepriseApplique: true,
        dateApplicationJetonReprise: new Date().toISOString(),
        verrouillee: false, // Déverrouiller pour permettre modification
        dateModification: undefined,
        heureModification: undefined
    };

    if (archiverOriginale) {
        // Option 1: Archiver l'originale
        evaluations[indexOriginal].remplaceeParId = nouvelleEvaluation.id;
        evaluations[indexOriginal].dateRemplacement = new Date().toISOString();
        evaluations[indexOriginal].archivee = true;
        evaluations[indexOriginal].dateArchivage = new Date().toISOString();
        console.log('📦 Originale archivée');
    } else {
        // Option 2: Supprimer l'originale
        evaluations.splice(indexOriginal, 1);
        console.log('🗑️ Originale supprimée');
    }

    // Ajouter la nouvelle évaluation
    evaluations.push(nouvelleEvaluation);

    // Sauvegarder
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Erreur', 'Impossible de sauvegarder');
        return null;
    }

    console.log('✅ Jeton de reprise appliqué, nouvelle évaluation:', nouvelleEvaluation.id);

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Rafraîchir le tableau
    if (typeof initialiserListeEvaluations === 'function') {
        setTimeout(() => initialiserListeEvaluations(), 150);
    }

    afficherNotificationSucces(`Jeton de reprise appliqué (${archiverOriginale ? 'originale archivée' : 'originale supprimée'})`);
    return nouvelleEvaluation;
}

/**
 * Retire un jeton de reprise d'une évaluation
 * Demande à l'utilisateur s'il veut archiver ou supprimer l'originale
 *
 * @param {string} evaluationId - ID de l'évaluation de reprise
 * @returns {boolean} Succès ou échec
 */
function retirerJetonReprise(evaluationId) {
    console.log('🗑️ Retrait jeton de reprise:', evaluationId);

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const indexReprise = evaluations.findIndex(e => e.id === evaluationId);

    if (indexReprise === -1) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return false;
    }

    const evaluationReprise = evaluations[indexReprise];

    // Trouver l'évaluation originale si elle existe
    const evaluationOriginale = evaluations.find(e =>
        e.etudiantDA === evaluationReprise.etudiantDA &&
        e.productionId === evaluationReprise.productionId &&
        e.remplaceeParId === evaluationId
    );

    if (evaluationOriginale) {
        // Demander à l'utilisateur ce qu'il veut faire
        const noteOriginale = evaluationOriginale.noteFinale || 0;
        const noteReprise = evaluationReprise.noteFinale || 0;

        const garderReprise = confirm(
            `Voulez-vous conserver la reprise et archiver l'originale ?\n\n` +
            `• OK : La reprise (${noteReprise}%) devient l'évaluation principale, l'originale (${noteOriginale}%) est archivée\n` +
            `• Annuler : La reprise est supprimée, l'originale (${noteOriginale}%) est restaurée`
        );

        if (garderReprise) {
            // Garder la reprise, archiver l'originale
            console.log('✅ Conservation de la reprise, archivage de l\'originale');

            // Nettoyer les propriétés de jeton de la reprise
            delete evaluationReprise.repriseDeId;
            delete evaluationReprise.jetonRepriseApplique;
            delete evaluationReprise.dateApplicationJetonReprise;

            // L'originale reste archivée (ne rien changer)

            afficherNotificationSucces('Reprise conservée, originale archivée');
        } else {
            // Supprimer la reprise, restaurer l'originale
            console.log('✅ Suppression de la reprise, restauration de l\'originale');

            // Retirer les flags de l'originale
            delete evaluationOriginale.remplaceeParId;
            delete evaluationOriginale.dateRemplacement;
            delete evaluationOriginale.archivee;
            delete evaluationOriginale.dateArchivage;

            // Supprimer la reprise
            evaluations.splice(indexReprise, 1);

            afficherNotificationSucces('Reprise supprimée, originale restaurée');

            // Recharger l'originale
            if (window.evaluationEnCours?.idModification === evaluationId) {
                setTimeout(() => {
                    if (typeof modifierEvaluation === 'function') {
                        modifierEvaluation(evaluationOriginale.id);
                    }
                }, 500);
            }
        }
    } else {
        // Pas d'originale trouvée, juste nettoyer les propriétés
        console.log('⚠️ Aucune originale trouvée, nettoyage simple');
        delete evaluationReprise.repriseDeId;
        delete evaluationReprise.jetonRepriseApplique;
        delete evaluationReprise.dateApplicationJetonReprise;

        afficherNotificationSucces('Jeton de reprise retiré');
    }

    // Sauvegarder
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Erreur', 'Impossible de sauvegarder');
        return false;
    }

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Rafraîchir le tableau
    if (typeof initialiserListeEvaluations === 'function') {
        setTimeout(() => initialiserListeEvaluations(), 150);
    }

    // Rafraîchir les badges si on est sur cette évaluation
    if (window.evaluationEnCours?.idModification === evaluationId) {
        if (typeof afficherBadgesJetons === 'function') {
            afficherBadgesJetons();
        }
    }

    return true;
}

/* ===============================
   EXPORTS
   =============================== */

// Exporter les fonctions vers window pour qu'elles soient accessibles globalement
window.appliquerJetonDelai = appliquerJetonDelai;
window.retirerJetonDelai = retirerJetonDelai;
window.appliquerJetonReprise = appliquerJetonReprise;
window.retirerJetonReprise = retirerJetonReprise;

console.log('✅ Module evaluation-jetons.js chargé');
