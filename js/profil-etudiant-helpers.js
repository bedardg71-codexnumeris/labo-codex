/* ===============================
   MODULE 15a: PROFIL ÉTUDIANT — HELPERS
   Extrait de profil-etudiant.js (zone L50-636) — refactor 17 mai 2026

   Contenu de ce sous-module :
   - Helpers IDME (couleurs, conversion pourcentage→niveau)
   - Terminologie configurable (artefact/production)
   - Accesseurs (pratique actuelle, grille de référence, critères avec valeurs)
   - Init module (initialiserModuleProfilEtudiant)
   - Badges (pratique, risque, pattern)
   - Interprétations des indices A-C-P-M (mobilisation, performance, complétion, assiduité)

   Tous les helpers sont promus `window.X` (Écart #4 MODULES-MAP §2.3 + décision
   étape 1 b — convention systématique cross-zones).

   Chargé AVANT profil-etudiant.js (zone résidu) dans index.html — les sections,
   calculs, diagnostics, rapport, actions et confidentiel l'utilisent via window.X.
   =============================== */

(function() {
'use strict';

/* ===============================
   🎨 FONCTIONS HELPER POUR COULEURS IDME
   =============================== */

/* ===============================
   📚 FONCTION HELPER POUR TERMINOLOGIE CONFIGURABLE
   =============================== */

/**
 * Retourne le terme approprié pour désigner les productions évaluées selon la pratique de notation
 * Évite le terme "artefact" codé en dur qui est spécifique au portfolio
 *
 * DISTINCTION IMPORTANTE :
 * - Production = Travail soumis par l'élève (objet évalué)
 * - Évaluation = Acte pédagogique de l'enseignant (porter un jugement)
 *
 * @param {string} context - Contexte d'utilisation: 'singulier', 'pluriel', 'partitif' (d'artefact)
 * @param {boolean} majuscule - Mettre une majuscule (défaut: false)
 * @returns {string} - Le terme approprié ("artefact", "production", "travail", etc.)
 */
function obtenirTermeProduction(context = 'singulier', majuscule = false) {
    const config = db.getSync('modalitesEvaluation', {});
    const pratique = config.pratique || 'pan-maitrise';

    // Définir les termes selon la pratique
    let termes = {
        singulier: 'artefact',
        pluriel: 'artefacts',
        partitif: "d'artefact"
    };

    // PAN-Standards : terme "artefact" (portfolio d'apprentissage)
    if (pratique === 'pan-maitrise') {
        // Configuration personnalisée possible dans le futur
        const termePerso = config.termeProduction || 'artefact';
        termes = {
            singulier: termePerso,
            pluriel: termePerso + 's',
            partitif: "d'" + termePerso
        };
    }
    // Sommative ou autre : terme "production" (neutre et non ambigu)
    else {
        termes = {
            singulier: 'production',
            pluriel: 'productions',
            partitif: 'de production'
        };
    }

    let terme = termes[context] || termes.singulier;

    // Appliquer majuscule si demandé
    if (majuscule) {
        terme = terme.charAt(0).toUpperCase() + terme.slice(1);
    }

    return terme;
}

/**
 * Obtient la couleur d'un niveau IDME depuis l'échelle configurée
 * @param {string} codeNiveau - Code du niveau (I, D, M, E, 0)
 * @returns {string} - Couleur CSS (hex ou var(--...))
 */
function obtenirCouleurNiveauIDME(codeNiveau) {
    if (!codeNiveau) return '#999999';

    // Lire l'échelle IDME par défaut (première échelle trouvée)
    const echelles = db.getSync('echellesTemplates', []);
    const echelleIDME = echelles.find(e => e.nom && e.nom.toLowerCase().includes('idme')) || echelles[0];

    if (!echelleIDME || !echelleIDME.niveaux) {
        // Couleurs par défaut si pas d'échelle
        const couleursDefaut = {
            '0': '#9E9E9E',
            'I': '#F44336',
            'D': '#FF9800',
            'M': '#4CAF50',
            'E': '#2196F3'
        };
        return couleursDefaut[codeNiveau] || '#999999';
    }

    const niveau = echelleIDME.niveaux.find(n => n.code === codeNiveau);
    return niveau ? niveau.couleur : '#999999';
}

/**
 * Détermine le niveau IDME d'un pourcentage selon les seuils configurés
 * @param {number} pourcentage - Pourcentage (0-100)
 * @returns {string} - Code niveau ('I', 'D', 'M', 'E')
 */
function obtenirNiveauIDMEDepuisPourcentage(pourcentage) {
    const seuilInsuffisant = obtenirSeuil('idme.insuffisant'); // Par défaut 65%
    const seuilDeveloppement = obtenirSeuil('idme.developpement'); // Par défaut 75%
    const seuilMaitrise = obtenirSeuil('idme.maitrise'); // Par défaut 85%

    if (pourcentage < seuilInsuffisant) return 'I';
    if (pourcentage < seuilDeveloppement) return 'D';
    if (pourcentage < seuilMaitrise) return 'M';
    return 'E';
}

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Obtient le nombre de productions à analyser pour les patterns
 * depuis la configuration des seuils d'interprétation
 * @returns {number} - Nombre de productions (défaut: 3)
 */
function obtenirNombreProductionsPourPatterns() {
    const seuils = chargerSeuilsInterpretation();
    return seuils.nombreProductionsAnalyse || 3;
}

/**
 * Retourne les IDs des productions évaluables selon la pratique active.
 * PAN/Standards : artefacts de portfolio uniquement (type 'artefact-portfolio')
 * Sommative : toutes les productions sauf le conteneur portfolio
 * @param {Array} productions - Liste des productions
 * @returns {Array<string>} - IDs des productions évaluables
 */
function obtenirIdsProductionsEvaluables(productions) {
    var config = db.getSync('modalitesEvaluation', {});
    var estPAN = config.pratique === 'alternative';
    if (estPAN) {
        return productions.filter(function(p) { return p.type === 'artefact-portfolio'; }).map(function(p) { return p.id; });
    }
    // Sommative : toutes les productions sauf le conteneur portfolio
    return productions.filter(function(p) { return p.type !== 'portfolio'; }).map(function(p) { return p.id; });
}

/**
 * Obtient l'instance de la pratique actuelle configurée
 * @returns {Object} - Instance de la pratique (PratiquePANMaitrise ou PratiqueSommative)
 */
function obtenirPratiqueActuelle() {
    const modalites = db.getSync('modalitesEvaluation', {});
    const pratiqueId = modalites.pratique || 'pan-maitrise';

    // Obtenir l'instance depuis le registre
    if (typeof obtenirPratiqueParId === 'function') {
        const pratique = obtenirPratiqueParId(pratiqueId);
        // ✅ CORRECTIF (10 déc 2025): Ne retourner que si non-null
        if (pratique) {
            return pratique;
        }
        // Sinon, continuer vers le fallback
    }

    // Fallback : créer une instance directement
    // ✅ CORRECTIF (10 déc 2025): Reconnaître les variantes d'ID
    if (pratiqueId === 'sommative') {
        return new PratiqueSommative();
    } else if (pratiqueId.startsWith('pan-maitrise')) {
        // Reconnaît: pan-maitrise, pan-maitrise-json, etc.
        return new PratiquePANMaitrise();
    } else {
        // Par défaut, utiliser PAN-Standards
        return new PratiquePANMaitrise();
    }
}

/**
 * Obtient la grille de référence configurée pour le dépistage
 * Cette grille définit les critères utilisés pour identifier forces/défis
 *
 * @returns {Object|null} - Grille complète avec {id, nom, criteres[], ...} ou null si non configurée
 */
function obtenirGrilleReferenceDepistage() {
    // Lire la préférence utilisateur
    const grilleId = obtenirPreference('grilleReferenceDepistage');

    if (!grilleId) {
        // Fraîche installation ou pas de grille sélectionnée pour le dépistage.
        // Silent : le profil étudiant affiche son fallback sans signal console.
        return null;
    }

    // Lire toutes les grilles
    const grilles = db.getSync('grillesTemplates', []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille) {
        // Auto-nettoyage silencieux : la grille référencée a été supprimée
        // (cas d'une grille utilisateur effacée puis référence non nettoyée).
        // On retire la préférence pour éviter que le message d'erreur ne se
        // répète à chaque rendu de l'aperçu.
        console.warn(`[Depistage] Grille de référence "${grilleId}" introuvable — préférence auto-nettoyée`);
        if (typeof definirPreference === 'function') {
            definirPreference('grilleReferenceDepistage', '');
        }
        return null;
    }

    return grille;
}

/**
 * Obtient la liste des critères de la grille de référence avec leurs valeurs pour un étudiant
 * Cette fonction remplace le tableau SRPNF codé en dur par une extraction dynamique
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Array} - Tableau de { nom, valeur, cleNormalisee } ou tableau vide si erreur
 */
function obtenirCriteresAvecValeurs(da) {
    const grille = obtenirGrilleReferenceDepistage();
    if (!grille || !grille.criteres || grille.criteres.length === 0) {
        console.warn('⚠️ Pas de grille de référence - impossible d\'obtenir les critères');
        return [];
    }

    const moyennesCriteres = calculerMoyennesCriteres(da);
    if (!moyennesCriteres) {
        console.warn('⚠️ Pas de moyennes calculées pour DA', da);
        return [];
    }

    // Construire le tableau dynamiquement depuis la grille
    return grille.criteres.map(critere => {
        const cleNormalisee = critere.nom.toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/\s+/g, '');

        // Standardiser la clé pour correspondre au format de calculerMoyennesCriteres()
        // "francaisecrit" → "francais" pour éviter les 0% incorrects
        let cleStandard = cleNormalisee;
        if (cleNormalisee.startsWith('francais')) {
            cleStandard = 'francais';
        }

        return {
            nom: critere.nom,
            valeur: moyennesCriteres[cleStandard] ?? 0,
            cleNormalisee: cleNormalisee
        };
    });
}

/**
 * Initialise le module de profil étudiant
 * Appelée automatiquement par 99-main.js au chargement
 *
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent
 * 2. Attache les événements si nécessaire
 *
 * NOTE: Ce module est principalement appelé par d'autres modules
 * via afficherProfilComplet(da)
 */
function initialiserModuleProfilEtudiant() {

    // Vérifier que le conteneur existe
    const container = document.getElementById('contenuProfilEtudiant');
    if (!container) {
        return;
    }

}

/* ===============================
   🔧 FONCTIONS HELPERS
   =============================== */

/**
 * Génère un badge compact indiquant la pratique de notation pour le profil
 * DÉPRÉCIÉ: Utiliser genererBadgePratique() global à la place
 * @param {string} pratiqueUtilisee - 'SOM' ou 'PAN' (fourni par calculerTousLesIndices)
 * @param {boolean} modeComparatif - true pour afficher les deux badges
 * @returns {string} - HTML du badge
 */
function genererBadgePratiqueProfil(pratiqueUtilisee, modeComparatif = false) {
    // Mode comparatif: afficher les deux badges
    if (modeComparatif) {
        return genererBadgePratique('SOM', true) + genererBadgePratique('PAN', true);
    }

    // Mode normal: un seul badge (utiliser la fonction globale)
    return genererBadgePratique(pratiqueUtilisee, true);
}

/**
 * Génère un badge de risque (Beta 84)
 * @param {number} risque - Valeur du risque (0-1)
 * @returns {string} - HTML du badge
 */
function genererBadgeRisqueProfil(risque) {
    let classe = '';
    let label = '';

    if (risque <= 0.20) {
        classe = 'badge-sys badge-risque-minimal';
        label = 'Minimal';
    } else if (risque <= 0.30) {
        classe = 'badge-sys badge-risque-faible';
        label = 'Faible';
    } else if (risque <= 0.40) {
        classe = 'badge-sys badge-risque-modere';
        label = 'Modéré';
    } else if (risque <= 0.50) {
        classe = 'badge-sys badge-risque-eleve';
        label = 'Élevé';
    } else if (risque <= 0.70) {
        classe = 'badge-sys badge-risque-tres-eleve';
        label = 'Très élevé';
    } else {
        classe = 'badge-sys badge-risque-critique';
        label = 'Critique';
    }

    return `<span class="${classe}">${label}</span>`;
}

/**
 * Génère un badge de pattern (Beta 84)
 * @param {string} pattern - Pattern d'apprentissage
 * @returns {string} - HTML du badge
 */
function genererBadgePatternProfil(pattern) {
    let classe = '';

    switch(pattern) {
        case 'Difficulté persistante':
            classe = 'badge-sys badge-pattern-difficulte-persistante';
            break;
        case 'Difficulté émergente':
            classe = 'badge-sys badge-pattern-difficulte-emergente';
            break;
        case 'Défi spécifique':
            classe = 'badge-sys badge-pattern-defi-specifique';
            break;
        case 'Stable':
            classe = 'badge-sys badge-pattern-stable';
            break;
        case 'En progression':
            classe = 'badge-sys badge-pattern-progression';
            break;
        default:
            classe = 'badge-sys';
    }

    return `<span class="${classe}">${pattern}</span>`;
}

// calculerTousLesIndices → déplacé dans indices.js (#206)

/**
 * Interprète l'indice M (Mobilisation) selon la logique pédagogique avancée
 * Implémente la formule Excel avec diagnostic précis des composantes A et C
 * @param {number} A - Assiduité en proportion 0-1
 * @param {number} C - Complétion en proportion 0-1
 * @param {boolean} statutDecrochage - Indicateur de décrochage (défaut: false)
 * @returns {Object} - { niveau, emoji, couleur }
 */
function interpreterMobilisation(A, C, statutDecrochage = false) {
    // 1. Décrochage (priorité absolue - interventions impossibles)
    if (statutDecrochage) {
        return {
            niveau: 'Décrochage',
            emoji: '⚫',
            couleur: '#9e9e9e' // Gris
        };
    }

    // 2. Assiduité ET complétion critiques (A<0.7 ET C<0.7)
    if (A < 0.7 && C < 0.7) {
        return {
            niveau: 'Assiduité ET complétion critiques',
            emoji: '🔴',
            couleur: '#dc3545' // Rouge
        };
    }

    // 3. Assiduité critique seule (A<0.7)
    if (A < 0.7) {
        return {
            niveau: 'Assiduité critique',
            emoji: '🟠',
            couleur: '#ff9800' // Orange
        };
    }

    // 4. Complétion critique seule (C<0.7)
    if (C < 0.7) {
        return {
            niveau: 'Complétion critique',
            emoji: '🟠',
            couleur: '#ff9800' // Orange
        };
    }

    // 5. Mobilisation fragile (A<0.8 ET C<0.8)
    if (A < 0.8 && C < 0.8) {
        return {
            niveau: 'Mobilisation fragile',
            emoji: '🟡',
            couleur: '#ffc107' // Jaune
        };
    }

    // 6. Assiduité fragile (A<0.8 ET C≥0.8)
    if (A < 0.8 && C >= 0.8) {
        return {
            niveau: 'Assiduité fragile',
            emoji: '🟡',
            couleur: '#ffc107' // Jaune
        };
    }

    // 7. Complétion fragile (A≥0.8 ET C<0.8)
    if (A >= 0.8 && C < 0.8) {
        return {
            niveau: 'Complétion fragile',
            emoji: '🟡',
            couleur: '#ffc107' // Jaune
        };
    }

    // 8. Favorable (A≥0.9 ET C≥0.9)
    if (A >= 0.9 && C >= 0.9) {
        return {
            niveau: 'Favorable',
            emoji: '🔵',
            couleur: '#2196F3' // Bleu
        };
    }

    // 9. Acceptable (sinon: A≥0.8 ET C≥0.8, mais pas tous deux ≥0.9)
    return {
        niveau: 'Acceptable',
        emoji: '🟢',
        couleur: '#28a745' // Vert
    };
}

/**
 * Interprète l'indice P (Performance)
 * @param {number} valeur - Valeur en pourcentage (0-100)
 * @returns {Object} - { niveau, emoji, couleur, description }
 */
function interpreterPerformance(valeur) {
    const p = valeur / 100; // Normaliser en 0-1
    if (p >= 0.85) {
        return {
            niveau: 'Performance excellente',
            emoji: '🔵',
            couleur: '#2196F3', // Bleu
            description: 'Maîtrise étendue des compétences avec transfert à d\'autres contextes'
        };
    }
    if (p >= 0.75) {
        return {
            niveau: 'Performance satisfaisante',
            emoji: '🟢',
            couleur: '#28a745', // Vert
            description: 'Maîtrise globale avec liens établis entre les concepts'
        };
    }
    if (p >= 0.65) {
        return {
            niveau: 'En développement',
            emoji: '🟡',
            couleur: '#ffc107', // Jaune
            description: 'Points pertinents identifiés, liens à consolider'
        };
    }
    if (p >= 0.40) {
        return {
            niveau: 'Performance insuffisante',
            emoji: '🟠',
            couleur: '#ff9800', // Orange
            description: 'Compréhension superficielle, renforcement nécessaire'
        };
    }
    return {
        niveau: 'Performance très faible',
        emoji: '🔴',
        couleur: '#dc3545', // Rouge
        description: 'Incompréhension majeure, intervention urgente requise'
    };
}

/**
 * Interprète l'indice C (Complétion)
 * @param {number} valeur - Valeur en pourcentage (0-100)
 * @returns {Object} - { niveau, emoji, couleur, description }
 */
function interpreterCompletion(valeur) {
    const c = valeur / 100; // Normaliser en 0-1
    const seuilExcellent = obtenirSeuil('interpretation.excellent');
    const seuilBon = obtenirSeuil('interpretation.bon');
    const seuilAcceptable = obtenirSeuil('interpretation.acceptable');

    if (c >= seuilExcellent) {
        return {
            niveau: 'Taux de complétion excellent',
            emoji: '🔵',
            couleur: '#2196F3', // Bleu
            description: 'Remise régulière et complète des travaux'
        };
    }
    if (c >= seuilBon) {
        return {
            niveau: 'Bon taux de complétion',
            emoji: '🟢',
            couleur: '#28a745', // Vert
            description: 'Majorité des travaux remis'
        };
    }
    if (c >= seuilAcceptable) {
        return {
            niveau: 'Complétion acceptable',
            emoji: '🟡',
            couleur: '#ffc107', // Jaune
            description: 'Quelques travaux manquants, suivi recommandé'
        };
    }
    if (c >= 0.60) {
        return {
            niveau: 'Complétion insuffisante',
            emoji: '🟠',
            couleur: '#ff9800', // Orange
            description: 'Nombreux travaux manquants, intervention nécessaire'
        };
    }
    return {
        niveau: 'Complétion critique',
        emoji: '🔴',
        couleur: '#dc3545', // Rouge
        description: 'Travaux non remis, situation critique'
    };
}

/**
 * Interprète l'indice A (Assiduité)
 * @param {number} valeur - Valeur en pourcentage (0-100)
 * @returns {Object} - { niveau, emoji, couleur, description }
 */
function interpreterAssiduite(valeur) {
    const a = valeur / 100; // Normaliser en 0-1
    const seuilExcellent = obtenirSeuil('interpretation.excellent');
    const seuilBon = obtenirSeuil('interpretation.bon');
    const seuilAcceptable = obtenirSeuil('interpretation.acceptable');

    if (a >= seuilExcellent) {
        return {
            niveau: 'Assiduité exemplaire',
            emoji: '🔵',
            couleur: '#2196F3', // Bleu
            description: 'Présence constante et engagement soutenu'
        };
    }
    if (a >= seuilBon) {
        return {
            niveau: 'Bonne assiduité',
            emoji: '🟢',
            couleur: '#28a745', // Vert
            description: 'Présence régulière avec absences rares et justifiées'
        };
    }
    if (a >= seuilAcceptable) {
        return {
            niveau: 'Assiduité acceptable',
            emoji: '🟡',
            couleur: '#ffc107', // Jaune
            description: 'Quelques absences, suivi recommandé'
        };
    }
    if (a >= 0.60) {
        return {
            niveau: 'Assiduité insuffisante',
            emoji: '🟠',
            couleur: '#ff9800', // Orange
            description: 'Absences fréquentes, intervention nécessaire'
        };
    }
    return {
        niveau: 'Assiduité critique',
        emoji: '🔴',
        couleur: '#dc3545', // Rouge
        description: 'Absences excessives, situation d\'urgence'
    };
}

// Exporter les 16 fonctions vers window (décision étape 1 b — convention systématique
// cross-zones, Écart #4 MODULES-MAP §2.3)
window.obtenirTermeProduction = obtenirTermeProduction;
window.obtenirCouleurNiveauIDME = obtenirCouleurNiveauIDME;
window.obtenirNiveauIDMEDepuisPourcentage = obtenirNiveauIDMEDepuisPourcentage;
window.obtenirNombreProductionsPourPatterns = obtenirNombreProductionsPourPatterns;
window.obtenirIdsProductionsEvaluables = obtenirIdsProductionsEvaluables;
window.obtenirPratiqueActuelle = obtenirPratiqueActuelle;
window.obtenirGrilleReferenceDepistage = obtenirGrilleReferenceDepistage;
window.obtenirCriteresAvecValeurs = obtenirCriteresAvecValeurs;
window.initialiserModuleProfilEtudiant = initialiserModuleProfilEtudiant;
window.genererBadgePratiqueProfil = genererBadgePratiqueProfil;
window.genererBadgeRisqueProfil = genererBadgeRisqueProfil;
window.genererBadgePatternProfil = genererBadgePatternProfil;
window.interpreterMobilisation = interpreterMobilisation;
window.interpreterPerformance = interpreterPerformance;
window.interpreterCompletion = interpreterCompletion;
window.interpreterAssiduite = interpreterAssiduite;

})();
