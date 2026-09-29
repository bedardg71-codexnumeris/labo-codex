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
     * Vérifie si l'utilisateur possède de VRAIES données à protéger.
     *
     * Retour terrain (8 juin 2026) : un simple groupe-cours configuré ne justifie
     * pas le rappel — « avoir monté un contexte » ≠ « avoir des données à sauvegarder ».
     * Le rappel se déclenche désormais sur du travail d'évaluation RÉEL : des
     * évaluations enregistrées, ou des travaux d'élèves importés. Jamais en mode démo
     * (rien de réel à perdre).
     * @returns {boolean}
     */
    function utilisateurADesDonnees() {
        try {
            if (typeof db === 'undefined') return false;

            // Pas de rappel en démonstration : aucune donnée réelle en jeu.
            if (db.getSync('demo-actif', null) === 'true') return false;

            if (typeof window.cle !== 'function') return false;

            // Travail d'évaluation saisi par l'enseignant = données réellement à protéger.
            const evals = db.getSync(window.cle('evaluationsSauvegardees'), []);
            if (Array.isArray(evals) && evals.length > 0) return true;

            // Travaux d'élèves importés (fichiers) — aussi des données réelles.
            const travaux = db.getSync(window.cle('fichiersTravaux'), []);
            if (Array.isArray(travaux) && travaux.length > 0) return true;
        } catch (e) { /* storage inaccessible */ }
        return false;
    }

    /**
     * Vérifie si le modal doit être affiché
     * @returns {boolean}
     */
    function doitAfficherModal() {
        // Ne pas afficher si le modal bienvenue est présent (premier lancement)
        if (document.getElementById('modal-bienvenue')) {
            return false;
        }

        // FIX 21 avril 2026 (audit terrain iPad) : ne pas proposer d'exporter
        // des données à un utilisateur qui n'en a pas. Le modal apparaissait
        // systématiquement au 1er démarrage même sur une fraîche installation
        // sans groupe-cours, créant une confusion (« tes données sont stockées
        // localement » alors qu'il n'y a rien à sauvegarder).
        if (!utilisateurADesDonnees()) {
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
     * Lot F (D4, étape 3) : le bouton mène VRAIMENT à la copie de secours. Il ouvre
     * Réglages › Données, puis la fenêtre de la copie de secours. Avant, « Exporter
     * maintenant » n'ouvrait que la section (mesuré le 29 sept.) : il n'exportait rien,
     * et son repli (`[data-sous-section="import-export"]`) visait un onglet disparu.
     */
    function allerVersCopieDeSecours() {
        fermerModal();
        // Rappel repoussé de 7 jours, comme avant.
        definirProchainRappel(7);
        afficherSection('reglages');
        setTimeout(() => {
            afficherSousSection('reglages-donnees');
            if (typeof window.ouvrirModalExport === 'function') window.ouvrirModalExport();
        }, 100);
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
            <button class="modal-fermer" data-action="backupReminder.fermerModal"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
            <h3 class="modal-titre">Fais une copie de secours</h3>

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
                    <strong>Solution :</strong> fais régulièrement une copie de secours
                    (<strong>Réglages → Données</strong>). Ce fichier se réimporte
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
                <button class="btn btn-principal" data-action="backupReminder.allerVersCopieDeSecours">
                    Faire une copie de secours
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
        allerVersCopieDeSecours: allerVersCopieDeSecours,
        gererChoixRappel: gererChoixRappel,
        fermerModal: fermerModal,
        // Exposé pour la sentinelle du seuil « vraies données » (retour terrain 8 juin).
        utilisateurADesDonnees: utilisateurADesDonnees
    };

    // Initialiser automatiquement
    initialiser();

})();
