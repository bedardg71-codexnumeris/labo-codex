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
   FONCTIONS HELPER DE CONFIGURATION
   =============================== */

/**
 * Obtient la configuration des jetons depuis modalitesEvaluation
 * @returns {object} Configuration des jetons avec valeurs par défaut
 */
function obtenirConfigJetons() {
    const modalites = db.getSync('modalitesEvaluation', {});
    const configPAN = modalites.configPAN || {};

    // Valeurs par défaut si config PAN n'existe pas
    const jetonsDefaut = {
        actif: true,
        delai: { nombre: 2, dureeJours: 7 },
        reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true }
    };

    return configPAN.jetons || jetonsDefaut;
}

/**
 * Compte le nombre de jetons utilisés par un étudiant pour un type donné
 * @param {string} da - Code permanent de l'étudiant
 * @param {string} type - Type de jeton ('delai' ou 'reprise')
 * @returns {number} Nombre de jetons utilisés
 */
function compterJetonsUtilises(da, type) {
    // IMPORTANT: Utiliser directement localStorage pour éviter le conflit avec obtenirDonneesSelonMode
    // qui peut retourner les données de simulation au lieu des données réelles
    const evaluations = db.getSync('evaluationsSauvegardees', []);

    if (type === 'delai') {
        return evaluations.filter(e =>
            e.etudiantDA === da &&
            e.jetonDelaiApplique === true
        ).length;
    } else if (type === 'reprise') {
        return evaluations.filter(e =>
            e.etudiantDA === da &&
            e.jetonRepriseApplique === true
        ).length;
    } else if (type === 'repriseCiblee') {
        return evaluations.filter(e =>
            e.etudiantDA === da &&
            e.jetonRepriseCibleeApplique === true
        ).length;
    }

    return 0;
}

/**
 * Vérifie si un étudiant a encore des jetons disponibles
 * @param {string} da - Code permanent de l'étudiant
 * @param {string} type - Type de jeton ('delai' ou 'reprise')
 * @returns {boolean} true si des jetons sont disponibles
 */
function verifierDisponibiliteJeton(da, type) {
    const config = obtenirConfigJetons();

    // Vérifier que les jetons sont activés
    if (!config.actif) {
        return false;
    }

    // Compter les jetons utilisés
    const utilises = compterJetonsUtilises(da, type);

    // Comparer avec le nombre disponible
    if (type === 'delai') {
        return utilises < config.delai.nombre;
    } else if (type === 'reprise') {
        return utilises < config.reprise.nombre;
    }

    return false;
}

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

    // IMPORTANT: Utiliser directement localStorage pour éviter le conflit avec les modes
    const evaluations = db.getSync('evaluationsSauvegardees', []);
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return false;
    }

    // Vérifier la disponibilité des jetons de délai pour cet étudiant
    const da = evaluation.etudiantDA;
    if (!verifierDisponibiliteJeton(da, 'delai')) {
        const config = obtenirConfigJetons();
        const utilises = compterJetonsUtilises(da, 'delai');
        afficherNotificationErreur(
            'Jetons épuisés',
            `Plus de jetons de délai disponibles (${utilises}/${config.delai.nombre} utilisés)`
        );
        return false;
    }

    // Vérifier qu'il n'y a pas déjà un jeton de reprise
    if (evaluation.repriseDeId || evaluation.remplaceeParId) {
        afficherNotificationErreur('Conflit', 'Cette évaluation a déjà un jeton de reprise');
        return false;
    }

    // Obtenir la configuration pour la durée du délai
    const config = obtenirConfigJetons();
    const dureeDelai = config.delai.dureeJours;

    // Appliquer le jeton
    evaluation.jetonDelaiApplique = true;
    evaluation.dateApplicationJetonDelai = new Date().toISOString();
    evaluation.delaiAccorde = true;
    evaluation.dureeDelaiJours = dureeDelai; // Stocker la durée appliquée

    // Sauvegarder directement dans localStorage
    db.setSync('evaluationsSauvegardees', evaluations);
    console.log('✅ Évaluations sauvegardées avec jeton de délai');

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

    // IMPORTANT: Utiliser directement localStorage pour éviter le conflit avec les modes
    const evaluations = db.getSync('evaluationsSauvegardees', []);
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return false;
    }

    // Retirer le jeton
    delete evaluation.jetonDelaiApplique;
    delete evaluation.dateApplicationJetonDelai;
    delete evaluation.delaiAccorde;
    delete evaluation.dureeDelaiJours;

    // Sauvegarder directement dans localStorage
    db.setSync('evaluationsSauvegardees', evaluations);
    console.log('✅ Évaluations sauvegardées après retrait jeton de délai');

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
 * @param {boolean} archiverOriginale - Si true, archive l'originale; sinon la supprime (optionnel, lit config si omis)
 * @returns {object|null} La nouvelle évaluation créée, ou null si échec
 */
