/**
 * aide-contextuelle.js
 * Module de gestion des aides contextuelles (📍 pins d'aide)
 * Utilise le système .primo-popup existant pour l'affichage
 */

(function() {
    'use strict';

    // =========================================================================
    // RENDU DU CONTENU
    // =========================================================================

    /**
     * Génère le HTML pour une section selon son type
     * @param {Object} section - Objet section avec type et contenu
     * @returns {string} HTML de la section
     */
    function rendreSectionAide(section) {
        switch (section.type) {
            case 'texte':
                return `<p class="aide-texte">${section.contenu}</p>`;

            case 'liste':
                const titreHTML = section.titre
                    ? `<p class="aide-liste-titre"><strong>${section.titre}</strong></p>`
                    : '';
                const itemsHTML = section.items
                    .map(item => `<li>${item}</li>`)
                    .join('');
                return `${titreHTML}<ul class="aide-liste">${itemsHTML}</ul>`;

            case 'conseil':
                return `
                    <div class="aide-conseil">
                        <span class="aide-icone">💡</span>
                        <div class="aide-conseil-contenu">${section.contenu}</div>
                    </div>`;

            case 'exemple':
                const exempletitre = section.titre ? `<strong>${section.titre}</strong><br>` : '';
                return `
                    <div class="aide-exemple">
                        <span class="aide-icone">📋</span>
                        <div class="aide-exemple-contenu">${exempletitre}${section.contenu}</div>
                    </div>`;

            case 'alerte':
                const iconeAlerte = section.niveau === 'important' ? '⚠️' : '⚡';
                const classeAlerte = section.niveau === 'important' ? 'aide-alerte-important' : 'aide-alerte-attention';
                return `
                    <div class="aide-alerte ${classeAlerte}">
                        <span class="aide-icone">${iconeAlerte}</span>
                        <div class="aide-alerte-contenu">${section.contenu}</div>
                    </div>`;

            default:
                return `<p>${section.contenu || ''}</p>`;
        }
    }

    /**
     * Génère le HTML complet pour une aide contextuelle
     * @param {Object} aide - Objet aide avec titre, sections et voirAussi
     * @returns {string} HTML complet de l'aide
     */
    function rendreContenuAide(aide) {
        if (!aide) return '<p>Contenu non disponible.</p>';

        // Rendu des sections
        let sectionsHTML = aide.sections
            .map(section => rendreSectionAide(section))
            .join('');

        // Enrichissement glossaire (Phase 4) : marque la 1re occurrence de
        // chaque terme connu dans les textes de sections. Les textes proviennent
        // des données AIDE_CONTEXTUELLE (sous contrôle, pas d'entrée utilisateur).
        if (window.glossaire && typeof window.glossaire.enrichirTermesGlossaire === 'function') {
            try {
                sectionsHTML = window.glossaire.enrichirTermesGlossaire(sectionsHTML);
            } catch (e) {
                console.warn('[AideCtx] Enrichissement glossaire non appliqué :', e);
            }
        }

        // Rendu des liens "Voir aussi"
        let voirAussiHTML = '';
        if (aide.voirAussi && aide.voirAussi.length > 0) {
            const liens = aide.voirAussi
                .filter(cle => window.AIDE_CONTEXTUELLE && window.AIDE_CONTEXTUELLE[cle])
                .map(cle => {
                    const titreRef = window.AIDE_CONTEXTUELLE[cle].titre;
                    return `<button class="aide-lien-voir-aussi" data-aide="${cle}">${titreRef}</button>`;
                })
                .join('');

            if (liens) {
                voirAussiHTML = `
                    <div class="aide-voir-aussi">
                        <span class="aide-voir-aussi-label">Voir aussi :</span>
                        ${liens}
                    </div>`;
            }
        }

        return sectionsHTML + voirAussiHTML;
    }

    // =========================================================================
    // AFFICHAGE DU MODAL
    // =========================================================================

    /**
     * Affiche le modal d'aide contextuelle pour une clé donnée
     * @param {string} cleAide - Clé de l'aide dans AIDE_CONTEXTUELLE
     */
    function afficherAideContextuelle(cleAide) {
        if (!window.AIDE_CONTEXTUELLE) {
            console.error('AIDE_CONTEXTUELLE non chargé');
            return;
        }

        const aide = window.AIDE_CONTEXTUELLE[cleAide];
        if (!aide) {
            console.warn(`Aide contextuelle non trouvée: ${cleAide}`);
            return;
        }

        // Créer ou récupérer l'overlay
        let overlay = document.querySelector('.aide-contextuelle-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'aide-contextuelle-overlay primo-overlay';
            overlay.addEventListener('click', fermerAideContextuelle);
            document.body.appendChild(overlay);
        }

        // Créer ou récupérer le modal
        let modal = document.querySelector('.aide-contextuelle-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'aide-contextuelle-modal primo-popup';
            document.body.appendChild(modal);
        }

        // Tier 7.3 : Sémantique ARIA
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'aide-ctx-titre');

        // Générer le contenu
        const contenuHTML = rendreContenuAide(aide);

        modal.innerHTML = `
            <div class="primo-popup-header">
                <span id="aide-ctx-titre" class="primo-popup-titre">📍 ${aide.titre}</span>
                <button class="primo-popup-fermer" data-action="fermerAideContextuelle" aria-label="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
            </div>
            <div class="primo-popup-body aide-contextuelle-body">
                ${contenuHTML}
            </div>
        `;

        // Afficher
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Tier 7.3 : Focus trap — placer le focus sur le bouton fermer
        const btnFermer = modal.querySelector('.primo-popup-fermer');
        if (btnFermer) btnFermer.focus();

        // Sauvegarder l'élément déclencheur pour y restaurer le focus
        modal._declencheur = document.activeElement;
    }

    /**
     * Ferme le modal d'aide contextuelle
     */
    function fermerAideContextuelle() {
        const overlay = document.querySelector('.aide-contextuelle-overlay');
        const modal = document.querySelector('.aide-contextuelle-modal');

        // Tier 7.3 : Restaurer le focus sur le bouton déclencheur
        const declencheur = modal && modal._declencheur;

        if (overlay) overlay.classList.remove('active');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';

        if (declencheur && typeof declencheur.focus === 'function') {
            declencheur.focus();
        }
    }

    // =========================================================================
    // INITIALISATION
    // =========================================================================

    /**
     * Initialise le système d'aide contextuelle
     * Utilise la délégation d'événements pour gérer tous les boutons
     */
    function initialiserAideContextuelle() {
        // Délégation d'événements sur le document pour les boutons d'aide
        document.addEventListener('click', function(event) {
            // Vérifier si c'est un bouton d'aide contextuelle
            const bouton = event.target.closest('.btn-aide-contextuelle');
            if (bouton) {
                event.preventDefault();
                event.stopPropagation();
                const cleAide = bouton.getAttribute('data-aide');
                if (cleAide) {
                    afficherAideContextuelle(cleAide);
                }
                return;
            }

            // Vérifier si c'est un lien "Voir aussi"
            const lienVoirAussi = event.target.closest('.aide-lien-voir-aussi');
            if (lienVoirAussi) {
                event.preventDefault();
                const nouvelleCle = lienVoirAussi.getAttribute('data-aide');
                if (nouvelleCle) {
                    afficherAideContextuelle(nouvelleCle);
                }
                return;
            }
        });

        // Écouter Escape pour fermer + focus trap (Tier 7.3)
        document.addEventListener('keydown', function(event) {
            const modal = document.querySelector('.aide-contextuelle-modal.active');
            if (!modal) return;

            if (event.key === 'Escape') {
                fermerAideContextuelle();
                return;
            }

            // Focus trap : Tab/Shift+Tab piégé dans la modale
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
        });


    }

    // =========================================================================
    // BULLE DE DÉCOUVERTE
    // =========================================================================

    /**
     * Affiche une bulle de découverte temporaire près d'un élément cible.
     * Utilisée pour guider le novice vers un bouton ou une action spécifique.
     * @param {Object} options - { cible, message, position, duree }
     */
    function afficherBulleDecouverte({ cible, message, position = 'bas', duree = 8000 }) {
        var el = document.querySelector(cible);
        if (!el) return;

        // Supprimer une bulle existante
        var existante = document.querySelector('.bulle-decouverte');
        if (existante) existante.remove();

        var bulle = document.createElement('div');
        bulle.className = 'bulle-decouverte bulle-decouverte--' + position;
        bulle.innerHTML =
            '<span>' + message + '</span>' +
            '<button class="bulle-decouverte-fermer" aria-label="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>';

        bulle.querySelector('.bulle-decouverte-fermer').addEventListener('click', function() {
            bulle.remove();
        });

        // Positionner près de l'élément
        document.body.appendChild(bulle);
        var rect = el.getBoundingClientRect();
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

        // Auto-disparition
        setTimeout(function() { if (bulle.parentElement) bulle.remove(); }, duree);
    }

    // =========================================================================
    // EXPOSITION GLOBALE
    // =========================================================================

    // Exposer les fonctions nécessaires globalement
    window.afficherAideContextuelle = afficherAideContextuelle;
    window.fermerAideContextuelle = fermerAideContextuelle;
    window.initialiserAideContextuelle = initialiserAideContextuelle;
    window.afficherBulleDecouverte = afficherBulleDecouverte;

    // Initialiser au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialiserAideContextuelle);
    } else {
        initialiserAideContextuelle();
    }

})();
