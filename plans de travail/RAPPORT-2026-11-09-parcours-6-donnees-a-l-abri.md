# Rapport : le sixième parcours, « Mettre tes données à l'abri » (session E, nuit du 8 au 9 nov. 2026)

Branche `lot/parcours-6-donnees-a-l-abri`, partie de `origin/lot/parcours-1-et-2` (a328bb9f). Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-6-donnees-a-l-abri.md`, commitée avec le lot. Session cloud : **WebKit absent, tout ce qui suit a été joué sous Chromium.** Rien au changelog, pas de release, rien sur `main`.

> **Mis à jour le 9 nov. 2026, après les décisions de 9 h 33 à 9 h 34 (Cowork)** : les huit questions sont tranchées (section « Les huit questions, tranchées »), les corrections sont faites et poussées (commit `9f1c624`), le verdict de la seconde relecture est plus bas. Reste au Mac : le verdict WebKit et la fusion, après « Mettre ta classe en place », vers lequel ce parcours renvoie.

## Les corrections du 9 nov. (ce que tu verras)

- **Le « i » de l'aperçu** ouvre maintenant « Ce que contient le fichier » **au-dessus** de l'aperçu, et au-dessus de la bulle du parcours. Capture : `1180-sombre-etape-3-aide-du-i.jpg`. Ailleurs dans l'application, l'aide garde sa place habituelle.
- **Sous « Mettre à jour le codex »**, le menu dit « Partage un nouveau fichier » quand l'application passe par le partage (l'iPad), et garde « Télécharge un nouveau fichier » quand elle télécharge. Avec la fenêtre de choix, rien ne change.
- **À l'étape 3, à partir de 1180 px**, la bulle se pose à droite de l'aperçu, à la largeur qui y tient (242 px à 1180, 380 px à 1440). Elle ne couvre plus rien de l'aperçu : la mise en garde, la liste des fichiers, le « i » et les deux boutons restent lisibles et touchables. Sous 1180 px, elle garde sa place d'avant, au-dessus de « Mettre à jour ».
- Captures de l'étape 3 refaites à 1180 et 1440 px, en sombre : fenêtre de choix, partage, copies manquantes (`1180-sombre-etape-3-*.jpg`, `1440-sombre-etape-3-*.jpg`). Celles de l'étape 3 à 1180 px pour les autres chemins (fichier tenu, téléchargement, « Il y est », la fenêtre de choix en clair) sont refaites aussi : la bulle y a changé de place. Celles que tu as approuvées (étapes 1, 2 et 4, le panneau, et toutes celles à 390 px, que ces corrections ne changent pas) sont restées telles quelles.

## En tête (premier dépôt, nuit du 8 au 9 nov.)

### Ce qui est fait (ce que tu verras)

Ce qui suit décrit le premier dépôt ; à l'étape 3, la place de la bulle a changé depuis (voir « Les corrections du 9 nov. »).


- Dans le panneau « Assistance », un parcours de plus : « Mettre tes données à l'abri », avec sa ligne. Sur cette branche, il est le troisième de la liste (les parcours 3 à 5 n'y sont pas) ; le compteur du menu dit donc « 1 sur 3 ». Il dira « sur 6 » une fois les branches fusionnées, et plus avec les parcours 7 à 9.
- Sans trimestre réel (la démo ne compte pas), « Commencer » ne lance rien : sous le bouton, le panneau dit « Commence par « Mettre ta classe en place » : ton codex gardera ce que tu y auras mis. »
- Sans codex, le haut du menu Codex dit maintenant « Pas encore de codex : « Mettre à jour le codex » en crée un avec tes données. »
- Les quatre bulles, mot pour mot. Étape 1 : le contour sur « Codex » ; elle avance quand le menu s'ouvre. Étape 2 : le menu ouvert, le contour sur « Mettre à jour le codex » ; elle avance quand l'aperçu s'ouvre. Étape 3 : la bulle se pose **au-dessus de l'aperçu**, près de « Mettre à jour », sans couvrir ni ce bouton ni « Annuler », avec la phrase du chemin que prendra l'écriture ; elle avance quand le codex est écrit. Étape 4 : le menu rouvert, le contour sur « Ouvrir un codex… », et « Terminer ».
- Pendant ce parcours, « Ouvrir un codex… » ne fait rien, même éclairé à l'étape 4 : aucun codex ne peut remplacer ton espace en plein parcours. Hors parcours, il répond comme avant.
- Le rappel « Mets ton codex à jour » ne s'ouvre plus pendant **aucun** parcours. S'il était dû, il attend la fin du parcours, puis 1,5 s, comme à l'ouverture de l'application. La mise à jour faite dans le parcours le repousse de 14 jours, comme d'habitude.
- Captures Chromium dans `plans de travail/captures-2026-11-09-parcours-6-chromium/` : les quatre étapes à 1180 px en sombre et en clair, l'étape 3 pour chaque chemin (fenêtre de choix, partage, téléchargement et « Il y est », fichier tenu, copies manquantes), les étapes 1 et 3 à 390 px, le panneau avec la phrase du refus.

### Les huit questions, tranchées (9 nov. 2026, 9 h 33 à 9 h 34)

1. **L'aide du « i » cachée sous l'aperçu** : corrigée avant la fusion (Cowork). L'aide monte au-dessus de ce qui porte son « i », l'étage entier ensemble (voile, aide, micro-popup des termes). Essai : au toucher du « i », l'aide répond en son milieu et à ses quatre coins, et son ordre d'empilement passe au-dessus de l'aperçu et de la bulle ; ouverte par sa clé, ailleurs, elle reste à 10002. Break-test : rouge sans la correction.
2. **La bulle de la fenêtre de choix quand des copies manquent** : validé par Grégoire, la première phrase seule. Rien à changer, c'était déjà posé ainsi.
3. **« Ouvrir un codex… » éclairé et inactif à l'étape 4** : on garde (Cowork).
4. **« Quitter le parcours » et le message de sortie de « Découvrir »** : on garde (Cowork).
5. **La ligne sous « Mettre à jour le codex »** : validé par Grégoire, « Partage un nouveau fichier » quand l'application partage, « Télécharge un nouveau fichier » quand elle télécharge. Un essai par cas, chacun rouge par son break-test.
6. **Le refus au toucher de « Commencer »** : on garde (Cowork).
7. **La consigne de geste dans le paragraphe, à toutes les étapes** : on garde (Cowork).
8. **La bulle de l'étape 3 qui couvrait la mise en garde** (Cowork) : à partir de 1180 px, elle se pose à droite de l'aperçu. Essais à 1180 et 1440 px pour les trois chemins des captures : ni la mise en garde, ni la liste, ni « Mettre à jour », ni « Annuler », ni le « i » ne sont couverts, ni par la géométrie, ni au toucher. À 1179 px, la place d'avant. Break-tests : la place à droite retirée, les essais de 1180 et 1440 rougissent ; le seuil retiré, celui de 1179 rougit.

### Ce qui attend encore Grégoire

Rien de nouveau. Les phrases posées par ces corrections sont celles qu'il a validées ; aucune autre n'a été écrite.

### Ce que je n'ai pas pu vérifier ici

- **WebKit** : le banc et les captures sont à refaire sur le Mac (`npx playwright test parcours-6-donnees-a-l-abri`, et `CAPTURES_PARCOURS=<dossier>` pour les captures).
- **La vraie feuille de partage de l'iPad**, et la vraie fenêtre de choix de Chrome ou d'Edge. Le banc les remplace par des fausses. À mesurer : sur l'iPad, la bulle 3 est-elle lue avant que la feuille s'ouvre, et la feuille s'ouvre-t-elle bien après le toucher sur « Mettre à jour » ?
- **Safari sur le Mac** : ouvre-t-il la feuille de partage (`navigator.canShare` avec un fichier) ou télécharge-t-il ? Le code prend le partage dès que le navigateur l'offre (`js/codex.js:1778`). La phrase dit « ton appareil » pour ne pas le supposer. À mesurer sur le Mac.
- **Sur tes données** : un gros codex dont la préparation dépasse 5 s. La fenêtre « Ton codex est prêt » s'ouvre alors en pleine étape 3. Le code la laisse passer au-dessus de la bulle, et le banc l'a vu pour « Il y est », mais pas avec un vrai délai. À mesurer sur le Mac.
- VoiceOver sur l'iPad : l'aperçu est une fenêtre modale pour les lecteurs d'écran, et la bulle 3 vit hors de lui ; elle pourrait ne pas être lue. À éprouver.
- Le parcours n'a pas été joué en démo ouverte. Hors démo, il marche ; avec la démo ouverte et un trimestre réel, le codex n'écrit que les vraies données (`_sansLeDemo`).

## Le détail

### Les commits

- `b587528f` : le parcours, le panneau, le menu Codex, le rappel, la CSS ; la sentinelle Vitest (20 essais).
- `253eb154` : le banc Playwright (7 essais) et les captures.
- `d17131da` : le banc sans pause fixe (le cliquet des pauses était rouge, 620 pour 618) ; le banc de la partie 1 lit le nombre de parcours sur le registre (voir « Ce que le lot change hors de ses fichiers »).
- `24528a51` : ce rapport.
- `b3a51b54` : le banc vérifie que le « i » n'est pas couvert à 1180 px ; le verdict de la relecture et ses constats dans ce rapport.
- `9f1c624` (9 nov., corrections) : l'aide du « i » au-dessus de l'aperçu, la ligne « Partage un nouveau fichier », la bulle 3 à droite de l'aperçu à partir de 1180 px ; le banc (13 essais) et les captures de l'étape 3.
- Le commit suivant : ce rapport mis à jour.

### Le moment de l'étape 3 (ce que la consigne me demandait de proposer)

Retenu : **l'étape 2 avance à l'ouverture de l'aperçu, et la bulle 3 se pose sur l'aperçu, près de son bouton « Mettre à jour »**. Elle est donc lue avant le toucher qui ouvrira la fenêtre du système (fenêtre de choix, feuille de partage) ou lancera le téléchargement. Le toucher reste frais : c'est celui de « Mettre à jour ». Si la préparation du fichier le fait expirer, l'application demande déjà un toucher frais (« Ton codex est prêt », lot J0 bis).

- La bulle et le contour passent au-dessus de l'aperçu (à 99999) et de la fenêtre de progression (à 100000). La classe `parcours--par-dessus-les-fenetres` est posée par le parcours lui-même, sur les éléments de son lancement (`css/parcours.css`, fin du fichier).
- Elle **cède la place** aux fenêtres qui suivent : « Ton codex est prêt », « Il y est », l'échec « Codex non mis à jour ». À 390 px, au-dessus d'elles, elle couvrait « Il y est » (mesuré, puis corrigé ; essai « 390 px, telechargement »).
- La bulle est bornée à `min(560px, 55vh)` sur l'aperçu, et défile au-delà. Elle tient ainsi au-dessus de « Mettre à jour » à 390 × 844 sans le couvrir.
- La phrase se choisit à l'entrée dans l'étape 3, l'aperçu ouvert, par `Codex.cheminDeLaProchaineEcriture` (`js/codex.js:1778`). Cette fonction suit l'ordre de `sauvegarderVersDestination` : fichier tenu (sauf copies manquantes), fenêtre de choix, partage, téléchargement. Le compte des copies manquantes est gardé dans la tentative avant l'aperçu. Le rapport de bug ne le montre pas : il nomme ses champs (`js/rapport-bug.js:350`).
- Limite assumée : la phrase dit le **premier** essai. Si un fichier tenu est devenu invalide (clé retirée), l'application redemande où écrire, mais la bulle garde la phrase du fichier tenu. C'est rare, et c'est hors d'un premier parcours.
- Une reprise à l'étape 3 (« Reprendre ») repart de l'étape 2 quand l'aperçu n'est pas ouvert : l'étape 3 se joue sur l'aperçu (`js/parcours-donnees.js:243`).
- L'étape 3 avance quand l'état posé par `_marquerCodexAJour` change, c'est-à-dire une nouvelle date d'écriture. Un échec n'y arrive pas : la bulle reste.

### Les vérifications de la consigne (« À VÉRIFIER AVANT DE POSER LES TEXTES »)

| Point | Verdict | Où |
|---|---|---|
| Étape 2 : libellé constant, « Nouveau codex » n'écrit rien, la première écriture pose « Ton codex est à jour » | Mesuré par Cowork ; rien de plus à vérifier, comme dit la consigne | — |
| Étape 2 : l'aperçu a un « i » qui mène à « Ce que contient le fichier » | **Tient à moitié.** Le « i » existe (`js/securite-export-preview.js:87-91`) et mène à « Ce que contient le fichier » (`js/accompagnement-contenu-popup.js:1773`). Mais (a) il n'apparaît que si « Aide dans les pages » est allumée (`css/accompagnement.css:505`, `:556-559`), ce qui est le défaut ; (b) touché, il ouvre son aide **sous** l'aperçu : l'aide est à 10002 (`css/accompagnement.css:591`), l'aperçu à 99999 (`js/securite-export-preview.js:79`). Mesuré sous Chromium ; l'empilement ne dépend pas du moteur. | question 1 |
| Étape 3 : le fichier choisi est réécrit sans question jusqu'au rechargement, puis l'application redemande | **Tient.** La poignée vit en mémoire seulement (`js/codex.js:66-69`), adoptée après la fenêtre de choix (`:1717`), réécrite sans question (`:1683`). La « persistance FSAPI » des Réglages concerne le dossier des productions (`js/db.js:1528`), pas le codex. Vu par le banc : « Refaire » donne la phrase du fichier tenu. | — |
| Étape 3 : « Il y est » ne vient qu'après un téléchargement ; le partage compte comme écrit aussitôt | Tient (`js/codex.js:3645-3651`). La feuille de partage sur un ordinateur : **non vérifiable ici** (Safari sur le Mac, à mesurer). | « Ce que je n'ai pas pu vérifier » |
| Étape 3 : des fichiers de productions manquent | Traité : l'application demande où écrire et n'adopte pas le fichier (`js/codex.js:3718-3727`). La phrase de la fenêtre perd sa seconde phrase. Essai « des copies manquent ». | question 2 |
| Étape 4 : le menu Codex se referme-t-il après la mise à jour ? | **Oui, et dès le début** : `_mettreAJourLeCodex` le ferme avant de préparer le fichier (`js/codex.js:3692`). L'étape 4 le rouvre. Conséquence : la dernière phrase de la bulle 3 (« Quand le menu affiche « Ton codex est à jour »… ») se vérifie à l'étape 4, menu rouvert, et non pendant l'étape 3. Hors parcours, il faut rouvrir le menu pour le voir. | — |

### Ce que le lot change hors de ses fichiers

- `js/assistance.js` : une entrée `condition` dans la définition d'un parcours. C'est sa condition d'entrée, permise par la règle de la nuit. Rien d'autre ne change dans le panneau.
- `js/codex.js` : le texte validé du haut du menu, `cheminDeLaProchaineEcriture` (exposée), et le compte des copies manquantes dans la tentative.
- `js/modal-backup-reminder.js` : `verifierEtAfficher` attend la fin d'un parcours (`:280-310`). Hors parcours, rien ne change (essai « hors parcours, rien ne change »).
- `tests/integration/parcours-1-et-2-2026-11-08.spec.js` : « 1 sur 2 », « 2 sur 2 » et la liste de deux parcours étaient écrits en dur. Le sixième parcours les rendait rouges, et les parcours 3 à 9 feront de même. Le rang suit maintenant `Assistance.parcours().length`, et les deux premiers de la liste restent ceux de la partie 1. ⚠ Les autres branches de la nuit toucheront peut-être ces mêmes lignes autrement : à réconcilier à la fusion.
- `index.html` : le script `js/parcours-donnees.js`, placé **après** `js/parcours-classe.js`. À la fusion, les scripts des parcours 3 à 5 vont entre les deux : l'ordre de chargement fait l'ordre de la liste.
- Jetons anti-cache au jour du build (1108), comme la partie 1 : `codex.js` 20261108h, `modal-backup-reminder.js` 20261108a, `assistance.js` et `parcours.css` 20261108b, `parcours-donnees.js` 20261108a. La release du Mac les réécrira.
- **Corrections du 9 nov.** `js/accompagnement.js` : `afficherAideContextuelle` reçoit son déclencheur (le « i », ou le lien « Voir aussi ») ; `placerLEtageDeLAide` pose `aide-par-dessus-les-fenetres` sur le body quand ce « i » vit dans une couche au moins aussi haute que l'aide, et `fermerAideContextuelle` la retire. `css/accompagnement.css` : l'étage monté (100010 à 100012). Sans déclencheur (ouverture par clé, `data-action`), rien ne change. `js/codex.js` : `_partageraUnCodex`, partagé par la ligne du menu et `cheminDeLaProchaineEcriture`. `js/parcours-donnees.js` et `css/parcours.css` : la place à droite de l'aperçu, propre à l'étape 3. Jetons : `codex.js` 20261108i, `accompagnement.css` 20261108d, `accompagnement.js` 20261108b, `parcours.css` 20261108c, `parcours-donnees.js` 20261108b (la sentinelle exige le jour du build, 1108).
- Stock chez les gens : rien à réparer. Le parcours écrit seulement son état dans la préférence `parcoursAssistance`, au premier lancement. La tentative du codex gagne un champ dans le stockage de session (`copiesManquantes`), perdu à la fermeture de l'onglet.

### Ce qu'il faudrait au moteur (contourné, pas refondu)

1. Savoir quel parcours joue (`ParcoursMoteur.parcours()`). Contourné : le parcours marque la bulle de son lancement (`data-parcours`) ; la garde de « Ouvrir un codex… » et la bulle au-dessus des fenêtres ne valent que pour elle.
2. Une option d'étape « au-dessus des fenêtres ». Contourné : une classe posée par le parcours. Les parcours 3 et 4, qui passent sans doute par des fenêtres (évaluer, recevoir), en auront besoin aussi.
3. Un signal de fin de parcours. Contourné : le rappel sonde `ParcoursMoteur.actif()` toutes les 500 ms tant qu'il attend.

### Ce que la relecture a ajouté (constats d'après le premier dépôt du rapport)

- La mise en garde de l'aperçu couverte par la bulle 3 à 1180 px : ajoutée à la question 8.
- À l'étape 4, la notification « Codex mis à jour » couvre quelques secondes le haut du menu, celui que la bulle dit de regarder (capture `1180-sombre-etape-4.jpg`). Passager ; je n'y touche pas.
- Le banc tenait le « i » pour vérifié par `toBeVisible`, qui passe même couvert. Corrigé : il vérifie maintenant que rien ne le couvre à 1180 px (break-test : la bulle déplacée sur le « i », ROUGE, rétablie). À 390 px, la bulle le couvre (question 8).
- Non vérifié : l'aperçu est `aria-modal` (`js/securite-export-preview.js:73`) et la bulle vit hors de lui. VoiceOver pourrait donc ignorer la bulle 3 tant que l'aperçu est ouvert. À éprouver sur l'iPad.
- La bulle ne cède la place qu'aux fenêtres de `uiDialogues` (`#overlay-ui-dialogue`). Ce sont toutes celles que l'écriture du codex ouvre (« Ton codex est prêt », « Il y est », l'échec), relu dans `js/codex.js` et `js/fichier-sortant.js`. Une fenêtre d'un autre module ouverte en pleine étape 3 passerait sous la bulle.
- Échap, à l'étape 3, quitte le parcours et laisse l'aperçu ouvert : c'est le moteur (Échap vaut « Quitter le parcours »). Sans gravité.
- Dans le banc de la partie 1, le compte des parcours affichés est comparé au registre : il ne voit plus une entrée en trop dans le registre, seulement une erreur de rendu. Le choix du chemin d'écriture (`js/codex.js:1778`) n'a pas d'essai Vitest ; le banc Playwright l'éprouve par ses cinq chemins.

