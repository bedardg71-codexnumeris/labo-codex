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

/**
 * Charge et affiche toutes les statistiques du tableau de bord
 * 
 * APPELÉE PAR:
 * - initialiserModuleTableauBordApercu()
 * - Changement vers sous-section aperçu
 * - Bouton de rafraîchissement (si ajouté)
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les données (étudiants, présences, évaluations)
 * 2. Calcule les indices pour chaque étudiant
 * 3. Agrège les statistiques du groupe
 * 4. Affiche les métriques, distribution, alertes
 */
function chargerTableauBordApercu() {
    console.log('📊 Chargement du tableau de bord - aperçu');
    
    try {
        // Récupérer les données
        const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
        const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
        const presences = JSON.parse(localStorage.getItem('presences') || '[]');
        
        // Filtrer les étudiants actifs
        const etudiantsActifs = etudiants.filter(e => 
            e.statut !== 'décrochage' && e.statut !== 'abandon'
        );
        
        // Calculer les indices pour chaque étudiant
        const etudiantsAvecIndices = etudiantsActifs.map(etudiant => {
            const indices = calculerIndicesEtudiant(etudiant.da, presences, evaluations);
            return {
                ...etudiant,
                ...indices
            };
        });
        
        // Afficher les métriques globales
        afficherMetriquesGlobales(etudiantsAvecIndices);
        
        // Afficher la distribution des risques
        afficherDistributionRisques(etudiantsAvecIndices);
        
        // Afficher les alertes prioritaires
        afficherAlertesPrioritaires(etudiantsAvecIndices);
        
        console.log('   ✅ Tableau de bord chargé');
        
    } catch (error) {
        console.error('❌ Erreur chargement tableau de bord:', error);
    }
}

/* ===============================
   🧮 CALCULS DES INDICES
   =============================== */

/**
 * Calcule tous les indices pour un étudiant
 * 
 * @param {string} da - DA de l'étudiant
 * @param {Array} presences - Toutes les présences
 * @param {Array} evaluations - Toutes les évaluations
 * @returns {Object} Indices calculés {assiduite, completion, performance, risque}
 */
function calculerIndicesEtudiant(da, presences, evaluations) {
    // Calculer l'assiduité (sommative - toutes séances)
    const assiduite = calculerAssiduiteSommative(da, presences);
    
    // Calculer la complétion (sommative - tous artefacts)
    const completion = calculerCompletionSommative(da, evaluations);
    
    // Calculer la performance (alternative - 3 derniers artefacts)
    const performance = calculerPerformanceAlternative(da, evaluations);
    
    // Calculer le risque (formule: 1 - A×C×P)
    const risque = calculerRisque(assiduite, completion, performance);
    
    // Déterminer le niveau de risque
    const niveauRisque = determinerNiveauRisque(risque);
    
    return {
        assiduite,
        completion,
        performance,
        risque,
        niveauRisque
    };
}

/**
 * Calcule l'assiduité sommative (toutes les séances)
 * Formule du Guide: SOMME(heures présent) / TOTAL(heures cours)
 * 
 * @param {string} da - DA de l'étudiant
 * @param {Array} presences - Toutes les présences
 * @returns {number} Proportion entre 0 et 1
 */
function calculerAssiduiteSommative(da, presences) {
    try {
        // Filtrer les présences de cet étudiant
        const presencesEtudiant = presences.filter(p => p.da === da);
        
        if (presencesEtudiant.length === 0) return 0;
        
        // Calculer le total des heures de présence
        const heuresPresent = presencesEtudiant.reduce((total, p) => {
            return total + (p.heuresPresent || 0);
        }, 0);
        
        // Calculer le total d'heures de cours données
        // Utiliser la fonction du module saisie-presences si disponible
        const totalHeuresCours = typeof calculerNombreSeances === 'function'
            ? calculerNombreSeances() * 2  // 2h par séance
            : presences.length * 2;  // Fallback
        
        if (totalHeuresCours === 0) return 0;
        
        return heuresPresent / totalHeuresCours;
        
    } catch (error) {
        console.error('Erreur calcul assiduité:', error);
        return 0;
    }
}

