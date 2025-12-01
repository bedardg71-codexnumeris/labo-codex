Je vais générer la documentation complète pour liste-evaluations.js.

  ---
  MODULE liste-evaluations.js

  📚 Documentation technique complète

  ---
  1. Vue d'ensemble

  liste-evaluations.js gère l'affichage de la liste exhaustive des évaluations
  (existantes + manquantes) et calcule les indices de Complétion (C) sommatif et
  alternatif pour le système de monitorage.

  Lignes de code : 631 lignesVersion : Module 16Fichier : /js/liste-evaluations.js

  ---
  2. Type de module

  HYBRID : Ce module a un double rôle :
  - SOURCE : Génère indicesEvaluation.completion avec les indices C sommatif et
  alternatif
  - LECTEUR/AFFICHAGE : Affiche le tableau exhaustif des évaluations avec filtres
  et actions

  Architecture similaire à : saisie-presences.js (structure identique pour les
  indices)

  ---
  3. Données gérées

  3.1 Données générées (SOURCE)

  indicesEvaluation.completion

  Type : Objet avec indices sommatif et alternatifFormat localStorage : JSON
  stringifié (intégré dans indicesEvaluation)

  Structure complète :
  {
    completion: {
      sommatif: {
        "1234567": 0.75,      // 75% des artefacts remis (depuis le début)
        "2345678": 0.50       // 50% des artefacts remis
      },
      alternatif: {
        "1234567": 0.80,      // 80% des N meilleurs artefacts
        "2345678": 0.60       // 60% des N meilleurs artefacts
      },
      dateCalcul: "2025-10-23T14:30:00.000Z"
    },
    performance: {
      // Géré par evaluation.js
    }
  }

  Formules :
  - Complétion sommative : nbArtefactsRemis / totalAttendu
  - Complétion alternative : nbMeilleursArtefactsRemis / N (N configurable dans
  PAN)

  Source unique : liste-evaluations.js (fonction
  calculerEtSauvegarderIndiceCompletion())Lecteurs : tableau-bord-apercu.js,
  evaluation.js (fonction genererBadgeCompletion())

  ---
  3.2 Données lues (LECTEUR)

  | Clé localStorage        | Source         | Usage
           |
  |-------------------------|----------------|------------------------------------
  ---------|
  | evaluationsSauvegardees | evaluation.js  | Liste des évaluations complétées
           |
  | groupeEtudiants         | groupe.js      | Liste des étudiants
           |
  | listeGrilles            | productions.js | Productions attendues
           |
  | modalitesEvaluation     | pratiques.js   | Config PAN (nombre d'artefacts
  alternatifs) |
  | cartouches_{grilleId}   | cartouches.js  | Noms des cartouches
           |
  | pratiqueNotation        | pratiques.js   | Mode d'affichage des notes
           |

  ---
  4. API publique

  4.1 Fonctions de calcul des indices (SOURCE)

  calculerEtSauvegarderIndiceCompletion()

  Fonction orchestratrice : calcule les deux indices de complétion.

  calculerEtSauvegarderIndiceCompletion()
  // Retourne : { sommatif: {...}, alternatif: {...}, dateCalcul: "..." }

  Fonctionnement :
  1. Récupère les étudiants actifs
  2. Appelle calculerCompletionSommative() pour chaque étudiant
  3. Appelle calculerCompletionAlternative() pour chaque étudiant
  4. Assemble la structure complète
  5. Fusionne dans indicesEvaluation
  6. Sauvegarde dans localStorage

  Architecture identique à : calculerEtSauvegarderIndicesAssiduite() dans
  saisie-presences.js

  Appelée par :
  - initialiserListeEvaluations() au chargement
  - sauvegarderEvaluation() dans evaluation.js (après chaque évaluation)

  ---
  calculerCompletionSommative(da)

  Calcule la complétion sommative (depuis le début du trimestre).

  const indiceSommatif = calculerCompletionSommative("1234567")
  // Retourne : 0.75 (75%)

  Formule : Artefacts remis ÷ Total artefacts attendus

  Fonctionnement :
  1. Récupère toutes les productions (exclut les portfolios)
  2. Compte les évaluations de l'étudiant
  3. Calcule : nbRemis / totalAttendus
  4. Plafonne à 1.0 (100%)

  Exemple :
  // 6 artefacts remis sur 8 attendus
  calculerCompletionSommative("1234567")
  // Retourne : 0.75

  ---
  calculerCompletionAlternative(da)

  Calcule la complétion alternative (sur les N meilleurs artefacts).

  const indiceAlternatif = calculerCompletionAlternative("1234567")
  // Retourne : 0.80 (80%)

  Formule : Nombre de meilleurs artefacts remis ÷ N

  Fonctionnement :
  1. Récupère le nombre N depuis modalitesEvaluation.configPAN.nombreArtefacts
  (défaut: 3)
  2. Récupère les évaluations de l'étudiant
  3. Trie par note décroissante
  4. Prend les N meilleurs
  5. Calcule : meilleurs.length / N

  Exemple :
  // Configuration: N = 3 meilleurs artefacts
  // Étudiant a 5 évaluations, notes: 85%, 78%, 90%, 65%, 72%
  // Les 3 meilleurs: 90%, 85%, 78%
  calculerCompletionAlternative("1234567")
  // Retourne : 1.0 (3 meilleurs sur 3 = 100%)

  // Si l'étudiant n'a que 2 évaluations
  // Retourne : 0.67 (2 sur 3 = 67%)

  ---
  4.2 Fonctions d'affichage (LECTEUR)

  initialiserListeEvaluations()

  Initialise la page Liste des évaluations.

  initialiserListeEvaluations()

  Fonctionnement :
  1. Calcule les indices C (appelle calculerEtSauvegarderIndiceCompletion())
  2. Charge les données (évaluations, étudiants, productions)
  3. Initialise les événements des filtres
  4. Initialise le bouton de réinitialisation

  Appelée par : main.js au chargement (ligne 163)

  ---
  chargerDonneesEvaluations()

  Charge toutes les données et affiche le tableau.

  chargerDonneesEvaluations()

  Fonctionnement :
  1. Charge les données selon le mode actif (via obtenirDonneesSelonMode())
  2. Extrait les groupes uniques
  3. Génère les options des filtres
  4. Appelle afficherTableauEvaluations()

  ---
  afficherTableauEvaluations(evaluations, productions, etudiants)

  Affiche le tableau exhaustif (évaluées + non évaluées).

  afficherTableauEvaluations(evaluations, productions, etudiants)

  Fonctionnement :
  1. Construit la liste complète avec construireLignesEvaluations()
  2. Applique les filtres avec appliquerFiltresSurLignes()
  3. Génère le HTML avec genererLigneHTML()
  4. Met à jour le compteur
  5. Attache les événements

  Affichage : Tableau exhaustif (étudiants × productions)

  ---
  construireLignesEvaluations(evaluations, productions, etudiants)

  Construit la liste complète (évaluations + manquantes).

  const lignes = construireLignesEvaluations(evaluations, productions, etudiants)

  Retour :
  [
    {
      da: "1234567",
      nom: "Tremblay",
      groupe: "1",
      productionId: "PROD_001",
      productionNom: "Analyse littéraire 1",
      grilleNom: "Grille SRPNF",
      cartoucheId: "CART_001",
      cartoucheNom: "Cartouche standard",
      note: "78.5%",
      niveauFinal: "M",
      statut: "evalue",              // ou "non-evalue"
      evaluationId: "EVAL_123",
      verrouille: false
    },
    // ...
  ]

  Principe : Pour chaque étudiant × production, vérifie si évaluation existe.

  ---
  4.3 Fonctions de filtrage

  appliquerFiltres()

  Applique les filtres sélectionnés et recharge le tableau.

  appliquerFiltres()

  Filtres disponibles :
  - Groupe : Filtre par groupe (ex: "Groupe 1")
  - Production : Filtre par production (ex: "Analyse littéraire 1")
  - Statut : "evalue" ou "non-evalue"
  - Note : Par tranche (0-59%, 60-69%, etc.) ou par niveau IDME (I, D, M, E)

  Appelée par : onChange sur les selects de filtres

  ---
  reinitialiserFiltres()

  Réinitialise tous les filtres à leur valeur par défaut.

  reinitialiserFiltres()

  Effet : Affiche toutes les évaluations (étudiants × productions)

  ---
  4.4 Fonctions d'actions

  modifierEvaluation(da, productionId)

  Navigue vers la page d'évaluation avec pré-sélection.

  modifierEvaluation("1234567", "PROD_001")

  État actuel : Affiche une alerte (navigation à implémenter)TODO : Naviguer vers
  Évaluations → Saisie avec étudiant et production pré-sélectionnés

  ---
  supprimerEvaluation(evaluationId)

  Supprime une évaluation (avec confirmation).

  supprimerEvaluation("EVAL_123")

  Fonctionnement :
  1. Demande confirmation
  2. Filtre l'évaluation depuis evaluationsSauvegardees
  3. Sauvegarde la liste mise à jour
  4. Recharge le tableau

  Protection : Pas de mode lecture seule vérifié (à ajouter)

  ---
  toggleVerrouillerEvaluation(evaluationId)

  Verrouille/Déverrouille une évaluation.

  toggleVerrouillerEvaluation("EVAL_123")

  Fonctionnement :
  1. Trouve l'évaluation
  2. Toggle evaluation.verrouille
  3. Sauvegarde
  4. Recharge le tableau

  Effet : Bouton change entre "Verrouiller" et "Déverrouiller"

  ---
  dupliquerEvaluation(evaluationId)

  Duplique une évaluation pour un autre étudiant.

  dupliquerEvaluation("EVAL_123")

  État actuel : Affiche une alerte (duplication à implémenter)TODO : Sélectionner
  l'étudiant cible, dupliquer les données

  ---
  ouvrirCartouche(cartoucheId, productionId)

  Navigue vers la cartouche dans les réglages.

  ouvrirCartouche("CART_001", "PROD_001")

  État actuel : Affiche une alerte (navigation à implémenter)TODO : Naviguer vers
  Réglages → Rétroaction avec cartouche pré-sélectionnée

  ---
  4.5 Fonctions utilitaires

  obtenirNomCartouche(grilleId, cartoucheId)

  Récupère le nom d'une cartouche.

  const nom = obtenirNomCartouche("GRILLE_001", "CART_001")
  // Retourne : "Cartouche standard"

  ---
  obtenirNoteAffichee(evaluation, pratiqueNotation)

  Obtient la note affichée selon la pratique de notation.

  // Mode sommatif
  obtenirNoteAffichee(eval, {pratique: "sommative"})
  // Retourne : "78.5%"

  // Mode alternatif (maîtrise)
  obtenirNoteAffichee(eval, {pratique: "alternative", typePAN: "maitrise"})
  // Retourne : "M"

  ---
  5. Dépendances

  5.1 Modules requis (doivent être chargés AVANT)

  01-config.js              Variables globales
  02-navigation.js          Fonctions de navigation
  03-groupe.js              Source de groupeEtudiants
  04-productions.js         Source de listeGrilles
  06-cartouches.js          Source de cartouches
  07-pratiques.js           Source de modalitesEvaluation
  09-evaluation.js          Source de evaluationsSauvegardees
  17-modes.js               Fonction obtenirDonneesSelonMode()

  5.2 Modules qui utilisent liste-evaluations.js

  tableau-bord-apercu.js    Lit indicesEvaluation.completion
  evaluation.js             Lit indicesEvaluation.completion pour badge PAN

  5.3 Variables globales utilisées

  Via obtenirDonneesSelonMode() :
  - evaluationsSauvegardees : Évaluations complétées
  - groupeEtudiants : Liste des étudiants

  ---
  6. Initialisation

  Ordre de chargement dans index.html

  <script src="js/config.js"></script>
  <script src="js/navigation.js"></script>
  <script src="js/groupe.js"></script>
  <script src="js/productions.js"></script>
  <script src="js/cartouches.js"></script>
  <script src="js/pratiques.js"></script>
  <script src="js/evaluation.js"></script>
  <script src="js/modes.js"></script>
  <script src="js/liste-evaluations.js"></script>  <!-- Ici -->
  <script src="js/main.js"></script>

  Appel dans main.js

  // PRIORITÉ 4 : MODULES AVANCÉS
  // MODULE 16: Liste des évaluations
  if (typeof initialiserListeEvaluations === 'function') {
      console.log('   → Module 16-liste-evaluations détecté');
      // Note: Initialisation différée lors de l'affichage de la sous-section
  }

  Appel dans navigation.js

  // evaluation.js:299-304
  case 'evaluations-liste':
      console.log('🔄 Rafraîchissement de la liste des évaluations...');
      if (typeof chargerListeEvaluationsRefonte === 'function') {
          setTimeout(() => chargerListeEvaluationsRefonte(), 100);
      }
      break;

  Note : L'initialisation se fait lors du switch vers la sous-section "Liste".

  Vérification de l'initialisation

  // Console navigateur
  console.log('Module Liste:', typeof initialiserListeEvaluations);
  // Retour attendu : 'function'

  const indices = JSON.parse(localStorage.getItem('indicesEvaluation'))
  console.log('Indices C:', indices.completion)
  // Retour attendu : { sommatif: {...}, alternatif: {...}, dateCalcul: "..." }

  console.log('Sommatif étudiant 1234567:',
  indices.completion.sommatif["1234567"])
  // Retour attendu : 0.75 (par exemple)

  ---
  7. Tests et vérification

  Test 1 : Calcul des indices C

  // Console navigateur
  calculerEtSauvegarderIndiceCompletion()

  const indices = JSON.parse(localStorage.getItem('indicesEvaluation'))
  console.log('Structure:', indices.completion)
  // Vérifier :
  // {
  //   sommatif: { "1234567": 0.75, ... },
  //   alternatif: { "1234567": 0.80, ... },
  //   dateCalcul: "2025-10-23T14:30:00.000Z"
  // }

  // Vérifier le calcul pour un étudiant
  console.log('Sommatif:', indices.completion.sommatif["1234567"])
  console.log('Alternatif:', indices.completion.alternatif["1234567"])

  Test 2 : Affichage du tableau exhaustif

  ÉTAPES :
  1. Aller dans Évaluations → Liste
  2. Vérifier que toutes les lignes s'affichent (étudiants × productions)
  3. Vérifier les badges de statut (vert "Évalué" / gris "Non évalué")
  4. Vérifier l'affichage des notes
  5. Vérifier les boutons d'action selon le statut

  VÉRIFICATION :
  - Nombre de lignes = Nb étudiants × Nb productions
  - Badge "Évalué" pour les évaluations existantes
  - Badge "Non évalué" pour les manquantes
  - Bouton "➕ Évaluer" pour les non évaluées
  - Boutons "Verrouiller/Modifier/Dupliquer/Supprimer" pour les évaluées

  Test 3 : Filtres

  ÉTAPES :
  1. Aller dans Évaluations → Liste
  2. Tester filtre Groupe : Sélectionner "Groupe 1"
     → Vérifier que seul le groupe 1 s'affiche
  3. Tester filtre Production : Sélectionner "Analyse 1"
     → Vérifier que seule cette production s'affiche
  4. Tester filtre Statut : Sélectionner "Évalué"
     → Vérifier que seules les évaluées s'affichent
  5. Tester filtre Note : Sélectionner "80-89%"
     → Vérifier le filtrage par tranche
  6. Cliquer "Réinitialiser"
     → Vérifier que tous les filtres se réinitialisent

  VÉRIFICATION :
  - Compteur mis à jour (ex: "12 évaluation(s)")
  - Filtres cumulatifs (peuvent se combiner)
  - Message "Aucun résultat" si aucune correspondance

  Test 4 : Actions sur une évaluation

  ÉTAPES :
  1. Trouver une évaluation existante
  2. Cliquer "Verrouiller"
     → Vérifier que le bouton devient "Déverrouiller"
  3. Cliquer "Modifier"
     → Vérifier l'alerte (navigation à implémenter)
  4. Cliquer "Dupliquer"
     → Vérifier l'alerte (duplication à implémenter)
  5. Cliquer "Supprimer"
     → Confirmer la suppression
     → Vérifier que la ligne passe en "Non évalué"

  VÉRIFICATION :
  localStorage.getItem('evaluationsSauvegardees')
  → L'évaluation supprimée n'apparaît plus

  Test 5 : Calcul sommatif vs alternatif

  // Scénario : Étudiant avec 5 évaluations
  // Notes : 85%, 78%, 90%, 65%, 72%
  // Total attendu : 8 artefacts
  // Config PAN : 3 meilleurs artefacts

  calculerEtSauvegarderIndiceCompletion()

  const indices = JSON.parse(localStorage.getItem('indicesEvaluation'))

  // Sommatif : 5 remis / 8 attendus = 62.5%
  console.log('Sommatif:', indices.completion.sommatif["1234567"])
  // Attendu : 0.625

  // Alternatif : 3 meilleurs / 3 = 100%
  console.log('Alternatif:', indices.completion.alternatif["1234567"])
  // Attendu : 1.0

  Test 6 : Intégration avec evaluation.js

  ÉTAPES :
  1. Aller dans Évaluations → Saisie
  2. Créer une nouvelle évaluation
  3. Sauvegarder
  4. Aller dans Évaluations → Liste
  5. Vérifier que la nouvelle évaluation apparaît
  6. Vérifier que l'indice C est recalculé

  VÉRIFICATION :
  const indices = JSON.parse(localStorage.getItem('indicesEvaluation'))
  console.log('Indice C après ajout:', indices.completion.sommatif["1234567"])
  → Doit être supérieur à l'indice précédent

  ---
  8. Problèmes connus et solutions

  Problème 1 : Indices C non calculés

  Symptôme : indicesEvaluation.completion est undefined.

  Cause : calculerEtSauvegarderIndiceCompletion() pas appelée au chargement.

  Solution : Vérifier que la fonction est bien appelée dans
  initialiserListeEvaluations() (ligne 149).

  Vérification :
  const indices = JSON.parse(localStorage.getItem('indicesEvaluation'))
  console.log('Completion existe?', !!indices.completion)
  // Doit retourner : true

  ---
  Problème 2 : Tableau vide alors qu'il y a des évaluations

  Symptôme : Le tableau affiche "Aucun résultat" malgré la présence d'évaluations.

  Cause : Les filtres sont actifs ou erreur dans construireLignesEvaluations().

  Solution :
  1. Cliquer sur "Réinitialiser les filtres"
  2. Vérifier la console pour des erreurs JavaScript
  3. Vérifier que listeGrilles contient des productions

  Vérification :
  const productions = JSON.parse(localStorage.getItem('listeGrilles'))
  console.log('Nb productions:', productions.length)
  // Doit être > 0

  ---
  Problème 3 : Notes affichées incorrectement

  Symptôme : Notes affichées en % alors que le mode PAN est activé.

  Cause : pratiqueNotation mal configurée dans localStorage.

  Solution :
  // Vérifier la config
  const pratique = JSON.parse(localStorage.getItem('pratiqueNotation'))
  console.log('Pratique:', pratique)

  // Si mode alternatif (maîtrise), les notes doivent être en lettres (I, D, M, E)
  // Si mode sommatif, les notes doivent être en %

  Correction : Aller dans Réglages → Pratiques de notation, vérifier/sauvegarder.

  ---
  Problème 4 : Indice alternatif = 0% alors qu'il y a des évaluations

  Symptôme : indicesEvaluation.completion.alternatif["1234567"] retourne 0.

  Cause : Pas de nombreArtefacts configuré dans modalitesEvaluation.configPAN.

  Solution :
  // Vérifier la config PAN
  const config = JSON.parse(localStorage.getItem('modalitesEvaluation'))
  console.log('Nombre artefacts PAN:', config.configPAN?.nombreArtefacts)

  // Si undefined, le défaut est 3
  // Pour changer : Aller dans Réglages → Pratiques de notation → Configuration 
  PAN

  ---
  Problème 5 : Suppression d'évaluation ne recalcule pas les indices

  Symptôme : Après suppression, l'indice C reste inchangé.

  Cause : supprimerEvaluation() ne recalcule pas les indices.

  Solution : Ajouter l'appel au recalcul (ligne 596) :
  function supprimerEvaluation(evaluationId) {
      // ... code existant ...
      localStorage.setItem('evaluationsSauvegardees',
  JSON.stringify(evaluationsFiltered));

      // 🆕 AJOUTER ICI
      calculerEtSauvegarderIndiceCompletion();

      chargerDonneesEvaluations();
  }

  ---
  Problème 6 : Filtre par note ne fonctionne pas

  Symptôme : Le filtre par note (tranche ou niveau IDME) ne filtre rien.

  Cause : Erreur de parsing dans appliquerFiltresSurLignes().

  Solution : Vérifier la logique (lignes 442-452).

  Debug :
  // Console navigateur
  const lignes = construireLignesEvaluations(evaluations, productions, etudiants)
  console.table(lignes.map(l => ({ nom: l.nom, note: l.note, niveauFinal:
  l.niveauFinal })))

  // Vérifier les valeurs de note et niveauFinal

  ---
  9. Règles de modification

  ⚠️ ZONES PROTÉGÉES - NE PAS MODIFIER

  1. Fonction calculerCompletionSommative() (lignes 81-103)
    - Formule : nbRemis / totalAttendus
    - Respect du Guide de monitorage
  2. Fonction calculerCompletionAlternative() (lignes 112-140)
    - Formule : nbMeilleurs / N
    - Tri par note décroissante
    - Configuration depuis modalitesEvaluation.configPAN.nombreArtefacts
  3. Structure de indicesEvaluation.completion (lignes 45-49)
    - Format identique à indicesAssiduite (cohérence système)
    - Toute modification affecte tableau-bord-apercu.js et evaluation.js
  4. Fonction construireLignesEvaluations() (lignes 330-384)
    - Génère la liste exhaustive (évaluations + manquantes)
    - Respect du principe : 1 ligne par étudiant × production

  ---
  ✅ Zones modifiables

  1. Styles CSS inline : Adapter les couleurs et espacements
  2. Messages utilisateur : Notifications, alertes
  3. Options de filtres : Ajouter de nouveaux critères
  4. Actions : Implémenter modifierEvaluation(), dupliquerEvaluation(),
  ouvrirCartouche()
  5. Affichage des notes : Personnaliser selon les pratiques de notation

  ---
  🛠️ Pour implémenter la navigation

  Exemple : Implémenter modifierEvaluation()

  // Remplacer lignes 559-564
  function modifierEvaluation(da, productionId) {
      console.log(`✏️ Navigation vers évaluation: DA ${da}, Production 
  ${productionId}`);

      // 1. Stocker les pré-sélections
      sessionStorage.setItem('preselection_da', da);
      sessionStorage.setItem('preselection_production', productionId);

      // 2. Naviguer vers la sous-section
      afficherSousSection('evaluations-saisie');

      // 3. Dans evaluation.js, détecter les pré-sélections au chargement
      // et pré-remplir les selects
  }

  ---
  10. Historique

  Version actuelle (Module 16)

  État : ✅ FonctionnelDernière modification : Ajout du calcul des indices C
  sommatif et alternatif

  Fonctionnalités complétées :
  - Calcul des indices C (sommatif et alternatif)
  - Affichage tableau exhaustif (évaluations + manquantes)
  - Filtres (groupe, production, statut, note)
  - Actions : verrouiller, supprimer
  - Intégration avec evaluation.js (recalcul automatique)
  - Support des pratiques de notation (sommatif/PAN)

  Fonctionnalités à implémenter (TODO) :
  - Navigation vers page d'évaluation (modifier)
  - Duplication d'évaluation
  - Ouverture de cartouche dans réglages
  - Tri du tableau (nom, groupe, note)
  - Export CSV/PDF des évaluations
  - Ajout d'un appel à calculerEtSauvegarderIndiceCompletion() dans
  supprimerEvaluation()

  Bugs connus :
  - Aucun bug critique identifié

  ---
  11. Support et ressources

  Documentation pédagogique

  - Guide de monitorage : https://codexnumeris.org/apropos
  - Formules des indices : CLAUDE.md, section "Indices A-C-P"
  - Pratiques alternatives : CLAUDE.md, section "PAN"

  Fichiers de référence

  CLAUDE.md                    Contexte général du projet
  structure-modulaire.txt      Architecture complète
  noms_stables.json            Noms protégés

  Modules connexes à consulter

  evaluation.js         Pour comprendre la structure des évaluations
  saisie-presences.js   Architecture similaire (indices A)
  pratiques.js          Pour comprendre la config PAN
  modes.js              Pour comprendre obtenirDonneesSelonMode()

  Debug dans la console

  // Vérifier les indices C
  const indices = JSON.parse(localStorage.getItem('indicesEvaluation'))
  console.log('Indices C:', indices.completion)
  console.table(indices.completion.sommatif)
  console.table(indices.completion.alternatif)

  // Recalculer manuellement
  calculerEtSauvegarderIndiceCompletion()

  // Voir les lignes construites
  const evals = obtenirDonneesSelonMode('evaluationsSauvegardees')
  const etudiants = obtenirDonneesSelonMode('groupeEtudiants')
  const prods = JSON.parse(localStorage.getItem('listeGrilles'))
  const lignes = construireLignesEvaluations(evals, prods, etudiants)
  console.table(lignes)

  // Tester le calcul pour un étudiant
  console.log('Sommatif:', calculerCompletionSommative("1234567"))
  console.log('Alternatif:', calculerCompletionAlternative("1234567"))

  ---
  📌 Note importante : Ce module génère les indices C (Complétion) qui sont
  essentiels au calcul du risque d'échec (Risque = 1 - A × C × P). Toute
  modification des formules doit respecter le Guide de monitorage.

  ---
  Fin de la documentation liste-evaluations.js