/* ===============================
   BIBLIOTHÈQUE DE CONFIGURATIONS DE PRATIQUES
   (c) 2 janvier 2026 - Beta 95

   Bibliothèque partagée de configurations de pratiques de notation.
   - Indépendante du trimestre (clé non-namespacée)
   - Stockage dans IndexedDB/localStorage
   - Import/export avec collègues
   - Inclut les modèles prédéfinis (Chimie, Simple, Littérature)

   Clé de stockage: 'bibliothequePratiques' (sans namespace)
   =============================== */

(function() {
'use strict';

/**
 * Clé de stockage pour la bibliothèque (NON namespacée = partagée entre trimestres)
 */
const CLE_BIBLIOTHEQUE_PRATIQUES = 'bibliothequePratiques';

/**
 * Modèles prédéfinis (gabarits de base fournis avec l'application)
 * Ces modèles sont toujours disponibles même si la bibliothèque est vide
 */
const MODELES_PRATIQUES_PREDEFINIS = {
    // === PAN-DÉNOTATION (#318) ===
    // ⚠️ Placé EN TÊTE À DESSEIN : obtenirToutesLesPratiquesBibliothequeSync fait `unshift`
    // sur chaque gabarit → l'ordre d'affichage est INVERSÉ, donc une entrée en tête ici
    // s'affiche EN DERNIER dans « Partir d'un modèle » (demande Grégoire : DEN en fin de liste).
    // Gabarit « de base », volontairement GÉNÉRIQUE et LARGE (pas une discipline précise) :
    // DEN n'est pas la pratique de Grégoire — description et paramètres s'appuient sur la
    // théorie (Girouard-Gagné, Talbert, CoP Sherbrooke ; cf. SKILL_pratiques_notation §2 bis/§8).
    // Mode `eliminee` (seul livré, #318). Échelle/grille OPTIONNELLES (la rétroaction peut aussi
    // être orale/hors-app ; l'app garde au moins une trace) ; les CIBLES tiennent le rôle des
    // critères explicites. DEN reste un chantier en soi (modes différée/réduite à venir).
    'DEN-base': {
        id: 'DEN-base',
        nom: 'Modèle de base',
        description: 'Rétroaction qualitative sur des cibles d\'apprentissage explicites ; la note finale certificative (RREC) est posée à la fin selon l\'atteinte des cibles, sans note chiffrée en cours de route.',
        type: 'denotation',
        auteur: 'Gabarit Labo Codex',
        discipline: 'Général',
        estGabarit: true,
        pratiques: ['DEN'],
        configuration: {
            type: 'denotation',
            modeDEN: 'eliminee',
            objectifs: [
                { id: 'cible-1', nom: 'Maîtriser les savoirs et concepts essentiels du cours' },
                { id: 'cible-2', nom: 'Appliquer les méthodes propres à la discipline' },
                { id: 'cible-3', nom: 'Communiquer clairement sa démarche et ses résultats' }
            ],
            suggestion: { methode: 'mode' },
            echelleId: null,
            grilleId: null
        }
    },

    // === PAN-SPÉCIFICATIONS ===
    'SPE-chimie-contrats': {
        id: 'SPE-chimie-contrats',
        nom: 'Modèle Chimie',
        description: 'Notation par contrats',
        type: 'specifications',
        auteur: 'Gabarit Labo Codex',
        discipline: 'Chimie',
        estGabarit: true,
        pratiques: ['SPE'],
        configuration: {
            seuilAcceptable: 75,
            typesTravaux: [
                { id: 1, nom: 'Prise de position', description: 'Travail écrit argumentatif' },
                { id: 2, nom: 'Test', description: 'Évaluation des connaissances' },
                { id: 3, nom: 'Portfolio', description: 'Dossier d\'apprentissage' },
                { id: 4, nom: 'Oral', description: 'Présentation orale' }
            ],
            forfaits: [
                { id: 1, lettre: 'A', note: 90, travaux: { 1: 3, 2: 2, 3: 1, 4: 1 } },
                { id: 2, lettre: 'B', note: 80, travaux: { 1: 2, 2: 2, 3: 1, 4: 1 } },
                { id: 3, lettre: 'C', note: 60, travaux: { 1: 1, 2: 2, 3: 0, 4: 0 } }
            ]
        }
    },
    'SPE-simple': {
        id: 'SPE-simple',
        nom: 'Modèle simple',
        description: 'Pour débuter avec PAN – Spécifications',
        type: 'specifications',
        auteur: 'Demo Labo Codex',
        discipline: 'Général',
        estGabarit: true,
        pratiques: ['SPE'],
        configuration: {
            seuilAcceptable: 75,
            typesTravaux: [
                { id: 1, nom: 'Projet', description: 'Travail pratique ou créatif' },
                { id: 2, nom: 'Examen', description: 'Évaluation sommative' }
            ],
            forfaits: [
                { id: 1, lettre: 'Excellence', note: 90, travaux: { 1: 2, 2: 1 } },
                { id: 2, lettre: 'Réussite', note: 70, travaux: { 1: 1, 2: 1 } }
            ]
        }
    },
    // === PAN-STANDARDS ===
    'STD-n-meilleurs': {
        id: 'STD-n-meilleurs',
        nom: 'N meilleures évaluations',
        description: 'Garde les 7 meilleures évaluations sur 10, valorise la progression',
        type: 'standards',
        auteur: 'Demo Labo Codex',
        discipline: 'Général',
        estGabarit: true,
        pratiques: ['STD'],
        configuration: {
            varianteCalcul: 'n-meilleurs',
            portfolio: {
                methodeSelection: 'meilleurs',
                nombreARetenir: 7,
                minimumCompletion: 7,
                nombreTotal: 10,
                decouplerPN: false
            }
        }
    },
    'STD-n-recents': {
        id: 'STD-n-recents',
        nom: 'N plus récentes',
        description: 'Garde les 5 évaluations les plus récentes, valorise l\'état actuel',
        type: 'standards',
        auteur: 'Demo Labo Codex',
        discipline: 'Général',
        estGabarit: true,
        pratiques: ['STD'],
        configuration: {
            varianteCalcul: 'n-recents',
            portfolio: {
                methodeSelection: 'recents',
                nombreARetenir: 5,
                minimumCompletion: 5,
                nombreTotal: 10,
                decouplerPN: false
            }
        }
    },
    'STD-par-objectifs-pondere': {
        id: 'STD-par-objectifs-pondere',
        nom: 'Par objectifs (Pondéré)',
        description: 'Mode mathématiques : moyenne pondérée des objectifs',
        type: 'standards',
        auteur: 'Gabarit Labo Codex',
        discipline: 'Mathématiques',
        estGabarit: true,
        pratiques: ['STD'],
        configuration: {
            varianteCalcul: 'par-objectifs',
            portfolio: {
                methodeSelection: 'meilleurs',
                nombreARetenir: 5,
                minimumCompletion: 5,
                nombreTotal: 10,
                decouplerPN: false
            },
            parObjectifs: {
                modeCalcul: 'moyenne-ponderee',
                objectifs: [
                    { id: 1, nom: 'Objectif principal', essentiel: true, ponderation: 50 },
                    { id: 2, nom: 'Objectif secondaire', essentiel: false, ponderation: 30 },
                    { id: 3, nom: 'Objectif complémentaire', essentiel: false, ponderation: 20 }
                ]
            }
        }
    },

    // ============================================================================
    // PRATIQUE PERSONNALISÉE : Chimie organique
    // Standards avec critères par standard, meilleurs résultats (N=1)
    // ============================================================================
    'STD-chimie-organique': {
        id: 'STD-chimie-organique',
        nom: 'STD Chimie organique',
        description: 'Standards avec critères par standard, meilleurs résultats. Reprises illimitées au bureau.',
        type: 'standards',
        auteur: 'Gabarit Labo Codex',
        discipline: 'Chimie',
        estGabarit: true,
        pratiques: ['STD'],
        configuration: {
            varianteCalcul: 'par-objectifs',
            echelleId: 'ECHELLE_BRUNO_CHIMIE',
            portfolio: {
                methodeSelection: 'meilleurs',
                nombreARetenir: 1,  // Meilleur résultat par standard
                minimumCompletion: 1,
                nombreTotal: 12,    // 12 occasions formelles
                decouplerPN: true   // Critères par standard, pas par éval
            },
            parObjectifs: {
                modeCalcul: 'comptage',
                objectifs: [
                    { id: 1, nom: 'Nomenclature organique', essentiel: true, ponderation: 0 },
                    { id: 2, nom: 'Réactions acidobasiques', essentiel: true, ponderation: 0 },
                    { id: 3, nom: 'Additions sur alcènes', essentiel: true, ponderation: 0 },
                    { id: 4, nom: 'Substitutions nucléophiles', essentiel: true, ponderation: 0 },
                    { id: 5, nom: 'Éliminations', essentiel: true, ponderation: 0 },
                    { id: 6, nom: 'Synthèses multi-étapes', essentiel: true, ponderation: 0 }
                ],
                comptage: {
                    seuilMaitrise: 75,              // Niveau "Acquis"
                    plafondSiEssentielNonMaitrise: 55,
                    grilleConversion: { 0: 0, 1: 50, 2: 55, 3: 60, 4: 70, 5: 80, 6: 100 }
                }
            }
        },
        seuils: {
            vaBien: 75,
            difficulte: 60,
            grandeDifficulte: 55
        }
    },

    // ============================================================================
    // PRATIQUE PERSONNALISÉE : Informatique
    // 6 objectifs, tous niveau 3+ requis, calcul conditionnel
    // ============================================================================
    'STD-info-interfaces-bd': {
        id: 'STD-info-interfaces-bd',
        nom: 'STD Interfaces et BD',
        description: '6 objectifs requis niveau 3+. Base 80% + bonus 3.33% par niveau 4. Hybride STD/SPE.',
        type: 'standards',
        auteur: 'Gabarit Labo Codex',
        discipline: 'Informatique',
        estGabarit: true,
        pratiques: ['STD'],
        configuration: {
            varianteCalcul: 'par-objectifs',
            echelleId: 'ECHELLE_XAVIER_INFO',
            portfolio: {
                methodeSelection: 'meilleurs',
                nombreARetenir: 1,
                minimumCompletion: 1,
                nombreTotal: 3,     // 3 évaluations (projet, examen pratique, examens théoriques)
                decouplerPN: true
            },
            parObjectifs: {
                modeCalcul: 'seuils-critiques',
                objectifs: [
                    { id: 1, nom: 'Modélisation de données', essentiel: true, ponderation: 0 },
                    { id: 2, nom: 'Procédures stockées et déclencheurs', essentiel: true, ponderation: 0 },
                    { id: 3, nom: 'Sécurité et sauvegardes', essentiel: true, ponderation: 0 },
                    { id: 4, nom: 'Programmation DB First', essentiel: true, ponderation: 0 },
                    { id: 5, nom: 'Conception d\'interfaces', essentiel: true, ponderation: 0 },
                    { id: 6, nom: 'Programmation LINQ', essentiel: true, ponderation: 0 }
                ],
                // ✅ CORRECTION (4 jan 2026) : Harmoniser avec les noms des formulaires Trimestre
                seuilsCritiques: {
                    seuilReussite: 3,               // Tous doivent être niveau 3+
                    noteBaseReussite: 80,           // 80% si tous niveau 3+
                    bonusParNiveau4: 3.33,          // +3.33% par objectif niveau 4
                    notes1Objectif2: 55,            // 1 objectif niveau 2 → 55%
                    notes2Objectifs2ou1Obj1: 50,    // 2 obj niveau 2 OU 1 obj niveau 1 → 50%
                    notesAutresCas: 40              // Plafond autres cas
                }
            }
        },
        seuils: {
            vaBien: 80,
            difficulte: 55,
            grandeDifficulte: 50
        }
    },

    // ============================================================================
    // PRATIQUES SOMMATIVES TRADITIONNELLES
    // ============================================================================

    // ============================================================================
    // PRATIQUE PERSONNALISÉE : Administration
    // Sommative traditionnelle - Comptabilité et numérique
    // ============================================================================
    'SOM-comptabilite': {
        id: 'SOM-comptabilite',
        nom: 'SOM Comptabilité',
        description: 'Sommative traditionnelle. Examens écrits et travaux pratiques. Moyenne pondérée.',
        type: 'sommative',
        auteur: 'Gabarit Labo Codex',
        discipline: 'Administration',
        etablissement: 'Cégep de l\'Abitibi-Témiscamingue',
        estGabarit: true,
        pratiques: ['SOM'],
        configuration: {
            methodeCalcul: 'moyenne-ponderee',
            evaluations: [
                { id: 1, nom: 'Examen 1', type: 'examen', ponderation: 30 },
                { id: 2, nom: 'Examen 2', type: 'examen', ponderation: 30 },
                { id: 3, nom: 'Travaux pratiques', type: 'tp', ponderation: 40 }
            ],
            criteres: {
                type: 'variables',
                description: 'Exactitude des réponses, démarche, transfert de connaissance'
            }
        },
        seuils: {
            vaBien: 80,
            difficulte: 70,
            grandeDifficulte: 60
        }
    },

    // ============================================================================
    // PRATIQUE PERSONNALISÉE : Géographie
    // Sommative traditionnelle - Introduction en géographie
    // ============================================================================
    'SOM-geographie': {
        id: 'SOM-geographie',
        nom: 'SOM Géographie',
        description: 'Sommative traditionnelle. Examens 55%, travaux pratiques 45%. Quiz formatifs non notés.',
        type: 'sommative',
        auteur: 'Gabarit Labo Codex',
        discipline: 'Géographie',
        etablissement: 'Collège Montmorency',
        estGabarit: true,
        pratiques: ['SOM'],
        configuration: {
            methodeCalcul: 'moyenne-ponderee',
            evaluations: [
                { id: 1, nom: 'Examens écrits', type: 'examen', ponderation: 55 },
                { id: 2, nom: 'Travaux pratiques', type: 'tp', ponderation: 45 }
            ],
            criteres: {
                type: 'variables',
                examens: 'Connaissances, liens entre connaissances',
                travaux: 'Méthodologie, normes, structure'
            }
        },
        seuils: {
            vaBien: 70,
            difficulte: 65,
            grandeDifficulte: 55
        }
    },

    // ============================================================================
    // PRATIQUE PERSONNALISÉE : Philosophie
    // Sommative hybride avec portfolio formatif
    // ============================================================================
    'SOM-philo-portfolio': {
        id: 'SOM-philo-portfolio',
        nom: 'SOM Philo + Portfolio',
        description: 'Hybride sommative/PAN. Portfolio 30% avec progression évaluée, erreurs non pénalisées.',
        type: 'sommative',
        auteur: 'Gabarit Labo Codex',
        discipline: 'Philosophie',
        etablissement: 'Cégep Gérald-Godin',
        estGabarit: true,
        pratiques: ['SOM'],
        configuration: {
            methodeCalcul: 'moyenne-ponderee',
            evaluations: [
                { id: 1, nom: 'Rédaction 1', type: 'redaction', ponderation: 15 },
                { id: 2, nom: 'Rédaction 2', type: 'redaction', ponderation: 20 },
                { id: 3, nom: 'Dissertation/Analyse', type: 'dissertation', ponderation: 35 },
                { id: 4, nom: 'Portfolio', type: 'portfolio', ponderation: 30 }
            ],
            criteres: {
                type: 'fixes',
                liste: [
                    'Exploitation adéquate du genre',
                    'Qualité de la problématisation',
                    'Qualité de l\'argumentation',
                    'Définition et utilisation des concepts'
                ]
            },
            particularites: {
                portfolioFormatif: true,
                erreursNonPenalisees: true,
                progressionEvaluee: true
            }
        },
        seuils: {
            vaBien: 70,
            difficulte: 60,
            grandeDifficulte: 50
        }
    },

    // ============================================================================
    // PRATIQUE PERSONNALISÉE : Littérature
    // Sommative avec critères fixes et double verrou
    // ============================================================================
    'SOM-litterature': {
        id: 'SOM-litterature',
        nom: 'SOM Littérature',
        description: 'Sommative avec analyse finale 50% (double verrou). Portfolio 20%. Critères fixes.',
        type: 'sommative',
        auteur: 'Gabarit Labo Codex',
        discipline: 'Littérature',
        etablissement: 'Cégep de Valleyfield',
        estGabarit: true,
        pratiques: ['SOM'],
        configuration: {
            methodeCalcul: 'moyenne-ponderee',
            evaluations: [
                { id: 1, nom: 'Analyse partielle', type: 'analyse', ponderation: 15 },
                { id: 2, nom: 'Portfolio', type: 'portfolio', ponderation: 20 },
                { id: 3, nom: 'Travail équipe', type: 'atelier', ponderation: 15 },
                { id: 4, nom: 'Analyse finale', type: 'analyse', ponderation: 50, doubleVerrou: true }
            ],
            criteres: {
                type: 'fixes',
                liste: [
                    'Pertinence',
                    'Justesse',
                    'Clarté',
                    'Qualité de la langue',
                    'Respect de la structure',
                    'Cohérence textuelle'
                ]
            },
            particularites: {
                doubleVerrou: true,
                portfolioNombreTravaux: '5-7'
            }
        },
        seuils: {
            vaBien: 75,
            difficulte: 65,
            grandeDifficulte: 55
        }
    },

    // ============================================================================
    // PRATIQUE PERSONNALISÉE : Biologie
    // PAN-Standards avec jugement global (holistique)
    // ============================================================================
    'STD-anatomie': {
        id: 'STD-anatomie',
        nom: 'STD Anatomie',
        description: 'PAN – Standards avec jugement global. 11 évaluations. Progression qualitative sans calcul strict.',
        type: 'standards',
        auteur: 'Gabarit Labo Codex',
        discipline: 'Biologie',
        etablissement: 'Cégep',
        estGabarit: true,
        pratiques: ['STD'],
        configuration: {
            varianteCalcul: 'par-objectifs',
            echelleId: 'ECHELLE_ISABELLE_BIO',
            portfolio: {
                methodeSelection: 'tous',
                nombreTotal: 11,
                decouplerPN: true
            },
            parObjectifs: {
                modeCalcul: 'holistique',
                description: 'Jugement professionnel global basé sur la progression',
                objectifs: [
                    { id: 1, nom: 'Compétence anatomie', essentiel: true, ponderation: 0 }
                ],
                holistique: {
                    baseSurProgression: true,
                    criteresProjets: true,
                    criteresExamens: false,
                    jugementProfessionnel: true
                }
            }
        },
        seuils: {
            vaBien: null,
            difficulte: null,
            grandeDifficulte: null,
            type: 'qualitatif'
        },
        avertissement: 'Cette pratique nécessite un jugement professionnel final. Les indicateurs sont un soutien, pas un calcul automatique.'
    },

    // ============================================================================
    // PRATIQUE PERSONNALISÉE : Philosophie
    // Sommative avec mécanisme de remplacement
    // ============================================================================
    'SOM-philo-remplacement': {
        id: 'SOM-philo-remplacement',
        nom: 'SOM Philo + Remplacement',
        description: 'Sommative avec remplacement progressif. Note finale peut remplacer mi-session si supérieure.',
        type: 'sommative',
        auteur: 'Gabarit Labo Codex',
        discipline: 'Philosophie',
        etablissement: 'Cégep',
        estGabarit: true,
        pratiques: ['SOM'],
        configuration: {
            methodeCalcul: 'remplacement-progression',
            evaluations: [
                { id: 1, nom: 'Examen mi-session', type: 'examen', ponderation: 10, paire: 'examen' },
                { id: 2, nom: 'Examen final', type: 'examen', ponderation: 20, paire: 'examen', remplace: 1 },
                { id: 3, nom: 'Texte mi-session', type: 'texte', ponderation: 20, paire: 'texte' },
                { id: 4, nom: 'Texte final', type: 'texte', ponderation: 40, paire: 'texte', remplace: 3 }
            ],
            remplacement: {
                description: 'Si note finale > note mi-session, elle la remplace',
                paires: [
                    { initial: 1, final: 2, poidsInitial: 10, poidsFinal: 20 },
                    { initial: 3, final: 4, poidsInitial: 20, poidsFinal: 40 }
                ],
                regle: 'max'
            },
            criteres: {
                type: 'variables',
                examens: 'Exactitude (réponses courtes)',
                textes: 'Argumentation, conceptualisation, problématisation'
            },
            autresPoints: {
                description: 'Notes de lecture, activités classe, textes réflexifs (points de complétion)'
            }
        },
        seuils: {
            vaBien: 80,
            difficulte: 60,
            grandeDifficulte: 50
        }
    }
};

/**
 * Obtenir toutes les configurations de la bibliothèque (incluant gabarits prédéfinis)
 * @param {boolean} inclureGabarits - Inclure les gabarits prédéfinis (true par défaut)
 * @returns {Promise<Array>} Tableau de toutes les configurations disponibles
 */
async function obtenirToutesLesPratiquesBibliotheque(inclureGabarits = true) {
    let bibliotheque = [];

    try {
        bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];
    } catch (e) {
        console.error('[Bibliothèque Pratiques] Erreur lecture:', e);
        bibliotheque = [];
    }

    // Ajouter les gabarits prédéfinis s'ils ne sont pas déjà présents
    if (inclureGabarits) {
        const idsExistants = new Set(bibliotheque.map(p => p.id));

        Object.values(MODELES_PRATIQUES_PREDEFINIS).forEach(gabarit => {
            if (!idsExistants.has(gabarit.id)) {
                bibliotheque.unshift({
                    ...gabarit,
                    estGabarit: true,
                    dateAjoutBiblio: null // null = prédéfini
                });
            }
        });
    }

    return bibliotheque;
}

/**
 * Version synchrone pour compatibilité
 * @param {boolean} inclureGabarits - Inclure les gabarits prédéfinis (true par défaut)
 * @returns {Array} Tableau de toutes les configurations disponibles
 */
function obtenirToutesLesPratiquesBibliothequeSync(inclureGabarits = true) {
    let bibliotheque = [];

    try {
        bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_PRATIQUES) || [];
    } catch (e) {
        bibliotheque = [];
    }

    // Ajouter les gabarits prédéfinis
    if (inclureGabarits) {
        const idsExistants = new Set(bibliotheque.map(p => p.id));

        Object.values(MODELES_PRATIQUES_PREDEFINIS).forEach(gabarit => {
            if (!idsExistants.has(gabarit.id)) {
                bibliotheque.unshift({
                    ...gabarit,
                    estGabarit: true,
                    dateAjoutBiblio: null
                });
            }
        });
    }

    return bibliotheque;
}

