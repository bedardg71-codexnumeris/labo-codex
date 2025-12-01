Voici la documentation technique complète du module navigation.js :

  ---
  Module navigation.js

  Vue d'ensemble

  Module SYSTÈME qui gère la navigation entre les sections principales et
  sous-sections de l'application.

  ⚠️ MODULE STRICTEMENT PROTÉGÉ : Interdiction de modifier les noms de fonctions,
  identifiants CSS et attributs data-*. Seuls les commentaires peuvent être
  modifiés.

  Responsabilités :
  - Affichage des sections principales : Tableau de bord, Présences, Évaluations,
  Réglages
  - Génération de la sous-navigation : Création dynamique des boutons à partir de
  configurationsOnglets
  - Affichage des sous-sections : Gestion de la visibilité et de l'état actif
  - Rafraîchissement automatique : Appel des fonctions d'initialisation lors des
  changements de vue
  - Mise à jour de l'état global : Modification de sectionActive et
  sousSectionActive

  Principe fondamental : Ce module est le chef d'orchestre de l'interface. Il ne
  contient aucune logique métier, uniquement la gestion de l'affichage et de
  l'état de navigation.

  Type

  - SOURCE - Génère et stocke des données
  - LECTEUR - Lit et affiche des données
  - CONFIGURATION - Définit constantes et variables globales
  - SYSTÈME - Gestion de la navigation et de l'état de l'interface

  Données gérées

  Variables modifiées (depuis config.js)

  sectionActive (lecture/écriture)
  - Définie dans : config.js
  - Modifiée par : afficherSection()
  - Valeurs : 'tableau-bord' | 'etudiants' | 'presences' | 'evaluations' |
  'reglages'
  - Usage : Indique la section actuellement visible

  sousSectionActive (lecture/écriture)
  - Définie dans : config.js
  - Modifiée par : afficherSousNavigation() et afficherSousSection()
  - Valeurs : 'section-sous-section' (ex: 'presences-saisie') ou null
  - Usage : Indique la sous-section actuellement visible

  Configuration lue (depuis config.js)

  configurationsOnglets (lecture seule)
  - Définie dans : config.js
  - Lue par : afficherSousNavigation()
  - Usage : Détermine quelles sous-sections afficher pour chaque section

  API publique

  Navigation principale

  afficherSection(nomSection)
  Description : Affiche une section principale et met à jour l'état de navigation.
   Fonction centrale de la navigation de premier niveau.

  Paramètres :
  - nomSection (String) : Identifiant de la section
    - Valeurs : 'tableau-bord' | 'etudiants' | 'presences' | 'evaluations' |
  'reglages'

  Retour : void

  Séquence d'exécution :
  1. Masque toutes les sections (retire .active)
  2. Désactive tous les boutons de navigation (retire .actif)
  3. Affiche la section demandée (ajoute .active sur #section-{nomSection})
  4. Active le bouton correspondant (ajoute .actif sur
  button[data-onglet="{nomSection}"])
  5. Met à jour sectionActive = nomSection
  6. Appelle afficherSousNavigation(nomSection)

  Utilisation :
  // Navigation vers la section Présences
  afficherSection('presences');
  // → Affiche #section-presences
  // → Active le bouton [data-onglet="presences"]
  // → Génère la sous-navigation (Aperçu, Vue calendaire, Saisie)
  // → Affiche automatiquement la première sous-section (Aperçu)

  // Depuis un bouton HTML
  <button onclick="afficherSection('evaluations')">Évaluations</button>

  Sous-navigation

  afficherSousNavigation(nomOnglet)
  Description : Génère et affiche les boutons de sous-navigation pour une section
  donnée. Crée le HTML dynamiquement à partir de configurationsOnglets.

  Paramètres :
  - nomOnglet (String) : Identifiant de la section parent
    - Valeurs : 'tableau-bord' | 'presences' | 'evaluations' | 'reglages'

  Retour : void

  Séquence d'exécution :
  1. Lit configurationsOnglets[nomOnglet]
  2. CAS 1 : Aucune sous-section → Affiche message "Pas de sous-sections",
  sousSectionActive = null
  3. CAS 2 : Sous-sections existent :
    - Génère le HTML des boutons avec data-sous-onglet="{nomOnglet}-{id}"
    - Active le premier bouton (classe .actif)
    - Attache les événements click sur chaque bouton
    - Appelle afficherSousSection() pour la première sous-section

  HTML généré :
  <!-- Pour afficherSousNavigation('presences') -->
  <button data-sous-onglet="presences-apercu" class="actif">Aperçu</button>
  <button data-sous-onglet="presences-calendrier">Vue calendaire</button>
  <button data-sous-onglet="presences-saisie">Saisie</button>

  Utilisation :
  // Appelée automatiquement par afficherSection()
  afficherSousNavigation('presences');
  // → Génère 3 boutons de sous-navigation
  // → Affiche automatiquement 'presences-apercu' (premier par défaut)

  Affichage de sous-section

  afficherSousSection(idSousSection)
  Description : Affiche une sous-section spécifique et met à jour l'état des
  boutons. Fonction centrale de la navigation de second niveau.

  Paramètres :
  - idSousSection (String) : Identifiant complet de la sous-section
    - Format : '{section}-{sous-section}'
    - Exemples : 'presences-saisie', 'reglages-productions', 'tableau-bord-apercu'

  Retour : void

  Séquence d'exécution :
  1. Extrait la section parente depuis l'ID (gestion spéciale pour 'tableau-bord')
  2. Masque TOUTES les sous-sections (retire .active sur tous .sous-section)
  3. Affiche la sous-section demandée (ajoute .active sur #{idSousSection})
  4. Met à jour sousSectionActive = idSousSection
  5. Active le bouton correspondant (retire .actif de tous, ajoute .actif au bon)
  6. Rafraîchissement automatique : Appelle la fonction d'initialisation du module
   (via switch)

  Cas spéciaux de rafraîchissement :
  | Sous-section         | Fonction appelée                                     |
  Délai    |
  |----------------------|------------------------------------------------------|-
  ---------|
  | tableau-bord-apercu  | chargerTableauBordApercu()                           |
  150ms    |
  | tableau-bord-liste   | rechargerListeEtudiants() ou chargerListeEtudiants() |
  100ms    |
  | presences-calendrier | afficherCalendrierScolaire()                         |
  Immédiat |
  | reglages-productions | initialiserModuleProductions()                       |
  Immédiat |
  | reglages-trimestre   | initialiserModuleTrimestre()                         |
  Immédiat |
  | evaluations-liste    | chargerListeEvaluationsRefonte()                     |
  100ms    |
  | reglages-apercu      | chargerStatistiquesApercu()                          |
  Immédiat |

  Utilisation :
  // Navigation vers la saisie des présences
  afficherSousSection('presences-saisie');
  // → Masque toutes les sous-sections
  // → Affiche #presences-saisie
  // → Active le bouton [data-sous-onglet="presences-saisie"]
  // → (Pas de rafraîchissement spécifique pour cette sous-section)

  // Depuis un bouton HTML
  <button onclick="afficherSousSection('reglages-trimestre')">Trimestre</button>
  // → Appelle automatiquement initialiserModuleTrimestre()

  Dépendances

  Lit depuis (config.js) :
  - configurationsOnglets (lecture seule)
  - sectionActive (lecture/écriture)
  - sousSectionActive (lecture/écriture)

  Appelle (fonctions externes) :
  - chargerTableauBordApercu() depuis tableau-bord-apercu.js
  - rechargerListeEtudiants() / chargerListeEtudiants() depuis module liste
  étudiants
  - afficherCalendrierScolaire() depuis calendrier-vue.js
  - initialiserModuleProductions() depuis productions.js
  - initialiserModuleTrimestre() depuis trimestre.js
  - chargerListeEvaluationsRefonte() depuis module évaluations
  - chargerStatistiquesApercu() depuis module réglages

  Utilisé par (TOUS les modules) :
  - Boutons de navigation principale (HTML)
  - Boutons de sous-navigation (générés dynamiquement)
  - main.js - Initialise la navigation au chargement
  - Tous modules appelant afficherSection() ou afficherSousSection()
  programmatiquement

  Modules requis (chargement avant) :
  - config.js - Variables globales et configuration

  Initialisation

  Fonction : Aucune (les fonctions sont appelées par événements)

  Ordre de chargement : APRÈS config.js, AVANT tous les modules fonctionnels

  Initialisation requise (dans main.js) :
  // 1. Attacher événements sur navigation principale
  document.querySelectorAll('.navigation-principale button').forEach(bouton => {
      bouton.addEventListener('click', function() {
          const section = this.getAttribute('data-onglet');
          afficherSection(section);
      });
  });

  // 2. Afficher la section par défaut
  afficherSection('tableau-bord');
  // → Affiche tableau-bord-apercu par défaut

  Séquence au chargement de la page :
  1. Chargement de config.js → configurationsOnglets disponible
  2. Chargement de navigation.js → Fonctions disponibles
  3. Chargement de main.js → Attache événements
  4. afficherSection('tableau-bord') appelée
  5. afficherSousNavigation('tableau-bord') appelée
  6. afficherSousSection('tableau-bord-apercu') appelée
  7. chargerTableauBordApercu() appelée (rafraîchissement)

  Structure HTML requise

  Navigation principale

  <nav class="navigation-principale">
      <button data-onglet="tableau-bord">📊 Tableau de bord</button>
      <button data-onglet="presences">📅 Présences</button>
      <button data-onglet="evaluations">📝 Évaluations</button>
      <button data-onglet="reglages">⚙️ Réglages</button>
  </nav>

  Attributs requis :
  - data-onglet : Identifiant de la section (correspond aux clés de
  configurationsOnglets)

  Conteneur de sous-navigation

  <div id="sous-navigation" class="sous-navigation">
      <!-- Généré dynamiquement par afficherSousNavigation() -->
  </div>

  États :
  - class="sous-navigation" : Contient des sous-sections
  - class="sous-navigation vide" : Aucune sous-section (message affiché)

  Sections

  <section id="section-presences" class="section">
      <!-- Contenu de la section -->

      <div id="presences-apercu" class="sous-section">
          <!-- Contenu de la sous-section Aperçu -->
      </div>

      <div id="presences-calendrier" class="sous-section">
          <!-- Contenu de la sous-section Vue calendaire -->
      </div>

      <div id="presences-saisie" class="sous-section">
          <!-- Contenu de la sous-section Saisie -->
      </div>
  </section>

  Identifiants requis :
  - Section : id="section-{nomSection}"
  - Sous-section : id="{nomSection}-{idSousSection}"

  Classes requises :
  - .section : Conteneur de section principale
  - .sous-section : Conteneur de sous-section
  - .active : Indique l'élément visible (ajouté dynamiquement)

  Gestion du cas "tableau-bord"

  Problème : 'tableau-bord' contient un tiret, ce qui complique le parsing.

  Solution (lignes 220-226) :
  const parties = idSousSection.split('-');
  let section;
  if (parties.length > 2 && parties[0] === 'tableau') {
      section = parties[0] + '-' + parties[1];  // "tableau-bord"
  } else {
      section = parties[0];  // "presences", "evaluations", etc.
  }

  Exemples :
  - 'tableau-bord-apercu' → Section : 'tableau-bord'
  - 'presences-saisie' → Section : 'presences'
  - 'reglages-pratique-notation' → Section : 'reglages' (le reste est ignoré)

  Système de rafraîchissement automatique

  Objectif : Recharger les données quand l'utilisateur revient sur une
  sous-section.

  Mécanisme : switch statement (lignes 271-336)

  Pourquoi des délais (setTimeout) ?
  - 100ms ou 150ms : Laisse le temps au DOM de se mettre à jour avant de charger
  les données
  - Sans délai : Risque de lire des éléments DOM pas encore affichés

  Exemples :

  Cas 1 : Rafraîchissement immédiat :
  case 'presences-calendrier':
      if (typeof afficherCalendrierScolaire === 'function') {
          afficherCalendrierScolaire();  // Immédiat
      }
      break;

  Cas 2 : Rafraîchissement avec délai :
  if (idSousSection === 'tableau-bord-apercu') {
      if (typeof chargerTableauBordApercu === 'function') {
          setTimeout(() => chargerTableauBordApercu(), 150);  // 150ms de délai
      }
  }

  Ajout de nouvelles sous-sections :
  // Ajouter dans le switch (lignes 271-311)
  case 'ma-nouvelle-sous-section':
      if (typeof maFonctionInitialisation === 'function') {
          maFonctionInitialisation();
      }
      break;

  Tests

  Console navigateur

  // Vérifier disponibilité des fonctions
  typeof afficherSection === 'function'  // true
  typeof afficherSousNavigation === 'function'  // true
  typeof afficherSousSection === 'function'  // true

  // Voir l'état actuel
  console.log('Section active:', sectionActive);  // "presences"
  console.log('Sous-section active:', sousSectionActive);  // "presences-saisie"

  // Tester la navigation
  afficherSection('evaluations');
  // Console affiche : logs de débogage

  // Tester changement de sous-section
  afficherSousSection('evaluations-liste');
  // Console affiche : 🔵 afficherSousSection appelée avec: evaluations-liste
  //                   Section: evaluations
  //                   Nombre de boutons trouvés: 3
  //                   ...

  // Vérifier qu'un élément est visible
  document.getElementById('presences-saisie').classList.contains('active')  // 
  true ou false

  // Vérifier qu'un bouton est actif
  document.querySelector('button[data-onglet="presences"]').classList.contains('ac
  tif')  // true ou false

  Tests fonctionnels

  1. Test navigation principale :
    - Cliquer sur "Présences"
    - Vérifier : Section Présences visible
    - Vérifier : Bouton "Présences" actif (surligné)
    - Vérifier : Sous-navigation affichée (3 boutons)
    - Vérifier : Console : sectionActive === 'presences'
  2. Test sous-navigation :
    - Dans Présences, cliquer "Saisie"
    - Vérifier : Sous-section Saisie visible
    - Vérifier : Bouton "Saisie" actif
    - Vérifier : Console : sousSectionActive === 'presences-saisie'
  3. Test rafraîchissement automatique :
    - Saisir présences pour une date
    - Aller dans Tableau de bord → Aperçu
    - Vérifier : Console affiche "🔄 Rechargement automatique de l'aperçu..."
    - Vérifier : Statistiques mises à jour (indices A affichés)
  4. Test changement de section :
    - Être dans Présences → Saisie
    - Cliquer sur "Réglages"
    - Vérifier : Présences masquée
    - Vérifier : Réglages visible
    - Vérifier : Nouvelle sous-navigation (10 boutons)
    - Vérifier : Première sous-section (Aperçu) affichée
  5. Test boutons désactivés :
    - Aller dans Présences → Aperçu
    - Vérifier : Boutons "Vue calendaire" et "Saisie" cliquables
    - Vérifier : Bouton "Aperçu" actif (style différent)
  6. Test cas "tableau-bord" :
    - Cliquer "Tableau de bord"
    - Vérifier : 3 sous-sections (Aperçu, Liste, Profil)
    - Cliquer "Profil"
    - Console : Section extraite correctement ('tableau-bord', pas 'tableau')
  7. Test logs de débogage :
    - Ouvrir console
    - Naviguer entre sous-sections
    - Vérifier : Logs affichés avec 🔵, ✅, ⚠️
    - Vérifier : Aucun ❌ (erreurs)

  Logs de débogage

  Le module inclut des console.log détaillés pour faciliter le débogage :

  Symboles utilisés :
  - 🔵 : Entrée de fonction
  - ✅ : Succès d'une opération
  - ⚠️ : Avertissement (pas critique)
  - ❌ : Erreur (élément introuvable)
  - 🔄 : Rafraîchissement en cours

  Exemple de logs :
  🔵 afficherSousSection appelée avec: presences-saisie
     Section: presences
     Nombre de boutons trouvés: 3
     Bouton data-sous-onglet: presences-apercu
     Bouton data-sous-onglet: presences-calendrier
     Bouton data-sous-onglet: presences-saisie
     ✅ Bouton activé
     ✅ Sous-section affichée

  Désactivation en production (optionnel) :
  // Remplacer tous les console.log par:
  // console.log(...);  // DEBUG

  Problèmes connus

  Duplication de code (lignes 314-336)

  Symptôme : Code dupliqué pour le rafraîchissement de tableau-bord-apercu

  Cause : Évolution du code, ajouts successifs

  Impact : Aucun (la fonction est appelée deux fois avec délai identique)

  Solution future : Nettoyer les duplications en regroupant dans le switch

  Sous-section ne s'affiche pas

  Cause : Identifiant HTML incorrect ou manquant

  Diagnostic :
  // Console affichera : ❌ Sous-section introuvable: presences-xyz

  Solution : Vérifier que <div id="presences-xyz" class="sous-section"> existe
  dans le HTML

  Bouton ne s'active pas

  Cause : Attribut data-sous-onglet incorrect ou manquant

  Diagnostic :
  // Console affichera : ⚠️ Aucun bouton correspondant trouvé pour: 
  presences-saisie

  Solution : Vérifier que le bouton généré a bien
  data-sous-onglet="presences-saisie"

  Module ne se rafraîchit pas

  Cause : Fonction d'initialisation non définie ou nom incorrect

  Diagnostic :
  // Vérifier dans console
  typeof chargerTableauBordApercu === 'function'  // false = fonction pas chargée

  Solution :
  1. Vérifier que le module est chargé avant navigation.js dans l'ordre des
  scripts
  2. Vérifier le nom exact de la fonction
  3. Ajouter un cas dans le switch si sous-section non gérée

  Règles de modification

  ⚠️ ZONES STRICTEMENT INTERDITES (code)

  Noms de fonctions :
  - ❌ afficherSection - Référencé dans noms_stables.json et appelé partout
  - ❌ afficherSousNavigation - Référencé dans noms_stables.json
  - ❌ afficherSousSection - Référencé dans noms_stables.json et appelé partout

  Attributs HTML :
  - ❌ data-onglet - Utilisé pour identifier les sections
  - ❌ data-sous-onglet - Utilisé pour identifier les sous-sections

  Classes CSS :
  - ❌ .active - Indique la visibilité
  - ❌ .actif - Indique le bouton actif
  - ❌ .sous-navigation - Conteneur de sous-navigation
  - ❌ .vide - État vide de la sous-navigation

  Identifiants :
  - ❌ #sous-navigation - Conteneur principal
  - ❌ #section-{nom} - Format des sections
  - ❌ {section}-{sous-section} - Format des sous-sections

  Raison : Toute modification casse la navigation globale de l'application.

  ✅ ZONES MODIFIABLES

  Commentaires :
  - ✅ Ajouter des commentaires explicatifs
  - ✅ Améliorer la documentation JSDoc
  - ✅ Clarifier les exemples

  Logs de débogage :
  - ✅ Ajouter des console.log supplémentaires
  - ✅ Modifier les emojis de logs
  - ✅ Commenter les logs en production

  Rafraîchissements :
  - ✅ Ajouter des cas dans le switch (lignes 271-311)
  - ✅ Modifier les délais setTimeout si nécessaire
  - ✅ Ajouter des vérifications typeof fonction === 'function'

  Exemple d'ajout autorisé :
  // ✅ AUTORISÉ - Ajouter un cas de rafraîchissement
  case 'presences-apercu':
      console.log('🔄 Rafraîchissement de l\'aperçu des présences...');
      if (typeof chargerApercuPresences === 'function') {
          setTimeout(() => chargerApercuPresences(), 100);
      }
      break;

  Historique

  - Version initiale (index 50, 10-10-2025) :
    - Création du module de navigation
    - 3 fonctions principales : afficherSection(), afficherSousNavigation(),
  afficherSousSection()
    - Génération dynamique de la sous-navigation depuis configurationsOnglets
    - Gestion de l'état global (sectionActive, sousSectionActive)
  - Modularisation (10-10-2025a) :
    - Ajout du système de rafraîchissement automatique
    - Support de tableau-bord (cas spécial avec tiret)
    - Ajout des logs de débogage détaillés
    - Gestion des délais pour rafraîchissement
  - Évolution continue :
    - Ajout progressif de cas de rafraîchissement selon les modules créés
    - Duplication de code (à nettoyer)
  - Depuis création : Noms de fonctions et structure stable (module protégé)

  ---
  Référence code : /js/navigation.js (375 lignes)

  Modules liés : TOUS les modules (navigation utilisée partout)

  Statut : ⚠️ MODULE PROTÉGÉ - Référencé dans noms_stables.json