function appliquerJetonReprise(evaluationOriginaleId, archiverOriginale = null) {
    console.log('⭐ Application jeton de reprise:', evaluationOriginaleId);

    // IMPORTANT: Utiliser directement localStorage pour éviter le conflit avec les modes
    const evaluations = db.getSync('evaluationsSauvegardees', []);
    const indexOriginal = evaluations.findIndex(e => e.id === evaluationOriginaleId);

    if (indexOriginal === -1) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return null;
    }

    const evaluationOriginale = evaluations[indexOriginal];
    const da = evaluationOriginale.etudiantDA;

    // Vérifier la disponibilité des jetons de reprise pour cet étudiant
    if (!verifierDisponibiliteJeton(da, 'reprise')) {
        const config = obtenirConfigJetons();
        const utilises = compterJetonsUtilises(da, 'reprise');
        afficherNotificationErreur(
            'Jetons épuisés',
            `Plus de jetons de reprise disponibles (${utilises}/${config.reprise.nombre} utilisés)`
        );
        return null;
    }

    // Vérifier le nombre maximum de reprises par production
    const config = obtenirConfigJetons();
    const productionId = evaluationOriginale.productionId;

    // Compter combien de reprises existent déjà pour cette production et cet étudiant
    const reprisesExistantes = evaluations.filter(e =>
        e.etudiantDA === da &&
        e.productionId === productionId &&
        e.jetonRepriseApplique === true
    ).length;

    if (reprisesExistantes >= config.reprise.maxParProduction) {
        afficherNotificationErreur(
            'Limite atteinte',
            `Maximum de reprises atteint pour cette production (${reprisesExistantes}/${config.reprise.maxParProduction})`
        );
        return null;
    }

    // Utiliser la config pour déterminer si on archive ou supprime l'originale
    // Si le paramètre n'est pas fourni, utiliser la valeur de la config
    if (archiverOriginale === null) {
        archiverOriginale = config.reprise.archiverOriginale;
    }

    console.log('Archivage:', archiverOriginale ? 'OUI' : 'NON (suppression)');

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

    // Sauvegarder directement dans localStorage
    db.setSync('evaluationsSauvegardees', evaluations);
    console.log('✅ Évaluations sauvegardées avec jeton de reprise');
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

    // IMPORTANT: Utiliser directement localStorage pour éviter le conflit avec les modes
    const evaluations = db.getSync('evaluationsSauvegardees', []);
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

    // Sauvegarder directement dans localStorage
    db.setSync('evaluationsSauvegardees', evaluations);
    console.log('✅ Évaluations sauvegardées après retrait jeton de reprise');

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
   JETONS PERSONNALISÉS
   =============================== */

/**
 * Récupère tous les types de jetons (prédéfinis + personnalisés)
 * @returns {Array} Liste de tous les types de jetons
 */