/**
 * Obtenir les configurations d'un type de pratique spécifique
 * @param {string} typePratique - Type de pratique (specifications, standards, etc.)
 * @returns {Promise<Array>} Tableau des configurations de ce type
 */
async function obtenirPratiquesParType(typePratique) {
    const bibliotheque = await obtenirToutesLesPratiquesBibliotheque();
    if (!typePratique || typePratique === 'tous') {
        return bibliotheque;
    }
    return bibliotheque.filter(p =>
        p.type && p.type.toLowerCase() === typePratique.toLowerCase()
    );
}

/**
 * Obtenir les configurations d'une discipline spécifique
 * @param {string} discipline - Nom de la discipline
 * @returns {Promise<Array>} Tableau des configurations de cette discipline
 */
async function obtenirPratiquesParDiscipline(discipline) {
    const bibliotheque = await obtenirToutesLesPratiquesBibliotheque();
    if (!discipline || discipline === 'toutes') {
        return bibliotheque;
    }
    return bibliotheque.filter(p =>
        p.discipline && p.discipline.toLowerCase() === discipline.toLowerCase()
    );
}

/**
 * Obtenir la liste des disciplines disponibles dans la bibliothèque
 * @returns {Promise<Array>} Tableau des noms de disciplines uniques
 */
async function obtenirDisciplinesDisponiblesPratiques() {
    const bibliotheque = await obtenirToutesLesPratiquesBibliotheque();
    const disciplines = new Set();

    bibliotheque.forEach(config => {
        if (config.discipline) {
            disciplines.add(config.discipline);
        }
    });

    return Array.from(disciplines).sort();
}

