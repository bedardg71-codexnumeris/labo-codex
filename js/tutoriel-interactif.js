/**
 * TUTORIEL INTERACTIF - Guide pas-à-pas après import données démo
 *
 * Parcours guidé avec bulles d'information positionnées dynamiquement
 * pour aider les nouveaux utilisateurs à découvrir l'application.
 *
 * VERSION : 1.0
 * DATE : 27 novembre 2025
 * AUTEUR : Grégoire Bédard (avec Claude)
 */

(function() {
'use strict';

// ============================================================================
// CONFIGURATION DU TUTORIEL
// ============================================================================

const ETAPES_TUTORIEL = [
    {
        id: 'bienvenue',
        titre: '🎉 Bienvenue dans ta démo !',
        description: 'Les données de démonstration sont chargées. Je vais te montrer les sections principales en 6 étapes rapides.',
        cible: null, // Pas de cible spécifique, bulle centrée
        action: null,
        position: 'center'
    },
    {
        id: 'apercu',
        titre: '📊 Aperçu',
        description: 'Voici ton aperçu ! Ici tu vois les indicateurs globaux A-C-P et la distribution du groupe.',
        cible: '[data-onglet="apercu"]',
        action: () => {
            afficherSection('apercu');
        },
        position: 'bottom'
    },
    {
        id: 'liste-etudiants',
        titre: '👥 Liste des étudiants',
        description: '30 étudiants de démo sont maintenant dans ta classe. Clique sur un nom pour voir son profil complet.',
        cible: '[data-section="etudiants"]',
        action: () => {
            afficherSection('etudiants');
            afficherSousSection('etudiants-liste');
        },
        position: 'bottom'
    },
    {
        id: 'profil-etudiant',
        titre: '🎓 Profil d\'un étudiant',
        description: 'Le profil montre tout : indices A-C-P, barres SRPNF, mobilisation, recommandations RàI, et liste des évaluations.',
        cible: '.ligne-etudiant:first-child', // Première ligne du tableau
        action: () => {
            // Attendre que la liste soit chargée
            setTimeout(() => {
                const premierEtudiant = document.querySelector('.ligne-etudiant:first-child');
                if (premierEtudiant) {
                    const da = premierEtudiant.dataset.da;
                    if (da && typeof afficherProfilEtudiant === 'function') {
                        afficherProfilEtudiant(da);
                    }
                }
            }, 500);
        },
        position: 'right',
        delai: 1000 // Attendre 1 sec que la liste s'affiche
    },
    {
        id: 'evaluations',
        titre: '📝 Évaluations',
        description: 'Les évaluations sont déjà saisies pour la démo. Tu peux voir toutes les notes et ajouter de nouvelles évaluations.',
        cible: '[data-section="evaluations"]',
        action: () => {
            afficherSection('evaluations');
            afficherSousSection('evaluations-liste');
        },
        position: 'bottom'
    },
    {
        id: 'pratiques',
        titre: '⚙️ Pratiques de notation',
        description: 'Tu peux changer de pratique (Sommative, STD, etc.) ou créer la tienne dans Contexte → Pratiques de notation.',
        cible: '[data-onglet="contexte"]',
        action: () => {
            afficherSection('contexte');
            afficherSousSection('contexte-pratiques-notation');
        },
        position: 'bottom'
    },
    {
        id: 'fin',
        titre: '✅ Bravo, tu es prêt !',
        description: 'Tu connais maintenant les sections principales. Explore librement, et si tu as besoin d\'aide, clique sur "👋 ASSISTANCE PRIMO" en haut à droite !',
        cible: null,
        action: null,
        position: 'center'
    }
];

// ============================================================================
// ÉTAT DU TUTORIEL
// ============================================================================

let tutorielActif = false;
let etapeTutorielActuelle = 0;
let overlayElement = null;
let bulleElement = null;

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Démarre le tutoriel interactif
 */
function demarrerTutoriel() {
    if (tutorielActif) return;

    tutorielActif = true;
    etapeTutorielActuelle = 0;

    // Marquer le tutoriel comme vu
    db.setSync('tutoriel_demo_vu', true);

    // Créer l'overlay
    creerOverlay();

    // Afficher la première étape
    afficherEtape(0);
}

/**
 * Crée l'overlay semi-transparent
 */
function creerOverlay() {
    overlayElement = document.createElement('div');
    overlayElement.id = 'tutoriel-overlay';
    overlayElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 9998;
        animation: fadeIn 0.3s ease-in-out;
    `;
    document.body.appendChild(overlayElement);
}

/**
 * Affiche une étape du tutoriel
 * @param {number} index - Index de l'étape
 */
function afficherEtape(index) {
    if (index < 0 || index >= ETAPES_TUTORIEL.length) return;

    etapeTutorielActuelle = index;
    const etape = ETAPES_TUTORIEL[index];


    // Supprimer l'ancienne bulle si elle existe
    if (bulleElement) {
        bulleElement.remove();
    }

    // Exécuter l'action de l'étape (navigation, etc.)
    if (etape.action) {
        etape.action();
    }

    // Attendre le délai si spécifié (pour laisser l'UI se mettre à jour)
    const delai = etape.delai || 300;
    setTimeout(() => {
        creerBulle(etape, index);
    }, delai);
}

/**
 * Crée la bulle d'information
 * @param {object} etape - Configuration de l'étape
 * @param {number} index - Index de l'étape
 */
function creerBulle(etape, index) {
    bulleElement = document.createElement('div');
    bulleElement.id = 'tutoriel-bulle';
    bulleElement.style.cssText = `
        position: fixed;
        background: var(--surface-conteneur, #162c36);
        border-radius: 12px;
        padding: 25px;
        max-width: 400px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideUp 0.4s ease-out;
    `;

    // Contenu de la bulle
    bulleElement.innerHTML = `
        <!-- Progress bar -->
        <div style="margin-bottom: 15px;">
            <div style="
                height: 4px;
                background: var(--bordure-claire);
                border-radius: 2px;
                overflow: hidden;
            ">
                <div style="
                    height: 100%;
                    width: ${((index + 1) / ETAPES_TUTORIEL.length) * 100}%;
                    background: linear-gradient(135deg, var(--accent-primaire), var(--bleu-clair));
                    transition: width 0.3s ease;
                "></div>
            </div>
            <div style="
                margin-top: 5px;
                font-size: 0.75rem;
                color: var(--gris-clair);
                text-align: right;
            ">
                Étape ${index + 1} sur ${ETAPES_TUTORIEL.length}
            </div>
        </div>

        <!-- Titre -->
        <h3 style="
            color: var(--accent-primaire);
            margin: 0 0 15px;
            font-size: 1.3rem;
        ">${etape.titre}</h3>

        <!-- Description -->
        <p style="
            color: var(--gris-fonce);
            margin: 0 0 20px;
            line-height: 1.6;
            font-size: 1rem;
        ">${etape.description}</p>

        <!-- Boutons de navigation -->
        <div style="
            display: flex;
            gap: 10px;
            justify-content: space-between;
        ">
            ${index > 0 ? `
                <button data-action="etapePrecedente" style="
                    padding: 10px 20px;
                    background: var(--surface-conteneur, #162c36);
                    color: var(--gris-moyen);
                    border: 1px solid var(--bordure-claire);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                " class="hover-fond-gris">
                    ← Précédent
                </button>
            ` : '<div></div>'}

            <div style="display: flex; gap: 10px;">
                <button data-action="terminerTutoriel" style="
                    padding: 10px 20px;
                    background: var(--surface-conteneur, #162c36);
                    color: var(--gris-moyen);
                    border: 1px solid var(--bordure-claire);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                " class="hover-fond-gris">
                    Terminer
                </button>

                ${index < ETAPES_TUTORIEL.length - 1 ? `
                    <button data-action="etapeSuivante" style="
                        padding: 10px 20px;
                        background: linear-gradient(135deg, var(--accent-primaire), var(--bleu-clair));
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.95rem;
                        font-weight: 500;
                        transition: all 0.2s;
                    " class="hover-elevation-bleu">
                        Suivant →
                    </button>
                ` : `
                    <button data-action="terminerTutoriel" style="
                        padding: 10px 20px;
                        background: linear-gradient(135deg, #1e5a4a, var(--vert-succes));
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.95rem;
                        font-weight: 500;
                        transition: all 0.2s;
                    " class="hover-elevation-succes">
                        Terminer ✓
                    </button>
                `}
            </div>
        </div>
    `;

    // Positionner la bulle
    positionnerBulle(bulleElement, etape);

    document.body.appendChild(bulleElement);

    // Mettre en surbrillance l'élément cible si présent
    if (etape.cible) {
        mettreEnSurbrillance(etape.cible);
    }
}

/**
 * Positionne la bulle selon l'étape
 * @param {HTMLElement} bulle - Élément bulle
 * @param {object} etape - Configuration de l'étape
 */
function positionnerBulle(bulle, etape) {
    if (etape.position === 'center' || !etape.cible) {
        // Position centrée
        bulle.style.top = '50%';
        bulle.style.left = '50%';
        bulle.style.transform = 'translate(-50%, -50%)';
        return;
    }

    // Trouver l'élément cible
    const cible = document.querySelector(etape.cible);
    if (!cible) {
        console.warn(`Élément cible introuvable: ${etape.cible}`);
        // Fallback centré
        bulle.style.top = '50%';
        bulle.style.left = '50%';
        bulle.style.transform = 'translate(-50%, -50%)';
        return;
    }

    const rect = cible.getBoundingClientRect();

    // Positionner selon la configuration
    switch (etape.position) {
        case 'bottom':
            bulle.style.top = `${rect.bottom + 20}px`;
            bulle.style.left = `${rect.left + (rect.width / 2)}px`;
            bulle.style.transform = 'translateX(-50%)';
            break;
        case 'top':
            bulle.style.bottom = `${window.innerHeight - rect.top + 20}px`;
            bulle.style.left = `${rect.left + (rect.width / 2)}px`;
            bulle.style.transform = 'translateX(-50%)';
            break;
        case 'right':
            bulle.style.top = `${rect.top + (rect.height / 2)}px`;
            bulle.style.left = `${rect.right + 20}px`;
            bulle.style.transform = 'translateY(-50%)';
            break;
        case 'left':
            bulle.style.top = `${rect.top + (rect.height / 2)}px`;
            bulle.style.right = `${window.innerWidth - rect.left + 20}px`;
            bulle.style.transform = 'translateY(-50%)';
            break;
        default:
            bulle.style.top = '50%';
            bulle.style.left = '50%';
            bulle.style.transform = 'translate(-50%, -50%)';
    }
}

/**
 * Met en surbrillance un élément cible
 * @param {string} selecteur - Sélecteur CSS de l'élément
 */
function mettreEnSurbrillance(selecteur) {
    const element = document.querySelector(selecteur);
    if (!element) return;

    // Ajouter une classe de surbrillance
    element.style.position = 'relative';
    element.style.zIndex = '9999';
    element.style.boxShadow = '0 0 0 4px rgba(6, 93, 187, 0.5)';
    element.style.transition = 'all 0.3s ease';

    // Sauvegarder l'élément pour le nettoyage
    element.dataset.tutorielHighlight = 'true';
}

/**
 * Nettoie les surbrillances
 */
function nettoyerSurbrillances() {
    const elements = document.querySelectorAll('[data-tutoriel-highlight="true"]');
    elements.forEach(el => {
        el.style.position = '';
        el.style.zIndex = '';
        el.style.boxShadow = '';
        delete el.dataset.tutorielHighlight;
    });
}

/**
 * Passe à l'étape suivante
 */
function etapeSuivante() {
    nettoyerSurbrillances();
    afficherEtape(etapeTutorielActuelle + 1);
}

/**
 * Revient à l'étape précédente
 */
function etapePrecedente() {
    nettoyerSurbrillances();
    afficherEtape(etapeTutorielActuelle - 1);
}

/**
 * Termine le tutoriel
 */
function terminerTutoriel() {
    // 🆕 BETA 92: Ne rien faire si le tutoriel n'est pas actif
    if (!tutorielActif) {
        return;
    }

    tutorielActif = false;

    // Nettoyer
    nettoyerSurbrillances();

    if (bulleElement) {
        bulleElement.style.animation = 'fadeOut 0.2s ease-out';
        setTimeout(() => bulleElement.remove(), 200);
    }

    if (overlayElement) {
        overlayElement.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => overlayElement.remove(), 300);
    }

    // Message de confirmation
    setTimeout(() => {
        afficherNotificationSucces(
            'Tutoriel terminé ! 🎓',
            'Tu es maintenant prêt à explorer l\'application. Bon suivi !'
        );
    }, 400);
}

// ============================================================================
// DÉTECTION AUTOMATIQUE
// ============================================================================

/**
 * Vérifie si on doit démarrer le tutoriel automatiquement
 */
function verifierDemarrageAutoTutoriel() {
    const tutorielVu = db.getSync('tutoriel_demo_vu', false);
    const donneesDemo = db.getSync('donnees_demo_chargees', false);

    // Si données démo chargées ET tutoriel pas encore vu
    if (donneesDemo && !tutorielVu) {
        setTimeout(() => {
            demarrerTutoriel();
        }, 2000);
    }
}

/**
 * Démarre le tutoriel si appelé par le parcours d'apprentissage (mode explicite)
 * Vérifie que le tutoriel n'a pas déjà été vu
 */
function demarrerTutorielParcours() {
    const tutorielVu = db.getSync('tutoriel_demo_vu', false);
    if (tutorielVu || tutorielActif) return;

    demarrerTutoriel();
}

// ============================================================================
// ANIMATIONS CSS
// ============================================================================

const styleTutoriel = document.createElement('style');
styleTutoriel.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(styleTutoriel);

// ============================================================================
// EXPORTS
// ============================================================================

window.demarrerTutoriel = demarrerTutoriel;
window.demarrerTutorielParcours = demarrerTutorielParcours;
window.terminerTutoriel = terminerTutoriel;
window.etapeSuivante = etapeSuivante;
window.etapePrecedente = etapePrecedente;
window.verifierDemarrageAutoTutoriel = verifierDemarrageAutoTutoriel;

// Auto-vérification au chargement
setTimeout(() => {
    verifierDemarrageAutoTutoriel();
}, 2000);


})();
