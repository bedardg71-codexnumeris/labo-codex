Voici la documentation complète du fichier index 71 (refonte des modules).html :

  ---
  # Documentation technique - index 71 (refonte des modules).html

  **Date de création** : Octobre 2025
  **Dernière modification** : Octobre 2025
  **Version** : Beta 0.71
  **Lignes de code** : 3351 lignes
  **Taille** : ~47 000 tokens

  ---

  ## 1. Vue d'ensemble

  Le fichier `index 71 (refonte des modules).html` est le **point d'entrée 
  unique** de l'application de monitorage pédagogique. Il contient :
  - La structure HTML complète de l'application
  - Les styles CSS embarqués (en plus de styles.css externe)
  - Le chargement ordonné de 21 modules JavaScript
  - 3 sections principales avec 19 sous-sections
  - L'interface utilisateur complète (navigation, conteneurs, formulaires)

  **Philosophie** : Application **SPA (Single Page Application)** sans framework.
  Toute l'interface est dans un seul fichier HTML, la navigation se fait via
  affichage/masquage de sections avec JavaScript.

  **Contrainte critique** : L'ordre de chargement des scripts est **VITAL**.
  Modules de configuration d'abord, modules d'initialisation en dernier.

  ---

  ## 2. Structure générale du fichier

  ### 2.1 Organisation en blocs

  LIGNES 1-514:  et styles CSS embarqués
    ├─ Meta tags (charset, viewport)
    ├─ Titre: "Système de suivi Beta 0.71"
    ├─ Link vers styles.css externe
    ├─ Styles CSS embarqués (~500 lignes)
    └─ Variables CSS, reset, composants

  LIGNES 515-3230:  et structure HTML
    ├─ En-tête (titre, version, logo)
    ├─ Navigation principale (5 sections)
    ├─ Sous-navigation (dynamique)
    ├─ Section Tableau de bord (3 sous-sections)
    ├─ Section Présences (3 sous-sections)
    ├─ Section Évaluations (2 sous-sections)
    ├─ Section Réglages (10 sous-sections)
    └─ Modaux (import/export)

  LIGNES 3231-3269: Scripts JavaScript (21 modules)
    ├─ Modules configuration (config, navigation)
    ├─ Modules données (trimestre, productions, grilles, etc.)
    ├─ Modules affichage (tableau-bord, profil-etudiant, etc.)
    ├─ Modules utilitaires (import-export, statistiques)
    └─ Module initialisation (main.js en dernier)

  LIGNES 3270-3351: Fermeture  et

  ### 2.2 Ratio CSS vs HTML vs Scripts

  - **CSS embarqué** : ~15% du fichier (lignes 9-514)
  - **HTML structure** : ~80% du fichier (lignes 515-3230)
  - **Scripts externes** : ~1% du fichier (lignes 3231-3269, mais charge ~50 000
  lignes de JS)

  ---

  ## 3. Section <head>

  ### 3.1 Meta tags et configuration

  ```html
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Système de suivi Beta 0.71</title>

      <!-- Styles CSS externes -->
      <link rel="stylesheet" href="styles.css">

      <!-- Styles CSS embarqués -->
      <style>
          /* Variables CSS (ligne 14-41) */
          /* Reset et base (ligne 43-57) */
          /* Conteneur principal (ligne 59-69) */
          /* En-tête (ligne 71-111) */
          /* Navigation (ligne 113-198) */
          /* ... (environ 500 lignes de CSS) */
      </style>
  </head>

  ⚠️ DUPLICATION CSS : Les styles embarqués font doublon avec styles.css. Les
  variables CSS sont définies dans les deux fichiers.

  Raison historique : Le fichier a probablement évolué avec styles.css ajouté plus
   tard, mais les styles embarqués n'ont pas été supprimés.

  Impact :
  - Aucun (le dernier style lu écrase le précédent)
  - Mais maintenance difficile (modifier à 2 endroits)

  Solution recommandée :
  1. Garder uniquement les styles spécifiques à cette page dans
  2. Déplacer tout le reste dans styles.css
  3. Ou supprimer complètement  si styles.css est complet

  ---
  4. Section  - Structure HTML

  4.1 En-tête de l'application

  Lignes : ~515

  <body>
      <div class="conteneur">
          <!-- EN-TÊTE -->
          <div class="entete">
              <h1>Système de Monitorage Pédagogique</h1>
              <h2>Suivi des apprentissages et monitorage A-C-P</h2>
              <div class="version">Version Beta 0.71 - Refonte modulaire</div>
              <div class="statut-test">MODE TEST</div>
          </div>

  Éléments :
  - .conteneur : Conteneur principal max-width 1400px
  - .entete : Bandeau bleu avec titre
  - .version : Numéro de version affiché
  - .statut-test : Badge orange "MODE TEST" (position absolue, top-right)

  ---
  4.2 Navigation principale

  Lignes : ~517

  <!-- NAVIGATION PRINCIPALE -->
  <div class="navigation-principale">
      <button data-onglet="tableau-bord">📊 Tableau de bord</button>
      <button data-onglet="presences">📅 Présences</button>
      <button data-onglet="evaluations">📝 Évaluations</button>
      <button data-onglet="reglages">⚙️ Réglages</button>
  </div>

  Structure :
  - 4 boutons (pas 5 comme dans NOMS_STABLES.json - la section Étudiants n'existe
  pas comme section principale)
  - Attribut data-onglet pour identifier la section cible
  - Icônes emoji intégrées
  - Classe .actif ajoutée dynamiquement par navigation.js

  ⚠️ INCOHÉRENCE : NOMS_STABLES.json liste 5 sections dont "section-etudiants",
  mais elle n'apparaît pas dans la navigation principale.

  ---
  4.3 Sous-navigation

  Lignes : ~518

  <!-- SOUS-NAVIGATION (générée dynamiquement) -->
  <div id="sous-navigation" class="sous-navigation"></div>

  Comportement :
  - Conteneur vide au chargement
  - Rempli dynamiquement par navigation.js → afficherSousNavigation()
  - Boutons générés selon configurationsOnglets dans config.js

  ---
  4.4 Zone de contenu

  Lignes : 518-3230 (85% du fichier)

  <!-- CONTENU PRINCIPAL -->
  <div id="contenu-principal" class="contenu">
      <!-- Section Tableau de bord -->
      <section id="section-tableau-bord" class="section">
          <!-- 3 sous-sections -->
      </section>

      <!-- Section Présences -->
      <section id="section-presences" class="section">
          <!-- 3 sous-sections -->
      </section>

      <!-- Section Évaluations -->
      <section id="section-evaluations" class="section">
          <!-- 2 sous-sections -->
      </section>

      <!-- Section Réglages -->
      <section id="section-reglages" class="section">
          <!-- 10 sous-sections -->
      </section>
  </div>

  ---
  5. Sections principales

  5.1 Section Tableau de bord

  ID : section-tableau-bord
  Lignes : 518-927
  Sous-sections : 3

  Sous-section 1 : Aperçu (tableau-bord-apercu)

  Lignes : 521-799
  Contenu :
  - Métriques globales du groupe (cartes statistiques)
  - Alertes prioritaires
  - Distribution des patterns de risque
  - Actions recommandées
  - Raccourcis rapides

  Éléments clés :
  <div id="tableau-bord-apercu" class="sous-section">
      <!-- Métriques -->
      <div class="grille-statistiques">
          <div class="carte-statistique">
              <div class="valeur" id="stat-nb-etudiants">0</div>
              <div class="label">Étudiants</div>
          </div>
          <!-- Plus de cartes... -->
      </div>

      <!-- Alertes -->
      <div id="alertes-prioritaires"></div>

      <!-- Distribution patterns -->
      <div id="distribution-patterns"></div>
  </div>

  Rempli par : tableau-bord-apercu.js → chargerTableauBordApercu()

  ---
  Sous-section 2 : Liste (tableau-bord-liste)

  Lignes : 800-906
  Contenu :
  - Liste complète des étudiants avec indices A-C-P
  - Tableau avec colonnes : Nom, Groupe, A%, C%, P%, Risque
  - Boutons d'action par étudiant

  Élément clé :
  <div id="tableau-bord-liste" class="sous-section">
      <table class="tableau">
          <thead>
              <tr>
                  <th>Nom</th>
                  <th>Groupe</th>
                  <th>A%</th>
                  <th>C%</th>
                  <th>P%</th>
                  <th>Risque</th>
                  <th>Actions</th>
              </tr>
          </thead>
          <tbody id="tbody-liste-complete">
              <!-- Rempli dynamiquement -->
          </tbody>
      </table>
  </div>

  Rempli par : tableau-bord-apercu.js (probablement, ou module dédié)

  ---
  Sous-section 3 : Profil (tableau-bord-profil)

  Lignes : 907-927
  Contenu :
  - Profil détaillé d'un étudiant individuel
  - Dashboard des indices
  - Portfolio, assiduité, évaluations

  Élément clé :
  <div id="tableau-bord-profil" class="sous-section">
      <div id="contenuProfilEtudiant">
          <!-- Rempli par profil-etudiant.js -->
      </div>
  </div>

  Rempli par : profil-etudiant.js → afficherProfilComplet(da)

  ---
  5.2 Section Présences

  ID : section-presences
  Lignes : 928-1338
  Sous-sections : 3

  Sous-section 1 : Aperçu (presences-apercu)

  Lignes : 931-940
  Contenu : Statistiques globales d'assiduité

  ---
  Sous-section 2 : Calendrier (presences-calendrier)

  Lignes : 941-950
  Contenu : Vue calendaire du trimestre avec jours de cours

  Élément clé :
  <div id="presences-calendrier" class="sous-section">
      <div id="calendrier-container">
          <!-- Rempli par calendrier-vue.js -->
      </div>
  </div>

  Rempli par : calendrier-vue.js → afficherCalendrierScolaire()

  ---
  Sous-section 3 : Saisie (presences-saisie)

  Lignes : 951-1338 (387 lignes - la plus volumineuse)
  Contenu :
  - Formulaire de saisie des présences
  - Tableau des étudiants avec input heures de présence
  - Encadré de date avec validation
  - Contrôle de verrouillage

  Structure complexe :
  <div id="presences-saisie" class="sous-section">
      <!-- Encadré date -->
      <div id="enteteDateSeance" style="display: none;">
          <p id="texteDateSeance"></p>
      </div>

      <!-- Formulaire saisie -->
      <div class="carte">
          <h3>
              📝 Saisie des présences
              <!-- Contrôle verrouillage -->
              <div class="controle-verrouillage">
                  <input type="checkbox" id="verrouillerSeance">
                  <label for="verrouillerSeance">
                      <span class="icone-cadenas">🔓</span> Verrouiller
                  </label>
              </div>
          </h3>

          <!-- Date et durée -->
          <div class="groupe-form">
              <label>Date du cours</label>
              <input type="date" id="date-cours">
          </div>

          <div class="groupe-form">
              <label>Durée de la séance (heures)</label>
              <input type="number" id="duree-seance" value="3" step="0.5">
          </div>

          <!-- Tableau saisie -->
          <table class="tableau">
              <thead>
                  <tr>
                      <th>Nom</th>
                      <th>Groupe</th>
                      <th>Heures présentes</th>
                      <th>Statut</th>
                  </tr>
              </thead>
              <tbody id="tbody-saisie-presences">
                  <!-- Rempli dynamiquement -->
              </tbody>
          </table>

          <!-- Boutons -->
          <div class="btn-groupe">
              <button class="btn btn-confirmer">Sauvegarder</button>
              <button class="btn btn-annuler">Réinitialiser</button>
          </div>
      </div>
  </div>

  Rempli par : saisie-presences.js

  Fonctionnalités :
  - Codes couleur automatiques (vert = présent, jaune = retard, rouge = absent)
  - Verrouillage de séance (empêche modifications)
  - Calcul automatique du statut
  - Validation de la date (cours réel vs congé)

  ---
  5.3 Section Évaluations

  ID : section-evaluations (⚠️ NON TROUVÉ dans le HTML - probablement ligne >3230
  ou manquant)
  Lignes : ~1074-3230 (estimé)
  Sous-sections : 2

  Sous-section 1 : Liste (evaluations-liste)

  Lignes : 1079-1163
  Contenu :
  - Liste des évaluations par étudiant
  - Filtres (étudiant, production, statut)
  - Cartes par étudiant avec détails des évaluations

  Élément clé :
  <div id="evaluations-liste" class="sous-section">
      <!-- Statistiques -->
      <div class="conteneur-statistiques">
          <div class="carte-statistique">
              <div class="valeur" id="stat-total-evaluations">0</div>
              <div class="label">Évaluations</div>
          </div>
          <!-- Plus... -->
      </div>

      <!-- Filtres -->
      <div class="grille-filtres">
          <select id="filtre-etudiant"></select>
          <select id="filtre-production"></select>
          <select id="filtre-statut"></select>
      </div>

      <!-- Liste évaluations -->
      <div id="liste-evaluations-container">
          <!-- Rempli dynamiquement -->
      </div>
  </div>

  Rempli par : liste-evaluations.js → chargerListeEvaluationsRefonte()

  ---
  Sous-section 2 : Individuelles (evaluations-individuelles)

  Lignes : 1164-1338 (estimé)
  Contenu :
  - Formulaire d'évaluation d'un étudiant
  - Sélection étudiant, production, grille, échelle
  - Évaluation par critères
  - Génération de rétroaction

  Rempli par : evaluation.js

  ---
  5.4 Section Réglages

  ID : section-reglages
  Lignes : 1341-3230 (1889 lignes - 56% du HTML)
  Sous-sections : 10 (la section la plus fournie)

  Sous-section 1 : Aperçu (reglages-apercu)

  Lignes : 1344-1408
  Contenu :
  - Statistiques de configuration
  - État des modules
  - Poids localStorage

  Éléments clés :
  <div id="reglages-apercu" class="sous-section">
      <div class="grille-statistiques">
          <div class="carte-statistique">
              <div class="valeur" id="stat-version">0.71</div>
              <div class="label">Version</div>
          </div>
          <div class="carte-statistique">
              <div class="valeur" id="stat-poids">0 Ko</div>
              <div class="label">Données</div>
          </div>
          <div class="carte-statistique">
              <div class="valeur" id="stat-trimestre">❌</div>
              <div class="label">Trimestre</div>
          </div>
          <!-- Plus... -->
      </div>
  </div>

  Rempli par : statistiques.js → chargerStatistiquesApercu()

  ---
  Sous-section 2 : Cours (reglages-cours)

  Lignes : 1409-1601
  Contenu :
  - Informations sur le cours (code, titre, session)
  - Programme d'études
  - Enseignant
  - Pondération totale

  Formulaire :
  <div id="reglages-cours" class="sous-section">
      <form id="form-cours">
          <div class="groupe-form">
              <label>Code du cours</label>
              <input type="text" id="cours-code">
          </div>
          <div class="groupe-form">
              <label>Titre du cours</label>
              <input type="text" id="cours-titre">
          </div>
          <!-- Plus de champs... -->

          <button type="submit" class="btn btn-confirmer">
              Sauvegarder
          </button>
      </form>

      <!-- Tableau des cours (si plusieurs) -->
      <div id="tableau-cours-container"></div>
  </div>

  Géré par : cours.js

  ---
  Sous-section 3 : Trimestre (reglages-trimestre)

  Lignes : 1602-1860 (259 lignes)
  Contenu :
  - Configuration du calendrier scolaire
  - Dates début/fin du trimestre
  - Jours de cours (lundi, mardi, etc.)
  - Gestion des congés (prévus/imprévus)
  - Gestion des reprises

  Structure volumineuse :
  <div id="reglages-trimestre" class="sous-section">
      <!-- Configuration dates -->
      <div class="carte">
          <h3>📅 Configuration du trimestre</h3>
          <div class="groupe-form">
              <label>Date de début</label>
              <input type="date" id="trimestre-debut">
          </div>
          <div class="groupe-form">
              <label>Date de fin</label>
              <input type="date" id="trimestre-fin">
          </div>

          <!-- Jours de cours -->
          <div class="groupe-form">
              <label>Jours de cours</label>
              <div id="jours-semaine-selection">
                  <label><input type="checkbox" value="1"> Lundi</label>
                  <label><input type="checkbox" value="2"> Mardi</label>
                  <!-- Plus... -->
              </div>
          </div>

          <button class="btn btn-principal" onclick="genererCalendrierComplet()">
              Générer le calendrier
          </button>
      </div>

      <!-- Gestion congés -->
      <div class="carte">
          <h3>🚫 Gestion des congés</h3>
          <!-- Formulaire ajout congé -->
          <!-- Liste congés -->
      </div>

      <!-- Gestion reprises -->
      <div class="carte">
          <h3>🔄 Gestion des reprises</h3>
          <!-- Formulaire ajout reprise -->
          <!-- Liste reprises -->
      </div>
  </div>

  Géré par : trimestre.js

  ---
  Sous-section 4 : Horaire (reglages-horaire)

  Lignes : 1861-1949
  Contenu :
  - Configuration des séances (jour, heure début/fin)
  - Ajout/suppression de séances

  Géré par : horaire.js

  ---
  Sous-section 5 : Groupe (reglages-groupe)

  Lignes : 1950-2332 (382 lignes)
  Contenu :
  - Liste des étudiants
  - Ajout/modification/suppression d'étudiants
  - Formulaire avec DA, nom, prénom, groupe, programme, SA, CAF

  Structure :
  <div id="reglages-groupe" class="sous-section">
      <!-- Formulaire ajout -->
      <div class="carte">
          <h3>➕ Ajouter un étudiant</h3>
          <form id="form-ajout-etudiant" class="formulaire-ajout-grid">
              <div class="groupe-form">
                  <label>DA</label>
                  <input type="text" id="input-da">
              </div>
              <div class="groupe-form">
                  <label>Nom</label>
                  <input type="text" id="input-nom">
              </div>
              <!-- Plus de champs... -->

              <div>
                  <button type="submit" class="btn btn-ajouter">
                      Ajouter
                  </button>
              </div>
          </form>
      </div>

      <!-- Liste étudiants -->
      <div class="carte">
          <h3>👥 Liste des étudiants</h3>
          <table class="tableau">
              <thead>
                  <tr>
                      <th>DA</th>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Groupe</th>
                      <th>Programme</th>
                      <th>SA</th>
                      <th>CAF</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody id="tbody-etudiants">
                  <!-- Rempli dynamiquement -->
              </tbody>
          </table>
      </div>
  </div>

  Géré par : groupe.js

  ---
  Sous-section 6 : Pratiques de notation (reglages-pratique-notation)

  Lignes : 2333-2460
  Contenu :
  - Choix entre notation sommative et alternative (PAN)
  - Configuration PAN (Maîtrise, Spécifications, Dénotation)
  - Affichage dans tableau de bord

  Géré par : pratiques.js

  ---
  Sous-section 7 : Productions (reglages-productions)

  Lignes : 2461-2618 (158 lignes)
  Contenu :
  - Liste des productions/évaluations
  - Ajout/modification de productions
  - Types : examen, travail, quiz, présentation, portfolio, artefact-portfolio,
  autre
  - Pondération, grille, échelle

  Géré par : productions.js

  ---
  Sous-section 8 : Grilles de critères (reglages-grille-criteres)

  Lignes : 2619-2772
  Contenu :
  - Création/modification de grilles d'évaluation
  - Critères SRPNF (Structure, Rigueur, Plausibilité, Nuance, Français)
  - Pondération par critère

  Géré par : grilles.js

  ---
  Sous-section 9 : Échelles de performance (reglages-echelle-performance)

  Lignes : 2773-2923
  Contenu :
  - Configuration échelles SOLO/IDME
  - Niveaux de performance avec seuils
  - Templates prédéfinis

  Géré par : echelles.js

  ---
  Sous-section 10 : Rétroactions (reglages-retroactions)

  Lignes : 2924-3144
  Contenu :
  - Cartouches de rétroaction par niveau
  - Messages personnalisables
  - Templates de rétroaction

  Géré par : cartouches.js

  ---
  Sous-section 11 : Import/Export (reglages-import-export)

  Lignes : 3145-3230
  Contenu :
  - Export JSON de toutes les données
  - Import JSON
  - Réinitialisation des données
  - Modaux d'import/export

  Structure :
  <div id="reglages-import-export" class="sous-section">
      <div class="carte">
          <h3>💾 Sauvegarde et restauration</h3>

          <button class="btn btn-principal" onclick="ouvrirModalExport()">
              📤 Exporter les données
          </button>

          <button class="btn btn-ajouter" onclick="ouvrirModalImport()">
              📥 Importer les données
          </button>

          <button class="btn btn-supprimer" onclick="reinitialiserDonnees()">
              🗑️ Réinitialiser toutes les données
          </button>
      </div>
  </div>

  <!-- Modal Export -->
  <div id="modal-export" class="modal-overlay" style="display: none;">
      <div class="modal-contenu">
          <h3>Export des données</h3>
          <textarea id="export-json" rows="15"></textarea>
          <button class="btn btn-principal" onclick="copierExport()">
              Copier
          </button>
          <button class="btn btn-annuler" onclick="fermerModalExport()">
              Fermer
          </button>
      </div>
  </div>

  <!-- Modal Import -->
  <div id="modal-import" class="modal-overlay" style="display: none;">
      <div class="modal-contenu">
          <h3>Import des données</h3>
          <textarea id="import-json" rows="15" 
                    placeholder="Coller ici le JSON exporté..."></textarea>
          <button class="btn btn-confirmer" onclick="importerDonnees()">
              Importer
          </button>
          <button class="btn btn-annuler" onclick="fermerModalImport()">
              Annuler
          </button>
      </div>
  </div>

  Géré par : import-export.js

  ---
  6. Section  - Chargement des modules

  Lignes : 3231-3269 (39 lignes)
  Ordre critique : Respecte le principe de dépendances

  6.1 Ordre de chargement

  <!-- ===================================
       MODULES JAVASCRIPT
       Ordre de chargement CRITIQUE
       ======================================= -->

  <!-- 1. CONFIGURATION (toujours en premier) -->
  <script src="js/config.js"></script>
  <script src="js/navigation.js"></script>

  <!-- 2. MODULES GÉNÉRATEURS DE DONNÉES (sources) -->
  <script src="js/trimestre.js"></script>
  <script src="js/tableau-bord-apercu.js"></script>
  <script src="js/etudiants.js"></script>
  <script src="js/productions.js"></script>
  <script src="js/grilles.js"></script>
  <script src="js/echelles.js"></script>
  <script src="js/cartouches.js"></script>
  <script src="js/cours.js"></script>

  <!-- 3. MODULES LECTEURS -->
  <script src="js/calendrier-vue.js"></script>
  <script src="js/saisie-presences.js"></script>

  <!-- 4. MODULES AVANCÉS -->
  <script src="js/horaire.js"></script>
  <script src="js/groupe.js"></script>
  <script src="js/pratiques.js"></script>

  <!-- 5. UTILITAIRES -->
  <script src="js/import-export.js"></script>
  <script src="js/statistiques.js"></script>

  <!-- 6. MODULES COMPLEXES -->
  <script src="js/profil-etudiant.js"></script>
  <script src="js/liste-evaluations.js"></script>
  <script src="js/modes.js"></script>

  <!-- 7. ÉVALUATION (dépend de presque tout) -->
  <script src="js/evaluation.js"></script>
  <script src="js/portfolio.js"></script>

  <!-- 8. INITIALISATION (toujours en dernier) -->
  <script src="js/main.js"></script>

  6.2 Justification de l'ordre

  Niveau 1 - Configuration :
  - config.js : Variables globales, configurations
  - navigation.js : Fonctions de navigation

  Niveau 2 - Générateurs :
  - trimestre.js : Génère calendrierComplet
  - productions.js : Génère listeGrilles
  - grilles.js : Génère grillesTemplates
  - echelles.js : Génère echellesTemplates

  Niveau 3 - Lecteurs :
  - calendrier-vue.js : Lit calendrierComplet
  - saisie-presences.js : Lit calendrierComplet + génère presences

  Niveau 4 - Complexes :
  - profil-etudiant.js : Lit toutes les sources
  - evaluation.js : Lit productions, grilles, échelles
  - portfolio.js : Lit productions, évaluations

  Niveau 5 - Initialisation :
  - main.js : Initialise tout, attache événements

  ⚠️ IMPORTANT : Si l'ordre est modifié, des erreurs "fonction not defined" ou
  "données not found" peuvent survenir.

  ---
  7. Problèmes connus et solutions

  7.1 Duplication CSS (styles.css vs )

  Symptôme : Variables CSS et styles définis 2 fois

  Impact :
  - Maintenance difficile
  - Risque d'incohérence
  - Poids du fichier augmenté

  Solution recommandée :
  <!-- OPTION 1 : Supprimer <style> complètement -->
  <head>
      <link rel="stylesheet" href="styles.css">
      <!-- Supprimer <style>...</style> -->
  </head>

  <!-- OPTION 2 : Garder uniquement les overrides spécifiques -->
  <head>
      <link rel="stylesheet" href="styles.css">
      <style>
          /* Uniquement les styles spécifiques à cette page */
          .statut-test {
              position: absolute;
              top: 20px;
              right: 20px;
              background: var(--orange-accent);
          }
      </style>
  </head>

  ---
  7.2 Section Étudiants manquante

  Symptôme : NOMS_STABLES.json liste "section-etudiants" mais elle n'existe pas
  dans le HTML

  Impact : Confusion, documentation incohérente

  Analyse :
  - La navigation principale n'a pas de bouton "Étudiants"
  - Le profil étudiant est dans Tableau de bord › Profil
  - Liste étudiants dans Réglages › Groupe

  Solution :
  - Soit ajouter une section Étudiants dédiée
  - Soit mettre à jour NOMS_STABLES.json pour refléter la réalité

  ---
  7.3 Taille du fichier (3351 lignes, 47k tokens)

  Symptôme : Fichier HTML très volumineux

  Impact :
  - Difficile à maintenir
  - Temps de chargement initial
  - Difficile à lire/éditer

  Solution recommandée :
  <!-- Extraire les sous-sections dans des fichiers partiels -->
  <!-- index.html (structure principale) -->
  <div id="section-tableau-bord" class="section">
      <!-- Charger dynamiquement -->
  </div>

  <!-- Fichiers séparés -->
  <!-- partials/tableau-bord-apercu.html -->
  <!-- partials/presences-saisie.html -->
  <!-- etc. -->

  <!-- Chargement dynamique via JavaScript -->
  <script>
  async function chargerSousSection(nom) {
      const response = await fetch(`partials/${nom}.html`);
      const html = await response.text();
      document.getElementById(nom).innerHTML = html;
  }
  </script>

  ⚠️ ATTENTION : Solution complexe, impacte l'architecture "100% autonome sans
  serveur"

  ---
  7.4 Modaux en fin de fichier

  Symptôme : Modaux (import/export) définis à la fin de la section Réglages

  Impact : Logique dispersée

  Solution recommandée :
  <!-- Regrouper tous les modaux en fin de <body> -->
  <body>
      <!-- Structure principale -->

      <!-- MODAUX (à la fin) -->
      <div id="modal-export" class="modal-overlay">...</div>
      <div id="modal-import" class="modal-overlay">...</div>
      <div id="modal-evaluation" class="modal-overlay">...</div>
      <!-- etc. -->
  </body>

  ---
  8. Règles de modification

  8.1 ⚠️ ZONES PROTÉGÉES - NE PAS MODIFIER

  IDs des sections et sous-sections

  <!-- NE PAS RENOMMER -->
  <section id="section-tableau-bord">
  <div id="tableau-bord-apercu">
  <div id="presences-saisie">
  <!-- etc. -->
  Raison : Référencés dans NOMS_STABLES.json et navigation.js

  Attributs data-*

  <!-- NE PAS RENOMMER -->
  <button data-onglet="tableau-bord">
  <button data-sous-onglet="presences-saisie">
  Raison : Lus par navigation.js

  IDs des conteneurs dynamiques

  <!-- NE PAS RENOMMER -->
  <tbody id="tbody-saisie-presences">
  <div id="contenuProfilEtudiant">
  <div id="calendrier-container">
  Raison : Cibles de innerHTML dans les modules JavaScript

  Ordre de chargement des scripts

  <!-- NE PAS MODIFIER L'ORDRE -->
  <script src="js/config.js"></script>
  <script src="js/navigation.js"></script>
  <!-- ... -->
  <script src="js/main.js"></script>
  Raison : Dépendances critiques

  ---
  8.2 ✅ ZONES MODIFIABLES

  Contenu des formulaires

  - Labels
  - Placeholders
  - Textes d'aide
  - Valeurs par défaut

  Styles inline

  - Ajuster padding, margin
  - Couleurs spécifiques
  - Tailles de police

  Textes et emojis

  - Titres de sections
  - Emojis dans les boutons
  - Messages d'aide

  Structure des cartes

  - Ajouter/supprimer des cartes statistiques
  - Réorganiser les éléments visuels

  ---
  8.3 Workflow de modification recommandé

  AVANT :
  1. ✅ Commit Git ou backup du fichier
  2. ✅ Vérifier NOMS_STABLES.json pour les IDs/classes à préserver
  3. ✅ Tester l'application actuelle

  PENDANT :
  1. ✅ Modifier uniquement les zones autorisées
  2. ✅ Respecter l'indentation (4 espaces)
  3. ✅ Commenter les changements importants
  4. ✅ Valider le HTML (W3C Validator)

  APRÈS :
  1. ✅ Tester toutes les sections/sous-sections
  2. ✅ Vérifier la console (aucune erreur)
  3. ✅ Tester responsive (mobile, tablette, desktop)
  4. ✅ Commit si succès, rollback si problème

  ---
  9. Historique et évolution

  Version Beta 0.71 (octobre 2025)

  État actuel : Application fonctionnelle avec 21 modules JavaScript

  Structure :
  - 4 sections principales
  - 19 sous-sections
  - 21 modules JavaScript chargés
  - ~3351 lignes HTML

  Fonctionnalités implémentées :
  - ✅ Navigation complète (sections/sous-sections)
  - ✅ Tableau de bord avec indices A-C-P
  - ✅ Saisie des présences avec verrouillage
  - ✅ Calendrier scolaire
  - ✅ Évaluations individuelles et liste
  - ✅ Configuration complète (10 sous-sections)
  - ✅ Import/Export JSON
  - ✅ 3 modes (Normal, Simulation, Anonymisation)

  Évolution depuis version 35

  Changements majeurs :
  - Refonte modulaire (21 modules au lieu de code monolithique)
  - Ajout sous-sections Réglages (de 3 à 10)
  - Ajout module modes.js
  - Ajout module portfolio.js
  - Séparation trimestre.js et calendrier-vue.js

  Évolution future possible

  1. Séparation HTML en composants :
    - Extraire les sous-sections dans des fichiers partiels
    - Chargement dynamique à la demande
  2. Migration vers framework :
    - Vue.js, React ou Alpine.js pour réactivité
    - Composants réutilisables
  3. PWA (Progressive Web App) :
    - Manifest.json
    - Service Worker pour offline
    - Installation sur mobile/desktop
  4. Optimisation :
    - Minification HTML
    - Lazy loading des sous-sections
    - Compression gzip

  ---
  10. Support et ressources

  10.1 Documentation liée

  - CLAUDE.md : Instructions générales
  - NOMS_STABLES.json : Registre des noms protégés
  - DOC_styles.css : Documentation du CSS
  - DOC_*.md : Documentation de chaque module JavaScript

  10.2 Validation et tests

  Validation HTML :
  - W3C Markup Validation Service
  - HTML5 Outliner (vérifier structure sémantique)

  Tests fonctionnels :
  1. Navigation entre sections/sous-sections
  2. Saisie et sauvegarde de données
  3. Import/export JSON
  4. Responsive design (mobile/tablette/desktop)
  5. Modes (Normal/Simulation/Anonymisation)

  Tests de compatibilité :
  - Safari (macOS, iOS)
  - Chrome (macOS, Windows, Android)
  - Firefox
  - Edge

  10.3 Outils de développement

  Éditeur recommandé :
  - Visual Studio Code avec extensions :
    - HTML CSS Support
    - Live Server
    - Prettier (formatage)

  Débogage :
  - Safari DevTools
  - Chrome DevTools
  - Console JavaScript (erreurs, warnings)

  10.4 Contact et licence

  Responsable : Grégoire Bédard
  Licence : Creative Commons BY-NC-SA 4.0
  - ✅ Partage et adaptation autorisés (usage non commercial)
  - ✅ Attribution requise
  - ✅ Redistribution sous même licence

  ---
  FIN DE LA DOCUMENTATION - index 71 (refonte des modules).html

  Dernière mise à jour : 23 octobre 2025
  Version : Beta 0.71 - Refonte modulaire

  ⚠️ RAPPELS CRITIQUES :
  1. L'ordre de chargement des scripts est VITAL
  2. Ne jamais renommer les IDs listés dans NOMS_STABLES.json
  3. Tester exhaustivement après toute modification
  4. Envisager la séparation en composants pour faciliter la maintenance