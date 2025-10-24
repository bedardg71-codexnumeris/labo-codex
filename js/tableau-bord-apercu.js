/* ===============================
   📊 MODULE: TABLEAU DE BORD - APERÇU
   Calculs des indices A-C-P et affichage des métriques globales
   =============================== */

/**
 * MODULE: tableau-bord-apercu.js
 * 
 * RÔLE:
 * Calcule et affiche les statistiques pédagogiques du tableau de bord
 * - Métriques globales du groupe (indices A-C-P)
 * - Distribution des niveaux de risque
 * - Alertes prioritaires (étudiants à risque élevé)
 * 
 * FONDEMENTS THÉORIQUES:
 * Basé sur le Guide de monitorage - Section ROUGE (indices primaires)
 * - Assiduité (A) : proportion de présence
 * - Complétion (C) : proportion d'artefacts remis
 * - Performance (P) : performance moyenne (3 derniers artefacts)
 * - Risque : 1 - (A × C × P)
 * 
 * DÉPENDANCES:
 * - LocalStorage: groupeEtudiants, presences, evaluationsSauvegardees
 * - Modules: 09-2-saisie-presences.js (pour calculs assiduité)
 */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module du tableau de bord - aperçu
 * Appelée par main.js au chargement
 */
function initialiserModuleTableauBordApercu() {
    console.log('📊 Module Tableau de bord - Aperçu initialisé');
    
    // Charger les statistiques si la sous-section aperçu est active
    const apercu = document.getElementById('tableau-bord-apercu');
    if (apercu && apercu.classList.contains('active')) {
        chargerTableauBordApercu();
    }
}

/* ===============================
   📈 FONCTION PRINCIPALE
   =============================== */

function chargerTableauBordApercu() {
    console.log('📊 Chargement du tableau de bord - aperçu');
    
    try {
        const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
        
        const etudiantsActifs = etudiants.filter(e => 
            e.statut !== 'décrochage' && e.statut !== 'abandon'
        );
        
        // Ajouter les indices (structure : {sommatif: {...}, alternatif: {...}})
        const etudiantsAvecIndices = etudiantsActifs.map(etudiant => {
            const indices = calculerIndicesEtudiant(etudiant.da);
            return {
                ...etudiant,
                ...indices  // Ajoute sommatif et alternatif
            };
        });
        
        // Afficher tout (sans noms d'étudiants dans l'aperçu)
        afficherMetriquesGlobales(etudiantsAvecIndices);
        afficherAlertesPrioritairesCompteurs(etudiantsAvecIndices);
        afficherPatternsApprentissage(etudiantsAvecIndices);
        afficherNiveauxRaI(etudiantsAvecIndices);

        console.log('✅ Tableau de bord chargé (aperçu anonyme)');
        
    } catch (error) {
        console.error('❌ Erreur chargement tableau de bord:', error);
    }
}

/* ===============================
   🧮 CALCULS DES INDICES
   =============================== */

/**
 * Récupère les indices calculés pour un étudiant
 * Retourne TOUJOURS sommatif ET alternatif
 * C'est l'affichage qui décide quoi montrer
 * 
 * @param {string} da - DA de l'étudiant
 * @returns {Object} Indices complets
 */
