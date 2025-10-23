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
   📋 DÉPENDANCES DE CE MODULE
   
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

/**
 * Calcule tous les indices pour un étudiant
 * @param {string} da - Numéro de DA
 * @returns {Object} - Objet avec tous les indices
 */
function calculerTousLesIndices(da) {
    // INDICE A : Assiduité
    const A = calculerAssiduitéGlobale(da) / 100; // Convertir en proportion 0-1

    // INDICE C : Complétion
    const C = calculerTauxCompletion(da) / 100; // Convertir en proportion 0-1

    // INDICE P : Performance (3 meilleurs artefacts - PAN)
    const P = calculerPerformancePAN(da);

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
        R: parseFloat(R.toFixed(3))
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
    if (valeur < 0.15) {
        return {
            niveau: 'Risque minimal',
            emoji: '🔵',
            couleur: '#2196F3' // Bleu
        };
    }
    if (valeur < 0.25) {
        return {
            niveau: 'Risque faible',
            emoji: '🟢',
            couleur: '#28a745' // Vert
        };
    }
    if (valeur < 0.35) {
        return {
            niveau: 'Risque modéré',
            emoji: '🟡',
            couleur: '#ffc107' // Jaune
        };
    }
    if (valeur <= 0.60) {
        return {
            niveau: 'Risque élevé',
            emoji: '🟠',
            couleur: '#ff9800' // Orange
        };
    }
    return {
        niveau: 'Risque très élevé',
        emoji: '🔴',
        couleur: '#dc3545' // Rouge
    };
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
        <div class="grille-statistiques mb-2">
            <div class="carte-metrique">
                <strong>${indices.A}%</strong>
                <span>Assiduité (A)</span>
            </div>
            <div class="carte-metrique">
                <strong>${indices.C}%</strong>
                <span>Complétion (C)</span>
            </div>
            <div class="carte-metrique" style="border-left: 3px solid ${interpM.couleur};">
                <strong>${indices.M}</strong>
                <span>Mobilisation (M)</span>
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
            📊 Décomposition de l'indice M
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
        <div class="grille-statistiques mb-2">
            <div class="carte-metrique">
                <strong>${indices.A}%</strong>
                <span>Assiduité (A)</span>
            </div>
            <div class="carte-metrique">
                <strong>${indices.C}%</strong>
                <span>Complétion (C)</span>
            </div>
            <div class="carte-metrique">
                <strong>${indices.P}%</strong>
                <span>Performance (P)</span>
            </div>
            <div class="carte-metrique" style="border-left: 3px solid ${interpE.couleur};">
                <strong>${indices.E}</strong>
                <span>Engagement (E)</span>
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
            📊 Décomposition de l'indice E (effet multiplicatif)
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
            📊 Zones de risque (modèle RàI)
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
        <div class="grille-statistiques mb-2">
            <div class="carte-metrique">
                <strong>${indices.E}</strong>
                <span>Engagement (E)</span>
            </div>
            <div class="carte-metrique" style="border-left: 3px solid ${interpR.couleur};">
                <strong>${indices.R}</strong>
                <span>Risque (R)</span>
            </div>
            <div class="carte-metrique">
                <strong>Niveau ${niveauRaI}</strong>
                <span>RàI</span>
            </div>
            <div class="carte-metrique" style="border-left: 3px solid ${margeSécurité > 0.25 ? '#28a745' : '#ff9800'};">
                <strong>${pourcentageSécurité}%</strong>
                <span>Marge de sécurité</span>
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
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da && e.noteFinale);

    if (evaluationsEleve.length === 0) {
        return 0;
    }

    // 🆕 PRIORITÉ 1 : Utiliser les artefacts SÉLECTIONNÉS dans le portfolio
    const selectionsPortfolios = JSON.parse(localStorage.getItem('portfoliosEleves') || '{}');
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
                console.log(`📊 Indice P calculé depuis ${evaluationsRetenues.length} artefact(s) sélectionné(s): ${moyenne.toFixed(1)}%`);
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
    console.log(`📊 Indice P calculé depuis les ${meilleuresNotes.length} meilleure(s) note(s): ${moyenne.toFixed(1)}%`);
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
    const presences = JSON.parse(localStorage.getItem('presences') || '[]');

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
   📊 AFFICHAGE DU PROFIL COMPLET
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
/**
 * Version simplifiée de afficherProfilComplet - SANS LA LÉGENDE
 */
