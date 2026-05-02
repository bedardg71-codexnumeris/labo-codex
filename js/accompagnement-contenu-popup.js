/**
 * accompagnement-contenu-popup.js
 * Catalogue de contenu pour le mode `popup` (modale riche ✴️).
 *
 * Types de sections supportés :
 * - texte : paragraphe simple
 * - liste : liste à puces avec titre optionnel
 * - conseil : encadré vert avec conseil pratique
 * - exemple : encadré bleu avec exemple
 * - alerte : encadré orange avec avertissement (niveau: 'attention' | 'important')
 *
 * Convention : tutoiement systématique.
 *
 * Pousse les ~40 entrées dans CATALOGUE_ACCOMPAGNEMENT via
 * window.accompagnement.ajouterEntrees(). DOIT être chargé APRÈS
 * js/accompagnement.js.
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
                contenu: "Prendre le temps de réfléchir à tes objectifs d'apprentissage avant de configurer ton matériel peut t'aider à créer des grilles plus cohérentes. Clique sur le bouton ✴️ « Réfléchir à tes objectifs » si tu veux des pistes de réflexion."
            }
        ],
        voirAussi: ['construction-objectifs-reflexion', 'structure-productions', 'construction-grilles', 'construction-pratiques']
    },

    // =========================================================================
    // PHASE 1 - CRITIQUES (5 aides)
    // =========================================================================

    'evaluations-proceder': {
        titre: '\u00c9valuer une production',
        sections: [
            {
                type: 'texte',
                contenu: 'Pour \u00e9valuer une production, s\u00e9lectionne d\u2019abord la grille, l\u2019\u00e9chelle et la cartouche associ\u00e9es \u2014 elles sont normalement d\u00e9j\u00e0 configur\u00e9es dans Structure. Attribue ensuite un niveau \u00e0 chaque crit\u00e8re\u00a0: la note et la r\u00e9troaction se construisent au fur et \u00e0 mesure. Tu peux pr\u00e9visualiser le commentaire complet avant de le copier dans le presse-papier.'
            },
            {
                type: 'conseil',
                contenu: 'Si tu utilises des jetons, rappelle-toi qu\u2019ils offrent \u00e0 l\u2019\u00e9tudiant\u00b7e une nouvelle occasion de d\u00e9montrer sa comp\u00e9tence \u2014 pas simplement d\u2019am\u00e9liorer une note.'
            },
        ],
        voirAussi: ['evaluations-annoter', 'construction-grilles', 'construction-echelles', 'construction-cartouches']
    },

    'structure-productions': {
        titre: 'Productions',
        sections: [
            {
                type: 'texte',
                contenu: 'Assure-toi que la somme des pond\u00e9rations de tes productions totalise 100\u00a0%. Pour les portfolios, d\u00e9finis d\u2019abord le nombre d\u2019artefacts \u00e0 retenir (ex.\u00a0: les 3 meilleurs sur 9) \u2014 ce sont les N meilleures d\u00e9monstrations de comp\u00e9tence qui comptent. Les artefacts individuels n\u2019ont pas de pond\u00e9ration propre\u00a0: c\u2019est le portfolio conteneur qui porte le poids dans la note finale.'
            },
            {
                type: 'conseil',
                contenu: 'Pense \u00e0 verrouiller les productions une fois finalis\u00e9es pour \u00e9viter les modifications accidentelles.'
            },
        ],
        voirAussi: ['construction-grilles', 'construction-pratiques']
    },

    'construction-grilles': {
        titre: 'Grilles de crit\u00e8res',
        sections: [
            {
                type: 'texte',
                contenu: 'Pour certains crit\u00e8res (ex.\u00a0: fran\u00e7ais \u00e9crit), quand une notation n\u00e9gative est appliqu\u00e9e, tu peux utiliser le type algorithmique avec la formule (nb_erreurs\u00a0/\u00a0nb_mots)\u00a0\u00d7\u00a0100. Les grilles peuvent \u00eatre dupliqu\u00e9es et modifi\u00e9es pour cr\u00e9er des variantes adapt\u00e9es \u00e0 diff\u00e9rents types de productions.'
            },
            {
                type: 'conseil',
                contenu: 'Nomme tes grilles de fa\u00e7on descriptive (ex.\u00a0: \u00ab\u00a0Grille analyse litt\u00e9raire\u00a0\u00bb, \u00ab\u00a0Grille laboratoire\u00a0\u00bb) \u2014 tu les retrouveras plus facilement.'
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: 'La somme des pond\u00e9rations des crit\u00e8res doit totaliser 100\u00a0%.'
            },
        ],
        voirAussi: ['construction-echelles', 'construction-cartouches', 'evaluations-proceder']
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
        titre: 'Cartouches de r\u00e9troaction',
        sections: [
            {
                type: 'texte',
                contenu: 'Pour \u00eatre efficaces, les commentaires de r\u00e9troaction doivent \u00eatre lus et\u2026 compris\u00a0! Id\u00e9alement ils peuvent avoir entre 50 et 75 mots environ. R\u00e9dige-les de fa\u00e7on personnelle et constructive \u2014 c\u2019est ce que tes \u00e9tudiant\u00b7es liront.'
            },
            {
                type: 'texte',
                contenu: 'Chaque cellule de la matrice correspond \u00e0 un commentaire pour un niveau de performance donn\u00e9 sur un crit\u00e8re sp\u00e9cifique. Tu peux utiliser les codes de ta grille (ex.\u00a0: I, D, M, E) et le format propos\u00e9 pour structurer tes commentaires.'
            },
            {
                type: 'conseil',
                contenu: 'Les cartouches peuvent \u00eatre verrouill\u00e9es une fois finalis\u00e9es pour \u00e9viter les modifications accidentelles.'
            },
        ],
        voirAussi: ['construction-grilles', 'construction-echelles', 'evaluations-proceder']
    },

    'construction-pratiques': {
        titre: 'Pratiques de notation',
        sections: [
            {
                type: 'texte',
                contenu: 'Quatre pratiques sont disponibles. Choisis celle qui correspond \u00e0 ta philosophie d\u2019enseignement \u2014 tu peux toujours la changer.'
            },
            {
                type: 'liste',
                titre: 'Les quatre pratiques',
                items: [
                    '<strong>Sommative (SOM)</strong> \u2014 calcule une moyenne pond\u00e9r\u00e9e traditionnelle.',
                    '<strong>PAN par standards (STD)</strong> \u2014 retient les meilleures d\u00e9monstrations de comp\u00e9tence\u00a0; l\u2019\u00e9tudiant\u00b7e progresse en montrant sa ma\u00eetrise, pas en accumulant des points.',
                    '<strong>PAN par sp\u00e9cifications (SPE)</strong> \u2014 fonctionne par contrat\u00a0: chaque production est r\u00e9ussie ou non selon des crit\u00e8res pr\u00e9d\u00e9finis\u00a0; c\u2019est l\u2019ensemble des cibles atteintes qui d\u00e9termine la note.',
                    '<strong>D\u00e9notation (DEN)</strong> \u2014 r\u00e9duit ou \u00e9limine la notation chiffr\u00e9e au profit de la r\u00e9troaction qualitative.',
                ]
            },
            {
                type: 'conseil',
                contenu: 'En cas de doute, commence par SOM (la plus famili\u00e8re) et fais \u00e9voluer ta pratique au fil des sessions.'
            },
        ],
        voirAussi: ['structure-productions', 'construction-echelles']
    },

    // =========================================================================
    // PHASE 2 - HAUTE PRIORITÉ (4 aides)
    // =========================================================================

    'tableau-bord-rai': {
        titre: "Le mod\u00e8le R\u00e0I (R\u00e9ponse \u00e0 l'Intervention)",
        sections: [
            {
                type: 'texte',
                contenu: "Le mod\u00e8le R\u00e0I structure les interventions p\u00e9dagogiques en trois niveaux d'intensit\u00e9. L'application s'en inspire pour cat\u00e9goriser les besoins observ\u00e9s, sans prescrire une pratique particuli\u00e8re."
            },
            {
                type: 'liste',
                titre: "Les trois niveaux",
                items: [
                    "<strong>Niveau 1 \u2014 Universel</strong>\u00a0: enseignement de qualit\u00e9 pour tout le groupe.",
                    "<strong>Niveau 2 \u2014 Cibl\u00e9</strong>\u00a0: interventions pr\u00e9ventives pour les \u00e9tudiant\u00b7es en difficult\u00e9 \u00e9mergente.",
                    "<strong>Niveau 3 \u2014 Intensif</strong>\u00a0: soutien individualis\u00e9 pour les difficult\u00e9s persistantes."
                ]
            },
            {
                type: 'conseil',
                contenu: "Les proportions d\u2019\u00e9l\u00e8ves par niveau varient selon le contexte et ta propre pratique professionnelle. L\u2019application te laisse d\u00e9finir les seuils dans R\u00e9glages \u203a D\u00e9pistage."
            }
        ],
        voirAussi: ['interventions-planification', 'depistage-interpretation', 'suivi-liste']
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
        voirAussi: ['tableau-bord-apercu', 'contexte-calendrier']
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
        titre: 'Liste des \u00e9tudiant\u00b7es',
        sections: [
            {
                type: 'texte',
                contenu: 'Pour ajouter, modifier ou supprimer des \u00e9tudiant\u00b7es, va dans R\u00e9glages\u00a0>\u00a0Groupe. La liste ici refl\u00e8te automatiquement les changements que tu fais l\u00e0-bas.'
            },
        ],
        voirAussi: ['contexte-groupe-etudiants', 'tableau-bord-apercu', 'tableau-bord-rai']
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
        voirAussi: ['suivi-saisie', 'tableau-bord-apercu']
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
                    "<strong class='badge-source-locale'>Locale</strong> : élément que tu as créé ou modifié toi-même",
                    "<strong class='badge-source-bibliotheque'>Bibliothèque</strong> : élément provenant de la bibliothèque partagée (gabarits)",
                    "<strong class='badge-source-retiree'>Retirée</strong> : élément retiré de la barre latérale mais conservé dans tes données"
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
                contenu: 'Le DA de l\'étudiant (7 chiffres) doit minimalement apparaître dans le nom du fichier pour que l\'association et le regroupement multi-pages soient automatiques. Le format LEA complet (NOM_DA_Production_Remis_le_AAAA-MM-JJ_HHhMMmSSs) est reconnu directement.'
            },
            {
                type: 'exemple',
                titre: 'Formats de noms reconnus',
                contenu: '« 1234567_essai.pdf », « DA1234567_travail.jpg », « Dupont_Marie_1234567.pdf », « Tremblay_1234567_Artefact-8a.jpeg » (multi-pages : a, b, c…)'
            },
            {
                type: 'conseil',
                contenu: 'Pour un travail multi-pages, nomme chaque page avec le même DA et la même production (ex: « Tremblay_1234567_Artefact-8a.jpeg », « ...8b.jpeg »). Les pages seront automatiquement assemblées en un seul PDF dans l\'ordre alphabétique du nom de fichier.'
            },
            {
                type: 'liste',
                titre: 'Traitements automatiques à l\'import',
                items: [
                    'Balance des blancs : correction colorimétrique des photos prises en classe',
                    'Uniformisation DPI : 250 dpi par défaut, ajustable dans le pipeline (200, 250 ou 300)',
                    'Compression JPEG des images pour limiter le stockage',
                    'Assemblage multi-pages : les fichiers d\'un même étudiant pour une même production sont regroupés',
                    'Détection des doublons : avertissement si un fichier identique (même étudiant + même production) existe déjà',
                    'Les PDF sont importés tels quels, sans modification'
                ]
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
                contenu: "Le profil individuel affiche trois indices qui te permettent de cerner rapidement la situation d'un \u00e9tudiant."
            },
            {
                type: 'liste',
                titre: "Les 3 indices A-C-P",
                items: [
                    "A (Assiduit\u00e9) \u2014 Mesure l\u2019exposition de l\u2019\u00e9tudiant\u00b7e aux situations d\u2019apprentissage\u00a0: sa pr\u00e9sence en classe. Ce n\u2019est pas un jugement sur la qualit\u00e9 de sa participation.",
                    "C (Compl\u00e9tion) \u2014 Mesure la r\u00e9gularit\u00e9 de la mise en pratique\u00a0: les artefacts remis par rapport aux artefacts attendus. C\u2019est le constat d\u2019un effort, pas de sa qualit\u00e9.",
                    "P (Performance) \u2014 Mesure la comp\u00e9tence d\u00e9montr\u00e9e au moment T, selon la pratique de notation configur\u00e9e. C\u2019est une photographie, pas un pronostic."
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
            },
            {
                type: 'conseil',
                contenu: "Ces indices sont des rep\u00e8res, pas des verdicts. Un A faible peut s\u2019expliquer par un contexte personnel d\u00e9favorable sur lequel tu n\u2019as pas de contr\u00f4le. Un P plus faible en d\u00e9but de trimestre est \u00e9galement normal. C\u2019est la trajectoire qui compte, pas l\u2019\u00e9valuation isol\u00e9e."
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
                    "Voir le niveau RàI, le pattern d'apprentissage et la direction de chaque critère (↗ amélioration, ← détérioration, — plateau).",
                    "Consulter la consolidation par critère : consolidé, fragile ou non consolidé.",
                    "Identifier les forces et défis selon la taxonomie SOLO.",
                    "Créer une intervention RàI directement (bouton Nouvelle intervention) — l'étudiant sera pré-coché avec les critères en défi.",
                    "Exporter un rapport PDF pour un suivi institutionnel ou une rencontre."
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
                contenu: "Le module d'interventions te permet de planifier, documenter et évaluer tes actions auprès des étudiants en difficulté, selon le modèle Réponse à l'Intervention (RàI)."
            },
            {
                type: 'liste',
                titre: "Les 3 niveaux RàI",
                items: [
                    "Niveau 1 — Enseignement universel. C'est ce que tu fais pour tout le groupe. Pas besoin de le documenter ici.",
                    "Niveau 2 — Interventions préventives ciblées. Pour les étudiants en difficulté émergente ou en développement. Séance de rattrapage ou petit groupe en classe.",
                    "Niveau 3 — Interventions intensives. Pour les étudiants en difficulté persistante malgré le niveau 2. Rencontre individuelle hors classe, référence aux services."
                ]
            },
            {
                type: 'liste',
                titre: "Le formulaire unifié",
                items: [
                    "Logistique — Titre, niveau RàI, contexte (rattrapage ou en classe), date, durée.",
                    "Ciblage — Coche les étudiants concernés. L'aperçu du sous-groupe (patterns, niveaux RàI) s'affiche en temps réel.",
                    "Critères ciblés — Pré-cochés automatiquement depuis les défis communs du sous-groupe (grille de dépistage). Tu peux ajuster.",
                    "Objectif visé — Suggestion automatique basée sur le critère le plus faible et le prochain seuil IDME. Tu peux modifier librement.",
                    "Observations — Notes générales et individuelles par étudiant.",
                    "Bilan — Apparaît quand tu marques l'intervention comme complétée. Comparaison automatique avant/après sur les critères ciblés."
                ]
            },
            {
                type: 'conseil',
                contenu: "Tu peux créer une intervention directement depuis le profil d'un étudiant (onglet Accompagnement → Nouvelle intervention). L'étudiant sera pré-coché et le niveau RàI dérivé de son profil."
            },
            {
                type: 'exemple',
                titre: "Enseigner, \u00e9valuer, ajuster",
                contenu: "Tu interviens sur les crit\u00e8res cibl\u00e9s (niveau 2). Au fil des productions suivantes, tu observes la trajectoire. Quand tu marques l\u2019intervention comme compl\u00e9t\u00e9e, le bilan compare les scores avant et apr\u00e8s sur les crit\u00e8res cibl\u00e9s. Selon le r\u00e9sultat, tu choisis\u00a0: reconduire l\u2019intervention, ajuster la cible, ou r\u00e9f\u00e9rer vers un soutien plus intensif."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Les interventions de niveau 3 d\u00e9passent parfois ce que l\u2019enseignant\u00b7e peut faire seul. Les services adapt\u00e9s, l\u2019aide p\u00e9dagogique individuelle (API) ou les centres d\u2019aide sont des ressources \u00e0 mobiliser."
            }
        ],
        voirAussi: ['profil-etudiant-indicateurs', 'profil-etudiant-accompagnement', 'suivi-apprentissage-fondamentaux']
    },

    // =========================================================================
    // SUIVI DE L'APPRENTISSAGE DES FONDAMENTAUX
    // =========================================================================

    'suivi-apprentissage-fondamentaux': {
        titre: "Suivi de l'apprentissage des fondamentaux",
        sections: [
            {
                type: 'texte',
                contenu: "Cet encadré surveille la progression de l'étudiant sur les critères multistructurels (fondations) de ta grille de dépistage. Il croise deux informations : le nombre d'artefacts consécutifs sous le seuil et la direction de la progression."
            },
            {
                type: 'liste',
                titre: 'Lecture des pastilles',
                items: [
                    "Chaque pastille représente un artefact évalué (ancien → récent, de gauche à droite).",
                    "La couleur correspond au niveau IDME du score multistructurel : I (insuffisant), D (développement), M (maîtrisé), E (étendu).",
                    "Le compteur de pastilles consécutives sous le seuil se calcule en partant du plus récent."
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
    },

    'tableau-bord-apercu': {
        titre: 'Aper\u00e7u du groupe (indices A-C-P)',
        sections: [
            {
                type: 'texte',
                contenu: 'Les trois indices A-C-P r\u00e9sument le contexte d\u2019apprentissage observ\u00e9 de chaque \u00e9tudiant\u00b7e.'
            },
            {
                type: 'liste',
                titre: 'Les trois indices',
                items: [
                    '<strong>A \u2014 Assiduit\u00e9</strong>\u00a0: pr\u00e9sence en classe.',
                    '<strong>C \u2014 Compl\u00e9tion</strong>\u00a0: remise des productions.',
                    '<strong>P \u2014 Performance</strong>\u00a0: r\u00e9sultats aux \u00e9valuations.',
                ]
            },
            {
                type: 'texte',
                contenu: 'Les zones de couleur \u2014 Fragile, Mod\u00e9r\u00e9, Favorable, Tr\u00e8s favorable \u2014 t\u2019aident \u00e0 rep\u00e9rer rapidement qui a besoin d\u2019attention.'
            },
            {
                type: 'exemple',
                titre: 'Lire les \u00e9carts',
                contenu: 'Un\u00b7e \u00e9tudiant\u00b7e avec un C \u00e9lev\u00e9 mais un P faible fournit l\u2019effort sans obtenir les r\u00e9sultats\u00a0: c\u2019est un signal pour intervenir. Tu peux ensuite regarder plus pr\u00e9cis\u00e9ment sur quel crit\u00e8re ou habilet\u00e9 se situe la difficult\u00e9.'
            },
        ],
        voirAussi: ['tableau-bord-rai', 'profil-etudiant-indicateurs', 'suivi-liste']
    },

    'contexte-cours': {
        titre: 'Cours',
        sections: [
            {
                type: 'texte',
                contenu: 'Un seul cours peut \u00eatre actif \u00e0 la fois \u2014 c\u2019est celui qui sert de r\u00e9f\u00e9rence dans toute l\u2019application. Le code de cours suit le format habituel 000-000-XX (discipline-cours-lettres).'
            },
            {
                type: 'conseil',
                contenu: 'Tu peux dupliquer un cours pour cr\u00e9er rapidement une nouvelle session en modifiant seulement l\u2019ann\u00e9e, et verrouiller un cours termin\u00e9 pour \u00e9viter les modifications accidentelles.'
            },
        ],
        voirAussi: ['contexte-trimestre', 'construction-pratiques']
    },

    'contexte-horaire': {
        titre: 'Horaire',
        sections: [
            {
                type: 'texte',
                contenu: 'Choisis le format qui correspond \u00e0 ton horaire r\u00e9el\u00a0: 2\u00d72h (deux p\u00e9riodes s\u00e9par\u00e9es dans la semaine, ex.\u00a0: lundi et jeudi), 1\u00d74h (cours intensif en une seule p\u00e9riode continue) ou 1\u00d73h (une seule p\u00e9riode continue).'
            },
            {
                type: 'exemple',
                titre: 'Format des heures',
                contenu: 'Les heures utilisent le format 24h (ex.\u00a0: 13:00, pas 1:00\u00a0PM). Les s\u00e9ances de reprise sont ajout\u00e9es automatiquement quand tu configures les cong\u00e9s dans la section Trimestre.'
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: 'Si tu modifies le format horaire, les s\u00e9ances existantes seront recr\u00e9\u00e9es.'
            },
        ],
        voirAussi: ['contexte-trimestre', 'contexte-calendrier', 'suivi-saisie']
    },

    'contexte-groupe-etudiants': {
        titre: 'Groupe d\u2019\u00e9tudiant\u00b7es',
        sections: [
            {
                type: 'texte',
                contenu: 'Le champ Groupe permet d\u2019organiser tes \u00e9tudiant\u00b7es si tu as plusieurs groupes (ex.\u00a0: Groupe 1, Groupe 2) \u2014 utilise le filtre en haut pour afficher un groupe sp\u00e9cifique.'
            },
            {
                type: 'liste',
                titre: 'Format d\u2019import en lot (7 colonnes)',
                items: [
                    'DA',
                    'Groupe',
                    'Nom',
                    'Pr\u00e9nom',
                    'Programme',
                    'Nom du programme',
                    'SA (Services adapt\u00e9s)',
                ]
            },
            {
                type: 'conseil',
                contenu: 'Tu peux coller directement depuis un tableur ou le syst\u00e8me de gestion institutionnel \u2014 la pr\u00e9visualisation te permet de v\u00e9rifier avant d\u2019importer. La liste configur\u00e9e ici est automatiquement disponible dans le tableau de bord.'
            },
            {
                type: 'alerte',
                niveau: 'important',
                contenu: 'Le bouton \u00ab\u00a0R\u00e9initialiser\u00a0\u00bb supprime tous les \u00e9tudiant\u00b7es de fa\u00e7on irr\u00e9versible.'
            },
        ],
        voirAussi: ['suivi-liste', 'suivi-saisie']
    },

    'depistage-interpretation': {
        titre: 'Seuils d\u2019interpr\u00e9tation du d\u00e9pistage',
        sections: [
            {
                type: 'texte',
                contenu: 'Les seuils d\u2019interpr\u00e9tation d\u00e9terminent les couleurs et les alertes dans tout le tableau de bord. Toute modification s\u2019applique imm\u00e9diatement \u00e0 tous les calculs \u2014 diagnostics R\u00e0I, patterns et recommandations.'
            },
            {
                type: 'exemple',
                titre: 'Valeurs par d\u00e9faut',
                contenu: 'Progression\u00a0: 5 points (%). Direction du risque\u00a0: 5 points (%). D\u00e9fi\u00a0: \u2264\u00a070\u00a0%.'
            },
            {
                type: 'conseil',
                contenu: 'En cas de doute, le bouton \u00ab\u00a0Restaurer\u00a0\u00bb remet les valeurs par d\u00e9faut.'
            },
        ],
        voirAussi: ['tableau-bord-rai', 'interventions-planification']
    },

    'planification-alignement': {
        titre: 'Alignement p\u00e9dagogique (carte mentale)',
        sections: [
            {
                type: 'texte',
                contenu: 'La carte mentale rend visible l\u2019alignement p\u00e9dagogique de ton cours\u00a0: les liens entre ce que tu vises (comp\u00e9tence, connaissances), comment tu l\u2019enseignes (activit\u00e9s, soutien) et comment tu le v\u00e9rifies (\u00e9valuations).'
            },
            {
                type: 'conseil',
                contenu: 'Tu n\u2019es pas oblig\u00e9\u00b7e de suivre un ordre lin\u00e9aire \u2014 commence par ce qui te semble naturel.'
            },
            {
                type: 'exemple',
                titre: 'Signalements d\u2019incoh\u00e9rence',
                contenu: 'L\u2019application signale les incoh\u00e9rences\u00a0: un objectif sans production li\u00e9e, une connaissance sans \u00e9valuation pr\u00e9vue. Utilise ces alertes comme des pistes de r\u00e9flexion, pas comme des erreurs \u00e0 corriger.'
            },
            {
                type: 'texte',
                contenu: 'Les \u00e9valuations servent \u00e0 livrer une r\u00e9troaction et peuvent prendre plusieurs formes (orale, \u00e9crite, etc.).'
            },
        ],
        voirAussi: ['structure-productions', 'construction-grilles']
    },

    // =========================================================================
    // MIGRATION tooltip-aide → primo-aide (ex-infobulles navigateur)
    // =========================================================================

    'apc-activite': {
        titre: 'Activit\u00e9 d\u2019apprentissage dans une APC',
        sections: [
            {
                type: 'texte',
                contenu: 'Dans une approche par comp\u00e9tences (APC), une activit\u00e9 d\u2019\u00e9valuation est g\u00e9n\u00e9ralement centr\u00e9e sur l\u2019apprentissage plut\u00f4t que sur un comportement (ex.\u00a0: participation, pr\u00e9sence). Elle repose sur des objectifs explicites li\u00e9s \u00e0 la comp\u00e9tence du cours.'
            },
        ],
        voirAussi: ['structure-productions', 'planification-alignement']
    },
    'apc-grille-individuel': {
        titre: '\u00c9valuation individuelle en APC',
        sections: [
            {
                type: 'texte',
                contenu: 'Dans une approche par comp\u00e9tences, l\u2019\u00e9valuation est g\u00e9n\u00e9ralement individuelle afin de rendre compte du degr\u00e9 d\u2019acquisition de chaque apprenant\u00b7e.'
            },
            {
                type: 'conseil',
                contenu: 'Les travaux d\u2019\u00e9quipe peuvent \u00eatre \u00e9valu\u00e9s, mais la contribution individuelle devrait id\u00e9alement \u00eatre distingu\u00e9e.'
            },
        ],
        voirAussi: ['construction-grilles', 'structure-productions']
    },
    'objectif-verbes-actifs': {
        titre: 'Verbes actifs et observables (Anderson\u00a0&\u00a0Krathwohl)',
        sections: [
            {
                type: 'texte',
                contenu: 'Formule tes objectifs avec des verbes actifs et observables selon la taxonomie r\u00e9vis\u00e9e d\u2019Anderson et Krathwohl.'
            },
            {
                type: 'exemple',
                titre: 'Verbes actionnables',
                contenu: 'nommer, d\u00e9crire, analyser, cr\u00e9er, r\u00e9soudre, comparer, justifier, concevoir\u2026'
            },
            {
                type: 'conseil',
                contenu: '\u00c9vite les verbes vagues comme <strong>savoir</strong>, <strong>comprendre</strong> ou <strong>conna\u00eetre</strong>. La carte d\u2019alignement (Structure \u2192 Alignement p\u00e9dagogique) propose une banque de verbes class\u00e9s par niveau cognitif.'
            },
        ],
        voirAussi: ['planification-alignement', 'structure-productions']
    },
    'echeance-indices': {
        titre: 'Date d\u2019\u00e9ch\u00e9ance et indices',
        sections: [
            {
                type: 'texte',
                contenu: 'Cette date fixe les indices C (Compl\u00e9tion) et P (Performance) pour les suivis longitudinaux. Une production non remise \u00e0 cette date sera compt\u00e9e comme manquante dans le calcul de C.'
            },
        ],
        voirAussi: ['tableau-bord-apercu', 'structure-productions']
    },
    'echeances-multigroupes': {
        titre: '\u00c9ch\u00e9ances multi-groupes',
        sections: [
            {
                type: 'texte',
                contenu: 'Chaque groupe-cours peut avoir sa propre date d\u2019\u00e9ch\u00e9ance. D\u00e9coche un groupe pour indiquer que la production ne lui est pas encore assign\u00e9e.'
            },
        ],
        voirAussi: ['structure-productions']
    },
    'retroaction-grille-descriptive': {
        titre: 'R\u00e9troaction et grille descriptive',
        sections: [
            {
                type: 'texte',
                contenu: 'La r\u00e9troaction fournie \u00e0 l\u2019apprenant\u00b7e repose sur le croisement de deux \u00e9l\u00e9ments\u00a0: les <strong>crit\u00e8res</strong> d\u2019\u00e9valuation et les <strong>niveaux</strong> de performance. Ce croisement forme une <em>grille descriptive</em>.'
            },
            {
                type: 'liste',
                titre: 'Ce qu\u2019une grille descriptive pr\u00e9cise',
                items: [
                    'Le niveau atteint',
                    'Ce qui est ma\u00eetris\u00e9',
                    'Ce qui reste \u00e0 travailler',
                    'Comment progresser',
                ]
            },
            {
                type: 'conseil',
                contenu: 'Une r\u00e9troaction efficace est <strong>sp\u00e9cifique</strong>, <strong>actionnable</strong>, <strong>utile</strong> et <strong>bienveillante</strong>.'
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: '\u00c9vite le \u00ab\u00a0sandwich\u00a0\u00bb (positif\u2013n\u00e9gatif\u2013positif)\u00a0: il dilue le message et n\u2019atteint pas les objectifs d\u2019une r\u00e9troaction efficace.'
            },
        ],
        voirAussi: ['construction-cartouches', 'construction-grilles']
    },
    'categories-selection-obligatoires': {
        titre: 'Cat\u00e9gories S\u00e9lection / Obligatoires',
        sections: [
            {
                type: 'texte',
                contenu: 'Permet de distinguer deux types de productions au sein de la pratique de notation.'
            },
            {
                type: 'liste',
                titre: 'Les deux cat\u00e9gories',
                items: [
                    '<strong>S\u00e9lection</strong> \u2014 les N meilleures sont retenues pour la note.',
                    '<strong>Obligatoires</strong> \u2014 toujours compt\u00e9es, par exemple un examen final ou une mise en situation r\u00e9capitulative.',
                ]
            },
        ],
        voirAussi: ['construction-pratiques', 'structure-productions']
    },
    'echelle-plage-notes': {
        titre: 'Plage de notes (niveau)',
        sections: [
            {
                type: 'texte',
                contenu: 'Plage de pourcentages d\u00e9finissant le degr\u00e9 de ma\u00eetrise. Permet d\u2019\u00e9tablir les stades ou niveaux auxquels se situe l\u2019apprenant\u00b7e (ex.\u00a0: Insuffisant, en D\u00e9veloppement, Ma\u00eetris\u00e9, \u00c9tendu).'
            },
        ],
        voirAussi: ['construction-echelles']
    },
    'echelle-valeur-ponctuelle': {
        titre: 'Valeur ponctuelle',
        sections: [
            {
                type: 'texte',
                contenu: 'Valeur num\u00e9rique fixe attribu\u00e9e \u00e0 un niveau. Utilis\u00e9e pour\u00a0: le calcul des notes, la conversion d\u2019une note lettr\u00e9e en note chiffr\u00e9e, la pratique sommative traditionnelle et le d\u00e9pistage.'
            },
        ],
        voirAussi: ['construction-echelles', 'construction-pratiques']
    },
    'grille-type-critere-detail': {
        titre: 'Type de crit\u00e8re d\u2019\u00e9valuation',
        sections: [
            {
                type: 'liste',
                titre: 'Trois types disponibles',
                items: [
                    '<strong>Holistique</strong> \u2014 \u00e9value l\u2019ensemble en consid\u00e9rant les interrelations entre les \u00e9l\u00e9ments.',
                    '<strong>Analytique</strong> \u2014 d\u00e9compose et \u00e9value chaque \u00e9l\u00e9ment s\u00e9par\u00e9ment.',
                    '<strong>Algorithmique</strong> \u2014 calcul automatique bas\u00e9 sur une formule (ex.\u00a0: nombre d\u2019erreurs en fran\u00e7ais \u00e9crit).',
                ]
            },
        ],
        voirAussi: ['construction-grilles', 'evaluations-proceder']
    },
    'grille-niveau-solo': {
        titre: 'Niveau cognitif SOLO',
        sections: [
            {
                type: 'texte',
                contenu: 'Niveau cognitif du crit\u00e8re selon la taxonomie SOLO (Structure of Observed Learning Outcomes) de Biggs et Collis. D\u00e9crit la complexit\u00e9 structurelle attendue dans la r\u00e9ponse de l\u2019\u00e9tudiant\u00b7e.'
            },
            {
                type: 'conseil',
                contenu: 'Les crit\u00e8res <strong>multistructurels</strong> (fondations) sont surveill\u00e9s par le d\u00e9pistage pour d\u00e9tecter les difficult\u00e9s persistantes. Identifie-les pour alimenter le suivi des fondamentaux.'
            },
        ],
        voirAussi: ['depistage-interpretation', 'suivi-apprentissage-fondamentaux']
    },

    // =========================================================================
    // ACCUEIL — MODE DÉMONSTRATION & DUPLICATION CC
    // =========================================================================

    'accueil-donnees-demo': {
        titre: "Mode démonstration & duplication CC",
        sections: [
            {
                type: 'texte',
                contenu: "Labo Codex embarque un jeu complet de données de démonstration : un cours fictif « Écriture et littérature », 20 étudiants, 11 productions, 200 évaluations, 627 présences, 3 grilles, 2 échelles et une carte mentale d'alignement pédagogique. Coche la case « Données démo » sur l'accueil pour activer ce matériel et explorer l'outil sans toucher à tes vraies données."
            },
            {
                type: 'texte',
                contenu: "Ce matériel est publié sous licence CC BY-NC-SA 4.0 (Attribution, pas d'utilisation commerciale, partage à l'identique). L'auteur est affiché partout sous le nom « Labo Codex ». Il sert de modèle et t'accompagne vers l'autonomie selon le modèle de l'enseignement explicite."
            },
            {
                type: 'liste',
                titre: "Le parcours en trois temps",
                items: [
                    "<strong>Modélisation</strong> — Active la démo et explore l'aperçu peuplé. Tu vois directement ce que l'outil produit avec des données réalistes.",
                    "<strong>Pratique guidée</strong> — Ouvre une grille ou une échelle démo pour comprendre sa structure. Le formulaire est en lecture seule (aucun risque de modifier accidentellement le matériel).",
                    "<strong>Autonomie</strong> — Clique sur « Dupliquer pour créer ma grille » (ou ta propre échelle, cartouche, production, pratique, groupe-cours) et renomme. Tu pars du modèle mais tu deviens l'auteur."
                ]
            },
            {
                type: 'exemple',
                contenu: "Tu ouvres la grille démo « Analyse littéraire ». Tu cliques sur « Dupliquer pour créer ma grille ». Une copie apparaît dans ta bibliothèque, prête à être renommée. Dans les métadonnées de ta copie, une ligne « Inspiré de : Analyse littéraire par Labo Codex » reste visible — c'est la reconnaissance d'origine exigée par la licence CC."
            },
            {
                type: 'conseil',
                contenu: "Les sélecteurs (grilles, échelles, pratiques, groupes-cours, etc.) affichent deux sections : « Mes documents » pour tes créations, « Démo » pour le matériel original. Tu peux mélanger les deux dans les dropdowns, mais au moment d'enregistrer un item utilisateur, Labo Codex refuse les références mixtes (ex. une vraie grille qui pointerait sur une échelle démo) — duplique l'échelle démo d'abord, puis référence ta copie."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Les données démo vivent en permanence dans un espace séparé. Cocher/décocher la case ne touche jamais à tes vrais trimestres (H2026, A2025, etc.). Tu peux activer la démo, explorer, et décocher à tout moment — ton état réel revient intact."
            }
        ],
        voirAussi: ['bibliotheque-fonctionnement', 'construction-objectifs-reflexion']
    },

    // =========================================================================
    // RÉSERVE — VERSEMENT (modale #modalReserve)
    // =========================================================================

    'reserve-versement': {
        titre: "Verser dans la réserve",
        sections: [
            {
                type: 'texte',
                contenu: "Verser, c'est déposer une copie d'un groupe-cours terminé dans ta réserve personnelle locale. C'est un geste manuel que tu déclenches en fin de trimestre."
            },
            {
                type: 'liste',
                titre: "Ce qui est versé",
                items: [
                    "Les étudiant·es du groupe (liste, présences, évaluations sauvegardées)",
                    "Les fichiers travaux importés pour ce groupe (photos, PDF)",
                    "Les bibliothèques actives au moment du versement (grilles, échelles, cartouches, productions, pratiques, tampons)",
                    "Les snapshots et les données de planification du trimestre"
                ]
            },
            {
                type: 'texte',
                contenu: "Ta réserve vit sur ton ordinateur (ou sur un disque externe), dans le dossier <code>Réserve_LaboCodex/</code>. Elle n'est jamais purgée. Si tu re-verses le même groupe-cours, le versement précédent est remplacé."
            },
            {
                type: 'conseil',
                contenu: "Verser ne supprime rien dans ton codex de travail — c'est une <strong>copie</strong>, pas un déplacement. Tu peux verser autant de fois que tu veux."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Le fichier généré contient des données personnelles d'étudiant·es. Conserve-le dans un emplacement sécurisé et ne le partage pas."
            }
        ],
        voirAussi: ['reserve-fsapi', 'reserve-ouvrir-versement']
    },

    'reserve-fsapi': {
        titre: "Mode automatique ou mode manuel ?",
        sections: [
            {
                type: 'texte',
                contenu: "Le mode dépend de ton navigateur, pas de ton appareil."
            },
            {
                type: 'liste',
                titre: "Selon ton navigateur",
                items: [
                    "<strong>Chrome ou Edge</strong> — tu choisis ton dossier réserve une seule fois, l'application y écrit directement à chaque versement. Aucune manipulation de fichier de ton côté.",
                    "<strong>Safari</strong> — l'application produit un fichier ZIP que tu téléchargeras puis décompresseras toi-même dans ton dossier <code>Réserve_LaboCodex/</code>. Plus d'étapes, mais le résultat est identique."
                ]
            },
            {
                type: 'conseil',
                contenu: "Tu peux changer de navigateur d'un versement à l'autre — la réserve est compatible avec les deux flux. Si tu utilises principalement une tablette, le flux ZIP de Safari est ton chemin."
            }
        ],
        voirAussi: ['reserve-versement']
    },

    // =========================================================================
    // RÉSERVE — OUVRIR UN VERSEMENT (modale #modalOuvrirVersement)
    // =========================================================================

    'reserve-ouvrir-versement': {
        titre: "Ouvrir la réserve",
        sections: [
            {
                type: 'texte',
                contenu: "Ouvrir la réserve, c'est consulter un versement archivé pour réimporter une ou plusieurs ressources dans tes bibliothèques actives. C'est un geste manuel et sélectif : tu choisis ce que tu reprends."
            },
            {
                type: 'liste',
                titre: "Ce qui est réimportable",
                items: [
                    "Grilles, échelles, productions, cartouches de rétroaction, pratiques de notation, tampons personnalisés",
                    "Les données pédagogiques (étudiant·es, présences, évaluations) ne sont pas réimportables — elles restent dans le versement, figées"
                ]
            },
            {
                type: 'liste',
                titre: "Selon ton navigateur",
                items: [
                    "<strong>Chrome ou Edge</strong> avec un dossier réserve configuré : tu vois la liste de tes versements, tu en choisis un.",
                    "<strong>Safari</strong> : tu sélectionnes le fichier <code>.reserve.zip</code> de ton choix. Si tu viens de verser depuis Safari, ton fichier est dans ton dossier Téléchargements."
                ]
            },
            {
                type: 'conseil',
                contenu: "Le versement original n'est jamais modifié. Réimporter, c'est faire une copie."
            }
        ],
        voirAussi: ['reserve-types-ressources', 'reserve-copie-double', 'reserve-versement']
    },

    'reserve-types-ressources': {
        titre: "Les six types de ressources réimportables",
        sections: [
            {
                type: 'liste',
                titre: "Types disponibles",
                items: [
                    "<strong>Grilles</strong> — critères d'évaluation",
                    "<strong>Échelles</strong> — niveaux de performance (lettres, pourcentages…)",
                    "<strong>Productions</strong> — gabarits de travaux à évaluer",
                    "<strong>Cartouches de rétroaction</strong> — banques de commentaires par grille",
                    "<strong>Pratiques de notation</strong> — méthodes de calcul de la note finale",
                    "<strong>Tampons personnalisés</strong> — annotations visuelles"
                ]
            },
            {
                type: 'texte',
                contenu: "Les références croisées sont préservées si tu coches les ressources liées : production → grille + échelle, cartouche → grille, pratique → échelle. L'auto-cochage s'occupe de ces liens automatiquement quand tu coches l'item parent."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Si une référence est absente du versement et de tes bibliothèques actives, l'item est marqué « référence manquante » en orange. Tu peux quand même le réimporter, mais sa référence sera cassée."
            }
        ],
        voirAussi: ['reserve-deja-present', 'reserve-copie-double', 'reserve-ref-manquante']
    },

    'reserve-deja-present': {
        titre: "Item déjà présent",
        sections: [
            {
                type: 'texte',
                contenu: "Cet item porte le même identifiant qu'un item déjà dans ta bibliothèque active. Par défaut, il est grisé pour éviter d'écraser ta version actuelle."
            },
            {
                type: 'texte',
                contenu: "Si tu veux quand même le récupérer : coche « Recopier en double » en bas de la modale. L'item sera réimporté avec un nouvel identifiant et le suffixe « — copie » dans le nom. Tu auras alors les deux versions côte à côte dans ta bibliothèque, libre de les comparer ou de supprimer l'une des deux."
            }
        ],
        voirAussi: ['reserve-copie-double', 'reserve-types-ressources']
    },

    'reserve-copie-double': {
        titre: "Recopier en double",
        sections: [
            {
                type: 'texte',
                contenu: "Quand un item du versement est déjà présent dans ta bibliothèque active (même identifiant), il est grisé par défaut pour éviter d'écraser ta version actuelle."
            },
            {
                type: 'texte',
                contenu: "Si tu coches « Recopier en double », ces items sont réactivés : ils seront recopiés avec un nouvel identifiant et le suffixe « — copie » dans le nom. Tu auras alors les deux versions côte à côte dans ta bibliothèque, libre de les comparer ou de supprimer l'une des deux."
            },
            {
                type: 'exemple',
                titre: "Et les références entre items ?",
                contenu: "Si tu réimportes en double une grille avec une production qui la référence, la production pointera automatiquement sur la nouvelle copie de la grille — pas sur la grille existante. Le rebranchement se fait à condition que les deux items soient cochés dans le même import. Même principe pour cartouche → grille et pratique → échelle."
            },
            {
                type: 'conseil',
                contenu: "Utile quand tu veux comparer une grille passée et sa version actuelle, ou récupérer une cartouche de rétroaction d'un trimestre antérieur sans toucher à celle que tu utilises maintenant."
            }
        ],
        voirAussi: ['reserve-deja-present']
    },

    'reserve-ref-manquante': {
        titre: "Référence manquante",
        sections: [
            {
                type: 'texte',
                contenu: "Cet item référence une autre ressource (par exemple une production référence une grille) qui n'est ni dans le versement, ni dans ta bibliothèque active. Si tu réimportes l'item tel quel, sa référence sera cassée."
            },
            {
                type: 'liste',
                titre: "Que faire ?",
                items: [
                    "Si la ressource manquante est dans un autre versement, ouvre-le d'abord pour la réimporter, puis reviens ouvrir celui-ci.",
                    "Sinon, accepte la cassure : l'item s'affichera dans ta bibliothèque mais sans sa grille ou son échelle associée. Tu pourras la rebrancher plus tard."
                ]
            }
        ],
        voirAussi: ['reserve-types-ressources']
    },

    // =========================================================================
    // RÉSERVE — CARTE DANS RÉGLAGES > DONNÉES (#249)
    // =========================================================================

    'reglages-reserve': {
        titre: "Réserve (versements archivés)",
        sections: [
            {
                type: 'texte',
                contenu: "Cette section est l'<strong>index local</strong> de tes versements de réserve. Elle te montre ce que ton application sait de ton historique de versements — peu importe où les fichiers ZIP eux-mêmes vivent sur ton disque."
            },
            {
                type: 'liste',
                titre: "Comment l'index s'alimente",
                items: [
                    "À chaque versement (Codex › Verser dans la réserve…), une nouvelle ligne s'ajoute automatiquement.",
                    "À chaque ouverture d'un fichier ZIP via Ouvrir un versement…, le versement est ajouté à l'index s'il n'y figure pas déjà.",
                    "Sur Chrome ou Edge, si un dossier réserve est lié, le bouton <em>Vérifier le dossier</em> synchronise l'index avec le manifeste central du dossier."
                ]
            },
            {
                type: 'conseil',
                contenu: "<strong>Retirer</strong> une ligne de l'index ne supprime <strong>aucun fichier</strong> sur disque. C'est juste un nettoyage de l'index. Pour vraiment supprimer un versement, supprime le ZIP toi-même dans le Finder."
            },
            {
                type: 'texte',
                titre: "Où sont les données pédagogiques d'un trimestre archivé ?",
                contenu: "Verser n'a <strong>rien supprimé</strong> dans ton codex. Les étudiant·es, présences, évaluations et fichiers du trimestre que tu as versé sont toujours dans ton application. Pour les consulter, change le <strong>trimestre actif</strong> dans le sélecteur du haut. Le versement, lui, est une copie de sécurité figée."
            },
            {
                type: 'liste',
                titre: "Lecture des colonnes",
                items: [
                    "<strong>Mode</strong> indique comment le versement a été produit. <em>Disque (FSAPI)</em> = écriture directe par Chrome/Edge dans ton dossier réserve. <em>ZIP</em> = fichier téléchargé par Safari.",
                    "<strong>Étud.</strong> et <strong>Fich.</strong> sont les compteurs au moment du versement.",
                    "<strong>Taille</strong> est la taille des fichiers travaux (photos, PDF) seulement, pas du ZIP complet."
                ]
            }
        ],
        voirAussi: ['reserve-versement', 'reserve-ouvrir-versement', 'reserve-fsapi']
    },

    // =========================================================================
    // PLUSIEURS FICHIERS PAR ÉTUDIANT — modale (Phase 7 #3)
    // =========================================================================

    'fichiers-multiples-examiner': {
        titre: "Plusieurs fichiers par étudiant",
        sections: [
            {
                type: 'texte',
                contenu: "Quand un même étudiant·e a plus d'un fichier pour une même production, l'application les regroupe ici pour que tu décides ce qui reste actif et ce qui passe à la corbeille. Aucun fichier n'est supprimé sans ton geste."
            },
            {
                type: 'liste',
                titre: "Comment ça fonctionne",
                items: [
                    "Chaque cas regroupe les fichiers d'un même étudiant pour une même production.",
                    "Pour chaque fichier, choisis « Garder » (reste actif) ou « Corbeille » (mis de côté, restaurable 30 jours).",
                    "Au moins un fichier doit être gardé par cas — sinon l'évaluation se retrouverait sans pièce justificative."
                ]
            },
            {
                type: 'conseil',
                contenu: "Plusieurs fichiers pour un même cas n'est pas forcément un problème : l'élève peut avoir soumis un livrable en plusieurs morceaux (image + PDF), une reprise via jeton, ou simplement deux versions distinctes. À toi de juger en consultant les noms et les dates."
            }
        ],
        voirAussi: ['fichiers-multiples-familles']
    },

    'fichiers-multiples-familles': {
        titre: "Familles détectées et tags d'information",
        sections: [
            {
                type: 'texte',
                contenu: "L'application ne fait qu'une seule présomption sûre : la reprise via jeton (suffixe <code>_-_Jeton_</code>, qui est une convention que tu choisis d'utiliser à l'import). Tout le reste est laissé à ta décision, avec des tags pour t'aider à comprendre le contexte."
            },
            {
                type: 'liste',
                titre: "Deux familles",
                items: [
                    "<strong>🟢 Reprise via jeton</strong> — un fichier porte le suffixe <code>_-_Jeton_</code> : suggestion garder les deux (l'original et la reprise).",
                    "<strong>🔵 Plusieurs fichiers</strong> — tout autre cas : aucune suggestion automatique. Examine les noms, dates et formats avant de décider."
                ]
            },
            {
                type: 'liste',
                titre: "Tags informatifs (sans recommandation)",
                items: [
                    "<strong>📄 PDF + image</strong> — formats différents. Peut être un livrable composite (image iPad + texte Word), pas forcément un doublon.",
                    "<strong>🔁 mêmes noms</strong> — fichiers de noms identiques mais tailles différentes : re-import probable d'une version modifiée.",
                    "<strong>⏱ dates proches</strong> — moins de 5 minutes entre deux imports : signe d'un glitch (double-clic involontaire, par exemple).",
                    "<strong>📝 statuts mixtes</strong> — un fichier annoté coexiste avec un fichier importé non annoté."
                ]
            },
            {
                type: 'conseil',
                contenu: "Si un cas semble venir d'une mauvaise association de production (artefact importé sur la mauvaise production), utilise plutôt l'action « Réassocier » du sélect Actions de la ligne — c'est plus précis que de mettre à la corbeille."
            }
        ],
        voirAussi: ['fichiers-multiples-examiner']
    }
};

// Chaque entrée { titre, sections, voirAussi } devient { popup: {...} }
// dans CATALOGUE_ACCOMPAGNEMENT.
const entrees = {};
for (const cle in AIDE_CONTEXTUELLE) {
    if (Object.prototype.hasOwnProperty.call(AIDE_CONTEXTUELLE, cle)) {
        entrees[cle] = { popup: AIDE_CONTEXTUELLE[cle] };
    }
}
window.accompagnement.ajouterEntrees(entrees);

})();
