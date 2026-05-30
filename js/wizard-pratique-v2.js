/**
 * WIZARD PRATIQUE V2
 * Wizard de création de pratique de notation aligné sur l'architecture Beta 95
 *
 * ÉCRITURES pratiquesConfigurables : création et modification via wizard
 *
 * Structure :
 * 1. Définition des étapes (ETAPES_WIZARD)
 * 2. Gestion de la navigation (suivant, précédent, saut conditionnel)
 * 3. Affichage dynamique selon branche
 * 4. Validation et sauvegarde
 *
 * @version 2.0.0
 * @date 26 décembre 2025
 */

(function() {
'use strict';

// ============================================================================
// ÉTAT DU WIZARD
// ============================================================================

/**
 * État global du wizard
 */
const wizardState = {
    etapeActuelle: 'infos-base',
    historique: [],          // Pile des étapes visitées pour navigation arrière
    reponses: {},            // Réponses collectées à chaque étape
    modeEdition: false,      // true si modification d'une pratique existante
    pratiqueId: null         // ID de la pratique en édition (null si création)
};

// ============================================================================
// DÉFINITION DES ÉTAPES
// ============================================================================

/**
 * Configuration de toutes les étapes du wizard
 * Chaque étape définit son contenu, sa validation et sa navigation
 */
const ETAPES_WIZARD = {
    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPES COMMUNES
    // ─────────────────────────────────────────────────────────────────────────

    'infos-base': {
        id: 'infos-base',
        titre: 'Informations de base',
        description: 'Ces informations servent à identifier ta pratique et à générer la licence Creative Commons (CC BY-NC-SA 4.0) pour le partage.',
        branche: 'commune',
        ordre: 1,
        champs: [
            { id: 'nom', label: 'Nom de la pratique', type: 'text', required: true, placeholder: 'Ex: Ma pratique de notation' },
            { id: 'auteur-row', type: 'row', champs: [
                { id: 'prenom', label: 'Prénom', type: 'text', required: true, placeholder: 'Prénom' },
                { id: 'nomAuteur', label: 'Nom', type: 'text', required: true, placeholder: 'Nom' }
            ]},
            { id: 'etablissement', label: 'Établissement', type: 'text', required: true, placeholder: 'Ex: Cégep de Drummondville' },
            { id: 'discipline', label: 'Discipline', type: 'select-disciplines', required: true },
            { id: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Décris brièvement ta pratique (optionnel)' },
            { id: 'infoCC', type: 'info', texte: 'Le partage n\'est pas obligatoire, mais ces informations permettent de protéger ton travail sous licence Creative Commons (CC BY-NC-SA 4.0) et d\'en attribuer la création si tu choisis de le partager.' }
        ],
        suivant: () => 'calcul-note-finale',
        precedent: () => null
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CLASSIFICATION COMPORTEMENTALE (Q1-Q5)
    // Remplace l'ancien type-pratique par des questions concrètes
    // ─────────────────────────────────────────────────────────────────────────

    'calcul-note-finale': {
        id: 'calcul-note-finale',
        titre: 'Comment calcules-tu la note finale ?',
        description: 'Cette question nous aide à identifier le type de pratique qui correspond à ta méthode.',
        branche: 'commune',
        ordre: 2,
        champs: [
            {
                id: 'calcNoteFinale',
                type: 'radio-cards',
                required: true,
                options: [
                    {
                        value: 'moyenne',
                        label: 'Moyenne pondérée des évaluations',
                        description: 'La note finale est calculée à partir de la moyenne des notes obtenues aux différentes évaluations, chacune ayant un poids.'
                    },
                    {
                        value: 'niveaux',
                        label: 'Niveaux de maîtrise (ex: I-D-M-E, A-B-C-D)',
                        description: 'Tu utilises une échelle de niveaux pour évaluer la maîtrise des apprentissages, puis convertis en note.'
                    },
                    {
                        value: 'acceptable',
                        label: 'Acceptable / Non acceptable avec forfaits',
                        description: 'Chaque travail est jugé acceptable ou non. La note finale dépend du nombre de spécifications réussies.'
                    },
                    {
                        value: 'pas-certain',
                        label: 'Je ne suis pas certain(e)',
                        description: 'Des questions supplémentaires t\'aideront à identifier ta méthode.'
                    }
                ]
            }
        ],
        suivant: (reponses) => {
            if (reponses.calcNoteFinale === 'moyenne') return 'regles-sommative';
            if (reponses.calcNoteFinale === 'niveaux') return 'approche-evaluation';
            if (reponses.calcNoteFinale === 'acceptable') return 'nb-evaluations';
            if (reponses.calcNoteFinale === 'pas-certain') return 'sous-questions-guidees';
            return null;
        },
        precedent: () => 'infos-base'
    },

    'sous-questions-guidees': {
        id: 'sous-questions-guidees',
        titre: 'Identifions ta méthode',
        description: 'Choisis l\'énoncé qui décrit le mieux ta pratique de notation.',
        branche: 'commune',
        ordre: 2,
        champs: [
            {
                id: 'calcNoteFinale',
                type: 'radio-cards',
                required: true,
                options: [
                    {
                        value: 'moyenne',
                        label: 'Je calcule une moyenne de pourcentages',
                        description: 'Chaque évaluation vaut un certain pourcentage de la note finale (ex: examen 30%, travail 20%). Je fais la somme pondérée.'
                    },
                    {
                        value: 'niveaux',
                        label: 'J\'attribue des niveaux de maîtrise',
                        description: 'J\'utilise des échelons comme A-B-C-D, 1-2-3-4 ou I-D-M-E pour évaluer chaque apprentissage, puis je convertis en note.'
                    },
                    {
                        value: 'acceptable',
                        label: 'Je vérifie si des critères sont réussis ou non',
                        description: 'Chaque travail est acceptable ou non. La note dépend du nombre de critères/spécifications satisfaits.'
                    }
                ]
            }
        ],
        suivant: (reponses) => {
            if (reponses.calcNoteFinale === 'moyenne') return 'regles-sommative';
            if (reponses.calcNoteFinale === 'niveaux') return 'approche-evaluation';
            if (reponses.calcNoteFinale === 'acceptable') return 'nb-evaluations';
            return null;
        },
        precedent: () => 'calcul-note-finale'
    },

    'regles-sommative': {
        id: 'regles-sommative',
        titre: 'Utilises-tu des règles spéciales ?',
        description: 'Sélectionne toutes les règles qui s\'appliquent à ta pratique de notation.',
        branche: 'sommative',
        ordre: 3,
        champs: [
            {
                id: 'reglesSommatives',
                type: 'checkbox-cards',
                required: true,
                options: [
                    {
                        value: 'remplacement',
                        label: 'Remplacement automatique',
                        description: 'L\'évaluation finale remplace la mi-session si la note est supérieure.'
                    },
                    {
                        value: 'double_verrou',
                        label: 'Verrou sur une évaluation',
                        description: 'Une évaluation spécifique (ex: la finale) doit être réussie pour passer le cours.'
                    },
                    {
                        value: 'portfolio',
                        label: 'Portfolio de progression',
                        description: 'Un portfolio d\'artefacts contribue à la note, avec progression prise en compte.'
                    },
                    {
                        value: 'plafonnement',
                        label: 'Plafonnement conditionnel',
                        description: 'La note est plafonnée si certaines conditions ne sont pas remplies.'
                    },
                    {
                        value: 'aucune',
                        label: 'Aucune règle spéciale',
                        description: 'Moyenne pondérée classique sans règle particulière.',
                        exclusive: true
                    }
                ]
            }
        ],
        suivant: () => 'nb-evaluations',
        precedent: () => 'calcul-note-finale'
    },

    'nb-evaluations': {
        id: 'nb-evaluations',
        titre: 'Nombre d\'évaluations',
        description: 'Combien d\'évaluations prévois-tu pour cette session ?',
        branche: 'commune',
        ordre: 4,
        champs: [
            {
                id: 'nbEvaluationsPrevues',
                label: 'Nombre d\'évaluations prévues',
                type: 'number',
                min: 1,
                max: 50,
                default: 6,
                required: true
            }
        ],
        suivant: () => 'seuils-personnels',
        precedent: (reponses) => {
            if (reponses.calcNoteFinale === 'moyenne') return 'regles-sommative';
            if (reponses.calcNoteFinale === 'niveaux') return 'approche-evaluation';
            return 'calcul-note-finale';
        }
    },

    'seuils-personnels': {
        id: 'seuils-personnels',
        titre: 'Tes seuils personnels',
        description: 'Ces seuils servent au dépistage automatique des étudiants en difficulté.',
        branche: 'commune',
        ordre: 5,
        champs: [
            {
                id: 'seuilVaBien',
                label: 'Ça va bien à partir de (%)',
                type: 'number',
                min: 0,
                max: 100,
                default: 75,
                required: true
            },
            {
                id: 'seuilDifficulte',
                label: 'En difficulté à partir de (%)',
                type: 'number',
                min: 0,
                max: 100,
                default: 65,
                required: true
            },
            {
                id: 'seuilGrandeDifficulte',
                label: 'Grande difficulté sous (%)',
                type: 'number',
                min: 0,
                max: 100,
                default: 55,
                required: true
            }
        ],
        suivant: (reponses) => {
            const classification = deduireTypePratique(reponses);
            const type = classification.type;
            const regles = classification.regles || [];
            // Sommative avec règles spéciales → configurer les règles
            if (type === 'sommative' && regles.length > 0 && !regles.includes('aucune')) {
                return 'config-sommative-regles';
            }
            if (type === 'sommative') return 'config-sommative';
            if (type === 'pan-standards') {
                if (reponses.approcheEvaluation === 'par-objectifs') return 'config-objectifs-definition';
                if (reponses.approcheEvaluation === 'par-artefacts') return 'config-portfolio';
                return 'mode-calcul-objectifs';
            }
            if (type === 'pan-specifications') return 'config-specifications';
            return 'recapitulatif';
        },
        precedent: () => 'nb-evaluations'
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 2 : ENRICHISSEMENT DE LA CAPTURE
    // ─────────────────────────────────────────────────────────────────────────

    'config-sommative-regles': {
        id: 'config-sommative-regles',
        titre: 'Configuration des règles spéciales',
        description: 'Précise les détails de tes règles de notation.',
        branche: 'sommative',
        ordre: 6,
        champs: [],
        getChampsDynamiques: (reponses) => {
            const regles = reponses.reglesSommatives || [];
            const champs = [];

            if (regles.includes('remplacement')) {
                champs.push({
                    id: 'infoRemplacement',
                    type: 'info',
                    texte: 'Remplacement automatique : l\'évaluation finale remplace l\'initiale si la note est supérieure.'
                });
                champs.push({
                    id: 'nbPairesRemplacement',
                    label: 'Nombre de paires d\'évaluations avec remplacement',
                    type: 'number',
                    min: 1,
                    max: 10,
                    default: 2,
                    required: true
                });
            }

            if (regles.includes('double_verrou')) {
                champs.push({
                    id: 'infoVerrou',
                    type: 'info',
                    texte: 'Verrou : une évaluation doit être réussie pour que la note finale dépasse un plafond.'
                });
                champs.push({
                    id: 'nomEvalVerrouillee',
                    label: 'Nom de l\'évaluation verrouillée',
                    type: 'text',
                    placeholder: 'Ex: Analyse finale',
                    required: true
                });
                champs.push({
                    id: 'seuilVerrou',
                    label: 'Seuil minimum requis (%)',
                    type: 'number',
                    min: 0,
                    max: 100,
                    default: 60,
                    required: true
                });
                champs.push({
                    id: 'plafondVerrou',
                    label: 'Note maximale si seuil non atteint (%)',
                    type: 'number',
                    min: 0,
                    max: 100,
                    default: 55,
                    required: true
                });
            }

            if (regles.includes('portfolio')) {
                champs.push({
                    id: 'infoPortfolio',
                    type: 'info',
                    texte: 'Portfolio de progression : les artefacts contribuent à la note avec prise en compte de la progression.'
                });
                champs.push({
                    id: 'nbArtefactsPortfolio',
                    label: 'Nombre d\'artefacts dans le portfolio',
                    type: 'number',
                    min: 1,
                    max: 20,
                    default: 5,
                    required: true
                });
                champs.push({
                    id: 'portfolioQualitatif',
                    label: 'Portfolio qualitatif (sans note chiffrée) ?',
                    type: 'toggle',
                    default: false
                });
            }

            if (regles.includes('plafonnement')) {
                champs.push({
                    id: 'infoPlafonnement',
                    type: 'info',
                    texte: 'Plafonnement : la note est plafonnée si certaines conditions ne sont pas remplies.'
                });
                champs.push({
                    id: 'conditionPlafonnement',
                    label: 'Condition de plafonnement',
                    type: 'text',
                    placeholder: 'Ex: Moyenne des standards terminaux < 60%',
                    required: true
                });
                champs.push({
                    id: 'valeurPlafonnement',
                    label: 'Note maximale si condition remplie (%)',
                    type: 'number',
                    min: 0,
                    max: 100,
                    default: 55,
                    required: true
                });
            }

            return champs;
        },
        suivant: () => 'config-sommative',
        precedent: () => 'seuils-personnels'
    },

    'config-objectifs-definition': {
        id: 'config-objectifs-definition',
        titre: 'Définition des objectifs d\'apprentissage',
        description: 'Ajoute tes objectifs d\'apprentissage avec leurs pondérations. Les poids doivent totaliser 100%.',
        branche: 'pan-standards-objectifs',
        ordre: 6,
        champs: [
            {
                id: 'infoObjectifs',
                type: 'info',
                texte: 'Chaque objectif a un nom, un poids (%) et un type (fondamental, intégrateur ou transversal). Les objectifs intégrateurs sont les plus complexes et les plus importants.'
            },
            {
                id: 'nbObjectifs',
                label: 'Nombre d\'objectifs d\'apprentissage',
                type: 'number',
                min: 1,
                max: 30,
                default: 6,
                required: true
            },
            {
                id: 'infoObjectifsConfig',
                type: 'info',
                texte: 'La définition détaillée de chaque objectif (nom, poids, type) sera configurable dans Réglages → Ensembles d\'objectifs après la création de la pratique.'
            }
        ],
        suivant: () => 'mode-calcul-objectifs',
        precedent: () => 'seuils-personnels'
    },

    'config-reprises': {
        id: 'config-reprises',
        titre: 'Reprises',
        description: 'Configure les reprises pour tes évaluations.',
        branche: 'commune',
        ordre: 7,
        champs: [
            {
                id: 'reprisesPermisesGlobal',
                label: 'Reprises permises ?',
                type: 'toggle',
                default: false
            },
            {
                id: 'modeReprises',
                label: 'Mode de reprises',
                type: 'select',
                options: [
                    { value: 'illimite', label: 'Illimitées' },
                    { value: 'limite', label: 'Limitées' },
                    { value: 'non', label: 'Non permises' }
                ],
                default: 'non'
            },
            {
                id: 'nbMaxReprises',
                label: 'Nombre maximum de tentatives (si limitées)',
                type: 'number',
                min: 1,
                max: 10,
                default: 3
            }
        ],
        suivant: (reponses) => {
            if (reponses.typePratique === 'pan-standards' || reponses.typePratique === 'pan-specifications') {
                return 'echelle-performance';
            }
            return 'recapitulatif';
        },
        precedent: (reponses) => {
            if (reponses.typePratique === 'sommative') return 'config-sommative';
            if (reponses.typePratique === 'pan-standards') {
                if (reponses.approcheEvaluation === 'par-artefacts') return 'config-portfolio';
                return 'config-mode-calcul';
            }
            return 'choix-modele-bundles';
        }
    },

    'mode-configuration': {
        id: 'mode-configuration',
        titre: 'Mode de configuration',
        description: 'Comment souhaites-tu configurer ta pratique ?',
        branche: 'commune',
        ordre: 3,
        condition: (reponses) => reponses.typePratique !== 'sommative',
        champs: [
            {
                id: 'modeConfig',
                type: 'radio-cards',
                required: true,
                options: [
                    {
                        value: 'expert',
                        label: 'Mode Expert',
                        description: 'J\'ai une idée claire de ce que je veux. Configuration directe des paramètres.'
                    },
                    {
                        value: 'exploration',
                        label: 'Mode Exploration',
                        description: 'Guidez-moi étape par étape pour découvrir les options disponibles.'
                    }
                ]
            }
        ],
        suivant: (reponses) => {
            if (reponses.typePratique === 'pan-standards') return 'approche-evaluation';
            if (reponses.typePratique === 'pan-specifications') return 'config-specifications';
            return null;
        },
        precedent: () => 'type-pratique'
    },

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCHE SOMMATIVE
    // ─────────────────────────────────────────────────────────────────────────

    'config-sommative': {
        id: 'config-sommative',
        titre: 'Configuration sommative',
        description: 'Paramétrez l\'affichage des résultats',
        branche: 'sommative',
        ordre: 4,
        champs: [
            {
                id: 'afficherRang',
                label: 'Afficher le rang dans le groupe ?',
                type: 'toggle',
                default: false
            },
            {
                id: 'afficherMoyenneGroupe',
                label: 'Afficher la moyenne du groupe ?',
                type: 'toggle',
                default: true
            }
        ],
        suivant: () => 'recapitulatif',
        precedent: () => 'seuils-personnels'
    },

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCHE PAN-STANDARDS
    // ─────────────────────────────────────────────────────────────────────────

    'approche-evaluation': {
        id: 'approche-evaluation',
        titre: 'Approche d\'évaluation',
        description: 'Comment souhaites-tu structurer tes évaluations ?',
        branche: 'pan-standards',
        ordre: 4,
        champs: [
            {
                id: 'approcheEvaluation',
                type: 'radio-cards',
                required: true,
                options: [
                    {
                        value: 'par-artefacts',
                        label: 'Par artefacts (portfolio)',
                        description: 'Les étudiants soumettent des artefacts. La note finale est calculée à partir des N meilleurs artefacts.'
                    },
                    {
                        value: 'par-objectifs',
                        label: 'Par objectifs d\'apprentissage',
                        description: 'La note finale est calculée selon le niveau atteint pour chaque objectif d\'apprentissage.'
                    }
                ]
            }
        ],
        suivant: () => 'nb-evaluations',
        precedent: () => 'calcul-note-finale'
    },

    // --- Branche artefacts ---

    'config-portfolio': {
        id: 'config-portfolio',
        titre: 'Configuration du portfolio',
        description: 'Paramétrez la gestion des artefacts',
        branche: 'pan-standards-artefacts',
        ordre: 5,
        champs: [
            {
                id: 'utiliserPortfolio',
                label: 'Utiliser un portfolio ?',
                type: 'toggle',
                default: true
            },
            {
                id: 'nbArtefactsSoumis',
                label: 'Nombre d\'artefacts à soumettre',
                type: 'number',
                min: 1,
                max: 20,
                default: 12,
                required: true
            },
            // 🆕 #24 : Mode de sélection pour construction de la note
            {
                id: 'modeSelectionPortfolio',
                label: 'Construction de la note',
                type: 'select',
                options: [
                    { value: 'n_meilleurs', label: 'N meilleurs artefacts' },
                    { value: 'tous', label: 'Tous les artefacts' },
                    { value: 'derniers', label: 'N derniers artefacts' },
                    { value: 'hybride', label: 'Hybride (N meilleures + Obligatoires)' }
                ],
                default: 'n_meilleurs',
                required: true,
                aide: 'Hybride : combine N meilleures productions + productions obligatoires (ex: examen final). Configuration détaillée en Mode Expert.'
            },
            {
                id: 'nbArtefactsRetenus',
                label: 'Nombre d\'artefacts retenus pour la note finale',
                type: 'number',
                min: 1,
                max: 12,
                default: 7,
                required: true
            },
            {
                id: 'reprisesPermises',
                label: 'Reprises permises',
                type: 'select',
                options: [
                    { value: 'illimite', label: 'Illimitées' },
                    { value: 'limite', label: 'Limitées (configurer après)' },
                    { value: 'non', label: 'Non permises' }
                ],
                default: 'illimite'
            },
            {
                id: 'minAvantCalculFormatif',
                label: 'Minimum d\'artefacts avant calcul formatif',
                type: 'number',
                min: 0,
                max: 5,
                default: 3
            }
        ],
        suivant: () => 'echelle-performance',
        precedent: () => 'seuils-personnels'
    },

    // --- Branche objectifs ---

    'mode-calcul-objectifs': {
        id: 'mode-calcul-objectifs',
        titre: 'Mode de calcul',
        description: 'Comment la note finale sera-t-elle calculée à partir des objectifs ?',
        branche: 'pan-standards-objectifs',
        ordre: 5,
        champs: [
            {
                id: 'modeCalcul',
                type: 'radio-cards',
                required: true,
                options: [
                    {
                        value: 'comptage',
                        label: 'Comptage d\'objectifs',
                        description: 'Note = nombre d\'objectifs maîtrisés. Distingue objectifs essentiels vs complémentaires.'
                    },
                    {
                        value: 'moyenne-ponderee',
                        label: 'Moyenne pondérée',
                        description: 'Note = moyenne des niveaux × pondération par objectif.'
                    },
                    {
                        value: 'seuils-critiques',
                        label: 'Seuils critiques',
                        description: 'Tous les objectifs doivent atteindre un niveau minimum. Bonus pour niveau supérieur.'
                    },
                    {
                        value: 'holistique',
                        label: 'Holistique',
                        description: 'Suggestion statistique (mode/médiane/moyenne) + jugement professionnel.'
                    }
                ]
            }
        ],
        suivant: (reponses) => 'config-mode-calcul',
        precedent: () => 'seuils-personnels'
    },

    'config-mode-calcul': {
        id: 'config-mode-calcul',
        titre: 'Configuration du mode de calcul',
        description: 'Paramétrez les détails du calcul',
        branche: 'pan-standards-objectifs',
        ordre: 6,
        champs: [], // Champs dynamiques selon modeCalcul
        getChampsDynamiques: (reponses) => {
            if (reponses.modeCalcul === 'comptage') {
                return [
                    {
                        id: 'seuilMaitrise',
                        label: 'Seuil de maîtrise (%)',
                        type: 'number',
                        min: 50,
                        max: 100,
                        default: 75,
                        required: true
                    },
                    {
                        id: 'plafondSiEssentielNonMaitrise',
                        label: 'Plafond si objectif essentiel non maîtrisé (%)',
                        type: 'number',
                        min: 0,
                        max: 100,
                        default: 55
                    }
                ];
            }
            if (reponses.modeCalcul === 'moyenne-ponderee') {
                return [
                    {
                        id: 'infoPonderation',
                        type: 'info',
                        texte: 'Les pondérations par objectif seront configurables dans Réglages → Ensembles d\'objectifs après la création de la pratique.'
                    }
                ];
            }
            // ✅ CORRECTION (4 jan 2026) : Harmoniser avec les noms des formulaires Trimestre
            if (reponses.modeCalcul === 'seuils-critiques') {
                return [
                    {
                        id: 'seuilReussite',
                        label: 'Niveau minimum requis',
                        type: 'select',
                        options: [
                            { value: 'D', label: 'Développement (D)' },
                            { value: 'M', label: 'Maîtrise (M)' }
                        ],
                        default: 'M',
                        required: true
                    },
                    {
                        id: 'noteBaseReussite',
                        label: 'Note de base si tous au minimum (%)',
                        type: 'number',
                        min: 50,
                        max: 100,
                        default: 80
                    },
                    {
                        id: 'bonusParNiveau',
                        label: 'Bonus par objectif au niveau supérieur (%)',
                        type: 'number',
                        min: 0,
                        max: 10,
                        default: 3.33,
                        step: 0.01
                    }
                ];
            }
            if (reponses.modeCalcul === 'holistique') {
                return [
                    {
                        id: 'methodeSuggestion',
                        label: 'Méthode de suggestion',
                        type: 'select',
                        options: [
                            { value: 'mode', label: 'Mode (niveau le plus fréquent)' },
                            { value: 'mediane', label: 'Médiane' },
                            { value: 'moyenne', label: 'Moyenne arrondie' }
                        ],
                        default: 'mode'
                    },
                    {
                        id: 'infoJugement',
                        type: 'info',
                        texte: 'La note suggérée pourra être ajustée par jugement professionnel lors de l\'évaluation finale.'
                    }
                ];
            }
            return [];
        },
        suivant: () => 'echelle-performance',
        precedent: () => 'mode-calcul-objectifs'
    },

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCHE PAN-SPÉCIFICATIONS
    // ─────────────────────────────────────────────────────────────────────────

    'config-specifications': {
        id: 'config-specifications',
        titre: 'Configuration de base',
        description: 'Paramétrez le seuil d\'acceptabilité et les jetons',
        branche: 'pan-specifications',
        ordre: 4,
        champs: [
            {
                id: 'seuilAcceptabilite',
                label: 'Seuil d\'acceptabilité (%)',
                type: 'number',
                min: 50,
                max: 100,
                default: 100,
                required: true,
                help: '100% = toutes les spécifications doivent être respectées'
            },
            {
                id: 'utiliserJetons',
                label: 'Utiliser un système de jetons ?',
                type: 'toggle',
                default: true
            }
        ],
        suivant: (reponses) => {
            if (reponses.utiliserJetons) return 'config-jetons';
            return 'choix-modele-bundles';
        },
        precedent: () => 'seuils-personnels'
    },

    'config-jetons': {
        id: 'config-jetons',
        titre: 'Configuration des jetons',
        description: 'Paramétrez le système de jetons',
        branche: 'pan-specifications',
        ordre: 5,
        condition: (reponses) => reponses.utiliserJetons === true,
        champs: [
            {
                id: 'nbJetonsDelai',
                label: 'Nombre de jetons délai par étudiant',
                type: 'number',
                min: 0,
                max: 10,
                default: 3
            },
            {
                id: 'dureeDelaiJours',
                label: 'Durée du délai accordé (jours)',
                type: 'number',
                min: 1,
                max: 14,
                default: 3
            },
            {
                id: 'nbJetonsReprise',
                label: 'Nombre de jetons reprise par étudiant',
                type: 'number',
                min: 0,
                max: 10,
                default: 2
            }
        ],
        suivant: () => 'choix-modele-bundles',
        precedent: () => 'config-specifications'
    },

    'choix-modele-bundles': {
        id: 'choix-modele-bundles',
        titre: 'Forfaits de spécifications',
        description: 'Choisis un modèle prédéfini ou personnalise',
        branche: 'pan-specifications',
        ordre: 6,
        champs: [], // Champs dynamiques selon modeConfig
        getChampsDynamiques: (reponses) => {
            if (reponses.modeConfig === 'expert') {
                return [
                    {
                        id: 'infoExpert',
                        type: 'info',
                        texte: 'Les forfaits (bundles) de spécifications seront configurables dans Réglages → Pratique de notation après la création de la pratique.'
                    }
                ];
            }
            // Mode exploration
            return [
                {
                    id: 'modeleBundle',
                    type: 'radio-cards',
                    required: true,
                    options: [
                        {
                            value: 'sciences',
                            label: 'Modèle Sciences (recommandé)',
                            description: 'Forfaits progressifs avec reprises limitées. Idéal pour les disciplines scientifiques.'
                        },
                        {
                            value: 'simple',
                            label: 'Modèle Simple',
                            description: 'Un seul forfait pour tous les travaux. Configuration minimale.'
                        },
                        {
                            value: 'litterature',
                            label: 'Modèle Littérature',
                            description: 'Forfaits flexibles avec accent sur la révision. Idéal pour les disciplines littéraires.'
                        },
                        {
                            value: 'personnalise',
                            label: 'Personnalisé',
                            description: 'Crée tes propres forfaits de spécifications.'
                        }
                    ]
                }
            ];
        },
        suivant: () => 'recapitulatif',
        precedent: (reponses) => {
            if (reponses.utiliserJetons) return 'config-jetons';
            return 'config-specifications';
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPES FINALES (COMMUNES)
    // ─────────────────────────────────────────────────────────────────────────

    'echelle-performance': {
        id: 'echelle-performance',
        titre: 'Échelle de performance',
        description: 'Sélectionne l\'échelle à utiliser pour les évaluations',
        branche: 'finale',
        ordre: 7,
        condition: (reponses) => reponses.typePratique !== 'sommative',
        champs: [
            {
                id: 'echelleId',
                type: 'select-echelle',
                required: true,
                label: 'Échelle de performance'
            }
        ],
        suivant: () => 'grille-criteres',
        precedent: (reponses) => {
            if (reponses.typePratique === 'pan-standards') {
                if (reponses.approcheEvaluation === 'par-artefacts') return 'config-portfolio';
                return 'config-mode-calcul';
            }
            return 'choix-modele-bundles';
        }
    },

    'grille-criteres': {
        id: 'grille-criteres',
        titre: 'Grille de critères',
        description: 'Sélectionne la grille de critères pour l\'évaluation et le dépistage',
        branche: 'finale',
        ordre: 8,
        condition: (reponses) => reponses.typePratique !== 'sommative',
        champs: [
            {
                id: 'grilleId',
                type: 'select-grille',
                required: false,
                label: 'Grille de critères (optionnel)'
            },
            {
                id: 'infoGrille',
                type: 'info',
                texte: 'La grille peut également être configurée plus tard dans Réglages → Critères d\'évaluation.'
            }
        ],
        suivant: () => 'recapitulatif',
        precedent: () => 'echelle-performance'
    },

    'recapitulatif': {
        id: 'recapitulatif',
        titre: 'Récapitulatif',
        description: 'Vérifie tes choix avant de créer la pratique',
        branche: 'finale',
        ordre: 9,
        champs: [], // Généré dynamiquement
        suivant: () => null, // Fin du wizard
        precedent: (reponses) => {
            if (reponses.typePratique === 'sommative') return 'config-sommative';
            if (reponses.typePratique === 'pan-specifications') return 'choix-modele-bundles';
            // PAN-Standards
            if (reponses.approcheEvaluation === 'par-artefacts') return 'grille-criteres';
            return 'grille-criteres';
        }
    }
};

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Obtient l'étape suivante en fonction des réponses
 * @param {string} etapeActuelle - ID de l'étape actuelle
 * @param {Object} reponses - Réponses collectées
 * @returns {string|null} - ID de l'étape suivante ou null si fin
 */
function obtenirEtapeSuivante(etapeActuelle, reponses) {
    const etape = ETAPES_WIZARD[etapeActuelle];
    if (!etape || !etape.suivant) return null;

    const prochaine = etape.suivant(reponses);

    // Vérifier si l'étape suivante a une condition qui n'est pas remplie
    if (prochaine && ETAPES_WIZARD[prochaine]) {
        const etapeSuivante = ETAPES_WIZARD[prochaine];
        if (etapeSuivante.condition && !etapeSuivante.condition(reponses)) {
            // Sauter cette étape et passer à la suivante
            return obtenirEtapeSuivante(prochaine, reponses);
        }
    }

    return prochaine;
}

/**
 * Obtient l'étape précédente en fonction des réponses
 * @param {string} etapeActuelle - ID de l'étape actuelle
 * @param {Object} reponses - Réponses collectées
 * @returns {string|null} - ID de l'étape précédente ou null si début
 */
function obtenirEtapePrecedente(etapeActuelle, reponses) {
    const etape = ETAPES_WIZARD[etapeActuelle];
    if (!etape || !etape.precedent) return null;

    const precedente = etape.precedent(reponses);

    // Vérifier si l'étape précédente a une condition qui n'est pas remplie
    if (precedente && ETAPES_WIZARD[precedente]) {
        const etapePrecedente = ETAPES_WIZARD[precedente];
        if (etapePrecedente.condition && !etapePrecedente.condition(reponses)) {
            // Sauter cette étape et passer à la précédente
            return obtenirEtapePrecedente(precedente, reponses);
        }
    }

    return precedente;
}

/**
 * Passe à l'étape suivante
 */
function etapeSuivanteV2() {
    // Valider l'étape actuelle
    if (!validerEtape(wizardState.etapeActuelle)) {
        return;
    }

    // Sauvegarder les réponses
    sauvegarderReponsesEtape(wizardState.etapeActuelle);

    // Auto-déduire le type de pratique après les étapes de classification
    const etapesClassification = ['calcul-note-finale', 'sous-questions-guidees', 'regles-sommative', 'approche-evaluation'];
    if (etapesClassification.includes(wizardState.etapeActuelle)) {
        const classification = deduireTypePratique(wizardState.reponses);
        wizardState.reponses.typePratique = classification.type;
        wizardState.reponses.typeVariante = classification.variante;
        if (!wizardState.reponses.modeConfig) {
            wizardState.reponses.modeConfig = 'exploration';
        }
    }

    // Obtenir l'étape suivante
    const suivante = obtenirEtapeSuivante(wizardState.etapeActuelle, wizardState.reponses);

    if (suivante) {
        // Ajouter l'étape actuelle à l'historique
        wizardState.historique.push(wizardState.etapeActuelle);
        wizardState.etapeActuelle = suivante;
        afficherEtapeWizardV2(suivante);
    } else {
        // Fin du wizard - créer la pratique
    }
}

/**
 * Retourne à l'étape précédente
 */
function etapePrecedenteV2() {
    // Utiliser l'historique pour la navigation arrière
    if (wizardState.historique.length > 0) {
        const precedente = wizardState.historique.pop();
        wizardState.etapeActuelle = precedente;
        afficherEtapeWizardV2(precedente);
    }
}

/**
 * Calcule le nombre total d'étapes pour le parcours actuel
 * @returns {number} - Nombre total d'étapes
 */
function calculerNbEtapes() {
    const reponses = wizardState.reponses;
    // Base: infos-base, calcul-note-finale, nb-evaluations, seuils-personnels, recapitulatif
    let count = 5;

    if (reponses.calcNoteFinale === 'pas-certain') {
        count++; // sous-questions-guidees
    }

    if (reponses.typePratique === 'sommative') {
        count++; // regles-sommative
        count++; // config-sommative
        return count;
    }

    if (reponses.typePratique === 'pan-standards') {
        count++; // approche-evaluation
        if (reponses.approcheEvaluation === 'par-artefacts') {
            count += 3; // config-portfolio, echelle-performance, grille-criteres
        } else {
            count += 4; // mode-calcul-objectifs, config-mode-calcul, echelle-performance, grille-criteres
        }
    } else if (reponses.typePratique === 'pan-specifications') {
        count++; // config-specifications
        if (reponses.utiliserJetons) count++; // config-jetons
        count++; // choix-modele-bundles
    }

    return count;
}

/**
 * Calcule le numéro de l'étape actuelle
 * @returns {number} - Numéro de l'étape (1-indexed)
 */
function calculerNumeroEtape() {
    return wizardState.historique.length + 1;
}

// ============================================================================
// AFFICHAGE
// ============================================================================

/**
 * Affiche une étape du wizard V2
 * @param {string} etapeId - ID de l'étape à afficher
 */
function afficherEtapeWizardV2(etapeId) {
    const etape = ETAPES_WIZARD[etapeId];
    if (!etape) {
        console.error('[WizardV2] Étape inconnue:', etapeId);
        return;
    }


    // Mettre à jour le titre et la description
    const titreEl = document.getElementById('wizard-v2-titre');
    if (titreEl) titreEl.textContent = etape.titre;

    const descEl = document.getElementById('wizard-v2-description');
    if (descEl) descEl.textContent = etape.description || '';

    // Mettre à jour la progression
    mettreAJourProgression();

    // Générer le contenu
    const contenu = genererContenuEtape(etape);

    const conteneurContenu = document.getElementById('wizard-v2-contenu');

    if (conteneurContenu) {
        conteneurContenu.innerHTML = contenu;
    } else {
        console.error('[WizardV2] Conteneur #wizard-v2-contenu non trouvé !');
    }

    // Restaurer les valeurs précédentes si elles existent
    restaurerValeursEtape(etapeId);

    // Mettre à jour les boutons
    mettreAJourBoutons();
}

/**
 * Génère le contenu HTML pour une étape
 * @param {Object} etape - Configuration de l'étape
 * @returns {string} - HTML du contenu
 */
function genererContenuEtape(etape) {

    if (etape.id === 'recapitulatif') {
        return genererRecapitulatif();
    }

    // Obtenir les champs (statiques ou dynamiques)
    let champs = etape.champs || [];

    if (etape.getChampsDynamiques) {
        champs = etape.getChampsDynamiques(wizardState.reponses);
    }

    let html = '<div class="wizard-v2-champs">';

    champs.forEach((champ, index) => {
        const champHtml = genererChamp(champ);
        html += champHtml;
    });

    html += '</div>';
    return html;
}

/**
 * Génère le HTML pour un champ
 * @param {Object} champ - Configuration du champ
 * @returns {string} - HTML du champ
 */
function genererChamp(champ) {
    switch (champ.type) {
        case 'text':
            return genererChampTexte(champ);
        case 'textarea':
            return genererChampTextarea(champ);
        case 'number':
            return genererChampNumber(champ);
        case 'toggle':
            return genererChampToggle(champ);
        case 'select':
            return genererChampSelect(champ);
        case 'radio-cards':
            return genererRadioCards(champ);
        case 'checkbox-cards':
            return genererCheckboxCards(champ);
        case 'select-echelle':
            return genererSelectEchelle(champ);
        case 'select-grille':
            return genererSelectGrille(champ);
        case 'select-disciplines':
            return genererChampSelectDisciplines(champ);
        case 'row':
            return genererChampRow(champ);
        case 'info':
            return genererInfo(champ);
        default:
            console.warn('[WizardV2] Type de champ inconnu:', champ.type);
            return '';
    }
}

// Préfixe unique pour éviter conflits avec ancien wizard
const WIZARD_V2_ID_PREFIX = 'wizardv2-';

/**
 * Génère un champ texte
 */
function genererChampTexte(champ) {
    const required = champ.required ? 'required' : '';
    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}${champ.required ? ' *' : ''}</label>
            <input type="text"
                   id="${WIZARD_V2_ID_PREFIX}${champ.id}"
                   name="${champ.id}"
                   placeholder="${champ.placeholder || ''}"
                   ${required}>
        </div>
    `;
}

/**
 * 🆕 Beta 95.4 : Génère une rangée de champs côte à côte (2 colonnes)
 */
function genererChampRow(champ) {
    const champsHTML = champ.champs.map(sousChamp => {
        const required = sousChamp.required ? 'required' : '';
        return `
            <div class="wizard-v2-champ" style="flex: 1;">
                <label for="${WIZARD_V2_ID_PREFIX}${sousChamp.id}">${sousChamp.label}${sousChamp.required ? ' *' : ''}</label>
                <input type="text"
                       id="${WIZARD_V2_ID_PREFIX}${sousChamp.id}"
                       name="${sousChamp.id}"
                       placeholder="${sousChamp.placeholder || ''}"
                       ${required}>
            </div>
        `;
    }).join('');

    return `
        <div class="wizard-v2-row" style="display: flex; gap: 15px;">
            ${champsHTML}
        </div>
    `;
}

/**
 * Génère un champ textarea
 */
function genererChampTextarea(champ) {
    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}</label>
            <textarea id="${WIZARD_V2_ID_PREFIX}${champ.id}"
                      name="${champ.id}"
                      placeholder="${champ.placeholder || ''}"
                      rows="3"></textarea>
        </div>
    `;
}

/**
 * Génère un champ number
 */
function genererChampNumber(champ) {
    const step = champ.step || 1;
    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}${champ.required ? ' *' : ''}</label>
            <input type="number"
                   id="${WIZARD_V2_ID_PREFIX}${champ.id}"
                   name="${champ.id}"
                   min="${champ.min || 0}"
                   max="${champ.max || 100}"
                   step="${step}"
                   value="${champ.default || ''}">
            ${champ.help ? `<small class="wizard-v2-help">${champ.help}</small>` : ''}
        </div>
    `;
}

/**
 * Génère un champ toggle
 */
function genererChampToggle(champ) {
    const checked = champ.default ? 'checked' : '';
    return `
        <div class="wizard-v2-champ wizard-v2-toggle">
            <label class="toggle-label">
                <input type="checkbox"
                       id="${WIZARD_V2_ID_PREFIX}${champ.id}"
                       name="${champ.id}"
                       ${checked}>
                <span class="toggle-slider"></span>
                <span class="toggle-text">${champ.label}</span>
            </label>
        </div>
    `;
}

/**
 * Génère un champ select
 */
function genererChampSelect(champ) {
    let options = champ.options.map(opt => {
        const selected = opt.value === champ.default ? 'selected' : '';
        return `<option value="${echapperHtml(opt.value)}" ${selected}>${opt.label}</option>`;
    }).join('');

    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}</label>
            <select id="${WIZARD_V2_ID_PREFIX}${champ.id}" name="${champ.id}">
                ${options}
            </select>
        </div>
    `;
}

/**
 * Génère un champ select pour les disciplines (dropdown complet)
 * 🆕 Beta 95.4 : Utilise le même dropdown que le profil enseignant
 */
function genererChampSelectDisciplines(champ) {
    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}${champ.required ? ' *' : ''}</label>
            <select id="${WIZARD_V2_ID_PREFIX}${champ.id}" name="${champ.id}" class="controle-form" ${champ.required ? 'required' : ''}>
                <option value="">— Sélectionner —</option>
                <optgroup label="Sciences de la santé et techniques (100)">
                    <option value="101 Biologie">101 Biologie</option>
                    <option value="109 Éducation physique">109 Éducation physique</option>
                    <option value="180 Soins infirmiers">180 Soins infirmiers</option>
                </optgroup>
                <optgroup label="Sciences et techniques (200)">
                    <option value="201 Mathématique">201 Mathématique</option>
                    <option value="202 Chimie">202 Chimie</option>
                    <option value="203 Physique">203 Physique</option>
                </optgroup>
                <optgroup label="Sciences humaines (300)">
                    <option value="300 Sciences humaines">300 Sciences humaines</option>
                    <option value="305 Économique">305 Économique</option>
                    <option value="320 Géographie">320 Géographie</option>
                    <option value="330 Histoire">330 Histoire</option>
                    <option value="332 Civilisations anciennes">332 Civilisations anciennes</option>
                    <option value="340 Philosophie">340 Philosophie</option>
                    <option value="345 Humanities">345 Humanities</option>
                    <option value="350 Psychologie">350 Psychologie</option>
                    <option value="360 Science politique">360 Science politique</option>
                    <option value="370 Intervention sociale">370 Intervention sociale</option>
                    <option value="381 Anthropologie">381 Anthropologie</option>
                    <option value="383 Études religieuses">383 Études religieuses</option>
                    <option value="385 Sociologie">385 Sociologie</option>
                    <option value="387 Sexologie">387 Sexologie</option>
                </optgroup>
                <optgroup label="Administration (400)">
                    <option value="401 Gestion et administration">401 Gestion et administration</option>
                    <option value="410 Techniques de comptabilité et de gestion">410 Techniques de comptabilité et de gestion</option>
                    <option value="412 Techniques de bureautique">412 Techniques de bureautique</option>
                    <option value="420 Informatique">420 Informatique</option>
                </optgroup>
                <optgroup label="Arts (500)">
                    <option value="502 Danse">502 Danse</option>
                    <option value="504 Art et esthétique">504 Art et esthétique</option>
                    <option value="506 Cinéma">506 Cinéma</option>
                    <option value="510 Arts plastiques">510 Arts plastiques</option>
                    <option value="520 Histoire de l'art">520 Histoire de l'art</option>
                    <option value="530 Musique">530 Musique</option>
                    <option value="550 Esthétique industrielle">550 Esthétique industrielle</option>
                    <option value="551 Arts et technologies">551 Arts et technologies</option>
                    <option value="560 Théâtre">560 Théâtre</option>
                    <option value="570 Design">570 Design</option>
                    <option value="581 Création littéraire">581 Création littéraire</option>
                    <option value="582 Techniques professionnelles de musique et de chanson">582 Techniques professionnelles de musique et de chanson</option>
                    <option value="589 Communication">589 Communication</option>
                </optgroup>
                <optgroup label="Langues et littérature (600)">
                    <option value="601 Français (langue et littérature)">601 Français (langue et littérature)</option>
                    <option value="602 Anglais (langue seconde)">602 Anglais (langue seconde)</option>
                    <option value="603 Anglais (langue et littérature)">603 Anglais (langue et littérature)</option>
                    <option value="604 Français (langue seconde)">604 Français (langue seconde)</option>
                    <option value="607 Espagnol">607 Espagnol</option>
                    <option value="608 Italien">608 Italien</option>
                    <option value="609 Allemand">609 Allemand</option>
                    <option value="610 Langues autochtones">610 Langues autochtones</option>
                    <option value="613 Mandarin">613 Mandarin</option>
                    <option value="615 Russe">615 Russe</option>
                    <option value="618 Hébreu">618 Hébreu</option>
                    <option value="619 Multilingue">619 Multilingue</option>
                </optgroup>
            </select>
        </div>
    `;
}

/**
 * Génère des cartes radio
 */
function genererRadioCards(champ) {
    let cards = champ.options.map(opt => {
        const disabled = opt.disabled ? 'disabled' : '';
        const disabledClass = opt.disabled ? 'wizard-v2-card-disabled' : '';
        return `
            <label class="wizard-v2-radio-card ${disabledClass}">
                <input type="radio"
                       name="${champ.id}"
                       value="${echapperHtml(opt.value)}"
                       ${disabled}>
                <div class="wizard-v2-card-content">
                    <div class="wizard-v2-card-title">${opt.label}</div>
                    <div class="wizard-v2-card-description">${opt.description}</div>
                </div>
            </label>
        `;
    }).join('');

    return `
        <div class="wizard-v2-champ">
            <div class="wizard-v2-radio-cards">
                ${cards}
            </div>
        </div>
    `;
}

/**
 * Génère des cartes checkbox (multi-sélection)
 */
function genererCheckboxCards(champ) {
    let cards = champ.options.map(opt => {
        const exclusiveAttr = opt.exclusive ? 'data-exclusive="true"' : '';
        return `
            <label class="wizard-v2-radio-card wizard-v2-checkbox-card">
                <input type="checkbox"
                       name="${champ.id}"
                       value="${echapperHtml(opt.value)}"
                       ${exclusiveAttr}
                       data-action="wizardV2GererExclusionCheckbox">
                <div class="wizard-v2-card-content">
                    <div class="wizard-v2-card-title">${opt.label}</div>
                    <div class="wizard-v2-card-description">${opt.description}</div>
                </div>
            </label>
        `;
    }).join('');

    return `
        <div class="wizard-v2-champ">
            <div class="wizard-v2-radio-cards wizard-v2-checkbox-cards">
                ${cards}
            </div>
        </div>
    `;
}

/**
 * Génère un sélecteur d'échelle
 */
function genererSelectEchelle(champ) {
    // Récupérer les échelles existantes
    const echelles = db.getSync('echellesTemplates', []);

    if (echelles.length === 0) {
        return `
            <div class="wizard-v2-champ">
                <label>${champ.label}</label>
                <div class="wizard-v2-alerte">
                    Aucune échelle de performance n'a été créée.
                    Tu pourras en créer une dans Matériel → Échelles de performance.
                </div>
            </div>
        `;
    }

    let options = echelles.map(e => {
        const niveaux = e.niveaux ? e.niveaux.length : 0;
        return `<option value="${echapperHtml(e.id)}">${e.nom || 'Sans nom'} (${niveaux} niveaux)</option>`;
    }).join('');

    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}</label>
            <select id="${WIZARD_V2_ID_PREFIX}${champ.id}" name="${champ.id}">
                <option value="">-- Sélectionner une échelle --</option>
                ${options}
            </select>
        </div>
    `;
}

/**
 * Génère un sélecteur de grille
 */
function genererSelectGrille(champ) {
    // Récupérer les grilles existantes
    const grilles = db.getSync('grillesTemplates', []);

    if (grilles.length === 0) {
        return `
            <div class="wizard-v2-champ">
                <label>${champ.label}</label>
                <div class="wizard-v2-info-block" style="flex-direction: column; align-items: stretch;">
                    <p style="margin: 0 0 10px 0;">Aucune grille de critères n'a été créée. Tu peux en générer une de base pour commencer.</p>
                    <button type="button" class="wizard-v2-btn-demo-grille" data-action="wizardV2CreerGrilleDemo" style="
                        background: var(--bleu-principal, #4A90D9);
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        align-self: flex-start;
                    ">Créer une grille de base (4\u00a0critères)</button>
                    <p style="margin: 8px 0 0 0; font-size: 0.8rem; color: var(--gris-moyen, #888);">Tu pourras la modifier plus tard dans Matériel → Critères d'évaluation.</p>
                </div>
            </div>
        `;
    }

    let options = grilles.map(g => {
        const criteres = g.criteres ? g.criteres.length : 0;
        return `<option value="${echapperHtml(g.id)}">${g.nom || 'Sans nom'} (${criteres} critères)</option>`;
    }).join('');

    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}</label>
            <select id="${WIZARD_V2_ID_PREFIX}${champ.id}" name="${champ.id}">
                <option value="">-- Aucune grille (configurer plus tard) --</option>
                ${options}
            </select>
        </div>
    `;
}

/**
 * Crée une grille de critères démo (4 critères de base) et rafraîchit l'affichage
 */
function wizardV2CreerGrilleDemo() {
    const grilleDemo = {
        id: genererIdUnique('GRILLE_'),
        nom: 'Grille de base',
        description: 'Grille générique créée par le wizard. Modifiable dans Matériel → Critères.',
        criteres: [
            { id: 'c1', nom: 'Compréhension du sujet', description: 'Démontrer une compréhension juste du sujet traité.', poids: 25 },
            { id: 'c2', nom: 'Qualité de la démarche', description: 'Appliquer une démarche méthodique et rigoureuse.', poids: 25 },
            { id: 'c3', nom: 'Communication', description: 'Présenter les résultats de façon claire et structurée.', poids: 25 },
            { id: 'c4', nom: 'Esprit critique', description: 'Porter un regard critique et nuancé sur la production.', poids: 25 }
        ],
        dateCreation: new Date().toISOString()
    };

    const grilles = db.getSync('grillesTemplates', []);
    grilles.push(grilleDemo);
    db.setSync('grillesTemplates', grilles);

    // Stocker l'ID pour pré-sélection
    wizardState.reponses.grilleId = grilleDemo.id;

    // Rafraîchir l'affichage de l'étape
    afficherEtapeV2(wizardState.etapeActuelle);
}

/**
 * Génère un bloc d'information
 */
function genererInfo(champ) {
    return `
        <div class="wizard-v2-champ">
            <div class="wizard-v2-info-block">
                <span class="wizard-v2-info-icon icone-inline icone-inline--info" aria-hidden="true"></span>
                <span>${champ.texte}</span>
            </div>
        </div>
    `;
}

/**
 * Génère le récapitulatif
 */
function genererRecapitulatif() {
    const r = wizardState.reponses;
    const classification = deduireTypePratique(r);
    let html = '<div class="wizard-v2-recapitulatif">';

    // ─── Section 1 : Diagnostic du type de notation (proéminent) ───
    const typeBadges = {
        'sommative': { code: 'SOM', couleur: '#4A90D9', label: 'Sommative', description: 'Ta note finale est calculée par une moyenne pondérée des évaluations. C\'est la méthode traditionnelle, largement utilisée.' },
        'pan-standards': { code: 'STD', couleur: '#E67E22', label: 'PAN \u2013 Standards', description: 'Tu évalues par niveaux de maîtrise (ex.\u00a0: I-D-M-E). La note est construite à partir de la démonstration de compétences, pas d\'une simple moyenne.' },
        'pan-specifications': { code: 'SPE', couleur: '#27AE60', label: 'PAN \u2013 Spécifications', description: 'Chaque travail est jugé acceptable ou non. La note finale dépend du nombre de spécifications réussies (forfaits).' }
    };
    const badge = typeBadges[classification.type] || { code: '?', couleur: '#888', label: 'Indéterminé', description: '' };

    html += `
        <div class="wizard-v2-recap-diagnostic" style="
            background: ${badge.couleur}12;
            border: 2px solid ${badge.couleur};
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            text-align: center;
        ">
            <div style="font-size: 0.85rem; color: var(--gris-moyen, #888); margin-bottom: 8px;">Ta pratique de notation a été identifiée comme</div>
            <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                <span style="
                    background: ${badge.couleur};
                    color: white;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    letter-spacing: 1px;
                ">${badge.code}</span>
                <span style="font-size: 1.2rem; font-weight: 600; color: ${badge.couleur};">${badge.label}</span>
            </div>
            <p style="font-size: 0.9rem; color: var(--texte-secondaire, #555); margin: 8px 0 0 0; max-width: 500px; margin-left: auto; margin-right: auto;">${badge.description}</p>
    `;
    if (classification.variante) {
        const varianteLabels = {
            'classique': 'Classique',
            'progressive': 'Avec remplacement progressif',
            'verrou': 'Avec verrou d\'évaluation',
            'portfolio': 'Avec portfolio',
            'plafonnement': 'Avec plafonnement conditionnel',
            'n-meilleurs': 'Par artefacts (N meilleurs)',
            'objectifs-ponderes': 'Par objectifs pondérés',
            'moyenne-ponderee': 'Moyenne pondérée des objectifs',
            'comptage': 'Comptage d\'objectifs',
            'seuils-critiques': 'Seuils critiques',
            'holistique': 'Holistique',
            'bundles': 'Forfaits de spécifications'
        };
        html += `<p style="font-size: 0.85rem; margin: 6px 0 0 0; color: var(--gris-moyen, #888);">Variante\u00a0: <strong>${varianteLabels[classification.variante] || classification.variante}</strong></p>`;
    }
    if (classification.regles && classification.regles.length > 0 && !classification.regles.includes('aucune')) {
        const reglesLabels = {
            'remplacement': 'Remplacement automatique',
            'double_verrou': 'Verrou d\'évaluation',
            'portfolio': 'Portfolio de progression',
            'plafonnement': 'Plafonnement conditionnel'
        };
        const reglesTexte = classification.regles.map(rl => reglesLabels[rl] || rl).join(', ');
        html += `<p style="font-size: 0.85rem; margin: 4px 0 0 0; color: var(--gris-moyen, #888);">Règles\u00a0: ${reglesTexte}</p>`;
    }
    html += '</div>';

    // ─── Section 2 : Nom de la pratique (modifiable) ───
    const nomActuel = r.nom || 'Ma pratique de notation';
    html += `
        <div class="wizard-v2-recap-section" style="margin-bottom: 16px;">
            <h4>Nom de la pratique</h4>
            <p style="font-size: 0.85rem; color: var(--gris-moyen, #888); margin: 0 0 8px 0;">Maintenant que tu connais ton type de notation, tu peux ajuster le nom si tu le souhaites.</p>
            <input type="text" id="wizard-v2-recap-nom" value="${nomActuel.replace(/"/g, '&quot;')}" style="
                width: 100%;
                padding: 10px 12px;
                border: 1px solid var(--bordure, #ddd);
                border-radius: 6px;
                font-size: 1rem;
                box-sizing: border-box;
            " placeholder="Ex\u00a0: ${badge.label} \u2013 Littérature H2026">
        </div>
    `;

    // ─── Section 3 : Informations de base ───
    html += '<div class="wizard-v2-recap-section">';
    html += '<h4>Informations de base</h4>';
    if (r.auteur) html += `<p><strong>Auteur\u00a0:</strong> ${r.auteur}</p>`;
    if (r.etablissement) html += `<p><strong>Établissement\u00a0:</strong> ${r.etablissement}</p>`;
    if (r.discipline) html += `<p><strong>Discipline\u00a0:</strong> ${r.discipline}</p>`;
    html += '</div>';

    // Section : Paramètres généraux
    if (r.nbEvaluationsPrevues || r.seuilVaBien) {
        html += '<div class="wizard-v2-recap-section">';
        html += '<h4>Paramètres généraux</h4>';
        if (r.nbEvaluationsPrevues) {
            html += `<p><strong>Évaluations prévues\u00a0:</strong> ${r.nbEvaluationsPrevues}</p>`;
        }
        if (r.seuilVaBien) {
            html += `<p><strong>Seuils\u00a0:</strong> Bien \u2265${r.seuilVaBien}% | Difficulté \u2264${r.seuilDifficulte}% | Grande difficulté &lt;${r.seuilGrandeDifficulte}%</p>`;
        }
        html += '</div>';
    }

    // Section spécifique selon le type
    if (r.typePratique === 'sommative') {
        html += '<div class="wizard-v2-recap-section">';
        html += '<h4>Configuration</h4>';
        html += `<p><strong>Afficher le rang\u00a0:</strong> ${r.afficherRang ? 'Oui' : 'Non'}</p>`;
        html += `<p><strong>Afficher la moyenne du groupe\u00a0:</strong> ${r.afficherMoyenneGroupe ? 'Oui' : 'Non'}</p>`;
        html += '</div>';
    }

    if (r.typePratique === 'pan-standards') {
        html += '<div class="wizard-v2-recap-section">';
        html += '<h4>Configuration PAN-Standards</h4>';
        const approcheLabels = {
            'par-artefacts': 'Par artefacts (portfolio)',
            'par-objectifs': 'Par objectifs d\'apprentissage'
        };
        html += `<p><strong>Approche\u00a0:</strong> ${approcheLabels[r.approcheEvaluation] || r.approcheEvaluation}</p>`;

        if (r.approcheEvaluation === 'par-artefacts') {
            const modalites = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
            const nbSoumis = modalites.nArtefactsPAN || r.nbArtefactsSoumis || '?';
            const nbRetenus = modalites.nArtefactsRetenus || r.nbArtefactsRetenus || '?';
            html += `<p><strong>Artefacts à soumettre\u00a0:</strong> ${nbSoumis}</p>`;
            html += `<p><strong>Artefacts retenus\u00a0:</strong> ${nbRetenus}</p>`;
            const modeSelectionLabels = {
                'n_meilleurs': 'N meilleurs artefacts',
                'tous': 'Tous les artefacts',
                'derniers': 'N derniers artefacts',
                'hybride': 'Hybride (N meilleures + Obligatoires)'
            };
            const modeSelection = r.modeSelectionPortfolio || 'n_meilleurs';
            html += `<p><strong>Construction de la note\u00a0:</strong> ${modeSelectionLabels[modeSelection] || modeSelection}</p>`;
        } else if (r.approcheEvaluation === 'par-objectifs') {
            const modeLabels = {
                'comptage': 'Comptage d\'objectifs',
                'moyenne-ponderee': 'Moyenne pondérée',
                'seuils-critiques': 'Seuils critiques',
                'holistique': 'Holistique'
            };
            html += `<p><strong>Mode de calcul\u00a0:</strong> ${modeLabels[r.modeCalcul] || r.modeCalcul}</p>`;
        }
        html += '</div>';
    }

    if (r.typePratique === 'pan-specifications') {
        html += '<div class="wizard-v2-recap-section">';
        html += '<h4>Configuration PAN-Spécifications</h4>';
        html += `<p><strong>Seuil d'acceptabilité\u00a0:</strong> ${r.seuilAcceptabilite}%</p>`;
        html += `<p><strong>Système de jetons\u00a0:</strong> ${r.utiliserJetons ? 'Activé' : 'Désactivé'}</p>`;
        if (r.utiliserJetons) {
            html += `<p><strong>Jetons délai\u00a0:</strong> ${r.nbJetonsDelai} (${r.dureeDelaiJours} jours)</p>`;
            html += `<p><strong>Jetons reprise\u00a0:</strong> ${r.nbJetonsReprise}</p>`;
        }
        html += '</div>';
    }

    // Échelle et grille (si applicable)
    if (r.typePratique !== 'sommative') {
        html += '<div class="wizard-v2-recap-section">';
        html += '<h4>Matériel pédagogique</h4>';
        if (r.echelleId) {
            const echelles = db.getSync('echellesTemplates', []);
            const echelle = echelles.find(e => e.id === r.echelleId);
            html += `<p><strong>Échelle\u00a0:</strong> ${echelle?.nom || r.echelleId}</p>`;
        }
        if (r.grilleId) {
            const grilles = db.getSync('grillesTemplates', []);
            const grille = grilles.find(g => g.id === r.grilleId);
            html += `<p><strong>Grille\u00a0:</strong> ${grille?.nom || r.grilleId}</p>`;
        } else {
            html += `<p><strong>Grille\u00a0:</strong> <em>À configurer plus tard</em></p>`;
        }
        html += '</div>';
    }

    html += '</div>';
    return html;
}

/**
 * Met à jour l'indicateur de progression
 */
function mettreAJourProgression() {
    const numActuel = calculerNumeroEtape();
    const numTotal = calculerNbEtapes();

    // Mettre à jour le texte
    const numEl = document.getElementById('wizard-v2-etape-num');
    if (numEl) numEl.textContent = numActuel;

    const totalEl = document.getElementById('wizard-v2-etape-total');
    if (totalEl) totalEl.textContent = numTotal;

    const nomEl = document.getElementById('wizard-v2-etape-nom');
    if (nomEl) {
        const etape = ETAPES_WIZARD[wizardState.etapeActuelle];
        nomEl.textContent = etape?.titre || '';
    }

    // Mettre à jour les dots
    mettreAJourDots(numActuel, numTotal);
}

/**
 * Met à jour les indicateurs visuels (dots)
 */
function mettreAJourDots(actuel, total) {
    const dotsContainer = document.getElementById('wizard-v2-dots');
    if (!dotsContainer) return;

    let html = '';
    for (let i = 1; i <= total; i++) {
        const classe = i < actuel ? 'wizard-v2-dot-complete' :
                       i === actuel ? 'wizard-v2-dot-active' : '';
        html += `<span class="wizard-v2-dot ${classe}"></span>`;
    }
    dotsContainer.innerHTML = html;
}

/**
 * Met à jour l'état des boutons de navigation
 */
function mettreAJourBoutons() {
    const btnPrecedent = document.getElementById('wizard-v2-btn-precedent');
    const btnSuivant = document.getElementById('wizard-v2-btn-suivant');
    const btnCreer = document.getElementById('wizard-v2-btn-creer');

    // Bouton Précédent
    if (btnPrecedent) {
        toggleDisplay(btnPrecedent, wizardState.historique.length > 0);
    }

    // Boutons Suivant/Créer
    const estDerniereEtape = wizardState.etapeActuelle === 'recapitulatif';
    if (btnSuivant) {
        toggleDisplay(btnSuivant, !estDerniereEtape);
    }
    if (btnCreer) {
        toggleDisplay(btnCreer, estDerniereEtape);
    }
}

// ============================================================================
// VALIDATION ET SAUVEGARDE
// ============================================================================

/**
 * Valide les champs de l'étape actuelle
 * @param {string} etapeId - ID de l'étape
 * @returns {boolean} - true si valide
 */
function validerEtape(etapeId) {
    const etape = ETAPES_WIZARD[etapeId];
    if (!etape) return false;

    // Obtenir les champs
    let champs = etape.champs || [];
    if (etape.getChampsDynamiques) {
        champs = etape.getChampsDynamiques(wizardState.reponses);
    }

    let valide = true;
    const champsInvalides = [];

    champs.forEach(champ => {
        // Ignorer les champs de type 'info' (pas de validation)
        if (champ.type === 'info') return;

        if (champ.required) {
            let element = null;
            let valeurTrouvee = '';

            // Chercher l'élément selon le type de champ
            if (champ.type === 'radio-cards') {
                // Pour les radio-cards, chercher le radio coché
                element = document.querySelector(`input[name="${champ.id}"]:checked`);
                valeurTrouvee = element?.value || '';
            } else if (champ.type === 'checkbox-cards') {
                // Pour les checkbox-cards, chercher au moins une case cochée
                const checked = document.querySelectorAll(`input[name="${champ.id}"]:checked`);
                element = checked.length > 0 ? checked[0] : null;
                valeurTrouvee = checked.length > 0 ? 'selected' : '';
            } else {
                // Pour les autres champs, chercher par ID avec préfixe V2
                element = document.getElementById(`${WIZARD_V2_ID_PREFIX}${champ.id}`);
                valeurTrouvee = element?.value || '';
            }


            // Validation selon le type
            let estValide = false;
            if (champ.type === 'radio-cards' || champ.type === 'checkbox-cards') {
                // Pour radio/checkbox-cards, vérifier qu'au moins un est coché
                estValide = !!element;
            } else {
                // Pour les autres champs, vérifier que la valeur n'est pas vide
                estValide = element && valeurTrouvee.trim() !== '';
            }

            if (!estValide) {
                valide = false;
                champsInvalides.push(champ.label || champ.id);

                // Afficher une erreur visuelle
                const container = document.querySelector(`[name="${champ.id}"]`)?.closest('.wizard-v2-champ') ||
                                 document.getElementById(`${WIZARD_V2_ID_PREFIX}${champ.id}`)?.closest('.wizard-v2-champ');
                if (container) {
                    container.classList.add('wizard-v2-champ-erreur');
                }
            } else {

                // Retirer l'erreur visuelle si présente
                const container = document.getElementById(`${WIZARD_V2_ID_PREFIX}${champ.id}`)?.closest('.wizard-v2-champ');
                if (container) {
                    container.classList.remove('wizard-v2-champ-erreur');
                }
            }
        }
    });

    if (!valide) {
        const message = champsInvalides.length > 0
            ? `Veuillez remplir: ${champsInvalides.join(', ')}`
            : 'Veuillez remplir tous les champs obligatoires.';
        notifications.erreur(message);
    }

    return valide;
}

/**
 * Sauvegarde les réponses de l'étape actuelle
 * @param {string} etapeId - ID de l'étape
 */
function sauvegarderReponsesEtape(etapeId) {
    const etape = ETAPES_WIZARD[etapeId];
    if (!etape) return;

    // Obtenir les champs
    let champs = etape.champs || [];
    if (etape.getChampsDynamiques) {
        champs = etape.getChampsDynamiques(wizardState.reponses);
    }

    // Fonction interne pour sauvegarder un champ
    const sauvegarderChamp = (champ) => {
        if (champ.type === 'info') return;

        // 🆕 Beta 95.4 : Gérer les rows avec sous-champs
        if (champ.type === 'row' && champ.champs) {
            champ.champs.forEach(sousChamp => sauvegarderChamp(sousChamp));
            return;
        }

        const element = document.getElementById(`${WIZARD_V2_ID_PREFIX}${champ.id}`);

        if (champ.type === 'radio-cards') {
            const checked = document.querySelector(`input[name="${champ.id}"]:checked`);
            if (checked) {
                wizardState.reponses[champ.id] = checked.value;
            }
        } else if (champ.type === 'checkbox-cards') {
            const checked = document.querySelectorAll(`input[name="${champ.id}"]:checked`);
            wizardState.reponses[champ.id] = Array.from(checked).map(cb => cb.value);
        } else if (champ.type === 'toggle') {
            wizardState.reponses[champ.id] = element?.checked || false;
        } else if (element) {
            wizardState.reponses[champ.id] = element.value;
        }
    };

    champs.forEach(sauvegarderChamp);

}

/**
 * Restaure les valeurs d'une étape précédemment remplie
 * @param {string} etapeId - ID de l'étape
 */
function restaurerValeursEtape(etapeId) {
    const etape = ETAPES_WIZARD[etapeId];
    if (!etape) return;

    // Obtenir les champs
    let champs = etape.champs || [];
    if (etape.getChampsDynamiques) {
        champs = etape.getChampsDynamiques(wizardState.reponses);
    }

    // Fonction interne pour restaurer un champ
    const restaurerChamp = (champ) => {
        if (champ.type === 'info') return;

        // 🆕 Beta 95.4 : Gérer les rows avec sous-champs
        if (champ.type === 'row' && champ.champs) {
            champ.champs.forEach(sousChamp => restaurerChamp(sousChamp));
            return;
        }

        const valeur = wizardState.reponses[champ.id];
        if (valeur === undefined) return;

        const element = document.getElementById(`${WIZARD_V2_ID_PREFIX}${champ.id}`);

        if (champ.type === 'radio-cards') {
            const radio = document.querySelector(`input[name="${champ.id}"][value="${valeur}"]`);
            if (radio) radio.checked = true;
        } else if (champ.type === 'checkbox-cards') {
            const values = Array.isArray(valeur) ? valeur : [];
            values.forEach(val => {
                const cb = document.querySelector(`input[name="${champ.id}"][value="${val}"]`);
                if (cb) cb.checked = true;
            });
        } else if (champ.type === 'toggle') {
            if (element) element.checked = valeur;
        } else if (element) {
            element.value = valeur;
        }
    };

    champs.forEach(restaurerChamp);
}

// ============================================================================
// CLASSIFICATION COMPORTEMENTALE - Moteur d'inférence
// ============================================================================

/**
 * Déduit le type de pratique à partir des réponses comportementales
 * @param {Object} reponses - Réponses collectées dans le wizard
 * @returns {{ type: string, variante: string, regles: string[], confiance: number }}
 */
function deduireTypePratique(reponses) {
    const q1 = reponses.calcNoteFinale;

    if (q1 === 'moyenne') {
        const regles = reponses.reglesSommatives || [];
        let variante = 'classique';

        if (regles.includes('remplacement')) variante = 'progressive';
        else if (regles.includes('double_verrou')) variante = 'verrou';
        else if (regles.includes('portfolio')) variante = 'portfolio';
        else if (regles.includes('plafonnement')) variante = 'plafonnement';

        return { type: 'sommative', variante, regles, confiance: 1.0 };
    }

    if (q1 === 'niveaux') {
        let variante = '';
        if (reponses.approcheEvaluation === 'par-artefacts') {
            variante = 'n-meilleurs';
        } else if (reponses.approcheEvaluation === 'par-objectifs') {
            variante = reponses.modeCalcul || 'objectifs-ponderes';
        }

        return { type: 'pan-standards', variante, regles: [], confiance: 1.0 };
    }

    if (q1 === 'acceptable') {
        return { type: 'pan-specifications', variante: 'bundles', regles: [], confiance: 1.0 };
    }

    return { type: null, variante: null, regles: [], confiance: 0 };
}

/**
 * Gestion de l'exclusion mutuelle pour checkbox-cards
 * Quand une option exclusive (ex: "aucune") est cochée, les autres sont décochées et vice-versa
 */
function wizardV2GererExclusionCheckbox(el) {
    const container = el.closest('.wizard-v2-checkbox-cards');
    if (!container) return;

    if (el.dataset.exclusive === 'true' && el.checked) {
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (cb !== el) cb.checked = false;
        });
    } else if (el.checked) {
        container.querySelectorAll('input[type="checkbox"][data-exclusive="true"]').forEach(cb => {
            cb.checked = false;
        });
    }
}

