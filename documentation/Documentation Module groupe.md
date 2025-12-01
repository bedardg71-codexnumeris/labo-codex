Documentation technique : groupe.js

  📋 Vue d'ensemble

  Nom du module : 11-groupe.js (Gestion du groupe d'étudiants)Version : Index 50
  (10-10-2025a - Modularisation)Lignes de code : 911 lignesResponsable : Grégoire
  Bédard

  Description :Module de gestion complète de la liste des étudiants inscrits au
  cours. Permet l'ajout manuel, l'import massif via CSV/TSV, la modification, la
  suppression, le filtrage par groupe, l'export et la réinitialisation. Gère
  également les statistiques par groupe et les prévisualisations d'import.

  Exemple concret :Un enseignant peut importer une liste de 45 étudiants répartis
  en 3 groupes depuis Omnivox (format TSV), prévisualiser les données, confirmer
  l'import, puis filtrer par groupe pour afficher uniquement le groupe 1 (15
  étudiants). Il peut ensuite modifier un étudiant ayant changé de programme ou
  supprimer un abandon.

  ---
  🏷️ Type de module

  Type : SOURCE

  Ce module génère et stocke la liste des étudiants dans localStorage.

  Données générées :
  - groupeEtudiants : Array des étudiants inscrits (SOURCE UNIQUE)

  Modules lecteurs :
  - etudiants.js (affiche liste étudiants avec assiduité/complétion)
  - saisie-presences.js (liste étudiants pour saisie présences)
  - tableau-bord-apercu.js (statistiques et risques)
  - profil-etudiant.js (affiche profil individuel)
  - Tous modules utilisant la liste des étudiants

  ---
  💾 Données gérées

  Structure de données principales

  1. Étudiant (objet complet)

  {
    id: number,              // Timestamp unique (Date.now())
    da: string,              // Numéro de Dossier d'Aide (ex: "1234567" ou 
  "AUTO-1698765432")
    groupe: string,          // Numéro de groupe (ex: "1", "2", "A", "B")
    nom: string,             // Nom de famille
    prenom: string,          // Prénom
    programme: string,       // Code programme (ex: "300.A0", "420.B0") ou "---"
    sa: string,              // Services adaptés ("Oui" ou "")
    caf: string              // Centre d'Aide en Français ("Oui" ou "")
  }

  2. Exemple concret d'étudiants

  [
    {
      id: 1698765432000,
      da: "1234567",
      groupe: "1",
      nom: "Tremblay",
      prenom: "Alexis",
      programme: "300.A0",
      sa: "Oui",
      caf: ""
    },
    {
      id: 1698765432001,
      da: "7654321",
      groupe: "1",
      nom: "Gagnon",
      prenom: "Camille",
      programme: "510.A0",
      sa: "",
      caf: "Oui"
    },
    {
      id: 1698765432002,
      da: "AUTO-1698765432002",  // DA auto-généré si absent
      groupe: "2",
      nom: "Roy",
      prenom: "Émilie",
      programme: "---",
      sa: "",
      caf: ""
    }
  ]

  Clés localStorage utilisées

  | Clé              | Type    | Générée par | Description
            |
  |------------------|---------|-------------|------------------------------------
  ----------|
  | groupeEtudiants  | Array   | groupe.js   | SOURCE UNIQUE - Liste complète des
  étudiants |
  | groupeVerrouille | Boolean | (externe)   | État verrouillage du groupe
  (lecture)        |

  Variable temporaire

  let tempImportData = [];  // Stockage temporaire avant confirmation import

  Format CSV/TSV pour import

  Structure attendue (7 colonnes) :
  DA, Groupe, Nom, Prénom, Programme, SA, CAF

  Exemple CSV :
  1234567,1,Tremblay,Alexis,300.A0,Oui,
  7654321,1,Gagnon,Camille,510.A0,,Oui
  9876543,2,Roy,Émilie,420.B0,,

  Exemple TSV (format Omnivox) :
  1234567	1	Tremblay	Alexis	300.A0	Oui
  7654321	1	Gagnon	Camille	510.A0		Oui
  9876543	2	Roy	Émilie	420.B0

  Détection automatique : Le séparateur (, ou \t) est détecté automatiquement.

  ---
  🔌 API publique

  Fonctions d'initialisation

  initialiserModuleGroupe()

  /**
   * Initialise le module au chargement
   * Appelée automatiquement par 99-main.js
   * 
   * FONCTIONNEMENT:
   * 1. Vérifie présence DOM (#students-tbody)
   * 2. Affiche liste étudiants
   * 3. Remplit select filtre groupes
   * 
   * RETOUR: void (sortie silencieuse si DOM non prêt)
   */

  Fonctions d'ajout

  addStudent()

  /**
   * Ajoute ou modifie étudiant via formulaire
   * 
   * FONCTIONNEMENT:
   * 1. Vérifie mode modification (sessionStorage.etudiantEnModification)
   * 2. Récupère valeurs champs formulaire
   * 3. Validation (nom et prénom obligatoires)
   * 4. Création objet étudiant
   * 5. Vérification doublons DA
   * 6. Si modification: supprime ancien + ajoute nouveau
   * 7. Sinon: ajout simple
   * 8. Sauvegarde dans localStorage
   * 9. Affiche prévisualisation
   * 10. Réinitialise formulaire
   * 11. Nettoie mode modification
   * 
   * CHAMPS FORMULAIRE:
   * - #etudiantDA : Optionnel (auto-généré si vide)
   * - #etudiantGroupe : Optionnel (défaut "1")
   * - #etudiantNom : OBLIGATOIRE
   * - #etudiantPrenom : OBLIGATOIRE
   * - #etudiantProgramme : Optionnel (défaut "---")
   * - #etudiantSA : Optionnel
   * - #etudiantCAF : Optionnel
   * 
   * VALIDATION DOUBLONS:
   * - Si DA existe déjà: confirmation utilisateur
   * - Ignore DA commençant par "AUTO-"
   * - En modification: ignore si même DA
   * 
   * RETOUR: void + notification succès
   */

  Fonctions d'import

  handleFileImport(event)

  /**
   * Gère import depuis fichier
   * 
   * PARAMÈTRES:
   * @param {Event} event - Événement change du input file
   * 
   * FONCTIONNEMENT:
   * 1. Récupère fichier depuis event.target.files[0]
   * 2. Lit contenu avec FileReader
   * 3. Appelle parseAndPreview(content)
   * 
   * UTILISÉ PAR:
   * - Input file #fichierCsvEntree (onchange)
   * 
   * RETOUR: void
   */

  previewPastedData()

  /**
   * Gère import par copier-coller
   * 
   * FONCTIONNEMENT:
   * 1. Récupère contenu #donneesCollees
   * 2. Validation (non vide)
   * 3. Appelle parseAndPreview(content)
   * 
   * UTILISÉ PAR:
   * - Bouton «Prévisualiser» après copier-coller
   * 
   * RETOUR: void
   */

  parseAndPreview(content)

  /**
   * Parse contenu et affiche prévisualisation
   * 
   * PARAMÈTRES:
   * @param {string} content - Contenu CSV/TSV
   * 
   * FONCTIONNEMENT:
   * 1. Split par lignes (\n)
   * 2. Pour chaque ligne:
   *    - Détection séparateur (,  ou \t)
   *    - Split par séparateur
   *    - Validation (minimum 4 colonnes)
   *    - Création objet étudiant
   *    - Validation (nom et prénom non vides)
   * 3. Stocke dans tempImportData[]
   * 4. Appelle afficherPrevisualisation()
   * 
   * FORMAT ATTENDU:
   * DA, Groupe, Nom, Prénom, Programme, SA, CAF
   * 
   * DÉTECTION SÉPARATEUR:
   * - Si ligne contient \t → TSV
   * - Sinon → CSV
   * 
   * VALIDATION:
   * - Minimum 4 colonnes (DA, Groupe, Nom, Prénom)
   * - Nom et prénom obligatoires
   * - Autres champs optionnels
   * 
   * RETOUR: void + alerte si 0 donnée valide
   */

  afficherPrevisualisation(data, titre)

  /**
   * Affiche prévisualisation avant import
   * 
   * PARAMÈTRES:
   * @param {Array} data - Étudiants à prévisualiser
   * @param {string} titre - Titre de la prévisualisation
   * 
   * FONCTIONNEMENT:
   * 1. Génère tableau HTML
   * 2. Affiche tous les champs
   * 3. Alternance couleurs lignes (zebra striping)
   * 4. Affiche zone #previewZone
   * 
   * AFFICHAGE:
   * - DA, Groupe, Nom, Prénom, Programme
   * - SA: ✓ si "Oui"
   * - CAF: ✓ si "Oui"
   * 
   * RETOUR: void
   */

  confirmImport()

  /**
   * Confirme et effectue l'import
   * 
   * FONCTIONNEMENT:
   * 1. Validation tempImportData non vide
   * 2. Récupère étudiants existants
   * 3. Détection doublons DA
   * 4. Confirmation si doublons
   * 5. Concaténation arrays
   * 6. Sauvegarde dans localStorage
   * 7. Notification avec détails
   * 8. Nettoyage (tempImportData, formulaire)
   * 9. Rafraîchissement affichage
   * 
   * DÉTECTION DOUBLONS:
   * - Compare DA nouveaux vs existants
   * - Ignore DA "AUTO-*"
   * - Demande confirmation si doublons
   * 
   * RETOUR: void + notification (ancien → nouveau total)
   */

  cancelImport()

  /**
   * Annule import en cours
   * 
   * FONCTIONNEMENT:
   * 1. Vide tempImportData[]
   * 2. Masque #previewZone
   * 3. Vide textarea #donneesCollees
   * 4. Réinitialise input file #fichierCsvEntree
   * 
   * RETOUR: void
   */

  Fonctions d'affichage

  afficherListeEtudiants()

  /**
   * Affiche liste complète (orchestre les autres fonctions)
   * 
   * FONCTIONNEMENT:
   * 1. Appelle mettreAJourStatistiquesGroupes()
   * 2. Appelle remplirSelectFiltreGroupe()
   * 3. Appelle filtrerParGroupe()
   * 
   * UTILISÉ PAR:
   * - initialiserModuleGroupe()
   * - Après ajout/modification/suppression
   * - Après import
   * 
   * RETOUR: void
   */

  mettreAJourStatistiquesGroupes()

  /**
   * Met à jour statistiques groupes
   * 
   * FONCTIONNEMENT:
   * 1. Compte total étudiants
   * 2. Regroupe par numéro de groupe
   * 3. Trie groupes (numériques puis alphabétiques)
   * 4. Compte nombre de groupes
   * 5. Affiche détail par groupe
   * 
   * ÉLÉMENTS MODIFIÉS:
   * - #nbEtudiantsTotal : Total étudiants
   * - #nbGroupes : Nombre de groupes
   * - #detailGroupes : Détail (Groupe X : Y étudiant·es)
   * 
   * TRI GROUPES:
   * - Si numériques: tri numérique (1, 2, 3...)
   * - Sinon: tri alphabétique (A, B, C...)
   * 
   * RETOUR: void
   */

  remplirSelectFiltreGroupe()

  /**
   * Remplit select de filtrage par groupe
   * 
   * FONCTIONNEMENT:
   * 1. Extrait groupes uniques
   * 2. Trie (numérique puis alphabétique)
   * 3. Génère options HTML
   * 4. Affiche compteur par groupe
   * 5. Remplit #filtreGroupe
   * 
   * FORMAT OPTIONS:
   * <option value="1">Groupe 1 (15 étudiant·es)</option>
   * <option value="2">Groupe 2 (18 étudiant·es)</option>
   * 
   * OPTION PAR DÉFAUT:
   * "Tous les groupes" (value="")
   * 
   * RETOUR: void
   */

  filtrerParGroupe()

  /**
   * Filtre affichage selon groupe sélectionné
   * 
   * FONCTIONNEMENT:
   * 1. Récupère groupe sélectionné (#filtreGroupe)
   * 2. Filtre étudiants
   * 3. Affiche compteur filtre
   * 4. Si 0 résultat: affiche message
   * 5. Sinon: génère tableau HTML
   * 6. Attache event listeners boutons
   * 
   * AFFICHAGE TABLEAU:
   * - DA, Groupe, Nom, Prénom, Programme
   * - SA: ✓ si "Oui"
   * - CAF: ✓ si "Oui"
   * - Boutons: Modifier (✏️), Supprimer (🗑️)
   * 
   * COMPTEUR:
   * - Si filtre actif: "(15 sur 45)"
   * - Sinon: vide
   * 
   * MESSAGES VIDES:
   * - Si filtre actif: "Aucun·e étudiant·e dans le groupe X"
   * - Sinon: "Aucun·e étudiant·e dans le groupe"
   * 
   * RETOUR: void
   */

  resetFiltreGroupe()

  /**
   * Réinitialise filtre à "Tous les groupes"
   * 
   * FONCTIONNEMENT:
   * 1. Réinitialise #filtreGroupe.value = ""
   * 2. Appelle filtrerParGroupe()
   * 
   * UTILISÉ PAR:
   * - Bouton "Voir tous les groupes" dans message vide
   * 
   * RETOUR: void
   */

  Fonctions de modification

  modifierEtudiant(da)

  /**
   * Ouvre formulaire en mode édition
   * 
   * PARAMÈTRES:
   * @param {string} da - DA de l'étudiant à modifier
   * 
   * FONCTIONNEMENT:
   * 1. Vérifie pas verrouillé (groupeVerrouille)
   * 2. Trouve étudiant par DA
   * 3. Stocke DA en sessionStorage.etudiantEnModification
   * 4. Pré-remplit tous les champs
   * 5. Ouvre <details> formulaire
   * 6. Scroll vers formulaire
   * 7. Change bouton "Ajouter" → "Mettre à jour"
   * 8. Change couleur bouton (orange)
   * 
   * UTILISÉ PAR:
   * - Bouton ✏️ dans tableau
   * - Event delegation via attacherEventListenersEtudiants()
   * 
   * SÉCURITÉ:
   * - Bloqué si groupeVerrouille === true
   * 
   * RETOUR: void + notification
   */

  Fonctions de suppression

  supprimerEtudiant(id)

  /**
   * Supprime étudiant avec confirmation
   * 
   * PARAMÈTRES:
   * @param {string} id - DA ou ID de l'étudiant
   * 
   * FONCTIONNEMENT:
   * 1. Vérifie pas verrouillé
   * 2. Trouve étudiant (par ID ou DA)
   * 3. Confirmation avec nom complet
   * 4. Filtre array
   * 5. Sauvegarde
   * 6. Rafraîchit affichage
   * 
   * UTILISÉ PAR:
   * - Bouton 🗑️ dans tableau
   * - deleteStudent() (alias)
   * 
   * SÉCURITÉ:
   * - Bloqué si groupeVerrouille === true
   * - Confirmation obligatoire
   * 
   * RETOUR: void + log console
   */

  deleteStudent(id)

  /**
   * Alias pour compatibilité
   * 
   * PARAMÈTRES:
   * @param {string} id - DA ou ID
   * 
   * RETOUR: Appelle supprimerEtudiant(id)
   */

  Fonctions d'export

  exportStudentsData()

  /**
   * Exporte groupe en CSV
   * 
   * FONCTIONNEMENT:
   * 1. Récupère étudiants
   * 2. Validation non vide
   * 3. Génère contenu CSV
   * 4. Crée Blob
   * 5. Télécharge fichier
   * 
   * FORMAT CSV:
   * DA,Groupe,Nom,Prénom,Programme,SA,CAF
   * 1234567,1,Tremblay,Alexis,300.A0,Oui,
   * ...
   * 
   * NOM FICHIER:
   * groupe_etudiants_{timestamp}.csv
   * 
   * UTILISÉ PAR:
   * - Bouton "Exporter en CSV"
   * 
   * RETOUR: void + notification + téléchargement
   */

  Fonctions de réinitialisation

  resetStudentsData()

  /**
   * Réinitialise TOUTES les données
   * 
   * FONCTIONNEMENT:
   * 1. Double confirmation
   * 2. Supprime localStorage.groupeEtudiants
   * 3. Force MAJ statistiques
   * 4. Force MAJ filtre
   * 5. Affiche message vide
   * 
   * SÉCURITÉ:
   * - 1re confirmation: Avertissement action irréversible
   * - 2e confirmation: Dernière chance
   * 
   * UTILISÉ PAR:
   * - Bouton "Réinitialiser tout le groupe"
   * 
   * RETOUR: void + notification
   */

  Fonctions utilitaires

  attacherEventListenersEtudiants()

  /**
   * Attache event listeners aux boutons d'action
   * 
   * FONCTIONNEMENT:
   * 1. Délégation d'événements sur #students-tbody
   * 2. Détection click sur boutons [data-action]
   * 3. Récupère action et DA
   * 4. Appelle fonction correspondante
   * 
   * ACTIONS SUPPORTÉES:
   * - data-action="modifier" → modifierEtudiant(da)
   * - data-action="supprimer" → supprimerEtudiant(da)
   * 
   * AVANTAGE DÉLÉGATION:
   * - Un seul listener pour tous les boutons
   * - Fonctionne même si tableau regénéré
   * 
   * RETOUR: void
   */

  afficherNotificationSucces(titre, details)

  /**
   * Affiche notification temporaire succès
   * 
   * PARAMÈTRES:
   * @param {string} titre - Titre de la notification
   * @param {string} details - Détails optionnels
   * 
   * FONCTIONNEMENT:
   * 1. Crée div.notification-succes
   * 2. Injecte HTML (titre + détails)
   * 3. Append au body
   * 4. Animation sortie après 4s
   * 5. Suppression après animation
   * 
   * STYLE:
   * - Position: fixed top-right
   * - Fond: vert succès
   * - Animation: slideIn + fadeOut
   * 
   * RETOUR: void
   */

  afficherNotificationErreur(titre, details)

  /**
   * Affiche notification temporaire erreur
   * 
   * PARAMÈTRES:
   * @param {string} titre - Titre de l'erreur
   * @param {string} details - Détails optionnels
   * 
   * FONCTIONNEMENT:
   * Identique à afficherNotificationSucces()
   * mais avec fond rouge (#dc3545) et durée 5s
   * 
   * RETOUR: void
   */

  ---
  🔗 Dépendances

  Modules requis (ordre de chargement)

  1. 01-config.js (CRITIQUE)
    - Fonction : echapperHtml(texte)
  2. 17-modes.js (optionnel)
    - Fonctions : obtenirDonneesSelonMode(), sauvegarderDonneesSelonMode()
    - Pour : Mode anonymisation (si implémenté)

  Fonctions externes utilisées

  echapperHtml(texte)                    // Protection XSS depuis config.js
  obtenirDonneesSelonMode(cle)           // Lecture selon mode (config/modes)
  sauvegarderDonneesSelonMode(cle, data) // Sauvegarde selon mode (config/modes)

  Éléments HTML requis

  <!-- Formulaire ajout manuel -->
  <input id="etudiantDA">
  <input id="etudiantGroupe">
  <input id="etudiantNom">              <!-- OBLIGATOIRE -->
  <input id="etudiantPrenom">           <!-- OBLIGATOIRE -->
  <input id="etudiantProgramme">
  <select id="etudiantSA">
  <select id="etudiantCAF">

  <!-- Import fichier -->
  <input type="file" id="fichierCsvEntree" onchange="handleFileImport(event)">

  <!-- Import copier-coller -->
  <textarea id="donneesCollees"></textarea>
  <button onclick="previewPastedData()">Prévisualiser</button>

  <!-- Prévisualisation -->
  <div id="previewZone" style="display: none;">
    <div id="previewTable"></div>
    <button onclick="confirmImport()">Confirmer import</button>
    <button onclick="cancelImport()">Annuler</button>
  </div>

  <!-- Liste étudiants -->
  <div id="students-list-container">
    <table>
      <tbody id="students-tbody"></tbody>
    </table>
  </div>
  <div id="no-students-msg" style="display: none;"></div>

  <!-- Filtrage -->
  <select id="filtreGroupe" onchange="filtrerParGroupe()">
    <option value="">Tous les groupes</option>
  </select>
  <span id="compteurFiltres"></span>

  <!-- Statistiques -->
  <span id="nbEtudiantsTotal">0</span>
  <span id="nbGroupes">0</span>
  <div id="detailGroupes"></div>

  Classes CSS requises

  .notification-succes       /* Notification temporaire */
  .notification-details      /* Détails notification */
  .btn                       /* Boutons génériques */
  .btn-modifier              /* Bouton modifier */
  .btn-supprimer             /* Bouton supprimer */
  .btn-secondaire            /* Bouton secondaire */

  ---
  🚀 Initialisation

  Appel depuis 99-main.js

  // PRIORITÉ 2 : DONNÉES DE BASE

  // MODULE 11: Gestion du groupe
  if (typeof initialiserModuleGroupe === 'function') {
      console.log('   → Module 11-groupe détecté');
      initialiserModuleGroupe();
  }

  Ordre de chargement critique

  1. config.js        (echapperHtml)
  2. modes.js         (optionnel - obtenirDonneesSelonMode)
  3. groupe.js        (génère groupeEtudiants)
  4. etudiants.js     (lit groupeEtudiants)
  5. main.js          (appelle initialiserModuleGroupe)

  Événements gérés

  Attachés via attributs HTML :
  // Formulaire
  onclick="addStudent()"          // Ajouter/Modifier

  // Import
  onchange="handleFileImport(event)"  // Input file
  onclick="previewPastedData()"      // Prévisualiser
  onclick="confirmImport()"          // Confirmer
  onclick="cancelImport()"           // Annuler

  // Filtrage
  onchange="filtrerParGroupe()"      // Select groupe
  onclick="resetFiltreGroupe()"      // Réinitialiser filtre

  // Export/Réinitialisation
  onclick="exportStudentsData()"     // Exporter CSV
  onclick="resetStudentsData()"      // Réinitialiser tout

  Attachés dynamiquement :
  // Délégation sur tbody (via attacherEventListenersEtudiants)
  click sur button[data-action="modifier"]  → modifierEtudiant(da)
  click sur button[data-action="supprimer"] → supprimerEtudiant(da)

  Export global des fonctions

  window.supprimerEtudiant = supprimerEtudiant;
  window.modifierEtudiant = modifierEtudiant;
  window.ajouterEtudiant = ajouterEtudiant;
  window.afficherListeEtudiants = afficherListeEtudiants;
  window.basculerVerrouillageGroupe = basculerVerrouillageGroupe;
  window.resetStudentsData = resetStudentsData;
  window.exportStudentsData = exportStudentsData;
  window.deleteStudent = deleteStudent;

  ---
  🧪 Tests et vérification

  Test 1 : Vérifier groupeEtudiants existe

  // Console navigateur
  const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
  console.log('Nombre d\'étudiants:', etudiants.length);
  console.log('Exemple étudiant:', etudiants[0]);

  Test 2 : Tester ajout manuel

  1. Remplir formulaire (nom et prénom obligatoires)
  2. Clic "Ajouter"
  3. Vérifier notification succès
  4. Vérifier prévisualisation
  5. Vérifier apparition dans liste

  Test 3 : Tester import CSV

  Fichier test.csv :
  1111111,1,Test,Alice,300.A0,Oui,
  2222222,1,Test,Bob,510.A0,,Oui
  3333333,2,Test,Charlie,420.B0,,

  1. Sélectionner fichier
  2. Vérifier prévisualisation (3 étudiants)
  3. Clic "Confirmer import"
  4. Vérifier notification (+ 3 étudiants)
  5. Vérifier tableau

  Test 4 : Tester import copier-coller TSV

  Copier depuis Omnivox :
  1111111	1	Test	Alice	300.A0	Oui
  2222222	1	Test	Bob	510.A0		Oui
  3333333	2	Test	Charlie	420.B0

  1. Coller dans textarea
  2. Clic "Prévisualiser"
  3. Vérifier détection TSV
  4. Confirmer

  Test 5 : Tester filtrage par groupe

  // Vérifier statistiques
  const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
  const groupes = {};
  etudiants.forEach(e => {
      groupes[e.groupe] = (groupes[e.groupe] || 0) + 1;
  });
  console.log('Répartition:', groupes);

  1. Sélectionner "Groupe 1"
  2. Vérifier compteur "(X sur Y)"
  3. Vérifier tableau filtré
  4. Clic "Voir tous les groupes"
  5. Vérifier tous affichés

  Test 6 : Tester modification

  1. Clic ✏️ sur un étudiant
  2. Vérifier formulaire pré-rempli
  3. Vérifier bouton "Mettre à jour" (orange)
  4. Modifier programme
  5. Clic "Mettre à jour"
  6. Vérifier modification dans tableau

  Test 7 : Tester suppression

  1. Clic 🗑️ sur un étudiant
  2. Vérifier confirmation avec nom
  3. Confirmer
  4. Vérifier disparition
  5. Vérifier statistiques mises à jour

  Test 8 : Tester doublons DA

  1. Ajouter étudiant avec DA "9999999"
  2. Ajouter autre étudiant avec même DA "9999999"
  3. Vérifier confirmation demandée
  4. Annuler → pas ajouté
  5. Réessayer + confirmer → ajouté

  Test 9 : Tester export CSV

  1. Clic "Exporter en CSV"
  2. Vérifier téléchargement fichier
  3. Ouvrir fichier
  4. Vérifier format et données

  Test 10 : Tester réinitialisation

  1. Clic "Réinitialiser tout"
  2. Vérifier 1re confirmation
  3. Annuler → rien changé
  4. Réessayer + confirmer 1re
  5. Vérifier 2e confirmation
  6. Confirmer → tout supprimé
  7. Vérifier message vide
  8. Vérifier statistiques à 0

  ---
  🐛 Problèmes connus

  Problème 1 : Modification ne fonctionne pas

  Symptôme : Clic "Mettre à jour" crée un nouvel étudiant au lieu de modifier

  Cause : sessionStorage.etudiantEnModification pas défini ou perdu

  Solution :
  // Vérifier mode modification
  console.log('Mode modification?',
  sessionStorage.getItem('etudiantEnModification'));

  // Si undefined, le mode modification n'a pas été activé correctement
  // Vérifier que modifierEtudiant() a été appelée

  Problème 2 : Import échoue avec "Aucune donnée valide"

  Symptôme : Prévisualisation affiche 0 étudiant

  Causes possibles :
  1. Format incorrect (moins de 4 colonnes)
  2. Nom ou prénom vides
  3. Séparateur non détecté

  Solution :
  // Tester manuellement le parsing
  const ligne = "1234567,1,Tremblay,Alexis,300.A0,,";
  const separator = ligne.includes('\t') ? '\t' : ',';
  const parts = ligne.split(separator);
  console.log('Séparateur:', separator);
  console.log('Colonnes:', parts.length);
  console.log('Parties:', parts);

  // Format minimum requis: DA, Groupe, Nom, Prénom
  // Vérifier que parts[2] et parts[3] ne sont pas vides

  Problème 3 : Boutons Modifier/Supprimer ne répondent pas

  Symptôme : Clic sur ✏️ ou 🗑️ sans effet

  Cause : Event listeners pas attachés

  Solution :
  // Vérifier si attacherEventListenersEtudiants() est appelée
  // Elle devrait être appelée après filtrerParGroupe()

  // Solution de contournement : recharger manuellement
  attacherEventListenersEtudiants();

  // Vérifier délégation d'événements
  const tbody = document.getElementById('students-tbody');
  console.log('Tbody trouvé?', !!tbody);

  Problème 4 : Statistiques groupes incorrectes

  Symptôme : Compteur total incorrect ou détail groupes vide

  Cause : Données corrompues ou format groupe inconsistant

  Solution :
  // Vérifier données
  const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
  console.log('Total étudiants:', etudiants.length);

  // Vérifier format groupes
  const groupesUniques = new Set(etudiants.map(e => e.groupe));
  console.log('Groupes uniques:', Array.from(groupesUniques));

  // Si problème, forcer MAJ
  mettreAJourStatistiquesGroupes();

  Problème 5 : Verrouillage empêche toute modification

  Symptôme : Alert "Décochez 🔒" malgré absence de checkbox

  Cause : groupeVerrouille = true dans localStorage

  Solution :
  // Vérifier état
  console.log('Verrouillé?', localStorage.getItem('groupeVerrouille'));

  // Déverrouiller manuellement
  localStorage.setItem('groupeVerrouille', 'false');

  // Recharger page
  location.reload();

  Problème 6 : Export CSV avec caractères mal encodés

  Symptôme : Accents cassés dans fichier CSV

  Cause : Encodage UTF-8 non respecté

  Solution :
  // Modifier ligne 745 dans exportStudentsData()
  // Ajouter BOM UTF-8
  const bom = '\uFEFF';
  let csv = bom + 'DA,Groupe,Nom,Prénom,Programme,SA,CAF\n';
  // ... reste du code

  ---
  📐 Règles de modification

  ⚠️ ZONES PROTÉGÉES

  1. Noms de fonctions : Listés dans noms_stables.json
  2. IDs HTML : Ne pas renommer les id des éléments
  3. Clé localStorage : groupeEtudiants (fixe - modules dépendants)
  4. Structure étudiant : Champs id, da, groupe, nom, prenom, programme, sa, caf
  5. Format CSV/TSV : Ordre colonnes (DA, Groupe, Nom, Prénom, Programme, SA, CAF)

  ✅ Modifications autorisées

  1. Commentaires : Ajout/modification sans limite
  2. Styles inline : Variables CSS et styles visuels
  3. Messages utilisateur : Textes notifications/alertes
  4. Durée notifications : setTimeout (actuellement 4000ms/5000ms)
  5. Format affichage : Structure tableau HTML
  6. Validation formulaire : Règles de validation

  Structure groupeEtudiants (CRITIQUE)

  NE PAS MODIFIER la structure de l'objet étudiant car elle est lue par :
  - etudiants.js
  - saisie-presences.js
  - tableau-bord-apercu.js
  - profil-etudiant.js
  - Tous modules utilisant la liste

  Si modification nécessaire :
  1. Mettre à jour TOUS les modules lecteurs
  2. Documenter la migration
  3. Créer script de conversion si données existantes
  4. Tester exhaustivement

  Workflow modification

  1. ✅ Lire CLAUDE.md (règles globales)
  2. ✅ Vérifier noms_stables.json
  3. ✅ Sauvegarder (commit Git)
  4. ✅ Modifier uniquement zones autorisées
  5. ✅ Tester immédiatement
  6. ✅ Si modification structure : AVERTIR et tester TOUS modules lecteurs
  7. ✅ Rollback si erreur

  ---
  📜 Historique

  | Date       | Version  | Changements                            |
  |------------|----------|----------------------------------------|
  | 10-10-2025 | Index 50 | Modularisation initiale                |
  |            |          | - Création module autonome             |
  |            |          | - Ajout manuel avec validation         |
  |            |          | - Import CSV/TSV avec détection auto   |
  |            |          | - Prévisualisation avant import        |
  |            |          | - Modification via formulaire          |
  |            |          | - Suppression avec confirmation        |
  |            |          | - Filtrage par groupe                  |
  |            |          | - Statistiques par groupe              |
  |            |          | - Export CSV                           |
  |            |          | - Réinitialisation double confirmation |
  |            |          | - Délégation événements                |
  |            |          | - Notifications temporaires            |

  ---
  📞 Support et ressources

  Documentation projet : README_PROJET.mdArchitecture :
  structure-modulaire.txtGuide pédagogique : Labo Codex
  (https://codexnumeris.org/apropos)

  Debug console :
  // Vérifier étudiants
  const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
  console.log('Total:', etudiants.length);
  console.log('Groupes:', new Set(etudiants.map(e => e.groupe)));
  console.log('Premier:', etudiants[0]);

  // Vérifier mode modification
  console.log('En modification?',
  sessionStorage.getItem('etudiantEnModification'));

  // Vérifier verrouillage
  console.log('Verrouillé?', localStorage.getItem('groupeVerrouille'));

  // Vérifier fonctions disponibles
  console.log('API disponible?', {
      init: typeof initialiserModuleGroupe,
      add: typeof addStudent,
      import: typeof confirmImport,
      export: typeof exportStudentsData
  });

  // Statistiques groupes
  const stats = {};
  etudiants.forEach(e => stats[e.groupe] = (stats[e.groupe] || 0) + 1);
  console.log('Statistiques:', stats);

  ---
  ⚠️ RAPPEL CRITIQUE : Ce module est une SOURCE de données. groupeEtudiants est la
   source unique de vérité pour la liste des étudiants. Toute modification de sa
  structure impactera TOUS les modules lecteurs (etudiants.js,
  saisie-presences.js, tableau-bord-apercu.js, profil-etudiant.js, etc.). Testez
  exhaustivement avant mise en production.