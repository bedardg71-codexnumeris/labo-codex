/**
 * PRIMO ACCUEIL - Tour guidé de démarrage
 *
 * Détecte la première utilisation et guide les nouveaux utilisateurs
 * avec un modal accueillant et des options de démarrage rapide.
 *
 * VERSION : 1.1
 * DATE : 14 février 2026
 * AUTEUR : Grégoire Bédard (Labo Codex) avec Claude
 *
 * CHANGELOG :
 * - 1.1 (14 fév 2026) : Retrait persona Primo, ajout Module 5 "Créer du matériel",
 *   Module 2 navigue directement vers Évaluations (Beta 97.5+)
 * - 1.0 (27 nov 2025) : Version initiale
 */

(function() {
'use strict';

// ============================================================================
// DÉTECTION PREMIÈRE UTILISATION
// ============================================================================

/**
 * Vérifie si c'est la première utilisation de l'application
 * @returns {boolean} true si première utilisation
 */
function estPremiereUtilisation() {
    // Vérifier si l'utilisateur a déjà vu le message d'accueil
    const dejaVu = db.getSync('primo_accueil_vu', false);
    if (dejaVu) return false;

    // Vérifier s'il y a des données importantes
    // ✅ NAMESPACING (Beta 95.5)
    const cours = db.getSync('listeCours', []);
    const etudiants = (typeof obtenirDonneesSelonMode === 'function')
        ? obtenirDonneesSelonMode('groupeEtudiants')
        : db.getSync('groupeEtudiants', []);
    const trimestre = db.getSync('informationsTrimestre', {});
    const modalites = db.getSync('modalitesEvaluation', {});

    // Première utilisation = AUCUN cours configuré ET aucune donnée de base
    const aucuneDonnee = cours.length === 0 &&
                         etudiants.length === 0 &&
                         !trimestre.dateDebut &&
                         !modalites.pratique;

    return aucuneDonnee;
}

/**
 * Marque le message d'accueil comme vu
 */
function marquerAccueilVu() {
    db.setSync('primo_accueil_vu', true);
}

// ============================================================================
// MODAL D'ACCUEIL
// ============================================================================

/**
 * Génère un bandeau de recommandation basé sur le parcours d'apprentissage
 * Indique quel module correspond au prochain jalon
 */
function genererBandeauRecommandation() {
    if (!window.parcours || !window.parcours.estInitialise()) return '';
    if (window.parcours.estAutonome()) return '';

    var progression = window.parcours.getProgression();
    var prochain = progression.prochainJalon;
    if (!prochain) return '';

    // Mapper les jalons aux modules Primo
    var recommandation = '';
    var chapitreId = prochain.chapitre || '';

    if (chapitreId === 'configurer') {
        recommandation = 'MODULE 1';
    } else if (prochain.id === 'creer-pratique') {
        recommandation = 'MODULE 4';
    } else if (chapitreId === 'construire') {
        recommandation = 'MODULE 5';
    } else if (prochain.id === 'evaluer-production') {
        recommandation = 'MODULE 2';
    }

    if (!recommandation) return '';

    return '<div style="' +
        'background: rgba(26, 82, 102, 0.2); ' +
        'border-left: 3px solid #1a5266; ' +
        'border-radius: 6px; ' +
        'padding: 10px 14px; ' +
        'margin-bottom: 15px; ' +
        'font-size: 0.9rem; ' +
        'color: var(--gris-clair);">' +
        '📍 <strong>Recommandé</strong> : ' + recommandation +
        ' — ' + prochain.numero + ' ' + prochain.titre +
        '</div>';
}

/**
 * Affiche le modal d'accueil de Primo
 */
function afficherModalAccueil() {
    // Créer le modal
    const modal = document.createElement('div');
    modal.id = 'modal-primo-accueil';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-in-out;
    `;

    // Contenu du modal
    modal.innerHTML = `
        <div style="
            background: var(--surface-conteneur, #162c36);
            border-radius: var(--primo-border-radius, 12px);
            padding: 25px;
            max-width: var(--primo-modal-width, 500px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.4s ease-out;
        ">
            <!-- En-tête tour guidé -->
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px;">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #1a5266, #2d7a8c);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    box-shadow: 0 4px 15px rgba(26, 82, 102, 0.3);
                    flex-shrink: 0;
                ">
                    🗺️
                </div>
                <div style="flex: 1;">
                    <h2 style="
                        color: var(--accent-primaire);
                        margin: 0 0 5px;
                        font-size: 1.8rem;
                    ">Bienvenue dans le tour guidé !</h2>
                    <p style="
                        color: var(--gris-moyen);
                        font-size: 0.95rem;
                        margin: 0;
                    ">Explorez les modules ci-dessous.</p>
                </div>
            </div>

            <!-- Parcours modulaire -->
            <div style="margin-bottom: 25px;">
                ${genererBandeauRecommandation()}
                <h3 style="
                    color: var(--accent-primaire);
                    font-size: 1.1rem;
                    margin: 0 0 15px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                ">Parcours modulaire</h3>

                <!-- MODULE 1: Créer un groupe-cours -->
                <button data-action="demarrerConfigComplete" style="
                    width: 100%;
                    padding: 15px 20px;
                    margin-bottom: 8px;
                    background: var(--surface-conteneur, #162c36);
                    color: var(--accent-primaire);
                    border: 2px solid var(--accent-primaire);
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " class="hover-lift-bleu">
                    <strong>MODULE 1 : Créer un groupe-cours</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
                        Configurer cours, trimestre, horaire, groupe (3 minutes)
                    </div>
                </button>

                <!-- MODULE 2: Évaluer une production -->
                <button data-action="demarrerEvaluation" style="
                    width: 100%;
                    padding: 15px 20px;
                    margin-bottom: 8px;
                    background: var(--surface-conteneur, #162c36);
                    color: var(--accent-primaire);
                    border: 2px solid var(--accent-primaire);
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " class="hover-lift-bleu">
                    <strong>MODULE 2 : Évaluer une production</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
                        Accéder à la section d'évaluation des productions
                    </div>
                </button>

                <!-- MODULE 3: Explorer les diagnostics (DÉSACTIVÉ) -->
                <button disabled style="
                    width: 100%;
                    padding: 15px 20px;
                    margin-bottom: 8px;
                    background: var(--gris-tres-pale);
                    color: var(--gris-moyen);
                    border: 1px solid var(--bordure-claire);
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: not-allowed;
                    text-align: left;
                    opacity: 0.6;
                ">
                    <strong>MODULE 3 : Explorer les diagnostics pédagogiques</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
                        Disponible plus tard
                    </div>
                </button>

                <!-- MODULE 4: Créer ma pratique -->
                <button data-action="demarrerWizard" style="
                    width: 100%;
                    padding: 15px 20px;
                    margin-bottom: 8px;
                    background: var(--surface-conteneur, #162c36);
                    color: var(--accent-primaire);
                    border: 2px solid var(--accent-primaire);
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " class="hover-lift-bleu">
                    <strong>MODULE 4 : Créer ma pratique de notation</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
                        Configurer pratique, seuils, échelle, grille (8 minutes)
                    </div>
                </button>

                <!-- MODULE 5: Créer du matériel pédagogique -->
                <button data-action="demarrerCreationMateriel" style="
                    width: 100%;
                    padding: 15px 20px;
                    margin-bottom: 8px;
                    background: var(--surface-conteneur, #162c36);
                    color: var(--accent-primaire);
                    border: 2px solid var(--accent-primaire);
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " class="hover-lift-bleu">
                    <strong>MODULE 5 : Créer du matériel pédagogique</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
                        Échelle, grille de critères, production et cartouches de rétroaction (5 minutes)
                    </div>
                </button>

                <!-- MODULE 6: Utiliser le Codex -->
                <button data-action="demarrerCodex" style="
                    width: 100%;
                    padding: 15px 20px;
                    margin-bottom: 8px;
                    background: var(--surface-conteneur, #162c36);
                    color: var(--accent-primaire);
                    border: 2px solid var(--accent-primaire);
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " class="hover-lift-bleu">
                    <strong>MODULE 6 : Utiliser le Codex</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
                        Sauvegarder tes données sur clé USB et les transporter entre tes appareils
                    </div>
                </button>

                <!-- Consulter l'aide -->
                <button data-action="consulterAide" style="
                    width: 100%;
                    padding: 15px 20px;
                    margin-bottom: 8px;
                    background: var(--surface-conteneur, #162c36);
                    color: var(--gris-moyen);
                    border: 1px solid var(--bordure-claire);
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " class="hover-gris-bordure">
                    <strong>Consulter l'aide</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
                        Accéder à la documentation
                    </div>
                </button>

                <!-- Retour à la navigation libre -->
                <button data-action="explorerLibrement" style="
                    width: 100%;
                    padding: 15px 20px;
                    background: var(--surface-conteneur, #162c36);
                    color: var(--gris-moyen);
                    border: 1px solid var(--bordure-claire);
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.2s;
                " class="hover-gris-bordure">
                    <strong>Retour à la navigation libre</strong>
                </button>
            </div>
        </div>
    `;

    // Ajouter les animations CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(modal);
}

/**
 * Ferme le modal d'accueil
 */
function fermerModalAccueil() {
    const modal = document.getElementById('modal-primo-accueil');
    if (modal) {
        modal.style.animation = 'fadeOut 0.2s ease-out';
        setTimeout(() => modal.remove(), 200);
    }
    marquerAccueilVu();
}

// ============================================================================
// ACTIONS DES BOUTONS
// ============================================================================

/**
 * Option 1: Naviguer vers la section d'import des données
 * NOTE: Renommé de chargerDonneesDemo pour éviter conflit avec donnees-demo.js
 */
function naviguerVersImportDemo() {
    fermerModalAccueil();

    // Naviguer vers Import/Export et déclencher import
    setTimeout(() => {
        afficherSection('reglages');
        afficherSousSection('reglages-donnees');
    }, 300);
}

/**
 * Option 2: Démarrer le wizard de création de pratique
 *
 * Beta 95 : Utilise le nouveau Wizard V2 aligné sur l'architecture primo-questions.js
 */
function demarrerWizard() {
    fermerModalAccueil();

    // Délai pour permettre la fermeture du modal d'accueil
    setTimeout(() => {

        if (typeof ouvrirWizardV2 === 'function') {
            ouvrirWizardV2();
        } else {
            console.error('[Guide] Fonction ouvrirWizardV2 non disponible');
            alert('Erreur : Le module Wizard V2 n\'est pas chargé.');
        }
    }, 300);
}

/**
 * Option 2: Démarrer la configuration complète conversationnelle
 */
function demarrerConfigComplete() {
    fermerModalAccueil();

    // Ouvrir le modal conversationnel après un court délai
    setTimeout(() => {
        if (typeof ouvrirModalConversationnel === 'function') {
            ouvrirModalConversationnel();
        } else {
            console.error('[Guide] Fonction ouvrirModalConversationnel non disponible');
            alert('Erreur : Le module de configuration n\'est pas chargé.');
        }
    }, 500);
}

/**
 * Option 3: Démarrer le parcours "Évaluer"
 * Navigue directement vers la section Évaluations
 * Beta 97.5+ : Navigation directe (l'ancien mode notification a été retiré)
 */
function demarrerEvaluation() {
    // Vérifier les prérequis avant de démarrer
    const infoCours = typeof db !== 'undefined' ? db.getSync('infoCours', {}) : {};
    const listeCours = typeof db !== 'undefined' ? db.getSync('listeCours', []) : [];
    // ✅ NAMESPACING (Beta 95.5)
    const etudiants = (typeof obtenirDonneesSelonMode === 'function')
        ? obtenirDonneesSelonMode('groupeEtudiants')
        : (typeof db !== 'undefined' ? db.getSync('groupeEtudiants', []) : []);

    const aCours = infoCours.id || listeCours.length > 0;
    const aEtudiants = etudiants.length > 0;

    if (!aCours || !aEtudiants) {
        let message = 'Tu dois d\'abord configurer :\n\n';
        if (!aCours) message += '• Un cours (MODULE 1 : Créer un groupe-cours)\n';
        if (!aEtudiants) message += '• Des étudiants (MODULE 1 : Créer un groupe-cours)\n';
        message += '\nComplétez le Module 1 avant de pouvoir évaluer une production.';

        alert(message);
        console.warn('[Guide] Module 2 bloqué - prérequis manquants:', { aCours, aEtudiants });
        return;
    }

    fermerModalAccueil();

    // Naviguer directement vers la section Évaluations
    setTimeout(() => {
        if (typeof afficherSection === 'function') {
            afficherSection('evaluations');
        } else {
            console.error('[Guide] Fonction afficherSection non disponible');
        }
    }, 300);
}

/**
 * Option 4: Explorer librement (ferme juste le modal)
 */
function explorerLibrement() {
    fermerModalAccueil();
}

/**
 * Option 5: Démarrer la création de matériel pédagogique
 * Lance le parcours actif de création (échelle, grille, production, cartouches)
 */
function demarrerCreationMateriel() {
    fermerModalAccueil();

    setTimeout(() => {
        if (typeof ouvrirModalConversationnel !== 'function' || typeof obtenirQuestionsActives !== 'function') {
            console.error('[Guide] Fonctions conversationnelles non disponibles');
            alert('Erreur : Le module de configuration n\'est pas chargé.');
            return;
        }

        // Détecter la pratique AVANT d'ouvrir le modal (évite l'étape action visible)
        var modalites = db.getSync('modalitesEvaluation', {});
        var pratique = modalites.pratique || null;
        var reponsesInitiales = {
            'materiel-pratique-detectee': pratique || 'aucune'
        };

        // Trouver l'index de materiel-intro et sauter au suivant
        const questionsActives = obtenirQuestionsActives(reponsesInitiales);
        const indexMateriel = questionsActives.findIndex(q => q.id === 'materiel-intro');

        if (indexMateriel === -1) {
            console.error('[Guide] Question materiel-intro introuvable');
            alert('Erreur : Le parcours de création de matériel n\'a pas été trouvé.');
            return;
        }

        // Ouvrir à l'étape suivante (la détection est déjà faite)
        ouvrirModalConversationnel(indexMateriel + 1, reponsesInitiales);
    }, 500);
}

/**
 * Option 6: Utiliser le Codex (#230)
 * Affiche une explication du concept puis ouvre le menu
 */
function demarrerCodex() {
    fermerModalAccueil();

    setTimeout(function() {
        alert(
            'Le Codex — ton cloud personnel sur clé USB\n\n' +
            'Le Codex regroupe toutes tes données dans un seul fichier portable (.zip) ' +
            'que tu peux transporter entre tes appareils.\n\n' +
            'Flux typique :\n' +
            '1. Mac → Enregistrer le codex sur ta clé USB\n' +
            '2. iPad → Ouvrir le codex depuis la clé USB\n' +
            '3. Travailler sur iPad (saisie de présences, évaluations...)\n' +
            '4. iPad → Enregistrer le codex sur la clé USB\n' +
            '5. Mac → Ouvrir le codex depuis la clé USB\n\n' +
            'Indicateurs :\n' +
            '• Pastille verte = tout est enregistré\n' +
            '• Pastille orange = modifications non sauvegardées\n\n' +
            'Clique sur le bouton « Codex » dans l\'en-tête pour commencer.'
        );

        // Ouvrir le menu du codex pour guider l'utilisateur
        if (typeof Codex !== 'undefined' && typeof Codex.toggleMenu === 'function') {
            Codex.toggleMenu();
        }
    }, 300);
}

/**
 * Option 7: Consulter l'aide
 * Navigue vers la section Aide
 */
function consulterAide() {
    fermerModalAccueil();

    // Naviguer vers la section Aide
    setTimeout(() => {
        if (typeof afficherSection === 'function') {
            afficherSection('aide');
        } else {
            console.error('[Guide] Fonction afficherSection non disponible');
        }
    }, 300);
}

// ============================================================================
// INITIALISATION
// ============================================================================

/**
 * Initialise le système d'accueil Primo
 * Appelé au chargement de l'application
 */
function initialiserPrimoAccueil() {
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', verifierEtAfficherAccueil);
    } else {
        verifierEtAfficherAccueil();
    }
}

/**
 * Vérifie et affiche l'accueil si nécessaire
 * SEULEMENT en mode Assisté - Affichage AUTO uniquement pour premiers utilisateurs
 */
function verifierEtAfficherAccueil() {
    // Attendre 1 seconde après le chargement pour laisser l'interface se stabiliser
    setTimeout(() => {
        // Vérifier si on est en mode Assisté
        const modeAssiste = typeof estModeAssiste === 'function' ? estModeAssiste() : false;

        if (!modeAssiste) {
            return;
        }

        if (estPremiereUtilisation()) {
            afficherModalAccueil();
        } else {
        }
    }, 1000);
}

/**
 * Fonction pour réafficher manuellement l'accueil Primo
 * Utile pour les tests ou si l'utilisateur veut revoir le guide
 */
function reafficherAccueilPrimo() {
    afficherModalAccueil();
}

// ============================================================================
// EXPORTS
// ============================================================================

window.initialiserPrimoAccueil = initialiserPrimoAccueil;
window.reafficherAccueilPrimo = reafficherAccueilPrimo;
window.fermerModalAccueil = fermerModalAccueil;
window.naviguerVersImportDemo = naviguerVersImportDemo;
window.demarrerConfigComplete = demarrerConfigComplete;
window.demarrerWizard = demarrerWizard;
window.demarrerCreationMateriel = demarrerCreationMateriel;
window.demarrerCodex = demarrerCodex;
window.demarrerEvaluation = demarrerEvaluation;
window.explorerLibrement = explorerLibrement;
window.consulterAide = consulterAide;

// Auto-initialisation
initialiserPrimoAccueil();


})();
