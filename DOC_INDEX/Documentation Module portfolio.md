Voici la documentation complète du module portfolio.js :

  ---
  # Documentation technique - MODULE portfolio.js

  **Date de création** : Octobre 2025
  **Dernière modification** : 23 octobre 2025
  **Lignes de code** : 280 lignes
  **Responsable pédagogique** : Grégoire Bédard

  ---

  ## 1. Vue d'ensemble

  Le module `portfolio.js` gère l'affichage et la sélection des artefacts dans le
  portfolio d'un étudiant. Il permet de :
  - Afficher tous les artefacts du portfolio (remis, non remis, à venir)
  - Sélectionner les N meilleurs artefacts pour le calcul de la note finale
  - Calculer la note provisoire (moyenne de tous les artefacts remis)
  - Calculer la note finale (moyenne des N artefacts retenus)
  - Suivre la progression vers le minimum de complétion requis

  **⚠️ NOTE IMPORTANTE** : Selon CLAUDE.md, ce module est destiné à calculer
  l'**indice P (Performance)** pour le système de monitorage A-C-P dans une
  version future. Actuellement, le module se concentre sur la gestion de
  l'affichage et de la sélection des artefacts.

  **Contexte pédagogique** : Le portfolio est un type de production qui applique
  la règle "garde les N meilleurs artefacts parmi M". L'étudiant peut avoir
  produit 9 artefacts, mais seuls les 3 meilleurs comptent pour la note finale
  (exemple : garder 3 sur un minimum de 7 complétés sur 9 prévus).

  ---

  ## 2. Type de module

  **Classification** : **HYBRID** (SOURCE + LECTEUR/AFFICHAGE)

  ### Module SOURCE pour :
  - **portfoliosEleves** : Sélections d'artefacts retenus par étudiant

  ### Module LECTEUR pour :
  - **listeGrilles** : Liste des productions (portfolio + artefacts-portfolio)
  - **evaluationsSauvegardees** : Évaluations des artefacts par étudiant

  ### Module AFFICHAGE pour :
  - Interface de sélection des artefacts retenus
  - Barre de progression de complétion
  - Calcul et affichage des notes provisoires/finales

  **Responsabilité unique** : Gérer l'affichage du portfolio étudiant, la
  sélection des artefacts retenus et le calcul des notes provisoires/finales.

  ---

  ## 3. Données gérées

  ### 3.1 LocalStorage - Clé générée par ce module

  #### `portfoliosEleves`
  **Format** : Object avec structure imbriquée
  ```javascript
  {
    "1234567": {                              // DA de l'étudiant
      "PROD1729785800000": {                  // ID du portfolio
        "artefactsRetenus": [                 // IDs des artefacts sélectionnés
          "PROD1729785801000",
          "PROD1729785802000",
          "PROD1729785803000"
        ],
        "dateSelection": "2025-10-23T14:30:00.000Z"
      }
    },
    "2345678": {
      "PROD1729785800000": {
        "artefactsRetenus": ["PROD1729785801000"],
        "dateSelection": "2025-10-22T10:15:00.000Z"
      }
    }
  }

  Champs :
  - DA étudiant (clé externe) : Code permanent de l'étudiant
  - Portfolio ID (clé interne) : ID de la production de type 'portfolio'
  - artefactsRetenus : Array d'IDs des artefacts sélectionnés pour la note finale
  - dateSelection : Date ISO 8601 de la dernière modification de sélection

  Contraintes :
  - Le nombre d'artefacts retenus ne peut dépasser portfolio.regles.nombreARetenir
  - Seuls les artefacts remis (avec évaluation) peuvent être retenus
  - La sélection est libre tant que le maximum n'est pas atteint

  3.2 LocalStorage - Clés lues par ce module

  listeGrilles

  Source : Module productions.js
  Usage : Récupérer le portfolio et ses artefacts
  [
    {
      id: "PROD1729785800000",
      type: "portfolio",
      titre: "Portfolio final",
      regles: {
        nombreARetenir: 3,        // Nombre d'artefacts à garder
        minimumCompletion: 7,     // Minimum requis pour considérer complet
        nombreTotal: 9            // Nombre total d'artefacts prévus
      }
    },
    {
      id: "PROD1729785801000",
      type: "artefact-portfolio",
      titre: "Analyse littéraire 1",
      description: "Analyse d'un extrait de roman"
    }
  ]

  evaluationsSauvegardees

  Source : Module evaluation.js
  Usage : Vérifier si un artefact a été remis et sa note
  [
    {
      id: "EVAL_1729785600000",
      etudiantDA: "1234567",
      productionId: "PROD1729785801000",
      noteFinale: 82.5,
      niveauFinal: "M"
    }
  ]

  ---
  4. API publique

  4.1 Fonctions principales

  chargerPortfolioEleveDetail(da)

  Description : Charge et affiche le portfolio complet d'un étudiant

  Paramètres :
  - da (string) : DA de l'étudiant

  Retour : void (affiche directement dans le DOM)

  Comportement :
  1. Récupère le portfolio depuis listeGrilles
  2. Filtre tous les artefacts-portfolio
  3. Récupère les évaluations de l'étudiant
  4. Récupère les sélections existantes
  5. Construit la liste complète des artefacts (existants + à venir)
  6. Trie les artefacts (remis > existants > à venir)
  7. Calcule les statistiques et notes
  8. Génère et affiche l'interface HTML

  Affichage généré :
  - Barre de progression (remis / minimum requis)
  - Liste des artefacts avec checkbox de sélection
  - Zone de calcul des notes (provisoire/finale)
  - Indicateur de mode (PROVISOIRE vs FINAL)

  Exemple d'utilisation :
  chargerPortfolioEleveDetail('1234567');
  // Affiche le portfolio de l'étudiant 1234567 dans #portfolioEleveDetail

  Cas particuliers :
  - Si aucun portfolio configuré : Affiche message "Aucun portfolio configuré"
  - Si artefacts manquants : Affiche des placeholders "À venir"
  - Si erreur : Affiche message d'erreur en rouge

  ---
  toggleArtefactPortfolio(da, portfolioId, nombreARetenir)

  Description : Bascule la sélection d'un artefact et sauvegarde

  Paramètres :
  - da (string) : DA de l'étudiant
  - portfolioId (string) : ID du portfolio
  - nombreARetenir (number) : Nombre maximum d'artefacts à retenir

  Retour : void

  Comportement :
  1. Récupère tous les checkboxes cochés
  2. Vérifie que le nombre ne dépasse pas nombreARetenir
  3. Sauvegarde la sélection dans portfoliosEleves
  4. Recharge l'affichage

  Validation :
  - Si plus de N sélectionnés : Alert et décocher automatiquement

  Exemple d'utilisation :
  <input type="checkbox"
         onchange="toggleArtefactPortfolio('1234567', 'PORTFOLIO_001', 3)">

  Effets de bord :
  - Modifie localStorage.portfoliosEleves
  - Recharge l'affichage complet du portfolio
  - Déclenche recalcul de la note finale si N artefacts sélectionnés

  ---
  5. Dépendances

  5.1 Modules requis (à charger AVANT)

  1. productions.js (Module 04)
    - Génère listeGrilles avec portfolio et artefacts
    - CRITIQUE : Sans ce module, portfolio.js ne peut afficher aucun artefact
  2. evaluation.js (Module 13)
    - Génère evaluationsSauvegardees
    - CRITIQUE : Sans ce module, impossible de savoir quels artefacts sont remis
  3. utilitaires.js
    - Fonction echapperHtml(str) pour sécurité XSS
    - CRITIQUE : Références directes dans chargerPortfolioEleveDetail()

  5.2 Variables globales utilisées

  Aucune variable globale n'est utilisée. Toutes les données proviennent de
  localStorage.

  5.3 Éléments HTML requis

  <!-- Conteneur principal -->
  <div id="portfolioEleveDetail"></div>

  Emplacement dans l'application :
  - Section : #section-etudiants
  - Sous-section : #etudiants-profil
  - Zone : Onglet "Portfolio" du profil étudiant

  5.4 Classes CSS utilisées

  Le module n'utilise pas de classes CSS prédéfinies. Tous les styles sont inline
  pour garantir un affichage cohérent.

  Variables CSS référencées :
  - var(--bleu-tres-pale) : Fond de la barre de progression
  - var(--bleu-principal) : Couleur d'accentuation (bordures, textes)

  ---
  6. Initialisation

  6.1 Séquence de chargement

  Le module portfolio.js ne nécessite PAS de fonction d'initialisation au
  démarrage. Les fonctions sont appelées à la demande lors de l'affichage du
  profil étudiant.

  Ordre de chargement recommandé dans index.html :
  <script src="js/utilitaires.js"></script>
  <script src="js/productions.js"></script>
  <script src="js/evaluation.js"></script>
  <script src="js/portfolio.js"></script>     <!-- Après productions et evaluation
   -->
  <script src="js/profil-etudiant.js"></script><!-- Profil appelle portfolio -->

  6.2 Déclenchement de l'affichage

  Le portfolio est chargé par le module profil-etudiant.js lorsque l'utilisateur :
  1. Clique sur un étudiant dans la liste
  2. Clique sur l'onglet "Portfolio" du profil

  Appel typique :
  // Dans profil-etudiant.js
  function afficherOngletPortfolio(da) {
      chargerPortfolioEleveDetail(da);
  }

  6.3 Pas d'initialisation dans main.js

  Le module n'apparaît PAS dans la séquence d'initialisation de main.js car il n'a
   pas de fonction initialiserModulePortfolio().

  ---
  7. Tests et vérification

  7.1 Vérifier que le module est chargé

  Console navigateur :
  console.log('chargerPortfolioEleveDetail:', typeof chargerPortfolioEleveDetail);
  // Attendu: "function"

  console.log('toggleArtefactPortfolio:', typeof toggleArtefactPortfolio);
  // Attendu: "function"

  7.2 Vérifier les données portfolio

  // Vérifier qu'un portfolio existe
  const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
  const portfolio = productions.find(p => p.type === 'portfolio');
  console.log('Portfolio configuré:', portfolio);
  // Attendu: {id, type: 'portfolio', regles: {...}}

  // Vérifier les artefacts-portfolio
  const artefacts = productions.filter(p => p.type === 'artefact-portfolio');
  console.log('Nombre d\'artefacts:', artefacts.length);
  // Attendu: 7-9 artefacts

  // Vérifier les sélections d'un étudiant
  const selections = JSON.parse(localStorage.getItem('portfoliosEleves') || '{}');
  console.log('Sélections étudiant 1234567:', selections['1234567']);
  // Attendu: {PORTFOLIO_ID: {artefactsRetenus: [...], dateSelection: "..."}}

  7.3 Tester l'affichage du portfolio

  Prérequis :
  1. ✅ Un portfolio configuré dans Réglages › Productions (type 'portfolio')
  2. ✅ Au moins 3 artefacts-portfolio créés
  3. ✅ Au moins 1 artefact évalué pour un étudiant

  Procédure :
  // 1. Aller dans Étudiants › Profil
  // 2. Sélectionner un étudiant dans la liste
  // 3. Cliquer sur l'onglet "Portfolio"

  // Tester via console
  chargerPortfolioEleveDetail('1234567');

  Résultat attendu :
  - Barre de progression visible (ex: "3/7 remis")
  - Liste des artefacts affichée (remis en premier)
  - Artefacts remis avec checkbox activée
  - Artefacts non remis avec checkbox disabled
  - Note provisoire affichée si au moins 1 artefact remis
  - Message "Mode PROVISOIRE" si moins de N artefacts sélectionnés

  7.4 Tester la sélection d'artefacts

  Procédure :
  1. Afficher le portfolio d'un étudiant
  2. Cocher 1 artefact remis
  3. Vérifier que le compteur se met à jour
  4. Cocher jusqu'à N artefacts (ex: 3)
  5. Vérifier que le mode passe à "FINAL"
  6. Vérifier que la note finale apparaît
  7. Essayer de cocher un 4e artefact
  8. Vérifier qu'une alerte apparaît

  Résultat attendu :
  - Sélection enregistrée dans portfoliosEleves
  - Affichage mis à jour instantanément
  - Note finale = moyenne des N artefacts retenus
  - Alert si tentative de dépasser N

  7.5 Tester les artefacts "à venir"

  Configuration :
  - Portfolio avec nombreTotal: 9
  - Seulement 5 artefacts-portfolio créés

  Résultat attendu :
  - 5 artefacts existants affichés normalement
  - 4 artefacts "À venir" avec checkbox grisée
  - Message "Artefact à venir (non encore créé dans Réglages › Productions)"

  ---
  8. Problèmes connus et solutions

  8.1 Portfolio vide affiché

  Symptôme : Message "Aucun portfolio configuré" alors qu'un portfolio existe

  Causes possibles :
  1. Aucune production de type: 'portfolio' dans listeGrilles
  2. localStorage.listeGrilles corrompu ou vide
  3. Module productions.js pas chargé

  Solution :
  // Vérifier
  const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
  console.log('Productions:', productions);
  console.log('Portfolio:', productions.find(p => p.type === 'portfolio'));

  // Si vide ou pas de portfolio:
  // 1. Aller dans Réglages › Productions
  // 2. Créer une production de type "Portfolio"
  // 3. Configurer les règles (nombreARetenir, minimumCompletion, nombreTotal)
  // 4. Sauvegarder

  8.2 Artefacts ne s'affichent pas

  Symptôme : Portfolio affiché mais aucun artefact visible

  Causes possibles :
  1. Aucune production de type: 'artefact-portfolio' créée
  2. nombreTotal défini mais pas d'artefacts créés (affichera uniquement "à
  venir")

  Solution :
  // Vérifier les artefacts
  const artefacts = productions.filter(p => p.type === 'artefact-portfolio');
  console.log('Nombre d\'artefacts:', artefacts.length);

  // Si 0:
  // 1. Aller dans Réglages › Productions
  // 2. Créer des productions de type "Artefact de portfolio"
  // 3. Donner un titre et description
  // 4. Sauvegarder

  8.3 Checkbox ne se coche pas

  Symptôme : Clic sur checkbox sans effet

  Causes possibles :
  1. Artefact non remis (checkbox disabled)
  2. Nombre maximum atteint (alert affiché)
  3. Erreur JavaScript (vérifier console)

  Solution :
  // Vérifier si l'artefact est remis
  const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees')
  || '[]');
  const evalEleve = evaluations.filter(e => e.etudiantDA === '1234567');
  console.log('Évaluations de l\'étudiant:', evalEleve);

  // Si aucune évaluation:
  // 1. Aller dans Évaluations › Évaluer un étudiant
  // 2. Évaluer l'artefact pour cet étudiant
  // 3. Retourner au portfolio

  8.4 Note finale ne s'affiche pas

  Symptôme : Mode PROVISOIRE affiché même avec N artefacts sélectionnés

  Causes possibles :
  1. Nombre de sélections différent de nombreARetenir
  2. Artefacts sélectionnés mais sans note (cas rare)

  Solution :
  // Vérifier la sélection
  const selections = JSON.parse(localStorage.getItem('portfoliosEleves') || '{}');
  const selectionEleve = selections['1234567']?.['PORTFOLIO_ID'];
  console.log('Artefacts retenus:', selectionEleve?.artefactsRetenus.length);
  console.log('Nombre à retenir:', portfolio.regles.nombreARetenir);

  // Vérifier que les artefacts ont des notes
  selectionEleve.artefactsRetenus.forEach(artId => {
      const eval = evaluations.find(e => e.productionId === artId);
      console.log('Note pour', artId, ':', eval?.noteFinale);
  });

  8.5 Erreur "echapperHtml is not defined"

  Symptôme : Erreur dans la console lors de l'affichage

  Cause : Module utilitaires.js pas chargé ou chargé après portfolio.js

  Solution :
  <!-- Vérifier ordre dans index.html -->
  <script src="js/utilitaires.js"></script>  <!-- AVANT -->
  <script src="js/portfolio.js"></script>    <!-- APRÈS -->

  ---
  9. Règles de modification

  9.1 ⚠️ ZONES PROTÉGÉES - NE PAS MODIFIER

  Noms de fonctions publiques

  chargerPortfolioEleveDetail()    // Appelée par profil-etudiant.js
  toggleArtefactPortfolio()        // Appelée par événements HTML
  Raison : Références directes dans profil-etudiant.js et dans le HTML généré

  Clé localStorage

  'portfoliosEleves'    // Clé standard du système
  Raison : Pourrait être lue par d'autres modules à l'avenir

  Structure des données

  {
    da: {
      portfolioId: {
        artefactsRetenus: [],
        dateSelection: ""
      }
    }
  }
  Raison : Correspond à la structure attendue par le reste du système

  9.2 ✅ ZONES MODIFIABLES

  Algorithme de tri des artefacts

  Lignes : 87-93
  Modification possible : Changer l'ordre de tri (par date, par note, etc.)

  Formule de calcul des notes

  Lignes : 100-108
  Modification possible : Pondération différente, médiane au lieu de moyenne

  Styles inline

  Lignes : 112-202 (HTML généré)
  Modification possible : Ajuster couleurs, tailles, espacements

  Messages utilisateur

  Lignes : 33, 116-127, 196-200
  Modification possible : Reformuler les messages, ajouter des explications

  9.3 Workflow de modification recommandé

  AVANT toute modification :
  1. ✅ Commit Git ou backup manuel
  2. ✅ Tester l'affichage actuel (prendre des captures d'écran)
  3. ✅ Noter les valeurs actuelles (notes provisoires/finales)

  PENDANT la modification :
  1. ✅ Modifier uniquement les zones autorisées
  2. ✅ Commenter les changements importants
  3. ✅ Respecter le style de code existant

  APRÈS la modification :
  1. ✅ Tester avec plusieurs étudiants
  2. ✅ Vérifier que les notes correspondent
  3. ✅ Vérifier la console (aucune erreur)
  4. ✅ Tester la sélection/désélection
  5. ✅ Commit si succès, rollback si problème

  ---
  10. Historique et évolution

  Version actuelle (octobre 2025)

  Fonctionnalités implémentées :
  - ✅ Affichage du portfolio avec progression
  - ✅ Liste des artefacts (remis/non remis/à venir)
  - ✅ Sélection des N meilleurs artefacts
  - ✅ Calcul note provisoire (tous les artefacts)
  - ✅ Calcul note finale (N artefacts retenus)
  - ✅ Sauvegarde des sélections
  - ✅ Validation du nombre max d'artefacts

  État du module : Fonctionnel et stable

  Évolution future prévue

  ⚠️ IMPORTANT - Calcul de l'indice P (Performance)

  Selon CLAUDE.md (lignes 80-90), ce module doit devenir la SOURCE pour l'indice P
   du système de monitorage A-C-P :

  // À AJOUTER DANS UNE VERSION FUTURE
  /**
   * Calcule l'indice P (Performance) pour tous les étudiants
   * Formule selon Guide de monitorage:
   * P = note finale du portfolio / 100
   *
   * Stockage: localStorage.indicesCP
   * Structure: {
   *   da: {
   *     indiceC: 0.85,  // Calculé par liste-evaluations.js
   *     indiceP: 0.78,  // Calculé par ce module
   *     dateCalcul: "2025-10-23T..."
   *   }
   * }
   */
  function calculerIndicePerformance() {
      // Récupérer tous les étudiants
      // Pour chaque étudiant:
      //   - Récupérer sa note finale de portfolio
      //   - Calculer P = noteFinale / 100
      //   - Sauvegarder dans indicesCP
  }

  Référence : CLAUDE.md, section "Les trois indices primaires (A-C-P)"
  - Assiduité (A) → saisie-presences.js
  - Complétion (C) → liste-evaluations.js
  - Performance (P) → portfolio.js ⬅️ À IMPLÉMENTER

  Objectif pédagogique :
  L'indice P mesure la qualité des productions (vs quantité pour C). Il permet de
  calculer le risque de réussite :
  Risque = 1 - (A × C × P)

  Impact sur l'architecture :
  1. Le module deviendra SOURCE pour indicesCP
  2. Le module tableau-bord-apercu.js lira indicesCP pour afficher P
  3. Permettra le calcul complet du risque A-C-P

  Améliorations techniques possibles

  1. Refactorisation du HTML généré
    - Actuellement : 90 lignes de template literals (lignes 112-202)
    - Amélioration : Extraire dans une fonction séparée genererHtmlPortfolio()
  2. Extraction de la logique de calcul
    - Actuellement : Calculs inline dans chargerPortfolioEleveDetail()
    - Amélioration : Fonctions calculerNoteProvisoire() et calculerNoteFinale()
  3. Gestion des modes (Simulation/Anonymisation)
    - Actuellement : Utilise directement localStorage
    - Amélioration : Utiliser obtenirDonneesSelonMode() et
  sauvegarderDonneesSelonMode() du module modes.js
  4. Tests unitaires
    - Ajouter des tests pour les fonctions de calcul
    - Tester les cas limites (0 artefacts, tous remis, aucun remis)

  ---
  11. Support et ressources

  11.1 Documentation projet

  - CLAUDE.md : Instructions générales, architecture Single Source of Truth
  - structure-modulaire.txt : Vue d'ensemble de tous les modules
  - DOC_productions.js : Documentation du module gérant les productions/portfolio
  - DOC_evaluation.js : Documentation du module gérant les évaluations

  11.2 Modules liés

  Modules requis (dépendances) :
  - productions.js : Génère listeGrilles (portfolio + artefacts)
  - evaluation.js : Génère evaluationsSauvegardees
  - utilitaires.js : Fournit echapperHtml()

  Modules appelant :
  - profil-etudiant.js : Appelle chargerPortfolioEleveDetail()

  Modules futurs :
  - tableau-bord-apercu.js : Lira indicesCP pour afficher l'indice P

  11.3 Ressources pédagogiques

  Système de monitorage A-C-P :
  - Labo Codex : https://codexnumeris.org/apropos
  - Revue Pédagogie collégiale (printemps-été 2024, hiver 2025)
  - Guide de monitorage complet (Grégoire Bédard)

  Concept du portfolio :
  - Portfolio = production avec règle de sélection
  - Philosophie : "Garde tes N meilleurs artefacts"
  - Permet à l'étudiant de progresser sur M tentatives mais seules les N
  meilleures comptent

  11.4 Débogage et aide

  Vérifier l'état complet du portfolio :
  // Script de diagnostic complet
  function diagnosticPortfolio(da) {
      console.log('=== DIAGNOSTIC PORTFOLIO ===');

      // 1. Portfolio configuré?
      const productions = JSON.parse(localStorage.getItem('listeGrilles') ||
  '[]');
      const portfolio = productions.find(p => p.type === 'portfolio');
      console.log('Portfolio:', portfolio);

      // 2. Artefacts disponibles?
      const artefacts = productions.filter(p => p.type === 'artefact-portfolio');
      console.log('Artefacts disponibles:', artefacts.length);

      // 3. Évaluations de l'étudiant?
      const evaluations =
  JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
      const evalEleve = evaluations.filter(e => e.etudiantDA === da);
      console.log('Évaluations de l\'étudiant:', evalEleve.length);

      // 4. Sélection actuelle?
      const selections = JSON.parse(localStorage.getItem('portfoliosEleves') ||
  '{}');
      const selection = selections[da]?.[portfolio?.id];
      console.log('Sélection:', selection);

      // 5. Notes calculées
      const artefactsAvecNote = evalEleve.filter(e => e.noteFinale !== null);
      const noteProvisoire = artefactsAvecNote.length > 0
          ? artefactsAvecNote.reduce((sum, e) => sum + e.noteFinale, 0) /
  artefactsAvecNote.length
          : null;
      console.log('Note provisoire:', noteProvisoire);

      if (selection?.artefactsRetenus.length === portfolio?.regles.nombreARetenir)
   {
          const notesRetenues = selection.artefactsRetenus.map(artId => {
              const eval = evaluations.find(e => e.productionId === artId &&
  e.etudiantDA === da);
              return eval?.noteFinale || 0;
          });
          const noteFinale = notesRetenues.reduce((a, b) => a + b, 0) /
  notesRetenues.length;
          console.log('Note finale:', noteFinale);
      }

      console.log('=== FIN DIAGNOSTIC ===');
  }

  // Utilisation
  diagnosticPortfolio('1234567');

  Réinitialiser les sélections d'un étudiant :
  function reinitialiserSelectionsPortfolio(da) {
      const selections = JSON.parse(localStorage.getItem('portfoliosEleves') ||
  '{}');
      delete selections[da];
      localStorage.setItem('portfoliosEleves', JSON.stringify(selections));
      console.log('Sélections réinitialisées pour', da);
  }

  reinitialiserSelectionsPortfolio('1234567');

  11.5 Contact et licence

  Responsable : Grégoire Bédard
  Licence : Creative Commons BY-NC-SA 4.0
  - ✅ Partage et adaptation autorisés (usage non commercial)
  - ✅ Attribution requise
  - ✅ Redistribution sous même licence

  ---
  FIN DE LA DOCUMENTATION - MODULE portfolio.js

  Dernière mise à jour : 23 octobre 2025