function calculerIndicesEtudiant(da) {
    // Récupérer les indices A depuis saisie-presences.js
    const indicesA = JSON.parse(localStorage.getItem('indicesAssiduite') || '{}');

    // Récupérer les indices C et P depuis portfolio.js (Single Source of Truth)
    const indicesCP = JSON.parse(localStorage.getItem('indicesCP') || '{}');
    const indicesCPEtudiant = indicesCP[da]?.actuel || null;

    // Structure complète avec sommatif ET alternatif
    const indices = {
        sommatif: {
            assiduite: indicesA.sommatif?.[da] || 0,
            completion: indicesCPEtudiant ? indicesCPEtudiant.C / 100 : 0,
            performance: indicesCPEtudiant ? indicesCPEtudiant.P / 100 : 0
        },
        alternatif: {
            assiduite: indicesA.alternatif?.[da] || 0,
            completion: indicesCPEtudiant ? indicesCPEtudiant.C / 100 : 0,
            performance: indicesCPEtudiant ? indicesCPEtudiant.P / 100 : 0
        }
    };
    
    // Calculer les risques pour les deux
    indices.sommatif.risque = calculerRisque(
        indices.sommatif.assiduite,
        indices.sommatif.completion,
        indices.sommatif.performance
    );
    indices.sommatif.niveauRisque = determinerNiveauRisque(indices.sommatif.risque);
    
    indices.alternatif.risque = calculerRisque(
        indices.alternatif.assiduite,
        indices.alternatif.completion,
        indices.alternatif.performance
    );
    indices.alternatif.niveauRisque = determinerNiveauRisque(indices.alternatif.risque);
    
    return indices;
}

/**
 * Calcule le risque d'échec
 * Formule du Guide: 1 - (A × C × P)
 * 
 * @param {number} assiduite - Indice A
 * @param {number} completion - Indice C
 * @param {number} performance - Indice P
 * @returns {number} Risque entre 0 et 1
 */
function calculerRisque(assiduite, completion, performance) {
    // Si un des indices est 0, risque = 1 (critique)
    if (assiduite === 0 || completion === 0 || performance === 0) {
        return 1;
    }
    
    return 1 - (assiduite * completion * performance);
}

/**
 * Détermine le niveau de risque selon les seuils du Guide
 * 
 * Seuils:
 * - Critique: > 0.7
 * - Très élevé: 0.5 - 0.7
 * - Élevé: 0.4 - 0.5
 * - Modéré: 0.3 - 0.4
 * - Faible: 0.2 - 0.3
 * - Minimal: ≤ 0.2
 * 
 * @param {number} risque - Indice de risque
 * @returns {string} Niveau de risque
 */
function determinerNiveauRisque(risque) {
    if (risque > 0.7) return 'critique';
    if (risque > 0.5) return 'très élevé';
    if (risque > 0.4) return 'élevé';
    if (risque > 0.3) return 'modéré';
    if (risque > 0.2) return 'faible';
    return 'minimal';
}

/* ===============================
   📊 AFFICHAGE DES MÉTRIQUES
   =============================== */

