/**
 * Pack de démarrage - Données de démonstration
 * Version : 5 étudiants × 4 productions = 20 évaluations
 * Trimestre : A2025 (15 semaines, cours le mardi 8h-12h)
 * Date : 31 décembre 2025
 */

const PACK_DEMARRAGE = {
  // ===== MÉTADONNÉES =====
  "_metadata": {
    "nom": "Pack démo A2025",
    "version": "6.0",
    "date": "2025-12-31",
    "description": "5 étudiants • 5 productions • 20 évaluations • 15 séances (mardi 4h)",
    "auteur": "Système de monitorage"
  },

  // ===== COURS DÉMO =====
  "listeCours": [
    {
      "id": "demo-cours",
      "sigle": "601-101",
      "titre": "Écriture et littérature (Démo)",
      "session": "A",
      "annee": "2025",
      "trimestreId": "demo",
      "groupe": "demo",
      "enseignant": "Primo Primavera",
      "actif": true
    }
  ],

  // ===== CADRE CALENDRIER (vraies dates A2025) =====
  "cadreCalendrier": {
    "session": "A",
    "annee": "2025",
    "dateDebut": "2025-08-21",
    "finCoursReguliers": "2025-12-12",
    "finTrimestre": "2025-12-22",
    "remiseNotes": "2025-12-31",
    "semainePlanificationDebut": "2025-10-13",
    "semainePlanificationFin": "2025-10-17",
    "semaineExamensDebut": "2025-12-15",
    "semaineExamensFin": "2025-12-22",
    "joursFeries": [],
    "evenementsPrevus": [],
    "evenementsImprevus": []
  },

  // ===== HORAIRE HEBDOMADAIRE (mardi 8h-12h) =====
  // Format tableau de séances (attendu par horaire.js)
  "horaireHebdo": [
    { "jour": "mardi", "debut": "08:00", "fin": "12:00", "duree": 4 }
  ],

  // ===== NOTE: calendrierComplet et seancesCompletes sont GÉNÉRÉS par l'app =====
  // L'app utilise cadreCalendrier + horaireHebdo pour les générer automatiquement

  // ===== ÉTUDIANTS (5) =====
  "groupeEtudiants": [
    { "da": "DEMO001", "prenom": "Émilie", "nom": "Tremblay", "groupe": "demo", "courriel": "emilie.tremblay@demo.qc.ca", "programme": "500.AE", "servicesAdaptes": false, "coursId": "demo-cours" },
    { "da": "DEMO002", "prenom": "Antoine", "nom": "Gagnon", "groupe": "demo", "courriel": "antoine.gagnon@demo.qc.ca", "programme": "300.A0", "servicesAdaptes": false, "coursId": "demo-cours" },
    { "da": "DEMO003", "prenom": "Léa", "nom": "Roy", "groupe": "demo", "courriel": "lea.roy@demo.qc.ca", "programme": "200.B1", "servicesAdaptes": true, "coursId": "demo-cours" },
    { "da": "DEMO004", "prenom": "Thomas", "nom": "Côté", "groupe": "demo", "courriel": "thomas.cote@demo.qc.ca", "programme": "500.AE", "servicesAdaptes": false, "coursId": "demo-cours" },
    { "da": "DEMO005", "prenom": "Camille", "nom": "Bouchard", "groupe": "demo", "courriel": "camille.bouchard@demo.qc.ca", "programme": "300.A0", "servicesAdaptes": false, "coursId": "demo-cours" }
  ],

  // ===== PRODUCTIONS (5) =====
  "productions": [
    {
      "id": "PROD_PORTFOLIO", "titre": "Portfolio", "description": "Conteneur des artefacts",
      "type": "portfolio", "dateEcheance": "2025-12-09", "ponderation": 0, "grilleId": null,
      "artefacts": ["PROD_ART1", "PROD_ART2", "PROD_ART3"], "coursId": "demo-cours"
    },
    {
      "id": "PROD_ART1", "titre": "Artefact 1 - Stratégies de lecture", "description": "Stratégies de lecture",
      "objectif": "Développer sa capacité à utiliser efficacement différentes stratégies de lecture et à documenter de manière claire et méthodique son processus d'analyse.",
      "tache": "Appliquer au moins trois stratégies de lecture différentes sur un texte littéraire et laisser des traces visibles et organisées de cette analyse.",
      "type": "artefact-portfolio", "dateEcheance": "2025-09-23", "semaine": 5, "ponderation": 20,
      "grilleId": "GRILLE_DEMO", "portfolioParent": "PROD_PORTFOLIO", "coursId": "demo-cours"
    },
    {
      "id": "PROD_ART2", "titre": "Artefact 2 - Carte mentale", "description": "Carte mentale",
      "objectif": "Développer sa capacité à analyser collaborativement un texte et à représenter les relations entre objectif, mécanismes et procédés.",
      "tache": "En binôme, construire une carte mentale qui organise visuellement l'analyse du texte, en délibérant sur chaque élément pour arriver à une interprétation commune.",
      "type": "artefact-portfolio", "dateEcheance": "2025-10-21", "semaine": 8, "ponderation": 25,
      "grilleId": "GRILLE_DEMO", "portfolioParent": "PROD_PORTFOLIO", "coursId": "demo-cours"
    },
    {
      "id": "PROD_ART3", "titre": "Artefact 3 - Plan de rédaction", "description": "Plan de rédaction",
      "objectif": "Développer ta capacité à structurer une analyse littéraire cohérente en établissant des liens logiques clairs entre tous les éléments.",
      "tache": "Transformer ta carte mentale en plan d'analyse détaillé en organisant logiquement les idées principales, secondaires, les preuves, les mini-conclusions et la transition.",
      "type": "artefact-portfolio", "dateEcheance": "2025-11-18", "semaine": 12, "ponderation": 25,
      "grilleId": "GRILLE_DEMO", "portfolioParent": "PROD_PORTFOLIO", "coursId": "demo-cours"
    },
    {
      "id": "PROD_EXAM", "titre": "Rédaction terminale", "description": "Examen fin de trimestre",
      "type": "examen", "dateEcheance": "2025-12-09", "semaine": 15, "ponderation": 30,
      "grilleId": "GRILLE_DEMO", "coursId": "demo-cours"
    }
  ],

  // ===== ÉVALUATIONS (20) =====
  "evaluationsSauvegardees": [
    // Artefact 1 (sem 5) - 5 étudiants évalués
    { "id": "EVAL_DEMO_A1_001", "etudiantDA": "DEMO001", "productionId": "PROD_ART1", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-09-24", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"M"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"M"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"D"},{"critereId":"CR_NUANCE","niveauSelectionne":"M"}], "niveauFinal": "M", "noteFinale": 78, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_A1_002", "etudiantDA": "DEMO002", "productionId": "PROD_ART1", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-09-24", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"D"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"D"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"D"},{"critereId":"CR_NUANCE","niveauSelectionne":"I"}], "niveauFinal": "D", "noteFinale": 62, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_A1_003", "etudiantDA": "DEMO003", "productionId": "PROD_ART1", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-09-24", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"E"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"M"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"M"},{"critereId":"CR_NUANCE","niveauSelectionne":"M"}], "niveauFinal": "M", "noteFinale": 82, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_A1_004", "etudiantDA": "DEMO004", "productionId": "PROD_ART1", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-09-24", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"I"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"D"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"I"},{"critereId":"CR_NUANCE","niveauSelectionne":"I"}], "niveauFinal": "I", "noteFinale": 45, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_A1_005", "etudiantDA": "DEMO005", "productionId": "PROD_ART1", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-09-24", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"M"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"E"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"M"},{"critereId":"CR_NUANCE","niveauSelectionne":"E"}], "niveauFinal": "E", "noteFinale": 88, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    // Artefact 2 (sem 8) - 5 étudiants évalués
    { "id": "EVAL_DEMO_A2_001", "etudiantDA": "DEMO001", "productionId": "PROD_ART2", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-10-22", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"M"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"M"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"M"},{"critereId":"CR_NUANCE","niveauSelectionne":"D"}], "niveauFinal": "M", "noteFinale": 76, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_A2_002", "etudiantDA": "DEMO002", "productionId": "PROD_ART2", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-10-22", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"D"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"M"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"D"},{"critereId":"CR_NUANCE","niveauSelectionne":"D"}], "niveauFinal": "D", "noteFinale": 68, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_A2_003", "etudiantDA": "DEMO003", "productionId": "PROD_ART2", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-10-22", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"M"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"M"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"E"},{"critereId":"CR_NUANCE","niveauSelectionne":"M"}], "niveauFinal": "M", "noteFinale": 81, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_A2_004", "etudiantDA": "DEMO004", "productionId": "PROD_ART2", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-10-22", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"D"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"I"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"D"},{"critereId":"CR_NUANCE","niveauSelectionne":"I"}], "niveauFinal": "D", "noteFinale": 55, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_A2_005", "etudiantDA": "DEMO005", "productionId": "PROD_ART2", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-10-22", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"E"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"M"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"M"},{"critereId":"CR_NUANCE","niveauSelectionne":"M"}], "niveauFinal": "M", "noteFinale": 84, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    // Artefact 3 (sem 12) - 3 étudiants évalués (2 non remis pour démo)
    { "id": "EVAL_DEMO_A3_001", "etudiantDA": "DEMO001", "productionId": "PROD_ART3", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-11-19", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"E"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"M"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"M"},{"critereId":"CR_NUANCE","niveauSelectionne":"M"}], "niveauFinal": "M", "noteFinale": 80, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_A3_003", "etudiantDA": "DEMO003", "productionId": "PROD_ART3", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-11-19", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"M"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"E"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"M"},{"critereId":"CR_NUANCE","niveauSelectionne":"E"}], "niveauFinal": "E", "noteFinale": 87, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_A3_005", "etudiantDA": "DEMO005", "productionId": "PROD_ART3", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-11-19", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"M"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"M"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"E"},{"critereId":"CR_NUANCE","niveauSelectionne":"M"}], "niveauFinal": "M", "noteFinale": 82, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    // Artefact 3 - Non remis (DEMO002, DEMO004) - pour démo de l'interface
    { "id": "EVAL_DEMO_A3_002", "etudiantDA": "DEMO002", "productionId": "PROD_ART3", "statut": "non-evalue", "statutRemise": "non-remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_A3_004", "etudiantDA": "DEMO004", "productionId": "PROD_ART3", "statut": "non-evalue", "statutRemise": "non-remis", "coursId": "demo-cours" },
    // Examen (sem 15) - 5 étudiants évalués
    { "id": "EVAL_DEMO_EX_001", "etudiantDA": "DEMO001", "productionId": "PROD_EXAM", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-12-10", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"M"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"E"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"M"},{"critereId":"CR_NUANCE","niveauSelectionne":"M"}], "niveauFinal": "M", "noteFinale": 81, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_EX_002", "etudiantDA": "DEMO002", "productionId": "PROD_EXAM", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-12-10", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"M"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"M"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"D"},{"critereId":"CR_NUANCE","niveauSelectionne":"D"}], "niveauFinal": "D", "noteFinale": 72, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_EX_003", "etudiantDA": "DEMO003", "productionId": "PROD_EXAM", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-12-10", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"E"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"E"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"M"},{"critereId":"CR_NUANCE","niveauSelectionne":"M"}], "niveauFinal": "E", "noteFinale": 89, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_EX_004", "etudiantDA": "DEMO004", "productionId": "PROD_EXAM", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-12-10", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"D"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"D"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"D"},{"critereId":"CR_NUANCE","niveauSelectionne":"I"}], "niveauFinal": "D", "noteFinale": 60, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" },
    { "id": "EVAL_DEMO_EX_005", "etudiantDA": "DEMO005", "productionId": "PROD_EXAM", "grilleId": "GRILLE_DEMO", "echelleId": "ECHELLE_IDME", "dateEvaluation": "2025-12-10", "criteres": [{"critereId":"CR_STRUCTURE","niveauSelectionne":"M"},{"critereId":"CR_RIGUEUR","niveauSelectionne":"M"},{"critereId":"CR_PLAUSIBILITE","niveauSelectionne":"M"},{"critereId":"CR_NUANCE","niveauSelectionne":"E"}], "niveauFinal": "M", "noteFinale": 83, "cartoucheId": "CART_DEMO", "statut": "evalue", "statutRemise": "remis", "coursId": "demo-cours" }
  ],

  // ===== ÉCHELLE IDME =====
  "echellesTemplates": [
    {
      "id": "ECHELLE_IDME", "nom": "Échelle IDME", "description": "Échelle 4 niveaux (taxonomie SOLO)",
      "niveaux": [
        { "code": "I", "nom": "Insuffisant", "min": 0, "max": 64, "valeur": 50 },
        { "code": "D", "nom": "Développement", "min": 65, "max": 74, "valeur": 70 },
        { "code": "M", "nom": "Maîtrisé", "min": 75, "max": 84, "valeur": 80 },
        { "code": "E", "nom": "Étendu", "min": 85, "max": 100, "valeur": 92 }
      ],
      "verrouille": false, "dansBibliotheque": true
    }
  ],

  // ===== GRILLE DE CRITÈRES =====
  // ✅ CORRIGÉ (31 déc 2025) : IDs correspondent à la grille existante de l'utilisateur
  "grillesTemplates": [
    {
      "id": "GRILLE_DEMO", "nom": "Grille démo", "description": "Grille 4 critères",
      "echelleId": "ECHELLE_IDME",
      "criteres": [
        { "id": "CR_STRUCTURE", "code": "structure", "nom": "Structure", "ponderation": 20, "description": "Capacité à organiser sa pensée de manière logique et cohérente", "type": "holistique" },
        { "id": "CR_RIGUEUR", "code": "rigueur", "nom": "Rigueur", "ponderation": 30, "description": "Qualité et exhaustivité du travail d'analyse", "type": "holistique" },
        { "id": "CR_PLAUSIBILITE", "code": "plausibilite", "nom": "Plausibilité", "ponderation": 15, "description": "Crédibilité et pertinence des interprétations proposées", "type": "holistique" },
        { "id": "CR_NUANCE", "code": "nuance", "nom": "Nuance", "ponderation": 35, "description": "Capacité à percevoir et exprimer les subtilités", "type": "holistique" }
      ],
      "verrouille": false, "dansBibliotheque": true
    }
  ],

  // ===== CARTOUCHES DE RÉTROACTION =====
  "cartouches_GRILLE_DEMO": [
    {
      "id": "CART_DEMO", "nom": "Cartouche Démo", "grilleId": "GRILLE_DEMO",
      "commentaires": {
        "CR_STRUCTURE_I": "La structure manque de clarté. Organise tes idées avec intro, développement et conclusion.",
        "CR_STRUCTURE_D": "Ta structure est présente mais pourrait être plus solide.",
        "CR_STRUCTURE_M": "Bonne organisation ! Les idées s'enchaînent logiquement.",
        "CR_STRUCTURE_E": "Excellente structure avec transitions fluides.",
        "CR_RIGUEUR_I": "Analyse manque de précision. Appuie-toi sur des éléments concrets.",
        "CR_RIGUEUR_D": "Observations pertinentes mais incomplètes.",
        "CR_RIGUEUR_M": "Analyse rigoureuse avec observations bien documentées.",
        "CR_RIGUEUR_E": "Analyse exemplaire, observations exhaustives.",
        "CR_PLAUSIBILITE_I": "Interprétations peu fondées. Appuie-les sur le texte.",
        "CR_PLAUSIBILITE_D": "Certaines interprétations nécessitent meilleur ancrage.",
        "CR_PLAUSIBILITE_M": "Interprétations généralement bien fondées.",
        "CR_PLAUSIBILITE_E": "Interprétations particulièrement bien fondées.",
        "CR_NUANCE_I": "Analyse en surface. Explore les nuances.",
        "CR_NUANCE_D": "Tu perçois certaines nuances, approfondis.",
        "CR_NUANCE_M": "Bonne perception des nuances et subtilités.",
        "CR_NUANCE_E": "Excellente finesse d'analyse."
      },
      "contexte": "Évaluation de ta capacité à analyser un texte.", "verrouille": false, "dansBibliotheque": true
    }
  ],

  // ===== PRÉSENCES (15 séances × 5 étudiants = 75 entrées) =====
  "presences": [
    // Sem 1 - 26 août
    { "date": "2025-08-26", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-08-26", "da": "DEMO002", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-08-26", "da": "DEMO003", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-08-26", "da": "DEMO004", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-08-26", "da": "DEMO005", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    // Sem 2 - 2 sept
    { "date": "2025-09-02", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-02", "da": "DEMO002", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-02", "da": "DEMO003", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-02", "da": "DEMO004", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    { "date": "2025-09-02", "da": "DEMO005", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    // Sem 3 - 9 sept
    { "date": "2025-09-09", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-09", "da": "DEMO002", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-09", "da": "DEMO003", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-09", "da": "DEMO004", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-09", "da": "DEMO005", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    // Sem 4 - 16 sept
    { "date": "2025-09-16", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-16", "da": "DEMO002", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    { "date": "2025-09-16", "da": "DEMO003", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-16", "da": "DEMO004", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-16", "da": "DEMO005", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    // Sem 5 - 23 sept
    { "date": "2025-09-23", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-23", "da": "DEMO002", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-23", "da": "DEMO003", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-23", "da": "DEMO004", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-23", "da": "DEMO005", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    // Sem 6 - 30 sept
    { "date": "2025-09-30", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-30", "da": "DEMO002", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-30", "da": "DEMO003", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    { "date": "2025-09-30", "da": "DEMO004", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-09-30", "da": "DEMO005", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    // Sem 7 - 7 oct
    { "date": "2025-10-07", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-10-07", "da": "DEMO002", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-10-07", "da": "DEMO003", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-10-07", "da": "DEMO004", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    { "date": "2025-10-07", "da": "DEMO005", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    // Sem 8 - 21 oct (après semaine planif)
    { "date": "2025-10-21", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-10-21", "da": "DEMO002", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-10-21", "da": "DEMO003", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-10-21", "da": "DEMO004", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-10-21", "da": "DEMO005", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    // Sem 9 - 28 oct
    { "date": "2025-10-28", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-10-28", "da": "DEMO002", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-10-28", "da": "DEMO003", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-10-28", "da": "DEMO004", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-10-28", "da": "DEMO005", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    // Sem 10 - 4 nov
    { "date": "2025-11-04", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-11-04", "da": "DEMO002", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    { "date": "2025-11-04", "da": "DEMO003", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-11-04", "da": "DEMO004", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-11-04", "da": "DEMO005", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    // Sem 11 - 11 nov
    { "date": "2025-11-11", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-11-11", "da": "DEMO002", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-11-11", "da": "DEMO003", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-11-11", "da": "DEMO004", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-11-11", "da": "DEMO005", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    // Sem 12 - 18 nov
    { "date": "2025-11-18", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-11-18", "da": "DEMO002", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-11-18", "da": "DEMO003", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    { "date": "2025-11-18", "da": "DEMO004", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-11-18", "da": "DEMO005", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    // Sem 13 - 25 nov
    { "date": "2025-11-25", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-11-25", "da": "DEMO002", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-11-25", "da": "DEMO003", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-11-25", "da": "DEMO004", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    { "date": "2025-11-25", "da": "DEMO005", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    // Sem 14 - 2 déc
    { "date": "2025-12-02", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-12-02", "da": "DEMO002", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-12-02", "da": "DEMO003", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-12-02", "da": "DEMO004", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-12-02", "da": "DEMO005", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    // Sem 15 - 9 déc
    { "date": "2025-12-09", "da": "DEMO001", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-12-09", "da": "DEMO002", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-12-09", "da": "DEMO003", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-12-09", "da": "DEMO004", "statut": "present", "heures": 4, "coursId": "demo-cours" },
    { "date": "2025-12-09", "da": "DEMO005", "statut": "present", "heures": 4, "coursId": "demo-cours" }
  ],

  // ===== CONFIGURATION =====
  "modalitesEvaluation": {
    "pratique": "pan-maitrise",
    "grilleReferenceDepistage": "GRILLE_DEMO",
    "nombreArtefacts": 3,
    "fenetrePatterns": 3,
    "seuilsInterpretation": { "fragile": 70, "acceptable": 80, "bon": 85 },
    "affichageTableauBord": { "afficherSommatif": false, "afficherAlternatif": true, "activerRai": true, "modeComparatif": false }
  }
};

window.PACK_DEMARRAGE = PACK_DEMARRAGE;
