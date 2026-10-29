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
 * Catalogue central CATALOGUE_ACCOMPAGNEMENT peuplé par 3 fichiers de contenu
 * chargés après ce moteur :
 *   - js/accompagnement-contenu-hover.js   (~283 entrées mode hover)
 *   - js/accompagnement-contenu-popup.js   (~40 entrées mode popup)
 *   - js/accompagnement-contenu-terme.js   (48 entrées mode terme)
 * Les entrées mode autoReveal et tour sont déclarées directement ici.
 *
 * Rétrocompatibilité :
 *   - Les attributs HTML existants (~220 usages : data-tooltip, data-aide,
 *     data-target, data-glossaire) fonctionnent sans modification.
 *   - Globals conservés pour le dispatcher data-action de main.js :
 *     masquerFlecheDidactique, fermerPopupPrimo, fermerAideContextuelle,
 *     demarrerTourGuide.
 *   - API sémantique : window.afficherAideContextuelle (ouverture par clé).
 *   - Toute autre API passe par window.accompagnement.*
 *   - Les flags localStorage fleche-vue__* sont migrés vers accompagnement-vu__*
 *     au premier chargement (flag accompagnement-migration-v1).
 *   - Les 4 anciennes prefs (tooltips, aideContextuelle, tourGuide,
 *     flechesDidactiquesActives) sont consolidées dans `accompagnementActif`
 *     (flag accompagnement-pref-migration-v2). La valeur migrée reprend la
 *     formule historique : true ssi les 4 étaient actifs.
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
const CLE_MIGRATION_PREF = 'accompagnement-pref-migration-v2';

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

