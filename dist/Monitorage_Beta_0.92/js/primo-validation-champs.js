/**
 * PRIMO VALIDATION CHAMPS - Mise en évidence des champs vides
 *
 * Après la configuration avec Primo, ce module met en évidence visuellement
 * les champs qui ont été remplis vs ceux qui sont restés vides dans les Réglages.
 *
 * VERSION : 1.0
 * DATE : 27 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex) avec Claude
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Mapping des champs à valider par section de Réglages
 */
const CHAMPS_A_VALIDER = {
    'reglages-cours': [
        { id: 'numero-cours', cle: 'infoCours', champ: 'numero' },
        { id: 'titre-cours', cle: 'infoCours', champ: 'titre' },
        { id: 'session', cle: 'infoCours', champ: 'session' },
        { id: 'annee', cle: 'infoCours', champ: 'annee' },
        { id: 'enseignant', cle: 'infoCours', champ: 'enseignant' },
        { id: 'competence', cle: 'infoCours', champ: 'competence' }
    ],
    'reglages-trimestre': [
        { id: 'date-debut', cle: 'informationsTrimestre', champ: 'dateDebut' },
        { id: 'date-fin', cle: 'informationsTrimestre', champ: 'dateFin' },
        { id: 'date-maj', cle: 'informationsTrimestre', champ: 'dateMiseAJour' }
    ],
    'reglages-horaire': [
        { id: 'jour-cours-1', cle: 'horaireHebdomadaire', champ: 'jour1' },
        { id: 'heure-debut-1', cle: 'horaireHebdomadaire', champ: 'heure1Debut' },
        { id: 'heure-fin-1', cle: 'horaireHebdomadaire', champ: 'heure1Fin' },
        { id: 'local-1', cle: 'horaireHebdomadaire', champ: 'local1' },
        { id: 'jour-cours-2', cle: 'horaireHebdomadaire', champ: 'jour2' },
        { id: 'heure-debut-2', cle: 'horaireHebdomadaire', champ: 'heure2Debut' },
        { id: 'heure-fin-2', cle: 'horaireHebdomadaire', champ: 'heure2Fin' },
        { id: 'local-2', cle: 'horaireHebdomadaire', champ: 'local2' }
    ],
    'reglages-groupe': [
        // Pas d'ID spécifique, validation sur existence de groupeEtudiants
    ],
    'reglages-pratique-notation': [
        { id: 'select-pratique', cle: 'modalitesEvaluation', champ: 'pratique' }
    ]
};

// ============================================================================
// STYLES VISUELS
// ============================================================================

const STYLE_CHAMP_VIDE = `
    border: 2px solid #ff9800 !important;
    background-color: #fff3e0 !important;
    box-shadow: 0 0 8px rgba(255, 152, 0, 0.3) !important;
`;

const STYLE_CHAMP_REMPLI = `
    border: 2px solid #4caf50 !important;
    background-color: #f1f8e9 !important;
`;

// ============================================================================
// VALIDATION DES CHAMPS
// ============================================================================

/**
 * Valide tous les champs de la sous-section active
 */
function validerChampsSousSection(sousSectionId) {
    const champs = CHAMPS_A_VALIDER[sousSectionId];

    if (!champs) {
        console.log('[Primo] Pas de validation pour:', sousSectionId);
        return;
    }

    console.log('[Primo] Validation des champs pour:', sousSectionId);

    // Cas spécial: groupe d'étudiants
    if (sousSectionId === 'reglages-groupe') {
        validerGroupeEtudiants();
        return;
    }

    // Valider chaque champ
    champs.forEach(config => {
        validerChamp(config);
    });
}

/**
 * Valide un champ individuel
 */
function validerChamp(config) {
    const { id, cle, champ } = config;
    const element = document.getElementById(id);

    if (!element) {
        console.warn('[Primo] Élément introuvable:', id);
        return;
    }

    // Vérifier si le champ est rempli
    const estRempli = verifierChampRempli(cle, champ);

    // Appliquer le style approprié
    if (estRempli) {
        appliquerStyleRempli(element);
    } else {
        appliquerStyleVide(element);
    }
}

/**
 * Vérifie si un champ est rempli dans localStorage
 */
function verifierChampRempli(cle, champ) {
    const objet = db.getSync(cle, null);

    if (!objet) return false;

    if (champ) {
        // Champ dans un objet
        const valeur = objet[champ];
        return valeur !== undefined && valeur !== null && valeur !== '';
    } else {
        // Objet complet
        return Object.keys(objet).length > 0;
    }
}

