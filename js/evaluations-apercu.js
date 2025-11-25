/* ===============================
   MODULE: ÉVALUATIONS - APERÇU
   Affichage des statistiques globales d'évaluation du groupe
   =============================== */

/**
 * Initialise le module d'aperçu des évaluations
 * Appelée par main.js au chargement
 */
function initialiserModuleEvaluationsApercu() {
    console.log('📊 Module Évaluations - Aperçu initialisé');
}

/**
 * Charge et affiche les statistiques d'aperçu des évaluations
 * Appelée automatiquement lors de l'affichage de la sous-section
 */
function chargerApercuEvaluations() {
    console.log('🔄 Chargement de l\'aperçu des évaluations...');

    try {
        // Récupérer les étudiants actifs
        // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const etudiantsActifs = etudiants.filter(e =>
            e.statut !== 'décrochage' && e.statut !== 'abandon'
        );

        // Récupérer les évaluations
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');

        // Récupérer les productions configurées
        const productions = obtenirDonneesSelonMode('productions');

        // Calculer les statistiques
        calculerStatistiquesEvaluations(etudiantsActifs, evaluations, productions);

        console.log('✅ Aperçu des évaluations chargé');
    } catch (error) {
        console.error('❌ Erreur chargement aperçu évaluations:', error);
    }
}

/**
 * Calcule et affiche les statistiques d'évaluations
 *
 * @param {Array} etudiants - Liste des étudiants actifs
 * @param {Array} evaluations - Évaluations sauvegardées
 * @param {Array} productions - Productions configurées
 */
function calculerStatistiquesEvaluations(etudiants, evaluations, productions) {
    const nbTotal = etudiants.length;

    if (nbTotal === 0) {
        afficherMessageVideEvaluations();
        return;
    }

    // Déterminer la pratique active
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif !== false;
    const afficherPan = affichage.afficherAlternatif !== false;
    const modeComparatif = afficherSom && afficherPan;

    // TAUX DE COMPLÉTION MOYEN (lire depuis indicesCP - source unique de vérité)
    let totalC = 0;
    let nbAvecDonnees = 0;

    if (typeof obtenirIndicesCP === 'function') {
        etudiants.forEach(e => {
            let C_etudiant = 0;

            if (modeComparatif) {
                // Moyenne des deux pratiques
                const indicesSOM = obtenirIndicesCP(e.da, 'SOM');
                const indicesPAN = obtenirIndicesCP(e.da, 'PAN');
                C_etudiant = ((indicesSOM?.C || 0) + (indicesPAN?.C || 0)) / 2;
            } else if (afficherSom) {
                const indices = obtenirIndicesCP(e.da, 'SOM');
                C_etudiant = indices?.C || 0;
            } else if (afficherPan) {
                const indices = obtenirIndicesCP(e.da, 'PAN');
                C_etudiant = indices?.C || 0;
            }

            if (C_etudiant > 0) {
                nbAvecDonnees++;
            }
            totalC += C_etudiant;
        });
    }

    const tauxCompletion = nbAvecDonnees > 0 ? Math.round(totalC / nbTotal) : 0;
    setStatText('ea-taux-completion', `${tauxCompletion}%`);

    // PRODUCTIONS RÉALISÉES (compter les productions avec au moins une évaluation complétée)
    const productionsRealisees = new Set();
    evaluations.forEach(ev => {
        // Vérifier si l'évaluation a une note valide (pas null, pas undefined, pas "--")
        if (ev.productionId && ev.noteFinale !== undefined && ev.noteFinale !== null && ev.noteFinale !== '--') {
            productionsRealisees.add(ev.productionId);
        }
    });
    const nbProductionsRealisees = productionsRealisees.size;
    setStatText('ea-productions-realisees', nbProductionsRealisees);

    // PRODUCTIONS CONFIGURÉES
    setStatText('ea-productions-configurees', productions.length);
}

/**
 * Formate une date en format court (ex: 25 oct.)
 * @param {Date} date - Date à formater
 * @returns {string} Date formatée
 */
function formaterDateCourte(date) {
    const mois = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin',
                  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    return `${date.getDate()} ${mois[date.getMonth()]}`;
}

/**
 * Affiche un message si aucune donnée disponible
 */
function afficherMessageVideEvaluations() {
    setStatText('ea-productions-realisees', '—');
    setStatText('ea-taux-completion', '—');
    setStatText('ea-productions-configurees', '—');
}

/**
 * Met à jour le texte d'un élément HTML
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