function obtenirTousTypesJetons() {
    const config = obtenirConfigJetons();
    const typesJetons = [];

    // Jetons prédéfinis (toujours présents)
    typesJetons.push({
        id: 'delai',
        nom: 'Jeton de délai',
        description: 'Prolonge l\'échéance d\'une production',
        nombreTotal: config.delai?.nombre || 2,
        predefini: true
    });

    typesJetons.push({
        id: 'reprise',
        nom: 'Jeton de reprise',
        description: 'Permet de refaire une évaluation',
        nombreTotal: config.reprise?.nombre || 2,
        predefini: true
    });

    // Jeton de reprise ciblée (si activé)
    if (config.repriseCiblee?.actif) {
        typesJetons.push({
            id: 'repriseCiblee',
            nom: 'Jeton de reprise ciblée',
            description: 'Permet de refaire un seul critère d\'une évaluation',
            nombreTotal: config.repriseCiblee?.nombre || 2,
            predefini: true
        });
    }

    // Jetons personnalisés
    const typesPersonnalises = config.typesPersonnalises || [];
    typesPersonnalises.forEach(jeton => {
        typesJetons.push({
            id: jeton.id,
            nom: jeton.nom,
            description: jeton.description,
            nombreTotal: config.nombreParEleve || 2,
            predefini: false
        });
    });

    return typesJetons;
}

/**
 * Initialise la structure de suivi des jetons pour un étudiant
 * @param {string} da - Code permanent de l'étudiant
 */
function initialiserJetonsEtudiant(da) {
    const jetons = db.getSync('jetonsEtudiants', {});

    if (!jetons[da]) {
        jetons[da] = {};
        db.setSync('jetonsEtudiants', jetons);
    }
}

/**
 * Obtient le statut de tous les jetons pour un étudiant
 * @param {string} da - Code permanent de l'étudiant
 * @returns {Object} Statut des jetons { typeId: { utilises, total, restants } }
 */
function obtenirStatutJetonsEtudiant(da) {
    initialiserJetonsEtudiant(da);

    const tousTypes = obtenirTousTypesJetons();
    const statut = {};

    tousTypes.forEach(type => {
        if (type.predefini) {
            // Pour les jetons prédéfinis, compter depuis les évaluations
            const utilises = compterJetonsUtilises(da, type.id);
            statut[type.id] = {
                nom: type.nom,
                utilises: utilises,
                total: type.nombreTotal,
                restants: Math.max(0, type.nombreTotal - utilises)
            };
        } else {
            // Pour les jetons personnalisés, lire depuis jetonsEtudiants
            const jetons = db.getSync('jetonsEtudiants', {});
            const utilises = jetons[da]?.[type.id] || 0;
            statut[type.id] = {
                nom: type.nom,
                utilises: utilises,
                total: type.nombreTotal,
                restants: Math.max(0, type.nombreTotal - utilises)
            };
        }
    });

    return statut;
}

/**
 * Attribue (utilise) un jeton personnalisé à un étudiant
 * @param {string} da - Code permanent de l'étudiant
 * @param {string} jetonId - ID du type de jeton
 * @param {string} motif - Motif de l'utilisation (optionnel)
 * @returns {boolean} Succès ou échec
 */
function attribuerJetonPersonnalise(da, jetonId, motif = '') {
    const statut = obtenirStatutJetonsEtudiant(da);

    // Vérifier que le jeton existe et qu'il en reste
    if (!statut[jetonId]) {
        console.error('Type de jeton introuvable:', jetonId);
        return false;
    }

    if (statut[jetonId].restants <= 0) {
        alert(`Plus de jetons "${statut[jetonId].nom}" disponibles pour cet·te étudiant·e.`);
        return false;
    }

    // Incrémenter le compteur
    const jetons = db.getSync('jetonsEtudiants', {});
    if (!jetons[da]) jetons[da] = {};
    jetons[da][jetonId] = (jetons[da][jetonId] || 0) + 1;

    // Ajouter l'historique (optionnel)
    if (!jetons[da]._historique) jetons[da]._historique = [];
    jetons[da]._historique.push({
        jetonId: jetonId,
        action: 'attribue',
        motif: motif,
        date: new Date().toISOString()
    });

    db.setSync('jetonsEtudiants', jetons);
    console.log(`✅ Jeton personnalisé "${jetonId}" attribué à ${da}`);

    return true;
}

