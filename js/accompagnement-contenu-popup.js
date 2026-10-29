/**
 * accompagnement-contenu-popup.js
 * Catalogue de contenu pour le mode `popup` (modale riche, icône info).
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

/**
 * Les formats que l'application peut RÉELLEMENT lire dans ce contexte (#597).
 * Ouverte par double-clic, elle ne sait pas décoder un HEIC : l'aide ne doit pas
 * l'annoncer, sous peine de promettre un format refusé ensuite. Prudent par
 * défaut si le décodeur n'est pas encore chargé.
 */
function formatsAcceptesLibelle() {
    const heicLisible = typeof window.HeicDecodeur !== 'undefined'
        && window.HeicDecodeur.decodagePossible();
    return heicLisible ? 'PDF, JPEG, PNG, HEIC' : 'PDF, JPEG, PNG';
}

const AIDE_CONTEXTUELLE = {

    // =========================================================================
    // CADRE - BALISES DU COURS (pondération / heures d'enseignement / unité)
    // =========================================================================

    'cadre-cours-balises': {
        titre: "Comprendre les balises du cours",
        sections: [
            {
                type: 'texte',
                contenu: "Trois grandeurs décrivent la « taille » d'un cours au collégial : la pondération, les heures d'enseignement et les unités. Elles viennent du Règlement sur le régime des études collégiales (RREC) et de la grille de cours de ton programme. Voici comment les lire."
            },
            {
                type: 'liste',
                titre: "La pondération (ex. : 2-2-3)",
                items: [
                    "1er chiffre : heures de théorie par semaine.",
                    "2e chiffre : heures de laboratoire ou de pratique par semaine.",
                    "3e chiffre : heures de travail personnel attendues par semaine (hors classe).",
                    "Les deux premiers chiffres comptent le temps en présence de l'enseignant ; le troisième, le travail autonome de l'étudiant."
                ]
            },
            {
                type: 'texte',
                contenu: "Les heures d'enseignement sont le temps où l'enseignant est en présence des étudiants, pour un enseignement théorique ou pratique. On les obtient en additionnant les deux premiers chiffres de la pondération et en multipliant par le nombre de semaines du trimestre. Exemple : pondération 2-2-3 dans un trimestre de 15 semaines → (2 + 2) × 15 = 60 heures d'enseignement. L'application compte les semaines dans ton calendrier plutôt que de les supposer : un trimestre écourté ou une session d'été donnent un autre total."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Terminologie : le terme juste est « heure d'enseignement ». « Heure-contact » est un calque de l'anglais contact hour, déconseillé par l'Office québécois de la langue française."
            },
            {
                type: 'texte',
                contenu: "Ne confonds pas une période et une heure d'enseignement. Une période est le bloc à ton horaire : sa durée dépend du collège (souvent 50 ou 55 minutes, pause comprise). Une heure d'enseignement est l'unité de compte de la charge : une période compte pour une heure d'enseignement, même si elle dure moins de 60 minutes d'horloge. Le RREC compte d'ailleurs les cours en « périodes d'enseignement » (au moins 45 pour un cours typique)."
            },
            {
                type: 'exemple',
                titre: "L'unité (RREC)",
                contenu: "Une unité équivaut à 45 heures d'activités d'apprentissage — travail personnel inclus. Le nombre d'unités d'un cours = somme des trois chiffres de la pondération ÷ 3. Exemple : 2-2-3 → (2+2+3) ÷ 3 = 2 ⅓ unités, soit 2 ⅓ × 45 = 105 heures au total (60 d'enseignement + 45 de travail personnel)."
            },
            {
                type: 'conseil',
                contenu: "Dans Labo Codex, les heures d'enseignement servent de repère de conformité (ce qui est prévu vs ce que ton horaire couvre réellement). Les unités sont un repère descriptif, dérivé de la pondération. En session intensive (été), la pondération « par semaine » devient trompeuse, mais le total d'heures d'enseignement, lui, reste le même : c'est l'invariant à viser."
            }
        ],
        voirAussi: []
    },

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
        voirAussi: ['construction-grilles', 'construction-echelles']
    },


    // =========================================================================
    // PHASE 1 - CRITIQUES (5 aides)
    // =========================================================================

    'evaluations-proceder': {
        titre: 'Évaluer une production',
        sections: [
            {
                type: 'texte',
                contenu: 'Pour évaluer une production, sélectionne d’abord la grille, l’échelle et la cartouche associées — elles sont normalement déjà configurées dans Structure. Attribue ensuite un niveau à chaque critère\u00a0: la note et la rétroaction se construisent au fur et à mesure. Tu peux prévisualiser le commentaire complet avant de le copier dans le presse-papier.'
            },
            {
                type: 'conseil',
                contenu: 'Si tu utilises des jetons, rappelle-toi qu’ils offrent à l’étudiant·e une nouvelle occasion de démontrer sa compétence — pas simplement d’améliorer une note.'
            },
        ],
        voirAussi: ['evaluations-annoter', 'construction-grilles', 'construction-echelles', 'construction-cartouches']
    },

    'conception-productions': {
        titre: 'Productions',
        sections: [
            {
                type: 'texte',
                contenu: 'Assure-toi que la somme des pondérations de tes productions totalise 100\u00a0%. Pour les portfolios, définis d’abord le nombre d’artefacts à retenir (ex.\u00a0: les 3 meilleurs sur 9) — ce sont les N meilleures démonstrations de compétence qui comptent. Les artefacts individuels n’ont pas de pondération propre\u00a0: c’est le portfolio conteneur qui porte le poids dans la note finale.'
            },
            {
                type: 'conseil',
                contenu: 'Pense à verrouiller les productions une fois finalisées pour éviter les modifications accidentelles.'
            },
        ],
        voirAussi: ['construction-grilles', 'construction-pratiques']
    },

    // « Apporter mon matériel » : l'aide « i » de l'accueil et de l'écran d'étiquetage (B1 à B5, validés
    // par Grégoire le 19 oct. 2026, 19 h 01).
    'conception-materiel': {
        titre: 'Apporter mon matériel',
        sections: [
            {
                type: 'texte',
                contenu: 'Cet outil range dans Labo Codex une grille d’évaluation que tu as déjà créée à l’extérieur de l’application. Tu la colles ici, tu poses une étiquette sur chaque morceau (critère, pondération, descripteur, points, niveau…), puis « Créer ma grille » la range dans Grilles de critères. Rien n’entre dans tes grilles avant ce dernier geste.'
            },
            {
                type: 'texte',
                contenu: 'Ton travail est gardé à chaque geste : si tu quittes l’onglet ou recharges la page, tu retrouves ta grille et ses étiquettes telles que tu les as laissées.'
            },
            {
                type: 'conseil',
                contenu: 'Copie ta grille depuis son fichier d’origine (Word, Pages) plutôt que depuis un PDF : le tableau arrive avec ses cases, et la place de chaque morceau dit déjà à quel critère et à quel niveau il appartient.'
            }
        ],
        voirAussi: ['construction-grilles', 'construction-echelles', 'grille-type-critere-detail']
    },

    'construction-grilles': {
        titre: 'Grilles de critères',
        sections: [
            {
                type: 'texte',
                contenu: 'Un critère qui se calcule à partir de ce que tu comptes sur la copie (des erreurs, des éléments manquants, des calculs…) peut être de type algorithmique : son atelier propose trois calculs tout faits, que tu peux retoucher, ou te laisse composer le tien (voir l\'Aide, « Les critères algorithmiques »). Les grilles peuvent être dupliquées et modifiées pour créer des variantes adaptées à différents types de productions.'
            },
            {
                type: 'conseil',
                contenu: 'Nomme tes grilles de façon descriptive (ex.\u00a0: «\u00a0Grille analyse littéraire\u00a0», «\u00a0Grille laboratoire\u00a0») — tu les retrouveras plus facilement.'
            },
            {
                type: 'conseil',
                contenu: 'Le total des pondérations se colore : orange sous 100\u00a0%, rouge au-dessus, vert à 100\u00a0%. Une grille en points ne se mesure pas à 100.'
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
                    "4 niveaux : Incomplet, Développement, Maîtrise, Étendu",
                    "Pourcentage (5 niveaux) : 0-20\u00a0%, 20-40\u00a0%, 40-60\u00a0%, 60-80\u00a0%, 80-100\u00a0%",
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
        titre: 'Cartouches de rétroaction',
        sections: [
            {
                type: 'texte',
                contenu: 'Pour être efficaces, les commentaires de rétroaction doivent être lus et… compris\u00a0! Idéalement ils peuvent avoir entre 50 et 75 mots environ. Rédige-les de façon personnelle et constructive — c’est ce que tes étudiant·es liront.'
            },
            {
                type: 'texte',
                contenu: 'Chaque cellule de la matrice correspond à un commentaire pour un niveau de performance donné sur un critère spécifique. Tu peux utiliser les codes de ta grille (ex.\u00a0: I, D, M, E) et le format proposé pour structurer tes commentaires.'
            },
        ],
        voirAussi: ['construction-grilles', 'construction-echelles', 'evaluations-proceder']
    },

    'construction-pratiques': {
        titre: 'Pratiques de notation',
        sections: [
            {
                type: 'texte',
                contenu: 'Quatre pratiques sont disponibles. Choisis celle qui correspond à ta philosophie d’enseignement — tu peux toujours la changer.'
            },
            {
                type: 'liste',
                titre: 'Les quatre pratiques',
                items: [
                    '<strong>Sommative (SOM)</strong> — calcule une moyenne pondérée traditionnelle.',
                    '<strong>PAN par standards (STD)</strong> — retient les meilleures démonstrations de compétence\u00a0; l’étudiant·e progresse en montrant sa maîtrise, pas en accumulant des points.',
                    '<strong>PAN par spécifications (SPE)</strong> — fonctionne par contrat\u00a0: chaque production est réussie ou non selon des critères prédéfinis\u00a0; c’est l’ensemble des cibles atteintes qui détermine la note.',
                    '<strong>Dénotation (DEN)</strong> — retire la note chiffrée des travaux au profit d’une rétroaction qualitative sur des cibles et critères explicites ; la note certificative (RREC) est posée par jugement à la fin.',
                ]
            },
            {
                type: 'conseil',
                contenu: 'En cas de doute, commence par SOM (la plus familière) et fais évoluer ta pratique au fil des sessions.'
            },
        ],
        voirAussi: ['conception-productions', 'construction-echelles']
    },

    // =========================================================================
    // PHASE 2 - HAUTE PRIORITÉ (4 aides)
    // =========================================================================

    'tableau-bord-rai': {
        titre: "Le modèle RàI (Réponse à l'Intervention)",
        sections: [
            {
                type: 'texte',
                contenu: "Le modèle RàI structure les interventions pédagogiques en trois niveaux d'intensité. L'application s'en inspire pour catégoriser les besoins observés, sans prescrire une pratique particulière."
            },
            {
                type: 'liste',
                titre: "Les trois niveaux",
                items: [
                    "<strong>Niveau 1 — Universel</strong>\u00a0: enseignement de qualité pour tout le groupe.",
                    "<strong>Niveau 2 — Préventif</strong>\u00a0: interventions préventives pour les étudiant·es en difficulté émergente.",
                    "<strong>Niveau 3 — Intensif</strong>\u00a0: soutien individualisé pour les difficultés persistantes."
                ]
            },
            {
                type: 'conseil',
                contenu: "Les proportions d’étudiant·es par niveau varient selon le contexte et ta propre pratique professionnelle. L’application te laisse définir les seuils dans Labo › Outils d’observation."
            },
            {
                type: 'action', action: 'ouvrirGuidePedagogique', param: 'rai', libelle: 'Ouvrir le guide RàI'
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
                    "Présent : toutes les périodes de la séance",
                    "Absent : 0 période",
                    "Présence partielle : moins de périodes que la séance (arrivée tardive, départ hâtif)"
                ]
            },
            {
                type: 'conseil',
                contenu: "Prends les présences au début du cours plutôt qu'à la fin. Utilise le bouton qui marque d’emblée tout le monde présent, puis ajuste les exceptions."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Les présences sont liées à la date du cours. Vérifie que la bonne date est sélectionnée avant de saisir."
            }
        ],
        voirAussi: ['tableau-bord-apercu', 'calendrier-vue']
    },

    'calendrier-trimestre': {
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
        titre: 'Liste des étudiant·es',
        sections: [
            {
                type: 'texte',
                contenu: 'Pour ajouter, modifier ou supprimer des étudiant·es, va dans l’onglet Cadre. La liste ici reflète automatiquement les changements que tu fais là-bas.'
            },
        ],
        voirAussi: ['contexte-groupe-etudiants', 'tableau-bord-apercu', 'tableau-bord-rai']
    },

    'calendrier-vue': {
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
        // #1157 (retouche du lot 4) — le texte validé par Grégoire (25 oct. 2026, 16 h 53), mot pour
        // mot : la fenêtre en deux colonnes. « le ramène » est vrai des six fenêtres de la Conception :
        // « ← Utiliser » remet en service l'élément retiré lui-même (par `id` ou `idOriginal` ; une
        // production, aussi par sa propre rangée « Retirée de ce trimestre »).
        titre: "Comment fonctionne la bibliothèque",
        sections: [
            {
                type: 'liste',
                titre: "Deux colonnes",
                items: [
                    "« Dans ce trimestre » : ce que le menu de l'écran te propose pendant ce trimestre.",
                    "« Dans ta bibliothèque » : ce que tu gardes pour tous tes trimestres."
                ]
            },
            {
                type: 'liste',
                titre: "Passer d'une colonne à l'autre",
                items: [
                    "« Garder dans ma bibliothèque → » copie un élément de ce trimestre dans ta bibliothèque.",
                    "« ← Utiliser dans ce trimestre » copie un élément de ta bibliothèque dans ce trimestre.",
                    "Chaque colonne garde son propre exemplaire : ce que tu modifies dans ce trimestre ne change pas celui de ta bibliothèque."
                ]
            },
            {
                type: 'liste',
                titre: "Retirer ou supprimer (dans le menu ⋮)",
                items: [
                    "« Retirer de ce trimestre » : l'élément quitte le menu de l'écran, ses données restent. S'il est dans ta bibliothèque, « ← Utiliser dans ce trimestre » le ramène.",
                    "« Supprimer définitivement » : l'élément est effacé de ce trimestre. Son exemplaire de ta bibliothèque reste.",
                    "« Supprimer de ma bibliothèque » : l'exemplaire de ta bibliothèque est effacé ; ce trimestre n'est pas touché."
                ]
            },
            {
                type: 'liste',
                titre: "Les dossiers",
                items: [
                    "Au-dessus de ta bibliothèque, le menu « Tous les dossiers » n'en montre qu'un à la fois ; « Gérer les dossiers… » les crée et les renomme ; dans ⋮, « Classer dans » y range un élément."
                ]
            }
        ],
        voirAussi: ['construction-grilles', 'construction-echelles', 'construction-cartouches', 'construction-pratiques']
    },

    'bibliotheque-tampons-fonctionnement': {
        // #1158 (retouche du lot 5) — la variante courte de la fenêtre des tampons, sur son bouton ⓘ
        // seulement : le texte validé par Grégoire (25 oct. 2026, 18 h 42), mot pour mot. La palette et
        // la bibliothèque des tampons sont communes à tous les trimestres : ni « Dans ce trimestre »,
        // ni « Retirer ».
        titre: "Comment fonctionne la bibliothèque des tampons",
        sections: [
            {
                type: 'liste',
                titre: "Deux colonnes",
                items: [
                    "« Dans ta palette » : les tampons que tu poses sur les copies, dans tous tes trimestres.",
                    "« Dans ta bibliothèque » : les tampons que tu gardes de côté pour les retrouver plus tard."
                ]
            },
            {
                type: 'liste',
                titre: "Passer d'une colonne à l'autre",
                items: [
                    "« Garder dans ma bibliothèque → » copie un tampon de ta palette dans ta bibliothèque.",
                    "« ← Utiliser dans ma palette » ajoute à ta palette un tampon de ta bibliothèque."
                ]
            },
            {
                type: 'liste',
                titre: "Les catégories",
                items: [
                    "Dans ta palette, les tampons sont rangés par catégorie. Le menu ⋮ d'une catégorie la garde tout entière dans ta bibliothèque, ou l'exporte."
                ]
            },
            {
                type: 'liste',
                titre: "Supprimer",
                items: [
                    "« Supprimer de ma bibliothèque » (dans le menu ⋮) efface l'exemplaire de ta bibliothèque ; ta palette n'est pas touchée."
                ]
            }
        ]
    },

    'evaluations-importer': {
        titre: 'Préparer et importer des copies',
        sections: [
            {
                type: 'texte',
                contenu: 'Cette page rassemble les copies numérisées de tes étudiant·es (PDF ou images), les optimise et les associe à une production, prêtes à être annotées et évaluées ensuite.'
            },
            {
                type: 'liste',
                titre: 'Étapes',
                items: [
                    'Dépose tes fichiers (' + formatsAcceptesLibelle() + ') par glisser-déposer ou en cliquant pour parcourir',
                    'Le processus optimise les images, regroupe les pages d\'une même copie et propose une association automatique à partir du nom de fichier',
                    'Vérifie ou ajuste l\'étudiant·e et la production de chaque fichier dans l\'inspecteur central',
                    'Clique sur « Importer » : les copies sont stockées et prêtes pour « Annoter et évaluer »'
                ]
            },
            {
                type: 'conseil',
                contenu: 'Le DA de l\'étudiant·e (7 chiffres) doit minimalement apparaître dans le nom du fichier pour que l\'association et le regroupement multi-pages soient automatiques. Le format Léa complet (NOM_DA_Production_Remis_le_AAAA-MM-JJ_HHhMMmSSs) est reconnu directement.'
            },
            {
                type: 'liste',
                titre: 'Traitements automatiques à l\'import',
                items: [
                    'Balance des blancs : correction colorimétrique des photos prises en classe',
                    'Uniformisation DPI : 250 dpi par défaut, ajustable (200, 250 ou 300)',
                    'Compression des images pour limiter le stockage',
                    'Assemblage multi-pages : les fichiers d\'un même étudiant·e pour une même production sont regroupés',
                    'Les PDF sont importés tels quels, sans modification'
                ]
            }
        ],
        voirAussi: ['evaluations-annoter', 'evaluations-liste']
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
                contenu: '« 1234567_essai.pdf », « DA1234567_travail.jpg », « Exemple_Ada_1234567.pdf », « Essai_1234567_Artefact-8-p1_Remis_le_2026-09-15_09h46m45s.jpeg » (plusieurs pages : -p1, -p2…)'
            },
            {
                type: 'conseil',
                contenu: 'Une remise en plusieurs fichiers : pour que les pages s\'assemblent en un seul document, numérote-les à la fin du nom — -p1, -p2… (ou _p 2, page 2, partie 2, part2, (2)). Une lettre — Artefact_1a, 1b — crée une AUTRE production : tu obtiens plusieurs documents et des doublons à la confirmation.'
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

    'archiver-travaux': {
        titre: 'Exporter les travaux',
        sections: [
            {
                type: 'texte',
                contenu: 'Le panneau d\'export rassemble l\'inventaire des fichiers de travaux déjà importés (originaux PDF/image, copies annotées) et propose plusieurs modes d\'export pour les sortir hors de l\'application.'
            },
            {
                type: 'liste',
                titre: 'Deux modes d\'export',
                items: [
                    '<strong>Exporter des travaux</strong> : productions en PDF + évaluations en JSON. « Toutes » et « Tous » donnent l\'export de tout le groupe, idéal en fin de session ; sinon, filtre par production et/ou étudiant·e.',
                    '<strong>Export Léa</strong> : production annotée + évaluation (note et rétroaction) en PDF prêts à téléverser dans Léa.'
                ]
            },
            {
                type: 'conseil',
                contenu: 'L\'inventaire affiché en haut du panneau (« <em>N fichiers en stock</em> ») reflète tout ce qui a été importé dans <strong>Préparer et importer</strong>. Si tu ne vois aucun fichier ici, c\'est qu\'aucune copie n\'a encore été importée pour ce groupe-cours.'
            }
        ],
        voirAussi: ['evaluations-annoter', 'evaluations-liste']
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
        voirAussi: ['evaluations-proceder', 'conception-productions']
    },

    // =========================================================================
    // PROFIL ÉTUDIANT — INDICATEURS (Tier 7.5, zones démo AQPC)
    // =========================================================================

    'profil-etudiant-indicateurs': {
        titre: "Lire les indicateurs du profil",
        sections: [
            {
                type: 'texte',
                contenu: "Le profil individuel affiche trois indices qui te permettent de cerner rapidement la situation d'un étudiant."
            },
            {
                type: 'liste',
                titre: "Les 3 indices A-C-P",
                items: [
                    "A (Assiduité) — Mesure l’exposition de l’étudiant·e aux situations d’apprentissage\u00a0: sa présence en classe. Ce n’est pas un jugement sur la qualité de sa participation.",
                    "C (Complétion) — Mesure la régularité de la mise en pratique\u00a0: les artefacts remis par rapport aux artefacts attendus. C’est le constat d’un effort, pas de sa qualité.",
                    "P (Performance) — Mesure la compétence démontrée au moment T, selon la pratique de notation configurée. C’est une photographie, pas un pronostic."
                ]
            },
            {
                type: 'liste',
                titre: "Barres par critère (habiletés)",
                items: [
                    "Une barre par critère de TA grille, dans ton ordre à toi.",
                    "La longueur de la barre est la moyenne de l'étudiant·e sur ce critère, tous artefacts confondus.",
                    "Un critère sans évaluation n'a pas de barre — plutôt qu'une barre à zéro, qui se lirait comme un échec.",
                    "La flèche à droite indique la direction : en amélioration, plateau, en détérioration."
                ]
            },
            {
                type: 'conseil',
                contenu: "Compare les barres entre elles pour identifier les forces et les défis récurrents. Deux étudiant·es ayant la même note globale peuvent avoir des profils opposés d'un critère à l'autre — et appeler des accompagnements différents. C'est ce que la note seule ne montre pas."
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
                contenu: "Ces indices sont des repères, pas des verdicts. Un A faible peut s’expliquer par un contexte personnel défavorable sur lequel tu n’as pas de contrôle. Un P plus faible en début de trimestre est également normal. C’est la trajectoire qui compte, pas l’évaluation isolée."
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
                    "Identifier les forces et défis selon la taxonomie SOLO.",
                    "Créer une intervention RàI directement (bouton Nouvelle intervention) — l'étudiant sera pré-coché avec les critères en défi.",
                    "Exporter un rapport PDF pour un suivi institutionnel ou une rencontre."
                ]
            },
            {
                type: 'exemple',
                titre: "Cas typique",
                contenu: "Un étudiant montre A=85\u00a0%, C=60\u00a0%, P=45\u00a0%. Son assiduité est bonne, mais il remet peu d'artefacts et ceux qu'il remet sont faibles. Le pattern suggère un problème de méthode de travail, pas de motivation. Une intervention de niveau 2 axée sur la planification et l'organisation pourrait aider."
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
                    "Ciblage — Coche les étudiant·es concerné·es. L'aperçu du sous-groupe (patterns, niveaux RàI) s'affiche en temps réel.",
                    "Critères ciblés — Pré-cochés automatiquement depuis les défis communs du sous-groupe (grille de dépistage). Tu peux ajuster.",
                    "Objectif visé — Vide au départ ; « Suggérer » en propose un, d'après le critère ciblé le plus faible du sous-groupe et le prochain seuil (64\u00a0% ou 75\u00a0%). Tu peux le modifier librement.",
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
                titre: "Enseigner, évaluer, ajuster",
                contenu: "Tu interviens sur les critères ciblés (niveau 2). Au fil des productions suivantes, tu observes la trajectoire. Quand tu marques l’intervention comme complétée, le bilan compare les scores avant et après sur les critères ciblés. Selon le résultat, tu choisis\u00a0: reconduire l’intervention, ajuster la cible, ou référer vers un soutien plus intensif."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Les interventions de niveau 3 dépassent parfois ce que l’enseignant·e peut faire seul. Les services adaptés, l’aide pédagogique individuelle (API) ou les centres d’aide sont des ressources à mobiliser."
            },
            {
                type: 'action', action: 'ouvrirGuidePedagogique', param: 'rai', libelle: 'Ouvrir le guide RàI'
            }
        ],
        voirAussi: ['profil-etudiant-indicateurs', 'profil-etudiant-accompagnement', 'suivi-apprentissage-fondamentaux']
    },

    // =========================================================================
    // SUIVI DE L'APPRENTISSAGE DES FONDAMENTAUX
    // =========================================================================

    'suivi-apprentissage-fondamentaux': {
        titre: "Structure des apprentissages fondamentaux (SOLO)",
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
                contenu: "Configure les critères surveillés dans Conception → Grilles de critères (tag SOLO). Ajuste le seuil et la fenêtre d'analyse dans Labo → Outils d’observation."
            },
            {
                type: 'action', action: 'ouvrirGuidePedagogique', param: 'solo', libelle: 'Ouvrir le guide SOLO'
            }
        ],
        voirAussi: ['profil-etudiant-indicateurs']
    },

    'tableau-bord-apercu': {
        titre: 'Aperçu du groupe (indices A-C-P)',
        sections: [
            {
                type: 'texte',
                contenu: 'Les trois indices A-C-P résument le contexte d’apprentissage observé de chaque étudiant·e.'
            },
            {
                type: 'liste',
                titre: 'Les trois indices',
                items: [
                    '<strong>A — Assiduité</strong>\u00a0: présence en classe.',
                    '<strong>C — Complétion</strong>\u00a0: remise des productions.',
                    '<strong>P — Performance</strong>\u00a0: résultats aux évaluations.',
                ]
            },
            {
                type: 'texte',
                contenu: 'Les zones de couleur t’aident à repérer rapidement qui a besoin d’attention.'
            },
            {
                type: 'exemple',
                titre: 'Lire les écarts',
                contenu: 'Un·e étudiant·e avec un C élevé mais un P faible fournit l’effort sans obtenir les résultats\u00a0: c’est un signal pour intervenir. Tu peux ensuite regarder plus précisément sur quel critère ou habileté se situe la difficulté.'
            },
            {
                type: 'action', action: 'ouvrirGuidePedagogique', param: 'acp', libelle: 'Ouvrir le guide ACP'
            }
        ],
        voirAussi: ['tableau-bord-rai', 'profil-etudiant-indicateurs', 'suivi-liste']
    },

    'contexte-cours': {
        titre: 'Cours',
        sections: [
            {
                type: 'texte',
                contenu: 'Un seul cours peut être actif à la fois — c’est celui qui sert de référence dans toute l’application. Le code de cours suit le format habituel 000-000-XX (discipline-cours-lettres).'
            },
            {
                type: 'conseil',
                contenu: 'Tu peux dupliquer un cours pour créer rapidement une nouvelle session en modifiant seulement l’année, et verrouiller un cours terminé pour éviter les modifications accidentelles.'
            },
        ],
        voirAussi: ['calendrier-trimestre', 'construction-pratiques']
    },

    'contexte-horaire': {
        titre: 'Horaire',
        sections: [
            {
                type: 'texte',
                contenu: 'Indique tes séances de la semaine (de 1 à 5)\u00a0: pour chacune, le jour, les heures et le nombre de périodes. Le nombre de périodes est exigé\u00a0: c’est lui qui compte dans l’assiduité.'
            },
            {
                type: 'exemple',
                titre: 'Format des heures',
                contenu: 'Les heures utilisent le format 24h (ex.\u00a0: 13:00, pas 1:00\u00a0PM). Les séances de reprise sont ajoutées automatiquement quand tu configures les congés dans la section Trimestre.'
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: 'Si tu modifies le format horaire, les séances existantes seront recréées.'
            },
        ],
        voirAussi: ['calendrier-trimestre', 'calendrier-vue', 'suivi-saisie']
    },

    'contexte-groupe-etudiants': {
        titre: 'Groupe d’étudiant·es',
        sections: [
            {
                type: 'texte',
                contenu: 'Le champ Groupe permet d’organiser tes étudiant·es si tu as plusieurs groupes (ex.\u00a0: Groupe 1, Groupe 2) — utilise le filtre en haut pour afficher un groupe spécifique.'
            },
            {
                type: 'liste',
                titre: 'Format d’import en lot (7 colonnes)',
                items: [
                    'DA',
                    'Groupe',
                    'Nom',
                    'Prénom',
                    'Programme',
                    'Nom du programme',
                    'SA (Services adaptés)',
                ]
            },
            {
                type: 'conseil',
                contenu: 'Tu peux coller directement depuis un tableur ou le système de gestion institutionnel — la prévisualisation te permet de vérifier avant d’importer. La liste configurée ici est automatiquement disponible dans le tableau de bord.'
            },
            {
                type: 'alerte',
                niveau: 'important',
                contenu: 'Le bouton «\u00a0Réinitialiser\u00a0» supprime tous les étudiant·es de façon irréversible.'
            },
        ],
        voirAussi: ['suivi-liste', 'suivi-saisie']
    },

    'depistage-interpretation': {
        titre: 'Seuils d’interprétation du dépistage',
        sections: [
            {
                type: 'texte',
                contenu: 'Les seuils d’interprétation déterminent les couleurs et les alertes dans tout le tableau de bord. Toute modification s’applique immédiatement à tous les calculs — diagnostics RàI, patterns et recommandations.'
            },
            {
                type: 'exemple',
                titre: 'Valeurs par défaut',
                contenu: 'Progression\u00a0: 5 points (%). Sensibilité des flèches par critère\u00a0: 5 points (%). Défi\u00a0: ≤\u00a070\u00a0%.'
            },
            {
                type: 'conseil',
                contenu: 'En cas de doute, le bouton «\u00a0Restaurer les valeurs par défaut\u00a0» rétablit la configuration initiale.'
            },
        ],
        voirAussi: ['tableau-bord-rai', 'interventions-planification']
    },

    'planification-alignement': {
        titre: 'Carte d’alignement',
        sections: [
            {
                type: 'texte',
                contenu: 'La carte mentale rend visible l’alignement pédagogique de ton cours\u00a0: les liens entre ce que tu vises (compétence, connaissances), comment tu l’enseignes (activités, soutien) et comment tu le vérifies (évaluations).'
            },
            {
                type: 'conseil',
                contenu: 'Tu n’es pas obligé·e de suivre un ordre linéaire — commence par ce qui te semble naturel.'
            },
            {
                type: 'exemple',
                titre: 'Signalements d’incohérence',
                contenu: 'L’application signale les incohérences\u00a0: un objectif sans production liée, une connaissance sans évaluation prévue. Utilise ces alertes comme des pistes de réflexion, pas comme des erreurs à corriger.'
            },
            {
                type: 'texte',
                contenu: 'Les évaluations servent à livrer une rétroaction et peuvent prendre plusieurs formes (orale, écrite, etc.). Le menu de l’en-tête d’un bloc Évaluation choisit sa <strong>visée</strong> : formative ou certificative. Tant que tu n’as rien choisi, tes exports écrivent « Évaluation », comme avant.'
            },
            {
                type: 'texte',
                titre: 'Changer le type d’un bloc',
                contenu: 'Le nom du type, dans l’en-tête d’un bloc, est un <strong>menu</strong> : une connaissance factuelle devient conceptuelle, un exposé devient une activité, sans recréer le bloc ni recoller son contenu. Le menu n’offre que les types de la <strong>même famille</strong> — le titre, la durée et les liens restent en place. <strong>Séquence</strong> et <strong>Leçon</strong> font exception : elles n’ont pas de menu, parce qu’elles ne sont pas interchangeables.'
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: 'Une <strong>copie</strong> et un <strong>clone</strong> ne sont pas la même chose. Une copie est indépendante : la modifier ne touche pas l’original. Un clone reste lié — titre, durée et type se propagent entre toutes ses instances, et un 🧬 apparaît sur chacune. La règle est la même pour les deux gestes : <strong>sans ⇧ c’est une copie, avec ⇧ c’est un clone</strong>. Pour libérer un clone déjà créé : <em>Décloner</em>, dans l’Inspecteur à côté du compte de ses instances — ou <em>Actions ▸ Décloner la sélection</em> pour plusieurs blocs à la fois. Rien n’est supprimé : le bloc devient indépendant, contenu intact.'
            },
        ],
        voirAussi: ['conception-productions', 'construction-grilles']
    },

    // =========================================================================
    // LABO — ÉTUDES (explorations de recherche expérimentales)
    // =========================================================================

    'labo-etudes': {
        titre: 'Études',
        sections: [
            {
                type: 'texte',
                contenu: "Cette section rassemble des explorations de recherche : des outils expérimentaux qui cherchent à observer l’effet de certaines actions ou interventions sur les apprentissages. Ils sont en développement — ce qu’ils mesurent exactement, et comment l’interpréter, n’est pas encore établi ; certains évolueront, d’autres seront peut-être abandonnés."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Ce sont des pistes de réflexion, pas des preuves : une corrélation n’est pas une cause, et les tendances sont d’autant plus fragiles que ton groupe est petit. Prends-les comme des invitations à observer, pas comme des verdicts."
            }
        ]
    },

    // =========================================================================
    // MIGRATION tooltip-aide → primo-aide (ex-infobulles navigateur)
    // =========================================================================

    'apc-activite': {
        titre: 'Activité d’apprentissage dans une APC',
        sections: [
            {
                type: 'texte',
                contenu: 'Dans une approche par compétences (APC), une activité d’évaluation est généralement centrée sur l’apprentissage plutôt que sur un comportement (ex.\u00a0: participation, présence). Elle repose sur des objectifs explicites liés à la compétence du cours.'
            },
        ],
        voirAussi: ['conception-productions', 'planification-alignement']
    },
    'apc-grille-individuel': {
        titre: 'Évaluation individuelle en APC',
        sections: [
            {
                type: 'texte',
                contenu: 'Dans une approche par compétences, l’évaluation est généralement individuelle afin de rendre compte du degré d’acquisition de chaque apprenant·e.'
            },
            {
                type: 'conseil',
                contenu: 'Les travaux d’équipe peuvent être évalués, mais la contribution individuelle devrait idéalement être distinguée.'
            },
        ],
        voirAussi: ['construction-grilles', 'conception-productions']
    },
    'objectif-verbes-actifs': {
        titre: 'Verbes actifs et observables (Anderson\u00a0&\u00a0Krathwohl)',
        sections: [
            {
                type: 'texte',
                contenu: 'Formule tes objectifs avec des verbes actifs et observables selon la taxonomie révisée d’Anderson et Krathwohl.'
            },
            {
                type: 'exemple',
                titre: 'Verbes actionnables',
                contenu: 'nommer, décrire, analyser, créer, résoudre, comparer, justifier, concevoir…'
            },
            {
                type: 'conseil',
                contenu: 'Évite les verbes vagues comme <strong>savoir</strong>, <strong>comprendre</strong> ou <strong>connaître</strong>. La carte d’alignement (Conception → Carte d’alignement) propose une banque de verbes classés par niveau cognitif.'
            },
        ],
        voirAussi: ['planification-alignement', 'conception-productions']
    },
    'detail-tache-qualite': {
        titre: 'Un détail de tâche bien construit',
        sections: [
            {
                type: 'texte',
                contenu: 'La <strong>description de la tâche</strong> annonce ce qui est demandé ; le <strong>détail</strong> le rend exécutable. Les deux doivent dire la même chose, l’un en résumé, l’autre pas à pas.'
            },
            {
                type: 'liste',
                titre: 'À relire avant de publier la production',
                items: [
                    '<strong>Rien n’est laissé de côté</strong> — chaque élément annoncé par la tâche est traité dans le détail.',
                    '<strong>Rien n’arrive par surprise</strong> — le détail n’exige rien que la tâche n’annonce. C’est le défaut le plus coûteux : l’étudiant·e découvre l’exigence après avoir planifié son travail.',
                    '<strong>L’ordre est celui du travail réel</strong> — une amorce, puis des étapes numérotées, une seule action par étape.',
                    '<strong>Ça reste simple</strong> — un seul niveau de liste si possible, pas de redite d’une étape à l’autre.',
                    '<strong>C’est comparable d’une production à l’autre</strong> — deux tâches de complexité semblable méritent un détail de profondeur semblable.',
                ]
            },
            {
                type: 'conseil',
                contenu: 'Le détail décrit le <strong>travail à faire</strong>, pas la <strong>capacité visée</strong>. Si une consigne commence à ressembler à « sera capable de… », sa place est dans l’objectif d’apprentissage.'
            },
        ],
        voirAussi: ['objectif-verbes-actifs', 'conception-productions']
    },
    'echeance-indices': {
        titre: 'Date d’échéance et indices',
        sections: [
            {
                type: 'texte',
                contenu: 'Cette date fixe les indices C (Complétion) et P (Performance) pour les suivis longitudinaux. Une production non remise à cette date sera comptée comme manquante dans le calcul de C.'
            },
            {
                type: 'conseil',
                contenu: 'La date est <strong>facultative</strong> et peut \u00eatre pos\u00e9e d\u2019avance. C\u2019est la case <em>Consignes transmises</em> qui d\u00e9cide\u00a0: tant qu\u2019elle est d\u00e9coch\u00e9e, le gabarit s\u2019enregistre normalement et porte le badge <em>\u00e0 planifier</em> dans la liste. Il n\u2019appara\u00eet alors ni au calendrier ni dans les courbes de progression. Les indices C et P ne comptent une production qu\u2019\u00e0 partir de sa premi\u00e8re copie \u00e9valu\u00e9e.'
            },
        ],
        voirAussi: ['tableau-bord-apercu', 'conception-productions']
    },
    'echeances-multigroupes': {
        titre: 'Échéances multi-groupes',
        sections: [
            {
                type: 'texte',
                contenu: 'Chaque groupe-cours peut avoir sa propre date d’échéance. Décoche un groupe pour indiquer que la production ne lui est pas encore assignée.'
            },
        ],
        voirAussi: ['conception-productions']
    },
    'retroaction-grille-descriptive': {
        titre: 'Rétroaction et grille descriptive',
        sections: [
            {
                type: 'texte',
                contenu: 'La rétroaction fournie à l’apprenant·e repose sur le croisement de deux éléments\u00a0: les <strong>critères</strong> d’évaluation et les <strong>niveaux</strong> de performance. Ce croisement forme une <em>grille descriptive</em>.'
            },
            {
                type: 'liste',
                titre: 'Ce qu’une grille descriptive précise',
                items: [
                    'Le niveau atteint',
                    'Ce qui est maîtrisé',
                    'Ce qui reste à travailler',
                    'Comment progresser',
                ]
            },
            {
                type: 'conseil',
                contenu: 'Une rétroaction efficace est <strong>spécifique</strong>, <strong>actionnable</strong>, <strong>utile</strong> et <strong>bienveillante</strong>.'
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: 'Évite le «\u00a0sandwich\u00a0» (positif–négatif–positif)\u00a0: il dilue le message et n’atteint pas les objectifs d’une rétroaction efficace.'
            },
        ],
        voirAussi: ['construction-cartouches', 'construction-grilles']
    },
    'categories-selection-obligatoires': {
        titre: 'Catégories Sélection / Obligatoires',
        sections: [
            {
                type: 'texte',
                contenu: 'Permet de distinguer deux types de productions au sein de la pratique de notation.'
            },
            {
                type: 'liste',
                titre: 'Les deux catégories',
                items: [
                    '<strong>Sélection</strong> — les N meilleures sont retenues pour la note.',
                    '<strong>Obligatoires</strong> — toujours comptées, par exemple un examen final ou une mise en situation récapitulative.',
                ]
            },
        ],
        voirAussi: ['construction-pratiques', 'conception-productions']
    },
    // ⚠ #528 (26 août 2026) — CES DEUX AIDES SE RÉPONDENT, et c'est délibéré.
    // Chacune décrivait son champ sans mentionner l'autre : quelqu'un qui montait
    // sa première échelle lisait « plage de pourcentages » puis « valeur numérique
    // fixe », et ne comprenait pas pourquoi remplir les deux. La relation est ce
    // qui manquait, pas la définition. Les deux portent donc le MÊME exemple
    // (Maîtrise, 75-89) et se renvoient l'une à l'autre.
    'echelle-plage-notes': {
        titre: 'Plage de notes (niveau)',
        sections: [
            {
                type: 'texte',
                contenu: "La plage répond à une question\u00a0: « ce pourcentage, c’est quel niveau\u00a0? » Quand tu évalues avec une grille, l’application calcule un résultat chiffré\u00a0; la plage dit dans quel niveau il tombe. C’est elle qui permet à ton étudiant·e de recevoir « Maîtrise » plutôt qu’un 84\u00a0%\u00a0: le chiffre existe, il reste en coulisse."
            },
            {
                type: 'exemple',
                titre: 'Maîtrise, de 75\u00a0% à 89\u00a0%',
                contenu: "Une étudiante à 78\u00a0% reçoit « Maîtrise ». Une autre à 88\u00a0% le reçoit aussi. Elles reçoivent le même niveau, et c’est voulu — c’est tout le sens d’une échelle."
            },
            {
                type: 'conseil',
                contenu: "Sa jumelle est la VALEUR PONCTUELLE, qui répond à la question inverse\u00a0: « ce niveau, ça vaut combien\u00a0? » Les deux sont obligatoires, parce qu’elles ne se déduisent pas l’une de l’autre."
            }
        ],
        voirAussi: ['echelle-valeur-ponctuelle', 'construction-echelles']
    },
    'echelle-valeur-ponctuelle': {
        titre: 'Valeur ponctuelle',
        sections: [
            {
                type: 'texte',
                contenu: "La valeur ponctuelle répond à la question inverse de la plage\u00a0: « ce niveau, ça vaut combien\u00a0? » Vient le moment où il faut un chiffre — le bulletin, la note finale, la conversion exigée par le règlement. L’application a alors besoin d’UN nombre pour « Maîtrise ». Pas d’un intervalle\u00a0: un nombre."
            },
            {
                type: 'exemple',
                titre: 'Maîtrise vaut… 80\u00a0? 82\u00a0? 85\u00a0?',
                contenu: "Avec une plage de 75 à 89, le milieu serait 82. Mais tu voudrais peut-être 80, parce que dans ton département cela correspond à un B. Ou 85, parce que la maîtrise mérite d’être reconnue franchement. Aucun de ces chiffres n’est plus juste que les autres."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Ne déduis PAS la valeur ponctuelle de la plage. Le milieu d’un intervalle est un calcul, pas un jugement\u00a0: deux enseignant·es avec la même plage peuvent légitimement choisir deux valeurs différentes. C’est une décision pédagogique, et elle t’appartient — l’application ne la prend pas à ta place, elle te la demande."
            },
            {
                type: 'liste',
                titre: 'Quand chacune travaille',
                items: [
                    "Pratique alternative de notation\u00a0: la PLAGE travaille tout le temps — c’est ce que voit ton étudiant·e. La valeur ponctuelle sert au moment du bulletin.",
                    "Sommative traditionnelle\u00a0: la VALEUR PONCTUELLE travaille tout le temps — c’est la note. La plage sert en arrière-plan, pour situer le niveau atteint.",
                    "Les deux ne servent pas au même moment, mais les deux servent. Rien ne t’empêche de changer de pratique en cours de trimestre\u00a0: c’est pourquoi l’application demande les deux dès le départ."
                ]
            }
        ],
        voirAussi: ['echelle-plage-notes', 'construction-echelles', 'construction-pratiques']
    },
    'grille-type-critere-detail': {
        titre: 'Type de critère d’évaluation',
        sections: [
            {
                type: 'liste',
                titre: 'Trois types disponibles',
                // C1, validé G. 20 oct. 2026, 9 h 23 (plans de travail/TEXTES-2026-10-20-bareme.md) : ce que fait
                // l'application, comme le lexique (`type-de-critere`) et la bulle du champ.
                items: [
                    '<strong>Holistique</strong> : tu attribues un niveau de l’échelle de performance ; l’échelle donne la note du critère.',
                    '<strong>Analytique</strong> : tu attribues des points, de 0 à la pondération du critère ; son barème dit ce qu’ils valent.',
                    '<strong>Algorithmique</strong> : une formule calcule la note à partir de ce que tu comptes sur la copie.',
                ]
            },
        ],
        voirAussi: ['construction-grilles', 'evaluations-proceder']
    },
    // #1120, lot 2 (20 oct. 2026) : l'aide « i » du barème, ouverte à côté du titre « Barème » d'un critère
    // analytique (grilles.js, `rendreBaremeCritere`). B1 à B6, validés G. 20 oct. 9 h 23, tels quels.
    'grille-bareme': {
        titre: 'Le barème d’un critère',
        sections: [
            {
                type: 'texte',
                contenu: 'Un critère analytique se note en points, de 0 à sa pondération. Son barème dit ce que valent ces points : chaque tranche porte ses points et ce qu’on attend d’une copie qui les obtient, avec un nom si tu veux. Deux tranches ne se chevauchent pas : des points donnés tombent dans une seule.'
            },
            {
                type: 'texte',
                contenu: 'Avec une échelle, tu choisis un niveau et l’échelle donne la note. Avec un barème, tu donnes des points et le barème dit à quoi ils correspondent. C’est pourquoi une évaluation n’a qu’une échelle, alors que chaque critère analytique a son propre barème.'
            },
            {
                type: 'exemple',
                titre: '« L’étudiant·e résume l’œuvre avec justesse », sur 5 points.',
                contenu: 'Partiel, 2 points : Résume quelques événements.<br>Satisfaisant, 3 à 4 points : Résume l’essentiel.<br>Remarquable, 5 points : Résume avec précision et concision.'
            },
            {
                type: 'conseil',
                contenu: 'Le barème ne change aucune note : la note vient des points que tu donnes, avec ou sans barème. Il peut t’aider à donner les mêmes points à deux copies semblables.'
            }
        ],
        voirAussi: ['construction-echelles', 'echelle-plage-notes', 'grille-type-critere-detail']
    },
    'grille-niveau-solo': {
        titre: 'Niveau cognitif SOLO',
        sections: [
            {
                type: 'texte',
                contenu: 'Niveau cognitif du critère selon la taxonomie SOLO (Structure of Observed Learning Outcomes) de Biggs et Collis. Décrit la complexité structurelle attendue dans la réponse de l’étudiant·e.'
            },
            {
                type: 'conseil',
                contenu: 'Les critères <strong>multistructurels</strong> (fondations) sont surveillés par le dépistage pour détecter les difficultés persistantes. Identifie-les pour alimenter le suivi des fondamentaux.'
            },
            {
                // Lot 4, volet B — arrêtée par Grégoire le 4 sept. 2026 (15 h 50) : la phrase
                // « C'est le choix d'une méthode traditionnelle, sans taxonomie. » est RETIRÉE —
                // l'aide ne qualifie pas le choix du collègue.
                type: 'texte',
                contenu: '<strong>« Aucun »</strong> retire le critère de la lecture SOLO : il compte dans la note comme les autres, mais le dépistage des fondations ne le surveille pas et aucune étiquette ne l’accompagne dans les exports.'
            },
            {
                type: 'action', action: 'ouvrirGuidePedagogique', param: 'solo', libelle: 'Ouvrir le guide SOLO'
            }
        ],
        voirAussi: ['depistage-interpretation', 'suivi-apprentissage-fondamentaux']
    },

    // =========================================================================
    // ACCUEIL — MODE DÉMONSTRATION & DUPLICATION CC
    // =========================================================================

    'tour-guide': {
        titre: 'Visite guidée',
        sections: [
            {
                type: 'texte',
                contenu: "La visite guidée te présente, en quelques étapes, les grandes sections de l’application — Cadre, Conception, Évaluation, Suivi. Tu peux la quitter à tout moment, et la relancer depuis ce bouton quand tu veux."
            },
            {
                type: 'action',
                libelle: 'Démarrer la visite',
                action: 'demarrerTourDepuisAide'
            }
        ]
    },

    'accueil-donnees-demo': {
        // Le guidage de la démo (29 oct. 2026) : titre et blocs 1, 3 à 7 validés par Grégoire le 29 oct. à 8 h 02 et 8 h 03,
        // posés mot pour mot (plans de travail/TEXTES-2026-10-28-guidage-demo.md) ; le bloc 2 reste celui du 7 oct. (G4).
        titre: "Données démo",
        sections: [
            {
                type: 'texte',
                contenu: "La démo est un cours fictif, «\u00a0Écriture et littérature (Démo)\u00a0»\u00a0: 10 étudiant·es, 11 productions (1 portfolio, 9 artefacts et une évaluation terminale), 101 évaluations, 32 dates de présences (du 25 août au 10 décembre), 3 grilles de critères, 2 échelles de performance, 9 cartouches et une carte d'alignement. Coche «\u00a0Données démo\u00a0»\u00a0: elle s'ouvre dans Suivi › Suivi du groupe, à part de tes vraies données."
            },
            {
                // T6 du chantier du démo (décision G4 de Grégoire, 7 oct. 2026, par Cowork) : phrase validée.
                type: 'texte',
                contenu: "Ce que tu fais dans la démo est provisoire : une nouvelle version du pack démo remplace tes évaluations, et « Retirer les copies » efface les copies importées."
            },
            {
                type: 'texte',
                contenu: "Ce matériel est publié sous licence CC BY-NC-SA 4.0 (attribution, pas d'utilisation commerciale, partage dans les mêmes conditions). Il sert de modèle et t'accompagne vers l'autonomie, selon l'enseignement explicite."
            },
            {
                type: 'liste',
                titre: "Le parcours en trois temps",
                items: [
                    "<strong>Modélisation</strong> – Active la démo\u00a0: Suivi du groupe s'ouvre, déjà rempli. Tu vois ce que l'outil produit avec des données réalistes.",
                    "<strong>Pratique guidée</strong> – Ouvre une grille ou une échelle de la démo pour voir sa structure. Elle est en lecture seule\u00a0: tu ne peux pas la modifier par accident.",
                    "<strong>Autonomie</strong> – Clique sur «\u00a0Dupliquer pour créer ma grille\u00a0» (ou mon échelle, ma cartouche, ma production, ma pratique) et renomme la copie. Elle reste dans la démo\u00a0: une nouvelle version du pack l'efface."
                ]
            },
            {
                type: 'exemple',
                contenu: "Tu ouvres la grille «\u00a0Grille-5 FR-HOLIS-20 H26\u00a0» de la démo et tu cliques sur «\u00a0Dupliquer pour créer ma grille\u00a0». Ta copie porte la ligne «\u00a0Inspiré de Grille-5 FR-HOLIS-20 H26 par Labo Codex\u00a0»\u00a0: c'est la reconnaissance d'origine qu'exige la licence."
            },
            {
                type: 'conseil',
                contenu: "Dans les menus de Cadre › Trimestre (cours, horaire, enseignant·e, pratique, groupe-cours), le matériel de la démo paraît grisé, sous «\u00a0Démo (par Labo Codex – à dupliquer pour utiliser)\u00a0». Ton matériel ne peut pas pointer vers un modèle de la démo\u00a0: duplique-le d'abord, puis choisis ta copie."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Les données démo vivent dans un espace à part\u00a0: cocher ou décocher la case ne touche jamais à tes vrais trimestres. Pour en sortir, «\u00a0Quitter la démo\u00a0» dans le bandeau vert, ou décoche «\u00a0Données démo\u00a0»\u00a0; tes vraies données reviennent telles quelles."
            }
        ],
        voirAussi: ['bibliotheque-fonctionnement', 'construction-objectifs-reflexion']
    },

    // =========================================================================
    // RÉSERVE — VERSEMENT (modale #modalReserve)
    // =========================================================================

    'reserve-versement': {
        titre: "Archiver",
        sections: [
            {
                type: 'texte',
                contenu: "Archiver, c'est déposer une copie d'un groupe-cours terminé dans tes archives personnelle locale. C'est un geste manuel que tu déclenches en fin de trimestre."
            },
            {
                type: 'liste',
                titre: "Ce qui est archivé",
                items: [
                    "Les étudiant·es du groupe (liste, présences, évaluations enregistrées)",
                    "Les fichiers travaux importés pour ce groupe (photos, PDF)",
                    "Les bibliothèques actives au moment de l’archive (grilles, échelles, cartouches, productions, pratiques, tampons)",
                    "Les snapshots et les données de planification du trimestre"
                ]
            },
            {
                type: 'texte',
                contenu: "Tes archives vit sur ton ordinateur (ou sur un disque externe), dans le dossier <code>Archives_LaboCodex/</code>. Elle n'est jamais purgée. Si tu re-verses le même groupe-cours, l’archive précédent est remplacé."
            },
            {
                type: 'conseil',
                contenu: "Archiver ne supprime rien dans ton codex de travail — c'est une <strong>copie</strong>, pas un déplacement. Tu peux archiver autant de fois que tu veux."
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
                    "<strong>Chrome ou Edge</strong> — tu choisis ton dossier d’archives une seule fois, l'application y écrit directement à chaque archivage. Aucune manipulation de fichier de ton côté.",
                    "<strong>Safari</strong> — l'application produit un fichier ZIP que tu téléchargeras puis décompresseras toi-même dans ton dossier <code>Archives_LaboCodex/</code>. Plus d'étapes, mais le résultat est identique."
                ]
            },
            {
                type: 'conseil',
                contenu: "Tu peux changer de navigateur d'une archive à l'autre — les archives est compatible avec les deux flux. Si tu utilises principalement une tablette, le flux ZIP de Safari est ton chemin."
            }
        ],
        voirAussi: ['reserve-versement']
    },

    // =========================================================================
    // ARCHIVES — OUVRIR UNE ARCHIVE (modale #modalOuvrirVersement)
    // =========================================================================

    'reserve-ouvrir-versement': {
        titre: "Ouvrir une archive",
        sections: [
            {
                type: 'texte',
                contenu: "Ouvrir une archive, c'est consulter un archive archivée pour réimporter une ou plusieurs ressources dans tes bibliothèques actives. C'est un geste manuel et sélectif : tu choisis ce que tu reprends."
            },
            {
                type: 'liste',
                titre: "Ce qui est réimportable",
                items: [
                    "Grilles, échelles, productions, cartouches de rétroaction, pratiques de notation, tampons personnalisés",
                    "Les données pédagogiques (étudiant·es, présences, évaluations) ne sont pas réimportables — elles restent dans l’archive, figées"
                ]
            },
            {
                type: 'liste',
                titre: "Selon ton navigateur",
                items: [
                    "<strong>Chrome ou Edge</strong> avec un dossier d’archives configuré : tu vois la liste de tes archives, tu en choisis un.",
                    "<strong>Safari</strong> : tu sélectionnes le fichier d'archive (<code>.zip</code>) de ton choix. Si tu viens d’archiver depuis Safari, ton fichier est dans ton dossier Téléchargements."
                ]
            },
            {
                type: 'conseil',
                contenu: "L’archive original n'est jamais modifié. Réimporter, c'est faire une copie."
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
                contenu: "Si une référence est absente de l’archive et de tes bibliothèques actives, l'item est marqué « référence manquante » en orange. Tu peux quand même le réimporter, mais sa référence sera cassée."
            }
        ],
        voirAussi: ['reserve-copie-double', 'reserve-ref-manquante']
    },


    'reserve-copie-double': {
        titre: "Recopier en double",
        sections: [
            {
                type: 'texte',
                contenu: "Quand un item de l’archive est déjà présent dans ta bibliothèque active (même identifiant), il est grisé par défaut pour éviter d'écraser ta version actuelle."
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
        voirAussi: ['reserve-types-ressources']
    },

    'reserve-ref-manquante': {
        titre: "Référence manquante",
        sections: [
            {
                type: 'texte',
                contenu: "Cet item référence une autre ressource (par exemple une production référence une grille) qui n'est ni dans l’archive, ni dans ta bibliothèque active. Si tu réimportes l'item tel quel, sa référence sera cassée."
            },
            {
                type: 'liste',
                titre: "Que faire ?",
                items: [
                    "Si la ressource manquante est dans une autre archive, ouvre-la d'abord pour la réimporter, puis reviens ouvrir celui-ci.",
                    "Sinon, accepte la cassure : l'item s'affichera dans ta bibliothèque mais sans sa grille ou son échelle associée. Tu pourras la rebrancher plus tard."
                ]
            }
        ],
        voirAussi: ['reserve-types-ressources']
    },

    // =========================================================================
    // RÉSERVE — PANNEAU CONTENU DU VERSEMENT (#257 v2.B-α)
    // =========================================================================

    'reserve-contenu-versement': {
        titre: "Contenu de l’archive",
        sections: [
            {
                type: 'texte',
                contenu: "Ce panneau te montre <strong>ce qui se trouve dans cette archive</strong> avant que tu décides ce que tu veux réimporter. C'est une vue de lecture seule, en mémoire seulement — rien n'est ajouté à ton application tant que tu n'as pas coché et cliqué <em>Réimporter</em>."
            },
            {
                type: 'liste',
                titre: "Ce que tu vois",
                items: [
                    "<strong>Étudiant·es</strong> : nombre et liste détaillée. Le toggle <em>Anonymiser les noms</em> remplace les vrais noms par <code>Élève 1, 2, 3…</code> — utile pour une démo ou un partage d'écran.",
                    "<strong>Productions distinctes</strong> : nombre de titres uniques de production présents dans l’archive.",
                    "<strong>Évaluations</strong> : nombre total d'évaluations enregistrées.",
                    "<strong>Fichiers travaux</strong> : photos et PDF déposés par les étudiant·es.",
                    "<strong>Présences, snapshots, interventions</strong> : autres traces pédagogiques."
                ]
            },
            {
                type: 'conseil',
                contenu: "Les compteurs reflètent l'état du groupe-cours <strong>au moment de l’archive</strong>. L’archive est figé : si tu corriges des données dans ton trimestre actif, ces corrections ne sont pas répercutées dans le ZIP."
            },
            {
                type: 'texte',
                titre: "Pourquoi consulter avant de réimporter ?",
                contenu: "Pour t'assurer que tu ouvres la bonne archive (bon trimestre, bon groupe), pour estimer ce que tu vas chercher, ou pour faire une démo d'un trimestre passé sans modifier tes bibliothèques actives."
            }
        ],
        voirAussi: ['reserve-ouvrir-versement', 'reserve-types-ressources', 'reglages-reserve']
    },

    // =========================================================================
    // RÉSERVE — CARTE DANS RÉGLAGES > DONNÉES (#249)
    // =========================================================================

    'reglages-reserve': {
        titre: "Archives stockées",
        sections: [
            {
                type: 'texte',
                contenu: "Cette section est l’<strong>index local</strong> de tes archives. Elle te montre ce que ton application sait de ton historique d’archives — peu importe où les fichiers ZIP eux-mêmes vivent sur ton disque."
            },
            {
                type: 'liste',
                titre: "Comment l'index s'alimente",
                items: [
                    "À chaque archivage (Codex › Archiver…), une nouvelle ligne s'ajoute automatiquement.",
                    "À chaque ouverture d'un fichier ZIP via Ouvrir une archive…, l’archive est ajouté à l'index s'il n'y figure pas déjà.",
                    "Sur Chrome ou Edge, si un dossier d’archives est lié, le bouton <em>Vérifier le dossier</em> synchronise l'index avec le manifeste central du dossier."
                ]
            },
            {
                type: 'texte',
                contenu: "<em>Vérifier</em> relit une archive copie par copie ; une archive vérifiée offre <em>Faire revenir</em>."
            },
            {
                type: 'conseil',
                contenu: "<strong>Retirer</strong> une ligne de l'index ne supprime <strong>aucun fichier</strong> sur disque. C'est juste un nettoyage de l'index. Pour vraiment supprimer une archive, supprime le ZIP toi-même dans le Finder."
            },
            {
                type: 'texte',
                titre: "Où sont les données pédagogiques d'un groupe-cours archivé ?",
                contenu: "Archiver n'a <strong>rien supprimé</strong> dans ton codex. Les étudiant·es, présences, évaluations et fichiers du trimestre que tu as archivé sont toujours dans ton application. Pour les consulter, change le <strong>trimestre actif</strong> dans le sélecteur du haut. L’archive, elle, est une copie de sécurité figée."
            },
            {
                type: 'liste',
                titre: "Lecture des colonnes",
                items: [
                    "<strong>Mode</strong> indique comment l’archive a été produit. <em>Disque (FSAPI)</em> = écriture directe par Chrome/Edge dans ton dossier d’archives. <em>ZIP</em> = fichier téléchargé par Safari.",
                    "<strong>Étud.</strong> et <strong>Fich.</strong> sont les compteurs au moment de l’archive.",
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
                contenu: "Plusieurs fichiers pour un même cas n'est pas forcément un problème : l'étudiant·e peut avoir soumis un livrable en plusieurs morceaux (image + PDF), une reprise via jeton, ou simplement deux versions distinctes. À toi de juger en consultant les noms et les dates."
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
    },

    // =========================================================================
    // MODALES SYSTÈME (#256-bis) — aide contextuelle dans les overlays
    // =========================================================================

    'modal-nouveautes': {
        titre: "Nouveautés et numéro de version",
        sections: [
            {
                type: 'texte',
                contenu: "Cette fenêtre affiche les ajouts et correctifs récents de Labo Codex, regroupés par version majeure. Une pastille rouge sur l'icône d'accueil signale qu'il y a quelque chose de nouveau depuis ta dernière visite."
            },
            {
                type: 'liste',
                titre: "Comment lire le numéro",
                items: [
                    "<strong>Beta 99.41</strong> — version majeure. Change quand une fonctionnalité notable est livrée.",
                    "<strong>Build 0511-1234</strong> — date et heure de compilation (MMJJ-HHMM, heure Toronto). Change à chaque commit, même pour un correctif mineur.",
                    "Les détails complets sont dans <strong>Réglages > À propos</strong>."
                ]
            },
            {
                type: 'conseil',
                contenu: "Si la pastille reste rouge après lecture, fais défiler la modale jusqu'au bas — il faut atteindre le bouton « Fermer » pour marquer le build comme vu."
            }
        ]
    },

    'modal-wizard-pratique': {
        titre: "Assistant de configuration — Pratique de notation",
        sections: [
            {
                type: 'texte',
                contenu: "L'assistant te guide en 8 étapes pour configurer une pratique de notation alignée avec tes intentions pédagogiques : type d'évaluation, sommative ou portfolio, règles de reprise, jetons, calcul de la note finale."
            },
            {
                type: 'liste',
                titre: "Les 8 étapes",
                items: [
                    "<strong>1. Informations de base</strong> — nom et description de la pratique.",
                    "<strong>2. Type d'évaluation</strong> — sommative classique, portfolio de progression, ou variante.",
                    "<strong>3. Règles de remplacement</strong> — comment les nouvelles évaluations affectent les anciennes.",
                    "<strong>4. Système de jetons</strong> — délai, reprise (optionnel).",
                    "<strong>5. Échelle de performance</strong> — niveaux et leur poids dans la note.",
                    "<strong>6. Critères</strong> — modèle de grille par défaut.",
                    "<strong>7. Rétroaction</strong> — modèle de cartouche par défaut.",
                    "<strong>8. Récapitulatif</strong> : relecture avant l'enregistrement."
                ]
            },
            {
                type: 'conseil',
                contenu: "Tu peux quitter l'assistant à tout moment avec la croix : rien n'est enregistré tant que tu n'as pas atteint la dernière étape. Une pratique créée peut être éditée plus tard sans repasser par l'assistant."
            }
        ],
        voirAussi: ['construction-pratiques']
    },

    'modal-apercu-pdf': {
        titre: "Aperçu et options du document PDF",
        sections: [
            {
                type: 'texte',
                contenu: "Cette fenêtre montre à quoi ressemblera le PDF qui sera téléchargé. Les changements d'options se reflètent en temps réel dans l'aperçu."
            },
            {
                type: 'liste',
                titre: "Options de mise en page",
                items: [
                    "<strong>Orientation</strong> — portrait pour du texte, paysage pour des tableaux larges ou des images.",
                    "<strong>Entête</strong> — ce qui apparaît en haut de chaque page (logo, nom, date).",
                    "<strong>Marges</strong> — sur certains documents seulement, pour ajuster la densité."
                ]
            },
            {
                type: 'conseil',
                contenu: "Si l'aperçu semble figé, ferme et rouvre la modale. Pour une image annotée trop dense, choisis paysage — le contenu sera mieux réparti."
            }
        ]
    },

    'modal-confidentiel': {
        titre: "Informations confidentielles d'un·e étudiant·e",
        sections: [
            {
                type: 'texte',
                contenu: "Cette fiche stocke des informations sensibles localement, dans ton navigateur uniquement. Elles ne sont jamais envoyées à un serveur, jamais incluses dans les exports partageables (matériel pédagogique, codex data anonymisé), et masquées en mode anonymisation."
            },
            {
                type: 'liste',
                titre: "Ce que tu peux noter",
                items: [
                    "<strong>Parcours</strong> — EPGC, redoublement, plan d'accommodement.",
                    "<strong>Notes ponctuelles</strong> — observations qui n'ont pas leur place dans une rétroaction.",
                    "<strong>Portrait</strong> — éléments contextuels (langue maternelle, situation particulière, contacts)."
                ]
            },
            {
                type: 'alerte',
                niveau: 'important',
                contenu: "Cette information voyage avec ton codex. Si tu partages un codex avec quelqu'un, vérifie d'abord que ces données ne doivent pas y être."
            },
            {
                type: 'conseil',
                contenu: "Limite-toi à ce qui est utile à ta pratique. Évite les jugements personnels — la fiche peut être consultée par toi plus tard, dans un contexte différent."
            }
        ]
    },

    'modal-import': {
        titre: "Importer des données dans Labo Codex",
        sections: [
            {
                type: 'texte',
                contenu: "Cette modale accepte des fichiers JSON ou ZIP générés par Labo Codex. L'import écrase les clés correspondantes. Pour transporter ton travail d'un appareil à l'autre, passe par le codex (menu Codex, en haut de l'écran)."
            },
            {
                type: 'alerte',
                niveau: 'important',
                contenu: "L'importation remplace définitivement les données existantes pour les clés importées. Pour une fusion intelligente (3-way merge), passe par le Codex (Réglages > Données > Ouvrir un codex)."
            },
            {
                type: 'liste',
                titre: "Formats acceptés",
                items: [
                    "<strong>.json</strong> : fichier de données d'une version antérieure, sans fichiers de travaux.",
                    "<strong>.zip</strong> : configuration partagée, ou fichier de données d'une version antérieure avec ses fichiers de travaux.",
                    "<strong>codex-‹nom›-‹date›.zip</strong> : fichier codex complet (passer plutôt par Réglages > Données)."
                ]
            },
            {
                type: 'conseil',
                contenu: "Mets toujours ton codex à jour avant un import : c'est ton filet de sécurité si l'import écrase des données que tu voulais garder."
            }
        ]
    },

    'modal-codex-data': {
        titre: "Extraire un codex data",
        sections: [
            {
                type: 'texte',
                contenu: "Un codex data est un format léger (5–30 Mo) qui contient les métadonnées et les évaluations d'un ou plusieurs trimestres, mais SANS les fichiers blobs (PDF, images). Il est destiné à être consommé par le Labo de Codex Numéris pour la recherche, ou pour comparer des trimestres."
            },
            {
                type: 'liste',
                titre: "Trois modes de source",
                items: [
                    "<strong>FSAPI</strong> — depuis ton dossier Archives lié (Chrome/Edge). L'app détecte automatiquement les trimestres archivés.",
                    "<strong>Dossier</strong> — sélectionne ton dossier Archives_LaboCodex/ ; l'app détecte les sous-dossiers d'archives.",
                    "<strong>Fichiers ZIP</strong> — sélectionne un ou plusieurs fichiers .reserve.zip (Safari, iPad ou Chrome sans handle)."
                ]
            },
            {
                type: 'conseil',
                contenu: "Le hash SHA-256 calculé en bas du fichier permet de détecter une altération entre l'extraction et la lecture au Labo. C'est un sceau d'intégrité, pas un chiffrement — le contenu reste lisible."
            }
        ],
        voirAussi: ['modal-export-preview']
    },

    // La fenêtre d'aperçu (Défense K-β, docs/securite/MODELE-MENACES.md §X-02) : une seule aide
    // pour le codex, l'archive, la configuration et les tampons. Mots de Cowork (24 oct. 2026) :
    // ni « export », ni « téléchargement », ni jargon interne.
    'modal-export-preview': {
        titre: "Ce que contient le fichier",
        sections: [
            {
                type: 'texte',
                contenu: "Cette fenêtre te montre ce qui va entrer dans le fichier (la liste des fichiers et dossiers, ou celle des champs pour un fichier JSON), avant qu'il soit écrit. Tu peux encore annuler si quelque chose te paraît inattendu."
            },
            {
                type: 'liste',
                titre: "Ce que tu dois vérifier",
                items: [
                    "Les noms correspondent à ce que tu veux enregistrer : pas de chemin étrange, pas de fichier caché.",
                    "Pour un fichier JSON, les champs sont ceux que tu attends.",
                    "Le nombre de fichiers ou de champs correspond à ce que tu as préparé."
                ]
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Si tu vois un nom que tu ne reconnais pas, clique « Annuler » et signale-le."
            }
        ]
    },

    // =========================================================================
    // TEXTES RELUS PAR GRÉGOIRE (15 oct. 2026, blocs 1 et 2 ; #364 T3 et T4)
    // =========================================================================

    'comparateur-pratiques': {
        titre: "Comprendre l'Exploration des pratiques",
        sections: [
            {
                type: 'texte',
                contenu: "L'Exploration des pratiques montre ce que deux ou trois pratiques de notation feraient des mêmes parcours d'étudiant·es. Seules les règles de la pratique changent d'une colonne à l'autre."
            },
            {
                type: 'texte',
                contenu: "<strong>Ce que tu vois.</strong> En haut, « Construction de la note » : les réglages de chaque pratique, ligne par ligne. En bas, « Résultat – profils-types » : la note que chaque pratique donnerait à chaque profil. Clique sur un profil pour ouvrir sa fiche : la maîtrise atteinte en fin de parcours et ce que chaque pratique retient."
            },
            {
                type: 'texte',
                contenu: "<strong>D'où viennent les données.</strong> Par défaut, des profils fictifs fabriqués à partir de ton échelle de performance. Tu peux aussi choisir ton groupe actif : ce sont alors tes vrais résultats. Dans les deux cas, comparer n'écrit rien : tes notes ne changent pas."
            },
            {
                type: 'texte',
                contenu: "<strong>Les maquettes.</strong> Une maquette est une copie d'essai d'une de tes pratiques. Tu la dérives, tu changes un réglage, puis tu la compares à l'originale. Si elle te convient, adopte-la ; sinon, jette-la. Tant que tu ne l'as pas adoptée, elle n'apparaît nulle part ailleurs."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Un tiret avec « non constructible » n'est pas un zéro : la pratique ne peut pas bâtir de note avec ces réglages et ces résultats. En dénotation, la case dit « jugement » : la note est posée par toi, elle ne se calcule pas."
            },
            {
                type: 'conseil',
                contenu: "Un écart entre deux notes n'est ni un bonus ni une erreur. Regarde d'abord « Ce que ces réglages changent », puis la maîtrise atteinte, et seulement ensuite les points."
            }
        ],
        voirAussi: []
    },

    'import-autre-trimestre': {
        titre: "Importer depuis un autre trimestre",
        sections: [
            {
                type: 'texte',
                contenu: "Importer crée une copie. Le modèle d'origine reste intact dans son trimestre ; c'est la copie, dans ton trimestre actif, que tu modifies ensuite."
            },
            {
                type: 'texte',
                contenu: "<strong>Ce qui change sur la copie.</strong> Une pratique copiée porte « (importée) » à la fin de son nom ; tu peux le retirer. La carte de chaque copie dit de quel modèle elle vient."
            },
            {
                type: 'texte',
                contenu: "<strong>Ce qui voyage avec une grille.</strong> Ses rétroactions (cartouches) sont copiées avec elle."
            },
            {
                type: 'alerte',
                niveau: 'attention',
                contenu: "Une pratique copiée garde le nom de son échelle et de sa grille. Si elles n'existent pas dans ton trimestre actif, un message te le dit : choisis-les de nouveau en modifiant la pratique."
            },
            {
                type: 'conseil',
                contenu: "Pas sûr de tout vouloir ? « Voir les… » affiche la liste ; chaque ligne a son propre bouton « Importer »."
            }
        ],
        voirAussi: []
    },

    'modal-suppression-ressource': {
        titre: "Supprimer une ressource définitivement",
        sections: [
            {
                type: 'texte',
                contenu: "Cette modale gère la suppression d'une ressource (grille, échelle, cartouche, production, pratique). Elle vérifie les dépendances avant de te laisser confirmer."
            },
            {
                type: 'liste',
                titre: "Trois cas possibles",
                items: [
                    "<strong>Dépendances bloquantes</strong> (rouge) — la suppression est impossible. Exemple : une grille référencée par des évaluations existantes. Tu dois d'abord supprimer ce qui dépend de la ressource.",
                    "<strong>Avertissements</strong> (orange) — la suppression est possible mais aura des conséquences. Exemple : une grille présente dans la bibliothèque sera retirée de la liste partageable.",
                    "<strong>Aucune dépendance</strong> (vert) — suppression sécuritaire."
                ]
            },
            {
                type: 'alerte',
                niveau: 'important',
                contenu: "La confirmation par saisie du nom est volontaire — c'est un garde-fou contre les clics rapides. Tape le nom exact (accents, espaces, majuscules) pour activer le bouton de confirmation."
            },
            {
                type: 'conseil',
                contenu: "Une suppression est irréversible côté app. Si tu as un Codex récent, tu pourras toujours restaurer la ressource depuis là. Sinon, c'est définitif."
            }
        ]
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
