/**
 * preferences-v2.js
 * Module de gestion de l'onglet Préférences (Beta 95)
 *
 * Gère les options d'affichage et de personnalisation :
 * - Outils à exploiter (A-C-P, patterns, RàI, mode comparatif)
 * - Affichage des ressources (SOLO, snapshots, graphiques, détails)
 * - Configuration du dépistage (grille de référence)
 * - Seuils d'interprétation (fragile, acceptable, bon)
 *
 * Ces préférences sont globales (pas par groupe-cours) et affectent
 * l'affichage dans toute l'application.
 */

(function() {
    'use strict';

    console.log('[preferences-v2] Chargement du module...');

    // =========================================================================
    // INITIALISATION
    // =========================================================================

    /**
     * Initialise l'onglet Préférences v2
     */
    function initialiserPreferencesV2() {
        console.log('[preferences-v2] Initialisation...');

        // Charger le dropdown des grilles
        chargerDropdownGrillesPreferencesV2();

        // Charger les valeurs depuis le storage
        chargerPreferencesDepuisStorage();

        console.log('[preferences-v2] Initialisation terminée');
    }

    // =========================================================================
    // DROPDOWN GRILLES
    // =========================================================================

    /**
     * Charge la liste des grilles dans le dropdown de référence
     */
    function chargerDropdownGrillesPreferencesV2() {
        const dropdown = document.getElementById('v2-pref-grille-reference');
        if (!dropdown) return;

        let grilles = [];
        try {
            grilles = db.getSync('grillesTemplates') || [];
        } catch (e) {
            console.error('[preferences-v2] Erreur lecture grilles:', e);
        }

        // Garder la première option
        dropdown.innerHTML = '<option value="">-- Sélectionner une grille --</option>';

        // Ajouter les grilles
        grilles.forEach(g => {
            if (!g || !g.id) return;
            const option = document.createElement('option');
            option.value = g.id;
            option.textContent = g.nom || g.id;
            dropdown.appendChild(option);
        });
    }

    // =========================================================================
    // CHARGEMENT DEPUIS STORAGE
    // =========================================================================

    /**
     * Charge les préférences depuis le storage
     */
    function chargerPreferencesDepuisStorage() {
        let modalites = {};
        try {
            modalites = db.getSync('modalitesEvaluation') || {};
        } catch (e) {
            modalites = {};
        }

        let preferences = {};
        try {
            preferences = db.getSync('preferencesAffichage') || {};
        } catch (e) {
            preferences = {};
        }

        // Outils à exploiter
        const depistageAcp = document.getElementById('v2-pref-depistage-acp');
        if (depistageAcp) {
            depistageAcp.checked = preferences.depistageAcp !== false;
        }

        const patterns = document.getElementById('v2-pref-patterns');
        if (patterns) {
            depistageAcp.checked = preferences.patterns !== false;
        }

        const rai = document.getElementById('v2-pref-rai');
        if (rai) {
            rai.checked = modalites.activerRai !== false;
        }

        const comparatif = document.getElementById('v2-pref-comparatif');
        if (comparatif) {
            comparatif.checked = modalites.afficherSommatif && modalites.afficherAlternatif;
        }

        // Affichage des ressources
        const solo = document.getElementById('v2-pref-solo');
        if (solo) {
            solo.checked = modalites.afficherDescriptionsSOLO !== false;
        }

        const snapshots = document.getElementById('v2-pref-snapshots');
        if (snapshots) {
            snapshots.checked = preferences.afficherSnapshots !== false;
        }

        const graphiques = document.getElementById('v2-pref-graphiques');
        if (graphiques) {
            graphiques.checked = preferences.afficherGraphiques !== false;
        }

        const seuilsVisuels = document.getElementById('v2-pref-seuils-visuels');
        if (seuilsVisuels) {
            seuilsVisuels.checked = preferences.afficherSeuilsVisuels !== false;
        }

        const detailsTechniques = document.getElementById('v2-pref-details-techniques');
        if (detailsTechniques) {
            detailsTechniques.checked = preferences.afficherDetailsTechniques === true;
        }

        // Grille de référence
        const grilleReference = document.getElementById('v2-pref-grille-reference');
        if (grilleReference && modalites.grilleReferenceDepistage) {
            grilleReference.value = modalites.grilleReferenceDepistage;
        }

        // Seuils d'interprétation
        let seuils = {};
        try {
            seuils = db.getSync('seuilsInterpretation') || {};
        } catch (e) {
            seuils = {};
        }

        const seuilFragile = document.getElementById('v2-seuil-fragile');
        if (seuilFragile) {
            seuilFragile.value = Math.round((seuils.fragile || 0.70) * 100);
        }

        const seuilAcceptable = document.getElementById('v2-seuil-acceptable');
        if (seuilAcceptable) {
            seuilAcceptable.value = Math.round((seuils.acceptable || 0.80) * 100);
        }

        const seuilBon = document.getElementById('v2-seuil-bon');
        if (seuilBon) {
            seuilBon.value = Math.round((seuils.bon || 0.85) * 100);
        }

        const fenetrePatterns = document.getElementById('v2-fenetre-patterns');
        if (fenetrePatterns) {
            fenetrePatterns.value = seuils.nombreProductionsAnalyse || 3;
        }
    }

    // =========================================================================
    // SAUVEGARDE
    // =========================================================================

    /**
     * Sauvegarde les préférences
     */
    function sauvegarderPreferencesV2() {
        // Sauvegarder dans modalitesEvaluation pour compatibilité
        let modalites = {};
        try {
            modalites = db.getSync('modalitesEvaluation') || {};
        } catch (e) {
            modalites = {};
        }

        // Mode comparatif
        const comparatif = document.getElementById('v2-pref-comparatif')?.checked || false;
        if (comparatif) {
            modalites.afficherSommatif = true;
            modalites.afficherAlternatif = true;
        } else {
            // Mode normal selon la pratique
            if (modalites.pratique === 'sommative') {
                modalites.afficherSommatif = true;
                modalites.afficherAlternatif = false;
            } else {
                modalites.afficherSommatif = false;
                modalites.afficherAlternatif = true;
            }
        }

        // RàI et SOLO
        modalites.activerRai = document.getElementById('v2-pref-rai')?.checked !== false;
        modalites.afficherDescriptionsSOLO = document.getElementById('v2-pref-solo')?.checked !== false;

        // Grille de référence
        modalites.grilleReferenceDepistage = document.getElementById('v2-pref-grille-reference')?.value || '';

        db.setSync('modalitesEvaluation', modalites);

        // Sauvegarder dans preferencesAffichage
        let preferences = {};
        try {
            preferences = db.getSync('preferencesAffichage') || {};
        } catch (e) {
            preferences = {};
        }

        preferences.depistageAcp = document.getElementById('v2-pref-depistage-acp')?.checked !== false;
        preferences.patterns = document.getElementById('v2-pref-patterns')?.checked !== false;
        preferences.afficherSnapshots = document.getElementById('v2-pref-snapshots')?.checked !== false;
        preferences.afficherGraphiques = document.getElementById('v2-pref-graphiques')?.checked !== false;
        preferences.afficherSeuilsVisuels = document.getElementById('v2-pref-seuils-visuels')?.checked !== false;
        preferences.afficherDetailsTechniques = document.getElementById('v2-pref-details-techniques')?.checked === true;

        db.setSync('preferencesAffichage', preferences);

        console.log('[preferences-v2] Préférences sauvegardées');
    }

    /**
     * Sauvegarde les seuils d'interprétation
     */
    function sauvegarderSeuilsV2() {
        let seuils = {};
        try {
            seuils = db.getSync('seuilsInterpretation') || {};
        } catch (e) {
            seuils = {};
        }

        const fragile = parseInt(document.getElementById('v2-seuil-fragile')?.value) || 70;
        const acceptable = parseInt(document.getElementById('v2-seuil-acceptable')?.value) || 80;
        const bon = parseInt(document.getElementById('v2-seuil-bon')?.value) || 85;

        // Validation : fragile < acceptable < bon
        if (fragile >= acceptable || acceptable >= bon) {
            alert('Erreur : Les seuils doivent être ordonnés (Fragile < Acceptable < Bon)');
            return;
        }

        seuils.fragile = fragile / 100;
        seuils.acceptable = acceptable / 100;
        seuils.bon = bon / 100;
        seuils.nombreProductionsAnalyse = parseInt(document.getElementById('v2-fenetre-patterns')?.value) || 3;

        db.setSync('seuilsInterpretation', seuils);
        console.log('[preferences-v2] Seuils sauvegardés');
    }

    /**
     * Restaure les seuils par défaut
     */
    function restaurerSeuilsDefautV2() {
        const seuilFragile = document.getElementById('v2-seuil-fragile');
        const seuilAcceptable = document.getElementById('v2-seuil-acceptable');
        const seuilBon = document.getElementById('v2-seuil-bon');
        const fenetrePatterns = document.getElementById('v2-fenetre-patterns');

        if (seuilFragile) seuilFragile.value = 70;
        if (seuilAcceptable) seuilAcceptable.value = 80;
        if (seuilBon) seuilBon.value = 85;
        if (fenetrePatterns) fenetrePatterns.value = 3;

        sauvegarderSeuilsV2();
        afficherNotificationSuccesV2('Seuils restaurés aux valeurs par défaut');
    }

    /**
     * Sauvegarde toutes les préférences
     */
    function sauvegarderToutesPreferencesV2() {
        sauvegarderPreferencesV2();
        sauvegarderSeuilsV2();
        afficherNotificationSuccesV2('Préférences sauvegardées avec succès');
    }

    // =========================================================================
    // NOTIFICATIONS
    // =========================================================================

    /**
     * Affiche une notification de succès
     */
    function afficherNotificationSuccesV2(message) {
        if (typeof window.afficherNotificationSucces === 'function') {
            window.afficherNotificationSucces(message);
        } else if (typeof window.afficherMessage === 'function') {
            window.afficherMessage(message, 'succes');
        } else {
            console.log('[preferences-v2]', message);
        }
    }

    // =========================================================================
    // EXPORTS GLOBAUX
    // =========================================================================

    window.initialiserPreferencesV2 = initialiserPreferencesV2;
    window.sauvegarderPreferencesV2 = sauvegarderPreferencesV2;
    window.sauvegarderSeuilsV2 = sauvegarderSeuilsV2;
    window.restaurerSeuilsDefautV2 = restaurerSeuilsDefautV2;
    window.sauvegarderToutesPreferencesV2 = sauvegarderToutesPreferencesV2;

    // =========================================================================
    // INITIALISATION AU CHARGEMENT
    // =========================================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof db !== 'undefined' && db.isReady) {
                initialiserPreferencesV2();
            } else {
                document.addEventListener('db-ready', initialiserPreferencesV2);
            }
        });
    } else {
        if (typeof db !== 'undefined' && db.isReady) {
            initialiserPreferencesV2();
        } else {
            document.addEventListener('db-ready', initialiserPreferencesV2);
        }
    }

    console.log('[preferences-v2] Module chargé');

})();
