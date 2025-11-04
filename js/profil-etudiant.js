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
   🚀 INITIALISATION DU MODULE
   =============================== */

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
 * @param {string} pratiqueUtilisee - 'SOM' ou 'PAN' (fourni par calculerTousLesIndices)
 * @returns {string} - HTML du badge
 */
function genererBadgePratiqueProfil(pratiqueUtilisee) {
    let texte = '';
    let couleur = '';

    if (pratiqueUtilisee === 'SOM') {
        texte = 'SOM';
        couleur = '#ff6f00'; // Orange
    } else {
        texte = 'PAN';
        couleur = '#0277bd'; // Bleu
    }

    return `
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px;
                     background: ${couleur}15; border: 1.5px solid ${couleur}; border-radius: 12px;
                     font-size: 0.7rem; font-weight: 700; color: ${couleur}; margin-left: 8px;
                     vertical-align: middle;">
            ${texte}
        </span>
    `;
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
 *   E: 0.516,           // Engagement (composite)
 *   R: 0.484,           // Risque (composite)
 *   pratique: 'SOM'     // Pratique utilisée pour le calcul
 * }
 */
function calculerTousLesIndices(da, pratique = null) {
    // INDICE A : Assiduité (universel - identique dans les deux pratiques)
    const A = calculerAssiduitéGlobale(da) / 100; // Convertir en proportion 0-1

    // 🔍 DÉTERMINER LA PRATIQUE À UTILISER
    if (!pratique) {
        // Détecter depuis la configuration
        const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
        pratique = config.pratique === 'sommative' ? 'SOM' : 'PAN';
    }

    // INDICES C et P : Lire depuis localStorage.indicesCP (Single Source of Truth)
    let C = 0;
    let P = 0;

    if (typeof obtenirIndicesCP === 'function') {
        const indicesCP = obtenirIndicesCP(da, pratique); // Lire la branche spécifique
        if (indicesCP) {
            C = indicesCP.C / 100; // Convertir en proportion 0-1
            P = indicesCP.P / 100;
        } else {
            // Fallback : calculer à la volée si pas encore généré
            console.warn(`⚠️ indicesCP non trouvé pour ${da} (${pratique}) - Calcul à la volée`);
            C = calculerTauxCompletion(da) / 100;
            P = calculerPerformancePAN(da);
        }
    } else {
        // Fallback : fonctions anciennes si module portfolio.js pas chargé
        console.warn('⚠️ obtenirIndicesCP non disponible - Calcul à la volée');
        C = calculerTauxCompletion(da) / 100;
        P = calculerPerformancePAN(da);
    }

    // INDICES COMPOSITES
    const M = (A + C) / 2; // Mobilisation
    const E = A * C * P;   // Engagement
    const R = 1 - E;       // Risque

    return {
        // Indices primaires (en pourcentage pour compatibilité affichage)
        A: Math.round(A * 100),
        C: Math.round(C * 100),
        P: Math.round(P * 100),

        // Indices composites (valeurs normalisées 0-1 avec 3 décimales)
        M: parseFloat(M.toFixed(3)),
        E: parseFloat(E.toFixed(3)),
        R: parseFloat(R.toFixed(3)),

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
 * Interprète l'indice R (Risque) selon les seuils du guide de monitorage
 * @param {number} valeur - Valeur normalisée entre 0 et 1
 * @returns {Object} - { niveau, emoji, couleur }
 */
function interpreterRisque(valeur) {
    if (valeur > 0.7) {
        return {
            niveau: 'Risque critique',
            emoji: '⚫',
            couleur: '#721c24' // Rouge foncé
        };
    }
    if (valeur > 0.5) {
        return {
            niveau: 'Risque très élevé',
            emoji: '🔴',
            couleur: '#dc3545' // Rouge
        };
    }
    if (valeur > 0.4) {
        return {
            niveau: 'Risque élevé',
            emoji: '🟠',
            couleur: '#fd7e14' // Orange
        };
    }
    if (valeur > 0.3) {
        return {
            niveau: 'Risque modéré',
            emoji: '🟡',
            couleur: '#ffc107' // Jaune
        };
    }
    if (valeur > 0.2) {
        return {
            niveau: 'Risque faible',
            emoji: '🟢',
            couleur: '#90EE90' // Vert clair
        };
    }
    return {
        niveau: 'Risque minimal',
        emoji: '🔵',
        couleur: '#2196F3' // Bleu
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
 * Génère le HTML de la section Mobilisation (fusion A + C, retrait E)
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionMobilisationEngagement(da) {
    const indices = calculerTousLesIndices(da);
    const A = indices.A / 100;
    const C = indices.C / 100;
    const interpM = interpreterMobilisation(A, C);

    // Récupérer les données pour les deux sections
    const detailsA = obtenirDetailsAssiduite(da);
    const tauxA = detailsA.heuresOffertes > 0
        ? (detailsA.heuresPresentes / detailsA.heuresOffertes * 100).toFixed(1)
        : 0;
    const interpA = interpreterAssiduite(parseFloat(tauxA));

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

        return {
            id: art.id,
            titre: art.titre,
            description: art.description || art.titre, // Utiliser description ou fallback sur titre
            remis: !!evaluation,
            note: evaluation?.noteFinale ?? null,  // Utiliser ?? pour supporter la note 0
            niveau: evaluation?.niveauFinal ?? null,
            jetonReprise: evaluation?.repriseDeId ? true : false,
            jetonDelai: evaluation?.jetonDelaiApplique ? true : false,
            retenu: false // Par défaut, sera mis à true pour les meilleurs
        };
    });

    // Tri et sélection automatique des meilleurs artefacts
    const nombreARetenir = portfolio?.regles?.nombreARetenir || 3;

    // Trier les artefacts remis par note décroissante
    const artefactsRemisTriés = artefacts
        .filter(a => a.remis)
        .sort((a, b) => (b.note || 0) - (a.note || 0));

    // Marquer les N meilleurs comme retenus
    artefactsRemisTriés.forEach((art, index) => {
        if (index < nombreARetenir) {
            art.retenu = true;
        }
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
    const artefactsRemis = artefacts.filter(a => a.remis);
    const artefactsNonRemis = artefacts.filter(a => !a.remis);

    // Comptabiliser les jetons utilisés et récupérer les noms des artefacts
    const evaluationsAvecJetonReprise = evaluationsEleve.filter(e => e.repriseDeId);
    const evaluationsAvecJetonDelai = evaluationsEleve.filter(e => e.jetonDelaiApplique && !e.remplaceeParId);

    const jetonsRepriseUtilises = evaluationsAvecJetonReprise.length;
    const jetonsDelaiUtilises = evaluationsAvecJetonDelai.length;
    const totalJetonsUtilises = jetonsRepriseUtilises + jetonsDelaiUtilises;

    // Lister les artefacts concernés
    const artefactsAvecJetonReprise = evaluationsAvecJetonReprise.map(e => e.productionNom || 'Artefact inconnu');
    const artefactsAvecJetonDelai = evaluationsAvecJetonDelai.map(e => e.productionNom || 'Artefact inconnu');

    return `
        <!-- Détails des calculs (masqué par défaut) -->
        <div id="details-calculs-mobilisation-${da}" class="carte-info-toggle" style="display: none;">
            <div class="details-calculs-section">
                <h5 class="details-calculs-titre">MÉTHODOLOGIE DE CALCUL</h5>
                <div class="details-calculs-bloc">
                    <div class="details-calculs-label">Assiduité (A):</div>
                    <div class="details-calculs-valeur">
                        Indice A = ${indices.A}%<br>
                        ${detailsA.heuresPresentes}h présentes / ${detailsA.heuresOffertes}h offertes
                    </div>

                    <div class="details-calculs-label">Complétion (C):</div>
                    <div class="details-calculs-valeur">
                        Indice C = ${indices.C}%<br>
                        ${nbRemis} artefacts remis / ${nbTotal} artefacts totaux
                    </div>

                    <div class="details-calculs-label">Mobilisation (M):</div>
                    <div class="details-calculs-valeur">
                        Formule: M = (A + C) / 2<br>
                        M = (${indices.A} + ${indices.C}) / 2 = <strong>${indices.M}</strong>
                    </div>
                </div>
            </div>
        </div>

        <!-- GRILLE 2 COLONNES : ASSIDUITÉ ET COMPLÉTION -->
        <div class="profil-grid-2col">

            <!-- FICHE ASSIDUITÉ -->
            <div class="profil-carte">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: var(--bleu-principal); font-size: 1.1rem;">Assiduité</h3>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${indices.A}%</strong>
                </div>

                <!-- Statistiques -->
                <ul class="profil-liste-simple">
                    <li><strong>• Heures présentes :</strong> ${detailsA.heuresPresentes}h / ${detailsA.heuresOffertes}h</li>
                </ul>

                <hr class="profil-separateur">

                <!-- Liste des absences et retards -->
                <h4 class="profil-section-titre">
                    ${detailsA.absences.length} absence${detailsA.absences.length > 1 ? 's' : ''} ou retard${detailsA.absences.length > 1 ? 's' : ''}
                </h4>
                ${detailsA.absences.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
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
                                            ? `${abs.heuresManquees}h`
                                            : `${abs.heuresPresence}h`
                                        }
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="profil-message-succes">
                        <div class="profil-message-succes-icone">✅</div>
                        <div class="profil-message-succes-texte">Assiduité parfaite !</div>
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
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
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
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: var(--bleu-principal); font-size: 1.1rem;">Complétion</h3>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${indices.C}%</strong>
                </div>

                <!-- Gestion des jetons -->
                ${totalJetonsUtilises > 0 ? `
                    <h4 class="profil-section-titre">
                        🎫 JETONS UTILISÉS
                    </h4>
                    <div class="profil-artefacts-liste" style="margin-bottom: 20px;">
                        ${jetonsRepriseUtilises > 0 ? `
                            <div class="profil-section-bordure-gauche profil-jetons-reprise">
                                <div class="profil-jetons-reprise-titre">
                                    <span class="profil-jetons-reprise-icone">⭐</span> Jetons de reprise : ${jetonsRepriseUtilises}
                                </div>
                                <div class="profil-jetons-details">
                                    ${artefactsAvecJetonReprise.map(nom => `
                                        <div>• ${echapperHtml(nom)}</div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${jetonsDelaiUtilises > 0 ? `
                            <div class="profil-section-bordure-gauche profil-jetons-delai">
                                <div class="profil-jetons-delai-titre">
                                    <span class="profil-jetons-reprise-icone">⭐</span> Jetons de délai : ${jetonsDelaiUtilises}
                                </div>
                                <div class="profil-jetons-details">
                                    ${artefactsAvecJetonDelai.map(nom => `
                                        <div>• ${echapperHtml(nom)}</div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <hr class="profil-separateur">
                ` : ''}

                <!-- Artefacts remis avec checkboxes (badges colorés) -->
                <h4 class="profil-section-titre">
                    ${artefactsRemis.length} production${artefactsRemis.length > 1 ? 's' : ''} remise${artefactsRemis.length > 1 ? 's' : ''}
                    ${artefactsRemis.length > 0 && portfolio?.regles?.nombreARetenir ? `
                        <span style="font-weight: normal; color: #666; font-size: 0.85rem; margin-left: 8px;">
                            · ${nbRetenus}/${artefactsRemis.length} sélectionnés (${portfolio.regles.nombreARetenir} meilleures productions à retenir)
                        </span>
                    ` : ''}
                </h4>
                ${artefactsRemis.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                        ${artefactsRemis.map(art => {
                            // Récupérer les couleurs depuis l'échelle configurée
                            const echelles = JSON.parse(localStorage.getItem('echellesTemplates') || '[]');
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
                                     style="background: ${couleurBadge}22; border-color: ${couleurBadge}; opacity: ${opacite}; border-width: ${bordure};"
                                     onmouseover="this.style.opacity='1'"
                                     onmouseout="this.style.opacity='${opacite}'">
                                    <input type="checkbox"
                                           class="badge-artefact-checkbox"
                                           name="artefactRetenu"
                                           value="${art.id}"
                                           ${art.retenu ? 'checked' : ''}
                                           onchange="toggleArtefactPortfolio('${da}', '${portfolio?.id || ''}', ${portfolio?.regles?.nombreARetenir || 3})"
                                           onclick="event.stopPropagation()"
                                           style="accent-color: ${couleurBadge};">
                                    <div class="badge-artefact-contenu"
                                         onclick="evaluerProduction('${da}', '${art.id}')">
                                        <span class="badge-artefact-titre" style="color: ${couleurBadge};">
                                            ${echapperHtml(art.description)}
                                        </span>
                                        ${art.jetonReprise ? '<span style="font-size: 0.8rem;" title="Jeton de reprise appliqué">⭐</span>' : ''}
                                        ${art.jetonDelai ? '<span style="font-size: 0.8rem;" title="Jeton de délai appliqué">⭐</span>' : ''}
                                        <span class="badge-artefact-note" style="background: ${couleurBadge};">
                                            ${art.niveau || '--'}
                                        </span>
                                        <span style="color: #666; font-size: 0.8rem; font-weight: 500;">
                                            (${art.note})
                                        </span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="profil-message-vide" style="margin-bottom: 15px;">
                        Aucun artefact remis
                    </div>
                `}

                <!-- Artefacts non remis (badges gris) -->
                <h4 class="profil-section-titre">
                    ${artefactsNonRemis.length} production${artefactsNonRemis.length > 1 ? 's' : ''} non remise${artefactsNonRemis.length > 1 ? 's' : ''}
                </h4>
                ${artefactsNonRemis.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                        ${artefactsNonRemis.map(art => `
                            <div class="badge-artefact-non-remis"
                                 onclick="evaluerProduction('${da}', '${art.id}')"
                                 title="Cliquer pour évaluer cet artefact">
                                <span style="font-weight: 500; color: #666; font-size: 0.85rem;">
                                    ⏳ ${echapperHtml(art.description)}
                                </span>
                                <span style="color: #999; font-size: 0.8rem; font-style: italic;">
                                    Non remis
                                </span>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="profil-message-tous-remis">
                        ✅ Tous les artefacts remis !
                    </div>
                `}
            </div>
        </div>

        <!-- Placeholder graphique unique (en bas des deux fiches) -->
        <div class="profil-zone-avertissement" style="padding: 30px 20px;">
            📈 Évolution temporelle A-C (à venir)
        </div>
    `;
}

/**
 * Génère le HTML de la section Accompagnement (interventions RàI)
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

    let html = `
        <!-- Détails de la section (masqué par défaut) -->
        <div id="details-calculs-accompagnement-${da}" class="carte-info-toggle" style="display: none;">
            <div class="details-calculs-section">
                <h5 class="details-calculs-titre">À PROPOS DE CETTE SECTION</h5>
                <div class="details-calculs-bloc">
                    <div class="details-calculs-label">Objectif :</div>
                    <div class="details-calculs-valeur">
                        Cette section centralise l'historique complet des interventions RàI (Réponse à l'Intervention)
                        auxquelles l'étudiant·e a participé. Elle permet de suivre l'évolution de l'accompagnement
                        pédagogique dans le temps et de documenter les observations spécifiques.
                    </div>
                </div>

                <div class="details-calculs-bloc">
                    <div class="details-calculs-label">Contenu :</div>
                    <div class="details-calculs-valeur">
                        • Liste chronologique des interventions (plus récentes en premier)<br>
                        • Type et statut de chaque intervention (planifiée, en cours, complétée)<br>
                        • Notes individuelles prises lors de chaque rencontre<br>
                        • Accès rapide pour ouvrir ou créer une intervention
                    </div>
                </div>

                <div class="details-calculs-bloc">
                    <div class="details-calculs-label">Utilisation :</div>
                    <div class="details-calculs-valeur">
                        • <strong>Nouvelle intervention :</strong> Cliquez sur le bouton en haut à droite pour créer une intervention<br>
                        • <strong>Consulter une intervention :</strong> Cliquez sur «Consulter» pour voir les détails complets<br>
                        • <strong>Notes individuelles :</strong> Visibles directement sous chaque intervention
                    </div>
                </div>

                <div class="details-calculs-bloc">
                    <div class="details-calculs-label">Intégration RàI :</div>
                    <div class="details-calculs-valeur">
                        Les interventions documentées ici s'inscrivent dans une approche proactive de soutien
                        à l'apprentissage. Elles permettent d'ajuster les stratégies pédagogiques en fonction
                        des besoins identifiés et de maintenir une trace longitudinale de l'accompagnement.
                    </div>
                </div>
            </div>
        </div>

        <div class="carte" style="margin-bottom: 20px; background: var(--bleu-tres-pale);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div>
                    <h3 style="margin: 0 0 10px 0; color: var(--bleu-principal);">
                        Historique des interventions pour ${nomComplet}
                    </h3>
                    <p class="text-muted" style="margin: 0;">
                        Cette section présente les interventions RàI auxquelles l'étudiant·e a participé,
                        ainsi que les notes individuelles prises lors de chaque rencontre.
                    </p>
                </div>
                <div>
                    <button class="btn btn-principal" style="white-space: nowrap;" onclick="naviguerVersNouvelleIntervention();">
                        Nouvelle intervention
                    </button>
                </div>
            </div>
        </div>
    `;

    if (!interventions || interventions.length === 0) {
        html += `
            <div class="profil-zone-avertissement" style="text-align: center;">
                <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 10px; color: var(--bleu-moyen);">
                    Aucune intervention enregistrée
                </div>
                <div style="font-style: italic; font-size: 0.95rem; color: var(--bleu-moyen);">
                    Les interventions RàI auxquelles cet·te étudiant·e participe apparaîtront ici
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
        <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem;">
            Décomposition de l'indice M
        </h4>
        <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <div style="font-family: monospace; font-size: 1.1rem; text-align: center; color: var(--bleu-principal);">
                M = (A + C) / 2 = (${indices.A}% + ${indices.C}%) / 2 = ${indices.M}
            </div>
        </div>

        <!-- RECOMMANDATIONS SELON LE NIVEAU -->
        ${interpM.niveau === 'Décrochage' ? `
            <div style="background: #f5f5f5; border-left: 4px solid #9e9e9e; padding: 15px; border-radius: 6px;">
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
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 6px;">
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
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.9rem; color: #666;">Assiduité (A)</span>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${indices.A}%</strong>
                </div>
            </div>
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.9rem; color: #666;">Complétion (C)</span>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${indices.C}%</strong>
                </div>
            </div>
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.9rem; color: #666;">Performance (P)</span>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${indices.P}%</strong>
                </div>
            </div>
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal); border-left: 4px solid ${interpE.couleur};">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.9rem; color: #666;">Engagement (E)</span>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${indices.E}</strong>
                </div>
            </div>
        </div>

        <!-- INTERPRÉTATION QUALITATIVE -->
        <div style="padding: 15px; background: linear-gradient(to right, ${interpE.couleur}22, ${interpE.couleur}11);
                    border-left: 4px solid ${interpE.couleur}; border-radius: 6px; margin-bottom: 15px;">
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
        <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem;">
            Décomposition de l'indice E (effet multiplicatif)
        </h4>
        <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <div style="font-family: monospace; font-size: 1rem; text-align: center; color: var(--bleu-principal); margin-bottom: 10px;">
                E = A × C × P
            </div>
            <div style="font-family: monospace; font-size: 1rem; text-align: center; color: var(--bleu-principal); margin-bottom: 10px;">
                E = ${A.toFixed(2)} × ${C.toFixed(2)} × ${P.toFixed(2)} = ${indices.E}
            </div>
            <div style="background: #f0f7ff; padding: 12px; border-radius: 4px; font-size: 0.9rem; color: #555; line-height: 1.6;">
                <strong>⚠️ Nature multiplicative :</strong> Si un seul composant est faible, l'engagement global chute drastiquement.
                ${indices.E < 0.50 ? `<br><strong>Facteur limitant identifié :</strong> ${facteurLimitant.nom} (${facteurLimitant.pourcentage}%)` : ''}
            </div>
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
            <div style="background: linear-gradient(to right, #2196F322, #2196F311); border-left: 4px solid #2196F3; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
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
    const interpR = interpreterRisque(indices.R);
    const interpE = interpreterEngagement(indices.E);

    // Déterminer le niveau RàI (Réponse à l'Intervention)
    let niveauRaI = 1;
    let descriptionRaI = 'Niveau 1 - Surveillance universelle';
    let urgence = 'Aucune action immédiate requise';
    let couleurUrgence = '#28a745';

    const seuilEleve = obtenirSeuil('risque.eleve');
    const seuilModere = obtenirSeuil('risque.faible');  // 0.35 pour modéré ou plus
    const seuilMinimal = obtenirSeuil('risque.minimal'); // 0.20 pour faible ou plus

    if (indices.R >= seuilEleve) {
        niveauRaI = 3;
        descriptionRaI = 'Niveau 3 - Intervention intensive individuelle';
        urgence = '🚨 URGENCE MAXIMALE - Intervention immédiate requise';
        couleurUrgence = '#dc3545';
    } else if (indices.R >= seuilModere) {
        niveauRaI = 2;
        descriptionRaI = 'Niveau 2 - Intervention ciblée en petit groupe';
        urgence = '⚠️ Intervention prioritaire dans les prochains jours';
        couleurUrgence = '#ff9800';
    } else if (indices.R >= seuilMinimal) {
        niveauRaI = 2;
        descriptionRaI = 'Niveau 2 - Surveillance accrue';
        urgence = '⚡ Attention requise - Surveillance renforcée';
        couleurUrgence = '#ffc107';
    }

    // Calculer la "marge de sécurité" (distance avant zone rouge)
    const margeSécurité = Math.max(0, 0.60 - indices.R);
    const pourcentageSécurité = ((1 - indices.R) * 100).toFixed(0);

    return `
        <!-- BADGE NIVEAU RISQUE -->
        <div class="badge" style="background-color: ${interpR.couleur}22; color: ${interpR.couleur}; border: 1px solid ${interpR.couleur};">
            ${interpR.niveau} (${indices.R})
        </div>

        <ul class="info-liste">
            <li><strong>Pattern :</strong> ${interpR.pattern || 'Analyse en cours'}</li>
            <li><strong>Niveau RàI :</strong> ${descriptionRaI}</li>
            <li><strong>Urgence :</strong> <span style="color: ${couleurUrgence};">${urgence}</span></li>
        </ul>

        <div class="section-titre" style="margin-top: 25px;">Position sur l'échelle de risque</div>

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
            Le risque d'échec est <strong>inversement proportionnel</strong> à l'engagement global.
            <br>Engagement actuel : <strong style="color: ${interpE.couleur};">${interpE.niveau}</strong>
        </div>

        <div class="section-titre" style="margin-top: 25px;">Indicateurs clés</div>

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
            <div class="profil-recommandations ${indices.R >= seuilEleve ? 'profil-recommandations-danger' : indices.R >= seuilModere ? 'profil-recommandations-avertissement' : 'profil-recommandations-info'}" style="margin-top: 20px;">
                <h4 class="profil-recommandations-titre ${indices.R >= seuilEleve ? 'profil-texte-danger' : indices.R >= seuilModere ? 'profil-texte-avertissement' : 'profil-texte-info'}">
                    Intervention ciblée recommandée
                </h4>
                <ol class="profil-recommandations-liste ${indices.R >= seuilEleve ? 'profil-texte-danger' : indices.R >= seuilModere ? 'profil-texte-avertissement' : 'profil-texte-info'}">
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
            <div class="profil-recommandations profil-recommandations-succes" style="margin-top: 20px;">
                <h4 class="profil-recommandations-titre profil-texte-succes">Maintien de l'engagement</h4>
                <ul class="profil-recommandations-liste profil-texte-succes">
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
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
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
    // Utiliser les fonctions du module 09-2-saisie-presences.js
    const heuresPresentes = calculerTotalHeuresPresence(da, null);

    // Compter le nombre de séances RÉELLEMENT SAISIES (au moins un élève présent)
    const presences = obtenirDonneesSelonMode('presences') || [];

    // Obtenir toutes les dates uniques pour lesquelles une saisie a été faite
    const datesSaisies = new Set();
    presences.forEach(p => {
        if (p.da === da && p.heures !== null && p.heures !== undefined) {
            datesSaisies.add(p.date);
        }
    });

    const nombreSeances = datesSaisies.size;
    const dureeSeance = obtenirDureeMaxSeance();
    const heuresOffertes = nombreSeances * dureeSeance;

    // Récupérer les séances configurées
    // NOTE: seancesHoraire n'est pas mode-aware (configuration globale)
    const seances = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');

    // Détecter les absences (totales ET partielles)
    const absences = [];

    // Pour chaque date avec saisie
    datesSaisies.forEach(dateCours => {
        const presenceEleve = presences.find(p => p.da === da && p.date === dateCours);

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
    const cibleInfo = determinerCibleIntervention(da);
    const indices3Derniers = calculerIndicesTroisDerniersArtefacts(da);

    // Ne pas afficher si pas assez de données
    if (indices3Derniers.nbArtefacts === 0) {
        return '';
    }

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
                <strong>Pattern actuel :</strong> ${cibleInfo.pattern} ·
                <strong>Basé sur :</strong> ${indices3Derniers.nbArtefacts} dernier${indices3Derniers.nbArtefacts > 1 ? 's' : ''} artefact${indices3Derniers.nbArtefacts > 1 ? 's' : ''}
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
 * Variable globale pour mémoriser la section active du profil (Beta 85)
 * Permet de conserver la même section lors de la navigation entre étudiants
 */
let sectionProfilActive = 'cible'; // Par défaut: Suivi de l'apprentissage

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
        case 'cible':
            titre = 'Suivi de l\'apprentissage';
            contenu = genererContenuCibleIntervention(da);
            break;
        case 'performance':
            titre = 'Développement des habiletés et compétences';
            contenu = genererSectionPerformance(da);
            break;
        case 'mobilisation':
            titre = 'Mobilisation';
            contenu = genererSectionMobilisationEngagement(da);
            break;
        case 'rapport':
            titre = 'Rapport';
            contenu = `
                <div style="background: var(--bleu-tres-pale); border: 2px dashed var(--bleu-pale); border-radius: 8px;
                            padding: 40px 20px; text-align: center; color: var(--bleu-moyen);">
                    <div style="font-size: 2rem; margin-bottom: 15px;"></div>
                    <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 10px;">
                        Rapport pour l'API
                    </div>
                    <div style="font-style: italic; font-size: 0.95rem;">
                        Outil de composition de rapport destiné à l'aide pédagogique individuel (à venir)
                    </div>
                </div>
            `;
            break;
        case 'accompagnement':
            titre = 'Accompagnement';
            contenu = genererSectionAccompagnement(da);
            break;
        default:
            titre = 'Section inconnue';
            contenu = '<p>Section non trouvée</p>';
    }

    // Récupérer la pratique pour le badge (toutes les sections)
    const indices = calculerTousLesIndices(da);
    const badgePratique = genererBadgePratiqueProfil(indices.pratique);

    // Générer le toggle info selon la section
    let toggleInfo = '';
    if (section === 'cible') {
        toggleInfo = `<span style="font-size: 1.2rem;"><span class="emoji-toggle" data-target="details-calculs-risque-${da}">ℹ️</span></span>`;
    } else if (section === 'performance') {
        toggleInfo = `<span style="font-size: 1.2rem;"><span class="emoji-toggle" data-target="details-calculs-performance-${da}">ℹ️</span></span>`;
    } else if (section === 'mobilisation') {
        toggleInfo = `<span style="font-size: 1.2rem;"><span class="emoji-toggle" data-target="details-calculs-mobilisation-${da}">ℹ️</span></span>`;
    } else if (section === 'accompagnement') {
        toggleInfo = `<span style="font-size: 1.2rem;"><span class="emoji-toggle" data-target="details-calculs-accompagnement-${da}">ℹ️</span></span>`;
    }

    contenuContainer.innerHTML = `
        <div class="profil-contenu-header">
            <h2 style="display: flex; justify-content: space-between; align-items: center; margin: 0 0 20px 0;">
                <span>${titre}${badgePratique}</span>
                ${toggleInfo}
            </h2>
        </div>
        <div class="profil-contenu-body">
            ${contenu}
        </div>
    `;

    // Réattacher les événements des toggles après changement de section
    setTimeout(() => {
        if (typeof reattacherEvenementsToggles === 'function') {
            reattacherEvenementsToggles();
        }
    }, 100);

    console.log(`📄 Section "${section}" chargée pour DA ${da}`);
}

/**
 * Calcule la direction du risque (évolution temporelle)
 * Compare le risque sur les 3 artefacts récents vs les 3 suivants (fenêtre glissante)
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { symbole: '→'|'←'|'—', interpretation: string }
 */
function calculerDirectionRisque(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');

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

    // Pas assez de données pour calculer la direction du risque
    if (evaluationsEleve.length < 4) {
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

    // Calculer risque récent (3 plus récents: positions 0, 1, 2)
    const troisRecents = evaluationsEleve.slice(0, 3);
    const performanceRecente = troisRecents.reduce((sum, e) => sum + e.noteFinale, 0) / troisRecents.length / 100;
    const risqueRecent = 1 - performanceRecente;

    // Calculer risque précédent (3 suivants avec chevauchement: positions 1, 2, 3)
    const troisSuivants = evaluationsEleve.slice(1, 4);
    const performancePrecedente = troisSuivants.reduce((sum, e) => sum + e.noteFinale, 0) / troisSuivants.length / 100;
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
 * Compare les scores sur les 3 artefacts récents vs les 3 suivants (fenêtre glissante)
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { structure: {symbole, interpretation}, rigueur: {...}, ... }
 */
function calculerDirectionsCriteres(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');

    // Filtrer uniquement les artefacts de portfolio évalués pour cet étudiant
    const artefactsPortfolio = productions
        .filter(p => p.type === 'artefact-portfolio')
        .map(p => p.id);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        artefactsPortfolio.includes(e.productionId) &&
        e.retroactionFinale
    );

    // Résultat par défaut si données insuffisantes
    const resultatParDefaut = {
        symbole: '',
        interpretation: 'Données insuffisantes'
    };

    // Pas assez de données pour calculer la direction
    if (evaluationsEleve.length < 4) {
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

    // Extraire les scores pour les 3 plus récents (positions 0, 1, 2)
    const troisRecents = evaluationsEleve.slice(0, 3);
    const scoresRecents = extraireScoresCriteres(troisRecents);

    // Extraire les scores pour les 3 suivants avec chevauchement (positions 1, 2, 3)
    const troisSuivants = evaluationsEleve.slice(1, 4);
    const scoresSuivants = extraireScoresCriteres(troisSuivants);

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
 * Génère le contenu de la section Suivi de l'apprentissage
 * Structure épurée: 1 encadré blanc avec badge RàI, infos, message, graphique
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML du contenu
 */
function genererContenuCibleIntervention(da) {
    const cibleInfo = determinerCibleIntervention(da);
    const indices3Derniers = calculerIndicesTroisDerniersArtefacts(da);
    const indices = calculerTousLesIndices(da);
    const interpR = interpreterRisque(indices.R);
    const interpM = interpreterMobilisation(indices.A / 100, indices.C / 100);

    // Récupérer infos élève pour CAF/SA
    const tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiants = typeof filtrerEtudiantsParMode === 'function'
        ? filtrerEtudiantsParMode(tousEtudiants)
        : tousEtudiants.filter(e => e.groupe !== '9999');
    const eleve = etudiants.find(e => e.da === da);

    // Ne pas afficher si pas assez de données
    if (indices3Derniers.nbArtefacts === 0) {
        return `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></div>
                <h3 style="color: #666; margin-bottom: 10px;">Données insuffisantes</h3>
                <p style="color: #999;">
                    Pas encore d'artefacts évalués pour cet étudiant.<br>
                    Le suivi de l'apprentissage sera disponible après l'évaluation d'au moins un artefact.
                </p>
            </div>
        `;
    }

    // Utiliser le même badge que dans Liste et Aperçu (défini plus haut : badgeLabel)
    // const niveauTexte est maintenant badgeLabel

    // Calculer les moyennes pour accéder aux scores des critères
    const moyennes = calculerMoyennesCriteres(da);

    // Calculer les directions des critères pour identifier les critères en détérioration
    const directionsCriteres = calculerDirectionsCriteres(da);
    const criteresEnDeterioration = [];
    const criteresEnAmelioration = [];
    const criteresAvecScores = [];

    ['structure', 'rigueur', 'plausibilite', 'nuance', 'francais'].forEach(cle => {
        const nomCritere = cle === 'structure' ? 'Structure' :
                         cle === 'rigueur' ? 'Rigueur' :
                         cle === 'plausibilite' ? 'Plausibilité' :
                         cle === 'nuance' ? 'Nuance' : 'Français';

        if (directionsCriteres[cle] && directionsCriteres[cle].symbole === '←') {
            criteresEnDeterioration.push(nomCritere);
        } else if (directionsCriteres[cle] && directionsCriteres[cle].symbole === '→') {
            criteresEnAmelioration.push(nomCritere);
        }

        // Garder trace des scores pour identifier le plus faible
        if (moyennes && moyennes[cle] !== null) {
            criteresAvecScores.push({
                nom: nomCritere,
                score: moyennes[cle],
                pourcentage: Math.round(moyennes[cle] * 100),
                niveau: moyennes[cle] < 0.64 ? 'I' : moyennes[cle] < 0.75 ? 'D' : moyennes[cle] < 0.85 ? 'M' : 'E'
            });
        }
    });

    // Trier par score croissant pour identifier le critère le plus faible
    criteresAvecScores.sort((a, b) => a.score - b.score);

    // Identifier le critère le plus faible parmi ceux en I ou D
    const critereLesPlusFaibles = criteresAvecScores.filter(c => c.niveau === 'I' || c.niveau === 'D');

    // Générer la description en fonction du niveau et des critères identifiés
    let descriptionNiveau = '';

    if (cibleInfo.niveau === 3) {
        descriptionNiveau = '⚠️ <strong>Action immédiate requise</strong> - Intervention intensive pour prévenir un échec. Mobiliser les ressources d\'aide (CAF, aide à l\'apprentissage).';
        if (criteresEnDeterioration.length > 0) {
            descriptionNiveau += ` <strong>Critère(s) en détérioration :</strong> ${criteresEnDeterioration.join(', ')}.`;
        } else if (critereLesPlusFaibles.length > 0) {
            const plusFaible = critereLesPlusFaibles[0];
            descriptionNiveau += ` <strong>Critère prioritaire à renforcer :</strong> ${plusFaible.nom} (${plusFaible.pourcentage}%, niveau ${plusFaible.niveau}).`;
        }
    } else if (cibleInfo.niveau === 2) {
        descriptionNiveau = '<strong>Intervention ciblée recommandée</strong> - Soutien spécifique pour consolider les apprentissages';
        if (criteresEnDeterioration.length > 0) {
            descriptionNiveau += ` et prévenir l\'aggravation des difficultés en <strong>${criteresEnDeterioration.join(', ')}</strong>.`;
        } else if (critereLesPlusFaibles.length > 0) {
            const plusFaible = critereLesPlusFaibles[0];
            descriptionNiveau += ` et renforcer <strong>${plusFaible.nom}</strong> (${plusFaible.pourcentage}%, niveau ${plusFaible.niveau}).`;
        } else {
            descriptionNiveau += ' et prévenir l\'aggravation des difficultés.';
        }
    } else if (cibleInfo.cible.includes('Pratique autonome')) {
        descriptionNiveau = '✨ <strong>Enrichissement</strong> - L\'étudiant maîtrise les bases. Encourager l\'exploration, la créativité et le développement de l\'autonomie.';
        if (criteresEnAmelioration.length > 0) {
            descriptionNiveau += ` <strong>Progrès observés en :</strong> ${criteresEnAmelioration.join(', ')}.`;
        }
    } else {
        descriptionNiveau = '✓ <strong>Maintien</strong> - Performance satisfaisante. Continuer le suivi régulier et encourager la constance.';
        if (criteresEnAmelioration.length > 0) {
            descriptionNiveau += ` <strong>Progrès observés en :</strong> ${criteresEnAmelioration.join(', ')}.`;
        }
    }

    // Calculer le blocage pour affichage dans le toggle
    const resultBlocage = calculerIndiceBlocage(moyennes);
    const interpBlocage = resultBlocage ? interpreterIndiceBlocage(resultBlocage.score) : null;

    // Calculer la progression (AM vs AL)
    const progression = calculerProgressionEleve(da);

    // Ajuster l'interprétation de la progression selon le contexte de risque
    const seuilRisqueModere = obtenirSeuil('risque.modere');
    const seuilRisqueFaible = obtenirSeuil('risque.faible');

    let interpretationProgression = progression.interpretation;
    if (progression.direction === '—' && indices.R >= seuilRisqueModere) {
        // Plateau en zone de risque élevé/critique = plateau problématique
        interpretationProgression = 'Plateau (progression insuffisante)';
    } else if (progression.direction === '—' && indices.R >= seuilRisqueFaible) {
        // Plateau en zone de risque modéré = attention
        interpretationProgression = 'Plateau fragile';
    }

    // Calculer la direction du risque (évolution temporelle)
    const directionRisque = calculerDirectionRisque(da);

    // Identifier le défi spécifique (critère SRPNF le plus faible sur 3 derniers artefacts)
    const defiSpecifique = identifierDefiSpecifique(da);

    // Interpréter le niveau IDME du défi avec description SOLO (seuils configurables)
    const interpreterScoreIDME = (score) => {
        const seuilInsuffisant = obtenirSeuil('idme.insuffisant');
        const seuilDeveloppement = obtenirSeuil('idme.developpement');
        const seuilMaitrise = obtenirSeuil('idme.maitrise');

        if (score < seuilInsuffisant) return 'Un seul aspect traité, compréhension superficielle';
        if (score < seuilDeveloppement) return 'Plusieurs aspects sans vision d\'ensemble';
        if (score < seuilMaitrise) return 'Vision globale avec liens entre les aspects';
        return 'Transfert à d\'autres contextes';
    };

    // Construire le texte du pattern avec le défi intégré si applicable
    let patternTexte = cibleInfo.pattern;
    if (cibleInfo.pattern === 'Défi spécifique' && defiSpecifique.defi !== 'Aucun') {
        const niveauIDME = interpreterScoreIDME(defiSpecifique.score);
        patternTexte = `${cibleInfo.pattern} (${defiSpecifique.defi} - ${niveauIDME})`;
    }

    // Badge RàI avec classes CSS (Beta 84)
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

    return `
        <!-- Détails des calculs (masqué par défaut) - AFFICHÉ EN HAUT -->
        <div id="details-calculs-risque-${da}" class="carte-info-toggle" style="display: none;">
            <div class="details-calculs-section">
                <h5 class="details-calculs-titre">MÉTHODOLOGIE DE CALCUL</h5>
                <!-- Grille 2 colonnes pour Risque et Blocage -->
                <div class="details-calculs-grid">
                    <!-- Calcul Risque -->
                    <div>
                        <div class="details-calculs-bloc">
                            <div class="details-calculs-label">Risque (R):</div>
                            <div class="details-calculs-valeur">R = (1 - A) × 0.50 + (1 - C) × 0.25 + (1 - P) × 0.25</div>

                            <div class="details-calculs-label">Calcul détaillé:</div>
                            <div class="details-calculs-valeur">
                                R = (1 - ${(indices.A / 100).toFixed(2)}) × 0.50 + (1 - ${(indices.C / 100).toFixed(2)}) × 0.25 + (1 - ${(indices.P / 100).toFixed(2)}) × 0.25<br>
                                R = ${((1 - indices.A / 100) * 0.50).toFixed(3)} + ${((1 - indices.C / 100) * 0.25).toFixed(3)} + ${((1 - indices.P / 100) * 0.25).toFixed(3)}<br>
                                R = <strong>${indices.R}</strong>
                            </div>
                        </div>
                    </div>

                    ${interpBlocage ? `
                        <!-- Calcul Blocage -->
                        <div>
                            <div class="details-calculs-bloc">
                                <div class="details-calculs-label">Blocage${resultBlocage.partiel ? ' (ajusté)' : ''}:</div>
                                <div class="details-calculs-valeur">
                                    ${resultBlocage.partiel
                                        ? `Blocage = (critères disponibles pondérés) / total pondération`
                                        : `Blocage = 0.35 × Structure + 0.35 × Français + 0.30 × Rigueur`
                                    }
                                </div>

                                ${resultBlocage.partiel ? `
                                    <div class="details-calculs-alerte">
                                        <strong>⚠️ Calcul partiel:</strong> ${resultBlocage.criteresManquants.join(', ')} non évalué(s)
                                    </div>
                                ` : ''}

                                <div class="details-calculs-label">Calcul détaillé:</div>
                                <div class="details-calculs-valeur">
                                    ${moyennes.structure !== null ? `0.35 × ${Math.round(moyennes.structure * 100)}%<br>` : ''}
                                    ${moyennes.francais !== null ? `0.35 × ${Math.round(moyennes.francais * 100)}%<br>` : ''}
                                    ${moyennes.rigueur !== null ? `0.30 × ${Math.round(moyennes.rigueur * 100)}%<br>` : ''}
                                    Blocage = <strong>${Math.round(resultBlocage.score * 100)}%</strong>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                </div>

                <!-- Calcul de la Progression -->
                ${progression.direction ? `
                <div style="margin-top: 20px;">
                    <div class="details-calculs-bloc">
                        <div class="details-calculs-label">Progression (Direction):</div>
                        <div class="details-calculs-valeur">
                            Comparer la performance récente (AM) vs performance précédente (AL)<br>
                            SI AM > AL + 0.1 → ↗ Progression<br>
                            SI AM < AL - 0.1 → ↘ Régression<br>
                            Sinon → — Plateau
                        </div>

                        <div class="details-calculs-label">Calcul détaillé:</div>
                        <div class="details-calculs-valeur">
                            AM (3 artefacts récents) = <strong>${progression.AM}%</strong><br>
                            AL (3 artefacts suivants, avec chevauchement) = <strong>${progression.AL}%</strong><br>
                            Différence = ${progression.difference > 0 ? '+' : ''}${progression.difference} points<br>
                            <strong>${progression.direction} ${interpretationProgression}</strong>
                        </div>
                    </div>
                </div>
                ` : `
                <div style="margin-top: 20px;">
                    <div class="details-calculs-bloc">
                        <div class="details-calculs-label">Progression (Direction):</div>
                        <div class="details-calculs-valeur">
                            ${progression.interpretation}<br>
                            <span style="font-size: 0.9rem; opacity: 0.8;">La progression sera calculée après l'évaluation de 4 artefacts (actuellement: ${progression.nbArtefacts})</span>
                        </div>
                    </div>
                </div>
                `}

                <!-- Identification du Défi spécifique -->
                <div style="margin-top: 20px;">
                    <div class="details-calculs-bloc">
                        <div class="details-calculs-label">Défi spécifique:</div>
                        <div class="details-calculs-valeur">
                            Identifier le critère SRPNF le plus faible parmi les 3 derniers artefacts<br>
                            Seuil d'identification: &lt; ${(obtenirSeuil('defiSpecifique') * 100).toFixed(2)}% (configurable)
                        </div>

                        <div class="details-calculs-label">Résultat:</div>
                        <div class="details-calculs-valeur">
                            ${defiSpecifique.defi !== 'Aucun' ? `
                                Critère identifié: <strong>${defiSpecifique.defi}</strong><br>
                                Score moyen: <strong>${(defiSpecifique.score * 100).toFixed(1)}%</strong> (${defiSpecifique.score.toFixed(4)})<br>
                                <span style="font-size: 0.9rem; opacity: 0.8;">Ce critère nécessite une attention particulière dans les prochaines interventions</span>
                            ` : `
                                <strong>Aucun défi spécifique identifié</strong><br>
                                <span style="font-size: 0.9rem; opacity: 0.8;">Tous les critères SRPNF sont ≥ ${(obtenirSeuil('defiSpecifique') * 100).toFixed(2)}% sur les 3 derniers artefacts</span>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Identification du Pattern d'apprentissage et niveau RàI -->
                <div style="margin-top: 20px;">
                    <div class="details-calculs-bloc">
                        <div class="details-calculs-label">Pattern d'apprentissage:</div>
                        <div class="details-calculs-valeur">
                            Analyser la performance sur les 3 derniers artefacts et la présence d'un défi pour identifier le pattern actuel:<br><br>
                            <strong>• Blocage critique:</strong> Performance ≤ 0.40 (40%)<br>
                            <span style="font-size: 0.9rem; opacity: 0.8; margin-left: 20px;">→ Difficultés majeures nécessitant une intervention intensive</span><br><br>
                            <strong>• Blocage émergent:</strong> Performance ≤ 0.50 (50%) ET un défi est identifié<br>
                            <span style="font-size: 0.9rem; opacity: 0.8; margin-left: 20px;">→ Difficultés en développement dans un critère spécifique</span><br><br>
                            <strong>• Défi spécifique:</strong> Performance ≤ 0.75 (75%) ET un défi est identifié<br>
                            <span style="font-size: 0.9rem; opacity: 0.8; margin-left: 20px;">→ Compétence en développement avec une lacune ciblée</span><br><br>
                            <strong>• Stable:</strong> Performance > 0.75 (75%) OU aucun défi identifié<br>
                            <span style="font-size: 0.9rem; opacity: 0.8; margin-left: 20px;">→ Apprentissage consolidé sans difficulté majeure</span>
                        </div>

                        <div class="details-calculs-label">Calcul pour cet étudiant:</div>
                        <div class="details-calculs-valeur">
                            Performance (3 derniers artefacts) = <strong>${(indices3Derniers.performance * 100).toFixed(1)}%</strong><br>
                            Défi identifié = <strong>${defiSpecifique.defi !== 'Aucun' ? 'Oui (' + defiSpecifique.defi + ')' : 'Non'}</strong><br>
                            Pattern identifié = <strong>${cibleInfo.pattern}</strong>
                        </div>

                        <div class="details-calculs-label">Détermination du niveau RàI (Réponse à l'Intervention):</div>
                        <div class="details-calculs-valeur">
                            Le pattern identifié est combiné avec d'autres facteurs pour déterminer le niveau RàI:<br><br>
                            <strong>• Mobilisation</strong> (A et C): ${interpM.niveau}<br>
                            <strong>• Risque</strong> (R): ${interpR.niveau}<br>
                            <strong>• Pattern</strong>: ${cibleInfo.pattern}<br>
                            <strong>• Défi principal</strong>: ${defiSpecifique.defi !== 'Aucun' ? defiSpecifique.defi : 'Aucun'}<br>
                            <strong>• Performance en français</strong> (3 derniers): ${indices3Derniers.francaisMoyen.toFixed(1)}%<br><br>
                            → <strong>Niveau RàI déterminé: ${cibleInfo.niveau}</strong><br>
                            <span style="font-size: 0.9rem; opacity: 0.8;">
                                ${cibleInfo.niveau === 3 ? 'Niveau 3 - Intervention intensive ciblée requise' :
                                  cibleInfo.niveau === 2 ? 'Niveau 2 - Intervention ciblée recommandée' :
                                  'Niveau 1 - Surveillance universelle et prévention'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Direction du risque (symbole sur l'échelle) -->
                ${directionRisque.symbole ? `
                <div style="margin-top: 20px;">
                    <div class="details-calculs-bloc">
                        <div class="details-calculs-label">Direction du risque (symbole sur l'échelle):</div>
                        <div class="details-calculs-valeur">
                            Comparer le risque récent vs le risque précédent (fenêtre glissante):<br><br>
                            <strong>→</strong> Si le risque augmente de plus de 5% → L'étudiant s'enfonce dans la difficulté<br>
                            <strong>←</strong> Si le risque diminue de plus de 5% → L'étudiant s'améliore<br>
                            <strong>—</strong> Si la variation est inférieure à 5% → Plateau (risque stable)
                        </div>

                        <div class="details-calculs-label">Calcul pour cet étudiant:</div>
                        <div class="details-calculs-valeur">
                            Risque récent (3 derniers artefacts) = <strong>${directionRisque.risqueRecent}%</strong><br>
                            Risque précédent (3 suivants, avec chevauchement) = <strong>${directionRisque.risquePrecedent}%</strong><br>
                            Différence = ${directionRisque.difference > 0 ? '+' : ''}${directionRisque.difference}% (points de risque)<br>
                            Symbole affiché = <strong style="font-size: 1.2rem;">${directionRisque.symbole}</strong> → ${directionRisque.interpretation}
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
            </div>
        </div>
        <!-- ENCADRÉ UNIQUE: SUIVI DE L'APPRENTISSAGE -->
        <div class="profil-carte">

            <!-- Badge RàI sobre -->
            <span class="${badgeClasse}" style="display: inline-block; margin-bottom: 15px;">
                ${badgeLabel}
            </span>

            <!-- Liste des informations -->
            <ul class="info-liste">
                <li><strong>Risque :</strong> ${genererBadgeRisqueProfil(indices.R)} (${indices.R})</li>
                <li><strong>Pattern :</strong> ${genererBadgePatternProfil(cibleInfo.pattern)} ${defiSpecifique.defi !== 'Aucun' ? '(' + defiSpecifique.defi + ' - ' + interpreterScoreIDME(defiSpecifique.score) + ')' : ''}</li>
                <li><strong>Progression :</strong> ${progression.direction ? `${progression.direction} ${interpretationProgression} (${progression.difference > 0 ? '+' : ''}${progression.difference} points)` : `${progression.interpretation} (${progression.nbArtefacts}/4 artefacts)`}</li>
                <li><strong>Services :</strong> ${eleve.caf === 'Oui' ? '✓ CAF' : ''} ${eleve.sa === 'Oui' ? '✓ SA' : ''} ${eleve.caf !== 'Oui' && eleve.sa !== 'Oui' ? 'Aucun' : ''}</li>
                ${genererHistoriqueInterventionsProfil(da)}
            </ul>

            <hr class="profil-separateur">

            <div class="section-titre">Position sur l'échelle de risque</div>

            <div class="profil-echelle-risque">
                <div class="profil-echelle-barre" style="background: linear-gradient(to right,
                            #2196F3 0%, #2196F3 20%,
                            #28a745 20%, #28a745 35%,
                            #ffc107 35%, #ffc107 50%,
                            #ff9800 50%, #ff9800 70%,
                            #dc3545 70%, #dc3545 100%);">
                    ${directionRisque.symbole ? `<div style="position: absolute; left: ${Math.min(indices.R * 100, 100)}%; transform: translateX(-50%); top: -32px; font-size: 1.2rem; font-weight: bold; color: #333;">${directionRisque.symbole}</div>` : ''}
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

            <div class="section-titre">Pistes d'intervention</div>

            <div style="border: 2px solid ${cibleInfo.niveau === 3 ? '#dc3545' : cibleInfo.niveau === 2 ? '#ffc107' : cibleInfo.cible.includes('Pratique autonome') ? '#2196F3' : '#28a745'}; border-left-width: 4px; padding: 12px 15px; border-radius: 4px; background: white;">
                <div style="color: #333; line-height: 1.6; font-size: 0.95rem;">
                    ${descriptionNiveau}
                </div>
            </div>

            <hr class="profil-separateur">

            <!-- Placeholder graphique (en conclusion) -->
            <div style="background: var(--bleu-tres-pale); border: 2px dashed var(--bleu-pale); border-radius: 8px;
                        padding: 30px 20px; text-align: center; color: var(--bleu-moyen); font-style: italic;">
                📈 Évolution temporelle du risque (à venir)
            </div>
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

    const tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiants = typeof filtrerEtudiantsParMode === 'function'
        ? filtrerEtudiantsParMode(tousEtudiants)
        : tousEtudiants.filter(e => e.groupe !== '9999');

    // 🗂️ Cache la liste des étudiants pour la navigation cross-mode
    window.etudiantsListeCache = etudiants;

    const eleve = etudiants.find(e => e.da === da);

    if (!eleve) {
        alert('Élève introuvable');
        return;
    }

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
    const interpR = interpreterRisque(indices.R);

    // Trouver l'index de l'élève dans la liste pour navigation
    const indexActuel = etudiants.findIndex(e => e.da === da);
    const etudiantPrecedent = indexActuel > 0 ? etudiants[indexActuel - 1] : null;
    const etudiantSuivant = indexActuel < etudiants.length - 1 ? etudiants[indexActuel + 1] : null;

    // NOUVEAU (Beta 85): Déterminer quelle section afficher (section mémorisée ou 'cible' par défaut)
    const sectionAffichee = sectionProfilActive || 'cible';

    // Déterminer le titre et le contenu selon la section active
    let titreSection = '';
    let contenuSection = '';

    if (sectionAffichee === 'cible') {
        titreSection = 'Suivi de l\'apprentissage';
        contenuSection = genererContenuCibleIntervention(da);
    } else if (sectionAffichee === 'performance') {
        titreSection = 'Développement des habiletés et compétences';
        contenuSection = genererSectionPerformance(da);
    } else if (sectionAffichee === 'mobilisation') {
        titreSection = 'Mobilisation';
        contenuSection = genererSectionMobilisationEngagement(da);
    } else if (sectionAffichee === 'rapport') {
        titreSection = 'Rapport';
        contenuSection = `
            <div style="background: var(--bleu-tres-pale); border: 2px dashed var(--bleu-pale); border-radius: 8px;
                        padding: 40px 20px; text-align: center; color: var(--bleu-moyen);">
                <div style="font-size: 2rem; margin-bottom: 15px;"></div>
                <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 10px;">
                    Rapport pour l'API
                </div>
                <div style="font-style: italic; font-size: 0.95rem;">
                    Outil de composition de rapport destiné à l'aide pédagogique individuel (à venir)
                </div>
            </div>
        `;
    } else if (sectionAffichee === 'accompagnement') {
        titreSection = 'Accompagnement';
        contenuSection = genererSectionAccompagnement(da);
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
                        ${etudiants.map(e => `
                            <option value="${e.da}" ${e.da === da ? 'selected' : ''}>
                                ${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)} (${echapperHtml(e.daAffichage || e.da)})
                            </option>
                        `).join('')}
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
                        <div><strong>DA:</strong> ${echapperHtml(eleve.daAffichage || eleve.da)}</div>
                        ${eleve.groupe ? `<div><strong>Groupe:</strong> ${echapperHtml(eleve.groupe)}</div>` : ''}
                        ${eleve.programme ? `<div><strong>Programme:</strong> ${typeof obtenirNomProgramme === 'function' ? echapperHtml(obtenirNomProgramme(eleve.programme)) : echapperHtml(eleve.programme)}</div>` : ''}
                        ${eleve.sa === 'Oui' ? '<div style="color: var(--bleu-principal);">✓ Services adaptés</div>' : ''}
                        ${eleve.caf === 'Oui' ? '<div style="color: var(--bleu-principal);">✓ CAF</div>' : ''}
                    </div>
                </div>

                <!-- Navigation sections (utilise les classes matériel) -->
                <div class="sidebar-liste">
                    <div class="sidebar-section-titre">OBSERVATIONS</div>

                    <!-- 1. Suivi de l'apprentissage -->
                    <div class="sidebar-item ${sectionAffichee === 'cible' ? 'active' : ''}" onclick="changerSectionProfil('cible')">
                        <div class="sidebar-item-titre">Suivi de l'apprentissage</div>
                    </div>

                    <!-- 2. Développement des habiletés -->
                    <div class="sidebar-item ${sectionAffichee === 'performance' ? 'active' : ''}" onclick="changerSectionProfil('performance')">
                        <div class="sidebar-item-titre">Développement des habiletés</div>
                    </div>

                    <!-- 3. Mobilisation -->
                    <div class="sidebar-item ${sectionAffichee === 'mobilisation' ? 'active' : ''}" onclick="changerSectionProfil('mobilisation')">
                        <div class="sidebar-item-titre">Mobilisation</div>
                    </div>

                    <!-- 4. Accompagnement -->
                    <div class="sidebar-item ${sectionAffichee === 'accompagnement' ? 'active' : ''}" onclick="changerSectionProfil('accompagnement')">
                        <div class="sidebar-item-titre">Accompagnement</div>
                    </div>

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
                    <h2 style="display: flex; justify-content: space-between; align-items: center; margin: 0 0 20px 0;">
                        <span>${titreSection}${genererBadgePratiqueProfil(indices.pratique)}</span>
                        <span style="font-size: 1.2rem;"><span class="emoji-toggle" data-target="details-calculs-risque-${da}">ℹ️</span></span>
                    </h2>
                </div>
                <div class="profil-contenu-body">
                    ${contenuSection}
                </div>
            </div>
        </div>
    `;

    // Réattacher les événements des toggles après insertion du contenu
    setTimeout(() => {
        if (typeof reattacherEvenementsToggles === 'function') {
            reattacherEvenementsToggles();
        }
        // SUPPRIMÉ (Beta 85): Plus besoin de restaurer la section après coup,
        // elle est maintenant générée directement avec la bonne section active
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
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.9rem; color: #666;">Heures présentes</span>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${details.heuresPresentes}h</strong>
                </div>
            </div>
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.9rem; color: #666;">Heures offertes</span>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${details.heuresOffertes}h</strong>
                </div>
            </div>
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.9rem; color: #666;">Taux d'assiduité</span>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${taux}%</strong>
                </div>
            </div>
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.9rem; color: #666;">Séances</span>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${details.nombreSeances}</strong>
                </div>
            </div>
        </div>
        
        <!-- LISTE DES ABSENCES -->
        ${details.absences.length > 0 ? `
            <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem;">
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
            <div style="text-align: center; padding: 20px; background: #d4edda; border-radius: 6px; color: #155724;">
                <div style="font-size: 2rem;">✅</div>
                <div style="font-weight: 500;">Assiduité parfaite !</div>
            </div>
        `}
    `;
}



/**
 * Génère le HTML de la section performance
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionPerformance(da) {
    const meilleures = obtenirDetailsPerformance(da);

    if (meilleures.length === 0) {
        return `
            <div style="padding: 20px; background: var(--bleu-tres-pale); border-radius: 6px; text-align: center;">
                <p style="color: #666;">Aucune évaluation disponible pour le moment</p>
            </div>
        `;
    }

    const moyenne = meilleures.reduce((sum, m) => sum + m.note, 0) / meilleures.length;

    return `
        <div style="padding: 15px; background: var(--bleu-tres-pale); border-radius: 6px;">
            <div style="background: white; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">
                    Moyenne PAN (${meilleures.length} meilleur${meilleures.length > 1 ? 's' : ''} artefact${meilleures.length > 1 ? 's' : ''})
                </div>
                <div style="font-size: 3rem; font-weight: bold; color: ${obtenirCouleurIndice(moyenne)};">
                    ${moyenne.toFixed(1)}/100
                </div>
            </div>
            
            <h4 style="color: var(--bleu-principal); margin-bottom: 15px;">
                🏆 Les ${meilleures.length} meilleur${meilleures.length > 1 ? 's' : ''} artefact${meilleures.length > 1 ? 's' : ''}
            </h4>
            
            ${meilleures.map((art, index) => `
                <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid ${obtenirCouleurIndice(art.note)};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">
                                #${index + 1} · ${echapperHtml(art.description)}
                            </div>
                            <div style="font-size: 0.85rem; color: #666;">
                                Évalué le ${formaterDate(art.dateEvaluation)}
                            </div>
                        </div>
                        <div style="text-align: right;">
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
                <strong>Principe PAN :</strong> La note finale est calculée sur la moyenne des 3 meilleurs artefacts 
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
                <h3 style="color: var(--bleu-principal); margin-bottom: 15px; padding-right: 40px;">
                    Assiduité détaillée
                </h3>
                ${genererSectionAssiduite(da)}
            `;
            break;
        case 'C':
            html = `
                <h3 style="color: var(--bleu-principal); margin-bottom: 15px; padding-right: 40px;">
                    ✅ Complétion détaillée
                </h3>
                ${genererSectionCompletion(da)}
            `;
            break;
        case 'P':
            html = `
                <h3 style="color: var(--bleu-principal); margin-bottom: 15px; padding-right: 40px;">
                    📝 Développement des habiletés et compétences
                </h3>
                ${genererSectionPerformance(da)}
            `;
            break;
        case 'M':
            html = `
                <h3 style="color: var(--bleu-principal); margin-bottom: 15px; padding-right: 40px;">
                    🎯 Mobilisation détaillée
                </h3>
                ${genererSectionMobilisation(da)}
            `;
            break;
        case 'E':
            html = `
                <h3 style="color: var(--bleu-principal); margin-bottom: 15px; padding-right: 40px;">
                    ⚡ Engagement détaillé
                </h3>
                ${genererSectionEngagement(da)}
            `;
            break;
        case 'R':
            html = `
                <h3 style="color: var(--bleu-principal); margin-bottom: 15px; padding-right: 40px;">
                    ⚠️ Risque d'échec détaillé
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
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
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
        <div style="border: 1px solid #dee2e6; background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">

            <h3 style="color: var(--bleu-principal); margin: 0 0 20px 0; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.5px;">
                📝 COMPLÉTION
            </h3>

            <!-- Badge avec interprétation -->
            <div style="margin-bottom: 15px;">
                <span style="font-size: 1.5rem;">${interpC.emoji}</span>
                <strong style="font-size: 1.1rem; color: ${interpC.couleur};">${interpC.niveau}</strong>
                <span style="font-size: 1.3rem; font-weight: bold; color: ${interpC.couleur}; margin-left: 10px;">(${indices.C}%)</span>
            </div>

            <!-- Statistiques -->
            <ul style="list-style: none; padding: 0; margin: 0 0 20px 0; line-height: 2;">
                <li><strong>• Artefacts remis :</strong> ${nbRemis}/${nbTotal}</li>
                <li><strong>• Indice C :</strong> ${indices.C}%</li>
            </ul>

            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

            <!-- Gestion des jetons (placeholder) -->
            <h4 style="color: var(--bleu-principal); margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 600;">
                GESTION DES JETONS
            </h4>
            <div style="background: #fff3cd; border: 2px dashed #ffc107; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 1.2rem; color: #856404; margin-bottom: 10px;">
                    <strong>Jetons disponibles :</strong> 2 / 2
                </div>
                <div style="font-size: 0.9rem; color: #666; font-style: italic;">
                    Système de jetons (reprise/délai) à implémenter
                </div>
            </div>

            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

            <!-- Artefacts remis -->
            <h4 style="color: var(--bleu-principal); margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 600;">
                ✅ ARTEFACTS REMIS (${artefactsRemis.length})
            </h4>
            ${artefactsRemis.length > 0 ? `
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                    ${artefactsRemis.map(art => `
                        <div style="flex: 0 0 auto; min-width: 200px; max-width: 250px; padding: 12px;
                                    background: #d4edda; border-left: 3px solid #28a745; border-radius: 4px;">
                            <div style="color: #155724; font-weight: 500; margin-bottom: 5px;">
                                ✅ ${echapperHtml(art.description)}
                                ${art.jetonReprise ? '<span style="color: #9c27b0; margin-left: 6px;" title="Jeton de reprise appliqué">⭐</span>' : ''}
                                ${art.jetonDelai ? '<span style="color: #ff6f00; margin-left: 6px;" title="Jeton de délai appliqué">⭐</span>' : ''}
                            </div>
                            <div style="font-size: 0.9rem; color: #666;">
                                <strong>${art.note}</strong>${art.niveau ? ` · ${art.niveau}` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 6px; color: #666; margin-bottom: 20px;">
                    Aucun artefact remis
                </div>
            `}

            <!-- Artefacts non remis -->
            <h4 style="color: var(--bleu-principal); margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 600;">
                ⏳ ARTEFACTS NON REMIS (${artefactsNonRemis.length})
            </h4>
            ${artefactsNonRemis.length > 0 ? `
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                    ${artefactsNonRemis.map(art => `
                        <div style="flex: 0 0 auto; min-width: 200px; max-width: 250px; padding: 12px;
                                    background: #f5f5f5; border-left: 3px solid #ddd; border-radius: 4px; opacity: 0.6;">
                            <div style="color: #666; font-weight: 500; margin-bottom: 5px;">
                                ⏳ ${echapperHtml(art.description)}
                            </div>
                            <div class="text-muted" style="font-size: 0.9rem;">Non remis</div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div style="text-align: center; padding: 15px; background: #d4edda; border-radius: 6px; color: #155724; margin-bottom: 20px;">
                    ✅ Tous les artefacts ont été remis !
                </div>
            `}

            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

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
    let niveaux = JSON.parse(localStorage.getItem('niveauxEchelle') || '[]');

    // Si on a des niveaux IDME actifs, les utiliser
    if (niveaux.length > 0 && niveaux.some(n => ['I', 'D', 'M', 'E'].includes(n.code))) {
        const table = {};
        niveaux.forEach(niveau => {
            const code = niveau.code.toUpperCase();
            if (['I', 'D', 'M', 'E'].includes(code)) {
                // valeurCalcul peut être string ou number, on convertit en 0-1
                const valeur = parseFloat(niveau.valeurCalcul || niveau.valeurPonctuelle || 0) / 100;
                table[code] = valeur;
            }
        });
        return table;
    }

    // PRIORITÉ 2 : Charger depuis echellesTemplates si niveauxEchelle est vide
    let echelles = JSON.parse(localStorage.getItem('echellesTemplates') || '[]');
    let echelle;

    if (echelleId) {
        echelle = echelles.find(e => e.id === echelleId);
    } else {
        // Chercher une échelle avec les codes I, D, M, E
        echelle = echelles.find(e =>
            e.niveaux &&
            e.niveaux.some(n => ['I', 'D', 'M', 'E'].includes(n.code))
        );
    }

    if (echelle && echelle.niveaux) {
        const table = {};
        echelle.niveaux.forEach(niveau => {
            const code = niveau.code.toUpperCase();
            if (['I', 'D', 'M', 'E'].includes(code)) {
                const valeur = parseFloat(niveau.valeurCalcul || niveau.valeurPonctuelle || 0) / 100;
                table[code] = valeur;
            }
        });
        return table;
    }

    // FALLBACK : Valeurs par défaut si aucune échelle trouvée
    return { I: 0.40, D: 0.65, M: 0.75, E: 1.00 };
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
function calculerMoyennesCriteres(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da && e.retroactionFinale);

    console.log('calculerMoyennesCriteres pour DA:', da);
    console.log('  Total évaluations dans système:', evaluations.length);
    console.log('  Évaluations pour cet élève avec rétroaction:', evaluationsEleve.length);

    if (evaluationsEleve.length === 0) {
        return null;
    }

    // Obtenir la table de conversion IDME depuis l'échelle configurée
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
    // Accepte les variantes avec/sans accents et casse mixte
    const regexCritere = /(STRUCTURE|RIGUEUR|PLAUSIBILIT[ÉE]|NUANCE|FRAN[ÇC]AIS\s+[ÉE]CRIT)\s*\(([IDME])\)/gi;

    evaluationsEleve.forEach(evaluation => {
        const retroaction = evaluation.retroactionFinale || '';

        // Extraire tous les critères avec leur niveau
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

    console.log('  Scores extraits:', scoresCriteres);

    // Calculer les moyennes
    const moyennes = {};
    let aucuneDonnee = true;

    Object.keys(scoresCriteres).forEach(critere => {
        const scores = scoresCriteres[critere];
        if (scores.length > 0) {
            moyennes[critere] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            aucuneDonnee = false;
        } else {
            moyennes[critere] = null;
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

    const criteres = [
        { nom: 'Structure', cle: 'structure', score: moyennes.structure },
        { nom: 'Rigueur', cle: 'rigueur', score: moyennes.rigueur },
        { nom: 'Plausibilité', cle: 'plausibilite', score: moyennes.plausibilite },
        { nom: 'Nuance', cle: 'nuance', score: moyennes.nuance },
        { nom: 'Français', cle: 'francais', score: moyennes.francais }
    ].filter(c => c.score !== null);

    const forces = criteres.filter(c => c.score >= seuil).sort((a, b) => b.score - a.score);
    const defis = criteres.filter(c => c.score < seuil).sort((a, b) => a.score - b.score);

    return {
        forces: forces,
        defis: defis,
        principaleForce: forces.length > 0 ? forces[0] : null,
        principalDefi: defis.length > 0 ? defis[0] : null
    };
}

/* ===============================
   🎯 SYSTÈME DE CIBLES D'INTERVENTION
   Calcul du Pattern actuel et détermination des cibles d'intervention
   basé sur les indices A-C-P et les critères SRPNF
   =============================== */

/**
 * Calcule les indices sur les 3 DERNIERS artefacts (chronologiquement)
 * Utilisé pour identifier le pattern actuel et les cibles d'intervention
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { performance, idmeMoyen, francaisMoyen, nbArtefacts }
 */
function calculerIndicesTroisDerniersArtefacts(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');

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

    // Prendre les 3 derniers (ou moins si pas assez d'artefacts)
    const troisDerniers = evaluationsEleve.slice(0, 3);

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

    console.log(`Indices 3 derniers artefacts pour DA ${da}:`, {
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
 * Compare la performance des 3 artefacts les plus récents (AM) vs les 3 suivants avec chevauchement (AL)
 *
 * Fenêtre glissante: Si artefacts = A, B, C, D (du plus récent au plus ancien)
 * - AM = moyenne(A, B, C)
 * - AL = moyenne(B, C, D)
 *
 * Formule: SI(AM > AL + 0.1; "↗"; SI(AM < AL - 0.1; "↘"; "→"))
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { direction: '↗'|'→'|'↘', interpretation, AM, AL, difference }
 */
function calculerProgressionEleve(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');

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

    // Pas assez de données pour calculer la progression (besoin de 4 artefacts minimum)
    if (evaluationsEleve.length < 4) {
        return {
            direction: null,
            interpretation: 'Données insuffisantes (4 artefacts requis)',
            AM: null,
            AL: null,
            difference: null,
            nbArtefacts: evaluationsEleve.length
        };
    }

    // Trier par date (plus récent d'abord)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // AM: Moyenne des 3 plus récents (positions 0, 1, 2)
    const troisRecents = evaluationsEleve.slice(0, 3);
    const AM = troisRecents.reduce((sum, e) => sum + e.noteFinale, 0) / troisRecents.length / 100;

    // AL: Moyenne des 3 suivants avec chevauchement (positions 1, 2, 3)
    const troisSuivants = evaluationsEleve.slice(1, 4);
    const AL = troisSuivants.reduce((sum, e) => sum + e.noteFinale, 0) / troisSuivants.length / 100;

    const difference = AM - AL;

    // Déterminer la direction selon le seuil configurable
    const seuilProgression = obtenirSeuil('progressionArtefacts');
    let direction, interpretation;
    if (difference > seuilProgression) {
        direction = '↗';
        interpretation = 'Progression';
    } else if (difference < -seuilProgression) {
        direction = '↘';
        interpretation = 'Régression';
    } else {
        direction = '—';
        interpretation = 'Plateau';
    }

    console.log(`Progression pour DA ${da}:`, {
        direction,
        interpretation,
        AM: (AM * 100).toFixed(1) + '%',
        AL: (AL * 100).toFixed(1) + '%',
        difference: (difference * 100).toFixed(1) + ' points'
    });

    return {
        direction,
        interpretation,
        AM: (AM * 100).toFixed(1),
        AL: (AL * 100).toFixed(1),
        difference: (difference * 100).toFixed(1),
        nbArtefacts: evaluationsEleve.length
    };
}

/**
 * Identifie le défi spécifique (critère SRPNF le plus faible) sur les 3 derniers artefacts
 * Seuil: Valeur configurable (défaut: 71.25%, ajustable via interpretation-config.js)
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { defi: 'Structure'|'Rigueur'|'Plausibilité'|'Nuance'|'Français'|'Aucun', score (0-1) }
 */
function identifierDefiSpecifique(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');

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

    // Prendre les 3 derniers
    const troisDerniers = evaluationsEleve.slice(0, 3);

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

    troisDerniers.forEach(evaluation => {
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
    if (performancePAN3 <= 0.4) {
        return 'Blocage critique';
    }
    if (performancePAN3 <= 0.5 && aUnDefi) {
        return 'Blocage émergent';
    }
    if (performancePAN3 <= 0.75 && aUnDefi) {
        return 'Défi spécifique';
    }
    return 'Stable';
}

/**
 * Détermine la cible d'intervention selon la formule pédagogique complète
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { cible, pattern, niveau, couleur, emoji }
 */
function determinerCibleIntervention(da) {
    // Récupérer tous les indices nécessaires
    const indices = calculerTousLesIndices(da);
    const moyennes = calculerMoyennesCriteres(da);
    const diagnostic = diagnostiquerForcesChallenges(moyennes, 0.7125);
    const indices3Derniers = calculerIndicesTroisDerniersArtefacts(da);
    const interpMobilisation = interpreterMobilisation(indices.A / 100, indices.C / 100);
    const interpRisque = interpreterRisque(indices.R);

    // Variables pour la formule (correspondance avec Excel)
    const E = interpMobilisation.niveau; // Mobilisation
    const F = interpRisque.niveau; // Risque sommatif (1-ACP)
    const G = interpRisque.niveau; // Risque PAN (simplifié pour l'instant)
    const I = indices3Derniers.francaisMoyen; // Moyenne français 3 derniers
    const M = identifierPatternActuel(indices3Derniers.performance, diagnostic.principalDefi !== null); // Pattern actuel
    const N = diagnostic.principalDefi ? diagnostic.principalDefi.nom : 'Aucun'; // Défi principal
    const performancePAN3 = indices3Derniers.performance;

    console.log('🎯 Détermination cible pour DA', da, {
        mobilisation: E,
        risque: F,
        pattern: M,
        defi: N,
        francais: I.toFixed(1) + '%',
        perfPAN3: (performancePAN3 * 100).toFixed(1) + '%'
    });

    // LOGIQUE DE DÉCISION (formule Excel traduite en JavaScript)

    // 1. Vérifier décrochage (priorité absolue)
    if (E === 'Décrochage' || F.includes('très élevé') || G.includes('très élevé')) {
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
    const moyennes = calculerMoyennesCriteres(da);

    console.log('🎯 Diagnostic critères pour DA:', da);
    console.log('  Moyennes calculées:', moyennes);

    if (!moyennes) {
        console.log('  ⚠️ Pas de moyennes disponibles - diagnostic non affiché');
        return ''; // Pas de données, pas de diagnostic
    }

    const diagnostic = diagnostiquerForcesChallenges(moyennes, 0.7125);
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
        <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem; margin-top: 20px;">
            🎯 Diagnostic par critère (seuil force: 0.7125)
        </h4>

        <!-- Tableau des scores par critère -->
        <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
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
                        <div style="text-align: center;">
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
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="color: ${interpBlocage.couleur}; margin: 0; font-size: 1rem;">
                            Indice de Blocage ${resultBlocage.partiel ? '(partiel)' : ''}
                        </h4>
                        <div style="font-size: 1.5rem; font-weight: bold; color: ${interpBlocage.couleur};">
                            ${pourcentageBlocage}%
                        </div>
                    </div>
                    ${resultBlocage.partiel ? `
                        <div style="background: #fff3cd; padding: 8px; border-radius: 4px; margin-bottom: 10px; border-left: 3px solid #ffc107;">
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
                        <div style="font-size: 0.85rem; color: #666;">
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

        <!-- Résumé forces -->
        ${diagnostic.forces.length > 0 ? `
            <div style="background: linear-gradient(to right, #28a74522, #28a74511);
                        border-left: 4px solid #28a745; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: #155724; margin-bottom: 6px;">
                    ✓ ${diagnostic.forces.length > 1 ? 'Forces identifiées' : 'Force identifiée'}
                    ${diagnostic.forces.length > 1 ? ` (${diagnostic.forces.length})` : ''}
                </div>
                <div style="color: #155724; font-size: 0.9rem;">
                    ${diagnostic.forces.map(f => `<strong>${f.nom}</strong> (${Math.round(f.score * 100)}%)`).join(', ')}
                </div>
            </div>
        ` : `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                <div style="font-weight: bold; color: #856404;">
                    ⚠️ Aucune force identifiée (aucun critère ≥ 71.25%)
                </div>
            </div>
        `}

        <!-- Résumé défis -->
        ${diagnostic.defis.length > 0 ? `
            <div style="background: #fff3cd; border-left: 4px solid #ff9800; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
                <div style="font-weight: bold; color: #856404; margin-bottom: 6px;">
                    🎯 ${diagnostic.defis.length > 1 ? 'Défis identifiés' : 'Défi identifié'}
                    ${diagnostic.defis.length > 1 ? ` (${diagnostic.defis.length})` : ''}
                </div>
                <div style="color: #856404; font-size: 0.9rem;">
                    ${diagnostic.defis.map(d => `<strong>${d.nom}</strong> (${Math.round(d.score * 100)}%)`).join(', ')}
                </div>
                <div style="margin-top: 8px; font-size: 0.85rem; color: #856404;">
                    💡 Cibler les efforts sur ${diagnostic.principalDefi ? `<strong>${diagnostic.principalDefi.nom}</strong>` : 'ces critères'}
                    pour maximiser l'impact des interventions.
                </div>
            </div>
        ` : ''}
    `;
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
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
    const portfolio = productions.find(p => p.type === 'portfolio');

    if (!portfolio) {
        return `
            <div class="text-muted" style="text-align: center; padding: 30px;">
                <p>Aucun portfolio configuré</p>
            </div>
        `;
    }

    // Récupérer TOUS les artefacts créés
    const tousLesArtefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');
    
    if (tousLesArtefactsPortfolio.length === 0) {
        return `
            <div class="text-muted" style="text-align: center; padding: 30px;">
                <p>📝 Aucun artefact de portfolio créé</p>
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
            localStorage.setItem('portfoliosEleves', JSON.stringify(selectionsPortfolios));

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
    const indices = calculerTousLesIndices(da);

    // 🎯 UTILISER LES DONNÉES DE LA SOURCE UNIQUE (portfolio.js)
    let artefactsRetenus = [];
    let notesRetenues = [];
    let noteTop3 = null;

    if (typeof obtenirIndicesCP === 'function') {
        const indicesCP = obtenirIndicesCP(da, indices.pratique);
        if (indicesCP && indicesCP.details) {
            const idsRetenus = indicesCP.details.artefactsRetenus || [];
            notesRetenues = indicesCP.details.notes || [];

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

    // Déterminer la lettre IDME selon le pourcentage P
    let lettreIDME = 'I';
    if (indices.P >= 85) {
        lettreIDME = 'E';
    } else if (indices.P >= 75) {
        lettreIDME = 'M';
    } else if (indices.P >= 65) {
        lettreIDME = 'D';
    }

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
        <div id="details-calculs-performance-${da}" class="carte-info-toggle" style="display: none;">
            <div class="details-calculs-section">
                <h5 class="details-calculs-titre">MÉTHODOLOGIE DE CALCUL</h5>
                <div class="details-calculs-bloc">
                    <div class="details-calculs-label">Pratique de notation active:</div>
                    <div class="details-calculs-valeur">
                        ${indices.pratique === 'PAN' ? 'PAN (Portfolio à nombre limité)' : 'SOM (Sommative provisoire)'}
                    </div>

                    <div class="details-calculs-label">Règle de sélection:</div>
                    <div class="details-calculs-valeur">
                        Les <strong>${portfolio.regles.nombreARetenir}</strong> meilleures productions sont retenues pour le calcul de l'indice P
                    </div>

                    <div class="details-calculs-label">Artefacts retenus pour le calcul:</div>
                    <div class="details-calculs-valeur">
                        ${artefactsRetenus.length > 0 ? artefactsRetenus.map((art, idx) =>
                            `${idx + 1}. ${art.description} → <strong>${art.note.toFixed(1)}/100</strong>`
                        ).join('<br>') : 'Aucun artefact évalué'}
                    </div>

                    <div class="details-calculs-label">Calcul de l'indice P:</div>
                    <div class="details-calculs-valeur">
                        ${artefactsRetenus.length > 0 ? `
                            Moyenne des ${artefactsRetenus.length} artefact${artefactsRetenus.length > 1 ? 's' : ''} retenu${artefactsRetenus.length > 1 ? 's' : ''}<br>
                            P = (${notesRetenues.map(n => n.toFixed(1)).join(' + ')}) / ${artefactsRetenus.length}<br>
                            P = <strong>${noteTop3}/100</strong> soit <strong>${indices.P}%</strong>
                        ` : 'Calcul impossible : aucune évaluation disponible'}
                    </div>

                    <div class="details-calculs-label">Calcul de la note de chaque artefact:</div>
                    <div class="details-calculs-valeur">
                        ${(() => {
                            const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
                            const grilleActive = grilles.find(g => g.active) || grilles[0];
                            if (grilleActive && grilleActive.criteres) {
                                const ponderations = grilleActive.criteres
                                    .map(c => `${c.nom}: ${c.ponderation || 0}%`)
                                    .join(', ');
                                return `Note = Pondération des critères configurés dans la grille «${grilleActive.nom}»<br>
                                        (${ponderations})`;
                            }
                            return 'Note = Pondération des critères déterminée dans les réglages';
                        })()}
                    </div>

                    ${selectionEleve.auto ? `
                        <div class="details-calculs-label">Note:</div>
                        <div class="details-calculs-valeur">
                            Sélection automatique basée sur les meilleures notes
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- ENCADRÉ UNIQUE: DÉVELOPPEMENT DES HABILETÉS ET COMPÉTENCES -->
        <div style="border: 1px solid #dee2e6; background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">

            <!-- En-tête avec indice P -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <div>
                    <h3 style="margin: 0 0 5px 0; color: var(--bleu-principal); font-size: 1.1rem;">Développement des habiletés et compétences</h3>
                    <strong style="font-size: 0.95rem; color: ${interpP.couleur};">${interpP.niveau}</strong>
                </div>
                <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${lettreIDME} (${indices.P})</strong>
            </div>

            <hr class="profil-separateur">

            <!-- Diagnostic SRPNF -->
            <div class="section-titre">
                Forces et défis parmi les critères
            </div>
            <div style="margin: 20px 0;">
                ${(() => {
                    // Récupérer les couleurs depuis l'échelle configurée (localStorage)
                    const echelles = JSON.parse(localStorage.getItem('echellesTemplates') || '[]');
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

                    // Générer le gradient CSS basé sur les niveaux
                    const gradientStops = niveaux.map((niveau, i) => {
                        return `${niveau.couleur} ${niveau.min}%, ${niveau.couleur} ${i < niveaux.length - 1 ? niveaux[i + 1].min : niveau.max}%`;
                    }).join(', ');

                    const gradientCSS = `linear-gradient(to right, ${gradientStops})`;

                    // Calculer les directions pour chaque critère
                    const directions = calculerDirectionsCriteres(da);

                    // Générer les barres pour chaque critère
                    const barresHTML = ['structure', 'rigueur', 'plausibilite', 'nuance', 'francais'].map(cle => {
                        const nomCritere = cle === 'structure' ? 'Structure' :
                                         cle === 'rigueur' ? 'Rigueur' :
                                         cle === 'plausibilite' ? 'Plausibilité' :
                                         cle === 'nuance' ? 'Nuance' : 'Français';
                        const score = moyennes[cle];

                        if (score === null) return '';

                        const pourcentage = Math.round(score * 100);

                        // Obtenir la direction pour ce critère
                        const direction = directions[cle];
                        const symboleDirection = direction && direction.symbole ? direction.symbole : '';

                        return `
                            <div class="critere-container">
                                <div class="critere-header">
                                    <span class="critere-nom" style="min-width: 120px;">${nomCritere}</span>
                                    <span class="critere-valeur" style="margin-left: auto; font-weight: 600;">
                                        ${pourcentage}%
                                    </span>
                                </div>
                                <div class="critere-barre-gradient" style="background: ${gradientCSS};">
                                    ${symboleDirection ? `<div style="position: absolute; left: ${Math.min(pourcentage, 100)}%; transform: translateX(-50%); top: -32px; font-size: 1.2rem; font-weight: bold; color: #333;" title="${direction.interpretation}">${symboleDirection}</div>` : ''}
                                    <div class="critere-indicateur" style="left: ${Math.min(pourcentage, 100)}%;">▼</div>
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
        <div style="border: 1px solid #dee2e6; background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">

            <h3 style="color: var(--bleu-principal); margin: 0 0 20px 0; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.5px;">
                👥 ASSIDUITÉ
            </h3>

            <!-- Badge avec interprétation -->
            <div style="margin-bottom: 15px;">
                <span style="font-size: 1.5rem;">${interpA.emoji}</span>
                <strong style="font-size: 1.1rem; color: ${interpA.couleur};">${interpA.niveau}</strong>
                <span style="font-size: 1.3rem; font-weight: bold; color: ${interpA.couleur}; margin-left: 10px;">(${taux}%)</span>
            </div>

            <!-- Statistiques -->
            <ul style="list-style: none; padding: 0; margin: 0 0 20px 0; line-height: 2;">
                <li><strong>• Heures présentes :</strong> ${details.heuresPresentes}h / ${details.heuresOffertes}h</li>
            </ul>

            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

            <!-- Liste des absences et retards -->
            <h4 style="color: var(--bleu-principal); margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 600;">
                ${details.absences.length} ABSENCE${details.absences.length > 1 ? 'S' : ''} OU RETARD${details.absences.length > 1 ? 'S' : ''}
            </h4>
            ${details.absences.length > 0 ? `
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
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
                <div style="text-align: center; padding: 20px; background: #d4edda; border-radius: 6px; color: #155724; margin-bottom: 20px;">
                    <div style="font-size: 2rem;">✅</div>
                    <div style="font-weight: 500;">Assiduité parfaite !</div>
                </div>
            `}

            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

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