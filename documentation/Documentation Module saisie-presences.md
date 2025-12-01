Voici la documentation technique complète du module saisie-presences.js :

  ---
  Module saisie-presences.js

  Vue d'ensemble

  Module HYBRIDE (SOURCE + LECTEUR) qui gère la saisie des présences et calcule
  les indices d'assiduité (A).

  Fonctions doubles :
  1. SOURCE : Calcule et stocke les indices d'assiduité dans
  localStorage.indicesAssiduite
  2. LECTEUR : Lit le calendrier (trimestre.js) et l'horaire (horaire.js) pour
  l'interface de saisie

  Interface complète permettant de :
  - Saisir les présences jour par jour (heures + notes)
  - Calculer automatiquement les indices A (sommatif et alternatif)
  - Naviguer entre les dates de cours
  - Filtrer par groupe et trier par nom/assiduité
  - Verrouiller des dates pour empêcher modifications

  Type

  - SOURCE - Génère et stocke les indices d'assiduité (A)
  - LECTEUR - Lit calendrier et horaire pour affichage

  Données gérées

  Stockage localStorage (ÉCRITURE)

  1. indicesAssiduite (LA SOURCE pour l'indice A)
  - Clé : indicesAssiduite
  - Format : Objet avec deux méthodes de calcul
  - Structure : { sommatif: {}, alternatif: {}, dateCalcul: ISO8601 }

  Exemple :
  {
    "sommatif": {
      "2012345": 0.92,
      "2012346": 0.85
    },
    "alternatif": {
      "2012345": 0.95,
      "2012346": 0.80
    },
    "dateCalcul": "2025-10-23T14:30:00.000Z"
  }

  Formules :
  - Sommatif : Heures présentes ÷ Total heures données (depuis début trimestre)
  - Alternatif : Heures présentes ÷ (N × 2h) (sur N derniers cours, configurable
  via PAN)

  2. presences
  - Clé : presences
  - Format : Array d'objets présence
  - Structure : { date, da, heures, notes }

  Exemple :
  [
    { "date": "2025-08-21", "da": "2012345", "heures": 2, "notes": "Arrivé à 
  l'heure" },
    { "date": "2025-08-21", "da": "2012346", "heures": 1.5, "notes": "Retard 
  30min" },
    { "date": "2025-08-22", "da": "2012345", "heures": 0, "notes": "Absent sans 
  justification" }
  ]

  3. datesVerrouillees
  - Clé : datesVerrouillees
  - Format : Array de dates YYYY-MM-DD
  - Usage : Empêcher modification des présences saisies

  Lecture localStorage (LECTURE SEULE)

  - calendrierComplet (depuis trimestre.js)
  - seancesCompletes (depuis horaire.js)
  - groupeEtudiants (depuis etudiants.js)
  - seancesHoraire (depuis horaire.js)
  - modalitesEvaluation (depuis pratiques.js) - Pour le nombre de cours PAN

  API publique

  Calcul des indices (CORE)

  calculerEtSauvegarderIndicesAssiduite()
  Description : Fonction orchestratrice qui calcule les deux indices (sommatif +
  alternatif) pour tous les étudiants actifs et sauvegarde dans localStorage.

  Paramètres : Aucun

  Retour : (Object) Structure { sommatif, alternatif, dateCalcul }

  Appelée :
  - Après chaque enregistrement de présences
  - À l'initialisation du module
  - Lors du changement de groupe

  Utilisation :
  const indices = calculerEtSauvegarderIndicesAssiduite();
  console.log(indices.sommatif['2012345']);  // 0.92
  console.log(indices.alternatif['2012345']); // 0.95

  calculerAssiduiteSommative(da)
  Description : Calcule l'assiduité depuis le début du trimestre (total heures
  présentes ÷ total heures données).

  Paramètres :
  - da (String) : Numéro DA de l'étudiant

  Retour : (Number) Indice entre 0 et 1

  Formule :
  Total heures présentes ÷ (Nombre de séances saisies × 2h)

  Utilisation :
  const indice = calculerAssiduiteSommative('2012345');  // 0.92
  console.log(`Assiduité : ${(indice * 100).toFixed(1)}%`);  // "92.0%"

  calculerAssiduiteAlternative(da)
  Description : Calcule l'assiduité sur les N derniers cours (N configurable via
  modalités PAN).

  Paramètres :
  - da (String) : Numéro DA de l'étudiant

  Retour : (Number) Indice entre 0 et 1

  Configuration : Lit modalitesEvaluation.configPAN.nombreCours (défaut: 3 cours =
   6 séances)

  Formule :
  Heures présentes sur N dernières séances ÷ (N × 2h)

  Utilisation :
  const indice = calculerAssiduiteAlternative('2012345');  // 0.95
  // Basé sur les 3 derniers cours (6 séances)

  obtenirConfigurationNotation()
  Description : Fonction utilitaire pour lire la configuration PAN (utilisée par
  autres modules).

  Paramètres : Aucun

  Retour : (Object) Configuration complète de notation

  Utilisation :
  const config = obtenirConfigurationNotation();
  const nombreCours = config.configPAN?.nombreCours || 3;

  Interface de saisie

  initialiserModuleSaisiePresences()
  Description : Initialise le module (charge groupes, vérifie config, affiche
  interface).

  Paramètres : Aucun

  Retour : void

  Appelée : Par navigation.js lors de l'activation de la section "Présences ›
  Saisie"

  initialiserSaisiePresences()
  Description : Charge le tableau de saisie pour la date sélectionnée.

  Paramètres : Aucun (lit depuis #date-cours)

  Retour : void

  enregistrerPresences()
  Description : Enregistre les présences saisies, calcule les indices, et
  rafraîchit le tableau de bord.

  Paramètres : Aucun

  Retour : void

  Comportement :
  1. Valide la date (pas future, pas verrouillée)
  2. Sauvegarde dans localStorage.presences
  3. Appelle calculerEtSauvegarderIndicesAssiduite()
  4. Rafraîchit le tableau de bord si visible
  5. Affiche notification de succès

  Navigation entre dates

  allerCoursSuivant()
  Description : Navigate vers le prochain jour de cours.

  allerCoursPrecedent()
  Description : Navigate vers le jour de cours précédent.

  mettreAJourBoutonsNavigation()
  Description : Active/désactive les boutons selon disponibilité cours
  précédent/suivant.

  Actions rapides

  tousPresents()
  Description : Met tous les étudiants présents (heures complètes).

  reinitialiserSaisie()
  Description : Réinitialise toutes les heures à 0 et vide les notes.

  Verrouillage

  basculerVerrouillageDate(dateStr)
  Description : Verrouille/déverrouille une date pour empêcher modifications.

  Paramètres :
  - dateStr (String) : Date YYYY-MM-DD

  Retour : void

  Ouverture depuis calendrier

  ouvrirSaisiePresence(dateStr)
  Description : Ouvre la saisie depuis la vue calendaire (clic sur jour).

  Paramètres :
  - dateStr (String) : Date YYYY-MM-DD

  Retour : void

  Fonctions secondaires

  Validation et vérification

  validerDateSaisie(dateStr)
  - Vérifie qu'une date est valide pour saisie
  - Retourne { valide, raison, verrouille }
  - Raisons : 'vide', 'pas-cours', 'future', 'hors-calendrier'

  estDateVerrouillee(dateStr)
  - Vérifie si une date est verrouillée
  - Retourne boolean

  verifierConfigurationFormatHoraire()
  - Affiche alerte si horaire non configuré
  - Propose lien vers configuration

  Calendrier (lecture depuis trimestre.js)

  obtenirInfosJourCalendrier(dateStr)
  - Lit les infos d'un jour via API de trimestre.js
  - Fallback: lecture directe localStorage si API indisponible

  estJourDeCoursReel(dateStr)
  - Vérifie si date est jour de cours/reprise
  - Utilise calendrierComplet

  obtenirToutesDatesCours()
  - Retourne toutes les dates avec séances réelles
  - Option 1: Utilise seancesCompletes (préféré)
  - Option 2: Fallback - filtre calendrierComplet par jours de l'horaire

  Séances (lecture depuis horaire.js)

  obtenirHeuresSeance(dateStr)
  - Retourne durée totale des séances d'un jour
  - Simplification pédagogique : Toujours 2h (ligne 424)
  - Lit seancesCompletes ou utilise fallback

  calculerNombreSeances(dateJusqua)
  - Compte le nombre de séances jusqu'à une date
  - Utilise seancesCompletes

  obtenirDureeMaxSeance()
  - Retourne durée maximale par séance
  - Fixé à 2h (simplification)

  Statistiques

  calculerTotalHeuresPresence(da, dateActuelle)
  - Somme des heures de présence avant une date
  - Utilisé pour calculs d'assiduité

  calculerTauxAssiduite(da, dateActuelle, heuresSeanceActuelle)
  - Calcule taux % (pour affichage en temps réel)
  - Formule: (heures historique + heures séance actuelle) / heures théoriques × 
  100

  Interface visuelle

  obtenirClasseSaisie(heures, dureeMax)
  - Retourne classe CSS selon valeur saisie
  - Classes: 'saisie-absence' (0h), 'saisie-retard' (<max), 'saisie-present' (max)

  appliquerCodeCouleurSaisie(inputHeures, dureeMax)
  - Applique code couleur dynamique à un input
  - Rouge (0h), Orange (<max), Vert (max)

  mettreAJourLigne(da, dateStr)
  - Met à jour stats d'une ligne après modification
  - Recalcule taux et applique code couleur

  Formatage

  formaterHeuresAffichage(heures)
  - Formate heures décimales → "2h30", "4h"

  formaterDateFrancais(dateStr)
  - Formate YYYY-MM-DD → "jeudi 21 août 2025"

  echapperHtml(str)
  - Échappe caractères HTML (sécurité XSS)
  - Utilise version de config.js si disponible

  Gestion groupes

  chargerGroupesPresences()
  - Charge liste des groupes dans select
  - Extrait groupes uniques depuis groupeEtudiants

  obtenirDonneesSelonMode(cle)
  - Obtient données selon mode actif (réel/démo)
  - Préfixe demo_ en mode démo

  Dépendances

  Lit depuis :
  - localStorage.calendrierComplet (généré par trimestre.js)
  - localStorage.seancesCompletes (généré par horaire.js)
  - localStorage.groupeEtudiants (généré par etudiants.js)
  - localStorage.seancesHoraire (généré par horaire.js)
  - localStorage.modalitesEvaluation (généré par pratiques.js)

  Écrit dans :
  - localStorage.indicesAssiduite - Indices A (sommatif + alternatif)
  - localStorage.presences - Enregistrements de présences
  - localStorage.datesVerrouillees - Dates verrouillées

  Utilise (API externes) :
  - obtenirCalendrierComplet() depuis trimestre.js
  - obtenirInfosJour() depuis trimestre.js
  - obtenirSeancesCompletes() depuis horaire.js (si disponible)
  - obtenirSeancesJour() depuis horaire.js (si disponible)
  - chargerTableauBordApercu() depuis tableau-bord-apercu.js (rafraîchissement)

  Utilisé par :
  - tableau-bord-apercu.js - Lit indicesAssiduite pour affichage
  - Futurs modules de statistiques/diagnostics

  Initialisation

  Fonction : initialiserModuleSaisiePresences()

  Appelée depuis : navigation.js lors de l'activation de "Présences › Saisie"

  Ordre de chargement : Script après trimestre.js et horaire.js

  Séquence d'initialisation :
  1. Vérifier élément DOM #presences-saisie
  2. Charger groupes (chargerGroupesPresences())
  3. Vérifier config horaire (verifierConfigurationFormatHoraire())
  4. Si date pré-remplie : initialiser tableau et calculer indices
  5. Sortie silencieuse si section non active

  Interface utilisateur

  Structure du tableau

  | DA      | Prénom  | Nom      | Présence | Notes        | Total
  heures | Assiduité |
  |---------|---------|----------|--------------------|--------------|------------
  --|-----------|
  | 2012345 | Alice   | Tremblay | 2h ✅               | À l'heure    | 45.5h
     | 92%       |
  | 2012346 | Bob     | Gagnon   | 1.5h ⚠️            | Retard 30min | 38.0h
    | 85%       |
  | 2012347 | Charlie | Roy      | 0h ❌               | Absent       | 30.5h
     | 75%       |

  Codes couleurs (inputs heures)

  - Vert (saisie-present) : Heures = max (2h) - Présent complet
  - Orange (saisie-retard) : 0 < Heures < max - Retard/départ anticipé
  - Rouge (saisie-absence) : Heures = 0 - Absent

  En-tête dynamique

  Jour de cours normal :
  Présences au cours du jeudi 21 août 2025 (2h) - Semaine 1  [🔓 Déverrouillée]

  Jour de reprise :
  Présences au cours du jeudi 4 septembre 2025 - REPRISE (horaire du Lundi) - 2h
  [🔒 Verrouillée]

  Boutons d'action

  - Tous 2h : Met tous présents (heures complètes)
  - ↻ : Réinitialise (0h, notes vides)
  - ← Cours précédent : Navigate vers date antérieure
  - Cours suivant → : Navigate vers date ultérieure
  - Enregistrer : Sauvegarde et calcule indices

  Filtres et tri

  Filtre par groupe :
  - Select "Tous les groupes" / "Groupe A" / "Groupe B"

  Tri :
  - Par nom (alphabétique)
  - Par assiduité croissante (plus faible en premier)
  - Par assiduité décroissante (plus élevé en premier)

  Tests

  Console navigateur

  // Vérifier disponibilité du module
  typeof initialiserModuleSaisiePresences === 'function'  // true
  typeof calculerEtSauvegarderIndicesAssiduite === 'function'  // true

  // Vérifier données
  !!localStorage.getItem('indicesAssiduite')  // true
  !!localStorage.getItem('presences')  // true

  // Voir les indices calculés
  const indices = JSON.parse(localStorage.getItem('indicesAssiduite'));
  console.table(indices.sommatif);
  console.table(indices.alternatif);

  // Tester calcul pour un étudiant
  const indiceSommatif = calculerAssiduiteSommative('2012345');
  console.log(`Sommatif: ${(indiceSommatif * 100).toFixed(1)}%`);

  const indiceAlternatif = calculerAssiduiteAlternative('2012345');
  console.log(`Alternatif: ${(indiceAlternatif * 100).toFixed(1)}%`);

  // Voir toutes les présences
  const presences = JSON.parse(localStorage.getItem('presences'));
  console.log(`Total présences saisies: ${presences.length}`);
  console.table(presences.slice(0, 10));  // 10 premières

  // Vérifier dates verrouillées
  const datesVerr = JSON.parse(localStorage.getItem('datesVerrouillees') || '[]');
  console.log('Dates verrouillées:', datesVerr);

  Tests fonctionnels

  1. Test saisie basique :
    - Aller dans Présences → Saisie
    - Sélectionner date de cours (ex: 2025-08-21)
    - Vérifier : Tableau chargé avec tous étudiants
    - Modifier heures (ex: 2h, 1.5h, 0h)
    - Vérifier : Codes couleurs appliqués (vert, orange, rouge)
    - Cliquer Enregistrer
    - Vérifier : Notification "✅ Présences enregistrées"
  2. Test calcul indices :
    - Saisir présences pour 3 dates différentes
    - Console: JSON.parse(localStorage.getItem('indicesAssiduite'))
    - Vérifier : Indices sommatif et alternatif calculés
    - Vérifier : Valeurs entre 0 et 1
  3. Test navigation :
    - Saisir présences pour date 1
    - Cliquer "Cours suivant →"
    - Vérifier : Date change automatiquement
    - Vérifier : Bouton "← Cours précédent" actif
    - Naviguer jusqu'à dernière date
    - Vérifier : Bouton "Cours suivant →" désactivé
  4. Test verrouillage :
    - Saisir présences pour une date
    - Cocher "🔒 Verrouiller"
    - Vérifier : Tous les inputs deviennent disabled
    - Vérifier : Boutons "Tous 2h", "↻", "Enregistrer" désactivés
    - Décocher verrouillage
    - Vérifier : Inputs redeviennent modifiables
  5. Test filtres et tri :
    - Sélectionner groupe dans select
    - Vérifier : Seuls étudiants du groupe affichés
    - Changer tri → "Assiduité croissante"
    - Vérifier : Étudiants triés du plus faible au plus élevé
    - Changer tri → "Assiduité décroissante"
    - Vérifier : Ordre inversé
  6. Test actions rapides :
    - Cliquer "Tous 2h"
    - Vérifier : Tous inputs passent à 2h (vert)
    - Cliquer "↻ Réinitialiser"
    - Vérifier : Tous inputs passent à 0h (rouge), notes vides
  7. Test cohérence avec tableau de bord :
    - Saisir présences
    - Enregistrer
    - Aller dans Tableau de bord → Aperçu
    - Vérifier : Indices A affichés correspondent
    - Console: Comparer indicesAssiduite avec valeurs affichées

  Formules détaillées

  Assiduité sommative (depuis début trimestre)

  Données:
  - presences = toutes les saisies de présences
  - datesSaisies = dates uniques où présences saisies

  Calcul:
  totalHeuresDonnees = datesSaisies.length × 2h
  totalHeuresPresentes = somme(presences où da = étudiant).heures

  Indice A_sommatif = totalHeuresPresentes ÷ totalHeuresDonnees

  Exemple :
  - 15 dates saisies → 30h données
  - Étudiant présent 27.5h
  - Indice = 27.5 ÷ 30 = 0.92 (92%)

  Assiduité alternative (N derniers cours)

  Données:
  - config = modalitesEvaluation.configPAN
  - nombreCours = config.nombreCours || 3
  - nombreSeances = nombreCours × 2  // 3 cours = 6 séances
  - datesSaisies = dates uniques triées
  - dernieresDates = datesSaisies.slice(-nombreSeances)

  Calcul:
  heuresTheoriques = nombreSeances × 2h  // 6 × 2 = 12h
  heuresPresentes = somme(presences où da = étudiant ET date in
  dernieresDates).heures

  Indice A_alternatif = heuresPresentes ÷ heuresTheoriques

  Exemple (3 derniers cours = 6 séances) :
  - 6 séances × 2h = 12h théoriques
  - Étudiant présent 11.5h sur ces 6 séances
  - Indice = 11.5 ÷ 12 = 0.96 (96%)

  Avantage PAN : Étudiant peut se rattraper en fin de trimestre (indice alternatif
   > sommatif)

  Simplifications pédagogiques

  1. Durée de séance fixe (ligne 424) :
  return 2;  // Toujours 2h par séance
  - Simplifie calculs pour enseignant
  - Même si horaire dit 3h ou 4h, on compte 2h (2 périodes de 60min)

  2. Format horaire :
  - Configuration formatHoraire existe ('1x4' ou '2x2')
  - Mais module utilise toujours 2h pour uniformité

  Problèmes connus

  Indices non calculés

  Cause : Aucune présence saisie ou fonction non appelée

  Solution :
  calculerEtSauvegarderIndicesAssiduite();
  // Vérifier
  JSON.parse(localStorage.getItem('indicesAssiduite'));

  Différence sommatif vs alternatif trop grande

  Cause : Configuration PAN incorrecte (nombre de cours)

  Solution :
  1. Aller dans Réglages → Pratiques de notation
  2. Vérifier "Nombre de cours pour l'indice alternatif"
  3. Valeur recommandée : 3 cours (= 6 séances)

  Navigation ne fonctionne pas

  Cause : seancesCompletes vide ou calendrierComplet absent

  Solution :
  1. Vérifier horaire configuré (Réglages → Horaire)
  2. Vérifier calendrier généré (Réglages → Trimestre)
  !!localStorage.getItem('seancesCompletes')  // true
  !!localStorage.getItem('calendrierComplet')  // true

  Dates ne s'affichent pas dans navigation

  Cause : obtenirToutesDatesCours() retourne tableau vide

  Solution :
  // Console
  const dates = obtenirToutesDatesCours();
  console.log('Dates de cours:', dates.length);
  // Si 0, vérifier horaire et calendrier

  Verrouillage ne persiste pas

  Cause : localStorage effacé ou mode navigation privée

  Solution :
  - Utiliser Import/Export pour backup
  - Éviter navigation privée

  Règles de modification

  ⚠️ ZONES CRITIQUES - NE PAS MODIFIER :
  - Fonctions calculerAssiduiteSommative() et calculerAssiduiteAlternative()
  (lignes 69-145) - Formules officielles
  - Simplification durée séance (ligne 424) - Décision pédagogique
  - Structure indicesAssiduite en localStorage - Lue par tableau-bord-apercu.js
  - API calculerEtSauvegarderIndicesAssiduite() - Point d'entrée unique

  ✅ ZONES MODIFIABLES :
  - Interface visuelle (HTML généré, styles CSS)
  - Codes couleurs des inputs
  - Textes de notifications
  - Critères de tri supplémentaires
  - Ajout de statistiques dans le tableau

  Règle d'or : Ce module est la SOURCE UNIQUE pour les indices A. Aucun autre
  module ne doit calculer l'assiduité.

  Historique

  - Version initiale : Saisie basique avec calcul simple
  - Refonte complète (octobre 2025) :
    - Transformation en module SOURCE pour indices A
    - Ajout calcul sommatif + alternatif
    - Intégration PAN (nombre de cours configurable)
    - Interface complète (navigation, filtres, tri, verrouillage)
    - Codes couleurs temps réel
    - Rafraîchissement automatique du tableau de bord
  - Session 20 octobre 2025 :
    - Support gestion groupes et mode démo
    - Optimisation calculs (éviter recalculs inutiles)
    - Documentation complète en-tête

  ---
  Référence code : /js/saisie-presences.js (1389 lignes)

  Modules liés :
  - trimestre.js (source calendrier)
  - horaire.js (source séances)
  - tableau-bord-apercu.js (lecteur indices)
  - pratiques.js (config PAN)
  - etudiants.js (liste étudiants)