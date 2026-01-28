/* ===============================
   MODULE 15: PROFIL DÉTAILLÉ D'UN ÉTUDIANT
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère l'affichage complet du profil individuel
   d'un étudiant dans la section Étudiants › Profil.
   
   Contenu de ce module:
   - Affichage des informations de l'étudiant
   - Gestion du portfolio d'apprentissage
   - Sélection des artefacts à retenir
   - Calcul des notes provisoires et finales
   - (À développer) Historique d'assiduité
   - (À développer) Indices A-C-P détaillés
   - (À développer) Graphiques de progression
   =============================== */

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : echapperHtml()
   - 02-navigation.js : afficherSousSection()
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   - afficherSousSection() (depuis 02-navigation.js)
   
   Éléments HTML requis:
   - #contenuProfilEtudiant : Conteneur principal du profil
   - #portfolioEleveDetail : Conteneur du portfolio
   - #etudiants-profil : Sous-section (gérée par 02-navigation.js)
   
   LocalStorage utilisé:
   - 'groupeEtudiants' : Array des étudiants
   - 'productions' : Array des productions (dont artefacts)
   - 'evaluationsSauvegardees' : Array des évaluations
   - 'portfoliosEleves' : Object avec sélections d'artefacts
   
   COMPATIBILITÉ:
   - ES6+ requis
   - Navigateurs modernes
   - Pas de dépendances externes
   =============================== */

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
    // Lire la configuration
    const modalites = db.getSync('modalitesEvaluation', {});
    const grilleId = modalites.grilleReferenceDepistage;

    if (!grilleId) {
        console.warn('⚠️ Aucune grille de référence configurée pour le dépistage');
        return null;
    }

    // Lire toutes les grilles
    const grilles = db.getSync('grillesTemplates', []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille) {
        console.error(`❌ Grille de référence "${grilleId}" introuvable`);
        return null;
    }

    console.log(`✅ Grille de référence: "${grille.nom}" (${grille.criteres.length} critères)`);
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
            .replace(/[\u0300-\u036f]/g, '')
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
    console.log('👤 Initialisation du module Profil Étudiant');

    // Vérifier que le conteneur existe
    const container = document.getElementById('contenuProfilEtudiant');
    if (!container) {
        console.log('   ⚠️  Conteneur profil non trouvé, initialisation reportée');
        return;
    }

    console.log('   ✅ Module Profil Étudiant initialisé');
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
        case 'Blocage critique':
            classe = 'badge-sys badge-pattern-blocage-critique';
            break;
        case 'Blocage émergent':
            classe = 'badge-sys badge-pattern-blocage-emergent';
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

/**
 * Calcule tous les indices pour un étudiant
 *
 * @param {string} da - Numéro de DA
 * @param {string} pratique - (Optionnel) 'SOM' ou 'PAN' pour forcer une pratique
 *                            Si non spécifié, détecte depuis modalitesEvaluation
 * @returns {Object} - Objet avec tous les indices
 *
 * STRUCTURE DE RETOUR :
 * {
 *   A: 85,              // % assiduité
 *   C: 67,              // % complétion (selon pratique)
 *   P: 72,              // % performance (selon pratique)
 *   M: 0.760,           // Mobilisation (composite)
 *   E: 0.781,           // Engagement (composite, racine cubique)
 *   pratique: 'SOM'     // Pratique utilisée pour le calcul
 * }
 */
function calculerTousLesIndices(da, pratique = null) {
    // ========================================
    // INDICE A : SINGLE SOURCE OF TRUTH
    // Lire depuis db.getSync('indicesAssiduite') (calculé par saisie-presences.js)
    // ========================================
    const indicesAssiduite = db.getSync((typeof cle === 'function') ? cle('indicesAssiduite') : 'indicesAssiduite', {});
    const assiduiteSommatif = indicesAssiduite.sommatif?.[da];

    // Extraire l'indice (gérer ancien format nombre et nouveau format objet)
    let A = 0;
    if (typeof assiduiteSommatif === 'object' && assiduiteSommatif.indice !== undefined) {
        A = assiduiteSommatif.indice; // Déjà en proportion 0-1
    } else if (typeof assiduiteSommatif === 'number') {
        A = assiduiteSommatif; // Ancien format, déjà en proportion 0-1
    }

    // 🔍 DÉTERMINER LA PRATIQUE À UTILISER
    if (!pratique) {
        // Détecter depuis la configuration
        const config = db.getSync('modalitesEvaluation', {});
        pratique = config.pratique === 'sommative' ? 'SOM' : 'PAN';
    }

    // INDICES C, P, E : Lire depuis db.getSync('indicesCP') (Single Source of Truth)
    let C = 0;
    let P = 0;
    let E = 0; // ✅ NOUVEAU (7 déc 2025): E lu depuis indicesCP au lieu d'être recalculé

    if (typeof obtenirIndicesCP === 'function') {
        const indicesCP = obtenirIndicesCP(da, pratique); // Lire la branche spécifique
        if (indicesCP) {
            C = indicesCP.C / 100; // Convertir en proportion 0-1
            P = indicesCP.P / 100;
            // ✅ NOUVEAU (7 déc 2025): Lire E depuis indicesCP (SST)
            E = indicesCP.E !== undefined ? indicesCP.E : 0;
        } else {
            // Fallback : calculer à la volée si pas encore généré
            console.warn(`⚠️ indicesCP non trouvé pour ${da} (${pratique}) - Calcul à la volée`);
            C = calculerTauxCompletion(da) / 100;
            P = calculerPerformancePAN(da);
            // Fallback E: calculer si pas disponible
            const E_brut = A * C * P;
            E = Math.pow(E_brut, 1/3);
        }
    } else {
        // Fallback : fonctions anciennes si module portfolio.js pas chargé
        console.warn('⚠️ obtenirIndicesCP non disponible - Calcul à la volée');
        C = calculerTauxCompletion(da) / 100;
        P = calculerPerformancePAN(da);
        // Fallback E: calculer si pas disponible
        const E_brut = A * C * P;
        E = Math.pow(E_brut, 1/3);
    }

    // INDICES COMPOSITES
    const M = (A + C) / 2;  // Mobilisation (conservé pour compatibilité, mais plus utilisé)

    return {
        // Indices primaires (en pourcentage pour compatibilité affichage)
        A: Math.round(A * 100),
        C: Math.round(C * 100),
        P: Math.round(P * 100),

        // Indices composites (valeurs normalisées 0-1 avec 3 décimales)
        M: parseFloat(M.toFixed(3)),
        E: parseFloat(E.toFixed(3)),

        // Traçabilité de la pratique utilisée
        pratique: pratique
    };
}

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
 * Interprète l'indice E (Engagement) selon les seuils IDME adaptés
 * @param {number} valeur - Valeur normalisée entre 0 et 1
 * @returns {Object} - { niveau, emoji, couleur }
 */
function interpreterEngagement(valeur) {
    if (valeur >= 0.85) {
        return {
            niveau: 'Excellent engagement',
            emoji: '🔵',
            couleur: '#2196F3' // Bleu
        };
    }
    if (valeur >= 0.75) {
        return {
            niveau: 'Bon engagement',
            emoji: '🟢',
            couleur: '#28a745' // Vert
        };
    }
    if (valeur >= 0.65) {
        return {
            niveau: 'En développement',
            emoji: '🟡',
            couleur: '#ffc107' // Jaune
        };
    }
    if (valeur >= 0.40) {
        return {
            niveau: 'Engagement insuffisant',
            emoji: '🟠',
            couleur: '#ff9800' // Orange
        };
    }
    return {
        niveau: 'Engagement très faible',
        emoji: '🔴',
        couleur: '#dc3545' // Rouge
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

/**
 * Génère le HTML de la section Engagement (E = A × C × P)
 * Structure en 3 colonnes: Assiduité, Complétion, Performance
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionMobilisationEngagement(da) {
    const indices = calculerTousLesIndices(da);
    const A = indices.A / 100;
    const C = indices.C / 100;
    const interpE = interpreterEngagement(indices.E);

    // NOUVEAU (Beta 90): Calcul dual pour mode comparatif
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};

    // ✅ CORRECTION (7 déc 2025): Vérifier explicitement === true pour éviter mode comparatif par défaut
    const afficherSom = affichage.afficherSommatif === true;
    const afficherPan = affichage.afficherAlternatif === true;
    const modeComparatif = afficherSom && afficherPan;

    // ✅ OPTIMISATION (7 déc 2025): Calculer uniquement la pratique active sauf en mode comparatif
    let indicesSOM, indicesPAN, directionSOM, directionPAN;

    if (modeComparatif) {
        // Mode comparatif: calculer les deux pratiques
        indicesSOM = calculerTousLesIndices(da, 'SOM');
        indicesPAN = calculerTousLesIndices(da, 'PAN');
        directionSOM = calculerDirectionEngagement(da, 'SOM');
        directionPAN = calculerDirectionEngagement(da, 'PAN');
    } else {
        // Mode normal: calculer seulement la pratique active
        const indicesActifs = calculerTousLesIndices(da);
        const directionActive = calculerDirectionEngagement(da);

        // Assigner aux bonnes variables selon la pratique active
        if (config.pratique === 'sommative') {
            indicesSOM = indicesActifs;
            indicesPAN = { A: indicesActifs.A, C: 0, P: 0, M: 0, E: 0 }; // Valeurs nulles pour PAN
            directionSOM = directionActive;
            directionPAN = { direction: 'stable', emoji: '→' };
        } else {
            indicesPAN = indicesActifs;
            indicesSOM = { A: indicesActifs.A, C: 0, P: 0, M: 0, E: 0 }; // Valeurs nulles pour SOM
            directionPAN = directionActive;
            directionSOM = { direction: 'stable', emoji: '→' };
        }
    }

    // Calculer engagement pour les deux pratiques (E = racine cubique de A × C × P)
    const A_pct = indicesSOM.A / 100; // A est identique pour les deux pratiques
    const C_SOM = indicesSOM.C / 100;
    const P_SOM = indicesSOM.P / 100;
    const E_brut_SOM = A_pct * C_SOM * P_SOM;
    const E_SOM = Math.pow(E_brut_SOM, 1/3); // Racine cubique

    const C_PAN = indicesPAN.C / 100;
    const P_PAN = indicesPAN.P / 100;
    const E_brut_PAN = A_pct * C_PAN * P_PAN;
    const E_PAN = Math.pow(E_brut_PAN, 1/3); // Racine cubique

    // Récupérer les données pour les trois sections
    const detailsA = obtenirDetailsAssiduite(da);
    const tauxA = detailsA.heuresOffertes > 0
        ? (detailsA.heuresPresentes / detailsA.heuresOffertes * 100).toFixed(1)
        : 0;
    const interpA = interpreterAssiduite(parseFloat(tauxA));

    // 🆕 BETA 95.6 : Détecter si aucune donnée n'est saisie pour cet étudiant
    // Permet d'afficher "En attente de données" au lieu de messages trompeurs
    const aucuneDonneeAssiduite = detailsA.heuresOffertes === 0;

    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const productions = obtenirDonneesSelonMode('productions') || [];
    const portfolio = productions.find(p => p.type === 'portfolio');
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');
    const artefactsPortfolioIds = new Set(artefactsPortfolio.map(a => a.id));
    const artefactsDonnes = [];
    evaluations.forEach(evaluation => {
        if (artefactsPortfolioIds.has(evaluation.productionId)) {
            if (!artefactsDonnes.find(a => a.id === evaluation.productionId)) {
                const production = artefactsPortfolio.find(p => p.id === evaluation.productionId);
                if (production) {
                    artefactsDonnes.push(production);
                }
            }
        }
    });
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);
    const artefacts = artefactsDonnes.map(art => {
        // Trouver l'évaluation ACTIVE (non remplacée) pour cette production
        const evaluationsProduction = evaluationsEleve.filter(e => e.productionId === art.id);
        let evaluation = null;
        if (evaluationsProduction.length > 0) {
            // PRIORITÉ 1 : Chercher une reprise active (repriseDeId ET non remplacée)
            evaluation = evaluationsProduction.find(e => e.repriseDeId && !e.remplaceeParId);

            // PRIORITÉ 2 : Si pas de reprise, chercher une évaluation avec jeton de délai actif
            if (!evaluation) {
                evaluation = evaluationsProduction.find(e => e.jetonDelaiApplique && !e.remplaceeParId);
            }

            // PRIORITÉ 3 : Si pas de jeton, chercher toute évaluation active (non remplacée)
            if (!evaluation) {
                evaluation = evaluationsProduction.find(e => !e.remplaceeParId);
            }

            // PRIORITÉ 4 : Si toutes sont remplacées, prendre la première (cas rare)
            if (!evaluation) {
                evaluation = evaluationsProduction[0];
            }
        }

        // Vérifier le statut de remise (source unique de vérité)
        const statutRemise = evaluation?.statutRemise || 'non-remis';
        const statutIntegrite = evaluation?.statutIntegrite || 'recevable';

        // Un travail non-recevable (plagiat, IA) n'est PAS considéré comme remis
        const estNonRecevable = statutIntegrite === 'plagiat' || statutIntegrite === 'ia';
        const estRemis = evaluation &&
            (statutRemise !== 'non-remis' && statutRemise !== 'retard') &&
            !estNonRecevable;

        return {
            id: art.id,
            titre: art.titre,
            description: art.description || art.titre, // Utiliser description ou fallback sur titre
            remis: estRemis,
            note: evaluation?.noteFinale ?? null,  // Utiliser ?? pour supporter la note 0
            niveau: evaluation?.niveauFinal ?? null,
            statutRemise: statutRemise,
            statutIntegrite: statutIntegrite,
            estNonRecevable: estNonRecevable,
            jetonReprise: evaluation?.repriseDeId ? true : false,
            jetonDelai: evaluation?.jetonDelaiApplique ? true : false,
            retenu: false // Par défaut, sera mis à true pour les meilleurs
        };
    });

    // 🆕 LIRE LA CONFIGURATION DE LA PRATIQUE DE NOTATION (source unique)
    const modalites = db.getSync('modalitesEvaluation', {});
    const configPortfolio = modalites.configPAN?.portfolio || {};
    const portfolioActif = configPortfolio.actif !== false;
    const nombreARetenir = configPortfolio.nombreARetenir || portfolio?.regles?.nombreARetenir || 3;
    const methodeSelection = configPortfolio.methodeSelection || 'meilleurs';

    // Appliquer la logique de sélection selon la modalité configurée
    let artefactsSelectionnes = [];
    const artefactsRemis = artefacts.filter(a => a.remis);

    if (!portfolioActif) {
        // Portfolio désactivé : aucun artefact retenu
        artefactsSelectionnes = [];
    } else {
        // Appliquer la modalité de sélection
        switch (methodeSelection) {
            case 'meilleurs':
                artefactsSelectionnes = artefactsRemis
                    .sort((a, b) => (b.note || 0) - (a.note || 0))
                    .slice(0, nombreARetenir);
                break;

            case 'recents':
                // Trier par date (on utilise l'ordre d'évaluation comme proxy de la date)
                artefactsSelectionnes = [...artefactsRemis]
                    .reverse() // Les plus récents en premier
                    .slice(0, nombreARetenir);
                break;

            case 'recents-meilleurs':
                // 1. Garder les 50% meilleurs
                const nombreMeilleurs = Math.max(1, Math.ceil(artefactsRemis.length * 0.5));
                const topMeilleurs = artefactsRemis
                    .sort((a, b) => (b.note || 0) - (a.note || 0))
                    .slice(0, nombreMeilleurs);
                // 2. Parmi ceux-ci, prendre les N plus récents
                artefactsSelectionnes = [...topMeilleurs]
                    .reverse()
                    .slice(0, nombreARetenir);
                break;

            case 'tous':
                artefactsSelectionnes = artefactsRemis;
                break;

            default:
                // Fallback sur meilleurs
                artefactsSelectionnes = artefactsRemis
                    .sort((a, b) => (b.note || 0) - (a.note || 0))
                    .slice(0, nombreARetenir);
        }
    }

    // Marquer les artefacts sélectionnés comme retenus
    const idsRetenus = new Set(artefactsSelectionnes.map(a => a.id));
    artefacts.forEach(art => {
        art.retenu = idsRetenus.has(art.id);
    });

    // Trier tous les artefacts : retenus d'abord, puis par note, puis remis/non remis
    artefacts.sort((a, b) => {
        // Critère 1: Retenus d'abord
        if (a.retenu && !b.retenu) return -1;
        if (!a.retenu && b.retenu) return 1;

        // Critère 2: Remis avant non remis
        if (a.remis && !b.remis) return -1;
        if (!a.remis && b.remis) return 1;

        // Critère 3: Note décroissante pour les remis
        if (a.remis && b.remis) {
            return (b.note || 0) - (a.note || 0);
        }

        // Critère 4: Alphabétique pour les non remis
        return a.titre.localeCompare(b.titre);
    });

    const nbTotal = artefacts.length;
    const nbRemis = artefacts.filter(a => a.remis).length;
    const nbRetenus = artefacts.filter(a => a.retenu).length;
    const interpC = interpreterCompletion(indices.C);
    // artefactsRemis déjà déclaré à la ligne 710
    const artefactsNonRemis = artefacts.filter(a => !a.remis);

    // 🆕 BETA 95.6 : Détecter si aucune donnée de complétion/performance
    const aucuneDonneeCompletion = nbTotal === 0;
    const aucuneDonneePerformance = nbRetenus === 0;

    // Détection globale "aucune donnée" pour section Engagement
    const aucuneDonnee = aucuneDonneeAssiduite && aucuneDonneeCompletion;

    // Comptabiliser les jetons utilisés et récupérer les informations des artefacts
    const evaluationsAvecJetonReprise = evaluationsEleve.filter(e => e.repriseDeId);
    const evaluationsAvecJetonDelai = evaluationsEleve.filter(e => e.jetonDelaiApplique && !e.remplaceeParId);

    const jetonsRepriseUtilises = evaluationsAvecJetonReprise.length;
    const jetonsDelaiUtilises = evaluationsAvecJetonDelai.length;
    const totalJetonsUtilises = jetonsRepriseUtilises + jetonsDelaiUtilises;

    // Récupérer le statut de tous les jetons (prédéfinis + personnalisés)
    const statutJetons = typeof obtenirStatutJetonsEtudiant === 'function'
        ? obtenirStatutJetonsEtudiant(da)
        : {};

    // Créer les objets avec index pour les badges
    const jetonsDelaiAvecIndex = evaluationsAvecJetonDelai.map(e => {
        const indexOriginal = artefactsPortfolio.findIndex(p => p.id === e.productionId) + 1;
        return {
            nom: e.productionNom || 'Artefact inconnu',
            index: indexOriginal > 0 ? `A${indexOriginal}` : '?'
        };
    });

    const jetonsRepriseAvecIndex = evaluationsAvecJetonReprise.map(e => {
        const indexOriginal = artefactsPortfolio.findIndex(p => p.id === e.productionId) + 1;
        return {
            nom: e.productionNom || 'Artefact inconnu',
            index: indexOriginal > 0 ? `A${indexOriginal}` : '?'
        };
    });

    // Calculer la moyenne des 3 meilleurs pour affichage en P
    const artefactsRetenus = artefacts.filter(a => a.retenu);
    const moyenneP = artefactsRetenus.length > 0
        ? Math.round(artefactsRetenus.reduce((sum, a) => sum + (a.note || 0), 0) / artefactsRetenus.length)
        : 0;
    const interpP = interpreterPerformance(moyenneP);

    return `
        <!-- Détails des calculs (masqué par défaut) -->
        <div id="details-calculs-mobilisation-${da}" class="carte-info-toggle carte-info-note u-hide">
            <strong>Méthodologie de calcul</strong>
            <br><br>
            <strong>Assiduité (A) :</strong> Indice A = ${indices.A}% — ${detailsA.heuresPresentes} périodes présentes / ${detailsA.heuresOffertes} périodes offertes
            <br><br>
            <strong>Complétion (C) :</strong> Indice C = ${indices.C}% — ${nbRemis} ${obtenirTermeProduction('pluriel')} remis / ${nbTotal} ${obtenirTermeProduction('pluriel')} totaux
            <br><br>
            <strong>Performance (P) :</strong> Indice P = ${moyenneP}% — Moyenne des ${nbRetenus} meilleurs ${obtenirTermeProduction('pluriel')}
            <br><br>
            <strong>Engagement (E) :</strong> Formule E = (A × C × P)^(1/3) (racine cubique)
            <br>
            ${(A).toFixed(2)} × ${(C).toFixed(2)} × ${(moyenneP / 100).toFixed(2)} = ${(A * C * (moyenneP / 100)).toFixed(3)} → E = ${Math.pow(A * C * (moyenneP / 100), 1/3).toFixed(3)}
            <br><br>
            L'engagement combine assiduité, complétion et performance. La racine cubique compense la décroissance multiplicative.
            <br>
            Niveau d'engagement : <strong>${(() => {
                const E_brut_calc = A * C * (moyenneP / 100);
                const E_ajuste = Math.pow(E_brut_calc, 1/3);
                const interpE_calc = interpreterEngagement(E_ajuste);
                return `<span style="color: ${interpE_calc.couleur};">${interpE_calc.niveau}</span>`;
            })()}</strong>
        </div>

        <!-- GRILLE 3 COLONNES : ASSIDUITÉ, COMPLÉTION ET PERFORMANCE -->
        <div class="profil-grid-3col">

            <!-- FICHE ASSIDUITÉ -->
            <div class="profil-carte">
                <div class="u-flex-between-mb15">
                    <h3 class="profil-section-titre-seul">Assiduité</h3>
                    ${genererValeursComparatives(indicesSOM.A, indicesPAN.A, modeComparatif, aucuneDonneeAssiduite)}
                </div>

                <!-- Statistiques -->
                <ul class="profil-liste-simple">
                    <li><strong>• Périodes présentes :</strong> ${detailsA.heuresPresentes} / ${detailsA.heuresOffertes}</li>
                </ul>

                <hr class="profil-separateur">

                <!-- Liste des absences et retards -->
                <h4 class="profil-section-titre">
                    ${detailsA.absences.length} absence${detailsA.absences.length > 1 ? 's' : ''} ou retard${detailsA.absences.length > 1 ? 's' : ''}
                </h4>
                ${detailsA.absences.length > 0 ? `
                    <div class="badges-centres u-mb-20">
                        ${detailsA.absences.map(abs => {
                            const date = new Date(abs.date + 'T12:00:00');
                            const options = { weekday: 'short', day: 'numeric', month: 'short' };
                            const dateFormatee = date.toLocaleDateString('fr-CA', options);
                            const estAbsenceComplete = abs.heuresPresence === 0;
                            const classeBadge = estAbsenceComplete ? 'badge-absence-complete' : 'badge-absence-partielle';

                            return `
                                <div class="badge-absence ${classeBadge}"
                                     onclick="naviguerVersPresenceAvecDate('${abs.date}')">
                                    <span class="badge-absence-date">
                                        ${dateFormatee}
                                    </span>
                                    <span class="badge-absence-heures">
                                        ${estAbsenceComplete
                                            ? `${abs.heuresManquees} pér.`
                                            : `${abs.heuresPresence} pér.`
                                        }
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="${aucuneDonneeAssiduite ? 'profil-message-vide' : 'profil-message-tous-remis'}">
                        ${aucuneDonneeAssiduite ? 'En attente de données' : 'Assiduité parfaite !'}
                    </div>
                `}

                <!-- Interventions RàI -->
                ${(() => {
                    // Récupérer les interventions de l'étudiant (où il était présent)
                    const interventions = typeof obtenirInterventionsEtudiant === 'function'
                        ? obtenirInterventionsEtudiant(da)
                        : [];

                    // Filtrer seulement les interventions complétées où l'étudiant était participant
                    const interventionsParticipees = interventions.filter(intervention => {
                        return intervention.statut === 'completee' &&
                               intervention.etudiants &&
                               intervention.etudiants.includes(da);
                    });

                    if (interventionsParticipees.length === 0) {
                        return '';
                    }

                    // Trier par date décroissante
                    interventionsParticipees.sort((a, b) => new Date(b.date) - new Date(a.date));

                    return `
                        <hr class="profil-separateur">
                        <h4 class="profil-section-titre">
                            ${interventionsParticipees.length} intervention${interventionsParticipees.length > 1 ? 's' : ''} RàI
                        </h4>
                        <div class="badges-centres u-mb-20">
                            ${interventionsParticipees.map(intervention => {
                                const date = new Date(intervention.date + 'T12:00:00');
                                const options = { weekday: 'short', day: 'numeric', month: 'short' };
                                const dateFormatee = date.toLocaleDateString('fr-CA', options);
                                const duree = intervention.duree || 2;
                                const typeIcone = intervention.type === 'individuel' ? '👤' : '👥';

                                return `
                                    <span class="badge-intervention-vert" onclick="naviguerVersIntervention('${intervention.id}');">
                                        ${typeIcone} ${dateFormatee}
                                        <span class="badge-analyse-count">
                                            ${duree}h
                                        </span>
                                    </span>
                                `;
                            }).join('')}
                        </div>
                    `;
                })()}
            </div>

            <!-- FICHE COMPLÉTION -->
            <div class="profil-carte">
                <div class="u-flex-between-mb15">
                    <h3 class="profil-section-titre-seul">Complétion</h3>
                    ${genererValeursComparatives(indicesSOM.C, indicesPAN.C, modeComparatif, aucuneDonneeCompletion)}
                </div>

                <!-- Statistiques -->
                <ul class="profil-liste-simple">
                    <li><strong>• Productions remises :</strong> ${nbRemis}/${nbTotal}</li>
                </ul>

                <hr class="profil-separateur">

                <!-- Artefacts remis (format badge comme Assiduité) -->
                <h4 class="profil-section-titre">
                    ${artefactsRemis.length} production${artefactsRemis.length > 1 ? 's' : ''} remise${artefactsRemis.length > 1 ? 's' : ''}
                </h4>
                ${artefactsRemis.length > 0 ? `
                    <div class="badges-centres u-mb-20">
                        ${artefactsRemis
                            .map(art => {
                                // Trouver l'index ORIGINAL dans la liste définie par l'enseignant
                                const indexOriginal = artefactsPortfolio.findIndex(p => p.id === art.id) + 1;
                                return { ...art, indexOriginal };
                            })
                            .sort((a, b) => a.indexOriginal - b.indexOriginal) // Trier par numéro croissant
                            .map(art => `
                                <span class="badge-completion-remis"
                                      onclick="evaluerProduction('${da}', '${art.id}')">
                                    <span class="badge-completion-titre">
                                        ${echapperHtml(art.description)}
                                    </span>
                                    <span class="badge-completion-numero">
                                        A${art.indexOriginal}
                                    </span>
                                </span>
                            `).join('')}
                    </div>
                ` : `
                    <div class="profil-message-vide u-mb-15">
                        Aucun artefact remis
                    </div>
                `}

                <!-- Artefacts non remis ou non recevables (format badge comme Assiduité) -->
                <h4 class="profil-section-titre">
                    ${artefactsNonRemis.length} production${artefactsNonRemis.length > 1 ? 's' : ''} non remise${artefactsNonRemis.length > 1 ? 's' : ''} ou non recevable${artefactsNonRemis.length > 1 ? 's' : ''}
                </h4>
                ${artefactsNonRemis.length > 0 ? `
                    <div class="badges-centres u-mb-20">
                        ${artefactsNonRemis
                            .map(art => {
                                // Trouver l'index ORIGINAL dans la liste définie par l'enseignant
                                const indexOriginal = artefactsPortfolio.findIndex(p => p.id === art.id) + 1;
                                return { ...art, indexOriginal };
                            })
                            .sort((a, b) => a.indexOriginal - b.indexOriginal) // Trier par numéro croissant
                            .map(art => `
                                <span class="${art.estNonRecevable ? 'badge-completion-non-recevable' : 'badge-completion-non-remis'}"
                                      onclick="evaluerProduction('${da}', '${art.id}')"
                                      title="${art.estNonRecevable ? (art.statutIntegrite === 'plagiat' ? 'Plagiat détecté' : 'Utilisation IA non autorisée') : 'Non remis'}">
                                    <span class="badge-completion-titre">
                                        ${echapperHtml(art.description)}
                                    </span>
                                    <span class="badge-completion-numero">
                                        ${art.estNonRecevable ? '⚠️' : ''} A${art.indexOriginal}
                                    </span>
                                </span>
                            `).join('')}
                    </div>
                ` : `
                    <div class="${aucuneDonneeCompletion ? 'profil-message-vide' : 'profil-message-tous-remis'}">
                        ${aucuneDonneeCompletion ? 'En attente de données' : 'Tous les artefacts remis !'}
                    </div>
                `}
            </div>

            <!-- FICHE PERFORMANCE -->
            <div class="profil-carte">
                <div class="u-flex-between-mb15">
                    <h3 class="profil-section-titre-seul">Performance</h3>
                    ${genererValeursComparatives(indicesSOM.P, indicesPAN.P, modeComparatif, aucuneDonneePerformance)}
                </div>

                <!-- Statistiques -->
                <ul class="profil-liste-simple">
                    <li><strong>• ${(() => {
                        if (!portfolioActif) {
                            return 'Performance des productions indépendantes';
                        }

                        // Textes selon la modalité de sélection
                        const textesPerformance = {
                            'meilleurs': `Performance du portfolio actuel (${nombreARetenir} meilleur${nombreARetenir > 1 ? 's' : ''}, maîtrise de standards)`,
                            'recents': `Performance du portfolio actuel (${nombreARetenir} plus récent${nombreARetenir > 1 ? 's' : ''}, niveau terminal)`,
                            'recents-meilleurs': `Performance du portfolio actuel (${nombreARetenir} récent${nombreARetenir > 1 ? 's' : ''} parmi les meilleurs, hybride)`,
                            'tous': `Performance du portfolio actuel (tous les artefacts, moyenne complète)`
                        };

                        return textesPerformance[methodeSelection] || textesPerformance['meilleurs'];
                    })()}</strong></li>
                </ul>

                <hr class="profil-separateur">

                <!-- Gestion des jetons (prédéfinis + personnalisés) -->
                ${typeof obtenirStatutJetonsEtudiant === 'function' ? (() => {
                    // Calculer le total de jetons utilisés tous types confondus
                    const totalJetonsUtilisesTousTypes = Object.values(statutJetons).reduce((sum, info) => sum + info.utilises, 0);

                    // Récupérer le quota global depuis la configuration
                    const config = db.getSync('modalitesEvaluation', {});
                    const quotaGlobal = config.configPAN?.jetons?.nombreParEleve || 2;  // 🆕 Beta 95.7 : défaut 2

                    // Déterminer si le quota global est atteint
                    const quotaGlobalAtteint = totalJetonsUtilisesTousTypes >= quotaGlobal;

                    // Fonction pour obtenir les badges des artefacts où un type de jeton a été utilisé
                    const obtenirBadgesJetons = (typeJeton) => {
                        const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);
                        const productionsNonPortfolio = productions.filter(p => p.type !== 'portfolio');
                        const badges = [];

                        evaluationsEleve.forEach(evaluation => {
                            let jetonUtilise = false;
                            if (typeJeton === 'delai' && evaluation.jetonDelaiApplique === true) {
                                jetonUtilise = true;
                            } else if (typeJeton === 'reprise' && evaluation.jetonRepriseApplique === true) {
                                jetonUtilise = true;
                            } else if (typeJeton === 'repriseCiblee' && evaluation.jetonRepriseCibleeApplique === true) {
                                jetonUtilise = true;
                            }

                            if (jetonUtilise) {
                                // Trouver l'index de la production
                                const indexProduction = productionsNonPortfolio.findIndex(p => p.id === evaluation.productionId);
                                if (indexProduction !== -1) {
                                    badges.push(`A${indexProduction + 1}`);
                                }
                            }
                        });

                        return badges;
                    };

                    return `
                        <!-- Encadré pour le titre et la barre de progression globale -->
                        <div class="profil-encadre-jetons">
                            <div class="profil-encadre-jetons-header">
                                <strong class="profil-encadre-jetons-titre">
                                    Gestion des jetons
                                </strong>
                                <span class="profil-encadre-jetons-compteur">
                                    ${totalJetonsUtilisesTousTypes} / ${quotaGlobal} utilisés
                                </span>
                            </div>
                            <div class="profil-encadre-jetons-barre">
                                <div class="profil-encadre-jetons-progression" style="width: ${(totalJetonsUtilisesTousTypes / quotaGlobal * 100)}%;"></div>
                            </div>
                        </div>

                        <!-- Badges des jetons utilisés -->
                        ${(() => {
                            const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);
                            const productionsNonPortfolio = productions.filter(p => p.type !== 'portfolio');
                            const badgesJetons = [];

                            evaluationsEleve.forEach(evaluation => {
                                // Vérifier quel type de jeton a été utilisé
                                let typeJeton = null;
                                let badgeClass = '';
                                let badgeNumeroClass = '';

                                if (evaluation.jetonRepriseCibleeApplique === true) {
                                    typeJeton = 'Reprise ciblée';
                                    badgeClass = 'badge-jeton-reprise-ciblee-wrapper';
                                    badgeNumeroClass = 'badge-jeton-numero-reprise-ciblee';
                                } else if (evaluation.jetonRepriseApplique === true) {
                                    typeJeton = 'Reprise';
                                    badgeClass = 'badge-jeton-reprise-wrapper';
                                    badgeNumeroClass = 'badge-jeton-numero-reprise';
                                } else if (evaluation.jetonDelaiApplique === true) {
                                    typeJeton = 'Délai';
                                    badgeClass = 'badge-jeton-delai-wrapper';
                                    badgeNumeroClass = 'badge-jeton-numero-delai';
                                }

                                if (typeJeton) {
                                    // Trouver l'index de la production
                                    const indexProduction = productionsNonPortfolio.findIndex(p => p.id === evaluation.productionId);
                                    if (indexProduction !== -1) {
                                        const badge = 'A' + (indexProduction + 1);
                                        badgesJetons.push({
                                            type: typeJeton,
                                            badge: badge,
                                            class: badgeClass,
                                            numeroClass: badgeNumeroClass
                                        });
                                    }
                                }
                            });

                            if (badgesJetons.length > 0) {
                                const badgesHTML = badgesJetons.map(jeton =>
                                    '<span class="' + jeton.class + '">' +
                                        '<span class="badge-jeton-titre">' + jeton.type + '</span>' +
                                        '<span class="badge-jeton-numero ' + jeton.numeroClass + '">' + jeton.badge + '</span>' +
                                    '</span>'
                                ).join('');

                                return '<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;">' + badgesHTML + '</div>';
                            }
                            return '';
                        })()}

                        <hr class="profil-separateur">
                    `;
                })() : ''}

                <!-- Artefacts sélectionnés avec notes (badges colorés avec checkboxes) -->
                <h4 class="profil-section-titre">
                    ${(() => {
                        if (!portfolioActif) {
                            return 'Productions indépendantes';
                        }

                        // Textes selon la modalité de sélection
                        const textesTitres = {
                            'meilleurs': `${nbRetenus} meilleur${nbRetenus > 1 ? 's' : ''} artefact${nbRetenus > 1 ? 's' : ''}`,
                            'recents': `${nbRetenus} plus récent${nbRetenus > 1 ? 's' : ''} artefact${nbRetenus > 1 ? 's' : ''}`,
                            'recents-meilleurs': `${nbRetenus} récent${nbRetenus > 1 ? 's' : ''} parmi les meilleurs`,
                            'tous': `Tous les artefacts (${nbRetenus})`
                        };

                        return textesTitres[methodeSelection] || textesTitres['meilleurs'];
                    })()}
                </h4>
                ${artefactsRetenus.length > 0 ? `
                    <div class="badges-centres u-mb-20">
                        ${artefactsRetenus.map(art => {
                            // Trouver l'index ORIGINAL dans la liste définie par l'enseignant
                            const indexOriginal = artefactsPortfolio.findIndex(p => p.id === art.id) + 1;

                            // Récupérer les couleurs depuis l'échelle configurée
                            const echelles = db.getSync('echellesTemplates', []);
                            const echelleActive = echelles.find(e => e.active) || echelles[0];

                            // Déterminer la couleur selon la note
                            let couleurBadge = '#999'; // Gris par défaut
                            if (art.note !== null && echelleActive?.niveaux) {
                                const niveau = echelleActive.niveaux.find(n => art.note >= n.min && art.note <= n.max);
                                couleurBadge = niveau?.couleur || '#999';
                            } else if (art.note !== null) {
                                // Couleurs par défaut IDME
                                if (art.note >= 85) couleurBadge = '#2196F3'; // Bleu
                                else if (art.note >= 75) couleurBadge = '#28a745'; // Vert
                                else if (art.note >= 65) couleurBadge = '#ffc107'; // Jaune
                                else couleurBadge = '#ff9800'; // Orange
                            }

                            const opacite = art.retenu ? '1' : '0.6';
                            const bordure = art.retenu ? '3px' : '2px';

                            return `
                                <div class="badge-artefact"
                                     style="background: ${couleurBadge}22; border-color: ${couleurBadge}; opacity: ${opacite}; border-width: ${bordure}; cursor: pointer;"
                                     onmouseover="this.style.opacity='1'"
                                     onmouseout="this.style.opacity='${opacite}'"
                                     onclick="evaluerProduction('${da}', '${art.id}')"
                                     title="${echapperHtml(art.description)}">
                                    <span class="badge-artefact-titre" style="color: ${couleurBadge};">
                                        A${indexOriginal}
                                    </span>
                                    ${art.jetonReprise ? '<span class="profil-texte-petit" title="Jeton de reprise appliqué">⭐</span>' : ''}
                                    ${art.jetonDelai ? '<span class="profil-texte-petit" title="Jeton de délai appliqué">⭐</span>' : ''}
                                    <span class="badge-artefact-note" style="background: ${couleurBadge};">
                                        ${art.niveau || '--'}
                                    </span>
                                    <span style="color: #666; font-size: 0.8rem; font-weight: 500;">
                                        (${art.note})
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="profil-message-vide u-mb-15">
                        Aucun artefact évalué
                    </div>
                `}
            </div>
        </div>

        <!-- ÉCHELLE D'ENGAGEMENT (basée sur E = racine cubique de A × C × P) -->
        ${(() => {
            // 🆕 BETA 95.6 : Si aucune donnée, afficher un message approprié
            if (aucuneDonnee) {
                return `
                    <div class="profil-carte u-mt-10">
                        <div class="u-flex-between-mb15">
                            <h3 class="profil-section-titre-seul">Niveau d'engagement</h3>
                            <span style="color: #94a3b8; font-weight: 600;">—</span>
                        </div>
                        <div class="profil-message-vide">
                            En attente de données
                        </div>
                    </div>
                `;
            }

            // Recalculer E avec racine cubique
            const P_reel = moyenneP / 100;
            const E_brut_reel = A * C * P_reel;
            const E_reel = Math.pow(E_brut_reel, 1/3); // Racine cubique

            // Interpréter E
            const interpE_reel = interpreterEngagement(E_reel);

            // Texte explicatif pour le calcul de E (basé sur P)
            const configPAN = config.configPAN?.portfolio || {};
            const decouplerPR = configPAN.decouplerPR || false;
            const nombreArtefacts = configPAN.nombreARetenir || 5;

            let texteExplicatifE = '';
            if (decouplerPR && !modeComparatif) {
                texteExplicatifE = `<span class="profil-texte-normal-gris"> (P basé sur les ${nombreArtefacts} plus récent${nombreArtefacts > 1 ? 's' : ''})</span>`;
            } else if (!decouplerPR && !modeComparatif && portfolioActif) {
                const textesModalites = {
                    'meilleurs': `P basé sur les ${nombreArtefacts} meilleur${nombreArtefacts > 1 ? 's' : ''}`,
                    'recents': `P basé sur les ${nombreArtefacts} plus récent${nombreArtefacts > 1 ? 's' : ''}`,
                    'recents-meilleurs': `P basé sur les ${nombreArtefacts} récent${nombreArtefacts > 1 ? 's' : ''} parmi les meilleurs`,
                    'tous': 'P basé sur tous les artefacts'
                };
                const texteModalite = textesModalites[methodeSelection] || textesModalites['meilleurs'];
                texteExplicatifE = `<span class="profil-texte-normal-gris"> (${texteModalite})</span>`;
            }

            return `
                <div class="profil-carte u-mt-10">
                    <div class="u-flex-between-mb15">
                        <h3 class="profil-section-titre-seul">
                            Niveau d'engagement${texteExplicatifE}
                        </h3>
                        ${genererValeursComparatives(Math.round(E_SOM * 100), Math.round(E_PAN * 100), modeComparatif)}
                    </div>

                    <div style="margin-bottom: 15px; font-size: 0.9rem; color: #555;">
                        Formule : E = ∛(A × C × P)
                        <span class="primo-aide" data-target="conseil-formule-engagement-mobilisation" style="margin-left: 5px; display: inline-block !important; cursor: pointer;">😎</span>
                    </div>

                    <!-- Conseil Primo: Explication de la formule d'engagement (section Mobilisation) -->
                    <div id="conseil-formule-engagement-mobilisation" class="carte-info-toggle carte-info-conseil" style="display: none; margin-bottom: 15px;">
                        <strong>Pourquoi la racine cubique ?</strong>
                        <p>La racine cubique (∛) est une <strong>transformation normalisante</strong> qui préserve l'échelle d'origine tout en combinant les trois indices.</p>

                        <p><strong>Exemple concret :</strong></p>
                        <ul style="margin-left: 20px; line-height: 1.6;">
                            <li><strong>Sans racine cubique :</strong> Un étudiant à 70% sur A, C et P aurait : 0.7 × 0.7 × 0.7 = <strong>34%</strong> d'engagement ← Trop punitif !</li>
                            <li><strong>Avec racine cubique :</strong> Le même étudiant obtient : ∛(0.7 × 0.7 × 0.7) = <strong>70%</strong> d'engagement ← Cohérent et intuitif !</li>
                        </ul>

                        <p><strong>Pourquoi utiliser la multiplication ?</strong></p>
                        <p>La multiplication (plutôt qu'une simple moyenne) permet de <strong>pénaliser les déséquilibres</strong>. Un étudiant qui excelle en assiduité (90%) mais échoue en performance (30%) aura un engagement plus faible qu'un étudiant équilibré à 60% partout.</p>

                        <p><strong>En résumé :</strong></p>
                        <p>La racine cubique compense la décroissance multiplicative tout en préservant l'effet punitif sur les déséquilibres importants. C'est la <strong>moyenne géométrique</strong> des trois indices A-C-P.</p>
                    </div>

                    <div class="profil-echelle-risque">
                        <div class="profil-echelle-barre" style="background: linear-gradient(to right,
                                    #ff9800 0%,
                                    #ffc107 25%,
                                    #28a745 50%,
                                    #2196F3 75%);">
                            ${modeComparatif ? `
                                <!-- Indicateurs duaux: symboles de direction -->
                                ${directionSOM.symbole ? `<div style="position: absolute; left: ${Math.max(0, Math.min((E_SOM - 0.30) / 0.70 * 100, 100))}%; transform: translateX(-50%); top: -32px; font-size: 1.2rem; font-weight: bold; color: var(--som-orange);" title="SOM: ${directionSOM.interpretation}">${directionSOM.symbole}</div>` : ''}
                                ${directionPAN.symbole ? `<div style="position: absolute; left: ${Math.max(0, Math.min((E_PAN - 0.30) / 0.70 * 100, 100))}%; transform: translateX(-50%); top: -32px; font-size: 1.2rem; font-weight: bold; color: var(--std-bleu);" title="PAN: ${directionPAN.interpretation}">${directionPAN.symbole}</div>` : ''}
                                <!-- Points colorés (valeurs affichées dans l'en-tête) -->
                                <div class="profil-echelle-point profil-echelle-point-som" style="left: ${Math.max(0, Math.min((E_SOM - 0.30) / 0.70 * 100, 100))}%;"></div>
                                <div class="profil-echelle-point profil-echelle-point-std" style="left: ${Math.max(0, Math.min((E_PAN - 0.30) / 0.70 * 100, 100))}%;"></div>
                            ` : `
                                <!-- Indicateur unique pratique courante -->
                                <div class="profil-echelle-point profil-echelle-point-unique" style="left: ${Math.max(0, Math.min((E_reel - 0.30) / 0.70 * 100, 100))}%;"></div>
                                <div class="profil-echelle-indicateur-bas" style="left: ${Math.max(0, Math.min((E_reel - 0.30) / 0.70 * 100, 100))}%;">E = ${E_reel.toFixed(2)}</div>
                            `}
                        </div>

                        <div class="legende-risque-container">
                            <div class="legende-risque-item" style="left: 12.5%; color: #ff9800;">
                                <span class="legende-risque-niveau">Fragile</span>
                                <span class="legende-risque-seuil">0.30-0.49</span>
                            </div>
                            <div class="legende-risque-item" style="left: 37.5%; color: #ffc107;">
                                <span class="legende-risque-niveau">Modéré</span>
                                <span class="legende-risque-seuil">0.50-0.64</span>
                            </div>
                            <div class="legende-risque-item" style="left: 62.5%; color: #28a745;">
                                <span class="legende-risque-niveau">Favorable</span>
                                <span class="legende-risque-seuil">0.65-0.79</span>
                            </div>
                            <div class="legende-risque-item" style="left: 87.5%; color: #2196F3;">
                                <span class="legende-risque-niveau">Très favorable</span>
                                <span class="legende-risque-seuil">≥ 0.80</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        })()}
    `;
}

/**
 * Calcule la direction de l'engagement (tendance récente)
 * Basé sur l'historique des indices C et P (mobilisation)
 * @param {string} da - Numéro de DA
 * @param {string} pratique - 'SOM' ou 'PAN'
 * @returns {Object} - { symbole: '→'|'←'|'—', interpretation: string }
 */
function calculerDirectionEngagement(da, pratique) {
    const historiqueCP = obtenirHistoriqueIndicesCP(da, pratique);

    // Résultat par défaut
    const resultatParDefaut = {
        symbole: '',
        interpretation: 'Données insuffisantes'
    };

    // Besoin d'au moins 4 entrées pour calculer une tendance (2 récentes vs 2 précédentes)
    if (!historiqueCP || historiqueCP.length < 4) {
        return resultatParDefaut;
    }

    // Prendre les N dernières entrées (N=2 pour simplifier)
    const N = 2;
    const entrees = historiqueCP.slice(-N * 2); // 4 dernières entrées

    // Calculer la moyenne de mobilisation (C × P) pour chaque groupe
    const calculerMobilisation = (entries) => {
        let somme = 0;
        let count = 0;
        entries.forEach(e => {
            const C = e.C / 100; // Convertir en décimal
            const P = e.P / 100;
            somme += C * P;
            count++;
        });
        return count > 0 ? somme / count : 0;
    };

    const groupe1 = entrees.slice(0, N); // 2 anciennes
    const groupe2 = entrees.slice(N); // 2 récentes

    const mobilisation1 = calculerMobilisation(groupe1);
    const mobilisation2 = calculerMobilisation(groupe2);

    const difference = mobilisation2 - mobilisation1;
    const seuilStabilite = 0.05; // 5% de différence = stabilité

    if (Math.abs(difference) < seuilStabilite) {
        return {
            symbole: '—',
            interpretation: 'Mobilisation stable'
        };
    } else if (difference > 0) {
        return {
            symbole: '→',
            interpretation: 'Mobilisation en hausse'
        };
    } else {
        return {
            symbole: '←',
            interpretation: 'Mobilisation en baisse'
        };
    }
}

/**
 * Génère le HTML de la section Accompagnement (interventions RàI)
 * Inclut: badge RàI, risque, pattern, progression, services, échelle, historique
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionAccompagnement(da) {
    // Récupérer toutes les interventions où cet étudiant était présent
    const interventions = obtenirInterventionsEtudiant(da);

    // Récupérer les infos de l'étudiant pour affichage
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiant = etudiants.find(e => e.da === da);
    const nomComplet = etudiant ? `${etudiant.prenom} ${etudiant.nom}` : `DA ${da}`;

    // Récupérer les données pour le suivi (conservé pour forces/défis)
    const indices = calculerTousLesIndices(da);

    // 🆕 BETA 95.6 : Détecter si aucune donnée n'est saisie pour cet étudiant
    const aucuneDonnee = indices.A === 0 && indices.C === 0 && indices.P === 0;

    if (aucuneDonnee) {
        // Retourner un HTML simplifié pour l'état "en attente de données"
        return `
            <!-- Détails de la section (masqué par défaut) -->
            <div id="details-calculs-accompagnement-${da}" class="carte-info-toggle carte-info-note u-hide">
                <strong>À propos de cette section</strong>
                <br><br>
                <strong>Objectif :</strong> Cette section centralise les indicateurs de suivi et l'historique complet des interventions RàI (Réponse à l'Intervention). Elle permet d'orienter les décisions d'accompagnement pédagogique et de documenter les observations spécifiques.
            </div>

            <div class="profil-grid-3col">
                <!-- Carte 1 : Modèle de la Réponse à l'intervention (RàI) -->
                <div class="profil-carte">
                    <h2 class="profil-section-titre-sous">Modèle de la Réponse à l'intervention (RàI)</h2>
                    <div class="profil-message-vide" style="margin: 20px 0;">
                        En attente de données
                    </div>
                    <p class="profil-texte-petit-gris">Les indicateurs RàI seront disponibles après la saisie des premières données.</p>
                </div>

                <!-- Carte 2 : Contexte d'apprentissage -->
                <div class="profil-carte">
                    <h2 class="profil-section-titre-sous">Contexte d'apprentissage</h2>
                    <div class="profil-message-vide" style="margin: 20px 0;">
                        En attente de données
                    </div>
                    <p class="profil-texte-petit-gris">Le contexte sera analysé après la saisie des premières données.</p>
                </div>

                <!-- Carte 3 : Observation SOLO -->
                <div class="profil-carte">
                    <h2 class="profil-section-titre-sous">Observation de la structure des résultats d'apprentissage</h2>
                    <div class="profil-message-vide" style="margin: 20px 0;">
                        En attente de données
                    </div>
                    <p class="profil-texte-petit-gris">L'analyse SOLO sera disponible après les premières évaluations.</p>
                </div>
            </div>
        `;
    }

    // 🆕 NOUVEAU : Utiliser les fonctions séparées pour RàI pédagogique et contexte
    const niveauRai = determinerNiveauRaiPedagogique(da);
    const alerteContexte = determinerAlerteContextuelle(da);
    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true); // true = dépistage (3 artefacts)
    const cibleInfo = determinerCibleIntervention(da); // Conservé pour compatibilité (sera retiré plus tard)
    const progression = calculerProgressionEleve(da);
    const defiSpecifique = identifierDefiSpecifique(da);
    const directionRisque = calculerDirectionRisque(da);

    // Construire le texte de progression au format du rapport (basé sur les critères)
    let texteProgression = '';
    if (progression.direction === '↗') {
        texteProgression = `Apprentissage : présentement en amélioration (${progression.nbAmelioration}/${progression.nbCriteres} critères en progression)`;
    } else if (progression.direction === '↘') {
        texteProgression = `Apprentissage : présentement en baisse (${progression.nbBaisse}/${progression.nbCriteres} critères en régression)`;
    } else if (progression.direction === '—') {
        texteProgression = `Apprentissage : présentement en plateau (évolution stable sur ${progression.nbCriteres} critères)`;
    } else {
        texteProgression = `Apprentissage : ${progression.interpretation}`;
    }

    // Analyser les forces et défis (critères de la grille de référence)
    const seuilMaitrise = obtenirSeuil('idme.maitrise');
    const seuilDeveloppement = obtenirSeuil('idme.developpement');

    // ✅ Utiliser la fonction dynamique au lieu du tableau SRPNF codé en dur
    const criteres = obtenirCriteresAvecValeurs(da);

    // CORRECTION: Inclure TOUS les niveaux IDME (I, D, M, E)
    // Forces: M (>=75%) et E (>=85%)
    const forces = criteres.filter(c => c.valeur >= seuilMaitrise);
    // Défis: I (<65%) ET D (65-75%)
    const defis = criteres.filter(c => c.valeur > 0 && c.valeur < seuilMaitrise);

    console.log('Forces et défis pour DA', da, { forces, defis, seuilMaitrise, seuilDeveloppement, criteres });

    // Badge RàI avec classes CSS
    let badgeClasse = '';
    let badgeLabel = '';
    if (cibleInfo.niveau === 3) {
        badgeClasse = 'badge-sys badge-rai-3';
        badgeLabel = 'Niveau 3';
    } else if (cibleInfo.niveau === 2) {
        badgeClasse = 'badge-sys badge-rai-2';
        badgeLabel = 'Niveau 2';
    } else {
        badgeClasse = 'badge-sys badge-rai-1';
        badgeLabel = 'Niveau 1';
    }

    // Construire le texte du pattern avec le défi intégré si applicable
    const interpreterScoreIDME = (score) => {
        const seuilInsuffisant = obtenirSeuil('idme.insuffisant');
        const seuilDeveloppement = obtenirSeuil('idme.developpement');
        const seuilMaitrise = obtenirSeuil('idme.maitrise');
        if (score < seuilInsuffisant) return 'Un seul aspect traité, compréhension superficielle';
        if (score < seuilDeveloppement) return 'Plusieurs aspects sans vision d\'ensemble';
        if (score < seuilMaitrise) return 'Vision globale avec liens entre les aspects';
        return 'Transfert à d\'autres contextes';
    };

    let patternTexte = cibleInfo.pattern;
    if (cibleInfo.pattern === 'Défi spécifique' && defiSpecifique.defi !== 'Aucun') {
        const niveauIDME = interpreterScoreIDME(defiSpecifique.score);
        patternTexte = `${cibleInfo.pattern} (${defiSpecifique.defi} - ${niveauIDME})`;
    }

    let html = `
        <!-- Détails de la section (masqué par défaut) -->
        <div id="details-calculs-accompagnement-${da}" class="carte-info-toggle carte-info-note u-hide">
            <strong>À propos de cette section</strong>
            <br><br>
            <strong>Objectif :</strong> Cette section centralise les indicateurs de suivi et l'historique complet des interventions RàI (Réponse à l'Intervention). Elle permet d'orienter les décisions d'accompagnement pédagogique et de documenter les observations spécifiques.
            <br><br>
            <strong>Contenu :</strong> Niveau d'intervention RàI recommandé (1, 2 ou 3) • Indicateurs de risque, pattern d'apprentissage et progression • Services adaptés (SA, CAF) pour contextualiser l'accompagnement • Échelle visuelle de positionnement du risque • Liste chronologique des interventions documentées
            <br><br>
            <strong>Utilisation :</strong> Planifier intervention (basez-vous sur le niveau RàI et les indicateurs affichés) • Nouvelle intervention (cliquez sur «Nouvelle intervention») • Consulter historique (cliquez sur «Consulter» pour voir les détails complets) • Notes individuelles (visibles directement sous chaque intervention)
        </div>

        <!-- 🆕 NOUVEAU : Trois cartes côte à côte (RàI pédagogique + Contexte + Observation SOLO) -->
        <div class="${(() => {
            const config = db.getSync('modalitesEvaluation', {});
            const afficherSOLO = config.afficherDescriptionsSOLO !== false;
            return afficherSOLO ? 'profil-grid-3col' : 'profil-grid-2col';
        })()}">
            <!-- Carte 1 : Modèle de la Réponse à l'intervention (RàI) -->
            <div class="profil-carte">
                <h2 class="profil-section-titre-sous">Modèle de la Réponse à l'intervention (RàI)</h2>

                <div class="badge-sys ${niveauRai.badgeClasse}">
                    ${niveauRai.label}
                </div>

                <p class="profil-texte-paragraphe">
                    <strong>Performance globale (P) :</strong> ${(() => {
                        const pct = indices.P;
                        const niveau = pct >= 85 ? 'E' : pct >= 75 ? 'M' : pct >= 65 ? 'D' : 'I';

                        // Obtenir la configuration pour afficher le nombre d'artefacts retenus
                        const config = db.getSync('modalitesEvaluation', {});
                        const pratique = config.pratique || 'pan-maitrise';

                        let noteExplicative = '';
                        if (pratique === 'pan-maitrise') {
                            const nombreARetenir = config.nombreARetenir || 3;
                            const methodeSelection = config.methodeSelectionArtefacts || 'meilleurs';
                            const methodeTexte = methodeSelection === 'meilleurs' ? 'meilleurs' :
                                               methodeSelection === 'recents' ? 'plus récents' :
                                               methodeSelection === 'recents-meilleurs' ? 'meilleurs récents' : 'tous';
                            noteExplicative = `<span style="font-size: 0.8rem; color: #6c757d; font-weight: normal; display: block; margin-top: 2px;">Calculée sur les ${nombreARetenir} ${methodeTexte} artefacts</span>`;
                        } else {
                            noteExplicative = `<span style="font-size: 0.8rem; color: #6c757d; font-weight: normal; display: block; margin-top: 2px;">Calculée sur toutes les évaluations</span>`;
                        }

                        return `${niveau} ${pct.toFixed(0)}%${noteExplicative}`;
                    })()}
                </p>

                <p class="profil-texte-paragraphe" style="margin-top: 12px;"><strong>Progression par critère :</strong> <span style="font-size: 0.8rem; color: #6c757d; font-weight: normal;">(moyennes sur tous les ${obtenirTermeProduction('pluriel')})</span></p>
                <ul style="margin-left: 20px; color: #495057; font-size: 0.9rem;">
                    ${criteres.map(c => {
                        const pct = c.valeur * 100;
                        const niveau = pct >= 85 ? 'E' : pct >= 75 ? 'M' : pct >= 65 ? 'D' : 'I';
                        return `<li>${c.nom} : ${niveau} ${pct.toFixed(0)}%</li>`;
                    }).join('')}
                </ul>

                <div class="profil-separateur-section"></div>

                <div class="badge-sys ${niveauRai.patternBadge}">
                    ${niveauRai.pattern}
                </div>

                <p class="profil-texte-detail">${niveauRai.description}</p>
                ${niveauRai.defi !== 'Aucun' ? `<p style="font-size: 0.9rem; color: #666; margin-top: 8px;"><strong>Défi principal :</strong> ${niveauRai.defi}</p>` : ''}
            </div>

            <!-- Carte 2 : Contexte d'apprentissage -->
            <div class="profil-carte">
                <h2 class="profil-section-titre-sous">Contexte d'apprentissage</h2>

                <div class="badge-sys ${alerteContexte.badgeClasse}">
                    ${alerteContexte.label}
                </div>

                <p class="profil-texte-paragraphe">
                    <strong>Assiduité (A) :</strong> ${alerteContexte.A}
                </p>

                <p class="profil-texte-paragraphe">
                    <strong>Complétion (C) :</strong> ${alerteContexte.C}
                </p>

                <div class="profil-separateur-section"></div>

                <p style="font-size: 0.9rem; color: ${alerteContexte.niveau === 'tres-favorable' || alerteContexte.niveau === 'favorable' ? '#16a34a' : alerteContexte.niveau === 'modere' ? '#ca8a04' : '#ea580c'}; font-weight: 600; margin-bottom: 8px;">
                    ${alerteContexte.description}
                </p>

                <p style="font-size: 0.9rem; color: #666; line-height: 1.5;">
                    ${alerteContexte.recommandation}
                </p>

                <div class="profil-separateur-section"></div>

                <p class="profil-texte-detail-compact">
                    <strong>Services adaptés :</strong> ${etudiant.caf === 'Oui' ? '✓ CAF' : ''} ${etudiant.sa === 'Oui' ? '✓ SA' : ''} ${etudiant.caf !== 'Oui' && etudiant.sa !== 'Oui' ? 'Aucun' : ''}
                </p>

                <button onclick="ouvrirModalConfidentiel('${da}')" class="btn btn-secondaire" style="margin-top: 12px; font-size: 0.85rem;">
                    🔒 Confidentiel ${aDesInfosConfidentielles(da) ? '<span style="color: var(--vert-principal);">●</span>' : ''}
                </button>
            </div>

            <!-- Carte 3 : Observation de la structure des résultats d'apprentissage (SOLO) - Optionnelle -->
            ${(() => {
                const config = db.getSync('modalitesEvaluation', {});
                const afficherSOLO = config.afficherDescriptionsSOLO !== false;

                if (!afficherSOLO) {
                    return ''; // Ne rien afficher si désactivé
                }

                // Filtrer "Français" des forces et défis (critère linguistique, pas cognitif SOLO)
                const forcesSolo = forces.filter(f => f.nom !== 'Français');
                const defisSolo = defis.filter(d => d.nom !== 'Français');

                // Vérifier s'il y a des forces ou défis à afficher (hors Français)
                if (forcesSolo.length === 0 && defisSolo.length === 0) {
                    return `
            <div class="profil-carte">
                <h2 class="profil-section-titre-sous">Observation de la structure des résultats d'apprentissage</h2>
                <p class="profil-texte-italique-gris">
                    Aucune force ni défi identifié selon la taxonomie SOLO.
                </p>
                <div class="profil-separateur-section"></div>
                <p class="profil-texte-mini-gris">
                    Basé sur les travaux de Biggs & Collis (taxonomie SOLO)
                </p>
            </div>
                    `;
                }

                return `
            <div class="profil-carte">
                <h2 class="profil-section-titre-sous">Observation de la structure des résultats d'apprentissage</h2>

                ${(() => {
                    // Obtenir les couleurs IDME depuis l'échelle configurée
                    const couleurE = obtenirCouleurNiveauIDME('E');
                    const couleurM = obtenirCouleurNiveauIDME('M');
                    const couleurD = obtenirCouleurNiveauIDME('D');
                    const couleurI = obtenirCouleurNiveauIDME('I');

                    let html = '';

                    // FORCES E (Étendu) - Bleu
                    if (forcesSolo.some(f => f.valeur >= 0.85)) {
                        html += `
                <div style="margin-bottom: 12px;">
                    <h4 style="color: ${couleurE}; font-size: 0.9rem; margin-bottom: 10px; font-weight: 600; text-transform: uppercase;">
                        Forces exceptionnelles
                    </h4>
                    <div style="background: ${couleurE}22; border-left: 4px solid ${couleurE}; padding: 10px 12px;">
                        <div style="font-weight: bold; color: ${couleurE};">
                            ${forcesSolo.filter(f => f.valeur >= 0.85).map(f => f.nom).join(', ')} : Maîtrisé et étendu (E)
                        </div>
                        <div class="profil-texte-explicatif">
                            À ce niveau abstrait étendu, l'élève a la capacité de généraliser la structure au-delà de l'information donnée. Il comprend et il est capable de transférer ses apprentissages à des contextes proches.
                        </div>
                    </div>
                </div>
                        `;
                    }

                    // FORCES M (Maîtrisé) - Vert
                    if (forcesSolo.some(f => f.valeur >= seuilMaitrise && f.valeur < 0.85)) {
                        html += `
                <div style="margin-bottom: ${defisSolo.length > 0 ? '20px' : '0'};">
                    <h4 style="color: ${couleurM}; font-size: 0.9rem; margin-bottom: 10px; font-weight: 600; text-transform: uppercase;">
                        Forces identifiées
                    </h4>
                    <div style="background: ${couleurM}22; border-left: 4px solid ${couleurM}; padding: 10px 12px;">
                        <div style="font-weight: bold; color: ${couleurM};">
                            ${forcesSolo.filter(f => f.valeur >= seuilMaitrise && f.valeur < 0.85).map(f => f.nom).join(', ')} : Maîtrisé (M)
                        </div>
                        <div class="profil-texte-explicatif">
                            À ce niveau relationnel, l'élève peut comprendre, lier et intégrer plusieurs aspects d'une réponse dans un tout cohérent. Il voit plusieurs aspects d'une situation et sait l'aborder de différentes façons.
                        </div>
                    </div>
                </div>
                        `;
                    }

                    // DÉFIS D (Développement) - Orange
                    if (defisSolo.some(d => d.valeur >= obtenirSeuil('idme.insuffisant') && d.valeur < seuilDeveloppement)) {
                        html += `
                <div style="margin-bottom: 12px;">
                    <h4 style="color: ${couleurD}; font-size: 0.9rem; margin-bottom: 10px; font-weight: 600; text-transform: uppercase;">
                        Défis en développement
                    </h4>
                    <div style="background: ${couleurD}22; border-left: 4px solid ${couleurD}; padding: 10px 12px;">
                        <div style="font-weight: bold; color: ${couleurD};">
                            ${defisSolo.filter(d => d.valeur >= obtenirSeuil('idme.insuffisant') && d.valeur < seuilDeveloppement).map(d => d.nom).join(', ')} : En développement (D)
                        </div>
                        <div class="profil-texte-explicatif">
                            À ce niveau multistructurel, l'élève peut se concentrer sur plusieurs points pertinents à la fois. Cependant, il les considère indépendamment.
                        </div>
                    </div>
                </div>
                        `;
                    }

                    // DÉFIS I (Insuffisant) - Rouge
                    if (defisSolo.some(d => d.valeur < obtenirSeuil('idme.insuffisant'))) {
                        html += `
                <div>
                    <h4 style="color: ${couleurI}; font-size: 0.9rem; margin-bottom: 10px; font-weight: 600; text-transform: uppercase;">
                        Défis critiques
                    </h4>
                    <div style="background: ${couleurI}22; border-left: 4px solid ${couleurI}; padding: 10px 12px;">
                        <div style="font-weight: bold; color: ${couleurI};">
                            ${defisSolo.filter(d => d.valeur < obtenirSeuil('idme.insuffisant')).map(d => d.nom).join(', ')} : Insuffisant ou incomplet (I)
                        </div>
                        <div class="profil-texte-explicatif">
                            À ce niveau unistructurel, l'élève ne traite que d'un seul aspect du savoir ou d'un savoir-faire à la fois. L'élève n'a pas encore de réelle compréhension.
                        </div>
                    </div>
                </div>
                        `;
                    }

                    return html;
                })()}

                <div class="profil-separateur-section"></div>
                <p class="profil-texte-mini-gris">
                    Basé sur les travaux de Biggs & Collis (taxonomie SOLO)
                </p>
            </div>
                `;
            })()}
        </div>

        <!-- Historique compact -->
        <div style="margin-top: 15px;">
            <div class="u-flex-between-mb10">
                <h4 style="color: var(--bleu-principal); font-size: 0.95rem; margin: 0; font-weight: 600;">
                    HISTORIQUE ${interventions && interventions.length > 0 ? `(${interventions.length} intervention${interventions.length > 1 ? 's' : ''})` : ''}
                </h4>
                <button class="btn btn-principal" onclick="naviguerVersNouvelleIntervention();">+ Nouvelle intervention</button>
            </div>
        </div>
    `;

    if (!interventions || interventions.length === 0) {
        html += `
            <div class="carte profil-zone-centre-fond-bleu">
                <div style="font-size: 0.95rem; color: #666; font-style: italic;">
                    Aucune intervention documentée. Les interventions RàI apparaîtront ici.
                </div>
            </div>
        `;
        return html;
    }

    // Trier les interventions par date (plus récente en premier)
    const interventionsTriees = [...interventions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    // Conteneur timeline
    html += `<div class="carte" style="padding: 0; margin-bottom: 20px;">`;

    // Afficher chaque intervention en format timeline compact (une seule ligne)
    interventionsTriees.forEach(intervention => {
        const date = new Date(intervention.date + 'T12:00:00');
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        const dateFormatee = date.toLocaleDateString('fr-CA', options);
        const duree = intervention.duree || 2;
        const typeIcone = intervention.type === 'individuel' ? '👤' : '👥';
        const noteIndividuelle = intervention.notesIndividuelles?.[da] || '';
        const niveauRai = intervention.niveauRai || 3;

        // Déterminer le texte du badge (titre ou niveau)
        let badgeTexte = '';
        if (intervention.titre) {
            badgeTexte = intervention.titre;
        } else {
            badgeTexte = niveauRai === 1 ? 'Rattrapage (1)' : niveauRai === 2 ? 'Rattrapage (2)' : 'Intervention niveau 3';
        }

        html += `
            <div class="intervention-timeline-item">
                <div style="flex: 1; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <span class="badge-intervention-vert">
                        ${typeIcone} ${badgeTexte}
                    </span>
                    <span style="color: var(--bleu-principal); font-weight: 600; font-size: 0.9rem;">
                        ${dateFormatee}
                    </span>
                    ${noteIndividuelle ? `
                        <span style="color: #666; font-size: 0.9rem; flex: 1;">
                            ${noteIndividuelle}
                        </span>
                    ` : ''}
                </div>
                <div class="intervention-timeline-actions">
                    <button class="btn btn-secondaire" onclick="naviguerVersIntervention('${intervention.id}');">
                        Consulter
                    </button>
                </div>
            </div>
        `;
    });

    html += `</div>`;

    return html;
}

/**
 * Génère le HTML de la section Mobilisation (M) détaillée
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionMobilisation(da) {
    const indices = calculerTousLesIndices(da);

    // Récupérer A et C séparément (en proportions 0-1)
    const A = indices.A / 100;
    const C = indices.C / 100;

    // Interpréter selon A et C (pas la moyenne M)
    const interpM = interpreterMobilisation(A, C);

    return `
        <!-- STATISTIQUES -->
        <div class="profil-grid-indicateurs">
            <div class="profil-indicateur">
                <div class="profil-indicateur-contenu">
                    <span class="profil-indicateur-label">Assiduité (A)</span>
                    <strong class="profil-indicateur-valeur">${indices.A}%</strong>
                </div>
            </div>
            <div class="profil-indicateur">
                <div class="profil-indicateur-contenu">
                    <span class="profil-indicateur-label">Complétion (C)</span>
                    <strong class="profil-indicateur-valeur">${indices.C}%</strong>
                </div>
            </div>
            <div class="profil-indicateur profil-indicateur-accent-gauche" style="color: ${interpM.couleur};">
                <div class="profil-indicateur-contenu">
                    <span class="profil-indicateur-label">Mobilisation (M)</span>
                    <strong class="profil-indicateur-valeur">${indices.M}</strong>
                </div>
            </div>
        </div>

        <!-- INTERPRÉTATION QUALITATIVE -->
        <div class="profil-interpretation" style="background: linear-gradient(to right, ${interpM.couleur}22, ${interpM.couleur}11); border-left-color: ${interpM.couleur};">
            <div class="profil-interpretation-titre" style="color: ${interpM.couleur};">
                ${interpM.emoji} ${interpM.niveau}
            </div>
            <div class="profil-interpretation-texte">
                ${interpM.niveau === 'Décrochage' ?
                    "⚫ L'étudiant ne se présente plus au cours. Les interventions pédagogiques ne sont plus possibles. Référer aux services d'aide et à l'API." :
                  interpM.niveau === 'Assiduité ET complétion critiques' ?
                    "🔴 Situation critique : présence ET remise des travaux sous 70%. Intervention RàI niveau 3 immédiate requise." :
                  interpM.niveau === 'Assiduité critique' ?
                    "🟠 Assiduité critique (< 70%). La présence irrégulière compromet l'apprentissage. Intervention prioritaire sur l'engagement comportemental." :
                  interpM.niveau === 'Complétion critique' ?
                    "🟠 Complétion critique (< 70%). Les travaux ne sont pas remis. Investigation des obstacles organisationnels ou motivationnels nécessaire." :
                  interpM.niveau === 'Mobilisation fragile' ?
                    "🟡 Les deux composantes (A et C) sont entre 70-80%. Soutien proactif recommandé pour stabiliser l'engagement." :
                  interpM.niveau === 'Assiduité fragile' ?
                    "🟡 L'assiduité est entre 70-80% alors que la complétion est satisfaisante. Renforcer la présence en classe." :
                  interpM.niveau === 'Complétion fragile' ?
                    "🟡 La complétion est entre 70-80% alors que l'assiduité est satisfaisante. Soutenir l'organisation et la planification." :
                  interpM.niveau === 'Favorable' ?
                    "🔵 Excellent engagement comportemental ! Assiduité et complétion ≥ 90%. Maintenir cette dynamique positive." :
                    "🟢 Engagement comportemental satisfaisant. Assiduité et complétion ≥ 80%. Continuer la surveillance de niveau 1."}
            </div>
        </div>

        <!-- DÉCOMPOSITION VISUELLE -->
        <h4 class="profil-titre-bleu-compact">
            Décomposition de l'indice M
        </h4>
        <div class="profil-carte-simple">
            <div style="font-family: monospace; font-size: 1.1rem; text-align: center; color: var(--bleu-principal);">
                M = (A + C) / 2 = (${indices.A}% + ${indices.C}%) / 2 = ${indices.M}
            </div>
        </div>

        <!-- RECOMMANDATIONS SELON LE NIVEAU -->
        ${interpM.niveau === 'Décrochage' ? `
            <div style="background: #f5f5f5; border-left: 4px solid #9e9e9e; padding: 15px;">
                <h4 style="color: #616161; margin-bottom: 10px;">⚫ Actions requises</h4>
                <ul style="margin: 0; padding-left: 20px; color: #616161; line-height: 1.6;">
                    <li>Contact immédiat avec l'aide pédagogique individuelle (API)</li>
                    <li>Tentative de contact direct (téléphone, courriel)</li>
                    <li>Référence aux services d'aide psychosociale si pertinent</li>
                    <li>Documentation du dossier étudiant</li>
                </ul>
            </div>
        ` : (A < 0.7 || C < 0.7) ? `
            <div style="background: ${A < 0.7 && C < 0.7 ? '#f8d7da' : '#fff3cd'};
                        border-left: 4px solid ${A < 0.7 && C < 0.7 ? '#dc3545' : '#ff9800'};
                        padding: 15px; border-radius: 6px;">
                <h4 style="color: ${A < 0.7 && C < 0.7 ? '#721c24' : '#856404'}; margin-bottom: 10px;">
                    💡 Recommandations d'intervention (niveau critique)
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: ${A < 0.7 && C < 0.7 ? '#721c24' : '#856404'}; line-height: 1.6;">
                    ${A < 0.7 && C < 0.7 ?
                        '<li><strong>Intervention RàI niveau 3 immédiate</strong> - Les deux composantes sont critiques</li>' : ''}
                    ${A < 0.7 ?
                        '<li><strong>Assiduité critique :</strong> Rencontre immédiate pour identifier les causes d\'absence</li>' : ''}
                    ${C < 0.7 ?
                        '<li><strong>Complétion critique :</strong> Investigation des obstacles à la remise des travaux</li>' : ''}
                    <li>Établir un plan d'intervention personnalisé (PIP) avec objectifs mesurables</li>
                    <li>Suivi hebdomadaire jusqu'à amélioration significative</li>
                    <li>Mobiliser les ressources d'aide (tutorat, aide technologique, etc.)</li>
                </ul>
            </div>
        ` : (A < 0.8 || C < 0.8) ? `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px;">
                <h4 style="color: #856404; margin-bottom: 10px;">💡 Recommandations préventives (niveau fragile)</h4>
                <ul style="margin: 0; padding-left: 20px; color: #856404; line-height: 1.6;">
                    ${A < 0.8 && C < 0.8 ?
                        '<li><strong>Mobilisation fragile :</strong> Soutien sur les deux composantes (présence ET remise)</li>' :
                      A < 0.8 ?
                        '<li><strong>Assiduité fragile :</strong> Renforcer la motivation à assister aux séances</li>' :
                        '<li><strong>Complétion fragile :</strong> Soutenir l\'organisation et la gestion du temps</li>'}
                    <li>Discussion informelle pour identifier les obstacles émergents</li>
                    <li>Offrir stratégies d'autorégulation et de planification</li>
                    <li>Réévaluation dans 2 semaines</li>
                </ul>
            </div>
        ` : ''}
    `;
}

/**
 * Génère le HTML de la section Engagement (E) détaillée
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionEngagement(da) {
    const indices = calculerTousLesIndices(da);
    const interpE = interpreterEngagement(indices.E);

    // Récupérer A, C, P séparément (en proportions 0-1)
    const A = indices.A / 100;
    const C = indices.C / 100;
    const P = indices.P / 100;

    // Identifier le composant le plus faible (facteur limitant)
    const composants = [
        { nom: 'Assiduité (A)', valeur: A, pourcentage: indices.A },
        { nom: 'Complétion (C)', valeur: C, pourcentage: indices.C },
        { nom: 'Performance (P)', valeur: P, pourcentage: indices.P }
    ];
    const facteurLimitant = composants.reduce((min, comp) => comp.valeur < min.valeur ? comp : min);

    // Calculer le prochain seuil
    let prochainSeuil = '';
    let distanceSeuil = 0;
    if (indices.E < 0.65) {
        prochainSeuil = '0.65 (En développement)';
        distanceSeuil = 0.65 - indices.E;
    } else if (indices.E < 0.75) {
        prochainSeuil = '0.75 (Bon engagement)';
        distanceSeuil = 0.75 - indices.E;
    } else if (indices.E < 0.85) {
        prochainSeuil = '0.85 (Excellent engagement)';
        distanceSeuil = 0.85 - indices.E;
    }

    return `
        <!-- STATISTIQUES -->
        <div class="profil-grid-auto-200">
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Assiduité (A)</span>
                    <strong class="profil-valeur-grande-bleu">${indices.A}%</strong>
                </div>
            </div>
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Complétion (C)</span>
                    <strong class="profil-valeur-grande-bleu">${indices.C}%</strong>
                </div>
            </div>
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Performance (P)</span>
                    <strong class="profil-valeur-grande-bleu">${indices.P}%</strong>
                </div>
            </div>
            <div style="background: var(--bleu-tres-pale); padding: 15px; border: 2px solid var(--bleu-principal); border-left: 4px solid ${interpE.couleur};">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Engagement (E)</span>
                    <strong class="profil-valeur-grande-bleu">${indices.E}</strong>
                </div>
                <div style="margin-top: 8px; font-size: 0.85rem; color: #555;">
                    E = ∛(A × C × P)
                    <span class="primo-aide" data-target="conseil-formule-engagement-carte" style="margin-left: 5px; display: inline-block !important; cursor: pointer;">😎</span>
                </div>
                <div style="margin-top: 8px; padding: 6px 10px; background: #fff9e6; border-left: 3px solid #ffa000; font-size: 0.8rem; color: #555;">
                    <strong>💡 Note :</strong> Indice longitudinal (historique complet depuis le début du trimestre)
                </div>
            </div>
        </div>

        <!-- Conseil Primo: Explication de la formule d'engagement (dans la carte) -->
        <div id="conseil-formule-engagement-carte" class="carte-info-toggle carte-info-conseil" style="display: none; margin-top: 10px;">
            <strong>Pourquoi la racine cubique ?</strong>
            <p>La racine cubique (∛) est une <strong>transformation normalisante</strong> qui préserve l'échelle d'origine tout en combinant les trois indices.</p>

            <p><strong>Exemple concret :</strong></p>
            <ul style="margin-left: 20px; line-height: 1.6;">
                <li><strong>Sans racine cubique :</strong> Un étudiant à 70% sur A, C et P aurait : 0.7 × 0.7 × 0.7 = <strong>34%</strong> d'engagement ← Trop punitif !</li>
                <li><strong>Avec racine cubique :</strong> Le même étudiant obtient : ∛(0.7 × 0.7 × 0.7) = <strong>70%</strong> d'engagement ← Cohérent et intuitif !</li>
            </ul>

            <p><strong>Pourquoi utiliser la multiplication ?</strong></p>
            <p>La multiplication (plutôt qu'une simple moyenne) permet de <strong>pénaliser les déséquilibres</strong>. Un étudiant qui excelle en assiduité (90%) mais échoue en performance (30%) aura un engagement plus faible qu'un étudiant équilibré à 60% partout.</p>

            <p><strong>En résumé :</strong></p>
            <p>La racine cubique compense la décroissance multiplicative tout en préservant l'effet punitif sur les déséquilibres importants. C'est la <strong>moyenne géométrique</strong> des trois indices A-C-P.</p>
        </div>

        <!-- INTERPRÉTATION QUALITATIVE -->
        <div style="padding: 15px; background: linear-gradient(to right, ${interpE.couleur}22, ${interpE.couleur}11);
                    border-left: 4px solid ${interpE.couleur}; margin-bottom: 15px;">
            <div style="font-size: 1.1rem; font-weight: bold; color: ${interpE.couleur}; margin-bottom: 8px;">
                ${interpE.emoji} ${interpE.niveau}
            </div>
            <div style="color: #666; line-height: 1.5;">
                ${interpE.niveau === 'Excellent engagement' ?
                    "Cet étudiant démontre un engagement global exemplaire, combinant présence, complétion et performance de haut niveau." :
                  interpE.niveau === 'Bon engagement' ?
                    "Cet étudiant montre un bon engagement global. La combinaison présence-complétion-performance est satisfaisante." :
                  interpE.niveau === 'En développement' ?
                    "L'engagement global nécessite une attention. Un soutien ciblé sur le facteur limitant pourrait améliorer significativement l'engagement." :
                  interpE.niveau === 'Engagement insuffisant' ?
                    "⚠️ Engagement insuffisant. Les composantes A-C-P révèlent des faiblesses qui nécessitent une intervention de niveau 2." :
                    "🚨 Engagement très faible. Intervention immédiate de niveau 3 requise pour éviter l'échec."}
            </div>
        </div>

        <!-- DÉCOMPOSITION VISUELLE -->
        <h4 class="profil-titre-bleu-compact">
            Décomposition de l'indice E
        </h4>
        <div class="profil-carte-simple">
            <div class="profil-texte-mono-centre-bleu">
                E = ∛(A × C × P)
                <span class="primo-aide" data-target="conseil-formule-engagement-principale" style="display: inline-block !important; cursor: pointer;">😎</span>
            </div>
            <div class="profil-texte-mono-centre-bleu">
                E = ∛(${A.toFixed(2)} × ${C.toFixed(2)} × ${P.toFixed(2)}) = ${indices.E}
            </div>
            <div style="background: #f0f7ff; padding: 12px; border-radius: 4px; font-size: 0.9rem; color: #555; line-height: 1.6;">
                <strong>⚠️ Nature multiplicative :</strong> Si un seul composant est faible, l'engagement global chute drastiquement.
                ${indices.E < 0.50 ? `<br><strong>Facteur limitant identifié :</strong> ${facteurLimitant.nom} (${facteurLimitant.pourcentage}%)` : ''}
            </div>
        </div>

        <!-- Conseil Primo: Explication de la formule d'engagement -->
        <div id="conseil-formule-engagement-principale" class="carte-info-toggle carte-info-conseil" style="display: none; margin-top: 10px;">
            <strong>Pourquoi la racine cubique ?</strong>
            <p>La racine cubique (∛) est une <strong>transformation normalisante</strong> qui préserve l'échelle d'origine tout en combinant les trois indices.</p>

            <p><strong>Exemple concret :</strong></p>
            <ul style="margin-left: 20px; line-height: 1.6;">
                <li><strong>Sans racine cubique :</strong> Un étudiant à 70% sur A, C et P aurait : 0.7 × 0.7 × 0.7 = <strong>34%</strong> d'engagement ← Trop punitif !</li>
                <li><strong>Avec racine cubique :</strong> Le même étudiant obtient : ∛(0.7 × 0.7 × 0.7) = <strong>70%</strong> d'engagement ← Cohérent et intuitif !</li>
            </ul>

            <p><strong>Pourquoi utiliser la multiplication ?</strong></p>
            <p>La multiplication (plutôt qu'une simple moyenne) permet de <strong>pénaliser les déséquilibres</strong>. Un étudiant qui excelle en assiduité (90%) mais échoue en performance (30%) aura un engagement plus faible qu'un étudiant équilibré à 60% partout.</p>

            <p><strong>En résumé :</strong></p>
            <p>La racine cubique compense la décroissance multiplicative tout en préservant l'effet punitif sur les déséquilibres importants. C'est la <strong>moyenne géométrique</strong> des trois indices A-C-P.</p>
        </div>

        <!-- PROCHAIN SEUIL -->
        ${prochainSeuil ? `
            <div style="background: #e7f3ff; border: 1px solid #2196F3; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <h4 style="color: #1976d2; margin-bottom: 10px;">🎯 Prochain objectif</h4>
                <div style="color: #1976d2; line-height: 1.6;">
                    <strong>Seuil à atteindre :</strong> ${prochainSeuil}<br>
                    <strong>Distance :</strong> ${(distanceSeuil * 100).toFixed(1)} points<br>
                    ${facteurLimitant.valeur < 0.70 ?
                        `<strong>💡 Levier principal :</strong> Améliorer ${facteurLimitant.nom} pour un effet multiplicatif maximum` : ''}
                </div>
            </div>
        ` : `
            <div style="background: linear-gradient(to right, #2196F322, #2196F311); border-left: 4px solid #2196F3; padding: 15px; margin-bottom: 15px;">
                <div style="color: #1976d2; font-weight: bold;">
                    🏆 Seuil maximum atteint ! Maintenir cet excellent engagement.
                </div>
            </div>
        `}

        <!-- RECOMMANDATIONS -->
        ${indices.E < 0.75 ? `
            <div style="background: ${indices.E < 0.40 ? '#f8d7da' : '#fff3cd'};
                        border-left: 4px solid ${indices.E < 0.40 ? '#dc3545' : '#ffc107'};
                        padding: 15px; border-radius: 6px;">
                <h4 style="color: ${indices.E < 0.40 ? '#721c24' : '#856404'}; margin-bottom: 10px;">
                    💡 Recommandations d'intervention
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: ${indices.E < 0.40 ? '#721c24' : '#856404'}; line-height: 1.6;">
                    ${facteurLimitant.valeur < 0.65 ?
                        `<li><strong>Priorité absolue :</strong> ${facteurLimitant.nom} est le facteur limitant critique (${facteurLimitant.pourcentage}%)</li>` : ''}
                    ${indices.E < 0.40 ?
                        '<li><strong>Intervention RàI niveau 3 immédiate</strong> - Risque d\'échec très élevé</li>' : ''}
                    ${indices.E >= 0.40 && indices.E < 0.65 ?
                        '<li><strong>Intervention RàI niveau 2 recommandée</strong> - Soutien ciblé requis</li>' : ''}
                    <li>Cibler le composant le plus faible pour maximiser l'effet multiplicatif</li>
                    ${A < 0.70 || C < 0.70 ?
                        '<li>Focus sur l\'engagement comportemental (A et C) avant la performance</li>' : ''}
                    ${P < 0.70 && A >= 0.70 && C >= 0.70 ?
                        '<li>Présence et remise satisfaisantes : concentrer le soutien sur la qualité des productions</li>' : ''}
                </ul>
            </div>
        ` : ''}
    `;
}

/**
 * Génère le HTML de la section Risque (R) détaillée
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionRisque(da) {
    const indices = calculerTousLesIndices(da);
    const interpE = interpreterEngagement(indices.E);

    // Déterminer le niveau RàI basé sur l'engagement (E)
    let niveauRaI = 1;
    let descriptionRaI = 'Niveau 1 - Surveillance universelle';
    let urgence = 'Aucune action immédiate requise';
    let couleurUrgence = '#28a745';

    // Seuils basés sur l'engagement (inversé par rapport au risque)
    if (indices.E < 0.30) {
        niveauRaI = 3;
        descriptionRaI = 'Niveau 3 - Intervention intensive individuelle';
        urgence = '🚨 URGENCE MAXIMALE - Intervention immédiate requise';
        couleurUrgence = '#dc3545';
    } else if (indices.E < 0.50) {
        niveauRaI = 2;
        descriptionRaI = 'Niveau 2 - Intervention ciblée en petit groupe';
        urgence = '⚠️ Intervention prioritaire dans les prochains jours';
        couleurUrgence = '#ff9800';
    } else if (indices.E < 0.65) {
        niveauRaI = 2;
        descriptionRaI = 'Niveau 2 - Surveillance accrue';
        urgence = '⚡ Attention requise - Surveillance renforcée';
        couleurUrgence = '#ffc107';
    }

    const pourcentageEngagement = (indices.E * 100).toFixed(0);

    return `
        <!-- BADGE NIVEAU ENGAGEMENT -->
        <div class="badge" style="background-color: ${interpE.couleur}22; color: ${interpE.couleur}; border: 1px solid ${interpE.couleur};">
            ${interpE.niveau} (${pourcentageEngagement}%)
        </div>

        <ul class="info-liste">
            <li><strong>Niveau RàI :</strong> ${descriptionRaI}</li>
            <li><strong>Urgence :</strong> <span style="color: ${couleurUrgence};">${urgence}</span></li>
        </ul>

        <div class="section-titre u-mt-25">Position sur l'échelle de risque</div>

        <div class="profil-echelle-risque">
            <div class="profil-echelle-barre" style="background: linear-gradient(to right,
                        #2196F3 0%, #2196F3 20%,
                        #28a745 20%, #28a745 35%,
                        #ffc107 35%, #ffc107 50%,
                        #ff9800 50%, #ff9800 70%,
                        #dc3545 70%, #dc3545 100%);">
                <div class="profil-echelle-indicateur-haut" style="left: ${Math.min(indices.R * 100, 100)}%;">▼</div>
                <div class="profil-echelle-indicateur-bas" style="left: ${Math.min(indices.R * 100, 100)}%;">R = ${indices.R}</div>
            </div>

            <div class="legende-risque-container">
                <div class="legende-risque-item" style="left: 10%; color: #2196F3;">
                    <span class="legende-risque-niveau">Minimal</span>
                    <span class="legende-risque-seuil">0-0.19</span>
                </div>
                <div class="legende-risque-item" style="left: 27.5%; color: #28a745;">
                    <span class="legende-risque-niveau">Faible</span>
                    <span class="legende-risque-seuil">0.20-0.34</span>
                </div>
                <div class="legende-risque-item" style="left: 42.5%; color: #ffc107;">
                    <span class="legende-risque-niveau">Modéré</span>
                    <span class="legende-risque-seuil">0.35-0.49</span>
                </div>
                <div class="legende-risque-item" style="left: 60%; color: #ff9800;">
                    <span class="legende-risque-niveau">Élevé</span>
                    <span class="legende-risque-seuil">0.50-0.69</span>
                </div>
                <div class="legende-risque-item" style="left: 85%; color: #dc3545;">
                    <span class="legende-risque-niveau">Critique</span>
                    <span class="legende-risque-seuil">≥ 0.70</span>
                </div>
            </div>
        </div>

        <div class="profil-formule">
            <div class="profil-formule-code">R = 1 - E = 1 - ${indices.E} = ${indices.R}</div>
        </div>

        <div class="profil-formule-explications">
            L'engagement mesure la <strong>mobilisation globale</strong> de l'étudiant selon la formule : E = ∛(A × C × P)
            <span class="primo-aide" data-target="conseil-formule-engagement">😎</span>
            <br>Engagement actuel : <strong style="color: ${interpE.couleur};">${interpE.niveau}</strong>
        </div>

        <!-- Conseil Primo: Explication de la formule d'engagement -->
        <div id="conseil-formule-engagement" class="carte-info-toggle carte-info-conseil" style="display: none; margin-top: 10px;">
            <strong>Pourquoi la racine cubique ?</strong>
            <p>La racine cubique (∛) est une <strong>transformation normalisante</strong> qui préserve l'échelle d'origine tout en combinant les trois indices.</p>

            <p><strong>Exemple concret :</strong></p>
            <ul style="margin-left: 20px; line-height: 1.6;">
                <li><strong>Sans racine cubique :</strong> Un étudiant à 70% sur A, C et P aurait : 0.7 × 0.7 × 0.7 = <strong>34%</strong> d'engagement ← Trop punitif !</li>
                <li><strong>Avec racine cubique :</strong> Le même étudiant obtient : ∛(0.7 × 0.7 × 0.7) = <strong>70%</strong> d'engagement ← Cohérent et intuitif !</li>
            </ul>

            <p><strong>Avantages de cette approche :</strong></p>
            <ul style="margin-left: 20px; line-height: 1.6;">
                <li>✅ L'engagement reste sur la même échelle que A, C et P (0-100%)</li>
                <li>✅ Un étudiant équilibré conserve son niveau moyen</li>
                <li>✅ Les déséquilibres importants restent pénalisés (ex: A=100%, C=100%, P=0% → E=0%)</li>
                <li>✅ Plus intuitif qu'une moyenne arithmétique qui ne pénaliserait pas assez les lacunes</li>
            </ul>

            <p style="margin-top: 10px; color: #666; font-style: italic;">💡 C'est une moyenne géométrique qui mesure la mobilisation globale tout en respectant l'interdépendance des trois dimensions.</p>
        </div>

        <div class="section-titre u-mt-25">Indicateurs clés</div>

        <div class="profil-grid-indicateurs">
            <div class="profil-indicateur">
                <div class="profil-indicateur-contenu">
                    <span class="profil-indicateur-label">Engagement (E)</span>
                    <strong class="profil-indicateur-valeur">${indices.E}</strong>
                </div>
            </div>
            <div class="profil-indicateur profil-indicateur-accent-gauche" style="color: ${interpR.couleur};">
                <div class="profil-indicateur-contenu">
                    <span class="profil-indicateur-label">Risque (R)</span>
                    <strong class="profil-indicateur-valeur">${indices.R}</strong>
                </div>
            </div>
            <div class="profil-indicateur">
                <div class="profil-indicateur-contenu">
                    <span class="profil-indicateur-label">Niveau RàI</span>
                    <strong class="profil-indicateur-valeur">${niveauRaI}</strong>
                </div>
            </div>
        </div>

        ${indices.R >= seuilMinimal ? `
            <div class="profil-recommandations ${indices.R >= seuilEleve ? 'profil-recommandations-danger' : indices.R >= seuilModere ? 'profil-recommandations-avertissement' : 'profil-recommandations-info'} u-mt-20">
                <h4 class="profil-recommandations-titre ${indices.R >= seuilEleve ? 'u-texte-danger' : indices.R >= seuilModere ? 'profil-texte-avertissement' : 'profil-texte-info'}">
                    Intervention ciblée recommandée
                </h4>
                <ol class="profil-recommandations-liste ${indices.R >= seuilEleve ? 'u-texte-danger' : indices.R >= seuilModere ? 'profil-texte-avertissement' : 'profil-texte-info'}">
                    ${indices.R >= seuilEleve ? `
                        <li><strong>JOUR 1 :</strong> Rencontre individuelle urgente avec l'étudiant et conseiller pédagogique</li>
                        <li><strong>JOUR 2-3 :</strong> Établir un plan d'intervention personnalisé (PIP) avec objectifs mesurables</li>
                        <li><strong>SEMAINE 1 :</strong> Suivi quotidien de la présence et remise des travaux en retard</li>
                        <li><strong>Mobiliser :</strong> Parents, aide pédagogique individuelle (API), services étudiants</li>
                        <li><strong>Réévaluation :</strong> Rencontre de suivi hebdomadaire jusqu'à amélioration significative</li>
                    ` : indices.R >= seuilModere ? `
                        <li><strong>Cette semaine :</strong> Rencontre individuelle pour identifier les obstacles</li>
                        <li><strong>Mise en place :</strong> Soutien ciblé sur le(s) composant(s) faible(s) (A, C ou P)</li>
                        <li><strong>Suivi :</strong> Vérification bihebdomadaire des progrès</li>
                        <li><strong>Prévention :</strong> Stratégies d'autorégulation et planification</li>
                        <li><strong>Réévaluation :</strong> Dans 2 semaines pour ajuster l'intervention</li>
                    ` : `
                        <li><strong>Surveillance renforcée :</strong> Monitorer hebdomadairement les indices A-C-P</li>
                        <li><strong>Dialogue proactif :</strong> Discussion informelle pour détecter signaux faibles</li>
                        <li><strong>Ressources préventives :</strong> Partager outils d'organisation et de planification</li>
                        <li><strong>Valorisation :</strong> Renforcer la motivation par rétroaction positive</li>
                    `}
                </ol>
            </div>
        ` : `
            <div class="profil-recommandations profil-recommandations-succes u-mt-20">
                <h4 class="profil-recommandations-titre u-texte-succes">Maintien de l'engagement</h4>
                <ul class="profil-recommandations-liste u-texte-succes">
                    <li>Continuer la surveillance universelle (Niveau RàI 1)</li>
                    <li>Fournir rétroaction positive régulière</li>
                    <li>Encourager l'autonomie et l'autorégulation</li>
                    <li>Offrir défis stimulants pour maintenir la motivation</li>
                </ul>
            </div>
        `}
    `;
}

/**
 * Calcule la performance PAN basée sur les artefacts SÉLECTIONNÉS dans le portfolio
 * @param {string} da - Numéro de DA
 * @returns {number} - Performance en proportion 0-1
 */
function calculerPerformancePAN(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da && e.noteFinale);

    if (evaluationsEleve.length === 0) {
        return 0;
    }

    // 🆕 PRIORITÉ 1 : Utiliser les artefacts SÉLECTIONNÉS dans le portfolio
    const selectionsPortfolios = obtenirDonneesSelonMode('portfoliosEleves') || {};
    const productions = obtenirDonneesSelonMode('productions') || [];
    const portfolio = productions.find(p => p.type === 'portfolio');

    if (portfolio && selectionsPortfolios[da]?.[portfolio.id]) {
        const selectionEleve = selectionsPortfolios[da][portfolio.id];
        const artefactsRetenus = selectionEleve.artefactsRetenus;

        if (artefactsRetenus.length > 0) {
            // Filtrer les évaluations pour ne garder que les artefacts sélectionnés
            const evaluationsRetenues = evaluationsEleve.filter(e =>
                artefactsRetenus.includes(e.productionId)
            );

            if (evaluationsRetenues.length > 0) {
                // Calculer la moyenne des artefacts sélectionnés
                const moyenne = evaluationsRetenues.reduce((sum, e) => sum + e.noteFinale, 0) / evaluationsRetenues.length;
                console.log(`Indice P calculé depuis ${evaluationsRetenues.length} artefact(s) sélectionné(s): ${moyenne.toFixed(1)}%`);
                return moyenne / 100; // Retourner en proportion 0-1
            }
        }
    }

    // FALLBACK : Si pas de sélection, prendre les 3 meilleures notes (comportement par défaut)
    const meilleuresNotes = evaluationsEleve
        .map(e => e.noteFinale)
        .sort((a, b) => b - a)
        .slice(0, 3);

    const moyenne = meilleuresNotes.reduce((sum, note) => sum + note, 0) / meilleuresNotes.length;
    console.log(`Indice P calculé depuis les ${meilleuresNotes.length} meilleure(s) note(s): ${moyenne.toFixed(1)}%`);
    return moyenne / 100; // Retourner en proportion 0-1
}

/**
 * Obtient la couleur selon le taux (en pourcentage)
 * @param {number} taux - Taux en pourcentage (0-100)
 * @returns {string} - Code couleur
 */
function obtenirCouleurIndice(taux) {
    if (taux >= 85) return 'var(--risque-minimal)'; // Vert
    if (taux >= 70) return 'var(--risque-modere)';  // Jaune
    return 'var(--risque-tres-eleve)';              // Rouge
}

/**
 * Obtient l'emoji selon le taux
 * @param {number} taux - Taux en pourcentage (0-100)
 * @returns {string} - Emoji
 */
function obtenirEmojiIndice(taux) {
    if (taux >= 85) return '🟢';
    if (taux >= 70) return '🟡';
    return '🔴';
}

/**
 * Obtient les détails d'assiduité pour un étudiant
 * @param {string} da - Numéro de DA
 * @returns {Object} - Détails d'assiduité
 */
/**
 * Obtient les détails d'assiduité pour un étudiant
 * MODIFIÉ : Tri chronologique (plus ancien en premier)
 * 
 * @param {string} da - Numéro de DA
 * @returns {Object} - Détails d'assiduité
 */
function obtenirDetailsAssiduite(da) {
    // ========================================
    // SINGLE SOURCE OF TRUTH
    // Lire depuis db.getSync('indicesAssiduite') calculé par saisie-presences.js
    // ========================================
    const indices = db.getSync((typeof cle === 'function') ? cle('indicesAssiduite') : 'indicesAssiduite', {});
    const detailsSommatif = indices.sommatif && indices.sommatif[da];

    // Si les données n'existent pas, retourner des valeurs par défaut
    if (!detailsSommatif || typeof detailsSommatif !== 'object') {
        console.warn(`⚠️ Aucune donnée d'assiduité pour ${da}, valeurs par défaut`);
        return {
            heuresPresentes: 0,
            heuresOffertes: 0,
            nombreSeances: 0,
            absences: []
        };
    }

    // Extraire les données du calcul sommatif (source unique de vérité)
    const heuresPresentes = detailsSommatif.heuresPresentes || 0;
    const heuresOffertes = detailsSommatif.heuresOffertes || 0;
    const nombreSeances = detailsSommatif.nombreSeances || 0;

    // Récupérer les présences pour calculer la liste des absences
    const presences = obtenirDonneesSelonMode('presences') || [];

    // Obtenir toutes les dates uniques pour lesquelles une saisie a été faite (séances non facultatives)
    const datesSaisies = new Set();
    presences.forEach(p => {
        if (p.da === da && p.heures !== null && p.heures !== undefined) {
            // Ne compter que les séances NON facultatives
            if (p.facultatif !== true) {
                datesSaisies.add(p.date);
            }
        }
    });

    const dureeSeance = obtenirDureeMaxSeance();

    // Récupérer les séances configurées
    // NOTE: seancesHoraire n'est pas mode-aware (configuration globale)
    const seances = db.getSync('seancesHoraire', []);

    // Détecter les absences (totales ET partielles)
    const absences = [];

    // Pour chaque date avec saisie
    datesSaisies.forEach(dateCours => {
        const presenceEleve = presences.find(p => p.da === da && p.date === dateCours);

        // IMPORTANT : Ignorer les séances facultatives (interventions RàI)
        // Ces séances ne doivent JAMAIS apparaître comme absences, même si l'étudiant n'y a pas participé
        if (presenceEleve && presenceEleve.facultatif === true) {
            return; // Passer à la séance suivante
        }

        if (!presenceEleve || presenceEleve.heures === null || presenceEleve.heures === undefined) {
            // Absence totale (aucun enregistrement ou heures null)
            const seance = seances.find(s => s.date === dateCours);
            absences.push({
                date: dateCours,
                heuresPresence: 0,
                heuresManquees: dureeSeance,
                seance: seance
            });
        } else if (presenceEleve.heures < dureeSeance) {
            // Présence partielle (retard/départ anticipé)
            const seance = seances.find(s => s.date === dateCours);
            absences.push({
                date: dateCours,
                heuresPresence: presenceEleve.heures,
                heuresManquees: dureeSeance - presenceEleve.heures,
                seance: seance
            });
        }
    });

    // 🆕 MODIFIÉ : Trier par date CROISSANTE (plus ancien en premier)
    absences.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
        heuresPresentes,
        heuresOffertes,
        nombreSeances,
        absences
    };
}


/**
 * Formate une date ISO en format lisible
 * @param {string} dateISO - Date au format ISO
 * @returns {string} - Date formatée
 */
function formaterDate(dateISO) {
    if (!dateISO) return 'N/A';
    const date = new Date(dateISO + 'T12:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-CA', options);
}

/* ===============================
   AFFICHAGE DU PROFIL COMPLET
   =============================== */

/**
 * Affiche le profil complet d'un étudiant avec dashboard simplifié
 * VERSION 4 - Fusion Performance + Portfolio
 * 
 * MODIFIÉ : Suppression de la carte Portfolio séparée
 */
/**
 * Affiche le profil complet d'un étudiant avec dashboard simplifié
 * VERSION 5 - Option 3 : Carte Portfolio unique
 * 
 * MODIFIÉ : 
 * - Suppression de la carte C (Complétion)
 * - Carte P renommée "Portfolio" affiche la Performance
 * - Détails du portfolio incluent C et P
 * - Grille de 5 colonnes au lieu de 6
 */
/* ===============================
   🎨 FONCTIONS HELPER - REDESIGN UI
   =============================== */

/**
 * Génère la carte premium de cible d'intervention
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la carte
 */
function genererCarteCibleIntervention(da) {
    // NOUVEAU Beta 90 : Utiliser la pratique active
    const pratique = typeof obtenirPratiqueActive === 'function' ? obtenirPratiqueActive() : null;

    if (!pratique) {
        console.error('[ProfilEtudiant] Aucune pratique active trouvée');
        return `
            <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107;">
                <strong>⚠️ Configuration requise</strong><br>
                Veuillez configurer une pratique de notation dans Réglages › Pratique de notation.
            </div>
        `;
    }

    // Utiliser la pratique active
    const cibleInfo = pratique.genererCibleIntervention(da);
    const patternInfo = pratique.identifierPattern(da);

    // Ne pas afficher si pas de cible
    if (!cibleInfo) {
        return '';
    }

    // Obtenir nombre d'artefacts/évaluations pour affichage (si disponible)
    const nbArtefacts = patternInfo.indices?.nbArtefacts || 0;

    // Badge cohérent avec Liste et Aperçu
    const niveauTexte = cibleInfo.niveau === 3 ? 'RàI 3' :
                       cibleInfo.niveau === 2 ? 'RàI 2' :
                       'RàI 1';

    const descriptionNiveau = cibleInfo.niveau === 3
        ? '⚠️ <strong>Action immédiate requise</strong> - Intervention intensive pour prévenir un échec. Mobiliser les ressources d\'aide (CAF, aide à l\'apprentissage).'
        : cibleInfo.niveau === 2
        ? '<strong>Intervention ciblée recommandée</strong> - Soutien spécifique pour consolider les apprentissages et prévenir l\'aggravation des difficultés.'
        : cibleInfo.cible.includes('Pratique autonome')
        ? '✨ <strong>Enrichissement</strong> - L\'étudiant maîtrise les bases. Encourager l\'exploration, la créativité et le développement de l\'autonomie.'
        : '✓ <strong>Maintien</strong> - Performance satisfaisante. Continuer le suivi régulier et encourager la constance.';

    return `
        <!-- Détails de la section (masqué par défaut) -->
        <div id="details-calculs-risque-${da}" class="carte-info-toggle carte-info-note u-hide">
            <strong>À propos de cette section</strong>
            <br><br>
            <strong>Objectif :</strong> Cette section présente le niveau d'intervention RàI (Réponse à l'Intervention) recommandé pour l'étudiant, basé sur une analyse combinée de son engagement, de ses patterns d'apprentissage et de sa performance récente.
            <br><br>
            <strong>Niveaux RàI :</strong> Niveau 1 (Universel) : suivi régulier en classe • Niveau 2 (Préventif) : interventions préventives ciblées • Niveau 3 (Intensif) : interventions intensives individuelles hors classe
            <br><br>
            <strong>Méthodologie :</strong> Le système analyse l'engagement (E = A × C × P), le pattern d'apprentissage actuel (basé sur les ${nbArtefacts} dernier${nbArtefacts > 1 ? 's' : ''} ${obtenirTermeProduction(nbArtefacts > 1 ? 'pluriel' : 'singulier')}), et les défis identifiés sur les critères de la grille de référence. La logique de décision priorise les situations de décrochage, puis les blocages critiques et émergents, avant de recommander des cibles d'enrichissement ou de maintien.
            <br><br>
            <strong>Utilisation :</strong> Cette section vous guide dans le choix d'interventions appropriées. Les recommandations sont contextualisées selon les besoins spécifiques de l'étudiant. Consultez la section Accompagnement pour planifier et documenter vos interventions.
        </div>

        <!-- CARTE CIBLE D'INTERVENTION PREMIUM -->
        <div class="carte-cible-intervention" style="border-color: ${cibleInfo.couleur};">
            <div class="carte-cible-header">
                <div class="carte-cible-titre" style="color: ${cibleInfo.couleur};">
                    ${cibleInfo.emoji} Cible d'intervention recommandée
                </div>
                <div class="carte-cible-badge-niveau" style="background: ${cibleInfo.couleur};">
                    ${niveauTexte}
                </div>
            </div>

            <div class="carte-cible-texte-principal" style="color: ${cibleInfo.couleur};">
                ${cibleInfo.cible}
            </div>

            <div class="carte-cible-meta">
                <strong>Pattern actuel :</strong> ${patternInfo.type} ·
                <strong>Basé sur :</strong> ${nbArtefacts} dernier${nbArtefacts > 1 ? 's' : ''} ${obtenirTermeProduction(nbArtefacts > 1 ? 'pluriel' : 'singulier')}
            </div>

            <div class="carte-cible-description">
                ${descriptionNiveau}
            </div>
        </div>
    `;
}

/**
 * Génère une section collapsible avec header cliquable
 * @param {string} id - ID unique de la section (sans préfixe 'section-')
 * @param {string} titre - Titre affiché dans le header
 * @param {string} contenu - HTML du contenu de la section
 * @param {boolean} ouvert - Si true, section ouverte par défaut
 * @returns {string} - HTML de la section collapsible
 */
function genererSectionCollapsible(id, titre, contenu, ouvert = false) {
    const sectionId = `section-${id}`;
    const contentId = `content-${id}`;
    const chevronId = `chevron-${id}`;

    return `
        <div class="section-collapsible" id="${sectionId}">
            <div class="section-collapsible-header" onclick="toggleSectionCollapsible('${sectionId}')">
                <div class="section-collapsible-titre">
                    ${titre}
                </div>
                <div class="section-collapsible-toggle">
                    <span>Voir</span>
                    <span class="chevron${ouvert ? ' expanded' : ''}" id="${chevronId}">▼</span>
                </div>
            </div>
            <div class="section-collapsible-content${ouvert ? ' expanded' : ''}" id="${contentId}">
                ${contenu}
            </div>
        </div>
    `;
}

/**
 * Toggle une section collapsible
 * @param {string} sectionId - ID de la section (avec préfixe 'section-')
 */
function toggleSectionCollapsible(sectionId) {
    const contentId = sectionId.replace('section-', 'content-');
    const chevronId = sectionId.replace('section-', 'chevron-');

    const content = document.getElementById(contentId);
    const chevron = document.getElementById(chevronId);

    if (!content || !chevron) {
        console.warn(`Éléments de section non trouvés: ${sectionId}`);
        return;
    }

    content.classList.toggle('expanded');
    chevron.classList.toggle('expanded');
}

/**
 * Toggle l'affichage des détails techniques (formules, calculs)
 * @param {string} detailsId - ID de l'élément détails
 */
function toggleDetailsTechniques(detailsId) {
    const details = document.getElementById(detailsId);
    if (!details) {
        console.warn(`Élément détails non trouvé: ${detailsId}`);
        return;
    }
    details.classList.toggle('visible');
}

/**
 * Variable globale pour stocker le DA actuel (utilisée pour navigation)
 */
let profilActuelDA = null;
window.profilActuelDA = null;

/**
 * Variable globale pour mémoriser la section active du profil (Beta 90)
 * Permet de conserver la même section lors de la navigation entre étudiants
 */
let sectionProfilActive = 'productions'; // Par défaut: Productions

/**
 * Change la section affichée dans la colonne droite du profil
 * @param {string} section - Nom de la section (cible, performance, assiduite, etc.)
 */
function changerSectionProfil(section) {
    if (!profilActuelDA) {
        console.error('❌ Aucun profil actuel');
        return;
    }

    const da = profilActuelDA;

    // NOUVEAU (Beta 85): Mémoriser la section active pour navigation entre étudiants
    sectionProfilActive = section;

    // Mettre à jour la navigation active (utilise les classes CSS matériel)
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    // NOUVEAU (Beta 85): Trouver l'élément correspondant à la section
    // Supporte à la fois les clics directs (avec event) et les appels programmatiques
    let itemToActivate = null;

    if (typeof event !== 'undefined' && event.target) {
        // Appel depuis un clic : utiliser event.target
        itemToActivate = event.target.closest('.sidebar-item');
    } else {
        // Appel programmatique : trouver l'item par onclick
        document.querySelectorAll('.sidebar-item').forEach(item => {
            const onclickAttr = item.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(`'${section}'`)) {
                itemToActivate = item;
            }
        });
    }

    if (itemToActivate) {
        itemToActivate.classList.add('active');
    }

    // Générer le contenu selon la section
    const contenuContainer = document.getElementById('profil-contenu-dynamique');
    if (!contenuContainer) {
        console.error('❌ Conteneur de contenu introuvable');
        return;
    }

    let contenu = '';
    let titre = '';

    switch (section) {
        case 'productions':
            titre = 'Productions et évaluations';
            contenu = genererSectionProductions(da);
            break;
        case 'cible':
            titre = 'Suivi de l\'apprentissage';
            contenu = genererContenuCibleIntervention(da);
            break;
        case 'progression':
            titre = 'Progression temporelle';
            contenu = genererSectionProgression(da);
            break;
        case 'performance':
            titre = 'Développement des habiletés et compétences';
            contenu = genererSectionPerformance(da);
            break;
        case 'mobilisation':
            titre = 'Engagement';
            contenu = genererSectionMobilisationEngagement(da);
            break;
        case 'rapport':
            titre = 'Rapport';
            contenu = genererSectionRapport(da);
            break;
        case 'accompagnement':
            titre = 'Accompagnement';
            contenu = genererSectionAccompagnement(da);
            break;
        default:
            titre = 'Section inconnue';
            contenu = '<p>Section non trouvée</p>';
    }

    // Récupérer les indices (pour autres usages, badge retiré - info déjà dans l'en-tête)
    const indices = calculerTousLesIndices(da);

    // Générer l'aide Primo selon la section (popup au clic)
    let toggleInfo = '';
    if (section === 'cible') {
        toggleInfo = `<span class="primo-aide" data-target="details-calculs-risque-${da}">😎</span>`;
    } else if (section === 'performance') {
        toggleInfo = `<span class="primo-aide" data-target="details-calculs-performance-${da}">😎</span>`;
    } else if (section === 'mobilisation') {
        toggleInfo = `<span class="primo-aide" data-target="details-calculs-mobilisation-${da}">😎</span>`;
    } else if (section === 'accompagnement') {
        toggleInfo = `<span class="primo-aide" data-target="details-calculs-accompagnement-${da}">😎</span>`;
    }

    contenuContainer.innerHTML = `
        <div class="profil-contenu-header">
            <h2 class="u-flex-between-mb20">
                <span>${titre}</span>
                ${toggleInfo}
            </h2>
        </div>
        <div class="profil-contenu-body">
            ${contenu}
        </div>
    `;

    // Réattacher les événements des toggles et Primo après changement de section
    setTimeout(() => {
        if (typeof reattacherEvenementsToggles === 'function') {
            reattacherEvenementsToggles();
        }

        // Réinitialiser les tooltips Primo pour les icônes 😎 dynamiques
        if (typeof initialiserPrimoTooltips === 'function') {
            initialiserPrimoTooltips();
        }

        // Restaurer les préférences du rapport si on vient de charger cette section
        if (section === 'rapport') {
            restaurerPreferencesRapport(da);
        }
    }, 100);

    console.log(`📄 Section "${section}" chargée pour DA ${da}`);
}

/**
 * Calcule la direction du risque (évolution temporelle)
 * Compare le risque sur les N artefacts récents vs les N suivants (fenêtre glissante configurable)
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { symbole: '→'|'←'|'—', interpretation: string }
 */
function calculerDirectionRisque(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Obtenir le nombre de productions configuré pour l'analyse des patterns
    const N = obtenirNombreProductionsPourPatterns() || 3;

    // Filtrer uniquement les artefacts de portfolio évalués pour cet étudiant
    const artefactsPortfolio = productions
        .filter(p => p.type === 'artefact-portfolio')
        .map(p => p.id);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        artefactsPortfolio.includes(e.productionId) &&
        e.noteFinale !== null &&
        e.noteFinale !== undefined
    );

    // Pas assez de données pour calculer la direction du risque (besoin de N+1 minimum)
    if (evaluationsEleve.length < N + 1) {
        return {
            symbole: '',
            interpretation: 'Données insuffisantes'
        };
    }

    // Trier par date (plus récent d'abord)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // Calculer risque récent (N plus récents)
    const artefactsRecents = evaluationsEleve.slice(0, N);
    const performanceRecente = artefactsRecents.reduce((sum, e) => sum + e.noteFinale, 0) / artefactsRecents.length / 100;
    const risqueRecent = 1 - performanceRecente;

    // Calculer risque précédent (N suivants avec chevauchement)
    const artefactsSuivants = evaluationsEleve.slice(1, N + 1);
    const performancePrecedente = artefactsSuivants.reduce((sum, e) => sum + e.noteFinale, 0) / artefactsSuivants.length / 100;
    const risquePrecedent = 1 - performancePrecedente;

    const difference = risqueRecent - risquePrecedent;

    // Déterminer la direction selon le seuil configurable
    const seuilDirection = obtenirSeuil('directionRisque');
    let symbole, interpretation;
    if (difference > seuilDirection) {
        symbole = '→';
        interpretation = 'Le risque augmente';
    } else if (difference < -seuilDirection) {
        symbole = '←';
        interpretation = 'Le risque diminue';
    } else {
        symbole = '—';
        interpretation = 'Risque plateau';
    }

    return {
        symbole,
        interpretation,
        risqueRecent: (risqueRecent * 100).toFixed(1),
        risquePrecedent: (risquePrecedent * 100).toFixed(1),
        difference: (difference * 100).toFixed(1)
    };
}

/**
 * Calcule la direction de chaque critère SRPNF (évolution temporelle)
 * Compare les scores sur les N artefacts récents vs les N suivants (fenêtre glissante configurable)
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { structure: {symbole, interpretation}, rigueur: {...}, ... }
 */
function calculerDirectionsCriteres(da, pratique = 'PAN') {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Obtenir le nombre de productions configuré pour l'analyse des patterns
    const N = obtenirNombreProductionsPourPatterns() || 3;

    // Filtrer les évaluations selon la pratique
    let evaluationsEleve;

    if (pratique === 'SOM') {
        // SOM : TOUTES les évaluations avec rétroaction finale
        evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            e.retroactionFinale
        );
    } else {
        // PAN : Uniquement les artefacts de portfolio évalués
        const artefactsPortfolio = productions
            .filter(p => p.type === 'artefact-portfolio')
            .map(p => p.id);

        evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            artefactsPortfolio.includes(e.productionId) &&
            e.retroactionFinale
        );
    }

    // Résultat par défaut si données insuffisantes
    const resultatParDefaut = {
        symbole: '',
        interpretation: 'Données insuffisantes'
    };

    // Pas assez de données pour calculer la direction (besoin de N+1 minimum)
    if (evaluationsEleve.length < N + 1) {
        return {
            structure: resultatParDefaut,
            rigueur: resultatParDefaut,
            plausibilite: resultatParDefaut,
            nuance: resultatParDefaut,
            francais: resultatParDefaut
        };
    }

    // Trier par date (plus récent d'abord)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // Obtenir la table de conversion IDME
    const tableConversion = obtenirTableConversionIDME();

    // Fonction helper pour extraire les scores d'une liste d'évaluations
    const extraireScoresCriteres = (evaluations) => {
        const scoresCriteres = {
            structure: [],
            rigueur: [],
            plausibilite: [],
            nuance: [],
            francais: []
        };

        const regexCritere = /(STRUCTURE|RIGUEUR|PLAUSIBILIT[ÉE]|NUANCE|FRAN[ÇC]AIS\s+[ÉE]CRIT)\s*\(([IDME])\)/gi;

        evaluations.forEach(evaluation => {
            const retroaction = evaluation.retroactionFinale || '';
            let match;
            while ((match = regexCritere.exec(retroaction)) !== null) {
                const nomCritere = match[1].toUpperCase();
                const niveauIDME = match[2].toUpperCase();
                const score = convertirNiveauIDMEEnScore(niveauIDME, tableConversion);

                if (score !== null) {
                    if (nomCritere === 'STRUCTURE') {
                        scoresCriteres.structure.push(score);
                    } else if (nomCritere === 'RIGUEUR') {
                        scoresCriteres.rigueur.push(score);
                    } else if (nomCritere.startsWith('PLAUSIBILIT')) {
                        scoresCriteres.plausibilite.push(score);
                    } else if (nomCritere === 'NUANCE') {
                        scoresCriteres.nuance.push(score);
                    } else if (nomCritere.startsWith('FRAN')) {
                        scoresCriteres.francais.push(score);
                    }
                }
            }
        });

        return scoresCriteres;
    };

    // Extraire les scores pour les N plus récents
    const artefactsRecents = evaluationsEleve.slice(0, N);
    const scoresRecents = extraireScoresCriteres(artefactsRecents);

    // Extraire les scores pour les N suivants avec chevauchement
    const artefactsSuivants = evaluationsEleve.slice(1, N + 1);
    const scoresSuivants = extraireScoresCriteres(artefactsSuivants);

    // Déterminer le seuil de direction (même seuil que pour le risque)
    const seuilDirection = obtenirSeuil('directionRisque');

    // Calculer la direction pour chaque critère
    const directions = {};
    const criteres = ['structure', 'rigueur', 'plausibilite', 'nuance', 'francais'];

    criteres.forEach(critere => {
        const scoresRec = scoresRecents[critere];
        const scoresSui = scoresSuivants[critere];

        // Vérifier si nous avons assez de données pour ce critère
        if (scoresRec.length === 0 || scoresSui.length === 0) {
            directions[critere] = resultatParDefaut;
            return;
        }

        // Calculer les moyennes
        const moyenneRecente = scoresRec.reduce((sum, s) => sum + s, 0) / scoresRec.length;
        const moyenneSuivante = scoresSui.reduce((sum, s) => sum + s, 0) / scoresSui.length;

        // Calculer la différence (positif = amélioration, négatif = détérioration)
        const difference = moyenneRecente - moyenneSuivante;

        // Déterminer le symbole et l'interprétation
        let symbole, interpretation;
        if (difference > seuilDirection) {
            symbole = '→';
            interpretation = 'En amélioration';
        } else if (difference < -seuilDirection) {
            symbole = '←';
            interpretation = 'En détérioration';
        } else {
            symbole = '—';
            interpretation = 'Plateau';
        }

        directions[critere] = {
            symbole,
            interpretation,
            moyenneRecente: (moyenneRecente * 100).toFixed(1),
            moyenneSuivante: (moyenneSuivante * 100).toFixed(1),
            difference: (difference * 100).toFixed(1)
        };
    });

    return directions;
}

/**
 * Génère l'historique des interventions pour le profil étudiant (Beta 85)
 * @param {string} da - DA de l'étudiant
 * @returns {string} - HTML de l'historique
 */
function genererHistoriqueInterventionsProfil(da) {
    // Vérifier si la fonction obtenirInterventionsEtudiant existe
    if (typeof obtenirInterventionsEtudiant !== 'function') {
        return '';
    }

    const interventions = obtenirInterventionsEtudiant(da);

    if (interventions.length === 0) {
        return '';
    }

    // Trier par date décroissante
    interventions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Compter par niveau
    const parNiveau = {
        2: interventions.filter(i => i.niveauRai === 2).length,
        3: interventions.filter(i => i.niveauRai === 3).length
    };

    let detail = [];
    if (parNiveau[2] > 0) detail.push(`${parNiveau[2]} niveau 2`);
    if (parNiveau[3] > 0) detail.push(`${parNiveau[3]} niveau 3`);

    const totalText = interventions.length === 1 ? '1 intervention' : `${interventions.length} interventions`;
    const detailText = detail.length > 0 ? ` (${detail.join(', ')})` : '';

    // Dernière intervention
    const derniere = interventions[0];
    const dateDerniere = new Date(derniere.date).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });

    return `
        <li><strong>Interventions reçues :</strong> ${totalText}${detailText}
            <span style="display: block; font-size: 0.85rem; color: #666; margin-top: 3px;">
                Dernière : ${derniere.titre} (${dateDerniere})
            </span>
        </li>
    `;
}

/**
 * Génère l'affichage des valeurs SOM/PAN pour le mode comparatif
 * @param {number} valeurSOM - Valeur pour la pratique sommative
 * @param {number} valeurPAN - Valeur pour la pratique PAN
 * @param {boolean} modeComparatif - Mode comparatif actif
 * @returns {string} HTML des valeurs colorées
 */
function genererValeursComparatives(valeurSOM, valeurPAN, modeComparatif, afficherTiret = false) {
    // 🆕 BETA 95.6 : Afficher tiret si aucune donnée
    if (afficherTiret) {
        return `<span style="color: #94a3b8; font-weight: 600;">—</span>`;
    }

    if (!modeComparatif) {
        // Mode normal: afficher seulement la valeur de la pratique active
        const config = db.getSync('modalitesEvaluation', {});
        const pratique = config.pratique || 'sommative';
        const valeur = pratique === 'sommative' ? valeurSOM : valeurPAN;
        return `<strong class="profil-valeur-grande-bleu">${valeur}%</strong>`;
    }

    // Mode comparatif: afficher les deux valeurs côte à côte
    return `
        <div class="profil-flex-gap15-baseline">
            <strong class="profil-valeur-grande-orange">${valeurSOM}%</strong>
            <strong class="profil-valeur-grande-bleu-std">${valeurPAN}%</strong>
        </div>
    `;
}

/**
 * Affiche le profil complet avec layout 2 colonnes
 * Inspiré de la page d'évaluation
 */
function afficherProfilComplet(da) {
    console.log('👤 Affichage du profil pour DA:', da);

    // Sauvegarder le DA pour navigation
    profilActuelDA = da;
    window.profilActuelDA = da;

    // 🆕 BETA 95.6 : Utiliser obtenirEtudiantsCoursActif() pour filtrer par groupe-cours actif
    // Garantit cohérence avec tableau de bord et liste des étudiants
    const tousEtudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : (typeof filtrerEtudiantsParMode === 'function'
            ? filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants'))
            : obtenirDonneesSelonMode('groupeEtudiants').filter(e => e.groupe !== '9999'));
    const etudiants = tousEtudiants.filter(e => e.statut !== 'décrochage' && e.statut !== 'abandon');

    // Trier par nom de famille (ordre alphabétique) pour navigation cohérente
    etudiants.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

    // 🗂️ Cache la liste des étudiants pour la navigation cross-mode
    window.etudiantsListeCache = etudiants;

    const eleve = etudiants.find(e => e.da === da);

    if (!eleve) {
        alert('Élève introuvable');
        return;
    }

    // ✅ NOUVEAU (29 déc 2025): Détecter le mode anonymisation pour masquer les DA
    const modeAnonymisation = typeof estModeeLectureSeule === 'function' && estModeeLectureSeule();

    if (typeof afficherSousSection === 'function') {
        afficherSousSection('tableau-bord-profil');
    }

    const container = document.getElementById('contenuProfilEtudiant');
    if (!container) {
        console.error('❌ Élément #contenuProfilEtudiant introuvable');
        return;
    }

    // 🔄 Forcer le calcul/mise à jour des indices C et P avant affichage
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Calculer tous les indices
    const indices = calculerTousLesIndices(da);
    const A = indices.A / 100;
    const C = indices.C / 100;
    const interpM = interpreterMobilisation(A, C);
    const interpE = interpreterEngagement(indices.E);

    // NOUVEAU (Beta 90): Calcul dual pour mode comparatif
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};

    // ✅ CORRECTION (7 déc 2025): Vérifier explicitement === true pour éviter mode comparatif par défaut
    const afficherSom = affichage.afficherSommatif === true;
    const afficherPan = affichage.afficherAlternatif === true;
    const modeComparatif = afficherSom && afficherPan;

    // Vérifier si le modèle RàI est activé
    const activerRai = config.activerRai !== false; // Par défaut true (rétrocompatibilité)

    // ✅ OPTIMISATION (7 déc 2025): Calculer uniquement la pratique active sauf en mode comparatif
    let indicesSOM, indicesPAN;

    if (modeComparatif) {
        // Mode comparatif: calculer les deux pratiques
        indicesSOM = calculerTousLesIndices(da, 'SOM');
        indicesPAN = calculerTousLesIndices(da, 'PAN');
    } else {
        // Mode normal: calculer seulement la pratique active
        const indicesActifs = calculerTousLesIndices(da);

        // Assigner aux bonnes variables selon la pratique active
        if (config.pratique === 'sommative') {
            indicesSOM = indicesActifs;
            indicesPAN = { A: indicesActifs.A, C: 0, P: 0, M: 0, E: 0 }; // Valeurs nulles pour PAN
        } else {
            indicesPAN = indicesActifs;
            indicesSOM = { A: indicesActifs.A, C: 0, P: 0, M: 0, E: 0 }; // Valeurs nulles pour SOM
        }
    }

    // Trouver l'index de l'élève dans la liste pour navigation
    const indexActuel = etudiants.findIndex(e => e.da === da);
    const etudiantPrecedent = indexActuel > 0 ? etudiants[indexActuel - 1] : null;
    const etudiantSuivant = indexActuel < etudiants.length - 1 ? etudiants[indexActuel + 1] : null;

    // NOUVEAU (Beta 90): Déterminer quelle section afficher (section mémorisée ou 'productions' par défaut)
    const sectionAffichee = sectionProfilActive || 'productions';

    // Déterminer le titre et le contenu selon la section active
    let titreSection = '';
    let contenuSection = '';

    if (sectionAffichee === 'productions') {
        titreSection = 'Productions et évaluations';
        contenuSection = genererSectionProductions(da);
    } else if (sectionAffichee === 'performance') {
        titreSection = 'Développement des habiletés et compétences';
        contenuSection = genererSectionPerformance(da);
    } else if (sectionAffichee === 'mobilisation') {
        titreSection = 'Engagement';
        contenuSection = genererSectionMobilisationEngagement(da);
    } else if (sectionAffichee === 'rapport') {
        titreSection = 'Rapport';
        contenuSection = genererSectionRapport(da);
    } else if (sectionAffichee === 'accompagnement' && activerRai) {
        titreSection = 'Accompagnement';
        contenuSection = genererSectionAccompagnement(da);
    } else if (sectionAffichee === 'accompagnement' && !activerRai) {
        // Si RàI désactivé, rediriger vers productions
        titreSection = 'Productions et évaluations';
        contenuSection = genererSectionProductions(da);
    }

    // Générer le HTML avec layout sidebar matériel
    container.innerHTML = `
        <div class="layout-sidebar-2col">
            <!-- SIDEBAR GAUCHE (navigation) -->
            <div class="sidebar-navigation">
                <!-- Sélecteur d'étudiant -->
                <div class="sidebar-filtre">
                    <label style="font-size: 0.85rem; color: #666; margin-bottom: 5px; display: block;">Étudiant·e :</label>
                    <select id="selecteurEtudiantProfil" class="controle-form" onchange="afficherProfilComplet(this.value)">
                        ${etudiants.map(e => {
                            // ✅ CORRIGÉ (29 déc 2025): Ne pas afficher DA en mode anonymisation
                            const daTexte = modeAnonymisation ? '' : ` (${echapperHtml(e.da)})`;
                            return `
                            <option value="${e.da}" ${e.da === da ? 'selected' : ''}>
                                ${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}${daTexte}
                            </option>
                            `;
                        }).join('')}
                    </select>
                </div>

                <!-- Navigation Précédent/Suivant -->
                <div class="sidebar-nav-buttons">
                    <button class="btn btn-principal"
                            onclick="afficherProfilComplet('${etudiantPrecedent?.da}')"
                            ${!etudiantPrecedent ? 'disabled' : ''}
                            title="Étudiant·e précédent·e">
                        ← Préc.
                    </button>
                    <button class="btn btn-principal"
                            onclick="afficherProfilComplet('${etudiantSuivant?.da}')"
                            ${!etudiantSuivant ? 'disabled' : ''}
                            title="Étudiant·e suivant·e">
                        Suiv. →
                    </button>
                </div>

                <!-- Informations étudiant -->
                <div class="sidebar-info-card">
                    <div class="sidebar-info-card-nom">
                        ${echapperHtml(eleve.prenom)} ${echapperHtml(eleve.nom)}
                    </div>
                    <div class="sidebar-info-card-details">
                        ${modeAnonymisation ? '' : `<div><strong>DA:</strong> ${echapperHtml(eleve.da)}</div>`}
                        ${eleve.groupe ? `<div><strong>Groupe:</strong> ${echapperHtml(eleve.groupe)}</div>` : ''}
                        ${eleve.programme ? `<div><strong>Programme:</strong> ${typeof obtenirNomProgramme === 'function' ? echapperHtml(obtenirNomProgramme(eleve.programme)) : echapperHtml(eleve.programme)}</div>` : ''}
                        ${eleve.sa === 'Oui' ? '<div class="u-texte-bleu">✓ Services adaptés</div>' : ''}
                        ${eleve.caf === 'Oui' ? '<div class="u-texte-bleu">✓ CAF</div>' : ''}
                    </div>
                </div>

                <!-- Navigation sections (utilise les classes matériel) -->
                <div class="sidebar-liste">
                    <div class="sidebar-section-titre">OBSERVATIONS</div>

                    <!-- 1. Productions -->
                    <div class="sidebar-item ${sectionAffichee === 'productions' ? 'active' : ''}" onclick="changerSectionProfil('productions')">
                        <div class="sidebar-item-titre">Productions</div>
                    </div>

                    <!-- 2. Engagement -->
                    <div class="sidebar-item ${sectionAffichee === 'mobilisation' ? 'active' : ''}" onclick="changerSectionProfil('mobilisation')">
                        <div class="sidebar-item-titre">Engagement</div>
                    </div>

                    <!-- 2b. Progression temporelle -->
                    <div class="sidebar-item ${sectionAffichee === 'progression' ? 'active' : ''}" onclick="changerSectionProfil('progression')">
                        <div class="sidebar-item-titre">Progression temporelle</div>
                    </div>

                    <!-- 3. Développement des habiletés -->
                    <div class="sidebar-item ${sectionAffichee === 'performance' ? 'active' : ''}" onclick="changerSectionProfil('performance')">
                        <div class="sidebar-item-titre">Développement des habiletés</div>
                    </div>

                    <!-- 4. Accompagnement (affiché uniquement si RàI activé) -->
                    ${activerRai ? `
                    <div class="sidebar-item ${sectionAffichee === 'accompagnement' ? 'active' : ''}" onclick="changerSectionProfil('accompagnement')">
                        <div class="sidebar-item-titre">Accompagnement</div>
                    </div>
                    ` : ''}

                    <!-- 5. Rapport -->
                    <div class="sidebar-item ${sectionAffichee === 'rapport' ? 'active' : ''}" onclick="changerSectionProfil('rapport')">
                        <div class="sidebar-item-titre">Rapport</div>
                    </div>
                </div>
            </div>

            <!-- ZONE PRINCIPALE (centrale, scroll) -->
            <div class="zone-principale" id="profil-contenu-dynamique">
                <!-- Contenu dynamique chargé par changerSectionProfil() -->
                <div class="profil-contenu-header">
                    <h2 class="u-flex-between-mb20">
                        <span>${titreSection}</span>
                        <span class="primo-aide" data-target="details-calculs-risque-${da}">😎</span>
                    </h2>
                </div>
                <div class="profil-contenu-body">
                    ${contenuSection}
                </div>
            </div>
        </div>
    `;

    // Réattacher les événements des toggles et Primo après insertion du contenu
    setTimeout(() => {
        if (typeof reattacherEvenementsToggles === 'function') {
            reattacherEvenementsToggles();
        }

        // Réinitialiser les tooltips Primo pour les icônes 😎 dynamiques
        if (typeof initialiserPrimoTooltips === 'function') {
            initialiserPrimoTooltips();
        }

        // Restaurer les préférences du rapport si on est sur cette section
        if (sectionAffichee === 'rapport') {
            restaurerPreferencesRapport(da);
        }
    }, 100);

    console.log('✅ Profil affiché (layout 2 colonnes) pour:', eleve.prenom, eleve.nom);
}

/* ===============================
   📁 GESTION DU PORTFOLIO
   =============================== */

/* ⚠️ CODE SUPPRIMÉ - 23 octobre 2025
 *
 * Les fonctions chargerPortfolioDetail() et toggleArtefactPortfolio()
 * étaient dupliquées dans ce fichier.
 *
 * UTILISER DÉSORMAIS les fonctions de portfolio.js:
 * - chargerPortfolioEleveDetail(da)
 * - toggleArtefactPortfolio(da, portfolioId, nombreARetenir)
 *
 * Ces fonctions sont globalement accessibles et gèrent le portfolio étudiant.
 * Les appels HTML (onchange) utilisent automatiquement les fonctions de portfolio.js.
 */

/**
* Génère le HTML de la section assiduité
    * @param { string } da - Numéro de DA
        * @returns { string } - HTML de la section
            */
/**
 * Génère le HTML de la section assiduité avec dates cliquables
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
/**
 * Génère le HTML de la section assiduité avec layout horizontal
 * VERSION SIMPLIFIÉE : absences affichées côte à côte
 * 
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionAssiduite(da) {
    const details = obtenirDetailsAssiduite(da);
    const taux = details.heuresOffertes > 0 
        ? (details.heuresPresentes / details.heuresOffertes * 100).toFixed(1)
        : 0;

    return `
        <!-- STATISTIQUES avec classes CSS natives -->
        <div class="profil-grid-auto-200">
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Heures présentes</span>
                    <strong class="profil-valeur-grande-bleu">${details.heuresPresentes}h</strong>
                </div>
            </div>
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Heures offertes</span>
                    <strong class="profil-valeur-grande-bleu">${details.heuresOffertes}h</strong>
                </div>
            </div>
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Taux d'assiduité</span>
                    <strong class="profil-valeur-grande-bleu">${taux}%</strong>
                </div>
            </div>
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Séances</span>
                    <strong class="profil-valeur-grande-bleu">${details.nombreSeances}</strong>
                </div>
            </div>
        </div>
        
        <!-- LISTE DES ABSENCES -->
        ${details.absences.length > 0 ? `
            <h4 class="profil-titre-bleu-compact">
                Absences et retards
            </h4>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${details.absences.map(abs => {
                    const date = new Date(abs.date + 'T12:00:00');
                    const options = { weekday: 'short', day: 'numeric', month: 'short' };
                    const dateFormatee = date.toLocaleDateString('fr-CA', options);
                    const estAbsenceComplete = abs.heuresPresence === 0;
                    const classeBadge = estAbsenceComplete ? 'badge-absence-complete' : 'badge-absence-partielle';

                    return `
                        <div class="badge-absence ${classeBadge}"
                             onclick="naviguerVersPresenceAvecDate('${abs.date}')">
                            <span class="badge-absence-date">
                                ${dateFormatee}
                            </span>
                            <span class="badge-absence-heures">
                                ${estAbsenceComplete
                                    ? `${abs.heuresManquees}/${abs.heuresPresence + abs.heuresManquees}`
                                    : `${abs.heuresPresence}/${abs.heuresPresence + abs.heuresManquees}`
                                }
                            </span>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : `
            <div class="profil-message-tous-remis">
                Assiduité parfaite !
            </div>
        `}
    `;
}



/**
 * Génère le HTML de la section performance
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
/**
 * Génère la section Productions et évaluations pour un élève
 * Affiche un tableau similaire à celui de la liste des évaluations
 */
function genererSectionProductions(da) {
    // IMPORTANT: Utiliser obtenirDonneesSelonMode pour respecter le mode actif (anonymisation, simulation, normal)
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const productions = obtenirDonneesSelonMode('productions');
    const groupeEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiant = groupeEtudiants.find(e => e.da === da);

    if (!etudiant) {
        return '<p class="u-text-center-gris">Étudiant non trouvé</p>';
    }

    // Productions à évaluer (exclure portfolio lui-même)
    const productionsAEvaluer = productions.filter(p => p.type !== 'portfolio');

    if (productionsAEvaluer.length === 0) {
        return `
            <div class="profil-zone-grande-bleu">
                <p style="color: #666; font-size: 1.1rem;">Aucune production configurée</p>
                <p style="color: #999; margin-top: 10px;">Créez des productions dans la section Matériel → Productions</p>
            </div>
        `;
    }

    // Récupérer les évaluations de l'élève
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);

    // Construire les lignes du tableau
    const lignes = productionsAEvaluer.map((production, index) => {
        // Trouver l'évaluation ACTIVE (non remplacée) pour cette production
        const evaluationsProduction = evaluationsEleve.filter(e => e.productionId === production.id);
        let evaluation = null;
        if (evaluationsProduction.length > 0) {
            // PRIORITÉ 1 : Chercher une reprise ciblée active (jetonRepriseCibleeApplique ET non remplacée)
            evaluation = evaluationsProduction.find(e => e.jetonRepriseCibleeApplique === true && !e.remplaceeParId);

            // PRIORITÉ 2 : Chercher une reprise active (repriseDeId ET non remplacée)
            if (!evaluation) {
                evaluation = evaluationsProduction.find(e => e.repriseDeId && !e.remplaceeParId);
            }

            // PRIORITÉ 3 : Chercher l'évaluation normale non remplacée
            if (!evaluation) {
                evaluation = evaluationsProduction.find(e => !e.remplaceeParId);
            }
        }
        const indexArtefact = index + 1; // A1, A2, A3, etc.

        if (evaluation) {
            // Production évaluée
            // ✅ CORRECTIF (16 déc 2025) : Utiliser dateEcheance de la production, pas dateEvaluation
            // Note: +T12:00:00 évite le décalage de fuseau horaire (UTC vs local)
            const dateEcheance = production.dateEcheance || '';
            const dateFormatee = dateEcheance ? new Date(dateEcheance + 'T12:00:00').toLocaleDateString('fr-CA') : '—';

            // Détecter les jetons appliqués
            const estOriginaleRemplacee = evaluation.remplaceeParId ? true : false;
            const estNouvelleReprise = evaluation.repriseDeId || evaluation.id.startsWith('EVAL_REPRISE_');
            const estRepriseCiblee = evaluation.jetonRepriseCibleeApplique === true;
            const aJetonDelai = evaluation.jetonDelaiApplique && !evaluation.repriseDeId && !evaluation.jetonRepriseCibleeApplique;

            // Déterminer le type de badge
            let badgeType = null;
            if (estOriginaleRemplacee) {
                badgeType = 'remplacee';
            } else if (estRepriseCiblee) {
                badgeType = 'reprise-ciblee';
            } else if (estNouvelleReprise) {
                badgeType = 'nouvelle-reprise';
            } else if (aJetonDelai) {
                badgeType = 'delai';
            }

            // Déterminer le statut final basé sur statutRemise (priorité)
            const statutRemise = evaluation.statutRemise || 'remis';
            const statutIntegrite = evaluation.statutIntegrite || 'recevable';
            const estNonRemis = statutRemise === 'non-remis' || statutRemise === 'retard';
            const estNonRecevable = statutIntegrite === 'plagiat' || statutIntegrite === 'ia';

            return {
                production: production.titre,
                description: production.description || production.titre,
                note: `${evaluation.niveauFinal} ${evaluation.noteFinale}%`,
                date: dateFormatee,
                statut: estNonRemis ? 'non-remis' : 'evalue',
                statutRemise: statutRemise,
                statutIntegrite: statutIntegrite,
                estNonRecevable: estNonRecevable,
                verrouille: evaluation.verrouillee || false,
                evaluationId: evaluation.id,
                productionId: production.id,
                badgeType: badgeType,
                indexArtefact: `A${indexArtefact}`
            };
        } else {
            // Production non remise
            // ✅ CORRECTIF (16 déc 2025) : Afficher dateEcheance même si non évaluée
            // Note: +T12:00:00 évite le décalage de fuseau horaire (UTC vs local)
            const dateEcheance = production.dateEcheance || '';
            const dateFormateeNonEval = dateEcheance ? new Date(dateEcheance + 'T12:00:00').toLocaleDateString('fr-CA') : '—';
            return {
                production: production.titre,
                description: production.description || production.titre,
                note: null,
                date: dateFormateeNonEval,
                statut: 'non-evalue',
                statutRemise: 'non-remis',
                statutIntegrite: 'recevable',
                estNonRecevable: false,
                verrouille: false,
                evaluationId: null,
                productionId: production.id,
                badgeType: null,
                indexArtefact: `A${indexArtefact}`
            };
        }
    });

    // Calculer les détails de la note finale de session
    const detailsNoteFinale = calculerDetailsNoteFinale(da);

    // Générer le HTML de la section Note finale
    let htmlNoteFinale = '';
    if (detailsNoteFinale) {
        const portfolio = detailsNoteFinale.portfolio;
        const terminal = detailsNoteFinale.terminal;

        // Construire la liste des artefacts retenus (format liste verticale)
        let listeArtefacts = '';
        if (portfolio.artefactsRetenus.length > 0) {
            const productionsMap = {};
            productions.forEach(p => { productionsMap[p.id] = p; });

            listeArtefacts = '<ul class="note-finale-liste-artefacts">' +
                portfolio.artefactsRetenus.map((art, i) => {
                    const prod = productionsMap[art.productionId];
                    const titre = prod?.description || prod?.titre || `Artefact ${i + 1}`;
                    return `<li>${titre} <strong>${art.niveau} ${art.note.toFixed(1)}%</strong></li>`;
                }).join('') +
                '</ul>';
        }

        htmlNoteFinale = `
        <!-- Note finale de session -->
        <div class="note-finale-section">
            <h3 class="note-finale-titre">
                Note finale de session
                ${detailsNoteFinale.estProvisoire ? '<span class="note-finale-badge-provisoire">(provisoire)</span>' : ''}
            </h3>

            ${portfolio.plafonnement ? `
                <div class="alerte alerte-attention" style="margin-bottom: 15px;">
                    ${portfolio.plafonnement.echec
                        ? `<strong>Échec automatique :</strong> L'élève n'a remis que ${portfolio.nombreEvalues} production${portfolio.nombreEvalues > 1 ? 's' : ''} sur les ${portfolio.minimumRequis} requises. Selon les règles de conformité, un déficit de ${portfolio.plafonnement.deficit} production${portfolio.plafonnement.deficit > 1 ? 's' : ''} ou plus entraîne un échec automatique.`
                        : `<strong>Note plafonnée :</strong> L'élève n'a remis que ${portfolio.nombreEvalues} production${portfolio.nombreEvalues > 1 ? 's' : ''} sur les ${portfolio.minimumRequis} requises. Selon les règles de conformité, un déficit de ${portfolio.plafonnement.deficit} production${portfolio.plafonnement.deficit > 1 ? 's' : ''} plafonne la note du portfolio au niveau ${portfolio.plafonnement.niveauCode} (maximum ${portfolio.plafonnement.seuilMax}%).`
                    }
                </div>
            ` : ''}

            <div class="note-finale-grid">
                <!-- Portfolio -->
                <div class="note-finale-composante ${portfolio.plafonnement ? 'note-finale-composante-plafonnee' : ''}">
                    <div class="note-finale-composante-titre">
                        Portfolio (${portfolio.nombreRetenus} ${portfolio.methodeSelection} artefacts sur ${portfolio.nombreEvalues} évalués)
                    </div>
                    <div class="note-finale-artefacts">
                        ${listeArtefacts || '<span class="note-finale-non-evalue">Aucun artefact retenu</span>'}
                    </div>
                    ${portfolio.plafonnement ? `
                        <div class="note-finale-valeur-ligne">
                            <span class="note-finale-valeur">
                                <span class="note-finale-valeur-originale">${portfolio.plafonnement.moyenneOriginale.toFixed(1)}%</span>
                                → ${portfolio.moyenne !== null ? portfolio.moyenne.toFixed(1) + '%' : '0%'}
                            </span>
                            <span class="note-finale-ponderation">× ${portfolio.ponderationNormalisee}%</span>
                        </div>
                    ` : `
                        <div class="note-finale-valeur-ligne">
                            <span class="note-finale-valeur">
                                ${portfolio.moyenne !== null ? portfolio.moyenne.toFixed(1) + '%' : '<span class="note-finale-tiret">—</span>'}
                            </span>
                            <span class="note-finale-ponderation">× ${portfolio.ponderationNormalisee}%</span>
                        </div>
                    `}
                </div>

                <!-- Évaluation terminale -->
                <div class="note-finale-composante">
                    <div class="note-finale-composante-titre">${terminal.nom}</div>
                    <div class="note-finale-artefacts">
                        ${terminal.niveau ? `Niveau atteint : <strong>${terminal.niveau}</strong>` : '<span class="note-finale-non-evalue">Non évaluée</span>'}
                    </div>
                    <div class="note-finale-valeur-ligne">
                        <span class="note-finale-valeur ${terminal.note === null ? 'note-finale-tiret' : ''}">
                            ${terminal.note !== null ? terminal.note.toFixed(1) + '%' : '—'}
                        </span>
                        <span class="note-finale-ponderation">× ${terminal.ponderationNormalisee}%</span>
                    </div>
                </div>
            </div>

            <!-- Note finale agrégée -->
            <div class="note-finale-resultat">
                <div class="note-finale-formule">
                    Note finale pondérée (${portfolio.ponderationNormalisee}% + ${terminal.ponderationNormalisee}% = 100%)
                </div>
                <div class="note-finale-total ${detailsNoteFinale.noteFinale === null ? 'note-finale-tiret' : ''}">
                    ${detailsNoteFinale.noteFinale !== null ? detailsNoteFinale.noteFinale.toFixed(1) + '%' : '—'}
                </div>
                ${detailsNoteFinale.estProvisoire ? '<div class="note-finale-message-provisoire">Basée uniquement sur le portfolio (évaluation terminale non complétée)</div>' : ''}
            </div>
        </div>
        `;
    }

    // Générer le HTML (productions d'abord, puis note finale)
    return `
        <!-- Tableau des productions -->
        <div class="profil-carte">
            <h3 style="color: var(--bleu-principal); margin: 0 0 15px 0;">Liste des productions</h3>
            <div style="overflow-x: auto;">
                <table class="tableau">
                    <thead>
                        <tr>
                            <th>Production</th>
                            <th>Description</th>
                            <th>Jeton</th>
                            <th style="text-align: center;">Note</th>
                            <th style="text-align: center;">Date</th>
                            <th style="text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lignes.map(ligne => {
                            // Générer le badge jeton si applicable
                            let badgeJeton = '';
                            if (ligne.badgeType === 'remplacee') {
                                badgeJeton = '<span class="badge-jeton-reprise-wrapper"><span class="badge-jeton-titre">Remplacée</span><span class="badge-jeton-numero badge-jeton-numero-reprise">' + ligne.indexArtefact + '</span></span>';
                            } else if (ligne.badgeType === 'reprise-ciblee') {
                                badgeJeton = '<span class="badge-jeton-reprise-ciblee-wrapper"><span class="badge-jeton-titre">Reprise ciblée</span><span class="badge-jeton-numero badge-jeton-numero-reprise-ciblee">' + ligne.indexArtefact + '</span></span>';
                            } else if (ligne.badgeType === 'nouvelle-reprise') {
                                badgeJeton = '<span class="badge-jeton-reprise-wrapper"><span class="badge-jeton-titre">Reprise</span><span class="badge-jeton-numero badge-jeton-numero-reprise">' + ligne.indexArtefact + '</span></span>';
                            } else if (ligne.badgeType === 'delai') {
                                badgeJeton = '<span class="badge-jeton-delai-wrapper"><span class="badge-jeton-titre">Délai</span><span class="badge-jeton-numero badge-jeton-numero-delai">' + ligne.indexArtefact + '</span></span>';
                            }

                            return `
                            <tr style="border-bottom: 1px solid #e0e0e0;">
                                <td class="profil-tableau-cellule-p12">
                                    ${echapperHtml(ligne.production)}
                                </td>
                                <td style="padding: 12px; color: #666;">${echapperHtml(ligne.description)}</td>
                                <td class="profil-tableau-cellule-p12">
                                    ${badgeJeton}
                                </td>
                                <td style="padding: 12px; text-align: center;">
                                    ${(ligne.statutRemise === 'non-remis' || ligne.statutRemise === 'retard')
                                        ? '<span class="badge-non-remis-wrapper"><span class="badge-jeton-titre">Non remis</span></span>'
                                        : (ligne.estNonRecevable
                                            ? `<span class="badge-non-recevable-wrapper" title="${ligne.statutIntegrite === 'plagiat' ? 'Plagiat détecté' : 'Utilisation IA non autorisée'}"><span class="badge-jeton-titre">Non recevable</span></span>`
                                            : (ligne.statut === 'evalue'
                                                ? `<strong>${ligne.note}</strong>`
                                                : '<span class="badge-non-remis-wrapper"><span class="badge-jeton-titre">Non remis</span></span>'))
                                    }
                                </td>
                                <td style="padding: 12px; text-align: center; color: #666;">${ligne.date}</td>
                                <td style="padding: 12px; text-align: center; white-space: nowrap;">
                                    ${(ligne.statutRemise === 'non-remis' || ligne.statutRemise === 'retard')
                                        ? `
                                        <button class="btn btn-principal btn-compact"
                                                onclick="evaluerProduction('${da}', '${ligne.productionId}')">
                                            Évaluer
                                        </button>
                                        `
                                        : (ligne.statut === 'evalue'
                                            ? `
                                            <button class="btn btn-secondaire btn-compact"
                                                    onclick="consulterEvaluation('${da}', '${ligne.productionId}')">
                                                Consulter
                                            </button>
                                            `
                                            : `
                                            <button class="btn btn-principal btn-compact"
                                                    onclick="evaluerProduction('${da}', '${ligne.productionId}')">
                                                Évaluer
                                            </button>
                                            `)
                                    }
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ${htmlNoteFinale}
    `;
}

/**
 * Génère le tableau des objectifs d'apprentissage avec leurs performances
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string} ensembleId - ID de l'ensemble d'objectifs
 * @param {Object} noteFinaleMultiObjectifs - Résultats du calcul par pratique multi-objectifs
 * @returns {string} - HTML du tableau
 */
function genererTableauObjectifs(da, ensembleId, noteFinaleMultiObjectifs) {
    // Charger l'ensemble d'objectifs
    const ensembles = chargerEnsemblesObjectifs();
    const ensemble = ensembles.find(e => e.id === ensembleId);

    if (!ensemble) {
        return '<p style="color: #999;">Ensemble d\'objectifs introuvable</p>';
    }

    const performances = noteFinaleMultiObjectifs.performances || {};
    const noteFinale = noteFinaleMultiObjectifs.noteFinale || 0;

    // Calculer forces et défis
    const seuil = obtenirSeuil('defiSpecifique') || 0.75;
    let forces = [];
    let defis = [];

    ensemble.objectifs.forEach(obj => {
        const perf = performances[obj.id];
        if (perf && perf.P !== null && perf.P >= seuil * 100) {
            forces.push({ ...obj, P: perf.P });
        } else if (perf && perf.P !== null && perf.P < seuil * 100) {
            defis.push({ ...obj, P: perf.P });
        }
    });

    // Couleurs par type
    const couleurType = {
        'fondamental': '#2196F3',      // Bleu
        'integrateur': '#FF9800',      // Orange
        'transversal': '#9C27B0'       // Violet
    };

    return `
        <!-- Note finale pratique multi-objectifs -->
        <div style="background: white; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">
                Note finale pondérée (${noteFinaleMultiObjectifs.nbObjectifsEvalues}/${ensemble.objectifs.length} objectifs évalués)
            </div>
            <div style="font-size: 3rem; font-weight: bold; color: ${obtenirCouleurIndice(noteFinale)};">
                ${noteFinale.toFixed(1)}/100
            </div>
            <div style="font-size: 0.85rem; color: #999; margin-top: 5px;">
                Σ(P_objectif × poids) / 100
            </div>
        </div>

        <!-- Résumé forces et défis -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background: #e8f5e9; padding: 15px; border-radius: 6px; border-left: 4px solid #4caf50;">
                <div style="font-weight: bold; color: #2e7d32; margin-bottom: 5px;">✅ Forces (≥ ${(seuil * 100).toFixed(0)}%)</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #2e7d32;">${forces.length}</div>
                ${forces.length > 0 ? `<div style="font-size: 0.85rem; color: #666; margin-top: 5px;">${forces.map(f => f.nom).join(', ')}</div>` : ''}
            </div>
            <div style="background: #fff3e0; padding: 15px; border-radius: 6px; border-left: 4px solid #ff9800;">
                <div style="font-weight: bold; color: #e65100; margin-bottom: 5px;">⚠️ Défis (< ${(seuil * 100).toFixed(0)}%)</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #e65100;">${defis.length}</div>
                ${defis.length > 0 ? `<div style="font-size: 0.85rem; color: #666; margin-top: 5px;">${defis.map(d => d.nom).join(', ')}</div>` : ''}
            </div>
        </div>

        <!-- Tableau détaillé des objectifs -->
        <h4 class="profil-section-titre-large" style="margin-bottom: 15px;">
            🎯 Détail des ${ensemble.objectifs.length} objectifs d'apprentissage
        </h4>

        <div style="background: white; border-radius: 6px; overflow: hidden;">
            <table class="tableau-objectifs-profil">
                <thead>
                    <tr>
                        <th style="text-align: left; width: 40%;">Objectif</th>
                        <th style="text-align: center; width: 15%;">Type</th>
                        <th style="text-align: center; width: 10%;">Poids</th>
                        <th style="text-align: center; width: 15%;">Performance</th>
                        <th style="text-align: center; width: 10%;">Niveau</th>
                        <th style="text-align: center; width: 10%;">Statut</th>
                    </tr>
                </thead>
                <tbody>
                    ${ensemble.objectifs.map(obj => {
                        const perf = performances[obj.id];
                        const P = perf?.P ?? null;
                        const nbArtefacts = perf?.nbArtefacts ?? 0;

                        let niveau = '--';
                        let couleurNiveau = '#999';
                        let statut = '⏸️';
                        let couleurStatut = '#999';
                        let labelStatut = 'Non évalué';

                        if (P !== null) {
                            // Convertir en niveau IDME
                            niveau = obtenirNiveauIDMEDepuisPourcentage(P);
                            couleurNiveau = obtenirCouleurNiveauIDME(niveau);

                            // Déterminer statut
                            if (P >= seuil * 100) {
                                statut = '✅';
                                couleurStatut = '#4caf50';
                                labelStatut = 'Force';
                            } else {
                                statut = '⚠️';
                                couleurStatut = '#ff9800';
                                labelStatut = 'Défi';
                            }
                        }

                        const couleurBordure = couleurType[obj.type] || '#999';

                        return `
                            <tr style="border-left: 4px solid ${couleurBordure};">
                                <td style="padding: 12px;">
                                    <div style="font-weight: bold; margin-bottom: 3px;">${echapperHtml(obj.nom)}</div>
                                    ${nbArtefacts > 0 ? `<div style="font-size: 0.85rem; color: #666;">${nbArtefacts} artefact${nbArtefacts > 1 ? 's' : ''}</div>` : ''}
                                </td>
                                <td style="text-align: center; padding: 12px;">
                                    <span style="
                                        display: inline-block;
                                        padding: 4px 10px;
                                        border-radius: 4px;
                                        font-size: 0.85rem;
                                        font-weight: bold;
                                        background: ${couleurBordure}22;
                                        color: ${couleurBordure};
                                        border: 1px solid ${couleurBordure}66;
                                    ">
                                        ${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}
                                    </span>
                                </td>
                                <td style="text-align: center; padding: 12px; font-weight: bold; font-size: 1.1rem;">
                                    ${obj.poids}%
                                </td>
                                <td style="text-align: center; padding: 12px;">
                                    ${P !== null ? `
                                        <div style="font-size: 1.3rem; font-weight: bold; color: ${obtenirCouleurIndice(P)};">
                                            ${P.toFixed(1)}%
                                        </div>
                                    ` : `<span style="color: #999;">--</span>`}
                                </td>
                                <td style="text-align: center; padding: 12px;">
                                    <!-- BETA 96.1: Bulle avec effet 3D -->
                                    <span class="bulle-niveau-tableau">
                                        ${niveau}
                                    </span>
                                </td>
                                <td style="text-align: center; padding: 12px;">
                                    <div style="font-size: 1.5rem;">${statut}</div>
                                    <div style="font-size: 0.75rem; color: ${couleurStatut}; font-weight: bold;">
                                        ${labelStatut}
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <!-- Légende -->
        <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px; font-size: 0.85rem; color: #666;">
            <div style="margin-bottom: 10px;"><strong>Légende types :</strong></div>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                <div><span style="color: ${couleurType.fondamental}; font-weight: bold;">●</span> Fondamental : Concepts de base</div>
                <div><span style="color: ${couleurType.integrateur}; font-weight: bold;">●</span> Intégrateur : Compétences complexes</div>
                <div><span style="color: ${couleurType.transversal}; font-weight: bold;">●</span> Transversal : Habiletés générales</div>
            </div>
            <div style="margin-top: 10px;">
                <strong>Formule :</strong> Note finale = Σ(Performance_objectif × Poids) / 100
            </div>
        </div>
    `;
}

/**
 * Génère la section Progression temporelle avec graphiques Chart.js
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {string} HTML de la section
 */
function genererSectionProgression(da) {
    // Vérifier si le module de captures existe
    if (typeof obtenirSnapshotsEtudiant !== 'function') {
        return `
            <div class="profil-zone-moyenne-bleu">
                <p style="color: #666; font-size: 0.95rem;">
                    Le module de captures n'est pas encore initialisé.
                </p>
                <p style="color: #999; margin-top: 10px; font-size: 0.85rem;">
                    Les graphiques de progression seront disponibles une fois que des données auront été collectées.
                </p>
            </div>
        `;
    }

    // Récupérer les captures de l'étudiant
    const snapshots = obtenirSnapshotsEtudiant(da);

    // Vérifier s'il y a des données
    if (!snapshots || snapshots.length === 0) {
        return `
            <div class="profil-zone-moyenne-bleu">
                <h4 class="profil-section-titre-large" style="margin-bottom: 15px;">
                    📊 Aucune donnée de progression disponible
                </h4>
                <p style="color: #666; font-size: 0.95rem; margin-bottom: 10px;">
                    Les graphiques de progression afficheront l'évolution temporelle des indices A-C-P-E une fois que des données auront été collectées.
                </p>
                <p style="color: #999; font-size: 0.85rem;">
                    Les captures sont enregistrées automatiquement chaque semaine et lors d'interventions RàI complétées.
                </p>
            </div>
        `;
    }

    // Générer un ID unique pour le canvas
    const canvasId = `graphique-progression-${da}`;

    // ✨ AMÉLIORATION (8 déc 2025) : Lire dynamiquement l'échelle de performance configurée
    const echelles = db.getSync('echellesTemplates', []);
    const echelleActive = echelles.find(e => e.active) || echelles[0];

    let texteZones = 'Zones colorées basées sur l\'échelle IDME par défaut';
    if (echelleActive && echelleActive.niveaux && echelleActive.niveaux.length > 0) {
        texteZones = echelleActive.niveaux.map(niveau => {
            const nom = niveau.nom;
            const min = niveau.min;
            const max = niveau.max;

            if (min === 0) {
                return `${nom} < ${max}%`;
            } else if (max === 100) {
                return `${nom} ≥ ${min}%`;
            } else {
                return `${nom} ${min}-${max}%`;
            }
        }).join(', ');
    }

    // Créer le HTML avec le canvas
    const html = `
        <div class="profil-zone-moyenne-bleu">
            <!-- Légende des indices -->
            <div style="background: white; padding: 12px 20px; border-radius: 6px; margin-bottom: 10px; display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                <span style="font-weight: 600; color: #333;">Indices :</span>
                <span style="display: flex; align-items: center; gap: 6px;">
                    <span style="width: 12px; height: 12px; background: #1976D2; border-radius: 50%;"></span>
                    <span style="color: #1976D2; font-weight: 500;">Assiduité (A)</span>
                </span>
                <span style="display: flex; align-items: center; gap: 6px;">
                    <span style="width: 12px; height: 12px; background: #FF6B35; border-radius: 50%;"></span>
                    <span style="color: #FF6B35; font-weight: 500;">Complétion (C)</span>
                </span>
                <span style="display: flex; align-items: center; gap: 6px;">
                    <span style="width: 12px; height: 12px; background: #4CAF50; border-radius: 50%;"></span>
                    <span style="color: #4CAF50; font-weight: 500;">Performance (P)</span>
                </span>
                <span style="color: #888; font-size: 0.85rem; margin-left: auto;">Survolez une courbe pour l'identifier</span>
            </div>

            <!-- Canvas pour le graphique Chart.js -->
            <div style="background: white; padding: 20px; border-radius: 6px; height: 450px;">
                <canvas id="${canvasId}"></canvas>
            </div>

            <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px; font-size: 0.85rem; color: #666;">
                <strong>Zones colorées :</strong> ${texteZones}
            </div>
        </div>
    `;

    // Utiliser setTimeout pour créer le graphique après l'insertion du DOM
    setTimeout(() => {
        if (typeof creerGraphiqueIndividuel === 'function') {
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                creerGraphiqueIndividuel(canvasId, da);
            }
        }
    }, 100);

    return html;
}

function genererSectionPerformance(da) {
    // ✨ NOUVEAU (7 déc 2025) : Graphique d'évolution des critères
    const canvasIdCriteres = `graphique-criteres-${da}`;
    let graphiqueCriteres = '';

    // 🐛 DEBUG (8 déc 2025) : Tracer exécution
    console.log(`[DEBUG Graphique Critères] DA: ${da}`);
    console.log(`[DEBUG Graphique Critères] Fonction creerGraphiqueCriteres existe: ${typeof creerGraphiqueCriteres === 'function'}`);

    // Vérifier si l'étudiant a des évaluations avec détails critères
    if (typeof creerGraphiqueCriteres === 'function') {
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        console.log(`[DEBUG Graphique Critères] Total évaluations: ${evaluations.length}`);

        const evaluationsAvecCriteres = evaluations.filter(e =>
            e.etudiantDA === da &&
            e.criteres &&
            Array.isArray(e.criteres) &&
            e.criteres.length > 0
        );
        console.log(`[DEBUG Graphique Critères] Évaluations avec critères: ${evaluationsAvecCriteres.length}`);

        if (evaluationsAvecCriteres.length > 0) {
            console.log(`[DEBUG Graphique Critères] Première évaluation critères:`, evaluationsAvecCriteres[0].criteres);

            // Extraire les critères uniques pour la légende
            const criteresSet = new Set();
            evaluationsAvecCriteres.forEach(e => {
                e.criteres.forEach(c => {
                    if (c.critereNom) criteresSet.add(c.critereNom);
                });
            });
            const criteresUniques = Array.from(criteresSet).sort();

            // Palette de couleurs (même que dans creerGraphiqueCriteres)
            const COULEURS_CRITERES = [
                '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4',
                '#4CAF50', '#FF9800', '#795548', '#607D8B'
            ];

            // Générer la légende HTML
            const legendeHTML = criteresUniques.map((critere, index) => {
                const couleur = COULEURS_CRITERES[index % COULEURS_CRITERES.length];
                return `<span style="display: flex; align-items: center; gap: 6px;">
                    <span style="width: 12px; height: 12px; background: ${couleur}; border-radius: 50%;"></span>
                    <span style="color: ${couleur}; font-weight: 500;">${critere}</span>
                </span>`;
            }).join('');

            graphiqueCriteres = `
                <div class="profil-zone-moyenne-bleu" style="margin-bottom: 20px;">
                    <!-- Légende des critères -->
                    <div style="background: white; padding: 12px 20px; border-radius: 6px; margin-bottom: 10px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                        <span style="font-weight: 600; color: #333;">Critères :</span>
                        ${legendeHTML}
                        <span style="color: #888; font-size: 0.85rem; margin-left: auto;">Survolez une courbe pour l'identifier</span>
                    </div>

                    <!-- Canvas pour le graphique Chart.js -->
                    <div style="background: white; padding: 20px; border-radius: 6px; height: 450px;">
                        <canvas id="${canvasIdCriteres}"></canvas>
                    </div>
                </div>
            `;

            // Utiliser setTimeout pour créer le graphique après l'insertion du DOM
            setTimeout(() => {
                const canvas = document.getElementById(canvasIdCriteres);
                if (canvas) {
                    creerGraphiqueCriteres(canvasIdCriteres, da);
                }
            }, 100);
        }
    }

    // 🎯 DÉTECTION PRATIQUE MULTI-OBJECTIFS
    const statusPratiqueMultiObjectifs = verifierPratiqueMultiObjectifs();

    if (statusPratiqueMultiObjectifs.actif && typeof calculerNoteFinaleMultiObjectifs === 'function') {
        // Pratique multi-objectifs : afficher le tableau des objectifs
        const noteFinale = calculerNoteFinaleMultiObjectifs(da, statusPratiqueMultiObjectifs.ensembleId);

        if (noteFinale && noteFinale.noteFinale !== null) {
            return `
                ${graphiqueCriteres}
                <div style="padding: 15px; background: var(--bleu-tres-pale); border-radius: 6px;">
                    ${genererTableauObjectifs(da, statusPratiqueMultiObjectifs.ensembleId, noteFinale)}
                </div>
            `;
        } else {
            return `
                ${graphiqueCriteres}
                <div class="profil-zone-moyenne-bleu">
                    <p style="color: #666;">Pratique multi-objectifs activée avec l'ensemble «${echapperHtml(statusPratiqueMultiObjectifs.ensemble.nom)}»</p>
                    <p style="color: #999; margin-top: 10px;">Aucune évaluation disponible pour le moment</p>
                </div>
            `;
        }
    }

    // Pratique PAN classique : afficher les meilleurs artefacts
    const meilleures = obtenirDetailsPerformance(da);

    if (meilleures.length === 0) {
        return `
            ${graphiqueCriteres}
            <div class="profil-zone-moyenne-bleu">
                <p style="color: #666;">Aucune évaluation disponible pour le moment</p>
            </div>
        `;
    }

    const moyenne = meilleures.reduce((sum, m) => sum + m.note, 0) / meilleures.length;

    return `
        ${graphiqueCriteres}
        <div style="padding: 15px; background: var(--bleu-tres-pale); border-radius: 6px;">
            <div style="background: white; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">
                    Moyenne PAN (${meilleures.length} meilleur${meilleures.length > 1 ? 's' : ''} artefact${meilleures.length > 1 ? 's' : ''})
                </div>
                <div style="font-size: 3rem; font-weight: bold; color: ${obtenirCouleurIndice(moyenne)};">
                    ${moyenne.toFixed(1)}/100
                </div>
            </div>

            <h4 class="profil-section-titre-large">
                🏆 Les ${meilleures.length} meilleur${meilleures.length > 1 ? 's' : ''} artefact${meilleures.length > 1 ? 's' : ''}
            </h4>

            ${meilleures.map((art, index) => `
                <div style="background: white; padding: 15px; margin-bottom: 10px; border-left: 4px solid ${obtenirCouleurIndice(art.note)};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">
                                #${index + 1} · ${echapperHtml(art.description)}
                            </div>
                            <div class="profil-texte-detail-compact">
                                Évalué le ${formaterDate(art.dateEvaluation)}
                            </div>
                        </div>
                        <div class="u-text-right">
                            <div style="font-size: 1.8rem; font-weight: bold; color: ${obtenirCouleurIndice(art.note)};">
                                ${art.note}/100
                            </div>
                            <div style="font-size: 0.9rem; color: var(--bleu-moyen); font-weight: bold;">
                                ${art.niveau}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}

            <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px; font-size: 0.9rem; color: #666;">
                <strong>Principe PAN :</strong> La note finale est calculée sur la moyenne des 3 meilleurs ${obtenirTermeProduction('pluriel')}
                plutôt que sur la moyenne de tous les artefacts.
            </div>
        </div>
    `;
}

/**
 * Variable globale pour suivre quel indice est actuellement affiché
 */
let indiceActif = null;

/**
 * Toggle l'affichage des détails d'un indice avec lien visuel + grisage des autres cartes
 * MODIFIÉ : Le case 'P' affiche maintenant le portfolio complet
 */
/**
 * Toggle l'affichage des détails d'un indice
 * MODIFIÉ : Case 'C' supprimé, case 'P' affiche portfolio avec stats C et P
 */
function toggleDetailIndice(indice, da) {
    const panneau = document.getElementById('panneau-details-indice');
    const contenu = document.getElementById('contenu-detail-indice');

    if (!panneau || !contenu) {
        console.error('❌ Éléments du panneau de détails introuvables');
        return;
    }

    // Si on clique sur le même indice, fermer
    if (indiceActif === indice && panneau.style.display === 'block') {
        fermerDetailIndice();
        return;
    }

    // Mettre à jour l'indice actif
    indiceActif = indice;

    // GRISER toutes les cartes sauf celle active
    const toutesLesCartes = ['A', 'C', 'P', 'M', 'E', 'R'];
    toutesLesCartes.forEach(ind => {
        const carte = document.getElementById(`carte-indice-${ind}`);
        if (carte) {
            if (ind === indice) {
                carte.style.opacity = '1';
                carte.style.filter = 'none';
            } else {
                carte.style.opacity = '0.4';
                carte.style.filter = 'grayscale(50%)';
            }
        }
    });

    // Récupérer la couleur de la carte cliquée
    const carteCliquee = document.getElementById(`carte-indice-${indice}`);
    let couleurBordure = 'var(--bleu-principal)';
    if (carteCliquee) {
        const style = window.getComputedStyle(carteCliquee);
        couleurBordure = style.borderColor;
    }

    // Appliquer la couleur de bordure au panneau
    panneau.style.borderTopColor = couleurBordure;
    panneau.style.borderTopWidth = '4px';

    // Générer le contenu selon l'indice
    let html = '';
    switch (indice) {
        case 'A':
            html = `
                <h3 class="profil-titre-bleu-large-pr40">
                    Assiduité détaillée
                </h3>
                ${genererSectionAssiduite(da)}
            `;
            break;
        case 'C':
            html = `
                <h3 class="profil-titre-bleu-large-pr40">
                    ✅ Complétion détaillée
                </h3>
                ${genererSectionCompletion(da)}
            `;
            break;
        case 'P':
            html = `
                ${genererSectionPerformance(da)}
            `;
            break;
        case 'M':
            html = `
                <h3 class="profil-titre-bleu-large-pr40">
                    🎯 Mobilisation détaillée
                </h3>
                ${genererSectionMobilisation(da)}
            `;
            break;
        case 'E':
            html = `
                <h3 class="profil-titre-bleu-large-pr40">
                    ⚡ Engagement détaillé
                </h3>
                ${genererSectionEngagement(da)}
            `;
            break;
        case 'R':
            html = `
                <h3 class="profil-titre-bleu-large-pr40">
                    ⚡ Engagement détaillé
                </h3>
                ${genererSectionRisque(da)}
            `;
            break;
    }

    contenu.innerHTML = html;
    panneau.style.display = 'block';

    // Scroll smooth vers le panneau
    setTimeout(() => {
        panneau.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

/**
 * Ferme le panneau de détails
 * MODIFIÉ : Liste des cartes mise à jour sans C
 */
function fermerDetailIndice() {
    const panneau = document.getElementById('panneau-details-indice');
    if (panneau) {
        panneau.style.display = 'none';
        indiceActif = null;
    }

    // RETIRER le grisage de toutes les cartes (liste mise à jour)
    const toutesLesCartes = ['A', 'P', 'M', 'E', 'R'];
    toutesLesCartes.forEach(ind => {
        const carte = document.getElementById(`carte-indice-${ind}`);
        if (carte) {
            carte.style.opacity = '1';
            carte.style.filter = 'none';
        }
    });
}


/**
 * Génère le HTML de la section Complétion détaillée
 *
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionCompletion(da) {
    const productions = obtenirDonneesSelonMode('productions') || [];
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');

    // Identifier les artefacts-portfolio réellement donnés
    const artefactsPortfolioIds = new Set(artefactsPortfolio.map(a => a.id));
    const artefactsDonnes = [];

    evaluations.forEach(evaluation => {
        if (artefactsPortfolioIds.has(evaluation.productionId)) {
            if (!artefactsDonnes.find(a => a.id === evaluation.productionId)) {
                const production = artefactsPortfolio.find(p => p.id === evaluation.productionId);
                if (production) {
                    artefactsDonnes.push(production);
                }
            }
        }
    });

    // Récupérer les évaluations de l'élève
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);

    // Construire la liste des artefacts avec leur statut
    const artefacts = artefactsDonnes.map(art => {
        // Trouver l'évaluation ACTIVE (non remplacée) pour cette production
        const evaluationsProduction = evaluationsEleve.filter(e => e.productionId === art.id);
        let evaluation = null;
        if (evaluationsProduction.length > 0) {
            // PRIORITÉ 1 : Chercher une reprise active (repriseDeId ET non remplacée)
            evaluation = evaluationsProduction.find(e => e.repriseDeId && !e.remplaceeParId);

            // PRIORITÉ 2 : Si pas de reprise, chercher une évaluation avec jeton de délai actif
            if (!evaluation) {
                evaluation = evaluationsProduction.find(e => e.jetonDelaiApplique && !e.remplaceeParId);
            }

            // PRIORITÉ 3 : Si pas de jeton, chercher toute évaluation active (non remplacée)
            if (!evaluation) {
                evaluation = evaluationsProduction.find(e => !e.remplaceeParId);
            }

            // PRIORITÉ 4 : Si toutes sont remplacées, prendre la première (cas rare)
            if (!evaluation) {
                evaluation = evaluationsProduction[0];
            }
        }

        return {
            id: art.id,
            titre: art.titre,
            description: art.description || art.titre, // Utiliser description ou fallback sur titre
            remis: !!evaluation,
            note: evaluation?.noteFinale ?? null,  // Utiliser ?? pour supporter la note 0
            niveau: evaluation?.niveauFinal ?? null,
            jetonReprise: evaluation?.repriseDeId ? true : false,
            jetonDelai: evaluation?.jetonDelaiApplique ? true : false
        };
    }).sort((a, b) => {
        if (a.remis && !b.remis) return -1;
        if (!a.remis && b.remis) return 1;
        return (a.description || a.titre).localeCompare(b.description || b.titre);
    });

    const nbTotal = artefacts.length;
    const nbRemis = artefacts.filter(a => a.remis).length;
    const indices = calculerTousLesIndices(da);

    // Interprétation de la complétion
    const interpC = interpreterCompletion(indices.C);

    // Séparer artefacts remis et non remis
    const artefactsRemis = artefacts.filter(a => a.remis);
    const artefactsNonRemis = artefacts.filter(a => !a.remis);

    return `
        <!-- ENCADRÉ UNIQUE: COMPLÉTION -->
        <div class="profil-carte-bordure-blanche">

            <h3 class="profil-titre-section-majeur">
                📝 COMPLÉTION
            </h3>

            <!-- Badge avec interprétation -->
            <div class="u-mb-15">
                <span class="profil-valeur-moyenne">${interpC.emoji}</span>
                <strong style="font-size: 1.1rem; color: ${interpC.couleur};">${interpC.niveau}</strong>
                <span style="font-size: 1.3rem; font-weight: bold; color: ${interpC.couleur}; margin-left: 10px;">(${indices.C}%)</span>
            </div>

            <!-- Statistiques -->
            <ul class="profil-liste-simple">
                <li><strong>• Artefacts remis :</strong> ${nbRemis}/${nbTotal}</li>
                <li><strong>• Indice C :</strong> ${indices.C}%</li>
            </ul>

            <hr class="profil-separateur">

            <!-- Gestion des jetons (placeholder) -->
            <h4 class="profil-titre-sous-section">
                GESTION DES JETONS
            </h4>
            <div style="background: #fff3cd; border: 2px dashed #ffc107; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 1.2rem; color: #856404; margin-bottom: 10px;">
                    <strong>Jetons disponibles :</strong> 2 / 2
                </div>
                <div class="profil-texte-italique-gris">
                    Système de jetons (reprise/délai) à implémenter
                </div>
            </div>

            <hr class="profil-separateur">

            <!-- Artefacts remis -->
            <h4 class="profil-titre-sous-section">
                ✅ ARTEFACTS REMIS (${artefactsRemis.length})
            </h4>
            ${artefactsRemis.length > 0 ? `
                <div class="badges-centres u-mb-20">
                    ${artefactsRemis.map(art => `
                        <div style="flex: 0 0 auto; min-width: 200px; max-width: 250px; padding: 12px;
                                    background: #d4edda; border-left: 3px solid #28a745;">
                            <div style="color: #155724; font-weight: 500; margin-bottom: 5px;">
                                ✅ ${echapperHtml(art.description)}
                                ${art.jetonReprise ? '<span style="color: #9c27b0; margin-left: 6px;" title="Jeton de reprise appliqué">⭐</span>' : ''}
                                ${art.jetonDelai ? '<span style="color: #ff6f00; margin-left: 6px;" title="Jeton de délai appliqué">⭐</span>' : ''}
                            </div>
                            <div class="profil-texte-detail">
                                <strong>${art.note}</strong>${art.niveau ? ` · ${art.niveau}` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="profil-zone-centre-grise">
                    Aucun artefact remis
                </div>
            `}

            <!-- Artefacts non remis -->
            <h4 class="profil-titre-sous-section">
                ⏳ ARTEFACTS NON REMIS (${artefactsNonRemis.length})
            </h4>
            ${artefactsNonRemis.length > 0 ? `
                <div class="badges-centres u-mb-20">
                    ${artefactsNonRemis.map(art => `
                        <div style="flex: 0 0 auto; min-width: 200px; max-width: 250px; padding: 12px;
                                    background: #f5f5f5; border-left: 3px solid #ddd; opacity: 0.6;">
                            <div style="color: #666; font-weight: 500; margin-bottom: 5px;">
                                ⏳ ${echapperHtml(art.description)}
                            </div>
                            <div class="text-muted" style="font-size: 0.9rem;">Non remis</div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="profil-zone-centre-verte">
                    ✅ Tous les artefacts ont été remis !
                </div>
            `}

            <hr class="profil-separateur">

            <!-- Placeholder graphique (en conclusion) -->
            <div style="background: var(--bleu-tres-pale); border: 2px dashed var(--bleu-pale); border-radius: 8px;
                        padding: 30px 20px; text-align: center; color: var(--bleu-moyen); font-style: italic;">
                📈 Évolution temporelle de la complétion (à venir)
            </div>

        </div>
    `;
}

/**
 * Récupère la table de conversion IDME depuis l'échelle configurée
 * @param {string} echelleId - ID de l'échelle (optionnel, prend la première IDME si non spécifié)
 * @returns {Object} - { I: 0.40, D: 0.65, M: 0.75, E: 1.00 }
 */
function obtenirTableConversionIDME(echelleId = null) {
    // PRIORITÉ 1 : Charger l'échelle active depuis niveauxEchelle
    let niveaux = db.getSync('niveauxEchelle', []);

    // Si on a des niveaux IDME actifs, les utiliser
    if (niveaux.length > 0 && niveaux.some(n => ['0', 'I', 'D', 'M', 'E'].includes(n.code))) {
        const table = {};
        niveaux.forEach(niveau => {
            const code = niveau.code.toUpperCase();
            if (['0', 'I', 'D', 'M', 'E'].includes(code)) {
                // valeurCalcul peut être string ou number, on convertit en 0-1
                const valeur = parseFloat(niveau.valeurCalcul || niveau.valeurPonctuelle || 0) / 100;
                table[code] = valeur;
            }
        });
        return table;
    }

    // PRIORITÉ 2 : Charger depuis echellesTemplates si niveauxEchelle est vide
    let echelles = db.getSync('echellesTemplates', []);
    let echelle;

    if (echelleId) {
        echelle = echelles.find(e => e.id === echelleId);
    } else {
        // Chercher une échelle avec les codes I, D, M, E (ou 0)
        echelle = echelles.find(e =>
            e.niveaux &&
            e.niveaux.some(n => ['0', 'I', 'D', 'M', 'E'].includes(n.code))
        );
    }

    if (echelle && echelle.niveaux) {
        const table = {};
        echelle.niveaux.forEach(niveau => {
            const code = niveau.code.toUpperCase();
            if (['0', 'I', 'D', 'M', 'E'].includes(code)) {
                const valeur = parseFloat(niveau.valeurCalcul || niveau.valeurPonctuelle || 0) / 100;
                table[code] = valeur;
            }
        });
        return table;
    }

    // FALLBACK : Valeurs par défaut si aucune échelle trouvée (avec niveau 0)
    return { '0': 0.00, I: 0.40, D: 0.65, M: 0.75, E: 1.00 };
}

/**
 * Convertit un niveau IDME en score numérique 0-1 selon l'échelle configurée
 * @param {string} niveau - I, D, M ou E
 * @param {Object} tableConversion - Table de conversion IDME
 * @returns {number} - Score 0-1
 */
function convertirNiveauIDMEEnScore(niveau, tableConversion) {
    niveau = niveau.trim().toUpperCase();
    return tableConversion[niveau] || null;
}

/**
 * Calcule les moyennes par critère SRPNF pour un étudiant
 * Parse les rétroactions finales pour extraire les niveaux IDME
 * @param {string} da - Numéro de DA
 * @returns {Object} - { structure, rigueur, plausibilite, nuance, francais } (scores 0-1)
 */
/**
 * Calcule les moyennes des critères SRPNF sur TOUTES les évaluations de l'étudiant
 * Utilisé pour la pratique sommative (SOM) qui considère toutes les évaluations
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Object|null} - Moyennes par critère ou null
 */
function calculerMoyennesCriteres(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // Filtrer toutes les évaluations de l'étudiant avec rétroaction finale
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da && e.retroactionFinale);

    console.log('calculerMoyennesCriteres (TOUTES) pour DA:', da);
    console.log('  Total évaluations dans système:', evaluations.length);
    console.log('  Évaluations de cet élève:', evaluationsEleve.length);

    if (evaluationsEleve.length === 0) {
        return null;
    }

    // Lire la grille de référence configurée
    const grille = obtenirGrilleReferenceDepistage();
    if (!grille || !grille.criteres || grille.criteres.length === 0) {
        console.warn('⚠️ Pas de grille de référence - calcul moyennes impossible');
        return null;
    }

    // Obtenir la table de conversion IDME depuis l'échelle configurée
    const tableConversion = obtenirTableConversionIDME();

    // Initialiser accumulateurs dynamiquement selon critères de la grille
    const scoresCriteres = {};
    grille.criteres.forEach(c => {
        const cleNormalisee = c.nom.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '');
        scoresCriteres[cleNormalisee] = [];
    });

    // NOUVELLE APPROCHE: Lire directement depuis evaluation.criteres[]
    // Plus fiable que de parser la rétroaction (qui peut avoir des formats variables)
    console.log(`✅ Extraction depuis evaluation.criteres[] pour ${grille.criteres.length} critères de référence`);

    evaluationsEleve.forEach(evaluation => {
        // Vérifier si cette évaluation a un tableau criteres[]
        if (!evaluation.criteres || !Array.isArray(evaluation.criteres)) {
            console.warn(`  ⚠️ ${evaluation.productionNom}: pas de tableau criteres[], ignorée`);
            return;
        }

        // Pour chaque critère de l'évaluation
        evaluation.criteres.forEach(critereSauvegarde => {
            const niveauIDME = critereSauvegarde.niveauSelectionne;
            const nomCritere = critereSauvegarde.critereNom;

            // Convertir le niveau IDME en score numérique
            const score = convertirNiveauIDMEEnScore(niveauIDME, tableConversion);

            if (score !== null) {
                // Trouver le critère correspondant dans la grille de référence
                const critereReference = grille.criteres.find(c => {
                    // Normaliser les deux noms pour comparaison insensible aux accents/espaces
                    const nomRef = c.nom.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');
                    const nomEval = nomCritere.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');

                    // Correspondance exacte OU l'un commence par l'autre
                    // Ex: "francais" match "francaisecrit" OU "francaisecrit" match "francais"
                    return nomRef === nomEval ||
                           nomRef.startsWith(nomEval) ||
                           nomEval.startsWith(nomRef);
                });

                if (critereReference) {
                    const cleNormalisee = critereReference.nom.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');
                    scoresCriteres[cleNormalisee].push(score);
                } else {
                    console.warn(`  ⚠️ Critère "${nomCritere}" non trouvé dans grille de référence`);
                }
            }
        });
    });

    console.log('  Scores extraits:', scoresCriteres);

    // Calculer les moyennes avec clés standardisées
    const moyennes = {};
    let aucuneDonnee = true;

    Object.keys(scoresCriteres).forEach(cle => {
        const scores = scoresCriteres[cle];

        // Standardiser la clé pour compatibilité avec l'interface
        // "francaisecrit" → "francais" (pour éviter NaN)
        let cleStandard = cle;
        if (cle.startsWith('francais')) {
            cleStandard = 'francais';
        }

        if (scores.length > 0) {
            moyennes[cleStandard] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            aucuneDonnee = false;
        } else {
            moyennes[cleStandard] = null;
        }
    });

    return aucuneDonnee ? null : moyennes;
}

/**
 * Calcule les moyennes des critères sur les N derniers artefacts
 * Spécifique à la PAN-maîtrise (regarde les artefacts récents, pas toutes les évaluations)
 * Utilise la grille de référence configurée pour les critères.
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {number} nombreArtefacts - Nombre d'artefacts récents à considérer (défaut: lire config.configPAN.nombreCours)
 * @returns {Object|null} - Moyennes par critère (clés normalisées) ou null
 */
function calculerMoyennesCriteresRecents(da, nombreArtefacts = null) {
    // Lire le nombre d'artefacts depuis la config si non fourni
    if (nombreArtefacts === null) {
        const config = db.getSync('modalitesEvaluation', {});
        nombreArtefacts = config.configPAN?.nombreCours || 3; // Par défaut 3 cours = 6 artefacts
        nombreArtefacts = nombreArtefacts * 2; // 3 cours = 6 artefacts (2 par cours)
    }

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Filtrer uniquement les artefacts de portfolio évalués pour cet étudiant
    const artefactsPortfolio = productions
        .filter(p => p.type === 'artefact-portfolio')
        .map(p => p.id);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        artefactsPortfolio.includes(e.productionId) &&
        e.retroactionFinale
    );

    if (evaluationsEleve.length === 0) {
        return null;
    }

    // Trier par date (plus récent d'abord)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // Prendre les N derniers (ou moins si pas assez)
    const derniersArtefacts = evaluationsEleve.slice(0, nombreArtefacts);

    console.log(`calculerMoyennesCriteresRecents pour DA ${da}:`);
    console.log(`  Nombre d'artefacts demandés: ${nombreArtefacts}`);
    console.log(`  Nombre d'artefacts retenus: ${derniersArtefacts.length}`);

    // Lire la grille de référence configurée
    const grille = obtenirGrilleReferenceDepistage();

    if (!grille || !grille.criteres || grille.criteres.length === 0) {
        console.warn('⚠️ Pas de grille de référence - calcul moyennes critères récents impossible');
        return null;
    }

    // Obtenir la table de conversion IDME
    const tableConversion = obtenirTableConversionIDME();

    // Initialiser accumulateurs dynamiquement selon critères de la grille
    const scoresCriteres = {};
    grille.criteres.forEach(c => {
        const cleNormalisee = c.nom.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '');
        scoresCriteres[cleNormalisee] = [];
    });

    // NOUVELLE APPROCHE: Lire directement depuis evaluation.criteres[]
    // Plus fiable que de parser la rétroaction (qui peut avoir des formats variables)
    console.log(`✅ Extraction depuis evaluation.criteres[] pour ${grille.criteres.length} critères de référence`);

    derniersArtefacts.forEach(evaluation => {
        // Vérifier si cette évaluation a un tableau criteres[]
        if (!evaluation.criteres || !Array.isArray(evaluation.criteres)) {
            console.warn(`  ⚠️ ${evaluation.productionNom}: pas de tableau criteres[], ignorée`);
            return;
        }

        // Pour chaque critère de l'évaluation
        evaluation.criteres.forEach(critereSauvegarde => {
            const niveauIDME = critereSauvegarde.niveauSelectionne;
            const nomCritere = critereSauvegarde.critereNom;

            // Convertir le niveau IDME en score numérique
            const score = convertirNiveauIDMEEnScore(niveauIDME, tableConversion);

            if (score !== null) {
                // Trouver le critère correspondant dans la grille de référence
                const critereReference = grille.criteres.find(c => {
                    // Normaliser les deux noms pour comparaison insensible aux accents/espaces
                    const nomRef = c.nom.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');
                    const nomEval = nomCritere.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');

                    // Correspondance exacte OU l'un commence par l'autre
                    // Ex: "francais" match "francaisecrit" OU "francaisecrit" match "francais"
                    return nomRef === nomEval ||
                           nomRef.startsWith(nomEval) ||
                           nomEval.startsWith(nomRef);
                });

                if (critereReference) {
                    const cleNormalisee = critereReference.nom.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');
                    scoresCriteres[cleNormalisee].push(score);
                } else {
                    console.warn(`  ⚠️ Critère "${nomCritere}" non trouvé dans grille de référence`);
                }
            }
        });
    });

    console.log(`  Scores extraits (${derniersArtefacts.length} derniers):`, scoresCriteres);

    // Calculer les moyennes avec clés standardisées
    const moyennes = {};
    let aucuneDonnee = true;

    Object.keys(scoresCriteres).forEach(cle => {
        const scores = scoresCriteres[cle];

        // Standardiser la clé pour compatibilité avec l'interface
        // "francaisecrit" → "francais" (pour éviter NaN)
        let cleStandard = cle;
        if (cle.startsWith('francais')) {
            cleStandard = 'francais';
        }

        // Capitaliser la première lettre (Structure, Rigueur, etc.)
        const cleFormatee = cleStandard.charAt(0).toUpperCase() + cleStandard.slice(1);

        if (scores.length > 0) {
            moyennes[cleFormatee] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            aucuneDonnee = false;
        } else {
            moyennes[cleFormatee] = null;
        }
    });

    return aucuneDonnee ? null : moyennes;
}

/**
 * Calcule l'indice de Blocage (compétences transversales critiques)
 * Blocage = 0.35 × Structure + 0.35 × Français + 0.30 × Rigueur
 * @param {Object} moyennes - Moyennes par critère
 * @returns {Object|null} - { score, partiel, criteresManquants } ou null si données insuffisantes
 */
function calculerIndiceBlocage(moyennes) {
    if (!moyennes) {
        return null;
    }

    const criteresDisponibles = {
        structure: moyennes.structure !== null,
        francais: moyennes.francais !== null,
        rigueur: moyennes.rigueur !== null
    };

    const nbCriteresDisponibles = Object.values(criteresDisponibles).filter(Boolean).length;

    // Si moins de 2 critères disponibles, impossible de calculer
    if (nbCriteresDisponibles < 2) {
        return null;
    }

    // Calcul avec pondération ajustée si certains critères manquent
    let score = 0;
    let ponderationTotale = 0;
    const criteresManquants = [];

    if (criteresDisponibles.structure) {
        score += 0.35 * moyennes.structure;
        ponderationTotale += 0.35;
    } else {
        criteresManquants.push('Structure');
    }

    if (criteresDisponibles.francais) {
        score += 0.35 * moyennes.francais;
        ponderationTotale += 0.35;
    } else {
        criteresManquants.push('Français');
    }

    if (criteresDisponibles.rigueur) {
        score += 0.30 * moyennes.rigueur;
        ponderationTotale += 0.30;
    } else {
        criteresManquants.push('Rigueur');
    }

    // Normaliser si pondération partielle
    if (ponderationTotale > 0 && ponderationTotale < 1.0) {
        score = score / ponderationTotale;
    }

    return {
        score: score,
        partiel: criteresManquants.length > 0,
        criteresManquants: criteresManquants
    };
}

/**
 * Interprète l'indice de Blocage selon les seuils pédagogiques
 * @param {number} blocage - Indice de blocage (0-1)
 * @returns {Object} - { niveau, couleur, description }
 */
function interpreterIndiceBlocage(blocage) {
    if (blocage === null) {
        return null;
    }

    if (blocage < 0.375) {
        return {
            niveau: 'Blocage critique',
            couleur: '#dc3545', // Rouge
            description: 'Les compétences de base (Structure, Français, Rigueur) sont insuffisantes et bloquent la progression. Intervention immédiate requise.'
        };
    }
    if (blocage < 0.5) {
        return {
            niveau: 'Risque de blocage',
            couleur: '#ff9800', // Orange
            description: 'Les compétences de base sont fragiles. Un soutien ciblé sur ces fondamentaux est nécessaire pour éviter un blocage.'
        };
    }
    if (blocage < 0.625) {
        return {
            niveau: 'Progression possible',
            couleur: '#ffc107', // Jaune
            description: 'Les compétences de base permettent la progression, mais nécessitent un renforcement pour assurer la réussite.'
        };
    }
    return {
        niveau: 'Progression normale',
        couleur: '#28a745', // Vert
        description: 'Les compétences de base sont maîtrisées. La progression dans les apprentissages peut se faire normalement.'
    };
}

/**
 * Diagnostique les forces et défis selon le seuil pédagogique
 * @param {Object} moyennes - Moyennes par critère
 * @param {number} seuil - Seuil pour identifier une force (défaut: valeur configurable via interpretation-config.js)
 * @returns {Object} - { forces: [], defis: [], principaleForce: '', principalDefi: '' }
 */
function diagnostiquerForcesChallenges(moyennes, seuil = null) {
    // Utiliser le seuil configurable si aucun seuil n'est fourni
    if (seuil === null) {
        seuil = obtenirSeuil('defiSpecifique');
    }
    if (!moyennes) {
        return { forces: [], defis: [], principaleForce: null, principalDefi: null };
    }

    // Lire la grille de référence configurée
    const grille = obtenirGrilleReferenceDepistage();

    if (!grille || !grille.criteres || grille.criteres.length === 0) {
        console.warn('⚠️ Pas de grille de référence - diagnostic forces/défis impossible');
        console.warn('   → Grille:', grille);
        console.warn('   → Allez dans Réglages → Pratique de notation pour configurer une grille de référence');
        return { forces: [], defis: [], principaleForce: null, principalDefi: null };
    }

    // Construire dynamiquement le tableau des critères depuis la grille
    const criteres = grille.criteres.map(c => {
        // Normaliser le nom du critère pour trouver sa clé dans moyennes
        // Ex: "Structure" → "structure", "Plausibilité" → "plausibilite"
        const cleNormalisee = c.nom.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Enlever accents
            .replace(/\s+/g, '');  // Enlever espaces

        return {
            nom: c.nom,
            cle: cleNormalisee,
            score: moyennes[cleNormalisee] ?? null,
            ponderation: c.ponderation || 0
        };
    }).filter(c => c.score !== null); // Garder seulement critères avec score

    // Trier forces et défis (considérer pondération pour importance)
    const forces = criteres.filter(c => c.score >= seuil).sort((a, b) => {
        // Tri primaire : par score descendant
        if (Math.abs(b.score - a.score) > 0.01) return b.score - a.score;
        // Tri secondaire : par pondération (critères importants en premier)
        return b.ponderation - a.ponderation;
    });

    const defis = criteres.filter(c => c.score < seuil).sort((a, b) => {
        // Tri primaire : par score ascendant (pire défi en premier)
        if (Math.abs(a.score - b.score) > 0.01) return a.score - b.score;
        // Tri secondaire : par pondération (défis importants en premier)
        return b.ponderation - a.ponderation;
    });

    return {
        forces: forces,
        defis: defis,
        principaleForce: forces.length > 0 ? forces[0] : null,
        principalDefi: defis.length > 0 ? defis[0] : null,
        moyennesCriteres: moyennes // Inclure les moyennes pour affichage par niveau IDME
    };
}

/* ===============================
   🎯 SYSTÈME DE CIBLES D'INTERVENTION
   Calcul du Pattern actuel et détermination des cibles d'intervention
   basé sur les indices A-C-P et les critères SRPNF
   =============================== */

/**
 * Calcule les indices sur les N DERNIERS artefacts (chronologiquement)
 *
 * DISTINCTION IMPORTANTE :
 * - Dépistage (pourDepistage=true) : Utilise nombreProductionsAnalyse (défaut 3)
 *   → Détection précoce des patterns pour intervenir à temps
 * - Performance finale (pourDepistage=false) : Utilise nombreARetenir (défaut 4)
 *   → Calcul de la note finale du portfolio
 *
 * @param {string} da - Numéro de DA
 * @param {boolean} pourDepistage - Si true, utilise fenêtre de dépistage (3). Si false, utilise N pour note finale (4)
 * @returns {Object} - { performance, idmeMoyen, francaisMoyen, nbArtefacts }
 */
function calculerIndicesNDerniersArtefacts(da, pourDepistage = false) {
    // Déterminer le nombre d'artefacts selon l'usage
    let nombreArtefacts;
    if (pourDepistage) {
        // Pour dépistage : fenêtre glissante configurable (Réglages › Interprétation)
        nombreArtefacts = obtenirNombreProductionsPourPatterns(); // Défaut 3
    } else {
        // Pour performance finale : N meilleurs artefacts (Réglages › Portfolio)
        const config = db.getSync('modalitesEvaluation', {});
        nombreArtefacts = config.configPAN?.portfolio?.nombreARetenir || 4; // Défaut 4
    }

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    // ✅ CORRECTION (29 déc 2025): Utiliser obtenirDonneesSelonMode() au lieu de db.getSync()
    // pour respecter le namespace du trimestre archivé et le filtrage par coursId
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Filtrer uniquement les artefacts de portfolio évalués pour cet étudiant
    const artefactsPortfolio = productions
        .filter(p => p.type === 'artefact-portfolio')
        .map(p => p.id);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        artefactsPortfolio.includes(e.productionId) &&
        e.noteFinale !== null &&
        e.noteFinale !== undefined
    );

    if (evaluationsEleve.length === 0) {
        return { performance: 0, idmeMoyen: 0, francaisMoyen: 0, nbArtefacts: 0 };
    }

    // Trier par date de création (la plus récente d'abord)
    // Si pas de date, utiliser l'ordre inverse d'ajout (derniers ajoutés = plus récents)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // Prendre les N derniers (selon config PAN, ou moins si pas assez d'artefacts)
    const troisDerniers = evaluationsEleve.slice(0, nombreArtefacts);

    // Calculer la performance moyenne (notes)
    const performance = troisDerniers.reduce((sum, e) => sum + e.noteFinale, 0) / troisDerniers.length / 100;

    // Calculer IDME moyen (si disponible)
    const tableConversion = obtenirTableConversionIDME();
    const niveauxIDME = troisDerniers
        .map(e => e.niveauFinal)
        .filter(n => n && ['I', 'D', 'M', 'E'].includes(n))
        .map(n => convertirNiveauIDMEEnScore(n, tableConversion))
        .filter(s => s !== null);

    const idmeMoyen = niveauxIDME.length > 0
        ? niveauxIDME.reduce((sum, s) => sum + s, 0) / niveauxIDME.length
        : 0;

    // Calculer moyenne du critère Français (si disponible)
    const scoresFrancais = [];
    const regexFrancais = /FRAN[ÇC]AIS\s+[ÉE]CRIT\s*\(([IDME])\)/gi;

    troisDerniers.forEach(evaluation => {
        const retroaction = evaluation.retroactionFinale || '';
        let match;
        while ((match = regexFrancais.exec(retroaction)) !== null) {
            const niveauIDME = match[1].toUpperCase();
            const score = convertirNiveauIDMEEnScore(niveauIDME, tableConversion);
            if (score !== null) {
                scoresFrancais.push(score * 100); // Convertir en pourcentage
            }
        }
    });

    const francaisMoyen = scoresFrancais.length > 0
        ? scoresFrancais.reduce((sum, s) => sum + s, 0) / scoresFrancais.length
        : 0;

    console.log(`Indices ${nombreArtefacts} derniers artefacts pour DA ${da}:`, {
        nbArtefacts: troisDerniers.length,
        performance: (performance * 100).toFixed(1) + '%',
        idmeMoyen: (idmeMoyen * 100).toFixed(1) + '%',
        francaisMoyen: francaisMoyen.toFixed(1) + '%'
    });

    return {
        performance: performance,
        idmeMoyen: idmeMoyen,
        francaisMoyen: francaisMoyen,
        nbArtefacts: troisDerniers.length
    };
}

/**
 * Calcule la progression (direction) selon le Guide de monitorage
 * Compare la performance des N artefacts les plus récents (AM) vs les N suivants avec chevauchement (AL)
 * Le nombre N est configurable via Réglages → Interprétation des données
 *
 * Fenêtre glissante: Si artefacts = A, B, C, ..., N, N+1 (du plus récent au plus ancien)
 * - AM = moyenne(A, B, ..., N)
 * - AL = moyenne(B, C, ..., N+1)
 *
 * Formule: SI(AM > AL + seuil; "↗"; SI(AM < AL - seuil; "↘"; "→"))
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { direction: '↗'|'→'|'↘', interpretation, AM, AL, difference }
 */
function calculerProgressionEleve(da) {
    // 🆕 NOUVELLE LOGIQUE : Basée sur les critères individuels plutôt que sur la note globale
    // Obtenir les directions pour chaque critère
    const pratique = obtenirPratiqueActuelle();
    const directionsCriteres = calculerDirectionsCriteres(da, pratique);

    // Vérifier si nous avons suffisamment de données
    const criteres = Object.keys(directionsCriteres);
    const criteresAvecDonnees = criteres.filter(c => directionsCriteres[c].symbole !== '');

    if (criteresAvecDonnees.length === 0) {
        return {
            direction: null,
            interpretation: 'Données insuffisantes',
            AM: null,
            AL: null,
            difference: null,
            nbCriteres: 0,
            criteresDetail: directionsCriteres
        };
    }

    // Compter les critères en amélioration, en baisse, et en plateau
    let nbAmelioration = 0;
    let nbBaisse = 0;
    let nbPlateau = 0;

    criteresAvecDonnees.forEach(critere => {
        const symbole = directionsCriteres[critere].symbole;
        if (symbole === '→') {
            nbAmelioration++;
        } else if (symbole === '←') {
            nbBaisse++;
        } else if (symbole === '—') {
            nbPlateau++;
        }
    });

    // Déterminer la direction globale selon la majorité
    let direction, interpretation;
    if (nbAmelioration > nbBaisse && nbAmelioration > nbPlateau) {
        direction = '↗';
        interpretation = 'Progression';
    } else if (nbBaisse > nbAmelioration && nbBaisse > nbPlateau) {
        direction = '↘';
        interpretation = 'Régression';
    } else {
        direction = '—';
        interpretation = 'Plateau';
    }

    // Calculer une moyenne pondérée des différences pour information
    let sommeDifferences = 0;
    let nbDifferences = 0;
    criteresAvecDonnees.forEach(critere => {
        const diff = parseFloat(directionsCriteres[critere].difference);
        if (!isNaN(diff)) {
            sommeDifferences += diff;
            nbDifferences++;
        }
    });
    const differenceGlobale = nbDifferences > 0 ? (sommeDifferences / nbDifferences).toFixed(1) : '0.0';

    console.log(`Progression pour DA ${da}:`, {
        direction,
        interpretation,
        nbAmelioration,
        nbBaisse,
        nbPlateau,
        differenceGlobale: differenceGlobale + ' points (moyenne des critères)'
    });

    return {
        direction,
        interpretation,
        AM: null, // Non utilisé dans la nouvelle logique
        AL: null, // Non utilisé dans la nouvelle logique
        difference: differenceGlobale,
        nbCriteres: criteresAvecDonnees.length,
        nbAmelioration,
        nbBaisse,
        nbPlateau,
        criteresDetail: directionsCriteres
    };
}

/**
 * Identifie le défi spécifique (critère SRPNF le plus faible) sur les N derniers artefacts
 * Le nombre N est configurable via Réglages → Interprétation des données
 * Seuil: Valeur configurable (défaut: 71.25%, ajustable via interpretation-config.js)
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { defi: 'Structure'|'Rigueur'|'Plausibilité'|'Nuance'|'Français'|'Aucun', score (0-1) }
 */
function identifierDefiSpecifique(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Obtenir le nombre de productions configuré pour l'analyse des patterns
    const N = obtenirNombreProductionsPourPatterns() || 3;

    // Filtrer uniquement les artefacts de portfolio évalués pour cet étudiant
    const artefactsPortfolio = productions
        .filter(p => p.type === 'artefact-portfolio')
        .map(p => p.id);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        artefactsPortfolio.includes(e.productionId) &&
        e.retroactionFinale
    );

    if (evaluationsEleve.length === 0) {
        return { defi: 'Aucun', score: null };
    }

    // Trier par date (plus récent d'abord)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // Prendre les N plus récents
    const derniers = evaluationsEleve.slice(0, N);

    // Obtenir la table de conversion IDME
    const tableConversion = obtenirTableConversionIDME();

    // Accumuler les scores par critère
    const scoresCriteres = {
        structure: [],
        rigueur: [],
        plausibilite: [],
        nuance: [],
        francais: []
    };

    // Regex pour extraire: NOM_CRITERE (NIVEAU)
    const regexCritere = /(STRUCTURE|RIGUEUR|PLAUSIBILIT[ÉE]|NUANCE|FRAN[ÇC]AIS\s+[ÉE]CRIT)\s*\(([IDME])\)/gi;

    derniers.forEach(evaluation => {
        const retroaction = evaluation.retroactionFinale || '';
        let match;
        while ((match = regexCritere.exec(retroaction)) !== null) {
            const nomCritere = match[1].toUpperCase();
            const niveauIDME = match[2].toUpperCase();
            const score = convertirNiveauIDMEEnScore(niveauIDME, tableConversion);

            if (score !== null) {
                if (nomCritere === 'STRUCTURE') {
                    scoresCriteres.structure.push(score);
                } else if (nomCritere === 'RIGUEUR') {
                    scoresCriteres.rigueur.push(score);
                } else if (nomCritere.startsWith('PLAUSIBILIT')) {
                    scoresCriteres.plausibilite.push(score);
                } else if (nomCritere === 'NUANCE') {
                    scoresCriteres.nuance.push(score);
                } else if (nomCritere.startsWith('FRAN')) {
                    scoresCriteres.francais.push(score);
                }
            }
        }
    });

    // Calculer les moyennes
    const moyennes = {};
    const seuil = obtenirSeuil('defiSpecifique'); // Seuil configurable (défaut: 71.25%)

    for (const critere in scoresCriteres) {
        const scores = scoresCriteres[critere];
        if (scores.length > 0) {
            moyennes[critere] = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        } else {
            moyennes[critere] = null;
        }
    }

    // Identifier le critère le plus faible (< seuil)
    let defiMinimum = null;
    let scoreMinimum = 1.0;

    const nomsCriteres = {
        structure: 'Structure',
        rigueur: 'Rigueur',
        plausibilite: 'Plausibilité',
        nuance: 'Nuance',
        francais: 'Français'
    };

    for (const critere in moyennes) {
        const score = moyennes[critere];
        if (score !== null && score < seuil && score < scoreMinimum) {
            scoreMinimum = score;
            defiMinimum = nomsCriteres[critere];
        }
    }

    console.log(`Défi spécifique pour DA ${da}:`, {
        defi: defiMinimum || 'Aucun',
        score: defiMinimum ? (scoreMinimum * 100).toFixed(1) + '%' : null,
        scoreNormalise: defiMinimum ? scoreMinimum.toFixed(4) : null,
        moyennes: moyennes
    });

    return {
        defi: defiMinimum || 'Aucun',
        score: defiMinimum ? scoreMinimum : null
    };
}

/**
 * Identifie le Pattern actuel selon la formule pédagogique
 *
 * Formule: SI(AH≤0,4;"Blocage critique";
 *             SI(ET(AH≤0,5;N≠"Aucun");"Blocage émergent";
 *                SI(ET(AH≤0,75;N≠"Aucun");"Défi spécifique";"Stable")))
 *
 * @param {number} performancePAN3 - Performance sur 3 derniers artefacts (0-1)
 * @param {boolean} aUnDefi - True si un défi est identifié
 * @returns {string} - Pattern: 'Blocage critique', 'Blocage émergent', 'Défi spécifique', 'Stable'
 */
function identifierPatternActuel(performancePAN3, aUnDefi) {
    // Utiliser les seuils configurables IDME
    const seuilInsuffisant = obtenirSeuil('idme.insuffisant');      // Par défaut 0.64 (64%)
    const seuilDeveloppement = obtenirSeuil('idme.developpement');  // Par défaut 0.75 (75%)

    console.log('🔍 [identifierPatternActuel]', {
        performance: (performancePAN3 * 100).toFixed(1) + '%',
        aUnDefi: aUnDefi,
        seuilInsuffisant: (seuilInsuffisant * 100) + '%',
        seuilDeveloppement: (seuilDeveloppement * 100) + '%'
    });

    // Blocage critique : Performance < 64% (Insuffisant - unistructurel)
    if (performancePAN3 < seuilInsuffisant) {
        console.log('   → Pattern: Blocage critique');
        return 'Blocage critique';
    }

    // Blocage émergent : Performance < 75% (En développement - multistructurel) ET a un défi
    if (performancePAN3 < seuilDeveloppement && aUnDefi) {
        console.log('   → Pattern: Blocage émergent');
        return 'Blocage émergent';
    }

    // Défi spécifique : Performance acceptable mais a un défi récurrent
    if (aUnDefi) {
        console.log('   → Pattern: Défi spécifique');
        return 'Défi spécifique';
    }

    // Stable : Pas de défi ou performance maîtrisée
    console.log('   → Pattern: Stable');
    return 'Stable';
}

/**
 * Détermine la cible d'intervention selon la formule pédagogique complète
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { cible, pattern, niveau, couleur, emoji }
 */
/**
 * Détermine le Modèle de la Réponse à l'intervention (RàI) basé UNIQUEMENT sur P et SRPNF
 * (sans tenir compte de la mobilisation A-C)
 * @param {string} da - Numéro de DA
 * @returns {Object} - Modèle de la Réponse à l'intervention (RàI) avec pattern et descriptif
 */
function determinerNiveauRaiPedagogique(da) {
    // Récupérer les indices de performance
    const indices = calculerTousLesIndices(da);
    const P = indices.P / 100; // Convertir en décimal 0-1

    // Déterminer quelle fonction utiliser selon la pratique
    const config = db.getSync('modalitesEvaluation', {});
    const pratique = config.pratique || 'alternative';

    // Calculer moyennes SRPNF
    const moyennes = (pratique === 'alternative')
        ? calculerMoyennesCriteresRecents(da)
        : calculerMoyennesCriteres(da);

    console.log('🔍 [determinerNiveauRaiPedagogique] DA:', da, 'Moyennes:', moyennes);

    // Détecter les défis
    const diagnostic = diagnostiquerForcesChallenges(moyennes);
    console.log('🔍 [determinerNiveauRaiPedagogique] Diagnostic:', diagnostic);

    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true);
    console.log('🔍 [determinerNiveauRaiPedagogique] Indices 3 derniers:', indices3Derniers);

    // Déterminer le pattern basé uniquement sur la performance
    const pattern = identifierPatternActuel(indices3Derniers.performance, diagnostic.principalDefi !== null);

    // Seuils configurables
    const seuilMaitrise = obtenirSeuil('idme.maitrise');
    const seuilDeveloppement = obtenirSeuil('idme.developpement');
    const seuilInsuffisant = obtenirSeuil('idme.insuffisant');

    console.log('🎓 Modèle de la Réponse à l\'intervention (RàI) pour DA', da, {
        P: (P * 100).toFixed(1) + '%',
        pattern,
        defiPrincipal: diagnostic.principalDefi?.nom || 'Aucun'
    });

    // LOGIQUE PÉDAGOGIQUE (basée uniquement sur P et SRPNF)

    // Niveau 3 - Intensif : Blocage critique (P < insuffisant OU plusieurs critères < développement)
    if (pattern === 'Blocage critique' || P < seuilInsuffisant) {
        return {
            niveau: 3,
            label: 'Niveau 3 - Intensif',
            pattern: pattern,
            defi: diagnostic.principalDefi?.nom || 'Aucun',
            description: 'Difficultés pédagogiques majeures nécessitant un soutien intensif.',
            badgeClasse: 'badge-rai-3',
            patternBadge: 'badge-pattern-blocage-critique'
        };
    }

    // Niveau 2 - Préventif : Performance en développement (<75%) OU Blocage émergent OU Défi spécifique
    // Un élève avec P en zone "Développement" (65-74%) nécessite un accompagnement préventif,
    // même si son pattern est "Stable" (pas de défi identifié).
    if (P < seuilDeveloppement || pattern === 'Blocage émergent' || pattern === 'Défi spécifique') {
        // Déterminer la description selon le contexte
        let description;
        if (P < seuilDeveloppement && pattern === 'Stable') {
            description = 'Performance en développement nécessitant un accompagnement préventif.';
        } else if (pattern === 'Blocage émergent') {
            description = 'Difficultés émergentes nécessitant une intervention préventive ciblée.';
        } else {
            description = 'Défi spécifique identifié nécessitant un accompagnement ciblé.';
        }

        return {
            niveau: 2,
            label: 'Niveau 2 - Préventif',
            pattern: pattern,
            defi: diagnostic.principalDefi?.nom || 'Aucun',
            description: description,
            badgeClasse: 'badge-rai-2',
            patternBadge: pattern === 'Blocage émergent'
                ? 'badge-pattern-blocage-emergent'
                : pattern === 'Défi spécifique'
                    ? 'badge-pattern-defi-specifique'
                    : 'badge-pattern-stable'
        };
    }

    // Niveau 1 - Universel : Performance maîtrisée (≥75%) et stable
    return {
        niveau: 1,
        label: 'Niveau 1 - Universel',
        pattern: pattern,
        defi: diagnostic.principalDefi?.nom || 'Aucun',
        description: 'Performance stable. Suivi régulier en classe.',
        badgeClasse: 'badge-rai-1',
        patternBadge: 'badge-pattern-stable'
    };
}

/**
 * Détermine l'alerte contextuelle basée UNIQUEMENT sur A et C
 * (sans tenir compte de la performance P)
 * @param {string} da - Numéro de DA
 * @returns {Object} - Alerte contextuelle avec niveau d'engagement
 */
function determinerAlerteContextuelle(da) {
    // Récupérer les indices de mobilisation
    const indices = calculerTousLesIndices(da);
    const A = indices.A / 100; // Convertir en décimal 0-1
    const C = indices.C / 100; // Convertir en décimal 0-1

    // Interpréter la mobilisation
    const interpMobilisation = interpreterMobilisation(A, C);

    console.log('📊 Contexte d\'apprentissage pour DA', da, {
        A: (A * 100).toFixed(1) + '%',
        C: (C * 100).toFixed(1) + '%',
        mobilisation: interpMobilisation.niveau
    });

    // LOGIQUE CONTEXTUELLE (basée uniquement sur A et C)

    // Contexte très favorable : A ≥ 85% ET C ≥ 85%
    if (A >= 0.85 && C >= 0.85) {
        return {
            niveau: 'tres-favorable',
            label: 'Très favorable',
            description: 'Contexte très favorable. L\'élève est assidu et mobilisé.',
            badgeClasse: 'badge-engagement-tres-favorable',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Les interventions peuvent se concentrer sur le développement des habiletés et compétences.'
        };
    }

    // Contexte favorable : A ≥ 75% ET C ≥ 75%
    if (A >= 0.75 && C >= 0.75) {
        return {
            niveau: 'favorable',
            label: 'Favorable',
            description: 'Contexte favorable. L\'élève est présent et mobilisé.',
            badgeClasse: 'badge-engagement-favorable',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Les interventions peuvent se concentrer sur le développement des habiletés et compétences.'
        };
    }

    // Contexte modéré : A ≥ 65% ET C ≥ 65%
    if (A >= 0.65 && C >= 0.65) {
        return {
            niveau: 'modere',
            label: 'Modéré',
            description: 'Contexte modéré. Performance adéquate mais mobilisation pourrait être améliorée.',
            badgeClasse: 'badge-engagement-modere',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Suivi régulier recommandé pour maintenir l\'engagement et éviter une baisse de performance.'
        };
    }

    // Contexte fragile : A < 65% OU C < 65%
    if (A < 0.65 || C < 0.65) {
        return {
            niveau: 'fragile',
            label: 'Fragile',
            description: 'Alerte : Contexte fragile. Risque de décrochage si la tendance se maintient.',
            badgeClasse: 'badge-engagement-fragile',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Interventions recommandées : Rencontrer l\'élève pour comprendre les absences/non-remises, encourager la mobilisation, vérifier s\'il y a des obstacles (emploi, santé, etc.).'
        };
    }

    // Contexte insuffisant : A < 50% OU C < 50%
    return {
        niveau: 'insuffisant',
        label: 'Insuffisant',
        description: 'Alerte critique : Contexte insuffisant. Décrochage imminent.',
        badgeClasse: 'badge-engagement-insuffisant',
        A: (A * 100).toFixed(0) + '%',
        C: (C * 100).toFixed(0) + '%',
        recommandation: 'Intervention urgente requise : Rencontre individuelle, contact avec aide pédagogique, vérifier situation personnelle.'
    };
}

function determinerCibleIntervention(da) {
    // Récupérer tous les indices nécessaires
    const indices = calculerTousLesIndices(da);

    // Déterminer quelle fonction utiliser selon la pratique
    const config = db.getSync('modalitesEvaluation', {});
    const pratique = config.pratique || 'alternative';

    // En PAN : utiliser les moyennes sur les N derniers artefacts (récurrence récente)
    // En SOM : utiliser les moyennes globales (toutes les évaluations)
    const moyennes = (pratique === 'alternative')
        ? calculerMoyennesCriteresRecents(da)
        : calculerMoyennesCriteres(da);

    // Détecter les défis avec le seuil configurable
    const diagnostic = diagnostiquerForcesChallenges(moyennes);
    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true); // true = dépistage (3 artefacts)
    const interpMobilisation = interpreterMobilisation(indices.A / 100, indices.C / 100);

    // Variables pour la formule (correspondance avec Excel)
    const E = interpMobilisation.niveau; // Mobilisation
    const I = indices3Derniers.francaisMoyen; // Moyenne français N derniers artefacts
    const M = identifierPatternActuel(indices3Derniers.performance, diagnostic.principalDefi !== null); // Pattern actuel
    const N = diagnostic.principalDefi ? diagnostic.principalDefi.nom : 'Aucun'; // Défi principal
    const performancePAN3 = indices3Derniers.performance;

    console.log('🎯 Détermination cible pour DA', da, {
        mobilisation: E,
        engagement: indices.E,
        pattern: M,
        defi: N,
        francais: I.toFixed(1) + '%',
        perfPAN3: (performancePAN3 * 100).toFixed(1) + '%'
    });

    // LOGIQUE DE DÉCISION (formule Excel traduite en JavaScript)

    // 1. Vérifier décrochage (priorité absolue)
    // Note: Remplacé "risque élevé" par "engagement très faible" (< 0.3)
    if (E === 'Décrochage' || indices.E < 0.3) {
        return {
            cible: 'Décrochage',
            pattern: M,
            niveau: 3,
            couleur: '#9e9e9e',
            emoji: '⚫'
        };
    }

    // 2. Blocage critique
    if (M === 'Blocage critique') {
        if (N === 'Français' && I <= 17) {
            return {
                cible: 'Rencontre individuelle | CAF | Dépistage',
                pattern: M,
                niveau: 3,
                couleur: '#dc3545',
                emoji: '🔴'
            };
        }
        if (N === 'Structure' && I <= 17) {
            return {
                cible: 'Remédiation en Structure | Exercice supplémentaire | CAF',
                pattern: M,
                niveau: 3,
                couleur: '#dc3545',
                emoji: '🔴'
            };
        }
        if (N === 'Rigueur' && I <= 17) {
            return {
                cible: 'Remédiation en Rigueur | CAF',
                pattern: M,
                niveau: 3,
                couleur: '#dc3545',
                emoji: '🔴'
            };
        }
        if (N === 'Aucun') {
            return {
                cible: 'Rencontre individuelle | CAF | Dépistage',
                pattern: M,
                niveau: 3,
                couleur: '#dc3545',
                emoji: '🔴'
            };
        }
    }

    // 3. Blocage émergent
    if (M === 'Blocage émergent') {
        if (N === 'Français' && I >= 18 && I <= 20) {
            return {
                cible: 'Remédiation en stratégie de révision ciblée | CAF recommandé',
                pattern: M,
                niveau: 2,
                couleur: '#ff9800',
                emoji: '🟠'
            };
        }
        if (N === 'Structure' && I >= 18 && I <= 27) {
            return {
                cible: 'Remédiation en Structure',
                pattern: M,
                niveau: 2,
                couleur: '#ff9800',
                emoji: '🟠'
            };
        }
        if (N === 'Rigueur' && I >= 18 && I <= 27) {
            return {
                cible: 'Remédiation en Rigueur',
                pattern: M,
                niveau: 2,
                couleur: '#ff9800',
                emoji: '🟠'
            };
        }
        if (N === 'Aucun') {
            return {
                cible: 'Remédiation en rigueur',
                pattern: M,
                niveau: 2,
                couleur: '#ff9800',
                emoji: '🟠'
            };
        }
    }

    // 4. Défi spécifique
    if (M === 'Défi spécifique') {
        if (N === 'Français') {
            if (I <= 17) {
                return {
                    cible: 'Rencontre individuelle | CAF | Dépistage SA',
                    pattern: M,
                    niveau: 2,
                    couleur: '#ffc107',
                    emoji: '🟡'
                };
            }
            if (I >= 18 && I <= 20) {
                return {
                    cible: 'Remédiation en révision linguistique | CAF recommandé',
                    pattern: M,
                    niveau: 2,
                    couleur: '#ffc107',
                    emoji: '🟡'
                };
            }
            if (I >= 21 && I <= 27) {
                return {
                    cible: 'Remédiation en révision linguistique',
                    pattern: M,
                    niveau: 2,
                    couleur: '#ffc107',
                    emoji: '🟡'
                };
            }
        }
        if (N === 'Structure' && I >= 18) {
            return {
                cible: 'Pratique guidée en Structure',
                pattern: M,
                niveau: 2,
                couleur: '#ffc107',
                emoji: '🟡'
            };
        }
        if (N === 'Rigueur' && I >= 18) {
            return {
                cible: 'Pratique guidée en Rigueur',
                pattern: M,
                niveau: 2,
                couleur: '#ffc107',
                emoji: '🟡'
            };
        }
        if (N === 'Plausibilité' && I >= 18) {
            return {
                cible: 'Pratique guidée en Plausibilité',
                pattern: M,
                niveau: 2,
                couleur: '#ffc107',
                emoji: '🟡'
            };
        }
        if (N === 'Nuance' && I >= 18) {
            return {
                cible: 'Pratique guidée en Nuance',
                pattern: M,
                niveau: 2,
                couleur: '#ffc107',
                emoji: '🟡'
            };
        }
    }

    // 5. Stable MAIS risque élevé = plateau problématique
    const seuilRisqueModere = obtenirSeuil('risque.modere');
    const seuilRisqueFaible = obtenirSeuil('risque.faible');

    if (M === 'Stable' && indices.R >= seuilRisqueModere) {
        return {
            cible: 'Plateau à risque élevé | Intervention pour sortir de la zone de risque',
            pattern: M,
            niveau: 2,
            couleur: '#ff9800',
            emoji: '🟠'
        };
    }

    // 6. Stable avec risque modéré = attention requise
    if (M === 'Stable' && indices.R >= seuilRisqueFaible) {
        return {
            cible: 'Plateau à risque modéré | Soutien préventif recommandé',
            pattern: M,
            niveau: 2,
            couleur: '#ffc107',
            emoji: '🟡'
        };
    }

    // 7. Stable (performance satisfaisante)
    if (M === 'Stable') {
        if (N === 'Aucun' && I >= 25) {
            return {
                cible: 'Pratique autonome → Explorer jumelage',
                pattern: M,
                niveau: 1,
                couleur: '#28a745',
                emoji: '🟢'
            };
        }
        if (N === 'Aucun' && I < 25) {
            return {
                cible: 'Suivi régulier | Performance stable',
                pattern: M,
                niveau: 1,
                couleur: '#28a745',
                emoji: '🟢'
            };
        }
        if (N === 'Structure' && I >= 21) {
            return {
                cible: 'Pratique autonome → Explorer structures originales',
                pattern: M,
                niveau: 1,
                couleur: '#28a745',
                emoji: '🟢'
            };
        }
        if (N === 'Rigueur' && I >= 21) {
            return {
                cible: 'Pratique autonome → Explorer pistes originales',
                pattern: M,
                niveau: 1,
                couleur: '#28a745',
                emoji: '🟢'
            };
        }
        if (N === 'Plausibilité' && I >= 21) {
            return {
                cible: 'Pratique autonome → Explorer hypothèses originales',
                pattern: M,
                niveau: 1,
                couleur: '#28a745',
                emoji: '🟢'
            };
        }
        if (N === 'Nuance' && I >= 21) {
            return {
                cible: 'Pratique autonome → Explorer interprétations originales',
                pattern: M,
                niveau: 1,
                couleur: '#28a745',
                emoji: '🟢'
            };
        }
        if (N === 'Français' && I >= 21) {
            return {
                cible: 'Pratique autonome → Explorer style',
                pattern: M,
                niveau: 1,
                couleur: '#28a745',
                emoji: '🟢'
            };
        }
    }

    // 6. Cas de risque de démotivation (mobilisation fragile ou défavorable)
    if (E.includes('fragile') || E.includes('critique')) {
        return {
            cible: 'Risque de démotivation',
            pattern: M,
            niveau: 2,
            couleur: '#ff9800',
            emoji: '⚠️'
        };
    }

    // Défaut : à clarifier
    return {
        cible: 'À clarifier en rencontre individuelle',
        pattern: M,
        niveau: 1,
        couleur: '#666',
        emoji: '💬'
    };
}

/**
 * Génère le HTML du diagnostic des forces et défis par critère SRPNF
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML du diagnostic
 */
function genererDiagnosticCriteres(da) {
    // NOUVEAU Beta 90 : Utiliser la pratique active
    const pratique = typeof obtenirPratiqueActive === 'function' ? obtenirPratiqueActive() : null;

    if (!pratique) {
        console.error('[ProfilEtudiant] Aucune pratique active trouvée');
        return '';
    }

    // Obtenir les défis selon la pratique
    const defisInfo = pratique.detecterDefis(da);

    console.log('🎯 Diagnostic défis pour DA:', da);
    console.log('  Type:', defisInfo.type);
    console.log('  Nombre de défis:', defisInfo.defis?.length || 0);

    // Si aucune donnée, ne rien afficher
    if (!defisInfo || (!defisInfo.defis && !defisInfo.forces)) {
        console.log('  ⚠️ Pas de données disponibles - diagnostic non affiché');
        return '';
    }

    // Adapter l'affichage selon le type de pratique
    if (defisInfo.type === 'srpnf') {
        return genererDiagnosticSRPNF(da, defisInfo);
    } else if (defisInfo.type === 'generique') {
        return genererDiagnosticGenerique(da, defisInfo);
    }

    return '';
}

/**
 * Génère le diagnostic SRPNF (PAN-Standards)
 */
function genererDiagnosticSRPNF(da, defisInfo) {
    // Recalculer moyennes pour l'affichage détaillé (compatibilité)
    const moyennes = calculerMoyennesCriteres(da);

    if (!moyennes) {
        return '';
    }

    const diagnostic = defisInfo; // Utiliser les défis de la pratique
    console.log('  Forces:', diagnostic.forces.length);
    console.log('  Défis:', diagnostic.defis.length);

    // Fonction helper pour obtenir la couleur selon le score
    const obtenirCouleurScore = (score) => {
        if (score >= 0.85) return '#2196F3'; // Bleu
        if (score >= 0.75) return '#28a745'; // Vert
        if (score >= 0.7125) return '#28a745'; // Vert (force)
        if (score >= 0.65) return '#ffc107'; // Jaune
        return '#ff9800'; // Orange
    };

    return `
        <!-- DIAGNOSTIC CRITÈRES SRPNF -->
        <h4 class="profil-titre-bleu-mt20">
            🎯 Diagnostic par critère (seuil force: 0.7125)
        </h4>

        <!-- Tableau des scores par critère -->
        <div class="profil-carte-simple">
            <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 10px; font-size: 0.9rem;">
                ${['structure', 'rigueur', 'plausibilite', 'nuance', 'francais'].map(cle => {
                    const nomCritere = cle === 'structure' ? 'Structure' :
                                     cle === 'rigueur' ? 'Rigueur' :
                                     cle === 'plausibilite' ? 'Plausibilité' :
                                     cle === 'nuance' ? 'Nuance' : 'Français';
                    const score = moyennes[cle];

                    if (score === null) return '';

                    const pourcentage = Math.round(score * 100);
                    const couleur = obtenirCouleurScore(score);
                    const estForce = score >= 0.7125;
                    const estDefi = score < 0.7125;

                    return `
                        <div style="font-weight: 500; color: #555;">${nomCritere}</div>
                        <div class="u-text-center">
                            <span style="display: inline-block; min-width: 50px; padding: 4px 10px;
                                         background: ${couleur}22; color: ${couleur};
                                         border-radius: 4px; font-weight: bold;">
                                ${pourcentage}%
                            </span>
                        </div>
                        <div style="text-align: right; font-size: 0.85rem; color: ${estForce ? '#28a745' : estDefi ? '#ff9800' : '#666'};">
                            ${estForce ? '✓ Force' : estDefi ? '⚠ Défi' : '—'}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- INDICE DE BLOCAGE -->
        ${(() => {
            const resultBlocage = calculerIndiceBlocage(moyennes);
            if (resultBlocage === null) return '';

            const interpBlocage = interpreterIndiceBlocage(resultBlocage.score);
            const pourcentageBlocage = Math.round(resultBlocage.score * 100);

            // Construire l'affichage de la formule selon les critères disponibles
            let formuleDetail = '';
            let formuleTexte = '';
            const parts = [];

            if (moyennes.structure !== null) {
                parts.push(`0.35 × ${Math.round(moyennes.structure * 100)}%`);
            }
            if (moyennes.francais !== null) {
                parts.push(`0.35 × ${Math.round(moyennes.francais * 100)}%`);
            }
            if (moyennes.rigueur !== null) {
                parts.push(`0.30 × ${Math.round(moyennes.rigueur * 100)}%`);
            }

            formuleDetail = parts.join(' + ');
            formuleTexte = resultBlocage.partiel
                ? '0.35 × Structure + 0.35 × Français + 0.30 × Rigueur (pondération ajustée)'
                : '0.35 × Structure + 0.35 × Français + 0.30 × Rigueur';

            return `
                <div style="background: linear-gradient(to right, ${interpBlocage.couleur}22, ${interpBlocage.couleur}11);
                            border-left: 4px solid ${interpBlocage.couleur};
                            padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                    <div class="u-flex-between-mb10">
                        <h4 style="color: ${interpBlocage.couleur}; margin: 0; font-size: 1rem;">
                            Indice de Blocage ${resultBlocage.partiel ? '(partiel)' : ''}
                        </h4>
                        <div style="font-size: 1.5rem; font-weight: bold; color: ${interpBlocage.couleur};">
                            ${pourcentageBlocage}%
                        </div>
                    </div>
                    ${resultBlocage.partiel ? `
                        <div style="background: #fff3cd; padding: 8px; margin-bottom: 10px; border-left: 3px solid #ffc107;">
                            <div style="font-size: 0.85rem; color: #856404;">
                                ⚠️ <strong>Calcul partiel :</strong> ${resultBlocage.criteresManquants.join(', ')} non évalué(s).
                                La pondération a été ajustée automatiquement.
                            </div>
                        </div>
                    ` : ''}
                    <div style="background: white; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">
                            <strong>Formule :</strong> ${formuleTexte}
                        </div>
                        <div class="profil-texte-detail-compact">
                            = ${formuleDetail} = <strong>${pourcentageBlocage}%</strong>
                        </div>
                    </div>
                    <div style="font-weight: bold; color: ${interpBlocage.couleur}; margin-bottom: 8px;">
                        ${interpBlocage.niveau}
                    </div>
                    <div style="color: #555; font-size: 0.9rem; line-height: 1.5;">
                        ${interpBlocage.description}
                    </div>
                </div>
            `;
        })()}

        <!-- Résumé forces et défis par niveau IDME -->
        ${(() => {
            // ✅ Extraire dynamiquement les critères depuis la grille de référence
            const grille = obtenirGrilleReferenceDepistage();
            if (!grille || !grille.criteres || grille.criteres.length === 0) {
                return `<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin-bottom: 10px;">
                    <div style="font-weight: bold; color: #856404;">⚠️ Aucune grille de référence configurée</div>
                </div>`;
            }

            const criteresDynamiques = grille.criteres.map(c => {
                const cleNormalisee = c.nom.toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '');
                return {
                    nom: c.nom,
                    score: diagnostic.moyennesCriteres?.[cleNormalisee] ?? 0
                };
            }).filter(c => c.score > 0); // Exclure les critères sans données

            // Grouper par niveau IDME
            const parNiveau = {
                'E': [],
                'M': [],
                'D': [],
                'I': []
            };

            criteresDynamiques.forEach(critere => {
                const pourcentage = critere.score * 100;
                const niveau = obtenirNiveauIDMEDepuisPourcentage(pourcentage);
                parNiveau[niveau].push({ ...critere, pourcentage });
            });

            let html = '';

            // Afficher Forces E (Étendu) - Bleu
            if (parNiveau['E'].length > 0) {
                const couleur = obtenirCouleurNiveauIDME('E');
                html += `
                    <div style="background: ${couleur}22; border-left: 4px solid ${couleur}; padding: 12px; margin-bottom: 10px;">
                        <div style="font-weight: bold; color: ${couleur}; margin-bottom: 6px;">
                            ⭐ ${parNiveau['E'].length > 1 ? 'Forces exceptionnelles (E)' : 'Force exceptionnelle (E)'}
                            ${parNiveau['E'].length > 1 ? ` (${parNiveau['E'].length})` : ''}
                        </div>
                        <div style="color: ${couleur}; font-size: 0.9rem;">
                            ${parNiveau['E'].map(c => `<strong>${c.nom}</strong> (${Math.round(c.pourcentage)}%)`).join(', ')}
                        </div>
                    </div>
                `;
            }

            // Afficher Forces M (Maîtrisé) - Vert
            if (parNiveau['M'].length > 0) {
                const couleur = obtenirCouleurNiveauIDME('M');
                html += `
                    <div style="background: ${couleur}22; border-left: 4px solid ${couleur}; padding: 12px; margin-bottom: 10px;">
                        <div style="font-weight: bold; color: ${couleur}; margin-bottom: 6px;">
                            ✓ ${parNiveau['M'].length > 1 ? 'Forces identifiées (M)' : 'Force identifiée (M)'}
                            ${parNiveau['M'].length > 1 ? ` (${parNiveau['M'].length})` : ''}
                        </div>
                        <div style="color: ${couleur}; font-size: 0.9rem;">
                            ${parNiveau['M'].map(c => `<strong>${c.nom}</strong> (${Math.round(c.pourcentage)}%)`).join(', ')}
                        </div>
                    </div>
                `;
            }

            // Afficher Défis D (Développement) - Orange
            if (parNiveau['D'].length > 0) {
                const couleur = obtenirCouleurNiveauIDME('D');
                html += `
                    <div style="background: ${couleur}22; border-left: 4px solid ${couleur}; padding: 12px; margin-bottom: 10px;">
                        <div style="font-weight: bold; color: ${couleur}; margin-bottom: 6px;">
                            🎯 ${parNiveau['D'].length > 1 ? 'Défis en développement (D)' : 'Défi en développement (D)'}
                            ${parNiveau['D'].length > 1 ? ` (${parNiveau['D'].length})` : ''}
                        </div>
                        <div style="color: ${couleur}; font-size: 0.9rem;">
                            ${parNiveau['D'].map(c => `<strong>${c.nom}</strong> (${Math.round(c.pourcentage)}%)`).join(', ')}
                        </div>
                    </div>
                `;
            }

            // Afficher Défis I (Insuffisant) - Rouge
            if (parNiveau['I'].length > 0) {
                const couleur = obtenirCouleurNiveauIDME('I');
                html += `
                    <div style="background: ${couleur}22; border-left: 4px solid ${couleur}; padding: 12px; margin-bottom: 15px;">
                        <div style="font-weight: bold; color: ${couleur}; margin-bottom: 6px;">
                            ⚠️ ${parNiveau['I'].length > 1 ? 'Défis critiques (I)' : 'Défi critique (I)'}
                            ${parNiveau['I'].length > 1 ? ` (${parNiveau['I'].length})` : ''}
                        </div>
                        <div style="color: ${couleur}; font-size: 0.9rem;">
                            ${parNiveau['I'].map(c => `<strong>${c.nom}</strong> (${Math.round(c.pourcentage)}%)`).join(', ')}
                        </div>
                        <div style="margin-top: 8px; font-size: 0.85rem; color: ${couleur};">
                            💡 Cibler les efforts sur ${parNiveau['I'].length > 1 ? 'ces critères' : 'ce critère'}
                            pour maximiser l'impact des interventions.
                        </div>
                    </div>
                `;
            }

            // Message si aucun critère avec données
            if (criteresDynamiques.length === 0) {
                html = `
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin-bottom: 10px;">
                        <div style="font-weight: bold; color: #856404;">
                            ⚠️ Aucune donnée disponible pour l'analyse des critères
                        </div>
                    </div>
                `;
            }

            return html;
        })()}
    `;
}

/**
 * Génère le diagnostic génériques (Sommative)
 */
function genererDiagnosticGenerique(da, defisInfo) {
    console.log('  Défis génériques:', defisInfo.defis.length);

    if (defisInfo.defis.length === 0 && !defisInfo.tendance) {
        return `
            <div style="background: linear-gradient(to right, #28a74522, #28a74511);
                        border-left: 4px solid #28a745; padding: 12px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: #155724;">
                    ✓ Aucun défi majeur identifié
                </div>
                <div style="color: #155724; font-size: 0.9rem; margin-top: 6px;">
                    Performance satisfaisante. Continuer le suivi régulier et encourager la constance.
                </div>
            </div>
        `;
    }

    let html = `
        <!-- DIAGNOSTIC DÉFIS GÉNÉRIQUES -->
        <h4 class="profil-titre-bleu-mt20">
            🎯 Défis identifiés
        </h4>
    `;

    // Afficher les défis
    defisInfo.defis.forEach(defi => {
        let couleur, titre, contenu;

        if (defi.type === 'note-faible') {
            couleur = defi.priorite === 'haute' ? '#dc3545' : '#ff9800';
            titre = `⚠️ Note faible : ${defi.production}`;
            contenu = `
                <div class="profil-texte-detail-gris">
                    Note obtenue : <strong style="color: ${couleur};">${defi.note}%</strong> (seuil : ${defi.seuil}%)
                </div>
                <div class="profil-texte-detail-compact">
                    💡 Recommandation : Envisager une reprise avec jeton ou un rattrapage ciblé.
                </div>
            `;
        } else if (defi.type === 'tendance-baisse') {
            couleur = '#ff9800';
            titre = '📉 Tendance à la baisse détectée';
            contenu = `
                <div class="profil-texte-detail-gris">
                    Variation : <strong style="color: ${couleur};">${defi.variation.toFixed(1)}%</strong>
                    <br>
                    Moyenne récente : ${defi.moyenneRecente.toFixed(1)}%
                    <br>
                    Moyenne ancienne : ${defi.moyenneAncienne.toFixed(1)}%
                </div>
                <div class="profil-texte-detail-compact">
                    💡 Recommandation : Identifier les causes de la baisse et ajuster les stratégies d'apprentissage.
                </div>
            `;
        } else if (defi.type === 'irregularite') {
            couleur = '#ffc107';
            titre = '📊 Irrégularité des résultats';
            contenu = `
                <div class="profil-texte-detail-gris">
                    Écart-type : <strong style="color: ${couleur};">${defi.ecartType.toFixed(1)}</strong>
                    <br>
                    Moyenne : ${defi.moyenne.toFixed(1)}%
                </div>
                <div class="profil-texte-detail-compact">
                    💡 Recommandation : Travailler la régularité et la constance dans les efforts.
                </div>
            `;
        }

        html += `
            <div style="background: linear-gradient(to right, ${couleur}22, ${couleur}11);
                        border-left: 4px solid ${couleur}; padding: 12px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: ${couleur}; margin-bottom: 6px;">
                    ${titre}
                </div>
                ${contenu}
            </div>
        `;
    });

    // Afficher tendance si disponible et pas déjà affichée
    if (defisInfo.tendance && !defisInfo.defis.find(d => d.type === 'tendance-baisse')) {
        const tendance = defisInfo.tendance;
        let couleurTendance, iconeTendance, texteTendance;

        if (tendance.direction === 'hausse') {
            couleurTendance = '#28a745';
            iconeTendance = '📈';
            texteTendance = 'Tendance à la hausse';
        } else if (tendance.direction === 'baisse') {
            couleurTendance = '#ff9800';
            iconeTendance = '📉';
            texteTendance = 'Tendance légère à la baisse';
        } else {
            couleurTendance = '#2196f3';
            iconeTendance = '→';
            texteTendance = 'Tendance stable';
        }

        html += `
            <div style="background: linear-gradient(to right, ${couleurTendance}22, ${couleurTendance}11);
                        border-left: 4px solid ${couleurTendance}; padding: 12px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: ${couleurTendance}; margin-bottom: 6px;">
                    ${iconeTendance} ${texteTendance}
                </div>
                <div style="font-size: 0.9rem; color: #555;">
                    Variation : ${tendance.variation > 0 ? '+' : ''}${tendance.variation.toFixed(1)}%
                    (${tendance.moyenneAncienne.toFixed(1)}% → ${tendance.moyenneRecente.toFixed(1)}%)
                </div>
            </div>
        `;
    }

    // Afficher statistiques si disponibles
    if (defisInfo.statistiques) {
        const stats = defisInfo.statistiques;
        html += `
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 10px;">
                <div style="font-weight: bold; color: var(--bleu-principal); margin-bottom: 8px;">
                    📊 Statistiques descriptives
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9rem;">
                    <div>Moyenne : <strong>${stats.moyenne.toFixed(1)}%</strong></div>
                    <div>Écart-type : <strong>${stats.ecartType.toFixed(1)}</strong></div>
                    <div>Minimum : <strong>${stats.min}%</strong></div>
                    <div>Maximum : <strong>${stats.max}%</strong></div>
                </div>
            </div>
        `;
    }

    return html;
}

/**
 * Génère le HTML de la section Performance (Portfolio) - VERSION CORRIGÉE
 *
 * CORRECTION : Ne compte QUE les artefacts réellement évalués
 * (au moins une évaluation existe pour cet artefact)
 *
 * COHÉRENCE avec calculerTauxCompletion() :
 * - Les deux fonctions utilisent maintenant la même logique
 * - Un artefact créé mais jamais évalué ne compte pas
 *
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionPerformance(da) {
    // ✨ NOUVEAU (7 déc 2025) : Graphique d'évolution des critères
    const canvasIdCriteres = `graphique-criteres-${da}`;
    let graphiqueCriteres = '';

    // 🐛 DEBUG (8 déc 2025) : Tracer exécution
    console.log(`[DEBUG Graphique Critères] DA: ${da}`);
    console.log(`[DEBUG Graphique Critères] Fonction creerGraphiqueCriteres existe: ${typeof creerGraphiqueCriteres === 'function'}`);

    // Vérifier si l'étudiant a des évaluations avec détails critères
    if (typeof creerGraphiqueCriteres === 'function') {
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        console.log(`[DEBUG Graphique Critères] Total évaluations: ${evaluations.length}`);

        const evaluationsAvecCriteres = evaluations.filter(e =>
            e.etudiantDA === da &&
            e.criteres &&
            Array.isArray(e.criteres) &&
            e.criteres.length > 0
        );
        console.log(`[DEBUG Graphique Critères] Évaluations avec critères: ${evaluationsAvecCriteres.length}`);

        if (evaluationsAvecCriteres.length > 0) {
            console.log(`[DEBUG Graphique Critères] Première évaluation critères:`, evaluationsAvecCriteres[0].criteres);
            graphiqueCriteres = `
                <div class="profil-zone-moyenne-bleu" style="margin-bottom: 20px;">
                    <!-- Canvas pour le graphique Chart.js -->
                    <div style="background: white; padding: 20px; border-radius: 6px; height: 450px;">
                        <canvas id="${canvasIdCriteres}"></canvas>
                    </div>

                    <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px; font-size: 0.85rem; color: #666;">
                        <strong>Conseil :</strong> Cliquez sur un critère dans la légende pour le masquer ou l'afficher.
                        Survolez les points pour voir les détails.
                    </div>
                </div>
            `;

            // Utiliser setTimeout pour créer le graphique après l'insertion du DOM
            setTimeout(() => {
                const canvas = document.getElementById(canvasIdCriteres);
                if (canvas) {
                    console.log(`[DEBUG Graphique Critères] Canvas trouvé, création du graphique...`);
                    creerGraphiqueCriteres(canvasIdCriteres, da);
                } else {
                    console.error(`[DEBUG Graphique Critères] Canvas #${canvasIdCriteres} introuvable dans le DOM`);
                }
            }, 100);
        } else {
            console.log(`[DEBUG Graphique Critères] Aucune évaluation avec critères, graphique non généré`);
        }
    } else {
        console.error(`[DEBUG Graphique Critères] Fonction creerGraphiqueCriteres non disponible`);
    }

    const productions = obtenirDonneesSelonMode('productions') || [];
    const portfolio = productions.find(p => p.type === 'portfolio');

    if (!portfolio) {
        return `
            <div class="text-muted profil-zone-centre-p30">
                <p>Aucun portfolio configuré</p>
            </div>
        `;
    }

    // Récupérer TOUS les artefacts créés
    const tousLesArtefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');
    
    if (tousLesArtefactsPortfolio.length === 0) {
        return `
            <div class="text-muted profil-zone-centre-p30">
                <p>📝 Aucun ${obtenirTermeProduction('singulier')} de portfolio créé</p>
            </div>
        `;
    }

    // ✅ CORRECTION : Identifier les artefacts RÉELLEMENT ÉVALUÉS
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productionsEvaluees = new Set();
    evaluations.forEach(evaluation => {
        productionsEvaluees.add(evaluation.productionId);
    });

    // ✅ Ne considérer QUE les artefacts qui ont été évalués (au moins 1 élève)
    const artefactsPortfolio = tousLesArtefactsPortfolio.filter(art => 
        productionsEvaluees.has(art.id)
    );

    // Récupérer les évaluations et sélections de l'élève
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);
    const selectionsPortfolios = obtenirDonneesSelonMode('portfoliosEleves') || {};
    const selectionEleve = selectionsPortfolios[da]?.[portfolio.id] || { artefactsRetenus: [] };

    // Construire la liste des artefacts (seulement ceux évalués)
    const artefacts = artefactsPortfolio.map(art => {
        const evaluation = evaluationsEleve.find(e => e.productionId === art.id);
        return {
            id: art.id,
            titre: art.titre,
            description: art.description || art.titre, // Utiliser description ou fallback sur titre
            remis: !!evaluation,
            note: evaluation?.noteFinale ?? null,  // Utiliser ?? pour supporter la note 0
            niveau: evaluation?.niveauFinal ?? null,
            retenu: selectionEleve.artefactsRetenus.includes(art.id)
        };
    }).sort((a, b) => {
        if (a.remis && !b.remis) return -1;
        if (!a.remis && b.remis) return 1;
        return a.description.localeCompare(b.description);
    });

    // ✨ SÉLECTION AUTOMATIQUE des meilleurs artefacts si aucune sélection manuelle
    const nombreARetenir = portfolio.regles.nombreARetenir || 3;
    if (selectionEleve.artefactsRetenus.length === 0) {
        const artefactsRemisAvecNote = artefacts
            .filter(a => a.remis && a.note !== null)
            .sort((a, b) => b.note - a.note);

        const meilleurs = artefactsRemisAvecNote.slice(0, nombreARetenir);

        if (meilleurs.length > 0) {
            selectionEleve.artefactsRetenus = meilleurs.map(a => a.id);

            if (!selectionsPortfolios[da]) {
                selectionsPortfolios[da] = {};
            }
            selectionsPortfolios[da][portfolio.id] = {
                artefactsRetenus: selectionEleve.artefactsRetenus,
                dateSelection: new Date().toISOString(),
                auto: true
            };
            db.setSync('portfoliosEleves', selectionsPortfolios);

            // 🔄 Recalculer les indices C et P après sélection automatique
            if (typeof calculerEtStockerIndicesCP === 'function') {
                calculerEtStockerIndicesCP();
            }

            // Mettre à jour le flag retenu
            artefacts.forEach(art => {
                art.retenu = selectionEleve.artefactsRetenus.includes(art.id);
            });
        }
    }

    const nbTotal = artefacts.length;  // ✅ Maintenant basé sur les artefacts ÉVALUÉS
    const nbRemis = artefacts.filter(a => a.remis).length;
    const nbRetenus = selectionEleve.artefactsRetenus.length;

    // NOUVEAU (Beta 90): Calcul dual pour mode comparatif
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};

    // ✅ CORRECTION (7 déc 2025): Vérifier explicitement === true pour éviter mode comparatif par défaut
    const afficherSom = affichage.afficherSommatif === true;
    const afficherPan = affichage.afficherAlternatif === true;
    const modeComparatif = afficherSom && afficherPan;

    // ✅ OPTIMISATION (7 déc 2025): Calculer uniquement la pratique active sauf en mode comparatif
    let indicesSOM, indicesPAN, indices;

    if (modeComparatif) {
        // Mode comparatif: calculer les deux pratiques
        indicesSOM = calculerTousLesIndices(da, 'SOM');
        indicesPAN = calculerTousLesIndices(da, 'PAN');
        indices = indicesSOM; // Pour compatibilité avec le code existant
    } else {
        // Mode normal: calculer seulement la pratique active
        indices = calculerTousLesIndices(da);

        // Assigner aux bonnes variables selon la pratique active
        if (config.pratique === 'sommative') {
            indicesSOM = indices;
            indicesPAN = { A: indices.A, C: 0, P: 0, M: 0, E: 0 }; // Valeurs nulles pour PAN
        } else {
            indicesPAN = indices;
            indicesSOM = { A: indices.A, C: 0, P: 0, M: 0, E: 0 }; // Valeurs nulles pour SOM
        }
    }

    // 🎯 UTILISER LES DONNÉES DE LA SOURCE UNIQUE (portfolio.js)
    let artefactsRetenus = [];
    let notesRetenues = [];
    let noteTop3 = null;
    let methodeSelection = 'meilleurs';  // Valeur par défaut
    let portfolioActif = true;
    let nombreARetenirConfig = nombreARetenir;  // Renommer pour éviter conflit avec ligne 5019

    if (typeof obtenirIndicesCP === 'function') {
        const indicesCP = obtenirIndicesCP(da, indices.pratique);
        if (indicesCP && indicesCP.details) {
            const idsRetenus = indicesCP.details.artefactsRetenus || [];
            notesRetenues = indicesCP.details.notes || [];

            // 🆕 LIRE LA CONFIGURATION DE LA PRATIQUE DE NOTATION
            methodeSelection = indicesCP.details.methodeSelection || 'meilleurs';
            portfolioActif = indicesCP.details.portfolioActif !== false;
            nombreARetenirConfig = indicesCP.details.nombreARetenir || nombreARetenir;

            // Récupérer les titres des artefacts retenus
            artefactsRetenus = idsRetenus.map(id => {
                const artefact = artefacts.find(a => a.id === id);
                const idx = idsRetenus.indexOf(id);
                return {
                    titre: artefact ? artefact.titre : 'Artefact inconnu',
                    note: notesRetenues[idx] || 0
                };
            });

            // Calculer la moyenne des notes retenues
            if (notesRetenues.length > 0) {
                const somme = notesRetenues.reduce((sum, note) => sum + note, 0);
                noteTop3 = (somme / notesRetenues.length).toFixed(1);
            }
        }
    }

    const selectionComplete = nbRetenus === portfolio.regles.nombreARetenir;

    // Interprétation Performance uniquement (C va dans Mobilisation)
    const interpP = interpreterPerformance(indices.P);

    // Déterminer les lettres IDME pour SOM et PAN
    const determinerLettreIDME = (P) => {
        if (P >= 85) return 'E';
        if (P >= 75) return 'M';
        if (P >= 65) return 'D';
        return 'I';
    };

    const lettreIDME_SOM = determinerLettreIDME(indicesSOM.P);
    const lettreIDME_PAN = determinerLettreIDME(indicesPAN.P);

    // Pour compatibilité avec le code existant
    const lettreIDME = modeComparatif ? lettreIDME_SOM : determinerLettreIDME(indices.P);

    // Calculer moyennes des critères pour badges
    const moyennes = calculerMoyennesCriteres(da);
    const diagnostic = diagnostiquerForcesChallenges(moyennes);

    // Fonction helper pour couleur du badge
    const obtenirCouleurBadge = (score) => {
        if (score >= 0.7125) return '#28a745'; // Vert - Force
        if (score >= 0.60) return '#ffc107'; // Jaune - Défi modéré
        if (score >= 0.50) return '#ff9800'; // Orange - Défi important
        return '#dc3545'; // Rouge - Défi critique
    };

    return `
        <!-- Détails des calculs (masqué par défaut) - AFFICHÉ EN HAUT -->
        <div id="details-calculs-performance-${da}" class="carte-info-toggle carte-info-note u-hide">
            <strong>Méthodologie de calcul</strong>
            <br><br>
            <strong>Pratique de notation active :</strong> ${indices.pratique === 'PAN' ? 'PAN (Portfolio à nombre limité)' : 'SOM (Sommative provisoire)'}
            <br><br>
            <strong>Règle de sélection :</strong> ${(() => {
                if (!portfolioActif) {
                    return 'Portfolio désactivé — Les productions sont évaluées de manière indépendante';
                }
                const textes = {
                    'meilleurs': `Les <strong>${nombreARetenirConfig} meilleures productions</strong> sont retenues pour le calcul de l'indice P (note maximale atteinte)`,
                    'recents': `Les <strong>${nombreARetenirConfig} plus récentes productions</strong> sont retenues pour le calcul de l'indice P (niveau terminal actuel)`,
                    'recents-meilleurs': `Les <strong>${nombreARetenirConfig} plus récentes productions parmi les 50% meilleures</strong> sont retenues pour le calcul de l'indice P (approche hybride)`,
                    'tous': `<strong>Toutes les productions</strong> sont retenues pour le calcul de l'indice P (calcul de type sommative)`
                };
                return textes[methodeSelection] || textes['meilleurs'];
            })()}
            <br><br>
            <strong>${obtenirTermeProduction('pluriel', true)} retenus :</strong> ${artefactsRetenus.length > 0 ? artefactsRetenus.map((art, idx) =>
                `${idx + 1}. ${art.description} → ${art.note.toFixed(1)}/100`
            ).join(' • ') : 'Aucun artefact évalué'}
            <br><br>
            <strong>Calcul de l'indice P :</strong> ${artefactsRetenus.length > 0 ? `
                Moyenne des ${artefactsRetenus.length} ${obtenirTermeProduction(artefactsRetenus.length > 1 ? 'pluriel' : 'singulier')} retenu${artefactsRetenus.length > 1 ? 's' : ''} — P = (${notesRetenues.map(n => n.toFixed(1)).join(' + ')}) / ${artefactsRetenus.length} = <strong>${indices.P}%</strong>
            ` : 'Calcul impossible : aucune évaluation disponible'}
            <br><br>
            <strong>Calcul de la note de chaque ${obtenirTermeProduction('singulier')} :</strong> ${(() => {
                const grilles = db.getSync('grillesTemplates', []);
                const grilleActive = grilles.find(g => g.active) || grilles[0];
                if (grilleActive && grilleActive.criteres) {
                    const ponderations = grilleActive.criteres
                        .map(c => `${c.nom}: ${c.ponderation || 0}%`)
                        .join(', ');
                    return `Pondération des critères configurés dans la grille «${grilleActive.nom}» (${ponderations})`;
                }
                return 'Pondération des critères déterminée dans les réglages';
            })()}${selectionEleve.auto ? '<br><br><strong>Note :</strong> Sélection automatique basée sur les meilleures notes' : ''}
        </div>

        <!-- ENCADRÉ UNIQUE: DÉVELOPPEMENT DES HABILETÉS ET COMPÉTENCES -->
        <div class="profil-carte-bordure-blanche">

            <!-- En-tête avec indice P -->
            <div class="u-flex-between-mb15">
                ${modeComparatif ? `
                    <div class="profil-flex-gap15-baseline" style="margin-left: auto;">
                        <strong class="profil-valeur-grande-orange">${lettreIDME_SOM} ${indicesSOM.P}%</strong>
                        <strong class="profil-valeur-grande-bleu-std">${lettreIDME_PAN} ${indicesPAN.P}%</strong>
                    </div>
                ` : `
                    <strong class="profil-valeur-grande-bleu" style="margin-left: auto;">${lettreIDME} ${indices.P}%</strong>
                `}
            </div>

            <!-- 🆕 MÉTHODE DE CALCUL EXPLICITE -->
            <ul class="profil-liste-simple" style="margin-bottom: 15px;">
                <li><strong>• ${(() => {
                    if (!portfolioActif) {
                        return 'Performance des productions indépendantes';
                    }

                    // Textes selon la modalité de sélection (format uniforme avec section Engagement)
                    const textesPerformance = {
                        'meilleurs': `Performance du portfolio actuel (${nombreARetenirConfig} meilleur${nombreARetenirConfig > 1 ? 's' : ''}, maîtrise de standards)`,
                        'recents': `Performance du portfolio actuel (${nombreARetenirConfig} plus récent${nombreARetenirConfig > 1 ? 's' : ''}, niveau terminal)`,
                        'recents-meilleurs': `Performance du portfolio actuel (${nombreARetenirConfig} récent${nombreARetenirConfig > 1 ? 's' : ''} parmi les meilleurs, hybride)`,
                        'tous': `Performance du portfolio actuel (tous les ${obtenirTermeProduction('pluriel')}, moyenne complète)`
                    };

                    return textesPerformance[methodeSelection] || textesPerformance['meilleurs'];
                })()}</strong></li>
            </ul>

            <hr class="profil-separateur">

            <!-- ✨ NOUVEAU (7 déc 2025) : Graphique d'évolution des critères -->
            ${graphiqueCriteres}

            <!-- Diagnostic SRPNF -->
            <div class="section-titre">
                Forces et défis parmi les critères
            </div>
            <div style="margin: 20px 0;">
                ${(() => {
                    // Récupérer les couleurs depuis l'échelle configurée (localStorage)
                    const echelles = db.getSync('echellesTemplates', []);
                    const echelleActive = echelles.find(e => e.active) || echelles[0];

                    // Couleurs par défaut IDME (si aucune échelle configurée)
                    let niveaux = [
                        { code: 'I', nom: 'Incomplet', min: 0, max: 64, couleur: '#ff9800' },
                        { code: 'D', nom: 'Développement', min: 65, max: 74, couleur: '#ffc107' },
                        { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, couleur: '#28a745' },
                        { code: 'E', nom: 'Étendu', min: 85, max: 100, couleur: '#2196F3' }
                    ];

                    // Utiliser les niveaux de l'échelle active si disponible
                    if (echelleActive && echelleActive.niveaux) {
                        niveaux = echelleActive.niveaux.map(n => ({
                            code: n.code,
                            nom: n.nom,
                            min: n.min,
                            max: n.max,
                            couleur: n.couleur
                        }));
                    }

                    // Générer le gradient CSS basé sur les niveaux avec transitions douces
                    const gradientStops = [];
                    niveaux.forEach((niveau, i) => {
                        if (i === 0) {
                            // Premier niveau : début jusqu'à 2% avant la prochaine jonction
                            gradientStops.push(`${niveau.couleur} ${niveau.min}%`);
                            if (i < niveaux.length - 1) {
                                const nextMin = niveaux[i + 1].min;
                                gradientStops.push(`${niveau.couleur} ${nextMin - 2}%`);
                            } else {
                                gradientStops.push(`${niveau.couleur} ${niveau.max}%`);
                            }
                        } else if (i === niveaux.length - 1) {
                            // Dernier niveau : 2% après la jonction précédente jusqu'à la fin
                            gradientStops.push(`${niveau.couleur} ${niveau.min + 2}%`);
                            gradientStops.push(`${niveau.couleur} ${niveau.max}%`);
                        } else {
                            // Niveaux intermédiaires : 2% après jonction précédente, 2% avant jonction suivante
                            gradientStops.push(`${niveau.couleur} ${niveau.min + 2}%`);
                            const nextMin = niveaux[i + 1].min;
                            gradientStops.push(`${niveau.couleur} ${nextMin - 2}%`);
                        }
                    });

                    const gradientCSS = `linear-gradient(to right, ${gradientStops.join(', ')})`;

                    // Détecter le mode comparatif
                    const config = db.getSync('modalitesEvaluation', {});
                    const affichage = config.affichageTableauBord || {};
                    const afficherSom = affichage.afficherSommatif !== false;
                    const afficherPan = affichage.afficherAlternatif !== false;
                    const modeComparatif = afficherSom && afficherPan;

                    console.log('🔍 DEBUG BARRES SRPNF - Mode comparatif');
                    console.log('  config:', config);
                    console.log('  affichage:', affichage);
                    console.log('  afficherSom:', afficherSom);
                    console.log('  afficherPan:', afficherPan);
                    console.log('  modeComparatif:', modeComparatif);

                    // Calculer moyennes et directions pour SOM et PAN si en mode comparatif
                    let moyennesSOM = null;
                    let moyennesPAN = null;
                    let directionsSOM = null;
                    let directionsPAN = null;

                    if (modeComparatif) {
                        console.log('  ✅ Mode comparatif activé - calcul des deux pratiques');

                        // SOM : Calculer sur TOUTES les évaluations (sans filtre)
                        moyennesSOM = calculerMoyennesCriteres(da);
                        directionsSOM = calculerDirectionsCriteres(da, 'SOM');

                        // PAN : Utiliser la méthode de la pratique PAN-Standards (N derniers artefacts)
                        const pratiquePAN = obtenirPratiqueParId('pan-standards');
                        if (pratiquePAN && typeof pratiquePAN._calculerMoyennesCriteresRecents === 'function') {
                            moyennesPAN = pratiquePAN._calculerMoyennesCriteresRecents(da);
                        } else {
                            console.warn('  ⚠️ Pratique PAN-Standards non disponible ou méthode _calculerMoyennesCriteresRecents absente');
                            moyennesPAN = null;
                        }
                        directionsPAN = calculerDirectionsCriteres(da, 'PAN');

                        console.log('  moyennesSOM (toutes):', moyennesSOM);
                        console.log('  moyennesPAN (N derniers):', moyennesPAN);
                        console.log('  directionsSOM:', directionsSOM);
                        console.log('  directionsPAN:', directionsPAN);
                    } else {
                        console.log('  ❌ Mode comparatif NON activé');
                        // Mode normal : calculer les moyennes et utiliser les directions PAN par défaut
                        moyennesPAN = calculerMoyennesCriteres(da);
                        directionsPAN = calculerDirectionsCriteres(da, 'PAN');
                    }

                    // Utiliser les moyennes appropriées selon le mode
                    const moyennes = modeComparatif ? moyennesSOM : moyennesPAN;

                    // Générer les barres pour chaque critère
                    const barresHTML = ['structure', 'rigueur', 'plausibilite', 'nuance', 'francais'].map(cle => {
                        const nomCritere = cle === 'structure' ? 'Structure' :
                                         cle === 'rigueur' ? 'Rigueur' :
                                         cle === 'plausibilite' ? 'Plausibilité' :
                                         cle === 'nuance' ? 'Nuance' : 'Français';

                        // ✅ CORRECTIF: Utiliser la clé en minuscules (structure, rigueur, etc.)
                        const score = moyennes?.[cle];
                        // Vérifier que score est un nombre valide (pas null, undefined, ou NaN)
                        if (typeof score !== 'number' || isNaN(score)) return '';

                        const pourcentage = Math.round(score * 100);

                        // En mode comparatif, afficher deux points
                        let pointsHTML = '';
                        let valeursHTML = '';
                        let symbolesHTML = '';

                        if (modeComparatif) {
                            // Vérifier si les moyennes existent avant d'accéder à leurs propriétés
                            // ✅ CORRECTIF: Utiliser la clé en minuscules (cle au lieu de cleMoyennes)
                            const scoreSOM = moyennesSOM?.[cle];
                            const scorePAN = moyennesPAN?.[cle];
                            // Vérifier que les scores sont des nombres valides
                            const pourcentageSOM = (typeof scoreSOM === 'number' && !isNaN(scoreSOM)) ? Math.round(scoreSOM * 100) : null;
                            const pourcentagePAN = (typeof scorePAN === 'number' && !isNaN(scorePAN)) ? Math.round(scorePAN * 100) : null;

                            // Si aucun score valide en mode comparatif, ne pas afficher cette barre
                            if (pourcentageSOM === null && pourcentagePAN === null) return '';

                            // Obtenir les directions pour SOM et PAN
                            const directionSOM = directionsSOM ? directionsSOM[cle] : null;
                            const directionPAN = directionsPAN ? directionsPAN[cle] : null;
                            const symboleSOM = directionSOM && directionSOM.symbole ? directionSOM.symbole : '';
                            const symbolePAN = directionPAN && directionPAN.symbole ? directionPAN.symbole : '';

                            // Points colorés
                            pointsHTML = `
                                ${pourcentageSOM !== null ? `<div class="critere-point critere-point-som" style="left: ${Math.min(pourcentageSOM, 100)}%;"></div>` : ''}
                                ${pourcentagePAN !== null ? `<div class="critere-point critere-point-std" style="left: ${Math.min(pourcentagePAN, 100)}%;"></div>` : ''}
                            `;

                            // Symboles de direction au-dessus des points
                            symbolesHTML = `
                                ${symboleSOM && pourcentageSOM !== null ? `<div style="position: absolute; left: ${Math.min(pourcentageSOM, 100)}%; transform: translateX(-50%); top: -32px; font-size: 1.2rem; font-weight: bold; color: var(--som-orange);" title="SOM: ${directionSOM.interpretation}">${symboleSOM}</div>` : ''}
                                ${symbolePAN && pourcentagePAN !== null ? `<div style="position: absolute; left: ${Math.min(pourcentagePAN, 100)}%; transform: translateX(-50%); top: -32px; font-size: 1.2rem; font-weight: bold; color: var(--std-bleu);" title="PAN: ${directionPAN.interpretation}">${symbolePAN}</div>` : ''}
                            `;

                            // Affichage des valeurs duales
                            valeursHTML = `
                                <span style="display: flex; gap: 8px; align-items: center;">
                                    ${pourcentageSOM !== null ? `<span style="color: var(--som-orange); font-weight: 600;">${pourcentageSOM}%</span>` : ''}
                                    ${pourcentageSOM !== null && pourcentagePAN !== null ? `<span style="color: #999;">|</span>` : ''}
                                    ${pourcentagePAN !== null ? `<span style="color: var(--std-bleu); font-weight: 600;">${pourcentagePAN}%</span>` : ''}
                                </span>
                            `;
                        } else {
                            // Mode normal : utiliser les directions PAN
                            const direction = directionsPAN ? directionsPAN[cle] : null;
                            const symboleDirection = direction && direction.symbole ? direction.symbole : '';

                            pointsHTML = `<div class="critere-point" style="left: ${Math.min(pourcentage, 100)}%;"></div>`;
                            valeursHTML = `${pourcentage}%`;
                            symbolesHTML = symboleDirection ? `<div style="position: absolute; left: ${Math.min(pourcentage, 100)}%; transform: translateX(-50%); top: -32px; font-size: 1.2rem; font-weight: bold; color: #333;" title="${direction.interpretation}">${symboleDirection}</div>` : '';
                        }

                        return `
                            <div class="critere-container">
                                <div class="critere-header">
                                    <span class="critere-nom" style="min-width: 120px;">${nomCritere}</span>
                                    <span class="critere-valeur" style="margin-left: auto; font-weight: 600;">
                                        ${valeursHTML}
                                    </span>
                                </div>
                                <div class="critere-barre-gradient" style="background: ${gradientCSS};">
                                    ${symbolesHTML}
                                    ${pointsHTML}
                                </div>
                            </div>
                        `;
                    }).join('');

                    // Calculer les positions de légende (centres des zones)
                    const legendePositions = niveaux.map(niveau => {
                        const centre = (niveau.min + niveau.max) / 2;
                        return { ...niveau, position: centre };
                    });

                    // Générer la légende
                    const legendeHTML = `
                        <div class="legende-idme-container">
                            ${legendePositions.map(item => `
                                <div class="legende-idme-item" style="left: ${item.position}%; color: ${item.couleur};">
                                    <span class="legende-idme-code">${item.code}</span>
                                    <span class="legende-idme-nom">${item.nom}</span>
                                </div>
                            `).join('')}
                        </div>
                    `;

                    // Si aucune barre n'est générée, afficher un message informatif
                    if (!barresHTML || barresHTML.trim() === '') {
                        // Vérifier la raison : pas de grille OU pas d'évaluations
                        const grilleRef = obtenirGrilleReferenceDepistage();

                        if (!grilleRef) {
                            return `
                                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px;">
                                    <div style="display: flex; gap: 10px; align-items: start;">
                                        <span style="font-size: 1.3rem;">⚙️</span>
                                        <div style="flex: 1;">
                                            <strong style="color: #856404; display: block; margin-bottom: 5px;">Configuration requise</strong>
                                            <p style="margin: 0; color: #856404; font-size: 0.9rem; line-height: 1.5;">
                                                Pour afficher les forces et défis par critère, vous devez configurer une grille de référence dans
                                                <strong>Réglages → Pratique de notation → Grille de référence pour le dépistage</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            `;
                        } else {
                            return `
                                <div style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 15px 0; border-radius: 4px;">
                                    <div style="display: flex; gap: 10px; align-items: start;">
                                        <span style="font-size: 1.3rem;">📝</span>
                                        <div style="flex: 1;">
                                            <strong style="color: #0c5460; display: block; margin-bottom: 5px;">Aucune donnée disponible</strong>
                                            <p style="margin: 0; color: #0c5460; font-size: 0.9rem; line-height: 1.5;">
                                                Cet·te étudiant·e n'a pas encore d'évaluations complétées avec des critères correspondant à la grille de référence.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    }

                    return barresHTML + legendeHTML;
                })()}
            </div>

    </div>
    `;
}

/**
 * Génère le HTML de la section assiduité - VERSION CSS NATIVE
 */
function genererSectionAssiduite(da) {
    const details = obtenirDetailsAssiduite(da);
    const taux = details.heuresOffertes > 0
        ? (details.heuresPresentes / details.heuresOffertes * 100).toFixed(1)
        : 0;

    // Interprétation de l'assiduité
    const interpA = interpreterAssiduite(parseFloat(taux));
    const indices = calculerTousLesIndices(da);

    return `
        <!-- ENCADRÉ UNIQUE: ASSIDUITÉ -->
        <div class="profil-carte-bordure-blanche">

            <h3 class="profil-titre-section-majeur">
                👥 ASSIDUITÉ
            </h3>

            <!-- Badge avec interprétation -->
            <div class="u-mb-15">
                <span class="profil-valeur-moyenne">${interpA.emoji}</span>
                <strong style="font-size: 1.1rem; color: ${interpA.couleur};">${interpA.niveau}</strong>
                <span style="font-size: 1.3rem; font-weight: bold; color: ${interpA.couleur}; margin-left: 10px;">(${taux}%)</span>
            </div>

            <!-- Statistiques -->
            <ul class="profil-liste-simple">
                <li><strong>• Heures présentes :</strong> ${details.heuresPresentes}h / ${details.heuresOffertes}h</li>
            </ul>

            <hr class="profil-separateur">

            <!-- Liste des absences et retards -->
            <h4 class="profil-titre-sous-section">
                ${details.absences.length} ABSENCE${details.absences.length > 1 ? 'S' : ''} OU RETARD${details.absences.length > 1 ? 'S' : ''}
            </h4>
            ${details.absences.length > 0 ? `
                <div class="badges-centres u-mb-20">
                    ${details.absences.map(abs => {
                        const date = new Date(abs.date + 'T12:00:00');
                        const options = { weekday: 'short', day: 'numeric', month: 'short' };
                        const dateFormatee = date.toLocaleDateString('fr-CA', options);
                        const estAbsenceComplete = abs.heuresPresence === 0;
                        const classeBadge = estAbsenceComplete ? 'badge-absence-complete' : 'badge-absence-partielle';

                        return `
                            <div class="badge-absence ${classeBadge}"
                                 onclick="naviguerVersPresenceAvecDate('${abs.date}')">
                                <span class="badge-absence-date">
                                    ${dateFormatee}
                                </span>
                                <span class="badge-absence-heures">
                                    ${estAbsenceComplete
                                        ? `${abs.heuresManquees}/${abs.heuresPresence + abs.heuresManquees}`
                                        : `${abs.heuresPresence}/${abs.heuresPresence + abs.heuresManquees}`
                                    }
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : `
                <div class="profil-message-tous-remis u-mb-20">
                    Assiduité parfaite !
                </div>
            `}

            <hr class="profil-separateur">

            <!-- Placeholder graphique (en conclusion) -->
            <div style="background: var(--bleu-tres-pale); border: 2px dashed var(--bleu-pale); border-radius: 8px;
                        padding: 30px 20px; text-align: center; color: var(--bleu-moyen); font-style: italic;">
                📈 Évolution temporelle de l'assiduité (à venir)
            </div>

        </div>
    `;
}

/**
 * Navigue vers la section Présences › Saisie avec une date pré-sélectionnée
 * @param {string} dateStr - Date au format YYYY-MM-DD
 */
function naviguerVersPresenceAvecDate(dateStr) {
    console.log('🔀 Navigation vers Présences › Saisie avec date:', dateStr);

    // 1. Afficher la section Présences
    if (typeof afficherSection === 'function') {
        afficherSection('presences');
    }

    // 2. Afficher la sous-section Saisie
    if (typeof afficherSousSection === 'function') {
        afficherSousSection('presences-saisie');
    }

    // 3. Attendre que le DOM soit mis à jour, puis pré-sélectionner la date
    setTimeout(() => {
        const inputDate = document.getElementById('date-cours');
        if (inputDate) {
            inputDate.value = dateStr;

            // Déclencher l'événement change pour charger le tableau de cette date
            const event = new Event('change', { bubbles: true });
            inputDate.dispatchEvent(event);

            console.log('✅ Date pré-sélectionnée:', dateStr);

            // Scroll vers le haut pour voir le formulaire
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.error('❌ Input #date-cours introuvable');
        }
    }, 300);
}

/**
 * Formate une date ISO en format court lisible (ex: "Lun 21 oct. 2024")
 * @param {string} dateISO - Date au format YYYY-MM-DD
 * @returns {string} - Date formatée
 */
function formaterDateCourte(dateISO) {
    if (!dateISO) return 'N/A';
    const date = new Date(dateISO + 'T12:00:00');
    const options = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    };
    return date.toLocaleDateString('fr-CA', options);
}

/**
 * Réattache les événements des toggles emoji après chargement dynamique
 * NÉCESSAIRE car le contenu est inséré via innerHTML
 */
function reattacherEvenementsToggles() {
    const emojiToggles = document.querySelectorAll('.emoji-toggle');

    emojiToggles.forEach(emoji => {
        // Retirer les anciens événements (éviter les doublons)
        const newEmoji = emoji.cloneNode(true);
        emoji.parentNode.replaceChild(newEmoji, emoji);

        // Ajouter le nouvel événement
        newEmoji.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Récupérer l'ID de la cible depuis l'attribut data-target
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Toggle la visibilité
                if (targetElement.style.display === 'none' || targetElement.style.display === '') {
                    targetElement.style.display = 'block';
                } else {
                    targetElement.style.display = 'none';
                }
            }
        });
    });

    console.log(`✅ ${emojiToggles.length} toggles emoji réattachés`);
}

/* ===============================
   📌 SECTIONS À DÉVELOPPER
   =============================== */

// TODO: Ajouter fonction afficherIndicesACP(da)
// TODO: Ajouter fonction afficherHistoriqueAssiduité(da)
// TODO: Ajouter fonction afficherGraphiquesProgression(da)
// TODO: Ajouter fonction afficherEvaluationsDetaillees(da)

/**
 * Toggle l'affichage d'une section détaillée
 * @param {string} sectionId - ID de la section à afficher/cacher
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const isVisible = section.style.display !== 'none';
        section.style.display = isVisible ? 'none' : 'block';

        // Changer l'icône du titre
        const titre = section.previousElementSibling;
        if (titre) {
            titre.textContent = titre.textContent.replace(
                isVisible ? '▼' : '▶',
                isVisible ? '▶' : '▼'
            );
        }
    }
}

/**
 * Naviguer vers une nouvelle intervention depuis le profil étudiant
 */
function naviguerVersNouvelleIntervention() {
    // Naviguer vers la section
    afficherSection('tableau-bord');
    afficherSousSection('tableau-bord-interventions');

    // Attendre que le conteneur soit prêt
    const checkConteneur = setInterval(() => {
        const conteneur = document.getElementById('conteneurPrincipal');
        if (conteneur && conteneur.innerHTML.trim() !== '') {
            clearInterval(checkConteneur);
            afficherFormulaireIntervention();
        }
    }, 50); // Vérifier toutes les 50ms

    // Timeout de sécurité (2 secondes max)
    setTimeout(() => clearInterval(checkConteneur), 2000);
}

/**
 * Naviguer vers une intervention existante depuis le profil étudiant
 * @param {string} interventionId - ID de l'intervention à ouvrir
 */
function naviguerVersIntervention(interventionId) {
    // Naviguer vers la section
    afficherSection('tableau-bord');
    afficherSousSection('tableau-bord-interventions');

    // Attendre que le conteneur soit prêt
    const checkConteneur = setInterval(() => {
        const conteneur = document.getElementById('conteneurPrincipal');
        if (conteneur && conteneur.innerHTML.trim() !== '') {
            clearInterval(checkConteneur);
            ouvrirIntervention(interventionId);
        }
    }, 50); // Vérifier toutes les 50ms

    // Timeout de sécurité (2 secondes max)
    setTimeout(() => clearInterval(checkConteneur), 2000);
}

/* ===============================
   📌 EXPORTS (accessibles globalement)
   =============================== */

// Les fonctions sont automatiquement disponibles globalement
// car non encapsulées dans un module ES6
window.naviguerVersNouvelleIntervention = naviguerVersNouvelleIntervention;
window.naviguerVersIntervention = naviguerVersIntervention;

/* ===============================
   🔄 RECHARGEMENT AUTOMATIQUE
   =============================== */

/**
 * Surveille l'activation de la sous-section 'tableau-bord-profil'
 * et recharge automatiquement le profil pour refléter les changements
 * faits depuis d'autres sections (ex: modifications d'interventions RàI)
 */
document.addEventListener('DOMContentLoaded', function() {
    const sectionProfil = document.getElementById('tableau-bord-profil');
    if (!sectionProfil) return;

    let dernierDARecharge = null;
    let timeoutRechargement = null;

    // Observer les changements de la classe 'active' sur la sous-section
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const estActif = sectionProfil.classList.contains('active');
                const daActuel = window.profilActuelDA;

                // Si la sous-section vient de devenir active ET qu'un profil est affiché
                if (estActif && daActuel) {
                    // Éviter les rechargements en cascade pour le même étudiant
                    if (dernierDARecharge === daActuel) {
                        return;
                    }

                    // Annuler tout rechargement en attente
                    if (timeoutRechargement) {
                        clearTimeout(timeoutRechargement);
                    }

                    // Recharger avec un court délai (debounce)
                    timeoutRechargement = setTimeout(function() {
                        console.log('🔄 Rechargement automatique du profil étudiant:', daActuel);
                        dernierDARecharge = daActuel;

                        // Vérifier que la fonction existe avant de l'appeler
                        if (typeof afficherProfilComplet === 'function') {
                            afficherProfilComplet(daActuel);
                        }

                        timeoutRechargement = null;
                    }, 100); // Délai de 100ms
                }

                // Réinitialiser le flag quand la section devient inactive
                if (!estActif) {
                    dernierDARecharge = null;
                }
            }
        });
    });

    // Commencer à observer
    observer.observe(sectionProfil, {
        attributes: true,
        attributeFilter: ['class']
    });

    console.log('✅ Observer de rechargement automatique activé pour tableau-bord-profil');
});

/* ===============================
   📄 GÉNÉRATION DE RAPPORTS
   =============================== */

/**
 * Génère un rapport de bilan pour l'API (version directe et professionnelle)
 * @param {string} da - Numéro DA de l'étudiant
 * @param {Object} options - Options de sections à inclure
 * @returns {string} - Rapport en texte brut
 */
function genererRapportAPI(da, options = {}) {
    // ✨ REFONTE (8 déc 2025) : Format simplifié avec détails des meilleurs artefacts
    // Options par défaut
    const opts = {
        identification: true,
        assiduite: true,
        completion: true,
        performance: true,
        jetons: true,
        ...options
    };

    // 🔄 FORCER le recalcul des indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    const etudiant = obtenirDonneesSelonMode('groupeEtudiants').find(e => e.da === da);
    if (!etudiant) return 'Erreur : Étudiant non trouvé';

    const indices = calculerTousLesIndices(da);
    const detailsA = obtenirDetailsAssiduite(da);

    const productions = obtenirDonneesSelonMode('productions') || [];
    const artefacts = productions.filter(p => p.type === 'artefact-portfolio' && !p.facultatif);
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // Compter les productions remises (avec évaluations)
    const nbRemis = artefacts.filter(art => {
        return evaluations.some(e =>
            e.etudiantDA === da &&
            e.productionId === art.id &&
            !e.remplaceeParId &&
            e.statutRemise !== 'non-remis'
        );
    }).length;

    let rapport = '';

    // ✅ NOUVEAU (29 déc 2025): Détecter le mode anonymisation
    const modeAnonymisation = typeof estModeeLectureSeule === 'function' && estModeeLectureSeule();

    // 1. IDENTIFICATION
    if (opts.identification) {
        // Ne pas afficher le DA en mode anonymisation
        const daTexte = modeAnonymisation ? '' : ` (DA: ${etudiant.da})`;
        rapport += `${etudiant.prenom} ${etudiant.nom}${daTexte}\n\n`;
    }

    // 2. ASSIDUITÉ
    if (opts.assiduite) {
        rapport += `Assiduité : ${indices.A}% (${detailsA.heuresPresentes}h / ${detailsA.heuresOffertes}h)\n\n`;
    }

    // 3. COMPLÉTION
    if (opts.completion) {
        rapport += `Complétion : ${indices.C}% (${nbRemis} remises / ${artefacts.length} productions)\n\n`;
    }

    // 4. PERFORMANCE avec détails des meilleurs artefacts
    if (opts.performance) {
        // Obtenir la pratique active et le nombre d'artefacts
        const modalites = obtenirDonneesSelonMode('modalitesEvaluation') || {};
        const nbArtefacts = modalites.nbArtefactsPortfolio || 4;

        // ✨ CORRECTION (8 déc 2025) : Utiliser noteFinale (pourcentage réel) au lieu de recalculer
        // Obtenir les évaluations de l'étudiant avec notes
        const evaluationsEleve = evaluations.filter(e => {
            if (e.etudiantDA !== da || !e.productionId || e.remplaceeParId) return false;
            if (e.statutRemise === 'non-remis') return false;

            // Vérifier que noteFinale existe et est valide
            return e.noteFinale !== null &&
                   e.noteFinale !== undefined &&
                   !isNaN(parseFloat(e.noteFinale));
        });

        // Utiliser directement noteFinale (pourcentage réel) et trier
        const evaluationsAvecNotes = evaluationsEleve.map(e => {
            const production = productions.find(p => p.id === e.productionId);

            return {
                productionNom: production?.description || production?.nom || `Artefact ${e.productionId}`,
                niveauFinal: e.niveauFinal, // La lettre (I, D, M, E)
                notePct: parseFloat(e.noteFinale) // Le pourcentage réel (60.5, 73.5, 79.7, etc.)
            };
        }).sort((a, b) => b.notePct - a.notePct);

        // Prendre les N meilleurs
        const meilleursArtefacts = evaluationsAvecNotes.slice(0, nbArtefacts);
        const moyenneP = meilleursArtefacts.length > 0
            ? Math.round(meilleursArtefacts.reduce((sum, a) => sum + a.notePct, 0) / meilleursArtefacts.length)
            : 0;

        rapport += `Performance : ${moyenneP}% (${meilleursArtefacts.length} meilleurs artefacts actuels)\n\n`;

        // Liste des meilleurs artefacts
        meilleursArtefacts.forEach((art, idx) => {
            rapport += `${idx + 1}- ${art.productionNom} : ${art.niveauFinal} (${art.notePct.toFixed(1)})\n`;
        });
        rapport += `\n`;
    }

    // 5. GESTION DES JETONS
    if (opts.jetons) {
        // Lire la configuration globale des jetons (nombreParEleve = quota total)
        const modalites = obtenirDonneesSelonMode('modalitesEvaluation') || {};
        const configJetons = modalites.configurationJetons || {};
        const nbDisponibles = configJetons.nombreParEleve || 0;

        if (nbDisponibles > 0) {
            // Compter les jetons utilisés via la fonction officielle si disponible
            let nbUtilises = 0;
            const details = [];

            if (typeof obtenirStatutJetonsEtudiant === 'function') {
                const statutJetons = obtenirStatutJetonsEtudiant(da);
                Object.keys(statutJetons).forEach(typeId => {
                    const info = statutJetons[typeId];
                    if (info && info.utilises > 0) {
                        nbUtilises += info.utilises;
                        // Simplifier le nom du type
                        const nomCourt = info.nom.replace('Jeton de ', '').replace('Jeton ', '');
                        details.push(`${nomCourt}: ${info.utilises}`);
                    }
                });
            }

            rapport += `Jetons : ${nbUtilises} / ${nbDisponibles} utilisés`;
            if (details.length > 0) {
                rapport += ` (${details.join(', ')})`;
            }
            rapport += `\n`;
        }
    }

    return rapport.trim();
}

/**
 * Génère l'interface de la section Rapport avec toggle et bouton copier
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {string} - HTML de la section
 */
function genererSectionRapport(da) {
    const etudiant = obtenirDonneesSelonMode('groupeEtudiants').find(e => e.da === da);
    if (!etudiant) return '<p>Erreur : Étudiant non trouvé</p>';

    return `
        <div style="max-width: 900px;">
            <!-- Carte principale (Proposition 2) -->
            <div class="profil-carte">
                <!-- En-tête minimaliste -->
                <h3 style="margin: 0 0 20px 0; color: var(--bleu-principal); font-size: 1.1rem; border-bottom: 2px solid var(--bleu-pale); padding-bottom: 10px;">
                    <span class="primo-aide" data-target="conseil-rapport">😎</span>
                </h3>

                <!-- Conseil Primo: Informations sur le rapport -->
                <div id="conseil-rapport" class="carte-info-toggle carte-info-conseil" style="display: none;">
                    <strong>À propos du rapport :</strong>
                    <p>Le rapport est généré à la demande avec les données actuelles et n'est pas sauvegardé automatiquement. Vous pouvez modifier le texte avant de le copier.</p>
                </div>

                <!-- Grid 2 colonnes : Paramètres + Actions -->
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 30px; align-items: start;">
                    <!-- Colonne gauche : Paramètres -->
                    <div>
                        <!-- Sections à inclure -->
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Sections à inclure
                        </div>
                        <div class="grille-checkboxes u-mb-10">
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-identification-${da}" onchange="genererEtAfficherRapport('${da}')" checked>
                                Identification
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-assiduite-${da}" onchange="genererEtAfficherRapport('${da}')" checked>
                                Assiduité
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-completion-${da}" onchange="genererEtAfficherRapport('${da}')" checked>
                                Complétion
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-performance-${da}" onchange="genererEtAfficherRapport('${da}')" checked>
                                Performance
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-jetons-${da}" onchange="genererEtAfficherRapport('${da}')" checked>
                                Jetons
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-date-${da}" onchange="genererEtAfficherRapport('${da}')" checked>
                                Date
                            </label>
                        </div>
                    </div>

                    <!-- Colonne droite : Actions -->
                    <div style="display: flex; flex-direction: column; gap: 10px; min-width: 120px;">
                        <button class="btn btn-principal u-w-100" onclick="copierRapport('${da}')">
                            Copier
                        </button>
                    </div>
                </div>
            </div>

            <!-- Zone de texte du rapport (éditable pour ajouter commentaires personnels) -->
            <div class="profil-position-relative-mt15">
                <textarea id="textarea-rapport-${da}"
                          placeholder="Le rapport apparaîtra ici. Vous pouvez le modifier et ajouter vos commentaires avant de le copier."
                          style="width: 100%; height: 300px; padding: 15px; font-family: 'Courier New', monospace; font-size: 0.9rem; border: 2px solid var(--bleu-pale); border-radius: 6px; resize: vertical; line-height: 1.6; background: white; overflow-y: auto;"></textarea>
            </div>
        </div>
    `;
}

/**
 * Génère et affiche le rapport dans la zone de texte
 * @param {string} da - Numéro DA
 */
function genererEtAfficherRapport(da) {
    const textarea = document.getElementById(`textarea-rapport-${da}`);

    if (!textarea) {
        console.error('Textarea non trouvé');
        return;
    }

    // Sauvegarder les préférences
    sauvegarderPreferencesRapport(da);

    // Lire les options de sections à inclure
    const options = {
        identification: document.getElementById(`inclure-identification-${da}`)?.checked ?? true,
        assiduite: document.getElementById(`inclure-assiduite-${da}`)?.checked ?? true,
        completion: document.getElementById(`inclure-completion-${da}`)?.checked ?? true,
        performance: document.getElementById(`inclure-performance-${da}`)?.checked ?? true,
        jetons: document.getElementById(`inclure-jetons-${da}`)?.checked ?? true,
        date: document.getElementById(`inclure-date-${da}`)?.checked ?? true
    };

    // Générer le rapport (toujours version API)
    let rapport = '';
    try {
        rapport = genererRapportAPI(da, options);
    } catch (error) {
        rapport = `Erreur lors de la génération du rapport :\n\n${error.message}`;
        console.error('Erreur génération rapport:', error);
    }

    // Afficher le rapport
    textarea.value = rapport;

    console.log(`✅ Rapport généré pour DA ${da}`);
}

/**
 * Copie le contenu du rapport dans le presse-papiers
 * @param {string} da - Numéro DA
 */
function copierRapport(da) {
    const textarea = document.getElementById(`textarea-rapport-${da}`);

    if (!textarea || !textarea.value || textarea.value.trim() === '') {
        alert('Veuillez d\'abord générer un rapport avant de le copier.');
        return;
    }

    // Copier dans le presse-papiers
    textarea.select();

    try {
        // Méthode moderne (Clipboard API)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textarea.value).then(() => {
                afficherNotificationCopiee();
            }).catch(err => {
                // Fallback vers ancienne méthode
                const success = document.execCommand('copy');
                if (success) {
                    afficherNotificationCopiee();
                } else {
                    alert('Erreur lors de la copie. Veuillez sélectionner le texte manuellement (Ctrl+A puis Ctrl+C).');
                }
            });
        } else {
            // Ancienne méthode pour navigateurs plus vieux
            const success = document.execCommand('copy');
            if (success) {
                afficherNotificationCopiee();
            } else {
                alert('Erreur lors de la copie. Veuillez sélectionner le texte manuellement (Ctrl+A puis Ctrl+C).');
            }
        }
    } catch (err) {
        console.error('Erreur copie:', err);
        alert('Erreur lors de la copie. Veuillez sélectionner le texte manuellement (Ctrl+A puis Ctrl+C).');
    }

    function afficherNotificationCopiee() {
        // Créer notification temporaire
        const notification = document.createElement('div');
        notification.textContent = '✅ Rapport copié dans le presse-papiers !';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 6px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);

        // Retirer après 3 secondes
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

/**
 * Vide le contenu du rapport
 * @param {string} da - Numéro DA
 */
function viderRapport(da) {
    const textarea = document.getElementById(`textarea-rapport-${da}`);
    const btnCopier = document.getElementById(`btn-copier-rapport-${da}`);

    if (textarea) {
        textarea.value = 'Cliquez sur "Générer le rapport" pour afficher le contenu...';
    }

    if (btnCopier) {
        btnCopier.disabled = true;
    }
}

/**
 * Sauvegarde les préférences du rapport dans localStorage
 * @param {string} da - Numéro DA
 */
function sauvegarderPreferencesRapport(da) {
    const preferences = {
        identification: document.getElementById(`inclure-identification-${da}`)?.checked ?? true,
        assiduite: document.getElementById(`inclure-assiduite-${da}`)?.checked ?? true,
        completion: document.getElementById(`inclure-completion-${da}`)?.checked ?? true,
        performance: document.getElementById(`inclure-performance-${da}`)?.checked ?? true,
        jetons: document.getElementById(`inclure-jetons-${da}`)?.checked ?? true,
        date: document.getElementById(`inclure-date-${da}`)?.checked ?? true
    };

    db.setSync('preferencesRapport', preferences);
}

/**
 * Restaure les préférences du rapport depuis localStorage
 * @param {string} da - Numéro DA
 */
function restaurerPreferencesRapport(da) {
    // db.getSync retourne déjà l'objet parsé, pas besoin de JSON.parse
    const preferences = db.getSync('preferencesRapport', null);

    // Restaurer les checkboxes de sections
    const sections = ['identification', 'assiduite', 'completion', 'performance', 'jetons', 'date'];
    sections.forEach(section => {
        const checkbox = document.getElementById(`inclure-${section}-${da}`);
        if (checkbox && preferences && preferences[section] !== undefined) {
            checkbox.checked = preferences[section];
        }
    });

    // Générer automatiquement le rapport après restauration des préférences
    genererEtAfficherRapport(da);
}

// ============================================
// FONCTIONS HELPER POUR SECTION PRODUCTIONS
// ============================================

/**
 * Consulte une évaluation existante (ouvre le formulaire d'évaluation en lecture)
 */
function consulterEvaluation(da, productionId) {
    // Trouver l'évaluation
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evaluation = evaluations.find(e => e.etudiantDA === da && e.productionId === productionId);

    if (!evaluation) {
        alert('Évaluation non trouvée');
        return;
    }

    // Naviguer d'abord vers la section Évaluations
    afficherSection('evaluations');

    // Attendre que la section soit chargée, puis ouvrir l'évaluation
    setTimeout(() => {
        if (typeof modifierEvaluation === 'function') {
            modifierEvaluation(evaluation.id);
        } else {
            alert('Module d\'évaluation non chargé');
        }
    }, 200);
}

/**
 * Évalue une production (ouvre le formulaire d'évaluation pour création)
 */
function evaluerProduction(da, productionId) {
    // Naviguer vers Évaluations avec préselection de l'élève et de la production
    afficherSection('evaluations');

    // Attendre que la section soit chargée
    setTimeout(() => {
        // Présélectionner l'élève dans le formulaire
        const selectEleve = document.getElementById('select-eleve-evaluation');
        if (selectEleve) {
            selectEleve.value = da;
            if (typeof selectEleve.onchange === 'function') {
                selectEleve.onchange();
            }
        }

        // Présélectionner la production
        setTimeout(() => {
            const selectProduction = document.getElementById('select-production-evaluation');
            if (selectProduction) {
                selectProduction.value = productionId;
                if (typeof selectProduction.onchange === 'function') {
                    selectProduction.onchange();
                }
            }
        }, 100);
    }, 200);
}

/**
 * Supprime une évaluation depuis le profil élève
 */
function supprimerEvaluationDepuisProfil(evaluationId) {
    // Appeler la fonction de suppression du module liste-evaluations.js
    if (typeof supprimerEvaluation === 'function') {
        supprimerEvaluation(evaluationId);

        // Recharger la section Productions après suppression
        setTimeout(() => {
            if (profilActuelDA) {
                changerSectionProfil('productions');
            }
        }, 500);
    } else {
        alert('Fonction de suppression non disponible');
    }
}

/**
 * Calcule les détails de la note finale de session pour un étudiant (pratique PAN-Standards)
 * Retourne les informations nécessaires pour afficher la construction de la note
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Object|null} - Détails de la note finale ou null si pas de données
 */
function calculerDetailsNoteFinale(da) {
    const modalites = db.getSync('modalitesEvaluation', {});
    const pratique = modalites.pratique || 'pan-maitrise';

    // Pour l'instant, on gère seulement PAN-Standards (accepter toutes les variantes qui contiennent "pan")
    const pratiqueLower = pratique.toLowerCase();
    if (!pratiqueLower.includes('pan') && pratiqueLower !== 'alternative') {
        return null;
    }

    const configPAN = modalites.configPAN || {};
    const configPortfolio = configPAN.portfolio || {};
    const nombreARetenir = configPortfolio.nombreARetenir || 4;
    const minimumRequis = configPortfolio.minimumCompletion || 7;
    const methodeSelection = configPortfolio.methodeSelection || 'meilleurs';
    const reglesConformite = configPortfolio.reglesConformite || { actif: false };

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Trouver la production portfolio (conteneur)
    const productionPortfolio = productions.find(p => p.type === 'portfolio');

    // Trouver la production terminale EN PREMIER (pour l'exclure des artefacts)
    // La production terminale est celle qui :
    // 1. A un type contenant 'terminal' ou 'examen' ou 'final'
    // 2. OU a un titre/description contenant 'terminal' ou 'finale'
    // 3. OU a une pondération > 0 (et n'est pas portfolio)
    const productionTerminale = productions.find(p => {
        // Exclure portfolio et artefacts explicites
        if (p.type === 'portfolio' || p.type === 'artefact-portfolio') return false;

        // Chercher par type explicite
        const typeLC = (p.type || '').toLowerCase();
        if (typeLC.includes('terminal') || typeLC.includes('examen') || typeLC.includes('final')) {
            return true;
        }

        // Chercher par titre/description
        const titreLC = (p.titre || '').toLowerCase();
        const descLC = (p.description || '').toLowerCase();
        if (titreLC.includes('terminal') || titreLC.includes('finale') ||
            descLC.includes('terminal') || descLC.includes('finale')) {
            return true;
        }

        // Sinon, prendre la première production avec pondération > 0
        return p.ponderation > 0;
    });

    // ID de la production terminale (pour l'exclure des artefacts)
    const terminalId = productionTerminale?.id || null;

    // Trouver les artefacts portfolio (type 'artefact-portfolio')
    // EXCLURE la production terminale
    let artefactsIds = productions
        .filter(p => p.type === 'artefact-portfolio' && p.id !== terminalId)
        .map(p => p.id);

    // Si pas d'artefacts explicites, chercher toutes les productions à pondération 0
    // qui ne sont pas le portfolio conteneur NI la production terminale
    if (artefactsIds.length === 0) {
        artefactsIds = productions
            .filter(p =>
                p.type !== 'portfolio' &&
                p.id !== terminalId &&
                (p.ponderation === 0 || p.ponderation === undefined || p.ponderation === null)
            )
            .map(p => p.id);
    }

    // Filtrer les évaluations de l'étudiant sur les artefacts
    // EXCLURE : évaluation terminale, remplacées, non-recevables (plagiat, IA)
    const evaluationsArtefacts = evaluations.filter(e => {
        if (e.etudiantDA !== da) return false;
        if (!artefactsIds.includes(e.productionId)) return false;
        if (e.productionId === terminalId) return false;
        if (e.remplaceeParId) return false;
        if (e.noteFinale === null || e.noteFinale === undefined) return false;

        // Exclure les évaluations non-recevables (plagiat, IA)
        const statutIntegrite = e.statutIntegrite || 'recevable';
        if (statutIntegrite === 'plagiat' || statutIntegrite === 'ia') return false;

        return true;
    });

    // Sélectionner les N meilleurs selon la méthode
    let artefactsRetenus = [...evaluationsArtefacts];

    // Helper: obtenir le numéro de production pour une évaluation
    const getNumeroProduction = (eval) => {
        const prod = productions.find(p => p.id === eval.productionId);
        return prod?.numero || parseInt(eval.productionId.match(/(\d+)$/)?.[1]) || 0;
    };

    if (methodeSelection === 'meilleurs') {
        artefactsRetenus.sort((a, b) => b.noteFinale - a.noteFinale);
    } else if (methodeSelection === 'recents') {
        // CORRECTION (24 jan 2026): Trier par numéro de production décroissant
        artefactsRetenus.sort((a, b) => getNumeroProduction(b) - getNumeroProduction(a));
    } else if (methodeSelection === 'recents-meilleurs') {
        const nombreMeilleurs = Math.max(1, Math.ceil(artefactsRetenus.length * 0.5));
        artefactsRetenus.sort((a, b) => b.noteFinale - a.noteFinale);
        artefactsRetenus = artefactsRetenus.slice(0, nombreMeilleurs);
        // CORRECTION (24 jan 2026): Trier par numéro de production décroissant
        artefactsRetenus.sort((a, b) => getNumeroProduction(b) - getNumeroProduction(a));
    }

    // Limiter au nombre à retenir
    artefactsRetenus = artefactsRetenus.slice(0, nombreARetenir);

    // Calculer la moyenne du portfolio
    let moyennePortfolio = null;
    if (artefactsRetenus.length > 0) {
        const somme = artefactsRetenus.reduce((acc, e) => acc + e.noteFinale, 0);
        moyennePortfolio = somme / artefactsRetenus.length;
    }

    // ========================================
    // RÈGLES DE CONFORMITÉ - Plafonnement
    // ========================================
    let plafonnement = null;
    const nombreEvalues = evaluationsArtefacts.length;
    const deficit = minimumRequis - nombreEvalues;

    if (reglesConformite.actif && deficit > 0 && moyennePortfolio !== null) {
        console.log(`[calculerDetailsNoteFinale] Déficit détecté: ${deficit} (${nombreEvalues}/${minimumRequis})`);

        // Trouver le plafond applicable selon le déficit
        const plafonds = reglesConformite.plafonds || [];
        let plafondApplicable = null;

        if (deficit >= 3) {
            // Déficit 3+
            plafondApplicable = plafonds.find(p => p.deficit === 3);
        } else {
            // Déficit 1 ou 2
            plafondApplicable = plafonds.find(p => p.deficit === deficit);
        }

        if (plafondApplicable) {
            if (plafondApplicable.echec) {
                // Échec automatique
                plafonnement = {
                    actif: true,
                    deficit: deficit,
                    niveauCode: null,
                    seuilMax: 0,
                    echec: true,
                    moyenneOriginale: moyennePortfolio
                };
                moyennePortfolio = 0;
                console.log(`[calculerDetailsNoteFinale] Échec automatique appliqué`);
            } else if (plafondApplicable.seuilMax !== null && moyennePortfolio > plafondApplicable.seuilMax) {
                // Plafonnement au niveau
                plafonnement = {
                    actif: true,
                    deficit: deficit,
                    niveauCode: plafondApplicable.niveauCode,
                    seuilMax: plafondApplicable.seuilMax,
                    echec: false,
                    moyenneOriginale: moyennePortfolio
                };
                moyennePortfolio = plafondApplicable.seuilMax;
                console.log(`[calculerDetailsNoteFinale] Plafonnement à ${plafondApplicable.seuilMax}% (niveau ${plafondApplicable.niveauCode})`);
            }
        }
    }

    // Pondérations
    const ponderationPortfolio = productionPortfolio?.ponderation || 60;
    const ponderationTerminale = productionTerminale?.ponderation || 40;
    const totalPonderation = ponderationPortfolio + ponderationTerminale;

    // Trouver l'évaluation terminale de l'étudiant
    let noteTerminale = null;
    let evaluationTerminale = null;
    if (productionTerminale) {
        evaluationTerminale = evaluations.find(e =>
            e.etudiantDA === da &&
            e.productionId === productionTerminale.id &&
            !e.remplaceeParId &&
            e.noteFinale !== null &&
            e.noteFinale !== undefined
        );
        if (evaluationTerminale) {
            noteTerminale = evaluationTerminale.noteFinale;
        }
    }

    // Calculer la note finale pondérée
    let noteFinale = null;
    if (moyennePortfolio !== null) {
        if (noteTerminale !== null) {
            // Les deux composantes sont disponibles
            noteFinale = (
                (moyennePortfolio * ponderationPortfolio / totalPonderation) +
                (noteTerminale * ponderationTerminale / totalPonderation)
            );
        } else {
            // Seulement le portfolio (provisoire)
            noteFinale = moyennePortfolio;
        }
    }

    // Méthode de sélection en français
    const methodesLabels = {
        'meilleurs': 'meilleurs',
        'recents': 'plus récents',
        'recents-meilleurs': 'récents parmi les meilleurs',
        'tous': 'tous'
    };

    return {
        pratique: 'PAN-Standards',
        portfolio: {
            nombreARetenir: nombreARetenir,
            nombreEvalues: evaluationsArtefacts.length,
            nombreRetenus: artefactsRetenus.length,
            minimumRequis: minimumRequis,
            methodeSelection: methodesLabels[methodeSelection] || methodeSelection,
            moyenne: moyennePortfolio,
            ponderation: ponderationPortfolio,
            ponderationNormalisee: (ponderationPortfolio / totalPonderation * 100).toFixed(0),
            artefactsRetenus: artefactsRetenus.map(e => ({
                productionId: e.productionId,
                note: e.noteFinale,
                niveau: e.niveauFinal
            })),
            plafonnement: plafonnement
        },
        terminal: {
            nom: productionTerminale?.titre || productionTerminale?.description || 'Évaluation terminale',
            note: noteTerminale,
            niveau: evaluationTerminale?.niveauFinal || null,
            ponderation: ponderationTerminale,
            ponderationNormalisee: (ponderationTerminale / totalPonderation * 100).toFixed(0)
        },
        noteFinale: noteFinale,
        estProvisoire: noteTerminale === null
    };
}

/* ===============================
   GESTION DES JETONS PERSONNALISÉS
   =============================== */

/**
 * Attribue un jeton personnalisé avec demande de motif
 * @param {string} da - Code permanent de l'étudiant
 * @param {string} jetonId - ID du type de jeton
 * @param {string} nomJeton - Nom du jeton (pour affichage)
 */
function attribuerJetonPersonnaliseAvecPrompt(da, jetonId, nomJeton) {
    const motif = prompt(`Motif d'utilisation du jeton "${nomJeton}" (optionnel) :`);

    if (motif === null) {
        // L'utilisateur a annulé
        return;
    }

    if (typeof attribuerJetonPersonnalise === 'function') {
        const succes = attribuerJetonPersonnalise(da, jetonId, motif || '');

        if (succes) {
            // Recharger la section Mobilisation pour mettre à jour l'affichage
            changerSectionProfil('mobilisation');
        }
    } else {
        console.error('Fonction attribuerJetonPersonnalise non disponible');
        alert('Erreur : La fonction de gestion des jetons n\'est pas disponible.');
    }
}

/**
 * Retire un jeton personnalisé avec confirmation
 * @param {string} da - Code permanent de l'étudiant
 * @param {string} jetonId - ID du type de jeton
 * @param {string} nomJeton - Nom du jeton (pour affichage)
 */
function retirerJetonPersonnaliseAvecConfirmation(da, jetonId, nomJeton) {
    if (!confirm(`Êtes-vous sûr de vouloir retirer un jeton "${nomJeton}" à cet·te étudiant·e ?`)) {
        return;
    }

    if (typeof retirerJetonPersonnalise === 'function') {
        const succes = retirerJetonPersonnalise(da, jetonId);

        if (succes) {
            // Recharger la section Mobilisation pour mettre à jour l'affichage
            changerSectionProfil('mobilisation');
        }
    } else {
        console.error('Fonction retirerJetonPersonnalise non disponible');
        alert('Erreur : La fonction de gestion des jetons n\'est pas disponible.');
    }
}

// Exporter les fonctions vers window
window.attribuerJetonPersonnaliseAvecPrompt = attribuerJetonPersonnaliseAvecPrompt;
window.retirerJetonPersonnaliseAvecConfirmation = retirerJetonPersonnaliseAvecConfirmation;

// 🆕 Exporter les nouvelles fonctions de niveau RàI (Beta 90+)
window.determinerNiveauRaiPedagogique = determinerNiveauRaiPedagogique;
window.determinerAlerteContextuelle = determinerAlerteContextuelle;

/**
 * 🆕 BETA 91: Calcule et stocke les patterns + RàI pour TOUT le groupe
 * Cette fonction est appelée par tableau-bord-apercu.js au chargement
 * pour avoir des données à jour pour tous les étudiants
 *
 * @returns {Object} - Patterns et RàI de tous les étudiants
 */
function calculerEtStockerPatternsGroupe() {
    // ✅ NAMESPACING (Beta 95.5)
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const patternsGroupe = {};

    console.log('📊 Calcul des patterns pour', etudiants.length, 'étudiants...');

    etudiants.forEach(etudiant => {
        const da = etudiant.da;

        try {
            // Récupérer le modèle RàI (contient pattern et niveau)
            const modelRai = determinerNiveauRaiPedagogique(da);

            // Récupérer les indices pour avoir la performance
            const indices = calculerTousLesIndices(da);

            // Stocker les informations essentielles
            patternsGroupe[da] = {
                pattern: modelRai.pattern,
                niveauRai: modelRai.niveau,
                defi: modelRai.defi,
                performancePct: indices.P, // 0-100
                dateCalcul: new Date().toISOString()
            };
        } catch (error) {
            console.warn('⚠️ Erreur calcul pattern pour DA', da, error);
            patternsGroupe[da] = {
                pattern: 'Inconnu',
                niveauRai: null,
                defi: null,
                performancePct: 0,
                dateCalcul: new Date().toISOString()
            };
        }
    });

    // Stocker dans localStorage
    db.setSync('indicesPatternsRaI', patternsGroupe);

    console.log('✅ Patterns stockés pour', Object.keys(patternsGroupe).length, 'étudiants');

    return patternsGroupe;
}

/**
 * 🆕 BETA 91: Récupère les patterns stockés pour un étudiant
 * @param {string} da - Numéro de DA
 * @returns {Object|null} - Pattern et RàI de l'étudiant, ou null si non trouvé
 */
function obtenirPatternEtudiant(da) {
    const patterns = db.getSync('indicesPatternsRaI', {});
    return patterns[da] || null;
}

// 🆕 BETA 91: Exporter les fonctions de patterns de groupe
window.calculerEtStockerPatternsGroupe = calculerEtStockerPatternsGroupe;
window.obtenirPatternEtudiant = obtenirPatternEtudiant;

// =============================================================================
// MODAL INFORMATIONS CONFIDENTIELLES (Beta 96.1)
// Gestion des informations sensibles sur l'étudiant
// =============================================================================

// Variable pour stocker le DA de l'étudiant en cours d'édition
let _confidentielDaActuel = null;

// Sous-catégories pour les services adaptés
const SOUS_CATEGORIES_SERVICES = {
    'sensorielle': [
        'Déficience visuelle',
        'Déficience auditive',
        'Paralysie cérébrale',
        'Spina-bifida',
        'Dystrophie musculaire'
    ],
    'neurologique': [
        'Trouble du spectre autistique (TSA)',
        'Syndrome Gilles de la Tourette',
        'Traumatisme craniocérébral',
        'Sclérose en plaques',
        'Dysphasie',
        'TDA/H',
        'Fibromyalgie'
    ],
    'organique': [
        'Épilepsie',
        'Maladie de Crohn',
        'Cancer',
        'Diabète'
    ],
    'apprentissage': [
        'Dyslexie',
        'Dysorthographie',
        'Dyscalculie'
    ],
    'sante-mentale': [
        'Trouble d\'anxiété généralisée',
        'Trouble de l\'humeur (bipolarité, dépression)',
        'Trouble de la personnalité',
        'Trouble psychotique (schizophrénie)',
        'Troubles alimentaires'
    ]
};

/**
 * Ouvre le modal des informations confidentielles pour un étudiant
 * @param {string} da - Numéro de DA de l'étudiant
 */
function ouvrirModalConfidentiel(da) {
    _confidentielDaActuel = da;

    // Récupérer les infos de l'étudiant
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiant = etudiants.find(e => e.da === da);
    const nomComplet = etudiant ? `${etudiant.prenom} ${etudiant.nom}` : `DA ${da}`;

    // Afficher le nom dans le modal
    document.getElementById('confidentiel-nom-etudiant').textContent = nomComplet;

    // Charger les données existantes
    const cleConfidentiel = (typeof cle === 'function') ? cle('confidentielEtudiants') : 'confidentielEtudiants';
    const donnees = db.getSync(cleConfidentiel, {});
    const infos = donnees[da] || {};

    // Remplir les champs
    document.getElementById('confidentiel-epgc').checked = infos.epgc || false;
    document.getElementById('confidentiel-cours-regulier').checked = infos.coursRegulier || false;
    document.getElementById('confidentiel-cours-echec').checked = infos.coursEchec || false;
    document.getElementById('confidentiel-cours-abandon').checked = infos.coursAbandon || false;
    document.getElementById('confidentiel-cours-decrochage').checked = infos.coursDecrochage || false;
    document.getElementById('confidentiel-cours-renforcement').checked = infos.coursRenforcement || false;

    document.getElementById('confidentiel-services-adaptes').checked = infos.servicesAdaptes || false;
    toggleServicesAdaptes(infos.servicesAdaptes || false);

    document.getElementById('confidentiel-categorie').value = infos.categorie || '';
    mettreAJourSousCategories();
    document.getElementById('confidentiel-sous-categorie').value = infos.sousCategorie || '';

    document.getElementById('confidentiel-defi-fls').checked = infos.defiFLS || false;
    document.getElementById('confidentiel-defi-socialisation').checked = infos.defiSocialisation || false;
    document.getElementById('confidentiel-defi-integration').checked = infos.defiIntegration || false;
    document.getElementById('confidentiel-defi-organisation-scolaire').checked = infos.defiOrganisationScolaire || false;
    document.getElementById('confidentiel-defi-organisation-citoyenne').checked = infos.defiOrganisationCitoyenne || false;

    document.getElementById('confidentiel-notes').value = infos.notes || '';

    // Afficher le modal
    document.getElementById('modalConfidentiel').style.display = 'flex';
}

/**
 * Ferme le modal des informations confidentielles
 */
function fermerModalConfidentiel() {
    document.getElementById('modalConfidentiel').style.display = 'none';
    _confidentielDaActuel = null;
}

/**
 * Sauvegarde les informations confidentielles
 */
function sauvegarderConfidentiel() {
    if (!_confidentielDaActuel) return;

    const infos = {
        epgc: document.getElementById('confidentiel-epgc').checked,
        coursRegulier: document.getElementById('confidentiel-cours-regulier').checked,
        coursEchec: document.getElementById('confidentiel-cours-echec').checked,
        coursAbandon: document.getElementById('confidentiel-cours-abandon').checked,
        coursDecrochage: document.getElementById('confidentiel-cours-decrochage').checked,
        coursRenforcement: document.getElementById('confidentiel-cours-renforcement').checked,
        servicesAdaptes: document.getElementById('confidentiel-services-adaptes').checked,
        categorie: document.getElementById('confidentiel-categorie').value,
        sousCategorie: document.getElementById('confidentiel-sous-categorie').value,
        defiFLS: document.getElementById('confidentiel-defi-fls').checked,
        defiSocialisation: document.getElementById('confidentiel-defi-socialisation').checked,
        defiIntegration: document.getElementById('confidentiel-defi-integration').checked,
        defiOrganisationScolaire: document.getElementById('confidentiel-defi-organisation-scolaire').checked,
        defiOrganisationCitoyenne: document.getElementById('confidentiel-defi-organisation-citoyenne').checked,
        notes: document.getElementById('confidentiel-notes').value.trim()
    };

    // Sauvegarder
    const cleConfidentiel = (typeof cle === 'function') ? cle('confidentielEtudiants') : 'confidentielEtudiants';
    const donnees = db.getSync(cleConfidentiel, {});
    donnees[_confidentielDaActuel] = infos;
    db.setSync(cleConfidentiel, donnees);

    // Fermer le modal
    fermerModalConfidentiel();

    // Rafraîchir le profil si nécessaire
    if (typeof chargerProfilEtudiant === 'function') {
        chargerProfilEtudiant(_confidentielDaActuel);
    }
}

/**
 * Affiche/masque les détails des services adaptés
 * @param {boolean} afficher - true pour afficher, false pour masquer
 */
function toggleServicesAdaptes(afficher) {
    const details = document.getElementById('confidentiel-services-details');
    if (details) {
        details.style.display = afficher ? 'block' : 'none';
    }
}

/**
 * Met à jour les sous-catégories selon la catégorie sélectionnée
 */
function mettreAJourSousCategories() {
    const categorie = document.getElementById('confidentiel-categorie').value;
    const selectSousCategorie = document.getElementById('confidentiel-sous-categorie');

    if (!categorie) {
        selectSousCategorie.innerHTML = '<option value="">-- Sélectionner une catégorie d\'abord --</option>';
        return;
    }

    const sousCategories = SOUS_CATEGORIES_SERVICES[categorie] || [];
    selectSousCategorie.innerHTML = '<option value="">-- Sélectionner --</option>' +
        sousCategories.map(sc => `<option value="${sc}">${sc}</option>`).join('');
}

/**
 * Vérifie si un étudiant a des informations confidentielles enregistrées
 * @param {string} da - Numéro de DA
 * @returns {boolean} - true si des infos existent
 */
function aDesInfosConfidentielles(da) {
    const cleConfidentiel = (typeof cle === 'function') ? cle('confidentielEtudiants') : 'confidentielEtudiants';
    const donnees = db.getSync(cleConfidentiel, {});
    const infos = donnees[da];
    if (!infos) return false;

    // Vérifier si au moins une info est renseignée
    return infos.epgc || infos.servicesAdaptes ||
           infos.coursRegulier || infos.coursEchec || infos.coursAbandon ||
           infos.coursDecrochage || infos.coursRenforcement ||
           infos.defiFLS || infos.defiSocialisation || infos.defiIntegration ||
           infos.defiOrganisationScolaire || infos.defiOrganisationCitoyenne ||
           (infos.notes && infos.notes.length > 0);
}

// 🆕 BETA 96.1: Exporter les fonctions du modal confidentiel
window.ouvrirModalConfidentiel = ouvrirModalConfidentiel;
window.fermerModalConfidentiel = fermerModalConfidentiel;
window.sauvegarderConfidentiel = sauvegarderConfidentiel;
window.toggleServicesAdaptes = toggleServicesAdaptes;
window.mettreAJourSousCategories = mettreAJourSousCategories;
window.aDesInfosConfidentielles = aDesInfosConfidentielles;

// 🆕 BETA 93: Exporter afficherProfilComplet pour accès depuis autres modules
window.afficherProfilComplet = afficherProfilComplet;
window.calculerTousLesIndices = calculerTousLesIndices; // Utilisé par etudiants.js pour cohérence pratique SOM/PAN
window.obtenirPratiqueActuelle = obtenirPratiqueActuelle; // ✅ BETA 93.5 (10 déc): Utilisé par snapshots.js pour calcul historique P
window.calculerDetailsNoteFinale = calculerDetailsNoteFinale; // 🆕 BETA 96 (FIX #37): Utilisé par portfolio.js pour cohérence P = Note finale

// ✅ CORRECTIF (17 déc 2025): Exporter les fonctions utilisées dans les onclick du profil
window.changerSectionProfil = changerSectionProfil;
window.toggleSectionCollapsible = toggleSectionCollapsible;
window.naviguerVersPresenceAvecDate = naviguerVersPresenceAvecDate;
window.genererEtAfficherRapport = genererEtAfficherRapport;
window.copierRapport = copierRapport;
window.consulterEvaluation = consulterEvaluation;
window.evaluerProduction = evaluerProduction;