/**
 * Affiche les métriques globales du groupe
 * Respecte les réglages d'affichage sommatif/alternatif
 * 
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherMetriquesGlobales(etudiants) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const afficherSommatif = config.affichageTableauBord?.afficherSommatif !== false; // true par défaut
    const afficherAlternatif = config.affichageTableauBord?.afficherAlternatif || false;
    
    const nbTotal = etudiants.length;
    
    // Affichage du nombre total (toujours affiché)
    setStatText('tb-total-etudiants', nbTotal);
    
    // AFFICHAGE CONDITIONNEL
    if (afficherSommatif && afficherAlternatif) {
        // CAS 1 : Afficher les DEUX (format : "85% / 90%")
        const assiduiteSommatif = nbTotal > 0
            ? etudiants.reduce((sum, e) => sum + e.sommatif.assiduite, 0) / nbTotal
            : 0;
        const assiduiteAlternatif = nbTotal > 0
            ? etudiants.reduce((sum, e) => sum + e.alternatif.assiduite, 0) / nbTotal
            : 0;
        
        setStatText('tb-assiduite-moyenne', 
            `${formatPourcentage(assiduiteSommatif)} / ${formatPourcentage(assiduiteAlternatif)}`);
        
        // Même chose pour completion et performance
        const completionSommatif = nbTotal > 0
            ? etudiants.reduce((sum, e) => sum + e.sommatif.completion, 0) / nbTotal
            : 0;
        const completionAlternatif = nbTotal > 0
            ? etudiants.reduce((sum, e) => sum + e.alternatif.completion, 0) / nbTotal
            : 0;
        
        setStatText('tb-completion-moyenne',
            `${formatPourcentage(completionSommatif)} / ${formatPourcentage(completionAlternatif)}`);
        
        const performanceSommatif = nbTotal > 0
            ? etudiants.reduce((sum, e) => sum + e.sommatif.performance, 0) / nbTotal
            : 0;
        const performanceAlternatif = nbTotal > 0
            ? etudiants.reduce((sum, e) => sum + e.alternatif.performance, 0) / nbTotal
            : 0;
        
        setStatText('tb-performance-moyenne',
            `${formatPourcentage(performanceSommatif)} / ${formatPourcentage(performanceAlternatif)}`);
        
        // Interventions : utiliser le risque sommatif par défaut
        const interventionsRequises = etudiants.filter(e => e.sommatif.risque >= 0.4).length;
        setStatText('tb-interventions-requises', interventionsRequises);
        
    } else if (afficherAlternatif) {
        // CAS 2 : Afficher SEULEMENT alternatif
        const assiduite = nbTotal > 0
            ? etudiants.reduce((sum, e) => sum + e.alternatif.assiduite, 0) / nbTotal
            : 0;
        const completion = nbTotal > 0
            ? etudiants.reduce((sum, e) => sum + e.alternatif.completion, 0) / nbTotal
            : 0;
        const performance = nbTotal > 0
            ? etudiants.reduce((sum, e) => sum + e.alternatif.performance, 0) / nbTotal
            : 0;
        
        setStatText('tb-assiduite-moyenne', formatPourcentage(assiduite));
        setStatText('tb-completion-moyenne', formatPourcentage(completion));
        setStatText('tb-performance-moyenne', formatPourcentage(performance));
        
        const interventionsRequises = etudiants.filter(e => e.alternatif.risque >= 0.4).length;
        setStatText('tb-interventions-requises', interventionsRequises);
        
    } else {
        // CAS 3 : Afficher SEULEMENT sommatif (par défaut)
        const assiduite = nbTotal > 0
            ? etudiants.reduce((sum, e) => sum + e.sommatif.assiduite, 0) / nbTotal
            : 0;
        const completion = nbTotal > 0
            ? etudiants.reduce((sum, e) => sum + e.sommatif.completion, 0) / nbTotal
            : 0;
        const performance = nbTotal > 0
            ? etudiants.reduce((sum, e) => sum + e.sommatif.performance, 0) / nbTotal
            : 0;
        
        setStatText('tb-assiduite-moyenne', formatPourcentage(assiduite));
        setStatText('tb-completion-moyenne', formatPourcentage(completion));
        setStatText('tb-performance-moyenne', formatPourcentage(performance));
        
        const interventionsRequises = etudiants.filter(e => e.sommatif.risque >= 0.4).length;
        setStatText('tb-interventions-requises', interventionsRequises);
    }
}

/**
 * Affiche les compteurs d'alertes prioritaires
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherAlertesPrioritairesCompteurs(etudiants) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const afficherSommatif = config.affichageTableauBord?.afficherSommatif !== false;

    // Compter par niveau de risque (utiliser sommatif ou alternatif selon config)
    let critique = 0, tresEleve = 0, eleve = 0;

    etudiants.forEach(e => {
        const risque = afficherSommatif ? e.sommatif.risque : e.alternatif.risque;
        const niveau = afficherSommatif ? e.sommatif.niveauRisque : e.alternatif.niveauRisque;

        if (niveau === 'critique') {
            critique++;
        } else if (niveau === 'très élevé') {
            tresEleve++;
        } else if (niveau === 'élevé') {
            eleve++;
        }
    });

    // Afficher les compteurs
    setStatText('tb-risque-critique', critique);
    setStatText('tb-risque-tres-eleve', tresEleve);
    setStatText('tb-risque-eleve', eleve);

    // Note: Pas de liste d'étudiants dans l'aperçu pour respecter la confidentialité
    // L'utilisateur doit aller dans "Liste complète" pour voir les détails
}

/**
 * Affiche la liste des étudiants à risque critique
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 * @param {boolean} afficherSommatif - Utiliser les indices sommatifs
 */
