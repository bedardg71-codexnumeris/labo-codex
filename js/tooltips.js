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
let actif = true; // desactivable via Preferences > Navigation

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
    if (!actif) return;
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

// --- Delegation d'evenements (souris) ---

document.addEventListener('mouseenter', function(e) {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const cible = e.target.closest('[data-tooltip]');
    if (!cible) return;

    clearTimeout(timerDisparition);
    timerAffichage = setTimeout(() => afficher(cible), DELAI_AFFICHAGE);
}, true);

document.addEventListener('mouseleave', function(e) {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const cible = e.target.closest('[data-tooltip]');
    if (!cible) return;

    clearTimeout(timerAffichage);
    timerDisparition = setTimeout(masquer, DELAI_DISPARITION);
}, true);

// --- Support tactile (tablettes) ---
// Long-press (600ms) pour afficher le tooltip. Le doigt doit rester immobile.
// Le tooltip reste visible jusqu'au prochain tap (gere par le listener click).

const DELAI_LONG_PRESS = 400;
const TOLERANCE_MOUVEMENT = 20;
let timerLongPress = null;
let touchStartX = 0;
let touchStartY = 0;
let cibleLongPress = null;
let tooltipJusteAffiche = false;

document.addEventListener('touchstart', function(e) {
    const cible = e.target.closest('[data-tooltip]');
    if (!cible) return;

    clearTimeout(timerLongPress);
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    cibleLongPress = cible;

    timerLongPress = setTimeout(function() {
        timerLongPress = null;
        afficher(cible);
        // Empecher le click qui suit le touchend de masquer immediatement
        tooltipJusteAffiche = true;
        setTimeout(function() { tooltipJusteAffiche = false; }, 300);
    }, DELAI_LONG_PRESS);
}, true);

document.addEventListener('touchmove', function(e) {
    if (!timerLongPress) return;
    const touch = e.touches[0];
    if (Math.abs(touch.clientX - touchStartX) > TOLERANCE_MOUVEMENT || Math.abs(touch.clientY - touchStartY) > TOLERANCE_MOUVEMENT) {
        clearTimeout(timerLongPress);
        timerLongPress = null;
        cibleLongPress = null;
    }
}, { passive: true, capture: true });

document.addEventListener('touchend', function() {
    if (timerLongPress) {
        clearTimeout(timerLongPress);
        timerLongPress = null;
        cibleLongPress = null;
    }
}, true);

// Empecher le menu contextuel natif pendant un long-press tooltip
document.addEventListener('contextmenu', function(e) {
    if (cibleLongPress && e.target.closest('[data-tooltip]') === cibleLongPress) {
        e.preventDefault();
    }
});

// --- Support clavier (accessibilite) ---
// Tab vers un element [data-tooltip] affiche le tooltip au focus.

document.addEventListener('focusin', function(e) {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const cible = e.target.closest('[data-tooltip]');
    if (!cible) return;

    clearTimeout(timerDisparition);
    timerAffichage = setTimeout(function() { afficher(cible); }, DELAI_AFFICHAGE);
});

document.addEventListener('focusout', function(e) {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const cible = e.target.closest('[data-tooltip]');
    if (!cible) return;

    clearTimeout(timerAffichage);
    timerDisparition = setTimeout(masquer, DELAI_DISPARITION);
});

// --- Masquage global ---

// Masquer si scroll ou redimensionnement
window.addEventListener('scroll', masquer, { passive: true });
window.addEventListener('resize', masquer);

// Masquage instantane au clic (et au tap apres un long-press)
document.addEventListener('click', function() {
    if (tooltipJusteAffiche) return;
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

// --- Preference : activer/desactiver les tooltips ---

function definirTooltips(etat) {
    actif = !!etat;
    if (!actif) masquer();
    // Synchroniser tous les checkboxes miroirs (Preferences + Accueil)
    document.querySelectorAll('#checkbox-tooltips, #checkbox-tooltips-accueil').forEach(cb => cb.checked = actif);
    // Persister via l'API de préférences
    try {
        if (typeof definirPreference === 'function') {
            definirPreference('tooltips', actif);
        }
    } catch (e) { console.warn('[Tooltips] preference save skipped:', e.message || e); }
}

// Initialisation : lire la preference et synchroniser le checkbox
function initialiserTooltips() {
    try {
        actif = typeof obtenirPreference === 'function'
            ? obtenirPreference('tooltips') !== false
            : true;
    } catch (e) {
        actif = true;
    }
    document.querySelectorAll('#checkbox-tooltips, #checkbox-tooltips-accueil').forEach(cb => cb.checked = actif);
}

document.addEventListener('DOMContentLoaded', initialiserTooltips);

// Export
window.tooltips = { afficher, masquer };
window.definirTooltips = definirTooltips;

})();