/**
 * Obtenir une configuration par son ID
 * @param {string} configId - ID de la configuration
 * @returns {Promise<Object|null>} La configuration ou null
 */
async function obtenirConfigurationPratiqueParId(configId) {
    // 1. Vérifier d'abord les gabarits prédéfinis
    if (MODELES_PRATIQUES_PREDEFINIS[configId]) {
        return { ...MODELES_PRATIQUES_PREDEFINIS[configId] };
    }

    // 2. Vérifier la bibliothèque partagée
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];
    const dansBibliotheque = bibliotheque.find(p => p.id === configId);
    if (dansBibliotheque) return dansBibliotheque;

    // 3. Vérifier les pratiques configurables de l'utilisateur. Les configs vivent
    //    dans la clé namespacée par trimestre depuis 99.64 ; on lit donc
    //    cle('pratiquesConfigurables') d'abord, avec repli sur la clé nue legacy
    //    (même idiome que pratiques-gestion.js / evaluation-calcul.js).
    const configurables = await db.get(cle('pratiquesConfigurables')) || await db.get('pratiquesConfigurables') || [];
    return configurables.find(p => p.id === configId) || null;
}

/**
 * Ajouter une configuration à la bibliothèque partagée
 * @param {Object} configuration - La configuration à ajouter
 * @returns {Promise<boolean>} true si ajoutée, false si déjà existante
 */
