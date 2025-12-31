/**
 * Pack de démarrage - Données de démonstration SIMPLIFIÉES
 * Version : 5 étudiants × 4 productions évaluables = 20 évaluations
 * Date : 31 décembre 2025
 *
 * Contenu :
 * - 5 étudiants fictifs (groupe demo)
 * - 1 Portfolio + 3 Artefacts + 1 Rédaction terminale (examen)
 * - 20 évaluations complètes
 * - 1 grille de critères
 * - 1 échelle IDME
 * - 1 cartouche de rétroaction
 * - 8 semaines de présences
 */

const PACK_DEMARRAGE = {
  // ===== MÉTADONNÉES =====
  "_metadata": {
    "nom": "Pack démo simplifié",
    "version": "5.2",
    "date": "2025-12-31",
    "description": "5 étudiants • 5 productions • 20 évaluations",
    "auteur": "Système de monitorage"
  },

  // ===== COURS DÉMO =====
  "listeCours": [
    {
      "id": "demo-cours",
      "sigle": "601-101",
      "titre": "Écriture et littérature (Démo)",
      "session": "Demo",
      "annee": "----",
      "trimestreId": "demo",
      "groupe": "demo",
      "enseignant": "Primo Primavera",
      "actif": true
    }
  ],

  // ===== ÉTUDIANTS (5) =====
  "groupeEtudiants": [
    {
      "da": "DEMO001",
      "prenom": "Émilie",
      "nom": "Tremblay",
      "groupe": "demo",
      "courriel": "emilie.tremblay@demo.qc.ca",
      "programme": "500.AE",
      "servicesAdaptes": false,
      "coursId": "demo-cours"
    },
    {
      "da": "DEMO002",
      "prenom": "Antoine",
      "nom": "Gagnon",
      "groupe": "demo",
      "courriel": "antoine.gagnon@demo.qc.ca",
      "programme": "300.A0",
      "servicesAdaptes": false,
      "coursId": "demo-cours"
    },
    {
      "da": "DEMO003",
      "prenom": "Léa",
      "nom": "Roy",
      "groupe": "demo",
      "courriel": "lea.roy@demo.qc.ca",
      "programme": "200.B1",
      "servicesAdaptes": true,
      "coursId": "demo-cours"
    },
    {
      "da": "DEMO004",
      "prenom": "Thomas",
      "nom": "Côté",
      "groupe": "demo",
      "courriel": "thomas.cote@demo.qc.ca",
      "programme": "500.AE",
      "servicesAdaptes": false,
      "coursId": "demo-cours"
    },
    {
      "da": "DEMO005",
      "prenom": "Camille",
      "nom": "Bouchard",
      "groupe": "demo",
      "courriel": "camille.bouchard@demo.qc.ca",
      "programme": "300.A0",
      "servicesAdaptes": false,
      "coursId": "demo-cours"
    }
  ],

  // ===== PRODUCTIONS (5) =====
  "productions": [
    {
      "id": "PROD_PORTFOLIO",
      "titre": "Portfolio",
      "description": "Conteneur des artefacts du trimestre",
      "type": "portfolio",
      "ponderation": 0,
      "grilleId": "",
      "dateEcheance": "",
      "coursId": "demo-cours"
    },
    {
      "id": "PROD_ART1",
      "code": "A1",
      "titre": "Artefact 1",
      "description": "Stratégies de lecture",
      "type": "artefact-portfolio",
      "ponderation": 10,
      "grilleId": "GRILLE_DEMO",
      "dateEcheance": "2025-09-15",
      "parentId": "PROD_PORTFOLIO",
      "coursId": "demo-cours"
    },
    {
      "id": "PROD_ART2",
      "code": "A2",
      "titre": "Artefact 2",
      "description": "Description d'un personnage",
      "type": "artefact-portfolio",
      "ponderation": 10,
      "grilleId": "GRILLE_DEMO",
      "dateEcheance": "2025-10-01",
      "parentId": "PROD_PORTFOLIO",
      "coursId": "demo-cours"
    },
    {
      "id": "PROD_ART3",
      "code": "A3",
      "titre": "Artefact 3",
      "description": "Carte mentale",
      "type": "artefact-portfolio",
      "ponderation": 10,
      "grilleId": "GRILLE_DEMO",
      "dateEcheance": "2025-10-15",
      "parentId": "PROD_PORTFOLIO",
      "coursId": "demo-cours"
    },
    {
      "id": "PROD_REDAC",
      "code": "RT",
      "titre": "Rédaction terminale",
      "description": "Évaluation sommative de fin de trimestre",
      "type": "examen",
      "ponderation": 30,
      "grilleId": "GRILLE_DEMO",
      "dateEcheance": "2025-11-15",
      "coursId": "demo-cours"
    }
  ],

  // ===== ÉVALUATIONS (20 = 5 étudiants × 4 productions évaluables) =====
  "evaluationsSauvegardees": [
    // ----- Artefact 1 : Stratégies de lecture (5 évaluations) -----
    {
      "id": "EVAL_A1_01", "etudiantDA": "DEMO001", "etudiantNom": "Émilie Tremblay", "groupe": "demo",
      "productionId": "PROD_ART1", "productionNom": "Artefact 1",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-09-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "M", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "M", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "E", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "M", "ponderation": 35 }
      ],
      "noteFinale": 82.5, "niveauFinal": "M",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_A1_02", "etudiantDA": "DEMO002", "etudiantNom": "Antoine Gagnon", "groupe": "demo",
      "productionId": "PROD_ART1", "productionNom": "Artefact 1",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-09-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "D", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "D", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "M", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "D", "ponderation": 35 }
      ],
      "noteFinale": 67.5, "niveauFinal": "D",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_A1_03", "etudiantDA": "DEMO003", "etudiantNom": "Léa Roy", "groupe": "demo",
      "productionId": "PROD_ART1", "productionNom": "Artefact 1",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-09-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "E", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "E", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "E", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "M", "ponderation": 35 }
      ],
      "noteFinale": 91.25, "niveauFinal": "E",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_A1_04", "etudiantDA": "DEMO004", "etudiantNom": "Thomas Côté", "groupe": "demo",
      "productionId": "PROD_ART1", "productionNom": "Artefact 1",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-09-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "M", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "D", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "M", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "M", "ponderation": 35 }
      ],
      "noteFinale": 75.0, "niveauFinal": "M",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_A1_05", "etudiantDA": "DEMO005", "etudiantNom": "Camille Bouchard", "groupe": "demo",
      "productionId": "PROD_ART1", "productionNom": "Artefact 1",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-09-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "I", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "D", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "D", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "I", "ponderation": 35 }
      ],
      "noteFinale": 52.5, "niveauFinal": "I",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },

    // ----- Artefact 2 : Description d'un personnage (5 évaluations) -----
    {
      "id": "EVAL_A2_01", "etudiantDA": "DEMO001", "etudiantNom": "Émilie Tremblay", "groupe": "demo",
      "productionId": "PROD_ART2", "productionNom": "Artefact 2",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-10-02", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "E", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "M", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "E", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "E", "ponderation": 35 }
      ],
      "noteFinale": 91.25, "niveauFinal": "E",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_A2_02", "etudiantDA": "DEMO002", "etudiantNom": "Antoine Gagnon", "groupe": "demo",
      "productionId": "PROD_ART2", "productionNom": "Artefact 2",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-10-02", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "M", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "M", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "M", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "D", "ponderation": 35 }
      ],
      "noteFinale": 75.0, "niveauFinal": "M",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_A2_03", "etudiantDA": "DEMO003", "etudiantNom": "Léa Roy", "groupe": "demo",
      "productionId": "PROD_ART2", "productionNom": "Artefact 2",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-10-02", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "E", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "E", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "M", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "E", "ponderation": 35 }
      ],
      "noteFinale": 91.25, "niveauFinal": "E",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_A2_04", "etudiantDA": "DEMO004", "etudiantNom": "Thomas Côté", "groupe": "demo",
      "productionId": "PROD_ART2", "productionNom": "Artefact 2",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-10-02", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "M", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "M", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "M", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "M", "ponderation": 35 }
      ],
      "noteFinale": 80.0, "niveauFinal": "M",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_A2_05", "etudiantDA": "DEMO005", "etudiantNom": "Camille Bouchard", "groupe": "demo",
      "productionId": "PROD_ART2", "productionNom": "Artefact 2",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-10-02", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "D", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "D", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "M", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "D", "ponderation": 35 }
      ],
      "noteFinale": 67.5, "niveauFinal": "D",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },

    // ----- Artefact 3 : Carte mentale (5 évaluations) -----
    {
      "id": "EVAL_A3_01", "etudiantDA": "DEMO001", "etudiantNom": "Émilie Tremblay", "groupe": "demo",
      "productionId": "PROD_ART3", "productionNom": "Artefact 3",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-10-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "E", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "E", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "M", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "E", "ponderation": 35 }
      ],
      "noteFinale": 91.25, "niveauFinal": "E",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_A3_02", "etudiantDA": "DEMO002", "etudiantNom": "Antoine Gagnon", "groupe": "demo",
      "productionId": "PROD_ART3", "productionNom": "Artefact 3",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-10-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "M", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "M", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "E", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "M", "ponderation": 35 }
      ],
      "noteFinale": 82.5, "niveauFinal": "M",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_A3_03", "etudiantDA": "DEMO003", "etudiantNom": "Léa Roy", "groupe": "demo",
      "productionId": "PROD_ART3", "productionNom": "Artefact 3",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-10-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "M", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "E", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "E", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "E", "ponderation": 35 }
      ],
      "noteFinale": 91.25, "niveauFinal": "E",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_A3_04", "etudiantDA": "DEMO004", "etudiantNom": "Thomas Côté", "groupe": "demo",
      "productionId": "PROD_ART3", "productionNom": "Artefact 3",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-10-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "E", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "M", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "M", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "E", "ponderation": 35 }
      ],
      "noteFinale": 88.75, "niveauFinal": "E",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_A3_05", "etudiantDA": "DEMO005", "etudiantNom": "Camille Bouchard", "groupe": "demo",
      "productionId": "PROD_ART3", "productionNom": "Artefact 3",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-10-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "M", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "M", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "D", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "M", "ponderation": 35 }
      ],
      "noteFinale": 78.75, "niveauFinal": "M",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },

    // ----- Rédaction terminale : Examen de fin de trimestre (5 évaluations) -----
    {
      "id": "EVAL_RT_01", "etudiantDA": "DEMO001", "etudiantNom": "Émilie Tremblay", "groupe": "demo",
      "productionId": "PROD_REDAC", "productionNom": "Rédaction terminale",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-11-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "E", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "E", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "E", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "E", "ponderation": 35 }
      ],
      "noteFinale": 100.0, "niveauFinal": "E",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_RT_02", "etudiantDA": "DEMO002", "etudiantNom": "Antoine Gagnon", "groupe": "demo",
      "productionId": "PROD_REDAC", "productionNom": "Rédaction terminale",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-11-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "E", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "M", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "E", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "M", "ponderation": 35 }
      ],
      "noteFinale": 86.25, "niveauFinal": "E",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_RT_03", "etudiantDA": "DEMO003", "etudiantNom": "Léa Roy", "groupe": "demo",
      "productionId": "PROD_REDAC", "productionNom": "Rédaction terminale",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-11-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "E", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "E", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "E", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "M", "ponderation": 35 }
      ],
      "noteFinale": 93.75, "niveauFinal": "E",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_RT_04", "etudiantDA": "DEMO004", "etudiantNom": "Thomas Côté", "groupe": "demo",
      "productionId": "PROD_REDAC", "productionNom": "Rédaction terminale",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-11-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "E", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "E", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "M", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "E", "ponderation": 35 }
      ],
      "noteFinale": 93.75, "niveauFinal": "E",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    },
    {
      "id": "EVAL_RT_05", "etudiantDA": "DEMO005", "etudiantNom": "Camille Bouchard", "groupe": "demo",
      "productionId": "PROD_REDAC", "productionNom": "Rédaction terminale",
      "grilleId": "GRILLE_DEMO", "grilleNom": "Grille démo", "echelleId": "ECHELLE_DEMO", "cartoucheId": "CART_DEMO",
      "dateEvaluation": "2025-11-16", "statutRemise": "remis",
      "criteres": [
        { "critereId": "CR_STRUCTURE", "critereNom": "Structure", "niveauSelectionne": "M", "ponderation": 20 },
        { "critereId": "CR_RIGUEUR", "critereNom": "Rigueur", "niveauSelectionne": "E", "ponderation": 30 },
        { "critereId": "CR_PLAUSIBILITE", "critereNom": "Plausibilité", "niveauSelectionne": "M", "ponderation": 15 },
        { "critereId": "CR_NUANCE", "critereNom": "Nuance", "niveauSelectionne": "M", "ponderation": 35 }
      ],
      "noteFinale": 85.0, "niveauFinal": "M",
      "retroactionFinale": "",
      "coursId": "demo-cours"
    }
  ],

  // ===== GRILLE DE CRITÈRES =====
  "grillesTemplates": [
    {
      "id": "GRILLE_DEMO",
      "nom": "Grille démo",
      "criteres": [
        { "id": "CR_STRUCTURE", "nom": "Structure", "description": "Capacité à organiser sa pensée de manière logique et cohérente", "ponderation": 20, "type": "holistique" },
        { "id": "CR_RIGUEUR", "nom": "Rigueur", "description": "Qualité et exhaustivité du travail d'analyse", "ponderation": 30, "type": "holistique" },
        { "id": "CR_PLAUSIBILITE", "nom": "Plausibilité", "description": "Crédibilité et pertinence des interprétations proposées", "ponderation": 15, "type": "holistique" },
        { "id": "CR_NUANCE", "nom": "Nuance", "description": "Capacité à percevoir et exprimer les subtilités", "ponderation": 35, "type": "holistique" }
      ],
      "dateCreation": "2025-01-01",
      "dansBibliotheque": true
    }
  ],

  // ===== ÉCHELLE DE PERFORMANCE =====
  "echellesTemplates": [
    {
      "id": "ECHELLE_DEMO",
      "nom": "IDME (4 niveaux)",
      "description": "Échelle basée sur la taxonomie SOLO",
      "niveaux": [
        { "code": "I", "nom": "Insuffisant", "min": 0, "max": 64, "valeurCalcul": 50 },
        { "code": "D", "nom": "En Développement", "min": 65, "max": 74, "valeurCalcul": 70 },
        { "code": "M", "nom": "Maîtrisé", "min": 75, "max": 84, "valeurCalcul": 80 },
        { "code": "E", "nom": "Étendu", "min": 85, "max": 100, "valeurCalcul": 100 }
      ],
      "dateCreation": "2025-01-01",
      "dansBibliotheque": true
    }
  ],

  // ===== CARTOUCHE DE RÉTROACTION =====
  "cartouches_GRILLE_DEMO": [
    {
      "id": "CART_DEMO",
      "grilleId": "GRILLE_DEMO",
      "nom": "Cartouche générique",
      "criteres": [
        { "id": "CR_STRUCTURE", "nom": "Structure" },
        { "id": "CR_RIGUEUR", "nom": "Rigueur" },
        { "id": "CR_PLAUSIBILITE", "nom": "Plausibilité" },
        { "id": "CR_NUANCE", "nom": "Nuance" }
      ],
      "niveaux": [
        { "code": "I", "nom": "Insuffisant" },
        { "code": "D", "nom": "En Développement" },
        { "code": "M", "nom": "Maîtrisé" },
        { "code": "E", "nom": "Étendu" }
      ],
      "commentaires": {
        "CR_STRUCTURE_I": "L'organisation de ton travail présente des difficultés. Les idées sont présentées de manière désordonnée. Pour t'améliorer, structure ton texte en paragraphes distincts avec des transitions claires.",
        "CR_STRUCTURE_D": "Ton travail montre une organisation de base. Les idées commencent à se regrouper, mais les liens entre elles restent parfois flous. Continue à travailler sur les transitions.",
        "CR_STRUCTURE_M": "Bonne organisation ! Ton travail présente une structure claire et logique. Les idées s'enchaînent bien et les transitions sont efficaces.",
        "CR_STRUCTURE_E": "Excellente structure ! Ton organisation est exemplaire : introduction engageante, développement logique et conclusion pertinente. Les transitions sont fluides et naturelles.",
        "CR_RIGUEUR_I": "Ton analyse manque de profondeur et d'exhaustivité. Plusieurs éléments importants sont absents ou traités superficiellement. Prends le temps d'approfondir chaque aspect.",
        "CR_RIGUEUR_D": "Tu as identifié plusieurs éléments pertinents, mais l'analyse reste parfois incomplète. Continue à développer tes observations avec plus de détails.",
        "CR_RIGUEUR_M": "Bon niveau de rigueur ! Ton analyse est complète et bien détaillée. Tu as couvert les aspects essentiels avec précision.",
        "CR_RIGUEUR_E": "Rigueur exemplaire ! Ton analyse est exhaustive, précise et approfondie. Tu démontres une maîtrise remarquable de la méthode analytique.",
        "CR_PLAUSIBILITE_I": "Tes interprétations manquent de fondement. Les affirmations ne sont pas suffisamment appuyées par des preuves du texte. Cite davantage le texte.",
        "CR_PLAUSIBILITE_D": "Tu commences à appuyer tes interprétations avec des éléments du texte. Continue à renforcer ce lien entre tes affirmations et les preuves textuelles.",
        "CR_PLAUSIBILITE_M": "Bonne plausibilité ! Tes interprétations sont bien fondées et soutenues par des preuves pertinentes du texte.",
        "CR_PLAUSIBILITE_E": "Excellent travail ! Tes interprétations sont particulièrement bien fondées, avec des preuves textuelles judicieusement choisies et intégrées.",
        "CR_NUANCE_I": "Ton analyse reste en surface, sans percevoir les subtilités du texte. Essaie d'aller au-delà de la première impression et d'explorer les nuances.",
        "CR_NUANCE_D": "Tu commences à percevoir certaines nuances, mais ton analyse pourrait être plus approfondie. Explore davantage les complexités et les ambiguïtés.",
        "CR_NUANCE_M": "Bonne perception des nuances ! Tu identifies les subtilités du texte et proposes des interprétations qui vont au-delà de la surface.",
        "CR_NUANCE_E": "Excellente finesse d'analyse ! Tu perçois avec acuité les nuances, les contradictions et les multiples niveaux de sens."
      },
      "contexte": "Cette évaluation porte sur ta capacité à analyser un texte de manière structurée, rigoureuse et nuancée.",
      "verrouille": false,
      "dansBibliotheque": true
    }
  ],

  // ===== PRÉSENCES (8 semaines × 5 étudiants = 40 entrées) =====
  "presences": [
    // Semaine 1
    { "date": "2025-09-03", "da": "DEMO001", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-03", "da": "DEMO002", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-03", "da": "DEMO003", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-03", "da": "DEMO004", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-03", "da": "DEMO005", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    // Semaine 2
    { "date": "2025-09-10", "da": "DEMO001", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-10", "da": "DEMO002", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-10", "da": "DEMO003", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-10", "da": "DEMO004", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    { "date": "2025-09-10", "da": "DEMO005", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    // Semaine 3
    { "date": "2025-09-17", "da": "DEMO001", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-17", "da": "DEMO002", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-17", "da": "DEMO003", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-17", "da": "DEMO004", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-17", "da": "DEMO005", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    // Semaine 4
    { "date": "2025-09-24", "da": "DEMO001", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-24", "da": "DEMO002", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    { "date": "2025-09-24", "da": "DEMO003", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-24", "da": "DEMO004", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-09-24", "da": "DEMO005", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    // Semaine 5
    { "date": "2025-10-01", "da": "DEMO001", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-01", "da": "DEMO002", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-01", "da": "DEMO003", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-01", "da": "DEMO004", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-01", "da": "DEMO005", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    // Semaine 6
    { "date": "2025-10-08", "da": "DEMO001", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-08", "da": "DEMO002", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-08", "da": "DEMO003", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    { "date": "2025-10-08", "da": "DEMO004", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-08", "da": "DEMO005", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    // Semaine 7
    { "date": "2025-10-15", "da": "DEMO001", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-15", "da": "DEMO002", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-15", "da": "DEMO003", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-15", "da": "DEMO004", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-15", "da": "DEMO005", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    // Semaine 8
    { "date": "2025-10-22", "da": "DEMO001", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-22", "da": "DEMO002", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-22", "da": "DEMO003", "statut": "present", "heures": 2, "coursId": "demo-cours" },
    { "date": "2025-10-22", "da": "DEMO004", "statut": "absent", "heures": 0, "coursId": "demo-cours" },
    { "date": "2025-10-22", "da": "DEMO005", "statut": "absent", "heures": 0, "coursId": "demo-cours" }
  ],

  // ===== CONFIGURATION PRATIQUE DE NOTATION =====
  "modalitesEvaluation": {
    "pratique": "pan-maitrise",
    "grilleReferenceDepistage": "GRILLE_DEMO",
    "nombreArtefacts": 3,
    "fenetrePatterns": 3,
    "seuilsInterpretation": {
      "fragile": 70,
      "acceptable": 80,
      "bon": 85
    },
    "affichageTableauBord": {
      "afficherSommatif": false,
      "afficherAlternatif": true,
      "activerRai": true,
      "modeComparatif": false
    }
  }
};

// Exporter vers window
window.PACK_DEMARRAGE = PACK_DEMARRAGE;
