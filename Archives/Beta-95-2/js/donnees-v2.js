/**
 * donnees-v2.js
 * Module de gestion de l'onglet Données (Beta 95)
 *
 * Gère l'affichage et l'initialisation de l'onglet Données :
 * - Statistiques des snapshots
 * - Initialisation des éléments d'interface
 *
 * Les fonctions d'import/export restent dans import-export.js
 * Les fonctions de snapshots restent dans snapshots.js
 */

(function() {
    'use strict';

    console.log('[donnees-v2] Chargement du module...');

    // =========================================================================
    // INITIALISATION
    // =========================================================================

    /**
     * Initialise l'onglet Données v2
     */
    function initialiserDonneesV2() {
        console.log('[donnees-v2] Initialisation...');

        // Charger les statistiques des snapshots
        chargerStatistiquesSnapshots();

        console.log('[donnees-v2] Initialisation terminée');
    }

    // =========================================================================
    // STATISTIQUES SNAPSHOTS
    // =========================================================================

    /**
     * Charge les statistiques des snapshots dans les cartes métriques
     */
    function chargerStatistiquesSnapshots() {
        // Éléments DOM
        const statHebdo = document.getElementById('v2-stat-snapshots-hebdo');
        const statInterventions = document.getElementById('v2-stat-snapshots-interventions');
        const statDerniere = document.getElementById('v2-stat-derniere-capture');

        if (!statHebdo || !statInterventions || !statDerniere) {
            console.log('[donnees-v2] Éléments statistiques non trouvés');
            return;
        }

        // Récupérer les snapshots
        let snapshotsHebdo = [];
        let snapshotsInterventions = [];

        try {
            snapshotsHebdo = db.getSync('snapshotsHebdomadaires') || [];
        } catch (e) {
            snapshotsHebdo = [];
        }

        try {
            snapshotsInterventions = db.getSync('snapshotsInterventions') || [];
        } catch (e) {
            snapshotsInterventions = [];
        }

        // Afficher les compteurs
        statHebdo.textContent = snapshotsHebdo.length || '0';
        statInterventions.textContent = snapshotsInterventions.length || '0';

        // Trouver la dernière capture
        let derniereDate = null;

        if (snapshotsHebdo.length > 0) {
            const derniereHebdo = snapshotsHebdo[snapshotsHebdo.length - 1];
            if (derniereHebdo.dateSeance) {
                derniereDate = new Date(derniereHebdo.dateSeance);
            }
        }

        if (snapshotsInterventions.length > 0) {
            const derniereIntervention = snapshotsInterventions[snapshotsInterventions.length - 1];
            if (derniereIntervention.date) {
                const dateIntervention = new Date(derniereIntervention.date);
                if (!derniereDate || dateIntervention > derniereDate) {
                    derniereDate = dateIntervention;
                }
            }
        }

        // Formater la date
        if (derniereDate) {
            const options = { day: 'numeric', month: 'short' };
            statDerniere.textContent = derniereDate.toLocaleDateString('fr-CA', options);
        } else {
            statDerniere.textContent = '—';
        }
    }

    // =========================================================================
    // EXPORTS GLOBAUX
    // =========================================================================

    window.initialiserDonneesV2 = initialiserDonneesV2;
    window.chargerStatistiquesSnapshots = chargerStatistiquesSnapshots;

    // =========================================================================
    // INITIALISATION AU CHARGEMENT
    // =========================================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof db !== 'undefined' && db.isReady) {
                initialiserDonneesV2();
            } else {
                document.addEventListener('db-ready', initialiserDonneesV2);
            }
        });
    } else {
        if (typeof db !== 'undefined' && db.isReady) {
            initialiserDonneesV2();
        } else {
            document.addEventListener('db-ready', initialiserDonneesV2);
        }
    }

    console.log('[donnees-v2] Module chargé');

})();
