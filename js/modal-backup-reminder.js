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
        // Si l'utilisateur a choisi "ne plus rappeler", ne pas afficher
        const nePlusRappeler = localStorage.getItem(CLE_NE_PLUS_RAPPELER);
        if (nePlusRappeler === 'true') {
            return false;
        }

        // Vérifier la date du prochain rappel
        const prochainRappel = localStorage.getItem(CLE_PROCHAIN_RAPPEL);

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
        localStorage.setItem(CLE_PROCHAIN_RAPPEL, prochainRappel.toISOString());
        localStorage.removeItem(CLE_NE_PLUS_RAPPELER);
    }

    /**
     * Désactive définitivement les rappels
     */
    function desactiverRappels() {
        localStorage.setItem(CLE_NE_PLUS_RAPPELER, 'true');
        localStorage.removeItem(CLE_PROCHAIN_RAPPEL);
    }

    /**
     * Navigue vers la section Import/Export
     */
    function allerVersExport() {
        fermerModal();
        // Définir un rappel dans 7 jours par défaut après export
        definirProchainRappel(7);

        // Navigation vers Réglages → Import/Export
        if (typeof window.naviguerVers === 'function') {
            window.naviguerVers('reglages', 'import-export');
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
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
        `;

        // Modal
        const modal = document.createElement('div');
        modal.id = 'modal-backup-reminder';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            max-width: 520px;
            width: 90%;
            z-index: 10001;
            overflow: hidden;
        `;

        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 1.25rem 1.5rem;">
                <h2 style="margin: 0; font-size: 1.3rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">⚠️</span>
                    Protégez vos données
                </h2>
            </div>

            <div style="padding: 1.5rem;">
                <p style="margin: 0 0 1rem 0; color: #333; line-height: 1.6;">
                    Vos données sont stockées <strong>localement dans votre navigateur</strong>.
                    Personne d'autre n'y a accès, mais elles peuvent être <strong>perdues</strong> si :
                </p>

                <ul style="margin: 0 0 1.25rem 0; padding-left: 1.5rem; color: #555; line-height: 1.8;">
                    <li>Vous effacez l'historique de navigation <em>(avec « données de sites »)</em></li>
                    <li>Vous utilisez la <strong>navigation privée</strong></li>
                    <li>Vous changez de navigateur <em>(Chrome ≠ Safari ≠ Firefox)</em></li>
                    <li>Vous réinstallez votre navigateur ou changez d'ordinateur</li>
                </ul>

                <div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 1rem; border-radius: 0 8px 8px 0; margin-bottom: 1.5rem;">
                    <p style="margin: 0; color: #1565c0; font-size: 0.95rem;">
                        <strong>💡 Solution :</strong> Exportez régulièrement vos données via
                        <strong>Réglages → Import/Export</strong>. Le fichier JSON peut être réimporté
                        à tout moment pour restaurer vos données.
                    </p>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <label for="select-rappel-backup" style="color: #666; font-size: 0.9rem;">Rappel :</label>
                        <select id="select-rappel-backup" style="padding: 0.4rem 0.6rem; border: 1px solid #ccc; border-radius: 6px; font-size: 0.9rem;">
                            <option value="7">Dans 7 jours</option>
                            <option value="14" selected>Dans 14 jours</option>
                            <option value="30">Dans 30 jours</option>
                            <option value="jamais">Ne plus rappeler</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <button id="btn-backup-exporter" style="
                            padding: 0.6rem 1rem;
                            background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                            color: white;
                            border: none;
                            border-radius: 6px;
                            font-size: 0.95rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: transform 0.2s;
                        ">
                            Exporter maintenant
                        </button>
                        <button id="btn-backup-compris" style="
                            padding: 0.6rem 1rem;
                            background: #f5f5f5;
                            color: #333;
                            border: 1px solid #ccc;
                            border-radius: 6px;
                            font-size: 0.95rem;
                            cursor: pointer;
                            transition: background 0.2s;
                        ">
                            J'ai compris
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Ajouter au DOM
        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('btn-backup-exporter').addEventListener('click', allerVersExport);
        document.getElementById('btn-backup-compris').addEventListener('click', gererChoixRappel);

        // Hover effects
        const btnExporter = document.getElementById('btn-backup-exporter');
        btnExporter.addEventListener('mouseenter', () => btnExporter.style.transform = 'translateY(-2px)');
        btnExporter.addEventListener('mouseleave', () => btnExporter.style.transform = 'translateY(0)');

        const btnCompris = document.getElementById('btn-backup-compris');
        btnCompris.addEventListener('mouseenter', () => btnCompris.style.background = '#e0e0e0');
        btnCompris.addEventListener('mouseleave', () => btnCompris.style.background = '#f5f5f5');
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
        desactiverRappels: desactiverRappels
    };

    // Initialiser automatiquement
    initialiser();

})();
