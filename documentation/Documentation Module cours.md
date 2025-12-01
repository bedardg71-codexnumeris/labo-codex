Documentation technique : cours.js

  📋 Vue d'ensemble

  Nom du module : 08-cours.js (Gestion des cours)Version : Index 50 (10-10-2025a -
   Modularisation)Lignes de code : 730 lignesResponsable : Grégoire Bédard

  Description :Module de configuration et gestion des cours. Permet de créer,
  modifier, dupliquer et supprimer des configurations de cours (code, nom,
  compétences, enseignant, session, horaires). Gère également le concept de "cours
   actif" utilisé comme référence par les autres modules de l'application.

  Exemple concret :Un enseignant peut créer plusieurs configurations pour ses
  différents groupes : "601-101-MQ Gr.1 H2025" et "601-102-MQ Gr.2 H2025". Il
  active le cours du groupe 1 pour travailler avec ce groupe spécifique. Toutes
  les données (présences, évaluations) seront liées à ce cours actif. Il peut
  ensuite basculer vers le groupe 2 en changeant le cours actif.

  ---
  🏷️ Type de module

  Type : SOURCE

  Ce module génère et stocke les configurations de cours dans localStorage.

  Données générées :
  - listeCours : Array des configurations de cours (SOURCE UNIQUE)

  Modules lecteurs :
  - Tous les modules de l'application (utilisent le cours actif comme contexte)
  - horaire.js (peut utiliser formatHoraire du cours actif)
  - trimestre.js (peut utiliser session/année du cours actif)
  - Modules d'affichage (affichent informations du cours actif)

  ---
  💾 Données gérées

  Structure de données principales

  1. Cours (objet complet)

  {
    id: string,                    // Format: "COURS" + timestamp
    codeCours: string,             // Ex: "601-101-MQ", "340-102-03"
    nomCours: string,              // Ex: "Écriture et littérature", "Philosophie 
  et rationalité"
    numeroCompetence: string,      // Ex: "4EF0", "4PH1"
    competence: string,            // Description compétence
    elementsCompetence: string,    // Éléments de la compétence
    prenomEnseignant: string,      // Ex: "Marie-Claude"
    nomEnseignant: string,         // Ex: "Bédard"
    departement: string,           // Ex: "Français", "Philosophie", "Sciences"
    local: string,                 // Ex: "1709", "Zoom A"
    session: string,               // "H" (Hiver) ou "A" (Automne)
    annee: string,                 // Ex: "2025", "2024"
    heuresParSemaine: string,      // Ex: "4", "3", "5"
    formatHoraire: string,         // "2x2" ou "1x4"
    verrouille: boolean,           // Protection modification/suppression
    actif: boolean,                // Un seul cours actif à la fois
    dateEnregistrement: string     // ISO format (ex: "2025-10-23T14:30:00.000Z")
  }

  2. Exemple concret de cours

  [
    {
      id: "COURS1698765432000",
      codeCours: "601-101-MQ",
      nomCours: "Écriture et littérature",
      numeroCompetence: "4EF0",
      competence: "Analyser des textes littéraires",
      elementsCompetence: "1. Reconnaître le propos du texte\n2. Repérer et 
  classer des thèmes\n3. Choisir les éléments d'analyse",
      prenomEnseignant: "Marie-Claude",
      nomEnseignant: "Tremblay",
      departement: "Français",
      local: "1709",
      session: "H",
      annee: "2025",
      heuresParSemaine: "4",
      formatHoraire: "2x2",
      verrouille: false,
      actif: true,  // ← Cours actif
      dateEnregistrement: "2025-08-15T08:00:00.000Z"
    },
    {
      id: "COURS1698765432001",
      codeCours: "601-102-MQ",
      nomCours: "Littérature et imaginaire",
      numeroCompetence: "4EF1",
      competence: "Expliquer les représentations du monde",
      elementsCompetence: "1. Reconnaître le traitement d'un thème\n2. Situer la 
  représentation du monde",
      prenomEnseignant: "Marie-Claude",
      nomEnseignant: "Tremblay",
      departement: "Français",
      local: "1710",
      session: "H",
      annee: "2025",
      heuresParSemaine: "4",
      formatHoraire: "2x2",
      verrouille: false,
      actif: false,  // ← Cours inactif
      dateEnregistrement: "2025-08-15T08:30:00.000Z"
    }
  ]

  Clés localStorage utilisées

  | Clé        | Type  | Générée par | Description                             |
  |------------|-------|-------------|-----------------------------------------|
  | listeCours | Array | cours.js    | SOURCE UNIQUE - Configurations de cours |

  Variables globales (config.js)

  let coursEnEdition = null;  // ID du cours en cours d'édition (ou null)

  ---
  🔌 API publique

  Fonctions d'initialisation

  initialiserModuleCours()

  /**
   * Initialise le module au chargement
   * Appelée automatiquement par 99-main.js
   * 
   * FONCTIONNEMENT:
   * 1. Vérifie présence DOM (#tableauCoursContainer)
   * 2. Affiche tableau des cours
   * 
   * RETOUR: void (sortie silencieuse si DOM non prêt)
   */

  Fonctions d'affichage

  afficherTableauCours()

  /**
   * Affiche tableau des cours configurés
   * 
   * FONCTIONNEMENT:
   * 1. Lit listeCours depuis localStorage
   * 2. Si vide: message "Aucun cours"
   * 3. Sinon: génère tableau HTML avec:
   *    - Code, Nom, Enseignant, Session
   *    - Radio actif
   *    - Checkbox verrouillage
   *    - Boutons: Voir, Modifier, Dupliquer, Supprimer
   * 4. Met à jour statistiques:
   *    - #nombreCours (total)
   *    - #sessionActive (session cours actif)
   *    - #resumeCours (code + nom cours actif)
   * 
   * STRUCTURE TABLEAU:
   * Code | Nom | Enseignant | Session | Actif | 🔒 | Actions
   * 
   * APPARENCE:
   * - Opacité 70% si verrouillé
   * - Boutons Modifier/Supprimer désactivés si verrouillé
   * 
   * UTILISÉ PAR:
   * - initialiserModuleCours()
   * - Après ajout/modification/suppression
   * - Après activation/verrouillage
   * 
   * RETOUR: void
   */

  voirCours(id)

  /**
   * Affiche détails cours dans alerte
   * 
   * PARAMÈTRES:
   * @param {string} id - ID du cours
   * 
   * INFORMATIONS AFFICHÉES:
   * - Code
   * - Nom
   * - Compétence
   * - Enseignant·e (prénom + nom)
   * - Session (ex: H2025)
   * - Format horaire
   * 
   * UTILISÉ PAR:
   * - Bouton «Voir»
   * 
   * RETOUR: void + alert()
   */

  Fonctions de formulaire

  afficherFormCours(id)

  /**
   * Affiche formulaire ajout/édition
   * 
   * PARAMÈTRES:
   * @param {string|null} id - ID cours à éditer (null = nouveau)
   * 
   * FONCTIONNEMENT:
   * 1. Affiche #formulaireCours
   * 2. Masque #btnAjouterCours
   * 3. Si id fourni:
   *    - Mode édition
   *    - Charge données du cours
   *    - coursEnEdition = id
   *    - Titre: "Modifier la configuration"
   *    - Bouton: "Sauvegarder"
   * 4. Sinon:
   *    - Mode création
   *    - Champs vides
   *    - coursEnEdition = null
   *    - Titre: "Nouvelle configuration de cours"
   *    - Bouton: "Ajouter"
   * 
   * CHAMPS FORMULAIRE:
   * - #codeCours
   * - #nomCours
   * - #numeroCompetence
   * - #competence
   * - #elementsCompetence
   * - #prenomEnseignant
   * - #nomEnseignant
   * - #departement
   * - #local
   * - #session (select: H/A)
   * - #annee
   * - #heuresParSemaine
   * - #formatHoraire (select: 2x2/1x4)
   * 
   * UTILISÉ PAR:
   * - Bouton «Ajouter un cours»
   * - modifierCours(id)
   * 
   * RETOUR: void
   */

  annulerFormCours()

  /**
   * Annule et ferme formulaire
   * 
   * FONCTIONNEMENT:
   * 1. Masque #formulaireCours
   * 2. Réaffiche #btnAjouterCours
   * 3. Réinitialise coursEnEdition = null
   * 
   * UTILISÉ PAR:
   * - Bouton «Annuler»
   * 
   * RETOUR: void
   */

  sauvegarderCours()

  /**
   * Sauvegarde cours (ajout ou modification)
   * 
   * FONCTIONNEMENT:
   * 1. Récupère valeurs tous les champs
   * 2. Crée objet nouveauCours
   * 3. Si coursEnEdition (modification):
   *    - Trouve index dans array
   *    - Conserve verrouille et actif
   *    - Remplace dans array
   * 4. Sinon (ajout):
   *    - Si premier cours: actif = true
   *    - Sinon: actif = false
   *    - Ajoute au array
   * 5. Sauvegarde dans localStorage
   * 6. Appelle afficherTableauCours()
   * 7. Appelle annulerFormCours()
   * 8. Notification succès
   * 
   * VALIDATION:
   * - Aucune validation stricte
   * - Tous champs optionnels
   * 
   * GESTION PREMIER COURS:
   * - Si array vide avant ajout
   * - Nouveau cours automatiquement actif
   * 
   * UTILISÉ PAR:
   * - Bouton «Ajouter» / «Sauvegarder»
   * 
   * RETOUR: void + notification
   */

  Fonctions de modification

  modifierCours(id)

  /**
   * Ouvre formulaire en mode édition
   * 
   * PARAMÈTRES:
   * @param {string} id - ID du cours
   * 
   * FONCTIONNEMENT:
   * Appelle afficherFormCours(id)
   * 
   * UTILISÉ PAR:
   * - Bouton «Modifier»
   * 
   * RETOUR: void
   */

  Fonctions de duplication

  dupliquerCours(id)

  /**
   * Duplique cours existant
   * 
   * PARAMÈTRES:
   * @param {string} id - ID du cours
   * 
   * FONCTIONNEMENT:
   * 1. Trouve cours original
   * 2. Crée copie complète (spread)
   * 3. Nouvel ID (COURS + timestamp)
   * 4. Ajoute "(copie)" au codeCours
   * 5. Nouvelle dateEnregistrement
   * 6. actif = false
   * 7. verrouille = false
   * 8. Ajoute et sauvegarde
   * 9. Rafraîchit
   * 
   * UTILISÉ PAR:
   * - Bouton «Dupliquer»
   * 
   * RETOUR: void + notification
   */

  Fonctions de verrouillage

  basculerVerrouillageCours(id)

  /**
   * Bascule état verrouillé/déverrouillé
   * 
   * PARAMÈTRES:
   * @param {string} id - ID du cours
   * 
   * FONCTIONNEMENT:
   * 1. Lit état checkbox #verrou-cours-{id}
   * 2. Met à jour cours[index].verrouille
   * 3. Sauvegarde
   * 4. Rafraîchit affichage
   * 
   * EFFET:
   * - Empêche modification/suppression si verrouillé
   * - Change opacité ligne (70%)
   * - Désactive boutons Modifier/Supprimer
   * 
   * UTILISÉ PAR:
   * - Checkbox dans tableau
   * 
   * RETOUR: void
   */

  Fonctions d'activation

  activerCours(id)

  /**
   * Active un cours comme cours principal
   * Un seul cours peut être actif à la fois
   * 
   * PARAMÈTRES:
   * @param {string} id - ID du cours à activer
   * 
   * FONCTIONNEMENT:
   * 1. Désactive TOUS les cours (actif = false)
   * 2. Active cours sélectionné (actif = true)
   * 3. Sauvegarde
   * 4. Rafraîchit affichage
   * 5. Notification succès
   * 
   * USAGE:
   * - Cours actif = contexte par défaut de l'application
   * - Utilisé comme référence par autres modules
   * - Affiché dans statistiques (#sessionActive, #resumeCours)
   * 
   * UTILISÉ PAR:
   * - Radio button dans tableau
   * 
   * RETOUR: void + notification
   */

  Fonctions de suppression

  supprimerCours(id)

  /**
   * Supprime cours avec confirmation
   * 
   * PARAMÈTRES:
   * @param {string} id - ID du cours
   * 
   * FONCTIONNEMENT:
   * 1. Trouve cours
   * 2. Vérifie pas verrouillé (alerte si oui)
   * 3. Confirmation avec code cours
   * 4. Filtre array
   * 5. Sauvegarde
   * 6. Rafraîchit
   * 
   * SÉCURITÉ:
   * - Bloqué si verrouillé
   * - Confirmation obligatoire
   * 
   * UTILISÉ PAR:
   * - Bouton «Supprimer»
   * 
   * RETOUR: void + notification
   */

  Fonctions utilitaires

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
   * - Toutes fonctions de sauvegarde/modification
   * 
   * RETOUR: void
   */

  ---
  🔗 Dépendances

  Modules requis (ordre de chargement)

  1. 01-config.js (CRITIQUE)
    - Variable globale : coursEnEdition
    - Fonction : echapperHtml(texte)

  Fonctions externes utilisées

  echapperHtml(texte)  // Protection XSS depuis config.js

  Variables globales utilisées

  coursEnEdition       // null ou ID du cours en édition

  Éléments HTML requis

  <!-- Tableau -->
  <div id="tableauCoursContainer"></div>

  <!-- Statistiques -->
  <span id="nombreCours">0</span>
  <span id="sessionActive">-</span>
  <span id="resumeCours">-</span>

  <!-- Bouton ajout -->
  <button id="btnAjouterCours" onclick="afficherFormCours()">Ajouter un
  cours</button>

  <!-- Formulaire (caché par défaut) -->
  <div id="formulaireCours" style="display: none;">
    <h4 id="titreFormCours">Nouvelle configuration de cours</h4>

    <input id="codeCours" type="text" placeholder="Ex: 601-101-MQ">
    <input id="nomCours" type="text" placeholder="Ex: Écriture et littérature">
    <input id="numeroCompetence" type="text" placeholder="Ex: 4EF0">
    <textarea id="competence" placeholder="Description compétence"></textarea>
    <textarea id="elementsCompetence" placeholder="Éléments de 
  compétence"></textarea>

    <input id="prenomEnseignant" type="text" placeholder="Prénom">
    <input id="nomEnseignant" type="text" placeholder="Nom">
    <input id="departement" type="text" placeholder="Ex: Français">
    <input id="local" type="text" placeholder="Ex: 1709">

    <select id="session">
      <option value="H">Hiver</option>
      <option value="A">Automne</option>
    </select>
    <input id="annee" type="text" placeholder="2025">

    <input id="heuresParSemaine" type="text" placeholder="4">
    <select id="formatHoraire">
      <option value="2x2">2×2h</option>
      <option value="1x4">1×4h</option>
    </select>

    <button onclick="sauvegarderCours()">
      <span id="btnTexteCours">Ajouter</span>
    </button>
    <button onclick="annulerFormCours()">Annuler</button>
  </div>

  Classes CSS requises

  .tableau               /* Tableau HTML */
  .text-muted           /* Texte grisé */
  .btn                  /* Boutons génériques */
  .btn-principal        /* Bouton principal */
  .btn-modifier         /* Bouton modifier */
  .btn-ajouter          /* Bouton ajouter/dupliquer */
  .btn-supprimer        /* Bouton supprimer */
  .btn-sm               /* Petit bouton */
  .btn-groupe           /* Groupe de boutons */
  .notification-succes  /* Notification temporaire */

  ---
  🚀 Initialisation

  Appel depuis 99-main.js

  // PRIORITÉ 2 : DONNÉES DE BASE

  // MODULE 08: Cours
  if (typeof initialiserModuleCours === 'function') {
      console.log('   → Module 08-cours détecté');
      initialiserModuleCours();
  }

  Ordre de chargement critique

  1. config.js      (coursEnEdition, echapperHtml)
  2. cours.js       (génère listeCours)
  3. horaire.js     (peut utiliser formatHoraire du cours actif)
  4. main.js        (appelle initialiserModuleCours)

  Événements gérés

  Tous attachés via attributs HTML :
  // Formulaire
  onclick="afficherFormCours()"           // Bouton Ajouter
  onclick="afficherFormCours('{id}')"     // Modifier (via modifierCours)
  onclick="sauvegarderCours()"            // Sauvegarder
  onclick="annulerFormCours()"            // Annuler

  // Tableau
  onclick="voirCours('{id}')"             // Voir
  onclick="modifierCours('{id}')"         // Modifier
  onclick="dupliquerCours('{id}')"        // Dupliquer
  onclick="supprimerCours('{id}')"        // Supprimer

  // États
  onchange="activerCours('{id}')"         // Radio actif
  onchange="basculerVerrouillageCours('{id}')"  // Checkbox verrouillage

  Aucun addEventListener requis dans main.js.

  ---
  🧪 Tests et vérification

  Test 1 : Vérifier listeCours existe

  // Console navigateur
  const cours = JSON.parse(localStorage.getItem('listeCours') || '[]');
  console.log('Nombre de cours:', cours.length);
  console.log('Premier cours:', cours[0]);
  console.log('Cours actif:', cours.find(c => c.actif));

  Test 2 : Ajouter un cours

  1. Clic "Ajouter un cours"
  2. Remplir champs (au minimum code et nom)
  3. Clic "Ajouter"
  4. Vérifier notification succès
  5. Vérifier apparition dans tableau
  6. Vérifier statistiques mises à jour

  Test 3 : Tester cours actif

  // Vérifier qu'un seul cours est actif
  const cours = JSON.parse(localStorage.getItem('listeCours') || '[]');
  const coursActifs = cours.filter(c => c.actif);
  console.log('Nombre cours actifs:', coursActifs.length);  // Doit être 1 ou 0

  // Vérifier premier cours = actif par défaut
  if (cours.length === 1) {
      console.log('Premier cours actif?', cours[0].actif);  // Doit être true
  }

  Test 4 : Changer cours actif

  1. Avoir au moins 2 cours
  2. Clic radio du 2e cours
  3. Vérifier notification "Cours activé !"
  4. Vérifier #sessionActive et #resumeCours mis à jour
  5. Console : vérifier un seul cours.actif = true

  Test 5 : Modifier un cours

  1. Clic "Modifier" sur un cours
  2. Vérifier formulaire pré-rempli
  3. Vérifier titre "Modifier la configuration"
  4. Modifier nom du cours
  5. Clic "Sauvegarder"
  6. Vérifier modification dans tableau

  Test 6 : Dupliquer un cours

  1. Clic "Dupliquer" sur un cours
  2. Vérifier notification "Cours dupliqué"
  3. Vérifier nouveau cours avec "(copie)"
  4. Vérifier copie déverrouillée (checkbox vide)
  5. Vérifier copie inactive (radio vide)

  Test 7 : Verrouiller un cours

  1. Cocher 🔒 sur un cours
  2. Vérifier opacité 70%
  3. Vérifier boutons Modifier/Supprimer désactivés
  4. Tenter modifier → bouton ne répond pas
  5. Tenter supprimer → bouton ne répond pas
  6. Décocher 🔒
  7. Vérifier boutons réactivés

  Test 8 : Supprimer un cours

  1. Avoir cours déverrouillé
  2. Clic "Supprimer"
  3. Vérifier confirmation avec code cours
  4. Annuler → rien ne change
  5. Réessayer + confirmer
  6. Vérifier disparition
  7. Vérifier statistiques mises à jour

  Test 9 : Voir détails

  1. Clic "Voir" sur un cours
  2. Vérifier alerte avec:
    - Code
    - Nom
    - Compétence
    - Enseignant
    - Session
    - Format

  Test 10 : Bloquer suppression cours verrouillé

  1. Cocher 🔒 sur un cours
  2. Clic "Supprimer"
  3. Vérifier alerte "Décochez 🔒..."
  4. Vérifier cours pas supprimé

  ---
  🐛 Problèmes connus

  Problème 1 : Plusieurs cours actifs simultanément

  Symptôme : Plus d'un radio bouton coché

  Cause : Données corrompues ou activerCours() pas appelée correctement

  Solution :
  // Corriger manuellement
  let cours = JSON.parse(localStorage.getItem('listeCours') || '[]');

  // Désactiver tous
  cours.forEach(c => c.actif = false);

  // Activer le premier
  if (cours.length > 0) {
      cours[0].actif = true;
  }

  localStorage.setItem('listeCours', JSON.stringify(cours));
  location.reload();

  Problème 2 : Modification ne sauvegarde pas

  Symptôme : Modifications perdues après "Sauvegarder"

  Cause : coursEnEdition pas défini correctement

  Solution :
  // Vérifier mode édition
  console.log('coursEnEdition:', coursEnEdition);

  // Si undefined, modifierCours() n'a pas été appelée
  // Utiliser afficherFormCours(id) au lieu de modifierCours(id)

  Problème 3 : Formulaire reste affiché après annulation

  Symptôme : #formulaireCours visible malgré annulation

  Cause : Style inline pas défini ou écrasé

  Solution :
  // Forcer masquage
  document.getElementById('formulaireCours').style.display = 'none';
  document.getElementById('btnAjouterCours').style.display = 'inline-block';
  coursEnEdition = null;

  Problème 4 : Statistiques pas mises à jour

  Symptôme : #nombreCours, #sessionActive, #resumeCours incorrects

  Cause : afficherTableauCours() pas appelée après modification

  Solution :
  // Forcer rafraîchissement
  afficherTableauCours();

  // Si erreur, vérifier éléments existent
  console.log('Éléments stats:', {
      nombre: !!document.getElementById('nombreCours'),
      session: !!document.getElementById('sessionActive'),
      resume: !!document.getElementById('resumeCours')
  });

  Problème 5 : Premier cours pas automatiquement actif

  Symptôme : Aucun cours actif malgré 1 seul cours

  Cause : Logique dans sauvegarderCours() pas exécutée

  Solution :
  // Vérifier et corriger
  const cours = JSON.parse(localStorage.getItem('listeCours') || '[]');

  if (cours.length === 1 && !cours[0].actif) {
      cours[0].actif = true;
      localStorage.setItem('listeCours', JSON.stringify(cours));
      afficherTableauCours();
  }

  Problème 6 : Duplication crée ID identique

  Symptôme : Cours dupliqué a même ID que l'original

  Cause : Date.now() appelé trop rapidement (même milliseconde)

  Solution :
  // Modifier ligne 498 dans dupliquerCours()
  id: 'COURS' + Date.now() + Math.random().toString(36).substr(2, 9),

  // Garantit unicité même si appelé rapidement

  ---
  📐 Règles de modification

  ⚠️ ZONES PROTÉGÉES

  1. Noms de fonctions : Listés dans noms_stables.json
  2. IDs HTML : Ne pas renommer les id des éléments
  3. Clé localStorage : listeCours (fixe)
  4. Structure cours : Champs de l'objet (modules dépendants)
  5. Variable globale : coursEnEdition

  ✅ Modifications autorisées

  1. Commentaires : Ajout/modification sans limite
  2. Styles inline : Variables CSS et styles visuels
  3. Messages utilisateur : Textes alertes/notifications
  4. Durée notification : setTimeout (actuellement 3000ms)
  5. Champs formulaire : Ajout de nouveaux champs optionnels
  6. Validation : Ajout de règles de validation

  Structure listeCours (CRITIQUE)

  NE PAS MODIFIER la structure sans vérifier tous les modules lecteurs.

  Si ajout d'un champ :
  1. ✅ Ajouter au formulaire
  2. ✅ Ajouter dans sauvegarderCours()
  3. ✅ Optionnel : afficher dans tableau
  4. ✅ Documenter le changement

  Si suppression d'un champ :
  1. ⚠️ Vérifier qu'aucun module ne l'utilise
  2. ⚠️ Tester exhaustivement
  3. ⚠️ Migration données si existantes

  Workflow modification

  1. ✅ Lire CLAUDE.md (règles globales)
  2. ✅ Vérifier noms_stables.json
  3. ✅ Sauvegarder (commit Git)
  4. ✅ Modifier uniquement zones autorisées
  5. ✅ Tester immédiatement
  6. ✅ Rollback si erreur

  ---
  📜 Historique

  | Date       | Version  | Changements                      |
  |------------|----------|----------------------------------|
  | 10-10-2025 | Index 50 | Modularisation initiale          |
  |            |          | - Création module autonome       |
  |            |          | - Ajout/modification/suppression |
  |            |          | - Système cours actif (radio)    |
  |            |          | - Verrouillage protection        |
  |            |          | - Duplication                    |
  |            |          | - Vue détaillée                  |
  |            |          | - Statistiques automatiques      |
  |            |          | - Notifications temporaires      |

  ---
  📞 Support et ressources

  Documentation projet : README_PROJET.mdArchitecture :
  structure-modulaire.txtGuide pédagogique : Labo Codex
  (https://codexnumeris.org/apropos)

  Debug console :
  // Vérifier cours
  const cours = JSON.parse(localStorage.getItem('listeCours') || '[]');
  console.log('Total cours:', cours.length);
  console.log('Cours actif:', cours.find(c => c.actif));
  console.log('Premier cours:', cours[0]);

  // Vérifier mode édition
  console.log('En édition?', coursEnEdition);

  // Vérifier fonctions disponibles
  console.log('API disponible?', {
      init: typeof initialiserModuleCours,
      afficher: typeof afficherTableauCours,
      sauvegarder: typeof sauvegarderCours,
      activer: typeof activerCours
  });

  // Corriger cours actif
  const coursActifs = cours.filter(c => c.actif);
  if (coursActifs.length !== 1) {
      console.warn('⚠️ Problème cours actif:', coursActifs.length);
      // Corriger...
  }

  ---
  ⚠️ RAPPEL CRITIQUE : Ce module gère les configurations de cours. Le concept de
  cours actif est utilisé comme contexte par défaut dans toute l'application.
  Assurez-vous qu'un seul cours est actif à la fois. Testez exhaustivement avant
  mise en production.