// Migration idempotente des 4 anciennes prefs (tooltips, aideContextuelle,
// tourGuide, flechesDidactiquesActives localStorage) vers la pref unique
// accompagnementActif. Ne s'exécute qu'une seule fois par utilisateur.
function migrerPrefAccompagnement() {
    try {
        if (lireFlag(CLE_MIGRATION_PREF)) return;
        const raw = localStorage.getItem('preferencesUtilisateur');
        if (!raw) {
            // Pas de prefs existantes = nouvel utilisateur. Default true via DEFAUTS.
            ecrireFlag(CLE_MIGRATION_PREF, true);
            return;
        }
        const stored = JSON.parse(raw);
        if (!('accompagnementActif' in stored)) {
            // Reprend la formule de l'ancien accompagnementEstActif d'accueil.js :
            // l'accompagnement était actif uniquement si les 4 sous-systèmes l'étaient.
            const tour = !!stored.tourGuide;
            const tooltips = stored.tooltips !== false;
            const aide = stored.aideContextuelle !== false;
            let fleches = true;
            try { fleches = localStorage.getItem('flechesDidactiquesActives') !== '0'; } catch (e) {}
            stored.accompagnementActif = tour && tooltips && aide && fleches;
            localStorage.setItem('preferencesUtilisateur', JSON.stringify(stored));
        }
        ecrireFlag(CLE_MIGRATION_PREF, true);
    } catch (e) {
        console.warn('[Accompagnement] migration pref v2 ignorée :', e.message || e);
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

// Préférence unique depuis le 20 avril 2026. Les 4 sous-systèmes (tooltips
// hover, aide popup, flèches autoReveal, visite guidée) partagent cette pref.
function estAccompagnementActif() {
    return lirePref('accompagnementActif', true) !== false;
}

function definirAccompagnementActif(actif) {
    const bool = !!actif;
    ecrirePref('accompagnementActif', bool);
    // Classes body qui contrôlent la visibilité CSS des .btn-aide-contextuelle
    // et .primo-aide (voir accompagnement.css).
    document.body.classList.toggle('tour-guide-actif', bool);
    document.body.classList.toggle('aide-contextuelle-active', bool);
    if (!bool) masquerTout();
    // Notifier les modules qui écoutent (primo visibility, etc.)
    window.dispatchEvent(new Event('modeChanged'));
}

// Accès granulaire conservé comme alias (tous retournent l'état unifié).
// Simplifie la conversion des call sites existants sans diff inutile.
function prefTooltipsActive() { return estAccompagnementActif(); }
function prefAideActive()     { return estAccompagnementActif(); }
function prefTourActif()      { return estAccompagnementActif(); }
function prefFlechesActives() { return estAccompagnementActif(); }

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

    // Multi-trigger (§7.6 du plan) : si l'entrée n'a pas de `.hover` explicite
    // mais a un `autoReveal.message`, on l'utilise en mode hover. Permet qu'une
    // flèche didactique déjà dismiss reste consultable au long-press / survol.
    const entree = CATALOGUE_ACCOMPAGNEMENT[cle];
    const texte = entree && (entree.hover || (entree.autoReveal && entree.autoReveal.message));
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


// ============================================================================
// MODE AUTO-REVEAL — flèche-pointeur sur sectionAffichee (ex-fleches-didactiques.js)
// ============================================================================

// Les 7 flèches didactiques : peuplées directement dans le catalogue unifié.
ajouterEntrees({
    'contexte-pratiques-nouvelle': {
        autoReveal: {
            sectionActive: 'conception-pratiques-notation',
            cibleSelector: 'button[data-action="creerNouvellePratique"]',
            message: 'Clique ici pour créer ta première pratique de notation.',
            direction: 'haut',
            priorite: 10,
            condition: function() {
                var locales = (db.getSync(cle('pratiquesConfigurables'), null) || [] || [])
                    .filter(function(p) { return p.dansBibliotheque !== false; });
                return locales.length === 0;
            }
        }
    },
    'conception-grilles-nouvelle': {
        autoReveal: {
            sectionActive: 'conception-grille-criteres',
            cibleSelector: 'button[data-action="creerNouvelleGrille"]',
            message: 'Clique ici pour créer ta première grille de critères.',
            direction: 'haut',
            priorite: 10,
            condition: function() {
                var locales = (db.getSync(cle('grillesTemplates'), []) || [])
                    .filter(function(g) { return g.dansBibliotheque !== false; });
                return locales.length === 0;
            }
        }
    },
    'conception-echelles-nouvelle': {
        autoReveal: {
            sectionActive: 'conception-echelle-performance',
            cibleSelector: 'button[data-action="creerNouvelleEchelle"]',
            message: 'Clique ici pour créer ta première échelle de performance.',
            direction: 'haut',
            priorite: 10,
            condition: function() {
                var locales = (db.getSync(cle('echellesTemplates'), []) || [])
                    .filter(function(e) { return e.dansBibliotheque !== false; });
                return locales.length === 0;
            }
        }
    },
    'conception-cartouches-nouvelle': {
        autoReveal: {
            sectionActive: 'conception-retroactions',
            cibleSelector: 'button[data-action="creerNouvelleCartouche"]',
            message: 'Clique ici pour créer ta première cartouche de rétroaction.',
            direction: 'haut',
            priorite: 10,
            condition: function() {
                // cartouches stockées par grille (clé `cartouches_<grilleId>`) : on teste si
                // au moins une cartouche locale existe pour une grille quelconque
                var grilles = db.getSync(cle('grillesTemplates'), []) || [];
                for (var i = 0; i < grilles.length; i++) {
                    var cs = db.getSync(cle('cartouches_' + grilles[i].id), []) || [];
                    if (cs.length > 0) return false;
                }
                return true;
            }
        }
    },
    'conception-productions-nouvelle': {
        autoReveal: {
            sectionActive: 'conception-productions',
            cibleSelector: 'button[data-action="creerNouvelleProduction"]',
            message: 'Clique ici pour créer ta première production étudiante.',
            direction: 'haut',
            priorite: 10,
            condition: function() {
                if (typeof cle !== 'function') return true;
                var prods = (db.getSync(cle('productions'), []) || [])
                    .filter(function(p) { return p.dansBibliotheque !== false; });
                return prods.length === 0;
            }
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

    // Condition optionnelle : la flèche ne s'affiche que si elle retourne true.
    // Utile pour « première X » qui doit disparaître dès qu'un item existe.
    if (typeof entree.condition === 'function') {
        try {
            if (!entree.condition()) return;
        } catch (e) {
            console.warn('[Accompagnement/flèches] Erreur condition :', id, e);
            return;
        }
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

// Tagge les cibles des autoReveal de la section courante avec data-tooltip
// pour permettre le multi-trigger (§7.6) : même après dismiss de la flèche,
// un hover / long-press sur la cible affichera la même aide en mode bulle
// sobre. Léger délai pour laisser le DOM se stabiliser.
function taggerCiblesAutoReveal(idSousSection) {
    setTimeout(function() {
        for (const id in CATALOGUE_ACCOMPAGNEMENT) {
            const ar = CATALOGUE_ACCOMPAGNEMENT[id].autoReveal;
            if (!ar || ar.sectionActive !== idSousSection || !ar.cibleSelector) continue;
            let targets;
            try { targets = document.querySelectorAll(ar.cibleSelector); } catch (e) { continue; }
            targets.forEach(function(t) {
                if (!t.dataset.tooltip) t.dataset.tooltip = id;
            });
        }
    }, AUTO_DELAI_STABILISATION);
}

let _autoRevealInitialise = false;
function initialiserAutoReveal() {
    if (_autoRevealInitialise) return;
    _autoRevealInitialise = true;
    window.addEventListener('sectionAffichee', function(ev) {
        const idSousSection = ev.detail && ev.detail.idSousSection;
        if (!idSousSection) return;

        if (autoFlecheActive) masquerAutoReveal();

        // Multi-trigger : tagguer les cibles de cette section qu'une flèche
        // soit vue ou non, pour que l'aide reste consultable au hover.
        taggerCiblesAutoReveal(idSousSection);

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
// MODE POPUP — modale riche au clic sur l'icône info (fusion primo-tooltips + aide-contextuelle)
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
            return `<div class="aide-conseil"><span class="aide-icone"><span class="icone-inline icone-inline--lightbulb" aria-hidden="true"></span></span><div class="aide-conseil-contenu">${section.contenu}</div></div>`;
        case 'exemple':
            const exTitre = section.titre ? `<strong>${section.titre}</strong><br>` : '';
            return `<div class="aide-exemple"><span class="aide-icone">📋</span><div class="aide-exemple-contenu">${exTitre}${section.contenu}</div></div>`;
        case 'alerte':
            const iconeA = section.niveau === 'important' ? '⚠️' : '⚡';
            const classeA = section.niveau === 'important' ? 'aide-alerte-important' : 'aide-alerte-attention';
            return `<div class="aide-alerte ${classeA}"><span class="aide-icone">${iconeA}</span><div class="aide-alerte-contenu">${section.contenu}</div></div>`;
        case 'action':
            return `<div class="aide-action"><button class="btn btn-principal" data-action="${section.action}"${section.param ? ` data-param="${section.param}"` : ''}>${section.libelle}</button></div>`;
        default:
            return `<p>${section.contenu || ''}</p>`;
    }
}

function obtenirPopup(cle) {
    const entree = CATALOGUE_ACCOMPAGNEMENT[cle];
    return (entree && entree.popup) || null;
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
            <span id="aide-ctx-titre" class="primo-popup-titre"><span class="icone-info-aide taille-inline" aria-hidden="true"></span> ${typeof echapperHtml === 'function' ? echapperHtml(aide.titre || '') : (aide.titre || '')}</span>
            <button class="primo-popup-fermer" data-action="fermerAideContextuelle" aria-label="Fermer">×</button>
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

    // 🔧 #305 (2 juillet 2026) : nom accessible + sémantique de dialogue + focus,
    // même patron que la modale sœur afficherAideContextuelle (reliquat du 19 juin).
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.setAttribute('aria-labelledby', 'primo-popup-titre');

    popup.innerHTML = `
        <div class="primo-popup-header">
            <span id="primo-popup-titre"><span class="primo-icon"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span> Conseil</span>
            <button class="primo-popup-close" data-action="fermerPopupPrimo" aria-label="Fermer">×</button>
        </div>
        <div class="primo-popup-body">
            ${contentHTML}
        </div>
    `;

    popup._declencheur = document.activeElement;
    overlay.classList.add('active');
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';

    const btnFermer = popup.querySelector('.primo-popup-close');
    if (btnFermer) btnFermer.focus();
}

function fermerPopupPrimo() {
    const overlay = document.getElementById('primo-overlay');
    const popup = document.getElementById('primo-popup');
    const declencheur = popup && popup._declencheur;
    if (overlay) overlay.classList.remove('active');
    if (popup) popup.classList.remove('active');
    document.body.style.overflow = '';
    // #305 : rendre le focus au déclencheur (navigation clavier)
    if (declencheur && typeof declencheur.focus === 'function') declencheur.focus();
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
    // Relecture de Cowork (17 oct. 2026, C3) : six icônes de la Conception (grilles.js, echelles.js,
    // index.html) désignent une clé du CATALOGUE, sans élément de ce nom : elles n'ouvraient rien.
    // Repli sur l'aide contextuelle de la clé ; le reste inchangé.
    if (!contenuElement && obtenirPopup(targetId)) {
        afficherAideContextuelle(targetId);
        return;
    }
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
        texte: "Labo Codex num\u00e9rise le travail que tu fais d\u00e9j\u00e0. Ce parcours te guide \u00e0 travers les \u00e9tapes essentielles. Tu peux le quitter \u00e0 tout moment et le relancer depuis le bouton de l'en-t\u00eate. Commence par configurer ton espace de travail dans l'onglet Cadre.",
        correspond: function(idSousSection) { return !idSousSection || idSousSection === 'accueil'; }
    },
    {
        id: 1,
        titre: 'Cadre',
        texte: "C'est ici que tu poses les fondations\u00a0: ton trimestre (dates, cong\u00e9s), ton cours (comp\u00e9tence, \u00e9l\u00e9ments), ton groupe d'\u00e9tudiant\u00b7es et ton horaire. Ce sont les m\u00eames informations que dans ton plan de cours. Tu les saisis une fois et l'application g\u00e9n\u00e8re automatiquement le calendrier de tes s\u00e9ances.\n\nLes ic\u00f4nes d'info t'en disent plus sur chaque section. Quand ton groupe-cours est assembl\u00e9, tu es pr\u00eat\u00b7e pour la suite.",        correspond: function(idSousSection) {
            return typeof idSousSection === 'string' && idSousSection.indexOf('calendrier-') === 0;
        }
    },
    {
        id: 2,
        titre: 'Conception',
        // E1, validé par Grégoire le 19 oct. 2026 (19 h 01) ; l'étape correspond aussi à « Apporter mon matériel » (#1092).
        texte: "Tu construis ici tes outils d’évaluation : les mêmes que sur papier, mais réutilisables. Si tes grilles existent déjà dans Word ou dans Pages, « Apporter mon matériel » les y range : tu les colles, puis tu montres à l’application ce que veut dire chaque morceau. Les productions définissent les occasions d’apprentissage de tes étudiant·es. Les grilles fixent tes critères. Les échelles établissent les niveaux de performance. Les cartouches préparent la rétroaction. La pratique assemble le tout.\n\nL’ordre n’est pas imposé, mais les productions et les grilles sont un bon point de départ.",
        correspond: function(idSousSection) {
            if (typeof idSousSection !== 'string') return false;
            const structureConception = ['conception-materiel', 'conception-productions', 'conception-grille-criteres', 'conception-echelle-performance', 'conception-retroactions', 'conception-pratiques-notation'];
            return structureConception.indexOf(idSousSection) !== -1;
        }
    },
    {
        id: 3,
        titre: '\u00c9valuation',
        texte: "C'est le geste quotidien\u00a0: tu s\u00e9lectionnes une production, tu attribues un niveau \u00e0 chaque crit\u00e8re et la r\u00e9troaction se construit au fur et \u00e0 mesure. Tu peux importer les copies de tes \u00e9tudiant\u00b7es (PDF ou images), les annoter avec des tampons / estampes ou des codes, puis les \u00e9valuer \u2014 tout sur le m\u00eame document.\n\nLes jetons (D\u00e9lai, Reprise, Reprise cibl\u00e9e) offrent \u00e0 l'\u00e9tudiant\u00b7e une nouvelle occasion de d\u00e9montrer sa comp\u00e9tence.",        correspond: function(idSousSection) {
            return typeof idSousSection === 'string' && idSousSection.indexOf('evaluations-') === 0;
        }
    },
    {
        id: 4,
        titre: 'Suivi',
        texte: "L'aper\u00e7u (Suivi du groupe) te montre ce que tu ne verrais pas facilement sur papier\u00a0: le portrait de ton groupe en un coup d'\u0153il. Les indices Assiduit\u00e9 (A), Compl\u00e9tion (C) et Performance (P) r\u00e9sument le contexte d'apprentissage observ\u00e9 de chaque \u00e9tudiant\u00b7e. Les zones de couleur t'aident \u00e0 rep\u00e9rer qui a besoin d'attention.\n\nExplore les vues du Suivi\u00a0: Suivi du groupe, liste, profils individuels et interventions R\u00e0I.",        correspond: function(idSousSection) {
            // 'suivi-groupe' couvre l'ancien id 'apercu' depuis la migration du 27 mai 2026.
            return typeof idSousSection === 'string' && idSousSection.indexOf('suivi-') === 0;
        }
    },
    {
        id: 5,
        titre: 'Carte d\'alignement (optionnel)',
        texte: "La carte d'alignement rend visible l'alignement p\u00e9dagogique de ton cours\u00a0: ce que tu vises, comment tu l'enseignes et comment tu le v\u00e9rifies. Tu y organises aussi tes s\u00e9quences et tes le\u00e7ons sur les semaines du trimestre, et tu en exportes le plan. Ce module est compl\u00e9mentaire\u00a0: explore-le quand tu te sens \u00e0 l'aise avec les autres sections.",
        correspond: function(idSousSection) {
            return idSousSection === 'conception-carte';
        }
    },
    {
        id: 6,
        titre: 'Labo (optionnel)',
        texte: "Le Labo regroupe les outils d'observation et d'analyse : c'est là que tu actives la taxonomie SOLO, les micro-données ACP et le dépistage RàI, et que tu règles leurs seuils.\n\nChaque cadre est expliqué par un guide pédagogique de quelques pages — bouton « Guide » sur les cartes des Outils d'observation. Tu y trouveras aussi la modélisation, le rythme de travail, les études et le bilan réflexif.",
        correspond: function(idSousSection) {
            return typeof idSousSection === 'string' && idSousSection.indexOf('labo-') === 0;
        }
    }
];

// Modèle « panneau qui suit » : pour chaque étape, la section où le panneau
// emmène l'utilisateur quand il clique « Suivant ». L'étape 0 (Bienvenue) n'a
// pas de cible — c'est le point de départ. Les étapes Conception/Alignement
// ciblent une sous-section précise (sinon afficherSection ouvrirait la 1re).
const TOUR_NAV = {
    1: { section: 'calendrier' },
    2: { section: 'conception', sousSection: 'productions' },
    3: { section: 'evaluations' },
    4: { section: 'suivi' },
    5: { section: 'conception', sousSection: 'carte' },
    6: { section: 'labo' }
};

// Libellés courts pour le bouton « Suivant : <section> » (indexés par id d'étape).
const TOUR_TITRE_COURT = ['Bienvenue', 'Cadre', 'Conception', 'Évaluation', 'Suivi', 'Carte d\'alignement', 'Labo'];

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
    panneau.setAttribute('aria-label', 'Visite guid\u00e9e');

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
    btnFermer.setAttribute('aria-label', 'Fermer la visite guid\u00e9e');
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
    const dernier = ETAPES_TOUR.length - 1;

    function ajouterBouton(label, type, handler) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tour-btn btn ' + (type === 'primaire' ? 'btn-principal' : 'btn-secondaire');
        btn.textContent = label;
        btn.addEventListener('click', handler);
        actions.appendChild(btn);
    }

    // Bouton de gauche : « Précédent » (étapes > 0) ou porte de sortie (étape 0).
    if (etape.id > 0) {
        ajouterBouton('‹ Précédent', 'secondaire', tourReculerEtape);
    } else {
        ajouterBouton('Explorer seul·e', 'secondaire', quitterTourGuide);
    }

    // Bouton de droite (primaire) : avancer vers la section suivante, ou terminer.
    if (etape.id >= dernier) {
        ajouterBouton('Terminer le parcours', 'primaire', terminerTour);
    } else {
        const prefixe = etape.id === 0 ? 'Commencer' : 'Suivant';
        ajouterBouton(prefixe + ' : ' + TOUR_TITRE_COURT[etape.id + 1] + ' ›', 'primaire', tourAvancerEtape);
    }

    panneau.appendChild(actions);

    document.body.appendChild(panneau);

    requestAnimationFrame(function() { panneau.classList.add('visible'); });
}

function tourEtapeCourante() {
    const i = tourObtenirEtape();
    if (i === null || i < 0 || i >= ETAPES_TOUR.length) return null;
    return ETAPES_TOUR[i];
}

// Cœur du modèle « panneau qui suit » : on fixe l'étape, on emmène
// l'utilisateur dans la section correspondante, puis on réaffiche le panneau
// pour cette étape (position fixed → il reste visible à l'écran).
function tourNaviguerVersEtape(idx) {
    if (idx < 0 || idx >= ETAPES_TOUR.length) return;
    tourDefinirEtape(idx);
    tourMarquerEtapeVue(idx);

    const nav = TOUR_NAV[idx];
    if (nav) {
        if (nav.sousSection && typeof naviguerVers === 'function') {
            naviguerVers(nav.section, nav.sousSection);
        } else if (typeof afficherSection === 'function') {
            afficherSection(nav.section);
        }
    }

    afficherPanneauEtape(ETAPES_TOUR[idx]);
}

function tourAvancerEtape() {
    const courante = tourEtapeCourante();
    if (!courante) return;
    const prochaine = courante.id + 1;
    if (prochaine >= ETAPES_TOUR.length) { terminerTour(); return; }
    tourNaviguerVersEtape(prochaine);
}

function tourReculerEtape() {
    const courante = tourEtapeCourante();
    if (!courante || courante.id <= 0) return;
    tourNaviguerVersEtape(courante.id - 1);
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

    // S'assurer que l'accompagnement est actif (sinon tooltips, popups et
    // flèches resteront invisibles pendant le tour)
    definirAccompagnementActif(true);

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

    // Tour en cours au chargement (rechargement de page) : réafficher le
    // panneau de l'étape courante pour qu'il « suive » l'utilisateur.
    if (!tourEstComplete()) {
        const i = tourObtenirEtape();
        if (typeof i === 'number' && i >= 0 && i < ETAPES_TOUR.length) {
            afficherPanneauEtape(ETAPES_TOUR[i]);
        }
    }
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
    // Vue { cle: termeEntry } construite depuis CATALOGUE_ACCOMPAGNEMENT
    // (entrées publiées sous clés `terme-<cle>` par accompagnement-contenu-terme.js).
    const dict = {};
    for (const k in CATALOGUE_ACCOMPAGNEMENT) {
        const t = CATALOGUE_ACCOMPAGNEMENT[k].terme;
        if (t && t.cle) dict[t.cle] = t;
    }
    return dict;
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

    // Renvoi optionnel vers le guide pédagogique associé (découvrabilité, juin
    // 2026). data-action → dispatcher de main.js ; ouvrirGuidePedagogique ferme
    // le micro-popup avant d'ouvrir le panneau.
    if (terme.guide) {
        const btnGuide = document.createElement('button');
        btnGuide.type = 'button';
        btnGuide.className = 'glossaire-lien-ensavoirplus glossaire-lien-guide';
        btnGuide.setAttribute('data-action', 'ouvrirGuidePedagogique');
        btnGuide.setAttribute('data-param', terme.guide);
        btnGuide.textContent = 'Ouvrir le guide';
        actions.appendChild(btnGuide);
    }

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
    // D\u00e9couvrabilit\u00e9 des guides (juin 2026) : renvoi vers le guide p\u00e9dagogique
    // associ\u00e9 au terme, le cas \u00e9ch\u00e9ant. Catalogue statique \u2192 pas d'\u00e9chappement.
    if (t.guide) {
        const guideWrap = document.createElement('div');
        guideWrap.className = 'glossaire-fiche-guide';
        const btnGuide = document.createElement('button');
        btnGuide.type = 'button';
        btnGuide.className = 'btn btn-secondaire';
        btnGuide.setAttribute('data-action', 'ouvrirGuidePedagogique');
        btnGuide.setAttribute('data-param', t.guide);
        btnGuide.textContent = 'Ouvrir le guide';
        guideWrap.appendChild(btnGuide);
        fiche.appendChild(guideWrap);
    }
    return fiche;
}

// #1152, lot 3 (28 oct. 2026) : la fiche est dans Aide › Référence, sous l'accordéon du glossaire, qui n'est rendu
// qu'à l'ouverture de Référence ; afficherSection('aide') seul ouvrait Commencer. L'aide contextuelle d'où vient le
// terme se referme : elle couvrirait la fiche.
function afficherTermeGlossaire(cle) {
    const t = glossaireDict()[cle];
    if (!t) return;
    fermerAideContextuelle();
    if (typeof afficherSection === 'function') afficherSection('aide');
    if (typeof afficherSousSection === 'function') afficherSousSection('aide-reference');
    const conteneur = document.getElementById('glossaire-rendu');
    if (conteneur && (!_glossaireRenduAideFait || !document.getElementById('glossaire-' + cle))) {
        if (_etapeFiltre && t.etape !== _etapeFiltre) _etapeFiltre = '';
        afficherDansConteneurGlossaire(conteneur);
        _glossaireRenduAideFait = true;
    }
    const carte = document.getElementById('accordeon-aide-glossaire');
    if (carte && carte.classList.contains('ferme') && typeof toggleAccordeonV2 === 'function') {
        toggleAccordeonV2(carte.querySelector('.accordeon-header'));
    }
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
    // #1152, lot 5 (décision de Cowork du 28 oct. 2026) : aux mots ENTIERS — « critère » n'est plus souligné dans
    // « critères », ni « cours » dans « parcours ». `\b` ignore les lettres accentuées : la borne est une lettre ou un
    // chiffre Unicode. Le caractère qui précède est capturé (groupe 1) plutôt que lu en arrière, comme _MOTIF_ELEVE_N.
    _regexEnrichissement = new RegExp('(^|[^\\p{L}\\p{N}_])(' + escaped.join('|') + ')(?![\\p{L}\\p{N}_])', 'giu');
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
    return html.replace(regex, function(match, avant, terme) {
        const cle = trouverCleParTerme(terme);
        if (!cle || vus[cle]) return match;
        vus[cle] = true;
        return avant + '<span class="glossaire-terme" data-glossaire="' + cle + '" role="button" tabindex="0">' + terme + '</span>';
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
    afficherBulleDecouverte: afficherBulleDecouverte,
    initialiserPopup: initialiserPopup,

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

// ---- Globals nécessaires au dispatcher data-action de main.js ---------------
// Ces 4 noms sont référencés dans des attributs HTML data-action et/ou des
// handlers de rendu DOM. main.js:608 fait `fn = window[action]; fn()`.
window.masquerFlecheDidactique = fermerEtMarquerAutoReveal;
window.fermerPopupPrimo = fermerPopupPrimo;
window.fermerAideContextuelle = fermerAideContextuelle;
window.demarrerTourGuide = demarrerTourGuide;
// Lancé depuis le popup d'introduction (bouton « Démarrer la visite ») : ferme
// d'abord la popup d'aide, puis démarre le tour.
window.demarrerTourDepuisAide = function() {
    fermerAideContextuelle();
    demarrerTourGuide();
};

// Bascule globale de l'assistance depuis l'en-tête (équivalent de la case
// « Assistance » de l'accueil). Pref unique → pilote les 4 sous-systèmes.
// Le bouton d'en-tête et la case de l'accueil sont le MÊME interrupteur :
// cette fonction reflète l'état courant sur les deux contrôles.
function synchroniserControlesAssistance() {
    var actif = estAccompagnementActif();
    var btn = document.getElementById('btn-assistance-nav');
    if (btn) {
        btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
        btn.setAttribute('title', actif ? 'Assistance activée' : 'Assistance désactivée');
    }
    var cb = document.getElementById('checkbox-accompagnement-accueil');
    if (cb) cb.checked = actif;
}
window.synchroniserControlesAssistance = synchroniserControlesAssistance;
window.basculerAssistance = function() {
    var actif = !estAccompagnementActif();
    definirAccompagnementActif(actif);
    synchroniserControlesAssistance();
    if (window.notifications && typeof window.notifications.info === 'function') {
        window.notifications.info(actif ? 'Assistance activée' : 'Assistance désactivée');
    }
};
if (document.readyState !== 'loading') {
    synchroniserControlesAssistance();
} else {
    document.addEventListener('DOMContentLoaded', synchroniserControlesAssistance);
}

// ---- API sémantique conservée -----------------------------------------------
// afficherAideContextuelle : API publique pour ouvrir une popup par clé.
window.afficherAideContextuelle = afficherAideContextuelle;

// ============================================================================
// INITIALISATION
// ============================================================================

function initialiserTout() {
    migrerPersistance();
    migrerPrefAccompagnement();
    // Synchroniser les body classes au démarrage pour refléter la pref
    // (utilisées par CSS pour la visibilité des .btn-aide-contextuelle et
    // .primo-aide).
    const actif = estAccompagnementActif();
    document.body.classList.toggle('tour-guide-actif', actif);
    document.body.classList.toggle('aide-contextuelle-active', actif);
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
