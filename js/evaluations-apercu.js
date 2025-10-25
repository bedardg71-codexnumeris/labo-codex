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
        const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
        const etudiantsActifs = etudiants.filter(e =>
            e.statut !== 'décrochage' && e.statut !== 'abandon'
        );

        // Récupérer les évaluations
        const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');

        // Récupérer les productions configurées
        const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');

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

    // ÉTUDIANTS ÉVALUÉS (au moins 1 évaluation)
    const etudiantsAvecEvaluations = new Set();
    evaluations.forEach(ev => {
        if (ev.etudiantId) {
            etudiantsAvecEvaluations.add(ev.etudiantId);
        }
    });
    const nbEtudiantsEvalues = etudiantsAvecEvaluations.size;
    setStatText('ea-etudiants-evalues', `${nbEtudiantsEvalues} / ${nbTotal}`);

    // ARTEFACTS COMPLÉTÉS
    const nbArtefactsTotal = productions.length * nbTotal;
    const nbArtefactsCompletes = evaluations.filter(ev => ev.note !== undefined && ev.note !== null).length;
    setStatText('ea-artefacts-completes', `${nbArtefactsCompletes} / ${nbArtefactsTotal}`);

    // MOYENNE DU GROUPE (notes sur 100)
    const evaluationsAvecNotes = evaluations.filter(ev => ev.note !== undefined && ev.note !== null);
    let moyenneGroupe = 0;
    if (evaluationsAvecNotes.length > 0) {
        const sommeNotes = evaluationsAvecNotes.reduce((sum, ev) => sum + (ev.note || 0), 0);
        moyenneGroupe = Math.round(sommeNotes / evaluationsAvecNotes.length);
    }
    setStatText('ea-moyenne-groupe', moyenneGroupe > 0 ? `${moyenneGroupe}%` : '—');

    // TAUX DE COMPLÉTION MOYEN
    let tauxCompletion = 0;
    if (nbArtefactsTotal > 0) {
        tauxCompletion = Math.round((nbArtefactsCompletes / nbArtefactsTotal) * 100);
    }
    setStatText('ea-taux-completion', `${tauxCompletion}%`);

    // PRODUCTIONS CONFIGURÉES
    setStatText('ea-productions-configurees', productions.length);

    // DERNIÈRE ÉVALUATION (date la plus récente)
    let derniereDate = '—';
    if (evaluations.length > 0) {
        // Trouver l'évaluation la plus récente
        const evaluationsTriees = evaluations
            .filter(ev => ev.dateEvaluation)
            .sort((a, b) => new Date(b.dateEvaluation) - new Date(a.dateEvaluation));

        if (evaluationsTriees.length > 0) {
            const date = new Date(evaluationsTriees[0].dateEvaluation);
            derniereDate = formaterDateCourte(date);
        }
    }
    setStatText('ea-derniere-evaluation', derniereDate);
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
    setStatText('ea-etudiants-evalues', '—');
    setStatText('ea-artefacts-completes', '—');
    setStatText('ea-moyenne-groupe', '—');
    setStatText('ea-taux-completion', '—');
    setStatText('ea-productions-configurees', '—');
    setStatText('ea-derniere-evaluation', '—');
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
