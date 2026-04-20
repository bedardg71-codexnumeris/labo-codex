/**
 * accompagnement.js — Système d'accompagnement unifié (Phase 1 drop-in)
 *
 * Fusionne en un seul moteur les 6 modules historiques :
 *   - tooltips.js                (mode hover)
 *   - fleches-didactiques.js     (mode autoReveal)
 *   - primo-tooltips.js          (mode popup — déclencheur)
 *   - aide-contextuelle.js       (mode popup — rendu riche)
 *   - guidage.js                 (mode tour)
 *   - glossaire.js               (mode terme)
 *
 * Phase 1 — compatible drop-in :
 *   - Les attributs HTML existants (~220 usages) fonctionnent sans modification.
 *   - Les 4 catalogues existants (window.TOOLTIPS, window.AIDE_CONTEXTUELLE,
 *     window.GLOSSAIRE, ETAPES_TOUR interne) sont lus tels quels.
 *   - Les alias window.tooltips, window.flechesDidactiques, window.glossaire,
 *     window.afficherAideContextuelle, etc. restent exportés.
 *   - Les flags localStorage fleche-vue__* sont migrés vers accompagnement-vu__*
 *     au premier chargement, idempotent (flag accompagnement-migration-v1).
 *   - Préférence unifiée window.accompagnement.estActif() lit l'AND des 4
 *     anciennes (tooltips, aideContextuelleActive, flechesDidactiquesActives
 *     localStorage, tourGuide) ; definirActif(bool) écrit les 4.
 *
 * Plan : plans de travail/PLAN-INFOBULLES-UNIFIEES.md
 */
(function() {
'use strict';

// ============================================================================
// CORE — utilitaires partagés, préférence unifiée, migration
// ============================================================================

const CLE_VUE_PREFIXE = 'accompagnement-vu__';
const CLE_VUE_ANCIEN_PREFIXE = 'fleche-vue__';
const CLE_MIGRATION = 'accompagnement-migration-v1';
const CLE_TOGGLE_FLECHES = 'flechesDidactiquesActives';

// ---- Catalogue unifié (Phase 2+) --------------------------------------------
// Une entrée par concept pédagogique. Chaque entrée peut porter plusieurs modes :
//   hover      → string (bulle sobre au hover/long-press)
//   autoReveal → { sectionActive, cibleSelector, message, direction, priorite }
//   popup      → { titre, sections, voirAussi } (sera alimenté en Phase 3)
//   tour       → { ordre, titre, texte, actions, correspond } (Phase 4)
//   terme      → { resume, fiche, categorie, etape, voir } (Phase 5)
// Les contenus externes (tooltips-contenu.js, aide-contextuelle-contenu.js,
// glossaire-data.js) se déversent ici via ajouterEntrees().
const CATALOGUE_ACCOMPAGNEMENT = {};

function ajouterEntrees(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (const cle in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, cle)) continue;
        const existante = CATALOGUE_ACCOMPAGNEMENT[cle] || {};
        Object.assign(existante, obj[cle]);
        CATALOGUE_ACCOMPAGNEMENT[cle] = existante;
    }
}

function obtenirEntree(cle) {
    return CATALOGUE_ACCOMPAGNEMENT[cle] || null;
}

function echapper(s) {
    if (typeof echapperHtml === 'function') return echapperHtml(s);
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
}

function lireFlag(cle) {
    try { return localStorage.getItem(cle) === '1'; } catch (e) { return false; }
}

function ecrireFlag(cle, valeur) {
    try { localStorage.setItem(cle, valeur ? '1' : '0'); } catch (e) { /* quota */ }
}

function estVue(id) {
    return lireFlag(CLE_VUE_PREFIXE + id);
}

function marquerVue(id) {
    try { localStorage.setItem(CLE_VUE_PREFIXE + id, '1'); } catch (e) { /* quota */ }
}

function reinitialiserVue(id) {
    try {
        if (id == null) {
            const aSupprimer = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.indexOf(CLE_VUE_PREFIXE) === 0) aSupprimer.push(k);
            }
            aSupprimer.forEach(k => localStorage.removeItem(k));
        } else {
            localStorage.removeItem(CLE_VUE_PREFIXE + id);
        }
    } catch (e) { /* ignore */ }
}

// ---- Migration idempotente des flags fleche-vue__ ---------------------------

function migrerPersistance() {
    try {
        if (lireFlag(CLE_MIGRATION)) return;
        const aMigrer = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.indexOf(CLE_VUE_ANCIEN_PREFIXE) === 0) aMigrer.push(k);
        }
        aMigrer.forEach(function(k) {
            const id = k.substring(CLE_VUE_ANCIEN_PREFIXE.length);
            try {
                localStorage.setItem(CLE_VUE_PREFIXE + id, '1');
                localStorage.removeItem(k);
            } catch (e) { /* ignore */ }
        });
        ecrireFlag(CLE_MIGRATION, true);
    } catch (e) {
        console.warn('[Accompagnement] migration persistance ignorée :', e.message || e);
    }
}

// ---- Préférence unifiée -----------------------------------------------------

function lirePref(cle, defaut) {
    try {
        if (typeof obtenirPreference === 'function') {
            const v = obtenirPreference(cle);
            return v == null ? defaut : v;
        }
    } catch (e) { /* ignore */ }
    return defaut;
}

function ecrirePref(cle, valeur) {
    try {
        if (typeof definirPreference === 'function') {
            definirPreference(cle, valeur);
        }
    } catch (e) { /* ignore */ }
}

function prefTooltipsActive()  { return lirePref('tooltips', true) !== false; }
function prefAideActive()      { return lirePref('aideContextuelleActive', true) !== false; }
function prefTourActif()       { return !!lirePref('tourGuide', false); }
function prefFlechesActives()  {
    try { return localStorage.getItem(CLE_TOGGLE_FLECHES) !== '0'; } catch (e) { return true; }
}

function estAccompagnementActif() {
    // AND des 4 anciennes prefs (Phase 1 transition). Phase 6 → pref unique.
    return prefTooltipsActive() && prefAideActive() && prefFlechesActives() && prefTourActif();
}

function definirAccompagnementActif(actif) {
    const bool = !!actif;
    ecrirePref('tooltips', bool);
    ecrirePref('aideContextuelleActive', bool);
    ecrirePref('tourGuide', bool);
    try { localStorage.setItem(CLE_TOGGLE_FLECHES, bool ? '1' : '0'); } catch (e) { /* quota */ }
    if (!bool) masquerTout();
    // Synchroniser les checkboxes miroirs
    document.querySelectorAll('#checkbox-tooltips, #checkbox-tooltips-accueil').forEach(cb => cb.checked = bool);
}

// ---- Positionnement partagé (4 directions + clamp viewport) -----------------

const MARGE_VIEWPORT = 8;
const MARGE_CIBLE = 12;

function positionner(hote, cible, direction) {
    const rectCible = cible.getBoundingClientRect();
    const rectH = hote.getBoundingClientRect();
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

    left = Math.max(MARGE_VIEWPORT, Math.min(left, vw - rectH.width - MARGE_VIEWPORT));
    top = Math.max(MARGE_VIEWPORT, Math.min(top, vh - rectH.height - MARGE_VIEWPORT));

    hote.style.top = top + 'px';
    hote.style.left = left + 'px';
}

function masquerTout() {
    masquerHover();
    masquerAutoReveal();
    fermerPopup();
    fermerMicroPopupGlossaire();
    // tour : panneau flottant, masqué par fermerPanneauTour
    fermerPanneauTour();
}

// ============================================================================
// MODE HOVER — bulle sobre au survol/long-press/focus (ex-tooltips.js)
// ============================================================================

