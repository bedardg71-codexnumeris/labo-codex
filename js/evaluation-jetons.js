/* ===============================
   MODULE: GESTION DES JETONS D'ÉVALUATION
   Version: Beta 90 - Refonte ciblée

   ⚠️ PRINCIPES DE CONCEPTION:
   - Pas d'ID spéciaux (tous les ID sont EVAL_[timestamp])
   - Propriétés explicites (jetonDelaiApplique, repriseDeId, etc.)
   - Sauvegardes cohérentes via obtenirDonneesSelonMode/sauvegarderDonneesSelonMode
   - Pas de reload de page
   =============================== */

(function() {
'use strict';

/* ===============================
   FONCTIONS HELPER DE CONFIGURATION
   =============================== */

/**
 * #328 L2-c — Normalise une config de jetons (forme plate OU imbriquée) vers la forme
 * canonique imbriquée attendue par les consommateurs (`actif`, `delai.nombre`,
 * `reprise.nombre`, `repriseCiblee`…). Les jetons d'une pratique ont vécu sous 3 formes :
 *   - PLATE        : `{nombre, delaiDuree, repriseOriginale, cibleeActif, cibleePlafond}`
 *   - IMBRIQUÉE    : `{actif, delai{}, reprise{}, repriseCiblee{}}`  (config.jetons)
 *   - IMBRIQUÉE v2 : idem mais champ d'activation `activer`         (configuration.jetons, wizard)
 * La conversion PLATE → canonique est IDENTIQUE à l'ancien `_synchroniserJetonsPratique`
 * (préservation stricte du miroir dégonflé). Une forme NON reconnue ⇒ `null` (repli sûr
 * et visible — jamais absorbée en silence).
 *
 * @param {object|null} brut - jetons bruts portés par la pratique
 * @returns {object|null} config canonique, ou null si non reconnue
 */
function _normaliserConfigJetons(brut) {
    if (!brut || typeof brut !== 'object') return null;

    // Forme PLATE (marqueurs `nombre`/`delaiDuree`/`repriseOriginale`/`cibleeActif`).
    const estPlat = brut.nombre !== undefined || brut.delaiDuree !== undefined
        || brut.repriseOriginale !== undefined || brut.cibleeActif !== undefined;
    if (estPlat) {
        return {
            actif: brut.actif !== false,
            delai: { nombre: brut.nombre || 2, dureeJours: brut.delaiDuree || 2 },
            reprise: {
                nombre: brut.nombre || 2,
                maxParProduction: 1,
                archiverOriginale: brut.repriseOriginale === 'archiver'
            },
            repriseCiblee: {
                actif: brut.cibleeActif || false,
                plafondNote: brut.cibleePlafond || null
            }
        };
    }

    // Forme IMBRIQUÉE (delai/reprise sont des objets). `activer` (wizard) → `actif`.
    if ((brut.delai && typeof brut.delai === 'object') || (brut.reprise && typeof brut.reprise === 'object')) {
        const d = brut.delai || {};
        const r = brut.reprise || {};
        const rc = brut.repriseCiblee || null;
        return {
            actif: (brut.actif !== undefined ? brut.actif : brut.activer) !== false,
            delai: { nombre: d.nombre != null ? d.nombre : 2, dureeJours: d.dureeJours != null ? d.dureeJours : 2 },
            reprise: {
                nombre: r.nombre != null ? r.nombre : 2,
                maxParProduction: r.maxParProduction != null ? r.maxParProduction : 1,
                archiverOriginale: r.archiverOriginale !== false
            },
            // #328 L2-c (décision Grégoire, 27 juin) : repriseCiblee NON configurée sur la forme
            // imbriquée → défaut de l'app (ACTIF), cohérent avec jetonsDefaut et avec le comportement
            // antérieur d'une pratique sans miroir. Une pratique qui veut l'éteindre pose actif:false.
            repriseCiblee: rc
                ? { actif: rc.actif !== false, nombre: rc.nombre != null ? rc.nombre : 2, plafondNote: rc.plafondNote != null ? rc.plafondNote : null }
                : { actif: true, nombre: 2, plafondNote: null },
            // Agrégat « jetons par élève » : porté UNIQUEMENT par la forme imbriquée (jamais par
            // la forme plate, que l'ancien miroir ne synchronisait pas avec ce champ). undefined si
            // absent → l'appelant retombe sur configurationJetons puis défaut (préservation stricte).
            nombreParEleve: brut.nombreParEleve
        };
    }

    // Forme non reconnue → null (repli LOUD : obtenirConfigJetons retombe sur le défaut).
    return null;
}

/**
 * #328 L2-c — Dérive la config des jetons depuis la PRATIQUE ACTIVE (SSOT vivante),
 * en remplacement du miroir `modalitesEvaluation.configPAN.jetons` (décision D3 : pas de
 * snapshot, la config suit la pratique vivante). Lit la pratique configurable du
 * groupe-cours actif (ou demandée pour la simulation #307), puis normalise ses jetons.
 * Renvoie `null` pour une pratique codée-dur (aucune entrée configurable) → l'appelant
 * retombe sur son repli historique.
 *
 * @param {string|null} pratiqueIdDemande - pratique à inspecter (#307) ; absent ⇒ active
 * @returns {object|null} config canonique des jetons, ou null
 */
function obtenirConfigJetonsPratique(pratiqueIdDemande = null) {
    const pratiqueId = pratiqueIdDemande
        || (typeof obtenirPratiqueActiveGroupeCours === 'function' ? obtenirPratiqueActiveGroupeCours() : null);
    if (!pratiqueId) return null;

    const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);
    if (!Array.isArray(pratiques)) return null;
    const pratique = pratiques.find(p => p && p.id === pratiqueId);
    if (!pratique) return null;

    // Emplacement canonique → legacy : configuration.jetons (wizard) → config.jetons → jetons (plat).
    const brut = (pratique.configuration && pratique.configuration.jetons)
        || (pratique.config && pratique.config.jetons)
        || pratique.jetons
        || null;
    return _normaliserConfigJetons(brut);
}

/**
 * Obtient la configuration des jetons.
 * #328 L2-c : DÉRIVE de la pratique active (SSOT) ; le miroir `configPAN.jetons` n'est
 * plus lu. Repli historique conservé pour les pratiques codées-dur : `configurationJetons`
 * (format v2 plat) puis valeurs par défaut.
 * @returns {object} Configuration des jetons avec valeurs par défaut
 */
function obtenirConfigJetons() {
    // SSOT : config dérivée de la pratique active vivante.
    const depuisPratique = obtenirConfigJetonsPratique();
    if (depuisPratique) {
        return depuisPratique;
    }

    // Valeurs par défaut si aucune config jetons résolue
    const jetonsDefaut = {
        actif: true,
        delai: { nombre: 2, dureeJours: 2 },  // 🆕 Beta 95.7 : défaut 2 jours
        reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true },
        repriseCiblee: { actif: true, nombre: 2, plafondNote: null }
    };

    // Fallback: configurationJetons (format plat du module v2) et convertir
    const modalites = db.getSync(cle('modalitesEvaluation'), null) || {};
    const configV2 = modalites.configurationJetons;
    if (configV2) {
        return {
            actif: configV2.jetonsActif !== false,
            delai: {
                nombre: configV2.nombreParEleve || 2,
                dureeJours: configV2.dureeDelaiJours || 2
            },
            reprise: {
                nombre: configV2.nombreParEleve || 2,
                maxParProduction: 1,
                archiverOriginale: configV2.gestionOriginale === 'archiver'
            },
            repriseCiblee: {
                actif: configV2.repriseCibleeActif || false,
                plafondNote: configV2.plafondCiblee || null
            }
        };
    }

    return jetonsDefaut;
}

