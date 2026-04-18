/**
 * FLÈCHES DIDACTIQUES
 *
 * Affiche un pointeur contextuel au premier contact d'un écran
 * pour indiquer « clique ici » sur un bouton d'action clé.
 *
 * Une flèche vue est mémorisée via localStorage (flag `fleche-vue__<id>`)
 * et ne réapparaît plus, sauf réinitialisation explicite (toggle Parcours guidé).
 *
 * Déclenchement : écoute l'événement `sectionAffichee` émis par navigation.js
 * (détail.idSousSection). Si une entrée du catalogue match et n'est pas vue,
 * la flèche s'affiche après stabilisation du DOM.
 *
 * Indépendant des systèmes .primo-aide (popup de conseil) et data-tooltip
 * (bulle au hover/long-press). Les flèches didactiques servent à l'onboarding,
 * pas à l'aide permanente.
 *
 * Spec : plans de travail/PLAN-PARCOURS-GUIDE-ET-FLECHES.md
 */

(function() {
'use strict';

// ============================================================================
// CATALOGUE DES FLÈCHES
// ============================================================================

const FLECHES_CATALOGUE = {
    'contexte-pratiques-nouvelle': {
        sectionActive: 'contexte-pratiques-notation',
        cibleSelector: 'button[data-action="creerNouvellePratique"]',
        message: 'Clique ici pour créer ta première pratique de notation.',
        direction: 'haut',
        priorite: 10
    },
    'structure-grilles-nouvelle': {
        sectionActive: 'structure-grille-criteres',
        cibleSelector: 'button[data-action="creerNouvelleGrille"]',
        message: 'Clique ici pour créer ta première grille de critères.',
        direction: 'haut',
        priorite: 10
    },
    'structure-echelles-nouvelle': {
        sectionActive: 'structure-echelle-performance',
        cibleSelector: 'button[data-action="creerNouvelleEchelle"]',
        message: 'Clique ici pour créer ta première échelle de performance.',
        direction: 'haut',
        priorite: 10
    },
    'structure-cartouches-nouvelle': {
        sectionActive: 'structure-retroactions',
        cibleSelector: 'button[data-action="creerNouvelleCartouche"]',
        message: 'Clique ici pour créer ta première cartouche de rétroaction.',
        direction: 'haut',
        priorite: 10
    },
    'structure-productions-nouvelle': {
        sectionActive: 'structure-productions',
        cibleSelector: 'button[data-action="creerNouvelleProduction"]',
        message: 'Clique ici pour créer ta première production étudiante.',
        direction: 'haut',
        priorite: 10
    },
    'suivi-presences-premiere-saisie': {
        sectionActive: 'suivi-saisie',
        cibleSelector: '#tbody-saisie-presences .input-periodes:first-of-type',
        message: 'Clique dans une cellule pour saisir des périodes de présence.',
        direction: 'haut',
        priorite: 5
    },
    'evaluations-annoter-tampons': {
        sectionActive: 'evaluations-annoter',
        cibleSelector: '#btn-toggle-tampons',
        message: 'Tu peux apposer des tampons pour commenter rapidement un travail.',
        direction: 'gauche',
        priorite: 5
    }
};

// ============================================================================
// CONFIGURATION
// ============================================================================

const CLE_PREFIXE = 'fleche-vue__';
const CLE_TOGGLE_ACTIF = 'flechesDidactiquesActives';
const DELAI_STABILISATION_DOM = 150; // ms entre sectionAffichee et positionnement
const MARGE_VIEWPORT = 8;            // px depuis le bord de l'écran
const MARGE_CIBLE = 12;              // px entre la flèche et la cible

// ============================================================================
// ÉTAT
// ============================================================================

let hote = null;            // DOM conteneur unique
let fleschActive = null;    // id de la flèche actuellement visible
let cibleActive = null;     // Élément DOM mis en surbrillance
let timerAffichage = null;  // Timer de stabilisation DOM
let repositionnerTimer = null; // Debounce scroll/resize

// ============================================================================
// PERSISTANCE
// ============================================================================

function estFlecheVue(id) {
    try {
        return localStorage.getItem(CLE_PREFIXE + id) === '1';
    } catch (e) {
        return false;
    }
}

function marquerVue(id) {
    try {
        localStorage.setItem(CLE_PREFIXE + id, '1');
    } catch (e) {
        // Quota ou privé : silencieux, la flèche se re-montrera la prochaine fois
    }
}

function estModuleActif() {
    try {
        // Par défaut activé. Désactivé uniquement si l'utilisateur a coché Off.
        return localStorage.getItem(CLE_TOGGLE_ACTIF) !== '0';
    } catch (e) {
        return true;
    }
}

function definirActif(actif) {
    try {
        localStorage.setItem(CLE_TOGGLE_ACTIF, actif ? '1' : '0');
        if (!actif) masquerActive();
    } catch (e) { /* ignore */ }
}

function reinitialiser(id) {
    try {
        if (id == null) {
            // Toutes les flèches
            const aSupprimer = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.indexOf(CLE_PREFIXE) === 0) aSupprimer.push(k);
            }
            aSupprimer.forEach(k => localStorage.removeItem(k));
        } else {
            localStorage.removeItem(CLE_PREFIXE + id);
        }
    } catch (e) { /* ignore */ }
}