const HOVER_DELAI_AFFICHAGE = 400;
const HOVER_DELAI_DISPARITION = 200;
const HOVER_MARGE = 4;
const HOVER_LARGEUR_MAX = 320;
const HOVER_DELAI_LONG_PRESS = 400;
const HOVER_TOLERANCE_MOUVEMENT = 20;

let hoverTimerAffichage = null;
let hoverTimerDisparition = null;
let hoverBulleActive = null;
let hoverCibleActive = null;
let hoverTimerLongPress = null;
let hoverTouchStartX = 0;
let hoverTouchStartY = 0;
let hoverCibleLongPress = null;
let hoverTooltipJusteAffiche = false;

function hoverObtenirBulle() {
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

function hoverPositionnerBulle(cible, bulle) {
    const rect = cible.getBoundingClientRect();
    const bulleRect = bulle.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top, left;
    let position = 'droite';

    left = rect.right + HOVER_MARGE;
    top = rect.top + (rect.height / 2) - (bulleRect.height / 2);

    if (left + bulleRect.width > vw) {
        left = rect.left - bulleRect.width - HOVER_MARGE;
        position = 'gauche';

        if (left < 0) {
            left = rect.left + (rect.width / 2) - (bulleRect.width / 2);
            top = rect.bottom + HOVER_MARGE;
            position = 'bas';

            if (top + bulleRect.height > vh) {
                top = rect.top - bulleRect.height - HOVER_MARGE;
                position = 'haut';
            }
        }
    }

    left = Math.max(HOVER_MARGE, Math.min(left, vw - bulleRect.width - HOVER_MARGE));
    top = Math.max(HOVER_MARGE, Math.min(top, vh - bulleRect.height - HOVER_MARGE));

    bulle.style.top = `${top + window.scrollY}px`;
    bulle.style.left = `${left + window.scrollX}px`;
    bulle.dataset.position = position;
}

function afficherHover(cible) {
    if (!prefTooltipsActive()) return;
    const cle = cible.dataset.tooltip;
    if (!cle) return;

    // Phase 2 : lire depuis le catalogue unifié, fallback sur window.TOOLTIPS
    // (rétro-compat le temps que tooltips-contenu.js termine sa migration async).
    const entree = CATALOGUE_ACCOMPAGNEMENT[cle];
    let texte = entree && entree.hover;
    if (!texte && window.TOOLTIPS) texte = window.TOOLTIPS[cle];
    if (!texte) return;

    const bulle = hoverObtenirBulle();
    const contenu = bulle.querySelector('.tooltip-contenu');

    contenu.textContent = texte;
    bulle.style.maxWidth = `${HOVER_LARGEUR_MAX}px`;

    if (hoverCibleActive && hoverCibleActive !== cible) {
        hoverCibleActive.classList.remove('tooltip-cible-active');
    }
    cible.classList.add('tooltip-cible-active');

    bulle.classList.add('tooltip-mesure');
    bulle.classList.remove('tooltip-visible');

    requestAnimationFrame(() => {
        hoverPositionnerBulle(cible, bulle);
        bulle.classList.remove('tooltip-mesure');
        bulle.classList.add('tooltip-visible');
    });

    hoverBulleActive = bulle;
    hoverCibleActive = cible;
}

function masquerHover() {
    if (hoverBulleActive) {
        hoverBulleActive.classList.remove('tooltip-visible');
        hoverBulleActive = null;
    }
    if (hoverCibleActive) {
        hoverCibleActive.classList.remove('tooltip-cible-active');
        hoverCibleActive = null;
    }
}

let _hoverInitialise = false;
function initialiserHover() {
    if (_hoverInitialise) return;
    _hoverInitialise = true;
    document.addEventListener('mouseenter', function(e) {
        if (!e.target || typeof e.target.closest !== 'function') return;
        const cible = e.target.closest('[data-tooltip]');
        if (!cible) return;
        clearTimeout(hoverTimerDisparition);
        hoverTimerAffichage = setTimeout(() => afficherHover(cible), HOVER_DELAI_AFFICHAGE);
    }, true);

    document.addEventListener('mouseleave', function(e) {
        if (!e.target || typeof e.target.closest !== 'function') return;
        const cible = e.target.closest('[data-tooltip]');
        if (!cible) return;
        clearTimeout(hoverTimerAffichage);
        hoverTimerDisparition = setTimeout(masquerHover, HOVER_DELAI_DISPARITION);
    }, true);

    // iPad : long-press 400 ms avec tolérance 20 px (A.5-bis)
    document.addEventListener('touchstart', function(e) {
        const cible = e.target.closest('[data-tooltip]');
        if (!cible) return;
        clearTimeout(hoverTimerLongPress);
        const touch = e.touches[0];
        hoverTouchStartX = touch.clientX;
        hoverTouchStartY = touch.clientY;
        hoverCibleLongPress = cible;
        hoverTimerLongPress = setTimeout(function() {
            hoverTimerLongPress = null;
            afficherHover(cible);
            hoverTooltipJusteAffiche = true;
            setTimeout(function() { hoverTooltipJusteAffiche = false; }, 300);
        }, HOVER_DELAI_LONG_PRESS);
    }, true);

    document.addEventListener('touchmove', function(e) {
        if (!hoverTimerLongPress) return;
        const touch = e.touches[0];
        if (Math.abs(touch.clientX - hoverTouchStartX) > HOVER_TOLERANCE_MOUVEMENT ||
            Math.abs(touch.clientY - hoverTouchStartY) > HOVER_TOLERANCE_MOUVEMENT) {
            clearTimeout(hoverTimerLongPress);
            hoverTimerLongPress = null;
            hoverCibleLongPress = null;
        }
    }, { passive: true, capture: true });

    document.addEventListener('touchend', function() {
        if (hoverTimerLongPress) {
            clearTimeout(hoverTimerLongPress);
            hoverTimerLongPress = null;
            hoverCibleLongPress = null;
        }
    }, true);

    document.addEventListener('contextmenu', function(e) {
        if (hoverCibleLongPress && e.target.closest('[data-tooltip]') === hoverCibleLongPress) {
            e.preventDefault();
        }
    });

    // Clavier (Tab → focus)
    document.addEventListener('focusin', function(e) {
        if (!e.target || typeof e.target.closest !== 'function') return;
        const cible = e.target.closest('[data-tooltip]');
        if (!cible) return;
        clearTimeout(hoverTimerDisparition);
        hoverTimerAffichage = setTimeout(function() { afficherHover(cible); }, HOVER_DELAI_AFFICHAGE);
    });

    document.addEventListener('focusout', function(e) {
        if (!e.target || typeof e.target.closest !== 'function') return;
        const cible = e.target.closest('[data-tooltip]');
        if (!cible) return;
        clearTimeout(hoverTimerAffichage);
        hoverTimerDisparition = setTimeout(masquerHover, HOVER_DELAI_DISPARITION);
    });

    window.addEventListener('scroll', masquerHover, { passive: true });
    window.addEventListener('resize', masquerHover);

    document.addEventListener('click', function() {
        if (hoverTooltipJusteAffiche) return;
        clearTimeout(hoverTimerAffichage);
        masquerHover();
    }, true);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            clearTimeout(hoverTimerAffichage);
            masquerHover();
        }
    });

    // Synchroniser les checkboxes miroirs
    const actif = prefTooltipsActive();
    document.querySelectorAll('#checkbox-tooltips, #checkbox-tooltips-accueil').forEach(cb => cb.checked = actif);
}

