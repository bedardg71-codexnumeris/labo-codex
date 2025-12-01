Voici la documentation technique complète du module config.js :

  ---
  Module config.js

  Vue d'ensemble

  Module CONFIGURATION qui définit les constantes, variables globales et fonctions
   utilitaires partagées par toute l'application.

  ⚠️ MODULE STRICTEMENT PROTÉGÉ : Aucune modification du code autorisée (sauf
  commentaires). Ce module est le fondement architectural de l'application.

  Contenu :
  - Configuration de navigation : Définition de toutes les sections et
  sous-sections
  - Variables d'état global : Suivi de la navigation et du contexte actuel
  - Variables d'édition : Gestion des états de formulaires (productions,
  évaluations, grilles)
  - Données de démonstration : Liste d'étudiants fictifs pour développement
  - Fonction de sécurité : Protection XSS (echapperHtml())

  Principe fondamental : Ce module DOIT être chargé EN PREMIER. Tous les autres
  modules en dépendent.

  Type

  - SOURCE - Génère et stocke des données
  - LECTEUR - Lit et affiche des données
  - CONFIGURATION - Définit constantes et variables globales

  Données gérées

  Configuration de navigation (CONSTANTE)

  configurationsOnglets
  - Type : Object (constante immuable)
  - Structure : { 'section-id': [{ id: 'sous-section-id', label: 'Libellé' }] }
  - Usage : Définit TOUTES les sections et sous-sections de l'application

  Exemple :
  const configurationsOnglets = {
      'tableau-bord': [
          { id: 'apercu', label: 'Aperçu' },
          { id: 'liste', label: 'Liste des individus' },
          { id: 'profil', label: 'Profil' }
      ],
      'presences': [
          { id: 'apercu', label: 'Aperçu' },
          { id: 'calendrier', label: 'Vue calendaire' },
          { id: 'saisie', label: 'Saisie' }
      ]
      // ... autres sections
  };

  Sections définies :
  - 'tableau-bord' : 3 sous-sections (aperçu, liste, profil)
  - 'presences' : 3 sous-sections (aperçu, calendrier, saisie)
  - 'evaluations' : 3 sous-sections (aperçu, liste, individuelles)
  - 'reglages' : 10 sous-sections (aperçu, cours, trimestre, horaire, groupe,
  pratique-notation, productions, grille-criteres, echelle-performance,
  retroactions, import-export)

  Variables d'état global (MUTABLES)

  sectionActive
  - Type : String
  - Valeur initiale : 'tableau-bord'
  - Valeurs possibles : 'tableau-bord' | 'etudiants' | 'presences' | 'evaluations'
   | 'reglages'
  - Usage : Indique la section actuellement affichée

  sousSectionActive
  - Type : String | null
  - Valeur initiale : null
  - Format : 'section-sous-section' (ex: 'etudiants-liste',
  'reglages-productions')
  - Usage : Indique la sous-section actuellement affichée

  Variables d'édition (MUTABLES)

  productionEnEdition
  - Type : String | null
  - Usage : ID de la production en cours d'édition (null = création)

  evaluationEnCours
  - Type : Object | null
  - Structure : { etudiantId, productionId, grilleId, echelleId, cartoucheId, 
  criteres: {} }
  - Usage : Stocke temporairement l'évaluation en cours de saisie

  grilleActuelle
  - Type : Object | null
  - Structure : { id, nom, criteres: [...], dateCreation, baseSur }
  - Usage : Grille de critères en cours de création/modification

  grilleTemplateActuelle
  - Type : Object | null
  - Usage : Template de grille chargé pour duplication/modification

  cartoucheActuel
  - Type : Object | null
  - Structure : { id, nom, evalId, commentaires: {}, verrouille }
  - Usage : Cartouche de rétroaction en cours d'édition

  coursEnEdition
  - Type : String | null
  - Usage : ID du cours en cours d'édition (null = création)

  filtreGroupeMemoire
  - Type : String
  - Valeur initiale : ''
  - Usage : Conserve l'état du filtre de groupe entre les appels

  filtreTypeProductionMemoire
  - Type : String
  - Valeur initiale : ''
  - Usage : Conserve l'état du filtre de type de production

  Données de démonstration (CONSTANTE)

  listeEtudiants
  - Type : Array (constante)
  - Structure : [{ id, da, nom, prenom, statut }]
  - Usage : Étudiants fictifs pour développement et tests

  Exemple :
  const listeEtudiants = [
      { id: 1, da: '1234567', nom: 'Beaulieu', prenom: 'Emma', statut: 'actif' },
      { id: 2, da: '1234568', nom: 'Bélanger', prenom: 'Jacob', statut: 'actif' },
      // ... 7 étudiants au total
  ];

  Note : En production, ces données sont remplacées par
  localStorage.groupeEtudiants.

  API publique

  Fonction de sécurité

  echapperHtml(texte)
  Description : Échappe les caractères HTML pour prévenir les injections XSS.
  Fonction de sécurité CRITIQUE.

  Paramètres :
  - texte (String) : Texte à échapper

  Retour : (String) Texte échappé et sécurisé

  Fonctionnement :
  1. Crée un élément <div> temporaire
  2. Utilise textContent pour échapper automatiquement les caractères spéciaux
  3. Retourne le innerHTML sécurisé

  Conversions :
  - < → &lt;
  - > → &gt;
  - & → &amp;
  - " → &quot;
  - ' → &#39;

  Utilisation :
  // ✅ BON - Utiliser avant d'insérer du contenu utilisateur
  const nomEtudiant = echapperHtml(inputNom.value);
  div.innerHTML = `<strong>${nomEtudiant}</strong>`;

  // ❌ DANGEREUX - Injection XSS possible
  div.innerHTML = `<strong>${inputNom.value}</strong>`;

  // Exemple d'attaque bloquée
  echapperHtml('<script>alert("XSS")</script>');
  // Retourne : '&lt;script&gt;alert("XSS")&lt;/script&gt;'
  // Affichage : <script>alert("XSS")</script> (texte, pas exécution)

  Utilisé par :
  - Tous les modules qui affichent du contenu utilisateur (noms, prénoms, notes,
  commentaires)
  - saisie-presences.js (ligne 1293-1302)
  - tableau-bord-apercu.js (ligne 358-359)
  - Formulaires et zones de texte

  Variables globales (lecture/écriture)

  Accès en lecture :
  // Lire la section active
  console.log(sectionActive);  // "presences"

  // Lire la configuration
  console.log(configurationsOnglets['presences']);
  // [{ id: 'apercu', label: 'Aperçu' }, ...]

  Accès en écriture (réservé à navigation.js) :
  // Modifier la section active (UNIQUEMENT dans navigation.js)
  sectionActive = 'evaluations';

  // Modifier la sous-section active (UNIQUEMENT dans navigation.js)
  sousSectionActive = 'evaluations-liste';

  ⚠️ IMPORTANT : Ces variables ne doivent être modifiées QUE par navigation.js.
  Les autres modules doivent les lire uniquement.

  Dépendances

  Lit depuis :
  - Aucune (module autonome)

  Écrit dans :
  - Aucune (ne touche pas à localStorage)
  - Variables en mémoire uniquement

  Utilisé par (TOUS les modules) :
  - navigation.js - Lit configurationsOnglets, modifie sectionActive et
  sousSectionActive
  - etudiants.js - Lit listeEtudiants (données démo)
  - productions.js - Utilise productionEnEdition, evaluationEnCours
  - grilles.js - Utilise grilleActuelle, grilleTemplateActuelle
  - cartouches.js - Utilise cartoucheActuel
  - cours.js - Utilise coursEnEdition
  - saisie-presences.js - Utilise echapperHtml()
  - tableau-bord-apercu.js - Utilise echapperHtml()
  - Tous les autres modules - Utilisent au moins echapperHtml() ou lisent
  sectionActive

  Initialisation

  Fonction : Aucune (chargement automatique)

  Ordre de chargement : PREMIER module à charger

  Séquence :
  1. ✅ Chargement de config.js
  2. Définition des constantes (configurationsOnglets, listeEtudiants)
  3. Initialisation des variables globales (sectionActive, sousSectionActive,
  etc.)
  4. Définition de la fonction echapperHtml()
  5. Module prêt → Chargement des autres modules

  Ordre recommandé dans index.html :
  <script src="js/config.js"></script>           <!-- 1. PREMIER -->
  <script src="js/navigation.js"></script>       <!-- 2. Second -->
  <script src="js/main.js"></script>             <!-- 3. Troisième -->
  <!-- ... autres modules ... -->

  Structure de configurationsOnglets

  Tableau de bord (3 sous-sections)

  'tableau-bord': [
      { id: 'apercu', label: 'Aperçu' },
      { id: 'liste', label: 'Liste des individus' },
      { id: 'profil', label: 'Profil' }
  ]

  Présences (3 sous-sections)

  'presences': [
      { id: 'apercu', label: 'Aperçu' },
      { id: 'calendrier', label: 'Vue calendaire' },
      { id: 'saisie', label: 'Saisie' }
  ]

  Évaluations (3 sous-sections)

  'evaluations': [
      { id: 'apercu', label: 'Aperçu' },
      { id: 'liste', label: 'Liste des évaluations' },
      { id: 'individuelles', label: 'Procéder à une évaluation' }
  ]

  Réglages (10 sous-sections)

  'reglages': [
      { id: 'apercu', label: 'Aperçu' },
      { id: 'cours', label: 'Cours' },
      { id: 'trimestre', label: 'Trimestre' },
      { id: 'horaire', label: 'Horaire' },
      { id: 'groupe', label: 'Groupe' },
      { id: 'pratique-notation', label: 'Pratique de notation' },
      { id: 'productions', label: 'Productions' },
      { id: 'grille-criteres', label: 'Grilles de critères' },
      { id: 'echelle-performance', label: 'Échelle de performance' },
      { id: 'retroactions', label: 'Rétroactions' },
      { id: 'import-export', label: 'Import/Export' }
  ]

  Total : 4 sections, 19 sous-sections

  Tests

  Console navigateur

  // Vérifier disponibilité du module
  typeof echapperHtml === 'function'  // true
  typeof configurationsOnglets === 'object'  // true
  typeof sectionActive === 'string'  // true

  // Voir la configuration complète
  console.table(configurationsOnglets);

  // Voir les sections
  Object.keys(configurationsOnglets);
  // ["tableau-bord", "presences", "evaluations", "reglages"]

  // Compter les sous-sections
  Object.entries(configurationsOnglets).map(([section, sousections]) =>
      `${section}: ${sousections.length} sous-sections`
  );
  // ["tableau-bord: 3 sous-sections", "presences: 3 sous-sections", ...]

  // Voir l'état actuel
  console.log('Section active:', sectionActive);
  console.log('Sous-section active:', sousSectionActive);

  // Voir les données démo
  console.table(listeEtudiants);

  // Tester échappement HTML
  echapperHtml('<script>alert("test")</script>');
  // "&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;"

  echapperHtml("Jean-Paul <O'Brien>");
  // "Jean-Paul &lt;O&#39;Brien&gt;"

  Tests fonctionnels

  1. Test chargement module :
    - Ouvrir console navigateur
    - Vérifier : configurationsOnglets défini
    - Vérifier : echapperHtml disponible
    - Vérifier : Aucune erreur dans console
  2. Test navigation :
    - Cliquer sur "Présences"
    - Console : sectionActive devrait être "presences"
    - Console : sousSectionActive devrait être "presences-apercu" ou null
  3. Test sécurité XSS :
    - Ajouter étudiant avec nom : <script>alert('XSS')</script>
    - Vérifier : Texte affiché tel quel (pas d'exécution)
    - Inspecter HTML : Caractères échappés &lt;script&gt;
  4. Test données démo :
    - Vérifier : listeEtudiants contient 7 étudiants
    - Vérifier : Tous ont DA commençant par 1234567

  Utilisation de echapperHtml()

  Cas d'usage obligatoires

  ✅ À échapper TOUJOURS :
  - Noms et prénoms d'étudiants
  - Commentaires et notes de l'enseignant
  - Descriptions de productions
  - Motifs de congés
  - Tout texte saisi par l'utilisateur affiché en HTML

  ❌ À NE PAS échapper :
  - Contenu HTML généré par le code (boutons, structure)
  - Valeurs numériques (scores, pourcentages)
  - Dates formatées (déjà sécurisées)

  Exemples d'utilisation

  Cas 1 : Affichage dans un tableau :
  // ✅ BON
  tr.innerHTML = `
      <td>${echapperHtml(etudiant.da)}</td>
      <td>${echapperHtml(etudiant.prenom)}</td>
      <td>${echapperHtml(etudiant.nom)}</td>
  `;

  // ❌ DANGEREUX
  tr.innerHTML = `
      <td>${etudiant.da}</td>
      <td>${etudiant.prenom}</td>
      <td>${etudiant.nom}</td>
  `;

  Cas 2 : Affichage de commentaires :
  // ✅ BON
  const commentaire = echapperHtml(inputCommentaire.value);
  divCommentaire.innerHTML = `<p>${commentaire}</p>`;

  // ❌ DANGEREUX
  divCommentaire.innerHTML = `<p>${inputCommentaire.value}</p>`;

  Cas 3 : Attributs HTML :
  // ✅ BON
  const titre = echapperHtml(production.nom);
  button.setAttribute('title', titre);

  // Ou mieux : textContent (pas besoin d'échappement)
  button.textContent = production.nom;

  Variables d'édition - Cycle de vie

  Production en édition

  1. Création d'une nouvelle production :
  productionEnEdition = null;  // Indique création
  afficherFormProduction();    // Formulaire vide

  2. Modification d'une production existante :
  productionEnEdition = 'prod-123';  // ID de la production
  afficherFormProduction();          // Formulaire pré-rempli

  3. Sauvegarde :
  sauvegarderProduction();
  // Lit productionEnEdition pour savoir si création ou modification
  productionEnEdition = null;  // Réinitialisation après sauvegarde

  Évaluation en cours

  1. Démarrage évaluation :
  evaluationEnCours = {
      etudiantId: 'DA-2012345',
      productionId: 'prod-123',
      grilleId: 'grille-srpnf',
      echelleId: 'echelle-idme',
      cartoucheId: null,
      criteres: {}
  };

  2. Saisie des critères :
  evaluationEnCours.criteres['structure'] = 0.85;
  evaluationEnCours.criteres['rigueur'] = 0.90;
  // ... autres critères

  3. Sauvegarde :
  sauvegarderEvaluation();
  // Stocke evaluationEnCours dans localStorage.evaluationsSauvegardees
  evaluationEnCours = null;  // Réinitialisation

  Problèmes connus

  Aucun problème connu

  Ce module est stable et testé. Il n'a pas été modifié depuis la version initiale
   (index 50, 10-10-2025).

  Précautions importantes

  1. Ne JAMAIS modifier les noms de variables :
  - configurationsOnglets ❌ Ne pas renommer
  - sectionActive ❌ Ne pas renommer
  - echapperHtml ❌ Ne pas renommer
  - Tous référencés dans noms_stables.json

  2. Ne JAMAIS modifier la structure de configurationsOnglets :
  - Ajout de sous-sections → Demander clarification
  - Suppression de sous-sections → Impact sur navigation.js
  - Renommage d'IDs → Casse tous les liens

  3. Toujours utiliser echapperHtml() :
  - Oubli = Vulnérabilité XSS critique
  - Double échappement = Affichage incorrect (&amp;lt;)

  Règles de modification

  ⚠️ ZONES STRICTEMENT INTERDITES (code)

  TOUTES les zones de code sont interdites :
  - ❌ configurationsOnglets - Référencé dans noms_stables.json
  - ❌ Variables globales - Référencées dans noms_stables.json
  - ❌ echapperHtml() - Fonction de sécurité critique
  - ❌ listeEtudiants - Données de démo référencées

  Raison : Ce module est le fondement de l'application. Toute modification peut
  casser la navigation, la sécurité ou l'état global.

  ✅ ZONES MODIFIABLES (commentaires uniquement)

  Autorisé :
  - ✅ Ajouter des commentaires explicatifs
  - ✅ Améliorer la documentation JSDoc
  - ✅ Clarifier les exemples d'utilisation
  - ✅ Ajouter des notes de version

  Exemples autorisés :
  /**
   * AJOUT DE COMMENTAIRE - OK
   * Cette variable suit la section actuellement visible à l'écran.
   * Modifiée uniquement par navigation.js lors des clics utilisateur.
   * 
   * @example
   * // Vérifier quelle section est active
   * if (sectionActive === 'presences') {
   *     console.log('Section présences visible');
   * }
   */
  let sectionActive = 'tableau-bord';

  Procédure pour ajout de sous-section

  Si besoin d'ajouter une sous-section (rare) :

  1. ❌ NE PAS modifier config.js directement
  2. ✅ Documenter le besoin dans un issue/commentaire
  3. ✅ Obtenir validation de l'architecture
  4. ✅ Mettre à jour noms_stables.json AVANT
  5. ✅ Puis modifier configurationsOnglets
  6. ✅ Créer l'élément HTML correspondant
  7. ✅ Tester navigation complète

  Historique

  - Version initiale (index 50, 10-10-2025) :
    - Création du module de configuration
    - Définition de configurationsOnglets (4 sections, 19 sous-sections)
    - Variables d'état global (sectionActive, sousSectionActive)
    - Variables d'édition (productions, évaluations, grilles, cartouches)
    - Données de démonstration (7 étudiants)
    - Fonction de sécurité echapperHtml()
    - Documentation complète JSDoc
  - Depuis création : Aucune modification du code (module stable et protégé)

  ---
  Référence code : /js/config.js (261 lignes)

  Modules liés : TOUS les modules dépendent de config.js

  Statut : ⚠️ MODULE PROTÉGÉ - Référencé dans noms_stables.json