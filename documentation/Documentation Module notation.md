Je vais générer la documentation complète pour notation.js.

  ---
  MODULE notation.js

  📚 Documentation technique complète

  ---
  1. Vue d'ensemble

  notation.js gère la configuration des pratiques de notation (sommative vs
  alternative/PAN) et les options d'affichage des indices dans le tableau de bord.
   Ce module est une interface utilisateur pour configurer modalitesEvaluation.

  Lignes de code : 327 lignesVersion : Module NotationFichier : /js/notation.js

  ---
  2. Type de module

  CONFIGURATION/INTERFACE : Module d'interface utilisateur pour la configuration.

  Rôle : Permet à l'enseignant de choisir entre :
  - Pratique sommative : Notes chiffrées traditionnelles (%)
  - Pratique alternative (PAN) : Approches pédagogiques alternatives
    - Maîtrise (Standards-Based Grading)
    - Spécifications (Specifications Grading)
    - Dénotation (Ungrading)

  ---
  3. Données gérées

  3.1 Données générées (SOURCE)

  modalitesEvaluation

  Type : Objet de configurationFormat localStorage : JSON stringifié

  Structure complète :
  {
    pratique: "sommative" | "alternative",
    typePAN: "maitrise" | "specifications" | "denotation" | null,
    affichageTableauBord: {
      afficherSommatif: true,
      afficherAlternatif: false
    },
    dateConfiguration: "2025-10-23T14:30:00.000Z"
  }

  Valeurs possibles :

  Pratique sommative :
  {
    pratique: "sommative",
    typePAN: null,
    affichageTableauBord: {
      afficherSommatif: true,
      afficherAlternatif: false
    },
    dateConfiguration: "2025-10-23T14:30:00.000Z"
  }

  Pratique alternative - Maîtrise :
  {
    pratique: "alternative",
    typePAN: "maitrise",
    affichageTableauBord: {
      afficherSommatif: true,   // Optionnel : pour comparaison
      afficherAlternatif: true  // Calcul selon les N meilleurs
    },
    dateConfiguration: "2025-10-23T14:30:00.000Z"
  }

  Source unique : notation.js (fonction
  sauvegarderConfigurationNotation())Lecteurs :
  - pratiques.js (ancienne interface, doublon fonctionnel)
  - liste-evaluations.js (calcul indice C alternatif)
  - evaluation.js (affichage badge PAN)

  ---
  3.2 Concepts pédagogiques

  A) Pratique sommative

  Description : Notation traditionnelle avec notes chiffrées (0-100%).

  Caractéristiques :
  - Notes en pourcentage
  - Moyenne pondérée des évaluations
  - Indice C sommatif : nbRemis / totalAttendu

  Affichage dans tableau de bord : "C 75%"

  ---
  B) Pratiques alternatives de notation (PAN)

  Maîtrise (Standards-Based Grading)

  Description : Progression par niveaux de maîtrise (I-D-M-E).

  Caractéristiques :
  - Niveaux : Insuffisant, Développement, Maîtrise, Étendu
  - Basé sur la taxonomie SOLO
  - Indice C alternatif : nbMeilleursArtefacts / N

  Exemple : "M" (Maîtrisé) au lieu de "78%"

  ---
  Spécifications (Specifications Grading)

  Description : Critères binaires (réussi/non réussi).

  Caractéristiques :
  - Chaque compétence : réussie ou non
  - Pas de nuances intermédiaires
  - Cumul de compétences acquises

  Exemple : 6 compétences sur 8 acquises

  ---
  Dénotation (Ungrading)

  Description : Sans notes chiffrées, accent sur rétroaction descriptive.

  Caractéristiques :
  - Pas de notes pendant le trimestre
  - Rétroaction qualitative uniquement
  - Autoévaluation encouragée
  - Note finale négociée en fin de session

  Exemple : Commentaires textuels uniquement

  ---
  4. API publique

  4.1 Fonctions d'initialisation

  initialiserModuleNotation()

  Initialise le module au chargement de la page.

  initialiserModuleNotation()

  Fonctionnement :
  1. Attache les événements aux éléments HTML
  2. Charge la configuration existante depuis localStorage
  3. Met à jour l'affichage

  Appelée par : main.js (ligne 42-44 et 106-109)

  ---
  attacherEvenementsNotation()

  Attache les événements aux éléments du formulaire.

  attacherEvenementsNotation()

  Événements attachés :
  - #pratiqueNotation (change) → changerPratiqueNotation()
  - #typePAN (change) → changerTypePAN()
  - #afficherSommatif (change) → sauvegarderOptionsAffichage()
  - #afficherAlternatif (change) → sauvegarderOptionsAffichage()
  - #btnSauvegarderPratiqueNotation (click) → sauvegarderConfigurationNotation()

  ---
  4.2 Fonctions de gestion des changements

  changerPratiqueNotation()

  Gère le changement de pratique de notation.

  changerPratiqueNotation()

  Fonctionnement :

  Si pratique = "alternative" :
  1. Affiche la colonne Type PAN
  2. Affiche les options d'affichage
  3. Coche les deux checkboxes (comparaison)

  Si pratique = "sommative" :
  1. Masque la colonne Type PAN
  2. Affiche les options d'affichage
  3. Coche uniquement "Afficher sommatif"

  Si pratique = "" (vide) :
  1. Masque tout

  Effet : Sauvegarde automatiquement les options

  ---
  changerTypePAN()

  Gère le changement de type PAN et affiche la description.

  changerTypePAN()

  Descriptions affichées :

  {
    'maitrise': 'L\'étudiant·e progresse à travers des niveaux de maîtrise
                 (Ex: En développement, Acquis, Avancé...).
                 En anglais on l\'appelle Standards Based Grading.',

    'specifications': 'L\'étudiant·e doit satisfaire à des critères précis
                       et binaires (réussi/non réussi) pour chaque compétence.
                       En anglais on l\'appelle Specifications Grading.',

    'denotation': 'Approche sans notes chiffrées pendant le trimestre.
                   L\'accent est mis sur la rétroaction descriptive
                   et l\'autoévaluation. En anglais on l\'appelle Ungrading.'
  }

  Effet : Affiche la description dans #infoPAN

  ---
  4.3 Fonctions de sauvegarde et chargement

  sauvegarderOptionsAffichage()

  Sauvegarde les options d'affichage des indices.

  sauvegarderOptionsAffichage()

  Fonctionnement :
  1. Récupère l'état des checkboxes
  2. Valide qu'au moins une est cochée
  3. Met à jour config.affichageTableauBord
  4. Sauvegarde dans modalitesEvaluation

  Protection : Impossible de décocher les deux (alerte + ré-coche sommatif)

  Appelée par :
  - onChange des checkboxes
  - changerPratiqueNotation() (automatique)

  ---
  sauvegarderConfigurationNotation()

  Sauvegarde la configuration complète.

  sauvegarderConfigurationNotation()

  Fonctionnement :
  1. Récupère les valeurs du formulaire
  2. Valide que pratique est sélectionnée
  3. Si alternative, valide que typePAN est sélectionné
  4. Construit l'objet de configuration
  5. Sauvegarde dans localStorage
  6. Affiche notification de succès
  7. Met à jour le statut

  Validations :
  - Pratique obligatoire
  - Si alternative → typePAN obligatoire

  Appelée par : Click sur "Sauvegarder"

  ---
  chargerConfigurationNotation()

  Charge la configuration existante depuis localStorage.

  chargerConfigurationNotation()

  Fonctionnement :
  1. Récupère modalitesEvaluation
  2. Si vide, réinitialise l'interface
  3. Remplit les selects avec les valeurs
  4. Affiche/masque les sections selon la pratique
  5. Charge les checkboxes d'affichage
  6. Met à jour le statut

  Appelée par : initialiserModuleNotation() au chargement

  ---
  4.4 Fonctions utilitaires

  obtenirConfigurationNotation()

  Récupère la configuration depuis localStorage.

  const config = obtenirConfigurationNotation()
  // Retourne : {pratique, typePAN, affichageTableauBord, dateConfiguration}

  Retour : Objet de configuration (ou {} si vide)

  Exportée via : window.ModuleNotation.obtenir

  ---
  mettreAJourStatutConfiguration()

  Met à jour le statut de configuration affiché.

  mettreAJourStatutConfiguration()

  Statuts possibles :
  - ✗ À configurer (rouge) : Aucune pratique sélectionnée
  - ⚠ Incomplet (orange) : Alternative sans typePAN
  - ✓ Configuré (vert) : Configuration complète

  Affichage : Élément #statutModalites

  ---
  afficherNotification(message, type)

  Affiche une notification temporaire.

  afficherNotification('Configuration sauvegardée !', 'succes')

  Paramètres :
  - message (string) : Message à afficher
  - type (string) : 'info' ou 'succes'

  Fonctionnement :
  1. Cherche fonction globale afficherNotificationGlobale()
  2. Si existe, l'utilise
  3. Sinon, crée une notification simple (position fixed, top-right)
  4. Disparaît après 3 secondes

  ---
  5. Dépendances

  5.1 Modules requis (doivent être chargés AVANT)

  Aucune dépendance critique : Module autonome.

  Optionnel :
  - Fonction globale afficherNotificationGlobale() (si disponible)

  ---
  5.2 Modules qui utilisent notation.js

  liste-evaluations.js      Lit modalitesEvaluation pour calcul C alternatif
  evaluation.js             Lit modalitesEvaluation pour badge PAN
  tableau-bord-apercu.js    Lit modalitesEvaluation pour affichage indices
  pratiques.js              Doublon fonctionnel (ancienne interface)

  ---
  5.3 Éléments HTML requis

  <!-- Sélecteur pratique -->
  <select id="pratiqueNotation">
    <option value="">-- Choisir --</option>
    <option value="sommative">Sommative</option>
    <option value="alternative">Alternative (PAN)</option>
  </select>

  <!-- Colonne Type PAN (masquée par défaut) -->
  <div id="colonnePAN" style="display: none;">
    <select id="typePAN">
      <option value="">-- Choisir --</option>
      <option value="maitrise">Maîtrise</option>
      <option value="specifications">Spécifications</option>
      <option value="denotation">Dénotation</option>
    </select>
    <div id="infoPAN" style="display: none;"></div>
  </div>

  <!-- Options d'affichage (masquées par défaut) -->
  <div id="optionsAffichageIndices" style="display: none;">
    <label>
      <input type="checkbox" id="afficherSommatif" checked>
      Afficher sommatif
    </label>
    <label>
      <input type="checkbox" id="afficherAlternatif">
      Afficher alternatif (PAN)
    </label>
  </div>

  <!-- Statut -->
  <div id="statutModalites"></div>

  <!-- Bouton sauvegarder -->
  <button id="btnSauvegarderPratiqueNotation">Sauvegarder</button>

  ---
  6. Initialisation

  Ordre de chargement dans index.html

  <script src="js/config.js"></script>
  <!-- ... autres modules ... -->
  <script src="js/notation.js"></script>
  <script src="js/main.js"></script>

  Appel dans main.js

  // Initialiser le module Notation
  if (typeof initialiserModuleNotation === 'function') {
      initialiserModuleNotation();
  }

  Note : Le module est initialisé deux fois dans main.js (lignes 42-44 et 106-109)
   - code dupliqué.

  Vérification de l'initialisation

  // Console navigateur
  console.log('Module Notation:', typeof initialiserModuleNotation)
  // Retour attendu : 'function'

  console.log('API:', window.ModuleNotation)
  // Retour attendu : {obtenir: function, initialiser: function}

  const config = JSON.parse(localStorage.getItem('modalitesEvaluation'))
  console.log('Config:', config)
  // Retour attendu : {pratique, typePAN, affichageTableauBord, dateConfiguration}

  ---
  7. Tests et vérification

  Test 1 : Configuration pratique sommative

  ÉTAPES :
  1. Aller dans Réglages → Pratiques de notation (ou section équivalente)
  2. Sélectionner "Sommative"
  3. Vérifier que :
     - La colonne Type PAN se masque
     - Les options d'affichage s'affichent
     - "Afficher sommatif" est coché
     - "Afficher alternatif" est décoché
  4. Cliquer "Sauvegarder"
  5. Vérifier la notification de succès
  6. Vérifier le statut : "✓ Configuré" (vert)

  VÉRIFICATION :
  const config = JSON.parse(localStorage.getItem('modalitesEvaluation'))
  console.log(config)
  // Attendu :
  // {
  //   pratique: "sommative",
  //   typePAN: null,
  //   affichageTableauBord: {afficherSommatif: true, afficherAlternatif: false},
  //   dateConfiguration: "..."
  // }

  Test 2 : Configuration pratique alternative (Maîtrise)

  ÉTAPES :
  1. Sélectionner "Alternative (PAN)"
  2. Vérifier que :
     - La colonne Type PAN s'affiche
     - Les deux checkboxes sont cochées
  3. Sélectionner "Maîtrise"
  4. Vérifier que la description s'affiche dans #infoPAN
  5. Cliquer "Sauvegarder"
  6. Recharger la page
  7. Vérifier que la configuration est restaurée

  VÉRIFICATION :
  const config = JSON.parse(localStorage.getItem('modalitesEvaluation'))
  console.log(config)
  // Attendu :
  // {
  //   pratique: "alternative",
  //   typePAN: "maitrise",
  //   affichageTableauBord: {afficherSommatif: true, afficherAlternatif: true},
  //   dateConfiguration: "..."
  // }

  Test 3 : Validation - Au moins une checkbox cochée

  ÉTAPES :
  1. Configurer une pratique (sommative ou alternative)
  2. Cocher les deux checkboxes
  3. Décocher "Afficher sommatif"
  4. Décocher "Afficher alternatif"
  5. Vérifier l'alerte : "Au moins un type d'affichage doit être activé !"
  6. Vérifier que "Afficher sommatif" est recoché automatiquement

  VÉRIFICATION :
  // Impossible d'avoir les deux décochées

  Test 4 : Validation - Type PAN obligatoire si alternative

  ÉTAPES :
  1. Sélectionner "Alternative (PAN)"
  2. Ne PAS sélectionner de type PAN
  3. Cliquer "Sauvegarder"
  4. Vérifier l'alerte : "Veuillez choisir un type de pratique alternative"

  VÉRIFICATION :
  // Sauvegarde bloquée si typePAN vide en mode alternative

  Test 5 : Statut de configuration

  ÉTAPES :
  1. Vider la configuration :
     localStorage.removeItem('modalitesEvaluation')
     location.reload()
  2. Vérifier le statut : "✗ À configurer" (rouge)
  3. Sélectionner "Alternative (PAN)" SANS type PAN
  4. Vérifier le statut : "⚠ Incomplet" (orange)
  5. Sélectionner "Maîtrise"
  6. Cliquer "Sauvegarder"
  7. Vérifier le statut : "✓ Configuré" (vert)

  VÉRIFICATION :
  // Statut évolue selon la complétude de la configuration

  Test 6 : Impact sur liste des évaluations

  ÉTAPES :
  1. Configurer "Alternative (PAN)" avec "Maîtrise"
  2. Cocher les deux checkboxes
  3. Sauvegarder
  4. Aller dans Évaluations → Liste
  5. Vérifier l'affichage du badge C
  6. Attendu : "C 75% / 80%" (sommatif / alternatif)

  7. Retourner dans Pratiques de notation
  8. Décocher "Afficher sommatif"
  9. Aller dans Évaluations → Liste
  10. Vérifier l'affichage du badge C
  11. Attendu : "C (PAN) 80%" (alternatif seulement)

  VÉRIFICATION :
  // Le badge C dans la liste des évaluations s'adapte aux réglages

  ---
  8. Problèmes connus et solutions

  Problème 1 : Module initialisé deux fois

  Symptôme : Dans main.js, initialiserModuleNotation() est appelée deux fois
  (lignes 42-44 et 106-109).

  Impact : Événements attachés deux fois (possibilité de double sauvegarde).

  Solution : Supprimer un des deux appels dans main.js.

  // main.js - GARDER SEULEMENT UNE VERSION

  // Option 1 : Ligne 42-44 (bloc initial)
  if (typeof initialiserModuleNotation === 'function') {
      initialiserModuleNotation();
  }

  // Option 2 : Lignes 106-109 (bloc PRIORITÉ 2)
  // → SUPPRIMER ce doublon

  ---
  Problème 2 : Doublon fonctionnel avec pratiques.js

  Symptôme : Deux modules gèrent la même configuration (modalitesEvaluation).

  Modules :
  - notation.js (ce module)
  - pratiques.js (module 12)

  Impact : Confusion, possibilité de divergence entre les deux interfaces.

  Solution :
  - Court terme : Utiliser un seul module (notation.js est plus simple)
  - Long terme : Fusionner les deux modules ou désactiver pratiques.js

  Vérification :
  // Lister les modules qui gèrent modalitesEvaluation
  console.log('notation.js:', typeof initialiserModuleNotation)
  console.log('pratiques.js:', typeof initialiserModulePratiques)

  // Choisir lequel utiliser selon l'interface HTML disponible

  ---
  Problème 3 : Configuration perdue après nettoyage localStorage

  Symptôme : Après un nettoyage du localStorage, la configuration doit être
  refaite.

  Cause : Pas de valeur par défaut, modalitesEvaluation vide.

  Solution : Définir une configuration par défaut lors de la première utilisation.

  // Ajouter dans initialiserModuleNotation()
  function initialiserModuleNotation() {
      console.log('📋 Initialisation du module Notation...');

      // Vérifier si configuration existe
      const config = obtenirConfigurationNotation();
      if (!config.pratique) {
          // Définir configuration par défaut
          const configDefaut = {
              pratique: "sommative",
              typePAN: null,
              affichageTableauBord: {
                  afficherSommatif: true,
                  afficherAlternatif: false
              },
              dateConfiguration: new Date().toISOString()
          };
          localStorage.setItem('modalitesEvaluation',
  JSON.stringify(configDefaut));
      }

      // Suite du code...
  }

  ---
  Problème 4 : Notification ne s'affiche pas

  Symptôme : Après sauvegarde, aucune notification visible.

  Cause : Fonction globale afficherNotificationGlobale() introuvable ET styles CSS
   manquants pour notification simple.

  Solution : Ajouter les styles CSS pour l'animation.

  /* Ajouter dans styles.css */
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  ---
  Problème 5 : Statut reste "✗ À configurer" malgré configuration

  Symptôme : Le statut ne se met pas à jour en vert après sauvegarde.

  Cause : Élément #statutModalites introuvable dans le HTML.

  Solution : Vérifier la présence de l'élément.

  // Console navigateur
  console.log('Élément statut:', document.getElementById('statutModalites'))
  // Si null, ajouter l'élément dans le HTML

  HTML requis :
  <div id="statutModalites"></div>

  ---
  9. Règles de modification

  ⚠️ ZONES PROTÉGÉES - NE PAS MODIFIER

  1. Structure de modalitesEvaluation (lignes 183-191)
    - Utilisée par liste-evaluations.js et evaluation.js
    - Toute modification affecte le calcul de l'indice C alternatif
  2. Valeurs des pratiques (ligne 69, 184-185)
    - 'sommative' et 'alternative'
    - Référencées dans d'autres modules
  3. Valeurs des types PAN (ligne 112, 185)
    - 'maitrise', 'specifications', 'denotation'
    - Cohérence avec les descriptions (lignes 115-119)
  4. Fonction obtenirConfigurationNotation() (lignes 262-264)
    - Exportée via window.ModuleNotation.obtenir
    - Utilisée par d'autres modules
  5. Validation "au moins une checkbox" (lignes 143-147)
    - Empêche incohérence (aucun indice affiché)

  ---
  ✅ Zones modifiables

  1. Descriptions des types PAN (lignes 115-119)
    - Personnaliser les textes explicatifs
    - Ajouter des liens vers documentation
  2. Messages de validation (lignes 144, 173, 178)
    - Adapter le ton
    - Traduire en anglais
  3. Styles de la notification (lignes 299-310)
    - Personnaliser couleurs, position, durée
    - Animation
  4. Statuts affichés (lignes 274, 279, 283)
    - Modifier icônes, couleurs, textes
  5. Configuration par défaut :
    - Ajouter une valeur par défaut (sommative)
    - Pré-cocher les options selon les préférences

  ---
  🛠️ Pour ajouter un nouveau type PAN

  Exemple : Ajouter "Portfolio" comme type PAN

  // 1. Ajouter dans les descriptions (ligne 115)
  const descriptions = {
    'maitrise': '...',
    'specifications': '...',
    'denotation': '...',
    'portfolio': 'Évaluation par portfolio cumulatif. Les artefacts sont 
  sélectionnés et réfléchis par l\'étudiant·e.'
  };

  // 2. Ajouter l'option dans le HTML
  <select id="typePAN">
    <option value="">-- Choisir --</option>
    <option value="maitrise">Maîtrise</option>
    <option value="specifications">Spécifications</option>
    <option value="denotation">Dénotation</option>
    <option value="portfolio">Portfolio</option>
  </select>

  // 3. Adapter les modules lecteurs (liste-evaluations.js, evaluation.js)
  // pour gérer le nouveau type si nécessaire

  ---
  10. Historique

  Version actuelle (Module Notation)

  État : ✅ FonctionnelDernière modification : Interface complète de configuration
   des pratiques

  Fonctionnalités complétées :
  - Configuration pratique sommative/alternative
  - Sélection type PAN (maîtrise, spécifications, dénotation)
  - Options d'affichage (sommatif/alternatif)
  - Validation des champs obligatoires
  - Sauvegarde dans modalitesEvaluation
  - Chargement de la configuration au démarrage
  - Statut de configuration visuel
  - Notifications de succès

  Bugs connus :
  - Initialisation dupliquée dans main.js (lignes 42-44 et 106-109)
  - Doublon fonctionnel avec pratiques.js (gèrent la même donnée)

  Améliorations possibles :
  - Fusionner avec pratiques.js ou désactiver l'un des deux
  - Ajouter configuration par défaut
  - Ajouter aide contextuelle (tooltips, liens vers documentation)
  - Exporter/importer configuration
  - Historique des changements de configuration

  ---
  11. Support et ressources

  Documentation pédagogique

  - Standards-Based Grading : Linda Nilson (2014), "Specifications Grading"
  - Ungrading : Susan D. Blum (2020), "Ungrading: Why Rating Students Undermines
  Learning"
  - Guide de monitorage : https://codexnumeris.org/apropos

  Fichiers de référence

  CLAUDE.md                    Concepts PAN et monitorage
  structure-modulaire.txt      Architecture complète
  pratiques.js                 Module doublon (à fusionner)

  Modules connexes à consulter

  pratiques.js              Doublon fonctionnel (ancienne interface)
  liste-evaluations.js      Utilise modalitesEvaluation pour calcul C alternatif
  evaluation.js             Utilise modalitesEvaluation pour badge PAN
  tableau-bord-apercu.js    Utilise modalitesEvaluation pour affichage indices

  Debug dans la console

  // Vérifier la configuration
  const config = JSON.parse(localStorage.getItem('modalitesEvaluation'))
  console.log('Configuration:', config)

  // Tester la sauvegarde
  sauvegarderConfigurationNotation()

  // Tester le chargement
  chargerConfigurationNotation()

  // Vérifier l'API exportée
  console.log('API Module Notation:', window.ModuleNotation)
  console.log('Config via API:', window.ModuleNotation.obtenir())

  // Forcer un changement de pratique
  document.getElementById('pratiqueNotation').value = 'alternative'
  changerPratiqueNotation()

  // Vérifier le statut
  mettreAJourStatutConfiguration()

  ---
  📌 Note importante : Ce module gère la configuration pédagogique centrale qui
  affecte le calcul des indices C (Complétion) et l'affichage dans tout le
  système. Il existe un doublon fonctionnel avec pratiques.js qui devrait être
  résolu (fusion ou désactivation d'un des deux modules).

  ---
  Fin de la documentation notation.js