function definirTooltips(etat) {
    const bool = !!etat;
    if (!bool) masquerHover();
    document.querySelectorAll('#checkbox-tooltips, #checkbox-tooltips-accueil').forEach(cb => cb.checked = bool);
    ecrirePref('tooltips', bool);
}

// ============================================================================
// MODE AUTO-REVEAL — flèche-pointeur sur sectionAffichee (ex-fleches-didactiques.js)
// ============================================================================

// Les 7 flèches didactiques : peuplées directement dans le catalogue unifié.
// En Phase 2, `window.flechesDidactiques.catalogue` devient une vue dérivée
// (voir exports en bas du fichier).
ajouterEntrees({
    'contexte-pratiques-nouvelle': {
        autoReveal: {
            sectionActive: 'contexte-pratiques-notation',
            cibleSelector: 'button[data-action="creerNouvellePratique"]',
            message: 'Clique ici pour créer ta première pratique de notation.',
            direction: 'haut',
            priorite: 10
        }
    },
    'structure-grilles-nouvelle': {
        autoReveal: {
            sectionActive: 'structure-grille-criteres',
            cibleSelector: 'button[data-action="creerNouvelleGrille"]',
            message: 'Clique ici pour créer ta première grille de critères.',
            direction: 'haut',
            priorite: 10
        }
    },
    'structure-echelles-nouvelle': {
        autoReveal: {
            sectionActive: 'structure-echelle-performance',
            cibleSelector: 'button[data-action="creerNouvelleEchelle"]',
            message: 'Clique ici pour créer ta première échelle de performance.',
            direction: 'haut',
            priorite: 10
        }
    },
    'structure-cartouches-nouvelle': {
        autoReveal: {
            sectionActive: 'structure-retroactions',
            cibleSelector: 'button[data-action="creerNouvelleCartouche"]',
            message: 'Clique ici pour créer ta première cartouche de rétroaction.',
            direction: 'haut',
            priorite: 10
        }
    },
    'structure-productions-nouvelle': {
        autoReveal: {
            sectionActive: 'structure-productions',
            cibleSelector: 'button[data-action="creerNouvelleProduction"]',
            message: 'Clique ici pour créer ta première production étudiante.',
            direction: 'haut',
            priorite: 10
        }
    },
    'suivi-presences-premiere-saisie': {
        autoReveal: {
            sectionActive: 'suivi-saisie',
            cibleSelector: '#tbody-saisie-presences .input-periodes:first-of-type',
            message: 'Clique dans une cellule pour saisir des périodes de présence.',
            direction: 'haut',
            priorite: 5
        }
    },
    'evaluations-annoter-tampons': {
        autoReveal: {
            sectionActive: 'evaluations-annoter',
            cibleSelector: '#btn-toggle-tampons',
            message: 'Tu peux apposer des tampons pour commenter rapidement un travail.',
            direction: 'gauche',
            priorite: 5
        }
    }
});

// Helper : obtenir la config autoReveal d'une entrée
function obtenirAutoReveal(id) {
    const entree = CATALOGUE_ACCOMPAGNEMENT[id];
    return (entree && entree.autoReveal) || null;
}

const AUTO_DELAI_STABILISATION = 150;
let autoHote = null;
let autoFlecheActive = null;
let autoCibleActive = null;
let autoTimerAffichage = null;
let autoRepositionnerTimer = null;

function autoObtenirHote() {
    if (autoHote) return autoHote;
    autoHote = document.createElement('div');
    autoHote.id = 'fleche-didactique-host';
    autoHote.className = 'fleche-didactique';
    autoHote.innerHTML =
        '<div class="fleche-didactique-pointeur" aria-hidden="true"></div>' +
        '<div class="fleche-didactique-corps">' +
            '<p class="fleche-didactique-message"></p>' +
            '<button type="button" class="fleche-didactique-close" aria-label="Fermer" data-action="masquerFlecheDidactique">×</button>' +
        '</div>';
    document.body.appendChild(autoHote);
    return autoHote;
}

function masquerAutoReveal() {
    if (autoTimerAffichage) {
        clearTimeout(autoTimerAffichage);
        autoTimerAffichage = null;
    }
    if (autoCibleActive) {
        autoCibleActive.classList.remove('fleche-didactique-cible');
        autoCibleActive = null;
    }
    if (autoHote) autoHote.classList.remove('visible');
    autoFlecheActive = null;
}

function fermerEtMarquerAutoReveal() {
    if (autoFlecheActive) marquerVue(autoFlecheActive);
    masquerAutoReveal();
}

function autoPositionner(cible, direction) {
    const h = autoObtenirHote();
    h.style.top = '0';
    h.style.left = '0';
    h.setAttribute('data-direction', direction);
    positionner(h, cible, direction);
}

function afficherAutoReveal(id, optionsExterne) {
    if (!prefFlechesActives()) return;
    if (estVue(id)) return;

    const entree = (optionsExterne && optionsExterne.sectionActive)
        ? optionsExterne
        : obtenirAutoReveal(id);

    if (!entree) {
        console.warn('[Accompagnement/flèches] Entrée inconnue :', id);
        return;
    }

    if (autoTimerAffichage) clearTimeout(autoTimerAffichage);

    autoTimerAffichage = setTimeout(function() {
        autoTimerAffichage = null;
        const cible = document.querySelector(entree.cibleSelector);
        if (!cible) {
            console.warn('[Accompagnement/flèches] Cible introuvable pour "' + id + '" : ' + entree.cibleSelector);
            return;
        }

        if (autoFlecheActive && autoFlecheActive !== id) masquerAutoReveal();

        autoFlecheActive = id;
        autoCibleActive = cible;
        autoCibleActive.classList.add('fleche-didactique-cible');

        const h = autoObtenirHote();
        h.querySelector('.fleche-didactique-message').textContent = entree.message;

        requestAnimationFrame(function() {
            autoPositionner(cible, entree.direction);
            h.classList.add('visible');
        });
    }, AUTO_DELAI_STABILISATION);
}

function definirFlechesActives(actif) {
    const bool = !!actif;
    try { localStorage.setItem(CLE_TOGGLE_FLECHES, bool ? '1' : '0'); } catch (e) { /* quota */ }
    if (!bool) masquerAutoReveal();
}

let _autoRevealInitialise = false;
function initialiserAutoReveal() {
    if (_autoRevealInitialise) return;
    _autoRevealInitialise = true;
    window.addEventListener('sectionAffichee', function(ev) {
        const idSousSection = ev.detail && ev.detail.idSousSection;
        if (!idSousSection) return;

        if (autoFlecheActive) masquerAutoReveal();
        if (!prefFlechesActives()) return;

        let candidate = null;
        for (const id in CATALOGUE_ACCOMPAGNEMENT) {
            const entree = CATALOGUE_ACCOMPAGNEMENT[id].autoReveal;
            if (!entree) continue;
            if (entree.sectionActive !== idSousSection) continue;
            if (estVue(id)) continue;
            if (!candidate || entree.priorite > candidate.entree.priorite) {
                candidate = { id: id, entree: entree };
            }
        }
        if (candidate) afficherAutoReveal(candidate.id);
    });

    document.addEventListener('click', function(ev) {
        if (!autoFlecheActive || !autoCibleActive) return;
        const entree = obtenirAutoReveal(autoFlecheActive);
        if (entree && ev.target.closest(entree.cibleSelector) === autoCibleActive) {
            fermerEtMarquerAutoReveal();
        }
    }, true);

    function reposDebounced() {
        if (!autoFlecheActive || !autoCibleActive) return;
        if (autoRepositionnerTimer) return;
        autoRepositionnerTimer = requestAnimationFrame(function() {
            autoRepositionnerTimer = null;
            if (autoFlecheActive && autoCibleActive && document.body.contains(autoCibleActive)) {
                const entree = obtenirAutoReveal(autoFlecheActive);
                if (entree) autoPositionner(autoCibleActive, entree.direction);
            } else {
                masquerAutoReveal();
            }
        });
    }
    window.addEventListener('scroll', reposDebounced, { passive: true, capture: true });
    window.addEventListener('resize', reposDebounced);
}