// ============================================================================
// CRÉATION DE LA PRATIQUE
// ============================================================================

/**
 * Crée la pratique à partir des réponses collectées
 * 🆕 FIX (20 jan 2026) : Async pour attendre la sauvegarde
 */
async function creerPratiqueV2() {
    const r = wizardState.reponses;

    // Lire le nom final depuis le champ éditable du récapitulatif (si présent)
    const champNomRecap = document.getElementById('wizard-v2-recap-nom');
    if (champNomRecap && champNomRecap.value.trim()) {
        r.nom = champNomRecap.value.trim();
    }

    // Construire l'objet pratique. typeFinal vient de deduireTypePratique
    // (jamais 'pan-maitrise') → l'entrée 'pan-maitrise':'PAN' était du code mort,
    // retirée (A-2 4e, zéro-dette).
    const typeMapping = {
        'sommative': 'SOM',
        'pan-standards': 'STD',
        'pan-specifications': 'SPE'
    };

    // Utiliser la classification comportementale déduite
    const classification = deduireTypePratique(r);
    const typeFinal = classification.type || r.typePratique;

    const pratique = {
        id: wizardState.pratiqueId || genererIdUnique('pratique_'),
        nom: r.nom,
        auteur: `${r.prenom || ''} ${r.nomAuteur || ''}`.trim(),
        etablissement: r.etablissement || '',
        description: r.description || '',
        discipline: r.discipline || '',
        type: typeFinal,
        variante: classification.variante || null,
        pratiques: [typeMapping[typeFinal] || 'STD'],  // Pour le badge
        dansBibliotheque: true,  // Pour apparaître dans la sidebar
        dateCreation: new Date().toISOString(),
        configuration: {}
    };

    // Seuils personnels (toutes branches)
    if (r.seuilVaBien || r.seuilDifficulte || r.seuilGrandeDifficulte) {
        pratique.seuils = {
            type: 'pourcentage',
            va_bien: parseInt(r.seuilVaBien) || 75,
            difficulte: parseInt(r.seuilDifficulte) || 65,
            grande_difficulte: parseInt(r.seuilGrandeDifficulte) || 55
        };
    }

    // Nombre d'évaluations prévues
    if (r.nbEvaluationsPrevues) {
        pratique.nbEvaluationsPrevues = parseInt(r.nbEvaluationsPrevues) || 6;
    }

    // Règles sommatives (stockées pour référence)
    if (classification.regles && classification.regles.length > 0) {
        pratique.reglesSpeciales = classification.regles;
    }

    // Configuration selon le type
    if (typeFinal === 'sommative') {
        pratique.configuration = {
            afficherRang: r.afficherRang || false,
            afficherMoyenneGroupe: r.afficherMoyenneGroupe !== false,
            reglesSommatives: classification.regles || []
        };

        // Phase 2 : Enrichissement sommative
        const regles = classification.regles || [];
        if (regles.includes('remplacement')) {
            pratique.configuration.remplacement = {
                actif: true,
                nbPaires: parseInt(r.nbPairesRemplacement) || 2
            };
        }
        if (regles.includes('double_verrou')) {
            pratique.configuration.conditions_speciales = pratique.configuration.conditions_speciales || [];
            pratique.configuration.conditions_speciales.push({
                type: 'double_verrou',
                condition: {
                    evaluation: r.nomEvalVerrouillee || 'Analyse finale',
                    comparateur: '<',
                    seuil: parseInt(r.seuilVerrou) || 60
                },
                consequence: {
                    action: 'echec',
                    note_max: parseInt(r.plafondVerrou) || 55
                }
            });
        }
        if (regles.includes('portfolio')) {
            pratique.configuration.portfolio = {
                utiliser: true,
                nbArtefacts: parseInt(r.nbArtefactsPortfolio) || 5,
                qualitatif: r.portfolioQualitatif || false
            };
        }
        if (regles.includes('plafonnement')) {
            pratique.configuration.conditions_speciales = pratique.configuration.conditions_speciales || [];
            pratique.configuration.conditions_speciales.push({
                type: 'plafonnement',
                description: r.conditionPlafonnement || '',
                consequence: {
                    action: 'plafonner',
                    valeur: parseInt(r.valeurPlafonnement) || 55
                }
            });
        }

        // Reprises
        if (r.reprisesPermisesGlobal) {
            pratique.configuration.reprises = {
                permises: true,
                mode: r.modeReprises || 'non',
                max: parseInt(r.nbMaxReprises) || 3
            };
        }
    } else if (typeFinal === 'pan-standards') {
        // 🆕 #24 : Récupérer le mode de sélection pour déterminer varianteCalcul
        const modeSelection = r.modeSelectionPortfolio || 'n_meilleurs';
        const estHybride = modeSelection === 'hybride';

        // Mapper le mode de sélection vers varianteCalcul
        let varianteCalcul = '';
        if (estHybride) {
            varianteCalcul = 'hybride';
        } else if (modeSelection === 'n_meilleurs' || modeSelection === 'meilleurs') {
            varianteCalcul = 'n-meilleurs';
        } else if (modeSelection === 'derniers') {
            varianteCalcul = 'n-recents';
        } else if (modeSelection === 'tous') {
            varianteCalcul = 'n-meilleurs'; // Par défaut
        }

        pratique.configuration = {
            approcheEvaluation: r.approcheEvaluation,
            echelleId: r.echelleId || null,
            grilleId: r.grilleId || null,
            varianteCalcul: varianteCalcul  // 🆕 #24 : Sauvegarder pour Mode Expert
        };

        if (r.approcheEvaluation === 'par-artefacts') {
            // 🆕 Beta 95.7 : Lire depuis modalitesEvaluation (Primo) OU wizardState (#4)
            const modalites = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});

            // Priorité : valeur Primo > valeur wizard > défaut
            // 🆕 Beta 95.7 : Utiliser noms Primo corrects (#4)
            const nbSoumis = parseInt(modalites.nArtefactsPAN) || parseInt(r.nbArtefactsSoumis) || 12;
            const nbRetenus = parseInt(modalites.nArtefactsRetenus) || parseInt(r.nbArtefactsRetenus) || 7;
            const minFormatif = parseInt(modalites.minimumAvantCalcul) || parseInt(r.minAvantCalculFormatif) || 3;

            pratique.configuration.portfolio = {
                utiliser: r.utiliserPortfolio !== false,
                // Noms standardisés (cohérents avec pratiques-gestion.js)
                nombreTotal: nbSoumis,
                nombreARetenir: nbRetenus,
                methodeSelection: estHybride ? 'meilleurs' : (modeSelection === 'n_meilleurs' ? 'meilleurs' : modeSelection),
                minimumCompletion: minFormatif,
                reprisesPermises: r.reprisesPermises || 'illimite',
                hybride: estHybride  // 🆕 #24 : Flag pour activer les catégories
            };
            // 🆕 #24 : Activer catégories automatiquement si hybride
            if (estHybride || modalites.utiliserCategories === 'oui' || modalites.categories?.actif) {
                pratique.configuration.categories = {
                    actif: true,
                    selection: {
                        nombreARetenir: parseInt(modalites.categories?.selection?.nombreARetenir) || 4,
                        ponderation: parseInt(modalites.categories?.selection?.ponderation) || 65
                    },
                    obligatoires: {
                        nombre: parseInt(modalites.categories?.obligatoires?.nombre) || 2,
                        ponderation: parseInt(modalites.categories?.obligatoires?.ponderation) || 35
                    }
                };
            }
        } else if (r.approcheEvaluation === 'par-objectifs') {
            pratique.configuration.objectifs = {
                modeCalcul: r.modeCalcul,
                nbObjectifs: parseInt(r.nbObjectifs) || 6
            };

            if (r.modeCalcul === 'comptage') {
                pratique.configuration.objectifs.comptage = {
                    seuilMaitrise: parseInt(r.seuilMaitrise) || 75,
                    plafondSiEssentielNonMaitrise: parseInt(r.plafondSiEssentielNonMaitrise) || 55
                };
            } else if (r.modeCalcul === 'seuils-critiques') {
                // ✅ CORRECTION (4 jan 2026) : Harmoniser avec les noms des formulaires Trimestre
                pratique.configuration.objectifs.seuilsCritiques = {
                    seuilReussite: r.seuilReussite || 'M',
                    noteBaseReussite: parseInt(r.noteBaseReussite) || 80,
                    bonusParNiveau: parseFloat(r.bonusParNiveau) || 3.33
                };
            } else if (r.modeCalcul === 'holistique') {
                pratique.configuration.objectifs.holistique = {
                    methodeSuggestion: r.methodeSuggestion || 'mode'
                };
            }
        }
    } else if (typeFinal === 'pan-specifications') {
        pratique.configuration = {
            seuilAcceptabilite: parseInt(r.seuilAcceptabilite) || 100,
            jetons: {
                activer: r.utiliserJetons || false
            }
        };

        if (r.utiliserJetons) {
            pratique.configuration.jetons = {
                activer: true,
                delai: {
                    nombre: parseInt(r.nbJetonsDelai) || 3,
                    dureeJours: parseInt(r.dureeDelaiJours) || 3
                },
                reprise: {
                    nombre: parseInt(r.nbJetonsReprise) || 2
                }
            };
        }

        if (r.modeleBundle) {
            pratique.configuration.modeleBundle = r.modeleBundle;
        }
    }


    // Sauvegarder la pratique (attendre pour s'assurer que c'est fait)
    await sauvegarderPratique(pratique);

    // Fermer le wizard
    fermerWizardV2();

    // Notification de succès
    notifications.succes(`Pratique "${pratique.nom}" créée avec succès !`);

    // Rafraîchir l'interface si nécessaire
    if (typeof chargerPratiques === 'function') {
        chargerPratiques();
    }

    // 🆕 FIX (20 jan 2026) : Rafraîchir aussi la sidebar de Construction > Pratiques
    if (typeof afficherListePratiquesMateriel === 'function') {
        afficherListePratiquesMateriel();
    }
}

