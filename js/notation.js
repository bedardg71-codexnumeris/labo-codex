/**
 * ============================================
 * MODULE NOTATION.JS
 * Gestion de la configuration des pratiques de notation
 * ============================================
 */

/* ===============================
   INITIALISATION
   =============================== */

/**
 * Initialise le module de notation au chargement de la page
 */
function initialiserModuleNotation() {
    console.log('📋 Initialisation du module Notation...');

    // Attacher les événements aux éléments
    attacherEvenementsNotation();

    // Charger la configuration existante
    chargerConfigurationNotation();

    console.log('✅ Module Notation initialisé');
}

/**
 * Attache les événements aux éléments HTML
 */
function attacherEvenementsNotation() {
    // Sélecteur pratique de notation
    const selectPratique = document.getElementById('pratiqueNotation');
    if (selectPratique) {
        selectPratique.addEventListener('change', changerPratiqueNotation);
    }

    // Sélecteur type PAN
    const selectTypePAN = document.getElementById('typePAN');
    if (selectTypePAN) {
        selectTypePAN.addEventListener('change', changerTypePAN);
    }

    // Checkboxes d'affichage
    const checkSommatif = document.getElementById('afficherSommatif');
    if (checkSommatif) {
        checkSommatif.addEventListener('change', sauvegarderOptionsAffichage);
    }

    const checkAlternatif = document.getElementById('afficherAlternatif');
    if (checkAlternatif) {
        checkAlternatif.addEventListener('change', sauvegarderOptionsAffichage);
    }

    // Bouton sauvegarder
    const btnSauvegarder = document.getElementById('btnSauvegarderPratiqueNotation');
    if (btnSauvegarder) {
        btnSauvegarder.addEventListener('click', sauvegarderConfigurationNotation);
    }
}

/* ===============================
   GESTION DES CHANGEMENTS
   =============================== */

/**
 * Gère le changement de pratique de notation
 */
function changerPratiqueNotation() {
    const pratique = document.getElementById('pratiqueNotation').value;
    const colonnePAN = document.getElementById('colonnePAN');
    const selectPAN = document.getElementById('typePAN');
    const infoPAN = document.getElementById('infoPAN');
    const optionsAffichage = document.getElementById('optionsAffichageIndices');

    if (pratique === 'alternative') {
        // Mode PAN : afficher toutes les options
        colonnePAN.style.display = 'block';
        optionsAffichage.style.display = 'block';

        // Par défaut : cocher les deux pour recherche
        document.getElementById('afficherSommatif').checked = true;
        document.getElementById('afficherAlternatif').checked = true;

    } else if (pratique === 'sommative') {
        // Mode sommatif : masquer PAN, afficher options
        colonnePAN.style.display = 'none';
        selectPAN.value = '';
        infoPAN.style.display = 'none';
        optionsAffichage.style.display = 'block';

        // Seul le sommatif coché
        document.getElementById('afficherSommatif').checked = true;
        document.getElementById('afficherAlternatif').checked = false;

    } else {
        // Aucune pratique : tout masquer
        colonnePAN.style.display = 'none';
        selectPAN.value = '';
        infoPAN.style.display = 'none';
        optionsAffichage.style.display = 'none';
    }

    // Sauvegarder automatiquement
    sauvegarderOptionsAffichage();
    mettreAJourStatutConfiguration();
}

/**
 * Gère le changement de type PAN
 */
function changerTypePAN() {
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
    } else {
        infoPAN.style.display = 'none';
    }

    mettreAJourStatutConfiguration();
}

/* ===============================
   SAUVEGARDE ET CHARGEMENT
   =============================== */

/**
 * Sauvegarde les options d'affichage des indices
 */
function sauvegarderOptionsAffichage() {
    const afficherSommatif = document.getElementById('afficherSommatif')?.checked || false;
    const afficherAlternatif = document.getElementById('afficherAlternatif')?.checked || false;

    // Validation : au moins un doit être coché
    if (!afficherSommatif && !afficherAlternatif) {
        alert('Au moins un type d\'affichage doit être activé !');
        document.getElementById('afficherSommatif').checked = true;
        return;
    }

    // Récupérer la configuration existante
    let config = obtenirConfigurationNotation();

    // Mettre à jour les options d'affichage
    config.affichageTableauBord = {
        afficherSommatif: afficherSommatif,
        afficherAlternatif: afficherAlternatif
    };

    // Sauvegarder
    localStorage.setItem('modalitesEvaluation', JSON.stringify(config));

    console.log('Options d\'affichage sauvegardées:', config.affichageTableauBord);
}