// ============================================================================
// MODE POPUP — modale riche au clic sur ✴️ (fusion primo-tooltips + aide-contextuelle)
// ============================================================================

let popupListenersAttaches = false;

function rendreSectionAide(section) {
    switch (section.type) {
        case 'texte':
            return `<p class="aide-texte">${section.contenu}</p>`;
        case 'liste':
            const titreHTML = section.titre ? `<p class="aide-liste-titre"><strong>${section.titre}</strong></p>` : '';
            const itemsHTML = section.items.map(item => `<li>${item}</li>`).join('');
            return `${titreHTML}<ul class="aide-liste">${itemsHTML}</ul>`;
        case 'conseil':
            return `<div class="aide-conseil"><span class="aide-icone">💡</span><div class="aide-conseil-contenu">${section.contenu}</div></div>`;
        case 'exemple':
            const exTitre = section.titre ? `<strong>${section.titre}</strong><br>` : '';
            return `<div class="aide-exemple"><span class="aide-icone">📋</span><div class="aide-exemple-contenu">${exTitre}${section.contenu}</div></div>`;
        case 'alerte':
            const iconeA = section.niveau === 'important' ? '⚠️' : '⚡';
            const classeA = section.niveau === 'important' ? 'aide-alerte-important' : 'aide-alerte-attention';
            return `<div class="aide-alerte ${classeA}"><span class="aide-icone">${iconeA}</span><div class="aide-alerte-contenu">${section.contenu}</div></div>`;
        default:
            return `<p>${section.contenu || ''}</p>`;
    }
}

// Helper : obtenir la config popup d'une entrée (fallback sur window.AIDE_CONTEXTUELLE
// pour rétro-compat le temps que la migration async de aide-contextuelle-contenu.js
// se complète).
function obtenirPopup(cle) {
    const entree = CATALOGUE_ACCOMPAGNEMENT[cle];
    if (entree && entree.popup) return entree.popup;
    if (window.AIDE_CONTEXTUELLE && window.AIDE_CONTEXTUELLE[cle]) return window.AIDE_CONTEXTUELLE[cle];
    return null;
}

function rendreContenuAide(aide) {
    if (!aide) return '<p>Contenu non disponible.</p>';

    let sectionsHTML = aide.sections.map(rendreSectionAide).join('');

    // Enrichissement glossaire (termes soulignés dans le texte)
    try {
        sectionsHTML = enrichirTermesGlossaire(sectionsHTML);
    } catch (e) {
        console.warn('[Accompagnement/popup] Enrichissement glossaire non appliqué :', e);
    }

    let voirAussiHTML = '';
    if (aide.voirAussi && aide.voirAussi.length > 0) {
        const liens = aide.voirAussi
            .map(cle => {
                const ref = obtenirPopup(cle);
                if (!ref) return null;
                return `<button class="aide-lien-voir-aussi" data-aide="${cle}">${ref.titre}</button>`;
            })
            .filter(Boolean)
            .join('');
        if (liens) {
            voirAussiHTML = `<div class="aide-voir-aussi"><span class="aide-voir-aussi-label">Voir aussi :</span>${liens}</div>`;
        }
    }

    return sectionsHTML + voirAussiHTML;
}

function afficherAideContextuelle(cleAide) {
    const aide = obtenirPopup(cleAide);
    if (!aide) {
        console.warn(`[Accompagnement/popup] Aide non trouvée : ${cleAide}`);
        return;
    }

    let overlay = document.querySelector('.aide-contextuelle-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'aide-contextuelle-overlay primo-overlay';
        overlay.addEventListener('click', fermerAideContextuelle);
        document.body.appendChild(overlay);
    }

    let modal = document.querySelector('.aide-contextuelle-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'aide-contextuelle-modal primo-popup';
        document.body.appendChild(modal);
    }

    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'aide-ctx-titre');

    modal.innerHTML = `
        <div class="primo-popup-header">
            <span id="aide-ctx-titre" class="primo-popup-titre">✴️ ${aide.titre}</span>
            <button class="primo-popup-fermer" data-action="fermerAideContextuelle" aria-label="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
        </div>
        <div class="primo-popup-body aide-contextuelle-body">
            ${rendreContenuAide(aide)}
        </div>
    `;

    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const btnFermer = modal.querySelector('.primo-popup-fermer');
    if (btnFermer) btnFermer.focus();
    modal._declencheur = document.activeElement;
}

function fermerAideContextuelle() {
    const overlay = document.querySelector('.aide-contextuelle-overlay');
    const modal = document.querySelector('.aide-contextuelle-modal');
    const declencheur = modal && modal._declencheur;

    if (overlay) overlay.classList.remove('active');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';

    if (declencheur && typeof declencheur.focus === 'function') declencheur.focus();
}

// --- Popup Primo (déclenché par .primo-aide[data-target]) -------------------