/**
 * Sauvegarde la pratique dans le stockage
 * 🆕 FIX (20 jan 2026) : Sauvegarde robuste avec vérification
 * @param {Object} pratique - Objet pratique à sauvegarder
 */
async function sauvegarderPratique(pratique) {
    // Récupérer les pratiques existantes
    let pratiques = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);

    // Mise à jour ou ajout
    const index = pratiques.findIndex(p => p.id === pratique.id);
    if (index >= 0) {
        pratiques[index] = pratique;
    } else {
        pratiques.push(pratique);
    }

    // Sauvegarde localStorage + IndexedDB (setSync écrit dans les deux stores)
    db.setSync(cle('pratiquesConfigurables'), pratiques);

    // Mettre à jour les modalités d'évaluation si c'est la pratique active
    const modalites = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
    if (!modalites.pratiqueId || modalites.pratiqueId === pratique.id) {
        modalites.pratiqueId = pratique.id;
        modalites.pratique = pratique.type;
        modalites.approcheEvaluation = pratique.configuration?.approcheEvaluation || null;
        db.setSync(cle('modalitesEvaluation'), modalites);
    }
}

// ============================================================================
// INTERFACE PUBLIQUE
// ============================================================================

/**
 * Ouvre le wizard V2
 * @param {boolean} modeEdition - true pour modifier une pratique existante
 * @param {string} pratiqueId - ID de la pratique à modifier (si modeEdition)
 */