async function ajouterPratiqueALaBibliotheque(configuration) {
    // B-β — passage obligé par assainirObjet. Le schéma pratique inclut
    // `configuration` en type 'object' brut pour préserver la structure
    // riche (typesTravaux, forfaits, portfolio, parObjectifs) sans devoir
    // la modéliser exhaustivement.
    const configSafe = (typeof window.assainirObjet === 'function' && window.SCHEMAS_IMPORT && window.SCHEMAS_IMPORT.pratique)
        ? window.assainirObjet(configuration, window.SCHEMAS_IMPORT.pratique)
        : configuration;

    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];

    const existe = bibliotheque.some(p => p.id === configSafe.id);
    if (existe) {
        return false;
    }

    // 🆕 Beta 95.4 : Obtenir l'auteur depuis le profil enseignant si non défini
    const auteur = configSafe.auteur || (typeof obtenirProfilAuteurActifSync === 'function' ? obtenirProfilAuteurActifSync()?.auteur_original : null) || 'Inconnu';

    const configBiblio = {
        ...configSafe,
        dansBibliotheque: true,
        dateAjoutBiblio: new Date().toISOString(),
        auteur: auteur
    };

    bibliotheque.push(configBiblio);
    await db.set(CLE_BIBLIOTHEQUE_PRATIQUES, bibliotheque);

    return true;
}