function afficherListeEtudiantsCritiques(etudiants, afficherSommatif) {
    const container = document.getElementById('tb-etudiants-critique');
    if (!container) return;

    const etudiantsCritiques = etudiants
        .filter(e => {
            const niveau = afficherSommatif ? e.sommatif.niveauRisque : e.alternatif.niveauRisque;
            return niveau === 'critique';
        })
        .sort((a, b) => {
            const risqueA = afficherSommatif ? a.sommatif.risque : a.alternatif.risque;
            const risqueB = afficherSommatif ? b.sommatif.risque : b.alternatif.risque;
            return risqueB - risqueA;
        });

    container.innerHTML = etudiantsCritiques.map(e => {
        const indices = afficherSommatif ? e.sommatif : e.alternatif;
        return `
            <div style="display: flex; justify-content: space-between; align-items: center;
                        padding: 12px; background: white; border-radius: 6px;
                        border-left: 4px solid var(--risque-critique);">
                <div>
                    <strong>${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}</strong>
                    <span style="color: #666; margin-left: 10px;">(${echapperHtml(e.groupe || '—')})</span>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 4px;">
                        A: ${formatPourcentage(indices.assiduite)} |
                        C: ${formatPourcentage(indices.completion)} |
                        P: ${formatPourcentage(indices.performance)}
                    </div>
                </div>
                <button class="btn btn-principal"
                        onclick="afficherSection('etudiants'); setTimeout(() => { afficherSousSection('profil-etudiant'); chargerProfilEtudiant('${e.da}'); }, 100);"
                        style="padding: 6px 12px; font-size: 0.9rem;">
                    Voir profil
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Affiche les patterns d'apprentissage
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherPatternsApprentissage(etudiants) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const afficherSommatif = config.affichageTableauBord?.afficherSommatif !== false;

    const nbTotal = etudiants.length;

    // Déterminer les patterns selon les indices A-C-P
    let stable = 0, defi = 0, emergent = 0, critique = 0;

    etudiants.forEach(e => {
        const indices = afficherSommatif ? e.sommatif : e.alternatif;
        const pattern = determinerPattern(indices);

        if (pattern === 'stable') stable++;
        else if (pattern === 'défi') defi++;
        else if (pattern === 'émergent') emergent++;
        else if (pattern === 'critique') critique++;
    });

    // Afficher les compteurs
    setStatText('tb-pattern-stable', stable);
    setStatText('tb-pattern-defi', defi);
    setStatText('tb-pattern-emergent', emergent);
    setStatText('tb-pattern-critique', critique);

    // Afficher les barres de progression
    if (nbTotal > 0) {
        setBarre('tb-barre-stable', (stable / nbTotal) * 100);
        setBarre('tb-barre-defi', (defi / nbTotal) * 100);
        setBarre('tb-barre-emergent', (emergent / nbTotal) * 100);
        setBarre('tb-barre-critique', (critique / nbTotal) * 100);
    }
}

/**
 * Affiche les niveaux RàI (Réponse à l'intervention)
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherNiveauxRaI(etudiants) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const afficherSommatif = config.affichageTableauBord?.afficherSommatif !== false;

    const nbTotal = etudiants.length;

    // Compter les étudiants par niveau RàI
    let niveau1 = 0; // Stable
    let niveau2 = 0; // Défi + Émergent
    let niveau3 = 0; // Critique

    etudiants.forEach(e => {
        const indices = afficherSommatif ? e.sommatif : e.alternatif;
        const pattern = determinerPattern(indices);

        if (pattern === 'stable') {
            niveau1++;
        } else if (pattern === 'défi' || pattern === 'émergent') {
            niveau2++;
        } else if (pattern === 'critique') {
            niveau3++;
        }
    });

    // Calculer les pourcentages
    const pct1 = nbTotal > 0 ? Math.round((niveau1 / nbTotal) * 100) : 0;
    const pct2 = nbTotal > 0 ? Math.round((niveau2 / nbTotal) * 100) : 0;
    const pct3 = nbTotal > 0 ? Math.round((niveau3 / nbTotal) * 100) : 0;

    // Afficher les compteurs
    setStatText('tb-rai-niveau1', niveau1);
    setStatText('tb-rai-niveau2', niveau2);
    setStatText('tb-rai-niveau3', niveau3);

    // Afficher les pourcentages
    setStatText('tb-rai-niveau1-pct', `(${pct1}%)`);
    setStatText('tb-rai-niveau2-pct', `(${pct2}%)`);
    setStatText('tb-rai-niveau3-pct', `(${pct3}%)`);
}

/**
 * Détermine le pattern d'apprentissage selon les indices A-C-P
 *
 * @param {Object} indices - Indices {assiduite, completion, performance, risque, niveauRisque}
 * @returns {string} Pattern: 'stable', 'défi', 'émergent', 'critique'
 */
function determinerPattern(indices) {
    const {assiduite, completion, performance, niveauRisque} = indices;

    // Stable: tous les indices > 0.75, risque faible/minimal
    if (assiduite >= 0.75 && completion >= 0.75 && performance >= 0.75) {
        return 'stable';
    }

    // Critique: niveau de risque critique
    if (niveauRisque === 'critique') {
        return 'critique';
    }

    // Émergent: assiduité OK mais complétion ou performance en baisse
    if (assiduite >= 0.75 && (completion < 0.65 || performance < 0.65)) {
        return 'émergent';
    }

    // Défi: au moins un indice sous 0.75 mais pas de blocage critique
    return 'défi';
}

/**
 * Affiche les actions recommandées (Top 5)
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherActionsRecommandees(etudiants) {
    const container = document.getElementById('tb-liste-actions');
    const messageVide = document.getElementById('tb-aucune-action');

    if (!container) return;

    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const afficherSommatif = config.affichageTableauBord?.afficherSommatif !== false;

    // Filtrer étudiants à risque et trier par priorité (risque décroissant)
    const etudiantsARisque = etudiants
        .filter(e => {
            const risque = afficherSommatif ? e.sommatif.risque : e.alternatif.risque;
            return risque >= 0.4; // Seuil: élevé ou plus
        })
        .sort((a, b) => {
            const risqueA = afficherSommatif ? a.sommatif.risque : a.alternatif.risque;
            const risqueB = afficherSommatif ? b.sommatif.risque : b.alternatif.risque;
            return risqueB - risqueA;
        })
        .slice(0, 5); // Top 5

    if (etudiantsARisque.length === 0) {
        container.style.display = 'none';
        if (messageVide) messageVide.style.display = 'block';
        return;
    }

    container.style.display = 'flex';
    if (messageVide) messageVide.style.display = 'none';

    container.innerHTML = etudiantsARisque.map((e, index) => {
        const indices = afficherSommatif ? e.sommatif : e.alternatif;
        const recommendation = genererRecommandation(indices);

        return `
            <div style="padding: 15px; background: white; border-radius: 8px;
                        border-left: 4px solid ${getCouleurRisque(indices.niveauRisque)};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <span style="display: inline-block; width: 24px; height: 24px;
                                     background: ${getCouleurRisque(indices.niveauRisque)};
                                     color: white; border-radius: 50%; text-align: center;
                                     line-height: 24px; font-weight: bold; margin-right: 10px;">
                            ${index + 1}
                        </span>
                        <strong>${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}</strong>
                        <span style="color: #666; margin-left: 8px;">(${echapperHtml(e.groupe || '—')})</span>
                    </div>
                    <span class="badge-risque risque-${indices.niveauRisque.replace(' ', '-')}"
                          style="text-transform: capitalize;">
                        ${indices.niveauRisque}
                    </span>
                </div>
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">
                    ${recommendation}
                </div>
                <div style="display: flex; gap: 8px; font-size: 0.85rem;">
                    <span>A: ${formatPourcentage(indices.assiduite)}</span> |
                    <span>C: ${formatPourcentage(indices.completion)}</span> |
                    <span>P: ${formatPourcentage(indices.performance)}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Génère une recommandation d'action selon les indices
 *
 * @param {Object} indices - Indices A-C-P
 * @returns {string} Recommandation pédagogique
 */
function genererRecommandation(indices) {
    const {assiduite, completion, performance} = indices;

    // Identifier le défi principal
    if (assiduite < 0.65) {
        return "📅 <strong>Priorité: Assiduité</strong> - Contacter l'étudiant pour comprendre les absences et proposer un soutien";
    }
    if (completion < 0.65) {
        return "📝 <strong>Priorité: Complétion</strong> - Rencontre pour identifier les obstacles et établir un échéancier réaliste";
    }
    if (performance < 0.65) {
        return "🎯 <strong>Priorité: Performance</strong> - Offrir du soutien pédagogique et des stratégies d'apprentissage";
    }
    if (assiduite < 0.75) {
        return "⚠️ <strong>Suivi: Assiduité</strong> - Surveiller l'évolution et encourager la régularité";
    }
    if (completion < 0.75) {
        return "⚠️ <strong>Suivi: Complétion</strong> - Rappeler les échéances et vérifier la charge de travail";
    }
    if (performance < 0.75) {
        return "⚠️ <strong>Suivi: Performance</strong> - Proposer des ressources complémentaires";
    }

    return "✓ Situation sous contrôle - Maintenir le suivi régulier";
}

/**
 * Retourne la couleur CSS selon le niveau de risque
 *
 * @param {string} niveau - Niveau de risque
 * @returns {string} Couleur CSS
 */
function getCouleurRisque(niveau) {
    const couleurs = {
        'critique': '#d32f2f',
        'très élevé': '#f57c00',
        'élevé': '#fbc02d',
        'modéré': '#fdd835',
        'faible': '#7cb342',
        'minimal': '#388e3c'
    };
    return couleurs[niveau] || '#999';
}

/**
 * Affiche la distribution des niveaux de risque
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherDistributionRisques(etudiants) {
    const container = document.getElementById('tb-distribution-risques');
    if (!container) return;
    
    // Compter par niveau de risque
    const distribution = {
        'minimal': 0,
        'faible': 0,
        'modéré': 0,
        'élevé': 0,
        'très élevé': 0,
        'critique': 0
    };
    
    etudiants.forEach(e => {
        distribution[e.niveauRisque]++;
    });
    
    // Couleurs selon le niveau
    const couleurs = {
        'minimal': 'var(--risque-nul)',
        'faible': 'var(--risque-minimal)',
        'modéré': 'var(--risque-modere)',
        'élevé': 'var(--risque-eleve)',
        'très élevé': '#c0392b',
        'critique': '#7f0000'
    };
    
    // Générer le HTML
    container.innerHTML = Object.entries(distribution).map(([niveau, nombre]) => `
        <div style="padding: 15px; background: white; border-left: 4px solid ${couleurs[niveau]}; 
                    border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-size: 1.5rem; font-weight: bold; color: ${couleurs[niveau]};">
                ${nombre}
            </div>
            <div style="font-size: 0.85rem; color: #666; text-transform: capitalize;">
                ${niveau}
            </div>
        </div>
    `).join('');
}

/**
 * Affiche les alertes prioritaires (étudiants à risque)
 * 
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherAlertesPrioritaires(etudiants) {
    const container = document.getElementById('tb-alertes-prioritaires');
    if (!container) return;
    
    // Filtrer les étudiants avec risque ≥ élevé (seuil 0.4)
    const etudiantsARisque = etudiants
        .filter(e => e.risque >= 0.4)
        .sort((a, b) => b.risque - a.risque);  // Tri décroissant
    
    if (etudiantsARisque.length === 0) {
        container.innerHTML = `
            <p style="text-align: center; padding: 30px; color: green;">
                ✅ Aucune intervention urgente requise
            </p>
        `;
        return;
    }
    
    // Générer le tableau
    container.innerHTML = `
        <table class="tableau" style="margin-top: 15px;">
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Groupe</th>
                    <th>Assiduité</th>
                    <th>Complétion</th>
                    <th>Performance</th>
                    <th>Niveau de risque</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${etudiantsARisque.map(e => `
                    <tr>
                        <td><strong>${echapperHtml(e.nom)}</strong></td>
                        <td>${echapperHtml(e.prenom)}</td>
                        <td>${echapperHtml(e.groupe || '—')}</td>
                        <td>${formatPourcentage(e.assiduite)}</td>
                        <td>${formatPourcentage(e.completion)}</td>
                        <td>${formatPourcentage(e.performance)}</td>
                        <td>
                            <span class="badge-risque risque-${e.niveauRisque.replace(' ', '-')}" 
                                  style="text-transform: capitalize;">
                                ${e.niveauRisque}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-principal" 
                                    onclick="afficherSousSection('tableau-bord-profil'); chargerProfilEtudiant('${e.da}')"
                                    style="padding: 6px 12px; font-size: 0.9rem;">
                                Voir profil
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/* ===============================
   🔧 FONCTIONS UTILITAIRES
   =============================== */

/**
 * Met à jour le texte d'un élément HTML
 * 
 * @param {string} id - ID de l'élément
 * @param {string|number} valeur - Valeur à afficher
 */
function setStatText(id, valeur) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = valeur;
    } else {
        console.warn(`⚠️ Élément ${id} non trouvé`);
    }
}

/**
 * Formate un nombre en pourcentage
 *
 * @param {number} valeur - Valeur entre 0 et 1
 * @returns {string} Pourcentage formaté (ex: "87%")
 */
function formatPourcentage(valeur) {
    if (valeur === null || valeur === undefined || isNaN(valeur)) {
        return '—';
    }
    return Math.round(valeur * 100) + '%';
}

/**
 * Met à jour la largeur d'une barre de progression
 *
 * @param {string} id - ID de l'élément barre
 * @param {number} pourcentage - Pourcentage de largeur (0-100)
 */
function setBarre(id, pourcentage) {
    const element = document.getElementById(id);
    if (element) {
        element.style.width = Math.round(pourcentage) + '%';
    }
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES DE CE MODULE:
 * - config.js : echapperHtml()
 * - 09-2-saisie-presences.js : calculerNombreSeances() (optionnel)
 * - styles.css : classes badge-risque, carte-metrique, tableau
 * 
 * MODULES QUI DÉPENDENT DE CELUI-CI:
 * - Aucun (module autonome)
 * 
 * ORDRE DE CHARGEMENT:
 * Ce module doit être chargé après config.js et navigation.js
 * 
 * LOCALSTORAGE UTILISÉ (lecture seule):
 * - 'groupeEtudiants' : Array des étudiants
 * - 'presences' : Array des présences
 * - 'evaluationsSauvegardees' : Array des évaluations
 * - 'listeGrilles' : Array des productions
 * 
 * HTML REQUIS:
 * Éléments avec IDs dans la sous-section tableau-bord-apercu:
 * - tb-total-etudiants
 * - tb-assiduite-moyenne
 * - tb-completion-moyenne
 * - tb-performance-moyenne
 * - tb-interventions-requises
 * - tb-distribution-risques
 * - tb-alertes-prioritaires
 * 
 * FORMULES UTILISÉES (Guide de monitorage):
 * - Assiduité (A) : SOMME(heures présent) / TOTAL(heures cours)
 * - Complétion (C) : NOMBRE(remis) / NOMBRE(attendus)
 * - Performance (P) : MOYENNE(3 derniers IDME) / 4
 * - Risque : 1 - (A × C × P)
 * 
 * SEUILS DE RISQUE:
 * - Critique: > 0.7
 * - Très élevé: 0.5 - 0.7
 * - Élevé: 0.4 - 0.5
 * - Modéré: 0.3 - 0.4
 * - Faible: 0.2 - 0.3
 * - Minimal: ≤ 0.2
 */