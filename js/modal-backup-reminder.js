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

        // Overlay (classe standard DS)
        const overlay = document.createElement('div');
        overlay.id = 'overlay-backup-reminder';
        overlay.className = 'modal-overlay actif';

        // Modal (classes standard DS)
        const modal = document.createElement('div');
        modal.id = 'modal-backup-reminder';
        modal.className = 'modal-contenu modal-compact';

        modal.innerHTML = `
            <button class="modal-fermer" data-action="backupReminder.fermerModal">&times;</button>
            <h3 class="modal-titre">Protège tes données</h3>

            <div class="modal-section">
                <div class="alerte alerte-attention">
                    Tes données sont stockées <strong>localement dans ton navigateur</strong>.
                    Personne d'autre n'y a accès, mais elles peuvent être <strong>perdues</strong> si :
                    <ul style="margin: 0.5rem 0 0 0; padding-left: 1.25rem">
                        <li>Tu effaces l'historique de navigation <em>(avec « données de sites »)</em></li>
                        <li>Tu utilises la <strong>navigation privée</strong></li>
                        <li>Tu changes de navigateur <em>(Chrome ≠ Safari ≠ Firefox)</em></li>
                        <li>Tu réinstalles ton navigateur ou changes d'ordinateur</li>
                    </ul>
                </div>

                <div class="alerte alerte-information" style="margin-bottom: 0">
                    <strong>Solution :</strong> Exporte régulièrement tes données via
                    <strong>Réglages → Données</strong>. Le fichier JSON peut être réimporté
                    à tout moment pour restaurer tes données.
                </div>
            </div>

            <div class="modal-actions" style="flex-wrap: wrap; align-items: center">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-right: auto">
                    <label for="select-rappel-backup" style="color: var(--texte-secondaire); font-size: 0.9rem">Rappel :</label>
                    <select id="select-rappel-backup" style="padding: 0.4rem 0.6rem; border: 1px solid var(--gris-moyen); border-radius: var(--radius-moyen); font-size: 0.9rem; background: var(--surface-carte); color: var(--texte-secondaire); cursor: pointer">
                        <option value="7">Dans 7 jours</option>
                        <option value="14" selected>Dans 14 jours</option>
                        <option value="30">Dans 30 jours</option>
                        <option value="jamais">Ne plus rappeler</option>
                    </select>
                </div>
                <button class="btn btn-neutre" data-action="backupReminder.gererChoixRappel">
                    J'ai compris
                </button>
                <button class="btn btn-principal" data-action="backupReminder.allerVersExport">
                    Exporter maintenant
                </button>
            </div>
        `;

        // Ajouter au DOM (modal DANS l'overlay pour hériter du position:fixed + z-index)
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
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
