/**
 * modal-backup-reminder.js
 * Rappel de mettre le codex à jour
 *
 * Lot I (#985, D8, 29 sept. 2026) : le rappel mène au codex, plus à la copie de
 * secours. Une mise à jour réussie du codex le repousse (codex.js, _marquerCodexAJour) ;
 * la croix vaut « plus tard ».
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
    // Le choix par défaut du sélecteur : la croix et une mise à jour du codex repoussent d'autant.
    const DELAI_PAR_DEFAUT = 14;
    // Délai choisi au sélecteur avant « Mettre à jour le codex » : appliqué seulement si la mise à jour réussit.
    let delaiApresMiseAJour = DELAI_PAR_DEFAUT;

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
     * Lot I (#985, D8) : une mise à jour RÉUSSIE du codex repousse le rappel. Appelé par
     * codex.js au point où le codex est dit « à jour » (_marquerCodexAJour) : un échec, un
     * aperçu refusé ou « Il n'y est pas » n'y arrivent pas.
     * N'efface pas « Ne plus rappeler » (contrairement à definirProchainRappel) et ne
     * rapproche pas une date plus lointaine déjà choisie : le stock est respecté.
     */
    function reporterApresMiseAJourDuCodex() {
        // Le délai choisi ne sert qu'une fois, même quand le report est écarté (relecture de
        // Cowork) : sinon 30 jours choisis, puis un échec, valaient encore pour le menu plus tard.
        const delai = delaiApresMiseAJour;
        delaiApresMiseAJour = DELAI_PAR_DEFAUT;
        if (db.getSync(CLE_NE_PLUS_RAPPELER, null) === 'true') return;
        const report = new Date();
        report.setDate(report.getDate() + delai);
        const dejaPose = db.getSync(CLE_PROCHAIN_RAPPEL, null);
        if (dejaPose && new Date(dejaPose) > report) return;
        db.setSync(CLE_PROCHAIN_RAPPEL, report.toISOString());
    }

    /**
     * Le geste principal du rappel : le parcours de « Mettre à jour le codex » du menu,
     * tel quel (lot G : mêmes messages d'échec). Sans codex ouvert, ce parcours le crée.
     * Rien n'est posé ici : c'est la réussite qui repousse le rappel.
     */
    function mettreAJourLeCodex() {
        const select = document.getElementById('select-rappel-backup');
        const valeur = select ? select.value : String(DELAI_PAR_DEFAUT);
        fermerModal();
        if (valeur === 'jamais') {
            desactiverRappels();
        } else {
            delaiApresMiseAJour = parseInt(valeur, 10) || DELAI_PAR_DEFAUT;
        }
        if (window.Codex && typeof window.Codex.actionEnregistrer === 'function') {
            // Le délai choisi ne vaut que pour CETTE tentative : un échec ou une annulation le
            // rendent au défaut, pour la mise à jour suivante par le menu (banc, essai 2 bis).
            Promise.resolve(window.Codex.actionEnregistrer()).finally(() => {
                delaiApresMiseAJour = DELAI_PAR_DEFAUT;
            });
        }
    }

    /**
     * La croix vaut « plus tard », au délai par défaut. Avant le lot I, elle ne posait
     * aucune date : le rappel revenait à chaque ouverture.
     */
    function fermerPlusTard() {
        definirProchainRappel(DELAI_PAR_DEFAUT);
        fermerModal();
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
        // Un délai choisi lors d'une ouverture précédente ne vaut pas pour celle-ci.
        delaiApresMiseAJour = DELAI_PAR_DEFAUT;

        // Overlay (classe standard DS)
        const overlay = document.createElement('div');
        overlay.id = 'overlay-backup-reminder';
        overlay.className = 'modal-overlay actif';

        // Modal (classes standard DS)
        const modal = document.createElement('div');
        modal.id = 'modal-backup-reminder';
        modal.className = 'modal-contenu modal-compact';

        // security-ok: gabarit constant, aucune donnée utilisateur
        modal.innerHTML = `
            <button class="modal-fermer" data-action="backupReminder.fermerPlusTard"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
            <h3 class="modal-titre">Mets ton codex à jour</h3>

            <div class="modal-section">
                <div class="alerte alerte-information" style="margin-bottom: 0">
                    Tes données vivent dans ce navigateur : elles peuvent être perdues si tu effaces
                    les données de sites, changes de navigateur ou d'ordinateur. Ton codex en garde
                    une copie complète, copies de tes étudiant·es comprises, que tu rouvres sur
                    n'importe quel appareil.
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
                    Plus tard
                </button>
                <button class="btn btn-principal" data-action="backupReminder.mettreAJourLeCodex">
                    Mettre à jour le codex
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
        mettreAJourLeCodex: mettreAJourLeCodex,
        reporterApresMiseAJourDuCodex: reporterApresMiseAJourDuCodex,
        gererChoixRappel: gererChoixRappel,
        fermerPlusTard: fermerPlusTard,
        fermerModal: fermerModal,
        // Exposé pour la sentinelle du seuil « vraies données » (retour terrain 8 juin).
        utilisateurADesDonnees: utilisateurADesDonnees
    };

    // Initialiser automatiquement
    initialiser();

})();
