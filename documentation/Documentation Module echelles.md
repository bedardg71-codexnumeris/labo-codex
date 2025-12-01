Voici la documentation technique complète du module echelles.js :

  ---
  Module echelles.js

  Vue d'ensemble

  Module SOURCE qui gère les échelles de performance basées sur la taxonomie SOLO
  (Structure of Observed Learning Outcomes) pour les pratiques alternatives de
  notation (PAN/SBG).

  Responsabilités :
  - Définition des niveaux : Niveaux par défaut I-D-M-E (Incomplet, Développement,
   Maîtrisé, Étendu)
  - Création d'échelles : Templates d'échelles réutilisables
  - Gestion des niveaux : Ajout, modification, suppression de niveaux
  - Configuration globale : Type d'échelle (lettres/pourcentage/autre), seuil de
  réussite
  - Aperçu visuel : Bandeau horizontal coloré des niveaux
  - Palette de couleurs : 20 couleurs organisées par teintes
  - Conversion notes ↔ niveaux : Pour utilisation dans les évaluations
  - Génération automatique : Création d'échelles depuis codes personnalisés

  Principe fondamental : Ce module est une SOURCE. Il génère et stocke
  echellesTemplates dans localStorage, utilisées ensuite par les modules
  d'évaluation pour noter les productions.

  Type

  - SOURCE - Génère et stocke les échelles de performance
  - LECTEUR - Lit et affiche des données
  - CONFIGURATION - Définit constantes et variables globales
  - SYSTÈME - Gestion de la navigation et de l'état de l'interface
  - INITIALISATION - Point d'entrée et orchestration du démarrage

  Données gérées

  Stockage localStorage (ÉCRITURE)

  1. echellesTemplates (LA SOURCE)
  - Clé : echellesTemplates
  - Format : Array d'échelles
  - Structure : Array<{ id, nom, niveaux[], config, dateCreation, 
  dateModification, baseSur }>

  Exemple :
  [
    {
      "id": "ECH1698765432000",
      "nom": "Échelle SOLO (IDME)",
      "niveaux": [
        {
          "code": "I",
          "nom": "Incomplet ou insuffisant",
          "description": "Préstructurel, unistructurel",
          "min": 0,
          "max": 64,
          "valeurCalcul": 32,
          "couleur": "var(--risque-critique)"
        },
        {
          "code": "D",
          "nom": "En Développement",
          "description": "Multistructurel",
          "min": 65,
          "max": 74,
          "valeurCalcul": 69.5,
          "couleur": "var(--risque-modere)"
        }
      ],
      "config": {
        "typeEchelle": "lettres",
        "seuilReussite": 60,
        "codesPersonnalises": ""
      },
      "dateCreation": "2025-10-23T10:00:00.000Z",
      "dateModification": "2025-10-23T14:30:00.000Z",
      "baseSur": null
    }
  ]

  2. niveauxEchelle (temporaire)
  - Clé : niveauxEchelle
  - Format : Array de niveaux
  - Usage : Stockage temporaire pendant l'édition (avant sauvegarde dans échelle
  template)

  3. configEchelle (temporaire)
  - Clé : configEchelle
  - Format : Object de configuration
  - Structure : { typeEchelle, seuilReussite, notePassage, codesPersonnalises }
  - Usage : Configuration temporaire pendant l'édition

  Constantes du module

  niveauxDefaut (échelle SOLO)
  - Type : Array constant
  - Usage : Niveaux par défaut (I-D-M-E) pour nouvelle échelle
  - Basé sur : Taxonomie SOLO adaptée aux PAN

  Structure :
  [
    { code: 'I', nom: 'Incomplet ou insuffisant', min: 0, max: 64, valeurCalcul:
  32, couleur: '...' },
    { code: 'D', nom: 'En Développement', min: 65, max: 74, valeurCalcul: 69.5,
  couleur: '...' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 79.5, couleur:
  '...' },
    { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 92.5, couleur:
  '...' }
  ]

  paletteCouleurs
  - Type : Array constant
  - Contenu : 20 couleurs organisées (rouge → orange → jaune → vert → bleu →
  violet → gris)
  - Usage : Select de couleur pour chaque niveau

  Variable globale du module

  echelleTemplateActuelle
  - Type : Object | null
  - Usage : Échelle en cours d'édition (null = nouvelle échelle)

  API publique

  Initialisation

  initialiserModuleEchelles()
  Description : Initialise le module des échelles de performance. Appelée par
  main.js.

  Paramètres : Aucun

  Retour : void

  Séquence :
  1. Vérifie que #typeEchelle existe (section active)
  2. Charge les échelles templates via chargerEchellesTemplates()
  3. Charge la configuration via chargerConfigurationEchelle()
  4. Log de succès

  Utilisation :
  // Appelée automatiquement par main.js
  initialiserModuleEchelles();

  Gestion des échelles templates

  chargerEchellesTemplates()
  Description : Charge la liste des échelles dans le sélecteur <select>.

  Paramètres : Aucun

  Retour : void

  HTML généré :
  <option value="">-- Nouvelle échelle --</option>
  <option value="new">➕ Créer une nouvelle échelle</option>
  <option value="ECH123">Échelle SOLO (IDME)</option>
  <option value="ECH456">Échelle Sciences</option>

  chargerEchelleTemplate()
  Description : Charge une échelle sélectionnée pour édition ou crée une nouvelle.

  Paramètres : Aucun (lit depuis #selectEchelleTemplate)

  Retour : void

  Modes :
  1. Vide ou "new" : Mode création
    - Réinitialise aux niveauxDefaut
    - Cache bouton dupliquer
    - echelleTemplateActuelle = null
  2. ID existant : Mode édition
    - Charge échelle depuis localStorage
    - Affiche niveaux et config
    - Affiche bouton dupliquer

  enregistrerCommeEchelle()
  Description : FONCTION CENTRALE. Enregistre l'échelle complète dans
  localStorage.

  Paramètres : Aucun (lit depuis les champs)

  Retour : void

  Validations :
  - Nom obligatoire

  Logique :
  1. Récupère nom, niveaux (niveauxEchelle), config (configEchelle)
  2. Si echelleTemplateActuelle existe : Modification
    - Met à jour nom, niveaux, config, dateModification
    - Remplace dans le tableau
  3. Sinon : Création
    - Génère nouvel ID ('ECH' + Date.now())
    - Crée échelle avec dateCreation
    - Ajoute au tableau
  4. Sauvegarde dans localStorage.echellesTemplates
  5. Recharge le select et sélectionne l'échelle
  6. Affiche notification

  dupliquerEchelleActuelle()
  Description : Duplique l'échelle en cours d'édition.

  Paramètres : Aucun

  Retour : void

  Séquence :
  1. Vérifie qu'une échelle est active
  2. Demande nouveau nom via prompt()
  3. Crée copie complète (niveaux + config)
  4. Ajoute champ baseSur avec nom original
  5. Sauvegarde et sélectionne

  supprimerEchelle(echelleId)
  Description : Supprime une échelle template.

  Paramètres :
  - echelleId (String) : ID de l'échelle

  Retour : void

  Sécurité : Confirmation obligatoire

  Configuration globale

  chargerConfigurationEchelle()
  Description : Charge la configuration depuis localStorage et applique aux
  champs.

  Paramètres : Aucun

  Retour : void

  Config chargée :
  - typeEchelle : 'lettres', 'pourcentage', 'autre'
  - seuilReussite : Pourcentage (défaut 60)
  - codesPersonnalises : String optionnel

  sauvegarderConfigEchelle()
  Description : Sauvegarde la configuration dans localStorage.

  Paramètres : Aucun

  Retour : void

  Config sauvegardée :
  {
    typeEchelle: 'lettres',
    seuilReussite: 60,
    notePassage: '',
    codesPersonnalises: ''
  }

  changerTypeEchelle()
  Description : Gère le changement de type d'échelle et adapte l'interface.

  Paramètres : Aucun (lit depuis #typeEchelle)

  Retour : void

  Logique :
  - Type = "autre" → Affiche champ codesPersonnalises et notePassage
  - Autres types → Masque champs supplémentaires
  - Appelle sauvegarderConfigEchelle()

  Gestion des niveaux

  afficherTableauNiveaux(niveaux)
  Description : Affiche le tableau éditable des niveaux.

  Paramètres :
  - niveaux (Array) : Array d'objets niveau

  Retour : void

  Génère :
  - Tableau HTML avec inputs inline
  - Colonnes : Code | Nom | Description | Min(%) | Max(%) | Valeur ponctuelle |
  Couleur | Actions
  - Bouton suppression par ligne (si >1 niveau)
  - Bouton "+ Ajouter un niveau" en bas

  modifierNiveau(index, champ, valeur)
  Description : Modifie un champ d'un niveau.

  Paramètres :
  - index (Number) : Index du niveau
  - champ (String) : Nom du champ ('code', 'nom', 'description', 'min', 'max',
  'valeurCalcul', 'couleur')
  - valeur (String) : Nouvelle valeur

  Retour : void

  Logique :
  1. Charge niveaux depuis localStorage
  2. Modifie la valeur du champ
  3. Sauvegarde dans localStorage
  4. Met à jour aperçu couleur (si champ = 'couleur')
  5. Met à jour aperçu global

  ajouterNiveau()
  Description : Ajoute un nouveau niveau avec valeurs par défaut.

  Paramètres : Aucun

  Retour : void

  Niveau créé :
  {
    code: 'N',
    nom: 'Nouveau niveau',
    description: '',
    min: 0,
    max: 100,
    valeurCalcul: 50,
    couleur: 'var(--bleu-moyen)'
  }

  supprimerNiveau(index)
  Description : Supprime un niveau après confirmation.

  Paramètres :
  - index (Number) : Index du niveau

  Retour : void

  Sécurité :
  - Confirmation obligatoire
  - Désactivé si 1 seul niveau (minimum requis)

  reinitialiserNiveauxDefaut()
  Description : Restaure les niveaux SOLO par défaut (I-D-M-E).

  Paramètres : Aucun

  Retour : void

  Sécurité : Confirmation obligatoire (perte des modifications)

  sauvegarderNiveaux()
  Description : Valide et sauvegarde les niveaux.

  Paramètres : Aucun

  Retour : void

  Validations :
  - Code et nom obligatoires pour chaque niveau
  - Min doit être < Max
  - Alerte avec liste d'erreurs si invalide

  Aperçu visuel

  afficherApercuEchelle(niveaux)
  Description : Affiche l'aperçu visuel de l'échelle (bandeau horizontal coloré).

  Paramètres :
  - niveaux (Array) : Array d'objets niveau

  Retour : void

  Génère :
  - Div par niveau (flex horizontal)
  - Fond semi-transparent (couleur + '20' pour opacity)
  - Code en gras et couleur pleine
  - Plage de pourcentages en dessous

  Génération automatique

  genererNiveauxPersonnalises()
  Description : Génère automatiquement des niveaux depuis codes séparés par
  virgules.

  Paramètres : Aucun (lit depuis #codesPersonnalises)

  Retour : void

  Format attendu : "Excellent, Bon, Moyen, Faible" ou "A, B, C, D, F"

  Génération :
  - Code : 3 premiers caractères en majuscules
  - Nom : Code complet
  - Plage : Répartie uniformément sur 0-100%
  - Couleur : Bleu moyen par défaut

  Exemple :
  // Input: "Excellent, Bon, Moyen, Faible"
  // Génère:
  [
    { code: 'EXC', nom: 'Excellent', min: 0, max: 25, valeurCalcul: 12.5, couleur:
   '...' },
    { code: 'BON', nom: 'Bon', min: 25, max: 50, valeurCalcul: 37.5, couleur:
  '...' },
    { code: 'MOY', nom: 'Moyen', min: 50, max: 75, valeurCalcul: 62.5, couleur:
  '...' },
    { code: 'FAI', nom: 'Faible', min: 75, max: 100, valeurCalcul: 87.5, couleur:
  '...' }
  ]

  Utilisation dans d'autres modules

  chargerEchellePerformance()
  Description : Charge les échelles dans un select d'évaluation (module
  productions).

  Paramètres : Aucun

  Retour : void

  Élément requis : #selectEchelle1

  HTML généré :
  <option value="">-- Choisir une échelle --</option>
  <option value="ECH123">Échelle SOLO (IDME)</option>
  <option value="ECH456">Échelle Sciences</option>

  mettreAJourOptionsEchelle(niveaux)
  Description : Met à jour les selects de critères avec les niveaux d'une échelle.

  Paramètres :
  - niveaux (Array) : Array d'objets niveau

  Retour : void

  Utilisation : Appelée lors du changement d'échelle dans une évaluation

  Format option généré :
  <option value="E">E - Étendu</option>
  <option value="M">M - Maîtrisé</option>
  <option value="D">D - En Développement</option>
  <option value="I">I - Incomplet ou insuffisant</option>

  Utilitaires

  sauvegarderNomEchelle()
  Description : Sauvegarde le nom de l'échelle en mémoire (pas localStorage).

  Paramètres : Aucun

  Retour : void

  afficherNotificationSucces(message)
  Description : Affiche une notification de succès (3 secondes).

  Paramètres :
  - message (String) : Message à afficher

  Retour : void

  Dépendances

  Lit depuis (localStorage) :
  - echellesTemplates (lecture/écriture)
  - niveauxEchelle (temporaire)
  - configEchelle (temporaire)

  Appelle (fonctions externes) :
  - echapperHtml() depuis config.js (sécurité XSS)

  Utilisé par :
  - Module productions (sélection d'échelle pour évaluation)
  - Module cartouches (niveaux pour rétroactions)
  - Modules d'évaluation

  Modules requis (chargement avant) :
  - config.js - echapperHtml()

  Initialisation

  Fonction : initialiserModuleEchelles()

  Appelée depuis : main.js (ligne 88-91) - PRIORITÉ 2

  Ordre de chargement : Module n°6 dans main.js

  Conditions d'initialisation :
  - Élément DOM #typeEchelle doit exister
  - Section "Réglages › Échelle de performance" (optionnel pour chargement
  initial)

  Taxonomie SOLO (Échelle par défaut)

  Structure of Observed Learning Outcomes

  Principe : Évalue la complexité de la compréhension d'un étudiant selon 5
  niveaux.

  | Niveau SOLO     | Code IDME | Score | Plage   | Compréhension
     |
  |-----------------|-----------|-------|---------|-------------------------------
  ---|
  | Préstructurel   | I         | 32    | 0-64%   | Incompréhension, éléments
  isolés |
  | Unistructurel   | I         | 32    | 0-64%   | Un seul aspect pertinent
     |
  | Multistructurel | D         | 69.5  | 65-74%  | Plusieurs aspects sans liens
     |
  | Relationnel     | M         | 79.5  | 75-84%  | Aspects reliés, vue d'ensemble
     |
  | Abstrait étendu | E         | 92.5  | 85-100% | Généralisation, transfert
     |

  Adaptation IDME :
  - I (Insuffisant) : Préstructurel + Unistructurel
  - D (Développement) : Multistructurel
  - M (Maîtrisé) : Relationnel
  - E (Étendu) : Abstrait étendu

  Palette de couleurs

  20 couleurs organisées par teintes :

  | Catégorie | Couleurs                    | Usage                              |
  |-----------|-----------------------------|------------------------------------|
  | Rouge     | Critique, Foncé, Normal     | Niveaux insuffisants (I)           |
  | Orange    | Critique, Normal, Clair     | Niveaux en développement           |
  | Jaune     | Modéré, Normal, Jaune-vert  | Niveaux en progression             |
  | Vert      | Minimal, Normal, Foncé, Nul | Niveaux maîtrisés (M), étendus (E) |
  | Cyan      | Turquoise, Bleu clair       | Niveaux avancés                    |
  | Bleu      | Moyen, Foncé                | Niveaux par défaut                 |
  | Autres    | Violet, Gris, Gris foncé    | Personnalisation                   |

  Workflow de création d'échelle

  Scénario 1 : Nouvelle échelle depuis défaut

  1. Sélectionner "-- Nouvelle échelle --"
     → chargerEchelleTemplate()
     → Niveaux I-D-M-E chargés

  2. Saisir nom : "Échelle Sciences"

  3. Modifier un niveau
     - Cliquer dans input "Nom"
     - Changer "Maîtrisé" → "Maîtrisé avec rigueur"
     → modifierNiveau(index, 'nom', valeur)
     → Sauvegarde automatique dans localStorage.niveauxEchelle

  4. Changer couleur d'un niveau
     - Select couleur → "Vert foncé"
     → modifierNiveau(index, 'couleur', valeur)
     → Aperçu mis à jour

  5. Ajouter un niveau
     - Cliquer "+ Ajouter un niveau"
     → ajouterNiveau()
     → Nouveau niveau créé

  6. Enregistrer l'échelle
     - Cliquer "Enregistrer comme échelle"
     → enregistrerCommeEchelle()
     → Échelle sauvegardée dans echellesTemplates

  Scénario 2 : Création depuis codes personnalisés

  1. Sélectionner type "autre"
     → changerTypeEchelle()
     → Champ codes personnalisés affiché

  2. Saisir codes : "Excellent, Bon, Moyen, Faible"

  3. Cliquer "Générer"
     → genererNiveauxPersonnalises()
     → 4 niveaux créés automatiquement
     - EXC: 0-25%
     - BON: 25-50%
     - MOY: 50-75%
     - FAI: 75-100%

  4. Ajuster les plages si nécessaire
     - Modifier Min/Max dans le tableau

  5. Enregistrer l'échelle

  Scénario 3 : Duplication d'échelle

  1. Sélectionner échelle "SOLO (IDME)"
     → chargerEchelleTemplate()
     → Niveaux chargés
     → Bouton "Dupliquer" visible

  2. Cliquer "Dupliquer"
     → dupliquerEchelleActuelle()
     → Prompt nom : "SOLO Sciences (copie)"

  3. Nouvelle échelle créée
     - Mêmes niveaux
     - Champ baseSur = "SOLO (IDME)"
     - Automatiquement sélectionnée

  4. Modifier pour personnaliser

  5. Déjà sauvegardée automatiquement

  Structure HTML requise

  Select des échelles

  <select id="selectEchelleTemplate" onchange="chargerEchelleTemplate()">
      <!-- Généré dynamiquement -->
  </select>

  Nom de l'échelle

  <div id="nomEchelleContainer" style="display: none;">
      <label>Nom de l'échelle</label>
      <input type="text" id="nomEchelleTemplate" 
  onchange="sauvegarderNomEchelle()">
  </div>

  Configuration

  <select id="typeEchelle" onchange="changerTypeEchelle()">
      <option value="lettres">Lettres (A, B, C, D, E, F)</option>
      <option value="pourcentage">Pourcentage (0-100%)</option>
      <option value="autre">Autre (personnalisé)</option>
  </select>

  <input type="number" id="seuilReussite" value="60" 
  onchange="sauvegarderConfigEchelle()">

  <div id="champAutreEchelle" style="display: none;">
      <input type="text" id="codesPersonnalises" placeholder="Ex: A, B, C, D, F">
      <button onclick="genererNiveauxPersonnalises()">Générer</button>
  </div>

  Tableau des niveaux

  <div id="tableauNiveaux">
      <!-- Généré dynamiquement par afficherTableauNiveaux() -->
  </div>

  Aperçu visuel

  <div id="apercuEchelle" style="display: flex; gap: 5px;">
      <!-- Généré dynamiquement par afficherApercuEchelle() -->
  </div>

  Boutons d'action

  <button onclick="enregistrerCommeEchelle()">Enregistrer comme échelle</button>
  <button id="btnDupliquerEchelle" onclick="dupliquerEchelleActuelle()" 
  style="display: none;">
      Dupliquer cette échelle
  </button>
  <button onclick="reinitialiserNiveauxDefaut()">Réinitialiser</button>

  Tests

  Console navigateur

  // Vérifier disponibilité
  typeof initialiserModuleEchelles === 'function'  // true
  typeof enregistrerCommeEchelle === 'function'  // true

  // Voir échelles
  const echelles = JSON.parse(localStorage.getItem('echellesTemplates') || '[]');
  console.table(echelles);

  // Voir niveaux par défaut
  console.table(niveauxDefaut);

  // Voir palette
  console.table(paletteCouleurs);

  // Voir échelle active
  console.log(echelleTemplateActuelle);

  // Voir niveaux actuels
  const niveaux = JSON.parse(localStorage.getItem('niveauxEchelle') || '[]');
  console.table(niveaux);

  // Voir config
  const config = JSON.parse(localStorage.getItem('configEchelle') || '{}');
  console.log(config);

  Tests fonctionnels

  1. Test création échelle par défaut :
    - Aller Réglages → Échelle de performance
    - Sélectionner "➕ Créer une nouvelle échelle"
    - Vérifier : 4 niveaux I-D-M-E affichés
    - Saisir nom : "Test Échelle"
    - Cliquer "Enregistrer comme échelle"
    - Vérifier : Notification succès
    - Vérifier : Échelle dans select
  2. Test modification niveau :
    - Charger une échelle
    - Modifier nom d'un niveau
    - Vérifier : Sauvegarde automatique
    - Recharger la page
    - Vérifier : Modification conservée
  3. Test ajout/suppression niveau :
    - Cliquer "+ Ajouter un niveau"
    - Vérifier : Nouveau niveau créé (code "N")
    - Modifier le niveau ajouté
    - Cliquer "Supprimer"
    - Confirmer
    - Vérifier : Niveau retiré
  4. Test aperçu visuel :
    - Modifier couleur d'un niveau
    - Vérifier : Aperçu couleur mis à jour instantanément
    - Vérifier : Bandeau horizontal reflète le changement
  5. Test duplication :
    - Charger échelle "SOLO (IDME)"
    - Cliquer "Dupliquer"
    - Saisir nom : "SOLO Personnalisé"
    - Vérifier : Nouvelle échelle créée
    - Vérifier : Niveaux identiques
    - Modifier un niveau
    - Vérifier : Original inchangé
  6. Test génération automatique :
    - Type = "autre"
    - Saisir codes : "Excellent, Bon, Moyen, Faible"
    - Cliquer "Générer"
    - Vérifier : 4 niveaux créés
    - Vérifier : Codes = EXC, BON, MOY, FAI
    - Vérifier : Plages uniformes (0-25, 25-50, 50-75, 75-100)
  7. Test validation :
    - Créer niveau avec min > max
    - Cliquer "Sauvegarder les niveaux"
    - Vérifier : Alerte d'erreur
    - Corriger
    - Vérifier : Sauvegarde réussie
  8. Test réinitialisation :
    - Modifier plusieurs niveaux
    - Cliquer "Réinitialiser"
    - Confirmer
    - Vérifier : Niveaux SOLO par défaut restaurés
  9. Test utilisation dans évaluation :
    - Créer échelle
    - Aller dans Productions → Évaluer
    - Vérifier : Échelle disponible dans select
    - Sélectionner échelle
    - Vérifier : Niveaux chargés dans critères
  10. Test suppression :
    - Créer échelle test
    - Ouvrir modal échelles (si disponible)
    - Cliquer "Supprimer"
    - Confirmer
    - Vérifier : Échelle retirée

  Cas d'usage pédagogiques

  1. Évaluation par compétences (PAN/SBG)

  Contexte : Évaluer sans note chiffrée, avec rétroaction qualitative

  Échelle recommandée : SOLO (I-D-M-E)

  Utilisation :
  - Créer productions avec critères
  - Associer échelle SOLO
  - Évaluer chaque critère avec niveau
  - Système calcule score global depuis valeurs ponctuelles

  2. Notation traditionnelle avec lettres

  Contexte : Convertir pourcentages en lettres (A-F)

  Création :
  Type: "lettres"
  Codes: "A, B+, B, C+, C, D+, D, E"
  Génération automatique → 8 niveaux uniformes
  Ajuster plages:
  - A: 85-100%
  - B+: 80-84%
  - B: 75-79%
  - C+: 70-74%
  - C: 65-69%
  - D+: 60-64%
  - D: 55-59%
  - E: 0-54%

  3. Évaluation sciences (niveau taxonomique)

  Contexte : Évaluer selon Bloom/SOLO adapté sciences

  Échelle personnalisée :
  - Mémorisation (0-49%)
  - Compréhension (50-64%)
  - Application (65-74%)
  - Analyse (75-84%)
  - Synthèse (85-94%)
  - Évaluation (95-100%)

  4. Portfolio avec jalons

  Contexte : Suivi de progression par étapes

  Échelle jalons :
  - Non commencé (0%)
  - En développement (1-49%)
  - Satisfaisant (50-74%)
  - Excellent (75-100%)

  Problèmes connus

  Aucun problème majeur connu

  Le module est stable et fonctionnel.

  Points d'attention

  1. Génération de codes personnalisés :
  - Prend seulement 3 premiers caractères
  - Peut créer doublons si codes similaires
  - Solution : Valider manuellement après génération

  2. Plages uniformes :
  - Génération automatique répartit uniformément
  - Peut ne pas correspondre à la pédagogie souhaitée
  - Solution : Ajuster manuellement min/max après génération

  3. valeurCalcul :
  - Utilisée pour convertir niveau → pourcentage
  - Par défaut = moyenne (min + max) / 2
  - Important : Ajuster si conversion souhaitée différente

  Règles de modification

  ⚠️ ZONES CRITIQUES

  Niveaux par défaut :
  - ❌ niveauxDefaut protégé (taxonomie SOLO officielle)
  - Modification = impact sur toutes nouvelles échelles

  Structure échelle :
  - ❌ Structure { id, nom, niveaux, config } protégée
  - Modules externes dépendent de cette structure

  Palette :
  - ⚠️ Modifier avec prudence (20 couleurs établies)

  ✅ ZONES MODIFIABLES

  Commentaires et documentation :
  // ✅ AUTORISÉ - Ajouter commentaires

  Textes d'interface :
  // ✅ AUTORISÉ - Modifier libellés
  '<option value="">-- Nouvelle échelle --</option>'

  Couleurs de palette :
  // ✅ AUTORISÉ - Ajouter couleurs
  paletteCouleurs.push({ nom: 'Rose', valeur: '#e91e63' });

  Niveaux supplémentaires par défaut :
  // ✅ AUTORISÉ AVEC PRUDENCE - Ajouter niveaux SOLO
  // Vérifier cohérence taxonomique

  Validations :
  // ✅ AUTORISÉ - Renforcer validations
  if (niveau.min < 0 || niveau.max > 100) {
      erreurs.push('Plage invalide (0-100)');
  }

  Historique

  - Version initiale (index 50, 10-10-2025) :
    - Création du module d'échelles
    - Niveaux SOLO par défaut (I-D-M-E)
    - Gestion des niveaux (ajout, modification, suppression)
    - Palette de 20 couleurs
    - Aperçu visuel
  - Modularisation (10-10-2025a) :
    - Système de templates d'échelles
    - Duplication d'échelles
    - Configuration globale (type, seuil)
    - Génération automatique depuis codes personnalisés
    - Intégration avec module productions
  - Améliorations continues :
    - Champ valeurCalcul pour conversion niveau → %
    - Validation robuste des plages
    - Notifications succès
  - État actuel : Module stable, utilisé en production

  ---
  Référence code : /js/echelles.js (1110 lignes)

  Modules liés :
  - config.js (sécurité)
  - productions.js (utilise échelles pour évaluation)
  - cartouches.js (utilise niveaux pour rétroactions)

  Statut : ✅ STABLE - Module source pour échelles de performance

  Fondements théoriques : Taxonomie SOLO (Biggs & Collis, 1982), adaptée aux PAN
  (Standards-Based Grading)
