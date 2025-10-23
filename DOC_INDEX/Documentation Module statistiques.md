Documentation technique : statistiques.js

  📋 Vue d'ensemble

  Nom du module : statistiques.js (Statistiques et aperçu des réglages)Version :
  Adapté de index 35-M5Lignes de code : 287 lignesResponsable : Grégoire Bédard

  Description :Module d'affichage des statistiques de configuration du système.
  Fournit une vue d'ensemble complète dans la sous-section Réglages → Aperçu :
  informations du cours actif, matériel pédagogique configuré (grilles, échelles,
  cartouches), et métriques système (version, poids des données). Module en
  lecture seule qui ne modifie aucune donnée.

  Exemple concret :Un enseignant consulte Réglages → Aperçu et voit immédiatement
  : cours "601-101-MQ H2025", calendrier du 25 août au 18 décembre (15 semaines),
  45 étudiants, pratique sommative, 5 grilles configurées, 3 cartouches, données
  occupant 2.3 Mo. Il identifie rapidement qu'il lui manque des échelles de
  performance.

  ---
  🏷️ Type de module

  Type : LECTEUR (Affichage/Synthèse)

  Ce module lit uniquement les données de localStorage pour les afficher. Il ne
  génère ni ne modifie aucune donnée.

  Données lues (lecture seule) :
  - listeCours (cours actif)
  - cadreCalendrier (dates trimestre)
  - seancesHoraire (horaire configuré)
  - groupeEtudiants (nombre étudiants)
  - modalitesEvaluation (pratique notation)
  - listeGrilles (productions)
  - grillesTemplates (grilles critères)
  - configEchelle et niveauxEchelle (échelles)
  - cartouches_* (toutes cartouches)

  Modules sources (qui génèrent ces données) :
  - cours.js → listeCours
  - trimestre.js → cadreCalendrier
  - horaire.js → seancesHoraire
  - groupe.js → groupeEtudiants
  - pratiques.js → modalitesEvaluation
  - productions.js → listeGrilles
  - grilles.js → grillesTemplates
  - echelles.js → configEchelle, niveauxEchelle
  - cartouches.js → cartouches_*

  ---
  💾 Données gérées

  Statistiques affichées

  1. Informations du cours

  | Statistique       | ID Élément      | Source                            |
  Description                                 |
  |-------------------|-----------------|-----------------------------------|-----
  ----------------------------------------|
  | Code cours        | stat-code-cours | listeCours[actif].codeCours       | Ex:
  "601-101-MQ"                            |
  | Trimestre         | stat-trimestre  | listeCours[actif].session + annee | Ex:
  "H2025"                                 |
  | Calendrier        | stat-calendrier | cadreCalendrier                   | Ex:
  "2025-08-25 → 2025-12-18 (15 sem.)"     |
  | Horaire           | stat-horaire    | seancesHoraire                    | Ex:
  "Lundi 13:00-14:50 · Jeudi 13:00-14:50" |
  | Nombre de groupes | stat-nb-groupes | Compte listeCours                 |
  Actuellement toujours "1"                   |
  | Nombre d'élèves   | stat-nb-eleves  | groupeEtudiants.length            | Ex:
  "45"                                    |

  2. Matériel configuré

  | Statistique             | ID Élément       | Source                          |
   Description                           |
  |-------------------------|------------------|---------------------------------|
  ---------------------------------------|
  | Pratique de notation    | stat-pratique    | modalitesEvaluation             |
   Ex: "Sommative (%)", "PAN - Maîtrise" |
  | Productions             | stat-productions | listeGrilles.length             |
   Nombre de productions configurées     |
  | Grilles de critères     | stat-grilles     | grillesTemplates.length         |
   Ex: "5"                               |
  | Échelles de performance | stat-echelles    | configEchelle ou niveauxEchelle |
   "1" si configuré, "0" sinon           |
  | Cartouches              | stat-cartouches  | Toutes clés cartouches_*        |
   Total cartouches toutes grilles       |

  3. Informations système

  | Statistique       | ID Élément        | Source              | Description
            |
  |-------------------|-------------------|---------------------|-----------------
  ----------|
  | Version           | stat-version      | Codée en dur        | "Beta 0.60"
            |
  | Dernière MAJ      | stat-derniere-maj | new Date()          | Ex: "2025-08-20
  14:30"    |
  | Poids des données | stat-poids        | Calcul localStorage | Ex: "2.34 Mo" ou
   "512 Ko" |

  Calcul du poids des données

  // Pour chaque clé localStorage
  poids = (longueur_clé + longueur_valeur) × 2 bytes  // UTF-16

  // Total en Ko ou Mo
  if (poids < 1 MB) {
      affichage = "X.XX Ko"
  } else {
      affichage = "X.XX Mo"
  }

  ---
  🔌 API publique

  Fonctions d'initialisation

  initialiserModuleStatistiques()

  /**
   * Initialise le module au chargement
   * Appelée automatiquement par 99-main.js
   * 
   * FONCTIONNEMENT:
   * 1. Log console
   * 2. Vérifie si #reglages-apercu.active
   * 3. Si oui: appelle chargerStatistiquesApercu()
   * 
   * RETOUR: void
   */

  Fonctions principales

  chargerStatistiquesApercu()

  /**
   * Charge et affiche toutes les statistiques
   * 
   * FONCTIONNEMENT:
   * 1. Appelle chargerInfosCours()
   * 2. Appelle chargerMaterielConfigure()
   * 3. Appelle chargerInfosSysteme()
   * 4. Log console succès
   * 
   * UTILISÉ PAR:
   * - initialiserModuleStatistiques()
   * - Changement vers sous-section aperçu (via navigation.js)
   * - Bouton rafraîchissement (si présent)
   * 
   * RETOUR: void
   */

  Fonctions de catégorie

  chargerInfosCours()

  /**
   * Charge informations du cours actif
   * 
   * FONCTIONNEMENT:
   * 1. Lit listeCours, trouve cours actif
   * 2. Affiche code cours et trimestre
   * 3. Lit cadreCalendrier, calcule nb semaines
   * 4. Lit seancesHoraire, formate horaire
   * 5. Compte groupes (actuellement 1)
   * 6. Compte étudiants
   * 
   * CALCUL NB SEMAINES:
   * - Si cadreCalendrier.nombreSemaines existe: utilise
   * - Sinon: (dateFin - dateDebut) / 7 jours
   * 
   * FORMAT HORAIRE:
   * - Si seancesHoraire: "Lundi 13:00-14:50 · Jeudi 13:00-14:50"
   * - Sinon si formatHoraire: "2x2" ou "1x4"
   * - Sinon: "—"
   * 
   * ÉLÉMENTS MIS À JOUR:
   * - stat-code-cours
   * - stat-trimestre
   * - stat-calendrier
   * - stat-horaire
   * - stat-nb-groupes
   * - stat-nb-eleves
   * 
   * RETOUR: void
   */

  chargerMaterielConfigure()

  /**
   * Charge informations matériel pédagogique
   * 
   * FONCTIONNEMENT:
   * 1. Lit modalitesEvaluation:
   *    - Sommative: "Sommative (%)"
   *    - Alternative + typePAN: "PAN - Maîtrise/Spécifications/Dénotation"
   *    - Alternative sans type: "Alternative (à préciser)"
   *    - Vide: "Non configurée"
   * 2. Compte listeGrilles (productions)
   * 3. Compte grillesTemplates (grilles critères)
   * 4. Vérifie configEchelle ou niveauxEchelle:
   *    - Si existe: "1"
   *    - Sinon: "0"
   * 5. Compte TOUTES cartouches:
   *    - Parcourt localStorage
   *    - Filtre clés startsWith('cartouches_')
   *    - Somme longueur arrays
   * 
   * ÉLÉMENTS MIS À JOUR:
   * - stat-pratique
   * - stat-productions
   * - stat-grilles
   * - stat-echelles
   * - stat-cartouches
   * 
   * RETOUR: void
   */

  chargerInfosSysteme()

  /**
   * Charge informations système
   * 
   * FONCTIONNEMENT:
   * 1. Version: "Beta 0.60" (codée en dur)
   * 2. Dernière MAJ: Date/heure actuelle formatée
   * 3. Poids données:
   *    - Parcourt tout localStorage
   *    - Calcule (clé.length + valeur.length) × 2
   *    - Somme total
   *    - Convertit Ko ou Mo
   * 
   * FORMAT DATE:
   * - Locale: fr-CA
   * - Format: "YYYY-MM-DD HH:MM"
   * - Ex: "2025-08-20 14:30"
   * 
   * CALCUL POIDS:
   * - UTF-16: 2 bytes par caractère
   * - < 1 MB: affiche en Ko
   * - >= 1 MB: affiche en Mo
   * 
   * ÉLÉMENTS MIS À JOUR:
   * - stat-version
   * - stat-derniere-maj
   * - stat-poids
   * 
   * RETOUR: void
   */

  Fonctions utilitaires

  setStatText(id, valeur)

  /**
   * Met à jour texte d'un élément de statistique
   * 
   * PARAMÈTRES:
   * @param {string} id - ID de l'élément HTML
   * @param {string|number} valeur - Valeur à afficher
   * 
   * FONCTIONNEMENT:
   * 1. Trouve élément par ID
   * 2. Si trouvé: element.textContent = valeur
   * 3. Sinon: console.warn
   * 
   * UTILISÉ PAR:
   * - Toutes les fonctions de chargement
   * 
   * RETOUR: void
   */

  ---
  🔗 Dépendances

  Modules requis (ordre de chargement)

  1. 01-config.js (optionnel)
    - Pour : Variables globales (si utilisées)

  Modules sources (données lues)

  Dépend de TOUS les modules qui génèrent des données :
  - cours.js → listeCours
  - trimestre.js → cadreCalendrier
  - horaire.js → seancesHoraire
  - groupe.js → groupeEtudiants
  - pratiques.js → modalitesEvaluation
  - productions.js → listeGrilles
  - grilles.js → grillesTemplates
  - echelles.js → configEchelle, niveauxEchelle
  - cartouches.js → cartouches_*

  Éléments HTML requis

  Tous dans la sous-section #reglages-apercu :

  <!-- Informations du cours -->
  <span id="stat-code-cours">—</span>
  <span id="stat-trimestre">—</span>
  <span id="stat-calendrier">—</span>
  <span id="stat-horaire">—</span>
  <span id="stat-nb-groupes">—</span>
  <span id="stat-nb-eleves">0</span>

  <!-- Matériel configuré -->
  <span id="stat-pratique">Non configurée</span>
  <span id="stat-productions">0</span>
  <span id="stat-grilles">0</span>
  <span id="stat-echelles">0</span>
  <span id="stat-cartouches">0</span>

  <!-- Système -->
  <span id="stat-version">—</span>
  <span id="stat-derniere-maj">—</span>
  <span id="stat-poids">—</span>

  Classes CSS utilisées

  Aucune classe CSS strictement requise, mais recommandées :
  .carte                  /* Conteneur statistiques */
  .grille-statistiques   /* Layout grille */

  ---
  🚀 Initialisation

  Appel depuis 99-main.js

  // PRIORITÉ 4 : MODULES AVANCÉS

  // MODULE 14: Statistiques
  if (typeof initialiserModuleStatistiques === 'function') {
      console.log('   → Module 14-statistiques détecté');
      initialiserModuleStatistiques();
  }

  Ordre de chargement critique

  1. Tous modules sources (génèrent données)
     - cours.js
     - trimestre.js
     - horaire.js
     - groupe.js
     - pratiques.js
     - productions.js
     - grilles.js
     - echelles.js
     - cartouches.js

  2. statistiques.js (lit toutes ces données)

  3. main.js (appelle initialiserModuleStatistiques)

  Important : Ce module doit être chargé après tous les modules sources pour
  pouvoir lire leurs données.

  Déclenchement du chargement

  Automatique :
  - Au chargement si #reglages-apercu.active

  Manuel :
  - Via navigation vers Réglages → Aperçu (navigation.js appelle
  chargerStatistiquesApercu)
  - Via bouton rafraîchissement (si implémenté)

  ---
  🧪 Tests et vérification

  Test 1 : Vérifier affichage complet

  1. Aller dans Réglages → Aperçu
  2. Vérifier TOUS les éléments affichent une valeur (pas "undefined" ou vide)
  3. Vérifier format correct pour chaque statistique

  Test 2 : Informations du cours

  // Créer données test
  localStorage.setItem('listeCours', JSON.stringify([
      {
          id: 'COURS1',
          codeCours: '601-101-MQ',
          session: 'H',
          annee: '2025',
          formatHoraire: '2x2',
          actif: true
      }
  ]));

  localStorage.setItem('cadreCalendrier', JSON.stringify({
      dateDebut: '2025-08-25',
      dateFin: '2025-12-18',
      nombreSemaines: 15
  }));

  localStorage.setItem('seancesHoraire', JSON.stringify([
      { jour: 'Lundi', debut: '13:00', fin: '14:50' },
      { jour: 'Jeudi', debut: '13:00', fin: '14:50' }
  ]));

  localStorage.setItem('groupeEtudiants', JSON.stringify([
      {id: 1, nom: 'Test', prenom: 'Alice'},
      {id: 2, nom: 'Test', prenom: 'Bob'}
  ]));

  // Recharger statistiques
  chargerStatistiquesApercu();

  // Vérifier affichage
  console.log('Code cours:',
  document.getElementById('stat-code-cours').textContent);
  // Doit afficher: "601-101-MQ"

  console.log('Trimestre:',
  document.getElementById('stat-trimestre').textContent);
  // Doit afficher: "H2025"

  console.log('Calendrier:',
  document.getElementById('stat-calendrier').textContent);
  // Doit afficher: "2025-08-25 → 2025-12-18 (15 sem.)"

  console.log('Horaire:', document.getElementById('stat-horaire').textContent);
  // Doit afficher: "Lundi 13:00-14:50 · Jeudi 13:00-14:50"

  console.log('Nb élèves:',
  document.getElementById('stat-nb-eleves').textContent);
  // Doit afficher: "2"

  Test 3 : Matériel configuré

  // Pratique sommative
  localStorage.setItem('modalitesEvaluation', JSON.stringify({
      pratique: 'sommative'
  }));
  chargerStatistiquesApercu();
  console.log('Pratique:', document.getElementById('stat-pratique').textContent);
  // Doit afficher: "Sommative (%)"

  // Pratique alternative - maîtrise
  localStorage.setItem('modalitesEvaluation', JSON.stringify({
      pratique: 'alternative',
      typePAN: 'maitrise'
  }));
  chargerStatistiquesApercu();
  console.log('Pratique:', document.getElementById('stat-pratique').textContent);
  // Doit afficher: "PAN - Maîtrise"

  // Grilles
  localStorage.setItem('grillesTemplates', JSON.stringify([
      {id: 'G1', nom: 'Grille 1'},
      {id: 'G2', nom: 'Grille 2'},
      {id: 'G3', nom: 'Grille 3'}
  ]));
  chargerStatistiquesApercu();
  console.log('Grilles:', document.getElementById('stat-grilles').textContent);
  // Doit afficher: "3"

  // Cartouches
  localStorage.setItem('cartouches_G1', JSON.stringify([
      {id: 'C1', nom: 'Cartouche 1'},
      {id: 'C2', nom: 'Cartouche 2'}
  ]));
  localStorage.setItem('cartouches_G2', JSON.stringify([
      {id: 'C3', nom: 'Cartouche 3'}
  ]));
  chargerStatistiquesApercu();
  console.log('Cartouches:',
  document.getElementById('stat-cartouches').textContent);
  // Doit afficher: "3"

  Test 4 : Calcul nb semaines

  // Sans nombreSemaines (calcul automatique)
  localStorage.setItem('cadreCalendrier', JSON.stringify({
      dateDebut: '2025-08-25',
      dateFin: '2025-12-18'
      // Pas de nombreSemaines
  }));

  chargerStatistiquesApercu();

  // Calcul: 25 août au 18 décembre = 115 jours = 16.4 semaines ≈ 17 sem.
  console.log('Calendrier:',
  document.getElementById('stat-calendrier').textContent);
  // Devrait contenir "17 sem." environ

  Test 5 : Poids des données

  // Ajouter données volumineuses
  localStorage.setItem('testGros', 'a'.repeat(500000));  // ~500 Ko

  chargerStatistiquesApercu();

  console.log('Poids:', document.getElementById('stat-poids').textContent);
  // Devrait être > 500 Ko

  // Nettoyer
  localStorage.removeItem('testGros');

  Test 6 : Données absentes (valeurs par défaut)

  // Vider localStorage
  localStorage.clear();

  chargerStatistiquesApercu();

  // Vérifier valeurs par défaut
  console.log('Code cours:',
  document.getElementById('stat-code-cours').textContent);
  // Doit afficher: "—"

  console.log('Nb élèves:',
  document.getElementById('stat-nb-eleves').textContent);
  // Doit afficher: "0"

  console.log('Pratique:', document.getElementById('stat-pratique').textContent);
  // Doit afficher: "Non configurée"

  Test 7 : Format date dernière MAJ

  chargerStatistiquesApercu();

  const dateMaj = document.getElementById('stat-derniere-maj').textContent;
  console.log('Date MAJ:', dateMaj);

  // Format attendu: "YYYY-MM-DD HH:MM"
  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
  console.log('Format valide?', regex.test(dateMaj));
  // Doit afficher: true

  ---
  🐛 Problèmes connus

  Problème 1 : Statistiques pas mises à jour

  Symptôme : Valeurs anciennes malgré modifications

  Cause : chargerStatistiquesApercu() pas appelée après changement

  Solution :
  // Appeler manuellement après modification
  chargerStatistiquesApercu();

  // Ou ajouter dans navigation.js (ligne ~300)
  case 'reglages-apercu':
      if (typeof chargerStatistiquesApercu === 'function') {
          chargerStatistiquesApercu();
      }
      break;

  Problème 2 : "undefined" affiché

  Symptôme : Texte "undefined" dans un élément

  Cause : Valeur undefined passée à setStatText()

  Solution :
  // Vérifier données source
  const listeCours = JSON.parse(localStorage.getItem('listeCours') || '[]');
  const coursActif = listeCours.find(c => c.actif);
  console.log('Cours actif:', coursActif);
  console.log('Code cours:', coursActif?.codeCours);

  // Si undefined, c'est normal, devrait afficher "—"
  // Vérifier setStatText() ligne 232

  Problème 3 : Calcul poids incorrect

  Symptôme : Poids affiché trop petit ou trop grand

  Cause : Calcul UTF-16 ou conversion Ko/Mo

  Solution :
  // Vérifier calcul manuel
  let poidsTotal = 0;
  for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      const valeur = localStorage.getItem(cle);
      const tailleCle = cle.length * 2;
      const tailleValeur = valeur.length * 2;
      console.log(`${cle}: ${(tailleCle + tailleValeur) / 1024} Ko`);
      poidsTotal += tailleCle + tailleValeur;
  }

  console.log('Total:', (poidsTotal / 1024).toFixed(2), 'Ko');
  console.log('Total:', (poidsTotal / 1024 / 1024).toFixed(2), 'Mo');

  Problème 4 : Nombre cartouches = 0 malgré cartouches existantes

  Symptôme : stat-cartouches affiche "0" alors que cartouches existent

  Cause : Clés pas préfixées "cartouches_" ou localStorage.getItem() retourne null

  Solution :
  // Vérifier clés cartouches
  for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle.startsWith('cartouches_')) {
          const cartouches = JSON.parse(localStorage.getItem(cle) || '[]');
          console.log(`${cle}:`, cartouches.length, 'cartouches');
      }
  }

  // Vérifier total
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle && cle.startsWith('cartouches_')) {
          total += JSON.parse(localStorage.getItem(cle) || '[]').length;
      }
  }
  console.log('Total cartouches:', total);

  Problème 5 : "Beta 0.60" pas à jour

  Symptôme : Version affichée obsolète

  Cause : Codée en dur ligne 199

  Solution :
  // Modifier ligne 199 dans chargerInfosSysteme()
  setStatText('stat-version', 'Beta 0.70');  // Nouvelle version

  // Ou stocker dans config.js
  // config.js:
  const VERSION_APP = 'Beta 0.70';

  // statistiques.js:
  setStatText('stat-version', VERSION_APP);

  ---
  📐 Règles de modification

  ⚠️ ZONES PROTÉGÉES

  1. Noms de fonctions : Listés dans noms_stables.json
  2. IDs HTML : Ne pas renommer les id des éléments stat-*
  3. Clés localStorage : Ne pas modifier les noms (modules sources)
  4. Calcul poids : Formule UTF-16 (× 2 bytes)

  ✅ Modifications autorisées

  1. Commentaires : Ajout/modification sans limite
  2. Version : Mise à jour ligne 199
  3. Format affichage : Textes, séparateurs (· → |)
  4. Valeurs par défaut : "—" → "Non configuré"
  5. Calculs : Ajout nouvelles statistiques
  6. Conditions : Logique d'affichage pratique notation

  Ajout d'une nouvelle statistique

  Procédure :
  1. ✅ Ajouter élément HTML avec id stat-nouvelle
  2. ✅ Dans fonction appropriée (chargerInfosCours, chargerMaterielConfigure, ou
  chargerInfosSysteme) :
  // Récupérer donnée
  const data = JSON.parse(localStorage.getItem('clé') || 'valeur_defaut');

  // Calculer/formater
  const valeur = /* calcul */;

  // Afficher
  setStatText('stat-nouvelle', valeur);
  3. ✅ Tester avec données présentes et absentes
  4. ✅ Documenter dans section "Statistiques affichées"

  Workflow modification

  1. ✅ Lire CLAUDE.md (règles globales)
  2. ✅ Vérifier noms_stables.json
  3. ✅ Sauvegarder (commit Git)
  4. ✅ Modifier uniquement zones autorisées
  5. ✅ Tester avec localStorage vide et plein
  6. ✅ Rollback si erreur

  ---
  📜 Historique

  | Date       | Version     | Changements                                       |
  |------------|-------------|---------------------------------------------------|
  | 10-10-2025 | index 35-M5 | Version originale                                 |
  |            |             | - Extraction fonction chargerStatistiquesApercu() |
  |            |             | - Statistiques cours, matériel, système           |
  |            |             | - Calcul poids localStorage                       |
  |            |             | - Format fr-CA pour dates                         |

  ---
  📞 Support et ressources

  Documentation projet : README_PROJET.mdArchitecture : structure-modulaire.txt

  Debug console :
  // Vérifier toutes statistiques
  chargerStatistiquesApercu();

  // Lister valeurs affichées
  const stats = [
      'stat-code-cours', 'stat-trimestre', 'stat-calendrier', 'stat-horaire',
      'stat-nb-groupes', 'stat-nb-eleves', 'stat-pratique', 'stat-productions',
      'stat-grilles', 'stat-echelles', 'stat-cartouches', 'stat-version',
      'stat-derniere-maj', 'stat-poids'
  ];

  stats.forEach(id => {
      const element = document.getElementById(id);
      console.log(`${id}:`, element ? element.textContent : 'NON TROUVÉ');
  });

  // Vérifier données sources
  console.log('listeCours:', JSON.parse(localStorage.getItem('listeCours') ||
  '[]').length);
  console.log('groupeEtudiants:',
  JSON.parse(localStorage.getItem('groupeEtudiants') || '[]').length);
  console.log('grillesTemplates:',
  JSON.parse(localStorage.getItem('grillesTemplates') || '[]').length);

  // Calculer poids manuellement
  let poids = 0;
  for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      poids += (cle.length + localStorage.getItem(cle).length) * 2;
  }
  console.log('Poids localStorage:', (poids / 1024).toFixed(2), 'Ko');

  // Compter cartouches manuellement
  let nbCartouches = 0;
  for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle?.startsWith('cartouches_')) {
          nbCartouches += JSON.parse(localStorage.getItem(cle) || '[]').length;
      }
  }
  console.log('Cartouches:', nbCartouches);

  ---
  ⚠️ RAPPEL CRITIQUE : Ce module est un tableau de bord de configuration. Il ne
  modifie aucune donnée mais dépend de TOUS les modules sources. Si une
  statistique affiche une valeur incorrecte, le problème vient du module source
  qui génère cette donnée, pas de ce module. Utilisez-le pour diagnostiquer l'état
   de configuration de votre application.