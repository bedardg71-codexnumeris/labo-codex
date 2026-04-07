/**
 * aide-contextuelle-contenu.js
 * Contenu des aides contextuelles (📍 pins d'aide)
 *
 * Types de sections supportés :
 * - texte : paragraphe simple
 * - liste : liste à puces avec titre optionnel
 * - conseil : encadré vert avec conseil pratique
 * - exemple : encadré bleu avec exemple
 * - alerte : encadré orange avec avertissement (niveau: 'attention' | 'important')
 *
 * Note : Tutoiement systématique (cohérence avec Primo)
 */

(function() {
'use strict';

const AIDE_CONTEXTUELLE = {

    // =========================================================================
    // CONSTRUCTION - RÉFLEXION SUR LES OBJECTIFS (NOUVEAU)
    // =========================================================================

    'construction-objectifs-reflexion': {
        titre: "Réfléchir à tes objectifs d'apprentissage",
        sections: [
            {
                type: 'texte',
                contenu: "Avant de créer tes grilles et échelles, plusieurs enseignants trouvent utile de prendre un moment pour clarifier leurs objectifs d'apprentissage. Cette réflexion peut t'aider à construire un matériel d'évaluation cohérent avec ce que tu enseignes réellement."
            },
            {
                type: 'liste',
                titre: "Questions de réflexion (optionnelles)",
                items: [
                    "Quels sont les éléments de compétence visés dans ton devis ministériel ?",
                    "Qu'est-ce que tu veux que tes étudiants soient capables de FAIRE à la fin du cours ?",
                    "Comment sauras-tu qu'un étudiant a atteint cet objectif ? Qu'observeras-tu concrètement dans son travail ?"
                ]
            },
            {
                type: 'conseil',
                contenu: "Certains enseignants aiment écrire leurs réflexions sur papier avant d'entrer dans l'application. D'autres préfèrent créer leurs grilles directement et ajuster en cours de route. Les deux approches fonctionnent. Fais ce qui te convient le mieux."
            },
            {
                type: 'exemple',
                titre: "Passer du devis à des critères observables",
                contenu: "Si ton devis indique « Repérer et classer des thèmes », tu pourrais te demander : « Comment je sais qu'un étudiant repère bien les thèmes ? » Tes réponses deviennent tes critères : identification des thèmes, précision du vocabulaire, organisation du classement, etc."
            }
        ],
        voirAussi: ['construction-grilles', 'construction-echelles', 'structure-apercu-legacy']
    },

    // =========================================================================
    // CONSTRUCTION - APERÇU
    // =========================================================================

    'structure-apercu-legacy': {
        titre: "Vue d'ensemble du matériel pédagogique",
        sections: [
            {
                type: 'texte',
                contenu: "Cette page présente un résumé de tout le matériel pédagogique configuré pour ton cours : productions, grilles de critères, échelles de performance et pratiques de notation."
            },
            {
                type: 'liste',
                titre: "Éléments affichés",
                items: [
                    "Productions : travaux à évaluer (examens, devoirs, projets)",
                    "Grilles : critères d'évaluation pour chaque production",
                    "Échelles : niveaux de performance (pourcentages, lettres, etc.)",
                    "Pratiques : méthode de calcul de la note finale"
                ]
            },
            {
                type: 'conseil',
                contenu: "Configure ton matériel dans cet ordre : 1) Échelles de performance, 2) Pratiques de notation, 3) Grilles de critères, 4) Productions. Chaque élément dépend du précédent. Note : les réglages de base (trimestre, horaire, groupes) doivent être complétés au préalable."
            },
            {
                type: 'alerte',
                niveau: 'important',
                contenu: "Prendre le temps de réfléchir à tes objectifs d'apprentissage avant de configurer ton matériel peut t'aider à créer des grilles plus cohérentes. Clique sur le bouton 📍 « Réfléchir à tes objectifs » si tu veux des pistes de réflexion."
            }
        ],
        voirAussi: ['construction-objectifs-reflexion', 'structure-productions', 'construction-grilles', 'construction-pratiques']
    },

    // =========================================================================
    // PHASE 1 - CRITIQUES (5 aides)
    // =========================================================================

    'evaluations-proceder': {
        titre: "Évaluer une production",
        sections: [
            {
                type: 'texte',
                contenu: "Cette interface permet d'évaluer le travail d'un·e étudiant·e sur une production. L'évaluation génère automatiquement une rétroaction personnalisée basée sur tes critères."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Avant d'évaluer, assure-toi d'avoir créé au moins : une <strong>grille de critères</strong>, une <strong>échelle de performance</strong>, une <strong>cartouche de rétroaction</strong> et une <strong>production</strong>. Ces éléments se configurent dans la section Structure."
            },
            {
                type: 'liste',
                titre: "Étapes recommandées",
                items: [
                    "Sélectionne l'étudiant·e dans la liste déroulante",
                    "Choisis la production à évaluer",
                    "Vérifie que la grille, l'échelle et la cartouche sont bien associées",
                    "Évalue chaque critère de la grille en cliquant sur le niveau atteint",
                    "Vérifie et ajuste la rétroaction générée si nécessaire",
                    "Clique sur « Sauvegarder l'évaluation »"
                ]
            },
            {
                type: 'conseil',
                contenu: "Le mode « Évaluation en série » (bouton en haut) permet d'enchaîner plusieurs étudiants sur la même production, idéal pour corriger un lot de travaux."
            },
            {
                type: 'exemple',
                titre: "Raccourci clavier",
                contenu: "Utilise les touches 1-2-3-4-5 pour évaluer rapidement chaque critère sans utiliser la souris."
            }
        ],
        voirAussi: ['evaluations-annoter', 'construction-grilles', 'construction-echelles', 'construction-cartouches']
    },

    'structure-productions': {
        titre: "Gérer les productions étudiantes",
        sections: [
            {
                type: 'texte',
                contenu: "Les productions représentent les travaux évalués (examens, devoirs, projets, etc.). Chaque production est associée à une grille de critères et contribue à la note finale selon sa pondération."
            },
            {
                type: 'liste',
                titre: "Éléments clés d'une production",
                items: [
                    "Titre : nom affiché dans les listes et rapports",
                    "Type : catégorie (examen, travail pratique, quiz, etc.)",
                    "Pondération : poids dans la note finale (ex: 20%)",
                    "Grille : critères d'évaluation associés",
                    "Date d'échéance : pour le suivi des remises"
                ]
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "La somme des pondérations de toutes les productions devrait totaliser 100%. Vérifie le total affiché en bas de la liste."
            },
            {
                type: 'conseil',
                contenu: "Crée tes productions au début du trimestre pour avoir une vue d'ensemble de ton plan d'évaluation."
            }
        ],
        voirAussi: ['construction-grilles', 'construction-pratiques']
    },

    'construction-grilles': {
        titre: "Concevoir des grilles de critères",
        sections: [
            {
                type: 'texte',
                contenu: "Une grille définit les critères d'évaluation et leurs niveaux de performance. Elle permet une évaluation cohérente et génère automatiquement des rétroactions personnalisées."
            },
            {
                type: 'liste',
                titre: "Structure d'une grille",
                items: [
                    "Rubriques : grandes catégories (ex: Contenu, Forme, Langue)",
                    "Critères : éléments spécifiques évalués dans chaque rubrique",
                    "Échelle : niveaux de performance (ex: Insuffisant → Excellent)",
                    "Descripteurs : description de chaque niveau pour chaque critère"
                ]
            },
            {
                type: 'exemple',
                titre: "Exemple de rubrique",
                contenu: "Rubrique « Argumentation » avec critères : Thèse claire, Arguments pertinents, Exemples appropriés, Structure logique."
            },
            {
                type: 'conseil',
                contenu: "Commence avec 3-4 rubriques maximum. Une grille trop détaillée devient difficile à utiliser en contexte réel de correction."
            }
        ],
        voirAussi: ['construction-echelles', 'evaluations-proceder']
    },

    'construction-echelles': {
        titre: "Configurer les échelles de performance",
        sections: [
            {
                type: 'texte',
                contenu: "Les échelles définissent les niveaux de performance utilisés dans tes grilles. Elles permettent de traduire une appréciation qualitative en valeur numérique."
            },
            {
                type: 'liste',
                titre: "Échelles prédéfinies disponibles",
                items: [
                    "4 niveaux : Incomplet, en Développement, Maîtrisé, Étendu",
                    "Pourcentage (5 niveaux) : 0-20%, 20-40%, 40-60%, 60-80%, 80-100%",
                    "Lettres (5 niveaux) : E, D, C, B, A",
                    "Personnalisée : crée ta propre échelle"
                ]
            },
            {
                type: 'alerte',
                niveau: 'important',
                contenu: "Modifier une échelle déjà utilisée dans des évaluations peut affecter les notes existantes. Crée plutôt une nouvelle échelle si nécessaire."
            },
            {
                type: 'conseil',
                contenu: "Une échelle à 4 niveaux (par exemple : insuffisant, en développement, maîtrisé, exemplaire) peut faciliter tes premières évaluations en te donnant des repères clairs sans trop de nuances difficiles à distinguer."
            },
            {
                type: 'texte',
                contenu: "Note optionnelle : Certains enseignants s'inspirent de cadres de recherche en sciences de l'éducation pour structurer leurs échelles de performance. La taxonomie SOLO (Structure of Observed Learning Outcomes), par exemple, décrit comment les étudiants progressent du simple au complexe dans leur apprentissage. Si ce genre d'approche théorique t'intéresse, tu peux l'explorer, mais ce n'est pas nécessaire pour utiliser l'application efficacement."
            }
        ],
        voirAussi: ['construction-cartouches', 'construction-grilles', 'construction-pratiques']
    },

    'construction-cartouches': {
        titre: "Créer des cartouches de rétroaction",
        sections: [
            {
                type: 'texte',
                contenu: "Les cartouches de rétroaction décrivent concrètement ce qui est atteint ou non pour chaque critère à chaque niveau de performance. C'est grâce aux cartouches que ta grille devient « descriptive » : elles expliquent à l'étudiant exactement ce qui est attendu."
            },
            {
                type: 'liste',
                titre: "Rôle des cartouches",
                items: [
                    "Décrire les manifestations observables de chaque niveau de performance",
                    "Générer automatiquement une rétroaction personnalisée lors de l'évaluation",
                    "Assurer la cohérence de ton évaluation d'un étudiant à l'autre",
                    "Communiquer clairement tes attentes aux étudiants"
                ]
            },
            {
                type: 'exemple',
                titre: "Exemple de cartouche pour le critère « Argumentation »",
                contenu: "Niveau « Maîtrisé » : « Ton argumentation est solide. Tu présentes une thèse claire, appuyée par des arguments pertinents et des exemples bien choisis. La structure logique facilite la compréhension de ton propos. »"
            },
            {
                type: 'conseil',
                contenu: "Rédige tes cartouches à la deuxième personne (« tu ») pour que la rétroaction s'adresse directement à l'étudiant. Décris ce qui est observé, pas seulement ce qui manque."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Une cartouche efficace est spécifique au critère évalué. Évite les formulations génériques comme « Bon travail » ou « Insuffisant » qui n'aident pas l'étudiant à comprendre ce qu'il doit améliorer."
            }
        ],
        voirAussi: ['construction-grilles', 'construction-echelles', 'evaluations-proceder']
    },

    'construction-pratiques': {
        titre: "Choisir une pratique de notation",
        sections: [
            {
                type: 'texte',
                contenu: "La pratique de notation détermine comment les résultats des évaluations sont convertis en note finale. Deux grandes familles existent : Sommative (SOM) et Progressive par atteinte de niveaux (PAN)."
            },
            {
                type: 'liste',
                titre: "Pratique Sommative (SOM)",
                items: [
                    "Calcul traditionnel : moyenne pondérée des productions",
                    "Chaque évaluation compte selon sa pondération",
                    "Simple à comprendre pour les étudiants",
                    "Adapté aux cours avec évaluations indépendantes"
                ]
            },
            {
                type: 'liste',
                titre: "Pratique Progressive (PAN)",
                items: [
                    "Basée sur l'atteinte de niveaux de compétence",
                    "Les dernières performances peuvent remplacer les premières",
                    "Utilise un système de jetons pour moduler",
                    "Adapté à l'apprentissage progressif"
                ]
            },
            {
                type: 'exemple',
                titre: "Système de jetons (PAN)",
                contenu: "Les jetons permettent de valoriser l'engagement : présence, participation, amélioration. Ils peuvent bonifier la note ou débloquer des options."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Changer de pratique en cours de trimestre recalcule toutes les notes. Informe tes étudiants de la méthode choisie dès le début."
            }
        ],
        voirAussi: ['structure-productions', 'construction-echelles']
    },

    // =========================================================================
    // PHASE 2 - HAUTE PRIORITÉ (4 aides)
    // =========================================================================

    'apercu-contenu': {
        titre: "Comprendre l'aperçu",
        sections: [
            {
                type: 'texte',
                contenu: "L'aperçu offre une vue d'ensemble de la progression de ton groupe. Les indices A-C-P-E permettent d'identifier rapidement les étudiants nécessitant un suivi particulier."
            },
            {
                type: 'liste',
                titre: "Indices de suivi (A-C-P-E)",
                items: [
                    "A - Assiduité : taux de présence aux cours",
                    "C - Complétude : productions remises vs attendues",
                    "P - Performance : niveau de réussite aux évaluations",
                    "E - Engagement : participation et implication observées"
                ]
            },
            {
                type: 'exemple',
                titre: "Lecture des couleurs",
                contenu: "Vert = satisfaisant (≥75%), Jaune = à surveiller (50-75%), Rouge = préoccupant (<50%). Un étudiant avec plusieurs indicateurs rouges mérite une attention prioritaire."
            },
            {
                type: 'conseil',
                contenu: "Consulte ce tableau chaque semaine pour détecter les situations à risque avant qu'elles ne s'aggravent."
            }
        ],
        voirAussi: ['tableau-bord-rai', 'suivi-saisie']
    },

    'tableau-bord-rai': {
        titre: "Le framework RaI (Réponse à l'Intervention)",
        sections: [
            {
                type: 'texte',
                contenu: "Le modèle RaI structure les interventions pédagogiques en trois niveaux d'intensité, permettant d'adapter le soutien aux besoins de chaque étudiant."
            },
            {
                type: 'liste',
                titre: "Les trois niveaux RaI",
                items: [
                    "Niveau 1 (Universel) : enseignement de qualité pour tous, ~80% des étudiants",
                    "Niveau 2 (Ciblé) : interventions en petit groupe, ~15% des étudiants",
                    "Niveau 3 (Intensif) : soutien individualisé, ~5% des étudiants"
                ]
            },
            {
                type: 'exemple',
                titre: "Exemple d'intervention Niveau 2",
                contenu: "Un atelier hebdomadaire de méthodologie pour les 5 étudiants ayant le plus de difficultés avec l'organisation de leurs travaux."
            },
            {
                type: 'conseil',
                contenu: "Documente tes interventions dans l'onglet dédié. Cela permet de suivre leur efficacité et d'ajuster ton approche."
            }
        ],
        voirAussi: ['apercu-contenu', 'suivi-liste']
    },

    'suivi-saisie': {
        titre: "Saisir les présences efficacement",
        sections: [
            {
                type: 'texte',
                contenu: "La saisie des présences alimente l'indice d'Assiduité de l'aperçu et permet de repérer les patterns d'absence problématiques."
            },
            {
                type: 'liste',
                titre: "États de présence disponibles",
                items: [
                    "Présent : l'étudiant était présent au cours",
                    "Absent : absence non justifiée",
                    "Justifié : absence avec motif valide (maladie, etc.)",
                    "Retard : arrivée tardive au cours"
                ]
            },
            {
                type: 'conseil',
                contenu: "Prends les présences au début du cours plutôt qu'à la fin. Utilise le bouton « Tous présents » puis ajuste les exceptions."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Les présences sont liées à la date du cours. Vérifie que la bonne date est sélectionnée avant de saisir."
            }
        ],
        voirAussi: ['apercu-contenu', 'contexte-calendrier']
    },

    'contexte-trimestre': {
        titre: "Configurer le trimestre",
        sections: [
            {
                type: 'texte',
                contenu: "Les réglages du trimestre définissent le cadre de ton cours : dates, groupes, horaires. Ces paramètres influencent plusieurs fonctionnalités de l'application."
            },
            {
                type: 'liste',
                titre: "Paramètres interdépendants",
                items: [
                    "Dates de début/fin : cadrent le calendrier des présences",
                    "Jours de cours : génèrent automatiquement les séances",
                    "Groupes : organisent les étudiants et filtrent les vues",
                    "Pratique de notation : détermine le calcul des notes"
                ]
            },
            {
                type: 'alerte',
                niveau: 'important',
                contenu: "Modifier les dates après avoir saisi des données peut créer des incohérences. Configure ces paramètres en début de trimestre."
            },
            {
                type: 'conseil',
                contenu: "Utilise la fonction d'import pour récupérer la liste de tes étudiants depuis un fichier CSV exporté de Clara ou Omnivox."
            }
        ],
        voirAussi: ['construction-pratiques', 'suivi-saisie']
    },

    // =========================================================================
    // PHASE 3 - MOYENNE PRIORITÉ (3 aides)
    // =========================================================================

    'suivi-liste': {
        titre: "La liste des étudiants",
        sections: [
            {
                type: 'texte',
                contenu: "Cette vue présente tous tes étudiants avec leurs indicateurs clés. Tu peux trier et filtrer pour identifier rapidement ceux nécessitant un suivi."
            },
            {
                type: 'liste',
                titre: "Actions disponibles",
                items: [
                    "Clique sur un nom pour voir le profil détaillé",
                    "Trie par colonne (note, assiduité, etc.)",
                    "Filtre par groupe",
                    "Exporte la liste au format CSV"
                ]
            },
            {
                type: 'conseil',
                contenu: "Trie par l'indice le plus problématique pour créer ta liste de suivi prioritaire."
            }
        ],
        voirAussi: ['apercu-contenu', 'tableau-bord-rai']
    },

    'contexte-calendrier': {
        titre: "Le calendrier des présences",
        sections: [
            {
                type: 'texte',
                contenu: "Le calendrier offre une vue d'ensemble des séances passées et à venir."
            },
            {
                type: 'liste',
                titre: "Navigation dans le calendrier",
                items: [
                    "Clique sur une date pour saisir/modifier les présences",
                    "Les dates en gras ont des présences enregistrées",
                    "Utilise les flèches pour naviguer entre les mois",
                    "La date du jour est encadrée"
                ]
            },
            {
                type: 'conseil',
                contenu: "Repère les patterns : un étudiant souvent absent le lundi peut avoir un conflit d'horaire à signaler."
            }
        ],
        voirAussi: ['suivi-saisie', 'apercu-contenu']
    },

    // =========================================================================
    // BIBLIOTHÈQUES - AIDE COMMUNE (ajouté 28 janvier 2026)
    // =========================================================================

    'bibliotheque-fonctionnement': {
        titre: "Comment fonctionne la bibliothèque",
        sections: [
            {
                type: 'texte',
                contenu: "La bibliothèque te permet de gérer ton matériel pédagogique : grilles, échelles, cartouches, pratiques et productions. Tu peux ajouter, retirer, dupliquer, exporter ou supprimer des éléments."
            },
            {
                type: 'liste',
                titre: "Comprendre les badges de source",
                items: [
                    "<strong style='color: var(--vert-succes);'>Locale</strong> : élément que tu as créé ou modifié toi-même",
                    "<strong style='color: var(--bleu-clair);'>Bibliothèque</strong> : élément provenant de la bibliothèque partagée (gabarits)",
                    "<strong style='color: var(--orange-accent);'>Retirée</strong> : élément retiré de la barre latérale mais conservé dans tes données"
                ]
            },
            {
                type: 'alerte',
                niveau: 'important',
                contenu: "<strong>Retirer ≠ Supprimer</strong><br><br><strong>Retirer</strong> : masque l'élément de la barre latérale, mais il reste dans tes données. Tu peux le réajouter plus tard depuis « Disponibles ».<br><br><strong>Supprimer</strong> : efface définitivement l'élément de tes données. Cette action est irréversible."
            },
            {
                type: 'conseil',
                contenu: "Utilise <strong>Retirer</strong> pour désencombrer ta barre latérale sans perdre tes configurations. Utilise <strong>Supprimer</strong> uniquement pour les éléments dont tu es certain de ne plus avoir besoin."
            },
            {
                type: 'liste',
                titre: "Les autres boutons",
                items: [
                    "<strong>Dupliquer</strong> : crée une copie indépendante avec un nouvel ID, idéal pour créer une variante",
                    "<strong>Exporter</strong> : télécharge l'élément en fichier JSON pour le partager ou le sauvegarder",
                    "<strong>Ajouter</strong> : transfère un élément disponible vers ta barre latérale"
                ]
            },
            {
                type: 'exemple',
                titre: "Détection des doublons",
                contenu: "Si tu vois un avertissement jaune « Doublons détectés », cela signifie que plusieurs éléments portent le même nom. Utilise les ID courts (#abc123) pour les distinguer et supprimer les copies inutiles."
            }
        ],
        voirAussi: ['construction-grilles', 'construction-echelles', 'construction-cartouches', 'construction-pratiques']
    },

    'evaluations-annoter': {
        titre: 'Annoter des travaux',
        sections: [
            {
                type: 'texte',
                contenu: 'L\'annotation te permet de marquer directement sur les copies de tes étudiants : surlignage, commentaires écrits, symboles (crochet, X) et autocollants de rétroaction pédagogique.'
            },
            {
                type: 'liste',
                titre: 'Étapes',
                items: [
                    'Sélectionne la production concernée (le travail que tu corriges)',
                    'Importe les copies (PDF, JPEG, PNG) par glisser-déposer ou via le bouton parcourir',
                    'Clique sur une copie pour l\'ouvrir dans la visionneuse',
                    'Clique sur « Annoter » pour activer la palette d\'outils',
                    'Utilise les autocollants pour apposer des rétroactions visuelles rapides',
                    'Exporte le PDF annoté ou passe directement à l\'évaluation'
                ]
            },
            {
                type: 'conseil',
                contenu: 'Nomme tes fichiers avec le DA de l\'étudiant (ex: 1234567_travail1.pdf) pour que l\'association soit automatique. Sinon, tu pourras associer manuellement chaque fichier à un étudiant.'
            },
            {
                type: 'exemple',
                titre: 'Formats de noms reconnus',
                contenu: '« 1234567_essai.pdf », « DA1234567_travail.jpg », « Dupont_Marie_1234567.pdf »'
            }
        ],
        voirAussi: ['evaluations-proceder', 'evaluations-liste']
    },

    'evaluations-liste': {
        titre: "Historique des évaluations",
        sections: [
            {
                type: 'texte',
                contenu: "Cette section liste toutes les évaluations effectuées. Tu peux consulter, modifier ou supprimer une évaluation existante."
            },
            {
                type: 'liste',
                titre: "Filtres disponibles",
                items: [
                    "Par groupe : voir un seul groupe à la fois",
                    "Par production : toutes les copies d'un même travail",
                    "Par statut : complétées, en cours, à faire",
                    "Recherche : trouver un étudiant spécifique"
                ]
            },
            {
                type: 'exemple',
                titre: "Cas d'usage",
                contenu: "Filtre par production « Examen intra » + statut « Complété » pour réviser toutes tes corrections avant de publier les notes."
            },
            {
                type: 'conseil',
                contenu: "Exporte les résultats filtrés en CSV pour les importer dans ton système de notes officiel."
            }
        ],
        voirAussi: ['evaluations-proceder', 'structure-productions']
    },

    // =========================================================================
    // PROFIL ÉTUDIANT — INDICATEURS (Tier 7.5, zones démo AQPC)
    // =========================================================================

    'profil-etudiant-indicateurs': {
        titre: "Lire les indicateurs du profil",
        sections: [
            {
                type: 'texte',
                contenu: "Le profil individuel affiche quatre indices qui te permettent de cerner rapidement la situation d'un \u00e9tudiant."
            },
            {
                type: 'liste',
                titre: "Les 4 indices A-C-P-E",
                items: [
                    "A (Assiduité) — Taux de présence aux cours. Calculé automatiquement depuis la saisie des présences.",
                    "C (Complétion) — Proportion d'artefacts remis par rapport aux artefacts attendus.",
                    "P (Performance) — Résultat composite basé sur les meilleurs artefacts évalués (selon la pratique configurée).",
                    "E (Engagement) — Cohérence entre A, C et P. Un E élevé signifie que l'étudiant est présent, remet ses travaux et performe."
                ]
            },
            {
                type: 'liste',
                titre: "Barres SRPNF (habiletés)",
                items: [
                    "S (Structure) — Organisation logique du travail.",
                    "R (Rigueur) — Précision méthodologique et respect des consignes.",
                    "P (Plausibilité) — Cohérence du raisonnement et des arguments.",
                    "N (Nuance) — Profondeur de l'analyse et prise en compte de la complexité.",
                    "F (Français) — Qualité de la langue écrite."
                ]
            },
            {
                type: 'conseil',
                contenu: "Compare les barres SRPNF entre elles pour identifier les forces et les défis récurrents. Un étudiant fort en S et R mais faible en P et N a besoin d'un accompagnement différent de celui qui est faible en F."
            },
            {
                type: 'liste',
                titre: "Niveaux RàI (Réponse à l'Intervention)",
                items: [
                    "Niveau 1 (vert) — Progression normale. L'enseignement universel suffit.",
                    "Niveau 2 (jaune) — Signes de difficulté. Interventions préventives ciblées recommandées.",
                    "Niveau 3 (rouge) — Difficulté persistante. Intervention intensive et soutien individualisé nécessaires."
                ]
            }
        ],
        voirAussi: ['profil-etudiant-accompagnement']
    },

    // =========================================================================
    // PROFIL ÉTUDIANT — ACCOMPAGNEMENT (Tier 7.5)
    // =========================================================================

    'profil-etudiant-accompagnement': {
        titre: "Accompagner un étudiant depuis son profil",
        sections: [
            {
                type: 'texte',
                contenu: "Le profil individuel centralise tout ce dont tu as besoin pour prendre des décisions d'accompagnement éclairées."
            },
            {
                type: 'liste',
                titre: "Ce que tu peux faire depuis le profil",
                items: [
                    "Consulter l'historique des évaluations et la progression dans le temps.",
                    "Identifier les patterns comportementaux (consolidation, stagnation, amélioration, régression).",
                    "Lire les rétroactions passées pour assurer la cohérence de ton accompagnement.",
                    "Créer une intervention RàI de niveau 2 ou 3 directement depuis le profil.",
                    "Exporter un rapport PDF pour un suivi institutionnel ou une rencontre parent."
                ]
            },
            {
                type: 'exemple',
                titre: "Cas typique",
                contenu: "Un étudiant montre A=85%, C=60%, P=45%. Son assiduité est bonne, mais il remet peu d'artefacts et ceux qu'il remet sont faibles. Le pattern suggère un problème de méthode de travail, pas de motivation. Une intervention de niveau 2 axée sur la planification et l'organisation pourrait aider."
            },
            {
                type: 'conseil',
                contenu: "Le profil est un outil d'aide à la décision, pas un diagnostic automatique. Les indices te guident, mais ton expertise professionnelle reste le facteur déterminant."
            }
        ],
        voirAussi: ['profil-etudiant-indicateurs']
    },

    // =========================================================================
    // INTERVENTIONS — PLANIFICATION (Tier 7.5)
    // =========================================================================

    'interventions-planification': {
        titre: "Planifier et documenter les interventions RàI",
        sections: [
            {
                type: 'texte',
                contenu: "Le module d'interventions te permet de documenter les actions que tu poses auprès des étudiants en difficulté, selon le modèle Réponse à l'Intervention (RàI) à 3 niveaux."
            },
            {
                type: 'liste',
                titre: "Les 3 niveaux RàI",
                items: [
                    "Niveau 1 — Enseignement universel. C'est ce que tu fais pour tout le groupe : cours magistral, activités, rétroactions. Pas besoin de le documenter ici.",
                    "Niveau 2 — Interventions préventives ciblées. Pour les étudiants qui montrent des signes de difficulté (C ou P en baisse, pattern de stagnation). Exemples : rencontre individuelle, exercices supplémentaires, tutorat par les pairs.",
                    "Niveau 3 — Interventions intensives. Pour les étudiants en difficulté persistante malgré le niveau 2. Exemples : plan d'intervention formel, référence au centre d'aide, accommodements, suivi hebdomadaire structuré."
                ]
            },
            {
                type: 'conseil',
                contenu: "Documente tes interventions même brièvement. En fin de trimestre, cette trace te permettra de justifier tes décisions pédagogiques et de planifier le trimestre suivant."
            },
            {
                type: 'exemple',
                titre: "Quand passer au niveau supérieur ?",
                contenu: "Si après 2-3 semaines d'intervention de niveau 2, les indices C et P de l'étudiant ne s'améliorent pas (ou continuent de baisser), il est temps de considérer le niveau 3. Le profil étudiant te montre cette progression dans le temps."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Les interventions de niveau 3 impliquent souvent des ressources externes (centre d'aide, API, conseiller pédagogique). Vérifie les ressources disponibles dans ton cégep avant de t'engager dans un plan intensif."
            }
        ],
        voirAussi: ['profil-etudiant-indicateurs', 'profil-etudiant-accompagnement']
    },

    // =========================================================================
    // SUIVI DE L'APPRENTISSAGE DES FONDAMENTAUX
    // =========================================================================

    'suivi-apprentissage-fondamentaux': {
        titre: "Suivi de l'apprentissage des fondamentaux",
        sections: [
            {
                type: 'texte',
                contenu: "Cet encadré surveille la progression de l'étudiant sur les critères multistructurels (fondations) de ta grille de dépistage. Il croise deux informations : combien d'artefacts consécutifs sont sous le seuil (IPB) et la direction de la progression."
            },
            {
                type: 'liste',
                titre: 'Lecture des pastilles',
                items: [
                    "Chaque pastille représente un artefact évalué (ancien → récent, de gauche à droite).",
                    "La couleur correspond au niveau IDME du score multistructurel : I (insuffisant), D (développement), M (maîtrisé), E (étendu).",
                    "L'IPB compte les pastilles consécutives sous le seuil de maîtrise, en partant du plus récent."
                ]
            },
            {
                type: 'conseil',
                contenu: "Un diagnostic de « Plateau » n'est pas nécessairement négatif — un score stable en zone D peut indiquer une consolidation. Le jugement professionnel reste essentiel."
            },
            {
                type: 'texte',
                contenu: "Configure les critères surveillés dans Structure → Grille de critères (tag SOLO). Ajuste le seuil et la fenêtre d'analyse dans Contexte → Dépistage."
            }
        ],
        voirAussi: ['profil-etudiant-indicateurs']
    }
};

// Export pour utilisation dans aide-contextuelle.js
if (typeof window !== 'undefined') {
    window.AIDE_CONTEXTUELLE = AIDE_CONTEXTUELLE;
}


})();