function ouvrirWizardV2(modeEdition = false, pratiqueId = null) {

    // Réinitialiser l'état
    wizardState.etapeActuelle = 'infos-base';
    wizardState.historique = [];
    wizardState.reponses = {};
    wizardState.modeEdition = modeEdition;
    wizardState.pratiqueId = pratiqueId;

    // 🆕 Beta 95.4 : Pré-remplir avec le profil enseignant du groupe-cours actif
    if (!modeEdition) {
        const profilEnseignant = obtenirProfilEnseignantActifWizard();
        if (profilEnseignant) {
            wizardState.reponses.prenom = profilEnseignant.prenom || '';
            wizardState.reponses.nomAuteur = profilEnseignant.nom || '';
            wizardState.reponses.etablissement = profilEnseignant.institution || '';
            wizardState.reponses.discipline = profilEnseignant.discipline || '';
        }
    }

    // Si édition, charger les données existantes
    if (modeEdition && pratiqueId) {
        chargerPratiqueExistante(pratiqueId);
    }

    // Afficher le modal
    const modal = document.getElementById('modalWizardPratiqueV2');
    if (modal) {
        modal.classList.add('actif');
        afficherEtapeWizardV2('infos-base');
    } else {
        console.error('[WizardV2] Modal #modalWizardPratiqueV2 non trouvé');
    }
}

