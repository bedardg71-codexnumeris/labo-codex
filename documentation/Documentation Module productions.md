Je vais générer la documentation complète pour productions.js.

  ---
  MODULE productions.js

  📚 Documentation technique complète

  ---
  1. Vue d'ensemble

  productions.js gère la configuration des productions/évaluations du cours
  (examens, travaux, portfolios, etc.). C'est le module qui définit CE QUI est
  évalué dans le cours et COMMENT les notes sont pondérées.

  Lignes de code : 873 lignesVersion : Module 04 (Index: 50 10-10-2025a)Fichier :
  /js/productions.js

  ---
  2. Type de module

  HYBRID : Ce module a un double rôle :
  - SOURCE : Génère et stocke listeGrilles (liste des productions)
  - LECTEUR/AFFICHAGE : Interface complète de gestion (CRUD + réorganisation)

  ---
  3. Données gérées

  3.1 Données générées (SOURCE)

  listeGrilles

  Type : Array d'objets ProductionFormat localStorage : JSON stringifié

  ⚠️ Note historique : Le nom listeGrilles est historique et trompeur. Ce n'est
  PAS une liste de grilles de critères, mais bien une liste de 
  productions/évaluations.

  Structure complète :
  [
    {
      id: "PROD1729785600000",
      titre: "Analyse littéraire 1",
      description: "Première analyse du trimestre",
      type: "travail",
      ponderation: 20,
      objectif: "Analyser un extrait selon la méthode SRPNF",
      tache: "Rédiger une analyse de 500 mots",
      grilleId: "GRILLE_001",
      verrouille: false
    },
    {
      id: "PROD1729785700000",
      titre: "Examen de mi-session",
      description: "",
      type: "examen",
      ponderation: 30,
      objectif: "",
      tache: "",
      grilleId: "GRILLE_002",
      verrouille: false
    },
    {
      id: "PROD1729785800000",
      titre: "Portfolio final",
      description: "Sélection des 3 meilleurs artefacts",
      type: "portfolio",
      ponderation: 50,
      objectif: "",
      tache: "",
      grilleId: "",
      verrouille: false,
      regles: {
        nombreARetenir: 3,
        minimumCompletion: 7,
        nombreTotal: 9
      },
      modeCalcul: "provisoire"
    },
    {
      id: "PROD1729785900000",
      titre: "Exercice rédactionnel 1",
      description: "",
      type: "artefact-portfolio",
      ponderation: 0,  // Les artefacts n'ont pas de pondération directe
      objectif: "",
      tache: "",
      grilleId: "GRILLE_003",
      verrouille: false
    }
  ]

  Types de productions disponibles :

  | Type               | Label                    | Pondération | Description
                                    |
  |--------------------|--------------------------|-------------|-----------------
  ----------------------------------|
  | examen             | Examen                   | Oui         | Évaluation
  sommative traditionnelle               |
  | travail            | Travail écrit            | Oui         | Rédaction,
  rapport, essai                         |
  | quiz               | Quiz/Test                | Oui         | Évaluation
  courte                                 |
  | presentation       | Présentation             | Oui         | Exposé oral
                                    |
  | portfolio          | 📁 Portfolio (conteneur) | Oui         | Conteneur
  d'artefacts avec règles de sélection    |
  | artefact-portfolio | Artefact d'un portfolio  | Non         | Exercice
  individuel faisant partie d'un portfolio |
  | autre              | Autre                    | Oui         | Type
  personnalisé                                 |

  Source unique : productions.jsLecteurs : evaluation.js, liste-evaluations.js,
  modes.js (génération simulation)

  ---
  3.2 Structure spéciale : Portfolio

  Un portfolio est un type spécial de production qui :
  1. Contient plusieurs artefacts-portfolio
  2. Applique des règles de sélection (ex: garder les 3 meilleurs sur 9)
  3. Calcule une note finale basée sur les artefacts retenus

  Structure des règles :
  regles: {
    nombreARetenir: 3,        // Combien d'artefacts comptent pour la note
    minimumCompletion: 7,     // Minimum d'artefacts à compléter
    nombreTotal: 9            // Nombre total d'artefacts attendus
  }

  Mode de calcul :
  - "provisoire" : Les étudiants peuvent voir leur note provisoire pendant le
  trimestre
  - "final" : Sélection finale à la fin (à implémenter)

  ---
  3.3 Données lues (LECTEUR)

  | Clé localStorage | Source     | Usage                                       |
  |------------------|------------|---------------------------------------------|
  | grillesTemplates | grilles.js | Association production ↔ grille de critères |

  ---
  4. API publique

  4.1 Fonctions d'affichage

  afficherTableauProductions()

  Affiche la liste complète des productions avec leurs détails.

  afficherTableauProductions()

  Fonctionnement :
  1. Charge listeGrilles depuis localStorage
  2. Charge grillesTemplates pour les noms de grilles
  3. Si liste vide → Message "Aucune évaluation définie"
  4. Génère le HTML pour chaque production :
    - Carte avec titre, description, type
    - Boutons ↑↓ pour réorganiser
    - Boutons Modifier/Supprimer
    - Checkbox Verrouiller
    - Affichage spécial pour portfolios (icône 📁, fond bleu)
  5. Met à jour les statistiques (nombre, types)
  6. Affiche les règles pour les portfolios

  Appelée par :
  - initialiserModuleProductions() au chargement
  - sauvegarderProduction() après modification
  - supprimerProduction() après suppression
  - monterEvaluation() et descendreEvaluation() après réorganisation

  ---
  afficherFormProduction(id)

  Affiche et configure le formulaire d'ajout/modification.

  afficherFormProduction("PROD123")  // Modification
  afficherFormProduction(null)       // Création

  Fonctionnement :

  Mode création (id = null) :
  1. Affiche le formulaire vide
  2. Titre : "Nouvelle production"
  3. Bouton : "Ajouter"
  4. Charge la liste des grilles dans le select

  Mode modification (id fourni) :
  1. Charge la production depuis listeGrilles
  2. Remplit tous les champs
  3. Titre : "Modifier l'évaluation"
  4. Bouton : "Sauvegarder"
  5. Si portfolio → charge les règles

  Gestion dynamique :
  - Appelle gererChangementTypeProduction() pour adapter l'UI

  ---
  4.2 Fonctions de gestion (CRUD)

  sauvegarderProduction()

  Sauvegarde une production (création ou modification).

  sauvegarderProduction()

  Fonctionnement :
  1. Récupère les valeurs des champs
  2. Valide les champs obligatoires :
    - Titre obligatoire
    - Type obligatoire
    - Pondération obligatoire (sauf artefact-portfolio)
  3. Si productionEnEdition existe → Modification
    - Trouve la production par ID
    - Met à jour ses propriétés
  4. Sinon → Création
    - Génère ID : "PROD" + Date.now()
    - Ajoute à la liste
  5. Si type = portfolio → Ajoute les règles
  6. Sauvegarde dans localStorage
  7. Ferme le formulaire
  8. Rafraîchit l'affichage
  9. Met à jour les pondérations
  10. Affiche notification de succès

  Validations :
  if (!titre || !type || (type !== 'artefact-portfolio' && ponderation === 0)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
  }

  ---
  supprimerProduction(id)

  Supprime une production après confirmation.

  supprimerProduction("PROD123")

  Fonctionnement :
  1. Demande confirmation (confirm())
  2. Filtre la liste pour retirer la production
  3. Sauvegarde dans localStorage
  4. Rafraîchit l'affichage
  5. Met à jour les pondérations

  Protection : Impossible de supprimer si verrouillée (bouton disabled)

  ---
  modifierEvaluation(id)

  Lance la modification d'une production.

  modifierEvaluation("PROD123")

  Fonctionnement : Appelle simplement afficherFormProduction(id)

  ---
  annulerFormProduction()

  Annule l'ajout/modification et ferme le formulaire.

  annulerFormProduction()

  Fonctionnement :
  1. Cache le formulaire
  2. Réaffiche le bouton "Ajouter une production"
  3. Réinitialise productionEnEdition = null

  ---
  4.3 Fonctions de gestion avancée

  verrouillerEvaluation(id)

  Bascule le verrouillage d'une production.

  verrouillerEvaluation("PROD123")

  Fonctionnement :
  1. Trouve la production
  2. Inverse production.verrouille
  3. Sauvegarde
  4. Rafraîchit l'affichage

  Effet : Une production verrouillée :
  - ❌ Ne peut plus être modifiée
  - ❌ Ne peut plus être supprimée
  - ❌ Ne peut plus être réorganisée
  - ✅ Peut être déverrouillée

  ---
  monterEvaluation(id)

  Monte une production d'une position dans la liste.

  monterEvaluation("PROD123")

  Fonctionnement :
  1. Trouve l'index de la production
  2. Si index > 0 → Échange avec la précédente
  3. Sauvegarde
  4. Rafraîchit l'affichage

  Algorithme :
  [evaluations[index - 1], evaluations[index]] = [evaluations[index],
  evaluations[index - 1]]

  ---
  descendreEvaluation(id)

  Descend une production d'une position dans la liste.

  descendreEvaluation("PROD123")

  Fonctionnement :
  1. Trouve l'index de la production
  2. Si index < length - 1 → Échange avec la suivante
  3. Sauvegarde
  4. Rafraîchit l'affichage

  ---
  4.4 Fonctions utilitaires

  gererChangementTypeProduction()

  Adapte l'UI du formulaire selon le type sélectionné.

  gererChangementTypeProduction()

  Comportements :

  Type = "portfolio" :
  - ✅ Affiche les champs de configuration (nombreARetenir, minimumCompletion,
  nombreTotal)
  - ❌ Masque la sélection de grille (portfolio ne référence pas de grille)

  Type = "artefact-portfolio" :
  - ❌ Masque le champ Pondération (pas de pondération directe)
  - ✅ Affiche un message : "Les artefacts n'ont pas de pondération propre"

  Type = autre :
  - ✅ Affichage standard (tous les champs visibles)

  Appelée par :
  - Select "Type" du formulaire (événement onchange)
  - afficherFormProduction() lors du chargement

  ---
  mettreAJourPonderationTotale()

  Calcule et affiche la pondération totale.

  mettreAJourPonderationTotale()

  Fonctionnement :
  1. Charge toutes les productions
  2. Filtre les artefact-portfolio (ne comptent pas dans le total)
  3. Calcule la somme des pondérations
  4. Affiche le total
  5. Affiche un statut coloré :
    - ✓ Pondération correcte (vert) si = 100%
    - X% en trop (rouge) si > 100%
    - X% manquant (orange) si < 100%

  Formule :
  const total = productions
    .filter(p => p.type !== 'artefact-portfolio')
    .reduce((sum, prod) => sum + (prod.ponderation || 0), 0)

  Appelée par :
  - afficherTableauProductions()
  - sauvegarderProduction()
  - supprimerProduction()

  ---
  mettreAJourResumeTypes(evaluations)

  Génère un résumé textuel des types de productions.

  mettreAJourResumeTypes(evaluations)

  Exemple de résultat :
  "2 travaux écrits, 1 examen, 1 portfolio, 5 artefacts d'un portfolio"

  Fonctionnement :
  1. Compte les occurrences de chaque type
  2. Convertit en labels lisibles avec getTypeLabel()
  3. Gère le pluriel (s si count > 1)
  4. Affiche dans #typesEvaluations

  ---
  getTypeLabel(type)

  Convertit un code de type en libellé lisible.

  getTypeLabel("travail")          // "Travail écrit"
  getTypeLabel("portfolio")        // "📁 Portfolio (conteneur)"
  getTypeLabel("artefact-portfolio") // "Artefact d'un portfolio"

  Table de conversion :
  {
    'examen': 'Examen',
    'travail': 'Travail écrit',
    'quiz': 'Quiz/Test',
    'presentation': 'Présentation',
    'portfolio': '📁 Portfolio (conteneur d\'artefacts)',
    'artefact-portfolio': 'Artefact d\'un portfolio',
    'autre': 'Autre'
  }

  ---
  chargerArtefactsDisponibles()

  Charge et affiche les artefacts disponibles pour un portfolio.

  chargerArtefactsDisponibles()

  Fonctionnement :
  1. Charge toutes les productions
  2. Filtre celles de type "artefact-portfolio"
  3. Si aucun → Message "Aucun artefact existe encore"
  4. Sinon → Génère des checkboxes pour chaque artefact

  Usage : Interface de gestion de portfolio (fonctionnalité future)

  ---
  gererPortfolio(id)

  Placeholder pour une fonctionnalité future.

  gererPortfolio("PROD123")
  // Affiche : "Fonctionnalité à venir"

  Fonctionnalité prévue :
  - Interface dédiée pour gérer les portfolios
  - Sélectionner les artefacts inclus
  - Définir les règles de sélection
  - Gérer le mode provisoire/final

  ---
  4.5 Fonction d'initialisation

  initialiserModuleProductions()

  Initialise le module au chargement.

  initialiserModuleProductions()

  Fonctionnement :
  1. Vérifie si on est sur la sous-section #reglages-productions
  2. Si oui :
    - Appelle afficherTableauProductions()
    - Appelle mettreAJourPonderationTotale()
  3. Log de succès

  Appelée par : main.js (ligne 76-79)

  ---
  5. Dépendances

  5.1 Modules requis (doivent être chargés AVANT)

  01-config.js              Variable globale productionEnEdition
  02-navigation.js          Fonctions afficherSection(), afficherSousSection()
  05-grilles.js             Source de grillesTemplates
  14-utilitaires.js         Notifications (optionnel)

  5.2 Modules qui utilisent productions.js

  evaluation.js             Lit listeGrilles pour sélection production
  liste-evaluations.js      Lit listeGrilles pour tableau exhaustif
  modes.js                  Lit listeGrilles pour génération simulation
  portfolio.js              Lit listeGrilles pour calcul indices C/P

  5.3 Variables globales utilisées

  productionEnEdition = null  // ID de la production en cours d'édition

  Déclarée dans : config.jsUtilisée par :
  - afficherFormProduction() : Stocke l'ID en mode modification
  - sauvegarderProduction() : Détermine si création ou modification
  - annulerFormProduction() : Réinitialise à null

  ---
  6. Initialisation

  Ordre de chargement dans index.html

  <script src="js/config.js"></script>
  <script src="js/navigation.js"></script>
  <script src="js/grilles.js"></script>
  <script src="js/productions.js"></script>  <!-- Ici -->
  <script src="js/main.js"></script>

  Appel dans main.js

  // MODULE 04: Productions et évaluations
  if (typeof initialiserModuleProductions === 'function') {
      console.log('   → Module 04-productions détecté');
      initialiserModuleProductions();
  }

  Éléments HTML requis

  <!-- Conteneur principal -->
  <div id="tableauEvaluationsContainer"></div>

  <!-- Statistiques -->
  <span id="nombreEvaluations">0</span>
  <span id="ponderationTotale">0%</span>
  <span id="statutPonderation"></span>
  <span id="typesEvaluations"></span>

  <!-- Bouton d'ajout -->
  <button id="btnajouterProduction" onclick="afficherFormProduction(null)">
    Ajouter une production
  </button>

  <!-- Formulaire (masqué par défaut) -->
  <div id="formulaireProduction" style="display: none;">
    <h3 id="titreFormEvaluation">Nouvelle production</h3>

    <input type="text" id="productionTitre" placeholder="Titre">
    <textarea id="productionDescription" placeholder="Description 
  (optionnel)"></textarea>

    <select id="productionType" onchange="gererChangementTypeProduction()">
      <option value="">-- Choisir un type --</option>
      <option value="examen">Examen</option>
      <option value="travail">Travail écrit</option>
      <option value="quiz">Quiz/Test</option>
      <option value="presentation">Présentation</option>
      <option value="portfolio">📁 Portfolio</option>
      <option value="artefact-portfolio">Artefact d'un portfolio</option>
      <option value="autre">Autre</option>
    </select>

    <input type="number" id="productionPonderation" placeholder="Pondération (%)">
    <div id="msgPonderationArtefact" style="display: none;">
      Les artefacts n'ont pas de pondération propre
    </div>

    <select id="productionGrille">
      <option value="">Aucune grille</option>
      <!-- Options générées dynamiquement -->
    </select>

    <textarea id="productionObjectif" placeholder="Objectif 
  (optionnel)"></textarea>
    <textarea id="productionTache" placeholder="Tâche (optionnel)"></textarea>

    <!-- Champs spécifiques aux portfolios -->
    <div id="champsPortfolio" style="display: none;">
      <input type="number" id="portfolioNombreRetenir" value="3">
      <input type="number" id="portfolioMinimumCompleter" value="7">
      <input type="number" id="portfolioNombreTotal" value="9">
    </div>

    <button onclick="sauvegarderProduction()" 
  id="btnTexteEvaluation">Ajouter</button>
    <button onclick="annulerFormProduction()">Annuler</button>
  </div>

  Vérification de l'initialisation

  // Console navigateur
  console.log('Module Productions:', typeof initialiserModuleProductions)
  // Retour attendu : 'function'

  const productions = JSON.parse(localStorage.getItem('listeGrilles'))
  console.log('Nombre de productions:', productions.length)
  console.table(productions)

  ---
  7. Tests et vérification

  Test 1 : Créer une production simple (travail)

  ÉTAPES :
  1. Aller dans Réglages → Productions
  2. Cliquer "Ajouter une production"
  3. Remplir :
     - Titre : "Analyse littéraire 1"
     - Type : "Travail écrit"
     - Pondération : 20
     - Grille : Sélectionner une grille existante
  4. Cliquer "Ajouter"
  5. Vérifier :
     - Production apparaît dans la liste
     - Nombre d'évaluations : 1
     - Pondération totale : 20%
     - Statut : "80% manquant" (orange)

  VÉRIFICATION :
  const productions = JSON.parse(localStorage.getItem('listeGrilles'))
  console.log('Première production:', productions[0])
  // Doit contenir : {id, titre, type: "travail", ponderation: 20, ...}

  Test 2 : Créer un portfolio

  ÉTAPES :
  1. Cliquer "Ajouter une production"
  2. Remplir :
     - Titre : "Portfolio final"
     - Type : "📁 Portfolio"
     - Pondération : 50
     - Nombre à retenir : 3
     - Minimum à compléter : 7
     - Nombre total : 9
  3. Vérifier :
     - Champs portfolio visibles
     - Champ Grille masqué
  4. Cliquer "Ajouter"
  5. Vérifier :
     - Icône 📁 devant le titre
     - Fond bleu carte
     - Règles affichées : "3 à retenir · Min. 7 complétés requis"

  VÉRIFICATION :
  const portfolio = productions.find(p => p.type === 'portfolio')
  console.log('Portfolio:', portfolio)
  // Doit contenir : {regles: {nombreARetenir: 3, minimumCompletion: 7,
  nombreTotal: 9}, ...}

  Test 3 : Créer des artefacts de portfolio

  ÉTAPES :
  1. Créer 5 artefacts :
     - Titre : "Exercice 1", "Exercice 2", ...
     - Type : "Artefact d'un portfolio"
     - Pondération : (champ masqué automatiquement)
     - Grille : Sélectionner une grille
  2. Vérifier :
     - Pondération totale reste inchangée (artefacts ne comptent pas)
     - Résumé : "1 portfolio, 5 artefacts d'un portfolio"

  VÉRIFICATION :
  const artefacts = productions.filter(p => p.type === 'artefact-portfolio')
  console.log('Nombre d\'artefacts:', artefacts.length) // 5
  console.log('Pondération:', artefacts[0].ponderation) // 0

  Test 4 : Vérifier pondération = 100%

  ÉTAPES :
  1. Créer plusieurs productions jusqu'à atteindre 100% :
     - Travail 1 : 20%
     - Examen : 30%
     - Portfolio : 50%
  2. Vérifier :
     - Pondération totale : 100%
     - Statut : "✓ Pondération correcte" (vert)

  3. Ajouter un quiz de 10%
  4. Vérifier :
     - Pondération totale : 110%
     - Statut : "10% en trop" (rouge)

  VÉRIFICATION :
  const total = productions
    .filter(p => p.type !== 'artefact-portfolio')
    .reduce((sum, p) => sum + (p.ponderation || 0), 0)
  console.log('Total:', total) // 110

  Test 5 : Réorganisation

  ÉTAPES :
  1. Créer 3 productions : A, B, C
  2. Liste initiale : [A, B, C]
  3. Cliquer ↓ sur A
  4. Vérifier : [B, A, C]
  5. Cliquer ↑ sur C
  6. Vérifier : [B, C, A]

  VÉRIFICATION :
  const productions = JSON.parse(localStorage.getItem('listeGrilles'))
  console.log('Ordre:', productions.map(p => p.titre))
  // Doit afficher : ["B", "C", "A"]

  Test 6 : Verrouillage

  ÉTAPES :
  1. Cocher "Verrouiller" sur une production
  2. Vérifier :
     - Boutons ↑↓ désactivés (disabled)
     - Bouton Modifier désactivé
     - Bouton Supprimer désactivé
  3. Décocher "Verrouiller"
  4. Vérifier que les boutons sont réactivés

  VÉRIFICATION :
  const prod = productions.find(p => p.verrouille === true)
  console.log('Production verrouillée:', prod.titre)

  Test 7 : Modification

  ÉTAPES :
  1. Cliquer "Modifier" sur une production
  2. Vérifier :
     - Formulaire s'affiche
     - Titre : "Modifier l'évaluation"
     - Bouton : "Sauvegarder"
     - Tous les champs sont remplis
  3. Modifier le titre
  4. Cliquer "Sauvegarder"
  5. Vérifier que le titre est mis à jour

  VÉRIFICATION :
  // L'ID doit rester le même
  const avant = productions[0].id
  // Après modification
  const apres = JSON.parse(localStorage.getItem('listeGrilles'))[0].id
  console.log('ID inchangé:', avant === apres) // true

  ---
  8. Problèmes connus et solutions

  Problème 1 : Nom trompeur listeGrilles

  Symptôme : La clé localStorage s'appelle listeGrilles mais contient des
  productions, pas des grilles.

  Cause : Nom historique datant d'une version antérieure de l'application.

  Impact : Confusion lors de la lecture du code.

  Solution court terme : Ajouter des commentaires explicatifs.

  Solution long terme : Renommer en listeProductions (nécessite migration).

  Migration possible :
  // Migration script
  const anciennes = JSON.parse(localStorage.getItem('listeGrilles') || '[]')
  localStorage.setItem('listeProductions', JSON.stringify(anciennes))
  localStorage.removeItem('listeGrilles')

  // Puis adapter TOUS les modules qui utilisent 'listeGrilles'

  ---
  Problème 2 : Pondération > 100% autorisée

  Symptôme : L'utilisateur peut sauvegarder des productions même si le total
  dépasse 100%.

  Cause : Pas de validation bloquante dans sauvegarderProduction().

  Impact : Incohérence dans le calcul des notes finales.

  Solution : Ajouter une validation avant sauvegarde.

  // Dans sauvegarderProduction(), avant la ligne 351
  const productionsComptees = evaluations.filter(p => p.type !==
  'artefact-portfolio')
  const totalActuel = productionsComptees.reduce((sum, p) => sum + (p.ponderation
  || 0), 0)
  const totalAvecNouvelle = totalActuel + ponderation

  if (totalAvecNouvelle > 100) {
      alert(`Erreur : La pondération totale dépasserait 100% 
  (${totalAvecNouvelle}%)`)
      return
  }

  ---
  Problème 3 : Gestion des portfolios incomplète

  Symptôme : La fonction gererPortfolio() affiche juste une alerte "à venir".

  Cause : Fonctionnalité pas encore implémentée.

  Impact : Impossible de gérer finement les artefacts inclus dans un portfolio.

  Solution : Implémenter l'interface de gestion de portfolio.

  Fonctionnalités à développer :
  1. Interface dédiée pour un portfolio
  2. Liste des artefacts disponibles (type artefact-portfolio)
  3. Checkboxes pour sélectionner les artefacts inclus
  4. Sauvegarde de artefactsIds dans le portfolio
  5. Gestion du mode provisoire/final

  ---
  Problème 4 : Événements inline (onclick)

  Symptôme : Les événements sont gérés via attributs onclick dans le HTML.

  Cause : Style de code ancien, pas de séparation concerns.

  Impact : Difficile à maintenir, problèmes de sécurité CSP potentiels.

  Solution : Moderniser avec addEventListener.

  Exemple de modernisation :
  // Au lieu de onclick="modifierEvaluation('${prod.id}')" dans le HTML
  // Générer un bouton avec data-attribute
  <button class="btn-modifier-production" data-id="${prod.id}">Modifier</button>

  // Puis dans initialiserModuleProductions()
  document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-modifier-production')) {
      const id = e.target.dataset.id
      modifierEvaluation(id)
    }
  })

  ---
  Problème 5 : Pas de validation du minimum de portfolio

  Symptôme : On peut définir un portfolio avec nombreARetenir > nombreTotal.

  Cause : Pas de validation dans le formulaire.

  Impact : Configuration incohérente (ex: retenir 5 artefacts sur 3 au total).

  Solution : Ajouter validation dans sauvegarderProduction().

  // Après ligne 328
  if (type === 'portfolio') {
      const nombreRetenir = parseInt(nombreRetenir.value)
      const nombreTotal = parseInt(nombreTotal.value)

      if (nombreRetenir > nombreTotal) {
          alert(`Erreur : Impossible de retenir ${nombreRetenir} artefacts sur 
  ${nombreTotal} au total`)
          return
      }
  }

  ---
  Problème 6 : Suppression sans vérifier dépendances

  Symptôme : On peut supprimer une production même si des évaluations existent.

  Cause : Pas de vérification dans supprimerProduction().

  Impact : Évaluations orphelines (référencent une production supprimée).

  Solution : Vérifier avant suppression.

  // Dans supprimerProduction(), avant ligne 443
  const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees')
  || '[]')
  const nbEvaluations = evaluations.filter(e => e.productionId === id).length

  if (nbEvaluations > 0) {
      if (!confirm(`⚠️ Attention : ${nbEvaluations} évaluation(s) utilisent cette 
  production.\n\nLes supprimer supprimera aussi ces évaluations.\n\nConfirmer ?`))
   {
          return
      }
      // Supprimer aussi les évaluations
      const evalsFiltrees = evaluations.filter(e => e.productionId !== id)
      localStorage.setItem('evaluationsSauvegardees',
  JSON.stringify(evalsFiltrees))
  }

  ---
  9. Règles de modification

  ⚠️ ZONES STRICTEMENT PROTÉGÉES - NE PAS MODIFIER

  1. Nom de la clé localStorage listeGrilles (ligne 74, 212, 307, etc.)
    - Utilisée par evaluation.js, liste-evaluations.js, modes.js
    - Tout renommage casse l'application entière
  2. Structure de l'objet Production (lignes 310-319, 322-334)
    - Toute modification affecte l'évaluation, les statistiques, etc.
    - Respecter les champs existants
  3. Noms des types de productions (lignes 749-758)
    - "examen", "travail", "portfolio", "artefact-portfolio", etc.
    - Référencés partout dans le code
  4. Noms de fonctions (listées dans noms_stables.json)
    - Toutes les fonctions publiques sont protégées
    - Utilisées via onclick dans le HTML
  5. Algorithme de calcul de pondération (lignes 669-689)
    - Filtre artefact-portfolio (ne comptent pas)
    - Logique critique pour la cohérence des notes

  ---
  ✅ Zones modifiables

  1. Labels des types (lignes 749-758)
    - Personnaliser les textes affichés
    - Ajouter des emojis
  2. Styles CSS inline (lignes 96-157)
    - Adapter les couleurs, espacements
    - Personnaliser l'affichage des cartes
  3. Messages de validation (ligne 303, 443)
    - Adapter le ton
    - Traduire
  4. Règles par défaut des portfolios (lignes 255-256, 328-330)
    - Changer les valeurs par défaut (actuellement 3, 7, 9)
  5. Notifications (lignes 358-362)
    - Personnaliser les messages de succès

  ---
  🛠️ Pour ajouter un nouveau type de production

  Exemple : Ajouter "Projet" comme type

  // 1. Ajouter dans getTypeLabel() (ligne 749)
  const labels = {
    'examen': 'Examen',
    // ...
    'projet': 'Projet de groupe',  // Nouveau
    'autre': 'Autre'
  }

  // 2. Ajouter l'option dans le HTML
  <select id="productionType">
    <option value="">-- Choisir un type --</option>
    <!-- ... -->
    <option value="projet">Projet de groupe</option>
    <option value="autre">Autre</option>
  </select>

  // 3. Si comportement spécial, adapter gererChangementTypeProduction()
  if (type === 'projet') {
      // Logique spécifique
  }

  ---
  10. Historique

  Version actuelle (Module 04 - Index 50)

  État : ✅ FonctionnelDernière modification : 10 octobre 2025a - Modularisation

  Fonctionnalités complétées :
  - Gestion complète des productions (CRUD)
  - 7 types de productions disponibles
  - Support des portfolios avec règles
  - Calcul de pondération avec validation visuelle
  - Réorganisation (monter/descendre)
  - Verrouillage
  - Association avec grilles de critères
  - Interface complète d'ajout/modification
  - Statistiques (nombre, types, pondération)

  Fonctionnalités partielles :
  - gererPortfolio() : Placeholder (à implémenter)
  - chargerArtefactsDisponibles() : Interface future

  Bugs connus :
  - Aucun bug critique identifié

  Améliorations prévues :
  - Implémenter complètement la gestion des portfolios
  - Moderniser les événements (remplacer onclick par addEventListener)
  - Ajouter validation pondération totale ≤ 100%
  - Ajouter validation règles portfolio cohérentes
  - Vérifier dépendances avant suppression
  - Permettre glisser-déposer pour réorganiser
  - Ajouter filtres (par type, par pondération)
  - Renommer listeGrilles → listeProductions (migration)

  ---
  11. Support et ressources

  Documentation pédagogique

  - Portfolios : Article "Using Portfolios in Assessment" (pedagogy guides)
  - Guide de monitorage : https://codexnumeris.org/apropos

  Fichiers de référence

  CLAUDE.md                    Contexte général du projet
  structure-modulaire.txt      Architecture complète
  noms_stables.json            Noms protégés

  Modules connexes à consulter

  grilles.js                Pour comprendre l'association production ↔ grille
  evaluation.js             Utilise listeGrilles pour sélection
  liste-evaluations.js      Utilise listeGrilles pour tableau exhaustif
  portfolio.js              Calcul indices C/P basé sur listeGrilles
  modes.js                  Génération données simulation basée sur listeGrilles

  Debug dans la console

  // Voir toutes les productions
  const productions = JSON.parse(localStorage.getItem('listeGrilles'))
  console.table(productions)

  // Voir la pondération totale
  const total = productions
    .filter(p => p.type !== 'artefact-portfolio')
    .reduce((sum, p) => sum + (p.ponderation || 0), 0)
  console.log('Pondération totale:', total + '%')

  // Voir les types
  const types = productions.map(p => p.type)
  console.log('Types:', types)

  // Voir les portfolios
  const portfolios = productions.filter(p => p.type === 'portfolio')
  console.log('Portfolios:', portfolios)

  // Voir les artefacts
  const artefacts = productions.filter(p => p.type === 'artefact-portfolio')
  console.log('Artefacts:', artefacts.length)

  // Tester une fonction
  afficherTableauProductions()
  mettreAJourPonderationTotale()

  ---
  📌 Note importante : Ce module génère listeGrilles (nom historique = liste des
  productions) qui est la source unique définissant CE QUI est évalué dans le
  cours. Toute modification de cette donnée affecte l'évaluation, les
  statistiques, et le tableau de bord.

  ---
  Fin de la documentation productions.js