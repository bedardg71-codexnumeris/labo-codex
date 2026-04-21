/**
 * MIGRATION AUTOMATIQUE - Système de pratiques de notation
 *
 * Ce module migre automatiquement les anciennes configurations vers les nouveaux IDs.
 *
 * CHANGEMENTS BETA 90:
 * - "alternative" → "pan-maitrise"
 * - "sommative" reste "sommative" (pas de changement)
 *
 * Ce script s'exécute automatiquement au chargement de l'application.
 *
 * VERSION : 1.0
 * DATE : 11 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

(function() {
    'use strict';


    // ============================================================================
    // CONSTANTES DE MIGRATION
    // ============================================================================

    const MIGRATIONS = {
        'alternative': 'pan-maitrise',  // Beta 89 → Beta 90
        // Ajouter d'autres migrations futures ici
    };

    const CLE_MIGRATION_EFFECTUEE = 'migrationPratiquesBeta90Effectuee';

    // ============================================================================
    // FONCTION DE MIGRATION
    // ============================================================================

    /**
     * Migre automatiquement les anciennes configurations de pratiques
     *
     * @returns {boolean} true si une migration a été effectuée
     */
    function migrerConfigurationPratiques() {
        // Vérifier si la migration a déjà été effectuée
        const dejaEffectuee = db.getSync(CLE_MIGRATION_EFFECTUEE, null);
        if (dejaEffectuee === 'true') {
            return false;
        }

        // Lire la configuration actuelle (db.getSync retourne déjà un objet parsé)
        const config = db.getSync('modalitesEvaluation', null);
        if (!config) {
            db.setSync(CLE_MIGRATION_EFFECTUEE, 'true');
            return false;
        }

        // Vérifier si une migration est nécessaire
        const ancienId = config.pratique;
        const nouveauId = MIGRATIONS[ancienId];

        if (!nouveauId) {
            // Pas de migration nécessaire
            db.setSync(CLE_MIGRATION_EFFECTUEE, 'true');
            return false;
        }

        // Effectuer la migration

        config.pratique = nouveauId;

        // Sauvegarder la nouvelle configuration
        try {
            db.setSync('modalitesEvaluation', config);
            db.setSync(CLE_MIGRATION_EFFECTUEE, 'true');


            // Invalider le cache si la fonction existe
            if (typeof window.invaliderCachePratique === 'function') {
                window.invaliderCachePratique();
            }

            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde de la migration:', error);
            return false;
        }
    }

    // ============================================================================
    // FONCTION DE VÉRIFICATION POST-MIGRATION
    // ============================================================================

    /**
     * Vérifie que la migration a bien fonctionné
     * Affiche des messages informatifs dans la console
     */
    function verifierMigration() {
        const config = db.getSync('modalitesEvaluation', {});
        const pratiqueActive = config.pratique;

        if (!pratiqueActive) {
            // Fraîche installation — aucune pratique à vérifier. Silent.
            return;
        }


        // Vérifier si la pratique existe dans le registre
        // (le registre n'est pas encore chargé à ce stade, donc on ne peut pas vérifier)
        // Cette vérification sera faite par obtenirPratiqueActive() plus tard
    }

    // ============================================================================
    // EXÉCUTION AUTOMATIQUE
    // ============================================================================

    try {
        const migrationEffectuee = migrerConfigurationPratiques();

        if (migrationEffectuee) {
        }

        verifierMigration();
    } catch (error) {
        console.error('❌ Erreur lors de la migration automatique:', error);
    }

    // ============================================================================
    // FONCTION DE RESET MIGRATION (pour tests)
    // ============================================================================

    /**
     * Réinitialise le flag de migration (pour tests uniquement)
     * ⚠️ NE PAS UTILISER EN PRODUCTION
     */
    window.resetMigrationPratiques = function() {
        db.removeSync(CLE_MIGRATION_EFFECTUEE);
    };

})();
