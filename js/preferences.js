/**
 * preferences.js — API centralisée pour les préférences utilisateur
 *
 * Source de vérité unique pour les préférences globales de l'application.
 * Regroupe ce qui était dispersé dans deux emplacements :
 *   - 5 champs de modalitesEvaluation (RàI, SOLO, grille, découpler P/R, fenêtre patterns)
 *   - tout preferencesAffichage (patterns on/off, snapshots, graphiques, chrono, animations,
 *     tour guidé, aide contextuelle, mode clair, tooltips, mode expert, etc.)
 *
 * IMPORTANT : deux objets historiques NE SONT PAS absorbés.
 *
 * 1. `modalitesEvaluation` contient aussi la configuration de la pratique de
 *    notation active (pratique, specifications, parObjectifs, categories, etc.)
 *    et des paramètres d'horaire (dureePeriodeMinutes). Ces champs restent
 *    dans modalitesEvaluation — ce ne sont pas des préférences utilisateur.
 *
 * 2. `seuilsInterpretation` contient une structure mixte : quelques seuils
 *    ajustables par l'utilisateur (fragile, acceptable, bon, progression,
 *    risque, défi), mais aussi une hiérarchie de constantes (idme.*, risque.*,
 *    interpretation.*, nombreProductionsAnalyse) lues en bloc par plusieurs
 *    modules via chargerSeuilsInterpretation(). Le refondre proprement demande
 *    un chantier dédié — laissé pour plus tard.
 *
 * API publique :
 *   obtenirPreference(cle)              → valeur (ou défaut si non définie)
 *   definirPreference(cle, valeur)      → écrit + notifie les abonnés
 *   abonnerPreference(cle, callback)    → callback(nouvelleValeur) sur changement
 *   desabonnerPreference(cle, callback) → retire l'abonnement
 *   obtenirToutesPreferences()          → copie de l'objet complet
 *   migrerPreferencesV3()               → migration one-shot depuis les 3 anciens objets
 *
 * Le stockage est un détail d'implémentation : une seule clé IDB/localStorage
 * `preferencesUtilisateur`. Les modules consomment l'API, jamais le stockage.
 */

