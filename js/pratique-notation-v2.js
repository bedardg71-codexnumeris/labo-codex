/**
 * pratique-notation-v2.js
 * Moteur de rendu/configuration des pratiques de notation.
 *
 * Consommé par pratiques-bibliotheque.js pour afficher et éditer la
 * configuration pédagogique structurante d'une pratique :
 * - PAN-Standards par-objectifs (modes de calcul) — chargerConfigParObjectifs
 * - PAN-Spécifications (types de travaux + forfaits/bundles) —
 *   chargerConfigSpecifications, afficherTypesTravauxSpec, afficherForfaitsSpec
 *
 * NOTE (#338, juin 2026) : l'ancien éditeur autonome « onglet Pratique de
 * notation v2 » (bootstrap initialiserPratiqueNotationV2 + chaîne de
 * chargement/sauvegarde/type-selection sur le DOM `v2-pratique-type` disparu)
 * a été retiré — 743 lignes mortes. Ne subsistent que les fonctions
 * réellement atteintes par la bibliothèque et les handlers data-action /
 * data-on-change rendus dans son panneau de configuration.
 *
 * CHANGELOG :
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

    // =========================================================================
    // DROPDOWN ÉCHELLES
    // =========================================================================

    /**
     * Charge la liste des échelles dans le dropdown
     */

    /**
     * Affiche l'aperçu de l'échelle sélectionnée
     */

    // =========================================================================
    // CHARGEMENT DEPUIS STORAGE
    // =========================================================================

    /**
     * Charge les valeurs depuis modalitesEvaluation vers les champs
     */

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
     * - Comptage
     * - Moyenne pondérée
     * - Seuils critiques
     * - Holistique
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
            description: 'Évaluation par objectifs d\'apprentissage avec choix du mode de calcul : <strong>Comptage</strong>, <strong>Moyenne pondérée</strong>, <strong>Seuils critiques</strong>, ou <strong>Holistique</strong>.',
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

    /**
     * Affiche/masque la bibliothèque de configurations selon le type de pratique
     * Active pour: PAN-Standards (STD) et PAN-Spécifications (SPE)
     * Les configurations appliquent TOUS les paramètres de la pratique sélectionnée
     */

    /**
     * Met à jour le badge de pratique dans le titre "Informations de base"
     */

    /**
     * Affiche/masque le sélecteur de variante PAN-Standards
     */

    /**
     * Affiche la description taxonomique correspondant au type sélectionné
     */

    /**
     * Affiche la configuration correspondant au type de pratique
     * Taxonomie Beta 95.2 : Sommative, PAN-Standards, PAN-Spécifications, PAN-Dénotation
     */

    // =========================================================================
    // SAUVEGARDE
    // =========================================================================

    /**
     * Sauvegarde la structure des évaluations
     */

    /**
     * Sauvegarde la configuration des jetons
     */

    /**
     * Active/désactive visuellement le système de jetons
     * @param {boolean} doitSauvegarder - true pour sauvegarder après toggle (défaut: true)
     */

    // Exposer la fonction globalement pour l'événement onchange

    /**
     * Sauvegarde toute la configuration
     */

    // =========================================================================
    // GESTION PAR-OBJECTIFS (4 modes : Comptage, Moyenne pondérée, Seuils critiques, Holistique)
    // =========================================================================

    /**
     * Les 4 modes de calcul disponibles.
     *
     * ⚠ #687 — CE SONT DES MÉCANIQUES, PAS DES DISCIPLINES. Chacun portait une
     * matière entre parenthèses (« Comptage (Chimie) »), comme si le mode
     * appartenait à qui l'avait inspiré. On retire la parenthèse, on ne
     * supprime rien : le calcul, lui, est réel et sert à tout le monde.
     */
    const MODES_CALCUL_OBJECTIFS = {
        'comptage': {
            nom: 'Comptage',
            description: 'Note = nombre d\'objectifs maîtrisés. Plafond si essentiels non maîtrisés.'
        },
        'moyenne-ponderee': {
            nom: 'Moyenne pondérée',
            description: 'Note = moyenne des niveaux × pondération de chaque objectif.'
        },
        'seuils-critiques': {
            nom: 'Seuils critiques',
            description: 'Tous les objectifs doivent atteindre niveau 3+. Bonus pour niveau 4.'
        },
        'holistique': {
            nom: 'Holistique',
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
            window.modalitesEvaluation.remplacer(modalites, { discret: true });   // migration à l'ouverture (lot F)
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

        // #626 (31 août 2026) : la sauvegarde qui suivait est retirée avec
        // `sauvegarderModeCalculObjectifs` — elle lisait `#v2-objectifs-mode-calcul`,
        // parti d'index.html avec #434. C'est le formulaire `mat-*` qui persiste.
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
                        ${window.boutonRetirerBloc({ action: 'supprimerObjectif', param: index, titre: 'Supprimer cet objectif' })}
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
                        ${window.boutonRetirerBloc({ action: 'supprimerTypeTravailSpecV2', param: type.id, titre: 'Supprimer ce type' })}
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
            optgroup2.label = 'Bibliothèque';
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
                        ${window.boutonRetirerBloc({ action: 'supprimerForfaitSpec', param: forfait.id, titre: 'Supprimer ce forfait' })}
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
    /**
     * ⚠ #687 — CETTE CONSTANTE N'A AUCUN LECTEUR, ET C'EST MESURÉ.
     * `grep -n "MODELES_SPECIFICATIONS" js/*.js js/**\/*.js` rend UNE ligne :
     * celle-ci. Ni dans ce fichier, ni ailleurs. Les deux entrées qui se
     * réclamaient d'une discipline sont parties ; `modele-simple` reste SEUL
     * dans une structure que personne ne lit.
     * ⮕ Le retrait complet et le passage à `MODELES_PRATIQUES_PREDEFINIS`
     * comme source unique pour SPE sont INSCRITS (#688), pas exécutés ici :
     * ils touchent `modele-simple`, hors du périmètre de ce lot.
     */
    const MODELES_SPECIFICATIONS = {
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
    };

    /**
     * Applique un modèle prédéfini pour PAN-Spécifications
     * Appelé depuis le wizard Primo (mode exploratoire)
     */

    // =========================================================================
    // ALIASES POUR RÉTROCOMPATIBILITÉ (exports anciens noms)
    // =========================================================================

    // Ces fonctions renvoient vers les nouvelles pour rétrocompatibilité







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

    // Exports par-objectifs (Beta 95 - variante unifiée avec 4 modes)
    window.chargerConfigParObjectifs = chargerConfigParObjectifs;
    window.changerModeCalculObjectifs = changerModeCalculObjectifs;
    window.afficherListeObjectifs = afficherListeObjectifs;
    window.modifierObjectif = modifierObjectif;
    window.supprimerObjectif = supprimerObjectif;
    window.regenererGrilleConversion = regenererGrilleConversion;
    window.afficherGrilleConversion = afficherGrilleConversion;
    window.modifierGrilleConversion = modifierGrilleConversion;

    // Aliases rétrocompatibilité (anciens noms Beta 95)

    // Exports PAN-Spécifications (Beta 95)
    window.chargerConfigSpecifications = chargerConfigSpecifications;
    window.afficherTypesTravauxSpec = afficherTypesTravauxSpec;
    window.chargerDropdownProductionsSpec = chargerDropdownProductionsSpec;
    window.ajouterTypeTravailSpecV2 = ajouterTypeTravailSpec;
    window.modifierTypeTravailSpecV2 = modifierTypeTravailSpec;
    window.supprimerTypeTravailSpecV2 = supprimerTypeTravailSpec;
    window.afficherForfaitsSpec = afficherForfaitsSpec;
    window.modifierForfaitSpec = modifierForfaitSpec;
    window.modifierTravailForfaitSpec = modifierTravailForfaitSpec;
    window.supprimerForfaitSpec = supprimerForfaitSpec;

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
})();
