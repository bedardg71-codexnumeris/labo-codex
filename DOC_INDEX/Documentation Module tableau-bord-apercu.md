Voici la documentation technique complète du module tableau-bord-apercu.js :

  ---
  Module tableau-bord-apercu.js

  Vue d'ensemble

  Module LECTEUR qui affiche les statistiques pédagogiques globales du tableau de
  bord.

  Lit les indices A-C-P calculés par d'autres modules (saisie-presences.js,
  portfolio.js) et génère :
  - Métriques globales : Moyennes de groupe pour A, C, P et nombre d'interventions
   requises
  - Distribution des risques : Répartition des étudiants par niveau (minimal →
  critique)
  - Alertes prioritaires : Liste des étudiants à risque ≥ élevé (seuil 0.4)

  Principe fondamental : Ce module ne calcule PAS les indices primaires (A-C-P).
  Il les lit depuis localStorage et les agrège pour affichage.

  Fondements théoriques : Basé sur le Guide de monitorage - Section ROUGE (indices
   primaires et calcul de risque).

  Type

  - SOURCE - Génère et stocke des données
  - LECTEUR - Lit et affiche des données

  Données gérées

  Lecture localStorage (aucune écriture)

  1. indicesAssiduite (lecture seule)
  - Clé : indicesAssiduite
  - Source : saisie-presences.js
  - Structure : { sommatif: { da: valeur }, alternatif: { da: valeur }, dateCalcul
   }
  - Usage : Lecture des indices A (assiduité)

  2. indicesEvaluation (lecture seule, futur)
  - Clé : indicesEvaluation
  - Source : portfolio.js (à créer)
  - Structure : { sommatif: { da: { completion, performance } }, alternatif: { da:
   { completion, performance } } }
  - Usage : Lecture des indices C (complétion) et P (performance)

  3. groupeEtudiants (lecture seule)
  - Clé : groupeEtudiants
  - Source : etudiants.js
  - Usage : Liste des étudiants (filtre actifs uniquement)

  4. modalitesEvaluation (lecture seule)
  - Clé : modalitesEvaluation
  - Source : pratiques.js
  - Usage : Configuration affichage (sommatif/alternatif)
  - Structure utilisée : { affichageTableauBord: { afficherSommatif, 
  afficherAlternatif } }

  API publique

  Initialisation et chargement

  initialiserModuleTableauBordApercu()
  Description : Initialise le module et charge les statistiques si la sous-section
   est active.

  Paramètres : Aucun

  Retour : void

  Appelée : Par navigation.js lors de l'activation de "Tableau de bord › Aperçu"

  Utilisation :
  // Appelée automatiquement par navigation.js
  initialiserModuleTableauBordApercu();

  chargerTableauBordApercu()
  Description : Fonction principale qui charge et affiche toutes les statistiques
  du tableau de bord.

  Paramètres : Aucun

  Retour : void

  Séquence :
  1. Lit groupeEtudiants depuis localStorage
  2. Filtre étudiants actifs (statut ≠ décrochage/abandon)
  3. Calcule indices pour chaque étudiant (calculerIndicesEtudiant())
  4. Affiche métriques globales (afficherMetriquesGlobales())
  5. Affiche distribution des risques (afficherDistributionRisques())
  6. Affiche alertes prioritaires (afficherAlertesPrioritaires())

  Utilisation :
  // Appelée par saisie-presences.js après enregistrement
  chargerTableauBordApercu();

  // Ou manuellement pour rafraîchir
  chargerTableauBordApercu();

  Calculs

  calculerIndicesEtudiant(da)
  Description : Récupère les indices A-C-P pour un étudiant et calcule son risque
  (sommatif + alternatif).

  Paramètres :
  - da (String) : Numéro DA de l'étudiant

  Retour : (Object) Structure complète des indices

  Structure retournée :
  {
    sommatif: {
      assiduite: 0.92,
      completion: 0.85,
      performance: 0.75,
      risque: 0.42,
      niveauRisque: "élevé"
    },
    alternatif: {
      assiduite: 0.95,
      completion: 0.90,
      performance: 0.80,
      risque: 0.32,
      niveauRisque: "modéré"
    }
  }

  Utilisation :
  const indices = calculerIndicesEtudiant('2012345');
  console.log(`Risque sommatif: ${(indices.sommatif.risque * 100).toFixed(1)}%`);
  console.log(`Niveau: ${indices.sommatif.niveauRisque}`);

  calculerRisque(assiduite, completion, performance)
  Description : Calcule le risque d'échec selon la formule du Guide de monitorage.

  Paramètres :
  - assiduite (Number) : Indice A (0-1)
  - completion (Number) : Indice C (0-1)
  - performance (Number) : Indice P (0-1)

  Retour : (Number) Risque entre 0 et 1

  Formule :
  Risque = 1 - (A × C × P)

  Cas particuliers :
  - Si A = 0 ou C = 0 ou P = 0 → Risque = 1 (critique)

  Utilisation :
  const risque = calculerRisque(0.92, 0.85, 0.75);
  console.log(risque);  // 0.413 (41.3% de risque)

  determinerNiveauRisque(risque)
  Description : Détermine le niveau de risque textuel selon les seuils du Guide.

  Paramètres :
  - risque (Number) : Indice de risque (0-1)

  Retour : (String) Niveau de risque

  Seuils :
  | Risque    | Niveau       |
  |-----------|--------------|
  | > 0.7     | "critique"   |
  | 0.5 - 0.7 | "très élevé" |
  | 0.4 - 0.5 | "élevé"      |
  | 0.3 - 0.4 | "modéré"     |
  | 0.2 - 0.3 | "faible"     |
  | ≤ 0.2     | "minimal"    |

  Utilisation :
  const niveau = determinerNiveauRisque(0.45);
  console.log(niveau);  // "élevé"

  Fonctions d'affichage

  Métriques globales

  afficherMetriquesGlobales(etudiants)
  Description : Affiche les moyennes de groupe pour A, C, P et interventions
  requises. Respecte la configuration d'affichage (sommatif/alternatif).

  Paramètres :
  - etudiants (Array) : Étudiants avec indices calculés

  Comportement :
  1. Lit modalitesEvaluation.affichageTableauBord
  2. CAS 1 : Les deux activés → Format "85% / 90%" (sommatif / alternatif)
  3. CAS 2 : Seulement alternatif → Affiche alternatif seul
  4. CAS 3 : Seulement sommatif (défaut) → Affiche sommatif seul

  Éléments HTML mis à jour :
  - #tb-total-etudiants : Nombre total d'étudiants actifs
  - #tb-assiduite-moyenne : Moyenne de l'indice A
  - #tb-completion-moyenne : Moyenne de l'indice C
  - #tb-performance-moyenne : Moyenne de l'indice P
  - #tb-interventions-requises : Nombre d'étudiants avec risque ≥ 0.4

  Distribution des risques

  afficherDistributionRisques(etudiants)
  Description : Génère un graphique de distribution (6 cartes colorées) montrant
  le nombre d'étudiants par niveau de risque.

  Paramètres :
  - etudiants (Array) : Étudiants avec indices calculés

  Élément HTML : #tb-distribution-risques

  Codes couleurs :
  | Niveau     | Couleur          | Variable CSS          |
  |------------|------------------|-----------------------|
  | Minimal    | Vert             | var(--risque-nul)     |
  | Faible     | Vert clair       | var(--risque-minimal) |
  | Modéré     | Jaune            | var(--risque-modere)  |
  | Élevé      | Orange           | var(--risque-eleve)   |
  | Très élevé | Rouge foncé      | #c0392b               |
  | Critique   | Rouge très foncé | #7f0000               |

  Alertes prioritaires

  afficherAlertesPrioritaires(etudiants)
  Description : Affiche un tableau des étudiants à risque ≥ élevé (seuil 0.4),
  triés par risque décroissant.

  Paramètres :
  - etudiants (Array) : Étudiants avec indices calculés

  Élément HTML : #tb-alertes-prioritaires

  Colonnes du tableau :
  1. Nom
  2. Prénom
  3. Groupe
  4. Assiduité (%)
  5. Complétion (%)
  6. Performance (%)
  7. Niveau de risque (badge coloré)
  8. Actions (bouton "Voir profil")

  Comportement :
  - Si aucun étudiant à risque ≥ 0.4 → Message "✅ Aucune intervention urgente 
  requise"
  - Sinon → Tableau trié par risque décroissant (plus critique en premier)

  Fonctions utilitaires

  setStatText(id, valeur)
  - Met à jour le contenu textuel d'un élément
  - Affiche warning si élément non trouvé

  formatPourcentage(valeur)
  - Convertit 0-1 → "85%"
  - Retourne "—" si valeur invalide

  Dépendances

  Lit depuis :
  - localStorage.indicesAssiduite (généré par saisie-presences.js)
  - localStorage.indicesEvaluation (généré par portfolio.js, à créer)
  - localStorage.groupeEtudiants (généré par etudiants.js)
  - localStorage.modalitesEvaluation (généré par pratiques.js)

  Utilise (fonctions externes) :
  - echapperHtml() depuis config.js (sécurité XSS)
  - afficherSousSection() depuis navigation.js (navigation vers profil)
  - chargerProfilEtudiant() depuis tableau-bord-profil.js (affichage profil)

  Utilisé par :
  - saisie-presences.js - Appelle chargerTableauBordApercu() après enregistrement
  - Interface utilisateur (section "Tableau de bord › Aperçu")

  Modules requis (chargement avant) :
  - config.js - Variables globales et echapperHtml()
  - navigation.js - Fonctions de navigation

  Initialisation

  Fonction : initialiserModuleTableauBordApercu()

  Appelée depuis : navigation.js lors de l'activation de "Tableau de bord"

  Ordre de chargement : Après config.js, navigation.js, saisie-presences.js

  Conditions d'initialisation :
  - Élément DOM #tableau-bord-apercu doit exister
  - Classe active sur cet élément déclenche le chargement automatique

  Configuration d'affichage (PAN)

  Trois modes d'affichage

  1. Sommatif seul (défaut) :
  {
    affichageTableauBord: {
      afficherSommatif: true,
      afficherAlternatif: false
    }
  }
  Affichage : "85%" (valeur unique)

  2. Alternatif seul :
  {
    affichageTableauBord: {
      afficherSommatif: false,
      afficherAlternatif: true
    }
  }
  Affichage : "90%" (valeur unique)

  3. Les deux :
  {
    affichageTableauBord: {
      afficherSommatif: true,
      afficherAlternatif: true
    }
  }
  Affichage : "85% / 90%" (sommatif / alternatif)

  Risque utilisé pour interventions

  - Si les deux affichés : Utilise risque sommatif par défaut
  - Si alternatif seul : Utilise risque alternatif
  - Si sommatif seul : Utilise risque sommatif

  Formules détaillées

  Risque d'échec

  Formule du Guide de monitorage :
  Risque = 1 - (A × C × P)

  Interprétation :
  - A × C × P = Probabilité de réussite
  - 1 - (A × C × P) = Probabilité d'échec (risque)

  Exemples :
  | A    | C    | P    | A×C×P | Risque | Niveau     |
  |------|------|------|-------|--------|------------|
  | 0.95 | 0.90 | 0.85 | 0.727 | 0.27   | Faible     |
  | 0.85 | 0.75 | 0.70 | 0.446 | 0.55   | Très élevé |
  | 0.50 | 0.60 | 0.40 | 0.120 | 0.88   | Critique   |
  | 0.00 | 0.80 | 0.70 | 0.000 | 1.00   | Critique   |

  Cas limite : Si un seul indice = 0 → Risque automatiquement = 1 (critique)

  Interventions requises

  Définition : Nombre d'étudiants avec Risque ≥ 0.4 (seuil "élevé")

  Calcul :
  interventions = étudiants.filter(e => e.risque >= 0.4).length

  Seuils d'intervention (Guide de monitorage) :
  - Risque < 0.4 : Suivi régulier
  - Risque ≥ 0.4 : Intervention proactive requise
  - Risque ≥ 0.7 : Intervention urgente requise

  Tests

  Console navigateur

  // Vérifier disponibilité du module
  typeof initialiserModuleTableauBordApercu === 'function'  // true
  typeof chargerTableauBordApercu === 'function'  // true
  typeof calculerIndicesEtudiant === 'function'  // true

  // Vérifier données sources
  !!localStorage.getItem('indicesAssiduite')  // true
  !!localStorage.getItem('groupeEtudiants')  // true

  // Tester calcul pour un étudiant
  const indices = calculerIndicesEtudiant('2012345');
  console.table(indices.sommatif);
  console.table(indices.alternatif);

  // Tester formule de risque
  const risque = calculerRisque(0.85, 0.75, 0.70);
  console.log(`Risque: ${(risque * 100).toFixed(1)}%`);  // "55.4%"

  const niveau = determinerNiveauRisque(risque);
  console.log(`Niveau: ${niveau}`);  // "très élevé"

  // Voir configuration d'affichage
  const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
  console.log(config.affichageTableauBord);

  Tests fonctionnels

  1. Test affichage basique :
    - Aller dans Tableau de bord → Aperçu
    - Vérifier : 4 cartes métriques affichées (Total, A, C, P, Interventions)
    - Vérifier : Distribution des risques (6 cartes colorées)
    - Vérifier : Section alertes prioritaires
  2. Test avec données :
    - Saisir présences pour 3 dates
    - Aller dans Tableau de bord → Aperçu
    - Vérifier : Assiduité moyenne > 0%
    - Vérifier : Distribution montre au moins 1 étudiant
    - Vérifier : Si risque ≥ 0.4, étudiant apparaît dans alertes
  3. Test mode sommatif seul :
    - Réglages → Pratiques → Cocher "Sommatif", décocher "Alternatif"
    - Tableau de bord → Aperçu
    - Vérifier : Format "85%" (valeur unique)
  4. Test mode les deux :
    - Réglages → Pratiques → Cocher les deux cases
    - Tableau de bord → Aperçu
    - Vérifier : Format "85% / 90%" (deux valeurs)
  5. Test alertes prioritaires :
    - Créer un étudiant avec faible assiduité (< 40%)
    - Tableau de bord → Aperçu
    - Vérifier : Étudiant apparaît dans tableau alertes
    - Vérifier : Badge rouge "critique" ou "très élevé"
    - Cliquer "Voir profil"
    - Vérifier : Navigation vers profil étudiant
  6. Test rafraîchissement auto :
    - Ouvrir Tableau de bord → Aperçu
    - Noter l'assiduité moyenne (ex: 85%)
    - Aller dans Présences → Saisie
    - Saisir présences, Enregistrer
    - Revenir Tableau de bord → Aperçu
    - Vérifier : Valeurs mises à jour automatiquement
  7. Test distribution des risques :
    - Vérifier somme des 6 cartes = Total étudiants
    - Vérifier codes couleurs (vert → jaune → orange → rouge)
    - Vérifier capitalisation des noms ("Minimal", "Critique")

  Métriques affichées

  Carte 1 : Total étudiants

  - Valeur : Nombre d'étudiants actifs (statut ≠ décrochage/abandon)
  - Élément : #tb-total-etudiants

  Carte 2 : Assiduité moyenne

  - Valeur : Moyenne de l'indice A du groupe
  - Formule : SOMME(A_étudiants) / NOMBRE_étudiants
  - Format : "85%" ou "85% / 90%"
  - Élément : #tb-assiduite-moyenne

  Carte 3 : Complétion moyenne

  - Valeur : Moyenne de l'indice C du groupe
  - Formule : SOMME(C_étudiants) / NOMBRE_étudiants
  - Format : "75%" ou "75% / 80%"
  - Élément : #tb-completion-moyenne
  - Note : Actuellement 0% (indices C non calculés, en attente de portfolio.js)

  Carte 4 : Performance moyenne

  - Valeur : Moyenne de l'indice P du groupe
  - Formule : SOMME(P_étudiants) / NOMBRE_étudiants
  - Format : "70%" ou "70% / 75%"
  - Élément : #tb-performance-moyenne
  - Note : Actuellement 0% (indices P non calculés, en attente de portfolio.js)

  Carte 5 : Interventions requises

  - Valeur : Nombre d'étudiants avec Risque ≥ 0.4
  - Formule : COUNT(étudiants WHERE risque >= 0.4)
  - Élément : #tb-interventions-requises

  Problèmes connus

  Indices C et P toujours à 0%

  Cause : Module portfolio.js pas encore créé, indicesEvaluation vide

  Solution : Normal pour l'instant. Une fois portfolio.js implémenté :
  // portfolio.js devra créer cette structure
  localStorage.setItem('indicesEvaluation', JSON.stringify({
    sommatif: { '2012345': { completion: 0.85, performance: 0.75 } },
    alternatif: { '2012345': { completion: 0.90, performance: 0.80 } }
  }));

  Tableau de bord ne se rafraîchit pas

  Cause : chargerTableauBordApercu() non appelée après modification

  Solution :
  // Appel manuel
  chargerTableauBordApercu();

  // Ou vérifier que saisie-presences.js appelle bien la fonction (lignes 
  1005-1018)

  Alertes prioritaires vides malgré étudiants faibles

  Cause : Risque calculé < 0.4 (seuil "élevé")

  Solution : Vérifier calcul du risque :
  const indices = calculerIndicesEtudiant('2012345');
  console.log('Risque:', indices.sommatif.risque);  // Doit être >= 0.4
  // Si A=0.50, C=0, P=0 → Risque = 1 (apparaît)
  // Si A=0.70, C=0.70, P=0.70 → Risque = 0.657 (apparaît)
  // Si A=0.80, C=0.80, P=0.80 → Risque = 0.488 (apparaît)

  Format "85% / 90%" ne s'affiche pas

  Cause : Configuration PAN incorrecte

  Solution :
  // Vérifier config
  const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
  console.log(config.affichageTableauBord);
  // Doit être : { afficherSommatif: true, afficherAlternatif: true }

  Distribution des risques montre tous à "minimal"

  Cause : Indices C et P à 0, mais A élevé → Risque = 1 (critique)

  Explication : Si C=0 ou P=0, la formule 1 - (A × C × P) donne toujours Risque =
  1
  // Exemple
  calculerRisque(0.95, 0, 0);  // Retourne 1 (critique)

  Solution temporaire : Attendre implémentation de portfolio.js

  Règles de modification

  ⚠️ ZONES CRITIQUES - NE PAS MODIFIER :
  - Fonction calculerRisque() (lignes 140-147) - Formule officielle du Guide
  - Fonction determinerNiveauRisque() (lignes 163-170) - Seuils officiels
  - Lecture de indicesAssiduite (ligne 94) - Couplage avec saisie-presences.js
  - Structure retournée par calculerIndicesEtudiant() - Utilisée par d'autres
  modules

  ✅ ZONES MODIFIABLES :
  - Styles visuels (couleurs, bordures, espacements)
  - Textes d'interface (labels, messages)
  - Ajout de nouvelles métriques (ex: taux de remise, moyenne SOLO)
  - Format d'affichage des pourcentages (ex: "85.5%" au lieu de "86%")

  Règle d'or : Ce module est un LECTEUR pur. Il ne doit JAMAIS calculer les
  indices primaires (A-C-P). Ces calculs appartiennent à saisie-presences.js et
  portfolio.js.

  Historique

  - Version initiale : Affichage basique des statistiques
  - Refonte octobre 2025 :
    - Transformation en module LECTEUR pur
    - Lecture des indices depuis indicesAssiduite (saisie-presences.js)
    - Support des deux modes (sommatif/alternatif)
    - Calcul du risque selon formule du Guide
    - Distribution des risques (6 niveaux)
    - Alertes prioritaires avec tri par risque
    - Rafraîchissement automatique depuis saisie-presences.js
  - Session 20 octobre 2025 :
    - Support affichage double "85% / 90%"
    - Configuration via modalitesEvaluation.affichageTableauBord
    - Documentation complète en-tête

  ---
  Référence code : /js/tableau-bord-apercu.js (461 lignes)

  Modules liés :
  - saisie-presences.js (source indices A)
  - portfolio.js (source indices C et P, à créer)
  - pratiques.js (config affichage)
  - etudiants.js (liste étudiants)