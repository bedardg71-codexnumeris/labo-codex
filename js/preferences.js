/**
 * preferences.js — API centralisée pour les préférences utilisateur
 *
 * Source de vérité unique pour toutes les préférences globales de l'application.
 * Remplace la fragmentation historique en trois objets :
 *   - modalitesEvaluation (RàI, SOLO, grille, découpler P/R, fenêtre patterns, pratique)
 *   - preferencesAffichage (patterns on/off, snapshots, graphiques, chrono, animations)
 *   - seuilsInterpretation (seuils fragile/acceptable/bon, progression, risque, défi)
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
        activerPatterns: true,
        grilleReferenceDepistage: '',
        decouplerPR: false,
        fenetrePatterns: 3,

        // --- Seuils de détection ---
        seuilProgressionArtefacts: 0.10,
        seuilDirectionRisque: 0.05,
        seuilDefiSpecifique: 0.70,

        // --- Seuils d'interprétation ---
        seuilFragile: 0.70,
        seuilAcceptable: 0.80,
        seuilBon: 0.85,

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

        // --- Pratique de notation ---
        pratique: 'alternative',
        afficherSommatif: false,
        afficherAlternatif: true
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
        // Depuis modalitesEvaluation
        { source: 'modalitesEvaluation', champ: 'afficherDescriptionsSOLO', cible: 'afficherDescriptionsSOLO' },
        { source: 'modalitesEvaluation', champ: 'activerRai',               cible: 'activerRai' },
        { source: 'modalitesEvaluation', champ: 'grilleReferenceDepistage', cible: 'grilleReferenceDepistage' },
        { source: 'modalitesEvaluation', champ: 'decouplerPR',              cible: 'decouplerPR' },
        { source: 'modalitesEvaluation', champ: 'fenetrePatterns',          cible: 'fenetrePatterns' },
        { source: 'modalitesEvaluation', champ: 'pratique',                 cible: 'pratique' },
        { source: 'modalitesEvaluation', champ: 'afficherSommatif',         cible: 'afficherSommatif' },
        { source: 'modalitesEvaluation', champ: 'afficherAlternatif',       cible: 'afficherAlternatif' },

        // Depuis preferencesAffichage
        { source: 'preferencesAffichage', champ: 'depistageAcp',                cible: 'depistageAcp' },
        { source: 'preferencesAffichage', champ: 'patterns',                    cible: 'activerPatterns' },
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

        // Depuis seuilsInterpretation (préfixe uniformisé)
        { source: 'seuilsInterpretation', champ: 'fragile',              cible: 'seuilFragile' },
        { source: 'seuilsInterpretation', champ: 'acceptable',           cible: 'seuilAcceptable' },
        { source: 'seuilsInterpretation', champ: 'bon',                  cible: 'seuilBon' },
        { source: 'seuilsInterpretation', champ: 'progressionArtefacts', cible: 'seuilProgressionArtefacts' },
        { source: 'seuilsInterpretation', champ: 'directionRisque',      cible: 'seuilDirectionRisque' },
        { source: 'seuilsInterpretation', champ: 'defiSpecifique',       cible: 'seuilDefiSpecifique' }
    ];

    /**
     * Migre les 3 anciens objets vers `preferencesUtilisateur`.
     * Idempotente : protégée par le flag `migrationPrefs_v3_done`.
     * Ne supprime PAS les anciens objets (suppression différée au commit 1.5,
     * une fois que toutes les lectures/écritures passent par l'API).
     *
     * @returns {Object} Rapport de migration { effectuee, champsMigres, erreurs }
     */
    function migrerPreferencesV3() {
        const rapport = { effectuee: false, champsMigres: 0, erreurs: [] };

        try {
            if (db.getSync(CLE_FLAG_MIGRATION, false) === true) {
                return rapport;
            }

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
        } catch (e) {
            rapport.erreurs.push(e.message);
            console.error('[preferences] Erreur pendant la migration V3 :', e);
        }

        return rapport;
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

})();