/**
 * Applique le style "champ vide" (orange)
 */
function appliquerStyleVide(element) {
    element.style.border = '2px solid #ff9800';
    element.style.backgroundColor = '#fff3e0';
    element.style.boxShadow = '0 0 8px rgba(255, 152, 0, 0.3)';

    // Ajouter tooltip
    if (!element.hasAttribute('data-primo-tooltip')) {
        element.setAttribute('title', '⚠️ Champ non rempli - Complété par Primo ou à remplir manuellement');
        element.setAttribute('data-primo-tooltip', 'true');
    }
}

/**
 * Applique le style "champ rempli" (vert léger)
 */
function appliquerStyleRempli(element) {
    element.style.border = '2px solid #4caf50';
    element.style.backgroundColor = '#f1f8e9';
    element.style.boxShadow = 'none';

    // Ajouter tooltip
    if (!element.hasAttribute('data-primo-tooltip')) {
        element.setAttribute('title', '✓ Champ rempli par Primo');
        element.setAttribute('data-primo-tooltip', 'true');
    }
}

/**
 * Validation spéciale pour le groupe d'étudiants
 */
function validerGroupeEtudiants() {
    const etudiants = db.getSync('groupeEtudiants', []);
    const tableau = document.getElementById('tableau-etudiants');

    if (!tableau) return;

    if (etudiants.length === 0) {
        // Aucun étudiant : mettre en évidence le bouton "Ajouter"
        const btnAjouter = document.querySelector('#reglages-groupe button');
        if (btnAjouter && btnAjouter.textContent.includes('Ajouter')) {
            btnAjouter.style.border = '2px solid #ff9800';
            btnAjouter.style.boxShadow = '0 0 8px rgba(255, 152, 0, 0.3)';
            btnAjouter.setAttribute('title', '⚠️ Aucun étudiant - Clique pour ajouter');
        }
    } else {
        // Étudiants présents : retirer le style
        const btnAjouter = document.querySelector('#reglages-groupe button');
        if (btnAjouter) {
            btnAjouter.style.border = '';
            btnAjouter.style.boxShadow = '';
            btnAjouter.removeAttribute('title');
        }
    }
}

/**
 * Retire la validation visuelle (styles normaux)
 */
function retirerValidationVisuelle(sousSectionId) {
    const champs = CHAMPS_A_VALIDER[sousSectionId];

    if (!champs) return;

    champs.forEach(config => {
        const element = document.getElementById(config.id);
        if (element) {
            element.style.border = '';
            element.style.backgroundColor = '';
            element.style.boxShadow = '';
            element.removeAttribute('data-primo-tooltip');
            element.removeAttribute('title');
        }
    });
}

// ============================================================================
// INITIALISATION ET HOOKS
// ============================================================================

/**
 * Initialise le système de validation au chargement
 */
function initialiserValidationChamps() {
    console.log('✅ Module primo-validation-champs.js chargé');

    // Vérifier si Primo a été complété
    const primoComplete = db.getSync('primo_accueil_vu', false);

    if (primoComplete) {
        console.log('[Primo] Configuration complétée - Validation activée');
        activerValidationAutomatique();
    }
}

/**
 * Active la validation automatique lors du changement de sous-section
 */
function activerValidationAutomatique() {
    // Hook sur le changement de sous-section
    // On utilise un MutationObserver pour détecter les changements
    const observer = new MutationObserver(() => {
        // Trouver la sous-section active
        const sousSectionActive = document.querySelector('[id^="reglages-"]:not([style*="display: none"])');

        if (sousSectionActive) {
            const sousSectionId = sousSectionActive.id;

            // Attendre que le contenu soit chargé
            setTimeout(() => {
                validerChampsSousSection(sousSectionId);
            }, 300);
        }
    });

    // Observer les changements dans #contenu-principal
    const contenu = document.getElementById('contenu-principal');
    if (contenu) {
        observer.observe(contenu, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
    }
}

/**
 * Fonction manuelle pour valider la sous-section actuelle
 */
function validerSousSectionActuelle() {
    const sousSectionActive = document.querySelector('[id^="reglages-"]:not([style*="display: none"])');

    if (sousSectionActive) {
        validerChampsSousSection(sousSectionActive.id);
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

window.validerChampsSousSection = validerChampsSousSection;
window.validerSousSectionActuelle = validerSousSectionActuelle;
window.retirerValidationVisuelle = retirerValidationVisuelle;
window.initialiserValidationChamps = initialiserValidationChamps;

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserValidationChamps);
} else {
    initialiserValidationChamps();
}
