/* ===============================
   BIBLIOTHÈQUE D'ÉCHELLES DE PERFORMANCE
   ✅ CRÉATION (8 décembre 2025)

   Échelles de performance organisées par discipline
   Utilisées pour la bibliothèque partagée dans le gestionnaire d'échelles

   Structure par discipline:
   - Chimie
   - Philosophie
   - Mathématiques
   - Littérature
   - Biologie

   Licence: Creative Commons BY-NC-SA 4.0
   Auteur: Primo Primavera
   =============================== */

window.ECHELLES_BIBLIOTHEQUE = {
    // ===========================
    // CHIMIE
    // ===========================
    chimie: [
        {
            id: 'chimie-echelle-idme',
            nom: 'Échelle IDME (Chimie)',
            discipline: 'Chimie',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Échelle IDME adaptée pour l\'évaluation en chimie',
            niveaux: [
                {
                    id: 'idme-i',
                    code: 'I',
                    nom: 'Insuffisant',
                    min: 0,
                    max: 64,
                    valeur: 0.40
                },
                {
                    id: 'idme-d',
                    code: 'D',
                    nom: 'Développement',
                    min: 65,
                    max: 74,
                    valeur: 0.70
                },
                {
                    id: 'idme-m',
                    code: 'M',
                    nom: 'Maîtrisé',
                    min: 75,
                    max: 84,
                    valeur: 0.80
                },
                {
                    id: 'idme-e',
                    code: 'E',
                    nom: 'Étendu',
                    min: 85,
                    max: 100,
                    valeur: 0.90
                }
            ],
            config: {
                typeEchelle: 'autre',
                seuilReussite: 60,
                notePassage: 'D',
                codesPersonnalises: ''
            },
            dansBibliotheque: false
        }
    ],

    // ===========================
    // PHILOSOPHIE
    // ===========================
    philosophie: [
        {
            id: 'philo-echelle-idme',
            nom: 'Échelle IDME (Philosophie)',
            discipline: 'Philosophie',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Échelle IDME pour l\'analyse philosophique',
            niveaux: [
                {
                    id: 'idme-i',
                    code: 'I',
                    nom: 'Insuffisant',
                    min: 0,
                    max: 64,
                    valeur: 0.40
                },
                {
                    id: 'idme-d',
                    code: 'D',
                    nom: 'Développement',
                    min: 65,
                    max: 74,
                    valeur: 0.70
                },
                {
                    id: 'idme-m',
                    code: 'M',
                    nom: 'Maîtrisé',
                    min: 75,
                    max: 84,
                    valeur: 0.80
                },
                {
                    id: 'idme-e',
                    code: 'E',
                    nom: 'Étendu',
                    min: 85,
                    max: 100,
                    valeur: 0.90
                }
            ],
            config: {
                typeEchelle: 'autre',
                seuilReussite: 60,
                notePassage: 'D',
                codesPersonnalises: ''
            },
            dansBibliotheque: false
        }
    ],

    // ===========================
    // MATHÉMATIQUES
    // ===========================
    mathematiques: [
        {
            id: 'math-echelle-idme',
            nom: 'Échelle IDME (Mathématiques)',
            discipline: 'Mathématiques',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Échelle IDME pour la résolution de problèmes mathématiques',
            niveaux: [
                {
                    id: 'idme-i',
                    code: 'I',
                    nom: 'Insuffisant',
                    min: 0,
                    max: 64,
                    valeur: 0.40
                },
                {
                    id: 'idme-d',
                    code: 'D',
                    nom: 'Développement',
                    min: 65,
                    max: 74,
                    valeur: 0.70
                },
                {
                    id: 'idme-m',
                    code: 'M',
                    nom: 'Maîtrisé',
                    min: 75,
                    max: 84,
                    valeur: 0.80
                },
                {
                    id: 'idme-e',
                    code: 'E',
                    nom: 'Étendu',
                    min: 85,
                    max: 100,
                    valeur: 0.90
                }
            ],
            config: {
                typeEchelle: 'autre',
                seuilReussite: 60,
                notePassage: 'D',
                codesPersonnalises: ''
            },
            dansBibliotheque: false
        }
    ],

    // ===========================
    // LITTÉRATURE
    // ===========================
    litterature: [
        {
            id: 'litt-echelle-idme',
            nom: 'Échelle IDME (Littérature)',
            discipline: 'Littérature',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Échelle IDME pour l\'analyse littéraire',
            niveaux: [
                {
                    id: 'idme-i',
                    code: 'I',
                    nom: 'Insuffisant',
                    min: 0,
                    max: 64,
                    valeur: 0.40
                },
                {
                    id: 'idme-d',
                    code: 'D',
                    nom: 'Développement',
                    min: 65,
                    max: 74,
                    valeur: 0.70
                },
                {
                    id: 'idme-m',
                    code: 'M',
                    nom: 'Maîtrisé',
                    min: 75,
                    max: 84,
                    valeur: 0.80
                },
                {
                    id: 'idme-e',
                    code: 'E',
                    nom: 'Étendu',
                    min: 85,
                    max: 100,
                    valeur: 0.90
                }
            ],
            config: {
                typeEchelle: 'autre',
                seuilReussite: 60,
                notePassage: 'D',
                codesPersonnalises: ''
            },
            dansBibliotheque: false
        }
    ],

    // ===========================
    // BIOLOGIE
    // ===========================
    biologie: [
        {
            id: 'bio-echelle-idme',
            nom: 'Échelle IDME (Biologie)',
            discipline: 'Biologie',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Échelle IDME pour l\'expérimentation en biologie',
            niveaux: [
                {
                    id: 'idme-i',
                    code: 'I',
                    nom: 'Insuffisant',
                    min: 0,
                    max: 64,
                    valeur: 0.40
                },
                {
                    id: 'idme-d',
                    code: 'D',
                    nom: 'Développement',
                    min: 65,
                    max: 74,
                    valeur: 0.70
                },
                {
                    id: 'idme-m',
                    code: 'M',
                    nom: 'Maîtrisé',
                    min: 75,
                    max: 84,
                    valeur: 0.80
                },
                {
                    id: 'idme-e',
                    code: 'E',
                    nom: 'Étendu',
                    min: 85,
                    max: 100,
                    valeur: 0.90
                }
            ],
            config: {
                typeEchelle: 'autre',
                seuilReussite: 60,
                notePassage: 'D',
                codesPersonnalises: ''
            },
            dansBibliotheque: false
        }
    ]
};

