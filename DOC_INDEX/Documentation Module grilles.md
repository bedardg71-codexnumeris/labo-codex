Voici la documentation technique complète du module grilles.js :

  ---
  Module grilles.js

  Vue d'ensemble

  Module SOURCE qui gère les grilles de critères d'évaluation utilisées pour
  évaluer les productions étudiantes.

  ⚠️ MODULE STRICTEMENT PROTÉGÉ : Interdiction de modifier les noms de fonctions,
  identifiants HTML et clés localStorage. Seuls les commentaires peuvent être
  modifiés.

  Responsabilités :
  - Création de grilles : Définir des grilles de critères réutilisables (ex:
  SRPNF)
  - Gestion des critères : Ajout, modification, suppression de critères
  - Types de critères : Holistique (jugement global), Analytique (points par
  élément), Algorithmique (calcul auto)
  - Pondération : Calcul et validation du total (doit = 100%)
  - Duplication : Créer des copies de grilles existantes
  - Verrouillage : Protéger des critères contre la modification
  - Modal de gestion : Afficher toutes les grilles disponibles

  Principe fondamental : Ce module est une SOURCE. Il génère et stocke
  grillesTemplates dans localStorage, qui est ensuite utilisé par les modules
  d'évaluation.

  Type

  - SOURCE - Génère et stocke les grilles de critères
  - LECTEUR - Lit et affiche des données
  - CONFIGURATION - Définit constantes et variables globales
  - SYSTÈME - Gestion de la navigation et de l'état de l'interface
  - INITIALISATION - Point d'entrée et orchestration du démarrage

  Données gérées

  Stockage localStorage (ÉCRITURE)

  grillesTemplates (LA SOURCE)
  - Clé : grillesTemplates
  - Format : Array de grilles
  - Structure : Array<{ id, nom, criteres[], dateCreation, dateModification, 
  baseSur }>

  Exemple :
  [
    {
      "id": "GRILLE1698765432000",
      "nom": "Grille SRPNF",
      "criteres": [
        {
          "id": "CR1698765432001",
          "nom": "Structure",
          "description": "Organisation logique des idées",
          "ponderation": 15,
          "type": "holistique",
          "formule": "",
          "verrouille": false
        },
        {
          "nom": "Rigueur",
          "ponderation": 20,
          "type": "analytique",
          "verrouille": false
        }
      ],
      "dateCreation": "2025-10-23T10:00:00.000Z",
      "dateModification": "2025-10-23T14:30:00.000Z",
      "baseSur": null
    }
  ]

  Variables globales du module

  critereEnEdition (variable locale)
  - Type : String | null
  - Usage : ID du critère en cours de modification (null = création)

  window.tempCriteres (temporaire)
  - Type : Array
  - Usage : Stockage temporaire des critères lors de la création d'une nouvelle
  grille (avant première sauvegarde)

  Variables lues (depuis config.js)

  grilleTemplateActuelle
  - Définie dans : config.js
  - Modifiée par : Ce module
  - Usage : Grille actuellement en édition

  API publique

  Initialisation

  initialiserModuleGrilles()
  Description : Initialise le module de gestion des grilles. Appelée par main.js.

  Paramètres : Aucun

  Retour : void

  Séquence :
  1. Log de démarrage
  2. Charge la liste des grilles via chargerListeGrillesTemplates()
  3. Vérifie si sous-section grilles active
  4. Log de succès

  Utilisation :
  // Appelée automatiquement par main.js
  initialiserModuleGrilles();

  Gestion des grilles

  chargerListeGrillesTemplates()
  Description : Charge la liste des grilles dans le sélecteur <select>.

  Paramètres : Aucun

  Retour : void

  HTML généré :
  <option value="">-- Nouvelle grille --</option>
  <option value="new">➕ Créer une nouvelle grille</option>
  <option value="GRILLE123">Grille SRPNF</option>
  <option value="GRILLE456">Grille Sciences</option>

  chargerGrilleTemplate()
  Description : Charge une grille pour édition ou crée une nouvelle.

  Paramètres : Aucun (lit depuis #selectGrilleTemplate)

  Retour : void

  Modes :
  1. Vide ou "new" : Mode création
    - Affiche champ nom
    - Cache bouton dupliquer
    - Initialise tempCriteres = []
  2. ID existant : Mode édition
    - Charge la grille
    - Affiche ses critères
    - Affiche bouton dupliquer

  sauvegarderGrilleTemplate(silencieux = false)
  Description : FONCTION CENTRALE. Sauvegarde la grille complète dans
  localStorage.

  Paramètres :
  - silencieux (Boolean) : Si true, pas de notification

  Retour : void

  Logique :
  1. Valide le nom de la grille
  2. Si grilleTemplateActuelle existe : Modification
    - Met à jour nom et dateModification
    - Remplace dans le tableau
  3. Sinon : Création
    - Génère nouvel ID
    - Copie tempCriteres dans criteres
    - Ajoute au tableau
    - Nettoie tempCriteres
  4. Sauvegarde dans localStorage
  5. Recharge le select
  6. Affiche notification si pas silencieux

  Utilisation :
  // Sauvegarde normale (avec notification)
  sauvegarderGrilleTemplate();

  // Sauvegarde silencieuse (après chaque critère)
  sauvegarderGrilleTemplate(true);

  Gestion des critères

  afficherFormCritere(id = null)
  Description : Affiche et configure le formulaire d'ajout/modification de
  critère.

  Paramètres :
  - id (String | null) : ID du critère à modifier (null = création)

  Retour : void

  Modes :
  1. id = null : Mode ajout
    - Vide les champs
    - Bouton "Ajouter et continuer"
  2. id fourni : Mode édition
    - Charge les données du critère
    - Remplit les champs
    - Bouton "Sauvegarder"

  sauvegarderCritere()
  Description : FONCTION CENTRALE. Sauvegarde un critère dans la grille.

  Paramètres : Aucun (lit depuis le formulaire)

  Retour : void

  Validations :
  - Nom du critère obligatoire
  - Nom de la grille obligatoire

  Logique :
  1. Crée l'objet critère depuis les champs
  2. Si grilleTemplateActuelle existe :
    - Mode édition : Remplace le critère existant
    - Mode ajout : Génère ID et ajoute à criteres[]
    - Appelle sauvegarderGrilleTemplate(true) (silencieux)
  3. Sinon (nouvelle grille) :
    - Ajoute à window.tempCriteres
  4. Rafraîchit l'affichage
  5. Réinitialise le formulaire
  6. Affiche notification

  Structure critère créé :
  {
    nom: "Structure",
    description: "Organisation logique...",
    ponderation: 15,
    type: "holistique",
    formule: "",
    verrouille: false,
    id: "CR1698765432001"  // Généré si nouveau
  }

  sauvegarderEtFermer()
  Description : Sauvegarde un critère et ferme le formulaire.

  Paramètres : Aucun

  Retour : void

  Séquence : Appelle sauvegarderCritere() puis annulerAjoutCritere() après 500ms

  modifierCritere(id)
  Description : Lance la modification d'un critère existant.

  Paramètres :
  - id (String) : ID du critère

  Retour : void

  Validations :
  - Grille active requise
  - Critère ne doit pas être verrouillé

  supprimerCritere(id)
  Description : Supprime un critère après confirmation.

  Paramètres :
  - id (String) : ID du critère

  Retour : void

  Validations :
  - Grille active requise
  - Critère ne doit pas être verrouillé
  - Confirmation utilisateur

  annulerAjoutCritere()
  Description : Ferme le formulaire de critère.

  Paramètres : Aucun

  Retour : void

  Affichage

  afficherListeCriteres(criteres, grilleId)
  Description : Affiche la liste complète des critères d'une grille.

  Paramètres :
  - criteres (Array) : Liste des critères
  - grilleId (String | null) : ID de la grille

  Retour : void

  Génère :
  - Carte par critère avec nom, description, pondération, type
  - Boutons Modifier/Supprimer
  - Checkbox verrouillage (🔒)
  - Total pondération et statut

  afficherGrillesCriteres()
  Description : Affiche le modal avec toutes les grilles disponibles.

  Paramètres : Aucun

  Retour : void

  Génère :
  - Liste de toutes les grilles
  - Informations (nombre critères, pondération totale)
  - Boutons Utiliser/Dupliquer/Supprimer
  - <details> pour voir les critères de chaque grille

  Duplication

  dupliquerGrille(grilleId)
  Description : Duplique une grille existante depuis le modal.

  Paramètres :
  - grilleId (String) : ID de la grille à dupliquer

  Retour : void

  Séquence :
  1. Trouve la grille originale
  2. Demande nouveau nom via prompt()
  3. Crée copie avec nouveaux IDs pour critères
  4. Ajoute champ baseSur avec nom original
  5. Sauvegarde
  6. Charge la nouvelle grille en édition

  dupliquerGrilleActuelle()
  Description : Duplique la grille actuellement en édition.

  Paramètres : Aucun

  Retour : void

  Validation : Grille active requise

  Verrouillage

  basculerVerrouillageCritere(critereId)
  Description : Verrouille ou déverrouille un critère.

  Paramètres :
  - critereId (String) : ID du critère

  Retour : void

  Effet :
  - Critère verrouillé : Boutons Modifier/Supprimer désactivés
  - Empêche modification accidentelle

  Modal

  fermerModalGrilles()
  Description : Ferme le modal des grilles existantes.

  Paramètres : Aucun

  Retour : void

  chargerGrilleEnEdition(grilleId)
  Description : Charge une grille pour édition depuis le modal.

  Paramètres :
  - grilleId (String) : ID de la grille

  Retour : void

  Séquence :
  1. Trouve la grille
  2. Met à jour le select
  3. Appelle chargerGrilleTemplate()
  4. Ferme le modal

  supprimerGrille(grilleId)
  Description : Supprime une grille après confirmation.

  Paramètres :
  - grilleId (String) : ID de la grille

  Retour : void

  Utilitaires

  getTypeCritereLabel(type)
  Description : Convertit un code de type en libellé lisible.

  Paramètres :
  - type (String) : Code du type

  Retour : (String) Libellé

  Mapping :
  - 'holistique' → 'Holistique'
  - 'analytique' → 'Analytique'
  - 'algorithmique' → 'Algorithmique'

  calculerTotalPonderationCriteres(criteres)
  Description : Calcule la pondération totale et met à jour l'affichage avec
  statut coloré.

  Paramètres :
  - criteres (Array) : Liste des critères

  Retour : void

  Statuts :
  - = 100% : Vert "✓ Pondération complète"
  - < 100% : Orange "X% manquant"
  - > 100% : Rouge "X% en trop"

  afficherChampFormule()
  Description : Affiche ou masque le champ formule selon le type de critère.

  Paramètres : Aucun (lit depuis #critereType)

  Retour : void

  Logique :
  - Type = "algorithmique" → Affiche champ formule
  - Autres types → Masque champ formule

  sauvegarderNomGrille()
  Description : Sauvegarde automatique quand le nom de la grille change.

  Paramètres : Aucun

  Retour : void

  Appelle : sauvegarderGrilleTemplate(true) (silencieux)

  enregistrerCommeGrille()
  Description : Alias de sauvegarde pour compatibilité.

  Paramètres : Aucun

  Retour : void

  Appelle : sauvegarderGrilleTemplate() + initialiserEvaluationsIndividuelles()
  (si disponible)

  Dépendances

  Lit depuis (localStorage) :
  - grillesTemplates (lecture/écriture)

  Modifie (variables globales config.js) :
  - grilleTemplateActuelle

  Appelle (fonctions externes) :
  - afficherNotificationSucces() depuis utilitaires.js (optionnel)
  - afficherNotificationErreur() depuis utilitaires.js (optionnel)
  - initialiserEvaluationsIndividuelles() (optionnel, depuis module évaluations)

  Utilisé par :
  - Module productions (associe grilles aux productions)
  - Modules d'évaluation (utilisent grilles pour évaluer)
  - Interface utilisateur (section "Réglages › Grilles de critères")

  Modules requis (chargement avant) :
  - config.js - Variables globales (grilleTemplateActuelle)
  - navigation.js - Fonctions de navigation

  Initialisation

  Fonction : initialiserModuleGrilles()

  Appelée depuis : main.js (ligne 82-85) - PRIORITÉ 2

  Ordre de chargement : Module n°5 dans main.js

  Conditions d'initialisation :
  - Élément DOM #selectGrilleTemplate doit exister
  - Section "Réglages › Grilles de critères" (optionnel pour chargement initial)

  Types de critères

  1. Holistique (Jugement global)

  Description : L'évaluateur porte un jugement global sur le critère

  Usage : Critères qualitatifs difficiles à décomposer

  Exemple : "Cohérence générale du travail"

  Évaluation : Échelle continue ou discrète (ex: IDME)

  2. Analytique (Points par élément)

  Description : Le critère est décomposé en éléments, chacun valant des points

  Usage : Critères décomposables en sous-éléments

  Exemple : "Présence de 5 éléments requis" (1 point par élément)

  Évaluation : Somme des points obtenus

  3. Algorithmique (Calcul automatique)

  Description : Le critère est calculé automatiquement par une formule

  Usage : Critères quantitatifs (ex: nombre de mots, présence d'éléments)

  Exemple : "Nombre de références (min 5)" → Formule: MIN(nbRefs / 5, 1) × 100

  Évaluation : Résultat du calcul

  Champ supplémentaire : Formule (texte libre, interprété par le module
  d'évaluation)

  Workflow de création de grille

  Scénario 1 : Création d'une nouvelle grille

  1. Sélectionner "-- Nouvelle grille --" ou "➕ Créer"
     → chargerGrilleTemplate()
     → Mode création activé

  2. Saisir nom de grille
     → Input #nomGrilleTemplate

  3. Cliquer "+ Ajouter un critère"
     → afficherFormCritere(null)
     → Formulaire affiché

  4. Remplir champs critère
     - Nom: "Structure"
     - Pondération: 15
     - Type: "Holistique"
     - Description: "..."

  5. Cliquer "Ajouter et continuer"
     → sauvegarderCritere()
     → Critère ajouté à tempCriteres
     → Grille sauvegardée automatiquement (première fois)
     → grilleTemplateActuelle créée
     → Formulaire réinitialisé

  6. Répéter étapes 3-5 pour autres critères

  7. Total pondération affichée
     → calculerTotalPonderationCriteres()
     → Statut coloré (vert si 100%)

  8. Grille automatiquement sauvegardée après chaque critère

  Scénario 2 : Modification d'une grille existante

  1. Sélectionner grille dans le select
     → chargerGrilleTemplate()
     → Critères affichés
     → Bouton "Dupliquer" visible

  2. Cliquer "Modifier" sur un critère
     → modifierCritere(id)
     → afficherFormCritere(id)
     → Champs pré-remplis

  3. Modifier valeurs

  4. Cliquer "Sauvegarder"
     → sauvegarderCritere()
     → Critère modifié
     → Grille sauvegardée automatiquement

  5. Ou cliquer "Supprimer"
     → supprimerCritere(id)
     → Confirmation demandée
     → Critère retiré
     → Grille sauvegardée

  Scénario 3 : Duplication d'une grille

  1. Méthode A - Depuis le select :
     - Sélectionner grille
     - Cliquer "Dupliquer cette grille"
     → dupliquerGrilleActuelle()

  2. Méthode B - Depuis le modal :
     - Cliquer "Voir les grilles existantes"
     - Cliquer "Dupliquer" sur une grille
     → dupliquerGrille(id)

  3. Saisir nom de la nouvelle grille
     → prompt()

  4. Nouvelle grille créée
     - Nouveaux IDs générés
     - Champ baseSur = nom original
     - Chargée automatiquement en édition

  Structure HTML requise

  Select des grilles

  <select id="selectGrilleTemplate" onchange="chargerGrilleTemplate()">
      <!-- Généré dynamiquement -->
  </select>

  Conteneur nom de grille

  <div id="nomGrilleContainer" style="display: none;">
      <label>Nom de la grille</label>
      <input type="text" id="nomGrilleTemplate" onchange="sauvegarderNomGrille()">
  </div>

  Bouton dupliquer

  <button id="btnDupliquerGrille" onclick="dupliquerGrilleActuelle()" 
  style="display: none;">
      Dupliquer cette grille
  </button>

  Conteneur critères

  <div id="criteresContainer" style="display: none;">
      <div id="listeCriteres">
          <!-- Généré dynamiquement -->
      </div>

      <button id="btnAjouterCritere" onclick="afficherFormCritere()">
          + Ajouter un critère
      </button>

      <form id="formAjoutCritere" style="display: none;">
          <input type="text" id="critereNom" placeholder="Nom du critère">
          <textarea id="critereDescription" placeholder="Description"></textarea>
          <input type="number" id="criterePonderation" min="0" max="100">
          <select id="critereType" onchange="afficherChampFormule()">
              <option value="holistique">Holistique</option>
              <option value="analytique">Analytique</option>
              <option value="algorithmique">Algorithmique</option>
          </select>
          <div id="champFormule" style="display: none;">
              <input type="text" id="critereFormule" placeholder="Formule">
          </div>
          <button type="button" onclick="sauvegarderCritere()" 
  id="btnTexteCritere">
              Ajouter et continuer
          </button>
          <button type="button" onclick="sauvegarderEtFermer()">
              Ajouter et fermer
          </button>
          <button type="button" onclick="annulerAjoutCritere()">
              Fermer
          </button>
      </form>

      <div>
          Total pondération: <span id="totalPonderationCriteres">0%</span>
          <span id="statutPonderationCriteres"></span>
      </div>
  </div>

  Modal des grilles

  <div id="modalGrilles" style="display: none;">
      <div class="modal-contenu">
          <span onclick="fermerModalGrilles()" class="fermer-modal">&times;</span>
          <h2>Grilles de critères disponibles</h2>
          <div id="listeGrilles">
              <!-- Généré dynamiquement -->
          </div>
      </div>
  </div>

  Tests

  Console navigateur

  // Vérifier disponibilité du module
  typeof initialiserModuleGrilles === 'function'  // true
  typeof sauvegarderGrilleTemplate === 'function'  // true

  // Voir les grilles
  const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
  console.table(grilles);

  // Voir une grille spécifique
  const grilleSRPNF = grilles.find(g => g.nom === 'Grille SRPNF');
  console.log(grilleSRPNF);
  console.table(grilleSRPNF.criteres);

  // Calculer pondération totale
  const total = grilleSRPNF.criteres.reduce((sum, c) => sum + (c.ponderation ||
  0), 0);
  console.log(`Total: ${total}%`);  // Doit être 100

  // Voir critères temporaires (nouvelle grille)
  console.log(window.tempCriteres);

  // Tester type de critère
  getTypeCritereLabel('holistique');  // "Holistique"

  Tests fonctionnels

  1. Test création grille :
    - Aller dans Réglages → Grilles de critères
    - Sélectionner "➕ Créer une nouvelle grille"
    - Saisir nom: "Test Grille"
    - Cliquer "+ Ajouter un critère"
    - Remplir: Nom "Critère 1", Pondération 50
    - Cliquer "Ajouter et continuer"
    - Vérifier : Critère affiché dans liste
    - Vérifier : Total pondération = 50% (orange)
    - Ajouter second critère (50%)
    - Vérifier : Total = 100% (vert "✓")
  2. Test modification critère :
    - Charger grille existante
    - Cliquer "Modifier" sur un critère
    - Changer pondération (15 → 20)
    - Cliquer "Sauvegarder"
    - Vérifier : Pondération mise à jour
    - Vérifier : Total recalculé
  3. Test suppression critère :
    - Cliquer "Supprimer" sur un critère
    - Confirmer
    - Vérifier : Critère retiré
    - Vérifier : Total recalculé
  4. Test verrouillage :
    - Cocher 🔒 sur un critère
    - Vérifier : Boutons Modifier/Supprimer désactivés
    - Essayer de modifier
    - Vérifier : Message d'alerte
    - Décocher 🔒
    - Vérifier : Boutons réactivés
  5. Test duplication :
    - Charger grille "SRPNF"
    - Cliquer "Dupliquer cette grille"
    - Saisir nom: "SRPNF Sciences"
    - Vérifier : Nouvelle grille créée
    - Vérifier : Critères identiques
    - Vérifier : Champ "baseSur" = "SRPNF"
  6. Test modal :
    - Cliquer "Voir les grilles existantes"
    - Vérifier : Modal affiché
    - Vérifier : Liste de toutes les grilles
    - Cliquer "Voir les critères" ()
    - Vérifier : Critères affichés
    - Cliquer "Utiliser" sur une grille
    - Vérifier : Grille chargée, modal fermé
  7. Test types de critères :
    - Créer critère type "Holistique"
    - Vérifier : Pas de champ formule
    - Modifier type → "Algorithmique"
    - Vérifier : Champ formule affiché
    - Saisir formule
    - Sauvegarder
    - Vérifier : Formule affichée dans liste
  8. Test validation pondération :
    - Créer grille avec total = 90%
    - Vérifier : Statut orange "10% manquant"
    - Créer grille avec total = 110%
    - Vérifier : Statut rouge "10% en trop"
    - Ajuster pour total = 100%
    - Vérifier : Statut vert "✓ Pondération complète"
  9. Test sauvegarde automatique :
    - Créer nouvelle grille
    - Ajouter premier critère
    - Recharger page (F5)
    - Revenir dans Grilles
    - Vérifier : Grille présente dans select
    - Vérifier : Critère sauvegardé
  10. Test suppression grille :
    - Ouvrir modal
    - Cliquer "Supprimer" sur une grille
    - Confirmer
    - Vérifier : Grille retirée du modal
    - Vérifier : Grille retirée du select

  Problèmes connus

  Aucun problème majeur connu

  Le module est stable et fonctionnel.

  Points d'attention

  1. Duplication d'IDs de critères :
  id: 'CR' + Date.now() + Math.random()  // Ligne 906
  - Math.random() peut créer collisions théoriques
  - Solution : Utiliser un compteur incrémental ou UUID

  2. Événements via onclick :
  - Utilise attributs onclick dans HTML généré
  - Style ancien, moins maintenable
  - Solution future : Migrer vers addEventListener

  3. prompt() pour duplication :
  - Expérience utilisateur limitée
  - Pas de validation avancée
  - Solution future : Modal dédié avec formulaire

  4. tempCriteres en window global :
  - Variable globale peut être écrasée
  - Solution : Encapsuler dans closure ou module ES6

  Règles de modification

  ⚠️ ZONES CRITIQUES

  Noms de fonctions :
  - ❌ Toutes les fonctions sont protégées (noms_stables.json)
  - Exemples: sauvegarderGrilleTemplate, chargerListeGrillesTemplates, etc.

  Structure localStorage :
  - ❌ Clé grillesTemplates
  - ❌ Structure des objets grille et critère

  IDs HTML :
  - ❌ #selectGrilleTemplate, #listeCriteres, #formAjoutCritere, etc.

  ✅ ZONES MODIFIABLES

  Commentaires :
  // ✅ AUTORISÉ - Ajouter/améliorer commentaires

  Styles inline :
  // ✅ AUTORISÉ - Modifier couleurs, espacements
  style="padding: 15px; background: var(--bleu-tres-pale);"

  Textes d'interface :
  // ✅ AUTORISÉ - Modifier libellés
  '<option value="">-- Nouvelle grille --</option>'

  Validation supplémentaire :
  // ✅ AUTORISÉ - Ajouter validations
  if (!nom || nom.length < 3) {
      alert('Le nom doit contenir au moins 3 caractères');
      return;
  }

  Logs de débogage :
  // ✅ AUTORISÉ - Ajouter console.log
  console.log('Grille sauvegardée:', grilleTemplateActuelle);

  Historique

  - Version initiale (index 50, 10-10-2025) :
    - Création du module de gestion des grilles
    - Support 3 types de critères (holistique, analytique, algorithmique)
    - Ajout/modification/suppression de critères
    - Calcul pondération avec validation 100%
    - Verrouillage de critères
  - Modularisation (10-10-2025a) :
    - Ajout duplication de grilles
    - Modal de gestion des grilles existantes
    - Sauvegarde automatique après chaque critère
    - Champ "baseSur" pour tracer les duplications
    - Support tempCriteres pour nouvelles grilles
  - Améliorations continues :
    - Notifications succès/erreur (si module utilitaires disponible)
    - Validation robuste (nom obligatoire, pondération, etc.)
  - État actuel : Module stable, utilisé en production

  ---
  Référence code : /js/grilles.js (1235 lignes)

  Modules liés :
  - config.js (variables globales)
  - productions.js (associe grilles aux productions)
  - Modules d'évaluation (utilisent grilles)

  Statut : ⚠️ MODULE PROTÉGÉ - Référencé dans noms_stables.json