/**
 * 🆕 Beta 95.4 : Obtient le profil de l'enseignant du groupe-cours actif
 * @returns {Object|null} - { prenom, nom, institution, discipline } ou null
 */
function obtenirProfilEnseignantActifWizard() {
    try {
        const trimestreActif = window.trimestreActif || (typeof db !== 'undefined' && db.getSync ? db.getSync('trimestreActif', null) : null);
        if (!trimestreActif) return null;

        const groupesCours = db.getSync(`${trimestreActif}_groupesCours`, []);
        const groupeActif = groupesCours.find(gc => gc.actif);
        if (!groupeActif || !groupeActif.enseignantId) return null;

        const enseignants = db.getSync('enseignants', []);
        const enseignant = enseignants.find(e => e.id === groupeActif.enseignantId);
        if (!enseignant) return null;

        return {
            prenom: enseignant.prenom || '',
            nom: enseignant.nom || '',
            institution: enseignant.institution || '',
            discipline: enseignant.discipline || ''
        };
    } catch (e) {
        console.warn('[WizardV2] Erreur obtention profil enseignant:', e);
        return null;
    }
}

/**
 * Ferme le wizard V2
 */
function fermerWizardV2() {
    const modal = document.getElementById('modalWizardPratiqueV2');
    if (modal) {
        modal.classList.remove('actif');
    }

    // Réinitialiser l'état
    wizardState.etapeActuelle = 'infos-base';
    wizardState.historique = [];
    wizardState.reponses = {};
    wizardState.modeEdition = false;
    wizardState.pratiqueId = null;
}

