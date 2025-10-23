Documentation technique : pratiques.js

  📋 Vue d'ensemble

  Nom du module : 12-pratiques.js (Pratiques de notation)Version : Index 50
  (10-10-2025a - Modularisation)Étendu : 20 octobre 2025 (options
  d'affichage)Lignes de code : 505 lignesResponsable : Grégoire Bédard

  Description :Module de configuration du système de notation du cours. Permet de
  choisir entre une pratique sommative traditionnelle (pourcentages) ou une
  pratique alternative (PAN - Pratiques Alternatives de Notation). Gère également
  les options d'affichage des indices au tableau de bord (sommatif, alternatif, ou
   les deux).

  Exemple concret :Un enseignant peut configurer son cours en "pratique
  alternative - maîtrise" (Standards-Based Grading). Il décide d'afficher à la
  fois les indices sommatifs (pour comparaison) et alternatifs (basés sur les N
  derniers artefacts) au tableau de bord. Cette configuration influence tous les
  calculs et affichages de l'application.

  ---
  🏷️ Type de module

  Type : SOURCE (Configuration)

  Ce module génère et stocke la configuration de notation dans localStorage.

  Données générées :
  - modalitesEvaluation : Object avec configuration complète (pratique, type PAN,
  options affichage)

  Modules lecteurs :
  - tableau-bord-apercu.js (lit pour savoir quels indices afficher)
  - saisie-presences.js (peut adapter les calculs selon la pratique)
  - evaluations.js (adapte comportement selon pratique)
  - statistiques.js (calculs selon configuration)

  ---
  💾 Données gérées

  Structure de données principales

  1. modalitesEvaluation (objet complet)

  {
    pratique: string,              // "sommative" | "alternative"
    typePAN: string | null,        // "maitrise" | "specifications" | "denotation"
   | null
    affichageTableauBord: {
      afficherSommatif: boolean,   // Afficher indices sommatifs (% global)
      afficherAlternatif: boolean  // Afficher indices alternatifs (N derniers)
    },
    dateConfiguration: string      // ISO format (ex: "2025-10-20T14:30:00.000Z")
  }

  2. Exemples concrets de configurations

  Configuration sommative traditionnelle :
  {
    pratique: "sommative",
    typePAN: null,
    affichageTableauBord: {
      afficherSommatif: true,
      afficherAlternatif: false
    },
    dateConfiguration: "2025-08-15T08:00:00.000Z"
  }

  Configuration alternative - maîtrise (SBG) :
  {
    pratique: "alternative",
    typePAN: "maitrise",
    affichageTableauBord: {
      afficherSommatif: true,      // Pour comparaison
      afficherAlternatif: true     // Méthode principale
    },
    dateConfiguration: "2025-08-15T08:30:00.000Z"
  }

  Configuration alternative - spécifications :
  {
    pratique: "alternative",
    typePAN: "specifications",
    affichageTableauBord: {
      afficherSommatif: false,     // Pas pertinent
      afficherAlternatif: true     // Critères binaires
    },
    dateConfiguration: "2025-08-15T09:00:00.000Z"
  }

  Configuration alternative - dénotation (Ungrading) :
  {
    pratique: "alternative",
    typePAN: "denotation",
    affichageTableauBord: {
      afficherSommatif: false,     // Pas de notes
      afficherAlternatif: false    // Pas de notes
    },
    dateConfiguration: "2025-08-15T09:30:00.000Z"
  }

  Types de PAN (Pratiques Alternatives de Notation)

  | Type           | Nom anglais             | Description
                                 |
  |----------------|-------------------------|------------------------------------
  -------------------------------|
  | maitrise       | Standards-Based Grading | Niveaux de maîtrise (En
  développement, Acquis, Avancé...)         |
  | specifications | Specifications Grading  | Critères binaires (réussi/non
  réussi) pour chaque compétence      |
  | denotation     | Ungrading               | Pas de notes chiffrées, rétroaction
   descriptive et autoévaluation |

  Clés localStorage utilisées

  | Clé                 | Type   | Générée par  | Description
            |
  |---------------------|--------|--------------|---------------------------------
  ----------|
  | modalitesEvaluation | Object | pratiques.js | SOURCE UNIQUE - Configuration de
   notation |

  ---
  🔌 API publique

  Fonctions d'initialisation

  initialiserModulePratiques()

  /**
   * Initialise le module au chargement
   * Appelée automatiquement par 99-main.js
   * 
   * FONCTIONNEMENT:
   * 1. Vérifie présence DOM (#pratiqueNotation)
   * 2. Attache événements via attacherEvenementsPratiques()
   * 3. Charge modalités via chargerModalites()
   * 
   * RETOUR: void (sortie silencieuse si DOM non prêt)
   */

  attacherEvenementsPratiques()

  /**
   * Attache événements aux éléments HTML
   * 
   * ÉVÉNEMENTS ATTACHÉS:
   * - #pratiqueNotation change → changerPratiqueNotation()
   * - #typePAN change → afficherInfoPAN()
   * - #afficherSommatif change → sauvegarderOptionsAffichage()
   * - #afficherAlternatif change → sauvegarderOptionsAffichage()
   * - #btnSauvegarderPratiqueNotation click → sauvegarderPratiqueNotation()
   * 
   * UTILISÉ PAR:
   * - initialiserModulePratiques()
   * 
   * RETOUR: void
   */

  Fonctions de gestion pratique

  changerPratiqueNotation()

  /**
   * Gère changement de pratique de notation
   * 
   * FONCTIONNEMENT:
   * 1. Récupère pratique sélectionnée
   * 2. Si "alternative":
   *    - Affiche #colonnePAN
   * 3. Si "sommative":
   *    - Masque #colonnePAN
   *    - Réinitialise typePAN = null
   *    - Masque #infoPAN
   * 4. Sauvegarde dans modalitesEvaluation
   * 5. Appelle afficherOptionsAffichage()
   * 6. Met à jour statut
   * 
   * UTILISÉ PAR:
   * - Événement change sur #pratiqueNotation
   * 
   * RETOUR: void
   */

  Fonctions de gestion type PAN

  afficherInfoPAN()

  /**
   * Affiche informations sur type PAN sélectionné
   * 
   * FONCTIONNEMENT:
   * 1. Récupère typePAN sélectionné
   * 2. Trouve description dans table
   * 3. Affiche dans #infoPAN
   * 4. Sauvegarde dans modalitesEvaluation
   * 5. Met à jour statut
   * 
   * DESCRIPTIONS:
   * - maitrise: Standard Based Grading
   * - specifications: Specifications Grading
   * - denotation: Ungrading
   * 
   * UTILISÉ PAR:
   * - Événement change sur #typePAN
   * - chargerModalites() (si typePAN déjà sauvegardé)
   * 
   * RETOUR: void
   */

  Fonctions d'affichage options

  afficherOptionsAffichage()

  /**
   * Gère affichage section options d'affichage
   * 
   * FONCTIONNEMENT:
   * 1. Si pratique = "alternative":
   *    - Affiche #optionsAffichageIndices
   *    - Coche les deux par défaut (recherche)
   * 2. Si pratique = "sommative":
   *    - Affiche #optionsAffichageIndices
   *    - Coche seulement sommatif
   * 3. Sinon:
   *    - Masque #optionsAffichageIndices
   * 4. Appelle sauvegarderOptionsAffichage()
   * 
   * UTILISÉ PAR:
   * - changerPratiqueNotation()
   * - chargerModalites()
   * 
   * RETOUR: void
   */

  sauvegarderOptionsAffichage()

  /**
   * Sauvegarde options d'affichage des indices
   * 
   * FONCTIONNEMENT:
   * 1. Récupère état checkboxes
   * 2. Validation: au moins une cochée
   * 3. Si aucune: alerte + force sommatif
   * 4. Sauvegarde dans modalitesEvaluation.affichageTableauBord
   * 5. Log console
   * 
   * VALIDATION:
   * - Au moins une option obligatoire
   * - Si aucune: force afficherSommatif = true
   * 
   * UTILISÉ PAR:
   * - Événements change des checkboxes
   * - afficherOptionsAffichage()
   * 
   * RETOUR: void
   */

  Fonctions de sauvegarde/chargement

  sauvegarderPratiqueNotation()

  /**
   * Sauvegarde configuration complète
   * 
   * FONCTIONNEMENT:
   * 1. Récupère pratique et typePAN
   * 2. Validation:
   *    - Pratique obligatoire
   *    - Si alternative: typePAN obligatoire
   * 3. Construit objet modalitesEvaluation
   * 4. Ajoute timestamp dateConfiguration
   * 5. S'assure que affichageTableauBord existe
   * 6. Sauvegarde dans localStorage
   * 7. Notification succès
   * 8. Met à jour statut
   * 9. Log console
   * 
   * VALIDATION:
   * - pratique obligatoire (alerte si vide)
   * - Si pratique = "alternative": typePAN obligatoire
   * 
   * UTILISÉ PAR:
   * - Bouton «Sauvegarder la configuration»
   * 
   * RETOUR: void + notification
   */

  chargerModalites()

  /**
   * Charge modalités sauvegardées depuis localStorage
   * 
   * FONCTIONNEMENT:
   * 1. Lit modalitesEvaluation
   * 2. Vérifie éléments DOM existent
   * 3. Si pas de données:
   *    - Réinitialise tous les champs
   *    - Masque colonnePAN et optionsAffichage
   * 4. Sinon:
   *    - Remplit #pratiqueNotation
   *    - Si alternative: affiche colonnePAN + charge typePAN
   *    - Charge affichageTableauBord (checkboxes)
   *    - Appelle afficherOptionsAffichage()
   * 5. Met à jour statut
   * 
   * UTILISÉ PAR:
   * - initialiserModulePratiques()
   * 
   * RETOUR: void
   */

  Fonctions de statut

  mettreAJourStatutModalites()

  /**
   * Met à jour affichage du statut
   * 
   * FONCTIONNEMENT:
   * 1. Lit modalitesEvaluation
   * 2. Détermine statut selon valeurs:
   *    - Pas de pratique: "✗ À configurer" (rouge)
   *    - Sommative: "✓ Sommative traditionnelle (%)" (vert)
   *    - Alternative + typePAN: "✓ Alternative (Type)" (vert)
   *    - Alternative sans typePAN: "⚠ Choisir un type de PAN" (orange)
   * 3. Met à jour #statutModalites avec HTML
   * 
   * COULEURS:
   * - Rouge: var(--risque-critique) - À configurer
   * - Orange: var(--orange-accent) - Incomplet
   * - Vert: var(--vert-moyen) - Configuré
   * 
   * UTILISÉ PAR:
   * - changerPratiqueNotation()
   * - afficherInfoPAN()
   * - sauvegarderPratiqueNotation()
   * - chargerModalites()
   * 
   * RETOUR: void
   */

  Fonctions utilitaires

  obtenirConfigurationNotation()

  /**
   * Récupère configuration complète (API publique)
   * 
   * FONCTIONNEMENT:
   * Parse et retourne modalitesEvaluation
   * 
   * UTILISÉ PAR:
   * - tableau-bord-apercu.js (savoir quels indices afficher)
   * - evaluations.js (adapter comportement)
   * - statistiques.js (calculs)
   * 
   * @returns {Object} Configuration complète
   * 
   * EXEMPLE:
   * const config = obtenirConfigurationNotation();
   * if (config.affichageTableauBord?.afficherAlternatif) {
   *   // Afficher indices alternatifs
   * }
   */

  afficherNotificationSucces(message)

  /**
   * Affiche notification temporaire
   * 
   * PARAMÈTRES:
   * @param {string} message - Message à afficher
   * 
   * FONCTIONNEMENT:
   * 1. Crée div.notification-succes
   * 2. Append au body
   * 3. Supprime après 3s
   * 
   * STYLE:
   * - Position: fixed top-right
   * - Fond: vert succès
   * - Animation: slideIn
   * 
   * UTILISÉ PAR:
   * - sauvegarderPratiqueNotation()
   * 
   * RETOUR: void
   */

  ---
  🔗 Dépendances

  Modules requis (ordre de chargement)

  1. 01-config.js (optionnel)
    - Pour : Variables globales (si utilisées)

  Éléments HTML requis

  <!-- Sélecteur pratique -->
  <select id="pratiqueNotation">
    <option value="">-- Choisir --</option>
    <option value="sommative">Sommative (traditionnelle)</option>
    <option value="alternative">Alternative (PAN)</option>
  </select>

  <!-- Colonne PAN (cachée par défaut) -->
  <div id="colonnePAN" style="display: none;">
    <label>Type de PAN :</label>
    <select id="typePAN">
      <option value="">-- Choisir --</option>
      <option value="maitrise">Maîtrise (SBG)</option>
      <option value="specifications">Spécifications</option>
      <option value="denotation">Dénotation (Ungrading)</option>
    </select>
    <div id="infoPAN" style="display: none;"></div>
  </div>

  <!-- Options d'affichage (cachées par défaut) -->
  <div id="optionsAffichageIndices" style="display: none;">
    <h5>Options d'affichage au tableau de bord</h5>
    <label>
      <input type="checkbox" id="afficherSommatif">
      Afficher indices sommatifs (% global)
    </label>
    <label>
      <input type="checkbox" id="afficherAlternatif">
      Afficher indices alternatifs (N derniers artefacts)
    </label>
  </div>

  <!-- Statut -->
  <div id="statutModalites">✗ À configurer</div>

  <!-- Bouton sauvegarde -->
  <button id="btnSauvegarderPratiqueNotation">Sauvegarder la
  configuration</button>

  Classes CSS requises

  .notification-succes    /* Notification temporaire */

  ---
  🚀 Initialisation

  Appel depuis 99-main.js

  // PRIORITÉ 2 : DONNÉES DE BASE

  // MODULE 12: Pratiques de notation
  if (typeof initialiserModulePratiques === 'function') {
      console.log('   → Module 12-pratiques détecté');
      initialiserModulePratiques();
  }

  Ordre de chargement critique

  1. config.js        (optionnel)
  2. pratiques.js     (génère modalitesEvaluation)
  3. tableau-bord-apercu.js (lit modalitesEvaluation)
  4. main.js          (appelle initialiserModulePratiques)

  Événements gérés

  Tous attachés dynamiquement dans attacherEvenementsPratiques() :
  // Sélecteurs
  #pratiqueNotation change → changerPratiqueNotation()
  #typePAN change → afficherInfoPAN()

  // Checkboxes
  #afficherSommatif change → sauvegarderOptionsAffichage()
  #afficherAlternatif change → sauvegarderOptionsAffichage()

  // Bouton
  #btnSauvegarderPratiqueNotation click → sauvegarderPratiqueNotation()

  ---
  🧪 Tests et vérification

  Test 1 : Vérifier modalitesEvaluation existe

  // Console navigateur
  const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') ||
  '{}');
  console.log('Configuration:', modalites);
  console.log('Pratique:', modalites.pratique);
  console.log('Type PAN:', modalites.typePAN);
  console.log('Affichage:', modalites.affichageTableauBord);

  Test 2 : Configuration sommative

  1. Sélectionner "Sommative (traditionnelle)"
  2. Vérifier colonnePAN masquée
  3. Vérifier optionsAffichageIndices visible
  4. Vérifier afficherSommatif coché
  5. Vérifier afficherAlternatif décoché
  6. Clic "Sauvegarder"
  7. Vérifier notification succès
  8. Vérifier statut "✓ Sommative traditionnelle (%)"

  Test 3 : Configuration alternative - maîtrise

  1. Sélectionner "Alternative (PAN)"
  2. Vérifier colonnePAN visible
  3. Sélectionner "Maîtrise (SBG)"
  4. Vérifier description affichée
  5. Vérifier optionsAffichageIndices visible
  6. Vérifier les deux checkboxes cochées
  7. Clic "Sauvegarder"
  8. Vérifier statut "✓ Alternative (Maîtrise)"

  Test 4 : Validation alternative sans type PAN

  1. Sélectionner "Alternative (PAN)"
  2. Ne pas sélectionner de type
  3. Clic "Sauvegarder"
  4. Vérifier alerte "Veuillez choisir un type de pratique alternative"
  5. Vérifier pas sauvegardé

  Test 5 : Validation options affichage

  1. Configurer alternative + maîtrise
  2. Décocher les deux checkboxes
  3. Vérifier alerte "Au moins un type d'affichage..."
  4. Vérifier afficherSommatif recoché automatiquement

  Test 6 : Rechargement page

  1. Configurer alternative + spécifications
  2. Cocher seulement afficherAlternatif
  3. Sauvegarder
  4. Recharger page (F5)
  5. Vérifier pratique = "alternative"
  6. Vérifier typePAN = "specifications"
  7. Vérifier afficherSommatif décoché
  8. Vérifier afficherAlternatif coché
  9. Vérifier statut correct

  Test 7 : API publique

  // Tester obtenirConfigurationNotation()
  const config = obtenirConfigurationNotation();
  console.log('Config:', config);

  // Vérifier structure
  console.log('Pratique:', config.pratique);
  console.log('Affichage sommatif?',
  config.affichageTableauBord?.afficherSommatif);
  console.log('Affichage alternatif?',
  config.affichageTableauBord?.afficherAlternatif);

  Test 8 : Changement de pratique

  1. Configurer sommative
  2. Sauvegarder
  3. Changer pour alternative
  4. Vérifier colonnePAN apparaît
  5. Changer pour sommative
  6. Vérifier colonnePAN disparaît
  7. Vérifier typePAN réinitialisé

  Test 9 : États du statut

  // Tester les 4 états possibles

  // État 1: Aucune config
  localStorage.removeItem('modalitesEvaluation');
  chargerModalites();
  // Vérifier: "✗ À configurer" (rouge)

  // État 2: Sommative
  localStorage.setItem('modalitesEvaluation', JSON.stringify({
      pratique: 'sommative',
      typePAN: null
  }));
  chargerModalites();
  // Vérifier: "✓ Sommative traditionnelle (%)" (vert)

  // État 3: Alternative sans type
  localStorage.setItem('modalitesEvaluation', JSON.stringify({
      pratique: 'alternative',
      typePAN: null
  }));
  chargerModalites();
  // Vérifier: "⚠ Choisir un type de PAN" (orange)

  // État 4: Alternative avec type
  localStorage.setItem('modalitesEvaluation', JSON.stringify({
      pratique: 'alternative',
      typePAN: 'maitrise'
  }));
  chargerModalites();
  // Vérifier: "✓ Alternative (Maîtrise)" (vert)

  ---
  🐛 Problèmes connus

  Problème 1 : Options affichage pas sauvegardées

  Symptôme : Checkboxes pas cochées après rechargement

  Cause : affichageTableauBord absent dans modalitesEvaluation

  Solution :
  // Vérifier structure
  const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') ||
  '{}');
  console.log('affichageTableauBord existe?', !!modalites.affichageTableauBord);

  // Ajouter manuellement si absent
  if (!modalites.affichageTableauBord) {
      modalites.affichageTableauBord = {
          afficherSommatif: true,
          afficherAlternatif: false
      };
      localStorage.setItem('modalitesEvaluation', JSON.stringify(modalites));
  }

  Problème 2 : Statut pas mis à jour

  Symptôme : #statutModalites reste "À configurer" malgré sauvegarde

  Cause : Élément pas trouvé ou mettreAJourStatutModalites() pas appelée

  Solution :
  // Vérifier élément existe
  console.log('statutModalites existe?',
  !!document.getElementById('statutModalites'));

  // Forcer mise à jour
  mettreAJourStatutModalites();

  Problème 3 : colonnePAN reste visible après changement

  Symptôme : Menu PAN visible même en mode sommative

  Cause : Style inline pas appliqué

  Solution :
  // Forcer masquage
  document.getElementById('colonnePAN').style.display = 'none';
  document.getElementById('typePAN').value = '';
  document.getElementById('infoPAN').style.display = 'none';

  Problème 4 : Validation échoue silencieusement

  Symptôme : Pas d'alerte malgré champs vides

  Cause : Erreur JavaScript bloque l'exécution

  Solution :
  // Déboguer sauvegarde
  try {
      sauvegarderPratiqueNotation();
  } catch (error) {
      console.error('Erreur sauvegarde:', error);
  }

  // Vérifier valeurs
  const pratique = document.getElementById('pratiqueNotation').value;
  const typePAN = document.getElementById('typePAN').value;
  console.log('Pratique:', pratique, 'TypePAN:', typePAN);

  Problème 5 : obtenirConfigurationNotation() retourne objet vide

  Symptôme : {} retourné malgré configuration existante

  Cause : localStorage.modalitesEvaluation corrompu ou absent

  Solution :
  // Vérifier données brutes
  const raw = localStorage.getItem('modalitesEvaluation');
  console.log('Données brutes:', raw);

  // Si corrompu, supprimer
  if (raw && raw !== '{}') {
      try {
          JSON.parse(raw);
      } catch (e) {
          console.error('Données corrompues:', e);
          localStorage.removeItem('modalitesEvaluation');
      }
  }

  ---
  📐 Règles de modification

  ⚠️ ZONES PROTÉGÉES

  1. Noms de fonctions : Listés dans noms_stables.json
  2. IDs HTML : Ne pas renommer les id des éléments
  3. Clé localStorage : modalitesEvaluation (fixe)
  4. Structure modalitesEvaluation : Champs (modules dépendants)
  5. API publique : obtenirConfigurationNotation()

  ✅ Modifications autorisées

  1. Commentaires : Ajout/modification sans limite
  2. Descriptions PAN : Textes dans table descriptions
  3. Messages utilisateur : Textes alertes/notifications
  4. Durée notification : setTimeout (actuellement 3000ms)
  5. Validation : Ajout de règles supplémentaires
  6. Types PAN : Ajout de nouveaux types (avec description)

  Ajout d'un nouveau type PAN

  Procédure :
  1. ✅ Ajouter option dans #typePAN :
  <option value="nouveau_type">Nouveau Type</option>
  2. ✅ Ajouter description dans afficherInfoPAN() :
  const descriptions = {
      'maitrise': '...',
      'specifications': '...',
      'denotation': '...',
      'nouveau_type': 'Description du nouveau type...'
  };
  3. ✅ Ajouter label dans mettreAJourStatutModalites() :
  const types = {
      'maitrise': 'Maîtrise',
      'specifications': 'Spécifications',
      'denotation': 'Dénotation',
      'nouveau_type': 'Nouveau Type'
  };
  4. ✅ Tester exhaustivement

  Workflow modification

  1. ✅ Lire CLAUDE.md (règles globales)
  2. ✅ Vérifier noms_stables.json
  3. ✅ Sauvegarder (commit Git)
  4. ✅ Modifier uniquement zones autorisées
  5. ✅ Tester immédiatement
  6. ✅ Rollback si erreur

  ---
  📜 Historique

  | Date       | Version  | Changements                                        |
  |------------|----------|----------------------------------------------------|
  | 10-10-2025 | Index 50 | Modularisation initiale                            |
  |            |          | - Gestion pratique sommative/alternative           |
  |            |          | - Types PAN (maîtrise, spécifications, dénotation) |
  |            |          | - Descriptions contextuelles                       |
  |            |          | - Statut de configuration                          |
  | 20-10-2025 | Étendu   | Ajout options d'affichage                          |
  |            |          | - Checkbox afficherSommatif                        |
  |            |          | - Checkbox afficherAlternatif                      |
  |            |          | - Validation (au moins une cochée)                 |
  |            |          | - Sauvegarde dans affichageTableauBord             |

  ---
  📞 Support et ressources

  Documentation projet : README_PROJET.mdArchitecture :
  structure-modulaire.txtGuide pédagogique : Labo Codex
  (https://codexnumeris.org/apropos)Articles PAN : Revue Pédagogie collégiale
  (printemps-été 2024, hiver 2025)

  Debug console :
  // Vérifier configuration
  const config = obtenirConfigurationNotation();
  console.log('Configuration complète:', config);

  // Vérifier structure
  console.log('Pratique:', config.pratique);
  console.log('Type PAN:', config.typePAN);
  console.log('Affichage TB:', config.affichageTableauBord);

  // Vérifier dates
  console.log('Date config:', config.dateConfiguration);
  console.log('Config récente?', new Date(config.dateConfiguration) > new
  Date('2025-10-01'));

  // Vérifier fonctions disponibles
  console.log('API disponible?', {
      init: typeof initialiserModulePratiques,
      obtenir: typeof obtenirConfigurationNotation,
      sauvegarder: typeof sauvegarderPratiqueNotation
  });

  // Tester états
  mettreAJourStatutModalites();

  ---
  ⚠️ RAPPEL CRITIQUE : Ce module définit la philosophie pédagogique de
  l'évaluation pour tout le cours. La configuration choisie influence les calculs
  d'indices, l'affichage au tableau de bord, et l'interprétation des résultats.
  Assurez-vous que la configuration correspond bien à votre approche pédagogique
  avant de commencer à saisir des données.
