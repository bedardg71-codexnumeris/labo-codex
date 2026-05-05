/* ===============================
   MODULE: PLANIFICATION — ORCHESTRATEUR
   Point d'entrée du module Planification.
   Gère le cycle de vie, l'activation/désactivation
   des raccourcis clavier et l'initialisation.
   Gère aussi la bascule entre Carte et Organisateur.

   Export: window.initialiserModulePlanification
   =============================== */

(function() {
'use strict';

var dejaInitialise = false;

/**
 * Initialise le module Planification.
 * Appelé par navigation.js lors de l'affichage de la sous-section conception-carte.
 */
function initialiserModulePlanification() {

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
    } else {
        // Retour vers la section : recharger les données du trimestre actif et recentrer
        if (window.planificationCarte && window.planificationDonnees) {
            var index = window.planificationDonnees.initialiserSiNecessaire();
            window.planificationCarte.mettreAJourListeCartes();
            window.planificationCarte.chargerCarte(index.active);
            requestAnimationFrame(function() {
                window.planificationCarte.centrerVueSurContenu();
            });
        }
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
        if (nomSection !== 'conception') {
            desactiverPlanification();
        }
        return _originalAfficherSection.call(this, nomSection);
    };
}

// Observer les changements de sous-section : désactiver la carte quand on passe à l'Organisateur
var _originalAfficherSousSection = window.afficherSousSection;
if (typeof _originalAfficherSousSection === 'function') {
    window.afficherSousSection = function(idSousSection) {
        // Désactiver les raccourcis carte quand on passe à l'Organisateur
        if (idSousSection === 'conception-organisateur') {
            desactiverPlanification();
        }
        // Réactiver les raccourcis carte quand on revient à la carte
        if (idSousSection === 'conception-carte' && dejaInitialise) {
            if (window.planificationCarte) {
                window.planificationCarte.activer();
            }
        }
        return _originalAfficherSousSection.call(this, idSousSection);
    };
}

// Export global
window.initialiserModulePlanification = initialiserModulePlanification;

})();
