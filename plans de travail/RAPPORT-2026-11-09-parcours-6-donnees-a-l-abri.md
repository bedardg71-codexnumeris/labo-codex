# Rapport : le sixième parcours, « Mettre tes données à l'abri » (session E, nuit du 8 au 9 nov. 2026)

Branche `lot/parcours-6-donnees-a-l-abri`, partie de `origin/lot/parcours-1-et-2` (a328bb9f). Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-6-donnees-a-l-abri.md`, commitée avec le lot. Session cloud : **WebKit absent, tout ce qui suit a été joué sous Chromium.** Rien au changelog, pas de release, rien sur `main`.

## En tête

### Ce qui est fait (ce que tu verras)

- Dans le panneau « Assistance », un parcours de plus : « Mettre tes données à l'abri », avec sa ligne. Sur cette branche, il est le troisième de la liste (les parcours 3 à 5 n'y sont pas) ; le compteur du menu dit donc « 1 sur 3 ». Il dira « sur 6 » une fois les branches fusionnées, et plus avec les parcours 7 à 9.
- Sans trimestre réel (la démo ne compte pas), « Commencer » ne lance rien : sous le bouton, le panneau dit « Commence par « Mettre ta classe en place » : ton codex gardera ce que tu y auras mis. »
- Sans codex, le haut du menu Codex dit maintenant « Pas encore de codex : « Mettre à jour le codex » en crée un avec tes données. »
- Les quatre bulles, mot pour mot. Étape 1 : le contour sur « Codex » ; elle avance quand le menu s'ouvre. Étape 2 : le menu ouvert, le contour sur « Mettre à jour le codex » ; elle avance quand l'aperçu s'ouvre. Étape 3 : la bulle se pose **au-dessus de l'aperçu**, près de « Mettre à jour », sans couvrir ni ce bouton ni « Annuler », avec la phrase du chemin que prendra l'écriture ; elle avance quand le codex est écrit. Étape 4 : le menu rouvert, le contour sur « Ouvrir un codex… », et « Terminer ».
- Pendant ce parcours, « Ouvrir un codex… » ne fait rien, même éclairé à l'étape 4 : aucun codex ne peut remplacer ton espace en plein parcours. Hors parcours, il répond comme avant.
- Le rappel « Mets ton codex à jour » ne s'ouvre plus pendant **aucun** parcours. S'il était dû, il attend la fin du parcours, puis 1,5 s, comme à l'ouverture de l'application. La mise à jour faite dans le parcours le repousse de 14 jours, comme d'habitude.
- Captures Chromium dans `plans de travail/captures-2026-11-09-parcours-6-chromium/` : les quatre étapes à 1180 px en sombre et en clair, l'étape 3 pour chaque chemin (fenêtre de choix, partage, téléchargement et « Il y est », fichier tenu, copies manquantes), les étapes 1 et 3 à 390 px, le panneau avec la phrase du refus.

### Ce qui attend Grégoire (une question par ligne, ma recommandation entre parenthèses)

1. Le « i » de l'aperçu ouvre « Ce que contient le fichier » **sous** l'aperçu : l'aide reste cachée tant que l'aperçu est ouvert. La bulle 2 dit « son « i » te dit ce que contient le fichier ». Le défaut est antérieur au lot. Je n'ai pas retouché la phrase. On corrige l'empilement avant de fusionner le parcours ? (Oui ; inscrit plus bas.)
2. Quand des fichiers de productions manquent, l'application demande toujours où écrire et ne garde pas le fichier. La phrase de la fenêtre de choix y perd sa seconde phrase (« Jusqu'à ce que tu recharges la page… »), qui serait fausse. Il reste « Une fenêtre te demande où l'enregistrer : choisis ta clé ou ton dossier synchronisé. » On garde ? (Oui : ce sont tes mots, une phrase en moins.)
3. À l'étape 4, « Ouvrir un codex… » est éclairé mais ne répond pas. On garde ? (Oui. L'autre choix serait de le montrer sans le laisser toucher, sous le voile ; il serait alors terne.)
4. J'ai repris deux bouts de « Découvrir », que ta consigne ne nomme pas : le lien « Quitter le parcours » sur les bulles 1 à 3, et à la sortie le message « Tu pourras reprendre ce parcours depuis « Assistance », dans le menu. » On garde ? (Oui : mêmes gestes, mêmes mots.)
5. Sur l'iPad, sous « Mettre à jour le codex », le menu dit « Télécharge un nouveau fichier ». Or l'iPad passe par la feuille de partage, et la bulle 3 dira « Ton appareil te propose de partager le fichier ». Tu veux un autre sous-texte quand c'est le partage ? (Oui. Je propose « Ouvre la feuille de partage », à corriger. Inscrit plus bas.)
6. La phrase du refus s'affiche au toucher de « Commencer », pas d'avance. C'est ma lecture de « le bouton ne lance pas le parcours ; le panneau dit… ». Tu la veux visible d'emblée ? (Non : au toucher, comme écrit.)
7. Dans les bulles, la consigne de geste reste dans le paragraphe (« Touche « Codex », en haut de l'écran. »). Elle n'est pas détachée en ligne orange comme dans « Découvrir », parce que ta consigne donne un seul texte par étape. Tu la veux détachée ? (Non pour les étapes 2 à 4, où les gestes sont mêlés au texte. Pour l'étape 1, à ton goût : capture `1180-sombre-etape-1.jpg`.)
8. À l'étape 3, la bulle couvre la liste des fichiers de l'aperçu. À 390 px, elle couvre aussi son titre et le « i ». À ces largeurs, aucune place ne permet de l'éviter. Ça te va ? (Oui : les deux boutons restent libres, et la bulle doit être lue avant le toucher.)

### Ce que je n'ai pas pu vérifier ici

- **WebKit** : le banc et les captures sont à refaire sur le Mac (`npx playwright test parcours-6-donnees-a-l-abri`, et `CAPTURES_PARCOURS=<dossier>` pour les captures).
- **La vraie feuille de partage de l'iPad**, et la vraie fenêtre de choix de Chrome ou d'Edge. Le banc les remplace par des fausses. À mesurer : sur l'iPad, la bulle 3 est-elle lue avant que la feuille s'ouvre, et la feuille s'ouvre-t-elle bien après le toucher sur « Mettre à jour » ?
- **Safari sur le Mac** : ouvre-t-il la feuille de partage (`navigator.canShare` avec un fichier) ou télécharge-t-il ? Le code prend le partage dès que le navigateur l'offre (`js/codex.js:1778`). La phrase dit « ton appareil » pour ne pas le supposer. À mesurer sur le Mac.
- **Sur tes données** : un gros codex dont la préparation dépasse 5 s. La fenêtre « Ton codex est prêt » s'ouvre alors en pleine étape 3. Le code la laisse passer au-dessus de la bulle, et le banc l'a vu pour « Il y est », mais pas avec un vrai délai. À mesurer sur le Mac.
- Le parcours n'a pas été joué en démo ouverte. Hors démo, il marche ; avec la démo ouverte et un trimestre réel, le codex n'écrit que les vraies données (`_sansLeDemo`).

## Le détail

### Les commits

- `b587528f` : le parcours, le panneau, le menu Codex, le rappel, la CSS ; la sentinelle Vitest (20 essais).
- `253eb154` : le banc Playwright (7 essais) et les captures.
- `d17131da` : le banc sans pause fixe (le cliquet des pauses était rouge, 620 pour 618) ; le banc de la partie 1 lit le nombre de parcours sur le registre (voir « Ce que le lot change hors de ses fichiers »).
- Ce rapport.

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
- Stock chez les gens : rien à réparer. Le parcours écrit seulement son état dans la préférence `parcoursAssistance`, au premier lancement. La tentative du codex gagne un champ dans le stockage de session (`copiesManquantes`), perdu à la fermeture de l'onglet.

### Ce qu'il faudrait au moteur (contourné, pas refondu)

1. Savoir quel parcours joue (`ParcoursMoteur.parcours()`). Contourné : le parcours marque la bulle de son lancement (`data-parcours`) ; la garde de « Ouvrir un codex… » et la bulle au-dessus des fenêtres ne valent que pour elle.
2. Une option d'étape « au-dessus des fenêtres ». Contourné : une classe posée par le parcours. Les parcours 3 et 4, qui passent sans doute par des fenêtres (évaluer, recevoir), en auront besoin aussi.
3. Un signal de fin de parcours. Contourné : le rappel sonde `ParcoursMoteur.actif()` toutes les 500 ms tant qu'il attend.

### Les essais

- **Vitest**, `tests/unit/sentinelle-parcours-donnees-2026-11-09.test.js`, 20 essais. Bloc 1 : chaque texte posé se trouve tel quel dans la consigne, chaque chemin compose le texte de l'étape 3, aucun produit n'est nommé. Bloc 2 : le rappel, sur le vrai `modal-backup-reminder.js`, avec un faux moteur et des minuteries simulées. **Le test exigé par la consigne échoue avant le code** : avec `verifierEtAfficher` remis à son état d'avant, les quatre essais qui jouent un parcours sont ROUGES et « hors parcours » reste vert. Rétabli : vert. Break-test des mots : « chaque semaine » → « chaque mois », ROUGE, rétabli.
- **Playwright (Chromium)**, `tests/integration/parcours-6-donnees-a-l-abri-2026-11-09.spec.js`, 7 essais, 7 verts, aucune pause fixe. Break-tests : sans la garde de « Ouvrir un codex… », ROUGE (une ouverture au lieu de zéro) ; la bulle laissée sous l'aperçu, ROUGE. Rétablis : verts.
- **Vitest complet** : avant `d17131da`, 1 rouge sur 10 891 (le cliquet des pauses, causé par mon banc) ; après, **10 891 / 10 891** (la base en avait 10 869).
- **Specs voisines sous Chromium** (29 fichiers : codex, rappel, panneau, en-tête) : 27 rouges, 90 verts, 8 sautés. Trois venaient de mon lot (le banc de la partie 1, corrigé dans `d17131da`). Les autres ont été rejoués sur la base a328bb9f, sans mon lot : voir « Les rouges de Chromium » plus bas.

### Les rouges de Chromium

Les dix fichiers rouges hors partie 1 ont été rejoués sous Chromium sur la base a328bb9f, sans mon lot : 23 rouges, 24 verts. Ce sont les mêmes rouges qu'avec le lot, à une exception près. Ils tiennent à Chromium : la case « Ouvrir un codex » et les poignées de fichiers s'y comportent autrement que sous WebKit, et la géométrie de l'en-tête y diffère. Ils ne disent rien du lot.

L'exception : `lot-i-bis-anciens-fichiers-s-ouvrent.spec.js:222`, rouge une fois avec le lot. La clé en trop, `fsapi_persistance_migration_v1`, est écrite au premier démarrage par les préférences de sécurité, que le lot ne touche pas. Rejoué trois fois de chaque côté : 3 verts sur 3 avec le lot, 3 sur 3 sans. C'est une instabilité de minutage, pas une régression.

Dans `parcours-1-et-2`, un rouge reste sous Chromium : « panneau : … le ferment » (le bord droit du panneau, `expect(g.droite).toBe(0)`). Il était déjà rouge sur la base, avant toute écriture de ma part (premier passage de la session). Le verdict de ces essais se prend sous WebKit, sur le Mac.

### Relecture par un agent neuf

⏳ En cours au moment de ce commit (l'agent a été interrompu par une limite d'usage, puis relancé) : son verdict sera ajouté ici.

## À inscrire au BACKLOG

1. **(Demandé par la consigne.)** L'aide (carte Codex, `index.html:11134`) nomme Chrome, Edge, Safari et l'iPad. Le message d'espace insuffisant à l'ouverture d'un codex (`js/codex.js:838`) dit « Sur un iPad : Réglages → Général → Stockage iPad ». À soumettre à Grégoire au regard de sa règle du 8 nov. (aucun produit nommé), sans y toucher. Note : la même carte dit « Safari et l'iPad en téléchargent un nouveau », alors que l'iPad passe par la feuille de partage.
2. **Le « i » de l'aperçu ouvre son aide sous l'aperçu.** L'aide est à 10002 (`css/accompagnement.css:591`), l'aperçu à 99999 (`js/securite-export-preview.js:79`). Symptôme : la bulle 2 du parcours renvoie à ce « i » (question 1). Attention au remède : l'infobulle des termes de l'aide est à 10003 (`css/accompagnement.css:812`, #1152), juste au-dessus de l'aide. Tout l'étage est à déplacer ensemble.
3. **Le sous-texte « Télécharge un nouveau fichier »** (`js/codex.js:3297`) s'affiche dès que la fenêtre de choix manque, donc sur l'iPad, qui passe par la feuille de partage. Symptôme : il contredit la bulle 3 sur l'iPad (question 5).
