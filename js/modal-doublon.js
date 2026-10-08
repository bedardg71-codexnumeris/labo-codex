/**
 * modal-doublon.js
 * Module de gestion des conflits de noms en double
 *
 * Beta 95.1 - Janvier 2026
 *
 * Utilisation:
 * const resultat = await afficherModalDoublon('grille', 'Nom existant', { estImport: true });
 * // resultat = { action: 'renommer'|'ecraser'|'ignorer', nouveauNom?: string } ou null si annule
 */

(function() {
    'use strict';

    const MODAL_DOUBLON_ID = 'modalConflitDoublon';

    // Types de ressources en francais
    const TYPES_FR = {
        'grille': 'grille de criteres',
        'echelle': 'echelle de performance',
        'production': 'production',
        'pratique': 'pratique de notation',
        'cartouche': 'cartouche de retroaction'
    };

    /**
     * Genere un nom suggere en ajoutant un suffixe numerique
     * @param {string} nomOriginal - Nom original
     * @returns {string} - Nom avec suffixe (ex: "Nom (2)")
     */
    function genererNomSuggere(nomOriginal) {
        if (!nomOriginal) return 'Sans nom (2)';

        // Pattern: "Nom (2)", "Nom (3)", etc.
        const match = nomOriginal.match(/^(.+)\s*\((\d+)\)$/);
        if (match) {
            const baseName = match[1].trim();
            const num = parseInt(match[2]) + 1;
            return `${baseName} (${num})`;
        }
        return `${nomOriginal} (2)`;
    }

    /**
     * Verifie si un nom existe deja dans une liste
     * @param {string} nom - Nom a verifier
     * @param {Array} liste - Liste d'elements
     * @param {string} champNom - Nom du champ contenant le nom (defaut: 'nom')
     * @returns {boolean}
     */
    function nomExiste(nom, liste, champNom = 'nom') {
        if (!nom || !Array.isArray(liste)) return false;
        return liste.some(item => item && item[champNom] === nom);
    }

    /**
     * Cree le HTML du modal
     * @returns {HTMLElement}
     */
    function creerModalDoublon() {
        const modal = document.createElement('div');
        modal.id = MODAL_DOUBLON_ID;
        modal.className = 'modal-overlay';

        modal.innerHTML = `
            <div class="modal-contenu modal-compact" style="max-width: 520px;">
                <button class="modal-fermer" id="btnDoublonFermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>

                <h2 class="modal-titre" style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">&#9888;&#65039;</span>
                    Conflit de nom
                </h2>

                <div class="modal-section">
                    <p style="margin-bottom: 15px;">
                        Une <strong id="doublonType">ressource</strong> portant le nom
                        <strong style="color: var(--accent-primaire);">"<span id="doublonNomExistant"></span>"</strong>
                        existe deja.
                    </p>

                    <p style="margin-bottom: 20px; color: var(--gris-moyen);">
                        Que souhaites-tu faire ?
                    </p>
                </div>

                <!-- Option 1: Renommer -->
                <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-weight: 600;">
                        <span style="font-size: 1.2rem;">&#9999;&#65039;</span>
                        Renommer la nouvelle ressource
                    </label>
                    <input type="text"
                           id="doublonNouveauNom"
                           class="controle-form"
                           style="width: 100%;"
                           placeholder="Nouveau nom">
                    <button id="btnDoublonRenommer"
                            class="btn btn-principal"
                            style="margin-top: 10px; width: 100%;">
                        Enregistrer avec ce nouveau nom
                    </button>
                </div>

                <!-- Option 2: Ecraser -->
                <div style="background: var(--alerte-fond-attention); padding: 15px; border-radius: 8px; border-left: 4px solid var(--btn-annuler); margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-weight: 600;">
                        <span style="font-size: 1.2rem;">&#128260;</span>
                        Remplacer l'existante
                    </label>
                    <p style="font-size: 0.9rem; color: var(--gris-moyen); margin: 0 0 10px 0;">
                        La ressource existante sera ecrasee par la nouvelle.
                        <strong style="color: var(--gris-fonce);">Cette action est irreversible.</strong>
                    </p>
                    <button id="btnDoublonEcraser"
                            class="btn btn-supprimer"
                            style="width: 100%;">
                        Remplacer l'existante
                    </button>
                </div>

                <!-- Option 3: Ignorer (import seulement) -->
                <div id="sectionDoublonIgnorer" style="background: var(--gris-tres-pale); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-weight: 600;">
                        <span style="font-size: 1.2rem;">&#9193;&#65039;</span>
                        Ignorer cette ressource
                    </label>
                    <p style="font-size: 0.9rem; color: var(--gris-moyen); margin: 0 0 10px 0;">
                        La ressource ne sera pas importee. L'existante reste inchangee.
                    </p>
                    <button id="btnDoublonIgnorer"
                            class="btn btn-secondaire"
                            style="width: 100%;">
                        Ignorer (ne pas importer)
                    </button>
                </div>

                <div class="modal-actions" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--gris-clair);">
                    <button id="btnDoublonAnnuler" class="btn btn-annuler">
                        Annuler
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Affiche le modal de conflit de doublon
     * @param {string} typeRessource - 'grille', 'echelle', 'production', 'pratique', 'cartouche'
     * @param {string} nomExistant - Nom de la ressource existante
     * @param {Object} options - Options additionnelles
     * @param {boolean} options.estImport - true si c'est un import (montre "Ignorer")
     * @param {string} options.suggestionNom - Nom suggere pour le renommage
     * @returns {Promise<{action: string, nouveauNom?: string}|null>}
     */
    function afficherModalDoublon(typeRessource, nomExistant, options = {}) {
        return new Promise((resolve) => {
            let modal = document.getElementById(MODAL_DOUBLON_ID);
            if (!modal) {
                modal = creerModalDoublon();
                document.body.appendChild(modal);
            }

            // Generer un nom suggere
            const suggestionNom = options.suggestionNom || genererNomSuggere(nomExistant);

            // Configurer le modal
            const typeFR = TYPES_FR[typeRessource] || typeRessource;

            document.getElementById('doublonType').textContent = typeFR;
            document.getElementById('doublonNomExistant').textContent = nomExistant;
            document.getElementById('doublonNouveauNom').value = suggestionNom;

            // Montrer/cacher la section "Ignorer" selon le contexte
            const sectionIgnorer = document.getElementById('sectionDoublonIgnorer');
            if (sectionIgnorer) {
                toggleDisplay(sectionIgnorer, options.estImport);
            }

            // Afficher le modal
            modal.classList.add('actif');

            // Focus sur le champ de nom
            setTimeout(() => {
                const inputNom = document.getElementById('doublonNouveauNom');
                if (inputNom) {
                    inputNom.focus();
                    inputNom.select();
                }
            }, 100);

            // Fonction de fermeture
            const fermer = (resultat) => {
                modal.classList.remove('actif');
                // Nettoyer les ecouteurs
                nettoyerEcouteurs();
                resolve(resultat);
            };

            // Gestionnaires d'evenements
            const handleRenommer = () => {
                const nouveauNom = document.getElementById('doublonNouveauNom').value.trim();
                if (!nouveauNom) {
                    alert('Veuillez entrer un nom valide');
                    return;
                }
                fermer({ action: 'renommer', nouveauNom });
            };

            const handleEcraser = () => {
                fermer({ action: 'ecraser' });
            };

            const handleIgnorer = () => {
                fermer({ action: 'ignorer' });
            };

            const handleAnnuler = () => {
                fermer(null);
            };

            const handleKeydown = (e) => {
                if (e.key === 'Escape') {
                    handleAnnuler();
                } else if (e.key === 'Enter' && e.target.id === 'doublonNouveauNom') {
                    handleRenommer();
                }
            };

            // Attacher les ecouteurs
            document.getElementById('btnDoublonRenommer').addEventListener('click', handleRenommer);
            document.getElementById('btnDoublonEcraser').addEventListener('click', handleEcraser);
            document.getElementById('btnDoublonIgnorer')?.addEventListener('click', handleIgnorer);
            document.getElementById('btnDoublonAnnuler').addEventListener('click', handleAnnuler);
            document.getElementById('btnDoublonFermer').addEventListener('click', handleAnnuler);
            document.addEventListener('keydown', handleKeydown);

            // Fonction de nettoyage
            function nettoyerEcouteurs() {
                document.getElementById('btnDoublonRenommer')?.removeEventListener('click', handleRenommer);
                document.getElementById('btnDoublonEcraser')?.removeEventListener('click', handleEcraser);
                document.getElementById('btnDoublonIgnorer')?.removeEventListener('click', handleIgnorer);
                document.getElementById('btnDoublonAnnuler')?.removeEventListener('click', handleAnnuler);
                document.getElementById('btnDoublonFermer')?.removeEventListener('click', handleAnnuler);
                document.removeEventListener('keydown', handleKeydown);
            }
        });
    }

    /**
     * Verifie si un doublon existe et affiche le modal si necessaire
     * @param {string} typeRessource - Type de ressource
     * @param {string} nomNouveau - Nom de la nouvelle ressource
     * @param {Array} listeExistante - Liste des ressources existantes
     * @param {string|null} idActuel - ID de la ressource actuelle (pour edition)
     * @param {Object} options - Options pour le modal
     * @returns {Promise<{action: string, nouveauNom?: string}|null|false>} - false si pas de doublon
     */
    async function verifierEtGererDoublon(typeRessource, nomNouveau, listeExistante, idActuel = null, options = {}) {
        if (!nomNouveau || !Array.isArray(listeExistante)) {
            return false; // Pas de verification possible
        }

        // Verifier si le nom existe deja (sauf pour l'element en cours d'edition)
        const existeDeja = listeExistante.some(item =>
            item.nom === nomNouveau &&
            (!idActuel || item.id !== idActuel)
        );

        if (!existeDeja) {
            return false; // Pas de doublon
        }

        // Afficher le modal
        const resultat = await afficherModalDoublon(typeRessource, nomNouveau, options);
        // #967 (décision de Grégoire, 7 oct. 2026) — un homonyme EMPLOYÉ n'est pas écrasé :
        // la nouvelle a un autre id, tout ce qui nommait l'ancien pointerait dans le vide.
        // L'appelant compte ses porteurs (`options.porteursHomonymes`) ; le refus vaut
        // l'annulation (null) : rien n'est écrit, et le codex n'est pas proposé pour rien.
        // Remplacer un modèle employé reste le rôle de « Supprimer » (#648).
        if (resultat && resultat.action === 'ecraser' && typeof options.porteursHomonymes === 'function') {
            const homonymes = listeExistante.filter(item =>
                item.nom === nomNouveau && (!idActuel || item.id !== idActuel));
            const nb = await options.porteursHomonymes(homonymes);
            if (nb && nb.total > 0) {
                alert(phraseRefusEcrasement(typeRessource, nb));
                return null;
            }
        }
        // #1007 (2a-2) — « Remplacer l'existante » l'efface pour de bon : le codex est proposé
        // après ce choix, avant le remplacement ; « Annuler » vaut l'annulation de la modale.
        // Les cinq appelants retirent l'homonyme au moment d'écrire (file, ids rejoués).
        if (resultat && resultat.action === 'ecraser' && typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('remplacement'))) return null;
        return resultat;
    }

    // #967 — la phrase validée par Grégoire (7 oct. 2026), même forme pour les trois
    // éditeurs. Les porteurs sont décrits par `decrirePorteursEchelle` (echelles.js) :
    // ses clés (évaluations, productions, pratiques, grilles, cartouches) couvrent aussi
    // les porteurs d'une grille et d'une cartouche.
    const SUJETS_REFUS = { echelle: 'Une échelle', grille: 'Une grille', cartouche: 'Une cartouche' };
    function phraseRefusEcrasement(typeRessource, nb) {
        const sujet = SUJETS_REFUS[typeRessource] || 'Un modèle';
        const verbe = nb.total >= 2 ? 'l\'emploient' : 'l\'emploie';
        return `${sujet} porte déjà ce nom, et ${window.decrirePorteursEchelle(nb)} ${verbe} : l'écraser changerait leurs notes. Donne un autre nom à la nouvelle.`;
    }

    // Exposer globalement
    window.afficherModalDoublon = afficherModalDoublon;
    window.verifierEtGererDoublon = verifierEtGererDoublon;
    window.phraseRefusEcrasement = phraseRefusEcrasement;
    window.genererNomSuggere = genererNomSuggere;
    window.nomExiste = nomExiste;



})();