/**
 * Mettre à jour une configuration existante
 * @param {Object} configuration - La configuration mise à jour
 * @returns {Promise<boolean>} true si mise à jour, false si non trouvée
 */
async function mettreAJourConfigurationPratique(configuration) {
    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];

    const index = bibliotheque.findIndex(p => p.id === configuration.id);
    if (index === -1) {
        return false;
    }

    bibliotheque[index] = {
        ...bibliotheque[index],
        ...configuration,
        dateModification: new Date().toISOString()
    };

    await db.set(CLE_BIBLIOTHEQUE_PRATIQUES, bibliotheque);
    return true;
}

/**
 * Retirer une configuration de la bibliothèque
 * @param {string} configId - ID de la configuration à retirer
 * @returns {Promise<boolean>} true si retirée, false si non trouvée ou prédéfinie
 */
async function retirerPratiqueDeLaBibliotheque(configId) {
    // Bug fix 28 mai 2026 PM : on autorise la suppression de la copie IDB
    // même si son ID partage avec un seed prédéfini. Le seed lui-même n'est
    // pas affecté (il vit dans le code source) et se réinjecte automatiquement
    // via obtenirToutesLesPratiquesBibliotheque au prochain rafraîchissement.
    // La protection seeds prédéfinis vit désormais dans supprimerPratiqueDeBibliothequePartagee
    // qui distingue correctement "copie IDB" vs "gabarit pur".
    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];

    const indexAvant = bibliotheque.length;
    bibliotheque = bibliotheque.filter(p => p.id !== configId);

    if (bibliotheque.length === indexAvant) {
        return false;
    }

    await db.set(CLE_BIBLIOTHEQUE_PRATIQUES, bibliotheque);

    // #320 — cohérence des répertoires : une pratique retirée quitte tout
    // répertoire qui la classait (sinon itemId orphelin). Appel défensif :
    // le module de classement peut ne pas être chargé.
    if (window.repertoiresBibliotheque && typeof window.repertoiresBibliotheque.retirerItem === 'function') {
        window.repertoiresBibliotheque.retirerItem(configId, 'pratiques');
    }

    return true;
}