### Les essais

- **Vitest**, `tests/unit/sentinelle-parcours-donnees-2026-11-09.test.js`, 20 essais. Bloc 1 : chaque texte posé se trouve tel quel dans la consigne, chaque chemin compose le texte de l'étape 3, aucun produit n'est nommé. Bloc 2 : le rappel, sur le vrai `modal-backup-reminder.js`, avec un faux moteur et des minuteries simulées. **Le test exigé par la consigne échoue avant le code** : avec `verifierEtAfficher` remis à son état d'avant, les quatre essais qui jouent un parcours sont ROUGES et « hors parcours » reste vert. Rétabli : vert. Break-test des mots : « chaque semaine » → « chaque mois », ROUGE, rétabli.
- **Corrections du 9 nov.** Playwright (Chromium), même banc : **14 essais, 14 verts** (7 d'avant, enrichis, et 7 nouveaux : trois à 1440 px, un à 1180 × 820, un à 1179 px, deux pour la ligne du menu). Break-tests, chacun rouge puis vert une fois rétabli : `placerLEtageDeLAide` sans effet → « de bout en bout (1180, sombre) » ; la classe posée dès qu'il y a un « i », sans regarder sa couche → le même essai (un « i » de la page ouvrait l'aide à 100011) ; la place à droite retirée → les trois essais à 1440 ; le seuil de 1180 retiré → « 1179 px » ; la ligne du menu en dur, dans un sens puis dans l'autre → « partage », puis « telechargement ». Vitest complet : **10 891 / 10 891** après le jeton du jour de build (la sentinelle anti-cache avait rougi sur un premier jeton daté du 9). Specs voisines sous Chromium (12 fichiers : l'aide, ses « i », l'aperçu, le codex) : 29 verts, 3 rouges, les trois mêmes rouges sur la base sans les corrections (`aide-cp-suit-la-case-1086`, `codex-1012-fichier-d-origine` (5), `lot-j0-bis-partage-apres-preparation` « réel ») : ils tiennent à Chromium.
- **Playwright (Chromium)**, `tests/integration/parcours-6-donnees-a-l-abri-2026-11-09.spec.js`, 7 essais, 7 verts, aucune pause fixe. Break-tests : sans la garde de « Ouvrir un codex… », ROUGE (une ouverture au lieu de zéro) ; la bulle laissée sous l'aperçu, ROUGE ; la bulle posée sur le « i », ROUGE. Rétablis : verts.
- **Vitest complet** : avant `d17131da`, 1 rouge sur 10 891 (le cliquet des pauses, causé par mon banc) ; après, **10 891 / 10 891** (la base en avait 10 869).
- **Specs voisines sous Chromium** (29 fichiers : codex, rappel, panneau, en-tête) : 27 rouges, 90 verts, 8 sautés. Trois venaient de mon lot (le banc de la partie 1, corrigé dans `d17131da`). Les autres ont été rejoués sur la base a328bb9f, sans mon lot : voir « Les rouges de Chromium » plus bas.

### Les rouges de Chromium

Les dix fichiers rouges hors partie 1 ont été rejoués sous Chromium sur la base a328bb9f, sans mon lot : 23 rouges, 24 verts. Ce sont les mêmes rouges qu'avec le lot, à une exception près. Ils tiennent à Chromium : la case « Ouvrir un codex » et les poignées de fichiers s'y comportent autrement que sous WebKit, et la géométrie de l'en-tête y diffère. Ils ne disent rien du lot.

L'exception : `lot-i-bis-anciens-fichiers-s-ouvrent.spec.js:222`, rouge une fois avec le lot. La clé en trop, `fsapi_persistance_migration_v1`, est écrite au premier démarrage par les préférences de sécurité, que le lot ne touche pas. Rejoué trois fois de chaque côté : 3 verts sur 3 avec le lot, 3 sur 3 sans. C'est une instabilité de minutage, pas une régression.

Dans `parcours-1-et-2`, un rouge reste sous Chromium : « panneau : … le ferment » (le bord droit du panneau, `expect(g.droite).toBe(0)`). Il était déjà rouge sur la base, avant toute écriture de ma part (premier passage de la session). Le verdict de ces essais se prend sous WebKit, sur le Mac.

### Relecture par un agent neuf

**Seconde relecture, des corrections du 9 nov.** (un agent neuf, avec les trois décisions et le diff de `9f1c624` seulement). Verdict, en une ligne : **conforme aux trois points ; aucun défaut bloquant ; un effet de bord à inscrire (Échap), un trou de preuve dans l'essai du point 1, un écart de place sur les grands écrans.** Il a rejoué le banc (13 / 13) et Vitest (10 891 / 10 891), et fait trois break-tests : deux rougissent ; le troisième (la classe posée pour tout « i ») restait vert. Ce que j'en ai fait :
- **Le trou de preuve** : comblé. L'essai ouvre maintenant l'aide par un « i » posé dans la page, et exige 10002 ; son break-test rougit (100011).
- **Échap** : inscrit plus bas (n° 4).
- **La place sur les grands écrans** : sur un écran haut avec un aperçu court (mesuré par lui à 1440 × 1400 et 2560 × 1440), le moteur essaie d'abord le dessous, et la bulle s'y pose, sous l'aperçu, sans rien couvrir. Je n'y touche pas : la preuve demandée (rien de couvert) tient, et la place à droite est celle des écrans courants (mesurée par lui : 1180 × 820, 255 px de large et 626 de haut, sans défilement ; 1194 × 834 ; 1366 × 1024 ; 1440 × 900 ; 1920 × 1200).
- **La hauteur de l'iPad** (820), que le banc ne jouait pas : un essai de plus, à 1180 × 820.
- **Le retour du focus à la fermeture de l'aide** : antérieur au lot, noté plus bas (n° 5).
- Effets de bord qu'il a éprouvés et trouvés sains : la classe du body ne reste pas collée (fermeture par ×, par le voile ; un lien « Voir aussi » garde l'étage) ; un redimensionnement de 1440 à 1000 puis 1180 rend la place d'avant, puis la place à droite ; l'aperçu annulé vide la largeur ; une fenêtre de dialogue en pleine étape 3 rend la place d'avant. Il note aussi qu'un « i » posé dans une fenêtre à 10005 (les confirmations, le partage) ouvre maintenant son aide au-dessus d'elle : c'est la même règle, et plutôt un gain.

**Première relecture (nuit du 8 au 9 nov.)** :

Un agent neuf, qui n'avait que la consigne, les règles de la nuit et le diff, a relu le lot. Il a relancé Vitest (10 891 / 10 891) et fait dix break-tests de son côté, tous rouges. Verdict, en une ligne : **conforme à la consigne ; textes mot pour mot ; le rappel qui attend la fin du parcours est prouvé par break-test ; à fusionner après le verdict WebKit et tes réponses aux questions, avec les trois constats ajoutés plus haut** (section « Ce que la relecture a ajouté »).

## À inscrire au BACKLOG

1. **(Demandé par la consigne.)** L'aide (carte Codex, `index.html:11134`) nomme Chrome, Edge, Safari et l'iPad. Le message d'espace insuffisant à l'ouverture d'un codex (`js/codex.js:838`) dit « Sur un iPad : Réglages → Général → Stockage iPad ». À soumettre à Grégoire au regard de sa règle du 8 nov. (aucun produit nommé), sans y toucher. Note : la même carte dit « Safari et l'iPad en téléchargent un nouveau », alors que l'iPad passe par la feuille de partage.
2. ~~**Le « i » de l'aperçu ouvre son aide sous l'aperçu.**~~ **Corrigé le 9 nov. (question 1) : ne pas inscrire.** L'aide est à 10002 (`css/accompagnement.css:591`), l'aperçu à 99999 (`js/securite-export-preview.js:79`). Symptôme : la bulle 2 du parcours renvoie à ce « i » (question 1). Attention au remède : l'infobulle des termes de l'aide est à 10003 (`css/accompagnement.css:812`, #1152), juste au-dessus de l'aide. Tout l'étage est à déplacer ensemble.
3. ~~**Le sous-texte « Télécharge un nouveau fichier »**~~ **Corrigé le 9 nov. (question 5) : ne pas inscrire.** (`js/codex.js:3297`) s'affiche dès que la fenêtre de choix manque, donc sur l'iPad, qui passe par la feuille de partage. Symptôme : il contredit la bulle 3 sur l'iPad (question 5).
4. **(Corrections du 9 nov.) Échap avec l'aide ouverte sur l'aperçu.** Maintenant que l'aide se voit au-dessus de l'aperçu, Échap la referme, mais referme aussi l'aperçu, ce qui annule la mise à jour : les deux écoutent la touche sur le document (`js/accompagnement.js`, l'écouteur d'Échap ; `js/securite-export-preview.js`, `surEchap`). Mesuré sous Chromium hors parcours. Pendant le parcours, c'est le moteur qui prend Échap le premier : le parcours se quitte et l'aide reste ouverte. Rien n'est perdu (il suffit de relancer la mise à jour, ou de reprendre le parcours), mais ce n'est pas le geste attendu. Antérieur aux corrections (l'aide cachée se refermait déjà avec l'aperçu). Remède probable : qu'Échap ne ferme que la fenêtre du dessus. Il touche le moteur, que le lot « La bulle sur téléphone » modifie : à voir à la fusion.
5. **(Relecture du 9 nov., antérieur au lot) Le focus ne revient pas au « i » quand l'aide se ferme.** `js/accompagnement.js`, `afficherAideContextuelle` : le déclencheur est lu après que le bouton × a pris le focus ; à la fermeture, le focus retourne donc à ce bouton caché. Dans l'aperçu, Entrée ne confirme plus « Mettre à jour » après avoir lu l'aide (il faut toucher le bouton). Aucun symptôme vécu à ma connaissance : à soumettre à la règle du 24 août avant d'inscrire.
