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
            // Afficher la description taxonomique, variante et configuration correspondante
            afficherDescriptionTaxonomique(modalites.pratique || '');
            afficherVariantePANStandards(modalites.pratique || '');
            afficherConfigurationType(modalites.pratique || '');
        }

        // Variante PAN-Standards (si applicable)
        const varianteSelect = document.getElementById('v2-variante-calcul');
        if (varianteSelect && modalites.varianteCalcul) {
            varianteSelect.value = modalites.varianteCalcul;
            changerVariantePANStandards(); // Afficher la description de la variante
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
     * Définitions taxonomiques des 4 familles de pratiques de notation
     * Référence : DESC-Taxonomie des quatre familles de pratiques de notation.txt
     */
    const TAXONOMIE_PRATIQUES = {
        'sommative': {
            titre: 'SOMMATIVE (pratique traditionnelle)',
            definition: 'Pratique traditionnelle où la note finale est calculée par moyenne pondérée de toutes les évaluations. Cette famille n\'est pas une PAN, mais elle est incluse comme point de comparaison avec les pratiques alternatives.'
        },
        'pan-standards': {
            titre: 'PAN-STANDARDS (Standards-Based Grading)',
            definition: 'Pratique où chaque standard ou objectif d\'apprentissage est évalué par niveaux de maîtrise, et le meilleur résultat est retenu pour refléter l\'apprentissage atteint.'
        },
        'pan-specifications': {
            titre: 'PAN-SPÉCIFICATIONS (Specifications Grading)',
            definition: 'Pratique où les productions sont évaluées de façon dichotomique (réussi/échoué selon des spécifications préétablies), et la note finale est déterminée par le « bundle » de travaux complétés.'
        },
        'pan-denotation': {
            titre: 'PAN-DÉNOTATION (Ungrading)',
            definition: 'Pratique où aucune note chiffrée n\'est attribuée pendant le cours; seule la rétroaction qualitative guide l\'apprentissage jusqu\'à une évaluation globale finale.'
        }
    };

    /**
     * Descriptions des variantes PAN-Standards
     * Basé sur les cartographies analysées et le formulaire de cartographie
     */
    const VARIANTES_PAN_STANDARDS = {
        'n-meilleurs': {
            nom: 'N meilleures productions',
            description: 'La note finale est basée sur les N meilleures productions de l\'étudiant. Permet de valoriser la progression et d\'éliminer les « mauvais jours ». Exemple : Grégoire Bédard (Littérature).',
            exemple: 'Portfolio avec les 7 meilleurs artefacts sur 12'
        },
        'moyenne': {
            nom: 'Moyenne de toutes les productions',
            description: 'La note finale est la moyenne de toutes les productions évaluées par niveaux de maîtrise. Chaque production peut avoir une pondération différente. Exemple : Michel B. (Mathématiques).',
            exemple: 'Moyenne pondérée des niveaux par objectif'
        },
        'n-recents': {
            nom: 'N productions les plus récentes',
            description: 'La note finale est basée sur les N productions les plus récentes. Valorise la progression et l\'état actuel des apprentissages plutôt que les difficultés initiales.',
            exemple: 'Les 5 dernières évaluations déterminent la note'
        },
        'mediane-mode': {
            nom: 'Médiane ou mode des niveaux',
            description: 'La note finale est déterminée par la tendance centrale (médiane ou mode) des niveaux atteints, avec jugement professionnel de l\'enseignant. Exemple : Isabelle M. (Biologie).',
            exemple: 'Mode statistique comme suggestion + jugement global'
        },
        'grille-conversion': {
            nom: 'Grille de conversion personnalisée',
            description: 'Une grille de conversion traduit les niveaux de maîtrise atteints en pourcentage final selon des règles personnalisées. Exemple : Bruno V. (Chimie).',
            exemple: 'Standards terminaux requis pour chaque palier de note'
        },
        'autre': {
            nom: 'Autre méthode',
            description: 'Décrivez votre méthode de calcul dans le champ « Description » ci-dessous. Nous pourrons discuter de son implémentation.',
            exemple: ''
        }
    };

    /**
     * Appelé quand l'utilisateur change le type de pratique
     */
    function changerTypePratiqueV2() {
        const typePratique = document.getElementById('v2-pratique-type')?.value || '';
        afficherDescriptionTaxonomique(typePratique);
        afficherVariantePANStandards(typePratique);
        afficherConfigurationType(typePratique);
        sauvegarderPratiqueBaseV2();
    }

    /**
     * Affiche/masque le sélecteur de variante PAN-Standards
     */
    function afficherVariantePANStandards(type) {
        const conteneur = document.getElementById('v2-variante-pan-standards');
        if (!conteneur) return;

        // Normaliser le type
        let typeNormalise = type;
        if (type === 'pan-maitrise') typeNormalise = 'pan-standards';

        if (typeNormalise === 'pan-standards') {
            conteneur.style.display = 'block';
        } else {
            conteneur.style.display = 'none';
            // Réinitialiser la sélection si on change de type
            const select = document.getElementById('v2-variante-calcul');
            if (select) select.value = '';
            const desc = document.getElementById('v2-variante-description');
            if (desc) desc.style.display = 'none';
        }
    }

    /**
     * Appelé quand l'utilisateur change la variante PAN-Standards
     */
    function changerVariantePANStandards() {
        const variante = document.getElementById('v2-variante-calcul')?.value || '';
        const descEl = document.getElementById('v2-variante-description');

        if (!descEl) return;

        const varianteInfo = VARIANTES_PAN_STANDARDS[variante];

        if (varianteInfo) {
            let html = `<strong>${varianteInfo.nom}</strong><br>${varianteInfo.description}`;
            if (varianteInfo.exemple) {
                html += `<br><em style="color: var(--gris-moyen);">Ex: ${varianteInfo.exemple}</em>`;
            }
            descEl.innerHTML = html;
            descEl.style.display = 'block';
        } else {
            descEl.style.display = 'none';
        }

        // Sauvegarder
        sauvegarderPratiqueBaseV2();
    }

    /**
     * Affiche la description taxonomique correspondant au type sélectionné
     */
    function afficherDescriptionTaxonomique(type) {
        const conteneur = document.getElementById('v2-description-taxonomique');
        const titreEl = document.getElementById('v2-taxonomie-titre');
        const definitionEl = document.getElementById('v2-taxonomie-definition');

        if (!conteneur || !titreEl || !definitionEl) return;

        // Normaliser le type (rétrocompatibilité)
        let typeNormalise = type;
        if (type === 'pan-maitrise') typeNormalise = 'pan-standards';
        if (type === 'specifications') typeNormalise = 'pan-specifications';

        const taxonomie = TAXONOMIE_PRATIQUES[typeNormalise];

        if (taxonomie) {
            titreEl.textContent = taxonomie.titre;
            definitionEl.textContent = taxonomie.definition;
            conteneur.style.display = 'block';
        } else {
            conteneur.style.display = 'none';
        }
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

        // Variante PAN-Standards (si applicable)
        const varianteSelect = document.getElementById('v2-variante-calcul');
        if (varianteSelect && modalites.pratique === 'pan-standards') {
            modalites.varianteCalcul = varianteSelect.value || '';
        }

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
    window.changerVariantePANStandards = changerVariantePANStandards;
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
