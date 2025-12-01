Documentation technique : horaire.js

  📋 Vue d'ensemble

  Nom du module : 10-horaire.js (Gestion de l'horaire des cours)Version : Index 50
   (10-10-2025a - Modularisation)Lignes de code : 895 lignesResponsable : Grégoire
   Bédard

  Description :Module de configuration de l'horaire hebdomadaire et de génération
  des séances complètes du trimestre. Gère deux formats : 2×2h (deux séances de
  2h) ou 1×4h (une séance de 4h). Combine l'horaire hebdomadaire avec le
  calendrier complet pour générer toutes les séances datées, incluant la gestion
  des reprises.

  Exemple concret :Un cours a lieu le lundi de 13h à 14h50 (séance A) et le jeudi
  de 13h à 14h50 (séance B). Si le lundi 2 septembre est férié et repris le
  mercredi 4 septembre, le module génère automatiquement une séance pour le
  mercredi avec l'horaire du lundi.

  ---
  🏷️ Type de module

  Type : SOURCE

  Ce module génère et stocke les séances complètes du trimestre dans localStorage.

  Données générées :
  - seancesHoraire : Array des séances hebdomadaires configurées
  - seancesCompletes : SOURCE UNIQUE - Object avec toutes les séances datées du
  trimestre
  - formatHoraire : Format sélectionné ('2x2' ou '1x4')

  Données lues :
  - calendrierComplet (depuis trimestre.js) - Pour les dates et statuts des jours

  Modules lecteurs :
  - saisie-presences.js (lit seancesCompletes pour affichage et saisie)
  - Modules de calcul d'assiduité (lit seancesCompletes)
  - Modules de statistiques (lit seancesCompletes)

  ---
  💾 Données gérées

  Structure de données principales

  1. Séance hebdomadaire (seancesHoraire)

  {
    id: number,              // Timestamp unique
    nom: string,             // 'A' | 'B' | 'Unique' | 'A (copie)'
    jour: string,            // 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 
  'Vendredi'
    debut: string,           // Format: "HH:MM" (ex: "13:00")
    fin: string,             // Format: "HH:MM" (ex: "14:50")
    local: string,           // Ex: "1709", "Zoom A"
    verrouille: boolean      // Protection contre modification/suppression
  }

  2. Séances complètes du trimestre (seancesCompletes) - SOURCE UNIQUE

  {
    "2025-08-25": [         // Date au format YYYY-MM-DD
      {
        id: string,          // Format: "SEANCE-{date}-{nom}" (ex: 
  "SEANCE-2025-08-25-A")
        seanceHoraireId: number,  // Référence vers seancesHoraire
        nom: string,         // 'A' | 'B' | 'Unique'
        date: string,        // "2025-08-25"
        jour: string,        // "Lundi" (jour réel, pas le jour de l'horaire)
        debut: string,       // "13:00"
        fin: string,         // "14:50"
        local: string,       // "1709"
        numeroSemaine: number // 1-15 (numéro de semaine du trimestre)
      },
      // ... autres séances du même jour
    ],
    "2025-08-28": [...],
    // ... toutes les dates du trimestre avec cours
  }

  3. Exemple concret avec reprise

  Configuration horaire hebdomadaire :
  [
    {
      id: 1698765432000,
      nom: "A",
      jour: "Lundi",
      debut: "13:00",
      fin: "14:50",
      local: "1709",
      verrouille: false
    },
    {
      id: 1698765432001,
      nom: "B",
      jour: "Jeudi",
      debut: "13:00",
      fin: "14:50",
      local: "1709",
      verrouille: false
    }
  ]

  Séances complètes générées :
  {
    "2025-08-25": [  // Lundi normal
      {
        id: "SEANCE-2025-08-25-A",
        seanceHoraireId: 1698765432000,
        nom: "A",
        date: "2025-08-25",
        jour: "Lundi",
        debut: "13:00",
        fin: "14:50",
        local: "1709",
        numeroSemaine: 1
      }
    ],
    "2025-08-28": [  // Jeudi normal
      {
        id: "SEANCE-2025-08-28-B",
        seanceHoraireId: 1698765432001,
        nom: "B",
        date: "2025-08-28",
        jour: "Jeudi",
        debut: "13:00",
        fin: "14:50",
        local: "1709",
        numeroSemaine: 1
      }
    ],
    "2025-09-04": [  // Mercredi - REPRISE du lundi 2 septembre
      {
        id: "SEANCE-2025-09-04-A",
        seanceHoraireId: 1698765432000,
        nom: "A",
        date: "2025-09-04",
        jour: "Mercredi",  // Jour réel
        debut: "13:00",     // Horaire du lundi
        fin: "14:50",
        local: "1709",
        numeroSemaine: 2
      }
    ]
  }

  Clés localStorage utilisées

  | Clé               | Type   | Générée par  | Description
      |
  |-------------------|--------|--------------|-----------------------------------
  ----|
  | formatHoraire     | String | horaire.js   | Format '2x2' ou '1x4'
      |
  | seancesHoraire    | Array  | horaire.js   | Séances hebdomadaires configurées
      |
  | seancesCompletes  | Object | horaire.js   | SOURCE UNIQUE - Toutes séances
  datées |
  | calendrierComplet | Object | trimestre.js | (LECTURE) - Calendrier du
  trimestre   |

  Gestion des reprises

  Le module gère intelligemment les reprises :

  // Si le jour est une reprise
  if (infosJour.statut === 'reprise' && infosJour.jourRemplace) {
      // Utiliser l'horaire du jour remplacé
      jourPourSeances = infosJour.jourRemplace;
  }

  Exemple :
  - Lundi 2 septembre : Férié (Fête du Travail)
  - Mercredi 4 septembre : Reprise du lundi
  - Résultat : Le mercredi utilise l'horaire configuré pour le lundi

  ---
  🔌 API publique

  Fonctions d'initialisation

  initialiserModuleHoraire()

  /**
   * Initialise le module au chargement
   * Appelée automatiquement par 99-main.js
   * 
   * FONCTIONNEMENT:
   * 1. Restaure format horaire sauvegardé
   * 2. Attache événements aux radio buttons
   * 3. Affiche séances existantes
   * 4. Génère seancesCompletes
   * 
   * RETOUR: void (sortie silencieuse si DOM non prêt)
   */

  Fonctions de génération (SOURCE UNIQUE)

  genererSeancesCompletes()

  /**
   * FONCTION SOURCE UNIQUE - Génère toutes les séances du trimestre
   * 
   * FONCTIONNEMENT:
   * 1. Lit seancesHoraire (séances hebdomadaires)
   * 2. Lit calendrierComplet (jours du trimestre)
   * 3. Pour chaque jour de cours/reprise:
   *    - Identifie le jour de semaine (réel ou remplacé)
   *    - Crée les séances correspondantes
   *    - Assigne ID unique et numéro de semaine
   * 4. Stocke dans localStorage.seancesCompletes
   * 
   * GESTION REPRISES:
   * - Si statut === 'reprise' et jourRemplace existe
   * - Utilise l'horaire du jourRemplace
   * - Exemple: Mercredi avec horaire du Lundi
   * 
   * FORMAT RETOUR: Object avec dates en clés
   * {
   *   "2025-08-25": [séance1, séance2, ...],
   *   "2025-08-28": [séance1, ...]
   * }
   * 
   * CLÉ LOCALSTORAGE: 'seancesCompletes'
   * RETOUR: Object des séances + log console
   */

  obtenirSeancesCompletes()

  /**
   * API publique pour obtenir les séances complètes
   * 
   * FONCTIONNEMENT:
   * 1. Lit localStorage.seancesCompletes
   * 2. Si absent: appelle genererSeancesCompletes()
   * 3. Retourne l'objet complet
   * 
   * UTILISÉ PAR:
   * - saisie-presences.js (affichage et saisie)
   * - Modules de calcul d'assiduité
   * - Modules de statistiques
   * 
   * @returns {Object} - Séances complètes du trimestre
   */

  obtenirSeancesJour(dateStr)

  /**
   * API publique pour obtenir les séances d'une date
   * 
   * PARAMÈTRES:
   * @param {string} dateStr - Date au format YYYY-MM-DD
   * 
   * FONCTIONNEMENT:
   * 1. Appelle obtenirSeancesCompletes()
   * 2. Retourne l'array pour cette date
   * 3. Si aucune séance: retourne []
   * 
   * UTILISÉ PAR:
   * - saisie-presences.js (affichage d'un jour)
   * - Modules de calendrier
   * 
   * @returns {Array} - Séances de cette date (ou [])
   * 
   * EXEMPLE:
   * obtenirSeancesJour("2025-08-25")
   * // → [{id: "SEANCE-2025-08-25-A", ...}, {id: "SEANCE-2025-08-25-B", ...}]
   */

  Fonctions de formulaire

  afficherFormulaireSeances()

  /**
   * Affiche formulaire d'ajout/édition de séances
   * 
   * FONCTIONNEMENT:
   * 1. Vérifie qu'un format est sélectionné
   * 2. Génère HTML adapté au format:
   *    - '2x2' : 2 formulaires (Séance A et B)
   *    - '1x4' : 1 formulaire (Séance unique)
   * 3. Injecte dans #seancesFormContainer
   * 
   * CHAMPS GÉNÉRÉS:
   * - Jour de semaine (select)
   * - Heure début (select 8h-22h)
   * - Heure fin (select 8h50-22h50)
   * - Local (input text)
   * 
   * RETOUR: void
   */

  confirmerAjoutSeances()

  /**
   * Enregistre les séances (ajout ou modification)
   * 
   * FONCTIONNEMENT:
   * 1. Vérifie format horaire
   * 2. Récupère valeurs des champs
   * 3. Validation (jour et heures obligatoires)
   * 4. Vérifie mode édition (data-mode-edition)
   * 5. Crée/met à jour objet(s) séance(s)
   * 6. Sauvegarde dans seancesHoraire
   * 7. Appelle genererSeancesCompletes()
   * 8. Rafraîchit affichage
   * 
   * VALIDATION:
   * - Jour obligatoire
   * - Heures début/fin obligatoires
   * - Local optionnel
   * 
   * MODE ÉDITION:
   * - Si data-mode-edition présent
   * - Remplace séance(s) existante(s)
   * - Conserve même ID
   * 
   * RETOUR: void + alert succès
   */

  annulerAjoutSeance()

  /**
   * Annule ajout/édition et masque formulaire
   * 
   * FONCTIONNEMENT:
   * 1. Masque #formAjoutSeance
   * 2. Réinitialise bouton confirmer
   * 3. Supprime data-mode-edition
   * 
   * UTILISÉ PAR:
   * - Bouton «Annuler»
   * - confirmerAjoutSeances() après sauvegarde
   * 
   * RETOUR: void
   */

  Fonctions d'affichage

  afficherSeancesExistantes()

  /**
   * Affiche liste des séances configurées
   * 
   * FONCTIONNEMENT:
   * 1. Lit seancesHoraire depuis localStorage
   * 2. Si vide: message "Aucune séance"
   * 3. Sinon: génère cartes HTML
   * 4. Affiche pour chaque séance:
   *    - Nom (A, B, Unique)
   *    - Jour, heures, local
   *    - Checkbox verrouillage
   *    - Boutons: Modifier, Dupliquer, Supprimer
   * 
   * APPARENCE:
   * - Opacité 70% si verrouillée
   * - Boutons désactivés si verrouillée
   * 
   * RETOUR: void
   */

  Fonctions de gestion

  modifierSeance(id)

  /**
   * Ouvre formulaire en mode édition
   * 
   * PARAMÈTRES:
   * @param {number} id - ID de la séance
   * 
   * FONCTIONNEMENT:
   * 1. Trouve séance dans seancesHoraire
   * 2. Affiche formulaire
   * 3. Pré-remplit champs avec valeurs
   * 4. Change bouton en "Enregistrer modifications"
   * 5. Définit data-mode-edition
   * 
   * UTILISÉ PAR:
   * - Bouton «Modifier»
   * 
   * RETOUR: void
   */

  supprimerSeance(id)

  /**
   * Supprime séance avec confirmation
   * 
   * PARAMÈTRES:
   * @param {number} id - ID de la séance
   * 
   * FONCTIONNEMENT:
   * 1. Vérifie pas verrouillée
   * 2. Demande confirmation
   * 3. Filtre seancesHoraire
   * 4. Sauvegarde
   * 5. Appelle genererSeancesCompletes()
   * 6. Rafraîchit affichage
   * 
   * SÉCURITÉ:
   * - Bloquée si verrouillée (alert)
   * - Confirmation obligatoire
   * 
   * RETOUR: void
   */

  dupliquerSeance(id)

  /**
   * Duplique séance existante
   * 
   * PARAMÈTRES:
   * @param {number} id - ID de la séance
   * 
   * FONCTIONNEMENT:
   * 1. Trouve séance originale
   * 2. Crée copie complète (spread)
   * 3. Nouvel ID (Date.now())
   * 4. Ajoute "(copie)" au nom
   * 5. Déverrouille copie
   * 6. Ajoute et sauvegarde
   * 7. Rafraîchit
   * 
   * RETOUR: void + alert succès
   */

  basculerVerrouillageSeance(id)

  /**
   * Bascule état verrouillé/déverrouillé
   * 
   * PARAMÈTRES:
   * @param {number} id - ID de la séance
   * 
   * FONCTIONNEMENT:
   * 1. Lit état checkbox
   * 2. Met à jour seancesHoraire
   * 3. Sauvegarde
   * 4. Rafraîchit affichage
   * 
   * EFFET:
   * - Empêche modification/suppression si verrouillé
   * - Change opacité carte (70%)
   * - Désactive boutons Modifier/Supprimer
   * 
   * UTILISÉ PAR:
   * - Checkbox dans carte séance
   * 
   * RETOUR: void
   */

  Fonctions utilitaires

  genererOptionsHeureDebut()

  /**
   * Génère options select pour heure début
   * 
   * PLAGE: 8h00 à 22h00
   * FORMAT: "08:00", "09:00", ..., "22:00"
   * AFFICHAGE: "8h00", "9h00", ..., "22h00"
   * 
   * @returns {string} - HTML des options
   */

  genererOptionsHeureFin()

  /**
   * Génère options select pour heure fin
   * 
   * PLAGE: 8h50 à 22h50
   * FORMAT: "08:50", "09:50", ..., "22:50"
   * AFFICHAGE: "8h50", "9h50", ..., "22h50"
   * 
   * @returns {string} - HTML des options
   */

  mettreAJourInterfaceHoraire()

  /**
   * Active/désactive interface selon format sélectionné
   * 
   * FONCTIONNEMENT:
   * - Si format sélectionné:
   *   - Active bouton "Configurer séances"
   *   - Masque message
   * - Sinon:
   *   - Désactive bouton (opacité 50%)
   *   - Affiche message d'avertissement
   * 
   * RETOUR: void
   */

  ---
  🔗 Dépendances

  Modules requis (ordre de chargement)

  1. 01-config.js (CRITIQUE)
    - Fonction : echapperHtml(texte)
  2. trimestre.js (CRITIQUE)
    - Lit : localStorage.calendrierComplet
    - Pour : Identifier jours de cours et reprises

  Fonctions externes utilisées

  echapperHtml(texte)  // Protection XSS depuis config.js

  Éléments HTML requis

  <!-- Sélection format -->
  <input type="radio" name="formatHoraire" value="2x2">
  <input type="radio" name="formatHoraire" value="1x4">

  <!-- Conteneurs -->
  <div id="seancesContainer"></div>
  <div id="formAjoutSeance" style="display: none;">
    <div id="seancesFormContainer"></div>
    <button id="btnConfirmerSeances"></button>
  </div>

  <!-- Message si pas de format -->
  <div id="messageAucunFormat"></div>

  <!-- Champs dynamiques (générés par afficherFormulaireSeances) -->
  <select id="jourSeanceA"></select>
  <select id="debutSeanceA"></select>
  <select id="finSeanceA"></select>
  <input id="localSeanceA">

  <select id="jourSeanceB"></select>
  <select id="debutSeanceB"></select>
  <select id="finSeanceB"></select>
  <input id="localSeanceB">

  <select id="jourSeanceUnique"></select>
  <select id="debutSeanceUnique"></select>
  <select id="finSeanceUnique"></select>
  <input id="localSeanceUnique">

  Classes CSS requises

  .controle-form         /* Inputs et selects */
  .groupe-form          /* Groupe label + input */
  .btn                  /* Boutons génériques */
  .btn-ajouter          /* Bouton ajouter */
  .btn-modifier         /* Bouton modifier */
  .btn-supprimer        /* Bouton supprimer */
  .btn-sm               /* Petit bouton */
  .btn-groupe           /* Groupe de boutons */
  .text-muted           /* Texte grisé */

  ---
  🚀 Initialisation

  Appel depuis 99-main.js

  // PRIORITÉ 1 : MODULES GÉNÉRATEURS DE DONNÉES

  // MODULE HORAIRE: Génère seancesCompletes (source unique)
  if (typeof initialiserModuleHoraire === 'function') {
      console.log('   → Module 10-horaire détecté');
      initialiserModuleHoraire();
  }

  Ordre de chargement critique

  1. config.js        (echapperHtml)
  2. trimestre.js     (génère calendrierComplet)
  3. horaire.js       (lit calendrierComplet, génère seancesCompletes)
  4. saisie-presences.js (lit seancesCompletes)
  5. main.js          (appelle initialiserModuleHoraire)

  Événements gérés

  Attachés dynamiquement dans initialiserModuleHoraire() :
  // Radio buttons format
  document.querySelectorAll('input[name="formatHoraire"]').forEach(radio => {
      radio.addEventListener('change', function() {
          localStorage.setItem('formatHoraire', this.value);
          mettreAJourInterfaceHoraire();
      });
  });

  Attachés via attributs HTML :
  // Formulaire
  onclick="afficherFormulaireSeances()"
  onclick="confirmerAjoutSeances()"
  onclick="annulerAjoutSeance()"

  // Gestion séances
  onclick="modifierSeance({id})"
  onclick="dupliquerSeance({id})"
  onclick="supprimerSeance({id})"
  onchange="basculerVerrouillageSeance({id})"

  ---
  🧪 Tests et vérification

  Test 1 : Vérifier seancesCompletes existe

  // Console navigateur
  const seancesCompletes = JSON.parse(localStorage.getItem('seancesCompletes') ||
  '{}');
  console.log('Nombre de jours avec séances:',
  Object.keys(seancesCompletes).length);
  console.log('Exemple première date:', Object.keys(seancesCompletes)[0]);
  console.log('Séances de cette date:',
  seancesCompletes[Object.keys(seancesCompletes)[0]]);

  Test 2 : Vérifier format horaire

  const format = localStorage.getItem('formatHoraire');
  console.log('Format horaire:', format); // "2x2" ou "1x4"

  const seancesHoraire = JSON.parse(localStorage.getItem('seancesHoraire') ||
  '[]');
  console.log('Nombre de séances hebdomadaires:', seancesHoraire.length);
  console.log('Séances:', seancesHoraire);

  Test 3 : Tester API publique

  // API obtenirSeancesCompletes()
  const toutes = obtenirSeancesCompletes();
  console.log('Total jours:', Object.keys(toutes).length);

  // API obtenirSeancesJour()
  const seances25Aout = obtenirSeancesJour("2025-08-25");
  console.log('Séances du 25 août:', seances25Aout);

  Test 4 : Vérifier gestion reprises

  // Trouver une reprise dans calendrierComplet
  const calendrier = JSON.parse(localStorage.getItem('calendrierComplet') ||
  '{}');
  const reprises = Object.entries(calendrier).filter(([date, info]) => info.statut
   === 'reprise');
  console.log('Reprises trouvées:', reprises.length);

  // Vérifier séances pour une reprise
  if (reprises.length > 0) {
      const [dateReprise, infoReprise] = reprises[0];
      console.log('Date reprise:', dateReprise);
      console.log('Jour remplacé:', infoReprise.jourRemplace);

      const seancesCompletes = obtenirSeancesCompletes();
      console.log('Séances de cette reprise:', seancesCompletes[dateReprise]);
  }

  Test 5 : Compter total séances

  const seancesCompletes = obtenirSeancesCompletes();
  let totalSeances = 0;

  Object.values(seancesCompletes).forEach(seancesJour => {
      totalSeances += seancesJour.length;
  });

  console.log(`Total séances du trimestre: ${totalSeances}`);
  console.log(`Réparties sur ${Object.keys(seancesCompletes).length} jours`);

  Scénario de test complet

  1. Sélectionner format
    - Cocher radio "2×2h"
    - Vérifier localStorage.formatHoraire = "2x2"
    - Vérifier bouton "Configurer" activé
  2. Configurer séances A et B
    - Clic "Configurer les séances"
    - Séance A: Lundi, 13h-14h50, Local 1709
    - Séance B: Jeudi, 13h-14h50, Local 1709
    - Clic "Ajouter les séances"
    - Vérifier localStorage.seancesHoraire a 2 entrées
  3. Vérifier génération seancesCompletes
    - Console: obtenirSeancesCompletes()
    - Vérifier présence de dates
    - Vérifier structure séances
  4. Tester modification
    - Clic "Modifier" sur Séance A
    - Changer local: 1710
    - Clic "Enregistrer modifications"
    - Vérifier localStorage mis à jour
  5. Tester verrouillage
    - Cocher 🔒 sur Séance B
    - Vérifier boutons Modifier/Supprimer désactivés
    - Vérifier opacité 70%
    - Décocher → boutons réactivés
  6. Tester duplication
    - Clic "Dupliquer" sur Séance A
    - Vérifier nouvelle séance "A (copie)"
    - Vérifier déverrouillée
  7. Tester suppression
    - Clic "Supprimer" sur copie
    - Confirmer
    - Vérifier disparition
  8. Vérifier reprises
    - Aller dans Réglages → Trimestre
    - Marquer un lundi en reprise le mercredi
    - Vérifier seancesCompletes[mercredi] utilise horaire du lundi

  ---
  🐛 Problèmes connus

  Problème 1 : seancesCompletes vide malgré configuration

  Symptôme : localStorage.seancesCompletes existe mais est vide {}

  Causes possibles :
  1. calendrierComplet absent ou vide
  2. Aucun jour avec statut 'cours' ou 'reprise'
  3. seancesHoraire vide

  Solution :
  // Vérifier calendrier
  const calendrier = JSON.parse(localStorage.getItem('calendrierComplet') ||
  '{}');
  console.log('Calendrier existe?', Object.keys(calendrier).length > 0);

  // Vérifier jours de cours
  const joursCours = Object.values(calendrier).filter(j => j.statut === 'cours' ||
   j.statut === 'reprise');
  console.log('Jours de cours:', joursCours.length);

  // Vérifier séances horaire
  const seancesHoraire = JSON.parse(localStorage.getItem('seancesHoraire') ||
  '[]');
  console.log('Séances hebdo:', seancesHoraire.length);

  // Si tout est OK, régénérer
  if (joursCours.length > 0 && seancesHoraire.length > 0) {
      genererSeancesCompletes();
  }

  Problème 2 : Reprises ne fonctionnent pas

  Symptôme : Les reprises n'utilisent pas le bon horaire

  Cause : jourRemplace absent ou incorrect dans calendrierComplet

  Solution :
  // Vérifier structure reprise
  const calendrier = JSON.parse(localStorage.getItem('calendrierComplet') ||
  '{}');
  const reprises = Object.entries(calendrier).filter(([d, i]) => i.statut ===
  'reprise');

  reprises.forEach(([date, info]) => {
      console.log(`Reprise ${date}:`, {
          jourReel: info.jourSemaine,
          jourRemplace: info.jourRemplace  // DOIT exister
      });
  });

  // Si jourRemplace manque, reconfigurer dans module trimestre

  Problème 3 : Bouton "Configurer" désactivé

  Symptôme : Bouton reste grisé malgré format sélectionné

  Cause : Format pas sauvegardé dans localStorage

  Solution :
  // Vérifier format
  console.log('Format:', localStorage.getItem('formatHoraire'));

  // Si null, cocher manuellement et sauvegarder
  const radio =
  document.querySelector('input[name="formatHoraire"][value="2x2"]');
  if (radio) {
      radio.checked = true;
      localStorage.setItem('formatHoraire', '2x2');
      mettreAJourInterfaceHoraire();
  }

  Problème 4 : Séances dupliquées à chaque refresh

  Symptôme : Nombre de séances augmente à chaque rechargement

  Cause : initialiserModuleHoraire() appelé plusieurs fois

  Solution :
  // Vérifier dans main.js qu'il n'y a qu'un seul appel
  // Ajouter garde si nécessaire
  let horaireInitialise = false;

  function initialiserModuleHoraire() {
      if (horaireInitialise) {
          console.log('⚠️ Horaire déjà initialisé');
          return;
      }

      // ... reste du code

      horaireInitialise = true;
  }

  Problème 5 : Modification ne sauvegarde pas

  Symptôme : Modifications perdues après "Enregistrer"

  Cause : data-mode-edition pas défini ou mauvais ID

  Solution :
  // Vérifier mode édition
  const btnConfirmer = document.getElementById('btnConfirmerSeances');
  console.log('Mode édition:', btnConfirmer.getAttribute('data-mode-edition'));

  // Si pas défini, le bouton créera une nouvelle séance au lieu de modifier

  ---
  📐 Règles de modification

  ⚠️ ZONES PROTÉGÉES

  1. Noms de fonctions : Listés dans noms_stables.json
  2. IDs HTML : Ne pas renommer les id des éléments
  3. Clés localStorage : Format formatHoraire, seancesHoraire, seancesCompletes
  fixe
  4. Structure seancesCompletes : Format de la SOURCE UNIQUE (modules dépendants)
  5. API publique : obtenirSeancesCompletes(), obtenirSeancesJour(dateStr)

  ✅ Modifications autorisées

  1. Commentaires : Ajout/modification sans limite
  2. Styles inline : Variables CSS et styles visuels
  3. Messages utilisateur : Textes d'alertes
  4. Plage horaire : Actuellement 8h-22h (modifiable lignes 144-167)
  5. Validation formulaire : Règles de validation (ligne 541-545)
  6. Textes boutons : Labels des boutons

  Structure seancesCompletes (CRITIQUE)

  NE PAS MODIFIER la structure de l'objet seancesCompletes car elle est lue par :
  - saisie-presences.js
  - Modules de calcul d'assiduité
  - Modules de statistiques

  Si modification nécessaire :
  1. Mettre à jour TOUS les modules lecteurs
  2. Documenter la migration
  3. Tester exhaustivement

  Workflow modification

  1. ✅ Lire CLAUDE.md (règles globales)
  2. ✅ Vérifier noms_stables.json
  3. ✅ Sauvegarder (commit Git)
  4. ✅ Modifier uniquement commentaires ou styles
  5. ✅ Tester immédiatement
  6. ✅ Si modification structure : AVERTIR et tester TOUS modules lecteurs
  7. ✅ Rollback si erreur

  ---
  📜 Historique

  | Date       | Version  | Changements                                   |
  |------------|----------|-----------------------------------------------|
  | 10-10-2025 | Index 50 | Modularisation initiale                       |
  |            |          | - Création module autonome                    |
  |            |          | - Génération seancesCompletes (SOURCE UNIQUE) |
  |            |          | - Gestion reprises intelligente               |
  |            |          | - API publique (obtenir...)                   |
  |            |          | - Système verrouillage                        |
  |            |          | - Duplication séances                         |
  |            |          | - Format 2×2h ou 1×4h                         |

  ---
  📞 Support et ressources

  Documentation projet : README_PROJET.mdArchitecture :
  structure-modulaire.txtGuide pédagogique : Labo Codex
  (https://codexnumeris.org/apropos)

  Debug console :
  // Vérifier format et séances hebdo
  console.log('Format:', localStorage.getItem('formatHoraire'));
  console.log('Séances hebdo:', JSON.parse(localStorage.getItem('seancesHoraire')
  || '[]'));

  // Vérifier seancesCompletes
  const sc = obtenirSeancesCompletes();
  console.log('Jours avec séances:', Object.keys(sc).length);
  console.log('Total séances:', Object.values(sc).reduce((sum, s) => sum +
  s.length, 0));

  // Vérifier API
  console.log('API disponible?', typeof obtenirSeancesCompletes);
  console.log('Séances du 25 août:', obtenirSeancesJour("2025-08-25"));

  // Debug reprises
  const calendrier = JSON.parse(localStorage.getItem('calendrierComplet') ||
  '{}');
  const reprises = Object.entries(calendrier).filter(([d, i]) => i.statut ===
  'reprise');
  console.log('Reprises:', reprises.map(([d, i]) => `${d} (${i.jourRemplace})`));

  ---
  ⚠️ RAPPEL CRITIQUE : Ce module est une SOURCE de données. seancesCompletes est
  la source unique de vérité pour toutes les séances du trimestre. Toute
  modification de sa structure impactera TOUS les modules lecteurs
  (saisie-presences.js, calculs d'assiduité, statistiques). Testez exhaustivement
  avant mise en production.