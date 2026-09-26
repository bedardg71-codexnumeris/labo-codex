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
/**
 * #853 (13 sept. 2026) — « Permettre un délai sur une reprise », réglage de la PRATIQUE.
 * Grégoire : « la question dépend de l'utilisateur, je ne veux pas imposer ma pratique à moi. »
 * La clé n'apparaît dans la config canonique QUE si le réglage est coché : absent (toute
 * pratique antérieure, importée ou partagée) = comportement antérieur (refus), et les configs
 * existantes restent identiques à l'octet (sentinelle L2c).
 * Formes : `delaiSurReprise` (PLATE, formulaire de gestion) ; `delai.surReprise` (IMBRIQUÉE, assistant).
 */
function _optionDelaiSurReprise(valeur) {
    return valeur === true ? { surReprise: true } : {};
}

function _normaliserConfigJetons(brut) {
    if (!brut || typeof brut !== 'object') return null;

    // Forme PLATE (marqueurs `nombre`/`delaiDuree`/`repriseOriginale`/`cibleeActif`).
    const estPlat = brut.nombre !== undefined || brut.delaiDuree !== undefined
        || brut.repriseOriginale !== undefined || brut.cibleeActif !== undefined;
    if (estPlat) {
        return {
            actif: brut.actif !== false,
            delai: Object.assign({ nombre: brut.nombre || 2, dureeJours: brut.delaiDuree || 2 },
                _optionDelaiSurReprise(brut.delaiSurReprise)),
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
            delai: Object.assign({ nombre: d.nombre != null ? d.nombre : 2, dureeJours: d.dureeJours != null ? d.dureeJours : 2 },
                _optionDelaiSurReprise(d.surReprise)),
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
    // Lot N1b (21 sept. 2026) : sans pratique demandée, l'id que rend LA désignation (un ancien
    // pointeur mène à SA pratique de bibliothèque) ; sans pratique assignée, aucune config de jetons.
    const pratiqueId = pratiqueIdDemande
        || (typeof obtenirIdPratiqueActive === 'function' ? obtenirIdPratiqueActive() : null);
    if (!pratiqueId) return null;

    const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
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
 * #941 lot S3 (D5, décision de Grégoire du 24 sept. 2026) — LES JETONS QUE LA PRATIQUE DÉCLARE,
 * ou `null`. Ce que l'élève lit des jetons (le bloc « Jetons utilisés » de la synthèse, PDF et
 * écran, et la mention « Note provisoire ») n'existe que si la pratique déclare des jetons ACTIFS.
 * Les valeurs par défaut de `obtenirConfigJetons` (2 / 2 / 2) n'atteignent jamais l'élève : il
 * lirait des délais et des reprises que son enseignant·e n'offre pas.
 *   · pratique configurable active : son bloc de jetons, s'il existe et est actif ;
 *   · sinon, l'ancien réglage explicite (`modalitesEvaluation.configurationJetons`), s'il est actif :
 *     c'est une déclaration de l'enseignant·e, pas un défaut ;
 *   · sinon : `null`.
 * `obtenirConfigJetons` garde ses défauts pour les gestes de l'enseignant·e (appliquer un jeton).
 */
function jetonsDeclares() {
    const depuisPratique = obtenirConfigJetonsPratique();
    if (depuisPratique) return depuisPratique.actif ? depuisPratique : null;
    const modalites = db.getSync(cle('modalitesEvaluation'), null) || {};
    if (!modalites.configurationJetons) return null;
    const config = obtenirConfigJetons();
    return (config && config.actif) ? config : null;
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

/**
 * #563 — Persiste les évaluations et DIT si l'écriture a été refusée.
 *
 * `sauvegarderDonneesSelonMode` rend `false` en mode anonymisation (écriture
 * bloquée) comme sur erreur de stockage. Les six sites d'écriture de ce module
 * ignoraient ce retour : le jeton n'était pas enregistré, mais l'interface se
 * mettait à jour comme si tout allait bien — badges, notification de succès,
 * rafraîchissement de la liste. Au rechargement, le jeton avait disparu sans que
 * personne n'ait rien vu passer.
 *
 * Point de persistance UNIQUE : le prochain site d'écriture n'a plus à se
 * souvenir d'examiner le retour, il a juste à passer par ici.
 *
 * @param {Array} evaluations - Le tableau complet à persister
 * @param {string} geste - Ce que l'utilisateur croyait faire, pour le message
 * #617/#725 (13 sept. 2026) : `sauvegarderDonneesSelonMode` rend deux refus — `'quota'` et
 * `'error'` (l'écriture a levé, `modes.js`) ; l'anonymisation n'en est plus un depuis le lot A
 * de l'enregistrement (26 sept. 2026). Ce sont des chaînes, donc truthy : l'ancien `return ok` les laissait passer pour un succès
 * chez tous les appelants. Seul `true` est un succès — même contrat que `supprimerEvaluation`.
 *
 * @returns {boolean} true si l'écriture a bien eu lieu, false sinon (jamais une chaîne)
 */
function _persisterEvaluationsJetons(evaluations, geste) {
    const retour = sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);
    const ok = retour === true;
    if (!ok) {
        const cause = retour === 'quota' ? "l'espace de stockage est plein."
            : "le stockage a refusé l'écriture.";
        console.warn('[Jetons] Écriture refusée (' + String(retour) + ') — ' + geste);
        notifications.erreur('Modification non enregistrée', geste + ' : ' + cause);
    }
    return ok;
}

/**
 * #607 — combien de fichiers actifs sont liés à cette évaluation. Lecture
 * seule : sert à ANNONCER dans le `confirm` ce que le geste va emporter, avant
 * qu'il l'emporte.
 * @param {string} evaluationId
 * @returns {number}
 */
function _compterFichiersDeEvaluation(evaluationId) {
    if (!evaluationId) return 0;
    if (typeof travauxStockage === 'undefined' || !travauxStockage) return 0;
    return travauxStockage.obtenirFichiersTravaux()
        .filter(f => f.evaluationId === evaluationId).length;
}

/**
 * #607 (constat S5 de l'audit du 30 août 2026) — les fichiers d'une évaluation
 * qui disparaît ne peuvent pas rester actifs.
 *
 * La liste résout le fichier de chaque ligne SANS `id` (`liste-evaluations.js`),
 * donc par le repli (DA, production) → « le plus récent par dateModification ».
 * Un fichier de reprise orphelin est TOUJOURS le plus récent de la paire : sans
 * ce détachement, la ligne de l'originale restaurée ouvre le travail de la
 * reprise qu'on vient d'effacer.
 *
 * Deux modes, parce que les deux gestes ne disent pas la même chose :
 *  - `corbeille` : la reprise est annulée, le travail remis pour elle n'a plus
 *    de raison d'être actif — il part à la corbeille (blob intact, restaurable).
 *  - `delier` : l'originale est supprimée au profit de la reprise
 *    (`archiverOriginale: false`). L'élève a bien remis ce travail : on ne le
 *    jette pas, on coupe seulement son lien vers une évaluation disparue.
 *
 * À appeler APRÈS `_persisterEvaluationsJetons`, et seulement s'il a rendu `true` (#617,
 * 13 sept. 2026 — appelé avant, un refus d'écriture laissait le fichier à la corbeille et
 * l'évaluation en place). Les deux écritures se suivent sans point d'attente entre elles.
 *
 * @param {string} evaluationId - ID de l'évaluation qui disparaît
 * @param {string} mode - 'corbeille' ou 'delier'
 * @returns {number} nombre de fichiers touchés
 */
function _detacherFichiersDeEvaluation(evaluationId, mode) {
    if (!evaluationId) return 0;
    if (typeof travauxStockage === 'undefined' || !travauxStockage) return 0;

    const fichiers = travauxStockage.obtenirFichiersTravaux()
        .filter(f => f.evaluationId === evaluationId);

    fichiers.forEach(f => {
        if (mode === 'corbeille') {
            travauxStockage.deplacerEnCorbeille(f.id);
        } else {
            travauxStockage.mettreAJourFichier(f.id, { evaluationId: '', estReprise: false });
        }
    });

    return fichiers.length;
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

    // Obtenir la configuration (durée du délai, et #853 : délai permis sur une reprise ?)
    const config = obtenirConfigJetons();

    // Une copie REMPLACÉE ne compte plus : jamais de délai sur elle.
    if (evaluation.remplaceeParId) {
        notifications.erreur('Conflit', 'Cette évaluation a été remplacée par une reprise');
        return false;
    }
    // #853 (13 sept. 2026) — un délai SUR une reprise dépend du réglage de la pratique
    // (`delai.surReprise`, absent = refus, comportement antérieur). Grégoire : « je ne veux pas
    // imposer ma pratique à moi ».
    // (`config.delai` est toujours posé : les trois constructeurs de config et le défaut le portent.)
    if (evaluation.repriseDeId && config.delai.surReprise !== true) {
        notifications.erreur('Conflit', 'Ta pratique ne permet pas de délai sur une reprise (réglage des jetons)');
        return false;
    }
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
    if (!_persisterEvaluationsJetons(evaluations, 'Application du jeton de délai')) return false;


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
    if (!_persisterEvaluationsJetons(evaluations, 'Retrait du jeton de délai')) return false;


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

    // #724 (13 sept. 2026) — garde symétrique à celle d'`appliquerJetonDelai` : une évaluation
    // déjà REMPLACÉE (par une reprise, ou par réconciliation d'un doublon #360) ne compte plus.
    // En faire une reprise créait une copie qui héritait de `remplaceeParId` — donc exclue de tout
    // calcul de note — et que la garde `maxParProduction` ne voyait pas (pas de jetonRepriseApplique).
    // Une reprise de reprise reste permise : c'est `maxParProduction` qui la borne.
    if (evaluationOriginale.remplaceeParId || evaluationOriginale.reconcilieParDoublon) {
        if (!silencieux) notifications.erreur('Conflit', 'Cette évaluation est déjà remplacée : applique la reprise sur celle qui compte.');
        return null;
    }

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
    // #720/#724 (13 sept. 2026) — la reprise naît PROPRE : elle ne recopie pas l'état que
    // l'originale portait comme copie jugée. Le délai déjà accordé (qui comptait un second jeton
    // au quota), le remplacement et l'archivage (qui l'excluaient de la note), la marque de
    // réconciliation et la reprise ciblée retirée restent sur l'originale.
    ['jetonDelaiApplique', 'dateApplicationJetonDelai', 'delaiAccorde', 'dureeDelaiJours',
        'jetonRepriseCibleeApplique', 'remplaceeParId', 'dateRemplacement', 'archivee',
        'dateArchivage', 'reconcilieParDoublon'].forEach(champ => { delete nouvelleEvaluation[champ]; });


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
        // Option 2: Supprimer l'originale.
        // Audit du 5 sept. 2026 (G-4) : `repriseDeId` désigne alors un id disparu. L'aval
        // est cohérent — retirer le jeton nettoie sans restaurer (`:692-699`), l'impact des
        // jetons rend `noteOriginale: null` — et la note du cours ne le lit pas. Commenté, pas de fiche.
        evaluations.splice(indexOriginal, 1);
    }

    // Ajouter la nouvelle évaluation
    evaluations.push(nouvelleEvaluation);

    // Sauvegarder via sauvegarderDonneesSelonMode (bloque en mode anonymisation)
    if (!_persisterEvaluationsJetons(evaluations, 'Application du jeton de reprise')) return null;

    // #607 — sans quoi le fichier de l'originale supprimée garde un evaluationId mort.
    // #617 (13 sept. 2026) : APRÈS l'écriture confirmée — délier avant, sur un refus, coupait le
    // fichier d'une originale restée en place.
    if (!archiverOriginale) _detacherFichiersDeEvaluation(evaluationOriginaleId, 'delier');

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

    // #725/#617 (13 sept. 2026) — les branches ci-dessous DÉCIDENT, elles n'agissent pas hors
    // du tableau : la notification de succès, la mise à la corbeille des fichiers de reprise et
    // le rechargement de l'originale attendent que l'écriture soit CONFIRMÉE (queue de fonction).
    // Avant : « Originale restaurée » et la corbeille partaient, puis l'écriture échouait.
    // Modèle : `retirerJetonDelai` (persister, puis dire).
    let messageSucces = 'Jeton de reprise retiré';
    let idFichiersACorbeille = null;
    let idOriginaleARecharger = null;

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
        // #607 — même annonce du côté de l'originale.
        const nbFichiersLiesAnnonces = _compterFichiersDeEvaluation(evaluationReprise.remplaceeParId);
        const confirmer = confirm(
            'Cette évaluation est l\'ORIGINALE, remplacée par une reprise'
            + (noteRepriseLiee !== null ? ` (${noteRepriseLiee}%)` : '') + '.\n\n'
            + 'La restaurer supprimera la reprise.'
            + (nbFichiersLiesAnnonces
                ? ` Le ou les ${nbFichiersLiesAnnonces} fichier(s) remis pour la reprise iront à la corbeille (récupérables 30 jours).`
                : '')
            + ' Continuer ?'
        );
        if (!confirmer) return false;

        // #607 — capturer l'id AVANT le `delete` : sans cela, la lecture plus
        // bas rendait `undefined` et le fichier de la reprise restait actif.
        const idRepriseLiee = evaluationReprise.remplaceeParId;

        delete evaluationReprise.remplaceeParId;
        delete evaluationReprise.dateRemplacement;
        delete evaluationReprise.archivee;
        delete evaluationReprise.dateArchivage;
        if (indexRepriseLiee !== -1) {
            evaluations.splice(indexRepriseLiee, 1);
            // #607 — le fichier remis pour la reprise part avec elle (après l'écriture, #617).
            idFichiersACorbeille = idRepriseLiee;
        }
        messageSucces = 'Originale restaurée' + (indexRepriseLiee !== -1 ? ', reprise supprimée' : '');
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

        // #607 — annoncer le sort du fichier AVANT de le décider.
        const nbFichiersAnnonces = _compterFichiersDeEvaluation(evaluationId);
        const mentionFichiers = nbFichiersAnnonces
            ? `\n\nLe ou les ${nbFichiersAnnonces} fichier(s) remis pour la reprise iront à la corbeille (récupérables 30 jours).`
            : '';

        const confirmer = confirm(
            `Retirer le jeton de reprise ?\n\n` +
            `La reprise (${noteReprise}%) sera supprimée et l'originale (${noteOriginale}%) sera restaurée.` +
            mentionFichiers + `\n\n` +
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

        // #607 — le fichier importé pour la reprise part avec elle, sinon il
        // reste « le plus récent » et la ligne de l'originale l'ouvre (après l'écriture, #617).
        idFichiersACorbeille = evaluationId;
        messageSucces = 'Reprise supprimée, originale restaurée';
        idOriginaleARecharger = evaluationOriginale.id;
    } else {
        // Pas d'originale trouvée, juste nettoyer les propriétés
        delete evaluationReprise.repriseDeId;
        delete evaluationReprise.jetonRepriseApplique;
        delete evaluationReprise.dateApplicationJetonReprise;
    }
    }

    // Sauvegarder via sauvegarderDonneesSelonMode (bloque en mode anonymisation).
    // Refus (false, 'quota' ou 'error') → rien n'a bougé : ni succès annoncé, ni fichier déplacé.
    if (!_persisterEvaluationsJetons(evaluations, 'Retrait du jeton de reprise')) return false;

    // #607 — l'écriture a eu lieu : le détachement la suit sans point d'attente.
    const nbFichiersCorbeille = idFichiersACorbeille
        ? _detacherFichiersDeEvaluation(idFichiersACorbeille, 'corbeille') : 0;
    notifications.succes(messageSucces
        + (nbFichiersCorbeille ? ' — ' + nbFichiersCorbeille + ' fichier(s) de reprise mis à la corbeille' : ''));

    // Recharger l'originale
    if (idOriginaleARecharger && window.evaluationEnCours?.idModification === evaluationId) {
        setTimeout(() => {
            if (typeof modifierEvaluation === 'function') {
                modifierEvaluation(idOriginaleARecharger);
            }
        }, 500);
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
   JETON DE REPRISE CIBLÉE — PLUS D'APPLICATION (#563, 29 août 2026)
   =============================== */

// `appliquerJetonRepriseCiblee` et `nettoyerEvaluationsRepriseCiblee` sont
// RETIRÉES. La première n'avait qu'un appelant — la case « Reprise ciblée » du
// formulaire d'évaluation, retirée par décision de Grégoire (option C : « retirons
// la case et voyons à l'usage ») ; la seconde n'en avait aucun. Le TYPE reste
// connu de la configuration et de l'affichage (`jetonRepriseCibleeApplique` sur
// les évaluations déjà créées, badge, bilan, filtre de la liste) : ces données
// existent, on ne les efface pas. Ce qui n'existe plus, c'est le geste qui en
// crée de nouvelles.

/* ===============================
   EXPORTS
   =============================== */

// Exporter les fonctions vers window pour qu'elles soient accessibles globalement
window.obtenirConfigJetons = obtenirConfigJetons;
window.jetonsDeclares = jetonsDeclares;   // #941 lot S3 (D5)
window.obtenirConfigJetonsPratique = obtenirConfigJetonsPratique;  // #328 L2-c (réutilisé par les lecteurs migrés)
window.compterJetonsUtilises = compterJetonsUtilises;
window.verifierDisponibiliteJeton = verifierDisponibiliteJeton;
window.appliquerJetonDelai = appliquerJetonDelai;
window.retirerJetonDelai = retirerJetonDelai;
window.appliquerJetonReprise = appliquerJetonReprise;
window.retirerJetonReprise = retirerJetonReprise;

// Jetons personnalisés
window.obtenirTousTypesJetons = obtenirTousTypesJetons;
window.obtenirStatutJetonsEtudiant = obtenirStatutJetonsEtudiant;
window.attribuerJetonPersonnalise = attribuerJetonPersonnalise;
window.retirerJetonPersonnalise = retirerJetonPersonnalise;

// #612 (T6.6) — le trou de #607 avait une seconde porte : `supprimerEvaluation`
// (`js/liste-evaluations.js`), qui restaure l'originale d'une reprise depuis la
// LISTE sans toucher au fichier. Le geste est le même, il ne doit pas être
// réécrit là-bas — une seconde définition finirait par diverger (#557).
// Les deux IIFE ne se voient que par `window` : le souligné dit « pas une API ».
window._detacherFichiersDeEvaluation = _detacherFichiersDeEvaluation;
window._compterFichiersDeEvaluation = _compterFichiersDeEvaluation;



})();