/**
 * Sauvegarde la configuration complète de notation
 */
function sauvegarderConfigurationNotation() {
    const pratique = document.getElementById('pratiqueNotation').value;
    const typePAN = document.getElementById('typePAN').value;

    // Validation
    if (!pratique) {
        alert('Veuillez choisir une pratique de notation');
        return;
    }

    if (pratique === 'alternative' && !typePAN) {
        alert('Veuillez choisir un type de pratique alternative');
        return;
    }

    // Construire la configuration
    const config = {
        pratique: pratique,
        typePAN: pratique === 'alternative' ? typePAN : null,
        affichageTableauBord: {
            afficherSommatif: document.getElementById('afficherSommatif').checked,
            afficherAlternatif: document.getElementById('afficherAlternatif').checked
        },
        dateConfiguration: new Date().toISOString()
    };

    // Sauvegarder
    localStorage.setItem('modalitesEvaluation', JSON.stringify(config));

    // Notification
    afficherNotification('Configuration de la pratique de notation sauvegardée !', 'succes');

    // Mettre à jour le statut
    mettreAJourStatutConfiguration();

    console.log('Configuration notation sauvegardée:', config);
}

/**
 * Charge la configuration existante depuis localStorage
 */
function chargerConfigurationNotation() {
    const config = obtenirConfigurationNotation();

    const selectPratique = document.getElementById('pratiqueNotation');
    const selectPAN = document.getElementById('typePAN');
    const colonnePAN = document.getElementById('colonnePAN');
    const optionsAffichage = document.getElementById('optionsAffichageIndices');

    // Si pas de configuration, tout réinitialiser
    if (!config.pratique) {
        selectPratique.value = '';
        colonnePAN.style.display = 'none';
        selectPAN.value = '';
        optionsAffichage.style.display = 'none';
        mettreAJourStatutConfiguration();
        return;
    }

    // Charger la pratique
    selectPratique.value = config.pratique;

    // Gérer l'affichage selon la pratique
    if (config.pratique === 'alternative') {
        colonnePAN.style.display = 'block';
        optionsAffichage.style.display = 'block';

        if (config.typePAN) {
            selectPAN.value = config.typePAN;
            changerTypePAN(); // Afficher la description
        }
    } else if (config.pratique === 'sommative') {
        colonnePAN.style.display = 'none';
        optionsAffichage.style.display = 'block';
    }

    // Charger les options d'affichage
    if (config.affichageTableauBord) {
        document.getElementById('afficherSommatif').checked =
            config.affichageTableauBord.afficherSommatif !== false;
        document.getElementById('afficherAlternatif').checked =
            config.affichageTableauBord.afficherAlternatif || false;
    }

    mettreAJourStatutConfiguration();
}

/* ===============================
   UTILITAIRES
   =============================== */

/**
 * Récupère la configuration de notation depuis localStorage
 * @returns {Object} Configuration de notation
 */
function obtenirConfigurationNotation() {
    return JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
}

/**
 * Met à jour le statut de configuration affiché
 */
function mettreAJourStatutConfiguration() {
    const config = obtenirConfigurationNotation();
    const statutElement = document.getElementById('statutModalites');

    if (!config.pratique) {
        statutElement.innerHTML = '<span style="color: var(--risque-critique);">✗ À configurer</span>';
        return;
    }

    if (config.pratique === 'alternative' && !config.typePAN) {
        statutElement.innerHTML = '<span style="color: var(--orange-accent);">⚠ Incomplet</span>';
        return;
    }

    statutElement.innerHTML = '<span style="color: var(--vert-moyen);">✓ Configuré</span>';
}

/**
 * Affiche une notification temporaire
 */
function afficherNotification(message, type = 'info') {
    // Chercher si une fonction globale existe
    if (typeof afficherNotificationGlobale === 'function') {
        afficherNotificationGlobale(message, type);
        return;
    }

    // Sinon, notification simple
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'succes' ? 'var(--vert-moyen)' : 'var(--bleu-principal)'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/* ===============================
   EXPORT POUR AUTRES MODULES
   =============================== */

// Exposer les fonctions nécessaires aux autres modules
window.ModuleNotation = {
    obtenir: obtenirConfigurationNotation,
    initialiser: initialiserModuleNotation
};