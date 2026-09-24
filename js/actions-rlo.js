/**
 * actions-rlo.js — Profil ACO (Repérage / Liaison / Ouverture)
 *
 * Agrège les décomptes des tampons `action-*` posés sur l'annotation d'un
 * fichier d'évaluation, pour produire un profil structuré inscrit dans
 * l'objet évaluation au moment de la sauvegarde.
 *
 * Source des décomptes : annotation du fichier résolu pour l'évaluation,
 * via la chaîne Évaluation → Fichier (travauxResolution) → Annotation
 * (travauxStockage) → comptage par autocollantId (travauxExportPDF).
 *
 * Les tampons legacy (qualité, diagnostic) sont ignorés — seuls les IDs
 * `action-*` alimentent le profil ACO.
 *
 * API publique : window.actionsRLO = { agregerActionsRLO }
 *   - Pure : aucune dépendance à l'UI ou à une vue active
 *   - Le toggle `activerActionsRLO` est vérifié au site d'appel, pas ici,
 *     pour permettre la réutilisation par la migration rétroactive.
 */

(function() {
    'use strict';

    /**
     * Mapping IDs internes → clés de sortie du profil ACO.
     * Les noms de sortie (reperage/liaison/ouverture/...) sont la convention
     * stable utilisée par l'export anonymisé et la visualisation.
     */
    const MAPPING_RLO = {
        'action-reperage':  'reperage',
        'action-liaison':   'liaison',
        'action-ouverture': 'ouverture',
        'action-incertain': 'incertain',
        'action-incomplet': 'incomplet',
        'action-inexact':   'inexact'
    };

    /**
     * Agrège les décomptes RLO depuis l'annotation d'un fichier d'évaluation.
     *
     * @param {Object} evaluation - Au minimum { etudiantDA, productionId }
     * @returns {Object|null}
     *   { reperage, liaison, ouverture, incertain, incomplet, inexact, total }
     *   OU null si aucun fichier ou aucune annotation n'est résolu.
     *
     *   - null         = pas de données (pas d'annotation)
     *   - tous à zéro  = annotation présente mais aucun tampon `action-*`
     */
    function agregerActionsRLO(evaluation) {
        if (!evaluation || !evaluation.etudiantDA || !evaluation.productionId) {
            return null;
        }
        if (typeof travauxResolution === 'undefined' ||
            typeof travauxStockage === 'undefined' ||
            typeof travauxExportPDF === 'undefined' ||
            typeof travauxExportPDF.compterAnnotationsDetailees !== 'function') {
            return null;
        }

        const fichier = travauxResolution.trouverFichierPourEvaluation(evaluation);
        if (!fichier) return null;

        const annotation = travauxStockage.obtenirAnnotationFichier(fichier.id);
        if (!annotation) return null;

        const stats = travauxExportPDF.compterAnnotationsDetailees(annotation);
        if (!stats || !stats.tampons) return null;

        const profil = {
            reperage: 0, liaison: 0, ouverture: 0,
            incertain: 0, incomplet: 0, inexact: 0,
            total: 0
        };
        for (const id in stats.tampons) {
            const cle = MAPPING_RLO[id];
            if (cle) {
                const n = stats.tampons[id] || 0;
                profil[cle] += n;
                profil.total += n;
            }
        }
        return profil;
    }

    // =========================================================================
    // MIGRATION RÉTROACTIVE — Étape 7 (avril 2026)
    // =========================================================================
    // Enrichit les évaluations historiques avec le champ `actionsRLO` pour
    // éliminer la dualité « avant / après activation du toggle ». Permet à
    // l'étape 9 (export recherche) de lire le champ sans branche de recalcul.
    //
    // Règles :
    //   - Conditionnée au toggle `activerActionsRLO` : si désactivé, rien ne
    //     bouge (pas même le flag d'idempotence). L'utilisateur n'a pas opté.
    //   - Idempotente : flag localStorage `migrationRLO_evals_v1_done`
    //     namespacé par trimestre (chaque semestre migre une fois).
    //   - Ne touche QUE les évaluations sans champ `actionsRLO` : les nouvelles
    //     évaluations inscrites à la sauvegarde (étape 6) sont préservées.
    //   - Distingue « pas de données » (null) de « zéro geste » (compteurs à 0) :
    //     `agregerActionsRLO` renvoie l'une ou l'autre valeur selon l'annotation.
    //   - S'exécute au démarrage, APRÈS `migrerIdsActionsRLO` (chaîne de
    //     migration) — garantie par l'ordre de chargement (actions-rlo.js est
    //     chargé après travaux-outils.js) et l'ordre d'enregistrement des
    //     listeners `db-ready`.

    function migrerActionsRLOEvaluations() {
        try {
            if (typeof obtenirPreference !== 'function' ||
                obtenirPreference('activerActionsRLO') !== true) {
                return;
            }
            if (typeof db === 'undefined' || typeof window.cle !== 'function') return;

            var cleFlag = window.cle('migrationRLO_evals_v1_done');
            if (db.getSync(cleFlag, false) === true) return;

            var cleEvals = window.cle('evaluationsSauvegardees');
            var evaluations = db.getSync(cleEvals, []);
            if (!Array.isArray(evaluations) || evaluations.length === 0) {
                db.setSync(cleFlag, true);
                return;
            }

            var enrichies = 0;
            var avecProfil = 0;
            for (var i = 0; i < evaluations.length; i++) {
                var ev = evaluations[i];
                if (!ev || typeof ev !== 'object') continue;
                if ('actionsRLO' in ev) continue;
                var profil = agregerActionsRLO(ev);
                ev.actionsRLO = profil;
                enrichies++;
                if (profil && profil.total > 0) avecProfil++;
            }

            if (enrichies > 0) db.setSync(cleEvals, evaluations);
            db.setSync(cleFlag, true);
            console.warn('[actions-rlo] Migration rétroactive effectuée. Évaluations enrichies : '
                + enrichies + ' (dont ' + avecProfil + ' avec au moins un tampon `action-*`)');
        } catch (e) {
            console.error('[actions-rlo] Erreur pendant la migration rétroactive :', e);
        }
    }

    /**
     * Agrège le profil ACO cumulé d'un étudiant sur toutes ses évaluations.
     *
     * Étape 8 — visualisation in-app dans « Développement des habiletés ».
     * Lecture LIVE : appelle `agregerActionsRLO(ev)` sur chaque évaluation
     * pour recompter les tampons depuis l'annotation actuelle. Évite le
     * décalage entre les tampons posés et le snapshot `actionsRLO` stocké
     * (qui n'est rafraîchi qu'au Sauvegarder). Fallback sur le snapshot
     * si la résolution live échoue (fichier introuvable, annotation
     * supprimée, etc.).
     *
     * @param {string} da
     * @returns {Object|null}
     *   {
     *     reperage, liaison, ouverture,              // gestes cognitifs
     *     incertain, incomplet, inexact,             // gestes en difficulté
     *     totalCognitifs, totalDifficultes, total,
     *     nbEvaluations,          // évaluations actives du DA
     *     nbEvaluationsObservees  // celles avec actionsRLO résolu
     *   }
     *   null si toggle désactivé OU aucune évaluation du tout pour ce DA.
     *   Si toggle ON mais 0 annotation, renvoie un objet à compteurs nuls
     *   pour permettre un état vide informatif dans l'UI.
     */
    function agregerProfilRLOEtudiant(da) {
        if (!da) return null;
        if (typeof obtenirPreference !== 'function' ||
            obtenirPreference('activerActionsRLO') !== true) return null;
        if (typeof obtenirDonneesSelonMode !== 'function') return null;

        var evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        var evalsDA = evaluations.filter(function(e) {
            return e && e.etudiantDA === da && !e.remplaceeParId;
        });
        if (evalsDA.length === 0) return null;

        var acc = {
            reperage: 0, liaison: 0, ouverture: 0,
            incertain: 0, incomplet: 0, inexact: 0,
            totalCognitifs: 0, totalDifficultes: 0, total: 0,
            nbEvaluations: evalsDA.length,
            nbEvaluationsObservees: 0
        };
        for (var i = 0; i < evalsDA.length; i++) {
            var p = agregerActionsRLO(evalsDA[i]);
            if (!p) p = evalsDA[i].actionsRLO;
            if (!p) continue;
            acc.nbEvaluationsObservees++;
            acc.reperage  += p.reperage  || 0;
            acc.liaison   += p.liaison   || 0;
            acc.ouverture += p.ouverture || 0;
            acc.incertain += p.incertain || 0;
            acc.incomplet += p.incomplet || 0;
            acc.inexact   += p.inexact   || 0;
        }
        acc.totalCognitifs  = acc.reperage + acc.liaison + acc.ouverture;
        acc.totalDifficultes = acc.incertain + acc.incomplet + acc.inexact;
        acc.total = acc.totalCognitifs + acc.totalDifficultes;
        return acc;
    }

    /**
     * Série chronologique du profil ACO pour le graphique d'évolution.
     *
     * Étape 9 — visualisation in-app dans « Développement des habiletés ».
     * Parcourt les évaluations du DA ordonnées par date d'évaluation, calcule
     * les ratios cognitifs pour chaque artefact et marque les trous (artefact
     * sans annotation RLO) pour rendu en ligne pointillée.
     *
     * @param {string} da
     * @returns {Object|null}
     *   {
     *     artefacts: [{
     *       idProduction,
     *       numero,              // ordre chronologique (1-based)
     *       titre,               // titre court de la production
     *       dateEvaluation,      // ISO
     *       niveauFinal,         // I|D|M|E ou null
     *       observe,             // true si actionsRLO non null (annotation existe)
     *       ratios: { reperage, liaison, ouverture } | null   // % sur totalCognitifs
     *     }, ...],
     *     nbObserves              // nb d'évaluations avec tampons action-* > 0
     *   }
     *   null si toggle désactivé OU aucune évaluation.
     */
    function obtenirEvolutionRLOEtudiant(da) {
        if (!da) return null;
        if (typeof obtenirPreference !== 'function' ||
            obtenirPreference('activerActionsRLO') !== true) return null;
        if (typeof obtenirDonneesSelonMode !== 'function') return null;

        var evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        var productions = obtenirDonneesSelonMode('productions') || [];
        var evalsDA = evaluations.filter(function(e) {
            return e && e.etudiantDA === da && !e.remplaceeParId;
        });
        if (evalsDA.length === 0) return null;

        // Ordre chronologique par date d'évaluation (fallback sur date d'échéance)
        evalsDA.sort(function(a, b) {
            var da1 = (a.dateEvaluation || '') + '';
            var db1 = (b.dateEvaluation || '') + '';
            return da1.localeCompare(db1);
        });

        var arrondir = function(v) { return Math.round(v * 10) / 10; };
        var nbObserves = 0;
        var artefacts = evalsDA.map(function(ev, idx) {
            var prod = productions.find(function(p) { return p.id === ev.productionId; }) || {};
            // Priorité à la lecture LIVE (même pattern que agregerProfilRLOEtudiant) :
            // recompte les tampons actuels depuis l'annotation, et retombe sur le
            // snapshot stocké si la résolution live échoue. Évite l'incohérence
            // avec le bloc cumulatif quand des tampons ont été posés après la
            // dernière sauvegarde d'évaluation.
            var rlo = agregerActionsRLO(ev);
            if (!rlo) rlo = ev.actionsRLO;
            var observe = rlo !== null && rlo !== undefined;
            var ratios = null;
            if (observe) {
                var totalCog = (rlo.reperage || 0) + (rlo.liaison || 0) + (rlo.ouverture || 0);
                if (totalCog > 0) {
                    ratios = {
                        reperage:  arrondir(((rlo.reperage  || 0) / totalCog) * 100),
                        liaison:   arrondir(((rlo.liaison   || 0) / totalCog) * 100),
                        ouverture: arrondir(((rlo.ouverture || 0) / totalCog) * 100)
                    };
                    nbObserves++;
                }
            }
            return {
                idProduction: ev.productionId,
                numero: idx + 1,
                titre: prod.titre || prod.nom || ('Artefact ' + (idx + 1)),
                dateEvaluation: ev.dateEvaluation || null,
                niveauFinal: ((typeof niveauFinalAffichable === 'function') ? (niveauFinalAffichable(ev) || null) : (ev.niveauFinal || null)),   // #941 lot S1 — aucun niveau pour une copie en points
                observe: observe,
                ratios: ratios
            };
        });

        return { artefacts: artefacts, nbObserves: nbObserves };
    }

    window.actionsRLO = {
        agregerActionsRLO,
        migrerActionsRLOEvaluations,
        agregerProfilRLOEtudiant,
        obtenirEvolutionRLOEtudiant
    };

    // Hook de démarrage : attendre db-ready. Cet écouteur est enregistré APRÈS
    // celui de `migrerIdsActionsRLO` (travaux-outils.js), donc s'exécute après
    // la migration des IDs. Le portillon préserve cet ordre : que la DB soit
    // déjà prête (exécution immédiate, dans l'ordre de parse des scripts) ou
    // non (écouteurs déclenchés dans l'ordre d'enregistrement), travaux-outils.js
    // étant chargé avant actions-rlo.js dans index.html.
    //
    // ⚠ #414 (8 août 2026) : la garde était `db.ready`, qui passe à vrai à la
    // fin d'`init()` — donc AVANT `syncToLocalStorageCache()`. Sur ce créneau,
    // la migration lisait un `memoryCache` non hydraté, écrivait des évaluations
    // à partir de données incomplètes, puis posait son drapeau d'idempotence :
    // le travail manquant n'aurait jamais été repris. `auDbPret` s'appuie sur
    // `window.dbReady`, le seul drapeau qui signifie « les données sont lisibles ».
    window.auDbPret(migrerActionsRLOEvaluations);
})();
