Voici la documentation technique complète du module calendrier-vue.js :

  ---
  Module calendrier-vue.js

  Vue d'ensemble

  Module LECTEUR qui affiche visuellement le calendrier scolaire complet dans la
  section "Présences › Vue calendaire".

  Lit le calendrierComplet généré par trimestre.js (source unique) et le
  transforme en interface visuelle interactive : calendriers mensuels,
  statistiques, légende, et interactions (illumination de semaines au survol).

  Principe fondamental : Ce module ne calcule RIEN. Il lit uniquement les données
  du calendrier et les affiche.

  Type

  - SOURCE - Génère et stocke des données
  - LECTEUR - Lit et affiche des données

  Données gérées

  Lecture localStorage (aucune écriture)

  1. calendrierComplet (lecture seule)
  - Clé : calendrierComplet
  - Source : trimestre.js via obtenirCalendrierComplet()
  - Usage : Lecture des statuts de jours (cours/congé/reprise/weekend)

  2. cadreCalendrier (lecture seule)
  - Clé : cadreCalendrier
  - Usage : Déterminer session (A/H) et dates clés pour affichage

  3. evenementsPrevus / evenementsImprevus (lecture seule)
  - Clés : evenementsPrevus, evenementsImprevus
  - Usage : Compter les congés avec reprises pour statistiques

  4. seancesHoraire (lecture seule)
  - Clé : seancesHoraire
  - Usage : Distinguer jours de cours "réels" (avec horaire) des jours ouvrables

  API publique

  initialiserModuleVueCalendaire()

  Description : Fonction d'initialisation principale du module. Appelée par
  navigation.js lors du chargement de la section "Présences › Vue calendaire".

  Paramètres : Aucun

  Retour : void

  Comportement :
  1. Vérifie que l'élément DOM #presences-calendrier existe
  2. Appelle afficherCalendrierScolaire() si section active
  3. Sortie silencieuse si section non active

  Utilisation :
  // Appelée automatiquement par navigation.js
  initialiserModuleVueCalendaire();

  afficherCalendrierScolaire()

  Description : Génère et affiche le calendrier visuel complet (statistiques +
  mois + légende).

  Paramètres : Aucun

  Retour : void

  Comportement :
  1. Lit calendrierComplet via obtenirCalendrierComplet() (API de trimestre.js)
  2. Lit les paramètres (cadre, événements, horaire)
  3. Détermine les mois à afficher (session A: août-décembre / session H:
  janvier-mai)
  4. Génère le HTML (statistiques + 5 calendriers mensuels + légende)
  5. Injecte dans #conteneur-calendrier

  Utilisation :
  // Peut être appelée pour forcer un rafraîchissement
  afficherCalendrierScolaire();

  Fonctions secondaires

  Génération HTML

  genererHtmlMois(annee, mois, calendrierComplet)
  - Description : Génère le HTML d'un calendrier mensuel complet
  - Paramètres :
    - annee (Number) : Année à afficher
    - mois (Number) : Mois (1-12)
    - calendrierComplet (Object) : Calendrier depuis trimestre.js
  - Retour : (String) HTML du calendrier mensuel
  - Usage : Appelée 5 fois (session A: août-décembre, session H: janvier-mai)

  obtenirStatutJour(dateStr, calendrierComplet)
  - Description : Détermine le type, classe CSS et label d'un jour donné
  - Paramètres :
    - dateStr (String) : Date YYYY-MM-DD
    - calendrierComplet (Object) : Calendrier depuis trimestre.js
  - Retour : (Object) { type, classe, label, numeroSemaine }
  - Types retournés : 'cours', 'cours-reel', 'reprise', 'conge', 'weekend',
  'examens', 'planification', 'vide'

  Interactions visuelles

  illuminerSemaineAmelioree(dateStr)
  - Description : Illumine tous les jours d'une semaine au survol (outline orange)
  - Paramètres : dateStr (String) - Date YYYY-MM-DD
  - Utilisation : Appelée via onmouseenter sur cellules calendrier

  desilluminerSemaines()
  - Description : Retire l'illumination de toutes les semaines
  - Utilisation : Appelée via onmouseleave sur cellules calendrier

  Utilitaires de dates (avec préfixe anti-conflit)

  creerDateLocale(dateStr)
  - Description : Crée un objet Date local (évite timezone)
  - Paramètres : dateStr (String) - YYYY-MM-DD
  - Retour : (Date) Objet Date

  calendrierVue_formaterDate(date)
  - Description : Formate Date → YYYY-MM-DD (préfixé pour éviter conflits)
  - Paramètres : date (Date)
  - Retour : (String) Date formatée
  - Note : Préfixe calendrierVue_ pour éviter conflit avec autres modules

  obtenirNomJour(date)
  - Description : Retourne nom du jour (Lundi, Mardi, etc.)
  - Paramètres : date (Date)
  - Retour : (String) Nom du jour

  Dépendances

  Lit depuis :
  - localStorage.calendrierComplet (généré par trimestre.js)
  - localStorage.cadreCalendrier (généré par trimestre.js)
  - localStorage.evenementsPrevus (généré par trimestre.js)
  - localStorage.evenementsImprevus (généré par trimestre.js)
  - localStorage.seancesHoraire (généré par horaire.js)

  Utilise (API externe) :
  - obtenirCalendrierComplet() depuis trimestre.js
  - echapperHtml() depuis config.js (mentionné en commentaire, non utilisé
  actuellement)

  Utilisé par :
  - Interface utilisateur (section "Présences › Vue calendaire")
  - Potentiellement calendrier-saisie.js (pour interactions futures)

  Modules requis (chargement avant) :
  - config.js - Variables globales CSS
  - trimestre.js - Source du calendrier complet

  Initialisation

  Fonction : initialiserModuleVueCalendaire()

  Appelée depuis : navigation.js lors de l'activation de la section "Présences"

  Ordre de chargement : Script n°9 dans index 70 (refonte des modules).html

  Conditions d'initialisation :
  - Élément DOM #presences-calendrier doit exister
  - calendrierComplet doit être généré (par trimestre.js)

  Affichage visuel

  Codes couleurs des jours

  | Type                      | Couleur fond                         | Couleur
  texte  | Bordure           |
  |---------------------------|--------------------------------------|------------
  ----|-------------------|
  | Cours réel (avec horaire) | var(--jour-cours-reel-bg) Bleu léger | Bleu
  principal | Bleu moyen (gras) |
  | Cours (sans horaire)      | Blanc                                | Bleu
  principal | Bleu carte        |
  | Reprise                   | var(--reprise-bg) Violet             | Orange
  foncé   | Orange (gras)     |
  | Congé                     | var(--conge-bg) Rouge pâle           | Rouge foncé
      | Rouge (gras)      |
  | Weekend                   | var(--weekend-bg) Gris               | Gris moyen
      | Gris              |
  | Semaine examens           | var(--examens-bg) Rose               | Bleu
  principal | Rose              |
  | Semaine planification     | var(--planification-bg) Mauve        | Bleu
  principal | Mauve             |

  Layout

  - Grille : 2 colonnes × 2-3 lignes (5 mois affichés)
  - Statistiques : 3 cartes (Semaines / Jours / Congés avec reprises)
  - Légende : 4 types de jours avec pastilles colorées
  - Astuce interactive : Message expliquant le survol

  Tests

  Console navigateur

  // Vérifier disponibilité du module
  typeof initialiserModuleVueCalendaire === 'function'  // true
  typeof afficherCalendrierScolaire === 'function'  // true

  // Vérifier que le calendrier source existe
  !!localStorage.getItem('calendrierComplet')  // true

  // Tester la fonction de formatage
  const testDate = new Date(2025, 7, 21);  // 21 août 2025
  calendrierVue_formaterDate(testDate)  // "2025-08-21"

  // Tester obtention du statut d'un jour
  const calendrier = obtenirCalendrierComplet();
  const statut = obtenirStatutJour('2025-08-21', calendrier);
  console.log(statut);
  // { type: "cours-reel", classe: "cal-cours-reel", label: "Sem. 1", 
  numeroSemaine: 1 }

  Tests fonctionnels

  1. Test affichage initial :
    - Aller dans Présences → Vue calendaire
    - Vérifier : 5 calendriers mensuels affichés
    - Vérifier : Statistiques en haut (semaines/jours/congés)
    - Vérifier : Légende en bas avec 4 types de jours
  2. Test couleurs :
    - Vérifier : Jours de cours en bleu léger (gras si horaire configuré)
    - Vérifier : Weekends en gris
    - Vérifier : Congés en rouge
    - Vérifier : Reprises en violet/orange
  3. Test interaction illumination :
    - Survoler un jour de cours
    - Vérifier : Tous les jours de la même semaine s'illuminent (outline orange)
    - Retirer la souris
    - Vérifier : Illumination disparaît
  4. Test cohérence avec trimestre.js :
    - Noter les statistiques affichées (ex: 15 semaines, 75 jours)
    - Aller dans Réglages → Trimestre
    - Vérifier : Mêmes statistiques affichées (source unique)
  5. Test persistance :
    - Recharger la page (F5)
    - Revenir dans Présences → Vue calendaire
    - Vérifier : Calendrier affiché instantanément (lecture localStorage)

  Interactions utilisateur

  Survol de jour (hover)

  - Déclencheur : onmouseenter sur cellule .jour-calendrier
  - Action : Appelle illuminerSemaineAmelioree(dateStr)
  - Effet : Outline orange sur tous les jours de la semaine

  Retrait souris (unhover)

  - Déclencheur : onmouseleave sur cellule
  - Action : Appelle desilluminerSemaines()
  - Effet : Retire tous les outlines

  Clic sur jour de cours (futur)

  - Déclencheur : onclick sur cellule avec data-type="cours-reel"
  - Action : Appelle ouvrirSaisiePresence(dateStr) (fonction externe)
  - Effet : Ouvre formulaire saisie des présences (module calendrier-saisie.js)

  Problèmes connus

  Calendrier vide ou "pas de données"

  Cause : calendrierComplet non généré ou localStorage corrompu

  Solution :
  1. Aller dans Réglages → Trimestre
  2. Sauvegarder le cadre calendrier (force régénération)
  3. Revenir dans Présences → Vue calendaire

  // OU forcer manuellement
  genererCalendrierComplet();  // depuis trimestre.js
  afficherCalendrierScolaire();  // depuis calendrier-vue.js

  Statistiques incohérentes

  Cause : Lecture des valeurs DOM au lieu de localStorage

  Solution : Le module lit désormais depuis trimestre.js (lignes 415-420). Si
  problème persiste :
  // Vérifier que trimestre.js a calculé les stats
  document.getElementById('nombreSemaines').textContent  // "15"
  document.getElementById('nombreJoursCours').textContent  // "75"

  Couleurs incorrectes (jours de cours non gras)

  Cause : seancesHoraire vide (horaire non configuré)

  Solution :
  1. Aller dans Réglages → Horaire
  2. Ajouter au moins une séance (ex: Lundi 8h30-11h30)
  3. Revenir dans Vue calendaire
  4. Jours correspondants deviennent bleu gras (cours-reel)

  Illumination ne fonctionne pas

  Cause : Attribut data-semaine vide (jour sans numéro de semaine)

  Solution : L'illumination fonctionne uniquement sur les jours de cours/reprises
  (avec numeroSemaine). Comportement normal pour weekends/congés.

  Règles de modification

  ⚠️ ZONES CRITIQUES - NE PAS MODIFIER :
  - Fonction obtenirStatutJour() (lignes 137-185) - Mapping statuts calendrier
  - Nom de fonction calendrierVue_formaterDate() - Préfixé pour éviter conflits
  - Lecture de calendrierComplet via obtenirCalendrierComplet() - Principe
  architectural
  - Attributs data-* des cellules (date, semaine, type) - Utilisés par
  interactions

  ✅ ZONES MODIFIABLES :
  - Styles CSS inline (couleurs, bordures, espacements)
  - Textes de légende et statistiques
  - Layout grille (nombre de colonnes)
  - Ajout de nouveaux événements interactifs (ex: tooltip au clic)

  Règle d'or : Ce module ne doit JAMAIS calculer de données calendaires. Toute
  logique de calcul appartient à trimestre.js.

  Historique

  - Version initiale (index 60, 17 octobre 2025) :
    - Création module séparé (extraction depuis calendrier.js)
    - Affichage calendriers mensuels
    - Interactions de base (illumination)
  - Refonte Commit 2 (octobre 2025) :
    - Transformation en module LECTEUR pur
    - Utilisation API obtenirCalendrierComplet() de trimestre.js
    - Suppression calculs redondants (semaines/jours)
    - Préfixage calendrierVue_formaterDate() (éviter conflits)
    - Lecture statistiques depuis trimestre.js (lignes 415-420)
  - Session 20 octobre 2025 :
    - Documentation complète en-tête
    - Support affichage reprises avec indication jour remplacé
    - Amélioration styles visuels (bordures, couleurs)

  ---
  Référence code : /js/calendrier-vue.js (540 lignes)

  Modules liés :
  - trimestre.js (source de données)
  - calendrier-saisie.js (utilise calendrier pour saisie)
  - tableau-bord-apercu.js (autre lecteur du calendrier)
