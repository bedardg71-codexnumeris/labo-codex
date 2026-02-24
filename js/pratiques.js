/* ===============================
   MODULE 12: PRATIQUES DE NOTATION
   Index: 50 10-10-2025a → Modularisation
   Étendu le 20 octobre 2025 pour supporter les options d'affichage
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère la configuration du système de notation
   du cours (traditionnelle ou alternative) ET les options
   d'affichage des indices au tableau de bord.
   
   Contenu de ce module:
   - Configuration pratique de notation (sommative/alternative)
   - Gestion des types de PAN (maîtrise/spécifications/dénotation)
   - Options d'affichage des indices (sommatif/alternatif/les deux)
   - Affichage des informations contextuelles
   - Sauvegarde et chargement des modalités
   - Mise à jour du statut de configuration
   =============================== */

(function() {
'use strict';

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales
   
   Éléments HTML requis:
   - #pratiqueNotation : Select pour choisir la pratique
   - #colonnePAN : Conteneur pour le type de PAN
   - #typePAN : Select pour choisir le type de PAN
   - #infoPAN : Zone d'information sur le PAN choisi
   - #optionsAffichageIndices : Conteneur des options d'affichage
   - #afficherSommatif : Checkbox pour afficher indices sommatifs
   - #afficherAlternatif : Checkbox pour afficher indices alternatifs
   - #statutModalites : Zone d'affichage du statut
   - #btnSauvegarderPratiqueNotation : Bouton de sauvegarde
   
   LocalStorage utilisé:
   - 'modalitesEvaluation' : Object contenant la configuration complète
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Migre les pratiques existantes pour ajouter les configurations spécifiques
 * ✅ NOUVEAU (9 décembre 2025)
 *
 * Ajoute les champs affichage, portfolio et jetons à toutes les pratiques
 * qui n'en ont pas encore, avec des valeurs par défaut.
 */
function migrerConfigurationsSpecifiques() {
    const pratiques = db.getSync('pratiquesConfigurables', []);
    const migrationEffectuee = db.getSync('migrationConfigsSpecifiques', false);

    if (migrationEffectuee) {
        console.log('[migrerConfigurationsSpecifiques] Migration déjà effectuée');
        return;
    }

    let nbMigrees = 0;

    pratiques.forEach(p => {
        if (!p.config) {
            p.config = {};
        }

        // Ajouter affichage si manquant
        if (!p.config.affichage) {
            p.config.affichage = {
                modeComparatif: false
            };
            nbMigrees++;
        }

        // Ajouter portfolio si manquant
        if (!p.config.portfolio) {
            p.config.portfolio = {
                actif: true,
                nombreARetenir: 5,
                minimumCompletion: 7,
                nombreTotal: 10,
                methodeSelection: 'meilleurs',
                decouplerPR: false
            };
        }

        // Ajouter jetons si manquant
        if (!p.config.jetons) {
            p.config.jetons = {
                actif: true,
                delai: { nombre: 2, dureeJours: 2 },  // 🆕 Beta 95.7 : défaut 2 jours
                reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true },
                nombreParEleve: 2,  // 🆕 Beta 95.7 : défaut 2 jetons
                typesPersonnalises: []
            };
        }
    });

    if (nbMigrees > 0) {
        db.setSync('pratiquesConfigurables', pratiques);
        db.setSync('migrationConfigsSpecifiques', true);
        console.log(`[migrerConfigurationsSpecifiques] ✅ ${nbMigrees} pratique(s) migrée(s)`);
    } else {
        db.setSync('migrationConfigsSpecifiques', true);
        console.log('[migrerConfigurationsSpecifiques] ✅ Aucune migration nécessaire');
    }
}

/**
 * Initialise le module des pratiques de notation
 * Appelée automatiquement par 99-main.js au chargement
 *
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Attache les événements aux éléments
 * 3. Charge les modalités sauvegardées
 * 4. Met à jour le statut d'affichage
 *
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModulePratiques() {
    console.log('Initialisation du module Pratiques de notation');

    // Vérifier que nous sommes dans la bonne section
    // ✅ MODIFIÉ (9 décembre 2025) : Vérifier listePratiquesSidebar au lieu de listePratiques
    const listePratiquesSidebar = document.getElementById('listePratiquesSidebar');
    if (!listePratiquesSidebar) {
        console.log('   ⚠️  Section pratiques non active, initialisation reportée');
        return;
    }

    // ✅ AJOUT (8 décembre 2025) : Migration vers système bibliothèque
    if (PratiqueManager && PratiqueManager.migrerVersBibliotheque) {
        PratiqueManager.migrerVersBibliotheque();
    }

    // ✅ NOUVEAU (9 décembre 2025) : Migration configs spécifiques par pratique
    migrerConfigurationsSpecifiques();

    // ✅ AJOUT (8 décembre 2025) : Afficher la sidebar avec les pratiques de la bibliothèque
    afficherListePratiquesSidebar();

    // BETA 92: Afficher la liste des pratiques configurables
    afficherListePratiques();

    // Attacher les événements (pour les anciennes configurations)
    attacherEvenementsPratiques();

    // Charger les modalités sauvegardées
    chargerModalites();

    // Afficher les cartes PAN (Portfolio + Jetons) si PAN-Standards est active
    afficherCartesExtras();

    // Charger les valeurs du portfolio et jetons depuis localStorage
    const modalites = db.getSync('modalitesEvaluation', {});
    console.log('[initialiserModulePratiques] modalites:', modalites);
    console.log('[initialiserModulePratiques] configPAN:', modalites.configPAN);

    // Initialiser les règles de conformité (événements checkbox) - AVANT chargerConfigurationPAN
    // ✅ CORRECTIF (16 déc 2025) : Doit être appelé AVANT chargerConfigurationPAN sinon
    // populerSelecteursNiveaux() écrase la valeur de l'échelle restaurée
    initialiserReglesConformite();

    if (modalites.configPAN) {
        console.log('[initialiserModulePratiques] Appel de chargerConfigurationPAN()');
        chargerConfigurationPAN(modalites.configPAN);
    } else {
        console.log('[initialiserModulePratiques] Pas de configPAN à charger');
    }

    console.log('   ✅ Module Pratiques initialisé');

    // 🔄 Migration automatique de la configuration (Phase 3)
    migrerConfigurationPortfolio();

    // 🎨 Mettre à jour l'interface de la pratique par défaut
    mettreAJourUIPratiqueDefaut();

    // 🔄 Écouter l'événement db-ready pour recharger les grilles après synchronisation IndexedDB
    window.addEventListener('db-ready', function() {
        console.log('🔄 [Pratiques] Rechargement des grilles après synchronisation IndexedDB');
        chargerGrillesDisponibles();

        // Restaurer les valeurs sauvegardées après rechargement des grilles
        const modalitesDB = db.getSync('modalitesEvaluation', {});

        // Restaurer la grille de référence
        const selectGrilleRef = document.getElementById('grilleReferenceDepistage');
        if (selectGrilleRef && modalitesDB.grilleReferenceDepistage) {
            selectGrilleRef.value = modalitesDB.grilleReferenceDepistage;
            console.log('🔄 [Pratiques] Grille de référence restaurée:', modalitesDB.grilleReferenceDepistage);
        }

        // Restaurer la checkbox de catégorisation des erreurs
        const checkCategorisation = document.getElementById('activerCategorisationErreurs');
        if (checkCategorisation) {
            checkCategorisation.checked = modalitesDB.activerCategorisationErreurs === true;
            console.log('🔄 [Pratiques] Catégorisation erreurs restaurée:', modalitesDB.activerCategorisationErreurs);
        }
    });
}

/* ===============================
   📚 API : RÉCUPÉRER LA PRATIQUE D'UN COURS
   =============================== */

/**
 * Obtient la pratique associée à un cours spécifique
 *
 * CONTEXTE:
 * Chaque cours peut avoir sa propre pratique d'évaluation.
 * Cette fonction permet de récupérer la pratique correcte
 * pour un cours donné, au lieu d'utiliser une pratique globale.
 *
 * FONCTIONNEMENT:
 * 1. Récupère le cours depuis listeCours
 * 2. Lit le champ pratiqueId du cours
 * 3. Si pas de pratique définie, utilise la pratique par défaut (pan-maitrise)
 * 4. Retourne l'ID de la pratique
 *
 * @param {string} coursId - ID du cours (ex: "COURS1234567890")
 * @returns {string} - ID de la pratique ('pan-maitrise' ou 'sommative')
 *
 * EXEMPLE:
 * const pratiqueId = getPratiqueCours('COURS1234567890');
 * // Retourne: 'pan-maitrise' ou 'sommative'
 */
function getPratiqueCours(coursId) {
    // Récupérer tous les cours
    const cours = db.getSync('listeCours', []);

    // Trouver le cours spécifique
    const coursActuel = cours.find(c => c.id === coursId);

    if (!coursActuel) {
        console.warn(`[getPratiqueCours] Cours introuvable: ${coursId}, utilisation pratique par défaut`);
        return 'sommative'; // Pratique par défaut
    }

    // Si le cours a une pratique définie, la retourner
    if (coursActuel.pratiqueId) {
        console.log(`[getPratiqueCours] Cours ${coursId} utilise la pratique: ${coursActuel.pratiqueId}`);
        return coursActuel.pratiqueId;
    }

    // Sinon, utiliser la pratique par défaut
    console.log(`[getPratiqueCours] Cours ${coursId} n'a pas de pratique définie, utilisation de sommative par défaut`);
    return 'sommative'; // Pratique par défaut
}

/**
 * Obtient l'ID du cours actuellement actif
 *
 * FONCTIONNEMENT:
 * 1. Récupère tous les cours
 * 2. Trouve le cours marqué comme actif (actif: true)
 * 3. Retourne son ID
 *
 * @returns {string|null} - ID du cours actif ou null si aucun
 */
function getCoursActifId() {
    const cours = db.getSync('listeCours', []);
    const coursActif = cours.find(c => c.actif === true);

    if (!coursActif) {
        console.warn('[getCoursActifId] Aucun cours actif trouvé');
        return null;
    }

    return coursActif.id;
}

/**
 * Liste les cours utilisant une pratique donnée
 *
 * ✅ MODIFICATION (8 décembre 2025) : Single Source of Truth
 * Puisque la pratique est définie globalement dans modalitesEvaluation,
 * tous les cours utilisent la même pratique.
 *
 * FONCTIONNEMENT:
 * 1. Récupère tous les cours
 * 2. Récupère la pratique active depuis modalitesEvaluation
 * 3. Si pratiqueId correspond à la pratique active, retourne tous les cours
 * 4. Sinon, retourne les cours ayant explicitement ce pratiqueId (compatibilité)
 *
 * @param {string} pratiqueId - ID de la pratique ('pan-maitrise' ou 'sommative')
 * @returns {Array} - Tableau des cours utilisant cette pratique
 */
function getCoursUtilisantPratique(pratiqueId) {
    const cours = db.getSync('listeCours', []);
    const modalites = db.getSync('modalitesEvaluation', {});
    const pratiqueActive = modalites.pratique || 'pan-maitrise';

    // Si cette pratique est la pratique active, tous les cours l'utilisent
    if (pratiqueId === pratiqueActive) {
        return cours;
    }

    // Sinon, chercher les cours qui auraient explicitement ce pratiqueId
    // (pour compatibilité avec anciennes données)
    return cours.filter(c => c.pratiqueId === pratiqueId);
}

/**
 * Obtient la pratique par défaut
 *
 * FONCTIONNEMENT:
 * 1. Lit depuis localStorage 'pratiqueParDefaut'
 * 2. Si non définie, retourne 'sommative' (pratique par défaut)
 *
 * @returns {string} - ID de la pratique par défaut
 */
function getPratiqueParDefaut() {
    const pratiqueParDefaut = db.getSync('pratiqueParDefaut', 'sommative');
    return pratiqueParDefaut;
}

/**
 * Définit une pratique comme pratique par défaut
 *
 * FONCTIONNEMENT:
 * 1. Sauvegarde l'ID dans localStorage 'pratiqueParDefaut'
 * 2. Affiche une notification de succès
 *
 * @param {string} pratiqueId - ID de la pratique à définir par défaut
 */
function definirPratiqueParDefaut(pratiqueId) {
    db.setSync('pratiqueParDefaut', pratiqueId);

    const nomPratique = pratiqueId === 'sommative' ? 'Sommative traditionnelle' : 'PAN-Standards';
    console.log(`[definirPratiqueParDefaut] Pratique par défaut définie : ${nomPratique}`);

    // Afficher notification
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Pratique par défaut : ${nomPratique}`);
    }
}

/**
 * Change la pratique par défaut et met à jour l'interface
 *
 * @param {string} pratiqueId - ID de la pratique ('pan-maitrise' ou 'sommative')
 */
function changerPratiqueParDefaut(pratiqueId) {
    // Sauvegarder la nouvelle pratique par défaut
    definirPratiqueParDefaut(pratiqueId);

    // Mettre à jour l'interface
    mettreAJourUIPratiqueDefaut();
}

/**
 * Met à jour l'interface pour refléter la pratique par défaut actuelle
 * - Met en surbrillance le bouton de la pratique sélectionnée (classe btn-principal)
 * - Affiche le nom de la pratique actuelle
 */
function mettreAJourUIPratiqueDefaut() {
    const pratiqueDefaut = getPratiqueParDefaut();

    // Mettre à jour les boutons avec classes CSS standards
    const btnPanMaitrise = document.getElementById('btnDefautPanMaitrise');
    const btnSommative = document.getElementById('btnDefautSommative');

    if (btnPanMaitrise && btnSommative) {
        if (pratiqueDefaut === 'pan-maitrise') {
            // PAN-Standards est sélectionnée - classe btn-principal
            btnPanMaitrise.className = 'btn btn-principal';
            btnSommative.className = 'btn';
        } else {
            // Sommative est sélectionnée - classe btn-principal
            btnSommative.className = 'btn btn-principal';
            btnPanMaitrise.className = 'btn';
        }
    }

    // Mettre à jour le texte de l'indicateur
    const nomPratiqueSpan = document.getElementById('nomPratiqueDefaut');
    if (nomPratiqueSpan) {
        const nomPratique = pratiqueDefaut === 'sommative' ? 'Sommative traditionnelle' : 'PAN-Standards';
        nomPratiqueSpan.textContent = nomPratique;
    }
}

/* ===============================
   🔄 MIGRATION CONFIGURATION (Phase 3)
   =============================== */

/**
 * Migre la configuration du portfolio depuis productions vers modalitesEvaluation
 *
 * CONTEXTE Phase 3:
 * Auparavant, la configuration (nombreARetenir, minimumCompletion, nombreTotal)
 * était stockée dans productions[].regles. Nous la déplaçons vers
 * modalitesEvaluation.configPAN.portfolio pour centraliser toute la config.
 *
 * Cette fonction s'exécute automatiquement au chargement et :
 * 1. Vérifie si la migration est nécessaire
 * 2. Lit l'ancienne configuration depuis productions
 * 3. Crée la nouvelle structure dans modalitesEvaluation.configPAN.portfolio
 * 4. Marque la migration comme complétée
 * 5. Préserve l'ancienne config pour rétrocompatibilité
 *
 * @returns {boolean} True si migration effectuée, false si déjà faite ou rien à migrer
 */
function migrerConfigurationPortfolio() {
    // Lire modalitésEvaluation
    let modalites = db.getSync('modalitesEvaluation', {});

    // Vérifier si migration déjà effectuée
    if (modalites.configPAN && modalites.configPAN.portfolio && modalites.configPAN._migrationV1Complete) {
        console.log('[Migration Phase 3] Déjà effectuée, skip');
        return false;
    }

    console.log('[Migration Phase 3] 🔄 Début migration configuration portfolio...');

    // Lire productions pour trouver le portfolio
    const productions = db.getSync(cle('productions'), []);
    const portfolio = productions.find(p => p.type === 'portfolio');

    if (!portfolio || !portfolio.regles) {
        console.warn('[Migration Phase 3] ⚠️ Aucun portfolio avec règles trouvé, création config par défaut');

        // Créer config par défaut
        if (!modalites.configPAN) {
            modalites.configPAN = {};
        }

        modalites.configPAN.portfolio = {
            actif: true,
            nombreARetenir: 5,
            minimumCompletion: 7,
            nombreTotal: 10,
            methodeSelection: 'meilleurs'
        };

        modalites.configPAN._migrationV1Complete = true;
        db.setSync('modalitesEvaluation', modalites);

        console.log('[Migration Phase 3] ✅ Configuration par défaut créée');
        return true;
    }

    // Migrer depuis productions.regles
    const anciennesRegles = portfolio.regles;

    console.log('[Migration Phase 3] 📖 Anciennes règles lues:', JSON.stringify(anciennesRegles));

    // Créer nouvelle structure
    if (!modalites.configPAN) {
        modalites.configPAN = {};
    }

    modalites.configPAN.portfolio = {
        actif: true,
        nombreARetenir: anciennesRegles.nombreARetenir || 5,
        minimumCompletion: anciennesRegles.minimumCompletion || 7,
        nombreTotal: anciennesRegles.nombreTotal || 10,
        methodeSelection: 'meilleurs' // Default: N meilleurs artefacts
    };

    // Marquer migration comme complétée
    modalites.configPAN._migrationV1Complete = true;
    modalites.configPAN._migrationDate = new Date().toISOString();

    // Sauvegarder
    db.setSync('modalitesEvaluation', modalites);

    console.log('[Migration Phase 3] ✅ Configuration migrée vers modalitesEvaluation.configPAN.portfolio');
    console.log('[Migration Phase 3] 📊 Nouvelle config:', JSON.stringify(modalites.configPAN.portfolio));
    console.log('[Migration Phase 3] ℹ️  Note: Ancienne config dans productions préservée pour rétrocompatibilité');

    return true;
}

/**
 * Attache les événements aux éléments HTML
 * Appelée par initialiserModulePratiques()
 */
function attacherEvenementsPratiques() {
    // Sélecteur pratique de notation
    const selectPratique = document.getElementById('pratiqueNotation');
    if (selectPratique) {
        selectPratique.addEventListener('change', changerPratiqueNotation);
    }

    // Sélecteur type PAN
    const selectTypePAN = document.getElementById('typePAN');
    if (selectTypePAN) {
        selectTypePAN.addEventListener('change', afficherInfoPAN);
    }

    // Checkbox mode comparatif
    const checkComparatif = document.getElementById('modeComparatif');
    if (checkComparatif) {
        checkComparatif.addEventListener('change', sauvegarderOptionsAffichage);
    }

    // Checkbox activation jetons
    const checkJetonsActif = document.getElementById('jetonsActif');
    if (checkJetonsActif) {
        checkJetonsActif.addEventListener('change', toggleConfigJetons);
    }

    // Checkbox activation portfolio
    const checkPortfolioActif = document.getElementById('portfolioActif');
    if (checkPortfolioActif) {
        checkPortfolioActif.addEventListener('change', toggleConfigPortfolio);
    }

    // Dropdown modalité de sélection
    const selectModalite = document.getElementById('configMethodeSelection');
    if (selectModalite) {
        selectModalite.addEventListener('change', updateDescriptionModalite);
    }

    // Bouton sauvegarder
    const btnSauvegarder = document.getElementById('btnSauvegarderPratiqueNotation');
    if (btnSauvegarder) {
        btnSauvegarder.addEventListener('click', sauvegarderPratiqueNotation);
    }

    // NOUVEAU: Bouton pour ajouter un type de jeton personnalisé
    const btnAjouterTypeJeton = document.getElementById('btnAjouterTypeJeton');
    if (btnAjouterTypeJeton) {
        btnAjouterTypeJeton.addEventListener('click', ajouterTypeJetonPersonnalise);
    }
}

/* ===============================
   📝 GESTION DE LA PRATIQUE DE NOTATION
   =============================== */

/**
 * Gère le changement de pratique de notation
 * Appelée lors du changement dans #pratiqueNotation
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la pratique sélectionnée
 * 2. Affiche/masque la colonne PAN selon la pratique
 * 3. Réinitialise le type PAN si nécessaire
 * 4. Affiche les options d'affichage
 * 5. Sauvegarde dans localStorage
 * 6. Met à jour le statut
 */
function changerPratiqueNotation() {
    const elPratique = document.getElementById('pratiqueNotation');
    if (!elPratique) return;
    const pratique = elPratique.value;
    const colonnePAN = document.getElementById('colonnePAN');
    const selectPAN = document.getElementById('typePAN');
    const infoPAN = document.getElementById('infoPAN');

    if (pratique === 'pan-maitrise') {
        // Afficher le menu PAN
        colonnePAN.classList.remove('u-hide');
    } else {
        // Masquer le menu PAN
        colonnePAN.classList.add('u-hide');
        selectPAN.value = '';
        infoPAN.classList.add('u-hide');
    }

    // Sauvegarder dans modalitesEvaluation
    let modalites = db.getSync('modalitesEvaluation', {});
    modalites.pratique = pratique;
    modalites.typePAN = pratique === 'pan-maitrise' ? modalites.typePAN : null;
    db.setSync('modalitesEvaluation', modalites);

    // Gérer l'affichage des options d'affichage
    afficherOptionsAffichage();

    // Afficher/masquer la configuration PAN
    afficherConfigurationPAN();

    mettreAJourStatutModalites();
}

/* ===============================
   📚 GESTION DU TYPE DE PAN
   =============================== */

/**
 * Affiche les informations sur le type de PAN sélectionné
 * Appelée lors du changement dans #typePAN
 * 
 * FONCTIONNEMENT:
 * 1. Récupère le type PAN sélectionné
 * 2. Affiche la description correspondante
 * 3. Sauvegarde dans localStorage
 * 4. Met à jour le statut
 */
function afficherInfoPAN() {
    const typePAN = document.getElementById('typePAN').value;
    const infoPAN = document.getElementById('infoPAN');

    const descriptions = {
        'maitrise': 'L\'étudiant·e progresse à travers des niveaux de maîtrise (Ex: En développement, Acquis, Avancé...). En anglais on l\'appelle <em>Standard Based Grading</em>.',
        'specifications': 'L\'étudiant·e doit satisfaire à des critères précis et binaires (réussi/non réussi) pour chaque compétence. En anglais on l\'appelle <em>Specifications Grading</em>.',
        'denotation': 'Approche sans notes chiffrées pendant le trimestre. L\'accent est mis sur la rétroaction descriptive et l\'autoévaluation. En anglais on l\'appelle <em>Ungrading</em>.'
    };

    if (typePAN && descriptions[typePAN]) {
        infoPAN.innerHTML = descriptions[typePAN];
        infoPAN.classList.remove('u-hide');

        // Sauvegarder le type de PAN
        let modalites = db.getSync('modalitesEvaluation', {});
        modalites.typePAN = typePAN;
        db.setSync('modalitesEvaluation', modalites);

        mettreAJourStatutModalites();
    } else {
        infoPAN.classList.add('u-hide');
    }
}

/* ===============================
   GESTION DES OPTIONS D'AFFICHAGE (NOUVEAU)
   =============================== */

/**
 * Gère l'affichage de la section des options d'affichage
 * Appelée après le changement de pratique de notation
 *
 * FONCTIONNEMENT:
 * 1. Affiche/masque la section selon la pratique choisie
 * 2. Décoche le mode comparatif par défaut
 * 3. Sauvegarde automatiquement
 */
function afficherOptionsAffichage() {
    const pratique = document.getElementById('pratiqueNotation').value;
    const sectionAffichageTableauBord = document.getElementById('sectionAffichageTableauBord');
    const checkComparatif = document.getElementById('modeComparatif');
    const activationsExtras = document.getElementById('activationsExtras');

    if (pratique === 'pan-maitrise' || pratique === 'sommative') {
        // Afficher la section d'affichage au tableau de bord
        toggleDisplay(sectionAffichageTableauBord, true);

        // Afficher les checkboxes d'activation pour PAN
        if (pratique === 'pan-maitrise' && activationsExtras) {
            activationsExtras.classList.remove('u-hide');
            // Initialiser l'affichage des cartes
            afficherCartesExtras();
        } else {
            toggleDisplay(activationsExtras, false);
        }
    } else {
        // Masquer tout si aucune pratique sélectionnée
        toggleDisplay(sectionAffichageTableauBord, false);
        toggleDisplay(activationsExtras, false);
    }

    sauvegarderOptionsAffichage();
}

/**
 * Sauvegarde les options d'affichage des indices
 * Appelée par l'événement change de la checkbox mode comparatif
 *
 * FONCTIONNEMENT:
 * 1. Récupère l'état du mode comparatif
 * 2. Si mode comparatif actif → affiche SOM + PAN
 * 3. Sinon → affiche uniquement la pratique principale choisie
 * 4. Sauvegarde dans localStorage
 */
function sauvegarderOptionsAffichage() {
    const checkComparatif = document.getElementById('modeComparatif');

    if (!checkComparatif) return;

    const modeComparatif = checkComparatif.checked;

    // Récupérer la config existante
    let modalites = db.getSync('modalitesEvaluation', {});

    // Récupérer la pratique active depuis modalites (nouvelle architecture Beta 91)
    const pratique = modalites.pratique || 'sommative';

    // Définir l'affichage selon le mode comparatif
    if (modeComparatif) {
        // Mode comparatif : afficher les deux
        modalites.affichageTableauBord = {
            afficherSommatif: true,
            afficherAlternatif: true
        };
    } else {
        // Mode normal : afficher uniquement la pratique principale
        if (pratique === 'sommative') {
            modalites.affichageTableauBord = {
                afficherSommatif: true,
                afficherAlternatif: false
            };
        } else if (pratique && pratique.startsWith('pan-maitrise')) {
            // ✅ CORRECTION (9 déc 2025) : Support des variantes pan-maitrise-json, pan-maitrise-*
            modalites.affichageTableauBord = {
                afficherSommatif: false,
                afficherAlternatif: true
            };
        }
    }

    db.setSync('modalitesEvaluation', modalites);

    // ✅ NOUVEAU (9 décembre 2025) : Sauvegarder aussi dans la pratique active
    sauvegarderDansConfiguration('affichage', { modeComparatif });

    console.log('Options d\'affichage sauvegardées:', modalites.affichageTableauBord);
}

/* ===============================
   CONFIGURATION PAN (PÉRIODE, ARTEFACTS, JETONS)
   =============================== */

/**
 * Affiche/masque la configuration PAN selon la pratique sélectionnée
 */
function afficherConfigurationPAN() {
    const pratique = document.getElementById('pratiqueNotation').value;
    const configPAN = document.getElementById('configurationPAN');

    if (!configPAN) return;

    if (pratique === 'pan-maitrise') {
        configPAN.classList.remove('u-hide');
        chargerConfigurationPAN();
    } else {
        configPAN.classList.add('u-hide');
    }
}

/**
 * Affiche les paramètres de configuration PAN
 * Appelée par le bouton "Modifier les paramètres"
 */
function afficherParametresPAN() {
    const configPAN = document.getElementById('configurationPAN');
    if (!configPAN) return;

    configPAN.classList.remove('u-hide');
    chargerConfigurationPAN();

    // Scroller vers la section
    configPAN.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Charge la configuration PAN depuis localStorage
 */
function chargerConfigurationPAN() {
    const modalites = db.getSync('modalitesEvaluation', {});
    const configPAN = modalites.configPAN || {};

    // Période d'évaluation
    const nombreCours = configPAN.nombreCours || 7;
    const radioPeriode = document.querySelector(`input[name="periodePAN"][value="${nombreCours}"]`);
    if (radioPeriode) {
        radioPeriode.checked = true;
    }

    // ✅ CORRECTION Phase 3: Configuration du portfolio depuis modalitesEvaluation
    const configPortfolio = configPAN.portfolio || {
        actif: true,
        nombreARetenir: 5,
        minimumCompletion: 7,
        nombreTotal: 10,
        methodeSelection: 'meilleurs'
    };

    const checkPortfolioActif = document.getElementById('portfolioActif');
    if (checkPortfolioActif) {
        checkPortfolioActif.checked = configPortfolio.actif !== false; // Par défaut true
    }

    const selectMethodeSelection = document.getElementById('configMethodeSelection');
    if (selectMethodeSelection) {
        selectMethodeSelection.value = configPortfolio.methodeSelection || 'meilleurs';
    }

    const selectNombreARetenir = document.getElementById('configNombreARetenir');
    if (selectNombreARetenir) {
        selectNombreARetenir.value = configPortfolio.nombreARetenir || 5;
    }

    const inputMinimumCompletion = document.getElementById('configMinimumCompletion');
    if (inputMinimumCompletion) {
        inputMinimumCompletion.value = configPortfolio.minimumCompletion || 7;
    }

    const inputNombreTotal = document.getElementById('configNombreTotal');
    if (inputNombreTotal) {
        inputNombreTotal.value = configPortfolio.nombreTotal || 10;
    }

    const checkDecouplerPR = document.getElementById('decouplerPR');
    if (checkDecouplerPR) {
        checkDecouplerPR.checked = configPortfolio.decouplerPR || false; // Par défaut false (couplé)
    }

    // Jetons - valeurs par défaut
    const jetons = configPAN.jetons || {
        actif: true,
        delai: { nombre: 2, dureeJours: 2 },  // 🆕 Beta 95.7 : défaut 2 jours
        reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true }
    };

    const checkJetonsActif = document.getElementById('jetonsActif');
    if (checkJetonsActif) {
        checkJetonsActif.checked = jetons.actif;
    }

    const selectNombreJetonsDelai = document.getElementById('nombreJetonsDelai');
    if (selectNombreJetonsDelai) {
        selectNombreJetonsDelai.value = jetons.delai.nombre;
    }

    const selectDureeDelai = document.getElementById('dureeDelai');
    if (selectDureeDelai) {
        selectDureeDelai.value = jetons.delai.dureeJours;
    }

    const selectNombreJetonsReprise = document.getElementById('nombreJetonsReprise');
    if (selectNombreJetonsReprise) {
        selectNombreJetonsReprise.value = jetons.reprise.nombre;
    }

    const selectMaxRepriseParProduction = document.getElementById('maxRepriseParProduction');
    if (selectMaxRepriseParProduction) {
        selectMaxRepriseParProduction.value = jetons.reprise.maxParProduction;
    }

    const gestionOriginale = jetons.reprise.archiverOriginale ? 'archiver' : 'supprimer';
    const radioGestion = document.querySelector(`input[name="gestionOriginale"][value="${gestionOriginale}"]`);
    if (radioGestion) {
        radioGestion.checked = true;
    }

    // Nombre de jetons par élève (NOUVEAU)
    const inputNombreJetonsParEleve = document.getElementById('nombreJetonsParEleve');
    if (inputNombreJetonsParEleve) {
        inputNombreJetonsParEleve.value = jetons.nombreParEleve || 2;  // 🆕 Beta 95.7 : défaut 2
    }

    // Charger les types de jetons personnalisés (NOUVEAU)
    const jetonsPersonnalises = jetons.typesPersonnalises || [];
    afficherJetonsPersonnalises(jetonsPersonnalises);

    // 🆕 Beta 95.7 : Peupler le dropdown note maximale (reprise ciblée)
    peuplerDropdownPlafondNoteCiblee();

    // Activer/désactiver sections jetons
    toggleConfigJetons();

    // Mettre à jour description modalité
    updateDescriptionModalite();

    // Activer/désactiver configuration portfolio
    toggleConfigPortfolio();
}

/**
 * Active/désactive les détails de configuration du portfolio
 */
function toggleConfigPortfolio() {
    const checkPortfolioActif = document.getElementById('portfolioActif');
    if (!checkPortfolioActif) return;

    const portfolioActif = checkPortfolioActif.checked;
    const detailsConfig = document.getElementById('detailsConfigPortfolio');

    if (detailsConfig) {
        // Appliquer l'opacité réduite au lieu de masquer
        detailsConfig.style.opacity = portfolioActif ? '1' : '0.5';

        // Désactiver tous les champs si portfolio inactif
        const champs = detailsConfig.querySelectorAll('select, input');
        champs.forEach(champ => champ.disabled = !portfolioActif);
    }

    // Afficher/masquer la carte portfolio dans la colonne droite
    afficherCartesExtras();
}

/**
 * Met à jour dynamiquement la description et les labels selon la modalité sélectionnée
 */
function updateDescriptionModalite() {
    const selectModalite = document.getElementById('configMethodeSelection');
    if (!selectModalite) return;

    const modalite = selectModalite.value;
    const descriptionElem = document.getElementById('descriptionModalite');
    const labelNombreElem = document.getElementById('labelNombreARetenir');
    const groupeNombreElem = document.getElementById('groupeNombreARetenir');

    // Définir les textes selon la modalité (format HTML avec puces)
    const textes = {
        'meilleurs': {
            description: "Dans ma pratique de notation basée sur la maîtrise de standards, le portfolio contient <strong>les N meilleures productions</strong> de l'apprenant·e.",
            label: 'N meilleurs',
            afficherNombre: true
        },
        'recents': {
            description: "Dans ma pratique de notation basée sur la maîtrise de standards, le portfolio contient <strong>les N plus récentes productions</strong> de l'apprenant·e.",
            label: 'N récents',
            afficherNombre: true
        },
        'recents-meilleurs': {
            description: "Dans ma pratique de notation basée sur la maîtrise de standards, le portfolio contient <strong>les N plus récentes productions parmi les 50% meilleures</strong> de l'apprenant·e (approche hybride).",
            label: 'N récents (top 50%)',
            afficherNombre: true
        },
        'tous': {
            description: "Dans ma pratique de notation, le portfolio contient <strong>toutes les productions</strong> de l'apprenant·e (calcul de type sommative, utile pour comparaison).",
            label: 'Tous',
            afficherNombre: false
        }
    };

    const config = textes[modalite] || textes['meilleurs'];

    // Mettre à jour les éléments
    if (descriptionElem) {
        descriptionElem.innerHTML = config.description;
    }

    if (labelNombreElem) {
        labelNombreElem.textContent = config.label;
    }

    // Afficher/cacher le champ "Artefacts à retenir" selon la modalité
    if (groupeNombreElem) {
        toggleDisplay(groupeNombreElem, config.afficherNombre);
    }
}

/**
 * Active/désactive les sections de configuration des jetons
 */
function toggleConfigJetons() {
    const checkJetonsActif = document.getElementById('jetonsActif');
    if (!checkJetonsActif) return;

    const jetonsActif = checkJetonsActif.checked;
    const configDelai = document.getElementById('configJetonsDelai');
    const configReprise = document.getElementById('configJetonsReprise');

    if (configDelai) {
        configDelai.style.opacity = jetonsActif ? '1' : '0.5';
    }

    if (configReprise) {
        configReprise.style.opacity = jetonsActif ? '1' : '0.5';
    }

    // Désactiver les champs si jetons inactifs
    if (configDelai) {
        const champsDelai = configDelai.querySelectorAll('select');
        champsDelai.forEach(champ => champ.disabled = !jetonsActif);
    }

    if (configReprise) {
        const champsReprise = configReprise.querySelectorAll('select, input');
        champsReprise.forEach(champ => champ.disabled = !jetonsActif);
    }

    // Afficher/masquer la carte jetons dans la colonne droite
    afficherCartesExtras();
}

/**
 * Gère l'affichage conditionnel des cartes Portfolio et Jetons dans la colonne droite
 * Affiche la carte correspondante selon les checkboxes cochées
 */
function afficherCartesExtras() {
    const checkPortfolio = document.getElementById('portfolioActif');
    const checkJetons = document.getElementById('jetonsActif');
    const colonneCartesExtras = document.getElementById('colonneCartesExtras');
    const cartePortfolio = document.getElementById('cartePortfolio');
    const carteJetons = document.getElementById('carteJetons');

    if (!colonneCartesExtras || !cartePortfolio || !carteJetons) return;

    // Toujours afficher les cartes, mais ajuster l'opacité et désactiver
    // Ajouter les cartes si elles ne sont pas déjà dans la colonne
    if (!colonneCartesExtras.contains(cartePortfolio)) {
        colonneCartesExtras.appendChild(cartePortfolio);
    }
    if (!colonneCartesExtras.contains(carteJetons)) {
        colonneCartesExtras.appendChild(carteJetons);
    }

    // Gérer l'apparence de la carte Portfolio
    cartePortfolio.classList.remove('u-hide');
    if (checkPortfolio && checkPortfolio.checked) {
        cartePortfolio.style.opacity = '1';
    } else {
        cartePortfolio.style.opacity = '0.5';
    }

    // Gérer l'apparence de la carte Jetons
    carteJetons.classList.remove('u-hide');
    if (checkJetons && checkJetons.checked) {
        carteJetons.style.opacity = '1';
    } else {
        carteJetons.style.opacity = '0.5';
    }
}

/**
 * Sauvegarde la configuration PAN
 */
function sauvegarderConfigurationPAN() {
    console.log('[sauvegarderConfigurationPAN] Début de la sauvegarde');
    const modalites = db.getSync('modalitesEvaluation', {});

    // Période d'évaluation
    const radioPeriode = document.querySelector('input[name="periodePAN"]:checked');
    const nombreCours = radioPeriode ? parseInt(radioPeriode.value) : 7;

    // ✅ CORRECTION Phase 3: Configuration du portfolio
    const checkPortfolioActif = document.getElementById('portfolioActif');
    const portfolioActif = checkPortfolioActif ? checkPortfolioActif.checked : true;

    const selectMethodeSelection = document.getElementById('configMethodeSelection');
    const methodeSelection = selectMethodeSelection ? selectMethodeSelection.value : 'meilleurs';

    const selectNombreARetenir = document.getElementById('configNombreARetenir');
    const nombreARetenir = selectNombreARetenir ? parseInt(selectNombreARetenir.value) : 5;
    console.log('[sauvegarderConfigurationPAN] nombreARetenir lu:', nombreARetenir, 'depuis champ:', selectNombreARetenir?.value);

    const inputMinimumCompletion = document.getElementById('configMinimumCompletion');
    const minimumCompletion = inputMinimumCompletion ? parseInt(inputMinimumCompletion.value) : 7;
    console.log('[sauvegarderConfigurationPAN] minimumCompletion lu:', minimumCompletion, 'depuis champ:', inputMinimumCompletion?.value);

    const inputNombreTotal = document.getElementById('configNombreTotal');
    const nombreTotal = inputNombreTotal ? parseInt(inputNombreTotal.value) : 10;

    const checkDecouplerPR = document.getElementById('decouplerPR');
    const decouplerPR = checkDecouplerPR ? checkDecouplerPR.checked : false;

    // Jetons
    const checkJetonsActif = document.getElementById('jetonsActif');
    const jetonsActif = checkJetonsActif ? checkJetonsActif.checked : true;

    const checkJetonDelaiActif = document.getElementById('jetonDelaiActif');
    const jetonDelaiActif = checkJetonDelaiActif ? checkJetonDelaiActif.checked : true;

    const checkJetonRepriseActif = document.getElementById('jetonRepriseActif');
    const jetonRepriseActif = checkJetonRepriseActif ? checkJetonRepriseActif.checked : true;

    const selectNombreJetonsDelai = document.getElementById('nombreJetonsDelai');
    const nombreJetonsDelai = selectNombreJetonsDelai ? parseInt(selectNombreJetonsDelai.value) : 2;

    const selectDureeDelai = document.getElementById('dureeDelai');
    const dureeDelai = selectDureeDelai ? parseInt(selectDureeDelai.value) : 2;  // 🆕 Beta 95.7

    const selectNombreJetonsReprise = document.getElementById('nombreJetonsReprise');
    const nombreJetonsReprise = selectNombreJetonsReprise ? parseInt(selectNombreJetonsReprise.value) : 2;

    const selectMaxRepriseParProduction = document.getElementById('maxRepriseParProduction');
    const maxRepriseParProduction = selectMaxRepriseParProduction ? parseInt(selectMaxRepriseParProduction.value) : 1;

    const radioGestion = document.querySelector('input[name="gestionOriginale"]:checked');
    const gestionOriginale = radioGestion ? radioGestion.value : 'archiver';

    // NOUVEAU: Reprise ciblée
    const checkJetonRepriseCibleeActif = document.getElementById('jetonRepriseCibleeActif');
    const jetonRepriseCibleeActif = checkJetonRepriseCibleeActif ? checkJetonRepriseCibleeActif.checked : true;

    const selectPlafondNoteCiblee = document.getElementById('plafondNoteCiblee');
    const plafondNoteCiblee = selectPlafondNoteCiblee ? selectPlafondNoteCiblee.value : 'M';

    const radioGestionCiblee = document.querySelector('input[name="gestionOriginaleCiblee"]:checked');
    const gestionOriginaleCiblee = radioGestionCiblee ? radioGestionCiblee.value : 'archiver';

    // NOUVEAU: Nombre de jetons par élève
    const inputNombreJetonsParEleve = document.getElementById('nombreJetonsParEleve');
    const nombreParEleve = inputNombreJetonsParEleve ? parseInt(inputNombreJetonsParEleve.value) : 2;  // 🆕 Beta 95.7

    // NOUVEAU: Récupérer les types personnalisés depuis localStorage temporaire
    const typesPersonnalises = window.jetonsPersonnalisesTemporaire || [];

    // Construire l'objet config
    // ✅ CORRECTION Phase 3: Inclure la configuration du portfolio
    modalites.configPAN = {
        nombreCours: nombreCours,

        portfolio: {
            actif: portfolioActif,
            nombreARetenir: nombreARetenir,
            minimumCompletion: minimumCompletion,
            nombreTotal: nombreTotal,
            methodeSelection: methodeSelection,
            decouplerPR: decouplerPR,
            reglesConformite: getReglesConformiteConfig()
        },

        jetons: {
            actif: jetonsActif,
            nombreParEleve: nombreParEleve,

            delai: {
                actif: jetonDelaiActif,
                nombre: nombreJetonsDelai,
                dureeJours: dureeDelai
            },

            reprise: {
                actif: jetonRepriseActif,
                nombre: nombreJetonsReprise,
                maxParProduction: maxRepriseParProduction,
                archiverOriginale: gestionOriginale === 'archiver'
            },

            repriseCiblee: {
                actif: jetonRepriseCibleeActif,
                plafondNote: plafondNoteCiblee,
                archiverOriginale: gestionOriginaleCiblee === 'archiver'
            },

            typesPersonnalises: typesPersonnalises
        }
    };

    db.setSync('modalitesEvaluation', modalites);

    // ✅ NOUVEAU (9 décembre 2025) : Sauvegarder aussi dans la pratique active
    sauvegarderDansConfiguration('portfolio', modalites.configPAN.portfolio);
    sauvegarderDansConfiguration('jetons', modalites.configPAN.jetons);

    console.log('✅ Configuration PAN sauvegardée:', modalites.configPAN);
}

/* ===============================
   SAUVEGARDE ET CHARGEMENT
   =============================== */

/**
 * Sauvegarde la configuration complète de la pratique de notation
 * Appelée par le bouton «Sauvegarder la configuration»
 *
 * FONCTIONNEMENT:
 * 1. Récupère les valeurs des champs
 * 2. Valide les champs obligatoires
 * 3. Sauvegarde dans localStorage avec timestamp
 * 4. Sauvegarde la configuration PAN si pratique alternative
 * 5. Affiche notification de succès
 * 6. Met à jour le statut
 */
function sauvegarderPratiqueNotation() {
    // Lire la pratique active depuis localStorage (nouveau système de cartes)
    let modalites = db.getSync('modalitesEvaluation', {});
    const pratique = modalites.pratique;

    // Les sélecteurs suivants n'existent que dans l'ancien système
    const selectTypePAN = document.getElementById('typePAN');
    const colonnePAN = document.getElementById('colonnePAN');
    const typePAN = selectTypePAN ? selectTypePAN.value : modalites.typePAN;

    if (!pratique) {
        alert('Veuillez choisir une pratique de notation');
        return;
    }

    // Valider typePAN uniquement si le sélecteur est VISIBLE (ancien système)
    const selecteurVisible = colonnePAN && !colonnePAN.classList.contains('u-hide');
    if (pratique === 'pan-maitrise' && selecteurVisible && !typePAN) {
        alert('Veuillez choisir un type de pratique alternative');
        return;
    }

    // Construire la configuration complète
    modalites.pratique = pratique;
    modalites.typePAN = pratique === 'pan-maitrise' ? typePAN : null;
    modalites.dateConfiguration = new Date().toISOString();

    // Sauvegarder la grille de référence pour le dépistage
    const selectGrilleRef = document.getElementById('grilleReferenceDepistage');
    if (selectGrilleRef) {
        modalites.grilleReferenceDepistage = selectGrilleRef.value || null;
        console.log('[sauvegarderPratiqueNotation] Grille de référence:', selectGrilleRef.value);
    }

    // ✅ CORRECTION (9 décembre 2025) : Toujours lire l'état de la checkbox modeComparatif
    const checkComparatif = document.getElementById('modeComparatif');
    const modeComparatif = checkComparatif ? checkComparatif.checked : false;

    if (modeComparatif) {
        // Mode comparatif : afficher les deux pratiques
        modalites.affichageTableauBord = {
            afficherSommatif: true,
            afficherAlternatif: true
        };
    } else {
        // Mode normal : afficher uniquement la pratique principale
        if (pratique === 'sommative') {
            modalites.affichageTableauBord = {
                afficherSommatif: true,
                afficherAlternatif: false
            };
        } else if (pratique && pratique.startsWith('pan-maitrise')) {
            // ✅ CORRECTION (9 déc 2025) : Support des variantes pan-maitrise-json, pan-maitrise-*
            modalites.affichageTableauBord = {
                afficherSommatif: false,
                afficherAlternatif: true
            };
        }
    }

    // Sauvegarder l'option d'affichage des descriptions SOLO
    const checkSOLO = document.getElementById('afficherDescriptionsSOLO');
    if (checkSOLO) {
        modalites.afficherDescriptionsSOLO = checkSOLO.checked;
    } else {
        // Par défaut activé si l'élément n'existe pas (rétrocompatibilité)
        modalites.afficherDescriptionsSOLO = true;
    }

    // Sauvegarder l'option d'activation du modèle RàI et détection des patterns
    const checkRai = document.getElementById('activerRai');
    if (checkRai) {
        modalites.activerRai = checkRai.checked;
    } else {
        // Par défaut activé si l'élément n'existe pas (rétrocompatibilité)
        modalites.activerRai = true;
    }

    // Sauvegarder l'option d'activation de la catégorisation des erreurs de français
    const checkCategorisation = document.getElementById('activerCategorisationErreurs');
    if (checkCategorisation) {
        modalites.activerCategorisationErreurs = checkCategorisation.checked;
        console.log('[sauvegarderPratiqueNotation] Catégorisation erreurs:', checkCategorisation.checked);
    } else {
        // Par défaut désactivé si l'élément n'existe pas (mode simple par défaut)
        modalites.activerCategorisationErreurs = false;
        console.log('[sauvegarderPratiqueNotation] Élément activerCategorisationErreurs non trouvé');
    }

    db.setSync('modalitesEvaluation', modalites);
    console.log('[sauvegarderPratiqueNotation] Modalités sauvegardées:', modalites);

    // Sauvegarder toutes les configurations (portfolio et jetons)
    console.log('[sauvegarderPratiqueNotation] Appel de sauvegarderConfigurationPAN()');
    sauvegarderConfigurationPAN();

    console.log('[sauvegarderPratiqueNotation] Affichage de la notification');
    afficherNotificationSucces('Toutes les configurations ont été sauvegardées !');
    mettreAJourStatutModalites();

    console.log('[sauvegarderPratiqueNotation] Configuration complète sauvegardée:', modalites);
}

/**
 * Charge les modalités sauvegardées depuis localStorage
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les modalités depuis localStorage
 * 2. Si vide: réinitialise tous les champs
 * 3. Sinon: remplit les champs avec les valeurs
 * 4. Affiche/masque la colonne PAN selon la pratique
 * 5. Charge les options d'affichage
 * 6. Met à jour le statut
 */
function chargerModalites() {
    const modalites = db.getSync('modalitesEvaluation', {});

    const selectPratique = document.getElementById('pratiqueNotation');
    const colonnePAN = document.getElementById('colonnePAN');
    const selectPAN = document.getElementById('typePAN');
    const optionsAffichage = document.getElementById('optionsAffichageIndices');

    // S'assurer que les éléments existent avant de continuer
    if (!selectPratique || !colonnePAN || !selectPAN) {
        console.warn('Éléments de formulaire non trouvés');
        return;
    }

    // Si pas de données sauvegardées, initialiser avec pratique par défaut
    if (!modalites.pratique) {
        console.log('[chargerModalites] Aucune pratique configurée, initialisation avec sommative par défaut');
        modalites.pratique = 'sommative';
        modalites.affichageTableauBord = {
            afficherSommatif: true,
            afficherAlternatif: false
        };
        db.setSync('modalitesEvaluation', modalites);

        selectPratique.value = '';
        colonnePAN.classList.add('u-hide');
        selectPAN.value = '';
        toggleDisplay(optionsAffichage, false);
        mettreAJourStatutModalites();
        return;
    }

    // Charger la pratique de notation
    selectPratique.value = modalites.pratique;

    // Gérer l'affichage du menu PAN
    if (modalites.pratique === 'pan-maitrise') {
        colonnePAN.classList.remove('u-hide');

        // Charger le type de PAN si disponible
        if (modalites.typePAN) {
            selectPAN.value = modalites.typePAN;
            afficherInfoPAN();
        } else {
            selectPAN.value = '';
        }
    } else {
        colonnePAN.classList.add('u-hide');
        selectPAN.value = '';
    }

    // Charger les options d'affichage
    // Si affichageTableauBord n'existe pas, l'initialiser selon la pratique choisie
    if (!modalites.affichageTableauBord) {
        console.log('[chargerModalites] Initialisation affichageTableauBord par défaut');
        if (modalites.pratique === 'sommative') {
            modalites.affichageTableauBord = {
                afficherSommatif: true,
                afficherAlternatif: false
            };
        } else if (modalites.pratique === 'pan-maitrise') {
            modalites.affichageTableauBord = {
                afficherSommatif: false,
                afficherAlternatif: true
            };
        } else {
            // Par défaut : aucun affichage
            modalites.affichageTableauBord = {
                afficherSommatif: false,
                afficherAlternatif: false
            };
        }
        db.setSync('modalitesEvaluation', modalites);
    }

    // Initialiser la checkbox mode comparatif
    const checkComparatif = document.getElementById('modeComparatif');
    if (checkComparatif) {
        // Mode comparatif activé si les deux sont affichés
        const modeComparatif = modalites.affichageTableauBord.afficherSommatif &&
                               modalites.affichageTableauBord.afficherAlternatif;
        checkComparatif.checked = modeComparatif;
    }

    // Charger l'option d'affichage des descriptions SOLO
    const checkSOLO = document.getElementById('afficherDescriptionsSOLO');
    if (checkSOLO) {
        // Par défaut activé si non défini (rétrocompatibilité)
        checkSOLO.checked = modalites.afficherDescriptionsSOLO !== false;
    }

    // Charger l'option d'activation du modèle RàI et détection des patterns
    const checkRai = document.getElementById('activerRai');
    if (checkRai) {
        // Par défaut activé si non défini (rétrocompatibilité)
        checkRai.checked = modalites.activerRai !== false;
    }

    // Charger l'option d'activation de la catégorisation des erreurs de français
    const checkCategorisation = document.getElementById('activerCategorisationErreurs');
    if (checkCategorisation) {
        // Par défaut désactivé si non défini (mode simple par défaut)
        checkCategorisation.checked = modalites.activerCategorisationErreurs === true;
    }

    // Afficher la section options si nécessaire
    afficherOptionsAffichage();

    // Charger la configuration PAN (portfolio et jetons)
    if (modalites.configPAN) {
        chargerConfigurationPAN(modalites.configPAN);
    }

    // Charger les grilles disponibles et sélectionner la grille de référence
    chargerGrillesDisponibles();
    const selectGrilleRef = document.getElementById('grilleReferenceDepistage');
    if (selectGrilleRef && modalites.grilleReferenceDepistage) {
        selectGrilleRef.value = modalites.grilleReferenceDepistage;
    }

    // Masquer la section configurationPAN au chargement
    // Elle sera affichée par le bouton "Modifier les paramètres"
    const configPAN = document.getElementById('configurationPAN');
    if (configPAN && modalites.pratique === 'pan-maitrise') {
        configPAN.classList.add('u-hide');
    }

    // Mettre à jour le statut
    mettreAJourStatutModalites();
}

/**
 * Charge la configuration PAN (portfolio et jetons) depuis l'objet configPAN
 * @param {Object} configPAN - Configuration PAN depuis localStorage
 */
function chargerConfigurationPAN(configPAN) {
    console.log('[chargerConfigurationPAN] Appelée avec:', configPAN);

    if (!configPAN) {
        console.log('[chargerConfigurationPAN] Pas de configPAN, sortie');
        return;
    }

    // Charger configuration du portfolio
    if (configPAN.portfolio) {
        console.log('[chargerConfigurationPAN] Chargement portfolio:', configPAN.portfolio);

        const checkPortfolio = document.getElementById('portfolioActif');
        if (checkPortfolio) {
            checkPortfolio.checked = configPAN.portfolio.actif !== false;
        }

        const selectMethode = document.getElementById('configMethodeSelection');
        if (selectMethode && configPAN.portfolio.methodeSelection) {
            selectMethode.value = configPAN.portfolio.methodeSelection;
        }

        const inputNombreARetenir = document.getElementById('configNombreARetenir');
        if (inputNombreARetenir && configPAN.portfolio.nombreARetenir) {
            inputNombreARetenir.value = configPAN.portfolio.nombreARetenir;
            console.log('[chargerConfigurationPAN] nombreARetenir chargé:', configPAN.portfolio.nombreARetenir);
        }

        const inputMinimum = document.getElementById('configMinimumCompletion');
        if (inputMinimum && configPAN.portfolio.minimumCompletion) {
            inputMinimum.value = configPAN.portfolio.minimumCompletion;
            console.log('[chargerConfigurationPAN] minimumCompletion chargé:', configPAN.portfolio.minimumCompletion);
        }

        const inputNombreTotal = document.getElementById('configNombreTotal');
        if (inputNombreTotal && configPAN.portfolio.nombreTotal) {
            inputNombreTotal.value = configPAN.portfolio.nombreTotal;
            console.log('[chargerConfigurationPAN] nombreTotal chargé:', configPAN.portfolio.nombreTotal);
        }

        const checkDecoupler = document.getElementById('decouplerPR');
        if (checkDecoupler) {
            checkDecoupler.checked = configPAN.portfolio.decouplerPR === true;
        }

        // Charger les règles de conformité
        if (configPAN.portfolio.reglesConformite) {
            // D'abord peupler les sélecteurs avec les niveaux de l'échelle
            populerSelecteursNiveaux();
            // Puis charger les valeurs sauvegardées
            chargerReglesConformiteConfig(configPAN.portfolio.reglesConformite);
        }

        // Mettre à jour l'affichage des détails
        toggleConfigPortfolio();
    }

    // Charger configuration des jetons
    if (configPAN.jetons) {
        const checkJetons = document.getElementById('jetonsActif');
        if (checkJetons) {
            checkJetons.checked = configPAN.jetons.actif !== false;
        }

        const inputNombreJetons = document.getElementById('nombreJetonsParEleve');
        if (inputNombreJetons && configPAN.jetons.nombreParEleve) {
            inputNombreJetons.value = configPAN.jetons.nombreParEleve;
        }

        // Jetons de délai
        if (configPAN.jetons.delai) {
            const checkDelai = document.getElementById('jetonDelaiActif');
            if (checkDelai) {
                checkDelai.checked = configPAN.jetons.delai.actif !== false;
            }

            const inputDuree = document.getElementById('dureeDelai');
            if (inputDuree && configPAN.jetons.delai.dureeJours) {
                inputDuree.value = configPAN.jetons.delai.dureeJours;
            }
        }

        // Jetons de reprise
        if (configPAN.jetons.reprise) {
            const checkReprise = document.getElementById('jetonRepriseActif');
            if (checkReprise) {
                checkReprise.checked = configPAN.jetons.reprise.actif !== false;
            }

            const radioArchiver = document.getElementById('archiverOriginale');
            const radioSupprimer = document.getElementById('supprimerOriginale');
            if (configPAN.jetons.reprise.archiverOriginale === true) {
                if (radioArchiver) radioArchiver.checked = true;
            } else {
                if (radioSupprimer) radioSupprimer.checked = true;
            }
        }

        // Jetons de reprise ciblée
        if (configPAN.jetons.repriseCiblee) {
            const checkRepriseCiblee = document.getElementById('jetonRepriseCibleeActif');
            if (checkRepriseCiblee) {
                checkRepriseCiblee.checked = configPAN.jetons.repriseCiblee.actif !== false;
            }

            // 🆕 Beta 95.7 : Peupler le dropdown AVANT de définir la valeur
            peuplerDropdownPlafondNoteCiblee();

            const selectPlafond = document.getElementById('plafondNoteCiblee');
            if (selectPlafond && configPAN.jetons.repriseCiblee.plafondNote) {
                selectPlafond.value = configPAN.jetons.repriseCiblee.plafondNote;
            }

            const radioArchiverCiblee = document.getElementById('archiverOriginaleCiblee');
            const radioSupprimerCiblee = document.getElementById('supprimerOriginaleCiblee');
            if (configPAN.jetons.repriseCiblee.archiverOriginale === true) {
                if (radioArchiverCiblee) radioArchiverCiblee.checked = true;
            } else {
                if (radioSupprimerCiblee) radioSupprimerCiblee.checked = true;
            }
        }

        // Types personnalisés
        if (configPAN.jetons.typesPersonnalises) {
            afficherJetonsPersonnalises(configPAN.jetons.typesPersonnalises);
        }

        // Mettre à jour l'affichage des jetons
        toggleConfigJetons();
    }

    // Actualiser l'affichage des cartes
    afficherCartesExtras();
}

/* ===============================
   MISE À JOUR DU STATUT
   =============================== */

/**
 * Met à jour l'affichage du statut de configuration
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les modalités depuis localStorage
 * 2. Détermine le statut selon les valeurs
 * 3. Met à jour #statutModalites avec HTML formaté
 */
function mettreAJourStatutModalites() {
    const modalites = db.getSync('modalitesEvaluation', {});
    const statutDiv = document.getElementById('statutModalites');

    if (!statutDiv) {
        console.error('Element #statutModalites non trouvé');
        return;
    }

    // Vérifier le statut selon la pratique choisie
    if (!modalites.pratique) {
        statutDiv.innerHTML = '<span style="color: var(--risque-critique);">✗ À configurer</span>';
    } else if (modalites.pratique === 'sommative') {
        statutDiv.innerHTML = '<span style="color: var(--vert-moyen);">✓ Sommative traditionnelle (en %)</span>';
    } else if (modalites.pratique === 'pan-maitrise' && modalites.typePAN) {
        const types = {
            'maitrise': 'Maîtrise',
            'specifications': 'Spécifications',
            'denotation': 'Dénotation'
        };
        statutDiv.innerHTML = `
            <span style="color: var(--vert-moyen);">✓ Alternative (${types[modalites.typePAN]})</span>
            <button onclick="afficherParametresPAN()" class="btn btn-secondaire" style="margin-left: 15px; padding: 4px 12px; font-size: 0.85rem;">
                Modifier les paramètres
            </button>
        `;
    } else if (modalites.pratique === 'pan-maitrise' && !modalites.typePAN) {
        statutDiv.innerHTML = '<span style="color: var(--orange-accent);">⚠ Choisir un type de PAN</span>';
    }
}

/* ===============================
   GESTION DES JETONS PERSONNALISÉS
   =============================== */

// Variable globale temporaire pour stocker les jetons personnalisés
window.jetonsPersonnalisesTemporaire = [];

/**
 * Affiche la liste des types de jetons personnalisés
 * @param {Array} jetonsPersonnalises - Liste des types personnalisés
 */
function afficherJetonsPersonnalises(jetonsPersonnalises) {
    window.jetonsPersonnalisesTemporaire = jetonsPersonnalises || [];
    const liste = document.getElementById('listeJetonsPersonnalises');
    if (!liste) return;

    if (jetonsPersonnalises.length === 0) {
        liste.innerHTML = '';
        return;
    }

    liste.innerHTML = jetonsPersonnalises.map((jeton, index) => `
        <div style="padding: 10px; background: var(--bleu-tres-pale); border-radius: 6px; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <strong style="flex: 1;">${jeton.nom}</strong>
                <button type="button" class="btn btn-danger" onclick="supprimerTypeJetonPersonnalise(${index})" style="margin-left: 8px;">
                    Supprimer
                </button>
            </div>
            <p class="text-muted" style="margin: 0; font-size: 0.85rem;">${jeton.description}</p>
        </div>
    `).join('');
}

/**
 * Ajoute un nouveau type de jeton personnalisé
 */
function ajouterTypeJetonPersonnalise() {
    const nom = prompt('Nom du type de jeton :', 'Jeton de...');
    if (!nom || nom.trim() === '') {
        alert('Le nom du jeton ne peut pas être vide.');
        return;
    }

    const description = prompt('Description du jeton :', 'Permet de...');
    if (!description || description.trim() === '') {
        alert('La description du jeton ne peut pas être vide.');
        return;
    }

    const nouveauJeton = {
        id: 'jeton_' + Date.now(),
        nom: nom.trim(),
        description: description.trim()
    };

    window.jetonsPersonnalisesTemporaire.push(nouveauJeton);
    afficherJetonsPersonnalises(window.jetonsPersonnalisesTemporaire);
}

/**
 * Supprime un type de jeton personnalisé
 * @param {number} index - Index du jeton à supprimer
 */
function supprimerTypeJetonPersonnalise(index) {
    if (!confirm('Es-tu sûr de vouloir supprimer ce type de jeton ?')) {
        return;
    }

    window.jetonsPersonnalisesTemporaire.splice(index, 1);
    afficherJetonsPersonnalises(window.jetonsPersonnalisesTemporaire);
}

// Exporter les fonctions pour qu'elles soient accessibles globalement
window.afficherJetonsPersonnalises = afficherJetonsPersonnalises;
window.ajouterTypeJetonPersonnalise = ajouterTypeJetonPersonnalise;
window.supprimerTypeJetonPersonnalise = supprimerTypeJetonPersonnalise;

/* ===============================
   UTILITAIRES PUBLICS
   =============================== */

/**
 * Récupère la configuration de notation complète
 * Fonction utilitaire pour les autres modules
 * 
 * @returns {Object} Configuration complète de notation
 * 
 * UTILISÉ PAR:
 * - Module tableau-bord pour savoir quels indices afficher
 * - Module évaluations pour adapter le comportement
 * - Module statistiques pour les calculs
 */
function obtenirConfigurationNotation() {
    return db.getSync('modalitesEvaluation', {});
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * STRUCTURE LOCALSTORAGE:
 * {
 *   pratique: "sommative" | "alternative",
 *   typePAN: "maitrise" | "specifications" | "denotation" | null,
 *   affichageTableauBord: {
 *     afficherSommatif: boolean,
 *     afficherAlternatif: boolean
 *   },
 *   dateConfiguration: "2025-10-20T..."
 * }
 * 
 * ORDRE D'INITIALISATION:
 * 1. Charger le module 01-config.js (variables globales)
 * 2. Charger ce module 12-pratiques.js
 * 3. Appeler initialiserModulePratiques() depuis 99-main.js
 * 
 * COMPATIBILITÉ:
 * - Nécessite ES6+ pour les arrow functions et template literals
 * - Fonctionne avec tous les navigateurs modernes
 * - Pas de dépendances externes
 */

/* ===============================
   GRILLE DE RÉFÉRENCE POUR DÉPISTAGE
   =============================== */

/**
 * Charge les grilles disponibles dans le sélecteur de grille de référence
 * Appelée au chargement et après sauvegarde
 */
function chargerGrillesDisponibles() {
    const select = document.getElementById('grilleReferenceDepistage');
    if (!select) return;

    // Sauvegarder la valeur actuellement sélectionnée
    const valeurActuelle = select.value;

    // Lire les grilles depuis localStorage
    const grilles = db.getSync('grillesTemplates', []);

    // Vider le select
    select.innerHTML = '<option value="">-- Sélectionner une grille --</option>';

    // Ajouter chaque grille comme option
    grilles.forEach(grille => {
        const option = document.createElement('option');
        option.value = grille.id;
        option.textContent = grille.nom;
        select.appendChild(option);
    });

    // Restaurer la valeur sélectionnée si elle existe toujours
    if (valeurActuelle) {
        select.value = valeurActuelle;
    }

    console.log(`✅ ${grilles.length} grille(s) chargée(s) dans le sélecteur de référence`);
}

// ============================================================================
// GESTION DES PRATIQUES CONFIGURABLES (Beta 92)
// ============================================================================

/**
 * Migration: Ajoute les établissements manquants aux pratiques existantes
 */
function migrerEtablissementsPratiques() {
    const pratiques = db.getSync('pratiquesConfigurables', []);
    let modifie = false;

    // Mapping des auteurs vers établissements
    const etablissements = {
        'Bruno V.': 'Cégep Laurendeau',
        'Marie-Hélène L.': 'Cégep Valleyfield',
        'François A.-H.': 'Cégep Laurendeau',
        'Grégoire Bédard': 'Cégep Drummond'
    };

    pratiques.forEach(p => {
        if (p.auteur && !p.etablissement && etablissements[p.auteur]) {
            p.etablissement = etablissements[p.auteur];
            modifie = true;
            console.log(`[Migration] Ajout établissement pour ${p.auteur}: ${p.etablissement}`);
        }
    });

    if (modifie) {
        db.setSync('pratiquesConfigurables', pratiques);
        console.log('✅ [Migration] Établissements ajoutés aux pratiques existantes');
        return true;
    }

    return false;
}

/**
 * Affiche la liste de toutes les pratiques (codées + configurables)
 * Génère des cartes avec les actions disponibles
 */
async function afficherListePratiques() {
    // Exécuter la migration si nécessaire
    migrerEtablissementsPratiques();
    const container = document.getElementById('listePratiques');
    if (!container) return;

    try {
        // Cette section n'affiche plus rien - tout est dans le modal "Bibliothèque de pratiques"
        container.innerHTML = '';
    } catch (error) {
        console.error('Erreur lors de l\'affichage des pratiques:', error);
        container.innerHTML = `
            <div class="info-box info-box--attention">
                <strong>Erreur</strong> : Impossible de charger les pratiques
            </div>
        `;
    }
}

/**
 * Génère le HTML du sélecteur de pratique par défaut
 * @returns {string} HTML du sélecteur
 */
function genererSelecteurPratiqueParDefaut() {
    const pratiqueDefaut = getPratiqueParDefaut();

    return `
        <div style="margin-bottom: 15px; padding: 12px; background: var(--bleu-tres-pale); border-left: 4px solid var(--accent-primaire);">
            <div style="margin-bottom: 8px;">
                <strong style="font-size: 0.9rem; color: var(--accent-primaire);">Pratique par défaut</strong>
            </div>
            <p style="margin: 0 0 10px 0; font-size: 0.8rem; line-height: 1.4; color: var(--gris-moyen);">
                Présélectionnée lors de la création de nouveaux cours
            </p>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                <label style="cursor: pointer; display: flex; align-items: center;">
                    <input
                        type="radio"
                        name="pratiqueDefaut"
                        value="sommative"
                        ${pratiqueDefaut === 'sommative' ? 'checked' : ''}
                        onchange="changerPratiqueParDefaut('sommative')">
                    <span style="margin-left: 8px;">Sommative</span>
                </label>
                <label style="cursor: pointer; display: flex; align-items: center;">
                    <input
                        type="radio"
                        name="pratiqueDefaut"
                        value="pan-standards"
                        ${pratiqueDefaut === 'pan-standards' || pratiqueDefaut === 'pan-maitrise' ? 'checked' : ''}
                        onchange="changerPratiqueParDefaut('pan-standards')">
                    <span style="margin-left: 8px;">PAN-Standards</span>
                </label>
                <label style="cursor: pointer; display: flex; align-items: center;">
                    <input
                        type="radio"
                        name="pratiqueDefaut"
                        value="pan-specifications"
                        ${pratiqueDefaut === 'pan-specifications' || pratiqueDefaut === 'specifications' ? 'checked' : ''}
                        onchange="changerPratiqueParDefaut('pan-specifications')">
                    <span style="margin-left: 8px;">PAN-Spécifications</span>
                </label>
                <label style="cursor: pointer; display: flex; align-items: center; opacity: 0.5;" title="Bientôt disponible">
                    <input
                        type="radio"
                        name="pratiqueDefaut"
                        value="pan-denotation"
                        disabled>
                    <span style="margin-left: 8px;">PAN-Dénotation (bientôt)</span>
                </label>
            </div>
        </div>
    `;
}

/**
 * Génère le HTML d'une carte de pratique (avec toggle collapsible)
 * ✅ MODIFICATION (8 décembre 2025) : Carte collapsible pour optimiser l'espace vertical
 * @param {object} pratique - Objet pratique {id, nom, description, auteur}
 * @param {boolean} estActive - True si c'est la pratique active
 * @param {boolean} modifiable - True si la pratique peut être éditée/supprimée
 * @returns {string} HTML de la carte
 */
function genererCartePratique(pratique, estActive, modifiable) {
    console.log(`[genererCartePratique] ${pratique.id} - estActive:${estActive}, modifiable:${modifiable}`);
    console.log(`   auteur: "${pratique.auteur}", etablissement: "${pratique.etablissement}"`);

    const badgeActif = estActive ? `<span class="badge-pratique badge-pratique-active">ACTIVE</span>` : '';

    // NOUVEAU Beta 91 : Compter le nombre de cours utilisant cette pratique
    const coursUtilisant = getCoursUtilisantPratique(pratique.id);
    const nbCours = coursUtilisant.length;
    const badgeParDefaut = (getPratiqueParDefaut() === pratique.id) ?
        `<span class="badge-pratique badge-pratique-defaut">PAR DÉFAUT</span>` : '';

    // ✅ AJOUT (8 décembre 2025) : Bouton Activer OU Désactiver selon l'état
    const boutonActiver = !estActive
        ? `<button class="btn btn-tres-compact btn-confirmer" onclick="activerPratique('${pratique.id}')">Activer</button>`
        : `<button class="btn btn-tres-compact btn-secondaire" onclick="desactiverPratique('${pratique.id}')">Désactiver</button>`;

    const boutonsModification = modifiable ? `
        <button class="btn btn-tres-compact btn-modifier" onclick="editerPratique('${pratique.id}')">Éditer</button>
        <button class="btn btn-tres-compact btn-secondaire" onclick="dupliquerPratique('${pratique.id}')">Dupliquer</button>
        <button class="btn btn-tres-compact btn-secondaire" onclick="exporterPratiqueVersJSON('${pratique.id}')">Exporter</button>
        <button class="btn btn-tres-compact btn-supprimer" onclick="supprimerPratique('${pratique.id}')">Supprimer</button>
    ` : '';

    const auteur = pratique.auteur ?
        `Par ${pratique.auteur}${pratique.etablissement ? ` (${pratique.etablissement})` : ''}` : '';

    // Par défaut : la pratique ACTIVE est ouverte, les autres sont fermées
    const estOuvert = estActive;
    const iconeToggle = estOuvert ? '▲' : '▼';
    const displayDetails = estOuvert ? 'block' : 'none';

    return `
        <div class="carte pratique-carte" data-pratique-id="${pratique.id}">
            <!-- Header cliquable (toujours visible) -->
            <div class="pratique-header" onclick="togglePratique('${pratique.id}')" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                    <strong style="font-size: 1rem; color: var(--accent-primaire);">${pratique.nom}</strong>
                    ${badgeActif}
                    ${badgeParDefaut}
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="text-align: right;">
                        <div style="font-size: 1.2rem; font-weight: 600; color: var(--accent-primaire);">${nbCours}</div>
                        <div style="font-size: 0.75rem; color: var(--gris-moyen);">cours</div>
                    </div>
                    <div class="pratique-toggle-icon" style="font-size: 1.2rem; color: var(--accent-primaire); user-select: none;">
                        ${iconeToggle}
                    </div>
                </div>
            </div>

            <!-- Détails collapsibles -->
            <div class="pratique-details" id="pratique-details-${pratique.id}" style="display: ${displayDetails}; transition: all 0.3s ease;">
                <!-- Séparateur visuel -->
                <div style="border-top: 1px solid var(--gris-leger); margin-bottom: 12px; padding-top: 12px;">
                    ${auteur ? `<div style="margin-bottom: 6px; color: var(--gris-moyen); font-size: 0.85rem;">${auteur}</div>` : ''}
                    ${pratique.description ? `<p style="color: var(--gris-moyen); font-size: 0.85rem; margin: 0; line-height: 1.4;">${pratique.description}</p>` : ''}
                    ${nbCours > 0 ? `<div style="margin-top: 8px; color: var(--gris-moyen); font-size: 0.85rem;"><strong>Cours :</strong> ${coursUtilisant.map(c => c.sigle).join(', ')}</div>` : ''}
                </div>

                <!-- Boutons d'action -->
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${boutonActiver}
                    ${boutonsModification}
                </div>
            </div>
        </div>
    `;
}

/**
 * Toggle l'affichage des détails d'une carte de pratique
 * ✅ AJOUT (8 décembre 2025) : Gestion collapsible des cartes
 * @param {string} pratiqueId - ID de la pratique à toggle
 */
function togglePratique(pratiqueId) {
    const details = document.getElementById(`pratique-details-${pratiqueId}`);
    const carte = document.querySelector(`[data-pratique-id="${pratiqueId}"]`);

    if (!details || !carte) return;

    // Toggle display
    const estOuvert = !details.classList.contains('u-hide');
    toggleDisplay(details, !estOuvert);

    // Mettre à jour l'icône
    const icone = carte.querySelector('.pratique-toggle-icon');
    if (icone) {
        icone.textContent = estOuvert ? '▼' : '▲';
    }
}

/**
 * Active une pratique
 * @param {string} id - ID de la pratique à activer
 */
async function activerPratique(id, confirmer = true) {
    // Vérifier si la pratique est déjà active
    const modalites = db.getSync('modalitesEvaluation', {});
    if (modalites.pratique === id) {
        console.log('Pratique déjà active:', id);
        // ✅ NOUVEAU (9 décembre 2025) : Même si déjà active, recharger sa config
        // pour afficher ses options spécifiques à droite
        chargerConfigurationPratique(id);
        return;
    }

    // Demander confirmation seulement si demandé (ex: depuis un bouton "Activer")
    if (confirmer && !confirm(`Activer cette pratique ?\n\nToutes les évaluations futures utiliseront cette pratique.`)) {
        return;
    }

    try {
        await PratiqueManager.changerPratiqueActive(id);
        console.log('✅ Pratique activée:', id);

        // ✅ NOUVEAU (9 décembre 2025) : Charger la configuration spécifique de cette pratique
        chargerConfigurationPratique(id);

        // Recharger l'affichage de la sidebar
        await afficherListePratiquesSidebar();

        // Recharger l'affichage principal si nécessaire
        await afficherListePratiques();

        // Notification seulement si confirmation était demandée
        if (confirmer) {
            alert(`✅ Pratique activée avec succès !\n\nLes évaluations futures utiliseront cette pratique.`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'activation:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

/**
 * Sauvegarde une partie de la configuration dans la pratique active
 * ✅ NOUVEAU (9 décembre 2025)
 * @param {string} cle - Nom de la clé à sauvegarder ('affichage', 'portfolio', 'jetons')
 * @param {object} valeur - Valeur à sauvegarder
 */
function sauvegarderDansConfiguration(cle, valeur) {
    const modalites = db.getSync('modalitesEvaluation', {});
    const pratiqueActiveId = modalites.pratique;

    if (!pratiqueActiveId) {
        console.warn('[sauvegarderDansConfiguration] Aucune pratique active');
        return;
    }

    // Charger la pratique depuis pratiquesConfigurables
    const pratiques = db.getSync('pratiquesConfigurables', []);
    const index = pratiques.findIndex(p => p.id === pratiqueActiveId);

    if (index === -1) {
        console.warn('[sauvegarderDansConfiguration] Pratique introuvable:', pratiqueActiveId);
        return;
    }

    // Initialiser config si nécessaire
    if (!pratiques[index].config) {
        pratiques[index].config = {};
    }

    // Sauvegarder la valeur dans la config de la pratique
    pratiques[index].config[cle] = valeur;

    // Sauvegarder les pratiques
    db.setSync('pratiquesConfigurables', pratiques);

    console.log(`[sauvegarderDansConfiguration] ✅ ${cle} sauvegardé dans pratique ${pratiqueActiveId}:`, valeur);
}

/**
 * Charge la configuration spécifique d'une pratique et l'applique à l'interface
 * ✅ NOUVEAU (9 décembre 2025)
 * @param {string} id - ID de la pratique dont on veut charger la config
 */
function chargerConfigurationPratique(id) {
    console.log('[chargerConfigurationPratique] Chargement config pour:', id);

    // Charger la pratique depuis pratiquesConfigurables
    const pratiques = db.getSync('pratiquesConfigurables', []);
    const pratique = pratiques.find(p => p.id === id);

    if (!pratique || !pratique.config) {
        console.warn('[chargerConfigurationPratique] Pratique ou config introuvable:', id);
        // Si la pratique n'a pas de config personnalisée, utiliser les valeurs par défaut
        chargerModalites();
        return;
    }

    const config = pratique.config;
    const modalites = db.getSync('modalitesEvaluation', {});

    // ✅ NOUVEAU (9 décembre 2025) : Stocker l'ID de la pratique sélectionnée pour l'affichage sidebar
    sessionStorage.setItem('pratiqueSelectionnee', id);

    // ✅ NOUVEAU : Afficher la zone de configuration et masquer l'accueil
    const zoneAccueil = document.getElementById('accueilPratiques');
    const zoneConfiguration = document.getElementById('zoneConfigurationPratique');

    toggleDisplay(zoneAccueil, false);
    toggleDisplay(zoneConfiguration, true);

    // ✅ NOUVEAU : Remplir l'en-tête avec les infos de la pratique
    const nomPratique = document.getElementById('nomPratiqueSelectionnee');
    const descriptionPratique = document.getElementById('descriptionPratiqueSelectionnee');

    if (nomPratique) {
        nomPratique.textContent = pratique.nom || 'Sans nom';
        nomPratique.dataset.pratiqueId = id; // Stocker l'ID pour le bouton "Activer"
    }
    if (descriptionPratique) {
        descriptionPratique.textContent = pratique.description || 'Aucune description';
    }

    // ✅ NOUVEAU (9 décembre 2025) : Rafraîchir la sidebar pour mettre à jour le style de sélection
    afficherListePratiquesSidebar();

    // ✅ 1. Appliquer la configuration d'affichage
    if (config.affichage) {
        const modeComparatif = config.affichage.modeComparatif || false;

        if (modeComparatif) {
            // Mode comparatif : afficher les deux
            modalites.affichageTableauBord = {
                afficherSommatif: true,
                afficherAlternatif: true
            };
        } else {
            // Mode normal : afficher uniquement la pratique principale
            if (modalites.pratique === 'sommative') {
                modalites.affichageTableauBord = {
                    afficherSommatif: true,
                    afficherAlternatif: false
                };
            } else if (modalites.pratique === 'pan-maitrise') {
                modalites.affichageTableauBord = {
                    afficherSommatif: false,
                    afficherAlternatif: true
                };
            }
        }

        // Mettre à jour la checkbox dans l'interface
        const checkComparatif = document.getElementById('modeComparatif');
        if (checkComparatif) {
            checkComparatif.checked = modeComparatif;
        }
    }

    // ✅ 2. Appliquer la configuration du portfolio
    if (config.portfolio) {
        if (!modalites.configPAN) {
            modalites.configPAN = {};
        }
        modalites.configPAN.portfolio = config.portfolio;
    }

    // ✅ 3. Appliquer la configuration des jetons
    if (config.jetons) {
        if (!modalites.configPAN) {
            modalites.configPAN = {};
        }
        modalites.configPAN.jetons = config.jetons;
    }

    // Sauvegarder dans modalitesEvaluation
    db.setSync('modalitesEvaluation', modalites);

    // ✅ 4. Masquer/afficher les sections selon la configuration
    afficherSectionsSelonConfig(config);

    // Recharger l'interface pour afficher la config
    chargerModalites();
    chargerConfigurationPAN();

    console.log('[chargerConfigurationPratique] ✅ Config appliquée:', {
        affichage: config.affichage,
        portfolio: config.portfolio,
        jetons: config.jetons
    });
}

/**
 * Affiche ou masque les sections selon la configuration de la pratique
 * ✅ NOUVEAU (9 décembre 2025)
 * @param {object} config - Configuration de la pratique
 */
function afficherSectionsSelonConfig(config) {
    // Section Options d'affichage : toujours visible
    const carteOptionsAffichage = document.getElementById('carteOptionsAffichage');
    if (carteOptionsAffichage) {
        carteOptionsAffichage.classList.remove('u-hide');
        // Fermer l'accordéon par défaut
        const accordeonOptions = document.getElementById('accordeonOptionsAffichage');
        const iconeOptions = carteOptionsAffichage.querySelector('.accordeon-icone');
        if (accordeonOptions) {
            accordeonOptions.classList.remove('ouvert');
            if (iconeOptions) iconeOptions.classList.remove('ouvert');
        }
    }

    // Section Évaluation du français : toujours visible
    const carteEvaluationFrancais = document.getElementById('carteEvaluationFrancais');
    if (carteEvaluationFrancais) {
        carteEvaluationFrancais.classList.remove('u-hide');
        // Fermer l'accordéon par défaut
        const accordeonFrancais = document.getElementById('accordeonEvaluationFrancais');
        const iconeFrancais = carteEvaluationFrancais.querySelector('.accordeon-icone');
        if (accordeonFrancais) {
            accordeonFrancais.classList.remove('ouvert');
            if (iconeFrancais) iconeFrancais.classList.remove('ouvert');
        }
    }

    // Section Portfolio : afficher seulement si actif
    const cartePortfolio = document.getElementById('cartePortfolio');
    if (cartePortfolio) {
        const portfolioActif = config.portfolio && config.portfolio.actif !== false;
        toggleDisplay(cartePortfolio, portfolioActif);

        if (portfolioActif) {
            // Fermer l'accordéon par défaut
            const accordeonPortfolio = document.getElementById('accordeonPortfolio');
            const iconePortfolio = cartePortfolio.querySelector('.accordeon-icone');
            if (accordeonPortfolio) {
                accordeonPortfolio.classList.remove('ouvert');
                if (iconePortfolio) iconePortfolio.classList.remove('ouvert');
            }
        }
    }

    // Section Jetons : afficher seulement si actif
    const carteJetons = document.getElementById('carteJetons');
    if (carteJetons) {
        const jetonsActif = config.jetons && config.jetons.actif !== false;
        toggleDisplay(carteJetons, jetonsActif);

        if (jetonsActif) {
            // Fermer l'accordéon par défaut
            const accordeonJetons = document.getElementById('accordeonJetons');
            const iconeJetons = carteJetons.querySelector('.accordeon-icone');
            if (accordeonJetons) {
                accordeonJetons.classList.remove('ouvert');
                if (iconeJetons) iconeJetons.classList.remove('ouvert');
            }
        }
    }

    console.log('[afficherSectionsSelonConfig] ✅ Sections mises à jour:', {
        optionsAffichage: 'visible',
        evaluationFrancais: 'visible',
        portfolio: config.portfolio?.actif ? 'visible' : 'masquée',
        jetons: config.jetons?.actif ? 'visible' : 'masquée'
    });
}

/**
 * Désactive une pratique (revient à la pratique par défaut)
 * ✅ AJOUT (8 décembre 2025)
 * @param {string} id - ID de la pratique à désactiver
 */
async function desactiverPratique(id) {
    const pratiqueDefaut = getPratiqueParDefaut();

    if (!confirm(`Désactiver cette pratique ?\n\nLa pratique par défaut (${pratiqueDefaut === 'pan-maitrise' ? 'PAN-Standards' : 'Sommative'}) sera activée à la place.`)) {
        return;
    }

    try {
        // Activer la pratique par défaut à la place
        await PratiqueManager.changerPratiqueActive(pratiqueDefaut);
        console.log('✅ Pratique désactivée, retour à la pratique par défaut:', pratiqueDefaut);

        // Recharger l'affichage
        await afficherListePratiques();

        // Notification
        alert(`✅ Pratique désactivée avec succès !\n\nLa pratique par défaut est maintenant active.`);
    } catch (error) {
        console.error('Erreur lors de la désactivation:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

/**
 * Ouvre le wizard pour éditer la pratique actuellement active
 */
async function editerPratiqueActive() {
    const modalites = db.getSync('modalitesEvaluation', {});
    const pratiqueActiveId = modalites.pratique;

    if (!pratiqueActiveId) {
        alert('❌ Aucune pratique active\n\nVeuillez d\'abord activer une pratique dans la sidebar.');
        return;
    }

    // Vérifier si c'est une pratique codée (canevas de base)
    const pratiquesCodees = ['pan-standards', 'sommative', 'pan-specifications', 'pan-maitrise', 'specifications'];
    if (pratiquesCodees.includes(pratiqueActiveId)) {
        alert('❌ Impossible de modifier un canevas de base\n\nLes canevas de base (PAN-Standards, Sommative, PAN-Spécifications) ne peuvent pas être modifiés.\n\nVous pouvez créer une nouvelle pratique basée sur ces canevas.');
        return;
    }

    // Éditer la pratique configurable
    await editerPratique(pratiqueActiveId);
}

/**
 * Active la pratique actuellement affichée dans la zone de configuration
 * Wrapper qui récupère l'ID depuis le DOM et appelle la fonction activerPratique principale
 */
async function activerPratiqueAffichee() {
    // Récupérer l'ID de la pratique affichée
    const nomElement = document.getElementById('nomPratiqueSelectionnee');
    if (!nomElement || !nomElement.dataset.pratiqueId) {
        alert('❌ Erreur\n\nImpossible d\'identifier la pratique à activer.');
        return;
    }

    const pratiqueId = nomElement.dataset.pratiqueId;

    // Appeler la fonction activerPratique existante avec confirmation
    await activerPratique(pratiqueId, true);
}

/**
 * Éditer une pratique
 * @param {string} id - ID de la pratique à éditer
 */
async function editerPratique(id) {
    try {
        // Charger la pratique à éditer
        const pratiques = db.getSync('pratiquesConfigurables', []);
        const pratique = pratiques.find(p => p.id === id);

        if (!pratique) {
            throw new Error('Pratique introuvable');
        }

        const config = pratique.config;

        // Ouvrir le wizard en mode édition
        ouvrirWizardPratique(true, id);

        // Pré-remplir tous les champs
        setTimeout(() => {
            preremplirWizardPourEdition(config);
        }, 100); // Petit délai pour s'assurer que le wizard est bien ouvert

    } catch (error) {
        console.error('Erreur lors de l\'édition:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

/**
 * Ouvre le wizard en mode création ou édition
 * @param {boolean} modeEdition - true si mode édition, false si création
 * @param {string} idPratique - ID de la pratique à éditer (si mode édition)
 *
 * Note Beta 95 : Le modal est dans une section legacy masquée.
 * On le déplace dans le body pour qu'il soit visible depuis n'importe où.
 */
function ouvrirWizardPratique(modeEdition = false, idPratique = null) {
    const modal = document.getElementById('modalWizardPratique');
    if (!modal) return;

    // Beta 95 : Déplacer le modal dans le body s'il est dans une section masquée
    // Utiliser closest() pour vérifier si un ancêtre a la classe legacy-hidden
    if (!modal.dataset.movedToBody) {
        const legacyParent = modal.closest('.legacy-hidden');
        if (legacyParent) {
            modal.dataset.originalParentId = legacyParent.id || '';
            document.body.appendChild(modal);
            modal.dataset.movedToBody = 'true';
            console.log('[Pratiques] Modal wizard déplacé vers body (depuis section legacy)');
        }
    }

    // Stocker le mode et l'ID pour utilisation ultérieure
    modal.dataset.modeEdition = modeEdition;
    modal.dataset.idPratique = idPratique || '';

    // Mettre à jour le titre du wizard
    const titre = document.querySelector('#modalWizardPratique h2');
    if (titre) {
        titre.textContent = modeEdition ? 'Modifions ensemble ta pratique !' : 'Créons ensemble ta pratique !';
    }

    // Mettre à jour le texte du bouton final
    const btnCreer = document.getElementById('wizard-btn-creer');
    if (btnCreer) {
        btnCreer.textContent = modeEdition ? '✓ Sauvegarder' : '✓ Créer la pratique';
    }

    // Afficher/masquer le bouton Supprimer selon le mode
    const btnSupprimer = document.getElementById('wizard-btn-supprimer');
    if (btnSupprimer) {
        toggleDisplay(btnSupprimer, modeEdition);
    }

    // Réinitialiser si mode création
    if (!modeEdition) {
        resetterWizard();
    }

    // Afficher le modal
    modal.classList.add('actif');
    wizardEtapeActuelle = 1;
    afficherEtapeWizard(1);

    // Charger les données dynamiques
    chargerEchellesWizard();
    chargerGrillesWizard();
}

/**
 * Pré-remplit tous les champs du wizard avec les données d'une pratique
 * @param {object} config - Configuration de la pratique à éditer
 */
function preremplirWizardPourEdition(config) {
    console.log('[preremplirWizardPourEdition] Début pré-remplissage', config);

    // Étape 1 : Informations de base
    document.getElementById('wizard-nom').value = config.nom || '';
    document.getElementById('wizard-auteur').value = config.auteur || '';
    document.getElementById('wizard-etablissement').value = config.etablissement || '';
    document.getElementById('wizard-description').value = config.description || '';
    document.getElementById('wizard-discipline').value = config.discipline || '';

    // Étape 2 : Échelle
    if (config.echelle && config.echelle.echelle_id) {
        setTimeout(() => {
            const selectEchelle = document.getElementById('wizard-echelle-id');
            if (selectEchelle) {
                selectEchelle.value = config.echelle.echelle_id;
                afficherPreviewEchelleWizard();
            }
        }, 200);
    }

    // Étape 3 : Structure
    if (config.structure_evaluations) {
        const selectStructure = document.getElementById('wizard-structure-type');
        if (selectStructure) {
            selectStructure.value = config.structure_evaluations.type || '';
            afficherConfigStructure();
        }

        // Pré-remplir les champs spécifiques au portfolio
        setTimeout(() => {
            if (config.structure_evaluations.type === 'portfolio') {
                const selectSelection = document.getElementById('wizard-portfolio-selection');
                const inputNombre = document.getElementById('wizard-portfolio-nombre');

                if (selectSelection && config.structure_evaluations.selection) {
                    selectSelection.value = config.structure_evaluations.selection;
                }
                if (inputNombre && config.structure_evaluations.n_artefacts) {
                    inputNombre.value = config.structure_evaluations.n_artefacts;
                }
            }
        }, 300);
    }

    // Étape 4 : Calcul
    if (config.calcul_note) {
        const selectCalcul = document.getElementById('wizard-calcul-methode');
        if (selectCalcul) {
            selectCalcul.value = config.calcul_note.methode || '';
            afficherConfigCalcul();
        }
    }

    // Étape 5 : Reprises
    if (config.systeme_reprises) {
        const selectReprises = document.getElementById('wizard-reprises-type');
        if (selectReprises) {
            selectReprises.value = config.systeme_reprises.type || '';
            afficherConfigReprises();
        }

        // Checkboxes reprises
        setTimeout(() => {
            const checkBureau = document.getElementById('wizard-reprises-bureau');
            const checkRetrogradable = document.getElementById('wizard-niveau-retrogradable');
            const checkJetons = document.getElementById('wizard-utiliser-jetons');

            if (checkBureau) checkBureau.checked = config.systeme_reprises.reprises_bureau || false;
            if (checkRetrogradable) checkRetrogradable.checked = config.systeme_reprises.niveau_retrogradable || false;
            if (checkJetons) {
                checkJetons.checked = config.systeme_reprises.systeme_jetons_actif || false;
                toggleResumeJetonsWizard();
            }
        }, 300);
    }

    // Étape 6 : Critères
    if (config.gestion_criteres && config.gestion_criteres.grille_id) {
        setTimeout(() => {
            const selectGrille = document.getElementById('wizard-grille-id');
            if (selectGrille) {
                selectGrille.value = config.gestion_criteres.grille_id;
                afficherPreviewGrilleWizard();
            }
        }, 200);
    }

    // Étape 7 : Seuils (lecture seule depuis Réglages, rien à pré-remplir)

    // Étape 8 : Interface
    if (config.interface) {
        const checkNotes = document.getElementById('wizard-afficher-notes');
        const checkRang = document.getElementById('wizard-afficher-rang');
        const checkMoyenne = document.getElementById('wizard-afficher-moyenne');

        if (checkNotes) checkNotes.checked = config.interface.afficher_notes_chiffrees !== false;
        if (checkRang) checkRang.checked = config.interface.afficher_rang || false;
        if (checkMoyenne) checkMoyenne.checked = config.interface.afficher_moyenne_groupe || false;

        if (config.interface.terminologie) {
            document.getElementById('wizard-terme-evaluation').value = config.interface.terminologie.evaluation || 'Évaluation';
            document.getElementById('wizard-terme-critere').value = config.interface.terminologie.critere || 'Critère';
            document.getElementById('wizard-terme-note').value = config.interface.terminologie.note_finale || 'Note finale';
            document.getElementById('wizard-terme-reprise').value = config.interface.terminologie.reprise || 'Reprise';
        }
    }

    // Étape 9 : Spécifications (optionnel)
    if (config.specifications) {
        const selectTypeEval = document.getElementById('wizard-spec-type-evaluation');

        if (selectTypeEval && config.specifications.type) {
            setTimeout(() => {
                selectTypeEval.value = config.specifications.type;
                afficherConfigSpecType();

                // Attendre que les sections soient affichées
                setTimeout(() => {
                    if (config.specifications.type === 'binaire') {
                        // Pré-remplir les types de travaux
                        if (config.specifications.typesTravaux && config.specifications.typesTravaux.length > 0) {
                            // Vider la liste existante
                            const liste = document.getElementById('wizard-spec-types-travaux-liste');
                            if (liste) liste.innerHTML = '';

                            // Ajouter chaque type de travail
                            config.specifications.typesTravaux.forEach(type => {
                                ajouterTypeTravailSpec();
                                const items = document.querySelectorAll('#wizard-spec-types-travaux-liste .spec-type-travail-item');
                                const dernierItem = items[items.length - 1];

                                if (dernierItem) {
                                    dernierItem.querySelector('.spec-type-id').value = type.id || '';
                                    dernierItem.querySelector('.spec-type-nom').value = type.nom || '';
                                    dernierItem.querySelector('.spec-type-seuil').value = type.seuilAcceptable || 75;
                                    dernierItem.querySelector('.spec-type-specifications').value = (type.specifications || []).join('\n');
                                }
                            });
                        }

                        // Pré-remplir les bundles
                        if (config.specifications.tableBundles && config.specifications.tableBundles.length > 0) {
                            // Vider la liste existante
                            const listeBundles = document.getElementById('wizard-spec-bundles-liste');
                            if (listeBundles) listeBundles.innerHTML = '';

                            // Ajouter chaque bundle
                            config.specifications.tableBundles.forEach(bundle => {
                                ajouterPalierBundle();
                                const items = document.querySelectorAll('#wizard-spec-bundles-liste .spec-bundle-item');
                                const dernierItem = items[items.length - 1];

                                if (dernierItem) {
                                    dernierItem.querySelector('.bundle-note-fixe').value = bundle.noteFixe || '';
                                    dernierItem.querySelector('.bundle-label').value = bundle.label || '';
                                    dernierItem.querySelector('.bundle-description').value = bundle.description || '';
                                    dernierItem.querySelector('.bundle-requis').value = bundle.requis ? JSON.stringify(bundle.requis, null, 2) : '';
                                }
                            });
                        }

                    } else if (config.specifications.type === 'niveaux') {
                        // Pré-remplir les objectifs
                        if (config.specifications.objectifs && config.specifications.objectifs.length > 0) {
                            const inputNbObjectifs = document.getElementById('wizard-spec-nb-objectifs');
                            if (inputNbObjectifs) {
                                inputNbObjectifs.value = config.specifications.objectifs.length;
                                genererObjectifsSpec();

                                // Attendre que les objectifs soient générés
                                setTimeout(() => {
                                    const items = document.querySelectorAll('#wizard-spec-objectifs-liste .spec-objectif-item');
                                    config.specifications.objectifs.forEach((objectif, index) => {
                                        if (items[index]) {
                                            items[index].querySelector('.spec-objectif-nom').value = objectif.nom || '';
                                            items[index].querySelector('.spec-objectif-description').value = objectif.description || '';
                                        }
                                    });
                                }, 100);
                            }
                        }
                    }
                }, 200);
            }, 200);
        }
    }

    console.log('[preremplirWizardPourEdition] Pré-remplissage terminé');
}

/**
 * Dupliquer une pratique
 * @param {string} id - ID de la pratique à dupliquer
 */
async function dupliquerPratique(id) {
    const nouveauNom = prompt('Nom de la copie:', 'Copie de pratique');
    if (!nouveauNom) return;

    try {
        const pratiques = db.getSync('pratiquesConfigurables', []);
        const original = pratiques.find(p => p.id === id);

        if (!original) {
            throw new Error('Pratique introuvable');
        }

        // Créer une copie avec un nouvel ID
        const copie = {
            id: 'pratique-' + Date.now(),
            nom: nouveauNom,
            auteur: original.auteur + ' (copie)',
            description: original.description,
            config: JSON.parse(JSON.stringify(original.config)) // Deep copy
        };

        // Mettre à jour l'ID et le nom dans la config
        copie.config.id = copie.id;
        copie.config.nom = nouveauNom;

        // Sauvegarder
        await PratiqueManager.sauvegarderPratique(copie);

        console.log('✅ Pratique dupliquée:', copie.id);

        // Recharger
        await afficherListePratiques();

        alert(`✅ Pratique dupliquée avec succès !\n\n"${nouveauNom}" a été ajoutée à tes pratiques.`);
    } catch (error) {
        console.error('Erreur lors de la duplication:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

/**
 * Supprimer une pratique
 * @param {string} id - ID de la pratique à supprimer
 */
async function supprimerPratique(id) {
    const pratiques = db.getSync('pratiquesConfigurables', []);
    const pratique = pratiques.find(p => p.id === id);

    // Vérifier que la pratique n'est pas active
    const modalites = db.getSync('modalitesEvaluation', {});
    if (modalites.pratique === id) {
        alert(`❌ Impossible de supprimer cette pratique\n\nElle est actuellement active.\n\nVous devez d'abord activer une autre pratique.`);
        return;
    }

    // NOUVEAU Beta 91 : Vérifier que la pratique n'est pas utilisée par des cours
    const coursUtilisant = getCoursUtilisantPratique(id);
    if (coursUtilisant.length > 0) {
        const listeCours = coursUtilisant.map(c => c.sigle).join(', ');
        alert(`❌ Impossible de supprimer cette pratique\n\nElle est actuellement utilisée par ${coursUtilisant.length} cours :\n${listeCours}\n\nVous devez d'abord modifier ces cours pour utiliser une autre pratique.`);
        return;
    }

    if (!confirm(`Supprimer définitivement cette pratique ?\n\n"${pratique?.nom}"\n\nCette action est irréversible.`)) {
        return;
    }

    try {
        await PratiqueManager.supprimerPratique(id);
        console.log('✅ Pratique supprimée:', id);

        // Recharger
        await afficherListePratiques();

        alert(`✅ Pratique supprimée avec succès.`);
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

/**
 * Exporter une pratique en JSON
 * @param {string} id - ID de la pratique à exporter
 */
async function exporterPratiqueVersJSON(id) {
    try {
        const pratique = await PratiqueManager.exporterPratique(id);

        // Créer le blob JSON
        const json = JSON.stringify(pratique, null, 2);
        const blob = new Blob([json], { type: 'application/json' });

        // Télécharger le fichier
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pratique-${id}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('✅ Pratique exportée:', id);
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

// ============================================================================
// WIZARD DE CRÉATION DE PRATIQUE
// ============================================================================

/**
 * État du wizard
 */
let wizardEtapeActuelle = 1;
const wizardNbEtapes = 8;

/**
 * Titres des étapes du wizard
 */
const wizardTitresEtapes = {
    1: 'Informations de base',
    2: 'Échelle d\'évaluation',
    3: 'Structure des évaluations',
    4: 'Calcul de la note',
    5: 'Système de reprises',
    6: 'Gestion des critères',
    7: 'Seuils d\'interprétation',
    8: 'Interface et terminologie'
};

/**
 * Ouvre le modal wizard de création de pratique
 * Beta 95 : Utilise le nouveau Wizard V2
 */
function creerNouvellePratique() {
    // Ouvrir le wizard V2 en mode création
    if (typeof ouvrirWizardV2 === 'function') {
        ouvrirWizardV2(false, null);
    } else {
        // Fallback sur l'ancien wizard
        ouvrirWizardPratique(false, null);
    }
}

/**
 * Ferme le modal wizard
 */
function fermerWizardPratique() {
    const modal = document.getElementById('modalWizardPratique');
    if (modal) {
        modal.classList.remove('actif');
    }

    // Réinitialiser
    wizardEtapeActuelle = 1;
    resetterWizard();
}

// ============================================================================
// WIZARD - CHARGEMENT DES RESSOURCES EXISTANTES
// ============================================================================

/**
 * Charge les grilles de critères existantes depuis localStorage
 */
function chargerGrillesWizard() {
    const select = document.getElementById('wizard-grille-id');
    if (!select) return;

    // Charger les grilles depuis localStorage
    const grilles = db.getSync('grillesTemplates', []);

    // Vider le select
    select.innerHTML = '<option value="">Choisir une grille...</option>';

    // Option par défaut : Grille SRPNF
    if (grilles.length === 0) {
        select.innerHTML += '<option value="defaut-srpnf" selected>SRPNF (5 critères) - Grille par défaut</option>';
    } else {
        // Ajouter toutes les grilles disponibles
        grilles.forEach(grille => {
            const option = document.createElement('option');
            option.value = grille.id;
            const nbCriteres = grille.criteres ? grille.criteres.length : 0;
            option.textContent = `${grille.nom} (${nbCriteres} critères)`;
            select.appendChild(option);
        });

        // Pré-sélectionner la première grille
        if (grilles.length > 0) {
            select.value = grilles[0].id;
            afficherPreviewGrilleWizard();
        }
    }
}

/**
 * Affiche la prévisualisation de la grille sélectionnée
 */
function afficherPreviewGrilleWizard() {
    const select = document.getElementById('wizard-grille-id');
    const preview = document.getElementById('wizard-preview-grille');
    const contenu = document.getElementById('wizard-preview-grille-contenu');

    if (!select || !preview || !contenu) return;

    const grilleId = select.value;

    if (!grilleId) {
        preview.classList.add('u-hide');
        return;
    }

    // Cas spécial : grille par défaut SRPNF
    if (grilleId === 'defaut-srpnf') {
        contenu.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                    <strong>Structure</strong>
                    <span style="color: var(--gris-moyen); font-size: 0.9rem;">15%</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                    <strong>Rigueur</strong>
                    <span style="color: var(--gris-moyen); font-size: 0.9rem;">20%</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                    <strong>Plausibilité</strong>
                    <span style="color: var(--gris-moyen); font-size: 0.9rem;">10%</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                    <strong>Nuance</strong>
                    <span style="color: var(--gris-moyen); font-size: 0.9rem;">25%</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                    <strong>Français</strong>
                    <span style="color: var(--gris-moyen); font-size: 0.9rem;">30%</span>
                </div>
            </div>
        `;
        preview.classList.remove('u-hide');
        return;
    }

    // Charger la grille depuis localStorage
    const grilles = db.getSync('grillesTemplates', []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres) {
        preview.classList.add('u-hide');
        return;
    }

    // Générer le HTML de prévisualisation
    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';

    grille.criteres.forEach(critere => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                <strong>${critere.nom}</strong>
                <span style="color: var(--gris-moyen); font-size: 0.9rem;">${critere.ponderation}%</span>
            </div>
        `;
    });

    html += '</div>';

    contenu.innerHTML = html;
    preview.classList.remove('u-hide');
}

/**
 * Charge les échelles existantes depuis localStorage dans le select du wizard
 */
function chargerEchellesWizard() {
    const select = document.getElementById('wizard-echelle-id');
    if (!select) return;

    // Charger les échelles depuis localStorage
    const echelles = db.getSync('echellesTemplates', []);

    // Vider le select (garder seulement l'option par défaut)
    select.innerHTML = '<option value="">Choisir une échelle...</option>';

    // Option par défaut : Échelle IDME (si elle n'existe pas, la créer)
    if (echelles.length === 0) {
        select.innerHTML += '<option value="defaut-idme" selected>IDME (4 niveaux) - Échelle par défaut</option>';
    } else {
        // Ajouter toutes les échelles disponibles
        echelles.forEach(echelle => {
            const option = document.createElement('option');
            option.value = echelle.id;
            option.textContent = `${echelle.nom} (${echelle.niveaux.length} niveaux)`;
            select.appendChild(option);
        });

        // Pré-sélectionner la première échelle
        if (echelles.length > 0) {
            select.value = echelles[0].id;
            afficherPreviewEchelleWizard();
        }
    }
}

/**
 * Affiche la prévisualisation de l'échelle sélectionnée
 */
function afficherPreviewEchelleWizard() {
    const select = document.getElementById('wizard-echelle-id');
    const preview = document.getElementById('wizard-preview-echelle');
    const contenu = document.getElementById('wizard-preview-echelle-contenu');

    if (!select || !preview || !contenu) return;

    const echelleId = select.value;

    if (!echelleId) {
        preview.classList.add('u-hide');
        return;
    }

    // Cas spécial : échelle par défaut IDME
    if (echelleId === 'defaut-idme') {
        contenu.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; background: #FF6B6B;"></div>
                    <div style="flex: 1;">
                        <strong>I - Incomplet</strong>
                        <div style="font-size: 0.85rem; color: var(--gris-moyen);">Plage : 0-64% • Calcul : 50%</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; background: #FFD93D;"></div>
                    <div style="flex: 1;">
                        <strong>D - En développement</strong>
                        <div style="font-size: 0.85rem; color: var(--gris-moyen);">Plage : 65-74% • Calcul : 70%</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; background: #6BCF7F;"></div>
                    <div style="flex: 1;">
                        <strong>M - Maîtrisé</strong>
                        <div style="font-size: 0.85rem; color: var(--gris-moyen);">Plage : 75-84% • Calcul : 80%</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; background: #4D96FF;"></div>
                    <div style="flex: 1;">
                        <strong>E - Étendu</strong>
                        <div style="font-size: 0.85rem; color: var(--gris-moyen);">Plage : 85-100% • Calcul : 92,5%</div>
                    </div>
                </div>
            </div>
        `;
        preview.classList.remove('u-hide');
        return;
    }

    // Charger l'échelle depuis localStorage
    const echelles = db.getSync('echellesTemplates', []);
    const echelle = echelles.find(e => e.id === echelleId);

    if (!echelle || !echelle.niveaux) {
        preview.classList.add('u-hide');
        return;
    }

    // Générer le HTML de prévisualisation
    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';

    echelle.niveaux.forEach(niveau => {
        // Extraire la couleur (gérer var(--...) et hex)
        let couleurStyle = niveau.couleur;
        if (couleurStyle.includes('var(')) {
            // Mapping des variables CSS vers couleurs hex
            const couleurMap = {
                '--risque-critique': '#FF6B6B',
                '--risque-modere': '#FFD93D',
                '--risque-minimal': '#6BCF7F',
                '--risque-nul': '#4D96FF'
            };
            const varName = couleurStyle.match(/var\((.*?)\)/)?.[1];
            couleurStyle = couleurMap[varName] || '#cccccc';
        }

        // Valeur de calcul (avec virgule française)
        const valeurCalcul = Number(niveau.valeurCalcul) || ((Number(niveau.min) + Number(niveau.max)) / 2);
        const valeurCalculFormatee = valeurCalcul.toFixed(1).replace('.', ',');

        html += `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                <div style="width: 30px; height: 30px; border-radius: 4px; background: ${couleurStyle};"></div>
                <div style="flex: 1;">
                    <strong>${niveau.code} - ${niveau.nom}</strong>
                    <div style="font-size: 0.85rem; color: var(--gris-moyen);">
                        Plage : ${Math.round(niveau.min)}-${Math.round(niveau.max)}% • Calcul : ${valeurCalculFormatee}%
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';

    contenu.innerHTML = html;
    preview.classList.remove('u-hide');
}

/**
 * Réinitialise tous les champs du wizard
 */
function resetterWizard() {
    // Étape 1
    document.getElementById('wizard-nom').value = '';
    document.getElementById('wizard-auteur').value = '';
    document.getElementById('wizard-etablissement').value = '';
    document.getElementById('wizard-description').value = '';
    document.getElementById('wizard-discipline').value = '';

    // Étape 2 - Charger les échelles existantes
    chargerEchellesWizard();

    // Étape 3
    document.getElementById('wizard-structure-type').value = '';
    document.getElementById('wizard-nb-standards').value = '10';
    document.getElementById('wizard-standards-terminaux').value = '';
    document.getElementById('wizard-portfolio-selection').value = 'n_meilleurs';
    document.getElementById('wizard-portfolio-nombre').value = '7';
    document.getElementById('wizard-evaluations-liste').innerHTML = '';

    // Étape 4
    document.getElementById('wizard-calcul-methode').value = '';
    document.getElementById('wizard-conditions-speciales').checked = false;

    // Étape 5
    document.getElementById('wizard-reprises-type').value = '';
    document.getElementById('wizard-reprises-bureau').checked = false;
    document.getElementById('wizard-niveau-retrogradable').checked = false;

    // Étape 6 - Charger les grilles existantes
    chargerGrillesWizard();

    // Étape 7 - Les seuils sont affichés en lecture seule depuis les Réglages
    // Pas de champs à réinitialiser

    // Étape 8
    document.getElementById('wizard-afficher-notes').checked = true;
    document.getElementById('wizard-afficher-rang').checked = false;
    document.getElementById('wizard-afficher-moyenne').checked = false;
    document.getElementById('wizard-terme-evaluation').value = 'Évaluation';
    document.getElementById('wizard-terme-critere').value = 'Critère';
    document.getElementById('wizard-terme-note').value = 'Note finale';
    document.getElementById('wizard-terme-reprise').value = 'Reprise';

    // 🆕 #24 : Masquer l'info hybride
    const infoHybride = document.getElementById('wizard-portfolio-hybride-info');
    toggleDisplay(infoHybride, false);
}

/**
 * 🆕 #24 : Gère le changement de sélection du mode portfolio dans le wizard
 * Affiche/masque le message d'information pour le mode hybride
 */
function onWizardPortfolioSelectionChange() {
    const select = document.getElementById('wizard-portfolio-selection');
    const infoHybride = document.getElementById('wizard-portfolio-hybride-info');
    const champNombre = document.getElementById('wizard-portfolio-nombre');

    if (!select || !infoHybride) return;

    const estHybride = select.value === 'hybride';
    toggleDisplay(infoHybride, estHybride);

    // Désactiver le champ nombre si hybride (sera configuré en Expert)
    if (champNombre) {
        champNombre.disabled = estHybride;
        if (estHybride) {
            champNombre.style.opacity = '0.5';
            champNombre.title = 'Configuration détaillée en Mode Expert';
        } else {
            champNombre.style.opacity = '1';
            champNombre.title = '';
        }
    }
}
window.onWizardPortfolioSelectionChange = onWizardPortfolioSelectionChange;

/**
 * Affiche une étape spécifique du wizard
 */
function afficherEtapeWizard(numeroEtape) {
    // Cacher toutes les étapes
    const steps = document.querySelectorAll('.wizard-step');
    steps.forEach(step => step.classList.add('u-hide'));

    // Afficher l'étape demandée
    const currentStep = document.querySelector(`.wizard-step[data-step="${numeroEtape}"]`);
    if (currentStep) {
        currentStep.classList.remove('u-hide');
    }

    // Mettre à jour l'indicateur
    document.getElementById('wizard-etape-actuelle').textContent = numeroEtape;
    document.getElementById('wizard-etape-titre').textContent = wizardTitresEtapes[numeroEtape];

    // Mettre à jour les dots
    const dots = document.querySelectorAll('.wizard-dot');
    dots.forEach((dot, index) => {
        const dotStep = index + 1;

        // Retirer toutes les classes
        dot.classList.remove('wizard-dot-active', 'wizard-dot-completed');

        // Étape actuelle : bleu vif + agrandi
        if (dotStep === numeroEtape) {
            dot.classList.add('wizard-dot-active');
        }
        // Étapes complétées : bleu foncé
        else if (dotStep < numeroEtape) {
            dot.classList.add('wizard-dot-completed');
        }
        // Étapes futures : gris (classe par défaut)
    });

    // Charger les données dynamiques selon l'étape
    if (numeroEtape === 2) {
        afficherPreviewEchelleWizard();
    } else if (numeroEtape === 7) {
        afficherSeuilsActuelsWizard();
    }

    // Gérer l'affichage des boutons
    const btnPrecedent = document.getElementById('wizard-btn-precedent');
    const btnSuivant = document.getElementById('wizard-btn-suivant');
    const btnCreer = document.getElementById('wizard-btn-creer');

    if (numeroEtape === 1) {
        toggleDisplay(btnPrecedent, false);
        toggleDisplay(btnSuivant, true);
        toggleDisplay(btnCreer, false);
    } else if (numeroEtape === wizardNbEtapes) {
        toggleDisplay(btnPrecedent, true);
        toggleDisplay(btnSuivant, false);
        toggleDisplay(btnCreer, true);
    } else {
        toggleDisplay(btnPrecedent, true);
        toggleDisplay(btnSuivant, true);
        toggleDisplay(btnCreer, false);
    }
}

/**
 * Passe à l'étape suivante
 */
function suivantEtapeWizard() {
    // Valider l'étape actuelle
    if (!validerEtapeWizard(wizardEtapeActuelle)) {
        return;
    }

    // Passer à la suivante
    if (wizardEtapeActuelle < wizardNbEtapes) {
        wizardEtapeActuelle++;
        afficherEtapeWizard(wizardEtapeActuelle);
    }
}

/**
 * Revient à l'étape précédente
 */
function precedentEtapeWizard() {
    if (wizardEtapeActuelle > 1) {
        wizardEtapeActuelle--;
        afficherEtapeWizard(wizardEtapeActuelle);
    }
}

/**
 * Valide les champs de l'étape actuelle
 */
function validerEtapeWizard(numeroEtape) {
    switch (numeroEtape) {
        case 1: // Informations de base
            const nom = document.getElementById('wizard-nom').value.trim();
            if (!nom) {
                alert('Veuillez saisir un nom pour la pratique.');
                return false;
            }
            break;

        case 2: // Échelle
            const echelleId = document.getElementById('wizard-echelle-id').value;
            if (!echelleId) {
                alert('Veuillez choisir une échelle d\'évaluation.');
                return false;
            }
            break;

        case 3: // Structure
            const typeStructure = document.getElementById('wizard-structure-type').value;
            if (!typeStructure) {
                alert('Veuillez choisir un type de structure.');
                return false;
            }
            break;

        case 4: // Calcul
            const methodeCalcul = document.getElementById('wizard-calcul-methode').value;
            if (!methodeCalcul) {
                alert('Veuillez choisir une méthode de calcul.');
                return false;
            }
            break;

        case 5: // Reprises
            const typeReprises = document.getElementById('wizard-reprises-type').value;
            if (!typeReprises) {
                alert('Veuillez choisir un type de système de reprises.');
                return false;
            }
            break;

        case 6: // Critères (grille sélectionnée)
            const grilleId = document.getElementById('wizard-grille-id').value;
            if (!grilleId) {
                alert('Veuillez choisir une grille de critères.');
                return false;
            }
            break;

        case 7: // Seuils (lecture seule depuis Réglages, pas de validation)
            // Les seuils sont automatiquement chargés depuis les Réglages
            // Pas de validation nécessaire
            break;
    }

    return true;
}

/**
 * Affiche la configuration selon le type d'échelle
 */
function afficherConfigEchelle() {
    const type = document.getElementById('wizard-echelle-type').value;

    // Cacher toutes les configs
    document.getElementById('wizard-config-niveaux').classList.add('u-hide');
    document.getElementById('wizard-config-pourcentage').classList.add('u-hide');
    document.getElementById('wizard-config-notes-fixes').classList.add('u-hide');

    // Afficher la config appropriée
    if (type === 'niveaux') {
        document.getElementById('wizard-config-niveaux').classList.remove('u-hide');
        // Initialiser avec 4 niveaux IDME par défaut
        if (document.getElementById('wizard-niveaux-liste').children.length === 0) {
            initialiserNiveauxIDME();
        }
    } else if (type === 'pourcentage') {
        document.getElementById('wizard-config-pourcentage').classList.remove('u-hide');
    } else if (type === 'notes_fixes') {
        document.getElementById('wizard-config-notes-fixes').classList.remove('u-hide');
    }
}

/**
 * Initialise les niveaux IDME par défaut
 */
function initialiserNiveauxIDME() {
    const niveauxIDME = [
        { code: 'I', label: 'Incomplet', pct: 50, couleur: '#FF6B6B' },
        { code: 'D', label: 'en Développement', pct: 70, couleur: '#FFD93D' },
        { code: 'M', label: 'Maîtrisé', pct: 80, couleur: '#6BCF7F' },
        { code: 'E', label: 'Étendu', pct: 92.5, couleur: '#4D96FF' }
    ];

    const liste = document.getElementById('wizard-niveaux-liste');
    liste.innerHTML = '';

    niveauxIDME.forEach((niveau, index) => {
        ajouterNiveauWizard(niveau);
    });
}

/**
 * Ajoute un niveau dans l'échelle à niveaux
 */
function ajouterNiveauWizard(niveauDefaut = null) {
    const liste = document.getElementById('wizard-niveaux-liste');
    const index = liste.children.length;

    if (index >= 6) {
        alert('Maximum 6 niveaux autorisés.');
        return;
    }

    const niveau = niveauDefaut || { code: '', label: '', pct: 50, couleur: '#CCCCCC' };

    const div = document.createElement('div');
    div.className = 'niveau-item';
    div.style.cssText = 'display: grid; grid-template-columns: 80px 1fr 100px 80px 40px; gap: 10px; margin-bottom: 10px; padding: 12px; background: var(--surface-conteneur, #162c36); border-radius: 4px; border: 1px solid var(--gris-leger);';

    div.innerHTML = `
        <input type="text" class="controle-form" placeholder="Code" value="${niveau.code}" data-field="code" style="padding: 6px;">
        <input type="text" class="controle-form" placeholder="Label" value="${niveau.label}" data-field="label" style="padding: 6px;">
        <input type="number" class="controle-form" placeholder="%" value="${niveau.pct}" min="0" max="100" step="0.1" data-field="pct" style="padding: 6px;">
        <input type="color" class="controle-form" value="${niveau.couleur}" data-field="couleur" style="padding: 2px; height: 36px;">
        <button type="button" class="btn btn-tres-compact" onclick="retirerNiveauWizard(this)" style="background: var(--rouge-erreur); color: white; padding: 6px;">🗑️</button>
    `;

    liste.appendChild(div);
}

/**
 * Retire un niveau
 */
function retirerNiveauWizard(btn) {
    const liste = document.getElementById('wizard-niveaux-liste');
    if (liste.children.length <= 2) {
        alert('Minimum 2 niveaux requis.');
        return;
    }
    btn.closest('.niveau-item').remove();
}

/**
 * Affiche la configuration selon le type de structure
 */
function afficherConfigStructure() {
    const type = document.getElementById('wizard-structure-type').value;

    // Cacher toutes les configs
    document.getElementById('wizard-config-standards').classList.add('u-hide');
    document.getElementById('wizard-config-portfolio').classList.add('u-hide');
    document.getElementById('wizard-config-evaluations').classList.add('u-hide');
    document.getElementById('wizard-config-specifications').classList.add('u-hide');
    document.getElementById('wizard-config-multi-objectifs').classList.add('hidden');

    // Afficher la config appropriée
    if (type === 'standards') {
        document.getElementById('wizard-config-standards').classList.remove('u-hide');
    } else if (type === 'portfolio') {
        document.getElementById('wizard-config-portfolio').classList.remove('u-hide');
    } else if (type === 'evaluations_discretes') {
        document.getElementById('wizard-config-evaluations').classList.remove('u-hide');
    } else if (type === 'specifications') {
        document.getElementById('wizard-config-specifications').classList.remove('u-hide');
    } else if (type === 'multi_objectifs') {
        document.getElementById('wizard-config-multi-objectifs').classList.remove('hidden');
        // Peupler le dropdown avec les ensembles disponibles
        populerDropdownEnsembles();
    }
}

/**
 * Ajoute une évaluation dans la liste
 */
function ajouterEvaluationWizard() {
    const liste = document.getElementById('wizard-evaluations-liste');
    const index = liste.children.length;

    const div = document.createElement('div');
    div.className = 'evaluation-item';
    div.style.cssText = 'display: grid; grid-template-columns: 1fr 100px 40px; gap: 10px; margin-bottom: 10px; padding: 12px; background: var(--surface-conteneur, #162c36); border-radius: 4px; border: 1px solid var(--gris-leger);';

    div.innerHTML = `
        <input type="text" class="controle-form" placeholder="Nom de l'évaluation" data-field="nom" style="padding: 6px;">
        <input type="number" class="controle-form" placeholder="Poids %" min="0" max="100" step="1" data-field="poids" style="padding: 6px;">
        <button type="button" class="btn btn-tres-compact" onclick="retirerEvaluationWizard(this)" style="background: var(--rouge-erreur); color: white; padding: 6px;">🗑️</button>
    `;

    liste.appendChild(div);
}

/**
 * Retire une évaluation
 */
function retirerEvaluationWizard(btn) {
    btn.closest('.evaluation-item').remove();
}

/**
 * Peuple le dropdown avec les ensembles d'objectifs disponibles
 */
function populerDropdownEnsembles() {
    const dropdown = document.getElementById('wizard-ensemble-objectifs');
    if (!dropdown) return;

    // Charger les ensembles depuis IndexedDB
    const ensembles = db.getSync('objectifsTemplates', []);

    // Vider et remplir le dropdown
    dropdown.innerHTML = '<option value="">-- Sélectionner un ensemble existant --</option>';

    ensembles.forEach(ensemble => {
        const option = document.createElement('option');
        option.value = ensemble.id;
        option.textContent = `${ensemble.nom} (${ensemble.objectifs?.length || 0} objectifs)`;
        dropdown.appendChild(option);
    });

    if (ensembles.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '(Aucun ensemble créé - allez dans Matériel → Objectifs)';
        option.disabled = true;
        dropdown.appendChild(option);
    }
}

/**
 * Charge un ensemble d'objectifs sélectionné dans le wizard
 */
function chargerEnsembleWizard() {
    const dropdown = document.getElementById('wizard-ensemble-objectifs');
    const ensembleId = dropdown.value;

    if (!ensembleId) {
        return;
    }

    // Charger l'ensemble depuis IndexedDB
    const ensembles = db.getSync('objectifsTemplates', []);
    const ensemble = ensembles.find(e => e.id === ensembleId);

    if (!ensemble || !ensemble.objectifs) {
        alert('Impossible de charger cet ensemble d\'objectifs.');
        return;
    }

    // Vider la liste actuelle
    const liste = document.getElementById('wizard-objectifs-liste');
    liste.innerHTML = '';

    // Ajouter chaque objectif de l'ensemble
    ensemble.objectifs.forEach(obj => {
        const div = document.createElement('div');
        div.className = 'objectif-item';

        div.innerHTML = `
            <input type="text" class="controle-form" placeholder="Nom de l'objectif" data-field="nom" value="${obj.nom}" oninput="calculerTotalPoidsObjectifs()">
            <input type="number" class="controle-form" placeholder="Poids %" min="0" max="100" step="1" data-field="poids" value="${obj.poids}" oninput="calculerTotalPoidsObjectifs()">
            <select class="controle-form" data-field="type">
                <option value="fondamental" ${obj.type === 'fondamental' ? 'selected' : ''}>Fondamental</option>
                <option value="integrateur" ${obj.type === 'integrateur' ? 'selected' : ''}>Intégrateur</option>
                <option value="transversal" ${obj.type === 'transversal' ? 'selected' : ''}>Transversal</option>
            </select>
            <button type="button" class="btn btn-tres-compact btn-supprimer" onclick="retirerObjectifWizard(this)">Retirer</button>
        `;

        liste.appendChild(div);
    });

    // Recalculer le total
    calculerTotalPoidsObjectifs();
}

/**
 * Ajoute un objectif manuellement dans la liste (pour structure multi-objectifs)
 */
function ajouterObjectifWizard() {
    const liste = document.getElementById('wizard-objectifs-liste');

    const div = document.createElement('div');
    div.className = 'objectif-item';

    div.innerHTML = `
        <input type="text" class="controle-form" placeholder="Nom de l'objectif (ex: Limites et continuité)" data-field="nom" oninput="calculerTotalPoidsObjectifs()">
        <input type="number" class="controle-form" placeholder="Poids %" min="0" max="100" step="1" data-field="poids" value="0" oninput="calculerTotalPoidsObjectifs()">
        <select class="controle-form" data-field="type">
            <option value="fondamental">Fondamental</option>
            <option value="integrateur">Intégrateur</option>
            <option value="transversal">Transversal</option>
        </select>
        <button type="button" class="btn btn-tres-compact btn-supprimer" onclick="retirerObjectifWizard(this)">Retirer</button>
    `;

    liste.appendChild(div);
    calculerTotalPoidsObjectifs();
}

/**
 * Retire un objectif
 */
function retirerObjectifWizard(btn) {
    btn.closest('.objectif-item').remove();
    calculerTotalPoidsObjectifs();
}

/**
 * Calcule le total des pondérations des objectifs
 */
function calculerTotalPoidsObjectifs() {
    const liste = document.getElementById('wizard-objectifs-liste');
    if (!liste) return 0;

    const objectifs = liste.querySelectorAll('.objectif-item');

    let total = 0;
    objectifs.forEach(obj => {
        const poidsInput = obj.querySelector('[data-field="poids"]');
        const poids = parseFloat(poidsInput.value) || 0;
        total += poids;
    });

    // Mettre à jour l'affichage
    const totalSpan = document.getElementById('wizard-total-poids');
    const validationP = document.getElementById('wizard-validation-poids');

    if (!totalSpan || !validationP) return total;

    totalSpan.textContent = total + '%';

    // Changer la couleur et le message selon la validité
    totalSpan.className = 'total-poids-valeur';
    validationP.className = 'total-poids-message';

    if (total === 100) {
        totalSpan.classList.add('u-texte-succes');
        validationP.textContent = 'Total valide ! Tu peux continuer.';
        validationP.classList.add('u-texte-succes');
    } else if (total > 100) {
        totalSpan.classList.add('u-texte-danger');
        validationP.textContent = 'Le total dépasse 100% (' + total + '%). Ajustez les pondérations.';
        validationP.classList.add('u-texte-danger');
    } else {
        totalSpan.classList.add('u-texte-warning');
        validationP.textContent = 'Le total doit atteindre 100% pour continuer (actuellement ' + total + '%)';
        validationP.classList.add('u-texte-warning');
    }

    return total;
}

/**
 * Affiche la configuration selon la méthode de calcul
 */
function afficherConfigCalcul() {
    const methode = document.getElementById('wizard-calcul-methode').value;
    const infoDiv = document.getElementById('wizard-info-calcul');
    const infoTexte = document.getElementById('wizard-info-calcul-texte');

    if (!methode) {
        infoDiv.classList.add('u-hide');
        return;
    }

    infoDiv.classList.remove('u-hide');

    if (methode === 'conversion_niveaux') {
        infoTexte.textContent = 'Chaque niveau sera converti en pourcentage selon la table de conversion définie dans l\'échelle (étape 2).';
    } else if (methode === 'moyenne_ponderee') {
        infoTexte.textContent = 'Les évaluations seront pondérées selon les poids définis à l\'étape 3.';
    } else if (methode === 'specifications') {
        infoTexte.textContent = 'Les notes seront déterminées selon les spécifications atteintes (notes fixes).';
    }
}

/**
 * Affiche la configuration selon le type de reprises
 */
function afficherConfigReprises() {
    const type = document.getElementById('wizard-reprises-type').value;
    const configDiv = document.getElementById('wizard-config-reprises');
    const infoDiv = document.getElementById('wizard-info-reprises');

    if (type === 'aucune') {
        toggleDisplay(configDiv, false);
        toggleDisplay(infoDiv, false);
    } else if (type === 'illimitees' || type === 'occasions_ponctuelles' || type === 'limitees') {
        toggleDisplay(configDiv, true);
        toggleDisplay(infoDiv, type === 'occasions_ponctuelles');
    } else {
        toggleDisplay(configDiv, false);
        toggleDisplay(infoDiv, false);
    }
}

/**
 * Affiche les seuils actuels configurés dans les Réglages
 */
function afficherSeuilsActuelsWizard() {
    const contenu = document.getElementById('wizard-seuils-actuels');
    if (!contenu) return;

    // Charger les seuils depuis configPAN
    const configPAN = db.getSync('configPAN', {});
    const seuils = configPAN.seuils || { fragile: 70, acceptable: 80, bon: 85 };

    const html = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: var(--accent-primaire);">Bon</strong>
                <span style="color: var(--gris-fonce); font-size: 1.1rem; font-weight: 600;">≥ ${seuils.bon}%</span>
            </div>
            <div style="padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: var(--accent-primaire);">Acceptable</strong>
                <span style="color: var(--gris-fonce); font-size: 1.1rem; font-weight: 600;">≥ ${seuils.acceptable}%</span>
            </div>
            <div style="padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: var(--accent-primaire);">Fragile</strong>
                <span style="color: var(--gris-fonce); font-size: 1.1rem; font-weight: 600;">≥ ${seuils.fragile}%</span>
            </div>
        </div>
    `;

    contenu.innerHTML = html;
}

/**
 * Toggle l'affichage du résumé des jetons dans le wizard
 */
function toggleResumeJetonsWizard() {
    const checkbox = document.getElementById('wizard-utiliser-jetons');
    const resume = document.getElementById('wizard-resume-jetons');
    const contenu = document.getElementById('wizard-resume-jetons-contenu');

    if (!checkbox || !resume || !contenu) return;

    if (checkbox.checked) {
        // Charger et afficher la configuration des jetons
        const configPAN = db.getSync('configPAN', {});
        const jetons = configPAN.jetons || {};

        let html = '';

        if (!jetons.actif && jetons.actif !== undefined) {
            html = '<p style="color: var(--gris-moyen); margin: 0;">⚠️ Le système de jetons est actuellement désactivé dans les Réglages.</p>';
        } else {
            html = `<div style="display: flex; flex-direction: column; gap: 10px;">`;

            // Allocation générale
            if (jetons.nombreParEleve) {
                html += `
                    <div style="padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                        <strong style="display: block; margin-bottom: 4px; color: var(--accent-primaire);">Allocation générale</strong>
                        <span style="color: var(--gris-fonce);">${jetons.nombreParEleve} jetons par élève</span>
                    </div>
                `;
            }

            // Jetons de délai
            if (jetons.delai && jetons.delai.actif) {
                html += `
                    <div style="padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                        <strong style="display: block; margin-bottom: 4px; color: var(--accent-primaire);">Jetons de délai</strong>
                        <span style="color: var(--gris-fonce);">Prolongation de ${jetons.delai.dureeJours || 0} jours</span>
                    </div>
                `;
            }

            // Jetons de reprise
            if (jetons.reprise && jetons.reprise.actif) {
                const action = jetons.reprise.archiverOriginale ? 'Archive l\'évaluation originale' : 'Remplace l\'évaluation originale';
                html += `
                    <div style="padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                        <strong style="display: block; margin-bottom: 4px; color: var(--accent-primaire);">Jetons de reprise</strong>
                        <span style="color: var(--gris-fonce);">${action}</span>
                    </div>
                `;
            }

            // Jetons personnalisés
            if (jetons.typesPersonnalises && jetons.typesPersonnalises.length > 0) {
                jetons.typesPersonnalises.forEach(type => {
                    html += `
                        <div style="padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                            <strong style="display: block; margin-bottom: 4px; color: var(--accent-primaire);">${type.nom}</strong>
                            <span style="color: var(--gris-fonce); font-size: 0.85rem;">${type.description}</span>
                        </div>
                    `;
                });
            }

            html += '</div>';

            // Si aucune configuration
            if (!jetons.nombreParEleve && !jetons.delai && !jetons.reprise && (!jetons.typesPersonnalises || jetons.typesPersonnalises.length === 0)) {
                html = '<p style="color: var(--gris-moyen); margin: 0;">⚠️ Aucun jeton configuré. Configure les jetons dans Réglages → Pratique de notation.</p>';
            }
        }

        contenu.innerHTML = html;
        resume.classList.remove('u-hide');
    } else {
        resume.classList.add('u-hide');
    }
}

/**
 * Affiche la configuration selon le type de critères
 */
function afficherConfigCriteres() {
    const type = document.getElementById('wizard-criteres-type').value;
    const configFixesDiv = document.getElementById('wizard-config-criteres-fixes');
    const infoDiv = document.getElementById('wizard-info-criteres');
    const infoTexte = document.getElementById('wizard-info-criteres-texte');

    // Cacher toutes les configs
    configFixesDiv.classList.add('u-hide');
    infoDiv.classList.add('u-hide');

    if (type === 'fixes') {
        configFixesDiv.classList.remove('u-hide');
    } else if (type === 'par_standard') {
        infoDiv.classList.remove('u-hide');
        infoTexte.textContent = 'Chaque standard pourra avoir ses propres critères spécifiques.';
    } else if (type === 'par_evaluation') {
        infoDiv.classList.remove('u-hide');
        infoTexte.textContent = 'Les critères varient selon le type d\'évaluation.';
    }
}

/**
 * Affiche la configuration selon le type de seuils
 */
function afficherConfigSeuils() {
    const type = document.getElementById('wizard-seuils-type').value;

    // Cacher toutes les configs
    document.getElementById('wizard-config-seuils-pct').classList.add('u-hide');
    document.getElementById('wizard-config-seuils-niveau').classList.add('u-hide');

    if (type === 'pourcentage') {
        document.getElementById('wizard-config-seuils-pct').classList.remove('u-hide');
    } else if (type === 'niveau') {
        document.getElementById('wizard-config-seuils-niveau').classList.remove('u-hide');
    }
}

/**
 * Crée la pratique à partir des données du wizard
 */
async function creerPratiqueDepuisWizard() {
    try {
        // Détecter si on est en mode édition ou création
        const modal = document.getElementById('modalWizardPratique');
        const modeEdition = modal && modal.dataset.modeEdition === 'true';
        const idPratique = modal && modal.dataset.idPratique;

        // Collecter les données de toutes les étapes
        // 🆕 #24 : Extraire la structure pour accéder au flag hybride
        const structureEvals = construireStructure();

        const pratiqueConfig = {
            // Étape 1: Informations de base
            id: modeEdition ? idPratique : 'pratique-' + Date.now(),
            nom: document.getElementById('wizard-nom').value.trim(),
            auteur: document.getElementById('wizard-auteur').value.trim() || 'Auteur',
            etablissement: document.getElementById('wizard-etablissement').value.trim(),
            description: document.getElementById('wizard-description').value.trim(),
            discipline: document.getElementById('wizard-discipline').value.trim(),
            version: '1.0',
            date_creation: new Date().toISOString().split('T')[0],

            // Étape 2: Échelle
            echelle: construireEchelle(),

            // Étape 3: Structure
            structure_evaluations: structureEvals,

            // Étape 4: Calcul
            calcul_note: construireCalcul(),

            // Étape 5: Reprises
            systeme_reprises: construireReprises(),

            // Étape 6: Critères
            gestion_criteres: construireCriteres(),

            // Étape 7: Seuils
            seuils: construireSeuils(),

            // Étape 8: Interface
            interface: construireInterface(),

            // Étape 9: Spécifications (optionnel)
            specifications: construireSpecifications(),

            // ✅ NOUVEAU (9 décembre 2025) : Configuration spécifique à cette pratique
            // Ces options sont propres à chaque pratique et s'affichent quand on clique sur la carte
            affichage: {
                modeComparatif: false  // Par défaut, affichage normal (non comparatif)
            },
            portfolio: {
                actif: true,
                nombreARetenir: structureEvals?.n_artefacts || 5,
                minimumCompletion: 7,
                nombreTotal: 10,
                methodeSelection: structureEvals?.selection === 'n_meilleurs' ? 'meilleurs' :
                                  structureEvals?.selection === 'derniers' ? 'derniers' :
                                  structureEvals?.selection || 'meilleurs',
                decouplerPR: false,
                hybride: structureEvals?.hybride || false  // 🆕 #24
            },
            jetons: {
                actif: true,
                delai: { nombre: 2, dureeJours: 2 },  // 🆕 Beta 95.7 : défaut 2 jours
                reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true },
                nombreParEleve: 2,  // 🆕 Beta 95.7 : défaut 2 jetons
                typesPersonnalises: []
            }
        };

        if (modeEdition) {
            // Mode édition : Supprimer l'ancienne et créer la nouvelle
            const pratiques = db.getSync('pratiquesConfigurables', []);
            const index = pratiques.findIndex(p => p.id === idPratique);

            if (index !== -1) {
                pratiques[index] = {
                    id: idPratique,
                    nom: pratiqueConfig.nom,
                    auteur: pratiqueConfig.auteur,
                    description: pratiqueConfig.description,
                    config: pratiqueConfig
                };
                db.setSync('pratiquesConfigurables', pratiques);
                console.log('✅ Pratique modifiée:', idPratique);
            }
        } else {
            // Mode création : Sauvegarder via PratiqueManager
            // ✅ Les pratiques créées par l'utilisateur sont directement dans la bibliothèque
            await PratiqueManager.sauvegarderPratique({
                id: pratiqueConfig.id,
                nom: pratiqueConfig.nom,
                auteur: pratiqueConfig.auteur,
                description: pratiqueConfig.description,
                config: pratiqueConfig,
                dansBibliotheque: true,  // Ajout immédiat à la sidebar
                estDeLUtilisateur: true  // ✅ NOUVEAU (9 décembre 2025) : Flag pour distinguer les pratiques créées vs importées
            });
            console.log('✅ Pratique créée:', pratiqueConfig.id);
        }

        // Fermer le wizard
        fermerWizardPratique();

        // Recharger la liste
        await afficherListePratiques();

        const message = modeEdition
            ? `✅ Pratique modifiée avec succès !\n\n"${pratiqueConfig.nom}" a été mise à jour.`
            : `✅ Pratique créée avec succès !\n\n"${pratiqueConfig.nom}" a été ajoutée à tes pratiques configurables.`;

        alert(message);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

/**
 * Construit la configuration de l'échelle
 */
function construireEchelle() {
    const echelleId = document.getElementById('wizard-echelle-id').value;

    // Cas spécial : échelle par défaut IDME
    if (echelleId === 'defaut-idme') {
        return {
            type: 'niveaux',
            echelle_id: 'defaut-idme',
            niveaux: [
                { code: 'I', label: 'Incomplet', description: '', valeur_numerique: 1, valeur_pourcentage: 50, couleur: '#FF6B6B', ordre: 1 },
                { code: 'D', label: 'en Développement', description: '', valeur_numerique: 2, valeur_pourcentage: 70, couleur: '#FFD93D', ordre: 2 },
                { code: 'M', label: 'Maîtrisé', description: '', valeur_numerique: 3, valeur_pourcentage: 80, couleur: '#6BCF7F', ordre: 3 },
                { code: 'E', label: 'Étendu', description: '', valeur_numerique: 4, valeur_pourcentage: 92.5, couleur: '#4D96FF', ordre: 4 }
            ]
        };
    }

    // Charger l'échelle depuis localStorage
    const echelles = db.getSync('echellesTemplates', []);
    const echelle = echelles.find(e => e.id === echelleId);

    if (!echelle) {
        throw new Error(`Échelle introuvable: ${echelleId}`);
    }

    // Convertir le format échelle vers le format pratique
    return {
        type: 'niveaux',
        echelle_id: echelle.id,
        echelle_nom: echelle.nom,
        niveaux: echelle.niveaux.map((niveau, index) => ({
            code: niveau.code,
            label: niveau.nom,
            description: niveau.description || '',
            valeur_numerique: index + 1,
            valeur_pourcentage: niveau.valeurCalcul || ((niveau.min + niveau.max) / 2),
            couleur: niveau.couleur,
            ordre: index + 1
        }))
    };
}

/**
 * Construit la configuration de la structure
 */
function construireStructure() {
    const type = document.getElementById('wizard-structure-type').value;

    if (type === 'standards') {
        const nbStandards = parseInt(document.getElementById('wizard-nb-standards').value);
        const terminaux = document.getElementById('wizard-standards-terminaux').value
            .split(',')
            .map(n => parseInt(n.trim()))
            .filter(n => !isNaN(n));

        return {
            type: 'standards',
            nombre_standards: nbStandards,
            standards_terminaux: terminaux,
            ponderation: 'egale'
        };
    } else if (type === 'portfolio') {
        const selection = document.getElementById('wizard-portfolio-selection').value;
        const nombre = parseInt(document.getElementById('wizard-portfolio-nombre').value) || 7;

        // 🆕 #24 : Mode hybride - activer les catégories par défaut
        if (selection === 'hybride') {
            return {
                type: 'portfolio',
                description: 'Artefacts de portfolio (hybride)',
                selection: 'n_meilleurs',
                n_artefacts: 4,
                hybride: true  // Flag pour activer les catégories en Expert
            };
        }

        return {
            type: 'portfolio',
            description: 'Artefacts de portfolio',
            selection: selection,
            n_artefacts: nombre
        };
    } else if (type === 'evaluations_discretes') {
        const evaluations = [];
        const evaluationsItems = document.querySelectorAll('#wizard-evaluations-liste .evaluation-item');

        evaluationsItems.forEach(item => {
            const nom = item.querySelector('[data-field="nom"]').value;
            const poids = parseInt(item.querySelector('[data-field="poids"]').value);

            if (nom && !isNaN(poids)) {
                evaluations.push({
                    nom: nom,
                    poids: poids,
                    type: 'evaluation',
                    obligatoire: true
                });
            }
        });

        return {
            type: 'evaluations_discretes',
            evaluations: evaluations
        };
    } else if (type === 'specifications') {
        return {
            type: 'specifications',
            specifications: []
        };
    }
}

/**
 * Construit la configuration du calcul
 */
function construireCalcul() {
    const methode = document.getElementById('wizard-calcul-methode').value;

    const config = {
        methode: methode
    };

    if (methode === 'conversion_niveaux') {
        config.description = 'Conversion des niveaux en pourcentages';
        config.table_conversion = []; // Sera remplie automatiquement depuis l'échelle
        config.conditions_speciales = [];
    } else if (methode === 'moyenne_ponderee') {
        config.formule = 'somme(note_i × poids_i) / 100';
        config.conditions_speciales = [];
    } else if (methode === 'specifications') {
        config.description = 'Notes fixes selon spécifications atteintes';
    }

    return config;
}

/**
 * Construit la configuration des reprises
 */
function construireReprises() {
    const type = document.getElementById('wizard-reprises-type').value;

    const config = {
        type: type
    };

    if (type !== 'aucune') {
        config.reprises_bureau = document.getElementById('wizard-reprises-bureau').checked;
        config.niveau_retrogradable = document.getElementById('wizard-niveau-retrogradable').checked;
    }

    if (type === 'occasions_ponctuelles') {
        config.occasions_formelles = [];
    }

    // Ajouter le système de jetons si activé
    const utiliserJetons = document.getElementById('wizard-utiliser-jetons');
    if (utiliserJetons && utiliserJetons.checked) {
        config.systeme_jetons_actif = true;
    }

    return config;
}

/**
 * Construit la configuration des critères - Référence une grille existante
 */
function construireCriteres() {
    const grilleId = document.getElementById('wizard-grille-id').value;

    // Référence la grille par ID (stockée dans grillesTemplates)
    return {
        type: 'grille',
        grille_id: grilleId,
        description: 'Grille de critères sélectionnée depuis le matériel pédagogique'
    };
}

/**
 * Construit la configuration des seuils
 */
function construireSeuils() {
    // Lire les seuils configurés dans les Réglages
    const configPAN = db.getSync('configPAN', {});
    const seuils = configPAN.seuils || { fragile: 70, acceptable: 80, bon: 85 };

    // La pratique utilisera les seuils configurés dans les Réglages
    return {
        type: 'pourcentage',
        va_bien: seuils.bon,
        difficulte: seuils.acceptable,
        grande_difficulte: seuils.fragile,
        source: 'reglages',
        description: 'Seuils configurés dans Réglages → Pratique de notation'
    };
}

/**
 * Construit la configuration de l'interface
 */
function construireInterface() {
    return {
        afficher_notes_chiffrees: document.getElementById('wizard-afficher-notes').checked,
        afficher_rang: document.getElementById('wizard-afficher-rang').checked,
        afficher_moyenne_groupe: document.getElementById('wizard-afficher-moyenne').checked,
        terminologie: {
            evaluation: document.getElementById('wizard-terme-evaluation').value.trim(),
            critere: document.getElementById('wizard-terme-critere').value.trim(),
            note_finale: document.getElementById('wizard-terme-note').value.trim(),
            reprise: document.getElementById('wizard-terme-reprise').value.trim()
        }
    };
}

/**
 * Construit la configuration des spécifications (PAN-Spécifications)
 * @returns {Object|null} Configuration ou null si pas de type d'évaluation choisi
 */
function construireSpecifications() {
    const typeEval = document.getElementById('wizard-spec-type-evaluation')?.value;

    if (!typeEval) {
        // Pas de configuration de spécifications
        return null;
    }

    if (typeEval === 'binaire') {
        // Configuration binaire (François A.-H. style)
        const typesTravaux = [];
        const typesTravauxListe = document.getElementById('wizard-spec-types-travaux-liste');

        if (typesTravauxListe) {
            const items = typesTravauxListe.querySelectorAll('.spec-type-travail-item');
            items.forEach(item => {
                const id = item.querySelector('.spec-type-id')?.value.trim();
                const nom = item.querySelector('.spec-type-nom')?.value.trim();
                const seuil = parseInt(item.querySelector('.spec-type-seuil')?.value) || 75;
                const specifications = item.querySelector('.spec-type-specifications')?.value
                    .split('\n')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);

                if (id && nom) {
                    typesTravaux.push({
                        id: id,
                        nom: nom,
                        seuilAcceptable: seuil,
                        specifications: specifications || []
                    });
                }
            });
        }

        const tableBundles = [];
        const bundlesListe = document.getElementById('wizard-spec-bundles-liste');

        if (bundlesListe) {
            const items = bundlesListe.querySelectorAll('.spec-bundle-item');
            items.forEach(item => {
                const noteFixe = parseInt(item.querySelector('.bundle-note-fixe')?.value);
                const label = item.querySelector('.bundle-label')?.value.trim();
                const description = item.querySelector('.bundle-description')?.value.trim();
                const requisJSON = item.querySelector('.bundle-requis')?.value.trim();

                if (!isNaN(noteFixe) && label) {
                    let requis = null;
                    if (requisJSON) {
                        try {
                            requis = JSON.parse(requisJSON);
                        } catch (e) {
                            console.warn('Format JSON invalide pour requis:', requisJSON);
                        }
                    }

                    tableBundles.push({
                        noteFixe: noteFixe,
                        label: label,
                        description: description || '',
                        requis: requis
                    });
                }
            });
        }

        return {
            type: 'binaire',
            typesTravaux: typesTravaux,
            tableBundles: tableBundles.sort((a, b) => b.noteFixe - a.noteFixe), // Trier par note décroissante
            seuilReussite: 60,
            seuilExcellence: 80
        };

    } else if (typeEval === 'niveaux') {
        // Configuration niveaux (Xavier C.-T. style)
        const nbObjectifs = parseInt(document.getElementById('wizard-spec-nb-objectifs')?.value) || 6;
        const objectifs = [];

        const objectifsListe = document.getElementById('wizard-spec-objectifs-liste');
        if (objectifsListe) {
            const items = objectifsListe.querySelectorAll('.spec-objectif-item');
            items.forEach((item, index) => {
                const nom = item.querySelector('.spec-objectif-nom')?.value.trim();
                const description = item.querySelector('.spec-objectif-description')?.value.trim();

                if (nom) {
                    objectifs.push({
                        id: `objectif-${index + 1}`,
                        nom: nom,
                        description: description || '',
                        niveaux: [1, 2, 3, 4] // Niveaux standard
                    });
                }
            });
        }

        return {
            type: 'niveaux',
            objectifs: objectifs,
            // Logique de calcul Xavier (tous niveau 3+ = 80%, chaque niveau 4 = +3.33%)
            calculNote: {
                baseNiveau3: 80,
                bonusNiveau4: 3.33,
                penaliteNiveau2: 25, // 1 obj niveau 2 → 55%
                penaliteNiveau1: 30  // 1 obj niveau 1 → 50%
            }
        };
    }

    return null;
}

/**
 * Déclencher l'input file pour importer JSON
 */
function importerPratiqueJSON() {
    const input = document.getElementById('inputImportPratique');
    if (input) {
        input.click();
    }
}

/**
 * Traiter le fichier JSON importé
 * @param {Event} event - Événement change de l'input file
 */
async function traiterImportPratique(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const pratiqueJSON = JSON.parse(text);

        // Valider la structure minimale
        if (!pratiqueJSON.id || !pratiqueJSON.config) {
            throw new Error('Structure JSON invalide (id et config requis)');
        }

        // Importer via PratiqueManager
        await PratiqueManager.importerPratique(pratiqueJSON);

        console.log('✅ Pratique importée:', pratiqueJSON.id);

        // Recharger
        await afficherListePratiques();

        alert(`✅ Pratique importée avec succès !\n\n"${pratiqueJSON.nom}" a été ajoutée à tes pratiques.`);
    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert(`❌ Erreur d'import : ${error.message}`);
    }

    // Réinitialiser l'input
    event.target.value = '';
}

// ============================================
// ANCIENNES FONCTIONS SUPPRIMÉES (9 décembre 2025)
// ============================================
// Les fonctions suivantes ont été supprimées car elles utilisaient l'ancien modal
// "Gestionnaire de bibliothèque". Le nouveau modal "Bibliothèque de pratiques"
// (ouvrirModalBibliothequePratiques) les remplace.
//
// Fonctions supprimées :
// - afficherPratiquesPredefines()
// - fermerModalPratiques()
// - retirerDeBibliotheque()
// - chargerPratiqueSelectionnees()
// ============================================

/**
 * 🆕 Beta 95.7 : Peuple le dropdown "Note maximale" (reprise ciblée) dans Réglages
 * Utilise l'échelle de la pratique active du groupe-cours
 */
function peuplerDropdownPlafondNoteCiblee() {
    const select = document.getElementById('plafondNoteCiblee');
    if (!select) return;

    // 1. Obtenir l'ID de la pratique active
    const pratiqueId = typeof obtenirPratiqueActiveGroupeCours === 'function'
        ? obtenirPratiqueActiveGroupeCours()
        : null;

    if (!pratiqueId) {
        select.innerHTML = '<option value="">— Aucune pratique active —</option>';
        return;
    }

    // 2. Obtenir la pratique depuis pratiquesConfigurables
    const pratiques = db.getSync('pratiquesConfigurables', []);
    const pratique = pratiques.find(p => p.id === pratiqueId);

    if (!pratique || !pratique.configuration?.echelleId) {
        select.innerHTML = '<option value="">— Échelle non configurée —</option>';
        return;
    }

    // 3. Obtenir l'échelle
    const echelles = db.getSync('echellesTemplates', []);
    const echelle = echelles.find(e => e.id === pratique.configuration.echelleId);

    if (!echelle || !echelle.niveaux) {
        select.innerHTML = '<option value="">— Échelle introuvable —</option>';
        return;
    }

    // 4. Construire les options
    let html = '<option value="">— Sélectionner —</option>';
    echelle.niveaux.forEach(n => {
        const label = n.code ? `${n.code} (${n.nom})` : n.nom;
        const value = n.code || n.nom;
        html += `<option value="${value}">${label}</option>`;
    });

    select.innerHTML = html;
}

// ============================================
// EXPORT DES FONCTIONS GLOBALES
// ============================================

window.initialiserModulePratiques = initialiserModulePratiques;
window.sauvegarderPratiqueNotation = sauvegarderPratiqueNotation;
window.obtenirConfigurationNotation = obtenirConfigurationNotation;
window.peuplerDropdownPlafondNoteCiblee = peuplerDropdownPlafondNoteCiblee; // 🆕 Beta 95.7

// NOUVEAU Beta 91 : Association pratique ↔ cours
window.getPratiqueCours = getPratiqueCours;
window.getCoursActifId = getCoursActifId;
window.getCoursUtilisantPratique = getCoursUtilisantPratique;
window.getPratiqueParDefaut = getPratiqueParDefaut;
window.definirPratiqueParDefaut = definirPratiqueParDefaut;
window.changerPratiqueParDefaut = changerPratiqueParDefaut;
window.mettreAJourUIPratiqueDefaut = mettreAJourUIPratiqueDefaut;

// NOUVEAU Beta 92 : Gestion pratiques configurables
window.afficherListePratiques = afficherListePratiques;
window.activerPratique = activerPratique;
window.editerPratique = editerPratique;
window.editerPratiqueActive = editerPratiqueActive;
window.dupliquerPratique = dupliquerPratique;
window.supprimerPratique = supprimerPratique;
window.exporterPratiqueVersJSON = exporterPratiqueVersJSON;
window.creerNouvellePratique = creerNouvellePratique;
window.importerPratiqueJSON = importerPratiqueJSON;
window.traiterImportPratique = traiterImportPratique;
// window.afficherPratiquesPredefines = afficherPratiquesPredefines; // Fonction supprimée

// Wizard de création de pratique
/* ===============================
   📚 SIDEBAR : AFFICHAGE LISTE PRATIQUES
   ✅ AJOUT (8 décembre 2025) - Pattern bibliothèque
   =============================== */

/**
 * Affiche la liste des pratiques dans la sidebar
 * Filtre uniquement les pratiques avec dansBibliotheque !== false
 */
async function afficherListePratiquesSidebar() {
    const pratiquesConfigurables = db.getSync('pratiquesConfigurables', []);

    // IDs des 3 CANEVAS DE BASE (pratiques codées) qui ne doivent PAS apparaître dans la sidebar
    // (ils sont dans le modal "Bibliothèque de pratiques" > section "Canevas de base")
    // Les autres pratiques sont des configurations dérivées qui peuvent apparaître dans la sidebar
    const idsCanevasDeBase = [
        'pan-maitrise',
        'specifications',
        'sommative'
    ];

    // DEBUG: Afficher les flags dansBibliotheque de toutes les pratiques
    console.log('[afficherListePratiquesSidebar] Toutes les pratiques:', pratiquesConfigurables.map(p => ({
        id: p.id,
        nom: p.nom,
        dansBibliotheque: p.dansBibliotheque
    })));

    // Filtrer les pratiques : dans bibliothèque ET pas un canevas de base
    const pratiquesDansBibliotheque = pratiquesConfigurables.filter(p =>
        p.dansBibliotheque !== false && !idsCanevasDeBase.includes(p.id)
    );

    console.log('[afficherListePratiquesSidebar] Pratiques filtrées pour sidebar:', pratiquesDansBibliotheque.length);

    const container = document.getElementById('listePratiquesSidebar');

    if (!container) return;

    const modalites = db.getSync('modalitesEvaluation', {});
    const pratiqueActiveId = modalites.pratique;

    // ✅ NOUVEAU (9 décembre 2025) : Récupérer la pratique sélectionnée pour l'affichage
    const pratiqueSelectionneeId = sessionStorage.getItem('pratiqueSelectionnee');

    if (pratiquesDansBibliotheque.length === 0) {
        container.innerHTML = '<p class="text-muted text-italic">Crée une nouvelle pratique ou puisez dans la bibliothèque</p>';
        return;
    }

    let html = '';
    pratiquesDansBibliotheque.forEach(p => {
        const estActiveSysteme = p.id === pratiqueActiveId;
        const estSelectionnee = p.id === pratiqueSelectionneeId;
        const activeClass = estSelectionnee ? ' active' : '';
        const nomAffiche = p.nom || p.id;
        const auteur = p.auteur ? `par ${p.auteur}` : '';

        html += `
            <div class="sidebar-item${activeClass}" onclick="chargerConfigurationPratique('${p.id}')">
                <div class="sidebar-item-titre">${echapperHtml(nomAffiche)}</div>
                ${auteur ? `<div style="font-size: 0.85rem; color: var(--gris-moyen); margin-top: 3px;">${echapperHtml(auteur)}</div>` : ''}
                ${estActiveSysteme ? '<div style="margin-top: 5px;"><span class="sidebar-item-badge">Active</span></div>' : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Ouvre le modal de bibliothèque de pratiques
 * ✅ AVEC Creative Commons (pratiques personnalisées)
 */
async function ouvrirModalBibliothequePratiques() {
    const pratiquesConfigurables = db.getSync('pratiquesConfigurables', []);

    // Définir les 3 CANEVAS DE BASE (structures fondamentales codées - templates immuables)
    // Ces IDs correspondent aux pratiques codées en JavaScript (pas aux configurations JSON)
    const canevasDeBase = [
        {
            id: 'pan-maitrise',
            nom: 'PAN-Standards',
            description: 'Pratique alternative basée sur les N meilleurs artefacts de portfolio avec évaluation formative selon l\'échelle IDME et la grille de critères configurée',
            type: 'canevas'
        },
        {
            id: 'specifications',
            nom: 'PAN par contrat (Spécifications)',
            description: 'Pratique par contrat (Specification Grading) avec objectifs réussite/échec. Les étudiants atteignent des paliers de notes fixes en réussissant des ensembles d\'objectifs mesurables',
            type: 'canevas'
        },
        {
            id: 'sommative',
            nom: 'Sommative traditionnelle',
            description: 'Pratique sommative traditionnelle avec moyenne pondérée de toutes les évaluations. Approche centrée sur la note finale avec prise en compte des pondérations',
            type: 'canevas'
        }
    ];

    // IDs des canevas de base à exclure des sections configurables
    const idsCanevasDeBase = canevasDeBase.map(c => c.id);

    // Filtrer les pratiques configurables pour exclure les canevas de base
    const pratiquesDansBibliotheque = pratiquesConfigurables.filter(p =>
        p.dansBibliotheque !== false && !idsCanevasDeBase.includes(p.id)
    );
    const pratiquesDisponibles = pratiquesConfigurables.filter(p =>
        p.dansBibliotheque === false && !idsCanevasDeBase.includes(p.id)
    );

    const modalHTML = `
        <div id="modalBibliothequePratiques" class="modal-js-overlay" style="z-index: 10000;">
            <div class="modal-js-contenu" style="max-width: 800px; width: 90%;">

                <!-- En-tête -->
                <div style="padding: 20px; border-bottom: 1px solid var(--gris-clair); display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; color: var(--accent-primaire);">Bibliothèque de pratiques</h2>
                    <button onclick="fermerModalBibliothequePratiques()" class="modal-js-btn-fermer">&times;</button>
                </div>

                <!-- Corps -->
                <div style="padding: 20px;">

                    <!-- 🆕 Beta 95.7 : Message aide édition -->
                    <div style="background: var(--bleu-tres-pale, #e8f4f8); border-left: 3px solid var(--bleu-clair, #5dade2); padding: 10px 15px; margin-bottom: 20px; border-radius: 0 6px 6px 0;">
                        <p style="margin: 0; font-size: 0.9rem; color: var(--texte-secondaire, #555);">
                            💡 <strong>Pour éditer une pratique</strong>, transférez-la d'abord dans la barre latérale en cliquant sur « Ajouter », puis allez dans <strong>Construction → Pratiques</strong> et cliquez dessus pour l'ouvrir en mode édition.
                        </p>
                    </div>

                    <!-- SECTION 0 : Canevas de base (templates) -->
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: var(--accent-primaire); margin-bottom: 10px;">
                            Canevas de base (${canevasDeBase.length})
                        </h3>
                        <p style="color: var(--gris-fonce); font-size: 0.9em; margin-bottom: 15px; font-style: italic;">
                            Structures de référence pour créer tes configurations personnalisées
                        </p>

                        <!-- Sélecteur de pratique par défaut -->
                        ${genererSelecteurPratiqueParDefaut()}

                        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                            ${canevasDeBase.map(c => {
                                const nomAffiche = c.nom || c.id;
                                const auteur = c.auteur ? `Par ${c.auteur}${c.etablissement ? ' (' + c.etablissement + ')' : ''}` : '';
                                const description = c.description || '';
                                return `
                                    <div style="border: 2px solid var(--accent-primaire); border-radius: 6px; padding: 15px; background: var(--bleu-tres-pale);">
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                            <div style="flex: 1;">
                                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                                    <div style="font-weight: bold; color: var(--accent-primaire);">${echapperHtml(nomAffiche)}</div>
                                                    <span style="background: var(--accent-primaire); color: white; font-size: 0.75em; padding: 2px 8px; border-radius: 10px; font-weight: 600;">CANEVAS</span>
                                                </div>
                                                ${auteur ? `<div style="color: var(--gris-clair); font-size: 0.9em; margin-bottom: 4px;">${echapperHtml(auteur)}</div>` : ''}
                                                ${description ? `<div style="color: var(--gris-moyen); font-size: 0.85em;">${echapperHtml(description)}</div>` : ''}
                                            </div>
                                            <button onclick="alert('Fonctionnalité à venir : Créer une configuration basée sur ce canevas')" class="btn btn-secondaire btn-tres-compact" style="margin-left: 10px;">
                                                Utiliser
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- SECTION 1 : Ma sélection -->
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: var(--accent-primaire); margin-bottom: 15px;">
                            Ma sélection (${pratiquesDansBibliotheque.length})
                        </h3>

                        <div id="listePratiquesSelection" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                            ${pratiquesDansBibliotheque.length === 0 ?
                                '<p class="text-muted text-italic">Aucune pratique dans ta sélection</p>' :
                                pratiquesDansBibliotheque.map(p => {
                                    const nomAffiche = p.nom || p.id;
                                    const auteur = p.auteur ? `Par ${p.auteur}${p.etablissement ? ' (' + p.etablissement + ')' : ''}` : '';
                                    const description = p.description || '';
                                    // ✅ NOUVEAU (9 décembre 2025) : Afficher "Partager" seulement pour les pratiques créées par l'utilisateur
                                    const estDeLUtilisateur = p.estDeLUtilisateur === true;
                                    return `
                                        <div style="border: 1px solid var(--bleu-clair); border-radius: 6px; padding: 15px; background: var(--bleu-tres-pale);">
                                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                                <div style="flex: 1;">
                                                    <div style="font-weight: bold; color: var(--gris-fonce); margin-bottom: 4px;">${echapperHtml(nomAffiche)}</div>
                                                    ${auteur ? `<div style="color: var(--gris-clair); font-size: 0.9em; margin-bottom: 4px;">${echapperHtml(auteur)}</div>` : ''}
                                                    ${description ? `<div style="color: var(--gris-clair); font-size: 0.85em;">${echapperHtml(description)}</div>` : ''}
                                                </div>
                                                <div style="display: flex; gap: 5px; margin-left: 10px;">
                                                    ${estDeLUtilisateur ? `
                                                        <button onclick="exporterPratiqueActive('${p.id}')" class="btn btn-principal btn-tres-compact">
                                                            Partager
                                                        </button>
                                                    ` : ''}
                                                    <button onclick="retirerPratiqueDeBibliotheque('${p.id}')" class="btn btn-secondaire btn-tres-compact">
                                                        Retirer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')
                            }
                        </div>
                    </div>

                    <!-- SECTION 2 : Disponibles à ajouter -->
                    <div>
                        <h3 style="color: var(--accent-primaire); margin-bottom: 15px;">
                            Disponibles à ajouter (${pratiquesDisponibles.length})
                        </h3>

                        <div id="listePratiquesDisponibles" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                            ${pratiquesDisponibles.length === 0 ?
                                '<p class="text-muted text-italic">Aucune pratique disponible</p>' :
                                pratiquesDisponibles.map(p => {
                                    const nomAffiche = p.nom || p.id;
                                    const auteur = p.auteur ? `Par ${p.auteur}${p.etablissement ? ' (' + p.etablissement + ')' : ''}` : '';
                                    const description = p.description || '';
                                    return `
                                        <div style="border: 1px solid var(--bleu-clair); border-radius: 6px; padding: 15px; background: var(--surface-conteneur, #162c36);">
                                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                                <div style="flex: 1;">
                                                    <div style="font-weight: bold; color: var(--gris-fonce); margin-bottom: 4px;">${echapperHtml(nomAffiche)}</div>
                                                    ${auteur ? `<div style="color: var(--gris-clair); font-size: 0.9em; margin-bottom: 4px;">${echapperHtml(auteur)}</div>` : ''}
                                                    ${description ? `<div style="color: var(--gris-clair); font-size: 0.85em;">${echapperHtml(description)}</div>` : ''}
                                                </div>
                                                <div style="display: flex; gap: 5px; margin-left: 10px;">
                                                    <button onclick="ajouterPratiqueIndividuelle('${p.id}')" class="btn btn-ajouter btn-tres-compact">
                                                        Ajouter
                                                    </button>
                                                    <button onclick="supprimerPratiqueHorsBibliotheque('${p.id}')" class="btn btn-supprimer btn-tres-compact" title="Supprimer définitivement">
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')
                            }
                        </div>

                        <div class="u-flex-gap-10">
                            <button onclick="importerPratiqueJSON()" class="btn btn-secondaire">
                                📥 Importer une pratique
                            </button>
                        </div>
                    </div>

                </div>

                <!-- Pied de page -->
                <div style="padding: 15px 20px; border-top: 1px solid var(--gris-clair); text-align: right;">
                    <button onclick="fermerModalBibliothequePratiques()" class="btn btn-secondaire">
                        Fermer
                    </button>
                </div>

            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Ferme le modal de bibliothèque de pratiques
 */
function fermerModalBibliothequePratiques() {
    const modal = document.getElementById('modalBibliothequePratiques');
    if (modal) {
        modal.remove();
    }
}

/**
 * Retire une pratique de la bibliothèque
 */
async function retirerPratiqueDeBibliotheque(pratiqueId) {
    const pratiques = db.getSync('pratiquesConfigurables', []);
    const pratique = pratiques.find(p => p.id === pratiqueId);

    if (!pratique) {
        alert('Pratique introuvable');
        return;
    }

    pratique.dansBibliotheque = false;
    db.setSync('pratiquesConfigurables', pratiques);

    console.log('✅ Pratique retirée de la bibliothèque:', pratiqueId);

    // Rafraîchir la sidebar d'abord
    await afficherListePratiquesSidebar();

    // Puis rafraîchir le modal
    fermerModalBibliothequePratiques();
    await ouvrirModalBibliothequePratiques();
}

/**
 * Supprime définitivement une pratique depuis le wizard (modal d'édition)
 */
async function supprimerPratiqueDepuisWizard() {
    const modal = document.getElementById('modalWizardPratique');
    if (!modal) return;

    const pratiqueId = modal.dataset.idPratique;
    if (!pratiqueId) {
        alert('❌ Erreur : Impossible d\'identifier la pratique à supprimer');
        return;
    }

    // Appeler la fonction de suppression existante
    await supprimerPratique(pratiqueId);

    // Fermer le wizard
    fermerWizardPratique();

    // Rafraîchir la sidebar
    await afficherListePratiquesSidebar();
}

/**
 * Ajoute une pratique individuelle à la bibliothèque
 */
async function ajouterPratiqueIndividuelle(pratiqueId) {
    const pratiques = db.getSync('pratiquesConfigurables', []);
    const pratique = pratiques.find(p => p.id === pratiqueId);

    if (!pratique) {
        alert('Pratique introuvable');
        return;
    }

    pratique.dansBibliotheque = true;
    db.setSync('pratiquesConfigurables', pratiques);

    console.log('✅ Pratique ajoutée à la bibliothèque:', pratiqueId);

    // Rafraîchir la sidebar d'abord
    await afficherListePratiquesSidebar();

    // Puis rafraîchir le modal
    fermerModalBibliothequePratiques();
    await ouvrirModalBibliothequePratiques();
}

/**
 * Supprime définitivement une pratique hors-bibliothèque
 * 🆕 AJOUT (1er fév 2026) - Feature request Gregoire
 * Permet de supprimer des pratiques qui ne sont pas dans la sidebar
 */
async function supprimerPratiqueHorsBibliotheque(pratiqueId) {
    const pratiques = db.getSync('pratiquesConfigurables', []);
    const pratique = pratiques.find(p => p.id === pratiqueId);

    if (!pratique) {
        alert('Pratique introuvable');
        return;
    }

    // Vérifier que la pratique n'est pas active
    const modalites = db.getSync('modalitesEvaluation', {});
    if (modalites.pratique === pratiqueId) {
        alert(`❌ Impossible de supprimer cette pratique\n\nElle est actuellement active.\n\nVous devez d'abord activer une autre pratique.`);
        return;
    }

    // Vérifier que la pratique n'est pas utilisée par des cours
    if (typeof getCoursUtilisantPratique === 'function') {
        const coursUtilisant = getCoursUtilisantPratique(pratiqueId);
        if (coursUtilisant.length > 0) {
            const listeCours = coursUtilisant.map(c => c.sigle).join(', ');
            alert(`❌ Impossible de supprimer cette pratique\n\nElle est utilisée par ${coursUtilisant.length} cours :\n${listeCours}\n\nVous devez d'abord modifier ces cours.`);
            return;
        }
    }

    const nomAffiche = pratique.nom || pratique.id;
    if (!confirm(`Supprimer définitivement cette pratique ?\n\n"${nomAffiche}"\n\nCette action est irréversible.`)) {
        return;
    }

    try {
        // Supprimer de pratiquesConfigurables
        const index = pratiques.findIndex(p => p.id === pratiqueId);
        if (index !== -1) {
            pratiques.splice(index, 1);
            db.setSync('pratiquesConfigurables', pratiques);
        }

        console.log('✅ Pratique hors-bibliothèque supprimée:', pratiqueId);

        // Rafraîchir le modal
        fermerModalBibliothequePratiques();
        await ouvrirModalBibliothequePratiques();

        // Rafraîchir la liste principale si elle existe
        if (typeof afficherListePratiques === 'function') {
            await afficherListePratiques();
        }

        alert(`✅ Pratique supprimée avec succès.`);
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

/**
 * Partage une pratique avec métadonnées Creative Commons
 * ✅ AJOUT (8 décembre 2025) - Pattern matériel pédagogique
 */
async function partagerPratique(pratiqueId) {
    try {
        const pratiques = db.getSync('pratiquesConfigurables', []);
        const pratique = pratiques.find(p => p.id === pratiqueId);

        if (!pratique) {
            alert('Pratique introuvable');
            return;
        }

        // Demander métadonnées CC enrichies
        const nomAffiche = pratique.nom || pratique.id;
        const metadata = await demanderMetadonneesEnrichies('pratique', nomAffiche);
        if (!metadata) {
            return; // Annulé par l'utilisateur
        }

        // Marquer comme partagée (retirer de ma sélection)
        pratique.dansBibliotheque = false;

        // Ajouter métadonnées CC
        pratique.metadata_cc = metadata;

        // Sauvegarder
        db.setSync('pratiquesConfigurables', pratiques);

        // Rafraîchir modal et sidebar
        fermerModalBibliothequePratiques();
        await afficherListePratiquesSidebar();
        await ouvrirModalBibliothequePratiques();

        alert('Pratique partagée avec succès !\n\nElle est maintenant disponible dans la section "Disponibles à ajouter".');
    } catch (error) {
        console.error('Erreur lors du partage:', error);
        alert('Erreur lors du partage de la pratique');
    }
}

/**
 * Exporte une pratique active avec métadonnées CC
 * ✅ AJOUT (8 décembre 2025) - Pattern matériel pédagogique
 */
async function exporterPratiqueActive(pratiqueId) {
    try {
        const pratiques = db.getSync('pratiquesConfigurables', []);
        const pratique = pratiques.find(p => p.id === pratiqueId);

        if (!pratique) {
            alert('Pratique introuvable');
            return;
        }

        // Demander métadonnées CC enrichies
        const nomAffiche = pratique.nom || pratique.id;
        const metadata = await demanderMetadonneesEnrichies('pratique', nomAffiche);
        if (!metadata) {
            return; // Annulé par l'utilisateur
        }

        // Créer l'objet d'export avec métadonnées
        const pratiqueExport = {
            ...pratique,
            metadata_cc: metadata,
            dateExport: new Date().toISOString()
        };

        // Créer le fichier JSON
        const dataStr = JSON.stringify(pratiqueExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const nomFichier = `pratique-${pratique.id}-${new Date().toISOString().split('T')[0]}.json`;

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomFichier;
        link.click();
        URL.revokeObjectURL(url);

        console.log('✅ Pratique exportée:', nomFichier);
        alert('Pratique exportée avec succès !');

    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        alert('Erreur lors de l\'export de la pratique');
    }
}

/* ===============================
   GESTION WIZARD SPÉCIFICATIONS
   =============================== */

/**
 * Affiche/masque les sections selon le type d'évaluation choisi (binaire vs niveaux)
 */
function afficherConfigSpecType() {
    const typeEval = document.getElementById('wizard-spec-type-evaluation').value;
    const configBinaire = document.getElementById('wizard-spec-config-binaire');
    const configNiveaux = document.getElementById('wizard-spec-config-niveaux');

    if (typeEval === 'binaire') {
        configBinaire.classList.remove('u-hide');
        configNiveaux.classList.add('u-hide');
        // Initialiser avec un type de travail et un palier par défaut
        if (document.getElementById('wizard-spec-types-travaux-liste').children.length === 0) {
            ajouterTypeTravailSpec();
            ajouterPalierBundle();
        }
    } else if (typeEval === 'niveaux') {
        configBinaire.classList.add('u-hide');
        configNiveaux.classList.remove('u-hide');
        // Générer les objectifs par défaut
        genererObjectifsSpec();
    } else {
        configBinaire.classList.add('u-hide');
        configNiveaux.classList.add('u-hide');
    }
}

/**
 * Ajoute un type de travail dans la configuration binaire (François)
 */
function ajouterTypeTravailSpec() {
    const liste = document.getElementById('wizard-spec-types-travaux-liste');
    const index = liste.children.length;

    const div = document.createElement('div');
    div.className = 'wizard-item-liste';
    div.style.cssText = 'padding: 15px; margin-bottom: 12px; background: var(--surface-conteneur, #162c36); border: 1px solid var(--gris-clair); border-radius: 6px;';
    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
            <h5 style="margin: 0; color: var(--accent-primaire);">Type de travail ${index + 1}</h5>
            <button type="button" class="btn-icon" onclick="retirerTypeTravailSpec(this)" style="color: var(--rouge-erreur);">✕</button>
        </div>
        <div class="groupe-form">
            <label>ID (identifiant unique)</label>
            <input type="text" class="controle-form spec-type-id" placeholder="Ex: prise-position" required>
            <small style="color: var(--gris-moyen); font-size: 0.85rem; margin-top: 4px; display: block;">
                Sans espaces, avec tirets. Ex: prise-position, test, portfolio
            </small>
        </div>
        <div class="groupe-form">
            <label>Nom d'affichage</label>
            <input type="text" class="controle-form spec-type-nom" placeholder="Ex: Prise de position" required>
        </div>
        <div class="groupe-form">
            <label>Seuil acceptable (%)</label>
            <input type="number" class="controle-form spec-type-seuil" min="0" max="100" value="75" required>
            <small style="color: var(--gris-moyen); font-size: 0.85rem; margin-top: 4px; display: block;">
                Note minimale pour qu'un travail soit considéré "acceptable" (défaut: 75%)
            </small>
        </div>
        <div class="groupe-form">
            <label>Spécifications (une par ligne)</label>
            <textarea class="controle-form spec-type-specifications" rows="4" placeholder="Ex:\n- Équivalent à environ 750 mots\n- Au moins 2 sources fiables citées\n- Faits établis tirés des sources"></textarea>
        </div>
    `;

    liste.appendChild(div);
}

/**
 * Retire un type de travail
 */
function retirerTypeTravailSpec(btn) {
    btn.closest('.wizard-item-liste').remove();
}

/**
 * Ajoute un palier de bundle dans la table de correspondance
 */
function ajouterPalierBundle() {
    const liste = document.getElementById('wizard-spec-bundles-liste');
    const index = liste.children.length;

    const div = document.createElement('div');
    div.className = 'wizard-item-liste';
    div.style.cssText = 'padding: 15px; margin-bottom: 12px; background: var(--surface-conteneur, #162c36); border: 1px solid var(--gris-clair); border-radius: 6px;';
    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
            <h5 style="margin: 0; color: var(--accent-primaire);">Palier ${index + 1}</h5>
            <button type="button" class="btn-icon" onclick="retirerPalierBundle(this)" style="color: var(--rouge-erreur);">✕</button>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="groupe-form">
                <label>Note fixe (%)</label>
                <input type="number" class="controle-form bundle-note-fixe" min="0" max="100" placeholder="Ex: 100" required>
            </div>
            <div class="groupe-form">
                <label>Label</label>
                <input type="text" class="controle-form bundle-label" placeholder="Ex: A" required>
            </div>
        </div>
        <div class="groupe-form">
            <label>Description</label>
            <input type="text" class="controle-form bundle-description" placeholder="Ex: Excellence" required>
        </div>
        <div class="groupe-form">
            <label>Requis (format JSON : {"type-travail": nombre})</label>
            <textarea class="controle-form bundle-requis" rows="3" placeholder='Ex: {"prise-position": 2, "test": 2, "portfolio": 1}'></textarea>
            <small style="color: var(--gris-moyen); font-size: 0.85rem; margin-top: 4px; display: block;">
                Laisse vide pour le palier d'échec (F). Sinon, indique combien de travaux acceptables de chaque type sont requis.
            </small>
        </div>
    `;

    liste.appendChild(div);
}

/**
 * Retire un palier de bundle
 */
function retirerPalierBundle(btn) {
    btn.closest('.wizard-item-liste').remove();
}

/**
 * Génère la liste des objectifs d'apprentissage (Xavier - niveaux)
 */
function genererObjectifsSpec() {
    const nbObjectifs = parseInt(document.getElementById('wizard-spec-nb-objectifs').value) || 6;
    const liste = document.getElementById('wizard-spec-objectifs-liste');

    // Vider la liste existante
    liste.innerHTML = '';

    for (let i = 1; i <= nbObjectifs; i++) {
        const div = document.createElement('div');
        div.className = 'wizard-item-liste';
        div.style.cssText = 'padding: 15px; margin-bottom: 12px; background: var(--surface-conteneur, #162c36); border: 1px solid var(--gris-clair); border-radius: 6px;';
        div.innerHTML = `
            <h5 style="margin: 0 0 10px 0; color: var(--accent-primaire);">Objectif ${i}</h5>
            <div class="groupe-form">
                <label>Nom de l'objectif</label>
                <input type="text" class="controle-form spec-objectif-nom" placeholder="Ex: Normalisation des bases de données" required>
            </div>
            <div class="groupe-form">
                <label>Description (critères)</label>
                <textarea class="controle-form spec-objectif-description" rows="3" placeholder="Liste des critères à respecter pour cet objectif..."></textarea>
            </div>
        `;

        liste.appendChild(div);
    }
}

/* ===============================
   EXPORTS WINDOW
   =============================== */

window.afficherListePratiquesSidebar = afficherListePratiquesSidebar;
window.ouvrirModalBibliothequePratiques = ouvrirModalBibliothequePratiques;
window.fermerModalBibliothequePratiques = fermerModalBibliothequePratiques;
window.retirerPratiqueDeBibliotheque = retirerPratiqueDeBibliotheque;
window.ajouterPratiqueIndividuelle = ajouterPratiqueIndividuelle;
window.supprimerPratiqueHorsBibliotheque = supprimerPratiqueHorsBibliotheque; // 🆕 (1er fév 2026)
window.partagerPratique = partagerPratique;
window.exporterPratiqueActive = exporterPratiqueActive;

// Exports pour wizard de spécifications
window.afficherConfigSpecType = afficherConfigSpecType;
window.ajouterTypeTravailSpec = ajouterTypeTravailSpec;
window.retirerTypeTravailSpec = retirerTypeTravailSpec;
window.ajouterPalierBundle = ajouterPalierBundle;
window.retirerPalierBundle = retirerPalierBundle;
window.genererObjectifsSpec = genererObjectifsSpec;

window.fermerWizardPratique = fermerWizardPratique;
window.supprimerPratiqueDepuisWizard = supprimerPratiqueDepuisWizard;
window.suivantEtapeWizard = suivantEtapeWizard;
window.precedentEtapeWizard = precedentEtapeWizard;
window.chargerEchellesWizard = chargerEchellesWizard;
window.afficherPreviewEchelleWizard = afficherPreviewEchelleWizard;
window.ouvrirWizardPratique = ouvrirWizardPratique;
window.preremplirWizardPourEdition = preremplirWizardPourEdition;
window.chargerGrillesWizard = chargerGrillesWizard;
window.afficherPreviewGrilleWizard = afficherPreviewGrilleWizard;
window.afficherConfigStructure = afficherConfigStructure;
window.afficherConfigCalcul = afficherConfigCalcul;
window.afficherConfigReprises = afficherConfigReprises;
window.toggleResumeJetonsWizard = toggleResumeJetonsWizard;
window.afficherSeuilsActuelsWizard = afficherSeuilsActuelsWizard;
window.afficherConfigCriteres = afficherConfigCriteres;
window.afficherConfigSeuils = afficherConfigSeuils;
window.ajouterEvaluationWizard = ajouterEvaluationWizard;
window.retirerEvaluationWizard = retirerEvaluationWizard;
window.ajouterObjectifWizard = ajouterObjectifWizard;
window.retirerObjectifWizard = retirerObjectifWizard;
window.calculerTotalPoidsObjectifs = calculerTotalPoidsObjectifs;
window.creerPratiqueDepuisWizard = creerPratiqueDepuisWizard;

// ============================================
// UTILITAIRES DE GESTION DES PRATIQUES
// ============================================

/**
 * Utilitaire : Liste toutes les pratiques configurables dans la console
 * Utile pour identifier les IDs de pratiques à supprimer
 */
function listerPratiquesConfigurables() {
    const pratiques = db.getSync('pratiquesConfigurables', []);
    console.log('📋 Pratiques configurables (' + pratiques.length + ') :');
    console.table(pratiques.map(p => ({
        id: p.id,
        nom: p.nom,
        auteur: p.auteur,
        dansBibliotheque: p.dansBibliotheque
    })));
    return pratiques;
}

/**
 * Utilitaire : Supprime une pratique par recherche de nom
 * @param {string} nomRecherche - Partie du nom à rechercher (ex: "Littérature")
 */
async function supprimerPratiqueParNom(nomRecherche) {
    const pratiques = db.getSync('pratiquesConfigurables', []);
    const pratiqueTrouvee = pratiques.find(p =>
        p.nom && p.nom.toLowerCase().includes(nomRecherche.toLowerCase())
    );

    if (!pratiqueTrouvee) {
        console.error('❌ Aucune pratique trouvée avec le nom contenant:', nomRecherche);
        console.log('💡 Pratiques disponibles:');
        listerPratiquesConfigurables();
        return;
    }

    console.log('✅ Pratique trouvée:', pratiqueTrouvee.nom, '(ID:', pratiqueTrouvee.id + ')');

    if (confirm(`Supprimer la pratique "${pratiqueTrouvee.nom}" ?\n\nCette action est irréversible.`)) {
        await supprimerPratique(pratiqueTrouvee.id);
    }
}

window.listerPratiquesConfigurables = listerPratiquesConfigurables;
window.supprimerPratiqueParNom = supprimerPratiqueParNom;

/* ===============================
   🎨 ACCORDÉONS POUR SECTIONS CONFIGURABLES
   =============================== */

/**
 * Toggle un accordéon (ouvre/ferme)
 * ✅ NOUVEAU (9 décembre 2025)
 * @param {string} id - ID du contenu de l'accordéon
 */
function toggleAccordeon(id) {
    const contenu = document.getElementById(id);
    if (!contenu) {
        console.error('[toggleAccordeon] Élément introuvable:', id);
        return;
    }

    // Trouver le titre h3 (élément précédent)
    const titre = contenu.previousElementSibling;
    if (!titre) {
        console.error('[toggleAccordeon] Titre introuvable pour:', id);
        return;
    }

    const icone = titre.querySelector('.accordeon-icone');

    if (contenu.classList.contains('ouvert')) {
        // Fermer
        contenu.classList.remove('ouvert');
        if (icone) icone.classList.remove('ouvert');
        console.log('[toggleAccordeon] Fermé:', id);
    } else {
        // Ouvrir
        contenu.classList.add('ouvert');
        if (icone) icone.classList.add('ouvert');
        console.log('[toggleAccordeon] Ouvert:', id);
    }
}

window.toggleAccordeon = toggleAccordeon;

/**
 * ✅ BETA 95 : Toggle accordéon v2 (structure avec header cliquable)
 * Sauvegarde l'état dans localStorage pour persistance
 * @param {HTMLElement} headerElement - L'élément .accordeon-header cliqué
 */
function toggleAccordeonV2(headerElement) {
    const carte = headerElement.closest('.carte.accordeon');
    if (!carte) {
        console.error('[toggleAccordeonV2] Carte accordéon introuvable');
        return;
    }

    const contenu = carte.querySelector('.accordeon-contenu');
    const chevron = carte.querySelector('.accordeon-chevron');

    if (!contenu) return;

    // Toggle la classe "ferme" - le CSS gère max-height et opacity via :not(.ferme)
    const estFerme = carte.classList.contains('ferme');

    if (estFerme) {
        // Ouvrir - retirer la classe, le CSS fait le reste
        carte.classList.remove('ferme');
        // Nettoyer les styles inline qui pourraient interférer
        contenu.style.display = '';
        contenu.style.maxHeight = '';
        contenu.style.opacity = '';
    } else {
        // Fermer
        carte.classList.add('ferme');
    }

    // Toggle le chevron
    if (chevron) {
        chevron.textContent = estFerme ? '▼' : '▶';
    }

    // Sauvegarder l'état si l'accordéon a un ID
    if (carte.id) {
        sauvegarderEtatAccordeons();
    }
}

/**
 * Sauvegarde l'état de tous les accordéons dans localStorage
 */
function sauvegarderEtatAccordeons() {
    const accordeons = document.querySelectorAll('.carte.accordeon[id]');
    const etats = {};

    accordeons.forEach(accordeon => {
        if (accordeon.id) {
            // Détecter l'état basé sur la classe .ferme (pas display)
            etats[accordeon.id] = !accordeon.classList.contains('ferme');
        }
    });

    db.setSync('etatsAccordeonsV2', etats);
}

/**
 * Restaure l'état des accordéons depuis localStorage
 */
function restaurerEtatAccordeons() {
    let etats = {};
    try {
        etats = db.getSync('etatsAccordeonsV2', {});
    } catch (e) {
        etats = {};
    }

    const accordeons = document.querySelectorAll('.carte.accordeon[id]');

    accordeons.forEach(accordeon => {
        const contenu = accordeon.querySelector('.accordeon-contenu');
        const chevron = accordeon.querySelector('.accordeon-chevron');

        if (!contenu) return;

        // Si on a un état sauvegardé, l'utiliser, sinon garder l'état HTML initial
        const estOuvert = etats[accordeon.id] === true;

        // Utiliser la classe .ferme au lieu de display (cohérent avec toggleAccordeonV2)
        if (estOuvert) {
            accordeon.classList.remove('ferme');
            contenu.style.maxHeight = '';
            contenu.style.opacity = '';
            contenu.style.display = ''; // Nettoyer les anciens styles inline
        } else {
            accordeon.classList.add('ferme');
            contenu.style.display = ''; // Nettoyer les anciens styles inline
        }

        if (chevron) {
            chevron.textContent = estOuvert ? '▼' : '▶';
        }
    });
}

window.toggleAccordeonV2 = toggleAccordeonV2;
window.restaurerEtatAccordeons = restaurerEtatAccordeons;

/* ===============================
   RÈGLES DE CONFORMITÉ
   =============================== */

/**
 * Initialise les règles de conformité
 * - Peuple les sélecteurs avec les niveaux de l'échelle
 * - Gère la checkbox pour afficher/masquer les détails
 * ✅ NOUVEAU (15 décembre 2025)
 */
function initialiserReglesConformite() {
    console.log('[initialiserReglesConformite] Initialisation...');

    const checkbox = document.getElementById('activerReglesConformite');
    const details = document.getElementById('detailsReglesConformite');

    if (!checkbox || !details) {
        console.log('[initialiserReglesConformite] Éléments non trouvés');
        return;
    }

    // Gérer la checkbox
    checkbox.addEventListener('change', function() {
        toggleDisplay(details, this.checked);
        console.log('[initialiserReglesConformite] Checkbox changée:', this.checked);
        // Peupler les sélecteurs quand on affiche les détails
        if (this.checked) {
            populerSelecteursNiveaux();
        }
    });

    // Peupler les sélecteurs avec les niveaux de l'échelle (si déjà configurée)
    populerSelecteursNiveaux();
}

/**
 * Peuple les sélecteurs de plafond avec les niveaux de l'échelle configurée
 */
function populerSelecteursNiveaux() {
    console.log('[populerSelecteursNiveaux] Peuplement du sélecteur d\'échelles...');

    const selectEchelle = document.getElementById('echelleConformite');
    if (!selectEchelle) {
        console.log('[populerSelecteursNiveaux] Sélecteur echelleConformite non trouvé');
        return;
    }

    // Charger les échelles disponibles (clé: echellesTemplates)
    const echelles = db.getSync('echellesTemplates', []);
    console.log('[populerSelecteursNiveaux] Nombre d\'échelles disponibles:', echelles.length);

    // Vider et repeupler le sélecteur d'échelles
    selectEchelle.innerHTML = '<option value="">-- Choisir une échelle --</option>';

    if (!echelles || echelles.length === 0) {
        console.log('[populerSelecteursNiveaux] Aucune échelle disponible');
        selectEchelle.innerHTML = '<option value="" disabled selected>Crée d\'abord une échelle</option>';
        return;
    }

    // Ajouter chaque échelle comme option
    echelles.forEach(echelle => {
        const option = document.createElement('option');
        option.value = echelle.id;
        option.textContent = `${echelle.nom} (${echelle.niveaux?.length || 0} niveaux)`;
        selectEchelle.appendChild(option);
    });

    console.log('[populerSelecteursNiveaux] Sélecteur d\'échelles peuplé avec', echelles.length, 'échelles');
}

/**
 * Appelé quand l'utilisateur change l'échelle de conformité
 */
function onEchelleConformiteChange() {
    const selectEchelle = document.getElementById('echelleConformite');
    const echelleId = selectEchelle?.value;

    console.log('[onEchelleConformiteChange] Échelle sélectionnée:', echelleId);

    const selecteurs = ['plafondDeficit1', 'plafondDeficit2', 'plafondDeficit3'];

    if (!echelleId) {
        // Vider les sélecteurs de plafonds
        selecteurs.slice(0, 2).forEach(selecteurId => {
            const select = document.getElementById(selecteurId);
            if (select) {
                select.innerHTML = '<option value="" disabled selected>Choisis d\'abord une échelle</option>';
            }
        });
        return;
    }

    // Charger l'échelle sélectionnée (clé: echellesTemplates)
    const echelles = db.getSync('echellesTemplates', []);
    const echelle = echelles.find(e => e.id === echelleId);

    if (!echelle || !echelle.niveaux) {
        console.log('[onEchelleConformiteChange] Échelle non trouvée:', echelleId);
        return;
    }

    console.log('[onEchelleConformiteChange] Peuplement des sélecteurs avec:', echelle.nom);
    populerSelecteursAvecEchelle(echelle, selecteurs);
}

/**
 * Peuple les sélecteurs avec les niveaux d'une échelle donnée
 * @param {Object} echelle - L'échelle à utiliser
 * @param {Array} selecteurs - Les IDs des sélecteurs à peupler
 */
function populerSelecteursAvecEchelle(echelle, selecteurs) {

    // Trier les niveaux par valeur décroissante (du plus haut au plus bas)
    const niveauxTries = [...echelle.niveaux].sort((a, b) => b.valeur - a.valeur);

    console.log('[populerSelecteursNiveaux] Niveaux trouvés:', niveauxTries.map(n => n.code));

    // Peupler les sélecteurs avec les niveaux
    selecteurs.forEach((selecteurId, index) => {
        const select = document.getElementById(selecteurId);
        if (!select) return;

        // Vider le sélecteur (sauf pour déficit 3 qui a déjà "Échec automatique")
        if (index < 2) {
            select.innerHTML = '';
        }

        // Ajouter les niveaux (sauf le plus élevé qui n'a pas de sens comme plafond)
        niveauxTries.forEach((niveau, niveauIndex) => {
            // Pour déficit 1, on peut plafonner à tous sauf le plus haut
            // Pour déficit 2, on propose les niveaux plus bas
            // Pour déficit 3, on ajoute les niveaux après "Échec automatique"

            // Calculer le seuil maximum du niveau (borne supérieure de la plage)
            const seuilMax = calculerSeuilMaxNiveau(niveau, echelle);

            const option = document.createElement('option');
            option.value = niveau.code;
            option.textContent = `${niveau.nom} (max ${seuilMax}%)`;
            option.dataset.seuilMax = seuilMax;

            select.appendChild(option);
        });
    });

    console.log('[populerSelecteursNiveaux] Sélecteurs peuplés');
}

/**
 * Calcule le seuil maximum d'un niveau (borne supérieure de sa plage)
 * @param {Object} niveau - Le niveau de l'échelle
 * @param {Object} echelle - L'échelle complète
 * @returns {number} Le seuil maximum en pourcentage
 */
function calculerSeuilMaxNiveau(niveau, echelle) {
    // Structure des niveaux IDME : { code, nom, min, max, valeurCalcul, couleur }

    // Si le niveau a une propriété 'max' définie, l'utiliser directement
    if (niveau.max !== undefined && niveau.max !== null) {
        // Arrondir à l'entier inférieur pour avoir un seuil propre
        return Math.floor(niveau.max);
    }

    // Fallback : trier les niveaux par min croissant et calculer
    const niveauxTries = [...echelle.niveaux].sort((a, b) => {
        const minA = a.min ?? a.valeurCalcul ?? 0;
        const minB = b.min ?? b.valeurCalcul ?? 0;
        return minA - minB;
    });

    // Trouver l'index du niveau actuel
    const index = niveauxTries.findIndex(n => n.code === niveau.code);

    if (index === niveauxTries.length - 1) {
        // C'est le niveau le plus haut, pas de plafond (100%)
        return 100;
    }

    // Le seuil max est juste en dessous du seuil min du niveau suivant
    const niveauSuivant = niveauxTries[index + 1];
    const minSuivant = niveauSuivant.min ?? niveauSuivant.valeurCalcul;

    if (minSuivant !== undefined) {
        return Math.floor(minSuivant) - 1;
    }

    // Dernier recours : utiliser valeurCalcul
    return Math.floor(niveau.valeurCalcul ?? 50);
}

/**
 * Récupère la configuration des règles de conformité depuis les champs
 * @returns {Object} Configuration des règles de conformité
 */
function getReglesConformiteConfig() {
    const checkbox = document.getElementById('activerReglesConformite');
    const selectEchelle = document.getElementById('echelleConformite');
    const select1 = document.getElementById('plafondDeficit1');
    const select2 = document.getElementById('plafondDeficit2');
    const select3 = document.getElementById('plafondDeficit3');

    return {
        actif: checkbox ? checkbox.checked : false,
        echelleId: selectEchelle ? selectEchelle.value : null,
        condition: {
            type: 'nombre',
            cible: 'productions'
            // Le minimum est lu depuis configMinimumCompletion
        },
        plafonds: [
            {
                deficit: 1,
                niveauCode: select1 ? select1.value : null,
                seuilMax: select1 ? parseFloat(select1.selectedOptions[0]?.dataset?.seuilMax) : null
            },
            {
                deficit: 2,
                niveauCode: select2 ? select2.value : null,
                seuilMax: select2 ? parseFloat(select2.selectedOptions[0]?.dataset?.seuilMax) : null
            },
            {
                deficit: 3,
                echec: select3 ? select3.value === 'echec' : true,
                niveauCode: select3 && select3.value !== 'echec' ? select3.value : null,
                seuilMax: select3 && select3.value !== 'echec' ? parseFloat(select3.selectedOptions[0]?.dataset?.seuilMax) : 0
            }
        ]
    };
}

/**
 * Charge la configuration des règles de conformité dans les champs
 * @param {Object} regles - Configuration des règles de conformité
 */
function chargerReglesConformiteConfig(regles) {
    console.log('[chargerReglesConformiteConfig] Chargement:', regles);

    if (!regles) return;

    const checkbox = document.getElementById('activerReglesConformite');
    const details = document.getElementById('detailsReglesConformite');
    const selectEchelle = document.getElementById('echelleConformite');

    if (checkbox) {
        checkbox.checked = regles.actif === true;
    }

    if (details) {
        toggleDisplay(details, regles.actif);
    }

    // D'ABORD peupler le sélecteur d'échelles avec les options
    populerSelecteursNiveaux();

    // ENSUITE charger l'échelle sélectionnée
    if (selectEchelle && regles.echelleId) {
        selectEchelle.value = regles.echelleId;
        console.log('[chargerReglesConformiteConfig] Échelle définie:', regles.echelleId);
        // Déclencher le peuplement des sélecteurs de plafonds
        onEchelleConformiteChange();
    }

    // Charger les plafonds (après un court délai pour laisser le temps aux sélecteurs de se peupler)
    setTimeout(() => {
        if (regles.plafonds && Array.isArray(regles.plafonds)) {
            regles.plafonds.forEach(plafond => {
                const selectId = `plafondDeficit${plafond.deficit}`;
                const select = document.getElementById(selectId);

                if (select && plafond.niveauCode) {
                    select.value = plafond.niveauCode;
                } else if (select && plafond.echec) {
                    select.value = 'echec';
                }
            });
        }
        console.log('[chargerReglesConformiteConfig] Plafonds chargés');
    }, 50);
}

// Exporter les fonctions
window.initialiserReglesConformite = initialiserReglesConformite;
window.populerSelecteursNiveaux = populerSelecteursNiveaux;
window.onEchelleConformiteChange = onEchelleConformiteChange;
window.getReglesConformiteConfig = getReglesConformiteConfig;
window.chargerReglesConformiteConfig = chargerReglesConformiteConfig;

})();