function afficherPopupPrimo(contentHTML) {
    let overlay = document.getElementById('primo-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'primo-overlay';
        overlay.className = 'primo-overlay';
        overlay.setAttribute('data-close-on-bg', 'fermerPopupPrimo');
        document.body.appendChild(overlay);
    }

    let popup = document.getElementById('primo-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'primo-popup';
        popup.className = 'primo-popup';
        document.body.appendChild(popup);
    }

    popup.innerHTML = `
        <div class="primo-popup-header">
            <span><span class="primo-icon">✴️</span> Conseil</span>
            <button class="primo-popup-close" data-action="fermerPopupPrimo"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
        </div>
        <div class="primo-popup-body">
            ${contentHTML}
        </div>
    `;

    overlay.classList.add('active');
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fermerPopupPrimo() {
    const overlay = document.getElementById('primo-overlay');
    const popup = document.getElementById('primo-popup');
    if (overlay) overlay.classList.remove('active');
    if (popup) popup.classList.remove('active');
    document.body.style.overflow = '';
}

function fermerPopup() {
    fermerAideContextuelle();
    fermerPopupPrimo();
}

function gererClicPrimo(icone) {
    const targetId = icone.dataset.target;
    if (!targetId) {
        console.warn('[Accompagnement/popup] Pas de data-target sur l\'icône', icone);
        return;
    }
    const contenuElement = document.getElementById(targetId);
    if (!contenuElement) {
        console.warn('[Accompagnement/popup] Élément target non trouvé :', targetId);
        return;
    }
    afficherPopupPrimo(contenuElement.innerHTML);
}

function gererVisibilitePrimoSelonMode() {
    const afficher = prefTourActif() || prefAideActive();
    document.querySelectorAll('.primo-aide').forEach(icone => {
        if (typeof toggleDisplay === 'function') {
            toggleDisplay(icone, afficher);
        } else {
            icone.style.display = afficher ? '' : 'none';
        }
    });
}

function initialiserPopup() {
    if (popupListenersAttaches) {
        gererVisibilitePrimoSelonMode();
        return;
    }
    popupListenersAttaches = true;

    // .btn-aide-contextuelle[data-aide] et liens « Voir aussi »
    document.addEventListener('click', function(event) {
        const bouton = event.target.closest('.btn-aide-contextuelle');
        if (bouton) {
            event.preventDefault();
            event.stopPropagation();
            const cle = bouton.getAttribute('data-aide');
            if (cle) afficherAideContextuelle(cle);
            return;
        }
        const lienVoirAussi = event.target.closest('.aide-lien-voir-aussi');
        if (lienVoirAussi) {
            event.preventDefault();
            const nouvelleCle = lienVoirAussi.getAttribute('data-aide');
            if (nouvelleCle) afficherAideContextuelle(nouvelleCle);
            return;
        }
    });

    // .primo-aide[data-target] (délégation globale)
    document.addEventListener('click', function(event) {
        const icone = event.target.closest('.primo-aide');
        if (!icone) return;
        event.preventDefault();
        event.stopPropagation();
        gererClicPrimo(icone);
    });

    // Escape + focus trap
    document.addEventListener('keydown', function(event) {
        const modal = document.querySelector('.aide-contextuelle-modal.active');
        if (modal) {
            if (event.key === 'Escape') { fermerAideContextuelle(); return; }
            if (event.key === 'Tab') {
                const focusables = modal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
                if (focusables.length === 0) return;
                const premier = focusables[0];
                const dernier = focusables[focusables.length - 1];
                if (event.shiftKey && document.activeElement === premier) {
                    event.preventDefault();
                    dernier.focus();
                } else if (!event.shiftKey && document.activeElement === dernier) {
                    event.preventDefault();
                    premier.focus();
                }
            }
            return;
        }
        if (event.key === 'Escape') fermerPopupPrimo();
    });

    window.addEventListener('modeChanged', gererVisibilitePrimoSelonMode);

    gererVisibilitePrimoSelonMode();
}

// --- Bulle de découverte (petit helper de aide-contextuelle.js) --------------

function afficherBulleDecouverte({ cible, message, position = 'bas', duree = 8000 }) {
    const el = document.querySelector(cible);
    if (!el) return;
    const existante = document.querySelector('.bulle-decouverte');
    if (existante) existante.remove();

    const bulle = document.createElement('div');
    bulle.className = 'bulle-decouverte bulle-decouverte--' + position;
    bulle.innerHTML =
        '<span>' + message + '</span>' +
        '<button class="bulle-decouverte-fermer" aria-label="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>';

    bulle.querySelector('.bulle-decouverte-fermer').addEventListener('click', function() { bulle.remove(); });

    document.body.appendChild(bulle);
    const rect = el.getBoundingClientRect();
    bulle.style.position = 'fixed';
    bulle.style.zIndex = '9998';

    if (position === 'bas') {
        bulle.style.top = (rect.bottom + 8) + 'px';
        bulle.style.left = rect.left + 'px';
    } else if (position === 'haut') {
        bulle.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
        bulle.style.left = rect.left + 'px';
    } else if (position === 'droite') {
        bulle.style.top = rect.top + 'px';
        bulle.style.left = (rect.right + 8) + 'px';
    }

    setTimeout(function() { if (bulle.parentElement) bulle.remove(); }, duree);
}

// ============================================================================
// MODE TOUR — parcours guidé 6 étapes (ex-guidage.js)
// ============================================================================

const ETAPES_TOUR = [
    {
        id: 0,
        titre: 'Bienvenue',
        texte: "Labo Codex num\u00e9rise le travail que tu fais d\u00e9j\u00e0. Ce parcours te guide \u00e0 travers les \u00e9tapes essentielles. Tu peux le quitter \u00e0 tout moment et y revenir depuis les Pr\u00e9f\u00e9rences. Commence par configurer ton espace de travail dans R\u00e9glages.",
        actions: [
            { label: 'Aller aux R\u00e9glages', type: 'primaire', action: 'naviguerVers', param: 'contexte' },
            { label: 'Explorer seul\u00b7e',     type: 'secondaire', action: 'passerEtape' }
        ],
        correspond: function(idSousSection) { return !idSousSection || idSousSection === 'accueil'; }
    },
    {
        id: 1,
        titre: 'R\u00e9glages',
        texte: "C'est ici que tu poses les fondations\u00a0: ton trimestre (dates, cong\u00e9s), ton cours (comp\u00e9tence, \u00e9l\u00e9ments), ton groupe d'\u00e9tudiant\u00b7es et ton horaire. Ce sont les m\u00eames informations que dans ton plan de cours. Tu les saisis une fois et l'application g\u00e9n\u00e8re automatiquement le calendrier de tes s\u00e9ances.\n\nLes ic\u00f4nes \ud83d\udccd t'en disent plus sur chaque section. Quand ton groupe-cours est assembl\u00e9, tu es pr\u00eat\u00b7e pour la suite.",
        actions: [
            { label: "J'ai compris",      type: 'primaire', action: 'avancerEtape' },
            { label: 'Passer cette \u00e9tape', type: 'secondaire', action: 'passerEtape' }
        ],
        correspond: function(idSousSection) {
            return typeof idSousSection === 'string' && idSousSection.indexOf('contexte-') === 0;
        }
    },
    {
        id: 2,
        titre: 'Structure',
        texte: "Tu construis ici tes outils d'\u00e9valuation \u2014 les m\u00eames que sur papier, mais r\u00e9utilisables. Les productions d\u00e9finissent les occasions d'apprentissage de tes \u00e9tudiant\u00b7es. Les grilles fixent tes crit\u00e8res. Les \u00e9chelles \u00e9tablissent les niveaux de performance. Les cartouches pr\u00e9parent la r\u00e9troaction. La pratique assemble le tout.\n\nL'ordre n'est pas impos\u00e9, mais les productions et les grilles sont un bon point de d\u00e9part.",
        actions: [
            { label: "J'ai compris",      type: 'primaire', action: 'avancerEtape' },
            { label: 'Passer cette \u00e9tape', type: 'secondaire', action: 'passerEtape' }
        ],
        correspond: function(idSousSection) {
            if (typeof idSousSection !== 'string') return false;
            const structureConception = ['structure-productions', 'structure-grille-criteres', 'structure-echelle-performance', 'structure-retroactions'];
            return structureConception.indexOf(idSousSection) !== -1;
        }
    },
    {
        id: 3,
        titre: '\u00c9valuations',
        texte: "C'est le geste quotidien\u00a0: tu s\u00e9lectionnes une production, tu attribues un niveau \u00e0 chaque crit\u00e8re et la r\u00e9troaction se construit au fur et \u00e0 mesure. Tu peux importer les copies de tes \u00e9tudiant\u00b7es (PDF ou images), les annoter avec des tampons / estampes ou des codes, puis les \u00e9valuer \u2014 tout sur le m\u00eame document.\n\nLes jetons (D\u00e9lai, Reprise, Reprise cibl\u00e9e) offrent \u00e0 l'\u00e9tudiant\u00b7e une nouvelle occasion de d\u00e9montrer sa comp\u00e9tence.",
        actions: [
            { label: "J'ai compris",      type: 'primaire', action: 'avancerEtape' },
            { label: 'Passer cette \u00e9tape', type: 'secondaire', action: 'passerEtape' }
        ],
        correspond: function(idSousSection) {
            return typeof idSousSection === 'string' && idSousSection.indexOf('evaluations-') === 0;
        }
    },
    {
        id: 4,
        titre: 'Tableau de bord',
        texte: "Le tableau de bord te montre ce que tu ne verrais pas facilement sur papier\u00a0: le portrait de ton groupe en un coup d'\u0153il. Les indices Assiduit\u00e9 (A), Compl\u00e9tion (C) et Performance (P) r\u00e9sument le contexte d'apprentissage observ\u00e9 de chaque \u00e9tudiant\u00b7e. Les zones de couleur t'aident \u00e0 rep\u00e9rer qui a besoin d'attention.\n\nExplore les quatre vues\u00a0: aper\u00e7u, liste, profil individuel et interventions R\u00e0I.",
        actions: [
            { label: "J'ai compris",      type: 'primaire', action: 'avancerEtape' },
            { label: 'Passer cette \u00e9tape', type: 'secondaire', action: 'passerEtape' }
        ],
        correspond: function(idSousSection) {
            if (idSousSection === 'apercu' || idSousSection === 'accueil-apercu') return true;
            return typeof idSousSection === 'string' && idSousSection.indexOf('suivi-') === 0;
        }
    },
    {
        id: 5,
        titre: 'Planification (optionnelle)',
        texte: "La carte mentale rend visible l'alignement p\u00e9dagogique de ton cours\u00a0: ce que tu vises, comment tu l'enseignes et comment tu le v\u00e9rifies. L'organisateur structure tes le\u00e7ons sur les 15 semaines du trimestre. Ce module est compl\u00e9mentaire. Tu peux l'explorer quand tu te sens \u00e0 l'aise avec les autres sections.",
        actions: [
            { label: 'Terminer le parcours', type: 'primaire',   action: 'terminerTour' },
            { label: 'Relancer plus tard',   type: 'secondaire', action: 'terminerTour' }
        ],
        correspond: function(idSousSection) {
            return idSousSection === 'structure-carte' || idSousSection === 'structure-organisateur';
        }
    }
];

// Phase 4 : publier les 6 étapes dans le catalogue unifié sous mode `tour`.
// La clé est `tour-etape-<id>`. L'orchestration continue d'utiliser le tableau
// ETAPES_TOUR ci-dessus (accès indexé), mais le catalogue expose maintenant
// ces entrées à `window.accompagnement.catalogue` pour cohérence.
ETAPES_TOUR.forEach(function(etape) {
    const obj = {};
    obj['tour-etape-' + etape.id] = { tour: etape };
    ajouterEntrees(obj);
});

const ID_PANNEAU_TOUR = 'panneau-tour-guide';

function tourObtenirEtape() {
    const v = lirePref('tourGuide_etape', null);
    return typeof v === 'number' ? v : null;
}

function tourDefinirEtape(valeur) { ecrirePref('tourGuide_etape', valeur); }
function tourEstComplete() { return lirePref('tourGuide_complete', false) === true; }
function tourMarquerComplete(valeur) { ecrirePref('tourGuide_complete', !!valeur); }

function tourObtenirEtapesVues() {
    const v = lirePref('tourGuide_etapes_vues', []);
    return Array.isArray(v) ? v.slice() : [];
}

function tourMarquerEtapeVue(idEtape) {
    const vues = tourObtenirEtapesVues();
    if (vues.indexOf(idEtape) === -1) {
        vues.push(idEtape);
        ecrirePref('tourGuide_etapes_vues', vues);
    }
}

function fermerPanneauTour() {
    const el = document.getElementById(ID_PANNEAU_TOUR);
    if (el && el.parentNode) el.parentNode.removeChild(el);
}

function afficherPanneauEtape(etape) {
    fermerPanneauTour();

    const panneau = document.createElement('div');
    panneau.id = ID_PANNEAU_TOUR;
    panneau.className = 'panneau-tour-guide';
    panneau.setAttribute('role', 'dialog');
    panneau.setAttribute('aria-label', 'Parcours guid\u00e9');

    const header = document.createElement('div');
    header.className = 'tour-header';

    const titre = document.createElement('span');
    titre.className = 'tour-titre';
    titre.textContent = etape.titre;
    header.appendChild(titre);

    const progression = document.createElement('span');
    progression.className = 'tour-progression';
    progression.setAttribute('aria-label', '\u00c9tape ' + (etape.id + 1) + ' sur ' + ETAPES_TOUR.length);
    for (let i = 0; i < ETAPES_TOUR.length; i++) {
        const dot = document.createElement('span');
        dot.className = 'tour-dot' + (i === etape.id ? ' actif' : (i < etape.id ? ' vu' : ''));
        progression.appendChild(dot);
    }
    header.appendChild(progression);

    const btnFermer = document.createElement('button');
    btnFermer.className = 'tour-fermer';
    btnFermer.type = 'button';
    btnFermer.setAttribute('aria-label', 'Fermer le parcours guid\u00e9');
    btnFermer.textContent = '\u2715';
    btnFermer.addEventListener('click', quitterTourGuide);
    header.appendChild(btnFermer);

    panneau.appendChild(header);

    const corps = document.createElement('div');
    corps.className = 'tour-corps';
    etape.texte.split('\n\n').forEach(function(par) {
        const p = document.createElement('p');
        p.textContent = par;
        corps.appendChild(p);
    });
    panneau.appendChild(corps);

    const actions = document.createElement('div');
    actions.className = 'tour-actions';
    etape.actions.forEach(function(a) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tour-btn btn ' + (a.type === 'primaire' ? 'btn-primaire' : 'btn-secondaire');
        btn.textContent = a.label;
        btn.addEventListener('click', function() { executerActionTour(a); });
        actions.appendChild(btn);
    });
    panneau.appendChild(actions);

    document.body.appendChild(panneau);

    requestAnimationFrame(function() { panneau.classList.add('visible'); });
}

