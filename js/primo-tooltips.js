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
 * Gère le clic sur une icône Primo (délégation globale)
 * @param {Element} icone - Élément .primo-aide cliqué
 */
function gererClicPrimo(icone) {
    const targetId = icone.dataset.target;

    if (!targetId) {
        console.warn('[Guide] Pas de data-target sur l\'icône', icone);
        return;
    }

    const contenuElement = document.getElementById(targetId);
    if (!contenuElement) {
        console.warn('[Guide] Élément target non trouvé:', targetId);
        return;
    }

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

// Flag pour n'attacher les listeners globaux qu'une seule fois
let _listenersGlobauxAttaches = false;

/**
 * Initialise le système de tooltips Primo.
 *
 * Les listeners globaux (click délégué, keydown Escape, modeChanged) sont attachés
 * une seule fois au document/window pour couvrir tous les .primo-aide présents
 * et futurs — y compris ceux générés par innerHTML après navigation SPA.
 *
 * Idempotent : peut être rappelée sans effet de bord (ex. par les modules qui
 * re-rendent leur contenu). Le seul travail répété est de recalculer la visibilité
 * des icônes selon le mode (tour guide / aide contextuelle).
 */
function initialiserPrimoTooltips() {
    if (!_listenersGlobauxAttaches) {
        // Délégation globale : capte les clics sur .primo-aide actuels et futurs
        document.addEventListener('click', (event) => {
            const icone = event.target.closest('.primo-aide');
            if (!icone) return;
            event.preventDefault();
            event.stopPropagation();
            gererClicPrimo(icone);
        });

        // Fermer le popup avec Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                fermerPopupPrimo();
            }
        });

        // Écouter les changements de mode (événement 'modeChanged' émis par modes.js)
        window.addEventListener('modeChanged', gererVisibilitePrimoSelonMode);

        _listenersGlobauxAttaches = true;
    }

    // Appliquer la visibilité au state courant du DOM (utile après re-render)
    gererVisibilitePrimoSelonMode();
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
