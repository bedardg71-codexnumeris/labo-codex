/* ================================================================
   chrome-unifie.js — Logique UI du chrome unifié (23 mai 2026)

   Couvre :
   - Popover utilitaires mobile (bouton ⋯) : ouverture/fermeture,
     clic hors zone, Escape, fermeture après clic sur un item.
   - Selects mobile (nav primaire + sous-nav) : pilotent
     afficherSection() / afficherSousSection() de navigation.js.
   - Synchronisation : écoute sectionAffichee pour resynchroniser
     la valeur du select nav primaire et régénérer le select sous-nav
     à partir des boutons générés dans #sous-navigation.

   Dépendances :
   - window.afficherSection / window.afficherSousSection (navigation.js)
   - Variable globale sectionActive (config.js, lue indirectement)
   - Événement custom 'sectionAffichee' émis par navigation.js
   ================================================================ */

(function () {
    'use strict';

    /* ============================================================
       POPOVER UTILITAIRES MOBILE
       ============================================================ */

    function ouvrirPopoverUtilitaires(bouton) {
        var popover = document.getElementById('popover-utilitaires-mobile');
        var btn = bouton || document.getElementById('btn-utilitaires-mobile');
        if (!popover) return;

        var estOuvert = !popover.classList.contains('u-hide');
        if (estOuvert) {
            fermerPopoverUtilitaires();
            return;
        }

        popover.classList.remove('u-hide');
        popover.setAttribute('aria-hidden', 'false');
        if (btn) btn.setAttribute('aria-expanded', 'true');

        var premier = popover.querySelector('.popover-item');
        if (premier) premier.focus();

        // Différer l'attachement des écouteurs au tick suivant pour éviter
        // que le clic qui a ouvert le popover ne le referme aussitôt.
        setTimeout(function () {
            document.addEventListener('click', _gererClicGlobal);
            document.addEventListener('keydown', _gererEscape);
        }, 0);
    }

    function fermerPopoverUtilitaires() {
        var popover = document.getElementById('popover-utilitaires-mobile');
        var btn = document.getElementById('btn-utilitaires-mobile');
        if (popover) {
            popover.classList.add('u-hide');
            popover.setAttribute('aria-hidden', 'true');
        }
        if (btn) btn.setAttribute('aria-expanded', 'false');
        document.removeEventListener('click', _gererClicGlobal);
        document.removeEventListener('keydown', _gererEscape);
    }

    function _gererClicGlobal(event) {
        var popover = document.getElementById('popover-utilitaires-mobile');
        var btn = document.getElementById('btn-utilitaires-mobile');

        // Auto-désattache si le popover n'existe plus ou est déjà caché —
        // garantit qu'on n'intercepte JAMAIS les clics ailleurs.
        if (!popover || popover.classList.contains('u-hide')) {
            document.removeEventListener('click', _gererClicGlobal);
            document.removeEventListener('keydown', _gererEscape);
            return;
        }

        // Clic sur le bouton ⋯ : ouvrirPopoverUtilitaires gère le toggle.
        if (btn && btn.contains(event.target)) return;

        // Clic dans le popover sur un item : laisser le dispatcher data-action
        // s'exécuter, puis fermer au tick suivant.
        if (popover.contains(event.target)) {
            if (event.target.closest('.popover-item')) {
                setTimeout(fermerPopoverUtilitaires, 0);
            }
            return;
        }

        // Clic ailleurs : fermer.
        fermerPopoverUtilitaires();
    }

    function _gererEscape(event) {
        if (event.key === 'Escape') {
            fermerPopoverUtilitaires();
            var btn = document.getElementById('btn-utilitaires-mobile');
            if (btn) btn.focus();
        }
    }

    /* ============================================================
       SELECTS MOBILE (nav primaire + sous-nav)
       ============================================================ */

    function changerSectionDepuisSelectMobile(select) {
        if (!select || typeof window.afficherSection !== 'function') return;
        window.afficherSection(select.value);
    }

    function changerSousSectionDepuisSelectMobile(select) {
        if (!select || typeof window.afficherSousSection !== 'function') return;
        window.afficherSousSection(select.value);
    }

    function synchroniserSelectNavMobile() {
        var select = document.getElementById('select-nav-mobile');
        if (!select) return;
        // sectionActive est une variable globale de config.js (zone protégée).
        if (typeof window.sectionActive === 'string' && window.sectionActive) {
            select.value = window.sectionActive;
        }
    }

    function regenererSelectSousNav() {
        var conteneur = document.getElementById('sous-navigation');
        var select = document.getElementById('select-sous-nav-mobile');
        if (!conteneur || !select) return;

        var boutons = conteneur.querySelectorAll('button');
        if (boutons.length === 0) {
            select.classList.add('u-hide');
            select.innerHTML = '';
            return;
        }

        select.classList.remove('u-hide');
        // Reconstruction explicite via createElement (pas d'innerHTML avec
        // données utilisateur — les libellés viennent de config.js, mais
        // textContent + createElement reste plus sûr par défaut).
        select.innerHTML = '';
        boutons.forEach(function (btn) {
            var option = document.createElement('option');
            option.value = btn.getAttribute('data-sous-onglet') || '';
            option.textContent = (btn.textContent || '').trim();
            if (btn.classList.contains('actif')) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    /* ============================================================
       EXPORTS WINDOW (utilisés par data-action / data-on-change)
       ============================================================ */

    window.ouvrirPopoverUtilitaires = ouvrirPopoverUtilitaires;
    window.fermerPopoverUtilitaires = fermerPopoverUtilitaires;
    window.changerSectionDepuisSelectMobile = changerSectionDepuisSelectMobile;
    window.changerSousSectionDepuisSelectMobile = changerSousSectionDepuisSelectMobile;
    window.synchroniserSelectNavMobile = synchroniserSelectNavMobile;
    window.regenererSelectSousNav = regenererSelectSousNav;

    /* ============================================================
       INITIALISATION
       ============================================================ */

    function _initialiser() {
        synchroniserSelectNavMobile();
        regenererSelectSousNav();

        // Câblage direct des selects mobile (en plus du dispatcher
        // data-on-change de main.js — double sécurité, en cas où le
        // dispatcher rate ou que l'event ne bubble pas correctement).
        var selectNav = document.getElementById('select-nav-mobile');
        if (selectNav) {
            selectNav.addEventListener('change', function () {
                changerSectionDepuisSelectMobile(selectNav);
            });
        }
        var selectSousNav = document.getElementById('select-sous-nav-mobile');
        if (selectSousNav) {
            selectSousNav.addEventListener('change', function () {
                changerSousSectionDepuisSelectMobile(selectSousNav);
            });
        }
    }

    // À chaque changement de sous-section (émis par navigation.js L610),
    // resynchroniser les selects mobile.
    window.addEventListener('sectionAffichee', function () {
        synchroniserSelectNavMobile();
        regenererSelectSousNav();
    });

    // Init au chargement du DOM (les boutons sous-nav sont peuplés tard).
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _initialiser);
    } else {
        _initialiser();
    }
})();
