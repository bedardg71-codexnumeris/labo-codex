/* ===============================
   MODULE 12: PRATIQUES DE NOTATION
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère la configuration du système de notation
   du cours (traditionnelle ou alternative).
   
   Contenu de ce module:
   - Configuration pratique de notation (sommative/alternative)
   - Gestion des types de PAN (maîtrise/spécifications/dénotation)
   - Affichage des informations contextuelles
   - Sauvegarde et chargement des modalités
   - Mise à jour du statut de configuration
   =============================== */

/* ===============================
   📋 DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   
   Éléments HTML requis:
   - #pratiqueNotation : Select pour choisir la pratique
   - #colonnePAN : Conteneur pour le type de PAN
   - #typePAN : Select pour choisir le type de PAN
   - #infoPAN : Zone d'information sur le PAN choisi
   - #statutModalites : Zone d'affichage du statut
   
   LocalStorage utilisé:
   - 'modalitesEvaluation' : Object contenant la configuration
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
 * 2. Charge les modalités sauvegardées
 * 3. Met à jour le statut d'affichage
 * 
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModulePratiques() {
    console.log('⚖️  Initialisation du module Pratiques de notation');
    
    // Vérifier que nous sommes dans la bonne section
    const selectPratique = document.getElementById('pratiqueNotation');
    if (!selectPratique) {
        console.log('   ⚠️  Section pratiques non active, initialisation reportée');
        return;
    }
    
    // Charger les modalités sauvegardées
    chargerModalites();
    
    console.log('   ✅ Module Pratiques initialisé');
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
 * 4. Sauvegarde dans localStorage
 * 5. Met à jour le statut
 * 
 * UTILISÉ PAR:
 * - onchange="#pratiqueNotation" dans le HTML
 */
function changerPratiqueNotation() {
    const pratique = document.getElementById('pratiqueNotation').value;
    const colonnePAN = document.getElementById('colonnePAN');
    const selectPAN = document.getElementById('typePAN');
    const infoPAN = document.getElementById('infoPAN');

    if (pratique === 'alternative') {
        // Afficher le menu PAN
        colonnePAN.style.display = 'block';
    } else {
        // Masquer le menu PAN
        colonnePAN.style.display = 'none';
        selectPAN.value = '';
        infoPAN.style.display = 'none';
    }

    // Sauvegarder dans modalitesEvaluation
    let modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    modalites.pratique = pratique;
    modalites.typePAN = pratique === 'alternative' ? modalites.typePAN : null;
    localStorage.setItem('modalitesEvaluation', JSON.stringify(modalites));

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
 * 
 * UTILISÉ PAR:
 * - onchange="#typePAN" dans le HTML
 * 
 * DESCRIPTIONS:
 * - maitrise: Notation basée sur la maîtrise (SBG)
 * - specifications: Notation par spécifications
 * - denotation: Dénotation (Ungrading)
 */
function afficherInfoPAN() {
    const typePAN = document.getElementById('typePAN').value;
    const infoPAN = document.getElementById('infoPAN');

    const descriptions = {
        'maitrise': 'L\'étudiant·e est évalué·e selon son niveau de maîtrise des compétences (Ex: En développement, Acquis, Avancé...). En anglais on l\'appelle <em>Standard Based Grading</em>.',
        'specifications': 'L\'étudiant·e doit satisfaire à des critères précis et binaires (réussi/non réussi) pour chaque compétence. En anglais on l\'appelle <em>Specifications Grading</em>.',
        'denotation': 'Approche sans notes chiffrées pendant le trimestre. L\'accent est mis sur la rétroaction descriptive et l\'autoévaluation. En anglais on l\'appelle <em>Ungrading</em>.'
    };

    if (typePAN && descriptions[typePAN]) {
        infoPAN.innerHTML = descriptions[typePAN];
        infoPAN.style.display = 'block';

        // Sauvegarder le type de PAN
        let modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
        modalites.typePAN = typePAN;
        localStorage.setItem('modalitesEvaluation', JSON.stringify(modalites));

        mettreAJourStatutModalites();
    } else {
        infoPAN.style.display = 'none';
    }
}

/* ===============================
   💾 SAUVEGARDE ET CHARGEMENT
   =============================== */

/**
 * Sauvegarde la configuration de la pratique de notation
 * Appelée par le bouton «Sauvegarder la configuration»
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les valeurs des champs
 * 2. Valide les champs obligatoires
 * 3. Sauvegarde dans localStorage avec timestamp
 * 4. Affiche notification de succès
 * 
 * UTILISÉ PAR:
 * - onclick="sauvegarderPratiqueNotation()" dans le HTML
 * 
 * VALIDATION:
 * - Pratique obligatoire
 * - Type PAN obligatoire si pratique alternative
 * 
 * CLÉ LOCALSTORAGE:
 * - 'modalitesEvaluation' : Object des modalités
 */
function sauvegarderPratiqueNotation() {
    const pratique = document.getElementById('pratiqueNotation').value;
    const typePAN = document.getElementById('typePAN').value;

    if (!pratique) {
        alert('Veuillez choisir une pratique de notation');
        return;
    }

    if (pratique === 'alternative' && !typePAN) {
        alert('Veuillez choisir un type de pratique alternative');
        return;
    }

    // Sauvegarder avec timestamp
    let modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    modalites.pratique = pratique;
    modalites.typePAN = pratique === 'alternative' ? typePAN : null;
    modalites.dateConfiguration = new Date().toISOString();
    localStorage.setItem('modalitesEvaluation', JSON.stringify(modalites));

    afficherNotificationSucces('Configuration de la pratique de notation sauvegardée !');
    mettreAJourStatutModalites();
}

/**
 * Charge les modalités sauvegardées depuis localStorage
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les modalités depuis localStorage
 * 2. Si vide: réinitialise tous les champs
 * 3. Sinon: remplit les champs avec les valeurs
 * 4. Affiche/masque la colonne PAN selon la pratique
 * 5. Met à jour le statut
 * 
 * UTILISÉ PAR:
 * - initialiserModulePratiques()
 * 
 * CLÉ LOCALSTORAGE:
 * - 'modalitesEvaluation' : Object des modalités
 */
function chargerModalites() {
    const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');

    const selectPratique = document.getElementById('pratiqueNotation');
    const colonnePAN = document.getElementById('colonnePAN');
    const selectPAN = document.getElementById('typePAN');

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
        mettreAJourStatutModalites();
        return;
    }

    // Charger la pratique de notation
    selectPratique.value = modalites.pratique;

    // Gérer l'affichage du menu PAN
    if (modalites.pratique === 'alternative') {
        colonnePAN.style.display = 'block';

        // Charger le type de PAN si disponible
        if (modalites.typePAN) {
            selectPAN.value = modalites.typePAN;
            afficherInfoPAN();
        } else {
            // Alternative choisie mais pas de type : forcer "Choisir..."
            selectPAN.value = '';
        }
    } else {
        colonnePAN.style.display = 'none';
        selectPAN.value = '';
    }

    // Mettre à jour le statut
    mettreAJourStatutModalites();
}

