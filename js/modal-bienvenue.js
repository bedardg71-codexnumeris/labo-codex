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
     * Initialise le parcours, puis lance Primo en mode Assisté
     */
    function commencerConfiguration() {
        // Enregistrer le choix dans le parcours d'apprentissage
        if (window.parcours) {
            window.parcours.setMode('explicite');
        }

        fermerModal();

        // Changer vers le mode Assisté
        if (typeof changerMode === 'function') {
            changerMode('simulation').then(() => {
                // Attendre un peu que le mode soit actif puis lancer Primo
                setTimeout(() => {
                    if (typeof afficherModalAccueil === 'function') {
                        afficherModalAccueil();
                    }
                }, 300);
            });
        } else {
            // Fallback si changerMode n'est pas disponible
            console.warn('[Bienvenue] changerMode non disponible');
        }
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
                            '🧭 Explore librement ! Clique sur 🧭 dans l\'en-tête pour un tour guidé.',
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
                    <h2>Bienvenue dans Monitorage</h2>
                    <p class="modal-bienvenue-subtitle">Ton outil de suivi pédagogique</p>
                </div>

                <div class="modal-bienvenue-body">
                    <p>
                        Cette application t'aide à suivre la progression de tes étudiants,
                        gérer les présences et évaluer les productions en continu.
                    </p>

                    <div class="modal-bienvenue-reperes">
                        <p class="modal-bienvenue-reperes-titre">Trois icônes dans l'en-tête pour t'accompagner :</p>
                        <div class="modal-bienvenue-repere">
                            <span class="repere-icone">✉️</span>
                            <span class="repere-texte"><strong>Nouveautés</strong> — Corrections et nouvelles fonctionnalités</span>
                        </div>
                        <div class="modal-bienvenue-repere">
                            <span class="repere-icone">🧭</span>
                            <span class="repere-texte"><strong>Tour guide</strong> — Aide contextuelle et navigation générale</span>
                        </div>
                        <div class="modal-bienvenue-repere">
                            <span class="repere-icone">⚠️</span>
                            <span class="repere-texte"><strong>Rappel backup</strong> — Protection de tes données</span>
                        </div>
                    </div>

                    <p style="margin-top: 1rem;">
                        <strong>Comment préfères-tu apprendre un nouvel outil ?</strong>
                    </p>
                </div>

                <div class="modal-bienvenue-actions">
                    <button class="btn-bienvenue btn-bienvenue-principal" onclick="window.modalBienvenue.commencerConfiguration()">
                        <span class="btn-bienvenue-icone">🗺️</span>
                        <span class="btn-bienvenue-texte">
                            <strong>Étape par étape</strong>
                            <small>Je te guide à travers chaque fonction dans l'ordre. Tu avances à ton rythme.</small>
                        </span>
                    </button>

                    <button class="btn-bienvenue btn-bienvenue-secondaire" onclick="window.modalBienvenue.explorerApplication()">
                        <span class="btn-bienvenue-icone">🧭</span>
                        <span class="btn-bienvenue-texte">
                            <strong>Par exploration</strong>
                            <small>Tu explores librement avec des données de démo. L'aide est toujours là si tu en as besoin.</small>
                        </span>
                    </button>
                </div>

                <div class="modal-bienvenue-footer">
                    <p>Tu pourras changer d'avis à tout moment dans Réglages → Préférences</p>
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
