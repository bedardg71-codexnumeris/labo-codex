# Rapport : fiches rapides sans Grégoire (27 novembre 2026)

Session de Cowork dans le nuage, à la demande de Grégoire (6 h 40) : du travail autonome à partir de la page de tri, sur les fiches rapides qui ne demandent pas sa présence. Branche `lot/file-sans-gregoire-2026-11-27`, partie de `main` à `dceb679f` (1.259.0). **Aucune fusion, aucun bump, rien au changelog.**

## Ce que la mesure a montré d'abord

La page de tri date du 16 novembre. Son « 57 » est le nombre de fiches rapides ouvertes, dont 7 attendent Grégoire ; il n'existe pas de compteur « sans toi ». Sur les fiches regardées ce matin, quatre étaient déjà réglées dans `main` sans que leur case soit cochée.

## Fait (un commit par fiche, chacun avec son essai Vitest et son break-test rouge)

- **#1264** : dans la fiche d'une intervention, « Suggérer » n'efface plus l'objectif déjà écrit quand aucun critère (ou personne) n'est coché.
- **#1254** : dans Cadre › Trimestre, « Supprimer » ne paraît plus dans « Nouveau profil » ; il revient sur un profil enregistré. Le bouton reçoit l'identifiant `v2-btnSupprimerEnseignant`.
- **#1167** (entrée 29 de la file) : « ← Utiliser » sur un tampon intégré gardé dans la bibliothèque n'écrit plus de doublon. Inatteignable depuis l'écran : aucun stock à reprendre.
- **#1115** (entrée 30 de la file) : l'essai des raccourcis de la carte d'alignement lit la plateforme du navigateur, comme l'écran. **Non joué** : le conteneur n'a aucun navigateur (l'installation de Playwright est refusée par le réseau). Les deux entrées de `scripts/playwright-baseline-linux.json` restent jusqu'au premier vert de GitHub.

Écart à noter : le jeton anti-cache de `js/interventions.js` (#1264) est parti dans le commit de #1254.

## Clos par la mesure (déjà réglés dans `main`, case cochée ici avec sa preuve)

#1050 (`--vert-principal`), #1192 (« Progression : 10 points »), #1208 (« montre / montrent »), #1251 (« Aucune production définie »).

## Mots d'écran : proposés, pas posés (à Grégoire)

- **#1252**, sous le sélecteur du profil enseignant. Aujourd'hui : « Ces informations accompagnent les ressources que tu partages : nom, établissement, discipline. » Le formulaire exige le courriel et l'établissement, pas la discipline. Proposé : « Ces informations accompagnent les ressources que tu partages : ton nom, ton courriel et ton établissement. »
- **#1262**, fiche d'intervention sans grille de dépistage. Aujourd'hui : « Configure une grille de référence dans Conception › Grilles de critères pour activer le ciblage par critère. » Le réglage est dans Labo › Observation. Proposé : « Choisis ta grille de dépistage dans Labo › Observation pour cibler des critères. »

## Vérifié, et pas vérifié

- Vitest complet : 963 fichiers, 12 467 essais verts (27 nov., conteneur). Les jetons anti-cache des trois fichiers touchés portent le jour du build en ligne (`20261126b`), comme l'exige la sentinelle anti-cache ; la release les avancera.
- **Rien sous WebKit ni sous Chromium.** Les trois correctifs d'écran sont couverts par Vitest seulement ; #1254 mérite un coup d'œil à l'écran (un bouton masqué).
- Avant toute fusion : le verdict du Mac, comme d'habitude.

## Pas touché, et pourquoi

- Exports (#1073, #1061, #1091) : format d'échange, hors de la boucle.
- Fiches de la suite de tests qui demandent un navigateur (#1255, #1267, #1275, #1284, file 36, 37, 41).
- #869, #870, #722 (code mort, classes sans règle) : chacune demande la preuve à l'écran.
- La page de tri n'est pas remise à jour : à refaire contre `main`, les fiches closes ci-dessus comprises.