/**
 * Sauvegarder la configuration actuelle comme nouvelle configuration
 * Extrait TOUS les paramètres pertinents selon le type de pratique (STD, SPE, etc.)
 * @param {string} nom - Nom de la configuration
 * @param {string} description - Description optionnelle
 * @returns {Promise<Object>} La configuration sauvegardée
 */
async function sauvegarderConfigurationActuelle(nom, description = '') {
    let modalites = {};
    try {
        modalites = window.modalitesEvaluation.lire();
    } catch (e) {
        modalites = {};
    }

    // #328 L2-b2 : type dérivé de la SSOT groupesCours[].pratiqueId (helper D2) —
    // le miroir modalites.pratique n'existe plus.
    const pratiqueCanon = (typeof obtenirTypePratiqueActive === 'function')
        ? obtenirTypePratiqueActive()
        : null;

    const nouvelleConfig = {
        id: genererIdUnique('config_'),
        nom: nom,
        description: description,
        type: pratiqueCanon || 'specifications',
        auteur: 'Utilisateur',
        discipline: modalites.discipline || 'Général',
        dateCreation: new Date().toISOString(),
        configuration: {}
    };

    // Selon le type de pratique, extraire la configuration pertinente
    if (pratiqueCanon === 'specifications') {
        nouvelleConfig.pratiques = ['SPE'];
        nouvelleConfig.configuration = {
            seuilAcceptable: modalites.specifications?.seuilAcceptable || 75,
            typesTravaux: JSON.parse(JSON.stringify(modalites.specifications?.typesTravaux || [])),
            forfaits: JSON.parse(JSON.stringify(modalites.specifications?.forfaits || []))
        };

    } else if (pratiqueCanon === 'standards') {
        nouvelleConfig.pratiques = ['STD'];
        nouvelleConfig.configuration = {
            // Variante de calcul
            varianteCalcul: modalites.varianteCalcul || '',

            // Portfolio complet (mode de sélection, N à retenir, etc.)
            portfolio: modalites.portfolio ? {
                methodeSelection: modalites.portfolio.methodeSelection || 'meilleurs',
                nombreARetenir: modalites.portfolio.nombreARetenir || 5,
                minimumCompletion: modalites.portfolio.minimumCompletion || 5,
                nombreTotal: modalites.portfolio.nombreTotal || 10,
                decouplerPN: modalites.portfolio.decouplerPN || false
            } : null,

            // Configuration par-objectifs (si applicable)
            parObjectifs: modalites.parObjectifs ? JSON.parse(JSON.stringify(modalites.parObjectifs)) : null
        };
    }

    // Ajouter à la bibliothèque
    await ajouterPratiqueALaBibliotheque(nouvelleConfig);

    return nouvelleConfig;
}

/**
 * Appliquer une configuration depuis la bibliothèque
 * Remplit TOUS les paramètres pertinents selon le type de pratique (STD, SPE, etc.)
 * @param {string} configId - ID de la configuration à appliquer
 * @returns {Promise<boolean>} true si appliquée avec succès
 */
