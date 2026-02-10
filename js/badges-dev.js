/**
 * Badges "En développement actif" sur les onglets de sous-navigation
 *
 * Appose un indicateur visuel (emoji 🚧 + tooltip) sur les sous-sections
 * en développement actif pour informer les utilisateurs en ligne.
 *
 * Ce module est NON-INTRUSIF : il ne modifie ni config.js ni navigation.js.
 * Il observe les changements du conteneur sous-navigation via MutationObserver
 * et ajoute les badges après chaque re-rendu.
 *
 * Pour modifier les sections marquées : éditer SOUS_SECTIONS_EN_DEV ci-dessous.
 * Pour désactiver complètement : retirer la balise <script> dans index.html.
 */
(function () {
    'use strict';

    // ===== CONFIGURATION =====
    // Format : 'section-sousSection' (correspond à data-sous-onglet)
    const SOUS_SECTIONS_EN_DEV = [
        'construction-grille-criteres',
        'construction-echelle-performance',
        'construction-retroactions',
        'construction-pratiques-notation',
        'construction-productions',
        'planification-carte',
        'planification-organisateur'
    ];

    const TOOLTIP = 'En développement actif — cette fonctionnalité peut être instable';

    // ===== INJECTION CSS (une seule fois) =====
    const style = document.createElement('style');
    style.textContent = `
        .badge-dev-actif {
            display: inline-block;
            margin-left: 4px;
            font-size: 0.75em;
            vertical-align: middle;
            animation: pulse-dev 2s ease-in-out infinite;
        }
        @keyframes pulse-dev {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }
    `;
    document.head.appendChild(style);

    // ===== LOGIQUE D'APPLICATION DES BADGES =====
    function apposerBadgesDev() {
        const conteneur = document.getElementById('sous-navigation');
        if (!conteneur) return;

        conteneur.querySelectorAll('button[data-sous-onglet]').forEach(function (bouton) {
            var id = bouton.getAttribute('data-sous-onglet');
            // Ne pas doubler le badge
            if (bouton.querySelector('.badge-dev-actif')) return;

            if (SOUS_SECTIONS_EN_DEV.indexOf(id) !== -1) {
                var badge = document.createElement('span');
                badge.className = 'badge-dev-actif';
                badge.textContent = '\uD83D\uDEA7';
                badge.title = TOOLTIP;
                bouton.appendChild(badge);
                bouton.title = TOOLTIP;
            }
        });
    }

    // ===== OBSERVER LES CHANGEMENTS DE SOUS-NAVIGATION =====
    document.addEventListener('DOMContentLoaded', function () {
        var conteneur = document.getElementById('sous-navigation');
        if (!conteneur) return;

        // Appliquer immédiatement (au cas où la nav est déjà rendue)
        apposerBadgesDev();

        // Observer les futures re-générations (afficherSousNavigation remplace innerHTML)
        var observer = new MutationObserver(function () {
            apposerBadgesDev();
        });

        observer.observe(conteneur, { childList: true, subtree: true });
    });
})();
