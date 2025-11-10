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

    console.log('🔄 Vérification des migrations de pratiques...');

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
        const dejaEffectuee = localStorage.getItem(CLE_MIGRATION_EFFECTUEE);
        if (dejaEffectuee === 'true') {
            console.log('✅ Migration déjà effectuée (Beta 90)');
            return false;
        }

        // Lire la configuration actuelle
        const modalitesJSON = localStorage.getItem('modalitesEvaluation');
        if (!modalitesJSON) {
            console.log('ℹ️ Aucune configuration à migrer');
            localStorage.setItem(CLE_MIGRATION_EFFECTUEE, 'true');
            return false;
        }

        let config;
        try {
            config = JSON.parse(modalitesJSON);
        } catch (error) {
            console.error('❌ Erreur de lecture de la configuration:', error);
            return false;
        }

        // Vérifier si une migration est nécessaire
        const ancienId = config.pratique;
        const nouveauId = MIGRATIONS[ancienId];

        if (!nouveauId) {
            // Pas de migration nécessaire
            console.log(`ℹ️ Configuration actuelle ("${ancienId}") déjà à jour`);
            localStorage.setItem(CLE_MIGRATION_EFFECTUEE, 'true');
            return false;
        }

        // Effectuer la migration
        console.log(`🔄 Migration détectée: "${ancienId}" → "${nouveauId}"`);

        config.pratique = nouveauId;

        // Sauvegarder la nouvelle configuration
        try {
            localStorage.setItem('modalitesEvaluation', JSON.stringify(config));
            localStorage.setItem(CLE_MIGRATION_EFFECTUEE, 'true');

            console.log(`✅ Migration effectuée avec succès`);
            console.log(`   Ancienne pratique: "${ancienId}"`);
            console.log(`   Nouvelle pratique: "${nouveauId}"`);

            // Invalider le cache si la fonction existe
            if (typeof window.invaliderCachePratique === 'function') {
                window.invaliderCachePratique();
                console.log('🔄 Cache de pratique invalidé');
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
        const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
        const pratiqueActive = config.pratique;

        if (!pratiqueActive) {
            console.warn('⚠️ Aucune pratique configurée');
            console.log('💡 Allez dans Réglages › Pratique de notation pour configurer');
            return;
        }

        console.log(`📊 Pratique configurée: "${pratiqueActive}"`);

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
            console.log('═══════════════════════════════════════════════════════');
            console.log('✅ MIGRATION BETA 90 EFFECTUÉE');
            console.log('═══════════════════════════════════════════════════════');
            console.log('Votre configuration a été mise à jour automatiquement.');
            console.log('Les nouveaux IDs de pratiques sont maintenant utilisés.');
            console.log('═══════════════════════════════════════════════════════');
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
        localStorage.removeItem(CLE_MIGRATION_EFFECTUEE);
        console.log('🔄 Flag de migration réinitialisé');
        console.log('💡 Rechargez la page pour réexécuter la migration');
    };

    console.log('✅ Module migration-pratiques.js chargé');
})();
