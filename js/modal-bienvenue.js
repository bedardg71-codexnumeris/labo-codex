/**
 * modal-bienvenue.js
 * Modal de bienvenue pour les nouveaux utilisateurs
 *
 * Affiche un accueil chaleureux et guide vers la configuration initiale.
 * S'affiche AVANT le modal de backup sur un premier lancement.
 *
 * @version 1.0.0
 * @date 1er février 2026
 */

(function() {
    'use strict';

    // Clé pour tracker si l'utilisateur a vu le modal
    const CLE_BIENVENUE_VU = 'bienvenue_vu';

    /**
     * Vérifie si c'est la première utilisation absolue
     * @returns {boolean}
     */
    function estPremierLancement() {
        // Vérifier le flag
        const dejaVu = db.getSync(CLE_BIENVENUE_VU, null);
        if (dejaVu === 'true') {
            return false;
        }

        // Vérifier aussi via db si disponible
        if (typeof db !== 'undefined' && db.getSync) {
            const dejaVuDb = db.getSync(CLE_BIENVENUE_VU, false);
            if (dejaVuDb) {
                return false;
            }
        }

        // Vérifier s'il y a des données existantes (signe d'utilisation antérieure)
        const cours = typeof db !== 'undefined' ? db.getSync('listeCours', []) : [];
        const trimestre = typeof db !== 'undefined' ? db.getSync('informationsTrimestre', {}) : {};

        // Si données existent mais pas de flag, c'est un utilisateur existant
        // On marque comme vu et on ne montre pas
        if (cours.length > 0 || trimestre.dateDebut) {
            marquerBienvenueVu();
            return false;
        }

        return true;
    }

    /**
     * Marque le modal comme vu
     */
    function marquerBienvenueVu() {
        db.setSync(CLE_BIENVENUE_VU, 'true');
    }

    /**
     * Ferme le modal
     */
    function fermerModal() {
        const modal = document.getElementById('modal-bienvenue');
        if (modal) {
            modal.classList.add('modal-bienvenue-fermeture');
            setTimeout(() => modal.remove(), 200);
        }
        marquerBienvenueVu();

        // Définir le prochain rappel backup dans 14 jours pour éviter le double-modal
        if (window.backupReminder && window.backupReminder.definirProchainRappel) {
            window.backupReminder.definirProchainRappel(14);
        } else {
            // Fallback direct
            const prochainRappel = new Date();
            prochainRappel.setDate(prochainRappel.getDate() + 14);
            db.setSync('backupProchainRappel', prochainRappel.toISOString());
        }
    }

    /**
     * Lance le mode explicite (🗺️ Étape par étape)
     * Initialise le parcours, puis active le tour guide et lance Primo
     */
    function commencerConfiguration() {
        // Enregistrer le choix dans le parcours d'apprentissage
        if (window.parcours) {
            window.parcours.setMode('explicite');
        }

        fermerModal();

        // Activer le tour guide pour accompagner la configuration
        if (typeof definirTourGuide === 'function') {
            definirTourGuide(true);
        }

        // Lancer Primo pour guider l'utilisateur
        setTimeout(() => {
            if (typeof afficherModalAccueil === 'function') {
                afficherModalAccueil();
            }
        }, 300);
    }

    /**
     * Lance le mode découverte (🧭 Par exploration)
     * Initialise le parcours, puis charge la démo
     */
    function explorerApplication() {
        // Enregistrer le choix dans le parcours d'apprentissage
        if (window.parcours) {
            window.parcours.setMode('decouverte');
        }

        fermerModal();

        // Charger les données de démonstration
        setTimeout(() => {
            if (typeof entrerEnDemo === 'function') {
                entrerEnDemo();

                // Rappel discret après chargement de la démo
                setTimeout(() => {
                    if (typeof afficherNotification === 'function') {
                        afficherNotification(
                            '🧭 Explore librement ! Clique sur 🗺️ dans l\'en-tête pour un tour guidé.',
                            'info',
                            8000
                        );
                    }
                    // Mettre à jour l'indicateur header
                    if (window.parcours && window.parcours.mettreAJourUI) {
                        window.parcours.mettreAJourUI();
                    }
                }, 2000);
            }
        }, 500);
    }

    /**
     * Crée et affiche le modal
     */
    function afficherModal() {
        // Éviter les doublons
        if (document.getElementById('modal-bienvenue')) {
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'modal-bienvenue';
        modal.className = 'modal-bienvenue-overlay';

        modal.innerHTML = `
            <div class="modal-bienvenue-contenu">
                <div class="modal-bienvenue-header">
                    <h2>Bienvenue dans Labo Codex</h2>
                    <p class="modal-bienvenue-subtitle">Un espace numérique pour la pratique enseignante</p>
                </div>

                <div class="modal-bienvenue-body">
                    <p>
                        Cette application t'accompagne dans ton travail d'enseignant·e,
                        de la planification des cours jusqu'à la note finale.
                    </p>

                    <p style="margin-top: 1rem;">
                        Labo Codex s'apprivoise en trois temps&nbsp;: <strong>Découvrir</strong> d'abord,
                        <strong>Parcourir</strong> ensuite, <strong>Piloter</strong> quand tu es prêt·e à
                        travailler avec tes vraies données.
                    </p>

                    <p style="margin-top: 1rem;">
                        <strong>Comment souhaites-tu commencer&nbsp;?</strong>
                    </p>
                </div>

                <div class="modal-bienvenue-actions">
                    <button class="btn-bienvenue btn-bienvenue-principal" data-action="modalBienvenue.explorerApplication">
                        <span class="btn-bienvenue-icone">🚸</span>
                        <span class="btn-bienvenue-texte">
                            <strong>Découvrir</strong>
                            <small>J'explore librement avec des données de démonstration pour comprendre l'application.</small>
                        </span>
                    </button>

                    <button class="btn-bienvenue btn-bienvenue-secondaire" data-action="modalBienvenue.commencerConfiguration">
                        <span class="btn-bienvenue-icone">🗺️</span>
                        <span class="btn-bienvenue-texte">
                            <strong>Parcourir</strong>
                            <small>Je veux un guide qui me présente chaque fonction dans l'ordre.</small>
                        </span>
                    </button>
                </div>

                <div class="modal-bienvenue-footer">
                    <p>Tu pourras changer d'avis à tout moment depuis la page d'accueil.</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animation d'entrée
        requestAnimationFrame(() => {
            modal.classList.add('modal-bienvenue-visible');
        });
    }

    /**
     * Vérifie et affiche le modal si nécessaire
     */
    function verifierEtAfficher() {
        if (estPremierLancement()) {
            afficherModal();
            return true; // Modal affiché
        }
        return false; // Pas de modal
    }

    /**
     * Initialise le système de bienvenue
     */
    function initialiser() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // Délai court pour laisser l'app se charger
                setTimeout(verifierEtAfficher, 500);
            });
        } else {
            setTimeout(verifierEtAfficher, 500);
        }
    }

    // Exposer les fonctions
    window.modalBienvenue = {
        afficherModal: afficherModal,
        fermerModal: fermerModal,
        commencerConfiguration: commencerConfiguration,
        explorerApplication: explorerApplication,
        estPremierLancement: estPremierLancement,
        verifierEtAfficher: verifierEtAfficher
    };

    // Initialiser automatiquement
    initialiser();

})();