/* ===============================
   📊 MISE À JOUR DU STATUT
   =============================== */

/**
 * Met à jour l'affichage du statut de configuration
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les modalités depuis localStorage
 * 2. Détermine le statut selon les valeurs
 * 3. Met à jour #statutModalites avec HTML formaté
 * 
 * UTILISÉ PAR:
 * - changerPratiqueNotation()
 * - afficherInfoPAN()
 * - sauvegarderPratiqueNotation()
 * - chargerModalites()
 * 
 * STATUTS POSSIBLES:
 * - ✗ À configurer (rouge) : Aucune pratique choisie
 * - ✓ Sommative traditionnelle (vert) : Pratique sommative
 * - ✓ Alternative (Type) (vert) : PAN avec type défini
 * - ⚠ Choisir un type de PAN (orange) : PAN sans type
 */
function mettreAJourStatutModalites() {
    const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const statutDiv = document.getElementById('statutModalites');

    if (!statutDiv) {
        console.error('Element #statutModalites non trouvé');
        return;
    }

    // Vérifier le statut selon la pratique choisie
    if (!modalites.pratique) {
        statutDiv.innerHTML = '<span style="color: var(--risque-critique);">✗ À configurer</span>';
    } else if (modalites.pratique === 'sommative') {
        statutDiv.innerHTML = '<span style="color: var(--risque-minimal);">✓ Sommative traditionnelle (en %)</span>';
    } else if (modalites.pratique === 'alternative' && modalites.typePAN) {
        const types = {
            'maitrise': 'Maîtrise',
            'specifications': 'Spécifications',
            'denotation': 'Dénotation'
        };
        statutDiv.innerHTML = `<span style="color: var(--risque-minimal);">✓ Alternative (${types[modalites.typePAN]})</span>`;
    } else if (modalites.pratique === 'alternative' && !modalites.typePAN) {
        statutDiv.innerHTML = '<span style="color: var(--risque-modere);">⚠ Choisir un type de PAN</span>';
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
 * 
 * PARAMÈTRES:
 * @param {string} message - Message à afficher
 * 
 * UTILISÉ PAR:
 * - sauvegarderPratiqueNotation()
 * 
 * STYLE:
 * - Position fixe en haut à droite
 * - Fond vert (succès)
 * - Animation slideIn
 * - Disparaît après 3s
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
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * ORDRE D'INITIALISATION:
 * 1. Charger le module 01-config.js (variables globales)
 * 2. Charger ce module 12-pratiques.js
 * 3. Appeler initialiserModulePratiques() depuis 99-main.js
 * 
 * DÉPENDANCES:
 * - echapperHtml() depuis 01-config.js (non utilisée ici mais disponible)
 * - Classes CSS depuis styles.css
 * 
 * LOCALSTORAGE:
 * - 'modalitesEvaluation' : Object des modalités configurées
 * 
 * MODULES DÉPENDANTS:
 * - Statistiques : Affichera la pratique configurée
 * - Autres modules pouvant référencer la pratique de notation
 * 
 * STRUCTURE DONNÉES:
 * Modalites = {
 *   pratique: string ('sommative' | 'alternative'),
 *   typePAN: string | null ('maitrise' | 'specifications' | 'denotation'),
 *   dateConfiguration: string ISO
 * }
 * 
 * ÉVÉNEMENTS:
 * Tous les événements sont gérés via attributs HTML (onchange, onclick)
 * Pas d'addEventListener requis dans 99-main.js
 * 
 * COMPATIBILITÉ:
 * - Nécessite ES6+ pour les arrow functions et template literals
 * - Fonctionne avec tous les navigateurs modernes
 * - Pas de dépendances externes
 */