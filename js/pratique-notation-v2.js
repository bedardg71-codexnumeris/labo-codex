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
            definition: 'Pratique où les productions sont évaluées de façon dichotomique (conforme/non-conforme selon des spécifications préétablies), et la note finale est déterminée par le forfait (ensemble de travaux conformes) complété.'
        },
        'pan-denotation': {
            titre: 'PAN-DÉNOTATION (Ungrading)',
            definition: 'Pratique où aucune note chiffrée n\'est attribuée pendant le cours; seule la rétroaction qualitative guide l\'apprentissage jusqu\'à une évaluation globale finale.'
        }
    };

    /**
     * Descriptions des variantes PAN-Standards (5 options - traces sélectives)
     * Basé sur les cartographies analysées et le formulaire de cartographie
     *
     * Note : Les approches "moyenne de toutes" et "médiane/mode" ont été retirées
     * car elles s'apparentent davantage à des pratiques sommatives (toutes les
     * traces comptent, pénalisant les erreurs initiales).
     *
     * ✅ NOUVEAU (Beta 95) : Ajout de la variante "par-objectifs" avec 4 modes de calcul :
     * - Comptage (Bruno V., Chimie, André-Laurendeau)
     * - Moyenne pondérée (Michel B., Mathématiques)
     * - Seuils critiques (Xavier C.-T., Informatique)
     * - Holistique (Isabelle M., Biologie)
     */
    const VARIANTES_PAN_STANDARDS = {
        'n-meilleurs': {
            nom: 'N meilleures évaluations',
            description: 'La note finale est basée sur les N meilleures évaluations (travaux écrits, entrevues, démonstrations, etc.). Permet de valoriser la progression et d\'éliminer les « mauvais jours ».',
            exemple: 'Les 7 meilleures évaluations sur 12'
        },
        'n-recents': {
            nom: 'N évaluations les plus récentes',
            description: 'La note finale est basée sur les N évaluations les plus récentes. Valorise la progression et l\'état actuel des apprentissages plutôt que les difficultés initiales.',
            exemple: 'Les 5 dernières évaluations déterminent la note'
        },
        'grille-profils': {
            nom: 'Grille de profils (ex: « 3M + 2M+ → 85% »)',
            description: 'Une grille de profils convertit la combinaison de niveaux atteints sur tous les standards en note finale. Par exemple : un étudiant avec 3 standards « Maîtrisé » (M) et 2 « Au-delà des attentes » (M+) obtient 85%.',
            exemple: '5M → 75% | 4M + 1M+ → 80% | 3M + 2M+ → 85%'
        },
        'par-objectifs': {
            nom: 'Par objectifs (4 modes de calcul)',
            description: 'Évaluation par objectifs d\'apprentissage avec choix du mode de calcul : <strong>Comptage</strong> (Bruno V.), <strong>Moyenne pondérée</strong> (Michel B.), <strong>Seuils critiques</strong> (Xavier C.-T.), ou <strong>Holistique</strong> (Isabelle M.).',
            exemple: 'Objectifs essentiels/complémentaires | Pondérations variables | Seuils non-linéaires'
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

        // ✅ NOUVEAU (Beta 95) : Afficher/masquer la configuration par-objectifs
        const configObjectifs = document.getElementById('v2-config-par-objectifs');
        if (configObjectifs) {
            if (variante === 'par-objectifs') {
                configObjectifs.style.display = 'block';
                // Charger les données de configuration
                chargerConfigParObjectifs();
            } else {
                configObjectifs.style.display = 'none';
            }
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
    // GESTION PAR-OBJECTIFS (4 modes : Bruno, Michel, Xavier, Isabelle)
    // =========================================================================

    /**
     * Les 4 modes de calcul disponibles
     */
    const MODES_CALCUL_OBJECTIFS = {
        'comptage': {
            nom: 'Comptage (Bruno V.)',
            description: 'Note = nombre d\'objectifs maîtrisés. Plafond si essentiels non maîtrisés.'
        },
        'moyenne-ponderee': {
            nom: 'Moyenne pondérée (Michel B.)',
            description: 'Note = moyenne des niveaux × pondération de chaque objectif.'
        },
        'seuils-critiques': {
            nom: 'Seuils critiques (Xavier C.-T.)',
            description: 'Tous les objectifs doivent atteindre niveau 3+. Bonus pour niveau 4.'
        },
        'holistique': {
            nom: 'Holistique (Isabelle M.)',
            description: 'Suggestion statistique + validation par l\'enseignant.'
        }
    };

    /**
     * Structure par défaut pour le système par objectifs
     */
    const CONFIG_PAR_OBJECTIFS_DEFAUT = {
        modeCalcul: 'comptage',
        objectifs: [],
        // Paramètres mode Comptage (Bruno)
        comptage: {
            seuilMaitrise: 75,
            plafondSiEssentielNonMaitrise: 55,
            grilleConversion: {}
        },
        // Paramètres mode Moyenne pondérée (Michel)
        moyennePonderee: {
            // Les pondérations sont dans les objectifs
        },
        // Paramètres mode Seuils critiques (Xavier)
        seuilsCritiques: {
            seuilReussite: 3,
            noteBaseReussite: 80,
            bonusNiveau4: 3.33
        },
        // Paramètres mode Holistique (Isabelle)
        holistique: {
            methodeSuggestion: 'mode'
        }
    };

    /**
     * Charge la configuration par-objectifs depuis le storage
     */
    function chargerConfigParObjectifs() {
        let modalites = {};
        try {
            modalites = db.getSync('modalitesEvaluation') || {};
        } catch (e) {
            modalites = {};
        }

        // Migration : si ancienne config comptageObjectifs existe, migrer
        if (modalites.comptageObjectifs && !modalites.parObjectifs) {
            modalites.parObjectifs = {
                ...CONFIG_PAR_OBJECTIFS_DEFAUT,
                modeCalcul: 'comptage',
                objectifs: modalites.comptageObjectifs.objectifs || [],
                comptage: {
                    seuilMaitrise: modalites.comptageObjectifs.seuilMaitrise || 75,
                    plafondSiEssentielNonMaitrise: modalites.comptageObjectifs.plafondSiEssentielNonMaitrise || 55,
                    grilleConversion: modalites.comptageObjectifs.grilleConversion || {}
                }
            };
            db.setSync('modalitesEvaluation', modalites);
        }

        const config = modalites.parObjectifs || CONFIG_PAR_OBJECTIFS_DEFAUT;

        // Remplir le mode de calcul
        const modeEl = document.getElementById('v2-objectifs-mode-calcul');
        if (modeEl) {
            modeEl.value = config.modeCalcul || 'comptage';
            changerModeCalculObjectifs();
        }

        // Afficher la liste des objectifs
        afficherListeObjectifs(config.objectifs || [], config.modeCalcul);

        return config;
    }

    /**
     * Appelé quand le mode de calcul change
     */
    function changerModeCalculObjectifs() {
        const modeEl = document.getElementById('v2-objectifs-mode-calcul');
        const mode = modeEl?.value || 'comptage';

        // Afficher/masquer les sections spécifiques à chaque mode
        const sections = ['comptage', 'moyenne-ponderee', 'seuils-critiques', 'holistique'];
        sections.forEach(s => {
            const section = document.getElementById(`v2-config-mode-${s}`);
            if (section) {
                section.style.display = (s === mode) ? 'block' : 'none';
            }
        });

        // Afficher la description du mode
        const descEl = document.getElementById('v2-objectifs-mode-description');
        if (descEl && MODES_CALCUL_OBJECTIFS[mode]) {
            descEl.textContent = MODES_CALCUL_OBJECTIFS[mode].description;
            descEl.style.display = 'block';
        }

        // Charger les paramètres spécifiques au mode
        chargerParametresMode(mode);

        // Sauvegarder
        sauvegarderModeCalculObjectifs();
    }

    /**
     * Charge les paramètres spécifiques au mode sélectionné
     */
    function chargerParametresMode(mode) {
        const modalites = db.getSync('modalitesEvaluation') || {};
        const config = modalites.parObjectifs || CONFIG_PAR_OBJECTIFS_DEFAUT;

        switch (mode) {
            case 'comptage':
                const comptage = config.comptage || {};
                const seuilEl = document.getElementById('v2-comptage-seuil-maitrise');
                if (seuilEl) seuilEl.value = comptage.seuilMaitrise || 75;
                const plafondEl = document.getElementById('v2-comptage-plafond-essentiel');
                if (plafondEl) plafondEl.value = comptage.plafondSiEssentielNonMaitrise || 55;
                afficherGrilleConversion(comptage.grilleConversion || {});
                break;

            case 'seuils-critiques':
                const seuils = config.seuilsCritiques || {};
                const seuilReussiteEl = document.getElementById('v2-seuils-niveau-reussite');
                if (seuilReussiteEl) seuilReussiteEl.value = seuils.seuilReussite || 3;
                const noteBaseEl = document.getElementById('v2-seuils-note-base');
                if (noteBaseEl) noteBaseEl.value = seuils.noteBaseReussite || 80;
                const bonusEl = document.getElementById('v2-seuils-bonus-niveau4');
                if (bonusEl) bonusEl.value = seuils.bonusNiveau4 || 3.33;
                break;

            case 'holistique':
                const hol = config.holistique || {};
                const methodeEl = document.getElementById('v2-holistique-methode');
                if (methodeEl) methodeEl.value = hol.methodeSuggestion || 'mode';
                break;
        }
    }

    /**
     * Sauvegarde le mode de calcul sélectionné
     */
    function sauvegarderModeCalculObjectifs() {
        let modalites = db.getSync('modalitesEvaluation') || {};
        if (!modalites.parObjectifs) {
            modalites.parObjectifs = { ...CONFIG_PAR_OBJECTIFS_DEFAUT };
        }

        const modeEl = document.getElementById('v2-objectifs-mode-calcul');
        if (modeEl) {
            modalites.parObjectifs.modeCalcul = modeEl.value;
        }

        db.setSync('modalitesEvaluation', modalites);
    }

    /**
     * Affiche la liste des objectifs dans l'interface
     * Adapte les colonnes selon le mode de calcul
     */
    function afficherListeObjectifs(objectifs, mode) {
        const conteneur = document.getElementById('v2-objectifs-liste');
        if (!conteneur) return;

        if (!objectifs || objectifs.length === 0) {
            conteneur.innerHTML = `
                <div class="alerte-info" style="padding: 10px; margin: 10px 0;">
                    Aucun objectif configuré. Utilisez le bouton « + Ajouter un objectif » pour commencer.
                </div>
            `;
            return;
        }

        // Compter essentiels et complémentaires
        const nbEssentiels = objectifs.filter(o => o.essentiel).length;
        const nbComplementaires = objectifs.filter(o => !o.essentiel).length;
        const totalPonderation = objectifs.reduce((sum, o) => sum + (o.ponderation || 0), 0);

        // En-tête selon le mode
        let statsHtml = `<strong>${objectifs.length} objectifs</strong>`;
        if (mode === 'comptage') {
            statsHtml += ` : ${nbEssentiels} essentiels + ${nbComplementaires} complémentaires`;
        } else if (mode === 'moyenne-ponderee') {
            statsHtml += ` | Pondération totale : ${totalPonderation}%`;
        }

        // Colonnes selon le mode
        const showType = (mode === 'comptage');
        const showPonderation = (mode === 'moyenne-ponderee');

        let html = `
            <div style="margin-bottom: 10px; padding: 8px; background: var(--bleu-tres-pale); border-radius: 4px;">
                ${statsHtml}
            </div>
            <table class="tableau tableau-compact" style="width: 100%;">
                <thead>
                    <tr>
                        <th style="width: 50px;">#</th>
                        <th>Nom de l'objectif</th>
                        ${showType ? '<th style="width: 130px;">Type</th>' : ''}
                        ${showPonderation ? '<th style="width: 100px;">Pondération</th>' : ''}
                        <th style="width: 70px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        objectifs.forEach((obj, index) => {
            html += `
                <tr data-index="${index}">
                    <td>${index + 1}</td>
                    <td>
                        <input type="text" class="form-control" value="${obj.nom || ''}"
                               onchange="modifierObjectif(${index}, 'nom', this.value)"
                               style="width: 100%; padding: 4px 8px;">
                    </td>
            `;

            if (showType) {
                html += `
                    <td>
                        <select class="form-control" onchange="modifierObjectif(${index}, 'essentiel', this.value === 'essentiel')"
                                style="padding: 4px 8px;">
                            <option value="essentiel" ${obj.essentiel ? 'selected' : ''}>Essentiel</option>
                            <option value="complementaire" ${!obj.essentiel ? 'selected' : ''}>Complémentaire</option>
                        </select>
                    </td>
                `;
            }

            if (showPonderation) {
                html += `
                    <td>
                        <input type="number" class="form-control" value="${obj.ponderation || 0}"
                               onchange="modifierObjectif(${index}, 'ponderation', parseFloat(this.value))"
                               style="width: 70px; padding: 4px 8px;" min="0" max="100" step="0.5">%
                    </td>
                `;
            }

            html += `
                    <td style="text-align: center;">
                        <button type="button" class="btn btn-danger btn-tres-compact"
                                onclick="supprimerObjectif(${index})"
                                title="Supprimer cet objectif">
                            ✕
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        conteneur.innerHTML = html;
    }

    /**
     * Ajoute un nouvel objectif
     */
    function ajouterObjectif() {
        let modalites = db.getSync('modalitesEvaluation') || {};
        if (!modalites.parObjectifs) {
            modalites.parObjectifs = { ...CONFIG_PAR_OBJECTIFS_DEFAUT };
        }

        const objectifs = modalites.parObjectifs.objectifs || [];
        const nouvelIndex = objectifs.length + 1;
        const mode = modalites.parObjectifs.modeCalcul || 'comptage';

        objectifs.push({
            id: Date.now(),
            nom: `Objectif ${nouvelIndex}`,
            essentiel: true,
            ponderation: mode === 'moyenne-ponderee' ? 10 : 0,
            description: ''
        });

        modalites.parObjectifs.objectifs = objectifs;
        db.setSync('modalitesEvaluation', modalites);

        afficherListeObjectifs(objectifs, mode);
        if (mode === 'comptage') {
            regenererGrilleConversion();
        }
    }

    /**
     * Modifie une propriété d'un objectif
     */
    function modifierObjectif(index, propriete, valeur) {
        let modalites = db.getSync('modalitesEvaluation') || {};
        if (!modalites.parObjectifs || !modalites.parObjectifs.objectifs) return;

        modalites.parObjectifs.objectifs[index][propriete] = valeur;
        db.setSync('modalitesEvaluation', modalites);

        // Rafraîchir l'affichage si nécessaire
        const mode = modalites.parObjectifs.modeCalcul || 'comptage';
        if (propriete === 'essentiel' || propriete === 'ponderation') {
            afficherListeObjectifs(modalites.parObjectifs.objectifs, mode);
        }
    }

    /**
     * Supprime un objectif
     */
    function supprimerObjectif(index) {
        let modalites = db.getSync('modalitesEvaluation') || {};
        if (!modalites.parObjectifs || !modalites.parObjectifs.objectifs) return;

        modalites.parObjectifs.objectifs.splice(index, 1);
        db.setSync('modalitesEvaluation', modalites);

        const mode = modalites.parObjectifs.modeCalcul || 'comptage';
        afficherListeObjectifs(modalites.parObjectifs.objectifs, mode);
        if (mode === 'comptage') {
            regenererGrilleConversion();
        }
    }

    /**
     * Sauvegarde les paramètres du mode actuel
     */
    function sauvegarderParametresMode() {
        let modalites = db.getSync('modalitesEvaluation') || {};
        if (!modalites.parObjectifs) {
            modalites.parObjectifs = { ...CONFIG_PAR_OBJECTIFS_DEFAUT };
        }

        const mode = modalites.parObjectifs.modeCalcul || 'comptage';

        switch (mode) {
            case 'comptage':
                if (!modalites.parObjectifs.comptage) modalites.parObjectifs.comptage = {};
                const seuilEl = document.getElementById('v2-comptage-seuil-maitrise');
                if (seuilEl) modalites.parObjectifs.comptage.seuilMaitrise = parseInt(seuilEl.value) || 75;
                const plafondEl = document.getElementById('v2-comptage-plafond-essentiel');
                if (plafondEl) modalites.parObjectifs.comptage.plafondSiEssentielNonMaitrise = parseInt(plafondEl.value) || 55;
                break;

            case 'seuils-critiques':
                if (!modalites.parObjectifs.seuilsCritiques) modalites.parObjectifs.seuilsCritiques = {};
                const seuilReussiteEl = document.getElementById('v2-seuils-niveau-reussite');
                if (seuilReussiteEl) modalites.parObjectifs.seuilsCritiques.seuilReussite = parseInt(seuilReussiteEl.value) || 3;
                const noteBaseEl = document.getElementById('v2-seuils-note-base');
                if (noteBaseEl) modalites.parObjectifs.seuilsCritiques.noteBaseReussite = parseInt(noteBaseEl.value) || 80;
                const bonusEl = document.getElementById('v2-seuils-bonus-niveau4');
                if (bonusEl) modalites.parObjectifs.seuilsCritiques.bonusNiveau4 = parseFloat(bonusEl.value) || 3.33;
                break;

            case 'holistique':
                if (!modalites.parObjectifs.holistique) modalites.parObjectifs.holistique = {};
                const methodeEl = document.getElementById('v2-holistique-methode');
                if (methodeEl) modalites.parObjectifs.holistique.methodeSuggestion = methodeEl.value || 'mode';
                break;
        }

        db.setSync('modalitesEvaluation', modalites);
        afficherNotificationSuccesV2('Configuration sauvegardée');
    }

    /**
     * Régénère la grille de conversion automatiquement selon le nombre d'objectifs
     */
    function regenererGrilleConversion() {
        let modalites = db.getSync('modalitesEvaluation') || {};
        if (!modalites.parObjectifs) return;

        const objectifs = modalites.parObjectifs.objectifs || [];
        const nbObjectifs = objectifs.length;

        if (!modalites.parObjectifs.comptage) {
            modalites.parObjectifs.comptage = {};
        }

        if (nbObjectifs === 0) {
            modalites.parObjectifs.comptage.grilleConversion = {};
            db.setSync('modalitesEvaluation', modalites);
            afficherGrilleConversion({});
            return;
        }

        // Générer une grille linéaire par défaut
        // Note = (nb objectifs maîtrisés / total) × 100
        const grille = {};
        for (let i = 0; i <= nbObjectifs; i++) {
            grille[i] = Math.round((i / nbObjectifs) * 100);
        }

        modalites.parObjectifs.comptage.grilleConversion = grille;
        db.setSync('modalitesEvaluation', modalites);

        afficherGrilleConversion(grille);
    }

    /**
     * Affiche la grille de conversion
     */
    function afficherGrilleConversion(grille) {
        const conteneur = document.getElementById('v2-comptage-grille-conversion');
        if (!conteneur) return;

        if (!grille || Object.keys(grille).length === 0) {
            conteneur.innerHTML = '<div class="alerte-info">Ajoutez des objectifs pour voir la grille de conversion.</div>';
            return;
        }

        let html = `
            <table class="tableau tableau-compact" style="width: 100%;">
                <thead>
                    <tr>
                        <th>Objectifs maîtrisés</th>
                        <th>Note (%)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        Object.keys(grille).sort((a, b) => parseInt(a) - parseInt(b)).forEach(nb => {
            html += `
                <tr>
                    <td>${nb}</td>
                    <td>
                        <input type="number" class="form-control" value="${grille[nb]}"
                               onchange="modifierGrilleConversion(${nb}, this.value)"
                               style="width: 80px; padding: 4px 8px;" min="0" max="100">%
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        conteneur.innerHTML = html;
    }

    /**
     * Modifie une valeur dans la grille de conversion
     */
    function modifierGrilleConversion(nbObjectifs, note) {
        let modalites = db.getSync('modalitesEvaluation') || {};
        if (!modalites.parObjectifs || !modalites.parObjectifs.comptage) return;

        if (!modalites.parObjectifs.comptage.grilleConversion) {
            modalites.parObjectifs.comptage.grilleConversion = {};
        }

        modalites.parObjectifs.comptage.grilleConversion[nbObjectifs] = parseInt(note) || 0;
        db.setSync('modalitesEvaluation', modalites);
    }

    /**
     * Initialise la section par-objectifs si la variante est sélectionnée
     */
    function initialiserParObjectifsV2() {
        let modalites = db.getSync('modalitesEvaluation') || {};

        // Vérifier si la variante est "par-objectifs"
        if (modalites.varianteCalcul === 'par-objectifs') {
            chargerConfigParObjectifs();
        }
    }

    // =========================================================================
    // ALIASES POUR RÉTROCOMPATIBILITÉ (exports anciens noms)
    // =========================================================================

    // Ces fonctions renvoient vers les nouvelles pour rétrocompatibilité
    function chargerConfigComptageObjectifs() {
        return chargerConfigParObjectifs();
    }

    function ajouterObjectifComptage() {
        return ajouterObjectif();
    }

    function modifierNomObjectifComptage(index, nom) {
        return modifierObjectif(index, 'nom', nom);
    }

    function modifierTypeObjectifComptage(index, type) {
        return modifierObjectif(index, 'essentiel', type === 'essentiel');
    }

    function supprimerObjectifComptage(index) {
        return supprimerObjectif(index);
    }

    function sauvegarderComptageObjectifsV2() {
        return sauvegarderParametresMode();
    }

    function initialiserComptageObjectifsV2() {
        return initialiserParObjectifsV2();
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

    // Exports par-objectifs (Beta 95 - variante unifiée avec 4 modes)
    window.chargerConfigParObjectifs = chargerConfigParObjectifs;
    window.changerModeCalculObjectifs = changerModeCalculObjectifs;
    window.afficherListeObjectifs = afficherListeObjectifs;
    window.ajouterObjectif = ajouterObjectif;
    window.modifierObjectif = modifierObjectif;
    window.supprimerObjectif = supprimerObjectif;
    window.sauvegarderParametresMode = sauvegarderParametresMode;
    window.regenererGrilleConversion = regenererGrilleConversion;
    window.afficherGrilleConversion = afficherGrilleConversion;
    window.modifierGrilleConversion = modifierGrilleConversion;
    window.initialiserParObjectifsV2 = initialiserParObjectifsV2;

    // Aliases rétrocompatibilité (anciens noms Beta 95)
    window.chargerConfigComptageObjectifs = chargerConfigComptageObjectifs;
    window.ajouterObjectifComptage = ajouterObjectifComptage;
    window.modifierNomObjectifComptage = modifierNomObjectifComptage;
    window.modifierTypeObjectifComptage = modifierTypeObjectifComptage;
    window.supprimerObjectifComptage = supprimerObjectifComptage;
    window.sauvegarderComptageObjectifsV2 = sauvegarderComptageObjectifsV2;
    window.initialiserComptageObjectifsV2 = initialiserComptageObjectifsV2;

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