/**
 * Calcule la complétion sommative (tous les artefacts)
 * Formule du Guide: NOMBRE(artefacts remis) / NOMBRE(artefacts attendus)
 * 
 * @param {string} da - DA de l'étudiant
 * @param {Array} evaluations - Toutes les évaluations
 * @returns {number} Proportion entre 0 et 1
 */
function calculerCompletionSommative(da, evaluations) {
    try {
        // Récupérer les productions configurées
        const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
        const artefacts = productions.filter(p => 
            p.type === 'artefact-portfolio' || p.type === 'production'
        );
        
        if (artefacts.length === 0) return 0;
        
        // Compter les artefacts remis par cet étudiant
        const evaluationsEtudiant = evaluations.filter(e => e.etudiantDA === da);
        const nbRemis = evaluationsEtudiant.length;
        
        return nbRemis / artefacts.length;
        
    } catch (error) {
        console.error('Erreur calcul complétion:', error);
        return 0;
    }
}

/**
 * Calcule la performance alternative (3 derniers artefacts)
 * Formule du Guide: MOYENNE(notes IDME des 3 derniers) / 4
 * Note: En pratique alternative, on ne fait pas de moyenne arithmétique
 * mais on regarde la tendance récente
 * 
 * @param {string} da - DA de l'étudiant
 * @param {Array} evaluations - Toutes les évaluations
 * @returns {number} Proportion entre 0 et 1
 */
function calculerPerformanceAlternative(da, evaluations) {
    try {
        // Récupérer les évaluations de cet étudiant
        const evaluationsEtudiant = evaluations.filter(e => e.etudiantDA === da);
        
        if (evaluationsEtudiant.length === 0) return 0;
        
        // Trier par date décroissante et prendre les 3 derniers
        const derniers3 = evaluationsEtudiant
            .sort((a, b) => new Date(b.dateEvaluation || 0) - new Date(a.dateEvaluation || 0))
            .slice(0, 3);
        
        if (derniers3.length === 0) return 0;
        
        // Convertir les niveaux IDME en valeurs numériques
        // I=1, D=2, M=3, E=4
        const valeurs = derniers3.map(e => {
            const niveau = e.niveauFinal || '';
            switch(niveau.toUpperCase()) {
                case 'E': return 4;
                case 'M': return 3;
                case 'D': return 2;
                case 'I': return 1;
                default: return 0;
            }
        });
        
        // Calculer la moyenne et normaliser sur 1
        const moyenne = valeurs.reduce((sum, v) => sum + v, 0) / valeurs.length;
        return moyenne / 4;
        
    } catch (error) {
        console.error('Erreur calcul performance:', error);
        return 0;
    }
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
 * 
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherMetriquesGlobales(etudiants) {
    const nbTotal = etudiants.length;
    
    // Calculer les moyennes
    const assiduiteMoyenne = nbTotal > 0
        ? etudiants.reduce((sum, e) => sum + e.assiduite, 0) / nbTotal
        : 0;
    
    const completionMoyenne = nbTotal > 0
        ? etudiants.reduce((sum, e) => sum + e.completion, 0) / nbTotal
        : 0;
    
    const performanceMoyenne = nbTotal > 0
        ? etudiants.reduce((sum, e) => sum + e.performance, 0) / nbTotal
        : 0;
    
    // Compter les interventions requises (risque ≥ élevé = seuil 0.4)
    const interventionsRequises = etudiants.filter(e => e.risque >= 0.4).length;
    
    // Afficher les valeurs
    setStatText('tb-total-etudiants', nbTotal);
    setStatText('tb-assiduite-moyenne', formatPourcentage(assiduiteMoyenne));
    setStatText('tb-completion-moyenne', formatPourcentage(completionMoyenne));
    setStatText('tb-performance-moyenne', formatPourcentage(performanceMoyenne));
    setStatText('tb-interventions-requises', interventionsRequises);
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