/**
 * Charge une pratique existante pour édition
 * @param {string} pratiqueId - ID de la pratique
 */
function chargerPratiqueExistante(pratiqueId) {
    const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);
    const pratique = pratiques.find(p => p.id === pratiqueId);

    if (!pratique) {
        console.warn('[WizardV2] Pratique non trouvée:', pratiqueId);
        return;
    }

    // Mapper les données vers les réponses du wizard.
    // Normalisation à la lecture (A-2 4e) : pratique.type peut être canonique
    // ('standards', 'specifications'…) si la donnée vient d'un seed canonisé
    // (lot 4b) ou d'une migration future. Le wizard travaille en vocabulaire
    // INTERNE legacy ('pan-standards'…) jusqu'à l'étape 6 ; on convertit donc à
    // l'entrée, sinon une pratique Standards/Spécifications serait reconstruite
    // en Sommative (bug latent réel). Tables indexées canonique ; la conversion
    // canon→interne est transitoire (retirée à l'étape 6).
    const typeCanon = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(pratique.type) : pratique.type);
    const canonVersInterne = { 'standards': 'pan-standards', 'specifications': 'pan-specifications', 'sommative': 'sommative' };
    const calcNoteFinaleMap = {
        'sommative': 'moyenne',
        'standards': 'niveaux',
        'specifications': 'acceptable'
    };

    wizardState.reponses = {
        nom: pratique.nom,
        auteur: pratique.auteur,
        etablissement: pratique.etablissement,
        description: pratique.description,
        discipline: pratique.discipline,
        typePratique: canonVersInterne[typeCanon] || pratique.type,
        calcNoteFinale: calcNoteFinaleMap[typeCanon] || 'moyenne',
        typeVariante: pratique.variante || null,
        reglesSommatives: pratique.reglesSpeciales || pratique.configuration?.reglesSommatives || [],
        nbEvaluationsPrevues: pratique.nbEvaluationsPrevues || null,
        seuilVaBien: pratique.seuils?.va_bien || null,
        seuilDifficulte: pratique.seuils?.difficulte || null,
        seuilGrandeDifficulte: pratique.seuils?.grande_difficulte || null
    };

    // Ajouter la configuration spécifique
    if (pratique.configuration) {
        const config = pratique.configuration;

        if (typeCanon === 'sommative') {
            wizardState.reponses.afficherRang = config.afficherRang;
            wizardState.reponses.afficherMoyenneGroupe = config.afficherMoyenneGroupe;
        } else if (typeCanon === 'standards') {
            wizardState.reponses.approcheEvaluation = config.approcheEvaluation;
            wizardState.reponses.echelleId = config.echelleId;
            wizardState.reponses.grilleId = config.grilleId;

            if (config.portfolio) {
                wizardState.reponses.utiliserPortfolio = config.portfolio.utiliser;
                wizardState.reponses.nbArtefactsSoumis = config.portfolio.nbArtefactsSoumis;
                wizardState.reponses.nbArtefactsRetenus = config.portfolio.nbArtefactsRetenus;
                wizardState.reponses.reprisesPermises = config.portfolio.reprisesPermises;
                wizardState.reponses.minAvantCalculFormatif = config.portfolio.minAvantCalculFormatif;
            }

            if (config.objectifs) {
                wizardState.reponses.modeCalcul = config.objectifs.modeCalcul;
                // Ajouter les paramètres spécifiques selon le mode
            }
        }
    }
}


// ============================================================================
// EXPORTS
// ============================================================================

window.ouvrirWizardV2 = ouvrirWizardV2;
window.fermerWizardV2 = fermerWizardV2;
window.etapeSuivanteV2 = etapeSuivanteV2;
window.etapePrecedenteV2 = etapePrecedenteV2;
window.creerPratiqueV2 = creerPratiqueV2;
window.deduireTypePratique = deduireTypePratique;
window.wizardV2GererExclusionCheckbox = wizardV2GererExclusionCheckbox;
window.wizardV2CreerGrilleDemo = wizardV2CreerGrilleDemo;



})();
