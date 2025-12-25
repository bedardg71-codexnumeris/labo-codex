/**
 * pratique-notation-v2.js
 * Module de gestion de l'onglet Pratique de notation (Beta 95)
 *
 * Gère la configuration pédagogique structurante :
 * - Informations de base (nom, type, description)
 * - Échelle de performance
 * - Structure des évaluations (portfolio, sommative, standards, etc.)
 * - Système de jetons
 *
 * Les mêmes données que le wizard remplit progressivement sont accessibles
 * directement ici pour les utilisateurs experts.
 */

(function() {
    'use strict';

    console.log('[pratique-notation-v2] Chargement du module...');

    // =========================================================================
    // INITIALISATION
    // =========================================================================

    /**
     * Initialise l'onglet Pratique de notation v2
     */
    function initialiserPratiqueNotationV2() {
        console.log('[pratique-notation-v2] Initialisation...');

        // Charger le dropdown des échelles
        chargerDropdownEchellesV2();

        // Charger les valeurs depuis modalitesEvaluation
        chargerValeursDepuisStorage();

        console.log('[pratique-notation-v2] Initialisation terminée');
    }

    // =========================================================================
    // DROPDOWN ÉCHELLES
    // =========================================================================

    /**
     * Charge la liste des échelles dans le dropdown
     */
    function chargerDropdownEchellesV2() {
        const dropdown = document.getElementById('v2-echelle-id');
        if (!dropdown) return;

        let echelles = [];
        try {
            echelles = db.getSync('echellesTemplates') || [];
        } catch (e) {
            console.error('[pratique-notation-v2] Erreur lecture échelles:', e);
        }

        // Garder la première option
        dropdown.innerHTML = '<option value="">-- Sélectionner une échelle --</option>';

        // Ajouter les échelles
        echelles.forEach(e => {
            if (!e || !e.id) return;
            const option = document.createElement('option');
            option.value = e.id;
            option.textContent = e.nom || e.id;
            dropdown.appendChild(option);
        });
    }

    /**
     * Affiche l'aperçu de l'échelle sélectionnée
     */
    function afficherPreviewEchelleV2() {
        const dropdown = document.getElementById('v2-echelle-id');
        const preview = document.getElementById('v2-preview-echelle');
        const contenu = document.getElementById('v2-preview-echelle-contenu');

        if (!dropdown || !preview || !contenu) return;

        const echelleId = dropdown.value;
        if (!echelleId) {
            preview.style.display = 'none';
            return;
        }

        // Trouver l'échelle
        let echelles = [];
        try {
            echelles = db.getSync('echellesTemplates') || [];
        } catch (e) {
            echelles = [];
        }

        const echelle = echelles.find(e => e.id === echelleId);
        if (!echelle || !echelle.niveaux) {
            preview.style.display = 'none';
            return;
        }

        // Afficher les niveaux
        let html = '<ul style="margin: 0; padding-left: 15px; list-style: none;">';
        echelle.niveaux.forEach(n => {
            html += `<li style="margin-bottom: 4px;"><strong>${n.code}</strong> : ${n.nom} (${n.min}-${n.max}%)</li>`;
        });
        html += '</ul>';

        contenu.innerHTML = html;
        preview.style.display = 'block';

        // Sauvegarder la sélection
        sauvegarderPratiqueBaseV2();
    }

    // =========================================================================
    // CHARGEMENT DEPUIS STORAGE
    // =========================================================================

    /**
     * Charge les valeurs depuis modalitesEvaluation vers les champs
     */
    function chargerValeursDepuisStorage() {
        let modalites = {};
        try {
            modalites = db.getSync('modalitesEvaluation') || {};
        } catch (e) {
            modalites = {};
        }

        // Informations de base
        const nomPratique = document.getElementById('v2-pratique-nom');
        if (nomPratique) {
            nomPratique.value = modalites.nomPratique || '';
        }

        const typePratique = document.getElementById('v2-pratique-type');
        if (typePratique) {
            typePratique.value = modalites.pratique || '';
            // Afficher la configuration correspondante
            afficherConfigurationType(modalites.pratique || '');
        }

        const description = document.getElementById('v2-pratique-description');
        if (description) {
            description.value = modalites.description || '';
        }

        // Échelle
        const echelleId = document.getElementById('v2-echelle-id');
        if (echelleId && modalites.echelleId) {
            echelleId.value = modalites.echelleId;
            afficherPreviewEchelleV2();
        }

        // Portfolio
        const portfolio = modalites.portfolio || {};
        const portfolioSelection = document.getElementById('v2-portfolio-selection');
        if (portfolioSelection) {
            portfolioSelection.value = portfolio.methodeSelection || 'meilleurs';
        }

        // Découpler P et R
        const decouplerPR = document.getElementById('v2-decoupler-pr');
        if (decouplerPR) {
            decouplerPR.checked = portfolio.decouplerPR || false;
        }

        const portfolioNombre = document.getElementById('v2-portfolio-nombre');
        if (portfolioNombre) {
            portfolioNombre.value = portfolio.nombreARetenir || 5;
        }

        const portfolioMinimum = document.getElementById('v2-portfolio-minimum');
        if (portfolioMinimum) {
            portfolioMinimum.value = portfolio.minimumCompletion || 7;
        }

        const portfolioTotal = document.getElementById('v2-portfolio-total');
        if (portfolioTotal) {
            portfolioTotal.value = portfolio.nombreTotal || 10;
        }

        // Standards
        const standardsNombre = document.getElementById('v2-standards-nombre');
        if (standardsNombre && modalites.standards) {
            standardsNombre.value = modalites.standards.nombre || 10;
        }

        const standardsTerminaux = document.getElementById('v2-standards-terminaux');
        if (standardsTerminaux && modalites.standards) {
            standardsTerminaux.value = (modalites.standards.terminaux || []).join(', ');
        }

        // Spécifications
        const specType = document.getElementById('v2-spec-type');
        if (specType && modalites.specifications) {
            specType.value = modalites.specifications.type || 'binaire';
        }

        // Jetons
        const configJetons = modalites.configurationJetons || {};

        const jetonsNombre = document.getElementById('v2-jetons-nombre');
        if (jetonsNombre) {
            jetonsNombre.value = configJetons.nombreParEleve || 4;
        }

        const jetonDelaiActif = document.getElementById('v2-jeton-delai-actif');
        if (jetonDelaiActif) {
            jetonDelaiActif.checked = configJetons.delaiActif !== false;
        }

        const delaiDuree = document.getElementById('v2-delai-duree');
        if (delaiDuree) {
            delaiDuree.value = configJetons.dureeDelaiJours || 7;
        }

        const jetonRepriseActif = document.getElementById('v2-jeton-reprise-actif');
        if (jetonRepriseActif) {
            jetonRepriseActif.checked = configJetons.repriseActif !== false;
        }

        const repriseOriginale = document.querySelectorAll('input[name="v2-reprise-originale"]');
        repriseOriginale.forEach(radio => {
            radio.checked = radio.value === (configJetons.gestionOriginale || 'archiver');
        });

        const jetonCibleeActif = document.getElementById('v2-jeton-ciblee-actif');
        if (jetonCibleeActif) {
            jetonCibleeActif.checked = configJetons.repriseCibleeActif !== false;
        }

        const cibleePlafond = document.getElementById('v2-ciblee-plafond');
        if (cibleePlafond) {
            cibleePlafond.value = configJetons.plafondCiblee || 'D (Développement)';
        }
    }

    // =========================================================================
    // CHANGEMENT DE TYPE DE PRATIQUE
    // =========================================================================

    /**
     * Appelé quand l'utilisateur change le type de pratique
     */
    function changerTypePratiqueV2() {
        const typePratique = document.getElementById('v2-pratique-type')?.value || '';
        afficherConfigurationType(typePratique);
        sauvegarderPratiqueBaseV2();
    }

    /**
     * Affiche la configuration correspondant au type de pratique
     * Taxonomie Beta 96 : Sommative, PAN-Standards, PAN-Spécifications, PAN-Dénotation
     */
    function afficherConfigurationType(type) {
        // Masquer toutes les configurations
        const configs = ['v2-config-pan-standards', 'v2-config-sommative',
                        'v2-config-pan-specifications', 'v2-config-defaut'];

        configs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // Afficher la configuration correspondante
        let configId = 'v2-config-defaut';
        switch (type) {
            case 'pan-standards':
            case 'pan-maitrise':  // Rétrocompatibilité
                configId = 'v2-config-pan-standards';
                break;
            case 'sommative':
                configId = 'v2-config-sommative';
                break;
            case 'pan-specifications':
            case 'specifications':  // Rétrocompatibilité
                configId = 'v2-config-pan-specifications';
                break;
            case 'pan-denotation':
                // PAN-Dénotation : pas encore de configuration spécifique
                configId = 'v2-config-defaut';
                break;
        }

        const config = document.getElementById(configId);
        if (config) config.style.display = 'block';
    }

    // =========================================================================
    // SAUVEGARDE
    // =========================================================================

    /**
     * Sauvegarde les informations de base
     */
    function sauvegarderPratiqueBaseV2() {
        let modalites = {};
        try {
            modalites = db.getSync('modalitesEvaluation') || {};
        } catch (e) {
            modalites = {};
        }

        modalites.nomPratique = document.getElementById('v2-pratique-nom')?.value || '';
        modalites.pratique = document.getElementById('v2-pratique-type')?.value || 'sommative';
        modalites.description = document.getElementById('v2-pratique-description')?.value || '';
        modalites.echelleId = document.getElementById('v2-echelle-id')?.value || '';

        db.setSync('modalitesEvaluation', modalites);
        console.log('[pratique-notation-v2] Informations de base sauvegardées');
    }

    /**
     * Sauvegarde la structure des évaluations
     */
    function sauvegarderStructureV2() {
        let modalites = {};
        try {
            modalites = db.getSync('modalitesEvaluation') || {};
        } catch (e) {
            modalites = {};
        }

        const type = modalites.pratique || '';

        // Portfolio
        if (type === 'pan-maitrise') {
            modalites.portfolio = modalites.portfolio || {};
            modalites.portfolio.methodeSelection = document.getElementById('v2-portfolio-selection')?.value || 'meilleurs';
            modalites.portfolio.nombreARetenir = parseInt(document.getElementById('v2-portfolio-nombre')?.value) || 5;
            modalites.portfolio.minimumCompletion = parseInt(document.getElementById('v2-portfolio-minimum')?.value) || 7;
            modalites.portfolio.nombreTotal = parseInt(document.getElementById('v2-portfolio-total')?.value) || 10;
            modalites.portfolio.decouplerPR = document.getElementById('v2-decoupler-pr')?.checked || false;
        }

        // Standards
        if (type === 'standards') {
            modalites.standards = modalites.standards || {};
            modalites.standards.nombre = parseInt(document.getElementById('v2-standards-nombre')?.value) || 10;
            const terminauxStr = document.getElementById('v2-standards-terminaux')?.value || '';
            modalites.standards.terminaux = terminauxStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        }

        // Spécifications
        if (type === 'specifications') {
            modalites.specifications = modalites.specifications || {};
            modalites.specifications.type = document.getElementById('v2-spec-type')?.value || 'binaire';
        }

        db.setSync('modalitesEvaluation', modalites);
        console.log('[pratique-notation-v2] Structure sauvegardée');
    }

    /**
     * Sauvegarde la configuration des jetons
     */
    function sauvegarderJetonsV2() {
        let modalites = {};
        try {
            modalites = db.getSync('modalitesEvaluation') || {};
        } catch (e) {
            modalites = {};
        }

        modalites.configurationJetons = modalites.configurationJetons || {};
        modalites.configurationJetons.nombreParEleve = parseInt(document.getElementById('v2-jetons-nombre')?.value) || 4;
        modalites.configurationJetons.delaiActif = document.getElementById('v2-jeton-delai-actif')?.checked !== false;
        modalites.configurationJetons.dureeDelaiJours = parseInt(document.getElementById('v2-delai-duree')?.value) || 7;
        modalites.configurationJetons.repriseActif = document.getElementById('v2-jeton-reprise-actif')?.checked !== false;

        const repriseOriginale = document.querySelector('input[name="v2-reprise-originale"]:checked');
        modalites.configurationJetons.gestionOriginale = repriseOriginale?.value || 'archiver';

        modalites.configurationJetons.repriseCibleeActif = document.getElementById('v2-jeton-ciblee-actif')?.checked !== false;
        modalites.configurationJetons.plafondCiblee = document.getElementById('v2-ciblee-plafond')?.value || 'D (Développement)';

        db.setSync('modalitesEvaluation', modalites);
        console.log('[pratique-notation-v2] Jetons sauvegardés');
    }

    /**
     * Sauvegarde toute la configuration
     */
    function sauvegarderToutePratiqueV2() {
        sauvegarderPratiqueBaseV2();
        sauvegarderStructureV2();
        sauvegarderJetonsV2();

        // Afficher notification
        afficherNotificationSuccesV2('Pratique de notation sauvegardée avec succès');
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
            console.log('[pratique-notation-v2]', message);
        }
    }

    // =========================================================================
    // EXPORTS GLOBAUX
    // =========================================================================

    window.initialiserPratiqueNotationV2 = initialiserPratiqueNotationV2;
    window.changerTypePratiqueV2 = changerTypePratiqueV2;
    window.afficherPreviewEchelleV2 = afficherPreviewEchelleV2;
    window.sauvegarderPratiqueBaseV2 = sauvegarderPratiqueBaseV2;
    window.sauvegarderStructureV2 = sauvegarderStructureV2;
    window.sauvegarderJetonsV2 = sauvegarderJetonsV2;
    window.sauvegarderToutePratiqueV2 = sauvegarderToutePratiqueV2;

    // =========================================================================
    // INITIALISATION AU CHARGEMENT
    // =========================================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof db !== 'undefined' && db.isReady) {
                initialiserPratiqueNotationV2();
            } else {
                document.addEventListener('db-ready', initialiserPratiqueNotationV2);
            }
        });
    } else {
        if (typeof db !== 'undefined' && db.isReady) {
            initialiserPratiqueNotationV2();
        } else {
            document.addEventListener('db-ready', initialiserPratiqueNotationV2);
        }
    }

    console.log('[pratique-notation-v2] Module chargé');

})();
