/**
 * ============================================
 * MODULE GUIDAGE - Système d'assistance contextuelle
 * ============================================
 * Fournit des conseils et boutons "Étape suivante" en mode Guidé
 * Utilisable aussi pour les toggles "conseil pratique/technique" en mode Normal
 *
 * VERSION : 1.0
 * DATE : 27 novembre 2025
 * AUTEUR : Grégoire Bédard avec Claude
 */

(function() {
'use strict';

// ============================================
// CONFIGURATION DES ÉTAPES GUIDÉES
// ============================================

const ETAPES_CONFIGURATION = [
    {
        id: 'cours',
        section: 'reglages',
        sousSection: 'reglages-cours',
        titre: 'Étape 1/5 : Informations du cours',
        message: 'Configure les informations de base de ton cours : numéro, titre, session, compétence.',
        suivante: 'trimestre'
    },
    {
        id: 'trimestre',
        section: 'reglages',
        sousSection: 'reglages-trimestre',
        titre: 'Étape 2/5 : Calendrier du trimestre',
        message: 'Définis les dates de début et fin de ton trimestre, ainsi que les congés.',
        suivante: 'horaire'
    },
    {
        id: 'horaire',
        section: 'reglages',
        // 🆕 FIX (1er fév 2026) : reglages-horaire supprimé en Beta 95, intégré dans reglages-trimestre
        sousSection: 'reglages-trimestre',
        titre: 'Étape 3/5 : Horaire des séances',
        message: 'Configure l\'horaire hebdomadaire de tes cours dans la section Trimestre.',
        suivante: 'groupe'
    },
    {
        id: 'groupe',
        section: 'reglages',
        sousSection: 'reglages-groupe',
        titre: 'Étape 4/5 : Liste des étudiants',
        message: 'Ajoute tes étudiants un par un ou importe une liste complète.',
        suivante: 'pratique'
    },
    {
        id: 'pratique',
        section: 'construction',
        sousSection: 'construction-pratiques-notation',
        titre: 'Étape 5/5 : Pratique de notation',
        message: 'Configure ta pratique de notation dans Construction → Pratiques de notation.',
        suivante: null // Dernière étape
    }
];

// ============================================
// ÉTAT DU GUIDAGE
// ============================================

let guidageActif = false;
let etapeActuelle = null;

// ============================================
// FONCTIONS PUBLIQUES
// ============================================

/**
 * Vérifie si le guidage est autorisé dans le contexte actuel
 * Autorisé en Mode Assisté OU en parcours explicite
 */
function estGuidageAutorise() {
    if (typeof estModeGuide === 'function' && estModeGuide()) return true;
    if (window.parcours && window.parcours.getMode() === 'explicite') return true;
    return false;
}

/**
 * Démarre le guidage de configuration complète
 */
function demarrerGuidageConfiguration() {
    guidageActif = true;
    etapeActuelle = 'cours';
    db.setSync('guidage_actif', true);
    db.setSync('guidage_etape', 'cours');

    afficherBoutonEtapeSuivante();
    afficherMessageGuidage();

    // Attendre que la sous-navigation soit générée
    setTimeout(() => {
        highlighterBoutonEtape();
    }, 500);
}

/**
 * Arrête le guidage
 */
function arreterGuidage() {
    guidageActif = false;
    etapeActuelle = null;
    db.removeSync('guidage_actif');
    db.removeSync('guidage_etape');

    masquerBoutonEtapeSuivante();
    masquerMessageGuidage();
    retirerHighlightBoutonEtape();
}

/**
 * Avance à l'étape suivante
 */
function etapeSuivante() {
    const etape = ETAPES_CONFIGURATION.find(e => e.id === etapeActuelle);

    if (!etape) {
        console.warn('[Guidage] Étape actuelle introuvable:', etapeActuelle);
        return;
    }

    if (!etape.suivante) {
        // Dernière étape atteinte
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Configuration complète terminée ! 🎉');
        }
        arreterGuidage();

        // Notifier le parcours pour vérifier les jalons
        if (window.parcours) {
            setTimeout(() => window.parcours.verifierJalons(), 500);
        }
        return;
    }

    // Passer à l'étape suivante
    etapeActuelle = etape.suivante;
    db.setSync('guidage_etape', etapeActuelle);

    const prochaine = ETAPES_CONFIGURATION.find(e => e.id === etapeActuelle);

    if (prochaine) {
        // Naviguer vers la prochaine étape
        afficherSection(prochaine.section);
        setTimeout(() => {
            afficherSousSection(prochaine.sousSection);
            afficherMessageGuidage();
            afficherBoutonEtapeSuivante();

            // Attendre que la sous-navigation soit mise à jour
            setTimeout(() => {
                highlighterBoutonEtape();
            }, 300);
        }, 200);
    }
}

/**
 * Affiche le bouton "Étape suivante"
 */
function afficherBoutonEtapeSuivante() {
    // Retirer bouton existant si présent
    masquerBoutonEtapeSuivante();

    if (!guidageActif || !estGuidageAutorise()) return;

    const etape = ETAPES_CONFIGURATION.find(e => e.id === etapeActuelle);
    if (!etape) return;

    // Créer le bouton
    const bouton = document.createElement('div');
    bouton.id = 'bouton-etape-suivante';
    bouton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;

    const texte = etape.suivante ? 'Étape suivante →' : 'Terminer ✓';

    bouton.innerHTML = `
        <button onclick="etapeSuivante()" style="
            background: linear-gradient(135deg, #032e5c, #065dbb);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(3, 46, 92, 0.3);
            transition: all 0.2s;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(3, 46, 92, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(3, 46, 92, 0.3)';">
            ${texte}
        </button>
    `;

    document.body.appendChild(bouton);
}

/**
 * Masque le bouton "Étape suivante"
 */
function masquerBoutonEtapeSuivante() {
    const bouton = document.getElementById('bouton-etape-suivante');
    if (bouton) {
        bouton.remove();
    }
}

/**
 * Affiche le message de guidage contextuel
 */
function afficherMessageGuidage() {
    // Retirer message existant
    masquerMessageGuidage();

    if (!guidageActif || !estGuidageAutorise()) return;

    const etape = ETAPES_CONFIGURATION.find(e => e.id === etapeActuelle);
    if (!etape) return;

    // Créer le message
    const message = document.createElement('div');
    message.id = 'message-guidage';
    message.style.cssText = `
        position: fixed;
        top: 80px;
        right: 30px;
        max-width: 400px;
        background: var(--surface-conteneur, #162c36);
        border-left: 4px solid #1a5266;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9998;
        animation: slideInRight 0.3s ease-out;
    `;

    message.innerHTML = `
        <div style="display: flex; align-items: start; gap: 12px;">
            <div style="font-size: 24px;">👋</div>
            <div style="flex: 1;">
                <div style="font-weight: 600; color: #1a5266; margin-bottom: 8px;">
                    ${etape.titre}
                </div>
                <div style="color: var(--gris-moyen); font-size: 0.9rem; line-height: 1.4;">
                    ${etape.message}
                </div>
            </div>
            <button onclick="masquerMessageGuidage()" style="
                background: none;
                border: none;
                color: var(--gris-clair);
                cursor: pointer;
                font-size: 1.2rem;
                padding: 0;
                line-height: 1;
            " title="Masquer">×</button>
        </div>
    `;

    document.body.appendChild(message);
}

/**
 * Masque le message de guidage
 */
function masquerMessageGuidage() {
    const message = document.getElementById('message-guidage');
    if (message) {
        message.remove();
    }
}

/**
 * Ajoute le highlight sur le bouton de la sous-section active
 */
function highlighterBoutonEtape() {
    // Retirer tous les highlights existants
    retirerHighlightBoutonEtape();

    if (!guidageActif || !etapeActuelle) return;

    const etape = ETAPES_CONFIGURATION.find(e => e.id === etapeActuelle);
    if (!etape) return;

    console.log('[Guidage] Tentative highlight pour:', etape.sousSection);

    // Chercher le bouton de la sous-section dans la sous-navigation
    const sousNav = document.getElementById('sous-navigation');
    if (!sousNav) {
        console.warn('[Guidage] Sous-navigation introuvable');
        return;
    }

    // Trouver tous les boutons de sous-section
    const boutons = sousNav.querySelectorAll('button');
    console.log('[Guidage] Nombre de boutons trouvés:', boutons.length);

    let boutonTrouve = false;
    boutons.forEach(bouton => {
        // Vérifier si ce bouton correspond à notre sous-section
        const dataSousOnglet = bouton.getAttribute('data-sous-onglet');
        const onClick = bouton.getAttribute('onclick');

        console.log('[Guidage] Bouton:', {
            text: bouton.textContent.trim(),
            dataSousOnglet,
            onClick
        });

        // Matcher par data-sous-onglet
        if (dataSousOnglet === etape.sousSection) {
            bouton.classList.add('highlight-etape-guidage');
            boutonTrouve = true;
            console.log('[Guidage] ✅ Highlight appliqué sur:', bouton.textContent.trim());
        }
    });

    if (!boutonTrouve) {
        console.warn('[Guidage] ⚠️ Aucun bouton trouvé pour:', etape.sousSection);
    }
}

/**
 * Retire tous les highlights des boutons d'étapes
 */
function retirerHighlightBoutonEtape() {
    const boutonsHighlight = document.querySelectorAll('.highlight-etape-guidage');
    boutonsHighlight.forEach(bouton => {
        bouton.classList.remove('highlight-etape-guidage');
    });
}

/**
 * Initialise le système de guidage au chargement
 */
function initialiserGuidage() {
    // Vérifier si un guidage était en cours
    const guidageSauvegarde = db.getSync('guidage_actif', false);
    const etapeSauvegarde = db.getSync('guidage_etape', null);

    if (guidageSauvegarde && etapeSauvegarde && estGuidageAutorise()) {
        guidageActif = true;
        etapeActuelle = etapeSauvegarde;

        // Réafficher les éléments de guidage
        setTimeout(() => {
            afficherBoutonEtapeSuivante();
            afficherMessageGuidage();

            // Attendre que la sous-navigation soit générée
            setTimeout(() => {
                highlighterBoutonEtape();
            }, 500);
        }, 1000);
    }

    console.log('✅ Module guidage.js chargé');
}

// ============================================
// EXPORTS
// ============================================

window.demarrerGuidageConfiguration = demarrerGuidageConfiguration;
window.arreterGuidage = arreterGuidage;
window.etapeSuivante = etapeSuivante;
window.afficherBoutonEtapeSuivante = afficherBoutonEtapeSuivante;
window.masquerBoutonEtapeSuivante = masquerBoutonEtapeSuivante;
window.afficherMessageGuidage = afficherMessageGuidage;
window.masquerMessageGuidage = masquerMessageGuidage;
window.initialiserGuidage = initialiserGuidage;

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserGuidage);
} else {
    initialiserGuidage();
}


})();