// ============================================================================
// DOM
// ============================================================================

function obtenirHote() {
    if (hote) return hote;
    hote = document.createElement('div');
    hote.id = 'fleche-didactique-host';
    hote.className = 'fleche-didactique';
    hote.innerHTML =
        '<div class="fleche-didactique-pointeur" aria-hidden="true"></div>' +
        '<div class="fleche-didactique-corps">' +
            '<p class="fleche-didactique-message"></p>' +
            '<button type="button" class="fleche-didactique-close" aria-label="Fermer" data-action="masquerFlecheDidactique">×</button>' +
        '</div>';
    document.body.appendChild(hote);
    return hote;
}

function masquerActive() {
    if (timerAffichage) {
        clearTimeout(timerAffichage);
        timerAffichage = null;
    }
    if (cibleActive) {
        cibleActive.classList.remove('fleche-didactique-cible');
        cibleActive = null;
    }
    if (hote) {
        hote.classList.remove('visible');
    }
    fleschActive = null;
}

function fermerEtMarquer() {
    if (fleschActive) {
        marquerVue(fleschActive);
    }
    masquerActive();
}

// ============================================================================
// POSITIONNEMENT
// ============================================================================

function positionner(cible, direction) {
    const h = obtenirHote();
    // Rendre mesurable sans clignotement : visible mais opacity:0 déjà via .visible absente
    h.style.top = '0';
    h.style.left = '0';
    h.setAttribute('data-direction', direction);

    // Forcer le layout pour obtenir les dimensions réelles
    const rectCible = cible.getBoundingClientRect();
    const rectH = h.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top, left;

    if (direction === 'haut') {
        top = rectCible.top - rectH.height - MARGE_CIBLE;
        left = rectCible.left + (rectCible.width / 2) - (rectH.width / 2);
    } else if (direction === 'bas') {
        top = rectCible.bottom + MARGE_CIBLE;
        left = rectCible.left + (rectCible.width / 2) - (rectH.width / 2);
    } else if (direction === 'gauche') {
        top = rectCible.top + (rectCible.height / 2) - (rectH.height / 2);
        left = rectCible.left - rectH.width - MARGE_CIBLE;
    } else { // droite
        top = rectCible.top + (rectCible.height / 2) - (rectH.height / 2);
        left = rectCible.right + MARGE_CIBLE;
    }

    // Contraindre dans le viewport
    left = Math.max(MARGE_VIEWPORT, Math.min(left, vw - rectH.width - MARGE_VIEWPORT));
    top = Math.max(MARGE_VIEWPORT, Math.min(top, vh - rectH.height - MARGE_VIEWPORT));

    h.style.top = top + 'px';
    h.style.left = left + 'px';
}