function executerActionTour(a) {
    const etape = tourEtapeCourante();
    switch (a.action) {
        case 'naviguerVers':
            if (etape) tourMarquerEtapeVue(etape.id);
            if (typeof afficherSection === 'function' && a.param) afficherSection(a.param);
            fermerPanneauTour();
            if (etape) tourDefinirEtape(etape.id + 1);
            break;
        case 'avancerEtape':
            avancerEtape();
            break;
        case 'passerEtape':
            passerEtape();
            break;
        case 'terminerTour':
            terminerTour();
            break;
        default:
            console.warn('[Accompagnement/tour] Action inconnue :', a.action);
    }
}

function tourEtapeCourante() {
    const i = tourObtenirEtape();
    if (i === null || i < 0 || i >= ETAPES_TOUR.length) return null;
    return ETAPES_TOUR[i];
}

function avancerEtape() {
    const courante = tourEtapeCourante();
    if (!courante) return;
    tourMarquerEtapeVue(courante.id);
    fermerPanneauTour();
    const prochaine = courante.id + 1;
    if (prochaine >= ETAPES_TOUR.length) { terminerTour(); return; }
    tourDefinirEtape(prochaine);
}

function passerEtape() {
    const courante = tourEtapeCourante();
    if (!courante) return;
    tourMarquerEtapeVue(courante.id);
    fermerPanneauTour();
    const prochaine = courante.id + 1;
    if (prochaine >= ETAPES_TOUR.length) terminerTour();
    else tourDefinirEtape(prochaine);
}

function terminerTour() {
    fermerPanneauTour();
    tourMarquerComplete(true);
    tourDefinirEtape(null);
}

function quitterTourGuide() {
    fermerPanneauTour();
    tourMarquerComplete(true);
    tourDefinirEtape(null);
}

function demarrerTourGuide() {
    tourDefinirEtape(0);
    tourMarquerComplete(false);
    ecrirePref('tourGuide_etapes_vues', []);

    // Activer les couches complémentaires
    if (typeof definirTourGuide === 'function') definirTourGuide(true);
    definirTooltips(true);
    if (typeof definirAideContextuelle === 'function') definirAideContextuelle(true);

    afficherPanneauEtape(ETAPES_TOUR[0]);
}

function relancerTourGuide() { demarrerTourGuide(); }

