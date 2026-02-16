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
        'aide-introduction',
        'aide-configuration',
        'aide-formation',
        'aide-utilisation',
        'aide-consultation',
        'aide-reference'
    ];

    const TOOLTIP = 'En développement actif — cette fonctionnalité peut être instable';

    // ===== INJECTION CSS (une seule fois) =====
    // ===== INJECTION CSS (animation) =====
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-dev {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }
        .indicateur-dev {
            animation: pulse-dev 2s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);

    // ===== LOGIQUE D'APPLICATION DES INDICATEURS =====
    function apposerBadgesDev() {
        const conteneur = document.getElementById('sous-navigation');
        if (!conteneur) return;

        conteneur.querySelectorAll('button[data-sous-onglet]').forEach(function (bouton) {
            var id = bouton.getAttribute('data-sous-onglet');
            // Ne pas doubler l'indicateur
            if (bouton.querySelector('.indicateur-dev')) return;

            if (SOUS_SECTIONS_EN_DEV.indexOf(id) !== -1) {
                var indicateur = document.createElement('span');
                indicateur.className = 'indicateur-dev';
                indicateur.textContent = ' \uD83D\uDD36';
                indicateur.title = TOOLTIP;
                bouton.appendChild(indicateur);
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
