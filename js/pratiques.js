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
    // BETA 92: Nouveau conteneur pour la gestion des pratiques configurables
    const listePratiques = document.getElementById('listePratiques');
    if (!listePratiques) {
        console.log('   ⚠️  Section pratiques non active, initialisation reportée');
        return;
    }

    // BETA 92: Afficher la liste des pratiques configurables
    afficherListePratiques();

    // Attacher les événements (pour les anciennes configurations)
    attacherEvenementsPratiques();

    // Charger les modalités sauvegardées
    chargerModalites();

    // Afficher les cartes PAN (Portfolio + Jetons) si PAN-Maîtrise est active
    afficherCartesExtras();

    // Charger les valeurs du portfolio et jetons depuis localStorage
    const modalites = db.getSync('modalitesEvaluation', {});
    console.log('[initialiserModulePratiques] modalites:', modalites);
    console.log('[initialiserModulePratiques] configPAN:', modalites.configPAN);

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
        return 'pan-maitrise'; // Pratique par défaut
    }

    // Si le cours a une pratique définie, la retourner
    if (coursActuel.pratiqueId) {
        console.log(`[getPratiqueCours] Cours ${coursId} utilise la pratique: ${coursActuel.pratiqueId}`);
        return coursActuel.pratiqueId;
    }

    // Sinon, utiliser la pratique par défaut
    console.log(`[getPratiqueCours] Cours ${coursId} n'a pas de pratique définie, utilisation de pan-maitrise par défaut`);
    return 'pan-maitrise'; // Pratique par défaut
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
 * FONCTIONNEMENT:
 * 1. Récupère tous les cours
 * 2. Filtre ceux qui ont le pratiqueId spécifié
 * 3. Retourne la liste
 *
 * @param {string} pratiqueId - ID de la pratique ('pan-maitrise' ou 'sommative')
 * @returns {Array} - Tableau des cours utilisant cette pratique
 */
function getCoursUtilisantPratique(pratiqueId) {
    const cours = db.getSync('listeCours', []);
    return cours.filter(c => c.pratiqueId === pratiqueId);
}

/**
 * Obtient la pratique par défaut
 *
 * FONCTIONNEMENT:
 * 1. Lit depuis localStorage 'pratiqueParDefaut'
 * 2. Si non définie, retourne 'pan-maitrise'
 *
 * @returns {string} - ID de la pratique par défaut
 */
function getPratiqueParDefaut() {
    const pratiqueParDefaut = db.getSync('pratiqueParDefaut', 'pan-maitrise');
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

    const nomPratique = pratiqueId === 'sommative' ? 'Sommative traditionnelle' : 'PAN-Maîtrise';
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
            // PAN-Maîtrise est sélectionnée - classe btn-principal
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
        const nomPratique = pratiqueDefaut === 'sommative' ? 'Sommative traditionnelle' : 'PAN-Maîtrise';
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
    const productions = db.getSync('productions', []);
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
    const pratique = document.getElementById('pratiqueNotation').value;
    const colonnePAN = document.getElementById('colonnePAN');
    const selectPAN = document.getElementById('typePAN');
    const infoPAN = document.getElementById('infoPAN');

    if (pratique === 'pan-maitrise') {
        // Afficher le menu PAN
        colonnePAN.style.display = 'block';
    } else {
        // Masquer le menu PAN
        colonnePAN.style.display = 'none';
        selectPAN.value = '';
        infoPAN.style.display = 'none';
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
        infoPAN.style.display = 'block';

        // Sauvegarder le type de PAN
        let modalites = db.getSync('modalitesEvaluation', {});
        modalites.typePAN = typePAN;
        db.setSync('modalitesEvaluation', modalites);

        mettreAJourStatutModalites();
    } else {
        infoPAN.style.display = 'none';
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
        if (sectionAffichageTableauBord) {
            sectionAffichageTableauBord.style.display = 'block';
        }

        // Afficher les checkboxes d'activation pour PAN
        if (pratique === 'pan-maitrise' && activationsExtras) {
            activationsExtras.style.display = 'block';
            // Initialiser l'affichage des cartes
            afficherCartesExtras();
        } else if (activationsExtras) {
            activationsExtras.style.display = 'none';
        }
    } else {
        // Masquer tout si aucune pratique sélectionnée
        if (sectionAffichageTableauBord) {
            sectionAffichageTableauBord.style.display = 'none';
        }
        if (activationsExtras) {
            activationsExtras.style.display = 'none';
        }
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
    const pratique = modalites.pratique || 'pan-maitrise';

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
        } else if (pratique === 'pan-maitrise') {
            modalites.affichageTableauBord = {
                afficherSommatif: false,
                afficherAlternatif: true
            };
        }
    }

    db.setSync('modalitesEvaluation', modalites);

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
        configPAN.style.display = 'block';
        chargerConfigurationPAN();
    } else {
        configPAN.style.display = 'none';
    }
}

