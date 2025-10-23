Voici la documentation technique complète du module trimestre.js :

  Module trimestre.js

  Vue d'ensemble

  Module SOURCE qui génère et maintient le calendrier complet du trimestre
  académique. C'est la source unique de vérité pour toutes les informations
  calendaires (jours de cours, congés, reprises, semaines).

  Collecte les données brutes (dates du trimestre, congés prévus/imprévus), les
  traite pour générer un calendrier détaillé jour par jour, et le stocke dans
  localStorage. Tous les autres modules lisent ce calendrier sans jamais
  recalculer.

  Type

  - SOURCE - Génère et stocke des données
  - LECTEUR - Lit et affiche des données

  Données gérées

  Stockage localStorage

  1. calendrierComplet (LA SOURCE UNIQUE)
  - Clé : calendrierComplet
  - Format : Objet avec une clé par date (YYYY-MM-DD)
  - Structure : Chaque date contient { statut, numeroSemaine?, numeroJour?, 
  jourSemaine, motif?, jourRemplace? }

  Exemple :
  {
    "2025-08-21": {
      "statut": "cours",
      "numeroSemaine": 1,
      "numeroJour": 1,
      "jourSemaine": "Jeudi"
    },
    "2025-09-01": {
      "statut": "conge",
      "motif": "Fête du travail",
      "jourSemaine": "Lundi"
    },
    "2025-09-04": {
      "statut": "reprise",
      "numeroSemaine": 3,
      "numeroJour": 12,
      "jourSemaine": "Jeudi",
      "jourRemplace": "Lundi"
    }
  }

  Statuts possibles :
  - "cours" : Jour de cours normal
  - "reprise" : Jour de reprise d'un congé (avec indication du jour remplacé)
  - "conge" : Congé (avec motif)
  - "weekend" : Samedi ou dimanche
  - "semaine-planification" : Semaine de planification
  - "semaine-examens" : Semaine d'examens
  - "hors-cours" : Après la fin des cours (période examens/notes)

  2. cadreCalendrier
  - Clé : cadreCalendrier
  - Format : Objet avec les dates clés du trimestre
  - Structure : { dateDebut, finCours, finTrimestre, remiseNotes, 
  semainePlanificationDebut/Fin, semaineExamensDebut/Fin }

  3. evenementsPrevus
  - Clé : evenementsPrevus
  - Format : Tableau d'objets événements
  - Structure : { id, dateEvenement, description, horaireReprise?, dateReprise?, 
  verrouille }

  4. evenementsImprevus
  - Clé : evenementsImprevus
  - Format : Tableau d'objets événements
  - Structure : { id, dateEvenement, description, dateReprise?, verrouille }

  API publique

  obtenirCalendrierComplet()

  Description : Retourne le calendrier complet généré. TOUS LES MODULES doivent
  utiliser cette fonction pour accéder au calendrier.

  Paramètres : Aucun

  Retour : (Object) Dictionnaire avec clés = dates (YYYY-MM-DD), valeurs = infos
  du jour

  Utilisation :
  const calendrier = obtenirCalendrierComplet();
  // { "2025-08-21": { statut: "cours", numeroSemaine: 1, ... }, ... }

  obtenirInfosJour(date)

  Description : Obtient les informations d'une date spécifique du calendrier.

  Paramètres :
  - date (String) : Date au format YYYY-MM-DD

  Retour : (Object|null) Infos du jour ou null si date non trouvée

  Utilisation :
  const infos = obtenirInfosJour('2025-09-04');
  // { statut: "reprise", numeroSemaine: 3, numeroJour: 12, jourSemaine: "Jeudi", 
  jourRemplace: "Lundi" }

  genererCalendrierComplet() (interne, mais importante)

  Description : COEUR DU MODULE. Génère le calendrier complet jour par jour à
  partir des données brutes. Appelée automatiquement après chaque modification des
   réglages.

  Paramètres : Aucun

  Retour : (Object) Le calendrier généré

  Logique :
  1. Lit cadreCalendrier, evenementsPrevus, evenementsImprevus
  2. Itère sur chaque jour entre début et fin du trimestre
  3. Détermine le statut (cours/congé/reprise/weekend/etc.)
  4. Calcule numéroSemaine (1 semaine = 5 jours de cours)
  5. Stocke dans localStorage.calendrierComplet

  Utilisation :
  // Appelée automatiquement, mais peut être appelée manuellement si nécessaire
  genererCalendrierComplet();

  Fonctions secondaires

  Gestion du cadre calendrier

  - chargerCadreCalendrier() - Charge et affiche les dates du trimestre dans le
  formulaire
  - sauvegarderCadreCalendrier() - Sauvegarde les dates et régénère le calendrier

  Gestion des événements prévus

  - chargerEvenementsPrevus() - Affiche la liste des congés prévus
  - confirmerAjoutEvenement() - Ajoute/modifie un événement prévu et régénère le
  calendrier

  Gestion des événements imprévus

  - chargerEvenementsImprevus() - Affiche la liste des congés imprévus
  - confirmerAjoutEvenementImprevu() - Ajoute un événement imprévu et régénère le
  calendrier

  Opérations communes

  - supprimerEvenement(id, type) - Supprime un événement et régénère le calendrier
  - modifierEvenement(id, type) - Pré-remplit le formulaire pour édition
  - basculerVerrouillageEvenement(id, type) - Verrouille/déverrouille un événement

  Statistiques

  - afficherStatistiquesTrimestre() - Calcule et affiche : nombre de semaines,
  jours de cours, congés

  Utilitaires de dates

  - creerDateLocale(dateStr) - Crée un objet Date depuis YYYY-MM-DD
  - formaterDateTrimestreYMD(date) - Formate un Date en YYYY-MM-DD (préfixé pour
  éviter conflits)
  - estWeekend(date) - Vérifie si une date est samedi/dimanche
  - obtenirNomJour(date) - Retourne le nom du jour (Lundi, Mardi, etc.)
  - estDansPlage(date, debut, fin) - Vérifie si date est dans une plage

  Dépendances

  Lit depuis :
  - config.js (variables globales - module chargé avant)

  Écrit dans :
  - localStorage.calendrierComplet - Calendrier complet généré
  - localStorage.cadreCalendrier - Dates du trimestre
  - localStorage.evenementsPrevus - Congés prévus
  - localStorage.evenementsImprevus - Congés imprévus

  Utilisé par (via API publique) :
  - calendrier-vue.js - Lit calendrierComplet pour affichage visuel
  - saisie-presences.js - Lit via obtenirCalendrierComplet() pour calcul indices
  - tableau-bord-apercu.js - Lit pour affichage statistiques
  - Futurs modules : horaire.js, portfolio.js

  Initialisation

  Fonction : initialiserModuleTrimestre()

  Appelée depuis : navigation.js lors du changement de section vers "Trimestre"

  Ordre de chargement : Script n°3 dans index 70 (refonte des modules).html

  Séquence d'initialisation :
  1. Vérifier que l'élément DOM #debutTrimestre existe
  2. Charger les données existantes (cadre + événements)
  3. Générer le calendrier complet (genererCalendrierComplet())
  4. Afficher les statistiques (afficherStatistiquesTrimestre())

  Tests

  Console navigateur

  // Vérifier que le calendrier existe
  !!localStorage.getItem('calendrierComplet')  // true

  // Voir le nombre de jours générés
  Object.keys(JSON.parse(localStorage.getItem('calendrierComplet'))).length  // 
  ~124

  // Tester l'API publique
  typeof obtenirCalendrierComplet === 'function'  // true
  typeof obtenirInfosJour === 'function'  // true

  // Voir le contenu du calendrier
  console.table(obtenirCalendrierComplet())

  // Tester une date spécifique
  obtenirInfosJour('2025-08-21')
  // { statut: "cours", numeroSemaine: 1, numeroJour: 1, jourSemaine: "Jeudi" }

  // Vérifier les statistiques
  const cal = obtenirCalendrierComplet();
  const joursCours = Object.values(cal).filter(j => j.statut === 'cours' ||
  j.statut === 'reprise').length;
  console.log(`Jours de cours: ${joursCours}`);

  Tests fonctionnels

  1. Test génération initiale :
    - Aller dans Réglages → Trimestre
    - Saisir : Début (2025-08-21), Fin cours (2025-12-12), Fin trimestre
  (2025-12-22)
    - Sauvegarder
    - Vérifier : Console doit afficher "✅ Calendrier complet généré: X jours"
    - Vérifier : Cartes statistiques affichent nombre semaines/jours/congés
  2. Test ajout congé prévu :
    - Ajouter congé : Date 2025-09-01, Description "Fête du travail"
    - Ajouter reprise : Date 2025-09-04, Horaire "Horaire du lundi"
    - Vérifier : Console affiche régénération du calendrier
    - Vérifier : Statistiques mises à jour automatiquement
  3. Test lecture par autre module :
    - Aller dans Calendrier → Vue calendrier
    - Vérifier : Affichage visuel correct (jours de cours en vert, congés en
  rouge)
    - Vérifier : Console ne montre PAS de recalculs (lectures uniquement)
  4. Test persistance :
    - Recharger la page (F5)
    - Vérifier : Données toujours présentes
    - Vérifier : API obtenirCalendrierComplet() retourne immédiatement les données

  Algorithme de génération des semaines

  Principe : 1 semaine académique = 5 jours de cours consécutifs (indépendamment
  du calendrier civil)

  Logique :
  Compteur joursDeCoursMemeSemaine = 0
  Compteur numeroSemaine = 0

  Pour chaque jour de cours ou reprise:
    joursDeCoursMemeSemaine++

    Si joursDeCoursMemeSemaine == 1:
      numeroSemaine++  // Nouvelle semaine

    Si joursDeCoursMemeSemaine >= 5:
      joursDeCoursMemeSemaine = 0  // Réinitialiser

  Exemple :
  - Jours 1-5 → Semaine 1
  - Congé (pas compté)
  - Jours 6-10 → Semaine 2
  - Reprise (jour 11) → Continue semaine 3

  Problèmes connus

  "Invalid Date" ou dates mal formatées

  Cause : Conflit de nom avec d'autres fonctions formaterDate() dans d'autres
  modules

  Solution : Le module utilise formaterDateTrimestreYMD() avec préfixe unique. Ne
  pas renommer cette fonction.

  Calendrier vide après rechargement

  Cause : calendrierComplet pas généré ou localStorage corrompu

  Solution :
  // Forcer régénération
  genererCalendrierComplet();
  // OU dans l'interface : Réglages → Trimestre → Sauvegarder le cadre

  Statistiques incorrectes (nombre de jours/semaines)

  Cause : Calendrier pas régénéré après modification

  Solution : Le module régénère automatiquement après chaque modification. Si
  problème persiste :
  genererCalendrierComplet();
  afficherStatistiquesTrimestre();

  Événements non pris en compte

  Cause : Événement ajouté mais calendrier pas régénéré

  Solution : Toutes les fonctions d'ajout/suppression appellent automatiquement
  genererCalendrierComplet(). Vérifier qu'aucune modification manuelle du
  localStorage n'est faite en dehors du module.

  Règles de modification

  ⚠️ ZONES CRITIQUES - NE PAS MODIFIER :
  - Fonction genererCalendrierComplet() (lignes 433-564) - Coeur de la logique
  - API publique obtenirCalendrierComplet() et obtenirInfosJour() (lignes 748-761)
  - Noms des fonctions utilitaires (préfixées pour éviter conflits)
  - Structure du calendrierComplet en localStorage

  ✅ ZONES MODIFIABLES :
  - Interface utilisateur (HTML généré par chargerEvenementsPrevus/Imprevus)
  - Styles visuels des cartes
  - Messages de notifications
  - Ajout de nouveaux champs dans formulaires (si non-critique)

  Historique

  - Session initiale (août 2025) : Création du module de base avec gestion
  événements
  - Refonte Commit 1 (octobre 2025) :
    - Transformation en module SOURCE
    - Ajout génération calendrierComplet
    - API publique obtenirCalendrierComplet() et obtenirInfosJour()
    - Préfixage des fonctions utilitaires (formaterDateTrimestreYMD)
  - Session 20 octobre 2025 :
    - Ajout support reprises avec indication jour remplacé (jourRemplace)
    - Amélioration gestion semaines de planification/examens
    - Documentation complète en-tête de fichier

  ---
  Référence code : /js/trimestre.js (761 lignes)

  Modules liés : calendrier-vue.js (lecteur), saisie-presences.js (lecteur),
  horaire.js (à refondre)