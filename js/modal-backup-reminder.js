/**
 * modal-backup-reminder.js
 * Modal de rappel pour la sauvegarde des données
 *
 * Affiche un avertissement sur les risques de perte de données
 * et rappelle comment effectuer un backup.
 *
 * Déclencheurs :
 * - Premier lancement (aucun rappel enregistré)
 * - Rappel périodique selon préférence utilisateur
 *
 * @version 1.0.0
 * @date 28 décembre 2025
 */

(function() {
    'use strict';

    // Clés localStorage
    const CLE_PROCHAIN_RAPPEL = 'backupProchainRappel';
    const CLE_NE_PLUS_RAPPELER = 'backupNePlusRappeler';

    /**
     * Vérifie si le modal doit être affiché
     * @returns {boolean}
     */
    function doitAfficherModal() {
        // Ne pas afficher si le modal bienvenue est présent (premier lancement)
        if (document.getElementById('modal-bienvenue')) {
            return false;
        }

        // Si l'utilisateur a choisi "ne plus rappeler", ne pas afficher
        const nePlusRappeler = db.getSync(CLE_NE_PLUS_RAPPELER, null);
        if (nePlusRappeler === 'true') {
            return false;
        }

        // Vérifier la date du prochain rappel
        const prochainRappel = db.getSync(CLE_PROCHAIN_RAPPEL, null);

        // Premier lancement : pas de date enregistrée
        if (!prochainRappel) {
            return true;
        }

        // Vérifier si la date est passée
        const dateRappel = new Date(prochainRappel);
        const maintenant = new Date();

        return maintenant >= dateRappel;
    }

    /**
     * Définit le prochain rappel dans X jours
     * @param {number} jours - Nombre de jours avant le prochain rappel
     */
    function definirProchainRappel(jours) {
        const prochainRappel = new Date();
        prochainRappel.setDate(prochainRappel.getDate() + jours);
        db.setSync(CLE_PROCHAIN_RAPPEL, prochainRappel.toISOString());
        db.setSync(CLE_NE_PLUS_RAPPELER, null);
    }

    /**
     * Désactive définitivement les rappels
     */
    function desactiverRappels() {
        db.setSync(CLE_NE_PLUS_RAPPELER, 'true');
        db.setSync(CLE_PROCHAIN_RAPPEL, null);
    }

    /**
     * Navigue vers la section Import/Export
     */
    function allerVersExport() {
        fermerModal();
        // Définir un rappel dans 7 jours par défaut après export
        definirProchainRappel(7);

        // Navigation vers Réglages → Gestion des données
        if (typeof afficherSection === 'function') {
            afficherSection('reglages');
            setTimeout(() => {
                if (typeof afficherSousSection === 'function') {
                    afficherSousSection('reglages-donnees');
                }
            }, 100);
        } else {
            // Fallback : clic sur les éléments de navigation
            const ongletReglages = document.querySelector('[data-section="reglages"]');
            if (ongletReglages) {
                ongletReglages.click();
                setTimeout(() => {
                    const sousOnglet = document.querySelector('[data-sous-section="import-export"]');
                    if (sousOnglet) sousOnglet.click();
                }, 100);
            }
        }
    }

    /**
     * Ferme le modal
     */
    function fermerModal() {
        const modal = document.getElementById('modal-backup-reminder');
        if (modal) {
            modal.remove();
        }
        const overlay = document.getElementById('overlay-backup-reminder');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Gère le choix de l'utilisateur
     */
    function gererChoixRappel() {
        const select = document.getElementById('select-rappel-backup');
        const valeur = select.value;

        if (valeur === 'jamais') {
            desactiverRappels();
        } else {
            const jours = parseInt(valeur, 10);
            definirProchainRappel(jours);
        }

        fermerModal();
    }

    /**
     * Crée et affiche le modal
     */
    function afficherModal() {
        // Éviter les doublons
        if (document.getElementById('modal-backup-reminder')) {
            return;
        }

        // Overlay
        const overlay = document.createElement('div');
        overlay.id = 'overlay-backup-reminder';
        overlay.className = 'modal-backup-overlay';

        // Modal
        const modal = document.createElement('div');
        modal.id = 'modal-backup-reminder';
        modal.className = 'modal-backup-contenu';

        modal.innerHTML = `
            <div class="modal-header-warning">
                <h2>
                    <span>⚠️</span>
                    Protégez vos données
                </h2>
            </div>

            <div class="modal-backup-body">
                <p>
                    Vos données sont stockées <strong>localement dans votre navigateur</strong>.
                    Personne d'autre n'y a accès, mais elles peuvent être <strong>perdues</strong> si :
                </p>

                <ul>
                    <li>Vous effacez l'historique de navigation <em>(avec « données de sites »)</em></li>
                    <li>Vous utilisez la <strong>navigation privée</strong></li>
                    <li>Vous changez de navigateur <em>(Chrome ≠ Safari ≠ Firefox)</em></li>
                    <li>Vous réinstallez votre navigateur ou changez d'ordinateur</li>
                </ul>

                <div class="modal-backup-solution">
                    <p>
                        <strong>💡 Solution :</strong> Exportez régulièrement vos données via
                        <strong>Réglages → Données</strong>. Le fichier JSON peut être réimporté
                        à tout moment pour restaurer vos données.
                    </p>
                </div>

                <div class="modal-backup-controles">
                    <div class="modal-backup-rappel">
                        <label for="select-rappel-backup">Rappel :</label>
                        <select id="select-rappel-backup">
                            <option value="7">Dans 7 jours</option>
                            <option value="14" selected>Dans 14 jours</option>
                            <option value="30">Dans 30 jours</option>
                            <option value="jamais">Ne plus rappeler</option>
                        </select>
                    </div>

                    <div class="modal-backup-actions">
                        <button class="btn btn-principal" onclick="window.backupReminder.allerVersExport()">
                            Exporter maintenant
                        </button>
                        <button class="btn btn-neutre" onclick="window.backupReminder.gererChoixRappel()">
                            J'ai compris
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Ajouter au DOM
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
    }

    /**
     * Initialise le système de rappel
     * Appelé au chargement de la page
     */
    function initialiser() {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // Petit délai pour laisser l'app se charger
                setTimeout(verifierEtAfficher, 1500);
            });
        } else {
            setTimeout(verifierEtAfficher, 1500);
        }
    }

    /**
     * Vérifie si le modal doit être affiché et l'affiche si nécessaire
     */
    function verifierEtAfficher() {
        if (doitAfficherModal()) {
            afficherModal();
        }
    }

    // Exposer les fonctions pour usage externe
    window.backupReminder = {
        afficherModal: afficherModal,
        verifierEtAfficher: verifierEtAfficher,
        definirProchainRappel: definirProchainRappel,
        desactiverRappels: desactiverRappels,
        allerVersExport: allerVersExport,
        gererChoixRappel: gererChoixRappel,
        fermerModal: fermerModal
    };

    // Initialiser automatiquement
    initialiser();

})();
