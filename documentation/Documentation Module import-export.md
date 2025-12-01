Documentation technique : import-export.js

  📋 Vue d'ensemble

  Nom du module : import-export.js (Import/Export de données)Version : Adapté de
  index 35-M5Lignes de code : 237 lignesResponsable : Grégoire Bédard

  Description :Module utilitaire de gestion de l'import et l'export des données
  stockées dans localStorage. Permet d'exporter sélectivement des clés vers un
  fichier JSON, d'importer des données avec prévisualisation, et de réinitialiser
  complètement l'application. Essentiel pour la sauvegarde, le transfert et la
  restauration des données.

  Exemple concret :Un enseignant exporte toutes ses données en fin de session
  (étudiants, présences, évaluations) dans un fichier
  export-monitorage-2025-08-20.json. À la rentrée suivante, il importe ce fichier
  pour restaurer sa configuration. Il peut aussi sélectionner uniquement certaines
   clés (ex: grilles et cartouches) pour les réutiliser dans un nouveau cours sans
   importer les étudiants.

  ---
  🏷️ Type de module

  Type : UTILITAIRE

  Ce module ne génère pas de données métier, mais gère la persistance et transfert
   des données entre sessions ou appareils.

  Données manipulées :
  - Toutes les clés localStorage (lecture/écriture)
  - Format JSON pour export/import

  Cas d'usage :
  - Sauvegarde avant mise à jour navigateur
  - Transfert données entre ordinateurs
  - Migration vers nouvel appareil
  - Réinitialisation complète
  - Partage de configurations (grilles, cartouches, etc.)

  ---
  💾 Données gérées

  Structure de données principales

  1. Fichier d'export (JSON)

  {
    "groupeEtudiants": "[{...}, {...}]",
    "listeCours": "[{...}]",
    "calendrierComplet": "{...}",
    "seancesCompletes": "{...}",
    "indicesAssiduiteDetailles": "{...}",
    "grillesTemplates": "[{...}]",
    "niveauxEchelle": "[{...}]",
    "cartouches_GRILLE001": "[{...}]",
    "modalitesEvaluation": "{...}",
    // ... autres clés selon sélection
  }

  Note : Les valeurs sont des strings JSON (double encodage), car localStorage
  stocke uniquement des strings.

  2. Format nom fichier export

  export-monitorage-{YYYY-MM-DD}.json

  Exemple : export-monitorage-2025-08-20.json

  3. Variable globale temporaire

  let donneesImportEnAttente = null;  // Objet ou null

  Stocke temporairement les données chargées depuis le fichier avant confirmation
  d'import.

  Clés localStorage manipulées

  Toutes les clés peuvent être exportées/importées :
  - groupeEtudiants
  - listeCours
  - calendrierComplet
  - seancesCompletes
  - seancesHoraire
  - formatHoraire
  - indicesAssiduiteDetailles
  - grillesTemplates
  - niveauxEchelle
  - cartouches_{grilleId} (multiples)
  - modalitesEvaluation
  - Et toutes autres clés futures

  ---
  🔌 API publique

  Fonctions d'initialisation

  initialiserModuleImportExport()

  /**
   * Initialise le module au chargement
   * Appelée automatiquement par 99-main.js
   * 
   * FONCTIONNEMENT:
   * 1. Vérifie présence modales (#modalExport, #modalImport)
   * 2. Log console si OK ou warning si manquantes
   * 
   * RETOUR: void (log uniquement)
   */

  Fonctions d'export

  ouvrirModalExport()

  /**
   * Ouvre modal d'export avec liste des clés
   * 
   * FONCTIONNEMENT:
   * 1. Récupère toutes clés localStorage
   * 2. Calcule taille de chaque clé (Ko)
   * 3. Génère liste HTML avec checkboxes
   * 4. Affiche #modalExport
   * 5. Réinitialise #checkToutesLes
   * 
   * AFFICHAGE PAR CLÉ:
   * - Checkbox
   * - Nom clé (monospace)
   * - Taille (Ko)
   * 
   * STYLE:
   * - Fond bleu très pâle
   * - Bordure bleu pale
   * - Hover effect
   * - Cursor pointer
   * 
   * UTILISÉ PAR:
   * - Bouton «Exporter des données»
   * 
   * RETOUR: void
   */

  fermerModalExport()

  /**
   * Ferme modal d'export
   * 
   * FONCTIONNEMENT:
   * 1. Masque #modalExport
   * 2. Décoche #checkToutesLes
   * 
   * UTILISÉ PAR:
   * - Bouton «Annuler» dans modal
   * - executerExport() après succès
   * 
   * RETOUR: void
   */

  toggleToutesLesCles()

  /**
   * Coche/décoche toutes les clés
   * 
   * FONCTIONNEMENT:
   * 1. Lit état #checkToutesLes
   * 2. Applique à toutes .cle-export
   * 
   * UTILISÉ PAR:
   * - Checkbox «Toutes les clés» (onchange)
   * 
   * RETOUR: void
   */

  executerExport()

  /**
   * Exécute l'export des clés sélectionnées
   * 
   * FONCTIONNEMENT:
   * 1. Récupère clés cochées (.cle-export:checked)
   * 2. Validation: au moins une clé (alerte si 0)
   * 3. Construit objet {clé: valeur}
   * 4. Stringify avec indentation (JSON.stringify(, null, 2))
   * 5. Crée Blob application/json
   * 6. Télécharge fichier export-monitorage-{date}.json
   * 7. Ferme modal
   * 8. Notification succès
   * 
   * FORMAT DATE:
   * - toISOString().slice(0, 10)
   * - Résultat: "2025-08-20"
   * 
   * UTILISÉ PAR:
   * - Bouton «Exporter» dans modal
   * 
   * RETOUR: void + téléchargement fichier
   */

  Fonctions d'import

  ouvrirModalImport()

  /**
   * Ouvre modal d'import
   * 
   * FONCTIONNEMENT:
   * 1. Réinitialise #fichierImport.value
   * 2. Masque #apercu-import
   * 3. Désactive #btnExecuterImport (opacité 50%)
   * 4. Réinitialise donneesImportEnAttente = null
   * 5. Affiche #modalImport
   * 6. Attache previsualiserImport() au input file
   * 
   * UTILISÉ PAR:
   * - Bouton «Importer des données»
   * 
   * RETOUR: void
   */

  fermerModalImport()

  /**
   * Ferme modal d'import
   * 
   * FONCTIONNEMENT:
   * 1. Masque #modalImport
   * 2. Réinitialise donneesImportEnAttente = null
   * 
   * UTILISÉ PAR:
   * - Bouton «Annuler» dans modal
   * - executerImport() après succès
   * 
   * RETOUR: void
   */

  previsualiserImport(event)

  /**
   * Prévisualise fichier d'import
   * 
   * PARAMÈTRES:
   * @param {Event} event - Événement change du input file
   * 
   * FONCTIONNEMENT:
   * 1. Récupère fichier depuis event.target.files[0]
   * 2. Lit avec FileReader.readAsText()
   * 3. Parse JSON (try/catch)
   * 4. Si valide:
   *    - Stocke dans donneesImportEnAttente
   *    - Compte clés
   *    - Calcule taille totale (Ko)
   *    - Affiche aperçu "✓ Fichier valide"
   *    - Active #btnExecuterImport
   * 5. Si invalide:
   *    - Alert "Fichier JSON invalide"
   *    - Log erreur console
   * 
   * CALCUL TAILLE:
   * - Chaque caractère = 2 bytes (UTF-16)
   * - Somme toutes valeurs × 2
   * - Division par 1024 pour Ko
   * 
   * UTILISÉ PAR:
   * - Input file #fichierImport (onchange)
   * 
   * RETOUR: void
   */

  executerImport()

  /**
   * Exécute l'import des données
   * 
   * FONCTIONNEMENT:
   * 1. Validation: donneesImportEnAttente non null
   * 2. Confirmation utilisateur (écrasement données)
   * 3. Pour chaque clé:
   *    - localStorage.setItem(clé, valeur)
   *    - Incrémente compteur
   * 4. Ferme modal
   * 5. Notification succès
   * 6. Propose rechargement page
   * 7. Si accepté: location.reload()
   * 
   * AVERTISSEMENT:
   * - Écrase données existantes pour clés importées
   * - Confirmation obligatoire
   * 
   * RECHARGEMENT:
   * - Nécessaire pour appliquer changements
   * - Confirmation avant reload
   * 
   * UTILISÉ PAR:
   * - Bouton «Importer» dans modal
   * 
   * RETOUR: void + reload optionnel
   */

  Fonctions de réinitialisation

  reinitialiserDonnees()

  /**
   * Réinitialise TOUTES les données (localStorage.clear())
   * 
   * FONCTIONNEMENT:
   * 1. Première confirmation: Avertissement général
   * 2. Deuxième confirmation: Vérification export
   * 3. Troisième confirmation: Saisie "EFFACER" (prompt)
   * 4. Si tout confirmé:
   *    - localStorage.clear()
   *    - Alert succès
   *    - location.reload()
   * 5. Si annulé à n'importe quelle étape: return
   * 
   * SÉCURITÉ:
   * - Triple confirmation (3 niveaux)
   * - Saisie texte exacte requise ("EFFACER")
   * - Rappel irréversibilité
   * - Rappel export avant
   * 
   * UTILISÉ PAR:
   * - Bouton «Réinitialiser toutes les données»
   * 
   * RETOUR: void + reload si confirmé
   */

  ---
  🔗 Dépendances

  Modules requis (ordre de chargement)

  Aucune dépendance stricte, mais peut utiliser :
  - afficherNotificationSucces() (si disponible, sinon console.log)

  Éléments HTML requis

  <!-- Modal export -->
  <div id="modalExport" style="display: none;">
    <h3>Exporter des données</h3>

    <label>
      <input type="checkbox" id="checkToutesLes" onchange="toggleToutesLesCles()">
      Toutes les clés
    </label>

    <div id="listeClesExport">
      <!-- Généré dynamiquement -->
    </div>

    <button onclick="executerExport()">Exporter</button>
    <button onclick="fermerModalExport()">Annuler</button>
  </div>

  <!-- Modal import -->
  <div id="modalImport" style="display: none;">
    <h3>Importer des données</h3>

    <input type="file" id="fichierImport" accept=".json">

    <div id="apercu-import" style="display: none;">
      <!-- Aperçu généré dynamiquement -->
    </div>

    <button id="btnExecuterImport" onclick="executerImport()" disabled>
      Importer
    </button>
    <button onclick="fermerModalImport()">Annuler</button>
  </div>

  <!-- Boutons principaux (dans interface) -->
  <button onclick="ouvrirModalExport()">📤 Exporter des données</button>
  <button onclick="ouvrirModalImport()">📥 Importer des données</button>
  <button onclick="reinitialiserDonnees()">🗑️ Réinitialiser toutes les
  données</button>

  Classes CSS requises

  Aucune classe obligatoire, le module utilise des styles inline. Variables CSS
  utilisées :
  --bleu-tres-pale
  --bleu-pale
  --bleu-leger

  ---
  🚀 Initialisation

  Appel depuis 99-main.js

  // PRIORITÉ 5 : UTILITAIRES

  // MODULE : Import/Export
  if (typeof initialiserModuleImportExport === 'function') {
      console.log('   → Module import-export détecté');
      initialiserModuleImportExport();
  }

  Ordre de chargement

  1. Tous modules sources (génèrent données)
  2. import-export.js (peut importer n'importe quelle donnée)
  3. main.js (appelle initialiserModuleImportExport)

  Note : Ce module doit être chargé après tous les modules sources pour pouvoir
  exporter leurs données.

  Événements gérés

  Tous attachés via attributs HTML :
  // Modal export
  onclick="ouvrirModalExport()"
  onclick="fermerModalExport()"
  onchange="toggleToutesLesCles()"
  onclick="executerExport()"

  // Modal import
  onclick="ouvrirModalImport()"
  onclick="fermerModalImport()"
  onchange="previsualiserImport(event)"  // Attaché dynamiquement
  onclick="executerImport()"

  // Réinitialisation
  onclick="reinitialiserDonnees()"

  ---
  🧪 Tests et vérification

  Test 1 : Export sélectif

  1. Clic "Exporter des données"
  2. Vérifier liste toutes clés localStorage
  3. Vérifier tailles affichées (Ko)
  4. Cocher quelques clés (ex: groupeEtudiants, listeCours)
  5. Clic "Exporter"
  6. Vérifier téléchargement fichier export-monitorage-{date}.json
  7. Ouvrir fichier, vérifier JSON valide
  8. Vérifier seulement clés sélectionnées présentes

  Test 2 : Export complet

  1. Ouvrir modal export
  2. Cocher "Toutes les clés"
  3. Vérifier toutes checkboxes cochées
  4. Clic "Exporter"
  5. Vérifier fichier contient toutes clés

  Test 3 : Décocher "Toutes les clés"

  1. Cocher "Toutes les clés"
  2. Décocher "Toutes les clés"
  3. Vérifier toutes checkboxes décochées

  Test 4 : Import avec prévisualisation

  1. Exporter quelques clés
  2. Clic "Importer des données"
  3. Sélectionner fichier exporté
  4. Vérifier aperçu:
    - "✓ Fichier valide"
    - Nombre de clés
    - Taille (Ko)
  5. Vérifier bouton "Importer" activé

  Test 5 : Import invalide

  1. Créer fichier texte test.json avec contenu invalide:
  {ceci n'est pas du JSON valide}
  2. Sélectionner ce fichier
  3. Vérifier alerte "Fichier JSON invalide"
  4. Vérifier bouton "Importer" désactivé
  5. Vérifier erreur console

  Test 6 : Import et écrasement

  // Avant import
  localStorage.setItem('testCle', 'valeur_originale');

  // Importer fichier contenant
  // { "testCle": "valeur_importee" }

  // Après import
  console.log(localStorage.getItem('testCle'));
  // Doit afficher: "valeur_importee"

  Test 7 : Import avec rechargement

  1. Importer fichier
  2. Confirmer import
  3. Confirmer rechargement page
  4. Vérifier page rechargée
  5. Vérifier données importées présentes

  Test 8 : Réinitialisation complète

  ⚠️ ATTENTION : Faire APRÈS avoir exporté données de test

  1. Clic "Réinitialiser toutes les données"
  2. Première confirmation: Clic OK
  3. Deuxième confirmation: Clic OK
  4. Saisir "EFFACER" exactement
  5. Vérifier localStorage vide:
  console.log(localStorage.length);  // Doit être 0
  6. Vérifier page rechargée
  7. Réimporter données de test

  Test 9 : Annulation réinitialisation

  1. Clic "Réinitialiser..."
  2. Annuler à la 1ère confirmation
  3. Vérifier données intactes

  Ou :
  1. Confirmer 1ère et 2ème
  2. Saisir "effacer" (minuscules)
  3. Vérifier alerte "Réinitialisation annulée"
  4. Vérifier données intactes

  Test 10 : Calcul taille fichier

  // Vérifier calcul précis
  const testData = {
      cle1: 'a'.repeat(1000),  // 1000 caractères
      cle2: 'b'.repeat(2000)   // 2000 caractères
  };

  // Taille attendue: (1000 + 2000) × 2 bytes = 6000 bytes = 5.86 Ko
  // Vérifier que l'aperçu affiche ~5.86 Ko

  ---
  🐛 Problèmes connus

  Problème 1 : Fichier JSON trop volumineux

  Symptôme : Échec export ou navigateur freeze

  Cause : localStorage très plein (limite ~5-10 MB)

  Solution :
  // Exporter par groupes de clés
  // Groupe 1: Données étudiants
  // Groupe 2: Configurations (grilles, échelles)
  // Groupe 3: Données temporaires (présences, évaluations)

  // Vérifier taille localStorage
  let taille = 0;
  for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      taille += localStorage.getItem(cle).length * 2;
  }
  console.log('Taille localStorage:', (taille / 1024 / 1024).toFixed(2), 'MB');

  Problème 2 : Import échoue silencieusement

  Symptôme : Pas d'erreur mais données pas importées

  Cause : Format JSON double-encodé incorrectement

  Solution :
  // Vérifier format fichier
  const fichier = /* contenu fichier */;
  const donnees = JSON.parse(fichier);

  // Chaque valeur doit être une STRING (double encodage)
  Object.values(donnees).forEach(valeur => {
      console.log('Type:', typeof valeur);  // Doit être "string"

      // Tester décodage
      try {
          JSON.parse(valeur);
          console.log('✓ Valeur décodable');
      } catch (e) {
          console.error('✗ Valeur non décodable:', valeur.substring(0, 50));
      }
  });

  Problème 3 : Bouton "Importer" reste désactivé

  Symptôme : Fichier valide mais bouton grisé

  Cause : previsualiserImport() pas exécutée ou erreur JavaScript

  Solution :
  // Vérifier événement attaché
  const input = document.getElementById('fichierImport');
  console.log('Événement onchange:', input.onchange);

  // Forcer réattachement
  input.onchange = previsualiserImport;

  // Déboguer prévisualisation
  previsualiserImport = function(event) {
      console.log('🔍 Prévisualisation lancée');
      const fichier = event.target.files[0];
      console.log('Fichier:', fichier);
      // ... reste du code
  };

  Problème 4 : Réinitialisation bloque le navigateur

  Symptôme : Page freeze après localStorage.clear()

  Cause : Rechargement immédiat sans laisser le temps de nettoyer

  Solution :
  // Modifier reinitialiserDonnees() ligne 230
  try {
      localStorage.clear();
      alert('✓ Toutes les données ont été effacées.\n\nLa page va se recharger.');

      // Attendre 500ms avant reload
      setTimeout(() => {
          location.reload();
      }, 500);

  } catch (erreur) {
      console.error('Erreur:', erreur);
  }

  Problème 5 : Export génère fichier corrompu

  Symptôme : Fichier JSON invalide malgré pas d'erreur

  Cause : Caractères spéciaux ou encodage UTF-8 avec BOM

  Solution :
  // Modifier executerExport() ligne 103
  const json = JSON.stringify(donnees, null, 2);

  // Ajouter BOM UTF-8 pour compatibilité
  const bom = '\uFEFF';
  const blob = new Blob([bom + json], {
      type: 'application/json;charset=utf-8'
  });

  // ... reste du code

  Problème 6 : Modal ne s'ouvre pas

  Symptôme : Clic bouton sans effet

  Cause : Élément #modalExport ou #modalImport inexistant

  Solution :
  // Vérifier éléments existent
  console.log('Modal export:', !!document.getElementById('modalExport'));
  console.log('Modal import:', !!document.getElementById('modalImport'));

  // Si manquants, vérifier HTML ou créer dynamiquement

  ---
  📐 Règles de modification

  ⚠️ ZONES PROTÉGÉES

  1. Noms de fonctions : Listés dans noms_stables.json
  2. IDs HTML : Ne pas renommer les id des éléments
  3. Format fichier export : JSON avec strings double-encodées
  4. Nom fichier : export-monitorage-{date}.json
  5. Sécurité réinitialisation : Triple confirmation obligatoire

  ✅ Modifications autorisées

  1. Commentaires : Ajout/modification sans limite
  2. Styles inline : Variables CSS et styles visuels
  3. Messages utilisateur : Textes alertes/confirmations
  4. Format date : Actuellement YYYY-MM-DD (modifiable)
  5. Indentation JSON : Actuellement 2 espaces (modifiable)
  6. Texte confirmation : "EFFACER" (peut être changé)

  Amélioration format export

  Ajout métadonnées :
  // Dans executerExport(), ligne 98
  const donnees = {
      _metadata: {
          version: '1.0',
          date: new Date().toISOString(),
          nbCles: clesSelectionnees.length,
          application: 'Monitorage v6'
      },
      data: {}
  };

  clesSelectionnees.forEach(cle => {
      donnees.data[cle] = localStorage.getItem(cle);
  });

  const json = JSON.stringify(donnees, null, 2);

  Note : Si métadonnées ajoutées, adapter previsualiserImport() et
  executerImport().

  Workflow modification

  1. ✅ Lire CLAUDE.md (règles globales)
  2. ✅ Vérifier noms_stables.json
  3. ✅ Exporter données avant de tester (sécurité)
  4. ✅ Sauvegarder (commit Git)
  5. ✅ Modifier uniquement zones autorisées
  6. ✅ Tester immédiatement avec données factices
  7. ✅ Réimporter données réelles
  8. ✅ Rollback si erreur

  ---
  📜 Historique

  | Date       | Version     | Changements                    |
  |------------|-------------|--------------------------------|
  | 10-10-2025 | index 35-M5 | Version originale              |
  |            |             | - Export sélectif localStorage |
  |            |             | - Import avec prévisualisation |
  |            |             | - Réinitialisation sécurisée   |
  |            |             | - Format JSON                  |
  |            |             | - Calcul tailles               |
  |            |             | - Checkbox "Toutes les clés"   |

  ---
  📞 Support et ressources

  Documentation projet : README_PROJET.mdArchitecture : structure-modulaire.txt

  Debug console :
  // Vérifier fonctions disponibles
  console.log('API disponible?', {
      init: typeof initialiserModuleImportExport,
      export: typeof executerExport,
      import: typeof executerImport,
      reset: typeof reinitialiserDonnees
  });

  // Lister toutes clés localStorage
  console.log('Clés localStorage:');
  for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      const valeur = localStorage.getItem(cle);
      const taille = ((cle.length + valeur.length) / 1024).toFixed(2);
      console.log(`  ${cle}: ${taille} Ko`);
  }

  // Calculer taille totale
  let tailleTotale = 0;
  for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      tailleTotale += localStorage.getItem(cle).length * 2;
  }
  console.log('Taille totale:', (tailleTotale / 1024 / 1024).toFixed(2), 'MB');

  // Tester format export
  const test = {
      cle1: JSON.stringify({test: "valeur"}),  // Double encodage
      cle2: '[1,2,3]'
  };
  console.log('Test export:', JSON.stringify(test, null, 2));

  // Tester import
  const donnees = JSON.parse(/* contenu fichier */);
  console.log('Clés importées:', Object.keys(donnees));

  Commandes utiles :
  // Backup rapide console
  copy(JSON.stringify(
      Object.fromEntries(
          Array.from({length: localStorage.length}, (_, i) =>
              [localStorage.key(i), localStorage.getItem(localStorage.key(i))]
          )
      ),
      null,
      2
  ));
  // Colle le JSON dans le presse-papier

  // Restauration rapide
  const backup = /* coller JSON */;
  Object.entries(backup).forEach(([k, v]) => localStorage.setItem(k, v));

  ---
  ⚠️ RAPPEL CRITIQUE : Ce module gère la sauvegarde et restauration complète de
  toutes les données de l'application. Testez TOUJOURS avec des données factices
  avant utilisation en production. Exportez régulièrement vos données pour éviter
  toute perte. La réinitialisation est irréversible.