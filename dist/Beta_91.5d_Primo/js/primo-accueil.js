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
    const etudiants = db.getSync('groupeEtudiants', []);
    const productions = db.getSync('productions', []);
    const grilles = db.getSync('grillesTemplates', []);
    const modalites = db.getSync('modalitesEvaluation', {});

    // Si pas d'étudiants ET pas de pratique configurée → première utilisation
    const aucuneDonnee = etudiants.length === 0 && !modalites.pratique;

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
            border-radius: 12px;
            padding: 40px;
            max-width: 600px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.4s ease-out;
        ">
            <!-- En-tête avec Primo -->
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #032e5c, #065dbb);
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 40px;
                    box-shadow: 0 4px 15px rgba(3, 46, 92, 0.3);
                ">
                    👋
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
                ">C'est Claude et Grégoire qui m'envoient ! 😊</p>
            </div>

            <!-- Message principal -->
            <div style="
                background: var(--bleu-tres-pale);
                border-left: 4px solid var(--bleu-principal);
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            ">
                <p style="margin: 0 0 15px; color: var(--gris-fonce); font-size: 1rem;">
                    Je constate que tu n'as pas encore de configuration ou de données dans l'application.
                </p>
                <p style="margin: 0; color: var(--gris-fonce); font-size: 1rem;">
                    <strong>Laisse-moi t'aider à démarrer !</strong> 🚀
                </p>
            </div>

            <!-- Options de démarrage -->
            <div style="margin-bottom: 25px;">
                <h3 style="
                    color: var(--bleu-principal);
                    font-size: 1.1rem;
                    margin: 0 0 15px;
                ">Que veux-tu faire ?</h3>

                <!-- Option 1: Données de démo -->
                <button onclick="chargerDonneesDemo()" style="
                    width: 100%;
                    padding: 15px 20px;
                    margin-bottom: 12px;
                    background: var(--bleu-principal);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                    box-shadow: 0 2px 8px rgba(3, 46, 92, 0.2);
                " onmouseover="this.style.background='var(--bleu-moyen)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(3, 46, 92, 0.3)';" onmouseout="this.style.background='var(--bleu-principal)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(3, 46, 92, 0.2)';">
                    <strong>🎓 Charger des données de démonstration</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.9;">
                        Parfait pour explorer l'application avec des exemples
                    </div>
                </button>

                <!-- Option 2: Créer ma classe -->
                <button onclick="demarrerWizard()" style="
                    width: 100%;
                    padding: 15px 20px;
                    margin-bottom: 12px;
                    background: white;
                    color: var(--bleu-principal);
                    border: 2px solid var(--bleu-principal);
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " onmouseover="this.style.background='var(--bleu-tres-pale)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='white'; this.style.transform='translateY(0)';">
                    <strong>✨ Créer ma propre pratique d'évaluation</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
                        Je te guide étape par étape (8 minutes)
                    </div>
                </button>

                <!-- Option 3: Explorer librement -->
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
                    <strong>🔍 Explorer par moi-même</strong>
                    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
                        Je peux toujours revenir te voir plus tard
                    </div>
                </button>
            </div>

            <!-- Footer -->
            <div style="
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid var(--bordure-claire);
                color: var(--gris-clair);
                font-size: 0.85rem;
            ">
                💡 <strong>Conseil :</strong> Les données de démo sont idéales pour commencer !
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

    // Afficher notification
    afficherNotificationSucces(
        'Chargement en cours...',
        'Je vais charger les données de démonstration pour toi !'
    );

    // Naviguer vers Import/Export et déclencher import
    setTimeout(() => {
        afficherSection('reglages');
        afficherSousSection('reglages-import-export');

        // Message d'instruction
        setTimeout(() => {
            afficherNotificationInformation(
                'Presque prêt !',
                'Clique sur le bouton "Importer des données" et sélectionne le fichier "donnees-demo.json" 📦'
            );
        }, 500);
    }, 300);
}

/**
 * Option 2: Démarrer le wizard de création de pratique
 */
function demarrerWizard() {
    fermerModalAccueil();

    // Afficher notification simple
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('C\'est parti ! Je vais te guider pour créer ta pratique personnalisée 🎯');
    }

    // Naviguer vers Pratiques et ouvrir Wizard
    setTimeout(() => {
        afficherSection('reglages');

        // CORRECTIF: Attendre que la section soit affichée avant d'afficher la sous-section
        setTimeout(() => {
            afficherSousSection('reglages-pratiques');

            // Attendre que la page soit chargée, puis ouvrir le wizard
            setTimeout(() => {
                if (typeof ouvrirWizardPrimo === 'function') {
                    ouvrirWizardPrimo();
                } else {
                    if (typeof afficherNotificationInformation === 'function') {
                        afficherNotificationInformation('Va dans «Pratique de notation» et clique sur «Créer une pratique» ✨');
                    } else {
                        alert('Va dans «Pratique de notation» et clique sur «Créer une pratique» ✨');
                    }
                }
            }, 800);
        }, 200);
    }, 300);
}

/**
 * Option 3: Explorer librement (ferme juste le modal)
 */
function explorerLibrement() {
    fermerModalAccueil();

    if (typeof afficherNotificationInformation === 'function') {
        afficherNotificationInformation('Bonne exploration ! 🗺️ Tu peux me rappeler à tout moment en cliquant sur le bouton «👋 ASSISTANCE PRIMO» en haut à droite.');
    } else {
        alert('Bonne exploration ! 🗺️ Tu peux me rappeler à tout moment en cliquant sur le bouton «👋 ASSISTANCE PRIMO» en haut à droite.');
    }
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
 */
function verifierEtAfficherAccueil() {
    // Attendre 1 seconde après le chargement pour laisser l'interface se stabiliser
    setTimeout(() => {
        if (estPremiereUtilisation()) {
            console.log('👋 Première utilisation détectée - Affichage de Primo');
            afficherModalAccueil();
        } else {
            console.log('✅ Utilisateur existant - Pas d\'accueil Primo');
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
window.demarrerWizard = demarrerWizard;
window.explorerLibrement = explorerLibrement;

// Auto-initialisation
console.log('👋 Module Primo Accueil chargé');
initialiserPrimoAccueil();