function verifierDeclenchementAuto(idSousSection) {
    if (tourEstComplete()) return;
    const idxEtape = tourObtenirEtape();
    if (idxEtape === null) return;
    const etape = ETAPES_TOUR[idxEtape];
    if (!etape) return;

    const vues = tourObtenirEtapesVues();
    if (vues.indexOf(etape.id) !== -1) return;

    if (etape.correspond(idSousSection)) afficherPanneauEtape(etape);
}

let _tourInitialise = false;
function initialiserTour() {
    if (_tourInitialise) return;
    _tourInitialise = true;
    window.addEventListener('sectionAffichee', function(e) {
        const id = e && e.detail && e.detail.idSousSection;
        setTimeout(function() { verifierDeclenchementAuto(id); }, 300);
    });
}

// ============================================================================
// MODE TERME — micro-popup inline sur terme souligné (ex-glossaire.js)
// ============================================================================

const ID_MICROPOPUP = 'glossaire-micropopup';
const ETAPE_LIBELLES = {
    'numerisation': 'Num\u00e9risation',
    'croisement':   'Croisement',
    'observation':  'Observation',
    'competence':   'Comp\u00e9tence',
    'transversal':  'Pratiques de notation',
    'interface':    'Interface'
};
let _etapeFiltre = '';
let _regexEnrichissement = null;
let _glossaireInitialise = false;
let _glossaireRenduAideFait = false;

function glossaireDict() {
    return (typeof window !== 'undefined' && window.GLOSSAIRE) || {};
}

function resumeDefinition(definition) {
    if (!definition) return '';
    const m = definition.match(/^([^.!?]*[.!?])(\s|$)/);
    return (m ? m[1] : definition).trim();
}

function fermerMicroPopupGlossaire() {
    const el = document.getElementById(ID_MICROPOPUP);
    if (el && el.parentNode) el.parentNode.removeChild(el);
}

function afficherMicroPopupGlossaire(terme, cible) {
    fermerMicroPopupGlossaire();

    const popup = document.createElement('div');
    popup.id = ID_MICROPOPUP;
    popup.className = 'glossaire-micropopup';
    popup.setAttribute('role', 'tooltip');

    const titre = document.createElement('div');
    titre.className = 'glossaire-micropopup-titre';
    titre.textContent = terme.terme;
    popup.appendChild(titre);

    const resume = document.createElement('div');
    resume.className = 'glossaire-micropopup-resume';
    resume.textContent = resumeDefinition(terme.definition);
    popup.appendChild(resume);

    const actions = document.createElement('div');
    actions.className = 'glossaire-micropopup-actions';

    const lien = document.createElement('button');
    lien.type = 'button';
    lien.className = 'glossaire-lien-ensavoirplus';
    lien.textContent = 'En savoir plus';
    lien.addEventListener('click', function(e) {
        e.stopPropagation();
        fermerMicroPopupGlossaire();
        afficherTermeGlossaire(terme.cle);
    });
    actions.appendChild(lien);

    const btnFermer = document.createElement('button');
    btnFermer.type = 'button';
    btnFermer.className = 'glossaire-micropopup-fermer';
    btnFermer.setAttribute('aria-label', 'Fermer');
    btnFermer.textContent = '\u2715';
    btnFermer.addEventListener('click', function(e) {
        e.stopPropagation();
        fermerMicroPopupGlossaire();
    });
    actions.appendChild(btnFermer);

    popup.appendChild(actions);
    document.body.appendChild(popup);
    positionnerProcheGlossaire(popup, cible);

    requestAnimationFrame(function() { popup.classList.add('visible'); });
}

function positionnerProcheGlossaire(popup, cible) {
    if (!cible) return;
    const rect = cible.getBoundingClientRect();
    const pw = popup.offsetWidth || 320;
    const ph = popup.offsetHeight || 140;
    const marge = 8;
    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + marge;

    const maxLeft = window.scrollX + document.documentElement.clientWidth - pw - marge;
    if (left > maxLeft) left = maxLeft;
    if (left < window.scrollX + marge) left = window.scrollX + marge;

    const maxBottom = window.scrollY + document.documentElement.clientHeight - marge;
    if (top + ph > maxBottom) top = rect.top + window.scrollY - ph - marge;

    popup.style.left = Math.round(left) + 'px';
    popup.style.top = Math.round(top) + 'px';
}

function listerTermesTries() {
    const dict = glossaireDict();
    return Object.keys(dict).map(k => dict[k]).sort((a, b) => a.terme.localeCompare(b.terme, 'fr'));
}

function rendreListeComplete(conteneur) {
    conteneur.innerHTML = '';
    conteneur.className = (conteneur.className || '') + ' glossaire-page';

    const barre = document.createElement('div');
    barre.className = 'glossaire-filtres';

    const boutons = [['', 'Tous']];
    Object.keys(ETAPE_LIBELLES).forEach(k => boutons.push([k, ETAPE_LIBELLES[k]]));

    boutons.forEach(function(b) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'glossaire-filtre' + (b[0] === _etapeFiltre ? ' actif' : '');
        btn.setAttribute('data-etape', b[0]);
        btn.textContent = b[1];
        btn.addEventListener('click', function() {
            _etapeFiltre = b[0];
            rendreListeComplete(conteneur);
        });
        barre.appendChild(btn);
    });
    conteneur.appendChild(barre);

    const liste = document.createElement('div');
    liste.className = 'glossaire-liste';

    let termes = listerTermesTries();
    if (_etapeFiltre) termes = termes.filter(t => t.etape === _etapeFiltre);

    if (termes.length === 0) {
        const vide = document.createElement('p');
        vide.className = 'glossaire-vide';
        vide.textContent = 'Aucun terme dans cette cat\u00e9gorie.';
        liste.appendChild(vide);
    } else {
        termes.forEach(t => liste.appendChild(creerFicheGlossaire(t)));
    }
    conteneur.appendChild(liste);
}

function creerFicheGlossaire(t) {
    const fiche = document.createElement('article');
    fiche.className = 'glossaire-fiche';
    fiche.id = 'glossaire-' + t.cle;

    const enTete = document.createElement('header');
    enTete.className = 'glossaire-fiche-entete';

    const h = document.createElement('h3');
    h.className = 'glossaire-fiche-terme';
    h.textContent = t.terme;
    enTete.appendChild(h);

    const meta = document.createElement('div');
    meta.className = 'glossaire-fiche-meta';
    if (t.categorie) {
        const cat = document.createElement('span');
        cat.className = 'glossaire-fiche-categorie';
        cat.textContent = t.categorie;
        meta.appendChild(cat);
    }
    if (t.etape && ETAPE_LIBELLES[t.etape]) {
        const et = document.createElement('span');
        et.className = 'glossaire-fiche-etape glossaire-fiche-etape-' + t.etape;
        et.textContent = ETAPE_LIBELLES[t.etape];
        meta.appendChild(et);
    }
    enTete.appendChild(meta);
    fiche.appendChild(enTete);

    const corps = document.createElement('div');
    corps.className = 'glossaire-fiche-definition';
    t.definition.split(/\n\n+/).forEach(function(p) {
        const pEl = document.createElement('p');
        pEl.textContent = p.trim();
        corps.appendChild(pEl);
    });
    fiche.appendChild(corps);

    if (t.voir) {
        const voir = document.createElement('div');
        voir.className = 'glossaire-fiche-voir';
        voir.innerHTML = '<strong>Voir\u00a0:</strong> ' + echapper(t.voir);
        fiche.appendChild(voir);
    }
    return fiche;
}

