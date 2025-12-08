/* ===============================
   BIBLIOTHÈQUE DE PRODUCTIONS ÉTUDIANTES
   ✅ CRÉATION (8 décembre 2025)

   Productions exemples organisées par discipline
   Utilisées pour la bibliothèque partagée dans le gestionnaire de productions

   Structure par discipline:
   - Chimie
   - Philosophie
   - Mathématiques
   - Littérature
   - Biologie

   Licence: Creative Commons BY-NC-SA 4.0
   Auteur: Primo Primavera
   =============================== */

window.PRODUCTIONS_BIBLIOTHEQUE = {
    // ===========================
    // CHIMIE
    // ===========================
    chimie: [
        {
            id: 'chimie-lab-titrage',
            titre: 'Laboratoire 1',
            description: 'Titrage acide-base',
            type: 'travail',
            ponderation: 10,
            objectif: 'Maîtriser les techniques de titrage et interpréter les résultats',
            tache: 'Réaliser un titrage acide-base et produire un rapport d\'analyse',
            grilleId: '',  // Sera associé à une grille lors de l'ajout
            discipline: 'Chimie',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        },
        {
            id: 'chimie-examen-mi-session',
            titre: 'Examen de mi-session',
            description: 'Nomenclature et réactions',
            type: 'examen',
            ponderation: 20,
            objectif: 'Évaluer la maîtrise de la nomenclature et des types de réactions',
            tache: 'Examen écrit de 2 heures',
            grilleId: '',
            discipline: 'Chimie',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        },
        {
            id: 'chimie-lab-synthese',
            titre: 'Laboratoire de synthèse',
            description: 'Synthèse d\'un composé organique',
            type: 'travail',
            ponderation: 15,
            objectif: 'Réaliser une synthèse organique et évaluer le rendement',
            tache: 'Synthèse en laboratoire avec rapport complet',
            grilleId: '',
            discipline: 'Chimie',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        }
    ],

    // ===========================
    // PHILOSOPHIE
    // ===========================
    philosophie: [
        {
            id: 'philo-dissertation-1',
            titre: 'Dissertation 1',
            description: 'Analyse d\'un texte philosophique',
            type: 'travail',
            ponderation: 20,
            objectif: 'Analyser rigoureusement un texte philosophique',
            tache: 'Dissertation de 1000 mots sur un extrait de Platon',
            grilleId: '',
            discipline: 'Philosophie',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        },
        {
            id: 'philo-expose-oral',
            titre: 'Exposé oral',
            description: 'Présentation d\'un courant philosophique',
            type: 'presentation',
            ponderation: 15,
            objectif: 'Expliquer clairement un courant philosophique',
            tache: 'Présentation de 15 minutes avec support visuel',
            grilleId: '',
            discipline: 'Philosophie',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        },
        {
            id: 'philo-dissertation-finale',
            titre: 'Dissertation finale',
            description: 'Argumentation philosophique complète',
            type: 'travail',
            ponderation: 30,
            objectif: 'Construire une argumentation philosophique rigoureuse',
            tache: 'Dissertation de 1500 mots sur une question éthique',
            grilleId: '',
            discipline: 'Philosophie',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        }
    ],

    // ===========================
    // MATHÉMATIQUES
    // ===========================
    mathematiques: [
        {
            id: 'math-quiz-1',
            titre: 'Quiz 1',
            description: 'Dérivées et limites',
            type: 'quiz',
            ponderation: 10,
            objectif: 'Vérifier la compréhension des dérivées et limites',
            tache: 'Quiz de 30 minutes en classe',
            grilleId: '',
            discipline: 'Mathématiques',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        },
        {
            id: 'math-examen-mi-session',
            titre: 'Examen de mi-session',
            description: 'Calcul différentiel',
            type: 'examen',
            ponderation: 25,
            objectif: 'Évaluer la maîtrise du calcul différentiel',
            tache: 'Examen écrit de 2 heures',
            grilleId: '',
            discipline: 'Mathématiques',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        },
        {
            id: 'math-projet-modelisation',
            titre: 'Projet de modélisation',
            description: 'Modélisation mathématique d\'un phénomène réel',
            type: 'travail',
            ponderation: 20,
            objectif: 'Appliquer les mathématiques à un contexte réel',
            tache: 'Rapport de modélisation avec graphiques et analyse',
            grilleId: '',
            discipline: 'Mathématiques',
            auteur: 'Primo Primavera',
            etablissement: 'Cégeg de Rimouski',
            dansBibliotheque: false
        }
    ],

    // ===========================
    // LITTÉRATURE
    // ===========================
    litterature: [
        {
            id: 'litt-commentaire-compose',
            titre: 'Commentaire composé',
            description: 'Analyse d\'un extrait littéraire',
            type: 'travail',
            ponderation: 20,
            objectif: 'Analyser les procédés littéraires et leur effet',
            tache: 'Commentaire de 800 mots sur un extrait de roman',
            grilleId: '',
            discipline: 'Littérature',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        },
        {
            id: 'litt-dissertation-comparative',
            titre: 'Dissertation comparative',
            description: 'Comparaison de deux œuvres',
            type: 'travail',
            ponderation: 25,
            objectif: 'Comparer les thèmes et styles de deux œuvres',
            tache: 'Dissertation de 1200 mots comparant deux romans',
            grilleId: '',
            discipline: 'Littérature',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        },
        {
            id: 'litt-creation-litteraire',
            titre: 'Création littéraire',
            description: 'Rédaction d\'une nouvelle',
            type: 'travail',
            ponderation: 15,
            objectif: 'Créer un texte littéraire original',
            tache: 'Nouvelle de 1000 mots avec analyse de votre démarche créative',
            grilleId: '',
            discipline: 'Littérature',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        }
    ],

    // ===========================
    // BIOLOGIE
    // ===========================
    biologie: [
        {
            id: 'bio-lab-microscopie',
            titre: 'Laboratoire de microscopie',
            description: 'Observation de cellules',
            type: 'travail',
            ponderation: 10,
            objectif: 'Maîtriser l\'utilisation du microscope et l\'observation cellulaire',
            tache: 'Rapport de laboratoire avec dessins d\'observation',
            grilleId: '',
            discipline: 'Biologie',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        },
        {
            id: 'bio-examen-genetique',
            titre: 'Examen de génétique',
            description: 'Lois de Mendel et hérédité',
            type: 'examen',
            ponderation: 20,
            objectif: 'Évaluer la compréhension des mécanismes de l\'hérédité',
            tache: 'Examen écrit de 2 heures',
            grilleId: '',
            discipline: 'Biologie',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        },
        {
            id: 'bio-projet-ecosysteme',
            titre: 'Projet sur un écosystème',
            description: 'Étude d\'un écosystème local',
            type: 'travail',
            ponderation: 25,
            objectif: 'Analyser les interactions dans un écosystème',
            tache: 'Rapport d\'étude de terrain avec analyse des données',
            grilleId: '',
            discipline: 'Biologie',
            auteur: 'Primo Primavera',
            etablissement: '',
            dansBibliotheque: false
        }
    ]
};