async function appliquerConfigurationPratique(configId) {
    const config = await obtenirConfigurationPratiqueParId(configId);
    if (!config) {
        console.error('[Bibliothèque Pratiques] Configuration non trouvée:', configId);
        return false;
    }

    let modalites = {};
    try {
        modalites = window.modalitesEvaluation.lire();
    } catch (e) {
        modalites = {};
    }

    // Session A-2 : id canonique normalisé à la lecture (config.type peut être legacy).
    const typeConfig = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(config.type) : config.type);

    // Appliquer selon le type (#328 L2-b2 : le miroir modalites.pratique n'est
    // plus écrit — appliquer une config ne change pas la pratique active du
    // groupe-cours, seule l'activation par la SSOT le fait)
    if (typeConfig === 'specifications') {
        if (!modalites.specifications) {
            modalites.specifications = {};
        }

        modalites.specifications.seuilAcceptable = config.configuration?.seuilAcceptable || 75;
        modalites.specifications.typesTravaux = JSON.parse(JSON.stringify(config.configuration?.typesTravaux || []));
        modalites.specifications.forfaits = JSON.parse(JSON.stringify(config.configuration?.forfaits || []));
        modalites.specifications.modeleChoisi = config.id;
        modalites.specifications.modeleNom = config.nom;

    } else if (typeConfig === 'standards') {
        // Variante de calcul (n-meilleurs, n-recents, par-objectifs, etc.)
        if (config.configuration?.varianteCalcul) {
            modalites.varianteCalcul = config.configuration.varianteCalcul;
        }

        // Portfolio (mode de sélection, N à retenir, etc.)
        if (config.configuration?.portfolio) {
            modalites.portfolio = {
                ...(modalites.portfolio || {}),
                ...JSON.parse(JSON.stringify(config.configuration.portfolio))
            };
        }

        // Configuration par-objectifs (si variante = 'par-objectifs')
        if (config.configuration?.parObjectifs) {
            modalites.parObjectifs = JSON.parse(JSON.stringify(config.configuration.parObjectifs));
        }

        // Marquer la configuration appliquée
        modalites.configurationSTDAppliquee = {
            id: config.id,
            nom: config.nom,
            dateApplication: new Date().toISOString()
        };
    }

    window.modalitesEvaluation.remplacer(modalites);

    // Rafraîchir l'interface selon le type
    if (typeConfig === 'specifications') {
        // Rafraîchir interface SPE
        if (typeof chargerConfigSpecifications === 'function') {
            chargerConfigSpecifications();
        }
        if (typeof afficherTypesTravauxSpec === 'function') {
            afficherTypesTravauxSpec(modalites.specifications?.typesTravaux || []);
        }
        if (typeof afficherForfaitsSpec === 'function') {
            afficherForfaitsSpec(
                modalites.specifications?.forfaits || [],
                modalites.specifications?.typesTravaux || []
            );
        }
    } else if (typeConfig === 'standards') {
        // Rafraîchir interface STD

        // 1. Mettre à jour le dropdown de variante
        const varianteSelect = document.getElementById('v2-variante-calcul');
        if (varianteSelect && modalites.varianteCalcul) {
            varianteSelect.value = modalites.varianteCalcul;
            // Déclencher l'événement change pour afficher la description
            if (typeof changerVariantePANStandards === 'function') {
                changerVariantePANStandards();
            }
        }

        // 2. Mettre à jour les champs portfolio
        const portfolioSelection = document.getElementById('v2-portfolio-selection');
        if (portfolioSelection && modalites.portfolio?.methodeSelection) {
            portfolioSelection.value = modalites.portfolio.methodeSelection;
        }

        const portfolioNombre = document.getElementById('v2-portfolio-nombre');
        if (portfolioNombre && modalites.portfolio?.nombreARetenir) {
            portfolioNombre.value = modalites.portfolio.nombreARetenir;
        }

        const portfolioMinimum = document.getElementById('v2-portfolio-minimum');
        if (portfolioMinimum && modalites.portfolio?.minimumCompletion) {
            portfolioMinimum.value = modalites.portfolio.minimumCompletion;
        }

        const portfolioTotal = document.getElementById('v2-portfolio-total');
        if (portfolioTotal && modalites.portfolio?.nombreTotal) {
            portfolioTotal.value = modalites.portfolio.nombreTotal;
        }

        const decouplerPN = document.getElementById('v2-decoupler-pn');
        if (decouplerPN && modalites.portfolio?.decouplerPN !== undefined) {
            decouplerPN.checked = modalites.portfolio.decouplerPN;
        }

        // 3. Charger la configuration par-objectifs si applicable
        if (modalites.varianteCalcul === 'par-objectifs' && typeof chargerConfigParObjectifs === 'function') {
            chargerConfigParObjectifs();
        }
    }

    return true;
}

/**
 * Importer des configurations dans la bibliothèque
 * @param {Array} configurations - Tableau de configurations à importer
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function importerPratiquesDansBibliotheque(configurations) {
    let ajoutees = 0;
    let existantes = 0;

    for (const config of configurations) {
        const resultat = await ajouterPratiqueALaBibliotheque(config);
        if (resultat) {
            ajoutees++;
        } else {
            existantes++;
        }
    }

    return { ajoutees, existantes };
}

/**
 * Exporter toute la bibliothèque de configurations
 * @returns {Promise<Object>} Objet JSON exportable
 */
async function exporterBibliothequePratiques() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];
    const configurations = typeof ajouterMetadonnéesCC === 'function'
        ? bibliotheque.map(p => ajouterMetadonnéesCC(p, 'pratique', p.nom || '').contenu || p)
        : bibliotheque;

    return {
        version: '1.0',
        type: 'configurations-pratiques',
        dateExport: new Date().toISOString(),
        nombreConfigurations: configurations.length,
        configurations
    };
}

/**
 * Exporter une configuration spécifique
 * @param {string} configId - ID de la configuration à exporter
 * @returns {Promise<Object|null>} Objet JSON exportable ou null
 */
async function exporterConfigurationPratique(configId) {
    const config = await obtenirConfigurationPratiqueParId(configId);
    if (!config) return null;

    return {
        version: '1.0',
        type: 'configuration-pratique',
        dateExport: new Date().toISOString(),
        configuration: config
    };
}

/**
 * Obtenir le nombre de configurations dans la bibliothèque
 * @returns {number}
 */
function getNombrePratiquesBibliotheque() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_PRATIQUES) || [];
    return bibliotheque.length + Object.keys(MODELES_PRATIQUES_PREDEFINIS).length;
}

/**
 * Générer le HTML pour le sélecteur de configurations
 * @param {string} typeFiltre - Filtrer par type (optionnel)
 * @returns {Promise<string>} HTML du sélecteur
 */
