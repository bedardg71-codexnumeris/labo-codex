/**
 * pratique-notation-v2.js
 * Module de gestion de l'onglet Pratique de notation (Beta 95)
 *
 * Gère la configuration pédagogique structurante :
 * - Informations de base (nom, type, description)
 * - Échelle de performance
 * - Structure des évaluations (portfolio, sommative, standards, etc.)
 * - Système de jetons
 * - PAN-Standards par-objectifs (4 modes de calcul)
 * - PAN-Spécifications (types de travaux + forfaits/bundles)
 *
 * Les mêmes données que le wizard remplit progressivement sont accessibles
 * directement ici pour les utilisateurs experts.
 *
 * CHANGELOG :
 * - 26 déc 2025 : Modèles prédéfinis PAN-Spécifications (Chimie, Simple, Littérature)
 *                 Fonction appliquerModeleSpecifications() exportée
 * - 25 déc 2025 : Ajout configuration PAN-Spécifications (types travaux + forfaits)
 * - 24 déc 2025 : Variante par-objectifs unifiée avec 4 modes de calcul
 */

(function() {
    'use strict';


    // =========================================================================
    // INITIALISATION
    // =========================================================================

    /**
     * Initialise l'onglet Pratique de notation v2
     */
    function initialiserPratiqueNotationV2() {

        // Charger le dropdown des échelles
        chargerDropdownEchellesV2();

        // Charger les valeurs depuis modalitesEvaluation
        chargerValeursDepuisStorage();

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
            preview.classList.add('u-hide');
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
            preview.classList.add('u-hide');
            return;
        }

        // Afficher les niveaux
        let html = '<ul style="margin: 0; padding-left: 15px; list-style: none;">';
        echelle.niveaux.forEach(n => {
            html += `<li style="margin-bottom: 4px;"><strong>${n.code}</strong> : ${n.nom} (${n.min}-${n.max}%)</li>`;
        });
        html += '</ul>';

        contenu.innerHTML = html;
        preview.classList.remove('u-hide');

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
            modalites = window.modalitesEvaluation.lire();
        } catch (e) {
            console.error('[pratique-notation-v2] Erreur chargement:', e);
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
            afficherBibliothequeConfigurations(modalites.pratique || '');
            afficherConfigurationType(modalites.pratique || '');
            mettreAJourBadgePratiqueV2(modalites.pratique || '');
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
        const decouplerPN = document.getElementById('v2-decoupler-pn');
        if (decouplerPN) {
            decouplerPN.checked = portfolio.decouplerPN || false;
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

        // Checkbox maître pour activer/désactiver le système de jetons
        const jetonsActif = document.getElementById('v2-jetons-actif');
        if (jetonsActif) {
            jetonsActif.checked = configJetons.jetonsActif !== false;
            // Appliquer l'état visuel
            toggleSystemeJetonsV2(false); // false = ne pas sauvegarder
        }

        const jetonsNombre = document.getElementById('v2-jetons-nombre');
        if (jetonsNombre) {
            jetonsNombre.value = configJetons.nombreParEleve || 2;  // 🆕 Beta 95.7 : défaut 2
        }

        const jetonDelaiActif = document.getElementById('v2-jeton-delai-actif');
        if (jetonDelaiActif) {
            jetonDelaiActif.checked = configJetons.delaiActif !== false;
        }

        const delaiDuree = document.getElementById('v2-delai-duree');
        if (delaiDuree) {
            delaiDuree.value = configJetons.dureeDelaiJours || 2;  // 🆕 Beta 95.7 : défaut 2 jours
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
     * - Comptage (Chimie)
     * - Moyenne pondérée (Mathématiques)
     * - Seuils critiques (Informatique)
     * - Holistique (Biologie)
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
            description: 'Évaluation par objectifs d\'apprentissage avec choix du mode de calcul : <strong>Comptage</strong> (Chimie), <strong>Moyenne pondérée</strong> (Mathématiques), <strong>Seuils critiques</strong> (Informatique), ou <strong>Holistique</strong> (Biologie).',
            exemple: 'Objectifs essentiels/complémentaires | Pondérations variables | Seuils non-linéaires'
        },
        'autre': {
            nom: 'Autre méthode',
            description: 'Décris ta méthode de calcul dans le champ « Description » ci-dessous. Nous pourrons discuter de son implémentation.',
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
        afficherBibliothequeConfigurations(typePratique);
        afficherConfigurationType(typePratique);
        mettreAJourBadgePratiqueV2(typePratique);
        sauvegarderPratiqueBaseV2();
    }

    /**
     * Affiche/masque la bibliothèque de configurations selon le type de pratique
     * Active pour: PAN-Standards (STD) et PAN-Spécifications (SPE)
     * Les configurations appliquent TOUS les paramètres de la pratique sélectionnée
     */
    function afficherBibliothequeConfigurations(type) {
        const conteneur = document.getElementById('v2-bibliotheque-configurations');
        if (!conteneur) return;

        // Afficher pour PAN-Standards ET PAN-Spécifications
        if (type === 'pan-specifications' || type === 'pan-standards') {
            conteneur.classList.remove('u-hide');
            // Charger le dropdown des configurations filtrées par type
            if (typeof chargerDropdownModelesPratiques === 'function') {
                chargerDropdownModelesPratiques();
            }
        } else {
            conteneur.classList.add('u-hide');
        }
    }

    /**
     * Met à jour le badge de pratique dans le titre "Informations de base"
     */
    function mettreAJourBadgePratiqueV2(typePratique) {
        const badge = document.getElementById('v2-badge-pratique');
        if (!badge) return;

        // Session B : représentation routée vers le registre (source unique).
        // Strict → null si pas une famille connue : on masque alors le badge.
        const rep = (typeof obtenirRepresentationPratiqueStricte === 'function')
            ? obtenirRepresentationPratiqueStricte(typePratique) : null;

        if (rep) {
            // Supprimer les anciennes classes de couleur
            badge.classList.remove('som', 'std', 'spe', 'den');
            // Ajouter la nouvelle classe (= code en minuscules)
            badge.classList.add(rep.code.toLowerCase());
            badge.textContent = rep.code;
            badge.classList.remove('u-hide');
        } else {
            badge.classList.add('u-hide');
        }
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
            conteneur.classList.remove('u-hide');
        } else {
            conteneur.classList.add('u-hide');
            // Réinitialiser la sélection si on change de type
            const select = document.getElementById('v2-variante-calcul');
            if (select) select.value = '';
            const desc = document.getElementById('v2-variante-description');
            if (desc) desc.classList.add('u-hide');
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
            descEl.classList.remove('u-hide');
        } else {
            descEl.classList.add('u-hide');
        }

        // ✅ NOUVEAU (Beta 95) : Afficher/masquer la configuration par-objectifs
        const configObjectifs = document.getElementById('v2-config-par-objectifs');
        if (configObjectifs) {
            if (variante === 'par-objectifs') {
                configObjectifs.classList.remove('u-hide');
                // Charger les données de configuration
                chargerConfigParObjectifs();
            } else {
                configObjectifs.classList.add('u-hide');
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
            conteneur.classList.remove('u-hide');
        } else {
            conteneur.classList.add('u-hide');
        }
    }

    /**
     * Affiche la configuration correspondant au type de pratique
     * Taxonomie Beta 95.2 : Sommative, PAN-Standards, PAN-Spécifications, PAN-Dénotation
     */
    function afficherConfigurationType(type) {
        // Masquer toutes les configurations (IDs mat-* du HTML existant)
        const configs = ['mat-config-pan-standards', 'mat-config-sommative',
                        'mat-config-pan-specifications', 'mat-config-defaut'];

        configs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
            }
        });

        // Afficher la configuration correspondante
        let configId = 'mat-config-defaut';
        switch (type) {
            case 'pan-standards':
            case 'pan-maitrise':  // Rétrocompatibilité
                configId = 'mat-config-pan-standards';
                break;
            case 'sommative':
                configId = 'mat-config-sommative';
                break;
            case 'pan-specifications':
            case 'specifications':  // Rétrocompatibilité
                configId = 'mat-config-pan-specifications';
                break;
            case 'pan-denotation':
                configId = 'mat-config-defaut';
                break;
        }

        const config = document.getElementById(configId);
        if (config) config.style.display = '';

        // Charger les données spécifiques au type de pratique
        if (type === 'pan-specifications' || type === 'specifications') {
            chargerConfigSpecifications();
        }
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
            modalites = window.modalitesEvaluation.lire();
        } catch (e) {
            console.error('[pratique-notation-v2] Erreur lecture modalitesEvaluation:', e);
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

        try {
            window.modalitesEvaluation.remplacer(modalites);
        } catch (e) {
            console.error('[pratique-notation-v2] ❌ Erreur sauvegarde:', e);
        }
    }

    /**
     * Sauvegarde la structure des évaluations
     */
    function sauvegarderStructureV2() {
        let modalites = {};
        try {
            modalites = window.modalitesEvaluation.lire();
        } catch (e) {
            modalites = {};
        }

        const type = modalites.pratique || '';

        // Portfolio (PAN-Standards et PAN-Standards utilisent le portfolio)
        // ✅ CORRECTIF (30 déc 2025): Inclure 'pan-standards' en plus de 'pan-maitrise'
        if (type === 'pan-maitrise' || type === 'pan-standards') {
            modalites.portfolio = modalites.portfolio || {};
            modalites.portfolio.methodeSelection = document.getElementById('v2-portfolio-selection')?.value || 'meilleurs';
            modalites.portfolio.nombreARetenir = parseInt(document.getElementById('v2-portfolio-nombre')?.value) || 5;
            modalites.portfolio.minimumCompletion = parseInt(document.getElementById('v2-portfolio-minimum')?.value) || 7;
            modalites.portfolio.nombreTotal = parseInt(document.getElementById('v2-portfolio-total')?.value) || 10;
            modalites.portfolio.decouplerPN = document.getElementById('v2-decoupler-pn')?.checked || false;
        }

        // Standards (ancien format, conservé pour rétrocompatibilité)
        if (type === 'standards') {
            modalites.standards = modalites.standards || {};
            modalites.standards.nombre = parseInt(document.getElementById('v2-standards-nombre')?.value) || 10;
            const terminauxStr = document.getElementById('v2-standards-terminaux')?.value || '';
            modalites.standards.terminaux = terminauxStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        }

        // Spécifications
        if (type === 'specifications' || type === 'pan-specifications') {
            modalites.specifications = modalites.specifications || {};
            modalites.specifications.type = document.getElementById('v2-spec-type')?.value || 'binaire';
        }

        window.modalitesEvaluation.remplacer(modalites);
    }

    /**
     * Sauvegarde la configuration des jetons
     */
    function sauvegarderJetonsV2() {
        // DEBUG: Vérifier les valeurs des inputs
        const inputNombre = document.getElementById('v2-jetons-nombre');
        const inputDelaiDuree = document.getElementById('v2-delai-duree');

        let modalites = {};
        try {
            modalites = window.modalitesEvaluation.lire();
        } catch (e) {
            modalites = {};
        }

        const nombreParEleve = parseInt(inputNombre?.value) || 2;  // 🆕 Beta 95.7 : défaut 2
        const dureeDelaiJours = parseInt(inputDelaiDuree?.value) || 2;  // 🆕 Beta 95.7 : défaut 2 jours


        modalites.configurationJetons = modalites.configurationJetons || {};
        modalites.configurationJetons.jetonsActif = document.getElementById('v2-jetons-actif')?.checked !== false;
        modalites.configurationJetons.nombreParEleve = nombreParEleve;
        modalites.configurationJetons.delaiActif = document.getElementById('v2-jeton-delai-actif')?.checked !== false;
        modalites.configurationJetons.dureeDelaiJours = dureeDelaiJours;
        modalites.configurationJetons.repriseActif = document.getElementById('v2-jeton-reprise-actif')?.checked !== false;

        const repriseOriginale = document.querySelector('input[name="v2-reprise-originale"]:checked');
        modalites.configurationJetons.gestionOriginale = repriseOriginale?.value || 'archiver';

        modalites.configurationJetons.repriseCibleeActif = document.getElementById('v2-jeton-ciblee-actif')?.checked !== false;
        modalites.configurationJetons.plafondCiblee = document.getElementById('v2-ciblee-plafond')?.value || 'D (Développement)';

        // Synchroniser avec configPAN.jetons (format attendu par evaluation-jetons.js)
        modalites.configPAN = modalites.configPAN || {};
        modalites.configPAN.jetons = {
            actif: modalites.configurationJetons.jetonsActif,
            delai: {
                nombre: nombreParEleve,
                dureeJours: dureeDelaiJours
            },
            reprise: {
                nombre: nombreParEleve,
                maxParProduction: 1,
                archiverOriginale: modalites.configurationJetons.gestionOriginale === 'archiver'
            },
            repriseCiblee: {
                actif: modalites.configurationJetons.repriseCibleeActif,
                plafondNote: modalites.configurationJetons.plafondCiblee
            }
        };

        window.modalitesEvaluation.remplacer(modalites);
    }

    /**
     * Active/désactive visuellement le système de jetons
     * @param {boolean} doitSauvegarder - true pour sauvegarder après toggle (défaut: true)
     */
    function toggleSystemeJetonsV2(doitSauvegarder = true) {
        const checkbox = document.getElementById('v2-jetons-actif');
        const contenu = document.getElementById('contenu-jetons-v2');

        if (!checkbox || !contenu) {
            console.warn('[toggleSystemeJetonsV2] Éléments non trouvés');
            return;
        }

        const actif = checkbox.checked;
        toggleDisplay(contenu, actif);

        // Optionnel : ajouter une classe pour le style
        contenu.classList.toggle('jetons-desactive', !actif);


        if (doitSauvegarder) {
            sauvegarderJetonsV2();
        }
    }

    // Exposer la fonction globalement pour l'événement onchange
    window.toggleSystemeJetonsV2 = toggleSystemeJetonsV2;

    /**
     * Sauvegarde toute la configuration
     */
    function sauvegarderToutePratiqueV2() {
        sauvegarderPratiqueBaseV2();
        sauvegarderStructureV2();
        sauvegarderJetonsV2();

        // Afficher notification
        notifications.succes('Pratique de notation sauvegardée avec succès');
    }

    // =========================================================================
    // GESTION PAR-OBJECTIFS (4 modes : Comptage, Moyenne pondérée, Seuils critiques, Holistique)
    // =========================================================================

    /**
     * Les 4 modes de calcul disponibles
     */
    const MODES_CALCUL_OBJECTIFS = {
        'comptage': {
            nom: 'Comptage (Chimie)',
            description: 'Note = nombre d\'objectifs maîtrisés. Plafond si essentiels non maîtrisés.'
        },
        'moyenne-ponderee': {
            nom: 'Moyenne pondérée (Mathématiques)',
            description: 'Note = moyenne des niveaux × pondération de chaque objectif.'
        },
        'seuils-critiques': {
            nom: 'Seuils critiques (Informatique)',
            description: 'Tous les objectifs doivent atteindre niveau 3+. Bonus pour niveau 4.'
        },
        'holistique': {
            nom: 'Holistique (Biologie)',
            description: 'Suggestion statistique + validation par l\'enseignant.'
        }
    };

    /**
     * Structure par défaut pour le système par objectifs
     */
    const CONFIG_PAR_OBJECTIFS_DEFAUT = {
        modeCalcul: 'comptage',
        objectifs: [],
        // Paramètres mode Comptage
        comptage: {
            seuilMaitrise: 75,
            plafondSiEssentielNonMaitrise: 55,
            grilleConversion: {}
        },
        // Paramètres mode Moyenne pondérée
        moyennePonderee: {
            // Les pondérations sont dans les objectifs
        },
        // Paramètres mode Seuils critiques
        seuilsCritiques: {
            seuilReussite: 3,
            noteBaseReussite: 80,
            bonusNiveau4: 3.33
        },
        // Paramètres mode Holistique
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
            modalites = window.modalitesEvaluation.lire();
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
            window.modalitesEvaluation.remplacer(modalites);
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
                toggleDisplay(section, s === mode);
            }
        });

        // Afficher la description du mode
        const descEl = document.getElementById('v2-objectifs-mode-description');
        if (descEl && MODES_CALCUL_OBJECTIFS[mode]) {
            descEl.textContent = MODES_CALCUL_OBJECTIFS[mode].description;
            descEl.classList.remove('u-hide');
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
        const modalites = window.modalitesEvaluation.lire();
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
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.parObjectifs) {
            modalites.parObjectifs = { ...CONFIG_PAR_OBJECTIFS_DEFAUT };
        }

        const modeEl = document.getElementById('v2-objectifs-mode-calcul');
        if (modeEl) {
            modalites.parObjectifs.modeCalcul = modeEl.value;
        }

        window.modalitesEvaluation.remplacer(modalites);
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
                    Aucun objectif configuré. Utilise le bouton « + Ajouter un objectif » pour commencer.
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
                               data-on-change="_onChangeObjectifNom" data-param="${index}"
                               style="width: 100%; padding: 4px 8px;">
                    </td>
            `;

            if (showType) {
                html += `
                    <td>
                        <select class="form-control" data-on-change="_onChangeObjectifEssentiel" data-param="${index}"
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
                               data-on-change="_onChangeObjectifPonderation" data-param="${index}"
                               style="width: 70px; padding: 4px 8px;" min="0" max="100" step="0.5">%
                    </td>
                `;
            }

            html += `
                    <td style="text-align: center;">
                        <button type="button" class="btn btn-danger btn-tres-compact"
                                data-action="supprimerObjectif" data-param="${index}"
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
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.parObjectifs) {
            modalites.parObjectifs = { ...CONFIG_PAR_OBJECTIFS_DEFAUT };
        }

        const objectifs = modalites.parObjectifs.objectifs || [];
        const nouvelIndex = objectifs.length + 1;
        const mode = modalites.parObjectifs.modeCalcul || 'comptage';

        objectifs.push({
            id: genererIdUnique('PN_'),
            nom: `Objectif ${nouvelIndex}`,
            essentiel: true,
            ponderation: mode === 'moyenne-ponderee' ? 10 : 0,
            description: ''
        });

        modalites.parObjectifs.objectifs = objectifs;
        window.modalitesEvaluation.remplacer(modalites);

        afficherListeObjectifs(objectifs, mode);
        if (mode === 'comptage') {
            regenererGrilleConversion();
        }
    }

    /**
     * Modifie une propriété d'un objectif
     */
    function modifierObjectif(index, propriete, valeur) {
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.parObjectifs || !modalites.parObjectifs.objectifs) return;

        modalites.parObjectifs.objectifs[index][propriete] = valeur;
        window.modalitesEvaluation.remplacer(modalites);

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
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.parObjectifs || !modalites.parObjectifs.objectifs) return;

        modalites.parObjectifs.objectifs.splice(index, 1);
        window.modalitesEvaluation.remplacer(modalites);

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
        let modalites = window.modalitesEvaluation.lire();
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

        window.modalitesEvaluation.remplacer(modalites);
        notifications.succes('Configuration sauvegardée');
    }

    /**
     * Régénère la grille de conversion automatiquement selon le nombre d'objectifs
     */
    function regenererGrilleConversion() {
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.parObjectifs) return;

        const objectifs = modalites.parObjectifs.objectifs || [];
        const nbObjectifs = objectifs.length;

        if (!modalites.parObjectifs.comptage) {
            modalites.parObjectifs.comptage = {};
        }

        if (nbObjectifs === 0) {
            modalites.parObjectifs.comptage.grilleConversion = {};
            window.modalitesEvaluation.remplacer(modalites);
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
        window.modalitesEvaluation.remplacer(modalites);

        afficherGrilleConversion(grille);
    }

    /**
     * Affiche la grille de conversion
     */
    function afficherGrilleConversion(grille) {
        const conteneur = document.getElementById('v2-comptage-grille-conversion');
        if (!conteneur) return;

        if (!grille || Object.keys(grille).length === 0) {
            conteneur.innerHTML = '<div class="alerte-info">Ajoute des objectifs pour voir la grille de conversion.</div>';
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
                               data-on-change="_onChangeGrilleConversion" data-param="${nb}"
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
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.parObjectifs || !modalites.parObjectifs.comptage) return;

        if (!modalites.parObjectifs.comptage.grilleConversion) {
            modalites.parObjectifs.comptage.grilleConversion = {};
        }

        modalites.parObjectifs.comptage.grilleConversion[nbObjectifs] = parseInt(note) || 0;
        window.modalitesEvaluation.remplacer(modalites);
    }

    /**
     * Initialise la section par-objectifs si la variante est sélectionnée
     */
    function initialiserParObjectifsV2() {
        let modalites = window.modalitesEvaluation.lire();

        // Vérifier si la variante est "par-objectifs"
        if (modalites.varianteCalcul === 'par-objectifs') {
            chargerConfigParObjectifs();
        }
    }

    // =========================================================================
    // GESTION PAN-SPÉCIFICATIONS (Types de travaux + Forfaits)
    // Basé sur une pratique en Chimie et Linda B. Nilson (2015)
    // =========================================================================

    /**
     * Configuration par défaut pour PAN-Spécifications
     */
    const CONFIG_SPECIFICATIONS_DEFAUT = {
        seuilAcceptable: 75,
        typesTravaux: [
            { id: 1, nom: 'Prise de position', description: 'Travail écrit argumentatif' },
            { id: 2, nom: 'Test', description: 'Évaluation des connaissances' },
            { id: 3, nom: 'Portfolio', description: 'Dossier d\'apprentissage' }
        ],
        forfaits: [
            { id: 1, lettre: 'A', note: 100, travaux: { 1: 2, 2: 2, 3: 1 } },
            { id: 2, lettre: 'B', note: 80, travaux: { 1: 2, 2: 1, 3: 1 } },
            { id: 3, lettre: 'C', note: 60, travaux: { 1: 1, 2: 1, 3: 0 } }
        ]
    };

    /**
     * Charge la configuration PAN-Spécifications depuis le storage
     */
    function chargerConfigSpecifications() {
        let modalites = {};
        try {
            modalites = window.modalitesEvaluation.lire();
        } catch (e) {
            modalites = {};
        }

        const config = modalites.specifications || CONFIG_SPECIFICATIONS_DEFAUT;

        // Seuil d'acceptabilité
        const seuilEl = document.getElementById('v2-spec-seuil');
        if (seuilEl) {
            seuilEl.value = config.seuilAcceptable || 75;
        }

        // Afficher les types de travaux
        afficherTypesTravauxSpec(config.typesTravaux || []);

        // Afficher les forfaits
        afficherForfaitsSpec(config.forfaits || [], config.typesTravaux || []);

        // Charger le dropdown des modèles de pratiques (Beta 95)
        if (typeof chargerDropdownModelesPratiques === 'function') {
            chargerDropdownModelesPratiques();
        }

        return config;
    }

    /**
     * Sauvegarde la configuration PAN-Spécifications
     */
    function sauvegarderConfigSpecifications() {
        let modalites = {};
        try {
            modalites = window.modalitesEvaluation.lire();
        } catch (e) {
            modalites = {};
        }

        if (!modalites.specifications) {
            modalites.specifications = { ...CONFIG_SPECIFICATIONS_DEFAUT };
        }

        // Seuil d'acceptabilité
        const seuilEl = document.getElementById('v2-spec-seuil');
        if (seuilEl) {
            modalites.specifications.seuilAcceptable = parseInt(seuilEl.value) || 75;
        }

        window.modalitesEvaluation.remplacer(modalites);
    }

    // -------------------------------------------------------------------------
    // TYPES DE TRAVAUX
    // -------------------------------------------------------------------------

    /**
     * Affiche la liste des types de productions
     */
    function afficherTypesTravauxSpec(typesTravaux) {
        const conteneur = document.getElementById('v2-spec-types-travaux-liste');
        if (!conteneur) return;

        // Charger aussi le dropdown des productions
        chargerDropdownProductionsSpec();

        if (!typesTravaux || typesTravaux.length === 0) {
            conteneur.innerHTML = `
                <div class="alerte-info" style="padding: 10px; margin: 10px 0;">
                    Aucun type de production configuré. Sélectionne depuis la bibliothèque ou ajoute manuellement.
                </div>
            `;
            return;
        }

        let html = `
            <table class="tableau tableau-compact" style="width: 100%;">
                <thead>
                    <tr>
                        <th style="width: 40px;">#</th>
                        <th>Type de production</th>
                        <th>Description</th>
                        <th style="width: 70px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        typesTravaux.forEach((type, index) => {
            html += `
                <tr data-id="${type.id}">
                    <td>${index + 1}</td>
                    <td>
                        <input type="text" class="form-control" value="${type.nom || ''}"
                               data-on-change="_onChangeTypeTravailNom" data-param="${type.id}"
                               style="width: 100%; padding: 4px 8px;">
                    </td>
                    <td>
                        <input type="text" class="form-control" value="${type.description || ''}"
                               data-on-change="_onChangeTypeTravailDescription" data-param="${type.id}"
                               placeholder="Ex: Analyse littéraire"
                               style="width: 100%; padding: 4px 8px;">
                    </td>
                    <td style="text-align: center;">
                        <button type="button" class="btn btn-danger btn-tres-compact"
                                data-action="supprimerTypeTravailSpecV2" data-param="${type.id}"
                                title="Supprimer ce type">
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
     * Charge le dropdown des productions depuis la bibliothèque et les productions du cours
     */
    async function chargerDropdownProductionsSpec() {
        const dropdown = document.getElementById('v2-spec-dropdown-productions');
        if (!dropdown) return;

        dropdown.innerHTML = '<option value="">-- Sélectionner une production --</option>';

        // 1. Productions du cours actuel
        let productionsCours = [];
        try {
            productionsCours = await db.get(cle('productions')) || [];
        } catch (e) {
            productionsCours = [];
        }

        // 2. Productions de la bibliothèque
        let productionsBiblio = [];
        try {
            if (typeof obtenirToutesLesProductionsBibliotheque === 'function') {
                productionsBiblio = await obtenirToutesLesProductionsBibliotheque();
            } else if (typeof window.obtenirToutesLesProductionsBibliothequeSync === 'function') {
                productionsBiblio = window.obtenirToutesLesProductionsBibliothequeSync();
            }
        } catch (e) {
            productionsBiblio = [];
        }

        // Groupe : Productions du cours
        if (productionsCours.length > 0) {
            const optgroup1 = document.createElement('optgroup');
            optgroup1.label = 'Productions du cours';
            productionsCours.forEach(p => {
                if (!p || !p.id) return;
                const option = document.createElement('option');
                option.value = JSON.stringify({ id: p.id, titre: p.titre, description: p.description || '', source: 'cours' });
                option.textContent = p.titre || p.id;
                optgroup1.appendChild(option);
            });
            dropdown.appendChild(optgroup1);
        }

        // Groupe : Bibliothèque
        if (productionsBiblio.length > 0) {
            const optgroup2 = document.createElement('optgroup');
            optgroup2.label = 'Bibliothèque partagée';
            productionsBiblio.forEach(p => {
                if (!p || !p.id) return;
                const option = document.createElement('option');
                option.value = JSON.stringify({ id: p.id, titre: p.titre, description: p.description || '', source: 'biblio' });
                option.textContent = p.titre || p.id;
                optgroup2.appendChild(option);
            });
            dropdown.appendChild(optgroup2);
        }

        // Message si aucune production
        if (productionsCours.length === 0 && productionsBiblio.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '(Aucune production disponible)';
            option.disabled = true;
            dropdown.appendChild(option);
        }
    }

    /**
     * Importe une production depuis le dropdown vers les types de productions
     */
    function importerProductionDepuisBibliothequeSpec() {
        const dropdown = document.getElementById('v2-spec-dropdown-productions');
        if (!dropdown || !dropdown.value) {
            alert('Veuillez sélectionner une production.');
            return;
        }

        let prodData;
        try {
            prodData = JSON.parse(dropdown.value);
        } catch (e) {
            console.error('[pratique-notation-v2] Erreur parsing production:', e);
            return;
        }

        // Ajouter comme type de production
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.specifications) {
            modalites.specifications = { ...CONFIG_SPECIFICATIONS_DEFAUT };
        }

        const typesTravaux = modalites.specifications.typesTravaux || [];

        // Vérifier si déjà présent
        const dejaPresent = typesTravaux.some(t => t.nom === prodData.titre);
        if (dejaPresent) {
            alert('Cette production est déjà dans la liste.');
            return;
        }

        const nouvelId = typesTravaux.length > 0
            ? Math.max(...typesTravaux.map(t => t.id)) + 1
            : 1;

        typesTravaux.push({
            id: nouvelId,
            nom: prodData.titre,
            description: prodData.description || '',
            productionId: prodData.id,
            source: prodData.source
        });

        modalites.specifications.typesTravaux = typesTravaux;
        window.modalitesEvaluation.remplacer(modalites);

        // Rafraîchir l'affichage
        afficherTypesTravauxSpec(typesTravaux);
        afficherForfaitsSpec(modalites.specifications.forfaits || [], typesTravaux);

        // Reset dropdown
        dropdown.value = '';

    }

    /**
     * Ajoute un nouveau type de travail
     */
    function ajouterTypeTravailSpec() {
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.specifications) {
            modalites.specifications = { ...CONFIG_SPECIFICATIONS_DEFAUT };
        }

        const typesTravaux = modalites.specifications.typesTravaux || [];
        const nouvelId = typesTravaux.length > 0
            ? Math.max(...typesTravaux.map(t => t.id)) + 1
            : 1;

        typesTravaux.push({
            id: nouvelId,
            nom: `Type ${nouvelId}`,
            description: ''
        });

        modalites.specifications.typesTravaux = typesTravaux;
        window.modalitesEvaluation.remplacer(modalites);

        afficherTypesTravauxSpec(typesTravaux);
        // Rafraîchir aussi les forfaits pour inclure le nouveau type
        afficherForfaitsSpec(modalites.specifications.forfaits || [], typesTravaux);
    }

    /**
     * Modifie une propriété d'un type de travail
     */
    function modifierTypeTravailSpec(id, propriete, valeur) {
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.specifications || !modalites.specifications.typesTravaux) return;

        const type = modalites.specifications.typesTravaux.find(t => t.id === id);
        if (type) {
            type[propriete] = valeur;
            window.modalitesEvaluation.remplacer(modalites);

            // Rafraîchir les forfaits si le nom a changé
            if (propriete === 'nom') {
                afficherForfaitsSpec(
                    modalites.specifications.forfaits || [],
                    modalites.specifications.typesTravaux
                );
            }
        }
    }

    /**
     * Supprime un type de travail
     */
    function supprimerTypeTravailSpec(id) {
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.specifications || !modalites.specifications.typesTravaux) return;

        // Vérifier si le type est utilisé dans des forfaits
        const forfaits = modalites.specifications.forfaits || [];
        const estUtilise = forfaits.some(f => f.travaux && f.travaux[id] > 0);

        if (estUtilise) {
            if (!confirm('Ce type est utilisé dans des forfaits. Le supprimer retirera aussi les références dans les forfaits. Continuer ?')) {
                return;
            }
            // Supprimer les références dans les forfaits
            forfaits.forEach(f => {
                if (f.travaux && f.travaux[id]) {
                    delete f.travaux[id];
                }
            });
        }

        modalites.specifications.typesTravaux = modalites.specifications.typesTravaux.filter(t => t.id !== id);
        window.modalitesEvaluation.remplacer(modalites);

        afficherTypesTravauxSpec(modalites.specifications.typesTravaux);
        afficherForfaitsSpec(modalites.specifications.forfaits || [], modalites.specifications.typesTravaux);
    }

    // -------------------------------------------------------------------------
    // FORFAITS (BUNDLES)
    // -------------------------------------------------------------------------

    /**
     * Affiche la table des forfaits
     */
    function afficherForfaitsSpec(forfaits, typesTravaux) {
        const conteneur = document.getElementById('v2-spec-forfaits-liste');
        if (!conteneur) return;

        if (!typesTravaux || typesTravaux.length === 0) {
            conteneur.innerHTML = `
                <div class="alerte-info" style="padding: 10px; margin: 10px 0;">
                    Définissez d'abord les types de productions ci-dessus avant de créer des forfaits.
                </div>
            `;
            return;
        }

        if (!forfaits || forfaits.length === 0) {
            conteneur.innerHTML = `
                <div class="alerte-info" style="padding: 10px; margin: 10px 0;">
                    Aucun forfait configuré. Utilise le bouton ci-dessous pour créer tes forfaits.
                </div>
            `;
            return;
        }

        // Construire l'en-tête avec les types de travaux
        let html = `
            <div style="overflow-x: auto;">
            <table class="tableau tableau-compact" style="width: 100%; min-width: 500px;">
                <thead>
                    <tr>
                        <th style="width: 60px;">Forfait</th>
                        <th style="width: 80px;">Note (%)</th>
        `;

        typesTravaux.forEach(type => {
            html += `<th style="min-width: 80px; text-align: center;" title="${type.description || ''}">${type.nom}</th>`;
        });

        html += `
                        <th style="width: 70px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Trier les forfaits par note décroissante
        const forfaitsTries = [...forfaits].sort((a, b) => b.note - a.note);

        forfaitsTries.forEach(forfait => {
            html += `
                <tr data-id="${forfait.id}">
                    <td>
                        <input type="text" class="form-control" value="${forfait.lettre || ''}"
                               data-on-change="_onChangeForfaitLettre" data-param="${forfait.id}"
                               style="width: 50px; padding: 4px 8px; text-align: center; font-weight: bold;">
                    </td>
                    <td>
                        <input type="number" class="form-control" value="${forfait.note || 0}"
                               data-on-change="_onChangeForfaitNote" data-param="${forfait.id}"
                               style="width: 70px; padding: 4px 8px;" min="0" max="100">
                    </td>
            `;

            typesTravaux.forEach(type => {
                const quantite = (forfait.travaux && forfait.travaux[type.id]) || 0;
                html += `
                    <td style="text-align: center;">
                        <input type="number" class="form-control" value="${quantite}"
                               data-on-change="_onChangeTravailForfait" data-param="${forfait.id}_${type.id}"
                               style="width: 50px; padding: 4px 8px; text-align: center;" min="0" max="20">
                    </td>
                `;
            });

            html += `
                    <td style="text-align: center;">
                        <button type="button" class="btn btn-danger btn-tres-compact"
                                data-action="supprimerForfaitSpec" data-param="${forfait.id}"
                                title="Supprimer ce forfait">
                            ✕
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';

        // Légende
        html += `
            <p class="text-muted" style="font-size: 0.8rem; margin-top: 10px;">
                <strong>Lecture</strong> : Pour obtenir le forfait A (100%), l'étudiant doit avoir complété
                le nombre requis de chaque type de production indiqué dans la ligne.
            </p>
        `;

        conteneur.innerHTML = html;
    }

    /**
     * Ajoute un nouveau forfait
     */
    function ajouterForfaitSpec() {
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.specifications) {
            modalites.specifications = { ...CONFIG_SPECIFICATIONS_DEFAUT };
        }

        const forfaits = modalites.specifications.forfaits || [];
        const typesTravaux = modalites.specifications.typesTravaux || [];

        if (typesTravaux.length === 0) {
            alert('Veuillez d\'abord ajouter des types de productions.');
            return;
        }

        const nouvelId = forfaits.length > 0
            ? Math.max(...forfaits.map(f => f.id)) + 1
            : 1;

        // Générer une lettre (D, E, F... après A, B, C)
        const lettresUtilisees = forfaits.map(f => f.lettre);
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let nouvelleLlettre = 'D';
        for (let i = 0; i < alphabet.length; i++) {
            if (!lettresUtilisees.includes(alphabet[i])) {
                nouvelleLlettre = alphabet[i];
                break;
            }
        }

        // Initialiser les travaux à 0 pour chaque type
        const travaux = {};
        typesTravaux.forEach(t => {
            travaux[t.id] = 0;
        });

        forfaits.push({
            id: nouvelId,
            lettre: nouvelleLlettre,
            note: 70,
            travaux: travaux
        });

        modalites.specifications.forfaits = forfaits;
        window.modalitesEvaluation.remplacer(modalites);

        afficherForfaitsSpec(forfaits, typesTravaux);
    }

    /**
     * Modifie une propriété d'un forfait
     */
    function modifierForfaitSpec(id, propriete, valeur) {
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.specifications || !modalites.specifications.forfaits) return;

        const forfait = modalites.specifications.forfaits.find(f => f.id === id);
        if (forfait) {
            forfait[propriete] = valeur;
            window.modalitesEvaluation.remplacer(modalites);

            // Rafraîchir l'affichage si la note a changé (pour re-trier)
            if (propriete === 'note') {
                afficherForfaitsSpec(
                    modalites.specifications.forfaits,
                    modalites.specifications.typesTravaux || []
                );
            }
        }
    }

    /**
     * Modifie la quantité d'un type de travail dans un forfait
     */
    function modifierTravailForfaitSpec(forfaitId, typeId, quantite) {
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.specifications || !modalites.specifications.forfaits) return;

        const forfait = modalites.specifications.forfaits.find(f => f.id === forfaitId);
        if (forfait) {
            if (!forfait.travaux) forfait.travaux = {};
            forfait.travaux[typeId] = quantite || 0;
            window.modalitesEvaluation.remplacer(modalites);
        }
    }

    /**
     * Supprime un forfait
     */
    function supprimerForfaitSpec(id) {
        let modalites = window.modalitesEvaluation.lire();
        if (!modalites.specifications || !modalites.specifications.forfaits) return;

        modalites.specifications.forfaits = modalites.specifications.forfaits.filter(f => f.id !== id);
        window.modalitesEvaluation.remplacer(modalites);

        afficherForfaitsSpec(
            modalites.specifications.forfaits,
            modalites.specifications.typesTravaux || []
        );
    }

    // -------------------------------------------------------------------------
    // MODÈLES PRÉDÉFINIS (Mode exploratoire)
    // -------------------------------------------------------------------------

    /**
     * Définitions des modèles prédéfinis pour PAN-Spécifications
     */
    const MODELES_SPECIFICATIONS = {
        'modele-francois': {
            nom: 'Modèle Chimie',
            description: 'Basé sur une pratique en Chimie',
            typesTravaux: [
                { id: 1, nom: 'Prise de position', description: 'Travail écrit argumentatif' },
                { id: 2, nom: 'Test', description: 'Évaluation des connaissances' },
                { id: 3, nom: 'Portfolio', description: 'Dossier d\'apprentissage' }
            ],
            forfaits: [
                { id: 1, lettre: 'A', note: 100, travaux: { 1: 2, 2: 2, 3: 1 } },
                { id: 2, lettre: 'B', note: 80, travaux: { 1: 2, 2: 1, 3: 1 } },
                { id: 3, lettre: 'C', note: 60, travaux: { 1: 1, 2: 1, 3: 0 } }
            ]
        },
        'modele-simple': {
            nom: 'Modèle simple',
            description: 'Pour commencer avec PAN-Spécifications',
            typesTravaux: [
                { id: 1, nom: 'Projet', description: 'Travail pratique ou créatif' },
                { id: 2, nom: 'Examen', description: 'Évaluation sommative' }
            ],
            forfaits: [
                { id: 1, lettre: 'Excellence', note: 90, travaux: { 1: 2, 2: 1 } },
                { id: 2, lettre: 'Réussite', note: 70, travaux: { 1: 1, 2: 1 } }
            ]
        },
        'modele-litterature': {
            nom: 'Modèle littérature',
            description: 'Adapté aux cours de français et littérature',
            typesTravaux: [
                { id: 1, nom: 'Analyse littéraire', description: 'Analyse d\'un texte ou d\'une œuvre' },
                { id: 2, nom: 'Dissertation', description: 'Texte argumentatif structuré' },
                { id: 3, nom: 'Portfolio de lecture', description: 'Traces de lecture et réflexions' }
            ],
            forfaits: [
                { id: 1, lettre: 'A', note: 100, travaux: { 1: 2, 2: 1, 3: 1 } },
                { id: 2, lettre: 'B', note: 80, travaux: { 1: 2, 2: 1, 3: 0 } },
                { id: 3, lettre: 'C', note: 60, travaux: { 1: 1, 2: 1, 3: 0 } }
            ]
        }
    };

    /**
     * Applique un modèle prédéfini pour PAN-Spécifications
     * Appelé depuis le wizard Primo (mode exploratoire)
     */
    function appliquerModeleSpecifications(modeleId) {
        const modele = MODELES_SPECIFICATIONS[modeleId];
        if (!modele) {
            console.warn('[pratique-notation-v2] Modèle inconnu:', modeleId);
            return false;
        }

        let modalites = {};
        try {
            modalites = window.modalitesEvaluation.lire();
        } catch (e) {
            modalites = {};
        }

        // Initialiser specifications si nécessaire
        if (!modalites.specifications) {
            modalites.specifications = {};
        }

        // Appliquer le modèle
        modalites.specifications.typesTravaux = JSON.parse(JSON.stringify(modele.typesTravaux));
        modalites.specifications.forfaits = JSON.parse(JSON.stringify(modele.forfaits));
        modalites.specifications.modeleChoisi = modeleId;
        modalites.specifications.modeleNom = modele.nom;

        // Conserver le seuil d'acceptabilité s'il existe déjà
        if (!modalites.specifications.seuilAcceptable) {
            modalites.specifications.seuilAcceptable = 75;
        }

        window.modalitesEvaluation.remplacer(modalites);

        return true;
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

    // =========================================================================
    // WRAPPERS POUR DÉLÉGATION data-on-change (Phase 5)
    // =========================================================================

    /** Wrapper: modifierObjectif(index, 'nom', el.value) */
    function _onChangeObjectifNom(index, el) {
        modifierObjectif(index, 'nom', el.value);
    }
    /** Wrapper: modifierObjectif(index, 'essentiel', el.value === 'essentiel') */
    function _onChangeObjectifEssentiel(index, el) {
        modifierObjectif(index, 'essentiel', el.value === 'essentiel');
    }
    /** Wrapper: modifierObjectif(index, 'ponderation', parseFloat(el.value)) */
    function _onChangeObjectifPonderation(index, el) {
        modifierObjectif(index, 'ponderation', parseFloat(el.value));
    }
    /** Wrapper: modifierGrilleConversion(nb, el.value) */
    function _onChangeGrilleConversion(nb, el) {
        modifierGrilleConversion(nb, el.value);
    }
    /** Wrapper: modifierTypeTravailSpecV2(id, 'nom', el.value) */
    function _onChangeTypeTravailNom(id, el) {
        modifierTypeTravailSpec(id, 'nom', el.value);
    }
    /** Wrapper: modifierTypeTravailSpecV2(id, 'description', el.value) */
    function _onChangeTypeTravailDescription(id, el) {
        modifierTypeTravailSpec(id, 'description', el.value);
    }
    /** Wrapper: modifierForfaitSpec(id, 'lettre', el.value) */
    function _onChangeForfaitLettre(id, el) {
        modifierForfaitSpec(id, 'lettre', el.value);
    }
    /** Wrapper: modifierForfaitSpec(id, 'note', parseInt(el.value)) */
    function _onChangeForfaitNote(id, el) {
        modifierForfaitSpec(id, 'note', parseInt(el.value));
    }
    /** Wrapper: modifierTravailForfaitSpec(forfaitId, typeId, parseInt(el.value)) — param = "forfaitId_typeId" */
    function _onChangeTravailForfait(compositeParam, el) {
        var parts = String(compositeParam).split('_');
        var forfaitId = parseInt(parts[0]);
        var typeId = parseInt(parts[1]);
        modifierTravailForfaitSpec(forfaitId, typeId, parseInt(el.value));
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

    // Exports PAN-Spécifications (Beta 95)
    window.chargerConfigSpecifications = chargerConfigSpecifications;
    window.sauvegarderConfigSpecifications = sauvegarderConfigSpecifications;
    window.afficherTypesTravauxSpec = afficherTypesTravauxSpec;
    window.chargerDropdownProductionsSpec = chargerDropdownProductionsSpec;
    window.importerProductionDepuisBibliothequeSpec = importerProductionDepuisBibliothequeSpec;
    window.ajouterTypeTravailSpecV2 = ajouterTypeTravailSpec;
    window.modifierTypeTravailSpecV2 = modifierTypeTravailSpec;
    window.supprimerTypeTravailSpecV2 = supprimerTypeTravailSpec;
    window.afficherForfaitsSpec = afficherForfaitsSpec;
    window.ajouterForfaitSpec = ajouterForfaitSpec;
    window.modifierForfaitSpec = modifierForfaitSpec;
    window.modifierTravailForfaitSpec = modifierTravailForfaitSpec;
    window.supprimerForfaitSpec = supprimerForfaitSpec;
    window.appliquerModeleSpecifications = appliquerModeleSpecifications;

    // Exports wrappers délégation (Phase 5)
    window._onChangeObjectifNom = _onChangeObjectifNom;
    window._onChangeObjectifEssentiel = _onChangeObjectifEssentiel;
    window._onChangeObjectifPonderation = _onChangeObjectifPonderation;
    window._onChangeGrilleConversion = _onChangeGrilleConversion;
    window._onChangeTypeTravailNom = _onChangeTypeTravailNom;
    window._onChangeTypeTravailDescription = _onChangeTypeTravailDescription;
    window._onChangeForfaitLettre = _onChangeForfaitLettre;
    window._onChangeForfaitNote = _onChangeForfaitNote;
    window._onChangeTravailForfait = _onChangeTravailForfait;

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


})();
