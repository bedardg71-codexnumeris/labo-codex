/**
 * aide-contextuelle-contenu.js
 * Contenu des aides contextuelles pour le Mode Assisté
 *
 * Types de sections supportés :
 * - texte : paragraphe simple
 * - liste : liste à puces avec titre optionnel
 * - conseil : encadré vert avec conseil pratique
 * - exemple : encadré bleu avec exemple
 * - alerte : encadré orange avec avertissement (niveau: 'attention' | 'important')
 */

const AIDE_CONTEXTUELLE = {

    // =========================================================================
    // CONSTRUCTION - APERÇU
    // =========================================================================

    'construction-apercu': {
        titre: "Vue d'ensemble du matériel pédagogique",
        sections: [
            {
                type: 'texte',
                contenu: "Cette page présente un résumé de tout le matériel pédagogique configuré pour votre cours : productions, grilles de critères, échelles de performance et pratiques de notation."
            },
            {
                type: 'liste',
                titre: "Éléments affichés",
                items: [
                    "Productions : travaux à évaluer (examens, devoirs, projets)",
                    "Grilles : critères d'évaluation pour chaque production",
                    "Échelles : niveaux de performance (IDME, pourcentages, etc.)",
                    "Pratiques : méthode de calcul de la note finale"
                ]
            },
            {
                type: 'conseil',
                contenu: "Configurez votre matériel dans cet ordre : 1) Pratique de notation, 2) Échelles, 3) Grilles, 4) Productions. Cette séquence assure une configuration cohérente."
            }
        ],
        voirAussi: ['construction-productions', 'construction-grilles', 'construction-pratiques']
    },

    // =========================================================================
    // PHASE 1 - CRITIQUES (5 aides)
    // =========================================================================

    'evaluations-proceder': {
        titre: "Procéder à une évaluation",
        sections: [
            {
                type: 'texte',
                contenu: "Cette interface permet d'évaluer le travail d'un·e étudiant·e sur une production. L'évaluation génère automatiquement une rétroaction personnalisée basée sur vos critères."
            },
            {
                type: 'liste',
                titre: "Étapes recommandées",
                items: [
                    "Sélectionner l'étudiant·e dans la liste déroulante",
                    "Choisir la production à évaluer",
                    "Évaluer chaque critère de la grille en cliquant sur le niveau atteint",
                    "Vérifier et ajuster la rétroaction générée si nécessaire",
                    "Cliquer sur « Sauvegarder l'évaluation »"
                ]
            },
            {
                type: 'conseil',
                contenu: "Le mode « Évaluation en série » (bouton en haut) permet d'enchaîner plusieurs étudiants sur la même production, idéal pour corriger un lot de travaux."
            },
            {
                type: 'exemple',
                titre: "Raccourci clavier",
                contenu: "Utilisez les touches 1-2-3-4-5 pour évaluer rapidement chaque critère sans utiliser la souris."
            }
        ],
        voirAussi: ['construction-grilles', 'construction-echelles']
    },

    'construction-productions': {
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
                contenu: "La somme des pondérations de toutes les productions devrait totaliser 100%. Vérifiez le total affiché en bas de la liste."
            },
            {
                type: 'conseil',
                contenu: "Créez vos productions au début du trimestre pour avoir une vue d'ensemble de votre plan d'évaluation."
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
                contenu: "Commencez avec 3-4 rubriques maximum. Une grille trop détaillée devient difficile à utiliser en contexte réel de correction."
            }
        ],
        voirAussi: ['construction-echelles', 'evaluations-proceder']
    },

    'construction-echelles': {
        titre: "Configurer les échelles de performance",
        sections: [
            {
                type: 'texte',
                contenu: "Les échelles définissent les niveaux de performance utilisés dans vos grilles. Elles permettent de traduire une appréciation qualitative en valeur numérique."
            },
            {
                type: 'liste',
                titre: "Échelles prédéfinies disponibles",
                items: [
                    "IDME (4 niveaux) : Insuffisant, En développement, Maîtrisé, Exemplaire",
                    "Pourcentage (5 niveaux) : 0-20%, 20-40%, 40-60%, 60-80%, 80-100%",
                    "Lettres (5 niveaux) : E, D, C, B, A",
                    "Personnalisée : créez votre propre échelle"
                ]
            },
            {
                type: 'alerte',
                niveau: 'important',
                contenu: "Modifier une échelle déjà utilisée dans des évaluations peut affecter les notes existantes. Créez plutôt une nouvelle échelle si nécessaire."
            },
            {
                type: 'conseil',
                contenu: "L'échelle IDME est recommandée pour débuter : ses 4 niveaux facilitent les décisions d'évaluation."
            }
        ],
        voirAussi: ['construction-grilles', 'construction-pratiques']
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
                contenu: "Changer de pratique en cours de trimestre recalcule toutes les notes. Informez vos étudiants de la méthode choisie dès le début."
            }
        ],
        voirAussi: ['construction-productions', 'construction-echelles']
    },

    // =========================================================================
    // PHASE 2 - HAUTE PRIORITÉ (4 aides)
    // =========================================================================

    'tableau-bord-apercu': {
        titre: "Comprendre le tableau de bord",
        sections: [
            {
                type: 'texte',
                contenu: "Le tableau de bord offre une vue d'ensemble de la progression de votre groupe. Les indices A-C-P-E permettent d'identifier rapidement les étudiants nécessitant un suivi particulier."
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
                contenu: "Consultez ce tableau chaque semaine pour détecter les situations à risque avant qu'elles ne s'aggravent."
            }
        ],
        voirAussi: ['tableau-bord-rai', 'presences-saisie']
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
                contenu: "Documentez vos interventions dans l'onglet dédié. Cela permet de suivre leur efficacité et d'ajuster votre approche."
            }
        ],
        voirAussi: ['tableau-bord-apercu', 'tableau-bord-liste']
    },

    'presences-saisie': {
        titre: "Saisir les présences efficacement",
        sections: [
            {
                type: 'texte',
                contenu: "La saisie des présences alimente l'indice d'Assiduité du tableau de bord et permet de repérer les patterns d'absence problématiques."
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
                contenu: "Prenez les présences au début du cours plutôt qu'à la fin. Utilisez le bouton « Tous présents » puis ajustez les exceptions."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Les présences sont liées à la date du cours. Vérifiez que la bonne date est sélectionnée avant de saisir."
            }
        ],
        voirAussi: ['tableau-bord-apercu', 'presences-calendrier']
    },

    'reglages-trimestre': {
        titre: "Configurer le trimestre",
        sections: [
            {
                type: 'texte',
                contenu: "Les réglages du trimestre définissent le cadre de votre cours : dates, groupes, horaires. Ces paramètres influencent plusieurs fonctionnalités de l'application."
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
                contenu: "Modifier les dates après avoir saisi des données peut créer des incohérences. Configurez ces paramètres en début de trimestre."
            },
            {
                type: 'conseil',
                contenu: "Utilisez la fonction d'import pour récupérer la liste de vos étudiants depuis un fichier CSV exporté de Clara ou Omnivox."
            }
        ],
        voirAussi: ['construction-pratiques', 'presences-saisie']
    },

    // =========================================================================
    // PHASE 3 - MOYENNE PRIORITÉ (3 aides)
    // =========================================================================

    'tableau-bord-liste': {
        titre: "La liste des étudiants",
        sections: [
            {
                type: 'texte',
                contenu: "Cette vue présente tous vos étudiants avec leurs indicateurs clés. Vous pouvez trier et filtrer pour identifier rapidement ceux nécessitant un suivi."
            },
            {
                type: 'liste',
                titre: "Actions disponibles",
                items: [
                    "Cliquer sur un nom pour voir le profil détaillé",
                    "Trier par colonne (note, assiduité, etc.)",
                    "Filtrer par groupe",
                    "Exporter la liste au format CSV"
                ]
            },
            {
                type: 'conseil',
                contenu: "Triez par l'indice le plus problématique pour créer votre liste de suivi prioritaire."
            }
        ],
        voirAussi: ['tableau-bord-apercu', 'tableau-bord-rai']
    },

    'presences-calendrier': {
        titre: "Le calendrier des présences",
        sections: [
            {
                type: 'texte',
                contenu: "Le calendrier offre une vue d'ensemble des séances passées et à venir. Les codes couleur indiquent le taux de présence de chaque séance."
            },
            {
                type: 'liste',
                titre: "Navigation dans le calendrier",
                items: [
                    "Cliquer sur une date pour saisir/modifier les présences",
                    "Les dates en gras ont des présences enregistrées",
                    "Utilisez les flèches pour naviguer entre les mois",
                    "La date du jour est encadrée"
                ]
            },
            {
                type: 'conseil',
                contenu: "Repérez les patterns : un étudiant souvent absent le lundi peut avoir un conflit d'horaire à signaler."
            }
        ],
        voirAussi: ['presences-saisie', 'tableau-bord-apercu']
    },

    'evaluations-liste': {
        titre: "Historique des évaluations",
        sections: [
            {
                type: 'texte',
                contenu: "Cette section liste toutes les évaluations effectuées. Vous pouvez consulter, modifier ou supprimer une évaluation existante."
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
                contenu: "Filtrez par production « Examen intra » + statut « Complété » pour réviser toutes vos corrections avant de publier les notes."
            },
            {
                type: 'conseil',
                contenu: "Exportez les résultats filtrés en CSV pour les importer dans votre système de notes officiel."
            }
        ],
        voirAussi: ['evaluations-proceder', 'construction-productions']
    }
};

// Export pour utilisation dans aide-contextuelle.js
if (typeof window !== 'undefined') {
    window.AIDE_CONTEXTUELLE = AIDE_CONTEXTUELLE;
}
