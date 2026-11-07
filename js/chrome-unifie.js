/* ================================================================
   chrome-unifie.js — Logique UI de l'en-tête (« L'en-tête épuré », 7 nov. 2026)

   Couvre :
   - Le menu à trois traits (#entete-menu-bouton / #entete-menu-panneau) :
     ouverture, fermeture par Échap, par un clic à l'extérieur et après un
     choix ; le focus revient au bouton à la fermeture. Les actions des lignes
     sont des data-action ordinaires (dispatcher de main.js).
   - Sous le seuil mesuré (variante C, iPhone) : le bouton de la section
     active (#entete-section-bouton) et la liste des sept sections. Le nom et
     l'état actif sont RECOPIÉS de la navigation principale, dont navigation.js
     (zone protégée) tient la classe « actif » — un observateur la suit.
   - Le fondu au bord de la navigation secondaire quand elle déborde
     (data-fondu sur #sous-navigation).

   Retirés le 7 nov. 2026 : les deux selects mobiles (nav primaire et
   sous-nav), remplacés par la variante C.

   Dépendances :
   - window.afficherSection (navigation.js), appelée par data-action
   - Événement custom 'sectionAffichee' émis par navigation.js
   ================================================================ */

(function () {
    'use strict';

    /* ============================================================
       PANNEAUX DÉROULANTS (menu, liste des sections)
       Un même comportement : bouton aria-expanded + panneau [hidden].
       ============================================================ */

    var panneaux = [];

    function brancherPanneau(idBouton, idPanneau) {
        var bouton = document.getElementById(idBouton);
        var panneau = document.getElementById(idPanneau);
        if (!bouton || !panneau) return;
        var entree = { bouton: bouton, panneau: panneau };
        panneaux.push(entree);

        bouton.addEventListener('click', function () {
            if (panneau.hidden) ouvrir(entree);
            else fermer(entree, true);
        });

        // Après un choix : le panneau se ferme et le focus revient au bouton, AVANT que
        // le dispatcher de main.js (sur document) n'exécute l'action — une action qui
        // déplace le focus (visite guidée, modale) le garde donc.
        panneau.addEventListener('click', function (e) {
            if (e.target.closest('button, a')) fermer(entree, true);
        });
    }

    function ouvrir(entree) {
        panneaux.forEach(function (autre) { if (autre !== entree) fermer(autre, false); });
        entree.panneau.hidden = false;
        entree.bouton.setAttribute('aria-expanded', 'true');
        var premier = entree.panneau.querySelector('button, a');
        if (premier) premier.focus();
    }

    function fermer(entree, rendreFocus) {
        if (entree.panneau.hidden) return;
        entree.panneau.hidden = true;
        entree.bouton.setAttribute('aria-expanded', 'false');
        if (rendreFocus) entree.bouton.focus();
    }

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        panneaux.forEach(function (entree) {
            if (!entree.panneau.hidden) {
                fermer(entree, true);
                e.stopPropagation();
            }
        });
    });

    // Clic à l'extérieur : le focus n'est pas ramené (il suit le clic).
    document.addEventListener('click', function (e) {
        panneaux.forEach(function (entree) {
            if (entree.panneau.hidden) return;
            if (entree.panneau.contains(e.target) || entree.bouton.contains(e.target)) return;
            fermer(entree, false);
        });
    });

    /* ============================================================
       SECTION ACTIVE (variante C) — recopiée de la navigation principale
       ============================================================ */

    function synchroniserSectionActive() {
        var actif = document.querySelector('.navigation-principale button.actif[data-onglet]');
        var id = actif ? actif.getAttribute('data-onglet') : null;
        var nom = document.getElementById('entete-section-nom');
        if (nom) {
            // Aide et Réglages n'ont pas de mot dans la navigation : leur titre vient du menu.
            var source = actif || document.querySelector('.entete-menu-item.btn-action-header.actif .entete-menu-mot');
            nom.textContent = source ? (source.textContent || '').trim() : '';
        }
        document.querySelectorAll('#entete-sections-liste [data-param]').forEach(function (item) {
            if (item.getAttribute('data-param') === id) item.setAttribute('aria-current', 'true');
            else item.removeAttribute('aria-current');
        });
    }

    /* ============================================================
       FONDU AU BORD DE LA NAVIGATION SECONDAIRE
       ============================================================ */

    function majFondu() {
        var nav = document.getElementById('sous-navigation');
        if (!nav) return;
        var reste = nav.scrollWidth - nav.clientWidth;
        if (reste <= 1) { nav.removeAttribute('data-fondu'); return; }
        var gauche = nav.scrollLeft > 1;
        var droite = nav.scrollLeft < reste - 1;
        nav.setAttribute('data-fondu', gauche && droite ? 'deux' : (gauche ? 'gauche' : 'droite'));
    }

    // L'onglet actif est ramené dans la vue quand la rangée défile (iPhone).
    function montrerOngletActif() {
        var nav = document.getElementById('sous-navigation');
        var actif = nav && nav.querySelector('button.actif');
        if (!actif || nav.scrollWidth <= nav.clientWidth) return;
        var g = actif.offsetLeft - nav.offsetLeft, d = g + actif.offsetWidth;
        if (g < nav.scrollLeft || d > nav.scrollLeft + nav.clientWidth) {
            nav.scrollLeft = Math.max(0, g - (nav.clientWidth - actif.offsetWidth) / 2);
        }
    }

    /* ============================================================
       INITIALISATION
       ============================================================ */

    function _initialiser() {
        brancherPanneau('entete-menu-bouton', 'entete-menu-panneau');
        brancherPanneau('entete-section-bouton', 'entete-sections-liste');

        var boutons = document.querySelector('.navigation-principale .navigation-boutons');
        if (boutons && typeof MutationObserver === 'function') {
            new MutationObserver(synchroniserSectionActive)
                .observe(boutons, { subtree: true, attributes: true, attributeFilter: ['class'] });
        }
        var menu = document.getElementById('entete-menu-panneau');
        if (menu && typeof MutationObserver === 'function') {
            new MutationObserver(synchroniserSectionActive)
                .observe(menu, { subtree: true, attributes: true, attributeFilter: ['class'] });
        }
        synchroniserSectionActive();

        var nav = document.getElementById('sous-navigation');
        if (nav) {
            nav.addEventListener('scroll', majFondu, { passive: true });
            if (typeof ResizeObserver === 'function') new ResizeObserver(majFondu).observe(nav);
            if (typeof MutationObserver === 'function') {
                new MutationObserver(function () { montrerOngletActif(); majFondu(); })
                    .observe(nav, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
            }
        }
        majFondu();
    }

    window.addEventListener('sectionAffichee', synchroniserSectionActive);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _initialiser);
    } else {
        _initialiser();
    }
})();