async function genererSelecteurModelesPratiques(typeFiltre = null) {
    const configurations = await obtenirToutesLesPratiquesBibliotheque();

    let html = '<option value="">-- Sélectionner une configuration --</option>';

    // Grouper par type
    const gabarits = configurations.filter(c => c.estGabarit);
    const personnalises = configurations.filter(c => !c.estGabarit);

    // Filtrer si nécessaire
    const filtrerParType = (configs) => {
        if (!typeFiltre) return configs;
        return configs.filter(c => c.type === typeFiltre);
    };

    const gabaritsFiltres = filtrerParType(gabarits);
    const personnalisesFiltres = filtrerParType(personnalises);

    // Fonction pour générer le badge
    const genererBadge = (config) => {
        if (config.pratiques?.includes('SPE')) return '[SPE] ';
        if (config.pratiques?.includes('STD')) return '[STD] ';
        return '';
    };

    if (gabaritsFiltres.length > 0) {
        html += '<optgroup label="Configurations prédéfinies">';
        gabaritsFiltres.forEach(config => {
            const badge = genererBadge(config);
            html += `<option value="${echapperHtml(config.id)}">${badge}${echapperHtml(config.nom)}</option>`;
        });
        html += '</optgroup>';
    }

    if (personnalisesFiltres.length > 0) {
        html += '<optgroup label="Mes configurations">';
        personnalisesFiltres.forEach(config => {
            const badge = genererBadge(config);
            html += `<option value="${echapperHtml(config.id)}">${badge}${echapperHtml(config.nom)}</option>`;
        });
        html += '</optgroup>';
    }

    return html;
}

/**
 * Charger le dropdown des configurations dans l'interface
 * Détecte automatiquement le type de pratique sélectionné
 */
async function chargerDropdownModelesPratiques() {
    const dropdown = document.getElementById('v2-spec-dropdown-modeles');
    if (!dropdown) return;

    // Détecter le type de pratique actuel
    const typeSelect = document.getElementById('v2-pratique-type');
    const typePratique = typeSelect?.value || null;

    // Ne pas filtrer si pas de type sélectionné - montrer toutes les configurations
    dropdown.innerHTML = await genererSelecteurModelesPratiques(typePratique);
}

/**
 * Appliquer la configuration sélectionnée depuis le dropdown
 */
async function appliquerModeleSelectionne() {
    const dropdown = document.getElementById('v2-spec-dropdown-modeles');
    if (!dropdown || !dropdown.value) {
        notifications.info('Sélectionne une configuration.');
        return;
    }

    const configId = dropdown.value;
    const succes = await appliquerConfigurationPratique(configId);

    if (succes) {
        // Afficher confirmation
        notifications.succes('Configuration appliquée.');
    } else {
        notifications.erreur('Erreur lors de l\'application de la configuration.');
    }
}

/**
 * Ouvrir la modale de sauvegarde de configuration
 */
async function ouvrirModaleSauvegardeConfig() {
    const nom = await uiDialogues.demanderSaisie({
        titre: 'Sauvegarder la configuration',
        message: 'Nom de la configuration de pratique :',
        valeurInitiale: 'Ma configuration'
    });
    if (!nom) return;

    const description = await uiDialogues.demanderSaisie({
        titre: 'Description',
        message: 'Description (optionnel) :',
        valeurInitiale: ''
    });

    try {
        const config = await sauvegarderConfigurationActuelle(nom, description);

        // Rafraîchir le dropdown AVANT d'afficher la notification
        await chargerDropdownModelesPratiques();

        notifications.succes(`Configuration "${config.nom}" sauvegardée`);
    } catch (err) {
        console.error('[Bibliothèque Pratiques] Erreur sauvegarde:', err);
        notifications.erreur('Erreur lors de la sauvegarde.');
    }
}

// ===========================
// EXPORTS GLOBAUX
// ===========================
window.obtenirToutesLesPratiquesBibliotheque = obtenirToutesLesPratiquesBibliotheque;
window.obtenirToutesLesPratiquesBibliothequeSync = obtenirToutesLesPratiquesBibliothequeSync;
window.obtenirPratiquesParType = obtenirPratiquesParType;
window.obtenirPratiquesParDiscipline = obtenirPratiquesParDiscipline;
window.obtenirDisciplinesDisponiblesPratiques = obtenirDisciplinesDisponiblesPratiques;
window.obtenirConfigurationPratiqueParId = obtenirConfigurationPratiqueParId;
window.ajouterPratiqueALaBibliotheque = ajouterPratiqueALaBibliotheque;
window.mettreAJourConfigurationPratique = mettreAJourConfigurationPratique;
window.retirerPratiqueDeLaBibliotheque = retirerPratiqueDeLaBibliotheque;
window.sauvegarderConfigurationActuelle = sauvegarderConfigurationActuelle;
window.appliquerConfigurationPratique = appliquerConfigurationPratique;
window.importerPratiquesDansBibliotheque = importerPratiquesDansBibliotheque;
window.exporterBibliothequePratiques = exporterBibliothequePratiques;
window.exporterConfigurationPratique = exporterConfigurationPratique;
window.getNombrePratiquesBibliotheque = getNombrePratiquesBibliotheque;
window.genererSelecteurModelesPratiques = genererSelecteurModelesPratiques;
window.chargerDropdownModelesPratiques = chargerDropdownModelesPratiques;
window.appliquerModeleSelectionne = appliquerModeleSelectionne;
window.ouvrirModaleSauvegardeConfig = ouvrirModaleSauvegardeConfig;
window.CLE_BIBLIOTHEQUE_PRATIQUES = CLE_BIBLIOTHEQUE_PRATIQUES;
window.MODELES_PRATIQUES_PREDEFINIS = MODELES_PRATIQUES_PREDEFINIS;



})();
