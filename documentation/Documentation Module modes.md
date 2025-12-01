Je vais générer la documentation complète pour modes.js.

  ---
  MODULE modes.js

  📚 Documentation technique complète

  ---
  1. Vue d'ensemble

  modes.js gère les trois modes d'affichage de l'application : Normal (données
  réelles), Simulation (données fictives), et Anonymisation (noms anonymisés,
  lecture seule). Ce module fournit l'API centrale utilisée par TOUS les modules
  pour lire/écrire des données.

  Lignes de code : 605 lignesVersion : Module 17Fichier : /js/modes.js

  ---
  2. Type de module

  SYSTÈME : Module transversal critique qui gère l'infrastructure de données.

  Rôle : Fournit les fonctions centrales obtenirDonneesSelonMode() et
  sauvegarderDonneesSelonMode() qui doivent remplacer TOUS les appels directs à
  localStorage.getItem() et localStorage.setItem().

  ---
  3. Les trois modes d'application

  3.1 Mode Normal

  Constante : MODES.NORMAL ('normal')

  Fonctionnement :
  - Affiche les données réelles
  - Lecture/écriture autorisées
  - Thème : Bleu principal (#032e5c)
  - Aucun bandeau affiché

  Utilisation : Utilisation quotidienne par l'enseignant

  ---
  3.2 Mode Simulation

  Constante : MODES.SIMULATION ('simulation')

  Fonctionnement :
  - Affiche des données fictives générées automatiquement
  - Lecture/écriture autorisées (sur les données fictives)
  - Les données réelles ne sont JAMAIS modifiées
  - Thème : Mauve (#0f1e3a)
  - Bandeau en bas : "MODE SIMULATION - Les identités affichées sont fictives"

  Données générées :
  - 30 étudiants fictifs (noms québécois réalistes)
  - Évaluations fictives avec distribution normale (moyenne 70-85%)
  - Groupe : "99SIM"

  Clés localStorage utilisées :
  - simulation_etudiants (au lieu de groupeEtudiants)
  - simulation_evaluations (au lieu de evaluationsSauvegardees)
  - simulation_presences (au lieu de presences)

  Utilisation : Démonstrations, formations, captures d'écran pour documentation

  ---
  3.3 Mode Anonymisation

  Constante : MODES.ANONYMISATION ('anonymisation')

  Fonctionnement :
  - Affiche les données réelles avec noms anonymisés
  - LECTURE SEULE : Toute écriture est bloquée
  - Mapping persistant (même étudiant → même pseudonyme)
  - Thème : Vert (#1a5266)
  - Bandeau en bas : "MODE ANONYMISATION - Les identités affichées sont
  anonymisées"

  Mapping d'anonymisation :
  {
    "1234567": {
      nom: "Tremblay",
      prenom: "Olivier",
      nomComplet: "Olivier Tremblay"
    }
  }

  Sauvegardé dans : mapping_anonymisation

  Utilisation : Partage d'écran en visioconférence, captures d'écran pour
  publications

  ---
  4. Données gérées

  4.1 Données générées (SOURCE)

  A) simulation_etudiants

  Type : Array d'étudiants fictifsFormat localStorage : JSON stringifié

  Structure :
  [
    {
      id: 1729785600001,
      da: "2345678",
      nom: "Tremblay",
      prenom: "Olivier",
      groupe: "99SIM"
    },
    // ... 29 autres étudiants
  ]

  Source unique : modes.js (fonction genererDonneesSimulation())

  ---
  B) simulation_evaluations

  Type : Array d'évaluations fictivesFormat localStorage : JSON stringifié

  Structure :
  [
    {
      id: "EVAL_SIM_1729785600000_2345678_0",
      etudiantDA: "2345678",
      etudiantNom: "Olivier Tremblay",
      groupe: "99SIM",
      productionId: "PROD_001",
      productionNom: "Analyse littéraire 1",
      grilleId: "GRILLE_001",
      grilleNom: "Global-4",
      dateEvaluation: "2025-10-15T08:30:00.000Z",
      statutRemise: "remis",
      criteres: [],
      noteFinale: 78.5,
      niveauFinal: "M",
      retroactionFinale: "Rétroaction générée automatiquement pour Olivier."
    }
  ]

  Distribution des notes : Normale, moyenne 70-85%, écart-type 8

  Source unique : modes.js (fonction genererDonneesSimulation())

  ---
  C) mapping_anonymisation

  Type : Objet de mapping DA → pseudonymeFormat localStorage : JSON stringifié

  Structure :
  {
    "1234567": {
      nom: "Tremblay",
      prenom: "Olivier",
      nomComplet: "Olivier Tremblay"
    },
    "2345678": {
      nom: "Gagnon",
      prenom: "Emma",
      nomComplet: "Emma Gagnon"
    }
  }

  Caractéristiques :
  - Persistant : Même DA → même pseudonyme lors de sessions ultérieures
  - Unique : Pas de collision de noms
  - Réaliste : Noms québécois courants

  Source unique : modes.js (fonction genererMappingAnonyme())

  ---
  4.2 Données lues

  | Clé localStorage        | Source                 | Usage
                            |
  |-------------------------|------------------------|----------------------------
  --------------------------|
  | modeApplication         | Sauvegarde utilisateur | Mode actif ('normal',
  'simulation', 'anonymisation') |
  | groupeEtudiants         | groupe.js              | Données réelles en mode
  Normal/Anonymisation         |
  | evaluationsSauvegardees | evaluation.js          | Données réelles en mode
  Normal/Anonymisation         |
  | listeGrilles            | productions.js         | Productions pour génération
   simulation               |

  ---
  5. API publique

  5.1 Fonctions centrales (CRITIQUES)

  obtenirDonneesSelonMode(cle)

  Fonction la plus importante du module - Remplace localStorage.getItem().

  const etudiants = obtenirDonneesSelonMode('groupeEtudiants')
  const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees')

  Fonctionnement :
  Si mode SIMULATION:
    → Cherche "simulation_{cle}" (ex: simulation_etudiants)
    → Si trouvé, retourne les données fictives
    → Sinon, fallback sur données réelles

  Si mode ANONYMISATION:
    → Lit les données réelles
    → Applique anonymiserDonnees(cle, donnees)
    → Retourne données anonymisées

  Si mode NORMAL:
    → Lit et retourne les données réelles directement

  Paramètres :
  - cle (string) : Clé localStorage (ex: 'groupeEtudiants',
  'evaluationsSauvegardees', 'presences')

  Retour : Array ou Object selon la clé

  Utilisée par : TOUS les modules qui lisent des données

  ---
  sauvegarderDonneesSelonMode(cle, donnees)

  Remplace localStorage.setItem().

  const succes = sauvegarderDonneesSelonMode('groupeEtudiants', etudiants)
  if (!succes) {
    afficherNotificationErreur('Sauvegarde bloquée', 'Impossible en mode 
  anonymisation')
  }

  Fonctionnement :
  Si mode ANONYMISATION:
    → BLOQUE la sauvegarde
    → Retourne false
    → Log warning

  Si mode SIMULATION:
    → Redirige vers "simulation_{cle}"
    → Sauvegarde dans la clé simulation
    → Retourne true

  Si mode NORMAL:
    → Sauvegarde normalement
    → Retourne true

  Paramètres :
  - cle (string) : Clé localStorage
  - donnees (any) : Données à sauvegarder

  Retour : true si succès, false si bloqué

  Protection : Empêche la modification des données réelles en mode Anonymisation

  ---
  5.2 Fonctions de gestion des modes

  initialiserSystemeModes()

  Initialise le système de modes au chargement.

  initialiserSystemeModes()

  Fonctionnement :
  1. Récupère le mode sauvegardé (localStorage.modeApplication)
  2. Applique le thème visuel
  3. Crée le sélecteur de mode dans l'en-tête
  4. Affiche le mode actif dans la console

  Appelée par : main.js (ligne 169)

  ---
  changerMode(nouveauMode)

  Change le mode actif (sans recharger la page).

  changerMode(MODES.SIMULATION)

  Fonctionnement :
  1. Sauvegarde le nouveau mode dans localStorage
  2. Applique le nouveau thème
  3. Met à jour le sélecteur
  4. Génère les données de simulation si nécessaire
  5. Rafraîchit le contenu affiché
  6. Dispatch l'événement modeChanged

  Paramètres :
  - nouveauMode (string) : Un des 3 modes ('normal', 'simulation',
  'anonymisation')

  Événement : window.dispatchEvent(new CustomEvent('modeChanged', {detail: 
  {mode}}))

  ---
  rafraichirContenuSelonMode()

  Rafraîchit le contenu sans recharger la page.

  rafraichirContenuSelonMode()

  Fonctionnement :
  1. Sauvegarde la sous-section active
  2. Dispatch l'événement modeChanged
  3. Identifie le module à rafraîchir via mapping
  4. Appelle la fonction de rafraîchissement correspondante

  Mapping des modules :
  {
    'reglages-groupe': 'afficherListeEtudiants',
    'etudiants-liste': 'afficherListeEtudiantsConsultation',
    'evaluations-liste-evaluations': 'chargerListeEvaluationsRefonte'
  }

  Appelée par : changerMode()

  ---
  5.3 Fonctions d'anonymisation

  genererMappingAnonyme()

  Génère ou récupère le mapping d'anonymisation.

  const mapping = genererMappingAnonyme()
  // Retourne : { "1234567": {nom, prenom, nomComplet}, ... }

  Fonctionnement :
  1. Vérifie si mapping existe déjà dans localStorage
  2. Si oui, le retourne
  3. Sinon, génère un nouveau mapping :
    - Pour chaque étudiant réel
    - Tire au hasard nom + prénom dans les listes
    - Garantit l'unicité des combinaisons
    - Sauvegarde le mapping

  Persistance : Une fois généré, le mapping reste identique

  ---
  anonymiserNom(da)

  Anonymise un nom d'étudiant spécifique.

  const nomAnonyme = anonymiserNom("1234567")
  // Retourne : "Olivier Tremblay" (si mode anonymisation)
  // Retourne : null (si autre mode)

  Utilisation : Affichage ponctuel d'un nom anonymisé

  ---
  anonymiserDonnees(cle, donnees)

  Anonymise un ensemble de données selon leur type.

  const etudiantsAnonymes = anonymiserDonnees('groupeEtudiants', etudiants)

  Types supportés :
  - groupeEtudiants : Anonymise nom + prénom
  - evaluationsSauvegardees : Anonymise etudiantNom
  - presences : Anonymise nom + prénom

  Appelée par : obtenirDonneesSelonMode() en mode anonymisation

  ---
  5.4 Fonctions de simulation

  verifierDonnesSimulation()

  Vérifie si les données de simulation existent.

  verifierDonnesSimulation()

  Fonctionnement :
  - Si simulation_evaluations existe → ne fait rien
  - Sinon → appelle genererDonneesSimulation()

  Appelée par : changerMode() lors du passage en mode Simulation

  ---
  genererDonneesSimulation()

  Génère des données fictives réalistes.

  genererDonneesSimulation()

  Génération :
  1. 30 étudiants fictifs :
    - Noms/prénoms tirés de listes québécoises
    - DA aléatoires (7 chiffres)
    - Groupe "99SIM"
  2. Évaluations fictives :
    - Pour chaque étudiant × chaque artefact
    - Notes selon distribution normale (moyenne 70-85%, écart-type 8)
    - Conversion en niveaux IDME (I < 60%, D 60-69%, M 70-84%, E ≥ 85%)
    - Dates aléatoires (derniers 30 jours)

  Sauvegarde :
  - simulation_etudiants : 30 étudiants
  - simulation_evaluations : ~nombre d'artefacts × 30 évaluations

  ---
  5.5 Fonctions utilitaires

  estModeeLectureSeule()

  Vérifie si le mode actuel est en lecture seule.

  if (estModeeLectureSeule()) {
    afficherMessage('Modification impossible en mode anonymisation')
    return
  }

  Retour : true si mode Anonymisation, false sinon

  Utilisation : Désactiver les boutons d'édition/suppression

  ---
  appliquerTheme(mode)

  Applique le thème visuel selon le mode.

  appliquerTheme(MODES.SIMULATION)

  Effets :
  1. Ajoute l'attribut data-mode au body
  2. Supprime le bandeau existant
  3. Si mode ≠ Normal : Crée un bandeau en bas de page
    - Couleur selon le mode
    - Message informatif

  Styles du bandeau :
  - Position : Fixed, bottom: 0
  - Z-index : 9999
  - Couleur de fond selon mode
  - Texte blanc, bold

  ---
  creerSelecteurMode()

  Crée les boutons de sélection de mode dans l'en-tête.

  creerSelecteurMode()

  Placement : Élément HTML #selecteur-mode

  Boutons générés :
  - "Normal"
  - "Simulation"
  - "Anonymisation"

  État actif : Classe .actif sur le bouton du mode actuel

  Événement : Click → changerMode(mode)

  ---
  6. Dépendances

  6.1 Modules requis (doivent être chargés AVANT)

  01-config.js              Variables globales (sousSectionActive)
  02-navigation.js          Fonction afficherSousSection()

  6.2 Modules qui utilisent modes.js (TOUS)

  Lecture de données :
  groupe.js                 obtenirDonneesSelonMode('groupeEtudiants')
  evaluation.js             obtenirDonneesSelonMode('evaluationsSauvegardees')
  liste-evaluations.js      obtenirDonneesSelonMode()
  saisie-presences.js       obtenirDonneesSelonMode('presences')
  etudiants.js              obtenirDonneesSelonMode()

  Écriture de données :
  groupe.js                 sauvegarderDonneesSelonMode('groupeEtudiants', ...)
  evaluation.js             sauvegarderDonneesSelonMode('evaluationsSauvegardees',
   ...)
  saisie-presences.js       sauvegarderDonneesSelonMode('presences', ...)

  Vérification lecture seule :
  liste-evaluations.js      estModeeLectureSeule()
  groupe.js                 estModeeLectureSeule()

  ---
  7. Initialisation

  Ordre de chargement dans index.html

  <script src="js/config.js"></script>
  <script src="js/navigation.js"></script>
  <!-- ... autres modules ... -->
  <script src="js/modes.js"></script>  <!-- Avant main.js -->
  <script src="js/main.js"></script>

  Appel dans main.js

  // MODULE 17: Gestion des modes
  if (typeof initialiserSystemeModes === 'function') {
      console.log('   → Module 17-modes détecté');
      initialiserSystemeModes();
  }

  Structure HTML requise

  <!-- En-tête de l'application -->
  <div id="selecteur-mode">
    <!-- Les boutons seront générés ici par creerSelecteurMode() -->
  </div>

  Vérification de l'initialisation

  // Console navigateur
  console.log('Mode actuel:', localStorage.getItem('modeApplication'))
  // Retour attendu : "normal" (par défaut)

  console.log('API disponible:', typeof obtenirDonneesSelonMode)
  // Retour attendu : "function"

  // Tester le changement de mode
  changerMode(MODES.SIMULATION)
  console.log('Données simulation:', localStorage.getItem('simulation_etudiants'))

  ---
  8. Tests et vérification

  Test 1 : Changement de mode Normal → Simulation

  ÉTAPES :
  1. Ouvrir l'application (mode Normal par défaut)
  2. Cliquer sur le bouton "Simulation"
  3. Vérifier le bandeau en bas : "MODE SIMULATION..."
  4. Vérifier que le thème change (mauve)
  5. Aller dans Réglages → Groupe
  6. Vérifier que 30 étudiants du groupe "99SIM" s'affichent
  7. Aller dans Évaluations → Liste
  8. Vérifier la présence d'évaluations fictives

  VÉRIFICATION :
  localStorage.getItem('modeApplication')  → "simulation"
  localStorage.getItem('simulation_etudiants')  → [30 étudiants]
  localStorage.getItem('simulation_evaluations')  → [N évaluations]

  Test 2 : Mode Anonymisation - Lecture seule

  ÉTAPES :
  1. Cliquer sur le bouton "Anonymisation"
  2. Vérifier le bandeau en bas : "MODE ANONYMISATION..."
  3. Vérifier que le thème change (vert)
  4. Aller dans Réglages → Groupe
  5. Vérifier que les noms sont anonymisés
  6. Essayer d'ajouter un étudiant
  7. Vérifier qu'un message d'erreur s'affiche
  8. Essayer de supprimer un étudiant
  9. Vérifier le blocage

  VÉRIFICATION :
  estModeeLectureSeule()  → true
  sauvegarderDonneesSelonMode('test', [])  → false (bloqué)
  localStorage.getItem('mapping_anonymisation')  → {mapping persistent}

  // Les noms doivent être identiques à chaque consultation

  Test 3 : Persistance du mapping d'anonymisation

  // Console navigateur

  // 1. Passer en mode anonymisation
  changerMode(MODES.ANONYMISATION)

  // 2. Noter les noms affichés
  const etudiants1 = obtenirDonneesSelonMode('groupeEtudiants')
  console.log('Premier affichage:', etudiants1[0].nom, etudiants1[0].prenom)

  // 3. Retourner en mode normal
  changerMode(MODES.NORMAL)

  // 4. Repasser en mode anonymisation
  changerMode(MODES.ANONYMISATION)

  // 5. Vérifier que les noms sont identiques
  const etudiants2 = obtenirDonneesSelonMode('groupeEtudiants')
  console.log('Deuxième affichage:', etudiants2[0].nom, etudiants2[0].prenom)

  // Attendu : Noms identiques (mapping persistant)

  Test 4 : Isolation des données de simulation

  // Console navigateur

  // 1. Mode Normal - Ajouter un étudiant
  changerMode(MODES.NORMAL)
  const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]')
  etudiants.push({id: 999, da: '9999999', nom: 'Test', prenom: 'Mode', groupe:
  '1'})
  localStorage.setItem('groupeEtudiants', JSON.stringify(etudiants))
  console.log('Étudiants réels:', etudiants.length)

  // 2. Mode Simulation - Vérifier l'isolation
  changerMode(MODES.SIMULATION)
  const etudiantsSim = obtenirDonneesSelonMode('groupeEtudiants')
  console.log('Étudiants simulation:', etudiantsSim.length)
  // Attendu : 30 (pas 31, l'étudiant "Test Mode" n'apparaît pas)

  // 3. Retour en mode Normal - Vérifier que les données réelles n'ont pas changé
  changerMode(MODES.NORMAL)
  const etudiantsReel = obtenirDonneesSelonMode('groupeEtudiants')
  console.log('Contient "Test Mode"?', etudiantsReel.some(e => e.nom === 'Test'))
  // Attendu : true (données réelles intactes)

  Test 5 : Génération des notes de simulation

  // Vérifier la distribution des notes
  const evals = JSON.parse(localStorage.getItem('simulation_evaluations') || '[]')
  const notes = evals.map(e => e.noteFinale)

  // Calculer la moyenne
  const moyenne = notes.reduce((sum, n) => sum + n, 0) / notes.length
  console.log('Moyenne:', moyenne)  // Attendu : ~70-85

  // Calculer l'écart-type
  const variance = notes.reduce((sum, n) => sum + Math.pow(n - moyenne, 2), 0) /
  notes.length
  const ecartType = Math.sqrt(variance)
  console.log('Écart-type:', ecartType)  // Attendu : ~8

  // Distribution IDME
  const distribution = {
    I: evals.filter(e => e.niveauFinal === 'I').length,
    D: evals.filter(e => e.niveauFinal === 'D').length,
    M: evals.filter(e => e.niveauFinal === 'M').length,
    E: evals.filter(e => e.niveauFinal === 'E').length
  }
  console.table(distribution)
  // Attendu : Majorité en M, quelques D et E, peu de I

  Test 6 : Rafraîchissement sans rechargement

  ÉTAPES :
  1. Aller dans Réglages → Groupe (liste des étudiants)
  2. Noter le contenu affiché
  3. Cliquer sur "Simulation"
  4. Vérifier que la liste se rafraîchit automatiquement
  5. Vérifier que la page n'a PAS rechargé (pas de flash)
  6. Cliquer sur "Normal"
  7. Vérifier le rafraîchissement automatique

  VÉRIFICATION :
  - Pas de rechargement de page (location.reload() pas appelé)
  - Contenu mis à jour instantanément
  - Console affiche : "🔄 Rafraîchissement du contenu selon le nouveau mode..."

  ---
  9. Problèmes connus et solutions

  Problème 1 : Bandeau ne s'affiche pas

  Symptôme : Pas de bandeau en bas de page en mode Simulation/Anonymisation.

  Cause : CSS z-index conflictuel ou élément supprimé après création.

  Solution :
  // Vérifier que le bandeau existe
  const bandeau = document.getElementById('bandeau-mode')
  console.log('Bandeau présent?', !!bandeau)

  // Si absent, forcer la création
  appliquerTheme(modeActuel)

  ---
  Problème 2 : Données de simulation non générées

  Symptôme : Aucun étudiant en mode Simulation.

  Cause : genererDonneesSimulation() pas appelée ou listeGrilles vide.

  Solution :
  // Vérifier les productions
  const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]')
  console.log('Nb productions:', productions.length)

  // Si 0, créer au moins une production avant de générer la simulation

  // Forcer la génération
  localStorage.removeItem('simulation_evaluations')
  genererDonneesSimulation()

  ---
  Problème 3 : Sauvegarde réussit en mode Anonymisation

  Symptôme : Les données sont modifiées malgré le mode Anonymisation.

  Cause : Utilisation de localStorage.setItem() directement au lieu de
  sauvegarderDonneesSelonMode().

  Solution : Remplacer TOUS les appels directs :
  // ❌ MAUVAIS
  localStorage.setItem('groupeEtudiants', JSON.stringify(etudiants))

  // ✅ BON
  if (!sauvegarderDonneesSelonMode('groupeEtudiants', etudiants)) {
    afficherNotificationErreur('Modification bloquée en mode anonymisation')
    return
  }

  ---
  Problème 4 : Mapping d'anonymisation change à chaque fois

  Symptôme : Les noms anonymisés sont différents à chaque consultation.

  Cause : mapping_anonymisation supprimé du localStorage ou erreur dans
  genererMappingAnonyme().

  Solution :
  // Vérifier le mapping
  const mapping = JSON.parse(localStorage.getItem('mapping_anonymisation') ||
  '{}')
  console.log('Nb mappings:', Object.keys(mapping).length)

  // Si 0, le régénérer
  genererMappingAnonyme()

  Note : Le mapping devrait être persistant. Ne pas supprimer manuellement
  mapping_anonymisation.

  ---
  Problème 5 : Code dupliqué

  Symptôme : Fonctions apparaissent deux fois dans le code.

  Code dupliqué :
  - anonymiserDonnees() : lignes 465-502 ET 510-547
  - sauvegarderDonneesSelonMode() : lignes 430-457 ET 574-601

  Impact : Confusion, possibilité de divergence entre les deux versions.

  Solution : Supprimer les doublons (garder une seule version de chaque fonction).

  // Vérifier quelle version est exportée
  console.log(sauvegarderDonneesSelonMode.toString().includes('MODE 
  ANONYMISATION'))
  // Devrait être true

  ---
  Problème 6 : Contenu ne se rafraîchit pas après changement de mode

  Symptôme : Après changement de mode, le contenu affiché reste inchangé.

  Cause : Sous-section active non incluse dans mappingModules (ligne 178-182).

  Solution : Ajouter la sous-section au mapping :
  const mappingModules = {
    'reglages-groupe': 'afficherListeEtudiants',
    'etudiants-liste': 'afficherListeEtudiantsConsultation',
    'evaluations-liste-evaluations': 'chargerListeEvaluationsRefonte',
    'presences-saisie': 'rafraichirTableauPresences'  // Exemple
  };

  ---
  10. Règles de modification

  ⚠️ ZONES STRICTEMENT PROTÉGÉES - NE PAS MODIFIER

  1. Fonction obtenirDonneesSelonMode() (lignes 384-420)
    - Logique centrale de routage des données
    - Utilisée par TOUS les modules
    - Toute modification affecte TOUTE l'application
  2. Fonction sauvegarderDonneesSelonMode() (lignes 430-457 ou 574-601)
    - Protection contre l'écriture en mode Anonymisation
    - Redirection en mode Simulation
    - Critique pour l'intégrité des données
  3. Constantes MODES (lignes 12-16)
    - Valeurs : 'normal', 'simulation', 'anonymisation'
    - Utilisées partout dans le code
    - NE PAS RENOMMER
  4. Mapping des clés de simulation (lignes 392-395, 441-445, 585-589)
    - groupeEtudiants → simulation_etudiants
    - evaluationsSauvegardees → simulation_evaluations
    - Cohérence essentielle
  5. Fonction genererDonneesSimulation() (lignes 255-315)
    - Génération de 30 étudiants
    - Distribution normale des notes
    - Formules statistiques

  ---
  ✅ Zones modifiables

  1. Listes de noms québécois (lignes 40-51)
    - Ajouter/modifier noms et prénoms
    - Adapter à d'autres régions
  2. Thèmes visuels (lignes 18-34)
    - Changer les couleurs
    - Personnaliser les icônes
    - Modifier les noms affichés
  3. Mapping des modules à rafraîchir (lignes 178-182)
    - Ajouter de nouvelles sous-sections
    - Associer aux bonnes fonctions de rafraîchissement
  4. Styles du bandeau (lignes 218-231)
    - Personnaliser l'apparence
    - Changer la position
    - Modifier le message
  5. Paramètres de génération :
    - Nombre d'étudiants fictifs (ligne 258 : 30)
    - Distribution des notes (ligne 282 : moyenne 70-85)
    - Écart-type (ligne 283 : 8)

  ---
  🛠️ Pour ajouter un nouveau type de données

  Exemple : Ajouter support pour presences

  // 1. Dans obtenirDonneesSelonMode(), ajouter au mapping
  const mappingCles = {
    'groupeEtudiants': 'simulation_etudiants',
    'evaluationsSauvegardees': 'simulation_evaluations',
    'presences': 'simulation_presences'  // Nouveau
  };

  // 2. Dans anonymiserDonnees(), ajouter un cas
  case 'presences':
    return donnees.map(presence => ({
      ...presence,
      nom: mapping[presence.da]?.nom || presence.nom,
      prenom: mapping[presence.da]?.prenom || presence.prenom
    }));

  // 3. Dans genererDonneesSimulation(), générer les données fictives
  // (Ajouter la logique de génération spécifique)

  ---
  11. Historique

  Version actuelle (Module 17)

  État : ✅ FonctionnelDernière modification : Ajout du rafraîchissement sans
  rechargement de page

  Fonctionnalités complétées :
  - Gestion des 3 modes (Normal, Simulation, Anonymisation)
  - API centrale obtenirDonneesSelonMode() et sauvegarderDonneesSelonMode()
  - Génération de données fictives réalistes
  - Mapping d'anonymisation persistant
  - Thèmes visuels et bandeau informatif
  - Rafraîchissement automatique sans rechargement
  - Protection lecture seule en mode Anonymisation
  - Événement modeChanged pour réactivité

  Bugs connus :
  - Code dupliqué : anonymiserDonnees() et sauvegarderDonneesSelonMode()
  apparaissent deux fois
  - Possibilité de conflit entre les deux versions

  Améliorations possibles :
  - Ajouter mode "Présentation" (lecture seule, sans anonymisation)
  - Personnaliser le nombre d'étudiants fictifs via interface
  - Exporter/importer les données de simulation
  - Ajouter des profils de simulation (groupe faible, moyen, fort)

  ---
  12. Support et ressources

  Documentation pédagogique

  - RGPD et anonymisation : Justification du mode Anonymisation pour partages
  d'écran
  - Formations : Mode Simulation pour démonstrations sans risque

  Fichiers de référence

  CLAUDE.md                    Contrainte "100% autonome, localStorage uniquement"
  structure-modulaire.txt      Architecture complète
  noms_stables.json            Noms protégés

  Modules qui DOIVENT utiliser ce module

  groupe.js                    Lecture/écriture groupeEtudiants
  evaluation.js                Lecture/écriture evaluationsSauvegardees
  liste-evaluations.js         Lecture des données
  saisie-presences.js          Lecture/écriture presences
  etudiants.js                 Lecture groupeEtudiants
  profil-etudiant.js           Lecture des données
  tableau-bord-apercu.js       Lecture des indices

  Debug dans la console

  // Vérifier le mode actif
  console.log('Mode:', localStorage.getItem('modeApplication'))

  // Tester le routage des données
  console.log('Étudiants normaux:',
  JSON.parse(localStorage.getItem('groupeEtudiants')).length)
  console.log('Étudiants simulation:',
  JSON.parse(localStorage.getItem('simulation_etudiants') || '[]').length)

  // Tester l'anonymisation
  changerMode(MODES.ANONYMISATION)
  const etudiants = obtenirDonneesSelonMode('groupeEtudiants')
  console.table(etudiants.slice(0, 5))

  // Vérifier le mapping
  const mapping = JSON.parse(localStorage.getItem('mapping_anonymisation') ||
  '{}')
  console.log('Nb mappings:', Object.keys(mapping).length)

  // Tester la protection lecture seule
  changerMode(MODES.ANONYMISATION)
  console.log('Lecture seule?', estModeeLectureSeule())  // true
  const resultat = sauvegarderDonneesSelonMode('test', [])
  console.log('Sauvegarde bloquée?', !resultat)  // true

  // Forcer régénération des données de simulation
  localStorage.removeItem('simulation_evaluations')
  changerMode(MODES.SIMULATION)

  ---
  📌 Note critique : Ce module est le cœur de l'infrastructure de données. TOUS
  les modules doivent utiliser obtenirDonneesSelonMode() et
  sauvegarderDonneesSelonMode() au lieu d'accéder directement à localStorage.
  Toute modification doit être testée exhaustivement sur les 3 modes.

  ---
  Fin de la documentation modes.js