/**
 * Affiche les paramètres de configuration PAN
 * Appelée par le bouton "Modifier les paramètres"
 */
function afficherParametresPAN() {
    const configPAN = document.getElementById('configurationPAN');
    if (!configPAN) return;

    configPAN.style.display = 'block';
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
        delai: { nombre: 2, dureeJours: 7 },
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
        inputNombreJetonsParEleve.value = jetons.nombreParEleve || 4;
    }

    // Charger les types de jetons personnalisés (NOUVEAU)
    const jetonsPersonnalises = jetons.typesPersonnalises || [];
    afficherJetonsPersonnalises(jetonsPersonnalises);

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
        groupeNombreElem.style.display = config.afficherNombre ? 'block' : 'none';
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
    cartePortfolio.style.display = 'block';
    if (checkPortfolio && checkPortfolio.checked) {
        cartePortfolio.style.opacity = '1';
    } else {
        cartePortfolio.style.opacity = '0.5';
    }

    // Gérer l'apparence de la carte Jetons
    carteJetons.style.display = 'block';
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
    const dureeDelai = selectDureeDelai ? parseInt(selectDureeDelai.value) : 7;

    const selectNombreJetonsReprise = document.getElementById('nombreJetonsReprise');
    const nombreJetonsReprise = selectNombreJetonsReprise ? parseInt(selectNombreJetonsReprise.value) : 2;

    const selectMaxRepriseParProduction = document.getElementById('maxRepriseParProduction');
    const maxRepriseParProduction = selectMaxRepriseParProduction ? parseInt(selectMaxRepriseParProduction.value) : 1;

    const radioGestion = document.querySelector('input[name="gestionOriginale"]:checked');
    const gestionOriginale = radioGestion ? radioGestion.value : 'archiver';

    // NOUVEAU: Nombre de jetons par élève
    const inputNombreJetonsParEleve = document.getElementById('nombreJetonsParEleve');
    const nombreParEleve = inputNombreJetonsParEleve ? parseInt(inputNombreJetonsParEleve.value) : 4;

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
            decouplerPR: decouplerPR
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

            typesPersonnalises: typesPersonnalises
        }
    };

    db.setSync('modalitesEvaluation', modalites);
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
    const selecteurVisible = colonnePAN && colonnePAN.style.display !== 'none';
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
    }

    // S'assurer que les options d'affichage sont incluses
    if (!modalites.affichageTableauBord) {
        const checkComparatif = document.getElementById('modeComparatif');
        const modeComparatif = checkComparatif ? checkComparatif.checked : false;

        if (modeComparatif) {
            modalites.affichageTableauBord = {
                afficherSommatif: true,
                afficherAlternatif: true
            };
        } else {
            if (pratique === 'sommative') {
                modalites.affichageTableauBord = {
                    afficherSommatif: true,
                    afficherAlternatif: false
                };
            } else if (pratique === 'pan-maitrise') {
                modalites.affichageTableauBord = {
                    afficherSommatif: false,
                    afficherAlternatif: true
                };
            }
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
    } else {
        // Par défaut désactivé si l'élément n'existe pas (mode simple par défaut)
        modalites.activerCategorisationErreurs = false;
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

    // Si pas de données sauvegardées, tout remettre à zéro
    if (!modalites.pratique) {
        selectPratique.value = '';
        colonnePAN.style.display = 'none';
        selectPAN.value = '';
        if (optionsAffichage) {
            optionsAffichage.style.display = 'none';
        }
        mettreAJourStatutModalites();
        return;
    }

    // Charger la pratique de notation
    selectPratique.value = modalites.pratique;

    // Gérer l'affichage du menu PAN
    if (modalites.pratique === 'pan-maitrise') {
        colonnePAN.style.display = 'block';

        // Charger le type de PAN si disponible
        if (modalites.typePAN) {
            selectPAN.value = modalites.typePAN;
            afficherInfoPAN();
        } else {
            selectPAN.value = '';
        }
    } else {
        colonnePAN.style.display = 'none';
        selectPAN.value = '';
    }

    // Charger les options d'affichage
    if (modalites.affichageTableauBord) {
        const checkComparatif = document.getElementById('modeComparatif');

        if (checkComparatif) {
            // Mode comparatif activé si les deux sont affichés
            const modeComparatif = modalites.affichageTableauBord.afficherSommatif &&
                                   modalites.affichageTableauBord.afficherAlternatif;
            checkComparatif.checked = modeComparatif;
        }
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
        configPAN.style.display = 'none';
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
   🔔 NOTIFICATIONS
   =============================== */

/**
 * Affiche une notification de succès
 * 
 * FONCTIONNEMENT:
 * 1. Crée un div avec le message
 * 2. Ajoute au body avec animation
 * 3. Supprime après 3 secondes
 */
function afficherNotificationSucces(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-succes';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type de jeton ?')) {
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

    console.log(`✅ ${grilles.length} grille(s) chargée(s) dans le sélecteur de référence`);
}

// ============================================================================
// GESTION DES PRATIQUES CONFIGURABLES (Beta 92)
// ============================================================================

/**
 * Affiche la liste de toutes les pratiques (codées + configurables)
 * Génère des cartes avec les actions disponibles
 */
async function afficherListePratiques() {
    const container = document.getElementById('listePratiques');
    if (!container) return;

    try {
        // Obtenir toutes les pratiques
        const pratiques = await PratiqueManager.listerPratiques();
        const modalites = db.getSync('modalitesEvaluation', {});
        const pratiqueActiveId = modalites.pratique;

        // Structure en 2 colonnes pour séparer pratiques intégrées et configurables
        let htmlIntegrees = '';
        let htmlConfigurables = '';

        // 1. Pratiques codées (intégrées - non modifiables)
        if (pratiques.codees && pratiques.codees.length > 0) {
            pratiques.codees.forEach(p => {
                const estActive = p.id === pratiqueActiveId;
                htmlIntegrees += genererCartePratique(p, estActive, false); // false = non modifiable
            });
        }

        // 2. Pratiques configurables
        if (pratiques.configurables && pratiques.configurables.length > 0) {
            pratiques.configurables.forEach(p => {
                const estActive = p.id === pratiqueActiveId;
                htmlConfigurables += genererCartePratique(p, estActive, true); // true = modifiable
            });
        }

        // 3. Assembler le HTML final en 2 colonnes
        let html = '';

        if (htmlIntegrees || htmlConfigurables) {
            html = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
                    <!-- Colonne 1: Pratiques intégrées -->
                    <div>
                        <h4 style="font-size: 0.95rem; color: var(--gris-fonce); margin-bottom: 15px;">
                            Pratiques intégrées (non modifiables)
                        </h4>

                        <!-- Sélecteur de pratique par défaut -->
                        ${genererSelecteurPratiqueParDefaut()}

                        <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 15px;">
                            ${htmlIntegrees || '<p style="color: var(--gris-moyen); font-style: italic;">Aucune pratique intégrée</p>'}
                        </div>
                    </div>

                    <!-- Colonne 2: Pratiques configurables -->
                    <div>
                        <h4 style="font-size: 0.95rem; color: var(--gris-fonce); margin-bottom: 15px;">
                            Pratiques configurables
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            ${htmlConfigurables || '<p style="color: var(--gris-moyen); font-style: italic;">Aucune pratique personnalisée</p>'}
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Message si aucune pratique du tout
            html = `
                <div style="padding: 20px; background: var(--bleu-tres-pale); border-radius: 6px; text-align: center;">
                    <p style="color: var(--gris-moyen); margin-bottom: 10px;">
                        Aucune pratique disponible
                    </p>
                    <button class="btn btn-ajouter" onclick="afficherPratiquesPredefines()">
                        Charger les exemples
                    </button>
                </div>
            `;
        }

        container.innerHTML = html;
    } catch (error) {
        console.error('Erreur lors de l\'affichage des pratiques:', error);
        container.innerHTML = `
            <div style="padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
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
        <div class="carte" style="margin-bottom: 15px; padding: 12px; background: var(--bleu-tres-pale); border-left: 4px solid var(--bleu-principal);">
            <div style="margin-bottom: 8px;">
                <strong style="font-size: 0.9rem; color: var(--bleu-principal);">Pratique par défaut</strong>
            </div>
            <p class="text-muted" style="margin: 0 0 10px 0; font-size: 0.8rem; line-height: 1.4;">
                Présélectionnée lors de la création de nouveaux cours
            </p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="cursor: pointer; display: flex; align-items: center;">
                    <input
                        type="radio"
                        name="pratiqueDefaut"
                        value="pan-maitrise"
                        ${pratiqueDefaut === 'pan-maitrise' ? 'checked' : ''}
                        onchange="changerPratiqueParDefaut('pan-maitrise')">
                    <span style="margin-left: 8px;">PAN-Maîtrise</span>
                </label>
                <label style="cursor: pointer; display: flex; align-items: center;">
                    <input
                        type="radio"
                        name="pratiqueDefaut"
                        value="sommative"
                        ${pratiqueDefaut === 'sommative' ? 'checked' : ''}
                        onchange="changerPratiqueParDefaut('sommative')">
                    <span style="margin-left: 8px;">Sommative</span>
                </label>
            </div>
        </div>
    `;
}

/**
 * Génère le HTML d'une carte de pratique
 * @param {object} pratique - Objet pratique {id, nom, description, auteur}
 * @param {boolean} estActive - True si c'est la pratique active
 * @param {boolean} modifiable - True si la pratique peut être éditée/supprimée
 * @returns {string} HTML de la carte
 */
function genererCartePratique(pratique, estActive, modifiable) {
    console.log(`[genererCartePratique] ${pratique.id} - estActive:${estActive}, modifiable:${modifiable}`);

    const badgeActif = estActive ? `<span class="badge-pratique badge-pratique-active">ACTIVE</span>` : '';

    // NOUVEAU Beta 91 : Compter le nombre de cours utilisant cette pratique
    const coursUtilisant = getCoursUtilisantPratique(pratique.id);
    const nbCours = coursUtilisant.length;
    const badgeParDefaut = (getPratiqueParDefaut() === pratique.id) ?
        `<span class="badge-pratique badge-pratique-defaut">PAR DÉFAUT</span>` : '';

    const boutonActiver = !estActive ? `<button class="btn btn-tres-compact btn-confirmer" onclick="activerPratique('${pratique.id}')">Activer</button>` : '';

    const boutonsModification = modifiable ? `
        <button class="btn btn-tres-compact btn-modifier" onclick="editerPratique('${pratique.id}')">Éditer</button>
        <button class="btn btn-tres-compact btn-secondaire" onclick="dupliquerPratique('${pratique.id}')">Dupliquer</button>
        <button class="btn btn-tres-compact btn-secondaire" onclick="exporterPratiqueVersJSON('${pratique.id}')">Exporter</button>
        <button class="btn btn-tres-compact btn-supprimer" onclick="supprimerPratique('${pratique.id}')">Supprimer</button>
    ` : '';

    const auteur = pratique.auteur ? `<small style="color: var(--gris-moyen);">Par ${pratique.auteur}</small>` : '';

    return `
        <div style="padding: 15px; background: white; border: 2px solid ${estActive ? 'var(--vert-succes)' : '#ddd'}; border-radius: 8px; ${estActive ? 'box-shadow: 0 2px 8px rgba(108, 207, 127, 0.2);' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; margin-bottom: 6px;">
                        <strong style="font-size: 1rem; color: var(--bleu-principal);">${pratique.nom}</strong>
                        ${badgeActif}
                        ${badgeParDefaut}
                    </div>
                    ${auteur ? `<div style="margin-bottom: 6px;">${auteur}</div>` : ''}
                    ${pratique.description ? `<p style="color: var(--gris-moyen); font-size: 0.85rem; margin: 0; line-height: 1.4;">${pratique.description}</p>` : ''}

                    <!-- NOUVEAU Beta 91 : Compteur d'utilisation -->
                    <div style="margin-top: 8px; padding: 8px; background: var(--bleu-tres-pale); border-radius: 4px; font-size: 0.85rem;">
                        <strong style="color: var(--bleu-principal);">Utilisée par ${nbCours} cours</strong>
                        ${nbCours > 0 ? `<span style="color: var(--gris-moyen); margin-left: 5px;">(${coursUtilisant.map(c => c.sigle).join(', ')})</span>` : ''}
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
                ${boutonActiver}
                ${boutonsModification}
            </div>
        </div>
    `;
}

/**
 * Active une pratique
 * @param {string} id - ID de la pratique à activer
 */
async function activerPratique(id) {
    if (!confirm(`Activer cette pratique ?\n\nToutes les évaluations futures utiliseront cette pratique.`)) {
        return;
    }

    try {
        await PratiqueManager.changerPratiqueActive(id);
        console.log('✅ Pratique activée:', id);

        // Recharger l'affichage
        await afficherListePratiques();

        // Notification
        alert(`✅ Pratique activée avec succès !\n\nLes évaluations futures utiliseront cette pratique.`);
    } catch (error) {
        console.error('Erreur lors de l\'activation:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
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
 */
function ouvrirWizardPratique(modeEdition = false, idPratique = null) {
    const modal = document.getElementById('modalWizardPratique');
    if (!modal) return;

    // Stocker le mode et l'ID pour utilisation ultérieure
    modal.dataset.modeEdition = modeEdition;
    modal.dataset.idPratique = idPratique || '';

    // Mettre à jour le titre du wizard
    const titre = document.querySelector('#modalWizardPratique h2');
    if (titre) {
        titre.textContent = modeEdition ? 'Modifier une pratique' : 'Créer une nouvelle pratique';
    }

    // Mettre à jour le texte du bouton final
    const btnCreer = document.getElementById('wizard-btn-creer');
    if (btnCreer) {
        btnCreer.textContent = modeEdition ? '✓ Sauvegarder' : '✓ Créer la pratique';
    }

    // Réinitialiser si mode création
    if (!modeEdition) {
        resetterWizard();
    }

    // Afficher le modal
    modal.style.display = 'flex';
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

        alert(`✅ Pratique dupliquée avec succès !\n\n"${nouveauNom}" a été ajoutée à vos pratiques.`);
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
 */
function creerNouvellePratique() {
    // Ouvrir le wizard en mode création
    ouvrirWizardPratique(false, null);
}

/**
 * Ferme le modal wizard
 */
function fermerWizardPratique() {
    const modal = document.getElementById('modalWizardPratique');
    if (modal) {
        modal.style.display = 'none';
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
        preview.style.display = 'none';
        return;
    }

    // Cas spécial : grille par défaut SRPNF
    if (grilleId === 'defaut-srpnf') {
        contenu.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 4px;">
                    <strong>Structure</strong>
                    <span style="color: var(--gris-moyen); font-size: 0.9rem;">15%</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 4px;">
                    <strong>Rigueur</strong>
                    <span style="color: var(--gris-moyen); font-size: 0.9rem;">20%</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 4px;">
                    <strong>Plausibilité</strong>
                    <span style="color: var(--gris-moyen); font-size: 0.9rem;">10%</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 4px;">
                    <strong>Nuance</strong>
                    <span style="color: var(--gris-moyen); font-size: 0.9rem;">25%</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 4px;">
                    <strong>Français</strong>
                    <span style="color: var(--gris-moyen); font-size: 0.9rem;">30%</span>
                </div>
            </div>
        `;
        preview.style.display = 'block';
        return;
    }

    // Charger la grille depuis localStorage
    const grilles = db.getSync('grillesTemplates', []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres) {
        preview.style.display = 'none';
        return;
    }

    // Générer le HTML de prévisualisation
    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';

    grille.criteres.forEach(critere => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 4px;">
                <strong>${critere.nom}</strong>
                <span style="color: var(--gris-moyen); font-size: 0.9rem;">${critere.ponderation}%</span>
            </div>
        `;
    });

    html += '</div>';

    contenu.innerHTML = html;
    preview.style.display = 'block';
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
        preview.style.display = 'none';
        return;
    }

    // Cas spécial : échelle par défaut IDME
    if (echelleId === 'defaut-idme') {
        contenu.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 4px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; background: #FF6B6B;"></div>
                    <div style="flex: 1;">
                        <strong>I - Insuffisant</strong>
                        <div style="font-size: 0.85rem; color: var(--gris-moyen);">Plage : 0-64% • Calcul : 50%</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 4px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; background: #FFD93D;"></div>
                    <div style="flex: 1;">
                        <strong>D - En développement</strong>
                        <div style="font-size: 0.85rem; color: var(--gris-moyen);">Plage : 65-74% • Calcul : 70%</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 4px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; background: #6BCF7F;"></div>
                    <div style="flex: 1;">
                        <strong>M - Maîtrisé</strong>
                        <div style="font-size: 0.85rem; color: var(--gris-moyen);">Plage : 75-84% • Calcul : 80%</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 4px;">
                    <div style="width: 30px; height: 30px; border-radius: 4px; background: #4D96FF;"></div>
                    <div style="flex: 1;">
                        <strong>E - Étendu</strong>
                        <div style="font-size: 0.85rem; color: var(--gris-moyen);">Plage : 85-100% • Calcul : 92,5%</div>
                    </div>
                </div>
            </div>
        `;
        preview.style.display = 'block';
        return;
    }

    // Charger l'échelle depuis localStorage
    const echelles = db.getSync('echellesTemplates', []);
    const echelle = echelles.find(e => e.id === echelleId);

    if (!echelle || !echelle.niveaux) {
        preview.style.display = 'none';
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
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 4px;">
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
    preview.style.display = 'block';
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
}

/**
 * Affiche une étape spécifique du wizard
 */
function afficherEtapeWizard(numeroEtape) {
    // Cacher toutes les étapes
    const steps = document.querySelectorAll('.wizard-step');
    steps.forEach(step => step.style.display = 'none');

    // Afficher l'étape demandée
    const currentStep = document.querySelector(`.wizard-step[data-step="${numeroEtape}"]`);
    if (currentStep) {
        currentStep.style.display = 'block';
    }

    // Mettre à jour l'indicateur
    document.getElementById('wizard-etape-actuelle').textContent = numeroEtape;
    document.getElementById('wizard-etape-titre').textContent = wizardTitresEtapes[numeroEtape];

    // Mettre à jour les dots
    const dots = document.querySelectorAll('.wizard-dot');
    dots.forEach((dot, index) => {
        if (index + 1 === numeroEtape) {
            dot.classList.add('wizard-dot-active');
        } else {
            dot.classList.remove('wizard-dot-active');
        }
    });

    // Charger les données dynamiques selon l'étape
    if (numeroEtape === 7) {
        afficherSeuilsActuelsWizard();
    }

    // Gérer l'affichage des boutons
    const btnPrecedent = document.getElementById('wizard-btn-precedent');
    const btnSuivant = document.getElementById('wizard-btn-suivant');
    const btnCreer = document.getElementById('wizard-btn-creer');

    if (numeroEtape === 1) {
        btnPrecedent.style.display = 'none';
        btnSuivant.style.display = 'inline-block';
        btnCreer.style.display = 'none';
    } else if (numeroEtape === wizardNbEtapes) {
        btnPrecedent.style.display = 'inline-block';
        btnSuivant.style.display = 'none';
        btnCreer.style.display = 'inline-block';
    } else {
        btnPrecedent.style.display = 'inline-block';
        btnSuivant.style.display = 'inline-block';
        btnCreer.style.display = 'none';
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
    document.getElementById('wizard-config-niveaux').style.display = 'none';
    document.getElementById('wizard-config-pourcentage').style.display = 'none';
    document.getElementById('wizard-config-notes-fixes').style.display = 'none';

    // Afficher la config appropriée
    if (type === 'niveaux') {
        document.getElementById('wizard-config-niveaux').style.display = 'block';
        // Initialiser avec 4 niveaux IDME par défaut
        if (document.getElementById('wizard-niveaux-liste').children.length === 0) {
            initialiserNiveauxIDME();
        }
    } else if (type === 'pourcentage') {
        document.getElementById('wizard-config-pourcentage').style.display = 'block';
    } else if (type === 'notes_fixes') {
        document.getElementById('wizard-config-notes-fixes').style.display = 'block';
    }
}

/**
 * Initialise les niveaux IDME par défaut
 */
function initialiserNiveauxIDME() {
    const niveauxIDME = [
        { code: 'I', label: 'Insuffisant', pct: 50, couleur: '#FF6B6B' },
        { code: 'D', label: 'En développement', pct: 70, couleur: '#FFD93D' },
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
    div.style.cssText = 'display: grid; grid-template-columns: 80px 1fr 100px 80px 40px; gap: 10px; margin-bottom: 10px; padding: 12px; background: white; border-radius: 4px; border: 1px solid var(--gris-leger);';

    div.innerHTML = `
        <input type="text" class="controle-form" placeholder="Code" value="${niveau.code}" data-field="code" style="padding: 6px;">
        <input type="text" class="controle-form" placeholder="Label" value="${niveau.label}" data-field="label" style="padding: 6px;">
        <input type="number" class="controle-form" placeholder="%" value="${niveau.pct}" min="0" max="100" step="0.1" data-field="pct" style="padding: 6px;">
        <input type="color" class="controle-form" value="${niveau.couleur}" data-field="couleur" style="padding: 2px; height: 36px;">
        <button type="button" class="btn btn-tres-compact" onclick="retirerNiveauWizard(this)" style="background: #dc3545; color: white; padding: 6px;">🗑️</button>
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
    document.getElementById('wizard-config-standards').style.display = 'none';
    document.getElementById('wizard-config-portfolio').style.display = 'none';
    document.getElementById('wizard-config-evaluations').style.display = 'none';
    document.getElementById('wizard-config-specifications').style.display = 'none';

    // Afficher la config appropriée
    if (type === 'standards') {
        document.getElementById('wizard-config-standards').style.display = 'block';
    } else if (type === 'portfolio') {
        document.getElementById('wizard-config-portfolio').style.display = 'block';
    } else if (type === 'evaluations_discretes') {
        document.getElementById('wizard-config-evaluations').style.display = 'block';
    } else if (type === 'specifications') {
        document.getElementById('wizard-config-specifications').style.display = 'block';
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
    div.style.cssText = 'display: grid; grid-template-columns: 1fr 100px 40px; gap: 10px; margin-bottom: 10px; padding: 12px; background: white; border-radius: 4px; border: 1px solid var(--gris-leger);';

    div.innerHTML = `
        <input type="text" class="controle-form" placeholder="Nom de l'évaluation" data-field="nom" style="padding: 6px;">
        <input type="number" class="controle-form" placeholder="Poids %" min="0" max="100" step="1" data-field="poids" style="padding: 6px;">
        <button type="button" class="btn btn-tres-compact" onclick="retirerEvaluationWizard(this)" style="background: #dc3545; color: white; padding: 6px;">🗑️</button>
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
 * Affiche la configuration selon la méthode de calcul
 */
function afficherConfigCalcul() {
    const methode = document.getElementById('wizard-calcul-methode').value;
    const infoDiv = document.getElementById('wizard-info-calcul');
    const infoTexte = document.getElementById('wizard-info-calcul-texte');

    if (!methode) {
        infoDiv.style.display = 'none';
        return;
    }

    infoDiv.style.display = 'block';

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
        configDiv.style.display = 'none';
        infoDiv.style.display = 'none';
    } else if (type === 'illimitees' || type === 'occasions_ponctuelles' || type === 'limitees') {
        configDiv.style.display = 'block';
        infoDiv.style.display = type === 'occasions_ponctuelles' ? 'block' : 'none';
    } else {
        configDiv.style.display = 'none';
        infoDiv.style.display = 'none';
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
            <div style="padding: 10px; background: white; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: var(--bleu-principal);">Bon</strong>
                <span style="color: var(--gris-fonce); font-size: 1.1rem; font-weight: 600;">≥ ${seuils.bon}%</span>
            </div>
            <div style="padding: 10px; background: white; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: var(--bleu-principal);">Acceptable</strong>
                <span style="color: var(--gris-fonce); font-size: 1.1rem; font-weight: 600;">≥ ${seuils.acceptable}%</span>
            </div>
            <div style="padding: 10px; background: white; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: var(--bleu-principal);">Fragile</strong>
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
                    <div style="padding: 10px; background: white; border-radius: 4px;">
                        <strong style="display: block; margin-bottom: 4px; color: var(--bleu-principal);">Allocation générale</strong>
                        <span style="color: var(--gris-fonce);">${jetons.nombreParEleve} jetons par élève</span>
                    </div>
                `;
            }

            // Jetons de délai
            if (jetons.delai && jetons.delai.actif) {
                html += `
                    <div style="padding: 10px; background: white; border-radius: 4px;">
                        <strong style="display: block; margin-bottom: 4px; color: var(--bleu-principal);">Jetons de délai</strong>
                        <span style="color: var(--gris-fonce);">Prolongation de ${jetons.delai.dureeJours || 0} jours</span>
                    </div>
                `;
            }

            // Jetons de reprise
            if (jetons.reprise && jetons.reprise.actif) {
                const action = jetons.reprise.archiverOriginale ? 'Archive l\'évaluation originale' : 'Remplace l\'évaluation originale';
                html += `
                    <div style="padding: 10px; background: white; border-radius: 4px;">
                        <strong style="display: block; margin-bottom: 4px; color: var(--bleu-principal);">Jetons de reprise</strong>
                        <span style="color: var(--gris-fonce);">${action}</span>
                    </div>
                `;
            }

            // Jetons personnalisés
            if (jetons.typesPersonnalises && jetons.typesPersonnalises.length > 0) {
                jetons.typesPersonnalises.forEach(type => {
                    html += `
                        <div style="padding: 10px; background: white; border-radius: 4px;">
                            <strong style="display: block; margin-bottom: 4px; color: var(--bleu-principal);">${type.nom}</strong>
                            <span style="color: var(--gris-fonce); font-size: 0.85rem;">${type.description}</span>
                        </div>
                    `;
                });
            }

            html += '</div>';

            // Si aucune configuration
            if (!jetons.nombreParEleve && !jetons.delai && !jetons.reprise && (!jetons.typesPersonnalises || jetons.typesPersonnalises.length === 0)) {
                html = '<p style="color: var(--gris-moyen); margin: 0;">⚠️ Aucun jeton configuré. Configurez les jetons dans Réglages → Pratique de notation.</p>';
            }
        }

        contenu.innerHTML = html;
        resume.style.display = 'block';
    } else {
        resume.style.display = 'none';
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
    configFixesDiv.style.display = 'none';
    infoDiv.style.display = 'none';

    if (type === 'fixes') {
        configFixesDiv.style.display = 'block';
    } else if (type === 'par_standard') {
        infoDiv.style.display = 'block';
        infoTexte.textContent = 'Chaque standard pourra avoir ses propres critères spécifiques.';
    } else if (type === 'par_evaluation') {
        infoDiv.style.display = 'block';
        infoTexte.textContent = 'Les critères varient selon le type d\'évaluation.';
    }
}

/**
 * Affiche la configuration selon le type de seuils
 */
function afficherConfigSeuils() {
    const type = document.getElementById('wizard-seuils-type').value;

    // Cacher toutes les configs
    document.getElementById('wizard-config-seuils-pct').style.display = 'none';
    document.getElementById('wizard-config-seuils-niveau').style.display = 'none';

    if (type === 'pourcentage') {
        document.getElementById('wizard-config-seuils-pct').style.display = 'block';
    } else if (type === 'niveau') {
        document.getElementById('wizard-config-seuils-niveau').style.display = 'block';
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
            structure_evaluations: construireStructure(),

            // Étape 4: Calcul
            calcul_note: construireCalcul(),

            // Étape 5: Reprises
            systeme_reprises: construireReprises(),

            // Étape 6: Critères
            gestion_criteres: construireCriteres(),

            // Étape 7: Seuils
            seuils: construireSeuils(),

            // Étape 8: Interface
            interface: construireInterface()
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
            await PratiqueManager.sauvegarderPratique({
                id: pratiqueConfig.id,
                nom: pratiqueConfig.nom,
                auteur: pratiqueConfig.auteur,
                description: pratiqueConfig.description,
                config: pratiqueConfig
            });
            console.log('✅ Pratique créée:', pratiqueConfig.id);
        }

        // Fermer le wizard
        fermerWizardPratique();

        // Recharger la liste
        await afficherListePratiques();

        const message = modeEdition
            ? `✅ Pratique modifiée avec succès !\n\n"${pratiqueConfig.nom}" a été mise à jour.`
            : `✅ Pratique créée avec succès !\n\n"${pratiqueConfig.nom}" a été ajoutée à vos pratiques configurables.`;

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
                { code: 'I', label: 'Insuffisant', description: '', valeur_numerique: 1, valeur_pourcentage: 50, couleur: '#FF6B6B', ordre: 1 },
                { code: 'D', label: 'En développement', description: '', valeur_numerique: 2, valeur_pourcentage: 70, couleur: '#FFD93D', ordre: 2 },
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

        alert(`✅ Pratique importée avec succès !\n\n"${pratiqueJSON.nom}" a été ajoutée à vos pratiques.`);
    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert(`❌ Erreur d'import : ${error.message}`);
    }

    // Réinitialiser l'input
    event.target.value = '';
}

/**
 * Afficher et initialiser les pratiques prédéfinies
 */
async function afficherPratiquesPredefines() {
    if (!confirm('Charger les pratiques prédéfinies ?\n\nCela ajoutera des exemples de pratiques (Bruno, Marie-Hélène, François) que vous pourrez modifier.')) {
        return;
    }

    try {
        await PratiqueManager.initialiserPratiquesPredefines();

        // Recharger
        await afficherListePratiques();

        alert(`✅ Pratiques prédéfinies chargées !\n\nVous pouvez maintenant les activer, les modifier ou les dupliquer.`);
    } catch (error) {
        console.error('Erreur lors du chargement des pratiques prédéfinies:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

// ============================================
// EXPORT DES FONCTIONS GLOBALES
// ============================================

window.initialiserModulePratiques = initialiserModulePratiques;
window.sauvegarderPratiqueNotation = sauvegarderPratiqueNotation;
window.obtenirConfigurationNotation = obtenirConfigurationNotation;

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
window.dupliquerPratique = dupliquerPratique;
window.supprimerPratique = supprimerPratique;
window.exporterPratiqueVersJSON = exporterPratiqueVersJSON;
window.creerNouvellePratique = creerNouvellePratique;
window.importerPratiqueJSON = importerPratiqueJSON;
window.traiterImportPratique = traiterImportPratique;
window.afficherPratiquesPredefines = afficherPratiquesPredefines;

// Wizard de création de pratique
window.fermerWizardPratique = fermerWizardPratique;
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
window.creerPratiqueDepuisWizard = creerPratiqueDepuisWizard;