/**
 * Obtenir toutes les échelles de la bibliothèque (toutes disciplines)
 * @returns {Array} Tableau de toutes les échelles disponibles
 */
function obtenirToutesLesEchellesBibliotheque() {
    const toutes = [];
    Object.keys(window.ECHELLES_BIBLIOTHEQUE).forEach(discipline => {
        toutes.push(...window.ECHELLES_BIBLIOTHEQUE[discipline]);
    });
    return toutes;
}

/**
 * Obtenir les échelles d'une discipline spécifique
 * @param {string} discipline - Nom de la discipline (chimie, philosophie, etc.)
 * @returns {Array} Tableau des échelles de cette discipline
 */
function obtenirEchellesParDiscipline(discipline) {
    return window.ECHELLES_BIBLIOTHEQUE[discipline] || [];
}

/**
 * Obtenir la liste des disciplines disponibles pour les échelles
 * @returns {Array} Tableau des noms de disciplines
 */
function obtenirDisciplinesDisponiblesEchelles() {
    return Object.keys(window.ECHELLES_BIBLIOTHEQUE).map(key => {
        // Capitaliser la première lettre
        return key.charAt(0).toUpperCase() + key.slice(1);
    });
}

// Exporter les fonctions
window.obtenirToutesLesEchellesBibliotheque = obtenirToutesLesEchellesBibliotheque;
window.obtenirEchellesParDiscipline = obtenirEchellesParDiscipline;
window.obtenirDisciplinesDisponiblesEchelles = obtenirDisciplinesDisponiblesEchelles;
