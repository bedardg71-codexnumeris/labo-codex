/**
 * PRIMO TOOLTIPS - Système de tooltips riches (mode Assisté uniquement)
 *
 * Gère l'affichage des aides contextuelles de Primo (😎)
 * Visible uniquement en mode Assisté
 *
 * VERSION : 1.0
 * DATE : 29 novembre 2025
 */

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
        overlay.onclick = fermerPopupPrimo;
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
            <span><span class="primo-icon">😎</span> Conseil de Primo</span>
            <button class="primo-popup-close" onclick="fermerPopupPrimo()">×</button>
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
        console.warn('[Primo] Pas de data-target sur l\'icône', icone);
        return;
    }

    // Récupérer le contenu associé
    const contenuElement = document.getElementById(targetId);
    if (!contenuElement) {
        console.warn('[Primo] Élément target non trouvé:', targetId);
        return;
    }

    // Afficher le popup avec le contenu
    afficherPopupPrimo(contenuElement.innerHTML);
}

// ============================================================================
// INITIALISATION
// ============================================================================

/**
 * Vérifie si on est en mode Assisté et masque/affiche les icônes
 */
function gererVisibilitePrimoSelonMode() {
    // Vérifier si la fonction estModeAssiste existe
    if (typeof estModeAssiste !== 'function') {
        console.warn('[Primo Tooltips] Fonction estModeAssiste non disponible');
        return;
    }

    const modeAssiste = estModeAssiste();
    const icones = document.querySelectorAll('.primo-aide');

    icones.forEach(icone => {
        if (modeAssiste) {
            icone.style.display = 'inline-block';
        } else {
            icone.style.display = 'none';
        }
    });

    console.log(`🎯 [Primo Tooltips] Mode Assisté: ${modeAssiste} - ${icones.length} icônes ${modeAssiste ? 'affichées' : 'masquées'}`);
}

/**
 * Initialise le système de tooltips Primo
 */
function initialiserPrimoTooltips() {
    console.log('🎯 [Primo Tooltips] Initialisation...');

    // Attacher les événements à toutes les icônes Primo
    const icones = document.querySelectorAll('.primo-aide');
    icones.forEach(icone => {
        icone.addEventListener('click', gererClicPrimo);
    });

    console.log(`✅ [Primo Tooltips] ${icones.length} icônes initialisées`);

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
