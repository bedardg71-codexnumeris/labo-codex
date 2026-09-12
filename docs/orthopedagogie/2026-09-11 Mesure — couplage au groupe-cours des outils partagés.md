# Mesure — jusqu'où les outils à partager dépendent-ils du groupe-cours ?

> **Date** : 11 septembre 2026, soir · **Par** : Cowork, sur le dépôt Monitorage_v6 (lecture seule, `grep` sur `js/`)
> **Question** : le profil, le volet confidentiel, les interventions, le rapport et les graphiques peuvent-ils tourner sur une liste d'élèves sans cours ni groupe (le « troisième mode » du contexte actif) ?
> **Réponse courte** : oui ; la dépendance passe par **un goulot** et **un motif recopié**, tous deux techniques.

## 1. Lecture directe du groupe-cours actif : presque nulle dans les outils partagés

`groupeCoursActif` est lu dans 25 fichiers, mais **0 fois** dans `profil-etudiant-calculs`, `-diagnostics`, `-confidentiel`, `-rapport`, `-helpers`, `-sections-affichage`, et **0 fois** dans `interventions.js`. Une seule lecture dans `profil-etudiant-actions.js:183`. La dépendance directe vit dans trimestre, horaire, présences, évaluation, export PDF.

## 2. Lecture indirecte : un seul goulot, `obtenirEtudiantsCoursActif()` (`js/modes.js:1169`)

Tous les outils partagés obtiennent « mes élèves » par cette fonction : interventions (3 sites : 655, 1378, 1505), profil-affichage (2254), graphiques-progression (4 sites), snapshots (2 sites), tableau de bord, présences, liste des évaluations. Elle lit `infoCours` via `obtenirContexteCoursActif()` (`modes.js:510`) et **retourne `[]` si `infoCours.id` est absent**. Elle filtre ensuite par `coursId` et `groupe`, avec déjà deux tolérances : le « mode cours » (`groupe: null`, tous les groupes) et « étudiant sans groupe : l'inclure ».

⮕ Un contexte « suivi » dont l'`id` est celui d'une liste constituée à la main, et pour lequel la fonction retourne cette liste, alimente tous ces écrans sans qu'ils changent.

## 3. Le motif recopié : `infoCours._groupeCoursId || infoCours.id`

Huit sites dérivent eux-mêmes l'identifiant du contexte pour lire ou écrire des données par groupe-cours, au lieu d'appeler un point unique : `profil-etudiant-calculs.js:1830` (production diagnostique, #790), `profil-etudiant-sections-affichage.js:2670`, `graphiques-progression.js:595, 820, 1422, 3619`, `snapshots.js:78` (déjà une petite fonction d'accès) et `snapshots.js:1102`. Un neuvième (`profil-etudiant-sections-affichage.js:3146`) ne s'en sert que pour afficher sigle et numéro de groupe. Le motif tolère déjà un contexte sans groupe (`|| id`).

⮕ À unifier en une fonction avant d'ajouter le mode : sinon le troisième mode se code neuf fois.

## 4. Ce qui ne dépend d'aucun contexte

`profil-etudiant-confidentiel.js` et `profil-etudiant-rapport.js` : zéro lecture de `infoCours`, `groupeCoursActif` ou `obtenirEtudiantsCoursActif`. Ils travaillent sur l'élève (DA) seul.

## 5. Ce que la mesure confirme du 5 septembre

`interventions.js` : `coursId` 1 occurrence, `groupeCoursId` 0. Une intervention ne sait pas dans quel contexte elle a été créée ; dans un troisième mode, il faudra qu'elle le sache (sinon la liste des interventions d'une orthopédagogue se mêle à celles du cours).

## 6. Ce qui reste hors mesure

La **séance** comme unité de temps (présences, `seanceConcernee` dans les interventions, calendrier) n'a pas été mesurée ici ; c'est le prochain objet. Et les données elles-mêmes (évaluations, productions, présences) sont rangées par clé de groupe-cours : leur lecture dans un contexte « liste » est à mesurer avec la séance.