/**
 * Retire (annule l'utilisation de) un jeton personnalisé d'un étudiant
 * @param {string} da - Code permanent de l'étudiant
 * @param {string} jetonId - ID du type de jeton
 * @returns {boolean} Succès ou échec
 */
function retirerJetonPersonnalise(da, jetonId) {
    const jetons = db.getSync('jetonsEtudiants', {});

    if (!jetons[da] || !jetons[da][jetonId] || jetons[da][jetonId] <= 0) {
        console.error('Aucun jeton à retirer pour:', da, jetonId);
        return false;
    }

    // Décrémenter le compteur
    jetons[da][jetonId] = Math.max(0, jetons[da][jetonId] - 1);

    // Ajouter à l'historique
    if (!jetons[da]._historique) jetons[da]._historique = [];
    jetons[da]._historique.push({
        jetonId: jetonId,
        action: 'retire',
        date: new Date().toISOString()
    });

    db.setSync('jetonsEtudiants', jetons);
    console.log(`✅ Jeton personnalisé "${jetonId}" retiré de ${da}`);

    return true;
}

/* ===============================
   JETON DE REPRISE CIBLÉE
   =============================== */

/**
 * Applique un jeton de reprise ciblée à une évaluation
 * Crée une nouvelle évaluation avec modification ciblée d'UN SEUL critère
 *
 * @param {string} evaluationOriginaleId - ID de l'évaluation à remplacer
 * @param {string} critereId - ID du critère à corriger (optionnel, sera demandé si omis)
 * @param {boolean} archiverOriginale - Si true, archive l'originale; sinon la supprime (lit config si omis)
 * @returns {object|null} La nouvelle évaluation créée, ou null si échec
 */
function appliquerJetonRepriseCiblee(evaluationOriginaleId, critereId = null, archiverOriginale = null) {
    console.log('⭐ Application jeton de reprise ciblée:', evaluationOriginaleId, 'critère:', critereId);

    // IMPORTANT: Utiliser directement db.getSync pour éviter conflit avec les modes
    const evaluations = db.getSync('evaluationsSauvegardees', []);
    const indexOriginal = evaluations.findIndex(e => e.id === evaluationOriginaleId);

    if (indexOriginal === -1) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return null;
    }

    const evaluationOriginale = evaluations[indexOriginal];
    const da = evaluationOriginale.etudiantDA;

    // Vérifier la disponibilité des jetons de reprise ciblée pour cet étudiant
    // Pour l'instant, on utilise le même compteur que les reprises standard
    // TODO: Créer un compteur séparé si besoin
    const modalites = db.getSync('modalitesEvaluation', {});
    const configPAN = modalites.configPAN || {};
    const configRepriseCiblee = configPAN.jetons?.repriseCiblee || {};

    if (!configRepriseCiblee.actif) {
        afficherNotificationErreur('Fonction désactivée', 'Les jetons de reprise ciblée sont désactivés');
        return null;
    }

    // Utiliser la config pour déterminer si on archive ou supprime l'originale
    if (archiverOriginale === null) {
        archiverOriginale = configRepriseCiblee.archiverOriginale !== false; // Par défaut: archiver
    }

    console.log('Archivage:', archiverOriginale ? 'OUI' : 'NON (suppression)');

    // Créer la nouvelle évaluation (duplicata)
    const nouvelleEvaluation = {
        ...evaluationOriginale,
        id: 'EVAL_' + Date.now(),
        dateEvaluation: new Date().toISOString(),
        dateCreation: new Date().toISOString(),
        repriseDeIdCiblee: evaluationOriginaleId, // Lien vers l'originale (ciblée)
        critereRepriseCiblee: critereId, // Le critère qui sera corrigé
        jetonRepriseCibleeApplique: true,
        dateApplicationJetonRepriseCiblee: new Date().toISOString(),
        plafondNoteCiblee: configRepriseCiblee.plafondNote || 'M', // M par défaut
        verrouillee: false, // Déverrouiller pour permettre modification
        dateModification: undefined,
        heureModification: undefined,
        // IMPORTANT: Nettoyer les propriétés qui ne doivent PAS être copiées
        remplaceeParId: undefined,
        dateRemplacement: undefined,
        archivee: undefined,
        dateArchivage: undefined
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

    // Sauvegarder directement dans localStorage
    db.setSync('evaluationsSauvegardees', evaluations);
    console.log('✅ Évaluations sauvegardées avec jeton de reprise ciblée');
    console.log('✅ Jeton de reprise ciblée appliqué, nouvelle évaluation:', nouvelleEvaluation.id);

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Rafraîchir le tableau
    if (typeof initialiserListeEvaluations === 'function') {
        setTimeout(() => initialiserListeEvaluations(), 150);
    }

    afficherNotificationSucces(`Jeton de reprise ciblée appliqué (${archiverOriginale ? 'originale archivée' : 'originale supprimée'})`);
    return nouvelleEvaluation;
}

