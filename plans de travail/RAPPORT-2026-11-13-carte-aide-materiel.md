# Rapport du lot `lot/carte-aide-materiel` — la carte d'aide dans « Apporter mon matériel » (13 nov. 2026)

**Relais.** Branche `lot/carte-aide-materiel`, partie de `main` (`f9c49ec8c`, la 1.244.0). Mandats : relais de la
conversation du Projet, 12 nov., 19 h 15 ; relève de Cowork, 13 nov., 5 h 05 (le Mac a paniqué à 1 h 06, le lot était
indexé, non committé). **Fait** : le code (`eda8b2bce`), poussé, PR d'aperçu n° 22, non fusionnée ; la porte écrite
(`PORTES-TERRAIN-2026-11-13-carte-aide-materiel.md`, onze gestes, sans artefact). **Reste** : la porte, un geste par
tour ; la fusion, par un relais à part. Le lot `lot/deux-temps-modeles` part de la tête de cette branche.

## Livraison

- **Commit** : `eda8b2bce` (le code) ; ce rapport et la porte suivent dans un commit de documents.
- **Build** : 1113-0737 (version 1.244.0 inchangée). **PR** : n° 22, aperçu
  `https://deploy-preview-22--codexnumeris-051225.netlify.app`.

## Ce que le lot fait

- **Ce qui a quitté la page.** La liste d'étapes de l'accueil (`ol.materiel-etapes`), les consignes de l'étiquetage
  (`ol.dissection-consignes`) et le texte du bandeau. On les lit dans la carte d'aide, en pages à la suite de son
  texte (`complement`, `js/parcours-moteur.js`) : trois cartes à l'accueil, trois étapes à l'étiquetage, la phrase de
  l'outil en main. Restent dans la page : les faits (« Étiquette « X » choisie. », « Outil « Couper » en main. »,
  « Morceau choisi… ») et les refus.
- **La carte hors du parcours.** `js/materiel-aide.js` (neuf) porte la définition unique, lue par le parcours
  « Évaluer une première production » et par la page (« Ta grille, pas à pas »). Elle n'écrit rien dans les données :
  ni grille, ni brouillon, ni rien de namespacé par trimestre. Absente en vue simple et pendant un parcours.
- **L'interrupteur.** « M'accompagner pour étiqueter ma grille », ouvert à l'arrivée tant qu'aucune grille n'est
  créée ; après, il garde son dernier état. Préférence : `localStorage['laboCodex.aideMateriel'] = { grilleCreee,
  ouvert }` (inscrite à `docs/DATA-OWNERSHIP.md` ; stock assumé : une clé de navigateur, sans migration).
- **L'exemple.** « Essayer avec un exemple » écrasait le brouillon : remplacé par « Voir le travail complet » et
  « Faire l'exercice soi-même » ; « Quitter l'exemple » rend le brouillon, sans confirmation.

## Preuves (WebKit, Mac, passages ciblés, un à la fois ; pas de verdict complet)

- Vitest : 922 fichiers, 11 509 essais verts, au build 1113-0737.
- Banc neuf `carte-aide-materiel-2026-11-13.spec.js` : I1 à I4 aux deux orientations (8 verts) ; I3 rejoué seul,
  2/2 sans reprise. Bancs de bulle : 36 verts avec le banc neuf.
- Bancs des parcours 1 à 9, flèches, présences, rentrée : verts. `parcours-2-ma-classe:246` a dépassé son délai dans
  un passage de 108 essais arrêté au 44ᵉ (mémoire libre de 73 % à 36 %) ; rejoué seul, 2/2.
- Break-tests (rouges, puis rétablis) : BT1 l'ancien chemin d'écriture de l'exemple → I4 ; BT2 l'interrupteur gardé
  fermé → I1 ; BT3 `noterGrilleCreee` retiré → I2 ; BT4 l'arrondi au plus proche remis → sentinelle des flèches
  (164 au lieu de 153).
- Essais rattrapés le 12 nov., rejoués seuls six fois, sans reprise : `vue-simple:1086` (« retirer une colonne :
  refusé… »), 6/6 ; `parcours-8-commentaires:621` (« 820 px : aucun avis ne couvre la bulle… »), 3/6 avant correctif,
  6/6 après.

## Trouvailles et issues

| Trouvaille | Issue |
|---|---|
| `parcours-8-commentaires:621` rouge 4 fois sur 6 sur `main` (`f9c49ec8c`, copie témoin) : `placesEssayees` arrondissait au plus proche les places qui longent une zone ; sous un contour au bord fractionnaire (152,45), la place collée tombait à 152, mordait sur lui (pesé dix mille fois) et perdait contre la place à 12 px. | **Corrigé maintenant** (mandat : un rouge au calme se règle dans ce lot) : arrondi du côté libre, essai neuf, break-test. |
| Les dimensions de la bulle sont lues en entiers (`offsetHeight` : 378 pour 378,42) : une place « collée au-dessus » d'une zone peut mordre de moins d'un demi-pixel. Aucun rouge observé. | **Commenté ici et laissé** : sans conséquence observable. |
| `scripts/release.mjs --build-only` a aussi rafraîchi les jetons `?v=` de `changelog-data.js` et `vue-simple.js`, non touchés par le lot. | **Laissé** : un jeton neuf ne fait que recharger le fichier. |
| Un passage Playwright de plus de cent essais fait tomber la mémoire libre de moitié. | **Inscrit ici** : passages de quarante essais au plus, mémoire relevée entre chacun. |

## Les mots proposés (ils partent tels quels, corrigeables)

« M'accompagner pour étiqueter ma grille » (l'interrupteur) ; « Ta grille, pas à pas » (titre de la carte hors
parcours) ; « Fermer l'accompagnement » (sa sortie) ; « Voir le travail complet », « Faire l'exercice soi-même »
(accueil) ; « Quitter l'exemple » (étiquetage, et deux lignes du geste qui le nomment) ; le texte de l'étape « Ta
grille » lancée depuis Conception › Grilles (`TEXTE_1_COMPOSER`, `js/parcours-evaluer.js`, ligne 658).

## Suppositions

- La carte ouverte est un moteur actif : infobulles et rappel du codex suspendus, comme pendant un parcours.
- La vue simple n'atteint pas la page : rien n'y est offert.
- Sous un banc (`navigator.webdriver`), l'interrupteur arrive fermé, pour ne pas couvrir les bancs existants.
- Le bandeau de l'étiquetage, vidé de son texte, garde sa place (invisible) : la page ne saute pas.
- La relève du 13 nov. remplace le « caffeinate, charge sous 6 » de la veille par ses règles de mémoire.

## Le Mac, nuit du 12 au 13 nov.

- 5 h 05 : mémoire libre à 76 %, aucun processus Playwright ni Vitest.
- Journal système muet sur `memorystatus` de 21 h 30 à 1 h 07, aucun rapport de panique lisible : coupable **non
  établi**.
- Le shell resté actif à 21 h 37 était une boucle d'attente (`until charge < 6 ; sleep 20`), sans test : il n'a rien
  pu saturer ; la charge, elle, était déjà à 139 avant lui.
