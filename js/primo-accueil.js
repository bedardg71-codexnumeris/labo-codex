/**
 * PRIMO ACCUEIL - Assistant de démarrage
 *
 * Détecte la première utilisation et guide les nouveaux utilisateurs
 * avec un modal accueillant et des options de démarrage rapide.
 *
 * VERSION : 1.0
 * DATE : 27 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex) avec Claude
 */

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
    const cours = db.getSync('listeCours', []);
    const etudiants = db.getSync('groupeEtudiants', []);
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
            background: white;
            border-radius: var(--primo-border-radius, 12px);
            padding: 25px;
            max-width: var(--primo-modal-width, 500px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.4s ease-out;
        ">
            <!-- En-tête avec Primo -->
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #1a5266, #2d7a8c);
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    box-shadow: 0 4px 15px rgba(26, 82, 102, 0.3);
                ">
                    😎
                </div>
                <h2 style="
                    color: var(--bleu-principal);
                    margin: 0 0 10px;
                    font-size: 1.8rem;
                ">Allô, je suis Primo !</h2>
                <p style="
                    color: var(--gris-moyen);
                    font-size: 0.95rem;
                    margin: 0;
                ">Je te propose un tour guidé !</p>
            </div>

            <!-- Parcours modulaire -->
            <div style="margin-bottom: 25px;">
                <h3 style="
                    color: var(--bleu-principal);
                    font-size: 1.1rem;
                    margin: 0 0 15px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                ">Parcours modulaire</h3>

                <!-- MODULE 1: Créer un groupe-cours -->
                <button onclick="demarrerConfigComplete()" style="
                    width: 100%;
                    padding: 15px 20px;
                    margin-bottom: 8px;
                    background: white;
                    color: var(--bleu-principal);
                    border: 2px solid var(--bleu-principal);
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " onmouseover="this.style.background='var(--bleu-tres-pale)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='white'; this.style.transform='translateY(0)';">
                    <strong>MODULE 1 : Créer un groupe-cours</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
                        Configurer cours, trimestre, horaire, groupe (3 minutes)
                    </div>
                </button>

                <!-- MODULE 2: Évaluer une production -->
                <button onclick="demarrerEvaluation()" style="
                    width: 100%;
                    padding: 15px 20px;
                    margin-bottom: 8px;
                    background: white;
                    color: var(--bleu-principal);
                    border: 2px solid var(--bleu-principal);
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " onmouseover="this.style.background='var(--bleu-tres-pale)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='white'; this.style.transform='translateY(0)';">
                    <strong>MODULE 2 : Évaluer une production</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
                        Importer matériel et compléter une évaluation
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
                <button onclick="demarrerWizard()" style="
                    width: 100%;
                    padding: 15px 20px;
                    margin-bottom: 8px;
                    background: white;
                    color: var(--bleu-principal);
                    border: 2px solid var(--bleu-principal);
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " onmouseover="this.style.background='var(--bleu-tres-pale)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='white'; this.style.transform='translateY(0)';">
                    <strong>MODULE 4 : Créer ma pratique de notation</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
                        Configurer pratique, seuils, échelle, grille (8 minutes)
                    </div>
                </button>

                <!-- Explorer sans guide -->
                <button onclick="explorerLibrement()" style="
                    width: 100%;
                    padding: 15px 20px;
                    background: white;
                    color: var(--gris-moyen);
                    border: 1px solid var(--bordure-claire);
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " onmouseover="this.style.background='var(--gris-tres-pale)'; this.style.borderColor='var(--gris-moyen)';" onmouseout="this.style.background='white'; this.style.borderColor='var(--bordure-claire)';">
                    <strong>Explorer sans guide</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
                        Naviguer librement dans l'application
                    </div>
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
 * Option 1: Charger les données de démonstration
 */
function chargerDonneesDemo() {
    fermerModalAccueil();

    // Naviguer vers Import/Export et déclencher import
    setTimeout(() => {
        afficherSection('reglages');
        afficherSousSection('reglages-import-export');
    }, 300);
}

/**
 * Option 2: Démarrer le wizard de création de pratique
 */
function demarrerWizard() {
    fermerModalAccueil();

    // Naviguer vers Pratiques et ouvrir Wizard
    setTimeout(() => {
        afficherSection('reglages');

        // Attendre que la section soit affichée avant d'afficher la sous-section
        setTimeout(() => {
            afficherSousSection('reglages-pratique-notation');

            // Attendre que la page soit chargée, puis ouvrir le wizard
            setTimeout(() => {
                console.log('[Primo] Tentative d\'ouverture du wizard pratique...');

                // Vérifier que le modal existe dans le DOM
                const modal = document.getElementById('modalWizardPratique');
                if (!modal) {
                    console.error('[Primo] Modal #modalWizardPratique introuvable dans le DOM');
                    alert('Erreur : Le modal de configuration n\'a pas pu être trouvé.');
                    return;
                }

                if (typeof ouvrirWizardPratique === 'function') {
                    console.log('[Primo] Ouverture du wizard...');
                    ouvrirWizardPratique();
                } else {
                    console.error('[Primo] Fonction ouvrirWizardPratique non disponible');
                    alert('Erreur : Le module de configuration des pratiques n\'est pas chargé.');
                }
            }, 1200);
        }, 400);
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
            console.error('[Primo] Fonction ouvrirModalConversationnel non disponible');
            alert('Erreur : Le module de configuration n\'est pas chargé.');
        }
    }, 500);
}

/**
 * Option 3: Démarrer le parcours "Évaluer"
 * Commence directement à l'étape d'import de matériel
 */
function demarrerEvaluation() {
    fermerModalAccueil();

    // Calculer les questions actives (avec réponses vides car on démarre)
    const questionsActives = typeof obtenirQuestionsActives === 'function'
        ? obtenirQuestionsActives({})
        : QUESTIONS_PRIMO;

    // Trouver l'index de l'étape 'transition-mode-guide' dans questionsActives
    const indexEtapeEvaluation = questionsActives.findIndex(q => q.id === 'transition-mode-guide');

    if (indexEtapeEvaluation === -1) {
        console.error('[Primo] Étape transition-mode-guide introuvable');
        alert('Erreur : L\'étape d\'évaluation n\'a pas été trouvée.');
        return;
    }

    // Passer directement en mode notification (sans modal)
    setTimeout(() => {
        if (typeof demarrerModeNotification === 'function') {
            demarrerModeNotification(indexEtapeEvaluation);
        } else {
            console.error('[Primo] Fonction demarrerModeNotification non disponible');
            alert('Erreur : Le module de configuration n\'est pas chargé.');
        }
    }, 300);
}

/**
 * Option 4: Explorer librement (ferme juste le modal)
 */
function explorerLibrement() {
    fermerModalAccueil();
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
            console.log('ℹ️ Mode Normal/Anonymisé - Primo désactivé (auto)');
            return;
        }

        if (estPremiereUtilisation()) {
            console.log('👋 Première utilisation détectée - Affichage AUTO de Primo');
            afficherModalAccueil();
        } else {
            console.log('✅ Utilisateur existant - Primo accessible via bouton 😎 seulement');
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
window.chargerDonneesDemo = chargerDonneesDemo;
window.demarrerConfigComplete = demarrerConfigComplete;
window.demarrerWizard = demarrerWizard;
window.explorerLibrement = explorerLibrement;

// Auto-initialisation
console.log('👋 Module Primo Accueil chargé');
initialiserPrimoAccueil();
