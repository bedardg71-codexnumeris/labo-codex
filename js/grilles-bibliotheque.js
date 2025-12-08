/* ===============================
   BIBLIOTHÈQUE DE GRILLES DE CRITÈRES
   ✅ CRÉATION (8 décembre 2025)

   Grilles de critères d'évaluation organisées par discipline
   Utilisées pour la bibliothèque partagée dans le gestionnaire de grilles

   Structure par discipline:
   - Chimie
   - Philosophie
   - Mathématiques
   - Littérature
   - Biologie

   Licence: Creative Commons BY-NC-SA 4.0
   Auteur: Primo Primavera
   =============================== */

window.GRILLES_BIBLIOTHEQUE = {
    // ===========================
    // CHIMIE
    // ===========================
    chimie: [
        {
            id: 'chimie-grille-rapport-labo',
            nom: 'Rapport de laboratoire',
            discipline: 'Chimie',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Grille pour évaluer les rapports de laboratoire en chimie',
            criteres: [
                {
                    id: 'crit-chimie-1',
                    nom: 'Protocole expérimental',
                    description: 'Clarté et rigueur du protocole',
                    ponderation: 25,
                    verrouille: false
                },
                {
                    id: 'crit-chimie-2',
                    nom: 'Résultats et observations',
                    description: 'Précision des mesures et qualité des observations',
                    ponderation: 30,
                    verrouille: false
                },
                {
                    id: 'crit-chimie-3',
                    nom: 'Analyse et interprétation',
                    description: 'Qualité de l\'analyse des résultats',
                    ponderation: 30,
                    verrouille: false
                },
                {
                    id: 'crit-chimie-4',
                    nom: 'Présentation',
                    description: 'Clarté de la présentation et respect des normes',
                    ponderation: 15,
                    verrouille: false
                }
            ],
            dansBibliotheque: false
        }
    ],

    // ===========================
    // PHILOSOPHIE
    // ===========================
    philosophie: [
        {
            id: 'philo-grille-dissertation',
            nom: 'Dissertation philosophique',
            discipline: 'Philosophie',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Grille pour évaluer les dissertations philosophiques',
            criteres: [
                {
                    id: 'crit-philo-1',
                    nom: 'Problématisation',
                    description: 'Qualité de la problématique et des enjeux soulevés',
                    ponderation: 20,
                    verrouille: false
                },
                {
                    id: 'crit-philo-2',
                    nom: 'Argumentation',
                    description: 'Rigueur et cohérence de l\'argumentation',
                    ponderation: 35,
                    verrouille: false
                },
                {
                    id: 'crit-philo-3',
                    nom: 'Références philosophiques',
                    description: 'Pertinence et utilisation des références',
                    ponderation: 20,
                    verrouille: false
                },
                {
                    id: 'crit-philo-4',
                    nom: 'Langue et présentation',
                    description: 'Qualité de la langue et de la présentation',
                    ponderation: 25,
                    verrouille: false
                }
            ],
            dansBibliotheque: false
        }
    ],

    // ===========================
    // MATHÉMATIQUES
    // ===========================
    mathematiques: [
        {
            id: 'math-grille-resolution',
            nom: 'Résolution de problèmes',
            discipline: 'Mathématiques',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Grille pour évaluer la résolution de problèmes mathématiques',
            criteres: [
                {
                    id: 'crit-math-1',
                    nom: 'Compréhension du problème',
                    description: 'Identification correcte des données et de l\'objectif',
                    ponderation: 20,
                    verrouille: false
                },
                {
                    id: 'crit-math-2',
                    nom: 'Démarche de résolution',
                    description: 'Choix et application des méthodes appropriées',
                    ponderation: 40,
                    verrouille: false
                },
                {
                    id: 'crit-math-3',
                    nom: 'Exactitude des calculs',
                    description: 'Précision des calculs et des manipulations algébriques',
                    ponderation: 25,
                    verrouille: false
                },
                {
                    id: 'crit-math-4',
                    nom: 'Communication mathématique',
                    description: 'Clarté de la présentation et justification des étapes',
                    ponderation: 15,
                    verrouille: false
                }
            ],
            dansBibliotheque: false
        }
    ],

    // ===========================
    // LITTÉRATURE
    // ===========================
    litterature: [
        {
            id: 'litt-grille-analyse',
            nom: 'Analyse littéraire',
            discipline: 'Littérature',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Grille pour évaluer les analyses d\'œuvres littéraires',
            criteres: [
                {
                    id: 'crit-litt-1',
                    nom: 'Compréhension de l\'œuvre',
                    description: 'Saisie du sens global et des nuances',
                    ponderation: 25,
                    verrouille: false
                },
                {
                    id: 'crit-litt-2',
                    nom: 'Analyse des procédés',
                    description: 'Identification et analyse des procédés littéraires',
                    ponderation: 30,
                    verrouille: false
                },
                {
                    id: 'crit-litt-3',
                    nom: 'Interprétation',
                    description: 'Qualité et pertinence de l\'interprétation',
                    ponderation: 25,
                    verrouille: false
                },
                {
                    id: 'crit-litt-4',
                    nom: 'Qualité de la langue',
                    description: 'Maîtrise de la langue et de l\'expression',
                    ponderation: 20,
                    verrouille: false
                }
            ],
            dansBibliotheque: false
        }
    ],

    // ===========================
    // BIOLOGIE
    // ===========================
    biologie: [
        {
            id: 'bio-grille-rapport',
            nom: 'Rapport d\'expérimentation',
            discipline: 'Biologie',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Grille pour évaluer les rapports d\'expérimentation en biologie',
            criteres: [
                {
                    id: 'crit-bio-1',
                    nom: 'Démarche scientifique',
                    description: 'Rigueur de la démarche et respect du protocole',
                    ponderation: 30,
                    verrouille: false
                },
                {
                    id: 'crit-bio-2',
                    nom: 'Observations et données',
                    description: 'Précision et complétude des observations',
                    ponderation: 25,
                    verrouille: false
                },
                {
                    id: 'crit-bio-3',
                    nom: 'Analyse et conclusion',
                    description: 'Qualité de l\'analyse et pertinence de la conclusion',
                    ponderation: 30,
                    verrouille: false
                },
                {
                    id: 'crit-bio-4',
                    nom: 'Communication scientifique',
                    description: 'Clarté et respect des normes de présentation',
                    ponderation: 15,
                    verrouille: false
                }
            ],
            dansBibliotheque: false
        }
    ]
};