/**
 * Compte le nombre de jetons utilisés par un étudiant pour un type donné
 * @param {string} da - Code permanent de l'étudiant
 * @param {string} type - Type de jeton ('delai' ou 'reprise')
 * @returns {number} Nombre de jetons utilisés
 */
function compterJetonsUtilises(da, type) {
    // IMPORTANT: Utiliser directement db.getSync pour accéder aux données réelles
    const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);

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

    // IMPORTANT: Utiliser directement localStorage pour éviter le conflit avec les modes
    const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return false;
    }

    // Vérifier la disponibilité des jetons de délai pour cet étudiant
    const da = evaluation.etudiantDA;
    if (!verifierDisponibiliteJeton(da, 'delai')) {
        const config = obtenirConfigJetons();
        const utilises = compterJetonsUtilises(da, 'delai');
        notifications.erreur(
            'Jetons épuisés',
            `Plus de jetons de délai disponibles (${utilises}/${config.delai.nombre} utilisés)`
        );
        return false;
    }

    // Vérifier qu'il n'y a pas déjà un jeton de reprise
    if (evaluation.repriseDeId || evaluation.remplaceeParId) {
        notifications.erreur('Conflit', 'Cette évaluation a déjà un jeton de reprise');
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

    // Journal de bord — jeton de délai
    if (typeof Journal !== 'undefined') {
        Journal.ajouterEntree(evaluation,
            Journal.ACTIONS.JETON_APPLIQUE,
            { type: 'delai', dureeJours: dureeDelai });
    }

    // Sauvegarder via sauvegarderDonneesSelonMode (bloque en mode anonymisation)
    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);


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

    notifications.succes('Jeton de délai appliqué');
    return true;
}