/**
 * Obtenir toutes les productions de la bibliothèque (toutes disciplines)
 * @returns {Array} Tableau de toutes les productions disponibles
 */
function obtenirToutesLesProductionsBibliotheque() {
    const toutes = [];
    Object.keys(window.PRODUCTIONS_BIBLIOTHEQUE).forEach(discipline => {
        toutes.push(...window.PRODUCTIONS_BIBLIOTHEQUE[discipline]);
    });
    return toutes;
}

/**
 * Obtenir les productions d'une discipline spécifique
 * @param {string} discipline - Nom de la discipline (chimie, philosophie, etc.)
 * @returns {Array} Tableau des productions de cette discipline
 */
function obtenirProductionsParDiscipline(discipline) {
    return window.PRODUCTIONS_BIBLIOTHEQUE[discipline] || [];
}

/**
 * Obtenir la liste des disciplines disponibles
 * @returns {Array} Tableau des noms de disciplines
 */
function obtenirDisciplinesDisponibles() {
    return Object.keys(window.PRODUCTIONS_BIBLIOTHEQUE).map(key => {
        // Capitaliser la première lettre
        return key.charAt(0).toUpperCase() + key.slice(1);
    });
}

// Exporter les fonctions
window.obtenirToutesLesProductionsBibliotheque = obtenirToutesLesProductionsBibliotheque;
window.obtenirProductionsParDiscipline = obtenirProductionsParDiscipline;
window.obtenirDisciplinesDisponibles = obtenirDisciplinesDisponibles;
