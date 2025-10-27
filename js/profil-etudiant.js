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
   - 'listeGrilles' : Array des productions (dont artefacts)
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
    if (c >= 0.85) {
        return {
            niveau: 'Taux de complétion excellent',
            emoji: '🔵',
            couleur: '#2196F3', // Bleu
            description: 'Remise régulière et complète des travaux'
        };
    }
    if (c >= 0.80) {
        return {
            niveau: 'Bon taux de complétion',
            emoji: '🟢',
            couleur: '#28a745', // Vert
            description: 'Majorité des travaux remis'
        };
    }
    if (c >= 0.70) {
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
    if (a >= 0.85) {
        return {
            niveau: 'Assiduité exemplaire',
            emoji: '🔵',
            couleur: '#2196F3', // Bleu
            description: 'Présence constante et engagement soutenu'
        };
    }
    if (a >= 0.80) {
        return {
            niveau: 'Bonne assiduité',
            emoji: '🟢',
            couleur: '#28a745', // Vert
            description: 'Présence régulière avec absences rares et justifiées'
        };
    }
    if (a >= 0.70) {
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
    const productions = obtenirDonneesSelonMode('listeGrilles') || [];
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
            remis: !!evaluation,
            note: evaluation?.noteFinale || null,
            niveau: evaluation?.niveauFinal || null,
            jetonReprise: evaluation?.repriseDeId ? true : false,
            jetonDelai: evaluation?.jetonDelaiApplique ? true : false
        };
    }).sort((a, b) => {
        if (a.remis && !b.remis) return -1;
        if (!a.remis && b.remis) return 1;
        return a.titre.localeCompare(b.titre);
    });
    const nbTotal = artefacts.length;
    const nbRemis = artefacts.filter(a => a.remis).length;
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
        <!-- Badge interprétatif Mobilisation globale -->
        <div style="border: 1px solid #dee2e6; background: white; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <div style="margin-bottom: 15px;">
                <strong style="font-size: 1.1rem; color: ${interpM.couleur};">${interpM.niveau}</strong>
                <span style="font-size: 1.3rem; font-weight: bold; color: ${interpM.couleur}; margin-left: 10px;">(${indices.M})</span>
            </div>
            <div style="font-size: 0.95rem; color: #555; line-height: 1.6;">
                ${interpM.niveau === 'Décrochage' ?
                    "L'étudiant ne se présente plus au cours. Référer aux services d'aide." :
                  interpM.niveau.includes('critique') ?
                    "Situation critique nécessitant une intervention RàI niveau 3 immédiate." :
                  interpM.niveau.includes('fragile') ?
                    "Suivi renforcé recommandé pour prévenir la détérioration." :
                  interpM.niveau.includes('favorable') ?
                    "Assiduité et complétion satisfaisantes. Encourager la constance." :
                  interpM.niveau.includes('optimale') ?
                    "Mobilisation excellente. Modèle d'engagement." :
                    "Mobilisation en cours d'évaluation."}
            </div>
        </div>

        <!-- GRILLE 2 COLONNES : ASSIDUITÉ ET COMPLÉTION -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">

            <!-- FICHE ASSIDUITÉ -->
            <div style="border: 1px solid #dee2e6; background: white; border-radius: 8px; padding: 20px;">
                <!-- Badge avec interprétation -->
                <div style="margin-bottom: 15px;">
                    <strong style="font-size: 1.1rem; color: ${interpA.couleur};">${interpA.niveau}</strong>
                    <span style="font-size: 1.3rem; font-weight: bold; color: ${interpA.couleur}; margin-left: 10px;">(A = ${indices.A}%)</span>
                </div>

                <!-- Statistiques -->
                <ul style="list-style: none; padding: 0; margin: 0 0 20px 0; line-height: 2;">
                    <li><strong>• Heures présentes :</strong> ${detailsA.heuresPresentes}h / ${detailsA.heuresOffertes}h</li>
                    <li><strong>• Nombre de séances :</strong> ${detailsA.nombreSeances}</li>
                    <li><strong>• Indice A :</strong> ${indices.A}%</li>
                </ul>

                <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

                <!-- Liste des absences et retards -->
                <h4 style="color: var(--bleu-principal); margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 600;">
                    ABSENCES ET RETARDS
                </h4>
                ${detailsA.absences.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${detailsA.absences.map(abs => {
                            const date = new Date(abs.date + 'T12:00:00');
                            const options = { weekday: 'short', day: 'numeric', month: 'short' };
                            const dateFormatee = date.toLocaleDateString('fr-CA', options);
                            const estAbsenceComplete = abs.heuresPresence === 0;
                            const icone = estAbsenceComplete ? '🔴' : '🟡';
                            const bordure = estAbsenceComplete ? '#dc3545' : '#ffc107';

                            return `
                                <div style="flex: 0 0 auto; min-width: 140px; padding: 8px 10px;
                                            background: var(--bleu-tres-pale); border-left: 3px solid ${bordure};
                                            border-radius: 4px; cursor: pointer; font-size: 0.85rem;"
                                     onclick="naviguerVersPresenceAvecDate('${abs.date}')"
                                     onmouseover="this.style.background='#e0e8f0'"
                                     onmouseout="this.style.background='var(--bleu-tres-pale)'">
                                    <div style="color: var(--bleu-principal); font-weight: 500;">
                                        ${icone} ${dateFormatee}
                                    </div>
                                    <div style="font-size: 0.8rem; color: #666;">
                                        ${estAbsenceComplete
                                            ? `${abs.heuresManquees}h manquées`
                                            : `${abs.heuresPresence}h / ${abs.heuresPresence + abs.heuresManquees}h`
                                        }
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 15px; background: #d4edda; border-radius: 6px; color: #155724;">
                        <div style="font-size: 1.5rem;">✅</div>
                        <div style="font-weight: 500;">Assiduité parfaite !</div>
                    </div>
                `}
            </div>

            <!-- FICHE COMPLÉTION -->
            <div style="border: 1px solid #dee2e6; background: white; border-radius: 8px; padding: 20px;">
                <!-- Badge avec interprétation -->
                <div style="margin-bottom: 15px;">
                    <strong style="font-size: 1.1rem; color: ${interpC.couleur};">${interpC.niveau}</strong>
                    <span style="font-size: 1.3rem; font-weight: bold; color: ${interpC.couleur}; margin-left: 10px;">(C = ${indices.C}%)</span>
                </div>

                <!-- Statistiques -->
                <ul style="list-style: none; padding: 0; margin: 0 0 20px 0; line-height: 2;">
                    <li><strong>• Artefacts remis :</strong> ${nbRemis}/${nbTotal}</li>
                </ul>

                <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

                <!-- Gestion des jetons -->
                ${totalJetonsUtilises > 0 ? `
                    <h4 style="color: var(--bleu-principal); margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 600;">
                        🎫 JETONS UTILISÉS
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                        ${jetonsRepriseUtilises > 0 ? `
                            <div style="background: #f3e5f5; border-left: 4px solid #9c27b0; border-radius: 8px; padding: 12px;">
                                <div style="font-size: 1rem; color: #7b1fa2; font-weight: 600;">
                                    <span style="font-size: 1.2rem;">⭐</span> Jetons de reprise : ${jetonsRepriseUtilises}
                                </div>
                                <div style="font-size: 0.85rem; color: #666; margin-top: 8px;">
                                    ${artefactsAvecJetonReprise.map(nom => `
                                        <div style="padding: 4px 0;">• ${echapperHtml(nom)}</div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${jetonsDelaiUtilises > 0 ? `
                            <div style="background: #fff3e0; border-left: 4px solid #ff6f00; border-radius: 8px; padding: 12px;">
                                <div style="font-size: 1rem; color: #e65100; font-weight: 600;">
                                    <span style="font-size: 1.2rem;">⭐</span> Jetons de délai : ${jetonsDelaiUtilises}
                                </div>
                                <div style="font-size: 0.85rem; color: #666; margin-top: 8px;">
                                    ${artefactsAvecJetonDelai.map(nom => `
                                        <div style="padding: 4px 0;">• ${echapperHtml(nom)}</div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
                ` : ''}

                <!-- Artefacts remis -->
                <h4 style="color: var(--bleu-principal); margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 600;">
                    ✅ REMIS (${artefactsRemis.length})
                </h4>
                ${artefactsRemis.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;">
                        ${artefactsRemis.map(art => `
                            <div style="padding: 8px 10px; background: #d4edda; border-left: 3px solid #28a745;
                                        border-radius: 4px; font-size: 0.85rem;">
                                <div style="color: #155724; font-weight: 500;">
                                    ✅ ${echapperHtml(art.titre)}
                                    ${art.jetonReprise ? '<span style="color: #9c27b0; margin-left: 6px;" title="Jeton de reprise appliqué">⭐</span>' : ''}
                                    ${art.jetonDelai ? '<span style="color: #ff6f00; margin-left: 6px;" title="Jeton de délai appliqué">⭐</span>' : ''}
                                </div>
                                <div style="font-size: 0.8rem; color: #666;">
                                    <strong>${art.note}/100</strong>${art.niveau ? ` · ${art.niveau}` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 6px;
                                color: #666; margin-bottom: 15px; font-size: 0.85rem;">
                        Aucun artefact remis
                    </div>
                `}

                <!-- Artefacts non remis -->
                <h4 style="color: var(--bleu-principal); margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 600;">
                    NON REMIS (${artefactsNonRemis.length})
                </h4>
                ${artefactsNonRemis.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${artefactsNonRemis.map(art => `
                            <div style="padding: 8px 10px; background: #f5f5f5; border-left: 3px solid #ddd;
                                        border-radius: 4px; opacity: 0.7; font-size: 0.85rem;">
                                <div style="color: #666; font-weight: 500;">
                                    ⏳ ${echapperHtml(art.titre)}
                                </div>
                                <div style="font-size: 0.8rem; color: #999;">Non remis</div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 10px; background: #d4edda; border-radius: 6px;
                                color: #155724; font-size: 0.85rem;">
                        ✅ Tous les artefacts remis !
                    </div>
                `}
            </div>
        </div>

        <!-- Placeholder graphique unique (en bas des deux fiches) -->
        <div style="background: var(--bleu-tres-pale); border: 2px dashed var(--bleu-pale); border-radius: 8px;
                    padding: 30px 20px; text-align: center; color: var(--bleu-moyen); font-style: italic; margin-bottom: 20px;">
            📈 Évolution temporelle A-C (à venir)
        </div>

        <!-- TOGGLE CALCULS UNIQUE (EXTÉRIEUR) -->
        <div style="margin-top: 25px;">
            <button onclick="toggleDetailsTechniques('details-calculs-mobilisation-${da}')"
                    style="background: var(--bleu-pale); border: 1px solid var(--bleu-moyen);
                           color: var(--bleu-principal); padding: 8px 16px; border-radius: 6px;
                           cursor: pointer; font-size: 0.9rem; width: 100%; text-align: left;
                           display: flex; align-items: center; justify-content: space-between;">
                <span>🔽 Voir les calculs et formules</span>
                <span style="font-size: 0.8rem; opacity: 0.7;">▼</span>
            </button>

            <div id="details-calculs-mobilisation-${da}" class="details-techniques">
                <div style="background: white; padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 0.85rem;">
                    <h5 style="color: var(--bleu-principal); margin: 0 0 10px 0; font-size: 0.95rem;">📐 DÉTAILS DES CALCULS</h5>
                    <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8;">
                        <li><strong>Indice A (Assiduité) :</strong> ${indices.A}%</li>
                        <li style="color: #666; font-size: 0.9rem; margin-left: 20px;">
                            → ${detailsA.heuresPresentes}h présentes / ${detailsA.heuresOffertes}h offertes
                        </li>
                        <li style="margin-top: 10px;"><strong>Indice C (Complétion) :</strong> ${indices.C}%</li>
                        <li style="color: #666; font-size: 0.9rem; margin-left: 20px;">
                            → ${nbRemis} artefacts remis / ${nbTotal} artefacts totaux
                        </li>
                        <li style="margin-top: 10px;"><strong>Indice M (Mobilisation) :</strong> ${indices.M}</li>
                        <li style="color: #666; font-size: 0.9rem; margin-left: 20px;">
                            → M = (A + C) / 2 = (${indices.A} + ${indices.C}) / 2
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `;
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
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal); border-left: 4px solid ${interpM.couleur};">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.9rem; color: #666;">Mobilisation (M)</span>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${indices.M}</strong>
                </div>
            </div>
        </div>

        <!-- INTERPRÉTATION QUALITATIVE -->
        <div style="padding: 15px; background: linear-gradient(to right, ${interpM.couleur}22, ${interpM.couleur}11);
                    border-left: 4px solid ${interpM.couleur}; border-radius: 6px; margin-bottom: 15px;">
            <div style="font-size: 1.1rem; font-weight: bold; color: ${interpM.couleur}; margin-bottom: 8px;">
                ${interpM.emoji} ${interpM.niveau}
            </div>
            <div style="color: #666; line-height: 1.5;">
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

    if (indices.R >= 0.60) {
        niveauRaI = 3;
        descriptionRaI = 'Niveau 3 - Intervention intensive individuelle';
        urgence = '🚨 URGENCE MAXIMALE - Intervention immédiate requise';
        couleurUrgence = '#dc3545';
    } else if (indices.R >= 0.35) {
        niveauRaI = 2;
        descriptionRaI = 'Niveau 2 - Intervention ciblée en petit groupe';
        urgence = '⚠️ Intervention prioritaire dans les prochains jours';
        couleurUrgence = '#ff9800';
    } else if (indices.R >= 0.25) {
        niveauRaI = 2;
        descriptionRaI = 'Niveau 2 - Surveillance accrue';
        urgence = '⚡ Attention requise - Surveillance renforcée';
        couleurUrgence = '#ffc107';
    }

    // Calculer la "marge de sécurité" (distance avant zone rouge)
    const margeSécurité = Math.max(0, 0.60 - indices.R);
    const pourcentageSécurité = ((1 - indices.R) * 100).toFixed(0);

    return `
        <!-- ALERTE NIVEAU RISQUE -->
        <div style="background: ${interpR.couleur}22; border: 2px solid ${interpR.couleur};
                    padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 12px;">
                <div style="font-size: 3rem; margin-bottom: 8px;">${interpR.emoji}</div>
                <div style="font-size: 1.3rem; font-weight: bold; color: ${interpR.couleur}; margin-bottom: 8px;">
                    ${interpR.niveau}
                </div>
                <div style="font-size: 2rem; font-weight: bold; color: ${interpR.couleur};">
                    R = ${indices.R}
                </div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; margin-top: 12px;">
                <div style="font-weight: bold; color: ${couleurUrgence}; margin-bottom: 8px;">
                    ${urgence}
                </div>
                <div style="color: #666; font-size: 0.95rem;">
                    ${descriptionRaI}
                </div>
            </div>
        </div>

        <!-- RELATION R ↔ E -->
        <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem;">
            🔄 Relation Risque ↔ Engagement
        </h4>
        <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <div style="font-family: monospace; font-size: 1rem; text-align: center; color: var(--bleu-principal); margin-bottom: 10px;">
                R = 1 - E = 1 - ${indices.E} = ${indices.R}
            </div>
            <div style="background: #f0f7ff; padding: 12px; border-radius: 4px; font-size: 0.9rem; color: #555; line-height: 1.6;">
                Le risque d'échec est <strong>inversement proportionnel</strong> à l'engagement global.
                <br>Engagement actuel : <strong style="color: ${interpE.couleur};">${interpE.niveau}</strong>
            </div>
        </div>

        <!-- VISUALISATION ZONES DE RISQUE -->
        <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem;">
            Zones de risque (modèle RàI)
        </h4>
        <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <!-- Barre de progression du risque -->
            <div style="position: relative; height: 40px; background: linear-gradient(to right,
                        #2196F3 0%, #2196F3 15%,
                        #28a745 15%, #28a745 25%,
                        #ffc107 25%, #ffc107 35%,
                        #ff9800 35%, #ff9800 60%,
                        #dc3545 60%, #dc3545 100%);
                        border-radius: 6px; margin-bottom: 15px;">
                <!-- Marqueur position actuelle -->
                <div style="position: absolute; left: ${indices.R * 100}%; transform: translateX(-50%);
                            top: -5px; width: 3px; height: 50px; background: black;"></div>
                <div style="position: absolute; left: ${indices.R * 100}%; transform: translateX(-50%);
                            top: -25px; background: black; color: white; padding: 2px 8px;
                            border-radius: 4px; font-size: 0.85rem; font-weight: bold; white-space: nowrap;">
                    ${indices.R}
                </div>
            </div>

            <!-- Légende des zones -->
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; font-size: 0.75rem; text-align: center;">
                <div style="color: #2196F3;">
                    <strong>0-0.15</strong><br>Minimal
                </div>
                <div style="color: #28a745;">
                    <strong>0.15-0.25</strong><br>Faible
                </div>
                <div style="color: #ffc107;">
                    <strong>0.25-0.35</strong><br>Modéré
                </div>
                <div style="color: #ff9800;">
                    <strong>0.35-0.60</strong><br>Élevé
                </div>
                <div style="color: #dc3545;">
                    <strong>0.60+</strong><br>Très élevé
                </div>
            </div>
        </div>

        <!-- STATISTIQUES CLÉS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.9rem; color: #666;">Engagement (E)</span>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${indices.E}</strong>
                </div>
            </div>
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal); border-left: 4px solid ${interpR.couleur};">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.9rem; color: #666;">Risque (R)</span>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${indices.R}</strong>
                </div>
            </div>
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.9rem; color: #666;">RàI</span>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">Niveau ${niveauRaI}</strong>
                </div>
            </div>
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal); border-left: 4px solid ${margeSécurité > 0.25 ? '#28a745' : '#ff9800'};">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.9rem; color: #666;">Marge de sécurité</span>
                    <strong style="font-size: 1.8rem; color: var(--bleu-principal);">${pourcentageSécurité}%</strong>
                </div>
            </div>
        </div>

        <!-- PLAN D'ACTION -->
        ${indices.R >= 0.25 ? `
            <div style="background: ${indices.R >= 0.60 ? '#f8d7da' : indices.R >= 0.35 ? '#fff3cd' : '#e7f3ff'};
                        border-left: 4px solid ${indices.R >= 0.60 ? '#dc3545' : indices.R >= 0.35 ? '#ff9800' : '#2196F3'};
                        padding: 15px; border-radius: 6px; margin-top: 15px;">
                <h4 style="color: ${indices.R >= 0.60 ? '#721c24' : indices.R >= 0.35 ? '#856404' : '#1976d2'}; margin-bottom: 12px;">
                    🎯 Plan d'action immédiat
                </h4>
                <ol style="margin: 0; padding-left: 20px; color: ${indices.R >= 0.60 ? '#721c24' : indices.R >= 0.35 ? '#856404' : '#1976d2'};
                           line-height: 1.8; font-weight: 500;">
                    ${indices.R >= 0.60 ? `
                        <li><strong>JOUR 1 :</strong> Rencontre individuelle urgente avec l'étudiant et conseiller pédagogique</li>
                        <li><strong>JOUR 2-3 :</strong> Établir un plan d'intervention personnalisé (PIP) avec objectifs mesurables</li>
                        <li><strong>SEMAINE 1 :</strong> Suivi quotidien de la présence et remise des travaux en retard</li>
                        <li><strong>Mobiliser :</strong> Parents, aide pédagogique individuelle (API), services étudiants</li>
                        <li><strong>Réévaluation :</strong> Rencontre de suivi hebdomadaire jusqu'à amélioration significative</li>
                    ` : indices.R >= 0.35 ? `
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
            <div style="background: linear-gradient(to right, #28a74522, #28a74511);
                        border-left: 4px solid #28a745; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <h4 style="color: #155724; margin-bottom: 10px;">✅ Maintien de l'engagement</h4>
                <ul style="margin: 0; padding-left: 20px; color: #155724; line-height: 1.6;">
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
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
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

    const niveauTexte = cibleInfo.niveau === 3 ? 'Niveau 3 - Intervention intensive' :
                       cibleInfo.niveau === 2 ? 'Niveau 2 - Intervention ciblée' :
                       'Niveau 1 - Suivi régulier';

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

    // Mettre à jour la navigation active avec style visuel
    document.querySelectorAll('.profil-nav-item').forEach(item => {
        item.classList.remove('actif');
        item.style.background = '';
        item.style.borderLeft = '';
        item.style.color = '';
        // Retirer le font-weight des titres
        const titre = item.querySelector('.profil-nav-item-titre');
        if (titre) titre.style.fontWeight = '';
    });

    // Trouver l'élément cliqué et le marquer comme actif
    const clickedItem = event.target.closest('.profil-nav-item');
    if (clickedItem) {
        clickedItem.classList.add('actif');
        clickedItem.style.background = 'var(--bleu-pale)';
        clickedItem.style.borderLeft = '4px solid var(--bleu-principal)';
        clickedItem.style.color = '#000';
        // Ajouter font-weight au titre
        const titre = clickedItem.querySelector('.profil-nav-item-titre');
        if (titre) titre.style.fontWeight = '600';
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
        default:
            titre = 'Section inconnue';
            contenu = '<p>Section non trouvée</p>';
    }

    contenuContainer.innerHTML = `
        <div class="profil-contenu-header">
            <div class="profil-contenu-titre">${titre}</div>
        </div>
        <div class="profil-contenu-body">
            ${contenu}
        </div>
    `;

    console.log(`📄 Section "${section}" chargée pour DA ${da}`);
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

    const niveauTexte = cibleInfo.niveau === 3 ? 'Réponse à l\'intervention : niveau 3 (intervention intensive)' :
                       cibleInfo.niveau === 2 ? 'Réponse à l\'intervention : niveau 2 (intervention ciblée)' :
                       'Réponse à l\'intervention : niveau 1 (suivi régulier)';

    const descriptionNiveau = cibleInfo.niveau === 3
        ? '⚠️ <strong>Action immédiate requise</strong> - Intervention intensive pour prévenir un échec. Mobiliser les ressources d\'aide (CAF, aide à l\'apprentissage).'
        : cibleInfo.niveau === 2
        ? '<strong>Intervention ciblée recommandée</strong> - Soutien spécifique pour consolider les apprentissages et prévenir l\'aggravation des difficultés.'
        : cibleInfo.cible.includes('Pratique autonome')
        ? '✨ <strong>Enrichissement</strong> - L\'étudiant maîtrise les bases. Encourager l\'exploration, la créativité et le développement de l\'autonomie.'
        : '✓ <strong>Maintien</strong> - Performance satisfaisante. Continuer le suivi régulier et encourager la constance.';

    // Calculer le blocage pour progression
    const moyennes = calculerMoyennesCriteres(da);
    const resultBlocage = calculerIndiceBlocage(moyennes);
    const interpBlocage = resultBlocage ? interpreterIndiceBlocage(resultBlocage.score) : null;

    // Couleurs badge selon niveau RàI
    let badgeStyle = '';
    if (cibleInfo.niveau === 3) {
        badgeStyle = 'background: #ffe5d0; border: 2px solid #fd7e14; color: #bd4f00;';
    } else if (cibleInfo.niveau === 2) {
        badgeStyle = 'background: #fff3cd; border: 2px solid #ffc107; color: #856404;';
    } else {
        badgeStyle = 'background: white; border: 2px solid #6c757d; color: #495057;';
    }

    return `
        <!-- ENCADRÉ UNIQUE: SUIVI DE L'APPRENTISSAGE -->
        <div style="border: 1px solid #dee2e6; background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">

            <!-- Badge RàI avec couleur selon niveau -->
            <div style="${badgeStyle} display: inline-block; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin-bottom: 15px;">
                ${niveauTexte}
            </div>

            <!-- Liste des informations -->
            <ul style="list-style: none; padding: 0; margin: 0 0 20px 0; line-height: 2;">
                <li><strong>• Risque :</strong> ${interpR.niveau} (${indices.R})</li>
                <li><strong>• Pattern :</strong> ${cibleInfo.pattern}</li>
                <li><strong>• Progression :</strong> ${interpBlocage ? `${interpBlocage.emoji} ${interpBlocage.niveau} (${Math.round(resultBlocage.score * 100)}%)` : 'Non évaluée'}</li>
                <li><strong>• Services :</strong> ${eleve.caf === 'Oui' ? '✓ CAF' : ''} ${eleve.sa === 'Oui' ? '✓ SA' : ''} ${eleve.caf !== 'Oui' && eleve.sa !== 'Oui' ? 'Aucun' : ''}</li>
            </ul>

            <!-- Séparateur -->
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

            <!-- ÉCHELLE VISUELLE DU RISQUE -->
            <div style="margin: 20px 0;">
                <h4 style="color: var(--bleu-principal); margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 600;">
                    POSITION SUR L'ÉCHELLE DE RISQUE
                </h4>

                <!-- Barre de risque avec gradient -->
                <div style="position: relative; height: 60px; border-radius: 8px; overflow: hidden; margin-bottom: 10px;">
                    <!-- Segments colorés -->
                    <div style="display: flex; height: 40px;">
                        <!-- Minimal (0-0.2) -->
                        <div style="flex: 20; background: #2196F3; display: flex; align-items: center; justify-content: center;
                                    font-size: 0.75rem; color: white; font-weight: 500; border-right: 1px solid white;">
                            Minimal
                        </div>
                        <!-- Faible (0.2-0.3) -->
                        <div style="flex: 10; background: #90EE90; display: flex; align-items: center; justify-content: center;
                                    font-size: 0.75rem; color: #155724; font-weight: 500; border-right: 1px solid white;">
                            Faible
                        </div>
                        <!-- Modéré (0.3-0.4) -->
                        <div style="flex: 10; background: #ffc107; display: flex; align-items: center; justify-content: center;
                                    font-size: 0.75rem; color: #856404; font-weight: 500; border-right: 1px solid white;">
                            Modéré
                        </div>
                        <!-- Élevé (0.4-0.5) -->
                        <div style="flex: 10; background: #fd7e14; display: flex; align-items: center; justify-content: center;
                                    font-size: 0.75rem; color: white; font-weight: 500; border-right: 1px solid white;">
                            Élevé
                        </div>
                        <!-- Très élevé (0.5-0.7) -->
                        <div style="flex: 20; background: #dc3545; display: flex; align-items: center; justify-content: center;
                                    font-size: 0.75rem; color: white; font-weight: 500; border-right: 1px solid white;">
                            Très élevé
                        </div>
                        <!-- Critique (0.7-1.0) -->
                        <div style="flex: 30; background: #721c24; display: flex; align-items: center; justify-content: center;
                                    font-size: 0.75rem; color: white; font-weight: 500;">
                            Critique
                        </div>
                    </div>

                    <!-- Label au-dessus de la flèche -->
                    <div style="position: absolute; top: -25px; left: ${Math.min(indices.R * 100, 100)}%;
                                transform: translateX(-50%); white-space: nowrap;
                                background: #fff; padding: 2px 8px; border-radius: 4px;
                                font-size: 0.85rem; font-weight: 600; color: ${interpR.couleur};
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        ${interpR.niveau}
                    </div>

                    <!-- Indicateur de position (ligne noire) -->
                    <div style="position: absolute; top: 0; left: ${Math.min(indices.R * 100, 100)}%;
                                width: 3px; height: 40px; background: #000; transform: translateX(-50%);
                                box-shadow: 0 0 8px rgba(0,0,0,0.5);">
                    </div>

                    <!-- Triangle pointeur en bas de la ligne -->
                    <div style="position: absolute; top: 40px; left: ${Math.min(indices.R * 100, 100)}%;
                                width: 0; height: 0; transform: translateX(-50%);
                                border-left: 8px solid transparent;
                                border-right: 8px solid transparent;
                                border-top: 12px solid #000;">
                    </div>
                </div>

                <!-- Valeur numérique -->
                <div style="text-align: center; font-size: 0.9rem; color: #666;">
                    <strong>R = ${indices.R}</strong>
                </div>
            </div>

            <!-- Séparateur -->
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

            <!-- Message d'intervention -->
            <div style="line-height: 1.6; color: #333;">
                ${descriptionNiveau}
            </div>

            <!-- Séparateur -->
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

            <!-- Placeholder graphique (en conclusion) -->
            <div style="background: var(--bleu-tres-pale); border: 2px dashed var(--bleu-pale); border-radius: 8px;
                        padding: 30px 20px; text-align: center; color: var(--bleu-moyen); font-style: italic;">
                📈 Évolution temporelle du risque (à venir)
            </div>
        </div>

        <!-- TOGGLE CALCULS (EXTÉRIEUR) -->
        <div style="margin-top: 25px;">
            <button onclick="toggleDetailsTechniques('details-calculs-risque-${da}')"
                    style="background: var(--bleu-pale); border: 1px solid var(--bleu-moyen);
                           color: var(--bleu-principal); padding: 8px 16px; border-radius: 6px;
                           cursor: pointer; font-size: 0.9rem; width: 100%; text-align: left;
                           display: flex; align-items: center; justify-content: space-between;">
                <span>🔽 Voir les calculs et formules</span>
                <span style="font-size: 0.8rem; opacity: 0.7;">▼</span>
            </button>

            <div id="details-calculs-risque-${da}" class="details-techniques">

                <!-- Calcul Risque -->
                <div style="margin-bottom: 20px;">
                    <h5 style="color: var(--bleu-principal); margin: 0 0 10px 0; font-size: 0.95rem;">
                        CALCUL DU RISQUE (R)
                    </h5>
                    <div style="background: white; padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 0.85rem;">
                        <div style="margin-bottom: 8px;"><strong>Formule:</strong></div>
                        <div style="color: #666; margin-bottom: 12px;">R = (1 - A) × 0.50 + (1 - C) × 0.25 + (1 - P) × 0.25</div>

                        <div style="margin-bottom: 8px;"><strong>Calcul détaillé:</strong></div>
                        <div style="color: #666;">
                            R = (1 - ${(indices.A / 100).toFixed(2)}) × 0.50 + (1 - ${(indices.C / 100).toFixed(2)}) × 0.25 + (1 - ${(indices.P / 100).toFixed(2)}) × 0.25<br>
                            R = ${((1 - indices.A / 100) * 0.50).toFixed(3)} + ${((1 - indices.C / 100) * 0.25).toFixed(3)} + ${((1 - indices.P / 100) * 0.25).toFixed(3)}<br>
                            R = <strong>${indices.R}</strong>
                        </div>
                    </div>
                </div>

                ${interpBlocage ? `
                    <!-- Calcul Blocage -->
                    <div>
                        <h5 style="color: var(--bleu-principal); margin: 0 0 10px 0; font-size: 0.95rem;">
                            🔒 CALCUL DU BLOCAGE
                        </h5>
                        <div style="background: white; padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 0.85rem;">
                            <div style="margin-bottom: 8px;"><strong>Formule${resultBlocage.partiel ? ' (ajustée)' : ''}:</strong></div>
                            <div style="color: #666; margin-bottom: 12px;">
                                ${resultBlocage.partiel
                                    ? `Blocage = (critères disponibles pondérés) / total pondération`
                                    : `Blocage = 0.35 × Structure + 0.35 × Français + 0.30 × Rigueur`
                                }
                            </div>

                            ${resultBlocage.partiel ? `
                                <div style="background: #fff3cd; padding: 8px; border-radius: 4px; margin-bottom: 10px; font-family: sans-serif;">
                                    <strong style="color: #856404;">⚠️ Calcul partiel:</strong> ${resultBlocage.criteresManquants.join(', ')} non évalué(s)
                                </div>
                            ` : ''}

                            <div style="margin-bottom: 8px;"><strong>Calcul détaillé:</strong></div>
                            <div style="color: #666;">
                                ${moyennes.structure !== null ? `0.35 × ${Math.round(moyennes.structure * 100)}%<br>` : ''}
                                ${moyennes.francais !== null ? `0.35 × ${Math.round(moyennes.francais * 100)}%<br>` : ''}
                                ${moyennes.rigueur !== null ? `0.30 × ${Math.round(moyennes.rigueur * 100)}%<br>` : ''}
                                Blocage = <strong>${Math.round(resultBlocage.score * 100)}%</strong>
                            </div>
                        </div>
                    </div>
                ` : ''}
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

    const tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiants = typeof filtrerEtudiantsParMode === 'function'
        ? filtrerEtudiantsParMode(tousEtudiants)
        : tousEtudiants.filter(e => e.groupe !== '9999');
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

    // Générer le HTML avec layout 2 colonnes
    container.innerHTML = `
        <!-- Boutons de navigation -->
        <div style="display: flex; gap: 10px; margin-bottom: 20px; align-items: center; justify-content: center;">
            <button class="btn btn-principal"
                    onclick="afficherProfilComplet('${etudiantPrecedent?.da}')"
                    ${!etudiantPrecedent ? 'disabled' : ''}
                    title="Étudiant·e précédent·e">
                ← Précédent·e
            </button>

            <button class="btn btn-principal" onclick="afficherSousSection('tableau-bord-apercu')">
                ← Retour à la liste
            </button>

            <button class="btn btn-principal"
                    onclick="afficherProfilComplet('${etudiantSuivant?.da}')"
                    ${!etudiantSuivant ? 'disabled' : ''}
                    title="Étudiant·e suivant·e">
                Suivant·e →
            </button>
        </div>

        <div class="profil-layout-2col">
            <!-- COLONNE GAUCHE (SIDEBAR) -->
            <div class="profil-sidebar">
                <!-- En-tête étudiant -->
                <div class="profil-sidebar-header">
                    <div class="profil-sidebar-nom">
                        ${echapperHtml(eleve.prenom)} ${echapperHtml(eleve.nom)}
                    </div>
                    <div class="profil-sidebar-meta">
                        <span><strong>DA:</strong> ${echapperHtml(eleve.da)}</span>
                        ${eleve.groupe ? `<span><strong>Groupe:</strong> ${echapperHtml(eleve.groupe)}</span>` : ''}
                        ${eleve.programme ? `<span><strong>Programme:</strong> ${echapperHtml(eleve.programme)}</span>` : ''}
                        ${eleve.sa === 'Oui' ? '<span style="color: var(--bleu-principal);">✓ SA</span>' : ''}
                        ${eleve.caf === 'Oui' ? '<span style="color: var(--bleu-principal);">✓ CAF</span>' : ''}
                    </div>
                </div>

                <!-- Navigation sections avec indices intégrés -->
                <div class="profil-sidebar-nav">
                    <div class="profil-sidebar-nav-titre">Observations</div>

                    <!-- 1. Suivi de l'apprentissage -->
                    <div class="profil-nav-item actif" onclick="changerSectionProfil('cible')"
                         style="background: var(--bleu-pale); border-left: 4px solid var(--bleu-principal); color: #000;">
                        <div class="profil-nav-item-ligne">
                            <div class="profil-nav-item-titre" style="font-weight: 600;">
                                Suivi de l'apprentissage
                            </div>
                        </div>
                        <div class="profil-nav-item-sous-ligne">
                            <span>R: ${indices.R}</span>
                            <span>·</span>
                            <span>${interpR.niveau}</span>
                        </div>
                    </div>

                    <!-- 2. Développement des habiletés -->
                    <div class="profil-nav-item" onclick="changerSectionProfil('performance')">
                        <div class="profil-nav-item-ligne">
                            <div class="profil-nav-item-titre">
                                Développement des habiletés
                            </div>
                            <div class="profil-nav-item-valeur" style="color: ${obtenirCouleurIndice(indices.P)};">
                                ${indices.P}%
                            </div>
                        </div>
                    </div>

                    <!-- 3. Mobilisation (A + C + M) -->
                    <div class="profil-nav-item" onclick="changerSectionProfil('mobilisation')">
                        <div class="profil-nav-item-ligne">
                            <div class="profil-nav-item-titre">
                                Mobilisation
                            </div>
                        </div>
                        <div class="profil-nav-item-sous-ligne">
                            <span>A: ${indices.A}%</span>
                            <span>·</span>
                            <span>C: ${indices.C}%</span>
                        </div>
                    </div>

                    <!-- 4. Rapport -->
                    <div class="profil-nav-item" onclick="changerSectionProfil('rapport')">
                        <div class="profil-nav-item-ligne">
                            <div class="profil-nav-item-titre">
                                Rapport
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- COLONNE DROITE (CONTENU) -->
            <div class="profil-contenu" id="profil-contenu-dynamique">
                <!-- Contenu dynamique chargé par changerSectionProfil() -->
                <div class="profil-contenu-header">
                    <div class="profil-contenu-titre">
                        Suivi de l'apprentissage
                        ${genererBadgePratiqueProfil(indices.pratique)}
                    </div>
                </div>
                <div class="profil-contenu-body">
                    ${genererContenuCibleIntervention(da)}
                </div>
            </div>
        </div>
    `;

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
                    const icone = estAbsenceComplete ? '🔴' : '🟡';
                    const bordure = estAbsenceComplete ? '#dc3545' : '#ffc107';
                    
                    return `
                        <div style="flex: 0 0 auto; min-width: 180px; padding: 10px 12px; 
                                    background: var(--bleu-tres-pale); border-left: 3px solid ${bordure}; 
                                    border-radius: 4px; cursor: pointer;"
                             onclick="naviguerVersPresenceAvecDate('${abs.date}')"
                             onmouseover="this.style.background='#e0e8f0'"
                             onmouseout="this.style.background='var(--bleu-tres-pale)'">
                            <div style="color: var(--bleu-principal); font-weight: 500; margin-bottom: 3px;">
                                ${icone} ${dateFormatee}
                            </div>
                            <div style="font-size: 0.9rem; color: #666;">
                                ${estAbsenceComplete 
                                    ? `${abs.heuresManquees}h manquées` 
                                    : `${abs.heuresPresence}h / ${abs.heuresPresence + abs.heuresManquees}h`
                                }
                            </div>
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
                                #${index + 1} · ${echapperHtml(art.titre)}
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
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
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
            remis: !!evaluation,
            note: evaluation?.noteFinale || null,
            niveau: evaluation?.niveauFinal || null,
            jetonReprise: evaluation?.repriseDeId ? true : false,
            jetonDelai: evaluation?.jetonDelaiApplique ? true : false
        };
    }).sort((a, b) => {
        if (a.remis && !b.remis) return -1;
        if (!a.remis && b.remis) return 1;
        return a.titre.localeCompare(b.titre);
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
                                ✅ ${echapperHtml(art.titre)}
                                ${art.jetonReprise ? '<span style="color: #9c27b0; margin-left: 6px;" title="Jeton de reprise appliqué">⭐</span>' : ''}
                                ${art.jetonDelai ? '<span style="color: #ff6f00; margin-left: 6px;" title="Jeton de délai appliqué">⭐</span>' : ''}
                            </div>
                            <div style="font-size: 0.9rem; color: #666;">
                                <strong>${art.note}/100</strong>${art.niveau ? ` · ${art.niveau}` : ''}
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
                                ⏳ ${echapperHtml(art.titre)}
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

        <!-- TOGGLE CALCULS (EXTÉRIEUR) -->
        <button class="btn-secondary" style="margin: 20px 0; padding: 8px 16px; border-radius: 6px;"
                onclick="this.nextElementSibling.classList.toggle('hidden')">
            🔍 Voir les calculs
        </button>
        <div class="hidden" style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: var(--bleu-principal); margin-bottom: 10px;">📐 Détails des calculs</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8;">
                <li><strong>Indice C :</strong> ${indices.C}% (calculé par portfolio.js avec système PAN)</li>
                <li><strong>Artefacts remis :</strong> ${nbRemis}</li>
                <li><strong>Artefacts totaux :</strong> ${nbTotal}</li>
                <li><strong>Artefacts non remis :</strong> ${artefactsNonRemis.length}</li>
            </ul>
        </div>
    `;
}

/**
 * Récupère la table de conversion IDME depuis l'échelle configurée
 * @param {string} echelleId - ID de l'échelle (optionnel, prend la première IDME si non spécifié)
 * @returns {Object} - { I: 0.40, D: 0.65, M: 0.75, E: 1.00 }
 */
function obtenirTableConversionIDME(echelleId = null) {
    const echelles = JSON.parse(localStorage.getItem('echelles') || '[]');

    // Trouver l'échelle IDME (soit par ID, soit la première trouvée)
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

    if (!echelle || !echelle.niveaux) {
        // Fallback: valeurs par défaut si échelle non trouvée
        console.warn('⚠️ Échelle IDME non trouvée, utilisation des valeurs par défaut');
        return { I: 0.40, D: 0.65, M: 0.75, E: 1.00 };
    }

    // Construire la table de conversion depuis les valeurs ponctuelles
    const table = {};
    echelle.niveaux.forEach(niveau => {
        const code = niveau.code.toUpperCase();
        if (['I', 'D', 'M', 'E'].includes(code)) {
            table[code] = (niveau.valeurPonctuelle || 0) / 100; // Convertir en 0-1
        }
    });

    console.log('Table conversion IDME:', table);
    return table;
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
 * @param {number} seuil - Seuil pour identifier une force (défaut: 0.7125)
 * @returns {Object} - { forces: [], defis: [], principaleForce: '', principalDefi: '' }
 */
function diagnostiquerForcesChallenges(moyennes, seuil = 0.7125) {
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
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');

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

    // 5. Stable (performance satisfaisante)
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
                            🔒 Indice de Blocage ${resultBlocage.partiel ? '(partiel)' : ''}
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
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
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
            remis: !!evaluation,
            note: evaluation?.noteFinale || null,
            niveau: evaluation?.niveauFinal || null,
            retenu: selectionEleve.artefactsRetenus.includes(art.id)
        };
    }).sort((a, b) => {
        if (a.remis && !b.remis) return -1;
        if (!a.remis && b.remis) return 1;
        return a.titre.localeCompare(b.titre);
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
    
    // Note basée sur les 3 meilleurs
    const artefactsRemisAvecNote = artefacts.filter(a => a.remis && a.note !== null);
    const top3 = artefactsRemisAvecNote.sort((a, b) => b.note - a.note).slice(0, 3);
    const noteTop3 = top3.length > 0 
        ? (top3.reduce((sum, a) => sum + a.note, 0) / top3.length).toFixed(1) 
        : null;
    const selectionComplete = nbRetenus === portfolio.regles.nombreARetenir;

    // Interprétation Performance uniquement (C va dans Mobilisation)
    const interpP = interpreterPerformance(indices.P);

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
        <!-- ENCADRÉ UNIQUE: DÉVELOPPEMENT DES HABILETÉS ET COMPÉTENCES -->
        <div style="border: 1px solid #dee2e6; background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">

            <!-- Badge performance avec interprétation -->
            <div style="margin-bottom: 15px;">
                <strong style="font-size: 1.1rem; color: ${interpP.couleur};">${interpP.niveau}</strong>
                <span style="font-size: 1.3rem; font-weight: bold; color: ${interpP.couleur}; margin-left: 10px;">(${indices.P}%)</span>
            </div>

            <!-- Statistiques -->
            <ul style="list-style: none; padding: 0; margin: 0 0 20px 0; line-height: 2;">
                <li><strong>• Note PAN :</strong> ${noteTop3 || '--'}${noteTop3 ? '/100' : ''}</li>
                <li><strong>• Note sommative :</strong> À implémenter</li>
                <li><strong>• Artefacts remis :</strong> ${nbRemis}/${nbTotal}</li>
            </ul>

            <!-- Séparateur -->
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

            <!-- Diagnostic SRPNF -->
            <h4 style="color: var(--bleu-principal); margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 600;">
                FORCES ET DÉFIS PARMI LES CRITÈRES
            </h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
                ${['structure', 'rigueur', 'plausibilite', 'nuance', 'francais'].map(cle => {
                    const nomCritere = cle === 'structure' ? 'STRUCTURE' :
                                     cle === 'rigueur' ? 'RIGUEUR' :
                                     cle === 'plausibilite' ? 'PLAUSIBILITÉ' :
                                     cle === 'nuance' ? 'NUANCE' : 'FRANÇAIS';
                    const score = moyennes[cle];

                    if (score === null) return '';

                    const pourcentage = Math.round(score * 100);
                    const couleur = obtenirCouleurBadge(score);

                    return `
                        <div style="display: inline-flex; align-items: center; gap: 6px;
                                    padding: 6px 12px; border-radius: 12px; font-weight: 600;
                                    font-size: 0.9rem; background: ${couleur}22; color: ${couleur};
                                    border: 2px solid ${couleur};">
                            ${nomCritere} ${pourcentage}%
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Séparateur -->
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

            <!-- TITRE ARTEFACTS -->
        <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem;">
            📝 Artefacts (${nbTotal})
            ${!selectionComplete ? `
                <span style="font-weight: normal; color: #666; font-size: 0.9rem;">
                    · Sélectionnez ${portfolio.regles.nombreARetenir} artefacts pour construire la note finale (${nbRetenus}/${portfolio.regles.nombreARetenir})
                </span>
            ` : `
                <span style="font-weight: normal; color: var(--risque-minimal); font-size: 0.9rem;">
                    · ${portfolio.regles.nombreARetenir} artefacts sélectionnés ✓
                </span>
            `}
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${artefacts.map(art => {
                const iconeStatut = !art.remis ? '⏳' : '📄';
                const fondCouleur = art.retenu
                    ? 'linear-gradient(to right, #d4edda, #e8f5e9)'
                    : (art.remis ? 'var(--bleu-tres-pale)' : '#f5f5f5');
                const bordure = art.retenu ? '#28a745' : (art.remis ? 'var(--bleu-moyen)' : '#ddd');
                const couleurTitre = art.retenu ? '#155724' : 'var(--bleu-principal)';
                const fondHover = art.retenu ? '#c3e6cb' : '#e0e8f0';

                return `
                    <div style="flex: 0 0 auto; min-width: 200px; max-width: 250px; padding: 12px;
                                background: ${fondCouleur};
                                border-left: ${art.retenu ? '4px' : '3px'} solid ${bordure};
                                border-radius: 4px;
                                ${!art.remis ? 'opacity: 0.6;' : ''}
                                ${art.retenu ? 'box-shadow: 0 2px 6px rgba(40, 167, 69, 0.2);' : ''}
                                transition: all 0.3s ease;"
                         onmouseover="this.style.background='${fondHover}'"
                         onmouseout="this.style.background='${fondCouleur}'">
                        <label style="display: flex; gap: 8px; cursor: ${art.remis ? 'pointer' : 'not-allowed'};">
                            <input type="checkbox"
                                   name="artefactRetenu"
                                   value="${art.id}"
                                   ${art.retenu ? 'checked' : ''}
                                   ${!art.remis ? 'disabled' : ''}
                                   onchange="toggleArtefactPortfolio('${da}', '${portfolio.id}', ${portfolio.regles.nombreARetenir})"
                                   style="margin-top: 2px; accent-color: #28a745;">
                            <div style="flex: 1;">
                                <div style="color: ${couleurTitre}; font-weight: 500; margin-bottom: 5px;">
                                    ${iconeStatut} ${echapperHtml(art.titre)}
                                </div>
                                ${art.remis ? `
                                    <div style="font-size: 1rem; color: var(--bleu-principal);">
                                        <strong style="font-size: 1.2rem;">${art.niveau || '--'}</strong>
                                        <span style="font-size: 0.85rem; color: #888; margin-left: 4px;">(${art.note}/100)</span>
                                    </div>
                                ` : `
                                    <div class="text-muted">Non remis</div>
                                `}
                            </div>
                        </label>
                    </div>
                `;
            }).join('')}
        </div>

        <!-- Séparateur avant conclusion -->
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

        <!-- Placeholder graphique (en conclusion) -->
        <div style="background: var(--bleu-tres-pale); border: 2px dashed var(--bleu-pale); border-radius: 8px;
                    padding: 30px 20px; text-align: center; color: var(--bleu-moyen); font-style: italic;">
            📈 Évolution temporelle de la performance (à venir)
        </div>

    </div>

    <!-- TOGGLE CALCULS (EXTÉRIEUR) -->
    <div style="margin-top: 25px;">
        <button onclick="toggleDetailsTechniques('details-calculs-performance-${da}')"
                style="background: var(--bleu-pale); border: 1px solid var(--bleu-moyen);
                       color: var(--bleu-principal); padding: 8px 16px; border-radius: 6px;
                       cursor: pointer; font-size: 0.9rem; width: 100%; text-align: left;
                       display: flex; align-items: center; justify-content: space-between;">
            <span>🔽 Voir les calculs et formules</span>
            <span style="font-size: 0.8rem; opacity: 0.7;">▼</span>
        </button>

        <div id="details-calculs-performance-${da}" class="details-techniques">
            <div style="background: white; padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 0.85rem;">
                <h5 style="color: var(--bleu-principal); margin: 0 0 10px 0; font-size: 0.95rem;">📐 DÉTAILS DES CALCULS</h5>
        <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8;">
            <li><strong>Indice P :</strong> ${indices.P}%</li>
            <li><strong>Note PAN (top 3) :</strong> ${noteTop3 || '--'}/100</li>
            <li><strong>Artefacts retenus :</strong> ${nbRetenus}/${portfolio.regles.nombreARetenir}</li>
            <li><strong>Artefacts remis :</strong> ${nbRemis}/${nbTotal}</li>
            ${Object.entries(moyennes).map(([cle, val]) => {
                const nom = cle === 'structure' ? 'Structure' :
                           cle === 'rigueur' ? 'Rigueur' :
                           cle === 'plausibilite' ? 'Plausibilité' :
                           cle === 'nuance' ? 'Nuance' : 'Français';
                return val !== null ? `<li><strong>${nom} :</strong> ${Math.round(val * 100)}%</li>` : '';
            }).join('')}
        </ul>
            </div>
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
                <li><strong>• Nombre de séances :</strong> ${details.nombreSeances}</li>
                <li><strong>• Indice A :</strong> ${indices.A}%</li>
            </ul>

            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

            <!-- Liste des absences et retards -->
            <h4 style="color: var(--bleu-principal); margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 600;">
                ABSENCES ET RETARDS
            </h4>
            ${details.absences.length > 0 ? `
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                    ${details.absences.map(abs => {
                        const date = new Date(abs.date + 'T12:00:00');
                        const options = { weekday: 'short', day: 'numeric', month: 'short' };
                        const dateFormatee = date.toLocaleDateString('fr-CA', options);
                        const estAbsenceComplete = abs.heuresPresence === 0;
                        const icone = estAbsenceComplete ? '🔴' : '🟡';
                        const bordure = estAbsenceComplete ? '#dc3545' : '#ffc107';

                        return `
                            <div style="flex: 0 0 auto; min-width: 180px; padding: 10px 12px;
                                        background: var(--bleu-tres-pale); border-left: 3px solid ${bordure};
                                        border-radius: 4px; cursor: pointer;"
                                 onclick="naviguerVersPresenceAvecDate('${abs.date}')"
                                 onmouseover="this.style.background='#e0e8f0'"
                                 onmouseout="this.style.background='var(--bleu-tres-pale)'">
                                <div style="color: var(--bleu-principal); font-weight: 500; margin-bottom: 3px;">
                                    ${icone} ${dateFormatee}
                                </div>
                                <div style="font-size: 0.9rem; color: #666;">
                                    ${estAbsenceComplete
                                        ? `${abs.heuresManquees}h manquées`
                                        : `${abs.heuresPresence}h / ${abs.heuresPresence + abs.heuresManquees}h`
                                    }
                                </div>
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

        <!-- TOGGLE CALCULS (EXTÉRIEUR) -->
        <button class="btn-secondary" style="margin: 20px 0; padding: 8px 16px; border-radius: 6px;"
                onclick="this.nextElementSibling.classList.toggle('hidden')">
            🔍 Voir les calculs
        </button>
        <div class="hidden" style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: var(--bleu-principal); margin-bottom: 10px;">📐 Détails des calculs</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8;">
                <li><strong>Indice A :</strong> ${indices.A}%</li>
                <li><strong>Taux présence :</strong> ${taux}%</li>
                <li><strong>Heures présentes :</strong> ${details.heuresPresentes}h</li>
                <li><strong>Heures offertes :</strong> ${details.heuresOffertes}h</li>
                <li><strong>Absences totales :</strong> ${details.absences.length}</li>
            </ul>
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

/* ===============================
   📌 EXPORTS (accessibles globalement)
   =============================== */

// Les fonctions sont automatiquement disponibles globalement
// car non encapsulées dans un module ES6