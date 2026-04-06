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

(function() {
'use strict';

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

    // 🆕 BETA 96.1: Utiliser directement les périodes (plus simple)
    const periodesPresentes = detailsA.periodesPresentes;
    const periodesOffertes = detailsA.periodesOffertes;

    const tauxA = periodesOffertes > 0
        ? (periodesPresentes / periodesOffertes * 100).toFixed(1)
        : 0;
    const interpA = interpreterAssiduite(parseFloat(tauxA));

    // Détecter si aucune donnée n'est saisie pour cet étudiant
    const aucuneDonneeAssiduite = periodesOffertes === 0;

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

    // 🆕 LIRE LA CONFIGURATION DE LA PRATIQUE DE NOTATION
    // Source de vérité : pratiquesConfigurables (Material Settings), fallback sur modalitesEvaluation
    const configPratiqueActive = typeof obtenirConfigPratiqueActive === 'function' ? obtenirConfigPratiqueActive() : null;
    const modalites = db.getSync('modalitesEvaluation', {});
    const configPortfolio = configPratiqueActive?.portfolio || modalites.configPAN?.portfolio || {};
    const portfolioActif = configPortfolio.actif !== false;
    let nombreARetenir = configPortfolio.nombreARetenir || portfolio?.regles?.nombreARetenir || 3;
    const minimumCompletion = configPortfolio.minimumCompletion || modalites.configPAN?.portfolio?.minimumCompletion || 3;
    let methodeSelection = configPortfolio.methodeSelection || 'meilleurs';
    // Mapper les noms Material Settings → legacy : 'derniers' → 'recents'
    if (methodeSelection === 'derniers') methodeSelection = 'recents';

    // Détecter le mode Hybride (catégories Sélection/Obligatoires)
    const configCategories = configPratiqueActive?.categories
        || (typeof obtenirConfigCategories === 'function' ? obtenirConfigCategories() : null);
    const modeHybride = !!(configCategories && configCategories.actif);

    // Appliquer la logique de sélection selon la modalité configurée
    let artefactsSelectionnes = [];
    const artefactsRemis = artefacts.filter(a => a.remis);

    if (!portfolioActif) {
        // Portfolio désactivé : aucun artefact retenu
        artefactsSelectionnes = [];
    } else if (modeHybride) {
        // MODE HYBRIDE : N meilleures du pool Sélection + Obligatoires
        const { nombreARetenir: nSelection, ponderation: pondSelection } = configCategories.selection || { nombreARetenir: 4, ponderation: 65 };
        const { ponderation: pondOblig } = configCategories.obligatoires || { ponderation: 35 };
        const productionsNonPortfolio = productions.filter(p => p.type !== 'portfolio');

        // Séparer les artefacts remis par catégorie
        const artefactsSelection = artefactsRemis.filter(a => {
            const prod = productionsNonPortfolio.find(p => p.id === a.id);
            return prod && prod.categorie === 'selection';
        });
        const artefactsObligatoires = artefactsRemis.filter(a => {
            const prod = productionsNonPortfolio.find(p => p.id === a.id);
            return prod && prod.categorie === 'obligatoire';
        });

        // Prendre les N meilleures du pool Sélection
        const meilleuresSelection = [...artefactsSelection]
            .sort((a, b) => (b.note || 0) - (a.note || 0))
            .slice(0, nSelection);

        // Toutes les Obligatoires comptent
        artefactsSelectionnes = [...meilleuresSelection, ...artefactsObligatoires];

        // Mettre à jour nombreARetenir pour l'affichage
        nombreARetenir = nSelection;
        methodeSelection = 'hybride-categories';
    } else {
        // Appliquer la modalité de sélection legacy
        switch (methodeSelection) {
            case 'meilleurs':
                artefactsSelectionnes = artefactsRemis
                    .sort((a, b) => (b.note || 0) - (a.note || 0))
                    .slice(0, nombreARetenir);
                break;

            case 'recents':
                // Trier par date de remise (plus récents en premier)
                artefactsSelectionnes = [...artefactsRemis]
                    .sort((a, b) => new Date(b.dateRemise || b.dateEvaluation || 0) - new Date(a.dateRemise || a.dateEvaluation || 0))
                    .slice(0, nombreARetenir);
                break;

            case 'recents-meilleurs':
                // 1. Garder les 50% meilleurs
                const nombreMeilleurs = Math.max(1, Math.ceil(artefactsRemis.length * 0.5));
                const topMeilleurs = [...artefactsRemis]
                    .sort((a, b) => (b.note || 0) - (a.note || 0))
                    .slice(0, nombreMeilleurs);
                // 2. Parmi ceux-ci, prendre les N plus récents
                artefactsSelectionnes = [...topMeilleurs]
                    .sort((a, b) => new Date(b.dateRemise || b.dateEvaluation || 0) - new Date(a.dateRemise || a.dateEvaluation || 0))
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
    // P insuffisant : pas assez d'évaluations pour calculer une note fiable
    const performanceInsuffisante = portfolioActif && nbRemis < minimumCompletion && nbRemis > 0;

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
            <strong>Assiduité (A) :</strong> Indice A = ${indices.A}% — ${periodesPresentes} périodes présentes / ${periodesOffertes} périodes offertes
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
                    <li><strong>• Périodes présentes :</strong> ${periodesPresentes} / ${periodesOffertes}</li>
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
                            const estAbsenceComplete = abs.periodesPresence === 0;
                            const classeBadge = estAbsenceComplete ? 'badge-absence-complete' : 'badge-absence-partielle';

                            return `
                                <div class="badge-absence ${classeBadge}"
                                     data-action="naviguerVersPresenceAvecDate" data-param="${abs.date}">
                                    <span class="badge-absence-date">
                                        ${dateFormatee}
                                    </span>
                                    <span class="badge-absence-heures">
                                        ${estAbsenceComplete
                                            ? `${abs.periodesManquees} pér.`
                                            : `${abs.periodesPresence} pér.`
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
                                const typeIcone = intervention.type === 'individuel' ? '👤' : intervention.type === 'mio' ? '✉️' : '👥';

                                return `
                                    <span class="badge-intervention-vert" data-action="naviguerVersIntervention" data-param="${intervention.id}">
                                        ${typeIcone} ${dateFormatee}
                                        <span class="badge-analyse-count">
                                            ${duree} pér.
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
                                      data-action="evaluerProduction" data-param="${da}" data-param2="${art.id}">
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
                                      data-action="evaluerProduction" data-param="${da}" data-param2="${art.id}"
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
                    ${performanceInsuffisante
                        ? '<span class="profil-valeur-grande" style="color: var(--gris-moyen);">—</span>'
                        : genererValeursComparatives(indicesSOM.P, indicesPAN.P, modeComparatif, aucuneDonneePerformance)}
                </div>

                <!-- Statistiques -->
                <ul class="profil-liste-simple">
                    <li><strong>• ${(() => {
                        if (performanceInsuffisante) {
                            return `Minimum ${minimumCompletion} évaluations requises (${nbRemis}/${minimumCompletion} complétées)`;
                        }
                        if (!portfolioActif) {
                            return 'Performance des productions indépendantes';
                        }

                        // Textes selon la modalité de sélection
                        if (methodeSelection === 'hybride-categories') {
                            const pondSel = configCategories?.selection?.ponderation || 65;
                            const pondObl = configCategories?.obligatoires?.ponderation || 35;
                            return `Performance du portfolio actuel (${nombreARetenir} meilleure${nombreARetenir > 1 ? 's' : ''} Sélection ${pondSel}% + Obligatoires ${pondObl}%)`;
                        }

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

                                return '<div class="u-flex-gap-8 u-mt-10">' + badgesHTML + '</div>';
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

                        if (methodeSelection === 'hybride-categories') {
                            return `${nbRetenus} artefact${nbRetenus > 1 ? 's' : ''} retenus (${nombreARetenir} meilleures Sélection + Obligatoires)`;
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
                                     class="hover-opaque"
                                     data-action="evaluerProduction" data-param="${da}" data-param2="${art.id}"
                                     title="${echapperHtml(art.description)}">
                                    <span class="badge-artefact-titre" style="color: ${couleurBadge};">
                                        A${indexOriginal}
                                    </span>
                                    ${art.jetonReprise ? '<span class="profil-texte-petit" title="Jeton de reprise appliqué">⭐</span>' : ''}
                                    ${art.jetonDelai ? '<span class="profil-texte-petit" title="Jeton de délai appliqué">⭐</span>' : ''}
                                    <span class="badge-artefact-note" style="background: ${couleurBadge};">
                                        ${art.niveau || '--'}
                                    </span>
                                    <span class="u-texte-petit u-texte-gris" style="font-weight: 500;">
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
                            <span style="color: var(--gris-clair); font-weight: 600;">—</span>
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
                    'hybride-categories': `P basé sur les ${nombreARetenir} meilleures Sélection + Obligatoires`,
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

                    <div style="margin-bottom: 15px; font-size: 0.9rem; color: var(--gris-fonce);" data-tooltip="profil-formule-engagement">
                        Formule : E = ∛(A × C × P)
                        <span class="primo-aide" data-target="conseil-formule-engagement-mobilisation" style="margin-left: 5px; display: inline-block !important; cursor: pointer;">📍</span>
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
                                    var(--orange-accent) 0%,
                                    var(--btn-annuler) 25%,
                                    var(--vert-succes) 50%,
                                    var(--bleu-clair) 75%);">
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
                            <div class="legende-risque-item" style="left: 12.5%; color: var(--orange-accent);">
                                <span class="legende-risque-niveau">Fragile</span>
                                <span class="legende-risque-seuil">0.30-0.49</span>
                            </div>
                            <div class="legende-risque-item" style="left: 37.5%; color: var(--btn-annuler);">
                                <span class="legende-risque-niveau">Modéré</span>
                                <span class="legende-risque-seuil">0.50-0.64</span>
                            </div>
                            <div class="legende-risque-item" style="left: 62.5%; color: var(--vert-succes);">
                                <span class="legende-risque-niveau">Favorable</span>
                                <span class="legende-risque-seuil">0.65-0.79</span>
                            </div>
                            <div class="legende-risque-item" style="left: 87.5%; color: var(--bleu-clair);">
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
                    <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-rai">Modèle de la Réponse à l'intervention (RàI)</h2>
                    <div class="profil-message-vide" style="margin: 20px 0;">
                        En attente de données
                    </div>
                    <p class="profil-texte-petit-gris">Les indicateurs RàI seront disponibles après la saisie des premières données.</p>
                </div>

                <!-- Carte 2 : Contexte d'apprentissage -->
                <div class="profil-carte">
                    <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-contexte">Contexte d'apprentissage</h2>
                    <div class="profil-message-vide" style="margin: 20px 0;">
                        En attente de données
                    </div>
                    <p class="profil-texte-petit-gris">Le contexte sera analysé après la saisie des premières données.</p>
                </div>

                <!-- Carte 3 : Observation SOLO -->
                <div class="profil-carte">
                    <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-solo">Observation de la structure des résultats d'apprentissage</h2>
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
            <strong>Utilisation :</strong> Planifier intervention (base-toi sur le niveau RàI et les indicateurs affichés) • Nouvelle intervention (clique sur «Nouvelle intervention») • Consulter historique (clique sur «Consulter» pour voir les détails complets) • Notes individuelles (visibles directement sous chaque intervention)
        </div>

        <!-- 🆕 NOUVEAU : Trois cartes côte à côte (RàI pédagogique + Contexte + Observation SOLO) -->
        <div class="${(() => {
            const config = db.getSync('modalitesEvaluation', {});
            const afficherSOLO = config.afficherDescriptionsSOLO !== false;
            return afficherSOLO ? 'profil-grid-3col' : 'profil-grid-2col';
        })()}">
            <!-- Carte 1 : Modèle de la Réponse à l'intervention (RàI) -->
            <div class="profil-carte">
                <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-rai">Modèle de la Réponse à l'intervention (RàI)</h2>

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
                            noteExplicative = `<span class="u-texte-petit u-texte-gris-clair" style="font-weight: normal; display: block; margin-top: 2px;">Calculée sur les ${nombreARetenir} ${methodeTexte} artefacts</span>`;
                        } else {
                            noteExplicative = `<span class="u-texte-petit u-texte-gris-clair" style="font-weight: normal; display: block; margin-top: 2px;">Calculée sur toutes les évaluations</span>`;
                        }

                        return `${niveau} ${pct.toFixed(0)}%${noteExplicative}`;
                    })()}
                </p>

                <p class="profil-texte-paragraphe" style="margin-top: 12px;"><strong>Progression par critère :</strong> <span class="u-texte-petit u-texte-gris-clair" style="font-weight: normal;">(moyennes sur tous les ${obtenirTermeProduction('pluriel')})</span></p>
                <ul style="margin-left: 20px; color: var(--gris-fonce); font-size: 0.9rem;">
                    ${criteres.map(c => {
                        const pct = c.valeur * 100;
                        const niveau = pct >= 85 ? 'E' : pct >= 75 ? 'M' : pct >= 65 ? 'D' : 'I';
                        return `<li>${echapperHtml(c.nom)} : ${niveau} ${pct.toFixed(0)}%</li>`;
                    }).join('')}
                </ul>

                <div class="profil-separateur-section"></div>

                <div class="badge-sys ${niveauRai.patternBadge}">
                    ${niveauRai.pattern}
                </div>

                <p class="profil-texte-detail">${niveauRai.description}</p>
                ${niveauRai.defi !== 'Aucun' ? `<p class="u-texte-09 u-texte-gris" style="margin-top: 8px;"><strong>Défi principal :</strong> ${niveauRai.defi}</p>` : ''}

                ${(() => {
                    // Indicateur de mobilisation dans la carte RàI
                    // Visible quand A ou C est sous le seuil de mobilisation favorable (75%)
                    if (alerteContexte.niveau === 'attente') return '';
                    const alertes = [];
                    const aVal = parseFloat(alerteContexte.A);
                    const cVal = parseFloat(alerteContexte.C);
                    if (!isNaN(aVal) && aVal < 75) alertes.push('Assiduité ' + alerteContexte.A);
                    if (!isNaN(cVal) && cVal < 75) alertes.push('Complétion ' + alerteContexte.C);
                    if (alertes.length === 0) return '';
                    return '<div style="margin-top: 12px; padding: 8px 12px; background: var(--alerte-fond-attention, rgba(232,168,56,0.08)); border-left: 3px solid var(--orange-attention, #e8a838); border-radius: 0 4px 4px 0; font-size: 0.85rem; color: var(--orange-attention, #e8a838);">' +
                        '<strong>Mobilisation :</strong> ' + alertes.join(' · ') +
                        '</div>';
                })()}
            </div>

            <!-- Carte 2 : Contexte d'apprentissage -->
            <div class="profil-carte">
                <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-contexte">Contexte d'apprentissage</h2>

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

                <p class="u-texte-09 u-texte-gris" style="line-height: 1.5;">
                    ${alerteContexte.recommandation}
                </p>

                <div class="profil-separateur-section"></div>

                <p class="profil-texte-detail-compact">
                    <strong>Services adaptés :</strong> ${etudiant.caf === 'Oui' ? '✓ CAF' : ''} ${etudiant.sa === 'Oui' ? '✓ SA' : ''} ${etudiant.caf !== 'Oui' && etudiant.sa !== 'Oui' ? 'Aucun' : ''}
                </p>

                <button data-action="ouvrirModalConfidentiel" data-param="${da}" class="btn btn-secondaire" style="margin-top: 12px; font-size: 0.85rem;" data-tooltip="profil-confidentiel">
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
                <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-solo">Observation de la structure des résultats d'apprentissage</h2>
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
                <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-solo">Observation de la structure des résultats d'apprentissage</h2>

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

                    // DÉFIS I (Incomplet) - Rouge
                    if (defisSolo.some(d => d.valeur < obtenirSeuil('idme.insuffisant'))) {
                        html += `
                <div>
                    <h4 style="color: ${couleurI}; font-size: 0.9rem; margin-bottom: 10px; font-weight: 600; text-transform: uppercase;">
                        Défis critiques
                    </h4>
                    <div style="background: ${couleurI}22; border-left: 4px solid ${couleurI}; padding: 10px 12px;">
                        <div style="font-weight: bold; color: ${couleurI};">
                            ${defisSolo.filter(d => d.valeur < obtenirSeuil('idme.insuffisant')).map(d => d.nom).join(', ')} : Incomplet (I)
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
        <div class="u-mt-15">
            <div class="u-flex-between-mb10">
                <h4 style="color: var(--accent-primaire); font-size: 0.95rem; margin: 0; font-weight: 600;" data-tooltip="profil-historique">
                    HISTORIQUE ${interventions && interventions.length > 0 ? `(${interventions.length} intervention${interventions.length > 1 ? 's' : ''})` : ''}
                </h4>
                <button class="btn btn-principal" data-action="naviguerVersNouvelleIntervention" data-param="${da}">+ Nouvelle intervention</button>
            </div>
        </div>
    `;

    if (!interventions || interventions.length === 0) {
        html += `
            <div class="carte profil-zone-centre-fond-bleu">
                <div class="u-texte-gris" style="font-size: 0.95rem; font-style: italic;">
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
    html += `<div class="carte u-mb-20" style="padding: 0;">`;

    // Afficher chaque intervention en format timeline compact (une seule ligne)
    interventionsTriees.forEach(intervention => {
        const date = new Date(intervention.date + 'T12:00:00');
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        const dateFormatee = date.toLocaleDateString('fr-CA', options);
        const duree = intervention.duree || 2;
        const typeIcone = intervention.type === 'individuel' ? '👤' : intervention.type === 'mio' ? '✉️' : '👥';
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
                <div class="u-flex-gap-12 u-align-center" style="flex: 1;">
                    <span class="badge-intervention-vert">
                        ${typeIcone} ${badgeTexte}
                    </span>
                    <span class="u-texte-bleu" style="font-weight: 600; font-size: 0.9rem;">
                        ${dateFormatee}
                    </span>
                    ${noteIndividuelle ? `
                        <span class="u-texte-gris u-texte-09" style="flex: 1;">
                            ${noteIndividuelle}
                        </span>
                    ` : ''}
                </div>
                <div class="intervention-timeline-actions">
                    <button class="btn btn-secondaire" data-action="naviguerVersIntervention" data-param="${intervention.id}">
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
            <div class="profil-texte-mono-centre-bleu" style="font-size: 1.1rem;">
                M = (A + C) / 2 = (${indices.A}% + ${indices.C}%) / 2 = ${indices.M}
            </div>
        </div>

        <!-- RECOMMANDATIONS SELON LE NIVEAU -->
        ${interpM.niveau === 'Décrochage' ? `
            <div style="background: var(--gris-tres-pale); border-left: 4px solid var(--gris-clair); padding: 15px;">
                <h4 style="color: var(--gris-fonce); margin-bottom: 10px;">⚫ Actions requises</h4>
                <ul style="margin: 0; padding-left: 20px; color: var(--gris-fonce); line-height: 1.6;">
                    <li>Contact immédiat avec l'aide pédagogique individuelle (API)</li>
                    <li>Tentative de contact direct (téléphone, courriel)</li>
                    <li>Référence aux services d'aide psychosociale si pertinent</li>
                    <li>Documentation du dossier étudiant</li>
                </ul>
            </div>
        ` : (A < 0.7 || C < 0.7) ? `
            <div style="background: ${A < 0.7 && C < 0.7 ? 'rgba(232,64,87,0.12)' : 'rgba(200,160,96,0.12)'};
                        border-left: 4px solid ${A < 0.7 && C < 0.7 ? '#e84057' : '#c8a060'};
                        padding: 15px; border-radius: 6px;">
                <h4 style="color: ${A < 0.7 && C < 0.7 ? '#f06878' : '#d4b878'}; margin-bottom: 10px;">
                    💡 Recommandations d'intervention (niveau critique)
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: ${A < 0.7 && C < 0.7 ? '#f06878' : '#d4b878'}; line-height: 1.6;">
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
            <div class="info-box info-box--attention">
                <h4 style="color: var(--alerte-texte-attention); margin-bottom: 10px;">💡 Recommandations préventives (niveau fragile)</h4>
                <ul style="margin: 0; padding-left: 20px; color: var(--alerte-texte-attention); line-height: 1.6;">
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
            <div style="background: var(--bleu-tres-pale); padding: 15px; border: 2px solid var(--accent-primaire); border-left: 4px solid ${interpE.couleur};">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Engagement (E)</span>
                    <strong class="profil-valeur-grande-bleu">${indices.E}</strong>
                </div>
                <div style="margin-top: 8px; font-size: 0.85rem; color: var(--gris-fonce);">
                    E = ∛(A × C × P)
                    <span class="primo-aide" data-target="conseil-formule-engagement-carte" style="margin-left: 5px; display: inline-block !important; cursor: pointer;">📍</span>
                </div>
                <div style="margin-top: 8px; padding: 6px 10px; background: var(--alerte-fond-attention); border-left: 3px solid var(--orange-accent); font-size: 0.8rem; color: var(--gris-fonce);">
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
            <div style="color: var(--gris-moyen); line-height: 1.5;">
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
                <span class="primo-aide" data-target="conseil-formule-engagement-principale" style="display: inline-block !important; cursor: pointer;">📍</span>
            </div>
            <div class="profil-texte-mono-centre-bleu">
                E = ∛(${A.toFixed(2)} × ${C.toFixed(2)} × ${P.toFixed(2)}) = ${indices.E}
            </div>
            <div style="background: var(--bleu-tres-pale); padding: 12px; border-radius: 4px; font-size: 0.9rem; color: var(--gris-fonce); line-height: 1.6;">
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
            <div style="background: var(--bleu-pale); border: 1px solid var(--bleu-clair); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <h4 style="color: var(--bleu-clair); margin-bottom: 10px;">🎯 Prochain objectif</h4>
                <div style="color: var(--bleu-clair); line-height: 1.6;">
                    <strong>Seuil à atteindre :</strong> ${prochainSeuil}<br>
                    <strong>Distance :</strong> ${(distanceSeuil * 100).toFixed(1)} points<br>
                    ${facteurLimitant.valeur < 0.70 ?
                        `<strong>💡 Levier principal :</strong> Améliorer ${facteurLimitant.nom} pour un effet multiplicatif maximum` : ''}
                </div>
            </div>
        ` : `
            <div class="info-box info-box--info" style="margin-bottom: 15px;">
                <div style="color: var(--bleu-clair); font-weight: bold;">
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
                        var(--bleu-clair) 0%, var(--bleu-clair) 20%,
                        var(--vert-succes) 20%, var(--vert-succes) 35%,
                        var(--btn-annuler) 35%, var(--btn-annuler) 50%,
                        var(--orange-accent) 50%, var(--orange-accent) 70%,
                        var(--rouge-erreur) 70%, var(--rouge-erreur) 100%);">
                <div class="profil-echelle-indicateur-haut" style="left: ${Math.min(indices.R * 100, 100)}%;">▼</div>
                <div class="profil-echelle-indicateur-bas" style="left: ${Math.min(indices.R * 100, 100)}%;">R = ${indices.R}</div>
            </div>

            <div class="legende-risque-container">
                <div class="legende-risque-item" style="left: 10%; color: var(--bleu-clair);">
                    <span class="legende-risque-niveau">Minimal</span>
                    <span class="legende-risque-seuil">0-0.19</span>
                </div>
                <div class="legende-risque-item" style="left: 27.5%; color: var(--vert-succes);">
                    <span class="legende-risque-niveau">Faible</span>
                    <span class="legende-risque-seuil">0.20-0.34</span>
                </div>
                <div class="legende-risque-item" style="left: 42.5%; color: var(--btn-annuler);">
                    <span class="legende-risque-niveau">Modéré</span>
                    <span class="legende-risque-seuil">0.35-0.49</span>
                </div>
                <div class="legende-risque-item" style="left: 60%; color: var(--orange-accent);">
                    <span class="legende-risque-niveau">Élevé</span>
                    <span class="legende-risque-seuil">0.50-0.69</span>
                </div>
                <div class="legende-risque-item" style="left: 85%; color: var(--rouge-erreur);">
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
            <span class="primo-aide" data-target="conseil-formule-engagement">📍</span>
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

            <p style="margin-top: 10px; color: var(--gris-moyen); font-style: italic;">💡 C'est une moyenne géométrique qui mesure la mobilisation globale tout en respectant l'interdépendance des trois dimensions.</p>
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

// calculerPerformancePAN → déplacé dans indices.js (#206)

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
    const indices = db.getSync(cle('indicesAssiduite'), {});
    const detailsSommatif = indices.sommatif && indices.sommatif[da];

    // Si les données n'existent pas, retourner des valeurs par défaut
    if (!detailsSommatif || typeof detailsSommatif !== 'object') {
        console.warn(`⚠️ Aucune donnée d'assiduité pour ${da}, valeurs par défaut`);
        return {
            periodesPresentes: 0,
            periodesOffertes: 0,
            nombreSeances: 0,
            absences: []
        };
    }

    // 🆕 BETA 96.1: Utiliser directement les périodes (plus simple que les heures)
    const periodesPresentes = Math.round(detailsSommatif.periodesPresentes || 0);
    const periodesOffertes = Math.round(detailsSommatif.periodesOffertes || 0);
    const nombreSeances = detailsSommatif.nombreSeances || 0;

    // #224 : Récupérer les présences et construire datesSaisies depuis le GROUPE (pas juste l'étudiant)
    const presences = obtenirDonneesSelonMode('presences') || [];
    const etudiantsGroupe = obtenirDonneesSelonMode('groupeEtudiants') || [];
    const dasGroupe = new Set();
    if (Array.isArray(etudiantsGroupe)) {
        etudiantsGroupe.forEach(e => { if (e.da) dasGroupe.add(String(e.da)); });
    }
    const datesSaisies = new Set();
    presences.forEach(p => {
        if (p.date && dasGroupe.has(String(p.da))) datesSaisies.add(p.date);
    });

    // Source de vérité : calendrier des séances
    const seancesCompletes = typeof obtenirSeancesCompletes === 'function'
        ? obtenirSeancesCompletes() : {};
    const aujourdhui = new Date().toISOString().split('T')[0];

    const seances = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire()
        : db.getSync(cle('seancesHoraire'), []);
    const dureePeriodeMin = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;

    // Détecter les absences (totales ET partielles)
    const absences = [];

    // Itérer les dates du calendrier filtrées par datesSaisies et <= aujourd'hui
    const datesCalendrier = Object.keys(seancesCompletes).filter(d => d <= aujourdhui && datesSaisies.has(d)).sort();

    datesCalendrier.forEach(dateCours => {
        // Chercher le record NON-facultatif de l'étudiant
        const presenceEleve = presences.find(p => p.da === da && p.date === dateCours && !p.facultatif);

        // Nombre de périodes de la séance
        const periodesSeance = typeof obtenirNombrePeriodesSeance === 'function'
            ? obtenirNombrePeriodesSeance(dateCours) : 2;

        // Nombre de périodes de présence de l'étudiant
        let periodesPresenceEleve = 0;
        if (presenceEleve) {
            if (presenceEleve.periodesPresentes !== undefined && presenceEleve.periodesPresentes !== null) {
                periodesPresenceEleve = presenceEleve.periodesPresentes;
            } else if (presenceEleve.heures !== undefined && presenceEleve.heures !== null) {
                periodesPresenceEleve = Math.round(presenceEleve.heures * 60 / dureePeriodeMin);
            }
        } else {
            // Pas de record régulier — vérifier si c'est une séance uniquement facultative
            const presencesFacultatives = presences.filter(p => p.date === dateCours && p.facultatif === true);
            const aRecordGroupe = presences.some(p => p.date === dateCours && !p.facultatif);
            if (!aRecordGroupe && presencesFacultatives.length > 0) {
                // Séance uniquement facultative → ignorer
                return;
            }
        }

        // Détecter absence totale ou partielle
        if (periodesPresenceEleve === 0) {
            const seance = seances.find(s => s.date === dateCours);
            absences.push({
                date: dateCours,
                periodesPresence: 0,
                periodesManquees: periodesSeance,
                seance: seance
            });
        } else if (periodesPresenceEleve < periodesSeance) {
            const seance = seances.find(s => s.date === dateCours);
            absences.push({
                date: dateCours,
                periodesPresence: periodesPresenceEleve,
                periodesManquees: periodesSeance - periodesPresenceEleve,
                seance: seance
            });
        }
    });

    // Trier par date CROISSANTE (plus ancien en premier)
    absences.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
        periodesPresentes,
        periodesOffertes,
        nombreSeances,
        absences
    };
}


