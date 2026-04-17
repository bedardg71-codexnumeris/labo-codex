/**
 * PRIMO TOOLTIPS - Système de tooltips riches (Tour guide / Aide contextuelle)
 *
 * Gère l'affichage des aides contextuelles du Tour guide (📍)
 * Visible uniquement si le Tour guide ou l'aide contextuelle est actif
 *
 * VERSION : 1.0
 * DATE : 29 novembre 2025
 */

(function() {
'use strict';

// ============================================================================
// GESTION DES POPUPS
// ============================================================================

/**
 * Affiche un popup Primo avec contenu riche
 * @param {string} contentHTML - Contenu HTML du popup
 */
function afficherPopupPrimo(contentHTML) {
    // Créer l'overlay s'il n'existe pas
    let overlay = document.getElementById('primo-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'primo-overlay';
        overlay.className = 'primo-overlay';
        overlay.setAttribute('data-close-on-bg', 'fermerPopupPrimo');
        document.body.appendChild(overlay);
    }

    // Créer le popup s'il n'existe pas
    let popup = document.getElementById('primo-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'primo-popup';
        popup.className = 'primo-popup';
        document.body.appendChild(popup);
    }

    // Contenu du popup
    popup.innerHTML = `
        <div class="primo-popup-header">
            <span><span class="primo-icon">📍</span> Conseil</span>
            <button class="primo-popup-close" data-action="fermerPopupPrimo"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
        </div>
        <div class="primo-popup-body">
            ${contentHTML}
        </div>
    `;

    // Afficher
    overlay.classList.add('active');
    popup.classList.add('active');

    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
}

/**
 * Ferme le popup Primo
 */
function fermerPopupPrimo() {
    const overlay = document.getElementById('primo-overlay');
    const popup = document.getElementById('primo-popup');

    if (overlay) overlay.classList.remove('active');
    if (popup) popup.classList.remove('active');

    // Réactiver le scroll
    document.body.style.overflow = '';
}

/**
 * Gère le clic sur une icône Primo
 * @param {Event} event - Événement de clic
 */
function gererClicPrimo(event) {
    event.preventDefault();
    event.stopPropagation();

    const icone = event.currentTarget;
    const targetId = icone.dataset.target;


    if (!targetId) {
        console.warn('[Guide] Pas de data-target sur l\'icône', icone);
        return;
    }

    // Récupérer le contenu associé
    const contenuElement = document.getElementById(targetId);
    if (!contenuElement) {
        console.warn('[Guide] Élément target non trouvé:', targetId);
        console.warn('[Guide] IDs disponibles:', Array.from(document.querySelectorAll('[id^="conseil-"], [id^="details-calculs"]')).map(el => el.id));
        return;
    }


    // Afficher le popup avec le contenu
    afficherPopupPrimo(contenuElement.innerHTML);
}

// ============================================================================
// INITIALISATION
// ============================================================================

/**
 * Vérifie si le tour guide ou l'aide contextuelle est actif et masque/affiche les icônes
 */
function gererVisibilitePrimoSelonMode() {
    // Vérifier si la fonction estTourGuideActif existe
    if (typeof estTourGuideActif !== 'function') {
        console.warn('[Guide Tooltips] Fonction estTourGuideActif non disponible');
        return;
    }

    const tourGuide = estTourGuideActif();
    const aideActive = typeof estAideContextuelleActive === 'function' && estAideContextuelleActive();
    const afficherPrimo = tourGuide || aideActive;
    const icones = document.querySelectorAll('.primo-aide');

    icones.forEach(icone => {
        toggleDisplay(icone, afficherPrimo);
    });

}

/**
 * Initialise le système de tooltips Primo
 */
function initialiserPrimoTooltips() {

    // Attacher les événements à toutes les icônes Primo
    const icones = document.querySelectorAll('.primo-aide');
    icones.forEach(icone => {
        icone.addEventListener('click', gererClicPrimo);
    });


    // Fermer le popup avec Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fermerPopupPrimo();
        }
    });

    // Gérer la visibilité selon le mode
    gererVisibilitePrimoSelonMode();

    // Écouter les changements de mode (événement 'modeChanged' émis par modes.js)
    window.addEventListener('modeChanged', gererVisibilitePrimoSelonMode);
}

// ============================================================================
// AUTO-INITIALISATION
// ============================================================================

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserPrimoTooltips);
} else {
    initialiserPrimoTooltips();
}

// Exports globaux
window.afficherPopupPrimo = afficherPopupPrimo;
window.fermerPopupPrimo = fermerPopupPrimo;
window.initialiserPrimoTooltips = initialiserPrimoTooltips;
window.gererVisibilitePrimoSelonMode = gererVisibilitePrimoSelonMode;


})();
