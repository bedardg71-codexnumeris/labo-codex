Documentation technique : cartouches.js

  📋 Vue d'ensemble

  Nom du module : 07-cartouches.js (Cartouches de rétroaction)Version : Index 50
  (10-10-2025a - Modularisation)Lignes de code : 1099 lignesResponsable : Grégoire
   Bédard

  Description :Module de création et gestion de cartouches de rétroaction. Une
  cartouche est une matrice de commentaires pré-rédigés organisés par critères
  d'évaluation × niveaux de performance. Permet de générer des rétroactions
  personnalisées et cohérentes pour les étudiants.

  Exemple concret :Pour une grille "Analyse littéraire" avec les critères SRPNF et
   les niveaux IDME, ce module génère une matrice de 4×5 = 20 commentaires. Lors
  de l'évaluation, l'enseignant sélectionne le niveau atteint pour chaque critère,
   et la rétroaction complète est générée automatiquement.

  ---
  🏷️ Type de module

  Type : SOURCE

  Ce module génère et stocke les cartouches de rétroaction dans localStorage.

  Données générées :
  - cartouches_{grilleId} : Array des cartouches pour une grille donnée

  Données lues :
  - grillesTemplates (depuis 05-grilles.js)
  - niveauxEchelle (depuis 06-echelles.js)

  Modules lecteurs :
  - 04-productions.js (futur - utilisera les cartouches pour évaluer)
  - Modules d'évaluation (génération automatique de rétroactions)

  ---
  💾 Données gérées

  Structure de données principales

  1. Cartouche (objet complet)

  {
    id: string,               // Format: "CART" + timestamp
    nom: string,              // Ex: "Rétroaction - Analyse littéraire T1"
    grilleId: string,         // ID de la grille parente (ex: "GRILLE001")
    contexte: string,         // Description du contexte d'utilisation
    criteres: Array,          // [{id: "CRIT001", nom: "Structure"}, ...]
    niveaux: Array,           // [{code: "I", nom: "Insuffisant"}, ...]
    commentaires: Object,     // Clé: "critereId_niveauCode" → commentaire
    verrouille: boolean       // Protection contre modification/suppression
  }

  2. Exemple concret de cartouche

  {
    id: "CART1698765432000",
    nom: "Rétroaction - Dissertation philosophique",
    grilleId: "GRILLE_PHILO_2024",
    contexte: "Pour les dissertations du cours 340-102",
    criteres: [
      { id: "CRIT001", nom: "Structure" },
      { id: "CRIT002", nom: "Rigueur" },
      { id: "CRIT003", nom: "Nuance" }
    ],
    niveaux: [
      { code: "I", nom: "Insuffisant" },
      { code: "D", nom: "En Développement" },
      { code: "M", nom: "Maîtrisé" },
      { code: "E", nom: "Étendu" }
    ],
    commentaires: {
      "CRIT001_I": "Votre plan manque de clarté. Les idées semblent 
  désorganisées.",
      "CRIT001_D": "Votre structure est reconnaissable, mais certaines transitions
   manquent de fluidité.",
      "CRIT001_M": "Excellente organisation. Chaque partie suit logiquement.",
      "CRIT001_E": "Structure exemplaire qui guide efficacement la lecture.",
      // ... 8 autres combinaisons critère-niveau
    },
    verrouille: false
  }

  Clés localStorage utilisées

  | Clé                   | Type  | Générée par   | Description
          |
  |-----------------------|-------|---------------|-------------------------------
  --------|
  | cartouches_{grilleId} | Array | cartouches.js | Cartouches pour une grille
  spécifique |
  | grillesTemplates      | Array | grilles.js    | (LECTURE) Grilles de critères
          |
  | niveauxEchelle        | Array | echelles.js   | (LECTURE) Niveaux de
  performance IDME |

  Format des commentaires dans la matrice

  Clé : critereId_niveauCodeValeur : Texte du commentaire

  Exemple :
  {
    "CRIT001_I": "Commentaire pour Structure niveau Insuffisant",
    "CRIT001_D": "Commentaire pour Structure niveau Développement",
    "CRIT001_M": "Commentaire pour Structure niveau Maîtrisé",
    "CRIT001_E": "Commentaire pour Structure niveau Étendu"
  }

  ---
  🔌 API publique

  Fonctions d'initialisation

  initialiserModuleCartouches()

  /**
   * Initialise le module au chargement
   * Appelée automatiquement par 99-main.js
   * 
   * RETOUR: void (sortie silencieuse si DOM non prêt)
   */

  Fonctions de chargement

  chargerSelectGrillesRetroaction()

  /**
   * Charge les grilles disponibles dans le select
   * Lit depuis localStorage.grillesTemplates
   * 
   * RETOUR: void
   */

  chargerCartouchesRetroaction()

  /**
   * Charge les cartouches d'une grille sélectionnée
   * Appelée par: événement change sur #selectGrilleRetroaction
   * 
   * FONCTIONNEMENT:
   * 1. Récupère grilleId depuis select
   * 2. Charge cartouches depuis localStorage
   * 3. Affiche liste + nouvelle cartouche par défaut
   * 
   * RETOUR: void
   */

  chargerMatriceRetroaction()

  /**
   * Charge une cartouche existante pour modification
   * Appelée par: événement change sur #selectCartouche
   * 
   * RETOUR: void
   */

  Fonctions de création/édition

  initialiserNouveauCartouche(grilleId)

  /**
   * Crée une nouvelle cartouche vierge
   * 
   * PARAMÈTRES:
   * @param {string} grilleId - ID de la grille parente
   * 
   * FONCTIONNEMENT:
   * 1. Récupère critères de la grille
   * 2. Récupère niveaux depuis échelle globale
   * 3. Crée structure vide
   * 4. Affiche matrice
   * 
   * RETOUR: void (modifie cartoucheActuel global)
   */

  afficherMatriceRetroaction()

  /**
   * Génère et affiche la matrice critères × niveaux
   * 
   * STRUCTURE HTML:
   * - Tableau avec position sticky pour en-têtes
   * - Textarea éditable par cellule
   * - Sauvegarde auto avec onchange
   * 
   * FORMAT CELLULE:
   * <textarea id="comm_{critereId}_{niveauCode}"
   *           onchange="sauvegarderCommentaire('{key}')">
   * 
   * RETOUR: void
   */

  sauvegarderCommentaire(key)

  /**
   * Sauvegarde un commentaire individuel
   * 
   * PARAMÈTRES:
   * @param {string} key - Clé critereId_niveauCode
   * 
   * FONCTIONNEMENT:
   * 1. Récupère valeur textarea
   * 2. Met à jour cartoucheActuel.commentaires
   * 3. Recalcule pourcentage complétion
   * 
   * RETOUR: void
   * NOTE: Sauvegarde en mémoire, persistance via sauvegarderCartouche()
   */

  sauvegarderCartouche()

  /**
   * Persiste la cartouche complète dans localStorage
   * 
   * VALIDATION:
   * - Nom obligatoire (alerte si vide)
   * - Contexte optionnel
   * 
   * FONCTIONNEMENT:
   * 1. Validation du nom
   * 2. Recherche si existe déjà (par ID)
   * 3. Mise à jour ou ajout
   * 4. Sauvegarde dans localStorage
   * 5. Rafraîchissement interface
   * 
   * CLÉ: cartouches_{grilleId}
   * RETOUR: void + notification succès
   */

  Fonctions d'import

  importerCommentaires()

  /**
   * Parse et importe commentaires depuis texte Markdown
   * 
   * FORMAT ATTENDU:
   * ## NOM_CRITÈRE
   * 
   * **NOM_CRITÈRE (I)** : Commentaire insuffisant
   * **NOM_CRITÈRE (D)** : Commentaire développement
   * **NOM_CRITÈRE (M)** : Commentaire maîtrisé
   * **NOM_CRITÈRE (E)** : Commentaire étendu
   * 
   * REGEX UTILISÉE:
   * - Section: /^##/
   * - Commentaire: /^\*\*(.+?)\s*\(([IDME])\)\*\*\s*:\s*(.+)$/
   * 
   * VALIDATION:
   * - Vérifie existence critère et niveau
   * - Compte imports réussis
   * - Alerte si 0 import
   * 
   * RETOUR: void + notification avec compteur
   */

  Fonctions d'aperçu

  genererApercuAleatoire()

  /**
   * Génère rétroaction aléatoire pour test visuel
   * 
   * FONCTIONNEMENT:
   * 1. Pour chaque critère:
   *    - Tire niveau aléatoire
   *    - Récupère commentaire correspondant
   *    - Affiche dans #exempleRetroaction
   * 
   * UTILITÉ:
   * - Tester cohérence des commentaires
   * - Prévisualiser rendu final
   * - Vérifier longueur/style
   * 
   * RETOUR: void
   */

  Fonctions métriques

  mettreAJourMetriques()

  /**
   * Affiche métriques de la cartouche
   * 
   * MÉTRIQUES:
   * - #nbCriteres : Nombre de critères
   * - #nbNiveaux : Nombre de niveaux
   * - #nbCommentaires : Total cellules (critères × niveaux)
   * - #pctComplete : Pourcentage via calculerPourcentageComplete()
   * 
   * RETOUR: void
   */

  calculerPourcentageComplete()

  /**
   * Calcule pourcentage de complétion avec code couleur
   * 
   * CRITÈRE REMPLISSAGE:
   * - Commentaire non vide après trim()
   * 
   * COULEURS:
   * - 100% : vert (var(--vert-pale))
   * - 75%+ : bleu (var(--bleu-carte))
   * - 50%+ : orange (var(--orange-accent)20)
   * - <50% : rouge (var(--risque-critique)20)
   * 
   * RETOUR: void (affiche dans #pctComplete)
   */

  Fonctions de gestion

  afficherListeCartouches(cartouches, grilleId)

  /**
   * Affiche liste des cartouches avec actions
   * 
   * PARAMÈTRES:
   * @param {Array} cartouches - Cartouches à afficher
   * @param {string} grilleId - ID grille parente
   * 
   * AFFICHAGE PAR CARTOUCHE:
   * - Nom + progression (X/Y remplis)
   * - Checkbox verrouillage (🔒)
   * - Bouton Modifier (désactivé si verrouillé)
   * - Bouton Dupliquer
   * - Bouton Supprimer (désactivé si verrouillé)
   * 
   * RETOUR: void
   */

  basculerVerrouillageCartouche(cartoucheId, grilleId)

  /**
   * Bascule état verrouillé/déverrouillé
   * 
   * EFFET:
   * - Empêche modification/suppression si verrouillé
   * - Change opacité boutons (50% si verrouillé)
   * - Sauvegarde état dans localStorage
   * 
   * RETOUR: void
   */

  dupliquerCartouche(cartoucheId, grilleId)

  /**
   * Crée copie complète d'une cartouche
   * 
   * FONCTIONNEMENT:
   * 1. Deep copy de la cartouche originale
   * 2. Nouvel ID (CART + timestamp)
   * 3. Ajoute "(copie)" au nom
   * 4. Déverrouille la copie
   * 5. Sélectionne automatiquement
   * 
   * RETOUR: void + notification succès
   */

  supprimerCartoucheConfirm(cartoucheId, grilleId)

  /**
   * Supprime cartouche avec confirmation
   * 
   * SÉCURITÉ:
   * - Bloquée si verrouillée (alerte)
   * - Confirmation obligatoire (confirm)
   * 
   * RETOUR: void + notification succès
   */

  Fonctions utilitaires

  afficherNotificationSucces(message)

  /**
   * Affiche notification temporaire
   * 
   * PARAMÈTRES:
   * @param {string} message - Message à afficher
   * 
   * STYLE:
   * - Position: fixed top-right
   * - Fond: vert succès
   * - Durée: 3 secondes
   * - Animation: slideIn
   * 
   * RETOUR: void
   */

  ---
  🔗 Dépendances

  Modules requis (ordre de chargement)

  1. 01-config.js (CRITIQUE)
    - Variable globale : cartoucheActuel
    - Fonction : echapperHtml(texte)
  2. 05-grilles.js (CRITIQUE)
    - Lit : localStorage.grillesTemplates
    - Pour : Récupérer les critères d'évaluation
  3. 06-echelles.js (CRITIQUE)
    - Lit : localStorage.niveauxEchelle
    - Pour : Récupérer les niveaux de performance (IDME)

  Fonctions externes utilisées

  echapperHtml(texte)  // Protection XSS depuis config.js

  Éléments HTML requis

  <!-- Sélection grille -->
  <select id="selectGrilleRetroaction"></select>

  <!-- Sélection cartouche -->
  <select id="selectCartouche"></select>

  <!-- Champs édition -->
  <input id="nomCartouche" type="text">
  <textarea id="contexteCartouche"></textarea>

  <!-- Conteneurs affichage -->
  <div id="aucuneEvalRetroaction"></div>
  <div id="infoCartouche"></div>
  <div id="matriceRetroaction">
    <div id="matriceContainer"></div>
  </div>

  <!-- Aperçu -->
  <div id="apercuRetroaction">
    <div id="exempleRetroaction"></div>
  </div>

  <!-- Liste cartouches -->
  <div id="listeCartouchesExistants">
    <div id="listeCartouchesContainer"></div>
  </div>

  <!-- Import -->
  <div id="zoneImportCommentaires">
    <textarea id="commentairesColles"></textarea>
  </div>

  <!-- Métriques -->
  <span id="nbCriteres"></span>
  <span id="nbNiveaux"></span>
  <span id="nbCommentaires"></span>
  <span id="pctComplete"></span>

  Classes CSS requises

  .tableau                /* Tableau matrice */
  .controle-form         /* Textarea éditable */
  .btn                   /* Boutons action */
  .btn-modifier          /* Bouton modifier */
  .btn-principal         /* Bouton dupliquer */
  .btn-supprimer         /* Bouton supprimer */
  .notification-succes   /* Notification temporaire */

  ---
  🚀 Initialisation

  Appel depuis 99-main.js

  // PRIORITÉ 2 : DONNÉES DE BASE

  // MODULE 07: Cartouches de rétroaction
  if (typeof initialiserModuleCartouches === 'function') {
      console.log('   → Module 07-cartouches détecté');
      initialiserModuleCartouches();
  }

  Ordre de chargement critique

  1. config.js        (variables globales)
  2. grilles.js       (génère grillesTemplates)
  3. echelles.js      (génère niveauxEchelle)
  4. cartouches.js    (lit les deux ci-dessus)
  5. main.js          (appelle initialiserModuleCartouches)

  Événements gérés

  Tous les événements sont attachés via attributs HTML :

  // Sélection grille
  onchange="chargerCartouchesRetroaction()"

  // Sélection cartouche
  onchange="chargerMatriceRetroaction()"

  // Sauvegarde commentaire
  onchange="sauvegarderCommentaire('{key}')"

  // Verrouillage
  onchange="basculerVerrouillageCartouche('{id}', '{grilleId}')"

  // Actions boutons
  onclick="chargerCartouchePourModif('{id}', '{grilleId}')"
  onclick="dupliquerCartouche('{id}', '{grilleId}')"
  onclick="supprimerCartoucheConfirm('{id}', '{grilleId}')"
  onclick="sauvegarderCartouche()"
  onclick="importerCommentaires()"
  onclick="genererApercuAleatoire()"

  Aucun addEventListener requis dans main.js.

  ---
  🧪 Tests et vérification

  Test 1 : Création cartouche

  // Console navigateur
  localStorage.getItem('cartouches_GRILLE001')
  // Devrait afficher: array avec cartouches

  Test 2 : Vérifier structure

  const cartouches = JSON.parse(localStorage.getItem('cartouches_GRILLE001') ||
  '[]');
  console.log('Nombre de cartouches:', cartouches.length);
  console.log('Première cartouche:', cartouches[0]);
  console.log('Commentaires:', Object.keys(cartouches[0].commentaires).length);

  Test 3 : Complétion

  // Après avoir rempli des commentaires
  const c = cartouches[0];
  const total = c.criteres.length * c.niveaux.length;
  const remplis = Object.keys(c.commentaires).filter(k =>
  c.commentaires[k].trim()).length;
  console.log(`Complétion: ${remplis}/${total} = 
  ${Math.round(remplis/total*100)}%`);

  Test 4 : Import Markdown

  Format à tester dans #commentairesColles :

  ## STRUCTURE

  **STRUCTURE (I)** : Votre plan manque de clarté.
  **STRUCTURE (D)** : Structure reconnaissable.
  **STRUCTURE (M)** : Excellente organisation.
  **STRUCTURE (E)** : Structure exemplaire.

  ## RIGUEUR

  **RIGUEUR (I)** : Observations superficielles.
  **RIGUEUR (D)** : Quelques détails pertinents.
  **RIGUEUR (M)** : Analyse exhaustive.
  **RIGUEUR (E)** : Rigueur exceptionnelle.

  Test 5 : Aperçu aléatoire

  Cliquer "Générer un aperçu aléatoire" et vérifier :
  - Tous les critères apparaissent
  - Commentaires cohérents avec niveaux
  - Pas de [Commentaire non défini]

  Scénario de test complet

  1. Créer une cartouche
    - Sélectionner une grille existante
    - Nouvelle cartouche
    - Nom: "Test rétroaction"
    - Contexte: "Pour tests"
  2. Remplir la matrice
    - Saisir commentaires pour chaque critère × niveau
    - Vérifier sauvegarde auto (onchange)
    - Vérifier % complétion augmente
  3. Sauvegarder
    - Clic "Sauvegarder"
    - Vérifier notification succès
    - Vérifier apparition dans liste
  4. Tester verrouillage
    - Cocher 🔒
    - Vérifier boutons Modifier/Supprimer désactivés
    - Décocher → boutons réactivés
  5. Dupliquer
    - Clic "Dupliquer"
    - Vérifier copie créée avec "(copie)"
    - Vérifier copie déverrouillée
  6. Import Markdown
    - Clic "Importer commentaires"
    - Coller format Markdown
    - Vérifier compteur imports
    - Vérifier matrice mise à jour
  7. Aperçu aléatoire
    - Clic "Générer aperçu"
    - Vérifier tous critères présents
    - Régénérer plusieurs fois
  8. Suppression
    - Sélectionner cartouche test
    - Déverrouiller si nécessaire
    - Supprimer avec confirmation

  ---
  🐛 Problèmes connus

  Problème 1 : Cartouche vide après sélection

  Symptôme : Matrice vide malgré commentaires sauvegardés

  Cause : ID cartouche incorrect ou corruption données

  Solution :
  // Vérifier IDs
  const grilleId = document.getElementById('selectGrilleRetroaction').value;
  const cartoucheId = document.getElementById('selectCartouche').value;
  console.log('grilleId:', grilleId, 'cartoucheId:', cartoucheId);

  // Vérifier données
  const cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) ||
  '[]');
  console.log('Cartouche trouvée?', cartouches.find(c => c.id === cartoucheId));

  Problème 2 : Import Markdown échoue (0 commentaires importés)

  Symptôme : Alerte "Aucun commentaire n'a pu être importé"

  Causes possibles :
  1. Format Markdown incorrect
  2. Noms critères ne correspondent pas
  3. Codes niveaux autres que IDME

  Solutions :
  // Vérifier noms critères EXACTS
  console.log('Critères attendus:', cartoucheActuel.criteres.map(c =>
  c.nom.toUpperCase()));

  // Vérifier codes niveaux
  console.log('Codes niveaux:', cartoucheActuel.niveaux.map(n => n.code));

  // Format correct OBLIGATOIRE:
  // ## NOM_CRITÈRE (tout en majuscules)
  // **NOM_CRITÈRE (CODE)** : Commentaire

  Problème 3 : Boutons désactivés malgré déverrouillage

  Symptôme : Boutons restent grisés après avoir décoché 🔒

  Cause : État pas synchronisé dans liste

  Solution :
  // Forcer rafraîchissement
  const grilleId = document.getElementById('selectGrilleRetroaction').value;
  const cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) ||
  '[]');
  afficherListeCartouches(cartouches, grilleId);

  Problème 4 : Pourcentage bloqué à 0%

  Symptôme : Reste à 0% malgré commentaires remplis

  Cause : cartoucheActuel non synchronisé

  Solution :
  // Sauvegarder puis recharger
  sauvegarderCartouche();
  // Puis resélectionner dans #selectCartouche

  Problème 5 : "Grille introuvable" lors de création

  Symptôme : Alert au clic "Nouvelle cartouche"

  Cause : grillesTemplates vide ou corrompu

  Solution :
  // Vérifier grilles disponibles
  console.log('Grilles:', JSON.parse(localStorage.getItem('grillesTemplates') ||
  '[]'));

  // Si vide, créer grilles d'abord dans module 05-grilles.js

  ---
  📐 Règles de modification

  ⚠️ ZONES PROTÉGÉES

  1. Noms de fonctions : Listés dans noms_stables.json
  2. IDs HTML : Ne pas renommer les id dans index.html
  3. Clés localStorage : Format cartouches_{grilleId} fixe
  4. Structure cartouche : Champs id, nom, grilleId, contexte, criteres, niveaux, 
  commentaires, verrouille

  ✅ Modifications autorisées

  1. Commentaires : Ajout/modification sans limite
  2. Styles inline : Variables CSS et styles visuels
  3. Messages utilisateur : Textes d'alertes/notifications
  4. Couleurs progression : Seuils 100%/75%/50%
  5. Durée notification : setTimeout (actuellement 3000ms)

  Format import Markdown

  NE PAS MODIFIER la regex de parsing :

  /^\*\*(.+?)\s*\(([IDME])\)\*\*\s*:\s*(.+)$/

  Cette regex est critique pour l'import. Toute modification cassera la
  fonctionnalité.

  Workflow modification

  1. ✅ Lire CLAUDE.md (règles globales)
  2. ✅ Vérifier noms_stables.json
  3. ✅ Sauvegarder (commit Git)
  4. ✅ Modifier uniquement commentaires ou styles
  5. ✅ Tester immédiatement
  6. ✅ Rollback si erreur

  ---
  📜 Historique

  | Date       | Version  | Changements                   |
  |------------|----------|-------------------------------|
  | 10-10-2025 | Index 50 | Modularisation initiale       |
  |            |          | - Création du module autonome |
  |            |          | - Système de verrouillage     |
  |            |          | - Import Markdown             |
  |            |          | - Aperçu aléatoire            |
  |            |          | - Métriques de complétion     |

  ---
  📞 Support et ressources

  Documentation projet : README_PROJET.mdArchitecture :
  structure-modulaire.txtGuide pédagogique : Labo Codex
  (https://codexnumeris.org/apropos)Articles : Revue Pédagogie collégiale
  (printemps-été 2024, hiver 2025)

  Debug console :
  // Vérifier cartouches
  console.log('Cartouches GRILLE001:',
  JSON.parse(localStorage.getItem('cartouches_GRILLE001') || '[]'));

  // Vérifier cartouche actuelle
  console.log('Cartouche actuelle:', cartoucheActuel);

  // Vérifier API
  console.log('Fonctions disponibles:', typeof initialiserModuleCartouches, typeof
   sauvegarderCartouche);

  ---
  ⚠️ RAPPEL CRITIQUE : Ce module est une SOURCE de données. Toute modification de
  la structure cartouches_{grilleId} impactera les modules lecteurs futurs
  (productions, évaluations). Testez exhaustivement avant mise en production.