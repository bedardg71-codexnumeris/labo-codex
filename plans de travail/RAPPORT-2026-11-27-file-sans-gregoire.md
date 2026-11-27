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

## Suite du même jour (7 h 11 : « fais le tour et continue », puis les intermédiaires et les laborieuses)

### Fait
- **#1056** (intermédiaire) : retoucher une production n'efface plus sa date d'échéance. En mode « un seul groupe », le champ s'ouvrait vide quand la date ne vivait que dans l'entrée du groupe, et « Enregistrer » écrivait `null` : la production sortait du calendrier et de la complétion. Le champ montre maintenant la date du groupe. **Source seulement** : les dates déjà effacées chez les gens le restent, rien n'est réécrit. Supposé : quand l'entrée du groupe et `dateEcheance` diffèrent, c'est celle du groupe qui s'affiche (c'est elle que lit `obtenirEcheanceEffective`).
- **#1141** : quatre vérifications négatives qui lisaient un texte rendu ne pouvaient plus échouer depuis la norme française ; elles tolèrent l'espace.

### Clos par la mesure
#1266 (rapide) ; #1171, #1224, #1225, #1226 (preuve : le code et son banc). Non cochées faute d'une preuve relue par moi : #592, #1227, #1075, #1142 et les dix « closes par décision » du balayage.

### Le tour des intermédiaires et des laborieuses
`plans de travail/MESURE-2026-11-27-fiches-intermediaires-et-laborieuses.md` (balayage en lecture seule par un sous-agent, non relu fiche par fiche). 180 fiches non livrées, 18 en attente de Grégoire, 162 mesurées : 19 déjà réglées ou closes, 11 techniques faisables sans lui, 20 demandent un navigateur, 93 remontent à lui, 19 non mesurées. ⚠ La plupart des 93 sont rangées d'après le texte de la fiche, pas d'après le code.

### Regardé, pas fait
- #1054 (import du bilan réflexif) : il manque aussi `rendreInterface`, et l'écran est retiré ; aucun effet visible, laissé.
- #869 : les six fonctions exportées du profil sans appelant extérieur servent par `data-action` dans le HTML que le module génère ; pas de code mort établi par cette mesure.
- #1250, #1253, #1263 : chacune change ce que l'écran dit ; à Grégoire.
- Restent faisables sans lui : #1278, #1128, #616, #814, #602, #1161.

## Troisième tranche (10 h 51 : « passons à la réalisation des tâches »)

- **#1278** (intermédiaire) : quand le témoin dit « Non enregistré : le navigateur a refusé l'écriture », la clé refusée et le nom de l'erreur entrent dans les « dernières actions » du rapport de bug. Le message montré ne change pas. Un DA dans la clé est masqué ; le message de l'erreur n'est pas gardé.
- **#1161** (laborieuse) : « Tout garder dans ma bibliothèque » (et « Garder dans ma bibliothèque ») ne verse plus un second exemplaire d'une grille ramenée de la bibliothèque et restée telle quelle. Supposé : « telle quelle » veut dire même nom et mêmes critères ; modifiée depuis, elle reste un exemplaire à part, comme avant. Source seulement : les doublons déjà écrits restent.
- Laissé : #814 (la croix du journal) est visuel, à faire avec un navigateur ; #1128, #616, #602 restent faisables sans Grégoire.
