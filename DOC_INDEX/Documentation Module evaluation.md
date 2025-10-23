Je vais générer la documentation complète pour evaluation.js.

  ---
  MODULE evaluation.js

  📚 Documentation technique complète

  ---
  1. Vue d'ensemble

  evaluation.js gère l'interface d'évaluation des productions étudiantes et le
  calcul des indices de monitorage C (Complétion) et P (Performance).

  Lignes de code : 1749 lignesVersion : Index 50 (10 octobre 2025a)Fichier :
  /js/evaluation.js

  ---
  2. Type de module

  HYBRID : Ce module a un double rôle :
  - SOURCE : Génère evaluationsSauvegardees et indicesEvaluation
  - LECTEUR/AFFICHAGE : Affiche l'interface d'évaluation et la liste des
  évaluations

  Ce module est au cœur du système de monitorage pédagogique.

  ---
  3. Données gérées

  3.1 Données générées (SOURCE)

  A) evaluationsSauvegardees

  Type : Array d'objets EvaluationFormat localStorage : JSON stringifié

  Structure complète :
  [
    {
      id: "EVAL_1729785600000",
      etudiantDA: "1234567",
      etudiantNom: "Alexis Tremblay",
      groupe: "1",
      productionId: "PROD_001",
      productionNom: "Analyse littéraire 1",
      grilleId: "GRILLE_001",
      grilleNom: "Grille SRPNF",
      echelleId: "ECHELLE_001",
      cartoucheId: "CART_001",
      dateEvaluation: "2025-10-23T14:30:00.000Z",
      statutRemise: "remis",
      criteres: [
        {
          critereId: "CRIT001",
          critereNom: "Structure",
          niveauSelectionne: "M",
          retroaction: "Structure claire et cohérente",
          ponderation: 15
        },
        // ... autres critères
      ],
      noteFinale: 78.5,
      niveauFinal: "M",
      retroactionFinale: "Bonjour Fictigor !\n\nVoici quelques observations 
  :\n\nStructure (M) : Structure claire et cohérente\n...",
      optionsAffichage: {
        description: true,
        objectif: true,
        tache: true,
        adresse: true,
        contexte: true
      }
    }
  ]

  Source unique : evaluation.js (fonction sauvegarderEvaluation())Lecteurs :
  profil-etudiant.js, liste-evaluations.js, statistiques.js

  ---
  B) indicesEvaluation

  Type : Objet avec indices C et P par étudiantFormat localStorage : JSON
  stringifié

  Structure :
  {
    "1234567": {
      completion: 0.75,        // 75% des artefacts remis
      performance: 0.80,       // 80% de performance moyenne
      nbEvaluations: 6,        // Nombre d'évaluations complétées
      nbAttendus: 8            // Nombre d'artefacts attendus
    }
  }

  Formules :
  - Complétion (C) : nbEvaluations / nbAttendus
  - Performance (P) : (moyenne des 3 dernières notes IDME) / 4
  - Risque d'échec : 1 - (A × C × P)

  Source unique : evaluation.js (fonction
  calculerEtSauvegarderIndicesEvaluation())Lecteurs : tableau-bord-apercu.js,
  liste-evaluations.js, profil-etudiant.js

  ---
  3.2 Données lues (LECTEUR)

  | Clé localStorage      | Source              | Usage
          |
  |-----------------------|---------------------|---------------------------------
  --------|
  | groupeEtudiants       | groupe.js           | Liste des étudiants à évaluer
          |
  | listeGrilles          | productions.js      | Productions/artefacts
  disponibles       |
  | grillesTemplates      | grilles.js          | Grilles de critères SRPNF
          |
  | niveauxEchelle        | echelles.js         | Échelle IDME (I-D-M-E)
          |
  | cartouches_{grilleId} | cartouches.js       | Rétroactions par critère ×
  niveau       |
  | modalitesEvaluation   | pratiques.js        | Configuration PAN
  (sommatif/alternatif) |
  | indicesAssiduite      | saisie-presences.js | Indices A pour calcul du risque
          |

  ---
  4. API publique

  4.1 Fonctions principales (interface d'évaluation)

  initialiserModuleEvaluation()

  Initialise le module d'évaluation.

  initialiserModuleEvaluation()

  Fonctionnement :
  1. Vérifie que la section est active
  2. Charge toutes les listes dans les selects
  3. Coche les options par défaut
  4. Charge la liste si active

  Appelée par : main.js au chargement

  ---
  sauvegarderEvaluation()

  Sauvegarde l'évaluation complète dans localStorage.

  sauvegarderEvaluation()

  Fonctionnement :
  1. Valide les champs obligatoires
  2. Collecte toutes les données du formulaire
  3. Crée l'objet Evaluation complet
  4. Ajoute à evaluationsSauvegardees
  5. Recalcule l'indice C (appelle calculerEtSauvegarderIndiceCompletion())
  6. Affiche notification de succès

  Protection : Bloqué en mode anonymisation

  ---
  calculerNote()

  Calcule la note finale pondérée en temps réel.

  calculerNote()

  Fonctionnement :
  1. Récupère tous les niveaux sélectionnés
  2. Calcule la moyenne pondérée : Σ(valeurNiveau × pondération) / Σ(pondérations)
  3. Détermine le niveau global selon l'échelle
  4. Met à jour l'affichage avec couleur
  5. Sauvegarde dans evaluationEnCours

  Appelée par : niveauSelectionne() après chaque sélection

  ---
  genererRetroaction(num)

  Génère la rétroaction finale automatiquement.

  genererRetroaction(1)

  Fonctionnement :
  1. Vérifie les options cochées
  2. Récupère les infos de la production
  3. Ajoute l'adresse personnalisée si cochée
  4. Ajoute le contexte de la cartouche si coché
  5. Assemble les commentaires des critères
  6. Ajoute le niveau global
  7. Remplit le textarea

  Appelée par : niveauSelectionne() (temps réel)

  ---
  4.2 Fonctions de calcul des indices (SOURCE)

  calculerEtSauvegarderIndicesEvaluation()

  Calcule et sauvegarde les indices C et P.

  calculerEtSauvegarderIndicesEvaluation()
  // Retourne : Object { "da": {completion, performance, nbEvaluations, 
  nbAttendus} }

  Formules :
  // Indice C (Complétion)
  completion = nbEvaluations / nbAttendus

  // Indice P (Performance)
  const dernières3 = evaluations.slice(0, 3)
  const moyenneNotes = Σ(notes) / 3
  performance = moyenneNotes / 4

  Sauvegarde : localStorage.indicesEvaluation

  ---
  calculerRisqueEchec(assiduite, completion, performance)

  Calcule le risque d'échec selon le Guide de monitorage.

  const risque = calculerRisqueEchec(0.80, 0.75, 0.70)
  // Retourne : 0.58 (58% de risque)

  Formule : Risque = 1 - (A × C × P)

  Niveaux de risque :
  - > 0.7 : Critique
  - > 0.5 : Très élevé
  - > 0.4 : Élevé
  - > 0.3 : Modéré
  - > 0.2 : Faible
  - ≤ 0.2 : Minimal

  ---
  4.3 Fonctions de liste (AFFICHAGE)

  chargerListeEvaluationsRefonte()

  Charge et affiche la liste des évaluations en accordéon.

  chargerListeEvaluationsRefonte()

  Fonctionnement :
  1. Récupère étudiants, évaluations, indices A/C/P
  2. Groupe les évaluations par étudiant
  3. Prépare les données pour l'affichage
  4. Charge les filtres
  5. Affiche la liste
  6. Met à jour les statistiques
  7. Restaure le tri sauvegardé

  Appelée par : navigation.js lors du switch vers la sous-section

  ---
  toggleEtudiantEval(da)

  Toggle l'affichage des détails d'un étudiant (accordéon).

  toggleEtudiantEval("1234567")

  Effet visuel :
  - Affiche/masque le tableau des évaluations
  - Change l'icône ▶ / ▼

  ---
  trierListeEvaluations()

  Trie la liste selon le critère sélectionné.

  trierListeEvaluations()

  Critères de tri :
  - nom-asc : Ordre alphabétique
  - completion-asc : Complétion croissante
  - completion-desc : Complétion décroissante

  Sauvegarde : localStorage.preferenceTriEvaluations

  ---
  4.4 Fonctions utilitaires

  convertirNoteEnValeur(note)

  Convertit une note lettre en valeur numérique.

  convertirNoteEnValeur("M")  // Retourne : 4
  convertirNoteEnValeur("D")  // Retourne : 2

  Table de conversion :
  {
    'M': 4, 'Maîtrise': 4,
    'I': 3, 'Intermédiaire': 3,
    'D': 2, 'Développement': 2,
    'B': 1, 'Base': 1,
    'O': 0, 'Observation': 0
  }

  ---
  obtenirCouleurNiveau(codeNiveau)

  Récupère la couleur CSS associée à un niveau.

  const couleur = obtenirCouleurNiveau("M")
  // Retourne : "var(--vert-succes)" ou "#4caf50"

  Source : niveauxEchelle dans localStorage

  ---
  genererBadgeCompletion(etudiant)

  Génère le HTML du badge de complétion selon les réglages PAN.

  const html = genererBadgeCompletion(etudiant)

  Modes d'affichage :
  - Sommatif seul : C 75%
  - Alternatif seul : C (PAN) 80%
  - Les deux : C 75% / 80%

  Configuration : modalitesEvaluation.affichageTableauBord

  ---
  5. Dépendances

  5.1 Modules requis (doivent être chargés AVANT)

  01-config.js          Variables globales, evaluationEnCours
  02-navigation.js      Fonction afficherSousSection()
  03-groupe.js          Source de groupeEtudiants
  04-grilles.js         Source de grillesTemplates
  05-echelles.js        Source de niveauxEchelle
  06-cartouches.js      Source de cartouches
  07-pratiques.js       Source de modalitesEvaluation
  08-saisie-presences.js Source de indicesAssiduite

  5.2 Modules qui utilisent evaluation.js

  tableau-bord-apercu.js   Lit indicesEvaluation pour affichage
  profil-etudiant.js       Lit evaluationsSauvegardees
  liste-evaluations.js     Lit evaluationsSauvegardees
  statistiques.js          Lit les deux clés

  5.3 Variables globales utilisées

  evaluationEnCours = {
    etudiantDA: "1234567",
    productionId: "PROD_001",
    grilleId: "GRILLE_001",
    echelleId: "ECHELLE_001",
    cartoucheId: "CART_001",
    criteres: {
      "CRIT001": "M",
      "CRIT002": "D"
    },
    statutRemise: "remis",
    noteMoyenne: 78.5,
    niveauFinal: "M"
  }

  Déclarée dans : config.jsUtilisée pour : Stocker l'évaluation en cours avant
  sauvegarde

  ---
  6. Initialisation

  Ordre de chargement dans index.html

  <script src="js/config.js"></script>
  <script src="js/navigation.js"></script>
  <script src="js/groupe.js"></script>
  <script src="js/grilles.js"></script>
  <script src="js/echelles.js"></script>
  <script src="js/cartouches.js"></script>
  <script src="js/pratiques.js"></script>
  <script src="js/saisie-presences.js"></script>
  <script src="js/evaluation.js"></script>  <!-- Ici -->
  <script src="js/main.js"></script>

  Appel dans main.js

  // PRIORITÉ 4 : MODULES AVANCÉS
  if (typeof initialiserModuleEvaluation === 'function') {
      console.log('   → Module Evaluation détecté');
      initialiserModuleEvaluation();
  }

  Vérification de l'initialisation

  // Console navigateur
  console.log('Module Évaluation:', typeof initialiserModuleEvaluation);
  // Retour attendu : 'function'

  console.log('Évaluations:', localStorage.getItem('evaluationsSauvegardees'));
  // Retour attendu : "[{...}, {...}]"

  console.log('Indices:', localStorage.getItem('indicesEvaluation'));
  // Retour attendu : '{"1234567": {...}}'

  ---
  7. Tests et vérification

  Test 1 : Créer une évaluation complète

  ÉTAPES :
  1. Aller dans Évaluations → Saisie
  2. Sélectionner un groupe
  3. Sélectionner un étudiant
  4. Sélectionner une production
  5. Sélectionner une grille
  6. Sélectionner une échelle
  7. Sélectionner une cartouche
  8. Changer le statut en "Remis"
  9. Sélectionner un niveau pour chaque critère
  10. Vérifier que la note se calcule automatiquement
  11. Vérifier que la rétroaction s'affiche
  12. Cliquer "Sauvegarder"
  13. Vérifier la notification de succès

  VÉRIFICATION :
  localStorage.getItem('evaluationsSauvegardees')
  → Doit contenir la nouvelle évaluation

  localStorage.getItem('indicesEvaluation')
  → Doit être recalculé avec la nouvelle évaluation

  Test 2 : Calcul des indices C et P

  // Console navigateur
  calculerEtSauvegarderIndicesEvaluation()

  const indices = JSON.parse(localStorage.getItem('indicesEvaluation'))
  console.log(indices)

  // Vérifier la structure :
  // {
  //   "1234567": {
  //     completion: 0.75,
  //     performance: 0.80,
  //     nbEvaluations: 6,
  //     nbAttendus: 8
  //   }
  // }

  Test 3 : Affichage de la liste avec accordéon

  ÉTAPES :
  1. Aller dans Évaluations → Liste
  2. Vérifier que tous les étudiants s'affichent
  3. Vérifier l'affichage de l'indice C
  4. Cliquer sur un étudiant pour déplier
  5. Vérifier le tableau des productions
  6. Vérifier les badges de statut
  7. Tester les filtres (groupe, production, statut)
  8. Tester le tri (nom, complétion)
  9. Vérifier que la préférence est sauvegardée

  VÉRIFICATION :
  - Accordéons fonctionnels (▶ / ▼)
  - Badge C correctement affiché
  - Couleur selon le taux (rouge < 50%, orange < 75%, vert >= 75%)
  - Tri persistent entre les sessions

  Test 4 : Calcul du risque d'échec

  // Console navigateur
  const risque = calculerRisqueEchec(0.80, 0.75, 0.70)
  console.log('Risque:', risque)  // 0.58

  const classe = obtenirClasseRisque(risque)
  console.log('Classe:', classe)  // "risque-tres-eleve"

  Test 5 : Badge PAN (sommatif/alternatif)

  ÉTAPES :
  1. Aller dans Réglages → Pratiques de notation
  2. Cocher "Afficher sommatif" seulement
  3. Aller dans Évaluations → Liste
  4. Vérifier affichage : "C 75%"
  5. Retourner dans Réglages
  6. Cocher "Afficher alternatif" aussi
  7. Aller dans Évaluations → Liste
  8. Vérifier affichage : "C 75% / 80%"

  VÉRIFICATION :
  - Badge s'adapte aux réglages PAN
  - Deux valeurs affichées si les deux modes activés

  ---
  8. Problèmes connus et solutions

  Problème 1 : Indices C non calculés après sauvegarde

  Symptôme : Après sauvegarde d'une évaluation, l'indice C ne se met pas à jour.

  Cause : La fonction calculerEtSauvegarderIndiceCompletion() n'est pas appelée
  automatiquement.

  Solution :
  // evaluation.js, ligne 808
  if (typeof calculerEtSauvegarderIndiceCompletion === 'function') {
      calculerEtSauvegarderIndiceCompletion();
  }

  Vérification :
  // Après sauvegarde, vérifier
  const indices = JSON.parse(localStorage.getItem('indicesEvaluation'))
  console.log('Indices mis à jour:', indices)

  ---
  Problème 2 : Note ne se calcule pas

  Symptôme : La note reste à "0.0 %" même après sélection des niveaux.

  Cause : Aucune échelle de performance configurée dans localStorage.

  Solution :
  1. Aller dans Réglages → Échelles
  2. Créer une échelle IDME
  3. Définir les niveaux avec plages (ex: M = 75-100%)
  4. Sauvegarder
  5. Retourner dans Évaluations → Saisie
  6. Sélectionner cette échelle

  Vérification :
  const niveaux = JSON.parse(localStorage.getItem('niveauxEchelle'))
  console.log('Échelle disponible:', niveaux.length > 0)

  ---
  Problème 3 : Rétroaction vide

  Symptôme : Le textarea de rétroaction reste vide après sélection des niveaux.

  Cause : Aucune cartouche sélectionnée ou cartouche incomplète.

  Solution :
  1. Vérifier qu'une cartouche est bien sélectionnée
  2. Aller dans Réglages → Cartouches
  3. Ouvrir la cartouche utilisée
  4. Vérifier que tous les commentaires sont remplis (matrice critères × niveaux)
  5. Sauvegarder
  6. Retourner dans Évaluations → Saisie

  Vérification :
  const grilleId = evaluationEnCours.grilleId
  const cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`))
  const cartouche = cartouches.find(c => c.id === evaluationEnCours.cartoucheId)
  console.log('Commentaires:', Object.keys(cartouche.commentaires).length)

  ---
  Problème 4 : Liste d'évaluations ne se trie pas

  Symptôme : Le tri par nom ou complétion ne fonctionne pas.

  Cause : La fonction trierListeEvaluations() ne met pas à jour la variable
  globale.

  Solution : Vérifier que donneesEvaluationsFiltrees est bien mise à jour à la
  ligne 1587.

  Code correct :
  // Ligne 1587
  donneesEvaluationsFiltrees = donneesTries;
  afficherListeEvaluations(donneesTries);

  ---
  Problème 5 : Badge C affiche "NaN%"

  Symptôme : Le badge de complétion affiche "NaN%" au lieu d'un pourcentage.

  Cause : Structure des indicesEvaluation incompatible (ancienne vs nouvelle).

  Solution : Le module gère désormais les deux structures (lignes 1164-1171 et
  1224-1230).

  Vérification :
  const indices = JSON.parse(localStorage.getItem('indicesEvaluation'))

  // Nouvelle structure (préférée)
  console.log(indices.completion?.sommatif)

  // Ancienne structure (compatibilité)
  console.log(indices["1234567"]?.completion)

  ---
  Problème 6 : Erreur "Cannot read property 'id' of undefined"

  Symptôme : Erreur JavaScript lors de l'affichage de la liste.

  Cause : Évaluation corrompue sans productionId ou grilleId.

  Solution :
  // Console navigateur
  let evals = JSON.parse(localStorage.getItem('evaluationsSauvegardees'))

  // Filtrer les évaluations invalides
  evals = evals.filter(e => e.etudiantDA && e.productionId && e.grilleId)

  localStorage.setItem('evaluationsSauvegardees', JSON.stringify(evals))

  // Recharger la page
  location.reload()

  ---
  9. Règles de modification

  ⚠️ ZONES PROTÉGÉES - NE PAS MODIFIER

  1. Fonction calculerNote() (lignes 505-580)
    - Formule de calcul pondéré
    - Logique de détermination du niveau
    - Respecte le Guide de monitorage
  2. Fonction calculerEtSauvegarderIndicesEvaluation() (lignes 949-1013)
    - Formules C et P
    - Respect strict du Guide de monitorage
    - C = nbRemis / nbAttendus
    - P = moyenne(3 dernières) / 4
  3. Fonction calculerRisqueEchec() (lignes 1035-1040)
    - Formule : 1 - (A × C × P)
    - NE JAMAIS MODIFIER
  4. Structure de l'objet Evaluation (lignes 760-784)
    - Toute modification affecte profil-etudiant.js et liste-evaluations.js
  5. Fonction genererRetroaction() (lignes 623-693)
    - Ordre des sections (description, objectif, tâche, adresse, contexte,
  commentaires)
    - Format de la rétroaction finale

  ---
  ✅ Zones modifiables

  1. Styles CSS inline : Adapter les couleurs et espacements
  2. Messages utilisateur : Notifications, alertes, textes d'aide
  3. Options d'affichage : Ajouter de nouvelles checkboxes
  4. Filtres et tri : Ajouter de nouveaux critères
  5. Statistiques : Ajouter de nouveaux calculs

  ---
  🛠️ Pour ajouter une nouvelle fonctionnalité

  Exemple : Ajouter l'export PDF d'une évaluation

  // 1. Créer une nouvelle fonction
  function exporterEvaluationPDF(evaluationId) {
      const evaluations =
  JSON.parse(localStorage.getItem('evaluationsSauvegardees'))
      const evaluation = evaluations.find(e => e.id === evaluationId)

      if (!evaluation) {
          alert('Évaluation introuvable')
          return
      }

      // Logique d'export PDF
      // ...
  }

  // 2. Ajouter un bouton dans genererDetailsEtudiant()
  // Ligne ~1395, dans la colonne Actions
  <button class="btn btn-export"
          onclick="exporterEvaluationPDF('${item.evaluation.id}')"
          style="padding:5px 10px;">
      Exporter PDF
  </button>

  ---
  10. Historique

  Version actuelle (Index 50 - 10 octobre 2025a)

  État : ✅ FonctionnelDernière modification : Refonte de la liste des évaluations
   avec accordéon

  Fonctionnalités complétées :
  - Interface d'évaluation complète
  - Calcul automatique de la note pondérée
  - Génération automatique de rétroaction
  - Sauvegarde des évaluations
  - Calcul des indices C et P
  - Liste en accordéon avec filtres
  - Tri persistent
  - Affichage PAN (sommatif/alternatif)
  - Compatibilité ancienne/nouvelle structure

  Bugs connus :
  - Code dupliqué (lignes 314-335, 791-803, 1535-1539, 1599-1622)
  - Fonctions en double : obtenirNomCartouche(), obtenirClasseNote()
  - Erreur ligne 1519 : eval au lieu de evaluation
  - TD en double lignes 1391-1392

  ---
  11. Support et ressources

  Documentation pédagogique

  - Guide de monitorage : https://codexnumeris.org/apropos
  - Formules des indices : CLAUDE.md, section "Indices A-C-P"
  - Taxonomie SOLO : CLAUDE.md, section "Échelle IDME"

  Fichiers de référence

  CLAUDE.md                    Contexte général du projet
  structure-modulaire.txt      Architecture complète
  noms_stables.json            Noms protégés (IDs, fonctions)

  Modules connexes à consulter

  grilles.js        Pour comprendre la structure des critères
  echelles.js       Pour comprendre les niveaux de performance
  cartouches.js     Pour comprendre la matrice de rétroactions
  pratiques.js      Pour comprendre les modes PAN

  Debug dans la console

  // Vérifier l'état du module
  console.log('evaluationEnCours:', evaluationEnCours)

  // Voir toutes les évaluations
  const evals = JSON.parse(localStorage.getItem('evaluationsSauvegardees'))
  console.table(evals)

  // Voir les indices
  const indices = JSON.parse(localStorage.getItem('indicesEvaluation'))
  console.table(indices)

  // Recalculer les indices manuellement
  calculerEtSauvegarderIndicesEvaluation()

  // Voir la liste filtrée
  console.table(donneesEvaluationsFiltrees)

  ---
  📌 Note importante : Ce module est au cœur du système de monitorage pédagogique.
   Toute modification des formules de calcul (C, P, Risque) doit être validée par
  rapport au Guide de monitorage officiel.

  ---
  Fin de la documentation evaluation.js