// formaterDate() — supprimée, canonique dans main.js (Beta 97.1 #68)

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
            <div class="info-box info-box--attention">
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
            <strong>Utilisation :</strong> Cette section te guide dans le choix d'interventions appropriées. Les recommandations sont contextualisées selon les besoins spécifiques de l'étudiant. Consulte la section Accompagnement pour planifier et documenter tes interventions.
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
            <div class="section-collapsible-header" data-action="toggleSectionCollapsible" data-param="${sectionId}">
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
        case 'travaux':
            titre = 'Travaux soumis';
            contenu = genererSectionTravaux(da);
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
        toggleInfo = `<span class="primo-aide" data-target="details-calculs-risque-${da}">📍</span>`;
    } else if (section === 'performance') {
        toggleInfo = `<span class="primo-aide" data-target="details-calculs-performance-${da}">📍</span>`;
    } else if (section === 'mobilisation') {
        toggleInfo = `<span class="primo-aide" data-target="details-calculs-mobilisation-${da}">📍</span>`;
    } else if (section === 'accompagnement') {
        toggleInfo = `<span class="primo-aide" data-target="details-calculs-accompagnement-${da}">📍</span>`;
    }

    contenuContainer.innerHTML = `
        <div class="profil-contenu-header">
            <h2 class="u-flex-between-mb20">
                <span data-tooltip="${{'productions':'profil-productions','mobilisation':'profil-engagement','progression':'profil-progression','performance':'profil-habiletes','accompagnement':'profil-accompagnement','travaux':'profil-travaux','rapport':'profil-rapport'}[section] || ''}">${titre}</span>
                ${toggleInfo}
            </h2>
        </div>
        <div class="profil-contenu-body">
            ${contenu}
        </div>
    `;

    // Charger les thumbnails async (section travaux)
    if (section === 'travaux' && typeof travauxStockage !== 'undefined') {
        travauxStockage.chargerThumbnailsConteneur(contenuContainer);
    }

    // Réattacher les événements des toggles et Primo après changement de section
    setTimeout(() => {
        if (typeof reattacherEvenementsToggles === 'function') {
            reattacherEvenementsToggles();
        }

        // Réinitialiser les tooltips pour les icônes 📍 dynamiques
        if (typeof initialiserPrimoTooltips === 'function') {
            initialiserPrimoTooltips();
        }

        // Restaurer les préférences du rapport si on vient de charger cette section
        if (section === 'rapport') {
            restaurerPreferencesRapport(da);
        }
    }, 100);

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

    // Filtrer les productions évaluables selon la pratique active
    const productionsIds = obtenirIdsProductionsEvaluables(productions);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        productionsIds.includes(e.productionId) &&
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
function calculerDirectionsCriteres(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // Obtenir le nombre de productions configuré pour l'analyse des patterns
    const N = obtenirNombreProductionsPourPatterns() || 3;

    // Toutes les évaluations de l'étudiant avec critères structurés
    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        e.criteres && Array.isArray(e.criteres) && e.criteres.length > 0
    );

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
    // Utilise evaluation.criteres[] (fiable) au lieu du parsing regex de retroactionFinale
    const extraireScoresCriteres = (evals) => {
        const scoresCriteres = {
            structure: [],
            rigueur: [],
            plausibilite: [],
            nuance: [],
            francais: []
        };

        evals.forEach(evaluation => {
            if (!evaluation.criteres || !Array.isArray(evaluation.criteres)) return;

            evaluation.criteres.forEach(c => {
                const niveauIDME = c.niveauSelectionne;
                const score = convertirNiveauIDMEEnScore(niveauIDME, tableConversion);
                if (score === null) return;

                const nom = (c.critereNom || '').toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');

                if (nom === 'structure') scoresCriteres.structure.push(score);
                else if (nom === 'rigueur') scoresCriteres.rigueur.push(score);
                else if (nom.startsWith('plausibilit')) scoresCriteres.plausibilite.push(score);
                else if (nom === 'nuance') scoresCriteres.nuance.push(score);
                else if (nom.startsWith('francais') || nom.startsWith('franc')) scoresCriteres.francais.push(score);
            });
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
            <span class="u-texte-mini u-texte-gris" style="display: block; margin-top: 3px;">
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
        return `<span style="color: var(--gris-clair); font-weight: 600;">—</span>`;
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
function afficherProfilComplet(daOuEl) {
    // Phase 5 : accepte un élément (depuis data-on-change) ou une chaîne (depuis data-action / appel direct)
    var da = (typeof daOuEl === 'object' && daOuEl !== null) ? daOuEl.value : daOuEl;
    // Les DA sont des identifiants string — le dispatcher peut les convertir en nombre
    if (da !== null && da !== undefined) da = String(da);

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
    const etudiants = tousEtudiants.filter(e => !estEtudiantExclu(e));

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
        afficherSousSection('suivi-profil');
    }

    const container = document.getElementById('contenuProfilEtudiant');
    if (!container) {
        console.error('❌ Élément #contenuProfilEtudiant introuvable');
        return;
    }

    // 🔄 FIX #220: Forcer le recalcul complet A + C + P avant affichage
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes(null);
    }
    if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') {
        calculerEtSauvegarderIndicesAssiduite();
    }
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
    } else if (sectionAffichee === 'travaux') {
        titreSection = 'Travaux soumis';
        contenuSection = genererSectionTravaux(da);
    }

    // Générer le HTML avec layout sidebar matériel
    container.innerHTML = `
        <div class="layout-sidebar-2col">
            <!-- SIDEBAR GAUCHE (navigation) -->
            <div class="sidebar-navigation">
                <!-- Sélecteur d'étudiant -->
                <div class="sidebar-filtre">
                    <label class="u-texte-mini u-texte-gris" style="margin-bottom: 5px; display: block;" data-tooltip="profil-selecteur">Étudiant·e :</label>
                    <select id="selecteurEtudiantProfil" class="controle-form" data-on-change="afficherProfilComplet">
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
                            data-action="afficherProfilComplet" data-param="${etudiantPrecedent?.da}"
                            ${!etudiantPrecedent ? 'disabled' : ''}
                            title="Étudiant·e précédent·e">
                        ← Préc.
                    </button>
                    <button class="btn btn-principal"
                            data-action="afficherProfilComplet" data-param="${etudiantSuivant?.da}"
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
                    <div class="sidebar-section-titre" data-tooltip="profil-nav-observations">OBSERVATIONS</div>

                    <!-- 1. Productions -->
                    <div class="sidebar-item ${sectionAffichee === 'productions' ? 'active' : ''}" data-action="changerSectionProfil" data-param="productions">
                        <div class="sidebar-item-titre">Productions</div>
                    </div>

                    <!-- 2. Engagement -->
                    <div class="sidebar-item ${sectionAffichee === 'mobilisation' ? 'active' : ''}" data-action="changerSectionProfil" data-param="mobilisation">
                        <div class="sidebar-item-titre">Engagement</div>
                    </div>

                    <!-- 2b. Progression temporelle -->
                    <div class="sidebar-item ${sectionAffichee === 'progression' ? 'active' : ''}" data-action="changerSectionProfil" data-param="progression">
                        <div class="sidebar-item-titre">Progression temporelle</div>
                    </div>

                    <!-- 3. Développement des habiletés -->
                    <div class="sidebar-item ${sectionAffichee === 'performance' ? 'active' : ''}" data-action="changerSectionProfil" data-param="performance">
                        <div class="sidebar-item-titre">Développement des habiletés</div>
                    </div>

                    <!-- 4. Accompagnement (affiché uniquement si RàI activé) -->
                    ${activerRai ? `
                    <div class="sidebar-item ${sectionAffichee === 'accompagnement' ? 'active' : ''}" data-action="changerSectionProfil" data-param="accompagnement">
                        <div class="sidebar-item-titre">Accompagnement</div>
                    </div>
                    ` : ''}

                    <!-- 5. Travaux soumis (Beta 96.3) -->
                    <div class="sidebar-item ${sectionAffichee === 'travaux' ? 'active' : ''}" data-action="changerSectionProfil" data-param="travaux">
                        <div class="sidebar-item-titre">Travaux soumis</div>
                    </div>

                    <!-- 6. Rapport -->
                    <div class="sidebar-item ${sectionAffichee === 'rapport' ? 'active' : ''}" data-action="changerSectionProfil" data-param="rapport">
                        <div class="sidebar-item-titre">Rapport</div>
                    </div>
                </div>
            </div>

            <!-- ZONE PRINCIPALE (centrale, scroll) -->
            <div class="zone-principale" id="profil-contenu-dynamique">
                <!-- Contenu dynamique chargé par changerSectionProfil() -->
                <div class="profil-contenu-header">
                    <h2 class="u-flex-between-mb20">
                        <span data-tooltip="${{'productions':'profil-productions','mobilisation':'profil-engagement','progression':'profil-progression','performance':'profil-habiletes','accompagnement':'profil-accompagnement','travaux':'profil-travaux','rapport':'profil-rapport'}[sectionAffichee] || ''}">${titreSection}</span>
                        <span class="primo-aide" data-target="details-calculs-risque-${da}">📍</span>
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

        // Réinitialiser les tooltips pour les icônes 📍 dynamiques
        if (typeof initialiserPrimoTooltips === 'function') {
            initialiserPrimoTooltips();
        }

        // Restaurer les préférences du rapport si on est sur cette section
        if (sectionAffichee === 'rapport') {
            restaurerPreferencesRapport(da);
        }

        // Charger les thumbnails async (section travaux)
        if (sectionAffichee === 'travaux' && typeof travauxStockage !== 'undefined') {
            travauxStockage.chargerThumbnailsConteneur(container);
        }
    }, 100);

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
    const taux = details.periodesOffertes > 0
        ? (details.periodesPresentes / details.periodesOffertes * 100).toFixed(1)
        : 0;

    return `
        <!-- STATISTIQUES avec classes CSS natives -->
        <div class="profil-grid-auto-200">
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Périodes présentes</span>
                    <strong class="profil-valeur-grande-bleu">${details.periodesPresentes}</strong>
                </div>
            </div>
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Périodes offertes</span>
                    <strong class="profil-valeur-grande-bleu">${details.periodesOffertes}</strong>
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
            <div class="u-flex-gap-10">
                ${details.absences.map(abs => {
                    const date = new Date(abs.date + 'T12:00:00');
                    const options = { weekday: 'short', day: 'numeric', month: 'short' };
                    const dateFormatee = date.toLocaleDateString('fr-CA', options);
                    const estAbsenceComplete = abs.heuresPresence === 0;
                    const classeBadge = estAbsenceComplete ? 'badge-absence-complete' : 'badge-absence-partielle';

                    return `
                        <div class="badge-absence ${classeBadge}"
                             data-action="naviguerVersPresenceAvecDate" data-param="${abs.date}">
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
    // IMPORTANT: Utiliser obtenirDonneesSelonMode pour respecter le mode actif (normal, anonymisation)
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
                <p class="u-texte-gris" style="font-size: 1.1rem;">Aucune production configurée</p>
                <p class="u-texte-gris-clair u-mt-10">Crée des productions dans la section Matériel → Productions</p>
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
            // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
            const infoCoursProf = db.getSync('infoCours', null);
            const gcIdProf = infoCoursProf ? (infoCoursProf._groupeCoursId || infoCoursProf.id || null) : null;
            const echeanceProf = (typeof obtenirEcheanceEffective === 'function')
                ? obtenirEcheanceEffective(production, gcIdProf).date
                : production.dateEcheance;
            // Note: +T12:00:00 évite le décalage de fuseau horaire (UTC vs local)
            const dateEcheance = echeanceProf || '';
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
            const statutRemise = evaluation.statutRemise || 'evalue';
            const statutIntegrite = evaluation.statutIntegrite || 'recevable';
            const estNonRemis = statutRemise === 'non-remis' || statutRemise === 'retard';
            const estNonRecevable = statutIntegrite === 'plagiat' || statutIntegrite === 'ia';

            return {
                production: production.titre,
                description: production.activiteApprentissage || production.description || production.titre,
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
            // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
            const infoCoursNonEval = db.getSync('infoCours', null);
            const gcIdNonEval = infoCoursNonEval ? (infoCoursNonEval._groupeCoursId || infoCoursNonEval.id || null) : null;
            const echeanceNonEval = (typeof obtenirEcheanceEffective === 'function')
                ? obtenirEcheanceEffective(production, gcIdNonEval).date
                : production.dateEcheance;
            // Note: +T12:00:00 évite le décalage de fuseau horaire (UTC vs local)
            const dateEcheance = echeanceNonEval || '';
            const dateFormateeNonEval = dateEcheance ? new Date(dateEcheance + 'T12:00:00').toLocaleDateString('fr-CA') : '—';
            return {
                production: production.titre,
                description: production.activiteApprentissage || production.description || production.titre,
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
                    const titre = prod?.activiteApprentissage || prod?.description || prod?.titre || `Artefact ${i + 1}`;
                    return `<li>${echapperHtml(titre)} <strong>${art.niveau} ${art.note.toFixed(1)}%</strong></li>`;
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
            <h3 style="color: var(--accent-primaire); margin: 0 0 15px 0;">Liste des productions</h3>
            <div style="overflow-x: auto;">
                <table class="tableau">
                    <thead>
                        <tr>
                            <th>Production</th>
                            <th>Description</th>
                            <th data-tooltip="profil-col-jeton">Jeton</th>
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
                            <tr style="border-bottom: 1px solid var(--bordure-claire);">
                                <td class="profil-tableau-cellule-p12">
                                    ${echapperHtml(ligne.production)}
                                </td>
                                <td style="padding: 12px; color: var(--gris-moyen);">${echapperHtml(ligne.description)}</td>
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
                                <td style="padding: 12px; text-align: center; color: var(--gris-moyen);">${ligne.date}</td>
                                <td style="padding: 12px; text-align: center; white-space: nowrap;">
                                    ${(ligne.statutRemise === 'non-remis' || ligne.statutRemise === 'retard')
                                        ? `
                                        <button class="btn btn-principal btn-compact"
                                                data-action="evaluerProduction" data-param="${da}" data-param2="${ligne.productionId}">
                                            Évaluer
                                        </button>
                                        `
                                        : (ligne.statut === 'evalue'
                                            ? `
                                            <button class="btn btn-secondaire btn-compact"
                                                    data-action="consulterEvaluation" data-param="${da}" data-param2="${ligne.productionId}">
                                                Consulter
                                            </button>
                                            `
                                            : `
                                            <button class="btn btn-principal btn-compact"
                                                    data-action="evaluerProduction" data-param="${da}" data-param2="${ligne.productionId}">
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
        return '<p style="color: var(--gris-clair);">Ensemble d\'objectifs introuvable</p>';
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
        'fondamental': 'var(--bleu-clair)',      // Bleu
        'integrateur': 'var(--orange-accent)',      // Orange
        'transversal': '#9C27B0'       // Violet (pas de variable définie)
    };

    return `
        <!-- Note finale pratique multi-objectifs -->
        <div style="background: var(--surface-conteneur, #142428); padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
            <div class="u-texte-09 u-texte-gris" style="margin-bottom: 5px;">
                Note finale pondérée (${noteFinaleMultiObjectifs.nbObjectifsEvalues}/${ensemble.objectifs.length} objectifs évalués)
            </div>
            <div style="font-size: 3rem; font-weight: bold; color: ${obtenirCouleurIndice(noteFinale)};">
                ${noteFinale.toFixed(1)}/100
            </div>
            <div class="u-texte-mini u-texte-gris-clair" style="margin-top: 5px;">
                Σ(P_objectif × poids) / 100
            </div>
        </div>

        <!-- Résumé forces et défis -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background: var(--vert-pale, #e8f5e9); padding: 15px; border-radius: 6px; border-left: 4px solid var(--vert-succes);">
                <div style="font-weight: bold; color: var(--vert-succes); margin-bottom: 5px;">✅ Forces (≥ ${(seuil * 100).toFixed(0)}%)</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--vert-succes);">${forces.length}</div>
                ${forces.length > 0 ? `<div class="u-texte-mini u-texte-gris" style="margin-top: 5px;">${forces.map(f => f.nom).join(', ')}</div>` : ''}
            </div>
            <div style="background: var(--orange-pale, #fff3e0); padding: 15px; border-radius: 6px; border-left: 4px solid var(--orange-accent);">
                <div style="font-weight: bold; color: var(--orange-accent); margin-bottom: 5px;">⚠️ Défis (< ${(seuil * 100).toFixed(0)}%)</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--orange-accent);">${defis.length}</div>
                ${defis.length > 0 ? `<div class="u-texte-mini u-texte-gris" style="margin-top: 5px;">${defis.map(d => d.nom).join(', ')}</div>` : ''}
            </div>
        </div>

        <!-- Tableau détaillé des objectifs -->
        <h4 class="profil-section-titre-large" style="margin-bottom: 15px;">
            🎯 Détail des ${ensemble.objectifs.length} objectifs d'apprentissage
        </h4>

        <div style="background: var(--surface-conteneur, #142428); border-radius: 6px; overflow: hidden;">
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
                        let couleurNiveau = 'var(--gris-clair)';
                        let statut = '⏸️';
                        let couleurStatut = 'var(--gris-clair)';
                        let labelStatut = 'Non évalué';

                        if (P !== null) {
                            // Convertir en niveau IDME
                            niveau = obtenirNiveauIDMEDepuisPourcentage(P);
                            couleurNiveau = obtenirCouleurNiveauIDME(niveau);

                            // Déterminer statut
                            if (P >= seuil * 100) {
                                statut = '✅';
                                couleurStatut = 'var(--vert-succes)';
                                labelStatut = 'Force';
                            } else {
                                statut = '⚠️';
                                couleurStatut = 'var(--orange-accent)';
                                labelStatut = 'Défi';
                            }
                        }

                        const couleurBordure = couleurType[obj.type] || '#999';

                        return `
                            <tr style="border-left: 4px solid ${couleurBordure};">
                                <td style="padding: 12px;">
                                    <div style="font-weight: bold; margin-bottom: 3px;">${echapperHtml(obj.nom)}</div>
                                    ${nbArtefacts > 0 ? `<div class="u-texte-mini u-texte-gris">${nbArtefacts} artefact${nbArtefacts > 1 ? 's' : ''}</div>` : ''}
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
                                    ` : `<span style="color: var(--gris-clair);">--</span>`}
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
        <div style="background: var(--surface-conteneur, #142428); padding: 15px; border-radius: 6px; margin-top: 15px; font-size: 0.85rem; color: var(--gris-moyen);">
            <div style="margin-bottom: 10px;"><strong>Légende types :</strong></div>
            <div class="u-flex-gap-15">
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
/**
 * Génère le HTML du bandeau contextuel (trimestre | cours) pour les graphiques profil
 * Note : pas d'effectif ici — c'est un profil individuel, pas un groupe
 * @returns {string} HTML du bandeau ou chaîne vide si préférence désactivée
 */
function genererBandeauContexteProfil() {
    // Vérifier la préférence
    let afficher = true;
    try {
        const prefs = db.getSync('preferencesAffichage') || {};
        afficher = prefs.afficherContexteGraphiques !== false;
    } catch (e) { console.warn('[Profil] preferencesAffichage read fallback (default: true):', e.message || e); }
    if (!afficher) return '';

    // Trimestre
    let nomTrimestre = '';
    if (typeof obtenirTrimestreActif === 'function') {
        const trimestre = obtenirTrimestreActif();
        if (trimestre) {
            const sessionLower = trimestre.session?.toLowerCase();
            if (sessionLower === 'd') {
                nomTrimestre = 'Démo';
            } else {
                const sessionNom = { 'hiver': 'Hiver', 'automne': 'Automne', 'ete': 'Été', 'h': 'Hiver', 'a': 'Automne', 'e': 'Été' }[sessionLower] || trimestre.session || '';
                nomTrimestre = `${sessionNom} ${trimestre.annee || ''}`.trim();
            }
        }
    }

    // Cours
    const infoCours = db.getSync('infoCours', null);
    let nomCours = '';
    if (infoCours) {
        const sigle = infoCours.codeCours || infoCours.sigle || infoCours.code || '';
        const groupe = infoCours.groupe || '';
        if (sigle && groupe) {
            const modeActif = db.getSync('modeApplication', 'normal');
            const groupeAffiche = (modeActif === 'anonymisation' && typeof anonymiserGroupe === 'function')
                ? anonymiserGroupe(groupe)
                : `gr. ${groupe}`;
            nomCours = `${sigle} ${groupeAffiche}`;
        } else if (sigle) {
            nomCours = sigle;
        }
    }

    return `<span style="margin-left: auto; display: flex; gap: 8px; align-items: center; font-size: 0.78rem; color: var(--texte-muted);">
        <span>${nomTrimestre || '—'}</span>
        <span>|</span>
        <span>${nomCours || '—'}</span>
    </span>`;
}

function genererSectionProgression(da) {
    // Vérifier si le module de captures existe
    if (typeof obtenirSnapshotsEtudiant !== 'function') {
        return `
            <div class="profil-zone-moyenne-bleu">
                <p class="u-texte-gris" style="font-size: 0.95rem;">
                    Le module de captures n'est pas encore initialisé.
                </p>
                <p class="u-texte-gris-clair u-mt-10" style="font-size: 0.85rem;">
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
                <p class="u-texte-gris u-mb-10" style="font-size: 0.95rem;">
                    Les graphiques de progression afficheront l'évolution temporelle des indices A-C-P-E une fois que des données auront été collectées.
                </p>
                <p class="u-texte-gris-clair" style="font-size: 0.85rem;">
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

    // Vérifier si l'étudiant a des jetons de reprise (pour afficher la checkbox)
    let aDesJetonsReprise = false;
    try {
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        aDesJetonsReprise = evaluations.some(e =>
            e.etudiantDA === da && !e.remplaceeParId &&
            (e.jetonRepriseApplique || e.repriseDeId ||
             e.jetonRepriseCibleeApplique || e.repriseDeIdCiblee)
        );
    } catch (e) { console.warn('[Profil] jetons reprise detection skipped:', e.message || e); }

    // Créer le HTML avec le canvas
    const checkboxSansReprises = aDesJetonsReprise ? `
                <label style="display: inline-flex; align-items: center; gap: 5px; cursor: pointer; color: var(--vert-succes); font-size: 0.85rem; margin-left: 8px;">
                    <input type="checkbox" checked data-on-change="togglePSansReprisesIndivHandler" data-da="${da}">
                    <svg width="16" height="2"><line x1="0" y1="1" x2="16" y2="1" stroke="var(--vert-succes)" stroke-width="1.5" stroke-dasharray="4 2"/></svg>
                    P sans reprises
                </label>` : '';

    const html = `
        <div class="profil-zone-moyenne-bleu">
            <!-- Légende des indices -->
            <div style="background: var(--surface-conteneur, #142428); padding: 12px 20px; border-radius: 6px; margin-bottom: 10px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                <span style="font-weight: 600; color: var(--gris-fonce);">Indices :</span>
                <label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: #1976D2; font-size: 0.78rem;">
                    <input type="checkbox" checked data-on-change="toggleIndiceIndivHandler" data-label="Assiduité (A)" data-da="${da}">
                    <span style="width: 10px; height: 10px; background: #1976D2; border-radius: 50%; display: inline-block;"></span>
                    Assiduité (A)
                </label>
                <label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: #FF6B35; font-size: 0.78rem;">
                    <input type="checkbox" checked data-on-change="toggleIndiceIndivHandler" data-label="Complétion (C)" data-da="${da}">
                    <span style="width: 10px; height: 10px; background: #FF6B35; border-radius: 50%; display: inline-block;"></span>
                    Complétion (C)
                </label>
                <label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: #4CAF50; font-size: 0.78rem;">
                    <input type="checkbox" checked data-on-change="toggleIndiceIndivHandler" data-label="Performance (P)" data-da="${da}">
                    <span style="width: 10px; height: 10px; background: #4CAF50; border-radius: 50%; display: inline-block;"></span>
                    Performance (P)
                </label>
                ${checkboxSansReprises}
                ${genererBandeauContexteProfil()}
            </div>

            <!-- Canvas pour le graphique Chart.js -->
            <div style="background: var(--surface-conteneur, #142428); padding: 20px; border-radius: 6px; height: 450px;">
                <canvas id="${canvasId}"></canvas>
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

    // Vérifier si l'étudiant a des évaluations avec détails critères
    if (typeof creerGraphiqueCriteres === 'function') {
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

        const evaluationsAvecCriteres = evaluations.filter(e =>
            e.etudiantDA === da &&
            !e.remplaceeParId &&
            e.criteres &&
            Array.isArray(e.criteres) &&
            e.criteres.length > 0
        );

        if (evaluationsAvecCriteres.length > 0) {

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

            // Générer la légende HTML avec checkboxes
            const legendeHTML = criteresUniques.map((critere, index) => {
                const couleur = COULEURS_CRITERES[index % COULEURS_CRITERES.length];
                const critereEscaped = critere.replace(/'/g, "\\'");
                return `<label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: ${couleur}; font-size: 0.78rem;">
                    <input type="checkbox" checked data-on-change="toggleCritereIndivHandler" data-critere="${critereEscaped}" data-da="${da}">
                    <span style="width: 10px; height: 10px; background: ${couleur}; border-radius: 50%; display: inline-block;"></span>
                    ${critere}
                </label>`;
            }).join('');

            graphiqueCriteres = `
                <div class="profil-zone-moyenne-bleu" style="margin-bottom: 20px;">
                    <!-- Légende des critères -->
                    <div style="background: var(--surface-conteneur, #142428); padding: 12px 20px; border-radius: 6px; margin-bottom: 10px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                        <span style="font-weight: 600; color: var(--gris-fonce);">Critères :</span>
                        ${legendeHTML}
                        ${genererBandeauContexteProfil()}
                    </div>

                    <!-- Canvas pour le graphique Chart.js -->
                    <div style="background: var(--surface-conteneur, #142428); padding: 20px; border-radius: 6px; height: 450px;">
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
                    <p class="u-texte-gris">Pratique multi-objectifs activée avec l'ensemble «${echapperHtml(statusPratiqueMultiObjectifs.ensemble.nom)}»</p>
                    <p class="u-texte-gris-clair u-mt-10">Aucune évaluation disponible pour le moment</p>
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
                <p class="u-texte-gris">Aucune évaluation disponible pour le moment</p>
            </div>
        `;
    }

    const moyenne = meilleures.reduce((sum, m) => sum + m.note, 0) / meilleures.length;

    return `
        ${graphiqueCriteres}
        <div style="padding: 15px; background: var(--bleu-tres-pale); border-radius: 6px;">
            <div style="background: var(--surface-conteneur, #142428); padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
                <div class="u-texte-09 u-texte-gris" style="margin-bottom: 5px;">
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
                <div style="background: var(--surface-conteneur, #142428); padding: 15px; margin-bottom: 10px; border-left: 4px solid ${obtenirCouleurIndice(art.note)};">
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
                            <div style="font-size: 0.9rem; color: var(--texte-secondaire); font-weight: bold;">
                                ${art.niveau}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}

            <div style="background: var(--surface-conteneur, #142428); padding: 15px; border-radius: 6px; margin-top: 15px; font-size: 0.9rem; color: var(--gris-moyen);">
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
    if (indiceActif === indice && !panneau.classList.contains('u-hide')) {
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
    let couleurBordure = 'var(--accent-primaire)';
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
    panneau.classList.remove('u-hide');

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
        panneau.classList.add('u-hide');
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
            <div style="background: var(--alerte-fond-attention); border: 2px dashed var(--btn-annuler); border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 1.2rem; color: var(--alerte-texte-attention); margin-bottom: 10px;">
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
                                    background: var(--vert-pale, #d4edda); border-left: 3px solid var(--vert-succes);">
                            <div style="color: var(--alerte-texte-succes); font-weight: 500; margin-bottom: 5px;">
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
                                    background: var(--gris-tres-pale); border-left: 3px solid var(--bordure-claire); opacity: 0.6;">
                            <div style="color: var(--gris-moyen); font-weight: 500; margin-bottom: 5px;">
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
                        padding: 30px 20px; text-align: center; color: var(--texte-secondaire); font-style: italic;">
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

    // Filtrer les productions évaluables selon la pratique active
    const productionsIds = obtenirIdsProductionsEvaluables(productions);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        productionsIds.includes(e.productionId) &&
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

    // Filtrer les productions évaluables selon la pratique active
    const productionsIds = obtenirIdsProductionsEvaluables(productions);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        productionsIds.includes(e.productionId) &&
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
    const directionsCriteres = calculerDirectionsCriteres(da);

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

    // Filtrer les productions évaluables selon la pratique active
    const productionsIds = obtenirIdsProductionsEvaluables(productions);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        productionsIds.includes(e.productionId) &&
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


    // Blocage critique : Performance < 64% (Incomplet - unistructurel)
    if (performancePAN3 < seuilInsuffisant) {
        return 'Blocage critique';
    }

    // Blocage émergent : Performance < 75% (En développement - multistructurel) ET a un défi
    if (performancePAN3 < seuilDeveloppement && aUnDefi) {
        return 'Blocage émergent';
    }

    // Défi spécifique : Performance acceptable mais a un défi récurrent
    if (aUnDefi) {
        return 'Défi spécifique';
    }

    // Stable : Pas de défi ou performance maîtrisée
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


    // Détecter les défis
    const diagnostic = diagnostiquerForcesChallenges(moyennes);

    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true);

    // 🆕 BETA 98.9: Vérifier si données suffisantes avant interprétation
    if (indices3Derniers.nbArtefacts === 0) {
        // Élève présent mais aucune production → Non-participation (signal prioritaire)
        if (indices.A > 0) {
            return {
                niveau: 3,
                label: 'Non-participation',
                pattern: 'Non-participation',
                defi: 'Aucun',
                description: 'Élève présent en classe mais aucune production remise. Profil prioritaire nécessitant une intervention immédiate.',
                badgeClasse: 'badge-rai-3',
                patternBadge: 'badge-pattern-blocage-critique',
                donneesSuffisantes: false,
                nbArtefacts: 0,
                fenetreAnalyse: obtenirNombreProductionsPourPatterns()
            };
        }
        // Aucune présence et aucune production → En attente
        return {
            niveau: 0,
            label: 'En attente',
            pattern: 'Données insuffisantes',
            defi: 'Aucun',
            description: 'Aucune production évaluée. L\'interprétation sera disponible après la première évaluation.',
            badgeClasse: 'badge-attente',
            patternBadge: 'badge-attente',
            donneesSuffisantes: false,
            nbArtefacts: 0,
            fenetreAnalyse: obtenirNombreProductionsPourPatterns()
        };
    }

    // Déterminer le pattern basé uniquement sur la performance
    const pattern = identifierPatternActuel(indices3Derniers.performance, diagnostic.principalDefi !== null);

    // Seuils configurables
    const seuilMaitrise = obtenirSeuil('idme.maitrise');
    const seuilDeveloppement = obtenirSeuil('idme.developpement');
    const seuilInsuffisant = obtenirSeuil('idme.insuffisant');


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
            patternBadge: 'badge-pattern-blocage-critique',
            nbArtefacts: indices3Derniers.nbArtefacts,
            fenetreAnalyse: obtenirNombreProductionsPourPatterns()
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
                    : 'badge-pattern-stable',
            nbArtefacts: indices3Derniers.nbArtefacts,
            fenetreAnalyse: obtenirNombreProductionsPourPatterns()
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
        patternBadge: 'badge-pattern-stable',
        nbArtefacts: indices3Derniers.nbArtefacts,
        fenetreAnalyse: obtenirNombreProductionsPourPatterns()
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

    // 🆕 BETA 96.1: Vérifier si données suffisantes pour C
    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true);
    const cEstCalculable = indices3Derniers.nbArtefacts > 0 || C > 0;

    // Interpréter la mobilisation
    const interpMobilisation = interpreterMobilisation(A, C);


    // 🆕 BETA 96.1: Si C n'est pas calculable, retourner un état "en attente"
    if (!cEstCalculable) {
        return {
            niveau: 'attente',
            label: 'En attente',
            description: 'Données insuffisantes pour évaluer le contexte. En attente des premières remises.',
            badgeClasse: 'badge-attente',
            A: (A * 100).toFixed(0) + '%',
            C: 'En attente',
            recommandation: 'L\'interprétation du contexte d\'apprentissage sera disponible après les premières remises.',
            donneesSuffisantes: false
        };
    }

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

    // 🆕 BETA 98.9: Non-participation — présent mais 0 production
    if (indices3Derniers.nbArtefacts === 0 && indices.A > 0) {
        return {
            cible: 'Non-participation',
            pattern: 'Non-participation',
            niveau: 3,
            couleur: '#dc3545',
            emoji: '🔴'
        };
    }

    const interpMobilisation = interpreterMobilisation(indices.A / 100, indices.C / 100);

    // Variables pour la formule (correspondance avec Excel)
    const E = interpMobilisation.niveau; // Mobilisation
    const I = indices3Derniers.francaisMoyen; // Moyenne français N derniers artefacts
    const M = identifierPatternActuel(indices3Derniers.performance, diagnostic.principalDefi !== null); // Pattern actuel
    const N = diagnostic.principalDefi ? diagnostic.principalDefi.nom : 'Aucun'; // Défi principal
    const performancePAN3 = indices3Derniers.performance;


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
        couleur: '#8aa4b0',
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


    // Si aucune donnée, ne rien afficher
    if (!defisInfo || (!defisInfo.defis && !defisInfo.forces)) {
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

    // Fonction helper pour obtenir la couleur selon le score
    const obtenirCouleurScore = (score) => {
        if (score >= 0.85) return 'var(--bleu-clair)'; // Bleu
        if (score >= 0.75) return 'var(--vert-succes)'; // Vert
        if (score >= 0.7125) return 'var(--vert-succes)'; // Vert (force)
        if (score >= 0.65) return 'var(--btn-annuler)'; // Jaune
        return 'var(--orange-accent)'; // Orange
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
                        <div style="font-weight: 500; color: var(--gris-fonce);">${nomCritere}</div>
                        <div class="u-text-center">
                            <span style="display: inline-block; min-width: 50px; padding: 4px 10px;
                                         background: ${couleur}22; color: ${couleur};
                                         border-radius: 4px; font-weight: bold;">
                                ${pourcentage}%
                            </span>
                        </div>
                        <div style="text-align: right; font-size: 0.85rem; color: ${estForce ? 'var(--vert-succes)' : estDefi ? 'var(--orange-accent)' : 'var(--gris-moyen)'};">
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
                        <div style="background: var(--alerte-fond-attention); padding: 8px; margin-bottom: 10px; border-left: 3px solid var(--btn-annuler);">
                            <div style="font-size: 0.85rem; color: var(--alerte-texte-attention);">
                                ⚠️ <strong>Calcul partiel :</strong> ${resultBlocage.criteresManquants.join(', ')} non évalué(s).
                                La pondération a été ajustée automatiquement.
                            </div>
                        </div>
                    ` : ''}
                    <div style="background: var(--surface-conteneur, #142428); padding: 10px; border-radius: 4px; margin-bottom: 10px;">
                        <div class="u-texte-mini u-texte-gris" style="margin-bottom: 8px;">
                            <strong>Formule :</strong> ${formuleTexte}
                        </div>
                        <div class="profil-texte-detail-compact">
                            = ${formuleDetail} = <strong>${pourcentageBlocage}%</strong>
                        </div>
                    </div>
                    <div style="font-weight: bold; color: ${interpBlocage.couleur}; margin-bottom: 8px;">
                        ${interpBlocage.niveau}
                    </div>
                    <div style="color: var(--gris-fonce); font-size: 0.9rem; line-height: 1.5;">
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
                return `<div class="info-box info-box--attention" style="margin-bottom: 10px;">
                    <div style="font-weight: bold; color: var(--alerte-texte-attention);">⚠️ Aucune grille de référence configurée</div>
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
                            ${parNiveau['E'].map(c => `<strong>${echapperHtml(c.nom)}</strong> (${Math.round(c.pourcentage)}%)`).join(', ')}
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
                            ${parNiveau['M'].map(c => `<strong>${echapperHtml(c.nom)}</strong> (${Math.round(c.pourcentage)}%)`).join(', ')}
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
                            ${parNiveau['D'].map(c => `<strong>${echapperHtml(c.nom)}</strong> (${Math.round(c.pourcentage)}%)`).join(', ')}
                        </div>
                    </div>
                `;
            }

            // Afficher Défis I (Incomplet) - Rouge
            if (parNiveau['I'].length > 0) {
                const couleur = obtenirCouleurNiveauIDME('I');
                html += `
                    <div style="background: ${couleur}22; border-left: 4px solid ${couleur}; padding: 12px; margin-bottom: 15px;">
                        <div style="font-weight: bold; color: ${couleur}; margin-bottom: 6px;">
                            ⚠️ ${parNiveau['I'].length > 1 ? 'Défis critiques (I)' : 'Défi critique (I)'}
                            ${parNiveau['I'].length > 1 ? ` (${parNiveau['I'].length})` : ''}
                        </div>
                        <div style="color: ${couleur}; font-size: 0.9rem;">
                            ${parNiveau['I'].map(c => `<strong>${echapperHtml(c.nom)}</strong> (${Math.round(c.pourcentage)}%)`).join(', ')}
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
                    <div class="info-box info-box--attention" style="margin-bottom: 10px;">
                        <div style="font-weight: bold; color: var(--alerte-texte-attention);">
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

    if (defisInfo.defis.length === 0 && !defisInfo.tendance) {
        return `
            <div class="info-box info-box--succes" style="margin-bottom: 10px;">
                <div style="font-weight: bold; color: var(--vert-succes);">
                    ✓ Aucun défi majeur identifié
                </div>
                <div style="color: var(--vert-succes); font-size: 0.9rem; margin-top: 6px;">
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
                <div style="font-size: 0.9rem; color: var(--gris-fonce);">
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
            <div style="background: var(--surface-conteneur, #142428); padding: 12px; border-radius: 6px; border: 1px solid var(--bordure-claire); margin-bottom: 10px;">
                <div style="font-weight: bold; color: var(--accent-primaire); margin-bottom: 8px;">
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

/**
 * Génère les barres de progression SRPNF (Forces et défis parmi les critères)
 * Indépendant du portfolio — utilise les moyennes SRPNF de l'étudiant
 * @param {string} da - Numéro DA
 * @param {string} graphiqueCriteres - HTML du graphique d'évolution (optionnel)
 * @returns {string} - HTML complet (graphique + barres + légende)
 */
function _genererBarresSRPNF(da, graphiqueCriteres) {
    graphiqueCriteres = graphiqueCriteres || '';

    // Récupérer les couleurs depuis l'échelle configurée
    const echelles = db.getSync('echellesTemplates', []);
    const echelleActive = echelles.find(e => e.active) || echelles[0];

    let niveaux = [
        { code: 'I', nom: 'Incomplet', min: 0, max: 64, couleur: 'var(--orange-accent)' },
        { code: 'D', nom: 'Développement', min: 65, max: 74, couleur: 'var(--btn-annuler)' },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, couleur: 'var(--vert-succes)' },
        { code: 'E', nom: 'Étendu', min: 85, max: 100, couleur: 'var(--bleu-clair)' }
    ];

    if (echelleActive && echelleActive.niveaux) {
        niveaux = echelleActive.niveaux.map(n => ({
            code: n.code, nom: n.nom, min: n.min, max: n.max, couleur: n.couleur
        }));
    }

    // Gradient CSS
    const gradientStops = [];
    niveaux.forEach((niveau, i) => {
        if (i === 0) {
            gradientStops.push(`${niveau.couleur} ${niveau.min}%`);
            gradientStops.push(`${niveau.couleur} ${(i < niveaux.length - 1 ? niveaux[i + 1].min - 2 : niveau.max)}%`);
        } else if (i === niveaux.length - 1) {
            gradientStops.push(`${niveau.couleur} ${niveau.min + 2}%`);
            gradientStops.push(`${niveau.couleur} ${niveau.max}%`);
        } else {
            gradientStops.push(`${niveau.couleur} ${niveau.min + 2}%`);
            gradientStops.push(`${niveau.couleur} ${niveaux[i + 1].min - 2}%`);
        }
    });
    const gradientCSS = `linear-gradient(to right, ${gradientStops.join(', ')})`;

    // Calculer moyennes SRPNF
    const moyennes = calculerMoyennesCriteres(da);
    const directions = calculerDirectionsCriteres(da);

    // Générer les barres
    const barresHTML = ['structure', 'rigueur', 'plausibilite', 'nuance', 'francais'].map(cle => {
        const nomCritere = cle === 'structure' ? 'Structure' :
                         cle === 'rigueur' ? 'Rigueur' :
                         cle === 'plausibilite' ? 'Plausibilité' :
                         cle === 'nuance' ? 'Nuance' : 'Français';

        const score = moyennes?.[cle];
        if (typeof score !== 'number' || isNaN(score)) return '';

        const pourcentage = Math.round(score * 100);
        const direction = directions ? directions[cle] : null;
        const symboleDirection = direction && direction.symbole ? direction.symbole : '';

        const pointsHTML = `<div class="critere-point" style="left: ${Math.min(pourcentage, 100)}%;"></div>`;
        const symbolesHTML = symboleDirection ? `<div style="position: absolute; left: ${Math.min(pourcentage, 100)}%; transform: translateX(-50%); top: -32px; font-size: 1.2rem; font-weight: bold; color: var(--gris-fonce);" title="${direction.interpretation}">${symboleDirection}</div>` : '';

        return `
            <div class="critere-container">
                <div class="critere-header">
                    <span class="critere-nom" style="min-width: 120px;">${nomCritere}</span>
                    <span class="critere-valeur" style="margin-left: auto; font-weight: 600;">${pourcentage}%</span>
                </div>
                <div class="critere-barre-gradient" style="background: ${gradientCSS};">
                    ${symbolesHTML}
                    ${pointsHTML}
                </div>
            </div>
        `;
    }).join('');

    // Légende
    const legendeHTML = `
        <div class="legende-idme-container">
            ${niveaux.map(n => {
                const pos = (n.min + n.max) / 2;
                return `<div class="legende-idme-item" style="left: ${pos}%; color: ${n.couleur};">
                    <span class="legende-idme-code">${n.code}</span>
                    <span class="legende-idme-nom">${n.nom}</span>
                </div>`;
            }).join('')}
        </div>
    `;

    // Contenu des barres ou message
    let contenuBarres = '';
    if (!barresHTML || barresHTML.trim() === '') {
        const grilleRef = typeof obtenirGrilleReferenceDepistage === 'function' ? obtenirGrilleReferenceDepistage() : null;
        if (!grilleRef) {
            contenuBarres = `<div class="info-box info-box--attention" style="margin: 15px 0;">
                <strong style="color: var(--alerte-texte-attention);">Configuration requise</strong>
                <p style="margin: 5px 0 0; color: var(--alerte-texte-attention); font-size: 0.9rem;">
                    Configure une grille de référence dans Réglages → Pratique de notation → Grille de référence pour le dépistage.
                </p>
            </div>`;
        } else {
            contenuBarres = `<div class="info-box info-box--info" style="margin: 15px 0;">
                <strong style="color: var(--alerte-texte-information);">Aucune donnée disponible</strong>
                <p style="margin: 5px 0 0; color: var(--alerte-texte-information); font-size: 0.9rem;">
                    Aucune évaluation complétée avec des critères correspondant à la grille de référence.
                </p>
            </div>`;
        }
    } else {
        contenuBarres = barresHTML + legendeHTML;
    }

    return `
        ${graphiqueCriteres}
        <div class="section-titre" style="margin-top: 20px;">Forces et défis parmi les critères</div>
        <div style="margin: 20px 0;">${contenuBarres}</div>
    `;
}

function genererSectionPerformance(da) {
    // ✨ NOUVEAU (7 déc 2025) : Graphique d'évolution des critères
    const canvasIdCriteres = `graphique-criteres-${da}`;
    let graphiqueCriteres = '';

    // 🐛 DEBUG (8 déc 2025) : Tracer exécution

    // Vérifier si l'étudiant a des évaluations avec détails critères
    if (typeof creerGraphiqueCriteres === 'function') {
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

        const evaluationsAvecCriteres = evaluations.filter(e =>
            e.etudiantDA === da &&
            !e.remplaceeParId &&
            e.criteres &&
            Array.isArray(e.criteres) &&
            e.criteres.length > 0
        );

        if (evaluationsAvecCriteres.length > 0) {

            // Extraire les critères uniques pour la légende
            const criteresSet2 = new Set();
            evaluationsAvecCriteres.forEach(e => {
                e.criteres.forEach(c => {
                    if (c.critereNom) criteresSet2.add(c.critereNom);
                });
            });
            const criteresUniques2 = Array.from(criteresSet2).sort();
            const COULEURS_CRITERES_2 = [
                '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4',
                '#4CAF50', '#FF9800', '#795548', '#607D8B'
            ];
            const legendeHTML2 = criteresUniques2.map((critere, index) => {
                const couleur = COULEURS_CRITERES_2[index % COULEURS_CRITERES_2.length];
                const critereEscaped = critere.replace(/'/g, "\\'");
                return `<label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: ${couleur}; font-size: 0.78rem;">
                    <input type="checkbox" checked data-on-change="toggleCritereIndivHandler" data-critere="${critereEscaped}" data-da="${da}">
                    <span style="width: 10px; height: 10px; background: ${couleur}; border-radius: 50%; display: inline-block;"></span>
                    ${critere}
                </label>`;
            }).join('');

            graphiqueCriteres = `
                <div class="profil-zone-moyenne-bleu" style="margin-bottom: 20px;">
                    <!-- Légende des critères -->
                    <div style="background: var(--surface-conteneur, #142428); padding: 12px 20px; border-radius: 6px; margin-bottom: 10px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                        <span style="font-weight: 600; color: var(--gris-fonce);">Critères :</span>
                        ${legendeHTML2}
                        ${genererBandeauContexteProfil()}
                    </div>

                    <!-- Canvas pour le graphique Chart.js -->
                    <div style="background: var(--surface-conteneur, #142428); padding: 20px; border-radius: 6px; height: 450px;">
                        <canvas id="${canvasIdCriteres}"></canvas>
                    </div>
                </div>
            `;

            // Utiliser setTimeout pour créer le graphique après l'insertion du DOM
            setTimeout(() => {
                const canvas = document.getElementById(canvasIdCriteres);
                if (canvas) {
                    creerGraphiqueCriteres(canvasIdCriteres, da);
                } else {
                    console.error(`[DEBUG Graphique Critères] Canvas #${canvasIdCriteres} introuvable dans le DOM`);
                }
            }, 100);
        } else {
        }
    } else {
        console.error(`[DEBUG Graphique Critères] Fonction creerGraphiqueCriteres non disponible`);
    }

    const productions = obtenirDonneesSelonMode('productions') || [];
    const portfolio = productions.find(p => p.type === 'portfolio');

    // Générer les barres SRPNF (indépendant du portfolio)
    const barresSRPNF = _genererBarresSRPNF(da, graphiqueCriteres);

    if (!portfolio) {
        return barresSRPNF;
    }

    // Récupérer TOUS les artefacts créés
    const tousLesArtefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');

    if (tousLesArtefactsPortfolio.length === 0) {
        return barresSRPNF;
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
            db.setSync(cle('portfoliosEleves'), selectionsPortfolios);

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
    let methodeSelectionRapport = 'meilleurs';  // Valeur par défaut
    let portfolioActifRapport = true;
    let nombreARetenirConfig = nombreARetenir;  // Renommer pour éviter conflit avec ligne 5019

    // Détecter le mode Hybride pour le rapport détaillé (source : pratiquesConfigurables)
    const configPratiqueRapport = typeof obtenirConfigPratiqueActive === 'function' ? obtenirConfigPratiqueActive() : null;
    const configCategoriesRapport = configPratiqueRapport?.categories
        || (typeof obtenirConfigCategories === 'function' ? obtenirConfigCategories() : null);
    const modeHybrideRapport = !!(configCategoriesRapport && configCategoriesRapport.actif);

    if (modeHybrideRapport) {
        methodeSelectionRapport = 'hybride-categories';
        nombreARetenirConfig = configCategoriesRapport.selection?.nombreARetenir || 4;
    } else if (configPratiqueRapport?.portfolio?.methodeSelection) {
        // Lire la méthode depuis pratiquesConfigurables (source de vérité)
        methodeSelectionRapport = configPratiqueRapport.portfolio.methodeSelection;
        if (methodeSelectionRapport === 'derniers') methodeSelectionRapport = 'recents';
        nombreARetenirConfig = configPratiqueRapport.portfolio.nombreARetenir || nombreARetenir;
    }

    if (typeof obtenirIndicesCP === 'function') {
        const indicesCP = obtenirIndicesCP(da, indices.pratique);
        if (indicesCP && indicesCP.details) {
            const idsRetenus = indicesCP.details.artefactsRetenus || [];
            notesRetenues = indicesCP.details.notes || [];

            // Lire la config depuis indicesCP si disponible (fallback si pas hybride)
            if (!modeHybrideRapport) {
                methodeSelectionRapport = indicesCP.details.methodeSelection || 'meilleurs';
                portfolioActifRapport = indicesCP.details.portfolioActif !== false;
                nombreARetenirConfig = indicesCP.details.nombreARetenir || nombreARetenir;
            }

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
        if (score >= 0.7125) return 'var(--vert-succes)'; // Vert - Force
        if (score >= 0.60) return 'var(--btn-annuler)'; // Jaune - Défi modéré
        if (score >= 0.50) return 'var(--orange-accent)'; // Orange - Défi important
        return 'var(--rouge-erreur)'; // Rouge - Défi critique
    };

    return `
        <!-- Détails des calculs (masqué par défaut) - AFFICHÉ EN HAUT -->
        <div id="details-calculs-performance-${da}" class="carte-info-toggle carte-info-note u-hide">
            <strong>Méthodologie de calcul</strong>
            <br><br>
            <strong>Pratique de notation active :</strong> ${indices.pratique === 'PAN' ? 'PAN (Portfolio à nombre limité)' : 'SOM (Sommative provisoire)'}
            <br><br>
            <strong>Règle de sélection :</strong> ${(() => {
                if (!portfolioActifRapport) {
                    return 'Portfolio désactivé — Les productions sont évaluées de manière indépendante';
                }
                if (methodeSelectionRapport === 'hybride-categories') {
                    const pondSel = configCategoriesRapport?.selection?.ponderation || 65;
                    const pondObl = configCategoriesRapport?.obligatoires?.ponderation || 35;
                    return `Mode <strong>Hybride</strong> : les <strong>${nombreARetenirConfig} meilleures</strong> du pool Sélection (${pondSel}%) + toutes les Obligatoires (${pondObl}%)`;
                }
                const textes = {
                    'meilleurs': `Les <strong>${nombreARetenirConfig} meilleures productions</strong> sont retenues pour le calcul de l'indice P (note maximale atteinte)`,
                    'recents': `Les <strong>${nombreARetenirConfig} plus récentes productions</strong> sont retenues pour le calcul de l'indice P (niveau terminal actuel)`,
                    'recents-meilleurs': `Les <strong>${nombreARetenirConfig} plus récentes productions parmi les 50% meilleures</strong> sont retenues pour le calcul de l'indice P (approche hybride)`,
                    'tous': `<strong>Toutes les productions</strong> sont retenues pour le calcul de l'indice P (calcul de type sommative)`
                };
                return textes[methodeSelectionRapport] || textes['meilleurs'];
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
                        .map(c => `${echapperHtml(c.nom)}: ${c.ponderation || 0}%`)
                        .join(', ');
                    return `Pondération des critères configurés dans la grille «${echapperHtml(grilleActive.nom)}» (${ponderations})`;
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

                    if (methodeSelectionRapport === 'hybride-categories') {
                        const pondSel = configCategoriesRapport?.selection?.ponderation || 65;
                        const pondObl = configCategoriesRapport?.obligatoires?.ponderation || 35;
                        return `Performance du portfolio actuel (${nombreARetenirConfig} meilleures Sélection ${pondSel}% + Obligatoires ${pondObl}%)`;
                    }

                    // Textes selon la modalité de sélection (format uniforme avec section Engagement)
                    const textesPerformance = {
                        'meilleurs': `Performance du portfolio actuel (${nombreARetenirConfig} meilleur${nombreARetenirConfig > 1 ? 's' : ''}, maîtrise de standards)`,
                        'recents': `Performance du portfolio actuel (${nombreARetenirConfig} plus récent${nombreARetenirConfig > 1 ? 's' : ''}, niveau terminal)`,
                        'recents-meilleurs': `Performance du portfolio actuel (${nombreARetenirConfig} récent${nombreARetenirConfig > 1 ? 's' : ''} parmi les meilleurs, hybride)`,
                        'tous': `Performance du portfolio actuel (tous les ${obtenirTermeProduction('pluriel')}, moyenne complète)`
                    };

                    return textesPerformance[methodeSelectionRapport] || textesPerformance['meilleurs'];
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
                        { code: 'I', nom: 'Incomplet', min: 0, max: 64, couleur: 'var(--orange-accent)' },
                        { code: 'D', nom: 'Développement', min: 65, max: 74, couleur: 'var(--btn-annuler)' },
                        { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, couleur: 'var(--vert-succes)' },
                        { code: 'E', nom: 'Étendu', min: 85, max: 100, couleur: 'var(--bleu-clair)' }
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


                    // Calculer moyennes et directions pour SOM et PAN si en mode comparatif
                    let moyennesSOM = null;
                    let moyennesPAN = null;
                    let directionsSOM = null;
                    let directionsPAN = null;

                    if (modeComparatif) {

                        // SOM : Calculer sur TOUTES les évaluations (sans filtre)
                        moyennesSOM = calculerMoyennesCriteres(da);
                        directionsSOM = calculerDirectionsCriteres(da);

                        // PAN : Utiliser la méthode de la pratique PAN-Standards (N derniers artefacts)
                        const pratiquePAN = obtenirPratiqueParId('pan-standards');
                        if (pratiquePAN && typeof pratiquePAN._calculerMoyennesCriteresRecents === 'function') {
                            moyennesPAN = pratiquePAN._calculerMoyennesCriteresRecents(da);
                        } else {
                            console.warn('  ⚠️ Pratique PAN-Standards non disponible ou méthode _calculerMoyennesCriteresRecents absente');
                            moyennesPAN = null;
                        }
                        directionsPAN = calculerDirectionsCriteres(da);

                    } else {
                        // Mode normal : calculer les moyennes et utiliser les directions PAN par défaut
                        moyennesPAN = calculerMoyennesCriteres(da);
                        directionsPAN = calculerDirectionsCriteres(da);
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
                                    ${pourcentageSOM !== null && pourcentagePAN !== null ? `<span style="color: var(--gris-clair);">|</span>` : ''}
                                    ${pourcentagePAN !== null ? `<span style="color: var(--std-bleu); font-weight: 600;">${pourcentagePAN}%</span>` : ''}
                                </span>
                            `;
                        } else {
                            // Mode normal : utiliser les directions PAN
                            const direction = directionsPAN ? directionsPAN[cle] : null;
                            const symboleDirection = direction && direction.symbole ? direction.symbole : '';

                            pointsHTML = `<div class="critere-point" style="left: ${Math.min(pourcentage, 100)}%;"></div>`;
                            valeursHTML = `${pourcentage}%`;
                            symbolesHTML = symboleDirection ? `<div style="position: absolute; left: ${Math.min(pourcentage, 100)}%; transform: translateX(-50%); top: -32px; font-size: 1.2rem; font-weight: bold; color: var(--gris-fonce);" title="${direction.interpretation}">${symboleDirection}</div>` : '';
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
                                <div class="info-box info-box--attention" style="margin: 15px 0;">
                                    <div style="display: flex; gap: 10px; align-items: start;">
                                        <span style="font-size: 1.3rem;">⚙️</span>
                                        <div style="flex: 1;">
                                            <strong style="color: var(--alerte-texte-attention); display: block; margin-bottom: 5px;">Configuration requise</strong>
                                            <p style="margin: 0; color: var(--alerte-texte-attention); font-size: 0.9rem; line-height: 1.5;">
                                                Pour afficher les forces et défis par critère, tu dois configurer une grille de référence dans
                                                <strong>Réglages → Pratique de notation → Grille de référence pour le dépistage</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            `;
                        } else {
                            return `
                                <div class="info-box info-box--info" style="margin: 15px 0;">
                                    <div style="display: flex; gap: 10px; align-items: start;">
                                        <span style="font-size: 1.3rem;">📝</span>
                                        <div style="flex: 1;">
                                            <strong style="color: var(--alerte-texte-information); display: block; margin-bottom: 5px;">Aucune donnée disponible</strong>
                                            <p style="margin: 0; color: var(--alerte-texte-information); font-size: 0.9rem; line-height: 1.5;">
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
function genererSectionAssiduiteLegacy(da) {
    const details = obtenirDetailsAssiduite(da);
    const taux = details.periodesOffertes > 0
        ? (details.periodesPresentes / details.periodesOffertes * 100).toFixed(1)
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
                <li><strong>• Périodes présentes :</strong> ${details.periodesPresentes} / ${details.periodesOffertes}</li>
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
                                 data-action="naviguerVersPresenceAvecDate" data-param="${abs.date}">
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
                        padding: 30px 20px; text-align: center; color: var(--texte-secondaire); font-style: italic;">
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

    // 1. Afficher la section Suivi (saisie des présences)
    if (typeof afficherSection === 'function') {
        afficherSection('suivi');
    }

    // 2. Afficher la sous-section Saisie
    if (typeof afficherSousSection === 'function') {
        afficherSousSection('suivi-saisie');
    }

    // 3. Attendre que le DOM soit mis à jour, puis pré-sélectionner la date
    setTimeout(() => {
        const inputDate = document.getElementById('date-cours');
        if (inputDate) {
            inputDate.value = dateStr;

            // Déclencher l'événement change pour charger le tableau de cette date
            const event = new Event('change', { bubbles: true });
            inputDate.dispatchEvent(event);


            // Scroll vers le haut pour voir le formulaire
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.error('❌ Input #date-cours introuvable');
        }
    }, 300);
}

/**
 * Formate une date ISO en format compact (ex: "Lun 21 oct. 2024")
 * Format unique à ce module — distinct de formaterDateCourte() canonique ("6 fév.")
 * @param {string} dateISO - Date au format YYYY-MM-DD
 * @returns {string} - Date formatée
 */
function formaterDateCompacte(dateISO) {
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
                targetElement.classList.toggle('u-hide');
            }
        });
    });

}

/* ===============================
   📌 SECTIONS À DÉVELOPPER
   =============================== */

/**
 * Toggle l'affichage d'une section détaillée
 * @param {string} sectionId - ID de la section à afficher/cacher
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const isVisible = !section.classList.contains('u-hide');
        section.classList.toggle('u-hide');

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
 * @param {string} [daPreselectionne] - DA de l'étudiant à pré-cocher
 */
function naviguerVersNouvelleIntervention(daPreselectionne) {
    // Naviguer vers la section
    afficherSection('suivi');
    afficherSousSection('suivi-interventions');

    // Attendre que le conteneur soit prêt
    const checkConteneur = setInterval(() => {
        const conteneur = document.getElementById('conteneurPrincipal');
        if (conteneur && conteneur.innerHTML.trim() !== '') {
            clearInterval(checkConteneur);
            afficherFormulaireIntervention(daPreselectionne);
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
    afficherSection('suivi');
    afficherSousSection('suivi-interventions');

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
 * Surveille l'activation de la sous-section 'suivi-profil'
 * et recharge automatiquement le profil pour refléter les changements
 * faits depuis d'autres sections (ex: modifications d'interventions RàI)
 */
document.addEventListener('DOMContentLoaded', function() {
    const sectionProfil = document.getElementById('suivi-profil');
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
        rapport += `Assiduité : ${indices.A}% (${detailsA.periodesPresentes} / ${detailsA.periodesOffertes} périodes)\n\n`;
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
                productionNom: production?.activiteApprentissage || production?.description || production?.nom || `Artefact ${e.productionId}`,
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
                <h3 style="margin: 0 0 20px 0; color: var(--accent-primaire); font-size: 1.1rem; border-bottom: 2px solid var(--bleu-pale); padding-bottom: 10px;">
                    <span class="primo-aide" data-target="conseil-rapport">📍</span>
                </h3>

                <!-- Conseil Primo: Informations sur le rapport -->
                <div id="conseil-rapport" class="carte-info-toggle carte-info-conseil" style="display: none;">
                    <strong>À propos du rapport :</strong>
                    <p>Le rapport est généré à la demande avec les données actuelles et n'est pas sauvegardé automatiquement. Tu peux modifier le texte avant de le copier.</p>
                </div>

                <!-- Grid 2 colonnes : Paramètres + Actions -->
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 30px; align-items: start;">
                    <!-- Colonne gauche : Paramètres -->
                    <div>
                        <!-- Sections à inclure -->
                        <div class="u-texte-mini" style="color: var(--gris-moyen); margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;" data-tooltip="profil-rapport-sections">
                            Sections à inclure
                        </div>
                        <div class="grille-checkboxes u-mb-10">
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-identification-${da}" data-on-change="genererEtAfficherRapport" data-param="${da}" checked>
                                Identification
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-assiduite-${da}" data-on-change="genererEtAfficherRapport" data-param="${da}" checked>
                                Assiduité
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-completion-${da}" data-on-change="genererEtAfficherRapport" data-param="${da}" checked>
                                Complétion
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-performance-${da}" data-on-change="genererEtAfficherRapport" data-param="${da}" checked>
                                Performance
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-jetons-${da}" data-on-change="genererEtAfficherRapport" data-param="${da}" checked>
                                Jetons
                            </label>
                            <label class="text-sm-pointer">
                                <input type="checkbox" id="inclure-date-${da}" data-on-change="genererEtAfficherRapport" data-param="${da}" checked>
                                Date
                            </label>
                        </div>
                    </div>

                    <!-- Colonne droite : Actions -->
                    <div style="display: flex; flex-direction: column; gap: 10px; min-width: 120px;">
                        <button class="btn btn-principal u-w-100" data-action="copierRapport" data-param="${da}">
                            Copier
                        </button>
                    </div>
                </div>
            </div>

            <!-- Zone de texte du rapport (éditable pour ajouter commentaires personnels) -->
            <div class="profil-position-relative-mt15">
                <textarea id="textarea-rapport-${da}"
                          placeholder="Le rapport apparaîtra ici. Tu peux le modifier et ajouter tes commentaires avant de le copier."
                          style="width: 100%; height: 300px; padding: 15px; font-family: 'Courier New', monospace; font-size: 0.9rem; border: 2px solid var(--bleu-pale); border-radius: 6px; resize: vertical; line-height: 1.6; background: var(--surface-conteneur, #142428); overflow-y: auto;"></textarea>
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
            background: var(--vert-succes);
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
        textarea.value = 'Clique sur "Générer le rapport" pour afficher le contenu...';
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
 * Consulte une évaluation existante (ouvre le fichier dans la visionneuse en mode évaluer)
 */
function consulterEvaluation(da, productionId) {
    // 🔧 FIX (6 mars 2026) : Annuler tout timer d'ouverture précédent (même protection
    // que consulterEvaluationDepuisListe pour éviter les courses sur clics rapides)
    if (window._consulterEvalTimerId) {
        clearTimeout(window._consulterEvalTimerId);
        window._consulterEvalTimerId = null;
    }
    window._apresOuvertureFichier = null;

    // Trouver l'évaluation (résolution centralisée + fallback)
    let evaluation = null;
    if (typeof travauxResolution !== 'undefined') {
        evaluation = travauxResolution.trouverEvaluationPourFichier({ id: null, etudiantDA: da, productionId });
    }
    if (!evaluation) {
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        evaluation = evaluations.find(e => e.etudiantDA === da && e.productionId === productionId && !e.remplaceeParId);
    }

    if (!evaluation) {
        alert('Évaluation non trouvée');
        return;
    }

    // Trouver le fichier importé (résolution centralisée)
    let fichierId = null;
    if (typeof travauxResolution !== 'undefined') {
        const fichierTrouve = travauxResolution.trouverFichierPourEvaluation(evaluation);
        if (fichierTrouve) fichierId = fichierTrouve.id;
    }

    // Naviguer vers la section Évaluations d'abord (on vient du profil étudiant)
    afficherSection('evaluations');

    if (fichierId && typeof travauxUI !== 'undefined' && typeof travauxUI.ouvrirFichier === 'function') {
        // Mettre le filtre production sur la bonne production AVANT d'ouvrir le fichier
        if (productionId) {
            sessionStorage.setItem('travaux-filtre-production', productionId);
        }
        // Workflow visionneuse : naviguer vers Annoter, attendre l'init du module,
        // puis ouvrir le fichier. Le callback _apresOuvertureFichier est appelé
        // par ouvrirFichier APRÈS que le fichier soit complètement chargé dans le canvas.
        window._apresOuvertureFichier = function() {
            // Basculer en mode évaluer (affiche les palettes eval par-dessus le canvas)
            if (typeof travauxUI.basculerMode === 'function') {
                travauxUI.basculerMode('evaluer');
            }
            // Charger l'évaluation sauvegardée dans le formulaire
            setTimeout(function() {
                if (typeof window.modifierEvaluationParId === 'function') {
                    window.modifierEvaluationParId(evaluation.id);
                }
            }, 200);
        };
        // Naviguer vers evaluations-annoter (déclenche initialiserModuleTravaux à +100ms)
        afficherSousSection('evaluations-annoter');
        // Attendre que initialiserModuleTravaux soit terminé (+300ms de marge),
        // puis ouvrir le fichier dans la visionneuse
        window._consulterEvalTimerId = setTimeout(function() {
            window._consulterEvalTimerId = null;
            // Synchroniser le dropdown filtre avec la production cible
            // 🔧 FIX (5 mars 2026) : Synchroniser le dropdown SANS passer le select
            // en argument — passer le select déclenche l'auto-navigation (estChangementManuel)
            // qui ouvre un fichier parasite AVANT ouvrirFichier(fichierId), créant une course.
            const selectFiltre = document.querySelector('#evaluations-contenu-fichiers .travaux-filtre-production');
            if (selectFiltre && productionId) {
                selectFiltre.value = productionId;
                if (typeof travauxUI.filtrerBadgesParProduction === 'function') {
                    travauxUI.filtrerBadgesParProduction();
                }
            }
            travauxUI.ouvrirFichier(fichierId);
        }, 500);
    } else {
        // Fallback : pas de fichier importé, ouvrir le formulaire en standalone
        setTimeout(function() {
            if (typeof window.modifierEvaluationParId === 'function') {
                window.modifierEvaluationParId(evaluation.id);
            }
        }, 300);
    }
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

    // Source de vérité : pratiquesConfigurables, fallback sur modalitesEvaluation
    const configPratiqueActiveNote = typeof obtenirConfigPratiqueActive === 'function' ? obtenirConfigPratiqueActive() : null;
    const configPAN = modalites.configPAN || {};
    const configPortfolio = configPratiqueActiveNote?.portfolio || configPAN.portfolio || {};
    const nombreARetenir = configPortfolio.nombreARetenir || 4;
    const minimumRequis = configPortfolio.minimumCompletion || 7;
    let methodeSelection = configPortfolio.methodeSelection || 'meilleurs';
    if (methodeSelection === 'derniers') methodeSelection = 'recents';
    const reglesConformite = configPortfolio.reglesConformite || configPAN.portfolio?.reglesConformite || { actif: false };

    // Détecter Hybride : catégories actives dans pratiquesConfigurables
    const configCategoriesNote = configPratiqueActiveNote?.categories
        || (typeof obtenirConfigCategories === 'function' ? obtenirConfigCategories() : null);
    const modeHybrideNote = !!(configCategoriesNote && configCategoriesNote.actif);

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

    // Sélectionner les artefacts selon la méthode
    let artefactsRetenus = [...evaluationsArtefacts];
    let moyennePortfolio = null;

    // Helper: obtenir le numéro de production pour une évaluation
    const getNumeroProduction = (ev) => {
        const prod = productions.find(p => p.id === ev.productionId);
        return prod?.numero || parseInt(ev.productionId.match(/(\d+)$/)?.[1]) || 0;
    };

    if (modeHybrideNote) {
        // MODE HYBRIDE : N meilleures Sélection (pondérées) + Obligatoires (pondérées)
        const { nombreARetenir: nSelection, ponderation: pondSel } = configCategoriesNote.selection || { nombreARetenir: 4, ponderation: 65 };
        const { ponderation: pondObl } = configCategoriesNote.obligatoires || { ponderation: 35 };
        const productionsNonPortfolio = productions.filter(p => p.type !== 'portfolio');

        const evalsSelection = evaluationsArtefacts.filter(ev => {
            const prod = productionsNonPortfolio.find(p => p.id === ev.productionId);
            return prod && prod.categorie === 'selection';
        });
        const evalsObligatoires = evaluationsArtefacts.filter(ev => {
            const prod = productionsNonPortfolio.find(p => p.id === ev.productionId);
            return prod && prod.categorie === 'obligatoire';
        });

        // N meilleures du pool Sélection
        const meilleuresSelection = [...evalsSelection]
            .sort((a, b) => (b.noteFinale || 0) - (a.noteFinale || 0))
            .slice(0, nSelection);

        artefactsRetenus = [...meilleuresSelection, ...evalsObligatoires];

        // Moyenne pondérée Hybride
        if (meilleuresSelection.length > 0 || evalsObligatoires.length > 0) {
            const moySel = meilleuresSelection.length > 0
                ? meilleuresSelection.reduce((s, e) => s + e.noteFinale, 0) / meilleuresSelection.length : 0;
            const moyObl = evalsObligatoires.length > 0
                ? evalsObligatoires.reduce((s, e) => s + e.noteFinale, 0) / evalsObligatoires.length : 0;

            if (meilleuresSelection.length > 0 && evalsObligatoires.length > 0) {
                moyennePortfolio = (moySel * pondSel + moyObl * pondObl) / (pondSel + pondObl);
            } else if (meilleuresSelection.length > 0) {
                moyennePortfolio = moySel;
            } else {
                moyennePortfolio = moyObl;
            }
        }
    } else {
        // Méthodes legacy : meilleurs, recents, recents-meilleurs, tous
        if (methodeSelection === 'meilleurs' || methodeSelection === 'hybride') {
            artefactsRetenus.sort((a, b) => b.noteFinale - a.noteFinale);
        } else if (methodeSelection === 'recents') {
            artefactsRetenus.sort((a, b) => getNumeroProduction(b) - getNumeroProduction(a));
        } else if (methodeSelection === 'recents-meilleurs') {
            const nombreMeilleurs = Math.max(1, Math.ceil(artefactsRetenus.length * 0.5));
            artefactsRetenus.sort((a, b) => b.noteFinale - a.noteFinale);
            artefactsRetenus = artefactsRetenus.slice(0, nombreMeilleurs);
            artefactsRetenus.sort((a, b) => getNumeroProduction(b) - getNumeroProduction(a));
        }

        artefactsRetenus = artefactsRetenus.slice(0, nombreARetenir);

        if (artefactsRetenus.length > 0) {
            const somme = artefactsRetenus.reduce((acc, e) => acc + e.noteFinale, 0);
            moyennePortfolio = somme / artefactsRetenus.length;
        }
    }

    // ========================================
    // RÈGLES DE CONFORMITÉ - Plafonnement
    // ========================================
    let plafonnement = null;
    const nombreEvalues = evaluationsArtefacts.length;
    const deficit = minimumRequis - nombreEvalues;

    if (reglesConformite.actif && deficit > 0 && moyennePortfolio !== null) {

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
        'tous': 'tous',
        'hybride': 'hybride (catégories)'
    };
    // Si Hybride actif, forcer le label
    if (modeHybrideNote) methodeSelection = 'hybride';

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
            nom: productionTerminale?.titre || productionTerminale?.activiteApprentissage || productionTerminale?.description || 'Évaluation terminale',
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
    if (!confirm(`Es-tu sûr de vouloir retirer un jeton "${nomJeton}" à cet·te étudiant·e ?`)) {
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
window.determinerCibleIntervention = determinerCibleIntervention; // 🔧 FIX Beta 97.4 : Nécessaire pour afficherPatternsApprentissage
window.calculerIndiceBlocage = calculerIndiceBlocage;
window.calculerMoyennesCriteres = calculerMoyennesCriteres;

/**
 * 🆕 BETA 91: Calcule et stocke les patterns + RàI pour TOUT le groupe
 * Cette fonction est appelée par apercu-contenu.js au chargement
 * pour avoir des données à jour pour tous les étudiants
 *
 * @returns {Object} - Patterns et RàI de tous les étudiants
 */
function calculerEtStockerPatternsGroupe() {
    // ✅ NAMESPACING (Beta 95.5)
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const patternsGroupe = {};


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

    // Stocker avec namespace trimestre
    db.setSync(cle('indicesPatternsRaI'), patternsGroupe);


    return patternsGroupe;
}

/**
 * 🆕 BETA 91: Récupère les patterns stockés pour un étudiant
 * @param {string} da - Numéro de DA
 * @returns {Object|null} - Pattern et RàI de l'étudiant, ou null si non trouvé
 */
function obtenirPatternEtudiant(da) {
    const patterns = db.getSync(cle('indicesPatternsRaI'), null) || db.getSync('indicesPatternsRaI', {});
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
    const cleConfidentiel = cle('confidentielEtudiants');
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

    document.getElementById('confidentiel-categorie').value = infos.categorie || '';
    mettreAJourSousCategories();
    document.getElementById('confidentiel-sous-categorie').value = infos.sousCategorie || '';

    document.getElementById('confidentiel-defi-fls').checked = infos.defiFLS || false;
    document.getElementById('confidentiel-defi-socialisation').checked = infos.defiSocialisation || false;
    document.getElementById('confidentiel-defi-integration').checked = infos.defiIntegration || false;
    document.getElementById('confidentiel-defi-organisation-scolaire').checked = infos.defiOrganisationScolaire || false;
    document.getElementById('confidentiel-defi-organisation-citoyenne').checked = infos.defiOrganisationCitoyenne || false;

    document.getElementById('confidentiel-notes').value = infos.notes || '';

    // Portrait de lecteur
    document.getElementById('confidentiel-portrait-structure').value = infos.portraitStructure || '';
    document.getElementById('confidentiel-portrait-rigueur').value = infos.portraitRigueur || '';
    document.getElementById('confidentiel-portrait-plausibilite').value = infos.portraitPlausibilite || '';
    document.getElementById('confidentiel-portrait-nuance').value = infos.portraitNuance || '';
    document.getElementById('confidentiel-portrait-francais').value = infos.portraitFrancais || '';

    // Charger les notes de présences
    chargerNotesPresencesConfidentiel(da);

    // Afficher le modal
    document.getElementById('modalConfidentiel').classList.add('actif');
}

/**
 * Charge et affiche les notes de présences pour un étudiant (trimestre actif)
 * @param {string} da - DA de l'étudiant
 */
function chargerNotesPresencesConfidentiel(da) {
    const container = document.getElementById('confidentiel-notes-presences');
    if (!container) return;

    // Fonction locale d'échappement HTML
    const escapeHtml = (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    // Obtenir la clé des présences pour le trimestre actif
    const clePresences = cle('presences');
    const presences = db.getSync(clePresences, []);

    // Filtrer les présences de cet étudiant qui ont des notes
    const notesEtudiant = presences
        .filter(p => p.da === da && p.notes && p.notes.trim() !== '')
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordre chronologique

    if (notesEtudiant.length === 0) {
        container.innerHTML = '<p class="text-muted" style="margin: 0; font-style: italic;">Aucune note de présence pour ce trimestre.</p>';
        return;
    }

    // Générer l'affichage
    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';

    notesEtudiant.forEach(p => {
        const dateObj = new Date(p.date);
        const dateFormatee = dateObj.toLocaleDateString('fr-CA', {
            day: 'numeric',
            month: 'short'
        });

        html += `
            <div style="display: flex; gap: 8px; align-items: flex-start;">
                <span style="min-width: 55px; font-weight: 600; color: var(--accent-primaire); padding-top: 4px;">${dateFormatee}</span>
                <textarea
                    class="controle-form note-presence-editable"
                    data-date="${p.date}"
                    data-da="${da}"
                    rows="1"
                    style="flex: 1; resize: vertical; font-size: 0.8rem; padding: 4px 8px;"
                >${escapeHtml(p.notes)}</textarea>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Sauvegarde les notes de présences modifiées dans le modal Confidentiel
 */
function sauvegarderNotesPresencesConfidentiel() {
    const textareas = document.querySelectorAll('#confidentiel-notes-presences .note-presence-editable');
    if (textareas.length === 0) return;

    // Tier 6.4 : utiliser l'API centralisée de saisie-presences.js
    let modifications = 0;

    textareas.forEach(textarea => {
        const date = textarea.dataset.date;
        const da = textarea.dataset.da;
        const nouvelleNote = textarea.value.trim();

        if (typeof window.modifierNotesPresence === 'function') {
            if (window.modifierNotesPresence(da, date, nouvelleNote)) {
                modifications++;
            }
        }
    });
}

/**
 * Ferme le modal des informations confidentielles
 */
function fermerModalConfidentiel() {
    document.getElementById('modalConfidentiel').classList.remove('actif');
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
        notes: document.getElementById('confidentiel-notes').value.trim(),
        // Portrait de lecteur
        portraitStructure: document.getElementById('confidentiel-portrait-structure').value,
        portraitRigueur: document.getElementById('confidentiel-portrait-rigueur').value,
        portraitPlausibilite: document.getElementById('confidentiel-portrait-plausibilite').value,
        portraitNuance: document.getElementById('confidentiel-portrait-nuance').value,
        portraitFrancais: document.getElementById('confidentiel-portrait-francais').value
    };

    // Sauvegarder les infos confidentielles
    const cleConfidentiel = cle('confidentielEtudiants');
    const donnees = db.getSync(cleConfidentiel, {});
    donnees[_confidentielDaActuel] = infos;
    db.setSync(cleConfidentiel, donnees);

    // Sauvegarder les notes de présences modifiées
    sauvegarderNotesPresencesConfidentiel();

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
        toggleDisplay(details, afficher);
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
        sousCategories.map(sc => `<option value="${echapperHtml(sc)}">${echapperHtml(sc)}</option>`).join('');
}

/**
 * Vérifie si un étudiant a des informations confidentielles enregistrées
 * @param {string} da - Numéro de DA
 * @returns {boolean} - true si des infos existent
 */
function aDesInfosConfidentielles(da) {
    const cleConfidentiel = cle('confidentielEtudiants');
    const donnees = db.getSync(cleConfidentiel, {});
    const infos = donnees[da];
    if (!infos) return false;

    // Vérifier si au moins une info est renseignée
    return infos.epgc || infos.servicesAdaptes || infos.categorie ||
           infos.coursRegulier || infos.coursEchec || infos.coursAbandon ||
           infos.coursDecrochage || infos.coursRenforcement ||
           infos.defiFLS || infos.defiSocialisation || infos.defiIntegration ||
           infos.defiOrganisationScolaire || infos.defiOrganisationCitoyenne ||
           (infos.notes && infos.notes.length > 0) ||
           infos.portraitStructure || infos.portraitRigueur || infos.portraitPlausibilite ||
           infos.portraitNuance || infos.portraitFrancais;
}

// 🆕 BETA 96.1: Exporter les fonctions du modal confidentiel
window.ouvrirModalConfidentiel = ouvrirModalConfidentiel;
window.fermerModalConfidentiel = fermerModalConfidentiel;
window.sauvegarderConfidentiel = sauvegarderConfidentiel;
window.toggleServicesAdaptes = toggleServicesAdaptes;
window.mettreAJourSousCategories = mettreAJourSousCategories;
window.aDesInfosConfidentielles = aDesInfosConfidentielles;

/**
 * Genere la section "Travaux soumis" pour le profil etudiant
 * Affiche une grille de miniatures des fichiers importes
 * 🆕 BETA 96.3 : Module Travaux
 * @param {string} da - DA de l'etudiant
 * @returns {string} HTML de la section
 */
function genererSectionTravaux(da) {
    if (typeof travauxStockage === 'undefined') {
        return '<p class="texte-muted">Module Travaux non disponible</p>';
    }

    const fichiers = travauxStockage.obtenirFichiersEtudiant(da);
    const productions = obtenirDonneesSelonMode('productions');

    if (fichiers.length === 0) {
        return `
            <div class="profil-zone-grande-bleu">
                <p style="color: var(--gris-moyen); font-size: 1.1rem;">Aucun travail soumis</p>
                <p style="color: var(--gris-clair); margin-top: 10px;">Importe des travaux depuis l'onglet Travaux &gt; Import</p>
            </div>
        `;
    }

    let html = '<div class="travaux-grille">';

    fichiers.forEach(f => {
        const thumb = f.thumbnailDataUrl || travauxStockage.obtenirThumbnailSync(f.id);
        const icone = f.typeMIME === 'application/pdf' ? '&#x1F4C4;' : '&#x1F5BC;';
        const production = productions.find(p => p.id === f.productionId);
        const nomProd = production ? echapperHtml(production.titre || production.nom || '') : '';
        const annotation = travauxStockage.obtenirAnnotationFichier(f.id);
        const aAnnotations = annotation && travauxUI.annotationContientDuContenu(annotation);

        html += `
            <div class="travaux-grille-item" data-action="travauxUI.ouvrirFichier" data-param="${f.id}" title="${echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.nomFichier, f.etudiantDA) : f.nomFichier)}">
                <div class="travaux-grille-thumb">
                    ${thumb ? `<img src="${thumb}" alt="">` : `<img data-thumbnail-id="${f.id}" src="" alt="" style="display:none"><span class="travaux-grille-icone">${icone}</span>`}
                    ${aAnnotations ? '<span class="travaux-badge-annote" title="Annote">&#x270F;</span>' : ''}
                </div>
                <div class="travaux-grille-info">
                    <div class="travaux-grille-nom">${echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.nomFichier, f.etudiantDA) : f.nomFichier)}</div>
                    ${nomProd ? `<div class="travaux-grille-etudiant">${nomProd}</div>` : ''}
                    <div class="travaux-grille-etudiant">${travauxStockage.formaterTaille(f.tailleFichier)}</div>
                </div>
            </div>`;
    });

    html += '</div>';

    // Bouton export
    html += `
        <div style="margin-top: 16px;">
            <button class="btn btn-secondaire" data-action="lancerExportEtudiantAnnotes" data-param="${da}">
                Telecharger ZIP des travaux
            </button>
        </div>
    `;

    return html;
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Handler pour togglePSansReprisesIndiv(da, checked) depuis checkbox */
function togglePSansReprisesIndivHandler(el) {
    togglePSansReprisesIndiv(el.dataset.da, el.checked);
}

/** Handler pour toggleIndiceIndiv(label, checked, da) depuis checkbox */
function toggleIndiceIndivHandler(el) {
    toggleIndiceIndiv(el.dataset.label, el.checked, el.dataset.da);
}

/** Handler pour toggleCritereIndiv(critere, checked, da) depuis checkbox */
function toggleCritereIndivHandler(el) {
    toggleCritereIndiv(el.dataset.critere, el.checked, el.dataset.da);
}

/** Handler pour travauxArchivage.lancerExportEtudiant avec {inclureAnnotes: true} */
function lancerExportEtudiantAnnotes(da) {
    travauxArchivage.lancerExportEtudiant(da, {inclureAnnotes: true});
}

// 🆕 BETA 93: Exporter afficherProfilComplet pour accès depuis autres modules
window.afficherProfilComplet = afficherProfilComplet;
// window.calculerTousLesIndices → indices.js (#206)
window.obtenirPratiqueActuelle = obtenirPratiqueActuelle; // ✅ BETA 93.5 (10 déc): Utilisé par snapshots.js pour calcul historique P
window.calculerDetailsNoteFinale = calculerDetailsNoteFinale; // 🆕 BETA 96 (FIX #37): Utilisé par portfolio.js pour cohérence P = Note finale

// ✅ CORRECTIF (17 déc 2025): Exporter les fonctions utilisées dans les data-action du profil
window.changerSectionProfil = changerSectionProfil;
window.toggleSectionCollapsible = toggleSectionCollapsible;
window.naviguerVersPresenceAvecDate = naviguerVersPresenceAvecDate;
window.genererEtAfficherRapport = genererEtAfficherRapport;
window.copierRapport = copierRapport;
window.consulterEvaluation = consulterEvaluation;
window.evaluerProduction = evaluerProduction;

// Phase 5 : Wrappers delegation
window.togglePSansReprisesIndivHandler = togglePSansReprisesIndivHandler;
window.toggleIndiceIndivHandler = toggleIndiceIndivHandler;
window.toggleCritereIndivHandler = toggleCritereIndivHandler;
window.lancerExportEtudiantAnnotes = lancerExportEtudiantAnnotes;

})();
