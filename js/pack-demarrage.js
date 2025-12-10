/* ===============================
   MODULE: Pack de démarrage (données démo)
   Beta 93.5 - Groupe 9999
   =============================== */

// Exporter les données comme variable globale
const PACK_DEMARRAGE = 
{
  "_metadata": {
    "nom": "Pack de démarrage - Écriture et littérature",
    "version": "3.0",
    "date": "2025-12-10",
    "description": "Pack de démonstration - 10 étudiants, 4 artefacts, 8 semaines de données (Beta 93.5)",
    "auteur": "Primo Primavera",
    "cours": "601-101 - Écriture et littérature",
    "formats": "Basé sur structures réelles de l'application"
  },
  "infoCours": {
    "sigle": "601-101",
    "titre": "Écriture et littérature",
    "competence": "4EF0",
    "enseignant": "Primo Primavera",
    "session": "H2026",
    "groupe": "9999",
    "heuresHebdo": 4,
    "actif": true
  },
  "listeCours": [
    {
      "id": "601-101-h2026-9999",
      "sigle": "601-101",
      "titre": "Écriture et littérature",
      "competence": "4EF0",
      "enseignant": "Primo Primavera",
      "session": "H",
      "annee": "2026",
      "groupe": "9999",
      "heuresHebdo": 4,
      "actif": true,
      "pratiqueId": "sommative",
      "trimestreId": "h2026"
    }
  ],
  "groupeEtudiants": [
    {
      "da": "2234567",
      "prenom": "Émilie",
      "nom": "Tremblay",
      "programme": "500.A1",
      "sa": false,
      "groupe": "9999",
      "coursId": "601-101-h2026-9999"
    },
    {
      "da": "2234568",
      "prenom": "Antoine",
      "nom": "Gagnon",
      "programme": "200.B0",
      "sa": true,
      "groupe": "9999",
      "coursId": "601-101-h2026-9999"
    },
    {
      "da": "2234569",
      "prenom": "Léa",
      "nom": "Roy",
      "programme": "300.A0",
      "sa": false,
      "groupe": "9999",
      "coursId": "601-101-h2026-9999"
    },
    {
      "da": "2234570",
      "prenom": "Thomas",
      "nom": "Côté",
      "programme": "420.B0",
      "sa": false,
      "groupe": "9999",
      "coursId": "601-101-h2026-9999"
    },
    {
      "da": "2234571",
      "prenom": "Camille",
      "nom": "Bouchard",
      "programme": "180.A0",
      "sa": true,
      "groupe": "9999",
      "coursId": "601-101-h2026-9999"
    },
    {
      "da": "2234572",
      "prenom": "Gabriel",
      "nom": "Lavoie",
      "programme": "410.B0",
      "sa": false,
      "groupe": "9999",
      "coursId": "601-101-h2026-9999"
    },
    {
      "da": "2234573",
      "prenom": "Juliette",
      "nom": "Bergeron",
      "programme": "500.A1",
      "sa": false,
      "groupe": "9999",
      "coursId": "601-101-h2026-9999"
    },
    {
      "da": "2234574",
      "prenom": "Samuel",
      "nom": "Morin",
      "programme": "200.B0",
      "sa": false,
      "groupe": "9999",
      "coursId": "601-101-h2026-9999"
    },
    {
      "da": "2234575",
      "prenom": "Rosalie",
      "nom": "Pelletier",
      "programme": "300.A0",
      "sa": true,
      "groupe": "9999",
      "coursId": "601-101-h2026-9999"
    },
    {
      "da": "2234576",
      "prenom": "Alexandre",
      "nom": "Gauthier",
      "programme": "420.B0",
      "sa": false,
      "groupe": "9999",
      "coursId": "601-101-h2026-9999"
    }
  ],
  "modalitesEvaluation": {
    "pratique": "sommative",
    "affichageTableauBord": {
      "afficherSommatif": true,
      "afficherAlternatif": false
    },
    "afficherDescriptionsSOLO": true,
    "activerRai": true,
    "activerCategorisationErreurs": false,
    "grilleReferenceDepistage": "GRILLE1759243306842",
    "seuilsInterpretation": {
      "fragile": 0.7,
      "acceptable": 0.8,
      "bon": 0.85
    }
  },
  "grillesTemplates": [
    {
      "id": "GRILLE1759243306842",
      "nom": "Global-5 FR-HOLIS",
      "criteres": [
        {
          "nom": "Structure",
          "description": "Capacité à organiser sa pensée de manière logique et cohérente",
          "ponderation": 15,
          "type": "holistique",
          "formule": "",
          "verrouille": false,
          "id": "CR1759243306842"
        },
        {
          "nom": "Rigueur",
          "description": "Qualité et exhaustivité du travail d'analyse",
          "ponderation": 20,
          "type": "holistique",
          "formule": "",
          "verrouille": true,
          "id": "CR1759243331050"
        },
        {
          "nom": "Plausibilité",
          "description": "Crédibilité et pertinence des interprétations proposées",
          "ponderation": 10,
          "type": "holistique",
          "formule": "",
          "verrouille": true,
          "id": "CR1759243365467"
        },
        {
          "nom": "Nuance",
          "description": "Capacité à percevoir et exprimer les subtilités du texte littéraire",
          "ponderation": 25,
          "type": "holistique",
          "formule": "",
          "verrouille": true,
          "id": "CR1759243379949"
        },
        {
          "nom": "Français écrit",
          "description": "Maîtrise de la langue et qualité de l'expression",
          "ponderation": 30,
          "type": "holistique",
          "formule": "",
          "verrouille": true,
          "id": "CR1759243428715"
        }
      ],
      "dateCreation": "2025-09-30T14:41:46.842Z",
      "dateModification": "2025-10-28T23:55:19.392Z"
    }
  ],
  "configEchelle": {
    "type": "IDME",
    "niveaux": 5,
    "echelle": "ECH1759264511178"
  },
  "echellesTemplates": [
    {
      "id": "ECH1759264511178",
      "nom": "IDME et niv 0",
      "niveaux": [
        {
          "code": "0",
          "nom": "Aucun",
          "min": 0,
          "max": 0,
          "valeurCalcul": 0,
          "couleur": "#831100"
        },
        {
          "code": "I",
          "nom": "Incomplet ou insuffisant",
          "description": "Préstructurel, unistructurel",
          "min": 0,
          "max": 64.99,
          "couleur": "#e67e22",
          "valeurCalcul": "40"
        },
        {
          "code": "D",
          "nom": "En Développement",
          "description": "Multistructurel",
          "min": 65,
          "max": 74.99,
          "couleur": "#f1c40f",
          "valeurCalcul": "65"
        },
        {
          "code": "M",
          "nom": "Maîtrisé",
          "description": "Relationnel acquis",
          "min": 75,
          "max": 84.99,
          "couleur": "#27ae60",
          "valeurCalcul": "75"
        },
        {
          "code": "E",
          "nom": "Étendu",
          "description": "Abstrait étendu",
          "min": 85,
          "max": 100,
          "couleur": "#3498db",
          "valeurCalcul": "100"
        }
      ],
      "config": {
        "typeEchelle": "lettres",
        "seuilReussite": 60,
        "notePassage": "",
        "codesPersonnalises": ""
      },
      "dateCreation": "2025-09-30T20:35:11.178Z",
      "dateModification": "2025-11-22T12:19:33.703Z"
    }
  ],
  "productions": [
    {
      "titre": "Portfolio",
      "description": "Dossier d'apprentissage",
      "type": "portfolio",
      "ponderation": 60,
      "objectif": "Développer tes compétences en lecture, en rédaction, en révision et en métacognition.",
      "tache": "Le portfolio est un dossier d'apprentissage composé d'exercices (appelés «artefacts») que tu feras seul ou en équipe.",
      "grilleId": "",
      "verrouille": false,
      "regles": {
        "nombreARetenir": 4,
        "minimumCompletion": 4,
        "nombreTotal": 4
      },
      "modeCalcul": "provisoire",
      "id": "PROD_PORTFOLIO",
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "A1",
      "titre": "Artefact 1",
      "description": "Stratégies de lecture",
      "type": "artefact-portfolio",
      "ponderation": 0,
      "objectif": "Développer sa capacité à utiliser efficacement différentes stratégies de lecture et à documenter de manière claire et méthodique son processus d'analyse.",
      "tache": "Appliquer au moins trois stratégies de lecture différentes sur un texte littéraire et laisser des traces visibles et organisées de cette analyse.",
      "grilleId": "GRILLE1759243306842",
      "verrouille": false,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "A2",
      "titre": "Artefact 2",
      "description": "Description d'un personnage",
      "type": "artefact-portfolio",
      "ponderation": 0,
      "grilleId": "GRILLE1759243306842",
      "objectif": "Développer ta capacité d'observation détaillée des personnages tout en renforçant ta maîtrise de la grammaire française.",
      "tache": "Décrire un personnage en observant systématiquement toutes ses dimensions et faire une analyse grammaticale complète de ton texte.",
      "verrouille": false,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "A3",
      "titre": "Artefact 3",
      "description": "Carte mentale",
      "type": "artefact-portfolio",
      "ponderation": 0,
      "grilleId": "GRILLE1759243306842",
      "objectif": "Développer sa capacité à analyser collaborativement un texte et à représenter les relations entre objectif, mécanismes et procédés.",
      "tache": "En binôme, construire une carte mentale qui organise visuellement l'analyse du texte, en délibérant sur chaque élément pour arriver à une interprétation commune.",
      "verrouille": false,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "A4",
      "titre": "Artefact 4",
      "description": "Formuler 10 HOC",
      "type": "artefact-portfolio",
      "ponderation": 0,
      "objectif": "Développer ta capacité à reconnaître les intentions d'un auteur, ses stratégies d'écriture et les liens qui unissent différents récits d'une même œuvre.",
      "tache": "Analyser dix récits du recueil pour identifier leurs objectifs de communication, mécanismes littéraires et preuves textuelles, puis synthétiser les patterns observés.",
      "grilleId": "GRILLE1759243306842",
      "verrouille": false,
      "coursId": "601-101-h2026-9999"
    }
  ],
  "calendrierComplet": {
    "dateDebut": "2026-01-19",
    "dateFin": "2026-03-20",
    "totalJours": 109,
    "totalSemaines": 8,
    "totalJoursCours": 40,
    "conges": [
      {
        "date": "2026-03-02",
        "description": "Semaine de lecture",
        "type": "prevu"
      },
      {
        "date": "2026-03-03",
        "description": "Semaine de lecture",
        "type": "prevu"
      },
      {
        "date": "2026-03-04",
        "description": "Semaine de lecture",
        "type": "prevu"
      },
      {
        "date": "2026-03-05",
        "description": "Semaine de lecture",
        "type": "prevu"
      },
      {
        "date": "2026-03-06",
        "description": "Semaine de lecture",
        "type": "prevu"
      },
      {
        "date": "2026-04-03",
        "description": "Vendredi saint",
        "type": "prevu"
      },
      {
        "date": "2026-04-06",
        "description": "Lundi de Pâques",
        "type": "prevu"
      }
    ],
    "joursCours": [
      "2026-01-19",
      "2026-01-20",
      "2026-01-21",
      "2026-01-22",
      "2026-01-23",
      "2026-01-26",
      "2026-01-27",
      "2026-01-28",
      "2026-01-29",
      "2026-01-30",
      "2026-02-02",
      "2026-02-03",
      "2026-02-04",
      "2026-02-05",
      "2026-02-06",
      "2026-02-09",
      "2026-02-10",
      "2026-02-11",
      "2026-02-12",
      "2026-02-13",
      "2026-02-16",
      "2026-02-17",
      "2026-02-18",
      "2026-02-19",
      "2026-02-20",
      "2026-02-23",
      "2026-02-24",
      "2026-02-25",
      "2026-02-26",
      "2026-02-27",
      "2026-03-09",
      "2026-03-10",
      "2026-03-11",
      "2026-03-12",
      "2026-03-13",
      "2026-03-16",
      "2026-03-17",
      "2026-03-18",
      "2026-03-19",
      "2026-03-20"
    ]
  },
  "seancesCompletes": {
    "lundi": {
      "actif": true,
      "heureDebut": "08:30",
      "heureFin": "10:30",
      "local": "C-234"
    },
    "mardi": {
      "actif": true,
      "heureDebut": "13:00",
      "heureFin": "15:00",
      "local": "C-234"
    },
    "mercredi": {
      "actif": false
    },
    "jeudi": {
      "actif": false
    },
    "vendredi": {
      "actif": false
    }
  },
  "cartouches_GRILLE1759243306842": {
    "id": "CART_DEMO_2025",
    "grilleId": "GRILLE1759243306842",
    "nom": "Rétroactions Global-5",
    "contexte": "Voici quelques observations sur ton travail.",
    "criteres": [
      {
        "id": "CR1759243306842",
        "nom": "Structure"
      },
      {
        "id": "CR1759243331050",
        "nom": "Rigueur"
      },
      {
        "id": "CR1759243365467",
        "nom": "Plausibilité"
      },
      {
        "id": "CR1759243379949",
        "nom": "Nuance"
      },
      {
        "id": "CR1759243428715",
        "nom": "Français écrit"
      }
    ],
    "niveaux": [
      {
        "code": "I",
        "nom": "Incomplet"
      },
      {
        "code": "D",
        "nom": "En Développement"
      },
      {
        "code": "M",
        "nom": "Maîtrisé"
      },
      {
        "code": "E",
        "nom": "Étendu"
      }
    ],
    "commentaires": {
      "CR1759243306842_I": "La structure manque de clarté. Travaille sur l'organisation logique de tes idées.",
      "CR1759243306842_D": "La structure est en développement. On perçoit une organisation, mais elle pourrait être plus explicite.",
      "CR1759243306842_M": "La structure est claire et efficace. Bonne organisation logique.",
      "CR1759243306842_E": "Excellente structure ! Organisation remarquable et transitions fluides.",
      "CR1759243331050_I": "L'analyse manque de rigueur. Approfondis tes observations et ajoute des preuves textuelles.",
      "CR1759243331050_D": "L'analyse est en développement. Certains éléments sont bien identifiés, d'autres moins.",
      "CR1759243331050_M": "Analyse rigoureuse avec preuves textuelles pertinentes.",
      "CR1759243331050_E": "Rigueur exemplaire ! Observations méthodiques et bien étayées.",
      "CR1759243365467_I": "L'interprétation manque de plausibilité. Assure-toi que tes liens sont logiques.",
      "CR1759243365467_D": "Interprétation en développement. Certains liens sont pertinents, d'autres moins solides.",
      "CR1759243365467_M": "Interprétation plausible et bien construite.",
      "CR1759243365467_E": "Interprétation éclairante ! Liens cohérents et convaincants.",
      "CR1759243379949_I": "L'analyse manque de nuance. Évite les simplifications et explore les subtilités.",
      "CR1759243379949_D": "L'analyse gagne en nuance mais certains aspects restent simplistes.",
      "CR1759243379949_M": "Bonne capacité à percevoir les nuances du texte.",
      "CR1759243379949_E": "Sensibilité remarquable aux nuances ! Analyse fine et subtile.",
      "CR1759243428715_I": "Nombreuses erreurs de français. Consacre plus de temps à la révision.",
      "CR1759243428715_D": "Plusieurs erreurs persistent. Améliore ta méthode de révision.",
      "CR1759243428715_M": "Français de bonne qualité. Quelques erreurs mineures.",
      "CR1759243428715_E": "Français impeccable ! Expression soignée et précise."
    },
    "verrouille": false
  },
  "presences": [],
  "evaluationsSauvegardees": [
    {
      "id": "EVAL_DEMO_1",
      "etudiantDA": "2234567",
      "etudiantNom": "Émilie Tremblay",
      "groupe": "9999",
      "productionId": "A1",
      "productionNom": "Artefact 1",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-01-19T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 83,
      "niveauFinal": "M",
      "retroactionFinale": "Évaluation de A1 pour Émilie Tremblay. Niveau global: M",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_2",
      "etudiantDA": "2234568",
      "etudiantNom": "Antoine Gagnon",
      "groupe": "9999",
      "productionId": "A1",
      "productionNom": "Artefact 1",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-01-19T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 72,
      "niveauFinal": "D",
      "retroactionFinale": "Évaluation de A1 pour Antoine Gagnon. Niveau global: D",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_3",
      "etudiantDA": "2234569",
      "etudiantNom": "Léa Roy",
      "groupe": "9999",
      "productionId": "A1",
      "productionNom": "Artefact 1",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-01-19T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 97,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A1 pour Léa Roy. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_4",
      "etudiantDA": "2234570",
      "etudiantNom": "Thomas Côté",
      "groupe": "9999",
      "productionId": "A1",
      "productionNom": "Artefact 1",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-01-19T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "I",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "I",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "I",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 63,
      "niveauFinal": "I",
      "retroactionFinale": "Évaluation de A1 pour Thomas Côté. Niveau global: I",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_5",
      "etudiantDA": "2234571",
      "etudiantNom": "Camille Bouchard",
      "groupe": "9999",
      "productionId": "A1",
      "productionNom": "Artefact 1",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-01-19T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 79,
      "niveauFinal": "M",
      "retroactionFinale": "Évaluation de A1 pour Camille Bouchard. Niveau global: M",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_6",
      "etudiantDA": "2234572",
      "etudiantNom": "Gabriel Lavoie",
      "groupe": "9999",
      "productionId": "A1",
      "productionNom": "Artefact 1",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-01-19T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 73,
      "niveauFinal": "D",
      "retroactionFinale": "Évaluation de A1 pour Gabriel Lavoie. Niveau global: D",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_7",
      "etudiantDA": "2234573",
      "etudiantNom": "Juliette Bergeron",
      "groupe": "9999",
      "productionId": "A1",
      "productionNom": "Artefact 1",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-01-19T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 87,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A1 pour Juliette Bergeron. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_8",
      "etudiantDA": "2234574",
      "etudiantNom": "Samuel Morin",
      "groupe": "9999",
      "productionId": "A1",
      "productionNom": "Artefact 1",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-01-19T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 80,
      "niveauFinal": "M",
      "retroactionFinale": "Évaluation de A1 pour Samuel Morin. Niveau global: M",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_9",
      "etudiantDA": "2234575",
      "etudiantNom": "Rosalie Pelletier",
      "groupe": "9999",
      "productionId": "A1",
      "productionNom": "Artefact 1",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-01-19T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 78,
      "niveauFinal": "M",
      "retroactionFinale": "Évaluation de A1 pour Rosalie Pelletier. Niveau global: M",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_10",
      "etudiantDA": "2234576",
      "etudiantNom": "Alexandre Gauthier",
      "groupe": "9999",
      "productionId": "A1",
      "productionNom": "Artefact 1",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-01-19T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 74,
      "niveauFinal": "D",
      "retroactionFinale": "Évaluation de A1 pour Alexandre Gauthier. Niveau global: D",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_11",
      "etudiantDA": "2234567",
      "etudiantNom": "Émilie Tremblay",
      "groupe": "9999",
      "productionId": "A2",
      "productionNom": "Artefact 2",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 80,
      "niveauFinal": "M",
      "retroactionFinale": "Évaluation de A2 pour Émilie Tremblay. Niveau global: M",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_12",
      "etudiantDA": "2234568",
      "etudiantNom": "Antoine Gagnon",
      "groupe": "9999",
      "productionId": "A2",
      "productionNom": "Artefact 2",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "I",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "I",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 66,
      "niveauFinal": "D",
      "retroactionFinale": "Évaluation de A2 pour Antoine Gagnon. Niveau global: D",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_13",
      "etudiantDA": "2234569",
      "etudiantNom": "Léa Roy",
      "groupe": "9999",
      "productionId": "A2",
      "productionNom": "Artefact 2",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 96,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A2 pour Léa Roy. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_14",
      "etudiantDA": "2234570",
      "etudiantNom": "Thomas Côté",
      "groupe": "9999",
      "productionId": "A2",
      "productionNom": "Artefact 2",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 72,
      "niveauFinal": "D",
      "retroactionFinale": "Évaluation de A2 pour Thomas Côté. Niveau global: D",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_15",
      "etudiantDA": "2234571",
      "etudiantNom": "Camille Bouchard",
      "groupe": "9999",
      "productionId": "A2",
      "productionNom": "Artefact 2",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 90,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A2 pour Camille Bouchard. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_16",
      "etudiantDA": "2234572",
      "etudiantNom": "Gabriel Lavoie",
      "groupe": "9999",
      "productionId": "A2",
      "productionNom": "Artefact 2",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 84,
      "niveauFinal": "M",
      "retroactionFinale": "Évaluation de A2 pour Gabriel Lavoie. Niveau global: M",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_17",
      "etudiantDA": "2234573",
      "etudiantNom": "Juliette Bergeron",
      "groupe": "9999",
      "productionId": "A2",
      "productionNom": "Artefact 2",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 87,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A2 pour Juliette Bergeron. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_18",
      "etudiantDA": "2234574",
      "etudiantNom": "Samuel Morin",
      "groupe": "9999",
      "productionId": "A2",
      "productionNom": "Artefact 2",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 77,
      "niveauFinal": "M",
      "retroactionFinale": "Évaluation de A2 pour Samuel Morin. Niveau global: M",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_19",
      "etudiantDA": "2234575",
      "etudiantNom": "Rosalie Pelletier",
      "groupe": "9999",
      "productionId": "A2",
      "productionNom": "Artefact 2",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 80,
      "niveauFinal": "M",
      "retroactionFinale": "Évaluation de A2 pour Rosalie Pelletier. Niveau global: M",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_20",
      "etudiantDA": "2234576",
      "etudiantNom": "Alexandre Gauthier",
      "groupe": "9999",
      "productionId": "A2",
      "productionNom": "Artefact 2",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 80,
      "niveauFinal": "M",
      "retroactionFinale": "Évaluation de A2 pour Alexandre Gauthier. Niveau global: M",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_21",
      "etudiantDA": "2234567",
      "etudiantNom": "Émilie Tremblay",
      "groupe": "9999",
      "productionId": "A3",
      "productionNom": "Artefact 3",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-16T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 92,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A3 pour Émilie Tremblay. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_22",
      "etudiantDA": "2234568",
      "etudiantNom": "Antoine Gagnon",
      "groupe": "9999",
      "productionId": "A3",
      "productionNom": "Artefact 3",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-16T05:00:00.000Z",
      "statutRemise": "non-remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "I",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 68,
      "niveauFinal": "D",
      "retroactionFinale": "Évaluation de A3 pour Antoine Gagnon. Niveau global: D",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_23",
      "etudiantDA": "2234569",
      "etudiantNom": "Léa Roy",
      "groupe": "9999",
      "productionId": "A3",
      "productionNom": "Artefact 3",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-16T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 100,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A3 pour Léa Roy. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_24",
      "etudiantDA": "2234570",
      "etudiantNom": "Thomas Côté",
      "groupe": "9999",
      "productionId": "A3",
      "productionNom": "Artefact 3",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-16T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 72,
      "niveauFinal": "D",
      "retroactionFinale": "Évaluation de A3 pour Thomas Côté. Niveau global: D",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_25",
      "etudiantDA": "2234571",
      "etudiantNom": "Camille Bouchard",
      "groupe": "9999",
      "productionId": "A3",
      "productionNom": "Artefact 3",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-16T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 91,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A3 pour Camille Bouchard. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_26",
      "etudiantDA": "2234572",
      "etudiantNom": "Gabriel Lavoie",
      "groupe": "9999",
      "productionId": "A3",
      "productionNom": "Artefact 3",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-16T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 84,
      "niveauFinal": "M",
      "retroactionFinale": "Évaluation de A3 pour Gabriel Lavoie. Niveau global: M",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_27",
      "etudiantDA": "2234573",
      "etudiantNom": "Juliette Bergeron",
      "groupe": "9999",
      "productionId": "A3",
      "productionNom": "Artefact 3",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-16T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 90,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A3 pour Juliette Bergeron. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_28",
      "etudiantDA": "2234574",
      "etudiantNom": "Samuel Morin",
      "groupe": "9999",
      "productionId": "A3",
      "productionNom": "Artefact 3",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-16T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 78,
      "niveauFinal": "M",
      "retroactionFinale": "Évaluation de A3 pour Samuel Morin. Niveau global: M",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_29",
      "etudiantDA": "2234575",
      "etudiantNom": "Rosalie Pelletier",
      "groupe": "9999",
      "productionId": "A3",
      "productionNom": "Artefact 3",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-16T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 88,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A3 pour Rosalie Pelletier. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_30",
      "etudiantDA": "2234576",
      "etudiantNom": "Alexandre Gauthier",
      "groupe": "9999",
      "productionId": "A3",
      "productionNom": "Artefact 3",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-02-16T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 84,
      "niveauFinal": "M",
      "retroactionFinale": "Évaluation de A3 pour Alexandre Gauthier. Niveau global: M",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_31",
      "etudiantDA": "2234567",
      "etudiantNom": "Émilie Tremblay",
      "groupe": "9999",
      "productionId": "A4",
      "productionNom": "Artefact 4",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-03-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 91,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A4 pour Émilie Tremblay. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_32",
      "etudiantDA": "2234568",
      "etudiantNom": "Antoine Gagnon",
      "groupe": "9999",
      "productionId": "A4",
      "productionNom": "Artefact 4",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-03-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "D",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 75,
      "niveauFinal": "D",
      "retroactionFinale": "Évaluation de A4 pour Antoine Gagnon. Niveau global: D",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_33",
      "etudiantDA": "2234569",
      "etudiantNom": "Léa Roy",
      "groupe": "9999",
      "productionId": "A4",
      "productionNom": "Artefact 4",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-03-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 100,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A4 pour Léa Roy. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_34",
      "etudiantDA": "2234570",
      "etudiantNom": "Thomas Côté",
      "groupe": "9999",
      "productionId": "A4",
      "productionNom": "Artefact 4",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-03-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 87,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A4 pour Thomas Côté. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_35",
      "etudiantDA": "2234571",
      "etudiantNom": "Camille Bouchard",
      "groupe": "9999",
      "productionId": "A4",
      "productionNom": "Artefact 4",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-03-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 96,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A4 pour Camille Bouchard. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_36",
      "etudiantDA": "2234572",
      "etudiantNom": "Gabriel Lavoie",
      "groupe": "9999",
      "productionId": "A4",
      "productionNom": "Artefact 4",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-03-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 86,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A4 pour Gabriel Lavoie. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_37",
      "etudiantDA": "2234573",
      "etudiantNom": "Juliette Bergeron",
      "groupe": "9999",
      "productionId": "A4",
      "productionNom": "Artefact 4",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-03-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 97,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A4 pour Juliette Bergeron. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_38",
      "etudiantDA": "2234574",
      "etudiantNom": "Samuel Morin",
      "groupe": "9999",
      "productionId": "A4",
      "productionNom": "Artefact 4",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-03-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 86,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A4 pour Samuel Morin. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_39",
      "etudiantDA": "2234575",
      "etudiantNom": "Rosalie Pelletier",
      "groupe": "9999",
      "productionId": "A4",
      "productionNom": "Artefact 4",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-03-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 96,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A4 pour Rosalie Pelletier. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    },
    {
      "id": "EVAL_DEMO_40",
      "etudiantDA": "2234576",
      "etudiantNom": "Alexandre Gauthier",
      "groupe": "9999",
      "productionId": "A4",
      "productionNom": "Artefact 4",
      "grilleId": "GRILLE1759243306842",
      "grilleNom": "Global-5 FR-HOLIS",
      "echelleId": "ECH1759264511178",
      "cartoucheId": "CART_DEMO_2025",
      "dateEvaluation": "2026-03-02T05:00:00.000Z",
      "statutRemise": "remis",
      "criteres": [
        {
          "critereId": "CR1759243306842",
          "critereNom": "Structure",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 15
        },
        {
          "critereId": "CR1759243331050",
          "critereNom": "Rigueur",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 20
        },
        {
          "critereId": "CR1759243365467",
          "critereNom": "Plausibilité",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 10
        },
        {
          "critereId": "CR1759243379949",
          "critereNom": "Nuance",
          "niveauSelectionne": "E",
          "retroaction": "",
          "ponderation": 25
        },
        {
          "critereId": "CR1759243428715",
          "critereNom": "Français écrit",
          "niveauSelectionne": "M",
          "retroaction": "",
          "ponderation": 30
        }
      ],
      "noteFinale": 85,
      "niveauFinal": "E",
      "retroactionFinale": "Évaluation de A4 pour Alexandre Gauthier. Niveau global: E",
      "optionsAffichage": {
        "description": true,
        "objectif": true,
        "tache": true,
        "adresse": true,
        "contexte": true
      },
      "verrouillee": true,
      "coursId": "601-101-h2026-9999"
    }
  ]
};

// Exporter pour usage global
if (typeof window !== 'undefined') {
    window.PACK_DEMARRAGE = PACK_DEMARRAGE;
}