/**
 * Obtenir toutes les grilles de la bibliothèque (toutes disciplines)
 * @returns {Array} Tableau de toutes les grilles disponibles
 */
function obtenirToutesLesGrillesBibliotheque() {
    const toutes = [];
    Object.keys(window.GRILLES_BIBLIOTHEQUE).forEach(discipline => {
        toutes.push(...window.GRILLES_BIBLIOTHEQUE[discipline]);
    });
    return toutes;
}

/**
 * Obtenir les grilles d'une discipline spécifique
 * @param {string} discipline - Nom de la discipline (chimie, philosophie, etc.)
 * @returns {Array} Tableau des grilles de cette discipline
 */
function obtenirGrillesParDiscipline(discipline) {
    return window.GRILLES_BIBLIOTHEQUE[discipline] || [];
}

/**
 * Obtenir la liste des disciplines disponibles pour les grilles
 * @returns {Array} Tableau des noms de disciplines
 */
function obtenirDisciplinesDisponiblesGrilles() {
    return Object.keys(window.GRILLES_BIBLIOTHEQUE).map(key => {
        // Capitaliser la première lettre
        return key.charAt(0).toUpperCase() + key.slice(1);
    });
}

// Exporter les fonctions
window.obtenirToutesLesGrillesBibliotheque = obtenirToutesLesGrillesBibliotheque;
window.obtenirGrillesParDiscipline = obtenirGrillesParDiscipline;
window.obtenirDisciplinesDisponiblesGrilles = obtenirDisciplinesDisponiblesGrilles;
