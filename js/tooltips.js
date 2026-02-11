/**
 * tooltips.js
 * Moteur de tooltips au survol — Monitorage Pedagogique
 *
 * Usage HTML : <element data-tooltip="cle-unique">
 * Le texte est lu depuis window.TOOLTIPS[cle]
 */
(function() {
'use strict';

// --- Configuration ---
const DELAI_AFFICHAGE = 400;    // ms avant apparition
const DELAI_DISPARITION = 200;  // ms avant disparition
const MARGE = 4;                // px entre la bulle et l'element
const LARGEUR_MAX = 320;        // px largeur max de la bulle

// --- Etat ---
let timerAffichage = null;
let timerDisparition = null;
let bulleActive = null;
let cibleActive = null;

/**
 * Cree l'element bulle s'il n'existe pas
 * @returns {HTMLElement}
 */
function obtenirBulle() {
    let bulle = document.getElementById('tooltip-bulle');
    if (!bulle) {
        bulle = document.createElement('div');
        bulle.id = 'tooltip-bulle';
        bulle.className = 'tooltip-bulle';
        bulle.setAttribute('role', 'tooltip');

        const fleche = document.createElement('div');
        fleche.className = 'tooltip-fleche';
        bulle.appendChild(fleche);

        const contenu = document.createElement('div');
        contenu.className = 'tooltip-contenu';
        bulle.appendChild(contenu);

        document.body.appendChild(bulle);
    }
    return bulle;
}

/**
 * Calcule la position optimale de la bulle.
 * Priorite laterale : droite -> gauche -> bas -> haut.
 * Le placement lateral evite de masquer l'interface sous/sur la cible.
 * @param {HTMLElement} cible
 * @param {HTMLElement} bulle
 */
function positionnerBulle(cible, bulle) {
    const rect = cible.getBoundingClientRect();
    const bulleRect = bulle.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top, left;
    let position = 'droite';

    // --- 1. Essayer A DROITE ---
    left = rect.right + MARGE;
    top = rect.top + (rect.height / 2) - (bulleRect.height / 2);

    if (left + bulleRect.width > vw) {
        // --- 2. Essayer A GAUCHE ---
        left = rect.left - bulleRect.width - MARGE;
        position = 'gauche';

        if (left < 0) {
            // --- 3. Essayer EN BAS ---
            left = rect.left + (rect.width / 2) - (bulleRect.width / 2);
            top = rect.bottom + MARGE;
            position = 'bas';

            if (top + bulleRect.height > vh) {
                // --- 4. Essayer EN HAUT ---
                top = rect.top - bulleRect.height - MARGE;
                position = 'haut';
            }
        }
    }

    // Contraindre dans le viewport
    left = Math.max(MARGE, Math.min(left, vw - bulleRect.width - MARGE));
    top = Math.max(MARGE, Math.min(top, vh - bulleRect.height - MARGE));

    bulle.style.top = `${top + window.scrollY}px`;
    bulle.style.left = `${left + window.scrollX}px`;
    bulle.dataset.position = position;
}

/**
 * Affiche le tooltip pour une cible donnee
 * @param {HTMLElement} cible
 */
function afficher(cible) {
    const cle = cible.dataset.tooltip;
    if (!cle || !window.TOOLTIPS || !window.TOOLTIPS[cle]) return;

    const texte = window.TOOLTIPS[cle];
    const bulle = obtenirBulle();
    const contenu = bulle.querySelector('.tooltip-contenu');

    contenu.textContent = texte;
    bulle.style.maxWidth = `${LARGEUR_MAX}px`;

    // Surbrillance de la cible
    if (cibleActive && cibleActive !== cible) {
        cibleActive.classList.remove('tooltip-cible-active');
    }
    cible.classList.add('tooltip-cible-active');

    // Rendre visible pour calculer les dimensions (mais pas encore anime)
    bulle.classList.add('tooltip-mesure');
    bulle.classList.remove('tooltip-visible');

    // Positionner puis animer
    requestAnimationFrame(() => {
        positionnerBulle(cible, bulle);
        bulle.classList.remove('tooltip-mesure');
        bulle.classList.add('tooltip-visible');
    });

    bulleActive = bulle;
    cibleActive = cible;
}

/**
 * Masque le tooltip actif
 */
function masquer() {
    if (bulleActive) {
        bulleActive.classList.remove('tooltip-visible');
        bulleActive = null;
    }
    if (cibleActive) {
        cibleActive.classList.remove('tooltip-cible-active');
        cibleActive = null;
    }
}

// --- Delegation d'evenements ---

document.addEventListener('mouseenter', function(e) {
    const cible = e.target.closest('[data-tooltip]');
    if (!cible) return;

    clearTimeout(timerDisparition);
    timerAffichage = setTimeout(() => afficher(cible), DELAI_AFFICHAGE);
}, true);

document.addEventListener('mouseleave', function(e) {
    const cible = e.target.closest('[data-tooltip]');
    if (!cible) return;

    clearTimeout(timerAffichage);
    timerDisparition = setTimeout(masquer, DELAI_DISPARITION);
}, true);

// Masquer si scroll ou redimensionnement
window.addEventListener('scroll', masquer, { passive: true });
window.addEventListener('resize', masquer);

// Masquage instantane au clic
document.addEventListener('click', function() {
    clearTimeout(timerAffichage);
    masquer();
}, true);

// Masquage au clavier (Escape)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        clearTimeout(timerAffichage);
        masquer();
    }
});

// Export
window.tooltips = { afficher, masquer };

})();
