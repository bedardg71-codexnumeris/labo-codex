Voici la documentation complète du module profil-etudiant.js :

  ---
  # Documentation technique - MODULE profil-etudiant.js

  **Date de création** : Octobre 2025
  **Dernière modification** : 23 octobre 2025
  **Lignes de code** : 1218 lignes
  **Responsable pédagogique** : Grégoire Bédard
  **Statut** : ⚠️ EN CONSTRUCTION

  ---

  ## 1. Vue d'ensemble

  Le module `profil-etudiant.js` (Module 15) gère l'affichage complet du profil
  individuel d'un étudiant. Il constitue le **tableau de bord personnel** de
  chaque étudiant avec :
  - Dashboard des indices A-C-P (Assiduité, Complétion, Performance)
  - Indices composites M-E-R (Mobilisation, Engagement, Risque)
  - Détails d'assiduité avec liste des absences/retards
  - Portfolio d'apprentissage avec sélection d'artefacts
  - Navigation contextuelle vers les sections pertinentes

  **Contexte pédagogique** : Ce module est le **hub central** pour suivre un
  étudiant individuellement. Il agrège toutes les données du système (présences,
  évaluations, portfolio) et calcule les indices de monitorage A-C-P pour évaluer
  le risque d'échec.

  **Formule de risque** :
  M = (A + C) / 2     // Mobilisation
  E = A × C × P       // Engagement
  R = 1 - E           // Risque d'échec

  ---

  ## 2. Type de module

  **Classification** : **HYBRID** (LECTEUR + AFFICHAGE + ORCHESTRATEUR)

  ### Module LECTEUR pour :
  - **groupeEtudiants** : Liste des étudiants (via modes.js)
  - **listeGrilles** : Productions et artefacts de portfolio
  - **evaluationsSauvegardees** : Évaluations des étudiants
  - **portfoliosEleves** : Sélections d'artefacts retenus
  - **presences** : Données d'assiduité
  - **seancesHoraire** : Configuration des séances

  ### Module AFFICHAGE pour :
  - Dashboard des 5 indices (A-P-M-E-R)
  - Panneaux de détails cliquables (assiduité, portfolio)
  - Interface visuelle avec cartes interactives

  ### Module ORCHESTRATEUR pour :
  - Calcul des indices composites (M, E, R)
  - Coordination entre les différentes sections
  - Navigation contextuelle (ex: clic sur une absence → Présences › Saisie)

  **Responsabilité unique** : Fournir une vue unifiée et interactive du profil
  complet d'un étudiant avec tous ses indices de monitorage.

  ---

  ## 3. Données gérées

  ### 3.1 LocalStorage - Aucune clé générée

  Ce module **NE GÉNÈRE PAS** de données. Il agrège et affiche uniquement.

  ### 3.2 LocalStorage - Clés lues par ce module

  #### `groupeEtudiants`
  **Source** : Module groupe.js
  **Usage** : Récupérer les informations de base de l'étudiant
  ```javascript
  [
    {
      da: "1234567",
      prenom: "Alexis",
      nom: "Tremblay",
      groupe: "1",
      programme: "Sciences humaines",
      sa: "Oui",    // Services adaptés
      caf: "Oui"    // Centre d'aide en français
    }
  ]

  presences

  Source : Module saisie-presences.js
  Usage : Calculer l'indice A (assiduité)
  [
    {
      da: "1234567",
      date: "2025-10-15",
      heures: 2.5
    }
  ]

  evaluationsSauvegardees

  Source : Module evaluation.js
  Usage : Calculer l'indice P (performance)
  [
    {
      id: "EVAL_001",
      etudiantDA: "1234567",
      productionId: "PROD_001",
      noteFinale: 82.5,
      niveauFinal: "M",
      dateEvaluation: "2025-10-20T..."
    }
  ]

  listeGrilles

  Source : Module productions.js
  Usage : Récupérer portfolio et artefacts
  [
    {
      id: "PROD_001",
      type: "portfolio",
      regles: {
        nombreARetenir: 3,
        minimumCompletion: 7,
        nombreTotal: 9
      }
    },
    {
      id: "PROD_002",
      type: "artefact-portfolio",
      titre: "Analyse littéraire 1"
    }
  ]

  portfoliosEleves

  Source : Module portfolio.js (ou ce module - doublon ⚠️)
  Usage : Sélections d'artefacts retenus
  {
    "1234567": {
      "PORTFOLIO_ID": {
        artefactsRetenus: ["ARTEFACT1", "ARTEFACT2"],
        dateSelection: "2025-10-23T..."
      }
    }
  }

  ---
  4. API publique

  4.1 Fonctions principales

  initialiserModuleProfilEtudiant()

  Description : Initialise le module de profil étudiant

  Paramètres : Aucun

  Retour : void

  Comportement :
  1. Vérifie que le conteneur #contenuProfilEtudiant existe
  2. Affiche un message de confirmation dans la console
  3. Ne fait aucune autre initialisation (module à la demande)

  Appelé par : main.js lors du chargement de la page

  Exemple d'utilisation :
  // Appelé automatiquement par main.js
  initialiserModuleProfilEtudiant();

  ---
  afficherProfilComplet(da)

  Description : Affiche le profil complet d'un étudiant avec dashboard

  Paramètres :
  - da (string) : Code permanent de l'étudiant

  Retour : void (affiche directement dans le DOM)

  Comportement :
  1. Récupère les informations de l'étudiant depuis groupeEtudiants
  2. Navigue vers la sous-section etudiants-profil
  3. Calcule tous les indices (A, C, P, M, E, R)
  4. Génère le HTML du dashboard avec 5 cartes cliquables
  5. Affiche le panneau de détails (initialement masqué)

  Affichage généré :
  - En-tête avec nom, DA, groupe, programme, badges SA/CAF
  - Dashboard avec 5 cartes : A, P, M, E, R
  - Panneau de détails extensible (assiduité, portfolio)

  Exemple d'utilisation :
  afficherProfilComplet('1234567');
  // Affiche le profil de l'étudiant 1234567

  Cas particuliers :
  - Si étudiant introuvable : Alert "Élève introuvable"
  - Si conteneur manquant : Erreur dans la console

  ---
  calculerTousLesIndices(da)

  Description : Calcule tous les indices de monitorage pour un étudiant

  Paramètres :
  - da (string) : Code permanent de l'étudiant

  Retour : Object avec structure :
  {
    A: 85,      // Assiduité (%)
    C: 78,      // Complétion (%)
    P: 82,      // Performance (%)
    M: 81,      // Mobilisation (%)
    E: "0.56",  // Engagement (proportion)
    R: "0.44"   // Risque (proportion)
  }

  Comportement :
  1. Calcule A via calculerAssiduitéGlobale(da) ⚠️ Fonction externe
  2. Calcule C via calculerTauxCompletion(da) ⚠️ Fonction externe
  3. Calcule P via calculerPerformancePAN(da)
  4. Calcule M = (A + C) / 2
  5. Calcule E = A × C × P (produit des proportions)
  6. Calcule R = 1 - E

  ⚠️ DÉPENDANCES EXTERNES :
  - calculerAssiduitéGlobale(da) - Module saisie-presences.js
  - calculerTauxCompletion(da) - Module liste-evaluations.js

  ---
  calculerPerformancePAN(da)

  Description : Calcule l'indice P selon la méthode PAN (3 meilleurs artefacts)

  Paramètres :
  - da (string) : Code permanent de l'étudiant

  Retour : number - Proportion 0-1 (ex: 0.82 pour 82%)

  Comportement :
  1. Récupère toutes les évaluations de l'étudiant avec noteFinale
  2. Trie par note décroissante
  3. Prend les 3 meilleures notes (ou moins si < 3 évaluations)
  4. Calcule la moyenne
  5. Retourne la moyenne / 100

  Exemple :
  const P = calculerPerformancePAN('1234567');
  // Évaluations: [95, 88, 82, 75, 70]
  // Top 3: [95, 88, 82]
  // Moyenne: 88.33
  // Retour: 0.8833

  ---
  toggleDetailIndice(indice, da)

  Description : Affiche/masque les détails d'un indice spécifique

  Paramètres :
  - indice (string) : Code de l'indice ('A', 'P', 'M', 'E', 'R')
  - da (string) : Code permanent de l'étudiant

  Retour : void

  Comportement :
  1. Si même indice déjà affiché : Ferme le panneau
  2. Sinon :
    - Grise toutes les cartes sauf celle cliquée
    - Récupère la couleur de bordure de la carte
    - Génère le contenu HTML selon l'indice
    - Affiche le panneau de détails
    - Scroll vers le panneau

  Indices supportés :
  - 'A' : Appelle genererSectionAssiduite(da)
  - 'P' : Appelle genererSectionPortfolio(da)
  - 'M', 'E', 'R' : Pas de détails (cartes non cliquables)

  Exemple d'utilisation :
  <div onclick="toggleDetailIndice('A', '1234567')">
    Voir détails →
  </div>

  ---
  chargerPortfolioDetail(da) ⚠️ DOUBLON

  Description : Charge et affiche le portfolio détaillé (DOUBLON avec
  portfolio.js)

  Paramètres :
  - da (string) : Code permanent de l'étudiant

  Retour : void

  ⚠️ AVERTISSEMENT : Cette fonction fait doublon avec
  chargerPortfolioEleveDetail(da) du module portfolio.js. Probablement une
  duplication de code à nettoyer.

  Comportement : Identique à portfolio.js
  - Récupère le portfolio et les artefacts
  - Affiche barre de progression
  - Liste des artefacts avec checkboxes
  - Calcul des notes provisoire/finale

  ---
  toggleArtefactPortfolio(da, portfolioId, nombreARetenir) ⚠️ DOUBLON

  Description : Bascule la sélection d'un artefact (DOUBLON avec portfolio.js)

  Paramètres :
  - da (string) : Code permanent
  - portfolioId (string) : ID du portfolio
  - nombreARetenir (number) : Nombre max d'artefacts

  ⚠️ AVERTISSEMENT : Fonction identique existe dans portfolio.js. Duplication de
  code.

  ---
  naviguerVersPresenceAvecDate(dateStr)

  Description : Navigation contextuelle vers la section Présences avec une date
  pré-sélectionnée

  Paramètres :
  - dateStr (string) : Date au format YYYY-MM-DD

  Retour : void

  Comportement :
  1. Affiche la section Présences via afficherSection('presences')
  2. Affiche la sous-section Saisie via afficherSousSection('presences-saisie')
  3. Attend 300ms (mise à jour DOM)
  4. Pré-sélectionne la date dans #date-cours
  5. Déclenche l'événement change pour charger le tableau
  6. Scroll vers le haut

  Exemple d'utilisation :
  <div onclick="naviguerVersPresenceAvecDate('2025-10-15')">
    🔴 Lun 15 oct. - 3h manquées
  </div>

  Cas d'usage : L'utilisateur clique sur une absence dans le profil → Navigation
  automatique vers la saisie de cette date

  ---
  4.2 Fonctions utilitaires

  obtenirCouleurIndice(taux)

  Description : Retourne la couleur CSS selon le taux

  Paramètres :
  - taux (number) : Taux en pourcentage (0-100)

  Retour : string - Variable CSS

  Logique :
  = 85% : var(--risque-minimal) (vert)
  = 70% : var(--risque-modere) (jaune)
  - < 70% : var(--risque-tres-eleve) (rouge)

  ---
  obtenirEmojiIndice(taux)

  Description : Retourne l'emoji selon le taux

  Retour :
  = 85% : 🟢
  = 70% : 🟡
  - < 70% : 🔴

  ---
  formaterDate(dateISO)

  Description : Formate une date ISO en format lisible

  Paramètres :
  - dateISO (string) : Date au format YYYY-MM-DD

  Retour : string - Ex: "23 octobre 2025"

  ---
  genererSectionAssiduite(da)

  Description : Génère le HTML de la section assiduité

  Paramètres :
  - da (string) : Code permanent

  Retour : string - HTML complet de la section

  Contenu généré :
  - Grille de 4 statistiques (heures présentes, offertes, taux, séances)
  - Liste des absences et retards (triée chronologiquement)
  - Chaque absence est cliquable et navigue vers la saisie
  - Icônes : 🔴 (absence complète), 🟡 (retard/départ anticipé)

  ---
  genererSectionPortfolio(da)

  Description : Génère le HTML de la section portfolio

  Paramètres :
  - da (string) : Code permanent

  Retour : string - HTML complet de la section

  Contenu généré :
  - Grille de 4 statistiques (artefacts remis, C%, P%, note top 3)
  - Liste des artefacts avec checkboxes de sélection
  - Instruction intégrée (nombre d'artefacts à sélectionner)
  - Icônes : ✅ (retenu), 📄 (remis), ⏳ (non remis)

  ---
  5. Dépendances

  5.1 Modules requis (à charger AVANT)

  1. utilitaires.js
    - Fonction echapperHtml(str) pour sécurité XSS
    - CRITIQUE : Utilisé dans tout le HTML généré
  2. navigation.js (Module 02)
    - Fonctions afficherSection() et afficherSousSection()
    - CRITIQUE : Pour la navigation contextuelle
  3. saisie-presences.js (Module 09-2)
    - Fonction calculerTotalHeuresPresence(da, date)
    - Fonction obtenirDureeMaxSeance()
    - ⚠️ Fonction calculerAssiduitéGlobale(da) (non trouvée dans le code fourni)
    - CRITIQUE : Pour le calcul de l'indice A
  4. liste-evaluations.js (Module 16)
    - ⚠️ Fonction calculerTauxCompletion(da) (supposée exister)
    - CRITIQUE : Pour le calcul de l'indice C
  5. modes.js (Module 17)
    - Fonction obtenirDonneesSelonMode(cle)
    - CRITIQUE : Pour récupérer les données selon le mode actif

  5.2 Variables globales utilisées

  indiceActif

  Déclaration : Ligne 791
  Type : string | null
  Usage : Suivre quel indice est actuellement affiché dans le panneau de détails
  Valeurs possibles : 'A', 'P', null

  5.3 Éléments HTML requis

  <!-- Conteneur principal du profil -->
  <div id="contenuProfilEtudiant"></div>

  <!-- Sous-section du profil -->
  <div id="etudiants-profil" class="sous-section"></div>

  Emplacement dans l'application :
  - Section : #section-etudiants
  - Sous-section : #etudiants-profil

  5.4 Classes CSS utilisées

  Classes existantes :
  - .carte : Carte de contenu
  - .grille-statistiques : Grille de statistiques (4 colonnes)
  - .carte-metrique : Carte métrique individuelle
  - .mb-2 : Margin-bottom (utilitaire)
  - .text-muted : Texte grisé

  Variables CSS utilisées :
  - --bleu-principal : Couleur principale
  - --bleu-pale : Couleur pâle
  - --bleu-tres-pale : Couleur très pâle
  - --bleu-moyen : Couleur moyenne
  - --bleu-leger : Couleur légère
  - --risque-minimal : Vert (>= 85%)
  - --risque-modere : Jaune (>= 70%)
  - --risque-tres-eleve : Rouge (< 70%)
  - --vert-pale : Fond vert pâle
  - --jaune-pale : Fond jaune pâle

  ---
  6. Initialisation

  6.1 Séquence de chargement

  Ordre de chargement recommandé dans index.html :
  <script src="js/utilitaires.js"></script>
  <script src="js/navigation.js"></script>
  <script src="js/modes.js"></script>
  <script src="js/groupe.js"></script>
  <script src="js/saisie-presences.js"></script>
  <script src="js/liste-evaluations.js"></script>
  <script src="js/evaluation.js"></script>
  <script src="js/productions.js"></script>
  <script src="js/portfolio.js"></script>
  <script src="js/profil-etudiant.js"></script>  <!-- Après TOUS les modules 
  sources -->

  6.2 Initialisation dans main.js

  Ligne 146-149 de main.js :
  if (typeof initialiserModuleProfilEtudiant === 'function') {
      console.log('   → Module 15-profil-etudiant détecté');
      initialiserModuleProfilEtudiant();
  }

  Priorité : PRIORITÉ 4 (MODULES AVANCÉS)
  - Chargé après les modules sources (trimestre, horaire, productions)
  - Chargé après les modules lecteurs (liste-evaluations)

  6.3 Déclenchement de l'affichage

  Le profil est affiché lorsque l'utilisateur :
  1. Clique sur un étudiant dans Étudiants › Liste
  2. Clique sur un nom dans le Tableau de bord › Liste

  Appel typique :
  // Dans etudiants.js ou tableau-bord-apercu.js
  function afficherProfilEtudiant(da) {
      afficherProfilComplet(da);
  }

  ---
  7. Tests et vérification

  7.1 Vérifier que le module est chargé

  Console navigateur :
  console.log('Module profil-etudiant:', typeof afficherProfilComplet);
  // Attendu: "function"

  console.log('calculerTousLesIndices:', typeof calculerTousLesIndices);
  // Attendu: "function"

  7.2 Tester le calcul des indices

  // Tester le calcul des indices pour un étudiant
  const indices = calculerTousLesIndices('1234567');
  console.log('Indices:', indices);
  // Attendu: {A: 85, C: 78, P: 82, M: 81, E: "0.56", R: "0.44"}

  // Vérifier la cohérence
  console.log('M = (A+C)/2:', (indices.A + indices.C) / 2);
  // Doit être égal à indices.M

  console.log('E = A×C×P:', (indices.A/100) * (indices.C/100) * (indices.P/100));
  // Doit être égal à parseFloat(indices.E)

  console.log('R = 1-E:', 1 - parseFloat(indices.E));
  // Doit être égal à parseFloat(indices.R)

  7.3 Tester l'affichage du profil

  Prérequis :
  1. ✅ Au moins 1 étudiant dans groupeEtudiants
  2. ✅ Au moins 1 présence saisie
  3. ✅ Au moins 1 évaluation créée
  4. ✅ Un portfolio configuré avec artefacts

  Procédure :
  // 1. Aller dans Étudiants › Liste
  // 2. Cliquer sur un étudiant

  // Ou tester via console
  afficherProfilComplet('1234567');

  Résultat attendu :
  - En-tête avec nom, DA, groupe, programme
  - 5 cartes affichées (A, P, M, E, R)
  - Cartes A et P cliquables (curseur pointer)
  - Cartes M, E, R non cliquables
  - Couleurs des cartes selon les seuils (vert >= 85%, jaune >= 70%, rouge < 70%)

  7.4 Tester les détails d'assiduité

  Procédure :
  1. Afficher le profil d'un étudiant
  2. Cliquer sur la carte A (Assiduité)
  3. Vérifier que le panneau de détails s'ouvre
  4. Vérifier les 4 statistiques (heures présentes, offertes, taux, séances)
  5. Vérifier la liste des absences/retards
  6. Cliquer sur une absence
  7. Vérifier la navigation vers Présences › Saisie avec date pré-sélectionnée

  Résultat attendu :
  - Panneau de détails visible
  - Autres cartes grisées (opacity 0.4)
  - Liste des absences triée chronologiquement (plus ancien en premier)
  - Icônes 🔴 (absence complète) et 🟡 (retard)
  - Navigation fonctionnelle

  7.5 Tester les détails du portfolio

  Procédure :
  1. Afficher le profil d'un étudiant
  2. Cliquer sur la carte P (Portfolio)
  3. Vérifier que le panneau de détails s'ouvre
  4. Vérifier les 4 statistiques (artefacts remis, C%, P%, note top 3)
  5. Vérifier la liste des artefacts avec checkboxes
  6. Cocher 1 artefact
  7. Vérifier que l'instruction se met à jour
  8. Cocher jusqu'à N artefacts (ex: 3)
  9. Vérifier que le message passe à "N artefacts sélectionnés ✓"

  Résultat attendu :
  - Panneau de détails visible
  - Artefacts remis affichés en premier
  - Checkboxes activées pour artefacts remis
  - Checkboxes disabled pour artefacts non remis
  - Compteur de sélection mis à jour dynamiquement

  ---
  8. Problèmes connus et solutions

  8.1 Duplication de code avec portfolio.js ⚠️ CRITIQUE

  Symptôme : Fonctions chargerPortfolioDetail() et toggleArtefactPortfolio()
  existent dans les deux modules

  Impact :
  - Maintenance difficile (modifier à 2 endroits)
  - Risque de divergence de comportement
  - Code redondant (+150 lignes dupliquées)

  Causes :
  1. Développement parallèle des modules
  2. Module profil-etudiant.js créé avant portfolio.js
  3. Pas de refactorisation après création de portfolio.js

  Solution recommandée :
  // DANS profil-etudiant.js - SUPPRIMER les fonctions dupliquées
  // REMPLACER par des appels au module portfolio.js

  // Avant (lignes 435-596 et 605-633)
  function chargerPortfolioDetail(da) { ... }
  function toggleArtefactPortfolio(da, portfolioId, nombreARetenir) { ... }

  // Après - UTILISER portfolio.js
  function genererSectionPortfolio(da) {
      // Appeler la fonction de portfolio.js
      if (typeof chargerPortfolioEleveDetail === 'function') {
          return '<div 
  id="portfolioEleveDetail"></div><script>chargerPortfolioEleveDetail("' + da +
  '");</script>';
      }
      return '<p>Module portfolio non chargé</p>';
  }

  ⚠️ ATTENTION : Ne pas supprimer avant de tester la compatibilité avec
  portfolio.js

  ---
  8.2 Fonctions externes manquantes

  Symptôme : Erreurs "fonction not defined" lors du calcul des indices

  Fonctions manquantes :
  1. calculerAssiduitéGlobale(da) - Ligne 82
  2. calculerTauxCompletion(da) - Ligne 85
  3. obtenirDetailsPerformance(da) - Ligne 730

  Causes possibles :
  1. Modules non chargés (saisie-presences.js, liste-evaluations.js)
  2. Fonctions renommées dans les modules sources
  3. Fonctions pas encore implémentées

  Solution :
  // Vérifier si les fonctions existent
  console.log('calculerAssiduitéGlobale:', typeof calculerAssiduitéGlobale);
  console.log('calculerTauxCompletion:', typeof calculerTauxCompletion);

  // Si undefined, vérifier l'ordre de chargement dans index.html
  // Ou ajouter des garde-fous
  function calculerTousLesIndices(da) {
      const A = (typeof calculerAssiduitéGlobale === 'function')
          ? calculerAssiduitéGlobale(da) / 100
          : 0;

      const C = (typeof calculerTauxCompletion === 'function')
          ? calculerTauxCompletion(da) / 100
          : 0;

      // ...
  }

  ---
  8.3 Profil vide affiché

  Symptôme : Dashboard affiché mais tous les indices à 0

  Causes possibles :
  1. Aucune présence saisie → A = 0
  2. Aucune évaluation créée → P = 0
  3. Aucun artefact évalué → C = 0
  4. Fonctions de calcul retournent null/undefined

  Solution :
  // Diagnostic complet
  function diagnosticProfil(da) {
      console.log('=== DIAGNOSTIC PROFIL ===');

      // 1. Étudiant existe?
      const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
      const eleve = etudiants.find(e => e.da === da);
      console.log('Étudiant:', eleve);

      // 2. Présences?
      const presences = JSON.parse(localStorage.getItem('presences') || '[]');
      const presencesEleve = presences.filter(p => p.da === da);
      console.log('Présences:', presencesEleve.length);

      // 3. Évaluations?
      const evaluations =
  JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
      const evalEleve = evaluations.filter(e => e.etudiantDA === da);
      console.log('Évaluations:', evalEleve.length);

      // 4. Calcul des indices
      const indices = calculerTousLesIndices(da);
      console.log('Indices:', indices);

      console.log('=== FIN DIAGNOSTIC ===');
  }

  diagnosticProfil('1234567');

  ---
  8.4 Panneau de détails ne s'ouvre pas

  Symptôme : Clic sur carte A ou P sans effet

  Causes possibles :
  1. Éléments DOM manquants (#panneau-details-indice, #contenu-detail-indice)
  2. Événement onclick pas attaché
  3. Erreur JavaScript bloquante

  Solution :
  // Vérifier les éléments DOM
  console.log('Panneau:', document.getElementById('panneau-details-indice'));
  console.log('Contenu:', document.getElementById('contenu-detail-indice'));

  // Si null, le HTML n'a pas été généré correctement
  // Vérifier que afficherProfilComplet() s'est exécuté sans erreur

  // Vérifier la console pour erreurs JavaScript

  ---
  8.5 Navigation vers Présences ne fonctionne pas

  Symptôme : Clic sur une absence sans effet

  Causes possibles :
  1. Fonction naviguerVersPresenceAvecDate() pas définie
  2. Fonction afficherSection() ou afficherSousSection() non disponible
  3. Input #date-cours introuvable (module saisie-presences.js pas chargé)

  Solution :
  // Vérifier les dépendances
  console.log('afficherSection:', typeof afficherSection);
  console.log('afficherSousSection:', typeof afficherSousSection);
  console.log('Input date-cours:', document.getElementById('date-cours'));

  // Vérifier ordre de chargement dans index.html
  // navigation.js DOIT être chargé avant profil-etudiant.js
  // saisie-presences.js DOIT être chargé (génère #date-cours)

  ---
  9. Règles de modification

  9.1 ⚠️ ZONES PROTÉGÉES - NE PAS MODIFIER

  Noms de fonctions publiques

  initialiserModuleProfilEtudiant()    // Appelée par main.js
  afficherProfilComplet(da)            // Appelée par etudiants.js, 
  tableau-bord-apercu.js
  calculerTousLesIndices(da)           // Utilisée en interne
  toggleDetailIndice(indice, da)       // Appelée par HTML généré
  naviguerVersPresenceAvecDate(date)   // Appelée par HTML généré
  Raison : Références directes dans d'autres modules et HTML

  Variables globales

  indiceActif    // Ligne 791
  Raison : Utilisée par toggleDetailIndice() et fermerDetailIndice()

  Structure du dashboard

  // Grille de 5 colonnes (A-P-M-E-R)
  grid-template-columns: repeat(5, 1fr)
  Raison : Cohérence visuelle avec le reste de l'application

  Formules de calcul des indices

  M = (A + C) / 2        // Mobilisation
  E = A × C × P          // Engagement
  R = 1 - E              // Risque
  Raison : Basées sur le Guide de monitorage (Grégoire Bédard)

  9.2 ✅ ZONES MODIFIABLES

  Seuils de couleur

  Lignes : 136-138
  Modification possible : Ajuster les seuils (actuellement 85% et 70%)

  Messages utilisateur

  Lignes : Multiples (HTML généré)
  Modification possible : Reformuler les instructions, ajouter des explications

  Styles inline

  Lignes : 286-421 (HTML dashboard), 652-720 (HTML assiduité), 912-1054 (HTML
  portfolio)
  Modification possible : Ajuster couleurs, tailles, espacements

  Tri des absences

  Lignes : 214-215
  Modification possible : Changer l'ordre (actuellement chronologique croissant)

  9.3 Workflow de modification recommandé

  AVANT toute modification :
  1. ✅ Commit Git ou backup manuel
  2. ✅ Tester l'affichage actuel (prendre captures d'écran)
  3. ✅ Noter les valeurs des indices actuels

  PENDANT la modification :
  1. ✅ Modifier uniquement les zones autorisées
  2. ✅ Commenter les changements importants
  3. ✅ Respecter le style de code existant
  4. ✅ Tester fréquemment dans le navigateur

  APRÈS la modification :
  1. ✅ Tester avec plusieurs étudiants
  2. ✅ Vérifier que les indices correspondent
  3. ✅ Vérifier la console (aucune erreur)
  4. ✅ Tester toutes les interactions (cartes cliquables, navigation)
  5. ✅ Commit si succès, rollback si problème

  ---
  10. Historique et évolution

  Version actuelle (octobre 2025) ⚠️ EN CONSTRUCTION

  Fonctionnalités implémentées :
  - ✅ Affichage du profil avec en-tête
  - ✅ Dashboard des 5 indices (A-P-M-E-R)
  - ✅ Calcul des indices composites (M, E, R)
  - ✅ Détails d'assiduité cliquables
  - ✅ Détails du portfolio cliquables
  - ✅ Navigation contextuelle vers Présences
  - ✅ Grisage des cartes non actives
  - ✅ Scroll automatique vers panneau de détails

  État du module : ⚠️ Fonctionnel mais avec duplications de code

  Évolution récente (selon commentaires du code)

  Version 5 (lignes 258-260) :
  - Suppression de la carte C (Complétion)
  - Carte P renommée "Portfolio" (affiche Performance)
  - Grille passée de 6 à 5 colonnes
  - Détails du portfolio incluent maintenant C et P

  Version 4 (ligne 245) :
  - Fusion des cartes Performance et Portfolio

  Améliorations techniques urgentes ⚠️

  1. PRIORITÉ 1 : Éliminer la duplication avec portfolio.js
    - Supprimer chargerPortfolioDetail() et toggleArtefactPortfolio()
    - Utiliser exclusivement le module portfolio.js
    - Adapter genererSectionPortfolio() pour appeler portfolio.js
  2. PRIORITÉ 2 : Corriger les dépendances manquantes
    - Documenter clairement les fonctions attendues des modules externes
    - Ajouter des garde-fous si fonctions manquantes
    - Tester l'ordre de chargement
  3. PRIORITÉ 3 : Refactorisation du HTML généré
    - Actuellement : 350+ lignes de template literals
    - Amélioration : Extraire dans des fonctions séparées
    - Exemple : genererCarteDashboard(indice, valeur, couleur)
  4. PRIORITÉ 4 : Ajouter les sections manquantes
    - Détails pour M (Mobilisation)
    - Détails pour E (Engagement)
    - Détails pour R (Risque)
    - Historique d'assiduité avec graphique
    - Graphiques de progression

  Fonctionnalités prévues (lignes 14-17)

  TODO (À développer) :
  - Historique d'assiduité détaillé
  - Indices A-C-P détaillés (avec évolution dans le temps)
  - Graphiques de progression
  - Évaluations détaillées (liste complète)

  Impact sur l'architecture

  Module orchestrateur :
  Ce module joue un rôle central car il agrège les données de TOUS les modules
  sources :
  - saisie-presences.js → Indice A
  - liste-evaluations.js → Indice C
  - evaluation.js → Évaluations
  - portfolio.js → Sélections d'artefacts
  - groupe.js → Informations étudiant

  Dépendance critique :
  Si un module source manque ou est mal initialisé, le profil affichera des
  données incomplètes ou incorrectes.

  ---
  11. Support et ressources

  11.1 Documentation projet

  - CLAUDE.md : Instructions générales, architecture Single Source of Truth
  - structure-modulaire.txt : Vue d'ensemble de tous les modules
  - DOC_saisie-presences.js : Documentation de l'indice A
  - DOC_liste-evaluations.js : Documentation de l'indice C
  - DOC_portfolio.js : Documentation du portfolio et indice P
  - DOC_evaluation.js : Documentation des évaluations

  11.2 Modules liés

  Modules requis (dépendances) :
  - utilitaires.js : echapperHtml()
  - navigation.js : afficherSection(), afficherSousSection()
  - modes.js : obtenirDonneesSelonMode()
  - groupe.js : Génère groupeEtudiants
  - saisie-presences.js : Calcul indice A
  - liste-evaluations.js : Calcul indice C
  - evaluation.js : Génère evaluationsSauvegardees
  - productions.js : Génère listeGrilles
  - portfolio.js : Génère portfoliosEleves

  Modules appelant :
  - etudiants.js : Appelle afficherProfilComplet()
  - tableau-bord-apercu.js : Appelle afficherProfilComplet()

  11.3 Ressources pédagogiques

  Système de monitorage A-C-P :
  - Labo Codex : https://codexnumeris.org/apropos
  - Revue Pédagogie collégiale (printemps-été 2024, hiver 2025)
  - Guide de monitorage complet (Grégoire Bédard)

  Formule de risque :
  Risque = 1 - (A × C × P)

  Interprétation :
  - R < 0.3 : Risque minimal (vert)
  - R 0.3-0.6 : Risque modéré (jaune)
  - R > 0.6 : Risque élevé (rouge)

  Pratiques Alternatives de Notation (PAN) :
  - Indice P basé sur les 3 meilleurs artefacts
  - Philosophie : Évaluer la maîtrise finale plutôt que la moyenne globale
  - Permet à l'étudiant de progresser sans pénalité pour les essais initiaux

  11.4 Débogage et aide

  Script de diagnostic complet :
  function diagnosticProfilComplet(da) {
      console.log('=== DIAGNOSTIC PROFIL COMPLET ===');
      console.log('DA:', da);

      // 1. Vérifier l'étudiant
      const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
      const eleve = etudiants.find(e => e.da === da);
      console.log('1. Étudiant trouvé:', !!eleve, eleve);

      // 2. Vérifier les présences
      const presences = JSON.parse(localStorage.getItem('presences') || '[]');
      const presencesEleve = presences.filter(p => p.da === da);
      const totalHeures = presencesEleve.reduce((sum, p) => sum + (p.heures || 0),
   0);
      console.log('2. Présences:', presencesEleve.length, 'séances,', totalHeures,
   'heures');

      // 3. Vérifier les évaluations
      const evaluations =
  JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
      const evalEleve = evaluations.filter(e => e.etudiantDA === da);
      const evalAvecNote = evalEleve.filter(e => e.noteFinale !== null);
      console.log('3. Évaluations:', evalEleve.length, 'dont',
  evalAvecNote.length, 'avec note');

      // 4. Vérifier le portfolio
      const productions = JSON.parse(localStorage.getItem('listeGrilles') ||
  '[]');
      const portfolio = productions.find(p => p.type === 'portfolio');
      const artefacts = productions.filter(p => p.type === 'artefact-portfolio');
      console.log('4. Portfolio:', !!portfolio, '·', artefacts.length,
  'artefacts');

      // 5. Vérifier les sélections
      const selections = JSON.parse(localStorage.getItem('portfoliosEleves') ||
  '{}');
      const selectionEleve = selections[da]?.[portfolio?.id];
      console.log('5. Sélections:', selectionEleve?.artefactsRetenus.length || 0,
  'artefacts retenus');

      // 6. Calculer les indices
      console.log('6. Calcul des indices...');
      try {
          const indices = calculerTousLesIndices(da);
          console.log('   A (Assiduité):', indices.A, '%');
          console.log('   C (Complétion):', indices.C, '%');
          console.log('   P (Performance):', indices.P, '%');
          console.log('   M (Mobilisation):', indices.M, '%');
          console.log('   E (Engagement):', indices.E);
          console.log('   R (Risque):', indices.R);
      } catch (error) {
          console.error('   ❌ Erreur lors du calcul:', error.message);
      }

      // 7. Vérifier les fonctions externes
      console.log('7. Fonctions externes disponibles:');
      console.log('   calculerAssiduitéGlobale:', typeof
  calculerAssiduitéGlobale);
      console.log('   calculerTauxCompletion:', typeof calculerTauxCompletion);
      console.log('   obtenirDetailsPerformance:', typeof
  obtenirDetailsPerformance);

      console.log('=== FIN DIAGNOSTIC ===');
  }

  // Utilisation
  diagnosticProfilComplet('1234567');

  Réinitialiser l'affichage du profil :
  function reinitialiserProfil() {
      // Fermer le panneau de détails
      fermerDetailIndice();

      // Réinitialiser l'indice actif
      indiceActif = null;

      console.log('Profil réinitialisé');
  }

  reinitialiserProfil();

  11.5 Contact et licence

  Responsable : Grégoire Bédard
  Licence : Creative Commons BY-NC-SA 4.0
  - ✅ Partage et adaptation autorisés (usage non commercial)
  - ✅ Attribution requise
  - ✅ Redistribution sous même licence

  ---
  FIN DE LA DOCUMENTATION - MODULE profil-etudiant.js

  Dernière mise à jour : 23 octobre 2025
  Statut : ⚠️ EN CONSTRUCTION - Duplication de code à nettoyer