/**
 * Nettoie les propriétés incorrectes des évaluations de reprise ciblée
 * (Bug corrigé : les nouvelles évaluations héritaient de remplaceeParId de l'originale)
 */
function nettoyerEvaluationsRepriseCiblee() {
    const evaluations = db.getSync('evaluationsSauvegardees', []);
    let nbNettoyees = 0;

    evaluations.forEach(evaluation => {
        // Si c'est une reprise ciblée qui a incorrectement remplaceeParId
        if (evaluation.jetonRepriseCibleeApplique === true && evaluation.remplaceeParId) {
            console.log('🧹 Nettoyage reprise ciblée:', evaluation.id);
            delete evaluation.remplaceeParId;
            delete evaluation.dateRemplacement;
            delete evaluation.archivee;
            delete evaluation.dateArchivage;
            nbNettoyees++;
        }
    });

    if (nbNettoyees > 0) {
        db.setSync('evaluationsSauvegardees', evaluations);
        console.log(`✅ ${nbNettoyees} évaluation(s) de reprise ciblée nettoyée(s)`);

        // Rafraîchir la liste
        if (typeof initialiserListeEvaluations === 'function') {
            setTimeout(() => initialiserListeEvaluations(), 100);
        }
    }

    return nbNettoyees;
}

/* ===============================
   EXPORTS
   =============================== */

// Exporter les fonctions vers window pour qu'elles soient accessibles globalement
window.obtenirConfigJetons = obtenirConfigJetons;
window.compterJetonsUtilises = compterJetonsUtilises;
window.verifierDisponibiliteJeton = verifierDisponibiliteJeton;
window.appliquerJetonDelai = appliquerJetonDelai;
window.retirerJetonDelai = retirerJetonDelai;
window.appliquerJetonReprise = appliquerJetonReprise;
window.retirerJetonReprise = retirerJetonReprise;
window.appliquerJetonRepriseCiblee = appliquerJetonRepriseCiblee;
window.nettoyerEvaluationsRepriseCiblee = nettoyerEvaluationsRepriseCiblee;

// Jetons personnalisés
window.obtenirTousTypesJetons = obtenirTousTypesJetons;
window.obtenirStatutJetonsEtudiant = obtenirStatutJetonsEtudiant;
window.attribuerJetonPersonnalise = attribuerJetonPersonnalise;
window.retirerJetonPersonnalise = retirerJetonPersonnalise;

console.log('✅ Module evaluation-jetons.js chargé');
