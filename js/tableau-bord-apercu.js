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
        
        // Afficher tout
        afficherMetriquesGlobales(etudiantsAvecIndices);
        afficherDistributionRisques(etudiantsAvecIndices);
        afficherAlertesPrioritaires(etudiantsAvecIndices);
        
        console.log('✅ Tableau de bord chargé');
        
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