// ============================================================================
// AFFICHAGE
// ============================================================================

function afficher(id, optionsExterne) {
    if (!estModuleActif()) return;
    if (estFlecheVue(id)) return;

    const entree = (optionsExterne && optionsExterne.sectionActive)
        ? optionsExterne
        : FLECHES_CATALOGUE[id];

    if (!entree) {
        console.warn('[FlèchesDidactiques] Entrée inconnue :', id);
        return;
    }

    if (timerAffichage) clearTimeout(timerAffichage);

    timerAffichage = setTimeout(function() {
        timerAffichage = null;
        const cible = document.querySelector(entree.cibleSelector);
        if (!cible) {
            // Log non mémoïsé : signale aux devs une possible rupture de sélecteur
            console.warn('[FlèchesDidactiques] Cible introuvable pour "' + id + '" : ' + entree.cibleSelector);
            return;
        }

        // Masquer une flèche précédente (au cas où)
        if (fleschActive && fleschActive !== id) {
            masquerActive();
        }

        fleschActive = id;
        cibleActive = cible;
        cibleActive.classList.add('fleche-didactique-cible');

        const h = obtenirHote();
        h.querySelector('.fleche-didactique-message').textContent = entree.message;

        requestAnimationFrame(function() {
            positionner(cible, entree.direction);
            h.classList.add('visible');
        });
    }, DELAI_STABILISATION_DOM);
}

// ============================================================================
// INTÉGRATION
// ============================================================================

// Réagit aux changements de section
window.addEventListener('sectionAffichee', function(ev) {
    const idSousSection = ev.detail && ev.detail.idSousSection;
    if (!idSousSection) return;

    // Masquer l'active si la section change
    if (fleschActive) masquerActive();

    if (!estModuleActif()) return;

    // Chercher la flèche de plus haute priorité pour cette section
    let candidate = null;
    for (const id in FLECHES_CATALOGUE) {
        const entree = FLECHES_CATALOGUE[id];
        if (entree.sectionActive !== idSousSection) continue;
        if (estFlecheVue(id)) continue;
        if (!candidate || entree.priorite > candidate.entree.priorite) {
            candidate = { id: id, entree: entree };
        }
    }

    if (candidate) afficher(candidate.id);
});

// Dismiss au clic sur la cible
document.addEventListener('click', function(ev) {
    if (!fleschActive) return;
    if (!cibleActive) return;
    // Clic sur la cible (ou un descendant) → marquer vue et fermer
    if (ev.target.closest(FLECHES_CATALOGUE[fleschActive].cibleSelector) === cibleActive) {
        fermerEtMarquer();
    }
}, true);

// Bouton × et data-action masquerFlecheDidactique (pour le dispatcher main.js)
window.masquerFlecheDidactique = fermerEtMarquer;

// Repositionner au scroll/resize (debounced)
function reposDebounced() {
    if (!fleschActive || !cibleActive) return;
    if (repositionnerTimer) return;
    repositionnerTimer = requestAnimationFrame(function() {
        repositionnerTimer = null;
        if (fleschActive && cibleActive && document.body.contains(cibleActive)) {
            const entree = FLECHES_CATALOGUE[fleschActive];
            if (entree) positionner(cibleActive, entree.direction);
        } else {
            masquerActive();
        }
    });
}
window.addEventListener('scroll', reposDebounced, { passive: true, capture: true });
window.addEventListener('resize', reposDebounced);

// ============================================================================
// API PUBLIQUE
// ============================================================================

window.flechesDidactiques = {
    afficher: afficher,
    masquerActive: masquerActive,
    reinitialiser: reinitialiser,
    estActif: estModuleActif,
    definirActif: definirActif,
    catalogue: FLECHES_CATALOGUE
};

})();
