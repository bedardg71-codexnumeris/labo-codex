/* ===============================
   MODULE: PLANIFICATION — ORCHESTRATEUR
   Point d'entrée du module Planification.
   Gère le cycle de vie, l'activation/désactivation
   des raccourcis clavier et l'initialisation.

   Export: window.initialiserModulePlanification
   =============================== */

(function() {
'use strict';

var dejaInitialise = false;

/**
 * Initialise le module Planification.
 * Appelé par navigation.js lors de l'affichage de la sous-section planification-carte.
 */
function initialiserModulePlanification() {
    console.log('🗺️ Initialisation du module Planification...');

    // Activer les raccourcis clavier pour ce module
    if (window.planificationCarte) {
        window.planificationCarte.activer();
    }

    // Premier appel : initialiser tout le moteur
    if (!dejaInitialise) {
        if (window.planificationCarte) {
            window.planificationCarte.initialiser();
        }
        dejaInitialise = true;
        console.log('   ✅ Module Planification initialisé');
    } else {
        // Retour vers la section : recentrer la vue
        if (window.planificationCarte) {
            requestAnimationFrame(function() {
                window.planificationCarte.centrerVueSurContenu();
            });
        }
        console.log('   ✅ Module Planification réactivé');
    }
}

/**
 * Désactive les raccourcis clavier du module quand on quitte la section.
 * Appelé automatiquement par afficherSection() via un observer.
 */
function desactiverPlanification() {
    if (window.planificationCarte) {
        window.planificationCarte.desactiver();
    }
}

// Observer les changements de section pour désactiver les raccourcis
// quand on quitte la section Planification
var _originalAfficherSection = window.afficherSection;
if (typeof _originalAfficherSection === 'function') {
    window.afficherSection = function(nomSection) {
        // Désactiver la planification si on quitte cette section
        if (nomSection !== 'planification') {
            desactiverPlanification();
        }
        return _originalAfficherSection.call(this, nomSection);
    };
}

// Export global
window.initialiserModulePlanification = initialiserModulePlanification;

})();
