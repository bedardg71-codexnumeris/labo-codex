Voici la documentation complète du fichier NOMS_STABLES.json :

  ---
  # Documentation technique - NOMS_STABLES.json

  **Date de création** : Octobre 2025
  **Dernière mise à jour** : 10 octobre 2025
  **Version** : 50 10-10-2025a
  **Lignes de code** : 217 lignes
  **Format** : JSON

  ---

  ## 1. Vue d'ensemble

  Le fichier `NOMS_STABLES.json` est le **registre central des identifiants 
  protégés** de l'application. Il documente tous les noms critiques qui ne doivent
   **JAMAIS être modifiés** sans évaluation d'impact complète :
  - IDs HTML
  - Classes CSS
  - Attributs data-*
  - Fonctions JavaScript publiques
  - Variables globales
  - Clés localStorage
  - Types de données

  **Rôle critique** : Ce fichier sert de **contrat d'interface** entre les 
  modules. Toute modification d'un nom listé ici peut casser l'application.

  **Philosophie** : "Single Source of Truth" pour les conventions de nommage. 
  Avant de modifier un nom, **TOUJOURS** vérifier s'il apparaît dans ce fichier.

  **Référencé dans** :
  - CLAUDE.md (ligne : "noms_stables.json : Registre des noms protégés")
  - Tous les modules JavaScript (implicitement via les noms utilisés)

  ---

  ## 2. Structure du fichier

  ### 2.1 Métadonnées (lignes 2-3)

  ```json
  {
    "version": "50 10-10-2025a",
    "date_mise_a_jour": "2025-10-10"
  }

  Champs :
  - version : Index de version aligné avec l'architecture modulaire
  - date_mise_a_jour : Dernière modification du registre

  Usage : Permet de vérifier si le registre est à jour avec le code

  ---
  3. Catégories de noms protégés

  3.1 IDs HTML (ids_html)

  Navigation (3 éléments)

  "navigation": [
    "navigation-principale",     // Conteneur navigation principale
    "sous-navigation",           // Conteneur sous-navigation
    "contenu-principal"          // Zone de contenu
  ]

  Utilisé par :
  - navigation.js : Manipulation des boutons et sections
  - main.js : Initialisation de la navigation
  - index.html : Structure de base

  ⚠️ IMPACT SI MODIFIÉ : Cassure totale de la navigation

  ---
  Sections (5 éléments)

  "sections": [
    "section-tableau-bord",      // Section Tableau de bord
    "section-etudiants",         // Section Étudiants
    "section-presences",         // Section Présences
    "section-evaluations",       // Section Évaluations
    "section-reglages"           // Section Réglages
  ]

  Format : section-{nom-section}

  Utilisé par :
  - navigation.js : afficherSection(nomSection) construit l'ID avec template
  section-${nomSection}
  - config.js : Configuration des onglets

  ⚠️ IMPACT SI MODIFIÉ : Section introuvable, affichage vide

  ---
  Sous-sections (19 éléments)

  "sous_sections": [
    "tableau-bord-apercu-groupe",     // Tableau de bord › Aperçu
    "tableau-bord-liste-groupe",      // Tableau de bord › Liste
    "tableau-bord-detail-individuel", // Tableau de bord › Profil
    "tableau-bord-tendances-patterns",// Tableau de bord › Tendances

    "etudiants-apercu",               // Étudiants › Aperçu
    "etudiants-liste",                // Étudiants › Liste
    "etudiants-profil",               // Étudiants › Profil

    "presences-apercu",               // Présences › Aperçu
    "presences-saisie",               // Présences › Saisie
    "presences-calendrier",           // Présences › Calendrier

    "evaluations-apercu",             // Évaluations › Aperçu
    "evaluations-individuelles",      // Évaluations › Individuelles

    "reglages-apercu",                // Réglages › Aperçu
    "reglages-cours",                 // Réglages › Cours
    "reglages-calendrier",            // Réglages › Calendrier (trimestre)
    "reglages-horaire",               // Réglages › Horaire
    "reglages-groupe",                // Réglages › Groupe
    "reglages-pratique-notation",     // Réglages › Pratiques PAN
    "reglages-productions",           // Réglages › Productions
    "reglages-grille-criteres",       // Réglages › Grilles de critères
    "reglages-echelle-performance",   // Réglages › Échelles de performance
    "reglages-retroactions"           // Réglages › Cartouches de rétroaction
  ]

  Format : {section}-{sous-section}

  Utilisé par :
  - navigation.js : afficherSousSection(idSousSection)
  - config.js : configurationsOnglets définit les sous-sections par section

  ⚠️ IMPACT SI MODIFIÉ : Sous-section introuvable, contenu non affiché

  ---
  Éléments spécifiques (21 éléments)

  "elements_specifiques": [
    "horodatage-sauvegarde",          // Horodatage dernière sauvegarde
    "select-etudiant",                // Select pour choisir un étudiant
    "detail-etudiant-contenu",        // Conteneur détail étudiant

    "tbody-liste-complete",           // Body tableau liste complète
    "tbody-etudiants",                // Body tableau étudiants
    "tbody-presences-apercu",         // Body tableau présences aperçu
    "tbody-saisie-presences",         // Body tableau saisie présences
    "tbody-evaluations-apercu",       // Body tableau évaluations aperçu
    "tbody-liste-evaluations",        // Body tableau liste évaluations

    "contenuProfilEtudiant",          // Conteneur profil étudiant complet
    "portfolioEleveDetail",           // Conteneur portfolio détaillé

    "nombreEvaluations",              // Input nombre évaluations
    "typesEvaluations",               // Select types évaluations
    "champsPortfolio",                // Champs spécifiques portfolio
    "portfolioNombreRetenir",         // Input nombre artefacts à retenir
    "portfolioMinimumCompleter",      // Input minimum à compléter

    "typeEchelle",                    // Select type échelle
    "divPonderation",                 // Div affichage pondération
    "divGrille",                      // Div affichage grille
    "msgPonderationArtefact"          // Message pondération artefact
  ]

  Utilisé par :
  - profil-etudiant.js : contenuProfilEtudiant, portfolioEleveDetail
  - portfolio.js : portfolioEleveDetail
  - saisie-presences.js : tbody-saisie-presences
  - liste-evaluations.js : tbody-liste-evaluations
  - productions.js : nombreEvaluations, typesEvaluations, champsPortfolio
  - echelles.js : typeEchelle, divPonderation, divGrille

  ⚠️ IMPACT SI MODIFIÉ : Fonctionnalité spécifique cassée, erreur "element not
  found"

  ---
  Éléments statistiques (12 éléments)

  "elements_statistiques": [
    "stat-version",                   // Version de l'application
    "stat-derniere-maj",              // Date dernière mise à jour
    "stat-poids",                     // Poids localStorage

    "stat-nb-etudiants",              // Nombre d'étudiants
    "stat-nb-groupes",                // Nombre de groupes
    "stat-nb-eleves",                 // Nombre d'élèves (alias)

    "stat-trimestre",                 // État trimestre
    "stat-horaire",                   // État horaire
    "stat-pratique",                  // État pratique notation
    "stat-productions",               // Nombre de productions
    "stat-grilles",                   // Nombre de grilles
    "stat-echelles",                  // Nombre d'échelles
    "stat-cartouches"                 // Nombre de cartouches
  ]

  Utilisé par :
  - tableau-bord-apercu.js : Affichage des statistiques
  - statistiques.js : Calcul et mise à jour

  ⚠️ IMPACT SI MODIFIÉ : Statistiques non affichées

  ---
  3.2 Classes CSS (classes_css)

  Structure (7 classes)

  "structure": [
    "conteneur",        // Conteneur principal de l'application
    "entete",           // En-tête avec titre et logo
    "contenu",          // Zone de contenu principale
    "section",          // Sections principales (masquées par défaut)
    "sous-section",     // Sous-sections (masquées par défaut)
    "active",           // Classe pour afficher une section/sous-section
    "actif"             // Classe pour bouton actif dans navigation
  ]

  Utilisé par :
  - navigation.js : Manipulation des classes active et actif
  - styles.css : Définition des styles

  ⚠️ IMPACT SI MODIFIÉ : Navigation cassée, affichage incorrect

  ---
  Composants (8 classes)

  "composants": [
    "carte",                    // Carte générique
    "carte-statistique",        // Carte statistique (grande)
    "tableau",                  // Tableau standard
    "grille-statistiques",      // Grille de statistiques
    "badge-risque",             // Badge de niveau de risque
    "statut-sauvegarde",        // Statut de sauvegarde
    "horodatage",               // Horodatage
    "text-muted"                // Texte grisé
  ]

  Utilisé par :
  - Tous les modules d'affichage
  - styles.css : Définition des styles

  ⚠️ IMPACT SI MODIFIÉ : Styles cassés, affichage incorrect

  ---
  Navigation (3 classes)

  "navigation": [
    "navigation-principale",    // Navigation principale (sections)
    "sous-navigation",          // Sous-navigation (sous-sections)
    "vide"                      // État vide (pas de sous-sections)
  ]

  Utilisé par :
  - navigation.js : Génération de la sous-navigation
  - styles.css : Styles de navigation

  ---
  Risques (6 classes)

  "risques": [
    "risque-minimal",           // Vert (>= 85%)
    "risque-faible",            // Vert clair
    "risque-modere",            // Jaune (>= 70%)
    "risque-eleve",             // Orange
    "risque-tres-eleve",        // Rouge (< 70%)
    "risque-critique"           // Rouge foncé
  ]

  Utilisé par :
  - profil-etudiant.js : Badges de risque
  - tableau-bord-apercu.js : Affichage des indices
  - styles.css : Couleurs de risque

  ---
  Boutons (8 classes)

  "boutons": [
    "btn",                      // Classe de base bouton
    "btn-principal",            // Bouton principal (bleu)
    "btn-ajouter",              // Bouton ajouter (vert)
    "btn-modifier",             // Bouton modifier (violet)
    "btn-confirmer",            // Bouton confirmer (vert)
    "btn-annuler",              // Bouton annuler (brun)
    "btn-supprimer",            // Bouton supprimer (rouge)
    "btn-groupe"                // Groupe de boutons
  ]

  Utilisé par :
  - Tous les modules avec formulaires
  - styles.css : Styles de boutons

  ---
  Formulaires (2 classes)

  "formulaires": [
    "groupe-form",              // Groupe de champ de formulaire
    "controle-form"             // Input/select de formulaire
  ]

  Utilisé par :
  - Tous les modules avec formulaires
  - styles.css : Styles de formulaires

  ---
  3.3 Attributs data (attributs_data)

  "attributs_data": [
    "data-onglet",              // Attribut pour boutons navigation principale
    "data-sous-onglet"          // Attribut pour boutons sous-navigation
  ]

  Utilisé par :
  - navigation.js : Lecture des attributs pour déterminer quelle
  section/sous-section afficher
  - main.js : Attachement des événements click

  Format :
  <button data-onglet="etudiants">Étudiants</button>
  <button data-sous-onglet="etudiants-liste">Liste</button>

  ⚠️ IMPACT SI MODIFIÉ : Navigation ne fonctionne plus

  ---
  3.4 Fonctions JavaScript (fonctions_javascript)

  Navigation (4 fonctions)

  "navigation": [
    "afficherSection",              // Affiche une section principale
    "afficherSousNavigation",       // Génère la sous-navigation
    "afficherSousSection",          // Affiche une sous-section
    "afficherDetailEtudiant"        // Affiche détail d'un étudiant
  ]

  Module source : navigation.js

  Utilisé par : Tous les modules qui naviguent

  ⚠️ IMPACT SI RENOMMÉ : Erreur "fonction not defined" dans tous les modules
  appelants

  ---
  Étudiants et Portfolio (4 fonctions)

  "etudiants_portfolio": [
    "afficherProfilEtudiant",       // Affiche profil complet
    "chargerPortfolioEleveDetail",  // Charge portfolio détaillé
    "toggleArtefactPortfolio",      // Toggle sélection artefact
    "afficherListeEtudiants"        // Affiche liste étudiants
  ]

  Modules sources :
  - profil-etudiant.js : afficherProfilEtudiant
  - portfolio.js : chargerPortfolioEleveDetail, toggleArtefactPortfolio
  - etudiants.js : afficherListeEtudiants

  ---
  Productions et Évaluations (10 fonctions)

  "productions_evaluations": [
    "gererChangementTypeProduction",  // Gère changement type production
    "afficherTableauProductions",     // Affiche tableau productions
    "mettreAJourPonderationTotale",   // MAJ pondération totale
    "mettreAJourResumeTypes",         // MAJ résumé types
    "modifierEvaluation",             // Modifier une évaluation
    "supprimerProduction",            // Supprimer une production
    "verrouillerEvaluation",          // Verrouiller une évaluation
    "basculerVerrouillageEval",       // Basculer verrouillage
    "gererPortfolio",                 // Gérer portfolio
    "getTypeLabel"                    // Obtenir label d'un type
  ]

  Modules sources :
  - productions.js : Gestion des productions
  - evaluation.js : Gestion des évaluations

  ---
  Échelles (3 fonctions)

  "echelles": [
    "initialiserEchelle",             // Initialiser échelle
    "changerTypeEchelle",             // Changer type échelle
    "chargerEchellesTemplates"        // Charger templates
  ]

  Module source : echelles.js

  ---
  Calendrier (3 fonctions)

  "calendrier": [
    "creerDateLocale",                // Créer date locale
    "genererOptionsHeureDebut",       // Générer options heure début
    "genererOptionsHeureFin"          // Générer options heure fin
  ]

  Modules sources :
  - trimestre.js : Gestion du calendrier
  - horaire.js : Gestion des horaires

  ---
  Utilitaires (14 fonctions)

  "utilitaires": [
    "mettreAJourHorodatage",          // MAJ horodatage
    "sauvegarderDonnees",             // Sauvegarder dans localStorage
    "initialiserDonneesDemonstration",// Créer données de démo
    "chargerDetailEtudiant",          // Charger détail étudiant
    "afficherNotification",           // Afficher notification
    "exporterCSV",                    // Exporter en CSV
    "imprimerSection",                // Imprimer une section
    "echapperHtml",                   // ⚠️ SÉCURITÉ - Échapper HTML (XSS)
    "chargerStatistiquesApercu",      // Charger statistiques
    "ouvrirModalExport",              // Ouvrir modal export
    "ouvrirModalImport",              // Ouvrir modal import
    "fermerModalExport",              // Fermer modal export
    "fermerModalImport"               // Fermer modal import
  ]

  Module source : utilitaires.js, import-export.js, statistiques.js

  ⚠️ FONCTION CRITIQUE : echapperHtml est utilisée partout pour la sécurité XSS

  ---
  3.5 Variables globales (variables_globales)

  "variables_globales": [
    "configurationsOnglets",          // Configuration navigation
    "sectionActive",                  // Section actuellement affichée
    "sousSectionActive",              // Sous-section actuellement affichée
    "listeEtudiants"                  // Liste des étudiants (⚠️ doublon)
  ]

  Module source : config.js

  Portée : Globale (window)

  ⚠️ IMPACT SI RENOMMÉ : Erreur dans tous les modules utilisant ces variables

  ⚠️ NOTE : listeEtudiants semble être un doublon avec groupeEtudiants dans
  localStorage

  ---
  3.6 Clés localStorage (localstorage_keys)

  "localstorage_keys": [
    "listeGrilles",                   // ⚠️ Nom historique - Liste des PRODUCTIONS
    "grillesTemplates",               // Templates de grilles de critères
    "groupeEtudiants",                // Liste des étudiants
    "evaluationsSauvegardees",        // Évaluations sauvegardées
    "echellesTemplates",              // Templates d'échelles
    "portfoliosEleves",               // Sélections d'artefacts par élève
    "echelles",                       // Échelles configurées
    "echellesPerformance",            // Échelles de performance
    "configEchelles",                 // Configuration échelles
    "configEchelle"                   // Configuration échelle (singulier)
  ]

  ⚠️ ATTENTION : listeGrilles est un nom historique trompeur. Cette clé stocke en
  réalité la liste des productions (examens, travaux, portfolio, etc.), PAS les
  grilles de critères.

  Modules sources :
  - productions.js : Génère listeGrilles (productions)
  - grilles.js : Génère grillesTemplates (vraies grilles de critères)
  - groupe.js : Génère groupeEtudiants
  - evaluation.js : Génère evaluationsSauvegardees
  - portfolio.js : Génère portfoliosEleves
  - echelles.js : Génère les clés liées aux échelles

  ⚠️ IMPACT SI MODIFIÉ : Perte de données, modules ne trouvent plus les données

  ---
  3.7 Types de productions (types_productions)

  "types_productions": [
    "examen",                         // Examen
    "travail",                        // Travail (devoir)
    "quiz",                           // Quiz
    "presentation",                   // Présentation orale
    "portfolio",                      // Portfolio (conteneur)
    "artefact-portfolio",             // Artefact de portfolio
    "autre"                           // Autre type
  ]

  Module source : productions.js

  Usage : Valeurs du champ type dans les objets production

  ⚠️ IMPACT SI MODIFIÉ :
  - Filtres cassés (ex: productions.filter(p => p.type === 'portfolio'))
  - Affichage incorrect dans les interfaces

  Logique spéciale :
  - portfolio : Production conteneur avec règles de sélection
  - artefact-portfolio : Artefacts individuels à sélectionner

  ---
  3.8 Notes importantes (notes_importantes)

  "notes_importantes": [
    "Les sous-sections reglages-* ont été ajoutées pour gérer les configurations",
    "La sous-section etudiants-profil permet la gestion du portfolio individuel",
    "Les fonctions portfolio gèrent la sélection des artefacts pour la note
  finale",
    "Les fonctions échelles gèrent les templates et la configuration des
  performances",
    "Le localStorage portfoliosEleves stocke la sélection des 3 artefacts par
  élève",
    "Nouvelle fonction echapperHtml pour la sécurité contre les injections XSS"
  ]

  Rôle : Annotations historiques sur les évolutions de l'architecture

  Date : 10 octobre 2025

  ---
  4. Utilisation du registre

  4.1 Avant de modifier un nom

  Procédure obligatoire :

  1. Vérifier le registre :
  # Rechercher le nom dans NOMS_STABLES.json
  grep -i "monNom" NOMS_STABLES.json

  2. Si le nom est trouvé :
    - ❌ NE PAS MODIFIER sans autorisation
    - ✅ Évaluer l'impact (combien de fichiers l'utilisent?)
    - ✅ Planifier la modification coordonnée de tous les fichiers
    - ✅ Mettre à jour NOMS_STABLES.json après modification
  3. Si le nom n'est pas trouvé :
    - ✅ Modifier librement
    - ✅ Ajouter au registre si le nom devient critique

  4.2 Lors de l'ajout d'un nouveau composant

  Si le composant est public (utilisé par d'autres modules) :

  1. ✅ Ajouter les noms dans NOMS_STABLES.json
  2. ✅ Documenter dans quelle catégorie
  3. ✅ Commiter le fichier JSON avec le code

  Exemple :
  // Ajout d'une nouvelle fonction publique
  "fonctions_javascript": {
    "utilitaires": [
      ...
      "maNouvelleFonction"  // ← AJOUTER ICI
    ]
  }

  4.3 Audit de cohérence

  Vérifier périodiquement que le registre est à jour :

  # Vérifier si toutes les fonctions du registre existent
  grep -r "function afficherSection" js/

  # Vérifier si toutes les clés localStorage sont utilisées
  grep -r "localStorage.getItem('listeGrilles')" js/

  ---
  5. Problèmes connus et solutions

  5.1 Nom historique trompeur : listeGrilles

  Symptôme : Le nom listeGrilles suggère qu'il stocke les grilles de critères,
  mais il stocke en réalité les productions (examens, travaux, portfolio)

  Historique : Probablement nommé ainsi au début du projet quand les productions
  étaient confondues avec les grilles

  Impact actuel : Confusion pour les développeurs

  Solution recommandée :
  // Option 1 : Renommer la clé (RISQUE ÉLEVÉ - perte de données)
  // localStorage.listeGrilles → localStorage.listeProductions

  // Option 2 : Documenter clairement (SOLUTION ACTUELLE)
  // Ajouter un commentaire dans le code :
  const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
  // ⚠️ NOM HISTORIQUE : listeGrilles stocke les PRODUCTIONS, pas les grilles de 
  critères

  // Option 3 : Ajouter un alias (COMPROMIS)
  function obtenirProductions() {
      return JSON.parse(localStorage.getItem('listeGrilles') || '[]');
  }

  ⚠️ ATTENTION : Ne PAS renommer sans migration de données

  ---
  5.2 Doublon listeEtudiants vs groupeEtudiants

  Symptôme :
  - Variable globale : listeEtudiants
  - Clé localStorage : groupeEtudiants

  Confusion : Deux noms pour la même chose

  Usage actuel :
  // Dans config.js
  let listeEtudiants = []; // Variable globale (rarement utilisée?)

  // Dans groupe.js et partout ailleurs
  const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');

  Solution : Utiliser uniquement groupeEtudiants (clé localStorage). Supprimer
  listeEtudiants si inutilisé.

  ---
  5.3 Échelles multiples : confusion des noms

  Symptôme : 4 clés localStorage pour les échelles :
  - echelles
  - echellesPerformance
  - echellesTemplates
  - configEchelles
  - configEchelle (singulier)

  Confusion : Quelle clé utiliser?

  Clarification nécessaire :
  // Documentation à ajouter dans echelles.js
  // echelles : Liste des échelles actives
  // echellesPerformance : Échelles de type performance (IDME)
  // echellesTemplates : Templates prédéfinis (SOLO, etc.)
  // configEchelles : Configuration globale des échelles
  // configEchelle : Configuration d'une échelle spécifique (?)

  ---
  5.4 Éléments statistiques vs éléments spécifiques

  Symptôme : Certains IDs pourraient être dans l'autre catégorie

  Exemple :
  // elements_specifiques contient des tbody qui pourraient être logiquement
  séparés
  "tbody-liste-complete",
  "tbody-etudiants",
  "tbody-presences-apercu",
  ...

  Impact : Aucun (organisation logique seulement)

  Amélioration possible : Créer une sous-catégorie tableaux

  ---
  6. Règles de modification du registre

  6.1 ⚠️ INTERDICTIONS ABSOLUES

  1. ❌ Supprimer un nom du registre sans vérifier son usage
  2. ❌ Modifier un nom sans mettre à jour tous les fichiers l'utilisant
  3. ❌ Ajouter des noms génériques (ex: data, item, element)

  6.2 ✅ MODIFICATIONS AUTORISÉES

  1. ✅ Ajouter de nouveaux noms critiques
  2. ✅ Ajouter des commentaires dans notes_importantes
  3. ✅ Mettre à jour version et date_mise_a_jour
  4. ✅ Réorganiser les catégories pour plus de clarté

  6.3 Workflow de modification

  AVANT :
  1. ✅ Identifier tous les fichiers utilisant le nom à modifier
  2. ✅ Créer une branche Git
  3. ✅ Sauvegarder NOMS_STABLES.json

  PENDANT :
  1. ✅ Modifier NOMS_STABLES.json
  2. ✅ Modifier tous les fichiers JavaScript/HTML/CSS concernés
  3. ✅ Tester l'application complètement

  APRÈS :
  1. ✅ Vérifier que rien n'est cassé
  2. ✅ Commit avec message explicite
  3. ✅ Mettre à jour date_mise_a_jour

  ---
  7. Bonnes pratiques

  7.1 Nommage cohérent

  IDs HTML : kebab-case
  "section-tableau-bord"        // ✅ BON
  "sectionTableauBord"          // ❌ MAUVAIS

  Classes CSS : kebab-case
  "carte-statistique"           // ✅ BON
  "carteStatistique"            // ❌ MAUVAIS

  Fonctions JavaScript : camelCase
  "afficherSection"             // ✅ BON
  "afficher_section"            // ❌ MAUVAIS

  Clés localStorage : camelCase
  "groupeEtudiants"             // ✅ BON
  "groupe-etudiants"            // ❌ MAUVAIS

  7.2 Préfixes sémantiques

  Tableaux : Préfixer par tbody-
  "tbody-saisie-presences"      // ✅ BON
  "tableauPresences"            // ❌ MOINS CLAIR

  Statistiques : Préfixer par stat-
  "stat-nb-etudiants"           // ✅ BON
  "nombreEtudiants"             // ❌ MOINS CLAIR

  Boutons : Préfixer par btn-
  "btn-supprimer"               // ✅ BON
  "supprimer"                   // ❌ TROP GÉNÉRIQUE

  7.3 Éviter les doublons

  Vérifier qu'un nom similaire n'existe pas déjà :
  // ❌ MAUVAIS - Doublon
  "listeEtudiants"              // Variable globale
  "groupeEtudiants"             // localStorage

  // ✅ BON - Un seul nom
  "groupeEtudiants"             // Utilisé partout

  ---
  8. Historique et évolution

  Version 50 10-10-2025a (10 octobre 2025)

  État actuel : Registre complet avec 160+ noms protégés

  Ajouts récents :
  - ✅ Sous-sections reglages-* pour configurations
  - ✅ Sous-section etudiants-profil pour portfolio
  - ✅ Fonctions portfolio (chargerPortfolioEleveDetail, toggleArtefactPortfolio)
  - ✅ Fonctions échelles (initialiserEchelle, changerTypeEchelle)
  - ✅ Clé portfoliosEleves pour sélections d'artefacts
  - ✅ Fonction echapperHtml pour sécurité XSS

  Évolution future

  À ajouter :
  1. Fonctions liées aux indices A-C-P
  2. Clés localStorage pour indices (indicesAssiduiteDetailles, indicesCP)
  3. IDs pour profil étudiant (dashboard des indices)
  4. Fonctions de calcul de risque

  À nettoyer :
  1. Renommer listeGrilles en listeProductions (avec migration)
  2. Supprimer listeEtudiants si non utilisé
  3. Clarifier les clés liées aux échelles
  4. Documenter usage de chaque clé localStorage

  ---
  9. Support et ressources

  9.1 Documentation liée

  - CLAUDE.md : Instructions générales, référence ce fichier
  - structure-modulaire.txt : Vue d'ensemble de l'architecture
  - DOC_*.md : Documentation de chaque module

  9.2 Utilisation dans les modules

  Modules utilisant intensivement le registre :
  - navigation.js : IDs, classes, attributs data
  - config.js : Variables globales
  - Tous les modules : Fonctions publiques, clés localStorage

  9.3 Outils de vérification

  Script de vérification de cohérence :
  #!/bin/bash
  # verify-noms-stables.sh

  echo "Vérification des IDs HTML..."
  grep -r "getElementById" js/ | while read line; do
      id=$(echo "$line" | sed -n "s/.*getElementById('\([^']*\)').*/\1/p")
      if ! grep -q "\"$id\"" NOMS_STABLES.json; then
          echo "⚠️  ID non enregistré: $id"
      fi
  done

  echo "Vérification des clés localStorage..."
  grep -r "localStorage.getItem" js/ | while read line; do
      key=$(echo "$line" | sed -n "s/.*getItem('\([^']*\)').*/\1/p")
      if ! grep -q "\"$key\"" NOMS_STABLES.json; then
          echo "⚠️  Clé non enregistrée: $key"
      fi
  done

  9.4 Contact et licence

  Responsable : Grégoire Bédard
  Licence : Creative Commons BY-NC-SA 4.0
  - ✅ Partage et adaptation autorisés (usage non commercial)
  - ✅ Attribution requise
  - ✅ Redistribution sous même licence

  ---
  FIN DE LA DOCUMENTATION - NOMS_STABLES.json

  Dernière mise à jour : 23 octobre 2025
  Version : 50 10-10-2025a

  ⚠️ RAPPEL CRITIQUE : Avant de modifier un nom listé dans ce fichier, TOUJOURS :
  1. Vérifier l'impact dans tous les modules
  2. Planifier la modification coordonnée
  3. Tester exhaustivement
  4. Mettre à jour le registre