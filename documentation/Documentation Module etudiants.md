Voici la documentation technique complète du module etudiants.js :

  ---
  Module etudiants.js

  Vue d'ensemble

  Module LECTEUR/AFFICHAGE qui gère l'affichage de la liste des étudiants dans la
  section "Tableau de bord › Liste des individus".

  Rôle principal : Afficher un tableau complet des étudiants avec leurs
  indicateurs de performance (assiduité, complétion), permettre le filtrage et la
  recherche, et naviguer vers les profils individuels.

  Responsabilités :
  - Affichage tableau étudiants : Liste complète avec DA, groupe, nom, prénom,
  programme
  - Calcul de l'assiduité (A) : Taux global basé sur les présences saisies
  - Calcul de la complétion (C) : Taux basé sur les artefacts remis vs évalués
  - Filtrage : Par groupe, programme, statut
  - Recherche : Par nom/prénom
  - Navigation : Vers le profil/portfolio détaillé de l'étudiant
  - Codes couleurs : Vert (≥85%), Jaune (≥70%), Rouge (<70%)

  Principe fondamental : Ce module est un lecteur pur. Il lit les données depuis
  localStorage et les agrège pour affichage, sans modifier les sources.

  Type

  - SOURCE - Génère et stocke des données
  - LECTEUR - Lit et affiche des données
  - CONFIGURATION - Définit constantes et variables globales
  - SYSTÈME - Gestion de la navigation et de l'état de l'interface
  - INITIALISATION - Point d'entrée et orchestration du démarrage

  Données gérées

  Lecture localStorage (aucune écriture)

  1. groupeEtudiants (lecture seule)
  - Clé : groupeEtudiants (ou demo_groupeEtudiants selon mode)
  - Source : Module gestion des étudiants
  - Structure : Array<{ da, nom, prenom, groupe, programme, statut, sa, caf }>
  - Usage : Liste complète des étudiants à afficher

  2. presences (lecture seule)
  - Clé : presences
  - Source : saisie-presences.js
  - Structure : Array<{ date, da, heures, notes }>
  - Usage : Calcul de l'assiduité (heures présentes)

  3. evaluationsSauvegardees (lecture seule)
  - Clé : evaluationsSauvegardees
  - Source : Module évaluations
  - Structure : Array<{ etudiantDA, productionId, ... }>
  - Usage : Calcul de la complétion (artefacts remis)

  4. listeGrilles (lecture seule)
  - Clé : listeGrilles
  - Source : Module productions
  - Structure : Array<{ id, nom, ... }>
  - Usage : Liste des productions (pour complétion)

  API publique

  Initialisation

  initialiserModuleListeEtudiants()
  Description : Initialise le module de liste des étudiants. Appelée par main.js
  et lors des changements de section.

  Paramètres : Aucun

  Retour : void

  Séquence :
  1. Vérifie que l'élément DOM #tbody-tableau-bord-liste existe
  2. Appelle chargerOptionsFiltres() (groupes et programmes)
  3. Appelle afficherListeEtudiantsConsultation() (tableau)
  4. Sortie silencieuse si section non active

  Utilisation :
  // Appelée automatiquement par main.js
  initialiserModuleListeEtudiants();

  // Ou manuellement pour recharger
  initialiserModuleListeEtudiants();

  rechargerListeEtudiants()
  Description : Alias pour forcer le rechargement du module. Appelée par
  navigation.js lors du changement vers la sous-section liste.

  Paramètres : Aucun

  Retour : void

  Utilisation :
  // Depuis navigation.js
  rechargerListeEtudiants();

  Affichage principal

  afficherListeEtudiantsConsultation()
  Description : FONCTION PRINCIPALE. Affiche le tableau des étudiants avec
  assiduité et complétion.

  Paramètres : Aucun

  Retour : void

  Séquence :
  1. Lit groupeEtudiants depuis localStorage
  2. Applique les filtres via filtrerEtudiants()
  3. Trie par nom alphabétique
  4. Pour chaque étudiant :
    - Calcule assiduité via calculerAssiduitéGlobale()
    - Calcule complétion via calculerTauxCompletion()
    - Détermine couleurs via obtenirCouleurAssiduite() et
  obtenirCouleurCompletion()
  5. Génère le HTML du tableau
  6. Met à jour le compteur
  7. Gère l'affichage du message vide si aucun étudiant

  Utilisation :
  // Appelée automatiquement après filtrage
  afficherListeEtudiantsConsultation();

  Calculs d'indicateurs

  calculerAssiduitéGlobale(da)
  Description : Calcule le taux d'assiduité global d'un étudiant jusqu'à
  aujourd'hui.

  Paramètres :
  - da (String) : Numéro DA de l'étudiant

  Retour : (Number) Taux d'assiduité en pourcentage (0-100)

  Formule :
  Assiduité = (Total heures présentes / Nombre séances saisies × Durée séance) ×
  100

  Logique :
  1. Compte les dates uniques où l'étudiant a des présences saisies
  2. Calcule heures offertes = nombreSeances × dureeSeance
  3. Lit heures réelles via calculerTotalHeuresPresence(da) (depuis
  saisie-presences.js)
  4. Retourne taux arrondi

  Utilisation :
  const assiduite = calculerAssiduitéGlobale('2012345');
  console.log(`Assiduité: ${assiduite}%`);  // "Assiduité: 87%"

  calculerTauxCompletion(da)
  Description : Calcule le taux de complétion pour un étudiant (artefacts remis /
  artefacts évalués).

  Paramètres :
  - da (String) : Numéro DA de l'étudiant

  Retour : (Number) Taux de complétion en pourcentage (0-100)

  Formule :
  Complétion = (Artefacts remis par l'étudiant / Artefacts réellement donnés) ×
  100

  Principe (cohérent avec assiduité) :
  - Comme l'assiduité se base sur les séances réellement saisies
  - La complétion se base sur les artefacts réellement évalués (au moins une
  évaluation existe)

  Logique :
  1. Identifie les productions pour lesquelles au moins une évaluation existe (Set
   productionsEvaluees)
  2. Compte le nombre d'artefacts donnés = productionsEvaluees.size
  3. Filtre les évaluations de l'étudiant parmi ces productions
  4. Retourne taux arrondi

  Utilisation :
  const completion = calculerTauxCompletion('2012345');
  console.log(`Complétion: ${completion}%`);  // "Complétion: 75%"

  Couleurs d'affichage

  obtenirCouleurAssiduite(taux)
  Description : Retourne la couleur CSS selon le taux d'assiduité.

  Paramètres :
  - taux (Number) : Taux d'assiduité (0-100)

  Retour : (String) Variable CSS

  Seuils :
  - ≥ 85% → var(--risque-minimal) (vert)
  - ≥ 70% → var(--risque-modere) (jaune)
  - < 70% → var(--risque-tres-eleve) (rouge)

  obtenirCouleurCompletion(taux)
  Description : Retourne la couleur CSS selon le taux de complétion (mêmes
  seuils).

  Paramètres :
  - taux (Number) : Taux de complétion (0-100)

  Retour : (String) Variable CSS

  Filtrage et recherche

  chargerOptionsFiltres()
  Description : Charge les options des filtres (groupes et programmes) depuis les
  données étudiants.

  Paramètres : Aucun

  Retour : void

  Logique :
  1. Extrait les groupes uniques via Set
  2. Trie alphabétiquement
  3. Génère <option> pour #filtre-groupe-liste
  4. Même chose pour les programmes

  filtrerEtudiants(etudiants)
  Description : Filtre la liste des étudiants selon les critères sélectionnés.

  Paramètres :
  - etudiants (Array) : Liste complète des étudiants

  Retour : (Array) Liste filtrée

  Filtres appliqués (cumulatifs) :
  1. Statut : Actifs seulement (par défaut) ou tous
  2. Groupe : Si sélectionné dans #filtre-groupe-liste
  3. Programme : Si sélectionné dans #filtre-programme-liste
  4. Recherche : Par nom/prénom (case-insensitive, partielle)

  Utilisation :
  const etudiantsFiltres = filtrerEtudiants(tousLesEtudiants);
  // Retourne uniquement ceux qui correspondent aux filtres actifs

  resetFiltresListe()
  Description : Réinitialise tous les filtres à leurs valeurs par défaut.

  Paramètres : Aucun

  Retour : void

  Actions :
  - Groupe → '' (Tous)
  - Programme → '' (Tous)
  - Statut → 'actifs'
  - Recherche → '' (vide)
  - Appelle afficherListeEtudiantsConsultation() pour rafraîchir

  Navigation vers profil

  afficherPortfolio(da)
  Description : Affiche le profil/portfolio d'un étudiant dans la sous-section
  "Profil".

  Paramètres :
  - da (String) : Numéro DA de l'étudiant

  Retour : void

  Séquence :
  1. Trouve l'étudiant dans groupeEtudiants
  2. Appelle afficherSousSection('tableau-bord-profil')
  3. Génère le HTML du profil :
    - Carte d'identification (nom, DA, groupe, programme)
    - Carte d'indicateurs (assiduité, complétion)
    - Carte portfolio (appelle module détaillé si disponible)
  4. Si afficherProfilComplet() ou chargerPortfolioEleveDetail() existe, les
  appelle

  Utilisation :
  // Depuis le clic sur une ligne du tableau
  afficherPortfolio('2012345');

  // Naviguer vers le profil d'un étudiant
  afficherPortfolio(etudiant.da);

  Utilitaires

  obtenirNomProgramme(code)
  Description : Obtient le nom complet d'un programme à partir de son code.

  Paramètres :
  - code (String) : Code du programme (ex: '200.B1')

  Retour : (String) Nom complet du programme ou '' si non trouvé

  Programmes supportés : 40+ programmes (Sciences, Techniques, Arts, etc.)

  Exemples :
  obtenirNomProgramme('200.B1');  // "Sciences de la nature"
  obtenirNomProgramme('300.M0');  // "Sciences humaines"
  obtenirNomProgramme('420.B0');  // "Techniques de l'informatique"
  obtenirNomProgramme('999.99');  // "" (inconnu)

  obtenirDonneesSelonMode(cle)
  Description : Obtient les données selon le mode actif (réel/démo). Fonction
  utilitaire non définie dans ce module (importée d'ailleurs).

  Paramètres :
  - cle (String) : Clé localStorage de base (ex: 'groupeEtudiants')

  Retour : (Array) Données avec préfixe demo_ si en mode démo

  Dépendances

  Lit depuis (localStorage) :
  - groupeEtudiants (ou demo_groupeEtudiants)
  - presences
  - evaluationsSauvegardees
  - listeGrilles

  Appelle (fonctions externes) :
  - echapperHtml() depuis config.js (sécurité XSS)
  - calculerTotalHeuresPresence() depuis saisie-presences.js
  - obtenirDureeMaxSeance() depuis saisie-presences.js
  - afficherSousSection() depuis navigation.js
  - obtenirDonneesSelonMode() (module modes)
  - afficherProfilComplet() ou chargerPortfolioEleveDetail() (module profil,
  optionnel)

  Utilisé par :
  - navigation.js - Appelle rechargerListeEtudiants() lors du changement de
  section
  - Interface utilisateur (boutons de filtres, recherche, clics sur lignes)

  Modules requis (chargement avant) :
  - config.js - echapperHtml()
  - saisie-presences.js - Fonctions de calcul d'assiduité
  - navigation.js - afficherSousSection()

  Initialisation

  Fonction : initialiserModuleListeEtudiants()

  Appelée depuis :
  - main.js (ligne 70-73) - PRIORITÉ 2
  - navigation.js (via rechargerListeEtudiants()) - Lors du changement vers liste

  Ordre de chargement : Module n°3 dans main.js

  Conditions d'initialisation :
  - Élément DOM #tbody-tableau-bord-liste doit exister
  - Section "Tableau de bord › Liste des individus" active

  Structure HTML requise

  Tableau principal

  <div id="tableEtudiantsListe">
      <table>
          <thead>
              <tr>
                  <th>DA</th>
                  <th>Groupe</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Code</th>
                  <th>Programme</th>
                  <th>SA</th>
                  <th>CAF</th>
                  <th>Assiduité</th>
                  <th>Complétion</th>
              </tr>
          </thead>
          <tbody id="tbody-tableau-bord-liste">
              <!-- Généré dynamiquement -->
          </tbody>
      </table>
  </div>

  Filtres

  <select id="filtre-groupe-liste">
      <option value="">Tous les groupes</option>
      <!-- Généré dynamiquement -->
  </select>

  <select id="filtre-programme-liste">
      <option value="">Tous les programmes</option>
      <!-- Généré dynamiquement -->
  </select>

  <select id="filtre-statut-liste">
      <option value="actifs">Actifs seulement</option>
      <option value="tous">Tous les statuts</option>
  </select>

  <input type="text" id="recherche-nom-liste" placeholder="Rechercher par nom...">

  Compteur et messages

  <span id="compteur-etudiants-liste">(0 étudiant·e)</span>

  <div id="message-aucun-etudiant" style="display: none;">
      <p id="message-filtre-actif">Aucun étudiant ne correspond aux filtres
  sélectionnés.</p>
      <p id="message-liste-vide">Aucun étudiant dans le système.</p>
      <button id="btn-reset-filtres" onclick="resetFiltresListe()">Réinitialiser
  les filtres</button>
  </div>

  Conteneur profil

  <div id="contenuProfilEtudiant">
      <!-- Généré dynamiquement par afficherPortfolio() -->
  </div>

  Structure d'une ligne du tableau

  HTML généré :
  <tr onclick="afficherPortfolio('2012345')" style="cursor: pointer;">
      <td>2012345</td>
      <td style="text-align: center;"><strong>A</strong></td>
      <td>Tremblay</td>
      <td>Alice</td>
      <td style="text-align: center;">200.B1</td>
      <td>Sciences de la nature</td>
      <td style="text-align: center;">✓</td>  <!-- SA -->
      <td style="text-align: center;"></td>    <!-- CAF -->
      <td style="text-align: center;"><strong style="color: 
  var(--risque-minimal);">87%</strong></td>
      <td style="text-align: center;"><strong style="color: 
  var(--risque-modere);">75%</strong></td>
  </tr>

  Colonnes :
  1. DA
  2. Groupe (centré, gras)
  3. Nom
  4. Prénom
  5. Code programme (centré)
  6. Nom complet du programme
  7. SA (Services adaptés) - ✓ si Oui
  8. CAF (Centre d'aide français) - ✓ si Oui
  9. Assiduité (centré, gras, coloré)
  10. Complétion (centré, gras, coloré)

  Interactions :
  - onclick : Appelle afficherPortfolio(da)
  - onmouseenter : Fond bleu très pâle
  - onmouseleave : Retrait du fond
  - cursor: pointer : Indique cliquable

  Tests

  Console navigateur

  // Vérifier disponibilité du module
  typeof initialiserModuleListeEtudiants === 'function'  // true
  typeof afficherListeEtudiantsConsultation === 'function'  // true
  typeof calculerAssiduitéGlobale === 'function'  // true
  typeof calculerTauxCompletion === 'function'  // true

  // Tester calcul d'assiduité
  calculerAssiduitéGlobale('2012345');  // 87

  // Tester calcul de complétion
  calculerTauxCompletion('2012345');  // 75

  // Tester couleur
  obtenirCouleurAssiduite(87);  // "var(--risque-minimal)"
  obtenirCouleurAssiduite(72);  // "var(--risque-modere)"
  obtenirCouleurAssiduite(65);  // "var(--risque-tres-eleve)"

  // Tester programme
  obtenirNomProgramme('200.B1');  // "Sciences de la nature"

  // Voir les étudiants
  const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
  console.table(etudiants);

  Tests fonctionnels

  1. Test affichage initial :
    - Aller dans Tableau de bord → Liste des individus
    - Vérifier : Tableau affiché avec tous les étudiants actifs
    - Vérifier : Compteur correct (ex: "(25 étudiant·es)")
    - Vérifier : Colonnes assiduité et complétion avec pourcentages colorés
  2. Test filtrage par groupe :
    - Sélectionner "Groupe A" dans le filtre
    - Vérifier : Seuls les étudiants du groupe A affichés
    - Vérifier : Compteur mis à jour
    - Réinitialiser filtres
    - Vérifier : Tous les étudiants réaffichés
  3. Test filtrage par programme :
    - Sélectionner "Sciences de la nature"
    - Vérifier : Seuls les étudiants de ce programme affichés
    - Combiner avec filtre groupe
    - Vérifier : Filtres cumulatifs (ET logique)
  4. Test recherche par nom :
    - Taper "trem" dans recherche
    - Vérifier : Seuls les noms contenant "trem" (case-insensitive)
    - Vérifier : Recherche dans nom ET prénom
  5. Test codes couleurs :
    - Identifier un étudiant avec assiduité ≥85%
    - Vérifier : Pourcentage en vert
    - Identifier un étudiant avec assiduité 70-84%
    - Vérifier : Pourcentage en jaune
    - Identifier un étudiant avec assiduité <70%
    - Vérifier : Pourcentage en rouge
  6. Test navigation vers profil :
    - Cliquer sur une ligne du tableau
    - Vérifier : Navigation vers "Profil"
    - Vérifier : Nom et DA de l'étudiant affichés
    - Vérifier : Indicateurs (A et C) affichés
    - Vérifier : Section portfolio présente
  7. Test effet hover :
    - Survoler une ligne
    - Vérifier : Fond change (bleu très pâle)
    - Curseur change (pointeur)
    - Retirer souris
    - Vérifier : Fond revient normal
  8. Test liste vide :
    - Appliquer filtres qui ne correspondent à aucun étudiant
    - Vérifier : Message "Aucun étudiant ne correspond aux filtres"
    - Vérifier : Bouton "Réinitialiser les filtres" visible
    - Cliquer bouton
    - Vérifier : Filtres réinitialisés, tableau réaffiché
  9. Test réinitialisation filtres :
    - Appliquer plusieurs filtres
    - Cliquer "Réinitialiser les filtres"
    - Vérifier : Tous les selects à valeur par défaut
    - Vérifier : Champ recherche vide
    - Vérifier : Tous les étudiants actifs affichés
  10. Test calcul assiduité :
    - Aller dans Présences → Saisie
    - Saisir présences pour 3 dates (ex: 2h, 2h, 1h)
    - Revenir Liste des individus
    - Vérifier : Assiduité calculée (5h/6h = 83%)

  Formules détaillées

  Assiduité globale

  Formule :
  Assiduité = (Heures présentes / Heures offertes) × 100

  Calcul des heures offertes :
  // Compter les dates uniques où l'étudiant a des présences
  const datesSaisies = new Set();
  presences.forEach(p => {
      if (p.da === da) {
          datesSaisies.add(p.date);
      }
  });

  const nombreSeances = datesSaisies.size;
  const dureeSeance = obtenirDureeMaxSeance();  // 2h
  const heuresOffertes = nombreSeances × dureeSeance;  // Ex: 10 séances × 2h = 
  20h

  Calcul des heures présentes :
  const heuresReelles = calculerTotalHeuresPresence(da, null);
  // Somme de toutes les heures de présence de l'étudiant

  Exemple :
  - Étudiant a des présences pour 10 dates différentes
  - Heures offertes = 10 × 2h = 20h
  - Heures réelles présentes = 17.5h
  - Assiduité = (17.5 / 20) × 100 = 87.5% → Arrondi à 88%

  Complétion

  Formule :
  Complétion = (Artefacts remis / Artefacts donnés) × 100

  Calcul des artefacts donnés :
  // Identifier productions pour lesquelles AU MOINS une évaluation existe
  const productionsEvaluees = new Set();
  evaluations.forEach(evaluation => {
      productionsEvaluees.add(evaluation.productionId);
  });

  const nombreArtefactsDonnes = productionsEvaluees.size;  // Ex: 4 productions

  Calcul des artefacts remis :
  // Compter combien l'étudiant a remis parmi les productions données
  const evaluationsEleve = evaluations.filter(e =>
      e.etudiantDA === da &&
      productionsEvaluees.has(e.productionId)
  );

  const nombreRemis = evaluationsEleve.length;  // Ex: 3 productions

  Exemple :
  - 4 productions données (au moins une évaluation existe pour chacune)
  - Étudiant a remis 3 productions
  - Complétion = (3 / 4) × 100 = 75%

  Cohérence avec assiduité :
  - Assiduité : Base = séances réellement saisies (pas toutes les séances
  théoriques)
  - Complétion : Base = artefacts réellement donnés (pas toutes les productions
  créées)

  Problèmes connus

  Aucun problème majeur connu

  Le module est stable et fonctionnel.

  Points d'attention

  1. Dépendance à saisie-presences.js :
  - Les fonctions calculerTotalHeuresPresence() et obtenirDureeMaxSeance() doivent
   être chargées avant
  - Si absentes : Log warning, retourne 0

  2. Calcul assiduité vs indice A sommatif :
  - calculerAssiduitéGlobale() (ce module) utilise dates saisies pour cet étudiant
  - calculerAssiduiteSommative() (saisie-presences.js) utilise TOUTES les dates
  saisies (globales)
  - Résultats peuvent différer si toutes les dates n'ont pas été saisies pour tous

  Solution : Utiliser plutôt les indices depuis localStorage.indicesAssiduite pour
   cohérence

  3. Programmes manquants :
  - Liste de 40+ programmes couvre la plupart des cas
  - Si programme inconnu : Retourne '' (vide)
  - Affichage : Code du programme sans nom complet

  Règles de modification

  ⚠️ ZONES CRITIQUES

  Calculs d'indicateurs :
  - ⚠️ Modifier calculerAssiduitéGlobale() avec précaution (cohérence avec
  saisie-presences.js)
  - ⚠️ Modifier calculerTauxCompletion() avec précaution (logique métier
  importante)

  Seuils de couleurs :
  - ⚠️ Ne pas modifier sans consensus pédagogique
  - Seuils actuels : 85% (vert), 70% (jaune), <70% (rouge)

  ✅ ZONES MODIFIABLES

  Liste des programmes :
  // ✅ AUTORISÉ - Ajouter des programmes
  const programmes = {
      // ... existants
      '999.99': 'Nouveau programme'  // Ajout
  };

  Colonnes du tableau :
  // ✅ AUTORISÉ - Ajouter des colonnes (avec prudence)
  html += '<td>' + etudiant.nouvelleColonne + '</td>';

  Styles et interactions :
  // ✅ AUTORISÉ - Modifier couleurs hover, cursor, etc.
  tr.onmouseenter = function () {
      this.style.backgroundColor = 'var(--ma-couleur)';
  };

  Messages et textes :
  // ✅ AUTORISÉ - Modifier les textes d'interface
  compteur.textContent = '(' + etudiantsFiltres.length + ' personnes)';

  Filtres supplémentaires :
  // ✅ AUTORISÉ - Ajouter des filtres
  if (filtreNouveauCritere && filtreNouveauCritere.value) {
      resultats = resultats.filter(e => e.nouveauCritere ===
  filtreNouveauCritere.value);
  }

  Historique

  - Version initiale (index 50, 10-10-2025) :
    - Création du module de liste des étudiants
    - Affichage tableau avec DA, nom, groupe, programme
    - Calcul assiduité globale
    - Filtrage par groupe, programme, statut
    - Recherche par nom
  - Modularisation (10-10-2025a) :
    - Ajout calcul de complétion
    - Codes couleurs pour indicateurs
    - Navigation vers profil/portfolio
    - Gestion messages vide (filtre vs vraiment vide)
    - Liste exhaustive de 40+ programmes
  - Corrections :
    - Cohérence calcul complétion avec assiduité (artefacts donnés vs théoriques)
  - État actuel : Module stable, fonctionnel, prêt pour production

  ---
  Référence code : /js/etudiants.js (630 lignes)

  Modules liés :
  - saisie-presences.js (calculs assiduité)
  - config.js (sécurité)
  - navigation.js (navigation)
  - Module profil (optionnel)

  Statut : ✅ STABLE - Module de lecture, pas de modification des données sources