function afficherTermeGlossaire(cle) {
    const t = glossaireDict()[cle];
    if (!t) return;
    if (typeof afficherSection === 'function') afficherSection('aide');
    setTimeout(function() {
        const fiche = document.getElementById('glossaire-' + cle);
        if (fiche) {
            fiche.scrollIntoView({ behavior: 'smooth', block: 'start' });
            fiche.classList.add('glossaire-fiche-active');
            setTimeout(function() { fiche.classList.remove('glossaire-fiche-active'); }, 1600);
        }
    }, 150);
}

function afficherDansConteneurGlossaire(conteneur) {
    if (typeof conteneur === 'string') conteneur = document.getElementById(conteneur);
    if (!conteneur) return;
    rendreListeComplete(conteneur);
}

function regexEnrichissement() {
    if (_regexEnrichissement) return _regexEnrichissement;
    const dict = glossaireDict();
    const termes = Object.keys(dict).map(k => dict[k].terme);
    termes.sort((a, b) => b.length - a.length);
    const escaped = termes.map(t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    _regexEnrichissement = new RegExp('(' + escaped.join('|') + ')', 'gi');
    return _regexEnrichissement;
}

function trouverCleParTerme(termeCandidat) {
    const dict = glossaireDict();
    const cible = termeCandidat.toLowerCase();
    const keys = Object.keys(dict);
    for (let i = 0; i < keys.length; i++) {
        if (dict[keys[i]].terme.toLowerCase() === cible) return keys[i];
    }
    return null;
}

function enrichirTermesGlossaire(html) {
    if (typeof html !== 'string' || !html) return html;
    const regex = regexEnrichissement();
    const vus = {};
    return html.replace(regex, function(match) {
        const cle = trouverCleParTerme(match);
        if (!cle || vus[cle]) return match;
        vus[cle] = true;
        return '<span class="glossaire-terme" data-glossaire="' + cle + '" role="button" tabindex="0">' + match + '</span>';
    });
}

function initialiserTerme() {
    if (_glossaireInitialise) return;
    _glossaireInitialise = true;

    document.addEventListener('click', function(e) {
        const terme = e.target.closest('[data-glossaire]');
        if (terme) {
            e.preventDefault();
            e.stopPropagation();
            const cle = terme.getAttribute('data-glossaire');
            const entree = glossaireDict()[cle];
            if (entree) afficherMicroPopupGlossaire(entree, terme);
            return;
        }
        const popup = e.target.closest('#' + ID_MICROPOPUP);
        if (!popup) fermerMicroPopupGlossaire();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { fermerMicroPopupGlossaire(); return; }
        if (e.key === 'Enter' || e.key === ' ') {
            const terme = e.target.closest && e.target.closest('[data-glossaire]');
            if (terme) {
                e.preventDefault();
                const cle = terme.getAttribute('data-glossaire');
                const entree = glossaireDict()[cle];
                if (entree) afficherMicroPopupGlossaire(entree, terme);
            }
        }
    });

    window.addEventListener('sectionAffichee', function(e) {
        const id = e && e.detail && e.detail.idSousSection;
        if (id !== 'aide-reference') return;
        setTimeout(function() {
            const conteneur = document.getElementById('glossaire-rendu');
            if (conteneur && !_glossaireRenduAideFait) {
                afficherDansConteneurGlossaire(conteneur);
                _glossaireRenduAideFait = true;
            }
        }, 150);
    });
}

// ============================================================================
// API PUBLIQUE + ALIAS RÉTRO-COMPAT
// ============================================================================

window.accompagnement = {
    // Core
    estActif: estAccompagnementActif,
    definirActif: definirAccompagnementActif,
    masquerTout: masquerTout,
    reinitialiserVue: reinitialiserVue,
    ajouterEntrees: ajouterEntrees,
    obtenirEntree: obtenirEntree,
    catalogue: CATALOGUE_ACCOMPAGNEMENT,

    // Hover
    afficherHover: afficherHover,
    masquerHover: masquerHover,

    // Auto-reveal
    afficherFleche: afficherAutoReveal,
    masquerFleche: masquerAutoReveal,

    // Popup
    afficherAide: afficherAideContextuelle,
    fermerAide: fermerAideContextuelle,
    afficherPopupPrimo: afficherPopupPrimo,
    fermerPopupPrimo: fermerPopupPrimo,

    // Tour
    demarrerTour: demarrerTourGuide,
    quitterTour: quitterTourGuide,
    terminerTour: terminerTour,
    etapesTour: ETAPES_TOUR,

    // Terme / glossaire
    afficherTerme: afficherTermeGlossaire,
    afficherDansConteneur: afficherDansConteneurGlossaire,
    afficherMicroPopup: afficherMicroPopupGlossaire,
    fermerMicroPopup: fermerMicroPopupGlossaire,
    enrichirTermesGlossaire: enrichirTermesGlossaire,
    listerTermesTries: listerTermesTries
};

// ---- Alias rétro-compat (Phase 1-5, retirés en Phase 6) ---------------------

window.tooltips = { afficher: afficherHover, masquer: masquerHover };
window.definirTooltips = definirTooltips;

// Vue dérivée : entrées avec autoReveal uniquement (compat window.flechesDidactiques.catalogue)
function _catalogueFlechesDerive() {
    const vue = {};
    for (const id in CATALOGUE_ACCOMPAGNEMENT) {
        const ar = CATALOGUE_ACCOMPAGNEMENT[id].autoReveal;
        if (ar) vue[id] = ar;
    }
    return vue;
}
window.flechesDidactiques = {
    afficher: afficherAutoReveal,
    masquerActive: masquerAutoReveal,
    reinitialiser: reinitialiserVue,
    estActif: prefFlechesActives,
    definirActif: definirFlechesActives,
    get catalogue() { return _catalogueFlechesDerive(); }
};
window.masquerFlecheDidactique = fermerEtMarquerAutoReveal;

window.afficherPopupPrimo = afficherPopupPrimo;
window.fermerPopupPrimo = fermerPopupPrimo;
window.initialiserPrimoTooltips = initialiserPopup;
window.gererVisibilitePrimoSelonMode = gererVisibilitePrimoSelonMode;

window.afficherAideContextuelle = afficherAideContextuelle;
window.fermerAideContextuelle = fermerAideContextuelle;
window.initialiserAideContextuelle = initialiserPopup;
window.afficherBulleDecouverte = afficherBulleDecouverte;

window.glossaire = {
    afficherTerme: afficherTermeGlossaire,
    afficherDansConteneur: afficherDansConteneurGlossaire,
    afficherMicroPopup: afficherMicroPopupGlossaire,
    fermerMicroPopup: fermerMicroPopupGlossaire,
    enrichirTermesGlossaire: enrichirTermesGlossaire,
    listerTermesTries: listerTermesTries
};

window.demarrerTourGuide = demarrerTourGuide;
window.relancerTourGuide = relancerTourGuide;
window.quitterTourGuide = quitterTourGuide;
window.terminerTour = terminerTour;
window.demarrerGuidageConfiguration = demarrerTourGuide;   // Compat ancien wizard
window.arreterGuidage = quitterTourGuide;
window.etapeSuivante = avancerEtape;
window.initialiserGuidage = initialiserTour;
window.tourGuide = {
    ETAPES_TOUR: ETAPES_TOUR,
    afficherPanneauEtape: afficherPanneauEtape,
    etapeCourante: tourEtapeCourante
};

// ============================================================================
// INITIALISATION
// ============================================================================

function initialiserTout() {
    migrerPersistance();
    initialiserHover();
    initialiserAutoReveal();
    initialiserPopup();
    initialiserTour();
    initialiserTerme();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserTout);
} else {
    initialiserTout();
}

})();