(function() {
    'use strict';

    // =========================================================================
    // CONSTANTES
    // =========================================================================

    const CLE_STOCKAGE = 'preferencesUtilisateur';
    const CLE_FLAG_MIGRATION = 'migrationPrefs_v3_done';

    /**
     * Valeurs par défaut pour chaque préférence.
     * Utilisées si la clé n'existe pas dans le stockage.
     */
    const DEFAUTS = {
        // --- Observation ---
        afficherDescriptionsSOLO: true,
        activerActionsRLO: false,

        // --- Dépistage (RàI) ---
        activerRai: true,
        grilleReferenceDepistage: '',
        decouplerPR: false,
        fenetrePatterns: 3,

        // --- Affichage ---
        depistageAcp: true,
        afficherSnapshots: true,
        afficherGraphiques: true,
        afficherSeuilsVisuels: true,
        afficherDetailsTechniques: false,
        afficherContexteGraphiques: true,
        uniteAffichageAssiduite: 'periodes',
        animationPoints: true,
        chronoEvaluation: false,
        sisDefaut: 'lea',
        modeExpert: false,
        tourGuide: false,
        aideContextuelle: true,
        modeClair: false,
        tooltips: true
    };

    // Abonnés : { cle: [callback, callback, ...] }
    const abonnes = {};

    // =========================================================================
    // API DE LECTURE / ÉCRITURE
    // =========================================================================

    /**
     * Obtient la valeur d'une préférence.
     * Retourne le défaut si la clé n'est pas définie dans le stockage.
     * @param {string} cle - Nom canonique de la préférence
     * @returns {*} Valeur stockée ou défaut
     */
    function obtenirPreference(cle) {
        if (!(cle in DEFAUTS)) {
            console.warn('[preferences] Clé inconnue :', cle);
        }
        const prefs = lireStockage();
        return cle in prefs ? prefs[cle] : DEFAUTS[cle];
    }

    /**
     * Définit la valeur d'une préférence et notifie les abonnés.
     * @param {string} cle - Nom canonique de la préférence
     * @param {*} valeur - Nouvelle valeur
     */
    function definirPreference(cle, valeur) {
        if (!(cle in DEFAUTS)) {
            console.warn('[preferences] Écriture clé inconnue :', cle);
        }
        const prefs = lireStockage();
        const ancienne = prefs[cle];
        prefs[cle] = valeur;
        ecrireStockage(prefs);
        if (ancienne !== valeur) {
            notifierAbonnes(cle, valeur);
        }
    }

    /**
     * Retourne une copie de toutes les préférences (valeurs stockées + défauts).
     * @returns {Object}
     */
    function obtenirToutesPreferences() {
        const prefs = lireStockage();
        const complet = {};
        for (const k in DEFAUTS) {
            complet[k] = k in prefs ? prefs[k] : DEFAUTS[k];
        }
        return complet;
    }

    // =========================================================================
    // ABONNEMENTS (pattern observer)
    // =========================================================================

    /**
     * S'abonne aux changements d'une préférence.
     * Le callback reçoit la nouvelle valeur.
     * @param {string} cle
     * @param {Function} callback
     */
    function abonnerPreference(cle, callback) {
        if (typeof callback !== 'function') return;
        if (!abonnes[cle]) abonnes[cle] = [];
        abonnes[cle].push(callback);
    }

    /**
     * Retire un abonnement.
     * @param {string} cle
     * @param {Function} callback
     */
    function desabonnerPreference(cle, callback) {
        if (!abonnes[cle]) return;
        abonnes[cle] = abonnes[cle].filter(cb => cb !== callback);
    }

    function notifierAbonnes(cle, valeur) {
        if (!abonnes[cle]) return;
        for (const cb of abonnes[cle]) {
            try {
                cb(valeur);
            } catch (e) {
                console.error('[preferences] Erreur dans abonné pour', cle, e);
            }
        }
    }

    // =========================================================================
    // STOCKAGE (interne)
    // =========================================================================

    function lireStockage() {
        try {
            return db.getSync(CLE_STOCKAGE, {}) || {};
        } catch (e) {
            console.error('[preferences] Erreur lecture stockage :', e);
            return {};
        }
    }

    function ecrireStockage(prefs) {
        try {
            db.setSync(CLE_STOCKAGE, prefs);
        } catch (e) {
            console.error('[preferences] Erreur écriture stockage :', e);
        }
    }

    // =========================================================================
    // MIGRATION V3 — Fusion des 3 anciens objets
    // =========================================================================

    /**
     * Table de correspondance : anciens emplacements → noms canoniques.
     * Chaque entrée décrit où lire la valeur dans l'ancien système.
     */
    const MIGRATION_MAP = [
        // Depuis modalitesEvaluation — UNIQUEMENT les 5 champs qui sont des préférences
        // utilisateur. Le reste (pratique, specifications, parObjectifs, categories,
        // dureePeriodeMinutes, afficherSommatif, afficherAlternatif) reste dans
        // modalitesEvaluation car ce sont des paramètres de la pratique active,
        // pas des préférences utilisateur.
        { source: 'modalitesEvaluation', champ: 'afficherDescriptionsSOLO', cible: 'afficherDescriptionsSOLO' },
        { source: 'modalitesEvaluation', champ: 'activerRai',               cible: 'activerRai' },
        { source: 'modalitesEvaluation', champ: 'grilleReferenceDepistage', cible: 'grilleReferenceDepistage' },
        { source: 'modalitesEvaluation', champ: 'decouplerPR',              cible: 'decouplerPR' },
        { source: 'modalitesEvaluation', champ: 'fenetrePatterns',          cible: 'fenetrePatterns' },

        // Depuis preferencesAffichage
        { source: 'preferencesAffichage', champ: 'depistageAcp',                cible: 'depistageAcp' },
        { source: 'preferencesAffichage', champ: 'afficherSnapshots',           cible: 'afficherSnapshots' },
        { source: 'preferencesAffichage', champ: 'afficherGraphiques',          cible: 'afficherGraphiques' },
        { source: 'preferencesAffichage', champ: 'afficherSeuilsVisuels',       cible: 'afficherSeuilsVisuels' },
        { source: 'preferencesAffichage', champ: 'afficherDetailsTechniques',   cible: 'afficherDetailsTechniques' },
        { source: 'preferencesAffichage', champ: 'afficherContexteGraphiques',  cible: 'afficherContexteGraphiques' },
        { source: 'preferencesAffichage', champ: 'uniteAffichageAssiduite',     cible: 'uniteAffichageAssiduite' },
        { source: 'preferencesAffichage', champ: 'animationPoints',             cible: 'animationPoints' },
        { source: 'preferencesAffichage', champ: 'chronoEvaluation',            cible: 'chronoEvaluation' },
        { source: 'preferencesAffichage', champ: 'sisDefaut',                   cible: 'sisDefaut' },
        { source: 'preferencesAffichage', champ: 'modeExpert',                  cible: 'modeExpert' },
        { source: 'preferencesAffichage', champ: 'tourGuide',                   cible: 'tourGuide' },
        { source: 'preferencesAffichage', champ: 'aideContextuelle',            cible: 'aideContextuelle' },
        { source: 'preferencesAffichage', champ: 'modeClair',                   cible: 'modeClair' },
        { source: 'preferencesAffichage', champ: 'tooltips',                    cible: 'tooltips' }

        // seuilsInterpretation NON migré : structure mixte (plats + imbriqués)
        // consommée en bloc par chargerSeuilsInterpretation(). Voir en-tête.
    ];

    /**
     * Migre les 3 anciens objets vers `preferencesUtilisateur`.
     * Idempotente : protégée par le flag `migrationPrefs_v3_done`.
     *
     * Nettoie aussi les emplacements legacy (5 champs dans modalitesEvaluation,
     * clé preferencesAffichage entière) une fois la migration confirmée. Le
     * nettoyage s'exécute à chaque démarrage — idempotent et robuste face aux
     * réintroductions par import ou sortie de démo.
     *
     * @returns {Object} Rapport de migration { effectuee, champsMigres, erreurs }
     */
    function migrerPreferencesV3() {
        const rapport = { effectuee: false, champsMigres: 0, erreurs: [] };

        try {
            if (db.getSync(CLE_FLAG_MIGRATION, false) !== true) {
                // Lire les 3 anciennes sources
                const sources = {
                    modalitesEvaluation: safeGet('modalitesEvaluation'),
                    preferencesAffichage: safeGet('preferencesAffichage'),
                    seuilsInterpretation: safeGet('seuilsInterpretation')
                };

                // Partir de l'objet existant (peut être vide ou partiel)
                const prefs = lireStockage();

                for (const entree of MIGRATION_MAP) {
                    const source = sources[entree.source];
                    if (!source || !(entree.champ in source)) continue;

                    const valeur = source[entree.champ];
                    // Ne pas écraser une valeur déjà migrée (migration idempotente par design,
                    // mais aussi : si l'utilisateur a modifié après une migration partielle)
                    if (entree.cible in prefs) continue;

                    prefs[entree.cible] = valeur;
                    rapport.champsMigres++;
                }

                ecrireStockage(prefs);
                db.setSync(CLE_FLAG_MIGRATION, true);
                rapport.effectuee = true;

                console.warn('[preferences] Migration V3 effectuée. Champs migrés :', rapport.champsMigres);
            }

            // Nettoyage des emplacements legacy — ne s'exécute qu'après migration confirmée
            // (les anciennes sources ne sont plus nécessaires). Idempotent.
            nettoyerLegacy();
        } catch (e) {
            rapport.erreurs.push(e.message);
            console.error('[preferences] Erreur pendant la migration V3 :', e);
        }

        return rapport;
    }

    /**
     * Supprime les emplacements legacy que la migration a absorbés :
     *   - les 5 champs de modalitesEvaluation qui sont devenus des préférences ;
     *   - la clé preferencesAffichage dans son ensemble.
     * Idempotent : aucune écriture si rien à nettoyer, pas d'effet si la clé
     * n'existe pas. Appelée à chaque démarrage (après garantie que la migration
     * a eu lieu) pour résister aux réintroductions (import de données anciennes,
     * restauration post-démo).
     */
    function nettoyerLegacy() {
        const CHAMPS_LEGACY_MODALITES = [
            'afficherDescriptionsSOLO',
            'activerRai',
            'grilleReferenceDepistage',
            'decouplerPR',
            'fenetrePatterns'
        ];

        try {
            const modalites = db.getSync('modalitesEvaluation', null);
            if (modalites && typeof modalites === 'object') {
                let modifie = false;
                for (const champ of CHAMPS_LEGACY_MODALITES) {
                    if (champ in modalites) {
                        delete modalites[champ];
                        modifie = true;
                    }
                }
                if (modifie) {
                    db.setSync('modalitesEvaluation', modalites);
                }
            }

            // Suppression de la clé entière (no-op si déjà absente)
            db.removeSync('preferencesAffichage');
        } catch (e) {
            console.error('[preferences] Erreur pendant le nettoyage legacy :', e);
        }
    }

    function safeGet(cle) {
        try {
            return db.getSync(cle, {}) || {};
        } catch (e) {
            return {};
        }
    }

    // =========================================================================
    // INTROSPECTION (utile pour debug et validation)
    // =========================================================================

    function obtenirDefauts() {
        return Object.assign({}, DEFAUTS);
    }

    function listerClesConnues() {
        return Object.keys(DEFAUTS);
    }

    // =========================================================================
    // EXPORTS GLOBAUX
    // =========================================================================

    window.obtenirPreference = obtenirPreference;
    window.definirPreference = definirPreference;
    window.obtenirToutesPreferences = obtenirToutesPreferences;
    window.abonnerPreference = abonnerPreference;
    window.desabonnerPreference = desabonnerPreference;
    window.migrerPreferencesV3 = migrerPreferencesV3;
    window.obtenirDefautsPreferences = obtenirDefauts;
    window.listerClesPreferencesConnues = listerClesConnues;

    // =========================================================================
    // AUTO-INITIALISATION : migration au démarrage
    // =========================================================================

    function lancerMigrationAuDemarrage() {
        if (typeof db !== 'undefined' && db.isReady) {
            migrerPreferencesV3();
        } else {
            document.addEventListener('db-ready', migrerPreferencesV3);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', lancerMigrationAuDemarrage);
    } else {
        lancerMigrationAuDemarrage();
    }

})();