function afficherProfilComplet(da) {
    console.log('👤 Affichage du profil pour DA:', da);

    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
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

    // Calculer tous les indices
    const indices = calculerTousLesIndices(da);

    // Récupérer A et C en proportions 0-1 pour interprétation M
    const A = indices.A / 100;
    const C = indices.C / 100;

    // Calculer les interprétations pour M, E, R
    const interpM = interpreterMobilisation(A, C);
    const interpE = interpreterEngagement(indices.E);
    const interpR = interpreterRisque(indices.R);

    // Générer le HTML du profil avec dashboard simplifié
    container.innerHTML = `
        <!-- EN-TÊTE -->
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid var(--bleu-pale);">
            <h2 style="color: var(--bleu-principal); margin-bottom: 10px;">
                ${echapperHtml(eleve.prenom)} ${echapperHtml(eleve.nom)}
            </h2>
            <div style="display: flex; gap: 20px; flex-wrap: wrap; color: #666; font-size: 0.95rem;">
                <span><strong>DA:</strong> ${echapperHtml(eleve.da)}</span>
                <span><strong>Groupe:</strong> ${echapperHtml(eleve.groupe || 'Non défini')}</span>
                <span><strong>Programme:</strong> ${echapperHtml(eleve.programme || 'Non défini')}</span>
                ${eleve.sa === 'Oui' ? '<span style="color: var(--bleu-principal);">✓ SA</span>' : ''}
                ${eleve.caf === 'Oui' ? '<span style="color: var(--bleu-principal);">✓ CAF</span>' : ''}
            </div>
        </div>
        
        <!-- DASHBOARD DES INDICES - 6 COLONNES -->
        <div class="carte" style="background: var(--bleu-tres-pale); border: 2px solid var(--bleu-principal); padding: 15px;">
            <h3 style="margin-bottom: 15px;">📊 Indices de suivi</h3>

            <!-- GRILLE : 6 COLONNES (A-C-P-M-E-R) -->
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
                <!-- CARTE A (Assiduité) -->
                <div id="carte-indice-A" onclick="toggleDetailIndice('A', '${da}')"
                     style="background: white; padding: 12px 8px; border-radius: 6px; text-align: center;
                            border: 2px solid ${obtenirCouleurIndice(indices.A)}; cursor: pointer;
                            transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='';">
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                        Assiduité
                    </div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: ${obtenirCouleurIndice(indices.A)}; margin: 8px 0;">
                        ${indices.A}%
                    </div>
                    <div style="font-weight: bold; color: var(--bleu-principal); font-size: 0.85rem; margin-bottom: 8px;">
                        Indice A
                    </div>
                    <div style="font-size: 0.75rem; color: var(--bleu-moyen);">
                        Voir détails →
                    </div>
                </div>

                <!-- CARTE C (Complétion) -->
                <div id="carte-indice-C" onclick="toggleDetailIndice('C', '${da}')"
                     style="background: white; padding: 12px 8px; border-radius: 6px; text-align: center;
                            border: 2px solid ${obtenirCouleurIndice(indices.C)}; cursor: pointer;
                            transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='';">
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                        Complétion
                    </div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: ${obtenirCouleurIndice(indices.C)}; margin: 8px 0;">
                        ${indices.C}%
                    </div>
                    <div style="font-weight: bold; color: var(--bleu-principal); font-size: 0.85rem; margin-bottom: 8px;">
                        Indice C
                    </div>
                    <div style="font-size: 0.75rem; color: var(--bleu-moyen);">
                        Voir détails →
                    </div>
                </div>

                <!-- CARTE P (Performance) -->
                <div id="carte-indice-P" onclick="toggleDetailIndice('P', '${da}')"
                     style="background: white; padding: 12px 8px; border-radius: 6px; text-align: center;
                            border: 2px solid ${obtenirCouleurIndice(indices.P)}; cursor: pointer;
                            transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='';">
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                        Performance
                    </div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: ${obtenirCouleurIndice(indices.P)}; margin: 8px 0;">
                        ${indices.P}%
                    </div>
                    <div style="font-weight: bold; color: var(--bleu-principal); font-size: 0.85rem; margin-bottom: 8px;">
                        Indice P
                    </div>
                    <div style="font-size: 0.75rem; color: var(--bleu-moyen);">
                        Voir détails →
                    </div>
                </div>
                
                <!-- CARTE M (Mobilisation) -->
                <div id="carte-indice-M" onclick="toggleDetailIndice('M', '${da}')"
                     style="background: white; padding: 12px 8px; border-radius: 6px; text-align: center;
                            border: 2px solid ${interpM.couleur}; cursor: pointer;
                            transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='';">
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                        Mobilisation
                    </div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: ${interpM.couleur}; margin: 8px 0;">
                        ${indices.M}
                    </div>
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">
                        ${interpM.niveau}
                    </div>
                    <div style="font-weight: bold; color: var(--bleu-principal); font-size: 0.85rem; margin-bottom: 8px;">
                        Indice M
                    </div>
                    <div style="font-size: 0.75rem; color: var(--bleu-moyen);">
                        Voir détails →
                    </div>
                </div>
                
                <!-- CARTE E (Engagement) -->
                <div id="carte-indice-E" onclick="toggleDetailIndice('E', '${da}')"
                     style="background: white; padding: 12px 8px; border-radius: 6px; text-align: center;
                            border: 2px solid ${interpE.couleur}; cursor: pointer;
                            transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='';">
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                        Engagement
                    </div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: ${interpE.couleur}; margin: 8px 0;">
                        ${indices.E}
                    </div>
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">
                        ${interpE.niveau}
                    </div>
                    <div style="font-weight: bold; color: var(--bleu-principal); font-size: 0.85rem; margin-bottom: 8px;">
                        Indice E
                    </div>
                    <div style="font-size: 0.75rem; color: var(--bleu-moyen);">
                        Voir détails →
                    </div>
                </div>
                
                <!-- CARTE R (Risque) -->
                <div id="carte-indice-R" onclick="toggleDetailIndice('R', '${da}')"
                     style="background: white; padding: 12px 8px; border-radius: 6px; text-align: center;
                            border: 2px solid ${interpR.couleur}; cursor: pointer;
                            transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='';">
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                        Risque d'échec
                    </div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: ${interpR.couleur}; margin: 8px 0;">
                        ${indices.R}
                    </div>
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">
                        ${interpR.niveau}
                    </div>
                    <div style="font-weight: bold; color: var(--bleu-principal); font-size: 0.85rem; margin-bottom: 8px;">
                        Indice R
                    </div>
                    <div style="font-size: 0.75rem; color: var(--bleu-moyen);">
                        Voir détails →
                    </div>
                </div>
            </div>
            
            <!-- PANNEAU DE DÉTAILS -->
            <div id="panneau-details-indice" style="display: none; margin: 15px 0 0 0; padding: 15px; 
                 background: white; border-radius: 6px; border: 2px solid var(--bleu-principal); 
                 border-top-width: 4px; position: relative; animation: slideDown 0.3s ease;">
                <button onclick="fermerDetailIndice()" 
                        style="position: absolute; top: 10px; right: 10px; background: none; 
                               border: none; font-size: 1.5rem; cursor: pointer; color: #666; 
                               width: 30px; height: 30px; border-radius: 50%; 
                               transition: background 0.2s;"
                        onmouseover="this.style.background='#f0f0f0'"
                        onmouseout="this.style.background='none'">
                    ×
                </button>
                <div id="contenu-detail-indice">
                    <!-- Contenu dynamique -->
                </div>
            </div>
            
            <!-- 🆕 LÉGENDE SUPPRIMÉE -->
        </div>
    `;

    console.log('✅ Profil affiché pour:', eleve.prenom, eleve.nom);
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
        <div class="grille-statistiques mb-2">
            <div class="carte-metrique">
                <strong>${details.heuresPresentes}h</strong>
                <span>Présentes</span>
            </div>
            <div class="carte-metrique">
                <strong>${details.heuresOffertes}h</strong>
                <span>Offertes</span>
            </div>
            <div class="carte-metrique">
                <strong>${taux}%</strong>
                <span>Taux d'assiduité</span>
            </div>
            <div class="carte-metrique">
                <strong>${details.nombreSeances}</strong>
                <span>Séances</span>
            </div>
        </div>
        
        <!-- LISTE DES ABSENCES -->
        ${details.absences.length > 0 ? `
            <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem;">
                📅 Absences et retards
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
                <strong>ℹ️ Principe PAN :</strong> La note finale est calculée sur la moyenne des 3 meilleurs artefacts 
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
                    📅 Assiduité détaillée
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
                    📊 Performance détaillée
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
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
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

    if (artefactsDonnes.length === 0) {
        return `
            <div class="text-muted" style="text-align: center; padding: 30px;">
                <p>📝 Aucun artefact de portfolio évalué pour le moment</p>
            </div>
        `;
    }

    // Récupérer les évaluations de l'élève
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);

    // Construire la liste des artefacts avec leur statut
    const artefacts = artefactsDonnes.map(art => {
        const evaluation = evaluationsEleve.find(e => e.productionId === art.id);
        return {
            id: art.id,
            titre: art.titre,
            remis: !!evaluation,
            note: evaluation?.noteFinale || null,
            niveau: evaluation?.niveauFinal || null
        };
    }).sort((a, b) => {
        if (a.remis && !b.remis) return -1;
        if (!a.remis && b.remis) return 1;
        return a.titre.localeCompare(b.titre);
    });

    const nbTotal = artefacts.length;
    const nbRemis = artefacts.filter(a => a.remis).length;
    const tauxCompletion = Math.round((nbRemis / nbTotal) * 100);
    const indices = calculerTousLesIndices(da);

    return `
        <!-- STATISTIQUES -->
        <div class="grille-statistiques mb-2">
            <div class="carte-metrique">
                <strong>${nbRemis}/${nbTotal}</strong>
                <span>Artefacts remis</span>
            </div>
            <div class="carte-metrique">
                <strong>${tauxCompletion}%</strong>
                <span>Taux de complétion</span>
            </div>
            <div class="carte-metrique">
                <strong>${indices.C}%</strong>
                <span>Indice C</span>
            </div>
        </div>

        <!-- LISTE DES ARTEFACTS -->
        <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem;">
            📝 Artefacts du portfolio (${nbTotal})
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${artefacts.map(art => {
                const icone = art.remis ? '✅' : '⏳';
                const bordure = art.remis ? 'var(--risque-minimal)' : '#ddd';
                const fond = art.remis ? '#d4edda' : '#f5f5f5';

                return `
                    <div style="flex: 0 0 auto; min-width: 200px; max-width: 250px; padding: 12px;
                                background: ${fond};
                                border-left: 3px solid ${bordure}; border-radius: 4px;
                                ${!art.remis ? 'opacity: 0.6;' : ''}">
                        <div style="color: ${art.remis ? '#155724' : '#666'}; font-weight: 500; margin-bottom: 5px;">
                            ${icone} ${echapperHtml(art.titre)}
                        </div>
                        ${art.remis ? `
                            <div style="font-size: 0.9rem; color: #666;">
                                <strong>${art.note}/100</strong>${art.niveau ? ` · ${art.niveau}` : ''}
                            </div>
                        ` : `
                            <div class="text-muted" style="font-size: 0.9rem;">Non remis</div>
                        `}
                    </div>
                `;
            }).join('')}
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

    console.log('📊 Table conversion IDME:', table);
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
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da && e.retroactionFinale);

    console.log('📊 calculerMoyennesCriteres pour DA:', da);
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
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
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

    console.log(`📊 Indices 3 derniers artefacts pour DA ${da}:`, {
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

        <!-- CIBLE D'INTERVENTION (basée sur Pattern actuel) -->
        ${(() => {
            const cibleInfo = determinerCibleIntervention(da);
            const indices3Derniers = calculerIndicesTroisDerniersArtefacts(da);

            // Ne pas afficher si pas assez de données
            if (indices3Derniers.nbArtefacts === 0) {
                return '';
            }

            const niveauTexte = cibleInfo.niveau === 3 ? 'Niveau 3 - Intervention intensive' :
                               cibleInfo.niveau === 2 ? 'Niveau 2 - Intervention ciblée' :
                               'Niveau 1 - Suivi régulier';

            return `
                <div style="background: linear-gradient(to right, ${cibleInfo.couleur}22, ${cibleInfo.couleur}11);
                            border-left: 4px solid ${cibleInfo.couleur};
                            padding: 15px; border-radius: 6px; margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <div style="flex: 1;">
                            <h4 style="color: ${cibleInfo.couleur}; margin: 0 0 6px 0; font-size: 1rem;">
                                ${cibleInfo.emoji} Cible d'intervention recommandée
                            </h4>
                            <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">
                                <strong>Pattern actuel :</strong> ${cibleInfo.pattern} ·
                                <strong>Basé sur :</strong> ${indices3Derniers.nbArtefacts} dernier${indices3Derniers.nbArtefacts > 1 ? 's' : ''} artefact${indices3Derniers.nbArtefacts > 1 ? 's' : ''}
                            </div>
                        </div>
                        <div style="text-align: right; min-width: 150px;">
                            <div style="display: inline-block; padding: 6px 12px; background: ${cibleInfo.couleur};
                                        color: white; border-radius: 4px; font-size: 0.85rem; font-weight: bold;">
                                ${niveauTexte}
                            </div>
                        </div>
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 4px; margin-top: 10px;">
                        <div style="font-size: 1rem; font-weight: bold; color: ${cibleInfo.couleur}; margin-bottom: 8px;">
                            ${cibleInfo.cible}
                        </div>
                        <div style="font-size: 0.85rem; color: #666; line-height: 1.5;">
                            ${(() => {
                                // Description selon le niveau
                                if (cibleInfo.niveau === 3) {
                                    return '⚠️ <strong>Action immédiate requise</strong> - Intervention intensive pour prévenir un échec. Mobiliser les ressources d\'aide (CAF, aide à l\'apprentissage).';
                                } else if (cibleInfo.niveau === 2) {
                                    return '📋 <strong>Intervention ciblée recommandée</strong> - Soutien spécifique pour consolider les apprentissages et prévenir l\'aggravation des difficultés.';
                                } else if (cibleInfo.cible.includes('Pratique autonome')) {
                                    return '✨ <strong>Enrichissement</strong> - L\'étudiant maîtrise les bases. Encourager l\'exploration, la créativité et le développement de l\'autonomie.';
                                } else {
                                    return '✓ <strong>Maintien</strong> - Performance satisfaisante. Continuer le suivi régulier et encourager la constance.';
                                }
                            })()}
                        </div>
                    </div>
                </div>
            `;
        })()}
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
                <p>📋 Aucun portfolio configuré</p>
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
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
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
    const selectionsPortfolios = JSON.parse(localStorage.getItem('portfoliosEleves') || '{}');
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

    return `
        <!-- STATISTIQUES avec classes CSS natives -->
        <div class="grille-statistiques mb-2">
            <div class="carte-metrique">
                <strong>${nbRemis}/${nbTotal}</strong>
                <span>Artefacts remis</span>
            </div>
            <div class="carte-metrique">
                <strong>${indices.C}%</strong>
                <span>Complétion (C)</span>
            </div>
            <div class="carte-metrique">
                <strong>${indices.P}%</strong>
                <span>Performance (P)</span>
            </div>
            <div class="carte-metrique">
                <strong>${noteTop3 || '--'}${noteTop3 ? '/100' : ''}</strong>
                <span>Note (top 3)</span>
            </div>
        </div>

        ${genererDiagnosticCriteres(da)}

        <!-- TITRE AVEC INSTRUCTION INTÉGRÉE -->
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
                                    <div style="font-size: 0.9rem; color: #666;">
                                        <strong>${art.note}/100</strong>${art.niveau ? ` · ${art.niveau}` : ''}
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

    return `
        <!-- STATISTIQUES avec classes CSS natives -->
        <div class="grille-statistiques mb-2">
            <div class="carte-metrique">
                <strong>${details.heuresPresentes}h</strong>
                <span>Présentes</span>
            </div>
            <div class="carte-metrique">
                <strong>${details.heuresOffertes}h</strong>
                <span>Offertes</span>
            </div>
            <div class="carte-metrique">
                <strong>${taux}%</strong>
                <span>Taux d'assiduité</span>
            </div>
            <div class="carte-metrique">
                <strong>${details.nombreSeances}</strong>
                <span>Séances</span>
            </div>
        </div>
        
        <!-- LISTE DES ABSENCES -->
        ${details.absences.length > 0 ? `
            <h4 style="color: var(--bleu-principal); margin-bottom: 12px; font-size: 1rem;">
                📅 Absences et retards
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