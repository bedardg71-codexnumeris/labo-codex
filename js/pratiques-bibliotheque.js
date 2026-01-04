/* ===============================
   BIBLIOTHÈQUE DE CONFIGURATIONS DE PRATIQUES
   (c) 2 janvier 2026 - Beta 95

   Bibliothèque partagée de configurations de pratiques de notation.
   - Indépendante du trimestre (clé non-namespacée)
   - Stockage dans IndexedDB/localStorage
   - Import/export avec collègues
   - Inclut les modèles prédéfinis (François, Simple, Littérature)

   Clé de stockage: 'bibliothequePratiques' (sans namespace)
   =============================== */

/**
 * Clé de stockage pour la bibliothèque (NON namespacée = partagée entre trimestres)
 */
const CLE_BIBLIOTHEQUE_PRATIQUES = 'bibliothequePratiques';

/**
 * Modèles prédéfinis (gabarits de base fournis avec l'application)
 * Ces modèles sont toujours disponibles même si la bibliothèque est vide
 */
const MODELES_PRATIQUES_PREDEFINIS = {
    // === PAN-SPÉCIFICATIONS ===
    'SPE-francois': {
        id: 'SPE-francois',
        nom: 'Modèle François',
        description: 'Basé sur la pratique de François A.-H. (Chimie)',
        type: 'pan-specifications',
        auteur: 'François A.-H.',
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
        description: 'Pour débuter avec PAN-Spécifications',
        type: 'pan-specifications',
        auteur: 'Grégoire Bédard',
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
    'SPE-litterature': {
        id: 'SPE-litterature',
        nom: 'Modèle littérature',
        description: 'Adapté aux cours de français et littérature',
        type: 'pan-specifications',
        auteur: 'Grégoire Bédard',
        discipline: 'Français',
        estGabarit: true,
        pratiques: ['SPE'],
        configuration: {
            seuilAcceptable: 75,
            typesTravaux: [
                { id: 1, nom: 'Analyse littéraire', description: 'Analyse d\'un texte ou d\'une œuvre' },
                { id: 2, nom: 'Dissertation', description: 'Texte argumentatif structuré' },
                { id: 3, nom: 'Portfolio de lecture', description: 'Traces de lecture et réflexions' }
            ],
            forfaits: [
                { id: 1, lettre: 'A', note: 100, travaux: { 1: 2, 2: 1, 3: 1 } },
                { id: 2, lettre: 'B', note: 80, travaux: { 1: 2, 2: 1, 3: 0 } },
                { id: 3, lettre: 'C', note: 60, travaux: { 1: 1, 2: 1, 3: 0 } }
            ]
        }
    },

    // === PAN-STANDARDS ===
    'STD-n-meilleurs': {
        id: 'STD-n-meilleurs',
        nom: 'N meilleures évaluations',
        description: 'Garde les 7 meilleures évaluations sur 10, valorise la progression',
        type: 'pan-standards',
        auteur: 'Grégoire Bédard',
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
                decouplerPR: false
            }
        }
    },
    'STD-n-recents': {
        id: 'STD-n-recents',
        nom: 'N plus récentes',
        description: 'Garde les 5 évaluations les plus récentes, valorise l\'état actuel',
        type: 'pan-standards',
        auteur: 'Grégoire Bédard',
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
                decouplerPR: false
            }
        }
    },
    'STD-par-objectifs-comptage': {
        id: 'STD-par-objectifs-comptage',
        nom: 'Par objectifs (Comptage)',
        description: 'Mode Bruno V. : comptage d\'objectifs essentiels et complémentaires',
        type: 'pan-standards',
        auteur: 'Bruno V.',
        discipline: 'Chimie',
        estGabarit: true,
        pratiques: ['STD'],
        configuration: {
            varianteCalcul: 'par-objectifs',
            portfolio: {
                methodeSelection: 'meilleurs',
                nombreARetenir: 5,
                minimumCompletion: 5,
                nombreTotal: 10,
                decouplerPR: true
            },
            parObjectifs: {
                modeCalcul: 'comptage',
                objectifs: [
                    { id: 1, nom: 'Objectif 1', essentiel: true, ponderation: 0 },
                    { id: 2, nom: 'Objectif 2', essentiel: true, ponderation: 0 },
                    { id: 3, nom: 'Objectif 3', essentiel: false, ponderation: 0 }
                ],
                comptage: {
                    seuilMaitrise: 75,
                    plafondSiEssentielNonMaitrise: 55,
                    grilleConversion: { 0: 0, 1: 33, 2: 67, 3: 100 }
                }
            }
        }
    },
    'STD-par-objectifs-pondere': {
        id: 'STD-par-objectifs-pondere',
        nom: 'Par objectifs (Pondéré)',
        description: 'Mode Michel B. : moyenne pondérée des objectifs',
        type: 'pan-standards',
        auteur: 'Michel B.',
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
                decouplerPR: false
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
    // PRATIQUE PERSONNALISÉE : Bruno V. (Chimie organique)
    // Standards avec critères par standard, meilleurs résultats (N=1)
    // ============================================================================
    'STD-Bruno-Chimie': {
        id: 'STD-Bruno-Chimie',
        nom: 'STD Chimie organique (Bruno V.)',
        description: 'Standards avec critères par standard, meilleurs résultats. Reprises illimitées au bureau.',
        type: 'pan-standards',
        auteur: 'Bruno V.',
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
                decouplerPR: true   // Critères par standard, pas par éval
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
    // PRATIQUE PERSONNALISÉE : Xavier C.-T. (Informatique)
    // 6 objectifs, tous niveau 3+ requis, calcul conditionnel
    // ============================================================================
    'STD-Xavier-Info': {
        id: 'STD-Xavier-Info',
        nom: 'STD Interfaces et BD (Xavier C.-T.)',
        description: '6 objectifs requis niveau 3+. Base 80% + bonus 3.33% par niveau 4. Hybride STD/SPE.',
        type: 'pan-standards',
        auteur: 'Xavier C.-T.',
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
                decouplerPR: true
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
    // PRATIQUE PERSONNALISÉE : Étienne L. (Administration)
    // Sommative traditionnelle - Comptabilité et numérique
    // ============================================================================
    'SOM-Etienne-Admin': {
        id: 'SOM-Etienne-Admin',
        nom: 'SOM Comptabilité (Étienne L.)',
        description: 'Sommative traditionnelle. Examens écrits et travaux pratiques. Moyenne pondérée.',
        type: 'sommative',
        auteur: 'Étienne L.',
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
    // PRATIQUE PERSONNALISÉE : Olivier L. (Géographie)
    // Sommative traditionnelle - Introduction en géographie
    // ============================================================================
    'SOM-Olivier-Geo': {
        id: 'SOM-Olivier-Geo',
        nom: 'SOM Géographie (Olivier L.)',
        description: 'Sommative traditionnelle. Examens 55%, travaux pratiques 45%. Quiz formatifs non notés.',
        type: 'sommative',
        auteur: 'Olivier L.',
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
    // PRATIQUE PERSONNALISÉE : Hélène C. (Philosophie)
    // Sommative hybride avec portfolio formatif
    // ============================================================================
    'SOM-Helene-Philo': {
        id: 'SOM-Helene-Philo',
        nom: 'SOM Philo + Portfolio (Hélène C.)',
        description: 'Hybride sommative/PAN. Portfolio 30% avec progression évaluée, erreurs non pénalisées.',
        type: 'sommative',
        auteur: 'Hélène C.',
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
    // PRATIQUE PERSONNALISÉE : Marie-Hélène L. (Littérature)
    // Sommative avec critères fixes et double verrou
    // ============================================================================
    'SOM-MarieHelene-Litt': {
        id: 'SOM-MarieHelene-Litt',
        nom: 'SOM Littérature (Marie-Hélène L.)',
        description: 'Sommative avec analyse finale 50% (double verrou). Portfolio 20%. Critères fixes.',
        type: 'sommative',
        auteur: 'Marie-Hélène L.',
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
    // PRATIQUE PERSONNALISÉE : Isabelle M. (Biologie)
    // PAN-Standards avec jugement global (holistique)
    // ============================================================================
    'STD-Isabelle-Bio': {
        id: 'STD-Isabelle-Bio',
        nom: 'STD Anatomie (Isabelle M.)',
        description: 'PAN-Standards avec jugement global. 11 évaluations. Progression qualitative sans calcul strict.',
        type: 'pan-standards',
        auteur: 'Isabelle M.',
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
                decouplerPR: true
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
    // PRATIQUE PERSONNALISÉE : Jordan R. (Philosophie)
    // Sommative avec mécanisme de remplacement
    // ============================================================================
    'SOM-Jordan-Philo': {
        id: 'SOM-Jordan-Philo',
        nom: 'SOM Philo + Remplacement (Jordan R.)',
        description: 'Sommative avec remplacement progressif. Note finale peut remplacer mi-session si supérieure.',
        type: 'sommative',
        auteur: 'Jordan R.',
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
 * @param {string} typePratique - Type de pratique (pan-specifications, pan-standards, etc.)
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
    // Vérifier d'abord les gabarits prédéfinis
    if (MODELES_PRATIQUES_PREDEFINIS[configId]) {
        return { ...MODELES_PRATIQUES_PREDEFINIS[configId] };
    }

    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];
    return bibliotheque.find(p => p.id === configId) || null;
}

/**
 * Ajouter une configuration à la bibliothèque partagée
 * @param {Object} configuration - La configuration à ajouter
 * @returns {Promise<boolean>} true si ajoutée, false si déjà existante
 */
async function ajouterPratiqueALaBibliotheque(configuration) {
    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];

    const existe = bibliotheque.some(p => p.id === configuration.id);
    if (existe) {
        console.log('[Bibliothèque Pratiques] Configuration déjà présente:', configuration.id);
        return false;
    }

    const configBiblio = {
        ...configuration,
        dansBibliotheque: true,
        dateAjoutBiblio: new Date().toISOString(),
        auteur: configuration.auteur || 'Inconnu'
    };

    bibliotheque.push(configBiblio);
    await db.set(CLE_BIBLIOTHEQUE_PRATIQUES, bibliotheque);

    console.log('[Bibliothèque Pratiques] Configuration ajoutée:', configuration.nom);
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
    console.log('[Bibliothèque Pratiques] Configuration mise à jour:', configuration.nom);
    return true;
}

/**
 * Retirer une configuration de la bibliothèque
 * @param {string} configId - ID de la configuration à retirer
 * @returns {Promise<boolean>} true si retirée, false si non trouvée ou prédéfinie
 */
async function retirerPratiqueDeLaBibliotheque(configId) {
    // Ne pas permettre la suppression des gabarits prédéfinis
    if (MODELES_PRATIQUES_PREDEFINIS[configId]) {
        console.log('[Bibliothèque Pratiques] Impossible de supprimer un gabarit prédéfini:', configId);
        return false;
    }

    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];

    const indexAvant = bibliotheque.length;
    bibliotheque = bibliotheque.filter(p => p.id !== configId);

    if (bibliotheque.length === indexAvant) {
        return false;
    }

    await db.set(CLE_BIBLIOTHEQUE_PRATIQUES, bibliotheque);
    console.log('[Bibliothèque Pratiques] Configuration retirée:', configId);
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
        modalites = db.getSync('modalitesEvaluation') || {};
    } catch (e) {
        modalites = {};
    }

    const nouvelleConfig = {
        id: `config_${Date.now()}`,
        nom: nom,
        description: description,
        type: modalites.pratique || 'pan-specifications',
        auteur: 'Utilisateur',
        discipline: modalites.discipline || 'Général',
        dateCreation: new Date().toISOString(),
        configuration: {}
    };

    // Selon le type de pratique, extraire la configuration pertinente
    if (modalites.pratique === 'pan-specifications' || modalites.pratique === 'specifications') {
        nouvelleConfig.pratiques = ['SPE'];
        nouvelleConfig.configuration = {
            seuilAcceptable: modalites.specifications?.seuilAcceptable || 75,
            typesTravaux: JSON.parse(JSON.stringify(modalites.specifications?.typesTravaux || [])),
            forfaits: JSON.parse(JSON.stringify(modalites.specifications?.forfaits || []))
        };

    } else if (modalites.pratique === 'pan-standards') {
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
                decouplerPR: modalites.portfolio.decouplerPR || false
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
        modalites = db.getSync('modalitesEvaluation') || {};
    } catch (e) {
        modalites = {};
    }

    // Appliquer selon le type
    if (config.type === 'pan-specifications') {
        modalites.pratique = 'pan-specifications';

        if (!modalites.specifications) {
            modalites.specifications = {};
        }

        modalites.specifications.seuilAcceptable = config.configuration?.seuilAcceptable || 75;
        modalites.specifications.typesTravaux = JSON.parse(JSON.stringify(config.configuration?.typesTravaux || []));
        modalites.specifications.forfaits = JSON.parse(JSON.stringify(config.configuration?.forfaits || []));
        modalites.specifications.modeleChoisi = config.id;
        modalites.specifications.modeleNom = config.nom;

    } else if (config.type === 'pan-standards') {
        modalites.pratique = 'pan-standards';

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

    db.setSync('modalitesEvaluation', modalites);
    console.log('[Bibliothèque Pratiques] Configuration appliquée:', config.nom);

    // Rafraîchir l'interface selon le type
    if (config.type === 'pan-specifications') {
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
    } else if (config.type === 'pan-standards') {
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

        const decouplerPR = document.getElementById('v2-decoupler-pr');
        if (decouplerPR && modalites.portfolio?.decouplerPR !== undefined) {
            decouplerPR.checked = modalites.portfolio.decouplerPR;
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

    console.log(`[Bibliothèque Pratiques] Import: ${ajoutees} ajoutées, ${existantes} déjà existantes`);
    return { ajoutees, existantes };
}

/**
 * Exporter toute la bibliothèque de configurations
 * @returns {Promise<Object>} Objet JSON exportable
 */
async function exporterBibliothequePratiques() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];

    return {
        version: '1.0',
        type: 'configurations-pratiques',
        dateExport: new Date().toISOString(),
        nombreConfigurations: bibliotheque.length,
        configurations: bibliotheque
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
            html += `<option value="${config.id}">${badge}${config.nom}</option>`;
        });
        html += '</optgroup>';
    }

    if (personnalisesFiltres.length > 0) {
        html += '<optgroup label="Mes configurations">';
        personnalisesFiltres.forEach(config => {
            const badge = genererBadge(config);
            html += `<option value="${config.id}">${badge}${config.nom}</option>`;
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
        alert('Veuillez sélectionner une configuration.');
        return;
    }

    const configId = dropdown.value;
    const succes = await appliquerConfigurationPratique(configId);

    if (succes) {
        // Afficher confirmation
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Configuration appliquée avec succès');
        } else {
            alert('Configuration appliquée !');
        }
    } else {
        alert('Erreur lors de l\'application de la configuration.');
    }
}

/**
 * Ouvrir la modale de sauvegarde de configuration
 */
async function ouvrirModaleSauvegardeConfig() {
    const nom = prompt('Nom de la configuration de pratique :', 'Ma configuration');
    if (!nom) return;

    const description = prompt('Description (optionnel) :', '');

    try {
        const config = await sauvegarderConfigurationActuelle(nom, description);

        // Rafraîchir le dropdown AVANT d'afficher la notification
        await chargerDropdownModelesPratiques();

        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces(`Configuration "${config.nom}" sauvegardée`);
        } else {
            alert(`Configuration "${config.nom}" sauvegardée !`);
        }
    } catch (err) {
        console.error('[Bibliothèque Pratiques] Erreur sauvegarde:', err);
        alert('Erreur lors de la sauvegarde.');
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

console.log('[pratiques-bibliotheque] Module chargé');
