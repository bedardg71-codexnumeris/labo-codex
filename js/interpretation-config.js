/* ===============================
   MODULE: CONFIGURATION DES SEUILS D'INTERPRÉTATION
   Version: 1.0 - 31 octobre 2025

   Module centralisé pour tous les paramètres d'analyse et d'interprétation
   des données pédagogiques. Permet d'ajuster la sensibilité des algorithmes
   de détection de progression, risque, et patterns d'apprentissage.

   UTILISATION:
   - Les seuils peuvent être ajustés via l'interface Réglages → Interprétation
   - Les valeurs sont sauvegardées dans localStorage
   - Les valeurs par défaut sont restaurées si aucune configuration n'existe
   =============================== */

(function() {
'use strict';

/* ===============================
   VALEURS PAR DÉFAUT
   =============================== */

const SEUILS_PAR_DEFAUT = {
    // Progression des artefacts (AM vs AL)
    // Seuil minimal pour détecter une progression ou régression significative
    progressionArtefacts: 0.10,  // 10 points sur échelle 0-1

    // Direction du risque (évolution temporelle)
    // Seuil minimal pour détecter une augmentation ou diminution du risque
    directionRisque: 0.05,  // 5 points sur échelle 0-1

    // Fenêtre d'analyse des patterns
    // Nombre de productions récentes à analyser pour détecter les patterns
    nombreProductionsAnalyse: 3,  // 3 dernières productions (recommandé pour détection précoce)

    // Taxonomie SOLO - Niveaux IDME
    // Seuils de passage entre les niveaux de compréhension
    idme: {
        insuffisant: 0.64,      // < 64% = Incomplet (unistructurel)
        developpement: 0.75,    // 64-74% = en Développement (multistructurel)
        maitrise: 0.85          // 75-84% = Maîtrisé (relationnel), ≥85% = Étendu (abstrait)
    },

    // Identification des défis SRPNF
    // Score en dessous duquel un critère est considéré comme un défi
    defiSpecifique: 0.70,  // 70% - Seuil d'autonomie empirique (validation 101→102)

    // Niveaux de risque (échelle visuelle)
    // Seuils de transition entre les zones de risque
    risque: {
        minimal: 0.20,      // 0-19% = Minimal
        faible: 0.35,       // 20-34% = Faible
        modere: 0.50,       // 35-49% = Modéré
        eleve: 0.60,        // 50-59% = Élevé (intervention intensive niveau 3)
        critique: 0.70      // ≥70% = Critique (urgence maximale)
    },

    // Seuils d'interprétation A-C-M (Assiduité, Complétion, Mobilisation)
    // Utilisés pour classifier les niveaux de performance
    interpretation: {
        excellent: 0.85,    // ≥85% = Excellent
        bon: 0.80,          // 80-84% = Bon
        acceptable: 0.70    // 70-79% = Acceptable, <70% = Fragile/Critique
    }
};

/* ===============================
   DESCRIPTIONS DES SEUILS
   (pour l'interface utilisateur)
   =============================== */

const DESCRIPTIONS_SEUILS = {
    progressionArtefacts: {
        titre: 'Progression des artefacts',
        description: 'Différence minimale (en points de pourcentage) entre la moyenne des 3 artefacts récents et la moyenne des 3 suivants pour considérer qu\'il y a progression (↗) ou régression (↘). En dessous de ce seuil, la progression est considérée comme stable (→).',
        unite: 'points (%)',
        min: 0.05,
        max: 0.20,
        pas: 0.01
    },
    directionRisque: {
        titre: 'Direction du risque',
        description: 'Variation minimale du risque (en points de pourcentage) pour afficher une flèche indiquant que le risque augmente (→) ou diminue (←). En dessous de ce seuil, un tiret (—) indique un plateau.',
        unite: 'points (%)',
        min: 0.03,
        max: 0.15,
        pas: 0.01
    },
    defiSpecifique: {
        titre: 'Défi spécifique (SRPNF)',
        description: 'Score en dessous duquel un critère SRPNF est considéré comme un défi spécifique nécessitant une attention particulière.',
        unite: '%',
        min: 0.60,
        max: 0.80,
        pas: 0.01
    }
};

/* ===============================
   FONCTIONS D'ACCÈS AUX SEUILS
   =============================== */

/**
 * Charge les seuils depuis db.getSync ou retourne les valeurs par défaut
 * @returns {Object} - Objet contenant tous les seuils configurés
 */
function chargerSeuilsInterpretation() {
    return db.getSync('seuilsInterpretation', SEUILS_PAR_DEFAUT);
}

/**
 * Sauvegarde les seuils dans db.setSync
 * @param {Object} seuils - Objet contenant les seuils à sauvegarder
 */
function sauvegarderSeuilsInterpretation(seuils) {
    try {
        db.setSync('seuilsInterpretation', seuils);
        console.log('✅ Seuils d\'interprétation sauvegardés');
        return true;
    } catch (e) {
        console.error('❌ Erreur lors de la sauvegarde des seuils:', e);
        return false;
    }
}

/**
 * Réinitialise les seuils aux valeurs par défaut
 */
function reinitialiserSeuilsInterpretation() {
    sauvegarderSeuilsInterpretation(SEUILS_PAR_DEFAUT);
    console.log('🔄 Seuils réinitialisés aux valeurs par défaut');
}

/**
 * Obtient un seuil spécifique
 * @param {string} chemin - Chemin vers le seuil (ex: 'progressionArtefacts', 'idme.maitrise')
 * @returns {number} - Valeur du seuil
 */
function obtenirSeuil(chemin) {
    const seuils = chargerSeuilsInterpretation();
    const parties = chemin.split('.');
    let valeur = seuils;

    for (const partie of parties) {
        if (valeur && typeof valeur === 'object' && partie in valeur) {
            valeur = valeur[partie];
        } else {
            console.warn(`⚠️ Seuil introuvable: ${chemin}, utilisation de la valeur par défaut`);
            // Récupérer depuis les valeurs par défaut
            let defaut = SEUILS_PAR_DEFAUT;
            for (const p of parties) {
                defaut = defaut[p];
            }
            return defaut;
        }
    }

    return valeur;
}

/* ===============================
   INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module d'interprétation
 * Charge les seuils et les rend disponibles globalement
 */
function initialiserModuleInterpretation() {
    console.log('📊 Initialisation du module Interprétation...');

    // Charger les seuils
    const seuils = chargerSeuilsInterpretation();

    // Rendre les fonctions disponibles globalement
    window.chargerSeuilsInterpretation = chargerSeuilsInterpretation;
    window.sauvegarderSeuilsInterpretation = sauvegarderSeuilsInterpretation;
    window.reinitialiserSeuilsInterpretation = reinitialiserSeuilsInterpretation;
    window.obtenirSeuil = obtenirSeuil;
    window.SEUILS_PAR_DEFAUT = SEUILS_PAR_DEFAUT;
    window.DESCRIPTIONS_SEUILS = DESCRIPTIONS_SEUILS;

    console.log('✅ Module Interprétation initialisé');
    console.log('   Seuils chargés:', seuils);
}

// Auto-initialisation lors du chargement du module
if (typeof window !== 'undefined') {
    initialiserModuleInterpretation();
}

/* ===============================
   FONCTIONS D'INTERFACE UTILISATEUR
   =============================== */

/**
 * Charge les seuils actuels dans l'interface utilisateur
 */
function chargerSeuilsInterpretationUI() {
    const seuils = chargerSeuilsInterpretation();

    // Nombre de productions à analyser
    const inputNombreProductions = document.getElementById('nombreProductionsAnalyse');
    if (inputNombreProductions) {
        inputNombreProductions.value = seuils.nombreProductionsAnalyse || 3;
    }

    // Progression des artefacts
    const sliderProgression = document.getElementById('seuil-progression');
    if (sliderProgression) {
        sliderProgression.value = seuils.progressionArtefacts;
        mettreAJourAffichageSeuil('progression', seuils.progressionArtefacts);
    }

    // Direction du risque
    const sliderRisque = document.getElementById('seuil-risque');
    if (sliderRisque) {
        sliderRisque.value = seuils.directionRisque;
        mettreAJourAffichageSeuil('risque', seuils.directionRisque);
    }

    // Défi spécifique
    const sliderDefi = document.getElementById('seuil-defi');
    if (sliderDefi) {
        sliderDefi.value = seuils.defiSpecifique;
        mettreAJourAffichageSeuil('defi', seuils.defiSpecifique);
    }

    console.log('✅ Seuils chargés dans l\'interface:', seuils);
}

/**
 * Met à jour l'affichage de la valeur d'un seuil (appelé lors du déplacement du slider)
 * @param {string} type - Type de seuil ('progression', 'risque', 'defi')
 * @param {number} valeur - Valeur du seuil (0-1)
 */
function mettreAJourAffichageSeuil(type, valeur) {
    var v = (typeof valeur === 'object' && valeur && valeur.value !== undefined) ? valeur.value : valeur;
    const valeurNum = parseFloat(v);

    if (type === 'progression') {
        document.getElementById('valeur-progression').textContent = `${(valeurNum * 100).toFixed(0)} points (%)`;
        document.getElementById('exemple-progression').textContent = (valeurNum * 100).toFixed(0);
    } else if (type === 'risque') {
        document.getElementById('valeur-risque').textContent = `${(valeurNum * 100).toFixed(0)} points (%)`;
        document.getElementById('exemple-risque').textContent = (valeurNum * 100).toFixed(0);
    } else if (type === 'defi') {
        document.getElementById('valeur-defi').textContent = `${(valeurNum * 100).toFixed(2)}%`;
        document.getElementById('exemple-defi').textContent = (valeurNum * 100).toFixed(2);
    }
}

/**
 * Sauvegarde un seuil individuel
 * @param {string} cle - Clé du seuil (ex: 'progressionArtefacts', 'directionRisque')
 * @param {number} valeur - Valeur du seuil (0-1)
 */
function sauvegarderSeuil(cle, valeur) {
    const seuils = chargerSeuilsInterpretation();
    seuils[cle] = valeur;

    if (sauvegarderSeuilsInterpretation(seuils)) {
        console.log(`✅ Seuil ${cle} sauvegardé:`, valeur);

        // Afficher un message de confirmation discret
        afficherMessageConfirmation(`Seuil sauvegardé : ${cle}`);
    }
}

/**
 * Restaure les valeurs par défaut
 */
function restaurerValeursParDefaut() {
    const confirmation = confirm(
        '⚠️ Restaurer les valeurs par défaut ?\n\n' +
        'Cela réinitialisera tous les seuils d\'interprétation aux valeurs recommandées.\n\n' +
        'Valeurs par défaut :\n' +
        '• Progression : 10 points\n' +
        '• Direction risque : 5 points\n' +
        '• Défi SRPNF : 70%'
    );

    if (confirmation) {
        reinitialiserSeuilsInterpretation();
        chargerSeuilsInterpretationUI();

        alert('✅ Valeurs par défaut restaurées avec succès !');
    }
}

/**
 * Affiche un message de confirmation temporaire
 * @param {string} message - Message à afficher
 */
function afficherMessageConfirmation(message) {
    // Créer un toast de notification
    const toast = document.createElement('div');
    toast.textContent = '✅ ' + message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-size: 0.95rem;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    // Retirer après 2 secondes
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Exposer les fonctions d'interface globalement
if (typeof window !== 'undefined') {
    window.chargerSeuilsInterpretationUI = chargerSeuilsInterpretationUI;
    window.mettreAJourAffichageSeuil = mettreAJourAffichageSeuil;
    window.sauvegarderSeuil = sauvegarderSeuil;
    window.restaurerValeursParDefaut = restaurerValeursParDefaut;
}


})();