/**
 * Retire un jeton de délai d'une évaluation
 * @param {string} evaluationId - ID de l'évaluation
 * @returns {boolean} Succès ou échec
 */
function retirerJetonDelai(evaluationId) {

    // IMPORTANT: Utiliser directement localStorage pour éviter le conflit avec les modes
    const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return false;
    }

    // Retirer le jeton
    delete evaluation.jetonDelaiApplique;
    delete evaluation.dateApplicationJetonDelai;
    delete evaluation.delaiAccorde;
    delete evaluation.dureeDelaiJours;

    // Sauvegarder via sauvegarderDonneesSelonMode (bloque en mode anonymisation)
    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);


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

    notifications.succes('Jeton de délai retiré');
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
 * @param {Object} [options] - { silencieux: false } pour supprimer les notifications
 * @returns {object|null} La nouvelle évaluation créée, ou null si échec
 */
function appliquerJetonReprise(evaluationOriginaleId, archiverOriginale, options) {
    if (archiverOriginale === undefined) archiverOriginale = null;
    var silencieux = options && options.silencieux;

    // IMPORTANT: Utiliser directement localStorage pour éviter le conflit avec les modes
    const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const indexOriginal = evaluations.findIndex(e => e.id === evaluationOriginaleId);

    if (indexOriginal === -1) {
        if (!silencieux) notifications.erreur('Erreur', 'Évaluation introuvable');
        return null;
    }

    const evaluationOriginale = evaluations[indexOriginal];
    const da = evaluationOriginale.etudiantDA;

    // Vérifier la disponibilité des jetons de reprise pour cet étudiant
    if (!verifierDisponibiliteJeton(da, 'reprise')) {
        const config = obtenirConfigJetons();
        const utilises = compterJetonsUtilises(da, 'reprise');
        if (!silencieux) notifications.erreur(
            'Jetons épuisés',
            'Plus de jetons de reprise disponibles (' + utilises + '/' + config.reprise.nombre + ' utilisés)'
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
        if (!silencieux) notifications.erreur(
            'Limite atteinte',
            'Maximum de reprises atteint pour cette production (' + reprisesExistantes + '/' + config.reprise.maxParProduction + ')'
        );
        return null;
    }

    // Utiliser la config pour déterminer si on archive ou supprime l'originale
    // Si le paramètre n'est pas fourni, utiliser la valeur de la config
    if (archiverOriginale === null) {
        archiverOriginale = config.reprise.archiverOriginale;
    }


    // ✅ CORRECTIF (30 déc 2025): Deep copy pour éviter la modification de l'original
    const copieOriginale = structuredClone(evaluationOriginale);

    // Créer la nouvelle évaluation (duplicata) avec un nouvel ID unique
    // Les scores de l'originale sont conservés — l'enseignant les modifiera lors de la réévaluation
    const nouvelId = genererIdUnique('EVAL_');
    const nouvelleEvaluation = {
        ...copieOriginale,
        id: nouvelId,
        dateEvaluation: new Date().toISOString(),
        dateCreation: new Date().toISOString(),
        repriseDeId: evaluationOriginaleId, // Lien vers l'originale
        jetonRepriseApplique: true,
        dateApplicationJetonReprise: new Date().toISOString(),
        verrouillee: false, // Déverrouiller pour permettre modification
        dateModification: undefined,
        heureModification: undefined
    };


    // Journal de bord — jeton de reprise (avant splice pour garder la bonne référence)
    var refOriginale = evaluations[indexOriginal];
    if (typeof Journal !== 'undefined') {
        Journal.ajouterEntree(refOriginale,
            Journal.ACTIONS.JETON_APPLIQUE,
            { type: 'reprise', nouvelleId: nouvelleEvaluation.id });
        Journal.ajouterEntree(nouvelleEvaluation,
            Journal.ACTIONS.JETON_APPLIQUE,
            { type: 'reprise', originaleId: evaluationOriginaleId });
    }

    if (archiverOriginale) {
        // Option 1: Archiver l'originale
        evaluations[indexOriginal].remplaceeParId = nouvelleEvaluation.id;
        evaluations[indexOriginal].dateRemplacement = new Date().toISOString();
        evaluations[indexOriginal].archivee = true;
        evaluations[indexOriginal].dateArchivage = new Date().toISOString();
    } else {
        // Option 2: Supprimer l'originale
        evaluations.splice(indexOriginal, 1);
    }

    // Ajouter la nouvelle évaluation
    evaluations.push(nouvelleEvaluation);

    // Sauvegarder via sauvegarderDonneesSelonMode (bloque en mode anonymisation)
    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Rafraîchir le tableau
    if (typeof initialiserListeEvaluations === 'function') {
        setTimeout(() => initialiserListeEvaluations(), 150);
    }

    if (!silencieux) notifications.succes('Jeton de reprise appliqué (' + (archiverOriginale ? 'originale archivée' : 'originale supprimée') + ')');
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

    // IMPORTANT: Utiliser directement localStorage pour éviter le conflit avec les modes
    const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const indexReprise = evaluations.findIndex(e => e.id === evaluationId);

    if (indexReprise === -1) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return false;
    }

    const evaluationReprise = evaluations[indexReprise];

    // #141 — appelée sur une ORIGINALE remplacée (et non sur la reprise) :
    // proposer la restauration au lieu de l'ancien no-op au message menteur
    // (« Jeton de reprise retiré » sans rien faire).
    // #360 (Option A) — exclure un marqueur de réconciliation : un doublon
    // `reconcilieParDoublon` porte `remplaceeParId` SANS être une originale
    // archivée par reprise ; le traiter ici splice-supprimerait le survivant
    // légitime (perte de la vraie note) avec un message mensonger.
    if (evaluationReprise.remplaceeParId && !evaluationReprise.reconcilieParDoublon) {
        const indexRepriseLiee = evaluations.findIndex(e => e.id === evaluationReprise.remplaceeParId);
        const noteRepriseLiee = indexRepriseLiee !== -1 ? (evaluations[indexRepriseLiee].noteFinale || 0) : null;
        const confirmer = confirm(
            'Cette évaluation est l\'ORIGINALE, remplacée par une reprise'
            + (noteRepriseLiee !== null ? ` (${noteRepriseLiee}%)` : '') + '.\n\n'
            + 'La restaurer supprimera la reprise. Continuer ?'
        );
        if (!confirmer) return false;

        delete evaluationReprise.remplaceeParId;
        delete evaluationReprise.dateRemplacement;
        delete evaluationReprise.archivee;
        delete evaluationReprise.dateArchivage;
        if (indexRepriseLiee !== -1) {
            evaluations.splice(indexRepriseLiee, 1);
        }
        notifications.succes('Originale restaurée' + (indexRepriseLiee !== -1 ? ', reprise supprimée' : ''));
    } else {

    // Trouver l'évaluation originale si elle existe
    // #360 (Option A) — parité avec restaurerOriginaleSiReprise : exclure un
    // doublon réconcilié. Sans `!reconcilieParDoublon`, si un doublon note-égale
    // pointe le survivant (cas reprise-survivante), ce find() peut le renvoyer
    // AVANT l'originale archivée → on ressuscite le doublon (re-double-compte) et
    // on splice la reprise légitime (perte de note) — exactement ce qu'on ferme.
    const evaluationOriginale = evaluations.find(e =>
        e.etudiantDA === evaluationReprise.etudiantDA &&
        e.productionId === evaluationReprise.productionId &&
        e.remplaceeParId === evaluationId &&
        !e.reconcilieParDoublon
    );

    if (evaluationOriginale) {
        // #141 — décocher le jeton = DÉFAIRE la reprise, un seul confirm,
        // défaut sûr (Annuler = aucun changement). L'ancienne branche
        // « OK = entériner la reprise » est RETIRÉE : une reprise assumée se
        // garde en laissant le jeton en place (l'originale archivée est la
        // trace) ; l'entérinement effaçait repriseDeId et fabriquait un état
        // orphelin irréparable depuis l'interface (bug terrain 10 juin).
        const noteOriginale = evaluationOriginale.noteFinale || 0;
        const noteReprise = evaluationReprise.noteFinale || 0;

        const confirmer = confirm(
            `Retirer le jeton de reprise ?\n\n` +
            `La reprise (${noteReprise}%) sera supprimée et l'originale (${noteOriginale}%) sera restaurée.\n\n` +
            `(Pour conserver la reprise, garde simplement le jeton en place.)`
        );
        if (!confirmer) {
            return false; // aucun changement — le caller remet la checkbox
        }

        // Retirer les flags de l'originale
        delete evaluationOriginale.remplaceeParId;
        delete evaluationOriginale.dateRemplacement;
        delete evaluationOriginale.archivee;
        delete evaluationOriginale.dateArchivage;

        // Supprimer la reprise
        evaluations.splice(indexReprise, 1);

        notifications.succes('Reprise supprimée, originale restaurée');

        // Recharger l'originale
        if (window.evaluationEnCours?.idModification === evaluationId) {
            setTimeout(() => {
                if (typeof modifierEvaluation === 'function') {
                    modifierEvaluation(evaluationOriginale.id);
                }
            }, 500);
        }
    } else {
        // Pas d'originale trouvée, juste nettoyer les propriétés
        delete evaluationReprise.repriseDeId;
        delete evaluationReprise.jetonRepriseApplique;
        delete evaluationReprise.dateApplicationJetonReprise;

        notifications.succes('Jeton de reprise retiré');
    }
    }

    // Sauvegarder via sauvegarderDonneesSelonMode (bloque en mode anonymisation)
    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

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

    // Jeton de reprise ciblée (si activé — actif par défaut si l'objet existe)
    if (config.repriseCiblee && config.repriseCiblee.actif !== false) {
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

    // IMPORTANT: Utiliser directement db.getSync pour éviter conflit avec les modes
    const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const indexOriginal = evaluations.findIndex(e => e.id === evaluationOriginaleId);

    if (indexOriginal === -1) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return null;
    }

    const evaluationOriginale = evaluations[indexOriginal];
    const da = evaluationOriginale.etudiantDA;

    // Vérifier la disponibilité des jetons de reprise ciblée pour cet étudiant
    // Pour l'instant, on utilise le même compteur que les reprises standard
    // TODO: Créer un compteur séparé si besoin
    // #328 L2-c : la config repriseCiblee dérive de la pratique active (plus de miroir configPAN.jetons).
    const configRepriseCiblee = obtenirConfigJetons().repriseCiblee || {};

    if (!configRepriseCiblee.actif) {
        notifications.erreur('Fonction désactivée', 'Les jetons de reprise ciblée sont désactivés');
        return null;
    }

    // Utiliser la config pour déterminer si on archive ou supprime l'originale
    if (archiverOriginale === null) {
        archiverOriginale = configRepriseCiblee.archiverOriginale !== false; // Par défaut: archiver
    }


    // ✅ CORRECTIF (30 déc 2025): Deep copy pour éviter la modification de l'original
    const copieOriginale = structuredClone(evaluationOriginale);

    // Créer la nouvelle évaluation (duplicata) avec un nouvel ID unique
    const nouvelId = genererIdUnique('EVAL_');
    const nouvelleEvaluation = {
        ...copieOriginale,
        id: nouvelId,
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


    // Journal de bord — jeton de reprise ciblée (avant splice pour garder la bonne référence)
    var refOriginaleCiblee = evaluations[indexOriginal];
    if (typeof Journal !== 'undefined') {
        Journal.ajouterEntree(refOriginaleCiblee,
            Journal.ACTIONS.JETON_APPLIQUE,
            { type: 'reprise_ciblee', nouvelleId: nouvelleEvaluation.id, critereId: critereId });
        Journal.ajouterEntree(nouvelleEvaluation,
            Journal.ACTIONS.JETON_APPLIQUE,
            { type: 'reprise_ciblee', originaleId: evaluationOriginaleId, critereId: critereId });
    }

    if (archiverOriginale) {
        // Option 1: Archiver l'originale
        evaluations[indexOriginal].remplaceeParId = nouvelleEvaluation.id;
        evaluations[indexOriginal].dateRemplacement = new Date().toISOString();
        evaluations[indexOriginal].archivee = true;
        evaluations[indexOriginal].dateArchivage = new Date().toISOString();
    } else {
        // Option 2: Supprimer l'originale
        evaluations.splice(indexOriginal, 1);
    }

    // Ajouter la nouvelle évaluation
    evaluations.push(nouvelleEvaluation);

    // Sauvegarder via sauvegarderDonneesSelonMode (bloque en mode anonymisation)
    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Rafraîchir le tableau
    if (typeof initialiserListeEvaluations === 'function') {
        setTimeout(() => initialiserListeEvaluations(), 150);
    }

    notifications.succes(`Jeton de reprise ciblée appliqué (${archiverOriginale ? 'originale archivée' : 'originale supprimée'})`);
    return nouvelleEvaluation;
}

/**
 * Nettoie les propriétés incorrectes des évaluations de reprise ciblée
 * (Bug corrigé : les nouvelles évaluations héritaient de remplaceeParId de l'originale)
 */
function nettoyerEvaluationsRepriseCiblee() {
    const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    let nbNettoyees = 0;

    evaluations.forEach(evaluation => {
        // Si c'est une reprise ciblée qui a incorrectement remplaceeParId
        if (evaluation.jetonRepriseCibleeApplique === true && evaluation.remplaceeParId) {
            delete evaluation.remplaceeParId;
            delete evaluation.dateRemplacement;
            delete evaluation.archivee;
            delete evaluation.dateArchivage;
            nbNettoyees++;
        }
    });

    if (nbNettoyees > 0) {
        sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

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
window.obtenirConfigJetonsPratique = obtenirConfigJetonsPratique;  // #328 L2-c (réutilisé par les lecteurs migrés)
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



})();
