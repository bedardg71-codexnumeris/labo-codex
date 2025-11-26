/**
 * PRATIQUES PRÉDÉFINIES - Modèles JSON de pratiques d'évaluation
 *
 * Ce fichier contient des configurations JSON complètes de pratiques
 * d'évaluation qui peuvent être importées dans l'application.
 *
 * Ces pratiques sont basées sur des systèmes réels utilisés par
 * des enseignant·es du réseau collégial.
 *
 * VERSION : 1.0
 * DATE : 25 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

// ============================================================================
// PRATIQUE 1 : PAN-Standards 5 niveaux (Bruno V.)
// ============================================================================

const PRATIQUE_PAN_STANDARDS_BRUNO = {
    id: 'pan-standards-bruno',
    nom: 'PAN-Standards (5 niveaux)',
    auteur: 'Bruno V.',
    etablissement: 'Cégep Laurendeau',
    description: 'Système à 5 niveaux avec reprises multiples, niveau non rétrogradable',
    discipline: 'Chimie',
    version: '1.0',
    date_creation: '2025-11-25',

    echelle: {
        type: 'niveaux',
        niveaux: [
            {
                code: '0',
                label: 'Données insuffisantes',
                description: 'Pas encore évalué ou travail très incomplet',
                valeur_numerique: 0,
                valeur_pourcentage: 0,
                couleur: '#CCCCCC',
                ordre: 0
            },
            {
                code: '1',
                label: 'En apprentissage',
                description: 'Ne respecte aucun critère essentiel',
                valeur_numerique: 1,
                valeur_pourcentage: 50,
                couleur: '#FF6B6B',
                ordre: 1
            },
            {
                code: '2',
                label: 'Ça y est presque!',
                description: 'Respecte au moins un critère essentiel',
                valeur_numerique: 2,
                valeur_pourcentage: 62.5,
                couleur: '#FFD93D',
                ordre: 2
            },
            {
                code: '3',
                label: 'Acquis',
                description: 'Tous critères essentiels respectés 3/4 du temps',
                valeur_numerique: 3,
                valeur_pourcentage: 75,
                couleur: '#6BCF7F',
                ordre: 3
            },
            {
                code: '4',
                label: 'Avancé',
                description: 'Tous critères respectés, erreurs mineures seulement',
                valeur_numerique: 4,
                valeur_pourcentage: 100,
                couleur: '#4D96FF',
                ordre: 4
            }
        ]
    },

    structure_evaluations: {
        type: 'standards',
        nombre_standards: 10,
        standards_terminaux: [7, 8, 9, 10],
        ponderation: 'egale'
    },

    calcul_note: {
        methode: 'conversion_niveaux',
        table_conversion: [
            { niveau_code: '0', note_pct: 0 },
            { niveau_code: '1', note_pct: 50 },
            { niveau_code: '2', note_pct: 62.5 },
            { niveau_code: '3', note_pct: 75 },
            { niveau_code: '4', note_pct: 100 }
        ],
        conditions_speciales: [
            {
                type: 'plafonnement',
                description: 'Si moyenne standards terminaux < 60%, note plafonnée à 55%',
                condition: {
                    cibles: [7, 8, 9, 10],
                    operation: 'moyenne',
                    comparateur: '<',
                    seuil: 60
                },
                consequence: {
                    action: 'plafonner',
                    valeur: 55
                }
            }
        ]
    },

    systeme_reprises: {
        type: 'illimitees',
        occasions_formelles: [
            { semaine: 8, duree_minutes: 50, description: 'Reprise mi-session' },
            { semaine: 14, duree_minutes: 50, description: 'Reprise avant finale' },
            { semaine: 16, duree_minutes: 180, description: 'Semaine d\'évaluations' }
        ],
        reprises_bureau: true,
        reprises_bureau_description: 'Entrevue individuelle aux heures de disponibilité',
        niveau_retrogradable: false
    },

    gestion_criteres: {
        type: 'par_standard',
        criteres_essentiels_obligatoires: true,
        description: 'Chaque standard a ses propres critères. Tous les critères essentiels doivent être respectés pour atteindre "Acquis".'
    },

    seuils: {
        type: 'niveau',
        niveau_acceptable: '3' // "Acquis"
    },

    interface: {
        afficher_notes_chiffrees: true,
        afficher_rang: false,
        afficher_moyenne_groupe: false,
        terminologie: {
            evaluation: 'Standard',
            critere: 'Critère',
            note_finale: 'Note finale',
            reprise: 'Reprise'
        }
    }
};

// ============================================================================
// PRATIQUE 2 : Sommative traditionnelle (Marie-Hélène L.)
// ============================================================================

const PRATIQUE_SOMMATIVE_TRADITIONNELLE = {
    id: 'sommative-traditionnelle-mhl',
    nom: 'Sommative traditionnelle',
    auteur: 'Marie-Hélène L.',
    etablissement: 'Cégep Valleyfield',
    description: 'Moyenne pondérée traditionnelle avec critères fixes',
    discipline: 'Littérature',
    version: '1.0',
    date_creation: '2025-11-25',

    echelle: {
        type: 'pourcentage',
        min: 0,
        max: 100,
        precision: 0.5
    },

    structure_evaluations: {
        type: 'evaluations_discretes',
        evaluations: [
            {
                nom: 'Analyse partielle',
                poids: 15,
                type: 'dissertation',
                obligatoire: true
            },
            {
                nom: 'Portfolio',
                poids: 20,
                type: 'portfolio',
                nombre_travaux_min: 5,
                nombre_travaux_max: 7
            },
            {
                nom: 'Travail équipe',
                poids: 15,
                type: 'travail_equipe'
            },
            {
                nom: 'Analyse finale',
                poids: 50,
                type: 'dissertation',
                double_verrou: true,
                seuil_reussite: 60
            }
        ]
    },

    calcul_note: {
        methode: 'moyenne_ponderee',
        formule: 'somme(note_i × poids_i) / 100',
        conditions_speciales: [
            {
                type: 'double_verrou',
                description: 'Analyse finale doit être réussie (≥60%) pour passer',
                condition: {
                    evaluation: 'Analyse finale',
                    comparateur: '<',
                    seuil: 60
                },
                consequence: {
                    action: 'echec',
                    note_max: 55
                }
            }
        ]
    },

    systeme_reprises: {
        type: 'aucune'
    },

    gestion_criteres: {
        type: 'fixes',
        criteres_fixes: [
            'Pertinence, justesse, clarté',
            'Qualité de la langue',
            'Respect de la structure',
            'Cohérence textuelle'
        ]
    },

    seuils: {
        type: 'pourcentage',
        va_bien: 75,
        difficulte: 65,
        grande_difficulte: 55
    },

    interface: {
        afficher_notes_chiffrees: true,
        afficher_rang: false,
        afficher_moyenne_groupe: true,
        terminologie: {
            evaluation: 'Évaluation',
            critere: 'Critère',
            note_finale: 'Note finale',
            reprise: 'Reprise'
        }
    }
};

// ============================================================================
// PRATIQUE 3 : PAN-Spécifications (François A.-H.)
// ============================================================================

const PRATIQUE_PAN_SPECIFICATIONS = {
    id: 'pan-specifications-fah',
    nom: 'PAN-Spécifications (notes fixes)',
    auteur: 'François A.-H.',
    etablissement: 'Cégep Laurendeau',
    description: 'Notes fixes (50, 60, 80, 100%) selon critères atteints',
    discipline: 'Chimie',
    version: '1.0',
    date_creation: '2025-11-25',

    echelle: {
        type: 'notes_fixes',
        notes_possibles: [50, 60, 80, 100]
    },

    structure_evaluations: {
        type: 'specifications',
        specifications: [
            {
                nom: 'Tests (2)',
                description: 'Réussir au moins 1 des 2 tests',
                requis_pour: [60, 80, 100]
            },
            {
                nom: 'Prise de position 1',
                description: 'Prise de position acceptable',
                requis_pour: [60, 80, 100]
            },
            {
                nom: 'Présentation découverte',
                description: 'Présentation acceptable',
                requis_pour: [60, 80, 100]
            },
            {
                nom: 'Tests (2)',
                description: 'Réussir les 2 tests',
                requis_pour: [80, 100]
            },
            {
                nom: 'Bilan portfolio',
                description: 'Bilan acceptable lors entrevue finale',
                requis_pour: [80, 100]
            },
            {
                nom: 'Prise de position 2',
                description: 'Deuxième prise de position acceptable',
                requis_pour: [100]
            },
            {
                nom: 'Bilan portfolio supérieur',
                description: 'Critères supérieurs lors entrevue',
                requis_pour: [100]
            }
        ]
    },

    calcul_note: {
        methode: 'specifications',
        description: 'Vérifier quelles spécifications sont remplies, déterminer la note la plus élevée accessible'
    },

    systeme_reprises: {
        type: 'illimitees',
        reprises_bureau: true,
        niveau_retrogradable: false
    },

    gestion_criteres: {
        type: 'par_evaluation',
        criteres_variables_description: 'Tests : exactitude. Prises de position : clarté + fiabilité sources.'
    },

    seuils: {
        type: 'pourcentage',
        va_bien: 60,
        difficulte: 50,
        grande_difficulte: 50
    },

    interface: {
        afficher_notes_chiffrees: true,
        afficher_rang: false,
        afficher_moyenne_groupe: false,
        terminologie: {
            evaluation: 'Spécification',
            critere: 'Critère',
            note_finale: 'Note finale',
            reprise: 'Reprise'
        }
    }
};

// ============================================================================
// PRATIQUE 4 : PAN-Maîtrise configurable (Grégoire Bédard)
// ============================================================================

const PRATIQUE_PAN_MAITRISE = {
    id: 'pan-maitrise-json',
    nom: 'PAN-Maîtrise (IDME + SRPNF)',
    auteur: 'Grégoire Bédard',
    etablissement: 'Cégep Drummond',
    description: 'Échelle IDME 4 niveaux, critères SRPNF, sélection des N meilleurs artefacts',
    discipline: 'Littérature',
    version: '1.0',
    date_creation: '2025-11-26',

    echelle: {
        type: 'niveaux',
        niveaux: [
            {
                code: 'I',
                label: 'Insuffisant',
                description: 'Compréhension superficielle ou incompréhension',
                valeur_numerique: 1,
                valeur_pourcentage: 50,
                couleur: '#FF6B6B',
                ordre: 1
            },
            {
                code: 'D',
                label: 'En développement',
                description: 'Points pertinents sans liens entre eux',
                valeur_numerique: 2,
                valeur_pourcentage: 70,
                couleur: '#FFD93D',
                ordre: 2
            },
            {
                code: 'M',
                label: 'Maîtrisé',
                description: 'Compréhension globale avec liens établis',
                valeur_numerique: 3,
                valeur_pourcentage: 80,
                couleur: '#6BCF7F',
                ordre: 3
            },
            {
                code: 'E',
                label: 'Étendu',
                description: 'Transfert à d\'autres contextes',
                valeur_numerique: 4,
                valeur_pourcentage: 92.5,
                couleur: '#4D96FF',
                ordre: 4
            }
        ]
    },

    structure_evaluations: {
        type: 'portfolio',
        description: 'Artefacts de portfolio évalués selon critères SRPNF',
        selection: 'n_meilleurs',
        n_artefacts_options: [3, 7, 12],
        n_artefacts_defaut: 7
    },

    calcul_note: {
        methode: 'conversion_niveaux',
        description: 'Moyenne des N meilleurs artefacts convertis en pourcentage',
        table_conversion: [
            { niveau_code: 'I', note_pct: 50 },
            { niveau_code: 'D', note_pct: 70 },
            { niveau_code: 'M', note_pct: 80 },
            { niveau_code: 'E', note_pct: 92.5 }
        ],
        conditions_speciales: []
    },

    systeme_reprises: {
        type: 'occasions_ponctuelles',
        description: 'Reprises possibles lors de séances dédiées',
        niveau_retrogradable: true
    },

    gestion_criteres: {
        type: 'fixes',
        criteres_fixes: [
            'Structure',
            'Rigueur',
            'Plausibilité',
            'Nuance',
            'Français'
        ],
        description: 'Critères SRPNF appliqués à chaque artefact'
    },

    seuils: {
        type: 'pourcentage',
        va_bien: 85,
        difficulte: 80,
        grande_difficulte: 70,
        description: 'Seuils basés sur l\'échelle IDME'
    },

    interface: {
        afficher_notes_chiffrees: true,
        afficher_rang: false,
        afficher_moyenne_groupe: true,
        terminologie: {
            evaluation: 'Artefact',
            critere: 'Critère',
            note_finale: 'Note finale',
            reprise: 'Reprise'
        }
    }
};

// ============================================================================
// EXPORTS
// ============================================================================

window.PRATIQUES_PREDEFINES = {
    PRATIQUE_PAN_MAITRISE,
    PRATIQUE_PAN_STANDARDS_BRUNO,
    PRATIQUE_SOMMATIVE_TRADITIONNELLE,
    PRATIQUE_PAN_SPECIFICATIONS
};

console.log('✅ Module pratiques-predefines.js chargé');
console.log(`   • ${Object.keys(window.PRATIQUES_PREDEFINES).length} pratiques disponibles`);
