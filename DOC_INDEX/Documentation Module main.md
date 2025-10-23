Voici la documentation technique complète du module main.js :

  ---
  Module main.js

  Vue d'ensemble

  Module INITIALISATION qui sert de point d'entrée de l'application et orchestre
  le démarrage de tous les modules.

  ⚠️ ATTENTION CRITIQUE : Ce module DOIT être chargé EN DERNIER après tous les
  autres modules. Il initialise l'application dans un ordre précis et attache les
  événements globaux.

  Responsabilités :
  - Écoute du chargement du DOM : Attend que la page soit prête (DOMContentLoaded)
  - Initialisation de la navigation : Attache les événements sur les boutons
  principaux
  - Initialisation des modules : Appelle les fonctions d'initialisation dans
  l'ordre de dépendance
  - Gestion des priorités : 6 niveaux de priorité (sources → lecteurs → synthèse)
  - Événements globaux : Select étudiant, affichage tableau cours
  - Logs détaillés : Console logs pour suivi du démarrage

  Principe fondamental : Ce module est le chef d'orchestre du démarrage. Il ne
  contient aucune logique métier, uniquement la séquence d'initialisation.

  Type

  - SOURCE - Génère et stocke des données
  - LECTEUR - Lit et affiche des données
  - CONFIGURATION - Définit constantes et variables globales
  - SYSTÈME - Gestion de la navigation et de l'état de l'interface
  - INITIALISATION - Point d'entrée et orchestration du démarrage

  Ordre d'initialisation (6 priorités)

  PRIORITÉ 1 : Modules générateurs de données (SOURCES)

  Objectif : Créer les sources uniques de vérité avant que les lecteurs ne les
  utilisent.

  // MODULE TRIMESTRE: Génère calendrierComplet (source unique)
  if (typeof initialiserModuleTrimestre === 'function') {
      initialiserModuleTrimestre();
  }

  // MODULE HORAIRE: Génère seancesCompletes (source unique)
  if (typeof initialiserModuleHoraire === 'function') {
      initialiserModuleHoraire();
  }

  Modules :
  - trimestre.js → Génère calendrierComplet
  - horaire.js → Génère seancesCompletes

  Pourquoi en premier : Ces données sont utilisées par les modules lecteurs
  (calendrier-vue, saisie-presences).

  PRIORITÉ 2 : Données de base

  Objectif : Charger les configurations et données fondamentales.

  if (typeof initialiserModuleListeEtudiants === 'function') {
      initialiserModuleListeEtudiants();
  }
  if (typeof initialiserModuleProductions === 'function') {
      initialiserModuleProductions();
  }
  if (typeof initialiserModuleGrilles === 'function') {
      initialiserModuleGrilles();
  }
  // ... etc

  Modules :
  - 03-liste-etudiants.js → Liste des étudiants
  - 04-productions.js → Productions et évaluations
  - 05-grilles.js → Grilles de critères SRPNF
  - 06-echelles.js → Échelles de performance IDME
  - 07-cartouches.js → Cartouches de rétroaction
  - 08-cours.js → Informations du cours
  - notation.js → Module notation
  - 11-groupe.js → Gestion du groupe
  - 12-pratiques.js → Pratiques de notation (PAN)

  PRIORITÉ 3 : Modules lecteurs

  Objectif : Initialiser les modules qui lisent les données des sources.

  // MODULE 09-1: Vue calendaire (lit calendrierComplet)
  if (typeof initialiserModuleVueCalendaire === 'function') {
      initialiserModuleVueCalendaire();
  }

  // MODULE 09-2: Saisie des présences (lit seancesCompletes)
  if (typeof initialiserModuleSaisiePresences === 'function') {
      initialiserModuleSaisiePresences();
  }

  Modules :
  - calendrier-vue.js → Lit calendrierComplet
  - saisie-presences.js → Lit calendrierComplet et seancesCompletes

  Pourquoi après PRIORITÉ 1 : Dépendent des données générées par trimestre.js et
  horaire.js.

  PRIORITÉ 4 : Modules avancés

  Objectif : Initialiser les fonctionnalités complexes.

  if (typeof initialiserModuleEvaluation === 'function') {
      initialiserModuleEvaluation();
  }
  if (typeof initialiserModuleStatistiques === 'function') {
      initialiserModuleStatistiques();
  }
  if (typeof initialiserModuleProfilEtudiant === 'function') {
      initialiserModuleProfilEtudiant();
  }
  // ... etc

  Modules :
  - evaluation.js → Évaluations
  - 14-statistiques.js → Statistiques
  - 15-profil-etudiant.js → Profil étudiant
  - 16-liste-evaluations.js → Liste des évaluations (initialisation différée)
  - 17-modes.js → Gestion des modes (réel/démo/anonyme)

  PRIORITÉ 5 : Utilitaires

  Objectif : Initialiser les outils transversaux.

  if (typeof initialiserModuleUtilitaires === 'function') {
      initialiserModuleUtilitaires();
  }
  if (typeof initialiserModuleImportExport === 'function') {
      initialiserModuleImportExport();
  }

  Modules :
  - utilitaires.js → Fonctions utilitaires
  - import-export.js → Import/Export JSON

  PRIORITÉ 6 : Tableau de bord (SYNTHÈSE)

  Objectif : Initialiser en dernier car il lit TOUTES les sources.

  if (typeof initialiserModuleTableauBordApercu === 'function') {
      initialiserModuleTableauBordApercu();
  }

  Modules :
  - tableau-bord-apercu.js → Lit indicesAssiduite, indicesEvaluation,
  groupeEtudiants

  Pourquoi en dernier : Agrège les données de tous les autres modules.

  Navigation principale

  Initialisation (lignes 23-34)

  document.querySelectorAll('.navigation-principale button').forEach(bouton => {
      bouton.addEventListener('click', function () {
          const onglet = this.getAttribute('data-onglet');
          console.log(`   → Navigation vers: ${onglet}`);
          afficherSection(onglet);
      });
  });

  afficherSection('tableau-bord');

  Séquence :
  1. Sélectionne tous les boutons de navigation principale
  2. Attache un événement click sur chaque bouton
  3. Au clic : Lit l'attribut data-onglet et appelle afficherSection()
  4. Affiche la section par défaut : 'tableau-bord'

  Résultat :
  - Section "Tableau de bord" affichée
  - Sous-section "Aperçu" affichée (première par défaut)
  - sectionActive = 'tableau-bord'
  - sousSectionActive = 'tableau-bord-apercu'

  Événements globaux

  Select étudiant (lignes 206-215)

  const selectEtudiant = document.getElementById('select-etudiant');
  if (selectEtudiant) {
      selectEtudiant.addEventListener('change', function () {
          if (typeof chargerDetailEtudiant === 'function') {
              chargerDetailEtudiant(this.value);
              console.log(`   → Chargement détail étudiant: ${this.value}`);
          }
      });
  }

  Usage : Permet de changer l'étudiant affiché dans une vue détail via un
  <select>.

  Affichage tableau cours (lignes 218-228)

  document.addEventListener('click', function (e) {
      if (e.target.matches('[data-sous-onglet="reglages-cours"]')) {
          setTimeout(() => {
              if (typeof afficherTableauCours === 'function') {
                  afficherTableauCours();
                  console.log('   → Affichage tableau des cours');
              }
          }, 50);
      }
  });

  Usage : Quand l'utilisateur clique sur "Réglages › Cours", charge le tableau des
   cours avec un délai de 50ms.

  Initialisations conditionnelles

  Principe

  Vérification typeof :
  if (typeof initialiserModuleTrimestre === 'function') {
      initialiserModuleTrimestre();
  }

  Pourquoi :
  - Évite les erreurs si un module n'est pas chargé
  - Permet de développer progressivement (modules optionnels)
  - Facilite le débogage (voir quels modules sont détectés dans la console)

  Exemple de log :
     → Module Trimestre détecté
     → Module 10-horaire détecté
     → Module 03-liste-etudiants détecté
     ...

  Cas particulier : Module Notation (duplication)

  Lignes 42-44 :
  if (typeof initialiserModuleNotation === 'function') {
      initialiserModuleNotation();
  }

  Lignes 106-109 :
  if (typeof initialiserModuleNotation === 'function') {
      console.log('   → Module Notation détecté');
      initialiserModuleNotation();
  }

  Problème : Module Notation initialisé deux fois.

  Impact : Dépend de l'implémentation du module. Si idempotent, pas de problème.
  Sinon, possible duplication d'événements.

  Solution future : Supprimer la première occurrence (lignes 42-44).

  Logs de débogage

  Symboles utilisés

  - 🚀 : Démarrage de l'application
  - 📦 : Modules chargés
  - ⚙️ : Initialisation en cours
  - ✅ : Succès d'une étape
  - → : Action spécifique

  Exemple de logs complets

  🚀 Initialisation du système de monitorage v3.0
  📦 Modules chargés : 01-config, 02-navigation
  ⚙️  Initialisation de la navigation...
     → Navigation vers: tableau-bord
  ✅ Navigation initialisée - Section par défaut: tableau-bord
  ⚙️  Vérification des modules additionnels...
     → Module Trimestre détecté
     → Module 10-horaire détecté
     → Module 03-liste-etudiants détecté
     → Module 04-productions détecté
     → Module 05-grilles détecté
     → Module 06-echelles détecté
     → Module 07-cartouches détecté
     → Module 08-cours détecté
     → Module Notation détecté
     → Module 11-groupe détecté
     → Module 12-pratiques détecté
     → Module 09-1-vue-calendaire détecté
     → Module 09-2-saisie-presences détecté
     → Module Evaluation détecté
     → Module 14-statistiques détecté
     → Module 15-profil-etudiant détecté
     → Module 16-liste-evaluations détecté
     → Module 17-modes détecté
     → Module-utilitaires détecté
     → Module import-export détecté
     → Module Tableau de bord (aperçu) détecté
  ✅ Application initialisée
  ⚙️  Initialisation des événements globaux...
     ✅ Événement select-etudiant attaché
     ✅ Événement affichage cours attaché
  ✅ Système initialisé avec succès
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Dépendances

  Lit depuis :
  - Aucune (point d'entrée)

  Appelle (TOUTES les fonctions d'initialisation) :
  - afficherSection() depuis navigation.js
  - initialiserModuleTrimestre() depuis trimestre.js
  - initialiserModuleHoraire() depuis horaire.js
  - initialiserModuleVueCalendaire() depuis calendrier-vue.js
  - initialiserModuleSaisiePresences() depuis saisie-presences.js
  - initialiserModuleTableauBordApercu() depuis tableau-bord-apercu.js
  - ... et 15+ autres modules

  Utilisé par :
  - Aucun (point d'entrée, pas appelé par d'autres modules)

  Modules requis (chargement avant) :
  - TOUS les modules doivent être chargés avant main.js

  Ordre de chargement dans index.html

  Structure recommandée :
  <!DOCTYPE html>
  <html>
  <head>
      <!-- CSS -->
      <link rel="stylesheet" href="css/styles.css">
  </head>
  <body>
      <!-- HTML de l'interface -->

      <!-- SCRIPTS - ORDRE CRITIQUE -->

      <!-- 1. CONFIGURATION (PREMIER) -->
      <script src="js/config.js"></script>

      <!-- 2. NAVIGATION (SECOND) -->
      <script src="js/navigation.js"></script>

      <!-- 3. MODULES SOURCES (PRIORITÉ 1) -->
      <script src="js/trimestre.js"></script>
      <script src="js/horaire.js"></script>

      <!-- 4. MODULES DONNÉES DE BASE (PRIORITÉ 2) -->
      <script src="js/etudiants.js"></script>
      <script src="js/productions.js"></script>
      <script src="js/grilles.js"></script>
      <script src="js/echelles.js"></script>
      <script src="js/cartouches.js"></script>
      <script src="js/cours.js"></script>
      <script src="js/notation.js"></script>
      <script src="js/groupe.js"></script>
      <script src="js/pratiques.js"></script>

      <!-- 5. MODULES LECTEURS (PRIORITÉ 3) -->
      <script src="js/calendrier-vue.js"></script>
      <script src="js/saisie-presences.js"></script>

      <!-- 6. MODULES AVANCÉS (PRIORITÉ 4) -->
      <script src="js/evaluation.js"></script>
      <script src="js/statistiques.js"></script>
      <script src="js/profil-etudiant.js"></script>
      <script src="js/liste-evaluations.js"></script>
      <script src="js/modes.js"></script>

      <!-- 7. UTILITAIRES (PRIORITÉ 5) -->
      <script src="js/utilitaires.js"></script>
      <script src="js/import-export.js"></script>

      <!-- 8. TABLEAU DE BORD (PRIORITÉ 6) -->
      <script src="js/tableau-bord-apercu.js"></script>

      <!-- 9. MAIN (DERNIER) -->
      <script src="js/main.js"></script>
  </body>
  </html>

  ⚠️ RÈGLE D'OR : main.js DOIT être le dernier script chargé.

  Tests

  Console navigateur

  // Vérifier que le DOM est chargé
  document.readyState  // "complete"

  // Vérifier l'état de la navigation
  sectionActive  // "tableau-bord"
  sousSectionActive  // "tableau-bord-apercu"

  // Vérifier qu'un module a été initialisé
  typeof initialiserModuleTrimestre === 'function'  // true

  // Vérifier les logs (dans console au chargement)
  // Doit afficher tous les messages 🚀 ⚙️ ✅

  Tests fonctionnels

  1. Test chargement initial :
    - Ouvrir l'application
    - Vérifier : Console affiche "🚀 Initialisation du système de monitorage v3.0"
    - Vérifier : Section "Tableau de bord" visible
    - Vérifier : Sous-section "Aperçu" visible
    - Vérifier : Console affiche "✅ Système initialisé avec succès"
  2. Test détection des modules :
    - Consulter les logs de console
    - Vérifier : Chaque module détecté affiche "→ Module X détecté"
    - Compter le nombre de modules détectés
  3. Test navigation après init :
    - Cliquer sur "Présences"
    - Vérifier : Section change
    - Vérifier : Console affiche "   → Navigation vers: presences"
    - Vérifier : Aucune erreur JavaScript
  4. Test événement select étudiant :
    - Aller dans une section avec #select-etudiant
    - Changer la sélection
    - Vérifier : Console affiche "   → Chargement détail étudiant: [DA]"
  5. Test ordre d'initialisation :
    - Inspecter logs console
    - Vérifier : trimestre.js AVANT calendrier-vue.js
    - Vérifier : horaire.js AVANT saisie-presences.js
    - Vérifier : tableau-bord-apercu.js en DERNIER
  6. Test avec module manquant :
    - Commenter un <script> dans index.html (ex: horaire.js)
    - Recharger
    - Vérifier : Pas d'erreur "function not defined"
    - Vérifier : Autres modules fonctionnent quand même
  7. Test sans erreurs :
    - Ouvrir console (F12)
    - Recharger la page
    - Vérifier : Aucun message rouge (erreur)
    - Vérifier : Seulement des logs bleus/verts (info/succès)

  Diagramme de flux d'initialisation

  DOMContentLoaded
      │
      ├─> 1. Logs de démarrage (🚀 📦)
      │
      ├─> 2. Navigation principale
      │   ├─> Attacher événements click
      │   └─> afficherSection('tableau-bord')
      │       ├─> afficherSousNavigation('tableau-bord')
      │       └─> afficherSousSection('tableau-bord-apercu')
      │           └─> chargerTableauBordApercu() (avec délai 150ms)
      │
      ├─> 3. PRIORITÉ 1: Modules sources
      │   ├─> initialiserModuleTrimestre()
      │   │   └─> Génère calendrierComplet
      │   └─> initialiserModuleHoraire()
      │       └─> Génère seancesCompletes
      │
      ├─> 4. PRIORITÉ 2: Données de base
      │   ├─> initialiserModuleListeEtudiants()
      │   ├─> initialiserModuleProductions()
      │   ├─> ... (9 modules)
      │
      ├─> 5. PRIORITÉ 3: Modules lecteurs
      │   ├─> initialiserModuleVueCalendaire()
      │   │   └─> Lit calendrierComplet
      │   └─> initialiserModuleSaisiePresences()
      │       └─> Lit calendrierComplet + seancesCompletes
      │
      ├─> 6. PRIORITÉ 4: Modules avancés
      │   ├─> initialiserModuleEvaluation()
      │   ├─> ... (5 modules)
      │
      ├─> 7. PRIORITÉ 5: Utilitaires
      │   ├─> initialiserModuleUtilitaires()
      │   └─> initialiserModuleImportExport()
      │
      ├─> 8. PRIORITÉ 6: Tableau de bord
      │   └─> initialiserModuleTableauBordApercu()
      │       └─> Lit indicesAssiduite + groupeEtudiants
      │
      ├─> 9. Événements globaux
      │   ├─> Select étudiant
      │   └─> Affichage tableau cours
      │
      └─> 10. Fin (✅ ━━━)

  Problèmes connus

  Module Notation initialisé deux fois

  Lignes : 42-44 et 106-109

  Cause : Duplication du code lors d'ajouts successifs

  Impact : Dépend de l'implémentation du module. Peut causer :
  - Événements attachés deux fois (double exécution au clic)
  - Données chargées deux fois (ralentissement)
  - Logs dupliqués dans console

  Solution : Supprimer la première occurrence (lignes 42-44)

  Patch proposé :
  // SUPPRIMER (lignes 42-44)
  // if (typeof initialiserModuleNotation === 'function') {
  //     initialiserModuleNotation();
  // }

  // GARDER (lignes 106-109)
  if (typeof initialiserModuleNotation === 'function') {
      console.log('   → Module Notation détecté');
      initialiserModuleNotation();
  }

  Tableau de bord appelé deux fois

  Lignes : Au chargement ET dans afficherSousSection()

  Cause :
  1. afficherSection('tableau-bord') → Appelle
  afficherSousSection('tableau-bord-apercu') → Appelle chargerTableauBordApercu()
  (délai 150ms)
  2. initialiserModuleTableauBordApercu() (ligne 197) → Peut aussi appeler
  chargerTableauBordApercu()

  Impact : Minimal (double chargement des statistiques)

  Solution : Pas urgente, mais pourrait optimiser en supprimant l'appel dans
  initialiserModuleTableauBordApercu()

  Logs en double "Application initialisée"

  Ligne 46 : console.log('✅ Application initialisée');
  Ligne 233 : console.log('✅ Système initialisé avec succès');

  Cause : Évolution du code, messages similaires ajoutés à différents moments

  Impact : Confusion dans les logs (deux messages de fin)

  Solution : Unifier les messages ou en supprimer un

  Règles de modification

  ⚠️ ZONES CRITIQUES

  Ordre d'initialisation :
  - ❌ Ne PAS modifier l'ordre des priorités (1-6)
  - ❌ Ne PAS initialiser un lecteur avant sa source
  - ⚠️ Vérifier les dépendances avant de réorganiser

  Événement DOMContentLoaded :
  - ❌ Ne PAS supprimer
  - ❌ Ne PAS déplacer en dehors de cette fonction
  - Raison : Sans cela, le code s'exécute avant que le DOM soit prêt → erreurs

  afficherSection('tableau-bord') :
  - ❌ Ne PAS supprimer
  - ⚠️ Peut changer la section par défaut (ex: 'presences')

  ✅ ZONES MODIFIABLES

  Ajout de nouveaux modules :
  // ✅ AUTORISÉ - Ajouter dans la bonne priorité
  // PRIORITÉ 2 - Nouveau module de configuration
  if (typeof initialiserModuleMonNouveauModule === 'function') {
      console.log('   → Module mon-nouveau-module détecté');
      initialiserModuleMonNouveauModule();
  }

  Modification des logs :
  // ✅ AUTORISÉ - Modifier les emojis/textes
  console.log('🎯 Démarrage du système...');

  Suppression de duplications :
  // ✅ AUTORISÉ - Supprimer Module Notation en double

  Ajout d'événements globaux :
  // ✅ AUTORISÉ - Ajouter après ligne 228
  document.addEventListener('click', function (e) {
      if (e.target.matches('[data-action="mon-action"]')) {
          // Nouvelle action
      }
  });

  ⚠️ PRÉCAUTIONS

  Avant d'ajouter un module :
  1. ✅ Vérifier sa priorité (source/lecteur/utilitaire)
  2. ✅ L'ajouter dans la bonne section (PRIORITÉ 1-6)
  3. ✅ Ajouter le <script> dans index.html au bon endroit
  4. ✅ Tester l'ordre d'initialisation

  Avant de supprimer un module :
  1. ✅ Vérifier qu'aucun autre module ne dépend de lui
  2. ✅ Commenter d'abord, supprimer ensuite
  3. ✅ Tester que l'application fonctionne toujours

  Historique

  - Version initiale (index 50, 10-10-2025) :
    - Création du module d'initialisation
    - Système de priorités (6 niveaux)
    - Navigation principale initialisée
    - Événements globaux attachés
  - Modularisation (10-10-2025a) :
    - Ajout du système de détection conditionnelle (typeof)
    - Logs détaillés pour débogage
    - Organisation par priorités clairement documentée
  - Évolutions continues :
    - Ajout progressif de modules (notation, modes, etc.)
    - Duplication accidentelle (Module Notation)
    - Ajustements de l'ordre selon les dépendances
  - État actuel : 20+ modules initialisés, architecture stable

  ---
  Référence code : /js/main.js (235 lignes)

  Modules liés : TOUS les modules (point d'entrée)

  Statut : ⚠️ MODULE CRITIQUE - Ne modifier qu'avec précaution

  Version : v3.0